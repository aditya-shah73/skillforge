import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "global-url-state";

const CHECKPOINTS = [
  { id: "cp-decision-tree", title: "The decision tree" },
  { id: "cp-url-state", title: "The URL is state" },
  { id: "cp-global-ladder", title: "The global-store ladder" },
];

export default function GlobalUrlStateModule() {
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
          Where state should live, local, lifted, global, and the URL
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Most of what you call &quot;global state&quot; isn&apos;t state at all. It&apos;s server
          cache wearing a costume, or it&apos;s the URL waiting to be used. Learn the decision tree
          that tells you exactly where each piece of state belongs, and stop reaching for a store
          you don&apos;t need.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. The analogy ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Where do you keep your stuff?</h2>
        <p className="mb-4">
          Think about the physical things in your life and where you keep them. Your keys go in your{" "}
          <strong>pocket</strong>, they&apos;re yours, you need them constantly, nobody else touches
          them. The good kitchen knife goes in a <strong>shared drawer</strong>, you and your
          roommate both reach for it, so it lives somewhere you can both get to. The holiday
          decorations go in the <strong>building&apos;s storage room</strong>, used rarely, by lots
          of people, kept far away from the everyday. And the apartment number? That&apos;s{" "}
          <strong>written on the front door</strong>, public, permanent enough, and anyone can read
          it, point at it, or write it down to find you again.
        </p>
        <p className="mb-4">
          Application state works the exact same way. Every piece of state has a natural home, and
          the cost of getting it wrong is real:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Your pocket → local state.</strong> A toggle, an input&apos;s draft value, an
            &quot;is this menu open&quot; boolean. One component owns it; nobody else cares.
          </li>
          <li>
            <strong>The shared drawer → lifted state.</strong> Two sibling components need the same
            value, so it moves up to their nearest common parent. Not higher, just to the drawer
            they both reach into.
          </li>
          <li>
            <strong>The building storage room → global state.</strong> Genuinely cross-cutting
            values that distant, unrelated parts of the app need: theme, the logged-in user, locale.
            Far away, accessed from anywhere, used by everyone.
          </li>
          <li>
            <strong>Written on the front door → the URL.</strong> Anything you&apos;d want to share,
            bookmark, or get back to with the back button: filters, the selected tab, which item is
            open, what page of results you&apos;re on.
          </li>
        </ul>
        <Callout variant="insight" title="The whole module in one sentence">
          <p>
            Put each piece of state in the <strong>smallest place that works</strong>. Promote it
            outward only when a real requirement forces you to, never &quot;just in case.&quot; The
            most common, most expensive mistake in front-end code is keeping state in a bigger, more
            global box than it needs.
          </p>
        </Callout>
        <p className="mb-4">
          Notice the trap that lurks here. A junior reflex is: &quot;this might be needed elsewhere
          later, so I&apos;ll put it in a global store now.&quot; That&apos;s like keeping your keys
          in the building storage room because <em>maybe</em> a neighbor will need them someday. Now
          every lookup is a trek down the hall, the keys are entangled with everyone else&apos;s
          stuff, and you&apos;ve made a simple thing complicated. Start small. Promote on evidence.
        </p>
      </section>

      {/* ───────────────────────── 2. The decision tree ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The decision tree (memorize this spine)</h2>
        <p className="mb-4">
          When a new piece of state shows up, don&apos;t guess. Run it down this tree, in order. The
          first &quot;yes&quot; wins. This is the single most useful mental model in this whole
          phase.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`Is this data that lives on a server? (a list of products,
the current user's orders, search results from an API)
  └─ YES → It is SERVER CACHE, not state. Use your data-fetching
           layer (React Query / SWR / RSC). It is not "your" state;
           it is a local copy of someone else's source of truth.
           Stop here. Do NOT put it in useState or a global store.

Should this survive a refresh / be shareable / be bookmarkable /
work with the back button? (active filters, sort order, the
selected tab, which row is expanded, the current page number)
  └─ YES → Put it in the URL (searchParams). The URL is state.
           Stop here. No store needed.

Do only ONE component (and maybe its descendants) need it?
(a dropdown's open/closed flag, a form field's draft value,
a hover state)
  └─ YES → LOCAL state (useState/useReducer) in that component.
           If a sibling later needs it too, LIFT it to the lowest
           common ancestor — and not one level higher.

Do genuinely DISTANT, unrelated parts of the app need it, with no
sensible common parent to lift to? (theme, auth/current user,
locale, a feature-flag set)
  └─ YES → GLOBAL state. Now — and only now — reach for Context
           or a store like Zustand.`}</code></pre>
        <p className="mb-4">
          Read the tree top to bottom. Each branch you pass <em>removes</em> a reason to use a
          store. By the time you reach the bottom branch, you&apos;ve filtered out server data, URL
          state, and local/lifted state, and what&apos;s left as &quot;truly global&quot; is a
          surprisingly tiny list.
        </p>
        <Callout variant="warn" title="The order matters">
          <p>
            Don&apos;t skip to the bottom. The number-one cause of bloated, hard-to-debug front-end
            apps is treating <strong>server cache</strong> and <strong>URL state</strong> as if they
            were ordinary global state, copying API data into a Redux store, or holding the active
            filter in a Zustand store instead of the query string. You inherit all the costs of a
            store (sync bugs, stale data, boilerplate) and lose the benefits the right home gives you
            for free (cache invalidation, shareable links).
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. Local → lifted ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Start local, lift only when forced</h2>
        <p className="mb-4">
          The default home for state is <strong>colocated</strong>: declared in the component that
          uses it, as close to where it&apos;s read as possible. Colocation is a superpower,
          everything about that state (its declaration, its updates, its usage) sits in one file you
          can hold in your head.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`// Local: the component owns it. Nobody else cares.
function SearchBox() {
  const [query, setQuery] = useState("");
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}`}</code></pre>
        <p className="mb-4">
          The moment <em>two sibling components</em> must agree on a value, you have a real reason to
          move it. You <strong>lift</strong> it to their nearest common ancestor and pass it down as
          props. This is the classic React data-flow: state up, props down.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`// Lifted: SearchBox and ResultsCount both need 'query',
// so it lives in their lowest common parent — and no higher.
function ProductSearch() {
  const [query, setQuery] = useState("");
  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <ResultsCount query={query} />
    </>
  );
}`}</code></pre>
        <p className="mb-4">
          The discipline is in the words <strong>&quot;and no higher.&quot;</strong> It&apos;s
          tempting to keep lifting, all the way to the app root, or into a global store, because it
          feels like it makes future sharing easy. It doesn&apos;t; it makes the state harder to
          reason about and forces re-renders on components that don&apos;t care. Lift to the{" "}
          <em>lowest common ancestor</em> of exactly the components that need the value. If only
          siblings A and B share it, the value belongs in their parent, not in their grandparent and
          not in a store.
        </p>
        <Callout variant="info" title="When lifting starts to hurt">
          <p>
            If you find yourself lifting state five levels up and threading props through three
            components that don&apos;t use them (&quot;prop drilling&quot;), that&apos;s a signal,
            but not always a signal for a global store. Often it&apos;s a signal that the value
            should be in the URL, or that <code>children</code> composition would let you pass the
            already-built element down instead of the raw data. Reach for Context/Zustand only when
            the consumers are genuinely scattered with no reasonable common parent.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 4. Most global state is a mirage ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The big insight: most &quot;global state&quot; is a mirage</h2>
        <p className="mb-4">
          Here&apos;s the claim that reframes how you build apps: the vast majority of what teams
          stuff into a global store <strong>was never global state to begin with</strong>. Pull any
          real-world Redux store apart and you&apos;ll find it&apos;s mostly two impostors:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Server cache masquerading as state.</strong> The list of products, the
            user&apos;s orders, the search results, these all have a source of truth on a server.
            Storing them in Redux means you now own a <em>copy</em>, and you have to manually keep it
            in sync, invalidate it, refetch it, handle loading and error states by hand. That&apos;s
            the previous module&apos;s whole point: a data-fetching layer (React Query / SWR / RSC)
            owns this far better than a store ever will.
          </li>
          <li>
            <strong>URL state in disguise.</strong> The active filters, the current tab, the selected
            item id, the page number. Teams reach for a store to hold these, and then bolt on extra
            code to sync them to the URL for shareability. Backwards. The URL <em>is</em> the store
            for this kind of state.
          </li>
        </ul>
        <p className="mb-4">
          Strip those two away, and what&apos;s actually, irreducibly global? A short list:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Theme</strong> (light/dark), read in many places, changed rarely.</li>
          <li><strong>The current user / auth session</strong>, needed across the whole app.</li>
          <li><strong>Locale / i18n</strong>, affects rendering everywhere.</li>
          <li><strong>A feature-flag set</strong>, read widely, set once at load.</li>
          <li>Maybe a global toast/notification queue or a command palette&apos;s open state.</li>
        </ul>
        <p className="mb-4">
          Notice the common thread: these are <em>small, low-frequency, read-widely</em> values.
          That profile is exactly why a heavy store is overkill for them, and it&apos;s why so many
          apps that &quot;need Redux&quot; really only need a tiny Context or a fifty-line Zustand
          store.
        </p>
        <Callout variant="insight" title="Reframe the question">
          <p>
            Before asking <strong>&quot;which store should I use?&quot;</strong> ask{" "}
            <strong>&quot;is this even global state?&quot;</strong> Nine times out of ten the answer
            is &quot;no, it&apos;s server cache or it&apos;s the URL,&quot; and the store question
            evaporates. The best global-state code is the global-state code you never wrote.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. URL as state ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The URL is state, use it</h2>
        <p className="mb-4">
          The query string (<code>?sort=price&amp;page=2&amp;tag=react</code>) is the most
          underused state container in front-end development. Filters, sort order, pagination, the
          selected tab, the open item, all of it belongs here, and the payoff is enormous:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Shareable.</strong> Paste the link in Slack and your teammate sees the exact same filtered view.</li>
          <li><strong>Bookmarkable.</strong> &quot;Open orders, sorted by date&quot; becomes a bookmark, not a sequence of clicks.</li>
          <li><strong>Survives refresh.</strong> Hit reload and you&apos;re right where you were, no reset to defaults.</li>
          <li><strong>Back button works.</strong> Changing a filter pushes history; back/forward navigates filter states intuitively.</li>
          <li><strong>Zero extra store.</strong> No <code>useState</code>, no Zustand, no sync logic. The browser already manages it.</li>
        </ul>
        <p className="mb-4">
          The concept is framework-agnostic: read state from the query string, write state by
          updating the URL. In Next.js App Router that looks like <code>useSearchParams</code> to
          read and the router to write:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // READ: the URL is the source of truth. Default when absent.
  const sort = searchParams.get("sort") ?? "popular";
  const page = Number(searchParams.get("page") ?? "1");

  // WRITE: copy the current params, mutate one key, push the new URL.
  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      // Changing a filter usually resets you to page 1.
      if (key !== "page") params.delete("page");
      router.push(\`\${pathname}?\${params.toString()}\`);
    },
    [searchParams, router, pathname]
  );

  return (
    <select value={sort} onChange={(e) => setParam("sort", e.target.value)}>
      <option value="popular">Most popular</option>
      <option value="price">Price: low to high</option>
      <option value="newest">Newest</option>
    </select>
  );
}`}</code></pre>
        <p className="mb-4">
          There is no <code>useState</code> for <code>sort</code> or <code>page</code> anywhere. The
          URL holds the value; the component just reads it and renders. When the user picks a sort,
          you don&apos;t set local state, you navigate to a new URL, and the component re-renders
          with the new <code>searchParams</code>. The browser&apos;s history stack does the rest.
        </p>
        <Callout variant="warn" title="The tradeoffs (they&apos;re real but small)">
          <p>
            The URL only holds <strong>serializable strings</strong>. You can encode numbers,
            enums, comma-separated id lists, even small JSON, but you can&apos;t stash a function, a
            class instance, or a 5MB object there. URLs also have a practical{" "}
            <strong>length limit</strong> (browsers and servers cap around ~2,000–8,000 chars), so
            don&apos;t serialize an entire grid&apos;s worth of state into it. The right test:
            &quot;would a human want to share or bookmark this exact view?&quot; If yes, URL. If
            it&apos;s ephemeral UI fluff (a tooltip&apos;s hover state), keep it local.
          </p>
        </Callout>
        <p className="mb-4">
          A subtle but important choice: <code>router.push</code> adds a history entry (back button
          steps through filter changes) while <code>router.replace</code> swaps the current entry
          (no new history). Use <code>push</code> for meaningful navigations the user might want to
          undo with back; use <code>replace</code> for noisy, high-frequency updates (like a search
          box that fires on every keystroke) where flooding history would make the back button
          useless.
        </p>
      </section>

      {/* ────────── CHECKPOINT 1 ────────── */}
      <Checkpoint id="cp-decision-tree" moduleSlug={MODULE_SLUG} title="The decision tree">
        <Quiz
          kind="Decision check"
          question="You're building a product page. The active category filter, the sort order, and the current page of results all need to be remembered. A teammate suggests putting them in a global Zustand store so they're easy to access. What's the better call, and why?"
          options={[
            {
              label: "Put them in the URL via searchParams, they're filter/sort/pagination state, which is exactly what URL state is for.",
              correct: true,
              explanation:
                "Filters, sort, and pagination are the canonical URL-state case. Putting them in the URL makes the view shareable, bookmarkable, refresh-proof, and back-button friendly, all for free, with no store to write or sync.",
            },
            {
              label: "Zustand is fine, a small store keeps the values in one place and any component can read them.",
              explanation:
                "A store can hold these, but you'd lose shareability/bookmarkability and have to bolt on URL-sync code anyway. The URL already does all of that with zero extra state. The store is solving a problem you don't have.",
            },
            {
              label: "Keep all three in useState at the page root and prop-drill them down.",
              explanation:
                "This works mechanically but throws away the back button, sharing, and refresh-survival. These are shareable/bookmarkable values, so the decision tree routes them to the URL before you ever reach the local-state branch.",
            },
            {
              label: "Store them on the server and refetch on every interaction.",
              explanation:
                "The filter values themselves aren't server data, they're how the user is viewing the data. The server is the source of truth for the products, not for which filter the user picked. That belongs in the URL.",
            },
          ]}
        />
        <Quiz
          kind="Gut check"
          question="Running the decision tree, what's the FIRST question you ask about any new piece of state, and why is it first?"
          options={[
            {
              label: "\"Is this data that lives on a server?\", because if it is, it's server cache, not state, and the whole store/URL/local question never applies.",
              correct: true,
              explanation:
                "Server data is the most common impostor. Catching it first means you hand it to your data-fetching layer instead of duplicating it into state you then have to keep in sync. Every other branch assumes you've already ruled this out.",
            },
            {
              label: "\"Which global store should I use, Context, Zustand, or Redux?\"",
              explanation:
                "That's the LAST question, and only if you've ruled out server cache, URL state, and local/lifted state first. Starting here is how apps end up with bloated stores full of things that were never global.",
            },
            {
              label: "\"How many components will read this value?\"",
              explanation:
                "Component count matters for the local-vs-lifted-vs-global branch, but it comes after you've ruled out server cache and URL state. A value read by many components might still be server cache or URL state.",
            },
            {
              label: "\"Will this value change often?\"",
              explanation:
                "Update frequency informs which store to pick later, but it's not the entry point. Server cache is the first filter because mistaking it for state is the costliest and most common error.",
            },
          ]}
        />
      </Checkpoint>

      {/* ────────── CHECKPOINT 2 ────────── */}
      <Checkpoint id="cp-url-state" moduleSlug={MODULE_SLUG} title="The URL is state">
        <Quiz
          kind="Quick check"
          question="Which of these is the strongest reason to store a value in the URL rather than a global store?"
          options={[
            {
              label: "A user would plausibly want to share, bookmark, or get back to this exact view, and it should survive a refresh and work with the back button.",
              correct: true,
              explanation:
                "That's the litmus test. Shareable/bookmarkable/refresh-proof/back-button-friendly is precisely the bundle of benefits the URL gives you for free, and a store can't match without reimplementing the browser.",
            },
            {
              label: "The value is read by a lot of components, so a central location is convenient.",
              explanation:
                "Being read widely is an argument for lifting or going global, not specifically for the URL. The URL's distinguishing benefit is shareability/bookmarkability, not central access.",
            },
            {
              label: "The value is a large, deeply nested object with functions on it.",
              explanation:
                "That's actually a reason NOT to use the URL, it only holds serializable strings and has a length limit. Functions and big nested objects can't live in a query string.",
            },
            {
              label: "The value changes on every single keystroke and must never create history entries.",
              explanation:
                "High-frequency, non-shareable updates are a weaker case for the URL. If you did use it, you'd reach for router.replace to avoid flooding history, but ephemeral UI churn often belongs in local state instead.",
            },
          ]}
        />
        <Quiz
          kind="Tradeoff check"
          question="You move a filter UI into the URL. Which statement about the tradeoffs is accurate?"
          options={[
            {
              label: "The URL only stores serializable strings and has a practical length limit, so you encode compact values (enums, ids, small lists), not entire objects or functions.",
              correct: true,
              explanation:
                "Exactly. Serializable-strings-only and a ~2,000–8,000 char ceiling are the real constraints. You design the URL shape to be compact, and anything non-serializable or huge stays out of it.",
            },
            {
              label: "Putting state in the URL means it can no longer survive a page refresh.",
              explanation:
                "It's the opposite, surviving refresh is one of the URL's headline benefits. Reload the page and the query string is still there, so the view restores itself.",
            },
            {
              label: "URL state requires Redux to read and write the query string.",
              explanation:
                "No, reading/writing searchParams is built into the framework (e.g. useSearchParams + the router in Next.js). The whole point is that you DON'T need a store.",
            },
            {
              label: "Once state is in the URL the back button stops working.",
              explanation:
                "Reversed, pushing URL changes is what makes the back button step through filter states. (You'd only avoid history with router.replace for noisy updates.)",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. The global-store ladder ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The global-store ladder (when you DO need one)</h2>
        <p className="mb-4">
          Suppose you&apos;ve run the tree honestly and landed on the bottom branch: theme, auth,
          locale, something genuinely global. Now, and only now, you pick a tool. There&apos;s a
          ladder, and you climb only as high as the problem demands.
        </p>

        <h3 className="mb-2 text-xl font-semibold">Rung 1, Context (built-in)</h3>
        <p className="mb-4">
          React&apos;s own <code>Context</code> is perfect for small, low-frequency global values:
          theme, current user, locale. No dependency, no boilerplate. The catch you learned in the
          useContext module: <strong>every consumer re-renders whenever the context value
          changes</strong>, and there&apos;s no built-in selector to subscribe to just a slice. For
          a theme that flips twice a session, who cares. For a value that updates many times a
          second, that re-render storm is a real problem.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`const ThemeContext = createContext<"light" | "dark">("light");
// Fine: theme changes rarely, so the "everyone re-renders" cost
// is paid almost never. Context is the right tool here.`}</code></pre>

        <h3 className="mb-2 text-xl font-semibold">Rung 2, Zustand (tiny, hook-based)</h3>
        <p className="mb-4">
          When you have genuinely global state that&apos;s read in many places and updates often
          enough that Context&apos;s blunt re-rendering hurts, reach for{" "}
          <strong>Zustand</strong>. It&apos;s a tiny library (a few KB) built around a hook. Its
          superpower is <strong>selector subscriptions</strong>: a component subscribes only to the
          slice it reads, so changing one field re-renders only the components that use that field,
          sidestepping the context re-render storm entirely.
        </p>
        <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100"><code>{`import { create } from "zustand";

// A minimal store: state + the actions that change it, together.
type UiStore = {
  commandPaletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
};

const useUiStore = create<UiStore>((set) => ({
  commandPaletteOpen: false,
  openPalette: () => set({ commandPaletteOpen: true }),
  closePalette: () => set({ commandPaletteOpen: false }),
}));

// In a component, subscribe to JUST the slice you read.
// This component re-renders only when 'commandPaletteOpen' changes,
// not when any other field in the store changes.
function PaletteToggle() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const openPalette = useUiStore((s) => s.openPalette);
  return <button onClick={openPalette}>{open ? "Open" : "Closed"}</button>;
}`}</code></pre>

        <h3 className="mb-2 text-xl font-semibold">Rung 3, Redux Toolkit (heavier, structured)</h3>
        <p className="mb-4">
          <strong>Redux Toolkit</strong> sits at the top of the ladder. It&apos;s heavier, more
          concepts (actions, reducers, slices), more setup, but it buys you serious infrastructure:
          first-class <strong>devtools</strong> with time-travel debugging, a structured{" "}
          <strong>middleware</strong> pipeline, and strong conventions that keep a large team&apos;s
          shared state legible. It earns its weight in <em>big</em> apps with{" "}
          <strong>complex, interdependent global state</strong> changed by many features, where the
          discipline and tooling pay off. In a small or medium app, it&apos;s usually overkill.
        </p>

        <Callout variant="warn" title="When each rung is overkill">
          <p>
            <strong>Context is overkill</strong> when the value isn&apos;t actually global, if a
            common parent exists, just lift and prop-pass. <strong>Zustand is overkill</strong> when
            the value updates rarely (Context is simpler and dependency-free) or when it&apos;s
            really URL/server state in disguise. <strong>Redux is overkill</strong> for most apps
            full stop, its ceremony only pays off with large, complex, cross-feature shared state
            and a team that benefits from the conventions and devtools. Climbing a rung you
            don&apos;t need is just cost with no benefit.
          </p>
        </Callout>
        <p className="mb-4">
          The honest default for new apps in {new Date().getFullYear()}: a data-fetching library for
          server cache, the URL for view state, local <code>useState</code> for the rest, and a thin
          Context <em>or</em> a small Zustand store for the handful of truly-global values. Most apps
          never need Redux, and that&apos;s a feature, not a gap.
        </p>
      </section>

      {/* ───────────────────────── 7. 60-second answer ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;where should this state live?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Reach for the smallest scope that works; most global state is really server
              cache or URL state.</strong>
            </li>
            <li>Server data → it&apos;s <strong>server cache</strong>, owned by your data layer (React Query / SWR / RSC), not your state.</li>
            <li>Shareable / bookmarkable / back-button-able → the <strong>URL</strong> (searchParams): filters, sort, pagination, selected tab, open id.</li>
            <li>One component (+ descendants) needs it → <strong>local</strong> <code>useState</code>; lift to the <strong>lowest common ancestor</strong> only when siblings must share.</li>
            <li>Genuinely distant, unrelated parts need it → <strong>global</strong>: Context for small/rare values, Zustand when selectors matter, Redux only for big complex apps.</li>
            <li>What&apos;s truly global is a short list: theme, auth/user, locale, feature flags. Almost everything else is one of the impostors.</li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 8. The project ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project: filters into the URL, one store for the rest</h2>
        <p className="mb-4">
          Take a list view with a filter/sort/pagination UI (a product grid, a tickets table,
          anything). You&apos;ll move all of its view state into the URL, then add a small Zustand
          store for the <em>one</em> bit that&apos;s genuinely global, and you&apos;ll write down
          why the split lands where it does.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Inventory the state and run the tree.</strong> List every piece of state in the
            view (filters, sort key, page number, the result list, maybe a theme toggle in the
            header). For each, write which branch of the decision tree it lands on. You should find
            the result list is <em>server cache</em>, the filter/sort/page values are <em>URL
            state</em>, and at most one or two things are truly global.
          </li>
          <li>
            <strong>Move filters into <code>searchParams</code>.</strong> Replace the{" "}
            <code>useState</code> for the active filter, sort key, and page number with reads from{" "}
            <code>useSearchParams</code>. Render directly from the URL values, with sensible
            defaults when a param is absent.
          </li>
          <li>
            <strong>Wire up writes.</strong> On filter/sort change, build a new{" "}
            <code>URLSearchParams</code> from the current ones, set the changed key, and{" "}
            <code>router.push</code> the new URL. Reset <code>page</code> to 1 when a filter changes.
            Decide push vs replace per control (push for filters/sort; consider replace for a noisy
            search box).
          </li>
          <li>
            <strong>Prove the payoff.</strong> Apply some filters, copy the URL, open it in a new
            tab, same view. Refresh, state survives. Click back, you step through your filter
            changes. Confirm there is now <em>zero</em> <code>useState</code> for any of these
            values.
          </li>
          <li>
            <strong>Add a small Zustand store for the genuinely-global bit.</strong> Pick the one
            value that&apos;s truly cross-cutting and not shareable, e.g. the theme, a sidebar
            collapsed flag, or a command-palette open state, and put it in a minimal Zustand store.
            Subscribe to it with a selector so only the components that read it re-render.
          </li>
          <li>
            <strong>Justify the split in writing.</strong> In a short README or comment, explain for
            each category why it lives where it does: results in the data layer (server cache),
            filters in the URL (shareable view state), theme in Zustand (global, not shareable, read
            widely). The justification is the deliverable, it proves you ran the tree, not just
            moved code around.
          </li>
        </ol>
        <Callout variant="info" title="What &quot;done&quot; looks like">
          <p>
            A reviewer can open your URL and see your exact filtered view. There&apos;s no store
            holding filter/sort/page state, and no <code>useState</code> mirroring server data. The
            single Zustand store holds only a truly-global value and is read via a selector. And your
            write-up names the right home for each piece of state and says why. That&apos;s the whole
            skill: not the wiring, but the <em>placement</em>.
          </p>
        </Callout>
      </section>

      {/* ────────── CHECKPOINT 3 ────────── */}
      <Checkpoint id="cp-global-ladder" moduleSlug={MODULE_SLUG} title="The global-store ladder">
        <Quiz
          kind="Tooling check"
          question="You have a single, genuinely global theme value (light/dark) read in dozens of components but changed maybe twice per session. What's the most appropriate tool, and why?"
          options={[
            {
              label: "React Context, it's built-in and dependency-free, and the 'all consumers re-render' cost is irrelevant because the value almost never changes.",
              correct: true,
              explanation:
                "Context's only real downside is the re-render storm on every change. For a value that flips twice a session, that cost is essentially never paid, so the simplest, zero-dependency tool is exactly right.",
            },
            {
              label: "Redux Toolkit, global state deserves the most robust, structured solution available.",
              explanation:
                "Redux's ceremony and tooling pay off for large, complex, cross-feature state. A single rarely-changing boolean doesn't justify any of that overhead, it's overkill.",
            },
            {
              label: "Zustand, you should always prefer selector subscriptions for global state.",
              explanation:
                "Zustand's selector subscriptions shine when a value changes often enough that Context's blunt re-rendering hurts. For a theme that changes twice a session, Context is simpler and the selector benefit is moot. Climbing this rung adds a dependency for no gain.",
            },
            {
              label: "The URL, make the theme a query param so it's shareable.",
              explanation:
                "Theme is a personal, cross-app preference, not a shareable view of specific content. Nobody bookmarks 'this page in dark mode.' It fails the share/bookmark test, so it's genuinely global, not URL state.",
            },
          ]}
        />
        <Quiz
          kind="Selector check"
          question="The pitch for Zustand over Context for a frequently-updated global value is mainly about what?"
          options={[
            {
              label: "Selector subscriptions: a component subscribes to just the slice it reads, so changing one field re-renders only the components that use that field, avoiding Context's 'every consumer re-renders' storm.",
              correct: true,
              explanation:
                "That's the core advantage. Context has no built-in way to subscribe to a slice, so any change re-renders all consumers. Zustand's selectors scope re-renders to exactly the components that read the changed slice.",
            },
            {
              label: "Zustand stores data on the server, so it stays in sync automatically.",
              explanation:
                "Zustand is purely client-side state; it has nothing to do with server sync. Server data belongs in a data-fetching layer, not a store. This confuses the two impostors with a real store.",
            },
            {
              label: "Zustand makes state shareable via the URL out of the box.",
              explanation:
                "It doesn't, shareable state is the URL's job, not Zustand's. If you need shareability, you'd use searchParams, not a store.",
            },
            {
              label: "Zustand provides time-travel debugging and middleware that Context lacks.",
              explanation:
                "Time-travel devtools and a structured middleware pipeline are Redux Toolkit's selling points, not the headline reason to pick Zustand over Context. Zustand's edge here is selector-scoped re-renders.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
