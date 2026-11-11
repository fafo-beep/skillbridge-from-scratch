import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { logout, revokeInvite } from "@/lib/actions";
import InviteForm from "@/components/InviteForm";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  if (!dbConfigured) redirect("/dashboard");
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) redirect("/signin");
  const viewer = await db.user.findUnique({ where: { id: viewerId } });
  if (!viewer || viewer.role !== "ADMIN") redirect("/dashboard");

  const [learners, premium, submitted, decided, staff, invites, evaluators] = await Promise.all([
    db.user.count({ where: { role: "LEARNER" } }),
    db.user.count({ where: { premium: true } }),
    db.portfolio.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    db.portfolio.count({ where: { decidedAt: { not: null } } }),
    db.user.findMany({ where: { role: { in: ["REVIEWER", "ADMIN"] } }, orderBy: { createdAt: "asc" } }),
    db.invite.findMany({ where: { acceptedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }),
    db.portfolio.groupBy({ by: ["evaluatorId"], where: { evaluatorId: { not: null } }, _count: { _all: true } }),
  ]);
  const load = new Map(evaluators.map((e) => [e.evaluatorId, e._count._all]));
  const verifiedPayments = await db.payment.count({ where: { verified: true } });
  const errors = await db.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 });
  const emailsSent = await db.email.count();

  const stats: Array<[string, string]> = [
    [String(learners), "learners"],
    [String(premium), "on the full plan"],
    [String(verifiedPayments), "verified payments"],
    [String(submitted), "awaiting evaluation"],
    [String(decided), "decided"],
    [String(staff.filter((s) => s.role === "REVIEWER").length), "evaluators"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-4xl font-bold leading-tight">Admin</h1>
        <div className="flex flex-wrap items-baseline gap-5 text-sm font-semibold">
          <Link href="/review" className="text-primary underline underline-offset-4">Evaluator dashboard</Link>
          <form action={logout}>
            <button className="text-primary underline underline-offset-4">Sign out ({viewer.name})</button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 rounded-lg bg-accent px-8 py-8 text-accent-foreground sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([v, l]) => (
          <div key={l}>
            <p className="text-4xl font-bold tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{v}</p>
            <p className="mt-1 text-sm font-semibold">{l}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Invite an evaluator</h2>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          Evaluators and admins join by invitation only. Create a link and send it to them.
        </p>
        <div className="mt-5 rounded-lg bg-card p-6">
          <InviteForm />
        </div>
        {invites.length > 0 && (
          <ul className="mt-4 rounded-lg bg-card">
            {invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3 text-sm odd:bg-background">
                <span>
                  <span className="font-semibold">{i.email}</span>
                  <span className="text-muted-foreground"> · {i.role === "ADMIN" ? "Admin" : "Evaluator"} · expires {i.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </span>
                <form action={revokeInvite.bind(null, i.id)}>
                  <button className="font-semibold text-destructive underline underline-offset-4">Revoke</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Health</h2>
        <p className="mt-1 text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
          {errors.length === 0 ? "No server errors recorded." : `Last ${errors.length} server errors`} · {emailsSent} emails sent
        </p>
        {errors.length > 0 && (
          <ul className="mt-4 rounded-lg bg-card">
            {errors.map((e) => (
              <li key={e.id} className="px-5 py-3 text-sm odd:bg-background">
                <p className="font-semibold">{e.message}</p>
                <p className="text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {e.path || "n/a"} · {e.createdAt.toLocaleString("en-US")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Evaluators and admins</h2>
        <ul className="mt-4 rounded-lg bg-card">
          {staff.map((u) => (
            <li key={u.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3 odd:bg-background" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span>
                <span className="font-semibold">{u.name}</span>
                <span className="text-muted-foreground"> · {u.email} · {u.role === "ADMIN" ? "Admin" : "Evaluator"}</span>
              </span>
              <span className="text-sm text-muted-foreground">{load.get(u.id) ?? 0} evaluations</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
