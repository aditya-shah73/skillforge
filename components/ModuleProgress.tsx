"use client";

import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";

type CheckpointDef = { id: string; title: string };

export default function ModuleProgress({
  moduleSlug,
  checkpoints,
}: {
  moduleSlug: string;
  checkpoints: CheckpointDef[];
}) {
  const { completedCheckpoints, completedModules, completeModule } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const done = mounted ? completedCheckpoints[moduleSlug] || [] : [];
  const total = checkpoints.length;
  const completed = checkpoints.filter((c) => done.includes(c.id)).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Auto-mark the module complete when every checkpoint has been cleared.
  // This is the only place that flips `completedModules` today, which feeds
  // the home-page resume CTA, per-course progress bar, and palette ordering.
  useEffect(() => {
    if (!mounted) return;
    if (total === 0) return;
    if (completed < total) return;
    if (completedModules.includes(moduleSlug)) return;
    completeModule(moduleSlug);
  }, [mounted, completed, total, moduleSlug, completedModules, completeModule]);

  if (!mounted) return <div className="h-10" />;

  return (
    <div className="mt-6 mb-2">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span className="font-semibold uppercase tracking-wider">Module progress</span>
        <span className="font-mono">{completed}/{total} checkpoints</span>
      </div>
      <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 gap-1">
        {checkpoints.map((c) => {
          const isDone = done.includes(c.id);
          return (
            <div
              key={c.id}
              title={c.title}
              className={`flex-1 h-1.5 rounded-full transition-colors ${isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
