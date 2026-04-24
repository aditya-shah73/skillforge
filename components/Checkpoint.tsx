"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useProgress, useSound } from "@/lib/progress";
import { useTokey } from "@/components/Tokey";
import Confetti from "@/components/Confetti";

type CheckpointProps = {
  moduleSlug: string;
  id: string;
  title: string;
  xp?: number;
  children: React.ReactNode;
  /** Optional message shown by Tokey on completion */
  celebration?: string;
  /**
   * For project-style checkpoints with no quizzes inside (e.g. "go build this in Java").
   * Renders a "Mark as done" button instead of gating on quizzes.
   */
  manual?: boolean;
  /** Custom CTA label when manual=true. Defaults to "Mark as done". */
  manualLabel?: string;
};

/**
 * Registration channel for quizzes inside a Checkpoint.
 * Each child Quiz registers itself on mount and reports its correctness.
 * The Checkpoint clears only when every registered quiz is correct.
 */
type CheckpointRegistry = {
  register: (quizId: string) => void;
  unregister: (quizId: string) => void;
  markCorrect: (quizId: string) => void;
};

const CheckpointContext = createContext<CheckpointRegistry | null>(null);

/** Quizzes call this to participate in checkpoint gating. */
export function useCheckpointRegistration() {
  return useContext(CheckpointContext);
}

export default function Checkpoint({ moduleSlug, id, title, xp = 20, children, celebration, manual = false, manualLabel = "Mark as done" }: CheckpointProps) {
  const { completeCheckpoint, isCheckpointComplete, addXp } = useProgress();
  const { play } = useSound();
  const { say } = useTokey();
  const [showConfetti, setShowConfetti] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const firedRef = useRef(false);
  const completed = isCheckpointComplete(moduleSlug, id);

  const register = useCallback((quizId: string) => {
    setRegisteredIds((prev) => {
      if (prev.has(quizId)) return prev;
      const next = new Set(prev);
      next.add(quizId);
      return next;
    });
  }, []);

  const unregister = useCallback((quizId: string) => {
    setRegisteredIds((prev) => {
      if (!prev.has(quizId)) return prev;
      const next = new Set(prev);
      next.delete(quizId);
      return next;
    });
    setCorrectIds((prev) => {
      if (!prev.has(quizId)) return prev;
      const next = new Set(prev);
      next.delete(quizId);
      return next;
    });
  }, []);

  const markCorrect = useCallback((quizId: string) => {
    setCorrectIds((prev) => {
      if (prev.has(quizId)) return prev;
      const next = new Set(prev);
      next.add(quizId);
      return next;
    });
  }, []);

  const registry = useMemo<CheckpointRegistry>(
    () => ({ register, unregister, markCorrect }),
    [register, unregister, markCorrect]
  );

  const fire = useCallback(() => {
    if (firedRef.current || completed) return;
    firedRef.current = true;
    const wasNew = completeCheckpoint(moduleSlug, id);
    if (wasNew) {
      addXp(xp);
      setShowConfetti(true);
      play("levelup");
      say({
        mood: "celebrate",
        text: celebration || `Checkpoint cleared: ${title}! +${xp} XP`,
        duration: 4000,
      });
      setTimeout(() => setShowConfetti(false), 2200);
    }
  }, [completed, moduleSlug, id, xp, title, celebration, completeCheckpoint, addXp, play, say]);

  // Auto-fire when every registered quiz is resolved.
  // Manual checkpoints (project-style, no quizzes) skip this and use the button.
  useEffect(() => {
    if (manual) return;
    if (registeredIds.size === 0) return;
    const allCorrect = Array.from(registeredIds).every((qid) => correctIds.has(qid));
    if (!allCorrect) return;
    fire();
  }, [manual, registeredIds, correctIds, fire]);

  // If the checkpoint was already completed in a prior session, don't re-fire.
  useEffect(() => {
    if (completed) firedRef.current = true;
  }, [completed]);

  const total = registeredIds.size;
  const done = Array.from(registeredIds).filter((qid) => correctIds.has(qid)).length;
  const showProgress = !manual && total > 0 && !completed;

  return (
    <>
      <Confetti active={showConfetti} />
      <div className="relative my-12 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-6">
        <div className="absolute -top-3 left-4 px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white flex items-center gap-1">
          {completed ? "✓" : "◆"} Checkpoint · {title}
        </div>
        {showProgress && (
          <div className="absolute -top-3 right-4 px-3 py-0.5 text-[10px] font-semibold rounded-full bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            {done} / {total} answered
          </div>
        )}
        <CheckpointContext.Provider value={registry}>
          {children}
        </CheckpointContext.Provider>
        {completed && (
          <div className="mt-4 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            ✓ Completed — nice work.
          </div>
        )}
        {!completed && !manual && total > 0 && done < total && (
          <div className="mt-4 text-xs text-emerald-700/70 dark:text-emerald-300/70 italic">
            Answer every quiz above to clear this checkpoint.
          </div>
        )}
        {!completed && manual && (
          <button
            onClick={fire}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
          >
            {manualLabel} · +{xp} XP
          </button>
        )}
      </div>
    </>
  );
}
