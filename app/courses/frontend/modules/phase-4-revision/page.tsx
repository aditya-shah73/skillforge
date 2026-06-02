import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-4-revision";

export default function Phase4RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 4 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 4 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The hooks reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material, it is a <strong>map of Phase 4</strong>. Five modules of hooks foundations, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/usestate-usereducer" className="text-cyan-600 hover:underline">useState &amp; useReducer</Link>,{" "}
          <Link href="/courses/frontend/modules/usecontext" className="text-cyan-600 hover:underline">useContext</Link>,{" "}
          <Link href="/courses/frontend/modules/useref-imperative" className="text-cyan-600 hover:underline">useRef &amp; imperative handles</Link>,{" "}
          <Link href="/courses/frontend/modules/custom-hooks" className="text-cyan-600 hover:underline">custom hooks</Link>, and{" "}
          <Link href="/courses/frontend/modules/rules-of-hooks" className="text-cyan-600 hover:underline">the rules of hooks</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — useState & useReducer */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · useState &amp; useReducer</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>State is a <strong>snapshot</strong>{" "}captured for the current render, and <code>setState</code>{" "}<strong>queues</strong>{" "}an update rather than mutating in place. The new value isn&apos;t visible until React renders again.</li>
            <li>If the next state depends on the previous, use the <strong>functional updater</strong>{" "}<code>{`setX(prev => …)`}</code>. Multiple queued updaters <em>compose</em>,{" "}each sees the result of the one before it.</li>
            <li><code>useState</code>{" "}is <code>useReducer</code>{" "}under the hood, a reducer whose action is &quot;replace with this value (or apply this updater).&quot;</li>
            <li><strong>Graduate to <code>useReducer</code></strong>{" "}when you have several interdependent fields whose transitions must move together, the next state is a function of the current state plus an event, not of scattered setters.</li>
            <li>Type the actions as a <strong>discriminated union</strong>{" "}and add an <strong>exhaustiveness check</strong>{" "}(a <code>never</code>{" "}in the <code>default</code>{" "}case) so a new action without a matching branch fails to compile.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — useContext */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · useContext</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Context is for <strong>slow-changing, app-wide values</strong>,{" "}theme, current user, locale, not for state that changes on every keystroke.</li>
            <li>When the provider <code>value</code>{" "}changes, <strong>every consumer re-renders</strong>, no shallow check, no opting out. The cost scales with how many components read it.</li>
            <li>The classic trap: passing a <strong>new object every render</strong>{" "}as <code>value</code>,{" "}<code>{`value={{ user, setUser }}`}</code>,{" "}gives a fresh identity each time, so all consumers re-render even when nothing meaningful changed. <strong>Memoize the provider value</strong>{" "}with <code>useMemo</code>.</li>
            <li><strong>Split state and dispatch</strong>{" "}into two contexts: components that only dispatch don&apos;t re-render when the state value changes.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — useRef & imperative handles */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · useRef &amp; imperative handles</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A ref is a <strong>box that survives renders without triggering them</strong>,{" "}a stable <code>.current</code>{" "}slot React keeps for you across renders.</li>
            <li>Two uses: <strong>DOM refs</strong>{" "}(attach to a JSX element to read/focus the node) and <strong>instance variables</strong>{" "}(remember a timer id, a previous value, a flag, anything the UI doesn&apos;t render).</li>
            <li><strong>Mutating <code>.current</code>{" "}does not re-render.</strong>{" "}If a value should appear in the UI when it changes, it&apos;s state, not a ref.</li>
            <li>To let a parent call into a child, combine <code>forwardRef</code>{" "}+ <code>useImperativeHandle</code>{" "}to expose a <strong>small, deliberate imperative API</strong>{" "}(<code>{`{ focus, scrollIntoView }`}</code>) rather than the raw DOM node.</li>
            <li>Imperative is the <strong>escape hatch</strong>: reach for it when declarative props can&apos;t express the action (focus, scroll, media playback, measuring), not as a default.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Custom hooks */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Custom hooks</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A custom hook is <strong>just a function whose name starts with <code>use</code>{" "}and that calls other hooks.</strong>{" "}No special API, the <code>use</code>{" "}prefix is the contract that lets the lint rules check it.</li>
            <li>It shares <strong>logic, not state</strong>. Each caller that invokes the hook gets its <em>own independent</em>{" "}state, two components using <code>useToggle</code>{" "}have two separate toggles.</li>
            <li>Return shape matters: a <strong>tuple</strong>{" "}(<code>{`const [x, setX] = useThing()`}</code>) when callers rename freely and order is obvious; an <strong>object</strong>{" "}(<code>{`const { data, error } = useThing()`}</code>) when there are several named values.</li>
            <li><strong>Hooks compose</strong>: a custom hook can call other custom hooks, which is how you build up reusable behavior in layers.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — The rules of hooks */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · The rules of hooks</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Call hooks at the top level only</strong>,{" "}never inside conditions, loops, or nested functions, so they run in the <strong>same order every render</strong>.</li>
            <li>React has no names for your hooks. It pairs each call to a stored slot purely <strong>by call order</strong>, walking the <em>fiber hook list</em>{" "}position by position.</li>
            <li>Put a hook behind an <code>if</code>{" "}or in a loop and the order shifts between renders → every later hook reads the <strong>wrong slot</strong>, so state lands on the wrong hook and the UI corrupts silently.</li>
            <li>Only call hooks from <strong>React function components or other hooks</strong>,{" "}not plain functions or class methods.</li>
            <li><code>eslint-plugin-react-hooks</code>{" "}enforces these rules at lint time. It&apos;s catching real bugs, <strong>don&apos;t suppress it.</strong></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why did setState three times only bump the count once?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;State is a snapshot. <code>count</code>{" "}is captured at the start of the handler, so all three <code>setCount(count + 1)</code>{" "}calls queue &lsquo;set to the same captured value + 1&rsquo; and React batches them into one render. Use the functional updater <code>{`setCount(prev => prev + 1)`}</code>,{" "}each queued update sees the previous one&apos;s result, so the increments compose to three.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;when do I reach for useReducer over useState?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;When several fields are interdependent and their transitions must move together, the next state is a function of the current state plus an event. A reducer centralizes that logic in one pure function, makes transitions testable, and with a typed action union plus an exhaustiveness check the compiler flags any unhandled action. <code>useState</code>{" "}is just that reducer with a built-in &lsquo;replace&rsquo; action.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why does my whole context tree re-render?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Every consumer re-renders whenever the provider <code>value</code>{" "}changes by identity, there&apos;s no shallow check. Passing a fresh object literal each render gives a new identity every time, so everyone re-renders even when nothing meaningful changed. Memoize the value with <code>useMemo</code>, and split state and dispatch into separate contexts so dispatch-only consumers stay still.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;do two components sharing a custom hook share state?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;No. A custom hook shares <em>logic</em>, not state, calling it just runs its hook calls in the calling component, so each caller gets its own independent state. If you want them to share one value, lift that state up (or put it in context) and pass it in; the hook itself can&apos;t make two components share state.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why can&apos;t I call a hook inside an if?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;React pairs each hook call to a stored slot purely by call order, it walks the fiber hook list position by position, with no names. A conditional or looped hook changes how many hooks run between renders, so the call order shifts and every later hook reads the wrong slot; state lands on the wrong hook. <code>eslint-plugin-react-hooks</code>{" "}catches it, and you shouldn&apos;t suppress it.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Up next */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">Up next</h2>
        <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900/60 dark:bg-sky-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Phase 5, State, Forms &amp; Data.</strong>{" "}Now that you own the hooks, Phase 5 is about <em>where state lives and how data flows</em>: controlled vs uncontrolled inputs, forms &amp; validation, data fetching and the race-condition trap, server cache as its own category of state, and choosing between local, lifted, global, and URL state.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 5 and every later phase are live, keep going while the hooks model is fresh.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
