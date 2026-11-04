import { Course, getCategory } from "@/lib/catalog";

// The course's "cover": a flat field from the blue ramp with the course
// code set large. Drawn in code so every tile is consistent; replaced by
// real photography per field when it exists.
const TONE: Record<string, string> = {
  business: "bg-[hsl(var(--tile-1))]",
  marketing: "bg-[hsl(var(--tile-2))]",
  hr: "bg-[hsl(var(--tile-3))]",
  healthcare: "bg-[hsl(var(--tile-4))]",
  it: "bg-[hsl(var(--tile-5))]",
};

export default function CourseTile({ course }: { course: Course }) {
  const category = getCategory(course.category);
  return (
    <div
      className={`flex aspect-[16/9] flex-col justify-between rounded-t-md p-5 text-white ${
        TONE[course.category] ?? TONE.business
      }`}
      aria-hidden="true"
    >
      <p className="text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontVariantNumeric: "tabular-nums" }}>
        {course.code}
      </p>
      <p className="text-sm font-semibold">{category?.name}</p>
    </div>
  );
}
