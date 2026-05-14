"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import type { CourseId } from "@/lib/courses";

/**
 * Star toggle for bookmarking a module. Sits in the module-page header next
 * to the title. Bookmark keys are namespaced as "<courseId>/<slug>" so the
 * same slug across courses doesn't collide.
 */
export default function BookmarkButton({
  courseId,
  moduleSlug,
}: {
  courseId: CourseId;
  moduleSlug: string;
}) {
  const { isBookmarked, toggleBookmark } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const key = `${courseId}/${moduleSlug}`;
  const active = mounted && isBookmarked(key);

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(key)}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Bookmark this module"}
      title={active ? "Bookmarked — click to remove" : "Bookmark this module"}
      className={`print:hidden inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-amber-700 dark:hover:text-amber-300"
      }`}
    >
      <span aria-hidden className={active ? "" : "grayscale opacity-70"}>
        {active ? "★" : "☆"}
      </span>
      <span>{active ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}
