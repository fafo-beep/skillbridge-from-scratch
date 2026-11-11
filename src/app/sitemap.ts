import type { MetadataRoute } from "next";
import { CATEGORIES, COURSES } from "@/lib/catalog";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/catalog`, priority: 0.9 },
    ...CATEGORIES.map((c) => ({ url: `${BASE}/catalog?category=${c.slug}`, priority: 0.7 })),
    ...COURSES.map((c) => ({ url: `${BASE}/courses/${c.slug}`, priority: 0.8 })),
  ];
}
