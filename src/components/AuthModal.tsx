"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { checkEmail, login, register, socialSignIn, type CheckState } from "@/lib/actions";

// Coursera-style auth dialog: one entry point for both log in and sign up.
// Email first; the next step shows only what that email needs (password for
// an existing account, name + password for a new one, the provider button
// for a social-only account). A real overlay, so it may float (shadow ok).

const field =
  "h-12 w-full rounded-md border border-border bg-background px-4 text-base placeholder:text-muted-foreground";
const primaryBtn =
  "h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60";

function BrandMark({ provider }: { provider: string }) {
  if (provider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        {/* Google brand colors; design-lint-ignore */}
        <path fill="#4285F4" /* Google brand; design-lint-ignore */ d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
        <path fill="#34A853" /* Google brand; design-lint-ignore */ d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" /* Google brand; design-lint-ignore */ d="M6.4 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 8.9L6.4 14Z" />
        <path fill="#EA4335" /* Google brand; design-lint-ignore */ d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.1 7.6L6.4 10c.8-2.3 3-4 5.6-4Z" />
      </svg>
    );
  }
  if (provider === "facebook") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        {/* Facebook brand color; design-lint-ignore */}
        <path fill="#1877F2" /* Facebook brand; design-lint-ignore */ d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.9c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1 1-3.9 1s-2-1-3.4-1c-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.5 1.3-.1 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.2 3.2-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1-2.9-4Z" />
      <path d="M13.8 5.3c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3-1.5Z" />
    </svg>
  );
}

const SOCIAL_LABEL: Record<string, string> = {
  google: "Continue with Google",
  facebook: "Continue with Facebook",
  apple: "Continue with Apple",
};

function SocialList({ providers }: { providers: string[] }) {
  if (providers.length === 0) return null;
  return (
    <>
      <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        {providers.map((p) => (
          <form key={p} action={socialSignIn.bind(null, p)}>
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-background text-base font-semibold hover:bg-card active:translate-y-px"
            >
              <BrandMark provider={p} /> {SOCIAL_LABEL[p]}
            </button>
          </form>
        ))}
      </div>
    </>
  );
}

function EmailStep({
  onKnown,
}: {
  onKnown: (email: string, exists: boolean, social: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: CheckState, fd: FormData): Promise<CheckState> => {
      const res = await checkEmail(prev, fd);
      if (!res.error && res.email) onKnown(res.email, !!res.exists, !!res.social);
      return res;
    },
    {} as CheckState
  );
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="modal-email" className="mb-1.5 block text-sm font-semibold">
          Email
        </label>
        <input
          id="modal-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          required
          autoFocus
          defaultValue={state.email}
          className={field}
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? "One moment…" : "Continue"}
      </button>
    </form>
  );
}

function PasswordStep({
  email,
  mode,
  onBack,
}: {
  email: string;
  mode: "login" | "register";
  onBack: () => void;
}) {
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <div className="flex items-baseline justify-between gap-4 rounded-md bg-card px-4 py-3 text-sm">
        <span className="truncate font-semibold">{email}</span>
        <button type="button" onClick={onBack} className="shrink-0 font-semibold text-primary underline underline-offset-4">
          Change
        </button>
      </div>
      <input type="hidden" name="email" value={email} />
      {mode === "register" && (
        <div>
          <label htmlFor="modal-name" className="mb-1.5 block text-sm font-semibold">
            Your name
          </label>
          <input id="modal-name" name="name" autoComplete="name" required autoFocus defaultValue={state.name} className={field} />
        </div>
      )}
      <div>
        <label htmlFor="modal-password" className="mb-1.5 block text-sm font-semibold">
          {mode === "register" ? "Choose a password" : "Password"}
        </label>
        <input
          id="modal-password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          autoFocus={mode === "login"}
          minLength={mode === "register" ? 10 : undefined}
          aria-describedby={mode === "register" ? "modal-password-note" : undefined}
          className={field}
        />
        {mode === "register" && (
          <p id="modal-password-note" className="mt-1.5 text-sm text-muted-foreground">
            At least 10 characters.
          </p>
        )}
      </div>
      {state.error && (
        <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? "One moment…" : mode === "register" ? "Create free account" : "Sign in"}
      </button>
    </form>
  );
}

export default function AuthModal({
  providers,
  open,
  onClose,
}: {
  providers: string[];
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<
    { kind: "email" } | { kind: "password"; email: string; mode: "login" | "register" } | { kind: "social-only"; email: string }
  >({ kind: "email" });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setStep({ kind: "email" });
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="max-h-[90svh] w-full max-w-md overflow-y-auto rounded-lg bg-background p-8 shadow-xl" /* true overlay; design-lint-ignore */
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="auth-modal-title" className="text-2xl font-bold leading-tight">
            Log in or create account
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-card active:translate-y-px"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Turn work experience into college credit. Free to start, no card needed.
        </p>

        <div className="mt-6">
          {step.kind === "email" && (
            <EmailStep
              onKnown={(email, exists, social) =>
                setStep(
                  social
                    ? { kind: "social-only", email }
                    : { kind: "password", email, mode: exists ? "login" : "register" }
                )
              }
            />
          )}
          {step.kind === "password" && (
            <PasswordStep
              email={step.email}
              mode={step.mode}
              onBack={() => setStep({ kind: "email" })}
            />
          )}
          {step.kind === "social-only" && (
            <div className="space-y-4">
              <p className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
                {step.email} signs in with a social account — use its button below.
              </p>
              <button
                type="button"
                onClick={() => setStep({ kind: "email" })}
                className="text-sm font-semibold text-primary underline underline-offset-4"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        <SocialList providers={providers} />
      </div>
    </div>
  );
}
