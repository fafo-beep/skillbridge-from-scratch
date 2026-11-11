import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { flatLessons, getCourse, lessonPath } from "@/lib/catalog";
import { getGuide } from "@/content/guides";
import { enroll, toggleLesson } from "@/lib/actions";

// A lesson page: one reading that prepares the learner to claim an
// outcome. Reading is open to everyone; marking it read needs an
// enrollment, which is free and returns the reader to this page.

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  const course = getCourse(slug);
  const entry = course && flatLessons(course).find((l) => l.n === Number(n));
  if (!course || !entry) return {};
  return { title: `${entry.lesson.title} (${course.code})`, description: getGuide(slug, entry.lesson.title)?.intro };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const all = flatLessons(course);
  const entry = all.find((l) => l.n === Number(n));
  if (!entry) notFound();
  const guide = getGuide(slug, entry.lesson.title);
  if (!guide) notFound();
  const prev = all.find((l) => l.n === entry.n - 1);
  const next = all.find((l) => l.n === entry.n + 1);
  const here = lessonPath(slug, entry.n);

  // Progress, when there is someone signed in and a database to keep it.
  let state: { kind: "anonymous" } | { kind: "unenrolled" } | { kind: "enrolled"; lessonId: string; read: boolean } = { kind: "anonymous" };
  if (dbConfigured) {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId) {
      const dbCourse = await db.course.findUnique({
        where: { slug },
        include: {
          modules: { where: { position: entry.moduleIndex }, include: { lessons: { where: { position: entry.lessonIndex } } } },
          enrollments: { where: { userId }, include: { progress: true } },
        },
      });
      const lessonId = dbCourse?.modules[0]?.lessons[0]?.id;
      const enrollment = dbCourse?.enrollments[0];
      if (lessonId && enrollment) {
        state = { kind: "enrolled", lessonId, read: enrollment.progress.some((p) => p.lessonId === lessonId) };
      } else {
        state = { kind: "unenrolled" };
      }
    }
  }

  const h2 = "mt-10 text-xl font-bold";
  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        <Link href={`/courses/${slug}`} className="font-semibold text-primary hover:text-accent">
          {course.code} {course.title}
        </Link>
        {" · "}
        {entry.module.title}
        {" · "}
        Lesson {entry.n} of {all.length}
      </p>
      <h1 className="mt-2 text-4xl font-bold leading-tight">{entry.lesson.title}</h1>
      <p className="mt-3 text-sm font-semibold text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        Reading · {entry.lesson.minutes} min
        {state.kind === "enrolled" && state.read && <span className="text-success"> · Read</span>}
      </p>

      <div className="mt-6 rounded-lg bg-secondary px-5 py-4 text-secondary-foreground">
        <p className="text-sm font-semibold">Prepares you to evidence</p>
        <p className="mt-1 font-bold">{guide.outcome}</p>
      </div>

      <p className="mt-8 text-lg leading-relaxed">{guide.intro}</p>

      <h2 className={h2}>What this looks like at work</h2>
      {guide.meaning.map((p, i) => (
        <p key={i} className="mt-4 leading-relaxed">
          {p}
        </p>
      ))}

      <h2 className={h2}>What an evaluator looks for</h2>
      <ul className="mt-4 space-y-2">
        {guide.evaluatorsLookFor.map((item) => (
          <li key={item} className="flex gap-3 leading-relaxed">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className={h2}>What counts as evidence</h2>
      <ul className="mt-4 space-y-2">
        {guide.evidence.map((item) => (
          <li key={item} className="flex gap-3 leading-relaxed">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 className={h2}>A worked example</h2>
      <blockquote className="mt-4 rounded-lg bg-card p-6 leading-relaxed">
        <p>{guide.example.narrative}</p>
      </blockquote>
      <p className="mt-4 leading-relaxed">
        <span className="font-semibold">Why it works. </span>
        {guide.example.why}
      </p>

      <h2 className={h2}>Check yourself</h2>
      <ol className="mt-4 space-y-2" style={{ fontVariantNumeric: "tabular-nums" }}>
        {guide.selfCheck.map((q, i) => (
          <li key={q} className="flex gap-3 leading-relaxed">
            <span className="w-5 shrink-0 font-semibold text-muted-foreground">{i + 1}.</span>
            <span>{q}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Four yes answers means you are ready to write this outcome in a credit portfolio. Fewer means you have found the gap to close first.
      </p>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <div>
          {prev ? (
            <Link href={lessonPath(slug, prev.n)} className="font-semibold text-primary hover:text-accent">
              Previous: {prev.lesson.title}
            </Link>
          ) : (
            <Link href={`/courses/${slug}`} className="font-semibold text-primary hover:text-accent">
              Back to the Course
            </Link>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {state.kind === "enrolled" && (
            <form action={toggleLesson.bind(null, state.lessonId)}>
              <button
                className={
                  state.read
                    ? "rounded-md bg-secondary px-5 py-2.5 font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px"
                    : "rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
                }
              >
                {state.read ? "Mark as Unread" : "Mark as Read"}
              </button>
            </form>
          )}
          {state.kind === "unenrolled" && (
            <form action={enroll.bind(null, slug, here)}>
              <button className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                Enroll Free to Track Your Reading
              </button>
            </form>
          )}
          {state.kind === "anonymous" && (
            <Link href="/join" className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
              Join Free to Track Your Reading
            </Link>
          )}
          {next && (
            <Link href={lessonPath(slug, next.n)} className="font-semibold text-primary hover:text-accent">
              Next: {next.lesson.title}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
