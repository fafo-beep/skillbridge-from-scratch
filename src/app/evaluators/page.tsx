import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "For evaluators",
  description: "How faculty evaluators review Prior Learning Assessment portfolios on SkillBridge.",
};

export default function EvaluatorsPage() {
  return (
    <div>
      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-14 sm:pt-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <h1 className="text-[10vw] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Evaluate experience. Recommend credit.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed">
              Faculty evaluators read a learner&apos;s portfolio against a course&apos;s stated outcomes, score it, and issue a credit recommendation the learner takes to their college.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signin" className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                Evaluator Sign In
              </Link>
            </div>
          </div>
          <Image
            src={PHOTOS.evaluator.src}
            alt={PHOTOS.evaluator.alt}
            width={PHOTOS.evaluator.width}
            height={PHOTOS.evaluator.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="w-full rounded-lg object-cover"
            priority
          />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">How evaluation works</h2>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold">By invitation</h3>
            <p className="mt-3 leading-relaxed">Evaluator accounts are created by SkillBridge admins. If you have been invited, your invitation link creates your account; nobody can self-register as an evaluator.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Outcome by outcome</h3>
            <p className="mt-3 leading-relaxed">Each portfolio presents a narrative and evidence for every course outcome. You see exactly what the learner claims and the files they name as proof.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold">Your decision, recorded</h3>
            <p className="mt-3 leading-relaxed">Score from 1 to 5, write a note the learner reads, and recommend credit, request revisions, or decline. Every decision is yours alone and audited.</p>
          </div>
        </div>
      </section>
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Your dashboard keeps the record.</h2>
          <p className="mt-4 max-w-xl leading-relaxed">The queue waiting for an evaluator, the cases in your review, and everything you have decided: recommendations, scores, credits, and your average turnaround.</p>
        </div>
      </section>
    </div>
  );
}
