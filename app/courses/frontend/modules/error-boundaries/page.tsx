import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "error-boundaries";

const CHECKPOINTS = [
  { id: "cp-what-catches", title: "What a boundary catches (and what it can't)" },
  { id: "cp-two-methods", title: "getDerivedStateFromError vs componentDidCatch" },
  { id: "cp-placement-reset", title: "Granular placement & resetting" },
];

export default function ErrorBoundariesModule() {
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
          Error boundaries, catching render-time failures
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          One component deep in your tree throws while rendering, and the <em>entire</em> page goes
          white. No header, no nav, nothing. React did that on purpose, and an error boundary is the
          one tool that turns &quot;blank screen&quot; into &quot;something went wrong, here&apos;s a retry button.&quot;
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The circuit breaker in your house</h2>
        <p className="mb-4">
          Picture the electrical panel in a house. When one appliance shorts out, you don&apos;t want
          the whole house to catch fire, and you don&apos;t want every light in every room to go dark
          either. So the wiring is divided into <strong>circuits</strong>, each with its own breaker.
          A fault in the kitchen trips the kitchen breaker; the bedroom lights stay on. The breaker
          <em> contains</em> the fault to the smallest area it can, and gives you a switch to flip
          once you&apos;ve fixed the problem.
        </p>
        <p className="mb-4">
          An error boundary is that breaker, for your component tree. When a component throws while
          rendering, the error propagates <em>up</em> the tree looking for the nearest boundary,
          exactly like a fault travels back to the panel. That boundary &quot;trips&quot;: it stops rendering
          its broken subtree and shows a fallback UI instead. Everything <em>outside</em> the boundary
          keeps working. And just like flipping a breaker back on, a good boundary gives the user a way
          to <strong>reset</strong> and try again.
        </p>
        <p className="mb-4">
          The key design decision, the one this whole module circles back to, is the same one an
          electrician makes: <strong>how many circuits do you want?</strong> One giant breaker for the
          whole house means any fault kills everything. One breaker per outlet is overkill. The art is
          drawing the boundaries around the things that should fail <em>independently</em>.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The mechanics of an error boundary are tiny, two lifecycle methods on a class component.
            The hard part is knowing <em>what it catches</em> (render-time errors only), <em>what it
            silently misses</em> (events, async, SSR), and <em>where to place boundaries</em> so a
            single crash degrades gracefully instead of blanking the app. Everything below follows from
            those three things.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. WHY A THROW BLANKS THE PAGE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why one throw unmounts the whole tree</h2>
        <p className="mb-4">
          Since React 16, an error thrown during rendering that is <em>not</em> caught by a boundary
          doesn&apos;t just log a warning, React <strong>unmounts the entire component tree.</strong>
          That sounds drastic, and it is, but it&apos;s a deliberate choice. Here&apos;s the reasoning the
          React team gave:
        </p>
        <Callout variant="insight" title="The rationale, in their words">
          <p>
            A corrupted UI is worse than no UI. If a banking app fails to render the <em>new</em>
            balance, showing the <em>stale</em> one, silently, with no error, could lead a user to
            transfer money they don&apos;t have. React decided that leaving a broken, half-rendered,
            internally-inconsistent tree on screen is more dangerous than removing it entirely. So the
            default for an <em>uncaught</em> render error is: tear it all down.
          </p>
        </Callout>
        <p className="mb-4">
          That default is the problem an error boundary solves. A boundary says: &quot;don&apos;t tear down
          the whole tree, tear down <em>my</em> subtree and show this fallback instead.&quot; Without a
          boundary, this is what your users see when any descendant throws in render:
        </p>
        <pre><code>{`function PriceWidget({ product }) {
  // product is unexpectedly null at runtime -> this throws DURING render
  return <span>{product.price.toFixed(2)}</span>;
  //              ^^^^^^^^^^^^^ TypeError: Cannot read properties of null
}

function Dashboard() {
  return (
    <>
      <Header />        {/* perfectly fine */}
      <Sidebar />       {/* perfectly fine */}
      <PriceWidget />   {/* throws -> with NO boundary, the ENTIRE Dashboard unmounts */}
    </>
  );
}
// Result with no boundary: blank screen. Header and Sidebar are gone too,
// even though they did nothing wrong.`}</code></pre>
        <p className="mb-4">
          The crucial mental model: <strong>a render-time throw doesn&apos;t stay local.</strong> It
          propagates up until <em>something</em> catches it. If nothing does, &quot;up&quot; means the root,
          and the whole app disappears. A boundary is just a place, partway up that path, that agrees
          to catch.
        </p>
      </section>

      {/* ───────────────────────── 3. WHAT IT CATCHES / WHAT IT DOESN'T ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What a boundary catches, and the four things it can&apos;t</h2>
        <p className="mb-4">
          This is the part interviewers probe, because it&apos;s the part everyone gets wrong. An error
          boundary catches errors thrown in the <strong>render phase</strong> of the tree below it:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>During rendering</strong>, a throw in a component&apos;s render/return, in the JSX itself.</li>
          <li><strong>In lifecycle methods</strong>, <code>componentDidMount</code>, <code>componentDidUpdate</code>, etc. of descendants.</li>
          <li><strong>In constructors</strong>, when a descendant class component is being constructed.</li>
        </ul>
        <p className="mb-4">
          That list is the <em>whole</em> story of what it catches. Here is what it does{" "}
          <strong>NOT</strong> catch, memorize these four, because each has a different reason:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Event handlers.</strong> A throw inside <code>onClick</code> happens <em>after</em>
            render, during a user interaction, outside React&apos;s render flow. React can&apos;t recover
            the UI for it because nothing is mid-render. Use a normal <code>try/catch</code> in the
            handler instead.
          </li>
          <li>
            <strong>Asynchronous code.</strong> <code>setTimeout</code>, <code>Promise</code> callbacks,
            <code>fetch().then(...)</code>, these run on a later tick, long after the render that
            scheduled them returned. The boundary isn&apos;t &quot;wrapped around&quot; them in any call-stack
            sense, so it never sees the throw.
          </li>
          <li>
            <strong>Server-side rendering.</strong> Boundaries are a client-render mechanism. An error
            thrown during SSR isn&apos;t caught by a client error boundary, your server framework handles
            SSR errors separately.
          </li>
          <li>
            <strong>Errors in the boundary itself.</strong> A boundary can&apos;t catch a throw in its{" "}
            <em>own</em> render or its own fallback. That error propagates up to the <em>next</em>
            boundary higher in the tree (or unmounts the app if there isn&apos;t one). Keep fallback UI
            dead simple for exactly this reason.
          </li>
        </ul>
        <Callout variant="warn" title="The mental shortcut for &quot;will it catch this?&quot;">
          <p>
            Ask: <strong>&quot;Is this throwing while React is rendering?&quot;</strong> If yes (render,
            lifecycle, constructor) → a boundary catches it. If it&apos;s happening during a click, a
            timeout, a resolved promise, or on the server → no boundary, you&apos;re on your own with{" "}
            <code>try/catch</code>. The reason is always the same: a boundary can only recover the UI
            for an error that interrupts a render it&apos;s wrapping.
          </p>
        </Callout>
        <p className="mb-4">
          There&apos;s a neat escape hatch for the async/event cases: catch the error yourself, then store
          it in state and <em>throw it during the next render</em>. Now it&apos;s a render-time error, and
          the boundary <em>can</em> catch it:
        </p>
        <pre><code>{`function Widget() {
  const [error, setError] = useState(null);

  // If we caught an async/event error and stashed it, re-throw it in render:
  if (error) throw error; // <- now a boundary CAN catch it

  return (
    <button
      onClick={async () => {
        try {
          await doRiskyThing(); // event-handler async error, NOT caught by a boundary
        } catch (e) {
          setError(e); // stash it -> next render throws -> boundary catches it
        }
      }}
    >
      Do the risky thing
    </button>
  );
}`}</code></pre>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-what-catches" moduleSlug={MODULE_SLUG} title="What a boundary catches (and what it can't)">
        <Quiz
          kind="What it catches"
          question="A button's onClick handler calls JSON.parse on malformed data and throws. There's an error boundary wrapping the whole page. What happens?"
          options={[
            {
              label: "The boundary does NOT catch it, the error is thrown in an event handler, outside React's render flow, so it propagates as a normal uncaught exception",
              correct: true,
              explanation:
                "Right. Error boundaries only catch errors thrown during render, in lifecycle methods, or in constructors. An onClick runs after render, during interaction, so the boundary never sees it. Use try/catch in the handler.",
            },
            {
              label: "The boundary catches it and shows the fallback, because the button is inside the boundary",
              explanation:
                "Being inside the boundary isn't enough, the error must be thrown while React is rendering. An event handler runs outside the render flow, so the boundary can't catch it.",
            },
            {
              label: "React automatically wraps every event handler in the nearest boundary's catch",
              explanation:
                "It does not. Event handlers are explicitly excluded. You handle their errors with a normal try/catch (and can optionally re-throw in render to involve a boundary).",
            },
            {
              label: "The whole tree unmounts, because any uncaught error always unmounts the app",
              explanation:
                "Render-phase errors that go uncaught unmount the tree, but an event-handler throw is not a render error, it behaves like any other uncaught JS exception, it doesn't unmount the React tree.",
            },
          ]}
        />
        <Quiz
          kind="The four exclusions"
          question="Which of these errors WOULD an error boundary catch?"
          options={[
            {
              label: "A child component reads `user.name` during render where `user` is null, throwing a TypeError mid-render",
              correct: true,
              explanation:
                "Yes, this throws during the render phase of a descendant, which is exactly what boundaries catch (render, lifecycle methods, and constructors).",
            },
            {
              label: "A setTimeout callback throws 500ms after the component mounted",
              explanation:
                "Async code runs on a later tick, outside any render React is wrapping. Boundaries don't catch it. You'd catch it yourself and optionally re-throw in render.",
            },
            {
              label: "The error boundary's own fallback UI throws while rendering",
              explanation:
                "A boundary can't catch an error in itself. That error propagates up to the NEXT boundary higher in the tree. This is why fallback UI should be kept trivially simple.",
            },
            {
              label: "A fetch().then() rejects with a network error after the page rendered",
              explanation:
                "A rejected promise is async, it resolves on a later tick, not during render. Boundaries don't see it. Handle it with .catch and put the error into state if you want a boundary to show it.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. WHY A CLASS COMPONENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why it MUST be a class component (still, in {`2025`})</h2>
        <p className="mb-4">
          Here is the surprise: even in a hooks-everywhere codebase, an error boundary{" "}
          <strong>must be a class component.</strong> There is no <code>useErrorBoundary</code> hook in
          React itself. The reason is mechanical: boundaries are powered by two <em>lifecycle methods</em>{" "}
          that have no hook equivalent yet,
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <code>static getDerivedStateFromError(error)</code>, a <em>static</em> method React calls
            when a descendant throws, to compute the new state that renders the fallback.
          </li>
          <li>
            <code>componentDidCatch(error, info)</code>, an instance method React calls so you can run
            side effects (log to your error service).
          </li>
        </ul>
        <p className="mb-4">
          React has never shipped hook versions of these, so the official answer to &quot;write an error
          boundary&quot; is &quot;write one class.&quot; The standard move is to write{" "}
          <strong>one reusable <code>ErrorBoundary</code> class</strong> and then never write another
          class again, you wrap function components with it everywhere.
        </p>
        <pre><code>{`import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // 1) Render-phase: React calls this when a child throws.
  //    Return the new state. This decides WHAT to render (the fallback).
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 2) Commit-phase: React calls this for SIDE EFFECTS only.
  //    Log the error here — to Sentry, Datadog, your own /log endpoint.
  componentDidCatch(error, info) {
    // info.componentStack tells you WHERE in the tree it threw.
    logToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback; // show the fallback instead of the broken subtree
    }
    return this.props.children;   // healthy: render the real children
  }
}`}</code></pre>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, think of <code>getDerivedStateFromError</code> as the part of
            an exception filter that decides the <em>response</em> (which error page to render), and{" "}
            <code>componentDidCatch</code> as the part that <em>logs</em> the exception to your
            observability stack. React deliberately split &quot;decide what to show&quot; (pure, render-phase,
            static) from &quot;perform side effects&quot; (impure, commit-phase, instance), the same separation
            a well-built middleware pipeline makes.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. THE TWO METHODS IN DEPTH ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>getDerivedStateFromError</code> vs <code>componentDidCatch</code></h2>
        <p className="mb-4">
          They look similar and people blur them together, but they run in different phases and exist
          for different jobs. Getting the distinction crisp is a reliable interview signal.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>static getDerivedStateFromError(error)</code></strong> runs during the{" "}
            <em>render phase</em>. It must be <strong>pure</strong>, no logging, no side effects, no{" "}
            <code>fetch</code>. Its only job is to return the next state so React can render the
            fallback. Because the render phase can be re-run, React forbids side effects here.
          </li>
          <li>
            <strong><code>componentDidCatch(error, info)</code></strong> runs during the{" "}
            <em>commit phase</em>, after the DOM has been updated to show the fallback. This is where{" "}
            <em>side effects belong</em>: log the error, report to Sentry, increment a metric. It also
            receives <code>info.componentStack</code>, the chain of components leading to the throw,
            which is gold for debugging.
          </li>
        </ul>
        <Callout variant="insight" title="The one-liner to say out loud">
          <p>
            &quot;<code>getDerivedStateFromError</code> decides <em>what to render</em>, it&apos;s pure and
            sets the state for the fallback. <code>componentDidCatch</code> handles <em>side effects</em>,{" "}
            it&apos;s where you log the error and its component stack. One is for the UI, one is for
            telemetry.&quot;
          </p>
        </Callout>
        <p className="mb-4">
          In practice you usually implement both: <code>getDerivedStateFromError</code> to flip into the
          fallback, and <code>componentDidCatch</code> so the failure doesn&apos;t vanish silently. A
          boundary that shows a fallback but never logs is a boundary that hides bugs from you, the
          user sees &quot;something went wrong&quot; and you never find out it happened.
        </p>
        <Callout variant="warn" title="Don't put logging in getDerivedStateFromError">
          <p>
            It&apos;s tempting, because that&apos;s where you first &quot;have&quot; the error. Resist it. The render
            phase can run multiple times (React may discard and retry work), so a side effect there can
            fire repeatedly, you&apos;d log the same crash several times. <code>componentDidCatch</code>{" "}
            runs once, at commit, which is why it&apos;s the right home for logging.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-two-methods" moduleSlug={MODULE_SLUG} title="getDerivedStateFromError vs componentDidCatch">
        <Quiz
          kind="Which method"
          question="You want to (a) show a fallback UI when a child throws and (b) log the error to Sentry. Which method does each job?"
          options={[
            {
              label: "getDerivedStateFromError returns the state that renders the fallback (pure); componentDidCatch logs to Sentry (side effect)",
              correct: true,
              explanation:
                "Exactly. getDerivedStateFromError runs in the render phase and must be pure, it just returns next state. componentDidCatch runs in the commit phase and is where side effects like logging belong.",
            },
            {
              label: "componentDidCatch returns the fallback state; getDerivedStateFromError logs to Sentry",
              explanation:
                "Reversed. getDerivedStateFromError sets state (renders the fallback); componentDidCatch is for side effects like logging. componentDidCatch can't return state to set.",
            },
            {
              label: "Both can do either job; they're interchangeable",
              explanation:
                "They're not interchangeable. One is a pure static render-phase method for setting state; the other is a commit-phase instance method for side effects. Logging in getDerivedStateFromError can fire multiple times.",
            },
            {
              label: "A useErrorBoundary hook does both, so you don't need either method",
              explanation:
                "There is no built-in useErrorBoundary hook. Error boundaries must be class components using these two lifecycle methods (or a library like react-error-boundary that wraps a class for you).",
            },
          ]}
        />
        <Quiz
          kind="Why a class"
          question="Why must an error boundary be a class component rather than a function component with hooks?"
          options={[
            {
              label: "React has no hook equivalent for getDerivedStateFromError / componentDidCatch, so the catching behavior only exists on class lifecycle methods",
              correct: true,
              explanation:
                "Correct. The error-catching capability is wired to those two lifecycle methods, and React has never shipped hook versions. So you write one reusable ErrorBoundary class (or use a library that provides one).",
            },
            {
              label: "Function components can't render fallback UI",
              explanation:
                "Function components render UI just fine. The blocker is specifically the catching mechanism, getDerivedStateFromError and componentDidCatch have no hook form.",
            },
            {
              label: "Class components render faster, so React requires them for error handling",
              explanation:
                "Performance isn't the reason and the premise is false. It's purely that the error-catching lifecycle methods exist only on classes.",
            },
            {
              label: "Hooks can't be used inside any component that handles errors",
              explanation:
                "That's not a rule. The real constraint is narrow: the two error-catching lifecycle methods have no hook equivalent, so the boundary itself must be a class.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. GRANULAR PLACEMENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Granular boundaries, isolate failures, don&apos;t blank the page</h2>
        <p className="mb-4">
          Back to the circuit-panel decision. A boundary unmounts <em>everything below it</em> down to
          the fallback. So <strong>where you place the boundary decides how much of the UI a single
          crash takes out.</strong> Two extremes, both wrong:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>One boundary at the root only.</strong> Any throw anywhere replaces the entire app
            with a single &quot;something went wrong&quot; screen. Better than a blank page, but one broken
            widget shouldn&apos;t kill the whole dashboard.
          </li>
          <li>
            <strong>A boundary around every element.</strong> Noisy, pointless overhead, most elements
            can&apos;t fail in interesting ways, and you lose the readability of your tree.
          </li>
        </ul>
        <p className="mb-4">
          The right answer is to wrap the <em>independent, riskier regions</em>, the parts that fetch
          data, render third-party content, or do non-trivial computation, each in its own boundary so
          one failing region degrades to a small fallback while its neighbors stay fully alive:
        </p>
        <pre><code>{`function Dashboard() {
  return (
    <Layout>
      <Header />  {/* outside the risky boundaries — always renders */}

      <ErrorBoundary fallback={<WidgetError name="Revenue" />}>
        <RevenueChart />   {/* if this throws, only this box shows the fallback */}
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="Activity" />}>
        <ActivityFeed />   {/* a crash here leaves Revenue and Header untouched */}
      </ErrorBoundary>

      <ErrorBoundary fallback={<WidgetError name="Recommendations" />}>
        <Recommendations />
      </ErrorBoundary>
    </Layout>
  );
}`}</code></pre>
        <p className="mb-4">
          Now a <code>TypeError</code> in <code>ActivityFeed</code> trips only the Activity breaker: that
          one panel shows &quot;Activity failed to load,&quot; while Revenue, Recommendations, and the Header
          render normally. This is the difference between &quot;the dashboard had a hiccup in one panel&quot;
          and &quot;the dashboard is down.&quot; You can also <strong>nest</strong> boundaries: a coarse one
          near the root as a last-resort catch-all, plus fine-grained ones around each widget. The
          innermost boundary catches first.
        </p>
        <Callout variant="insight" title="Placement heuristic">
          <p>
            Draw a boundary wherever you&apos;d be willing to show a small &quot;this part failed&quot; box{" "}
            <em>instead</em> of that region, and where the surrounding UI is still useful without it.
            Independent data widgets, embedded third-party components, and route-level sections are the
            usual spots. The grain matches the grain of <em>what can fail independently</em>.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. THE RESET MECHANISM ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Resetting, let the user recover without a full reload</h2>
        <p className="mb-4">
          Once a boundary trips, <code>hasError</code> stays <code>true</code> and it keeps showing the
          fallback forever, even if whatever caused the error has since gone away. The breaker is
          flipped off; someone has to flip it back on. That &quot;flip back on&quot; is a <strong>reset</strong>:
          set <code>hasError</code> back to <code>false</code> so the boundary attempts to render its
          children again.
        </p>
        <p className="mb-4">
          The simplest version hands a reset callback to the fallback so a &quot;Try again&quot; button can call
          it. Note the fallback becomes a <em>render prop</em> (a function) so it can receive that
          callback:
        </p>
        <pre><code>{`class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logToService(error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null }); // flip the breaker back on
  };

  render() {
    if (this.state.hasError) {
      // fallback is a function so it can receive the reset handler
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}

// Usage — the "Try again" button re-attempts the render:
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div role="alert">
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <RevenueChart />
</ErrorBoundary>`}</code></pre>
        <Callout variant="warn" title="Reset alone can loop">
          <p>
            If the underlying condition hasn&apos;t changed, clicking &quot;Try again&quot; just re-renders the
            same broken child, which throws again, and you&apos;re back in the fallback, an infinite
            error→reset→error loop. A real reset usually pairs with <em>changing the input</em>: refetch
            the data, clear the bad state, or re-key the subtree. Reset clears the boundary; you still
            have to fix the thing that threw.
          </p>
        </Callout>
        <p className="mb-4">
          A common robust pattern is a <code>resetKeys</code> prop: the boundary watches a list of
          values and automatically clears <code>hasError</code> when any of them changes (e.g. the
          route, or a query param). That way navigating away from the broken state recovers
          automatically, with no button click required. (This is exactly what the{" "}
          <code>react-error-boundary</code> library provides out of the box, see below.)
        </p>
      </section>

      {/* ───────────────────────── 8. LIBRARY + NEXT.JS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">You rarely hand-roll this: <code>react-error-boundary</code> and Next.js <code>error.tsx</code></h2>
        <p className="mb-4">
          Knowing how to write the class is the point of this module, it&apos;s what makes you able to
          explain it. But in production you usually reach for one of two things that wrap that class for
          you.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>react-error-boundary</code></strong>, the de-facto community library. It gives
            you an <code>{`<ErrorBoundary>`}</code> with a <code>FallbackComponent</code> prop, an{" "}
            <code>onError</code> hook for logging, automatic <code>resetKeys</code>, an{" "}
            <code>onReset</code> callback, and a <code>useErrorBoundary()</code> hook for imperatively
            throwing async/event errors into the nearest boundary. It&apos;s still a class under the hood,
            it just hides the boilerplate.
          </li>
          <li>
            <strong>Next.js <code>error.tsx</code></strong>, in the App Router, dropping an{" "}
            <code>error.tsx</code> file in a route segment <em>wires an error boundary for that route
            automatically.</em> Next.js wraps the segment in a boundary and renders your{" "}
            <code>error.tsx</code> (which receives <code>error</code> and a <code>reset</code> function)
            when something below throws. It must be a Client Component (<code>{`"use client"`}</code>),
            and a sibling <code>global-error.tsx</code> catches errors in the root layout itself.
          </li>
        </ul>
        <pre><code>{`// app/dashboard/error.tsx  — Next.js wires this as the boundary for /dashboard
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>Could not load the dashboard.</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}`}</code></pre>
        <Callout variant="info" title="Same idea, different altitude">
          <p>
            The framework didn&apos;t invent a new mechanism, <code>error.tsx</code> is a class error
            boundary that Next.js places around the route segment for you, with <code>reset</code> wired
            to re-attempt the render. Everything you learned about <em>what it catches</em> (render-time
            only) and <em>resetting</em> applies directly. Knowing the underlying class is what lets you
            reason about why an <code>error.tsx</code> doesn&apos;t catch an error in an <code>onClick</code>.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;what&apos;s an error boundary?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>What it is.</strong> A component that catches errors thrown <em>during render</em>
              in the tree below it, and shows a fallback UI instead of letting the throw unmount the
              whole app. It&apos;s React&apos;s circuit breaker.
            </li>
            <li>
              <strong>What it catches.</strong> Render-phase errors only, in rendering, lifecycle
              methods, and constructors of descendants.
            </li>
            <li>
              <strong>What it can&apos;t.</strong> Event handlers, async code (<code>setTimeout</code>/
              promises), SSR, and errors in the boundary itself. They&apos;re outside the render React is
              wrapping; use <code>try/catch</code> (and optionally re-throw in render).
            </li>
            <li>
              <strong>How you write it.</strong> A class component with{" "}
              <code>static getDerivedStateFromError</code> (pure, sets state to render the fallback)
              and <code>componentDidCatch</code> (side effects, log the error + component stack). No
              hook equivalent yet.
            </li>
            <li>
              <strong>Where to put it.</strong> Granularly, around independent regions, so one crash
              degrades that region instead of blanking the page, and give it a <code>reset</code> so the
              user can recover.
            </li>
            <li>
              <strong>In practice.</strong> Use <code>react-error-boundary</code>, or in Next.js drop an{" "}
              <code>error.tsx</code> per route, both wrap the class for you.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 10. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, one crash shouldn&apos;t blank the page</h2>
        <p className="mb-4">
          You&apos;ll build a reusable <code>{`<ErrorBoundary fallback>`}</code> component, wrap three
          independent widgets so a single crash is contained, and add a reset that lets the user recover
          without a full reload. Watching one widget die while its neighbors stay alive is what makes the
          &quot;circuit breaker&quot; idea click.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Write the reusable <code>ErrorBoundary</code> class.</strong> A class component with{" "}
            <code>state = &#123; hasError: false, error: null &#125;</code>, a{" "}
            <code>static getDerivedStateFromError(error)</code> that returns{" "}
            <code>&#123; hasError: true, error &#125;</code>, and a <code>componentDidCatch(error, info)</code>{" "}
            that <code>console.error</code>s the error and <code>info.componentStack</code> (stand-in for
            real logging). In <code>render</code>, return the fallback when <code>hasError</code> is true,
            otherwise <code>this.props.children</code>.
          </li>
          <li>
            <strong>Build a widget that throws on demand.</strong> A small <code>Widget</code> that takes
            a <code>shouldCrash</code> prop and, when true, throws <em>during render</em>
            (e.g. <code>if (shouldCrash) throw new Error(&quot;Widget exploded&quot;)</code>). A button
            outside the boundary flips <code>shouldCrash</code> so you can trigger the crash live.
          </li>
          <li>
            <strong>Wrap three independent widgets, each in its own boundary.</strong> Render three{" "}
            <code>Widget</code>s side by side, each inside a separate <code>{`<ErrorBoundary>`}</code> with
            its own fallback. Crash one. Confirm the other two keep rendering normally, this is the
            granular-isolation payoff. Then wrap all three in <em>one</em> boundary instead and crash one:
            watch all three disappear. Feel the difference.
          </li>
          <li>
            <strong>Add a reset.</strong> Give the boundary a <code>reset</code> method that sets{" "}
            <code>hasError</code> back to <code>false</code>, and pass it to the fallback (make{" "}
            <code>fallback</code> a function: <code>fallback=&#123;(&#123; error, reset &#125;) =&gt; ...&#125;</code>).
            Render a &quot;Try again&quot; button in the fallback that calls <code>reset</code>. Also flip the
            widget&apos;s <code>shouldCrash</code> back to false <em>before</em> resetting, and confirm the
            widget comes back, then try resetting <em>without</em> fixing the cause and watch it loop
            straight back into the fallback. That loop is the lesson.
          </li>
          <li>
            <strong>Prove the exclusions.</strong> Add a button <em>inside</em> a widget whose{" "}
            <code>onClick</code> throws. Confirm the boundary does <strong>not</strong> catch it (it
            surfaces as an uncaught error in the console, the fallback never shows). Then catch it in the
            handler, stash it in state, and <code>throw error</code> during render, now the boundary{" "}
            <em>does</em> catch it. Same for a <code>setTimeout</code> that throws.
          </li>
          <li>
            <strong>Stretch, swap in <code>react-error-boundary</code>.</strong> Replace your hand-rolled
            class with the library&apos;s <code>{`<ErrorBoundary>`}</code> using <code>FallbackComponent</code>,{" "}
            <code>onError</code> for logging, and <code>resetKeys</code> so changing a key auto-resets.
            Confirm your behavior is identical with far less code.
          </li>
        </ol>
        <Callout variant="spring" title="Acceptance criteria">
          <ul className="list-disc space-y-1 pl-6">
            <li><code>ErrorBoundary</code> is a class using <code>getDerivedStateFromError</code> + <code>componentDidCatch</code>.</li>
            <li>Crashing one of three independently-wrapped widgets leaves the other two rendering.</li>
            <li>The fallback exposes a working <code>reset</code>, and you can articulate the reset-loop pitfall.</li>
            <li>You can demonstrate that an <code>onClick</code>/async throw is NOT caught, then make it caught by re-throwing in render.</li>
            <li><code>componentDidCatch</code> logs the error and its <code>componentStack</code>; nothing is logged from <code>getDerivedStateFromError</code>.</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-placement-reset" moduleSlug={MODULE_SLUG} title="Granular placement & resetting">
        <Quiz
          kind="Placement"
          question="A dashboard has a Header, a RevenueChart, and an ActivityFeed. You want a crash in ActivityFeed to leave the Header and RevenueChart fully working. What placement achieves that?"
          options={[
            {
              label: "Wrap RevenueChart and ActivityFeed each in their own ErrorBoundary, leaving the Header outside both",
              correct: true,
              explanation:
                "Correct. A boundary only unmounts the subtree below it down to the fallback. Separate boundaries per widget isolate failures, so an ActivityFeed crash trips only its own boundary while Header and RevenueChart render normally.",
            },
            {
              label: "Put a single ErrorBoundary at the root wrapping the whole dashboard",
              explanation:
                "A root-only boundary catches the crash but replaces the ENTIRE dashboard, Header and RevenueChart included, with one fallback. That's better than a blank page but not the isolation you wanted.",
            },
            {
              label: "No boundary at all; React isolates each component's errors by default",
              explanation:
                "React does the opposite by default: an uncaught render error unmounts the whole tree. Without a boundary, an ActivityFeed crash blanks everything.",
            },
            {
              label: "Wrap only the Header in a boundary, since it's the most important part",
              explanation:
                "The boundary protects what's INSIDE it, not what's outside. Wrapping the Header does nothing for a crash in ActivityFeed, that error propagates up past the unwrapped widgets and unmounts the tree.",
            },
          ]}
        />
        <Quiz
          kind="Reset"
          question="Your boundary trips, shows a fallback with a 'Try again' button that sets hasError back to false. The user clicks it but the same fallback immediately reappears. Why?"
          options={[
            {
              label: "The underlying cause is still present, so re-rendering the child throws again, reset clears the boundary but doesn't fix what threw",
              correct: true,
              explanation:
                "Exactly. Reset just flips hasError to false and re-attempts the children. If the bad state/data that caused the throw hasn't changed, the child throws again and you loop. Reset must pair with changing the input (refetch, clear state, re-key).",
            },
            {
              label: "componentDidCatch re-fires and re-trips the boundary every time you reset",
              explanation:
                "componentDidCatch only fires when a NEW error is caught. The re-trip happens because the child throws again on re-render, not because the logging method re-runs.",
            },
            {
              label: "You can't reset an error boundary once getDerivedStateFromError has run",
              explanation:
                "You can reset, setting hasError back to false re-attempts the children. The loop here is because the child still throws, not because reset is impossible.",
            },
            {
              label: "React caches the fallback and ignores subsequent state changes",
              explanation:
                "React doesn't cache the fallback. Setting hasError to false does re-render the children; they just throw again because the root cause persists.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
