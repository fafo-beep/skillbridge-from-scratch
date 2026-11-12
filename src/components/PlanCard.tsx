import type { ReactNode } from "react";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`mt-1 shrink-0 ${className}`}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// One plan: name, price, tagline, checked features, and whatever action
// the page decides belongs at the bottom. Blue for the paid plan.
export default function PlanCard({
  name,
  price,
  tagline,
  features,
  highlight = false,
  footer,
}: {
  name: string;
  price: number;
  tagline: string;
  features: readonly string[];
  highlight?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className={`rounded-lg p-8 ${highlight ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <p className="text-xl font-bold">{name}</p>
      <p className="mt-4 text-5xl font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
        ${price}
      </p>
      <p className={`mt-1 ${highlight ? "" : "text-muted-foreground"}`}>{tagline}</p>
      <ul className="mt-6 space-y-3 leading-relaxed">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check className={highlight ? "text-primary-foreground" : "text-primary"} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}
