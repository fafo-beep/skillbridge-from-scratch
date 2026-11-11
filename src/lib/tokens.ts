import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

// Single-use security tokens. Only a SHA-256 hash is stored; the raw
// token travels in the emailed link once. Issuing a new token for a
// purpose invalidates that user's earlier unused ones.

export type TokenPurpose = "verify" | "reset";

const TTL_MS: Record<TokenPurpose, number> = {
  verify: 24 * 60 * 60 * 1000,
  reset: 60 * 60 * 1000,
};

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function issueToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await db.$transaction([
    db.securityToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    }),
    db.securityToken.create({
      data: {
        userId,
        purpose,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + TTL_MS[purpose]),
      },
    }),
  ]);
  return raw;
}

// Marks the token used and returns its user id, or null if it is
// unknown, expired, already used, or for another purpose. The consume
// is an atomic conditional update, so a token cannot be used twice.
export async function consumeToken(raw: string, purpose: TokenPurpose): Promise<string | null> {
  if (!raw || raw.length > 200) return null;
  const tokenHash = hashToken(raw);
  const result = await db.securityToken.updateMany({
    where: { tokenHash, purpose, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (result.count !== 1) return null;
  const token = await db.securityToken.findUnique({ where: { tokenHash }, select: { userId: true } });
  return token?.userId ?? null;
}
