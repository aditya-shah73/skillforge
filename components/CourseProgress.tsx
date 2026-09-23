"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { coursePercent } from "@/lib/courses/helpers";
import type { CourseId } from "@/lib/courses";

/**
 * Per-course progress bar shown on the course landing page (/courses/<slug>).
 * Renders "12 of 19 complete · 63%" plus a thin gradient fill bar.
 *
 * Client-side because it reads localStorage progress. `total` is known on the
 * server, so it renders immediately; the two numbers that depend on stored
 * progress render as blank, width-reserved slots until hydration. They used to
 * render as a real "0" and "0%", which meant a returning learner watched their
 * count visibly correct itself from zero a frame after the page appeared.
 * `ch` units are exact for the reservation here because the row is
 * `font-mono tabular-nums`.
 *
 * The reservations are dropped at hydration, once the digits can size their
 * own slots. Holding them afterwards kept this row about 3 characters wider
 * than its contents, and in the `justify-between` flex below that was enough
 * to wrap the label group at 360px.
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

  // `total` is derived from course data, so it's identical on both passes.
  // `done`/`percent` are only meaningful once localStorage has been read.
  const { done, total, percent } = coursePercent(courseId, mounted ? completedModules : []);
  const showActive = mounted && done > 0;

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Your progress
          </span>
          {/* Inline entry point to the achievements hub, shown where users
              already look at their standing. Pairs with the header trophy
              for a path that reaches them from inside modules too. */}
          <Link
            href="/achievements"
            className="text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            🏆 Achievements →
          </Link>
        </div>
        <span className="font-mono text-xs text-slate-500 tabular-nums">
          {/* Reserved only while unmounted. Holding the reservation after
              hydration kept the slots at their widest — 2ch for a 1-digit
              `done`, 3ch for a 1-digit percent — which made this row about
              3 characters wider than its content forever. In the
              `justify-between` flex above, that squeezed the label group at
              360px until "🏆 Achievements →" wrapped onto a third line. */}
          <span className="inline-block text-right" style={mounted ? undefined : { minWidth: `${String(total).length}ch` }}>
            {mounted ? done : ""}
          </span>{" "}
          / {total} complete ·{" "}
          <span className={showActive ? "font-semibold text-slate-900 dark:text-slate-100" : ""}>
            <span className="inline-block text-right" style={mounted ? undefined : { minWidth: "3ch" }}>
              {mounted ? percent : ""}
            </span>
            %
          </span>
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
