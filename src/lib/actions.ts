"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { db, dbConfigured } from "@/lib/db";

// Server actions. Every one re-checks the session server-side; nothing
// trusts the client. Privileged writes land in AuditLog.

async function audit(userId: string | null, action: string, target: string, detail = "") {
  try {
    await db.auditLog.create({ data: { userId, action, target, detail } });
  } catch {
    // auditing must never take the request down
  }
}

export type FormState = { error?: string; email?: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Please enter your name.", email, name };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email, name };
  if (password.length < 10)
    return { error: "Use a password of at least 10 characters.", email, name };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists. Sign in instead.", email, name };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, email, passwordHash } });
  await audit(user.id, "user.register", user.id);

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    // signIn throws a redirect on success; rethrow those
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "Email or password is incorrect.", email };
  }
  return {};
}

// Email-first step: tells the modal whether this email already has a
// password account, a social-only account, or nothing. This discloses
// account existence (as Coursera/Google do) in exchange for a simpler
// flow; rate limiting at the edge is the standing mitigation.
export type CheckState = { error?: string; email?: string; exists?: boolean; social?: boolean };

export async function checkEmail(_prev: CheckState, formData: FormData): Promise<CheckState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const user = await db.user.findUnique({ where: { email }, select: { passwordHash: true } });
  return { email, exists: !!user?.passwordHash, social: !!user && !user.passwordHash };
}

const SOCIAL = new Set(["google", "facebook", "apple"]);

export async function socialSignIn(provider: string) {
  if (!SOCIAL.has(provider)) redirect("/signin");
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/signin");
  return id;
}

export async function enroll(courseSlug: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  const course = await db.course.findUnique({ where: { slug: courseSlug } });
  if (!course) redirect("/catalog");
  await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId: course.id } },
    update: {},
    create: { userId, courseId: course.id },
  });
  await audit(userId, "enrollment.create", course.slug);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function startPortfolio(courseSlug: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  const course = await db.course.findUnique({ where: { slug: courseSlug } });
  if (!course || !course.plaEligible) redirect("/catalog");
  const existing = await db.portfolio.findFirst({
    where: { userId, courseId: course.id },
  });
  if (!existing) {
    await db.portfolio.create({ data: { userId, courseId: course.id } });
    await audit(userId, "portfolio.create", course.slug);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleLesson(lessonId: string) {
  if (!dbConfigured) redirect("/join");
  const userId = await requireUserId();
  // The enrollment must belong to the signed-in user: authorization by query.
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) return;
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } },
  });
  if (!enrollment) return;

  const done = await db.progress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
  });
  if (done) {
    await db.progress.delete({ where: { id: done.id } });
  } else {
    await db.progress.create({ data: { enrollmentId: enrollment.id, lessonId } });
  }
  revalidatePath("/dashboard");
}

// ── Portfolio builder (owner-only; ownership enforced by query) ──────────

async function ownedPortfolio(portfolioId: string, userId: string) {
  return db.portfolio.findFirst({
    where: { id: portfolioId, userId },
    include: { course: { include: { outcomes: true } } },
  });
}

const EDITABLE = new Set(["DRAFT", "REVISIONS_REQUESTED"]);

// Builder writes run in serializable transactions with the status check
// INSIDE, so a save racing a submit cannot alter content the evaluator
// will read (the later transaction aborts instead).
async function editableTx<T>(fn: (tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]) => Promise<T>): Promise<T | undefined> {
  try {
    return await db.$transaction(fn, { isolationLevel: "Serializable" });
  } catch {
    return undefined; // serialization conflict or validation stop: no write
  }
}

export async function saveOutcomeResponse(
  portfolioId: string,
  outcomeId: string,
  formData: FormData
) {
  const userId = await requireUserId();
  const narrative = String(formData.get("narrative") ?? "").slice(0, 20000);
  await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    if (!portfolio.course.outcomes.some((o) => o.id === outcomeId)) throw new Error("bad outcome");
    await tx.outcomeResponse.upsert({
      where: { portfolioId_outcomeId: { portfolioId, outcomeId } },
      update: { narrative },
      create: { portfolioId, outcomeId, narrative },
    });
  });
  revalidatePath(`/portfolio/${portfolioId}`);
}

