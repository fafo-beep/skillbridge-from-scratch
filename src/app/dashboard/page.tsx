import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { logout, toggleLesson } from "@/lib/actions";

export const metadata: Metadata = { title: "My learning" };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft — keep documenting",
  SUBMITTED: "Submitted — awaiting an evaluator",
  UNDER_REVIEW: "Under faculty review",
  REVISIONS_REQUESTED: "Revisions requested",
  APPROVED: "Approved — credit recommended",
  DENIED: "Not approved — read the feedback",
};

export default async function DashboardPage() {
  const session = dbConfigured ? await auth() : null;

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-4xl font-bold leading-tight">My learning</h1>
        <p className="mt-3 leading-relaxed">
          Sign in to see your courses, progress, and credit portfolios.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signin"
            className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
          >
            Sign in
          </Link>
          <Link
            href="/join"
            className="rounded-md bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px"
          >
            Join free
          </Link>
        </div>
        {!dbConfigured && (
          <p className="mt-6 text-sm text-muted-foreground">
            Accounts are not switched on for this deployment yet.
          </p>
        )}
      </div>
    );
  }

  const userId = session.user.id;
  const [enrollments, portfolios] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      include: {
        course: { include: { modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } } } },
        progress: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.portfolio.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-4xl font-bold leading-tight">My learning</h1>
        <form action={logout}>
          <button className="text-sm font-semibold text-primary underline underline-offset-4">
            Sign out ({session.user.name ?? session.user.email})
          </button>
        </form>
      </div>

      {enrollments.length === 0 && portfolios.length === 0 && (
        <div className="mt-10 rounded-lg bg-card p-10">
          <p className="text-xl font-bold">Nothing here yet.</p>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Enroll in a course, or start a credit portfolio for experience you
            already have.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
          >
            Browse the catalog
          </Link>
        </div>
      )}

      {portfolios.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Credit portfolios</h2>
          <div className="mt-5 space-y-4">
            {portfolios.map((p) => (
              <div key={p.id} className="rounded-lg bg-card p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <div>
                    <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {p.course.code} · Credit for experience
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{p.course.title}</h3>
                  </div>
                  <Link
                    href={`/portfolio/${p.id}`}
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    Open portfolio
                  </Link>
                </div>
                <p className="mt-3 font-semibold text-secondary-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.status === "APPROVED" && p.score != null
                    ? `${STATUS_LABEL[p.status]} · ${p.course.credits} credits · score ${p.score}/5`
                    : STATUS_LABEL[p.status] ?? p.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrollments.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Courses</h2>
          <div className="mt-5 space-y-5">
            {enrollments.map((e) => {
              const lessons = e.course.modules.flatMap((m) => m.lessons);
              const doneIds = new Set(e.progress.map((p) => p.lessonId));
              const pct = lessons.length
                ? Math.round((doneIds.size / lessons.length) * 100)
                : 0;
              return (
                <div key={e.id} className="rounded-lg bg-card p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <div>
                      <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {e.course.code}
                      </p>
                      <h3 className="mt-1 text-xl font-bold">{e.course.title}</h3>
                    </div>
                    <Link
                      href={`/courses/${e.course.slug}`}
                      className="font-semibold text-primary underline underline-offset-4"
                    >
                      Course page
                    </Link>
                  </div>

                  <div className="mt-5">
                    <div
                      className="flex justify-between text-sm font-semibold"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      <span>
                        {doneIds.size} of {lessons.length} lessons
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-md bg-muted">
                      <div
                        className="h-2 rounded-md bg-primary"
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${e.course.title} progress`}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    {e.course.modules.map((m) => (
                      <div key={m.id}>
                        <p className="font-bold">{m.title}</p>
                        <ul className="mt-2">
                          {m.lessons.map((l) => {
                            const done = doneIds.has(l.id);
                            return (
                              <li
                                key={l.id}
                                className="flex items-center justify-between gap-4 px-3 py-2 text-sm odd:bg-background"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                <span className={done ? "text-muted-foreground line-through" : ""}>
                                  {l.title}
                                </span>
                                <span className="flex shrink-0 items-center gap-4">
                                  <span className="text-muted-foreground">{l.minutes} min</span>
                                  <form action={toggleLesson.bind(null, l.id)}>
                                    <button className="font-semibold text-primary underline underline-offset-4">
                                      {done ? "Undo" : "Mark done"}
                                    </button>
                                  </form>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
