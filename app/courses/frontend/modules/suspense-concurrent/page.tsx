import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "suspense-concurrent";

const CHECKPOINTS = [
  { id: "cp-suspense-boundary", title: "Suspense as a loading boundary" },
  { id: "cp-transition", title: "useTransition & non-blocking updates" },
  { id: "cp-deferred", title: "useDeferredValue & lagging renders" },
];

export default function SuspenseConcurrentModule() {
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
          Suspense &amp; concurrent features, <code>useTransition</code>, <code>useDeferredValue</code>
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You typed in a filter box and the whole page froze mid-keystroke. The old fix was a pile of <code>isLoading</code>{" "}
          flags and <code>setTimeout</code> hacks. React 18 gave us something better: a way to tell React <em>this update can
          wait, keep the page responsive.</em> Let&apos;s learn the three tools that do it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The kitchen with one cook and a triage rule</h2>
        <p className="mb-4">
          Imagine a restaurant kitchen with a single cook. Orders pile up: a customer at the counter wants a glass of
          water <em>right now</em>, while a complicated tasting menu is half-prepped on the stove. A bad cook does things
          strictly in order, the water waits behind twenty minutes of plating, and the counter customer fumes. A good
          cook has a <strong>triage rule</strong>: urgent, tiny requests jump the queue; slow, big jobs continue in the
          background and can even be <em>paused and restarted</em> if the order changes.
        </p>
        <p className="mb-4">
          Before React 18, React was the bad cook. Once it started rendering an update, it ran to completion, it could
          not stop to handle something more urgent. A big re-render (filtering 10,000 rows) would block the main thread,
          and your keystroke, the glass of water, had to wait until the whole plate was done. That&apos;s the jank.
        </p>
        <p className="mb-4">
          <strong>Concurrent rendering</strong> turns React into the good cook. React can now render in the background,
          <em> interrupt</em> a low-priority render to handle an urgent one (your keystroke), and throw away in-progress
          work that&apos;s no longer needed. <code>useTransition</code> and <code>useDeferredValue</code> are how you tell
          React <em>which</em> updates are the slow tasting menu (can wait) and which are the glass of water (urgent). And{" "}
          <code>Suspense</code> is the &quot;your order is being prepared&quot; sign the cook puts up while a dish isn&apos;t ready.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Three related tools built on one foundation. <strong>Suspense</strong> is a boundary that declares loading UI
            for a part of the tree that isn&apos;t ready. <strong>Concurrent rendering</strong> is the engine that lets React
            interrupt and prioritize work. <strong><code>useTransition</code></strong> and{" "}
            <strong><code>useDeferredValue</code></strong> are the two ways you mark an update as &quot;low priority, don&apos;t block
            the urgent stuff.&quot; They replace the manual <code>isPending</code> flags and debounce hacks you used to write.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. SUSPENSE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Suspense, a boundary for &quot;not ready yet&quot;</h2>
        <p className="mb-4">
          <code>Suspense</code> is a component that wraps part of your tree and says: &quot;if anything inside me suspends,
          isn&apos;t ready to render yet, show this <code>fallback</code> instead, then swap in the real content when it&apos;s
          ready.&quot; You declare the loading state <em>once, at a boundary</em>, instead of threading <code>isLoading</code>{" "}
          through every component.
        </p>
        <pre><code>{`<Suspense fallback={<Skeleton />}>
  <Profile userId={id} />   {/* if Profile suspends, Skeleton shows */}
</Suspense>`}</code></pre>
        <p className="mb-4">
          The mental shift is from <em>imperative</em> to <em>declarative</em> loading. Instead of &quot;if loading, render a
          spinner; else render data&quot; inside every data component, you wrap a region in <code>Suspense</code> and let any
          descendant that isn&apos;t ready trigger the one fallback. A component &quot;suspends&quot; by throwing a promise React knows
          how to wait on, which is exactly what Suspense-enabled data sources (React Query&apos;s suspense mode, frameworks
          like Next.js, <code>React.lazy</code>) do for you. You rarely throw it by hand.
        </p>
        <p className="mb-4">
          The most common everyday use is <strong>code-splitting</strong> with <code>React.lazy</code>: defer loading a
          component&apos;s JavaScript until it&apos;s rendered, and show a fallback while the chunk downloads.
        </p>
        <pre><code>{`const Settings = React.lazy(() => import("./Settings"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Settings />   {/* JS chunk loads on demand; Spinner shows meanwhile */}
    </Suspense>
  );
}`}</code></pre>
        <Callout variant="insight" title="Where you put the boundary IS the design decision">
          <p>
            One <code>Suspense</code> around the whole page = the whole page blanks to a spinner. Several smaller boundaries
            = each region shows its own skeleton and the rest of the page stays usable. Boundary placement controls the
            granularity of loading UI, that&apos;s the whole art of it. Wrap the slow, independent regions; leave the instant
            stuff outside the boundary so it renders immediately.
          </p>
        </Callout>
        <Callout variant="warn" title="Suspense catches 'not ready', not errors">
          <p>
            <code>Suspense</code> handles the &quot;still loading&quot; case. It does <em>not</em> catch errors thrown during render,
            that&apos;s an <Link href="/courses/frontend/modules/error-boundaries" className="text-cyan-600 hover:underline">error boundary</Link>&apos;s
            job (the very next module). Real data UIs pair them: a <code>Suspense</code> for the loading state and an error
            boundary just outside it for the failure state.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-suspense-boundary" moduleSlug={MODULE_SLUG} title="Suspense as a loading boundary">
        <Quiz
          kind="What Suspense is"
          question="What does a <Suspense fallback={...}> boundary actually do?"
          options={[
            {
              label: "It declares loading UI for its subtree: if any descendant isn't ready (suspends), it shows the fallback, then swaps in the real content when ready",
              correct: true,
              explanation:
                "Right. Suspense moves loading state to a boundary instead of threading isLoading through every component. A descendant 'suspends' (e.g. a lazy chunk loading, a suspense-enabled fetch), and the nearest Suspense shows its fallback until the content is ready.",
            },
            {
              label: "It catches errors thrown during render and shows the fallback instead of crashing",
              explanation:
                "That's an error boundary's job, not Suspense. Suspense handles the 'not ready yet' case (loading), not thrown errors.",
            },
            {
              label: "It debounces re-renders of its children to once every fallback interval",
              explanation:
                "Suspense doesn't debounce anything. It shows a fallback while a descendant isn't ready to render, then reveals the real content.",
            },
            {
              label: "It makes all child fetches run in parallel automatically",
              explanation:
                "Suspense doesn't orchestrate fetches. It only declares what UI to show while something in its subtree is suspended.",
            },
          ]}
        />
        <Quiz
          kind="Boundary placement"
          question="A dashboard has an instant header and three independently-slow widgets. Why prefer three small Suspense boundaries over one big one around the whole page?"
          options={[
            {
              label: "Smaller boundaries let each slow region show its own skeleton while the header and the ready widgets render immediately, instead of blanking the whole page",
              correct: true,
              explanation:
                "Exactly. Boundary placement controls loading granularity. One page-level boundary forces everything (even the instant header) behind a single spinner; per-region boundaries reveal each part as it becomes ready and keep the rest usable.",
            },
            {
              label: "One boundary per page is illegal in React; you must have at least three",
              explanation:
                "There's no such rule, a single boundary is valid. The reason to use several is finer-grained loading UI, not a requirement.",
            },
            {
              label: "Multiple boundaries make the widgets fetch faster",
              explanation:
                "Boundaries don't change fetch speed. They change which UI shows while regions are loading and which parts of the page stay interactive.",
            },
            {
              label: "Smaller boundaries are required for useTransition to work at all",
              explanation:
                "useTransition is independent of how many Suspense boundaries you have. The benefit of multiple boundaries is loading granularity.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 3. CONCURRENT RENDERING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Concurrent rendering, interruptible work</h2>
        <p className="mb-4">
          Here is the engine underneath the new hooks. In React 18+, rendering can be <strong>interruptible</strong>. React
          can begin rendering an update, pause partway through to handle a higher-priority update, and then either resume
          or <em>discard</em> the in-progress work. Crucially, it does this <strong>off-screen</strong>, the user never
          sees a half-rendered intermediate state.
        </p>
        <p className="mb-4">
          The key consequence: not all updates are equal. A keystroke that updates the input&apos;s text is <strong>urgent</strong>,{" "}
          the user must see their character appear instantly. Re-filtering a huge list based on that text is
          <strong> non-urgent</strong>, a few milliseconds of lag there is fine. Before concurrency, both updates were
          forced into the same blocking render, so the expensive filter froze the input. Concurrency lets you split them:
          let the urgent update commit immediately, and render the expensive one in the background where it can be
          interrupted by the next keystroke.
        </p>
        <Callout variant="insight" title="The mental model">
          <p>
            Updates now have <strong>priority</strong>. &quot;Urgent&quot; updates (typing, clicking, hovering, direct feedback)
            interrupt &quot;transition&quot; updates (re-rendering a big result of that input). You mark the non-urgent ones with{" "}
            <code>useTransition</code> or <code>useDeferredValue</code>; React keeps the UI responsive by always letting the
            urgent update win.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. useTransition ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>useTransition</code>, mark an update as non-blocking</h2>
        <p className="mb-4">
          <code>useTransition</code> gives you a <code>startTransition</code> function and an <code>isPending</code> boolean.
          Any state update you make <em>inside</em> <code>startTransition</code> is marked as a <strong>transition</strong>:
          low priority, interruptible, and allowed to be slow without blocking urgent updates.
        </p>
        <pre><code>{`function TabbedView() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  function selectTab(next) {
    // urgent: nothing here — we want the click to feel instant
    startTransition(() => {
      setTab(next);   // non-urgent: rendering the (slow) new tab can wait
    });
  }

  return (
    <>
      <TabBar onSelect={selectTab} active={tab} />
      {isPending && <Spinner />}        {/* built-in pending flag */}
      <SlowTabPanel tab={tab} />        {/* renders in the background */}
    </>
  );
}`}</code></pre>
        <p className="mb-4">
          When the user clicks a tab, the click feedback stays instant and the <em>old</em> tab&apos;s UI stays fully
          interactive while the new (slow) tab renders in the background. If the user clicks a third tab before the second
          finished rendering, React throws away the in-progress render and starts the new one. The <code>isPending</code>{" "}
          flag lets you show a subtle &quot;loading&quot; indicator without ever blocking the page.
        </p>
        <p className="mb-4">
          This is the killer feature: <strong>the old UI stays on screen and responsive</strong> during the transition,
          instead of being replaced by a spinner or frozen mid-update. Before <code>useTransition</code> you&apos;d hand-roll
          this with manual <code>isLoading</code> state and pray the expensive render didn&apos;t jank the input.
        </p>
        <Callout variant="warn" title="startTransition is for state updates, not async work">
          <p>
            <code>startTransition</code> marks the <em>state updates</em> inside it as non-urgent, it doesn&apos;t make slow
            code run off-thread, and it isn&apos;t a place to <code>await</code> a fetch. It tells React &quot;the re-render these
            updates trigger is low priority.&quot; The win comes when the resulting render is genuinely expensive (a big list,
            a heavy tree); for a trivial update it does nothing useful.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-transition" moduleSlug={MODULE_SLUG} title="useTransition & non-blocking updates">
        <Quiz
          kind="What useTransition does"
          question="You wrap setTab(next) in startTransition. The new tab is expensive to render. What's the user-visible effect?"
          options={[
            {
              label: "The click feels instant and the old tab stays interactive while the new tab renders in the background; isPending lets you show a subtle indicator",
              correct: true,
              explanation:
                "Right. The transition update is low-priority and interruptible. The current UI stays on screen and responsive instead of freezing, and React can even discard the in-progress render if the user clicks again. isPending drives an optional loading hint.",
            },
            {
              label: "The whole page freezes until the new tab finishes rendering, but at least no spinner flashes",
              explanation:
                "That's the pre-concurrency behavior you're avoiding. The point of startTransition is that the old UI stays responsive while the expensive render happens in the background.",
            },
            {
              label: "The expensive render runs on a Web Worker, off the main thread",
              explanation:
                "There's no Web Worker involved. The render still happens on the main thread, but React treats it as interruptible low-priority work so urgent updates can preempt it.",
            },
            {
              label: "setTab is debounced by 300ms before it applies",
              explanation:
                "startTransition doesn't debounce. It marks the update as non-urgent and interruptible, the work starts immediately but yields to urgent updates.",
            },
          ]}
        />
        <Quiz
          kind="What it doesn't do"
          question="Which statement about startTransition is correct?"
          options={[
            {
              label: "It marks the state updates inside it as non-urgent re-renders; it does not move slow code off the main thread or await async work",
              correct: true,
              explanation:
                "Correct. startTransition lowers the priority of the renders triggered by its state updates so urgent updates (typing, clicks) can interrupt them. It's not a thread, and it's not where you await a fetch.",
            },
            {
              label: "It runs the callback on a background thread so the main thread never blocks",
              explanation:
                "No background thread exists. The render still runs on the main thread but is interruptible low-priority work.",
            },
            {
              label: "It cancels any in-flight fetches when a new transition starts",
              explanation:
                "startTransition concerns render priority, not network requests. It can discard an in-progress render, but it doesn't cancel fetches, that's AbortController's job.",
            },
            {
              label: "It makes a trivial state update faster than a normal setState",
              explanation:
                "For a trivial update it does nothing useful. The benefit only appears when the resulting render is expensive and you want urgent updates to preempt it.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 5. useDeferredValue ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>useDeferredValue</code>, let an expensive render lag behind</h2>
        <p className="mb-4">
          <code>useDeferredValue</code> takes a value and returns a <strong>deferred copy</strong> of it that &quot;lags behind&quot;
          during urgent updates. You feed the deferred value to the expensive part of your UI. The input updates instantly
          from the real value; the expensive list re-renders from the deferred value, in the background, at low priority.
        </p>
        <pre><code>{`function SearchableList({ allItems }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);   // lags behind during urgent updates

  // expensive: filtering thousands of items. Keyed on the DEFERRED value.
  const results = useMemo(
    () => allItems.filter((i) => i.name.includes(deferredQuery)),
    [allItems, deferredQuery],
  );

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />  {/* instant */}
      <ExpensiveResults items={results} />   {/* renders from the lagging value */}
    </>
  );
}`}</code></pre>
        <p className="mb-4">
          Type fast: the input shows your characters immediately (urgent update from <code>query</code>), while the heavy
          filtered list catches up a beat later (non-urgent render from <code>deferredQuery</code>). React interrupts the
          expensive render whenever a new keystroke arrives, so the input never freezes. A common touch is to dim the stale
          results while they catch up: compare <code>query !== deferredQuery</code> to know you&apos;re showing lagging data.
        </p>

        <h3 className="mt-6 mb-2 text-xl font-semibold"><code>useTransition</code> vs <code>useDeferredValue</code>, which one?</h3>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>useTransition</code></strong> when you <em>own the state update</em> and can wrap it. You call{" "}
            <code>startTransition(() =&gt; setX(...))</code>. Best for things like tab switches, navigation, applying a
            filter on submit, places where you control the <code>setState</code>.
          </li>
          <li>
            <strong><code>useDeferredValue</code></strong> when you <em>receive a value</em> and can&apos;t (or don&apos;t want to)
            change how it&apos;s set, e.g. a prop, or a controlled input&apos;s value you want to stay instant. You defer the value
            on the way <em>into</em> the expensive render.
          </li>
        </ul>
        <Callout variant="insight" title="Both replace the old hacks">
          <p>
            For years the fix for a janky filter input was <strong>debouncing</strong> the keystroke, wait 300ms before
            filtering. That always feels laggy and is a guess at the right delay. <code>useDeferredValue</code> is strictly
            better: the input is never delayed, and the expensive render simply yields to newer keystrokes instead of
            waiting a fixed timer. Same for <code>isPending</code> flags hand-rolled around slow updates,{" "}
            <code>useTransition</code> gives you the flag and the interruptibility for free.
          </p>
        </Callout>
        <Callout variant="warn" title="They don't make slow code fast">
          <p>
            Neither hook reduces the <em>total</em> work, filtering 50,000 items is still expensive. What they buy is{" "}
            <strong>responsiveness</strong>: the urgent update (your keystroke) is never blocked by the expensive one. If a
            single render is so heavy it janks even at low priority, you still need to make the work itself cheaper
            (virtualize the list, memoize the calculation, paginate). Concurrency reorders priority; it doesn&apos;t delete work.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 6. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;what are Suspense and the concurrent features for?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Suspense</strong> is a boundary that declares loading UI for its subtree: a descendant that isn&apos;t
              ready (a lazy chunk, a suspense-enabled fetch) shows the <code>fallback</code> until it&apos;s ready. Boundary
              placement controls loading granularity.
            </li>
            <li>
              <strong>Concurrent rendering</strong> makes rendering interruptible and prioritized, React can pause
              low-priority work to handle an urgent update (a keystroke) and discard work that&apos;s no longer needed.
            </li>
            <li>
              <strong><code>useTransition</code></strong> marks the state updates inside <code>startTransition</code> as
              non-urgent, so the old UI stays interactive while an expensive render happens in the background; it gives you
              an <code>isPending</code> flag.
            </li>
            <li>
              <strong><code>useDeferredValue</code></strong> returns a lagging copy of a value to feed the expensive render,
              so the input stays instant while the heavy list catches up. Use it when you receive a value rather than own the
              setState.
            </li>
            <li>
              <strong>They replace</strong> manual <code>isLoading</code> flags and debounce hacks, and they reorder
              priority, they don&apos;t make slow work fast.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 7. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, make a janky filter smooth, then a slow tab non-blocking</h2>
        <p className="mb-4">
          You&apos;ll take a UI that janks on every keystroke and fix it with <code>useDeferredValue</code>, then wrap a slow
          tab switch in <code>useTransition</code> so the old UI stays interactive. Feeling the jank disappear is what
          makes the concurrency model click.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build the janky filter.</strong> Render a list of ~20,000 items and a controlled search input that
            filters them on every keystroke. Make each item render do a little work so the filter is genuinely heavy. Type
            fast, confirm the input visibly lags because the filter blocks each keystroke&apos;s render.
          </li>
          <li>
            <strong>Smooth it with <code>useDeferredValue</code>.</strong> Compute <code>deferredQuery =
            useDeferredValue(query)</code>, key the expensive <code>useMemo</code> filter on <code>deferredQuery</code> (not{" "}
            <code>query</code>), and feed the results to the list. Type fast again: the input is now instant and the list
            catches up a beat later, yielding to newer keystrokes.
          </li>
          <li>
            <strong>Show the stale state.</strong> When <code>query !== deferredQuery</code>, dim the results (e.g.{" "}
            <code>opacity: 0.6</code>) so the user gets honest feedback that the list is catching up. Notice you got this
            without a single <code>setTimeout</code> or debounce timer.
          </li>
          <li>
            <strong>Add a slow tab switch with <code>useTransition</code>.</strong> Add two tabs where one renders an
            expensive panel. Wrap the <code>setTab</code> call in <code>startTransition</code>. Click between tabs, confirm
            the click feels instant and the old panel stays interactive while the new one renders, and wire{" "}
            <code>isPending</code> to a subtle indicator.
          </li>
          <li>
            <strong>Prove interruptibility.</strong> Click tab A, then immediately click tab B before A finishes rendering.
            Confirm React discards A&apos;s in-progress render and goes straight to B, you never see a half-rendered A.
          </li>
          <li>
            <strong>Stretch, code-split with Suspense.</strong> Convert the heavy tab panel to{" "}
            <code>React.lazy(() =&gt; import(...))</code> and wrap it in a <code>Suspense</code> with a skeleton fallback.
            Watch the panel&apos;s JS chunk load on first open in the Network tab, with the skeleton showing meanwhile.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work: concurrent rendering is <strong>priority scheduling</strong> for the UI thread,
            React is a scheduler that preempts long-running low-priority &quot;jobs&quot; (an expensive render) when a
            high-priority one (a keystroke) arrives, and can cancel the preempted job if it&apos;s now obsolete.{" "}
            <code>useTransition</code>/<code>useDeferredValue</code> are how you assign the priority. <code>Suspense</code>{" "}
            is the equivalent of returning a 202-style &quot;still working&quot; placeholder while a dependency resolves.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-deferred" moduleSlug={MODULE_SLUG} title="useDeferredValue & lagging renders">
        <Quiz
          kind="useDeferredValue"
          question="A search input is controlled by `query`, and filtering thousands of items is expensive. You want the input to stay instant. How do you use useDeferredValue?"
          options={[
            {
              label: "Compute deferredQuery = useDeferredValue(query), and key the expensive filter on deferredQuery; the input renders from query (instant) while the list renders from the lagging deferredQuery",
              correct: true,
              explanation:
                "Right. The input stays instant because it reads `query`. The expensive render reads the deferred copy, which lags during urgent updates and yields to newer keystrokes. No debounce timer needed.",
            },
            {
              label: "Wrap the input's value in useDeferredValue so the input itself updates less often",
              explanation:
                "You don't defer the input, you want it instant. You defer the value feeding the EXPENSIVE render, so the heavy list lags while the input stays responsive.",
            },
            {
              label: "useDeferredValue debounces the query by a fixed 300ms before filtering",
              explanation:
                "It's not a fixed-timer debounce. The deferred value lags only as long as urgent work is pending and yields immediately to newer keystrokes, strictly better than a guessed delay.",
            },
            {
              label: "It reduces the number of items so filtering becomes cheap",
              explanation:
                "It doesn't reduce work. The filter is just as expensive; useDeferredValue only changes its priority so the input never blocks. To cut the work itself you'd virtualize or paginate.",
            },
          ]}
        />
        <Quiz
          kind="Choosing the tool"
          question="When do you reach for useDeferredValue instead of useTransition?"
          options={[
            {
              label: "When you receive a value (a prop, or a controlled input's value) and want to defer it into the expensive render, rather than owning and wrapping the setState yourself",
              correct: true,
              explanation:
                "Correct. useTransition wraps a state update you own; useDeferredValue defers a value on the way into the expensive render when you can't or don't want to change how it's set. Same goal, keep urgent updates unblocked, applied at a different point.",
            },
            {
              label: "When you want the update to run on a background thread instead of the main thread",
              explanation:
                "Neither hook uses a background thread. They reorder render priority on the main thread. The choice between them is about whether you own the setState (useTransition) or receive a value (useDeferredValue).",
            },
            {
              label: "useDeferredValue is the old API; useTransition replaced it, so always use useTransition",
              explanation:
                "Both are current React 18+ APIs for different shapes of the same problem. Use useTransition when you own the update; useDeferredValue when you receive a value.",
            },
            {
              label: "Only useDeferredValue can be used with Suspense; useTransition cannot",
              explanation:
                "Both interoperate with Suspense. The distinction is owning a setState (useTransition) vs deferring a received value (useDeferredValue).",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
