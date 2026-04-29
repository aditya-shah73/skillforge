"use client";

import { useProgress } from "@/lib/progress";
import { useEffect, useState } from "react";

export default function HeaderStats() {
  const { xp, streak, combo, soundEnabled, toggleSound } = useProgress();
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
    return <div className="w-48 h-6" />;
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {combo >= 2 && (
        <div className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold flex items-center gap-1 animate-bounce">
          🔥 {combo}x combo
        </div>
      )}
      {streak > 0 && (
        <div title="Day streak" className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-semibold flex items-center gap-1">
          🔥 {streak}
        </div>
      )}
      <div title="XP" className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
        ⚡ {displayXp} XP
      </div>
      <button
        onClick={toggleSound}
        title={soundEnabled ? "Mute" : "Unmute"}
        className="w-7 h-7 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition"
      >
        {soundEnabled ? "🔊" : "🔇"}
      </button>
    </div>
  );
}
