import Link from "next/link";
import { MODULES, PHASES } from "@/lib/courses/dsa";
import CourseProgress from "@/components/CourseProgress";
import PhaseProgress from "@/components/PhaseProgress";

export default function DsaHome() {
  const modulesByPhase = PHASES.map((phase) => ({
    ...phase,
    modules: MODULES.filter((m) => m.phaseNumber === phase.number),
  }));

  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition">
        ← All courses
      </Link>
      <section className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Pattern-driven <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">DSA prep</span>, in Java
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Built for engineers returning to interview prep after years away. Start with Big-O from zero, build every data structure from scratch, then drill the named LeetCode patterns until you can recognize them on sight.
        </p>
      </section>

      <CourseProgress courseId="dsa" color="from-emerald-500 to-teal-500" />

      <section className="mb-14 grid sm:grid-cols-2 gap-x-10 gap-y-8 border-y border-slate-200 dark:border-slate-800 py-8">
        <div className="border-l-2 border-emerald-500 dark:border-emerald-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">Prerequisites</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Working knowledge of <strong>Java</strong> (loops, classes, generics — that&apos;s it)</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>You studied DSA <em>once</em>, years ago, and most of it has faded</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>A LeetCode account (free tier is plenty)</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Willingness to <strong>solve by hand on paper</strong>{" "}before touching the keyboard</span></li>
          </ul>
        </div>
        <div className="border-l-2 border-teal-500 dark:border-teal-400 pl-5">
          <h3 className="text-lg font-bold tracking-tight mb-3">What you&apos;ll get</h3>
          <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300 m-0 p-0 list-none">
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Big-O intuition you can <em>feel</em>, not just recite</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Every core data structure built from scratch in Java</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>~80 LeetCode-style problems traced by hand &amp; coded</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 dark:text-emerald-400 font-bold select-none">✓</span><span>Pattern-recognition that survives the interview pressure</span></li>
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
              <PhaseProgress courseId="dsa" phaseNumber={phase.number} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/courses/dsa/modules/${m.slug}`}
                      className="block rounded-xl border p-4 transition border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 hover:shadow-md cursor-pointer"
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
