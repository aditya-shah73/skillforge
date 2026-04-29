"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

type Progress = {
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  completedModules: string[];
  completedCheckpoints: Record<string, string[]>; // moduleSlug -> checkpointIds
  combo: number;
  bestCombo: number;
  soundEnabled: boolean;
  hardcoreMode: boolean;
  easterEggs: string[];
  theme: string;
};

type ProgressContextType = Progress & {
  addXp: (amount: number, opts?: { speed?: boolean }) => { gained: number; comboMultiplier: number };
  incrementCombo: () => void;
  resetCombo: () => void;
  completeCheckpoint: (moduleSlug: string, checkpointId: string) => boolean;
  completeModule: (moduleSlug: string) => void;
  toggleSound: () => void;
  toggleHardcore: () => void;
  unlockEasterEgg: (id: string) => boolean;
  setTheme: (theme: string) => void;
  isCheckpointComplete: (moduleSlug: string, checkpointId: string) => boolean;
};

const defaultProgress: Progress = {
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedModules: [],
  completedCheckpoints: {},
  combo: 0,
  bestCombo: 0,
  soundEnabled: false,
  hardcoreMode: false,
  easterEggs: [],
  theme: "default",
};

const ProgressContext = createContext<ProgressContextType | null>(null);

const STORAGE_KEY = "skillforge-progress-v1";
// Older builds used this key. We migrate it once on first load so existing
// learners don't lose their XP / streak / completed checkpoints.
const LEGACY_STORAGE_KEY = "ai-course-progress-v1";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      // Migrate from the old "ai-course-progress-v1" key on first load after
      // the platform rename. Read once, write under the new key, drop the old.
      if (!raw) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          raw = legacy;
          try {
            localStorage.setItem(STORAGE_KEY, legacy);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {}
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        setProgress({ ...defaultProgress, ...parsed });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress, hydrated]);

  // Update streak on first interaction of the day
  const touchStreak = useCallback(() => {
    setProgress((p) => {
      const today = todayStr();
      if (p.lastStudyDate === today) return p;
      const newStreak = p.lastStudyDate && daysBetween(p.lastStudyDate, today) === 1
        ? p.streak + 1
        : 1;
      return { ...p, streak: newStreak, lastStudyDate: today };
    });
  }, []);

  const addXp = useCallback((amount: number, opts?: { speed?: boolean }) => {
    let gained = amount;
    let comboMultiplier = 1;
    setProgress((p) => {
      const multiplier = p.combo >= 5 ? 2 : p.combo >= 3 ? 1.5 : 1;
      const speedBonus = opts?.speed ? 5 : 0;
      gained = Math.round(amount * multiplier) + speedBonus;
      comboMultiplier = multiplier;
      return { ...p, xp: p.xp + gained };
    });
    touchStreak();
    return { gained, comboMultiplier };
  }, [touchStreak]);

  const incrementCombo = useCallback(() => {
    setProgress((p) => ({
      ...p,
      combo: p.combo + 1,
      bestCombo: Math.max(p.bestCombo, p.combo + 1),
    }));
  }, []);

  const resetCombo = useCallback(() => {
    setProgress((p) => ({ ...p, combo: 0 }));
  }, []);

  const completeCheckpoint = useCallback((moduleSlug: string, checkpointId: string) => {
    let wasNew = false;
    setProgress((p) => {
      const existing = p.completedCheckpoints[moduleSlug] || [];
      if (existing.includes(checkpointId)) return p;
      wasNew = true;
      return {
        ...p,
        completedCheckpoints: {
          ...p.completedCheckpoints,
          [moduleSlug]: [...existing, checkpointId],
        },
      };
    });
    return wasNew;
  }, []);

  const completeModule = useCallback((moduleSlug: string) => {
    setProgress((p) => {
      if (p.completedModules.includes(moduleSlug)) return p;
      return { ...p, completedModules: [...p.completedModules, moduleSlug] };
    });
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((p) => ({ ...p, soundEnabled: !p.soundEnabled }));
  }, []);

  const toggleHardcore = useCallback(() => {
    setProgress((p) => ({ ...p, hardcoreMode: !p.hardcoreMode }));
  }, []);

  const unlockEasterEgg = useCallback((id: string) => {
    let wasNew = false;
    setProgress((p) => {
      if (p.easterEggs.includes(id)) return p;
      wasNew = true;
      return { ...p, easterEggs: [...p.easterEggs, id], xp: p.xp + 25 };
    });
    return wasNew;
  }, []);

  const setTheme = useCallback((theme: string) => {
    setProgress((p) => ({ ...p, theme }));
  }, []);

  const isCheckpointComplete = useCallback((moduleSlug: string, checkpointId: string) => {
    return (progress.completedCheckpoints[moduleSlug] || []).includes(checkpointId);
  }, [progress.completedCheckpoints]);

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        addXp,
        incrementCombo,
        resetCombo,
        completeCheckpoint,
        completeModule,
        toggleSound,
        toggleHardcore,
        unlockEasterEgg,
        setTheme,
        isCheckpointComplete,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    // Return safe defaults when used outside provider (e.g. SSR)
    return {
      ...defaultProgress,
      addXp: () => ({ gained: 0, comboMultiplier: 1 }),
      incrementCombo: () => {},
      resetCombo: () => {},
      completeCheckpoint: () => false,
      completeModule: () => {},
      toggleSound: () => {},
      toggleHardcore: () => {},
      unlockEasterEgg: () => false,
      setTheme: () => {},
      isCheckpointComplete: () => false,
    };
  }
  return ctx;
}

// Simple sound player — bundled as data URIs, so no network
const SOUNDS = {
  correct: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
  wrong: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
};

export function useSound() {
  const { soundEnabled } = useProgress();
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const play = useCallback((name: "correct" | "wrong" | "levelup" | "combo") => {
    if (!soundEnabled) return;
    // Use Web Audio API to generate tones — no files needed
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const patterns = {
        correct: { freqs: [523, 659, 784], durations: [0.08, 0.08, 0.15] }, // C-E-G
        wrong: { freqs: [200, 150], durations: [0.1, 0.15] },
        levelup: { freqs: [523, 659, 784, 1047], durations: [0.1, 0.1, 0.1, 0.25] },
        combo: { freqs: [784, 1047], durations: [0.06, 0.1] },
      };
      const p = patterns[name];
      let t = ctx.currentTime;
      osc.type = "sine";
      p.freqs.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + p.durations[i]);
        t += p.durations[i];
      });
      osc.start();
      osc.stop(t);
    } catch {}
  }, [soundEnabled]);

  return { play };
}

// Suppress unused warnings for SOUNDS/audioCache — reserved for future
void SOUNDS;
