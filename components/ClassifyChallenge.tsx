"use client";

import { useState } from "react";

export type Item = {
  id: string;
  label: string;
  answer: string; // must match one of the `buckets` ids
  explanation: string;
};

export type Bucket = {
  id: string;
  label: string;
  description?: string;
  color: "rose" | "amber" | "emerald" | "indigo" | "sky" | "violet";
};

export type ClassifyChallengeProps = {
  title: string;
  prompt: string;
  buckets: Bucket[];
  items: Item[];
};

const COLOR_MAP: Record<Bucket["color"], { bg: string; border: string; text: string; bgDark: string }> = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-300 dark:border-rose-800",
    text: "text-rose-900 dark:text-rose-200",
    bgDark: "bg-rose-200 dark:bg-rose-900/60",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-200",
    bgDark: "bg-amber-200 dark:bg-amber-900/60",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-200",
    bgDark: "bg-emerald-200 dark:bg-emerald-900/60",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-300 dark:border-indigo-800",
    text: "text-indigo-900 dark:text-indigo-200",
    bgDark: "bg-indigo-200 dark:bg-indigo-900/60",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-300 dark:border-sky-800",
    text: "text-sky-900 dark:text-sky-200",
    bgDark: "bg-sky-200 dark:bg-sky-900/60",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-300 dark:border-violet-800",
    text: "text-violet-900 dark:text-violet-200",
    bgDark: "bg-violet-200 dark:bg-violet-900/60",
  },
};

/**
 * A click-to-classify quiz. Each item starts unassigned; the learner
 * clicks one of the buckets to guess. We show instant feedback + the
 * explanation after each click. No drag-and-drop — too finicky on mobile.
 */
export default function ClassifyChallenge({ title, prompt, buckets, items }: ClassifyChallengeProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const correctCount = items.filter((it) => answers[it.id] === it.answer).length;
  const answeredCount = Object.keys(answers).length;
  const done = answeredCount === items.length;

  function choose(itemId: string, bucketId: string) {
    setAnswers((a) => ({ ...a, [itemId]: bucketId }));
  }

  function reset() {
    setAnswers({});
  }

  return (
    <div className="not-prose my-8 rounded-xl border-2 border-violet-300 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-violet-200 dark:border-violet-900 bg-violet-100/50 dark:bg-violet-950/60">
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗂️</span>
            <h4 className="font-bold text-sm uppercase tracking-wider text-violet-900 dark:text-violet-200">
              {title}
            </h4>
          </div>
          <div className="text-xs font-mono text-violet-900 dark:text-violet-200">
            {correctCount}/{items.length} correct
          </div>
        </div>
        <p className="text-sm text-violet-800 dark:text-violet-200 mt-1">{prompt}</p>
      </div>

      <div className="p-5 space-y-3">
        {items.map((item) => {
          const chosen = answers[item.id];
          const isCorrect = chosen === item.answer;
          const correctBucket = buckets.find((b) => b.id === item.answer)!;
          const chosenBucket = chosen ? buckets.find((b) => b.id === chosen) : null;

          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2"
            >
              <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                {item.label}
              </div>
              <div className="flex gap-2 flex-wrap">
                {buckets.map((b) => {
                  const c = COLOR_MAP[b.color];
                  const picked = chosen === b.id;
                  const shouldBeGreen = picked && isCorrect;
                  const shouldBeRed = picked && !isCorrect;
                  return (
                    <button
                      key={b.id}
                      onClick={() => choose(item.id, b.id)}
                      disabled={!!chosen}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md border-2 transition ${
                        shouldBeGreen
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : shouldBeRed
                          ? "bg-rose-500 text-white border-rose-600"
                          : picked
                          ? `${c.bgDark} ${c.text} ${c.border}`
                          : chosen
                          ? "opacity-40 " + c.bg + " " + c.text + " " + c.border
                          : `${c.bg} ${c.text} ${c.border} hover:${c.bgDark}`
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
              {chosen && (
                <div
                  className={`text-xs p-2 rounded ${
                    isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900"
                  }`}
                >
                  {isCorrect ? "✓ Correct. " : `✗ Nope — it's ${correctBucket.label}. `}
                  {item.explanation}
                  {!isCorrect && chosenBucket && (
                    <span className="block mt-1 opacity-75">
                      (You picked {chosenBucket.label}.)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {done && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
            <div
              className={`text-sm font-semibold ${
                correctCount === items.length
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {correctCount === items.length
                ? "🎉 All correct. You've got it."
                : `Got ${correctCount}/${items.length}. Try again?`}
            </div>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-md border border-violet-300 dark:border-violet-700 bg-white/50 dark:bg-slate-900 text-xs font-semibold text-violet-900 dark:text-violet-200 hover:bg-violet-100 dark:hover:bg-violet-950"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
