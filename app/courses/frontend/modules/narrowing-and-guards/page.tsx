import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "narrowing-and-guards";

const CHECKPOINTS = [
  { id: "cp-narrowing-basics", title: "Narrowing, how TS reads `if` and `typeof`" },
  { id: "cp-discriminated-unions", title: "Discriminated unions, the state-machine pattern" },
  { id: "cp-custom-guards", title: "Custom type guards and exhaustiveness with `never`" },
];

export default function NarrowingAndGuardsModule() {
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
          Narrowing, discriminated unions, and exhaustiveness
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A type isn&apos;t a fixed badge, it&apos;s a set of possibilities that <em>shrinks</em>{" "}as the type-checker reads your code. Once you see narrowing, you stop fighting TypeScript and start steering it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine a detective in an interrogation room. The suspect could be one of five people. Every question, <em>&quot;were you in Boston that night?&quot;</em>,{" "}eliminates some of them. By the end, only one possibility remains.
        </p>
        <p>
          That&apos;s what TypeScript does inside an <code>if</code>{" "}block. The variable&apos;s type starts as a union (<em>&quot;could be a string or null&quot;</em>), and each check you write <strong>narrows</strong>{" "}the set of possibilities. After <code>if (x !== null)</code>, TS knows <code>x</code>{" "}is no longer null, not because you said so, but because you <em>proved</em>{" "}it with the check.
        </p>
        <Callout variant="insight" title="Narrowing in one sentence">
          Narrowing is TypeScript reading your runtime checks and updating the static type to match what it can prove is true on this branch.
        </Callout>
      </section>

      <section>
        <h2>How narrowing works, the basic operators</h2>
        <p>
          TypeScript watches a handful of expressions and uses them to narrow:
        </p>
        <ul>
          <li><code>typeof x === &quot;string&quot;</code>,{" "}narrows to <code>string</code>.</li>
          <li><code>x !== null</code>, <code>x !== undefined</code>,{" "}removes those from the union.</li>
          <li><code>&quot;name&quot; in obj</code>,{" "}narrows to the shape with that property.</li>
          <li><code>x instanceof Date</code>,{" "}narrows to <code>Date</code>{" "}(works for classes / built-ins).</li>
          <li>Equality with a literal: <code>x === &quot;admin&quot;</code>{" "}narrows to the literal type.</li>
          <li>Truthiness: <code>if (x)</code>{" "}removes <code>null</code>, <code>undefined</code>, <code>0</code>, <code>&quot;&quot;</code>, <code>false</code>.</li>
        </ul>
        <pre><code>{`function format(x: string | number | null) {
  if (x === null) return "(none)";
  // x is now: string | number
  if (typeof x === "string") {
    return x.trim();      // x is: string
  }
  return x.toFixed(2);    // x is: number
}`}</code></pre>
        <Callout variant="warn" title="The truthiness trap">
          <code>if (user.name)</code>{" "}narrows out <code>undefined</code>, but it also narrows out the empty string. If <code>&quot;&quot;</code>{" "}is a legal value, use <code>!== undefined</code>{" "}instead. The bug is silent until a user types nothing.
        </Callout>
      </section>

      <Checkpoint id="cp-narrowing-basics" moduleSlug={MODULE_SLUG} title="Narrowing, how TS reads `if` and `typeof`">
        <Quiz
          kind="Quick check"
          question={"What's the inferred type of `x` inside the else branch?\n\n```ts\nfunction f(x: string | number | null) {\n  if (typeof x === 'string') return x.length;\n  // <-- inside the else, what is x?\n}\n```"}
          options={[
            { label: "string | number | null", explanation: "Wrong, the `typeof` check eliminated `string` on the else side." },
            { label: "number | null", correct: true, explanation: "Right, narrowing removes `string` from the union on the else branch." },
            { label: "number", explanation: "Wrong, only the `typeof` test ran. `null` is still possible until you check for it." },
            { label: "unknown", explanation: "Wrong, `unknown` is what you start with when you receive untyped data, not what narrowing produces." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Discriminated unions, the state-machine pattern</h2>
        <p>
          Narrowing really pays off with <strong>discriminated unions</strong>: each variant carries a literal-typed &quot;tag&quot; that TS uses to pick a branch. This is how you model finite states (loading / success / error) without booleans-and-prayers.
        </p>
        <pre><code>{`type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function render(s: RequestState<User>) {
  switch (s.status) {
    case "idle":    return "Click to load";
    case "loading": return "Loading...";
    case "success": return s.data.name;     // .data exists here
    case "error":   return s.message;       // .message exists here
  }
}`}</code></pre>
        <p>
          Two things to notice:
        </p>
        <ul>
          <li>The <code>status</code>{" "}field is the <strong>discriminant</strong>. Each variant has a different literal value (<code>&quot;idle&quot;</code>, <code>&quot;loading&quot;</code>, …).</li>
          <li>Inside each <code>case</code>, TS knows which variant you have, so <code>s.data</code>{" "}is only available in the <code>success</code>{" "}case, and <code>s.message</code>{" "}only in <code>error</code>. Forgetting <code>data</code>{" "}in the success branch is a <em>compile error</em>, not a 3am page.</li>
        </ul>
        <Callout variant="info" title="Why this beats booleans">
          A pair of booleans <code>{`{ loading: boolean; error: boolean; data?: T }`}</code>{" "}has 8 representable states but only 4 valid ones. The other 4 are bugs waiting to happen. A discriminated union has <em>exactly</em>{" "}4 states. The type is the spec.
        </Callout>
      </section>

      <Checkpoint id="cp-discriminated-unions" moduleSlug={MODULE_SLUG} title="Discriminated unions, the state-machine pattern">
        <Quiz
          kind="Scenario"
          question={"You write `if (s.status === 'success') return s.message;` against the `RequestState` union above. What happens?"}
          options={[
            { label: "It compiles and crashes at runtime when `s.message` is undefined.", explanation: "Wrong, TS catches this before runtime." },
            { label: "It compiles fine, `message` exists on a sibling variant.", explanation: "Wrong, narrowing on the discriminant removes the other variants. `message` isn't available." },
            { label: "It fails to compile, `message` doesn't exist on the success variant.", correct: true, explanation: "Right, that's the whole point of discriminated unions. Wrong field access is a type error." },
            { label: "It compiles but produces a warning.", explanation: "Wrong, TypeScript treats this as a hard error, not a warning." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Custom type guards, teaching TS your own checks</h2>
        <p>
          Sometimes the check you need isn&apos;t a built-in operator. Maybe you want to ask <em>&quot;is this thing a User?&quot;</em>{" "}where User is your own shape. You write a function whose return type is a <strong>type predicate</strong>: <code>x is User</code>.
        </p>
        <pre><code>{`type User = { id: string; name: string };

function isUser(x: unknown): x is User {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x && typeof (x as User).id === "string" &&
    "name" in x && typeof (x as User).name === "string"
  );
}

function greet(input: unknown) {
  if (isUser(input)) {
    return \`Hello \${input.name}\`;     // input is User here
  }
  return "Hello stranger";
}`}</code></pre>
        <p>
          The signature <code>x is User</code>{" "}is a <em>promise</em>{" "}to the compiler: <em>&quot;if this returns true, treat x as User on the true branch.&quot;</em>{" "}TypeScript trusts you, you&apos;d better not lie.
        </p>
        <Callout variant="warn" title="Type predicates are unchecked">
          TypeScript does <em>not</em>{" "}verify that your guard&apos;s body actually proves the predicate. If you write <code>{`function isUser(x: unknown): x is User { return true; }`}</code>, TS believes you. Lying here means runtime crashes.
        </Callout>
      </section>

      <section>
        <h2>Exhaustiveness with <code>never</code></h2>
        <p>
          Discriminated unions only stay useful if every case is handled. The trick: assign the &quot;impossible&quot; residual to a <code>never</code>{" "}variable at the end of your switch.
        </p>
        <pre><code>{`function render(s: RequestState<User>) {
  switch (s.status) {
    case "idle":    return "Click to load";
    case "loading": return "Loading...";
    case "success": return s.data.name;
    case "error":   return s.message;
    default: {
      const _exhaustive: never = s;       // ❶
      throw new Error(\`Unhandled: \${_exhaustive}\`);
    }
  }
}`}</code></pre>
        <p>
          ❶, at this point, the type-checker has eliminated every variant. The only type that fits is <code>never</code>. If you later add <code>{`| { status: "cancelled" }`}</code>{" "}to <code>RequestState</code>, the new variant <em>cannot</em>{" "}be assigned to <code>never</code>, and the line breaks the build. You learn about missing cases at compile time, not in production.
        </p>
        <Callout variant="insight" title="The pattern in one sentence">
          Exhaustiveness checks are how you make <em>adding a new case</em>{" "}fail loudly. They are the closest thing TypeScript has to &quot;the compiler told me what to fix.&quot;
        </Callout>
      </section>

      <Checkpoint id="cp-custom-guards" moduleSlug={MODULE_SLUG} title="Custom type guards and exhaustiveness with `never`">
        <Quiz
          kind="Quick check"
          question="What does the return type `x is User` actually do at runtime?"
          options={[
            { label: "It generates a runtime validation check.", explanation: "Wrong, TypeScript erases all type annotations at compile time. The predicate has zero runtime effect." },
            { label: "Nothing, it's a hint to the type-checker only.", correct: true, explanation: "Right, `x is User` is purely compile-time. Your function body still has to do the real check; TS just trusts your verdict." },
            { label: "It throws an error if `x` is not a User.", explanation: "Wrong, predicates don't throw. They return true/false and tell TS which branch to narrow." },
            { label: "It converts `x` into a User type at runtime.", explanation: "Wrong, there is no runtime conversion. TypeScript has no runtime presence at all." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You add a fifth variant to a discriminated union but forget to handle it in the switch. Your exhaustiveness check uses `const _exhaustive: never = s`. What does TS report?"
          options={[
            { label: "Nothing, `never` accepts any value.", explanation: "Wrong, `never` is the empty set. *Nothing* is assignable to `never`." },
            { label: "A runtime error on the throw statement.", explanation: "Wrong, the assertion fires at compile time, not at runtime." },
            { label: "A compile error: the new variant is not assignable to `never`.", correct: true, explanation: "Right, that's the trip-wire. The unhandled case has a type that doesn't fit `never`, so the line fails the build." },
            { label: "A warning about an unused variable.", explanation: "Wrong, the assignment itself is what triggers the check, and the type-mismatch error supersedes any unused-variable hint." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>Narrowing</strong>{" "}is TS reading runtime checks (<code>typeof</code>, <code>in</code>, <code>instanceof</code>, equality, truthiness) and updating the type on each branch.</li>
          <li><strong>Discriminated unions</strong>{" "}give each variant a literal-typed tag (<code>status: &quot;loading&quot;</code>). Switching on the tag tells TS which fields are safe to access.</li>
          <li>Use them to model finite state, <em>idle/loading/success/error</em>,{" "}instead of stacks of booleans that allow illegal states.</li>
          <li><strong>Custom guards</strong>{" "}use the predicate signature <code>x is T</code>{" "}to narrow. TS trusts the body, write it carefully.</li>
          <li><strong>Exhaustiveness</strong>: assign the switch&apos;s residual to a <code>never</code>{" "}variable. Adding an unhandled case breaks the build instead of failing in prod.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Build a small <code>RequestState</code>{" "}renderer:
        </p>
        <ol>
          <li>Define <code>{`type RequestState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; message: string }`}</code>.</li>
          <li>Write <code>{`function render(s: RequestState<User>): string`}</code>{" "}with a switch on <code>status</code>. Add the <code>{`const _exhaustive: never = s`}</code>{" "}check in <code>default</code>.</li>
          <li>Add a fifth variant <code>{`{ status: "cancelled" }`}</code>{" "}to the union. Watch <em>only</em>{" "}the exhaustiveness line break, TS tells you exactly where to add the missing case.</li>
          <li>Write a custom guard <code>{`function isErrorResponse(x: unknown): x is { error: string }`}</code>{" "}and use it to narrow an <code>unknown</code>{" "}value from <code>fetch().then(r =&gt; r.json())</code>.</li>
        </ol>
        <p>
          You should be able to explain, out loud, why the exhaustiveness check is the most valuable line in the whole file, even though it never runs.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
