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
    return <div className="w-56 h-9" />;
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {combo >= 2 && (
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold flex items-center gap-1.5 animate-bounce">
          🔥 {combo}x combo
        </div>
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
          <div className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-1.5">
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
        <div className="px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono flex items-center gap-1.5">
          ⚡ {displayXp} XP
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
          className={`w-9 h-9 rounded-full text-base flex items-center justify-center transition ${
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
          className="w-9 h-9 rounded-full text-base hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition"
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </Tooltip>
    </div>
  );
}
