import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "state-rules";

const CHECKPOINTS = [
  { id: "cp-state-as-snapshot", title: "State as a snapshot, not a variable" },
  { id: "cp-functional-updater", title: "The functional updater — `setX(prev => ...)`" },
  { id: "cp-immutability-and-lifting", title: "Immutability + when to lift state up" },
];

export default function StateRulesModule() {
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
          State rules — <code>useState</code>, immutability, batching, and lifting state up
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The classic React bug: &quot;I called <code>setCount</code>{" "}three times but it only went up by one.&quot; That bug isn&apos;t a quirk — it&apos;s the model working exactly as designed, once you see state as a snapshot.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine a photograph. It captures one moment — the state at the instant the shutter fired. You can show it to a hundred people. Each person looking at the photo sees the same scene, frozen. The photo doesn&apos;t change as the world keeps moving.
        </p>
        <p>
          That&apos;s what your component sees. Each render is a photograph of state at the moment React called the function. The <code>count</code>{" "}you read on line 3 is the <em>same</em>{" "}<code>count</code>{" "}on line 30, even if you called <code>setCount</code>{" "}in between. React schedules the next photo; this render is committed to the one it already took.
        </p>
        <Callout variant="insight" title="The one-line definition">
          State is a snapshot. <code>setState</code>{" "}schedules a new snapshot for the next render — it does not mutate the current one.
        </Callout>
      </section>

      <section>
        <h2>The classic bug — three increments, one count</h2>
        <pre><code>{`function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => {
      setCount(count + 1);  // count is 0 → schedules 1
      setCount(count + 1);  // count is still 0 → schedules 1
      setCount(count + 1);  // count is still 0 → schedules 1
    }}>+3</button>
  );
}`}</code></pre>
        <p>
          You expected +3. You get +1. Why? <code>count</code>{" "}is captured at the start of the handler — it&apos;s 0 throughout the entire function. Each <code>setCount(count + 1)</code>{" "}schedules &quot;set to 1.&quot;{" "}React applies the last one and renders <code>1</code>.
        </p>
        <p>
          The fix is the <strong>functional updater</strong>{" "}— a function that receives the latest scheduled value, not the closure capture.
        </p>
        <pre><code>{`<button onClick={() => {
  setCount(prev => prev + 1);  // applied to 0, scheduled 1
  setCount(prev => prev + 1);  // applied to 1, scheduled 2
  setCount(prev => prev + 1);  // applied to 2, scheduled 3
}}>+3</button>`}</code></pre>
        <p>
          Each call receives whatever the previous call scheduled. Now you actually get +3.
        </p>
      </section>

      <Checkpoint id="cp-state-as-snapshot" moduleSlug={MODULE_SLUG} title="State as a snapshot, not a variable">
        <Quiz
          kind="Quick check"
          question={"What does this print?\n\n```js\nconst [n, setN] = useState(0);\n// inside a handler:\nsetN(n + 1);\nconsole.log(n);\n```"}
          options={[
            { label: "1", explanation: "Wrong — `setN` schedules a new render. `n` in this scope is the captured snapshot — still 0." },
            { label: "0", correct: true, explanation: "Right — `n` is from this render's snapshot. The new value isn't visible until React renders again." },
            { label: "undefined", explanation: "Wrong — `n` was initialized to 0." },
            { label: "It throws.", explanation: "Wrong — nothing throws. `setN` is async-scheduled, but the read is sync." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Immutability — the only rule that matters</h2>
        <p>
          State updates have to produce <em>new</em>{" "}references. Mutating in place doesn&apos;t trigger a re-render, because React uses <code>Object.is</code>{" "}to compare the new state to the previous one.
        </p>
        <pre><code>{`// ❌ mutates — React sees the same array reference
items.push(newItem);
setItems(items);

// ✅ new array
setItems([...items, newItem]);
// or:
setItems(prev => [...prev, newItem]);`}</code></pre>
        <p>
          For nested updates, you have to spread at every level you change:
        </p>
        <pre><code>{`// ❌ mutates user.address
setUser({ ...user, address: user.address });
user.address.city = "New York";

// ✅ spread all the way down
setUser(prev => ({
  ...prev,
  address: { ...prev.address, city: "New York" }
}));`}</code></pre>
        <Callout variant="warn" title="Why React requires immutability">
          React uses reference equality to decide if state changed. If you mutate the old object in place, the new reference is the same as the old reference — React sees no change and skips the re-render. The UI silently goes stale.
        </Callout>
      </section>

      <section>
        <h2>Batching — multiple <code>setState</code>{" "}calls become one render</h2>
        <p>
          React 18+ automatically batches <em>all</em>{" "}<code>setState</code>{" "}calls inside the same event handler, effect, promise, or timeout. Three <code>setX</code>{" "}calls = one render with the final state.
        </p>
        <pre><code>{`function handle() {
  setA(1);    // these three calls
  setB(2);    // are batched into
  setC(3);    // one render
}`}</code></pre>
        <p>
          Before React 18, batching only happened inside React event handlers. Promises, setTimeout, and native events bypassed it. React 18&apos;s &quot;automatic batching&quot; makes it work everywhere — fewer surprise extra renders.
        </p>
        <Callout variant="info" title="Bail-out on identical state">
          If <code>setX(currentX)</code>{" "}is called with the same value (by <code>Object.is</code>), React skips the re-render entirely. Useful for hooks that re-compute the same value defensively.
        </Callout>
      </section>

      <Checkpoint id="cp-functional-updater" moduleSlug={MODULE_SLUG} title="The functional updater — `setX(prev => ...)`">
        <Quiz
          kind="Scenario"
          question="You write `setCount(count + 1)` three times in a handler, expecting +3. You only get +1. What's the cleanest fix?"
          options={[
            { label: "Wrap in `useCallback`.", explanation: "Wrong — useCallback caches the function but doesn't change closure capture. The bug remains." },
            { label: "Use the functional updater: `setCount(prev => prev + 1)` three times.", correct: true, explanation: "Right — each call receives the latest scheduled value, so the three increments compose to +3." },
            { label: "Wrap in `setTimeout`.", explanation: "Wrong — it changes the timing but not the closure problem. Each call still captures the same `count`." },
            { label: "Use `useReducer` with a sum action.", explanation: "That works (useReducer is fundamentally a functional updater), but it's a much heavier refactor. The functional updater is the direct fix." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Lifting state up — when shared state needs a common parent</h2>
        <p>
          The rule: state should live at the lowest common ancestor of every component that reads or writes it.
        </p>
        <p>
          If two siblings both need to know whether a modal is open, the open-state lives in their parent, not in one of them. The parent passes the state down as a prop, and a setter (also as a prop) up.
        </p>
        <pre><code>{`function Parent() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TriggerButton onClick={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} />
    </>
  );
}`}</code></pre>
        <p>
          When to lift higher: as soon as a third component (a sibling or a parent) needs to read the same state. When to colocate (push state back down): when only one component cares.
        </p>
        <Callout variant="insight" title="Lifting is a force, not a goal">
          Don&apos;t lift state &quot;just in case.&quot; Lift it when the duplication shows up (two components fighting over the truth). When you no longer need it shared, push it back down — components with local state are simpler to test.
        </Callout>
      </section>

      <section>
        <h2>What state isn&apos;t for</h2>
        <p>
          A surprising amount of <code>useState</code>{" "}shouldn&apos;t exist. Three common smells:
        </p>
        <ul>
          <li><strong>Derived state</strong>: <code>{`const [fullName, setFullName] = useState(\`\${first} \${last}\`)`}</code>. No. Compute it inline: <code>{`const fullName = \`\${first} \${last}\``}</code>. Storing it adds a sync bug.</li>
          <li><strong>Props copied into state</strong>: <code>{`const [name, setName] = useState(props.name)`}</code>. No (unless you specifically need to <em>override</em>{" "}the prop locally). Read <code>props.name</code>{" "}directly.</li>
          <li><strong>Values that don&apos;t affect rendering</strong>: a timer id, a previous-render snapshot. Use a <code>useRef</code>{" "}— it&apos;s mutable, persists across renders, and doesn&apos;t trigger one.</li>
        </ul>
        <p>
          Rule of thumb: if you have <code>useEffect</code>{" "}whose only job is to keep one state in sync with another, you have derived state and should compute it inline instead.
        </p>
      </section>

      <Checkpoint id="cp-immutability-and-lifting" moduleSlug={MODULE_SLUG} title="Immutability + when to lift state up">
        <Quiz
          kind="Quick check"
          question="You write `items.sort(); setItems(items);` and the component doesn't update. Why?"
          options={[
            { label: "`sort` returns void.", explanation: "Wrong — `sort` returns the same array (mutated). The bug isn't the return; it's the mutation." },
            { label: "`sort` mutates in place. The reference is unchanged, so React skips the re-render.", correct: true, explanation: "Right — React compares with `Object.is`. Same reference = no update. Use `setItems([...items].sort())` to create a new array first." },
            { label: "React 19 deprecated array state.", explanation: "Wrong — arrays in state are fine. The bug is the mutation." },
            { label: "`setItems` is async.", explanation: "True but irrelevant — even after the next tick, the reference is identical, so no re-render is queued." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="Two siblings — a `<Filter>` and a `<List>` — both need to know the current filter string. Where should the state live?"
          options={[
            { label: "Inside `<Filter>`, since it sets the value.", explanation: "Wrong — `<List>` couldn't read it then." },
            { label: "Inside `<List>`, since it reads the value.", explanation: "Wrong — `<Filter>` couldn't write it then." },
            { label: "In their lowest common ancestor, passed down to both as a prop.", correct: true, explanation: "Right — lift state to the lowest common ancestor. The parent owns the state and provides a setter to the child that writes." },
            { label: "In a global store.", explanation: "Overkill — a `useState` in the parent is simpler, lighter, and equally correct. Reach for global state only when the value is needed deep across many subtrees." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>State is a <strong>snapshot</strong>{" "}for the current render. <code>setState</code>{" "}schedules a new snapshot; it does not mutate the current one.</li>
          <li>Reading <code>count</code>{" "}after <code>setCount(count + 1)</code>{" "}gives you the old value — the new one isn&apos;t visible until the next render.</li>
          <li>If your next state depends on the previous, use the <strong>functional updater</strong>{" "}— <code>{`setX(prev => …)`}</code>. It receives the latest scheduled value, so multiple calls compose.</li>
          <li>State updates must produce <strong>new references</strong>. Mutation in place doesn&apos;t trigger a re-render.</li>
          <li>React 18+ automatically <strong>batches</strong>{" "}all <code>setState</code>{" "}calls in a handler/effect/promise/timeout into one render.</li>
          <li><strong>Lift state up</strong>{" "}to the lowest common ancestor when multiple components share it. Push it back down when only one cares.</li>
          <li>Don&apos;t use <code>useState</code>{" "}for derived values, copied props, or non-rendering values — compute inline, or use <code>useRef</code>.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build a counter component with <code>{`<button onClick={() => { setCount(count+1); setCount(count+1); setCount(count+1); }}>+3</button>`}</code>. Confirm it only goes up by 1. Rewrite with the functional updater; confirm it now goes up by 3.</li>
          <li>Build a <code>{`<Form>`}</code>{" "}with three sibling inputs whose values aren&apos;t needed anywhere else. Use <em>three</em>{" "}separate <code>useState</code>{" "}calls, not one big object — simpler to update, no spread chains. Then add a &quot;reset&quot; button that uses functional updaters.</li>
          <li>Take a component that uses <code>useEffect</code>{" "}to compute <code>fullName</code>{" "}from <code>firstName</code>{" "}+ <code>lastName</code>. Remove the effect and the state; compute <code>fullName</code>{" "}inline. Confirm the behavior is identical and the code is simpler.</li>
          <li><em>Stretch:</em>{" "}build a sortable table where you <code>{`setItems(items.sort(...))`}</code>{" "}and observe the missing re-render. Fix it by sorting a copy.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why state is a snapshot, why the functional updater fixes the &quot;+3&quot; bug, and why <em>mutating</em>{" "}an object in state silently breaks React.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
