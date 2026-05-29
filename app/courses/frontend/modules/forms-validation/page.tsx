import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "forms-validation";

const CHECKPOINTS = [
  { id: "cp-validation-timing", title: "Validation timing & error-message UX" },
  { id: "cp-touched-dirty-handrolled", title: "touched / dirty / error tracking & the hand-rolled form" },
  { id: "cp-rhf-and-schema", title: "react-hook-form + schema validation" },
];

export default function FormsValidationModule() {
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
          Form state &amp; validation — timing, errors, and when to reach for a library
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A form that screams &quot;Email is required!&quot;{" "}the instant it renders — before you&apos;ve typed a single character — isn&apos;t validating. It&apos;s nagging. The whole craft of forms is <em>when</em>{" "}you say something, not just <em>what</em>{" "}you say.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy — validation timing is bedside manner</h2>
        <p>
          Imagine three doctors. The first one starts diagnosing you the moment you walk through the door, before you&apos;ve described a single symptom — &quot;You look unwell, here&apos;s what&apos;s wrong with you.&quot;{" "}The second waits until you finish a sentence, then responds. The third lets you say everything, then gives one considered summary at the end.
        </p>
        <p>
          That&apos;s validation timing. <strong>On-change from the start</strong>{" "}is the first doctor — it yells &quot;required&quot;{" "}at an empty field the user hasn&apos;t even reached yet. <strong>On-blur</strong>{" "}is the second — it waits until you leave the field, then checks what you typed. <strong>On-submit</strong>{" "}is the third — it stays quiet until you commit, then reports everything at once.
        </p>
        <p>
          None of them is &quot;more correct.&quot;{" "}The rules being checked are identical. What changes is the felt experience — and the felt experience is most of what a form&apos;s quality actually is.
        </p>
        <Callout variant="insight" title="The one-line definition">
          Validation logic answers <em>is this value valid?</em>{" "}Validation <em>timing</em>{" "}answers <em>when do I tell the user?</em>{" "}They are separate decisions, and the timing decision is where the UX lives.
        </Callout>
      </section>

      <section>
        <h2>The three timings and their UX</h2>
        <p>
          You have three moments to choose from. In practice you blend them, but it helps to see each one cleanly first.
        </p>
        <ul>
          <li>
            <strong>On submit</strong>{" "}— the quietest. The form says nothing until the user clicks the button, then validates every field at once and shows all errors together. Pros: zero noise while typing, the user is never interrupted. Cons: the user can fill out ten fields and only learn at the very end that field two was wrong. Good as a <em>backstop</em>{" "}(you always re-validate on submit regardless), rarely good as the <em>only</em>{" "}strategy.
          </li>
          <li>
            <strong>On blur</strong>{" "}— the usual sweet spot. A field is validated the moment the user leaves it (the <code>blur</code>{" "}event). This matches intent: &quot;I&apos;m done with this field, tell me if I got it wrong.&quot;{" "}The user is never interrupted mid-thought, but they also don&apos;t have to wait until the end. This is the default you should reach for.
          </li>
          <li>
            <strong>On change</strong>{" "}— live, on every keystroke. Excellent for <em>positive, continuous</em>{" "}feedback: a password-strength meter filling up, a username availability check, a character counter. Annoying for <em>negative</em>{" "}feedback: erroring &quot;invalid email&quot;{" "}after the user types <code>a</code>{" "}— of course it&apos;s invalid, they&apos;re three characters in.
          </li>
        </ul>
        <p>
          The pattern most production forms converge on: <strong>validate on blur first; once a field has errored, switch that field to on-change</strong>. The reasoning is subtle and worth internalizing — before the first error, on-change would be premature nagging. But <em>after</em>{" "}you&apos;ve told the user &quot;this is wrong,&quot;{" "}they want to see the error clear the instant they fix it. Waiting for another blur to confirm the fix feels broken.
        </p>
        <pre><code>{`// "reValidateMode" captures exactly this idea:
//   validate on blur (or submit) the first time,
//   then re-validate on change once an error exists.
//
//   field clean  → check on blur
//   field errored → check on every keystroke (so the error clears live)`}</code></pre>
        <Callout variant="info" title="Submit is always the backstop">
          Whatever live strategy you pick, you re-validate <em>everything</em>{" "}on submit anyway. A field the user never touched could still be empty and required. On-blur and on-change are about <em>experience</em>; on-submit is about <em>correctness</em>{" "}— it&apos;s the gate nothing gets past.
        </Callout>
      </section>

      <section>
        <h2>Error-message UX — say the right thing, in the right place</h2>
        <p>
          Timing decides <em>when</em>. The message itself still matters:
        </p>
        <ul>
          <li><strong>Be specific.</strong>{" "}&quot;Invalid&quot;{" "}is useless. &quot;Email must include an @&quot;{" "}or &quot;Password must be at least 8 characters&quot;{" "}tells the user how to fix it.</li>
          <li><strong>Anchor it to the field.</strong>{" "}Show the message directly beneath the input it belongs to, not in a summary banner far away. Wire it up with <code>aria-describedby</code>{" "}and <code>aria-invalid</code>{" "}so screen readers announce the error when the field is focused.</li>
          <li><strong>Don&apos;t move the layout.</strong>{" "}Reserve space for the message or use a non-shifting reveal, so the page doesn&apos;t jump when an error appears.</li>
          <li><strong>Clear it the moment it&apos;s fixed.</strong>{" "}This is the whole reason for the blur-then-change switch above.</li>
        </ul>
      </section>

      <Checkpoint id="cp-validation-timing" moduleSlug={MODULE_SLUG} title="Validation timing & error-message UX">
        <Quiz
          kind="Scenario"
          question="A user is three characters into typing their email and your form already shows 'Invalid email address' in red. Which validation timing is causing this, and what's the usual fix?"
          options={[
            { label: "On-submit; fix by validating earlier.", explanation: "Wrong — on-submit stays silent until the button is clicked, so it could never error mid-typing. This is the opposite problem." },
            { label: "On-change from the start; fix by validating on blur first, then switching to on-change only after the field has errored.", correct: true, explanation: "Right — erroring on every keystroke before the user finishes is premature. Validate on blur, and only go live (on-change) once an error exists so it clears as they fix it." },
            { label: "On-blur; fix by removing the blur handler.", explanation: "Wrong — on-blur fires when the user leaves the field, not while typing. If it errors mid-typing, it isn't on-blur." },
            { label: "It's a React batching bug, unrelated to timing.", explanation: "Wrong — batching affects how many renders happen, not when validation messages appear. This is purely a timing-strategy choice." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="Why do production forms still re-validate every field on submit, even when they already validate on blur as the user goes?"
          options={[
            { label: "Blur validation is unreliable and often misfires.", explanation: "Wrong — blur fires reliably. The issue isn't reliability." },
            { label: "A field the user never visited never blurred, so it was never checked — submit is the backstop that catches untouched required fields.", correct: true, explanation: "Right — on-blur only checks fields the user actually left. Submit re-validates everything, including fields that were never touched, so nothing invalid slips through." },
            { label: "React requires a submit-time validation pass.", explanation: "Wrong — React imposes no such rule. This is a UX/correctness decision, not a framework constraint." },
            { label: "To reset the touched state.", explanation: "Wrong — submit-time validation is about correctness (catching untouched fields), not about resetting touched flags." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>touched / dirty / error — the three flags you actually need</h2>
        <p>
          To do on-blur validation well, you have to track more than just the value. Three pieces of per-field metadata do almost all the work:
        </p>
        <ul>
          <li><strong>touched</strong>{" "}— has the user interacted with (and left) this field yet? Set it on blur. This is the gate for <em>showing</em>{" "}errors: don&apos;t display &quot;required&quot;{" "}on a field the user has never touched.</li>
          <li><strong>dirty</strong>{" "}— has the value changed from its initial value? Useful for &quot;you have unsaved changes&quot;{" "}prompts, for enabling a Save button only when something actually changed, and for resetting cleanly.</li>
          <li><strong>error</strong>{" "}— the current validation message for this field (or none). Computed by the validate function; what you render beneath the input.</li>
        </ul>
        <p>
          The critical combination: <strong>show an error only when the field is both touched <em>and</em>{" "}has an error</strong>. That single rule is why a fresh form is calm instead of a wall of red.
        </p>
        <pre><code>{`// The display rule, distilled:
const showError = touched[name] && errors[name];

// touched  → "the user has been here and left"
// dirty    → "the value differs from the initial value"
// error    → "this value currently fails a rule"
//
// Validity exists from the first render.
// Whether you SHOW it is gated by touched.`}</code></pre>
        <Callout variant="warn" title="touched is about display, not correctness">
          A field can be invalid and untouched at the same time — that&apos;s the normal initial state of any required field. <code>touched</code>{" "}doesn&apos;t change whether the value is valid; it only decides whether it&apos;s polite to mention it yet. Confusing the two is how forms end up red on first paint.
        </Callout>
      </section>

      <section>
        <h2>The hand-rolled form — what it actually takes</h2>
        <p>
          Let&apos;s build the on-blur sign-up form by hand so you feel every moving part. You need four pieces of state-shaped logic: the <strong>values</strong>{" "}object, the <strong>errors</strong>{" "}object, the <strong>touched</strong>{" "}object, and a <strong>validate</strong>{" "}function. Then a <strong>submit gate</strong>{" "}that won&apos;t let an invalid form through.
        </p>
        <pre><code>{`function SignUpForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  function validate(vals) {
    const next = {};
    if (!vals.email) next.email = "Email is required.";
    else if (!vals.email.includes("@")) next.email = "Email must include an @.";
    if (!vals.password) next.password = "Password is required.";
    else if (vals.password.length < 8) next.password = "Password must be at least 8 characters.";
    return next;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    // re-validate live only AFTER this field has already errored once
    if (touched[name]) setErrors(validate(nextValues));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    // mark everything touched so all errors become visible
    setTouched({ email: true, password: true });
    if (Object.keys(found).length > 0) return; // submit gate
    // ...actually submit
  }

  const isInvalid = Object.keys(validate(values)).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!(touched.email && errors.email)}
      />
      {touched.email && errors.email && <p role="alert">{errors.email}</p>}

      <input
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!(touched.password && errors.password)}
      />
      {touched.password && errors.password && <p role="alert">{errors.password}</p>}

      {/* submit gate: disabled until the form is valid */}
      <button type="submit" disabled={isInvalid}>Sign up</button>
    </form>
  );
}`}</code></pre>
        <p>
          Read that carefully. Every behavior we discussed is in there: blur sets <code>touched</code>{" "}and validates; change re-validates only once the field is already touched; submit marks everything touched, runs the full validation, and <em>gates</em>{" "}— it returns early if any error exists. The button is also disabled while invalid as a second layer of the gate.
        </p>
        <Callout variant="info" title="The submit gate has two forms">
          You can <em>disable</em>{" "}the submit button while the form is invalid (clear affordance, but a disabled button is unfriendly to keyboard/AT users and hides <em>why</em>). Or you can let submit fire and <em>block inside the handler</em>, surfacing all errors at once. The robust choice is to do the block-in-handler version always, and optionally add the disabled state on top.
        </Callout>
      </section>

      <Checkpoint id="cp-touched-dirty-handrolled" moduleSlug={MODULE_SLUG} title="touched / dirty / error tracking & the hand-rolled form">
        <Quiz
          kind="Quick check"
          question="In the hand-rolled form, what's the purpose of the `touched` object specifically?"
          options={[
            { label: "It stores the validation rules for each field.", explanation: "Wrong — the rules live in the `validate` function. `touched` stores no rules." },
            { label: "It records whether the user has interacted with and left a field, so errors are only shown after interaction.", correct: true, explanation: "Right — `touched[name]` gates display. A required field is invalid from the start, but you don't show that error until the user has touched the field (or hit submit, which marks all fields touched)." },
            { label: "It tracks whether the value differs from the initial value.", explanation: "That's `dirty`, not `touched`. Dirty is about value-changed; touched is about interaction." },
            { label: "It caches the previous render's values for diffing.", explanation: "Wrong — that's not what touched does. It's a per-field boolean about user interaction." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="Your submit handler runs `validate`, finds an error, but the form submits anyway. Looking at the hand-rolled example, what's the most likely missing piece?"
          options={[
            { label: "You forgot to set `touched`.", explanation: "That would hide the error message, but it wouldn't let an invalid form submit. The gate is separate from display." },
            { label: "You forgot the early `return` when errors exist — the submit gate. Computing errors isn't enough; you must stop the submit path when any exist.", correct: true, explanation: "Right — the gate is `if (Object.keys(found).length > 0) return;`. Without it, you compute errors and then submit anyway. Validation only gates if you actually branch on the result." },
            { label: "You forgot `e.preventDefault()`.", explanation: "Missing preventDefault causes a full page reload, not a 'submitted despite errors' bug. Related, but not the gate." },
            { label: "`validate` should be async.", explanation: "Wrong — sync validation is fine here. Async matters only for server-side checks; it's unrelated to the missing gate." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Why hand-rolled forms rot</h2>
        <p>
          The example above is fine for two fields. The problem is that it doesn&apos;t scale — and the decay is the kind that creeps up on you:
        </p>
        <ul>
          <li><strong>Boilerplate multiplies per field.</strong>{" "}Every new input means another entry in values, another branch in <code>validate</code>, another <code>onChange</code>/<code>onBlur</code>/<code>aria-invalid</code>{" "}wiring, another conditional error paragraph. Ten fields and the JSX is a swamp.</li>
          <li><strong>Re-renders on every keystroke.</strong>{" "}Because the inputs are <em>controlled</em>{" "}(value driven by state, <code>onChange</code>{" "}writing back to state), typing one character re-renders the entire form component. With one input it&apos;s invisible; with a large form and live validation it becomes laggy.</li>
          <li><strong>Validation logic scatters.</strong>{" "}Rules end up split between the <code>validate</code>{" "}function, inline JSX conditionals, the submit handler, and maybe HTML attributes. There&apos;s no single source of truth for &quot;what makes this form valid.&quot;</li>
          <li><strong>State synchronization bugs.</strong>{" "}Keeping values, errors, and touched in lockstep — especially across reset, async defaults, and field arrays — is exactly the kind of manual bookkeeping that breeds subtle bugs.</li>
        </ul>
        <p>
          None of these is fatal alone. Together, they&apos;re the reason &quot;just use <code>useState</code>&quot;{" "}stops being the right answer somewhere around the third or fourth real form. That&apos;s the cue to reach for a library.
        </p>
        <Callout variant="warn" title="Controlled inputs re-render on every keystroke">
          This is the big one. A controlled input&apos;s value lives in React state, so each keystroke calls <code>setState</code>{" "}→ re-renders the component (and its children) → re-runs any inline validation. The cost is real on large forms. The library fix isn&apos;t cleverer state — it&apos;s getting the keystrokes <em>out</em>{" "}of React state entirely.
        </Callout>
      </section>

      <section>
        <h2>What react-hook-form actually buys you</h2>
        <p>
          The headline trick of <a href="https://react-hook-form.com" className="text-cyan-600 hover:underline">react-hook-form</a>{" "}(RHF) is that it makes inputs <strong>uncontrolled</strong>. Instead of binding each input&apos;s value to React state, you <code>register</code>{" "}the input — RHF attaches a <code>ref</code>{" "}and reads the value straight from the DOM when it needs it. Keystrokes no longer flow through React state, so typing <em>doesn&apos;t re-render your component at all</em>.
        </p>
        <ul>
          <li><strong>Uncontrolled via <code>register</code></strong>{" "}— refs, not state. The single biggest reason RHF forms re-render so little.</li>
          <li><strong>A subscription model</strong>{" "}— components subscribe only to the slices of form state they actually read. A field&apos;s error paragraph re-renders when <em>that</em>{" "}field&apos;s error changes, not when any keystroke happens anywhere. This is why even error display is cheap.</li>
          <li><strong>Built-in touched / dirty / errors</strong>{" "}— all the bookkeeping from the hand-rolled version comes for free in <code>formState</code>.</li>
          <li><strong>Resolver integration</strong>{" "}— plug in a schema validator (zod, yup, valibot) so your validation is one declarative schema instead of an imperative <code>validate</code>{" "}function.</li>
        </ul>
        <p>
          In a real project you&apos;d install it: <code>npm i react-hook-form</code>. Here&apos;s the same sign-up form, dramatically smaller:
        </p>
        <pre><code>{`import { useForm } from "react-hook-form";

function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isDirty },
  } = useForm({
    mode: "onBlur",          // validate on blur...
    reValidateMode: "onChange", // ...then live once errored
  });

  const onSubmit = (data) => {
    // RHF only calls this if validation passes — the gate is built in
    // data = { email, password }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        {...register("email", {
          required: "Email is required.",
          pattern: { value: /@/, message: "Email must include an @." },
        })}
        aria-invalid={!!errors.email}
      />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <input
        type="password"
        {...register("password", {
          required: "Password is required.",
          minLength: { value: 8, message: "Password must be at least 8 characters." },
        })}
        aria-invalid={!!errors.password}
      />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <button type="submit">Sign up</button>
    </form>
  );
}`}</code></pre>
        <p>
          Notice what disappeared: no <code>values</code>{" "}state, no <code>onChange</code>/<code>onBlur</code>{" "}handlers, no manual <code>touched</code>{" "}object, no submit gate (<code>handleSubmit</code>{" "}only calls <code>onSubmit</code>{" "}if validation passes), no spread-update bookkeeping. The <code>mode</code>{" "}and <code>reValidateMode</code>{" "}options encode the blur-then-change pattern declaratively. And because inputs are uncontrolled, typing into <code>email</code>{" "}doesn&apos;t re-render the component.
        </p>
        <Callout variant="insight" title="The mental shift">
          The hand-rolled form pushes every keystroke <em>into</em>{" "}React. RHF keeps keystrokes <em>out</em>{" "}of React (in the DOM, via refs) and only notifies the specific subscribers that care about a given slice of form state. Fewer re-renders isn&apos;t an optimization bolted on — it&apos;s a consequence of the uncontrolled + subscription design.
        </Callout>
      </section>

      <section>
        <h2>Schema validation — zod + resolver as the modern default</h2>
        <p>
          The inline RHF rules (<code>required</code>, <code>pattern</code>, <code>minLength</code>) are fine for small forms, but they still scatter validation across each <code>register</code>{" "}call. The modern default is to define one <strong>schema</strong>{" "}— a single declarative source of truth for both the <em>shape</em>{" "}of the data and the <em>messages</em>{" "}— and hand it to RHF via a resolver.
        </p>
        <pre><code>{`import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type SignUpValues = z.infer<typeof SignUpSchema>;

function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: SignUpValues) => {
    // data is fully typed AND already validated against the schema
  };
  // ...same JSX as before
}`}</code></pre>
        <p>
          Why this is the default now:
        </p>
        <ul>
          <li><strong>One source of truth.</strong>{" "}The schema defines shape <em>and</em>{" "}messages in one place. Add a field, add a line — validation, types, and messages all update together.</li>
          <li><strong>Types for free.</strong>{" "}<code>z.infer</code>{" "}derives the TypeScript type from the schema, so your form data and your validation can never drift apart.</li>
          <li><strong>Reusable on the server.</strong>{" "}The same zod schema can validate the request on the backend. Client and server share one definition of &quot;valid&quot;{" "}— no duplicated, drifting rules.</li>
        </ul>
        <Callout variant="info" title="Resolver is the seam">
          The resolver (<code>zodResolver</code>, <code>yupResolver</code>, etc.) is just an adapter: it takes the form values, runs them through your schema, and returns RHF-shaped errors. That seam is why RHF doesn&apos;t care which validation library you use — swap the resolver, keep the form.
        </Callout>
      </section>

      <Checkpoint id="cp-rhf-and-schema" moduleSlug={MODULE_SLUG} title="react-hook-form + schema validation">
        <Quiz
          kind="Quick check"
          question="What is the primary reason a react-hook-form form re-renders far less than the equivalent hand-rolled controlled form?"
          options={[
            { label: "RHF memoizes the component with React.memo automatically.", explanation: "Wrong — RHF doesn't auto-wrap your component in memo. The savings come from a different mechanism." },
            { label: "Inputs are uncontrolled (registered via refs), so keystrokes are read from the DOM instead of flowing through React state — typing doesn't trigger re-renders.", correct: true, explanation: "Right — `register` attaches a ref and reads values from the DOM. Keystrokes don't call setState, so the component doesn't re-render on every character. The subscription model further limits which parts update." },
            { label: "RHF debounces every onChange by default.", explanation: "Wrong — there's no hidden debounce. Even without debouncing, uncontrolled inputs simply don't push keystrokes through React state." },
            { label: "RHF runs validation on a web worker.", explanation: "Wrong — validation runs on the main thread. The re-render savings are about uncontrolled inputs and subscriptions, not threading." },
          ]}
        />
        <Quiz
          kind="Scenario"
          question="You want one definition of 'valid' shared between your sign-up form and the API route that receives the data, plus TypeScript types that can't drift from the rules. What's the idiomatic setup?"
          options={[
            { label: "Duplicate the inline `register` rules in both the form and the API handler.", explanation: "Wrong — duplicated rules drift apart over time, which is exactly the problem you're trying to avoid." },
            { label: "Define a zod schema, use it via zodResolver in the form and to parse the request on the server, and derive the type with z.infer.", correct: true, explanation: "Right — one zod schema is the single source of truth for shape and messages, the resolver wires it into RHF, the server reuses the same schema, and z.infer keeps the type in sync automatically." },
            { label: "Write a shared `validate(values)` function and call it manually in both places.", explanation: "Better than duplication, but it doesn't give you derived types or RHF integration. A schema does all three (validation, types, resolver) in one artifact." },
            { label: "Rely on HTML5 `required`/`pattern` attributes on both sides.", explanation: "Wrong — HTML5 validation runs only in the browser, gives weak messages, and provides no types or server-side reuse." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong>Timing is the UX.</strong>{" "}On-submit = quiet backstop; on-blur = the usual sweet spot; on-change = great for live positive feedback, annoying for premature errors.</li>
          <li>The pattern: <strong>validate on blur, then switch a field to on-change once it has errored</strong>{" "}so the error clears live as the user fixes it.</li>
          <li><strong>Always re-validate everything on submit</strong>{" "}— untouched required fields were never checked otherwise.</li>
          <li>Track <strong>touched</strong>{" "}(interacted &amp; left — gates whether you <em>show</em>{" "}errors), <strong>dirty</strong>{" "}(value changed from initial), and <strong>error</strong>{" "}(current message). Show an error only when <code>touched &amp;&amp; error</code>.</li>
          <li>Hand-rolled forms <strong>rot</strong>{" "}as fields multiply: per-field boilerplate, a re-render on every keystroke (controlled inputs), scattered rules, and sync bugs.</li>
          <li><strong>react-hook-form</strong>{" "}makes inputs <strong>uncontrolled</strong>{" "}via <code>register</code>{" "}(refs, not state) so typing doesn&apos;t re-render, uses a <strong>subscription</strong>{" "}model so only relevant slices update, and gives touched/dirty/errors for free.</li>
          <li><strong>zod + a resolver</strong>{" "}is the modern default: one schema is the single source of truth for shape, messages, and (via <code>z.infer</code>) types — reusable on the server.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <p>
          Build the sign-up form twice and <em>measure</em>{" "}the difference. The re-render count is the punchline.
        </p>
        <ol>
          <li>Build a hand-rolled sign-up form with <code>email</code>{" "}and <code>password</code>{" "}inputs. Use <code>values</code>, <code>errors</code>, and <code>touched</code>{" "}state objects and a <code>validate</code>{" "}function. Wire <strong>on-blur validation</strong>{" "}(set touched on blur, validate) and re-validate on change only once a field is touched.</li>
          <li>Add a <strong>submit gate</strong>: in <code>handleSubmit</code>, mark all fields touched, run <code>validate</code>, and <code>return</code>{" "}early if any error exists. Also disable the submit button while invalid.</li>
          <li>Drop a render counter into the form — e.g. <code>{`const renders = useRef(0); renders.current++;`}</code>{" "}— and log it. Type a 12-character password and watch the count climb one per keystroke.</li>
          <li>Re-implement the <em>same</em>{" "}form with <strong>react-hook-form</strong>: <code>useForm</code>{" "}with <code>mode: &quot;onBlur&quot;</code>{" "}and <code>reValidateMode: &quot;onChange&quot;</code>, <code>register</code>{" "}each input with its rules, and <code>handleSubmit(onSubmit)</code>. Render <code>formState.errors[field].message</code>{" "}beneath each input.</li>
          <li>Add the same render counter to the RHF version. Type the same 12-character password and compare: the controlled version re-renders on every keystroke; the RHF (uncontrolled) version barely re-renders at all.</li>
          <li><em>Stretch:</em>{" "}replace the inline RHF rules with a <strong>zod schema</strong>{" "}via <code>zodResolver</code>, and derive the form&apos;s type with <code>z.infer</code>. Confirm the messages and behavior are identical, but the rules now live in one schema.</li>
        </ol>
        <p>
          You should be able to explain — out loud — why on-blur-then-on-change is the sweet spot, why <code>touched</code>{" "}gates display but not validity, why controlled inputs re-render on every keystroke, and exactly what &quot;uncontrolled + subscriptions&quot;{" "}buys you in the re-render numbers you just measured.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
