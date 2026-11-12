import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

// Everything SkillBridge holds about the signed-in person, as one JSON
// file: profile, enrollments and progress, portfolios with narratives,
// evidence records (file names and sizes; the files themselves download
// from the portfolio), payments, emails sent, and the audit trail of the
// account's own actions. Never secrets, hashes or other people's data.

export const runtime = "nodejs";

export async function GET() {
  if (!dbConfigured) return NextResponse.json({ error: "not available" }, { status: 503 });
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session?.mfaPending) return NextResponse.json({ error: "sign in" }, { status: 401 });
  if (await rateLimit("export", userId)) return NextResponse.json({ error: "too many exports; try again later" }, { status: 429 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, firstName: true, lastName: true, role: true, premium: true,
      emailVerifiedAt: true, termsAcceptedAt: true, termsVersion: true, totpEnabledAt: true, createdAt: true,
      oauthAccounts: { select: { provider: true } },
      enrollments: { select: { createdAt: true, course: { select: { code: true, title: true } }, progress: { select: { completedAt: true, lesson: { select: { title: true } } } } } },
      portfolios: {
        select: {
          id: true, status: true, score: true, decisionNote: true, submittedAt: true, decidedAt: true, verifyCode: true, createdAt: true,
          course: { select: { code: true, title: true, credits: true, outcomes: { select: { id: true, text: true } } } },
          responses: { select: { outcomeId: true, narrative: true, updatedAt: true } },
          evidence: { select: { outcomeId: true, title: true, kind: true, note: true, fileName: true, fileSize: true, fileType: true, createdAt: true } },
        },
      },
      payments: { select: { amountUSD: true, verified: true, refundedAt: true, createdAt: true } },
      auditLogs: { select: { action: true, target: true, detail: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  const emails = await db.email.findMany({ where: { to: user.email }, select: { subject: true, sentVia: true, createdAt: true }, orderBy: { createdAt: "asc" } });

  await db.auditLog.create({ data: { userId, action: "account.export", target: userId } });
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), service: "SkillBridge", ...user, emails }, null, 2);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="skillbridge-data-${userId}.json"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
