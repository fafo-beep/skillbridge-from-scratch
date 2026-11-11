"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { consumeToken, issueToken } from "@/lib/tokens";
import { clientIp, rateLimit, retryMessage } from "@/lib/rate-limit";

// Server actions. Every one re-checks the session server-side; nothing
// trusts the client. Privileged writes land in AuditLog.

async function audit(userId: string | null, action: string, target: string, detail = "") {
  try {
    await db.auditLog.create({ data: { userId, action, target, detail } });
  } catch {
    // auditing must never take the request down
  }
}

export type FormState = { error?: string; email?: string; name?: string; firstName?: string; lastName?: string; notice?: string };

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const { headers } = await import("next/headers");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

async function sendVerification(userId: string, email: string, firstName: string | null) {
  const token = await issueToken(userId, "verify");
  const origin = await siteOrigin();
  await sendEmail(
    email,
    "Confirm your SkillBridge email",
    `Hi ${firstName ?? "there"},\n\nConfirm your email to submit portfolios and unlock everything on SkillBridge:\n\n${origin}/verify/${token}\n\nThe link works once and expires in 24 hours. If you did not create an account, ignore this email.`
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 100);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 100);
  const name = `${firstName} ${lastName}`.trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const echo = { email, firstName, lastName };

  const ip = await clientIp();
  const wait = await rateLimit("register", ip);
  if (wait) return { error: retryMessage(wait), ...echo };
  if (!firstName) return { error: "Please enter your first name.", ...echo };
  if (!lastName) return { error: "Please enter your last name.", ...echo };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", ...echo };
  if (password.length < 10)
    return { error: "Use a password of at least 10 characters.", ...echo };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists. Sign in instead.", ...echo };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, firstName, lastName, email, passwordHash } });
  await audit(user.id, "user.register", user.id);
  await sendVerification(user.id, email, firstName);

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const wait = await rateLimit("login", `${email}|${await clientIp()}`);
  if (wait) return { error: retryMessage(wait), email };
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    // signIn throws a redirect on success; rethrow those
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Email or password is incorrect.", email };
  }
  return {};
}

// Email-first step: tells the modal whether this email already has a
// password account, a social-only account, or nothing. This discloses
// account existence (as Coursera/Google do) in exchange for a simpler
// flow; rate limiting at the edge is the standing mitigation.
export type CheckState = { error?: string; email?: string; exists?: boolean; social?: boolean };

export async function checkEmail(_prev: CheckState, formData: FormData): Promise<CheckState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const wait = await rateLimit("checkEmail", await clientIp());
  if (wait) return { error: retryMessage(wait) };
  const user = await db.user.findUnique({ where: { email }, select: { passwordHash: true } });
  return { email, exists: !!user?.passwordHash, social: !!user && !user.passwordHash };
}

const SOCIAL = new Set(["google", "facebook", "apple"]);

export async function socialSignIn(provider: string) {
  if (!SOCIAL.has(provider)) redirect("/signin");
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/signin");
  return id;
}

export async function enroll(courseSlug: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  const course = await db.course.findUnique({ where: { slug: courseSlug } });
  if (!course) redirect("/catalog");
  await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  });
  await audit(userId, "enrollment.create", course.slug);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function startPortfolio(courseSlug: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  const course = await db.course.findUnique({ where: { slug: courseSlug } });
  if (!course || !course.plaEligible) redirect("/catalog");
  const existing = await db.portfolio.findFirst({
    where: { userId, courseId: course.id },
  });
  if (!existing) {
    await db.portfolio.create({ data: { userId, courseId: course.id } });
    await audit(userId, "portfolio.create", course.slug);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleLesson(lessonId: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  // The enrollment must belong to the signed-in user: authorization by query.
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) return;
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
  });
  if (!enrollment) return;

  const done = await db.progress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
  });
  if (done) {
    await db.progress.delete({ where: { id: done.id } });
  } else {
    await db.progress.create({ data: { enrollmentId: enrollment.id, lessonId } });
  }
  revalidatePath("/dashboard");
}

