"use client";

import { useEffect, useState } from "react";

/**
 * Header search affordance. Clicking dispatches a custom event that
 * `CommandPalette` listens for — that way this component doesn't need to
 * know palette internals and the two stay decoupled.
 *
 * Renders as a compact "Search…  ⌘K" pill on sm+, shrinks to just the icon
 * on mobile so the header doesn't get crowded.
 *
 * The keyboard hint detects platform (⌘ on mac, Ctrl elsewhere) after mount
 * so SSR markup stays stable.
 */
export default function SearchButton() {
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // navigator.platform is deprecated but still the simplest reliable check.
    if (typeof navigator !== "undefined") {
      setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform));
    }
  }, []);

  const open = () => {
    window.dispatchEvent(new CustomEvent("skillforge:open-command-palette"));
  };

  const modKey = mounted ? (isMac ? "⌘" : "Ctrl") : "⌘";

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open search (command palette)"
      title="Search courses & modules"
      className="print:hidden group inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-3 pr-2 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-slate-700 dark:hover:text-slate-200 transition sm:min-w-[240px] sm:justify-start"
    >
      <span aria-hidden className="text-slate-400 group-hover:text-indigo-500 transition">⌕</span>
      <span className="hidden sm:inline flex-1 text-left">Search courses & modules…</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
        {modKey}
        <span>K</span>
      </kbd>
    </button>
  );
}
