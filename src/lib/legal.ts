// Legal identity shown in the Terms, Acceptable Use and Privacy pages.
// Fill these before launch; they are rendered verbatim.
export const LEGAL = {
  productName: "SkillBridge",
  // TODO: your registered legal entity, e.g. "SkillBridge Learning LLC"
  legalName: "SkillBridge Learning LLC",
  // TODO: the U.S. state whose law governs and where disputes are heard
  governingState: "Delaware",
  // TODO: a mailing address for legal notices
  address: "[Mailing address for legal notices]",
  contactEmail: "legal@skillbridge.example",
  privacyEmail: "privacy@skillbridge.example",
  effectiveDate: "November 11, 2026",
  version: "2026-11-11",
};

export type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };
