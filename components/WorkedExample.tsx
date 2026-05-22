"use client";

import { useState, ReactNode } from "react";

export type Step = {
  title: string;
  body: ReactNode;
};

export type WorkedExampleProps = {
  title: string;
  subtitle?: string;
  steps: Step[];
};

/**
 * A "whiteboard" block that reveals one step at a time.
 * Forces the learner to think about what comes next before showing it.
 *
 * Styled like a chalkboard/whiteboard so it reads differently from
 * regular prose — these are the moments where we slow down and work
 * something out by hand.
 */
export default function WorkedExample({ title, subtitle, steps }: WorkedExampleProps) {
  const [visible, setVisible] = useState(1);
  const allShown = visible >= steps.length;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="border-b-2 border-slate-300 bg-gradient-to-r from-slate-100 to-white px-5 py-3 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-lg">📐</span>
          <h4 className="text-sm font-bold tracking-wider text-slate-800 uppercase dark:text-slate-200">
            Worked example: {title}
          </h4>
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="space-y-4 p-5">
        {steps.slice(0, visible).map((step, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-slate-200 bg-white p-4 duration-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {step.title}
              </div>
            </div>
            <div className="space-y-2 pl-8 text-sm text-slate-700 dark:text-slate-300">
              {step.body}
            </div>
          </div>
        ))}

        {!allShown ? (
          <button
            onClick={() => setVisible((v) => v + 1)}
            className="w-full rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/50 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
          >
            ↓ Next step ({visible}/{steps.length})
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500 italic dark:text-slate-400">
              ✓ All {steps.length} steps shown.
            </div>
            <button
              onClick={() => setVisible(1)}
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
