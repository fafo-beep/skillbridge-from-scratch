"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions";
import { NameFields, PasswordField } from "@/components/AuthFields";

const field =
  "h-11 w-full rounded-md border border-border bg-background px-4 text-base placeholder:text-muted-foreground";

export default function AuthForm({
  action,
  mode,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  mode: "join" | "signin";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {mode === "join" && (
        <NameFields idPrefix="join" firstName={state.firstName} lastName={state.lastName} />
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className={field}
        />
      </div>
      <PasswordField id="password" mode={mode === "join" ? "new" : "current"} />
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60"
      >
        {pending ? "One moment…" : mode === "join" ? "Create free account" : "Sign in"}
      </button>
    </form>
  );
}
