import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { newVerifyCode } from "@/lib/credential";
import { siteOrigin } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The portfolio as a document: everything the evaluator read plus the
// decision, for the learner to take to their college. Owners need the
// full plan (the upgrade page promises this); assigned evaluators and
// admins can always export. Same read scope as the portfolio page.

const DECISION: Record<string, string> = {
  APPROVED: "Credit recommended",
  DENIED: "Credit not recommended",
  REVISIONS_REQUESTED: "Revisions requested",
  SUBMITTED: "Submitted, awaiting evaluation",
  UNDER_REVIEW: "Under faculty review",
  DRAFT: "Draft",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!dbConfigured) return NextResponse.json({ error: "not available" }, { status: 503 });
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) return NextResponse.json({ error: "sign in" }, { status: 401 });

  const portfolio = await db.portfolio.findUnique({
    where: { id },
    include: {
      course: { include: { outcomes: { orderBy: { position: "asc" } }, category: true } },
      responses: true,
      evidence: { orderBy: { createdAt: "asc" } },
      user: { select: { id: true, name: true, email: true, premium: true } },
    },
  });
  if (!portfolio) return NextResponse.json({ error: "not found" }, { status: 404 });

  const viewer = await db.user.findUnique({ where: { id: viewerId } });
  const isOwner = portfolio.userId === viewerId;
  // Staff export the same cases they may read: an evaluator's own claimed
  // or decided reviews. Admins share that scope; drafts and revisions in
  // progress belong to the learner alone.
  const staffVisible = ["UNDER_REVIEW", "APPROVED", "DENIED"].includes(portfolio.status);
  const enrolledStaff = !!viewer?.totpEnabledAt;
  const isStaff =
    !isOwner &&
    staffVisible &&
    enrolledStaff &&
    ((viewer?.role === "REVIEWER" && portfolio.evaluatorId === viewerId) || viewer?.role === "ADMIN");
  if (!isOwner && !isStaff) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (isOwner && !viewer?.premium) return NextResponse.json({ error: "full plan required" }, { status: 402 });

  // Approved recommendations issued before codes existed get one now.
  let verifyCode = portfolio.verifyCode;
  if (portfolio.status === "APPROVED" && !verifyCode) {
    verifyCode = newVerifyCode();
    await db.portfolio.updateMany({ where: { id: portfolio.id, verifyCode: null }, data: { verifyCode } });
    verifyCode = (await db.portfolio.findUnique({ where: { id: portfolio.id }, select: { verifyCode: true } }))?.verifyCode ?? verifyCode;
  }
  const origin = siteOrigin();

  const evaluator = portfolio.evaluatorId
    ? await db.user.findUnique({ where: { id: portfolio.evaluatorId }, select: { name: true } })
    : null;
  const byOutcome = new Map(portfolio.responses.map((r) => [r.outcomeId, r.narrative]));

  const doc = new PDFDocument({ size: "LETTER", margins: { top: 64, bottom: 64, left: 64, right: 64 }, info: { Title: `${portfolio.course.code} credit portfolio`, Author: "SkillBridge" } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const blue = "#0056D2";
  const ink = "#1b2430";
  const muted = "#4a5563";

  doc.fillColor(blue).font("Helvetica-Bold").fontSize(11).text("SkillBridge · Prior Learning Assessment portfolio");
  doc.moveDown(0.6);
  doc.fillColor(ink).fontSize(22).text(portfolio.course.title);
  doc.font("Helvetica").fontSize(11).fillColor(muted)
    .text(`${portfolio.course.code} · ${portfolio.course.category.name} · ${portfolio.course.credits} credits`);
  doc.moveDown(0.8);
  doc.fillColor(ink).font("Helvetica-Bold").text("Learner: ", { continued: true }).font("Helvetica").text(`${portfolio.user.name} (${portfolio.user.email})`);
  doc.font("Helvetica-Bold").text("Status: ", { continued: true }).font("Helvetica").text(DECISION[portfolio.status] ?? portfolio.status);
  if (portfolio.decidedAt) {
    doc.font("Helvetica-Bold").text("Decided: ", { continued: true }).font("Helvetica")
      .text(`${portfolio.decidedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}${evaluator ? ` by ${evaluator.name}` : ""}${portfolio.score != null ? ` · score ${portfolio.score}/5` : ""}`);
  }
  if (verifyCode) {
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fillColor(blue).text("Verification code: ", { continued: true }).font("Helvetica").fillColor(ink).text(verifyCode);
    doc.font("Helvetica").fillColor(muted).fontSize(10).text(`Confirm this recommendation at ${origin}/credential/${verifyCode}`);
    doc.fontSize(11);
  }
  if (portfolio.decisionNote) {
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").text("Evaluator's note");
    doc.font("Helvetica-Oblique").fillColor(ink).text(portfolio.decisionNote, { width: 480 });
  }

  for (const outcome of portfolio.course.outcomes) {
    doc.moveDown(1.2);
    doc.fillColor(blue).font("Helvetica-Bold").fontSize(13).text(outcome.text);
    doc.moveDown(0.3);
    doc.fillColor(ink).font("Helvetica").fontSize(11).text(byOutcome.get(outcome.id)?.trim() || "No narrative written.", { width: 480 });
    const evidence = portfolio.evidence.filter((e) => e.outcomeId === outcome.id);
    if (evidence.length) {
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").text("Evidence");
      doc.font("Helvetica");
      for (const e of evidence) {
        const size = e.fileSize != null ? `, file on record, ${e.fileSize < 1024 * 1024 ? `${Math.max(1, Math.round(e.fileSize / 1024))} KB` : `${(e.fileSize / 1024 / 1024).toFixed(1)} MB`}` : ", described, no file";
        doc.text(`• ${e.title} (${e.kind}${size})`, { indent: 10 });
      }
    }
  }

  doc.moveDown(1.5);
  doc.fillColor(muted).fontSize(9).font("Helvetica")
    .text("SkillBridge does not award college credit; only institutions do. This document records a faculty evaluator's recommendation against the stated course outcomes, prepared for review under the receiving college's Prior Learning Assessment policy.", { width: 480 });
  doc.text(`Portfolio ${portfolio.id} · generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}${verifyCode ? ` · verify at ${origin}/credential/${verifyCode}` : ""}`);
  doc.end();

  const pdf = await done;
  await db.auditLog.create({ data: { userId: viewerId, action: "portfolio.pdf", target: portfolio.id } });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="skillbridge-${portfolio.course.code}-portfolio.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
