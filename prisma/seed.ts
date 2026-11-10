// Seeds the catalog (categories, courses, outcomes, modules, lessons) from
// the typed content in src/lib/catalog.ts. Idempotent: safe to re-run.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES, COURSES } from "../src/lib/catalog";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }),
});

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, scope: c.scope },
      create: { slug: c.slug, name: c.name, scope: c.scope },
    });
  }

  for (const course of COURSES) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: course.category },
    });
    const record = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        code: course.code,
        title: course.title,
        summary: course.summary,
        credits: course.credits,
        level: course.level,
        weeks: course.weeks,
        priceUSD: course.priceUSD,
        plaEligible: course.plaEligible,
        categoryId: category.id,
      },
      create: {
        slug: course.slug,
        code: course.code,
        title: course.title,
        summary: course.summary,
        credits: course.credits,
        level: course.level,
        weeks: course.weeks,
        priceUSD: course.priceUSD,
        plaEligible: course.plaEligible,
        categoryId: category.id,
      },
    });

    // Rebuild outcomes/modules/lessons for the course (content is source-of-truth)
    await prisma.progress.deleteMany({
      where: { lesson: { module: { courseId: record.id } } },
    });
    await prisma.lesson.deleteMany({ where: { module: { courseId: record.id } } });
    await prisma.module.deleteMany({ where: { courseId: record.id } });
    await prisma.outcome.deleteMany({ where: { courseId: record.id } });

    await prisma.outcome.createMany({
      data: course.outcomes.map((text, i) => ({
        courseId: record.id,
        position: i,
        text,
      })),
    });

    for (let m = 0; m < course.modules.length; m++) {
      const mod = course.modules[m];
      await prisma.module.create({
        data: {
          courseId: record.id,
          position: m,
          title: mod.title,
          summary: mod.summary,
          lessons: {
            create: mod.lessons.map((l, i) => ({
              position: i,
              title: l.title,
              minutes: l.minutes,
            })),
          },
        },
      });
    }
  }

  // Dev/test reviewer — requires BOTH an explicit flag and an explicit
  // password from the environment (nothing committed), refuses to run in
  // production, and never promotes a pre-existing account (create-only).
  if (process.env.SEED_DEV_USERS === "1" && process.env.NODE_ENV !== "production") {
    const password = process.env.SEED_DEV_PASSWORD;
    if (!password || password.length < 10) {
      console.log("SEED_DEV_USERS set but SEED_DEV_PASSWORD missing/short; skipping dev reviewer.");
    } else {
      const existing = await prisma.user.findUnique({ where: { email: "reviewer@dev.local" } });
      if (existing) {
        console.log("reviewer@dev.local already exists; not modifying it.");
      } else {
        const bcrypt = await import("bcryptjs");
        await prisma.user.create({
          data: {
            email: "reviewer@dev.local",
            name: "Dev Reviewer",
            role: "REVIEWER",
            passwordHash: await bcrypt.default.hash(password, 12),
          },
        });
        console.log("Dev reviewer seeded: reviewer@dev.local");
      }
      const admin = await prisma.user.findUnique({ where: { email: "admin@dev.local" } });
      if (!admin) {
        const bcrypt = await import("bcryptjs");
        await prisma.user.create({
          data: { email: "admin@dev.local", name: "Dev Admin", role: "ADMIN", passwordHash: await bcrypt.default.hash(password, 12) },
        });
        console.log("Dev admin seeded: admin@dev.local");
      }
    }
  }

  const counts = {
    categories: await prisma.category.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
  };
  console.log("Seeded:", counts);
}

main().finally(() => prisma.$disconnect());
