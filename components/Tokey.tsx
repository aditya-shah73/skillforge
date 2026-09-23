"use client";

import { createContext, useContext, useCallback, useEffect, useMemo, useState, useRef } from "react";

type Mood = "idle" | "happy" | "sad" | "excited" | "thinking" | "teasing" | "celebrate";

type TokeyMessage = {
  mood: Mood;
  text: string;
  duration?: number;
};

type TokeyContextType = {
  say: (msg: TokeyMessage) => void;
};

const TokeyContext = createContext<TokeyContextType | null>(null);

const MOOD_EMOJI: Record<Mood, string> = {
  idle: "🤖",
  happy: "😄",
  sad: "😅",
  excited: "🤩",
  thinking: "🤔",
  teasing: "😏",
  celebrate: "🎉",
};

const MOOD_ANIMATION: Record<Mood, string> = {
  idle: "",
  happy: "animate-bounce-soft",
  sad: "",
  excited: "animate-bounce-soft",
  thinking: "animate-pulse",
  teasing: "",
  celebrate: "animate-bounce",
};

export function TokeyProvider({ children }: { children: React.ReactNode }) {
  // `message` is the single source of truth for "Tokey is saying something".
  // There used to be a separate `visible` flag alongside it, and all three
  // hide paths cleared only that flag — so `message` stayed set forever and
  // the mood animation below (an `infinite` keyframe) kept running long after
  // the bubble was gone. One piece of state, one lifecycle, nothing to drift.
  const [message, setMessage] = useState<TokeyMessage | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Seeded on mount rather than in the ref initializer: `Date.now()` during
  // render runs on the server too, and the two clocks don't agree.
  const lastInteraction = useRef<number>(0);

  // Every hide goes through here, so "stop talking" always means the same
  // thing — dropping the message, which also stops the mood animation.
  const scheduleHide = useCallback((ms: number) => {
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => setMessage(null), ms);
  }, []);

  useEffect(() => {
    setMounted(true);
    lastInteraction.current = Date.now();
    // Welcome message after 1.5s, then auto-hide 6s after that. Both timers
    // are cleared on unmount (e.g. during HMR) so neither fires on a dead
    // component and leaks a closure over stale state.
    const t = setTimeout(() => {
      setMessage({ mood: "happy", text: "Hey! I'm Tokey. I'll hang out here while you learn. Tap me anytime to hide." });
      scheduleHide(6000);
    }, 1500);
    return () => {
      clearTimeout(t);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, [scheduleHide]);

  // Procrastination detection — if you sit on a page without engaging.
  // Gated on document visibility: a backgrounded tab shouldn't keep a 5s
  // interval alive, and shouldn't bank idle time it didn't really earn.
  useEffect(() => {
    if (!mounted) return;
    // Passive: this only records a timestamp, so the browser is free to
    // scroll without waiting to see whether we call preventDefault.
    const bump = () => {
      lastInteraction.current = Date.now();
    };
    window.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("click", bump);

    let interval: ReturnType<typeof setInterval> | null = null;
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        const idle = Date.now() - lastInteraction.current;
        if (idle > 60000 && idle < 65000) {
          // ~1 min idle
          setMessage({
            mood: "teasing",
            text: "Still there? Don't just scroll, try the quiz. I promise it won't bite.",
          });
          scheduleHide(5000);
        }
      }, 5000);
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      // Coming back to the tab counts as engagement. Without this the idle
      // clock would have run past the 60–65s window while we weren't looking
      // and the nag could never fire again for the life of the page.
      bump();
      start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) start();

    return () => {
      window.removeEventListener("scroll", bump);
      window.removeEventListener("click", bump);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [mounted, scheduleHide]);

  const say = useCallback(
    (msg: TokeyMessage) => {
      setMessage(msg);
      scheduleHide(msg.duration || 4000);
      lastInteraction.current = Date.now();
    },
    [scheduleHide],
  );

  // Memoized so the context value keeps its identity across provider renders.
  // A fresh object literal here re-rendered every useTokey() consumer on
  // every Tokey state change, including each auto-hide.
  const ctxValue = useMemo(() => ({ say }), [say]);

  if (!mounted) return <TokeyContext.Provider value={ctxValue}>{children}</TokeyContext.Provider>;

  // Minimizing is an explicit "be quiet" from the user, so it silences the
  // mood animation and the face as well as the bubble.
  const mood = !minimized && message ? message.mood : null;

  return (
    <TokeyContext.Provider value={ctxValue}>
      {children}
      {/* Live region stays mounted at every viewport size so screen readers
          keep the subscription even when the mascot's visual chrome is hidden
          on mobile. `polite` so encouragement doesn't interrupt the user. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message ? `Tokey says: ${message.text}` : ""}
      </div>
      {/* The bubble is positioned against the viewport in its own right
          rather than sitting in a flex row with the button. As a flex
          sibling it resized the row every time it appeared and disappeared,
          and the browser charged that to the button as layout shift — a
          measured 0.03 CLS per idle nag, with the user touching nothing.
          `right-20` = the button's `right-4` + its `w-14` + the old `gap-2`. */}
      {message && !minimized && (
        <div
          className="animate-slide-up fixed right-20 bottom-4 z-50 hidden max-w-xs rounded-2xl rounded-br-sm border-2 border-indigo-300 bg-white px-4 py-3 text-sm shadow-xl sm:block dark:border-indigo-700 dark:bg-slate-800 print:hidden"
          // aria-hidden because the live region above already announces this
          // — otherwise screen readers would read it twice.
          aria-hidden="true"
        >
          {message.text}
        </div>
      )}
      {/* Hidden below `sm` (640px). The 56×56 button + speech bubble would
          otherwise cover quiz CTAs and checkpoint actions on phones — sighted
          mobile users lose the mascot, screen reader users still hear it. */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 hidden sm:block print:hidden">
        <button
          onClick={() => setMinimized((m) => !m)}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-3xl shadow-lg transition-transform hover:scale-110 ${mood ? MOOD_ANIMATION[mood] : ""}`}
          title={minimized ? "Show Tokey" : "Hide Tokey"}
          aria-label={minimized ? "Show Tokey mascot" : "Hide Tokey mascot"}
          aria-pressed={minimized}
        >
          <span aria-hidden="true">{mood ? MOOD_EMOJI[mood] : "🤖"}</span>
        </button>
      </div>
    </TokeyContext.Provider>
  );
}

export function useTokey() {
  const ctx = useContext(TokeyContext);
  return ctx || { say: () => {} };
}
