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
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-600 dark:hover:text-emerald-400">
        ← All courses
      </Link>
      <section className="mb-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Pattern-driven <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">DSA prep</span>, in Java
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Built for engineers returning to interview prep after years away. Start with Big-O from zero, build every data structure from scratch, then drill the named LeetCode patterns until you can recognize them on sight.
        </p>
      </section>

      <CourseProgress courseId="dsa" color="from-emerald-500 to-teal-500" />

      <section className="mb-14 grid gap-x-10 gap-y-8 border-y border-slate-200 py-8 sm:grid-cols-2 dark:border-slate-800">
        <div className="border-l-2 border-emerald-500 pl-5 dark:border-emerald-400">
          <h2 className="mb-3 text-lg font-bold tracking-tight">Prerequisites</h2>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Working knowledge of <strong>Java</strong> (loops, classes, generics — that&apos;s it)</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>You studied DSA <em>once</em>, years ago, and most of it has faded</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>A LeetCode account (free tier is plenty)</span></li>
            <li className="flex gap-2"><span className="text-slate-400 select-none">›</span><span>Willingness to <strong>solve by hand on paper</strong>{" "}before touching the keyboard</span></li>
          </ul>
        </div>
        <div className="border-l-2 border-teal-500 pl-5 dark:border-teal-400">
          <h2 className="mb-3 text-lg font-bold tracking-tight">What you&apos;ll get</h2>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2"><span className="font-bold text-emerald-500 select-none dark:text-emerald-400">✓</span><span>Big-O intuition you can <em>feel</em>, not just recite</span></li>
            <li className="flex gap-2"><span className="font-bold text-emerald-500 select-none dark:text-emerald-400">✓</span><span>Every core data structure built from scratch in Java</span></li>
            <li className="flex gap-2"><span className="font-bold text-emerald-500 select-none dark:text-emerald-400">✓</span><span>~80 LeetCode-style problems traced by hand &amp; coded</span></li>
            <li className="flex gap-2"><span className="font-bold text-emerald-500 select-none dark:text-emerald-400">✓</span><span>Pattern-recognition that survives the interview pressure</span></li>
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
              <PhaseProgress courseId="dsa" phaseNumber={phase.number} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {phase.modules.map((m) => {
                if (m.status === "available") {
                  return (
                    <Link
                      key={m.slug}
                      href={`/courses/dsa/modules/${m.slug}`}
                      className="block cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
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
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-bold dark:bg-slate-800">
            {m.number}
          </span>
          {m.status === "available" ? (
            <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">Ready</span>
          ) : (
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Soon</span>
          )}
        </div>
        <span className="text-xs text-slate-400">{m.duration}</span>
      </div>
      <h3 className="mb-1 text-base font-semibold">{m.title}</h3>
      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">{m.subtitle}</p>
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <span>🛠</span>
        <span className="truncate">{m.project}</span>
      </div>
    </>
  );
}
