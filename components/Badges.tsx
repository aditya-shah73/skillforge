"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { BADGES, buildBadgeStats } from "@/lib/badges";

/** Round minutes into a friendly "Xh Ym" / "Ym" label. */
function formatStudyTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Achievements board: a headline stats strip plus a grid of badge tiles.
 * Earned badges render in full color and sort first; locked ones are greyed
 * with a mini progress bar where a numeric target exists.
 *
 * Client-only with a `mounted` gate (matches BookmarksSection): progress lives
 * in localStorage, so on the server / first paint we render a stable skeleton
 * to avoid a hydration mismatch flashing zeros.
 */
export default function Badges() {
  const { xp, streak, bestCombo, completedModules, easterEggs } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Stable placeholder — same outer height as the real board so the page
    // doesn't jump when stats hydrate.
    return (
      <div className="animate-pulse">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900" />
          ))}
        </div>
      </div>
    );
  }

  const stats = buildBadgeStats({ xp, streak, bestCombo, completedModules, easterEggs });

  // Earned first, then by catalog order within each group.
  const ordered = [...BADGES].sort((a, b) => {
    const ea = a.earned(stats) ? 0 : 1;
    const eb = b.earned(stats) ? 0 : 1;
    return ea - eb;
  });
  const earnedCount = BADGES.filter((b) => b.earned(stats)).length;

  const summary = [
    { label: "XP", value: stats.xp.toLocaleString() },
    { label: "Modules done", value: String(stats.modulesCompleted) },
    { label: "Best streak", value: `${stats.streak}d` },
    { label: "Time studied", value: formatStudyTime(stats.minutesStudied) },
  ];

  return (
    <div>
      {/* Headline stats strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</div>
            <div className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Badges</h2>
        <span className="text-xs text-slate-400">
          {earnedCount} / {BADGES.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ordered.map((badge) => {
          const earned = badge.earned(stats);
          const pct = badge.progress ? Math.round(badge.progress(stats) * 100) : 0;
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col rounded-2xl border p-4 transition ${
                earned
                  ? `border-transparent bg-gradient-to-br text-white shadow-md ${badge.color}`
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <span
                className={`text-2xl leading-none ${earned ? "" : "opacity-40 grayscale"}`}
                aria-hidden
              >
                {badge.icon}
              </span>
              <h3
                className={`mt-2 text-sm font-bold tracking-tight ${
                  earned ? "text-white" : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {badge.title}
              </h3>
              <p
                className={`mt-0.5 text-xs ${
                  earned ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {badge.description}
              </p>

              {earned ? (
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  ✓ Earned
                </span>
              ) : (
                badge.progress !== undefined && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-slate-400 dark:bg-slate-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-400 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
