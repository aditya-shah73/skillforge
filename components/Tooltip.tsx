"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/**
 * Themed tooltip wrapped around any trigger element. Replaces the browser's
 * default `title=` popup with a styled bubble that matches the app's dark/
 * light palette and the rounded-pill aesthetic used by header chips.
 *
 * Behavior:
 *  - Shows on hover (after ~120ms) and on keyboard focus (immediately).
 *  - Hides on mouse leave, blur, and Escape.
 *  - Positioned below the trigger by default, with a small caret.
 *  - Pure CSS positioning — no portals, no popper, no layout thrash.
 *
 * The trigger element is rendered as-is inside a `<span>` wrapper so we
 * can attach handlers without forcing the caller to forward refs. The
 * wrapper is `inline-flex` so it doesn't add extra vertical space.
 */
export default function Tooltip({
  label,
  children,
  side = "bottom",
  align = "center",
  maxWidth = 260,
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  maxWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const show = (delay = 120) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  const sideClasses =
    side === "bottom"
      ? "top-full mt-2"
      : "bottom-full mb-2";

  const alignClasses =
    align === "start"
      ? "left-0"
      : align === "end"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  // Caret: small rotated square pinned to the edge nearest the trigger.
  const caretSide = side === "bottom" ? "-top-1" : "-bottom-1";
  const caretAlign =
    align === "start"
      ? "left-4"
      : align === "end"
      ? "right-4"
      : "left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => show()}
      onMouseLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute z-50 ${sideClasses} ${alignClasses}`}
          style={{ maxWidth }}
        >
          {/* Inner wrapper carries the enter animation so it doesn't fight
              the outer element's -translate-x-1/2 centering transform. */}
          <span
            className="relative block rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs leading-snug text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:shadow-black/40"
            style={{ animation: "skillforge-tooltip-in 140ms ease-out both" }}
          >
            {label}
            <span
              aria-hidden
              className={`absolute ${caretSide} ${caretAlign} h-2 w-2 rotate-45 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${
                side === "bottom"
                  ? "border-t border-l"
                  : "border-r border-b"
              }`}
            />
          </span>
        </span>
      )}
    </span>
  );
}
