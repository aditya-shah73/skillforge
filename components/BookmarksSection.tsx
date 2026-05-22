"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { COURSES } from "@/lib/courses";
import { getCourseData } from "@/lib/courses/helpers";
import type { CourseId } from "@/lib/courses";

/**
 * "Your bookmarks" section for the home page. Lists every bookmarked module
 * with its course tint. Hidden entirely when the user has no bookmarks so
 * first-time visitors don't see a stub empty state.
 */
export default function BookmarksSection() {
  const { bookmarks, toggleBookmark } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (bookmarks.length === 0) return null;

  // Resolve each bookmark key to a real module. Drop any keys that no longer
  // match a known module (e.g. content was renamed/removed) — fail soft.
  const resolved = bookmarks
    .map((key) => {
      const [courseId, ...slugParts] = key.split("/");
      const slug = slugParts.join("/");
      const courseMeta = COURSES.find((c) => c.id === courseId);
      if (!courseMeta) return null;
      const data = getCourseData(courseId as CourseId);
      // Avoid naming the local `module` — Next.js's `no-assign-module-variable`
      // rule flags it because Webpack injects a CJS `module` binding into every
      // file and reassigning it can break HMR.
      const mod = data.MODULES.find((m) => m.slug === slug);
      if (!mod) return null;
      return { key, courseMeta, mod };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (resolved.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Your bookmarks
        </h2>
        <span className="text-xs text-slate-400">
          {resolved.length} saved
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {resolved.map(({ key, courseMeta, mod }) => (
          <div
            key={key}
            className="group relative flex items-stretch rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-700"
          >
            <Link
              href={`/courses/${courseMeta.slug}/modules/${mod.slug}`}
              className="min-w-0 flex-1 p-4"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`text-base leading-none`} aria-hidden>
                  {courseMeta.icon}
                </span>
                <span className="truncate text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {courseMeta.shortName} · Module {mod.number}
                </span>
              </div>
              <h3 className="truncate text-sm font-bold tracking-tight">
                {mod.title}
              </h3>
              <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                {mod.subtitle}
              </p>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(key);
              }}
              aria-label="Remove bookmark"
              title="Remove bookmark"
              className="shrink-0 px-3 text-amber-500 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
