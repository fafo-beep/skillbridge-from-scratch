"use client";

import { useState } from "react";
import AuthModal from "@/components/AuthModal";

// The header's auth entry points. Both open the same dialog; the flow
// itself works out whether the visitor is new or returning.
export default function AuthLauncher({ providers }: { providers: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="font-semibold hover:text-primary">
        Sign in
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
      >
        Join free
      </button>
      <AuthModal providers={providers} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
