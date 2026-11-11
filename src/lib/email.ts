import { db } from "@/lib/db";

// Outgoing email. With RESEND_API_KEY set, messages go through Resend's
// HTTP API; every message is also recorded in the Email table, which is
// the "outbox" development and CI read links from when no provider exists.

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "SkillBridge <onboarding@resend.dev>";

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
  } else {
    console.log(`[email outbox] to=${to} subject=${JSON.stringify(subject)}\n${text}`);
  }
  await db.email.create({ data: { to, subject, text, sentVia } });
}
