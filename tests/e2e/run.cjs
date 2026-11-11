// End-to-end suite. Runs against a built server (BASE_URL) backed by a
// real Postgres seeded with SEED_DEV_USERS=1. Sequential on purpose: later
// scenarios reuse state earlier ones create. Exit code 1 on any failure.
//
//   BASE_URL=http://localhost:3000 DATABASE_URL=... STRIPE_WEBHOOK_SECRET=... node tests/e2e/run.cjs

const { chromium } = require("playwright");
const Stripe = require("stripe");
const { Client } = require("pg");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const DEV_PASS = process.env.SEED_DEV_PASSWORD || "dev-reviewer-pass";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_testsecret_0123456789";
const PASS = "correct-horse-battery";
const stamp = Date.now();

let step = "";
const ok = (msg) => console.log(`  ✓ ${msg}`);
const section = (name) => { step = name; console.log(`\n${name}`); };

async function latestLink(pg, to, pathPrefix) {
  for (let i = 0; i < 20; i++) {
    const { rows } = await pg.query(`select text from "Email" where "to"=$1 order by "createdAt" desc limit 1`, [to]);
    const m = rows[0] && rows[0].text.match(new RegExp(`https?://[^\\s]+${pathPrefix}[^\\s]+`));
    if (m) return m[0].replace(/^https?:\/\/[^/]+/, BASE);
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no ${pathPrefix} link emailed to ${to}`);
}

async function signIn(page, email, password) {
  await page.goto(BASE + "/signin");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type=submit]:has-text("Sign in")');
}

async function register(page, first, last, email) {
  await page.goto(BASE + "/join");
  await page.fill("#join-first", first);
  await page.fill("#join-last", last);
  await page.fill("#email", email);
  await page.fill("#password", PASS);
  await page.click('button:has-text("Create free account")');
  await page.waitForURL("**/dashboard", { timeout: 30000 });
}

async function documentOutcomes(page, count, story) {
  for (let i = 0; i < count; i++) {
    await page.fill(`#narrative-${i}`, story);
    await page.locator('button:has-text("Save this outcome")').nth(i).click();
    await page.waitForSelector(`text=${i + 1} of ${count} outcomes documented`, { timeout: 20000 });
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  const ctx = () => browser.newContext({ viewport: { width: 1280, height: 950 } });
  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  await pg.connect();

  // ── 1. Accounts, enrollment, progress ──────────────────────────────
  section("Accounts and progress");
  const learnerEmail = `learner${stamp}@example.com`;
  const learnerLast = `Learner${stamp % 100000}`;
  const L = await (await ctx()).newPage();
  await register(L, "Loop", learnerLast, learnerEmail);
  ok("register -> dashboard");
  await L.waitForSelector("text=One step left: confirm your email.");
  const verifyLink = await latestLink(pg, learnerEmail, "/verify/");
  await L.goto(verifyLink);
  await L.click('button:has-text("Confirm my email")');
  await L.waitForURL("**/dashboard?verified=1", { timeout: 30000 });
  await L.waitForSelector("text=Email confirmed. Everything is unlocked.");
  ok("email verification via emailed link");
  await L.goto(verifyLink);
  await L.click('button:has-text("Confirm my email")');
  await L.waitForURL("**/verify/invalid", { timeout: 30000 });
  ok("verification link single-use");
  await L.goto(BASE + "/courses/principles-of-management");
  await L.click("text=Enroll free");
  await L.waitForURL("**/dashboard", { timeout: 30000 });
  await L.waitForSelector("text=Principles of Management");
  ok("enroll");
  // A lesson is a real reading with its own page; marking it read there
  // shows on the dashboard.
  await L.locator('a:has-text("What managers actually do")').first().click();
  await L.waitForURL("**/courses/principles-of-management/lessons/1", { timeout: 30000 });
  await L.waitForSelector('h2:has-text("What an evaluator looks for")');
  await L.waitForSelector("text=A worked example");
  await L.click('button:has-text("Mark as Read")');
  await L.waitForSelector("text=Mark as Unread", { timeout: 20000 });
  await L.click('a:has-text("Next: Setting goals that hold up")');
  await L.waitForURL("**/lessons/2", { timeout: 30000 });
  await L.goto(BASE + "/dashboard");
  await L.waitForSelector("text=1 of 8 lessons", { timeout: 20000 });
  ok("lesson reading page, marked read, progress on dashboard");
  await L.click('button:has-text("Sign out")');
  await L.waitForURL(BASE + "/", { timeout: 30000 });
  await L.goto(BASE + "/dashboard");
  await L.waitForSelector("text=Sign in to see your courses");
  ok("dashboard gated when signed out");
  await signIn(L, learnerEmail, "wrong-password-here");
  await L.waitForSelector("text=Email or password is incorrect");
  ok("wrong password rejected");
  await signIn(L, learnerEmail, PASS);
  await L.waitForURL("**/dashboard", { timeout: 30000 });
  await L.waitForSelector("text=1 of 8 lessons");
  ok("sign in, progress persisted");

  // ── 2. Auth dialogs: Create account and Sign in are separate, and link to each other ──
  section("Auth dialogs");
  const M = await (await ctx()).newPage();
  await M.goto(BASE);
  await M.click('button:has-text("Join free")');
  await M.waitForSelector("text=Create your SkillBridge account");
  const modalEmail = `modal${stamp}@example.com`;
  await M.fill("#modal-first", "Modal");
  await M.fill("#modal-last", "User");
  await M.fill("#modal-email", modalEmail);
  await M.fill("#modal-password", PASS);
  await M.click('[role=dialog] button:has-text("Create free account")');
  await M.waitForURL("**/dashboard", { timeout: 30000 });
  ok("create-account dialog -> dashboard");
  await M.click('button:has-text("Sign out")');
  await M.waitForURL(BASE + "/", { timeout: 30000 });
  await M.click('header button:has-text("Sign in")');
  await M.waitForSelector("text=Welcome back");
  if (await M.locator("#modal-first").count()) throw new Error("sign-in dialog shows name fields");
  await M.click('[role=dialog] button:has-text("Create a free account")');
  await M.waitForSelector("text=Create your SkillBridge account");
  await M.click('[role=dialog] button:has-text("Sign in")');
  await M.waitForSelector("text=Welcome back");
  ok("dialogs link to each other both ways");
  await M.fill("#modal-email", modalEmail);
  await M.fill("#modal-password", PASS);
  await M.click('[role=dialog] button[type=submit]:has-text("Sign in")');
  await M.waitForURL("**/dashboard", { timeout: 30000 });
  ok("sign-in dialog -> dashboard");
  await M.goto(BASE + "/");
  await M.waitForSelector('header button:has-text("Sign out")');
  if (await M.locator('header button:has-text("Sign in")').count()) throw new Error("header still offers Sign in while signed in");
  ok("header shows Sign out, not Sign in, while signed in");

  // An email with no account is told so, with the create-account dialog one click away.
  const N = await (await ctx()).newPage();
  await N.goto(BASE + "/");
  await N.click('header button:has-text("Sign in")');
  await N.fill("#modal-email", `nobody${stamp}@example.com`);
  await N.fill("#modal-password", "whatever-password-1");
  await N.click("[role=dialog] button[type=submit]");
  await N.waitForSelector("text=No account exists for this email yet.");
  await N.click('[role=alert] button:has-text("Create a free account")');
  await N.waitForSelector("#modal-first");
  ok("unknown email on sign-in -> offered create account");
  await M.goto(BASE + "/upgrade");
  await M.click('button:has-text("Upgrade for $99")');
  await M.waitForURL("**/dashboard?unverified=1", { timeout: 30000 });
  await M.waitForSelector("text=Confirm your email first.");
  ok("unverified account gated from paying");
  await M.goto(BASE);
  await M.click('header button:has-text("Sign out")');
  await M.waitForSelector('header button:has-text("Join free")');
  await M.click('button:has-text("Join free")');
  await M.fill("#modal-first", "Dup");
  await M.fill("#modal-last", "User");
  await M.fill("#modal-email", modalEmail);
  await M.fill("#modal-password", PASS);
  await M.click('[role=dialog] button:has-text("Create free account")');
  await M.waitForSelector("text=already exists");
  await M.click('[role=dialog] button:has-text("Sign in instead")');
  await M.waitForSelector("text=Welcome back");
  ok("existing email on create -> offered sign in");
  await M.keyboard.press("Escape");
  await M.waitForSelector("text=Welcome back", { state: "detached" });
  ok("escape closes");
  // Back in as this learner: later checks use M as "another learner".
  await M.click('header button:has-text("Sign in")');
  await M.fill("#modal-email", modalEmail);
  await M.fill("#modal-password", PASS);
  await M.click('[role=dialog] button[type=submit]:has-text("Sign in")');
  await M.waitForURL("**/dashboard", { timeout: 30000 });

  // ── 3. Portfolio loop: document, submit, evaluate, see result ─────
  section("Portfolio loop");
  await L.goto(BASE + "/courses/business-communication");
  await L.click("text=Get credit for experience instead");
  await L.waitForURL("**/dashboard", { timeout: 30000 });
  await L.locator("text=Open portfolio").first().click();
  await L.waitForSelector("text=0 of 3 outcomes documented");
  await documentOutcomes(L, 3, "For six years I wrote the weekly operations memo for a 40-person office, edited every client-facing letter, and rebuilt our proposal template so new staff could produce clean documents without supervision.");
  ok("3 outcomes documented");
  await L.locator("summary", { hasText: "Name a document you cannot upload" }).first().click();
  await L.fill("#evidence-title-0", "Proposal template v4.docx");
  await L.locator('button:has-text("Add evidence")').first().click();
  await L.waitForSelector("text=Proposal template v4.docx");
  ok("evidence added");

  // A real file: uploaded, listed with its size, downloadable by the owner.
  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n");
  await L.setInputFiles("#evidence-file-0", { name: "Performance review 2024.pdf", mimeType: "application/pdf", buffer: pdfBytes });
  await L.waitForSelector("text=Attached", { timeout: 30000 });
  await L.waitForSelector("li >> text=Performance review 2024.pdf", { timeout: 30000 });
  await L.waitForSelector("text=Document · ");
  ok("file uploaded and listed as evidence");
  const { rows: ev } = await pg.query(
    `select e.id, e."fileKey", e."fileSize" from "Evidence" e join "Portfolio" p on p.id=e."portfolioId" join "User" u on u.id=p."userId" where e."fileName"=$1 and u.email=$2`,
    ["Performance review 2024.pdf", learnerEmail]
  );
  if (ev.length !== 1 || !ev[0].fileKey || ev[0].fileSize !== pdfBytes.length) throw new Error("evidence row wrong: " + JSON.stringify(ev));
  const evidenceId = ev[0].id;
  const ownerDl = await L.request.get(BASE + `/api/evidence/${evidenceId}/file`);
  const ownerBody = await ownerDl.body();
  if (ownerDl.status() !== 200 || !ownerBody.equals(pdfBytes) || !/attachment/.test(ownerDl.headers()["content-disposition"] ?? "") || ownerDl.headers()["content-security-policy"] !== "sandbox; default-src 'none'") {
    throw new Error(`owner download wrong: ${ownerDl.status()} ${JSON.stringify(ownerDl.headers())}`);
  }
  ok("owner downloads the exact bytes, as a sandboxed attachment");

  // Wrong type and spoofed type are refused before anything is stored.
  const html = Buffer.from("<script>alert(1)</script>");
  const badType = await L.request.post(BASE + "/api/evidence/upload", { multipart: { file: { name: "evil.html", mimeType: "text/html", buffer: html }, portfolioId: "x", outcomeId: "y" } });
  const spoofed = await L.request.post(BASE + "/api/evidence/upload", { multipart: { file: { name: "evil.pdf", mimeType: "application/pdf", buffer: html }, portfolioId: ev[0].fileKey.split("/")[1], outcomeId: ev[0].fileKey.split("/")[2] } });
  if (badType.status() !== 400 || spoofed.status() !== 400) throw new Error(`type checks: ${badType.status()} ${spoofed.status()}`);
  ok("html upload and html-disguised-as-pdf both refused");
  await L.click('button:has-text("Submit portfolio")');
  await L.waitForSelector('h2:has-text("Submitted")', { timeout: 20000 });
  await L.waitForSelector("text=Your portfolio is in the queue");
  ok("submitted (first evaluation is free)");
  await L.goto(BASE + "/review");
  await L.waitForURL("**/dashboard", { timeout: 20000 });
  ok("learner blocked from /review");

  const R = await (await ctx()).newPage();
  await signIn(R, "reviewer@dev.local", DEV_PASS);
  await R.waitForURL("**/review", { timeout: 30000 });
  ok("reviewer lands on evaluator dashboard");
  await R.locator("li", { hasText: learnerLast }).locator('button:has-text("Start evaluation")').first().click();
  await R.waitForURL("**/portfolio/**", { timeout: 30000 });
  await R.waitForSelector("text=Proposal template v4.docx");
  ok("reviewer sees portfolio and evidence");
  const revDl = await R.request.get(BASE + `/api/evidence/${evidenceId}/file`);
  if (revDl.status() !== 200 || !(await revDl.body()).equals(pdfBytes)) throw new Error("assigned reviewer cannot download: " + revDl.status());
  const dlAudit = await pg.query(`select count(*)::int as n from "AuditLog" where action='evidence.download' and target=$1`, [evidenceId]);
  if (dlAudit.rows[0].n !== 1) throw new Error("staff download not audited");
  ok("assigned evaluator downloads the file, and it is audited");

  // A claimed case can be returned to the queue, then claimed again.
  await R.goto(BASE + "/review");
  await R.locator("li", { hasText: learnerLast }).locator('button:has-text("Return to queue")').first().click();
  await R.waitForSelector("text=Waiting for an evaluator");
  await R.locator("li", { hasText: learnerLast }).locator('button:has-text("Start evaluation")').first().click();
  await R.waitForURL("**/portfolio/**", { timeout: 30000 });
  ok("claimed review returned to the queue and claimed again");
  await R.selectOption("#score", "5");
  await R.fill("#note", "Clear, well-evidenced writing portfolio. The proposal template and presentation history demonstrate each outcome at course level.");
  await R.click('button:has-text("Recommend credit")');
  await R.waitForURL("**/review", { timeout: 30000 });
  await R.waitForSelector("text=Credit recommended · 5/5");
  ok("decision recorded, shows in Completed");

  await L.goto(BASE + "/dashboard");
  await L.waitForSelector("text=3 credits · score 5 of 5");
  const decisionMail = await pg.query(`select count(*)::int as n from "Email" where "to"=$1 and subject like 'Credit recommended for %'`, [learnerEmail]);
  if (decisionMail.rows[0].n !== 1) throw new Error("decision email not sent: " + decisionMail.rows[0].n);
  ok("learner sees approval");

  // ── 4. Premium gate and Stripe webhook ────────────────────────────
  section("Payments");
  await L.goto(BASE + "/courses/user-support-fundamentals");
  await L.click("text=Get credit for experience instead");
  await L.waitForURL("**/dashboard", { timeout: 30000 });
  await L.goto(BASE + "/dashboard");
  await L.locator("text=Open portfolio").first().click();
  await L.waitForSelector("text=outcomes documented");
  await documentOutcomes(L, 3, "I ran the help desk for seven years: triaged tickets, reproduced faults, wrote plain-language fixes for staff, and trained every new hire on our queue and escalation process.");
  const builderUrl = L.url();
  await L.click('button:has-text("Submit portfolio")');
  await L.waitForURL("**/upgrade?reason=limit", { timeout: 30000 });
  await L.waitForSelector("text=Upgrade for $99");
  ok("second submission gated -> upgrade page");

  const { rows } = await pg.query(`select id from "User" where email=$1`, [learnerEmail]);
  const userId = rows[0].id;
  const stripe = new Stripe("sk_test_dummy");
  const sessionId = `cs_test_${stamp}`;
  const payload = JSON.stringify({ id: `evt_${stamp}`, object: "event", type: "checkout.session.completed",
    data: { object: { id: sessionId, object: "checkout.session", payment_status: "paid", amount_total: 9900, metadata: { userId } } } });
  const url = BASE + "/api/stripe/webhook";
  let r = await fetch(url, { method: "POST", headers: { "stripe-signature": "t=1,v1=deadbeef" }, body: payload });
  if (r.status !== 400) throw new Error("bad signature accepted: " + r.status);
  ok("webhook rejects bad signature");
  const signed = (p) => ({ method: "POST", headers: { "stripe-signature": stripe.webhooks.generateTestHeaderString({ payload: p, secret: WEBHOOK_SECRET }) }, body: p });
  const premiumNow = async () => (await pg.query(`select premium from "User" where id=$1`, [userId])).rows[0].premium;

  // A properly signed, paid session this app never created must grant nothing
  // (Stripe sends every session in the account, Payment Links included).
  r = await fetch(url, signed(payload));
  if (r.status !== 200 || (await premiumNow())) throw new Error("unknown session granted premium");
  ok("webhook ignores a paid session this app did not create");

  await pg.query(`insert into "Payment" (id, "userId", "stripeSessionId", "amountUSD") values ($1, $2, $3, 99)`, [`pay_${stamp}`, userId, sessionId]);
  const cheap = JSON.stringify({ id: `evt_cheap_${stamp}`, object: "event", type: "checkout.session.completed",
    data: { object: { id: sessionId, object: "checkout.session", payment_status: "paid", amount_total: 500, currency: "usd", metadata: { userId } } } });
  r = await fetch(url, signed(cheap));
  if (r.status !== 200 || (await premiumNow())) throw new Error("underpaid session granted premium");
  ok("webhook rejects a session paid below the plan price");

  const paid = JSON.stringify({ id: `evt_${stamp}`, object: "event", type: "checkout.session.completed",
    data: { object: { id: sessionId, object: "checkout.session", payment_status: "paid", amount_total: 9900, currency: "usd", payment_intent: `pi_${stamp}`, metadata: { userId } } } });
  r = await fetch(url, signed(paid));
  if (r.status !== 200) throw new Error("webhook failed: " + r.status);
  await fetch(url, signed(paid));
  const audits = await pg.query(`select count(*)::int as n from "AuditLog" where action='payment.verified' and target=$1`, [sessionId]);
  if (audits.rows[0].n !== 1 || !(await premiumNow())) throw new Error("webhook not idempotent: " + audits.rows[0].n);
  ok("verified webhook grants premium once (idempotent)");
  await L.goto(BASE + `/upgrade/success?session_id=${sessionId}`);
  await L.waitForSelector("text=You're on the full plan.");
  await L.goto(builderUrl);
  await L.click('button:has-text("Submit portfolio")');
  await L.waitForSelector('h2:has-text("Submitted")', { timeout: 30000 });
  ok("submission allowed after verified payment");
  const { rows: pf } = await pg.query(`select p.id from "Portfolio" p join "Course" c on c.id=p."courseId" where p."userId"=$1 and c.code='BUS110'`, [userId]);
  const pdfRes = await L.request.get(BASE + `/api/portfolio/${pf[0].id}/pdf`);
  const pdfBody = await pdfRes.body();
  if (pdfRes.status() !== 200 || !pdfRes.headers()["content-type"].includes("application/pdf") || pdfBody.slice(0, 4).toString() !== "%PDF") {
    throw new Error(`pdf export failed: ${pdfRes.status()} ${pdfRes.headers()["content-type"]}`);
  }
  ok(`approved portfolio exported as PDF (${pdfBody.length} bytes)`);

  const refund = JSON.stringify({ id: `evt_refund_${stamp}`, object: "event", type: "charge.refunded",
    data: { object: { id: `ch_${stamp}`, object: "charge", payment_intent: `pi_${stamp}`, refunded: true } } });
  r = await fetch(url, signed(refund));
  if (r.status !== 200 || (await premiumNow())) throw new Error("refund did not withdraw premium");
  const revoked = await pg.query(`select count(*)::int as n from "AuditLog" where action='payment.revoked' and target=$1`, [sessionId]);
  if (revoked.rows[0].n !== 1) throw new Error("refund not audited once: " + revoked.rows[0].n);
  ok("refund webhook withdraws premium");
  if (process.env.PDF_OUT) require("fs").writeFileSync(process.env.PDF_OUT, pdfBody);
  const other = await M.request.get(BASE + `/api/portfolio/${pf[0].id}/pdf`);
  if (other.status() !== 404) throw new Error("another learner could reach the PDF: " + other.status());
  ok("another learner cannot export it");
  const strangerDl = await M.request.get(BASE + `/api/evidence/${evidenceId}/file`);
  if (strangerDl.status() !== 404) throw new Error("stranger downloaded evidence: " + strangerDl.status());
  const anon = await (await browser.newContext()).request.get(BASE + `/api/evidence/${evidenceId}/file`);
  if (anon.status() !== 401) throw new Error("anonymous download: " + anon.status());
  ok("other learner and anonymous visitor cannot download it");

  // ── 5. Roles and invitations ──────────────────────────────────────
  section("Roles and invitations");
  const A = await (await ctx()).newPage();
  await signIn(A, "admin@dev.local", DEV_PASS);
  await A.waitForURL("**/admin", { timeout: 30000 });
  ok("admin lands on /admin");
  const invitee = `evaluator${stamp}@university.edu`;
  await A.fill("#invite-email", invitee);
  await A.click('button:has-text("Create invitation")');
  await A.waitForSelector("text=Send this link");
  const link = (await A.textContent("p.select-all")).trim().replace(/^https?:\/\/[^/]+/, BASE);
  const E = await (await ctx()).newPage();
  await E.goto(link);
  await E.waitForSelector("text=You're invited as an evaluator");
  await E.fill("#invite-first", "Invited");
  await E.fill("#invite-last", "Evaluator");
  await E.fill("#invite-password", "strong-evaluator-pass");
  await E.click('button:has-text("Create evaluator account")');
  await E.waitForURL("**/review", { timeout: 30000 });
  ok("invitee becomes evaluator via link");
  await E.goto(link);
  await E.waitForSelector("text=no longer valid");
  ok("invite link single-use");
  await L.goto(BASE + "/admin");
  await L.waitForURL("**/dashboard", { timeout: 20000 });
  ok("learner blocked from /admin");

  // ── 6. Password reset ─────────────────────────────────────────────
  section("Password reset");
  const F = await (await ctx()).newPage();
  await F.goto(BASE + "/forgot");
  await F.fill("#email", learnerEmail);
  await F.click('button:has-text("Send reset link")');
  await F.waitForSelector("text=a reset link is on its way");
  const resetLink = await latestLink(pg, learnerEmail, "/reset/");
  await F.goto(resetLink);
  const newPass = "brand-new-password-42";
  await F.fill("#reset-password", newPass);
  await F.click('button:has-text("Set new password")');
  await F.waitForURL("**/signin?reset=1", { timeout: 30000 });
  await F.waitForSelector("text=Password updated.");
  ok("reset link sets a new password");
  await signIn(F, learnerEmail, PASS);
  await F.waitForSelector("text=Email or password is incorrect");
  await signIn(F, learnerEmail, newPass);
  await F.waitForURL("**/dashboard", { timeout: 30000 });
  ok("old password rejected, new password works");
  await L.goto(BASE + "/dashboard");
  await L.waitForSelector("text=Sign in to see your courses", { timeout: 30000 });
  ok("older session invalidated by the reset");
  await F.goto(resetLink);
  await F.fill("#reset-password", "another-password-123");
  await F.click('button:has-text("Set new password")');
  await F.waitForSelector("text=no longer valid");
  ok("reset link single-use");

  // ── 7. Rate limiting ──────────────────────────────────────────────
  section("Rate limiting");
  const T = await (await ctx()).newPage();
  const target = `limit${stamp}@example.com`;
  for (let i = 0; i < 10; i++) {
    await signIn(T, target, "wrong-password-xx");
    await T.waitForSelector("text=/No account exists for this email yet|Email or password is incorrect/");
  }
  await signIn(T, target, "wrong-password-xx");
  await T.waitForSelector("text=Too many attempts");
  ok("11th failed sign-in in 15 minutes is blocked");

  // The raw Auth.js callback URL shares the same budget: no side door.
  const csrfRes = await T.request.get(BASE + "/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();
  const raw = await T.request.post(BASE + "/api/auth/callback/credentials", {
    form: { csrfToken, email: target, password: "wrong-password-xx" },
    maxRedirects: 0,
  });
  const loc = raw.headers()["location"] ?? "";
  if (raw.status() !== 302 || !loc.includes("code=rate_limited")) throw new Error(`raw callback not limited: ${raw.status()} ${loc}`);
  ok("raw credentials callback is rate limited too");

  // A correct sign-in by the owner clears the counter: an attacker cannot
  // lock the real owner out by burning the account's budget.
  const ownerEmail = `owner${stamp}@example.com`;
  const O = await (await ctx()).newPage();
  await register(O, "Own", "Er", ownerEmail);
  await O.waitForURL("**/dashboard", { timeout: 30000 });
  await O.goto(BASE + "/signin");
  for (let i = 0; i < 9; i++) {
    await signIn(O, ownerEmail, "wrong-password-xx");
    await O.waitForSelector("text=Email or password is incorrect");
  }
  await signIn(O, ownerEmail, PASS);
  await O.waitForURL("**/dashboard", { timeout: 30000 });
  const left = await pg.query(`select coalesce(sum(count),0)::int as n from "RateLimit" where key like $1`, [`login%:${ownerEmail}%`]);
  if (left.rows[0].n !== 0) throw new Error("owner sign-in did not clear the limiter: " + left.rows[0].n);
  ok("owner's correct sign-in clears the guess counter");

  await pg.end();
  await browser.close();
  console.log("\nALL E2E PASSED");
})().catch(async (e) => {
  console.error(`\nE2E FAILED in "${step}": ${e.message}`);
  process.exit(1);
});
