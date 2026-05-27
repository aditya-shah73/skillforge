import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "how-react-works";

const CHECKPOINTS = [
  { id: "cp-elements-and-fibers", title: "React elements vs DOM nodes" },
  { id: "cp-reconciliation", title: "Reconciliation — the diffing rules" },
  { id: "cp-keys", title: "Keys — what they actually do" },
];

export default function HowReactWorksModule() {
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
          How React actually works — reconciliation, the virtual DOM, and keys
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          React feels magical until you trace it once. Then it&apos;s just a function that takes new JSX, diffs it against the previous render, and applies the minimum DOM updates. The &quot;virtual DOM&quot; isn&apos;t a buzzword — it&apos;s the diff buffer.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine you&apos;re renovating a kitchen. The contractor doesn&apos;t demolish everything every time you change your mind about the tile. They look at the <em>blueprint you have now</em>, compare it to the <em>blueprint you had yesterday</em>, and only do the work that&apos;s actually different. Same tile? Skip it. Different tile? Just that section.
        </p>
        <p>
          React is the contractor. JSX is the new blueprint. The previous render is yesterday&apos;s blueprint. The DOM is the kitchen. <strong>Reconciliation</strong>{" "}is the diffing step — what&apos;s changed, what&apos;s the same, what&apos;s the minimum work?
        </p>
        <Callout variant="insight" title="React in one sentence">
          You describe what the UI should look like for any state; React figures out the minimum DOM operations to make it so.
        </Callout>
      </section>

      <section>
        <h2>JSX is a function call</h2>
        <p>
          The first thing to internalize: JSX is not HTML. It&apos;s syntactic sugar for <code>React.createElement</code>.
        </p>
        <pre><code>{`// You write:
<div className="card">
  <h2>Hi</h2>
</div>

// Babel/TSX transforms it to:
React.createElement("div", { className: "card" },
  React.createElement("h2", null, "Hi")
);

// Which returns a plain object — a React Element:
{
  type: "div",
  props: { className: "card", children: { type: "h2", props: { children: "Hi" } } }
}`}</code></pre>
        <p>
          A React Element is a <em>description</em>{" "}of a DOM node, not a DOM node. It&apos;s a lightweight object. Rendering a component returns a tree of these objects — that tree is what people mean by the &quot;virtual DOM.&quot;
        </p>
      </section>

      <section>
        <h2>Render and commit — the two phases</h2>
        <p>
          A React update has two phases, both invisible to your code:
        </p>
        <ol>
          <li><strong>Render phase</strong>{" "}— React calls your components, building a new tree of elements. <em>Pure</em>: no DOM is touched. Side-effects here cause bugs.</li>
          <li><strong>Commit phase</strong>{" "}— React diffs the new tree against the previous one (<em>reconciliation</em>) and applies the minimum DOM operations. Refs are attached, effects fire.</li>
        </ol>
        <p>
          This split is why your component body can re-run many times without the DOM thrashing — only the commit phase touches it, and only with the diff.
        </p>
      </section>

      <Checkpoint id="cp-elements-and-fibers" moduleSlug={MODULE_SLUG} title="React elements vs DOM nodes">
        <Quiz
          kind="Quick check"
          question="When you write `<div>Hi</div>` in JSX, what does React see first?"
          options={[
            { label: "An HTMLDivElement attached to the DOM.", explanation: "Wrong — that's the final step, after reconciliation and commit. JSX is a description, not a DOM node." },
            { label: "A plain object describing the element, returned by `React.createElement`.", correct: true, explanation: "Right — JSX compiles to a `createElement` call that returns an object. The DOM node comes later, in the commit phase." },
            { label: "A string of HTML.", explanation: "Wrong — JSX is not HTML. There's no string serialization step in the React pipeline." },
            { label: "A function that builds DOM directly.", explanation: "Wrong — components return descriptions, not direct DOM mutations." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Reconciliation — the diffing rules</h2>
        <p>
          When React compares old tree to new tree, it walks position by position and applies two heuristics:
        </p>
        <h3>Rule 1 — different types, throw it out</h3>
        <p>
          If the element at a given position is now a different type (e.g. <code>&lt;div&gt;</code>{" "}became <code>&lt;p&gt;</code>, or <code>&lt;Tabs&gt;</code>{" "}became <code>&lt;Accordion&gt;</code>), React unmounts the old subtree entirely and mounts the new one from scratch. State is lost. Effects re-run.
        </p>
        <pre><code>{`{showA
  ? <ComponentA value={x} />
  : <ComponentB value={x} />}
// Toggling \`showA\` unmounts ComponentA (loses its state)
// and mounts ComponentB fresh. They are different types.`}</code></pre>
        <h3>Rule 2 — same type, reuse and patch</h3>
        <p>
          If the type is the same (<code>&lt;div&gt;</code>{" "}is still <code>&lt;div&gt;</code>), React keeps the same DOM node and just updates the differing attributes. Children are then reconciled recursively.
        </p>
        <h3>Rule 3 — lists need keys</h3>
        <p>
          For arrays of children, position alone isn&apos;t enough. React uses the <code>key</code>{" "}prop to match items across renders. We&apos;ll come back to this.
        </p>
        <Callout variant="warn" title="Why this matters">
          A component that <em>changes type</em>{" "}between renders loses all of its internal state, refs, and unfinished effects. If you wrap a form in <code>{`{showAdvanced ? <Modal>...</Modal> : <>...</>}`}</code>, every input inside resets when you toggle.
        </Callout>
      </section>

      <Checkpoint id="cp-reconciliation" moduleSlug={MODULE_SLUG} title="Reconciliation — the diffing rules">
        <Quiz
          kind="Scenario"
          question="You wrap an `<input>` in `{showLabel ? <label>...<Input /></label> : <Input />}`. Toggling `showLabel` clears the user's typing. Why?"
          options={[
            { label: "React always re-renders inputs from scratch.", explanation: "Wrong — React preserves state when the component type is unchanged." },
            { label: "The `Input` component is at a different position in the tree (wrapped vs unwrapped), so React unmounts and remounts it.", correct: true, explanation: "Right — the parent type changed at that position (`label` ↔ fragment), so the subtree below it is rebuilt and the input's state is lost." },
            { label: "It's a known React 19 regression.", explanation: "Wrong — this is the documented diffing behavior, not a bug." },
            { label: "Inputs can't preserve uncontrolled state.", explanation: "Wrong — they can, as long as React keeps the DOM node. Here it doesn't." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Keys — what they actually do</h2>
        <p>
          For arrays, React needs to know <em>which item is which</em>{" "}across renders. The <code>key</code>{" "}prop is the identity. Without it, React falls back to position — which breaks when items reorder.
        </p>
        <pre><code>{`// ❌ Anti-pattern: key={i}
{items.map((item, i) => <Row key={i} item={item} />)}

// If you reorder, React thinks: "the item at position 0
// is the same as before; just update its props." It reuses
// the wrong DOM node and reapplies state to the wrong row.

// ✅ Use a stable, unique id:
{items.map((item) => <Row key={item.id} item={item} />)}`}</code></pre>
        <p>
          The visible symptom of <code>key={`{index}`}</code>{" "}is: when a user types in input number 2, then prepends a new row, the user&apos;s text ends up in the wrong input. The DOM node was reused for a different item.
        </p>
        <Callout variant="info" title="Keys aren't for performance — they're for correctness">
          Keys exist to tell React which item is which across renders. Reusing the right DOM node is also faster, but the real bug fixed by stable keys is <em>state ending up on the wrong row</em>.
        </Callout>
        <p>
          When index keys are safe: a list that never reorders, never inserts in the middle, never deletes from the middle. If items are append-only by id, index happens to work — but you might as well key by id and stop thinking about it.
        </p>
      </section>

      <section>
        <h2>Mount vs update vs unmount</h2>
        <p>
          The lifecycle in terms you should be able to recite:
        </p>
        <ul>
          <li><strong>Mount</strong>{" "}— first time a component appears at a position. Component function runs; DOM nodes are created; refs attach; effects with no deps run.</li>
          <li><strong>Update</strong>{" "}— same position, same type, different props or state. Function re-runs; reconciliation patches the DOM; effects whose deps changed re-run (after running their cleanup).</li>
          <li><strong>Unmount</strong>{" "}— component disappears from the tree. Refs detach; effect cleanups run.</li>
        </ul>
        <p>
          A component that changes type between renders goes <em>unmount → mount</em>, not <em>update</em>. That&apos;s the source of the &quot;why did my state disappear&quot; bug.
        </p>
      </section>

      <Checkpoint id="cp-keys" moduleSlug={MODULE_SLUG} title="Keys — what they actually do">
        <Quiz
          kind="Scenario"
          question="A user types in the second input of a list keyed by `index`. The list then prepends a new item at the top. What happens?"
          options={[
            { label: "Nothing — React tracks input state by DOM node identity.", explanation: "Wrong — React tracks by key. With index keys, the DOM node is reused for a different item." },
            { label: "The text the user typed shifts onto a different row.", correct: true, explanation: "Right — the DOM node at index 1 is now associated with a different item, but the input element (and its uncontrolled text) is reused. The text follows the position, not the item." },
            { label: "React clears all input values for safety.", explanation: "Wrong — React doesn't clear inputs unless the DOM node is unmounted." },
            { label: "The list refuses to update.", explanation: "Wrong — the list updates fine; it just updates incorrectly." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="When is `key={index}` actually safe?"
          options={[
            { label: "Always — the warning is conservative.", explanation: "Wrong — it's safe only for very specific list shapes." },
            { label: "When the list is append-only and items are never reordered, inserted in the middle, or removed.", correct: true, explanation: "Right — those are the conditions under which position == identity. Once any of them is violated, index keys can break correctness." },
            { label: "When the items are primitives.", explanation: "Wrong — primitives don't change the diffing rules. The issue is whether positions are stable, not the value type." },
            { label: "Never — index keys are always a bug.", explanation: "Wrong — they happen to work for append-only lists. They're just brittle to future changes." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>JSX compiles to <code>React.createElement</code>, which returns plain objects describing the UI — the &quot;virtual DOM.&quot;</li>
          <li>An update has two phases: <strong>render</strong>{" "}(call your components, build the new tree) and <strong>commit</strong>{" "}(diff against the previous tree, apply minimum DOM operations).</li>
          <li><strong>Reconciliation</strong>{" "}walks position by position. Different element type → unmount + mount (state lost). Same type → reuse the DOM node, patch differing props.</li>
          <li><strong>Keys</strong>{" "}give items identity inside arrays so React matches them across renders. Index keys break when items reorder, insert, or delete.</li>
          <li>The classic bug fixed by stable keys is &quot;user input ended up on the wrong row.&quot;</li>
          <li>Lifecycle in three words: <em>mount</em>{" "}(first appear), <em>update</em>{" "}(same position, same type), <em>unmount</em>{" "}(disappear).</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build a list of editable items with <code>key={`{index}`}</code>. Reorder them with a button. Type in one input, reorder, watch the text move to the wrong row.</li>
          <li>Switch to <code>key={`{item.id}`}</code>. Repeat — confirm the text stays with the item.</li>
          <li>Write a component that switches type between renders (e.g. <code>{`{wrap ? <fieldset>...</fieldset> : <>...</>}`}</code>) and observe that state inside is reset on every toggle. Then add a stable wrapper so the type doesn&apos;t change — confirm state persists.</li>
          <li><em>Stretch:</em>{" "}implement an 80-line <code>render(prev, next)</code>{" "}function in plain JS that takes two element-object trees and prints the patch operations it would apply. Forces you to internalize the diff rules.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why React unmounts when the element type changes, and why keys are about <em>correctness</em>{" "}before they&apos;re about <em>performance</em>.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
