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
    "Deep front-end fundamentals: JavaScript internals, TypeScript for React engineers, the React rendering model, hooks and state, Next.js, performance, and accessibility. Each idea ends in a checkpoint that gates progress until you can explain it cold.",
  icon: "🎨",
  color: "from-cyan-500 to-sky-500",
  accent: "cyan",
  status: "available" as const,
  language: "JavaScript / TypeScript",
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

  // Phase 2 · TypeScript for React Engineers
  { slug: "ts-foundations", number: 9, phase: "TypeScript for React Engineers", phaseNumber: 2, title: "TypeScript foundations — structural typing & the type/interface/any/unknown/never set", subtitle: "Why TypeScript catches bugs JS can't, structural vs nominal typing, `type` vs `interface`, and what `any`/`unknown`/`never` each actually mean", duration: "~1.5–2h", project: "Type a small JSON-shaped library API with no implicit `any`, then deliberately add `unknown` and `never` in the right places", status: "available" },
  { slug: "narrowing-and-guards", number: 10, phase: "TypeScript for React Engineers", phaseNumber: 2, title: "Narrowing, discriminated unions, and exhaustiveness", subtitle: "How TS narrows a type inside an `if`, discriminated unions for state machines, custom type guards, and `never` as the exhaustiveness check that catches every new case", duration: "~1.5–2h", project: "Model a `RequestState` discriminated union (idle/loading/success/error), render each branch, and add a `never` exhaustiveness assert", status: "available" },
  { slug: "generics-deep", number: 11, phase: "TypeScript for React Engineers", phaseNumber: 2, title: "Generics — the real mental model", subtitle: "Why generics exist, `<T>` and constraints, default type params, inference, and the patterns React forces (`PropsWithChildren`, generic hooks, the `<T,>` trailing comma trick in TSX)", duration: "~1.5–2h", project: "Write a generic `useFetch<T>` hook that types the response correctly without `any`, plus a generic `<List items renderItem>` component", status: "available" },
  { slug: "react-typing", number: 12, phase: "TypeScript for React Engineers", phaseNumber: 2, title: "Typing React — props, children, refs, events, forwardRef", subtitle: "How to type components, `children` correctly, event handlers, refs, `forwardRef`, and the polymorphic `as` prop pattern — the React-TS patterns interviewers ask about", duration: "~2h", project: "Build a `Button` component that's polymorphic (`as=\"a\" | \"button\"`), accepts a ref, and infers element-correct event handlers", status: "available" },
  { slug: "phase-2-revision", number: 13, phase: "TypeScript for React Engineers", phaseNumber: 2, title: "Phase 2 revision notes", subtitle: "Structural typing, narrowing, generics, and the React-specific patterns — your TypeScript-for-React reference card", duration: "~15 min", project: "No project — pure revision", status: "available" },

  // Phase 3 · React Mental Model
  { slug: "how-react-works", number: 14, phase: "React Mental Model", phaseNumber: 3, title: "How React actually works — reconciliation, the virtual DOM, and keys", subtitle: "What `React.createElement` builds, what reconciliation does, why keys matter (and why index-as-key is a trap), and the difference between mounting and updating", duration: "~1.5–2h", project: "Build a tiny render-and-diff toy in 80 lines, then break a reorderable list with `key={index}` and explain the bug", status: "available" },
  { slug: "rendering-rules", number: 15, phase: "React Mental Model", phaseNumber: 3, title: "Rendering rules — when does a component actually re-render?", subtitle: "What triggers a render, why a new object/function prop breaks `memo`, the `useMemo`/`useCallback` mental model, and why most premature memoization makes things worse", duration: "~1.5–2h", project: "Use the React DevTools profiler to find the unnecessary re-renders in a sample tree and fix the three most expensive ones — without overusing memoization", status: "available" },
  { slug: "state-rules", number: 16, phase: "React Mental Model", phaseNumber: 3, title: "State rules — `useState`, immutability, batching, and lifting state up", subtitle: "Why state is a snapshot, the immutable-update rule, the functional updater (`setX(prev => …)`), automatic batching in React 18+, and when to lift vs colocate", duration: "~1.5–2h", project: "Build a counter that increments three times in one handler (predict the result), then rewrite it correctly with the functional updater", status: "available" },
  { slug: "effects-properly", number: 17, phase: "React Mental Model", phaseNumber: 3, title: "`useEffect` properly — lifecycle, deps, cleanup, and what an effect isn't for", subtitle: "Effects as synchronization (not lifecycle), the dependency array as a closure capture, cleanup functions, StrictMode double-fires, and the \"you might not need an effect\" rules", duration: "~2h", project: "Take a useEffect-heavy component and remove the effects that shouldn't exist (derived state, event handlers, init) — keeping only the genuine sync points", status: "available" },
  { slug: "composition-patterns", number: 18, phase: "React Mental Model", phaseNumber: 3, title: "Composition patterns — children, render props, and compound components", subtitle: "How `children` is the most underrated React API, the render-props pattern, compound components (`<Tabs.List><Tabs.Tab/>`), and why composition beats prop-drilling configuration", duration: "~1.5–2h", project: "Build a compound `<Disclosure>` (Disclosure.Button + Disclosure.Panel) with shared state via context — no prop-drilling", status: "available" },
  { slug: "phase-3-revision", number: 19, phase: "React Mental Model", phaseNumber: 3, title: "Phase 3 revision notes", subtitle: "Reconciliation, rendering rules, state, effects, composition — the React-internals reference card", duration: "~15 min", project: "No project — pure revision", status: "available" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
