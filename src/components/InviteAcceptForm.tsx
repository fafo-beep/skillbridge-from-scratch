"use client";

import { useActionState } from "react";
import { acceptInvite, type FormState } from "@/lib/actions";
import { NameFields, PasswordField } from "@/components/AuthFields";
import ConsentNote from "@/components/ConsentNote";


export default function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite.bind(null, token), {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      <NameFields idPrefix="invite" firstName={state.firstName} lastName={state.lastName} autoFocus />
      <PasswordField id="invite-password" mode="new" />
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      <ConsentNote action="creating this account" />
      <button type="submit" disabled={pending} className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
        {pending ? "One moment…" : "Create evaluator account"}
      </button>
    </form>
  );
}
