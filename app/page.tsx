import Link from "next/link";
import { MODULES, PHASES } from "@/lib/modules";

export default function Home() {
  const modulesByPhase = PHASES.map((phase) => ({
    ...phase,
    modules: MODULES.filter((m) => m.phaseNumber === phase.number),
  }));

  return (
    <div>
      <section className="mb-12">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
          30-day roadmap
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Become an <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">AI full-stack</span> engineer
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          A hands-on course tailored for a Java/React/GraphQL engineer. 23 modules across 6 phases, each with interactive explanations, live demos, quizzes, and a portfolio-worthy project.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/modules/tokenization"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
          >
            Start with Module 1 →
          </Link>
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
              <div className="text-xs text-slate-500">{phase.modules.length} modules</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/modules/${m.slug}`}
                      className="block rounded-xl border p-4 transition border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-md cursor-pointer"
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Ready</span>
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