// ── Portfolio builder (owner-only; ownership enforced by query) ──────────

async function ownedPortfolio(portfolioId: string, userId: string) {
  return db.portfolio.findFirst({
    where: { id: portfolioId, userId },
    include: { course: { include: { outcomes: true } } },
  });
}

const EDITABLE = new Set(["DRAFT", "REVISIONS_REQUESTED"]);

// Builder writes run in serializable transactions with the status check
// INSIDE, so a save racing a submit cannot alter content the evaluator
// will read (the later transaction aborts instead).
async function editableTx<T>(fn: (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => Promise<T>): Promise<T | undefined> {
  try {
    return await db.$transaction(fn, { isolationLevel: "Serializable" });
  } catch {
    return undefined; // serialization conflict or validation stop: no write
  }
}

export async function saveOutcomeResponse(
  portfolioId: string,
  outcomeId: string,
  formData: FormData
) {
  const userId = await requireUserId();
  const narrative = String(formData.get("narrative") ?? "").slice(0, 20000);
  await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    if (!portfolio.course.outcomes.some((o) => o.id === outcomeId)) throw new Error("bad outcome");
    await tx.outcomeResponse.upsert({
      where: { portfolioId_outcomeId: { portfolioId, outcomeId } },
      update: { narrative },
      create: { portfolioId, outcomeId, narrative },
    });
  });
  revalidatePath(`/portfolio/${portfolioId}`);
}

export async function addEvidence(portfolioId: string, outcomeId: string, formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim().slice(0, 300);
  const kind = String(formData.get("kind") ?? "").trim().slice(0, 100);
  if (!title) return;
  const done = await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    if (!portfolio.course.outcomes.some((o) => o.id === outcomeId)) throw new Error("bad outcome");
    await tx.evidence.create({
      data: { portfolioId, outcomeId, title, kind: kind || "Work sample" },
    });
    return true;
  });
  if (done) await audit(userId, "evidence.add", portfolioId, title);
  revalidatePath(`/portfolio/${portfolioId}`);
}

export async function removeEvidence(evidenceId: string) {
  const userId = await requireUserId();
  const portfolioId = await editableTx(async (tx) => {
    const evidence = await tx.evidence.findUnique({
      where: { id: evidenceId },
      include: { portfolio: true },
    });
    if (!evidence || evidence.portfolio.userId !== userId) throw new Error("not owner");
    if (!EDITABLE.has(evidence.portfolio.status)) throw new Error("not editable");
    await tx.evidence.delete({ where: { id: evidenceId } });
    return evidence.portfolioId;
  });
  if (portfolioId) revalidatePath(`/portfolio/${portfolioId}`);
}

async function requireVerified(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } });
  if (!u?.emailVerifiedAt) redirect("/dashboard?unverified=1");
}

export async function submitPortfolio(portfolioId: string) {
  const userId = await requireUserId();
  await requireVerified(userId);
  const done = await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    const responses = await tx.outcomeResponse.findMany({ where: { portfolioId } });
    const answered = new Set(
      responses.filter((r) => r.narrative.trim().length >= 50).map((r) => r.outcomeId)
    );
    if (portfolio.course.outcomes.some((o) => !answered.has(o.id))) throw new Error("incomplete");
    // Free tier: one portfolio evaluated. Further submissions need premium.
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.premium) {
      const others = await tx.portfolio.count({
        where: { userId, id: { not: portfolioId }, status: { not: "DRAFT" } },
      });
      if (others >= 1) throw new Error("premium-required");
    }
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: {
        status: "SUBMITTED",
        // A resubmission starts a fresh evaluation: previous decision cleared.
        score: null,
        decisionNote: "",
        evaluatorId: null,
        decidedAt: null,
      },
    });
    return portfolio.course.slug;
  });
  if (done) await audit(userId, "portfolio.submit", portfolioId, done);
  revalidatePath(`/portfolio/${portfolioId}`);
  revalidatePath("/dashboard");
  if (!done && !(await db.user.findUnique({ where: { id: userId } }))?.premium) {
    const others = await db.portfolio.count({
      where: { userId, id: { not: portfolioId }, status: { not: "DRAFT" } },
    });
    if (others >= 1) redirect("/upgrade?reason=limit");
  }
}

