import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "testing-frontend";

const CHECKPOINTS = [
  { id: "cp-trophy", title: "The testing trophy & what each layer buys" },
  { id: "cp-queries", title: "Querying like a user & userEvent" },
  { id: "cp-mocking-levels", title: "Mocking the network & test levels" },
];

export default function TestingFrontendModule() {
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
          Testing front-end like an engineer — what to test and what not to
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          You can write a hundred passing tests and still ship a broken app — if every test checks the wrong thing. Good
          front-end testing isn&apos;t about coverage numbers; it&apos;s about <em>confidence per line of test</em>. Test what the
          user experiences, mock at the edges, and lean on the cheap layers. Let&apos;s build the instinct for which tests are
          worth keeping.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The restaurant health inspector</h2>
        <p className="mb-4">
          A health inspector walks into a restaurant. They don&apos;t open the chef&apos;s skull to verify the recipe is memorized
          correctly, and they don&apos;t demand to see the exact brand of whisk used to fold the batter. They check the things that
          actually matter to a diner: is the food the right temperature, is the kitchen clean, does the dish that arrives match
          what the menu promised. They test <strong>observable outcomes</strong>, not internal technique.
        </p>
        <p className="mb-4">
          A bad inspector — the kind every kitchen dreads — files a violation because the chef switched from a wooden spoon to a
          silicone one. Nothing about the food changed; the diner can&apos;t tell the difference; but the report is now red. The
          kitchen learns to fear <em>any</em> change, even improvements, because the inspection punishes how the work is done
          rather than whether it works. That is a brittle test: it breaks on a refactor that changed nothing a user can perceive.
        </p>
        <p className="mb-4">
          Front-end tests have the exact same fork in the road. A <strong>resilient</strong> test asserts what the user sees and
          does: &quot;when I fill the form and click Submit, a success message appears.&quot; It survives any rewrite that keeps that
          behavior. A <strong>brittle</strong> test reaches inside — it checks a component&apos;s internal state variable, the name
          of a CSS class, or that a specific function was called — and shatters the moment you rename anything, even when the app
          still works perfectly. The whole discipline of modern front-end testing is choosing the inspector&apos;s eye over the
          skull-opener&apos;s.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The goal is <em>confidence that you didn&apos;t break the user&apos;s experience</em> — at the lowest maintenance cost.
            That means a deliberate mix of test types (the testing trophy), querying the DOM the way a user finds things (by role
            and label), simulating real interactions (userEvent), and mocking at the network boundary instead of mocking your own
            code. Everything below follows from &quot;test behavior, not implementation.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE TESTING TROPHY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The testing trophy — where to spend your effort</h2>
        <p className="mb-4">
          The old advice was the testing <em>pyramid</em>: a huge base of unit tests, fewer integration tests, a tiny cap of
          end-to-end. For front-end work, Kent C. Dodds reshaped it into the testing <strong>trophy</strong>, which weights things
          differently because UI bugs live in the seams <em>between</em> units, not inside them. From bottom to top:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Static analysis (the base).</strong> TypeScript, ESLint, Prettier. These catch a whole class of bugs —
            typos, wrong types, undefined variables — before a single test runs, on every keystroke, for free. The cheapest,
            fastest feedback there is.
          </li>
          <li>
            <strong>Unit tests.</strong> A pure function, a custom hook, a reducer in isolation. Fast and precise, but a passing
            unit test tells you a <em>piece</em> works — not that the pieces work <em>together</em>.
          </li>
          <li>
            <strong>Integration tests (the fat middle — spend most here).</strong> Render a component (or a few together) and
            test it the way a user would: type, click, assert what appears. This is where you get the most confidence per test
            because it exercises real wiring — state, props, event handlers, conditional rendering — all at once.
          </li>
          <li>
            <strong>End-to-end (the small top).</strong> Drive a real browser through a critical flow (Playwright, Cypress).
            Highest confidence, highest cost, slowest, flakiest. Reserve them for the handful of flows that <em>must</em> work:
            log in, check out, the money path.
          </li>
        </ul>
        <p className="mb-4">
          The reason the middle is fat: a front-end component is mostly <em>glue</em>. The interesting bugs are &quot;the button
          didn&apos;t disable while submitting,&quot; &quot;the error didn&apos;t clear after a retry,&quot; &quot;the list didn&apos;t
          re-render when the filter changed.&quot; Those are integration concerns. Pure-unit-testing every function gives you a
          green wall of tests and an app that still breaks at the joints.
        </p>
        <Callout variant="insight" title="The principle behind the shape">
          <p>
            &quot;The more your tests resemble the way your software is used, the more confidence they can give you.&quot; That single
            line explains the whole trophy — and explains why integration tests (rendering and interacting like a user) earn the
            biggest slice, while exhaustive isolated unit tests of glue code earn surprisingly little.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. RTL PHILOSOPHY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">React Testing Library — test behavior, not implementation</h2>
        <p className="mb-4">
          React Testing Library (RTL) is built around one opinion so strong it&apos;s printed on the box:{" "}
          <strong>&quot;The more your tests resemble the way your software is used, the more confidence they can give you.&quot;</strong>{" "}
          In practice that means RTL deliberately makes it <em>hard</em> to touch implementation details. There&apos;s no built-in
          way to read a component&apos;s state, call its methods, or check which child components rendered. You get the rendered
          DOM — the same thing a user gets — and you assert against that.
        </p>
        <p className="mb-4">Concretely, an implementation detail is anything the user can&apos;t observe and that can change without changing behavior:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>The value of a <code>useState</code> variable or the shape of internal state.</li>
          <li>Whether a particular helper function or child component was called.</li>
          <li>The CSS class names, or the exact tag (<code>&lt;div&gt;</code> vs <code>&lt;section&gt;</code>).</li>
          <li>A <code>data-testid</code> you added purely to grab the element in the test.</li>
        </ul>
        <p className="mb-4">
          Tests coupled to those break on refactors that change <em>nothing</em> the user sees — the brittle inspector again.
          Behavior, by contrast, is what shows up on screen and what happens when the user interacts: text appears, a button
          becomes disabled, a region gets announced. Here&apos;s the contrast in code:
        </p>
        <pre><code>{`// ❌ BRITTLE — tests implementation. Breaks if you rename state,
// swap the class, or refactor the internals — even when the UI is fine.
test("toggles open", () => {
  const { container } = render(<Accordion />);
  // reaching for a class name and poking internals
  expect(container.querySelector(".accordion--open")).toBeNull();
  // (or worse: inspecting component state directly)
});

// ✅ RESILIENT — tests behavior the user observes. Survives any
// refactor that keeps the behavior: rename, restyle, restructure.
test("expands the panel when the header is clicked", async () => {
  const user = userEvent.setup();
  render(<Accordion />);

  // the panel's content is not visible yet
  expect(screen.queryByText(/shipping details/i)).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /shipping/i }));

  // now it is — that's the behavior we care about
  expect(screen.getByText(/shipping details/i)).toBeInTheDocument();
});`}</code></pre>
        <Callout variant="warn" title="The data-testid smell">
          <p>
            <code>data-testid</code> isn&apos;t banned, but every one you add is a small admission that the element isn&apos;t
            reachable the way a user would reach it — by its role, its label, or its text. Before adding a test-id, ask: does this
            element have an accessible role and name? If not, that&apos;s often a real accessibility gap the test just exposed. Fix
            the markup and query by role instead; you improve the app and the test at once.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. QUERIES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Querying the way a user finds things</h2>
        <p className="mb-4">
          If a test should resemble real use, it should <em>find</em> elements the way a real user (or a screen reader) does. RTL
          publishes an explicit priority order for queries, and following it is the single biggest lever for writing resilient,
          accessible-by-default tests:
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong><code>getByRole</code></strong> — the top choice for almost everything. <code>getByRole(&quot;button&quot;, &#123;
            name: /submit/i &#125;)</code> finds the element by its accessibility role <em>and</em> its accessible name. This is
            exactly how assistive tech navigates, so a passing query is also a small accessibility check.
          </li>
          <li>
            <strong><code>getByLabelText</code></strong> — the right way to grab form fields, because it finds the input via its
            associated <code>&lt;label&gt;</code> (the same association a user relies on).
          </li>
          <li>
            <strong><code>getByPlaceholderText</code>, <code>getByText</code>, <code>getByDisplayValue</code></strong> — for
            non-interactive content and as fallbacks.
          </li>
          <li>
            <strong><code>getByAltText</code>, <code>getByTitle</code></strong> — niche cases (images, title attributes).
          </li>
          <li>
            <strong><code>getByTestId</code></strong> — the escape hatch of last resort, when nothing the user perceives can
            identify the element.
          </li>
        </ol>
        <p className="mb-4">
          The lesson: reach for the top of the list first. If you <em>can&apos;t</em> query by role or label, that&apos;s usually a
          signal the markup lacks a role or a name — a real gap, not a reason to drop to a test-id.
        </p>
        <pre><code>{`// Querying by role + accessible name — resilient and a11y-aware.
const submit = screen.getByRole("button", { name: /create account/i });

// Querying a field by its label — the user-facing association.
const email = screen.getByLabelText(/email address/i);

// getByRole even reads accessible state, so you can assert on it:
expect(submit).toBeDisabled();`}</code></pre>
        <Callout variant="insight" title="get vs query vs find — pick by intent">
          <p>
            <strong><code>getBy*</code></strong> throws if the element is missing — use it to assert something <em>should</em> be
            there now. <strong><code>queryBy*</code></strong> returns <code>null</code> instead of throwing — the only correct
            tool for asserting something is <em>absent</em> (<code>expect(...).not.toBeInTheDocument()</code>). <strong>
            <code>findBy*</code></strong> returns a promise and retries until the element appears or times out — the tool for{" "}
            <em>async</em> content (data that arrives after a fetch). Mixing these up is the most common beginner bug: using{" "}
            <code>getBy</code> for something that hasn&apos;t rendered yet throws instead of waiting.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. USEREVENT VS FIREEVENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>userEvent</code> over <code>fireEvent</code></h2>
        <p className="mb-4">
          To resemble real use, your interactions should resemble real interactions. <code>fireEvent</code> dispatches a single
          raw DOM event — <code>fireEvent.change(input, &#123; target: &#123; value: &quot;hi&quot; &#125; &#125;)</code> just sets the
          value and fires one <code>change</code>. A real user does far more: they focus the field, press keys one at a time
          (each firing <code>keydown</code>, <code>keypress</code>, <code>input</code>, <code>keyup</code>), and blur when they
          leave. <code>userEvent</code> simulates that full sequence.
        </p>
        <pre><code>{`// ❌ fireEvent — one synthetic event, skips focus/keydown/keyup.
// Can pass a test even when the real interaction would fail
// (e.g. a handler that only fires on keydown, or validation on blur).
fireEvent.change(screen.getByLabelText(/name/i), {
  target: { value: "Ada" },
});

// ✅ userEvent — focuses, types key by key, blurs. Behaves like a person.
const user = userEvent.setup();
await user.type(screen.getByLabelText(/name/i), "Ada");
await user.click(screen.getByRole("button", { name: /save/i }));`}</code></pre>
        <p className="mb-4">
          Why this matters in practice: lots of real UI logic hangs off events <code>fireEvent.change</code> never produces.
          Validation that runs on <code>blur</code>, a dropdown that opens on <code>keydown</code>, a character counter that
          updates per keystroke — <code>userEvent</code> exercises all of it, <code>fireEvent</code> silently skips it. A test
          using <code>fireEvent</code> can be green while the feature is broken for actual users. Note that modern{" "}
          <code>userEvent</code> APIs are <em>async</em> — you <code>await</code> them and call <code>userEvent.setup()</code>{" "}
          once per test.
        </p>
        <Callout variant="warn" title="Don't test internal state — test the result of changing it">
          <p>
            A tempting anti-pattern: reach into the component and assert <code>count === 1</code> after a click. You can&apos;t with
            RTL, and that&apos;s on purpose. Assert what the click <em>produced</em> instead — the visible &quot;1&quot; on screen,
            the button now disabled, the new list item. State is an implementation detail; the rendered consequence of the state
            is the behavior. Test the consequence and your test survives a rewrite from <code>useState</code> to{" "}
            <code>useReducer</code> to a store, because none of those change what the user sees.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-trophy" moduleSlug={MODULE_SLUG} title="The testing trophy & what each layer buys">
        <Quiz
          kind="The trophy"
          question="In the testing trophy, which layer should get the largest share of your effort for a typical front-end app, and why?"
          options={[
            {
              label: "Integration tests — rendering components and interacting like a user — because front-end bugs mostly live in the wiring between pieces, so these give the most confidence per test",
              correct: true,
              explanation:
                "Exactly. UI code is largely glue, and the interesting bugs (button didn't disable, error didn't clear, list didn't re-render) are integration concerns. Rendering and interacting like a user exercises real wiring, which is why the trophy makes the middle the fattest layer.",
            },
            {
              label: "Unit tests — one per function — because exhaustively testing each piece in isolation guarantees the whole works",
              explanation:
                "A wall of passing unit tests tells you the pieces work alone, not that they work together. Glue-code bugs slip right between green unit tests. The trophy deliberately shrinks the isolated-unit layer relative to integration.",
            },
            {
              label: "End-to-end tests — because driving a real browser is the only thing that gives any real confidence",
              explanation:
                "E2E gives the highest confidence per test but is slow, flaky, and expensive to maintain — so it's the small top of the trophy, reserved for a few critical flows, not where most effort goes.",
            },
          ]}
        />
        <Quiz
          kind="Static analysis"
          question="Why does the testing trophy put static analysis (TypeScript, ESLint) at the base rather than treating it as separate from testing?"
          options={[
            {
              label: "It catches a whole class of bugs — typos, wrong types, undefined access — before any test runs, on every keystroke, at near-zero cost",
              correct: true,
              explanation:
                "Right. Static analysis is the cheapest, fastest feedback loop there is: it flags errors as you type without executing anything. Counting it as the base of the trophy reflects that it prevents bugs the test layers would otherwise have to catch.",
            },
            {
              label: "Because types and lint rules replace the need for any runtime tests entirely",
              explanation:
                "Static analysis can't verify runtime behavior — whether clicking submit shows a success message, for instance. It's the foundation that frees the test layers to focus on behavior, not a replacement for them.",
            },
            {
              label: "Because ESLint runs the integration tests for you automatically",
              explanation:
                "ESLint is a static linter; it doesn't run tests. It analyzes code without executing it. The point is that this analysis is a distinct, cheap layer of bug-catching that sits beneath the runtime test layers.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. ASYNC ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Async UI — <code>findBy*</code> and <code>waitFor</code></h2>
        <p className="mb-4">
          Most real components don&apos;t render their final state synchronously. You click &quot;Load,&quot; a request goes out, and
          a moment later the results appear. If you assert with <code>getByText</code> immediately after the click, the element
          isn&apos;t there yet and the test throws. You need to <em>wait</em> for the DOM to catch up — without sprinkling
          arbitrary <code>setTimeout</code>s, which make tests slow and flaky.
        </p>
        <pre><code>{`// findBy* returns a promise that retries until the element appears
// (or times out). Perfect for "something shows up after async work."
await user.click(screen.getByRole("button", { name: /load profile/i }));
const heading = await screen.findByRole("heading", { name: /ada lovelace/i });
expect(heading).toBeInTheDocument();

// waitFor retries an assertion until it passes — use when there's no
// single element to find, e.g. waiting for something to DISAPPEAR.
await waitFor(() => {
  expect(screen.queryByText(/loading…/i)).not.toBeInTheDocument();
});`}</code></pre>
        <p className="mb-4">
          The rule of thumb: prefer <code>findBy*</code> when you&apos;re waiting for an element to <em>appear</em> (it&apos;s
          concise and retries for you), and reach for <code>waitFor</code> when you&apos;re waiting for a condition that isn&apos;t
          &quot;an element exists&quot; — like a spinner disappearing or a mock having been called. Never assert on async results
          synchronously, and never replace waiting with a fixed delay.
        </p>
        <Callout variant="warn" title="act() warnings are a signal, not noise">
          <p>
            If your test logs &quot;an update was not wrapped in act(...)&quot;, it almost always means state updated <em>after</em>{" "}
            the test thought it was done — an async update you didn&apos;t wait for. The fix is rarely to wrap things in{" "}
            <code>act</code> manually; it&apos;s to <code>await</code> the right <code>findBy*</code> or <code>waitFor</code> so the
            test actually waits for the work to finish. Treat the warning as &quot;you have an un-awaited async update,&quot; not as
            something to silence.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. MOCKING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Mock the network at the boundary — with MSW</h2>
        <p className="mb-4">
          Your component fetches data. In a test you don&apos;t want to hit a real server (slow, flaky, requires a backend), so
          you have to fake it. The question is <em>where</em> you fake it — and this is one of the most consequential testing
          decisions you&apos;ll make.
        </p>
        <p className="mb-4">
          The tempting approach is to mock your own module: <code>jest.mock(&quot;./api&quot;)</code> and stub out{" "}
          <code>getUser</code>. It works, but it couples the test to your <em>code structure</em>. Rename the function, split the
          module, switch from <code>fetch</code> to <code>axios</code>, move to React Query — and the test breaks even though the
          component still makes the same request and renders the same result. You mocked an implementation detail.
        </p>
        <p className="mb-4">
          The resilient approach is to mock the <strong>network boundary</strong> — the actual HTTP request — using{" "}
          <strong>MSW (Mock Service Worker)</strong>. MSW intercepts requests at the network level and returns canned responses,
          so your component runs its <em>real</em> data-fetching code. The test only cares about &quot;a GET to{" "}
          <code>/api/user</code> returns this JSON,&quot; which is a contract that doesn&apos;t change when you refactor internals.
        </p>
        <pre><code>{`// MSW: describe the network contract, not your modules.
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/user", () => {
    return HttpResponse.json({ name: "Ada Lovelace" });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers()); // reset per-test overrides
afterAll(() => server.close());

test("shows the fetched user", async () => {
  render(<Profile />);                       // runs the REAL fetch code
  expect(await screen.findByText(/ada lovelace/i)).toBeInTheDocument();
});

test("shows an error when the request fails", async () => {
  // override just this test to return a 500
  server.use(http.get("/api/user", () => new HttpResponse(null, { status: 500 })));
  render(<Profile />);
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});`}</code></pre>
        <Callout variant="insight" title="The boundary rule">
          <p>
            Mock at the edges of your system, not inside it. The network, the system clock, randomness, the file system — those
            are real boundaries worth faking because they&apos;re slow, non-deterministic, or external. Your own functions and
            components are <em>inside</em> the boundary; mocking them turns the test into a test of your mocks. MSW is popular
            precisely because it lets every layer above the network run for real while still being fully deterministic.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-queries" moduleSlug={MODULE_SLUG} title="Querying like a user & userEvent">
        <Quiz
          kind="Query priority"
          question="You need to find a 'Submit' button in a test. Which query should you reach for first, and why?"
          options={[
            {
              label: "getByRole('button', { name: /submit/i }) — it finds the element by accessibility role and accessible name, the same way assistive tech and users do",
              correct: true,
              explanation:
                "Correct. getByRole sits at the top of RTL's query priority because it matches how the element is actually perceived and operated. A passing role query doubles as a small accessibility check, and it survives refactors that change classes or tags.",
            },
            {
              label: "getByTestId('submit-btn') — test-ids are the most stable because they never change",
              explanation:
                "Test-ids are the last-resort escape hatch, not the first choice. Reaching for one usually means the element lacks a role or name a user could perceive — a real gap. Query by role first; add a test-id only when nothing user-facing identifies the element.",
            },
            {
              label: "container.querySelector('.btn-primary') — selecting by CSS class is the most precise",
              explanation:
                "Querying by class name couples the test to styling, an implementation detail. Rename or restyle the button and the test breaks even though the behavior is unchanged. That's the definition of a brittle test.",
            },
          ]}
        />
        <Quiz
          kind="userEvent vs fireEvent"
          question="Why is userEvent generally preferred over fireEvent for simulating interactions?"
          options={[
            {
              label: "userEvent reproduces the full real interaction (focus, key-by-key typing, blur), so it exercises handlers that fire on keydown/blur that fireEvent's single synthetic event would skip",
              correct: true,
              explanation:
                "Exactly. fireEvent dispatches one raw event; userEvent simulates what a person actually does. A fireEvent.change can pass while validation-on-blur or a keydown-driven dropdown is broken for real users — userEvent catches that because it resembles real use.",
            },
            {
              label: "userEvent is faster because it skips dispatching DOM events entirely",
              explanation:
                "It's the opposite — userEvent dispatches MORE events (the full sequence a real interaction produces), which is precisely why it's more faithful. The value is fidelity, not speed.",
            },
            {
              label: "fireEvent can only be used in end-to-end tests, not component tests",
              explanation:
                "fireEvent works in component tests too; that's not the distinction. The reason to prefer userEvent is that it resembles real user behavior more closely, exercising event sequences fireEvent omits.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 8. TEST LEVELS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Component vs integration vs E2E — what each is good at</h2>
        <p className="mb-4">
          These layers aren&apos;t competitors; they answer different questions, and a healthy suite uses each for what it does
          best. The runner for the bottom layers is <strong>Vitest</strong> or <strong>Jest</strong> (Vitest is the modern
          default in Vite-based projects; Jest is the long-standing standard — the APIs are nearly identical), paired with RTL
          and a DOM environment like <code>jsdom</code>. E2E uses a real browser via <strong>Playwright</strong> or Cypress.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Component test</strong> — renders one component in <code>jsdom</code> with RTL. Fast, focused. Good for: a
            single component&apos;s states (loading, error, empty, success), its conditional rendering, its event handling. Mocks
            the network with MSW. Doesn&apos;t exercise real routing or a real browser.
          </li>
          <li>
            <strong>Integration test</strong> — renders several components together (a page, a feature) and drives a flow. Same
            runner and tools, wider scope. Good for: &quot;fill the form, submit, see the success state&quot; — the seams between
            components where most bugs live. Still in <code>jsdom</code>, still MSW for the network.
          </li>
          <li>
            <strong>End-to-end (Playwright)</strong> — launches a real browser against a real (or close-to-real) build. Good for:
            the critical money paths — auth, checkout, the one flow that must never break. Catches things <code>jsdom</code>
            can&apos;t: real navigation, real network, real CSS layout, third-party scripts. Costs: slow, flaky, expensive to
            maintain — so you keep them few.
          </li>
        </ul>
        <p className="mb-4">
          A useful way to choose: ask &quot;what&apos;s the smallest test that would have caught this bug?&quot; A type error → static
          analysis. A pure-function edge case → a unit test. A component not clearing its error on retry → an integration test.
          The login flow silently breaking in production → an E2E. Push each concern to the cheapest layer that can catch it.
        </p>
        <Callout variant="info" title="jsdom is not a browser">
          <p>
            Component and integration tests run in <code>jsdom</code>, a JavaScript implementation of the DOM — not a real
            browser. It doesn&apos;t do real layout, real paint, or real navigation; things like <code>getBoundingClientRect</code>{" "}
            return zeros, and CSS doesn&apos;t actually affect visibility the way it does in Chrome. That&apos;s a feature (fast,
            deterministic) <em>and</em> a limitation (some bugs only appear in a real browser). It&apos;s exactly why you keep a
            few E2E tests on top — to cover what <code>jsdom</code> structurally can&apos;t.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. SNAPSHOTS & A11Y ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Snapshot tests and accessibility assertions</h2>
        <p className="mb-4">
          <strong>Snapshot tests</strong> serialize a component&apos;s rendered output to a file and fail if it ever differs.
          They&apos;re seductive — one line gives you &quot;coverage&quot; — but they cut both ways:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>The tradeoff.</strong> A snapshot asserts the <em>entire</em> markup, so it fails on <em>any</em> change —
            including intentional, correct ones. The usual outcome is that developers stop reading the diffs and reflexively run{" "}
            <code>--update</code>, at which point the snapshot tests nothing: it just records whatever the code currently does.
            A large auto-generated snapshot is the brittle inspector turned up to maximum.
          </li>
          <li>
            <strong>When they earn their keep.</strong> Small, focused, intentional snapshots — a single formatted value, a tiny
            error message, a serialized config object — where a change should genuinely be reviewed. Keep them small enough that
            a human actually reads the diff. Prefer <code>toMatchInlineSnapshot</code> so the expected value lives right next to
            the test.
          </li>
        </ul>
        <p className="mb-4">
          On the other end of the spectrum are <strong>accessibility assertions</strong>, which tie directly back to the
          accessibility module. <code>jest-axe</code> runs the axe rules engine against your rendered DOM and fails the test on
          detectable a11y violations — missing labels, bad contrast in markup, invalid ARIA. Because RTL already pushes you to
          query by role and label, you&apos;re half-way there; <code>jest-axe</code> makes the floor explicit and automated.
        </p>
        <pre><code>{`import { axe } from "jest-axe";

test("the signup form has no detectable a11y violations", async () => {
  const { container } = render(<SignupForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations(); // custom matcher from jest-axe
});`}</code></pre>
        <Callout variant="warn" title="Automated a11y checks are a floor, not a ceiling">
          <p>
            <code>jest-axe</code> catches roughly the violations a machine can detect — missing names, invalid roles, obvious
            contrast issues. It cannot tell you whether the focus order makes sense, whether a screen-reader announcement is
            <em>useful</em>, or whether the keyboard flow is sane. As the a11y module stressed, automated checks are a backstop;
            real confidence still comes from querying by role (which your RTL tests already do) and from manual keyboard and
            screen-reader passes.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 10. BRITTLE VS RESILIENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What makes a test brittle vs resilient</h2>
        <p className="mb-4">
          Everything in this module rolls up into one judgment call you&apos;ll make on every test: am I coupling to behavior the
          user observes, or to an implementation detail that can change freely? Here&apos;s the cheat sheet.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Brittle:</strong> queries by CSS class or <code>data-testid</code>; asserts internal state or that a function
            was called; uses <code>fireEvent</code> for things a user does with the keyboard; mocks your own modules; large
            auto-updated snapshots; fixed <code>setTimeout</code> waits.
          </li>
          <li>
            <strong>Resilient:</strong> queries by role / label / text; asserts what renders and what the user can do; uses{" "}
            <code>userEvent</code> for real interactions; mocks the network at the boundary with MSW; waits with{" "}
            <code>findBy*</code> / <code>waitFor</code>; small intentional snapshots only.
          </li>
        </ul>
        <p className="mb-4">
          The acid test: <strong>&quot;If I refactored the internals without changing what the user sees, would this test still
          pass?&quot;</strong> If the answer is no, you&apos;re testing implementation, and that test will cost you more in false
          failures than it saves in caught bugs. A resilient suite is one you <em>trust</em> — green means safe to ship, red
          means a real problem — and that trust is the entire point of having tests.
        </p>
        <Callout variant="insight" title="Tests are a confidence budget, not a coverage trophy">
          <p>
            A test that breaks on every refactor and never catches a real bug has <em>negative</em> value — it slows you down and
            trains the team to ignore failures. Coverage percentage measures lines executed, not confidence gained. Optimize for
            confidence per maintenance cost: fewer, behavior-focused tests at the right layer beat a wall of brittle ones every
            time.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 11. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do you test a front-end component?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Test behavior, not implementation.</strong> Assert what the user sees and does, never internal state or
              class names. The acid test: would it survive a refactor that didn&apos;t change the UI?
            </li>
            <li>
              <strong>Spend on the trophy&apos;s middle.</strong> Static analysis &gt; some units &gt; <em>mostly integration</em>{" "}
              (render and interact like a user) &gt; a few E2E for critical flows.
            </li>
            <li>
              <strong>Query like a user.</strong> <code>getByRole</code> / <code>getByLabelText</code> first, test-id last. Use{" "}
              <code>userEvent</code>, not <code>fireEvent</code>; <code>findBy*</code> / <code>waitFor</code> for async.
            </li>
            <li>
              <strong>Mock the network, not your modules.</strong> MSW intercepts HTTP at the boundary so your real code runs and
              tests survive refactors.
            </li>
            <li>
              <strong>Use snapshots sparingly</strong> (small, intentional) and add <code>jest-axe</code> as an accessibility
              floor — a backstop, not a substitute for role-based queries and manual checks.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 12. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — a behavior-focused suite for a form</h2>
        <p className="mb-4">
          You&apos;ll write a Testing Library suite for a real form component — happy path, validation error, and an async submit
          against a mocked request — querying everything by accessible role and label, then cap it with a single Playwright E2E
          for the critical flow. The goal is to <em>feel</em> the difference between a test that breaks on a refactor and one
          that doesn&apos;t.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Set up the runner and tools.</strong> Vitest (or Jest) + React Testing Library + <code>jsdom</code> +{" "}
            <code>@testing-library/user-event</code>. Add <code>@testing-library/jest-dom</code> for matchers like{" "}
            <code>toBeInTheDocument</code> and <code>toBeDisabled</code>. Confirm one trivial render test passes before going
            further.
          </li>
          <li>
            <strong>Test the happy path by behavior.</strong> Render the form, find fields with <code>getByLabelText</code>, type
            into them with <code>userEvent</code>, click the submit button found by <code>getByRole</code>, and assert the
            success message appears. Notice you never touched component state or a class name — only what a user would see.
          </li>
          <li>
            <strong>Test a validation error.</strong> Submit with an invalid or empty field and assert the error message renders
            and (if applicable) that submission was blocked. Query the error by its text/role; assert it&apos;s <em>absent</em>{" "}
            beforehand with <code>queryBy*</code> and <code>not.toBeInTheDocument()</code>.
          </li>
          <li>
            <strong>Test the async submit with MSW.</strong> Stand up an MSW handler for the form&apos;s POST endpoint returning
            success. Submit, then use <code>findBy*</code> to wait for the confirmation. Add a second test where{" "}
            <code>server.use</code> overrides the handler to return a 500 and assert the error state — all without mocking your
            own fetch code.
          </li>
          <li>
            <strong>Add an accessibility assertion.</strong> Run <code>jest-axe</code> against the rendered form and assert no
            violations. If it fails, fix the markup (a missing label is a common culprit) rather than suppressing the rule —
            and watch your role/label queries get easier as a result.
          </li>
          <li>
            <strong>Cap it with one Playwright E2E.</strong> Write a single end-to-end test that drives a real browser through
            the critical flow (open the page, fill the form, submit, see the result). Note what it catches that{" "}
            <code>jsdom</code> can&apos;t — and why you wouldn&apos;t want a hundred of them.
          </li>
          <li>
            <strong>Stretch — prove resilience.</strong> Refactor the form&apos;s internals (rename a state variable, change a{" "}
            <code>&lt;div&gt;</code> to a <code>&lt;section&gt;</code>, swap <code>useState</code> for <code>useReducer</code>)
            without changing behavior. A resilient suite stays green. If anything goes red, you found an implementation-coupled
            test — rewrite it to assert behavior instead.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you write server tests, you already know this instinct: you test an endpoint&apos;s <em>contract</em> — given this
            request, expect this response and this side effect — not the private methods inside the handler, and you stub the
            database or downstream service at its boundary, not your own service layer. Front-end testing is the same discipline
            pointed at the DOM. RTL&apos;s &quot;query by role&quot; is &quot;assert on the public response shape&quot;; MSW is{" "}
            &quot;stub the downstream HTTP dependency&quot;; mocking your own component is the front-end version of mocking the very
            class under test — a test of your mocks, not your code.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-mocking-levels" moduleSlug={MODULE_SLUG} title="Mocking the network & test levels">
        <Quiz
          kind="Where to mock"
          question="Your component fetches /api/user and renders the name. Why is mocking the network with MSW better than jest.mock('./api') on your own fetch module?"
          options={[
            {
              label: "MSW fakes the HTTP boundary so your real fetching code runs; the test asserts a network contract that survives refactors, whereas mocking your module couples the test to your code structure",
              correct: true,
              explanation:
                "Exactly. Mocking your own module breaks when you rename the function, split the file, or switch fetch→axios→React Query — even though the component still makes the same request and renders the same thing. MSW intercepts at the network level, so everything above the boundary runs for real and the test stays resilient.",
            },
            {
              label: "jest.mock is better because mocking your own modules is always more reliable than intercepting the network",
              explanation:
                "Mocking your own modules couples the test to implementation details — the module name, the function signature, the library. That's exactly what makes such tests brittle. The boundary rule says fake the network (an external edge), not your own code.",
            },
            {
              label: "There's no real difference; both approaches test the same thing equally well",
              explanation:
                "They differ in what they couple to. Module mocks couple to your code structure and break on refactors that don't change behavior; MSW couples to the HTTP contract and runs your real fetch code. The boundary choice is what makes one resilient and the other brittle.",
            },
          ]}
        />
        <Quiz
          kind="Choosing the level"
          question="A bug: a component fails to clear its error message after the user retries and the second request succeeds. What's the smallest test layer that would reliably catch it?"
          options={[
            {
              label: "An integration/component test — render the component, simulate the failing-then-succeeding flow with userEvent and an MSW override, and assert the error is gone after retry",
              correct: true,
              explanation:
                "Right. This is a wiring/state-transition bug between the component's states — exactly the integration layer's strength. Render it, drive the retry with userEvent, swap the MSW handler from 500 to 200, and assert the error message is no longer in the document. Fast, deterministic, and targeted.",
            },
            {
              label: "An end-to-end Playwright test, because only a real browser can verify error handling",
              explanation:
                "An E2E could catch it, but it's the most expensive, slowest, flakiest option for a bug that's fully reproducible in jsdom with an MSW override. Push the concern to the cheapest layer that can catch it — here, an integration test.",
            },
            {
              label: "A unit test of the error-state variable in isolation",
              explanation:
                "RTL won't let you assert the internal state variable, and you shouldn't — that's an implementation detail. The bug is about the rendered error clearing after a retry flow, which is a behavior best exercised by rendering and interacting, i.e. an integration test.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
