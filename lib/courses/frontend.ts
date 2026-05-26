// Front-End Engineering Foundations — course definition.
// JS-deep, TS-deep, React-deep, Next.js-light foundations for engineers who've
// shipped some React but never went under the hood. Built for the kinds of
// "explain this in 60 seconds" questions that separate juniors from mid/senior
// front-end engineers — useful in interviews, design reviews, and on-call alike.

import type { Module } from "./ai";

export const COURSE_META = {
  id: "frontend" as const,
  slug: "frontend",
  name: "Front-End Engineering Foundations",
  shortName: "FE Foundations",
  tagline: "From basic React to engineer-ready front-end",
  description:
    "A deep-dive front-end course for engineers who use React but have never built a closure, predicted `this`, traced the event loop, or explained why their bundle is 800KB. JavaScript foundations → TypeScript → React internals → Next.js → performance & accessibility, with checkpoints that gate progress until you can actually explain each idea.",
  icon: "🎨",
  color: "from-cyan-500 to-sky-500",
  accent: "cyan",
  status: "available" as const,
};

// Forward-locked phase list. Phases 2–9 currently have no modules — they
// render as empty phase sections on the course page until we ship them.
// Locking the names + colors here means the existing landing page logic
// (modulesByPhase in app/courses/frontend/page.tsx) keeps working as we
// fill modules in without any further wiring.
export const PHASES = [
  { number: 0, name: "Orientation", color: "from-slate-500 to-slate-400" },
  { number: 1, name: "JavaScript You Can Defend", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "TypeScript for React Engineers", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "React Mental Model", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Hooks in Depth", color: "from-teal-500 to-cyan-500" },
  { number: 5, name: "State, Forms & Data", color: "from-sky-500 to-blue-500" },
  { number: 6, name: "Advanced React Patterns", color: "from-indigo-500 to-purple-500" },
  { number: 7, name: "Next.js (App Router) Essentials", color: "from-violet-500 to-fuchsia-500" },
  { number: 8, name: "Performance, A11y & DX", color: "from-fuchsia-500 to-pink-500" },
  { number: 9, name: "Interview Closers", color: "from-pink-500 to-rose-500" },
];

export const MODULES: Module[] = [
  // Phase 0 · Orientation
  { slug: "welcome", number: 0, phase: "Orientation", phaseNumber: 0, title: "Welcome — what this course is (and isn't)", subtitle: "How the course works, who it's for, and how to use checkpoints under interview pressure", duration: "~5 min", project: "No project — just read", status: "available" },

  // Phase 1 · JavaScript You Can Defend
  { slug: "values-references", number: 1, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Values, references, and what === actually compares", subtitle: "Primitives vs objects on the stack/heap, why [1] !== [1], and the bugs that follow from spreading the wrong thing", duration: "~1.5–2h", project: "Bug-hunt lab: 12 snippets that look right and aren't — predict, run, explain", status: "available" },
  { slug: "closures-scope", number: 2, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Closures, scope, and the `var` graveyard", subtitle: "Lexical scope, the closure-in-a-loop classic, why `let` saved us, and the closures hiding in every React hook", duration: "~1.5–2h", project: "Counter factory + implement debounce and throttle from scratch", status: "available" },
  { slug: "this-binding", number: 3, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "`this`, binding, and arrow functions", subtitle: "The four rules (default, implicit, explicit, new), why arrow functions don't have `this`, and the .bind() pattern React class components needed", duration: "~1–1.5h", project: "Rewrite 10 snippets predicting `this` — methods, callbacks, event handlers, arrows", status: "available" },
  { slug: "prototypes-classes", number: 4, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Prototypes, classes, and what `new` actually does", subtitle: "The prototype chain, why `class` is sugar, instanceof under the hood, and why React stopped recommending classes", duration: "~1.5–2h", project: "Implement `new` from scratch + polyfill Object.create + write a prototype-chain visualizer", status: "available" },
  { slug: "event-loop", number: 5, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "The event loop, microtasks, and macrotasks", subtitle: "Call stack, task queue, microtask queue, why Promise.resolve().then runs before setTimeout(0), and why this matters for React batching", duration: "~2–2.5h", project: "Implement a tiny Promise from scratch (states, then, chaining) + predict log order in 15 snippets", status: "available" },
  { slug: "async-patterns", number: 6, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Promises, async/await, and the patterns interviewers ask about", subtitle: "Promise states, .then vs await, error propagation, Promise.all/race/allSettled, and the AbortController pattern every React app needs", duration: "~2h", project: "Implement Promise.all + Promise.race from scratch + build a cancellable fetch wrapper", status: "available" },
  { slug: "modules-bundlers", number: 7, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Modules, bundlers, and what ships to the browser", subtitle: "ESM vs CommonJS, why your import * matters, tree-shaking, code-splitting, and reading a webpack/Next.js bundle output", duration: "~1h", project: "Audit a small Next.js bundle: find the heaviest module, justify whether it should be there", status: "available" },
  { slug: "phase-1-revision", number: 8, phase: "JavaScript You Can Defend", phaseNumber: 1, title: "Phase 1 revision notes", subtitle: "Values/refs, closures, `this`, prototypes, the event loop, async, modules — the JS-foundation reference card you can re-read in 15 minutes before the interview", duration: "~15 min", project: "No project — pure revision", status: "available" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
