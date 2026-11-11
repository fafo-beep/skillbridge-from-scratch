import Image from "next/image";
import { Course, getCategory } from "@/lib/catalog";
import { FIELD_PHOTOS } from "@/lib/photos";

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
  const photo = FIELD_PHOTOS[course.category];
  if (photo) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-4 bg-[hsl(216_85%_10%/0.72)] px-5 py-3 text-white">
          <p className="text-2xl font-bold tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{course.code}</p>
          <p className="text-sm font-semibold">{category?.name}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`flex aspect-[16/9] flex-col justify-between rounded-t-lg p-5 text-white ${
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
