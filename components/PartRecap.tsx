"use client";

import { useState, ReactNode } from "react";

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
    <div className="not-prose my-8 rounded-xl border-2 border-teal-300 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-teal-200 dark:border-teal-900 bg-teal-100/50 dark:bg-teal-950/60">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📌</span>
            <h4 className="font-bold text-sm uppercase tracking-wider text-teal-900 dark:text-teal-200">
              {title}
            </h4>
          </div>
          <button
            onClick={allOpen ? closeAll : openAll}
            className="text-xs font-semibold text-teal-800 dark:text-teal-200 hover:underline"
          >
            {allOpen ? "Hide all" : anyOpen ? "Show rest" : "Reveal all"}
          </button>
        </div>
        <p className="text-sm text-teal-900 dark:text-teal-100 mt-1 font-medium">{gist}</p>
      </div>

      <ul className="p-5 space-y-2">
        {points.map((p, i) => {
          const isOpen = !!open[i];
          return (
            <li
              key={i}
              className="rounded-lg border border-teal-200 dark:border-teal-900 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-start gap-3 p-3 text-left hover:bg-teal-50/50 dark:hover:bg-teal-950/40 transition"
              >
                <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {p.takeaway}
                </span>
                <span
                  className={`flex-shrink-0 text-xs text-teal-700 dark:text-teal-300 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  aria-hidden
                >
                  ▶
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pl-11 text-sm text-slate-700 dark:text-slate-300 border-t border-teal-100 dark:border-teal-900/60 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
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
