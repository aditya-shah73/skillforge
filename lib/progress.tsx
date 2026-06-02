"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { COURSES, ai, dsa, systemDesign, frontend } from "./courses";

type Progress = {
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  // Completed module keys in the form "<courseId>/<moduleSlug>". Namespacing by
  // course matters because identical slugs exist across courses (e.g.
  // "welcome", "capstone", "phase-1-revision"). A flat slug array would treat
  // AI/welcome and DSA/welcome as the same record and silently leak progress.
  completedModules: string[];
  completedCheckpoints: Record<string, string[]>; // moduleSlug -> checkpointIds
  combo: number;
  bestCombo: number;
  soundEnabled: boolean;
  hardcoreMode: boolean;
  easterEggs: string[];
  theme: string;
  // Bookmarked modules, stored as "<courseId>/<moduleSlug>" keys. We namespace
  // by course so identical slugs across courses (e.g. "welcome", "capstone")
  // bookmark independently.
  bookmarks: string[];
};

type ProgressContextType = Progress & {
  addXp: (amount: number, opts?: { speed?: boolean }) => { gained: number; comboMultiplier: number };
  incrementCombo: () => void;
  resetCombo: () => void;
  completeCheckpoint: (moduleSlug: string, checkpointId: string) => boolean;
  completeModule: (courseId: string, moduleSlug: string) => void;
  toggleSound: () => void;
  toggleHardcore: () => void;
  unlockEasterEgg: (id: string) => boolean;
  setTheme: (theme: string) => void;
  isCheckpointComplete: (moduleSlug: string, checkpointId: string) => boolean;
  isModuleComplete: (courseId: string, moduleSlug: string) => boolean;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  /** Serialize the full progress snapshot to a pretty-printed JSON string. */
  exportProgress: () => string;
  /**
   * Replace progress from a previously-exported JSON string. Returns true on a
   * successful parse+merge, false if the input was malformed (state untouched).
   */
  importProgress: (json: string) => boolean;
};

/** Build the canonical completed-module key for a course/module pair. */
export function moduleKey(courseId: string, moduleSlug: string) {
  return `${courseId}/${moduleSlug}`;
}

/**
 * Migrate legacy bare-slug entries in `completedModules` to namespaced
 * "<courseId>/<slug>" keys. Older builds stored only the slug, which collided
 * across courses for slugs like "welcome", "recap", "capstone", and every
 * "phase-N-revision". For each bare slug we look up which courses own it in
 * the registries and emit one key per matching course. If a slug exists in
 * multiple courses we keep all matches — over-crediting is recoverable from
 * the UI; silent under-crediting wouldn't be.
 */
