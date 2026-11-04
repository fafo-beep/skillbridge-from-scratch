import { oauthProviders, signIn } from "@/auth";

// Social sign-in buttons. Each renders only when its provider's
// credentials are configured, so the page never shows a dead button.

const LABEL: Record<string, string> = {
  google: "Continue with Google",
  facebook: "Continue with Facebook",
  apple: "Continue with Apple",
};

function Mark({ provider }: { provider: string }) {
  // Plain single-color marks, drawn inline; brand art comes later if wanted.
  if (provider === "google") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
        <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
        <path d="M6.4 14a6 6 0 0 1 0-3.8V7.6H3.1a10 10 0 0 0 0 8.9L6.4 14Z" />
        <path d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.1 7.6L6.4 10c.8-2.3 3-4 5.6-4Z" />
      </svg>
    );
  }
  if (provider === "facebook") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
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

export default function SocialButtons() {
  if (oauthProviders.length === 0) return null;
  return (
    <div className="space-y-3">
      {oauthProviders.map((p) => (
        <form
          key={p}
          action={async () => {
            "use server";
            await signIn(p, { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-secondary text-base font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px"
          >
            <Mark provider={p} /> {LABEL[p]}
          </button>
        </form>
      ))}
      <div className="flex items-center gap-3 py-1 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or with email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
    </div>
  );
}
