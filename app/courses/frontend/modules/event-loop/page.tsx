import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "event-loop";

const CHECKPOINTS = [
  { id: "cp-stack-queue", title: "Call stack, task queue, microtask queue" },
  { id: "cp-order", title: "Predicting log order" },
  { id: "cp-promise", title: "What a Promise really is" },
];

export default function EventLoopModule() {
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
          The event loop, microtasks, and macrotasks
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          JS is single-threaded. The event loop is the rule for what runs next. Once you can trace the stack and the two queues, every async snippet becomes deterministic.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine you&apos;re a single barista (one thread) at a coffee shop. You can only do one thing at a time. People hand you tickets. Some tickets are <em>regular orders</em>{" "}from the back of the line (the macrotask queue) — they wait their turn. Some tickets are <em>express orders</em>{" "}from the manager, slipped right under your nose every time you finish a task (the microtask queue) — those jump ahead of everything else, including the next regular ticket.
        </p>
        <p>
          The event loop is the simple rule the barista follows: <em>finish the current ticket completely; then drain every express ticket; then look at the next regular ticket; repeat forever</em>. That ordering is what gives JavaScript its characteristic behavior — and it&apos;s why <code>Promise.resolve().then</code>{" "}always runs before <code>setTimeout(fn, 0)</code>, no matter what.
        </p>
      </section>

      <section>
        <h2>The formula: the runtime pieces</h2>
        <p>JavaScript runtimes (browsers, Node) all share the same architecture:</p>
        <ol>
          <li><strong>Call stack</strong>{" "}— the LIFO stack of function frames currently executing. When a function calls another, push. When a function returns, pop. JS runs whatever&apos;s on the top of the stack.</li>
          <li><strong>Web APIs / host APIs</strong>{" "}— things like <code>setTimeout</code>, <code>fetch</code>, the DOM. These are not JS — they&apos;re provided by the host (the browser, Node) and run on separate threads. JS hands them work, then forgets about it; they hand a callback back when ready.</li>
          <li><strong>Task queue (macrotask queue)</strong>{" "}— a FIFO queue of callbacks waiting to run. Sources: <code>setTimeout</code>, <code>setInterval</code>, I/O events, message events.</li>
          <li><strong>Microtask queue</strong>{" "}— a separate, higher-priority FIFO queue. Sources: <code>Promise.then/catch/finally</code> callbacks, <code>queueMicrotask</code>, <code>MutationObserver</code>.</li>
          <li><strong>The event loop</strong>{" "}— the rule that decides what to run next.</li>
        </ol>
        <p>The rule, exactly:</p>
        <pre><code>{`while (true) {
  // 1. Run the currently-executing JS to completion (drain the call stack).
  // 2. Drain the entire microtask queue (NOT just one — ALL of them, even
  //    new ones added by microtasks already running).
  // 3. Render (browser only — at the appropriate point).
  // 4. Take ONE task from the macrotask queue and run it.
  // 5. Go to step 2.
}`}</code></pre>
        <p>
          The asymmetry between &quot;drain ALL microtasks&quot; and &quot;run ONE macrotask, then check microtasks again&quot; is the entire source of the famous ordering. Internalize it.
        </p>
      </section>

      <section>
        <h2>The classic snippet, traced step by step</h2>
        <pre><code>{`console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// Output: A D C B`}</code></pre>
        <p>Walk it line by line:</p>
        <ol>
          <li><code>console.log(&quot;A&quot;)</code>{" "}runs synchronously. Stack: <em>main</em> →{" "}<em>log</em>. Logs A. Pop.</li>
          <li><code>setTimeout(cb, 0)</code>{" "}hands <code>cb</code>{" "}to the host. The host waits 0ms, then puts <code>cb</code>{" "}on the <strong>macrotask queue</strong>. JS does not wait.</li>
          <li><code>Promise.resolve().then(cb2)</code>{" "}schedules <code>cb2</code>{" "}on the <strong>microtask queue</strong>{" "}(because the promise is already resolved).</li>
          <li><code>console.log(&quot;D&quot;)</code>{" "}runs synchronously. Logs D.</li>
          <li>Main script finishes. Call stack is empty. Event loop wakes up.</li>
          <li><strong>Step 2: drain microtasks.</strong>{" "}<code>cb2</code>{" "}runs, logs C. No new microtasks. Microtask queue empty.</li>
          <li><strong>Step 4: take one macrotask.</strong>{" "}<code>cb</code>{" "}runs, logs B. Done.</li>
        </ol>
        <p>
          Final order: A, D, C, B. The 0ms <code>setTimeout</code>{" "}was overtaken by a promise resolved <em>after</em>{" "}it was scheduled, because microtasks always drain first.
        </p>

        <Quiz
          question="Predict the log order: `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`"
          kind="Predict the output"
          options={[
            { label: "1 2 3 4", explanation: "That ignores both that setTimeout is async and that promises run before macrotasks. Synchronous code (1, 4) finishes first." },
            { label: "1 4 2 3", explanation: "Close — but microtasks (promise) drain before macrotasks (setTimeout)." },
            { label: "1 4 3 2", correct: true, explanation: "Right. 1 and 4 are synchronous. Then microtasks drain → 3. Then one macrotask → 2." },
            { label: "1 3 4 2", explanation: "3 can't print until synchronous code finishes — main has to run to completion before microtasks drain." },
          ]}
        />
      </section>

      <section>
        <h2>The microtask trap: when microtasks keep generating microtasks</h2>
        <p>
          A microtask is allowed to schedule another microtask. The loop in step 2 drains <em>all</em>{" "}microtasks, including ones added during the drain. This means a tight chain of <code>.then</code>s never lets a macrotask run:
        </p>
        <pre><code>{`setTimeout(() => console.log("macro"), 0);
Promise.resolve()
  .then(() => console.log("micro 1"))
  .then(() => console.log("micro 2"))
  .then(() => console.log("micro 3"));
// Output: micro 1, micro 2, micro 3, macro`}</code></pre>
        <p>
          Each <code>.then</code>{" "}callback runs, queues the next one as a microtask, returns. The event loop keeps draining microtasks until none remain. <em>Then</em>{" "}— and only then — it runs the macrotask. If you wrote an infinite <code>.then</code>{" "}chain, you&apos;d starve the macrotask queue forever (and freeze the page).
        </p>
        <Callout variant="warn" title="Real-world consequence: don&apos;t do unbounded microtask work">
          <p className="m-0">In a tight microtask chain, the browser <em>cannot</em>{" "}repaint or run user events between the microtasks. If your microtask chain does heavy work, the page locks up just as if you wrote a synchronous infinite loop. The fix is to break work onto macrotasks (<code>setTimeout(fn, 0)</code>) or <code>requestIdleCallback</code>.</p>
        </Callout>
      </section>

      <section>
        <h2>The complete macrotask + microtask + async scenario</h2>
        <p>Here&apos;s the snippet interviewers actually ask:</p>
        <pre><code>{`console.log("script start");

setTimeout(() => console.log("setTimeout"), 0);

Promise.resolve()
  .then(() => console.log("promise 1"))
  .then(() => console.log("promise 2"));

console.log("script end");`}</code></pre>
        <p>Trace it:</p>
        <ol>
          <li>Synchronous: log <code>&quot;script start&quot;</code>.</li>
          <li>Schedule setTimeout callback (after 0ms timer) → macrotask queue (after a tick).</li>
          <li>Schedule promise.then handler → microtask queue.</li>
          <li>Synchronous: log <code>&quot;script end&quot;</code>.</li>
          <li>Main script done. Drain microtasks: run first <code>.then</code>{" "}→ logs <code>&quot;promise 1&quot;</code>{" "}→ this queues the next <code>.then</code>{" "}as a new microtask.</li>
          <li>Still draining microtasks: run new <code>.then</code>{" "}→ logs <code>&quot;promise 2&quot;</code>. Microtask queue empty.</li>
          <li>Take one macrotask: setTimeout fires → logs <code>&quot;setTimeout&quot;</code>.</li>
        </ol>
        <p>Final order: <code>script start</code>, <code>script end</code>, <code>promise 1</code>, <code>promise 2</code>, <code>setTimeout</code>.</p>

        <Quiz
          question="Predict: `setTimeout(() => console.log('a'), 0); Promise.resolve().then(() => { console.log('b'); setTimeout(() => console.log('c'), 0); }); console.log('d');`"
          kind="Predict the output"
          options={[
            { label: "d b a c", correct: true, explanation: "Right. (1) Synchronous: d. (2) Drain microtasks: 'b' (which schedules 'c' as a new MACROtask — added AFTER 'a'). Queue empty. (3) Macrotasks: a, then c." },
            { label: "a d b c", explanation: "a is queued as a macrotask — it can't run until microtasks drain." },
            { label: "d b c a", explanation: "c is scheduled INSIDE the promise.then, AFTER a was already queued. a runs first among macrotasks." },
            { label: "b d a c", explanation: "Synchronous code (d) always runs before microtasks drain — the main script must finish first." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-stack-queue"
        title="Call stack, task queue, microtask queue"
        celebration="The runtime is no longer a black box. Async logs are now traceable."
      >
        <Quiz
          question="Why does `setTimeout(fn, 0)` not actually fire immediately?"
          kind="Defend it"
          options={[
            { label: "Browsers clamp the minimum to 4ms", explanation: "That's a real spec detail, but it isn't the main reason — even with 0ms exact, the callback would queue, not run immediately." },
            { label: "It schedules `fn` as a macrotask, which runs only after the call stack empties AND all microtasks drain", correct: true, explanation: "Right. The '0' is the minimum delay, not the actual delay. The callback waits in the macrotask queue behind the entire microtask queue." },
            { label: "JS is multithreaded but timers run on a slower thread", explanation: "JS execution is single-threaded; timers run on a host thread, but the issue is queue ordering, not thread speed." },
            { label: "0ms is treated as 'never' by the engine", explanation: "It really does fire — just after the current task and all microtasks finish." },
          ]}
        />
        <Quiz
          question="A microtask scheduled during the draining of the microtask queue runs…"
          kind="Defend it"
          options={[
            { label: "After the next macrotask", explanation: "It wouldn't wait that long — microtasks added during the drain run as part of the same drain." },
            { label: "Before the next macrotask, in the same drain cycle as the microtasks already running", correct: true, explanation: "Right. The drain is exhaustive — it keeps running until the queue is empty, including ones added by other microtasks." },
            { label: "After all other microtasks, but in a separate cycle", explanation: "There's no separate cycle for microtasks added during a drain — they're appended to the current drain." },
            { label: "Never — once draining starts, no new microtasks can be added", explanation: "They can absolutely be added; that's how `.then` chains work." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>How <code>async</code>/<code>await</code>{" "}fits in</h2>
        <p>
          <code>async</code>/<code>await</code>{" "}is just <code>.then</code>{" "}with prettier syntax. <code>await someP</code>{" "}is, semantically:
        </p>
        <ol>
          <li>Pause the current function.</li>
          <li>Register the rest of the function as a microtask that runs when <code>someP</code>{" "}resolves.</li>
          <li>Yield control back to the event loop.</li>
        </ol>
        <pre><code>{`async function f() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
}
console.log("start");
f();
console.log("end");
// Output: start, 1, end, 2`}</code></pre>
        <p>
          <code>f()</code>{" "}runs synchronously up to the <code>await</code>{" "}— logs <code>&quot;1&quot;</code>. The <code>await</code>{" "}registers &quot;<code>console.log(&quot;2&quot;)</code>&quot; as a microtask, then returns from <code>f</code>. Main thread continues and logs <code>&quot;end&quot;</code>. Main script finishes. Microtask drains: logs <code>&quot;2&quot;</code>.
        </p>
        <p>
          Once you see <code>await</code>{" "}as &quot;split this function at every <code>await</code>{" "}and turn the rest into a microtask&quot;, async code becomes traceable. There&apos;s no magic — just promises with sugar.
        </p>
      </section>

      <section>
        <h2>Why this matters in React</h2>
        <ul>
          <li>
            <strong>State batching</strong>{" "}— in React 18+, multiple <code>setState</code>{" "}calls in the same event handler (or inside <code>flushSync</code>) collapse into one render. The mechanism: React queues the update, then schedules a microtask to commit. All sync code in the handler runs first, all queued updates get batched, then the render happens. (Pre-18, batching only happened inside React event handlers; post-18, it&apos;s everywhere — promises, setTimeout, native events.)
          </li>
          <li>
            <strong><code>useEffect</code>{" "}timing</strong>{" "}— effects run after the browser paints, scheduled via the macrotask queue (more or less — React uses scheduler internals, but the practical effect is post-paint). <code>useLayoutEffect</code>{" "}runs synchronously before paint. This is why you put DOM measurements in <code>useLayoutEffect</code>{" "}(measure → set state → paint, all in one tick) and side-effects in <code>useEffect</code>{" "}(don&apos;t block paint).
          </li>
          <li>
            <strong>The act() warning</strong>{" "}— in tests, React warns you when state updates happen outside <code>act()</code>{" "}because the test runner finishes before the microtask that flushes the update runs. <code>await act(...)</code>{" "}gives React time to drain its microtasks before assertions fire.
          </li>
        </ul>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-order"
        title="Predicting log order"
        celebration="You can trace any async snippet. The 'why didn't this fire?' question is now answerable."
      >
        <Quiz
          question="Predict: `async function f() { console.log('a'); await null; console.log('b'); } console.log('1'); f(); console.log('2');`"
          kind="Defend it"
          options={[
            { label: "1 a 2 b", correct: true, explanation: "Right. (1) log '1'. (2) f() runs sync to await — logs 'a'. (3) await null pauses, queues continuation as microtask. (4) log '2'. (5) Drain microtasks: log 'b'." },
            { label: "1 a b 2", explanation: "'b' can't run before '2' — the await yields control back to the main script first." },
            { label: "a 1 2 b", explanation: "Top-level synchronous '1' runs before f() is called." },
            { label: "1 2 a b", explanation: "f() runs sync UP TO the await — 'a' logs before the await, which is before '2'." },
          ]}
        />
        <Quiz
          question="In React 18, what schedules the eventual re-render after `setCount(c + 1)`?"
          kind="Defend it"
          options={[
            { label: "setCount synchronously renders the component", explanation: "It doesn't — it queues the update; render is async." },
            { label: "React queues the update and schedules a microtask (via its scheduler) to commit; multiple updates in the same task batch into one render", correct: true, explanation: "Right. The microtask-style timing is what makes batching work — sync code finishes, then React flushes batched updates as one render." },
            { label: "It's tied to setTimeout(0)", explanation: "It uses React's scheduler, which leans on microtasks (for high-priority) and message channels — not setTimeout." },
            { label: "It happens on the next animation frame", explanation: "Sometimes, for low-priority updates, but the basic batch flush is microtask-style." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The project: implement a tiny Promise + predict 15 snippets</h2>
        <p>You&apos;re going to build a Promise class that handles three states, <code>.then</code>{" "}chaining, and resolves asynchronously. The goal isn&apos;t a spec-compliant Promises/A+ implementation (that&apos;s its own rabbit hole) — it&apos;s to feel how state and microtask scheduling fit together.</p>

        <h3>Part 1: <code>MyPromise</code></h3>
        <p>Build a class with the following surface:</p>
        <pre><code>{`const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve(42), 10);
});
p.then(v => console.log(v));         // logs 42 after 10ms

// chaining
new MyPromise(res => res(1))
  .then(v => v + 1)
  .then(v => v * 10)
  .then(v => console.log(v));        // logs 20

// rejection
new MyPromise((_, rej) => rej("oops"))
  .then(v => console.log("never"))
  .catch(err => console.log("got " + err)); // logs "got oops"`}</code></pre>
        <p>Hints:</p>
        <ul>
          <li>Three states: <code>pending</code>, <code>fulfilled</code>, <code>rejected</code>. State transitions are one-way.</li>
          <li>Keep arrays of pending <code>.then</code>{" "}callbacks. When state transitions, call them all.</li>
          <li><code>.then</code>{" "}must return a new promise that resolves with the callback&apos;s return value (or chains if the callback returns a promise).</li>
          <li>Use <code>queueMicrotask</code>{" "}to schedule callbacks — they must run asynchronously, not synchronously.</li>
        </ul>

        <h3>Part 2: predict 15 snippets</h3>
        <p>For each snippet, write down the log order BEFORE running it. Track which ones you get wrong; they reveal the corner of the model you don&apos;t own.</p>
        <ol>
          <li><code>{`console.log(1); setTimeout(() => console.log(2)); console.log(3);`}</code></li>
          <li><code>{`console.log(1); Promise.resolve().then(() => console.log(2)); console.log(3);`}</code></li>
          <li><code>{`setTimeout(() => console.log(1)); Promise.resolve().then(() => console.log(2));`}</code></li>
          <li><code>{`Promise.resolve().then(() => console.log(1)).then(() => console.log(2)); setTimeout(() => console.log(3));`}</code></li>
          <li><code>{`console.log(1); Promise.resolve().then(() => { console.log(2); return Promise.resolve(); }).then(() => console.log(3)); console.log(4);`}</code></li>
          <li><code>{`async function f() { console.log(1); await null; console.log(2); } f(); console.log(3);`}</code></li>
          <li><code>{`async function f() { await Promise.resolve(); console.log(1); } f(); console.log(2);`}</code></li>
          <li><code>{`setTimeout(() => console.log(1), 0); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3));`}</code></li>
          <li><code>{`Promise.resolve().then(() => { console.log(1); setTimeout(() => console.log(2)); }); setTimeout(() => console.log(3));`}</code></li>
          <li><code>{`async function a() { console.log(1); await b(); console.log(2); } async function b() { console.log(3); } a(); console.log(4);`}</code></li>
          <li><code>{`queueMicrotask(() => console.log(1)); console.log(2);`}</code></li>
          <li><code>{`setTimeout(() => console.log(1)); queueMicrotask(() => console.log(2)); console.log(3);`}</code></li>
          <li><code>{`Promise.resolve().then(() => { for (let i = 0; i < 3; i++) Promise.resolve().then(() => console.log(i)); }); setTimeout(() => console.log("done"));`}</code></li>
          <li><code>{`async function f() { console.log(1); await Promise.resolve(); console.log(2); await Promise.resolve(); console.log(3); } f(); console.log(4);`}</code></li>
          <li><code>{`new Promise(res => { console.log(1); res(); }).then(() => console.log(2)); console.log(3);`}</code></li>
        </ol>
        <Callout variant="insight" title="How to score yourself">
          <p className="m-0">If you get 12+/15 right on first try, you have an interview-ready model of the event loop. If you&apos;re below 10, redo the ones you missed by hand-tracing the call stack and both queues — write each step on paper. The bottleneck is almost always the &quot;microtasks drain exhaustively&quot; rule and how it interacts with <code>await</code>.</p>
        </Callout>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-promise"
        title="What a Promise really is"
        celebration="You've internalized the runtime. Async bugs are now diagnosable, not mysterious."
      >
        <Quiz
          question="A Promise is, conceptually…"
          kind="Defend it"
          options={[
            { label: "A way to delay code until something finishes", explanation: "That's what it ENABLES, but not what it IS. A promise is a state machine." },
            { label: "An object representing a future value, with three states (pending, fulfilled, rejected) and methods (.then) that schedule callbacks via the microtask queue when the state transitions", correct: true, explanation: "Right. Promise = state machine + observer pattern + microtask scheduling. Once you see those three parts, .then chaining and async/await stop being mysterious." },
            { label: "A built-in syntactic sugar over setTimeout", explanation: "Promises are NOT built on setTimeout — they use the microtask queue, which is higher-priority and separate." },
            { label: "A thread-safe queue", explanation: "JS is single-threaded; there's no thread-safety to worry about. Promises are about scheduling on a single thread." },
          ]}
        />
        <Quiz
          question="Why does `Promise.resolve().then(fn)` run `fn` BEFORE `setTimeout(fn, 0)`?"
          kind="Defend it"
          options={[
            { label: "setTimeout has a minimum delay of 4ms in browsers", explanation: "Even with 0ms, the cause is queue priority — not the timer minimum." },
            { label: "Promises queue on the microtask queue, which drains entirely after the current task before any macrotask runs; setTimeout queues a macrotask", correct: true, explanation: "Right. Microtasks have higher priority by design — that's how `await` and React's batching work cleanly." },
            { label: "Promises run synchronously", explanation: "They don't — `.then` callbacks always run asynchronously, just via a faster queue than setTimeout." },
            { label: "setTimeout callbacks need to wait for the next animation frame", explanation: "Not by default — only requestAnimationFrame does that." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;JavaScript is single-threaded. The event loop coordinates the call stack with two queues — a microtask queue (Promise callbacks, <code>queueMicrotask</code>) and a macrotask queue (<code>setTimeout</code>, I/O, message events). The rule: run the current task to completion, then drain the <em>entire</em>{" "}microtask queue including ones added during the drain, then take exactly one task from the macrotask queue, then drain microtasks again. That&apos;s why <code>Promise.resolve().then(cb)</code>{" "}runs before <code>setTimeout(cb, 0)</code>{" "}— even though setTimeout was scheduled first, microtasks have priority. <code>async</code>/<code>await</code>{" "}is sugar on top: <code>await</code>{" "}splits the function and registers the continuation as a microtask. This is the mechanism behind React 18&apos;s batching — multiple <code>setState</code>{" "}calls in the same task get queued, then a microtask flushes them into one render.&quot;
          </p>
        </Callout>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 6 is <strong>async patterns</strong>{" "}— the practical layer on top of the event loop. Now that you know <em>how</em>{" "}promises work, you&apos;ll learn the standard library (<code>Promise.all</code>, <code>race</code>, <code>allSettled</code>), the error-propagation rules every interviewer asks about, and the <code>AbortController</code>{" "}pattern every real React app needs for cancellable fetches.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
