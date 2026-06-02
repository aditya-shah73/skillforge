import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "portals-refs-advanced";

const CHECKPOINTS = [
  { id: "cp-portal-mental-model", title: "What a portal actually moves" },
  { id: "cp-accessible-modal", title: "What makes a modal accessible" },
  { id: "cp-refs-and-positioning", title: "Ref callbacks, merging & positioning" },
];

export default function PortalsRefsAdvancedModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 6 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Portals &amp; advanced ref patterns, modals, tooltips, and escaping the tree
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Your modal looks perfect, until it opens inside a card with <code>overflow: hidden</code> and gets sliced in half.
          You bump the <code>z-index</code> to 9999 and it <em>still</em> hides behind the header. The fix isn&apos;t more CSS.
          It&apos;s rendering the modal somewhere else in the DOM entirely, while keeping it part of your React tree. That&apos;s a portal.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The embassy on foreign soil</h2>
        <p className="mb-4">
          An embassy sits physically inside a host country, it has a street address in Paris, you walk to it down a Paris
          street. But legally it answers to a <em>different</em> government. Its rules, its chain of command, its passports,
          all come from home, not from the country it physically sits in. It&apos;s <strong>located</strong> in one place and
          <strong> governed</strong> by another.
        </p>
        <p className="mb-4">
          A React portal is exactly that. <code>createPortal</code> lets a component <strong>physically render</strong> its
          DOM into some far-off node, usually a <code>&lt;div&gt;</code> at the end of <code>&lt;body&gt;</code>, while that
          component remains <strong>governed</strong> by the React tree it was written in. It keeps its place in the component
          hierarchy: it still receives context from its React parents, its events still bubble up to its React parents, its
          state still lives where you declared it. Only the <em>DOM node</em> moves. The React identity stays home.
        </p>
        <p className="mb-4">
          Why move the DOM at all? Because the DOM has rules that don&apos;t care about your React tree. A <code>z-index</code>
          only competes within its <em>stacking context</em>. An <code>overflow: hidden</code> ancestor <em>clips</em>
          everything inside it. A <code>transform</code> or <code>filter</code> on a parent creates a new containing block.
          A modal nested deep inside a card is at the mercy of all three. Render it at the top of <code>&lt;body&gt;</code>
          instead, and those ancestor constraints simply don&apos;t apply to it anymore.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Two tools for one job: <em>escaping a parent&apos;s DOM constraints without leaving the parent&apos;s React
            world.</em> Portals handle the &quot;render elsewhere&quot; half. The second half, refs, ref callbacks, and
            merging refs, is how you reach into real DOM nodes to measure them and position the portaled layer correctly.
            Together they&apos;re how every real modal, tooltip, dropdown, and popover gets built.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE CSS PROBLEM ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The problem portals solve (it&apos;s a CSS problem, not a React one)</h2>
        <p className="mb-4">
          Picture a perfectly reasonable modal, nested where it logically belongs, inside the card that opened it:
        </p>
        <pre><code>{`function Card() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ overflow: "hidden", position: "relative" }}>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div className="modal-overlay">      {/* tries to cover the whole screen */}
          <div className="modal">...</div>
        </div>
      )}
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          It renders, but it&apos;s broken in ways no amount of CSS on the modal itself can fix, because the damage is done
          by the <em>ancestors</em>:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Clipping.</strong> The card has <code>overflow: hidden</code> (for rounded corners, a scroll area,
            whatever). Your full-screen overlay gets <em>clipped to the card&apos;s box</em>. The &quot;full screen&quot;
            overlay covers a 300px card and nothing else.
          </li>
          <li>
            <strong>Stacking context traps.</strong> An ancestor with <code>position: relative</code> and a
            <code>z-index</code>, or a <code>transform</code>, or an <code>opacity &lt; 1</code>, creates a new
            <em> stacking context</em>. Your modal&apos;s <code>z-index: 9999</code> now only competes <em>inside that
            ancestor</em>, it can still render <em>behind</em> a sibling of the ancestor (like a sticky header) no matter how
            high you crank it.
          </li>
          <li>
            <strong>Transformed containing blocks.</strong> A <code>transform</code> on any ancestor makes
            <code> position: fixed</code> resolve relative to <em>that ancestor</em> instead of the viewport. Your &quot;fixed
            to the screen&quot; overlay is suddenly fixed to a card.
          </li>
        </ul>
        <p className="mb-4">
          Every one of these comes from where the modal <em>sits in the DOM</em>. None of them is fixable from the modal&apos;s
          own styles. The only real fix is to get the modal out from under those ancestors, render it as a direct child of
          <code> &lt;body&gt;</code>, where there are no clipping parents, no inherited stacking context, no transformed
          containing block. That&apos;s the move a portal makes.
        </p>
        <Callout variant="warn" title="The z-index arms race is a smell">
          <p>
            If you find yourself raising a <code>z-index</code> to 999, then 9999, then 99999 and it <em>still</em> hides
            behind something, stop. You&apos;re not in a z-index fight, you&apos;re trapped in a stacking context. No value is
            high enough to escape a parent context. The answer is to render outside the context entirely, which is what a
            portal does.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. CREATEPORTAL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>createPortal(children, domNode)</code>, render here, live there</h2>
        <p className="mb-4">
          The whole API is one function from <code>react-dom</code>. You give it what to render and a real DOM node to render
          it <em>into</em>; React puts the output there instead of where the JSX physically appears:
        </p>
        <pre><code>{`import { createPortal } from "react-dom";

function Modal({ children, onClose }) {
  // children render INTO document.body, not where <Modal/> sits in the JSX
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body, // the destination DOM node
  );
}

