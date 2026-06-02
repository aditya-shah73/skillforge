import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "usestate-usereducer";

const CHECKPOINTS = [
  { id: "cp-usestate-is-usereducer", title: "useState is useReducer under the hood" },
  { id: "cp-snapshot-and-queue", title: "The snapshot-and-queue model" },
  { id: "cp-reducer-and-exhaustiveness", title: "Reducers + the exhaustiveness check" },
];

export default function UseStateUseReducerModule() {
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
          <code>useState</code>{" "}internals &amp; <code>useReducer</code>,{" "}when state gets complex
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Here&apos;s the secret nobody tells you on day one: <code>useState</code>{" "}<em>is</em>{" "}<code>useReducer</code>{" "}wearing a disguise. Once you see that, the &quot;why did my counter only go up by one&quot; bug and the &quot;when do I graduate to a reducer&quot; question answer themselves.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy, the kitchen ticket rail</h2>
        <p>
          Picture a busy restaurant kitchen. The current state of every order is written on a whiteboard. When a server wants something changed, &quot;table 4, no onions,&quot; &quot;table 4, add fries&quot;, they don&apos;t walk up and erase the whiteboard mid-service. They clip a <strong>ticket</strong>{" "}onto a rail. At the next service beat, the head chef takes the tickets <em>in order</em>, applies each one to the current board, and rewrites it once.
        </p>
        <p>
          Two things fall out of this, and they&apos;re the whole module:
        </p>
        <ul>
          <li>The board you read <em>right now</em>{" "}is a frozen snapshot. Clipping a ticket doesn&apos;t change what you&apos;re currently looking at, it changes what the board will say after the next beat.</li>
          <li>How a ticket gets applied depends on whether it says &quot;set the board to <em>this</em>&quot;{" "}(a fixed value) or &quot;take whatever&apos;s on the board and <em>do this to it</em>&quot;{" "}(a function of the current board). The second kind composes; the first kind clobbers.</li>
        </ul>
        <p>
          The chef who reads the rail and rewrites the board is a <strong>reducer</strong>: a function that takes the current state and one instruction, and returns the next state. React runs one of these for <em>every</em>{" "}piece of state you have, including the ones you created with <code>useState</code>. You just never had to write it.
        </p>
        <Callout variant="insight" title="The one-line frame">
          <code>setState</code>{" "}clips a ticket onto a rail. The render you&apos;re in is a frozen snapshot of the board. React processes the whole rail in order, then paints once.
        </Callout>
      </section>

      <section>
        <h2><code>useState</code>{" "}is literally a special case of <code>useReducer</code></h2>
        <p>
          This is not a metaphor or a teaching simplification, it&apos;s how React is built. Internally, <code>useState</code>{" "}is <code>useReducer</code>{" "}with a tiny, fixed reducer baked in. You can reconstruct it in one line:
        </p>
        <pre><code>{`// A faithful re-implementation of useState, in terms of useReducer.
function useState(initial) {
  return useReducer(
    // the "baseStateReducer": given the current state and an action,
    // if the action is a function, call it with the current state;
    // otherwise the action IS the next state.
    (state, action) =>
      typeof action === "function" ? action(state) : action,
    initial
  );
}`}</code></pre>
        <p>
          Read that reducer slowly, because it explains everything else in this module:
        </p>
        <ul>
          <li>You call <code>setX(5)</code>,{" "}the &quot;action&quot;{" "}is the value <code>5</code>, it&apos;s not a function, so the next state is just <code>5</code>. <em>The action replaces the state.</em></li>
          <li>You call <code>setX(prev =&gt; prev + 1)</code>,{" "}the action <em>is</em>{" "}a function, so the next state is <code>action(currentState)</code>. <em>The action is applied to the latest state.</em></li>
        </ul>
        <p>
          That single <code>typeof action === &quot;function&quot;</code>{" "}branch is the entire difference between the &quot;clobber&quot;{" "}ticket and the &quot;apply&quot;{" "}ticket from the analogy. The functional updater isn&apos;t a special API, it&apos;s just the case where your action happens to be a function and React feeds it the current state.
        </p>
        <Callout variant="info" title="So why have two hooks at all?">
          <code>useReducer</code>{" "}lets <em>you</em>{" "}supply the reducer instead of using React&apos;s built-in one. That&apos;s the only real difference. <code>useState</code>{" "}= &quot;React, you own the reducer, the actions are just next-values.&quot;{" "}<code>useReducer</code>{" "}= &quot;I own the reducer; the actions are my own vocabulary of intents.&quot;
        </Callout>
        <p>
          Both hooks return <code>[state, dispatcher]</code>. For <code>useState</code>{" "}the dispatcher is named <code>setX</code>{" "}and you dispatch raw values; for <code>useReducer</code>{" "}it&apos;s named <code>dispatch</code>{" "}and you dispatch action objects. Under the hood, both append to the same kind of update queue attached to the same kind of hook slot on the fiber. Same machine, different steering wheel.
        </p>
        <Callout variant="insight" title="Why this realization is worth real money">
          The instant you internalize &quot;<code>useState</code>{" "}is a reducer call,&quot;{" "}two famously confusing things become obvious. (1) The functional updater composes because it&apos;s an <em>action applied to the latest state</em>, exactly like reducer actions queue up. (2) Graduating from <code>useState</code>{" "}to <code>useReducer</code>{" "}isn&apos;t adopting a new paradigm, it&apos;s naming the reducer you already had.
        </Callout>
      </section>

      <Checkpoint id="cp-usestate-is-usereducer" moduleSlug={MODULE_SLUG} title="useState is useReducer under the hood">
        <Quiz
          kind="Quick check"
          question={"Given React's built-in updater reducer:\n\n(state, action) => typeof action === 'function' ? action(state) : action\n\nWhat is the next state after `setN(prev => prev * 2)` when the current state is 5?"}
          options={[
            { label: "The function itself is stored as the new state.", explanation: "Wrong, that would only happen if the reducer stored the action verbatim. The built-in reducer detects a function and CALLS it." },
            { label: "10, the action is a function, so the reducer returns `action(5)`.", correct: true, explanation: "Right. `typeof action === 'function'` is true, so the next state is `action(state)` = `(prev => prev * 2)(5)` = 10." },
            { label: "5, functional updaters don't change replacement state.", explanation: "Wrong, functional updaters absolutely change state; that's their entire job. They just compute the next value from the current one." },
            { label: "It throws, because you can't pass a function to a setter.", explanation: "Wrong, passing a function is the documented, supported 'functional updater' form. The reducer is built to handle exactly that." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="A teammate says 'useState and useReducer are totally different tools for different jobs.' What's the most accurate correction?"
          options={[
            { label: "They're unrelated; useReducer is for Redux-style apps only.", explanation: "Wrong, useReducer is a core React hook with no Redux dependency, and it's the foundation useState is built on." },
            { label: "useState is useReducer with a fixed built-in reducer; useReducer just lets you supply your own reducer and action vocabulary.", correct: true, explanation: "Right, same update-queue machinery, same [state, dispatch] shape. The only difference is who writes the reducer and what the 'actions' look like." },
            { label: "useReducer is faster because it skips the snapshot model.", explanation: "Wrong, both share the exact same snapshot-and-queue model. Performance isn't the reason to choose one." },
            { label: "useState stores values; useReducer stores functions.", explanation: "Wrong, both store values. The reducer is the function; the state is whatever it returns." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The snapshot-and-queue model</h2>
        <p>
          Now we can be precise about the two halves of the kitchen analogy. There are exactly two ideas, and every &quot;weird&quot;{" "}React state bug is one of them showing up.
        </p>
        <h3>Half one: state is a snapshot, captured per render</h3>
        <p>
          When React renders your component, it calls your function. The values you get back from <code>useState</code>{" "}are <em>constants</em>{" "}for the entire duration of that render and every closure created inside it. They do not change because you called a setter. The setter schedules a <em>future</em>{" "}render with a <em>new</em>{" "}snapshot.
        </p>
        <pre><code>{`function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // logs 0 — NOT 1
    // 'count' is the snapshot for THIS render. It's a const = 0.
    // setCount queued a new render; it did not reassign 'count'.
  }

  return <button onClick={handleClick}>{count}</button>;
}`}</code></pre>
        <p>
          Reading <code>count</code>{" "}after <code>setCount</code>{" "}gives you the old value because <code>count</code>{" "}is bound to this render&apos;s snapshot. The new value only exists in a render that hasn&apos;t happened yet.
        </p>
        <h3>Half two: setState enqueues; React drains the queue in order</h3>
        <p>
          Each <code>setX</code>{" "}call appends an update to that hook&apos;s queue. At the next render, React walks the queue from front to back, feeding each update through the reducer to compute the final state. This is why the famous &quot;+3&quot;{" "}bug behaves the way it does.
        </p>
        <pre><code>{`function handleClick() {
  setCount(count + 1); // count === 0 → enqueue "set to 1"
  setCount(count + 1); // count === 0 → enqueue "set to 1"
  setCount(count + 1); // count === 0 → enqueue "set to 1"
}
// Queue: [set 1, set 1, set 1]
// React reduces: start 0 → 1 → 1 → 1. Final: 1. You expected 3.`}</code></pre>
        <p>
          Each <code>count + 1</code>{" "}was computed from the <em>same</em>{" "}snapshot value <code>0</code>, so all three tickets say &quot;set to 1.&quot;{" "}They clobber each other. Now watch the functional updater fix it:
        </p>
        <pre><code>{`function handleClick() {
  setCount(prev => prev + 1); // enqueue "apply: n => n + 1"
  setCount(prev => prev + 1); // enqueue "apply: n => n + 1"
  setCount(prev => prev + 1); // enqueue "apply: n => n + 1"
}
// Queue: [n=>n+1, n=>n+1, n=>n+1]
// React reduces: start 0 → 1 → 2 → 3. Final: 3. ✅`}</code></pre>
        <Callout variant="insight" title="Why the functional updater composes">
          Each functional updater receives the result of the previous update in the queue, <em>not</em>{" "}the snapshot, the <em>accumulator</em>. The queue is a reduce: <code>queue.reduce((state, update) =&gt; reducer(state, update), baseState)</code>. Value updates throw away the accumulator (&quot;set to 1&quot;); function updates thread it through (&quot;add one to whatever we have so far&quot;). Composition is just reduce doing its job.
        </Callout>
        <Callout variant="warn" title="The rule that prevents the bug">
          If the next state depends on the current state, pass a function: <code>setX(prev =&gt; …)</code>. If it&apos;s a flat assignment that doesn&apos;t read the old value (<code>setName(input)</code>), a raw value is fine. When in doubt, the functional form is never wrong, it just reads the freshest value.
        </Callout>
        <h3>A subtle corollary: batching</h3>
        <p>
          Because updates are queued and drained together, React 18+ <strong>batches</strong>{" "}every <code>setState</code>{" "}call inside the same event handler, effect, promise, or timeout into a single render. Three setters in one handler = one re-render with the final reduced state, not three. This is the same machinery: queue everything, reduce once, paint once.
        </p>
        <Callout variant="info" title="A reducer's actions don't have to be functions">
          Notice the difference in ergonomics. With <code>useState</code>{" "}you fix the &quot;+3&quot;{" "}bug by remembering to pass a function. With <code>useReducer</code>, you&apos;d <code>dispatch({"{"} type: &apos;increment&apos; {"}"})</code>{" "}three times and the reducer computes <code>state + 1</code>{" "}each time, it <em>always</em>{" "}reads the accumulator, so this class of bug can&apos;t happen by construction. That&apos;s a quiet third reason reducers shine for interdependent state.
        </Callout>
      </section>

      <Checkpoint id="cp-snapshot-and-queue" moduleSlug={MODULE_SLUG} title="The snapshot-and-queue model">
        <Quiz
          kind="Quick check"
          question={"What does this handler log, and what is the final count, starting from count === 0?\n\nfunction onClick() {\n  setCount(count + 1);\n  setCount(count + 1);\n  console.log(count);\n}"}
          options={[
            { label: "Logs 2, final count is 2.", explanation: "Wrong on both. `count` is a snapshot const (0) for this render, so the log is 0. And both updates say 'set to 1', so the final count is 1, not 2." },
            { label: "Logs 0, final count is 1.", correct: true, explanation: "Right. `count` is the captured snapshot (0) at log time. Both `count + 1` compute from 0, enqueuing 'set to 1' twice, they clobber, so the final state is 1." },
            { label: "Logs 0, final count is 2.", explanation: "Half right: the log is 0. But the final count is 1, not 2, both raw-value updates were computed from the same snapshot (0), so both say 'set to 1'." },
            { label: "Logs 1, final count is 1.", explanation: "Wrong about the log. `count` doesn't get reassigned by `setCount`; it's a const bound to this render's snapshot, so it logs 0." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You need a button that reliably increments by 3 in a single click, regardless of batching. Which version is correct AND why?"
          options={[
            { label: "Three `setCount(count + 1)` calls, batching will sum them.", explanation: "Wrong, batching doesn't sum; it reduces the queue. All three read the same snapshot and enqueue 'set to 1', so you get +1." },
            { label: "Three `setCount(prev => prev + 1)` calls, each applies to the previous update's result.", correct: true, explanation: "Right. Functional updaters thread the accumulator through the queue's reduce: 0 → 1 → 2 → 3. They compose precisely because they're 'apply to latest', not 'set to fixed'." },
            { label: "One `setCount(count + 3)` only works if you wrap it in setTimeout.", explanation: "Misleading, `setCount(count + 3)` already works in one call (it reads the snapshot once and adds 3). setTimeout is irrelevant and the framing is wrong." },
            { label: "Use `useRef` to track the real count and sync it after.", explanation: "Wrong tool, refs don't trigger renders and don't fix the queue semantics. The functional updater is the direct, idiomatic fix." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>When <code>useState</code>{" "}sprawl is the signal to graduate</h2>
        <p>
          A single <code>useState</code>{" "}is perfect. Two or three independent ones are still perfect, independent fields <em>should</em>{" "}be separate state. The smell isn&apos;t the <em>count</em>{" "}of states; it&apos;s the <strong>interdependence</strong>. You&apos;ve outgrown loose <code>useState</code>{" "}calls when:
        </p>
        <ul>
          <li>Several state fields must change <strong>together</strong>{" "}to stay consistent (e.g. &quot;set status to submitting&quot;{" "}must also clear the error and disable the form).</li>
          <li>The <strong>next value of one field depends on others</strong>,{" "}so you find yourself reading three state vars to compute the fourth, and dreading a stale-snapshot bug.</li>
          <li>The same multi-field transition is duplicated across several event handlers, and they drift out of sync.</li>
          <li>You want the <em>why</em>{" "}of a change to be readable: <code>dispatch({"{"} type: &apos;submit_failed&apos; {"}"})</code>{" "}says more than five scattered setters.</li>
        </ul>
        <p>
          Here&apos;s the canonical &quot;before&quot;, a form with six pieces of state that all conspire to represent a few real situations (editing, submitting, succeeded, failed):
        </p>
        <pre><code>{`// ❌ Six useState calls. Every transition touches several of them by hand,
// and it's easy to forget one and leave the UI in an impossible state
// (e.g. isSubmitting = true AND error = "..." at the same time).
function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit() {
    setIsSubmitting(true);
    setError(null);          // remember to clear this...
    setSubmitted(false);     // ...and this, every single time
    try {
      await api.signup({ name, email, password });
      setSubmitted(true);
      setIsSubmitting(false);
    } catch (e) {
      setError(String(e));
      setIsSubmitting(false); // forget this line and the form locks forever
    }
  }
  // ...
}`}</code></pre>
        <p>
          The bug surface is huge: every handler is responsible for hand-coordinating six setters. <code>useReducer</code>{" "}collapses all of that into a single function that <em>owns the transitions</em>. The component dispatches an <em>intent</em>; the reducer decides the consistent next state.
        </p>
        <pre><code>{`// ✅ One reducer. State transitions live in ONE place, named by intent.
type State = {
  name: string;
  email: string;
  password: string;
  status: "editing" | "submitting" | "succeeded" | "failed";
  error: string | null;
};

// A discriminated union: every action is an object whose 'type' literal
// tells TypeScript exactly which other fields are present.
type Action =
  | { type: "field_changed"; field: "name" | "email" | "password"; value: string }
  | { type: "submit_started" }
  | { type: "submit_succeeded" }
  | { type: "submit_failed"; error: string }
  | { type: "reset" };

const initialState: State = {
  name: "",
  email: "",
  password: "",
  status: "editing",
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "field_changed":
      // TS knows action.field and action.value exist here.
      return { ...state, [action.field]: action.value };
    case "submit_started":
      // One transition, fully consistent: clear error, flip status.
      return { ...state, status: "submitting", error: null };
    case "submit_succeeded":
      return { ...state, status: "succeeded" };
    case "submit_failed":
      // TS knows action.error exists here.
      return { ...state, status: "failed", error: action.error };
    case "reset":
      return initialState;
  }
}`}</code></pre>
        <p>
          And the component shrinks to dispatching intents, it no longer micromanages individual fields:
        </p>
        <pre><code>{`function SignupForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function onSubmit() {
    dispatch({ type: "submit_started" }); // clears error + sets status in ONE place
    try {
      await api.signup(state);
      dispatch({ type: "submit_succeeded" });
    } catch (e) {
      dispatch({ type: "submit_failed", error: String(e) });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={state.name}
        onChange={e =>
          dispatch({ type: "field_changed", field: "name", value: e.target.value })
        }
      />
      {/* ...email, password the same way... */}
      <button disabled={state.status === "submitting"}>Sign up</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`}</code></pre>
        <Callout variant="insight" title="The real win is impossible states become harder to reach">
          Six independent booleans/strings can represent <code>2^n</code>{" "}combinations, most of which are nonsense (&quot;submitting&quot;{" "}AND &quot;has error&quot;{" "}AND &quot;succeeded&quot;). Collapsing them into one <code>status</code>{" "}union plus a reducer means the only way to reach a state is through a named transition you reviewed. The reducer becomes a tiny, testable state machine.
        </Callout>
        <Callout variant="info" title="A reducer is a pure function, test it with zero React">
          Because <code>reducer(state, action)</code>{" "}takes inputs and returns the next state with no side effects, you can unit-test every transition without rendering anything: <code>expect(reducer(initialState, {"{"} type: &apos;submit_started&apos; {"}"})).toEqual(…)</code>. That testability alone is often reason enough to reach for it.
        </Callout>
      </section>

      <section>
        <h2>The exhaustiveness check, a forgotten action becomes a compile error</h2>
        <p>
          Here&apos;s the most satisfying part, and the thing the project hangs on. Six months from now someone adds a new action, say <code>{`{ type: "field_cleared"; field: "name" | "email" | "password" }`}</code>,{" "}to the <code>Action</code>{" "}union but forgets to handle it in the reducer&apos;s <code>switch</code>. With a plain <code>default</code>, that bug ships silently: the dispatch does nothing, the field never clears, and you find out from a user.
        </p>
        <p>
          We can make TypeScript catch it <em>at compile time</em>{" "}with a one-line trick built on the <code>never</code>{" "}type. Add a <code>default</code>{" "}case that asserts the action <em>can&apos;t</em>{" "}exist:
        </p>
        <pre><code>{`function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "field_changed":
      return { ...state, [action.field]: action.value };
    case "submit_started":
      return { ...state, status: "submitting", error: null };
    case "submit_succeeded":
      return { ...state, status: "succeeded" };
    case "submit_failed":
      return { ...state, status: "failed", error: action.error };
    case "reset":
      return initialState;
    default: {
      // If every case above is handled, TypeScript has NARROWED 'action'
      // down to 'never' here — nothing is left. Assigning it to a 'never'
      // variable type-checks fine.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}`}</code></pre>
        <p>
          Why does this work? Inside each <code>case</code>, TypeScript <em>narrows</em>{" "}<code>action</code>{" "}to that one variant. By the time control reaches <code>default</code>, every known variant has been peeled off, so <code>action</code>{" "}is narrowed to <code>never</code>,{" "}the type with no values. Assigning a <code>never</code>{" "}to a <code>never</code>{" "}is legal, so it compiles.
        </p>
        <p>
          Now add a new variant to the <code>Action</code>{" "}union but <em>forget</em>{" "}the <code>case</code>:
        </p>
        <pre><code>{`type Action =
  | { type: "field_changed"; field: "name" | "email" | "password"; value: string }
  | { type: "submit_started" }
  | { type: "submit_succeeded" }
  | { type: "submit_failed"; error: string }
  | { type: "reset" }
  | { type: "field_cleared"; field: "name" | "email" | "password" }; // NEW

// In the reducer, you forgot 'case "field_cleared"'. Now at the default:
//   const _exhaustive: never = action;
//                       ^^^^^^^^^^
// TS2322: Type '{ type: "field_cleared"; ... }' is not assignable to type 'never'.
// The build BREAKS until you add the missing case. The bug can't ship.`}</code></pre>
        <p>
          Because the unhandled variant didn&apos;t get narrowed away, <code>action</code>{" "}at <code>default</code>{" "}is no longer <code>never</code>,{" "}it&apos;s <code>{`{ type: "field_cleared"; ... }`}</code>, which is <em>not</em>{" "}assignable to <code>never</code>. TypeScript fails the build with a clear message. You literally cannot forget an action.
        </p>
        <Callout variant="insight" title="never is the 'this should be impossible' type">
          <code>never</code>{" "}is the type with zero possible values. &quot;Assign <code>action</code>{" "}to a <code>never</code>&quot;{" "}is a way of telling the compiler &quot;prove to me there&apos;s nothing left here.&quot;{" "}If the compiler can&apos;t prove it, because you left a variant unhandled, it errors. This pattern (exhaustiveness via <code>never</code>) works for any <code>switch</code>{" "}over a discriminated union, not just reducers.
        </Callout>
        <Callout variant="warn" title="Two gotchas that quietly defeat the check">
          (1) If you annotate the action parameter as <code>any</code>, narrowing dies and the check is meaningless, keep the <code>Action</code>{" "}type. (2) If you put a <code>return</code>{" "}or a <code>break</code>{" "}with no <code>never</code>{" "}assignment in <code>default</code>, you lose the compile-time guarantee. The single <code>const _exhaustive: never = action;</code>{" "}line is what does the work; don&apos;t drop it.
        </Callout>
      </section>

      <Checkpoint id="cp-reducer-and-exhaustiveness" moduleSlug={MODULE_SLUG} title="Reducers + the exhaustiveness check">
        <Quiz
          kind="Scenario"
          question="You have six useState calls. Which situation is the clearest signal to refactor to a single useReducer?"
          options={[
            { label: "You just dislike having more than three useState calls.", explanation: "Wrong, count alone isn't the smell. Independent fields are fine as separate useState calls; many simple forms are happiest that way." },
            { label: "Several fields must change together to stay consistent, and handlers keep coordinating them by hand (and occasionally forgetting one).", correct: true, explanation: "Right, interdependence and coordinated transitions are the real signal. A reducer centralizes the transition logic so an impossible/forgotten combination becomes hard to reach." },
            { label: "One field is updated very frequently.", explanation: "Wrong, update frequency is a performance consideration, not a reason to consolidate into a reducer. A reducer doesn't make a single hot field faster." },
            { label: "The fields are completely independent of one another.", explanation: "Wrong, that's the case for KEEPING separate useState calls. Consolidating independent fields into a reducer adds ceremony with no consistency benefit." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question={"In a reducer's switch over a discriminated-union Action, why does this line in the default case catch a forgotten action at compile time?\n\nconst _exhaustive: never = action;"}
          options={[
            { label: "Because `never` triggers a runtime exception when reached.", explanation: "Wrong, this is a compile-time check, not runtime. The whole point is the build fails before the code ever runs." },
            { label: "Because once every known variant is handled in a case, TypeScript narrows `action` to `never` at the default; an unhandled variant leaves it non-never, which isn't assignable to `never`.", correct: true, explanation: "Right. Each case narrows the union; if you handle them all, `action` is `never` at the default and the assignment compiles. Forget one, and the leftover variant type can't be assigned to `never`, build error." },
            { label: "Because `never` is an alias for `any`, so it accepts anything.", explanation: "Wrong, `never` is the opposite of `any`: it's the type with NO values. Nothing is assignable to it except `never` itself." },
            { label: "Because ESLint forbids missing switch cases.", explanation: "Wrong, this guarantee comes from the TypeScript type system via the `never` assignment, not from a lint rule. It holds even with lint disabled." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><code>useState</code>{" "}is <code>useReducer</code>{" "}with a built-in reducer: <code>(state, action) =&gt; typeof action === &quot;function&quot; ? action(state) : action</code>. A value clobbers; a function applies to the latest state.</li>
          <li>State is a <strong>snapshot</strong>{" "}for the current render, a const. <code>setState</code>{" "}doesn&apos;t reassign it; it <strong>enqueues</strong>{" "}an update for the next render.</li>
          <li>React drains the queue as a <strong>reduce</strong>. <code>setX(x+1)</code>{" "}thrice all read the same snapshot → &quot;set to 1&quot;{" "}thrice → final 1. <code>setX(prev =&gt; prev+1)</code>{" "}thrice threads the accumulator → 1, 2, 3. That&apos;s why the functional updater composes.</li>
          <li>Graduate to <code>useReducer</code>{" "}when fields are <strong>interdependent</strong>{" "}and transitions must stay consistent, not merely because you have many of them.</li>
          <li>Type actions as a <strong>discriminated union</strong>{" "}(<code>{`{ type: "..."; ... }`}</code>) and switch on <code>action.type</code>; TypeScript narrows each case for you.</li>
          <li>Add <code>default: {"{"} const _exhaustive: never = action; return _exhaustive; {"}"}</code>. A forgotten action stays non-<code>never</code>{" "}and breaks the build, you can&apos;t forget it.</li>
          <li>Bonus: a reducer is a <strong>pure function</strong>,{" "}unit-test transitions with no React at all.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Refactor a 6-<code>useState</code>{" "}form into one <code>useReducer</code>{" "}with a typed action union, then make a forgotten action impossible to ship. Work through it in order:
        </p>
        <ol>
          <li>Start from a form component with <em>six</em>{" "}<code>useState</code>{" "}calls, three fields (<code>name</code>, <code>email</code>, <code>password</code>) plus <code>isSubmitting</code>, <code>error</code>, and <code>submitted</code>. Wire up submit so it sets several of these by hand. Deliberately introduce the classic bug: forget to reset <code>isSubmitting</code>{" "}on the error path and confirm the form locks up.</li>
          <li>Define a <code>State</code>{" "}type that collapses <code>isSubmitting</code>/<code>error</code>/<code>submitted</code>{" "}into a single <code>status: &quot;editing&quot; | &quot;submitting&quot; | &quot;succeeded&quot; | &quot;failed&quot;</code>{" "}plus an <code>error: string | null</code>. Notice how many impossible combinations just disappeared.</li>
          <li>Define an <code>Action</code>{" "}<strong>discriminated union</strong>{" "}with at least: <code>field_changed</code>{" "}(carrying <code>field</code>{" "}and <code>value</code>), <code>submit_started</code>, <code>submit_succeeded</code>, <code>submit_failed</code>{" "}(carrying <code>error</code>), and <code>reset</code>.</li>
          <li>Write <code>reducer(state, action): State</code>{" "}with a <code>switch (action.type)</code>. Confirm TypeScript narrows each case so <code>action.field</code>{" "}/ <code>action.error</code>{" "}are only available where they belong.</li>
          <li>Swap the six <code>useState</code>{" "}calls for one <code>useReducer(reducer, initialState)</code>. Replace every setter with a <code>dispatch</code>{" "}of an intent. Verify the error-path lockup bug is now structurally impossible: <code>submit_started</code>{" "}and <code>submit_failed</code>{" "}each define the whole consistent state in one place.</li>
          <li>Add the exhaustiveness <code>default</code>{" "}case with <code>const _exhaustive: never = action; return _exhaustive;</code>. Then add a brand-new variant to the <code>Action</code>{" "}union (e.g. <code>field_cleared</code>) <em>without</em>{" "}adding its <code>case</code>. Confirm the project fails to compile, with the error pointing at the <code>_exhaustive</code>{" "}line. Add the missing case to make it green again.</li>
          <li><em>Stretch:</em>{" "}write three or four unit tests that call <code>reducer</code>{" "}directly, no rendering, asserting that <code>submit_started</code>{" "}clears the error and that <code>submit_failed</code>{" "}sets <code>status: &quot;failed&quot;</code>. This proves the &quot;reducer is a pure, testable state machine&quot;{" "}claim to yourself.</li>
        </ol>
        <p>
          You should finish able to explain, out loud, why <code>useState</code>{" "}is a reducer, why the functional updater composes through the queue&apos;s reduce, the precise signal for graduating to <code>useReducer</code>, and exactly how the <code>never</code>{" "}assignment turns a forgotten action into a compile error.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
