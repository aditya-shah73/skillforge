import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rules-of-hooks";

const CHECKPOINTS = [
  { id: "cp-order-is-everything", title: "Why call order is the whole contract" },
  { id: "cp-fix-and-lint", title: "Fixing the break + what the lint rule protects" },
];

export default function RulesOfHooksModule() {
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
          The rules of hooks, and the linked-list reason they exist
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Everyone memorizes &quot;don&apos;t call hooks in conditions.&quot;{" "}Almost nobody can say <em>why</em>. The why is a tiny, beautiful data structure: React stores your component&apos;s hooks as an ordered list and walks it by call order every render. Understand that, and every rule becomes obvious.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The two rules, stated plainly</h2>
        <p>
          There are exactly two rules. They&apos;re short, and they&apos;re absolute:
        </p>
        <ol>
          <li>
            <strong>Only call hooks at the top level.</strong>{" "}Never inside a condition, a loop, a nested function, or after an early <code>return</code>. Hooks must run in the same order on every single render.
          </li>
          <li>
            <strong>Only call hooks from React function components or from other hooks.</strong>{" "}Not from plain JavaScript functions, not from class components, not from event handlers.
          </li>
        </ol>
        <p>
          That&apos;s the whole rulebook. The rest of this module is one question: <em>why does rule 1 exist at all?</em>{" "}It looks arbitrary, surely React could just look up a hook by name? It can&apos;t, and the reason is the single most clarifying thing you can learn about hooks.
        </p>
        <Callout variant="info" title="These aren't style guidelines">
          Breaking rule 1 doesn&apos;t produce a lint warning you can shrug off. It silently corrupts your state, one hook&apos;s value lands in another hook&apos;s slot. The bug is invisible until the wrong render happens, and then it&apos;s baffling. That&apos;s why the rule is enforced by tooling, not taste.
        </Callout>
      </section>

      <section>
        <h2>The why: hooks have no names, only positions</h2>
        <p>
          Here is the killer insight. When you write <code>const [count, setCount] = useState(0)</code>, you might imagine React storing that state under a key like <code>&quot;count&quot;</code>. It does not. React has no idea your variable is called <code>count</code>, that name only exists in your source code, and it&apos;s gone by the time the function runs.
        </p>
        <p>
          Instead, React keeps a component&apos;s hooks in an <strong>ordered list</strong>{" "}attached to that component&apos;s fiber (the internal object representing one component instance). On each render, React walks the list <strong>by call order</strong>:
        </p>
        <pre><code>{`// What React conceptually does, on the FIRST render.
// The fiber starts with an empty hook list.

function Profile() {
  const [name, setName]   = useState("Ada");  // → creates slot 0
  const [age, setAge]     = useState(36);      // → creates slot 1
  useEffect(fetchAvatar);                       // → creates slot 2
  // ...
}

// fiber.memoizedState (the hook linked-list) after first render:
//
//   slot 0 ── slot 1 ── slot 2
//   { state: "Ada" }  { state: 36 }  { effect: fetchAvatar }`}</code></pre>
        <p>
          It&apos;s literally a linked list: each hook node points to the next via a <code>.next</code> field. React holds a cursor. On every render it resets the cursor to the head, and each hook call advances it one node:
        </p>
        <pre><code>{`// On the SECOND render, React does NOT create new slots.
// It re-uses the existing ones, matched purely by call order.

function Profile() {
  const [name, setName]   = useState("Ada");  // → reads slot 0  (ignores "Ada")
  const [age, setAge]     = useState(36);      // → reads slot 1  (ignores 36)
  useEffect(fetchAvatar);                       // → reads slot 2
}

// The argument to useState ("Ada", 36) is ONLY used on the very first
// render to seed the slot. After that it's ignored — the slot remembers
// its own value. React pairs each call to a slot by the order it was made.`}</code></pre>
        <Callout variant="insight" title="The whole contract in one sentence">
          React identifies a hook by <strong>the order it was called in</strong>, not by name, not by the variable you assigned it to. The first hook call is slot 0, the second is slot 1, and so on, every render, forever. The instant the order changes, every slot after the change is reading someone else&apos;s state.
        </Callout>
        <p>
          This design is what makes hooks feel magical: no keys, no <code>this</code>, no boilerplate. You just call <code>useState</code> and get your value back. The price of that simplicity is the one rule, <em>the call order must be stable</em>,{" "}because order is the only thing React has to go on.
        </p>
      </section>

      <section>
        <h2>Watch it break: a hook inside an <code>if</code></h2>
        <p>
          Let&apos;s deliberately break rule 1 and trace exactly what happens, slot by slot. Here&apos;s a component that conditionally registers a name hook:
        </p>
        <pre><code>{`function Form({ showName }) {
  if (showName) {
    const [name, setName] = useState("");   // ⚠️ conditional hook
  }
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  // ...
}`}</code></pre>
        <p>
          On the first render, <code>showName</code> is <code>true</code>. Three hooks run, in order:
        </p>
        <pre><code>{`// Render #1 — showName = true
useState("")      // name      → slot 0
useState("")      // email     → slot 1
useState(false)   // submitted → slot 2

// fiber hook list:  [ name | email | submitted ]
//                      0       1        2`}</code></pre>
        <p>
          The user types, fills the form, then a parent re-render flips <code>showName</code> to <code>false</code>. Now the <code>if</code> block is skipped, so only <em>two</em>{" "}hooks run:
        </p>
        <pre><code>{`// Render #2 — showName = false
// (the name useState is SKIPPED)
useState("")      // email     → reads slot 0  ❌  was 'name'
useState(false)   // submitted → reads slot 1  ❌  was 'email'
//                                slot 2 is now orphaned

// React walks the list by ORDER:
//   1st hook call → slot 0  → returns 'name' state
//   2nd hook call → slot 1  → returns 'email' state`}</code></pre>
        <p>
          Everything shifted up by one. Step through the damage:
        </p>
        <ul>
          <li><code>email</code> now reads <strong>slot 0</strong>, which holds the old <code>name</code> value. Your email field suddenly shows whatever was typed into the name field.</li>
          <li><code>submitted</code> (a boolean) now reads <strong>slot 1</strong>, which holds the old <code>email</code> string. A variable you treat as <code>true/false</code> is now a string.</li>
          <li>Calling <code>setEmail(&quot;new@x.com&quot;)</code> writes to slot 0, corrupting what the next render will think is <code>name</code>.</li>
        </ul>
        <p>
          And if React updated the hook count mismatch loudly, you&apos;d at least get a warning, which it does, in development:
        </p>
        <pre><code>{`Warning: React has detected a change in the order of Hooks
called by Form. This will lead to bugs and errors if not fixed.

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. useState                   useState
3. useState                   undefined
                              ^^^^^^^^^^
   Rendered fewer hooks than expected.`}</code></pre>
        <Callout variant="warn" title="The same trap, in disguise">
          Early returns are the sneakiest version. <code>if (!user) return null;</code>{" "}<em>before</em>{" "}your hooks means that on renders where <code>user</code> is null, zero hooks run, and on renders where it&apos;s set, all of them run. Same order change, same corruption. The rule isn&apos;t &quot;no <code>if</code> statements&quot;, it&apos;s &quot;no hook call may be conditionally skipped.&quot;{" "}Put your hooks above every early return.
        </Callout>
        <p>
          A hook in a loop is the same disease with a worse fever, the number of hooks now depends on array length:
        </p>
        <pre><code>{`function List({ items }) {
  // ❌ the number of hooks tracks items.length — totally unstable
  const states = items.map((item) => useState(item.value));
  // render with 3 items → 3 slots
  // render with 2 items → 2 slots → everything after shifts
}`}</code></pre>
      </section>

      <Checkpoint id="cp-order-is-everything" moduleSlug={MODULE_SLUG} title="Why call order is the whole contract">
        <Quiz
          kind="Quick check"
          question="How does React know which stored state belongs to a given useState call?"
          options={[
            { label: "By the variable name you destructure it into (e.g. `count`).", explanation: "Wrong, React never sees your variable names. They're erased before the function runs; only the call exists." },
            { label: "By the order the hook was called in, first call is slot 0, second is slot 1, etc.", correct: true, explanation: "Right. React walks the fiber's hook list by call order each render and pairs each call to a slot by position. Order is the only identity a hook has." },
            { label: "By a key derived from the initial value passed to useState.", explanation: "Wrong, the initial value only seeds the slot on the first render and is ignored afterward. Two `useState(0)` calls are distinguished by order, not value." },
            { label: "By the line number in your source file.", explanation: "Wrong, line numbers aren't used. A hook can move lines (e.g. after minification) and still work, as long as call order is preserved." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="A component calls `useState` inside an `if`, then two more `useState` calls below it. On a render where the `if` is false, what happens?"
          options={[
            { label: "The skipped hook returns undefined, but the others keep their own state correctly.", explanation: "Wrong, there's no per-hook identity to keep. The two hooks below shift up into the slots above them." },
            { label: "Every hook after the skipped one shifts up a slot, so they read the wrong stored values.", correct: true, explanation: "Exactly. With one fewer call, the cursor pairs each remaining call to an earlier slot. State lands on the wrong hook and types get scrambled." },
            { label: "React detects the name mismatch and remaps the state back automatically.", explanation: "Wrong, there are no names to match on. React only has positions, so it can't 'remap' anything; it just warns that the hook count changed." },
            { label: "Nothing, conditional hooks are fine as long as the condition is deterministic.", explanation: "Wrong, even a deterministic condition that differs between renders changes the call order, which is what breaks." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The fix patterns</h2>
        <p>
          Every fix has the same shape: <strong>make the hook call unconditional, and move the condition inside.</strong>{" "}You never gate the hook, you gate what the hook does or how you use its result.
        </p>

        <h3>1. Call the hook always; branch inside it</h3>
        <p>
          The most common fix for effects. Don&apos;t wrap <code>useEffect</code> in an <code>if</code>, always call it, and put the condition in the body:
        </p>
        <pre><code>{`// ❌ conditional hook
if (isOnline) {
  useEffect(() => { subscribe(); }, []);
}

// ✅ unconditional hook, condition inside
useEffect(() => {
  if (!isOnline) return;   // bail early INSIDE the effect
  subscribe();
}, [isOnline]);`}</code></pre>

        <h3>2. Use the value conditionally, not the hook</h3>
        <p>
          For state, always declare it, then decide whether to <em>use</em>{" "}it:
        </p>
        <pre><code>{`// ❌
if (showName) {
  const [name, setName] = useState("");
}

// ✅ always declare; use it only when relevant
const [name, setName] = useState("");
// ... later in JSX:
{showName && <input value={name} onChange={(e) => setName(e.target.value)} />}`}</code></pre>

        <h3>3. Split into two components</h3>
        <p>
          When two branches genuinely need different hooks, don&apos;t branch hooks inside one component, render <em>different components</em>. Each component instance gets its own clean, stable hook list:
        </p>
        <pre><code>{`// ❌ one component trying to be two
function Panel({ kind }) {
  if (kind === "video") {
    const ref = useRef(null);            // only sometimes
  }
  const [open, setOpen] = useState(false);
}

// ✅ a component per shape — each has a fixed hook order
function VideoPanel() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
}
function TextPanel() {
  const [open, setOpen] = useState(false);
}
function Panel({ kind }) {
  return kind === "video" ? <VideoPanel /> : <TextPanel />;
}`}</code></pre>

        <h3>4. For lists, lift state into one structure or one child each</h3>
        <p>
          Never <code>useState</code> in a <code>.map</code>. Either hold the whole collection in a single state value, or render a child component per item so each child owns its own hooks:
        </p>
        <pre><code>{`// ✅ one state value for the whole list
const [values, setValues] = useState(() => items.map((i) => i.value));

// ✅ or: one child per item, each with its own stable hooks
{items.map((item) => <Row key={item.id} item={item} />)}
// where Row calls useState once — fixed order within Row`}</code></pre>
        <Callout variant="insight" title="The general principle">
          The hook call site must be unreachable-conditionally, it either always runs or it never runs, never &quot;sometimes.&quot;{" "}Conditions belong on the <em>inputs</em>{" "}(deps, effect body) and the <em>outputs</em>{" "}(whether you render or read the value), never on the call itself.
        </Callout>
      </section>

      <section>
        <h2>What <code>eslint-plugin-react-hooks</code> is actually protecting</h2>
        <p>
          The plugin ships two rules, and they guard two different failure modes:
        </p>
        <ul>
          <li>
            <strong><code>react-hooks/rules-of-hooks</code></strong>,{" "}statically catches the order problem you just traced. It flags any hook called inside a condition, loop, nested function, or after an early return, and any hook called from something that isn&apos;t a component or another hook. This rule is protecting the integrity of the fiber&apos;s hook list. A violation here is almost never a false alarm, it&apos;s a real corruption waiting for the wrong render.
          </li>
          <li>
            <strong><code>react-hooks/exhaustive-deps</code></strong>,{" "}a different beast. It checks that every reactive value an effect or memo reads is listed in its dependency array. This protects against <em>stale closures</em>: an effect capturing an old value because you forgot to list it. (You met this in the effects module.)
          </li>
        </ul>
        <p>
          The naming-vs-suppression point is the one to internalize for interviews:
        </p>
        <Callout variant="warn" title="Suppressing the rule almost always hides a real bug">
          When people add <code>{`// eslint-disable-next-line react-hooks/rules-of-hooks`}</code>, they are not silencing a pedantic linter. They are silencing the only thing standing between them and scrambled state. There is no &quot;but I know what I&apos;m doing&quot;{" "}exception, because the rule isn&apos;t about style; it&apos;s about a data structure that physically cannot work any other way. If the rule fires, restructure the code (one of the four fixes above). If <code>exhaustive-deps</code> fires, list the dep or hoist the value out. Don&apos;t lie to it.
        </Callout>
        <p>
          The one nuance worth knowing: <code>exhaustive-deps</code> is occasionally genuinely wrong (e.g. a value you know is stable but the linter can&apos;t prove it). Even then, the right move is usually to make stability explicit, wrap in <code>useCallback</code>/<code>useMemo</code>, or use a ref, rather than to suppress. <code>rules-of-hooks</code>, by contrast, has effectively no legitimate suppression case.
        </p>
      </section>

      <Checkpoint id="cp-fix-and-lint" moduleSlug={MODULE_SLUG} title="Fixing the break + what the lint rule protects">
        <Quiz
          kind="Quick check"
          question="You need an effect that only runs its logic when `isOnline` is true. What's the correct shape?"
          options={[
            { label: "Wrap the `useEffect` call in `if (isOnline) { ... }`.", explanation: "Wrong, that makes the hook conditional, changing call order whenever `isOnline` flips. State below it would shift slots." },
            { label: "Always call `useEffect`, and `if (!isOnline) return;` as the first line inside the effect body.", correct: true, explanation: "Right. The hook call is unconditional (stable order); the condition gates the work inside. Add `isOnline` to deps so it re-runs when it changes." },
            { label: "Call `useEffect` inside a `useMemo` so it only re-evaluates when `isOnline` changes.", explanation: "Wrong, calling a hook inside another hook's callback is itself a rules-of-hooks violation, and useMemo isn't for side effects." },
            { label: "Use a ternary: `isOnline ? useEffect(fn, []) : null`.", explanation: "Wrong, a ternary around a hook call is still conditional. On the `null` branch the hook is skipped and the order changes." },
          ]}
        />
        <Quiz
          kind="Gut check"
          question="A teammate's PR adds `// eslint-disable-next-line react-hooks/rules-of-hooks` above a `useState` inside an `if`, saying 'the lint rule is being overzealous.' What's the right read?"
          options={[
            { label: "They're probably right, rules-of-hooks has many false positives you learn to ignore.", explanation: "Wrong, rules-of-hooks has effectively no legitimate suppression case. It's protecting the fiber's positional hook list, not enforcing style." },
            { label: "The suppression is hiding a real bug: the conditional hook will shift every later hook's slot on renders where the `if` is false.", correct: true, explanation: "Exactly. The rule isn't overzealous here, it caught genuine state corruption. The fix is to restructure (call unconditionally, branch inside), never to suppress." },
            { label: "It's fine as long as the condition never actually changes at runtime.", explanation: "Risky and wrong as a habit, if the condition ever differs between renders, you get corruption. And 'never changes' is exactly the assumption that breaks six months later." },
            { label: "Switch it to `exhaustive-deps` suppression instead, which is safer.", explanation: "Wrong, that's a different rule for a different problem (stale closures), and suppressing it doesn't address the conditional-hook issue at all." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>Two rules:</strong>{" "}(1) only call hooks at the top level, never in conditions, loops, nested functions, or after an early return; (2) only call hooks from React function components or other hooks.</li>
          <li><strong>The why:</strong>{" "}React stores a component&apos;s hooks as an ordered linked-list on its fiber and matches each hook call to a slot <em>by call order</em>, not by name. Names don&apos;t exist at runtime.</li>
          <li><strong>What breaks:</strong>{" "}skip a hook (conditional / early return / shorter loop) and every later hook shifts up a slot, state lands on the wrong hook, types scramble, setters corrupt neighbors.</li>
          <li><strong>The fixes:</strong>{" "}always call the hook; move the condition inside the effect body, onto the value you read, or into a component split. Never gate the call site.</li>
          <li><strong>The linter:</strong>{" "}<code>rules-of-hooks</code> guards call order (no legitimate suppression); <code>exhaustive-deps</code> guards stale closures. Suppressing either usually hides a real bug.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build a small <code>Form</code> component with three <code>useState</code> hooks, <code>name</code>, <code>email</code>, <code>submitted</code>, plus a <code>showName</code> prop. Wrap the <code>name</code> <code>useState</code> in <code>if (showName) {`{ ... }`}</code>. Render it with <code>showName</code> initially <code>true</code> and type into all fields.</li>
          <li>Flip <code>showName</code> to <code>false</code> (a button on the parent works). Watch the email field suddenly display the old name value, and open the console to read React&apos;s &quot;change in the order of Hooks&quot;{" "}warning. Note the &quot;Rendered fewer hooks than expected&quot;{" "}line.</li>
          <li>Now break it the other way: <code>const states = items.map(() =&gt; useState(0))</code> over a list whose length changes. Add and remove items and watch state attach to the wrong rows.</li>
          <li>Write the correct version: declare all hooks unconditionally at the top, gate the <code>name</code> field with <code>{`{showName && <input .../>}`}</code> in JSX, and replace the loop with either one collection state value or a per-row child component.</li>
          <li>Out loud, explain the bug to an imaginary teammate: &quot;The hooks are stored by position. When I skipped one, every hook after it read the previous slot, so <em>x</em>{" "}became <em>y</em>.&quot;{" "}If you can narrate the slot shift without notes, you own this topic.</li>
          <li>Finally, confirm <code>eslint-plugin-react-hooks</code> catches both versions <em>statically</em>,{" "}before the bug ever runs. That static catch is the entire value of the rule.</li>
        </ol>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
