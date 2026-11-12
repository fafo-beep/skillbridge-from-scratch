"use client";

import { useActionState } from "react";
import { verifyTwoStep, type TwoStepState } from "@/lib/actions";

export default function TwoStepForm() {
  const [state, formAction, pending] = useActionState(verifyTwoStep, {} as TwoStepState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-semibold">Code from your authenticator app</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          placeholder="123 456"
          className="h-12 w-full rounded-md border border-border bg-background px-4 text-xl font-semibold tracking-[0.3em] placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
        {pending ? "One moment" : "Continue"}
      </button>
      <p className="text-sm text-muted-foreground">Lost the app? Enter one of your recovery codes instead.</p>
    </form>
  );
}