function migrateCompletedModules(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const COURSE_LOOKUP: Record<string, { slug: string }[]> = {
    ai: ai.MODULES,
    dsa: dsa.MODULES,
    "system-design": systemDesign.MODULES,
    frontend: frontend.MODULES,
  };
  const out = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string" || entry.length === 0) continue;
    if (entry.includes("/")) {
      // Already namespaced — keep verbatim.
      out.add(entry);
      continue;
    }
    // Bare slug from legacy storage. Match against every course's registry.
    let matched = false;
    for (const c of COURSES) {
      const mods = COURSE_LOOKUP[c.id];
      if (mods?.some((m) => m.slug === entry)) {
        out.add(moduleKey(c.id, entry));
        matched = true;
      }
    }
    if (!matched) {
      // Slug isn't in any current registry — could be a removed module. Drop
      // rather than guess; localStorage retains nothing of value to recover.
      continue;
    }
  }
  return Array.from(out);
}

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
  bookmarks: [],
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
          } catch {
            // Best-effort migration: if the write back fails (quota, private
            // mode), we'll just re-read the legacy key on next load. No
            // user-visible impact.
          }
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        // Run the bare-slug → namespaced-key migration unconditionally; it's
        // a no-op when every entry is already namespaced, and idempotent.
        const completedModules = migrateCompletedModules(parsed.completedModules);
        setProgress({ ...defaultProgress, ...parsed, completedModules });
      }
    } catch {
      // localStorage may be unavailable in private mode or blocked by the
      // user — fall back to defaults rather than blocking hydration.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Quota-exceeded or storage unavailable — progress this session still
      // works in-memory; we just don't persist it. Don't surface to the user.
    }
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

  // Latest progress snapshot for cases where we need to compute a return value
  // synchronously without going through `setProgress`'s functional updater. Using
  // the updater for side effects is unsafe under React 19's StrictMode, which
  // intentionally double-invokes the updater in dev — any writes to closed-over
  // variables fire twice, drifting reported XP/multiplier values away from what
  // actually landed in state.
  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const addXp = useCallback((amount: number, opts?: { speed?: boolean }) => {
    // Compute gained/multiplier *outside* the setter so the values returned
    // here are deterministic and consistent with the state write below. The
    // closure-writes pattern that used to live here got the right result in
    // production but doubled under StrictMode.
    const combo = progressRef.current.combo;
    const comboMultiplier = combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1;
    const speedBonus = opts?.speed ? 5 : 0;
    const gained = Math.round(amount * comboMultiplier) + speedBonus;
    setProgress((p) => ({ ...p, xp: p.xp + gained }));
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

  const completeModule = useCallback((courseId: string, moduleSlug: string) => {
    const key = moduleKey(courseId, moduleSlug);
    setProgress((p) => {
      if (p.completedModules.includes(key)) return p;
      return { ...p, completedModules: [...p.completedModules, key] };
    });
  }, []);

  const isModuleComplete = useCallback(
    (courseId: string, moduleSlug: string) => {
      return progress.completedModules.includes(moduleKey(courseId, moduleSlug));
    },
    [progress.completedModules],
  );

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

  const toggleBookmark = useCallback((key: string) => {
    setProgress((p) => {
      const exists = p.bookmarks.includes(key);
      return {
        ...p,
        bookmarks: exists
          ? p.bookmarks.filter((b) => b !== key)
          : [...p.bookmarks, key],
      };
    });
  }, []);

  const isBookmarked = useCallback((key: string) => {
    return progress.bookmarks.includes(key);
  }, [progress.bookmarks]);

  // --- Backup / restore -----------------------------------------------------
  // Export and import operate on the *same* shape we persist to localStorage,
  // so a file exported here round-trips cleanly through the loader on import.
  // Read from the ref (not the captured `progress`) so the callback identity is
  // stable and always serializes the latest snapshot.
  const exportProgress = useCallback(() => {
    return JSON.stringify(progressRef.current, null, 2);
  }, []);

  const importProgress = useCallback((json: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      // Malformed JSON — leave current progress untouched.
      return false;
    }
    // Must be a plain object; reject arrays / primitives / null outright.
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return false;
    }
    const obj = parsed as Partial<Progress>;
    // Reuse the exact merge the loader uses: start from defaults, overlay the
    // imported fields, then run the bare-slug → namespaced-key migration so an
    // older export (or a hand-edited file) lands in the current storage shape.
    const completedModules = migrateCompletedModules(obj.completedModules);
    setProgress({ ...defaultProgress, ...obj, completedModules });
    return true;
  }, []);

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
        isModuleComplete,
        toggleBookmark,
        isBookmarked,
        exportProgress,
        importProgress,
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
      isModuleComplete: () => false,
      toggleBookmark: () => {},
      isBookmarked: () => false,
      exportProgress: () => JSON.stringify(defaultProgress, null, 2),
      importProgress: () => false,
    };
  }
  return ctx;
}

/**
 * Tiny sound effects for quiz feedback. Uses Web Audio API to generate tones
 * on the fly — no audio files needed, no network, works offline. Previous
 * versions kept a data-URI <audio> cache; that's been removed in favor of
 * synthesizing the four short patterns below directly.
 */
export function useSound() {
  const { soundEnabled } = useProgress();

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
    } catch {
      // AudioContext can throw on autoplay-blocked browsers / older Safari /
      // when the page hasn't yet had a user gesture. Failing silently is the
      // right UX: sounds are non-essential feedback.
    }
  }, [soundEnabled]);

  return { play };
}
