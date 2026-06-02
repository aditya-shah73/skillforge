"use client";

import { createContext, useContext, useCallback, useEffect, useState, useRef } from "react";

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
  const [message, setMessage] = useState<TokeyMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteraction = useRef<number>(Date.now());

  useEffect(() => {
    setMounted(true);
    // Welcome message after 1.5s, then auto-hide 6s after that. Track both
    // timers in refs so unmount (e.g. during HMR) clears the inner timer too
    // — without this, the inner setTimeout could call setVisible(false) on a
    // dead component and leak a closure over stale state.
    let innerTimer: ReturnType<typeof setTimeout> | null = null;
    const t = setTimeout(() => {
      setMessage({ mood: "happy", text: "Hey! I'm Tokey. I'll hang out here while you learn. Tap me anytime to hide." });
      setVisible(true);
      innerTimer = setTimeout(() => setVisible(false), 6000);
    }, 1500);
    return () => {
      clearTimeout(t);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, []);

  // Procrastination detection — if you scroll without engaging for a while.
  // The auto-hide timer inside the interval is tracked so unmount clears it
  // (otherwise it could fire after the provider is gone).
  useEffect(() => {
    if (!mounted) return;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      lastInteraction.current = Date.now();
    };
    const onClick = () => {
      lastInteraction.current = Date.now();
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("click", onClick);

    const interval = setInterval(() => {
      const idle = Date.now() - lastInteraction.current;
      if (idle > 60000 && idle < 65000) {
        // ~1 min idle
        setMessage({
          mood: "teasing",
          text: "Still there? Don't just scroll, try the quiz. I promise it won't bite.",
        });
        setVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setVisible(false), 5000);
      }
    }, 5000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [mounted]);

  const say = useCallback((msg: TokeyMessage) => {
    setMessage(msg);
    setVisible(true);
    if (scrollIdleRef.current) clearTimeout(scrollIdleRef.current);
    scrollIdleRef.current = setTimeout(() => {
      setVisible(false);
    }, msg.duration || 4000);
    lastInteraction.current = Date.now();
  }, []);

  if (!mounted) return <TokeyContext.Provider value={{ say }}>{children}</TokeyContext.Provider>;

  return (
    <TokeyContext.Provider value={{ say }}>
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
        {visible && message ? `Tokey says: ${message.text}` : ""}
      </div>
      {/* Hidden below `sm` (640px). The 56×56 button + speech bubble would
          otherwise cover quiz CTAs and checkpoint actions on phones — sighted
          mobile users lose the mascot, screen reader users still hear it. */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 hidden items-end gap-2 sm:flex print:hidden">
        {visible && message && !minimized && (
          <div
            className="animate-slide-up pointer-events-auto max-w-xs rounded-2xl rounded-br-sm border-2 border-indigo-300 bg-white px-4 py-3 text-sm shadow-xl dark:border-indigo-700 dark:bg-slate-800"
            // aria-hidden because the live region above already announces this
            // — otherwise screen readers would read it twice.
            aria-hidden="true"
          >
            {message.text}
          </div>
        )}
        <button
          onClick={() => setMinimized((m) => !m)}
          className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-3xl shadow-lg transition-transform hover:scale-110 ${message ? MOOD_ANIMATION[message.mood] : ""}`}
          title={minimized ? "Show Tokey" : "Hide Tokey"}
          aria-label={minimized ? "Show Tokey mascot" : "Hide Tokey mascot"}
          aria-pressed={minimized}
        >
          <span aria-hidden="true">
            {minimized ? "🤖" : message ? MOOD_EMOJI[message.mood] : "🤖"}
          </span>
        </button>
      </div>
    </TokeyContext.Provider>
  );
}

export function useTokey() {
  const ctx = useContext(TokeyContext);
  return ctx || { say: () => {} };
}
