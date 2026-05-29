import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "custom-hooks";

const CHECKPOINTS = [
  { id: "cp-recipe-not-pantry", title: "Recipe, not pantry: logic vs. state" },
  { id: "cp-extract-and-shape", title: "Extracting logic & choosing a return shape" },
  { id: "cp-compose-and-rules", title: "Composing hooks & keeping the rules" },
];

export default function CustomHooksModule() {
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
          Custom hooks — the real unit of reuse in React
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A custom hook isn&apos;t a clever trick. It&apos;s the answer to a question every React
          codebase eventually asks: &quot;How do I reuse this stateful behavior without copy-pasting
          three <code>useState</code>s and a <code>useEffect</code> into every component that needs it?&quot;
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. The analogy ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">1. The one mental model that fixes everything: recipe, not pantry</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Here is the single most-misunderstood thing about custom hooks, and if you internalize it
          now you will skip months of confusion: <strong>a custom hook is a recipe, not a shared
          pantry.</strong>
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          A recipe is a reusable <em>procedure</em>. When two cooks follow the same recipe in two
          different kitchens, they each end up with their <em>own</em> cake. The recipe is shared.
          The cakes are not. Nobody expects cook A&apos;s cake to show up on cook B&apos;s plate just
          because they read the same instructions.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          A custom hook works exactly the same way. When two components call{" "}
          <code>useToggle()</code>, they each run the recipe — they each get their <em>own</em>{" "}
          independent <code>useState</code> cell. Calling the same hook from two places does{" "}
          <strong>not</strong> connect their state. There is no shared pantry.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  return [on, toggle];
}

// Two SEPARATE components, two SEPARATE pieces of state:
function Sidebar() {
  const [open, toggleOpen] = useToggle();   // its own \`open\`
  // ...
}

function Modal() {
  const [open, toggleOpen] = useToggle();   // a DIFFERENT \`open\`
  // ...
}
// Toggling the Sidebar does nothing to the Modal. Same recipe, different cakes.`}</code></pre>
        <Callout variant="insight" title="The whole module in one sentence">
          A custom hook <strong>shares logic, not state</strong>. Every call site gets its own
          fresh instance of whatever state the hook declares. If you want two components to share the
          same state value, a custom hook alone will never do it — you need lifted state or context
          (more on that in section 4).
        </Callout>
      </section>

      {/* ───────────────────────── 2. Just a function ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">2. There is no magic: it&apos;s just a function that calls hooks</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          A custom hook is defined by two boring rules, and that is the entire definition:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
          <li>Its name starts with <code>use</code> (e.g. <code>useToggle</code>, <code>useWindowSize</code>).</li>
          <li>It calls one or more other hooks (built-in like <code>useState</code>/<code>useEffect</code>, or other custom hooks).</li>
        </ul>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          That&apos;s it. No registration, no special export, no React API you have to opt into.
          When you call <code>useToggle()</code> from inside a component&apos;s render, the body of{" "}
          <code>useToggle</code> runs <strong>inline, right there in the caller&apos;s render</strong>.
          The <code>useState</code> inside it is, from React&apos;s point of view, just another{" "}
          <code>useState</code> call belonging to the component that&apos;s rendering. The hook is a
          syntactic boundary for <em>you</em>, the developer — React only sees a flat sequence of
          hook calls.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Why does the name need to start with <code>use</code>? Two reasons. First, it tells{" "}
          <em>humans</em> &quot;this function obeys the rules of hooks — call it at the top level, not
          conditionally.&quot; Second, it tells the <code>eslint-plugin-react-hooks</code> linter to
          actually enforce those rules. The <code>use</code> prefix is a convention with teeth.
        </p>
        <Callout variant="info" title="A custom hook is not a component">
          A component returns JSX (UI). A custom hook returns <em>data and functions</em> (a value,
          a setter, a tuple, an object) — never JSX. If your <code>use*</code> function returns{" "}
          <code>&lt;div&gt;</code>, you wanted a component. If it returns <code>[value, setValue]</code>,
          you wanted a hook.
        </Callout>
      </section>

      {/* ───────────────────────── 3. Extracting logic ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">3. Extracting stateful logic without changing the tree</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The everyday job of a custom hook is to take stateful logic that has bloated a component
          and lift it into a reusable function — <strong>without changing a single thing the user
          sees.</strong> The rendered tree is identical before and after. Only the source code moves.
        </p>
        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">Before — a fat component with debounce logic inlined:</p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function SearchPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // this stateful, time-based logic clutters the component
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const results = useSearch(debounced);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`}</code></pre>
        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-300">After — the same behavior, extracted into <code>useDebouncedValue</code>:</p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function SearchPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);   // logic gone, intent clear

  const results = useSearch(debounced);
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`}</code></pre>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The component is shorter and reads like a sentence. The <code>useState</code> +{" "}
          <code>useEffect</code> machinery still runs — it just runs <em>inside the hook</em>, inline,
          during <code>SearchPage</code>&apos;s render. The DOM output is byte-for-byte the same.
        </p>
        <Callout variant="spring" title="Coming from Spring / backend?">
          Think of a custom hook like extracting a method or a small service from a bloated
          controller. You move the <em>logic</em> out for reuse and readability, but each request
          still gets its own execution and its own local variables. The hook is the method; the
          component&apos;s render is the request. Nothing becomes a shared singleton just because you
          extracted it.
        </Callout>
      </section>

      {/* ───────────────────────── 4. Logic vs state ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">4. Sharing logic vs. sharing state — the line that trips everyone</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Back to section 1, now with the consequence spelled out. People reach for a custom hook
          expecting it to <em>share state</em> between components. It will not. Ever. Here is the clean
          distinction:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
          <li>
            <strong>Sharing logic / behavior →</strong> a custom hook. Each caller gets its own state.
            &quot;Every component that wants a toggle should toggle the same <em>way</em>.&quot;
          </li>
          <li>
            <strong>Sharing state →</strong> lift the state up to a common parent and pass it down, or
            put it in <code>Context</code> (or a store). &quot;These components should all read and write
            the <em>same</em> value.&quot;
          </li>
        </ul>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`// ❌ This does NOT make a shared theme. Two independent copies of \`theme\`.
function Header() { const [theme, setTheme] = useTheme(); /* ... */ }
function Footer() { const [theme, setTheme] = useTheme(); /* ... */ }

