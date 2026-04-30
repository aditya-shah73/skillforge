import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";

export default function Page() {
  const mod = getModuleBySlug("scaling-ladder")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <div className="my-12 rounded-xl border-2 border-dashed border-cyan-300 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/30 p-8 text-center">
        <p className="text-lg font-semibold text-cyan-900 dark:text-cyan-200">📐 Coming soon</p>
        <p className="text-sm text-cyan-800 dark:text-cyan-300 mt-2">
          This module is part of the System Design course skeleton. Full content lands in the next build wave.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 italic">
          Project: {mod.project}
        </p>
      </div>
    </article>
  );
}
