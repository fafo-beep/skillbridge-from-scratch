import type { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "@/components/ForgotForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-4xl font-bold leading-tight">Reset your password</h1>
      <p className="mt-3 leading-relaxed">
        Enter your email and we&apos;ll send a link to set a new one. The link
        works once and expires in an hour.
      </p>
      <div className="mt-8">
        <ForgotForm />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/signin" className="font-semibold text-primary hover:text-accent">
          Sign In
        </Link>
      </p>
    </div>
  );
}