function Card() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Modal onClose={() => setOpen(false)}>Hello from the body!</Modal>}
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          The <code>&lt;Modal&gt;</code> is still written inside <code>&lt;Card&gt;</code>, and in the <strong>React tree</strong>
          it is still Card&apos;s child. But in the <strong>DOM tree</strong> its markup lands as a child of
          <code> &lt;body&gt;</code>, outside the card, outside its <code>overflow: hidden</code>, outside its stacking
          context. The clipping is gone, the z-index now competes at the top level, and <code>position: fixed</code> resolves
          to the viewport.
        </p>
        <p className="mb-4">Here is the part that surprises everyone, and the part interviewers love to probe:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Context still flows in.</strong> Because the portal stays in the React tree, a <code>ThemeContext</code> or
            router context provided by an ancestor of <code>&lt;Card&gt;</code> is still readable inside the modal. Moving the
            DOM does <em>not</em> sever React context.
          </li>
          <li>
            <strong>Events bubble through the React tree, not the DOM tree.</strong> A click inside the portaled modal bubbles
            up to <code>&lt;Card&gt;</code>&apos;s React event handlers, even though, in the DOM, the modal isn&apos;t inside
            the card at all. React&apos;s synthetic event system follows the component hierarchy you wrote, not where the nodes
            physically ended up.
          </li>
          <li>
            <strong>State and lifecycle are unchanged.</strong> The modal mounts, updates, and unmounts as Card&apos;s child.
            Unmount the modal and React cleanly removes the nodes from <code>&lt;body&gt;</code>.
          </li>
        </ul>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;<code>createPortal</code> renders a component&apos;s DOM <em>outside</em> its parent&apos;s DOM hierarchy
            while keeping it <em>inside</em> the React tree. So it escapes CSS constraints like <code>overflow: hidden</code>
            and stacking contexts, but it still receives React context and its events still bubble through its React parents,
            not through where the DOM node physically lives.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-portal-mental-model" moduleSlug={MODULE_SLUG} title="What a portal actually moves">
        <Quiz
          kind="Mental model"
          question="A <Modal> is written inside a <Card> but rendered with createPortal(..., document.body). A click handler is attached to <Card>. The user clicks a button inside the modal. Does Card's React onClick fire?"
          options={[
            {
              label: "Yes, events bubble through the React tree, and in the React tree the modal is still Card's child, so the click bubbles up to Card",
              correct: true,
              explanation:
                "Right. The DOM node moved to <body>, but the React tree is unchanged. React's synthetic events follow the component hierarchy you wrote, so the click bubbles up to Card's handler even though the DOM nodes aren't physically inside the card.",
            },
            {
              label: "No, the modal's DOM lives under <body>, outside the card's DOM, so the event can't reach Card",
              explanation:
                "This would be true if React used native DOM bubbling for component handlers, but it doesn't. Synthetic events bubble through the React tree, where the modal is still Card's child.",
            },
            {
              label: "Only if you also pass the click event manually through context",
              explanation:
                "No manual wiring is needed. Portals preserve React-tree event bubbling automatically, that's a core part of what createPortal guarantees.",
            },
          ]}
        />
        <Quiz
          kind="What moves"
          question="What does createPortal actually change about a component?"
          options={[
            {
              label: "Only where its DOM nodes are inserted; its position in the React tree, its context access, and its event bubbling all stay the same",
              correct: true,
              explanation:
                "Exactly. The DOM destination changes; the React identity does not. Context still flows in, events still bubble through React parents, and lifecycle is unchanged.",
            },
            {
              label: "Both its DOM location and its React-tree position, so it loses access to ancestor context",
              explanation:
                "The React-tree position is NOT changed, that's the whole point. The component still reads ancestor context because it remains a React-tree descendant.",
            },
            {
              label: "Nothing about rendering; it's purely a CSS helper that sets z-index automatically",
              explanation:
                "createPortal doesn't touch z-index. It relocates the DOM output so the node escapes clipping/stacking-context problems, the CSS benefit is a consequence of the move, not an automatic style.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. ACCESSIBLE MODAL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">A portal is necessary but not sufficient, the accessible modal checklist</h2>
        <p className="mb-4">
          Getting the modal to render in the right place is the <em>easy</em> half. A modal that&apos;s positioned correctly
          but inaccessible is still broken, it just fails for keyboard and screen-reader users instead of failing visually.
          A real, production modal owes five things beyond <code>createPortal</code>:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>The right semantics.</strong> The dialog needs <code>role=&quot;dialog&quot;</code> (or
            <code> role=&quot;alertdialog&quot;</code>) and <code>aria-modal=&quot;true&quot;</code>, plus a label,
            <code> aria-labelledby</code> pointing at its title (or <code>aria-label</code>). This tells assistive tech &quot;a
            modal dialog just opened, and here&apos;s its name.&quot;
          </li>
          <li>
            <strong>Focus moves <em>into</em> the dialog on open.</strong> When the modal opens, focus must land inside it
            (the first focusable element, or the dialog container). Otherwise a keyboard user is still &quot;down the page&quot;
            behind a modal they can&apos;t see their cursor in.
          </li>
          <li>
            <strong>A focus trap.</strong> While open, <kbd>Tab</kbd> and <kbd>Shift+Tab</kbd> must cycle <em>only</em> through
            focusable elements inside the modal. Focus must not escape to the page behind it. Wrap from last element back to
            first (and first back to last on <kbd>Shift+Tab</kbd>).
          </li>
          <li>
            <strong>Escape closes, and focus returns.</strong> <kbd>Esc</kbd> closes the modal, and on close, focus returns to
            <em> the element that opened it</em> (usually the trigger button). A user should never be dumped at the top of the
            page after closing a dialog.
          </li>
          <li>
            <strong>The background is inert.</strong> Everything behind the modal should be unreachable, by mouse, keyboard,
            and screen reader. Use the <code>inert</code> attribute on the background container (or
            <code> aria-hidden=&quot;true&quot;</code> as the older fallback) so a screen reader can&apos;t wander out of the
            dialog into the frozen page.
          </li>
        </ol>
        <p className="mb-4">A condensed sketch wiring up the behavioral pieces (the trap and return-focus logic):</p>
        <pre><code>{`function Modal({ onClose, children, labelId }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    // 1. Remember who had focus, so we can restore it on close.
    const previouslyFocused = document.activeElement;

    // 2. Move focus into the dialog.
    dialogRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // 3. Focus trap: keep Tab within the dialog's focusables.
      const focusables = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();            // wrap backwards
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();           // wrap forwards
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // 4. Return focus to whatever was focused before the modal opened.
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}`}</code></pre>
        <p className="mb-4">
          Notice how much of this lives in an <em>effect with a cleanup function</em>. Setting up focus and the keydown
          listener happens on mount; tearing down the listener and returning focus happens in the cleanup. That symmetry,
          set up on open, tear down on close, is the same lifecycle discipline you saw with data fetching, applied to focus
          management.
        </p>
        <Callout variant="warn" title="aria-hidden vs inert, don&apos;t half-trap the background">
          <p>
            <code>aria-hidden=&quot;true&quot;</code> hides the background from screen readers but does <em>not</em> stop a
            keyboard user from Tabbing into it. <code>inert</code> does both, it removes the subtree from the tab order
            <em> and</em> from the accessibility tree. If you only set <code>aria-hidden</code> and skip the focus trap, a
            sighted keyboard user can Tab right out of your modal into invisible-to-screen-readers controls. Trap focus
            <em> and</em> make the background inert.
          </p>
        </Callout>
        <Callout variant="info" title="Yes, the platform has &lt;dialog&gt;">
          <p>
            The native <code>&lt;dialog&gt;</code> element with <code>showModal()</code> gives you focus trapping, Esc-to-close,
            background inerting, and the top-layer (escaping stacking contexts) <em>for free</em>. Reach for it when you can.
            We build the manual version here because the interview question is &quot;how would you make a modal accessible?&quot;,
            and knowing every piece you&apos;d otherwise get from <code>&lt;dialog&gt;</code> is exactly what proves you
            understand the problem.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-accessible-modal" moduleSlug={MODULE_SLUG} title="What makes a modal accessible">
        <Quiz
          kind="Focus management"
          question="A user opens a modal with the keyboard, tabs through it, then presses Escape to close it. Where should focus go on close?"
          options={[
            {
              label: "Back to the trigger element that opened the modal",
              correct: true,
              explanation:
                "Correct. Save document.activeElement before opening, and restore focus to it on close. Otherwise a keyboard user is dumped at the top of the page with no sense of where they were.",
            },
            {
              label: "To the top of the <body>, since the modal's DOM lives there",
              explanation:
                "Where the modal's DOM lives is irrelevant to focus management. Focus should return to the trigger so the user resumes where they left off, not jump to the body.",
            },
            {
              label: "Nowhere, the browser handles focus restoration automatically for any removed element",
              explanation:
                "The browser does NOT reliably restore focus when you remove a focused node from the DOM; focus often falls back to <body>. You must capture and restore it yourself (or use native <dialog>).",
            },
          ]}
        />
        <Quiz
          kind="Background inerting"
          question={'You set aria-hidden="true" on the page behind your modal but added no focus trap. What\'s still broken?'}
          options={[
            {
              label: "A keyboard user can still Tab out of the modal into the background, aria-hidden hides from screen readers but doesn't remove elements from the tab order",
              correct: true,
              explanation:
                "Exactly. aria-hidden only affects the accessibility tree, not focusability. You need a focus trap (or the inert attribute, which removes the subtree from BOTH the tab order and the a11y tree) to keep keyboard focus inside.",
            },
            {
              label: "Nothing, aria-hidden fully isolates the background for all users",
              explanation:
                "aria-hidden does not affect keyboard focusability. Tab still moves into the 'hidden' background, so a keyboard user escapes the modal. Use inert or a focus trap.",
            },
            {
              label: "The modal will no longer receive React context from its parents",
              explanation:
                "aria-hidden has nothing to do with React context, that flows through the React tree regardless. The real gap is that focus isn't trapped.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. REFS RECAP ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why a ref is <code>null</code> on first render, then suddenly there</h2>
        <p className="mb-4">
          To position a tooltip against a portaled layer, you have to <em>measure</em> a real DOM node, its width, its
          position on screen. That means reaching past React&apos;s abstraction to the actual element, and that&apos;s what
          refs are for. But refs have a timing rule that trips people up constantly:
        </p>
        <pre><code>{`function Measured() {
  const ref = useRef(null);

  console.log(ref.current); // null on the FIRST render

  useEffect(() => {
    console.log(ref.current); // the real <div> — runs AFTER commit
    const { width } = ref.current.getBoundingClientRect();
  }, []);

  return <div ref={ref}>measure me</div>;
}`}</code></pre>
        <p className="mb-4">
          The render that <em>returns</em> the JSX runs <strong>before</strong> React has created and attached any DOM. So
          during render, <code>ref.current</code> is still <code>null</code>, the element doesn&apos;t exist yet. React
          renders (computes the JSX), then <strong>commits</strong> (creates/updates real DOM and attaches refs), and
          <em> only then</em> are effects run. So:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>During render:</strong> <code>ref.current === null</code>. Never measure here.</li>
          <li><strong>After commit (in <code>useEffect</code>/<code>useLayoutEffect</code>):</strong> <code>ref.current</code> points at the real DOM node. Measure here.</li>
        </ul>
        <p className="mb-4">
          For measuring-then-positioning specifically, prefer <code>useLayoutEffect</code> over <code>useEffect</code>: it
          runs <em>after</em> commit but <em>before</em> the browser paints, so you can read the size and set the position in
          the same frame and avoid a visible flicker of the tooltip appearing in the wrong spot.
        </p>
        <Callout variant="insight" title="The render/commit boundary in one line">
          <p>
            A ref is <code>null</code> during render because render produces a <em>description</em> of UI, not the UI itself.
            The real node only exists after React <em>commits</em> that description to the DOM, which is why ref reads belong
            in effects, never in the render body.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. REF CALLBACKS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Ref callbacks, a function instead of a ref object</h2>
        <p className="mb-4">
          You can pass a <em>function</em> to <code>ref=</code> instead of a ref object. React calls it with the DOM node when
          the element <strong>mounts</strong> (and with <code>null</code> when it <strong>unmounts</strong>). That callback
          firing <em>is</em> your &quot;the node exists now&quot; signal, which makes it perfect for measuring exactly when
          the node attaches, without waiting for a separate effect:
        </p>
        <pre><code>{`function MeasuredOnMount() {
  const [width, setWidth] = useState(0);

  // React calls this with the node on mount, and with null on unmount.
  const measureRef = useCallback((node) => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  return <div ref={measureRef}>I measured myself: {width}px</div>;
}`}</code></pre>
        <p className="mb-4">
          Two things matter here. First, the callback receives <code>null</code> on unmount, so always guard with
          <code> if (node !== null)</code> before touching it. Second, <strong>identity matters</strong>: if you pass an
          inline arrow function, React calls it with <code>null</code> then the node on <em>every</em> render (because it
          sees a &quot;new&quot; ref each time). Wrap it in <code>useCallback</code> with a stable dependency list so it only
          fires on actual mount/unmount, unless you specifically <em>want</em> to re-measure on every render.
        </p>
        <p className="mb-4">
          Ref callbacks shine when the node you care about is dynamic, a list where you need to measure whichever item is
          currently rendered, or a layer that mounts and unmounts. The callback fires precisely at attach/detach, so you
          never have to guess whether the node is ready.
        </p>
        <Callout variant="info" title="Object ref vs callback ref, when to reach for which">
          <p>
            Use an <strong>object ref</strong> (<code>useRef</code>) when you just need a stable handle to read later in an
            effect or event handler, the common case. Use a <strong>callback ref</strong> when you need to <em>run code at
            the exact moment</em> a node attaches or detaches, measuring on mount, or wiring a node that comes and goes. Both
            are valid <code>ref=</code> values; they answer different questions.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. MERGING REFS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Merging refs, when two things need the same node</h2>
        <p className="mb-4">
          An element only has one <code>ref</code> attribute, but sometimes <em>two</em> consumers need that same node. The
          classic case: your component keeps its own ref to measure a node, <em>and</em> a parent passed down a ref expecting
          to access it too (via <code>forwardRef</code>). You can&apos;t write <code>ref=&#123;a&#125; ref=&#123;b&#125;</code>.
          The solution is a single <em>callback ref</em> that fans the node out to every ref that wants it:
        </p>
        <pre><code>{`// Assign one node to many refs (object refs or callback refs).
function mergeRefs(...refs) {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);                 // callback ref
      } else if (ref != null) {
        ref.current = node;        // object ref (useRef / forwardRef)
      }
    }
  };
}

const Field = forwardRef(function Field(props, forwardedRef) {
  const innerRef = useRef(null);   // we want to measure it ourselves

  useEffect(() => {
    // innerRef.current is the same node the parent's ref also points at
    innerRef.current?.getBoundingClientRect();
  }, []);

  // One ref attribute, fanned out to BOTH refs:
  return <input {...props} ref={mergeRefs(innerRef, forwardedRef)} />;
});`}</code></pre>
        <p className="mb-4">
          The merged ref is just a callback ref that loops over every ref it was given and assigns the node to each, calling
          functions, and setting <code>.current</code> on objects. Now both your internal measurement and the parent&apos;s
          access point at the same live node, from a single <code>ref=</code>. (Libraries ship this as
          <code> useMergeRefs</code>/<code>mergeRefs</code>; it&apos;s a five-line utility worth being able to write from
          memory.)
        </p>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            Think of <code>mergeRefs</code> as a fan-out / multiplexer: one input (the node) broadcast to N subscribers, each
            with its own way of receiving it (call me as a function vs. write to my field). It&apos;s the observer pattern
            compressed into a closure, and like any fan-out, the guard against a <code>null</code> &quot;disconnect&quot;
            event (the unmount call) is what keeps it from blowing up.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. TOOLTIP POSITIONING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Positioning a tooltip against a portaled layer</h2>
        <p className="mb-4">
          Now both halves come together. A tooltip has the <em>same</em> clipping problem a modal does, render it next to its
          trigger and an <code>overflow: hidden</code> ancestor will slice it off. So you portal the tooltip to
          <code> &lt;body&gt;</code> too. But once it&apos;s in the body, it has <em>no idea</em> where its trigger is anymore,
          they&apos;re in different parts of the DOM. You have to <strong>measure the trigger</strong> and position the
          portaled tooltip in viewport coordinates:
        </p>
        <pre><code>{`function Tooltip({ children, label }) {
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function show() {
    // Measure the trigger's position in the viewport, THEN open.
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,         // 8px below the trigger
      left: rect.left + window.scrollX + rect.width / 2, // centered on it
    });
    setOpen(true);
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              transform: "translateX(-50%)", // center on the trigger
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}`}</code></pre>
        <p className="mb-4">The pieces map exactly onto what you&apos;ve learned:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Portal</strong> the tooltip layer to <code>&lt;body&gt;</code> so no ancestor can clip it and no stacking
            context can bury it.
          </li>
          <li>
            <strong>Ref</strong> on the trigger, read <em>after</em> it exists (in the event handler, the node is mounted by
            then), to get its position via <code>getBoundingClientRect()</code>.
          </li>
          <li>
            <strong>Position</strong> the portaled layer in viewport/document coordinates, adding <code>scrollX/scrollY</code>
            because the body-level layer doesn&apos;t inherit the trigger&apos;s scroll offset.
          </li>
        </ul>
        <Callout variant="warn" title="Measure, then position, never the other way">
          <p>
            You can&apos;t position the tooltip during render: <code>getBoundingClientRect()</code> needs the node to exist,
            and on a fresh tooltip you also need the tooltip&apos;s <em>own</em> size to flip it above the trigger when there
            isn&apos;t room below. That&apos;s why real positioning runs after layout, in a <code>useLayoutEffect</code> or a
            ref callback, reading sizes, computing a spot, and writing it before paint. (Production code reaches for a library
            like Floating UI precisely because edge-flipping, collision detection, and scroll/resize updates get hairy fast.)
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do portals work, and how would you build an accessible modal?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>What a portal is.</strong> <code>createPortal(children, domNode)</code> renders DOM <em>outside</em> the
              parent&apos;s DOM hierarchy (usually into <code>&lt;body&gt;</code>) while keeping it <em>inside</em> the React
              tree, so context still flows in and events still bubble through React parents.
            </li>
            <li>
              <strong>What it solves.</strong> Escapes <code>overflow: hidden</code> clipping and stacking-context / z-index
              traps. The fix for &quot;my modal hides behind the header&quot; is rendering outside the context, not a higher
              z-index.
            </li>
            <li>
              <strong>Accessible modal = portal plus five things.</strong> <code>role=&quot;dialog&quot;</code> +
              <code> aria-modal</code> + a label; move focus in on open; trap focus (Tab cycles inside); Esc closes and focus
              returns to the trigger; background <code>inert</code>.
            </li>
            <li>
              <strong>Refs are null first, real after commit.</strong> Render produces a description; the node exists only
              after commit, so read refs in effects, not render. Use <code>useLayoutEffect</code> to measure-then-position
              without flicker.
            </li>
            <li>
              <strong>Callback refs &amp; merging.</strong> A function ref fires with the node on mount / <code>null</code> on
              unmount, ideal for measuring at attach time. Need two consumers on one node? A merged callback ref fans the
              node out to every ref.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 10. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, an accessible modal and a clip-free tooltip</h2>
        <p className="mb-4">
          Build an accessible <code>&lt;Modal&gt;</code> with <code>createPortal</code>, a focus trap, escape-to-close, and a
          merged ref, then a tooltip that positions against a portaled layer without clipping. Do the steps in order; each
          builds on the last.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Reproduce the clipping bug first.</strong> Put a plain (non-portaled) modal inside a card with
            <code> overflow: hidden</code>, <code>position: relative</code>, and a <code>transform</code> on an ancestor. Open
            it and watch it get clipped and trapped behind a sibling header. Seeing the bug is what makes the fix land.
          </li>
          <li>
            <strong>Portal the modal to <code>document.body</code>.</strong> Wrap the overlay + dialog in
            <code> createPortal(..., document.body)</code>. Confirm the clipping is gone and it now covers the full viewport.
            Click an overlay-to-close handler and verify it still fires through the React tree even though the DOM lives in the
            body.
          </li>
          <li>
            <strong>Add the semantics.</strong> Give the dialog <code>role=&quot;dialog&quot;</code>,
            <code> aria-modal=&quot;true&quot;</code>, and <code>aria-labelledby</code> pointing at the modal title&apos;s
            <code> id</code>. Make the dialog container focusable with <code>tabIndex=&#123;-1&#125;</code>.
          </li>
          <li>
            <strong>Manage focus.</strong> In a <code>useEffect</code>: save <code>document.activeElement</code>, move focus
            into the dialog on open, and in the cleanup return focus to the saved element. Open with the keyboard and confirm
            focus lands inside and comes back to the trigger on close.
          </li>
          <li>
            <strong>Trap focus and wire Escape.</strong> Add a <code>keydown</code> listener: <kbd>Esc</kbd> calls
            <code> onClose</code>; <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> cycle within the dialog&apos;s focusables (wrap last→first
            and first→last). Tab around and verify focus never escapes to the page behind.
          </li>
          <li>
            <strong>Inert the background.</strong> Set the <code>inert</code> attribute on the app root while the modal is open
            (fall back to <code>aria-hidden</code> if needed). Confirm a screen reader and the keyboard both stay inside the
            dialog.
          </li>
          <li>
            <strong>Build the tooltip with a portal.</strong> Portal the tooltip layer to <code>&lt;body&gt;</code>, ref the
            trigger, and on hover/focus read <code>getBoundingClientRect()</code> to position the layer in document
            coordinates (remember <code>scrollX/scrollY</code>). Put the whole thing inside an <code>overflow: hidden</code>
            container and confirm the tooltip is no longer clipped.
          </li>
          <li>
            <strong>Stretch, write <code>mergeRefs</code>.</strong> Make the modal&apos;s dialog a
            <code> forwardRef</code> component that <em>also</em> keeps an internal ref to measure itself, and use a merged
            callback ref so both your internal ref and the parent&apos;s forwarded ref point at the same node. Log both to
            prove they resolve to the identical element.
          </li>
        </ol>
        <Callout variant="spring" title="Acceptance criteria">
          <ul className="list-disc space-y-1 pl-6">
            <li>Modal renders via <code>createPortal</code> into <code>document.body</code> and is not clipped by an <code>overflow: hidden</code> ancestor.</li>
            <li>Has <code>role=&quot;dialog&quot;</code>, <code>aria-modal=&quot;true&quot;</code>, and an accessible name via <code>aria-labelledby</code>.</li>
            <li>Focus moves into the dialog on open and returns to the trigger on close.</li>
            <li><kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> are trapped inside; <kbd>Esc</kbd> closes the modal.</li>
            <li>Background is <code>inert</code> (or <code>aria-hidden</code>) while the modal is open.</li>
            <li>Tooltip is portaled, positioned against its measured trigger, and not clipped by an overflow ancestor.</li>
            <li><code>mergeRefs</code> fans one node out to both an internal ref and a forwarded ref (handling the <code>null</code> unmount call).</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-refs-and-positioning" moduleSlug={MODULE_SLUG} title="Ref callbacks, merging & positioning">
        <Quiz
          kind="Ref timing"
          question="Inside a component's render body, you log ref.current right after declaring const ref = useRef(null), for a <div ref={ref}>. What does the first render log, and why?"
          options={[
            {
              label: "null, render produces a description of the UI before React commits it to the DOM, so the node doesn't exist yet; ref.current is only set after commit",
              correct: true,
              explanation:
                "Exactly. React renders (computes JSX), then commits (creates DOM + attaches refs), then runs effects. During render the node hasn't been created, so ref.current is null. Read it in an effect instead.",
            },
            {
              label: "The <div> element, refs are assigned synchronously as soon as you call useRef",
              explanation:
                "useRef just creates a mutable container initialized to null. It doesn't attach any DOM, attachment happens at commit, which is after the render body runs.",
            },
            {
              label: "undefined, refs are always undefined until you manually assign them",
              explanation:
                "It's null, not undefined, because you initialized it with useRef(null). And React DOES assign it for you, at commit time, not during render.",
            },
          ]}
        />
        <Quiz
          kind="Callback refs & merging"
          question="Why does a merged ref (mergeRefs) have to be implemented as a callback ref rather than an object ref?"
          options={[
            {
              label: "Because it needs to receive the node and fan it out to several refs (calling function refs, setting .current on object refs), and only a callback ref runs your code when the node attaches/detaches",
              correct: true,
              explanation:
                "Right. An element accepts one ref. A callback ref lets you run logic at attach/detach time, so you can distribute the node to every ref you were given. It must also handle the null call on unmount.",
            },
            {
              label: "Because object refs can't store DOM nodes, only callback refs can",
              explanation:
                "Object refs absolutely store DOM nodes in .current. The reason for a callback is that you need to run distribution logic when the node attaches, an object ref alone can't fan one node out to many.",
            },
            {
              label: "Because callback refs guarantee responses arrive in order, which object refs don't",
              explanation:
                "Ordering of network responses has nothing to do with refs. The point of a callback ref here is running attach/detach logic so one node can be assigned to multiple refs.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
