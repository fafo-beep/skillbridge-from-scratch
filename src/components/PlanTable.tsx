import type { ReactNode } from "react";
import { COMPARISON, PLANS, type Cell } from "@/lib/plans";

// Plans side by side, the way phone and software companies lay it out:
// a price tile with its action at the head of each column, then one row
// per question a buyer asks, with a check where the answer is yes.

function Check() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function Value({ v }: { v: Cell }) {
  if (v === true) return <><Check /><span className="sr-only">Included</span></>;
  if (v === false) return <span className="text-muted-foreground" aria-label="Not included">Not included</span>;
  return <span className="font-semibold">{v}</span>;
}

export default function PlanTable({ freeAction, fullAction }: { freeAction: ReactNode; fullAction: ReactNode }) {
  const head = "px-2 py-3 text-left text-lg font-bold sm:px-4 sm:text-xl";
  const tile = "mt-3 rounded-lg p-4 text-center sm:p-5";
  return (
    <div className="overflow-hidden rounded-lg bg-card" style={{ fontVariantNumeric: "tabular-nums" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="align-top">
            <th scope="col" className="w-[34%] px-4 py-3 sm:w-[40%]"><span className="sr-only">What you get</span></th>
            <th scope="col" className={head}>
              {PLANS.free.name}
              <div className={`${tile} bg-secondary text-secondary-foreground`}>
                <p className="text-3xl font-bold sm:text-4xl">${PLANS.free.price}</p>
                <p className="mt-1 text-xs font-normal sm:text-sm">{PLANS.free.tagline}</p>
                <div className="mt-3 text-sm">{freeAction}</div>
              </div>
            </th>
            <th scope="col" className={head}>
              {PLANS.full.name}
              <div className={`${tile} bg-primary text-primary-foreground`}>
                <p className="text-3xl font-bold sm:text-4xl">${PLANS.full.price}</p>
                <p className="mt-1 text-xs font-normal sm:text-sm">{PLANS.full.tagline}</p>
                <div className="mt-3 text-sm">{fullAction}</div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="border-t-2 border-foreground">
          {COMPARISON.map((row) => (
            <tr key={row.label} className="border-t border-border align-middle">
              <th scope="row" className="px-4 py-4 text-left text-sm font-normal leading-snug sm:text-base">{row.label}</th>
              <td className="px-2 py-4 text-center text-sm sm:px-4 sm:text-base"><Value v={row.free} /></td>
              <td className="px-2 py-4 text-center text-sm sm:px-4 sm:text-base"><Value v={row.full} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
