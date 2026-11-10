// Vercel build: when a database is configured, apply migrations and seed
// the catalog (idempotent) before building, so a fresh database comes up
// ready. Without DATABASE_URL the site still builds in no-database mode.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log("DATABASE_URL set: applying migrations and seeding catalog");
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed.ts");
} else {
  console.log("No DATABASE_URL: building in no-database mode");
}
run("npx next build");
