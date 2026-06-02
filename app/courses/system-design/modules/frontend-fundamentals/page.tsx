import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "lens", title: "The frontend lens" },
  { id: "rendering", title: "Rendering strategies" },
  { id: "vitals", title: "Core Web Vitals" },
  { id: "bundles", title: "Bundle budgets" },
  { id: "state", title: "State architecture" },
];

export default function Page() {
  const mod = getModuleBySlug("frontend-fundamentals")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="frontend-fundamentals" />
        <ModuleProgress moduleSlug="frontend-fundamentals" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          The frontend half of system design. Not &quot;how do hooks work&quot;, that&apos;s table stakes, but the calls that decide whether your app loads in 1.2s or 4.8s, whether the CDN bill scales linearly with users, and whether the next engineer can ship a feature without rebuilding caching from scratch.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>SSR vs SSG vs ISR vs CSR, the decision matrix and the real numbers behind each</li>
          <li>Core Web Vitals (LCP, INP, CLS), what moves them and how you measure</li>
          <li>The 170KB JS budget nobody told you about, and what blows it</li>
          <li>Server state vs client state, the mental model that retires half your Redux code</li>
        </ul>
      </section>

      <section>
        <h2>Backend instincts get you halfway. The other half is hostile.</h2>
        <p>
          You&apos;ve done the backend half. Services, queues, caches, idempotency keys, the works. Now imagine the same system, except: every request goes over a coffee-shop wifi connection that drops 5% of packets, the &quot;server&quot; running your code is a four-year-old Android with a mid-range CPU and 2GB of RAM, and the user can see every millisecond your code takes, they will close the tab if you take too long. That&apos;s the frontend system design problem.
        </p>
        <p>
          The constraints flip. On the backend, you control the hardware, you control the network, and your tail latency budget is measured in milliseconds because you have a hundred more requests behind this one. On the frontend, you control none of that, and the user&apos;s budget is one. They&apos;re looking at one screen, and every 100ms of delay costs you about 1% conversion at e-commerce scale. The whole craft is making decisions that hide the constraints from the user.
        </p>
        <p>
          This module is the foundation. We cover the four calls that every frontend system design interview probes: <strong>rendering strategy</strong>, <strong>performance budgets</strong>, <strong>bundle size</strong>, and <strong>state architecture</strong>. Each one is a place where the wrong call early costs you a year of migration later. The next two modules in this phase apply these to specific archetypes, feeds and real-time UIs, but you&apos;ll need this lens first.
        </p>
      </section>

      <Checkpoint moduleSlug="frontend-fundamentals" id="lens" title="Part 1 · The frontend system design lens" xp={20}>
        <h2>What&apos;s actually different about frontend</h2>
        <p>
          Three constraints define the medium, and every frontend tradeoff is a response to at least one of them. Pin these down before anything else, because every &quot;why is React doing X&quot; answer eventually grounds out here.
        </p>

        <h3>1. The network is hostile</h3>
        <p>
          Backend-to-backend, you assume sub-millisecond RTT inside a data center and well-provisioned cross-region links. Frontend-to-backend, the median request goes over a residential or mobile connection. RTT to your nearest edge is 30-80ms on a good day, 200-400ms on a flaky cellular connection, and the connection can disappear mid-request. A 1MB JS bundle on a 3G connection takes about 8 seconds just to <em>download</em>, before parsing, before rendering, before anything appears.
        </p>
        <p>
          Concrete numbers, because they discipline thinking. A 4G median is around 9 Mbps down, ~50ms RTT. A 3G median (still common in much of the world) is around 1.6 Mbps down, ~150ms RTT. TCP slow start means the first round trip only ships ~14KB regardless of bandwidth. So your <strong>first 14KB of HTML is on the critical path</strong>, what fits in there is what the user sees first.
        </p>

        <h3>2. The device is constrained</h3>
        <p>
          A modern phone advertises &quot;3 GHz, 8 cores&quot; and that sounds like a lot. It isn&apos;t, for JavaScript. JS is single-threaded for the work that matters (parsing, layout, hydration, your component tree), thermal throttling kicks in within seconds of sustained load, and the V8 (or JSC) engine takes time per kilobyte to <em>parse</em>{" "}JS before it can run. A median Android in 2024 parses about 1MB of JS per second on the main thread. So your 800KB bundle isn&apos;t just an 8-second download on 3G, it&apos;s an additional ~800ms of parse time blocking the main thread before anything is interactive.
        </p>
        <p>
          The implication: the bottleneck on most apps is not network OR CPU in isolation, it&apos;s the <strong>combination</strong>{" "}on the slowest device class you ship to. Optimizing for your dev machine misses the entire problem.
        </p>

        <h3>3. The user notices every 100ms</h3>
        <p>
          The well-known thresholds: under 100ms feels instant, 100-300ms feels responsive, 300ms-1s is noticeable, over 1s breaks the perception of direct manipulation. Google&apos;s Core Web Vitals codify these into measurable targets, but the underlying psychophysics is what matters. The user&apos;s expectation isn&apos;t &quot;your app should be fast.&quot; It&apos;s &quot;the button I tapped should respond before I look up to see if I tapped it right.&quot; Miss that and the app feels broken in a way that no Lighthouse score will rescue.
        </p>

        <Callout variant="insight" title="The senior frame">
          <p className="m-0">Backend system design optimizes for throughput and tail latency under load. Frontend system design optimizes for perceived latency on a single device, with one user, on a connection you don&apos;t control. The math is different, the bottlenecks are different, the tools are different. If you carry over backend instincts unchanged, &quot;we&apos;ll cache it&quot;, &quot;we&apos;ll add a queue&quot;, &quot;we&apos;ll scale horizontally&quot;, you miss the actual problem, which is that the user is one keystroke away from closing the tab.</p>
        </Callout>

        <h3>The four calls that define a frontend architecture</h3>
        <p>
          Every frontend system design interview, in some form, asks you to make these four decisions and defend them. They&apos;re the rest of this module:
        </p>
        <ol>
          <li><strong>Rendering strategy</strong>, where does HTML come from? Server, build time, client, or some hybrid? This decides first-paint latency and SEO and CDN cost in one shot.</li>
          <li><strong>Performance budgets</strong>, what are the numbers you defend in code review? LCP, INP, CLS, plus a JS budget. Without numbers, every &quot;is this fast enough&quot; argument is unwinnable.</li>
          <li><strong>Bundle architecture</strong>, what JS does the user actually download? How is it split? What never gets shipped?</li>
          <li><strong>State architecture</strong>, where does data live? Server cache vs client UI state vs URL state. Get this wrong and you rebuild React Query from scratch on top of Redux.</li>
        </ol>
        <p>
          The rest of the module walks through each. Let&apos;s start with the one that shapes everything downstream: rendering.
        </p>

        <PartRecap
          title="Part 1 recap"
          gist="Frontend system design optimizes for perceived latency on a device and network you don't own. The constraints are the network (hostile), the device (slower than your laptop), and the user (notices every 100ms). The four calls that follow, rendering, vitals, bundles, state, are all responses to those constraints."
          points={[
            { takeaway: "Network: 14KB on the critical path", detail: "TCP slow start means the first round trip ships ~14KB. What's in your initial HTML is what the user sees first. Everything else costs at least one more round trip." },
            { takeaway: "Device: parse cost dominates", detail: "Median Android parses ~1MB/s of JS on the main thread. Your bundle isn't just download time, it's parse time blocking interactivity. Test on the slowest device you ship to, not your laptop." },
            { takeaway: "User: 100ms is the response budget", detail: "Under 100ms feels instant. Over 300ms feels laggy. Over 1s breaks the perception of direct manipulation. These aren't preferences, they're psychophysics, bake them into your numbers." },
            { takeaway: "Four calls define the architecture", detail: "Rendering (where HTML comes from), vitals (what numbers you defend), bundles (what JS you ship), state (where data lives). Every frontend interview probes these. Wrong call early = year-long migration later." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-fundamentals" id="rendering" title="Part 2 · Rendering strategies, SSR / SSG / ISR / CSR" xp={25}>
        <h2>Where does HTML come from?</h2>
        <p>
          Rendering strategy is the question that splits frontend engineers from frontend system designers. The wrong call costs you 2 seconds of LCP, half your SEO traffic, or a CDN bill that scales linearly with users. Pick wrong early and you&apos;ll be migrating off it for a year.
        </p>
        <p>
          There are four strategies. They&apos;re not interchangeable, each one trades different things, and the right choice depends on three properties of the page: <strong>is the content personalized</strong>, <strong>how often does it change</strong>, and <strong>does SEO matter</strong>.
        </p>

        <h3>CSR, Client-Side Rendering</h3>
        <p>
          The browser downloads a near-empty HTML shell, then a JS bundle, then the JS fetches data and renders the actual UI in the browser. This is what Create React App did by default; it&apos;s what most SPAs still do. The response from your server is roughly:
        </p>

        <CodeBlock lang="plain" caption="A typical CSR HTML response">{`<!DOCTYPE html>
<html>
  <head><title>My App</title></head>
  <body>
    <div id="root"></div>
    <script src="/static/app.bundle.js"></script>
  </body>
</html>`}</CodeBlock>

        <p>
          The user sees a blank page until the JS downloads, parses, executes, fetches data, and renders. On a fast connection and machine that&apos;s 500-1000ms. On a slow phone on cellular, that&apos;s 3-6 seconds. <strong>CSR&apos;s problem is the time-to-content for the first visit</strong>, there&apos;s nothing the user can read before the JS lands.
        </p>
        <p>
          Where CSR <em>is</em>{" "}the right answer: apps behind login, where the user has an established session, the content is fully personalized, SEO doesn&apos;t matter, and the per-user dashboard isn&apos;t worth pre-rendering on the server. Internal tools, admin consoles, authenticated dashboards, CSR is fine. The user is willing to wait once for the &quot;app&quot; to load and then operate inside it; they&apos;re not arriving from Google search expecting an article.
        </p>

        <h3>SSR, Server-Side Rendering</h3>
        <p>
          The server renders the React tree to HTML <em>per request</em>, ships the full HTML to the browser, and the user sees content immediately. The same JS bundle still downloads in the background to make the page interactive (this is &quot;hydration&quot;, we&apos;ll get to it). The response shape is now:
        </p>

        <CodeBlock lang="plain" caption="A typical SSR HTML response">{`<!DOCTYPE html>
<html>
  <head><title>Alice's Profile</title></head>
  <body>
    <div id="root">
      <header>...</header>
      <main>
        <h1>Alice</h1>
        <p>Joined 2019. 142 posts.</p>
        ...
      </main>
    </div>
    <script src="/static/app.bundle.js"></script>
    <script>window.__INITIAL_DATA__ = { ... }</script>
  </body>
</html>`}</CodeBlock>

        <p>
          Now the first paint shows real content within a single round trip. The cost: every request hits your server, your server runs React for each one, and your server has to connect to whatever data sources the page needs before it can respond. SSR adds <strong>~100-300ms of server time</strong>{" "}per request compared to CSR, but it saves <strong>1-3 seconds of perceived load</strong>{" "}on slow phones because the user sees content before the JS bundle parses.
        </p>
        <p>
          SSR is the right answer when content is personalized AND SEO matters AND first-paint speed matters. Search results pages, personalized feeds with public URLs, e-commerce product pages with user-specific pricing. Anywhere a search engine or social-media unfurler needs to read the page, but the content varies per user.
        </p>

        <h3>SSG, Static Site Generation</h3>
        <p>
          The site is rendered to HTML <strong>at build time</strong>, once, and the resulting HTML files are served from a CDN. No runtime server work, the server is a CDN. First paint is whatever the CDN&apos;s edge latency is, typically 30-80ms. Pages are infinitely cacheable because they&apos;re identical for every user.
        </p>
        <p>
          SSG is the fastest possible delivery. It&apos;s also the most constrained: it only works if the page content is identical for every user. Marketing sites, documentation, blog posts, anything where personalization is none-or-cosmetic. If you can SSG, you should SSG; the floor is unbeatable.
        </p>
        <p>
          The hidden cost: build time scales with the number of pages. A blog with 200 posts builds in 30 seconds. A docs site with 50,000 generated pages takes 40 minutes. The build becomes the bottleneck, and you can&apos;t deploy a typo fix without waiting for the full rebuild.
        </p>

        <h3>ISR, Incremental Static Regeneration</h3>
        <p>
          Vercel&apos;s contribution to the menu, now generic across most modern frameworks. ISR is SSG with a revalidation interval: pages are statically generated, served from the CDN, but <strong>regenerated on demand</strong>{" "}when stale. The flow:
        </p>

        <CodeBlock lang="plain" caption="The ISR request lifecycle">{`Request 1 (after deploy):       CDN miss → render at server → cache → respond
Request 2-N (within TTL):       CDN hit → respond from cache (fast)
Request N+1 (TTL expired):      CDN serves stale → triggers background regen
Request N+2 (regen done):       CDN serves fresh
On-demand revalidate (webhook): CDN cache invalidated, next request regenerates`}</CodeBlock>

        <p>
          The win: you get SSG&apos;s edge latency for the common case, but pages can update without a full rebuild. The blog post with 50,000 pages doesn&apos;t take 40 minutes, only popular pages get regenerated when traffic hits them, and unpopular pages stay static forever. Content sites with a CMS are the canonical use case: editor publishes a change → webhook revalidates → new content appears in seconds without redeploying.
        </p>
        <p>
          The catch: ISR only works when content is non-personalized (or personalized client-side after delivery). Once a page has user-specific data baked in, you&apos;re back to SSR. ISR + tiny client-side personalization (&quot;show this CTA only for logged-out users&quot;) is the pragmatic combo for most content sites.
        </p>

        <h3>The decision matrix</h3>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Strategy</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">First paint</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Server cost</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">SEO</th>
                <th className="border border-slate-300 px-3 py-2 text-left dark:border-slate-700">Personalized?</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>CSR</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Slow (3-6s on 3G)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Tiny (static shell)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Bad without extra work</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>SSR</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Fast (1 RTT + render)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Per request (~100-300ms)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Great</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Yes</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>SSG</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Fastest (CDN edge)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">None at runtime</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Great</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No</td></tr>
              <tr><td className="border border-slate-300 px-3 py-2 dark:border-slate-700"><code>ISR</code></td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Fastest (CDN edge)</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Per regen, not per request</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">Great</td><td className="border border-slate-300 px-3 py-2 dark:border-slate-700">No (or client-side)</td></tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="The real numbers, on a slow phone">
          <p className="m-0">SSR adds ~100-300ms of server time vs CSR. That sounds bad until you measure on a 2019 Android on cellular: SSR is showing real content while CSR is still parsing the JS bundle. The 200ms server cost saves 1500-3000ms of perceived load. Every &quot;SSR is too expensive&quot; debate gets settled by measuring on a phone, not a Mac.</p>
        </Callout>

        <h3>Hydration: the cost everyone underestimates</h3>
        <p>
          SSR ships HTML the browser can paint immediately. But that HTML is dead, buttons don&apos;t respond, click handlers aren&apos;t attached, state isn&apos;t initialized. The page is a screenshot. To make it interactive, the browser has to:
        </p>
        <ol>
          <li>Download the JS bundle (network)</li>
          <li>Parse the JS (CPU)</li>
          <li>Execute the JS, which re-runs every component, rebuilding the React tree in memory</li>
          <li>&quot;Hydrate&quot;, match the in-memory tree against the existing DOM and attach event listeners</li>
        </ol>
        <p>
          This is hydration, and it&apos;s the new bottleneck on SSR&apos;d apps. The user can <em>see</em>{" "}content fast, but they can&apos;t <em>tap</em>{" "}it until the bundle hydrates. On a slow phone, you can stare at a fully-rendered page for 4 seconds, tap a button, and have nothing happen. That gap is the worst kind of broken, the page looks ready and isn&apos;t.
        </p>
        <p>
          Hydration cost scales with the size of the React tree, not the size of the screen. A page with 500 components hydrates slower than a page with 50, even if the visible UI is identical. This is why &quot;just SSR everything&quot; isn&apos;t the answer, the bundle and the hydration cost still come for you.
        </p>

        <h3>The response: partial hydration, islands, RSC</h3>
        <p>
          Modern frameworks attack hydration cost three ways:
        </p>
        <ul>
          <li><strong>Partial hydration</strong>, only hydrate components that actually need interactivity. The header, footer, and article body are usually static; don&apos;t ship JS for them. Astro popularized this.</li>
          <li><strong>Islands architecture</strong>, the page is mostly static HTML with small &quot;islands&quot; of interactive React. Each island hydrates independently. Same idea as partial hydration, framed as the default model.</li>
          <li><strong>React Server Components (RSC)</strong>, components that run only on the server, never ship to the client, never hydrate. The component author chooses per-component which side it lives on. This is what Next.js App Router is built around.</li>
        </ul>
        <p>
          The thread connecting all three: <strong>not all components should be hydrated</strong>. A blog post&apos;s prose doesn&apos;t need JS. The like button does. The framework should let you express that, and the bundle should reflect it.
        </p>

        <Callout variant="insight" title="The mental shift RSC asks you to make">
          <p className="m-0">React Server Components flip the default. Before RSC, every component was a client component, and you optionally rendered it on the server. With RSC, every component is a server component by default, and you opt into client-side with <code>&apos;use client&apos;</code>. The interview question that probes whether you&apos;ve internalized this: &quot;which of these components should be a client component?&quot; The senior answer is &quot;only the ones that need state, effects, or browser APIs, the rest run on the server, never ship to the client, never hydrate.&quot;</p>
        </Callout>

        <h3>Which strategy for which surface, quick examples</h3>
        <ul>
          <li><strong>Marketing landing page</strong>, SSG. No personalization, SEO matters, must be fast.</li>
          <li><strong>Blog with 1,000 posts</strong>, ISR. SSG-fast for the common case, regenerates on edits without full redeploy.</li>
          <li><strong>Public-facing product page (Amazon-style)</strong>, SSR. SEO matters, content varies (personalized prices, recently-viewed), and freshness matters.</li>
          <li><strong>User dashboard behind login</strong>, CSR (or SSR with auth). No SEO requirement, content is wholly personal.</li>
          <li><strong>Search results page</strong>, SSR. SEO matters (Google indexes search pages with public queries), results vary per query.</li>
          <li><strong>Real-time stock ticker</strong>, CSR with live updates. Initial render is fine; the value is in the streaming, not the first paint.</li>
          <li><strong>Internal admin tool</strong>, CSR. No SEO, behind login, complex stateful interactions.</li>
        </ul>

        <Quiz
          question={`A team is building a public-facing recipe site. 50,000 recipes, each updated rarely (a few times a year), heavy SEO requirement, traffic is bursty around mealtimes. They've prototyped on SSR and CDN bills are projected to be painful at scale. What's the right rendering strategy?`}
          kind="Quick check"
          options={[
            { label: "ISR. Static-fast for the common case via CDN, regenerates on demand when a recipe is edited (webhook from CMS), no full rebuild needed for one recipe change.", correct: true, explanation: "Right. The recipes are non-personalized, SEO matters, and freshness is needed but rare, that's the textbook ISR shape. SSG would force a 40-minute rebuild on every edit. SSR works but pays per-request server cost when ~100% of those requests could come from the CDN. ISR is the only strategy that gets edge latency AND on-demand updates." },
            { label: "SSR with aggressive caching at the edge.", explanation: "You can layer Cache-Control on SSR responses, but you've now built ISR badly, without the per-page invalidation hooks, without the build-time pre-rendering of popular pages, and with full server cost on cache misses. ISR is the cleaner answer because it's designed for this shape." },
            { label: "SSG. Build all 50,000 recipes, deploy from CDN.", explanation: "Works at first but gets painful: every typo fix is a 30+ minute build, and the build can't be triggered on a CMS edit without redeploying the whole site. ISR removes the bottleneck while keeping the same delivery model." },
            { label: "CSR with prerendered meta tags for SEO.", explanation: "Recipe sites live on Google search traffic. Even with prerendered meta, the actual recipe content is what users (and search ranking) need fast. CSR's blank-shell-then-fetch loses 2-4 seconds of LCP, which directly hurts both UX and SEO ranking." },
          ]}
          hint="The content is non-personalized but updates occasionally and the site is big."
          xp={8}
        />

        <Quiz
          question={`Your team SSR'd a complex dashboard. Lighthouse shows LCP at 1.8s (great) but users complain that for 3 seconds after the page loads, taps on buttons do nothing. What's happening and what's the fix?`}
          kind="Quick check"
          options={[
            { label: "Hydration is slow because the bundle is large. Fix: split the page into mostly-static server components plus small client islands so only the interactive bits hydrate.", correct: true, explanation: "Right. SSR'd HTML paints fast but isn't interactive until the JS hydrates the React tree. A heavy bundle on a slow device leaves a multi-second gap where the page looks ready but ignores input. The fix is reducing what needs to hydrate, RSC, partial hydration, or islands. Just shipping less JS to the client (smaller bundle) helps too, but the structural fix is fewer client components." },
            { label: "The CDN is slow. Move static assets to a faster CDN.", explanation: "The CDN delivered fast enough, LCP is 1.8s. The bottleneck is the gap between paint (HTML arrives) and interactivity (JS hydrates). That's a CPU/parse problem, not a CDN problem." },
            { label: "Switch from SSR to CSR, the dashboard doesn't need SEO.", explanation: "CSR makes the problem worse, not better. The user goes from 'sees content but can't tap' to 'sees nothing for 3-6 seconds', same hydration cost, plus a worse first-paint. The fix is reducing hydration cost, not changing where rendering happens." },
            { label: "Add a loading spinner over the whole page until hydration completes.", explanation: "This hides the broken-input state but extends the time-to-interactive that the user perceives. The senior fix is making more of the page not need hydration in the first place." },
          ]}
          hint="What's the difference between rendered and interactive?"
          xp={8}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Rendering strategy decides where HTML comes from: build time (SSG), per request on the server (SSR), the browser (CSR), or a hybrid (ISR). The right choice is set by personalization, freshness, and SEO. Hydration is the new bottleneck on SSR, partial hydration, islands, and RSC are the response."
          points={[
            { takeaway: "CSR is fine behind login, terrible for first visit", detail: "Blank shell + JS bundle + fetch = 3-6s on slow connections. Use it for authenticated apps where the user has accepted the cost; avoid it for public landing pages." },
            { takeaway: "SSR earns its server cost on slow phones", detail: "~100-300ms server cost saves 1-3s of perceived load when the bundle parse is the bottleneck. Measure on the slowest device class, every 'SSR is too expensive' debate gets settled there." },
            { takeaway: "SSG is the unbeatable floor when you can use it", detail: "Pure non-personalized content → CDN delivery → 30-80ms first paint. The catch: build time scales with page count, and you can't update without redeploying." },
            { takeaway: "ISR = SSG that updates on demand", detail: "Per-page invalidation via webhook means a CMS edit appears in seconds without rebuilding the whole site. The right default for content sites at scale." },
            { takeaway: "Hydration is the silent cost of SSR", detail: "HTML paints fast, but the page can't respond to input until the bundle hydrates. RSC and islands attack this by not shipping JS for components that don't need it." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-fundamentals" id="vitals" title="Part 3 · Core Web Vitals, the numbers you defend" xp={20}>
        <h2>Performance budgets, codified</h2>
        <p>
          Core Web Vitals are Google&apos;s attempt to put real user experience into three numbers. They&apos;re measurable, they&apos;re tracked by Lighthouse and Chrome User Experience Report, and they affect search ranking. More importantly: they give you targets to defend in code review. &quot;This adds 80ms to LCP&quot; is a conversation. &quot;This makes the page feel slow&quot; is not.
        </p>
        <p>
          Three vitals as of 2024 (Google replaced FID with INP in March 2024): <strong>LCP</strong>, <strong>INP</strong>, <strong>CLS</strong>. Each has a &quot;good&quot; threshold, a &quot;needs improvement&quot; band, and a &quot;poor&quot; threshold. The targets are the 75th-percentile of real users, meaning 75% of your sessions should hit the &quot;good&quot; threshold for a page to count as fast.
        </p>

        <h3>LCP, Largest Contentful Paint</h3>
        <p>
          LCP measures when the largest visible element on the page finishes rendering, typically the hero image, the article&apos;s feature photo, or a big block of headline text. <strong>Target: under 2.5s at p75</strong>. Above 4s is &quot;poor.&quot;
        </p>
        <p>
          What moves LCP, in order of impact:
        </p>
        <ul>
          <li><strong>Server response time</strong>, if your server takes 800ms to send the first byte, you&apos;ve burned a third of your budget before any rendering starts. SSR is most exposed here; CDN-served SSG is fastest.</li>
          <li><strong>Render-blocking resources</strong>, CSS in the head, sync &lt;script&gt; tags above content. The browser won&apos;t paint until these load. Inline critical CSS, defer non-critical CSS, async/defer scripts.</li>
          <li><strong>Image optimization</strong>, the LCP element is usually an image. Serve the right format (WebP/AVIF), the right size (responsive srcset), the right priority (<code>fetchpriority=&quot;high&quot;</code> on the hero image, lazy-load below-the-fold). <code>next/image</code> handles most of this automatically.</li>
          <li><strong>Preloading the LCP asset</strong>, <code>&lt;link rel=&quot;preload&quot;&gt;</code> tells the browser to fetch the hero image before parsing JS or CSS that references it. Saves a round trip on the critical path.</li>
          <li><strong>Bundle size on the critical path</strong>, render-blocking JS extends LCP because the browser has to parse the JS before painting if the JS is in the head.</li>
        </ul>

        <CodeBlock lang="plain" caption="Hero image, the right way">{`// Bad: browser doesn't know this is the LCP element, no responsive sizing,
// no priority signal.
<img src="/hero.jpg" alt="..." />

// Good: next/image with priority + size hints.
import Image from "next/image";

<Image
  src="/hero.jpg"
  alt="..."
  width={1200}
  height={600}
  priority           // → fetchpriority="high" + preload
  sizes="(max-width: 768px) 100vw, 1200px"
/>

// What the browser sees in HTML:
// <link rel="preload" as="image" href="/hero.jpg" fetchpriority="high">
// <img src="/hero.jpg" srcset="..." sizes="..." fetchpriority="high">`}</CodeBlock>

        <h3>INP, Interaction to Next Paint</h3>
        <p>
          INP measures the latency from a user input (tap, click, key press) to the next paint that reflects the input. <strong>Target: under 200ms at p75</strong>. Above 500ms is &quot;poor.&quot; INP replaced FID (First Input Delay) in 2024 because FID only measured the first interaction; INP measures all of them and reports the worst.
        </p>
        <p>
          What blows INP:
        </p>
        <ul>
          <li><strong>Long tasks on the main thread</strong>, any single chunk of JS that runs over 50ms blocks input. The most common offenders are large React reconciliations (lots of components re-rendering on a state change), expensive synchronous computation (parsing JSON, heavy math), and third-party scripts.</li>
          <li><strong>React reconciliation cost</strong>, a state change at the top of a deep tree re-renders everything below. <code>React.memo</code>, splitting state, lifting providers, these aren&apos;t premature optimizations on hot interactions; they&apos;re INP fixes.</li>
          <li><strong>Layout thrashing</strong>, reading layout properties (<code>offsetWidth</code>, <code>getBoundingClientRect</code>) interleaved with writes forces the browser to recalculate layout repeatedly. Batch reads, then writes.</li>
          <li><strong>Hydration on SSR&apos;d pages</strong>, interactions during hydration are queued. On a slow phone with a heavy page, the user can tap, wait, and watch nothing happen for seconds.</li>
        </ul>

        <Callout variant="insight" title="The 50ms rule">
          <p className="m-0">Any task that runs over 50ms on the main thread is a &quot;long task&quot;, it blocks input and breaks INP. <code>performance.measure</code> + the Long Tasks API will tell you which ones are yours. The fix is usually one of: split the work with <code>scheduler.yield()</code> or <code>requestIdleCallback</code>, move it to a Web Worker, or memoize so it doesn&apos;t run again. In React, <code>useTransition</code> tells React the update is non-urgent so it can yield to input, perfect for filtering big lists or expensive renders triggered by typing.</p>
        </Callout>

        <h3>CLS, Cumulative Layout Shift</h3>
        <p>
          CLS measures unexpected movement of visible page content. <strong>Target: under 0.1 at p75</strong>. Above 0.25 is &quot;poor.&quot; The 0.1 number is unitless, it&apos;s a layout-shift score that combines distance moved with fraction of viewport affected.
        </p>
        <p>
          What causes CLS:
        </p>
        <ul>
          <li><strong>Images without dimensions</strong>, the browser doesn&apos;t know how big an image will be until it loads. Without explicit width/height (or aspect-ratio), the page reflows when it lands. Fix: always set width and height attributes, even on responsive images. The browser uses them as an aspect ratio.</li>
          <li><strong>Late-loading fonts</strong>, text renders in a fallback font, then the custom font loads and the text re-flows because the metrics differ. Fix: <code>font-display: optional</code> (skip the swap if it&apos;s slow), or use a fallback font matched to the custom font&apos;s metrics (Next.js&apos;s <code>next/font</code> does this automatically).</li>
          <li><strong>Content injected above the viewport</strong>, an ad slot, a cookie banner, an &quot;you have unread messages&quot; bar that appears late and pushes everything down. Fix: reserve space with a fixed-height container, or place the dynamic content in a position where its insertion doesn&apos;t shift visible content.</li>
          <li><strong>Animations that change layout</strong>, animating <code>height</code> or <code>top</code> triggers layout shifts. Animate <code>transform</code> and <code>opacity</code> instead, they don&apos;t affect layout.</li>
        </ul>

        <h3>How vitals are measured</h3>
        <p>
          Two flavors: <strong>lab</strong> (Lighthouse, WebPageTest, your CI) and <strong>field</strong> (real users, via the <code>web-vitals</code> library or Chrome User Experience Report). Lab data is consistent and great for catching regressions; field data is what Google ranks on and what your users actually experience.
        </p>

        <CodeBlock lang="plain" caption="Real-user monitoring with web-vitals">{`// app/layout.tsx (Next.js) or wherever your root component is.
"use client";
import { onLCP, onINP, onCLS } from "web-vitals";
import { useEffect } from "react";

function reportVitals(metric: { name: string; value: number; id: string }) {
  // Send to your RUM endpoint. Use sendBeacon so it survives page unload.
  navigator.sendBeacon(
    "/api/rum",
    JSON.stringify({ name: metric.name, value: metric.value, id: metric.id })
  );
}

export function VitalsReporter() {
  useEffect(() => {
    onLCP(reportVitals);
    onINP(reportVitals);
    onCLS(reportVitals);
  }, []);
  return null;
}`}</CodeBlock>

        <p>
          The raw API underneath <code>web-vitals</code> is <code>PerformanceObserver</code>. You can read it directly if you want to. The library is preferable because it handles the edge cases (multiple LCP candidates, INP debouncing, CLS session windows) that the W3C specs are precise about and that you don&apos;t want to reimplement.
        </p>

        <CodeBlock lang="plain" caption="The PerformanceObserver primitive (LCP example)">{`const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Last entry observed before page unload is the LCP.
    console.log("LCP candidate:", entry.startTime, entry);
  }
});

observer.observe({ type: "largest-contentful-paint", buffered: true });`}</CodeBlock>

        <h3>The tools, ranked by where you reach for them</h3>
        <ul>
          <li><strong>Lighthouse</strong> (in Chrome DevTools, or CLI), first stop for a single-page audit. Lab data, reproducible, great for &quot;why did my LCP regress this week?&quot;</li>
          <li><strong><code>web-vitals</code> library + a RUM backend</strong>, what you actually ship to production. Field data from real users on real connections. Datadog RUM, Sentry, or a homegrown endpoint all work.</li>
          <li><strong>Chrome User Experience Report (CrUX)</strong>, Google&apos;s public dataset of field vitals for every popular site. PageSpeed Insights surfaces it. Useful for benchmarking against competitors.</li>
          <li><strong>Performance tab in Chrome DevTools</strong>, when you need to see <em>why</em>{" "}a long task happened. Flamechart of every JS function call, every layout, every paint.</li>
        </ul>

        <Callout variant="warn" title="Lab data lies, sometimes">
          <p className="m-0">Lighthouse runs on a fast machine simulating a slow device. It&apos;s a useful approximation, but the simulation underestimates real-world variance. You can pass Lighthouse and have terrible field vitals because real users have flaky connections, CPU thermal throttling, browser extensions injecting JS, and hardware that&apos;s slower than the simulation. <strong>Ship RUM. Trust field data over lab data when they disagree.</strong></p>
        </Callout>

        <Quiz
          question={`Your dashboard's INP is 480ms at p75. The team's instinct is "the bundle's too big, code-split everything." You profile in Chrome DevTools and find a single 320ms long task on every click that's React reconciling a 2000-component tree. What's the right fix?`}
          kind="Quick check"
          options={[
            { label: "Split state so the click only re-renders a small subtree, and memoize the children that don't depend on the changed state. Code-splitting wouldn't help, the tree is already loaded.", correct: true, explanation: "Right. Code-splitting reduces bundle size and download time but does nothing for reconciliation cost on an interaction. The 320ms long task is React rebuilding a too-large tree on a click, the fix is making the tree smaller in scope (split contexts, lift state down, memoize). useTransition can help if the update is genuinely non-urgent (filtering a list). Profile-first, fix-the-actual-bottleneck always wins over reflexive bundle-splitting." },
            { label: "Move React Query to a Web Worker so reconciliation doesn't block the main thread.", explanation: "React reconciliation runs on the main thread by design, there's no supported way to move it off, and React Query has nothing to do with the long task. The bottleneck is the size of the React tree being rebuilt, not data fetching." },
            { label: "Add a debounce to the click handler.", explanation: "Debouncing a click feels weird (clicks aren't typed inputs) and doesn't reduce the cost of the eventual render, it just delays it. The user's tap-to-feedback time gets worse, not better." },
            { label: "Switch to SSR so the initial render is on the server.", explanation: "SSR helps initial paint, not interaction cost. Once the page is loaded and interactive, every state update runs on the client regardless of how the page was first rendered." },
          ]}
          hint="The bottleneck happens on a click, not on page load."
          xp={8}
        />

        <Quiz
          question={`You ship a "promo banner" feature: an A/B test that shows a 60px-tall banner at the top of the article page for some users. Pages with the banner have a CLS of 0.18 — above the 0.1 threshold. What's the fix?`}
          kind="Quick check"
          options={[
            { label: "Reserve the 60px of vertical space at the top of every page with min-height, then either the banner or a transparent placeholder occupies it. The layout no longer shifts because the space is always there.", correct: true, explanation: "Right. CLS comes from late-arriving content pushing existing content down. Reserving the space ahead of time means the banner can render or not render with no visible shift. The cost is 60px of viewport you might not use, that's fine compared to a CLS regression and the SEO/UX cost it carries." },
            { label: "Render the banner via SSR so it ships in the initial HTML, no client-side insertion, no shift.", explanation: "This is the senior version of the right answer if you can do it (the banner is in the HTML from the start, no shift possible). But it requires the A/B decision to happen server-side, which often isn't where the experiment lib lives. Reserving the space works regardless of where the decision happens, so it's the more general fix." },
            { label: "Animate the banner sliding in so the shift looks intentional.", explanation: "CLS measures any unexpected layout shift, and the W3C spec doesn't care about your animation easing. Animating a height-affecting change still counts. (And it makes the perceived problem worse, not better.)" },
            { label: "Move the banner to the bottom of the page so it doesn't push article content.", explanation: "This works for the technical CLS metric but defeats the product purpose of the banner. The right answer is to keep the banner where the product wants it AND avoid the shift, which means reserving the space." },
          ]}
          hint="What's the cheapest way to make the layout not change when the banner appears?"
          xp={8}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Core Web Vitals turn perceived performance into three measurable numbers: LCP (paint), INP (interaction), CLS (stability). Each has a target you defend in code review, and each has a small set of well-understood causes. Lab data catches regressions; field data is what users (and Google) actually see."
          points={[
            { takeaway: "LCP ≤ 2.5s, the hero element paints fast", detail: "Server response time, render-blocking resources, image optimization, preload of the LCP asset. next/image with priority handles most of it; the rest is server-side latency." },
            { takeaway: "INP ≤ 200ms, interactions feel instant", detail: "Long tasks (>50ms) on the main thread block input. Reconciliation cost, expensive sync work, and hydration are the usual suspects. Profile, then fix the actual bottleneck, not the symptom." },
            { takeaway: "CLS ≤ 0.1, the layout doesn't jump", detail: "Images without dimensions, late-loading fonts, content injected above the viewport, animating layout-affecting properties. Reserve space; use transform and opacity for animations." },
            { takeaway: "Ship RUM, trust field data", detail: "Lab tools (Lighthouse) catch regressions but underestimate real-world variance. The web-vitals library + a sendBeacon endpoint gives you what users actually experience. When lab and field disagree, field wins." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-fundamentals" id="bundles" title="Part 4 · Bundle size, the budget you don't see" xp={20}>
        <h2>The 170KB number nobody told you about</h2>
        <p>
          Here&apos;s the budget. On a 3G connection (1.6 Mbps, ~150ms RTT), with a 3-second target for first interaction, accounting for TCP slow start and the time to <em>parse</em>{" "}the JS on a median Android, you have <strong>about 170KB of compressed JS</strong>{" "}on the critical path. Above that, the math doesn&apos;t close. You&apos;ll be late no matter what else you do.
        </p>
        <p>
          Most apps blow it. The default Create React App template was over 200KB before you wrote any code. A typical mid-stage React app with the usual dependencies (a UI library, a date library, a charting library, a state library, a router) lands at 800KB-1.5MB compressed before you ship a single feature. That&apos;s 5-10x over budget, and the symptoms are the LCP and INP problems from the last part, they&apos;re not separate problems, they&apos;re downstream of bundle size.
        </p>

        <h3>What blows the budget, the offenders</h3>

        <h4>Barrel imports without tree-shaking</h4>
        <p>
          The most common one. You import <code>{`import { Button } from "huge-ui-library";`}</code> from a library that re-exports everything from a single index file. If the library&apos;s build is wrong (no <code>sideEffects: false</code>, CommonJS instead of ESM, missing per-component subpaths), the bundler imports the entire library to give you Button.
        </p>

        <CodeBlock lang="plain" caption="Barrel imports, the trap">{`// Looks innocent. Pulls in the entire library if it isn't tree-shakeable.
import { debounce } from "lodash";

// Imports just the function. No surrounding library.
import debounce from "lodash/debounce";

// Modern alternative — ESM-only, tree-shakes correctly.
import { debounce } from "lodash-es";`}</CodeBlock>

        <p>
          The way to spot this is bundle analysis. <code>source-map-explorer</code> on a production build will show you that one named import pulled in 70KB of utility functions you don&apos;t use. The fix is usually one of: switch to deep imports, switch to an ESM-only fork, or replace the dependency.
        </p>

        <h4>moment.js</h4>
        <p>
          Specific call-out because it&apos;s in every legacy app. moment.js is 290KB minified, mostly because of locale data, and it isn&apos;t tree-shakeable. The whole thing ships if you use it. Replace with <code>date-fns</code> (tree-shakeable, ~10KB for typical usage) or <code>dayjs</code> (~7KB). The moment.js team officially recommends migration as of 2020.
        </p>

        <h4>Polyfills for browsers you don&apos;t ship to</h4>
        <p>
          If your <code>browserslist</code> targets &quot;last 2 versions&quot; but your transpiler is configured for IE11, you&apos;re shipping polyfills for browsers no real user has. Audit <code>.browserslistrc</code>; remove anything older than your actual user base. Modern <code>@babel/preset-env</code> with the right targets cuts bundle size meaningfully on its own.
        </p>

        <h4>Dependencies you forgot you added</h4>
        <p>
          A teammate added a chart library for one screen, then deleted the screen. The dependency stayed in <code>package.json</code> and gets bundled wherever it&apos;s imported. Or someone imported a single utility function from a library, but the import wasn&apos;t scoped, so the whole library shipped. Bundle analysis is the only way to see these.
        </p>

        <Callout variant="insight" title="The first tool to install on a slow app">
          <p className="m-0">Before you optimize anything, run <code>@next/bundle-analyzer</code> (or <code>webpack-bundle-analyzer</code> / <code>source-map-explorer</code> for non-Next stacks). The output is a treemap showing exactly which packages account for which bytes of your bundle. The first run on a typical neglected app reveals 30-50% of bundle size from things nobody knew were in there. Optimization without measurement is guessing.</p>
        </Callout>

        <h3>Code splitting, the other half of the answer</h3>
        <p>
          You can&apos;t get under 170KB if your entire app is in one bundle. The whole codebase doesn&apos;t need to ship for the user to see the home screen. Code splitting breaks the bundle into chunks loaded on demand.
        </p>

        <h4>Route-level splitting</h4>
        <p>
          Every modern framework does this automatically. Next.js with the App Router or Pages Router builds one chunk per route, visiting <code>/profile</code> downloads only the profile page&apos;s JS, plus the shared framework code. SvelteKit, Remix, Nuxt, same model. If you&apos;re using a framework, you have route-level splitting for free; the question is whether your routes are coarse enough.
        </p>

        <h4>Component-level splitting</h4>
        <p>
          Below the route, you can split heavy components that aren&apos;t needed on first paint. <code>React.lazy</code> + <code>Suspense</code> turns an import into an async chunk. Charting libraries, rich text editors, modals that only open after a user action, all great candidates.
        </p>

        <CodeBlock lang="plain" caption="Component-level splitting in React">{`// Eagerly loaded — adds 80KB to every page load.
import HeavyChart from "@/components/HeavyChart";

export function Dashboard() {
  return <HeavyChart data={data} />;
}

// Lazy-loaded — only fetched when the chart actually renders.
import { lazy, Suspense } from "react";
const HeavyChart = lazy(() => import("@/components/HeavyChart"));

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}

// Next.js equivalent — same idea, framework-aware.
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // skip SSR if the chart needs window/document
});`}</CodeBlock>

        <p>
          The judgment call: <strong>don&apos;t code-split things that always render on first paint</strong>. The header, the article body, the primary CTA, splitting these adds a network round trip without saving any bytes the user doesn&apos;t need. Save splitting for genuinely conditional components: modals, charts behind a tab, an editor inside a settings page.
        </p>

        <h3>Measuring bundle size</h3>
        <p>
          Three flavors, in increasing depth:
        </p>
        <ul>
          <li><strong>Build output</strong>, <code>next build</code> prints the size of every route&apos;s chunk plus the shared chunk. This is your dashboard. Watch it; if a PR adds 50KB to the shared chunk, you want to know why before merging.</li>
          <li><strong>Bundle analyzer</strong>, <code>@next/bundle-analyzer</code> generates an interactive treemap. Used when the build output number jumps and you need to see what changed.</li>
          <li><strong><code>source-map-explorer</code></strong>, module-level breakdown of your built JS using sourcemaps. More precise than the bundle analyzer for understanding what specific functions inside a library account for which bytes.</li>
        </ul>

        <CodeBlock lang="plain" caption="Reading next build output">{`Route (app)                              Size     First Load JS
┌ ○ /                                   1.2 kB    87.3 kB
├ ○ /about                              456 B     86.5 kB
├ ƒ /profile/[id]                       3.1 kB    92.4 kB
└ ○ /search                             4.8 kB    93.7 kB
+ First Load JS shared by all                     86.0 kB
  ├ chunks/main-abc.js                            42.1 kB
  └ chunks/framework-def.js                       43.9 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand`}</CodeBlock>

        <p>
          The number that matters is &quot;First Load JS&quot;, that&apos;s what the user downloads on the initial page visit. The size column on each route is the additional bytes for that route. The shared chunk is the framework + your shared code; everything imports it once and then it&apos;s cached. <strong>The shared chunk is your real budget</strong>, it&apos;s on every page load.
        </p>

        <h3>The senior workflow on a slow app</h3>
        <ol>
          <li><strong>Measure first.</strong>{" "}Bundle analyzer on a production build. Don&apos;t optimize without seeing the actual bytes.</li>
          <li><strong>Spot the easy wins.</strong>{" "}moment.js, lodash without scoped imports, polyfills for browsers you don&apos;t target. These are 50KB+ each, no architecture changes needed.</li>
          <li><strong>Find duplicates.</strong>{" "}Two versions of React because of a transitive dependency. Two date libraries because two teams disagreed. <code>npm dedupe</code>, then if it persists, the bundle analyzer will show two entries with similar names.</li>
          <li><strong>Code-split the heavy components on conditional paths.</strong>{" "}Modals, settings pages, anything behind a tab.</li>
          <li><strong>Set a budget in CI.</strong> <code>bundlesize</code> or framework-native size checks. If a PR pushes the shared chunk over 150KB, the build fails. The point isn&apos;t to be strict, it&apos;s to make growth visible before it ships.</li>
        </ol>

        <Callout variant="warn" title="The thing senior engineers ship that mid-level engineers don't">
          <p className="m-0">A bundle size budget in CI. The reason apps end up at 1.5MB isn&apos;t one bad decision; it&apos;s 200 small ones, each invisible. A budget makes growth a thing teams discuss before merging. Without it, every PR adds 5KB &quot;just for now&quot; and a year later you&apos;re at 800KB over budget with nobody to blame.</p>
        </Callout>

        <Quiz
          question={`A team's bundle has grown from 240KB to 670KB over the last six months. The product hasn't 3x'd in size. What's the highest-leverage first action?`}
          kind="Quick check"
          options={[
            { label: "Run a bundle analyzer to see what's actually in the bundle. Don't guess at fixes, find out which dependencies account for the bytes, then decide whether to remove, replace, or split each one.", correct: true, explanation: "Right. Bundle bloat is almost always a small number of dependencies dominating the size, and you can't fix them without seeing them. The analyzer reveals which package is 80KB and whether it's something you can remove (unused), replace (moment → date-fns), or split (chart library only on one route). Skipping measurement and going straight to 'we'll code-split everything' wastes effort on the wrong problems." },
            { label: "Code-split every route and lazy-load every component.", explanation: "This thrashes the codebase without addressing why the bundle grew. If the bloat is from one dependency, splitting doesn't help. If it's from polyfills, splitting doesn't help. Measurement first, then targeted fixes." },
            { label: "Switch from webpack to Vite for a faster build.", explanation: "Build speed and bundle size are different problems. Vite has nice DX but doesn't magically make your moment.js smaller. The bundle is the problem; the bundler is fine." },
            { label: "Move heavy logic to a backend endpoint to reduce client code.", explanation: "Sometimes a real fix, but you can't tell until you know what 'heavy logic' is in the bundle. The analyzer tells you." },
          ]}
          hint="What's the cheapest way to find out where the bytes went?"
          xp={8}
        />

        <PartRecap
          title="Part 4 recap"
          gist="The hidden frontend budget: ~170KB of compressed JS for first paint on 3G. Most apps are 5-10x over without realizing. The cure is measurement (bundle analyzer), targeted fixes (kill moment.js, scope imports, audit deps), code splitting at the right granularity, and a CI budget that makes growth visible."
          points={[
            { takeaway: "170KB is the real number for a 3G first-paint budget", detail: "Combines TCP slow start, 3G bandwidth, parse cost on a median Android, and a 3-second interactivity target. Above this, the math doesn't close, slow paint and slow INP follow." },
            { takeaway: "Measure before optimizing", detail: "@next/bundle-analyzer or source-map-explorer on a production build. Bundle bloat is almost always a small number of dependencies; you can't fix them without seeing them." },
            { takeaway: "Code-split the conditional paths, not the critical path", detail: "Route-level splitting is automatic in modern frameworks. Component-level: lazy-load modals, charts, editors that aren't needed on first paint. Don't split the always-rendered components, you add round trips for nothing." },
            { takeaway: "Bundle budget in CI prevents drift", detail: "Bloat happens 5KB at a time. A size check on the shared chunk in CI surfaces growth at the PR that caused it, when it's still cheap to fix." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-fundamentals" id="state" title="Part 5 · State architecture, server state vs client state" xp={25}>
        <h2>Not all state is created equal</h2>
        <p>
          The single biggest mental model shift in modern frontend, and the one that retires half of every legacy Redux store. The shorthand: <strong>server state and client state are different problems and need different tools</strong>. Confusing them is why every team that ran &quot;everything goes in Redux&quot; ended up with 60% of their code being refetch logic, retry logic, cache invalidation, and stale-while-revalidate they wrote by hand and got mostly wrong.
        </p>

        <h3>Two kinds of state</h3>

        <h4>Server state</h4>
        <p>
          Data whose source of truth lives on a server. Your local copy is a cache of someone else&apos;s data. Examples: the current user&apos;s profile, a list of posts, search results, the cart contents (if persisted server-side), the count of unread notifications.
        </p>
        <p>
          Server state has properties client state doesn&apos;t:
        </p>
        <ul>
          <li>It can be <strong>stale</strong>, someone else can change it without you knowing.</li>
          <li>It needs to be <strong>fetched</strong>, with loading and error states.</li>
          <li>It can be <strong>refetched</strong>{" "}on focus, on reconnect, on a polling interval, or on a mutation.</li>
          <li>It supports <strong>optimistic updates</strong>, render the predicted result, fall back if the server rejects.</li>
          <li>It needs <strong>retry</strong>{" "}on transient failure (network blip, 503).</li>
          <li>Multiple components viewing the same data should <strong>share one cache entry</strong>, not refetch independently.</li>
        </ul>

        <h4>Client state</h4>
        <p>
          Data whose source of truth lives in the browser. UI ephemera: is this modal open, what&apos;s in this form input, what&apos;s the current theme, which tab is selected, which items did the user select for bulk action. These exist only because of UI; closing the tab loses them and that&apos;s often correct.
        </p>
        <p>
          Client state has none of the server-state complications: it can&apos;t be stale (you wrote it), it doesn&apos;t need fetching, it doesn&apos;t need retries. It needs to be readable, writable, and shareable across components, and that&apos;s it.
        </p>

        <h3>The mistake: server state in Redux</h3>
        <p>
          Pre-2020, the standard React app put everything in Redux. The pattern looked like this:
        </p>

        <CodeBlock lang="plain" caption="The classic Redux server-state pattern (don't write this in 2024)">{`// actions
export const fetchPosts = () => async (dispatch) => {
  dispatch({ type: "POSTS_LOADING" });
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error("failed");
    const posts = await res.json();
    dispatch({ type: "POSTS_LOADED", posts });
  } catch (err) {
    dispatch({ type: "POSTS_ERROR", err: err.message });
  }
};

// reducer
const postsReducer = (state = { items: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case "POSTS_LOADING": return { ...state, loading: true, error: null };
    case "POSTS_LOADED":  return { items: action.posts, loading: false, error: null };
    case "POSTS_ERROR":   return { ...state, loading: false, error: action.err };
    default: return state;
  }
};

// component
function PostList() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(s => s.posts);
  useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);
  if (loading) return <Spinner />;
  if (error) return <Error msg={error} />;
  return <ul>{items.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}`}</CodeBlock>

        <p>
          That&apos;s 30 lines per resource, and it doesn&apos;t handle: deduplicating concurrent requests, refetching on window focus, cache invalidation after a mutation, retries on 5xx, optimistic updates, garbage collection of unused data. Every team that built this eventually built all of those, badly. The result is the React Query feature set, hand-rolled, scattered across the codebase, with bugs.
        </p>

        <h3>The fix: a server-state library does the work</h3>
        <p>
          React Query (now TanStack Query), SWR, and RTK Query each do the same job: they&apos;re caches with built-in fetching, retry, refetch, invalidation, and optimistic update support. The component side becomes:
        </p>

        <CodeBlock lang="plain" caption="The same feature with React Query">{`function PostList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetch("/api/posts").then(r => r.json()),
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error msg={error.message} />;
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

// Mutation that invalidates the cache so the list refetches.
function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(\`/api/posts/\${id}\`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}`}</CodeBlock>

        <p>
          That&apos;s the entire feature. Loading state, error state, deduplication of concurrent requests, refetch on focus, cache invalidation after delete, all of it&apos;s built in. Every component that calls <code>useQuery({`{ queryKey: ["posts"] }`})</code> shares the same cache entry; if 10 components mount at once, one fetch happens.
        </p>

        <h3>Client state: the lighter answer</h3>
        <p>
          For UI state, the question is just &quot;how widely shared is it?&quot; Three tiers:
        </p>
        <ul>
          <li><strong>Component-local</strong> (<code>useState</code>), state used by exactly one component. Form inputs, hover state, &quot;is this dropdown open.&quot; The vast majority of UI state.</li>
          <li><strong>Lifted/Context</strong>, state shared across a subtree. Theme, auth user, current locale. <code>useContext</code> handles it; the cost is that every consumer re-renders on any change, so don&apos;t put fast-changing state here.</li>
          <li><strong>Global store</strong> (Zustand, Jotai, Redux for the legacy stack), state shared across the whole app, possibly with derived selectors and middleware. Rare; use it when you actually have it. &quot;Is the sidebar collapsed,&quot; persisted across navigations, with multiple unrelated subtrees reading it, is a Zustand-shaped problem.</li>
        </ul>
        <p>
          The modern stack on a typical app: <strong>React Query for server state + useState/Context for most client state + Zustand for the small slice of genuinely global UI state</strong>. Redux exists for legacy apps and the few cases where its middleware ecosystem (devtools, time-travel, replay) earns it. Most new apps don&apos;t need it.
        </p>

        <h3>The decision question that retires half your store</h3>
        <p>
          When you reach for a state lib, ask: <strong>is the source of truth a remote API?</strong>
        </p>
        <ul>
          <li><strong>Yes</strong> → server state lib. React Query, SWR, RTK Query. Don&apos;t put it in Redux/Zustand.</li>
          <li><strong>No, but it&apos;s used across many components</strong> → Context, or Zustand if you also need fine-grained subscriptions or middleware.</li>
          <li><strong>No, and it&apos;s used by one component</strong> → <code>useState</code>.</li>
        </ul>

        <Callout variant="insight" title="The fourth kind of state nobody talks about: URL state">
          <p className="m-0">Some &quot;client state&quot; really belongs in the URL: the current search query, the active filter, the open tab, the page number. Putting it in <code>useState</code> means refresh resets it, share-link doesn&apos;t work, back button doesn&apos;t work. URL state is its own tier, use <code>searchParams</code> in the URL, derive component state from it, and the URL becomes shareable + bookmarkable + back-button-correct for free. Modern routers (Next.js App Router, TanStack Router) make this cheap.</p>
        </Callout>

        <h3>Optimistic updates with React Query</h3>
        <p>
          Pulling a thread from the API design module: optimistic UI needs the cache to update predictively. React Query&apos;s mutation hooks have a clean pattern:
        </p>

        <CodeBlock lang="plain" caption="Optimistic 'like' button with React Query">{`function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      fetch(\`/api/posts/\${postId}/like\`, { method: "POST" }),

    onMutate: async (postId) => {
      // Cancel in-flight refetches so they don't overwrite our prediction.
      await qc.cancelQueries({ queryKey: ["post", postId] });

      // Snapshot the previous state so we can roll back on error.
      const previous = qc.getQueryData<Post>(["post", postId]);

      // Optimistically update the cache.
      qc.setQueryData<Post>(["post", postId], (old) =>
        old ? { ...old, liked: !old.liked, likeCount: old.likeCount + (old.liked ? -1 : 1) } : old
      );

      return { previous };
    },

    onError: (_err, postId, context) => {
      // Roll back on failure.
      if (context?.previous) qc.setQueryData(["post", postId], context.previous);
    },

    onSettled: (_data, _err, postId) => {
      // Resync with the server's canonical answer.
      qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}`}</CodeBlock>

        <p>
          Three things make this work: <code>onMutate</code> applies the optimistic change, <code>onError</code> rolls it back if the server rejects, <code>onSettled</code> resyncs to the real answer. The component just calls <code>mutate(postId)</code> and the cache does the rest. Try writing this in Redux and the line count makes the case for itself.
        </p>

        <Callout variant="warn" title="The anti-pattern: putting server state in Zustand because Zustand is simple">
          <p className="m-0">Zustand is a great client-state library and a bad server-state library, it has no built-in fetch, no cache invalidation, no refetch-on-focus, no deduplication. Teams sometimes reach for it because &quot;Redux feels heavy and React Query feels magic.&quot; You&apos;ll rebuild React Query badly inside Zustand. If the data&apos;s source of truth is a server, use a server-state library; that&apos;s what they exist for.</p>
        </Callout>

        <h3>Where this ties back to the rest of the module</h3>
        <p>
          State architecture isn&apos;t isolated. It interacts with everything else this module covered:
        </p>
        <ul>
          <li><strong>Rendering</strong>, RSC and Next.js App Router blur the line between &quot;server state&quot; and &quot;page data.&quot; Data fetched in a server component never enters the client cache; data fetched in a client component does. Knowing which is which saves bundle bytes (server-component code never ships) and changes the right tool to reach for.</li>
          <li><strong>Vitals</strong>, INP regressions often trace back to over-broad state subscriptions. A Context that stores fast-changing state will re-render every consumer; splitting the state or migrating to a fine-grained selector library (Zustand, Jotai) is the fix.</li>
          <li><strong>Bundle</strong>, Redux + the Redux Toolkit ecosystem is ~30KB after tree-shaking. React Query is ~13KB. Zustand is ~1KB. The state lib choice shows up in your shared bundle.</li>
        </ul>

        <Quiz
          question={`A team's app uses Redux for everything, including a list of products fetched from /api/products. They report that when a user updates a product on the detail page, the list page still shows the old data until manual refresh. What's the senior fix?`}
          kind="Quick check"
          options={[
            { label: "Migrate the products list to React Query (or RTK Query). Invalidate the products query on a successful product update, the list refetches automatically. The 'sync stale data' problem is what server-state libs solve out of the box.", correct: true, explanation: "Right. The bug is the symptom of treating server state as client state, there's no cache invalidation contract, so updates have to be threaded by hand through every place the data lives. Server-state libs make invalidation a one-liner per mutation, and every consumer of the same query key resyncs automatically." },
            { label: "Add a useEffect on the list page that refetches when the route is focused.", explanation: "This patches the specific bug but adds a refetch-on-focus mechanism by hand for one query. Multiply by every list/detail pair in the app and you've reimplemented React Query, badly. The right answer is moving to a tool that handles this generically." },
            { label: "Dispatch a UPDATE_PRODUCT_IN_LIST action from the detail page after a successful update.", explanation: "Works for this one case, but every mutation now has to know every place its data is duplicated. The list page also has filters, sort orders, paginated fetches, keeping all of that in sync by dispatching from mutations becomes a maintenance disaster. Cache invalidation by query key is what scales." },
            { label: "Use server-sent events to push the update to the list page in real time.", explanation: "Real-time push is the right answer if you actually need real-time multi-user updates. For a single user editing their own product and seeing it on the list, it's overkill, the fix is just resyncing the cache after the mutation, which a server-state lib does in one line." },
          ]}
          hint="The bug is that no contract exists for 'this query is now stale.'"
          xp={8}
        />

        <Quiz
          question={`A senior engineer is reviewing a PR that adds a Zustand store for "the current logged-in user." The store has fields for the user's profile, their notification count, and a list of their recent orders, all fetched from the backend on login. What should the reviewer push back on?`}
          kind="Quick check"
          options={[
            { label: "All three fields are server state, they live on the backend and can change without the client knowing. Profile updates, new notifications, new orders all need refetch/invalidation logic that Zustand doesn't provide. They belong in React Query (or similar), not in a Zustand store.", correct: true, explanation: "Right. The reviewer's job is catching the category error, server state in a client-state library means rebuilding cache invalidation, refetching, and stale-data handling by hand. The fix is moving these to a server-state lib, where each is a useQuery with sensible refetch policies. Zustand can stay for genuinely-client state (sidebar collapsed, theme, draft form contents)." },
            { label: "The store is fine; just add explicit refetch calls everywhere the user might have changed.", explanation: "This is exactly the trap, recreating React Query inside Zustand by hand. The PR will work for the happy path and fail at every place the team forgets to add a refetch (other tabs, focus, after a mutation, after a network reconnect)." },
            { label: "The PR should split the user object into separate stores so each piece can be updated independently.", explanation: "Splitting the store doesn't change the underlying problem: it's still server state in a client-state library. The category mismatch persists." },
            { label: "Zustand is the wrong choice; it should be Redux because Redux has middleware support.", explanation: "Redux/Zustand is a sideshow, both are client-state libraries. Neither is the right home for data whose source of truth is a backend." },
          ]}
          hint="What property of all three fields makes them the same kind of state?"
          xp={8}
        />

        <PartRecap
          title="Part 5 recap"
          gist="Server state and client state are different problems. Server state needs caching, fetching, retry, refetch, invalidation, use a server-state library (React Query, SWR, RTK Query). Client state is just UI ephemera, useState/Context/Zustand is plenty. The decision question: 'is the source of truth a remote API?' If yes, you don't want it in Redux."
          points={[
            { takeaway: "The mental shift: server state is a cache, not state", detail: "Your local copy is one of many, it can go stale, it needs refetching, it needs invalidation when mutations happen. Treating it like client state is why pre-2020 Redux apps had so much hand-rolled fetch logic." },
            { takeaway: "Server-state libs handle the boilerplate", detail: "React Query / SWR / RTK Query give you loading, error, retry, refetch-on-focus, dedup of concurrent requests, optimistic updates, and cache invalidation in one consistent API. The component code shrinks 5-10x." },
            { takeaway: "Client state has tiers, pick the lightest one that works", detail: "useState for component-local. Context for subtree-shared. Zustand/Jotai for app-wide UI state with fine-grained subscriptions. Don't reach for the heavy tool first." },
            { takeaway: "URL state is its own tier", detail: "Search query, active filter, open tab, page number, these belong in the URL, not in client state. Refresh works, share-links work, back button works. searchParams + derive-state-from-URL is the pattern." },
            { takeaway: "The decision question retires half your store", detail: "Is the source of truth a remote API? If yes, server-state library. If no but shared widely, Context or Zustand. If no and component-local, useState. Apply this rule and most legacy stores get visibly smaller." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Worked example: pick the rendering strategy + state architecture for 8 surfaces</h2>
        <p>
          Time to assemble the pieces. Below are eight product surfaces; classify each by the rendering strategy you&apos;d ship. The right answers reflect the real call you&apos;d make in an interview, not the textbook ideal, sometimes the best answer is &quot;CSR with a shimmer skeleton&quot; because the org has no SSR infrastructure, but here we&apos;re grading on the architectural fit.
        </p>

        <ClassifyChallenge
          title="Pick the rendering strategy for each surface"
          prompt="Each surface has a profile: personalized or not, freshness needs, SEO sensitivity, and traffic shape. Drop each into the bucket that fits best."
          buckets={[
            { id: "csr", label: "CSR", color: "rose" },
            { id: "ssr", label: "SSR", color: "amber" },
            { id: "ssg", label: "SSG", color: "emerald" },
            { id: "isr", label: "ISR", color: "indigo" },
          ]}
          items={[
            { id: "marketing", label: "A SaaS marketing landing page. Identical for everyone, updated on launches, must rank on Google, Lighthouse score is the CMO's KPI.", answer: "ssg", explanation: "Non-personalized + SEO-critical + edited on a release cadence (not minute-by-minute). SSG gives unbeatable edge latency and the build cost is fine for a small page count. ISR would also work but is overkill when there's no per-page invalidation need." },
            { id: "dashboard", label: "An internal admin dashboard behind SSO login. No SEO. Heavy interactivity (tables, filters, bulk actions). Internal users only.", answer: "csr", explanation: "Authenticated, no SEO requirement, complex stateful UI. SSR adds server cost for a paint speedup that internal users won't notice (they don't visit cold often). CSR with a server-state lib is the simplest, cheapest, fastest-to-build answer." },
            { id: "blog", label: "A company blog with 800 posts. Each post updates rarely (typo fixes, author corrections). Heavy SEO emphasis. Editors need changes live within minutes.", answer: "isr", explanation: "Non-personalized content, SEO matters, occasional edits. SSG would force a full rebuild on every typo fix. ISR's per-page revalidate-on-webhook gives you SSG speed plus on-demand updates without redeploying." },
            { id: "product", label: "An e-commerce product page. Personalized prices and recommendations per user. SEO matters (Google indexes product pages). Inventory and pricing change live.", answer: "ssr", explanation: "Personalized + SEO-required + freshness-required. SSG can't handle personalization. ISR can't handle real-time inventory. CSR loses the SEO signal. SSR is the fit, pay the per-request server cost in exchange for personalized HTML at first paint." },
            { id: "ticker", label: "A real-time stock ticker showing live prices for the user's watchlist. Personalized, updates every second, no SEO need.", answer: "csr", explanation: "Authenticated (watchlist is per-user), live-streaming data, no SEO. The value is in the live feed, not the first paint. CSR with a WebSocket connection is the right shape, the initial paint can show 'connecting...' or last-known prices from cache." },
            { id: "search", label: "A search results page on a public-facing site. Pages are crawled by Google with their query parameters. Results vary per query.", answer: "ssr", explanation: "SEO matters (Google indexes search pages), the result varies per query so SSG/ISR can't pre-render them at build time, and the result needs to appear fast to users arriving from search. SSR is the fit, render per-query, cache hot queries at the CDN with short TTLs if needed." },
            { id: "news", label: "A news article page on a high-traffic news site. Articles are published and rarely edited after. SEO is the primary traffic source. Some articles get massive bursts.", answer: "isr", explanation: "Non-personalized, SEO-critical, edited rarely after publish. ISR + on-demand revalidation handles correction edits without rebuilding the site, and the edge cache absorbs traffic bursts. SSG would also work for the post-publish stable state but is brittle for the 'fix a typo on a viral article' workflow." },
            { id: "settings", label: "A user settings page behind login. Renders the user's current preferences, saves changes via API, no SEO need.", answer: "csr", explanation: "Authenticated, personal data, no SEO. Could be SSR for a faster first paint, but settings pages are infrequent visits and the user has accepted login latency anyway. CSR with a server-state lib for the preferences fetch is simpler and the perceived-speed difference is negligible for this surface." },
          ]}
        />

        <p>
          Two themes from the answers, both worth internalizing:
        </p>
        <ol>
          <li><strong>Personalization is the watershed.</strong>{" "}Once a page varies per user, SSG and ISR are out, you need either SSR or CSR. Beyond that, SEO and freshness pick between them.</li>
          <li><strong>The default for non-personalized public content is ISR, not SSG.</strong>{" "}ISR is a strict superset of SSG&apos;s capabilities (it falls back to SSG behavior with infinite TTL) and removes the &quot;rebuild the world to fix a typo&quot; failure mode. Most modern frameworks make ISR the default; that&apos;s why.</li>
        </ol>
      </section>

      <section>
        <h2>Wrapping up</h2>
        <p>
          Frontend system design is a different muscle than backend system design, the constraints flip and the toolkit changes, but the discipline is the same. Pick numbers and defend them. Measure before optimizing. Match the tool to the problem instead of the other way around. The four calls in this module, rendering, vitals, bundles, state, are the foundation. Every frontend system design interview at a senior level walks through some version of these.
        </p>
        <p>
          The next module applies this lens to the feed archetype: virtualization for huge lists, infinite scroll without breaking pagination, optimistic likes, image loading at scale. Same tools, harder problem.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 dark:border-fuchsia-900 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Design a feed UI, the archetype that probes virtualization, infinite scroll, optimistic updates, and image loading. Twitter-scale list rendering without melting the main thread.
        </p>
        <Link
          href="/courses/system-design/modules/frontend-design-feed"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-fuchsia-600 hover:to-pink-600 hover:shadow-md"
        >
          Continue to Design a feed UI →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="frontend-fundamentals" />
    </article>
  );
}
