import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, getCategory, searchCourses } from "@/lib/catalog";
import CourseCard from "@/components/CourseCard";

export const metadata: Metadata = {
  title: "Course catalog",
  description:
    "Browse SkillBridge courses by field. Every eligible course doubles as a Prior Learning Assessment pathway.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const activeCategory = getCategory(category ?? "");
  const results = searchCourses(q, activeCategory?.slug);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
        {activeCategory ? activeCategory.name : "Course catalog"}
      </h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed">
        {activeCategory
          ? activeCategory.scope[0].toUpperCase() + activeCategory.scope.slice(1) + "."
          : "Every course lists its outcomes, lessons, and credit value up front."}
      </p>

      <form action="/catalog" className="mt-8 flex max-w-xl gap-2">
        {activeCategory && (
          <input type="hidden" name="category" value={activeCategory.slug} />
        )}
        <label htmlFor="catalog-search" className="sr-only">
          Search courses
        </label>
        <input
          id="catalog-search"
          name="q"
          type="search"
          defaultValue={q ?? ""}
          placeholder="Search by title, code, or outcome"
          className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent active:translate-y-px"
        >
          Search
        </button>
      </form>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter by field">
        <Link
          href="/catalog"
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            !activeCategory
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          All fields
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/catalog?category=${c.slug}`}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              activeCategory?.slug === c.slug
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {results.length > 0 ? (
        <div className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-md bg-card p-10">
          <p className="font-bold">No courses match that search.</p>
          <p className="mt-1 text-muted-foreground">
            Try a broader term, or browse{" "}
            <Link href="/catalog" className="font-semibold text-primary underline underline-offset-4">
              the full catalog
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
