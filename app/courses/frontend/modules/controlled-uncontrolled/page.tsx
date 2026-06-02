import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "controlled-uncontrolled";

const CHECKPOINTS = [
  { id: "cp-who-owns-the-value", title: "Who owns the value, React state or the DOM" },
  { id: "cp-frozen-field-bug", title: "The frozen-field bug, `value` with no `onChange`" },
  { id: "cp-the-decision-rule", title: "The decision rule + when uncontrolled wins" },
];

export default function ControlledUncontrolledModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 5 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Controlled vs uncontrolled inputs, the decision interviewers probe
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Every text field on the web is owned by <em>someone</em>. The whole interview question is: is it React, or is it the DOM? Get that one fact straight and &quot;why is my input frozen?&quot;{" "}stops being a mystery.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy, a thermostat</h2>
        <p>
          Picture a thermostat on the wall. There are two ways the dial reading can work.
        </p>
        <p>
          In the <strong>controlled</strong>{" "}version, a central computer holds the &quot;true&quot;{" "}temperature setting in its memory. The dial on the wall is just a <em>display</em>,{" "}it shows whatever the computer says. When you turn the dial, it doesn&apos;t change anything by itself; it sends a message to the computer (&quot;the user wants 71&quot;), the computer updates its number, and only <em>then</em>{" "}does the display update to match. The computer is the single source of truth. The dial can never show a number the computer didn&apos;t put there.
        </p>
        <p>
          In the <strong>uncontrolled</strong>{" "}version, the dial itself remembers the number. You turn it to 71, and it just <em>stays</em>{" "}at 71, no computer in the loop. When the computer finally needs to know the setting (say, to log it), it walks over and <em>reads the dial</em>.
        </p>
        <p>
          That is exactly the controlled/uncontrolled split in React. In a controlled input, React state is the computer, it holds the value, and the <code>&lt;input&gt;</code>{" "}is just a display. In an uncontrolled input, the DOM node is the dial, it holds its own value, and you read it from a ref only when you need it.
        </p>
        <Callout variant="insight" title="The one-line definition">
          <strong>Controlled:</strong>{" "}React state is the source of truth; the DOM mirrors it. <strong>Uncontrolled:</strong>{" "}the DOM is the source of truth; React reads it on demand.
        </Callout>
      </section>

      <section>
        <h2>The core question: who owns the value?</h2>
        <p>
          A browser <code>&lt;input&gt;</code>{" "}has its own internal value, baked into the DOM, completely independent of React. Type into a plain HTML form and it just works, the browser tracks what you typed. React doesn&apos;t have to be involved at all.
        </p>
        <p>
          So when you put an <code>&lt;input&gt;</code>{" "}inside a React component, there&apos;s a question that has to get answered, whether you think about it or not: <strong>when the displayed value and React&apos;s idea of the value disagree, who wins?</strong>
        </p>
        <ul>
          <li>If <strong>React</strong>{" "}wins, React state drives what&apos;s on screen, every render, the input is <strong>controlled</strong>.</li>
          <li>If the <strong>DOM</strong>{" "}wins, the browser keeps the value and React only peeks at it when asked, the input is <strong>uncontrolled</strong>.</li>
        </ul>
        <p>
          There is no third option. Every input you ever write is one or the other. The trap is writing something that&apos;s <em>half</em>{" "}of each, which is precisely the frozen-field bug we&apos;ll hit in a minute.
        </p>
        <Callout variant="info" title="The prop tells you which it is">
          Used <code>value</code>{" "}+ <code>onChange</code>? Controlled. Used <code>defaultValue</code>{" "}(and read it later with a ref)? Uncontrolled. The presence of <code>value</code>{" "}vs <code>defaultValue</code>{" "}is the literal switch.
        </Callout>
      </section>

      <section>
        <h2>Controlled, React holds the dial reading</h2>
        <p>
          A controlled input binds the field&apos;s <code>value</code>{" "}to React state and updates that state on every <code>onChange</code>. The data flows in a loop: state → <code>value</code>{" "}→ user types → <code>onChange</code>{" "}→ <code>setState</code>{" "}→ re-render → new <code>value</code>.
        </p>
        <pre><code>{`function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // The values already live in state — just use them.
    login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={!email || !password}>Log in</button>
    </form>
  );
}`}</code></pre>
        <p>
          Read that closely. Every single keystroke does a full round-trip: the keypress fires <code>onChange</code>, you call <code>setEmail</code>, React re-renders, and the input&apos;s <code>value</code>{" "}is set from the fresh state. The character you see on screen was put there <em>by React</em>, not by the browser&apos;s default typing behavior.
        </p>
        <p>
          That round-trip is what buys you power. Because state changes on every keystroke, you can react to every keystroke:
        </p>
        <ul>
          <li><strong>Live validation</strong>,{" "}show &quot;invalid email&quot;{" "}the moment it stops looking like an email.</li>
          <li><strong>Formatting as you type</strong>,{" "}insert dashes into a phone number, force uppercase, strip non-digits.</li>
          <li><strong>Conditional disabling</strong>,{" "}the <code>disabled={"{!email || !password}"}</code>{" "}above re-evaluates every keystroke.</li>
          <li><strong>Dependent fields</strong>,{" "}filter the &quot;city&quot;{" "}dropdown based on what&apos;s typed in &quot;country.&quot;</li>
        </ul>
        <Callout variant="insight" title="Single source of truth">
          With a controlled input, the value on screen <em>cannot</em>{" "}drift from React state, they&apos;re the same fact. That&apos;s the whole point: predictable, testable, always-in-sync UI. The cost is a re-render per keystroke.
        </Callout>
      </section>

      <Checkpoint id="cp-who-owns-the-value" moduleSlug={MODULE_SLUG} title="Who owns the value, React state or the DOM">
        <Quiz
          kind="Quick check"
          question="In a controlled input written as `value={name}` + `onChange={e => setName(e.target.value)}`, who is the single source of truth for what's displayed?"
          options={[
            { label: "React state (`name`). The DOM input just mirrors it every render.", correct: true, explanation: "Right, `value` is set from state on every render, so React state owns the displayed value. The DOM is a display surface." },
            { label: "The browser's internal input value; React just listens.", explanation: "Wrong, that describes an uncontrolled input. With `value={name}`, React forces the displayed value to match state." },
            { label: "Both equally, they stay in sync automatically with no code.", explanation: "Wrong, they stay in sync only *because* of the onChange→setState→re-render loop you wrote. Remove onChange and they diverge (the field freezes)." },
            { label: "Whichever updated most recently.", explanation: "Wrong, there's no race. Each render, React overwrites the displayed value with state. State is authoritative." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You need the 'Submit' button to disable itself the instant either field is empty. Controlled or uncontrolled?"
          options={[
            { label: "Controlled, you need to react to every keystroke, so the value must live in state.", correct: true, explanation: "Right, 'disable on every keystroke' means you must re-evaluate on each change, which requires the value in state (`disabled={!a || !b}`)." },
            { label: "Uncontrolled, refs are faster.", explanation: "Wrong, refs don't notify you on change, so you'd never know when to re-enable the button without extra hacks. This is exactly the controlled use case." },
            { label: "Either works identically.", explanation: "Wrong, uncontrolled inputs don't trigger a re-render on input, so the button's disabled state wouldn't update live." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The classic bug, <code>value</code>{" "}with no <code>onChange</code></h2>
        <p>
          This is the single most common controlled-input mistake, and a favorite interview &quot;spot the bug&quot;:
        </p>
        <pre><code>{`// 🐛 The field is frozen. You can't type into it.
function NameField() {
  const [name, setName] = useState("");
  return <input value={name} />;  // value but no onChange!
}`}</code></pre>
        <p>
          You click the input, you mash the keyboard, and <em>nothing appears</em>. The field is read-only, and React logs a warning in the console:
        </p>
        <pre><code>{`Warning: You provided a \`value\` prop to a form field without an
\`onChange\` handler. This will render a read-only field. If the field
should be mutable use \`defaultValue\`. Otherwise, set either \`onChange\`
or \`readOnly\`.`}</code></pre>
        <p>
          Here&apos;s exactly why. By passing <code>value={"{name}"}</code>{" "}you told React, &quot;you own this field, the displayed value is always state.&quot;{" "}So when you type, the browser tries to show the new character, but on the very next render React sets <code>value</code>{" "}back to <code>name</code>,{" "}which is still <code>&quot;&quot;</code>, because nothing ever called <code>setName</code>. React overwrites your keystroke immediately. You&apos;ve built a controlled input with the loop cut: state → value, but nothing flowing back. The dial is wired to the computer, but the dial isn&apos;t allowed to send messages.
        </p>
        <p>
          There are three valid fixes, and which one you pick reveals whether you actually understood the model:
        </p>
        <ul>
          <li><strong>Add the <code>onChange</code></strong>,{" "}if you genuinely want a controlled field. Close the loop: <code>{`onChange={e => setName(e.target.value)}`}</code>.</li>
          <li><strong>Switch to <code>defaultValue</code></strong>,{" "}if you don&apos;t need React to own the value. <code>{`<input defaultValue={name} />`}</code>{" "}makes it uncontrolled; the DOM owns it and the user can type freely.</li>
          <li><strong>Add <code>readOnly</code></strong>,{" "}if you genuinely want a non-editable display: <code>{`<input value={name} readOnly />`}</code>. This silences the warning by stating the field is intentionally locked.</li>
        </ul>
        <Callout variant="warn" title="The mental check">
          The moment you write <code>value=</code>{" "}on an input, ask: &quot;where&apos;s my <code>onChange</code>?&quot;{" "}A <code>value</code>{" "}with no way to update it is a frozen field, every time. If you don&apos;t want to manage the value in state, you wanted <code>defaultValue</code>, not <code>value</code>.
        </Callout>
      </section>

      <Checkpoint id="cp-frozen-field-bug" moduleSlug={MODULE_SLUG} title="The frozen-field bug, `value` with no `onChange`">
        <Quiz
          kind="Quick check"
          question="`<input value={name} />` with no onChange. The user types but nothing appears. Why?"
          options={[
            { label: "`value` makes it controlled, so each render React resets the displayed value to `name`, which never changes, because nothing calls setName. React overwrites every keystroke.", correct: true, explanation: "Right, you told React to own the value but never gave it a way to update. The field is effectively read-only; React even warns about exactly this." },
            { label: "`value` is the wrong prop name; it should be `defaultValue`.", explanation: "Not quite, `value` is a real, correct prop. It makes the input *controlled*. The bug is the missing onChange, not the prop name. (Switching to `defaultValue` IS one valid fix, though.)" },
            { label: "React inputs are read-only by default; you must add `editable`.", explanation: "Wrong, there's no `editable` prop. Plain inputs are editable; it's the `value` prop without `onChange` that locks this one." },
            { label: "The state needs to be initialized to something non-empty.", explanation: "Wrong, the initial value is irrelevant. Even initialized, with no onChange the field still can't be changed by the user." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You have `<input value={code} />` and you want the user to be able to type into it. Which fix keeps it CONTROLLED?"
          options={[
            { label: "Add `onChange={e => setCode(e.target.value)}`.", correct: true, explanation: "Right, adding onChange closes the controlled loop: state still owns the value, but now keystrokes flow back into state." },
            { label: "Change `value` to `defaultValue`.", explanation: "That fixes the freeze, but it makes the input *uncontrolled*, the DOM owns the value now, not state. The question asked to keep it controlled." },
            { label: "Add `readOnly`.", explanation: "Wrong, `readOnly` silences the warning but the field stays non-editable. The user still can't type." },
            { label: "Remove the `value` prop entirely.", explanation: "That makes it fully uncontrolled with no initial value, not 'keep it controlled.'" },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Uncontrolled, the DOM keeps its own number</h2>
        <p>
          An uncontrolled input lets the DOM own the value. You don&apos;t pass <code>value</code>; you optionally pass <code>defaultValue</code>{" "}for the <em>initial</em>{" "}content, and you read the current value from a ref when you actually need it, usually on submit.
        </p>
        <pre><code>{`function LoginForm() {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    // Walk over and read the dial — only now do we look.
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    login(email, password);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef} defaultValue="" />
      <input ref={passwordRef} type="password" defaultValue="" />
      <button>Log in</button>
    </form>
  );
}`}</code></pre>
        <p>
          Notice what&apos;s <em>missing</em>: there&apos;s no state, no <code>onChange</code>, and no re-render while the user types. The browser handles typing the way it always has. React only finds out what was typed at the moment you read <code>emailRef.current.value</code>. Between renders, you have no idea what&apos;s in the field, and that&apos;s fine, because you don&apos;t need to know until submit.
        </p>
        <p>
          Two important details:
        </p>
        <ul>
          <li><code>defaultValue</code>{" "}(not <code>value</code>) sets the initial content. <code>defaultValue</code>{" "}is only read on the first render; changing it later won&apos;t update the field, because the DOM owns it now.</li>
          <li>The same applies to checkboxes/radios: use <code>defaultChecked</code>, not <code>checked</code>, for the uncontrolled version.</li>
        </ul>
        <Callout variant="info" title="File inputs are ALWAYS uncontrolled">
          <code>&lt;input type=&quot;file&quot;&gt;</code>{" "}cannot be controlled, its value is read-only for security reasons (you can&apos;t programmatically set which file a user picked). You always read it from a ref: <code>fileRef.current.files</code>. If an interviewer asks &quot;name an input that must be uncontrolled,&quot;{" "}this is the answer.
        </Callout>
      </section>

      <section>
        <h2>The tradeoffs, felt, not memorized</h2>
        <p>
          Both approaches produce a working login form. The difference is what each one costs and what each one enables. Here&apos;s the honest comparison:
        </p>
        <ul>
          <li>
            <strong>Source of truth.</strong>{" "}Controlled: React state. Uncontrolled: the DOM node.
          </li>
          <li>
            <strong>Re-renders.</strong>{" "}Controlled: one per keystroke (each character round-trips through state). Uncontrolled: zero while typing, the component renders once and the browser handles the rest.
          </li>
          <li>
            <strong>Access to the value.</strong>{" "}Controlled: always available in state, any time, any render. Uncontrolled: only when you read the ref (typically on submit), you can&apos;t &quot;watch&quot;{" "}it change.
          </li>
          <li>
            <strong>Live validation / formatting / dependent fields.</strong>{" "}Controlled: easy and natural, you&apos;re already running code on every change. Uncontrolled: awkward, you&apos;d have to bolt an <code>onChange</code>{" "}back on, at which point you&apos;re basically controlled anyway.
          </li>
          <li>
            <strong>Boilerplate.</strong>{" "}Controlled: a state + setter per field. Uncontrolled: a ref per field, less wiring. For a 30-field form, uncontrolled (or a form library) is dramatically less code.
          </li>
          <li>
            <strong>Performance on big forms.</strong>{" "}Controlled: every keystroke re-renders the whole form tree (mitigable, but real). Uncontrolled: no per-keystroke renders, so large forms stay snappy by default.
          </li>
        </ul>
        <Callout variant="insight" title="Why form libraries exist">
          Libraries like React Hook Form lean <em>uncontrolled</em>{" "}by default precisely to avoid per-keystroke re-renders on large forms, then layer validation on top via refs and subscriptions. That&apos;s the &quot;or a form library&quot;{" "}escape hatch: it gives you uncontrolled performance with controlled-feeling ergonomics.
        </Callout>
      </section>

      <section>
        <h2>The decision rule interviewers want</h2>
        <p>
          Don&apos;t recite a list of pros and cons. Lead with the rule, then justify it:
        </p>
        <Callout variant="insight" title="The rule">
          If you need to <strong>react to every keystroke</strong>,{" "}live validation, formatting as you type, fields that depend on each other, or disabling submit based on input, use <strong>controlled</strong>. Otherwise (a simple form you only read on submit), <strong>uncontrolled</strong>{" "}or a form library is perfectly fine, and lighter.
        </Callout>
        <p>
          The reasoning behind it: controlled is the only approach where React knows the value on every change, so anything that has to <em>respond</em>{" "}to changes needs it. If nothing responds to changes, you just collect values and submit, then paying a re-render per keystroke buys you nothing, and uncontrolled is the simpler, faster default.
        </p>
        <p>
          A senior answer adds the nuance: most production apps default to controlled for the predictability and reach for uncontrolled (or a library) when forms get large enough that per-keystroke renders hurt, and that <code>&lt;input type=&quot;file&quot;&gt;</code>{" "}is uncontrolled no matter what you prefer.
        </p>
      </section>

      <Checkpoint id="cp-the-decision-rule" moduleSlug={MODULE_SLUG} title="The decision rule + when uncontrolled wins">
        <Quiz
          kind="Scenario"
          question="A simple newsletter form: one email field, a submit button. No live validation, no formatting, you only need the value when the user clicks 'Subscribe.' Which is the better default?"
          options={[
            { label: "Uncontrolled, you only need the value on submit, so a ref is simpler and avoids a re-render per keystroke.", correct: true, explanation: "Right, nothing reacts to changes mid-typing, so controlled state buys nothing here. Read the ref on submit. (Controlled isn't *wrong*, just heavier than needed.)" },
            { label: "Controlled, always use controlled; uncontrolled is legacy.", explanation: "Wrong, uncontrolled is not legacy; it's the right call when you don't need to react to keystrokes. File inputs are even *required* to be uncontrolled." },
            { label: "Neither, use `document.querySelector` to grab the value.", explanation: "Wrong, reaching into the DOM by hand bypasses React's ref system. Use a ref; that *is* the uncontrolled pattern done correctly." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="Which of these absolutely CANNOT be a controlled input?"
          options={[
            { label: "`<input type=\"file\">`, its value is read-only for security, so you must read selected files from a ref.", correct: true, explanation: "Right, you can't programmatically set which file the user picked, so file inputs are always uncontrolled. Classic interview gotcha." },
            { label: "`<input type=\"password\">`", explanation: "Wrong, password inputs control fine; they're just text inputs with masked display." },
            { label: "`<input type=\"checkbox\">`", explanation: "Wrong, checkboxes control via `checked` + `onChange` (the uncontrolled version uses `defaultChecked`)." },
            { label: "`<textarea>`", explanation: "Wrong, textareas control fine via `value` + `onChange`, same as text inputs." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li>Every input is owned by <strong>someone</strong>: React state (controlled) or the DOM node (uncontrolled). There&apos;s no third option.</li>
          <li><strong>Controlled</strong>{" "}= <code>value={"{state}"}</code>{" "}+ <code>{`onChange={e => setState(e.target.value)}`}</code>. React is the single source of truth; every keystroke round-trips through state.</li>
          <li><strong>Uncontrolled</strong>{" "}= <code>defaultValue</code>{" "}+ a <code>ref</code>; the DOM owns the value and you read <code>ref.current.value</code>{" "}on submit.</li>
          <li><code>value</code>{" "}with <strong>no</strong>{" "}<code>onChange</code>{" "}= a <strong>frozen, read-only field</strong>{" "}(React warns). Fix: add <code>onChange</code>, switch to <code>defaultValue</code>, or add <code>readOnly</code>.</li>
          <li>Controlled gives instant validation / formatting / conditional-disable, but re-renders every keystroke. Uncontrolled is simpler and faster for big forms, but you only see the value when you read it.</li>
          <li><strong>The rule:</strong>{" "}need to react to every keystroke → controlled. Otherwise → uncontrolled (or a form library).</li>
          <li><code>&lt;input type=&quot;file&quot;&gt;</code>{" "}is <strong>always</strong>{" "}uncontrolled.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Build the same login form twice, then write down the tradeoffs you actually <em>felt</em>,{" "}not the ones you read here.
        </p>
        <ol>
          <li>Build a <strong>controlled</strong>{" "}login form: an email field and a password field, each as <code>value</code>{" "}+ <code>onChange</code>{" "}bound to <code>useState</code>. On submit, <code>console.log</code>{" "}the values (they&apos;re already in state).</li>
          <li>Add a live touch only controlled makes easy: <code>{`disabled={!email || !password}`}</code>{" "}on the submit button, and a red &quot;invalid email&quot;{" "}message that appears the instant the email stops matching a basic pattern. Notice you got this almost for free.</li>
          <li>Now build the <strong>uncontrolled</strong>{" "}version of the same form: two <code>useRef</code>s, <code>defaultValue=&quot;&quot;</code>{" "}on each input, and read <code>emailRef.current.value</code>{" "}/ <code>passwordRef.current.value</code>{" "}in the submit handler. Confirm it logs the same thing.</li>
          <li>Try to add the live &quot;disable submit when empty&quot;{" "}behavior to the uncontrolled version <em>without</em>{" "}adding state. Feel how awkward it gets, that friction <em>is</em>{" "}the lesson about when controlled wins.</li>
          <li>Reproduce the bug on purpose: write <code>{`<input value={email} />`}</code>{" "}with no <code>onChange</code>, open the console, and read React&apos;s warning. Then fix it three different ways (add <code>onChange</code>, switch to <code>defaultValue</code>, add <code>readOnly</code>) and note how each changes who owns the value.</li>
          <li><em>Stretch:</em>{" "}add an <code>{`<input type="file">`}</code>{" "}and try to control it with <code>value</code>. Watch it refuse. Read the selected file via <code>fileRef.current.files</code>{" "}instead, and you&apos;ll never forget that file inputs are always uncontrolled.</li>
        </ol>
        <p>
          When you&apos;re done, you should be able to answer, out loud, in under a minute, who owns the value in each version, why a <code>value</code>{" "}with no <code>onChange</code>{" "}freezes the field, and the one-sentence rule for choosing between them.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
