import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, courseMinutes, flatLessons, getCategory, getCourse, lessonPath } from "@/lib/catalog";
import { enroll, startPortfolio } from "@/lib/actions";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return {
    title: `${course.title} (${course.code})`,
    description: course.summary,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const category = getCategory(course.category);
  const minutes = courseMinutes(course);
  const flat = flatLessons(course);
  const lessonCount = flat.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    courseCode: course.code,
    description: course.summary,
    provider: { "@type": "Organization", name: "SkillBridge" },
    numberOfCredits: course.credits,
    occupationalCredentialAwarded: "College credit recommendation (PLA)",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Course header */}
      <section className="bg-accent text-accent-foreground">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
            {course.code} · {category?.name}
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">{course.summary}</p>
          <div
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-semibold"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span>{course.credits} college credits</span>
            <span>{course.level}</span>
            <span>
              {lessonCount} readings · about {minutes} minutes
            </span>
            <span>{course.priceUSD === 0 ? "Included free" : `$${course.priceUSD}`}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={enroll.bind(null, course.slug)}>
              <button className="rounded-md bg-background px-6 py-3 font-semibold text-primary hover:bg-secondary active:translate-y-px">
                Enroll Free
              </button>
            </form>
            {course.plaEligible && (
              <form action={startPortfolio.bind(null, course.slug)}>
                <button className="rounded-md border border-accent-foreground px-6 py-3 font-semibold hover:bg-primary active:translate-y-px">
                  Get Credit for Experience Instead
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {/* Outcomes */}
          <section>
            <h2 className="text-2xl font-bold">What this course certifies</h2>
            <ul className="mt-5 space-y-3">
              {course.outcomes.map((o) => (
                <li key={o} className="rounded-md bg-card p-4 font-semibold">
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {/* Syllabus */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold">Syllabus</h2>
            <div className="mt-5 space-y-6">
              {course.modules.map((m) => (
                <div key={m.title} className="rounded-md bg-card p-6">
                  <h3 className="text-lg font-bold">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.summary}
                  </p>
                  <ul className="mt-4">
                    {m.lessons.map((l) => {
                      const n = flat.find((f) => f.lesson === l)?.n ?? 1;
                      return (
                        <li
                          key={l.title}
                          className="flex items-baseline justify-between gap-4 px-3 py-2.5 text-sm odd:bg-background"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          <Link href={lessonPath(course.slug, n)} className="font-semibold text-primary hover:text-accent">
                            {l.title}
                          </Link>
                          <span className="shrink-0 text-muted-foreground">Reading · {l.minutes} min</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* PLA panel */}
        <aside>
          {course.plaEligible && (
            <div className="rounded-md bg-secondary p-6 text-secondary-foreground">
              <h2 className="text-lg font-bold">Already done this for a living?</h2>
              <p className="mt-2 leading-relaxed">
                This course is a Prior Learning Assessment pathway. Instead of
                taking the lessons, document your experience against the
                outcomes above, attach evidence, and a faculty evaluator issues
                a credit recommendation your college can review.
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                Only colleges award credit; confirm your school&apos;s PLA
                policy before you start.
              </p>
              <form action={startPortfolio.bind(null, course.slug)}>
                <button className="mt-5 inline-block rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                  Start the Credit Check
                </button>
              </form>
            </div>
          )}
          <div className="mt-5 rounded-md bg-card p-6">
            <h2 className="text-lg font-bold">The numbers</h2>
            <dl className="mt-4 space-y-2 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Credits</dt>
                <dd className="font-semibold">{course.credits}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Modules</dt>
                <dd className="font-semibold">{course.modules.length}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Lessons</dt>
                <dd className="font-semibold">
                  {course.modules.reduce((s, m) => s + m.lessons.length, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Reading time</dt>
                <dd className="font-semibold">about {minutes} minutes</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
