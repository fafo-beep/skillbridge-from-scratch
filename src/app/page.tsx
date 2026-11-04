import Link from "next/link";
import { CATEGORIES, COURSES } from "@/lib/catalog";
import CourseCard from "@/components/CourseCard";
import Reveal from "@/components/Reveal";
import {
  DecisionFragment,
  EvaluationFragment,
  EvidenceFragment,
  PlayerFragment,
  ProgressFragment,
} from "@/components/fragments";

const STEPS = [
  {
    title: "Pick a credit pathway",
    text: "Browse courses that match what you already do at work. Each one lists the exact outcomes a college expects, so you know what you are matching before you write a word.",
  },
  {
    title: "Document your experience",
    text: "A guided builder walks you through telling your story and matching it to each outcome, in plain language. You write what you did; the structure is handled for you.",
  },
  {
    title: "Attach your evidence",
    text: "Work samples, certifications, performance reviews, the spreadsheet you actually built. The proof already exists; the builder puts it where an evaluator will look.",
  },
  {
    title: "Get a faculty decision",
    text: "A qualified evaluator scores your portfolio against the course outcomes and issues a credit recommendation you can take to your college.",
  },
];

const FAQS: Array<[string, string]> = [
  [
    "What is Prior Learning Assessment?",
    "A process colleges themselves run: you document learning you gained outside the classroom, a qualified evaluator scores it against a course's outcomes, and your college decides whether to award the credit.",
  ],
  [
    "Will my college accept the portfolio?",
    "Most U.S. colleges have a PLA policy, and portfolios are a standard format under it. The decision is always your college's, so check its policy first; the free credit check is a good moment to do that.",
  ],
  [
    "How long does it take?",
    "Most people finish a first portfolio over a few evenings spread across two to four weeks. The builder keeps the structure, so your time goes into telling your story and gathering files you already have.",
  ],
  [
    "What counts as evidence?",
    "Work samples, certifications and licenses, performance reviews, training records, the spreadsheet or plan you actually made. Each file is attached to the specific outcome it proves.",
  ],
  [
    "How much can it save?",
    "Public colleges average about $350 per credit hour, so a typical three-credit course is around $1,050 in tuition. Every course you earn credit for is a course you neither pay for nor sit through.",
  ],
  [
    "What does the $99 include?",
    "The full portfolio builder, unlimited course submissions, writing assistance, PDF export, and a faculty evaluation of your portfolio. One payment, nothing recurring.",
  ],
];

export default function HomePage() {
  const featured = COURSES.slice(0, 3);
  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const stats: Array<[string, string]> = [
    [String(CATEGORIES.length), "fields of work"],
    [String(COURSES.length), "credit pathways"],
    [String(totalCredits), "credits available"],
    ["$350", "average credit value"],
    ["$99", "once, for everything"],
  ];

  return (
    <div>
      <Reveal />

      {/* Hero: a pale field over the whole top; claim left, proof right */}
      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-[10vw] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Learn the new. Credit the rest.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">
              SkillBridge is a course platform for working adults: every pathway
              teaches the skills a role demands, and recognizes the ones your
              years of work already prove — through Prior Learning Assessment
              your college can review.
            </p>
            <div className="mt-8">
              <Link
                href="/catalog"
                className="inline-block rounded-md bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
              >
                Browse the catalog
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Free to join. No card needed.
              </p>
            </div>
          </div>
          <div>
            <DecisionFragment />
            <p className="mt-3 text-sm text-muted-foreground">
              Where every pathway can end: credit your college can review.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="pt-20">
          <h2 data-reveal className="text-2xl font-bold">
            What eight years on the job can be worth
          </h2>
          <p data-reveal className="mt-1.5 mb-5 text-muted-foreground">
            A sample evaluation, at the average public-college rate of $350 per credit.
          </p>
          <div data-reveal>
            <EvaluationFragment />
          </div>
        </div>
      </section>

      {/* The numbers, plainly — an inset panel, Coursera-promo style */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-lg bg-accent px-8 py-12 text-accent-foreground sm:px-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(([value, label]) => (
              <div data-reveal key={label}>
                <p
                  className="text-5xl font-bold tracking-tight"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {value}
                </p>
                <p className="mt-1 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
          Five fields, taught from the work itself
        </h2>
        <ul data-reveal className="mt-10">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/catalog?category=${c.slug}`}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4 odd:bg-card hover:text-primary"
              >
                <span className="font-bold">{c.name}</span>
                <span className="text-muted-foreground">{c.scope}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured courses */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
            Start with these
          </h2>
          <div className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-3">
            {featured.map((c) => (
              <div data-reveal key={c.slug} className="h-full">
                <CourseCard course={c} />
              </div>
            ))}
          </div>
          <p className="mt-8">
            <Link
              href="/catalog"
              className="font-semibold text-primary underline underline-offset-4"
            >
              See the full catalog
            </Link>
          </p>
        </div>
      </section>

      {/* Inside the product: the honest pictures of software */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 data-reveal className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          One place for the course and the credit
        </h2>
        <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
          <div data-reveal>
            <PlayerFragment />
            <p className="mt-3 text-sm text-muted-foreground">
              Lessons, with their lengths stated.
            </p>
          </div>
          <div data-reveal>
            <ProgressFragment />
            <p className="mt-3 text-sm text-muted-foreground">
              Progress that survives a busy week.
            </p>
          </div>
          <div data-reveal>
            <EvidenceFragment />
            <p className="mt-3 text-sm text-muted-foreground">
              Proof you already have, filed where evaluators look.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
            Four steps, all guided
          </h2>
          <ol className="mt-10 grid list-none gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li data-reveal key={s.title}>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Questions, answered */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
            Questions, answered
          </h2>
          <div className="mt-10 grid gap-x-16 gap-y-10 sm:grid-cols-2">
            {FAQS.map(([q, a]) => (
              <div data-reveal key={q}>
                <h3 className="text-lg font-bold">{q}</h3>
                <p className="mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The difference */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 data-reveal className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            The course you can test out of is money kept.
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            <div data-reveal>
              <h3 className="text-xl font-bold">Courses that respect your time</h3>
              <p className="mt-3 leading-relaxed">
                Short modules, stated outcomes, no filler. You can see every
                lesson and its length before you start.
              </p>
            </div>
            <div data-reveal>
              <h3 className="text-xl font-bold">Credit for experience</h3>
              <p className="mt-3 leading-relaxed">
                Every eligible course maps to a Prior Learning Assessment
                pathway: document what you have done, attach evidence, and get
                a faculty credit recommendation.
              </p>
            </div>
            <div data-reveal>
              <h3 className="text-xl font-bold">Honest about the limits</h3>
              <p className="mt-3 leading-relaxed">
                Only colleges award credit. We build the portfolio and the
                evaluation your school needs to say yes — check its PLA policy
                first.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
