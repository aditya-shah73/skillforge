"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { findResumeTarget, coursePercent } from "@/lib/courses/helpers";

/**
 * Surfaces a single "Resume: <course> · Module N — <title>" CTA on the home
 * page. Hidden entirely until the user has completed at least one module —
 * for first-time visitors the hero + course picker is already the right CTA,
 * and rendering this empty (or worse, with "next: welcome") would clutter.
 *
 * Client component because we need access to localStorage-backed progress.
 * Renders nothing on SSR and on first hydration tick to avoid layout shift /
 * flash for users with no progress yet.
 */
export default function ContinueWhereYouLeftOff() {
  const { completedModules } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (completedModules.length === 0) return null;

  const target = findResumeTarget(completedModules);
  if (!target) return null;

  const { done, total, percent } = coursePercent(target.courseId, completedModules);

  return (
    <section className="mb-10">
      <Link
        href={`/courses/${target.courseSlug}/modules/${target.module.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl"
      >
        {/* Gradient tint background on hover, tinted to the course */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${target.courseColor} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${target.courseColor} text-2xl shadow-lg shadow-slate-900/5`}>
            <span>{target.courseIcon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Resume
              </span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                {target.courseName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
              Module {target.module.number} — {target.module.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
              {target.module.subtitle}
            </p>

            {/* Slim per-course progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${target.courseColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0">
                {done}/{total} · {percent}%
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center self-stretch pl-2">
            <span className={`text-sm font-semibold bg-gradient-to-r ${target.courseColor} bg-clip-text text-transparent inline-flex items-center gap-1`}>
              Continue
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
