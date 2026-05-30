import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "accessibility-deep";

const CHECKPOINTS = [
  { id: "cp-semantics", title: "Semantic HTML & the div trap" },
  { id: "cp-keyboard-focus", title: "Keyboard operability & focus" },
  { id: "cp-aria", title: "The first rule of ARIA & live regions" },
];

export default function AccessibilityDeepModule() {
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
          Accessibility that survives code review — semantics, keyboard, ARIA
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Accessibility isn&apos;t a layer you bolt on at the end with a sprinkle of <code>aria-*</code> attributes. It&apos;s a
          consequence of building with the right elements from the start. Get the HTML right and most of accessibility is free;
          reach for ARIA only when the platform genuinely can&apos;t express what you mean.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The building with no signs and no ramps</h2>
        <p className="mb-4">
          Imagine a building where every door is an unlabeled blank panel, the stairs have no railings, and there&apos;s a step up
          at every threshold with no ramp. A person who can see the layout and walk easily barely notices. But someone navigating
          by touch, or using a wheelchair, hits a wall at every turn — not because the building is hostile, but because it was
          designed for exactly one kind of body and one kind of movement.
        </p>
        <p className="mb-4">
          Now imagine the same building with clearly labeled doors, handrails, ramps, and tactile signage. It works for{" "}
          <em>everyone</em>, including the person who designed it for. The accommodations didn&apos;t make it worse for anyone; they
          made it usable for more people. That&apos;s accessibility: building for the full range of how people perceive and operate
          your interface, not just the way you happen to use it.
        </p>
        <p className="mb-4">
          A screen reader is a person navigating your app by touch and sound. They can&apos;t see your beautiful layout; they hear a
          linear stream the browser builds from your markup. The keyboard-only user can&apos;t aim a mouse at your clever{" "}
          <code>&lt;div onClick&gt;</code>; they press Tab and Enter and expect things to work. Your HTML is the signage, the
          railings, and the ramps. Semantic elements <em>come with all of that built in.</em>
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            There&apos;s a hierarchy: <strong>semantic HTML first, keyboard operability and focus management second, ARIA only as a
            last resort.</strong> Almost every accessibility bug comes from inverting that order — reaching for ARIA to patch a{" "}
            <code>&lt;div&gt;</code> that should have been a <code>&lt;button&gt;</code>. Get the order right and the work gets
            dramatically smaller.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. SEMANTIC HTML ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Semantic HTML — the foundation everything rests on</h2>
        <p className="mb-4">
          The browser builds an <strong>accessibility tree</strong> from your DOM — a parallel structure that assistive tech reads.
          Each element contributes a <em>role</em> (what kind of thing it is), a <em>name</em> (its accessible label), and{" "}
          <em>states</em> (pressed, expanded, disabled). When you use the right native element, you get all three for free, plus
          keyboard behavior and focus, with zero extra code.
        </p>
        <pre><code>{`// A real button: role=button, focusable, fires on Enter AND Space,
// works with screen readers, shows a focus ring — all for free.
<button onClick={save}>Save</button>

// A "button" made of a div: a visual lie. To the accessibility tree
// it's a generic group with no role, not focusable, and the keyboard
// does nothing. A screen-reader user can't even find it.
<div className="btn" onClick={save}>Save</div>`}</code></pre>
        <p className="mb-4">
          The <code>&lt;div onClick&gt;</code> is the canonical accessibility failure. To make that div behave like the real button,
          you&apos;d have to manually add: <code>role=&quot;button&quot;</code>, <code>tabIndex=&quot;0&quot;</code>, a keydown
          handler for both Enter <em>and</em> Space, and the disabled handling — and you&apos;d still be reimplementing what{" "}
          <code>&lt;button&gt;</code> gives you in one tag. The lesson: <strong>use the element that already means what you
          mean.</strong>
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>An action that does something → <code>&lt;button&gt;</code> (not a div, not an anchor).</li>
          <li>Navigation to a URL → <code>&lt;a href&gt;</code> (not a button with an <code>onClick</code> that calls router).</li>
          <li>A list of items → <code>&lt;ul&gt;</code>/<code>&lt;ol&gt;</code> + <code>&lt;li&gt;</code> (screen readers announce &quot;list, 5 items&quot;).</li>
          <li>Page structure → <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code> (landmarks users jump between).</li>
          <li>A form control → a real <code>&lt;input&gt;</code>/<code>&lt;select&gt;</code> with an associated <code>&lt;label&gt;</code>.</li>
        </ul>
        <Callout variant="warn" title="Button vs link is not a styling question">
          <p>
            A button <em>does something</em> on the current page (submit, toggle, open). A link <em>goes somewhere</em> (a URL you
            can right-click, open in a new tab, bookmark). Screen-reader users navigate by pulling up a list of links or a list of
            buttons — putting an action in a link or navigation in a button breaks that mental model. Style them however you like;
            choose the element by <em>behavior</em>.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. KEYBOARD ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Keyboard operability — if you can&apos;t Tab to it, it doesn&apos;t exist</h2>
        <p className="mb-4">
          A huge population never touches a mouse: screen-reader users, people with motor impairments, power users, anyone on a
          broken trackpad. The baseline rule is brutal and simple: <strong>everything interactive must be reachable and operable
          with the keyboard alone.</strong> If you can&apos;t Tab to it and activate it, for those users it doesn&apos;t exist.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Tab order follows the DOM.</strong> Native interactive elements are in the tab order automatically. The order is
            the source order of the DOM — which is one more reason to keep your DOM order matching the visual/logical order.
          </li>
          <li>
            <strong>Expected keys must work.</strong> Buttons activate on Enter and Space. Links activate on Enter. A custom widget
            is expected to follow the established pattern (a menu with arrow keys, a modal that closes on Escape).
          </li>
          <li>
            <strong><code>tabIndex</code> rules.</strong> <code>tabIndex=&quot;0&quot;</code> puts a non-interactive element into
            the natural tab order (only needed for genuinely custom widgets). <code>tabIndex=&quot;-1&quot;</code> makes something
            programmatically focusable but skips it in the Tab sequence (useful for focus management). <strong>Positive{" "}
            <code>tabIndex</code> values are almost always a bug</strong> — they hijack the order and create a maze.
          </li>
          <li>
            <strong>Never remove the focus outline without replacing it.</strong> <code>outline: none</code> with no alternative is
            one of the most common accessibility regressions — keyboard users lose track of where they are entirely.
          </li>
        </ul>
        <Callout variant="insight" title="The two-minute keyboard test">
          <p>
            Put the mouse down. Tab through your feature. Can you reach every control? Is it obvious which element is focused at all
            times? Can you operate everything (open, close, submit) with Enter/Space/Escape/arrows as appropriate? If yes, you&apos;ve
            cleared the single highest-value accessibility bar. Most teams never even try this.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-semantics" moduleSlug={MODULE_SLUG} title="Semantic HTML & the div trap">
        <Quiz
          kind="The div trap"
          question="A teammate built a clickable card action as <div className='btn' onClick={...}>Delete</div>. Why does this fail a screen-reader and keyboard user?"
          options={[
            {
              label: "A div has no button role, isn't in the tab order, and doesn't respond to Enter/Space — so a screen reader can't identify it and a keyboard user can't reach or activate it",
              correct: true,
              explanation:
                "Exactly. A real <button> carries role, focusability, and Enter/Space activation for free. A div onClick is a visual-only control: the accessibility tree sees a generic element with no role, no keyboard, no way to find it.",
            },
            {
              label: "It works fine for accessibility as long as the CSS makes it look like a button",
              explanation:
                "Looking like a button does nothing for the accessibility tree or the keyboard. Visual styling and semantics are independent — a screen reader reads roles and names, not your CSS.",
            },
            {
              label: "The only problem is the missing aria-label; add one and it's accessible",
              explanation:
                "An aria-label gives it a name but it still has no button role, isn't focusable, and doesn't handle Enter/Space. The right fix is to use a <button>, not to patch a div with ARIA.",
            },
          ]}
        />
        <Quiz
          kind="Button vs link"
          question="You need an element that navigates the user to /settings. Button or link, and why?"
          options={[
            {
              label: "A link (<a href='/settings'>) — it navigates to a URL, so it should be right-clickable, openable in a new tab, and announced as a link",
              correct: true,
              explanation:
                "Correct. Navigation to a URL is a link's job. Choosing by behavior (goes somewhere vs does something) is the rule — a button with an onClick router call breaks right-click, new-tab, and the screen-reader links list.",
            },
            {
              label: "A button with onClick that calls router.push — buttons are more reliable for SPAs",
              explanation:
                "That hijacks navigation into a button: no right-click-to-open, no new-tab, and screen-reader users pulling up the links list won't find it. Navigation belongs in an <a href>.",
            },
            {
              label: "Either one — button vs link is purely a styling preference",
              explanation:
                "They have different semantics and behaviors (does-something vs goes-somewhere). Style is independent of the choice; you pick the element by behavior, then style it however you want.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. FOCUS MANAGEMENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Focus management — moving the user&apos;s &quot;cursor&quot; deliberately</h2>
        <p className="mb-4">
          Focus is the keyboard user&apos;s cursor. With a mouse you point at what you care about; with a keyboard, focus <em>is</em>{" "}
          your position. When the UI changes in a big way — opening a dialog, navigating to a new route, revealing an error — you
          often need to <strong>move focus deliberately</strong> so the keyboard/screen-reader user lands where they expect.
        </p>
        <p className="mb-4">The canonical case is a modal dialog. Three things must happen:</p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>Move focus into the dialog</strong> when it opens (to the first control or the dialog itself), so the next
            keypress acts on the dialog, not the page behind it.
          </li>
          <li>
            <strong>Trap focus inside</strong> while it&apos;s open — Tab should cycle through the dialog&apos;s controls, not escape
            to the obscured page behind it.
          </li>
          <li>
            <strong>Return focus</strong> to the element that opened the dialog when it closes — otherwise the user is dumped at the
            top of the page with no idea where they were.
          </li>
        </ol>
        <pre><code>{`function Dialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null); // element that had focus before open

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement; // remember
      dialogRef.current?.focus();                  // move focus in
    } else {
      openerRef.current?.focus();                  // restore on close
    }
  }, [open]);

  // ...plus: trap Tab inside, close on Escape, mark the page behind inert
}`}</code></pre>
        <p className="mb-4">
          The same principle scales down: after a client-side route change, focus should move to the new page&apos;s heading (it
          doesn&apos;t happen automatically in an SPA the way a full page load does). After an async action reveals an error
          summary, move focus to it. Focus management is the difference between a screen-reader user gliding through your app and
          getting lost after every interaction.
        </p>
        <Callout variant="warn" title="Don't steal focus gratuitously">
          <p>
            Move focus when the <em>context</em> meaningfully changes (dialog opens, error appears, route changes). Don&apos;t yank
            focus on every minor update — auto-focusing things the user didn&apos;t ask for is disorienting too. The rule is
            &quot;follow the user&apos;s intent,&quot; not &quot;grab focus constantly.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. ARIA ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">ARIA — and its first rule (don&apos;t)</h2>
        <p className="mb-4">
          ARIA (Accessible Rich Internet Applications) is a set of attributes — <code>role</code>, <code>aria-*</code> — that add
          accessibility semantics where HTML alone can&apos;t express them. It is powerful and necessary for genuinely custom
          widgets. It is also the most <em>misused</em> tool in front-end, because people reach for it first instead of last.
        </p>
        <Callout variant="insight" title="The First Rule of ARIA — say it in the interview">
          <p>
            &quot;<strong>The first rule of ARIA is: don&apos;t use ARIA.</strong> If a native HTML element or attribute already
            gives you the role, state, and behavior you need, use that instead. ARIA adds <em>semantics</em> but no behavior — it
            tells assistive tech what an element claims to be, but it doesn&apos;t make it focusable, keyboard-operable, or anything
            else. A <code>role=&quot;button&quot;</code> on a div is a promise you then have to keep by hand.&quot;
          </p>
        </Callout>
        <p className="mb-4">
          The deadly mistake is thinking ARIA <em>does</em> something. It doesn&apos;t. <code>role=&quot;button&quot;</code> makes a
          screen reader announce &quot;button,&quot; but the div still isn&apos;t focusable and Enter/Space still do nothing — now
          you&apos;ve created a control that <em>claims</em> to be a button and then lies. A wrong ARIA attribute is worse than
          none, because it actively misinforms the user.
        </p>
        <p className="mb-4">When ARIA is genuinely the right tool, it expresses three things:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Roles</strong> — what an element is when no native element fits (<code>role=&quot;tablist&quot;</code>,{" "}
            <code>role=&quot;dialog&quot;</code>). Follow the established WAI-ARIA Authoring Practices pattern for the widget.
          </li>
          <li>
            <strong>States &amp; properties</strong> — dynamic status the platform can&apos;t infer:{" "}
            <code>aria-expanded</code> on a disclosure toggle, <code>aria-selected</code> on a tab,{" "}
            <code>aria-checked</code> on a custom checkbox, <code>aria-disabled</code>. These must be kept in sync with your state.
          </li>
          <li>
            <strong>Names</strong> — the accessible label for a control that has no visible text:{" "}
            <code>aria-label=&quot;Close&quot;</code> on an icon-only button, or <code>aria-labelledby</code> pointing at another
            element&apos;s id.
          </li>
        </ul>
        <pre><code>{`// Legitimate ARIA: an icon-only button has no visible text,
// so give it an accessible name.
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />  {/* hide the decorative icon */}
</button>

// Legitimate ARIA: a disclosure toggle reflects its open state.
<button aria-expanded={isOpen} onClick={toggle}>Details</button>`}</code></pre>
      </section>

      {/* ───────────────────────── 6. ARIA LIVE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>aria-live</code> — announcing things that change</h2>
        <p className="mb-4">
          A sighted user notices a toast appear, a search-results count update, or a form error show up — their eyes catch the
          change. A screen-reader user, who reads linearly, has no idea a faraway part of the page just changed. <strong>Live
          regions</strong> bridge that gap: content that updates inside an element with <code>aria-live</code> is announced
          automatically without moving focus.
        </p>
        <pre><code>{`// Polite: announced when the screen reader is idle (doesn't interrupt).
// Use for status updates, search counts, "saved" confirmations.
<div aria-live="polite">{statusMessage}</div>

// Assertive: interrupts immediately. Reserve for urgent things —
// errors that block the user. Overusing it is hostile.
<div role="alert">{errorMessage}</div>  {/* role=alert implies assertive */}`}</code></pre>
        <p className="mb-4">
          The two politeness levels: <strong><code>polite</code></strong> waits until the screen reader is idle and announces
          without interrupting — the right default for status updates (&quot;3 results,&quot; &quot;Draft saved&quot;).{" "}
          <strong><code>assertive</code></strong> interrupts whatever is being read — reserve it for urgent, blocking information.{" "}
          <code>role=&quot;alert&quot;</code> is a convenient shorthand for an assertive live region.
        </p>
        <Callout variant="warn" title="The live region must exist before the update">
          <p>
            A subtle gotcha: the element with <code>aria-live</code> needs to be in the DOM <em>before</em> you put content into it.
            If you mount the live region and its message at the same time, many screen readers won&apos;t announce it. Render an
            empty <code>aria-live</code> container on load, then update its text — that&apos;s the change it announces.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-keyboard-focus" moduleSlug={MODULE_SLUG} title="Keyboard operability & focus">
        <Quiz
          kind="Modal focus"
          question="When a modal dialog opens and later closes, what should happen to keyboard focus?"
          options={[
            {
              label: "Move focus into the dialog on open, trap it inside while open, and return it to the triggering element on close",
              correct: true,
              explanation:
                "Correct. Focus must enter the dialog (so keypresses act on it), be trapped inside (so Tab doesn't wander to the obscured page), and return to the opener on close (so the user isn't dumped at the top of the page).",
            },
            {
              label: "Leave focus wherever it was; moving focus is disorienting and should be avoided",
              explanation:
                "For a modal, NOT moving focus is the disorienting outcome — the keyboard user's position stays on the page behind the dialog, so they can't operate it. Deliberate focus movement on a context change is exactly right here.",
            },
            {
              label: "Move focus to the dialog on open, but on close send focus to the top of the page for consistency",
              explanation:
                "Sending focus to the top of the page on close loses the user's place. Focus should return to the element that opened the dialog so they resume where they left off.",
            },
          ]}
        />
        <Quiz
          kind="tabIndex"
          question="What does tabIndex='-1' do, and when is it useful?"
          options={[
            {
              label: "It makes an element programmatically focusable (you can call .focus() on it) but removes it from the natural Tab sequence — useful for focus management targets like a dialog or an error summary",
              correct: true,
              explanation:
                "Right. -1 means 'focusable via script, skipped by Tab'. You use it on things you move focus TO deliberately (a dialog container, a heading after route change, an error summary) without inserting them into the Tab order.",
            },
            {
              label: "It removes the element from the page entirely for keyboard users",
              explanation:
                "It doesn't remove the element — it just keeps it out of the Tab sequence while still allowing programmatic .focus(). The element is still there and still focusable by script.",
            },
            {
              label: "It's the same as tabIndex='0' but with higher priority in the tab order",
              explanation:
                "tabIndex='0' inserts an element into the natural Tab order; tabIndex='-1' removes it from the Tab order but keeps it script-focusable. They're opposites, not priority levels.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do you make a component accessible?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Semantic HTML first.</strong> Use the element that means what you mean — <code>&lt;button&gt;</code> for
              actions, <code>&lt;a href&gt;</code> for navigation, real form controls, landmarks. They give role, name, focus, and
              keyboard for free. A <code>&lt;div onClick&gt;</code> is the canonical failure.
            </li>
            <li>
              <strong>Keyboard operability.</strong> Everything interactive must be reachable with Tab and operable with
              Enter/Space/Escape/arrows. If you can&apos;t use it without a mouse, it&apos;s broken.
            </li>
            <li>
              <strong>Manage focus on context changes.</strong> Move focus into dialogs and back out, to new routes, and to error
              summaries — deliberately.
            </li>
            <li>
              <strong>The first rule of ARIA is don&apos;t.</strong> ARIA adds semantics, not behavior. Use it only when no native
              element fits — roles, states (<code>aria-expanded</code>), and names (<code>aria-label</code>). A wrong ARIA attribute
              is worse than none.
            </li>
            <li>
              <strong><code>aria-live</code> for dynamic updates</strong> a screen-reader user can&apos;t see — polite by default,
              assertive only for urgent.
            </li>
            <li>
              <strong>Test with a keyboard and a screen reader,</strong> not just an automated checker.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 8. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — rebuild a broken dropdown the right way</h2>
        <p className="mb-4">
          You&apos;ll take an inaccessible custom dropdown built from divs and rebuild it keyboard-operable with correct
          roles/states and managed focus — then verify it with keyboard-only navigation and a screen reader.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Start with the broken version.</strong> A &quot;dropdown&quot; that&apos;s a <code>&lt;div onClick&gt;</code>{" "}
            trigger and a list of <code>&lt;div onClick&gt;</code> options. Confirm the failures: you can&apos;t Tab to it, the
            keyboard does nothing, and a screen reader announces nothing meaningful.
          </li>
          <li>
            <strong>Fix the trigger first with semantics.</strong> Make it a real <code>&lt;button&gt;</code>. Add{" "}
            <code>aria-expanded</code> reflecting open/closed state and <code>aria-haspopup</code>. Now it&apos;s focusable and
            activates on Enter/Space for free.
          </li>
          <li>
            <strong>Make the list keyboard-operable.</strong> Follow the listbox/menu pattern: arrow keys move between options, Enter
            selects, Escape closes and returns focus to the trigger. Give the list and options the right roles (
            <code>role=&quot;listbox&quot;</code> / <code>role=&quot;option&quot;</code> with <code>aria-selected</code>).
          </li>
          <li>
            <strong>Manage focus deliberately.</strong> When the list opens, move focus to the active option; when it closes (via
            Escape or selection), return focus to the trigger. Trap arrow-key navigation within the list.
          </li>
          <li>
            <strong>Announce the selection.</strong> Add a polite <code>aria-live</code> region (or rely on the option&apos;s
            selected state) so a screen-reader user hears what they picked.
          </li>
          <li>
            <strong>Verify with the real tools.</strong> Put the mouse down and operate the whole thing with the keyboard. Then turn
            on a screen reader (VoiceOver on macOS, NVDA on Windows) and confirm it announces the role, the expanded state, and the
            selected option. An automated checker (axe) is a backstop, not the test.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            Think of the accessibility tree as a public API contract for your UI, and ARIA as the schema annotations. Just as you
            wouldn&apos;t annotate an endpoint <code>@Returns(User)</code> while actually returning a raw map — the annotation would
            lie to every consumer — you don&apos;t slap <code>role=&quot;button&quot;</code> on a div that doesn&apos;t behave like
            one. Native HTML elements are like well-typed library methods: they ship the correct contract and the correct behavior
            together. ARIA is hand-writing the contract, which means <em>you</em> now own keeping it true.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-aria" moduleSlug={MODULE_SLUG} title="The first rule of ARIA & live regions">
        <Quiz
          kind="First rule of ARIA"
          question="What is the 'first rule of ARIA', and why does it matter?"
          options={[
            {
              label: "Don't use ARIA if a native HTML element/attribute already provides the role, state, and behavior — because ARIA adds semantics but no behavior",
              correct: true,
              explanation:
                "Exactly. ARIA tells assistive tech what an element claims to be but doesn't make it focusable or keyboard-operable. role='button' on a div announces 'button' while the div still doesn't work — a lie. Prefer the native element that ships behavior with the semantics.",
            },
            {
              label: "Add ARIA roles to every element so screen readers have maximum information",
              explanation:
                "That's the opposite of the rule. Over-applying ARIA creates wrong or redundant semantics and controls that claim behaviors they don't have. Use native elements first; reach for ARIA only when nothing native fits.",
            },
            {
              label: "Always use aria-label instead of a visible <label> for cleaner markup",
              explanation:
                "Visible labels are better for everyone (sighted users included) and a real <label> associates programmatically. aria-label is for controls with no visible text, not a default replacement for labels.",
            },
          ]}
        />
        <Quiz
          kind="aria-live"
          question="After an async search, you update a count like '3 results found' in a corner of the page. How do you make a screen-reader user aware of it?"
          options={[
            {
              label: "Put the count in an aria-live='polite' region that already exists in the DOM, then update its text — it's announced without moving focus",
              correct: true,
              explanation:
                "Correct. polite announces the update when the screen reader is idle, without stealing focus — ideal for non-urgent status. The region must exist before you update it, or many screen readers won't announce the change.",
            },
            {
              label: "Move keyboard focus to the results count so the screen reader reads it",
              explanation:
                "Yanking focus to a status count is disruptive — it interrupts the user's flow for a non-critical update. A polite live region announces it without disturbing their position.",
            },
            {
              label: "Use aria-live='assertive' so it's announced as fast as possible",
              explanation:
                "Assertive interrupts whatever is being read, which is hostile for a routine status update. Reserve assertive (or role='alert') for urgent, blocking information; a result count is polite.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
