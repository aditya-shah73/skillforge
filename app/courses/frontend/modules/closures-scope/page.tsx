import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "closures-scope";

const CHECKPOINTS = [
  { id: "cp-scope", title: "Lexical scope and the scope chain" },
  { id: "cp-closure", title: "What a closure actually is" },
  { id: "cp-react", title: "Closures inside React hooks" },
];

export default function ClosuresScopeModule() {
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
          Closures, scope, and the <code>var</code> graveyard
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Every React hook you&apos;ve ever used is a closure. Once you can <em>see</em> that, the &quot;stale state&quot; bug becomes obvious before you write it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine every function is born inside a <strong>room</strong>. The walls of that room are decided <em>where the function was written</em>, not where it&apos;s called from. The room contains the function&apos;s own local variables — and through one-way windows, the function can also see into the rooms it was written inside of (its parent, grandparent, all the way up to the global room).
        </p>
        <p>
          When the function is called and finishes running, you&apos;d expect its room to be demolished. Usually it is. But if the function got <em>handed out the door</em>{" "}— returned, stored in an array, passed as a callback — the room <strong>stays standing</strong>, and the variables inside it stay alive, frozen at whatever value they had the moment the function escaped.
        </p>
        <p>
          That preserved room, with that function still holding a one-way window into it, <em>is</em>{" "}a closure. Nothing more mysterious than that.
        </p>
      </section>

      <section>
        <h2>Lexical scope: the rule that decides which room you&apos;re in</h2>
        <p>
          JavaScript uses <strong>lexical scope</strong>{" "}— &quot;lexical&quot; meaning &quot;where the code was written.&quot; A function&apos;s scope is determined by where you typed it in the source, not by where it&apos;s called.
        </p>
        <pre><code>{`const team = "outer";

function show() {
  console.log(team);
}

function caller() {
  const team = "inner"; // a different variable in a different room
  show();               // logs "outer", not "inner"
}

caller();`}</code></pre>
        <p>
          <code>show</code> was written next to the outer <code>team</code>, so its window looks into the outer room. Calling <code>show</code> from inside <code>caller</code> doesn&apos;t change that. This is the rule the <em>entire</em>{" "}closure system rests on — every JS scope question reduces to &quot;where was this function written?&quot;
        </p>

        <Quiz
          question="Predict the output: `const x = 1; function f() { console.log(x); } function g() { const x = 99; f(); } g();`"
          kind="Predict the output"
          options={[
            { label: "1", correct: true, explanation: "`f` was written next to the outer `x`. Lexical scope means it always looks there, regardless of who calls it." },
            { label: "99", explanation: "That would be dynamic scope — some languages do this, JavaScript does not." },
            { label: "undefined", explanation: "`x` is in scope and assigned. There's no TDZ or hoisting issue here." },
            { label: "ReferenceError", explanation: "`x` is visible from `f` via the scope chain." },
          ]}
        />
      </section>

      <section>
        <h2>The scope chain</h2>
        <p>
          When code references a variable, JS walks <strong>outward</strong>{" "}from the current scope. Inner scope first, then the scope it was written inside, then that one&apos;s parent, until it hits the global scope. First hit wins; if nothing matches, it&apos;s a <code>ReferenceError</code> (or, for assignments without <code>let</code>/<code>const</code>, an accidental global — don&apos;t).
        </p>
        <pre><code>{`const a = "global";

function outer() {
  const a = "outer";
  function inner() {
    const a = "inner";
    console.log(a); // "inner"  — found in own scope, stops walking
  }
  inner();
  console.log(a);   // "outer"
}

outer();
console.log(a);     // "global"`}</code></pre>
        <p>
          The lookup is <em>outward only</em>. An outer function cannot see an inner function&apos;s variables — only the other direction. This asymmetry is the source of every closure pattern you&apos;ll see.
        </p>
      </section>

      <section>
        <h2>The <code>var</code> graveyard: why <code>let</code> and <code>const</code> exist</h2>
        <p>
          Before 2015, JavaScript only had <code>var</code>. <code>var</code> is <em>function-scoped</em>, not block-scoped — meaning a <code>var</code> inside an <code>if</code>{" "}or <code>for</code>{" "}leaks out to enclose the whole function. <code>let</code>{" "}and <code>const</code>{" "}fixed this. Read these two snippets carefully:
        </p>
        <pre><code>{`function withVar() {
  if (true) {
    var x = 1;
  }
  console.log(x); // 1 — var leaked out of the if
}

function withLet() {
  if (true) {
    let x = 1;
  }
  console.log(x); // ReferenceError — let is block-scoped
}`}</code></pre>
        <p>
          The classic interview trap that this powers: the closure-in-a-loop bug.
        </p>
        <pre><code>{`// With var — broken
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Logs: 3, 3, 3`}</code></pre>
        <p>
          Three setTimeout callbacks are scheduled. By the time any of them runs (after the loop finishes), there&apos;s <em>one</em>{" "}<code>i</code>{" "}in the enclosing function scope, and it&apos;s been incremented to <code>3</code>. All three closures share the same room and the same <code>i</code>.
        </p>
        <pre><code>{`// With let — fixed
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Logs: 0, 1, 2`}</code></pre>
        <p>
          <code>let</code>{" "}in a <code>for</code>{" "}header creates a <em>fresh binding per iteration</em>. Each closure now captures its own <code>i</code>, frozen at the value for that iteration. This isn&apos;t just a syntax change — the runtime creates a new scope every loop.
        </p>

        <Callout variant="warn" title="`var` is not just deprecated style — it's a bug source">
          <p className="m-0">If you&apos;re reading old React Class component code or jQuery code, you&apos;ll still see <code>var</code>. Default to <code>const</code> always, <code>let</code> only when you must reassign, and treat <code>var</code> as &quot;there&apos;s probably a closure bug here.&quot; Modern lint configs forbid it.</p>
        </Callout>

        <Quiz
          question="Predict: `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }`"
          kind="Predict the output"
          options={[
            { label: "0 1 2", explanation: "That would happen with `let`. `var` is function-scoped — one shared `i` for all three callbacks." },
            { label: "3 3 3", correct: true, explanation: "Exactly. By the time the callbacks fire, the loop has finished and the shared `i` is 3." },
            { label: "0 0 0", explanation: "Nope — by the time the callbacks fire (async), the loop has already finished incrementing." },
            { label: "ReferenceError", explanation: "`var` is in scope — `i` exists after the loop too." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-scope"
        title="Lexical scope and the scope chain"
        celebration="Scope makes sense now. Closures are about to fall out for free."
      >
        <p>Defend the rule that scope is determined by source location, not call site:</p>
        <Quiz
          question="`function a() { console.log(x); } function b() { const x = 5; a(); } const x = 1; b();` logs…"
          kind="Defend it"
          options={[
            { label: "1", correct: true, explanation: "Lexical scope: `a` was written next to the global `x`. Where `b` calls `a` from doesn't matter." },
            { label: "5", explanation: "That would be dynamic scope — JS doesn't use it." },
            { label: "undefined", explanation: "Global `x` is initialized before `b()` is called." },
            { label: "ReferenceError", explanation: "`x` is in scope via the global." },
          ]}
        />
        <Quiz
          question="Why does `for (let i = 0; i < 3; i++) { setTimeout(() => console.log(i)); }` log `0 1 2` and not `3 3 3`?"
          kind="Defend it"
          options={[
            { label: "`let` is asynchronous-aware", explanation: "There's no such mechanism — `let` doesn't know about async." },
            { label: "Each loop iteration creates a fresh `i` binding, so each closure captures its own `i`", correct: true, explanation: "Right. The spec mandates a fresh binding per iteration with `let` in a for-header. Each setTimeout's closure points at a different `i`." },
            { label: "`setTimeout` reads the value at schedule time", explanation: "It doesn't — the callback reads `i` when it runs. The fix here is purely about which `i` it's pointing at." },
            { label: "`let` is faster than `var`", explanation: "Performance is irrelevant here; the difference is scoping semantics." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The formula: what a closure actually is</h2>
        <p>
          A <strong>closure</strong>{" "}is the combination of:
        </p>
        <ol>
          <li>A function, plus</li>
          <li>The lexical environment it was created in (its &quot;room&quot; — its outer variables).</li>
        </ol>
        <p>
          The function carries its environment with it, like a backpack, wherever it goes. As long as <em>anyone holds a reference to the function</em>, the environment can&apos;t be garbage-collected. That&apos;s the whole mechanism.
        </p>
        <pre><code>{`function makeCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const c1 = makeCounter();
const c2 = makeCounter();

c1(); // 1
c1(); // 2
c2(); // 1  — c2 has its OWN count
c1(); // 3`}</code></pre>
        <p>
          Each call to <code>makeCounter</code> creates a new room with a new <code>count</code>. The returned function carries that specific room with it. <code>c1</code>{" "}and <code>c2</code>{" "}each hold a different backpack, even though they came from the same factory.
        </p>
        <p>
          This is more than a parlor trick — it&apos;s how React hooks work. <code>useState(0)</code>{" "}returns a setter that closes over the right slot in React&apos;s internal storage. Two different <code>useState</code>{" "}calls give you two different closures pointing at two different cells.
        </p>
      </section>

      <section>
        <h2>Worked example: the stale closure bug</h2>
        <p>
          The classic gotcha. A closure remembers its <em>variables</em>, not the values it &quot;saw last.&quot; If the variable has been reassigned, the closure sees the new value. If the variable is a fresh binding (like <code>let</code>{" "}in a loop), the closure is stuck with the old binding forever.
        </p>
        <pre><code>{`function setup() {
  let message = "hello";
  const log = () => console.log(message);
  message = "goodbye";
  log(); // ?
}
setup();`}</code></pre>
        <p>
          This logs <code>&quot;goodbye&quot;</code>. The closure holds a reference to the <em>variable</em>{" "}<code>message</code>, not the string <code>&quot;hello&quot;</code>. By the time <code>log</code>{" "}runs, the variable has been reassigned.
        </p>
        <pre><code>{`function setupFresh() {
  let message = "hello";
  const log = () => console.log(message);
  let other = message;     // <-- copied the value, not the variable
  other = "goodbye";
  log(); // ?
}
setupFresh();`}</code></pre>
        <p>
          This logs <code>&quot;hello&quot;</code>. <code>other</code>{" "}is a different variable; reassigning it doesn&apos;t touch <code>message</code>. The closure&apos;s window is still pointing at <code>message</code>, which never changed.
        </p>
        <Quiz
          question="What does this log? `function make() { let n = 0; const inc = () => n++; const read = () => n; return { inc, read }; } const { inc, read } = make(); inc(); inc(); inc(); console.log(read());`"
          kind="Predict the output"
          options={[
            { label: "0", explanation: "Each `inc()` mutated the same `n` in the shared closure." },
            { label: "1", explanation: "Three calls to inc() each incremented n once." },
            { label: "3", correct: true, explanation: "Yes — `inc` and `read` share the same closure (same room, same n). Three increments, then read sees 3." },
            { label: "NaN", explanation: "`n++` works on a number; nothing turns it into NaN." },
          ]}
        />
      </section>

      <section>
        <h2>Closures hiding in React</h2>
        <p>
          Every hook callback is a closure. Once you see this, half the &quot;why is my state stale&quot; bugs become predictable.
        </p>
        <pre><code>{`function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // ⚠️ closes over the count from THIS render
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps — effect runs once

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`}</code></pre>
        <p>
          The interval&apos;s callback was created during the <em>first</em>{" "}render, when <code>count === 0</code>. It closes over <em>that render&apos;s</em>{" "}<code>count</code>{" "}variable. Subsequent renders create a new <code>count</code>{" "}variable each time — but the interval is still holding the original one. So the log will always print <code>0</code>{" "}no matter how many times you click.
        </p>
        <p>
          There are three legitimate fixes, each making the closure problem explicit:
        </p>
        <ol>
          <li>
            <strong>Add to deps</strong>: <code>[count]</code>{" "}— the effect re-runs every render that changes count, getting a new closure with the new count. The downside: you tear down and rebuild the interval every click.
          </li>
          <li>
            <strong>Use a ref</strong>: store <code>count</code>{" "}in a ref so the interval reads the live value, not a captured snapshot. The closure now holds the ref object (whose <code>.current</code>{" "}mutates), not the count itself.
          </li>
          <li>
            <strong>Functional setter</strong>: <code>setCount(c =&gt; c + 1)</code>{" "}— if the callback is invoking <code>setCount</code>, pass it a function. React passes the latest <code>count</code>{" "}to it directly, bypassing the stale closure.
          </li>
        </ol>

        <Callout variant="insight" title="The interview answer they want">
          <p className="m-0">When the interviewer points at the broken interval and says &quot;what&apos;s wrong?&quot;: &quot;The effect callback is a closure over the first render&apos;s <code>count</code>{" "}variable. Subsequent renders create new <code>count</code>{" "}variables, but the interval is still holding the original. To fix, either include <code>count</code>{" "}in the deps array (rebuilding the closure each time), or use the functional form of <code>setCount</code>{" "}so the latest value is passed in by React.&quot;</p>
        </Callout>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-closure"
        title="What a closure actually is"
        celebration="You've got the formula. Time to use it."
      >
        <Quiz
          question="A closure is…"
          kind="Defend it"
          options={[
            { label: "Any function declared inside another function", explanation: "Close — but the function only matters as a closure once it escapes (returned, stored, passed) and outlives its parent." },
            { label: "A function plus the lexical environment it was created in, kept alive as long as the function is referenced", correct: true, explanation: "Right. The function and its room are bundled; the room can't be GC'd until the function is unreachable too." },
            { label: "A way to make variables private", explanation: "That's a USE of closures, not what they are. The mechanism is the function+environment pair." },
            { label: "A React-specific feature", explanation: "Closures are a JS feature React leans on, not invented by React." },
          ]}
        />
        <Quiz
          question="`function f() { let n = 0; return () => ++n; } const a = f(); const b = f(); a(); a(); b(); a(); console.log(a(), b());`"
          kind="Defend it"
          options={[
            { label: "4 2", correct: true, explanation: "`a` and `b` are independent closures (each call to f() makes a fresh n). a was incremented 3 times before the final calls (3+1 = 4); b was incremented once before (1+1 = 2)." },
            { label: "5 5", explanation: "They don't share n — each f() call creates its own room." },
            { label: "4 1", explanation: "b is called once before, then once in the log — that's 2, not 1." },
            { label: "1 1", explanation: "Closures preserve state across calls; you'd only get 1,1 if n were reset each call." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Variants that show up in interviews</h2>

        <h3>1. The IIFE workaround (pre-<code>let</code> closure-in-loop fix)</h3>
        <p>
          Before <code>let</code>{" "}existed, the fix to the closure-in-a-loop bug was an <strong>IIFE</strong>{" "}(Immediately-Invoked Function Expression):
        </p>
        <pre><code>{`for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// 0 1 2`}</code></pre>
        <p>
          Each iteration calls a fresh function with the current <code>i</code>, creating a fresh room with its own <code>j</code>{" "}parameter. The setTimeout closure captures <code>j</code>{" "}— a different binding per iteration. You shouldn&apos;t write this anymore, but you&apos;ll see it in old code, and interviewers love asking how to fix the bug <em>without</em>{" "}<code>let</code>.
        </p>

        <h3>2. Private state via closure (the module pattern)</h3>
        <pre><code>{`function makeBankAccount(initial) {
  let balance = initial;
  return {
    deposit(amount) { balance += amount; },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
    },
    getBalance() { return balance; },
  };
}

const acc = makeBankAccount(100);
acc.deposit(50);
acc.balance;       // undefined — no way to touch it directly
acc.getBalance();  // 150`}</code></pre>
        <p>
          <code>balance</code>{" "}is invisible outside the closure. No <code>private</code>{" "}keyword needed (though JS now has <code>#field</code>{" "}private fields too — module-pattern closures predate them). This is how every well-written ES5 library kept its internals hidden.
        </p>

        <h3>3. Memoization with closures</h3>
        <pre><code>{`function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}

const slowSquare = (n) => { /* pretend this is expensive */ return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(5); // computes
fastSquare(5); // returns from cache`}</code></pre>
        <p>
          <code>cache</code>{" "}lives in the closure of the returned function. It survives across calls, accumulates results, and stays private to this one memoized function. <code>useMemo</code>{" "}is structurally similar — different storage (React&apos;s fiber), same idea.
        </p>

        <Quiz
          question="In the memoize example above, why is `cache` not reset between calls to `fastSquare(5)`?"
          kind="Quick check"
          options={[
            { label: "Maps are global", explanation: "Maps aren't global — `cache` is local to one call of `memoize`. Each call to `memoize` makes its own." },
            { label: "The returned function closes over `cache`, keeping it alive as long as fastSquare exists", correct: true, explanation: "Exactly. The closure's room contains `cache`, and the room can't be GC'd while fastSquare references it." },
            { label: "Caches persist across function calls by default in JS", explanation: "Local variables of a normal function call vanish; the only reason `cache` survives is because the returned closure holds a reference to it." },
            { label: "It's a side effect of the Map constructor", explanation: "Map vs object doesn't matter here — the persistence is purely about closures." },
          ]}
        />
      </section>

      <section>
        <h2>The project: counter factory + debounce + throttle</h2>
        <p>
          You&apos;re going to implement three small utilities from scratch, in a single scratch file. The goal is to <em>feel</em>{" "}closures in your fingers, not just understand them on paper. Resist the temptation to look up the implementation — write it, run it, fix it.
        </p>
        <Callout variant="insight" title="How to do this project">
          <p className="mb-2">In a Node REPL or browser console, no libraries:</p>
          <ol className="m-0">
            <li>Write each function from scratch. <em>Predict the behavior</em>{" "}before testing it.</li>
            <li>Test by calling it 5–10 times with different timing.</li>
            <li>When it&apos;s wrong (it will be), draw the rooms on paper — what variables live in the closure? what fires when?</li>
          </ol>
          <p className="mt-2 mb-0">The bugs you produce will all be closure-shaped. That&apos;s the point — every one teaches the model.</p>
        </Callout>
        <h3>Part 1: Counter factory</h3>
        <p>Write <code>makeCounter()</code>{" "}with the following surface:</p>
        <pre><code>{`const counter = makeCounter();
counter.increment();      // returns 1
counter.increment();      // returns 2
counter.decrement();      // returns 1
counter.reset();          // returns 0
counter.value();          // returns 0

const counter2 = makeCounter();
counter2.value();         // returns 0 — independent of counter`}</code></pre>
        <p>Constraint: there must be <em>no</em>{" "}way to read or write the count directly from outside the counter object. <code>counter.count</code>{" "}must be <code>undefined</code>.</p>

        <h3>Part 2: <code>debounce(fn, ms)</code></h3>
        <p>
          Debounce delays calling <code>fn</code>{" "}until <code>ms</code>{" "}milliseconds have passed without a new call. Useful for autosave, search-as-you-type, resize handlers.
        </p>
        <pre><code>{`const log = debounce((q) => console.log("searching:", q), 300);
log("h");
log("he");
log("hel");
// after 300ms of silence, prints once: "searching: hel"`}</code></pre>
        <p>Hints (closure-shaped):</p>
        <ul>
          <li>You need to remember the last <code>setTimeout</code>{" "}id between calls — where do you store it?</li>
          <li>On each call, cancel the previous timer and schedule a new one.</li>
          <li>Pass the original arguments through.</li>
        </ul>

        <h3>Part 3: <code>throttle(fn, ms)</code></h3>
        <p>
          Throttle calls <code>fn</code>{" "}at most once every <code>ms</code>{" "}milliseconds. Useful for scroll handlers, analytics events, hover tracking.
        </p>
        <pre><code>{`const log = throttle((q) => console.log("scrolled:", q), 200);
// In a tight loop calling log() — only one log every 200ms, regardless of call rate.`}</code></pre>
        <p>Hints:</p>
        <ul>
          <li>You need to remember the last fire time — where does that live?</li>
          <li>On each call, check &quot;has at least <code>ms</code>{" "}passed since the last fire?&quot; If yes, fire and update the timestamp. If no, drop the call (or, fancier: queue it).</li>
          <li>The simple version is ~6 lines. The version that also fires the trailing call is ~15.</li>
        </ul>
        <p>
          Once you&apos;ve written all three, you&apos;ll have built the same pattern three times — a function that captures state in its closure and persists it across calls. That&apos;s the entire mental model.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-react"
        title="Closures inside React hooks"
        celebration="You can now read every hook callback as a closure. Stale-state bugs will jump out at you."
      >
        <Quiz
          question="Why does an empty-deps `useEffect(() => setInterval(() => console.log(count), 1000), [])` always log the same `count`, even after state updates?"
          kind="Defend it"
          options={[
            { label: "React caches the effect callback", explanation: "Effects aren't cached separately — the issue is the closure inside, not React's behavior." },
            { label: "The interval callback is a closure over the first render's `count` variable; later renders create new variables but the interval still holds the original", correct: true, explanation: "Exactly. Empty deps means the effect runs once with the first-render closure, and that closure's `count` never changes." },
            { label: "`setInterval` only reads its argument once", explanation: "It calls its callback over and over — the issue is that the callback's `count` reference is stuck." },
            { label: "`useEffect` is async", explanation: "Async timing isn't the cause; the closed-over variable is." },
          ]}
        />
        <Quiz
          question="To fix the stale closure in the interval, the cleanest option is…"
          kind="Defend it"
          options={[
            { label: "Wrap `count` in `useMemo`", explanation: "useMemo memoizes a derived value; it doesn't refresh the closure inside an interval." },
            { label: "Use the functional form: `setCount(c => c + 1)` if you're updating; or store count in a ref if you're reading", correct: true, explanation: "Right. The functional setter receives the latest value from React, bypassing the closure. A ref gives the callback a stable object whose .current mutates." },
            { label: "Switch to `useState` from `useReducer`", explanation: "Hook choice doesn't fix the closure — you'd have the same bug with either." },
            { label: "Replace `setInterval` with `setTimeout`", explanation: "Same closure issue applies to setTimeout too." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <p>
          When the interviewer asks <em>&quot;explain closures&quot;</em>, here&apos;s what comes out of your mouth:
        </p>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;A closure is a function plus the lexical environment it was defined in. When the function is created, it captures references to the variables in its enclosing scopes — not their values, the variables themselves. As long as anything holds a reference to that function, those captured variables can&apos;t be garbage-collected, so they live on alongside the function. That&apos;s how factories like <code>makeCounter</code>{" "}can return a function that keeps incrementing a private <code>count</code>{" "}across calls, and it&apos;s how React hooks work — every <code>useEffect</code>{" "}or <code>useCallback</code>{" "}callback is a closure over the render it was created in. That last bit is also where the &apos;stale state&apos; bug comes from: a callback created in render 1 still holds render 1&apos;s variables, even after render 2 has happened. The fix is either to put the variable in the deps array (rebuilding the closure each render) or to use a ref or functional setter to read the live value instead.&quot;
          </p>
        </Callout>
        <p>
          You&apos;ve just signaled: you know the mechanism, you know the lifetime, you know the React tie-in, you can debug a real bug. That&apos;s a mid-senior signal in one paragraph.
        </p>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 3 is <strong><code>this</code>{" "}binding</strong>. With closures, you understand how a function remembers its <em>variables</em>. <code>this</code>{" "}is a separate question: at <em>call time</em>, what context is it running in? The two systems are independent — which is exactly why arrow functions, which inherit <code>this</code>{" "}lexically, became the cleanest way to write React event handlers.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
