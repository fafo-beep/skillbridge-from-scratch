// Interface fragments: real pieces of the product, cropped for the
// marketing pages. Marked data-ui — they keep their own table lines and
// conventions, and they are the honest pictures of a software product.

export function EvaluationFragment() {
  const rows = [
    { code: "BUS301", title: "Principles of Management", credits: 3 },
    { code: "BUS215", title: "Retail Operations", credits: 3 },
    { code: "HR205", title: "Human Resource Practices", credits: 3 },
  ];
  return (
    <div data-ui className="rounded-md bg-card text-card-foreground">
      <div className="px-6 pb-4 pt-6">
        <p className="text-sm text-muted-foreground">Sample credit evaluation</p>
        <p className="mt-1 text-lg font-bold">
          Source of learning: 8 years as shift supervisor, then store manager
        </p>
      </div>
      <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr className="border-y text-muted-foreground">
            <th className="py-2.5 pl-6 text-left font-semibold">Course</th>
            <th className="py-2.5 text-left font-semibold">Title</th>
            <th className="py-2.5 text-right font-semibold">Credits</th>
            <th className="py-2.5 pr-6 text-right font-semibold">Finding</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="border-b">
              <td className="py-3 pl-6">{r.code}</td>
              <td className="py-3 pr-3">{r.title}</td>
              <td className="py-3 text-right">{r.credits}</td>
              <td className="py-3 pr-6 text-right font-bold text-success">Recommended</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-6 py-5">
        <p className="text-sm text-muted-foreground">9 credits recommended</p>
        <p className="text-xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
          about $3,150 in tuition kept
        </p>
      </div>
    </div>
  );
}

export function PlayerFragment() {
  const lessons = [
    { title: "Delegation and trust", minutes: 40, state: "done" },
    { title: "Feedback that changes behavior", minutes: 45, state: "now" },
    { title: "Managing performance over time", minutes: 45, state: "next" },
  ];
  return (
    <div data-ui className="rounded-md bg-background text-foreground text-sm">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-3 pt-5">
        <p className="font-bold">Leading people</p>
        <p className="text-muted-foreground">Module 2 of 3</p>
      </div>
      <ul>
        {lessons.map((l) => (
          <li
            key={l.title}
            className={`flex items-baseline justify-between gap-4 px-5 py-3 ${
              l.state === "now" ? "bg-secondary font-bold" : "odd:bg-card"
            }`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span>{l.title}</span>
            <span className="shrink-0 text-muted-foreground">
              {l.state === "done" ? "Done" : `${l.minutes} min`}
            </span>
          </li>
        ))}
      </ul>
      <p className="px-5 py-4 text-muted-foreground">Picks up where you left off.</p>
    </div>
  );
}

export function ProgressFragment() {
  return (
    <div data-ui className="rounded-md bg-background text-foreground text-sm">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-3 pt-5">
        <p className="font-bold">MKT210 · Digital Marketing Fundamentals</p>
        <p className="text-muted-foreground">In progress</p>
      </div>
      <div className="px-5 pb-5">
        <div
          className="flex justify-between font-bold"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <span>3 of 7 lessons</span>
          <span>43%</span>
        </div>
        <div className="mt-2 h-2 rounded-md bg-muted">
          <div className="h-2 w-[43%] rounded-md bg-primary" />
        </div>
        <p className="mt-4 text-muted-foreground">
          Next: Writing a campaign brief · 40 min
        </p>
      </div>
    </div>
  );
}

export function DecisionFragment() {
  return (
    <div data-ui className="rounded-md bg-background text-foreground text-sm">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-4 pt-5">
        <p className="font-bold">Faculty evaluation</p>
        <p className="text-muted-foreground">Completed</p>
      </div>
      <div className="px-5 pb-4">
        <p className="text-muted-foreground">BUS301 · Principles of Management</p>
        <p className="mt-1 text-2xl font-bold">3 credits recommended</p>
      </div>
      <div className="mx-5 mb-4 rounded-md bg-card p-4 leading-relaxed">
        <p>
          &quot;The staffing plans and budget records demonstrate each outcome
          at course level. Clear, well-evidenced portfolio.&quot;
        </p>
        <p className="mt-2 text-muted-foreground">Prof. David Otieno, evaluator</p>
      </div>
      <div
        className="flex items-center justify-between px-5 pb-5"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <p className="text-muted-foreground">Score 4.2 / 5</p>
        <p className="font-bold">Ready to send to your college</p>
      </div>
    </div>
  );
}

export function EvidenceFragment() {
  const files = [
    ["Holiday staffing plan 2024.xlsx", "Spreadsheet · outcome 2"],
    ["Store P&L summary, Q4.pdf", "Report · outcomes 1 and 2"],
    ["Performance review — M. Reyes.pdf", "Manager review · outcome 3"],
    ["Food safety certification.pdf", "Certificate · outcome 3"],
  ] as const;
  return (
    <div data-ui className="rounded-md bg-background text-foreground text-sm">
      <div className="flex items-baseline justify-between gap-4 px-5 pb-3 pt-5">
        <p className="font-bold">Evidence</p>
        <p className="text-muted-foreground">4 files attached</p>
      </div>
      <ul>
        {files.map(([name, note]) => (
          <li
            key={name}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-5 py-3 odd:bg-card"
          >
            <span className="font-semibold">{name}</span>
            <span className="text-muted-foreground">{note}</span>
          </li>
        ))}
      </ul>
      <p className="px-5 py-4 text-muted-foreground">
        Every file is tied to the outcome it proves.
      </p>
    </div>
  );
}
