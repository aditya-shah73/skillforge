"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { phasePercent } from "@/lib/courses/helpers";
import type { CourseId } from "@/lib/courses";

/**
 * Compact "4/6 · 67%" badge with a hair-thin progress dot row. Designed to
 * sit beside the phase header on a course landing page (e.g. "Phase 1 ·
 * ML & AI Foundations  [progress]"). Tiny on purpose so it doesn't compete
 * with the phase title.
 *
 * The counts live in localStorage, so they can't exist until after hydration.
 * This used to `return null` until mounted, which meant the badge *appeared*
 * a frame after the rest of the page and shoved the phase header sideways.
 * Instead we render the badge shell during SSR with its numeric slots blank
 * but width-reserved (`ch` units, which are exact here because the badge is
 * `font-mono tabular-nums`), so hydration fills in digits without the box
 * ever changing size.
 */
export default function PhaseProgress({
  courseId,
  phaseNumber,
}: {
  courseId: CourseId;
  phaseNumber: number;
}) {
  const { completedModules } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { done, total, percent } = phasePercent(courseId, phaseNumber, mounted ? completedModules : []);

  // `total` comes from the course data, not localStorage, so it's the same on
  // both passes — safe to bail on before hydration.
  if (total === 0) return null;

  const isDone = mounted && done === total;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] tabular-nums transition ${
        isDone
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : mounted && done > 0
          ? "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/60"
      }`}
      // No tooltip before hydration — "0 of 8" would be a lie, not a placeholder.
      title={mounted ? `${done} of ${total} modules complete in this phase` : undefined}
    >
      {/* Always in the layout, only visible once earned. Rendering it
          conditionally widened the whole badge the instant a completed
          phase hydrated. */}
      <span aria-hidden className={isDone ? "" : "invisible"}>
        ✓
      </span>
      <span>
        <span
          className="inline-block text-right"
          // `done` can never have more digits than `total`, and the badge is
          // font-mono + tabular-nums, so one `ch` is exactly one digit.
          style={{ minWidth: `${String(total).length}ch` }}
        >
          {mounted ? done : ""}
        </span>
        /{total}
      </span>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <span>
        <span className="inline-block min-w-[3ch] text-right">{mounted ? percent : ""}</span>%
      </span>
    </span>
  );
}
