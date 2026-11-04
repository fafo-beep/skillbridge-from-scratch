import Link from "next/link";
import { Course, getCategory } from "@/lib/catalog";

export default function CourseCard({ course }: { course: Course }) {
  const category = getCategory(course.category);
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-md bg-card p-6 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <p className="text-sm text-muted-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
        {course.code} · {category?.name}
      </p>
      <h3 className="mt-1.5 text-lg font-bold leading-snug group-hover:text-primary">
        {course.title}
      </h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">
        {course.summary}
      </p>
      <div
        className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        <span className="font-semibold">
          {course.credits} credits · {course.level}
        </span>
        {course.plaEligible && (
          <span className="font-semibold text-secondary-foreground">
            Credit for experience
          </span>
        )}
      </div>
    </Link>
  );
}
