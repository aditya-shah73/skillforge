import Link from "next/link";
import { MODULES, PHASES } from "@/lib/courses/system-design";
import CourseProgress from "@/components/CourseProgress";
import PhaseProgress from "@/components/PhaseProgress";
import ModuleBadges from "@/components/ModuleBadges";

export default function SystemDesignHome() {
  const modulesByPhase = PHASES.map((phase) => ({
    ...phase,
    modules: MODULES.filter((m) => m.phaseNumber === phase.number),
  }));

  return (
    <div>
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-cyan-600 dark:hover:text-cyan-400">
        ← All courses
      </Link>
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Distributed systems, <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">layered</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          A layered system design course for Java engineers. Start with the fundamentals, CAP, consistency, scaling math, build up through storage, communication, and reliability patterns, then design real systems end-to-end. Concept-first, with Java/Spring where it matters.
        </p>
      </section>

      <CourseProgress courseId="system-design" color="from-cyan-500 to-blue-500" />

      <section className="mb-14 grid gap-x-10 gap-y-8 border-y border-slate-200 py-8 sm:grid-cols-2 dark:border-slate-800">
        <div className="border-l-2 border-cyan-500 pl-5 dark:border-cyan-400">
          <h2 className="mb-3 text-lg font-bold tracking-tight">Prerequisites</h2>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Comfortable shipping a <strong>Java/Spring service</strong>{" "}end-to-end</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>You&apos;ve touched a database, a queue, and an HTTP API <em>in production</em></span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Curiosity for the <strong>why</strong>{" "}behind architectural choices, not just the what</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Willingness to <strong>sketch designs on paper</strong>{" "}before reading the answer</span></li>
          </ul>
        </div>
        <div className="border-l-2 border-blue-500 pl-5 dark:border-blue-400">
          <h2 className="mb-3 text-lg font-bold tracking-tight">What you&apos;ll get</h2>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2"><span className="font-bold text-cyan-500 select-none dark:text-cyan-400">✓</span><span>Mental models for <em>every</em>{" "}distributed-systems tradeoff</span></li>
            <li className="flex gap-2"><span className="font-bold text-cyan-500 select-none dark:text-cyan-400">✓</span><span>Production-grade Java/Spring labs (Kafka, Redis, Resilience4j, OpenTelemetry)</span></li>
            <li className="flex gap-2"><span className="font-bold text-cyan-500 select-none dark:text-cyan-400">✓</span><span>End-to-end design walkthroughs of 7 classic systems</span></li>
            <li className="flex gap-2"><span className="font-bold text-cyan-500 select-none dark:text-cyan-400">✓</span><span>Interview-ready frameworks <em>and</em>{" "}production-ready instincts</span></li>
          </ul>
        </div>
      </section>

      <section className="space-y-10">
        {modulesByPhase.map((phase) => (
          <div key={phase.number}>
            <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <div className={`bg-gradient-to-r text-xs font-bold tracking-wider uppercase ${phase.color} bg-clip-text text-transparent`}>
                Phase {phase.number}
              </div>
              <h2 className="text-xl font-bold">{phase.name}</h2>
              <div className="text-xs text-slate-500">{phase.modules.length} {phase.modules.length === 1 ? "module" : "modules"}</div>
              <PhaseProgress courseId="system-design" phaseNumber={phase.number} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/courses/system-design/modules/${m.slug}`}
                      className="block cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                    >
                      <ModuleCardContent m={m} />
                    </Link>
                  );
                }
                return (
                  <div
                    key={m.slug}
                    className="block rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70 transition dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <ModuleCardContent m={m} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ModuleCardContent({ m }: { m: typeof MODULES[number] }) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold dark:bg-slate-800">
          {m.number}
        </span>
        {m.status === "available" ? (
          <span className="text-[10px] font-semibold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">Ready</span>
        ) : (
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Soon</span>
        )}
      </div>
      <h3 className="mb-1 text-base font-semibold">{m.title}</h3>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{m.subtitle}</p>
      <ModuleBadges difficulty={m.difficulty} estimatedMinutes={m.estimatedMinutes} />
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <span>🛠</span>
        <span className="truncate">{m.project}</span>
      </div>
    </>
  );
}