// ✅ To truly share one theme, the STATE lives in one place and is read via context:
const ThemeContext = createContext(null);
function App() {
  const [theme, setTheme] = useState("light");      // single source of truth
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header /> <Footer />
    </ThemeContext.Provider>
  );
}
// A custom hook can WRAP the context read for ergonomics:
function useTheme() { return useContext(ThemeContext); }`}</code></pre>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Notice the subtlety in that last line: a custom hook that calls <code>useContext</code>{" "}
          <em>does</em> let multiple components read shared state — but only because the state itself
          lives in the provider, not in the hook. The hook is still just sharing the <em>logic</em> of
          &quot;read this context.&quot; The shared state lives upstream.
        </p>
        <Callout variant="warn" title="The diagnostic question">
          When a hook isn&apos;t doing what you expect, ask: &quot;Does this hook <em>declare</em> the
          state with <code>useState</code>/<code>useReducer</code>, or does it <em>read</em> state
          that lives elsewhere via <code>useContext</code>?&quot; Declared state is per-caller. Read
          state is shared. That one question resolves 90% of &quot;why isn&apos;t my state shared&quot;
          bugs.
        </Callout>
      </section>

      {/* ─── Checkpoint 1 ─── */}
      <Checkpoint id="cp-recipe-not-pantry" moduleSlug={MODULE_SLUG} title="Recipe, not pantry: logic vs. state">
        <Quiz
          kind="Gut check"
          question="Two sibling components both call useToggle(). The first one toggles its value on. What happens to the second component's value?"
          options={[
            { label: "Nothing — each call site has its own independent state, so the second component's value is unaffected.", explanation: "Exactly. A custom hook is a recipe, not a shared pantry. Each call to useToggle runs its own useState. Same logic, separate state.", correct: true },
            { label: "It also flips on, because they share the same useState cell inside the hook.", explanation: "No — there is no shared cell. The useState inside the hook runs fresh for each caller. Calling the same hook never connects state across components." },
            { label: "It throws an error, because two components can't call the same hook.", explanation: "Not at all — calling the same hook from many components is the entire point. That's reuse working as intended." },
            { label: "Whichever component rendered last 'wins' and overwrites the other.", explanation: "There's no contest — the two states are entirely separate. Render order doesn't make them share a value." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="You want a Header and a Footer to display and update the SAME current theme. Which approach actually shares the state?"
          options={[
            { label: "Lift the theme state into a common parent (or context) and have a hook read it via useContext.", explanation: "Right. Shared state needs a single source of truth upstream. A hook calling useContext just reads it ergonomically; the state lives in the provider.", correct: true },
            { label: "Write a useTheme() hook with its own useState and call it in both components.", explanation: "This gives each component its own private copy of theme. They'd never stay in sync — the classic 'logic vs. state' mistake." },
            { label: "Export the state variable from the hook module so both import the same one.", explanation: "Module-level variables aren't React state — they won't trigger re-renders and break the rules of how React tracks updates. Use context for shared, reactive state." },
            { label: "Call useTheme() once and pass its return value through a global window object.", explanation: "Smuggling React state through globals bypasses re-rendering entirely. Use lifted state or context instead." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. Return shapes ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">5. Return-shape conventions: tuple vs. object</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          What a hook returns is a design decision, and there are two established conventions. Pick
          deliberately — the choice shapes how every caller uses your hook.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-semibold">Tuple: <code>[value, setValue]</code></h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          A tuple (array) returns values <em>positionally</em>, just like <code>useState</code>{" "}
          itself. Because position carries the meaning, the caller can <strong>rename freely</strong>{" "}
          on destructure — that&apos;s the killer feature.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];   // tuple — order is the contract
}

// Caller renames freely because position, not name, carries meaning:
const [isOpen, toggleOpen]   = useToggle();
const [isDark, toggleDark]   = useToggle(true);   // same hook, different names`}</code></pre>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Use a tuple when there are <strong>few returns (two, maybe three)</strong> and the caller
          frequently uses the hook more than once and needs to name each instance differently. The
          cost: order matters, and beyond ~3 elements positional returns get hard to read and easy to
          mis-order.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-semibold">Object: <code>{"{ data, error, isLoading }"}</code></h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          An object returns values <em>by name</em>. Order is irrelevant, callers grab only what they
          need, and you can add new fields later without breaking anyone.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);
  // ... effect that fetches ...
  return { data, error, isLoading };   // object — names are the contract
}

