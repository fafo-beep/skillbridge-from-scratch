import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { openFile } from "@/lib/storage";

// The only way to read an evidence file. The viewer must be the learner
// who owns the portfolio, or staff entitled to the case: any evaluator for
// a submitted case in the queue, the assigned evaluator once claimed or
// decided, or an admin under the same rule. Everyone else gets the same
// 404 as a missing file. The bytes are sent as an attachment with a
// sandbox policy, so a crafted document cannot run in the app's origin.

export const runtime = "nodejs";

const STAFF_VISIBLE = new Set(["UNDER_REVIEW", "APPROVED", "DENIED"]);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!dbConfigured) return NextResponse.json({ error: "not available" }, { status: 503 });
  const { id } = await params;
  const session = await auth();
  const viewerId = session?.user?.id;
  if (!viewerId) return NextResponse.json({ error: "sign in" }, { status: 401 });

  const evidence = await db.evidence.findUnique({
    where: { id },
    include: { portfolio: { select: { userId: true, status: true, evaluatorId: true } } },
  });
  if (!evidence?.fileKey || !evidence.fileType) return NextResponse.json({ error: "not found" }, { status: 404 });

  const p = evidence.portfolio;
  const isOwner = p.userId === viewerId;
  let allowed = isOwner;
  if (!allowed) {
    const viewer = await db.user.findUnique({ where: { id: viewerId }, select: { role: true, totpEnabledAt: true } });
    const staff = (viewer?.role === "REVIEWER" || viewer?.role === "ADMIN") && !!viewer.totpEnabledAt;
    allowed =
      staff &&
      (p.status === "SUBMITTED" ||
        (STAFF_VISIBLE.has(p.status) && (p.evaluatorId === viewerId || viewer?.role === "ADMIN")));
  }
  if (!allowed) return NextResponse.json({ error: "not found" }, { status: 404 });

  const file = await openFile(evidence.fileKey);
  if (!file) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (!isOwner) {
    await db.auditLog.create({ data: { userId: viewerId, action: "evidence.download", target: evidence.id } });
  }

  const ascii = (evidence.fileName ?? "file").replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const utf8 = encodeURIComponent(evidence.fileName ?? "file");
  return new Response(file.stream, {
    headers: {
      "Content-Type": evidence.fileType,
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cache-Control": "private, no-store",
    },
  });
}
