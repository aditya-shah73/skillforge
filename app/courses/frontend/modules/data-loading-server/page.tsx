import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "data-loading-server";

const CHECKPOINTS = [
  { id: "cp-async-server", title: "Async Server Components & the extended fetch" },
  { id: "cp-memo-cache-revalidate", title: "Memoization, the Data Cache & revalidation" },
  { id: "cp-parallel-streaming", title: "Parallel fetches, no race, and streaming" },
];

export default function DataLoadingServerModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 7 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Data loading on the server — fetching, caching, and revalidation
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          In Phase 5 you fought the <code>useEffect</code> race condition with cleanup flags and{" "}
          <code>AbortController</code>. The App Router has a quieter answer: don&apos;t fetch on the client at all.
          Make the component <code>async</code>, <code>await</code> the data on the server, and the entire class of
          stale-response bugs simply never happens.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The kitchen that plates the dish before it leaves</h2>
        <p className="mb-4">
          Think about two ways a restaurant can serve you. In the first, the waiter brings you an empty plate, a recipe
          card, and a bag of raw ingredients — then you cook at the table while everyone watches you fumble. That&apos;s
          client-side fetching: the browser receives an empty shell and the JavaScript scrambles to assemble the meal
          <em> after</em> it arrives, in front of the user, juggling loading spinners the whole time.
        </p>
        <p className="mb-4">
          In the second, the kitchen cooks the dish, plates it, and the waiter sets a finished meal in front of you.
          That&apos;s a <strong>Server Component</strong>: the data is fetched and the HTML is assembled on the server, and
          what lands in the browser is already done. No raw ingredients, no cooking at the table, no spinner while the
          user waits for the JavaScript to figure out what to fetch.
        </p>
        <p className="mb-4">
          Here&apos;s the part that matters for everything that follows. Back in the table-cooking model, if you asked for
          dish A, changed your mind to dish B, and the ingredients for A happened to arrive last, you might end up
          eating A while your menu says B — that&apos;s the <em>race condition</em> from Phase 5. In the
          kitchen-plates-it model, <strong>there is only one order, cooked once, in order, before anything is served.</strong>
          The race can&apos;t happen because the asynchronous juggling never reaches the table.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            The mechanics of fetching on the server are almost boring: you write <code>await fetch(...)</code> at the top
            of an <code>async</code> component. The interesting part is what that <em>buys</em> you — request memoization,
            a persistent Data Cache, time-based and on-demand revalidation, easy parallelism, and the disappearance of the
            client race condition. Everything below follows from moving the <code>await</code> to the server.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. ASYNC SERVER COMPONENTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The component <em>is</em> the data loader</h2>
        <p className="mb-4">
          In the App Router, every component is a Server Component by default (no <code>&quot;use client&quot;</code> at the
          top). And a Server Component is allowed to be an <code>async</code> function — so you can <code>await</code>{" "}
          your data <em>inline</em>, right where you render it. No <code>useState</code>, no <code>useEffect</code>, no
          loading flag, no cleanup. Compare the two worlds:
        </p>
        <pre><code>{`// PHASE 5 — client-side: state machine + effect + cleanup
"use client";
function Profile({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then((data) => { if (!ignore) setUser(data); });
    return () => { ignore = true; };  // race-condition guard
  }, [userId]);
  if (!user) return <Spinner />;
  return <h1>{user.name}</h1>;
}

// APP ROUTER — server-side: just await it
async function Profile({ userId }) {
  const res = await fetch(\`https://api.example.com/users/\${userId}\`);
  const user = await res.json();
  return <h1>{user.name}</h1>;
}`}</code></pre>
        <p className="mb-4">
          Read the second version again and notice everything that&apos;s <em>gone</em>: the state variable, the effect,
          the dependency array, the <code>ignore</code> flag. The function runs on the server, top to bottom, exactly
          once for the request. The <code>await</code> pauses rendering until the data is in hand, and then it renders
          finished HTML. The browser never sees the <code>fetch</code> — it only sees the result.
        </p>
        <p className="mb-4">
          This works because Server Components run in a Node-like environment with secrets and direct backend access. You
          can call your database, read a private API key, or hit an internal service — none of which is safe to do in code
          that ships to the browser. The data-loading code <em>stays on the server</em> and only the rendered output
          crosses the wire.
        </p>
        <Callout variant="warn" title="async components are a server-only trick">
          <p>
            Only Server Components can be <code>async</code>. A Client Component (one marked <code>&quot;use client&quot;</code>)
            <strong> cannot</strong> be an async function — it runs in the browser, where the React hooks model
            (<code>useState</code>, Suspense, the Phase 5 patterns) is still how you load data. The whole point of this
            module is keeping the <code>await</code> on the <em>server</em> side of that boundary.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. THE EXTENDED FETCH ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Next&apos;s extended <code>fetch</code> — caching baked into the call</h2>
        <p className="mb-4">
          Next.js replaces the global <code>fetch</code> with an extended version that takes extra options controlling{" "}
          <strong>how the result is cached</strong>. You don&apos;t configure a separate cache — you annotate the fetch
          itself. The two knobs you&apos;ll use constantly:
        </p>
        <pre><code>{`// 1. Cache forever until you say otherwise (static — the data is reused across requests)
const res = await fetch("https://api.example.com/config", {
  cache: "force-cache",   // store the result in the Data Cache
});

// 2. Never cache — fetch fresh on every request (dynamic)
const res = await fetch("https://api.example.com/cart", {
  cache: "no-store",      // opt out of the Data Cache entirely
});

// 3. Cache, but treat the copy as stale after N seconds (time-based revalidation)
const res = await fetch("https://api.example.com/products", {
  next: { revalidate: 60 },   // serve cached for 60s, then refresh in the background
});`}</code></pre>
        <p className="mb-4">
          Three behaviours, one API. <code>cache: &quot;force-cache&quot;</code> stores the response and reuses it.{" "}
          <code>cache: &quot;no-store&quot;</code> opts out — every request goes to the origin, which also marks the route as{" "}
          <em>dynamic</em>. And <code>next: &#123; revalidate: 60 &#125;</code> is the middle ground: serve the cached copy
          for up to 60 seconds, then quietly refresh it. If that <code>revalidate</code> idea sounds familiar, it&apos;s
          the server-side cousin of React Query&apos;s <code>staleTime</code> from the previous module — a freshness
          window, just enforced on the server instead of in a client cache.
        </p>
        <Callout variant="insight" title="The mental model: fetch is a cache directive">
          <p>
            In the App Router, a <code>fetch</code> call is not just &quot;go get bytes&quot; — it&apos;s &quot;go get bytes
            <em> and here&apos;s how long they stay good.</em>&quot; The caching policy lives on the call site, so two fetches
            in the same component can have completely different freshness rules. That co-location is the whole ergonomic
            win: you reason about staleness right where you fetch.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-async-server" moduleSlug={MODULE_SLUG} title="Async Server Components & the extended fetch">
        <Quiz
          kind="Server Components"
          question="Why can a Server Component just write `const data = await fetch(...)` at the top and skip useState/useEffect entirely?"
          options={[
            {
              label: "It runs on the server and is allowed to be an async function, so it awaits data inline and renders finished HTML — there's no client lifecycle to manage",
              correct: true,
              explanation:
                "Right. The component function is async, runs once per request on the server, and pauses on await until the data is in hand. No state machine, no effect, no cleanup — the browser only ever receives the rendered result.",
            },
            {
              label: "Next.js secretly wraps the component in a useEffect for you",
              explanation:
                "No — there's no effect involved at all. The component genuinely runs as an async function on the server; useEffect is a client-only hook and never enters the picture.",
            },
            {
              label: "Because fetch is synchronous inside Server Components",
              explanation:
                "fetch is still asynchronous; that's why you await it. The difference is the component itself can be async on the server, so awaiting is natural — no hook needed.",
            },
          ]}
        />
        <Quiz
          kind="Cache options"
          question="You want a fetch in a Server Component to serve a cached copy for up to 60 seconds and then refresh. Which option does that?"
          options={[
            {
              label: "fetch(url, { next: { revalidate: 60 } })",
              correct: true,
              explanation:
                "Correct. This is time-based revalidation: the result is cached and served as fresh for 60s, after which the next request triggers a background refresh. It's the server-side analogue of React Query's staleTime.",
            },
            {
              label: "fetch(url, { cache: \"no-store\" })",
              explanation:
                "no-store does the opposite — it opts out of the cache entirely and fetches fresh on every request, also forcing the route to be dynamic. There's no 60-second freshness window.",
            },
            {
              label: "fetch(url, { cache: \"force-cache\" })",
              explanation:
                "force-cache stores the result and reuses it indefinitely (until you revalidate it some other way). On its own it has no time window — you'd add next.revalidate for that.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. MEMOIZATION VS DATA CACHE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Two different caches — request memoization vs the Data Cache</h2>
        <p className="mb-4">
          People conflate these constantly, and the interview loves the distinction. There are <em>two</em> separate
          caching layers, and they answer two different questions:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Request memoization</strong> — answers &quot;within <em>this one render pass</em>, did I already make
            this exact request?&quot; If a layout and a page and three nested components all{" "}
            <code>fetch(&quot;/api/user&quot;)</code> with identical arguments while rendering a single request, Next fires{" "}
            <strong>one</strong> network call and hands the same result to all of them. It&apos;s automatic, in-memory,
            and it lasts only for the duration of that render. Then it&apos;s thrown away.
          </li>
          <li>
            <strong>The Data Cache</strong> — answers &quot;across <em>different requests, over time</em>, can I reuse a
            previously fetched result?&quot; This is the persistent cache that <code>force-cache</code> writes to and{" "}
            <code>revalidate</code> ages out. It survives between requests, between users, even between deployments
            (depending on config). It&apos;s what makes a page <em>static</em>.
          </li>
        </ul>
        <pre><code>{`// REQUEST MEMOIZATION — dedupe within a single render pass.
// Both of these run during one request; only ONE network call happens.
async function Header() {
  const user = await fetch("https://api.example.com/me").then((r) => r.json());
  return <span>{user.name}</span>;
}
async function Sidebar() {
  const user = await fetch("https://api.example.com/me").then((r) => r.json());
  return <Avatar src={user.avatar} />;
}
// Same URL + options during the same render => deduped automatically.
// You do NOT need to lift the fetch up or pass props just to avoid a double call.`}</code></pre>
        <p className="mb-4">
          The practical upshot: you can call <code>fetch</code> for the same resource in as many components as you like
          during one render, and Next collapses them into a single request for free. This is what lets you fetch
          data <em>where it&apos;s used</em> instead of fetching once at the top and prop-drilling it everywhere —
          memoization removes the duplicate-network penalty that pattern would otherwise cost.
        </p>
        <Callout variant="warn" title="Memoization is per-render; the Data Cache is persistent">
          <p>
            Request memoization vanishes the instant the render finishes — it never spans two requests. The Data Cache is
            the one that persists across requests and users. Mixing these up (&quot;I memoized it, so the next visitor gets
            the cached copy&quot;) is a classic error: <em>memoization dedupes within a render; the Data Cache reuses
            across renders.</em>
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. REVALIDATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Revalidation — time-based vs on-demand</h2>
        <p className="mb-4">
          A cached copy is fast but goes stale. <strong>Revalidation</strong> is how the Data Cache gets refreshed.
          There are two flavours, and you pick based on <em>what you know about when the data changes.</em>
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Time-based</strong> — &quot;refresh at most every N seconds.&quot; You set{" "}
            <code>next: &#123; revalidate: N &#125;</code> on the fetch (or export <code>revalidate</code> from the
            route). Next serves the cached copy until it&apos;s older than N seconds, then refreshes in the background on
            the next request. Use it when the data changes on an unpredictable schedule but slight staleness is fine — a
            product catalog, a blog index, a leaderboard.
          </li>
          <li>
            <strong>On-demand</strong> — &quot;refresh exactly when <em>I</em> say it changed.&quot; You call{" "}
            <code>revalidatePath(&quot;/products&quot;)</code> or <code>revalidateTag(&quot;products&quot;)</code> from a
            Server Action or route handler at the moment the data actually changes (someone edited a product). No clock,
            no staleness window — the cache is precise because you tell it the truth.
          </li>
        </ul>
        <pre><code>{`// TIME-BASED: refresh at most once a minute.
async function ProductList() {
  const products = await fetch("https://api.example.com/products", {
    next: { revalidate: 60 },
  }).then((r) => r.json());
  return <Grid items={products} />;
}

// ON-DEMAND: tag the fetch, then invalidate that tag when the data changes.
async function ProductList() {
  const products = await fetch("https://api.example.com/products", {
    next: { tags: ["products"] },
  }).then((r) => r.json());
  return <Grid items={products} />;
}

// ...later, in a Server Action after an edit:
import { revalidateTag } from "next/cache";
async function updateProduct(/* ... */) {
  // write to the DB...
  revalidateTag("products"); // every fetch tagged "products" is now stale
}`}</code></pre>
        <Callout variant="insight" title="Time-based is a guess; on-demand is the truth">
          <p>
            Time-based revalidation is an <em>estimate</em> of how often the data changes — you accept up to N seconds of
            staleness in exchange for not having to know exactly when it changed. On-demand revalidation is <em>exact</em>:
            it refreshes precisely when the change happens, because the code that made the change tells the cache. Many
            apps use both — a short <code>revalidate</code> as a safety net plus <code>revalidateTag</code> for the
            changes you control.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-memo-cache-revalidate" moduleSlug={MODULE_SLUG} title="Memoization, the Data Cache & revalidation">
        <Quiz
          kind="Two caches"
          question="A layout and three nested components all call fetch('https://api/me') with identical options while rendering ONE request. How many network calls fire, and why?"
          options={[
            {
              label: "One — request memoization dedupes identical fetches within a single render pass",
              correct: true,
              explanation:
                "Right. Memoization collapses identical fetches (same URL + options) during one render into a single network call and shares the result. It's automatic and lasts only for that render — which is what lets you fetch where you use the data instead of prop-drilling.",
            },
            {
              label: "Four — each component makes its own independent request",
              explanation:
                "No. Within a single render pass, Next memoizes identical fetches and fires only one. Four calls is exactly what memoization prevents.",
            },
            {
              label: "One, because the Data Cache stored it on a previous request",
              explanation:
                "Close on the count but wrong on the mechanism. Deduping within the same render is request memoization, not the Data Cache. The Data Cache is the persistent layer that reuses results across different requests over time.",
            },
          ]}
        />
        <Quiz
          kind="Revalidation"
          question="An editor updates a product and you want the catalog page to reflect it immediately and precisely — not 'within 60 seconds'. Which approach fits?"
          options={[
            {
              label: "On-demand revalidation: tag the fetch and call revalidateTag('products') in the action that performs the edit",
              correct: true,
              explanation:
                "Correct. On-demand revalidation refreshes exactly when the change happens because the code that made the change tells the cache. No staleness window — the cache reflects the truth at the moment of the write.",
            },
            {
              label: "Time-based revalidation with next: { revalidate: 60 }",
              explanation:
                "Time-based accepts up to 60 seconds of staleness — it's a guess about how often data changes, not a precise 'refresh now'. For an immediate, exact refresh tied to a known edit, you want on-demand revalidation.",
            },
            {
              label: "Set cache: 'no-store' so the page never caches",
              explanation:
                "That makes the route fully dynamic and refetches on every request, throwing away caching entirely. On-demand revalidation keeps the cache fast and refreshes it precisely when the edit occurs.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. PARALLEL VS SEQUENTIAL ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Parallel vs sequential — server-side waterfalls are still waterfalls</h2>
        <p className="mb-4">
          Moving fetches to the server does <em>not</em> automatically make them fast. The waterfall trap from Phase 5
          follows you here: if you <code>await</code> independent fetches one after another, each one waits for the
          previous to finish even though none needed the other&apos;s result.
        </p>
        <pre><code>{`// WATERFALL on the server — three round-trips end to end (slow)
async function Dashboard({ userId }) {
  const user = await fetchUser(userId);        // wait...
  const posts = await fetchPosts(userId);      // ...then wait...
  const friends = await fetchFriends(userId);  // ...then wait
  return <Layout user={user} posts={posts} friends={friends} />;
}

// PARALLEL — kick them all off, then await once (fast)
async function Dashboard({ userId }) {
  const [user, posts, friends] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
    fetchFriends(userId),
  ]);
  return <Layout user={user} posts={posts} friends={friends} />;
}`}</code></pre>
        <p className="mb-4">
          The fix is identical to the client one: independent data goes in <code>Promise.all</code> so the requests run
          concurrently and you wait roughly one round-trip instead of three. Reserve sequential <code>await</code>s for a
          genuine dependency — when you need the user&apos;s <code>teamId</code> before you can fetch the team. (If one
          failure shouldn&apos;t doom the rest, <code>Promise.allSettled</code> lets each resolve or reject on its own.)
        </p>
        <Callout variant="warn" title="Component-tree waterfalls hide on the server too">
          <p>
            A parent Server Component awaits, renders a child Server Component, the child awaits — that&apos;s a waterfall
            spread across the tree, harder to spot than three <code>await</code>s in a row. Start independent fetches as
            high as you can (or hand them down as un-awaited promises) so they run together. The server is faster at this
            than the client, but the <em>shape</em> of the waterfall mistake is exactly the same.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. NO RACE CONDITION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why the race condition simply can&apos;t happen here</h2>
        <p className="mb-4">
          This is the payoff, and it&apos;s worth stating precisely because it&apos;s a great interview line. The Phase 5
          race condition needed three ingredients: (1) requests fired from a component that re-renders, (2) responses
          arriving in an unpredictable order, and (3) a <code>setState</code> that acts on whichever response lands last.
          Server-side fetching removes all three.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>No re-rendering-while-in-flight.</strong> The Server Component runs once, top to bottom, for a single
            request. There&apos;s no &quot;the user typed again and the effect re-fired&quot; — the function isn&apos;t
            sitting in a browser reacting to keystrokes.
          </li>
          <li>
            <strong>No setState racing a response.</strong> The data is <code>await</code>ed into a plain local variable
            <em> before</em> the JSX renders. There is no second, later response that can overwrite a first — the render
            doesn&apos;t proceed until the <code>await</code> resolves.
          </li>
          <li>
            <strong>No stale-response interleaving reaches the user.</strong> The browser receives finished HTML. It never
            holds two competing in-flight responses for the same view, so there&apos;s nothing to interleave.
          </li>
        </ul>
        <Callout variant="insight" title="Say this in the interview, verbatim">
          <p>
            &quot;The client race condition comes from a component re-rendering and firing new requests while old ones are
            still in flight, then committing whichever response resolves last. A Server Component <code>await</code>s its
            data into a local variable and renders once per request — there&apos;s no re-render, no competing setState, and
            no out-of-order response that reaches the UI. The whole class of bug is structurally impossible, so you don&apos;t
            need an <code>ignore</code> flag or an <code>AbortController</code> for it.&quot;
          </p>
        </Callout>
        <p className="mb-4">
          The honest caveat: this covers the <em>initial server read</em>. The moment you add client-side interactivity —
          a search box that refetches as the user types — you&apos;re back in the browser and the Phase 5 rules apply
          again (which is exactly where React Query and <code>AbortController</code> earn their keep). Server fetching
          eliminates the race for the data you load <em>on the server</em>; it doesn&apos;t abolish client fetching where
          you still need it.
        </p>
      </section>

      {/* ───────────────────────── 8. LOADING.TSX STREAMING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>loading.tsx</code> — streaming without a single state variable</h2>
        <p className="mb-4">
          &quot;If the component <code>await</code>s before rendering, doesn&apos;t the user stare at a blank screen until
          the data arrives?&quot; That&apos;s where <strong>streaming</strong> comes in. Drop a <code>loading.tsx</code>{" "}
          file next to your <code>page.tsx</code>, and Next automatically wraps the page in a Suspense boundary: the
          loading UI streams to the browser <em>instantly</em>, and the real content swaps in as soon as the server
          finishes awaiting.
        </p>
        <pre><code>{`// app/dashboard/loading.tsx — shown instantly while page.tsx awaits its data
export default function Loading() {
  return <DashboardSkeleton />;
}

// app/dashboard/page.tsx — awaits data; the user already sees the skeleton
export default async function DashboardPage() {
  const data = await fetch("https://api.example.com/dashboard", {
    next: { revalidate: 30 },
  }).then((r) => r.json());
  return <Dashboard data={data} />;
}`}</code></pre>
        <p className="mb-4">
          Notice what you <em>didn&apos;t</em> write: no <code>const [loading, setLoading] = useState(true)</code>, no
          conditional <code>if (loading) return &lt;Spinner /&gt;</code> inside the component. The loading state is a{" "}
          <em>file</em>, declared once, and the framework wires up the Suspense boundary for you. You can also place your
          own <code>&lt;Suspense&gt;</code> boundaries around individual slow sections so the fast parts of the page
          render immediately and the slow part streams in behind its own fallback.
        </p>
        <Callout variant="info" title="Streaming is the server's answer to the loading state">
          <p>
            In Phase 5, &quot;loading&quot; was one of four states you tracked by hand. On the server it becomes
            infrastructure: <code>loading.tsx</code> is the route-level fallback, and <code>&lt;Suspense&gt;</code> lets
            you stream slow sections independently. You declare the fallback; the framework owns the timing. Same user
            experience, none of the client-side state machine.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. CONTRAST WITH PHASE 5 ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Three approaches, one decision</h2>
        <p className="mb-4">
          You now have three ways to get server data into a UI. They&apos;re not rivals so much as the right tool for
          different jobs:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>useEffect + fetch (Phase 5).</strong> Client-side, hand-rolled. Fine for a one-off in a Client
            Component, but you own the race condition, the four states, and the lack of caching. The wrong{" "}
            <em>default</em>.
          </li>
          <li>
            <strong>React Query / server-cache tools (last module).</strong> Client-side, but the cache, dedupe, retries,
            staleness, and background refetch are handled for you. The right answer for <em>interactive</em> client data
            — search-as-you-type, optimistic mutations, data that refreshes while the user looks at it.
          </li>
          <li>
            <strong>Server Components (this module).</strong> The fetch happens on the server before the HTML is sent.
            Best for the <em>initial read</em>: it sidesteps the race condition entirely, keeps secrets server-side,
            ships less JavaScript, and caches at the framework level. Reach for it first; drop to a client tool only where
            you need live interactivity.
          </li>
        </ul>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, this should feel like coming home. A Server Component awaiting a fetch is just a
            request handler that assembles a response — the same shape as any backend endpoint that queries a DB and
            renders a template. Request memoization is per-request deduplication; the Data Cache is your read-through cache
            with a TTL (<code>revalidate</code>) and explicit invalidation (<code>revalidateTag</code>). The novelty isn&apos;t
            the concepts — it&apos;s that React now lets you write them <em>as components</em>.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 10. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how does data loading work in the App Router?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Await on the server.</strong> Server Components can be <code>async</code>, so you{" "}
              <code>await fetch(...)</code> inline and render finished HTML — no <code>useState</code>,{" "}
              <code>useEffect</code>, or cleanup.
            </li>
            <li>
              <strong>fetch carries its own cache policy.</strong> <code>cache: &quot;force-cache&quot;</code> (static),{" "}
              <code>cache: &quot;no-store&quot;</code> (dynamic), or <code>next: &#123; revalidate: N &#125;</code> (cached
              with an N-second freshness window — the server-side <code>staleTime</code>).
            </li>
            <li>
              <strong>Two caches.</strong> Request <em>memoization</em> dedupes identical fetches <em>within one render</em>;
              the <em>Data Cache</em> persists results <em>across requests</em>.
            </li>
            <li>
              <strong>Revalidation.</strong> Time-based (<code>revalidate: N</code>) is a guess; on-demand
              (<code>revalidateTag</code>/<code>revalidatePath</code>) is exact — fire it when the data actually changes.
            </li>
            <li>
              <strong>Parallelize.</strong> Independent server fetches go in <code>Promise.all</code>; sequential{" "}
              <code>await</code>s on independent data are a server-side waterfall.
            </li>
            <li>
              <strong>No race condition.</strong> One render, data awaited into a local variable, finished HTML — there&apos;s
              no re-render or out-of-order <code>setState</code> to race. <code>loading.tsx</code> streams a fallback so
              the wait isn&apos;t a blank screen.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 11. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — convert a client page to the server, then compare</h2>
        <p className="mb-4">
          You&apos;ll take a page that fetches with <code>useEffect</code> on the client and rebuild it as a Server
          Component that <code>await</code>s directly — then add caching, parallelism, and streaming, and put the two
          versions side by side so the difference is visible, not theoretical.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Start from a client page.</strong> Take (or write) a <code>&quot;use client&quot;</code> page that loads
            data in <code>useEffect</code> with the full Phase 5 ceremony — <code>useState</code>, a loading flag, an{" "}
            <code>ignore</code> cleanup. Note everything it has to hand-manage.
          </li>
          <li>
            <strong>Convert it to a Server Component.</strong> Delete <code>&quot;use client&quot;</code>, make the page an{" "}
            <code>async function</code>, and replace the whole effect/state machine with a single{" "}
            <code>const data = await fetch(...)</code>. Watch the state, the effect, and the cleanup all disappear, and
            confirm in the browser&apos;s Network tab that the fetch no longer happens client-side.
          </li>
          <li>
            <strong>Set a per-fetch <code>revalidate</code>.</strong> Add <code>next: &#123; revalidate: 30 &#125;</code> to
            the fetch. Reload within 30s and confirm it serves the cached copy; wait past 30s and confirm the next request
            refreshes it in the background.
          </li>
          <li>
            <strong>Parallelize two independent loads.</strong> Add a second, independent fetch. First write them as two
            sequential <code>await</code>s and note the combined time, then switch to <code>Promise.all</code> and confirm
            the page now waits roughly one round-trip instead of two.
          </li>
          <li>
            <strong>Add <code>loading.tsx</code> streaming.</strong> Drop a <code>loading.tsx</code> beside the page with a
            skeleton. Throttle the network and confirm the skeleton streams in instantly while the server finishes
            awaiting — no <code>useState</code> loading flag anywhere.
          </li>
          <li>
            <strong>Compare against the old client version.</strong> Put the two side by side. Articulate, out loud, why
            the server version can&apos;t exhibit the Phase 5 race condition, how much less JavaScript it ships, and the
            one case where you&apos;d still reach back for a client tool (live, interactive refetching).
          </li>
        </ol>
        <p className="mb-4">
          You should be able to explain — without notes — why an <code>async</code> Server Component sidesteps the race
          condition class entirely, the difference between request memoization and the Data Cache, when you&apos;d choose
          time-based vs on-demand revalidation, and why <code>Promise.all</code> matters just as much on the server as it
          did on the client.
        </p>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-parallel-streaming" moduleSlug={MODULE_SLUG} title="Parallel fetches, no race, and streaming">
        <Quiz
          kind="Parallelism"
          question="A Server Component needs a user, their posts, and their friends — none depends on the others. It currently awaits them one after another. What's the fix?"
          options={[
            {
              label: "Fire all three together with await Promise.all([...]) so they run concurrently and you wait one round-trip instead of three",
              correct: true,
              explanation:
                "Correct. Sequential awaits on independent data is a server-side waterfall — exactly the Phase 5 mistake, just on the server. Promise.all runs them concurrently so the total wait is roughly one round-trip.",
            },
            {
              label: "Nothing — moving the fetches to the server makes them parallel automatically",
              explanation:
                "No. Server-side fetching doesn't auto-parallelize sequential awaits. Three awaits in a row still run back-to-back; you have to Promise.all them to run concurrently.",
            },
            {
              label: "Wrap each fetch in its own try/catch so they don't block each other",
              explanation:
                "try/catch handles errors, not concurrency — sequential awaits inside try blocks still run one at a time. Use Promise.all (or Promise.allSettled if one failing shouldn't doom the rest).",
            },
          ]}
        />
        <Quiz
          kind="No race + streaming"
          question="Why does an async Server Component avoid the Phase 5 fetch race condition, and what handles the 'blank screen while awaiting' problem?"
          options={[
            {
              label: "It renders once per request with data awaited into a local variable — no re-render or out-of-order setState can race — and loading.tsx streams a fallback while it awaits",
              correct: true,
              explanation:
                "Right. The race needs a re-rendering component firing requests and a setState committing whichever lands last; a Server Component has neither. And loading.tsx wraps the page in a Suspense boundary so a skeleton streams instantly instead of a blank screen.",
            },
            {
              label: "Next.js adds an AbortController to every server fetch automatically",
              explanation:
                "No — there's no AbortController involved. The race is avoided structurally: one render, data awaited before the JSX, finished HTML. There's no competing in-flight response to abort.",
            },
            {
              label: "It avoids the race by setting cache: 'no-store', and the blank screen is solved with a useState loading flag",
              explanation:
                "Both halves are wrong. The cache mode is unrelated to the race (which is avoided by rendering once with an awaited variable), and the loading UI is loading.tsx streaming — not a client useState flag.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
