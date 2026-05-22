import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/courses";
import { getCourseData } from "@/lib/courses/helpers";

// Sitemap is generated from the same course/module registries that drive
// navigation, so the routes here never drift from what's actually rendered.
// We emit:
//   - /                                          (home)
//   - /courses/<slug>                            (course landing) for each available course
//   - /courses/<slug>/modules/<module-slug>      for each available module
// Coming-soon courses and modules are deliberately omitted — they render a
// disabled card, not a real page, so they shouldn't show up in search.
//
// `lastModified` is set at build time. The site is regenerated on every
// deploy, so this is good enough; if we ever ship dynamic content we can
// thread real timestamps through here.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = "https://skillforge.dev"; // canonical origin; update when prod URL changes

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
  ];

  for (const course of COURSES) {
    if (course.status !== "available") continue;
    entries.push({
      url: `${base}/courses/${course.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    const data = getCourseData(course.id);
    for (const m of data.MODULES) {
      if (m.status !== "available") continue;
      entries.push({
        url: `${base}/courses/${course.slug}/modules/${m.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
