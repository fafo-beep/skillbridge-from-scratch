// Seeds the catalog (categories, courses, outcomes, modules, lessons) from
// the typed content in src/lib/catalog.ts. Idempotent: safe to re-run.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES, COURSES } from "../src/lib/catalog";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
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

  const counts = {
    categories: await prisma.category.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
  };
  console.log("Seeded:", counts);
}

main().finally(() => prisma.$disconnect());
