"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getModuleNeighbors } from "@/lib/courses/helpers";
import type { CourseId } from "@/lib/courses";

/**
 * Prev/Next module footer for the bottom of every module page.
 * Reads neighbors from the per-course registry so it can't drift the way
 * hand-written "Next up: Module N" CTAs do.
 *
 * Keyboard shortcuts:
 *   - ArrowLeft / [  → prev module
 *   - ArrowRight / ] → next module
 * Disabled while focus is in an input/textarea/contenteditable so we don't
 * fight the in-page playgrounds (TokenizerDemo, CodeExercise, etc.).
 */
export default function ModuleNav({
  courseId,
  currentSlug,
}: {
  courseId: CourseId;
  currentSlug: string;
}) {
  const { prev, next } = getModuleNeighbors(courseId, currentSlug);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if user is typing
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if ((e.key === "ArrowLeft" || e.key === "[") && prev) {
        e.preventDefault();
        router.push(`/courses/${courseSlug(courseId)}/modules/${prev.slug}`);
      } else if ((e.key === "ArrowRight" || e.key === "]") && next) {
        e.preventDefault();
        router.push(`/courses/${courseSlug(courseId)}/modules/${next.slug}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, courseId, router]);

  if (!prev && !next) return null;

  const slug = courseSlug(courseId);

  return (
    <nav
      aria-label="Module navigation"
      className="not-prose mt-12 grid grid-cols-1 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-slate-800 print:hidden"
    >
      {prev ? (
        <Link
          href={`/courses/${slug}/modules/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Previous · Module {prev.number}
          </span>
          <span className="text-sm font-semibold tracking-tight">{prev.title}</span>
          <span className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{prev.subtitle}</span>
        </Link>
      ) : (
        <div /> /* placeholder to keep next on the right when no prev */
      )}
      {next ? (
        <Link
          href={`/courses/${slug}/modules/${next.slug}`}
          className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md sm:items-end sm:text-right dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <span className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Next · Module {next.number}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
          <span className="text-sm font-semibold tracking-tight">{next.title}</span>
          <span className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{next.subtitle}</span>
        </Link>
      ) : null}
    </nav>
  );
}

function courseSlug(id: CourseId): string {
  // CourseId currently matches slug for all three. Kept as a function so
  // any future slug ≠ id divergence has one place to fix.
  return id;
}
