import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "memoization-deep";

const CHECKPOINTS = [
  { id: "cp-what-each-memoizes", title: "What each one actually memoizes" },
  { id: "cp-referential-equality", title: "Referential equality & defeating memo" },
  { id: "cp-cost-and-instinct", title: "The cost & the senior instinct" },
];

export default function MemoizationDeepModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 6 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Memoization done right, <code>memo</code>, <code>useMemo</code>, <code>useCallback</code>, and when not to
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Someone told you React is slow, so you sprinkled <code>useMemo</code> and <code>useCallback</code> on everything.
          The app got <em>slower</em> and the code got unreadable. Let&apos;s figure out what these three actually do, and the
          senior instinct for when reaching for them is the wrong move.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The barista who keeps the receipt</h2>
        <p className="mb-4">
          Picture a barista who hates re-doing work. Every time you order, she writes down the <em>exact</em> order on a
          receipt and tapes it to the cup she just made. Next customer walks up: she compares their order to the last
          receipt. <strong>Same order?</strong> She hands them the cup she already made, no second pour. <strong>Different
          order?</strong> She makes a fresh one and tapes a new receipt.
        </p>
        <p className="mb-4">
          That is memoization in one sentence: <strong>remember the last result, and skip the work if the inputs
          haven&apos;t changed.</strong> The whole game is the comparison step, &quot;is this the same order as last time?&quot; If
          the comparison is reliable and cheap, you save real work. If it&apos;s <em>wrong</em>, if she can&apos;t actually tell
          two identical orders apart, she remakes the drink every single time, and the receipts were pure overhead.
        </p>
        <p className="mb-4">
          React&apos;s three memoization tools are all the same barista with different cups. <code>memo</code> tapes a receipt
          to a <em>component</em> (skip the re-render if props match). <code>useMemo</code> tapes a receipt to a
          <em> computed value</em> (skip the recalculation if deps match). <code>useCallback</code> tapes a receipt to a
          <em> function</em> (hand back the same function if deps match). And the thing that breaks all three is the
          barista comparing orders the wrong way, which, in React, is <strong>referential equality</strong>, the single
          idea this whole module turns on.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Memoization is easy to call and hard to call <em>well</em>. The mechanics take five minutes; the judgment takes
            this whole module. The two ideas that separate &quot;I memoize everything&quot; from a senior answer are
            <strong> referential equality</strong> (why a fresh object/function prop silently defeats <code>memo</code>) and
            <strong> the cost of memoizing</strong> (it is never free, and most of the time it&apos;s buying nothing).
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. WHAT EACH ONE MEMOIZES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Three tools, three different things memoized</h2>
        <p className="mb-4">
          People blur these together. They do <em>different</em> jobs, and getting the distinction crisp is the start of
          using them correctly.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>React.memo</code>, memoizes a <em>component&apos;s render</em></h3>
        <p className="mb-4">
          <code>memo</code> wraps a component. Before re-rendering it, React shallow-compares the new props to the previous
          props. If they&apos;re all referentially equal, React <strong>skips the render entirely</strong> and reuses the last
          output. It is the only one of the three that affects whether a component re-renders.
        </p>
        <pre><code>{`const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  // only re-renders when \`items\` is a DIFFERENT reference than last time
  return <ul>{items.map((i) => <li key={i.id}>{i.label}</li>)}</ul>;
});`}</code></pre>

        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>useMemo</code>, memoizes a <em>computed value</em></h3>
        <p className="mb-4">
          <code>useMemo</code> caches the <em>result</em> of a calculation across renders. React re-runs the function only
          when a dependency changes; otherwise it hands back the value it computed last time, the same reference.
        </p>
        <pre><code>{`// recompute the sorted list ONLY when \`items\` or \`sortKey\` changes
const sorted = useMemo(
  () => [...items].sort((a, b) => a[sortKey] - b[sortKey]),
  [items, sortKey],
);`}</code></pre>

        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>useCallback</code>, memoizes a <em>function reference</em></h3>
        <p className="mb-4">
          <code>useCallback</code> is just <code>useMemo</code> for a function. <code>useCallback(fn, deps)</code> is exactly{" "}
          <code>useMemo(() =&gt; fn, deps)</code>. It returns the <em>same function reference</em> across renders until a
          dependency changes. It does not make the function faster, it keeps its identity stable.
        </p>
        <pre><code>{`// same function reference every render until \`onSelect\` or \`id\` changes
const handleClick = useCallback(() => onSelect(id), [onSelect, id]);`}</code></pre>

        <Callout variant="insight" title="The one-liner that ties them together">
          <p>
            <code>memo</code> skips a <strong>render</strong>; <code>useMemo</code> skips a <strong>calculation</strong>;{" "}
            <code>useCallback</code> skips creating a <strong>new function</strong>. And <code>useMemo</code>/
            <code>useCallback</code> mostly exist to keep prop references stable <em>so that</em> a <code>memo</code>&apos;d
            child&apos;s comparison can succeed. They are usually a team: stabilize the props, then memo the child.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-what-each-memoizes" moduleSlug={MODULE_SLUG} title="What each one actually memoizes">
        <Quiz
          kind="What it memoizes"
          question="A teammate says 'wrap this component in useMemo so it stops re-rendering.' What's wrong with that sentence?"
          options={[
            {
              label: "useMemo memoizes a computed value, not a component's render, React.memo is the one that can skip a component's re-render",
              correct: true,
              explanation:
                "Right. useMemo caches the result of a calculation between renders. The tool that compares props and skips a component's render is React.memo. They're easy to confuse because both 'remember', but they remember different things.",
            },
            {
              label: "Nothing, useMemo and React.memo are aliases for the same API",
              explanation:
                "They are not aliases. useMemo caches a value inside a render; React.memo wraps a component to skip its render when props are referentially equal.",
            },
            {
              label: "useMemo only works on numbers, so it can't wrap a component anyway",
              explanation:
                "useMemo can memoize any value (objects, arrays, anything), but the real issue is that it memoizes a value, not a component's render. React.memo is the render-skipping tool.",
            },
            {
              label: "useMemo is deprecated; you should use useCallback to stop re-renders",
              explanation:
                "useMemo isn't deprecated, and useCallback memoizes a function reference, it doesn't stop a component re-rendering either. React.memo is the render-skipping tool.",
            },
          ]}
        />
        <Quiz
          kind="useCallback identity"
          question="What is useCallback(fn, deps) equivalent to, and what does it actually give you?"
          options={[
            {
              label: "It's useMemo(() => fn, deps), it returns the same function reference across renders until a dep changes; it does not make the function run faster",
              correct: true,
              explanation:
                "Exactly. useCallback is sugar for memoizing a function. Its only product is a stable identity, useful when that function is a dependency or a prop to a memo'd child. It never speeds up the function's execution.",
            },
            {
              label: "It caches the function's return value, so calling it twice with the same args is instant",
              explanation:
                "That would be result-caching. useCallback memoizes the function reference itself, not its return value. (You'd memoize a return value with useMemo.)",
            },
            {
              label: "It makes the function run on a background thread to avoid blocking the UI",
              explanation:
                "There are no background threads here. useCallback only stabilizes the function's identity across renders.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 3. REFERENTIAL EQUALITY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Referential equality, the idea everything hinges on</h2>
        <p className="mb-4">
          <code>memo</code> compares props with a <strong>shallow</strong> equality check, essentially <code>Object.is</code>{" "}
          per prop. For primitives (<code>number</code>, <code>string</code>, <code>boolean</code>) that&apos;s value equality,
          and it behaves how you&apos;d hope: <code>5 === 5</code>, <code>&quot;hi&quot; === &quot;hi&quot;</code>. But for objects, arrays, and
          functions, it compares by <strong>reference</strong>, the memory identity, not the contents.
        </p>
        <pre><code>{`{ a: 1 } === { a: 1 }     // false — two different objects, same contents
[1, 2] === [1, 2]         // false — two different arrays
(() => {}) === (() => {}) // false — two different function objects`}</code></pre>
        <p className="mb-4">
          Now connect that to how React works: <strong>every render runs the component function from the top.</strong> Every
          object literal, array literal, and inline arrow function in the body is <em>created fresh</em> on each render, a
          brand-new reference, even if the contents are byte-identical to last time. That fresh reference is exactly what
          defeats a child&apos;s <code>memo</code>.
        </p>
        <pre><code>{`const Child = React.memo(function Child({ config, onClick }) { /* ... */ });

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ NEW object + NEW function every render — Child's memo NEVER helps
  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <Child config={{ theme: "dark" }} onClick={() => doThing()} />
    </>
  );
}`}</code></pre>
        <p className="mb-4">
          Click the button. <code>Parent</code> re-renders. The <code>{"{ theme: \"dark\" }"}</code> literal and the inline
          arrow are recreated, new references. <code>memo</code> shallow-compares: <code>oldConfig !== newConfig</code>,{" "}
          <code>oldOnClick !== newOnClick</code>. The comparison fails, <code>Child</code> re-renders anyway, and the{" "}
          <code>memo</code> wrapper did nothing but add a useless comparison. This is the <strong>single most common
          memoization bug</strong>: a memo&apos;d child that never actually skips, because its props are freshly created
          upstream.
        </p>
        <p className="mb-4">The fix is to stabilize the references the child receives:</p>
        <pre><code>{`function Parent() {
  const [count, setCount] = useState(0);

  // ✅ stable references — same identity across renders until deps change
  const config = useMemo(() => ({ theme: "dark" }), []);
  const onClick = useCallback(() => doThing(), []);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
      <Child config={config} onClick={onClick} />  {/* now memo can skip */}
    </>
  );
}`}</code></pre>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;<code>memo</code> compares props by reference. A new object, array, or inline function created in the parent&apos;s
            render is a new reference every time, so the comparison fails and the memo&apos;d child re-renders anyway. To make
            <code> memo</code> work, the props it receives must be referentially stable, that&apos;s what <code>useMemo</code>{" "}
            and <code>useCallback</code> are for. <code>memo</code> on the child and stable props from the parent are a
            package deal; one without the other is wasted.&quot;
          </p>
        </Callout>
        <Callout variant="warn" title="children is a prop too, and it's almost never stable">
          <p>
            JSX passed as <code>children</code> is a freshly-created element object on every parent render. So a memo&apos;d
            component that takes <code>children</code> rendered inline by the parent will usually re-render regardless,
            because <code>children</code> is a new reference each time. This is why <code>memo</code> shines on leaf
            components with primitive or stabilized props, and is far less useful on wrappers that take arbitrary JSX.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. WHY PREMATURE MEMO HURTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Memoization is never free</h2>
        <p className="mb-4">
          Here is the part the &quot;memoize everything&quot; crowd skips: every <code>useMemo</code>, <code>useCallback</code>, and{" "}
          <code>memo</code> has a real cost, paid on <em>every</em> render whether or not it ever saves you anything.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Memory.</strong> React stores the cached value <em>and</em> the dependency array for every{" "}
            <code>useMemo</code>/<code>useCallback</code>, and the previous props for every <code>memo</code>. Multiply that
            across a big tree.
          </li>
          <li>
            <strong>Comparison work.</strong> On every render React must compare each dependency array element and each
            memo&apos;d prop. For trivially-cheap calculations, the comparison can cost as much as just recomputing.
          </li>
          <li>
            <strong>Readability.</strong> <code>useMemo</code>/<code>useCallback</code> wrappers add noise, force you to
            maintain dependency arrays, and create a new class of bugs, stale closures from a <em>wrong</em> dependency
            list. Every memoization is a small maintenance liability.
          </li>
          <li>
            <strong>False confidence.</strong> A <code>memo</code> that never skips (because its props aren&apos;t stable) costs
            the comparison <em>and</em> the render <em>and</em> misleads the next reader into thinking the component is
            optimized.
          </li>
        </ul>
        <p className="mb-4">
          So the equation is: memoization wins only when <strong>(cost of the work you skip) &gt; (cost of remembering and
          comparing).</strong> For an expensive sort over 10,000 rows, or a memo&apos;d child whose subtree is genuinely big,
          that math is easy. For <code>useMemo(() =&gt; a + b, [a, b])</code>, adding two numbers, you are paying the
          remembering cost to skip an addition. That is a net loss, always.
        </p>
        <Callout variant="warn" title="The most-recommended useMemo on the internet is wrong">
          <p>
            <code>useMemo(() =&gt; a + b, [a, b])</code> and <code>useCallback</code> wrapping a handler that isn&apos;t a
            dependency or a prop to a memo&apos;d child are pure overhead, they memoize something that was already cheap and
            whose identity nobody cared about. Reaching for them &quot;just in case&quot; makes the code slower and harder to read,
            not faster.
          </p>
        </Callout>
        <p className="mb-4">
          There&apos;s also a structural point most people miss: <strong>moving state down or composing with children often
          beats memoization entirely.</strong> If a fast-changing piece of state (like our <code>count</code>) lives in a
          smaller component, only that component re-renders, and the expensive sibling never needed <code>memo</code> at
          all. Composition is the optimization that doesn&apos;t cost you a dependency array.
        </p>
        <pre><code>{`// Instead of memoizing ExpensiveTree to survive Counter's re-renders...
function Page() {
  return (
    <>
      <Counter />        {/* state lives HERE; only this re-renders */}
      <ExpensiveTree />  {/* no memo needed — Page doesn't re-render */}
    </>
  );
}
// ...push the state down so the expensive sibling isn't in its render path.`}</code></pre>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-referential-equality" moduleSlug={MODULE_SLUG} title="Referential equality & defeating memo">
        <Quiz
          kind="Defeating memo"
          question="Child is wrapped in React.memo. The parent renders <Child config={{ theme: 'dark' }} />. The parent re-renders for an unrelated reason. Does Child re-render?"
          options={[
            {
              label: "Yes, the object literal is a new reference every render, so memo's shallow comparison fails and Child re-renders anyway",
              correct: true,
              explanation:
                "Correct. { theme: 'dark' } is created fresh on each parent render, a new reference with identical contents. memo compares by reference, the comparison fails, and the memo does nothing. Stabilize it with useMemo to make the memo actually skip.",
            },
            {
              label: "No, memo deep-compares the object, sees the same contents, and skips the render",
              explanation:
                "memo does a shallow (reference) comparison, not a deep one. Same contents in a new object are still a different reference, so the comparison fails.",
            },
            {
              label: "No, React caches object literals automatically so the reference is stable",
              explanation:
                "React does not cache object literals. Every render creates a brand-new object. You stabilize it yourself with useMemo.",
            },
            {
              label: "It throws, because you can't pass an object literal to a memo'd component",
              explanation:
                "It's perfectly legal to pass an object literal, it just defeats the memo, silently. No error is thrown.",
            },
          ]}
        />
        <Quiz
          kind="The memo/useMemo pairing"
          question="You wrapped a child in React.memo to stop it re-rendering, but it still re-renders on every parent render. What is the most likely cause and fix?"
          options={[
            {
              label: "At least one prop is a freshly-created object/array/function from the parent; stabilize those props with useMemo/useCallback so the comparison can succeed",
              correct: true,
              explanation:
                "Right. memo only skips when ALL props are referentially equal. An inline object or arrow prop is a new reference each render and breaks the comparison. memo on the child and stable props from the parent are a package deal.",
            },
            {
              label: "memo only works on class components; convert the child to a class",
              explanation:
                "memo works on function components, that's its whole purpose. The real issue is unstable props defeating the shallow comparison.",
            },
            {
              label: "You need to also wrap the parent in memo for the child's memo to take effect",
              explanation:
                "The parent's memo status is irrelevant to whether the child's prop references are stable. The fix is stabilizing the props the child receives.",
            },
            {
              label: "React.memo is being tree-shaken out in development; it only works in production",
              explanation:
                "memo runs in development too. The re-renders are real and caused by unstable props, not a build artifact.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. WHEN TO ACTUALLY MEMOIZE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The senior instinct: measure, then memoize the proven cause</h2>
        <p className="mb-4">
          A junior reaches for <code>useMemo</code> reflexively. A senior reaches for the <strong>React DevTools
          Profiler</strong> first, finds the component that&apos;s actually expensive, and applies a <em>targeted</em> fix. The
          rule of thumb that separates the two:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Default to no memoization.</strong> React is fast. Most re-renders are cheap and invisible. Premature
            memoization is the optimization you pay for and never cash in.
          </li>
          <li>
            <strong>Reach for <code>memo</code></strong> when a component re-renders often <em>and</em> its render (or
            subtree) is genuinely expensive <em>and</em> its props can be made stable. All three conditions, not just one.
          </li>
          <li>
            <strong>Reach for <code>useMemo</code></strong> when a calculation is genuinely costly (sorting/filtering large
            lists, heavy derivations) <em>or</em> when the value is a dependency / a prop to a memo&apos;d child and must be
            referentially stable.
          </li>
          <li>
            <strong>Reach for <code>useCallback</code></strong> when the function is a dependency of another hook, or a prop
            to a memo&apos;d child. Otherwise it&apos;s noise.
          </li>
          <li>
            <strong>Prefer structure over memoization.</strong> Push state down, lift expensive components out of the render
            path, pass expensive subtrees as <code>children</code>. These don&apos;t cost a dependency array.
          </li>
        </ul>
        <Callout variant="insight" title="The reframe that makes it click">
          <p>
            Memoization is not &quot;making React faster.&quot; It&apos;s <em>trading memory and comparison work for skipped work.</em>{" "}
            That trade is only worth it when the skipped work is large and the comparison is cheap. So the question is never
            &quot;should I memoize this?&quot;, it&apos;s &quot;have I <strong>measured</strong> that this is expensive, and is the work I&apos;d
            skip bigger than the cost of remembering it?&quot; If you haven&apos;t profiled, you don&apos;t know, and the honest answer
            is usually &quot;leave it alone.&quot;
          </p>
        </Callout>
        <Callout variant="info" title="The compiler is changing the default, but the model still matters">
          <p>
            The React Compiler (React 19+) auto-memoizes components and values at build time, aiming to make manual{" "}
            <code>useMemo</code>/<code>useCallback</code> largely unnecessary. That doesn&apos;t make this knowledge obsolete,
            it makes it <em>more</em> important: you still need to understand referential equality to debug what the compiler
            did, to write code it can optimize, and to answer the interview question. The compiler automates the mechanics;
            it does not replace the mental model.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. PROFILER WORKFLOW ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Reading the Profiler, finding the real cause</h2>
        <p className="mb-4">
          The React DevTools Profiler records a commit and shows you, per component, how long it took to render and{" "}
          <em>why</em> it rendered. The workflow for a laggy UI is always the same:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li><strong>Record</strong> the interaction that feels slow (a keystroke, a click, a hover).</li>
          <li>
            <strong>Find the wide, dark bars</strong> in the flamegraph, components that took the most time. Don&apos;t guess;
            the slow component is rarely the one you suspect.
          </li>
          <li>
            <strong>Check &quot;why did this render?&quot;</strong> (enable &quot;Record why each component rendered&quot; in settings). It
            tells you whether it was state, a parent re-render, or a changed prop.
          </li>
          <li>
            <strong>Fix the one biggest offender</strong>, often a single memo on a heavy subtree, or a single
            stabilized prop, then <strong>re-record</strong> and confirm the bar shrank.
          </li>
        </ol>
        <p className="mb-4">
          The discipline is &quot;one fix, re-measure.&quot; Shotgunning memoization across the tree means you can never tell which
          change helped, you add cost everywhere, and you usually leave the <em>actual</em> bottleneck untouched.
        </p>
        <Callout variant="warn" title="Re-renders are not the same as slow renders">
          <p>
            A component re-rendering is not automatically a problem. A re-render that produces the same virtual DOM and
            takes 0.1ms is free for all practical purposes. The Profiler measures <em>time</em>, not <em>count</em>, chase
            the expensive renders, not the frequent ones. Optimizing a cheap-but-frequent render with memoization usually
            costs more than it saves.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;when do you use memo / useMemo / useCallback?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Three different jobs.</strong> <code>memo</code> skips a component&apos;s re-render when props are
              referentially equal; <code>useMemo</code> caches a computed value; <code>useCallback</code> keeps a function&apos;s
              identity stable (it&apos;s <code>useMemo</code> for a function).
            </li>
            <li>
              <strong>Referential equality is the catch.</strong> A fresh object/array/inline function created in the parent
              is a new reference every render, so it defeats a child&apos;s <code>memo</code>. <code>useMemo</code>/
              <code>useCallback</code> exist mostly to stabilize those props so <code>memo</code> can work, they&apos;re a team.
            </li>
            <li>
              <strong>Memoization is never free.</strong> It costs memory and comparison on every render. It only wins when
              the skipped work is bigger than the cost of remembering and comparing.
            </li>
            <li>
              <strong>Measure first.</strong> Profile with React DevTools, fix the one proven offender, re-measure. Don&apos;t
              shotgun.
            </li>
            <li>
              <strong>Structure beats memoization.</strong> Pushing state down or passing subtrees as <code>children</code>{" "}
              often removes the problem without a single dependency array.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 8. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, profile, fix the real cause, then delete the rest</h2>
        <p className="mb-4">
          You&apos;ll take a laggy list, find the <em>actual</em> bottleneck with the Profiler, fix it with targeted{" "}
          <code>memo</code>/<code>useCallback</code>, and then delete the memoization that was doing nothing, justifying
          every call you keep. The deletions matter as much as the additions.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build a laggy list.</strong> Render a list of ~5,000 rows where each row does a little non-trivial work
            (formatting, a small computation). Add a search input above it that filters the list, and a counter button
            somewhere on the page. Type in the search box and feel the jank on each keystroke.
          </li>
          <li>
            <strong>Profile it, don&apos;t guess.</strong> Open the React DevTools Profiler, enable &quot;record why each component
            rendered,&quot; and record a few keystrokes. Identify the widest bar and read <em>why</em> it rendered. Confirm with
            your own eyes which component is actually expensive (it&apos;s usually the rows, re-rendering on every keystroke).
          </li>
          <li>
            <strong>Fix the proven cause with <code>memo</code>.</strong> Wrap the <code>Row</code> component in{" "}
            <code>React.memo</code>. Re-profile. If the rows still re-render, the culprit is an unstable prop, find it.
          </li>
          <li>
            <strong>Stabilize the prop that&apos;s defeating the memo.</strong> The row almost certainly receives an inline{" "}
            <code>onClick</code> or an inline object. Wrap the handler in <code>useCallback</code> (and any object in{" "}
            <code>useMemo</code>) so the memo&apos;s shallow comparison finally succeeds. Re-profile and watch the row bars
            disappear on unrelated re-renders.
          </li>
          <li>
            <strong>Memoize one genuinely-expensive calculation.</strong> If filtering 5,000 rows runs on every render,
            wrap it in <code>useMemo</code> keyed on <code>[items, query]</code>. Re-profile and confirm the filter no
            longer runs when an unrelated piece of state changes.
          </li>
          <li>
            <strong>Now delete the dead memoization.</strong> Go find a <code>useMemo</code>/<code>useCallback</code> that
            wraps something trivial (a simple sum, a handler that isn&apos;t a dep or a memo&apos;d-child prop) and delete it.
            Re-profile to prove nothing got slower, because it was buying nothing. Write a one-line comment next to each
            memo you <em>kept</em> explaining the specific cost it&apos;s skipping.
          </li>
          <li>
            <strong>Stretch, solve it with structure instead.</strong> Move the counter into its own component so its
            state no longer re-renders the list&apos;s parent at all. Notice how the list never needed <code>memo</code> to
            survive the counter once the state lived elsewhere.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work: <code>useMemo</code> is a per-render-cache with a dependency-array cache key, and{" "}
            <code>memo</code> is conditional GET / ETag for a component, &quot;same inputs as last time? serve the cached
            result.&quot; And just like a cache on the server, the danger isn&apos;t the hit, it&apos;s the <em>cost of the cache that
            never hits</em>: memory, invalidation logic (your dependency arrays), and the false sense that something is
            optimized. Profile your cache hit rate before you add the cache.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-cost-and-instinct" moduleSlug={MODULE_SLUG} title="The cost & the senior instinct">
        <Quiz
          kind="The cost"
          question="A teammate wraps every value and handler in useMemo/useCallback 'to be safe.' Why can this make the app slower, not faster?"
          options={[
            {
              label: "Each memoization costs memory plus a dependency comparison on every render; for cheap work the cost exceeds the work skipped, so it's a net loss",
              correct: true,
              explanation:
                "Exactly. Memoization trades memory and comparison work for skipped work. When the skipped work is trivial (a sum, a tiny handler that isn't a dep), you pay the overhead and save nothing, a net loss, plus worse readability and stale-closure risk.",
            },
            {
              label: "useMemo and useCallback leak memory and crash the tab over time",
              explanation:
                "They don't leak, React releases caches normally. The cost is the per-render memory and comparison overhead, which simply isn't worth it for cheap work.",
            },
            {
              label: "They force every component to re-render twice to populate the cache",
              explanation:
                "There's no double-render. The cost is the ongoing per-render comparison and memory, which outweighs the benefit when the memoized work was already cheap.",
            },
            {
              label: "It never makes things slower; memoizing everything is always at worst neutral",
              explanation:
                "It is not neutral. The remembering and comparison cost is paid every render whether or not it helps, so blanket memoization of cheap work is a measurable net loss.",
            },
          ]}
        />
        <Quiz
          kind="The instinct"
          question="A list feels laggy on every keystroke. What's the senior first move?"
          options={[
            {
              label: "Open the React DevTools Profiler, find the component that's actually expensive and why it rendered, fix that one cause, then re-measure",
              correct: true,
              explanation:
                "Right. Measure before optimizing. The Profiler shows the real bottleneck (often re-rendering rows) and why. Fix the one proven offender, re-record to confirm it helped, don't shotgun memoization across the tree.",
            },
            {
              label: "Wrap every component and value in memo/useMemo/useCallback and ship it",
              explanation:
                "That's the premature-memoization trap: you add cost everywhere, can't tell what helped, and usually miss the real bottleneck. Profile first, fix the proven cause.",
            },
            {
              label: "Replace useState with useReducer everywhere to batch updates",
              explanation:
                "Switching to useReducer doesn't address render cost and isn't a profiling-driven fix. Measure first to find the actual expensive render.",
            },
            {
              label: "Assume any re-render is the problem and eliminate all re-renders",
              explanation:
                "Re-renders aren't inherently bad, a cheap re-render is effectively free. The Profiler measures time, not count; chase the expensive renders, not the frequent ones.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
