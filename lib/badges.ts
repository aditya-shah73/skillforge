// Achievement / badge definitions for the /achievements page.
//
// Badges are pure, declarative predicates over a snapshot of the learner's
// progress plus a few derived course aggregates. Nothing here touches
// localStorage or React — the page computes a `BadgeStats` snapshot from the
// progress context and asks each badge whether it's earned. Keeping the rules
// data-only makes them trivial to unit-test and impossible to desync from the
// UI.
//
// No new persisted state: "achievements" are a *view* over existing progress
// (xp, streak, combo, completedModules, easterEggs). Re-deriving on every
// render means a badge can never drift from the underlying numbers.

import { COURSES, type CourseId } from "./courses";
import { coursePercent, getCourseData } from "./courses/helpers";

/**
 * Flattened, UI-agnostic snapshot the badge predicates read from. Built once
 * per render from the progress context (see buildBadgeStats). Everything here
 * is already-namespaced and pre-aggregated so predicates stay one-liners.
 */
export type BadgeStats = {
  xp: number;
  streak: number;
  bestCombo: number;
  /** Total available modules completed across every course. */
  modulesCompleted: number;
  /** Distinct phases fully cleared (all available modules in the phase done). */
  phasesCleared: number;
  /** Count of courses at 100% (all available modules complete). */
  coursesCompleted: number;
  /** Number of easter eggs unlocked. */
  easterEggs: number;
  /** Sum of estimatedMinutes over completed modules. */
  minutesStudied: number;
};

export type Badge = {
  id: string;
  /** Emoji shown in the badge tile. */
  icon: string;
  title: string;
  /** One-line description of how it's earned. */
  description: string;
  /** Tailwind gradient for the earned tile. */
  color: string;
  /** Earned predicate over the snapshot. */
  earned: (s: BadgeStats) => boolean;
  /**
   * Optional progress fraction (0–1) toward earning, for the locked state's
   * mini progress bar. Omit for binary badges (e.g. easter eggs).
   */
  progress?: (s: BadgeStats) => number;
};

/** Clamp a raw ratio into [0, 1] so a partial progress bar never overflows. */
function frac(value: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(1, Math.max(0, value / target));
}

/**
 * The badge catalog. Ordered roughly by the journey: first steps → streaks →
 * combos → completion → mastery → secrets. The page renders earned ones first.
 */
