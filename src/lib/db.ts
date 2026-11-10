import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma client singleton. `dbConfigured` is false when no DATABASE_URL is
// set (e.g. a fresh deployment before the database is provisioned); callers
// fall back to read-only sample behavior instead of crashing.

// Vercel database integrations may name the variable POSTGRES_URL or
// POSTGRES_PRISMA_URL instead of DATABASE_URL; accept any of them.
export const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";
export const dbConfigured = Boolean(DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  globalForPrisma.prisma ?? (dbConfigured ? makeClient() : (null as unknown as PrismaClient));

if (dbConfigured && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
