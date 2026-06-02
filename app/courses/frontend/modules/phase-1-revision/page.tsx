import Link from "next/link";
import Callout from "@/components/Callout";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-1-revision";

export default function Phase1RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 1 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 1 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The JavaScript-foundations reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material, it is a <strong>map of Phase 1</strong>. Seven modules of JavaScript foundations, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/values-references" className="text-cyan-600 hover:underline">Values &amp; references</Link>,{" "}
          <Link href="/courses/frontend/modules/closures-scope" className="text-cyan-600 hover:underline">Closures &amp; scope</Link>,{" "}
          <Link href="/courses/frontend/modules/this-binding" className="text-cyan-600 hover:underline"><code>this</code>{" "}&amp; binding</Link>,{" "}
          <Link href="/courses/frontend/modules/prototypes-classes" className="text-cyan-600 hover:underline">Prototypes &amp; classes</Link>,{" "}
          <Link href="/courses/frontend/modules/event-loop" className="text-cyan-600 hover:underline">Event loop</Link>,{" "}
          <Link href="/courses/frontend/modules/async-patterns" className="text-cyan-600 hover:underline">Async patterns</Link>, and{" "}
          <Link href="/courses/frontend/modules/modules-bundlers" className="text-cyan-600 hover:underline">Modules &amp; bundlers</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Values & references */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · Values &amp; references</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Primitives</strong>{" "}(string, number, boolean, null, undefined, bigint, symbol) are compared and assigned <em>by value</em>. Two equal primitives are <code>===</code>.</li>
            <li><strong>Objects</strong>{" "}(plain objects, arrays, functions) are compared and assigned <em>by reference</em>. <code>[1] !== [1]</code>,{" "}different identities.</li>
            <li>Variables hold either a primitive value <em>or</em>{" "}a reference to an object. Passing &quot;the object&quot; to a function passes the reference; mutations are visible to the caller.</li>
            <li>Spreading clones one level only: <code>{`{ ...obj }`}</code>{" "}produces a new outer object, but nested objects still share references.</li>
            <li>React relies on reference equality. New props/state must be <em>new references</em>{" "}to trigger re-renders. Mutating in place is the most common React bug.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Closures & scope */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Closures &amp; scope</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Lexical scope</strong>: a name resolves where it was <em>written</em>, not where it was called. The scope chain walks outward through parent functions, ending at the global object.</li>
            <li><strong>Closure</strong>: a function keeps a live reference to the variables of every enclosing scope, even after those scopes finish executing. Functions <em>are</em>{" "}closures over their lexical environment.</li>
            <li><strong>The <code>var</code>{" "}graveyard</strong>: <code>var</code>{" "}is function-scoped (no block scope) and hoists. <code>let</code>/<code>const</code>{" "}are block-scoped. The classic <code>for (var i…)</code>{" "}closure bug, every callback sees the final <code>i</code>,{" "}vanishes with <code>let</code>.</li>
            <li><strong>Stale closure in React</strong>: an effect&apos;s callback closes over the props/state at the time it was created. Use the dependency array to refresh the closure or the functional <code>setState(prev =&gt; …)</code>{" "}to read fresh state.</li>
            <li><strong>Useful patterns</strong>: counter factory, debounce/throttle, IIFE for privacy, the module pattern, memoize.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — this & binding */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · <code>this</code>{" "}&amp; binding</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            The four rules, highest priority first:
          </p>
          <ol className="ml-5 list-decimal space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>new binding</strong>. <code>new Fn()</code>,{" "}<code>this</code>{" "}is the brand-new object.</li>
            <li><strong>explicit binding</strong>. <code>fn.call(ctx)</code>, <code>fn.apply(ctx)</code>, <code>fn.bind(ctx)()</code>,{" "}<code>this</code>{" "}is <code>ctx</code>.</li>
            <li><strong>implicit binding</strong>. <code>obj.fn()</code>,{" "}<code>this</code>{" "}is <code>obj</code>. The dot in front of the call is the giveaway.</li>
            <li><strong>default binding</strong>. Standalone <code>fn()</code>,{" "}<code>this</code>{" "}is <code>undefined</code>{" "}in strict mode (modules are strict by default), the global object otherwise.</li>
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Arrow functions have no <code>this</code>.</strong>{" "}They inherit it lexically from the surrounding scope. None of the four rules apply to them. This is exactly why React class handlers had to <code>.bind(this)</code>{" "}or use arrow-as-class-field, to keep <code>this</code>{" "}as the component when the handler ran as an event callback.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Most &quot;<code>this</code>{" "}is undefined&quot; bugs come from passing a method as a callback: the dot is lost, implicit binding evaporates, default binding kicks in.
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Prototypes & classes */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Prototypes &amp; classes</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Every object has an internal <code>[[Prototype]]</code>,{" "}a hidden pointer to another object, the next link in the chain. <code>Object.getPrototypeOf(obj)</code>{" "}reads it.</li>
            <li><strong>Property lookup</strong>: when you read <code>obj.foo</code>, JS checks <code>obj</code>; if missing, it follows the prototype chain upward until <code>null</code>. The first hit wins.</li>
            <li><strong>Writes</strong>{" "}always land on the object itself (shadowing the prototype). Prototype properties are not modified by assignment to an instance.</li>
            <li><strong><code>new Ctor(...)</code>{" "}in 4 steps</strong>: (1) create <code>{`{}`}</code>; (2) set its prototype to <code>Ctor.prototype</code>; (3) call <code>Ctor</code>{" "}with <code>this</code>{" "}as that object; (4) return the object (or whatever the constructor returns, if it&apos;s an object).</li>
            <li><strong><code>class</code>{" "}is sugar</strong>{" "}over functions + prototypes. Methods live on <code>Class.prototype</code>; <code>extends</code>{" "}sets up the prototype chain; <code>super</code>{" "}walks up it.</li>
            <li><strong><code>instanceof</code></strong>{" "}walks the prototype chain looking for <code>Ctor.prototype</code>. It&apos;s not about constructors, it&apos;s about reachability of a prototype.</li>
            <li>React moved off classes because hooks compose cleanly without binding, <code>this</code>, or HOC pyramids, but classes still exist in the language and on legacy codebases.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Event loop */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Event loop</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">The runtime, in pieces:</p>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Call stack</strong>,{" "}LIFO frames currently running. One thread.</li>
            <li><strong>Host APIs</strong>,{" "}<code>setTimeout</code>, <code>fetch</code>, DOM events. Run off-thread; hand callbacks back to JS.</li>
            <li><strong>Macrotask queue</strong>,{" "}FIFO. <code>setTimeout</code>, <code>setInterval</code>, I/O events, messages.</li>
            <li><strong>Microtask queue</strong>,{" "}FIFO, higher priority. <code>Promise.then/catch/finally</code>, <code>queueMicrotask</code>, <code>MutationObserver</code>.</li>
          </ul>
          <p className="mt-4 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">The loop, exactly:</p>
          <ol className="ml-5 list-decimal space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Run current JS to completion (drain the call stack).</li>
            <li>Drain the <em>entire</em>{" "}microtask queue, including ones added during the drain.</li>
            <li>Render (browser only, at an appropriate point).</li>
            <li>Take <em>one</em>{" "}task from the macrotask queue, run it.</li>
            <li>Go to 2.</li>
          </ol>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            Consequence: <code>Promise.resolve().then(…)</code>{" "}always runs before <code>setTimeout(…, 0)</code>,{" "}the microtask queue drains exhaustively between macrotasks.
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — Async patterns */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · Async patterns</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>A Promise has three states</strong>: pending, fulfilled, rejected. Settled = fulfilled or rejected. Once settled, never changes.</li>
            <li><code>.then</code>{" "}returns a <em>new</em>{" "}Promise. Whatever its callback returns becomes the next promise&apos;s value. Throwing inside a <code>.then</code>{" "}rejects the next one.</li>
            <li><code>async</code>/<code>await</code>{" "}is sugar over <code>.then</code>. <code>await</code>{" "}only pauses inside <code>async</code>. <code>try</code>/<code>catch</code>{" "}handles rejections.</li>
            <li><strong><code>fetch</code>{" "}does NOT reject on HTTP error</strong>. It only rejects on network failure. Check <code>res.ok</code>{" "}or <code>res.status</code>{" "}yourself.</li>
            <li><strong>Sequential vs parallel</strong>: a chain of <code>await</code>{" "}runs serially; <code>Promise.all([a, b])</code>{" "}runs them concurrently. Always ask: do these depend on each other?</li>
          </ul>
          <p className="mt-4 mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">The four combinators:</p>
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><code>Promise.all</code>,{" "}resolves when <em>all</em>{" "}fulfill; rejects on the <em>first</em>{" "}rejection (others continue running but their results are discarded).</li>
            <li><code>Promise.allSettled</code>,{" "}resolves with one <code>{`{status, value|reason}`}</code>{" "}per input, no matter who failed. Used when you need every outcome.</li>
            <li><code>Promise.race</code>,{" "}resolves/rejects with the first to settle (fastest wins, even if it&apos;s a rejection). Used for timeouts.</li>
            <li><code>Promise.any</code>,{" "}resolves with the first to fulfill (failures ignored unless ALL fail, then <code>AggregateError</code>). Used for redundant sources.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>AbortController</strong>{" "}is the cancellation contract: create one, pass <code>controller.signal</code>{" "}to <code>fetch</code>, call <code>controller.abort()</code>{" "}to cancel. The typeahead/cleanup-stale-request pattern every React app needs.
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Modules & bundlers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">7 · Modules &amp; bundlers</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>ESM</strong>{" "}(<code>import</code>/<code>export</code>) is static, analyzable at parse time. <strong>CommonJS</strong>{" "}(<code>require</code>) is dynamic, runtime function call. ESM enables tree-shaking; CJS rarely does.</li>
            <li><strong>Tree-shaking</strong>{" "}drops unreachable named exports. It requires ESM + no side effects + named (not namespace) imports.</li>
            <li><strong>Side effects</strong>{" "}are top-level code that runs by being imported. Packages declare safety with <code>&quot;sideEffects&quot;: false</code>{" "}in <code>package.json</code>.</li>
            <li><strong>Namespace imports</strong>{" "}(<code>import * as X</code>) kill tree-shaking, the bundler can&apos;t prove which properties of <code>X</code>{" "}you&apos;ll use. Prefer named imports.</li>
            <li><strong>Code-splitting</strong>{" "}uses dynamic <code>import()</code>,{" "}each becomes a separate chunk loaded on demand. React: <code>React.lazy</code>{" "}+ <code>&lt;Suspense&gt;</code>. Next.js: <code>next/dynamic</code>.</li>
            <li><strong>Next.js build output</strong>: <em>Size</em>{" "}is route-only; <em>First Load JS</em>{" "}is route + shared baseline (what the user actually downloads cold). Target &lt;100KB; investigate &gt;200KB.</li>
            <li><strong>Audit tools</strong>: <code>@next/bundle-analyzer</code>{" "}for a treemap; <code>npx browserslist</code>{" "}to see compile targets; <code>optimizePackageImports</code>{" "}to defang barrel files.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 8 — 60-second interview soundbites */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">8 · 60-second soundbites</h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Practice saying each of these out loud. If you stumble, jump back to the source module.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;Why does <code>[1] !== [1]</code>?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Arrays are objects, compared by reference. <code>[1]</code>{" "}on each side creates a brand-new array, different identities, even though they look the same. <code>===</code>{" "}asks &quot;same identity?&quot;, not &quot;same shape?&quot; The only way to compare by shape is a structural check (<code>JSON.stringify</code>{" "}or a deep-equal helper).
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;What is a closure?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              A closure is a function plus the variables in scope where it was defined. Because JS uses lexical scope, an inner function holds a live reference to outer variables, even after the outer function has returned. That&apos;s the mechanic behind counters, debounce, every React hook, and the classic <code>var</code>{" "}in a loop bug.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;What is <code>this</code>?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <code>this</code>{" "}is decided at <em>call site</em>, not definition. Four rules, highest first: <code>new</code>{" "}beats explicit (<code>call/apply/bind</code>) beats implicit (the dot before the call) beats default (undefined in strict mode). Arrow functions skip the rules entirely and inherit <code>this</code>{" "}lexically.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;What does <code>new</code>{" "}actually do?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Four steps: create an empty object, set its prototype to <code>Ctor.prototype</code>, call <code>Ctor</code>{" "}with <code>this</code>{" "}as that object, return the object (unless the constructor returns its own object). <code>class</code>{" "}is sugar over functions and prototypes, the chain is still there.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;Why does <code>Promise.then</code>{" "}beat <code>setTimeout(0)</code>?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              Two queues. <code>setTimeout</code>{" "}schedules a <em>macrotask</em>. <code>.then</code>{" "}schedules a <em>microtask</em>. The event loop drains the <strong>entire</strong>{" "}microtask queue between every single macrotask. So even a 0ms timer waits behind every promise callback already in flight.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;<code>Promise.all</code>{" "}vs <code>allSettled</code>?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <code>Promise.all</code>{" "}is fail-fast: one rejection rejects the whole thing. <code>Promise.allSettled</code>{" "}waits for everything and reports a status/value for each. Use <code>all</code>{" "}when partial success is useless (load X AND Y or fail). Use <code>allSettled</code>{" "}when partial success matters (load up to 10 widgets, render what worked).
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase">&quot;What makes ESM tree-shakable?&quot;</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              ESM imports and exports are static, declared at the top level with literal names. The bundler can parse the file without running it and build the full dependency graph. Unused named exports are provably dead, so they get dropped. CommonJS&apos;s <code>require()</code>{" "}is a runtime function call, opaque to static analysis, so the bundler ships everything.
            </p>
          </div>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 9 — Gotchas to flag in interviews */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">9 · The gotcha cheat sheet</h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          Things that catch even experienced devs. If an interview snippet hits one of these, name it.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="px-2 py-2 text-left">Snippet pattern</th>
                <th className="px-2 py-2 text-left">What bites</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>arr.push(x); setState(arr)</code></td>
                <td className="px-2 py-2">Mutated in place, same reference, React skips the re-render. Use <code>setState([...arr, x])</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>{`for (var i = 0; …) setTimeout(() => log(i))`}</code></td>
                <td className="px-2 py-2">Every callback logs the final <code>i</code>,{" "}shared <code>var</code>. Switch to <code>let</code>.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>el.addEventListener(&quot;click&quot;, obj.method)</code></td>
                <td className="px-2 py-2">The dot is lost, <code>this</code>{" "}defaults to the element (or undefined). Bind, or wrap in arrow.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>useEffect(() =&gt; log(count), [])</code></td>
                <td className="px-2 py-2">Stale closure: logs the count from first render forever. Add <code>count</code>{" "}to deps.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>const res = await fetch(url); res.json()</code></td>
                <td className="px-2 py-2"><code>fetch</code>{" "}doesn&apos;t reject on 404/500. Check <code>res.ok</code>{" "}first.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>Promise.all([a, b]).catch(…)</code></td>
                <td className="px-2 py-2">Fail-fast: one reject discards the other&apos;s result. Use <code>allSettled</code>{" "}if you wanted both.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>{`for (const x of items) await fetchOne(x)`}</code></td>
                <td className="px-2 py-2">Serial, 10 items × 200ms = 2s. Use <code>Promise.all(items.map(fetchOne))</code>{" "}if independent.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>setTimeout(fn, 0); Promise.resolve().then(g)</code></td>
                <td className="px-2 py-2"><code>g</code>{" "}runs before <code>fn</code>. Microtasks drain between macrotasks.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="px-2 py-2"><code>{`import * as _ from "lodash"`}</code></td>
                <td className="px-2 py-2">Defeats tree-shaking. Use named imports, or <code>lodash-es</code>{" "}deep imports.</td>
              </tr>
              <tr>
                <td className="px-2 py-2"><code>arrow = () =&gt; this.x</code>{" "}in a method</td>
                <td className="px-2 py-2">Arrow inherits <code>this</code>{" "}lexically, handy in handlers, but DON&apos;T define methods as arrows on a class prototype (they bind once, forever).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Callout variant="insight" title="One sentence to take into the interview">
        Almost every JavaScript &quot;weirdness&quot; in an interview snippet is one of: reference-vs-value, lexical scope/closure, <code>this</code>{" "}call-site rules, prototype lookup, or microtask-vs-macrotask ordering. Name the rule out loud, then walk the example. The interviewer cares about the explanation more than the answer.
      </Callout>

      <section className="not-prose mt-12">
        <h2 className="mb-3 text-2xl font-bold">What&apos;s next</h2>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          You&apos;ve closed Phase 1, the JavaScript foundations every interviewer probes. The next phase moves from JS to <strong>TypeScript</strong>, then into the <strong>React mental model</strong>{" "}(reconciliation, the render cycle, why hooks have rules) and <strong>hooks in depth</strong>{" "}(<code>useState</code>{" "}internals, dependency arrays, custom hooks, the suspense story). The shape of each module, analogy, formula, worked example, checkpoint, stays the same.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
