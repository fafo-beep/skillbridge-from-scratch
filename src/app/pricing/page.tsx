import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { PLANS, PRICING_FAQ } from "@/lib/plans";
import PlanCard from "@/components/PlanCard";

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
  const btn = "inline-block rounded-md px-6 py-3 text-center font-semibold active:translate-y-px";

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <p className="text-sm font-semibold text-muted-foreground">Pricing</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight sm:text-5xl">Free to start. One payment for everything.</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Join free and have one portfolio evaluated by faculty. When you want more, pay ${PLANS.full.price} once for every pathway and every evaluation. No subscription, nothing recurring, nothing to cancel.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <PlanCard
          {...PLANS.free}
          footer={
            me ? (
              <p className="text-sm font-semibold text-muted-foreground">{me.premium ? "Included in your plan" : "Your current plan"}</p>
            ) : (
              <Link href="/join" className={`${btn} w-full bg-secondary text-secondary-foreground hover:bg-muted sm:w-auto`}>
                Create a Free Account
              </Link>
            )
          }
        />
        <PlanCard
          {...PLANS.full}
          highlight
          footer={
            me?.premium ? (
              <p className="font-bold">You&apos;re on the full plan.</p>
            ) : me ? (
              <Link href="/upgrade" className={`${btn} w-full bg-background text-primary hover:bg-secondary sm:w-auto`}>
                Upgrade for ${PLANS.full.price}
              </Link>
            ) : (
              <Link href="/join" className={`${btn} w-full bg-background text-primary hover:bg-secondary sm:w-auto`}>
                Join Free, Upgrade Any Time
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
