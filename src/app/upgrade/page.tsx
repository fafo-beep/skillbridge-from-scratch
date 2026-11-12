import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PHOTOS } from "@/lib/photos";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { startCheckout } from "@/lib/actions";
import { PREMIUM_PRICE_USD, stripeConfigured } from "@/lib/stripe";
import { PLANS } from "@/lib/plans";
import PlanCard from "@/components/PlanCard";

export const metadata: Metadata = { title: "Upgrade" };

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

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <PlanCard {...PLANS.free} footer={!user.premium ? <p className="text-sm font-semibold text-muted-foreground">Your current plan</p> : undefined} />
        <PlanCard
          {...PLANS.full}
          highlight
          footer={
            user.premium ? (
              <p className="font-bold">You&apos;re on the full plan.</p>
            ) : stripeConfigured ? (
              <form action={startCheckout}>
                <button className="w-full rounded-md bg-background px-6 py-3.5 text-base font-semibold text-primary hover:bg-secondary active:translate-y-px sm:w-auto">
                  Upgrade for ${PREMIUM_PRICE_USD}
                </button>
              </form>
            ) : (
              <p className="font-semibold">Payments are not switched on for this deployment yet.</p>
            )
          }
        />
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
