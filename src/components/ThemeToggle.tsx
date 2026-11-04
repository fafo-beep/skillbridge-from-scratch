"use client";

import { useEffect, useState } from "react";

// Light/dark switch. An inline script in layout.tsx applies the stored
// choice before paint (no flash); this button just flips and stores it.
// With nothing stored, the site follows the system preference.

function resolveCurrent(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [current, setCurrent] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setCurrent(resolveCurrent());
  }, []);

  const flip = () => {
    const next = resolveCurrent() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private windows may refuse storage; the toggle still works for this page
    }
    setCurrent(next);
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={current === "dark" ? "Light mode" : "Dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted active:translate-y-px"
    >
      {current === "dark" ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        </svg>
      )}
    </button>
  );
}
