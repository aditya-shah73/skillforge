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
      const module = data.MODULES.find((m) => m.slug === slug);
      if (!module) return null;
      return { key, courseMeta, module };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (resolved.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Your bookmarks
        </h2>
        <span className="text-xs text-slate-400">
          {resolved.length} saved
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {resolved.map(({ key, courseMeta, module }) => (
          <div
            key={key}
            className="group relative flex items-stretch rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition hover:-translate-y-0.5 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md"
          >
            <Link
              href={`/courses/${courseMeta.slug}/modules/${module.slug}`}
              className="flex-1 min-w-0 p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-base leading-none`} aria-hidden>
                  {courseMeta.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  {courseMeta.shortName} · Module {module.number}
                </span>
              </div>
              <h3 className="text-sm font-bold tracking-tight truncate">
                {module.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                {module.subtitle}
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
              className="shrink-0 px-3 text-amber-500 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200 transition"
            >
              ★
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
