import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { logout, releaseReview, startReview } from "@/lib/actions";

export const metadata: Metadata = { title: "Evaluator dashboard" };

const DECISION: Record<string, string> = {
  APPROVED: "Credit recommended",
  REVISIONS_REQUESTED: "Revisions requested",
  DENIED: "Not recommended",
};

function days(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / 86400000);
}

export default async function ReviewDashboardPage() {
  if (!dbConfigured) redirect("/dashboard");
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) redirect("/signin");
  const viewer = await db.user.findUnique({ where: { id: viewerId } });
  if (!viewer || (viewer.role !== "REVIEWER" && viewer.role !== "ADMIN")) redirect("/dashboard");
  if (!viewer.totpEnabledAt) redirect("/account/security?required=1");

  const [queue, mine, done] = await Promise.all([
    db.portfolio.findMany({
      where: { status: "SUBMITTED", userId: { not: viewerId } },
      include: { course: true, user: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
    }),
    db.portfolio.findMany({
      where: { status: "UNDER_REVIEW", evaluatorId: viewerId },
      include: { course: true, user: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
    }),
    db.portfolio.findMany({
      where: { evaluatorId: viewerId, decidedAt: { not: null } },
      include: { course: true, user: { select: { name: true } } },
      orderBy: { decidedAt: "desc" },
    }),
  ]);

  const approved = done.filter((p) => p.status === "APPROVED").length;
  const revisions = done.filter((p) => p.status === "REVISIONS_REQUESTED").length;
  const denied = done.filter((p) => p.status === "DENIED").length;
  const scored = done.filter((p) => p.score != null);
  const avgScore = scored.length
    ? (scored.reduce((s, p) => s + (p.score ?? 0), 0) / scored.length).toFixed(1)
    : "n/a";
  const credits = done.filter((p) => p.status === "APPROVED").reduce((s, p) => s + p.course.credits, 0);
  const turnaround = done.length
    ? (done.reduce((s, p) => s + days(p.createdAt, p.decidedAt ?? p.updatedAt), 0) / done.length).toFixed(1)
    : "n/a";

  const stats: Array<[string, string]> = [
    [String(queue.length), "waiting"],
    [String(mine.length), "in your review"],
    [String(done.length), "decided"],
    [String(credits), "credits recommended"],
    [avgScore, "average score"],
    [turnaround, "avg days to decide"],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-4xl font-bold leading-tight">Evaluator Dashboard</h1>
        <div className="flex flex-wrap items-baseline gap-5 text-sm font-semibold">
          {viewer.role === "ADMIN" && (
            <Link href="/admin" className="text-primary hover:text-accent">
              Admin
            </Link>
          )}
          <form action={logout}>
            <button className="text-primary hover:text-accent">
              Sign Out ({viewer.name})
            </button>
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

      {mine.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">In Your Review</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((p) => (
              <li key={p.id} className="rounded-lg bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <div>
                    <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.course.code} · {p.user.name}
                    </p>
                    <p className="mt-0.5 text-lg font-bold">{p.course.title}</p>
                  </div>
                  <span className="flex items-baseline gap-5">
                    <Link href={`/portfolio/${p.id}`} className="font-semibold text-primary hover:text-accent">
                      Continue Evaluation
                    </Link>
                    <form action={releaseReview.bind(null, p.id)}>
                      <button className="text-sm font-semibold text-muted-foreground hover:text-accent hover:text-primary">
                        Return to Queue
                      </button>
                    </form>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Waiting for an Evaluator</h2>
        {queue.length === 0 ? (
          <p className="mt-4 rounded-lg bg-card p-6 text-muted-foreground">Nothing waiting right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {queue.map((p) => (
              <li key={p.id} className="rounded-lg bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <div>
                    <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.course.code} · {p.user.name} · {p.course.credits} credits · submitted {p.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="mt-0.5 text-lg font-bold">{p.course.title}</p>
                  </div>
                  <form action={startReview.bind(null, p.id)}>
                    <button className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                      Start Evaluation
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Completed</h2>
        <p className="mt-1 text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
          {approved} recommended · {revisions} revisions requested · {denied} not recommended
        </p>
        {done.length === 0 ? (
          <p className="mt-4 rounded-lg bg-card p-6 text-muted-foreground">No decisions yet.</p>
        ) : (
          <ul className="mt-4 rounded-lg bg-card">
            {done.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4 odd:bg-background"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <div>
                  <p className="text-sm text-muted-foreground">
                    {p.course.code} · {p.user.name} · {p.decidedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="mt-0.5 font-bold">{p.course.title}</p>
                </div>
                <div className="flex items-baseline gap-5">
                  <span className={`font-semibold ${p.status === "APPROVED" ? "text-success" : p.status === "DENIED" ? "text-destructive" : "text-secondary-foreground"}`}>
                    {DECISION[p.status] ?? p.status}{p.score != null ? ` · ${p.score}/5` : ""}
                  </span>
                  <Link href={`/portfolio/${p.id}`} className="text-sm font-semibold text-primary hover:text-accent">
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
