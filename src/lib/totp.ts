import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Time-based one-time passwords (RFC 6238) for two-step sign-in, with the
// secret encrypted at rest. No dependency: HMAC-SHA1 over a 30-second
// step, six digits, as every authenticator app expects.

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Uint8Array {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of clean) {
    value = (value << 5) | B32.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(out);
}

export function newTotpSecret(): string {
  return base32Encode(randomBytes(20)); // 160 bits, the RFC's recommended size
}

export function totpStep(now = Date.now()): number {
  return Math.floor(now / 1000 / 30);
}

export function totpCode(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = createHmac("sha1", Buffer.from(base32Decode(secret))).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const bin = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(bin % 1_000_000).padStart(6, "0");
}

// Accepts the current step and one either side (clock drift), and tells
// the caller which step matched so it can refuse a replay of the same code.
export function verifyTotp(secret: string, input: string, lastUsedStep: number | null, now = Date.now()): number | null {
  const code = input.replace(/\D/g, "");
  if (code.length !== 6) return null;
  const current = totpStep(now);
  for (const step of [current, current - 1, current + 1]) {
    if (lastUsedStep != null && step <= lastUsedStep) continue;
    const expected = totpCode(secret, step);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return step;
  }
  return null;
}

export function otpauthUri(secret: string, email: string): string {
  return `otpauth://totp/${encodeURIComponent("SkillBridge")}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent("SkillBridge")}&algorithm=SHA1&digits=6&period=30`;
}

// ── Secret at rest: AES-256-GCM under a key derived from AUTH_SECRET ─────

function key(): Buffer {
  const base = process.env.AUTH_SECRET;
  if (!base) throw new Error("AUTH_SECRET must be set for two-step sign-in");
  return createHash("sha256").update(`${base}:totp-secret`).digest();
}

export function sealSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}

export function openSecret(sealed: string): string {
  const [iv, tag, ct] = sealed.split(".").map((p) => Buffer.from(p, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

// ── Recovery codes: shown once, stored hashed, used once ─────────────────

const RC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const bytes = randomBytes(10);
    let s = "";
    for (const b of bytes) s += RC[b % RC.length];
    return `${s.slice(0, 5)}-${s.slice(5)}`;
  });
}

export function hashRecoveryCode(code: string): string {
  const norm = code.toUpperCase().replace(/[^A-Z2-9]/g, "");
  return createHash("sha256").update(`recovery:${norm}`).digest("hex");
}
