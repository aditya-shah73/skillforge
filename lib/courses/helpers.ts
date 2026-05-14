// Cross-course helpers that read from all three course registries.
// Kept separate from `index.ts` to avoid pulling these into module pages
// that only need a single course's data.

import { COURSES, ai, dsa, systemDesign, type CourseId, type CourseMeta } from "./index";
import type { Module } from "./ai";

type CourseBundle = {
  meta: CourseMeta;
  modules: Module[];
};

const COURSE_DATA: Record<CourseId, { MODULES: Module[]; PHASES: { number: number; name: string; color: string }[] }> = {
  ai,
  dsa,
  "system-design": systemDesign,
};

export function getCourseData(id: CourseId) {
  return COURSE_DATA[id];
}

/** All available (status==="available") modules across every course, in registry order. */
export function getAllAvailableModules(): { courseId: CourseId; courseSlug: string; courseName: string; module: Module }[] {
  return COURSES.flatMap((c) =>
    COURSE_DATA[c.id].MODULES.filter((m) => m.status === "available").map((module) => ({
      courseId: c.id,
      courseSlug: c.slug,
      courseName: c.name,
      module,
    })),
  );
}

/** Per-course completion stats based on the user's `completedModules` array. */
export function coursePercent(courseId: CourseId, completedModules: string[]) {
  const data = COURSE_DATA[courseId];
  const available = data.MODULES.filter((m) => m.status === "available");
  // We treat completion as "user marked this module slug complete". The slug
  // namespace is per-course, so collisions across courses are possible but
  // the registries don't currently overlap; if they do, refine to a
  // `${courseId}/${slug}` key.
  const completed = available.filter((m) => completedModules.includes(m.slug));
  const total = available.length;
  const done = completed.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/**
 * Same shape as `coursePercent`, but scoped to a single phase. Used on the
 * course landing pages to show "Phase 2 · 4/6" next to the phase header.
 * If the phase has no available modules yet, returns `{done:0,total:0,percent:0}`.
 */
export function phasePercent(courseId: CourseId, phaseNumber: number, completedModules: string[]) {
  const data = COURSE_DATA[courseId];
  const inPhase = data.MODULES.filter(
    (m) => m.status === "available" && m.phaseNumber === phaseNumber,
  );
  const done = inPhase.filter((m) => completedModules.includes(m.slug)).length;
  const total = inPhase.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/**
 * Find the "next thing to do" for a learner across all courses.
 * Strategy:
 *  - Find the course with the most recent activity (any completed module
 *    in its registry). If multiple courses, prefer the one with the most
 *    completed modules.
 *  - In that course, return the first available module whose slug is NOT
 *    in `completedModules`.
 *  - If no progress anywhere, return the first available module of the
 *    first available course (AI's `welcome`, currently).
 */
export function findResumeTarget(completedModules: string[]): {
  courseId: CourseId;
  courseSlug: string;
  courseName: string;
  courseIcon: string;
  courseColor: string;
  module: Module;
  isFirstTime: boolean;
} | null {
  const bundles: CourseBundle[] = COURSES.map((meta) => ({ meta, modules: COURSE_DATA[meta.id].MODULES }));

  // Score each course by # completed modules.
  const scored = bundles.map((b) => {
    const completedInCourse = b.modules.filter((m) => completedModules.includes(m.slug)).length;
    return { bundle: b, completed: completedInCourse };
  });
  scored.sort((a, b) => b.completed - a.completed);

  const top = scored[0];
  if (!top) return null;

  const targetCourse = top.completed > 0
    ? top.bundle
    : bundles.find((b) => b.meta.status === "available") ?? bundles[0];

  if (!targetCourse) return null;

  const nextModule = targetCourse.modules.find(
    (m) => m.status === "available" && !completedModules.includes(m.slug),
  );

  if (!nextModule) return null;

  return {
    courseId: targetCourse.meta.id,
    courseSlug: targetCourse.meta.slug,
    courseName: targetCourse.meta.name,
    courseIcon: targetCourse.meta.icon,
    courseColor: targetCourse.meta.color,
    module: nextModule,
    isFirstTime: top.completed === 0,
  };
}

/** Prev/next within a course, skipping coming-soon modules. */
export function getModuleNeighbors(courseId: CourseId, currentSlug: string): {
  prev: Module | null;
  next: Module | null;
} {
  const data = COURSE_DATA[courseId];
  const available = data.MODULES.filter((m) => m.status === "available");
  const idx = available.findIndex((m) => m.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? available[idx - 1] : null,
    next: idx < available.length - 1 ? available[idx + 1] : null,
  };
}
