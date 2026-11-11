"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut, RateLimited } from "@/auth";
import { db, dbConfigured } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { consumeToken, issueToken } from "@/lib/tokens";
import { clientIp, rateLimit, retryMessage } from "@/lib/rate-limit";
import { LEGAL } from "@/lib/legal";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES, deleteFile, extensionOf, headFile, isKeyFor } from "@/lib/storage";

// Server actions. Every one re-checks the session server-side; nothing
// trusts the client. Privileged writes land in AuditLog.

async function audit(userId: string | null, action: string, target: string, detail = "") {
  try {
    await db.auditLog.create({ data: { userId, action, target, detail } });
  } catch {
    // auditing must never take the request down
  }
}

export type FormState = { error?: string; email?: string; name?: string; firstName?: string; lastName?: string; notice?: string; noAccount?: boolean };

// The origin used in emailed links. In production it must come from
// configuration, never from request headers, so a forged Host header can
// never point a password-reset email at an attacker's domain.
async function siteOrigin(): Promise<string> {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be set in production");
  }
  const { headers } = await import("next/headers");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

async function sendVerification(userId: string, email: string, firstName: string | null) {
  const token = await issueToken(userId, "verify");
  const origin = await siteOrigin();
  await sendEmail(
    email,
    "Confirm your SkillBridge email",
    `Hi ${firstName ?? "there"},\n\nConfirm your email to submit portfolios and unlock everything on SkillBridge:\n\n${origin}/verify/${token}\n\nThe link works once and expires in 24 hours. If you did not create an account, ignore this email.`
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 100);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 100);
  const name = `${firstName} ${lastName}`.trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const echo = { email, firstName, lastName };

  const ip = await clientIp();
  const wait = await rateLimit("register", ip);
  if (wait) return { error: retryMessage(wait), ...echo };
  if (!firstName) return { error: "Please enter your first name.", ...echo };
  if (!lastName) return { error: "Please enter your last name.", ...echo };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", ...echo };
  if (password.length < 10)
    return { error: "Use a password of at least 10 characters.", ...echo };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists. Sign in instead.", ...echo };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, firstName, lastName, email, passwordHash, termsAcceptedAt: new Date(), termsVersion: LEGAL.version },
  });
  await audit(user.id, "user.register", user.id, `terms ${LEGAL.version}`);
  await sendVerification(user.id, email, firstName);

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  return {};
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  // A request the provider would reject before its limiter runs (empty or
  // absurd password) gets the generic answer here, so a cheap probe cannot
  // reach the account lookup below without paying for a sign-in attempt.
  if (!password || password.length > 200 || !EMAIL_RE.test(email)) return { error: "Email or password is incorrect.", email };
  // Rate limiting happens inside the credentials provider (src/auth.ts),
  // so the raw Auth.js callback URL is covered by the same budget.
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (err) {
    // signIn throws a redirect on success; rethrow those
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    if (err instanceof RateLimited) return { error: retryMessage(err.wait), email };
    return { ...(await explainFailure(email)), email };
  }
  return {};
}