// Caller picks what it wants, in any order, and can ignore the rest:
const { data, isLoading } = useFetch("/api/user");`}</code></pre>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Use an object when there are <strong>many returns</strong>, when callers usually need only a
          subset, or when you expect the return shape to grow. The cost: you can&apos;t casually rename
          two instances the way you can with a tuple — you&apos;d destructure-and-alias
          (<code>{"const { data: user } = useFetch(...)"}</code>), which is more verbose.
        </p>
        <Callout variant="info" title="Rule of thumb">
          <strong>≤ 2–3 returns and likely used multiple times per component → tuple.</strong>{" "}
          <strong>Many returns, used as a subset, or likely to grow → object.</strong> When in doubt
          for a data-fetching-style hook, reach for the object; for a single
          stateful-primitive-style hook (toggle, counter, boolean), reach for the tuple.
        </Callout>
      </section>

      {/* ─── Checkpoint 2 ─── */}
      <Checkpoint id="cp-extract-and-shape" moduleSlug={MODULE_SLUG} title="Extracting logic & choosing a return shape">
        <Quiz
          kind="Quick check"
          question="You extract debounce logic from a component into useDebouncedValue. The component's JSX and DOM output are unchanged. What did the extraction actually move?"
          options={[
            { label: "The stateful logic (useState + useEffect) — it now runs inline inside the hook during the same render, leaving the component cleaner with identical output.", explanation: "Correct. Extraction relocates source code, not behavior. The hook's hooks run inline in the caller's render; the rendered tree is identical.", correct: true },
            { label: "The rendering — the hook now renders the input element instead of the component.", explanation: "Hooks never return JSX or render UI. The component still renders the input; only the logic moved into the hook." },
            { label: "Nothing meaningful — extracting into a hook is purely cosmetic and changes how React schedules renders.", explanation: "It's not just cosmetic (readability and reuse are real wins), but it also does NOT change React's scheduling — the same hooks run in the same order. The output is unchanged." },
            { label: "The state to a shared location, so other components now see the same debounced value.", explanation: "No — each caller of useDebouncedValue gets its own state. Extraction shares logic, not state." },
          ]}
        />
        <Quiz
          kind="Gut check"
          question="You're designing useToggle, which returns a boolean and a toggle function, and you expect components to use it two or three times each (sidebar open, modal open, dark mode). Which return shape fits best?"
          options={[
            { label: "A tuple [on, toggle], because there are few returns and the caller can rename each instance freely by position.", explanation: "Spot on. Few returns + frequent multi-use per component is the textbook case for a tuple — exactly why useState returns one.", correct: true },
            { label: "An object { on, toggle }, so callers don't have to remember the order.", explanation: "An object works, but with two returns and multiple instances per component you lose the easy renaming a tuple gives you (you'd have to alias on every destructure)." },
            { label: "A single boolean, and let the caller write their own setter.", explanation: "That defeats the purpose — the toggle function is the reusable behavior you're trying to share. Return it." },
            { label: "Either is identical; return shape is purely stylistic with no practical consequence.", explanation: "There's a real consequence: tuples let callers rename by position (great for multi-use primitives), objects are order-independent and extensible (great for many/growing returns)." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. Composing hooks ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">6. Composing hooks: hooks that call hooks</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Because a custom hook is &quot;just a function that calls hooks,&quot; and other custom hooks
          <em> are</em> hooks, a custom hook can call other custom hooks. This composition is where the
          pattern earns its keep: you build small, focused hooks and assemble them into bigger ones,
          the same way you compose functions.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Here is <code>useSearchBox</code>, built entirely from smaller hooks — the exact thing you
          will write in the project:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`function useSearchBox(delay = 300) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, delay);   // composed hook
  const [isFocused, toggleFocused] = useToggle(false); // composed hook

  return {
    query,
    setQuery,
    debounced,
    isFocused,
    toggleFocused,
  };
}

