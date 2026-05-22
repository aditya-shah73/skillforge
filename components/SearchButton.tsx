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
      className="group inline-flex w-full min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pr-2 pl-3 text-sm text-slate-500 transition hover:border-indigo-300 hover:text-slate-700 sm:max-w-md sm:justify-start dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-slate-200 print:hidden"
    >
      <span aria-hidden className="shrink-0 text-slate-400 transition group-hover:text-indigo-500">⌕</span>
      <span className="hidden min-w-0 flex-1 truncate text-left sm:inline">Search courses & modules…</span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-500 sm:inline-flex dark:border-slate-700 dark:bg-slate-900">
        {modKey}
        <span>K</span>
      </kbd>
    </button>
  );
}
