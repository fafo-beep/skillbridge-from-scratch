import type { Metadata } from "next";
import Link from "next/link";
import { confirmVerification } from "@/lib/actions";

export const metadata: Metadata = { title: "Confirm your email" };

// The link lands here; the confirmation itself is a button (a POST), so
// an email scanner that prefetches links cannot consume the token.
export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token === "invalid") {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-4xl font-bold leading-tight">That link is no longer valid</h1>
        <p className="mt-3 leading-relaxed">
          Confirmation links work once and expire after 24 hours. Sign in and
          use &quot;Resend&quot; on your dashboard to get a fresh one.
        </p>
        <Link href="/dashboard" className="mt-8 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
          Go to My Learning
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">Confirm your email</h1>
      <p className="mt-3 leading-relaxed">
        One click and your SkillBridge account is fully unlocked: portfolio
        submissions, evaluations, and the full plan.
      </p>
      <form action={confirmVerification.bind(null, token)} className="mt-8">
        <button className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
          Confirm My Email
        </button>
      </form>
    </div>
  );
}
