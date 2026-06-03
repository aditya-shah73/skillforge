"use client";

import Link from "next/link";
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
    return <div className="h-9 w-28 shrink-0 sm:w-40" />;
  }

  return (
    // `shrink-0` so the search bar can't squish the stats group.
    // `flex-nowrap` so chips never wrap to a second line as XP/combo grow.
    // On mobile the row is XP-pill + icon buttons only — streak chip is
    // hidden (still tracked + announced via tooltips elsewhere) and combo
    // chip shows only when active. Toggles bumped to 36×36 (closer to the
    // 44px tap-target minimum without ballooning the header height).
    <div className="flex shrink-0 flex-nowrap items-center gap-1 text-sm sm:gap-2">
      {combo >= 2 && (
        <Tooltip
          align="start"
          label={
            <>
              <span className="font-semibold text-orange-600 dark:text-orange-300">Combo ×{combo}</span>
              <span className="mt-1 block">
                {combo} correct answers in a row. Multiplier kicks in at 3 (×1.5) and 5+ (×2). One wrong answer resets it.
              </span>
            </>
          }
        >
          <div className="flex animate-bounce items-center gap-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-2.5 py-1 font-bold text-white tabular-nums">
            🔥 <span className="font-mono">{combo}×</span>
          </div>
        </Tooltip>
      )}
      {streak > 0 && (
        <Tooltip
          align="start"
          label={
            <>
              <span className="font-semibold text-amber-700 dark:text-amber-300">Day streak</span>
              <span className="mt-1 block">
                {streak} day{streak === 1 ? "" : "s"} in a row. Clear at least one quiz checkpoint each day to keep it alive. Miss a day and it resets.
              </span>
            </>
          }
        >
          {/* Streak chip hidden below sm — it's nice-to-have and the row is
              cramped on phones. The XP pill still surfaces the headline number. */}
          <div className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 tabular-nums sm:flex dark:bg-amber-950 dark:text-amber-200">
            🔥 {streak}
          </div>
        </Tooltip>
      )}
      <Tooltip
        align="start"
        label={
          <>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">XP</span>
            <span className="mt-1 block">
              Earned by clearing quiz checkpoints. Chain correct answers for a combo: <span className="font-mono">×1.5</span> at 3 in a row, <span className="font-mono">×2</span> at 5+. Quick answers earn a <span className="font-mono">+5</span> speed bonus.
            </span>
          </>
        }
      >
        <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 font-mono font-semibold text-indigo-700 tabular-nums dark:bg-indigo-950 dark:text-indigo-300">
          <span aria-hidden>⚡</span>
          <span>{displayXp}</span>
        </div>
      </Tooltip>
      <Tooltip
        label={
          <>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Achievements</span>
            <span className="mt-1 block">
              See your badges, day streak, XP, and per-course stats. Also where you can export or import your progress.
            </span>
          </>
        }
      >
        {/* The achievements hub is otherwise reachable only from the command
            palette and the home page, so this header link is the one
            persistent path into it from inside a course or module. */}
        <Link
          href="/achievements"
          aria-label="View achievements"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base transition hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          🏆
        </Link>
      </Tooltip>
      <Tooltip
        label={
          <>
            <span className={`font-semibold ${hardcoreMode ? "text-rose-600 dark:text-rose-300" : "text-slate-700 dark:text-slate-200"}`}>
              Hardcore mode {hardcoreMode ? "ON" : "OFF"}
            </span>
            <span className="mt-1 block">
              {hardcoreMode
                ? "Wrong quiz answers lock in, no retries. Click to disable."
                : "You can retry quiz questions until you get them right. Click to enable hardcore."}
            </span>
          </>
        }
      >
        <button
          onClick={toggleHardcore}
          aria-label={hardcoreMode ? "Disable hardcore mode" : "Enable hardcore mode"}
          aria-pressed={hardcoreMode}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base transition ${
            hardcoreMode
              ? "bg-rose-100 ring-1 ring-rose-300 dark:bg-rose-950/60 dark:ring-rose-800"
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
            <span className="mt-1 block">
              {soundEnabled
                ? "Quiz feedback chimes (correct, wrong, combo, level-up) will play. Click to mute."
                : "Quiz feedback chimes are muted. Click to unmute."}
            </span>
          </>
        }
      >
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute sound effects" : "Unmute sound effects"}
          aria-pressed={soundEnabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base transition hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </Tooltip>
    </div>
  );
}