// After a failed sign-in, say whether the email has an account at all. The
// create-account form already confirms existence (it must), so this adds
// no new disclosure, but it sits behind the same per-IP limiter as that
// check so nobody can sweep a list of addresses through it.
async function explainFailure(email: string): Promise<FormState> {
  const generic = { error: "Email or password is incorrect." };
  if (!EMAIL_RE.test(email)) return generic;
  if (await rateLimit("checkEmail", await clientIp())) return generic;
  const user = await db.user.findUnique({ where: { email }, select: { passwordHash: true } });
  if (!user) return { error: "No account exists for this email yet.", noAccount: true };
  if (!user.passwordHash) return { error: "This email signs in with Google, Facebook or Apple. Use that button instead." };
  return generic;
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
  const wait = await rateLimit("checkEmail", await clientIp());
  if (wait) return { error: retryMessage(wait) };
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
  // One portfolio per learner per course, enforced by a unique key so two
  // parallel requests cannot produce two cases that get evaluated twice.
  try {
    await db.portfolio.create({ data: { userId, courseId: course.id } });
    await audit(userId, "portfolio.create", course.slug);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code !== "P2002") throw err;
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

// Records an uploaded file as evidence. The browser has already put the
// bytes in storage under a key this server scoped to the portfolio and
// outcome; here the key is checked against that scope, the object is
// confirmed to exist, and its size and type are taken from storage, not
// from the client.
export type AttachState = { error?: string };

export async function attachUpload(
  portfolioId: string,
  outcomeId: string,
  key: string,
  originalName: string
): Promise<AttachState> {
  const userId = await requireUserId();
  if (!isKeyFor(key, portfolioId, outcomeId)) return { error: "That file does not belong here." };
  const ext = extensionOf(originalName) ?? extensionOf(key);
  if (!ext) return { error: "That file type is not accepted." };
  const stored = await headFile(key);
  if (!stored) return { error: "The upload did not finish. Try again." };
  if (stored.size > MAX_UPLOAD_BYTES || stored.size === 0) {
    await deleteFile(key);
    return { error: "Files must be between 1 byte and 25 MB." };
  }
  const fileType = ALLOWED_TYPES[ext];
  const name = originalName.split(/[\\/]/).pop()?.slice(0, 200) || key.split("/").pop()!;
  const done = await editableTx(async (tx) => {
    const portfolio = await tx.portfolio.findFirst({
      where: { id: portfolioId, userId, status: { in: ["DRAFT", "REVISIONS_REQUESTED"] } },
      include: { course: { include: { outcomes: true } } },
    });
    if (!portfolio) throw new Error("not editable");
    if (!portfolio.course.outcomes.some((o) => o.id === outcomeId)) throw new Error("bad outcome");
    await tx.evidence.create({
      data: {
        portfolioId,
        outcomeId,
        title: name,
        kind: KIND_BY_EXT[ext] ?? "Work sample",
        fileKey: key,
        fileName: name,
        fileSize: stored.size,
        fileType,
      },
    });
    return true;
  });
  if (!done) {
    await deleteFile(key);
    return { error: "This portfolio can no longer be changed." };
  }
  await audit(userId, "evidence.upload", portfolioId, `${name} ${stored.size}B`);
  revalidatePath(`/portfolio/${portfolioId}`);
  return {};
}

const KIND_BY_EXT: Record<string, string> = {
  pdf: "Document",
  docx: "Document",
  txt: "Document",
  xlsx: "Spreadsheet",
  csv: "Spreadsheet",
  pptx: "Presentation",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
};

export async function removeEvidence(evidenceId: string) {
  const userId = await requireUserId();
  const removed = await editableTx(async (tx) => {
    const evidence = await tx.evidence.findUnique({
      where: { id: evidenceId },
      include: { portfolio: true },
    });
    if (!evidence || evidence.portfolio.userId !== userId) throw new Error("not owner");
    if (!EDITABLE.has(evidence.portfolio.status)) throw new Error("not editable");
    await tx.evidence.delete({ where: { id: evidenceId } });
    return { portfolioId: evidence.portfolioId, fileKey: evidence.fileKey };
  });
  if (removed) {
    if (removed.fileKey) await deleteFile(removed.fileKey);
    revalidatePath(`/portfolio/${removed.portfolioId}`);
  }
}

async function requireVerified(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { emailVerifiedAt: true } });
  if (!u?.emailVerifiedAt) redirect("/dashboard?unverified=1");
}

