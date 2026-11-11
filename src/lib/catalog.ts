// Catalog data layer.
// Typed in-memory content, server-rendered and seeded into the database by
// prisma/seed.ts. The shapes mirror prisma/schema.prisma one-for-one.
//
// Every lesson is a reading (src/content/guides). A lesson's minutes are
// computed from the length of its reading, never typed in, so the course
// page can only ever promise time that the content actually takes.

import { getGuide, readingMinutes } from "@/content/guides";

export type Category = {
  slug: string;
  name: string;
  scope: string;
};

export type Lesson = {
  title: string;
  minutes: number;
};

export type Module = {
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  code: string;
  title: string;
  category: string; // Category.slug
  credits: number;
  level: "Introductory" | "Intermediate" | "Advanced";
  weeks: number;
  priceUSD: number; // 0 = included free
  plaEligible: boolean;
  summary: string;
  outcomes: string[];
  modules: Module[];
};

export const CATEGORIES: Category[] = [
  { slug: "business", name: "Business & Management", scope: "leading teams, budgets, operations" },
  { slug: "marketing", name: "Marketing", scope: "campaigns, content, analytics" },
  { slug: "hr", name: "Human Resources", scope: "hiring, onboarding, employee relations" },
  { slug: "healthcare", name: "Healthcare", scope: "patient support, records, care settings" },
  { slug: "it", name: "Information Technology", scope: "support, systems, administration" },
];

