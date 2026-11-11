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
  await L.locator('button:has-text("Mark done")').first().click();
  await L.waitForSelector("text=1 of 8 lessons", { timeout: 20000 });
  ok("lesson progress");
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

  // ── 2. Auth dialog branches ───────────────────────────────────────
  section("Auth dialog");
  const M = await (await ctx()).newPage();
  await M.goto(BASE);
  await M.click('button:has-text("Join free")');
  await M.waitForSelector("text=Log in or create account");
  const modalEmail = `modal${stamp}@example.com`;
  await M.fill("#modal-email", modalEmail);
  await M.click('button:has-text("Continue")');
  await M.waitForSelector("text=Create your account");
  await M.fill("#modal-first", "Modal");
  await M.fill("#modal-last", "User");
  await M.fill("#modal-password", PASS);
  await M.click('button:has-text("Create free account")');
  await M.waitForURL("**/dashboard", { timeout: 30000 });
  ok("new email -> create account -> dashboard");
  await M.click('button:has-text("Sign out")');
  await M.waitForURL(BASE + "/", { timeout: 30000 });
  await M.click('button:has-text("Sign in")');
  await M.fill("#modal-email", modalEmail);
  await M.click('button:has-text("Continue")');
  await M.waitForSelector("text=Welcome back");
  if (await M.locator("#modal-first").count()) throw new Error("existing email got the name fields");
  await M.fill("#modal-password", PASS);
  await M.click('[role=dialog] button[type=submit]:has-text("Sign in")');
  await M.waitForURL("**/dashboard", { timeout: 30000 });
  ok("existing email -> welcome back -> sign in");
  await M.goto(BASE + "/upgrade");
  await M.click('button:has-text("Upgrade for $99")');
  await M.waitForURL("**/dashboard?unverified=1", { timeout: 30000 });
  await M.waitForSelector("text=Confirm your email first.");
  ok("unverified account gated from paying");
  await M.goto(BASE);
  await M.click('button:has-text("Join free")');
  await M.keyboard.press("Escape");
  await M.waitForSelector("text=Log in or create account", { state: "detached" });
  ok("escape closes");

  // ── 3. Portfolio loop: document, submit, evaluate, see result ─────
  section("Portfolio loop");
  await L.goto(BASE + "/courses/business-communication");
  await L.click("text=Get credit for experience instead");
  await L.waitForURL("**/dashboard", { timeout: 30000 });
  await L.locator("text=Open portfolio").first().click();
  await L.waitForSelector("text=0 of 3 outcomes documented");
  await documentOutcomes(L, 3, "For six years I wrote the weekly operations memo for a 40-person office, edited every client-facing letter, and rebuilt our proposal template so new staff could produce clean documents without supervision.");
  ok("3 outcomes documented");
  await L.fill("#evidence-title-0", "Proposal template v4.docx");
  await L.locator('button:has-text("Add evidence")').first().click();
  await L.waitForSelector("text=Proposal template v4.docx");
  ok("evidence added");
  await L.click('button:has-text("Submit portfolio")');
  await L.waitForSelector("text=Submitted — waiting for an evaluator", { timeout: 20000 });
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
  await R.selectOption("#score", "5");
  await R.fill("#note", "Clear, well-evidenced writing portfolio. The proposal template and presentation history demonstrate each outcome at course level.");
  await R.click('button:has-text("Recommend credit")');
  await R.waitForURL("**/review", { timeout: 30000 });
  await R.waitForSelector("text=Credit recommended · 5/5");
  ok("decision recorded, shows in Completed");

  await L.goto(BASE + "/dashboard");
  await L.waitForSelector("text=Approved — credit recommended · 3 credits · score 5/5");
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
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  r = await fetch(url, { method: "POST", headers: { "stripe-signature": sig }, body: payload });
  if (r.status !== 200) throw new Error("webhook failed: " + r.status);
  await fetch(url, { method: "POST", headers: { "stripe-signature": sig }, body: payload });
  const audits = await pg.query(`select count(*)::int as n from "AuditLog" where action='payment.verified' and target=$1`, [sessionId]);
  if (audits.rows[0].n !== 1) throw new Error("webhook not idempotent: " + audits.rows[0].n);
  ok("verified webhook grants premium once (idempotent)");
  await L.goto(BASE + `/upgrade/success?session_id=${sessionId}`);
  await L.waitForSelector("text=You're on the full plan.");
  await L.goto(builderUrl);
  await L.click('button:has-text("Submit portfolio")');
  await L.waitForSelector("text=Submitted — waiting for an evaluator", { timeout: 30000 });
  ok("submission allowed after verified payment");

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
    await T.waitForSelector("text=Email or password is incorrect");
  }
  await signIn(T, target, "wrong-password-xx");
  await T.waitForSelector("text=Too many attempts");
  ok("11th failed sign-in in 15 minutes is blocked");

  await pg.end();
  await browser.close();
  console.log("\nALL E2E PASSED");
})().catch(async (e) => {
  console.error(`\nE2E FAILED in "${step}": ${e.message}`);
  process.exit(1);
});
