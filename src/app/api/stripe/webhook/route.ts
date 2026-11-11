import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeConfigured, PREMIUM_PRICE_USD } from "@/lib/stripe";
import { db, dbConfigured } from "@/lib/db";

// Stripe webhook. The ONLY place premium is granted, and the place it is
// withdrawn again after a refund or dispute. Signature-verified,
// idempotent, and tolerant of Stripe's retries and out-of-order delivery.
//
// A paid Checkout Session only counts when this app created it: the
// Payment row written by startCheckout must already exist, the amount and
// currency must match the plan, and premium goes to the user on that row,
// never to anything the event carries. Stripe sends this endpoint every
// session in the account, including Payment Links where the public URL
// can carry any client_reference_id, so none of that is trusted.

const ok = (extra?: Record<string, string>) => NextResponse.json({ received: true, ...extra });

export async function POST(req: Request) {
  if (!stripeConfigured || !dbConfigured) {
    return NextResponse.json({ error: "payments not configured" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return grant(event.data.object, event.type);
    case "charge.refunded":
    case "charge.dispute.created":
      return revoke(event.data.object, event.type);
    default:
      return ok();
  }
}

async function grant(session: Stripe.Checkout.Session, type: string) {
  if (session.payment_status !== "paid") return ok();

  const payment = await db.payment.findUnique({ where: { stripeSessionId: session.id } });
  if (!payment) {
    await db.auditLog.create({
      data: { action: "payment.ignored", target: session.id, detail: `${type}: session not created by this app` },
    });
    return ok({ ignored: "unknown session" });
  }

  const amount = session.amount_total ?? 0;
  const currency = (session.currency ?? "").toLowerCase();
  const metaUser = session.metadata?.userId;
  if (currency !== "usd" || amount < PREMIUM_PRICE_USD * 100 || (metaUser && metaUser !== payment.userId)) {
    await db.auditLog.create({
      data: {
        userId: payment.userId,
        action: "payment.rejected",
        target: session.id,
        detail: `${type}: amount=${amount} currency=${currency} metaUser=${metaUser ?? "none"}`,
      },
    });
    return ok({ ignored: "session does not match the plan" });
  }

  const intent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Atomic idempotency: only the delivery that flips verified grants premium.
  await db.$transaction(async (tx) => {
    const flipped = await tx.payment.updateMany({
      where: { id: payment.id, verified: false },
      data: { verified: true, paymentIntentId: intent, amountUSD: Math.round(amount / 100) },
    });
    if (flipped.count !== 1) return;
    await tx.user.updateMany({ where: { id: payment.userId }, data: { premium: true } });
    await tx.auditLog.create({
      data: { userId: payment.userId, action: "payment.verified", target: session.id, detail: `stripe ${type} amount=${amount}` },
    });
  });
  return ok();
}

async function revoke(obj: Stripe.Charge | Stripe.Dispute, type: string) {
  const intent = typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent?.id ?? null;
  if (!intent) return ok({ ignored: "no payment intent" });

  // A partial refund still counts: the plan is a single purchase.
  const payment = await db.payment.findUnique({ where: { paymentIntentId: intent } });
  if (!payment) return ok({ ignored: "unknown payment" });

  await db.$transaction(async (tx) => {
    const flipped = await tx.payment.updateMany({
      where: { id: payment.id, refundedAt: null },
      data: { refundedAt: new Date() },
    });
    if (flipped.count !== 1) return;
    const stillPaid = await tx.payment.count({ where: { userId: payment.userId, verified: true, refundedAt: null } });
    if (stillPaid === 0) {
      await tx.user.updateMany({ where: { id: payment.userId }, data: { premium: false } });
    }
    await tx.auditLog.create({
      data: { userId: payment.userId, action: "payment.revoked", target: payment.stripeSessionId, detail: `stripe ${type} intent=${intent}` },
    });
  });
  return ok();
}
