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
