import type { Metadata } from "next";
import Link from "next/link";
import { db, dbConfigured } from "@/lib/db";
import { normalizeVerifyCode } from "@/lib/credential";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// The public record behind a verification code. No sign-in: a registrar
// holding the PDF can confirm it. It shows only what the document already
// states, and nothing else about the learner.

export const metadata: Metadata = { title: "Credit recommendation", robots: { index: false } };

const DATE = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

export default async function CredentialPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: raw } = await params;
  const code = normalizeVerifyCode(decodeURIComponent(raw));
  const wait = await rateLimit("credential", await clientIp());

  const portfolio =
    code && dbConfigured && !wait
      ? await db.portfolio.findUnique({
          where: { verifyCode: code },
          include: {
            course: { select: { code: true, title: true, credits: true } },
            user: { select: { name: true } },
          },
        })
      : null;
  const evaluator =
    portfolio?.evaluatorId
      ? await db.user.findUnique({ where: { id: portfolio.evaluatorId }, select: { name: true } })
      : null;
  const valid = !!portfolio && portfolio.status === "APPROVED";

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">Credit recommendation verification</p>
      {wait ? (
        <>
          <h1 className="mt-1 text-3xl font-bold leading-tight">Too many lookups</h1>
          <p className="mt-4 leading-relaxed">Please wait a few minutes and try again.</p>
        </>
      ) : valid ? (
        <>
          <div className="mt-3 flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-primary-foreground">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <div>
              <h1 className="text-3xl font-bold leading-tight">Genuine</h1>
              <p className="mt-1 text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>Code {code}</p>
            </div>
          </div>
          <dl className="mt-8 divide-y divide-border rounded-lg bg-card" style={{ fontVariantNumeric: "tabular-nums" }}>
            {[
              ["Learner", portfolio!.user.name ?? "Name withheld"],
              ["Course", `${portfolio!.course.code} ${portfolio!.course.title}`],
              ["Recommendation", `${portfolio!.course.credits} credits`],
              ["Score", portfolio!.score != null ? `${portfolio!.score} of 5` : "Not recorded"],
              ["Evaluator", evaluator?.name ?? "Faculty evaluator"],
              ["Decided", portfolio!.decidedAt ? DATE.format(portfolio!.decidedAt) : "Not recorded"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            This record matches a faculty evaluator&apos;s recommendation held by SkillBridge. It is not an award of credit; the receiving college decides under its own prior learning policy. If the printed document differs from this page, treat the document as altered.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1 text-3xl font-bold leading-tight">No recommendation matches this code</h1>
          <p className="mt-4 leading-relaxed">
            Check the code against the document; it has sixteen letters and digits with no O, I or L. If it still does not match, the document was not issued by SkillBridge or its recommendation has been withdrawn.
          </p>
        </>
      )}
      <p className="mt-8">
        <Link href="/credential" className="font-semibold text-primary hover:text-accent">
          Check Another Code
        </Link>
      </p>
    </div>
  );
}
