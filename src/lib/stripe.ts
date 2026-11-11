import Stripe from "stripe";

// Stripe client. Payments switch on when STRIPE_SECRET_KEY and
// STRIPE_WEBHOOK_SECRET are set; until then the upgrade page says so.
// Premium is granted ONLY by the webhook handler after signature
// verification, never from the success redirect, never from the client.

export const stripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
);

export const PREMIUM_PRICE_USD = 99;

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}
