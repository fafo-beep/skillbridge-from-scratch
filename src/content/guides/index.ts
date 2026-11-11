import type { CourseGuides, Guide } from "./types";
import principlesOfManagement from "./principles-of-management";
import digitalMarketingFundamentals from "./digital-marketing-fundamentals";
import businessCommunication from "./business-communication";
import humanResourcePractices from "./human-resource-practices";
import foundationsOfPatientCare from "./foundations-of-patient-care";
import userSupportFundamentals from "./user-support-fundamentals";

// Every lesson's reading, keyed by course slug then lesson title. The
// catalog (src/lib/catalog.ts) is the source of truth for titles and
// order; this is the source of truth for what a lesson says.
export const GUIDES: Record<string, CourseGuides> = {
  "principles-of-management": principlesOfManagement,
  "digital-marketing-fundamentals": digitalMarketingFundamentals,
  "business-communication": businessCommunication,
  "human-resource-practices": humanResourcePractices,
  "foundations-of-patient-care": foundationsOfPatientCare,
  "user-support-fundamentals": userSupportFundamentals,
};

export function getGuide(courseSlug: string, lessonTitle: string): Guide | undefined {
  return GUIDES[courseSlug]?.[lessonTitle];
}

export type { Guide, CourseGuides } from "./types";
export { readingMinutes, guideWords } from "./types";
