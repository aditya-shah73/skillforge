import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-6-revision";

export default function Phase6RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 6 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 6 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The advanced-patterns reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material — it is a <strong>map of Phase 6</strong>. Five modules on the advanced patterns that separate senior React engineers from competent ones, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/memoization-deep" className="text-cyan-600 hover:underline">memoization</Link>,{" "}
          <Link href="/courses/frontend/modules/suspense-concurrent" className="text-cyan-600 hover:underline">Suspense &amp; concurrent features</Link>,{" "}
          <Link href="/courses/frontend/modules/error-boundaries" className="text-cyan-600 hover:underline">error boundaries</Link>,{" "}
          <Link href="/courses/frontend/modules/portals-refs-advanced" className="text-cyan-600 hover:underline">portals &amp; advanced refs</Link>, and{" "}
          <Link href="/courses/frontend/modules/advanced-composition" className="text-cyan-600 hover:underline">advanced composition</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Memoization */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · Memoization: memo, useMemo, useCallback</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Three tools, three jobs. <code>memo</code>{" "}wraps a <strong>component</strong>{" "}and skips its re-render when props are <strong>referentially equal</strong>{" "}to last time. <code>useMemo</code>{" "}caches a <strong>computed value</strong>. <code>useCallback</code>{" "}caches a <strong>function identity</strong>{" "}— it&apos;s just <code>useMemo</code>{" "}for a function.</li>
            <li><code>memo</code>{" "}compares props with <code>Object.is</code>{" "}(a shallow reference check). A <strong>fresh object, array, or function</strong>{" "}created inline in the parent&apos;s render is a brand-new reference every time, so it <strong>defeats <code>memo</code></strong>{" "}— the child re-renders anyway.</li>
            <li>That&apos;s the link between them: you reach for <code>useMemo</code>{" "}/ <code>useCallback</code>{" "}to keep those props <strong>stable</strong>{" "}so a memoized child actually stays memoized (or to keep a value off an effect&apos;s dependency array).</li>
            <li>Memoizing is <strong>not free</strong>: every cache stores the value, the deps, and runs a comparison on each render. For cheap computations the bookkeeping can cost more than just recomputing.</li>
            <li>So <strong>don&apos;t premature-memoize</strong>. Measure first; memoize when you have a real, expensive re-render or a referential-equality dependency to stabilize — not reflexively on everything.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Suspense & concurrent features */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Suspense &amp; concurrent features</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong><code>Suspense</code>{" "}is a declarative loading boundary.</strong>{" "}You wrap part of the tree, give it a <code>fallback</code>, and while anything inside is &quot;suspending&quot; React shows the fallback instead of you threading <code>isLoading</code>{" "}flags through every component.</li>
            <li><strong>Concurrent rendering</strong>{" "}means a render is <strong>interruptible</strong>: React can start rendering, pause to handle a more urgent update, and resume — instead of blocking the main thread until the whole tree is done.</li>
            <li><code>useTransition</code>{" "}marks an update as <strong>non-blocking / low-priority</strong>. Urgent updates (typing) stay snappy while the heavy update renders in the background; it hands you an <code>isPending</code>{" "}flag to show subtle &quot;updating&quot; UI without blocking input.</li>
            <li><code>useDeferredValue</code>{" "}lets an <strong>expensive render lag behind</strong>{" "}the input that drives it — the input updates immediately, the heavy list/chart catches up on a deferred value, so fast typing never feels janky.</li>
            <li>Mental model: <strong>Suspense = where to show loading</strong>; <strong><code>useTransition</code>{" "}/ <code>useDeferredValue</code>{" "}= keep urgent updates responsive</strong>{" "}while less-urgent work renders behind them.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Error boundaries */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · Error boundaries</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>An error boundary <strong>catches errors thrown during render and in lifecycle methods</strong>{" "}of the components <strong>below it</strong>, and renders a fallback UI instead of letting the whole tree crash to a blank screen.</li>
            <li>What it does <strong>not</strong>{" "}catch: <strong>event handlers</strong>{" "}(use a try/catch there), <strong>async code</strong>{" "}(promises, <code>setTimeout</code>), errors thrown in the <strong>boundary itself</strong>, and <strong>server-side rendering</strong>. Those fall outside the render path it watches.</li>
            <li>It <strong>must be a class component</strong>{" "}(there&apos;s no hook equivalent yet): implement <code>static getDerivedStateFromError</code>{" "}to flip into the fallback state, and <code>componentDidCatch</code>{" "}to log the error / stack to your monitoring.</li>
            <li>In practice you wrap one and reuse it — or reach for <code>react-error-boundary</code>, which adds a <code>resetErrorBoundary</code>{" "}and a render-prop / hook API around the same class mechanism.</li>
            <li><strong>Granular placement isolates failures.</strong>{" "}A boundary around each widget means one broken chart shows its own fallback while the rest of the dashboard keeps working — versus a single top-level boundary that takes down the whole page.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Portals & advanced refs */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Portals &amp; advanced refs</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><code>createPortal(children, domNode)</code>{" "}renders children into a <strong>different place in the DOM</strong>{" "}(e.g. <code>document.body</code>) while keeping them in the <strong>same React tree</strong>{" "}— so <strong>context still flows</strong>{" "}and <strong>events still bubble</strong>{" "}to the React parent, not the DOM parent.</li>
            <li>That&apos;s exactly why modals, tooltips, and dropdowns use portals: rendering to <code>body</code>{" "}escapes <strong><code>overflow: hidden</code>{" "}clipping and <code>z-index</code>{" "}stacking-context traps</strong>{" "}from ancestor containers.</li>
            <li>A portal alone is not an accessible modal. An <strong>accessible modal</strong>{" "}also needs a <strong>focus trap</strong>{" "}(keep Tab inside the dialog), <strong>return focus</strong>{" "}to the trigger on close, <strong>close on Escape</strong>, and <code>role=&quot;dialog&quot;</code>{" "}with <code>aria-modal</code>{" "}/ a label.</li>
            <li><strong>Ref callbacks</strong>{" "}(<code>ref={"{"}node ={">"} ...{"}"}</code>) run with the DOM node on mount and <code>null</code>{" "}on unmount — handy when you need to react to the node attaching, not just stash it.</li>
            <li><strong>Merging refs</strong>{" "}solves the &quot;two owners need the same node&quot; problem (your local ref <em>and</em>{" "}a forwarded ref): write a small helper that assigns the node to each, or use a library&apos;s <code>useMergedRef</code>.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Advanced composition */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Advanced composition</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>The headline: <strong>composition beats boolean-prop soup</strong>. A component with a dozen <code>isPrimary</code>{" "}/ <code>hasIcon</code>{" "}/ <code>showHeader</code>{" "}flags is a smell — compose smaller pieces instead of adding another boolean.</li>
            <li><strong><code>asChild</code>{" "}/ slot</strong>{" "}lets a component <strong>merge its behavior onto a child you pass in</strong>{" "}instead of rendering its own wrapper — e.g. a <code>Button asChild</code>{" "}wrapping an <code>{"<a>"}</code>{" "}gives you a link that behaves like the button, no extra DOM node.</li>
            <li><strong>Polymorphic <code>as</code></strong>{" "}lets the caller pick the rendered element/component (<code>{'<Box as="section" />'}</code>) so one component covers many tags — the typing is the hard part, but the ergonomics are worth it.</li>
            <li><strong>Controlled / uncontrolled APIs</strong>: support both an uncontrolled <code>defaultValue</code>{" "}(component owns state) and a controlled <code>value</code>{" "}+ <code>onChange</code>{" "}(caller owns state). Same who-owns-the-value question as inputs, now at the component-API level.</li>
            <li><strong>Headless components</strong>{" "}ship the <strong>behavior, state, and accessibility</strong>{" "}with <strong>no styling</strong>{" "}— you bring the markup and CSS. It&apos;s the cleanest separation of logic from presentation, and why libraries like Radix / Headless UI compose so well.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;when do you reach for <code>memo</code>, <code>useMemo</code>, and <code>useCallback</code>?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;<code>memo</code>{" "}skips a component&apos;s re-render when its props are referentially equal; <code>useMemo</code>{" "}caches an expensive value; <code>useCallback</code>{" "}caches a function identity. They work together — I memoize a value or callback to keep a prop stable so a <code>memo</code>&apos;d child actually stays memoized, because a fresh inline object or function defeats <code>memo</code>. But memoizing has a cost, so I don&apos;t do it reflexively — I measure first and memoize a real expensive render or a referential dependency, not everything.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what&apos;s the difference between <code>useTransition</code>{" "}and <code>useDeferredValue</code>?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Both keep the UI responsive using concurrent rendering, which makes a render interruptible. <code>useTransition</code>{" "}wraps the <em>update</em>{" "}you trigger — you mark a state change as non-blocking and get an <code>isPending</code>{" "}flag. <code>useDeferredValue</code>{" "}wraps the <em>value</em>{" "}— the input updates immediately and an expensive render lags behind the deferred copy. Roughly: <code>useTransition</code>{" "}when I own the setter, <code>useDeferredValue</code>{" "}when I only have the value coming in. And <code>Suspense</code>{" "}is the separate piece — a declarative loading boundary.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what can an error boundary <em>not</em>{" "}catch?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;It catches errors thrown during render and lifecycle in the tree below it. It does <em>not</em>{" "}catch event handlers, async code like promises or <code>setTimeout</code>, errors in the boundary itself, or SSR — those are outside the render path. It has to be a class with <code>getDerivedStateFromError</code>{" "}and <code>componentDidCatch</code>. I place them granularly so one broken widget shows its own fallback instead of crashing the whole page.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why render a modal in a portal?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;<code>createPortal</code>{" "}renders into a different DOM node — usually <code>body</code>{" "}— while staying in the same React tree, so context still flows and events still bubble to the React parent. That escapes ancestor <code>overflow: hidden</code>{" "}clipping and <code>z-index</code>{" "}stacking traps. But a portal isn&apos;t an accessible modal by itself — I still add a focus trap, return focus to the trigger on close, close on Escape, and <code>role=&quot;dialog&quot;</code>{" "}with a label.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do you keep a component API from becoming a pile of boolean props?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I lean on composition. <code>asChild</code>{" "}/ slot to merge behavior onto a child instead of adding a wrapper, polymorphic <code>as</code>{" "}so the caller picks the element, controlled/uncontrolled APIs so they can own state when they need to, and headless components that ship behavior plus accessibility with no styling. Composition beats boolean-prop soup — when I&apos;m tempted to add the tenth flag, that&apos;s the signal to break the thing into composable pieces instead.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Up next */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">Up next</h2>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Phase 7 — Next.js (App Router) Essentials.</strong>{" "}You now own the advanced React patterns — performance, Suspense, error boundaries, portals, and composition. Phase 7 moves to the framework: <strong>Server vs Client Components</strong>, <strong>routing &amp; layouts</strong>, <strong>server data loading</strong>, <strong>Server Actions</strong>, and the <strong>rendering strategies</strong>{" "}(static, dynamic, streaming) that decide where and when your code runs.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 7+ content is rolling out — check back, or follow along as new modules ship.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
