"use client";

import { useState, ReactNode } from "react";

type Tab = "explain" | "recognize" | "implement";

export type TestYourselfProps = {
  concept: string;
  explain: ReactNode;
  recognize: ReactNode;
  implement: ReactNode;
};

/**
 * A 3-tab self-check block that enforces the confidence bar:
 *   1. Can you EXPLAIN it in 2 minutes?
 *   2. Can you RECOGNIZE it in code?
 *   3. Can you IMPLEMENT it from scratch in Java?
 *
 * Each tab reveals a gold-standard answer AFTER the learner commits
 * (click "Show answer"). The idea is to force recall before reading.
 */
export default function TestYourself({ concept, explain, recognize, implement }: TestYourselfProps) {
  const [tab, setTab] = useState<Tab>("explain");
  const [revealed, setRevealed] = useState<Record<Tab, boolean>>({
    explain: false,
    recognize: false,
    implement: false,
  });

  const tabs: { key: Tab; label: string; icon: string; hint: string }[] = [
    { key: "explain", label: "Explain it", icon: "🗣️", hint: "In 2 minutes, in your own words." },
    { key: "recognize", label: "Spot it in code", icon: "🔍", hint: "Can you point it out in a snippet?" },
    { key: "implement", label: "Implement it", icon: "⚒️", hint: "Write it from scratch in Java." },
  ];

  const current = tabs.find((t) => t.key === tab)!;
  const body = { explain, recognize, implement }[tab];

  return (
    <div className="not-prose my-8 rounded-xl border-2 border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-amber-200 dark:border-amber-900 bg-amber-100/50 dark:bg-amber-950/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg">🎯</span>
          <h4 className="font-bold text-sm uppercase tracking-wider text-amber-900 dark:text-amber-200">
            Confidence check: {concept}
          </h4>
        </div>
        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
          Three tabs, three levels. Try answering each in your head before you reveal.
        </p>
      </div>

      <div className="flex border-b border-amber-200 dark:border-amber-900 bg-white/60 dark:bg-slate-900/40">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
              tab === t.key
                ? "bg-amber-200/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-b-2 border-amber-600 dark:border-amber-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        <div className="text-sm text-slate-700 dark:text-slate-300 italic">
          <span className="font-semibold text-amber-900 dark:text-amber-200">Prompt:</span> {current.hint}
        </div>

        {!revealed[tab] ? (
          <button
            onClick={() => setRevealed((r) => ({ ...r, [tab]: true }))}
            className="w-full py-4 rounded-lg border-2 border-dashed border-amber-400 dark:border-amber-700 bg-white/50 dark:bg-slate-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition text-sm font-semibold text-amber-900 dark:text-amber-200"
          >
            🤔 Thought about it? → Show answer
          </button>
        ) : (
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 p-4 text-sm text-slate-800 dark:text-slate-200 space-y-3">
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
