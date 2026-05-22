import Link from "next/link";
import { COURSES, ai, dsa, systemDesign } from "@/lib/courses";
import ContinueWhereYouLeftOff from "@/components/ContinueWhereYouLeftOff";
import BookmarksSection from "@/components/BookmarksSection";

const COURSE_DATA = { ai, dsa, "system-design": systemDesign } as const;

export default function Home() {
  // Live count of available modules across every course — used by the
  // gamification preview's denominator so it stays correct as content ships.
  const courseData = COURSES.map((c) => COURSE_DATA[c.id]);
  const availableModuleCount = courseData.reduce(
    (sum, c) => sum + c.MODULES.filter((m) => m.status === "available").length,
    0,
  );

  return (
    <div className="relative">
      {/* Decorative gradient blobs (lighter — just two, behind the hero) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-20 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute top-10 right-1/4 h-64 w-64 translate-x-1/2 rounded-full bg-purple-400/25 blur-3xl dark:bg-purple-500/15" />
      </div>

      {/* Hero — tightened: smaller H1, inline value strip, no separate stats row */}
      <section className="mb-12 pt-2 text-center sm:text-left">
        <h1 className="mb-4 text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
          Forge real skills,{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            one project at a time.
          </span>
        </h1>
        <p className="mx-auto mb-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg dark:text-slate-400">
          Hands-on courses for working engineers. Real Java/Spring projects, checkpoints that actually gate progress. <span className="font-medium text-slate-900 dark:text-slate-100">No passive video binges.</span>
        </p>

        {/* Inline value strip — replaces the old stats row */}
        <div className="flex flex-wrap justify-center gap-2 text-xs sm:justify-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span aria-hidden>🛠</span> Project-driven
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span aria-hidden>🧪</span> Gating checkpoints
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <span aria-hidden>⚡</span> Local-first, no login
          </span>
        </div>
      </section>

      {/* Resume CTA — only renders if the user has completed at least one module */}
      <ContinueWhereYouLeftOff />

      {/* Bookmarks — only renders if the user has saved any modules */}
      <BookmarksSection />

      {/* Course picker */}
      <section className="mb-16">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Pick your track
          </h2>
          <span className="text-xs text-slate-400">{COURSES.length} courses</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {COURSES.map((course) => {
            const isAvailable = course.status === "available";
            const data = COURSE_DATA[course.id];
            const moduleCount = data.MODULES.length;
            const phaseCount = data.PHASES.length;

            const card = (
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  isAvailable
                    ? "cursor-pointer border-slate-200 bg-white hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                    : "border-dashed border-slate-300 bg-slate-50 opacity-80 dark:border-slate-700 dark:bg-slate-950/60"
                }`}
              >
                {/* Subtle gradient tint background on hover */}
                {isAvailable && (
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br ${course.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                  />
                )}

                <div className="relative flex flex-1 flex-col">
                  <div className="mb-3 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${course.color} text-2xl shadow-lg shadow-slate-900/5`}>
                      <span>{course.icon}</span>
                    </div>
                    {!isAvailable && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h3 className={`mb-1 bg-gradient-to-r text-xl font-bold ${course.color} bg-clip-text text-transparent`}>
                    {course.name}
                  </h3>
                  <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-300">{course.tagline}</p>
                  <p className="mb-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {course.description}
                  </p>

                  {/* Spacer pushes meta + footer to the bottom so cards align across columns */}
                  <div className="flex-1" />

                  {/* Course meta row */}
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-slate-300 dark:text-slate-600">▦</span>
                      {isAvailable ? `${moduleCount} modules` : "modules TBD"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-slate-300 dark:text-slate-600">▤</span>
                      {phaseCount} phases
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-slate-300 dark:text-slate-600">⚙</span>
                      Java
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500">
                      {isAvailable ? "Ready to go" : "In planning"}
                    </span>
                    {isAvailable && (
                      <span className={`bg-gradient-to-r text-xs font-semibold ${course.color} inline-flex items-center gap-1 bg-clip-text text-transparent`}>
                        Start
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
        <h2 className="mb-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Why Skillforge
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="mb-2 text-xl font-bold">Built to keep you coming back</h2>
              <p className="mb-4 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                XP for every checkpoint cleared. Streaks for daily learning. A mascot named Tokey who genuinely cares whether you actually learned the thing.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill>🔥 Daily streaks</Pill>
                <Pill>⭐ XP per checkpoint</Pill>
                <Pill>🎉 Confetti for wins</Pill>
                <Pill>🐦 Tokey, your guide</Pill>
              </div>
            </div>
            {/* Preview card: tighter gutters + smaller numbers below sm so the
                three stat blocks + two dividers fit a 360px viewport without
                overflow. `min-w-0` on the outer wrapper lets the card shrink
                below its intrinsic content width. */}
            <div className="flex min-w-0 sm:justify-end">
              <div className="max-w-full rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm sm:px-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xl font-bold text-transparent tabular-nums sm:text-2xl">
                      1,240
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">XP</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-500 tabular-nums sm:text-2xl">🔥 7</div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Streak</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-500 tabular-nums sm:text-2xl">12<span className="text-slate-400 dark:text-slate-500">/{availableModuleCount}</span></div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Modules</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-slate-200 pt-8 pb-4 text-sm leading-relaxed text-slate-500 dark:border-slate-800">
        <p>
          Progress, XP, streaks, and quiz state live in your browser&apos;s localStorage. No login, no backend — clearing site data resets everything.
        </p>
      </section>
    </div>
  );
}

function ValueProp({ icon, title, desc, accent }: { icon: string; title: string; desc: string; accent: string }) {
  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-xl shadow-sm`}>
        {icon}
      </div>
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
      {children}
    </span>
  );
}
