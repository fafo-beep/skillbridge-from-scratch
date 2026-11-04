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
- `src/lib/catalog.ts` — typed data layer; mirrors `db/schema.prisma`
  one-for-one so the Postgres swap changes no page code
- `db/schema.prisma` — the target data model (users, courses, enrollments,
  progress, portfolios, payments, audit log). Not wired yet.
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
npm run dev
```

`npm run build` must pass with `npm run design-lint` clean before merge; CI
enforces both.

## Roadmap

1. Auth (Auth.js) + Postgres/Prisma, replacing `src/lib/catalog.ts` reads
2. Enrollment, lesson pages, and real progress
3. PLA portfolio builder and reviewer flow (the differentiator)
4. Stripe Checkout + webhooks for the one-time upgrade
5. Video via Mux/Cloudflare Stream with signed playback