export async function submitPortfolio(portfolioId: string) {
  const userId = await requireUserId();
  await requireVerified(userId);
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
    // Free tier: one portfolio evaluated. Further submissions need premium.
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.premium) {
      const others = await tx.portfolio.count({
        where: { userId, id: { not: portfolioId }, status: { not: "DRAFT" } },
      });
      if (others >= 1) throw new Error("premium-required");
    }
    await tx.portfolio.update({
      where: { id: portfolioId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
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
  if (!done && !(await db.user.findUnique({ where: { id: userId } }))?.premium) {
    const others = await db.portfolio.count({
      where: { userId, id: { not: portfolioId }, status: { not: "DRAFT" } },
    });
    if (others >= 1) redirect("/upgrade?reason=limit");
  }
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
    await notifyDecision(portfolioId, status);
  }
  revalidatePath(`/portfolio/${portfolioId}`);
  revalidatePath("/review");
  redirect("/review");
}

// The learner hears about a decision by email, with a link back to the
// portfolio. The note itself stays on the page, behind sign-in.
async function notifyDecision(portfolioId: string, status: "APPROVED" | "DENIED" | "REVISIONS_REQUESTED") {
  try {
    const p = await db.portfolio.findUnique({
      where: { id: portfolioId },
      include: { user: { select: { email: true, firstName: true, name: true } }, course: { select: { code: true, title: true, credits: true } } },
    });
    if (!p) return;
    const origin = await siteOrigin();
    const first = p.user.firstName || p.user.name?.split(" ")[0] || "there";
    const line =
      status === "APPROVED"
        ? `Credit recommended: ${p.course.credits} credits for ${p.course.code} ${p.course.title}.`
        : status === "DENIED"
          ? `Your portfolio for ${p.course.code} ${p.course.title} was not approved.`
          : `The evaluator has asked for revisions to your portfolio for ${p.course.code} ${p.course.title}.`;
    await sendEmail(
      p.user.email,
      status === "APPROVED" ? `Credit recommended for ${p.course.code}` : `A decision on your ${p.course.code} portfolio`,
      `Hi ${first},\n\n${line}\n\nThe evaluator's score and note are on your portfolio page:\n\n${origin}/portfolio/${p.id}\n\n${
        status === "APPROVED"
          ? "The full plan includes the portfolio as a PDF to take to your college's registrar."
          : status === "REVISIONS_REQUESTED"
            ? "Update the outcomes the note names and submit again whenever you are ready."
            : "You can start a portfolio for another course at any time."
      }`
    );
  } catch {
    // A missing email must never block the decision itself.
  }
}

// Puts a claimed case back in the open queue. A reviewer may release their
// own claim; an admin may release anyone's, so one evaluator can never
// hold the whole queue hostage.
export async function releaseReview(portfolioId: string) {
  const actorId = await requireReviewer();
  const actor = await db.user.findUnique({ where: { id: actorId }, select: { role: true } });
  const updated = await db.portfolio.updateMany({
    where: {
      id: portfolioId,
      status: "UNDER_REVIEW",
      ...(actor?.role === "ADMIN" ? {} : { evaluatorId: actorId }),
    },
    data: { status: "SUBMITTED", evaluatorId: null },
  });
  if (updated.count > 0) await audit(actorId, "review.release", portfolioId);
  revalidatePath("/review");
  revalidatePath("/admin");
  revalidatePath(`/portfolio/${portfolioId}`);
}

// ── Payments ─────────────────────────────────────────────────────────────
// Checkout creates a pending Payment row and sends the user to Stripe.
// Premium is granted only by the webhook (src/app/api/stripe/webhook).

export async function startCheckout() {
  const userId = await requireUserId();
  const { stripe, stripeConfigured, PREMIUM_PRICE_USD } = await import("@/lib/stripe");
  if (!stripeConfigured) redirect("/upgrade");
  await requireVerified(userId);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/signin");
  if (user.premium) redirect("/dashboard");

  const origin = await siteOrigin();

  const priceId = process.env.STRIPE_PRICE_ID;
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: userId,
    metadata: { userId },
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: PREMIUM_PRICE_USD * 100,
              product_data: {
                name: "SkillBridge full portfolio",
                description: "Unlimited credit portfolios and faculty evaluations. One payment, nothing recurring.",
              },
            },
          },
    ],
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/upgrade`,
  });

  await db.payment.upsert({
    where: { stripeSessionId: session.id },
    update: {},
    create: { userId, stripeSessionId: session.id, amountUSD: PREMIUM_PRICE_USD },
  });
  await audit(userId, "payment.checkout_started", session.id);
  redirect(session.url ?? "/upgrade");
}

// ── Roles, invitations, admin ────────────────────────────────────────────
// Reviewer and admin accounts exist only by invitation from an admin.

async function requireAdmin(): Promise<string> {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") redirect("/dashboard");
  return userId;
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type InviteState = { error?: string; link?: string; email?: string };

export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const adminId = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "REVIEWER") === "ADMIN" ? "ADMIN" : "REVIEWER";
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  const token = randomToken();
  await db.invite.create({
    data: {
      token,
      email,
      role,
      createdBy: adminId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await audit(adminId, "invite.create", email, role);
  const origin = await siteOrigin();
  revalidatePath("/admin");
  return { link: `${origin}/invite/${token}`, email };
}

export async function revokeInvite(inviteId: string) {
  const adminId = await requireAdmin();
  const invite = await db.invite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.acceptedAt) return;
  await db.invite.delete({ where: { id: inviteId } });
  await audit(adminId, "invite.revoke", invite.email);
  revalidatePath("/admin");
}

export async function acceptInvite(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "This invitation is no longer valid. Ask the admin for a new one." };
  }
  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 100);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 100);
  const name = `${firstName} ${lastName}`.trim();
  const password = String(formData.get("password") ?? "");
  const echo = { firstName, lastName };
  const ip = await clientIp();
  const wait = await rateLimit("register", ip);
  if (wait) return { error: retryMessage(wait), ...echo };
  if (!firstName) return { error: "Please enter your first name.", ...echo };
  if (!lastName) return { error: "Please enter your last name.", ...echo };
  if (password.length < 10) return { error: "Use a password of at least 10 characters.", ...echo };

  const existing = await db.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return {
      error: "An account with the invited email already exists. Sign in with it, then open this link again.",
      ...echo,
    };
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { name, firstName, lastName, email: invite.email, passwordHash, role: invite.role, emailVerifiedAt: new Date(), termsAcceptedAt: new Date(), termsVersion: LEGAL.version },
    });
    await tx.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });
    return u;
  });
  await audit(user.id, "invite.accept", invite.email, invite.role);
  await signIn("credentials", { email: invite.email, password, redirectTo: "/dashboard" });
  return {};
}

// A signed-in user whose email matches the invite is promoted in place.
export async function acceptInviteSignedIn(token: string) {
  const userId = await requireUserId();
  const invite = await db.invite.findUnique({ where: { token } });
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!invite || !user || invite.acceptedAt || invite.expiresAt < new Date()) redirect("/dashboard");
  if (user.email !== invite.email) redirect("/dashboard");
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { role: invite.role } }),
    db.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);
  await audit(userId, "invite.accept", invite.email, invite.role);
  redirect("/dashboard");
}


// ── Email verification and password reset ────────────────────────────────

export async function resendVerification() {
  const userId = await requireUserId();
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.emailVerifiedAt) redirect("/dashboard");
  const wait = await rateLimit("verifyResend", userId);
  if (wait) redirect("/dashboard?unverified=1&wait=1");
  await sendVerification(user.id, user.email, user.firstName);
  redirect("/dashboard?unverified=1&sent=1");
}

export async function confirmVerification(token: string) {
  if (!dbConfigured) redirect("/");
  const userId = await consumeToken(token, "verify");
  if (!userId) redirect("/verify/invalid");
  await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  await audit(userId, "user.email_verified", userId);
  redirect("/dashboard?verified=1");
}

// Always answers the same way, so it cannot be used to probe accounts.
export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email };
  const ip = await clientIp();
  const wait = (await rateLimit("reset", email)) ?? (await rateLimit("reset", ip));
  if (wait) return { error: retryMessage(wait), email };
  const user = await db.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = await issueToken(user.id, "reset");
    const origin = await siteOrigin();
    await sendEmail(
      email,
      "Reset your SkillBridge password",
      `Hi ${user.firstName ?? "there"},\n\nSet a new password here:\n\n${origin}/reset/${token}\n\nThe link works once and expires in 1 hour. If you did not ask for this, you can ignore it; your password stays the same.`
    );
    await audit(user.id, "user.reset_requested", email);
  } else if (user) {
    await sendEmail(
      email,
      "Your SkillBridge sign-in",
      `Hi ${user.firstName ?? "there"},\n\nThis account signs in with a social provider (Google, Facebook or Apple), so it has no password to reset. Use the provider's button on the sign-in page.`
    );
  }
  return { notice: "If an account exists for that email, a reset link is on its way. Check your inbox." };
}

export async function resetPassword(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!dbConfigured) return { error: "Accounts are not available yet on this deployment." };
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) return { error: "Use a password of at least 10 characters." };
  const userId = await consumeToken(token, "reset");
  if (!userId) return { error: "This reset link is no longer valid. Request a new one." };
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, emailVerifiedAt: new Date(), sessionVersion: { increment: 1 } },
  });
  await audit(userId, "user.password_reset", userId);
  redirect("/signin?reset=1");
}
