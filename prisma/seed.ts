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

    // Outcomes, modules and lessons are upserted by position so their ids
    // are stable across deploys. Portfolio narratives and evidence point
    // at outcome ids; lesson progress points at lesson ids. Rows beyond
    // the catalog's length are removed, and the Restrict relations make
    // the seed fail loudly rather than orphan a learner's work.
    for (let i = 0; i < course.outcomes.length; i++) {
      await prisma.outcome.upsert({
        where: { courseId_position: { courseId: record.id, position: i } },
        update: { text: course.outcomes[i] },
        create: { courseId: record.id, position: i, text: course.outcomes[i] },
      });
    }
    await prisma.outcome.deleteMany({ where: { courseId: record.id, position: { gte: course.outcomes.length } } });

    for (let m = 0; m < course.modules.length; m++) {
      const mod = course.modules[m];
      const moduleRow = await prisma.module.upsert({
        where: { courseId_position: { courseId: record.id, position: m } },
        update: { title: mod.title, summary: mod.summary },
        create: { courseId: record.id, position: m, title: mod.title, summary: mod.summary },
      });
      for (let i = 0; i < mod.lessons.length; i++) {
        const l = mod.lessons[i];
        await prisma.lesson.upsert({
          where: { moduleId_position: { moduleId: moduleRow.id, position: i } },
          update: { title: l.title, minutes: l.minutes },
          create: { moduleId: moduleRow.id, position: i, title: l.title, minutes: l.minutes },
        });
      }
      const extra = { moduleId: moduleRow.id, position: { gte: mod.lessons.length } };
      await prisma.progress.deleteMany({ where: { lesson: extra } });
      await prisma.lesson.deleteMany({ where: extra });
    }
    const extraModules = { courseId: record.id, position: { gte: course.modules.length } };
    await prisma.progress.deleteMany({ where: { lesson: { module: extraModules } } });
    await prisma.lesson.deleteMany({ where: { module: extraModules } });
    await prisma.module.deleteMany({ where: extraModules });
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
            emailVerifiedAt: new Date(),
            passwordHash: await bcrypt.default.hash(password, 12),
          },
        });
        console.log("Dev reviewer seeded: reviewer@dev.local");
      }
      const admin = await prisma.user.findUnique({ where: { email: "admin@dev.local" } });
      if (!admin) {
        const bcrypt = await import("bcryptjs");
        await prisma.user.create({
          data: { email: "admin@dev.local", name: "Dev Admin", role: "ADMIN", emailVerifiedAt: new Date(), passwordHash: await bcrypt.default.hash(password, 12) },
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
