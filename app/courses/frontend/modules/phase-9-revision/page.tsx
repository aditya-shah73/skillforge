import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Course finale. Not a tutorial and not a single-phase reference card — this is
// the map of all nine phases, designed to be re-read end to end the morning of
// an interview. No Checkpoints, no XP gates.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-9-revision";

export default function Phase9RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 9 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 9 revision notes — and the course finale
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The last reference card — and a map of the whole journey. Re-read this the morning of the interview; click through to any phase whose lines don&apos;t land cold.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is it — the <strong>final module</strong>{" "}of Front-End Engineering Foundations. Fifty-five modules, nine phases, from <code>===</code>{" "}to system design. If you&apos;ve made it here, you didn&apos;t just learn React tricks — you built the mental models that let you <strong>explain front-end engineering cold</strong>, the kind of explanations that separate mid and senior engineers from everyone who only ever copied the snippet. <strong>Congratulations.</strong>{" "}Take a beat to notice how far that is from where you started.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          This card does something different from every revision module before it. Instead of consolidating one phase, it <strong>recaps all nine</strong>{" "}— the load-bearing idea from each, in the order you learned them. Read it top to bottom. Anything that makes you blink, click through to that phase&apos;s reference card and re-read it; anything that makes you nod, keep moving. By the end you&apos;ll have the whole course in your head at once — which is exactly the state you want to walk into the room in.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Phase 1 · JavaScript You Can Defend */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · JavaScript you can defend</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Values vs references.</strong>{" "}Primitives are copied by value; objects and arrays are copied by reference, which is why <code>[1] !== [1]</code>{" "}and why spreading the wrong level leaves a shared inner object that mutates behind your back.</li>
            <li><strong>Closures</strong>{" "}are functions that remember the scope they were defined in. They power the loop-counter classic, <code>let</code>{" "}vs <code>var</code>, debounce/throttle, and every React hook&apos;s persisted state.</li>
            <li><strong><code>this</code>{" "}is decided at the call site</strong>{" "}by four rules (default, implicit, explicit, <code>new</code>) — and arrow functions have no <code>this</code>{" "}of their own, so they inherit the enclosing one.</li>
            <li><strong>The event loop</strong>{" "}runs the call stack to empty, then drains <em>all</em>{" "}microtasks (promise callbacks), then one macrotask (<code>setTimeout</code>) — which is why <code>Promise.resolve().then</code>{" "}beats <code>setTimeout(0)</code>.</li>
            <li><strong>Async &amp; modules.</strong>{" "}Promises and <code>async</code>/<code>await</code>{" "}with <code>Promise.all</code>/<code>race</code>/<code>allSettled</code>{" "}and <code>AbortController</code>; ESM &amp; tree-shaking decide what actually ships to the browser.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-1-revision" className="text-cyan-600 hover:underline">Phase 1 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Phase 2 · TypeScript for React Engineers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · TypeScript for React engineers</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>TypeScript is structural</strong>{" "}— types match by shape, not by name. <code>any</code>{" "}turns off checking; <code>unknown</code>{" "}forces you to narrow before use; <code>never</code>{" "}is the type with no values.</li>
            <li><strong>Narrowing &amp; discriminated unions.</strong>{" "}A tagged union (<code>idle</code>/<code>loading</code>/<code>success</code>/<code>error</code>) models state machines, and a <code>never</code>{" "}exhaustiveness assert makes the compiler catch every case you forget to handle.</li>
            <li><strong>Generics</strong>{" "}let a function or component preserve the caller&apos;s type — <code>&lt;T&gt;</code>{" "}with constraints, defaults, and inference — instead of falling back to <code>any</code>.</li>
            <li><strong>Typing React</strong>{" "}is its own skill set: props and <code>children</code>, event handlers, refs, <code>forwardRef</code>, and the polymorphic <code>as</code>{" "}prop — the patterns interviewers reach for.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-2-revision" className="text-cyan-600 hover:underline">Phase 2 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Phase 3 · React Mental Model */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · The React mental model</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Reconciliation.</strong>{" "}JSX builds an element tree; React diffs it against the last one and applies the minimal DOM changes. <strong>Keys</strong>{" "}tell it which item is which — and <code>key={"{index}"}</code>{" "}on a reorderable list is a bug.</li>
            <li><strong>Re-render rules.</strong>{" "}A component re-renders when its state or props change; a fresh object/function prop defeats <code>memo</code>{" "}by reference. Most premature memoization makes things slower, not faster.</li>
            <li><strong>State is a snapshot.</strong>{" "}It&apos;s fixed for a given render; update immutably, use the functional updater (<code>setX(prev =&gt; …)</code>) when the next value depends on the last, and lean on automatic batching.</li>
            <li><strong>Effects synchronize</strong>{" "}your component with something outside React — they aren&apos;t lifecycle hooks. The deps array is a closure capture, cleanup undoes the sync, and most effects you write shouldn&apos;t exist.</li>
            <li><strong>Composition</strong>{" "}— <code>children</code>, render props, compound components — beats prop-drilling a wall of configuration.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-3-revision" className="text-cyan-600 hover:underline">Phase 3 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Phase 4 · Hooks in Depth */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Hooks in depth</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong><code>useState</code>{" "}is <code>useReducer</code>{" "}underneath.</strong>{" "}Graduate to a reducer when state is multi-field and interdependent, and type the action union so a new action can&apos;t be silently forgotten.</li>
            <li><strong><code>useContext</code></strong>{" "}re-renders <em>every</em>{" "}consumer when its value changes. The fixes: don&apos;t pass a fresh object each render, and split state from dispatch so updating one doesn&apos;t churn readers of the other.</li>
            <li><strong><code>useRef</code></strong>{" "}is a box that survives renders without causing them — for DOM access and instance variables — and <code>useImperativeHandle</code>{" "}exposes a controlled imperative API.</li>
            <li><strong>Custom hooks</strong>{" "}are just functions that call hooks; they share <em>logic</em>, not state. Each call gets its own independent state.</li>
            <li><strong>The rules of hooks</strong>{" "}exist because hooks are a per-fiber linked list read in order — call them conditionally and state lands on the wrong hook.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-4-revision" className="text-cyan-600 hover:underline">Phase 4 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Phase 5 · State, Forms & Data */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · State, forms &amp; data</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Controlled vs uncontrolled</strong>{" "}is about who owns the value: React state (<code>value</code>{" "}+ <code>onChange</code>, react to every keystroke) or the DOM (<code>defaultValue</code>{" "}+ ref, read on submit). File inputs are always uncontrolled.</li>
            <li><strong>Validation timing is UX</strong>{" "}— on-blur is the usual sweet spot, switching to on-change once a field is touched. Track touched/dirty/error so you don&apos;t shout at the user before they&apos;ve typed.</li>
            <li><strong>The fetch race condition</strong>: type fast, two requests fly, the older resolves last and overwrites the newer. Fix it in the effect cleanup with an <code>ignore</code>{" "}flag or an <code>AbortController</code>.</li>
            <li><strong>Server data is a cache, not state you own</strong>{" "}— React Query gives you that category: <code>queryKey</code>{" "}as identity, staleness, dedup, background refetch, and optimistic mutations with <code>invalidateQueries</code>.</li>
            <li><strong>Where state lives:</strong>{" "}server → a cache; shareable → the URL; one subtree → local, lifted to the closest common ancestor; truly distant → global. Most &quot;global state&quot; is really one of the first two.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-5-revision" className="text-cyan-600 hover:underline">Phase 5 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — Phase 6 · Advanced React Patterns */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · Advanced React patterns</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Memoization done right.</strong>{" "}<code>memo</code>{" "}skips a re-render when props are referentially equal; <code>useMemo</code>/<code>useCallback</code>{" "}keep those references stable. Profile first — and delete the memoization that does nothing.</li>
            <li><strong>Suspense &amp; concurrent features.</strong>{" "}Suspense is a boundary for loading UI; <code>useTransition</code>{" "}keeps the old UI interactive during a slow update, and <code>useDeferredValue</code>{" "}lets an expensive render lag behind the input.</li>
            <li><strong>Error boundaries</strong>{" "}catch render-time throws so one crash doesn&apos;t blank the page — class-only, can&apos;t catch events/async/SSR, and best placed granularly around independent widgets.</li>
            <li><strong>Portals</strong>{" "}render outside the DOM hierarchy (modals, tooltips) while keeping React context and event bubbling — pair with a focus trap for accessibility.</li>
            <li><strong>Advanced composition</strong>{" "}— slots / <code>asChild</code>, polymorphism, headless components — is how Radix-style libraries stay flexible without a sea of boolean props.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-6-revision" className="text-cyan-600 hover:underline">Phase 6 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Phase 7 · Next.js (App Router) Essentials */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">7 · Next.js App Router essentials</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Server vs Client Components.</strong>{" "}Server Components are the default and ship no JS; <code>&quot;use client&quot;</code>{" "}marks the interactive leaves and cascades to imports. Props crossing the boundary must be serializable.</li>
            <li><strong>File-based routing.</strong>{" "}The <code>app/</code>{" "}folder maps to routes; layouts persist across navigation; <code>loading.tsx</code>/<code>error.tsx</code>/<code>not-found.tsx</code>{" "}wire Suspense and error boundaries for you.</li>
            <li><strong>Server data loading.</strong>{" "}<code>await</code>{" "}directly in a Server Component, the extended <code>fetch</code>{" "}cache with <code>revalidate</code>, parallel loads — and this sidesteps the client race-condition class entirely.</li>
            <li><strong>Server Actions</strong>{" "}(<code>&quot;use server&quot;</code>) are mutations without an API layer: progressive-enhancement forms, <code>revalidatePath</code>/<code>revalidateTag</code>{" "}after a write, and <code>useFormStatus</code>/<code>useActionState</code>{" "}for pending and error UI.</li>
            <li><strong>Rendering strategies</strong>{" "}— static vs dynamic, ISR, streaming SSR with Suspense, and the Node vs Edge tradeoff. Know what flips a route dynamic.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-7-revision" className="text-cyan-600 hover:underline">Phase 7 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 8 — Phase 8 · Performance, A11y & DX */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">8 · Performance, a11y &amp; DX</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Core Web Vitals.</strong>{" "}LCP (load), CLS (layout shift), INP (interaction). Code-split, lazy-load, optimize images/fonts — and <em>measure before optimizing</em>; know whether it&apos;s a render problem or a network problem.</li>
            <li><strong>Accessibility</strong>{" "}starts with semantic HTML (a <code>&lt;div onClick&gt;</code>{" "}fails keyboard and screen-reader users). The first rule of ARIA is don&apos;t — reach for a real element first, then manage focus and names.</li>
            <li><strong>Accessible forms</strong>{" "}need programmatically associated labels, <code>aria-describedby</code>{" "}hints/errors, an error summary that moves focus, and announcements assistive tech actually hears.</li>
            <li><strong>Testing</strong>{" "}follows the trophy: test behavior not implementation, query by role/label the way a user does, mock the network not the component, and write the tests that give confidence.</li>
            <li><strong>Developer experience</strong>{" "}— ESLint + Prettier (different jobs), TS strict mode, pre-commit hooks and CI gates — are the small day-one investments that compound across a team.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">Re-read: <Link href="/courses/frontend/modules/phase-8-revision" className="text-cyan-600 hover:underline">Phase 8 revision card →</Link></li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 9 — Phase 9 · Interview Closers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">9 · Interview closers</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Front-end system design.</strong>{" "}Drive the whiteboard: clarify scope, sketch component architecture and data flow, choose state location and a fetching strategy, then narrate performance, accessibility, and tradeoffs out loud.</li>
            <li><strong>Debugging stories</strong>{" "}land in a fixed shape: symptom → investigation → root cause → fix → prevention. The course&apos;s classic bugs (closure-in-a-loop, stale closure, the fetch race, key-as-index) are ready-made STAR material.</li>
            <li><strong>Rapid-fire fundamentals</strong>{" "}— closures, <code>this</code>, the event loop, reconciliation, controlled vs uncontrolled, server cache vs state, Server vs Client Components — each in a tight, confident 60 seconds.</li>
            <li><strong>Coding challenges</strong>{" "}that recur: debounce/throttle, a custom hook, a small component from scratch, <code>Promise.all</code>{" "}from scratch — narrate approach, edge cases, and tradeoffs while you type.</li>
            <li><strong>Behavioral &amp; closing strong.</strong>{" "}STAR-structured answers, talking about tradeoffs and disagreement without sounding rigid, handling &quot;I don&apos;t know&quot; gracefully, and asking the questions that signal seniority.</li>
            <li className="pt-1 text-xs text-slate-500 dark:text-slate-400">This is the phase you&apos;re in — there&apos;s no separate card to re-read. You&apos;re reading the closer right now.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 10 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;walk me through what happens when React re-renders a list and an item moves&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;React diffs the new element tree against the previous one and reconciles the difference. <code>key</code>{" "}is how it matches an item across renders — same key, same element, just moved; different key, unmount and remount. That&apos;s why <code>key={"{index}"}</code>{" "}breaks a reorderable list: the keys stay <code>0,1,2</code>{" "}while the data shifts under them, so React reuses the wrong DOM nodes and component state lands on the wrong row. A stable id from the data fixes it.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;where does this piece of state belong?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I run it down a tree. Server data? Then it&apos;s a cache, not state — React Query. Shareable or bookmarkable, like filters or the active tab? The URL. Used by one subtree? Local state, lifted to the closest common ancestor, no higher. Only truly distant parts reading the same value justifies global, and even then it&apos;s usually Context or Zustand before Redux. Most &lsquo;global state&rsquo; turns out to be server cache or URL state once you name the category.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;Server Components vs Client Components — what&apos;s the difference?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Server Components are the default in the App Router — they run on the server, can fetch data with <code>await</code>{" "}directly, and ship zero JS to the browser. The moment I need interactivity — state, effects, event handlers — I mark that leaf <code>&quot;use client&quot;</code>, which cascades to its imports. The skill is pushing the boundary as far down as possible so only the genuinely-interactive bits ship JS. And props crossing the boundary have to be serializable.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;tell me about a hard bug you fixed&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I structure it symptom → investigation → root cause → fix → prevention. For example: a search box showed the wrong results when you typed fast. Investigating, I saw two requests in flight and the older one resolving last. Root cause was a classic race condition — stale response overwriting the current query. Fix was an <code>AbortController</code>{" "}in the effect cleanup; prevention was moving the feature onto React Query so the cache keys on the query and the whole class of bug disappears.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do you decide what to optimize for performance?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Measure first, always. I pull up Lighthouse or the profiler and find the single biggest offender against a real metric — LCP, CLS, INP, or a specific re-render. Then I ask whether it&apos;s a render problem or a network problem, because the fix is different: targeted <code>memo</code>{" "}and <code>useDeferredValue</code>{" "}for render work, code-splitting and image/font optimization for load. The thing I avoid is shotgun memoization that makes the code harder to read and the app no faster.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 11 — Finale */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">You made it</h2>
        <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>That&apos;s the whole course.</strong>{" "}Nine phases, from the JavaScript under the hood to the words you say in the room. You don&apos;t just know how to use React anymore — you understand <em>why</em>{" "}it works the way it does, and you can defend every choice. That&apos;s the foundation. It doesn&apos;t expire, and it&apos;s the thing every senior front-end engineer is built on.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            So go use it. <strong>Go ship something</strong>{" "}that puts these ideas to work, and <strong>go interview</strong>{" "}like someone who can explain the whole stack cold — because now you can. Be honest about tradeoffs, narrate your thinking, and let the foundation carry you. You&apos;re ready.
          </p>
          <p className="mt-4 text-sm text-slate-600 italic dark:text-slate-400">
            Thanks for going the distance.{" "}
            <Link href="/courses/frontend" className="text-rose-600 hover:underline dark:text-rose-400">Back to the course overview →</Link>
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
