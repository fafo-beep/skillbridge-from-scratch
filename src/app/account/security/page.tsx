import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { Disable, Enroll } from "@/components/TwoStepSetup";

export const metadata: Metadata = { title: "Security" };

const DATE = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  if (!dbConfigured) redirect("/dashboard");
  const { required } = await searchParams;
  const session = await auth();
  if (session?.mfaPending) redirect("/signin/2fa");
  if (!session?.user?.id) redirect("/signin");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, totpEnabledAt: true, email: true, recoveryCodes: { where: { usedAt: null }, select: { id: true } } },
  });
  if (!user) redirect("/signin");
  const staff = user.role !== "LEARNER";

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">
        <Link href="/account" className="text-primary hover:text-accent">Account</Link>
      </p>
      <h1 className="mt-1 text-4xl font-bold leading-tight">Security</h1>
      {required && !user.totpEnabledAt && (
        <p role="status" className="mt-6 rounded-md bg-secondary px-5 py-4 font-semibold text-secondary-foreground">
          Evaluators and admins decide who gets credit, so their accounts need two-step sign-in. Set it up below to continue.
        </p>
      )}

      <section className="mt-8 rounded-lg bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Two-step sign-in</h2>
        <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
          After your password, you enter a six-digit code from an authenticator app on your phone. A stolen password alone then opens nothing.
          {staff && " It is required for evaluators and admins."}
        </p>
        <div className="mt-6">
          {user.totpEnabledAt ? (
            <>
              <p className="font-bold text-success" style={{ fontVariantNumeric: "tabular-nums" }}>
                On since {DATE.format(user.totpEnabledAt)} · {user.recoveryCodes.length} recovery codes unused
              </p>
              {staff ? (
                <p className="mt-2 text-sm text-muted-foreground">Required for your role, so it cannot be turned off here.</p>
              ) : (
                <Disable />
              )}
            </>
          ) : (
            <Enroll />
          )}
        </div>
      </section>

      <section className="mt-6 rounded-lg bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Signed in as</h2>
        <p className="mt-2 font-semibold">{user.email}</p>
        <p className="mt-1 text-sm text-muted-foreground">To change your password, sign out and use Forgot Your Password on the sign-in page.</p>
      </section>
    </div>
  );
}
