import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "utility-types";

const CHECKPOINTS = [
  { id: "cp-utility-basics", title: "Built-in utility types & type operators" },
  { id: "cp-mapped-conditional", title: "Mapped, conditional & template literal types" },
  { id: "cp-react-derivation", title: "Deriving types in React" },
];

export default function UtilityTypesModule() {
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
          Utility types &amp; type-level transformations
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You already have a <code>User</code> type. Now you need a &quot;User but every field optional&quot; type, and a &quot;just the form fields&quot; type, and a &quot;config keyed by status&quot; type. The junior move is to hand-write all three. The senior move is to <em>derive</em> them from the one source of truth, so when <code>User</code> changes, they all change with it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. THE BIG IDEA ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The one idea behind all of this: types are values you can transform</h2>
        <p className="mb-4">
          In the last module you saw generics as <em>type-level function parameters</em>. This module is the natural next step: if <code>{`<T>`}</code> is a parameter, then a type that takes <code>T</code> and produces a <em>new</em> type is a <strong>type-level function</strong>. The built-in utility types, <code>Partial</code>, <code>Pick</code>, <code>Omit</code>, and friends, are exactly that: functions that run in the type system and hand you back a transformed type.
        </p>
        <p className="mb-4">
          The payoff for a React engineer is &quot;single source of truth.&quot; You define one canonical shape (often the API response), and every related type, form values, partial updaters, prop subsets, is <em>derived</em> from it. Change the source, and every derived type updates automatically. Hand-maintain duplicates instead, and they silently drift out of sync until something breaks at runtime.
        </p>
        <Callout variant="insight" title="The mental model">
          A utility type is a function from a type to a type. <code>{`Partial<User>`}</code> reads as &quot;run <code>Partial</code> on <code>User</code> and give me the result&quot;, exactly like calling a function, but the compiler runs it, not the runtime.
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE TYPE OPERATORS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The three operators everything is built on</h2>
        <p className="mb-4">
          Before the named utilities, three small operators do most of the work. Learn these and the rest stop looking like magic.
        </p>
        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>keyof</code>, the union of an object&apos;s keys</h3>
        <pre><code>{`type User = { id: number; name: string; email: string };

type UserKey = keyof User;
// "id" | "name" | "email"  — a union of string literals`}</code></pre>
        <h3 className="mt-6 mb-2 text-xl font-semibold">Indexed access <code>T[K]</code>, look up a property&apos;s type</h3>
        <pre><code>{`type Name = User["name"];          // string
type IdOrName = User["id" | "name"]; // number | string
type AllValues = User[keyof User];   // number | string`}</code></pre>
        <p className="mb-4">
          Indexed access is just &quot;index into the type the way you&apos;d index into the value.&quot; <code>{`User["name"]`}</code> is the type of the <code>name</code> property, the same way <code>user.name</code> is its value.
        </p>
        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>typeof</code>, derive a type from a value</h3>
        <pre><code>{`const defaultUser = { id: 0, name: "", email: "" };

type User = typeof defaultUser;
// { id: number; name: string; email: string }

// Common pairing: const + keyof typeof for a lookup's keys
const ROLES = { admin: 0, editor: 1, viewer: 2 } as const;
type Role = keyof typeof ROLES;   // "admin" | "editor" | "viewer"`}</code></pre>
        <Callout variant="info" title="typeof goes value → type, not the reverse">
          The <code>typeof</code> here is the <em>type-level</em> operator (in a type position), not the runtime <code>typeof x === &quot;string&quot;</code> you know from JS. It reads the type the compiler already inferred for a value, so you can stop hand-writing a type you&apos;ve effectively already declared.
        </Callout>
      </section>

      {/* ───────────────────────── 3. THE BUILT-IN UTILITIES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The built-in utility types, and when to reach for each</h2>
        <p className="mb-4">
          These ship with TypeScript. The skill isn&apos;t memorizing them, it&apos;s recognizing the <em>shape of the problem</em> that each one solves.
        </p>
        <pre><code>{`type User = { id: number; name: string; email: string };

// Partial<T> — every field optional. The classic "patch / update" shape.
type UserPatch = Partial<User>;
// { id?: number; name?: string; email?: string }

// Required<T> — the inverse: strip every "?" off.
type FullUser = Required<Partial<User>>; // back to all-required

// Readonly<T> — every field readonly (compile-time immutability).
type FrozenUser = Readonly<User>;

// Pick<T, K> — keep only the listed keys.
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit<T, K> — keep everything EXCEPT the listed keys.
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string }

// Record<K, V> — build an object type from a key union + value type.
type RolePermissions = Record<"admin" | "viewer", string[]>;
// { admin: string[]; viewer: string[] }`}</code></pre>
        <p className="mb-4">
          The function-derivation trio comes up constantly once you start typing callbacks and async code:
        </p>
        <pre><code>{`function createUser(name: string, age: number) {
  return { id: 1, name, age };
}

// ReturnType<F> — the type a function returns.
type NewUser = ReturnType<typeof createUser>;
// { id: number; name: string; age: number }

// Parameters<F> — the tuple of a function's parameter types.
type CreateArgs = Parameters<typeof createUser>;
// [name: string, age: number]

// Awaited<T> — unwrap a Promise (recursively).
type Resolved = Awaited<Promise<User>>; // User

// NonNullable<T> — strip null and undefined out of a union.
type Defined = NonNullable<string | null | undefined>; // string`}</code></pre>
        <Callout variant="info" title="Pick vs Omit, pick the shorter intent">
          <code>Pick</code> and <code>Omit</code> are mirror images. Reach for <code>Pick</code> when you want a <em>small</em> subset of a big type (list two keys, not twenty). Reach for <code>Omit</code> when you want <em>almost all</em> of it minus a few (&quot;everything but the server-generated <code>id</code>&quot;). Choosing the one with the shorter key list keeps the intent obvious and survives the source type growing.
        </Callout>
        <Callout variant="warn" title="Omit doesn't check that the key exists">
          A subtle trap: <code>{`Pick<T, K>`}</code> constrains <code>K extends keyof T</code>, so a typo in a picked key is a compile error. But classic <code>{`Omit<T, K>`}</code> accepts <em>any</em> string key, so <code>{`Omit<User, "emial">`}</code> (typo) silently does nothing and you still get the <code>email</code> field. If a derived type looks wrong, check your <code>Omit</code> keys first.
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-utility-basics" moduleSlug={MODULE_SLUG} title="Built-in utility types & type operators">
        <Quiz
          kind="Quick check"
          question={'Given `type User = { id: number; name: string; email: string }`, what is `keyof User`?'}
          options={[
            { label: "string", explanation: "Too wide. keyof doesn't collapse to `string`, it keeps the specific literal keys, which is what makes Pick/Omit/Record type-safe." },
            { label: '"id" | "name" | "email"', correct: true, explanation: "Right, keyof produces a union of the object's literal keys, and that union is what you feed to Pick, Omit, and indexed access." },
            { label: "number | string | string", explanation: "That's `User[keyof User]` (the union of the value types), not `keyof User` (the union of the keys)." },
            { label: "{ id; name; email }", explanation: "keyof returns a union of key names, not an object. You're describing the original shape, not its keys." },
          ]}
        />
        <Quiz
          kind="Pick the tool"
          question={'You need a type that is your `User` shape with every field made optional, for a PATCH-style update where the caller sends only the fields they changed. Which utility?'}
          options={[
            { label: "Required<User>", explanation: "Backwards, Required strips the `?` off, making fields mandatory. You want the opposite." },
            { label: "Partial<User>", correct: true, explanation: "Right, Partial<T> makes every field optional, which is exactly the shape of a partial update / patch payload." },
            { label: "Omit<User, keyof User>", explanation: "That removes every key, leaving an empty object `{}`, not an all-optional User." },
            { label: "Readonly<User>", explanation: "Readonly makes fields immutable, not optional. The fields are still all required." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. MAPPED TYPES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Mapped types, how <code>Partial</code> and <code>Readonly</code> are actually built</h2>
        <p className="mb-4">
          Here&apos;s the satisfying part: the built-in utilities aren&apos;t compiler primitives. They&apos;re written in TypeScript, using a <strong>mapped type</strong>, a loop over an object&apos;s keys. The syntax is <code>{`{ [K in keyof T]: ... }`}</code>, read as &quot;for each key <code>K</code> in <code>T</code>, produce a property.&quot; It&apos;s a <code>for…of</code> over keys, at the type level.
        </p>
        <pre><code>{`// This IS the standard-library definition (paraphrased):
type MyPartial<T> = {
  [K in keyof T]?: T[K];   // for each key K, make it optional, keep its value type
};

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];   // for each key, mark it readonly
};`}</code></pre>
        <p className="mb-4">
          Notice the pieces working together: <code>{`K in keyof T`}</code> is the loop, and <code>T[K]</code> (indexed access) pulls each property&apos;s value type back out. The <code>?</code> and <code>readonly</code> are <strong>modifiers</strong> you add to every produced property.
        </p>
        <p className="mb-4">
          You can also <em>remove</em> modifiers with the <code>-</code> prefix, that&apos;s how <code>Required</code> works (it strips <code>?</code>), and how you&apos;d write a deep-unfreeze:
        </p>
        <pre><code>{`type MyRequired<T> = {
  [K in keyof T]-?: T[K];          // -? removes optionality
};

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];  // -readonly removes immutability
};`}</code></pre>
        <Callout variant="insight" title="Why this matters even if you never write one">
          You may rarely author a mapped type by hand, but knowing <code>Partial</code> is &quot;just&quot; <code>{`{ [K in keyof T]?: T[K] }`}</code> demystifies the whole family. When an error message mentions a mapped type, or a library hands you <code>{`{ [K in keyof T]: ... }`}</code>, you read it as a loop instead of freezing up.
        </Callout>
      </section>

      {/* ───────────────────────── 5. CONDITIONAL TYPES + infer ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Conditional types and <code>infer</code>, the type-level <code>if</code></h2>
        <p className="mb-4">
          A <strong>conditional type</strong> is an <code>if/else</code> in the type system: <code>{`T extends U ? X : Y`}</code> reads as &quot;if <code>T</code> is assignable to <code>U</code>, the result is <code>X</code>, otherwise <code>Y</code>.&quot; That&apos;s how <code>NonNullable</code> is built:
        </p>
        <pre><code>{`type MyNonNullable<T> = T extends null | undefined ? never : T;
// For each member of a union, drop it if it's null/undefined, else keep it.
// MyNonNullable<string | null> -> string`}</code></pre>
        <p className="mb-4">
          The real power tool is <code>infer</code>: inside the <code>extends</code> clause you can <em>capture</em> a piece of the type into a fresh variable and use it in the <code>true</code> branch. This is how <code>ReturnType</code>, <code>Parameters</code>, and <code>Awaited</code> are implemented, they pattern-match a shape and pull a slice out of it.
        </p>
        <pre><code>{`// This is essentially the standard-library ReturnType:
type MyReturnType<F> =
  F extends (...args: any[]) => infer R ? R : never;
//                              ^^^^^^^ capture the return type into R

type MyParameters<F> =
  F extends (...args: infer P) => any ? P : never;
//                          ^^^^^^^ capture the parameter tuple into P

// And Awaited, roughly (recursive — it unwraps nested promises):
type MyAwaited<T> =
  T extends Promise<infer V> ? MyAwaited<V> : T;`}</code></pre>
        <p className="mb-4">
          Read <code>infer R</code> as &quot;match this function type, and bind whatever sits in the return position to the name <code>R</code>.&quot; If the match succeeds, you get <code>R</code>; if <code>F</code> isn&apos;t a function at all, you fall through to <code>never</code>.
        </p>
        <Callout variant="warn" title="infer only lives inside a conditional's extends clause">
          <code>infer</code> is not free-standing, it only has meaning inside the <code>extends</code> position of a conditional type. You&apos;re saying &quot;to even attempt this match, here&apos;s a hole I want filled.&quot; Outside a conditional, <code>infer</code> is a syntax error.
        </Callout>
      </section>

      {/* ───────────────────────── 6. TEMPLATE LITERAL TYPES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Template literal types, typed string transformations</h2>
        <p className="mb-4">
          Types can be built from string templates the same way values can. Combined with the built-in casing helpers (<code>Capitalize</code>, <code>Uppercase</code>, <code>Lowercase</code>, <code>Uncapitalize</code>) and a mapped type, you can generate one set of keys from another. The textbook React use case is deriving event-handler prop names from event names:
        </p>
        <pre><code>{`type Events = "click" | "focus" | "change";

// "on" + Capitalized event name, for each event:
type HandlerName = \`on\${Capitalize<Events>}\`;
// "onClick" | "onFocus" | "onChange"

// Map an events object into a props object of handlers:
type HandlerProps<E extends string> = {
  [K in E as \`on\${Capitalize<K>}\`]: (e: Event) => void;
};

type ButtonHandlers = HandlerProps<"click" | "hover">;
// { onClick: (e: Event) => void; onHover: (e: Event) => void }`}</code></pre>
        <p className="mb-4">
          The <code>as</code> inside the mapped type is a <strong>key remapping</strong>, &quot;for each key <code>K</code>, but rename the produced key to this template.&quot; That&apos;s how you turn <code>&quot;click&quot;</code> into the prop <code>onClick</code> without writing them out by hand.
        </p>
        <Callout variant="insight" title="Why derive prop names instead of typing them">
          Hand-listing <code>onClick</code>, <code>onFocus</code>, <code>onChange</code> works until someone adds a new event and forgets the matching handler prop. Derive the handler names from the event union and the two can never drift, add an event, the handler prop appears for free, and a missing handler becomes a compile error.
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-mapped-conditional" moduleSlug={MODULE_SLUG} title="Mapped, conditional & template literal types">
        <Quiz
          kind="How it's built"
          question={'`type MyPartial<T> = { [K in keyof T]?: T[K] }`. What does the `[K in keyof T]` part do?'}
          options={[
            { label: "It loops over each key of T, producing one property per key, a mapped type", correct: true, explanation: "Right, `K in keyof T` iterates the keys of T like a for…of at the type level; `T[K]` (indexed access) pulls each key's value type, and `?` makes each optional." },
            { label: "It picks a single key K out of T", explanation: "That's indexed access (`T[K]`) on its own. The `[K in keyof T]` form is a loop over ALL keys, not a single lookup." },
            { label: "It's a runtime loop that copies the object's properties", explanation: "Nothing here runs at runtime, type annotations are fully erased. This is a compile-time transformation of a type." },
            { label: "It marks T itself as optional", explanation: "The `?` applies per-property inside the loop, not to T as a whole. Each produced field becomes optional." },
          ]}
        />
        <Quiz
          kind="Conditional + infer"
          question={'How does `type ReturnType<F> = F extends (...args: any[]) => infer R ? R : never` extract a function\'s return type?'}
          options={[
            { label: "It calls the function and inspects the returned value at runtime", explanation: "No runtime call happens, `infer` works purely in the type system. The function is never invoked." },
            { label: "`infer R` captures whatever type sits in the return position when F matches the function shape, then the true branch yields R", correct: true, explanation: "Exactly, the conditional pattern-matches F against a function type, binds the return-position type to R via `infer`, and returns R on a match (or `never` if F isn't a function)." },
            { label: "It uses keyof to read the return key off the function type", explanation: "Functions don't have a `return` key to read with keyof. Extraction happens via `infer` in the conditional's extends clause." },
            { label: "`infer` works anywhere; here it just declares a generic R", explanation: "`infer` is only valid inside a conditional type's `extends` clause, it isn't a free-standing type-parameter declaration." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. REACT PAYOFF ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The React payoff, derive types from your data</h2>
        <p className="mb-4">
          Now the part that earns its keep daily. You almost always have one canonical type, usually the API/entity shape, and you need several related types around it. Derive them; don&apos;t duplicate them.
        </p>
        <h3 className="mt-6 mb-2 text-xl font-semibold">1, Build a form-values type from an entity with <code>Pick</code> / <code>Omit</code></h3>
        <pre><code>{`type User = {
  id: number;          // server-generated — not in the form
  name: string;
  email: string;
  createdAt: string;   // server-generated — not in the form
};

// The form only edits name + email. Two equivalent ways:
type FormValues = Pick<User, "name" | "email">;
// or, "everything the user doesn't own":
type FormValues2 = Omit<User, "id" | "createdAt">;

// Add a field to User later, and Omit-based FormValues picks it up
// automatically — the form type can't silently fall behind the entity.`}</code></pre>
        <h3 className="mt-6 mb-2 text-xl font-semibold">2, A <code>Record</code> lookup table keyed by a status union</h3>
        <pre><code>{`type Status = "idle" | "loading" | "success" | "error";

type StatusConfig = { label: string; color: string };

// Record<Status, …> FORCES an entry for every status — miss one
// and it's a compile error, so the map can never go out of sync
// with the union.
const STATUS_UI: Record<Status, StatusConfig> = {
  idle:    { label: "Ready",   color: "slate" },
  loading: { label: "Loading", color: "blue"  },
  success: { label: "Done",    color: "green" },
  error:   { label: "Failed",  color: "red"   },
};

// Add "retrying" to Status and this object won't compile until you
// add its entry. That's exhaustiveness for free.`}</code></pre>
        <h3 className="mt-6 mb-2 text-xl font-semibold">3, Type a <code>setState</code>-style partial updater with <code>Partial</code></h3>
        <pre><code>{`function useForm<T>(initial: T) {
  const [values, setValues] = useState(initial);

  // Accept ANY subset of T's fields — that's Partial<T>.
  function update(patch: Partial<T>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  return { values, update };
}

const { update } = useForm<FormValues>({ name: "", email: "" });
update({ email: "a@b.com" });   // ok — partial is allowed
update({ emial: "typo" });      // ❌ "emial" is not a key of FormValues`}</code></pre>
        <Callout variant="insight" title="The senior instinct: one source of truth">
          Every type above traces back to a single <code>User</code> (or <code>Status</code>) declaration. When the API adds a field or a new status, the derived types either update automatically or fail to compile until you handle the new case. Hand-maintained duplicate interfaces give you neither, they drift quietly, and the bug surfaces in production, not in the editor.
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-react-derivation" moduleSlug={MODULE_SLUG} title="Deriving types in React">
        <Quiz
          kind="Scenario"
          question={'Your `update` function should accept any subset of a form\'s fields (one field, several, or all). How do you type its argument from `type FormValues = { name: string; email: string }`?'}
          options={[
            { label: "patch: FormValues", explanation: "That demands every field on every call, you couldn't update just `email`. You need an all-optional version." },
            { label: "patch: Partial<FormValues>", correct: true, explanation: "Right, Partial<FormValues> makes every field optional, so the caller can pass any subset. This is the canonical setState-style updater signature." },
            { label: "patch: Pick<FormValues, keyof FormValues>", explanation: "Pick with all keys just reproduces FormValues unchanged, fields stay required. You want them optional." },
            { label: "patch: Record<string, unknown>", explanation: "That throws away all the field-name and value-type safety. A typo'd key or wrong value type would slip through." },
          ]}
        />
        <Quiz
          kind="Why derive"
          question={'Why prefer `type FormValues = Omit<User, "id" | "createdAt">` over hand-writing a separate `FormValues` interface?'}
          options={[
            { label: "It's shorter to type, but otherwise identical in behavior", explanation: "Brevity isn't the real win. The point is the live link to User, a hand-written duplicate has no such link." },
            { label: "Deriving keeps FormValues linked to User: add or change a User field and FormValues updates (or fails to compile) automatically, a duplicate would silently drift", correct: true, explanation: "Exactly, one source of truth. The derived type can't fall out of sync with the entity, whereas a hand-maintained duplicate drifts until something breaks at runtime." },
            { label: "Omit is faster at runtime than an interface", explanation: "Neither exists at runtime, both are fully erased. There's no runtime cost or speed difference." },
            { label: "Interfaces can't describe object shapes, so you must use Omit", explanation: "Interfaces describe object shapes perfectly well. The reason to derive is the maintenance link to the source type, not a limitation of interfaces." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Utility types are type-level functions.</strong> <code>{`Partial<T>`}</code>, <code>{`Pick<T,K>`}</code>, <code>{`Omit<T,K>`}</code>, <code>{`Record<K,V>`}</code>, <code>{`ReturnType<F>`}</code>, <code>{`Awaited<T>`}</code>, <code>{`NonNullable<T>`}</code> all take a type in and hand a new type back.</li>
          <li><strong>Three operators underpin them:</strong> <code>keyof</code> (union of keys), indexed access <code>T[K]</code> (a property&apos;s type), and <code>typeof</code> (derive a type from a value).</li>
          <li><strong>Mapped types</strong>, <code>{`{ [K in keyof T]: … }`}</code>, loop over keys; <code>?</code>/<code>readonly</code> add modifiers, <code>-?</code>/<code>-readonly</code> remove them. That&apos;s how <code>Partial</code>, <code>Readonly</code>, and <code>Required</code> are built.</li>
          <li><strong>Conditional types</strong>, <code>{`T extends U ? X : Y`}</code>, are type-level <code>if</code>; <code>infer</code> captures a slice of the matched type (that&apos;s how <code>ReturnType</code> works).</li>
          <li><strong>Template literal types</strong>, <code>{`\`on\${Capitalize<K>}\``}</code>, generate string-literal types, great for deriving handler prop names from event names.</li>
          <li><strong>In React:</strong> derive a <code>FormValues</code> from your entity with <code>Pick</code>/<code>Omit</code>, force exhaustive lookups with <code>{`Record<Status, Config>`}</code>, and type partial updaters with <code>{`Partial<T>`}</code>. Deriving beats duplicating, one source of truth, no drift.</li>
        </ul>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project</h2>
        <p className="mb-4">
          Start from one canonical <code>User</code> type and derive everything else from it, then prove the derivations are real by trying to break them.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Derive a <code>FormValues</code> from <code>User</code> with both <code>Pick</code> and <code>Omit</code>.</strong> Define <code>{`type User = { id: number; name: string; email: string; createdAt: string }`}</code>. Write <code>FormValues</code> two ways: <code>{`Pick<User, "name" | "email">`}</code> and <code>{`Omit<User, "id" | "createdAt">`}</code>. Add a new field to <code>User</code> and observe which version picks it up automatically, that tells you when to reach for each.
          </li>
          <li>
            <strong>Build a <code>{`Record<Status, …>`}</code> lookup table.</strong> Define <code>{`type Status = "idle" | "loading" | "success" | "error"`}</code> and a <code>{`Record<Status, { label: string; color: string }>`}</code> config object. Add a fifth status to the union and confirm the object refuses to compile until you add its entry.
          </li>
          <li>
            <strong>Implement your own <code>{`MyPartial<T>`}</code>.</strong> Write the mapped type <code>{`{ [K in keyof T]?: T[K] }`}</code> from scratch, apply it to <code>User</code>, and hover to confirm every field came out optional. Then write <code>{`MyRequired<T>`}</code> using the <code>-?</code> remover to undo it.
          </li>
          <li>
            <strong>Implement your own <code>{`MyReturnType<F>`}</code> with <code>infer</code>.</strong> Write <code>{`F extends (...args: any[]) => infer R ? R : never`}</code>, point it at a real function via <code>{`MyReturnType<typeof createUser>`}</code>, and confirm it matches the function&apos;s actual return shape.
          </li>
          <li>
            <strong>Stretch, derive handler prop names.</strong> From <code>{`type Events = "click" | "change"`}</code>, build <code>{`type HandlerProps = { [K in Events as \`on\${Capitalize<K>}\`]: (e: Event) => void }`}</code> and confirm the keys come out as <code>onClick</code> and <code>onChange</code>.
          </li>
        </ol>
        <p className="mb-4">
          You should be able to explain, out loud, why <code>{`Partial<User>`}</code> is just a mapped type with a <code>?</code> modifier, and why deriving <code>FormValues</code> from <code>User</code> beats hand-writing a second interface.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
