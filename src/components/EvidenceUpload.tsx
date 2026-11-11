"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { attachUpload } from "@/lib/actions";

// Picks a file and sends it to storage, starting the moment a file is
// chosen or dropped. On Vercel the bytes go straight from the browser to
// the private Blob store with a token the server issues for this exact
// portfolio and outcome; in development they go to the local upload
// route. Either way, the server then records the file as evidence only
// after confirming it exists and fits the rules.

type Props = {
  portfolioId: string;
  outcomeId: string;
  mode: "blob" | "local";
  accept: string;
  maxBytes: number;
  inputId: string;
};

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; name: string; loaded: number; total: number }
  | { kind: "saving"; name: string }
  | { kind: "done"; name: string }
  | { kind: "error"; message: string };

function mb(n: number): string {
  return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function EvidenceUpload({ portfolioId, outcomeId, mode, accept, maxBytes, inputId }: Props) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [over, setOver] = useState(false);
  const [, start] = useTransition();

  // A finished upload shows its name briefly, then the list below takes over.
  useEffect(() => {
    if (phase.kind !== "done") return;
    const t = setTimeout(() => setPhase({ kind: "idle" }), 2500);
    return () => clearTimeout(t);
  }, [phase]);

  const send = useCallback(
    async (file: File) => {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      if (!accept.split(",").includes(`.${ext}`)) {
        setPhase({ kind: "error", message: "That file type is not accepted. Use PDF, Word, Excel, PowerPoint, CSV, text, PNG or JPG." });
        return;
      }
      if (file.size > maxBytes) {
        setPhase({ kind: "error", message: `That file is ${mb(file.size)}. The limit is ${Math.round(maxBytes / 1024 / 1024)} MB.` });
        return;
      }
      if (file.size === 0) {
        setPhase({ kind: "error", message: "That file is empty." });
        return;
      }
      const controller = new AbortController();
      abort.current = controller;
      setPhase({ kind: "uploading", name: file.name, loaded: 0, total: file.size });
      try {
        let key: string;
        if (mode === "blob") {
          const { upload } = await import("@vercel/blob/client");
          const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-");
          const blob = await upload(`evidence/${portfolioId}/${outcomeId}/${safe}`, file, {
            access: "private",
            handleUploadUrl: "/api/evidence/upload",
            clientPayload: JSON.stringify({ portfolioId, outcomeId }),
            abortSignal: controller.signal,
            onUploadProgress: (p) => setPhase({ kind: "uploading", name: file.name, loaded: p.loaded, total: p.total }),
          });
          key = blob.pathname;
        } else {
          key = await new Promise<string>((resolve, reject) => {
            const form = new FormData();
            form.set("file", file);
            form.set("portfolioId", portfolioId);
            form.set("outcomeId", outcomeId);
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/evidence/upload");
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) setPhase({ kind: "uploading", name: file.name, loaded: e.loaded, total: e.total });
            };
            xhr.onload = () => {
              try {
                const json = JSON.parse(xhr.responseText) as { key?: string; error?: string };
                if (xhr.status >= 200 && xhr.status < 300 && json.key) resolve(json.key);
                else reject(new Error(json.error ?? "upload failed"));
              } catch {
                reject(new Error("upload failed"));
              }
            };
            xhr.onerror = () => reject(new Error("network"));
            xhr.onabort = () => reject(new DOMException("aborted", "AbortError"));
            controller.signal.addEventListener("abort", () => xhr.abort());
            xhr.send(form);
          });
        }
        setPhase({ kind: "saving", name: file.name });
        start(async () => {
          const result = await attachUpload(portfolioId, outcomeId, key, file.name);
          if (result.error) {
            setPhase({ kind: "error", message: result.error });
          } else {
            setPhase({ kind: "done", name: file.name });
            router.refresh();
          }
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") setPhase({ kind: "idle" });
        else setPhase({ kind: "error", message: friendly((err as Error).message) });
      } finally {
        abort.current = null;
        if (input.current) input.current.value = "";
      }
    },
    [accept, maxBytes, mode, portfolioId, outcomeId, router, start]
  );

  const busy = phase.kind === "uploading" || phase.kind === "saving";
  const pct = phase.kind === "uploading" ? Math.round((phase.loaded / Math.max(1, phase.total)) * 100) : phase.kind === "saving" || phase.kind === "done" ? 100 : 0;

  return (
    <div className="mt-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !busy) void send(file);
        }}
        className={`rounded-md border-2 border-dashed px-4 py-4 transition-colors ${over ? "border-primary bg-secondary" : "border-border bg-background"}`}
      >
        {phase.kind === "idle" || phase.kind === "error" ? (
          <div className="flex flex-wrap items-center gap-3">
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
                const file = e.target.files?.[0];
                if (file) void send(file);
              }}
            />
            <span className="min-w-0 flex-1 text-sm text-muted-foreground">
              or drop it here. PDF, Word, Excel, PowerPoint, CSV, text or image, up to {Math.round(maxBytes / 1024 / 1024)} MB. Upload starts right away.
            </span>
          </div>
        ) : (
          <div aria-live="polite">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className="min-w-0 truncate font-semibold">{phase.name}</span>
              <span className="flex items-baseline gap-4">
                <span className={phase.kind === "done" ? "font-semibold text-success" : "text-muted-foreground"}>
                  {phase.kind === "uploading" && `${pct}% · ${mb(phase.loaded)} of ${mb(phase.total)}`}
                  {phase.kind === "saving" && "Checking the file"}
                  {phase.kind === "done" && "Attached"}
                </span>
                {phase.kind === "uploading" && (
                  <button type="button" onClick={() => abort.current?.abort()} className="font-semibold text-primary underline underline-offset-4">
                    Cancel
                  </button>
                )}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-md bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${phase.name}`}>
              <div
                className={`h-2 rounded-md transition-[width] duration-200 ease-out ${phase.kind === "done" ? "bg-success" : "bg-primary"}`}
                style={{ width: `${Math.max(3, pct)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {phase.kind === "error" && (
        <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
          {phase.message}
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
