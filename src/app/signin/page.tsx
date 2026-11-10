import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import SocialButtons from "@/components/SocialButtons";
import { login } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">Welcome back</h1>
      <p className="mt-3 leading-relaxed">Pick up where you left off.</p>
      <div className="mt-8 space-y-6">
        <SocialButtons />
        <AuthForm action={login} mode="signin" />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/join" className="font-semibold text-primary underline underline-offset-4">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
