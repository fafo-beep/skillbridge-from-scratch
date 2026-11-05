import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import {
  addEvidence,
  decidePortfolio,
  removeEvidence,
  saveOutcomeResponse,
  submitPortfolio,
} from "@/lib/actions";

export const metadata: Metadata = { title: "Credit portfolio" };

const MIN_NARRATIVE = 50;
const EDITABLE = new Set(["DRAFT", "REVISIONS_REQUESTED"]);
const STATUS_LINE: Record<string, string> = {
  DRAFT: "Draft — document each outcome, then submit",
  SUBMITTED: "Submitted — waiting for an evaluator",
  UNDER_REVIEW: "Under faculty review",
  REVISIONS_REQUESTED: "Revisions requested — see the evaluator's note, update, and resubmit",
  APPROVED: "Approved — credit recommended",
  DENIED: "Not approved — see the evaluator's note",
};

const KINDS = ["Work sample", "Certification", "Performance review", "Report", "Spreadsheet", "Other"];

export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  if (!dbConfigured) redirect("/dashboard");
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) redirect("/signin");

  const portfolio = await db.portfolio.findUnique({
    where: { id },
    include: {
      course: { include: { outcomes: { orderBy: { position: "asc" } } } },
      responses: true,
      evidence: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!portfolio) notFound();

  const viewer = await db.user.findUnique({ where: { id: viewerId } });
  const isOwner = portfolio.userId === viewerId;
  const hasReviewerRole = viewer?.role === "REVIEWER" || viewer?.role === "ADMIN";
  // A reviewer sees only what the role needs: the open queue (SUBMITTED)
  // and their own claimed or decided reviews — never drafts, revisions in
  // progress, or another evaluator's case.
  const isReviewer =
    hasReviewerRole &&
    !isOwner &&
    (portfolio.status === "SUBMITTED" || portfolio.evaluatorId === viewerId);
  if (!isOwner && !isReviewer) notFound();

  const editable = isOwner && EDITABLE.has(portfolio.status);
  const byOutcome = new Map(portfolio.responses.map((r) => [r.outcomeId, r]));
  const evidenceByOutcome = new Map<string, typeof portfolio.evidence>();
  for (const e of portfolio.evidence) {
    const list = evidenceByOutcome.get(e.outcomeId) ?? [];
    list.push(e);
    evidenceByOutcome.set(e.outcomeId, list);
  }
  const done = portfolio.course.outcomes.filter(
    (o) => (byOutcome.get(o.id)?.narrative.trim().length ?? 0) >= MIN_NARRATIVE
  ).length;
  const total = portfolio.course.outcomes.length;
  const canDecide =
    isReviewer &&
    portfolio.status === "UNDER_REVIEW" &&
    portfolio.evaluatorId === viewerId &&
    portfolio.userId !== viewerId;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        {portfolio.course.code} · Credit for experience
        {!isOwner && <> · {portfolio.user.name} ({portfolio.user.email})</>}
      </p>
      <h1 className="mt-1 text-4xl font-bold leading-tight">{portfolio.course.title}</h1>
      <p className="mt-3 text-lg font-semibold text-secondary-foreground">
        {STATUS_LINE[portfolio.status] ?? portfolio.status}
      </p>

      {(portfolio.status === "APPROVED" ||
        portfolio.status === "DENIED" ||
        portfolio.status === "REVISIONS_REQUESTED") &&
        portfolio.decisionNote && (
          <div className="mt-6 rounded-lg bg-card p-6">
            {portfolio.score != null && (
              <p className="text-2xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                {portfolio.status === "APPROVED"
                  ? `${portfolio.course.credits} credits recommended · score ${portfolio.score}/5`
                  : `Score ${portfolio.score}/5`}
              </p>
            )}
            <p className="mt-2 leading-relaxed">&quot;{portfolio.decisionNote}&quot;</p>
            <p className="mt-2 text-sm text-muted-foreground">The evaluator&apos;s note</p>
          </div>
        )}

      {editable && (
        <div className="mt-6 rounded-lg bg-secondary p-5 text-secondary-foreground">
          <p className="font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
            {done} of {total} outcomes documented
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            For each outcome, tell the story of when you did this work (at least{" "}
            {MIN_NARRATIVE} characters), and list the files that prove it. Submit
            unlocks when every outcome is documented.
          </p>
        </div>
      )}

      <div className="mt-10 space-y-10">
        {portfolio.course.outcomes.map((outcome, i) => {
          const response = byOutcome.get(outcome.id);
          const evidence = evidenceByOutcome.get(outcome.id) ?? [];
          const ok = (response?.narrative.trim().length ?? 0) >= MIN_NARRATIVE;
          return (
            <section key={outcome.id} className="rounded-lg bg-card p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="text-xl font-bold">{outcome.text}</h2>
                {editable && (
                  <span className={`text-sm font-bold ${ok ? "text-success" : "text-muted-foreground"}`}>
                    {ok ? "Documented" : "Not yet documented"}
                  </span>
                )}
              </div>

              {editable ? (
                <form action={saveOutcomeResponse.bind(null, portfolio.id, outcome.id)} className="mt-4">
                  <label htmlFor={`narrative-${i}`} className="sr-only">
                    Your experience for this outcome
                  </label>
                  <textarea
                    id={`narrative-${i}`}
                    name="narrative"
                    rows={5}
                    defaultValue={response?.narrative ?? ""}
                    placeholder="When did you do this work? What did you actually do, and what came of it?"
                    className="w-full rounded-md border border-border bg-background p-4 leading-relaxed placeholder:text-muted-foreground"
                  />
                  <button className="mt-3 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                    Save this outcome
                  </button>
                </form>
              ) : (
                <p className="mt-4 whitespace-pre-wrap leading-relaxed">
                  {response?.narrative || "No narrative written."}
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-bold">Evidence</h3>
                {evidence.length > 0 ? (
                  <ul className="mt-2">
                    {evidence.map((e) => (
                      <li
                        key={e.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm odd:bg-background"
                      >
                        <span className="font-semibold">{e.title}</span>
                        <span className="flex items-baseline gap-4">
                          <span className="text-muted-foreground">{e.kind}</span>
                          {editable && (
                            <form action={removeEvidence.bind(null, e.id)}>
                              <button className="font-semibold text-destructive underline underline-offset-4">
                                Remove
                              </button>
                            </form>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nothing attached to this outcome yet.
                  </p>
                )}
                {editable && (
                  <form
                    action={addEvidence.bind(null, portfolio.id, outcome.id)}
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    <label htmlFor={`evidence-title-${i}`} className="sr-only">
                      Evidence name
                    </label>
                    <input
                      id={`evidence-title-${i}`}
                      name="title"
                      required
                      placeholder="File or document name, e.g. Holiday staffing plan 2024.xlsx"
                      className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
                    />
                    <label htmlFor={`evidence-kind-${i}`} className="sr-only">
                      Evidence type
                    </label>
                    <select
                      id={`evidence-kind-${i}`}
                      name="kind"
                      className="h-11 rounded-md border border-border bg-background px-3 text-sm"
                    >
                      {KINDS.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                    <button className="h-11 rounded-md bg-secondary px-5 text-sm font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px">
                      Add evidence
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {editable && (
        <div className="mt-10 rounded-lg bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Submit for evaluation</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            A faculty evaluator scores your portfolio against each outcome and
            issues a credit recommendation you can take to your college.
          </p>
          {done === total ? (
            <form action={submitPortfolio.bind(null, portfolio.id)} className="mt-5">
              <button className="rounded-md bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
                Submit portfolio
              </button>
            </form>
          ) : (
            <p className="mt-4 font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
              Document the remaining {total - done} outcome{total - done === 1 ? "" : "s"} to unlock submission.
            </p>
          )}
        </div>
      )}

      {canDecide && (
        <div className="mt-10 rounded-lg bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Your evaluation</h2>
          <form action={decidePortfolio.bind(null, portfolio.id)} className="mt-5 space-y-4">
            <div>
              <label htmlFor="score" className="mb-1.5 block text-sm font-semibold">
                Score (1–5)
              </label>
              <select id="score" name="score" className="h-11 rounded-md border border-border bg-background px-3">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="note" className="mb-1.5 block text-sm font-semibold">
                Evaluation note (shown to the learner)
              </label>
              <textarea
                id="note"
                name="note"
                rows={4}
                required
                className="w-full rounded-md border border-border bg-background p-4 leading-relaxed"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                name="decision"
                value="approve"
                className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
              >
                Recommend credit
              </button>
              <button
                name="decision"
                value="revisions"
                className="rounded-md bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px"
              >
                Request revisions
              </button>
              <button
                name="decision"
                value="deny"
                className="rounded-md bg-secondary px-6 py-3 font-semibold text-destructive hover:bg-muted active:translate-y-px"
              >
                Do not recommend
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="mt-10">
        <Link
          href={isOwner ? "/dashboard" : "/review"}
          className="font-semibold text-primary underline underline-offset-4"
        >
          {isOwner ? "Back to my learning" : "Back to the review queue"}
        </Link>
      </p>
    </div>
  );
}
