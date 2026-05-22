"use client";

import { useId, useState, ReactNode } from "react";

export type RecapItem = {
  /** The single-line takeaway, visible up front. */
  takeaway: string;
  /** The "why" — one or two sentences, revealed on click. */
  detail: ReactNode;
};

export type PartRecapProps = {
  /** Short label, e.g. "Part 1 recap" */
  title: string;
  /** One-sentence gist of the part, above the bullets. */
  gist: string;
  /** 3–5 bullet takeaways. */
  points: RecapItem[];
};

/**
 * Lightweight end-of-part summary. Each bullet shows the one-line takeaway
 * immediately, and reveals a short "why it matters" on click. Cheaper than
 * TestYourself — no tabs, no full drill — but still enforces a little recall
 * (read the takeaway, think "do I know why?", then click to check).
 *
 * Use this at the end of EVERY part. Reserve TestYourself for parts where
 * implementing-from-scratch is the real skill check.
 */
export default function PartRecap({ title, gist, points }: PartRecapProps) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const baseId = useId();

  function toggle(i: number) {
    setOpen((o) => ({ ...o, [i]: !o[i] }));
  }

  function openAll() {
    const all: Record<number, boolean> = {};
    points.forEach((_, i) => (all[i] = true));
    setOpen(all);
  }

  function closeAll() {
    setOpen({});
  }

  const anyOpen = Object.values(open).some(Boolean);
  const allOpen = points.every((_, i) => open[i]);

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm dark:border-teal-800 dark:from-teal-950/40 dark:to-cyan-950/40">
      <div className="border-b border-teal-200 bg-teal-100/50 px-5 py-3 dark:border-teal-900 dark:bg-teal-950/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <h4 className="text-sm font-bold tracking-wider text-teal-900 uppercase dark:text-teal-200">
              {title}
            </h4>
          </div>
          <button
            type="button"
            onClick={allOpen ? closeAll : openAll}
            className="rounded text-xs font-semibold text-teal-800 hover:underline focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-teal-200 dark:focus-visible:ring-offset-slate-900"
            aria-label={allOpen ? "Collapse all takeaways" : "Expand all takeaways"}
          >
            {allOpen ? "Hide all" : anyOpen ? "Show rest" : "Reveal all"}
          </button>
        </div>
        <p className="mt-1 text-sm font-medium text-teal-900 dark:text-teal-100">{gist}</p>
      </div>

      <ul className="space-y-2 p-5">
        {points.map((p, i) => {
          const isOpen = !!open[i];
          return (
            <li
              key={i}
              className="overflow-hidden rounded-lg border border-teal-200 bg-white dark:border-teal-900 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-detail-${i}`}
                id={`${baseId}-summary-${i}`}
                className="flex w-full items-start gap-3 p-3 text-left transition hover:bg-teal-50/50 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none focus-visible:ring-inset dark:hover:bg-teal-950/40"
              >
                <span
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white dark:bg-teal-500"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {p.takeaway}
                </span>
                <span
                  className={`flex-shrink-0 text-xs text-teal-700 transition-transform dark:text-teal-300 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  aria-hidden
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <div
                  id={`${baseId}-detail-${i}`}
                  role="region"
                  aria-labelledby={`${baseId}-summary-${i}`}
                  className="animate-in fade-in slide-in-from-top-1 border-t border-teal-100 px-3 pt-2 pb-3 pl-11 text-sm text-slate-700 duration-200 dark:border-teal-900/60 dark:text-slate-300"
                >
                  {p.detail}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
