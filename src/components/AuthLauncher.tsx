"use client";

import { useState } from "react";
import AuthModal, { type AuthMode } from "@/components/AuthModal";

// The header's two entry points open two different dialogs that link to
// each other: Sign in, and Create account.
export default function AuthLauncher({ providers }: { providers: string[] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const launch = (m: AuthMode) => {
    setMode(m);
    setOpen(true);
  };
  return (
    <>
      <button type="button" onClick={() => launch("signin")} className="font-semibold hover:text-primary">
        Sign In
      </button>
      <button
        type="button"
        onClick={() => launch("join")}
        className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
      >
        Join Free
      </button>
      <AuthModal providers={providers} open={open} mode={mode} onModeChange={setMode} onClose={() => setOpen(false)} />
    </>
  );
}
