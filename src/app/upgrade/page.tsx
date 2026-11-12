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

function Check({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`mt-1 shrink-0 ${className}`}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Feature({ text, tone }: { text: string; tone: "card" | "primary" }) {
  return (
    <li className="flex items-start gap-3">
      <Check className={tone === "primary" ? "text-primary-foreground" : "text-primary"} />
      <span>{text}</span>
    </li>
  );
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const session = dbConfigured ? await auth() : null;
  if (session?.mfaPending) redirect("/signin/2fa");
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
          <p className="mt-1 text-muted-foreground">for as long as you like</p>
          <ul className="mt-6 space-y-3 leading-relaxed">
            {["Browse every course and reading", "Build portfolios and track progress", "One portfolio evaluated by faculty"].map((t) => (
              <Feature key={t} text={t} tone="card" />
            ))}
          </ul>
          {!user.premium && <p className="mt-8 text-sm font-semibold text-muted-foreground">Your current plan</p>}
        </div>
        <div className="rounded-lg bg-primary p-8 text-primary-foreground">
          <p className="text-xl font-bold">Full Plan</p>
          <p className="mt-4 text-5xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
            ${PREMIUM_PRICE_USD}
          </p>
          <p className="mt-1">once, not monthly</p>
          <ul className="mt-6 space-y-3 leading-relaxed">
            {INCLUDED.map((i) => (
              <Feature key={i} text={i} tone="primary" />
            ))}
          </ul>
          <div className="mt-8">
            {user.premium ? (
              <p className="flex items-center gap-2 font-bold"><Check /> You&apos;re on the full plan.</p>
            ) : stripeConfigured ? (
              <form action={startCheckout}>
                <button className="w-full rounded-md bg-background px-6 py-3.5 text-base font-semibold text-primary hover:bg-secondary active:translate-y-px sm:w-auto">
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
