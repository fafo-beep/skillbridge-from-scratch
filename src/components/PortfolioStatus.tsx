// The state of a credit portfolio, shown where it matters: at the top of
// the portfolio page and on each dashboard card. A submission is a real
// event in a learner's life, so it gets a mark, a date, a three-step
// track (Submitted, Evaluation, Decision) and a plain account of what
// happens next. Colours come from the semantic tokens; no ornament.

type Status = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "REVISIONS_REQUESTED" | "APPROVED" | "DENIED";

type Props = {
  status: Status;
  submittedAt?: Date | null;
  decidedAt?: Date | null;
  credits?: number;
  score?: number | null;
  compact?: boolean;
};

const DATE = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

const HEADLINE: Record<Status, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under evaluation",
  REVISIONS_REQUESTED: "Revisions requested",
  APPROVED: "Credit recommended",
  DENIED: "Not approved",
};

function Check({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Mark({ status }: { status: Status }) {
  // One mark per state: a check for anything accomplished, a dash for a
  // stop, an open ring for work still in the learner's hands.
  const tone =
    status === "APPROVED"
      ? "bg-success text-primary-foreground"
      : status === "DENIED"
        ? "bg-destructive text-primary-foreground"
        : status === "SUBMITTED" || status === "UNDER_REVIEW"
          ? "bg-primary text-primary-foreground"
          : "border-2 border-border text-muted-foreground";
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
      {status === "DENIED" ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="M6 12h12" />
        </svg>
      ) : status === "DRAFT" || status === "REVISIONS_REQUESTED" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
        </svg>
      ) : (
        <Check />
      )}
    </span>
  );
}

function Track({ status }: { status: Status }) {
  // Three stations. Each is done, current, or ahead. Submitting completes
  // the first; evaluation is current until a decision completes the last.
  const stage = status === "DRAFT" ? 1 : status === "SUBMITTED" || status === "UNDER_REVIEW" ? 2 : 4;
  const steps = [
    { label: "Submitted", i: 1 },
    { label: "Evaluation", i: 2 },
    { label: status === "REVISIONS_REQUESTED" ? "Revisions" : "Decision", i: 3 },
  ];
  return (
    <ol className="mt-6 flex items-start" aria-label="Progress">
      {steps.map((s, idx) => {
        const done = stage > s.i;
        const current = stage === s.i;
        const ring = done
          ? "bg-primary text-primary-foreground"
          : current
            ? "border-2 border-primary bg-background text-primary"
            : "border-2 border-border bg-background text-muted-foreground";
        return (
          <li key={s.label} className={`flex items-start ${idx < steps.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${ring}`}
                aria-current={current ? "step" : undefined}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {done ? <Check size={16} /> : s.i}
              </span>
              <span className={`mt-2 whitespace-nowrap text-xs font-semibold ${done || current ? "" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span className={`mx-2 mt-4 h-0.5 flex-1 rounded-full ${stage > s.i ? "bg-primary" : "bg-border"}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function next(status: Status): string {
  switch (status) {
    case "DRAFT":
      return "Write each outcome and attach the files that prove it. Submit unlocks when every outcome is documented.";
    case "SUBMITTED":
      return "Your portfolio is in the queue. A faculty evaluator claims it, reads every outcome and file, scores it from 1 to 5 and writes you a note. You will get an email the moment there is a decision.";
    case "UNDER_REVIEW":
      return "An evaluator has your portfolio open now. You will get an email the moment there is a decision.";
    case "REVISIONS_REQUESTED":
      return "Read the evaluator's note, strengthen the outcomes it names, and submit again. The same evaluator does not have to take it; it goes back to the queue.";
    case "APPROVED":
      return "Download the PDF and take it to your college's registrar or prior learning office. Only the college awards the credit.";
    case "DENIED":
      return "Read the evaluator's note. You can start a new portfolio for a different course at any time.";
  }
}

export default function PortfolioStatus({ status, submittedAt, decidedAt, credits, score, compact = false }: Props) {
  const when =
    status === "APPROVED" || status === "DENIED" || status === "REVISIONS_REQUESTED"
      ? decidedAt && `Decided ${DATE.format(decidedAt)}`
      : status === "SUBMITTED" || status === "UNDER_REVIEW"
        ? submittedAt && `Submitted ${DATE.format(submittedAt)}`
        : null;
  const result =
    status === "APPROVED" && credits != null
      ? `${credits} credits${score != null ? ` · score ${score} of 5` : ""}`
      : status === "DENIED" && score != null
        ? `Score ${score} of 5`
        : null;
  const date = when && (status === "APPROVED" || status === "DENIED" || status === "REVISIONS_REQUESTED" ? decidedAt && DATE.format(decidedAt) : submittedAt && DATE.format(submittedAt));

  if (compact) {
    return (
      <div className="mt-4 flex items-center gap-3" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span className="scale-[0.67] origin-left">
          <Mark status={status} />
        </span>
        <span className="-ml-3">
          <span className="font-bold">{HEADLINE[status]}</span>
          {(result ?? date) && <span className="text-muted-foreground"> · {result ?? date}</span>}
        </span>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-lg bg-card p-6 sm:p-8" aria-label="Portfolio status">
      <div className="flex items-start gap-4">
        <Mark status={status} />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-tight">{HEADLINE[status]}</h2>
          {(result ?? when) && (
            <p className="mt-1 font-semibold text-secondary-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {result ?? when}
              {result && when && <span className="text-muted-foreground"> · {when}</span>}
            </p>
          )}
        </div>
      </div>
      <Track status={status} />
      <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{next(status)}</p>
    </section>
  );
}
