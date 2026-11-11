// The SkillBridge mark: a bridge arch over a baseline, inside a rounded
// square in the brand blue. Drawn once here, used in the header, the
// auth dialogs and the browser tab (src/app/icon.svg mirrors it).
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="hsl(var(--primary))" />
      <path
        d="M6 21c2.5-6 6.5-9 10-9s7.5 3 10 9"
        fill="none"
        stroke="#ffffff" /* on-brand white; design-lint-ignore */
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M6 23.5h20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" /* design-lint-ignore */ />
    </svg>
  );
}

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="text-lg font-bold tracking-tight">SkillBridge</span>
    </span>
  );
}
