# SkillBridge

A course platform for working adults, rebuilt from scratch: learn what's new,
get credit for what isn't. Every eligible course doubles as a Prior Learning
Assessment (PLA) pathway: document real experience, attach evidence, and a
faculty evaluator issues a credit recommendation a college can review.

## Why this architecture

The previous SkillBridge was a Vite single-page app. A course marketplace
lives on search traffic, so this build is **Next.js (App Router), server
rendered**: every course has a real URL, metadata, schema.org `Course`
JSON-LD, a sitemap, and robots rules from day one.

- `src/app/`: pages: home, `/catalog` (search + category filter, all
  server-side), `/courses/[slug]` (statically generated per course),
  `/dashboard` (sample data until auth lands)
- `src/lib/catalog.ts`: the typed course content (source of truth; the
  seed script loads it into the database)
- `prisma/schema.prisma`: the data model (users, courses, enrollments,
  progress, portfolios, payments, audit log), live via Prisma + Postgres
- `src/auth.ts`, `src/lib/actions.ts`: Auth.js (credentials + JWT) and
  the server actions: register, sign in, enroll, lesson progress,
  portfolio creation. Every action re-checks the session server-side.
- `scripts/design-lint.mjs`: the design gate, run in CI

## Design language

White canvas, one blue (`#0056D2`), deep navy accent, Source Sans 3, 4px
radii, flat surfaces separated by tone steps. The gate (`npm run
design-lint`) fails the build on gradients, emoji, glass, sparkle icons,
coloured accent stripes, resting shadows, rainbow palettes, and raw hex in
components. Tokens live in `src/app/globals.css`.

## Security posture (the plan, stated up front)

Client code never decides entitlements. When the backend lands:

1. Postgres with row-level security; all authorization server-side.
2. Stripe Checkout; enrollment/premium written only by the webhook handler
   after signature verification (`Payment.verified`).
3. Every privileged mutation recorded in `AuditLog`.
4. Rate limiting on auth and write endpoints; signed URLs for paid content.

## Run it

```bash
npm install
```

Copy `.env.example` to `.env` and set `DATABASE_URL` (any Postgres) and
`AUTH_SECRET` (`openssl rand -base64 32`). Then:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

Without `DATABASE_URL` the site still builds and runs: the catalog is
static content, and the dashboard/auth pages show a "not switched on yet"
state instead of crashing.

## Deploying with a database (Vercel + Neon)

1. Create a free Postgres at [neon.tech](https://neon.tech) and copy its
   connection string.
2. In Vercel → Project → Settings → Environment Variables, set
   `DATABASE_URL`, `AUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL`.
3. Redeploy. The Vercel build (`scripts/vercel-build.mjs`) applies
   migrations and seeds the catalog automatically whenever `DATABASE_URL`
   is set. Accounts, enrollments and progress are live.

Fastest path: Vercel → Storage → Create Database → Postgres (Neon),
connect it to the project (this sets `DATABASE_URL`), add `AUTH_SECRET`
under Environment Variables, redeploy.

## Social sign-in (Google / Facebook / Apple)

Each provider's button appears automatically once its two env vars are
set (locally in `.env`, or in Vercel): `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`,
`AUTH_FACEBOOK_ID`/`AUTH_FACEBOOK_SECRET`, `AUTH_APPLE_ID`/`AUTH_APPLE_SECRET`.
No code change needed. Register the callback URL
`https://<your-domain>/api/auth/callback/<provider>` with each provider:

- Google: console.cloud.google.com → APIs & Services → Credentials →
  OAuth client ID (web application). Free.
- Facebook: developers.facebook.com → create an app → Facebook Login.
  Free; app review needed before the public can use it.
- Apple: developer.apple.com → Certificates → Services ID. Requires the
  paid Apple Developer Program ($99/yr); Apple also requires it if you
  ship iOS apps with other social logins.

Social accounts link to email accounts by verified email address: signing
in with Google for an address that already has a password account signs
into that same account.

CI (`.github/workflows/ci.yml`) runs on every push: design gate, migrations
and seed against a fresh Postgres, build, then the browser end-to-end suite
(`npm run test:e2e`): accounts, the auth dialog, the full portfolio loop
through evaluation, the premium gate and Stripe webhook, roles and
invitations. Nothing merges red.

## Roles

One account system, three roles. Learners self-register. Evaluators and
admins join only by invitation: an admin creates an invite link on
`/admin` (valid 7 days) and sends it; the link creates the account with
that role, or promotes an existing account signed in with the invited
email. After sign-in each role lands on its own home: learners on
`/dashboard`, evaluators on `/review`, admins on `/admin`.

The first admin of a deployment is promoted by script:

```bash
DATABASE_URL=... npm run make-admin -- you@example.com
```

## Email, verification, reset, rate limits, errors

- Sign-up sends a confirmation link; until it is confirmed an account
  can browse and build but cannot submit a portfolio or buy the full
  plan. Social sign-ins with a provider-verified email are confirmed
  automatically. Invited staff count as confirmed.
- "Forgot your password?" sends a one-hour, single-use reset link. Tokens
  are stored hashed and consumed atomically.
- Email goes through Resend when `RESEND_API_KEY` (and `EMAIL_FROM`) are
  set. With `EMAIL_OUTBOX=1` (development and CI only), every message is
  instead recorded in the `Email` table and printed to the server log,
  which is how the tests read the links. A deployment with neither sends
  nothing and stores only a redacted record.
- Rate limits (database-backed, so they hold on serverless): sign-in 10
  per account+IP per 15 min, sign-up 5 per IP per hour, email checks 30
  per IP per 15 min, reset requests 3 per hour.
- Every server request error is recorded in `ErrorLog` and listed on
  `/admin`; `src/instrumentation.ts` is where a Sentry client plugs in.

## Payments (Stripe)

The $99 one-time upgrade uses Stripe Checkout. Set `STRIPE_SECRET_KEY`
and `STRIPE_WEBHOOK_SECRET`; register the webhook endpoint
`https://<your-domain>/api/stripe/webhook` for `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`
and `checkout.session.async_payment_succeeded`. Premium is granted only by
that webhook after signature verification; the success redirect proves
nothing and grants nothing. Every checkout and verification is audited.

Free tier: one portfolio evaluated. Premium: unlimited.

## Evidence files (Vercel Blob)

Learners upload the documents that prove each outcome. On Vercel, create
a Blob store in the Storage tab and connect it to the project, which sets
`BLOB_READ_WRITE_TOKEN`. Files are stored private: the browser uploads
straight to the store with a ten-minute token the server issues only for
the caller's own editable portfolio and outcome, and every download goes
through `/api/evidence/<id>/file`, which checks that the viewer is the
owner or staff entitled to the case, then sends the bytes as an attachment
under a sandbox policy. Accepted: PDF, Word, Excel, PowerPoint, CSV, text,
PNG and JPG, up to 25 MB. Locally and in CI, `UPLOAD_DIR` keeps the files
in a folder and the same code path runs against it.

## Roadmap

1. Lesson content pages and video via Mux/Cloudflare Stream
2. Signed PDFs with a public verification code for registrars
