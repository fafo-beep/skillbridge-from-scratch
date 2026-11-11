import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { startCheckout } from "@/lib/actions";
import { PREMIUM_PRICE_USD, stripeConfigured } from "@/lib/stripe";

export const metadata: Metadata = { title: "Upgrade" };

const INCLUDED = [
  "Unlimited credit portfolios and faculty evaluations",
  "Every course pathway, every field",
  "Evaluator notes and scores on each decision",
  "Every decided portfolio as a PDF to take to your college",
  "Priority support",
];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const session = dbConfigured ? await auth() : null;
  if (!session?.user?.id) redirect("/signin");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/signin");

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      {reason === "limit" && (
        <p className="mb-6 rounded-md bg-secondary px-5 py-4 font-semibold text-secondary-foreground">
          Your first portfolio evaluation was free. The full plan unlocks every pathway after that.
        </p>
      )}
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
        Pay once. Every pathway, every evaluation.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed">
        One payment of ${PREMIUM_PRICE_USD}. No subscription, nothing recurring, nothing to cancel.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="rounded-lg bg-card p-8">
          <p className="text-xl font-bold">Free</p>
          <p className="mt-4 text-5xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>$0</p>
          <ul className="mt-6 space-y-2.5 leading-relaxed">
            <li>Browse every course and pathway</li>
            <li>Build portfolios and track progress</li>
            <li>One portfolio evaluated by faculty</li>
          </ul>
        </div>
        <div className="rounded-lg bg-primary p-8 text-primary-foreground">
          <p className="text-xl font-bold">Full portfolio</p>
          <p className="mt-4 text-5xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
            ${PREMIUM_PRICE_USD}
          </p>
          <p className="mt-1">once, not monthly</p>
          <ul className="mt-6 space-y-2.5 leading-relaxed">
            {INCLUDED.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <div className="mt-8">
            {user.premium ? (
              <p className="font-bold">You&apos;re on the full plan.</p>
            ) : stripeConfigured ? (
              <form action={startCheckout}>
                <button className="rounded-md bg-background px-6 py-3 font-semibold text-primary hover:bg-secondary active:translate-y-px">
                  Upgrade for ${PREMIUM_PRICE_USD}
                </button>
              </form>
            ) : (
              <p className="font-semibold">Payments are not switched on for this deployment yet.</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Secure checkout by Stripe. SkillBridge does not award credit; only colleges do.
        We build the portfolio and the evaluation your school needs to say yes.
      </p>
      <Image
        src={PHOTOS.evening.src}
        alt={PHOTOS.evening.alt}
        width={PHOTOS.evening.width}
        height={PHOTOS.evening.height}
        sizes="(min-width: 1024px) 896px, 100vw"
        className="mt-12 w-full rounded-lg object-cover"
      />
      <p className="mt-8">
        <Link href="/dashboard" className="font-semibold text-primary hover:text-accent">
          Back to My Learning
        </Link>
      </p>
    </div>
  );
}
