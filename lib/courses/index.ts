// Skillforge — registry of all courses on the platform.
// Add a new course by importing its COURSE_META and adding it to COURSES.

import * as ai from "./ai";
import * as dsa from "./dsa";
import * as systemDesign from "./system-design";
import * as frontend from "./frontend";

export type CourseId = "ai" | "dsa" | "system-design" | "frontend";

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

export const COURSES: CourseMeta[] = [ai.COURSE_META, dsa.COURSE_META, systemDesign.COURSE_META, frontend.COURSE_META];

export function getCourseById(id: CourseId): CourseMeta | undefined {
  return COURSES.find((c) => c.id === id);
}

// Re-export per-course module data for callers that already know which course
// they want. Most pages should import directly from "./ai", "./dsa",
// "./system-design", or "./frontend" instead.
export { ai, dsa, systemDesign, frontend };
