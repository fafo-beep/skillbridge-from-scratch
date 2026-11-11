// A lesson is a short reading that prepares a learner to claim an outcome:
// what the outcome means in practice, what an evaluator looks for, what
// counts as evidence, one worked example of a strong narrative, and a
// self-check. Nothing here is a lecture; it is a guide to proving work the
// learner has already done.

export type Guide = {
  // Which course outcome this lesson prepares you to evidence. Copied
  // exactly from the course's outcomes list.
  outcome: string;
  // Two or three sentences: what this lesson covers and why it matters.
  intro: string;
  // What the outcome means in day-to-day work. Two or three short paragraphs.
  meaning: string[];
  // Three to five things an evaluator checks for. Each one concrete.
  evaluatorsLookFor: string[];
  // Three to five kinds of document that prove it, with what each shows.
  evidence: string[];
  // A worked example: a narrative a learner might write (120 to 180 words,
  // first person, specific), and two sentences on why it works.
  example: { narrative: string; why: string };
  // Three or four yes/no questions to ask before writing your own.
  selfCheck: string[];
};

// Guides keyed by lesson title, per course slug.
export type CourseGuides = Record<string, Guide>;

export function guideWords(g: Guide): number {
  const text = [
    g.intro,
    ...g.meaning,
    ...g.evaluatorsLookFor,
    ...g.evidence,
    g.example.narrative,
    g.example.why,
    ...g.selfCheck,
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

// Reading time at a careful pace, with a floor so no lesson claims under
// three minutes.
export function readingMinutes(g: Guide): number {
  return Math.max(3, Math.round(guideWords(g) / 170));
}
