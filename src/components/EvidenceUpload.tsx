"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { attachUpload } from "@/lib/actions";

// Picks a file and sends it to storage. On Vercel the bytes go straight
// from the browser to the private Blob store with a token the server
// issues for this exact portfolio and outcome; in development they go to
// the local upload route. Either way, the server then records the file as
// evidence only after confirming it exists and fits the rules.

type Props = {
  portfolioId: string;
  outcomeId: string;
  mode: "blob" | "local";
  accept: string;
  maxBytes: number;
  inputId: string;
};

export default function EvidenceUpload({ portfolioId, outcomeId, mode, accept, maxBytes, inputId }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function send() {
    const file = input.current?.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > maxBytes) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      return;
    }
    setProgress(0);
    try {
      let key: string;
      if (mode === "blob") {
        const { upload } = await import("@vercel/blob/client");
        const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-");
        const blob = await upload(`evidence/${portfolioId}/${outcomeId}/${safe}`, file, {
          access: "private",
          handleUploadUrl: "/api/evidence/upload",
          clientPayload: JSON.stringify({ portfolioId, outcomeId }),
          onUploadProgress: (p) => setProgress(p.percentage),
        });
        key = blob.pathname;
      } else {
        const form = new FormData();
        form.set("file", file);
        form.set("portfolioId", portfolioId);
        form.set("outcomeId", outcomeId);
        const res = await fetch("/api/evidence/upload", { method: "POST", body: form });
        const json = (await res.json()) as { key?: string; error?: string };
        if (!res.ok || !json.key) throw new Error(json.error ?? "upload failed");
        key = json.key;
        setProgress(100);
      }
      start(async () => {
        const result = await attachUpload(portfolioId, outcomeId, key, file.name);
        if (result.error) {
          setError(result.error);
        } else {
          setName(null);
          if (input.current) input.current.value = "";
          router.refresh();
        }
        setProgress(null);
      });
    } catch (err) {
      setProgress(null);
      setError(friendly((err as Error).message));
    }
  }

  const busy = progress !== null || pending;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex h-11 cursor-pointer items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
        >
          Choose a file
        </label>
        <input
          ref={input}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            setError(null);
            setName(e.target.files?.[0]?.name ?? null);
          }}
        />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {name ?? "PDF, Word, Excel, PowerPoint, CSV, text or image, up to 25 MB."}
        </span>
        <button
          type="button"
          onClick={send}
          disabled={!name || busy}
          className="h-11 rounded-md bg-secondary px-5 text-sm font-semibold text-secondary-foreground hover:bg-muted active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Uploading" : "Upload"}
        </button>
      </div>
      {progress !== null && (
        <div className="mt-2 h-2 w-full rounded-md bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
          <div className="h-2 rounded-md bg-primary" style={{ width: `${Math.max(4, progress)}%` }} />
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function friendly(message: string): string {
  if (/type/i.test(message)) return "That file type is not accepted. Use PDF, Word, Excel, PowerPoint, CSV, text, PNG or JPG.";
  if (/large|size/i.test(message)) return "That file is too large. The limit is 25 MB.";
  if (/editable|scope|sign in/i.test(message)) return "This portfolio can no longer be changed.";
  return "The upload did not finish. Check your connection and try again.";
}
