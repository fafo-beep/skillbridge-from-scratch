"use client";

import { useActionState } from "react";
import { forgotPassword, type FormState } from "@/lib/actions";
import { field } from "@/components/AuthFields";

export default function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, {} as FormState);
  if (state.notice) {
    return (
      <p role="status" className="rounded-md bg-secondary px-4 py-3 font-semibold text-secondary-foreground">
        {state.notice}
      </p>
    );
  }
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={state.email} className={field} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
        {pending ? "One Moment…" : "Send Reset Link"}
      </button>
    </form>
  );
}
