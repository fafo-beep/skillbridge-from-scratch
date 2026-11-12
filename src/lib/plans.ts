import { PREMIUM_PRICE_USD } from "@/lib/stripe";

// The two plans, defined once. The pricing page and the upgrade page both
// read from here, so they can never disagree.

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    tagline: "for as long as you like",
    features: [
      "Browse every course and reading",
      "Build portfolios and track progress",
      "One portfolio evaluated by faculty",
      "The evaluator's score and note on that decision",
    ],
  },
  full: {
    name: "Full Plan",
    price: PREMIUM_PRICE_USD,
    tagline: "once, not monthly",
    features: [
      "Unlimited credit portfolios and faculty evaluations",
      "Every course pathway, every field",
      "Evaluator notes and scores on each decision",
      "Every decided portfolio as a PDF, with a verification code your college can check",
      "Priority support",
    ],
  },
} as const;

// The comparison rows: a string shows as text, true as a check, false as
// "not included". The order is the order a buyer asks the questions.
export type Cell = string | boolean;
export const COMPARISON: Array<{ label: string; free: Cell; full: Cell }> = [
  { label: "Courses and readings", free: "All of them", full: "All of them" },
  { label: "Portfolio builder with file uploads", free: true, full: true },
  { label: "Faculty evaluations", free: "One", full: "Unlimited" },
  { label: "Evaluator's score and written note", free: true, full: true },
  { label: "Resubmit after revisions are requested", free: true, full: true },
  { label: "Portfolios for more than one course", free: false, full: true },
  { label: "PDF of each decision, with a verification code your college can check", free: false, full: true },
  { label: "Support", free: "Email", full: "Priority" },
  { label: "Payment", free: "None", full: "$99 once, never again" },
];

export const PRICING_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is $99 really a single payment?",
    a: "Yes. One payment through Stripe, no subscription, nothing recurring and nothing to cancel. It covers every portfolio and evaluation you ever submit.",
  },
  {
    q: "What does the free plan include?",
    a: "Everything except volume. You can read every lesson, build as many portfolios as you like, and have one of them evaluated by faculty with a score and a written note.",
  },
  {
    q: "Does the full plan guarantee credit?",
    a: "No, and nothing can. SkillBridge records a faculty evaluator's recommendation against stated course outcomes. The receiving college decides under its own prior learning policy. Check that policy before you pay.",
  },
  {
    q: "What if my evaluation is not approved?",
    a: "You keep the evaluator's note, which says exactly what was missing. On the full plan you can strengthen the portfolio and submit again, or submit for a different course, as often as you need.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, within 14 days of purchase, as long as no portfolio has been submitted for evaluation under the plan. Once evaluator time has been used the payment is final. Email us from the address on your account; refunds go back to the original card. The Terms set out the details.",
  },
  {
    q: "How do I pay?",
    a: "Card, through Stripe's hosted checkout. SkillBridge never sees or stores your card details.",
  },
];
