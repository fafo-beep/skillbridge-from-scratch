import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { LEGAL, type LegalSection } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service" };

const { productName: P, legalName: CO, governingState: ST, contactEmail, address } = LEGAL;

const SECTIONS: LegalSection[] = [
  {
    heading: "Agreement to these Terms",
    paragraphs: [
      `These Terms of Service (the "Terms") are a binding agreement between you and ${CO} ("${P}", "we", "us"), the operator of the ${P} website, applications and services (together, the "Service"). By creating an account, clicking "Create free account" or "Continue with" a sign-in provider, purchasing a plan, or otherwise using the Service, you agree to these Terms, our Acceptable Use Policy and our Privacy Policy, which are incorporated by reference. If you do not agree, do not use the Service.`,
      `If you use the Service on behalf of an organization, you represent that you have authority to bind that organization, and "you" includes it.`,
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      `You must be at least 18 years old and able to form a binding contract to use the Service. The Service is designed for working adults seeking recognition of prior learning. By using it you represent that you meet these requirements and that you are not barred from using the Service under any applicable law.`,
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      `You are responsible for your account, for keeping your password confidential, and for all activity under your account. Provide accurate, current information, including a working email address, and keep it updated. Tell us promptly at ${contactEmail} if you suspect unauthorized use of your account. We may suspend or close accounts that are shared, created with false information, or used in violation of these Terms.`,
      `Evaluator and administrator accounts exist only by invitation and are subject to additional written agreements with us.`,
    ],
  },
  {
    heading: `What ${P} is, and what it is not`,
    paragraphs: [
      `${P} helps you organize evidence of learning gained through work and experience into a structured portfolio aligned to stated course outcomes, and arranges for a qualified evaluator to review that portfolio and issue a written credit recommendation. The Service also offers instructional course content.`,
      `${P} is not a college, university or accredited institution and does not award, grant or confer academic credit, credentials, degrees or certificates of any kind. Only the institution you attend or apply to decides whether to accept a recommendation and award credit, under its own prior learning assessment policy, which may change at any time and which we do not control. A credit recommendation is an independent evaluator's professional opinion; it is not a promise, guarantee or representation by us that any institution will accept it or that you will receive credit, admission, tuition savings, a shorter program, or any other outcome.`,
      `Nothing in the Service is legal, financial, academic or admissions advice. Confirm your institution's policy before relying on the Service for any decision.`,
    ],
  },
  {
    heading: "Your content and your promises about it",
    paragraphs: [
      `You own the narratives, descriptions, files and other material you submit ("Your Content"). You grant us a worldwide, non-exclusive, royalty-free license to host, store, copy, display, format, transmit and create derivative works of Your Content solely to operate, provide, secure and improve the Service, including sharing it with the evaluator assigned to your portfolio and generating documents such as PDF exports at your request. This license ends when Your Content is deleted from the Service, except for copies kept in backups for a limited period or where retention is required by law.`,
      `You represent and warrant that Your Content is truthful and accurate; describes your own learning and experience; does not infringe anyone's intellectual property, privacy or other rights; does not contain confidential information of a current or former employer that you are not permitted to disclose; and complies with our Acceptable Use Policy. Submitting false or fabricated information to an evaluator or an institution may have serious consequences, including under the policies of that institution, and you bear full responsibility for it.`,
    ],
  },
  {
    heading: "Evaluations",
    paragraphs: [
      `Evaluations are performed by evaluators who exercise independent professional judgment against the course outcomes shown in the Service. We do not guarantee any particular score, recommendation or turnaround time. An evaluator may recommend credit, request revisions, or decline to recommend credit, and may do so with a written note. Decisions are final within the Service; we may, at our discretion, arrange a second evaluation but are not obligated to.`,
      `Your first portfolio evaluation is provided at no charge under the free plan. Additional evaluations require the full plan described below. We may limit the number of portfolios or submissions per account to keep evaluation quality high.`,
    ],
  },
  {
    heading: "Fees, payment and refunds",
    paragraphs: [
      `The full plan is a one-time payment at the price shown at checkout (currently $99). It is not a subscription and does not renew. Payments are processed by Stripe; we do not store your card details. Prices may change for future purchases, never for a purchase already made. Prices exclude any taxes we are required to collect.`,
      `Because the full plan unlocks evaluator time, it is non-refundable once any portfolio under the plan has been submitted for evaluation. If you have not submitted any portfolio for evaluation, you may request a full refund within 14 days of purchase by emailing ${contactEmail}. Refunds are issued to the original payment method. Chargebacks filed in bad faith may result in account closure.`,
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      `You agree to the Acceptable Use Policy, which prohibits, among other things, submitting fabricated or misappropriated evidence, impersonating others, interfering with evaluations, probing or attacking the Service, and scraping or reselling it. We may remove content, suspend or terminate accounts, and withhold or withdraw evaluations and recommendations for violations, without refund.`,
    ],
  },
  {
    heading: "Our intellectual property",
    paragraphs: [
      `The Service, including its software, design, course content, outcome frameworks, text, graphics and trademarks (including the ${P} name and logo), is owned by us or our licensors and protected by intellectual property laws. We grant you a limited, revocable, non-exclusive, non-transferable license to use the Service for your personal, non-commercial purposes in accordance with these Terms. You may not copy, modify, distribute, sell, lease, reverse engineer or create derivative works of any part of the Service, or use our marks without written permission. Feedback you give us may be used without obligation to you.`,
    ],
  },
  {
    heading: "Third-party services",
    paragraphs: [
      `The Service uses third parties such as Google, Facebook and Apple for sign-in, Stripe for payments, and email and hosting providers to operate. Their services are governed by their own terms and privacy policies. We are not responsible for third-party services, and your institution's decisions and policies are entirely its own.`,
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      `You may close your account at any time by contacting ${contactEmail}. We may suspend or terminate your access at any time, with or without notice, if we reasonably believe you have violated these Terms or the law, to protect the Service or other users, or if we discontinue the Service. Sections that by their nature should survive termination (including those on your content license for retained copies, fees, disclaimers, limitation of liability, indemnification and dispute resolution) survive.`,
    ],
  },
  {
    heading: "Disclaimers",
    paragraphs: [
      `THE SERVICE, ALL CONTENT, EVALUATIONS AND RECOMMENDATIONS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY AND UNINTERRUPTED OR ERROR-FREE OPERATION. WITHOUT LIMITING THE FOREGOING, WE MAKE NO WARRANTY THAT ANY INSTITUTION WILL ACCEPT A RECOMMENDATION OR AWARD CREDIT, THAT ANY EVALUATION WILL PRODUCE A PARTICULAR RESULT, OR THAT THE SERVICE WILL MEET YOUR REQUIREMENTS. SOME JURISDICTIONS DO NOT ALLOW CERTAIN WARRANTY EXCLUSIONS, SO SOME OF THE ABOVE MAY NOT APPLY TO YOU.`,
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      `TO THE FULLEST EXTENT PERMITTED BY LAW, ${CO.toUpperCase()}, ITS OFFICERS, EMPLOYEES, CONTRACTORS, EVALUATORS AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, TUITION, TIME, DATA, GOODWILL OR OPPORTUNITY (INCLUDING ANY INSTITUTION'S DECISION NOT TO AWARD CREDIT), ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS, HOWEVER CAUSED AND UNDER ANY THEORY OF LIABILITY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
      `TO THE FULLEST EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR ONE HUNDRED U.S. DOLLARS ($100). THESE LIMITATIONS ARE FUNDAMENTAL TO THE BARGAIN BETWEEN US AND APPLY EVEN IF A REMEDY FAILS OF ITS ESSENTIAL PURPOSE.`,
    ],
  },
  {
    heading: "Indemnification",
    paragraphs: [
      `You agree to defend, indemnify and hold harmless ${CO} and its officers, employees, contractors and evaluators from and against any claims, liabilities, damages, losses and expenses (including reasonable attorneys' fees) arising out of or relating to Your Content, your use of the Service, your violation of these Terms or any law, or your violation of any third party's rights, including any claim by an employer or institution concerning information you submitted.`,
    ],
  },
  {
    heading: "Dispute resolution, arbitration and class action waiver",
    paragraphs: [
      `Please read this section carefully; it affects your legal rights. Before filing a claim, you agree to contact us at ${contactEmail} and try in good faith to resolve the dispute informally for at least 30 days.`,
      `Any dispute arising out of or relating to these Terms or the Service that is not resolved informally will be resolved by binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, rather than in court, except that either party may bring an individual claim in small claims court, and either party may seek injunctive relief in court for infringement or misuse of intellectual property. The arbitrator's award may be entered in any court of competent jurisdiction. The Federal Arbitration Act governs this section.`,
      `YOU AND ${CO.toUpperCase()} AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED OR REPRESENTATIVE PROCEEDING. If this class action waiver is found unenforceable as to a particular claim, that claim will proceed in court, not arbitration.`,
      `You may opt out of this arbitration agreement by emailing ${contactEmail} within 30 days of first accepting these Terms, stating your name, account email and that you opt out of arbitration. Opting out does not affect any other part of these Terms.`,
      `These Terms are governed by the laws of the State of ${ST}, without regard to conflict-of-law rules. Subject to the arbitration agreement, the state and federal courts located in ${ST} have exclusive jurisdiction, and you consent to their personal jurisdiction.`,
    ],
  },
  {
    heading: "Changes to the Service and these Terms",
    paragraphs: [
      `We may change, suspend or discontinue any part of the Service at any time. We may update these Terms; when we make material changes we will post the new version with a new effective date and, where practical, notify you by email or in the Service. Your continued use after the effective date means you accept the updated Terms. If you do not agree, stop using the Service and close your account.`,
    ],
  },
  {
    heading: "General",
    paragraphs: [
      `These Terms, the Acceptable Use Policy and the Privacy Policy are the entire agreement between you and us regarding the Service and supersede any prior agreements. If any provision is found unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our written consent; we may assign them in connection with a merger, acquisition or sale of assets. Notices to us must be sent to ${address} or ${contactEmail}; notices to you may be sent to your account email. Nothing in these Terms creates a partnership, employment or agency relationship between you and us.`,
    ],
  },
  {
    heading: "Contact",
    paragraphs: [`Questions about these Terms: ${contactEmail}, or by mail at ${address}.`],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These Terms govern your use of ${LEGAL.productName}. The short version: we help you build and get an expert evaluation of a prior-learning portfolio; only your college decides whether to award credit; you own what you write and promise it is true; and disputes are resolved individually.`}
      sections={SECTIONS}
    />
  );
}
