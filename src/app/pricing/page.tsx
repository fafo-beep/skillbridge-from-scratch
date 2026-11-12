import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { PLANS, PRICING_FAQ } from "@/lib/plans";
import PlanTable from "@/components/PlanTable";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free to join, with one faculty evaluation included. One payment of $99 for every pathway and every evaluation after that.",
};

// Public pricing. The action at the bottom of each card depends on who is
// looking: a visitor joins, a free member upgrades, a member on the full
// plan sees that they are.
export default async function PricingPage() {
  const session = dbConfigured ? await auth() : null;
  const me = session?.user?.id ? await db.user.findUnique({ where: { id: session.user.id }, select: { premium: true } }) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">Pricing</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight sm:text-5xl">Free to start. One payment for everything.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Join free and have one portfolio evaluated by faculty. When you want more, pay ${PLANS.full.price} once for every pathway and every evaluation. No subscription, nothing recurring, nothing to cancel.
      </p>

      <div className="mt-10">
        <PlanTable
          freeAction={
            me ? (
              <span className="font-semibold">{me.premium ? "Included" : "Your plan"}</span>
            ) : (
              <Link href="/join" className="inline-block whitespace-nowrap rounded-md bg-background px-3 py-2 font-semibold text-primary hover:bg-muted active:translate-y-px">
                Join Free
              </Link>
            )
          }
          fullAction={
            me?.premium ? (
              <span className="font-semibold">Your plan</span>
            ) : me ? (
              <Link href="/upgrade" className="inline-block whitespace-nowrap rounded-md bg-background px-3 py-2 font-semibold text-primary hover:bg-secondary active:translate-y-px">
                Upgrade
              </Link>
            ) : (
              <Link href="/join" className="inline-block whitespace-nowrap rounded-md bg-background px-3 py-2 font-semibold text-primary hover:bg-secondary active:translate-y-px">
                Get Started
              </Link>
            )
          }
        />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Secure checkout by Stripe. SkillBridge does not award credit; only colleges do. We build the portfolio and the evaluation your school needs to say yes.
      </p>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Questions about paying</h2>
        <dl className="mt-6 divide-y divide-border">
          {PRICING_FAQ.map(({ q, a }) => (
            <div key={q} className="py-5">
              <dt className="font-bold">{q}</dt>
              <dd className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
