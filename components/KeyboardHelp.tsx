"use client";

import { useEffect, useState } from "react";

type Shortcut = {
  keys: string[];
  /** Optional alternates (e.g. ⌘K / Ctrl-K). Rendered as "X or Y". */
  alt?: string[];
  label: string;
};

type Section = {
  title: string;
  items: Shortcut[];
};

/**
 * Global keyboard-shortcut cheat sheet. Opens with `?` (or Shift+/) anywhere
 * outside an input. Listens for a `skillforge:open-keyboard-help` custom event
 * the same way `CommandPalette` does, so any UI affordance can trigger it.
 *
 * Mounted once in the root layout. Keep this list in sync as new shortcuts ship.
 */
export default function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform));
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

      // `?` requires Shift on most layouts — match either form.
      if (!isTyping && (e.key === "?" || (e.key === "/" && e.shiftKey))) {
        // Don't compete with CommandPalette's "/" handler (which fires without Shift).
        if (e.key === "/" && !e.shiftKey) return;
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("skillforge:open-keyboard-help", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("skillforge:open-keyboard-help", onOpenEvent);
    };
  }, [open]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const mod = isMac ? "⌘" : "Ctrl";

  const sections: Section[] = [
    {
      title: "Global",
      items: [
        { keys: [mod, "K"], alt: ["/"], label: "Open command palette / search" },
        { keys: ["?"], label: "Show this help" },
        { keys: ["Esc"], label: "Close any open dialog" },
      ],
    },
    {
      title: "Inside a module",
      items: [
        { keys: ["←"], alt: ["["], label: "Previous module" },
        { keys: ["→"], alt: ["]"], label: "Next module" },
      ],
    },
    {
      title: "Command palette",
      items: [
        { keys: ["↑"], alt: ["↓"], label: "Navigate results" },
        { keys: ["↵"], label: "Open the highlighted result" },
        { keys: ["Home"], alt: ["End"], label: "Jump to first / last result" },
      ],
    },
  ];

  if (!open) return null;

  return (
    <div
      className="print:hidden fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3">
          <h2 className="text-sm font-bold tracking-tight">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((sc) => (
                  <li key={sc.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{sc.label}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                      {sc.alt && (
                        <>
                          <span className="text-[11px] text-slate-400 mx-1">or</span>
                          {sc.alt.map((k) => (
                            <Kbd key={k}>{k}</Kbd>
                          ))}
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-2.5 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Press <Kbd>?</Kbd> any time to open this list.</span>
          <Kbd>Esc</Kbd>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.5rem] rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
      {children}
    </kbd>
  );
}
