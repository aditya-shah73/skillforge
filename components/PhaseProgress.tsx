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
 * Hidden until mount to keep SSR HTML stable and avoid a "0/N" flash for
 * users with progress.
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

  if (total === 0) return null;
  // Don't render anything until hydration so we don't flash "0/N" for a user
  // who already has progress. Phase header already shows the module count.
  if (!mounted) return null;

  const isDone = done === total;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono tabular-nums transition ${
        isDone
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          : done > 0
          ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-400"
      }`}
      title={`${done} of ${total} modules complete in this phase`}
    >
      {isDone && <span aria-hidden>✓</span>}
      <span>{done}/{total}</span>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <span>{percent}%</span>
    </span>
  );
}
