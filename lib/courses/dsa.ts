// Data Structures & Algorithms in Java — course definition (stub).
// This course is in planning. Modules will be added one pattern at a time.

import type { Module } from "./ai";

export const COURSE_META = {
  id: "dsa" as const,
  slug: "dsa",
  name: "DSA in Java",
  shortName: "DSA Course",
  tagline: "Pattern-driven LeetCode prep, in Java",
  description:
    "A pattern-first course on data structures and algorithms — Arrays, Two Pointers, Sliding Window, Stacks, Trees, Graphs, DP. Each module teaches one pattern, then drills it across LeetCode-style problems. Targeted at engineers prepping for interviews who want intuition before rote memorization.",
  icon: "🧩",
  color: "from-emerald-500 to-teal-500",
  accent: "emerald",
  status: "coming-soon" as const,
};

// Placeholder phases — will be expanded as modules are built.
export const PHASES = [
  { number: 1, name: "Linear Patterns", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "Trees & Graphs", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "Search & Sort", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Dynamic Programming", color: "from-sky-500 to-blue-500" },
  { number: 5, name: "Advanced & Interview Prep", color: "from-indigo-500 to-purple-500" },
];

// Empty for now — populated as content is written.
export const MODULES: Module[] = [];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