// The component stays tiny — all the logic lives in composed hooks:
function SearchBox() {
  const { query, setQuery, debounced, isFocused, toggleFocused } = useSearchBox();
  // fetch with \`debounced\`, render with \`query\`, style with \`isFocused\` ...
}`}</code></pre>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <code>useSearchBox</code> returns an object here, on purpose — it exposes five things, and
          callers grab the subset they need. Inside it, <code>useToggle</code> returns a tuple, which
          we immediately re-name into <code>isFocused</code>/<code>toggleFocused</code>. Both
          conventions coexist happily; you pick per hook.
        </p>
        <Callout variant="insight" title="Composition is the payoff">
          Small hooks are easy to test and reason about in isolation; composed hooks let you assemble
          rich behavior without re-implementing the parts. This is the same principle as composing
          pure functions — just with stateful logic. Each composed hook still gets its own state per
          call site (recipe, not pantry, all the way down).
        </Callout>
      </section>

      {/* ───────────────────────── 7. Pitfalls ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">7. Pitfalls: the rules of hooks still apply inside custom hooks</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Extracting hooks into a function does <strong>not</strong> exempt that function from the
          rules of hooks. Because the hook&apos;s body runs inline in the caller&apos;s render, every
          rule about hook ordering applies <em>inside</em> your custom hook too.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
          <li>
            <strong>No conditional hook calls.</strong> Don&apos;t call <code>useState</code> or any
            hook inside an <code>if</code>, loop, or early <code>return</code> within your custom hook.
            The call order must be identical on every render. (The deep reason — React tracks hooks by
            position in a linked list — is the entire next module, <em>rules-of-hooks</em>.)
          </li>
          <li>
            <strong>Don&apos;t call custom hooks conditionally either.</strong> Calling{" "}
            <code>if (x) useToggle()</code> is just as illegal as a conditional <code>useState</code>,
            because the custom hook contains hook calls.
          </li>
          <li>
            <strong>Stable return identities matter for deps.</strong> If your hook returns a function
            or object that a caller will put in a <code>useEffect</code>/<code>useMemo</code>{" "}
            dependency array, wrap it in <code>useCallback</code>/<code>useMemo</code> so its identity
            is stable across renders — otherwise you cause the caller&apos;s effects to re-run every
            render.
          </li>
        </ul>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`// ❌ Conditional hook inside a custom hook — breaks hook ordering:
function useThing(enabled) {
  if (enabled) {
    const [x, setX] = useState(0);   // 🚫 sometimes called, sometimes not
  }
}

// ✅ Always call the hook; make the BEHAVIOR conditional instead:
function useThing(enabled) {
  const [x, setX] = useState(0);     // always called, stable order
  useEffect(() => {
    if (!enabled) return;            // condition lives inside the effect
    // ...
  }, [enabled]);
}

// ✅ Stable identity so callers' dependency arrays don't churn:
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);  // same fn each render
  return [on, toggle];
}`}</code></pre>
        <Callout variant="warn" title="Forward pointer">
          The <em>why</em> behind all of this — why hook call order is sacred, what literally breaks
          when you violate it, and what the linter is protecting — is the focus of the very next
          module, <strong>The rules of hooks</strong>. For now: top-level, unconditional, same order
          every render, even inside your own hooks.
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-second answer ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">8. The 60-second answer (memorize this)</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
            <li>A custom hook is <strong>just a function whose name starts with <code>use</code> and that calls other hooks.</strong> No magic; it runs inline in the caller&apos;s render.</li>
            <li>It <strong>shares logic, not state.</strong> Recipe, not pantry — every call site gets its own independent state.</li>
            <li>To actually <strong>share state</strong>, lift it up or use context; a hook can <em>read</em> shared state via <code>useContext</code>, but the state lives upstream.</li>
            <li>Extracting logic into a hook <strong>doesn&apos;t change the rendered tree</strong> — same output, cleaner component.</li>
            <li><strong>Tuple</strong> <code>[value, setValue]</code> for few returns (rename freely, like <code>useState</code>); <strong>object</strong> <code>{"{ a, b, c }"}</code> for many/growing returns (named, order-independent).</li>
            <li>Hooks <strong>compose</strong> — a hook can call other custom hooks (<code>useSearchBox</code> = <code>useDebouncedValue</code> + <code>useToggle</code>).</li>
            <li>The <strong>rules of hooks still apply inside</strong> custom hooks: top-level only, never conditional, stable return identities for deps.</li>
          </ul>
        </div>
      </section>

      {/* ─── Checkpoint 3 ─── */}
      <Checkpoint id="cp-compose-and-rules" moduleSlug={MODULE_SLUG} title="Composing hooks & keeping the rules">
        <Quiz
          kind="Quick check"
          question="useSearchBox calls useDebouncedValue and useToggle internally. Is this allowed, and why?"
          options={[
            { label: "Yes — custom hooks are functions that call hooks, and other custom hooks are hooks, so a hook can call other custom hooks (composition).", explanation: "Correct. Composition is a core strength: build small focused hooks and assemble them. Each composed hook still gets its own state per call site.", correct: true },
            { label: "No — a hook may only call built-in React hooks like useState and useEffect, never another custom hook.", explanation: "Not true. Calling other custom hooks is exactly how composition works; useSearchBox built from useDebouncedValue + useToggle is idiomatic." },
            { label: "Only if useSearchBox is itself a component, not a hook.", explanation: "It's a hook (returns data/functions, not JSX), and hooks are allowed — in fact expected — to call other hooks." },
            { label: "Yes, but only one custom hook may be called per custom hook.", explanation: "There's no such limit. A hook can call as many other hooks as it needs, as long as the calls are unconditional and at the top level." },
          ]}
        />
        <Quiz
          kind="Gut check"
          question="Inside a custom hook you only want to run a useState 'when enabled is true'. What's the correct way to handle this?"
          options={[
            { label: "Always call useState at the top level, and make the behavior conditional (e.g., guard inside an effect with `if (!enabled) return`).", explanation: "Right. Hook calls must be unconditional and in the same order every render — even inside custom hooks. Put the condition inside the effect's body, not around the hook call.", correct: true },
            { label: "Wrap the useState call in `if (enabled) { ... }` so it only runs when needed.", explanation: "This breaks the rules of hooks: the hook is sometimes called and sometimes not, so React loses track of which state belongs to which call. Never call hooks conditionally." },
            { label: "Use an early `return` before the useState when enabled is false.", explanation: "An early return that skips a hook call changes the number/order of hooks between renders — same violation as a conditional. Call the hook first, branch afterward." },
            { label: "Move the useState into a try/catch so React ignores it when enabled is false.", explanation: "try/catch doesn't exempt a hook from ordering rules, and the hook would still be conditionally skipped. Always call it; gate the behavior, not the call." },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 9. The project ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">9. The project: extract three hooks, then compose them</h2>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You&apos;ll build three focused custom hooks from inline logic, then compose them into a
          single <code>useSearchBox</code>. Work through the steps in order — each one stands on the
          last.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6 text-slate-700 dark:text-slate-300">
          <li>
            <strong>Implement <code>useToggle(initial = false)</code>.</strong> Return a tuple{" "}
            <code>[on, toggle]</code>. Use <code>useState</code> for the boolean and wrap{" "}
            <code>toggle</code> in <code>useCallback</code> with an empty dependency array (use the
            functional updater <code>setOn(v =&gt; !v)</code> so the callback never needs to change).
            Bonus: also return a way to set it explicitly, e.g. <code>[on, toggle, setOn]</code>.
          </li>
          <li>
            <strong>Implement <code>useDebouncedValue(value, delay = 300)</code>.</strong> Keep a{" "}
            <code>useState</code> for the debounced value. In a <code>useEffect</code> keyed on{" "}
            <code>[value, delay]</code>, <code>setTimeout</code> to update the debounced value after{" "}
            <code>delay</code> ms, and <strong>return a cleanup that clears the timer</strong> so rapid
            changes cancel the pending update. Return the debounced value (a bare value, not a tuple).
          </li>
          <li>
            <strong>Implement <code>useLocalStorage(key, initialValue)</code>.</strong> Return a tuple{" "}
            <code>[value, setValue]</code> shaped like <code>useState</code>. Lazily initialize state by
            reading <code>localStorage.getItem(key)</code> (parse JSON; fall back to{" "}
            <code>initialValue</code> on miss or parse error). On every change, write the value back to{" "}
            <code>localStorage</code> in a <code>useEffect</code> keyed on <code>[key, value]</code>.
            Guard for <code>typeof window === &quot;undefined&quot;</code> so it&apos;s SSR-safe.
          </li>
          <li>
            <strong>Compose <code>useSearchBox()</code>.</strong> Inside it: hold the raw{" "}
            <code>query</code> with <code>useLocalStorage(&quot;searchbox:q&quot;, &quot;&quot;)</code>{" "}
            (so the last query survives a refresh), derive <code>debounced</code> with{" "}
            <code>useDebouncedValue(query)</code>, and track focus state with{" "}
            <code>useToggle(false)</code>. Return an <strong>object</strong>{" "}
            <code>{"{ query, setQuery, debounced, isFocused, toggleFocused }"}</code> — many returns, so
            an object is the right shape.
          </li>
          <li>
            <strong>Prove the &quot;recipe, not pantry&quot; point.</strong> Render <code>useSearchBox</code>{" "}
            in two separate <code>SearchBox</code> components on the same page. Type in one; confirm the
            other&apos;s <code>query</code> and <code>isFocused</code> are unaffected. (The{" "}
            <code>useLocalStorage</code> key is shared, so note how persistence — disk — differs from
            in-memory React state.)
          </li>
          <li>
            <strong>Sanity-check the rules.</strong> Run with{" "}
            <code>eslint-plugin-react-hooks</code> enabled. Deliberately move one hook call inside an{" "}
            <code>if</code> and watch the linter complain — then put it back. This is your bridge into
            the next module.
          </li>
        </ol>
        <Callout variant="spring" title="Acceptance criteria">
          <ul className="list-disc space-y-1 pl-6">
            <li><code>useToggle</code> returns a tuple; <code>toggle</code> is stable across renders.</li>
            <li><code>useDebouncedValue</code> cancels pending updates on rapid change (cleanup clears the timer).</li>
            <li><code>useLocalStorage</code> persists across refresh and is SSR-safe.</li>
            <li><code>useSearchBox</code> is built <em>only</em> from the three hooks above and returns an object.</li>
            <li>Two <code>SearchBox</code> instances have fully independent in-memory state.</li>
            <li>No ESLint rules-of-hooks warnings.</li>
          </ul>
        </Callout>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