export async function addEvidence(portfolioId: string, outcomeId: string, formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim().slice(0, 300);
  const kind = String(formData.get("kind") ?? "").trim().slice(0, 100);
  if (!title) return;
  const done = await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    if (!portfolio.course.outcomes.some((o) => o.id === outcomeId)) throw new Error("bad outcome");
    await tx.evidence.create({
      data: { portfolioId, outcomeId, title, kind: kind || "Work sample" },
    });
    return true;
  });
  if (done) await audit(userId, "evidence.add", portfolioId, title);
  revalidatePath(`/portfolio/${portfolioId}`);
}

export async function removeEvidence(evidenceId: string) {
  const userId = await requireUserId();
  const portfolioId = await editableTx(async (tx) => {
    const evidence = await tx.evidence.findUnique({
      where: { id: evidenceId },
      include: { portfolio: true },
    });
    if (!evidence || evidence.portfolio.userId !== userId) throw new Error("not owner");
    if (!EDITABLE.has(evidence.portfolio.status)) throw new Error("not editable");
    await tx.evidence.delete({ where: { id: evidenceId } });
    return evidence.portfolioId;
  });
  if (portfolioId) revalidatePath(`/portfolio/${portfolioId}`);
}

export async function submitPortfolio(portfolioId: string) {
  const userId = await requireUserId();
  const done = await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    const responses = await tx.outcomeResponse.findMany({ where: { portfolioId } });
    const answered = new Set(
      responses.filter((r) => r.narrative.trim().length >= 50).map((r) => r.outcomeId)
    );
    if (portfolio.course.outcomes.some((o) => !answered.has(o.id))) throw new Error("incomplete");
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: {
        status: "SUBMITTED",
        // A resubmission starts a fresh evaluation: previous decision cleared.
        score: null,
        decisionNote: "",
        evaluatorId: null,
        decidedAt: null,
      },
    });
    return portfolio.course.slug;
  });
  if (done) await audit(userId, "portfolio.submit", portfolioId, done);
  revalidatePath(`/portfolio/${portfolioId}`);
  revalidatePath("/dashboard");
}

// ── Reviewer flow (role enforced server-side) ────────────────────────────

async function requireReviewer(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "REVIEWER" && user.role !== "ADMIN")) redirect("/dashboard");
  return userId;
}

export async function startReview(portfolioId: string) {
  const reviewerId = await requireReviewer();
  const updated = await db.portfolio.updateMany({
    // Separation of duties: never your own portfolio.
    where: { id: portfolioId, status: "SUBMITTED", userId: { not: reviewerId } },
    data: { status: "UNDER_REVIEW", evaluatorId: reviewerId },
  });
  revalidatePath("/review");
  if (updated.count === 0) redirect("/review"); // already claimed, or not claimable
  await audit(reviewerId, "review.start", portfolioId);
  redirect(`/portfolio/${portfolioId}`);
}

export async function decidePortfolio(portfolioId: string, formData: FormData) {
  const reviewerId = await requireReviewer();
  const decision = String(formData.get("decision") ?? "");
  const score = Math.min(5, Math.max(1, Math.round(Number(formData.get("score") ?? 0))));
  const note = String(formData.get("note") ?? "").trim().slice(0, 5000);
  const STATUS: Record<string, "APPROVED" | "DENIED" | "REVISIONS_REQUESTED"> = {
    approve: "APPROVED",
    deny: "DENIED",
    revisions: "REVISIONS_REQUESTED",
  };
  const status = STATUS[decision];
  if (!status || !Number.isInteger(score) || !note) return;
  const updated = await db.portfolio.updateMany({
    where: { id: portfolioId, status: "UNDER_REVIEW", evaluatorId: reviewerId, userId: { not: reviewerId } },
    data: { status, score, decisionNote: note, decidedAt: new Date() },
  });
  if (updated.count > 0) {
    await audit(reviewerId, "review.decide", portfolioId, `${status} score=${score}`);
  }
  revalidatePath(`/portfolio/${portfolioId}`);
  revalidatePath("/review");
  redirect("/review");
}
