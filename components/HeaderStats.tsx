"use client";

import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";
import Tooltip from "./Tooltip";

export default function HeaderStats() {
  const { xp, streak, combo, soundEnabled, toggleSound, hardcoreMode, toggleHardcore } = useProgress();
  const [mounted, setMounted] = useState(false);
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate XP counter up. Intentionally omit `displayXp` from deps so the
  // interval doesn't reset on every tick — we drive convergence inside the
  // interval using setDisplayXp's functional updater.
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      setDisplayXp((v) => {
        const diff = xp - v;
        if (diff === 0) return v;
        const stepSize = Math.max(1, Math.ceil(Math.abs(diff) / 30));
        return diff > 0 ? Math.min(xp, v + stepSize) : Math.max(xp, v - stepSize);
      });
    }, 20);
    return () => clearInterval(timer);
  }, [xp, mounted]);

  if (!mounted) {
    return <div className="shrink-0 w-40 h-9" />;
  }

  return (
    // `shrink-0` so the search bar can't squish the stats group.
    // `flex-nowrap` so chips never wrap to a second line as XP/combo grow.
    // Compact paddings and a single icon-only "combo" pill on small screens
    // keep the row stable even at 4-digit XP.
    <div className="shrink-0 flex flex-nowrap items-center gap-2 text-sm">
      {combo >= 2 && (
        <Tooltip
          label={
            <>
              <span className="font-semibold text-orange-600 dark:text-orange-300">Combo ×{combo}</span>
              <span className="block mt-1">
                {combo} correct answers in a row. Multiplier kicks in at 3 (×1.5) and 5+ (×2). One wrong answer resets it.
              </span>
            </>
          }
        >
          <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold flex items-center gap-1 animate-bounce tabular-nums">
            🔥 <span className="font-mono">{combo}×</span>
          </div>
        </Tooltip>
      )}
      {streak > 0 && (
        <Tooltip
          label={
            <>
              <span className="font-semibold text-amber-700 dark:text-amber-300">Day streak</span>
              <span className="block mt-1">
                {streak} day{streak === 1 ? "" : "s"} in a row. Clear at least one quiz checkpoint each day to keep it alive — miss a day and it resets.
              </span>
            </>
          }
        >
          <div className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-1 tabular-nums">
            🔥 {streak}
          </div>
        </Tooltip>
      )}
      <Tooltip
        label={
          <>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">XP</span>
            <span className="block mt-1">
              Earned by clearing quiz checkpoints. Chain correct answers for a combo: <span className="font-mono">×1.5</span> at 3 in a row, <span className="font-mono">×2</span> at 5+. Quick answers earn a <span className="font-mono">+5</span> speed bonus.
            </span>
          </>
        }
      >
        <div className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono flex items-center gap-1 tabular-nums">
          <span aria-hidden>⚡</span>
          <span>{displayXp}</span>
        </div>
      </Tooltip>
      <Tooltip
        label={
          <>
            <span className={`font-semibold ${hardcoreMode ? "text-rose-600 dark:text-rose-300" : "text-slate-700 dark:text-slate-200"}`}>
              Hardcore mode {hardcoreMode ? "ON" : "OFF"}
            </span>
            <span className="block mt-1">
              {hardcoreMode
                ? "Wrong quiz answers lock in — no retries. Click to disable."
                : "You can retry quiz questions until you get them right. Click to enable hardcore."}
            </span>
          </>
        }
      >
        <button
          onClick={toggleHardcore}
          aria-label={hardcoreMode ? "Disable hardcore mode" : "Enable hardcore mode"}
          aria-pressed={hardcoreMode}
          className={`shrink-0 w-8 h-8 rounded-full text-base flex items-center justify-center transition ${
            hardcoreMode
              ? "bg-rose-100 dark:bg-rose-950/60 ring-1 ring-rose-300 dark:ring-rose-800"
              : "hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          {hardcoreMode ? "💀" : "🎯"}
        </button>
      </Tooltip>
      <Tooltip
        align="end"
        label={
          <>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Sound {soundEnabled ? "ON" : "OFF"}
            </span>
            <span className="block mt-1">
              {soundEnabled
                ? "Quiz feedback chimes — correct, wrong, combo, level-up — will play. Click to mute."
                : "Quiz feedback chimes are muted. Click to unmute."}
            </span>
          </>
        }
      >
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
          aria-pressed={soundEnabled}
          className="shrink-0 w-8 h-8 rounded-full text-base hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition"
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </Tooltip>
    </div>
  );
}
