"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { coursePercent } from "@/lib/courses/helpers";
import type { CourseId } from "@/lib/courses";

/**
 * Per-course progress bar shown on the course landing page (/courses/<slug>).
 * Renders "12 of 19 complete · 63%" plus a thin gradient fill bar.
 *
 * Client-side because it reads localStorage progress. Renders an invisible
 * placeholder on SSR so the page doesn't reflow after hydration.
 */
export default function CourseProgress({
  courseId,
  color,
}: {
  courseId: CourseId;
  /** Tailwind gradient classes, e.g. "from-indigo-500 to-purple-500" */
  color: string;
}) {
  const { completedModules } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute now so totals show even before hydration (with 0 done)
  const { done, total, percent } = coursePercent(courseId, mounted ? completedModules : []);
  const showActive = mounted && done > 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Your progress
        </span>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {done} / {total} complete · <span className={showActive ? "text-slate-900 dark:text-slate-100 font-semibold" : ""}>{percent}%</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-[width] duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
