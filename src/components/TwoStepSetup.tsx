"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { beginTwoStep, confirmTwoStep, disableTwoStep, type EnrollState, type TwoStepState } from "@/lib/actions";

const input =
  "h-12 w-full rounded-md border border-border bg-background px-4 text-xl font-semibold tracking-[0.3em] placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground";

// Enrollment: get a secret, scan it, prove it with one code, keep the
// recovery codes. Each piece is its own small step on one card.
export function Enroll() {
  const router = useRouter();
  const [setup, setSetup] = useState<{ secret: string; uri: string; qr: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const [state, formAction, pending] = useActionState(confirmTwoStep, {} as EnrollState);

  if (state.recoveryCodes) {
    return (
      <div>
        <p className="font-bold text-success">Two-step sign-in is on.</p>
        <p className="mt-2 leading-relaxed">
          Keep these recovery codes somewhere safe. Each works once, in place of the app, if you ever lose your phone. They will not be shown again.
        </p>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Every session opened with the password alone has been ended, this one included. When you continue you will sign in again with your password and a code.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-background p-4 font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
          {state.recoveryCodes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <button type="button" onClick={() => router.push("/signin")} className="mt-6 rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px">
          I Have Saved Them, Sign In Again
        </button>
      </div>
    );
  }

  if (!setup) {
    return (
      <button
        type="button"
        disabled={starting}
        onClick={async () => {
          setStarting(true);
          try {
            setSetup(await beginTwoStep());
          } finally {
            setStarting(false);
          }
        }}
        className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60"
      >
        {starting ? "One moment" : "Set Up Two-Step Sign-In"}
      </button>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={setup.qr} alt="QR code for your authenticator app" width={220} height={220} className="rounded-md bg-background" />
      <div>
        <ol className="space-y-2 leading-relaxed" style={{ fontVariantNumeric: "tabular-nums" }}>
          <li>1. Open Google Authenticator, Microsoft Authenticator, 1Password or any authenticator app.</li>
          <li>2. Scan this code, or type the key by hand:</li>
        </ol>
        <p className="mt-2 break-all rounded-md bg-background px-3 py-2 text-sm font-semibold" data-testid="totp-secret">{setup.secret}</p>
        <form action={formAction} className="mt-4 space-y-3">
          <label htmlFor="confirm-code" className="block text-sm font-semibold">3. Enter the six-digit code the app shows</label>
          <input id="confirm-code" name="code" inputMode="numeric" autoComplete="one-time-code" required placeholder="123 456" className={input} style={{ fontVariantNumeric: "tabular-nums" }} />
          {state.error && <p role="alert" className="text-sm font-semibold text-destructive">{state.error}</p>}
          <button type="submit" disabled={pending} className="rounded-md bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px disabled:opacity-60">
            {pending ? "Checking" : "Turn It On"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function Disable() {
  const [state, formAction, pending] = useActionState(disableTwoStep, {} as TwoStepState);
  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1">
        <label htmlFor="disable-code" className="mb-1.5 block text-sm font-semibold">Current code from the app</label>
        <input id="disable-code" name="code" inputMode="numeric" autoComplete="one-time-code" required className={input} style={{ fontVariantNumeric: "tabular-nums" }} />
      </div>
      <button type="submit" disabled={pending} className="h-12 rounded-md bg-secondary px-5 font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px disabled:opacity-60">
        Turn Off Two-Step Sign-In
      </button>
      {state.error && <p role="alert" className="w-full text-sm font-semibold text-destructive">{state.error}</p>}
    </form>
  );
}
