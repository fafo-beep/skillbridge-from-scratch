import { headers } from "next/headers";
import { db, dbConfigured } from "@/lib/db";

// Fixed-window rate limiting backed by the database, so it holds across
// serverless instances. Keys combine an action with the caller's IP
// and/or the targeted account. Fails open if the database is down: a
// limiter must never be the thing that takes sign-in offline.

export type Limit = { limit: number; windowSec: number };

export const LIMITS = {
  login: { limit: 10, windowSec: 15 * 60 },
  register: { limit: 5, windowSec: 60 * 60 },
  checkEmail: { limit: 30, windowSec: 15 * 60 },
  reset: { limit: 3, windowSec: 60 * 60 },
  verifyResend: { limit: 3, windowSec: 60 * 60 },
} as const satisfies Record<string, Limit>;

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
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
    if (row.count > limit) return (window + 1) * windowSec - now;
    return null;
  } catch {
    return null;
  }
}

export function retryMessage(seconds: number): string {
  const m = Math.max(1, Math.ceil(seconds / 60));
  return `Too many attempts. Try again in ${m} minute${m === 1 ? "" : "s"}.`;
}
