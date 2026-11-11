import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db, dbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Payment" };

// The redirect back from Stripe proves nothing by itself: this page only
// reports what the webhook has verified so far.
export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session = dbConfigured ? await auth() : null;
  if (!session?.user?.id) redirect("/signin");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const payment = session_id
    ? await db.payment.findFirst({ where: { stripeSessionId: session_id, userId: session.user.id } })
    : null;
  const verified = Boolean(user?.premium && payment?.verified);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">
        {verified ? "You're on the full plan." : "Confirming your payment…"}
      </h1>
      <p className="mt-4 leading-relaxed">
        {verified
          ? "Every pathway and evaluation is unlocked. Thank you."
          : "Stripe is confirming the payment with us. This usually takes a few seconds; refresh this page, or come back from your dashboard."}
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
      >
        Go to My Learning
      </Link>
    </div>
  );
}
