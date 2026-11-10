// Finds the Postgres connection string however the host named it.
// Vercel's Neon integration applies a user-chosen prefix (e.g.
// DATABASE_POSTGRES_PRISMA_URL); plain DATABASE_URL still wins when set.
// Only values that are actually Postgres URLs are accepted.
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const isPg = (v?: string) => !!v && /^postgres(ql)?:\/\//.test(v);
  for (const k of ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL"]) {
    if (isPg(env[k])) return env[k]!;
  }
  for (const suffix of ["_POSTGRES_PRISMA_URL", "_DATABASE_URL", "_POSTGRES_URL", "_URL"]) {
    const key = Object.keys(env).find((k) => k.endsWith(suffix) && isPg(env[k]));
    if (key) return env[key]!;
  }
  return "";
}
