import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-3-revision";

export default function Phase3RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 3 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 3 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The React-internals reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material — it is a <strong>map of Phase 3</strong>. Five modules of React-internals foundations, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/how-react-works" className="text-cyan-600 hover:underline">How React works</Link>,{" "}
          <Link href="/courses/frontend/modules/rendering-rules" className="text-cyan-600 hover:underline">Rendering rules</Link>,{" "}
          <Link href="/courses/frontend/modules/state-rules" className="text-cyan-600 hover:underline">State rules</Link>,{" "}
          <Link href="/courses/frontend/modules/effects-properly" className="text-cyan-600 hover:underline">Effects properly</Link>, and{" "}
          <Link href="/courses/frontend/modules/composition-patterns" className="text-cyan-600 hover:underline">Composition patterns</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — How React works */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · How React actually works</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>JSX compiles to <code>React.createElement</code>, which returns plain objects (<em>React Elements</em>) describing the UI. The tree of these objects is the &quot;virtual DOM.&quot;</li>
            <li>An update has two phases: <strong>render</strong>{" "}(call components, build new tree — pure) and <strong>commit</strong>{" "}(diff against previous tree, apply minimum DOM ops).</li>
            <li><strong>Reconciliation</strong>{" "}walks position by position. Different element type → unmount + mount (state lost). Same type → reuse the DOM node, patch differing props.</li>
            <li><strong>Keys</strong>{" "}give items identity in arrays so React matches across renders. Index keys fail when items reorder, insert, or delete — they reuse the wrong DOM node.</li>
            <li>The classic bug fixed by stable keys: &quot;user input ended up on the wrong row.&quot;</li>
            <li>Lifecycle in three words: <em>mount</em>{" "}(first appear), <em>update</em>{" "}(same position, same type), <em>unmount</em>{" "}(disappear).</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Rendering rules */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Rendering rules</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A component re-renders when its <strong>own state changes</strong>, a <strong>parent re-renders</strong>, or a <strong>context it reads</strong>{" "}changes.</li>
            <li>By default, children re-render with parents — no shallow-prop check. <code>React.memo</code>{" "}adds the check.</li>
            <li>Objects and functions defined inline in JSX get a <em>new identity every render</em>{" "}— that&apos;s what defeats <code>memo</code>{" "}silently.</li>
            <li><code>useMemo</code>{" "}caches a value; <code>useCallback</code>{" "}caches a function. Use them when (a) a memoized child needs a stable prop, or (b) the work is genuinely expensive.</li>
            <li>Premature memoization is a net negative. Profile first; memoize where it pays off.</li>
            <li><code>useRef</code>{" "}holds a mutable value that <em>doesn&apos;t</em>{" "}trigger re-renders. Use it for things you want to remember but not react to.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — State rules */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · State rules</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>State is a <strong>snapshot</strong>{" "}for the current render. <code>setState</code>{" "}schedules a new snapshot; it does not mutate the current one.</li>
            <li>Reading <code>count</code>{" "}after <code>setCount(count + 1)</code>{" "}gives the old value. The new value isn&apos;t visible until React renders again.</li>
            <li>If next state depends on previous, use the <strong>functional updater</strong>: <code>{`setX(prev => …)`}</code>. Multiple calls compose correctly.</li>
            <li>State updates require <strong>new references</strong>. Mutating in place doesn&apos;t trigger a re-render — React uses <code>Object.is</code>{" "}to compare.</li>
            <li>React 18+ <strong>batches</strong>{" "}all <code>setState</code>{" "}calls in a handler/effect/promise/timeout into one render.</li>
            <li><strong>Lift state up</strong>{" "}to the lowest common ancestor when multiple components share it. Push it back down when only one cares.</li>
            <li>Don&apos;t use <code>useState</code>{" "}for derived values, copied props, or non-rendering values — compute inline, or use <code>useRef</code>.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Effects */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Effects properly</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>An effect is a <strong>synchronization</strong>{" "}between React state and an external system (DOM API, network, subscription, timer). Not a lifecycle, not an &quot;after render&quot; callback.</li>
            <li>The <strong>dependency array</strong>{" "}lists every React value the effect closes over. Missing deps = stale data. Trust <code>react-hooks/exhaustive-deps</code>.</li>
            <li>The <strong>cleanup function</strong>{" "}is the undo of setup. Runs before the next setup and on unmount. Subscriptions, timers, listeners, and in-flight fetches all need one.</li>
            <li><strong>StrictMode</strong>{" "}in dev fires every effect twice on mount — a stress test for cleanup. Misbehavior here = real leaks in production.</li>
            <li>You might <strong>not need an effect</strong>{" "}for: derived data (compute inline), event handlers (use the JSX handler), state resets on prop change (use <code>key</code>), or copying props into state.</li>
            <li>The smell: an effect whose only job is to call <code>setX</code>{" "}from other state.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Composition patterns */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Composition patterns</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong><code>children</code></strong>{" "}is the most underrated React API. Use it for &quot;anything that goes inside.&quot;{" "}Don&apos;t invent <code>content</code>{" "}props.</li>
            <li><strong>Slots</strong>{" "}— named <code>ReactNode</code>{" "}props for fixed regions (header/sidebar/footer). Layout owns the shape; caller owns the content.</li>
            <li><strong>Render props</strong>{" "}— <code>children</code>{" "}as a function, called with parent state. Prefer hooks in 2025; reach for render props when you need a component in the tree (portals, error boundaries, headless UI).</li>
            <li><strong>Compound components</strong>{" "}— a parent + named sub-components (<code>Tabs.List</code>, <code>Tabs.Tab</code>) that share state via context. Eliminates prop drilling and lets the caller reorder freely.</li>
            <li>Design principle: <strong>composition over configuration</strong>. New feature = new child, not new prop.</li>
            <li>The compound-component guard: read context in a hook that <em>throws</em>{" "}if used outside the parent. Loud failures save hours of debugging.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what is the virtual DOM?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;A tree of plain JS objects that describe the UI you want. React compares the new tree against the previous one — reconciliation — and applies the minimum set of DOM operations. The virtual DOM isn&apos;t a faster DOM; it&apos;s a diff buffer.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why do I need keys?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Keys give items identity inside arrays so React knows which item is which across renders. Without them — or with index keys — reordering or inserting items causes React to reuse the wrong DOM node, so user input and component state end up on the wrong row.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why did setCount three times only increment by one?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;State is a snapshot. <code>count</code>{" "}is captured at the start of the handler; all three calls schedule &lsquo;set to count + 1&rsquo; with the same captured value. Use the functional updater <code>{`setCount(prev => prev + 1)`}</code>{" "}— each call sees the previous scheduled value, so the increments compose.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;when should I use useEffect?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Only to synchronize with the outside world — DOM APIs, network, subscriptions, timers. Not for derived data (compute inline), event responses (use the JSX handler), or resetting state when a prop changes (use <code>key</code>). The lint rule <code>exhaustive-deps</code>{" "}is right; don&apos;t suppress it.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;when is React.memo worth it?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;When the profiler shows a child re-rendering unnecessarily, and you can stabilize its props. Wrap the child in <code>memo</code>{" "}and stabilize any inline objects/functions in the parent with <code>useMemo</code>/<code>useCallback</code>. Don&apos;t add it prophylactically — the bookkeeping costs more than it saves when props are unstable anyway.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Up next */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">Up next</h2>
        <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-5 dark:border-teal-900/60 dark:bg-teal-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Phase 4 — Hooks in Depth.</strong>{" "}You understand <em>why</em>{" "}hooks exist and the rules they obey. Next phase: each one, in detail. <code>useState</code>{" "}internals, <code>useReducer</code>{" "}for complex transitions, <code>useContext</code>{" "}without provider hell, custom hooks as the unit of reuse — and the rules-of-hooks story you can recite cold.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 4+ content is rolling out — check back, or follow along as new modules ship.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
