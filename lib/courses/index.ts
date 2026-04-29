// Skillforge — registry of all courses on the platform.
// Add a new course by importing its COURSE_META and adding it to COURSES.

import * as ai from "./ai";
import * as dsa from "./dsa";

export type CourseId = "ai" | "dsa";

export type CourseMeta = {
  id: CourseId;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  status: "available" | "coming-soon";
};

export const COURSES: CourseMeta[] = [ai.COURSE_META, dsa.COURSE_META];

export function getCourseById(id: CourseId): CourseMeta | undefined {
  return COURSES.find((c) => c.id === id);
}

// Re-export per-course module data for callers that already know which course
// they want. Most pages should import directly from "./ai" or "./dsa" instead.
export { ai, dsa };