// ── Reviewer flow (role enforced server-side) ────────────────────────────

async function requireReviewer(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "REVIEWER" && user.role !== "ADMIN")) redirect("/dashboard");
  return userId;
}

export async function startReview(portfolioId: string) {
  const reviewerId = await requireReviewer();
  const updated = await db.portfolio.updateMany({
    // Separation of duties: never your own portfolio.
    where: { id: portfolioId, status: "SUBMITTED", userId: { not: reviewerId } },
    data: { status: "UNDER_REVIEW", evaluatorId: reviewerId },
  });
  revalidatePath("/review");
  if (updated.count === 0) redirect("/review"); // already claimed, or not claimable
  await audit(reviewerId, "review.start", portfolioId);
  redirect(`/portfolio/${portfolioId}`);
}

export async function decidePortfolio(portfolioId: string, formData: FormData) {
  const reviewerId = await requireReviewer();
  const decision = String(formData.get("decision") ?? "");
  const score = Math.min(5, Math.max(1, Math.round(Number(formData.get("score") ?? 0))));
  const note = String(formData.get("note") ?? "").trim().slice(0, 5000);
  const STATUS: Record<string, "APPROVED" | "DENIED" | "REVISIONS_REQUESTED"> = {
    approve: "APPROVED",
    deny: "DENIED",
    revisions: "REVISIONS_REQUESTED",
  };
  const status = STATUS[decision];
  if (!status || !Number.isInteger(score) || !note) return;
  const updated = await db.portfolio.updateMany({
    where: { id: portfolioId, status: "UNDER_REVIEW", evaluatorId: reviewerId, userId: { not: reviewerId } },
    data: { status, score, decisionNote: note, decidedAt: new Date() },
  });
  if (updated.count > 0) {
    await audit(reviewerId, "review.decide", portfolioId, `${status} score=${score}`);
  }
  revalidatePath(`/portfolio/${portfolioId}`);
  revalidatePath("/review");
  redirect("/review");
}

// ── Payments ─────────────────────────────────────────────────────────────
// Checkout creates a pending Payment row and sends the user to Stripe.
// Premium is granted only by the webhook (src/app/api/stripe/webhook).

