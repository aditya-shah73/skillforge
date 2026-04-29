"use client";

import { useState, ReactNode } from "react";

export type CodeExerciseProps = {
  /** Short label, e.g. "Exercise 1: implement predict()" */
  title: string;
  /** The task in plain English. What should the code do? */
  prompt: ReactNode;
  /** The stub code (what the learner starts from — method signature + TODOs). */
  stub: string;
  /** The intended solution. Shown after they click "Show solution". */
  solution: string;
  /** Optional hints — one line each. Shown one at a time on click. */
  hints?: string[];
  /** Language for the code blocks. Defaults to "java". */
  lang?: string;
};

/**
 * A hands-on coding challenge. Shows a method stub with TODO comments,
 * asks the learner to implement it mentally (or in their editor),
 * then reveals the reference solution on click.
 *
 * Not a code runner — we rely on the adjacent project section to give
 * learners a real environment to compile and execute. This component's
 * job is to slow them down and force a real attempt before they see
 * the answer.
 */
export default function CodeExercise({
  title,
  prompt,
  stub,
  solution,
  hints = [],
  lang = "java",
}: CodeExerciseProps) {
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="not-prose my-8 rounded-xl border-2 border-orange-300 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-orange-200 dark:border-orange-900 bg-orange-100/50 dark:bg-orange-950/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">⌨️</span>
          <h4 className="font-bold text-sm uppercase tracking-wider text-orange-900 dark:text-orange-200">
            {title}
          </h4>
        </div>
        <div className="text-sm text-orange-950 dark:text-orange-100 mt-1">{prompt}</div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-300 mb-1">
            Stub — fill in the TODOs
          </div>
          <pre className="text-xs sm:text-sm rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 overflow-x-auto border border-slate-700 font-mono leading-relaxed">
            <code className={`language-${lang}`}>{stub}</code>
          </pre>
        </div>

        {hints.length > 0 && hintsShown < hints.length && !showSolution && (
          <button
            onClick={() => setHintsShown((h) => h + 1)}
            className="text-xs font-semibold text-orange-800 dark:text-orange-300 hover:underline"
          >
            💡 {hintsShown === 0 ? "Need a hint?" : `Another hint? (${hintsShown}/${hints.length} shown)`}
          </button>
        )}

        {hintsShown > 0 && (
          <ul className="space-y-1 text-xs text-orange-900 dark:text-orange-200 pl-4 border-l-2 border-orange-300 dark:border-orange-700">
            {hints.slice(0, hintsShown).map((h, i) => (
              <li key={i} className="italic">
                Hint {i + 1}: {h}
              </li>
            ))}
          </ul>
        )}

        {!showSolution ? (
          <button
            onClick={() => setShowSolution(true)}
            className="w-full py-3 rounded-lg border-2 border-dashed border-orange-400 dark:border-orange-700 bg-white/50 dark:bg-slate-900/40 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition text-sm font-semibold text-orange-900 dark:text-orange-200"
          >
            ✓ Tried it? → Show solution
          </button>
        ) : (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
              Reference solution
            </div>
            <pre className="text-xs sm:text-sm rounded-lg bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 overflow-x-auto border-2 border-emerald-500 dark:border-emerald-700 font-mono leading-relaxed">
              <code className={`language-${lang}`}>{solution}</code>
            </pre>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-2">
              Your solution doesn&apos;t have to match this exactly — as long as the behavior is right, it&apos;s right. Compare and see if theirs is cleaner or yours is.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