export const COURSES: Course[] = [
  {
    slug: "principles-of-management",
    code: "BUS301",
    title: "Principles of Management",
    category: "business",
    credits: 3,
    level: "Intermediate",
    weeks: 6,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Core management concepts: planning, organizing, leading, and controlling in modern organizations. If you have run a team or a budget, much of this course describes work you have already done.",
    outcomes: [
      "Lead, coach, and motivate a team toward goals",
      "Plan work, allocate budgets and resources, and manage priorities",
      "Set expectations, give feedback, and manage performance",
    ],
    modules: [
      {
        title: "Planning and strategy",
        summary: "Goal setting, forecasting, and turning strategy into a working plan.",
        lessons: [
          { title: "What managers actually do", minutes: 35 },
          { title: "Setting goals that hold up", minutes: 40 },
          { title: "Forecasting and budgeting basics", minutes: 50 },
        ],
      },
      {
        title: "Leading people",
        summary: "Motivation, delegation, feedback, and the difficult conversations.",
        lessons: [
          { title: "Delegation and trust", minutes: 40 },
          { title: "Feedback that changes behavior", minutes: 45 },
          { title: "Managing performance over time", minutes: 45 },
        ],
      },
      {
        title: "Operations and control",
        summary: "Processes, metrics, and keeping quality steady under load.",
        lessons: [
          { title: "Processes and bottlenecks", minutes: 40 },
          { title: "Metrics that matter", minutes: 35 },
        ],
      },
    ],
  },
  {
    slug: "digital-marketing-fundamentals",
    code: "MKT210",
    title: "Digital Marketing Fundamentals",
    category: "marketing",
    credits: 3,
    level: "Introductory",
    weeks: 5,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Channels, campaigns, and measurement. Built for people who have run brand accounts and ad budgets and want the credential to match the experience.",
    outcomes: [
      "Plan a multi-channel campaign against a stated goal",
      "Write and test content for specific audiences",
      "Read campaign analytics and act on them",
    ],
    modules: [
      {
        title: "Channels and audiences",
        summary: "Where attention lives and what each channel is for.",
        lessons: [
          { title: "The channel landscape", minutes: 35 },
          { title: "Audience research in practice", minutes: 45 },
        ],
      },
      {
        title: "Campaigns",
        summary: "Briefs, creative, budgets, and launch.",
        lessons: [
          { title: "Writing a campaign brief", minutes: 40 },
          { title: "Budgeting and bidding", minutes: 45 },
          { title: "Launch and iteration", minutes: 40 },
        ],
      },
      {
        title: "Measurement",
        summary: "Attribution, dashboards, and honest reporting.",
        lessons: [
          { title: "Metrics and attribution", minutes: 50 },
          { title: "Reporting results", minutes: 30 },
        ],
      },
    ],
  },
  {
    slug: "business-communication",
    code: "BUS110",
    title: "Business Communication",
    category: "business",
    credits: 3,
    level: "Introductory",
    weeks: 4,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Clear writing, confident presentation, and communication that moves work forward: the skill every other course assumes.",
    outcomes: [
      "Write clear, purposeful business documents",
      "Present to groups with structure and confidence",
      "Adapt tone and format to audience and medium",
    ],
    modules: [
      {
        title: "Writing at work",
        summary: "Emails, memos, and documents people actually read.",
        lessons: [
          { title: "Structure before style", minutes: 35 },
          { title: "Editing yourself", minutes: 30 },
        ],
      },
      {
        title: "Speaking and presenting",
        summary: "Meetings, presentations, and holding a room.",
        lessons: [
          { title: "Building a talk", minutes: 40 },
          { title: "Delivery under pressure", minutes: 35 },
        ],
      },
    ],
  },
  {
    slug: "human-resource-practices",
    code: "HR205",
    title: "Human Resource Practices",
    category: "hr",
    credits: 3,
    level: "Intermediate",
    weeks: 5,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Hiring, onboarding, employee relations, and the law that frames them. For people who have interviewed, trained, and managed people without the title.",
    outcomes: [
      "Run a structured, fair hiring process",
      "Design onboarding that keeps new hires",
      "Handle employee relations issues with documentation and care",
    ],
    modules: [
      {
        title: "Hiring",
        summary: "Job design, interviewing, and selection.",
        lessons: [
          { title: "Writing the role", minutes: 35 },
          { title: "Structured interviews", minutes: 45 },
        ],
      },
      {
        title: "Onboarding and retention",
        summary: "The first ninety days and beyond.",
        lessons: [
          { title: "Onboarding that sticks", minutes: 40 },
          { title: "Why people stay", minutes: 35 },
        ],
      },
      {
        title: "Employee relations",
        summary: "Policy, documentation, and difficult cases.",
        lessons: [
          { title: "Documentation habits", minutes: 30 },
          { title: "Handling complaints", minutes: 45 },
        ],
      },
    ],
  },
  {
    slug: "foundations-of-patient-care",
    code: "HC101",
    title: "Foundations of Patient Care",
    category: "healthcare",
    credits: 3,
    level: "Introductory",
    weeks: 6,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Safety, dignity, and the daily craft of patient support. Written for care assistants whose years in clinics already cover most of this ground.",
    outcomes: [
      "Apply safety and hygiene standards in care settings",
      "Support patients with dignity across routine care",
      "Communicate observations to clinical staff accurately",
    ],
    modules: [
      {
        title: "Safety and standards",
        summary: "Hygiene, infection control, and incident reporting.",
        lessons: [
          { title: "Infection control in practice", minutes: 45 },
          { title: "Reporting and escalation", minutes: 35 },
        ],
      },
      {
        title: "Care in practice",
        summary: "Daily living support, mobility, and communication.",
        lessons: [
          { title: "Assisting with daily living", minutes: 50 },
          { title: "Communicating with patients and families", minutes: 40 },
        ],
      },
    ],
  },
  {
    slug: "user-support-fundamentals",
    code: "IT160",
    title: "User Support Fundamentals",
    category: "it",
    credits: 3,
    level: "Introductory",
    weeks: 5,
    priceUSD: 0,
    plaEligible: true,
    summary:
      "Troubleshooting, ticketing, and the human side of helpdesk work. Seven years on support desks counts for something; this course names what.",
    outcomes: [
      "Diagnose and resolve common user-facing issues methodically",
      "Manage a ticket queue with clear priorities and records",
      "Teach users without jargon or condescension",
    ],
    modules: [
      {
        title: "Troubleshooting method",
        summary: "Reproduce, isolate, fix, verify, document.",
        lessons: [
          { title: "A method you can defend", minutes: 40 },
          { title: "Common failure classes", minutes: 45 },
        ],
      },
      {
        title: "The queue and the user",
        summary: "Ticket hygiene, prioritization, and communication.",
        lessons: [
          { title: "Running a queue", minutes: 35 },
          { title: "Writing for users", minutes: 30 },
        ],
      },
    ],
  },
];

// Replace planned minutes with the real reading time wherever a guide exists.
for (const course of COURSES) {
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const guide = getGuide(course.slug, lesson.title);
      if (guide) lesson.minutes = readingMinutes(guide);
    }
  }
}

export type FlatLesson = { n: number; module: Module; lesson: Lesson; moduleIndex: number; lessonIndex: number };

// Lessons in reading order, numbered from 1 across the whole course.
export function flatLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = [];
  course.modules.forEach((module, moduleIndex) => {
    module.lessons.forEach((lesson, lessonIndex) => {
      out.push({ n: out.length + 1, module, lesson, moduleIndex, lessonIndex });
    });
  });
  return out;
}

export function lessonPath(courseSlug: string, n: number): string {
  return `/courses/${courseSlug}/lessons/${n}`;
}

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function searchCourses(query?: string, category?: string): Course[] {
  const q = (query ?? "").trim().toLowerCase();
  return COURSES.filter((c) => {
    if (category && c.category !== category) return false;
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.outcomes.some((o) => o.toLowerCase().includes(q))
    );
  });
}

export function courseMinutes(course: Course): number {
  return course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.minutes, 0),
    0
  );
}
