import type { ReactNode } from "react";

// A floating composition of real interface pieces, the way course
// platforms show their product: two fragments overlapping at a slight
// tilt, with one callout tile carrying the number that matters. The
// whole scene is an interface illustration (data-ui), so it keeps its
// own shadows. Below the large breakpoint it stacks plainly.

export function Callout({ big, small }: { big: string; small: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary px-5 py-4 text-secondary-foreground shadow-lg shadow-[hsl(216_85%_10%/0.15)]" /* floating scene; design-lint-ignore */>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
      </svg>
      <div>
        <p className="text-lg font-bold leading-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{big}</p>
        <p className="text-sm">{small}</p>
      </div>
    </div>
  );
}

export default function ProductScene({
  primary,
  secondary,
  callout,
  flip = false,
}: {
  primary: ReactNode;
  secondary: ReactNode;
  callout: ReactNode;
  flip?: boolean;
}) {
  return (
    <div data-ui className="relative mx-auto w-full max-w-xl space-y-4 lg:h-[520px] lg:space-y-0">
      <div
        className={`lg:absolute lg:top-24 lg:w-[64%] ${flip ? "lg:right-0 lg:rotate-[2deg]" : "lg:left-0 lg:-rotate-[2deg]"} rounded-lg shadow-xl shadow-[hsl(216_85%_10%/0.18)]`} /* floating scene; design-lint-ignore */
      >
        {primary}
      </div>
      <div
        className={`lg:absolute lg:top-[290px] lg:w-[60%] ${flip ? "lg:left-0 lg:-rotate-[2deg]" : "lg:right-0 lg:rotate-[2deg]"} rounded-lg shadow-xl shadow-[hsl(216_85%_10%/0.18)]`} /* floating scene; design-lint-ignore */
      >
        {secondary}
      </div>
      <div className={`lg:absolute lg:top-0 lg:w-80 ${flip ? "lg:left-2 lg:-rotate-[3deg]" : "lg:right-2 lg:rotate-[3deg]"}`}>
        {callout}
      </div>
    </div>
  );
}
