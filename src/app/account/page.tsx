import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import DeleteAccountForm from "@/components/DeleteAccountForm";

export const metadata: Metadata = { title: "Account" };

const DATE = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage() {
  if (!dbConfigured) redirect("/dashboard");
  const session = await auth();
  if (session?.mfaPending) redirect("/signin/2fa");
  if (!session?.user?.id) redirect("/signin");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, role: true, premium: true, createdAt: true, passwordHash: true, totpEnabledAt: true, oauthAccounts: { select: { provider: true } } },
  });
  if (!user) redirect("/signin");
  const proof = user.passwordHash ? "password" : user.totpEnabledAt ? "code" : "email";
  const card = "mt-6 rounded-lg bg-card p-6 sm:p-8";

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">Account</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight">{user.name || user.email}</h1>

      <section className={card}>
        <h2 className="text-2xl font-bold">Profile</h2>
        <dl className="mt-4 divide-y divide-border" style={{ fontVariantNumeric: "tabular-nums" }}>
          {[
            ["Email", user.email],
            ["Plan", user.premium ? "Full plan" : "Free"],
            ["Role", user.role === "ADMIN" ? "Admin" : user.role === "REVIEWER" ? "Evaluator" : "Learner"],
            ["Signs in with", [user.passwordHash && "password", ...user.oauthAccounts.map((o) => o.provider)].filter(Boolean).join(", ") || "a social account"],
            ["Member since", DATE.format(user.createdAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-bold">Security</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Two-step sign-in is {user.totpEnabledAt ? "on" : "off"}.{" "}
          <Link href="/account/security" className="font-semibold text-primary hover:text-accent">
            {user.totpEnabledAt ? "Manage Two-Step Sign-In" : "Set Up Two-Step Sign-In"}
          </Link>
        </p>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-bold">Your data</h2>
        <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
          Download everything SkillBridge holds about you as one file: profile, enrollments and progress, portfolios with narratives and evidence records, payments, emails sent, and your account&apos;s activity log. Evidence files themselves download from each portfolio.
        </p>
        <a href="/api/account/export" className="mt-4 inline-block rounded-md bg-secondary px-5 py-2.5 font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px">
          Download My Data
        </a>
      </section>

      <section className={card}>
        <h2 className="text-2xl font-bold">Close your account</h2>
        <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
          This deletes your portfolios, evidence files, lesson progress and sign-in details, and ends every session. Decided evaluations keep only their decision record, with your name removed, and payment records are kept as the law requires. It cannot be undone.
        </p>
        {user.role === "ADMIN" ? (
          <p className="mt-4 text-sm font-semibold text-muted-foreground">An admin account cannot be closed while it holds the role. Have another admin remove it first.</p>
        ) : (
          <DeleteAccountForm proof={proof} />
        )}
      </section>
    </div>
  );
}
