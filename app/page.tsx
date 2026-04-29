import Link from "next/link";
import { COURSES, ai, dsa } from "@/lib/courses";

export default function Home() {
  // Live count of available modules across every course — used by the
  // gamification preview's denominator so it stays correct as content ships.
  const courseData = COURSES.map((c) => (c.id === "ai" ? ai : dsa));
  const availableModuleCount = courseData.reduce(
    (sum, c) => sum + c.MODULES.filter((m) => m.status === "available").length,
    0,
  );

  return (
    <div className="relative">
      {/* Decorative gradient blobs (lighter — just two, behind the hero) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-20 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute right-1/4 top-10 h-64 w-64 translate-x-1/2 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-500/15" />
      </div>

      {/* Hero — tightened: smaller H1, inline value strip, no separate stats row */}
      <section className="mb-12 pt-2 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.05]">
          Forge real skills,{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            one project at a time.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto sm:mx-0 leading-relaxed mb-5">
          Hands-on courses for working engineers. Real Java/Spring projects, checkpoints that actually gate progress. <span className="text-slate-900 dark:text-slate-100 font-medium">No passive video binges.</span>
        </p>

        {/* Inline value strip — replaces the old stats row */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 font-medium">
            <span aria-hidden>🛠</span> Project-driven
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 font-medium">
            <span aria-hidden>🧪</span> Gating checkpoints
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-3 py-1 font-medium">
            <span aria-hidden>⚡</span> Local-first, no login
          </span>
        </div>
      </section>

      {/* Course picker */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Pick your track
          </h2>
          <span className="text-xs text-slate-400">{COURSES.length} courses</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {COURSES.map((course) => {
            const isAvailable = course.status === "available";
            const data = course.id === "ai" ? ai : dsa;
            const moduleCount = data.MODULES.length;
            const phaseCount = data.PHASES.length;

            const card = (
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                  isAvailable
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xl cursor-pointer"
                    : "border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 opacity-80"
                }`}
              >
                {/* Subtle gradient tint background on hover */}
                {isAvailable && (
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${course.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                  />
                )}

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${course.color} text-3xl shadow-lg shadow-slate-900/5`}>
                      <span>{course.icon}</span>
                    </div>
                    {isAvailable ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 ring-1 ring-emerald-200 dark:ring-emerald-900">
                        ● Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 bg-gradient-to-r ${course.color} bg-clip-text text-transparent`}>
                    {course.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{course.tagline}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                    {course.description}
                  </p>

                  {/* Course meta row */}
                  <div className="flex items-center gap-4 mb-5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-300 dark:text-slate-600">▦</span>
                      {isAvailable ? `${moduleCount} modules` : "modules TBD"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-300 dark:text-slate-600">▤</span>
                      {phaseCount} phases
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-300 dark:text-slate-600">⚙</span>
                      Java
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <span className="text-xs text-slate-500">
                      {isAvailable ? "Ready to go" : "In planning — check back soon"}
                    </span>
                    {isAvailable && (
                      <span className={`text-sm font-semibold bg-gradient-to-r ${course.color} bg-clip-text text-transparent inline-flex items-center gap-1`}>
                        Start course
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            return isAvailable ? (
              <Link key={course.id} href={`/courses/${course.slug}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={course.id}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* Why Skillforge */}
      <section className="mb-16">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5">
          Why Skillforge
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ValueProp
            icon="🛠"
            title="Project-driven"
            desc="Every module ships with a real Java/Spring build. You finish with code, not just notes."
            accent="from-indigo-500 to-purple-500"
          />
          <ValueProp
            icon="🎯"
            title="Pattern-first"
            desc="Analogy → formula → worked example → variants → checkpoint. The same rhythm, every time."
            accent="from-rose-500 to-orange-500"
          />
          <ValueProp
            icon="🧪"
            title="Gating checkpoints"
            desc="You don't progress by clicking next — you progress by answering correctly."
            accent="from-emerald-500 to-teal-500"
          />
        </div>
      </section>

      {/* Gamification preview */}
      <section className="mb-16">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20 p-6 sm:p-8">
          <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Built to keep you coming back</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 max-w-lg">
                XP for every checkpoint cleared. Streaks for daily learning. A mascot named Tokey who genuinely cares whether you actually learned the thing.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill>🔥 Daily streaks</Pill>
                <Pill>⭐ XP per checkpoint</Pill>
                <Pill>🎉 Confetti for wins</Pill>
                <Pill>🐦 Tokey, your guide</Pill>
              </div>
            </div>
            <div className="flex sm:justify-end">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      1,240
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">XP</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">🔥 7</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Streak</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">12<span className="text-slate-400 dark:text-slate-500">/{availableModuleCount}</span></div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Modules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-4 text-sm text-slate-500 leading-relaxed">
        <p>
          Progress, XP, streaks, and quiz state live in your browser&apos;s localStorage. No login, no backend — clearing site data resets everything.
        </p>
      </section>
    </div>
  );
}

function ValueProp({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-xl shadow-sm`}>
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 backdrop-blur">
      {children}
    </span>
  );
}
