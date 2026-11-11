"use client";

import { useState } from "react";

// Shared interactive form pieces for sign-in / sign-up: name pair,
// password with show/hide and a live length check.

export const field =
  "h-12 w-full rounded-md border border-border bg-background px-4 text-base placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 focus:border-primary";

export function NameFields({
  idPrefix,
  firstName,
  lastName,
  autoFocus,
}: {
  idPrefix: string;
  firstName?: string;
  lastName?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${idPrefix}-first`} className="mb-1.5 block text-sm font-semibold">
          First name
        </label>
        <input
          id={`${idPrefix}-first`}
          name="firstName"
          autoComplete="given-name"
          required
          autoFocus={autoFocus}
          defaultValue={firstName}
          className={field}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-last`} className="mb-1.5 block text-sm font-semibold">
          Last name
        </label>
        <input
          id={`${idPrefix}-last`}
          name="lastName"
          autoComplete="family-name"
          required
          defaultValue={lastName}
          className={field}
        />
      </div>
    </div>
  );
}

export function PasswordField({
  id,
  mode,
  autoFocus,
}: {
  id: string;
  mode: "new" | "current";
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [length, setLength] = useState(0);
  const strong = length >= 10;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {mode === "new" ? "Choose a password" : "Password"}
      </label>
      <div className="relative">
        <input
          id={id}
          name="password"
          type={show ? "text" : "password"}
          autoComplete={mode === "new" ? "new-password" : "current-password"}
          required
          autoFocus={autoFocus}
          minLength={mode === "new" ? 10 : undefined}
          onChange={(e) => setLength(e.target.value.length)}
          aria-describedby={mode === "new" ? `${id}-note` : undefined}
          className={`${field} pr-20`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-secondary"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {mode === "new" && (
        <p
          id={`${id}-note`}
          className={`mt-1.5 text-sm transition-colors ${strong ? "font-semibold text-success" : "text-muted-foreground"}`}
          aria-live="polite"
        >
          {strong ? "Good, that's long enough." : `At least 10 characters${length ? ` (${length} so far)` : ""}.`}
        </p>
      )}
    </div>
  );
}
