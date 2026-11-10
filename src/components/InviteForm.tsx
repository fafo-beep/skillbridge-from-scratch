"use client";

import { useActionState } from "react";
import { createInvite, type InviteState } from "@/lib/actions";

// Admin creates an invitation and gets a one-week link to send by any
// channel. (Automatic email arrives with the email provider.)
export default function InviteForm() {
  const [state, formAction, pending] = useActionState(createInvite, {} as InviteState);
  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label htmlFor="invite-email" className="sr-only">Email to invite</label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="evaluator@university.edu"
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
        />
        <label htmlFor="invite-role" className="sr-only">Role</label>
        <select id="invite-role" name="role" className="h-11 rounded-md border border-border bg-background px-3 text-sm">
          <option value="REVIEWER">Evaluator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create invitation"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">{state.error}</p>
      )}
      {state.link && (
        <div className="rounded-md bg-secondary p-4 text-sm text-secondary-foreground">
          <p className="font-semibold">Invitation for {state.email} — valid 7 days. Send this link:</p>
          <p className="mt-2 break-all rounded-md bg-background px-3 py-2 font-semibold text-foreground select-all">{state.link}</p>
        </div>
      )}
    </form>
  );
}
