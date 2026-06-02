import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "coding-challenges";

const CHECKPOINTS = [
  { id: "cp-method", title: "The method under pressure" },
  { id: "cp-utilities", title: "Utility implementations" },
  { id: "cp-react", title: "Hooks & components" },
];

export default function CodingChallengesModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
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
          Front-end coding challenges, the ones that actually come up
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          There&apos;s a short, predictable list of problems interviewers ask you to <em>build from scratch</em>: debounce,
          a custom hook, an autocomplete, <code>Promise.all</code>. The code is the easy part. What gets you the offer is
          <em> how you perform</em> while you type, clarifying, narrating, handling the edge cases out loud.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The driving test, not the trivia quiz</h2>
        <p className="mb-4">
          A live-coding round feels like an exam, so candidates treat it like one: read the question, write the answer,
          hand it in, hope it&apos;s right. But it&apos;s closer to a <strong>driving test.</strong> The examiner in the passenger
          seat already knows the route. They&apos;re not checking whether you <em>reach</em> the destination, they&apos;re watching
          how you <em>drive</em>: do you check your mirrors, signal before you turn, narrate the hazard you just spotted?
        </p>
        <p className="mb-4">
          Two candidates can write the exact same <code>debounce</code> in the exact same five minutes. One did it in
          silence, jumped straight to code, and shipped a version that breaks on <code>this</code>. The other said
          &quot;let me confirm the trailing-edge behavior, I&apos;ll preserve the call context, and I&apos;ll add a <code>cancel</code>
          method since real usage needs cleanup.&quot; <strong>Same code. Completely different signal.</strong> The second
          candidate sounded like someone you&apos;d trust with production.
        </p>
        <p className="mb-4">
          That is the whole game. These problems are <em>known</em>, there are maybe a dozen of them and you&apos;ll see them
          in this module. Knowing the solution is table stakes. The differentiator is the <strong>method</strong>: a
          repeatable way to turn a vague prompt into clarified requirements, a stated plan, working code, and a discussion
          of edge cases and complexity, all while talking the entire time.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            We&apos;ll implement five or six of the classic challenges with real, correct code, but each one is a vehicle for
            the <em>method</em>. By the end you should be able to attack any &quot;implement X&quot; prompt with the same four moves:
            clarify, plan out loud, code the happy path, then hammer the edges. The code you can memorize; the method is
            what survives a problem you&apos;ve never seen.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE METHOD ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The four moves (run this on every prompt)</h2>
        <p className="mb-4">
          When the prompt lands, &quot;implement <code>debounce</code>&quot;, your instinct will scream &quot;I know this, just type
          it.&quot; Resist for sixty seconds. Run the loop instead. It costs almost no time and changes how the whole round
          reads.
        </p>
        <pre><code>{`1. CLARIFY    What exactly am I building? Inputs, outputs, edge behavior?
2. PLAN       Say the approach out loud BEFORE typing. Name the data structure.
3. CODE       Happy path first, talking through each line as you write it.
4. EDGES      Empty input, cancellation, cleanup, errors — then complexity.`}</code></pre>
        <p className="mb-4">
          Notice clarify and plan come <em>before</em> a single character of code. That ordering is the entire difference
          between &quot;junior who can code&quot; and &quot;engineer I&apos;d hire.&quot; Three concrete things to do in the first minute:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Restate the problem in your words.</strong> &quot;So I want a function that wraps another function and only
            actually calls it after the caller has stopped invoking it for N milliseconds, is that right?&quot; This catches
            misunderstandings for free and shows you don&apos;t just pattern-match on the function name.
          </li>
          <li>
            <strong>Ask the one question that changes the design.</strong> For debounce: &quot;leading edge, trailing edge, or
            both?&quot; For a deep clone: &quot;do I need to handle circular references and <code>Map</code>/<code>Set</code>, or just
            plain objects and arrays?&quot; The scope answer can halve or double the code.
          </li>
          <li>
            <strong>State your assumptions out loud.</strong> &quot;I&apos;ll assume trailing-edge only and that the wrapped function
            doesn&apos;t return a value we need, stop me if you want the leading edge too.&quot; Now you have a contract.
          </li>
        </ul>
        <Callout variant="warn" title="The silence trap">
          <p>
            The single most common way to bomb a live-coding round is to <em>go quiet and type</em>. The interviewer can&apos;t
            grade thinking they can&apos;t hear. If you solve it perfectly in silence, you&apos;ve demonstrated that you can solve
            it, but not that you can <em>collaborate</em> on it, which is the thing they&apos;re actually hiring for. Narrate
            constantly, even when it feels awkward. <em>Especially</em> when it feels awkward.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. DEBOUNCE & THROTTLE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 1, <code>debounce</code> (and its cousin <code>throttle</code>)</h2>
        <p className="mb-4">
          The most-asked front-end utility, bar none. <strong>Debounce</strong> waits until the calls stop: it resets a
          timer on every invocation and only fires once the caller has gone quiet for <code>delay</code> ms. Perfect for a
          search box, fire the request after the user stops typing, not on every keystroke.
        </p>
        <p className="mb-4">
          Narrate the plan first: &quot;I&apos;ll keep a timer id in the closure. Each call clears the pending timer and schedules
          a new one. I&apos;ll preserve <code>this</code> and the arguments so it&apos;s a transparent wrapper, and I&apos;ll add a
          <code>cancel</code> method because real usage needs to clear it on unmount.&quot;
        </p>
        <pre><code>{`function debounce(fn, delay) {
  let timer = null;

  function debounced(...args) {
    clearTimeout(timer);                 // cancel the pending call
    timer = setTimeout(() => {
      fn.apply(this, args);              // preserve context + args
    }, delay);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}`}</code></pre>
        <p className="mb-4">
          The <code>this</code> detail is the one interviewers watch for. Note the inner function is a <em>regular</em>
          function, not an arrow, an arrow would capture the surrounding <code>this</code> instead of the call-site one.
          Inside the <code>setTimeout</code> callback we use an arrow precisely so it keeps the <code>debounced</code>
          call&apos;s <code>this</code>. Saying that out loud is worth more than the rest of the function combined.
        </p>
        <p className="mb-4">
          <strong>Throttle</strong> is the &quot;at most once per interval&quot; cousin, it fires immediately, then ignores calls
          until the cooldown passes. Useful for scroll/resize handlers where you want updates, just not 200 per second:
        </p>
        <pre><code>{`function throttle(fn, interval) {
  let lastCall = 0;

  return function throttled(...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn.apply(this, args);              // run on the leading edge
    }
    // otherwise: ignore this call entirely
  };
}`}</code></pre>
        <Callout variant="insight" title="Say the difference in one sentence">
          <p>
            &quot;Debounce waits for the calls to <em>stop</em> and fires once at the end; throttle lets calls through at a
            fixed <em>rate</em> and drops the ones in between. Search input wants debounce; scroll position wants throttle.&quot;
            That sentence, said unprompted, tells the interviewer you understand <em>when</em> to use each, which is the
            real question hiding behind &quot;implement debounce.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. DEEP CLONE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 2, a deep clone</h2>
        <p className="mb-4">
          &quot;Write a function that deep-clones an object.&quot; The trap is answering too fast: <code>JSON.parse(JSON.stringify(x))</code>
          works for plain JSON but silently drops functions, <code>undefined</code>, and <code>Date</code>/<code>Map</code>/
          <code>Set</code>, and <em>throws</em> on circular references. The interviewer is fishing for whether you know that.
        </p>
        <p className="mb-4">
          So clarify first: &quot;Plain objects and arrays only, or do I need <code>Date</code>, <code>Map</code>,
          <code>Set</code>, and circular references? I&apos;ll build a recursive version that handles arrays, objects, and
          cycles via a <code>WeakMap</code>, that&apos;s the version that doesn&apos;t blow up on real data.&quot;
        </p>
        <pre><code>{`function deepClone(value, seen = new WeakMap()) {
  // primitives (and functions) are returned as-is
  if (value === null || typeof value !== "object") return value;

  // already cloned this node? return the existing copy (handles cycles)
  if (seen.has(value)) return seen.get(value);

  if (value instanceof Date) return new Date(value);
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);

  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);                 // record BEFORE recursing

  for (const key of Reflect.ownKeys(value)) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}`}</code></pre>
        <p className="mb-4">
          The load-bearing line is <code>seen.set(value, copy)</code> <em>before</em> the recursion. If an object points
          back at itself (or a parent), the recursive call finds it already in <code>seen</code> and returns the in-progress
          copy instead of recursing forever. Walk through that case out loud, &quot;here&apos;s how the cycle terminates&quot;, because
          it&apos;s the one detail that separates a clone that works from one that stack-overflows.
        </p>
        <Callout variant="warn" title="Lead with the limitation, not the shortcut">
          <p>
            It&apos;s fine to <em>mention</em> <code>structuredClone</code> (the modern built-in) or the JSON trick, but lead
            with &quot;the JSON approach drops functions and breaks on cycles, so I&apos;ll write a real recursive clone&quot; rather than
            reaching for the shortcut and getting caught when they ask about a <code>Date</code>. Naming the failure mode
            first is what they&apos;re grading.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. EVENT EMITTER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 3, a tiny event emitter (pub/sub)</h2>
        <p className="mb-4">
          &quot;Implement an <code>on</code>/<code>off</code>/<code>emit</code> event system.&quot; This tests whether you reach for
          the right data structure unprompted. Plan it out loud: &quot;a <code>Map</code> from event name to a <code>Set</code>
          of listeners, a <code>Set</code> so the same listener can&apos;t register twice and removal is O(1). <code>on</code>
          returns an unsubscribe function, which is the ergonomic API people actually want.&quot;
        </p>
        <pre><code>{`class EventEmitter {
  constructor() {
    this.events = new Map();            // name -> Set<listener>
  }

  on(name, listener) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(listener);
    return () => this.off(name, listener);   // unsubscribe handle
  }

  off(name, listener) {
    this.events.get(name)?.delete(listener);
  }

  emit(name, ...args) {
    // copy to a array first so a listener that unsubscribes
    // mid-emit doesn't mutate the Set we're iterating
    const listeners = this.events.get(name);
    if (!listeners) return;
    for (const listener of [...listeners]) {
      listener(...args);
    }
  }
}`}</code></pre>
        <p className="mb-4">
          The edge case worth flagging is the <code>[...listeners]</code> copy in <code>emit</code>. If a listener
          unsubscribes itself (or another) while you&apos;re iterating the live <code>Set</code>, you can skip listeners or
          throw. Copying first makes <code>emit</code> a stable snapshot. Most candidates miss this; naming it makes you
          look like you&apos;ve been bitten by it in production, which is exactly the impression you want.
        </p>
        <Callout variant="insight" title="Returning the unsubscribe function">
          <p>
            Having <code>on</code> return <code>() =&gt; this.off(...)</code> is a small touch that signals API taste. It&apos;s
            the same pattern React&apos;s <code>useEffect</code> cleanup uses, and it spares the caller from holding onto the
            exact listener reference to remove it later. Mention that connection, tying the challenge back to a real API
            you know reads as fluency, not memorization.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-method" moduleSlug={MODULE_SLUG} title="The method under pressure">
        <Quiz
          kind="Process"
          question="The interviewer says 'implement debounce'. You're confident you know it. What should you do first?"
          options={[
            {
              label: "Restate the problem, ask the one scoping question (leading/trailing edge?), and state your assumptions before typing",
              correct: true,
              explanation:
                "Yes. Even on a problem you know cold, the clarify + plan moves are what's being graded. Sixty seconds of restating and scoping turns 'a junior who can code' into 'an engineer I'd hire'.",
            },
            {
              label: "Start typing immediately so you don't waste the limited time",
              explanation:
                "The silence-and-type instinct is the most common way to underperform. The interviewer can't grade thinking they can't hear, and you'll miss the scoping question (edge behavior) that changes the code.",
            },
            {
              label: "Ask which testing framework they want you to use first",
              explanation:
                "That's not the question that changes the design. Clarify the behavior of the thing you're building (edge behavior, inputs/outputs), not the tooling around it.",
            },
          ]}
        />
        <Quiz
          kind="Narration"
          question="Why narrate continuously while you code in a live round, even when it feels awkward?"
          options={[
            {
              label: "The interviewer is grading how you think and collaborate; silent code only proves you can solve it alone, not work with someone",
              correct: true,
              explanation:
                "Exactly. The round is a driving test, not a trivia quiz. Two identical solutions get different scores based on whether the candidate talked through approach, tradeoffs, and edge cases out loud.",
            },
            {
              label: "Because talking makes you type faster",
              explanation:
                "Narration usually slows your typing slightly, and that's fine. The point isn't speed; it's making your reasoning observable so it can be evaluated.",
            },
            {
              label: "Because interviewers deduct points for any pause longer than five seconds",
              explanation:
                "There's no such rule. Thoughtful pauses are fine. The issue is solving the entire problem in silence, which leaves your process invisible.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. PROMISE.ALL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 4, <code>Promise.all</code> from scratch</h2>
        <p className="mb-4">
          A favorite because it forces you to reason about asynchrony without leaning on <code>async/await</code>. The
          contract: take an array of promises, return a single promise that resolves to an array of results <em>in input
          order</em>, or rejects as soon as <em>any</em> input rejects.
        </p>
        <p className="mb-4">
          Plan out loud: &quot;I&apos;ll return a new <code>Promise</code>. I&apos;ll keep a results array and a counter. Each input
          settles independently, so I write each result into <em>its own index</em>, never <code>push</code>, because
          push order follows completion order, not input order. When the counter hits the input length, I resolve. Any
          rejection rejects the whole thing immediately.&quot;
        </p>
        <pre><code>{`function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;

    if (remaining === 0) {              // edge case: empty input
      resolve(results);
      return;
    }

    promises.forEach((p, index) => {
      // wrap with Promise.resolve so non-promise values work too
      Promise.resolve(p).then(
        (value) => {
          results[index] = value;       // write to the SLOT, preserve order
          remaining -= 1;
          if (remaining === 0) resolve(results);
        },
        (err) => reject(err)            // first rejection wins
      );
    });
  });
}`}</code></pre>
        <p className="mb-4">
          Two edges to name without prompting. First, the <strong>empty array</strong>: <code>Promise.all([])</code>
          resolves immediately to <code>[]</code>, forget the early return and your counter never reaches zero, so the
          promise hangs forever. Second, <strong>ordering</strong>: writing to <code>results[index]</code> instead of
          pushing is what guarantees output order matches input order even though promises settle in arbitrary order.
        </p>
        <Callout variant="insight" title="Mention the variants, briefly">
          <p>
            A great closer: &quot;<code>Promise.allSettled</code> would never reject, it&apos;d resolve with a
            <code>{"{ status, value | reason }"}</code> per entry. <code>Promise.race</code> settles on the
            <em> first</em> to finish, win or lose. <code>Promise.any</code> resolves on the first <em>success</em>.&quot; You
            don&apos;t have to implement them, naming how they differ shows you understand the whole family, not one
            memorized function.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. RETRY WITH BACKOFF ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 5, retry with exponential backoff</h2>
        <p className="mb-4">
          &quot;Wrap an async function so it retries on failure with increasing delays.&quot; This one rewards <code>async/await</code>
          and a clear stopping condition. Plan: &quot;loop up to <code>retries</code> times; <code>await</code> the function in a
          <code>try</code>; on failure, if attempts remain, wait <code>base × 2^attempt</code> ms and try again; if not,
          rethrow the last error so the caller still sees a real failure.&quot;
        </p>
        <pre><code>{`async function retry(fn, { retries = 3, base = 200 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();                // success: return immediately
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;   // out of attempts: stop

      const delay = base * 2 ** attempt;  // 200, 400, 800, ...
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;                      // surface the real failure
}`}</code></pre>
        <p className="mb-4">
          The detail that earns the nod: <strong>rethrow the last error.</strong> A retry wrapper that swallows the final
          failure and returns <code>undefined</code> is worse than no retry at all, the caller can&apos;t tell &quot;succeeded with
          nothing&quot; from &quot;failed silently.&quot; Also mention you&apos;d normally add <em>jitter</em> (a small random offset) so a
          thousand clients don&apos;t all retry on the exact same schedule and stampede the server. Saying &quot;jitter&quot; unprompted
          is a strong production signal.
        </p>
        <Callout variant="warn" title="Not everything should be retried">
          <p>
            Flag this out loud: retrying a <code>500</code> or a network blip makes sense; retrying a <code>400</code> or
            <code>401</code> does not, the request is malformed or unauthorized and will fail identically every time. A
            real wrapper takes a <code>shouldRetry(err)</code> predicate. You don&apos;t have to build it, but naming that you
            <em>wouldn&apos;t</em> blindly retry every error shows judgment.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. CURRY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 6, <code>curry</code> (the recursion warm-up)</h2>
        <p className="mb-4">
          A quick one that tests recursion and <code>fn.length</code> (a function&apos;s declared arity). The contract:
          <code>curry(fn)</code> returns a function you can call with arguments one at a time or in groups; once enough
          arguments have arrived to satisfy the original arity, it invokes <code>fn</code>.
        </p>
        <pre><code>{`function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);          // enough args: call it
    }
    // not enough yet: return a fn that collects more
    return (...next) => curried.apply(this, [...args, ...next]);
  };
}

// const add = (a, b, c) => a + b + c;
// const c = curry(add);
// c(1)(2)(3) === 6   and   c(1, 2)(3) === 6   and   c(1)(2, 3) === 6`}</code></pre>
        <p className="mb-4">
          The hinge is <code>args.length &gt;= fn.length</code>: <code>fn.length</code> is how many parameters the original
          function declared, so you compare collected args against it. While short, you return a collector that
          concatenates and recurses; once satisfied, you call through. Demoing the three call shapes
          (<code>c(1)(2)(3)</code>, <code>c(1, 2)(3)</code>, <code>c(1)(2, 3)</code>) proves it actually works and reads as
          rigor.
        </p>
      </section>

      {/* ───────────────────────── 9. USEFETCH HOOK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 7, a <code>useFetch</code> hook</h2>
        <p className="mb-4">
          The React-flavored version of an implement-X prompt. &quot;Build a hook that fetches a URL and exposes the result.&quot;
          This is where everything from the data-fetching module pays off: the interviewer is watching for whether you
          handle the <strong>four states</strong> and the <strong>race condition</strong> unprompted.
        </p>
        <p className="mb-4">
          Plan: &quot;I&apos;ll track <code>data</code>, <code>error</code>, and a <code>loading</code> flag. I&apos;ll fetch in an
          effect keyed on the URL, check <code>res.ok</code> myself since <code>fetch</code> doesn&apos;t reject on 404/500, and
          cancel superseded requests with an <code>AbortController</code> in the cleanup so a slow stale response can&apos;t
          overwrite a newer one.&quot;
        </p>
        <pre><code>{`function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;   // expected on cleanup
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();             // cancel on url change / unmount
  }, [url]);

  return { data, error, loading };
}`}</code></pre>
        <p className="mb-4">
          Two lines do the heavy lifting. <code>if (!res.ok) throw</code> turns HTTP errors into real failures,
          <code>fetch</code> only rejects on <em>network</em> errors, so a 500 would otherwise sail through as &quot;success.&quot;
          And <code>return () =&gt; controller.abort()</code> in the cleanup cancels the previous request whenever
          <code>url</code> changes, which kills the race condition. Call those out explicitly, they&apos;re the difference
          between a toy hook and one you&apos;d ship.
        </p>
        <Callout variant="insight" title="Name what you'd add next">
          <p>
            Close with the honest follow-up: &quot;In production I&apos;d reach for React Query or SWR rather than ship this,
            they give caching, dedup, retries, and refetch-on-focus for free, and I&apos;d be re-deriving all of that badly by
            hand.&quot; Knowing when <em>not</em> to hand-roll is itself a senior signal.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-utilities" moduleSlug={MODULE_SLUG} title="Utility implementations">
        <Quiz
          kind="Promise.all"
          question="When implementing Promise.all from scratch, why write each result to results[index] instead of results.push(value)?"
          options={[
            {
              label: "Promises settle in arbitrary order; writing to the input index guarantees the output array matches input order",
              correct: true,
              explanation:
                "Exactly. push() records completion order, which is non-deterministic. Indexing by the original position preserves input order regardless of which promise resolves first.",
            },
            {
              label: "push() is slower than index assignment in JavaScript",
              explanation:
                "Performance isn't the reason. The correctness issue is ordering: push would scramble the output to match completion order, not input order.",
            },
            {
              label: "results.push doesn't work inside a .then() callback",
              explanation:
                "push works fine inside a then callback. The problem is purely that it appends in completion order, breaking the input-order guarantee Promise.all makes.",
            },
          ]}
        />
        <Quiz
          kind="Edge cases"
          question="Your from-scratch Promise.all hangs forever on one specific input. Which, and why?"
          options={[
            {
              label: "An empty array, with no promises, the 'remaining' counter never decrements to zero, so resolve is never called",
              correct: true,
              explanation:
                "Right. Promise.all([]) must resolve immediately to []. Without an explicit early return for length 0, the counter starts and stays above zero and the promise never settles.",
            },
            {
              label: "An array with one promise, a single element can't trigger resolve",
              explanation:
                "A single promise works fine: it settles, the counter hits zero, resolve fires. The hang happens specifically with zero elements.",
            },
            {
              label: "An array containing a non-promise value like 42",
              explanation:
                "Wrapping each input in Promise.resolve(p) handles raw values cleanly, 42 becomes a resolved promise. That doesn't hang; the empty array (no early return) does.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 10. AUTOCOMPLETE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 8, a typeahead / autocomplete</h2>
        <p className="mb-4">
          The crown jewel of front-end live-coding, because it bundles three skills at once: <strong>debounce</strong>,
          <strong>request cancellation</strong>, and <strong>the four UI states.</strong> Plan out loud: &quot;controlled
          input, debounce the query so I don&apos;t fire per keystroke, abort the in-flight request when a newer one starts so
          a stale response can&apos;t win, and render loading / error / empty / results distinctly.&quot;
        </p>
        <pre><code>{`function Autocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle|loading|error|success

  useEffect(() => {
    if (!query) { setStatus("idle"); setResults([]); return; }

    const controller = new AbortController();
    setStatus("loading");

    // debounce: wait for typing to pause before firing
    const timer = setTimeout(() => {
      fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
          return res.json();
        })
        .then((data) => { setResults(data); setStatus("success"); })
        .catch((err) => {
          if (err.name === "AbortError") return;  // superseded — ignore
          setStatus("error");
        });
    }, 300);

    return () => {
      clearTimeout(timer);     // cancel a not-yet-fired request
      controller.abort();      // cancel an already-fired one
    };
  }, [query]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {status === "loading" && <Spinner />}
      {status === "error" && <p>Something went wrong.</p>}
      {status === "success" && results.length === 0 && <p>No results.</p>}
      <ul>{results.map((r) => <li key={r.id}>{r.label}</li>)}</ul>
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          The cleanup does <em>both</em> jobs and that&apos;s the part to narrate: <code>clearTimeout(timer)</code> cancels a
          request that hasn&apos;t fired yet (the debounce window reset because the user kept typing), and
          <code>controller.abort()</code> cancels one already in flight. Together they guarantee that only the response to
          the <em>current</em> query can ever reach <code>setResults</code>. That&apos;s the race condition, killed.
        </p>
        <Callout variant="warn" title="Don't forget accessibility, even here">
          <p>
            If you have a spare minute, say: &quot;a production autocomplete is the ARIA combobox pattern,
            <code>role=&quot;combobox&quot;</code>, <code>aria-expanded</code>, <code>aria-activedescendant</code> for the highlighted
            option, and full keyboard nav with arrow keys and Escape.&quot; You don&apos;t have to wire it all up under time
            pressure, but flagging it unprompted is a senior signal most candidates skip entirely.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 11. TABS / ACCORDION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 9, an accessible Tabs component</h2>
        <p className="mb-4">
          &quot;Build a tabs component.&quot; The naive version renders buttons and swaps a panel, and misses everything that
          makes tabs <em>tabs</em> to a screen reader. Clarify: &quot;controlled or uncontrolled? I&apos;ll do uncontrolled with an
          active index in state, and I&apos;ll wire the ARIA roles and keyboard nav because that&apos;s what distinguishes a real
          tabs widget from styled buttons.&quot;
        </p>
        <pre><code>{`function Tabs({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={i === active}
            aria-controls={\`panel-\${tab.id}\`}
            id={\`tab-\${tab.id}\`}
            tabIndex={i === active ? 0 : -1}   // roving tabindex
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setActive((a) => (a + 1) % tabs.length);
              if (e.key === "ArrowLeft")  setActive((a) => (a - 1 + tabs.length) % tabs.length);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={\`panel-\${tab.id}\`}
          aria-labelledby={\`tab-\${tab.id}\`}
          hidden={i !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          The two things that read as &quot;I know accessibility&quot;: the <strong>roving tabindex</strong>
          (<code>tabIndex={"{"}i === active ? 0 : -1{"}"}</code>, so Tab enters the tablist once and arrow keys move between
          tabs) and the <code>aria-controls</code>/<code>aria-labelledby</code> pairing that links each tab to its panel.
          The same wrapping arithmetic, <code>(a - 1 + len) % len</code>, handles arrow-key looping without going
          negative. An accordion is the same skeleton with <code>aria-expanded</code> per section instead of a tablist.
        </p>
      </section>

      {/* ───────────────────────── 12. TREE FROM FLAT DATA ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Challenge 10, build a tree from flat data</h2>
        <p className="mb-4">
          A classic data-shaping problem: you get a flat list of nodes, each with an <code>id</code> and a
          <code>parentId</code>, and must assemble the nested tree. The naive approach searches the array for children at
          every node, O(n²). The clean approach is <strong>one pass to index by id, one pass to link</strong>, O(n).
        </p>
        <pre><code>{`function buildTree(items) {
  const byId = new Map();
  const roots = [];

  // pass 1: index every node, give each a children array
  for (const item of items) {
    byId.set(item.id, { ...item, children: [] });
  }

  // pass 2: attach each node to its parent (or to roots)
  for (const item of items) {
    const node = byId.get(item.id);
    if (item.parentId == null) {
      roots.push(node);
    } else {
      byId.get(item.parentId)?.children.push(node);
    }
  }

  return roots;
}`}</code></pre>
        <p className="mb-4">
          State the complexity unprompted: &quot;two linear passes, so O(n) time and O(n) space, the <code>Map</code> is what
          buys the constant-time parent lookup that turns the O(n²) search-the-array version into O(n).&quot; Naming the
          complexity and <em>why</em> the map earns it is the move; it&apos;s the same instinct that makes you reach for a hash
          map in any &quot;avoid the nested loop&quot; problem. Rendering it in React is then a recursive component that maps over
          <code>node.children</code>.
        </p>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-react" moduleSlug={MODULE_SLUG} title="Hooks & components">
        <Quiz
          kind="useFetch"
          question="In a useFetch hook, what does returning () => controller.abort() from the effect actually fix?"
          options={[
            {
              label: "The race condition, it cancels the previous request when the URL changes, so a slow stale response can't overwrite newer data",
              correct: true,
              explanation:
                "Correct. Cleanup runs before the effect re-runs (and on unmount). Aborting the superseded request means only the current URL's response can reach setData.",
            },
            {
              label: "It makes fetch reject on HTTP 404/500 instead of resolving",
              explanation:
                "That's a different fix, the explicit `if (!res.ok) throw` line handles HTTP errors. abort() is about cancelling superseded requests to kill the race condition.",
            },
            {
              label: "It retries the request automatically if it fails",
              explanation:
                "abort() cancels, it doesn't retry. Retry-with-backoff is a separate concern; AbortController's job here is cancellation to prevent stale overwrites.",
            },
          ]}
        />
        <Quiz
          kind="Autocomplete"
          question="Your debounced autocomplete's effect cleanup calls BOTH clearTimeout(timer) and controller.abort(). Why both?"
          options={[
            {
              label: "clearTimeout cancels a request that hasn't fired yet (still in the debounce window); abort cancels one already in flight",
              correct: true,
              explanation:
                "Exactly. The two cover different moments: a keystroke during the 300ms wait clears the pending timer, while a keystroke after the request fired aborts it mid-flight. Together only the current query's response can win.",
            },
            {
              label: "They're redundant, either one alone fully handles cancellation",
              explanation:
                "Not redundant. clearTimeout can't cancel an already-sent request, and abort() does nothing to a timer that hasn't fired. You need both to cover both moments.",
            },
            {
              label: "clearTimeout handles errors and abort handles loading state",
              explanation:
                "Neither manages error or loading state, both are purely about cancelling the previous request at different stages of its lifecycle.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 13. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks 'how do you approach a live-coding round?'">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Clarify before you type.</strong> Restate the problem, ask the one scoping question that changes the
              design (leading/trailing edge? circular refs?), and state my assumptions out loud.
            </li>
            <li>
              <strong>Plan out loud.</strong> Name the data structure and approach before writing, &quot;a <code>Map</code> of
              name to a <code>Set</code> of listeners,&quot; &quot;results written by index to preserve order.&quot;
            </li>
            <li>
              <strong>Code the happy path, narrating.</strong> Talk through each line; never go silent and type.
            </li>
            <li>
              <strong>Hammer the edges.</strong> Empty input, cancellation, cleanup, the race condition, rethrowing the
              real error, then state the complexity.
            </li>
            <li>
              <strong>Close with what I&apos;d add next.</strong> Jitter on retries, the combobox a11y pattern, &quot;in prod I&apos;d
              reach for React Query.&quot; Knowing when not to hand-roll is itself the signal.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 14. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, five timed challenges, narrated aloud</h2>
        <p className="mb-4">
          Solve five classics <strong>from scratch under a timer, narrating out loud</strong> (record yourself, or rope in
          a friend to play interviewer), then review each for the edge cases an interviewer would probe. The narration is
          the point; if you solve it in silence you&apos;ve only practiced half the skill.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Debounce (10 min).</strong> Implement it, then run the four moves out loud: clarify leading vs trailing
            edge, preserve <code>this</code> and args, add a <code>cancel</code> method. Probe: &quot;what breaks if the inner
            callback is an arrow function?&quot;
          </li>
          <li>
            <strong><code>useFetch</code> (15 min).</strong> Build the hook with all four states. Probe yourself: &quot;where&apos;s
            the race condition, and which line kills it?&quot; and &quot;why does <code>fetch</code> not reject on a 500?&quot;
          </li>
          <li>
            <strong>Accessible autocomplete (20 min).</strong> Combine debounce, <code>AbortController</code>, and the four
            states. Probe: &quot;why does cleanup need both <code>clearTimeout</code> and <code>abort</code>?&quot; Bonus: name the
            combobox ARIA roles even if you don&apos;t wire them.
          </li>
          <li>
            <strong><code>Promise.all</code> from scratch (15 min).</strong> No <code>async/await</code>. Probe the two
            edges aloud: the empty-array hang and why you write to <code>results[index]</code> rather than
            <code>push</code>. Then describe how <code>allSettled</code> and <code>race</code> differ.
          </li>
          <li>
            <strong>Stopwatch component (15 min).</strong> Start / stop / reset with <code>useEffect</code> +
            <code>setInterval</code>, storing the interval id in a <code>ref</code>. Probe: &quot;why a ref and not state for the
            id?&quot; and &quot;what does the cleanup function clear, and when does it run?&quot;
          </li>
          <li>
            <strong>Stretch, review pass.</strong> Go back through all five and, for each, write the one edge case you&apos;d
            <em>expect</em> an interviewer to push on. Rehearse the out-loud answer until it&apos;s automatic. That rehearsal,
            not the code, is what makes you calm under pressure on the day.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, you&apos;ve done the algorithmic version of this, implement an LRU cache, parse a
            log, dedupe a stream. The front-end twist is that half the &quot;algorithm&quot; is <em>asynchrony and lifecycle</em>:
            cancellation, cleanup, and the race condition stand in for thread-safety and request cancellation. Same
            discipline, clarify, name the edge case, state the complexity, pointed at the browser instead of the server.
          </p>
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
