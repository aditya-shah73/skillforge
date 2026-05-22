/**
 * Skeleton shown during route transitions to/inside a course.
 * Mirrors the rough layout of a module page (back-link, pill, title,
 * subtitle, body) so the visual handoff is smooth.
 *
 * Sub-routes (specific module pages) render this via the course-level
 * loading.tsx until the page chunk finishes loading + hydrating.
 */
export default function ModuleSkeleton({
  pillColor = "from-slate-400 to-slate-500",
}: {
  pillColor?: string;
}) {
  return (
    <div className="animate-pulse">
      {/* Back link placeholder */}
      <div className="mb-4 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Phase / module pill placeholder */}
      <div
        className={`mb-4 inline-block h-6 w-72 max-w-full rounded-full bg-gradient-to-r ${pillColor} opacity-50`}
      />

      {/* Title placeholder */}
      <div className="mb-3 h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Subtitle placeholder */}
      <div className="mb-2 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-8 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Body — a few representative blocks */}
      <div className="mb-6 space-y-3">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-10/12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-9/12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Code block placeholder */}
      <div className="mb-6 h-40 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />

      <div className="mb-6 space-y-3">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-10/12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Callout placeholder */}
      <div className="mb-6 h-28 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />

      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-10/12 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
