import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rendering-rules";

const CHECKPOINTS = [
  { id: "cp-render-triggers", title: "What triggers a re-render?" },
  { id: "cp-referential-identity", title: "Referential identity, why memo can fail" },
  { id: "cp-memo-mental-model", title: "useMemo / useCallback, when (and when not)" },
];

export default function RenderingRulesModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 3 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Rendering rules, when does a component actually re-render?
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          90% of &quot;performance optimization&quot; in React is wrong because it doesn&apos;t know what triggers a render. Get the model right and you usually stop reaching for <code>memo</code>{" "}at all.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine an assembly line. A new spec comes in (state changes), and a worker (your component) rebuilds the widget from scratch. They don&apos;t ask &quot;is this different from last time?&quot;,{" "}they just build it. A second worker downstream (reconciliation) does the comparison and decides what to ship.
        </p>
        <p>
          That&apos;s React. <em>Components re-run cheaply</em>; the expensive part is what they describe and whether the DOM operation actually fires. Optimization isn&apos;t about &quot;preventing renders&quot;, it&apos;s about not doing expensive work during renders.
        </p>
      </section>

      <section>
        <h2>What triggers a re-render?</h2>
        <p>
          A component re-runs when one of three things happens:
        </p>
        <ol>
          <li><strong>Its own state changes</strong>{" "}(via <code>setState</code>, <code>useReducer</code>, <code>useSyncExternalStore</code>).</li>
          <li><strong>A parent re-renders</strong>{" "}and includes this component in the new output. (Default React behavior, children re-render with parents.)</li>
          <li><strong>A subscribed context value changes</strong>{" "}(<code>useContext</code>{" "}reads a new value).</li>
        </ol>
        <p>
          That&apos;s the whole list. Note what&apos;s <em>not</em>{" "}there:
        </p>
        <ul>
          <li>Props don&apos;t cause re-renders by themselves, they&apos;re passed to a re-render that already happened in the parent.</li>
          <li>Refs (<code>useRef</code>) don&apos;t cause re-renders. That&apos;s why they&apos;re for mutable values you don&apos;t want to track reactively.</li>
          <li>Setting state to the <em>same value</em>{" "}(by <code>Object.is</code>) bails out and skips the re-render.</li>
        </ul>
        <Callout variant="info" title="The default is conservative, children re-render with parents">
          When a parent renders, every child component re-runs. React does <em>not</em>{" "}check whether props changed before re-running children. That&apos;s what <code>React.memo</code>{" "}adds, an explicit shallow-prop check that bails out if nothing changed.
        </Callout>
      </section>

      <Checkpoint id="cp-render-triggers" moduleSlug={MODULE_SLUG} title="What triggers a re-render?">
        <Quiz
          kind="Quick check"
          question="A parent re-renders. The child is not wrapped in `React.memo` and its props didn't change. Does the child re-render?"
          options={[
            { label: "No, React skips children if props are the same.", explanation: "Wrong, that's only true with `React.memo`. By default, children re-render with parents." },
            { label: "Yes, children re-render with parents by default.", correct: true, explanation: "Right, the default is to re-run every child. `React.memo` is opt-in." },
            { label: "Only if the child has its own state.", explanation: "Wrong, state is unrelated. The child re-renders because the parent did." },
            { label: "Only if the child reads context.", explanation: "Wrong, context affects re-render reasons, but doesn't gate parent-driven re-renders." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Referential identity, why <code>memo</code>{" "}quietly fails</h2>
        <p>
          <code>React.memo</code>{" "}wraps a component so that, before re-running, React compares the incoming props to the previous props with <code>Object.is</code>,{" "}a shallow check. If every prop is the same identity, the component is skipped.
        </p>
        <p>
          The trap: <em>objects and functions created inline get a new identity every render.</em>
        </p>
        <pre><code>{`function Parent() {
  return (
    <Child
      style={{ color: "red" }}        // ❌ new object every render
      onClick={() => doThing()}       // ❌ new function every render
    />
  );
}

const Child = React.memo(function Child({ style, onClick }) {
  return <button style={style} onClick={onClick}>hi</button>;
});
// memo doesn't help — props are "different" by reference every render`}</code></pre>
        <p>
          Fixes, only if you have a profile-confirmed problem:
        </p>
        <ul>
          <li>Hoist the object out of the render: <code>{`const STYLE = { color: "red" };`}</code>{" "}above the component.</li>
          <li>Wrap the function in <code>useCallback</code>{" "}with the correct deps.</li>
          <li>Wrap derived data in <code>useMemo</code>{" "}with the correct deps.</li>
        </ul>
        <Callout variant="warn" title="The order of operations">
          Don&apos;t reach for <code>useMemo</code>/<code>useCallback</code>/<code>memo</code>{" "}first. They add complexity. <em>First</em>{" "}profile the unnecessary re-render. <em>Then</em>{" "}fix the root cause, which is usually a new object/function being created in a parent.
        </Callout>
      </section>

      <Checkpoint id="cp-referential-identity" moduleSlug={MODULE_SLUG} title="Referential identity, why memo can fail">
        <Quiz
          kind="Scenario"
          question="A `React.memo`-wrapped chart receives `data` as a prop. The chart re-renders on every parent render. The data array contents are unchanged. What's the most likely cause?"
          options={[
            { label: "`memo` doesn't deep-compare arrays.", correct: true, explanation: "Right, memo uses `Object.is` shallow comparison. If the parent recomputes the array on every render (e.g. `items.filter(...)`), the new array has a new reference and memo fires." },
            { label: "Charts can't be memoized.", explanation: "Wrong, they can. The issue is the input identity, not the chart itself." },
            { label: "React 19 disabled `memo` for arrays.", explanation: "Wrong, that's not real." },
            { label: "The chart has internal state.", explanation: "Possible but unrelated, internal state changes cause re-renders independently. The question is about the prop." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2><code>useMemo</code>{" "}and <code>useCallback</code>,{" "}the mental model</h2>
        <p>
          Both hooks &quot;remember&quot; a value across renders and return the same one when the dependency array is unchanged. They differ only in what they cache:
        </p>
        <ul>
          <li><code>useMemo(fn, deps)</code>,{" "}caches a <em>value</em>. The function runs only when deps change.</li>
          <li><code>useCallback(fn, deps)</code>,{" "}caches a <em>function</em>. Same as <code>useMemo(() =&gt; fn, deps)</code>, just less noisy.</li>
        </ul>
        <pre><code>{`const filtered = useMemo(
  () => items.filter(it => it.active),
  [items]
);

const handleClick = useCallback(
  (id) => setSelected(id),
  []  // setSelected is stable
);`}</code></pre>
        <p>
          Use them when:
        </p>
        <ol>
          <li>You&apos;ve <em>measured</em>{" "}an unnecessary re-render in a memoized child caused by a new function/object identity. <code>useCallback</code>/<code>useMemo</code>{" "}stabilize the prop.</li>
          <li>The computation itself is genuinely expensive (sorting 50k items, large transformations) and you want to skip it when inputs don&apos;t change.</li>
        </ol>
        <p>
          Don&apos;t use them when:
        </p>
        <ul>
          <li>The child isn&apos;t memoized, stabilizing props does nothing if React renders the child anyway.</li>
          <li>The computation is cheap (string concat, small filter). The overhead of the memoization machinery exceeds the cost of the work.</li>
          <li>The dependencies are an unstable array that changes every render anyway, you&apos;re paying the memo cost for zero benefit.</li>
        </ul>
        <Callout variant="insight" title="The honest rule">
          Premature memoization makes code slower and harder to read. Start without it; add it where the profiler points.
        </Callout>
      </section>

      <Checkpoint id="cp-memo-mental-model" moduleSlug={MODULE_SLUG} title="useMemo / useCallback, when (and when not)">
        <Quiz
          kind="Scenario"
          question="You wrap every callback in `useCallback` and every derived value in `useMemo`. The app feels slower. Why?"
          options={[
            { label: "React 19 deprecated those hooks.", explanation: "Wrong, they're current." },
            { label: "Each memo has overhead, bookkeeping the dep array, comparing on every render. With nothing actually being optimized, it's pure cost.", correct: true, explanation: "Right, memoization isn't free. If the consumer isn't `memo`-wrapped or the work being memoized is cheap, you've added cost without saving any." },
            { label: "useMemo is single-threaded.", explanation: "Wrong, all React rendering is single-threaded. That's not the issue." },
            { label: "The garbage collector runs more often.", explanation: "Indirectly true (you create dep arrays), but the dominant cost is the bookkeeping per memo, not GC." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="The React DevTools profiler shows a child re-rendering every parent render. The child is `React.memo`-wrapped. What's the most likely fix?"
          options={[
            { label: "Stabilize the prop identity, likely a new object or function being created in the parent's JSX.", correct: true, explanation: "Right, `memo` is shallow. A new `{}` or `() => …` in the parent's render makes the prop fail identity comparison every time." },
            { label: "Wrap the child in another `memo`.", explanation: "Wrong, double-memoization doesn't help if the prop identity is still unstable." },
            { label: "Convert the child to a class component.", explanation: "Wrong, class vs function is unrelated to memoization." },
            { label: "Use `useEffect` to short-circuit the render.", explanation: "Wrong, effects run *after* render, so they can't prevent one." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>A component re-renders when its <strong>own state changes</strong>, its <strong>parent re-renders</strong>, or a <strong>context it reads changes</strong>.</li>
          <li>By default, children re-render with parents, no shallow-prop check. <code>React.memo</code>{" "}adds the check, but only helps when props have <em>stable identities</em>.</li>
          <li>Objects and functions defined inline in JSX get a new identity every render, that&apos;s what defeats <code>memo</code>{" "}silently.</li>
          <li><strong><code>useMemo</code></strong>{" "}caches a value; <strong><code>useCallback</code></strong>{" "}caches a function. Use them when (a) a memoized child needs a stable prop, or (b) the work is genuinely expensive.</li>
          <li>Premature memoization is a net negative, it costs bookkeeping for no benefit. Profile first; memoize where it pays off.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Take a small dashboard with a list and a stat panel. In React DevTools (Profiler tab), record a render cycle and identify the components that re-render <em>unnecessarily</em>{" "}(props unchanged, no own state change).</li>
          <li>For the top three offenders, find the root cause, usually a new array/object being created in the parent. Fix one with <code>useMemo</code>, one by hoisting the literal out, one by moving the offending JSX into its own component.</li>
          <li>Add <code>console.log(&quot;Child rendered&quot;)</code>{" "}to one component and toggle parent state, verify the count goes down after the fix.</li>
          <li><em>Avoid</em>: wrapping every function in <code>useCallback</code>{" "}prophylactically. Only stabilize props the profiler tells you to.</li>
        </ol>
        <p>
          You should be able to explain, out loud, the three triggers of a re-render, and why memoization is a tool of <em>last resort</em>{" "}not first instinct.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
