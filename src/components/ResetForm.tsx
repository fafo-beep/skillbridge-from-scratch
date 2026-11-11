"use client";

import { useActionState } from "react";
import { resetPassword, type FormState } from "@/lib/actions";
import { PasswordField } from "@/components/AuthFields";

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword.bind(null, token), {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      <PasswordField id="reset-password" mode="new" autoFocus />
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
        {pending ? "One Moment…" : "Set New Password"}
      </button>
    </form>
  );
}
