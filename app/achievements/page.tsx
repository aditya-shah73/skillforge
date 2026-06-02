import type { Metadata } from "next";
import Link from "next/link";
import Badges from "@/components/Badges";
import ProgressBackup from "@/components/ProgressBackup";

export const metadata: Metadata = {
  title: "Achievements — Skillforge",
  description:
    "Your badges, study stats, and progress backup. Track streaks, combos, modules completed, and time studied across every Skillforge course.",
};

/**
 * Achievements / badges page. A read-only view over the learner's existing
 * progress (no new persisted state) plus backup/restore controls. The two
 * client components (Badges, ProgressBackup) own all the localStorage reads;
 * this server component just lays out the page chrome.
 */
export default function AchievementsPage() {
  return (
    <div>
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200">
          Home
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-slate-700 dark:text-slate-300">Achievements</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Achievements</h1>
        <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-400">
          Badges and stats earned across every course. Everything here is
          computed from your local progress — clear a checkpoint, keep a streak
          alive, or finish a phase and the tiles below light up.
        </p>
      </header>

      <Badges />

      <section className="mt-12">
        <ProgressBackup />
      </section>
    </div>
  );
}