export const BADGES: Badge[] = [
  {
    id: "first-module",
    icon: "🌱",
    title: "First Steps",
    description: "Complete your first module",
    color: "from-emerald-500 to-green-500",
    earned: (s) => s.modulesCompleted >= 1,
    progress: (s) => frac(s.modulesCompleted, 1),
  },
  {
    id: "ten-modules",
    icon: "📚",
    title: "Getting Serious",
    description: "Complete 10 modules",
    color: "from-sky-500 to-blue-500",
    earned: (s) => s.modulesCompleted >= 10,
    progress: (s) => frac(s.modulesCompleted, 10),
  },
  {
    id: "fifty-modules",
    icon: "🏗️",
    title: "Builder",
    description: "Complete 50 modules",
    color: "from-indigo-500 to-purple-500",
    earned: (s) => s.modulesCompleted >= 50,
    progress: (s) => frac(s.modulesCompleted, 50),
  },
  {
    id: "phase-clear",
    icon: "🧩",
    title: "Phase Cleared",
    description: "Finish every module in a phase",
    color: "from-teal-500 to-emerald-500",
    earned: (s) => s.phasesCleared >= 1,
    progress: (s) => frac(s.phasesCleared, 1),
  },
  {
    id: "five-phases",
    icon: "🗺️",
    title: "Trailblazer",
    description: "Clear 5 phases across any courses",
    color: "from-cyan-500 to-sky-500",
    earned: (s) => s.phasesCleared >= 5,
    progress: (s) => frac(s.phasesCleared, 5),
  },
  {
    id: "course-complete",
    icon: "🎓",
    title: "Course Complete",
    description: "Reach 100% in any course",
    color: "from-amber-500 to-orange-500",
    earned: (s) => s.coursesCompleted >= 1,
    progress: (s) => frac(s.coursesCompleted, 1),
  },
  {
    id: "polymath",
    icon: "👑",
    title: "Polymath",
    description: "Complete every course on the platform",
    color: "from-fuchsia-500 to-pink-500",
    earned: (s) => s.coursesCompleted >= COURSES.filter((c) => c.status === "available").length,
    progress: (s) =>
      frac(s.coursesCompleted, COURSES.filter((c) => c.status === "available").length),
  },
  {
    id: "streak-3",
    icon: "🔥",
    title: "On a Roll",
    description: "Reach a 3-day streak",
    color: "from-orange-400 to-red-500",
    earned: (s) => s.streak >= 3,
    progress: (s) => frac(s.streak, 3),
  },
  {
    id: "streak-7",
    icon: "🔥",
    title: "Week Warrior",
    description: "Reach a 7-day streak",
    color: "from-orange-500 to-rose-500",
    earned: (s) => s.streak >= 7,
    progress: (s) => frac(s.streak, 7),
  },
  {
    id: "streak-30",
    icon: "🌋",
    title: "Unstoppable",
    description: "Reach a 30-day streak",
    color: "from-red-500 to-rose-600",
    earned: (s) => s.streak >= 30,
    progress: (s) => frac(s.streak, 30),
  },
  {
    id: "combo-5",
    icon: "⚡",
    title: "Combo Striker",
    description: "Hit a 5× answer combo",
    color: "from-yellow-400 to-orange-500",
    earned: (s) => s.bestCombo >= 5,
    progress: (s) => frac(s.bestCombo, 5),
  },
  {
    id: "combo-10",
    icon: "💥",
    title: "Flawless Streak",
    description: "Hit a 10× answer combo",
    color: "from-amber-400 to-red-500",
    earned: (s) => s.bestCombo >= 10,
    progress: (s) => frac(s.bestCombo, 10),
  },
  {
    id: "xp-500",
    icon: "✨",
    title: "Apprentice",
    description: "Earn 500 XP",
    color: "from-violet-500 to-indigo-500",
    earned: (s) => s.xp >= 500,
    progress: (s) => frac(s.xp, 500),
  },
  {
    id: "xp-2500",
    icon: "🌟",
    title: "Scholar",
    description: "Earn 2,500 XP",
    color: "from-purple-500 to-fuchsia-500",
    earned: (s) => s.xp >= 2500,
    progress: (s) => frac(s.xp, 2500),
  },
  {
    id: "egg-hunter",
    icon: "🥚",
    title: "Egg Hunter",
    description: "Discover a hidden easter egg",
    color: "from-pink-500 to-rose-500",
    earned: (s) => s.easterEggs >= 1,
    progress: (s) => frac(s.easterEggs, 1),
  },
];

/**
 * Build the flattened snapshot the badge predicates consume from the raw
 * progress fields. Reads the course registries to count cleared phases and
 * completed courses, and sums estimatedMinutes over completed modules.
 *
 * `completedModules` is the namespaced `<courseId>/<slug>` storage shape.
 */
export function buildBadgeStats(p: {
  xp: number;
  streak: number;
  bestCombo: number;
  completedModules: string[];
  easterEggs: string[];
}): BadgeStats {
  // Dedupe defensively — storage *should* hold unique namespaced keys, but a
  // bad import could carry duplicates and we don't want to over-count modules.
  const completed = new Set(p.completedModules);

  let phasesCleared = 0;
  let coursesCompleted = 0;
  let minutesStudied = 0;

  for (const c of COURSES) {
    if (c.status !== "available") continue;
    const courseId = c.id as CourseId;
    const { MODULES } = getCourseData(courseId);
    const available = MODULES.filter((m) => m.status === "available");

    // Whole-course completion.
    const { percent } = coursePercent(courseId, p.completedModules);
    if (percent === 100 && available.length > 0) coursesCompleted++;

    // Per-phase clears + study minutes.
    const phaseNumbers = new Set(available.map((m) => m.phaseNumber));
    for (const phaseNumber of phaseNumbers) {
      const inPhase = available.filter((m) => m.phaseNumber === phaseNumber);
      const doneInPhase = inPhase.filter((m) => completed.has(`${courseId}/${m.slug}`));
      if (inPhase.length > 0 && doneInPhase.length === inPhase.length) phasesCleared++;
    }

    for (const m of available) {
      if (completed.has(`${courseId}/${m.slug}`)) {
        minutesStudied += m.estimatedMinutes ?? 0;
      }
    }
  }

  return {
    xp: p.xp,
    streak: p.streak,
    bestCombo: p.bestCombo,
    modulesCompleted: completed.size,
    phasesCleared,
    coursesCompleted,
    easterEggs: p.easterEggs.length,
    minutesStudied,
  };
}
