import Link from "next/link";
import type { LegalSection } from "@/lib/legal";
import { LEGAL } from "@/lib/legal";

export default function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        Effective {LEGAL.effectiveDate} · Version {LEGAL.version}
      </p>
      <p className="mt-6 text-lg leading-relaxed">{intro}</p>
      <nav aria-label="Sections" className="mt-8 rounded-lg bg-card p-5">
        <p className="font-bold">In this document</p>
        <ol className="mt-2 columns-1 gap-8 text-sm sm:columns-2">
          {sections.map((s, i) => (
            <li key={s.heading} className="py-0.5">
              <a href={`#s${i + 1}`} className="text-primary hover:text-primary">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.heading} id={`s${i + 1}`}>
            <h2 className="text-2xl font-bold">
              {i + 1}. {s.heading}
            </h2>
            {s.paragraphs.map((p, j) => (
              <p key={j} className="mt-3 leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <p className="mt-14 text-sm text-muted-foreground">
        Related:{" "}
        <Link href="/terms" className="font-semibold text-primary hover:text-accent">Terms of Service</Link>
        {" · "}
        <Link href="/acceptable-use" className="font-semibold text-primary hover:text-accent">Acceptable Use Policy</Link>
        {" · "}
        <Link href="/privacy" className="font-semibold text-primary hover:text-accent">Privacy Policy</Link>
      </p>
    </div>
  );
}
