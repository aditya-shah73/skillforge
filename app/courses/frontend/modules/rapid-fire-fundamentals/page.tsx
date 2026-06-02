import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rapid-fire-fundamentals";

const CHECKPOINTS = [
  { id: "cp-js-core", title: "The JavaScript core" },
  { id: "cp-css-dom", title: "CSS & the DOM" },
  { id: "cp-react-network", title: "React & the network" },
];

export default function RapidFireFundamentalsModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      {/* content-lint-disable count — "nine phases" refers to the learning phases
          (Phase 1–9, excluding Orientation), and "three phases" describes DOM
          event propagation (capture/target/bubble); neither is a course-phase total. */}
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 9 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Rapid-fire fundamentals — the 60-second answers
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The questions that get fired in the first ten minutes — closures, <code>this</code>, the event loop,
          reconciliation, why keys, controlled vs uncontrolled, server cache vs state, Server vs Client Components —
          each with a tight, confident 60-second answer drawn straight from the course.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Muscle memory, not knowledge</h2>
        <p className="mb-4">
          A jazz musician doesn&apos;t <em>think</em> about which note comes next in a scale — their fingers already know.
          They drilled it slowly, a thousand times, until the knowledge dropped out of conscious thought and into reflex.
          When they improvise on stage, the scales are <em>free</em>; all their attention goes to the music.
        </p>
        <p className="mb-4">
          Rapid-fire fundamentals are the scales. &quot;What&apos;s a closure?&quot; &quot;Why does a Promise resolve before a
          <code> setTimeout(0)</code>?&quot; &quot;What&apos;s the difference between <code>==</code> and <code>===</code>?&quot; You
          already <em>understand</em> these — you covered them across nine phases. But understanding and answering crisply
          under pressure are different skills. In the first ten minutes of an interview, a long, hedging, &quot;well, it
          depends&quot; answer reads as <em>uncertainty</em>, even when you know the material cold.
        </p>
        <p className="mb-4">
          This module is a drill, not a lecture. Every item below is framed the same way: <strong>they ask X → you say
          Y</strong>, followed by a one-line <em>why</em> that proves you understand the mechanism rather than memorized a
          slogan. The goal is to make each answer <strong>reflexive</strong> — so that when it&apos;s fired at you, the right
          first sentence is already on your lips and your real thinking goes to the follow-up.
        </p>
        <Callout variant="info" title="How to read this module">
          <p>
            Don&apos;t skim it like reference docs. Read each answer out loud, then close the page and say it again from
            memory in one breath. The phrasing is deliberately tight — that&apos;s the &quot;load-bearing sentence&quot; you&apos;re
            drilling toward. If you can&apos;t reproduce the <em>why</em>, you don&apos;t own the answer yet.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. JS CORE: EVENT LOOP ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The event loop, microtasks &amp; macrotasks</h2>
        <p className="mb-4">
          This is the question that sorts people instantly, because the answer has a precise mechanism and a famous
          gotcha. Here is the whole thing in one tight unit:
        </p>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;JavaScript is single-threaded — how does it do async?&quot;<br />
          <strong>You say:</strong> &quot;The engine runs one call stack. When it&apos;s empty, the event loop pulls work from
          queues. There are two: the <em>microtask</em> queue (Promise callbacks, <code>queueMicrotask</code>) and the
          <em> macrotask</em> queue (<code>setTimeout</code>, I/O, UI events). After every task, the loop drains the
          <em> entire</em> microtask queue before touching the next macrotask.&quot;
        </p>
        <p className="mb-4">
          <strong>The famous follow-up:</strong> &quot;Why does a resolved Promise&apos;s <code>.then</code> run before a
          <code> setTimeout(fn, 0)</code> scheduled earlier?&quot;
        </p>
        <pre><code>{`console.log("1: sync");

setTimeout(() => console.log("2: macrotask"), 0);

Promise.resolve().then(() => console.log("3: microtask"));

console.log("4: sync");

// Output: 1, 4, 3, 2
// Sync code runs first (1, 4). The stack empties.
// The loop drains ALL microtasks (3) before the next macrotask (2).`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;Microtasks always run to exhaustion <em>between</em> macrotasks, so a Promise callback jumps ahead of an
            already-queued <code>setTimeout(0)</code>. <code>setTimeout(0)</code> doesn&apos;t mean &apos;now&apos; — it means
            &apos;after the current task and all pending microtasks.&apos;&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. JS CORE: CLOSURES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Closures</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;What&apos;s a closure?&quot;<br />
          <strong>You say:</strong> &quot;A function bundled with references to the variables from the scope where it was
          <em> defined</em>. It keeps those variables alive after the outer function returns, because the inner function
          still holds a reference to them.&quot;
        </p>
        <pre><code>{`function counter() {
  let count = 0;            // lives in counter's scope
  return () => ++count;     // closes over \`count\`
}

const next = counter();
next(); // 1
next(); // 2  -> \`count\` survived because the closure references it`}</code></pre>
        <p className="mb-4">
          <strong>The classic gotcha</strong> — <code>var</code> in a loop — is really a closure question wearing a scope
          costume:
        </p>
        <pre><code>{`// BROKEN: var has one shared binding; all three closures see the final i
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3, 3, 3

// FIXED: let creates a fresh binding per iteration
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0, 1, 2`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;The closure captures the <em>variable</em>, not its value at the time. With <code>var</code> there&apos;s a
            single function-scoped binding shared by every iteration; <code>let</code> gives each iteration its own
            block-scoped binding, so each closure captures a different one.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. JS CORE: THIS BINDING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>this</code> binding rules</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;How is <code>this</code> determined?&quot;<br />
          <strong>You say:</strong> &quot;By <em>how the function is called</em>, not where it&apos;s defined — with one exception.
          There are four rules, checked in priority order:&quot;
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>new</strong> — <code>new Foo()</code> binds <code>this</code> to the freshly created object.</li>
          <li><strong>Explicit</strong> — <code>call</code>, <code>apply</code>, <code>bind</code> set <code>this</code> to the object you pass.</li>
          <li><strong>Implicit</strong> — <code>obj.method()</code> binds <code>this</code> to <code>obj</code> (the thing left of the dot).</li>
          <li><strong>Default</strong> — a plain call is <code>undefined</code> in strict mode (the global object otherwise).</li>
        </ul>
        <p className="mb-4">
          <strong>The exception that&apos;s really a follow-up:</strong> arrow functions. They have no own <code>this</code> —
          they capture it lexically from the enclosing scope at definition time, which is exactly why they&apos;re the fix for
          &quot;I lost <code>this</code> inside a callback.&quot;
        </p>
        <pre><code>{`const obj = {
  name: "David",
  greetLater() {
    setTimeout(function () { console.log(this.name); }, 0); // undefined: plain call
    setTimeout(() => console.log(this.name), 0);            // "David": arrow captures \`this\`
  },
};`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;Regular functions get <code>this</code> at <em>call</em> time from the call site; arrow functions get it at
            <em> definition</em> time from the enclosing lexical scope and can never be rebound. So &apos;left of the dot&apos;
            decides for normal functions, and &apos;where it was written&apos; decides for arrows.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. JS CORE: == vs ===, HOISTING, PROTOTYPES, SCOPE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Equality, hoisting, prototypes &amp; scope</h2>

        <h3 className="mt-6 mb-2 text-lg font-semibold"><code>==</code> vs <code>===</code></h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;<code>===</code> compares value and type with no coercion. <code>==</code> coerces
          types first, which produces surprises like <code>0 == &quot;&quot;</code> and <code>null == undefined</code> being
          true. Always use <code>===</code>; the one pragmatic exception is <code>x == null</code> to catch both
          <code> null</code> and <code>undefined</code> in a single check.&quot; <em>Why:</em> coercion rules are non-obvious,
          so default to the predictable operator.
        </p>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Hoisting &amp; the TDZ</h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;Declarations are processed before code runs. <code>var</code> is hoisted and
          initialized to <code>undefined</code>; function declarations are fully hoisted. <code>let</code> and
          <code> const</code> are hoisted too, but <em>not initialized</em> — they sit in the Temporal Dead Zone, so
          touching them before the declaration line throws a <code>ReferenceError</code>.&quot; <em>Why:</em> the TDZ turns a
          silent <code>undefined</code> bug into a loud, fail-fast error.
        </p>
        <pre><code>{`console.log(a); // undefined  (var hoisted + initialized)
var a = 1;

console.log(b); // ReferenceError  (let hoisted but in the TDZ)
let b = 2;`}</code></pre>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Prototypal inheritance</h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;Every object has a hidden link (<code>[[Prototype]]</code>) to another object. When
          you read a property that isn&apos;t on the object, the engine walks up the prototype chain until it finds it or hits
          <code> null</code>. <code>class</code> is sugar over this — methods live on the prototype, shared by all
          instances, not copied onto each one.&quot; <em>Why:</em> it&apos;s delegation, not copying — one shared method object
          backs every instance.
        </p>

        <h3 className="mt-6 mb-2 text-lg font-semibold"><code>var</code> / <code>let</code> / <code>const</code> &amp; block scope</h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;<code>var</code> is function-scoped and hoisted; <code>let</code> and
          <code> const</code> are block-scoped and TDZ-guarded. <code>const</code> blocks <em>reassignment</em>, not
          mutation — a <code>const</code> object can still have its properties changed. Default to <code>const</code>,
          reach for <code>let</code> when you must reassign, and never use <code>var</code>.&quot; <em>Why:</em> block scope
          plus &quot;const by default&quot; eliminates a whole class of accidental-mutation and leaked-variable bugs.
        </p>
        <Callout variant="warn" title="The trap in the const question">
          <p>
            Interviewers love &quot;is <code>const</code> immutable?&quot; The crisp answer is <strong>no</strong>:
            <code> const arr = []; arr.push(1)</code> is fine because you mutated the array, you didn&apos;t reassign the
            binding. <code>const</code> freezes the <em>binding</em>, not the value. Say that and move on.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. JS CORE: DEBOUNCE vs THROTTLE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Debounce vs throttle</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;What&apos;s the difference between debounce and throttle?&quot;<br />
          <strong>You say:</strong> &quot;Both limit how often a function runs. <em>Debounce</em> waits for a pause — it only
          fires after the events <em>stop</em> for N ms (great for a search box: run when the user stops typing).
          <em> Throttle</em> fires at most once per N ms <em>during</em> a stream of events (great for scroll or resize:
          run on a steady cadence while it&apos;s happening).&quot;
        </p>
        <pre><code>{`// Debounce: reset the timer on every call; only the last call survives the gap
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Throttle: ignore calls until the cooldown elapses
function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;Debounce = &apos;wait until it&apos;s quiet, then act once.&apos; Throttle = &apos;act on a fixed rhythm while it&apos;s
            busy.&apos; Pick debounce when only the final state matters (typeahead); pick throttle when you need periodic
            updates during a continuous gesture (scroll position).&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-js-core" moduleSlug={MODULE_SLUG} title="The JavaScript core">
        <Quiz
          kind="Event loop"
          question="A resolved Promise's .then() and a setTimeout(fn, 0) are both pending. Which runs first, and why?"
          options={[
            {
              label: "The Promise callback — microtasks are drained completely between macrotasks, so it jumps ahead of the timer",
              correct: true,
              explanation:
                "Right. After the current task and once the stack is empty, the loop empties the ENTIRE microtask queue before pulling the next macrotask. setTimeout(0) is a macrotask, so the microtask wins.",
            },
            {
              label: "The setTimeout callback — it was scheduled first, so it runs first (FIFO)",
              explanation:
                "Scheduling order across queues doesn't decide this. Microtasks always run between macrotasks regardless of when the macrotask was queued, so the Promise callback runs first.",
            },
            {
              label: "Whichever the engine picks — ordering between the two queues is non-deterministic",
              explanation:
                "It's fully deterministic: microtask queue drains to exhaustion before the next macrotask. There's no randomness here.",
            },
          ]}
        />
        <Quiz
          kind="Closures & scope"
          question="A for loop uses `var i` and schedules a setTimeout logging `i` each iteration; it prints the final value three times. What's the fix and why?"
          options={[
            {
              label: "Use `let i` — it creates a fresh block-scoped binding per iteration, so each closure captures a different i",
              correct: true,
              explanation:
                "Exactly. var has one function-scoped binding shared by all iterations, so every closure sees the final value. let rebinds per iteration, giving each closure its own i.",
            },
            {
              label: "Wrap the setTimeout in another setTimeout so the values are read later",
              explanation:
                "Delaying further doesn't help — all the closures still reference the same single var binding, which holds the final value by the time any callback runs.",
            },
            {
              label: "Closures don't capture loop variables at all; this behavior is a bug in the engine",
              explanation:
                "Closures do capture the variable (the binding), and this is specified behavior, not a bug. The var-vs-let distinction is the whole point.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. CSS: BOX MODEL & SPECIFICITY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The box model &amp; specificity</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Explain the box model.&quot;<br />
          <strong>You say:</strong> &quot;Every element is a box: content, then padding, then border, then margin. By
          default <code>width</code> sizes only the content, so padding and border get <em>added</em> on top — which is
          why widths surprise people. <code>box-sizing: border-box</code> makes <code>width</code> include padding and
          border, so the box is exactly the size you asked for. Most resets set it globally.&quot;
        </p>
        <pre><code>{`/* The reset everyone reaches for */
*, *::before, *::after { box-sizing: border-box; }

/* Now width: 200px means 200px on screen, padding and border included */`}</code></pre>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;How does specificity work?&quot;<br />
          <strong>You say:</strong> &quot;It&apos;s a tuple compared left to right: inline styles, then IDs, then classes/
          attributes/pseudo-classes, then elements/pseudo-elements. Higher group wins regardless of source order; ties
          break by who comes last. <code>!important</code> overrides the whole calculation — which is exactly why you
          avoid it.&quot; <em>Why:</em> it&apos;s a weighted count per category, not a flat score, so one ID beats any number of
          classes.
        </p>
        <Callout variant="warn" title="The specificity trap">
          <p>
            &quot;Does <code>#id</code> beat ten classes?&quot; Yes — specificity compares the ID column <em>before</em> the
            class column, so a single ID outranks any number of classes. That&apos;s why ID selectors are hard to override
            and why component CSS leans on classes.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. CSS: FLEXBOX vs GRID, STACKING CONTEXT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Flexbox vs grid &amp; the stacking context</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Flexbox or grid?&quot;<br />
          <strong>You say:</strong> &quot;Flexbox is <em>one-dimensional</em> — lay items along a single axis (a nav bar, a
          toolbar) and let them distribute space. Grid is <em>two-dimensional</em> — rows and columns at once (a page
          layout, a card gallery). Rule of thumb: content-driven distribution along one line → flex; a defined layout
          across two axes → grid. They compose — grid for the page, flex inside a cell.&quot;
        </p>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Why isn&apos;t my <code>z-index: 9999</code> working?&quot;<br />
          <strong>You say:</strong> &quot;Because <code>z-index</code> only competes <em>within the same stacking context</em>.
          An ancestor with <code>opacity</code> below 1, a <code>transform</code>, a <code>filter</code>, or
          <code> position</code> + <code>z-index</code> creates a new stacking context that traps its children. Your 9999
          is huge inside its own context but the whole context sits below a sibling context.&quot;
        </p>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;<code>z-index</code> is relative, not global. A child can never escape its parent&apos;s stacking context, so
            the fix is usually to move the element out of the trapping ancestor — or portal it to the body — not to crank
            the number higher.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. DOM: EVENT DELEGATION, BUBBLING, CAPTURING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Event delegation, bubbling &amp; capturing</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Walk me through how a click event travels.&quot;<br />
          <strong>You say:</strong> &quot;Three phases. <em>Capture</em> — the event travels from the document <em>down</em> to
          the target. <em>Target</em> — it reaches the clicked element. <em>Bubble</em> — it travels back <em>up</em> to
          the document. By default handlers run on the bubble phase; pass <code>{`{ capture: true }`}</code> to run during
          capture instead.&quot;
        </p>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;What&apos;s event delegation and why use it?&quot;<br />
          <strong>You say:</strong> &quot;Attach <em>one</em> listener to a common parent and use bubbling to handle events
          from many children, reading <code>event.target</code> to know which one. It means fewer listeners, and it works
          for elements added <em>after</em> you wired it up.&quot;
        </p>
        <pre><code>{`// One listener handles every <li>, even ones added later
list.addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (!item) return;        // clicked the gap, ignore
  select(item.dataset.id);  // e.target tells us which child
});`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;Delegation rides the bubble phase: the event bubbles up to the parent, so one handler on the parent can
            serve any number of current or future children. It scales listener count from N to 1 and survives dynamic
            DOM changes for free.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-css-dom" moduleSlug={MODULE_SLUG} title="CSS & the DOM">
        <Quiz
          kind="Stacking context"
          question="An element with z-index: 9999 still renders behind a sibling subtree. What's the most likely cause?"
          options={[
            {
              label: "An ancestor created a new stacking context (e.g. opacity < 1 or a transform), trapping the element's z-index inside it",
              correct: true,
              explanation:
                "Right. z-index only competes within the same stacking context. If an ancestor opens its own context, the 9999 is huge locally but the whole context sits below the sibling context. Crank the number higher and nothing changes.",
            },
            {
              label: "9999 overflows the maximum z-index, so the browser resets it to 0",
              explanation:
                "There's no practical max that resets to 0 here. The issue is stacking-context scope, not an integer overflow.",
            },
            {
              label: "z-index requires display: flex on the element to take effect",
              explanation:
                "z-index needs a positioning context (or to be a flex/grid item), but display: flex isn't the requirement, and it wouldn't explain being trapped by an ancestor's stacking context.",
            },
          ]}
        />
        <Quiz
          kind="Event delegation"
          question="You attach one click listener to a <ul> to handle clicks on its <li> children, including ones added later. Which phase makes this work?"
          options={[
            {
              label: "Bubbling — the click on a child bubbles up to the <ul>, so one parent handler sees events from any child",
              correct: true,
              explanation:
                "Exactly. Delegation relies on the bubble phase carrying the event up to the parent. Reading event.target tells you which child was clicked, and it works for children added after the listener was attached.",
            },
            {
              label: "Capturing — the parent intercepts the event on the way down before it reaches the child",
              explanation:
                "Delegation works on the default bubble phase. Capture travels downward and isn't what makes a single parent handler serve many children here.",
            },
            {
              label: "It only works if you call addEventListener on each <li> individually",
              explanation:
                "That's the opposite of delegation — and it wouldn't cover children added later. The whole point is one listener on the parent via bubbling.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 10. REACT: KEYS & RECONCILIATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Keys &amp; reconciliation</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;What does React do when state changes?&quot;<br />
          <strong>You say:</strong> &quot;It re-renders to a new virtual tree and <em>reconciles</em> it against the previous
          one. It diffs type by type: same element type → update props in place; different type → tear down and rebuild.
          For lists it matches children by <code>key</code>.&quot;
        </p>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Why do list items need a stable <code>key</code> — and why not the array index?&quot;<br />
          <strong>You say:</strong> &quot;The key tells React <em>which item is which</em> across renders, so it can move and
          reuse DOM and component state instead of rebuilding. An index key breaks the moment the list reorders or you
          insert/remove in the middle: the key now points at a <em>different</em> item, so React reuses the wrong state —
          inputs show the wrong values, the wrong row animates.&quot;
        </p>
        <pre><code>{`// BAD: index as key — reorders/inserts misattach state
{items.map((item, i) => <Row key={i} item={item} />)}

// GOOD: stable identity from the data
{items.map((item) => <Row key={item.id} item={item} />)}`}</code></pre>
        <Callout variant="insight" title="The one-line why">
          <p>
            &quot;<code>key</code> is React&apos;s identity for an item across renders. A stable, data-derived key lets React
            move existing DOM/state to the right place; an index key re-labels items on every reorder, so React keeps the
            old state in the wrong row.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 11. REACT: CONTROLLED vs UNCONTROLLED, useEffect ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Controlled vs uncontrolled &amp; the <code>useEffect</code> rules</h2>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;Controlled or uncontrolled inputs?&quot;<br />
          <strong>You say:</strong> &quot;A <em>controlled</em> input&apos;s value is driven by React state (<code>value</code> +
          <code> onChange</code>) — React is the single source of truth, which you want for validation, formatting, or
          reading the value as you type. An <em>uncontrolled</em> input keeps its own DOM state and you read it with a
          <code> ref</code> when needed — simpler for plain forms. Default to controlled; reach for uncontrolled to avoid
          re-rendering on every keystroke.&quot;
        </p>
        <p className="mb-4">
          <strong>They ask:</strong> &quot;What are the rules for <code>useEffect</code> dependencies and cleanup?&quot;<br />
          <strong>You say:</strong> &quot;The dependency array must list <em>every</em> reactive value the effect reads — props,
          state, anything from render. Empty array → run once after mount; omitted array → run after every render. Return
          a cleanup function to undo what the effect set up (subscriptions, timers, requests); React runs it before the
          next effect and on unmount.&quot;
        </p>
        <pre><code>{`useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup: runs before re-run and on unmount
}, [tick]); // every reactive value the effect reads goes here`}</code></pre>
        <Callout variant="warn" title="The two classic useEffect traps">
          <p>
            <strong>Lying about dependencies</strong> (omitting one to &quot;run once&quot;) gives you stale closures reading old
            state. <strong>Forgetting cleanup</strong> leaks subscriptions and timers and causes the data-fetching race
            condition. The honest fix for both is: list the real deps, and always clean up what you set up.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 12. NETWORK: CORS, CACHING, STATUS CODES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">CORS, HTTP caching &amp; status codes</h2>

        <h3 className="mt-6 mb-2 text-lg font-semibold">CORS</h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;CORS is a <em>browser</em> security rule: a page can&apos;t read responses from a
          different origin unless that server opts in with <code>Access-Control-Allow-Origin</code> headers. For unsafe
          methods/headers the browser first sends a <em>preflight</em> <code>OPTIONS</code> request to ask permission.
          Crucially it&apos;s enforced by the browser, not the server — the request often reaches the server, the browser
          just blocks the response from your JS.&quot; <em>Why:</em> it protects users from one site silently reading another
          site&apos;s authenticated data.
        </p>

        <h3 className="mt-6 mb-2 text-lg font-semibold">HTTP caching headers</h3>
        <p className="mb-4">
          <strong>You say:</strong> &quot;<code>Cache-Control</code> drives it — <code>max-age</code> sets how long a response
          is fresh; <code>no-cache</code> means &apos;store it but revalidate before use&apos;; <code>no-store</code> means
          &apos;never keep it.&apos; When freshness expires, the browser revalidates with <code>ETag</code>/
          <code> If-None-Match</code>, and the server can answer <code>304 Not Modified</code> to skip resending the
          body.&quot; <em>Why:</em> it trades freshness for speed, and the <code>304</code> path saves bandwidth without
          serving stale data.
        </p>

        <h3 className="mt-6 mb-2 text-lg font-semibold">REST status codes</h3>
        <p className="mb-4"><strong>You say:</strong> &quot;The first digit is the category, and a handful carry real meaning:&quot;</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>2xx success</strong> — <code>200</code> OK, <code>201</code> Created, <code>204</code> No Content.</li>
          <li><strong>3xx redirect</strong> — <code>301</code> permanent, <code>304</code> Not Modified (cache hit).</li>
          <li><strong>4xx client error</strong> — <code>400</code> bad request, <code>401</code> unauthenticated, <code>403</code> forbidden, <code>404</code> not found, <code>429</code> rate-limited.</li>
          <li><strong>5xx server error</strong> — <code>500</code> generic, <code>503</code> unavailable.</li>
        </ul>
        <Callout variant="insight" title="The 401 vs 403 follow-up">
          <p>
            &quot;<code>401</code> means &apos;I don&apos;t know who you are&apos; — authenticate and retry. <code>403</code> means &apos;I
            know who you are and you still can&apos;t&apos; — retrying won&apos;t help. Authentication vs authorization in two status
            codes.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-react-network" moduleSlug={MODULE_SLUG} title="React & the network">
        <Quiz
          kind="React keys"
          question="Why is using the array index as a list key dangerous for a reorderable list?"
          options={[
            {
              label: "On reorder/insert the index points at a different item, so React reuses the wrong component state in the wrong row",
              correct: true,
              explanation:
                "Exactly. The key is React's identity for an item across renders. With an index, inserting or reordering re-labels items, so React keeps old DOM/state (like input values) attached to the wrong data.",
            },
            {
              label: "Index keys make React skip reconciliation entirely",
              explanation:
                "Reconciliation still runs — the problem is it matches by the wrong identity. A stable, data-derived key (item.id) lets React move state to the correct item.",
            },
            {
              label: "React forbids number keys; keys must be strings",
              explanation:
                "Numbers are valid keys. The danger isn't the type — it's that an index isn't a stable identity when the list changes order or length.",
            },
          ]}
        />
        <Quiz
          kind="HTTP status codes"
          question="A request returns 401 on one endpoint and 403 on another. What's the difference?"
          options={[
            {
              label: "401 means not authenticated (log in and retry); 403 means authenticated but not authorized (retrying won't help)",
              correct: true,
              explanation:
                "Right. 401 is about identity — you haven't proven who you are. 403 is about permission — you're known but lack access. That's authentication vs authorization in two codes.",
            },
            {
              label: "401 is a client error and 403 is a server error",
              explanation:
                "Both are 4xx client errors. The distinction is identity (401) versus permission (403), not client versus server.",
            },
            {
              label: "They're interchangeable; servers pick one at random",
              explanation:
                "They carry distinct meaning. 401 invites you to authenticate; 403 says access is denied even though you're authenticated.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 13. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="The whole bank, one load-bearing sentence each">
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Event loop.</strong> Microtasks (Promises) drain fully between macrotasks (<code>setTimeout</code>), so a Promise callback beats a <code>setTimeout(0)</code>.</li>
            <li><strong>Closure.</strong> A function plus the variables from its defining scope, kept alive by reference after the outer function returns.</li>
            <li><strong><code>this</code>.</strong> Decided by the call site (new &gt; explicit &gt; implicit &gt; default); arrows capture it lexically and can&apos;t be rebound.</li>
            <li><strong><code>==</code> vs <code>===</code>.</strong> <code>===</code> compares value and type with no coercion — default to it.</li>
            <li><strong>Hoisting &amp; TDZ.</strong> <code>var</code> hoists to <code>undefined</code>; <code>let</code>/<code>const</code> hoist into the TDZ and throw if touched early.</li>
            <li><strong>Prototypes.</strong> Property lookup walks the prototype chain; <code>class</code> is sugar — methods are shared on the prototype.</li>
            <li><strong>Scope.</strong> <code>var</code> is function-scoped; <code>let</code>/<code>const</code> are block-scoped; <code>const</code> blocks reassignment, not mutation.</li>
            <li><strong>Debounce vs throttle.</strong> Debounce = act once after it goes quiet; throttle = act on a fixed cadence while it&apos;s busy.</li>
            <li><strong>Box model &amp; specificity.</strong> <code>border-box</code> folds padding/border into width; specificity is a per-category tuple where IDs beat classes.</li>
            <li><strong>Flex vs grid.</strong> Flex = one axis; grid = two. Stacking context: <code>z-index</code> is relative to its context, not global.</li>
            <li><strong>Delegation.</strong> One parent listener handles many children via bubbling — fewer listeners, works for future elements.</li>
            <li><strong>Keys &amp; reconciliation.</strong> A stable key is identity across renders; index keys misattach state on reorder.</li>
            <li><strong>Controlled vs uncontrolled.</strong> Controlled = React owns the value; uncontrolled = the DOM owns it, read via <code>ref</code>.</li>
            <li><strong><code>useEffect</code>.</strong> List every reactive dependency; clean up what you set up (runs before re-run and on unmount).</li>
            <li><strong>CORS / caching / status.</strong> CORS is browser-enforced opt-in; <code>Cache-Control</code> + <code>ETag</code> drive caching; <code>401</code> = who are you, <code>403</code> = you still can&apos;t.</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 14. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — drill the bank against a timer</h2>
        <p className="mb-4">
          Reading these answers isn&apos;t the drill — <em>saying</em> them is. The project is to{" "}
          <strong>drill the rapid-fire bank out loud against a timer until each answer lands in 60 seconds — record
          yourself, then cut every answer down to its load-bearing sentence.</strong> That last step is the whole point:
          the reflex you want isn&apos;t a paragraph, it&apos;s the one sentence everything else hangs off.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build the bank.</strong> Write each question from this module on one side of a card and your tight
            answer + one-line why on the other. Don&apos;t copy mine verbatim — phrase it the way <em>you&apos;d</em> say it
            out loud, so it sounds like you and not a textbook.
          </li>
          <li>
            <strong>Drill against a 60-second timer.</strong> Shuffle the deck, draw a card, and answer out loud before
            the timer runs out. If you ramble past 60 seconds or stall, the card goes back in the pile. Loop until you
            can clear the whole deck inside the clock.
          </li>
          <li>
            <strong>Record yourself.</strong> Do one full pass on your phone&apos;s voice recorder, then listen back. You&apos;ll
            catch the hedging (&quot;um, so, basically, kind of&quot;), the answers that wander, and the ones where you state the
            <em> what</em> but forget the <em>why</em>. Those are your weak cards.
          </li>
          <li>
            <strong>Cut to the load-bearing sentence.</strong> For every card, find the single sentence that, if it were
            the only thing you said, would still prove you understand it. Star it. That&apos;s the line that must come out
            first and reflexively; everything else is elaboration you offer only if they want more.
          </li>
          <li>
            <strong>Run the &quot;why&quot; gauntlet.</strong> Have a friend ask only follow-up &quot;why&quot; questions — &quot;why does
            the microtask win?&quot;, &quot;why does an index key break?&quot;, &quot;why <code>403</code> not <code>401</code>?&quot; If you
            can survive three layers of &quot;why&quot; on any card, you own it.
          </li>
          <li>
            <strong>Stretch — mix in code-on-the-spot.</strong> For the cards that have a snippet (debounce, closure
            counter, the event-loop ordering), write the code from memory <em>while narrating</em>. Saying it and typing
            it are different reflexes, and the next module is all about typing under pressure.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you came up on the backend, you&apos;ve done this drill before — it&apos;s the front-end version of being able to
            explain ACID, an index B-tree, or a deadlock without notes. The trick is the same: the interviewer isn&apos;t
            testing recall, they&apos;re testing whether the concept is <em>yours</em>. Drill until the why comes out before
            you&apos;ve consciously decided to say it.
          </p>
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
