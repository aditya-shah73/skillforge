import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "values-references";

const CHECKPOINTS = [
  { id: "cp-primitives", title: "Primitives vs reference types" },
  { id: "cp-equality", title: "=== and the value/reference split" },
  { id: "cp-react-bugs", title: "Reference bugs in React" },
];

export default function ValuesReferencesModule() {
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
          Values, references, and what <code>===</code> actually compares
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Half the React bugs you&apos;ve ever shipped come from one misunderstanding: what your variable actually holds.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Think of a variable as a <strong>box on a shelf</strong>{" "}with a sticky note on it. The sticky note says the variable&apos;s name. What&apos;s <em>inside</em> the box depends on the type of value:
        </p>
        <ul>
          <li>If you assign a <strong>primitive</strong>,{" "}a number, a string, a boolean, <code>null</code>, <code>undefined</code>, a symbol, a bigint, the box itself <em>contains the value</em>. The number 7 is right there in the box.</li>
          <li>If you assign an <strong>object</strong>,{" "}including arrays and functions, the box doesn&apos;t contain the object. It contains an <strong>address</strong>,{" "}a piece of paper with the location of the actual object, which lives somewhere else (the heap).</li>
        </ul>
        <p>
          When you copy a primitive variable, you copy the value inside the box. When you copy an object variable, you copy the <em>address</em>,{" "}but both addresses point to the same object. Mutate the object through one variable and the other variable sees the mutation, because they were pointing at the same thing all along.
        </p>
        <p>
          That&apos;s the whole concept. The bugs come from forgetting which kind of box you&apos;re holding.
        </p>
      </section>

      <section>
        <h2>The seven primitives</h2>
        <p>JavaScript has exactly seven primitive types. Memorize them, they&apos;re the ones whose values live <em>in the variable</em>:</p>
        <ul>
          <li><code>number</code>,{" "}<code>42</code>, <code>3.14</code>, <code>NaN</code>, <code>Infinity</code></li>
          <li><code>string</code>,{" "}<code>&quot;hi&quot;</code>, <code>`tagged`</code></li>
          <li><code>boolean</code>,{" "}<code>true</code>, <code>false</code></li>
          <li><code>null</code>,{" "}the explicit &quot;nothing&quot;</li>
          <li><code>undefined</code>,{" "}the implicit &quot;nothing&quot;</li>
          <li><code>symbol</code>,{" "}unique identifiers (rare in app code; common in library code)</li>
          <li><code>bigint</code>,{" "}integers bigger than <code>Number.MAX_SAFE_INTEGER</code></li>
        </ul>
        <p>
          Everything else, objects, arrays, functions, dates, regexes, <code>Map</code>, <code>Set</code>, is a <strong>reference type</strong>. The variable holds an address; the actual object lives on the heap.
        </p>
      </section>

      <section>
        <h2>Worked example: the assignment trick</h2>
        <p>Predict what each <code>console.log</code> prints, then read on:</p>
        <pre><code>{`let a = 5;
let b = a;
b = 10;
console.log(a); // ?

let arr1 = [1, 2, 3];
let arr2 = arr1;
arr2.push(4);
console.log(arr1); // ?`}</code></pre>
        <p>The first <code>console.log</code> prints <code>5</code>. The second prints <code>[1, 2, 3, 4]</code>. Same syntax, completely different behavior.</p>
        <p>Why? When you write <code>let b = a</code>, you copied the value <code>5</code> into a new box labeled <code>b</code>. Two boxes, two independent values. Reassigning <code>b</code> doesn&apos;t touch <code>a</code>.</p>
        <p>When you write <code>let arr2 = arr1</code>, you copied the <em>address</em>{" "}into a new box labeled <code>arr2</code>. Two boxes, one object. Pushing through <code>arr2</code> mutates the same object that <code>arr1</code> points to.</p>

        <Quiz
          question="Predict the output: `let x = {n: 1}; let y = x; y.n = 99; console.log(x.n);`"
          kind="Predict the output"
          options={[
            { label: "1", explanation: "Nope, both x and y hold the address of the same object." },
            { label: "99", correct: true, explanation: "Yes. y received a copy of the address, not a copy of the object. Mutating y.n mutates the one object both names point at." },
            { label: "undefined", explanation: "Nope, n was set to 99 just before the log." },
            { label: "Throws", explanation: "Nope, mutation is allowed even on `let` reassignments." },
          ]}
        />
      </section>

      <section>
        <h2>What <code>===</code> actually compares</h2>
        <p>
          The strict-equality operator <code>===</code> does <em>exactly</em>{" "}what you&apos;d expect, but only if you remember the box model.
        </p>
        <ul>
          <li><strong>For primitives</strong>: <code>===</code> compares the values inside the boxes. <code>5 === 5</code> is <code>true</code> because both boxes contain the same number.</li>
          <li><strong>For reference types</strong>: <code>===</code> compares the addresses. <code>[1] === [1]</code> is <code>false</code> because each literal creates a new array on the heap with a different address, even though they <em>look</em> identical.</li>
        </ul>
        <pre><code>{`5 === 5;            // true  — same primitive value
"hi" === "hi";      // true  — same primitive value
[1] === [1];        // false — two new arrays, two addresses
{} === {};          // false — two new objects
const a = [1]; const b = a;
a === b;            // true  — same address (a copied b's pointer)`}</code></pre>

        <Quiz
          question="Why does `[] === []` evaluate to `false`?"
          kind="Quick check"
          options={[
            { label: "Arrays use a different equality operator", explanation: "Nope, `===` works for everything. The behavior is consistent." },
            { label: "Each [] literal creates a new array, so the two operands have different addresses", correct: true, explanation: "Exactly. `===` on reference types compares addresses, and two literals never share one." },
            { label: "Empty arrays are falsy", explanation: "Empty arrays are actually truthy in JS, and that's not what `===` checks anyway." },
            { label: "It's a bug in JavaScript", explanation: "It's intentional. Structural equality is `Object.is`-ish only for primitives; references compare by identity." },
          ]}
        />
      </section>

      <section>
        <h2>The exception: <code>NaN</code></h2>
        <p>
          One primitive breaks the &quot;same value = equal&quot; rule: <code>NaN</code>.
        </p>
        <pre><code>{`NaN === NaN; // false (!)
Object.is(NaN, NaN); // true`}</code></pre>
        <p>
          This is IEEE-754 floating point, not a JS bug, but it matters in practice because React&apos;s <code>useState</code> uses <code>Object.is</code> (not <code>===</code>) to decide whether to re-render, which is why setting state to <code>NaN</code> twice still triggers one render and not two. We&apos;ll come back to this in the hooks chapter.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-primitives"
        title="Primitives vs reference types"
        celebration="You can see the box model now. Most JS bugs start to make sense."
      >
        <p>Defend the box model with two answers:</p>
        <Quiz
          question="`let s1 = 'hi'; let s2 = s1; s2 = 'bye'; console.log(s1);` prints…"
          kind="Defend it"
          options={[
            { label: "'hi'", correct: true, explanation: "Strings are primitives. s2 got a copy of the value; reassigning s2 doesn't touch s1." },
            { label: "'bye'", explanation: "Nope, primitives copy by value." },
            { label: "undefined", explanation: "s1 was assigned at the top." },
          ]}
        />
        <Quiz
          question="`const a = {n: 1}; const b = a; b.n++; console.log(a.n);` prints…"
          kind="Defend it"
          options={[
            { label: "1", explanation: "Both names point at the same object. Mutation through b is visible through a." },
            { label: "2", correct: true, explanation: "Right, one object, two names. `const` only prevents reassignment of the binding, not mutation of the object." },
            { label: "TypeError (const)", explanation: "`const` blocks reassignment, not mutation. b.n++ doesn't reassign b." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>How this trips up React</h2>
        <p>
          React decides whether to re-render by comparing the <em>address</em>{" "}of state and props between renders (it uses <code>Object.is</code>, which behaves like <code>===</code> for almost everything). If you mutate an object in place and pass the same address back, React thinks nothing changed.
        </p>
        <p>This is why the React docs are emphatic that you must <em>replace</em>{" "}state, not mutate it:</p>
        <pre><code>{`// ❌ wrong — same address, React skips the re-render
setUser((prev) => {
  prev.name = "Aditya";
  return prev;
});

// ✅ right — new object, new address, React re-renders
setUser((prev) => ({ ...prev, name: "Aditya" }));`}</code></pre>
        <p>
          The spread <code>{`{ ...prev }`}</code> creates a brand-new object on the heap with a brand-new address. Same data, different identity. React sees a different address, re-renders, your UI updates.
        </p>
        <Callout variant="warn" title="The shallow-spread gotcha">
          <p className="m-0">Spread copies one level deep only. If you spread <code>{`{ user, settings: { theme: "dark" } }`}</code>, the outer object is new but <code>settings</code> still points at the same nested object. Mutate <code>settings.theme</code> and you&apos;ll still get a stale-render bug. Either spread every level you intend to change, or reach for an immutability helper (Immer is the popular choice, we cover it in Phase 5).</p>
        </Callout>
      </section>

      <section>
        <h2>Variants that show up in interviews</h2>

        <h3>1. Function arguments are passed by value-of-reference</h3>
        <p>
          When you pass an object into a function, the parameter inside the function is a <em>new variable</em>{" "}holding a <em>copy of the address</em>. So:
        </p>
        <pre><code>{`function reassign(arr) {
  arr = [9, 9, 9];
}
const xs = [1, 2, 3];
reassign(xs);
console.log(xs); // [1, 2, 3] — the local arr was rebound, original untouched

function mutate(arr) {
  arr.push(99);
}
mutate(xs);
console.log(xs); // [1, 2, 3, 99] — followed the address, mutated the object`}</code></pre>
        <p>
          Reassigning a parameter inside a function never affects the caller&apos;s variable. Mutating through it does. This is the source of the &quot;why didn&apos;t my React state update when I called a helper that pushed to it?&quot; bug, your helper mutated the object, React didn&apos;t see a new address, render skipped.
        </p>

        <h3>2. String &quot;mutation&quot; doesn&apos;t exist</h3>
        <pre><code>{`let s = "hi";
s[0] = "Y";
console.log(s); // "hi" — strings are immutable; the assignment silently failed`}</code></pre>
        <p>
          Strings are primitives. They have methods (<code>.toUpperCase()</code>, <code>.slice()</code>), but those return <em>new</em>{" "}strings, they never mutate the original. This is true for all primitives.
        </p>

        <h3>3. <code>const</code> doesn&apos;t mean &quot;constant&quot;</h3>
        <pre><code>{`const arr = [];
arr.push(1);        // fine — mutating the object
arr = [1, 2, 3];    // TypeError — reassigning the binding`}</code></pre>
        <p>
          <code>const</code> locks the <strong>binding</strong>,{" "}the variable can&apos;t point at a different address. It says nothing about the object itself. If you want a genuinely-immutable object, you need <code>Object.freeze</code> (shallow) or a library.
        </p>

        <Quiz
          question="Which of these is the *only* way to make a TRUE copy (no shared references) of `{a: 1, b: {c: 2}}`?"
          kind="Quick check"
          options={[
            { label: "Spread: `{...obj}`", explanation: "Shallow, outer is new, but `b` still points at the same inner object." },
            { label: "`Object.assign({}, obj)`", explanation: "Also shallow, same caveat as spread." },
            { label: "`structuredClone(obj)` (modern) or a deep-clone helper", correct: true, explanation: "Right. `structuredClone` is the modern built-in deep-clone for plain data. Spread + Object.assign are shallow." },
            { label: "`JSON.parse(JSON.stringify(obj))`", explanation: "Often works, but loses functions, undefined, Date objects, and Map/Set. structuredClone preserves those." },
          ]}
        />
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-equality"
        title="=== and the value/reference split"
        celebration="You now have the mental model that explains the next eight chapters."
      >
        <Quiz
          question="`[1, 2] === [1, 2]` evaluates to…"
          kind="Defend it"
          options={[
            { label: "true", explanation: "Nope, two different arrays, two different addresses." },
            { label: "false", correct: true, explanation: "Right. `===` on reference types compares the address, and the two literals create separate arrays." },
            { label: "Throws", explanation: "`===` always returns a boolean, never throws." },
          ]}
        />
        <Quiz
          question="What logs? `const a = {x: 1}; const b = a; a.x = 2; console.log(a === b, b.x);`"
          kind="Defend it"
          options={[
            { label: "false 1", explanation: "b copied a's address, they still point to the same object." },
            { label: "true 2", correct: true, explanation: "Yes. Same address (===), and the mutation through a is visible through b." },
            { label: "true 1", explanation: "They share an address, but the mutation made x = 2." },
            { label: "false 2", explanation: "Same address, `===` returns true." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The bug-hunt project</h2>
        <p>
          You&apos;re going to fix 12 broken snippets, all involving values vs references. The goal isn&apos;t to write 12 fixes, it&apos;s to <em>predict the wrong output, explain why, then fix it</em>.
        </p>
        <Callout variant="insight" title="How to do this project (and why it works)">
          <p className="mb-2">For each snippet:</p>
          <ol className="m-0">
            <li>Read it. Predict the output <em>out loud or on paper</em>.</li>
            <li>Run it in the browser console or Node REPL.</li>
            <li>If you were wrong, explain to yourself <em>why</em>,{" "}specifically in terms of the box model.</li>
            <li>Fix the snippet to produce the &quot;intended&quot; output.</li>
          </ol>
          <p className="mt-2 mb-0">The mistakes you make on this set will reveal exactly which corner of the box model you don&apos;t own yet. That&apos;s the gold.</p>
        </Callout>
        <p className="mt-4">The 12 snippets (do these in your own scratch file or a CodeSandbox, the value of predicting then running comes from the friction of typing them out yourself):</p>
        <ol>
          <li><code>{`let a = 1; let b = a; b++; console.log(a, b);`}</code></li>
          <li><code>{`const a = {n: 1}; const b = a; b.n++; console.log(a.n, b.n);`}</code></li>
          <li><code>{`const a = [1, 2]; const b = [...a]; b.push(3); console.log(a, b);`}</code></li>
          <li><code>{`const a = {x: {n: 1}}; const b = {...a}; b.x.n = 99; console.log(a.x.n);`}</code></li>
          <li><code>{`function f(x) { x = [9]; } const arr = [1]; f(arr); console.log(arr);`}</code></li>
          <li><code>{`function f(x) { x.push(9); } const arr = [1]; f(arr); console.log(arr);`}</code></li>
          <li><code>{`const a = NaN; console.log(a === a, Object.is(a, a));`}</code></li>
          <li><code>{`const s = "hi"; s[0] = "Y"; console.log(s);`}</code></li>
          <li><code>{`const a = {n: 1}; const b = {n: 1}; console.log(a === b);`}</code></li>
          <li><code>{`const f = () => {}; const g = f; console.log(f === g);`}</code></li>
          <li><code>{`const arr = [1, 2, 3]; const copy = arr; arr.length = 0; console.log(copy);`}</code></li>
          <li><code>{`const obj = Object.freeze({n: 1}); obj.n = 99; console.log(obj.n);`}</code> (strict mode vs not, try both)</li>
        </ol>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-react-bugs"
        title="Reference bugs in React"
        celebration="You've internalized the rule that explains half the React bugs you'll ever ship."
      >
        <Quiz
          question="Why doesn't `setUser((u) => { u.name = 'A'; return u; })` re-render the component?"
          kind="Defend it"
          options={[
            { label: "React batches state updates", explanation: "Batching delays the work; here, the work never happens at all because React's bailout check fires." },
            { label: "The returned object has the same address as the previous state, so React's identity check bails out", correct: true, explanation: "Exactly. React uses Object.is on the previous and next state. Same address → bail out → no re-render." },
            { label: "Mutation is forbidden by React's TypeScript types", explanation: "TypeScript can warn, but the runtime behavior here is the bug, even untyped, React would still skip the render." },
            { label: "The component is memoized", explanation: "Memoization is a different layer. This bug happens with or without React.memo." },
          ]}
        />
        <Quiz
          question="To fix the bug, you should…"
          kind="Defend it"
          options={[
            { label: "Call setUser twice", explanation: "Doesn't help, you'd just bail out twice." },
            { label: "Return a brand-new object: `setUser((u) => ({...u, name: 'A'}))`", correct: true, explanation: "Yes. Spread creates a new outer object with a new address; React sees a difference and re-renders." },
            { label: "Use `let` instead of `const`", explanation: "`const` vs `let` has no effect on object mutation." },
            { label: "Add `useMemo`", explanation: "useMemo memoizes a computed value, it doesn't fix the underlying mutation issue." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second interview answer</h2>
        <p>
          When the interviewer asks <em>&quot;what&apos;s the difference between value types and reference types?&quot;</em>, here&apos;s the answer you want at the tip of your tongue:
        </p>
        <Callout variant="insight" title="Say it out loud">
          <p className="m-0">
            &quot;JavaScript has seven primitive types, number, string, boolean, null, undefined, symbol, bigint. Variables holding primitives <em>contain</em> the value, so copying them and comparing them with <code>===</code> works on the value itself. Everything else, objects, arrays, functions, is a reference type. The variable holds an address to an object on the heap. Copying a reference variable copies the address, not the object; comparing them with <code>===</code> compares addresses, not contents; mutating through one variable is visible through any other variable that shares the address. React relies on this, its bailout check uses <code>Object.is</code> on state, which is why mutating state in place fails to trigger a re-render.&quot;
          </p>
        </Callout>
        <p>
          That answer demonstrates: you know the types, you know the storage model, you know <code>===</code>, you know the React implication. It&apos;s an entire mid-level interview signal in one paragraph.
        </p>
      </section>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          Module 2 is <strong>closures</strong>. With the box model in place, closures are the next layer: now that you know variables hold values or addresses, we&apos;ll look at how functions <em>remember</em>{" "}the variables they were defined alongside, and why <code>useState</code>, <code>useEffect</code>, and every hook you use is built on this one idea.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
