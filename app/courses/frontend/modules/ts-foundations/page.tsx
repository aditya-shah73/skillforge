import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "ts-foundations";

const CHECKPOINTS = [
  { id: "cp-structural", title: "Structural typing — duck-typed at compile time" },
  { id: "cp-type-vs-interface", title: "`type` vs `interface` — what each one is for" },
  { id: "cp-any-unknown-never", title: "`any`, `unknown`, `never` — pick the right escape hatch" },
];

export default function TsFoundationsModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          TypeScript foundations — structural typing &amp; the <code>any</code>/<code>unknown</code>/<code>never</code> trio
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          TypeScript isn&apos;t Java with JS syntax. It&apos;s a duck-typing engine bolted onto JavaScript — and once you see that, the strange behaviors stop being strange.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine you&apos;re hiring for a job titled <em>&quot;person who can fetch coffee.&quot;</em>{" "}Most languages would ask: <em>&quot;what&apos;s your degree, what&apos;s your job title, are you literally classified as a barista?&quot;</em>{" "}That&apos;s <strong>nominal typing</strong>{" "}— you check the label.
        </p>
        <p>
          TypeScript hires differently. It asks: <em>&quot;can you walk, can you carry a cup, do you know what coffee is?&quot;</em>{" "}If yes, you&apos;re hired — regardless of your job title. That&apos;s <strong>structural typing</strong>: TypeScript doesn&apos;t care what your type is <em>named</em>, only what <em>shape</em> it has.
        </p>
        <p>
          Two interfaces with identical fields are <strong>the same type</strong>, even if they have different names and were declared in different files. That single fact explains 90% of &quot;why is TypeScript letting me do this?&quot; moments.
        </p>
      </section>

      <section>
        <h2>Why TypeScript at all? The bugs it catches</h2>
        <p>JavaScript will happily let you do all of this:</p>
        <pre><code>{`const user = { name: "Ada" };
console.log(user.nmae);     // undefined. silent.
user.id = 5;                // sure, add fields whenever.
const total = "10" + 5;     // "105". it's fine, apparently.
fetch("/api").then(r => r.json()).then(data => data.user.name);
// Crashes at runtime if data is { error: "..." }`}</code></pre>
        <p>TypeScript turns each of these into a compile-time error:</p>
        <ul>
          <li>Typo on a field name? <code>Property &apos;nmae&apos; does not exist</code>.</li>
          <li>Adding a field that wasn&apos;t in the type? Error.</li>
          <li>Mixing string and number? Error (unless you opt in).</li>
          <li>Accessing a field that might not exist on the response shape? Error — forces you to narrow first.</li>
        </ul>
        <p>
          It&apos;s not a different language — TypeScript is JavaScript plus a <em>checker</em>. The runtime that actually executes is still JS; TS just refuses to compile if it can see a bug from the type info you gave it.
        </p>
      </section>

      <section>
        <h2>Structural typing in action</h2>
        <p>Two named types with the same shape are interchangeable:</p>
        <pre><code>{`type Point2D = { x: number; y: number };
type Vector  = { x: number; y: number };

const p: Point2D = { x: 1, y: 2 };
const v: Vector  = p;  // ✅ same shape, totally fine.

function length(v: Vector) { return Math.hypot(v.x, v.y); }
length(p);             // ✅ p has x and y. it qualifies.

// Even an ad-hoc object works:
length({ x: 3, y: 4 }); // ✅
length({ x: 3, y: 4, z: 0 });
// ❌ Object literal may only specify known properties — z is not in Vector.`}</code></pre>
        <p>
          That last line is the <strong>excess property check</strong>: a special rule for <em>object literals passed directly</em>{" "}— TS warns you about extra fields because it&apos;s likely a typo. Assign to a variable first and the warning goes away. Worth memorizing — interviewers love this gotcha.
        </p>
        <Callout variant="warn" title="Structural typing trap">
          <p>
            Because shapes are matched structurally, a function that returns <code>{`{ id: string; name: string }`}</code>{" "}satisfies a type that only wants <code>{`{ id: string }`}</code>. That&apos;s a <em>feature</em>, not a bug — but it means you can&apos;t use TypeScript types as <em>access control</em>. If a value has extra fields at runtime, the type system can&apos;t hide them.
          </p>
        </Callout>
      </section>

      <Checkpoint id="cp-structural" moduleSlug={MODULE_SLUG} title="Structural typing — duck-typed at compile time">
        <p>
          In 30 seconds: explain why TypeScript will let you pass a <code>{`{ name: string; age: number }`}</code>{" "}to a function expecting <code>{`{ name: string }`}</code>, and then explain when the excess property check stops it.
        </p>
        <Quiz
          kind="Quick check"
          question="Which of these will TypeScript reject?"
          options={[
            { label: "Assigning a Person { name, age } to a slot typed { name } via a variable", explanation: "Wrong — structural typing accepts a supertype-shaped value where a subset is needed." },
            { label: "Passing { name: 'Ada', age: 30 } as an object literal directly into a function expecting { name: string }", correct: true, explanation: "Correct — the excess property check fires on direct object literals to catch typos." },
            { label: "Calling a function that takes Point2D with an object typed as Vector when both are { x, y }", explanation: "Wrong — same shape, structurally equivalent." },
            { label: "Returning more fields than the declared return type", explanation: "Wrong — returning more is fine; only literal object args trigger excess-property warnings." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2><code>type</code> vs <code>interface</code> — what&apos;s the actual difference?</h2>
        <p>
          90% of the time, they&apos;re interchangeable. The differences only matter at the edges, and once you know them you can stop arguing about it in PR reviews.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Capability</th><th><code>interface</code></th><th><code>type</code></th></tr>
            </thead>
            <tbody>
              <tr><td>Object shape</td><td>✅</td><td>✅</td></tr>
              <tr><td>Extend / intersect</td><td>✅ <code>extends</code></td><td>✅ <code>&amp;</code></td></tr>
              <tr><td>Declaration merging (same name redeclared, fields combined)</td><td>✅</td><td>❌</td></tr>
              <tr><td>Union types (<code>A | B</code>)</td><td>❌</td><td>✅</td></tr>
              <tr><td>Tuple, mapped, conditional, template-literal types</td><td>❌</td><td>✅</td></tr>
              <tr><td>Aliasing a primitive (<code>type Id = string</code>)</td><td>❌</td><td>✅</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Rule of thumb:</strong>{" "}use <code>interface</code>{" "}for public object shapes that libraries might extend (you can later merge into them). Use <code>type</code>{" "}for everything else — unions, primitives, computed types, anything that isn&apos;t a plain object shape.
        </p>
        <Callout variant="info" title="What declaration merging is for">
          <p>
            You write <code>interface Window {`{ myAnalytics: ... }`}</code>{" "}in your code and TS merges it with the built-in <code>Window</code>{" "}interface — now <code>window.myAnalytics</code>{" "}is typed. That&apos;s declaration merging, and it&apos;s the only <em>capability</em>{" "}interfaces have that types don&apos;t. If you&apos;ll never need that, just use <code>type</code>.
          </p>
        </Callout>
      </section>

      <section>
        <h2>Worked example: extends vs &amp;</h2>
        <pre><code>{`interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type AnimalT = { name: string };
type DogT = AnimalT & { breed: string };

// Both produce the same shape. Both are usable as Animal or Dog.
const d1: Dog  = { name: "Lila", breed: "Aussie" };
const d2: DogT = { name: "Lila", breed: "Aussie" };`}</code></pre>
        <p>
          Where they diverge: if a downstream consumer redeclares <code>interface Animal</code>{" "}with a new field, it merges into both <code>Animal</code>{" "}and <code>Dog</code>. They can&apos;t do that with the <code>type</code>{" "}version.
        </p>
      </section>

      <Checkpoint id="cp-type-vs-interface" moduleSlug={MODULE_SLUG} title="`type` vs `interface` — what each one is for">
        <p>
          Explain in 45 seconds: when would you specifically reach for <code>interface</code>{" "}over <code>type</code>, and when does <code>type</code>{" "}have a capability that <code>interface</code>{" "}can&apos;t match?
        </p>
        <Quiz
          kind="Gut check"
          question="You need to define `type Status = 'idle' | 'loading' | 'success' | 'error'`. Why can't this be an interface?"
          options={[
            { label: "Because interfaces can't have lowercase names", explanation: "Wrong — naming is a convention, not a rule." },
            { label: "Because interfaces can only describe object shapes — they can't be a union of string literals", correct: true, explanation: "Right — unions are a `type` thing. Interfaces are object-shape only." },
            { label: "Because string literal types require ES2020+", explanation: "Wrong — string literal types are core TS." },
            { label: "Because you can't `extends` a string", explanation: "True but irrelevant — the issue is the union, not the strings." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The escape hatches: <code>any</code>, <code>unknown</code>, <code>never</code></h2>
        <p>These three look similar; they&apos;re each precisely the opposite of the others, and pulling out the wrong one is one of the most common interview tells.</p>

        <h3><code>any</code> — the &quot;turn TypeScript off here&quot; type</h3>
        <p>
          <code>any</code>{" "}means &quot;I&apos;m opting out of the checker for this value.&quot; You can do anything with it; TS won&apos;t complain.
        </p>
        <pre><code>{`function logIt(x: any) {
  x.foo.bar.baz();          // ✅ TS allows it.
  x();                      // ✅
  const n: number = x;      // ✅ — any flows into anything.
}`}</code></pre>
        <p>
          The cost: bugs hide in <code>any</code>. The whole reason you adopted TS is to catch this stuff. Treat <code>any</code>{" "}as a code smell. There&apos;s usually a better choice.
        </p>

        <h3><code>unknown</code> — &quot;something is here, but I don&apos;t know what yet&quot;</h3>
        <p>
          <code>unknown</code>{" "}is what <code>any</code>{" "}should have been. The value <em>exists</em>, but you can&apos;t use it until you <strong>narrow</strong>{" "}it first.
        </p>
        <pre><code>{`function logIt(x: unknown) {
  x.foo;                    // ❌ Object is of type 'unknown'.
  if (typeof x === "object" && x !== null && "foo" in x) {
    // here, x is narrowed to { foo: unknown }
  }
  if (typeof x === "string") {
    x.toUpperCase();        // ✅ inside the if, x is string.
  }
}`}</code></pre>
        <p>
          Use <code>unknown</code>{" "}for things like parsed JSON, third-party event payloads, or anything coming from outside your type system. It forces you to check before you trust.
        </p>

        <h3><code>never</code> — &quot;this can&apos;t happen&quot;</h3>
        <p>
          <code>never</code>{" "}is the type of a value that <em>cannot exist</em>. Functions that always throw or never return are <code>{`() => never`}</code>. It&apos;s also what a discriminated union narrows to after you&apos;ve handled every case — TypeScript&apos;s built-in exhaustiveness check.
        </p>
        <pre><code>{`function fail(msg: string): never {
  throw new Error(msg);
}

type Shape = { kind: "circle" } | { kind: "square" };
function area(s: Shape) {
  switch (s.kind) {
    case "circle": return /* ... */;
    case "square": return /* ... */;
    default:
      const _exhaustive: never = s;  // ❗ if we forget a case, s won't be never
      return _exhaustive;
  }
}`}</code></pre>
        <p>
          Add a new case <code>{`{ kind: "triangle" }`}</code>{" "}to <code>Shape</code>{" "}and you instantly get a compile error at <code>_exhaustive</code>: <code>Type &apos;{`{ kind: "triangle" }`}&apos; is not assignable to type &apos;never&apos;</code>. That single trick keeps your switches honest forever.
        </p>
        <Callout variant="insight" title="The contrast in one line">
          <p>
            <strong><code>any</code></strong>{" "}= &quot;skip the check.&quot; &nbsp;
            <strong><code>unknown</code></strong>{" "}= &quot;check before you use.&quot; &nbsp;
            <strong><code>never</code></strong>{" "}= &quot;this can&apos;t happen.&quot;
          </p>
        </Callout>
      </section>

      <Checkpoint id="cp-any-unknown-never" moduleSlug={MODULE_SLUG} title="`any`, `unknown`, `never` — pick the right escape hatch">
        <p>
          For each scenario, name which one fits — and justify in one sentence.
        </p>
        <Quiz
          kind="Scenario"
          question="You're parsing JSON from `fetch()`. What's the right return type for `.json()` to *force callers to validate*?"
          options={[
            { label: "any — let callers do whatever", explanation: "Wrong — `any` defeats the purpose of TypeScript here." },
            { label: "unknown — caller must narrow before using", correct: true, explanation: "Right — `unknown` is the JSON shape's actual contract: a value exists, but its shape is unverified." },
            { label: "object — at least it's an object", explanation: "Wrong — JSON can also be a string, number, null, or array." },
            { label: "never — the call can't return", explanation: "Very wrong — it absolutely returns; it's just the shape we don't know." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You're writing an exhaustiveness check in a switch over a discriminated union. What's the type of the variable in `default:`?"
          options={[
            { label: "any", explanation: "Wrong — that would silence the check." },
            { label: "unknown", explanation: "Wrong — `unknown` doesn't catch missed cases at compile time." },
            { label: "never", correct: true, explanation: "Right — once every case is narrowed away, the residual is `never`. Adding a new case breaks the assertion." },
            { label: "void", explanation: "Wrong — `void` is for return types of functions that don't return a useful value." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>TypeScript</strong>{" "}= JavaScript + a compile-time checker. Same runtime, more safety.</li>
          <li>It&apos;s <strong>structurally typed</strong>{" "}— two types with the same shape are the same type, regardless of name. The excess-property check on object literals catches typos.</li>
          <li><strong><code>type</code>{" "}vs <code>interface</code></strong>: use <code>interface</code>{" "}for object shapes you might want to extend or merge later; use <code>type</code>{" "}for unions, primitives, and computed types.</li>
          <li><strong><code>any</code></strong>{" "}skips the checker (avoid). <strong><code>unknown</code></strong>{" "}means &quot;narrow before using.&quot; <strong><code>never</code></strong>{" "}means &quot;this can&apos;t happen&quot; — perfect for exhaustiveness checks.</li>
          <li>The whole point is to <em>shift bugs left</em>{" "}— catch them at the keyboard, not in production.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Open a small TS playground (or a folder with <code>tsc --strict</code>) and:
        </p>
        <ol>
          <li>Type a function <code>parseUser(input: unknown): User</code>{" "}where <code>User</code>{" "}is <code>{`{ id: string; name: string; email?: string }`}</code>. Narrow <code>input</code>{" "}explicitly before returning.</li>
          <li>Add an exhaustiveness check on a <code>{`type Role = "admin" | "user" | "guest"`}</code>{" "}switch — use <code>never</code>. Add a fourth role and watch it break.</li>
          <li>Write two equivalent definitions of <code>{`type Point`}</code>: one as <code>type</code>, one as <code>interface</code>. Try declaration merging on the interface (add a field in a second declaration) — confirm it&apos;s impossible with <code>type</code>.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why <code>any</code>{" "}made the first task feel easier and made it worse. That&apos;s the lesson.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
