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
    <div className="not-prose my-8 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b-2 border-slate-300 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center gap-2">
          <span className="text-lg">📐</span>
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Worked example: {title}
          </h4>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {steps.slice(0, visible).map((step, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold">
                {i + 1}
              </span>
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {step.title}
              </div>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2 pl-8">
              {step.body}
            </div>
          </div>
        ))}

        {!allShown ? (
          <button
            onClick={() => setVisible((v) => v + 1)}
            className="w-full py-3 rounded-lg border-2 border-dashed border-indigo-400 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition text-sm font-semibold text-indigo-800 dark:text-indigo-200"
          >
            ↓ Next step ({visible}/{steps.length})
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-slate-500 dark:text-slate-400 italic">
              ✓ All {steps.length} steps shown.
            </div>
            <button
              onClick={() => setVisible(1)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
