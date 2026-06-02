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
    <div className="not-prose my-8 overflow-hidden rounded-xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm dark:border-orange-800 dark:from-orange-950/40 dark:to-amber-950/40">
      <div className="border-b border-orange-200 bg-orange-100/50 px-5 py-3 dark:border-orange-900 dark:bg-orange-950/60">
        <div className="flex items-center gap-2">
          <span className="text-lg">⌨️</span>
          <h4 className="text-sm font-bold tracking-wider text-orange-900 uppercase dark:text-orange-200">
            {title}
          </h4>
        </div>
        <div className="mt-1 text-sm text-orange-950 dark:text-orange-100">{prompt}</div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="mb-1 text-xs font-semibold tracking-wider text-orange-800 uppercase dark:text-orange-300">
            Stub, fill in the TODOs
          </div>
          <pre className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm dark:bg-slate-950">
            <code className={`language-${lang}`}>{stub}</code>
          </pre>
        </div>

        {hints.length > 0 && hintsShown < hints.length && !showSolution && (
          <button
            onClick={() => setHintsShown((h) => h + 1)}
            className="text-xs font-semibold text-orange-800 hover:underline dark:text-orange-300"
          >
            💡 {hintsShown === 0 ? "Need a hint?" : `Another hint? (${hintsShown}/${hints.length} shown)`}
          </button>
        )}

        {hintsShown > 0 && (
          <ul className="space-y-1 border-l-2 border-orange-300 pl-4 text-xs text-orange-900 dark:border-orange-700 dark:text-orange-200">
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
            className="w-full rounded-lg border-2 border-dashed border-orange-400 bg-white/50 py-3 text-sm font-semibold text-orange-900 transition hover:bg-orange-50 dark:border-orange-700 dark:bg-slate-900/40 dark:text-orange-200 dark:hover:bg-orange-950/40"
          >
            ✓ Tried it? → Show solution
          </button>
        ) : (
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
              Reference solution
            </div>
            <pre className="overflow-x-auto rounded-lg border-2 border-emerald-500 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm dark:border-emerald-700 dark:bg-slate-950">
              <code className={`language-${lang}`}>{solution}</code>
            </pre>
            <p className="mt-2 text-xs text-slate-600 italic dark:text-slate-400">
              Your solution doesn&apos;t have to match this exactly, as long as the behavior is right, it&apos;s right. Compare and see if theirs is cleaner or yours is.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
