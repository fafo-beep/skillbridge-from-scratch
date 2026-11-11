import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { LEGAL, type LegalSection } from "@/lib/legal";

export const metadata: Metadata = { title: "Acceptable Use Policy" };

const { productName: P, contactEmail } = LEGAL;

const SECTIONS: LegalSection[] = [
  {
    heading: "Purpose",
    paragraphs: [
      `${P} depends on honest portfolios and independent evaluations. This policy describes what you may not do on the Service. It is part of the Terms of Service, and violating it is a violation of the Terms.`,
    ],
  },
  {
    heading: "Honesty in portfolios",
    paragraphs: [`You may not:`],
    bullets: [
      "Submit narratives, evidence, certifications, reviews or other material that is false, fabricated, altered, exaggerated or misleading.",
      "Present another person's work, experience or credentials as your own, or submit material you do not have the right to share.",
      "Submit confidential or proprietary information of a current or former employer, client or patient that you are not permitted to disclose, including personal data of others.",
      "Use artificial intelligence tools to invent experience you do not have. Using tools to help you write about real experience is fine.",
    ],
  },
  {
    heading: "Integrity of evaluations",
    paragraphs: [`You may not:`],
    bullets: [
      "Contact, pressure, threaten, harass, bribe or offer anything of value to an evaluator, or attempt to learn or influence who evaluates your portfolio.",
      "Submit the same portfolio under multiple accounts, or create accounts to obtain additional free evaluations.",
      "Misrepresent a recommendation from the Service to an institution, including altering an exported document.",
    ],
  },
  {
    heading: "Accounts and access",
    paragraphs: [`You may not:`],
    bullets: [
      "Share your account or sign in as someone else, or impersonate any person or organization.",
      "Create accounts with false information or for anyone under 18.",
      "Attempt to obtain evaluator or administrator access, or use an invitation not addressed to you.",
      "Circumvent rate limits, payment requirements, plan limits or verification steps.",
    ],
  },
  {
    heading: "Security and technical misuse",
    paragraphs: [`You may not:`],
    bullets: [
      "Probe, scan or test the vulnerability of the Service, or breach or circumvent any security or authentication measure, without our prior written permission.",
      "Access the Service by automated means (scrapers, bots, crawlers) except through interfaces we expressly provide, or copy the catalog, outcomes or content in bulk.",
      "Upload or transmit malware, or interfere with the operation of the Service or anyone's use of it.",
      "Reverse engineer, decompile or attempt to extract the source code of the Service.",
    ],
  },
  {
    heading: "Content standards",
    paragraphs: [`Content you submit may not:`],
    bullets: [
      "Be unlawful, defamatory, harassing, threatening, hateful, obscene or discriminatory.",
      "Infringe anyone's copyright, trademark, privacy or other rights.",
      "Contain unsolicited advertising, spam or links to malicious sites.",
    ],
  },
  {
    heading: "Commercial use",
    paragraphs: [
      `The Service is for your personal use. You may not resell, sublicense, rent or offer the Service, evaluations or course content to third parties, or use the Service to build a competing product, without a written agreement with us.`,
    ],
  },
  {
    heading: "Enforcement",
    paragraphs: [
      `We may investigate suspected violations and take any action we consider appropriate, including removing content, requesting revisions, withholding or withdrawing an evaluation or recommendation, suspending or terminating accounts without refund, and reporting conduct to institutions or law enforcement where we believe it is warranted. We may also preserve and disclose information as described in the Privacy Policy.`,
    ],
  },
  {
    heading: "Reporting",
    paragraphs: [`To report a violation of this policy, email ${contactEmail}. Security researchers who find a vulnerability should email the same address before any public disclosure; we will respond in good faith.`],
  },
];

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      intro={`${LEGAL.productName} works because portfolios are honest and evaluations are independent. These are the rules that protect both.`}
      sections={SECTIONS}
    />
  );
}
