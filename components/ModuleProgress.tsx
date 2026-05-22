"use client";

import { useProgress } from "@/lib/progress";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { CourseId } from "@/lib/courses";

type CheckpointDef = { id: string; title: string };

/**
 * Derive the courseId for the current module page from the URL path.
 * Module pages are mounted under `/courses/<slug>/modules/<moduleSlug>`,
 * and course slugs are one-to-one with course ids ("ai", "dsa",
 * "system-design") — see the COURSE_META exports in /lib/courses/*. We
 * read the first segment after `/courses/` and validate it against the
 * known id set so a stray path (e.g. /courses/old-name/) returns null
 * instead of writing a junk key into progress storage.
 */
function deriveCourseId(pathname: string | null): CourseId | null {
  if (!pathname) return null;
  const m = pathname.match(/^\/courses\/([^/]+)\//);
  if (!m) return null;
  const slug = m[1];
  if (slug === "ai" || slug === "dsa" || slug === "system-design") {
    return slug;
  }
  return null;
}

export default function ModuleProgress({
  moduleSlug,
  checkpoints,
}: {
  moduleSlug: string;
  checkpoints: CheckpointDef[];
}) {
  const { completedCheckpoints, isModuleComplete, completeModule } = useProgress();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const courseId = deriveCourseId(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  const done = mounted ? completedCheckpoints[moduleSlug] || [] : [];
  const total = checkpoints.length;
  const completed = checkpoints.filter((c) => done.includes(c.id)).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Auto-mark the module complete when every checkpoint has been cleared.
  // Completion is keyed by `<courseId>/<moduleSlug>`, so same-named modules
  // across courses (e.g. AI/welcome vs DSA/welcome) track independently.
  useEffect(() => {
    if (!mounted) return;
    if (!courseId) return;
    if (total === 0) return;
    if (completed < total) return;
    if (isModuleComplete(courseId, moduleSlug)) return;
    completeModule(courseId, moduleSlug);
  }, [mounted, courseId, completed, total, moduleSlug, isModuleComplete, completeModule]);

  if (!mounted) return <div className="h-10" />;

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-semibold uppercase tracking-wider">Module progress</span>
        <span className="font-mono">{completed}/{total} checkpoints</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Module progress: ${completed} of ${total} checkpoints complete`}
        className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="flex justify-between mt-2 gap-1 list-none p-0" aria-label="Checkpoints">
        {checkpoints.map((c) => {
          const isDone = done.includes(c.id);
          return (
            <li
              key={c.id}
              title={`${c.title} — ${isDone ? "complete" : "incomplete"}`}
              aria-label={`${c.title}: ${isDone ? "complete" : "incomplete"}`}
              className={`flex-1 h-1.5 rounded-full transition-colors ${isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          );
        })}
      </ul>
    </div>
  );
}
