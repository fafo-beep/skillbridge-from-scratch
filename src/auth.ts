import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { db, dbConfigured } from "@/lib/db";

// Auth.js v5. Email+password always; Google/Facebook/Apple appear
// automatically when their AUTH_<PROVIDER>_ID/SECRET env vars are set.
//
// Linking model (reviewed adversarially; see commit message):
// - A social identity is keyed by (provider, providerAccountId) in
//   OAuthAccount — never by bare email.
// - A social identity may attach to an EXISTING user only when the
//   provider asserts the email is verified. Facebook has no verified-email
//   contract, so a Facebook identity never auto-links to an existing
//   account; it may only create or re-use its own.
// - session.user.id always comes from our own user record.

export const oauthProviders = [
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && "google",
  process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET && "facebook",
  process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET && "apple",
].filter(Boolean) as Array<"google" | "facebook" | "apple">;

function emailVerifiedByProvider(provider: string, profile: unknown): boolean {
  const p = (profile ?? {}) as Record<string, unknown>;
  if (provider === "google") return p.email_verified === true;
  // Apple sends email_verified as boolean true or the string "true".
  if (provider === "apple") return p.email_verified === true || p.email_verified === "true";
  // Facebook offers no verified-email contract: never treat as verified.
  return false;
}

const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (!dbConfigured) return null;
      const email = String(credentials?.email ?? "").trim().toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const user = await db.user.findUnique({ where: { email } });
      // A social-only account has no password; it must sign in via its provider.
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name };
    },
  }),
  ...(oauthProviders.includes("google") ? [Google] : []),
  ...(oauthProviders.includes("facebook") ? [Facebook] : []),
  ...(oauthProviders.includes("apple") ? [Apple] : []),
];

// Resolves a social identity to our user id, creating records as allowed.
// Returns null when sign-in must be refused.
async function resolveOAuthUser(opts: {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}): Promise<string | null> {
  const { provider, providerAccountId, email, name, emailVerified } = opts;
  if (!providerAccountId) return null;

  // 1. Identity already linked: that user, regardless of current email.
  const linked = await db.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    select: { userId: true },
  });
  if (linked) return linked.userId;

  if (!email) return null;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // 2. Attaching to an existing account requires a provider-verified email.
    if (!emailVerified) return null;
    // The provider just proved mailbox ownership. Anything on this account
    // that never proved it loses now, because it could belong to a squatter
    // who claimed the address first: the unverified password is cleared and
    // links made without a verified email are severed. All audited.
    const squatterLinks = await db.oAuthAccount.deleteMany({
      where: { userId: existing.id, emailVerified: false },
    });
    if (squatterLinks.count > 0) {
      await db.auditLog.create({
        data: {
          userId: existing.id,
          action: "auth.unverified_links_severed",
          target: provider,
          detail: `${squatterLinks.count} link(s) made without email proof removed`,
        },
      });
    }
    if (existing.passwordHash) {
      await db.user.update({
        where: { id: existing.id },
        data: { passwordHash: null, sessionVersion: { increment: 1 } },
      });
      await db.auditLog.create({
        data: {
          userId: existing.id,
          action: "auth.password_cleared_on_verified_social_link",
          target: provider,
          detail: "password predates email-ownership proof",
        },
      });
    }
    await db.oAuthAccount.create({
      data: { provider, providerAccountId, userId: existing.id, emailVerified: true },
    });
    if (!existing.emailVerifiedAt) {
      await db.user.update({ where: { id: existing.id }, data: { emailVerifiedAt: new Date() } });
    }
    await db.auditLog.create({
      data: { userId: existing.id, action: "auth.social_link", target: provider },
    });
    return existing.id;
  }

  // 3. Fresh sign-up through the provider.
  const display = name || email.split("@")[0];
  const [firstName, ...rest] = display.split(" ");
  const created = await db.user.create({
    data: {
      email,
      name: display,
      firstName: firstName || null,
      lastName: rest.join(" ") || null,
      passwordHash: null,
      emailVerifiedAt: emailVerified ? new Date() : null,
      oauthAccounts: { create: { provider, providerAccountId, emailVerified } },
    },
  });
  return created.id;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials") return true;
      if (!dbConfigured) return false;
      const uid = await resolveOAuthUser({
        provider: account.provider,
        providerAccountId: String(account.providerAccountId ?? ""),
        email: (user?.email ?? "").trim().toLowerCase(),
        name: (user?.name ?? "").trim().slice(0, 200),
        emailVerified: emailVerifiedByProvider(account.provider, profile),
      });
      return uid !== null;
    },
    async jwt({ token, user, account }) {
      if (account && account.provider !== "credentials") {
        // signIn above guaranteed the link exists; map identity -> our id.
        const linked = await db.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: String(account.providerAccountId ?? ""),
            },
          },
          select: { userId: true },
        });
        if (linked) token.uid = linked.userId;
      } else if (user?.id) {
        token.uid = user.id;
      }
      // Pin the token to the account's current session version. A reset
      // (or squatter cleanup) bumps the version and every older token dies.
      if (token.uid) {
        const current = await db.user.findUnique({
          where: { id: token.uid as string },
          select: { sessionVersion: true },
        });
        if (!current) return null;
        if (token.sv === undefined) token.sv = current.sessionVersion;
        else if (token.sv !== current.sessionVersion) return null;
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
});
