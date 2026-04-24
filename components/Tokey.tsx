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
    // Welcome message after 1.5s
    const t = setTimeout(() => {
      setMessage({ mood: "happy", text: "Hey! I'm Tokey. I'll hang out here while you learn. Tap me anytime to hide." });
      setVisible(true);
      setTimeout(() => setVisible(false), 6000);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // Procrastination detection — if you scroll without engaging for a while
  useEffect(() => {
    if (!mounted) return;
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
          text: "Still there? Don't just scroll — try the quiz. I promise it won't bite.",
        });
        setVisible(true);
        setTimeout(() => setVisible(false), 5000);
      }
    }, 5000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      clearInterval(interval);
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
      <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2 pointer-events-none">
        {visible && message && !minimized && (
          <div className="pointer-events-auto max-w-xs rounded-2xl rounded-br-sm bg-white dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-700 shadow-xl px-4 py-3 text-sm animate-slide-up">
            {message.text}
          </div>
        )}
        <button
          onClick={() => setMinimized((m) => !m)}
          className={`pointer-events-auto w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg flex items-center justify-center text-3xl hover:scale-110 transition-transform ${message ? MOOD_ANIMATION[message.mood] : ""}`}
          title={minimized ? "Show Tokey" : "Hide Tokey"}
        >
          {minimized ? "🤖" : message ? MOOD_EMOJI[message.mood] : "🤖"}
        </button>
      </div>
    </TokeyContext.Provider>
  );
}

export function useTokey() {
  const ctx = useContext(TokeyContext);
  return ctx || { say: () => {} };
}
