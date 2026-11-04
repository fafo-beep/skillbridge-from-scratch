import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import SocialButtons from "@/components/SocialButtons";
import { register } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Join free" };

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">Join free</h1>
      <p className="mt-3 leading-relaxed">
        See what your experience could be worth. No card needed.
      </p>
      <div className="mt-8 space-y-6">
        <SocialButtons />
        <AuthForm action={register} mode="join" />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
