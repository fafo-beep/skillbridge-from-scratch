import { NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { db, dbConfigured } from "@/lib/db";

// Stripe webhook. The ONLY place premium is granted. Signature-verified,
// idempotent, and tolerant of Stripe's retries and out-of-order delivery.

export async function POST(req: Request) {
  if (!stripeConfigured || !dbConfigured) {
    return NextResponse.json({ error: "payments not configured" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status !== "paid") return NextResponse.json({ received: true });

    const userId = session.metadata?.userId ?? session.client_reference_id ?? null;
    const amount = session.amount_total ?? 0;
    if (!userId) return NextResponse.json({ received: true, ignored: "no user" });

    // Idempotent: a Payment row per checkout session; verified exactly once.
    const payment = await db.payment.upsert({
      where: { stripeSessionId: session.id },
      update: {},
      create: { userId, stripeSessionId: session.id, amountUSD: Math.round(amount / 100) },
    });
    if (!payment.verified) {
      await db.$transaction([
        db.payment.update({ where: { id: payment.id }, data: { verified: true } }),
        db.user.update({ where: { id: userId }, data: { premium: true } }),
        db.auditLog.create({
          data: {
            userId,
            action: "payment.verified",
            target: session.id,
            detail: `stripe ${event.type} amount=${amount}`,
          },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
