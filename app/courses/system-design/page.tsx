import Link from "next/link";
import { MODULES, PHASES } from "@/lib/courses/system-design";
import CourseProgress from "@/components/CourseProgress";
import PhaseProgress from "@/components/PhaseProgress";

export default function SystemDesignHome() {
  const modulesByPhase = PHASES.map((phase) => ({
    ...phase,
    modules: MODULES.filter((m) => m.phaseNumber === phase.number),
  }));

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 mb-6 transition">
        ← All courses
      </Link>
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Distributed systems, <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">layered</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          A layered system design course for Java engineers. Start with the fundamentals — CAP, consistency, scaling math — build up through storage, communication, and reliability patterns, then design real systems end-to-end. Concept-first, with Java/Spring where it matters.
        </p>
      </section>

      <CourseProgress courseId="system-design" color="from-cyan-500 to-blue-500" />

      <section className="mb-14 grid sm:grid-cols-2 gap-x-10 gap-y-8 border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="border-l-2 border-cyan-500 dark:border-cyan-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">Prerequisites</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Comfortable shipping a <strong>Java/Spring service</strong>{" "}end-to-end</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>You&apos;ve touched a database, a queue, and an HTTP API <em>in production</em></span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Curiosity for the <strong>why</strong>{" "}behind architectural choices, not just the what</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Willingness to <strong>sketch designs on paper</strong>{" "}before reading the answer</span></li>
          </ul>
        </div>
        <div className="border-l-2 border-blue-500 dark:border-blue-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">What you&apos;ll get</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-cyan-500 dark:text-cyan-400 font-bold select-none">✓</span><span>Mental models for <em>every</em>{" "}distributed-systems tradeoff</span></li>
            <li className="flex gap-2"><span className="text-cyan-500 dark:text-cyan-400 font-bold select-none">✓</span><span>Production-grade Java/Spring labs (Kafka, Redis, Resilience4j, OpenTelemetry)</span></li>
            <li className="flex gap-2"><span className="text-cyan-500 dark:text-cyan-400 font-bold select-none">✓</span><span>End-to-end design walkthroughs of 7 classic systems</span></li>
            <li className="flex gap-2"><span className="text-cyan-500 dark:text-cyan-400 font-bold select-none">✓</span><span>Interview-ready frameworks <em>and</em>{" "}production-ready instincts</span></li>
          </ul>
        </div>
      </section>

      <section className="space-y-10">
        {modulesByPhase.map((phase) => (
          <div key={phase.number}>
            <div className="flex items-baseline gap-3 mb-4">
              <div className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${phase.color} bg-clip-text text-transparent`}>
                Phase {phase.number}
              </div>
              <h2 className="text-xl font-bold">{phase.name}</h2>
              <div className="text-xs text-slate-500">{phase.modules.length} {phase.modules.length === 1 ? "module" : "modules"}</div>
              <PhaseProgress courseId="system-design" phaseNumber={phase.number} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/courses/system-design/modules/${m.slug}`}
                      className="block rounded-xl border p-4 transition border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400 hover:shadow-md cursor-pointer"
                    >
                      <ModuleCardContent m={m} />
                    </Link>
                  );
                }
                return (
                  <div
                    key={m.slug}
                    className="block rounded-xl border p-4 transition border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 opacity-70"
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold">
            {m.number}
          </span>
          {m.status === "available" ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Ready</span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Soon</span>
          )}
        </div>
        <span className="text-xs text-slate-400">{m.duration}</span>
      </div>
      <h3 className="font-semibold text-base mb-1">{m.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{m.subtitle}</p>
      <div className="text-xs text-slate-500 flex items-center gap-1">
        <span>🛠</span>
        <span className="truncate">{m.project}</span>
      </div>
    </>
  );
}
