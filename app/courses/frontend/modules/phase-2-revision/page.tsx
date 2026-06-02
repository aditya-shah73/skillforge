import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-2-revision";

export default function Phase2RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 2 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 2 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The TypeScript-for-React reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material, it is a <strong>map of Phase 2</strong>. Five modules of TypeScript foundations, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/ts-foundations" className="text-cyan-600 hover:underline">TS foundations</Link>,{" "}
          <Link href="/courses/frontend/modules/narrowing-and-guards" className="text-cyan-600 hover:underline">Narrowing &amp; guards</Link>,{" "}
          <Link href="/courses/frontend/modules/generics-deep" className="text-cyan-600 hover:underline">Generics</Link>,{" "}
          <Link href="/courses/frontend/modules/utility-types" className="text-cyan-600 hover:underline">Utility types</Link>, and{" "}
          <Link href="/courses/frontend/modules/react-typing" className="text-cyan-600 hover:underline">Typing React</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — TS foundations */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · TypeScript foundations</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Structural typing</strong>: two types with the same shape are the same type. TS doesn&apos;t care what you named the type, only what fields it has.</li>
            <li>The <strong>excess-property check</strong>{" "}only fires on object <em>literals</em>{" "}assigned directly. Once it&apos;s a variable, structural compatibility wins.</li>
            <li><strong><code>type</code>{" "}vs <code>interface</code></strong>: <code>interface</code>{" "}for object shapes (supports declaration merging, <code>extends</code>); <code>type</code>{" "}for unions, primitives, mapped/conditional types. They&apos;re mostly interchangeable for plain object shapes.</li>
            <li><strong><code>any</code></strong>{" "}silences the checker, avoid. <strong><code>unknown</code></strong>{" "}is the safe escape hatch: you can hold any value but must narrow before using it. <strong><code>never</code></strong>{" "}is the empty set: nothing fits, used for exhaustiveness checks and impossible return types.</li>
            <li>TypeScript erases at runtime. Type annotations have <em>zero</em>{" "}runtime cost and zero runtime effect.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Narrowing, discriminated unions, guards */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Narrowing &amp; discriminated unions</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Narrowing</strong>: TS reads runtime checks (<code>typeof</code>, <code>in</code>, <code>instanceof</code>, equality, truthiness) and updates the static type on each branch.</li>
            <li>The truthiness trap: <code>if (s)</code>{" "}removes <code>&quot;&quot;</code>, <code>0</code>, <code>false</code>{" "}as well as <code>null/undefined</code>. Use explicit <code>!== undefined</code>{" "}when the falsy values are legal.</li>
            <li><strong>Discriminated unions</strong>: each variant carries a literal-typed tag (e.g. <code>status: &quot;loading&quot;</code>). Switching on the tag tells TS which fields are safe to access.</li>
            <li>Use them to model finite state, <em>idle/loading/success/error</em>,{" "}instead of boolean combinations that allow illegal states.</li>
            <li><strong>Custom type guards</strong>{" "}use the predicate <code>x is T</code>. TS trusts the body, verify what you promise.</li>
            <li><strong>Exhaustiveness</strong>: <code>{`const _exhaustive: never = s`}</code>{" "}in the <code>default</code>{" "}branch. Adding a new variant fails the build instead of running buggy in prod.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Generics */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · Generics</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A <strong>generic</strong>{" "}is a type-level parameter. <code>{`<T>`}</code>{" "}lets the caller (or inference) pick a type, preserving input/output relationships.</li>
            <li>Without generics, you fall back to <code>any</code>{" "}or <code>unknown</code>,{" "}throwing away the information generics exist to preserve.</li>
            <li><strong>Constraints</strong>: <code>{`<T extends U>`}</code>{" "}restricts what T can be, so you can use properties of U in the body.</li>
            <li><strong>Defaults</strong>: <code>{`<T = unknown>`}</code>,{" "}a fallback when the caller doesn&apos;t specify.</li>
            <li><strong>Inference &gt; explicit</strong>: pass <code>{`<T>`}</code>{" "}explicitly only when TS can&apos;t pin it from arguments.</li>
            <li>In <code>.tsx</code>, an arrow-function generic needs a trailing comma: <code>{`<T,>`}</code>, or a constraint: <code>{`<T extends unknown>`}</code>, to disambiguate from JSX.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Utility types */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Utility types &amp; type-level transformations</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Derive, don&apos;t duplicate</strong>: build types from existing ones so they can&apos;t drift. <code>Pick</code>/<code>Omit</code>{" "}carve a subset of fields; <code>Partial</code>{" "}makes every field optional (great for updaters); <code>Required</code>/<code>Readonly</code>{" "}are the inverses.</li>
            <li><strong><code>Record&lt;K, V&gt;</code></strong>{" "}builds a lookup keyed by a union, e.g. <code>{`Record<Status, Config>`}</code>{" "}forces you to handle every status.</li>
            <li><strong>Function utilities</strong>: <code>ReturnType&lt;F&gt;</code>{" "}and <code>Parameters&lt;F&gt;</code>{" "}read a function&apos;s types; <code>Awaited&lt;T&gt;</code>{" "}unwraps a Promise; <code>NonNullable&lt;T&gt;</code>{" "}strips <code>null/undefined</code>.</li>
            <li><strong><code>keyof</code></strong>{" "}+ indexed access (<code>T[K]</code>) read the keys and member types of a type; <code>typeof value</code>{" "}derives a type from a runtime value.</li>
            <li><strong>Mapped types</strong>: <code>{`{ [K in keyof T]: ... }`}</code>{" "}is how <code>Partial</code>/<code>Readonly</code>{" "}are built; <code>?</code>/<code>readonly</code>{" "}add modifiers, <code>-?</code>/<code>-readonly</code>{" "}remove them.</li>
            <li><strong>Conditional types</strong>: <code>{`T extends U ? X : Y`}</code>, and <code>infer</code>{" "}captures a type inside the branch (that&apos;s how <code>ReturnType</code>{" "}extracts the return). <strong>Template literal types</strong>{" "}build string-literal types like <code>{`\`on\${Capitalize<K>}\``}</code>{" "}for typed handler names.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — React typing */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Typing React</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Props</strong>: declare a <code>type</code>{" "}or <code>interface</code>; let TS infer the return. Skip <code>React.FC</code>,{" "}it adds <code>children</code>{" "}implicitly and breaks generic components.</li>
            <li><strong>Children</strong>: <code>React.ReactNode</code>{" "}covers strings, numbers, fragments, arrays, and nullish values. Never use <code>JSX.Element</code>,{" "}it rejects strings and fragments.</li>
            <li><strong>Events</strong>: inline handlers, TS infers the event type from the JSX. Prop handlers, use <code>React.FooEventHandler&lt;ElementType&gt;</code>.</li>
            <li><strong>Refs</strong>: <code>useRef&lt;T&gt;(null)</code>; <code>ref.current</code>{" "}is <code>T | null</code>,{" "}always guard or use optional chaining.</li>
            <li><strong>forwardRef</strong>{" "}order is <code>&lt;ElementType, PropsType&gt;</code>. Always set <code>displayName</code>.</li>
            <li><strong>Polymorphic <code>as</code></strong>: <code>{`<E extends ElementType>`}</code>{" "}+ <code>{`ComponentPropsWithoutRef<E>`}</code>. TS makes wrong-element props (e.g. <code>href</code>{" "}on a button) a compile error.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">If asked &quot;what&apos;s structural typing?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;TypeScript compares types by shape, not by name. Any value whose properties match the target type is assignable, regardless of where it was declared. That&apos;s why <code>{`{ name: string }`}</code>{" "}and a class <code>User</code>{" "}with a <code>name</code>{" "}field are interchangeable.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">If asked &quot;<code>any</code>{" "}vs <code>unknown</code>&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;<code>any</code>{" "}turns the checker off, anything assigns to anything. <code>unknown</code>{" "}lets you accept any value but forces you to narrow before doing anything with it. Use <code>unknown</code>{" "}at trust boundaries, <code>JSON.parse</code>, network responses, and narrow with guards before touching the value.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">If asked &quot;why discriminated unions over booleans?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Booleans like <code>{`{ loading; error; data? }`}</code>{" "}allow illegal combinations, <code>loading: true, error: true</code>. A discriminated union lists exactly the legal variants, so unreachable states are unrepresentable. Plus, switching on the discriminant narrows the type, so you can&apos;t access <code>data</code>{" "}in the error branch.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-200">If asked &quot;how do you forward a ref?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Wrap with <code>forwardRef&lt;ElementType, PropsType&gt;</code>, element type first, props second. The render function receives <code>(props, ref)</code>, and you attach <code>ref</code>{" "}to the inner DOM node. Set <code>displayName</code>{" "}so DevTools shows the component name instead of &apos;ForwardRef&apos;.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — Up next */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">Up next</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Phase 3, React Mental Model.</strong>{" "}You can type a component now. Next you need to be able to explain, at a whiteboard, in 60 seconds, what React is actually doing when it renders. Reconciliation, the rendering rules, state-as-snapshot, effects, and composition patterns. The internals every interviewer asks about.
          </p>
          <p className="mt-3 text-sm">
            Continue with{" "}
            <Link href="/courses/frontend/modules/how-react-works" className="font-semibold text-cyan-600 hover:underline">
              How React actually works →
            </Link>
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
