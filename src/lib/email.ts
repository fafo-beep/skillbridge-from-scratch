import { db } from "@/lib/db";

// Outgoing email. With RESEND_API_KEY set, messages go through Resend's
// HTTP API; every message is also recorded in the Email table, which is
// the "outbox" development and CI read links from when no provider exists.

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "SkillBridge <onboarding@resend.dev>";
// Without a provider, the outbox counts as delivery only when EMAIL_OUTBOX=1
// is set explicitly (development, CI). A real deployment that forgot to
// configure email gets a redacted record and a log line, never a live link.
const OUTBOX_DELIVERS = !emailConfigured && process.env.EMAIL_OUTBOX === "1";

export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  let sentVia = "outbox";
  if (emailConfigured) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("email send failed", res.status, body.slice(0, 300));
    } else {
      sentVia = "resend";
    }
  } else if (OUTBOX_DELIVERS) {
    console.log(`[email outbox] to=${to} subject=${JSON.stringify(subject)}\n${text}`);
  } else {
    console.error(`email not sent (no provider configured): to=${to} subject=${JSON.stringify(subject)}`);
  }
  // The stored copy has token links redacted, so neither a database read
  // nor a platform log can recover a live reset or verify link. Only in
  // development and CI, where the outbox IS the delivery channel, is the
  // full text kept.
  const stored = OUTBOX_DELIVERS ? text : text.replace(/\/(verify|reset)\/[A-Za-z0-9_-]+/g, "/$1/[redacted]");
  await db.email.create({ data: { to, subject, text: stored, sentVia } });
}
