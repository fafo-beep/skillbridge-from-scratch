// Vercel build: when a database is configured, apply migrations and seed
// the catalog (idempotent) before building, so a fresh database comes up
// ready. Without DATABASE_URL the site still builds in no-database mode.
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

const resolveDatabaseUrl = (env = process.env) => {
  const isPg = (v) => !!v && /^postgres(ql)?:\/\//.test(v);
  for (const k of ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"]) if (isPg(env[k])) return env[k];
  for (const suffix of ["_POSTGRES_PRISMA_URL", "_DATABASE_URL", "_POSTGRES_URL", "_URL"]) {
    const key = Object.keys(env).find((k) => k.endsWith(suffix) && isPg(env[k]));
    if (key) return env[key];
  }
  return "";
};
const dbUrl = resolveDatabaseUrl();
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log("DATABASE_URL set: applying migrations and seeding catalog");
  run("npx prisma migrate deploy");
  run("npx tsx prisma/seed.ts");
} else {
  console.log("No DATABASE_URL: building in no-database mode");
}
run("npx next build");
