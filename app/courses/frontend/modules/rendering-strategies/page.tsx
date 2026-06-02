import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rendering-strategies";

const CHECKPOINTS = [
  { id: "cp-static-vs-dynamic", title: "Static vs dynamic & what flips a route" },
  { id: "cp-isr-streaming", title: "ISR with revalidate & streaming SSR" },
  { id: "cp-runtime-build-output", title: "Node vs Edge & reading the build output" },
];

export default function RenderingStrategiesModule() {
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
          Rendering strategies, static, dynamic, streaming, and the edge
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The same App Router page can be baked once at build time, rebuilt per request, or streamed to the browser in
          pieces. You don&apos;t pick the strategy with a config switch, you <em>reveal</em> it by what your code touches.
          Let&apos;s learn what flips each one, and how to read the build output that tells you which you got.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The bakery, the diner, and the conveyor belt</h2>
        <p className="mb-4">
          Imagine three ways a kitchen can serve food. The <strong>bakery</strong> bakes a tray of croissants overnight;
          when you walk in at 8am, they&apos;re already in the case, you grab one instantly, and everyone gets the
          <em> identical</em> croissant baked hours ago. The <strong>diner</strong> cooks your omelette only when you order
          it: slower, but it can use whatever <em>you</em> asked for and whatever&apos;s fresh in the fridge right now. The
          <strong> conveyor-belt sushi</strong> place is sneakier, the moment you sit down it sends out the simple dishes
          immediately, and the slow-to-prepare items follow on the belt as they&apos;re ready. You start eating before the
          whole meal exists.
        </p>
        <p className="mb-4">
          Those are the three rendering strategies, exactly. <strong>Static rendering</strong> is the bakery: the HTML is
          baked once at build time and served identically to everyone. <strong>Dynamic rendering</strong> is the diner: the
          HTML is cooked per request, so it can read this request&apos;s cookies, headers, and search params.
          <strong> Streaming</strong> is the conveyor belt: the shell ships immediately and slow sections arrive
          progressively, so the page becomes interactive before every byte is ready.
        </p>
        <p className="mb-4">
          The thing that trips everyone up: in the App Router you almost never <em>declare</em> &quot;this is a dynamic
          page.&quot; Instead, the framework watches what your code does. Read a cookie? You just told it &quot;cook this per
          request&quot;, the diner, not the bakery. The strategy is <strong>inferred from your data access</strong>, and the
          whole skill of this module is learning what flips that inference.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Three questions: <em>when</em> does the HTML get produced (build vs per-request), <em>what</em> in your code
            forces it to be per-request, and <em>how</em> can you serve a mostly-static page that still streams its slow
            parts. Get those, and the build output stops being a wall of symbols and starts being a report card.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. STATIC VS DYNAMIC ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Static vs dynamic, when the HTML is produced</h2>
        <p className="mb-4">
          A <strong>statically rendered</strong> route is rendered <em>once, at build time</em> (<code>next build</code>).
          The output is a plain HTML file (plus the data it needed) sitting on a CDN. Every visitor gets the same bytes,
          delivered with near-zero latency because no server has to do work, it&apos;s just a file. This is the default in
          the App Router, and it&apos;s what you want for anything that doesn&apos;t depend on <em>who</em> is asking or
          <em> when</em>.
        </p>
        <pre><code>{`// app/about/page.tsx
// No cookies, no headers, no searchParams, no no-store fetch.
// Next bakes this ONCE at build time -> a static HTML file on the CDN.
export default function About() {
  return <h1>About us</h1>;
}`}</code></pre>
        <p className="mb-4">
          A <strong>dynamically rendered</strong> route is rendered <em>per request</em>, on a server, at the moment
          someone asks for it. That&apos;s the only way it can know request-specific facts: the visitor&apos;s session cookie,
          their <code>Accept-Language</code> header, the <code>?sort=price</code> in their URL. The cost is latency and
          server work on every hit, there&apos;s no pre-baked file to hand over.
        </p>
        <pre><code>{`// app/dashboard/page.tsx
import { cookies } from "next/headers";

// Reading cookies() means "this answer depends on WHO is asking."
// Next can't bake one file for everyone -> this route renders per request.
export default async function Dashboard() {
  const session = (await cookies()).get("session");
  return <h1>Welcome back, {session?.value ?? "guest"}</h1>;
}`}</code></pre>
        <Callout variant="insight" title="The mental test">
          <p>
            Ask: <em>&quot;could I bake one HTML file at build time that&apos;s correct for every visitor at every moment?&quot;</em>
            If yes → static. If the right answer changes per request, per user, per header, per URL param, per
            you-can&apos;t-know-it-until-someone-asks, then it <strong>must</strong> be dynamic, and Next flips it for you the
            instant your code reaches for that information.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. WHAT FLIPS A ROUTE DYNAMIC ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What flips a route dynamic (the actual list)</h2>
        <p className="mb-4">
          You rarely toggle dynamic rendering on purpose. It gets flipped the moment your route (or anything it renders)
          does one of these. Memorize the list, interviewers love &quot;why did my page suddenly stop being static?&quot;:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Reading request data via Dynamic APIs.</strong> Calling <code>cookies()</code> or <code>headers()</code>
            from <code>next/headers</code>, or <code>draftMode()</code>. These literally cannot be known at build time, so
            touching them forces per-request rendering.
          </li>
          <li>
            <strong>Reading <code>searchParams</code>.</strong> The <code>searchParams</code> prop on a page (and
            <code>useSearchParams()</code> on the client) depends on the incoming URL&apos;s query string, which only exists
            per request.
          </li>
          <li>
            <strong>An uncached fetch.</strong> A <code>fetch(...)</code> with <code>{"{ cache: \"no-store\" }"}</code> (or
            in a route segment marked uncached) says &quot;always get fresh data per request,&quot; which opts the route into
            dynamic rendering. In Next 15+ <code>fetch</code> is <em>not</em> cached by default, caching is opt-in.
          </li>
          <li>
            <strong>An explicit route-segment config.</strong> Exporting <code>export const dynamic = &quot;force-dynamic&quot;</code>
            from a <code>page.tsx</code>/<code>layout.tsx</code> hard-forces dynamic rendering, no matter what the code does.
            (<code>force-static</code> is the opposite hammer.)
          </li>
        </ul>
        <pre><code>{`// Four ways the same route can become dynamic:

// 1. Dynamic API
import { headers } from "next/headers";
const ua = (await headers()).get("user-agent");

// 2. searchParams (per-request URL)
export default function Page({ searchParams }) { /* ... */ }

// 3. Uncached fetch (no-store)
const res = await fetch("https://api.example.com/now", { cache: "no-store" });

// 4. Explicit opt-out of static
export const dynamic = "force-dynamic";`}</code></pre>
        <Callout variant="warn" title="One leak makes the whole route dynamic">
          <p>
            Dynamic-ness is <em>contagious upward</em>. If a deeply nested Server Component reads <code>cookies()</code>,
            the entire route that renders it becomes dynamic, even if 95% of the page is static-friendly. That&apos;s the #1
            cause of &quot;why is my marketing page being rendered per request?&quot; The fix is to isolate the dynamic bit
            (often behind a <code>Suspense</code> boundary, see streaming below, and Partial Prerendering at the end).
          </p>
        </Callout>
        <Callout variant="info" title="Caveat on the version churn">
          <p>
            The exact defaults have shifted across Next 14 → 15 → 16. The big one: in Next 14 <code>fetch</code> was cached
            by default, and in Next 15+ it is <strong>not</strong>, you opt into caching with
            <code>{" "}fetch(url, {"{ cache: \"force-cache\" }"})</code> or <code>next: {"{ revalidate }"}</code>. The
            <em> principle</em> below (request data → dynamic) is stable across all of them; the defaults are what you
            double-check in the docs for your version.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-static-vs-dynamic" moduleSlug={MODULE_SLUG} title="Static vs dynamic & what flips a route">
        <Quiz
          kind="Static vs dynamic"
          question="In the App Router, a page reads cookies() from next/headers. What happens to its rendering strategy?"
          options={[
            {
              label: "It becomes dynamic (rendered per request), because cookie values can't be known at build time",
              correct: true,
              explanation:
                "Right. cookies() is a Dynamic API, it reads request-specific data, so Next cannot bake one HTML file for everyone. Touching it opts the route into per-request rendering.",
            },
            {
              label: "It stays static; Next snapshots the cookies at build time and reuses them",
              explanation:
                "There are no cookies at build time, no one has made a request yet. Reading cookies() is precisely what forces dynamic rendering.",
            },
            {
              label: "It throws a build error, because cookies() can only be read on the client",
              explanation:
                "cookies() is a server API that's perfectly valid in a Server Component. It doesn't error, it flips the route to dynamic.",
            },
            {
              label: "Nothing changes unless you also export dynamic = 'force-dynamic'",
              explanation:
                "force-dynamic is one way to opt in, but it's not required, reading a Dynamic API like cookies() flips the route on its own.",
            },
          ]}
        />
        <Quiz
          kind="Spotting the flip"
          question="Which of these does NOT, by itself, force a route to render dynamically?"
          options={[
            {
              label: "A fetch() with { next: { revalidate: 60 } }",
              correct: true,
              explanation:
                "Correct, a revalidated fetch is still cached/static; it just rebuilds on a schedule (that's ISR). It does not force per-request rendering. The others (no-store fetch, reading searchParams, force-dynamic) all do.",
            },
            {
              label: "A fetch() with { cache: 'no-store' }",
              explanation:
                "no-store means 'fetch fresh every request,' which opts the route into dynamic rendering. This one DOES flip it.",
            },
            {
              label: "Reading the searchParams prop on the page",
              explanation:
                "searchParams comes from the per-request URL query string, so reading it forces dynamic rendering. This one DOES flip it.",
            },
            {
              label: "export const dynamic = 'force-dynamic'",
              explanation:
                "That's the explicit hammer that hard-forces dynamic rendering regardless of code. This one DOES flip it.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. ISR / REVALIDATE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">ISR, static, but with an expiry date</h2>
        <p className="mb-4">
          Static is fast but frozen; dynamic is fresh but costs a render per request. <strong>Incremental Static
          Regeneration</strong> (ISR) is the middle path: serve a baked file like a static page, but let it
          <em> automatically rebuild in the background</em> after a set interval. Back to the bakery, it&apos;s a baked
          croissant with a &quot;best before&quot; stamp. Visitors keep getting the cached one (instant), and once it&apos;s stale,
          the <em>next</em> request triggers a fresh bake while still serving the old one. This is
          <strong> stale-while-revalidate</strong> at the page level.
        </p>
        <p className="mb-4">
          You enable it one of two ways. Per-fetch, with the <code>next.revalidate</code> option:
        </p>
        <pre><code>{`// Revalidate THIS data at most once every 60 seconds.
// The route stays static; the cached output is rebuilt in the background
// when it's older than 60s and someone requests it.
const res = await fetch("https://api.example.com/prices", {
  next: { revalidate: 60 },
});`}</code></pre>
        <p className="mb-4">
          …or for the whole route segment, with the exported <code>revalidate</code> constant:
        </p>
        <pre><code>{`// app/blog/[slug]/page.tsx
// Rebuild this page's static output at most once an hour.
export const revalidate = 3600;

export default async function Post({ params }) {
  const post = await getPost((await params).slug);
  return <article>{post.body}</article>;
}`}</code></pre>
        <p className="mb-4">
          The key distinction from dynamic: an ISR page is <strong>still served from cache</strong>, so the visitor never
          waits for a render. The revalidation happens out of band. <code>revalidate: 0</code> effectively means &quot;always
          dynamic,&quot; and a large number means &quot;basically static.&quot; You can also trigger it on demand with
          <code>revalidatePath()</code> / <code>revalidateTag()</code> after a content change, instead of waiting for the
          timer.
        </p>
        <Callout variant="insight" title="ISR is a cache policy, not a third render mode">
          <p>
            Don&apos;t think of static / ISR / dynamic as three separate engines. Think: <em>is the output cached, and for
            how long?</em> Static = cached forever (until next build). ISR = cached with a TTL that auto-refreshes.
            Dynamic = not cached, rendered every time. ISR is just a static page that agrees to expire.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. STREAMING SSR ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Streaming SSR, flush the page in pieces</h2>
        <p className="mb-4">
          Here&apos;s the problem streaming solves. Your page has a fast header and a slow product-recommendations panel that
          takes 800ms to fetch. Without streaming, the server waits for <em>everything</em> before sending a single byte,
          the user stares at a blank screen for 800ms because of the slowest part. That&apos;s the conveyor-belt insight:
          you shouldn&apos;t hold the whole meal hostage to the slowest dish.
        </p>
        <p className="mb-4">
          <strong>Streaming SSR</strong> lets the server flush HTML <em>progressively</em>. You wrap a slow section in a
          <code> &lt;Suspense&gt;</code> boundary with a fallback. The server immediately sends the shell <em>plus</em> the
          fallback (a skeleton), then, when the slow data resolves, streams the real markup down the same response and
          swaps it in. The user sees and interacts with the fast parts right away.
        </p>
        <pre><code>{`// app/page.tsx
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <Header />                       {/* fast: flushed immediately */}
      <Suspense fallback={<Skeleton />}>
        <Recommendations />            {/* slow async Server Component */}
      </Suspense>
    </main>
  );
}

// Recommendations awaits its own data. The page does NOT block on it;
// the shell + <Skeleton /> ship first, the real markup streams in after.
async function Recommendations() {
  const items = await getRecommendations(); // 800ms
  return <ProductList items={items} />;
}`}</code></pre>
        <p className="mb-4">
          The boundary is the unit of streaming: everything outside it ships first, everything inside it is allowed to
          arrive late. This is also why a single slow fetch no longer ruins your <em>Time To First Byte</em>, the first
          byte is the shell, not the whole page.
        </p>
        <Callout variant="insight" title="loading.tsx is just sugar for a route-level Suspense">
          <p>
            When you drop a <code>loading.tsx</code> file into a route segment, Next automatically wraps that segment&apos;s
            <code> page.tsx</code> in a <code>&lt;Suspense&gt;</code> whose fallback is your <code>loading.tsx</code>. There is
            no separate &quot;loading&quot; mechanism, it&apos;s the exact same Suspense streaming, just generated for you at the
            route level. Knowing this lets you answer &quot;how does <code>loading.tsx</code> work?&quot; in one sentence.
          </p>
        </Callout>
        <Callout variant="warn" title="Streaming needs a streaming-capable response">
          <p>
            Streaming is a server-rendering feature: the route is rendered on a server (dynamically, or at request time for
            a cache miss) and the HTML is flushed over a chunked response. A purely static prerendered file has nothing to
            stream, it&apos;s already complete. Streaming shines exactly when part of the page is slow <em>and</em> dynamic,
            which is why it pairs so naturally with the per-request rendering above.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-isr-streaming" moduleSlug={MODULE_SLUG} title="ISR with revalidate & streaming SSR">
        <Quiz
          kind="ISR"
          question="A page uses export const revalidate = 60. A visitor hits it 90 seconds after the last build. What happens?"
          options={[
            {
              label: "They're served the cached (stale) page instantly, and that request triggers a background rebuild for the next visitor",
              correct: true,
              explanation:
                "Exactly, that's stale-while-revalidate. The current visitor never waits: they get the cached copy, and the regeneration happens out of band so the NEXT request sees fresh output.",
            },
            {
              label: "They wait while Next re-renders the page fresh, then receive the new version",
              explanation:
                "That would be dynamic rendering. ISR serves the cached copy immediately and revalidates in the background, the visitor doesn't block on a render.",
            },
            {
              label: "They get a 500 because the cached page has expired",
              explanation:
                "An expired ISR cache isn't an error. The stale page is still served while a fresh one is regenerated behind the scenes.",
            },
            {
              label: "Nothing, revalidate only matters at build time",
              explanation:
                "revalidate governs runtime cache freshness, not build time. After the TTL elapses, the next request triggers regeneration.",
            },
          ]}
        />
        <Quiz
          kind="Streaming & loading.tsx"
          question="What is loading.tsx in a route segment actually doing under the hood?"
          options={[
            {
              label: "Next wraps the segment's page in a <Suspense> whose fallback is the loading.tsx UI, so the shell streams while the page resolves",
              correct: true,
              explanation:
                "Correct. loading.tsx is sugar for a route-level Suspense boundary. It's the same streaming mechanism you'd get by hand-wrapping the slow part in <Suspense fallback={...}>.",
            },
            {
              label: "It's a special spinner component Next shows on the client only after hydration",
              explanation:
                "It's not a client-only post-hydration spinner, it's the Suspense fallback streamed as part of the server response, shown before the page content arrives.",
            },
            {
              label: "It blocks the route from rendering until all data is fetched, then replaces itself",
              explanation:
                "The opposite: it lets the shell + fallback ship immediately so the route does NOT block on slow data. The real content streams in afterward.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. NODE VS EDGE RUNTIME ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Node vs Edge, where the per-request code runs</h2>
        <p className="mb-4">
          Once a route renders per request, <em>something somewhere</em> has to run that code. The App Router lets you
          choose the <strong>runtime</strong> for a segment: the default <strong>Node.js</strong> runtime, or the
          <strong> Edge</strong> runtime. This is a separate axis from static/dynamic, it&apos;s about <em>where</em> and
          <em> on what</em> the dynamic work executes.
        </p>
        <pre><code>{`// Opt a route segment into the Edge runtime:
export const runtime = "edge";   // default is "nodejs"`}</code></pre>
        <p className="mb-4">The tradeoff, concretely:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Edge: fast cold starts, runs close to the user.</strong> Edge functions deploy to many locations
            worldwide and spin up almost instantly, so latency-sensitive, geographically-distributed work (auth checks,
            redirects, personalization, lightweight API routes) feels snappy everywhere.
          </li>
          <li>
            <strong>Edge: a smaller API surface.</strong> It runs on a Web-standard runtime (think Web APIs like
            <code> fetch</code>, <code>Request</code>, <code>Response</code>), <em>not</em> full Node. So no
            <code> fs</code>, no native Node modules, restricted bundle sizes, and many database drivers that assume Node
            won&apos;t work. You trade capability for reach.
          </li>
          <li>
            <strong>Node: the full platform, slower to wake.</strong> The Node runtime gives you the entire Node API and
            ecosystem, file system, native addons, any npm package, heavyweight DB clients. The cost is heavier cold
            starts and (typically) running in fewer, more centralized regions.
          </li>
        </ul>
        <Callout variant="insight" title="How to choose in one line">
          <p>
            Need a Node-only dependency, a native DB driver, the file system, or heavy compute? → <strong>Node</strong>.
            Need ultra-low latency, global proximity, and you only use Web APIs (lightweight personalization, edge auth,
            redirects)? → <strong>Edge</strong>. When unsure, stay on the Node default, it has fewer surprises.
          </p>
        </Callout>
        <Callout variant="warn" title="Edge is not 'faster Node'">
          <p>
            A common interview trap is calling Edge &quot;a faster version of Node.&quot; It isn&apos;t, it&apos;s a <em>different,
            smaller</em> runtime with different constraints. It can lower latency because of <em>location</em> and cold-start
            behavior, but it removes APIs you may depend on. The right framing is reach-and-startup vs capability, not
            fast vs slow.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. READING THE BUILD OUTPUT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Reading the build output (the report card)</h2>
        <p className="mb-4">
          Everything above is invisible until you run <code>next build</code> and read what it tells you. The build prints
          a table of every route with a symbol marking its strategy. Once you can read the legend, you can <em>verify</em>
          your intentions instead of guessing:
        </p>
        <pre><code>{`Route (app)                     Size     First Load JS
┌ ○ /                           1.2 kB        92 kB
├ ○ /about                      0.4 kB        88 kB
├ ● /blog/[slug]                2.1 kB        95 kB
├ ƒ /dashboard                  1.8 kB        93 kB
└ ƒ /api/search                 0 B            0 B

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML with getStaticProps-style data
ƒ  (Dynamic)  server-rendered on demand`}</code></pre>
        <p className="mb-4">Reading it line by line:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong><code>○ Static</code></strong>, prerendered to a plain HTML file at build time, no per-request work.
            <code> /</code> and <code>/about</code> here. This is the goal for anything that can be the same for everyone.
          </li>
          <li>
            <strong><code>● SSG</code></strong>, also prerendered at build time, but for a set of paths generated from data
            (e.g. one HTML file per blog slug via <code>generateStaticParams</code>). Static output, dynamic <em>route</em>.
          </li>
          <li>
            <strong><code>ƒ Dynamic</code></strong>, rendered on the server on demand, per request. <code>/dashboard</code>
            reads cookies, so it&apos;s dynamic; the <code>/api/search</code> route handler is dynamic too. If you expected a
            page to be <code>○</code> and it shows <code>ƒ</code>, something flipped it, go hunt the Dynamic API or
            uncached fetch.
          </li>
        </ul>
        <Callout variant="insight" title="The build output is your verification step">
          <p>
            The single most useful habit: after wiring up a route, run the build and confirm the symbol matches your
            intent. &quot;I wanted this marketing page static, but it shows <code>ƒ</code>&quot; is a real, common bug, and the
            build output is the only place it surfaces. Treat that legend as a checklist, not decoration.
          </p>
        </Callout>
        <Callout variant="info" title="Symbols drift between versions">
          <p>
            The exact glyphs and labels have shifted across Next releases (and newer versions add markers for things like
            Partial Prerendering). Don&apos;t memorize the artwork, memorize the three <em>concepts</em>: prerendered-static,
            prerendered-from-data, and rendered-on-demand. Then read whatever legend your version prints right above the
            table.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. PPR — THE DIRECTION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Where this is heading, Partial Prerendering</h2>
        <p className="mb-4">
          We hit a tension earlier: one nested dynamic component (a cookie read) drags the <em>whole</em> route into
          dynamic rendering, even if the rest is perfectly static. <strong>Partial Prerendering</strong> (PPR) is Next&apos;s
          answer to that, and it&apos;s the direction the framework is moving.
        </p>
        <p className="mb-4">
          The idea: prerender the static shell at build time <em>and</em> leave holes (the Suspense boundaries) that get
          dynamically streamed in per request, <strong>in a single response</strong>. You get the instant static shell
          from the CDN and the per-request dynamic bits, without choosing one strategy for the entire route. It&apos;s the
          bakery and the diner on the same plate: the croissant is pre-baked, the omelette is cooked to order, and they
          arrive together.
        </p>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, the whole module maps cleanly to caching layers you already know. Static is a
            fully materialized response on a CDN. ISR is a cache entry with a TTL and stale-while-revalidate. Dynamic is a
            cache-bypass / per-request handler. Streaming is chunked transfer encoding flushing partial responses. Edge vs
            Node is just <em>where</em> the compute runs and what stdlib it has. None of this is new, Next is putting
            familiar HTTP-caching and runtime-placement decisions behind component-level ergonomics.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 9. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;explain rendering strategies in the App Router&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Static vs dynamic = when the HTML is produced.</strong> Static is baked once at build (default,
              served from CDN). Dynamic is rendered per request, on a server.
            </li>
            <li>
              <strong>You don&apos;t pick it, your code reveals it.</strong> Reading <code>cookies()</code>/<code>headers()</code>,
              <code> searchParams</code>, a <code>no-store</code> fetch, or <code>dynamic = &quot;force-dynamic&quot;</code> flips a
              route to dynamic. One nested leak makes the whole route dynamic.
            </li>
            <li>
              <strong>ISR is static with a TTL.</strong> <code>next: {"{ revalidate: n }"}</code> or
              <code> export const revalidate = n</code> serves cached output and rebuilds in the background
              (stale-while-revalidate).
            </li>
            <li>
              <strong>Streaming flushes the page in pieces.</strong> <code>&lt;Suspense&gt;</code> ships the shell + fallback
              first and streams slow sections in. <code>loading.tsx</code> is auto-generated route-level Suspense.
            </li>
            <li>
              <strong>Edge vs Node = where dynamic code runs.</strong> Edge: fast cold start, global, Web-API-only. Node:
              full platform, heavier startup. Reach vs capability.
            </li>
            <li>
              <strong>Read the build output to verify.</strong> <code>○</code> static, <code>●</code> SSG-from-data,
              <code> ƒ</code> dynamic. PPR is the direction: static shell + streamed dynamic holes in one response.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 10. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, classify, convert, stream, and confirm</h2>
        <p className="mb-4">
          You&apos;ll take a mixed app, label each route&apos;s strategy by reading its code, change one on purpose, stream a
          slow section, and then prove every result against the build output. The payoff is being able to look at any
          route and say, and verify, exactly how it renders.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Build (or open) a mixed app with several routes.</strong> Include at least: a plain marketing page
            (no data), a page that reads <code>cookies()</code> or <code>searchParams</code>, a list page that fetches
            from an API, and a route handler under <code>app/api/</code>. The variety is the point, you want every
            strategy represented.
          </li>
          <li>
            <strong>Classify each route on paper first.</strong> For every route, predict static / dynamic / streamed
            <em> before</em> building, and write down <em>why</em>, &quot;dynamic because it reads <code>searchParams</code>,&quot;
            &quot;static because it touches no request data.&quot; This is the skill the build output will grade.
          </li>
          <li>
            <strong>Force one static page to ISR with <code>revalidate</code>.</strong> Pick a page that fetches data but
            doesn&apos;t need per-request freshness. Add <code>export const revalidate = 60</code> (or
            <code> next: {"{ revalidate: 60 }"}</code> on the fetch). Confirm it stays cached/static rather than flipping to
            dynamic, that distinction is the whole lesson of ISR.
          </li>
          <li>
            <strong>Stream a slow section behind <code>&lt;Suspense&gt;</code>.</strong> Add an async Server Component with
            an artificial delay (e.g. <code>await new Promise(r =&gt; setTimeout(r, 1500))</code>), wrap it in a
            <code> &lt;Suspense fallback=&#123;&lt;Skeleton/&gt;&#125;&gt;</code>, and watch the shell render immediately while
            the slow part streams in. Then add a <code>loading.tsx</code> to a segment and confirm it behaves identically,
            proving they&apos;re the same mechanism.
          </li>
          <li>
            <strong>Run <code>next build</code> and read the table.</strong> Match every <code>○</code> / <code>●</code> /
            <code> ƒ</code> against your paper predictions. Each mismatch is a lesson: find the line that flipped a page
            you expected to be static, and decide whether that&apos;s correct or an accidental dynamic leak.
          </li>
          <li>
            <strong>Stretch, pick a runtime and reason about it.</strong> Take one dynamic route and consider
            <code> export const runtime = &quot;edge&quot;</code>. Does it use any Node-only API or driver? If yes, it can&apos;t go
            Edge, write down which dependency blocks it. That &quot;what stops this from being Edge?&quot; question is exactly the
            tradeoff in practice.
          </li>
        </ol>
        <Callout variant="info" title="The habit to walk away with">
          <p>
            The deliverable isn&apos;t the app, it&apos;s the <em>loop</em>: predict the strategy from the code, change it
            deliberately, and confirm against the build output. Do that a few times and rendering strategies stop being
            magic. You&apos;ll read a route and know what symbol it&apos;ll print before you ever run the build.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-runtime-build-output" moduleSlug={MODULE_SLUG} title="Node vs Edge & reading the build output">
        <Quiz
          kind="Node vs Edge"
          question="Your dynamic route uses a native Node Postgres driver and reads from the file system. Can you move it to the Edge runtime for lower latency?"
          options={[
            {
              label: "No, the Edge runtime is Web-API-only, with no fs and no native Node modules, so a native DB driver and file system access won't run there",
              correct: true,
              explanation:
                "Correct. Edge trades capability for reach: it lacks the full Node API surface. A native driver and fs access are exactly the kind of Node-only dependencies that block an Edge move. Keep it on Node.",
            },
            {
              label: "Yes, Edge is just a faster Node, so everything that runs on Node also runs on Edge",
              explanation:
                "Edge is not 'faster Node', it's a smaller, Web-standard runtime. It can't run native Node modules or access the file system, so this route can't move there.",
            },
            {
              label: "Yes, but only if you also set dynamic = 'force-static'",
              explanation:
                "force-static is unrelated and would conflict with a dynamic route. The blocker is the runtime's missing APIs, not a rendering config.",
            },
          ]}
        />
        <Quiz
          kind="Reading the build"
          question="In the build output, a page you intended to be static marketing content shows the ƒ (Dynamic) symbol. What does that tell you?"
          options={[
            {
              label: "Something in the route opted it into per-request rendering, likely a Dynamic API, searchParams, a no-store fetch, or force-dynamic, and you should hunt it down",
              correct: true,
              explanation:
                "Exactly. ƒ means rendered-on-demand. For a page you wanted static, that's a signal to find the line (often a nested component reading cookies/headers, or an uncached fetch) that flipped it.",
            },
            {
              label: "It's a build warning that's safe to ignore; ƒ just means the page is bigger than average",
              explanation:
                "ƒ has nothing to do with size, it's the rendering strategy marker meaning dynamic/on-demand. For an intended-static page it's a real signal to investigate, not noise.",
            },
            {
              label: "The page failed to build and fell back to client-side rendering",
              explanation:
                "ƒ is not a build failure or a CSR fallback, it's a successful build marking the route as server-rendered per request. The action is to find what made it dynamic.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
