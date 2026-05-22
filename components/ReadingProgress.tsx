"use client";

import { useEffect, useState } from "react";

/**
 * Thin top-of-viewport scroll-progress bar. Renders fixed at the very top
 * (above the sticky header is unnecessary — we sit ON the header's top edge
 * so it never overlaps content).
 *
 * Hidden via `print:hidden` so it doesn't appear in printed/PDF artifacts.
 * Hidden when there's nothing to scroll (short pages like /).
 *
 * Lives in the root layout so every page gets it for free.
 */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);
  const [enoughToScroll, setEnoughToScroll] = useState(false);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable <= 100) {
        setEnoughToScroll(false);
        setPct(0);
        return;
      }
      setEnoughToScroll(true);
      const next = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      setPct(next);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };

    // Re-evaluate "enough to scroll" when content changes (e.g. nav between
    // a short course landing and a long module page).
    const ro = new ResizeObserver(compute);
    ro.observe(document.documentElement);

    window.addEventListener("scroll", onScroll, { passive: true });
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enoughToScroll) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent print:hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-75 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
