"use client";

import { useEffect, useRef, useState } from "react";
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
};

export default function Checkpoint({ moduleSlug, id, title, xp = 20, children, celebration }: CheckpointProps) {
  const { completeCheckpoint, isCheckpointComplete, addXp } = useProgress();
  const { play } = useSound();
  const { say } = useTokey();
  const [showConfetti, setShowConfetti] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);
  const completed = isCheckpointComplete(moduleSlug, id);

  useEffect(() => {
    if (firedRef.current) return;
    if (completed) {
      firedRef.current = true;
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.boundingClientRect.bottom < window.innerHeight + 50) {
            if (firedRef.current) return;
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
            observer.disconnect();
          }
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [moduleSlug, id, xp, title, celebration, completeCheckpoint, addXp, play, say, completed]);

  return (
    <>
      <Confetti active={showConfetti} />
      <div ref={ref} className="relative my-12 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-6">
        <div className="absolute -top-3 left-4 px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white flex items-center gap-1">
          {completed ? "✓" : "◆"} Checkpoint · {title}
        </div>
        {children}
        {completed && (
          <div className="mt-4 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            ✓ Completed — nice work.
          </div>
        )}
      </div>
    </>
  );
}
