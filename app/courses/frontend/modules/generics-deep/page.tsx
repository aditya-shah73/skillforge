import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "generics-deep";

const CHECKPOINTS = [
  { id: "cp-generics-mental-model", title: "Generics — the mental model" },
  { id: "cp-constraints-inference", title: "Constraints, defaults, and inference" },
  { id: "cp-react-generics", title: "Generic hooks and components in React" },
];

export default function GenericsDeepModule() {
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
          Generics — the real mental model
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Generics aren&apos;t a way to type &quot;anything.&quot; They&apos;re a way to type <em>a relationship between inputs and outputs</em>{" "}— and once you see them as variables-for-types, the syntax stops looking like noise.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          A function takes a value and returns a value. A generic function takes a <em>type</em>{" "}and returns a value with that type.
        </p>
        <p>
          Think of <code>{`<T>`}</code>{" "}as a parameter the <em>caller</em>{" "}fills in, not the function author. The author says <em>&quot;whatever T you give me, I&apos;ll return the same T.&quot;</em>{" "}The caller (often the compiler itself, via inference) fills in <code>T = string</code>, and the function&apos;s signature becomes <code>{`(x: string) => string`}</code>{" "}for that call site.
        </p>
        <Callout variant="insight" title="The one-line definition">
          A generic is a <em>type-level function parameter</em>. <code>{`function id<T>(x: T): T`}</code>{" "}is read as &quot;for any T, take a T and return a T.&quot;
        </Callout>
      </section>

      <section>
        <h2>The simplest generic — <code>id</code></h2>
        <pre><code>{`function id<T>(x: T): T {
  return x;
}

const a = id("hi");    // a: string  (T was inferred as string)
const b = id(42);      // b: number  (T was inferred as number)
const c = id<boolean>(true); // explicit; rarely needed`}</code></pre>
        <p>
          The point of <code>id</code>{" "}isn&apos;t the function — it&apos;s that the <em>relationship</em>{" "}is captured. <code>a</code>{" "}is <code>string</code>, not <code>unknown</code>{" "}or <code>any</code>. The compiler tied input to output.
        </p>
        <p>
          Compare to the non-generic version:
        </p>
        <pre><code>{`function id(x: unknown): unknown { return x; }
const a = id("hi");    // a: unknown — useless`}</code></pre>
        <p>
          That&apos;s why generics exist. They preserve information that <code>any</code>{" "}or <code>unknown</code>{" "}would throw away.
        </p>
      </section>

      <Checkpoint id="cp-generics-mental-model" moduleSlug={MODULE_SLUG} title="Generics — the mental model">
        <Quiz
          kind="Quick check"
          question={"What's the inferred type of `result` here?\n\n```ts\nfunction first<T>(arr: T[]): T | undefined { return arr[0]; }\nconst result = first([1, 2, 3]);\n```"}
          options={[
            { label: "any | undefined", explanation: "Wrong — TS doesn't fall back to `any` here. It infers from the array literal." },
            { label: "number[] | undefined", explanation: "Wrong — the function returns one element, not the array." },
            { label: "number | undefined", correct: true, explanation: "Right — `T` is inferred as `number` from the array, so the return is `number | undefined`." },
            { label: "unknown | undefined", explanation: "Wrong — generics keep the input information. `T` resolves to a concrete type at the call site." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Constraints — limiting what T can be</h2>
        <p>
          Unconstrained <code>T</code>{" "}means &quot;literally anything.&quot; If you try to do anything to <code>x</code>{" "}beyond return it, TS complains — because <em>some</em>{" "}T might not support it. The fix is a <strong>constraint</strong>: <code>{`<T extends U>`}</code>{" "}means &quot;T must be assignable to U.&quot;
        </p>
        <pre><code>{`function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}

getLength("hello");     // ok — string has length
getLength([1, 2, 3]);   // ok — arrays have length
getLength(42);          // ❌ number has no length`}</code></pre>
        <p>
          The constraint doesn&apos;t change what <code>T</code>{" "}is — it just narrows what <code>T</code>{" "}can be. <code>getLength(&quot;hi&quot;)</code>{" "}still returns the function with <code>T = string</code>; you just can&apos;t call it with a number.
        </p>
      </section>

      <section>
        <h2>Default type parameters</h2>
        <p>
          Generics can have defaults — exactly like default function parameters, but at the type level.
        </p>
        <pre><code>{`type State<T = unknown> =
  | { status: "loading" }
  | { status: "ready"; data: T };

const a: State = { status: "loading" };       // T defaults to unknown
const b: State<User> = { status: "ready", data: u };`}</code></pre>
        <p>
          You see this all over React&apos;s types — e.g. <code>{`useState<T = undefined>`}</code>, which is why <code>useState()</code>{" "}with no argument gives you <code>undefined</code>{" "}as the initial type.
        </p>
        <Callout variant="info" title="Inference > explicit type arguments">
          Most of the time you don&apos;t pass <code>{`<T>`}</code>{" "}explicitly — TS infers it from the actual argument. The explicit form (<code>{`id<string>("hi")`}</code>) is for the rare case where inference can&apos;t pin a type.
        </Callout>
      </section>

      <Checkpoint id="cp-constraints-inference" moduleSlug={MODULE_SLUG} title="Constraints, defaults, and inference">
        <Quiz
          kind="Scenario"
          question="You write `function pick<T, K extends keyof T>(obj: T, key: K): T[K]`. Why is the `K extends keyof T` constraint required?"
          options={[
            { label: "It's optional — the function works without it.", explanation: "Wrong — without the constraint, `K` could be any type, and `T[K]` would be a type error." },
            { label: "It tells TS that K must be a valid key of T, so `T[K]` (indexed access) is legal.", correct: true, explanation: "Right — the constraint is what makes the indexed-access type `T[K]` meaningful. Without it, `K` could be anything." },
            { label: "It's a runtime check.", explanation: "Wrong — all type annotations are erased at runtime." },
            { label: "It only affects autocomplete.", explanation: "Wrong — autocomplete is a side benefit; the real effect is making the body type-check." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Generics in React — props, hooks, and the <code>{`<T,>`}</code>{" "}trick</h2>
        <p>
          React makes heavy use of generics. The two patterns you&apos;ll write yourself:
        </p>
        <h3>1 — A generic hook</h3>
        <pre><code>{`function useFetch<T>(url: string): {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json() as Promise<T>)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage:
const { data } = useFetch<User>("/api/me");
// data: User | undefined`}</code></pre>
        <h3>2 — A generic component</h3>
        <pre><code>{`type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((it, i) => <li key={i}>{renderItem(it)}</li>)}</ul>;
}

// Usage — T is inferred from items:
<List items={users} renderItem={u => u.name} />`}</code></pre>
        <Callout variant="warn" title="The TSX gotcha — &lt;T,&gt; with the trailing comma">
          In <code>.tsx</code>{" "}files, <code>{`<T>`}</code>{" "}at the start of an arrow function is ambiguous with JSX. The compiler tries to parse it as a tag. Fix: add a trailing comma — <code>{`<T,>`}</code>{" "}— or use <code>{`<T extends unknown>`}</code>. Both disambiguate it as a generic.
        </Callout>
        <pre><code>{`// ❌ ambiguous in .tsx
const id = <T>(x: T) => x;

// ✅ trailing comma fixes it
const id = <T,>(x: T) => x;

// ✅ or use a constraint
const id = <T extends unknown>(x: T) => x;`}</code></pre>
      </section>

      <section>
        <h2><code>PropsWithChildren</code>{" "}— the React helper you&apos;ll see everywhere</h2>
        <p>
          A common annoyance: typing the <code>children</code>{" "}prop yourself. React ships a generic that does it for you:
        </p>
        <pre><code>{`import { type PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{ title: string }>;
// equivalent to: { title: string; children?: React.ReactNode }

function Card({ title, children }: CardProps) {
  return <div><h2>{title}</h2>{children}</div>;
}`}</code></pre>
        <p>
          <code>PropsWithChildren&lt;P&gt;</code>{" "}is defined roughly as <code>{`P & { children?: React.ReactNode }`}</code>. It&apos;s a generic that takes your prop shape and intersects it with <code>children</code>.
        </p>
      </section>

      <Checkpoint id="cp-react-generics" moduleSlug={MODULE_SLUG} title="Generic hooks and components in React">
        <Quiz
          kind="Scenario"
          question="In a `.tsx` file, you write `const wrap = <T>(x: T) => [x];` and TS errors with `Unterminated JSX`. What's the fix?"
          options={[
            { label: "Rename the file to `.ts`.", explanation: "Half-true — but you can't, you're writing JSX elsewhere in the file." },
            { label: "Use a trailing comma: `<T,>`, or add a constraint like `<T extends unknown>`.", correct: true, explanation: "Right — both forms disambiguate the generic from a JSX opening tag. The trailing comma is the most idiomatic." },
            { label: "Use `any` instead of a generic.", explanation: "Wrong — you'd lose all the type information generics exist to preserve." },
            { label: "Switch to a `function` declaration with the generic before the parens.", explanation: "That works as a workaround, but the question asks for the fix in arrow form. The trailing comma is the standard fix." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question={"What's the inferred type of `data` in `const { data } = useFetch<User>('/api/me')`, given the `useFetch<T>` hook above?"}
          options={[
            { label: "User", explanation: "Close but missing the initial state — `data` starts as undefined." },
            { label: "User | undefined", correct: true, explanation: "Right — `useState<T>()` with no initial value produces `T | undefined`, and that flows out as the return type." },
            { label: "unknown", explanation: "Wrong — the explicit `<User>` argument pins `T`, so `data` is `User | undefined`." },
            { label: "any", explanation: "Wrong — generics specifically avoid `any`." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>A <strong>generic</strong>{" "}is a type-level function parameter — <code>{`<T>`}</code>{" "}lets the caller (or inference) pick a type, so the function preserves the input/output relationship.</li>
          <li>Without generics you&apos;d fall back to <code>any</code>{" "}or <code>unknown</code>, throwing away type information.</li>
          <li><strong>Constraints</strong>{" "}— <code>{`<T extends U>`}</code>{" "}— restrict what T can be, so you can use properties of U in the body.</li>
          <li><strong>Defaults</strong>{" "}— <code>{`<T = unknown>`}</code>{" "}— give a fallback when the caller doesn&apos;t specify.</li>
          <li>In <strong>React</strong>{" "}you&apos;ll use generics for hooks (<code>useFetch&lt;T&gt;</code>) and list components (<code>List&lt;T&gt;</code>). In <code>.tsx</code>, an arrow function generic needs the <code>{`<T,>`}</code>{" "}trailing comma to disambiguate from JSX.</li>
          <li><strong>Prefer inference</strong>{" "}over explicit type arguments. Pass <code>{`<T>`}</code>{" "}only when TS can&apos;t figure it out.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Write <code>{`function useFetch<T>(url: string)`}</code>{" "}with state for <code>data</code>, <code>loading</code>, <code>error</code>. Use it twice: once with <code>{`useFetch<User>`}</code>, once with <code>{`useFetch<Post[]>`}</code>. Hover the return — confirm <code>data</code>{" "}is correctly typed in each case.</li>
          <li>Build a generic <code>{`<List<T>>`}</code>{" "}component taking <code>{`items: T[]`}</code>{" "}and <code>{`renderItem: (item: T) => ReactNode`}</code>. In a <code>.tsx</code>{" "}file, fix the arrow-function generic with the trailing comma.</li>
          <li>Write a <code>{`function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>`}</code>{" "}helper. Confirm that misspelling a key is a compile error.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why <code>{`<T,>`}</code>{" "}is necessary in <code>.tsx</code>{" "}and what would happen without it.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
