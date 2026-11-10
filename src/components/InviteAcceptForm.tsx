"use client";

import { useActionState } from "react";
import { acceptInvite, type FormState } from "@/lib/actions";

const field = "h-12 w-full rounded-md border border-border bg-background px-4 text-base";

export default function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite.bind(null, token), {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">Your name</label>
        <input id="name" name="name" autoComplete="name" required defaultValue={state.name} className={field} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Choose a password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className={field} />
        <p className="mt-1.5 text-sm text-muted-foreground">At least 10 characters.</p>
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
        {pending ? "One moment…" : "Create evaluator account"}
      </button>
    </form>
  );
}
