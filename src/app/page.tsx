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

export default function HomePage() {
  const featured = COURSES.slice(0, 3);
  return (
    <div>
      <Reveal />

      {/* Hero: the claim, then the evaluation that proves it */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
        <h1 className="max-w-4xl text-[10vw] font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Learn the new. Credit the rest.
        </h1>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-lg leading-relaxed">
            SkillBridge is a course platform for working adults: every pathway
            teaches the skills a role demands, and recognizes the ones your
            years of work already prove — through Prior Learning Assessment
            your college can review.
          </p>
          <div className="shrink-0">
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

        <div className="mt-20">
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

      {/* Categories */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
            Five fields, taught from the work itself
          </h2>
          <ul data-reveal className="mt-10">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalog?category=${c.slug}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4 odd:bg-background hover:text-primary"
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-muted-foreground">{c.scope}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 data-reveal className="text-3xl font-bold leading-tight sm:text-4xl">
            Start with these
          </h2>
          <Link
            href="/catalog"
            className="font-semibold text-primary underline underline-offset-4"
          >
            See the full catalog
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featured.map((c) => (
            <div data-reveal key={c.slug}>
              <CourseCard course={c} />
            </div>
          ))}
        </div>
      </section>

      {/* Inside the product: the honest pictures of software */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 data-reveal className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            One place for the course and the credit
          </h2>
          <div className="mt-10 grid items-start gap-5 lg:grid-cols-2">
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
            <div data-reveal>
              <DecisionFragment />
              <p className="mt-3 text-sm text-muted-foreground">
                The credit recommendation, ready for your college.
              </p>
            </div>
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
