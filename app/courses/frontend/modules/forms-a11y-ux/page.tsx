import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "forms-a11y-ux";

const CHECKPOINTS = [
  { id: "cp-labels", title: "Labels, grouping & input affordances" },
  { id: "cp-errors", title: "Tying errors to fields & announcing them" },
  { id: "cp-timing-focus", title: "Validation timing & focus-on-error" },
];

export default function FormsA11yUxModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 8 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Accessible, usable forms — labels, errors, and announcing failures
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A form is where users hand you their effort — their name, their card, their password. The naive form looks fine
          and quietly fails the people who need it most: it labels nothing the browser can read, ties an error to nothing,
          and announces failure to no one. Let&apos;s build the version that actually works for everyone — and that an
          interviewer recognizes on sight.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The form sent through a closed door</h2>
        <p className="mb-4">
          Imagine filling out a paper form, except you can only slide it under a closed door and a clerk on the other side
          fills it in for you by feel. You can&apos;t point. You can&apos;t say &quot;the box near the top.&quot; The only way the clerk knows
          what a box is <em>for</em> is if the box is physically connected to its label — a printed caption stitched to that
          exact field. If the form just has grey hint text <em>inside</em> each box, the clerk is lost: the moment they
          start writing, the hint disappears, and they&apos;ve no idea whether they&apos;re in &quot;email&quot; or &quot;phone.&quot;
        </p>
        <p className="mb-4">
          That clerk is a screen reader. It builds an understanding of your form from the <em>programmatic</em> connections
          in the markup, not from where things happen to sit on screen. A <code>&lt;label&gt;</code> tied to an input by
          <code> id</code> is the stitched-on caption. A placeholder is the grey hint that vanishes — it is <strong>not a
          label</strong>, no matter how much it looks like one.
        </p>
        <p className="mb-4">
          And when something goes wrong — a rejected card, an email that&apos;s already taken — the sighted user sees the red
          box instantly. The clerk behind the door notices nothing unless you <em>tell</em> them: announce it, point them at
          the offending field, and connect the error message to that field so it&apos;s read out together. A red border alone is
          a message slid under a door with the lights off.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Accessible forms aren&apos;t a separate &quot;a11y pass&quot; you bolt on. They&apos;re the difference between a form that{" "}
            <em>looks</em> labeled and one that <em>is</em> labeled — between an error a screen-reader user can perceive and
            one that exists only as a color. Everything below follows from one idea: the relationships in your markup
            (label↔input, error↔input, summary↔field) are the real UI for anyone not using their eyes and a mouse.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE NAIVE FORM ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The form everyone ships first</h2>
        <p className="mb-4">
          Here&apos;s the form that lives in a thousand tutorials. It renders cleanly, it submits, it even shows errors in red.
          It looks done:
        </p>
        <pre><code>{`function SignUp() {
  const [error, setError] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" className={error ? "border-red-500" : ""} />
      <input placeholder="Password" type="password" />
      <button>Sign up</button>
    </form>
  );
}`}</code></pre>
        <p className="mb-4">
          It works most of the time for one kind of user, which is exactly why it survives review. But as a{" "}
          <em>default</em> it is broken, and here is the full list of what it quietly fails:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>No real labels.</strong> The placeholder is doing the labeling — so the field has <em>no accessible
            name</em> the moment the user types and the hint disappears. A screen reader announces &quot;edit text, blank.&quot;
          </li>
          <li>
            <strong>Tiny tap targets, wrong keyboards.</strong> A bare <code>&lt;input&gt;</code> with no{" "}
            <code>type</code>/<code>inputMode</code> gives mobile users a full QWERTY keyboard for an email and a fiddly,
            mis-sized hit area.
          </li>
          <li>
            <strong>The error is a color, nothing more.</strong> <code>border-red-500</code> conveys &quot;error&quot; to people who
            can see red. It carries no text, no programmatic state, and is invisible to assistive tech and to anyone with a
            color-vision difference.
          </li>
          <li>
            <strong>The error isn&apos;t tied to the field.</strong> Even if you render a message, nothing connects it to the
            input, so a screen reader reading the field never reads the reason it failed.
          </li>
          <li>
            <strong>Nothing is announced.</strong> An async submit failure updates some text far away; the screen-reader user,
            reading linearly, never learns the submit was rejected.
          </li>
          <li>
            <strong>No focus management.</strong> On a failed submit, focus stays on the button. The user has no idea which
            of five fields is wrong or where to go.
          </li>
        </ul>
        <Callout variant="warn" title="&quot;But the placeholder says Email&quot;">
          <p>
            A placeholder is hint text, not a label. It vanishes on input (so the user loses the context mid-typing), it
            often fails contrast (grey-on-white), and crucially it does <em>not</em> give the control a programmatic
            accessible name in a reliable, cross-screen-reader way. &quot;It says Email right there&quot; is true for exactly the
            user who least needs help.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. LABELS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Every input needs a programmatic label (this is the baseline)</h2>
        <p className="mb-4">
          The single most important fact about a form control: it must have an <strong>accessible name</strong>, and the
          robust way to give it one is a real <code>&lt;label&gt;</code> associated with the input. Association is
          programmatic — it&apos;s the <code>htmlFor</code>/<code>id</code> pairing, not visual proximity:
        </p>
        <pre><code>{`// GOOD — label's htmlFor matches the input's id. Clicking the label
// focuses the input, and screen readers announce "Email, edit text".
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// ALSO VALID — wrapping the input in the label associates them implicitly.
<label>
  Email
  <input type="email" name="email" />
</label>

// NOT A LABEL — placeholder is hint text. The field has no accessible
// name once it's filled, and contrast is usually poor.
<input type="email" placeholder="Email" />`}</code></pre>
        <p className="mb-4">
          Two big wins come free with a real label. First, the accessible name is stable — it doesn&apos;t disappear when the
          user types. Second, the label becomes a <em>bigger click target</em>: clicking &quot;Email&quot; focuses the input, which
          matters enormously for small controls like checkboxes and radios. <code>aria-label</code> can name a control with
          no visible text, but a <em>visible</em> label is better for everyone — sighted users included — so reach for the
          real <code>&lt;label&gt;</code> first.
        </p>
        <p className="mb-4">
          Related controls need grouping too. A set of radio buttons, or address fields that belong together, should sit
          inside a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code> — the legend names the <em>group</em> the
          way a label names a single field:
        </p>
        <pre><code>{`<fieldset>
  <legend>Notification preference</legend>

  <input id="notify-email" type="radio" name="notify" value="email" />
  <label htmlFor="notify-email">Email</label>

  <input id="notify-sms" type="radio" name="notify" value="sms" />
  <label htmlFor="notify-sms">Text message</label>
</fieldset>`}</code></pre>
        <p className="mb-4">
          Without the <code>&lt;fieldset&gt;</code>/<code>&lt;legend&gt;</code>, a screen reader reads &quot;Email, radio button&quot;
          with no clue that it&apos;s the email option <em>for notifications</em>. The legend supplies the shared context the
          sighted user gets from the heading above the group.
        </p>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;Every form control needs an accessible name, and the robust way is a real <code>&lt;label&gt;</code> associated
            by <code>htmlFor</code>/<code>id</code> — a placeholder is hint text, not a label, because it vanishes on input
            and doesn&apos;t reliably name the field. Related controls get grouped in a <code>&lt;fieldset&gt;</code> with a{" "}
            <code>&lt;legend&gt;</code> so the group itself has a name.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. INPUT AFFORDANCES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Make the right input easy — type, inputMode, autocomplete, targets</h2>
        <p className="mb-4">
          Accessibility and UX overlap heavily here. The same attributes that help assistive tech also make a form faster
          and less error-prone for <em>everyone</em>, especially on a phone:
        </p>
        <pre><code>{`// type and inputMode summon the right on-screen keyboard and
// turn on built-in validation/affordances.
<input id="email" type="email"
       inputMode="email" autoComplete="email" />

<input id="phone" type="tel"
       inputMode="tel" autoComplete="tel" />

// autocomplete tokens let the browser/password manager fill correctly.
<input id="name" type="text" autoComplete="name" />
<input id="new-pass" type="password" autoComplete="new-password" />`}</code></pre>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>type</code></strong> — <code>email</code>, <code>tel</code>, <code>url</code>, <code>number</code>{" "}
            give you native validation hints and the right mobile keyboard (an <code>@</code> key for email, a number pad
            for tel).
          </li>
          <li>
            <strong><code>inputMode</code></strong> — fine-tunes the on-screen keyboard <em>without</em> changing validation
            semantics (e.g. <code>inputMode=&quot;numeric&quot;</code> for a one-time code that&apos;s still a text field).
          </li>
          <li>
            <strong><code>autocomplete</code> tokens</strong> — <code>email</code>, <code>name</code>, <code>tel</code>,{" "}
            <code>new-password</code>, <code>one-time-code</code> let browsers and password managers fill fields correctly.
            This is a huge UX and accessibility win — less typing is less chance to err.
          </li>
          <li>
            <strong>Touch target size.</strong> Tap targets should be comfortably large (think a fingertip, ~44px). Cramped
            checkboxes and tiny links are an accessibility failure for motor impairments and a daily annoyance for everyone
            on a phone. Associating the label helps — the label area becomes part of the target.
          </li>
        </ul>
        <Callout variant="info" title="UX and a11y are the same investment here">
          <p>
            There&apos;s no &quot;accessible version&quot; and &quot;normal version&quot; of these attributes. The numeric keypad that helps a
            user with a motor impairment is the same keypad that saves a commuter three taps. Get the affordances right once
            and you&apos;ve improved the form for the whole spectrum of users at the same time.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-labels" moduleSlug={MODULE_SLUG} title="Labels, grouping & input affordances">
        <Quiz
          kind="Placeholder vs label"
          question="A teammate ships <input type='email' placeholder='Email' /> with no <label>. Why is the placeholder not an acceptable substitute for a label?"
          options={[
            {
              label: "The placeholder is hint text that disappears on input and doesn't reliably give the control an accessible name — so once the user types, the field is effectively unlabeled to assistive tech",
              correct: true,
              explanation:
                "Exactly. A placeholder vanishes when the user types (losing context mid-entry), usually fails contrast, and isn't a robust accessible name. A real <label> associated by htmlFor/id names the field stably and enlarges the click target.",
            },
            {
              label: "Placeholders are fine as labels as long as the contrast passes WCAG",
              explanation:
                "Contrast is only one of the problems. Even with good contrast the placeholder still disappears on input and doesn't reliably serve as the programmatic accessible name. A real label is the fix.",
            },
            {
              label: "It's only a problem on mobile; on desktop the placeholder works as a label",
              explanation:
                "It's a problem everywhere. Screen readers on desktop and mobile alike rely on a programmatic name; the placeholder isn't a substitute on any platform.",
            },
          ]}
        />
        <Quiz
          kind="Grouping controls"
          question="You have three radio buttons for 'Notification preference' (Email / SMS / None). What's the right way to give a screen-reader user the shared context?"
          options={[
            {
              label: "Wrap them in a <fieldset> with a <legend>Notification preference</legend>; each radio still gets its own associated <label>",
              correct: true,
              explanation:
                "Correct. The legend names the group the way a label names a single control, so a screen reader announces the option in the context of 'Notification preference' instead of an orphaned 'Email, radio button'.",
            },
            {
              label: "Put a styled <div> heading above the radios — visual proximity is enough",
              explanation:
                "Visual proximity isn't a programmatic relationship. A plain <div> heading isn't associated with the group, so assistive tech reads each radio without the shared context. fieldset/legend creates the actual association.",
            },
            {
              label: "Give each radio an aria-label like 'Notification preference: Email'",
              explanation:
                "That's verbose and repetitive, and it duplicates the group name onto every option. fieldset/legend expresses 'these belong to one group' once, which is the intended semantic.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. NATIVE VALIDATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Native validation and the Constraint API — start here, don&apos;t fight it</h2>
        <p className="mb-4">
          The platform ships a validation engine. Attributes like <code>required</code>, <code>type=&quot;email&quot;</code>,{" "}
          <code>minLength</code>, <code>max</code>, and <code>pattern</code> declare constraints the browser checks for free —
          and they integrate with assistive tech and submission for you:
        </p>
        <pre><code>{`<input id="email" type="email" name="email" required
       autoComplete="email" />

<input id="password" type="password" name="password" required
       minLength={8} autoComplete="new-password" />`}</code></pre>
        <p className="mb-4">
          When you need custom rules or your own messaging, the <strong>Constraint Validation API</strong> exposes the same
          machinery to JavaScript: every control has a <code>validity</code> object (<code>valueMissing</code>,{" "}
          <code>typeMismatch</code>, <code>tooShort</code>, <code>patternMismatch</code>…) and a{" "}
          <code>checkValidity()</code> method. You can read those flags to build your own message instead of re-implementing
          validation from scratch:
        </p>
        <pre><code>{`function validateEmail(input) {
  const v = input.validity;
  if (v.valueMissing) return "Email is required.";
  if (v.typeMismatch) return "Enter a valid email address.";
  return ""; // valid
}`}</code></pre>
        <p className="mb-4">
          Most teams take ownership of <em>rendering</em> the messages (the browser&apos;s default bubbles are inconsistent and
          unstyleable) while leaning on the native <code>validity</code> flags to decide <em>what</em> is wrong. That keeps
          your logic small and correct, and it&apos;s the answer an interviewer wants: &quot;use the platform&apos;s constraint engine,
          render the messaging yourself.&quot;
        </p>
        <Callout variant="warn" title="Client validation is UX, not security">
          <p>
            Native and JS validation make the form pleasant — instant feedback, the right keyboard, fewer wasted round-trips.
            None of it is a security boundary. The server must re-validate everything regardless, because the client can be
            bypassed entirely. Treat client validation as a fast, friendly first pass over the same rules.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. TYING ERRORS TO FIELDS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Tie the error to the field — <code>aria-describedby</code> + <code>aria-invalid</code></h2>
        <p className="mb-4">
          A red border says &quot;something&apos;s wrong here&quot; only to a sighted user, and it doesn&apos;t even say <em>what</em>. The
          accessible pattern carries the meaning programmatically with two attributes working together:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>aria-invalid=&quot;true&quot;</code></strong> on the input marks it as in an error state — assistive tech
            announces &quot;invalid&quot; when the field is read. Set it only when the field is actually wrong, and clear it when fixed.
          </li>
          <li>
            <strong><code>aria-describedby</code></strong> on the input points at the <code>id</code> of the element holding
            the error text. Now when the screen reader reads the field, it also reads the description — the error message and
            the field are spoken together.
          </li>
        </ul>
        <pre><code>{`<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  name="email"
  aria-invalid={emailError ? true : undefined}
  aria-describedby={emailError ? "email-error" : undefined}
/>
{emailError && (
  <p id="email-error" className="mt-1 text-sm text-red-600">
    {emailError}
  </p>
)}`}</code></pre>
        <p className="mb-4">
          The connection is the whole point. A sighted user&apos;s eye links the red text under the box to the box. A
          screen-reader user gets that same link only because <code>aria-describedby</code> stitches the message&apos;s{" "}
          <code>id</code> to the input. Drop the attribute and the message becomes orphaned text floating on the page that
          the user has to hunt for — if they even know it exists.
        </p>
        <p className="mb-4">
          One subtlety: <code>aria-describedby</code> can point at <em>hints</em> too, not just errors. A password field
          might describe its rules (&quot;at least 8 characters&quot;) via a hint element, and swap in (or add) the error element&apos;s
          <code> id</code> when validation fails. The relationship is always &quot;this input is described by that text.&quot;
        </p>
        <Callout variant="insight" title="The error is data, not decoration">
          <p>
            Color and a border are <em>reinforcement</em> for users who can perceive them — never the sole signal. The real
            error is the <em>text</em>, programmatically tied to the field with <code>aria-describedby</code> and flagged with{" "}
            <code>aria-invalid</code>. If you removed all color from your form, every error should still be fully
            understandable. That&apos;s the test.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. ANNOUNCING + SUMMARY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Announce failures, and put a summary at the top that links to fields</h2>
        <p className="mb-4">
          Per-field wiring handles a field the user is <em>focused on</em>. But a submit that fails validation, or an async
          server rejection, changes the page far from where the user is reading. A sighted user&apos;s eye is drawn to the new
          red block; a screen-reader user, reading linearly, perceives nothing unless you announce it.
        </p>
        <p className="mb-4">
          Two complementary tools. First, a <strong>live region</strong> for transient/async messages so they&apos;re announced
          without moving focus. Use <code>role=&quot;alert&quot;</code> (assertive) for a blocking failure like &quot;Sign-up failed,
          please try again,&quot; and <code>aria-live=&quot;polite&quot;</code> for non-urgent status:
        </p>
        <pre><code>{`// Async submit failure — announced immediately, doesn't move focus.
{submitError && (
  <div role="alert" className="mb-4 text-red-700">
    {submitError}
  </div>
)}

// Non-urgent status (e.g. "Saving…", "Checking availability").
<div aria-live="polite" className="sr-only">{statusMessage}</div>`}</code></pre>
        <p className="mb-4">
          Second, an <strong>error summary at the top of the form</strong> when submit fails validation. It lists every
          invalid field as <em>links</em> that jump focus to the offending input. This is the pattern real apps (and
          government design systems) use, because on a long form &quot;3 fields have errors&quot; with jump links is far kinder than
          making the user scroll hunting for red borders:
        </p>
        <pre><code>{`// Rendered when submit is attempted with invalid fields.
<div role="alert" tabIndex={-1} ref={summaryRef}>
  <h2>There are 2 problems with your submission</h2>
  <ul>
    <li><a href="#email">Enter a valid email address</a></li>
    <li><a href="#password">Password must be at least 8 characters</a></li>
  </ul>
</div>`}</code></pre>
        <p className="mb-4">
          Each summary item links to its field&apos;s <code>id</code>, so activating it moves the user straight to the input
          that needs fixing. The summary itself is <code>role=&quot;alert&quot;</code> (announced on appearance) and{" "}
          <code>{"tabIndex={-1}"}</code> so you can move focus to it programmatically (next section).
        </p>
        <Callout variant="warn" title="The live region must exist before the message">
          <p>
            A classic gotcha: a screen reader only announces a change <em>into</em> a live region that was already in the
            DOM. If you mount the <code>role=&quot;alert&quot;</code> element and its text in the same render, many screen readers
            miss it. Render an empty live container on load and update its text, or rely on <code>role=&quot;alert&quot;</code>&apos;s
            appearance semantics and verify in a real screen reader.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-errors" moduleSlug={MODULE_SLUG} title="Tying errors to fields & announcing them">
        <Quiz
          kind="Describedby + invalid"
          question="A field is invalid. You add a red border and render a <p> with the error text below it. What's still missing for a screen-reader user?"
          options={[
            {
              label: "Set aria-invalid='true' on the input and point aria-describedby at the error <p>'s id, so the field is announced as invalid AND its error text is read with it",
              correct: true,
              explanation:
                "Right. The red border and loose <p> aren't programmatically connected to the input. aria-invalid marks the error state and aria-describedby stitches the message's id to the field, so the screen reader reads the field and its reason together.",
            },
            {
              label: "Nothing — the error <p> is right below the input, so the screen reader will read it next anyway",
              explanation:
                "Reading order isn't an association. The message is orphaned text the user has to find; without aria-describedby it isn't announced as the field's description, and without aria-invalid the field isn't flagged as in error.",
            },
            {
              label: "Add aria-live to the input itself so the error is announced",
              explanation:
                "aria-live belongs on a status/error container whose content changes, not on the input. The per-field pattern is aria-invalid on the input plus aria-describedby pointing at the error element.",
            },
          ]}
        />
        <Quiz
          kind="Announcing & summary"
          question="On a long sign-up form, submit fails validation on 3 fields. What's the accessible, high-UX pattern?"
          options={[
            {
              label: "Show an error summary at the top in a role='alert' container listing each problem as a link to its field, move focus to the summary, and mark each invalid field with aria-invalid + aria-describedby",
              correct: true,
              explanation:
                "Correct. The summary is announced (role='alert'), gives an at-a-glance count, and its links jump focus to each offending input. Per-field aria-invalid/aria-describedby carry the detail. This is the pattern real design systems use.",
            },
            {
              label: "Add a red border to each invalid field and let the user scroll to find them",
              explanation:
                "A red border is color-only and silent to assistive tech, and scrolling a long form hunting for errors is poor UX for everyone. A summary with jump links plus per-field wiring is the accessible answer.",
            },
            {
              label: "Pop the errors into an aria-live='polite' region only, with no summary or focus move",
              explanation:
                "Polite is fine for non-urgent status but a failed submit is blocking, and a bare announcement gives no way to navigate to the fields. A focused, link-bearing summary is what lets the user act on it.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 8. TIMING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Validation timing — validate on blur, re-validate on change once errored</h2>
        <p className="mb-4">
          <em>When</em> you validate is a UX decision that becomes an accessibility one the moment errors get announced. Two
          anti-patterns sit at the extremes:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Validate on every keystroke from the start.</strong> The user types the first letter of their email and
            is immediately scolded &quot;invalid email.&quot; It&apos;s hostile, and with announcements wired up it spams a screen-reader
            user with errors for a field they haven&apos;t finished.
          </li>
          <li>
            <strong>Validate only on submit.</strong> The user fills the whole form, hits submit, and only then learns five
            fields were wrong. They&apos;ve lost the context of each field they completed long ago.
          </li>
        </ul>
        <p className="mb-4">
          The pattern most good forms converge on splits the timeline by whether a field has errored yet:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>First pass: validate on blur.</strong> Let the user finish the field. When focus leaves it, check it and
            show an error if needed. They aren&apos;t interrupted mid-entry.
          </li>
          <li>
            <strong>Once a field is showing an error: re-validate on change.</strong> Now that they know it&apos;s wrong, give
            live feedback as they fix it so the error clears the instant the value becomes valid. Waiting for another blur to
            confirm the fix feels broken.
          </li>
          <li>
            <strong>On submit: validate everything,</strong> build the summary, and move focus (next section). Submit is the
            backstop that catches untouched fields.
          </li>
        </ol>
        <Callout variant="insight" title="The rule of thumb">
          <p>
            &quot;Don&apos;t cry wolf before they&apos;ve finished, but once you&apos;ve flagged a problem, confirm the fix immediately.&quot;
            Validate on blur, then switch that field to validate-on-change while it&apos;s in an error state. It respects the
            user&apos;s focus and rewards them the moment they correct the mistake.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. FOCUS + SUBMIT STATE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Focus-on-error, and submit states that don&apos;t trap the user</h2>
        <p className="mb-4">
          When submit fails validation, focus is still on the submit button — useless to a keyboard or screen-reader user who
          now has to <em>find</em> the problem. The fix is to <strong>move focus deliberately</strong>: to the error summary
          (if you have one) or to the first invalid field.
        </p>
        <pre><code>{`function handleSubmit(e) {
  e.preventDefault();
  const errors = validateAll();

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    // Move focus to the summary (tabIndex={-1} makes it focusable),
    // or to the first invalid field if you have no summary.
    summaryRef.current?.focus();
    return;
  }
  submit();
}`}</code></pre>
        <p className="mb-4">
          Moving focus to a <code>role=&quot;alert&quot;</code> summary both announces &quot;there are problems&quot; and lands the user
          where they can act — its links jump them to each field. If you skip the summary, <code>.focus()</code> the first
          invalid input directly so the keyboard user is already on the field they need to fix.
        </p>
        <p className="mb-4">
          The submit button itself needs a loading state that&apos;s honest <em>and</em> non-trapping. While the request is in
          flight, reflect it — but disabling a button removes it from the tab order and can strand a screen-reader user with
          no feedback. The accessible approach announces the busy state without making the control vanish:
        </p>
        <pre><code>{`// Communicate busy without yanking the button out of the a11y tree.
<button type="submit" aria-disabled={submitting}>
  {submitting ? "Signing up…" : "Sign up"}
</button>

// A polite live region narrates progress for screen-reader users.
<div aria-live="polite" className="sr-only">
  {submitting ? "Submitting your details" : ""}
</div>`}</code></pre>
        <p className="mb-4">
          The pattern: keep the button focusable, use <code>aria-disabled</code> (and guard the handler so a second submit is
          ignored) rather than hard <code>disabled</code> when you want it to stay announceable, change the visible label so
          everyone sees progress, and narrate state changes in a polite live region. The user is never left wondering whether
          their click registered — and never trapped on a control that silently went dead.
        </p>
        <Callout variant="warn" title="Don't let the disabled trick hide failure">
          <p>
            A button disabled on submit and never re-enabled after an error is a classic dead end: the request failed, the
            spinner stopped, and the user can&apos;t retry because the control is inert and silent. Always re-enable (and
            announce the failure) on error. A loading state must have an exit in every branch — success <em>and</em> failure.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 10. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do you build an accessible form?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Real labels, always.</strong> Associate a <code>&lt;label&gt;</code> by <code>htmlFor</code>/
              <code>id</code> — a placeholder is not a label. Group related controls in{" "}
              <code>&lt;fieldset&gt;</code>/<code>&lt;legend&gt;</code>.
            </li>
            <li>
              <strong>Right input, less typing.</strong> Use <code>type</code>/<code>inputMode</code> for the correct
              keyboard, <code>autocomplete</code> tokens for fill, and comfortably large tap targets.
            </li>
            <li>
              <strong>Lean on native validation.</strong> Constraint attributes plus the <code>validity</code> API decide
              what&apos;s wrong; render the messaging yourself. Client validation is UX, not security — the server re-validates.
            </li>
            <li>
              <strong>Tie errors to fields.</strong> <code>aria-invalid</code> on the input, <code>aria-describedby</code>{" "}
              pointing at the error text. The error is <em>text</em>, not a red border.
            </li>
            <li>
              <strong>Announce and summarize.</strong> A <code>role=&quot;alert&quot;</code> live region for async/submit failures,
              and an error summary at the top that links to each invalid field.
            </li>
            <li>
              <strong>Time it and focus it.</strong> Validate on blur, re-validate on change once errored; on failed submit
              move focus to the summary or first invalid field. Submit states stay announceable, never trapping.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 11. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — make a multi-field sign-up form fully accessible</h2>
        <p className="mb-4">
          You&apos;ll start from the naive form at the top of this module and rebuild it into one a screen-reader user can
          complete confidently: associated labels, described-by hints and errors, a focus-moving summary, per-field{" "}
          <code>aria-invalid</code>, and announcements a screen-reader user actually hears.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build the fields with real labels.</strong> Name, email, phone, password, and a notification-preference
            radio group. Every control gets a <code>&lt;label&gt;</code> associated by <code>htmlFor</code>/<code>id</code>;
            wrap the radios in <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code>. No placeholder-as-label.
          </li>
          <li>
            <strong>Add the affordances.</strong> Correct <code>type</code>/<code>inputMode</code> on email and phone,{" "}
            <code>autocomplete</code> tokens throughout (<code>email</code>, <code>tel</code>, <code>name</code>,{" "}
            <code>new-password</code>), and make sure tap targets are comfortably sized.
          </li>
          <li>
            <strong>Wire native + constraint validation.</strong> Add <code>required</code>, <code>type=&quot;email&quot;</code>,{" "}
            <code>minLength</code>, etc., then read each field&apos;s <code>validity</code> flags to produce your own message
            text. Render the messages yourself; don&apos;t rely on the browser bubbles.
          </li>
          <li>
            <strong>Tie each error to its field.</strong> When a field is invalid, set <code>aria-invalid=&quot;true&quot;</code> and
            <code> aria-describedby</code> pointing at an error element&apos;s <code>id</code>. Reinforce with color/border, but
            confirm the error is fully understandable with color removed.
          </li>
          <li>
            <strong>Add the timing.</strong> Validate each field on blur. Once a field is showing an error, switch it to
            re-validate on change so the error clears the moment the value becomes valid.
          </li>
          <li>
            <strong>Build the summary and focus-on-error.</strong> On failed submit, render a <code>role=&quot;alert&quot;</code>{" "}
            summary at the top listing each problem as a link to its field, and move focus to the summary (give it{" "}
            <code>{"tabIndex={-1}"}</code>). Verify the links jump focus to the right inputs.
          </li>
          <li>
            <strong>Handle async submit honestly.</strong> Show a busy state that keeps the button announceable (label
            change + polite live region), announce a server rejection via <code>role=&quot;alert&quot;</code>, and make sure the
            button re-enables on failure so the user can retry.
          </li>
          <li>
            <strong>Verify with the real tools.</strong> Put the mouse down and complete the whole form by keyboard. Then
            turn on a screen reader (VoiceOver on macOS, NVDA on Windows): confirm every field announces its label, errors
            are read with their fields, the summary is announced and navigable, and the submit state is narrated.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            Think of the accessible form as a well-designed API error response. A red border is an opaque <code>400</code>{" "}
            with an empty body — the caller knows <em>something</em> failed but not what or where. <code>aria-invalid</code>{" "}
            plus <code>aria-describedby</code> is the structured error payload: a per-field code (&quot;this field is invalid&quot;)
            tied to a human-readable message. The error summary is the top-level <code>errors[]</code> array with pointers
            into the request. And re-validating on the server is the same rule as never trusting client input on an
            endpoint — the friendly client-side checks are a convenience, never the boundary.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-timing-focus" moduleSlug={MODULE_SLUG} title="Validation timing & focus-on-error">
        <Quiz
          kind="Validation timing"
          question="What's the validation-timing pattern that respects the user while still rewarding fixes quickly?"
          options={[
            {
              label: "Validate a field on blur (after they finish it); once it's showing an error, re-validate on change so the error clears the moment the value becomes valid; validate everything on submit",
              correct: true,
              explanation:
                "Correct. Blur-first avoids scolding mid-entry; switching an errored field to on-change gives instant confirmation that the fix worked; submit is the backstop for untouched fields. It respects focus and rewards correction.",
            },
            {
              label: "Validate on every keystroke from the very first character so feedback is always live",
              explanation:
                "Validating from the first keystroke scolds the user before they've finished typing — hostile UX, and with announcements wired up it spams a screen-reader user with errors for an unfinished field.",
            },
            {
              label: "Validate only on submit so the user is never interrupted while filling the form",
              explanation:
                "Submit-only means the user learns about every error at once, after they've lost the context of each field. Blur-first with on-change-once-errored is the balance that real forms use.",
            },
          ]}
        />
        <Quiz
          kind="Submit state"
          question="On submit, the request is in flight. How do you reflect the busy state without trapping the user?"
          options={[
            {
              label: "Keep the button focusable, signal busy with aria-disabled + a label change, narrate progress in a polite live region, and guard the handler against double-submit — and always re-enable on failure",
              correct: true,
              explanation:
                "Right. Hard-disabling removes the button from the a11y tree and can strand a screen-reader user; aria-disabled plus a label change and a polite announcement communicates progress while keeping the control announceable, with a guaranteed exit on both success and failure.",
            },
            {
              label: "Set the button to disabled and leave it disabled — that prevents any further interaction",
              explanation:
                "Hard-disabling pulls the button out of the tab order and goes silent, and leaving it disabled after an error strands the user with no way to retry. A loading state must have an exit in every branch, including failure.",
            },
            {
              label: "Replace the whole form with a full-screen spinner until the request resolves",
              explanation:
                "A full-screen takeover is disorienting and discards the user's place and context. Reflect busy on the submit control and announce it politely; don't blow away the form they were working in.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
