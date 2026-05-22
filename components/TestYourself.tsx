"use client";

import { useState, ReactNode, useId, useRef, KeyboardEvent } from "react";

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
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement | null>(null);

  const tabs: { key: Tab; label: string; icon: string; hint: string }[] = [
    { key: "explain", label: "Explain it", icon: "🗣️", hint: "In 2 minutes, in your own words." },
    { key: "recognize", label: "Spot it in code", icon: "🔍", hint: "Can you point it out in a snippet?" },
    { key: "implement", label: "Implement it", icon: "⚒️", hint: "Write it from scratch in Java." },
  ];

  const current = tabs.find((t) => t.key === tab)!;
  const body = { explain, recognize, implement }[tab];

  // Arrow-key navigation per APG: left/right cycle, home/end jump to ends.
  function handleTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const idx = tabs.findIndex((t) => t.key === tab);
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = tabs.length - 1;
    if (nextIdx === null) return;
    e.preventDefault();
    const nextKey = tabs[nextIdx].key;
    setTab(nextKey);
    // Move focus to the newly-active tab.
    const next = tablistRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-key="${nextKey}"]`
    );
    next?.focus();
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm dark:border-amber-800 dark:from-amber-950/40 dark:to-orange-950/40">
      <div className="border-b border-amber-200 bg-amber-100/50 px-5 py-3 dark:border-amber-900 dark:bg-amber-950/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg">🎯</span>
          <h4 className="text-sm font-bold tracking-wider text-amber-900 uppercase dark:text-amber-200">
            Confidence check: {concept}
          </h4>
        </div>
        <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
          Three tabs, three levels. Try answering each in your head before you reveal.
        </p>
      </div>

      <div
        role="tablist"
        aria-label={`Confidence check for ${concept}`}
        ref={tablistRef}
        className="flex border-b border-amber-200 bg-white/60 dark:border-amber-900 dark:bg-slate-900/40"
      >
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              id={`${baseId}-tab-${t.key}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${t.key}`}
              // Only the active tab is in the tab order; arrow keys move focus
              // between tabs once you've landed on one. APG roving tabindex.
              tabIndex={isActive ? 0 : -1}
              data-tab-key={t.key}
              onClick={() => setTab(t.key)}
              onKeyDown={handleTabKey}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm dark:focus-visible:ring-offset-slate-900 ${
                isActive
                  ? "border-b-2 border-amber-600 bg-amber-200/60 text-amber-900 dark:border-amber-400 dark:bg-amber-900/40 dark:text-amber-100"
                  : "text-slate-600 hover:bg-amber-100/50 dark:text-slate-400 dark:hover:bg-amber-900/20"
              }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${tab}`}
        aria-labelledby={`${baseId}-tab-${tab}`}
        tabIndex={0}
        className="space-y-4 p-5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none focus-visible:ring-inset"
      >
        <div className="text-sm text-slate-700 italic dark:text-slate-300">
          <span className="font-semibold text-amber-900 dark:text-amber-200">Prompt:</span> {current.hint}
        </div>

        {!revealed[tab] ? (
          <button
            onClick={() => setRevealed((r) => ({ ...r, [tab]: true }))}
            className="w-full rounded-lg border-2 border-dashed border-amber-400 bg-white/50 py-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-900/40 dark:text-amber-200 dark:hover:bg-amber-950/40"
          >
            🤔 Thought about it? → Show answer
          </button>
        ) : (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-white p-4 text-sm text-slate-800 dark:border-amber-900 dark:bg-slate-900 dark:text-slate-200">
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
