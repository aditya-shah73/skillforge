import type { Module } from "@/lib/courses/ai";

/**
 * A prominent, color-coded chip row for a module card: difficulty level on the
 * left, estimated time on the right. Rendered under the subtitle on every
 * course-landing card.
 *
 * Pure server component — it reads only static module metadata
 * (difficulty / estimatedMinutes), never localStorage, so it's safe to use
 * inside the server-rendered landing pages without a "use client" boundary.
 */

type Difficulty = NonNullable<Module["difficulty"]>;

/** Human label + Tailwind classes for each difficulty level. */
const DIFFICULTY_STYLE: Record<
  Difficulty,
  { label: string; className: string }
> = {
  intro: {
    label: "Intro",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  core: {
    label: "Core",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  advanced: {
    label: "Advanced",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

/** Round minutes into a compact "Xh Ym" / "Ym" label. */
function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function ModuleBadges({
  difficulty,
  estimatedMinutes,
}: {
  difficulty?: Module["difficulty"];
  estimatedMinutes?: number;
}) {
  // Nothing to show if a module is missing both bits of metadata.
  if (!difficulty && estimatedMinutes == null) return null;

  const diff = difficulty ? DIFFICULTY_STYLE[difficulty] : null;

  return (
    <div className="mt-0.5 mb-3.5 flex flex-wrap items-center gap-1.5">
      {diff && (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${diff.className}`}
        >
          {diff.label}
        </span>
      )}
      {estimatedMinutes != null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <span aria-hidden>⏱</span>
          {formatMinutes(estimatedMinutes)}
        </span>
      )}
    </div>
  );
}