export async function startCheckout() {
  const userId = await requireUserId();
  const { stripe, stripeConfigured, PREMIUM_PRICE_USD } = await import("@/lib/stripe");
  if (!stripeConfigured) redirect("/upgrade");
  await requireVerified(userId);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/signin");
  if (user.premium) redirect("/dashboard");

  const { headers } = await import("next/headers");
  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;

  const priceId = process.env.STRIPE_PRICE_ID;
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: userId,
    metadata: { userId },
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: PREMIUM_PRICE_USD * 100,
              product_data: {
                name: "SkillBridge full portfolio",
                description: "Unlimited credit portfolios and faculty evaluations. One payment, nothing recurring.",
              },
            },
          },
    ],
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/upgrade`,
  });

  await db.payment.upsert({
    where: { stripeSessionId: session.id },
    update: {},
    create: { userId, stripeSessionId: session.id, amountUSD: PREMIUM_PRICE_USD },
  });
  await audit(userId, "payment.checkout_started", session.id);
  redirect(session.url ?? "/upgrade");
}

// ── Roles, invitations, admin ────────────────────────────────────────────
// Reviewer and admin accounts exist only by invitation from an admin.

async function requireAdmin(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");
  return userId;
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type InviteState = { error?: string; link?: string; email?: string };

export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const adminId = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "REVIEWER") === "ADMIN" ? "ADMIN" : "REVIEWER";
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const token = randomToken();
  await db.invite.create({
    data: {
      token,
      email,
      role,
      createdBy: adminId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await audit(adminId, "invite.create", email, role);
  const { headers } = await import("next/headers");
  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  revalidatePath("/admin");
  return { link: `${origin}/invite/${token}`, email };
}

export async function revokeInvite(inviteId: string) {
  const adminId = await requireAdmin();
  const invite = await db.invite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.acceptedAt) return;
  await db.invite.delete({ where: { id: inviteId } });
  await audit(adminId, "invite.revoke", invite.email);
  revalidatePath("/admin");
}

export async function acceptInvite(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "This invitation is no longer valid. Ask the admin for a new one." };
  }
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 100);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 100);
  const name = `${firstName} ${lastName}`.trim();
  const password = String(formData.get("password") ?? "");
  const echo = { firstName, lastName };
  const ip = await clientIp();
  const wait = await rateLimit("register", ip);
  if (wait) return { error: retryMessage(wait), ...echo };
  if (!firstName) return { error: "Please enter your first name.", ...echo };
  if (!lastName) return { error: "Please enter your last name.", ...echo };
  if (password.length < 10) return { error: "Use a password of at least 10 characters.", ...echo };

  const existing = await db.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return {
      error: "An account with the invited email already exists. Sign in with it, then open this link again.",
      ...echo,
    };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { name, firstName, lastName, email: invite.email, passwordHash, role: invite.role, emailVerifiedAt: new Date() },
    });
    await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    return u;
  });
  await audit(user.id, "invite.accept", invite.email, invite.role);
  await signIn("credentials", { email: invite.email, password, redirectTo: "/dashboard" });
  return {};
}

// A signed-in user whose email matches the invite is promoted in place.
export async function acceptInviteSignedIn(token: string) {
  const userId = await requireUserId();
  const invite = await db.invite.findUnique({ where: { token } });
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!invite || !user || invite.acceptedAt || invite.expiresAt < new Date()) redirect("/dashboard");
  if (user.email !== invite.email) redirect("/dashboard");
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { role: invite.role } }),
    db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);
  await audit(userId, "invite.accept", invite.email, invite.role);
  redirect("/dashboard");
}


// ── Email verification and password reset ────────────────────────────────

export async function resendVerification() {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.emailVerifiedAt) redirect("/dashboard");
  const wait = await rateLimit("verifyResend", userId);
  if (wait) redirect("/dashboard?unverified=1&wait=1");
  await sendVerification(user.id, user.email, user.firstName);
  redirect("/dashboard?unverified=1&sent=1");
}

export async function confirmVerification(token: string) {
  if (!dbConfigured) redirect("/");
  const userId = await consumeToken(token, "verify");
  if (!userId) redirect("/verify/invalid");
  await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  await audit(userId, "user.email_verified", userId);
  redirect("/dashboard?verified=1");
}

// Always answers the same way, so it cannot be used to probe accounts.
export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email };
  const ip = await clientIp();
  const wait = (await rateLimit("reset", email)) ?? (await rateLimit("reset", ip));
  if (wait) return { error: retryMessage(wait), email };
  const user = await db.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = await issueToken(user.id, "reset");
    const origin = await siteOrigin();
    await sendEmail(
      email,
      "Reset your SkillBridge password",
      `Hi ${user.firstName ?? "there"},\n\nSet a new password here:\n\n${origin}/reset/${token}\n\nThe link works once and expires in 1 hour. If you did not ask for this, you can ignore it; your password stays the same.`
    );
    await audit(user.id, "user.reset_requested", email);
  } else if (user) {
    await sendEmail(
      email,
      "Your SkillBridge sign-in",
      `Hi ${user.firstName ?? "there"},\n\nThis account signs in with a social provider (Google, Facebook or Apple), so it has no password to reset. Use the provider's button on the sign-in page.`
    );
  }
  return { notice: "If an account exists for that email, a reset link is on its way. Check your inbox." };
}

export async function resetPassword(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) return { error: "Use a password of at least 10 characters." };
  const userId = await consumeToken(token, "reset");
  if (!userId) return { error: "This reset link is no longer valid. Request a new one." };
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.update({ where: { id: userId }, data: { passwordHash, emailVerifiedAt: new Date() } });
  await audit(userId, "user.password_reset", userId);
  redirect("/signin?reset=1");
}
