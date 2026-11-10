import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "@/lib/database-url";

// Prisma client singleton. `dbConfigured` is false when no DATABASE_URL is
// set (e.g. a fresh deployment before the database is provisioned); callers
// fall back to read-only sample behavior instead of crashing.

export const DATABASE_URL = resolveDatabaseUrl();
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
