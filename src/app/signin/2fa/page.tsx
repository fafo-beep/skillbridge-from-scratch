import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/lib/actions";
import { LogoMark } from "@/components/Logo";
import TwoStepForm from "@/components/TwoStepForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Two-step sign-in" };

// The second step. Reached only with a password-verified, still-pending
// session; anyone else is sent to the normal sign-in.
export default async function TwoStepPage() {
  const session = await auth();
  if (!session?.mfaPending) redirect(session?.user?.id ? "/dashboard" : "/signin");
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="flex justify-center"><LogoMark size={48} /></div>
      <h1 className="mt-5 text-center text-3xl font-bold leading-tight">One more step</h1>
      <p className="mt-2 text-center text-muted-foreground">Open your authenticator app and enter the six-digit code for SkillBridge.</p>
      <div className="mt-8"><TwoStepForm /></div>
      <form action={logout} className="mt-6 text-center">
        <button className="text-sm font-semibold text-primary hover:text-accent">Cancel and Sign Out</button>
      </form>
    </div>
  );
}
