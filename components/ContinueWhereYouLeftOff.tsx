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
        className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
      >
        {/* Gradient tint background on hover, tinted to the course */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${target.courseColor} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${target.courseColor} text-2xl shadow-lg shadow-slate-900/5`}>
            <span>{target.courseIcon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Resume
              </span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
                {target.courseName}
              </span>
            </div>
            <h3 className="truncate text-base font-bold tracking-tight sm:text-lg">
              Module {target.module.number}, {target.module.title}
            </h3>
            <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
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
              <span className="shrink-0 font-mono text-[11px] text-slate-500 tabular-nums">
                {done}/{total} · {percent}%
              </span>
            </div>
          </div>

          <div className="hidden items-center self-stretch pl-2 sm:flex">
            <span className={`bg-gradient-to-r text-sm font-semibold ${target.courseColor} inline-flex items-center gap-1 bg-clip-text text-transparent`}>
              Continue
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
