import Link from "next/link";
import { Course } from "@/lib/catalog";
import CourseTile from "@/components/CourseTile";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col rounded-lg transition-transform duration-150 hover:-translate-y-0.5"
    >
      <CourseTile course={course} />
      <div className="flex flex-1 flex-col rounded-b-lg bg-card p-6">
        <h3 className="text-lg font-bold leading-snug group-hover:text-primary">
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
      </div>
    </Link>
  );
}
