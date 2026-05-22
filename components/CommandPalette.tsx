"use client";

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { COURSES } from "@/lib/courses";
import { getCourseData } from "@/lib/courses/helpers";
import { useProgress } from "@/lib/progress";
import { lockBodyScroll } from "@/lib/scroll-lock";

type Item = {
  /** Stable id for keying / focus tracking */
  id: string;
  /** Display text */
  title: string;
  /** Greyed secondary text shown on the right */
  subtitle: string;
  /** Smaller tag chip on the left */
  badge: string;
  /** Tailwind gradient classes used to tint the badge */
  badgeColor: string;
  /** Pre-computed lowercase haystack for matching */
  haystack: string;
  /** Where pressing Enter takes the user */
  href: string;
  /** "module" | "course" | "action" — used for the section header */
  kind: "module" | "course" | "action";
  /** ★ if bookmarked, undefined otherwise */
  bookmark?: boolean;
};

/**
 * Global Cmd+K (Ctrl+K) command palette.
 * - Indexes every course + every available module across all three tracks.
 * - Fuzzy-ish substring match against title + subtitle + course name.
 * - Keyboard: ↑/↓ navigate, Enter to open, Esc to close.
 *
 * Mounted once in the root layout; opens via global keydown handler.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { bookmarks } = useProgress();
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  // Build the index once. COURSES/registries are static, so we don't need to
  // recompute on every render — the result is memoized by an empty dep list.
  // (If bookmarks change we recompute to refresh the ★ flag.)
  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];

    // Course-level entries first
    for (const c of COURSES) {
      if (c.status !== "available") continue;
      out.push({
        id: `course/${c.id}`,
        title: c.name,
        subtitle: c.tagline,
        badge: "Course",
        badgeColor: c.color,
        haystack: `${c.name} ${c.tagline} ${c.shortName}`.toLowerCase(),
        href: `/courses/${c.slug}`,
        kind: "course",
      });
    }

    // Every available module across every course
    for (const c of COURSES) {
      if (c.status !== "available") continue;
      const data = getCourseData(c.id);
      for (const m of data.MODULES) {
        if (m.status !== "available") continue;
        const key = `${c.id}/${m.slug}`;
        out.push({
          id: `module/${key}`,
          title: m.title,
          subtitle: m.subtitle,
          badge: `${c.shortName} · M${m.number}`,
          badgeColor: c.color,
          haystack: `${m.title} ${m.subtitle} ${c.name} ${c.shortName} ${m.phase}`.toLowerCase(),
          href: `/courses/${c.slug}/modules/${m.slug}`,
          kind: "module",
          bookmark: bookmarks.includes(key),
        });
      }
    }

    // A couple of utility actions
    out.push({
      id: "action/home",
      title: "Go to home",
      subtitle: "All courses",
      badge: "Action",
      badgeColor: "from-slate-500 to-slate-400",
      haystack: "home go to home all courses",
      href: "/",
      kind: "action",
    });

    return out;
  }, [bookmarks]);

  // Filter results. Match every space-delimited token as a substring across
  // the pre-joined haystack — simple, predictable, no extra deps.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // No query: show bookmarks first, then courses, then a slice of modules
      const bookmarked = items.filter((i) => i.bookmark);
      const courses = items.filter((i) => i.kind === "course");
      const modules = items.filter((i) => i.kind === "module" && !i.bookmark);
      return [...bookmarked, ...courses, ...modules].slice(0, 30);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return items
      .filter((i) => tokens.every((t) => i.haystack.includes(t)))
      .slice(0, 30);
  }, [items, query]);

  // Keep activeIndex in range as results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Global open hotkey: Cmd+K (mac) / Ctrl+K (else), and "/" when not typing.
  // Also listens for a "skillforge:open-command-palette" custom event so the
  // header search button (and anything else) can open it without importing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !isTyping && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("skillforge:open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("skillforge:open-command-palette", onOpenEvent);
    };
  }, [open]);

  // Focus input + lock background scroll while open. Scroll-lock is
  // counter-based (see lib/scroll-lock) so overlapping overlays like the
  // keyboard-help dialog don't leak each other's "original overflow"
  // snapshots and end up trapping the page in a locked state.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    const releaseScroll = lockBodyScroll();
    return () => {
      clearTimeout(t);
      releaseScroll();
    };
  }, [open]);

  // Scroll active row into view as user arrows down
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-cp-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const choose = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      close();
      router.push(item.href);
    },
    [close, router],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[activeIndex]);
    } else if (e.key === "Home") {
      setActiveIndex(0);
    } else if (e.key === "End") {
      setActiveIndex(results.length - 1);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <span aria-hidden className="text-base text-slate-400">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search courses, modules, or jump to a section…"
            className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-400 focus-visible:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 ? optionId(activeIndex) : undefined
            }
            aria-label="Search courses, modules, or jump to a section"
          />
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-block dark:border-slate-700 dark:bg-slate-800">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="max-h-[60vh] overflow-y-auto py-1"
        >
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500" role="status">
              No results for <span className="font-mono">&quot;{query}&quot;</span>
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                data-cp-idx={i}
                // The input keeps focus; options are referenced via
                // aria-activedescendant, so we don't make them tab stops.
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(item)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                  i === activeIndex
                    ? "bg-indigo-50 dark:bg-indigo-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${item.badgeColor} min-w-[52px] px-1.5 py-0.5 text-center text-[10px] font-bold tracking-wider text-white uppercase sm:min-w-[64px]`}
                >
                  {item.badge}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">{item.title}</span>
                    {item.bookmark && (
                      <span aria-label="Bookmarked" title="Bookmarked" className="shrink-0 text-amber-500">★</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </span>
                </span>
                <span aria-hidden className="text-xs text-slate-300 dark:text-slate-600">↵</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800">
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800">↑↓</kbd>
            navigate
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800">↵</kbd>
            open
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono dark:border-slate-700 dark:bg-slate-800">?</kbd>
              shortcuts
            </span>
          </span>
          <span className="flex items-center gap-2">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
