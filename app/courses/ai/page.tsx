import Link from "next/link";
import { MODULES, PHASES } from "@/lib/modules";
import CourseProgress from "@/components/CourseProgress";
import PhaseProgress from "@/components/PhaseProgress";

export default function Home() {
  const modulesByPhase = PHASES.map((phase) => ({
    ...phase,
    modules: MODULES.filter((m) => m.phaseNumber === phase.number),
  }));

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition">
        ← All courses
      </Link>
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Become an <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">AI full-stack</span> engineer
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          A hands-on course for working full-stack engineers. Build real intuition for how LLMs, embeddings, RAG, and agents actually work — then ship production-quality AI features on top of your existing stack.
        </p>
      </section>

      <CourseProgress courseId="ai" color="from-indigo-500 to-purple-500" />

      <section className="mb-14 grid sm:grid-cols-2 gap-x-10 gap-y-8 border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="border-l-2 border-indigo-500 dark:border-indigo-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">Prerequisites</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Working knowledge of <strong>Java / Spring Boot</strong></span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Comfortable with <strong>React</strong> and REST or GraphQL</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>No prior ML experience required — we build up from zero</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>An <strong>Anthropic API key</strong> (from Phase 2 onward, ~$5–10 budget)</span></li>
          </ul>
        </div>
        <div className="border-l-2 border-emerald-500 dark:border-emerald-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">What you&apos;ll get</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Intuition for how LLMs &amp; transformers actually work</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Linear regression + a tiny neural net, from scratch in Java</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Production RAG pipeline with Spring AI + pgvector</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Agents, evals, guardrails — and a portfolio capstone</span></li>
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
              <PhaseProgress courseId="ai" phaseNumber={phase.number} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/courses/ai/modules/${m.slug}`}
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
