# SkillBridge

A course platform for working adults, rebuilt from scratch: learn what's new,
get credit for what isn't. Every eligible course doubles as a Prior Learning
Assessment (PLA) pathway — document real experience, attach evidence, and a
faculty evaluator issues a credit recommendation a college can review.

## Why this architecture

The previous SkillBridge was a Vite single-page app. A course marketplace
lives on search traffic, so this build is **Next.js (App Router), server
rendered**: every course has a real URL, metadata, schema.org `Course`
JSON-LD, a sitemap, and robots rules from day one.

- `src/app/` — pages: home, `/catalog` (search + category filter, all
  server-side), `/courses/[slug]` (statically generated per course),
  `/dashboard` (sample data until auth lands)
- `src/lib/catalog.ts` — the typed course content (source of truth; the
  seed script loads it into the database)
- `prisma/schema.prisma` — the data model (users, courses, enrollments,
  progress, portfolios, payments, audit log), live via Prisma + Postgres
- `src/auth.ts`, `src/lib/actions.ts` — Auth.js (credentials + JWT) and
  the server actions: register, sign in, enroll, lesson progress,
  portfolio creation. Every action re-checks the session server-side.
- `scripts/design-lint.mjs` — the design gate, run in CI

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
3. Run the migration and seed once against that database from any machine:
   `DATABASE_URL=... npm run db:migrate && DATABASE_URL=... npm run db:seed`
4. Redeploy. Accounts, enrollments and progress are live.

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

`npm run build` must pass with `npm run design-lint` clean before merge; CI
enforces both.

## Roadmap

1. PLA portfolio builder (narrative + evidence per outcome) and the
   reviewer flow (the differentiator)
2. Stripe Checkout + webhooks for the one-time upgrade
3. Lesson content pages and video via Mux/Cloudflare Stream
4. Real photography for the marketing pages
