"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useProgress, useSound } from "@/lib/progress";
import { useTokey } from "@/components/Tokey";
import { useCheckpointRegistration } from "@/components/Checkpoint";

export type QuizOption = {
  label: string;
  correct?: boolean;
  explanation?: string;
};

export type QuizProps = {
  question: string;
  options: QuizOption[];
  hint?: string;
  /** Text shown above — e.g. "Quick check" or "Gut check" */
  kind?: string;
  /** Base XP awarded on correct answer (before combo/speed). Defaults to 10. */
  xp?: number;
};

const ENCOURAGE_CORRECT = [
  "Nailed it.",
  "Look at you go.",
  "Exactly right.",
  "Boom.",
  "You're cooking.",
];

const ENCOURAGE_WRONG = [
  "Close! Try again.",
  "Nope — read it once more.",
  "Not this one. Think it through.",
  "Nah, but you're close.",
];

export default function Quiz({ question, options, hint, kind = "Quick check", xp = 10 }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState<number | null>(null);
  const [reward, setReward] = useState<{ gained: number; multiplier: number; speed: boolean } | null>(null);
  const startedAt = useRef<number>(Date.now());
  const { addXp, incrementCombo, resetCombo, combo, hardcoreMode } = useProgress();
  const { play } = useSound();
  const { say } = useTokey();
  const checkpoint = useCheckpointRegistration();
  const quizId = useId();

  const answered = selected !== null && options[selected]?.correct;
  // In hardcore mode, any wrong answer locks the quiz
  const locked = answered || (hardcoreMode && selected !== null && !options[selected]?.correct);

  // Status message announced to screen-reader users when the answer is
  // resolved. Built deterministically from the current state so the
  // aria-live region announces the same thing the sighted user sees in the
  // colored option + reward chip + Tokey speech bubble (which is purely
  // decorative for AT users).
  const selectedOption = selected !== null ? options[selected] : null;
  let statusMessage = "";
  if (answered) {
    const xpText = reward
      ? ` Earned ${reward.gained} experience points${reward.multiplier > 1 ? `, ${reward.multiplier}x combo multiplier` : ""}${reward.speed ? ", with speed bonus" : ""}.`
      : "";
    statusMessage = `Correct.${xpText}${selectedOption?.explanation ? ` ${selectedOption.explanation}` : ""}`;
  } else if (locked && selectedOption) {
    // Hardcore mode — wrong, locked.
    statusMessage = `Incorrect. Hardcore mode locks the question.${selectedOption.explanation ? ` ${selectedOption.explanation}` : ""}`;
  } else if (selectedOption && !selectedOption.correct) {
    statusMessage = `Incorrect — try another answer.${selectedOption.explanation ? ` ${selectedOption.explanation}` : ""}`;
  }

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Register with parent Checkpoint (if any) so it knows to gate on this quiz.
  useEffect(() => {
    if (!checkpoint) return;
    checkpoint.register(quizId);
    return () => checkpoint.unregister(quizId);
  }, [checkpoint, quizId]);

  // Report "answered correctly" upward to the enclosing Checkpoint.
  // We gate strictly on correctness, NOT on `locked`. In hardcore mode a wrong
  // answer also flips `locked` (one shot, no retry), but it must not count
  // toward checkpoint clearance — otherwise hardcore mode silently becomes an
  // XP gift: click any option, the quiz locks, the checkpoint clears, +20 XP.
  // If a user truly wants to skip past a quiz, the Checkpoint exposes a
  // separate manual completion path.
  useEffect(() => {
    if (answered && checkpoint) {
      checkpoint.markCorrect(quizId);
    }
  }, [answered, checkpoint, quizId]);

  function handleClick(i: number) {
    if (locked) return;
    setSelected(i);
    if (options[i].correct) {
      const elapsed = (Date.now() - startedAt.current) / 1000;
      const isSpeed = elapsed <= 10;
      incrementCombo();
      const { gained, comboMultiplier } = addXp(xp, { speed: isSpeed });
      setReward({ gained, multiplier: comboMultiplier, speed: isSpeed });
      play(comboMultiplier > 1 ? "combo" : "correct");
      const newCombo = combo + 1;
      if (newCombo >= 5) {
        say({ mood: "celebrate", text: `${newCombo}x combo! You're on fire 🔥`, duration: 3500 });
      } else if (newCombo >= 3) {
        say({ mood: "excited", text: `${newCombo} in a row — combo unlocked!`, duration: 3000 });
      } else if (isSpeed) {
        say({ mood: "excited", text: "Speed bonus! +5 XP for being quick.", duration: 3000 });
      } else {
        const msg = ENCOURAGE_CORRECT[Math.floor(Math.random() * ENCOURAGE_CORRECT.length)];
        say({ mood: "happy", text: msg, duration: 2500 });
      }
    } else {
      setShake(i);
      setTimeout(() => setShake(null), 400);
      resetCombo();
      play("wrong");
      if (hardcoreMode) {
        say({ mood: "sad", text: "Hardcore mode — one shot. Moving on.", duration: 3500 });
      } else {
        const msg = ENCOURAGE_WRONG[Math.floor(Math.random() * ENCOURAGE_WRONG.length)];
        say({ mood: "teasing", text: msg, duration: 2500 });
      }
    }
  }

  return (
    <div className="my-8 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 sm:p-6" role="group" aria-label={`${kind}: ${question}`}>
      {/* Visually-hidden status for screen readers. polite (not assertive) so
          it doesn't interrupt the user mid-keystroke when they tab through
          options; the result is meant to be confirming, not urgent. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </div>
      <div className="flex items-center gap-2 mb-3 justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
          {kind}
        </span>
        {reward && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-slide-up">
            +{reward.gained} XP
            {reward.multiplier > 1 && <span className="text-orange-600 dark:text-orange-400">· {reward.multiplier}x</span>}
            {reward.speed && <span className="text-amber-600 dark:text-amber-400">· ⚡ speed</span>}
          </span>
        )}
      </div>
      <p className="text-base font-medium mb-4 leading-relaxed">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = opt.correct;
          const isWrongSelected = isSelected && !isCorrect;
          const isRevealedCorrect = isSelected && isCorrect;
          const showAsCorrect = answered && isCorrect;

          let className = "w-full text-left px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ";
          if (showAsCorrect) {
            className += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 animate-correct";
          } else if (isWrongSelected) {
            className += "border-rose-400 bg-rose-50 dark:bg-rose-950/40";
          } else if (locked) {
            className += "border-slate-200 dark:border-slate-800 opacity-60 cursor-default";
          } else {
            className += "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/50";
          }

          if (shake === i) className += " animate-wrong";

          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={className}
              disabled={locked}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  showAsCorrect ? "border-emerald-500 bg-emerald-500 text-white" :
                  isWrongSelected ? "border-rose-500 bg-rose-500 text-white" :
                  "border-slate-300 dark:border-slate-700"
                }`}>
                  {showAsCorrect ? "✓" : isWrongSelected ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 min-w-0 text-sm leading-relaxed break-words">{opt.label}</span>
              </div>
              {isRevealedCorrect && opt.explanation && (
                <div className="mt-3 ml-9 text-sm text-emerald-800 dark:text-emerald-200 border-l-2 border-emerald-400 pl-3">
                  <strong>Nice. </strong>{opt.explanation}
                </div>
              )}
              {isWrongSelected && opt.explanation && (
                <div className="mt-3 ml-9 text-sm text-rose-800 dark:text-rose-200 border-l-2 border-rose-400 pl-3">
                  <strong>{hardcoreMode ? "Wrong. " : "Not quite. "}</strong>{opt.explanation}
                  {!hardcoreMode && <em> Try another.</em>}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {hint && !locked && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 italic">💡 {hint}</p>
      )}
    </div>
  );
}
