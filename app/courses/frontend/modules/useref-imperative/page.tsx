import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "useref-imperative";

const CHECKPOINTS = [
  { id: "cp-ref-vs-state", title: "What a ref is, and ref-vs-state" },
  { id: "cp-dom-and-instance", title: "DOM refs, usePrevious, and the render counter" },
  { id: "cp-imperative-handle", title: "forwardRef + useImperativeHandle" },
];

export default function UseRefImperativeModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 4 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          <code>useRef</code>{" "}&amp; <code>useImperativeHandle</code>,{" "}the escape hatch from state
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          State is for things the screen should react to. A ref is for everything else you need to remember, a value that survives renders without ever triggering one. Learn the line between them and most &quot;where do I put this?&quot; questions answer themselves.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy, the sticky note on your desk</h2>
        <p>
          Imagine your component re-runs from the top every time something changes. Most of what you scribble during one run gets thrown away when the next run starts, local variables, intermediate values, all gone. State is the exception: React keeps it for you, and changing it is a signal that says <em>&quot;re-run me and repaint the screen.&quot;</em>
        </p>
        <p>
          A <strong>ref</strong>{" "}is a third thing. It&apos;s a sticky note you keep on your desk, off to the side, that survives every re-run. You can read it, you can write on it, but writing on it does <em>not</em>{" "}tell React to re-run anything. It just sits there, holding the latest value, ready for the next render.
        </p>
        <ul>
          <li><strong>Local variable</strong>: forgotten at the end of each render.</li>
          <li><strong>State</strong>: remembered across renders, <em>and</em>{" "}changing it triggers a re-render.</li>
          <li><strong>Ref</strong>: remembered across renders, and changing it triggers <em>nothing</em>.</li>
        </ul>
        <Callout variant="insight" title="The one-sentence definition">
          A ref is a box whose contents persist across renders, and mutating that box is invisible to React&apos;s render cycle.
        </Callout>
      </section>

      <section>
        <h2><code>useRef</code>{" "}returns a stable box</h2>
        <p>
          <code>useRef(initial)</code>{" "}returns the <em>same</em>{" "}object on every render, a plain object of the shape <code>{`{ current: initial }`}</code>. &quot;Same&quot; is the important word: the identity is stable, so you can stash a value in <code>.current</code>{" "}on one render and read it back on the next.
        </p>
        <pre><code>{`import { useRef } from "react";

function Demo() {
  const box = useRef(0);
  // box is the SAME object every render.
  // box.current is whatever you last wrote.

  box.current = box.current + 1; // mutating — no re-render
  return <p>render ran</p>;
}`}</code></pre>
        <p>
          Two non-negotiable facts:
        </p>
        <ul>
          <li>The <em>object</em>{" "}is stable across renders, <code>box === box</code>{" "}from one render to the next. (Contrast with <code>useState</code>, where the state <em>value</em>{" "}can change but you don&apos;t get a mutable container.)</li>
          <li>Assigning to <code>box.current</code>{" "}is a plain mutation. React doesn&apos;t observe it, doesn&apos;t schedule a render, doesn&apos;t care. The new value is simply there the next time the component happens to render for some <em>other</em>{" "}reason.</li>
        </ul>
        <p>
          That gives refs exactly two jobs:
        </p>
        <ol>
          <li><strong>DOM node references</strong>,{" "}hold the actual <code>&lt;input&gt;</code>/<code>&lt;div&gt;</code>{" "}element so you can call imperative DOM APIs (<code>focus()</code>, <code>scrollIntoView()</code>, measure size).</li>
          <li><strong>Instance variables</strong>,{" "}a mutable value you want to remember but explicitly do <em>not</em>{" "}want to render on: a timer id, a previous value, a render count, a &quot;has this already fired?&quot; flag.</li>
        </ol>
        <Callout variant="warn" title="Don't read or write refs during render">
          Reading or writing <code>ref.current</code>{" "}<em>during</em>{" "}rendering (outside an event handler or effect) makes your render impure, the output depends on something React can&apos;t track, which breaks under concurrent features and StrictMode. Mutate refs in event handlers and effects; read them there too. The example above mutates during render only to make the point, don&apos;t ship that.
        </Callout>
      </section>

      <section>
        <h2>DOM refs, focus, scroll, measure</h2>
        <p>
          The most common ref is a handle to a real DOM node. You declare the ref, hand it to an element via the <code>ref</code>{" "}attribute, and React fills in <code>.current</code>{" "}with the node after it mounts.
        </p>
        <pre><code>{`import { useRef, useEffect } from "react";

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount — a classic, legitimate effect use.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function scrollToTop() {
    inputRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function measure() {
    const rect = inputRef.current?.getBoundingClientRect();
    console.log("width:", rect?.width);
  }

  return <input ref={inputRef} placeholder="Search…" />;
}`}</code></pre>
        <p>
          Notes that trip people up:
        </p>
        <ul>
          <li><code>inputRef.current</code>{" "}is <code>HTMLInputElement | null</code>. It&apos;s <code>null</code>{" "}before mount and after unmount, always guard with <code>?.</code>{" "}or an explicit check.</li>
          <li>You typically read a DOM ref <em>after</em>{" "}render, in an effect or an event handler, because the node doesn&apos;t exist yet while the component body runs the first time.</li>
          <li>Reach for a DOM ref only for things React can&apos;t do declaratively: imperative focus management, scrolling, measuring layout, integrating a non-React library. Anything you can express as &quot;render this based on state,&quot; you should.</li>
        </ul>
        <Callout variant="info" title="Ref callbacks, briefly">
          The <code>ref</code>{" "}attribute also accepts a function: <code>{`ref={(node) => { /* node, or null on unmount */ }}`}</code>. Useful when you need to run code the moment a node attaches/detaches, or to collect a list of nodes. In React 19 a ref callback may return a cleanup function. For the common &quot;hold one node&quot; case, the <code>useRef</code>{" "}object form is simpler.
        </Callout>
      </section>

      <section>
        <h2>The decision rule, render on it, or just remember it?</h2>
        <p>
          This is the whole module in one rule, and it&apos;s the question interviewers are really asking when they say &quot;<code>useState</code>{" "}or <code>useRef</code>?&quot;
        </p>
        <Callout variant="insight" title="The rule">
          If the UI must update when this value changes, it&apos;s <strong>state</strong>. If you only need to <em>remember</em>{" "}the value across renders but the screen shouldn&apos;t react to it, it&apos;s a <strong>ref</strong>.
        </Callout>
        <p>
          Walk through examples with that lens:
        </p>
        <ul>
          <li>The text shown in an input that the user edits → <strong>state</strong>{" "}(the UI reflects it).</li>
          <li>The number currently displayed by a counter → <strong>state</strong>.</li>
          <li>A <code>setTimeout</code>/<code>setInterval</code>{" "}id you need so you can clear it later → <strong>ref</strong>{" "}(nothing on screen depends on the id).</li>
          <li>The DOM node you want to <code>focus()</code>{" "}→ <strong>ref</strong>.</li>
          <li>The previous value of a prop, used only inside an effect → <strong>ref</strong>.</li>
          <li>How many times the component has rendered, shown as debug text → that one you <em>want</em>{" "}on screen, so… still a ref to <em>store</em>{" "}it, but you read it for display only; storing it in state would create an infinite render loop (more on that below).</li>
        </ul>
        <Callout variant="warn" title="The classic anti-pattern">
          Putting a value in <code>useState</code>{" "}and then never using it to render anything, only reading it in handlers, means every update repaints the screen for no reason. That should have been a ref. The reverse mistake (a ref the UI <em>should</em>{" "}react to) is worse: you mutate it and the screen never updates, because refs don&apos;t trigger renders.
        </Callout>
      </section>

      <Checkpoint id="cp-ref-vs-state" moduleSlug={MODULE_SLUG} title="What a ref is, and ref-vs-state">
        <Quiz
          kind="Quick check"
          question="You assign a new value to `someRef.current` inside a button's onClick handler. What does React do in response?"
          options={[
            { label: "Schedules a re-render of the component, like setState would.", explanation: "Wrong, that's exactly what setState does and refs deliberately do NOT. Mutating .current is invisible to React." },
            { label: "Nothing, it's a plain mutation; the new value is simply there on the next render that happens for some other reason.", correct: true, explanation: "Right, refs persist across renders but mutating them never triggers one. That's the entire point of the escape hatch." },
            { label: "Throws an error because refs are read-only.", explanation: "Wrong, `.current` is writable; that's how you store instance values." },
            { label: "Re-renders only the children, not the component itself.", explanation: "Wrong, there's no partial render. A ref mutation triggers no render at all." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You need to remember the id returned by setTimeout so you can clearTimeout it later. Nothing on screen depends on the id. State or ref?"
          options={[
            { label: "useState, any value remembered across renders belongs in state.", explanation: "Wrong, state would re-render the component every time you store the id, for no visible reason." },
            { label: "useRef, you need to remember it across renders, but the UI shouldn't react to it.", correct: true, explanation: "Right, 'remember without rendering' is the textbook ref use. A timer id is a mutable instance variable." },
            { label: "A plain local variable inside the component.", explanation: "Wrong, a local variable is reset every render, so you'd lose the id before you could clear it." },
            { label: "A module-level variable outside the component.", explanation: "Wrong, that's shared across all instances and survives unmounts; it'd leak between components. A ref is per-instance." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Two instance-variable patterns: <code>usePrevious</code>{" "}and a render counter</h2>
        <p>
          These are the canonical &quot;remember without rendering&quot; patterns, and they show up in interviews constantly because they force you to articulate <em>why</em>{" "}a ref and not state.
        </p>

        <h3><code>usePrevious</code></h3>
        <p>
          You want the value a prop or state had on the <em>previous</em>{" "}render. You can&apos;t store it in state, updating that state during render would loop, and updating it in an effect would lag by a render in a way that&apos;s easy to get wrong. A ref written in an effect is the clean answer.
        </p>
        <pre><code>{`import { useRef, useEffect } from "react";

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value; // runs AFTER render commits
  });

  return ref.current; // the value from the PREVIOUS commit
}

// Usage:
function Price({ amount }: { amount: number }) {
  const prev = usePrevious(amount);
  const arrow = prev === undefined ? "" : amount > prev ? "▲" : amount < prev ? "▼" : "=";
  return <span>{amount} {arrow}</span>;
}`}</code></pre>
        <p>
          The mechanism: during render you <em>read</em>{" "}<code>ref.current</code>, which still holds last commit&apos;s value. <em>After</em>{" "}the render commits, the effect overwrites it with the current value, ready to be &quot;the previous&quot; for the next render. The ordering (read in render, write in effect) is what makes it work.
        </p>

        <h3>A render counter</h3>
        <p>
          A debugging aid that counts how many times the component rendered. The temptation is <code>useState</code>,{" "}but incrementing state on each render <em>causes</em>{" "}another render, which increments again: an infinite loop. A ref breaks the cycle because bumping it renders nothing.
        </p>
        <pre><code>{`function useRenderCount() {
  const count = useRef(0);
  count.current += 1; // bump on every render — no re-render triggered
  return count.current;
}

function Widget() {
  const renders = useRenderCount();
  return <small>rendered {renders}×</small>;
}`}</code></pre>
        <Callout variant="warn" title="Why incrementing state here loops forever">
          <code>setCount(c =&gt; c + 1)</code>{" "}during render schedules a render, whose render runs <code>setCount</code>{" "}again, forever. The ref version mutates a box and triggers nothing, the count simply rides along on renders that happen for real reasons. This is the cleanest demonstration of &quot;a ref change is invisible to React.&quot;
        </Callout>
      </section>

      <Checkpoint id="cp-dom-and-instance" moduleSlug={MODULE_SLUG} title="DOM refs, usePrevious, and the render counter">
        <Quiz
          kind="Scenario"
          question="In `usePrevious`, why is the new value written inside a `useEffect` instead of directly in the component body?"
          options={[
            { label: "So the write happens after the render commits, the body can read the OLD value first, then the effect updates it for next time.", correct: true, explanation: "Right, read-in-render, write-in-effect is the ordering that makes 'previous' actually previous. Writing in the body would overwrite before you read it." },
            { label: "Because you can only mutate refs inside effects.", explanation: "Wrong, you can mutate refs in handlers and effects; the constraint is about timing here, not legality." },
            { label: "Because effects make the ref trigger a re-render.", explanation: "Wrong, effects don't make ref mutations re-render. Nothing does." },
            { label: "To satisfy the dependency array linter.", explanation: "Wrong, the effect intentionally has no dependency array; it runs after every commit. The reason is ordering, not the linter." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="Why does a render counter use a ref instead of `useState`?"
          options={[
            { label: "Refs are faster to read than state.", explanation: "Wrong, read speed isn't the issue; the issue is what each one does on write." },
            { label: "Because incrementing state on every render would schedule another render, looping infinitely; a ref mutation triggers no render, so it just rides along.", correct: true, explanation: "Right, state-on-render is an infinite loop; the ref breaks it because mutating `.current` is invisible to React's render cycle." },
            { label: "Because state can't hold numbers.", explanation: "Wrong, state holds numbers fine; the problem is the feedback loop, not the type." },
            { label: "Because refs persist to localStorage automatically.", explanation: "Wrong, refs don't persist anywhere; they live in memory for the component's lifetime." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2><code>forwardRef</code>{" "}+ <code>useImperativeHandle</code>,{" "}a controlled imperative API</h2>
        <p>
          Sometimes a parent genuinely needs to <em>tell a child to do something</em>{" "}imperatively, &quot;focus yourself,&quot; &quot;clear yourself,&quot; &quot;scroll to that row.&quot; You don&apos;t want to hand the parent your raw DOM node (it could do anything to it). Instead you expose a small, deliberate handle: the exact methods you choose, and nothing else.
        </p>
        <p>
          That&apos;s the job of <code>useImperativeHandle</code>. It customizes what <code>ref.current</code>{" "}points at when a parent attaches a ref to your component, turning &quot;the DOM node&quot; into &quot;an object with the methods I decided to publish.&quot;
        </p>
        <pre><code>{`import { forwardRef, useRef, useImperativeHandle } from "react";

export type TextInputHandle = {
  focus: () => void;
  clear: () => void;
};

type TextInputProps = {
  placeholder?: string;
};

const TextInput = forwardRef<TextInputHandle, TextInputProps>(
  function TextInput({ placeholder }, ref) {
    // A PRIVATE ref to the real DOM node — the parent never sees this.
    const innerRef = useRef<HTMLInputElement>(null);

    // Publish ONLY focus() and clear() on the parent's ref.
    useImperativeHandle(ref, () => ({
      focus: () => innerRef.current?.focus(),
      clear: () => {
        if (innerRef.current) innerRef.current.value = "";
      },
    }), []);

    return <input ref={innerRef} placeholder={placeholder} />;
  }
);

// Parent — drives the child through the published handle:
function Form() {
  const inputRef = useRef<TextInputHandle>(null);
  return (
    <>
      <TextInput ref={inputRef} placeholder="Name" />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
      <button onClick={() => inputRef.current?.clear()}>Clear</button>
    </>
  );
}`}</code></pre>
        <p>
          What each piece does:
        </p>
        <ul>
          <li><code>forwardRef&lt;HandleType, PropsType&gt;</code>,{" "}lets the component <em>receive</em>{" "}a ref as a second argument. Order is handle type first, props second (same shape as DOM <code>forwardRef</code>, just with your custom handle as the &quot;ref type&quot;).</li>
          <li><code>innerRef</code>,{" "}a private DOM ref. The parent can&apos;t reach it; it only sees what you publish.</li>
          <li><code>useImperativeHandle(ref, factory, deps)</code>,{" "}sets <code>ref.current</code>{" "}to the object the factory returns. The dep array works like other hooks: an empty array means the handle object is created once and stays stable.</li>
        </ul>
        <Callout variant="info" title="React 19 nuance, ref as a normal prop">
          In React 19 you can accept <code>ref</code>{" "}as a regular prop (e.g. <code>{`function TextInput({ placeholder, ref }: Props & { ref?: Ref<TextInputHandle> })`}</code>), so <code>forwardRef</code>{" "}is no longer required for new code. But <code>useImperativeHandle</code>{" "}is still exactly how you <em>shape</em>{" "}the exposed handle, whether the ref arrived via <code>forwardRef</code>{" "}or as a prop. The examples here use <code>forwardRef</code>{" "}because it remains the most widely-seen, version-portable form; the handle logic is identical either way.
        </Callout>
      </section>

      <section>
        <h2>When <em>not</em>{" "}to reach for an imperative handle</h2>
        <p>
          <code>useImperativeHandle</code>{" "}is an escape hatch, and like all escape hatches it&apos;s the wrong default. React&apos;s model is declarative: the parent describes <em>what</em>{" "}it wants via props and state, and the child re-renders to match. Reach for imperative handles only when there&apos;s no reasonable declarative expression.
        </p>
        <ul>
          <li><strong>Prefer props.</strong>{" "}&quot;Open the dialog&quot; is usually better as a controlled <code>open</code>{" "}prop than an imperative <code>dialogRef.current?.open()</code>. Props keep state in one place and survive re-renders predictably.</li>
          <li><strong>Genuine imperative actions are fine.</strong>{" "}Focus, scroll, select text, play/pause a <code>&lt;video&gt;</code>, trigger an animation, integrate a non-React widget, these are momentary commands with no declarative equivalent. That&apos;s the legitimate use.</li>
          <li><strong>Publish the smallest surface.</strong>{" "}Expose <code>focus()</code>{" "}and <code>clear()</code>, not the whole DOM node. A narrow handle is a contract; a raw node is an invitation to break encapsulation.</li>
        </ul>
        <Callout variant="warn" title="Smell test">
          If you find yourself reaching into a child to <em>read</em>{" "}or <em>set</em>{" "}its state imperatively, that state probably belongs in the parent (lift it up) or in a shared context, not behind an imperative handle. Imperative handles are for <em>actions</em>, not for state ownership.
        </Callout>
      </section>

      <Checkpoint id="cp-imperative-handle" moduleSlug={MODULE_SLUG} title="forwardRef + useImperativeHandle">
        <Quiz
          kind="Scenario"
          question="A teammate exposes the raw `<input>` DOM node on a component's ref so the parent can call `focus()`. What's the better design, and why?"
          options={[
            { label: "It's already optimal, exposing the DOM node is the simplest thing.", explanation: "Wrong, it leaks the entire node, letting the parent mutate styles, value, attributes, anything. That breaks encapsulation." },
            { label: "Use `useImperativeHandle` to publish a small handle like `{ focus, clear }`, so the parent gets exactly the actions you chose and nothing else.", correct: true, explanation: "Right, a narrow handle is a deliberate contract. The private DOM ref stays hidden; the parent can only do what you published." },
            { label: "Switch everything to context so no refs are needed.", explanation: "Wrong, context shares state, but a momentary action like focus() has no declarative/state equivalent. This is a legitimate imperative case." },
            { label: "Move the input's value into the parent's state instead.", explanation: "Wrong, that solves value ownership, not the 'tell the child to focus' action. focus() is an imperative command, not state." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="In React 19, given that `ref` can be a normal prop, what is `useImperativeHandle` still for?"
          options={[
            { label: "Nothing, React 19 removed the need for it entirely.", explanation: "Wrong, React 19 removed the need for `forwardRef` in new code, but not for shaping the handle." },
            { label: "Shaping what `ref.current` points at, turning the forwarded ref into an object exposing only the methods you choose, regardless of whether the ref arrived via forwardRef or as a prop.", correct: true, explanation: "Right, `useImperativeHandle` defines the exposed handle. The ref-as-prop change only affects how the ref is received, not how you shape it." },
            { label: "Forcing the child to re-render when the parent calls a method.", explanation: "Wrong, calling a handle method runs your imperative code; it doesn't inherently re-render anything." },
            { label: "Persisting the handle to localStorage between sessions.", explanation: "Wrong, it has nothing to do with persistence; it customizes the in-memory ref value." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>What a ref is</strong>: a stable <code>{`{ current }`}</code>{" "}box that persists across renders; mutating <code>.current</code>{" "}triggers <em>no</em>{" "}re-render.</li>
          <li><strong>Decision rule</strong>: render on it → <code>useState</code>. Remember it without rendering → <code>useRef</code>.</li>
          <li><strong>Two uses</strong>: (1) DOM node refs for <code>focus</code>/<code>scroll</code>/<code>measure</code>; (2) instance variables, timer ids, previous values, render counts, &quot;has fired&quot; flags.</li>
          <li><strong>Read/write timing</strong>: mutate and read refs in event handlers and effects, not during render (keeps render pure).</li>
          <li><strong>usePrevious</strong>: read <code>ref.current</code>{" "}in render (old value), write the new value in an effect (after commit).</li>
          <li><strong>Imperative API</strong>: <code>forwardRef</code>{" "}receives the ref; <code>useImperativeHandle(ref, () =&gt; ({`{ ... }`}), deps)</code>{" "}publishes a small handle. Expose actions, not the raw node.</li>
          <li><strong>Default declarative</strong>: imperative handles are the escape hatch, prefer props/state; use handles only for momentary actions with no declarative equivalent.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build a <code>&lt;TextInput&gt;</code>{" "}with <code>forwardRef</code>{" "}that keeps a <em>private</em>{" "}<code>innerRef</code>{" "}to its real <code>&lt;input&gt;</code>, and uses <code>useImperativeHandle</code>{" "}to publish exactly two methods: <code>focus()</code>{" "}and <code>clear()</code>. Verify the parent can call both via its ref and can&apos;t touch the DOM node directly.</li>
          <li>Write a <code>usePrevious&lt;T&gt;</code>{" "}hook (read <code>ref.current</code>{" "}in render, write in an effect). Use it in a <code>&lt;Price&gt;</code>{" "}component that shows ▲/▼ comparing the current amount to the previous render&apos;s amount.</li>
          <li>Write a <code>useRenderCount</code>{" "}hook that bumps a ref each render and returns the count. Drop it into a component and confirm the number climbs <em>without</em>{" "}causing extra renders, then deliberately try the <code>useState</code>{" "}version and watch it loop, so you can explain the difference out loud.</li>
          <li>Add a button to the parent that focuses and another that clears the <code>&lt;TextInput&gt;</code>. Then ask yourself: which of these behaviors <em>could</em>{" "}have been props instead of imperative calls, and why focus/clear are reasonable as imperative actions.</li>
        </ol>
        <p>
          You should be able to explain, out loud, why a render counter must use a ref, why <code>usePrevious</code>{" "}writes in an effect, and why you publish <code>{`{ focus, clear }`}</code>{" "}instead of the raw input node.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
