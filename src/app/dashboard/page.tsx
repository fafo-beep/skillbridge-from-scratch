import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "My learning",
};

// Sample learner state. Becomes real data when auth + Postgres land
// (see db/schema.prisma: Enrollment, Progress, Portfolio).
const SAMPLE = [
  { slug: "digital-marketing-fundamentals", done: 3, kind: "course" as const },
  { slug: "principles-of-management", done: 0, kind: "pla" as const },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-bold leading-tight">My learning</h1>
      <p className="mt-2 max-w-xl text-lg leading-relaxed">
        A preview with sample data — sign-in, enrollments, and progress arrive
        with the database layer.
      </p>

      <div className="mt-10 space-y-5">
        {SAMPLE.map(({ slug, done, kind }) => {
          const course = getCourse(slug);
          if (!course) return null;
          const total = course.modules.reduce((s, m) => s + m.lessons.length, 0);
          const pct = Math.round((done / total) * 100);
          return (
            <div key={slug} className="rounded-md bg-card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div>
                  <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {course.code} · {kind === "pla" ? "Credit for experience" : "Course"}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{course.title}</h2>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  {kind === "pla" ? "Continue portfolio" : "Continue course"}
                </Link>
              </div>
              {kind === "course" ? (
                <div className="mt-5">
                  <div className="flex justify-between text-sm font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span>
                      {done} of {total} lessons
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
                      aria-label={`${course.title} progress`}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Portfolio in draft — document your experience against each of
                  the {course.outcomes.length} outcomes, then attach evidence.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
