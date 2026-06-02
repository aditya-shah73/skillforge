import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "composition-patterns";

const CHECKPOINTS = [
  { id: "cp-children-as-api", title: "`children` as the most underrated API" },
  { id: "cp-render-props", title: "Render props, passing behavior down" },
  { id: "cp-compound-components", title: "Compound components, shared context" },
];

export default function CompositionPatternsModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 3 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Composition patterns, children, render props, and compound components
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The hardest part of React isn&apos;t hooks, it&apos;s API design. Three patterns cover 80% of the design-system components you&apos;ll ever write. Master them and you stop prop-drilling configuration.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Imagine a picture frame. A bad frame says <em>&quot;tell me what photo you want, what mat color, what border thickness, and I&apos;ll build it.&quot;</em>{" "}A good frame says <em>&quot;put whatever you want inside this opening; I&apos;ll handle the frame.&quot;</em>{" "}The good frame doesn&apos;t know about your photo; you don&apos;t have to teach it.
        </p>
        <p>
          Most beginner React APIs are bad frames, long prop lists trying to describe everything the caller might want. Composition turns them into good frames: the component handles a small concern, and the caller fills in the rest as <strong>children</strong>.
        </p>
      </section>

      <section>
        <h2><code>children</code>,{" "}the simplest and most underrated API</h2>
        <p>
          Anything between a component&apos;s tags is its <code>children</code>{" "}prop. It can be JSX, strings, fragments, arrays, whatever React can render.
        </p>
        <pre><code>{`function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// Usage
<Card title="Hello">
  <p>Anything goes here — text, images, other components.</p>
  <button>Even interactive bits.</button>
</Card>`}</code></pre>
        <p>
          The first instinct of many devs is to add a <code>content</code>{" "}prop and pass a string. That doesn&apos;t scale, you end up with <code>contentTitle</code>, <code>contentBody</code>, <code>contentAction</code>,{" "}each new feature adds a new prop. <code>children</code>{" "}sidesteps all of that.
        </p>
        <Callout variant="insight" title="When to reach for children first">
          If a prop describes <em>what should appear inside</em>, make it <code>children</code>. Reserve named props for <em>configuration</em>,{" "}<code>variant</code>, <code>size</code>, <code>onClose</code>,{" "}not content.
        </Callout>
      </section>

      <section>
        <h2>The &quot;slot&quot; pattern, named child regions</h2>
        <p>
          Sometimes you need multiple insertion points. Layout components often want a header, body, and footer. You can use named props that accept <code>ReactNode</code>:
        </p>
        <pre><code>{`type LayoutProps = {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;  // main content
  footer?: React.ReactNode;
};

function Layout({ header, sidebar, children, footer }: LayoutProps) {
  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div className="col-span-2">{header}</div>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <div className="col-span-2">{footer}</div>
    </div>
  );
}`}</code></pre>
        <p>
          Each slot accepts <code>ReactNode</code>, so the caller can put anything inside. The component decides the layout; the caller decides the content.
        </p>
      </section>

      <Checkpoint id="cp-children-as-api" moduleSlug={MODULE_SLUG} title="`children` as the most underrated API">
        <Quiz
          kind="Quick check"
          question="You're designing a `Modal` component. The caller wants to put arbitrary content inside, text, forms, images. What's the cleanest prop API?"
          options={[
            { label: "A `content: string` prop.", explanation: "Wrong, strings can't render forms or images. You'd need new props for each new piece of content." },
            { label: "A `content: ReactNode` prop.", explanation: "Workable but unidiomatic, `children` is the React-native way to pass renderable content." },
            { label: "Use `children`, anything between `<Modal>...</Modal>` becomes content.", correct: true, explanation: "Right, `children` is the standard slot for arbitrary content. It composes naturally with any JSX." },
            { label: "Multiple boolean props like `showForm`, `showImage`.", explanation: "Wrong, that hardcodes the modal to known content types and explodes combinatorially as features grow." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Render props, passing <em>behavior</em>{" "}as children</h2>
        <p>
          Sometimes the parent component owns state or behavior that the child needs to render with. A render prop is a <code>children</code>{" "}(or named prop) that is a <em>function</em>{" "}receiving the parent&apos;s state.
        </p>
        <pre><code>{`function MouseTracker({ children }: { children: (pos: {x: number, y: number}) => React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return <>{children(pos)}</>;
}

// Usage — the parent owns the tracking; the caller decides how to render it
<MouseTracker>
  {(pos) => <div>{pos.x}, {pos.y}</div>}
</MouseTracker>`}</code></pre>
        <p>
          The pattern lets one component <em>own a concern</em>{" "}(tracking the mouse) and another <em>own the presentation</em>. The contract is the function signature.
        </p>
        <Callout variant="info" title="Render props vs hooks">
          In 2025, most render-prop use cases are better served by a custom hook, <code>const pos = useMouse();</code>{" "}is simpler than a wrapping component. Render props still shine when (a) you need a component to participate in the React tree (e.g. for portals, error boundaries, layout effects) or (b) third-party libraries already use the pattern (Headless UI, downshift, react-window).
        </Callout>
      </section>

      <Checkpoint id="cp-render-props" moduleSlug={MODULE_SLUG} title="Render props, passing behavior down">
        <Quiz
          kind="Scenario"
          question="A library exposes a `<Listbox>` that calls `children` with `{ open, items, selected }`. Why is this useful?"
          options={[
            { label: "It avoids React rendering, saving performance.", explanation: "Wrong, it still renders. The render prop is about API shape, not performance." },
            { label: "It lets the consumer fully control rendering while the library owns the state and keyboard handling.", correct: true, explanation: "Right, that's the headless-UI pattern. The library handles a11y, focus management, state; the consumer styles however they like." },
            { label: "It's required for accessibility.", explanation: "Wrong, accessibility can be solved many ways. The render prop is one good way, not the only way." },
            { label: "It works without React.", explanation: "Wrong, it's a React-specific pattern." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Compound components, shared state via context</h2>
        <p>
          The most powerful pattern in design systems: a parent and several specially-named children that share state implicitly, without prop-drilling.
        </p>
        <pre><code>{`// Usage
<Disclosure>
  <Disclosure.Button>Show details</Disclosure.Button>
  <Disclosure.Panel>
    <p>Hidden content.</p>
  </Disclosure.Panel>
</Disclosure>`}</code></pre>
        <p>
          How it&apos;s built:
        </p>
        <pre><code>{`import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; toggle: () => void };
const DisclosureContext = createContext<Ctx | null>(null);

function useDisclosureContext() {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error("Disclosure.* must be used inside <Disclosure>");
  return ctx;
}

function Disclosure({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);
  return (
    <DisclosureContext.Provider value={{ open, toggle }}>
      {children}
    </DisclosureContext.Provider>
  );
}

function Button({ children }: { children: React.ReactNode }) {
  const { open, toggle } = useDisclosureContext();
  return (
    <button onClick={toggle} aria-expanded={open}>
      {children}
    </button>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  const { open } = useDisclosureContext();
  if (!open) return null;
  return <div>{children}</div>;
}

Disclosure.Button = Button;
Disclosure.Panel = Panel;
export { Disclosure };`}</code></pre>
        <p>
          What this buys you:
        </p>
        <ul>
          <li><strong>No prop drilling.</strong>{" "}The button doesn&apos;t need <code>onClick</code>; the panel doesn&apos;t need <code>open</code>. They read context.</li>
          <li><strong>Reorderable.</strong>{" "}The caller can put the button below the panel, between two panels, wrap them in a fragment, the compound component still works.</li>
          <li><strong>Composable.</strong>{" "}A consumer can wrap <code>Disclosure.Button</code>{" "}in their own styling component without breaking the link.</li>
          <li><strong>Refusable.</strong>{" "}The <code>useDisclosureContext</code>{" "}guard throws if a child is used outside its parent, failing loudly instead of silently.</li>
        </ul>
        <Callout variant="warn" title="Don't over-context">
          Compound components shine for <em>local, scoped</em>{" "}shared state, a single <code>Disclosure</code>, a single <code>Tabs</code>. Don&apos;t use them for app-wide state (auth, theme), that&apos;s what a top-level context provider is for. The compound pattern is about <em>component-internal</em>{" "}coordination.
        </Callout>
      </section>

      <section>
        <h2>Composition over configuration, the design principle</h2>
        <p>
          A component should expose the smallest API that solves the concern. When you find yourself adding a new prop for every consumer&apos;s edge case, you&apos;re using configuration where you should be using composition.
        </p>
        <pre><code>{`// ❌ Configuration creep — every new feature adds a prop
<Card
  title="Title"
  showSubtitle
  subtitle="Subtitle"
  showFooter
  footerButtons={[{ label: "OK", onClick: ... }]}
  variant="bordered"
  collapsible
  defaultCollapsed={false}
/>

// ✅ Composition — caller decides what's in there
<Card variant="bordered">
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>
    <Button>OK</Button>
  </Card.Footer>
</Card>`}</code></pre>
        <p>
          The configuration version has a fixed set of features. The composition version has none, but every feature the consumer needs, they can build with the parts.
        </p>
      </section>

      <Checkpoint id="cp-compound-components" moduleSlug={MODULE_SLUG} title="Compound components, shared context">
        <Quiz
          kind="Scenario"
          question="A consumer writes `<Disclosure.Button>` outside any `<Disclosure>` parent. What should the implementation do?"
          options={[
            { label: "Silently no-op.", explanation: "Wrong, silent failures hide bugs." },
            { label: "Render with default state.", explanation: "Wrong, there's no defensible default. The component depends on its parent." },
            { label: "Throw an error from the context-reading hook: 'must be used inside <Disclosure>'.", correct: true, explanation: "Right, fail loudly at dev time. The error message points the consumer to the fix immediately." },
            { label: "Return null.", explanation: "Wrong, that's a silent failure with no debugging signal." },
          ]}
        />
        <Quiz
          kind="Quick check"
          question="When should you reach for a render prop instead of a custom hook in 2025?"
          options={[
            { label: "Always, render props are cleaner.", explanation: "Wrong, hooks are usually simpler. Render props are situational." },
            { label: "When the behavior needs to participate in the React tree (portals, error boundaries, library APIs that take a component, headless UI patterns).", correct: true, explanation: "Right, those cases need a component, not just a hook. Render props give you both: a component that owns the work and a callable child for rendering." },
            { label: "When you want to opt out of hooks.", explanation: "Wrong, render props don't help you avoid hooks. The hosting component still uses them internally." },
            { label: "When you need server-side rendering.", explanation: "Wrong, SSR works fine with both patterns." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The 60-second answer (memorize this)</h2>
        <ul>
          <li><strong><code>children</code></strong>{" "}is the most underrated React API. Use it for &quot;anything that goes inside&quot;, don&apos;t reach for named content props.</li>
          <li><strong>Slots</strong>,{" "}named <code>ReactNode</code>{" "}props for fixed regions (header/sidebar/footer). Layout owns the shape; caller owns the content.</li>
          <li><strong>Render props</strong>,{" "}<code>children</code>{" "}as a function, called with parent state. The parent owns behavior; the caller owns presentation. In 2025, prefer hooks unless you need a component in the tree.</li>
          <li><strong>Compound components</strong>,{" "}a parent + named sub-components (<code>Tabs.List</code>, <code>Tabs.Tab</code>) that share state via context. Eliminates prop drilling and lets the caller reorder freely.</li>
          <li>The design principle: <strong>composition over configuration</strong>. A new feature should be expressible as a new child, not a new prop.</li>
        </ul>
      </section>

      <section>
        <h2>The project</h2>
        <ol>
          <li>Build the <code>{`<Disclosure>`}</code>{" "}compound component from the example above. Add <code>{`<Disclosure.Button>`}</code>{" "}and <code>{`<Disclosure.Panel>`}</code>. Verify they coordinate without any props passed between them.</li>
          <li>Extend it to <code>{`<Tabs>`}</code>: <code>{`<Tabs.List>`}</code>, <code>{`<Tabs.Tab>`}</code>, <code>{`<Tabs.Panel>`}</code>. The active tab is shared state in the parent; tabs and panels read it from context. Test that you can reorder them in any layout, the keyboard/click coordination still works.</li>
          <li>Add an error in <code>useDisclosureContext</code>{" "}that throws when used outside <code>{`<Disclosure>`}</code>. Verify it fires loudly when a consumer makes that mistake.</li>
          <li><em>Stretch:</em>{" "}Refactor a configuration-heavy component you&apos;ve seen before (your <code>Card</code>{" "}with 12 props, your custom <code>Modal</code>) into a composition API with named sub-components. Show the before-and-after to yourself and notice how much copy is in the body now instead of the props.</li>
        </ol>
        <p>
          You should be able to explain, out loud, why <code>{`<Tabs.Tab>`}</code>{" "}doesn&apos;t take <code>active</code>{" "}as a prop, and why that&apos;s the whole point.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
