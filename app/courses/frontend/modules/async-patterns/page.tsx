import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "async-patterns";

const CHECKPOINTS = [
  { id: "cp-states", title: "Promise states and error propagation" },
  { id: "cp-combinators", title: "Promise.all / race / allSettled / any" },
  { id: "cp-cancel", title: "Cancellation with AbortController" },
];

export default function AsyncPatternsModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Promises, <code>async</code>/<code>await</code>, and the patterns interviewers ask about
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Every real React app deals with concurrent requests, race conditions, and cancellations. These are the four combinators and one pattern that solve 95% of it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine you&apos;re ordering food from four different restaurants for a dinner party. Each one has its own delivery time. There are four ways to handle the situation:
        </p>
        <ul>
          <li><strong><code>Promise.all</code></strong>,{" "}wait until <em>all four</em>{" "}arrive. If any one fails (the restaurant ran out), the whole dinner is ruined and you go to a backup plan.</li>
          <li><strong><code>Promise.allSettled</code></strong>,{" "}wait until all four resolve <em>or</em>{" "}fail individually. Then you know the status of each. The dinner happens with whichever showed up.</li>
          <li><strong><code>Promise.race</code></strong>,{" "}take the first one that arrives, regardless of whether it&apos;s success or failure. Useful for timeouts: race the fetch against a 5-second timer.</li>
          <li><strong><code>Promise.any</code></strong>,{" "}take the first one that <em>succeeds</em>. Failures are tolerated as long as at least one delivery comes through. Useful for racing redundant servers.</li>
        </ul>
        <p>
          Each combinator answers a different question about concurrency. Once you can map your real problem (timeout? all-or-nothing? best-effort?) to the right combinator, you stop writing custom orchestration code.
        </p>
      </section>

      <section>
        <h2>The formula: Promise states and how <code>.then</code>/<code>.catch</code>{" "}propagate</h2>
        <p>A Promise is always in exactly one of three states:</p>
        <ul>
          <li><strong>pending</strong>,{" "}work hasn&apos;t finished.</li>
          <li><strong>fulfilled</strong>,{" "}work finished, has a value.</li>
          <li><strong>rejected</strong>,{" "}work failed, has a reason.</li>
        </ul>
        <p>Once a promise transitions out of <code>pending</code>, the state is fixed forever. Calling <code>resolve</code>{" "}or <code>reject</code>{" "}a second time is a no-op.</p>
        <p>
          The chain rules (memorize these, every promise question reduces to applying them):
        </p>
        <ol>
          <li><code>.then(onFulfilled)</code>{" "}runs <code>onFulfilled</code>{" "}only if the previous promise is fulfilled. Returns a new promise that resolves with whatever <code>onFulfilled</code>{" "}returns.</li>
          <li><code>.then(onFulfilled, onRejected)</code>,{" "}two-arg form. <code>onRejected</code>{" "}handles rejection if it came from <em>above</em>{" "}<code>.then</code>, but does NOT catch errors thrown inside <code>onFulfilled</code>,{" "}for that you need a separate <code>.catch</code>.</li>
          <li><code>.catch(onRejected)</code>{" "}is syntax sugar for <code>.then(undefined, onRejected)</code>. Catches any rejection from anywhere earlier in the chain.</li>
          <li>An error thrown inside any <code>.then</code>/<code>.catch</code>{" "}callback creates a rejected promise. The rejection skips down the chain until it hits a <code>.catch</code>{" "}(or falls off the end as an unhandled rejection).</li>
          <li><code>.finally(fn)</code>{" "}runs whether the promise fulfills or rejects. Doesn&apos;t change the resolved value or rejection reason, useful for cleanup (closing a loading spinner).</li>
        </ol>

        <pre><code>{`Promise.resolve(1)
  .then(v => v + 1)        // 2
  .then(v => { throw new Error("boom"); })
  .then(v => v * 10)       // skipped — chain is rejected
  .catch(err => {
    console.log("caught:", err.message); // "caught: boom"
    return 100;            // rejection healed; chain returns to fulfilled state
  })
  .then(v => console.log(v)); // 100`}</code></pre>
        <p>
          The <code>.catch</code>{" "}didn&apos;t just log the error, it <em>returned 100</em>, which becomes the fulfilled value for the next <code>.then</code>. This is &quot;rejection handling resets the chain to fulfilled.&quot; If you want the chain to remain rejected, re-throw or return <code>Promise.reject(...)</code>.
        </p>

        <Quiz
          question="Predict the output: `Promise.reject('a').then(v => console.log('a:', v)).then(v => console.log('b:', v)).catch(e => console.log('c:', e));`"
          kind="Predict the output"
          options={[
            { label: "a: undefined, b: undefined, c: undefined", explanation: "The reject('a') skips BOTH .then handlers, neither runs." },
            { label: "c: a", correct: true, explanation: "Right. The rejected state skips both .then handlers (their onFulfilled isn't called) and lands at .catch with the original reason 'a'." },
            { label: "a: a, then c: a", explanation: ".then with one arg doesn't catch rejections, the first .then skips." },
            { label: "c: undefined", explanation: ".catch receives the rejection reason ('a'), not undefined." },
          ]}
        />
      </section>

      <section>
        <h2><code>async</code>/<code>await</code>{" "}+ <code>try</code>/<code>catch</code></h2>
        <p>
          Once you have <code>async</code>/<code>await</code>, error handling switches to standard <code>try</code>/<code>catch</code>:
        </p>
        <pre><code>{`async function loadUser(id) {
  try {
    const res = await fetch("/api/users/" + id);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.error("Failed to load user:", err);
    throw err; // re-throw so the caller knows
  }
}`}</code></pre>
        <Callout variant="warn" title="`fetch` does NOT reject on HTTP errors">
          <p className="m-0">A 404 or 500 response is a <em>successful fetch</em>{" "}from the network&apos;s point of view, the request completed. <code>fetch</code>{" "}only rejects on network errors (DNS failures, offline, CORS blocks). You must check <code>res.ok</code>{" "}and throw manually for 4xx/5xx, or use a wrapper like <code>axios</code>{" "}that does it for you. Forgetting this is the #1 bug interviewers ask candidates to spot.</p>
        </Callout>

        <h3>Sequential vs parallel</h3>
        <p>This pair of snippets is the most-asked async question after the event loop:</p>
        <pre><code>{`// Sequential — ~600ms total
async function sequential() {
  const a = await fetch("/a"); // 200ms
  const b = await fetch("/b"); // 200ms
  const c = await fetch("/c"); // 200ms
  return [a, b, c];
}

// Parallel — ~200ms total
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetch("/a"),
    fetch("/b"),
    fetch("/c"),
  ]);
  return [a, b, c];
}`}</code></pre>
        <p>
          Sequential is the classic accidental performance bug, three requests that don&apos;t depend on each other shouldn&apos;t wait in a chain. The interviewer wants to hear: &quot;these are independent, so I&apos;d kick them off in parallel with <code>Promise.all</code>,{" "}the page loads in 200ms instead of 600.&quot;
        </p>
      </section>

      <section>
        <h2>The four combinators in depth</h2>

        <h3><code>Promise.all([p1, p2, ...])</code></h3>
        <p>Resolves with an array of all results when every promise resolves. Rejects immediately on the first rejection.</p>
        <pre><code>{`Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(values => console.log(values)); // [1, 2, 3]

Promise.all([
  Promise.resolve(1),
  Promise.reject("boom"),
  Promise.resolve(3),
]).catch(err => console.log("err:", err)); // "err: boom"  — third promise still runs, but result is ignored`}</code></pre>
        <p>Use when: every result is needed; failure of any one means the operation as a whole failed.</p>

        <h3><code>Promise.allSettled([p1, p2, ...])</code></h3>
        <p>Waits for all promises to settle (resolve <em>or</em>{" "}reject). Returns an array of <code>{`{ status: 'fulfilled', value }`}</code>{" "}or <code>{`{ status: 'rejected', reason }`}</code>{" "}objects.</p>
        <pre><code>{`const results = await Promise.allSettled([
  fetch("/api/posts"),
  fetch("/api/comments"),
  fetch("/api/ads"),       // failing this shouldn't kill the page
]);
const ok = results.filter(r => r.status === "fulfilled").map(r => r.value);`}</code></pre>
        <p>Use when: partial success is fine; you want to know which subset worked. The most under-used combinator in real apps.</p>

        <h3><code>Promise.race([p1, p2, ...])</code></h3>
        <p>Resolves or rejects as soon as the first promise settles (whichever way it goes).</p>
        <pre><code>{`function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}
// Cancels effectively after 5s if the real fetch hasn't finished
await withTimeout(fetch("/slow"), 5000);`}</code></pre>
        <p>Use when: you want the fastest answer, or you&apos;re building a timeout. (Modern alternative for the timeout case: <code>AbortSignal.timeout(5000)</code>,{" "}covered below.)</p>

        <h3><code>Promise.any([p1, p2, ...])</code></h3>
        <p>Resolves with the first <em>fulfilled</em>{" "}promise. Rejects only if ALL promises reject (with an <code>AggregateError</code>).</p>
        <pre><code>{`// Race redundant CDNs — take whichever responds first
const data = await Promise.any([
  fetch("https://cdn-a.example/data"),
  fetch("https://cdn-b.example/data"),
  fetch("https://cdn-c.example/data"),
]);`}</code></pre>
        <p>Use when: any successful result is good; failures of others should be tolerated.</p>

        <Quiz
          question="You're loading the user profile, recent posts, and unread notifications on dashboard mount. The page should render with whatever loaded; failed sections should show an error block. Which combinator?"
          kind="Quick check"
          options={[
            { label: "Promise.all", explanation: "If any one fails, all-or-nothing kicks in, but you want partial-success behavior." },
            { label: "Promise.race", explanation: "Race takes the first to settle, discarding the others. Wrong primitive for partial success." },
            { label: "Promise.allSettled", correct: true, explanation: "Right. allSettled waits for everything, returns success-or-error for each. You can render the loaded sections and show errors for the failed ones." },
            { label: "Promise.any", explanation: "Any takes the first SUCCESS, discarding the others. You'd lose the data from later resolutions." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-states"
        title="Promise states and error propagation"
        celebration="Async error handling is now systematic, not guesswork."
      >
        <Quiz
          question="`async function f() { throw new Error('a'); } f().then(() => console.log('1')).catch(e => console.log('2:', e.message));` logs…"
          kind="Defend it"
          options={[
            { label: "1", explanation: "Throwing inside an async function returns a rejected promise, .then's onFulfilled is skipped." },
            { label: "2: a", correct: true, explanation: "Right. Async functions wrap throws into rejected promises. The .then's onFulfilled is skipped; .catch receives the error." },
            { label: "Uncaught error", explanation: ".catch handles it, no uncaught rejection." },
            { label: "Both 1 and 2", explanation: ".then's onFulfilled doesn't run for a rejected upstream promise; only one path fires." },
          ]}
        />
        <Quiz
          question="What does `Promise.reject('x').then(v => v).then(v => v).catch(e => e)` resolve with?"
          kind="Defend it"
          options={[
            { label: "undefined", explanation: ".catch handler returns 'x', that becomes the new fulfilled value." },
            { label: "'x'", correct: true, explanation: "Right. Both .then handlers are skipped (rejected state propagates). .catch receives 'x' and returns it, which fulfills the chain with 'x'." },
            { label: "An Error object", explanation: "We rejected with the string 'x', not an Error instance. Both work as rejection reasons." },
            { label: "It throws unhandled", explanation: ".catch handles it, no unhandled rejection." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Cancellation: <code>AbortController</code></h2>
        <p>
          The most-asked &quot;real-world&quot; pattern: how do you cancel a fetch when the user navigates away or types a new search query? <code>AbortController</code>{" "}is the standard tool, supported in <code>fetch</code>{" "}directly, and broadly available across the modern web API surface.
        </p>
        <pre><code>{`const controller = new AbortController();

fetch("/api/search?q=hello", { signal: controller.signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Cancelled — user moved on");
    } else {
      console.error("Real error:", err);
    }
  });

// later, before the fetch resolves:
controller.abort();
// the fetch rejects with an AbortError`}</code></pre>
        <p>
          The pattern in React:
        </p>
        <pre><code>{`useEffect(() => {
  const controller = new AbortController();
  fetch("/api/search?q=" + query, { signal: controller.signal })
    .then(res => res.json())
    .then(setResults)
    .catch(err => {
      if (err.name !== "AbortError") setError(err);
    });
  return () => controller.abort();   // cancel on unmount or query change
}, [query]);`}</code></pre>
        <p>
          This single pattern fixes the classic &quot;type fast, see results out of order&quot; bug. Without abort, three rapid keypresses fire three fetches; whichever resolves last (which might be the second-to-last query) overwrites state. With abort, the cleanup function cancels the previous fetch on every query change, only the latest request can land.
        </p>

        <h3>Composing aborts</h3>
        <p>The modern API also gives you ergonomic helpers:</p>
        <pre><code>{`// Timeout via AbortSignal.timeout — no manual setTimeout/race needed
fetch("/slow", { signal: AbortSignal.timeout(5000) });

// Combine multiple signals — abort if EITHER cancels
const userCancel = new AbortController();
const signal = AbortSignal.any([userCancel.signal, AbortSignal.timeout(5000)]);
fetch("/slow", { signal });`}</code></pre>
        <p>
          <code>AbortSignal.timeout</code>{" "}is the cleaner replacement for the <code>Promise.race</code>{" "}timeout pattern from earlier in the module. <code>AbortSignal.any</code>{" "}is newer (Chrome 116+, Safari 17.4+) but extremely useful, combine a user-triggered cancel with a deadline.
        </p>

        <Callout variant="warn" title="Abort error type is fragile to identify">
          <p className="m-0">By convention, aborted fetches reject with a <code>DOMException</code>{" "}of name <code>&quot;AbortError&quot;</code>. Always identify via <code>err.name === &quot;AbortError&quot;</code>{" "}or <code>err instanceof DOMException</code>,{" "}don&apos;t check <code>instanceof AbortError</code>{" "}(no such constructor exists in the browser globals). This is the kind of detail interviewers grill on.</p>
        </Callout>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-combinators"
        title="Promise.all / race / allSettled / any"
        celebration="You can pick the right concurrency primitive in 5 seconds."
      >
        <Quiz
          question="You're loading 3 critical resources to start the app. If any fails, the app can't function. The right combinator is…"
          kind="Defend it"
          options={[
            { label: "Promise.all", correct: true, explanation: "Right. All resources are required, if any one fails, the operation as a whole fails. all rejects immediately on first failure." },
            { label: "Promise.allSettled", explanation: "allSettled tolerates partial failure, you'd never know whether any failed in a way that mattered." },
            { label: "Promise.race", explanation: "race takes the first to settle, you'd ignore the others' results." },
            { label: "Promise.any", explanation: "any takes the first SUCCESS, you'd happily proceed with one resource, ignoring the others." },
          ]}
        />
        <Quiz
          question="Why does combining `AbortController` with a `useEffect` cleanup prevent stale-data bugs in a typeahead search?"
          kind="Defend it"
          options={[
            { label: "Aborting frees memory on the network worker", explanation: "GC isn't the issue, the issue is which response sets state last." },
            { label: "Each new query change triggers cleanup, which aborts the previous fetch; only the latest query's response can resolve and set state", correct: true, explanation: "Right. Without abort, all in-flight fetches eventually resolve and race to set state; whichever resolves last wins, regardless of when it was kicked off. Abort kills the older ones." },
            { label: "AbortController batches state updates", explanation: "Batching is React 18's concern, separate mechanism." },
            { label: "useEffect won't run again if there's an active controller", explanation: "useEffect runs every time deps change, the abort is what handles the cleanup of the prior run." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Variants that show up in interviews</h2>

        <h3>1. The unhandled rejection</h3>
        <pre><code>{`// Bad
fetch("/data").then(res => res.json()).then(setData);
// no .catch — if fetch throws (offline), React doesn't render an error UI;
// the browser logs "Uncaught (in promise)" and the user sees stale state.

// Good
fetch("/data").then(res => res.json()).then(setData).catch(setError);`}</code></pre>
        <p>
          Always terminate a promise chain. The browser will warn loudly about unhandled rejections in dev tools, but in production users see a hang. Lint rules like <code>@typescript-eslint/no-floating-promises</code>{" "}catch this for you.
        </p>

        <h3>2. The await-in-loop trap</h3>
        <pre><code>{`// Sequential — slow
async function loadAll(ids) {
  const results = [];
  for (const id of ids) {
    results.push(await fetch("/u/" + id));   // each waits for the previous
  }
  return results;
}

// Parallel — fast
async function loadAll(ids) {
  return Promise.all(ids.map(id => fetch("/u/" + id)));
}`}</code></pre>
        <p>
          The for-loop version is rarely what you want for independent requests. The lint rule <code>no-await-in-loop</code>{" "}flags it. Exception: when you genuinely need each iteration&apos;s result before starting the next (rate limiting, dependent reads, batch APIs).
        </p>

        <h3>3. <code>Promise.all</code>{" "}+ early rejection caveat</h3>
        <pre><code>{`await Promise.all([
  fetch("/a"),      // succeeds at 100ms
  Promise.reject("boom"),  // rejects at 0ms
  fetch("/c"),      // STILL RUNS — Promise.all doesn't abort the others
]);`}</code></pre>
        <p>
          <code>Promise.all</code>{" "}rejects immediately when the first promise rejects, but the other in-flight promises <em>continue to run</em>. If you need to cancel them, you have to wire them up to a shared <code>AbortController</code>{" "}and abort it from the rejection handler. Modern alternative: <code>Promise.allSettled</code>{" "}+ filter, wait for everything, then handle errors per-result.
        </p>
      </section>

      <section>
        <h2>The project: implement <code>Promise.all</code>{" "}+ <code>Promise.race</code>{" "}+ cancellable fetch</h2>
        <Callout variant="insight" title="How to do this project">
          <p className="mb-2">Build each from scratch in a Node REPL or browser console. Test against the real built-in to verify behavior matches.</p>
          <ol className="m-0">
            <li>Implement, then test with success cases.</li>
            <li>Test with failure cases (one promise rejects, all reject, etc.).</li>
            <li>Test edge cases (empty array, mixed promises and plain values).</li>
          </ol>
        </Callout>

        <h3>Part 1: <code>myAll(promises)</code></h3>
        <pre><code>{`myAll([Promise.resolve(1), Promise.resolve(2)]).then(v => console.log(v)); // [1, 2]
myAll([Promise.resolve(1), Promise.reject("x")]).catch(e => console.log(e)); // "x"
myAll([]).then(v => console.log(v)); // []`}</code></pre>
        <p>Hints:</p>
        <ul>
          <li>Return a new promise. Track a results array and a counter.</li>
          <li>For each input, attach <code>.then</code>,{" "}on success, write to the matching index; on the last write, resolve with the full array.</li>
          <li>On any reject, reject the outer promise with that reason. (You can&apos;t un-reject later, first reject wins.)</li>
          <li>Handle non-promise inputs (treat them as already-resolved values).</li>
        </ul>

        <h3>Part 2: <code>myRace(promises)</code></h3>
        <pre><code>{`myRace([
  new Promise(r => setTimeout(() => r("slow"), 100)),
  new Promise(r => setTimeout(() => r("fast"), 50)),
]).then(v => console.log(v)); // "fast"

myRace([
  new Promise((_, r) => setTimeout(() => r("err"), 50)),
  new Promise(r => setTimeout(() => r("late"), 100)),
]).catch(e => console.log(e)); // "err" (first to settle wins, even if rejected)`}</code></pre>
        <p>Hints: return a new promise, attach <code>.then(resolve, reject)</code>{" "}to every input. First settle wins; subsequent settles are no-ops.</p>

        <h3>Part 3: cancellable fetch wrapper</h3>
        <p>Wrap <code>fetch</code>{" "}so callers can cancel without juggling an <code>AbortController</code>{" "}themselves:</p>
        <pre><code>{`const { promise, cancel } = fetchCancellable("/api/data");
promise.then(setData).catch(err => {
  if (err.name === "AbortError") console.log("cancelled");
  else console.error(err);
});

// elsewhere, when needed:
cancel();`}</code></pre>
        <p>Hints:</p>
        <ul>
          <li>Create an <code>AbortController</code>{" "}internally.</li>
          <li>Call <code>fetch(url, {`{ signal: controller.signal }`})</code>.</li>
          <li>Return <code>{`{ promise: fetch(...), cancel: () => controller.abort() }`}</code>.</li>
          <li>Bonus: parse JSON, pipe through <code>res.ok</code>{" "}check, throw on non-ok responses.</li>
        </ul>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-cancel"
        title="Cancellation with AbortController"
        celebration="Race conditions in typeahead are no longer mysterious, you have the standard fix."
      >
        <Quiz
          question="`useEffect(() => { fetch('/x').then(setData); }, [query]); `, what bug is this prone to?"
          kind="Defend it"
          options={[
            { label: "Memory leak from fetch being garbage-collected before resolving", explanation: "Fetch holds itself in the event loop until it resolves; that's not the issue here." },
            { label: "Stale-data race: rapid query changes fire multiple fetches; whichever resolves last sets state, regardless of which query was current", correct: true, explanation: "Right. Without cleanup, every fetch races to call setData. Fix: AbortController in cleanup, or check that the query hasn't changed before setting state." },
            { label: "Infinite loop, useEffect re-runs on every render", explanation: "It only re-runs when `query` changes, not every render." },
            { label: "Fetch fails silently because there's no .catch", explanation: "It also has that problem, but the question asked about race conditions specifically." },
          ]}
        />
        <Quiz
          question="To check if an error was caused by abort vs. another network failure, the most reliable check is…"
          kind="Defend it"
          options={[
            { label: "`err instanceof AbortError`", explanation: "There is no globally-available `AbortError` constructor in browsers, this throws a ReferenceError." },
            { label: "`err.name === 'AbortError'`", correct: true, explanation: "Right. AbortError is a DOMException with name 'AbortError'. The string check works reliably across browsers and Node." },
            { label: "`err.message.includes('abort')`", explanation: "Message text varies by engine, never check error type by message." },
            { label: "Check `controller.signal.aborted` after the catch", explanation: "Works if you have the controller in scope, but err.name is the canonical and more portable check." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;Promises are objects representing a future value, with three states, pending, fulfilled, rejected, and a chain API. <code>.then</code>{" "}handlers run only if upstream is fulfilled; rejections skip them and propagate down until a <code>.catch</code>. <code>async</code>/<code>await</code>{" "}is sugar, <code>await</code>{" "}suspends the function and registers the continuation as a microtask. For concurrent work, the four combinators answer different questions: <code>Promise.all</code>{" "}for all-or-nothing, <code>allSettled</code>{" "}for partial-success, <code>race</code>{" "}for first-to-settle including timeouts, <code>any</code>{" "}for first-success across redundant attempts. One gotcha: <code>fetch</code>{" "}doesn&apos;t reject on HTTP errors, check <code>res.ok</code>{" "}or use a wrapper. For cancellation, <code>AbortController</code>{" "}is the standard tool, wired into <code>fetch</code>{" "}directly, and especially important in React effects, where the cleanup function aborts the previous request on every dependency change. That single pattern fixes the canonical typeahead race-condition bug.&quot;
          </p>
        </Callout>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 7 is <strong>modules and bundlers</strong>,{" "}the last piece of the JS foundation. We&apos;ll look at ESM vs CommonJS, why your <code>import * as foo</code>{" "}can hurt tree-shaking, how code-splitting actually works in a bundle, and how to read a Next.js bundle analysis to find the 200KB library no one needs.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
