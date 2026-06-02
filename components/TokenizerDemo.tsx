"use client";

import { useEffect, useMemo, useState } from "react";
import { encode, decode } from "gpt-tokenizer";
import { useProgress } from "@/lib/progress";
import { useTokey } from "@/components/Tokey";

const PRESETS = [
  { label: "Simple English", text: "The quick brown fox jumps over the lazy dog" },
  { label: "Rare word", text: "antidisestablishmentarianism" },
  { label: "Chinese", text: "你好，你好吗？今天天气很好。" },
  { label: "Code", text: "function getUserById(id: string) { return db.users.find(id); }" },
  { label: "Emoji", text: "I love 🍕 and 🚀 but not 🥦" },
  { label: "Spaces matter", text: "hello hello  hello" },
];

// Easter egg triggers — typing these in the tokenizer reveals secrets
const SECRETS: Record<string, { id: string; message: string }> = {
  tokey: {
    id: "secret-tokey",
    message: "You found me! Tokey is short for 'Token-y'. Also: +25 XP. Shhh.",
  },
  "42": {
    id: "secret-42",
    message: "The answer to life, the universe, and... 1 token. +25 XP unlocked.",
  },
  "hello world": {
    id: "secret-hello",
    message: "Classic! First program, first easter egg. +25 XP.",
  },
};

export default function TokenizerDemo() {
  const [text, setText] = useState(PRESETS[0].text);
  const { unlockEasterEgg } = useProgress();
  const { say } = useTokey();

  const tokens = useMemo(() => {
    try {
      const ids = encode(text);
      return ids.map((id) => ({
        id,
        text: decode([id]),
      }));
    } catch {
      return [];
    }
  }, [text]);

  // Easter egg detection
  useEffect(() => {
    const normalized = text.trim().toLowerCase();
    const secret = SECRETS[normalized];
    if (secret) {
      const unlocked = unlockEasterEgg(secret.id);
      if (unlocked) {
        say({ mood: "excited", text: `🥚 Easter egg! ${secret.message}`, duration: 5000 });
      }
    }
  }, [text, unlockEasterEgg, say]);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tokenCount = tokens.length;
  const costPer1M = 3;
  const costDollars = (tokenCount / 1_000_000) * costPer1M;

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-lg">🔬</span> Live Tokenizer
          </h4>
          <span className="text-xs text-slate-500">using GPT tokenizer (BPE), similar behavior to Claude&apos;s</span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Try a preset:</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setText(p.text)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs transition hover:scale-105 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-indigo-950"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Or type your own:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            rows={3}
            placeholder="Type anything... (psst, try secret words 😉)"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase">Tokens:</label>
          <div className="flex min-h-[60px] flex-wrap gap-1 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
            {tokens.map((tok, i) => (
              <span
                key={`${tok.id}-${i}`}
                className={`token-chip-${i % 8} animate-token-pop rounded px-2 py-1 font-mono text-sm leading-none`}
                style={{ animationDelay: `${Math.min(i * 15, 400)}ms` }}
                title={`Token ID: ${tok.id}`}
              >
                {tok.text.replace(/ /g, "·").replace(/\n/g, "↵") || "∅"}
              </span>
            ))}
            {tokens.length === 0 && <span className="text-sm text-slate-400 italic">Type something to see tokens</span>}
          </div>
          <p className="mt-2 text-xs text-slate-500">💡 <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">·</code> = space &middot; each color is one token</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          <Stat label="Characters" value={charCount} />
          <Stat label="Words" value={wordCount} />
          <Stat label="Tokens" value={tokenCount} highlight />
          <Stat label="Est. cost" value={`$${costDollars.toFixed(6)}`} subtle />
        </div>
        <p className="text-[11px] text-slate-400 italic">Cost based on Claude Sonnet 4.6 input pricing ($3/1M tokens). Your text alone.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight, subtle }: { label: string; value: number | string; highlight?: boolean; subtle?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 transition-transform hover:-translate-y-0.5 ${highlight ? "border border-indigo-200 bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60" : "border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"}`}>
      <div className={`text-xs ${subtle ? "text-slate-400" : "text-slate-500"}`}>{label}</div>
      <div className={`font-mono font-semibold ${highlight ? "text-lg text-indigo-700 dark:text-indigo-300" : "text-base"}`}>{value}</div>
    </div>
  );
}
