"use client";

import { useActionState, useState } from "react";
import { deleteAccount, type DeleteState } from "@/lib/actions";

// Closing an account: a plain statement of what goes and what stays, one
// proof field, and a button that only enables once the person has
// confirmed they understand.
export default function DeleteAccountForm({ proof }: { proof: "password" | "code" | "email" }) {
  const [state, formAction, pending] = useActionState(deleteAccount, {} as DeleteState);
  const [understood, setUnderstood] = useState(false);
  const label = proof === "password" ? "Your password" : proof === "code" ? "Code from your authenticator app" : "Your email address, exactly";
  return (
    <form action={formAction} className="mt-4 space-y-4">
      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-1 h-4 w-4" />
        <span>I understand my portfolios, evidence files and progress will be deleted and cannot be recovered.</span>
      </label>
      <div>
        <label htmlFor="proof" className="mb-1.5 block text-sm font-semibold">{label}</label>
        <input
          id="proof"
          name="proof"
          type={proof === "password" ? "password" : "text"}
          autoComplete={proof === "password" ? "current-password" : proof === "code" ? "one-time-code" : "email"}
          required
          className="h-12 w-full rounded-md border border-border bg-background px-4"
        />
      </div>
      {state.error && <p role="alert" className="text-sm font-semibold text-destructive">{state.error}</p>}
      <button
        type="submit"
        disabled={!understood || pending}
        className="rounded-md bg-destructive px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Closing your account" : "Close My Account"}
      </button>
    </form>
  );
}
