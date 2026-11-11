import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { join, resolve, sep } from "node:path";

// Evidence file storage. On Vercel, files live in a private Blob store and
// the browser uploads straight to it with a short-lived token this server
// issues after checking who is asking. In development and CI, the same
// flow runs against a folder on disk (UPLOAD_DIR), so tests exercise the
// real code. Without either, uploads are switched off and the portfolio
// still works with described evidence.
//
// Files are never served from the store directly. Every download goes
// through /api/evidence/[id]/file, which checks the viewer's rights and
// sends the bytes as an attachment under a sandbox policy.

export type StorageMode = "blob" | "local" | "off";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

// Extension to content type. Only these may be uploaded; the type served
// on download comes from this table, never from the client.
export const ALLOWED_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  txt: "text/plain",
};
export const ALLOWED_CONTENT_TYPES = Array.from(new Set(Object.values(ALLOWED_TYPES)));
export const ACCEPT_ATTR = Object.keys(ALLOWED_TYPES).map((e) => `.${e}`).join(",");

export function storageMode(): StorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.UPLOAD_DIR) return "local";
  return "off";
}

// Keys look like evidence/<portfolioId>/<outcomeId>/<random>-<name>.<ext>.
// Ids are cuids (lowercase letters and digits), names are reduced to a
// safe alphabet, so a key can never climb out of its folder.
const KEY_RE = /^evidence\/[a-z0-9]{10,40}\/[a-z0-9]{10,40}\/[A-Za-z0-9._-]{1,160}$/;

export function keyPrefix(portfolioId: string, outcomeId: string): string {
  return `evidence/${portfolioId}/${outcomeId}/`;
}

export function isKeyFor(key: string, portfolioId: string, outcomeId: string): boolean {
  return KEY_RE.test(key) && key.startsWith(keyPrefix(portfolioId, outcomeId));
}

export function extensionOf(name: string): string | null {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(name);
  const ext = m?.[1].toLowerCase();
  return ext && ALLOWED_TYPES[ext] ? ext : null;
}

export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[.-]+/, "").slice(0, 120);
  return cleaned || "file";
}

export function newKey(portfolioId: string, outcomeId: string, originalName: string): string {
  return `${keyPrefix(portfolioId, outcomeId)}${randomBytes(6).toString("hex")}-${safeFileName(originalName)}`;
}

// A few magic numbers, checked where the bytes pass through this server.
export function looksLike(ext: string, head: Uint8Array): boolean {
  const h = Array.from(head.slice(0, 8));
  const starts = (...b: number[]) => b.every((v, i) => h[i] === v);
  switch (ext) {
    case "pdf":
      return starts(0x25, 0x50, 0x44, 0x46); // %PDF
    case "png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    case "jpg":
    case "jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "docx":
    case "xlsx":
    case "pptx":
      return starts(0x50, 0x4b, 0x03, 0x04); // zip
    default:
      return true; // csv, txt: any text
  }
}

export type StoredFile = { size: number; contentType: string };

// ── Local driver ─────────────────────────────────────────────────────────

function localRoot(): string {
  return resolve(process.env.UPLOAD_DIR ?? ".uploads");
}

function localPath(key: string): string {
  if (!KEY_RE.test(key)) throw new Error("bad key");
  const p = resolve(join(localRoot(), key));
  if (!p.startsWith(localRoot() + sep)) throw new Error("bad key");
  return p;
}

export async function putLocal(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const p = localPath(key);
  await mkdir(resolve(p, ".."), { recursive: true });
  await writeFile(p, bytes);
  await writeFile(`${p}.meta.json`, JSON.stringify({ contentType, sha256: createHash("sha256").update(bytes).digest("hex") }));
}

// ── Shared operations ────────────────────────────────────────────────────

export async function headFile(key: string): Promise<StoredFile | null> {
  if (!KEY_RE.test(key)) return null;
  const mode = storageMode();
  if (mode === "blob") {
    const { head } = await import("@vercel/blob");
    try {
      const b = await head(key);
      return { size: b.size, contentType: b.contentType };
    } catch {
      return null;
    }
  }
  if (mode === "local") {
    try {
      const p = localPath(key);
      const [st, meta] = await Promise.all([stat(p), readFile(`${p}.meta.json`, "utf8")]);
      return { size: st.size, contentType: JSON.parse(meta).contentType };
    } catch {
      return null;
    }
  }
  return null;
}

export async function openFile(key: string): Promise<{ stream: ReadableStream<Uint8Array>; size: number } | null> {
  if (!KEY_RE.test(key)) return null;
  const mode = storageMode();
  if (mode === "blob") {
    const { get } = await import("@vercel/blob");
    const r = await get(key, { access: "private", useCache: false });
    if (!r || r.statusCode !== 200) return null;
    return { stream: r.stream, size: r.blob.size };
  }
  if (mode === "local") {
    try {
      const p = localPath(key);
      const st = await stat(p);
      return { stream: Readable.toWeb(createReadStream(p)) as ReadableStream<Uint8Array>, size: st.size };
    } catch {
      return null;
    }
  }
  return null;
}

export async function deleteFile(key: string): Promise<void> {
  if (!KEY_RE.test(key)) return;
  const mode = storageMode();
  try {
    if (mode === "blob") {
      const { del } = await import("@vercel/blob");
      await del(key);
    } else if (mode === "local") {
      const p = localPath(key);
      await rm(p, { force: true });
      await rm(`${p}.meta.json`, { force: true });
    }
  } catch {
    // Best effort: the database row is already gone, the file is unreachable.
  }
}
