"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login, register, socialSignIn, type FormState } from "@/lib/actions";
import { NameFields, PasswordField, field } from "@/components/AuthFields";
import ConsentNote from "@/components/ConsentNote";
import { LogoMark } from "@/components/Logo";

// Two dialogs, one component: "signin" and "join" are separate
// experiences that link to each other. Centered, logo on top, the way
// people expect. A real overlay, so it may float.

export type AuthMode = "signin" | "join";

const primaryBtn =
  "h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60";

function BrandMark({ provider }: { provider: string }) {
  if (provider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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

function ErrorNote({ state, onSwitch }: { state: FormState; onSwitch?: () => void }) {
  if (!state.error) return null;
  const offerSwitch = onSwitch && /already exists/.test(state.error);
  return (
    <p role="alert" className="rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-destructive">
      {state.error}
      {offerSwitch && (
        <>
          {" "}
          <button type="button" onClick={onSwitch} className="text-primary underline underline-offset-4">
            Sign in instead
          </button>
        </>
      )}
    </p>
  );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, formAction, pending] = useActionState(login, {} as FormState);
  return (
    <form action={formAction} className="auth-step space-y-4">
      <div>
        <label htmlFor="modal-email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="modal-email" name="email" type="email" autoComplete="email" required autoFocus defaultValue={state.email} className={field} />
      </div>
      <PasswordField id="modal-password" mode="current" />
      <p className="text-sm">
        <a href="/forgot" className="font-semibold text-primary underline underline-offset-4">Forgot your password?</a>
      </p>
      <ErrorNote state={state} />
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? "One moment" : "Sign in"}
      </button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-primary underline underline-offset-4">
          Create one free
        </button>
      </p>
    </form>
  );
}

function JoinForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, formAction, pending] = useActionState(register, {} as FormState);
  return (
    <form action={formAction} className="auth-step space-y-4">
      <NameFields idPrefix="modal" firstName={state.firstName} lastName={state.lastName} autoFocus />
      <div>
        <label htmlFor="modal-email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="modal-email" name="email" type="email" autoComplete="email" required defaultValue={state.email} className={field} />
      </div>
      <PasswordField id="modal-password" mode="new" />
      <ErrorNote state={state} onSwitch={onSwitch} />
      <ConsentNote />
      <button type="submit" disabled={pending} className={primaryBtn}>
        {pending ? "One moment" : "Create free account"}
      </button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-primary underline underline-offset-4">
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function AuthModal({
  providers,
  open,
  mode,
  onModeChange,
  onClose,
}: {
  providers: string[];
  open: boolean;
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

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

  // Remount the form when the mode changes so state does not leak across.
  const switchTo = (m: AuthMode) => {
    onModeChange(m);
    setKey((k) => k + 1);
  };

  if (!open) return null;
  const isJoin = mode === "join";

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
        className="relative max-h-[92svh] w-full max-w-md overflow-y-auto rounded-lg bg-background p-8 shadow-xl" /* true overlay; design-lint-ignore */
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md hover:bg-card active:translate-y-px"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <LogoMark size={48} />
          <h2 id="auth-modal-title" className="mt-4 text-2xl font-bold leading-tight">
            {isJoin ? "Create your SkillBridge account" : "Welcome back"}
          </h2>
          <p className="mt-2 max-w-xs leading-relaxed text-muted-foreground">
            {isJoin
              ? "Free to start. No card needed."
              : "Sign in to pick up where you left off."}
          </p>
        </div>

        <div className="mt-6" key={key}>
          {isJoin ? (
            <JoinForm onSwitch={() => switchTo("signin")} />
          ) : (
            <SignInForm onSwitch={() => switchTo("join")} />
          )}
        </div>

        <SocialList providers={providers} />
      </div>
    </div>
  );
}
