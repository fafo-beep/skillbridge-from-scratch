import { headers } from "next/headers";
import { db, dbConfigured } from "@/lib/db";

// Fixed-window rate limiting backed by the database, so it holds across
// serverless instances. Keys combine an action with the caller's IP
// and/or the targeted account. Fails open if the database is down: a
// limiter must never be the thing that takes sign-in offline.

export type Limit = { limit: number; windowSec: number };

export const LIMITS = {
  login: { limit: 10, windowSec: 15 * 60 },
  loginAccount: { limit: 30, windowSec: 60 * 60 },
  register: { limit: 5, windowSec: 60 * 60 },
  checkEmail: { limit: 30, windowSec: 15 * 60 },
  reset: { limit: 3, windowSec: 60 * 60 },
  verifyResend: { limit: 3, windowSec: 60 * 60 },
} as const satisfies Record<string, Limit>;

export function ipFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}

// Returns null when allowed, otherwise the number of seconds until the
// window resets.
export async function rateLimit(name: keyof typeof LIMITS, subject: string): Promise<number | null> {
  if (!dbConfigured) return null;
  const { limit, windowSec } = LIMITS[name];
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSec);
  const key = `${name}:${subject}`;
  try {
    const row = await db.rateLimit.upsert({
      where: { key_window: { key, window } },
      update: { count: { increment: 1 } },
      create: { key, window, count: 1 },
    });
    // Housekeeping: now and then drop windows that can no longer matter,
    // so the table stays small without a scheduler.
    if (row.count === 1 && Math.random() < 0.02) {
      await db.rateLimit.deleteMany({ where: { window: { lt: window - 1 } } });
    }
    if (row.count > limit) return (window + 1) * windowSec - now;
    return null;
  } catch {
    return null;
  }
}

// Forgets the current window for a subject, so a successful sign-in by
// the real owner never counts toward locking that owner out.
export async function clearRateLimit(name: keyof typeof LIMITS, subject: string): Promise<void> {
  if (!dbConfigured) return;
  try {
    await db.rateLimit.deleteMany({ where: { key: `${name}:${subject}` } });
  } catch {
    // best effort
  }
}

export function retryMessage(seconds: number): string {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return `Too many attempts. Try again in ${m} minute${m === 1 ? "" : "s"}.`;
}
