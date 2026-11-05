import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { startReview } from "@/lib/actions";

export const metadata: Metadata = { title: "Review queue" };

export default async function ReviewQueuePage() {
  if (!dbConfigured) redirect("/dashboard");
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) redirect("/signin");
  const viewer = await db.user.findUnique({ where: { id: viewerId } });
  if (!viewer || (viewer.role !== "REVIEWER" && viewer.role !== "ADMIN")) redirect("/dashboard");

  const [queue, mine, decided] = await Promise.all([
    db.portfolio.findMany({
      where: { status: "SUBMITTED" },
      include: { course: true, user: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
    }),
    db.portfolio.findMany({
      where: { status: "UNDER_REVIEW", evaluatorId: viewerId },
      include: { course: true, user: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
    }),
    db.portfolio.count({ where: { evaluatorId: viewerId, decidedAt: { not: null } } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-4xl font-bold leading-tight">Review queue</h1>
      <p className="mt-2 text-lg leading-relaxed" style={{ fontVariantNumeric: "tabular-nums" }}>
        {queue.length} waiting · {mine.length} in your review · {decided} decided by you
      </p>

      {mine.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">In your review</h2>
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
                  <Link
                    href={`/portfolio/${p.id}`}
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    Continue evaluation
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Waiting for an evaluator</h2>
        {queue.length === 0 ? (
          <p className="mt-4 rounded-lg bg-card p-6 text-muted-foreground">
            Nothing waiting right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {queue.map((p) => (
              <li key={p.id} className="rounded-lg bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <div>
                    <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.course.code} · {p.user.name} · {p.course.credits} credits
                    </p>
                    <p className="mt-0.5 text-lg font-bold">{p.course.title}</p>
                  </div>
                  <form action={startReview.bind(null, p.id)}>
                    <button className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                      Start evaluation
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
