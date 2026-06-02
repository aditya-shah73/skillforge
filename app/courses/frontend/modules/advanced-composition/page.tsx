import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "advanced-composition";

const CHECKPOINTS = [
  { id: "cp-slot-aschild", title: "The slot / asChild pattern" },
  { id: "cp-polymorphic-controlled", title: "Polymorphism & controlled APIs" },
  { id: "cp-headless", title: "Headless components & composition" },
];

export default function AdvancedCompositionModule() {
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
          Advanced composition, slots, polymorphism, and the patterns libraries use
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Ever wondered how Radix lets you write <code>&lt;Dialog.Trigger asChild&gt;&lt;button&gt;…&lt;/button&gt;&lt;/Dialog.Trigger&gt;</code>{" "}
          and the trigger behavior just <em>lands on your own button</em>, no extra wrapper, no styling fight? That&apos;s not magic.
          It&apos;s a handful of composition patterns you can learn in an afternoon and then see <em>everywhere</em>.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The power outlet, not the welded-on lamp</h2>
        <p className="mb-4">
          Imagine two ways a building could give you light. In the first, every room ships with a specific lamp bolted to the
          wall, a particular shape, a particular bulb, a particular shade. If you want a different lamp, too bad; you get the
          one the builder chose. In the second, the building gives you a <strong>power outlet</strong>: a clean, standardized
          interface that delivers what you need (electricity) and lets <em>you</em> plug in whatever fixture you like, a lamp,
          a fan, a charger. The outlet supplies the <em>capability</em>. You supply the <em>thing</em>.
        </p>
        <p className="mb-4">
          That is the entire philosophy behind modern design-system libraries like <strong>Radix</strong> and{" "}
          <strong>Reach UI</strong>. The old way of building a reusable component is the welded-on lamp: a <code>&lt;Button&gt;</code>{" "}
          with forty props baked in, <code>variant</code>, <code>size</code>, <code>icon</code>, <code>iconPosition</code>,
          <code>loading</code>, <code>fullWidth</code>, and the moment you need the forty-first thing, you&apos;re stuck. The new way
          is the outlet: a component that supplies <em>behavior and accessibility</em> through a clean interface and lets you plug
          your own markup and styling into it.
        </p>
        <p className="mb-4">
          This module is about the wiring inside that outlet. You&apos;ll learn the <strong>slot / <code>asChild</code> pattern</strong>{" "}
          (how a component pushes its behavior onto <em>your</em> element instead of rendering its own wrapper), <strong>polymorphic
          components</strong> (the <code>as</code> prop), <strong>controlled vs uncontrolled</strong> component APIs (the same{" "}
          <code>value</code>/<code>defaultValue</code> split you already know from form inputs, now applied to your own components),
          and <strong>headless components</strong> (all the logic and a11y, zero styling, you bring the markup).
        </p>
        <Callout variant="info" title="This builds directly on Phase 3">
          <p>
            Back in the <Link href="/courses/frontend/modules/composition-patterns" className="text-cyan-600 hover:underline">composition
            patterns</Link> module you learned <code>children</code>, render props, and compound components
            (<code>&lt;Tabs.List&gt;&lt;Tabs.Tab/&gt;</code>), and why composition beats prop-drilling configuration. Everything here is
            the <em>professional-grade</em> version of that same idea. If &quot;composition over a sea of boolean props&quot; didn&apos;t fully
            click then, it will by the end of this module, because you&apos;ll see exactly how the libraries you use every day apply it.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE PROP-SOUP PROBLEM ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The problem: a sea of boolean props</h2>
        <p className="mb-4">
          Every reusable component starts simple and then accretes props as requirements arrive. Here&apos;s the predictable
          trajectory of a <code>&lt;Button&gt;</code> that tries to anticipate every need by adding configuration:
        </p>
        <pre><code>{`// Month 1 — innocent
<Button>Save</Button>

// Month 6 — the config sea
<Button
  variant="primary"
  size="lg"
  icon={<Spinner />}
  iconPosition="left"
  loading={isSaving}
  fullWidth
  rounded
  as="a"            // wait, sometimes it's a link?
  href="/save"      // props that only apply when as="a"
  download           // props that only apply to links
  external          // ...and now we're inventing flags
/>`}</code></pre>
        <p className="mb-4">
          This is <strong>prop soup</strong>, and it fails in three specific, predictable ways:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Invalid combinations are expressible.</strong> What does <code>loading</code> + <code>href</code> mean? Can a
            link be in a loading state? The type system says yes; reality says &quot;undefined behavior.&quot; Every new boolean roughly
            <em> doubles</em> the combinations you must reason about and test.
          </li>
          <li>
            <strong>You can never anticipate everything.</strong> The day someone needs a button that&apos;s also a tooltip trigger,
            or wraps a Next.js <code>&lt;Link&gt;</code>, or renders as a <code>&lt;label&gt;</code> for a file input, there&apos;s no prop
            for that, and you&apos;re back to forking the component.
          </li>
          <li>
            <strong>The API balloons while flexibility shrinks.</strong> More props, yet you can still only do exactly what the
            author imagined. It&apos;s the welded-on lamp with a bigger control panel.
          </li>
        </ul>
        <p className="mb-4">
          Composition inverts this. Instead of the component trying to <em>be</em> everything via configuration, it supplies a
          <em> capability</em> and lets the caller compose the rest. The patterns below are the concrete techniques for doing that
          cleanly, and they&apos;re exactly what Radix and Reach are built from.
        </p>
        <Callout variant="warn" title="Booleans are a smell, not a sin">
          <p>
            A prop or two is fine, <code>disabled</code> on a real button is a genuine state. The smell is when props start
            describing <em>what to render</em> (<code>as</code>, <code>icon</code>, <code>iconPosition</code>) rather than{" "}
            <em>how to behave</em>. Anything describing markup is a candidate for composition: hand that decision back to the caller
            via <code>children</code>, slots, or a polymorphic <code>as</code>.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. THE SLOT / ASCHILD PATTERN ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The slot / <code>asChild</code> pattern</h2>
        <p className="mb-4">
          Here&apos;s the problem the slot pattern solves. A library wants to give you a <code>&lt;Dialog.Trigger&gt;</code> that knows
          how to open the dialog (it wires up <code>onClick</code>, <code>aria-haspopup</code>, <code>aria-expanded</code>, a ref
          for focus management, and more). The naive approach renders its own <code>&lt;button&gt;</code>:
        </p>
        <pre><code>{`// Library renders its OWN button — you're stuck with it
<Dialog.Trigger>Open settings</Dialog.Trigger>
// → <button aria-haspopup="dialog" ...>Open settings</button>`}</code></pre>
        <p className="mb-4">
          But what if you already have a styled <code>&lt;button&gt;</code>, or you want the trigger to be a Next.js{" "}
          <code>&lt;Link&gt;</code>, or your design-system <code>&lt;FancyButton&gt;</code>? With the naive version you get a{" "}
          <em>wrapper</em>, a button inside a button, or a div you didn&apos;t want, and a styling fight. The slot pattern fixes this
          with an <code>asChild</code> prop:
        </p>
        <pre><code>{`// asChild: DON'T render your own element — merge your behavior
// onto the single child element I give you.
<Dialog.Trigger asChild>
  <FancyButton>Open settings</FancyButton>
</Dialog.Trigger>
// → <button class="fancy" aria-haspopup="dialog" onClick={open} ...>
//      Open settings
//    </button>
// ONE element. Your markup + the library's behavior, merged.`}</code></pre>
        <p className="mb-4">
          The mental model: <strong><code>asChild</code> means &quot;I don&apos;t want your element, take all the props and behavior you
          were going to put on your element and put them on <em>my</em> child instead.&quot;</strong> No wrapper, no double element. The
          component becomes a <em>behavior</em> you slot onto markup of your choosing.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-semibold">How it works under the hood: <code>cloneElement</code> and <code>Slot</code></h3>
        <p className="mb-4">
          The classic implementation uses <code>React.cloneElement</code>. The parent takes its single child element, clones it,
          and <em>merges</em> its own props onto the clone, combining the two sets rather than overwriting:
        </p>
        <pre><code>{`function Trigger({ asChild, children, ...triggerProps }) {
  if (asChild) {
    // Take the single child and clone it with merged props.
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      ...triggerProps,            // library's behavior props
      ...child.props,             // child's own props win on conflict
      onClick: mergeHandlers(triggerProps.onClick, child.props.onClick),
      className: cx(triggerProps.className, child.props.className),
    });
  }
  // Default: render our own button.
  return <button {...triggerProps}>{children}</button>;
}`}</code></pre>
        <p className="mb-4">
          The subtlety is the <strong>merge</strong>. You can&apos;t just spread <code>triggerProps</code> over the child and call it
          done, because both sides may define <code>onClick</code>, <code>className</code>, <code>style</code>, or a <code>ref</code>.
          A correct slot:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Composes event handlers</strong>, both the library&apos;s <code>onClick</code> and yours should fire, in order.</li>
          <li><strong>Merges <code>className</code> and <code>style</code></strong>, concatenate, don&apos;t clobber.</li>
          <li><strong>Forwards the ref</strong>, the library needs a ref to your element for focus/positioning, but if you also passed a ref it must reach you too (a merged ref).</li>
        </ul>
        <p className="mb-4">
          This is fiddly enough that Radix ships a primitive called <code>&lt;Slot&gt;</code> that does all of it correctly.{" "}
          <code>asChild</code> is implemented by rendering through <code>&lt;Slot&gt;</code> instead of a host element. You almost
          never hand-roll the merge in production, but you absolutely should understand it, because it explains every &quot;why did my{" "}
          <code>onClick</code> stop firing&quot; or &quot;why is my <code>className</code> missing&quot; bug you&apos;ll hit with slotted components.
        </p>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;<code>asChild</code> (the slot pattern) tells a component to <em>not</em> render its own DOM element and instead merge
            its props and behavior onto the single child element you pass it, typically via <code>cloneElement</code> or a{" "}
            <code>Slot</code> primitive. It eliminates wrapper elements and lets you bring your own markup while the library brings
            the behavior and accessibility. The hard part is merging, event handlers must compose, <code>className</code>/
            <code>style</code> must concatenate, and refs must be forwarded and merged.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. POLYMORPHIC COMPONENTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Polymorphic components, the <code>as</code> prop</h2>
        <p className="mb-4">
          A close cousin of the slot pattern is the <strong>polymorphic component</strong>: one component that can render as
          different underlying elements, chosen by an <code>as</code> prop. You&apos;ve seen this in libraries like Chakra,
          styled-components, and MUI:
        </p>
        <pre><code>{`<Text as="h1">A heading</Text>      // renders <h1>
<Text as="p">A paragraph</Text>     // renders <p>
<Text as="label">A label</Text>     // renders <label>

<Box as="section" />                // renders <section>
<Button as="a" href="/home">Home</Button>  // a button-styled link`}</code></pre>
        <p className="mb-4">
          The implementation is a one-liner at its core: read <code>as</code>, default it to some element, and render that:
        </p>
        <pre><code>{`function Text({ as: Component = "span", children, ...rest }) {
  return <Component {...rest}>{children}</Component>;
}`}</code></pre>
        <p className="mb-4">
          The <code>as</code> prop is renamed to <code>Component</code> (capitalized) on destructure, because JSX treats a
          lowercase tag as a DOM element and a Capitalized identifier as a component/variable, so{" "}
          <code>&lt;Component&gt;</code> renders whatever element or component string <code>as</code> held.
        </p>
        <p className="mb-4">
          <strong><code>as</code> vs <code>asChild</code>, when does each fit?</strong> They solve overlapping problems from
          opposite directions:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>as</code></strong>, the component owns the children and styling; you only swap the <em>tag</em>. Great for
            primitives like <code>&lt;Text&gt;</code>/<code>&lt;Box&gt;</code> where the markup is trivial and you mainly care
            about semantics (<code>h1</code> vs <code>p</code>).
          </li>
          <li>
            <strong><code>asChild</code></strong>, <em>you</em> own the child element entirely (your component, your props, your
            children) and the parent merges behavior onto it. Great when the child is a rich, already-styled component you
            don&apos;t want the library to recreate.
          </li>
        </ul>
        <Callout variant="warn" title="Polymorphism is a TypeScript minefield">
          <p>
            Done right, a polymorphic component&apos;s props should change based on <code>as</code>: <code>as=&quot;a&quot;</code> should
            allow <code>href</code>; <code>as=&quot;button&quot;</code> should allow <code>type</code> but not <code>href</code>. Typing
            this fully (with correct ref types per element) is genuinely hard, it&apos;s why libraries ship dedicated{" "}
            <code>PolymorphicComponentProps</code> helper types. If an interviewer asks &quot;what&apos;s the downside of the <code>as</code>{" "}
            prop,&quot; this is the answer: the runtime is trivial, the <em>types</em> are not.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-slot-aschild" moduleSlug={MODULE_SLUG} title="The slot / asChild pattern">
        <Quiz
          kind="asChild semantics"
          question="You write <Tooltip.Trigger asChild><MyButton /></Tooltip.Trigger>. What does asChild cause the library to do?"
          options={[
            {
              label: "Skip rendering its own element and merge its trigger props/behavior onto MyButton, producing one element, not a wrapper",
              correct: true,
              explanation:
                "Exactly. asChild means 'don't render your own element, take the props and behavior you'd have put on your element and merge them onto my single child.' The result is one element carrying both your markup and the library's behavior.",
            },
            {
              label: "Render MyButton inside the library's own <button>, nesting two buttons",
              explanation:
                "That's the wrapper problem asChild exists to avoid. Without asChild you'd get nesting; with asChild the library merges onto your child instead of wrapping it.",
            },
            {
              label: "Ignore MyButton and render the library's default trigger button styled like MyButton",
              explanation:
                "No, asChild keeps YOUR element (MyButton). It doesn't recreate or restyle a default element; it merges behavior onto the one you passed.",
            },
            {
              label: "Throw, because asChild only accepts a string like a DOM tag name",
              explanation:
                "asChild takes a single React element child, not a string. (The string-tag approach is the separate `as` prop pattern.)",
            },
          ]}
        />
        <Quiz
          kind="The merge"
          question="A correct Slot/asChild implementation must do something more than just spread its props onto the child. What is the critical extra step?"
          options={[
            {
              label: "Merge overlapping props, compose both onClick handlers, concatenate className/style, and forward/merge refs, rather than letting one side clobber the other",
              correct: true,
              explanation:
                "Right. Both the library and the child may define onClick, className, style, and ref. A naive spread silently drops one side. Slot composes handlers, concatenates className/style, and merges refs so both the behavior and your markup survive.",
            },
            {
              label: "Wrap the child in React.memo so it never re-renders",
              explanation:
                "Memoization is unrelated to slotting. The issue is prop collision (onClick, className, ref), not render frequency.",
            },
            {
              label: "Convert the child from a function component to a class component so it can hold a ref",
              explanation:
                "Function components handle refs fine via forwardRef. No conversion is needed; the requirement is merging the ref, not changing component type.",
            },
            {
              label: "Call the child as a function instead of rendering it as JSX",
              explanation:
                "That's the render-props pattern, not slotting. asChild clones/merges onto an element child via cloneElement or Slot, it doesn't call children as a function.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. CONTROLLED VS UNCONTROLLED ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Controlled vs uncontrolled component APIs</h2>
        <p className="mb-4">
          You already met this distinction for <em>form inputs</em> in Phase 5: a controlled input takes <code>value</code> +{" "}
          <code>onChange</code> (you own the state), while an uncontrolled input takes <code>defaultValue</code> (the DOM owns the
          state). Well-designed components, Radix&apos;s <code>&lt;Tabs&gt;</code>, <code>&lt;Accordion&gt;</code>,{" "}
          <code>&lt;Dialog&gt;</code>, expose the <em>exact same dual API</em> for their own state. This is a deliberate design
          convention, not an accident.
        </p>
        <pre><code>{`// UNCONTROLLED — the component owns its open state internally.
// You set the starting value and forget about it.
<Tabs defaultValue="account">
  <Tabs.Tab value="account">Account</Tabs.Tab>
  <Tabs.Tab value="password">Password</Tabs.Tab>
</Tabs>

// CONTROLLED — YOU own the state; the component reflects it
// and tells you when the user wants it to change.
const [tab, setTab] = useState("account");
<Tabs value={tab} onValueChange={setTab}>
  <Tabs.Tab value="account">Account</Tabs.Tab>
  <Tabs.Tab value="password">Password</Tabs.Tab>
</Tabs>`}</code></pre>
        <p className="mb-4">
          Notice the naming convention that mirrors form inputs exactly:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Uncontrolled:</strong> a <code>defaultValue</code> (or <code>defaultOpen</code>) prop, a <em>starting</em>{" "}
            value the component then manages itself. You read it once at mount; changing it later does nothing.
          </li>
          <li>
            <strong>Controlled:</strong> a <code>value</code> (or <code>open</code>) prop plus a change callback named{" "}
            <code>onValueChange</code> (or <code>onOpenChange</code>). The component is now a pure reflection of <em>your</em> state
            and never updates on its own, it just <em>requests</em> changes through the callback.
          </li>
        </ul>
        <p className="mb-4">
          Supporting both from one component is a small, well-known pattern. The component keeps internal state for the
          uncontrolled case, but if a <code>value</code> prop is present, that prop wins and internal state is ignored:
        </p>
        <pre><code>{`function useControllableState({ value, defaultValue, onChange }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setState = (next) => {
    if (!isControlled) setInternal(next); // only manage our own state when uncontrolled
    onChange?.(next);                      // always tell the parent what was requested
  };

  return [current, setState];
}`}</code></pre>
        <p className="mb-4">
          The rule that makes this safe: <strong>a component is controlled if and only if its <code>value</code> prop is{" "}
          <em>not</em> <code>undefined</code>, and it must not switch modes during its lifetime.</strong> Going from a defined{" "}
          <code>value</code> to <code>undefined</code> (or vice versa) is the source of React&apos;s famous &quot;a component is
          changing an uncontrolled input to be controlled&quot; warning.
        </p>
        <Callout variant="info" title="Why offer both at all?">
          <p>
            <strong>Uncontrolled</strong> is the ergonomic default, most callers just want a working tabs widget and don&apos;t care
            to own its state. <strong>Controlled</strong> is the escape hatch for when you <em>do</em> need to drive it: sync the
            active tab to the URL, open a dialog from a keyboard shortcut, or persist the selection. Offering both means the simple
            case stays simple and the complex case stays <em>possible</em>, without two different components.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. HEADLESS COMPONENTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Headless components, all logic, zero styling</h2>
        <p className="mb-4">
          Pull the previous patterns together and you arrive at the idea that defines this whole generation of libraries: the{" "}
          <strong>headless component</strong>. A headless component provides <em>behavior, state, and accessibility</em>, keyboard
          navigation, focus management, ARIA roles and attributes, the controlled/uncontrolled logic, and provides{" "}
          <strong>no styling and (often) no specific markup</strong>. You bring the look; it brings the brains.
        </p>
        <p className="mb-4">
          The name is the metaphor: it&apos;s a body with no head. Radix Primitives, Reach UI, Headless UI, TanStack Table, and
          downshift are all headless. The reasoning is sharp: <strong>accessibility and interaction logic are hard, universal, and
          worth sharing; visual design is easy-ish, specific, and not worth dictating.</strong> So libraries ship the hard,
          universal part and stay completely out of your visual decisions.
        </p>
        <pre><code>{`// A headless library gives you behavior + a11y, you supply markup & styles.
function FilterMenu() {
  return (
    <Menu>
      {/* asChild lets the trigger be YOUR styled button */}
      <Menu.Trigger asChild>
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-white">
          Filters
        </button>
      </Menu.Trigger>

      {/* You style the list & items; the library wires up
          role="menu", arrow-key navigation, focus, Esc-to-close, etc. */}
      <Menu.Items className="rounded-md border bg-white shadow-lg">
        <Menu.Item className="px-3 py-2 hover:bg-slate-100">Newest</Menu.Item>
        <Menu.Item className="px-3 py-2 hover:bg-slate-100">Oldest</Menu.Item>
        <Menu.Item className="px-3 py-2 hover:bg-slate-100">Popular</Menu.Item>
      </Menu.Items>
    </Menu>
  );
}`}</code></pre>
        <p className="mb-4">
          Look at what you did <em>not</em> write: <code>role=&quot;menu&quot;</code>, <code>role=&quot;menuitem&quot;</code>,{" "}
          <code>aria-expanded</code>, <code>aria-activedescendant</code>, the arrow-key handler that moves a roving{" "}
          <code>tabindex</code>, the <code>Escape</code>-to-close and click-outside logic, the focus return to the trigger on
          close. That&apos;s <em>dozens</em> of WAI-ARIA details that are devastatingly easy to get subtly wrong, and the library
          handles all of them. You wrote only <code>className</code>s.
        </p>
        <p className="mb-4">
          This is the natural endpoint of every pattern in this module. The headless component uses <strong>compound
          components</strong> (<code>Menu.Trigger</code>, <code>Menu.Items</code>, <code>Menu.Item</code> sharing state via context,
          straight from Phase 3), <strong><code>asChild</code> slots</strong> so its parts merge onto your markup, and the{" "}
          <strong>controlled/uncontrolled</strong> API so you can drive its open state when you need to. Composition is the thread
          that ties them together.
        </p>
        <Callout variant="insight" title="Headless vs styled component libraries">
          <p>
            This is why the ecosystem split in two. <strong>Styled</strong> libraries (Material UI, Ant Design) give you{" "}
            <em>behavior + their look</em>, fast to start, but fighting their styles to match <em>your</em> brand is the
            recurring pain. <strong>Headless</strong> libraries (Radix, Reach, Headless UI) give you <em>behavior only</em>, a bit
            more work up front to style, but zero style-override battles and pixel-perfect fit to your design system. Tools like{" "}
            shadcn/ui are literally &quot;headless Radix + pre-written Tailwind styles you copy into your repo&quot;, the best of both.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-polymorphic-controlled" moduleSlug={MODULE_SLUG} title="Polymorphism & controlled APIs">
        <Quiz
          kind="as vs asChild"
          question="You have a richly-styled <FancyButton> component and you want a library's dialog trigger to use it as the trigger, with no extra wrapper element. Which pattern fits, and why?"
          options={[
            {
              label: "asChild, you own the whole child element (FancyButton, its props and children), and the trigger merges its behavior onto it",
              correct: true,
              explanation:
                "Correct. asChild is for when YOU own a complete child element and want the parent to merge behavior onto it. The `as` prop is for swapping the tag of a component that owns its own children/styling, not for slotting your own rich component in.",
            },
            {
              label: "The `as` prop, pass as={FancyButton} so the trigger renders FancyButton instead of a button",
              explanation:
                "`as` swaps the underlying tag/component a primitive renders, but the primitive still owns the children and props. For slotting in your own complete, styled element with its own children, asChild is the right tool.",
            },
            {
              label: "Neither, you must fork the library to use a custom trigger element",
              explanation:
                "No forking needed. asChild exists precisely to let you bring your own element while the library brings the behavior.",
            },
            {
              label: "Render FancyButton inside the trigger normally; the wrapper is unavoidable",
              explanation:
                "The wrapper IS avoidable, that's the entire point of asChild. Rendering normally gives you the nested-element wrapper you're trying to eliminate.",
            },
          ]}
        />
        <Quiz
          kind="Controlled detection"
          question="A reusable <Toggle> supports both a `pressed` (controlled) and `defaultPressed` (uncontrolled) prop. How should it decide whether it's controlled on a given render?"
          options={[
            {
              label: "It's controlled if and only if the `pressed` prop is not undefined; in controlled mode it ignores internal state and only calls onPressedChange",
              correct: true,
              explanation:
                "Right. The presence (not-undefined) of the value prop determines control mode. When controlled, the component renders the prop and reports requested changes via the callback, never mutating internal state. Switching modes mid-life triggers React's controlled/uncontrolled warning.",
            },
            {
              label: "It's controlled if `defaultPressed` was omitted",
              explanation:
                "Control mode is decided by the VALUE prop (`pressed`), not by whether the default was provided. defaultPressed only seeds the uncontrolled internal state.",
            },
            {
              label: "It's controlled whenever an onPressedChange handler is passed",
              explanation:
                "An onChange handler is useful in BOTH modes (uncontrolled components can still notify you). The controlled signal is the presence of the `pressed` value prop, not the callback.",
            },
            {
              label: "It should look at whether the parent re-renders frequently",
              explanation:
                "Render frequency has nothing to do with control mode. Controlled-ness is determined purely by whether the value prop is defined.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 7. WHY COMPOSITION WINS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why composition beats configuration (the through-line)</h2>
        <p className="mb-4">
          Step back and notice that every pattern here is the same move: <strong>hand a decision back to the caller via
          composition instead of trying to encode it as configuration.</strong> Compare the two philosophies head-on:
        </p>
        <pre><code>{`// CONFIGURATION — the component tries to anticipate everything.
// New requirement => new prop => combinatorial explosion.
<Select
  options={opts}
  searchable
  clearable
  multi
  creatable
  renderOption={fn}
  renderValue={fn}
  groupBy={fn}
  // ...and you STILL can't do the 30th thing
/>

// COMPOSITION — the component supplies behavior; you assemble the parts.
// New requirement => new arrangement of existing pieces. No new props.
<Select>
  <Select.Trigger asChild><MyButton /></Select.Trigger>
  <Select.Content>
    <Select.Search />
    {opts.map((o) => (
      <Select.Option key={o.id} value={o.id}>{o.label}</Select.Option>
    ))}
  </Select.Content>
</Select>`}</code></pre>
        <p className="mb-4">
          The configuration API grows without bound and still can&apos;t cover the long tail. The compositional API stays small,
          a handful of parts, yet covers cases the author never imagined, because <em>you</em> arrange the parts and bring your
          own elements. That&apos;s the payoff of <code>children</code>, compound components, slots, and polymorphism working
          together. It&apos;s the exact lesson from Phase 3, now operating at the scale of an entire design system.
        </p>
        <Callout variant="warn" title="Composition isn't free, know the cost">
          <p>
            Compositional APIs ask more of the caller (you must assemble parts, not just set props) and are harder to <em>fully</em>{" "}
            type. For a tiny internal widget used in one place, a couple of props is genuinely simpler, don&apos;t cargo-cult a
            compound/slot API onto something that doesn&apos;t need it. The pattern earns its keep when a component is <em>reused
            widely</em> with <em>varied</em> markup needs. That&apos;s exactly the situation a design-system library is in, and exactly
            why they all converged here.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do libraries like Radix compose?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Slot / <code>asChild</code>.</strong> A component renders <em>no</em> element of its own and merges its props
              and behavior onto the single child you pass, via <code>cloneElement</code> or a <code>Slot</code> primitive. The hard
              part is the merge: compose <code>onClick</code> handlers, concatenate <code>className</code>/<code>style</code>,
              forward and merge refs.
            </li>
            <li>
              <strong>Polymorphism (<code>as</code>).</strong> One component renders as different tags via an <code>as</code> prop,
              trivial at runtime, hard to type fully.
            </li>
            <li>
              <strong>Controlled vs uncontrolled.</strong> Same split as form inputs: <code>defaultValue</code> (component owns
              state) vs <code>value</code> + <code>onValueChange</code> (you own state). Controlled iff the value prop is{" "}
              <em>not</em> <code>undefined</code>; never switch modes.
            </li>
            <li>
              <strong>Headless.</strong> Behavior + state + accessibility, zero styling, you bring the markup. Logic/a11y is hard
              and universal; styling is easy and specific.
            </li>
            <li>
              <strong>Composition over config.</strong> <code>children</code>, compound components, and slots beat a sea of boolean
              props because new needs become new <em>arrangements</em>, not new props.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, build a headless <code>&lt;Menu&gt;</code></h2>
        <p className="mb-4">
          You&apos;ll build a headless <code>&lt;Menu&gt;</code> from scratch: a trigger plus a list of items, with keyboard
          navigation, a controlled/uncontrolled open API, and an <code>asChild</code> slot so the trigger can be any element, and
          <strong> no styling baked in</strong>. By building it yourself you&apos;ll understand what Radix is doing for you every day.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Set up the compound component + context.</strong> Create <code>&lt;Menu&gt;</code>,{" "}
            <code>&lt;Menu.Trigger&gt;</code>, <code>&lt;Menu.Items&gt;</code>, and <code>&lt;Menu.Item&gt;</code>. <code>Menu</code>{" "}
            provides a context holding the open state and a way to set it; the parts read it via <code>useContext</code>, exactly
            the compound-component pattern from <Link href="/courses/frontend/modules/composition-patterns" className="text-cyan-600 hover:underline">Phase 3</Link>.
            Render <em>no</em> styling, only structural elements and ARIA.
          </li>
          <li>
            <strong>Make the open state controllable.</strong> Write the <code>useControllableState</code> helper from the
            controlled-vs-uncontrolled section. <code>&lt;Menu&gt;</code> should accept <code>open</code> +{" "}
            <code>onOpenChange</code> (controlled) <em>or</em> <code>defaultOpen</code> (uncontrolled). Verify both: drive it from a
            parent <code>useState</code> <em>and</em> let it manage itself.
          </li>
          <li>
            <strong>Add the <code>asChild</code> slot to the trigger.</strong> Give <code>&lt;Menu.Trigger&gt;</code> an{" "}
            <code>asChild</code> prop. When set, use <code>cloneElement</code> to merge the trigger&apos;s behavior onto the single
            child: compose <code>onClick</code> (your toggle + the child&apos;s own handler), merge <code>className</code>, and wire{" "}
            <code>aria-haspopup</code>/<code>aria-expanded</code>. When unset, render a default <code>&lt;button&gt;</code>. Confirm{" "}
            <code>&lt;Menu.Trigger asChild&gt;&lt;a href=&quot;#&quot;&gt;Open&lt;/a&gt;&lt;/Menu.Trigger&gt;</code> produces one element, not a wrapper.
          </li>
          <li>
            <strong>Implement keyboard navigation &amp; a11y.</strong> On the items list put <code>role=&quot;menu&quot;</code>; on each
            item <code>role=&quot;menuitem&quot;</code>. Handle <code>ArrowDown</code>/<code>ArrowUp</code> to move focus between items
            (a roving <code>tabIndex</code>), <code>Escape</code> to close and return focus to the trigger, and{" "}
            <code>Enter</code>/<code>Space</code> to activate an item. This is the &quot;hard, universal&quot; part headless libraries
            exist to own.
          </li>
          <li>
            <strong>Prove the &quot;no styling&quot; claim.</strong> Render the same <code>&lt;Menu&gt;</code> twice with completely
            different <code>className</code>s, once looking like a dropdown, once like a sidebar list. Same behavior, different
            look, zero changes to the <code>Menu</code> internals. That&apos;s headless working as intended.
          </li>
          <li>
            <strong>Stretch, add click-outside and a polymorphic item.</strong> Close the menu when the user clicks outside it
            (a <code>useEffect</code> with a document listener, cleaned up properly). Then give <code>&lt;Menu.Item&gt;</code> an{" "}
            <code>as</code> prop so an item can render as a <code>&lt;a&gt;</code> link or a <code>&lt;button&gt;</code> while
            keeping its menu behavior.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, headless components are the front-end version of a well-designed <em>library vs
            framework</em> split. A framework (styled component lib) calls your code and dictates the shape; a library (headless)
            you call and assemble yourself. The slot/<code>asChild</code> merge is dependency-injection-flavored, you inject your
            element and the component decorates it with behavior, rather than the component constructing the element itself. Same
            inversion-of-control instinct, applied to UI.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-headless" moduleSlug={MODULE_SLUG} title="Headless components & composition">
        <Quiz
          kind="Headless definition"
          question="What does a 'headless' component library like Radix Primitives or Reach UI provide, and what does it deliberately leave to you?"
          options={[
            {
              label: "It provides behavior, state, and accessibility (keyboard nav, focus, ARIA); you provide the markup and all styling",
              correct: true,
              explanation:
                "Exactly. Headless = 'body without a head': the hard, universal logic and a11y are shipped; the specific, easy-to-vary visual layer is left entirely to you. That's why there are no style-override battles.",
            },
            {
              label: "It provides fully-styled components matching Material Design; you override CSS variables to theme them",
              explanation:
                "That describes a STYLED library (like MUI). Headless libraries ship no styling at all, overriding their look isn't needed because there's nothing to override.",
            },
            {
              label: "It provides the markup and styling; you provide the accessibility and keyboard handling",
              explanation:
                "Backwards. The whole value of headless is that the LIBRARY owns the hard a11y/keyboard logic; you own the markup and styling.",
            },
            {
              label: "It provides server-side rendering only; client interactivity is your responsibility",
              explanation:
                "Headless is about the styling/behavior split, not SSR. The library owns client interactivity (keyboard, focus, ARIA); you own the visual layer.",
            },
          ]}
        />
        <Quiz
          kind="Composition over config"
          question="Why do design-system libraries favor compound components + slots over a single component with many boolean/config props?"
          options={[
            {
              label: "New requirements become new arrangements of existing parts rather than new props, so the API stays small while covering cases the author never anticipated",
              correct: true,
              explanation:
                "Right. Configuration APIs grow without bound and still can't cover the long tail; each boolean roughly doubles the combinations to reason about. Composition keeps the surface small and hands arrangement (and your own markup) back to the caller.",
            },
            {
              label: "Compositional APIs are always simpler for every use case, including tiny one-off widgets",
              explanation:
                "Not always, for a tiny single-use widget, a couple of props is genuinely simpler. Composition earns its keep when a component is reused widely with varied markup needs, which is exactly a design system's situation.",
            },
            {
              label: "Boolean props are impossible to type in TypeScript, so they must be avoided",
              explanation:
                "Booleans type fine. The problem isn't typeability, it's combinatorial explosion and inability to anticipate every need. (Ironically, polymorphic/composition APIs are often HARDER to type fully.)",
            },
            {
              label: "Composition removes the need for React context entirely",
              explanation:
                "The opposite, compound components typically RELY on context to share state between the parts (Menu sharing open state with Menu.Trigger/Menu.Items). Composition uses context, it doesn't remove it.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
