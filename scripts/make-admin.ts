// Promote an existing account to ADMIN. The first admin of a deployment
// is created this way; after that, admins invite others from /admin.
//   DATABASE_URL=... npx tsx scripts/make-admin.ts someone@example.com
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("usage: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || "" }) });
prisma.user
  .update({ where: { email }, data: { role: "ADMIN" } })
  .then(async (u) => {
    await prisma.auditLog.create({ data: { userId: u.id, action: "role.admin_by_script", target: email } });
    console.log(`${email} is now ADMIN`);
  })
  .catch((e) => { console.error("No such user, or:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
