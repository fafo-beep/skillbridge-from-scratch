import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import {
  ALLOWED_CONTENT_TYPES,
  ALLOWED_TYPES,
  MAX_UPLOAD_BYTES,
  extensionOf,
  isKeyFor,
  keyPrefix,
  looksLike,
  newKey,
  putLocal,
  storageMode,
} from "@/lib/storage";

// Two jobs, one route.
//
// Blob mode (Vercel): the browser asks for a client token, this handler
// checks the session and that the target portfolio and outcome belong to
// the caller and are still editable, then issues a token that only allows
// one upload under evidence/<portfolio>/<outcome>/, of an accepted type,
// at most 25 MB, valid for ten minutes. The bytes go straight to the
// private store and never pass through a function.
//
// Local mode (development, CI): the file itself is posted here and
// written to UPLOAD_DIR after the same checks plus a magic-number test.
//
// Either way, nothing becomes evidence until attachUpload confirms it.

export const runtime = "nodejs";

async function ownerCanEdit(userId: string, portfolioId: string, outcomeId: string): Promise<boolean> {
  const portfolio = await db.portfolio.findFirst({
    where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
    include: { course: { select: { outcomes: { select: { id: true } } } } },
  });
  return !!portfolio && portfolio.course.outcomes.some((o) => o.id === outcomeId);
}

export async function POST(req: Request) {
  const mode = storageMode();
  if (!dbConfigured || mode === "off") return NextResponse.json({ error: "uploads are not enabled" }, { status: 503 });
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "sign in" }, { status: 401 });

  if (mode === "blob") {
    const body = (await req.json()) as HandleUploadBody;
    try {
      const result = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const scope = parseScope(clientPayload);
          if (!scope) throw new Error("missing scope");
          if (!isKeyFor(pathname, scope.portfolioId, scope.outcomeId)) throw new Error("path outside scope");
          if (!extensionOf(pathname)) throw new Error("file type not accepted");
          if (!(await ownerCanEdit(userId, scope.portfolioId, scope.outcomeId))) throw new Error("not editable");
          return {
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: true,
            allowOverwrite: false,
            validUntil: Date.now() + 10 * 60 * 1000,
            tokenPayload: JSON.stringify({ userId, prefix: keyPrefix(scope.portfolioId, scope.outcomeId) }),
          };
        },
      });
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  // Local mode: the file comes through this process.
  const form = await req.formData();
  const file = form.get("file");
  const portfolioId = String(form.get("portfolioId") ?? "");
  const outcomeId = String(form.get("outcomeId") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });
  const ext = extensionOf(file.name);
  if (!ext) return NextResponse.json({ error: "file type not accepted" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "file too large" }, { status: 413 });
  if (!(await ownerCanEdit(userId, portfolioId, outcomeId))) return NextResponse.json({ error: "not editable" }, { status: 403 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLike(ext, bytes)) return NextResponse.json({ error: "file content does not match its type" }, { status: 400 });
  const key = newKey(portfolioId, outcomeId, file.name);
  await putLocal(key, bytes, ALLOWED_TYPES[ext]);
  return NextResponse.json({ key, name: file.name, size: file.size });
}

function parseScope(payload: string | null): { portfolioId: string; outcomeId: string } | null {
  try {
    const p = JSON.parse(payload ?? "") as { portfolioId?: unknown; outcomeId?: unknown };
    if (typeof p.portfolioId !== "string" || typeof p.outcomeId !== "string") return null;
    if (!/^[a-z0-9]{10,40}$/.test(p.portfolioId) || !/^[a-z0-9]{10,40}$/.test(p.outcomeId)) return null;
    return { portfolioId: p.portfolioId, outcomeId: p.outcomeId };
  } catch {
    return null;
  }
}
