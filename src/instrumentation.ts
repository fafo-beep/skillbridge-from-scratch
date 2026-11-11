import type { Instrumentation } from "next";

// Error monitoring. Every server-side request error is recorded in the
// ErrorLog table (shown on /admin) and printed to the platform log. When
// SENTRY_DSN is set, the same hook is where a Sentry client would be
// called; the database record works without any external account.

export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
  const error = err as { message?: string; digest?: string; stack?: string };
  const message = String(error?.message ?? err).slice(0, 1000);
  console.error("[request error]", request.path, message);
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { db, dbConfigured } = await import("@/lib/db");
    if (!dbConfigured) return;
    await db.errorLog.create({
      data: {
        message,
        digest: String(error?.digest ?? "").slice(0, 100),
        path: String(request.path ?? "").slice(0, 500),
        stack: String(error?.stack ?? "").slice(0, 4000),
      },
    });
  } catch {
    // never let monitoring throw
  }
};
