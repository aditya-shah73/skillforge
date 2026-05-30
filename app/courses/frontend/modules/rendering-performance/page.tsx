import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rendering-performance";

const CHECKPOINTS = [
  { id: "cp-vitals", title: "The three Core Web Vitals" },
  { id: "cp-bundle", title: "Code-splitting, lazy loading & hydration" },
  { id: "cp-measure", title: "Measure first, images & fonts" },
];

export default function RenderingPerformanceModule() {
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
          Rendering &amp; bundle performance — Core Web Vitals and what actually moves them
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          &quot;Make it faster&quot; is not a task — it&apos;s a guess. The engineers who actually move the needle do one thing first:
          they measure, find the <em>single</em> biggest offender, fix that, and prove the number changed. Everything else is
          shotgun optimization that adds complexity and moves nothing.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The restaurant that feels slow</h2>
        <p className="mb-4">
          Imagine a diner complaining that a restaurant is &quot;slow.&quot; That single word hides three completely different
          experiences. Maybe the food took forever to <em>arrive</em> at the table. Maybe the table kept <em>wobbling</em> as
          dishes were rearranged, so they spilled their drink reaching for the wrong plate. Or maybe they waved at the waiter and
          there was a long, awkward pause before anyone <em>responded</em>.
        </p>
        <p className="mb-4">
          Those are three separate problems with three separate fixes. A faster kitchen does nothing for a wobbly table. A stable
          table does nothing for a slow waiter. If you only had the word &quot;slow,&quot; you&apos;d optimize blindly and probably
          fix the wrong thing.
        </p>
        <p className="mb-4">
          Google&apos;s <strong>Core Web Vitals</strong> exist for exactly this reason: they split the vague feeling of &quot;slow&quot;
          into three measurable experiences. <strong>LCP</strong> is how long until the main content arrives. <strong>CLS</strong>{" "}
          is how much the page wobbles as it loads. <strong>INP</strong> is how quickly the page responds when you interact.
          Naming the three lets you measure each one and fix the right one.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            Performance work is detective work, not heroics. The skill is <em>diagnosis</em>: turning &quot;the page is slow&quot;
            into &quot;LCP is 4.2 seconds because the hero image is an un-optimized 2&nbsp;MB PNG loaded after the bundle.&quot;
            Once you can name the metric and the cause, the fix is usually small. The whole discipline below is built on measuring
            before you touch anything.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. THE THREE VITALS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The three Core Web Vitals, precisely</h2>
        <p className="mb-4">
          Each vital measures a different moment in the user&apos;s experience. Know what each one is, the &quot;good&quot;
          threshold, and the typical cause — that trio is the interview answer.
        </p>
        <ul className="mb-4 list-disc space-y-3 pl-6">
          <li>
            <strong>LCP — Largest Contentful Paint.</strong> The time until the largest visible element (usually a hero image, a
            big heading, or a video poster) finishes rendering. It answers &quot;when did the main content show up?&quot;
            <strong> Good is ≤ 2.5&nbsp;s.</strong> Usual offenders: a huge un-optimized image, render-blocking CSS/JS, a slow
            server response (TTFB), or content that waits on client-side JavaScript before it can paint.
          </li>
          <li>
            <strong>CLS — Cumulative Layout Shift.</strong> A unitless score for how much visible content <em>jumps around</em>{" "}
            as the page loads. It answers &quot;did the page stay stable?&quot; <strong>Good is ≤ 0.1.</strong> Usual offenders:
            images and ads with no reserved dimensions, a web font swapping in and re-flowing text, or content injected above
            what the user is already reading.
          </li>
          <li>
            <strong>INP — Interaction to Next Paint.</strong> Measures responsiveness: across the whole visit, how long between a
            user interaction (tap, click, keypress) and the next frame that visibly responds. It answers &quot;is the page
            sluggish when I use it?&quot; <strong>Good is ≤ 200&nbsp;ms.</strong> Usual offenders: long JavaScript tasks blocking
            the main thread, expensive re-renders, and heavy work done synchronously in event handlers. INP replaced the older FID
            (First Input Delay) as a Core Web Vital in 2024 because it measures <em>every</em> interaction, not just the first.
          </li>
        </ul>
        <Callout variant="insight" title="The one-line mnemonic">
          <p>
            <strong>LCP = how fast it loads. CLS = how stable it is. INP = how responsive it feels.</strong> Load, stability,
            responsiveness. If you can say which of the three a complaint maps to, you already know which lever to pull.
          </p>
        </Callout>
        <p className="mb-4">
          A critical distinction interviewers probe: <strong>field data vs lab data.</strong> Tools like Lighthouse run a single
          simulated load on your machine — that&apos;s <em>lab</em> data, great for debugging and reproducible. Core Web Vitals as
          Google actually scores them come from <em>field</em> data (the Chrome User Experience Report — real visits on real
          devices and networks). A green Lighthouse score on your fast laptop can still be a failing field score on a mid-range
          phone. Lab data tells you <em>what to fix</em>; field data tells you <em>whether it mattered</em>.
        </p>
      </section>

      {/* ───────────────────────── 3. RENDER VS NETWORK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Render problem or network problem? (the first fork)</h2>
        <p className="mb-4">
          Before optimizing anything, decide which of two worlds the problem lives in — they have completely different fixes:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Network problem.</strong> The bytes take too long to arrive: a slow server, a giant JavaScript bundle, an
            un-optimized image, no compression, blocking resources. Fixes live in <em>what and how much you ship</em>:
            code-splitting, image optimization, caching, CDN, smaller dependencies. These dominate LCP.
          </li>
          <li>
            <strong>Render/CPU problem.</strong> The bytes arrived fine, but the main thread is busy: a huge component tree
            re-rendering, an expensive computation in an event handler, layout thrash. Fixes live in <em>the work the browser
            does</em>: memoization, virtualization, breaking up long tasks, doing less on the main thread. These dominate INP.
          </li>
        </ul>
        <p className="mb-4">
          The DevTools <strong>Performance</strong> panel tells you which: a flame chart dominated by network bars and waiting is a
          network problem; one dominated by long yellow &quot;Scripting&quot; and purple &quot;Rendering&quot; blocks is a CPU
          problem. <em>Confusing the two is the most common way people waste a day:</em> adding <code>useMemo</code> everywhere
          (a render fix) does nothing when the real issue is a 1.5&nbsp;MB image (a network fix).
        </p>
        <Callout variant="warn" title="Memoization is not a performance strategy">
          <p>
            Sprinkling <code>useMemo</code> and <code>useCallback</code> across a component because it &quot;feels slow&quot; is the
            classic junior move. Each one has a cost (storing the value, comparing deps) and most of the time the render was never
            the bottleneck. Profile first. If rendering isn&apos;t in the flame chart&apos;s hot path, memoization is pure overhead.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-vitals" moduleSlug={MODULE_SLUG} title="The three Core Web Vitals">
        <Quiz
          kind="Which vital?"
          question="A user complains that as your article page loads, the text they're reading suddenly jumps down because an image and an ad pop in above it. Which Core Web Vital is failing?"
          options={[
            {
              label: "CLS — Cumulative Layout Shift",
              correct: true,
              explanation:
                "Right. Content jumping around as the page loads is exactly what CLS measures. The fix is reserving space: set width/height (or aspect-ratio) on images and ad slots so they don't shove content when they arrive.",
            },
            {
              label: "LCP — Largest Contentful Paint",
              explanation:
                "LCP measures how long until the main content renders, not how much it moves after rendering. The complaint here is about instability (jumping), which is CLS.",
            },
            {
              label: "INP — Interaction to Next Paint",
              explanation:
                "INP measures responsiveness to user interaction. The user isn't interacting here — the page is shifting on its own as it loads. That's CLS.",
            },
            {
              label: "TTFB — Time To First Byte",
              explanation:
                "TTFB is a server-response timing, not a layout-stability metric, and it isn't one of the three Core Web Vitals. The jumping content is CLS.",
            },
          ]}
        />
        <Quiz
          kind="Lab vs field"
          question="Your Lighthouse run on your laptop shows a green 95 performance score, but Google Search Console reports your page is failing Core Web Vitals. How is that possible?"
          options={[
            {
              label: "Lighthouse is lab data from one simulated load; Core Web Vitals are scored from field data — real users on slower devices and networks",
              correct: true,
              explanation:
                "Exactly. A green lab score on a fast machine doesn't guarantee a passing field score. Lab data tells you what to fix; field data (CrUX, real visits) tells you whether it actually mattered for users.",
            },
            {
              label: "Lighthouse only measures CLS, while Search Console measures all three vitals",
              explanation:
                "Lighthouse measures lab proxies for all the vitals (and more). The discrepancy isn't about which metrics — it's lab vs field: one simulated load on your hardware vs aggregated real-user data.",
            },
            {
              label: "Search Console is simply wrong; the green Lighthouse score is authoritative",
              explanation:
                "Field data is what Google actually ranks on, and it reflects real devices and networks. A green lab score doesn't override a failing field score — it just means your test environment was too forgiving.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. CODE-SPLITTING ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Code-splitting &amp; lazy loading — ship less JavaScript</h2>
        <p className="mb-4">
          The single biggest lever on initial load for a JS-heavy app is usually <strong>how much JavaScript you ship before the
          user can use the page.</strong> By default a bundler may roll everything into one big chunk that must download, parse,
          and execute before anything is interactive. Code-splitting breaks that into pieces loaded on demand.
        </p>
        <p className="mb-4">
          In React the primitive is <code>React.lazy</code> + <code>Suspense</code>: a component is loaded only when it&apos;s
          actually rendered, and <code>Suspense</code> declares the fallback to show while it loads.
        </p>
        <pre><code>{`import { lazy, Suspense } from "react";

// Not bundled into the initial chunk — fetched only when rendered.
const AnalyticsDashboard = lazy(() => import("./AnalyticsDashboard"));

function App({ showDashboard }) {
  return (
    <Suspense fallback={<Skeleton />}>
      {showDashboard && <AnalyticsDashboard />}
    </Suspense>
  );
}`}</code></pre>
        <p className="mb-4">
          The classic places to split: <strong>routes</strong> (each page is its own chunk — you don&apos;t need the settings
          page&apos;s code to render the home page), <strong>heavy below-the-fold features</strong> (a charting library, a rich
          text editor, a map widget), and <strong>modals/dialogs</strong> that most users never open. In Next.js the App Router
          splits by route for you, and <code>next/dynamic</code> is the framework wrapper around lazy loading for components.
        </p>
        <Callout variant="insight" title="Don't split everything — split on a boundary that pays">
          <p>
            Splitting has a cost too: an extra network round-trip for each chunk, and a loading state the user sees. Splitting a
            5&nbsp;KB component that&apos;s always visible just trades a tiny bundle saving for a flash of fallback. Split where the
            chunk is <em>big</em> and <em>not needed for the first paint</em> — that&apos;s where the LCP win is real.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. HYDRATION COST ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The cost of hydration</h2>
        <p className="mb-4">
          Server-rendered apps (SSR, and Next.js by default) send HTML so the page <em>paints</em> fast. But that HTML is static —
          buttons don&apos;t work, state isn&apos;t wired up. <strong>Hydration</strong> is the process where React downloads its
          JavaScript, walks the server-rendered DOM, and attaches event listeners and state to make it interactive.
        </p>
        <p className="mb-4">
          The trap: the user <em>sees</em> the content quickly (good LCP), but the page isn&apos;t actually <em>usable</em> until
          hydration finishes. If you ship a big bundle, there&apos;s a window where the page looks ready but clicks do nothing — and
          that hurts INP and the user&apos;s sense of responsiveness. Hydration cost scales with how much interactive JavaScript you
          ship.
        </p>
        <pre><code>{`// The hydration timeline:
// 1. Server sends HTML        -> user SEES content (paint, good LCP)
// 2. Browser downloads JS bundle
// 3. React hydrates: matches DOM, attaches listeners
// 4. Page is now INTERACTIVE   -> clicks finally work

// The gap between step 1 and step 4 is the "uncanny valley":
// looks ready, isn't ready. Big bundle = wide gap = bad INP.`}</code></pre>
        <p className="mb-4">
          The strategic answer is to <strong>hydrate less</strong>. React Server Components (Phase 7) are the modern lever: a
          Server Component ships <em>zero</em> JavaScript to the client, so it never hydrates. Marking only the genuinely
          interactive leaves as Client Components shrinks the hydration work dramatically. The mental model: every{" "}
          <code>&quot;use client&quot;</code> boundary is JavaScript you&apos;ve committed to downloading and hydrating.
        </p>
        <Callout variant="warn" title="Paint is not interactivity">
          <p>
            A fast LCP can hide a slow INP. The page <em>showing up</em> and the page <em>working</em> are different milestones,
            separated by hydration. When someone says &quot;the page loaded instantly but felt frozen for a second,&quot; that&apos;s
            the hydration gap. The fix is shipping less interactive JS, not making the paint faster.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-bundle" moduleSlug={MODULE_SLUG} title="Code-splitting, lazy loading & hydration">
        <Quiz
          kind="Where to split"
          question="You have a 280 KB rich-text editor that's only shown when a user clicks 'Edit' on a comment — most visitors never do. What's the right move?"
          options={[
            {
              label: "Lazy-load the editor (React.lazy / next/dynamic) so its chunk only downloads when a user actually opens it",
              correct: true,
              explanation:
                "Exactly. It's big and not needed for first paint — the textbook case for code-splitting. The 280 KB stays out of the initial bundle, improving LCP and reducing hydration cost for the majority who never edit.",
            },
            {
              label: "Wrap the editor in useMemo so it's only re-rendered when needed",
              explanation:
                "useMemo affects re-rendering of an already-loaded component; it does nothing about the 280 KB being in the initial bundle. The problem here is network/bundle size, not re-render cost.",
            },
            {
              label: "Leave it in the main bundle — splitting always adds latency, so it's not worth it",
              explanation:
                "Splitting does add a round-trip, but for a 280 KB feature most users never open, keeping it in the initial bundle taxes every visitor. This is precisely where splitting pays off.",
            },
          ]}
        />
        <Quiz
          kind="Hydration"
          question="A server-rendered page paints its content in 1.2s (great LCP) but clicking a button does nothing for another second. What's happening?"
          options={[
            {
              label: "Hydration hasn't finished — the HTML painted fast, but React's JS is still downloading/attaching listeners, so the page looks ready before it's interactive",
              correct: true,
              explanation:
                "Correct. SSR gives a fast paint of static HTML; the page isn't truly usable until hydration wires up state and listeners. The gap between 'looks ready' and 'is ready' is the hydration window — shrink it by shipping less interactive JS.",
            },
            {
              label: "The server is slow; you need to reduce Time To First Byte",
              explanation:
                "TTFB affects when the HTML arrives, but here it paints in 1.2s — the server is fine. The dead-button second is the client-side hydration gap, not a server timing issue.",
            },
            {
              label: "CLS is too high, which blocks click handlers from firing",
              explanation:
                "CLS measures layout shift, not interactivity, and it doesn't block handlers. The dead buttons are a hydration-timing problem.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. IMAGES & FONTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Images and fonts — the two biggest cheap wins</h2>
        <p className="mb-4">
          Images are almost always the heaviest thing on a page, and the hero image is usually the LCP element itself. The wins are
          well-worn and high-impact:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Right format and compression.</strong> Modern formats (WebP/AVIF) are dramatically smaller than JPEG/PNG for the
            same quality. A 2&nbsp;MB hero PNG becoming a 120&nbsp;KB AVIF can shave seconds off LCP by itself.
          </li>
          <li>
            <strong>Right size.</strong> Don&apos;t ship a 3000px image into a 400px slot. Serve responsive sizes (
            <code>srcset</code>) so a phone downloads a phone-sized image.
          </li>
          <li>
            <strong>Reserve dimensions.</strong> Always set width/height (or <code>aspect-ratio</code>) so the image doesn&apos;t
            cause a layout shift when it loads — that&apos;s the CLS fix.
          </li>
          <li>
            <strong>Lazy-load below the fold</strong> (<code>loading=&quot;lazy&quot;</code>), but <em>eagerly</em> load the LCP image
            (don&apos;t lazy-load the hero — that delays the very metric you&apos;re trying to improve).
          </li>
        </ul>
        <p className="mb-4">
          Next.js bundles this into <code>next/image</code>, which does format negotiation, responsive sizing, and dimension
          reservation for you — which is why the framework answer to &quot;optimize images&quot; is usually &quot;use the Image
          component.&quot;
        </p>
        <p className="mb-4">Fonts cause a subtler problem — text that re-flows when a custom font swaps in:</p>
        <pre><code>{`/* font-display controls what shows while a custom font loads */

/* swap: show fallback immediately, swap to custom font when ready.
   Text is visible fast — but the swap can cause a layout shift (CLS). */
@font-face { font-family: "Brand"; src: url(brand.woff2); font-display: swap; }

/* The robust combo:
   - self-host / preload the font so it arrives early
   - use a fallback metrically matched to the real font (size-adjust)
   so the swap doesn't reflow text */`}</code></pre>
        <p className="mb-4">
          The font playbook: <strong>preload</strong> critical fonts, prefer <strong>woff2</strong> (smallest), use{" "}
          <strong>font-display: swap</strong> so text is readable immediately, and pick a fallback whose metrics match the custom
          font so the swap doesn&apos;t shift layout. Next.js&apos;s <code>next/font</code> self-hosts fonts and auto-applies a
          metric-matched fallback to kill the swap-induced CLS.
        </p>
      </section>

      {/* ───────────────────────── 7. MEASURE FIRST ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Measure first — the workflow that actually works</h2>
        <p className="mb-4">
          Every effective performance fix follows the same loop. Skipping the measurement step is how people spend a day optimizing
          something that was never the bottleneck.
        </p>
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>Measure</strong> with a real tool — Lighthouse for an overview, the Performance panel for a flame chart, the
            Network panel for what&apos;s downloading. Get a number.
          </li>
          <li>
            <strong>Find the single biggest offender.</strong> Which vital is worst, and what one thing causes it? (One 2&nbsp;MB
            image. One 400&nbsp;KB dependency. One long task in a handler.) Resist the urge to list ten things.
          </li>
          <li>
            <strong>Fix that one thing.</strong> Lazy-load it, optimize it, split it, defer it.
          </li>
          <li>
            <strong>Re-measure and prove the number moved.</strong> If LCP didn&apos;t change, you fixed the wrong thing — revert
            and re-diagnose. A fix you can&apos;t show in the metrics isn&apos;t a fix; it&apos;s a guess that added complexity.
          </li>
        </ol>
        <Callout variant="insight" title="The senior instinct: one offender at a time">
          <p>
            Amateurs optimize broadly and hope. Seniors find the one dominant cost, fix it, prove it moved, and then re-profile —
            because the biggest offender often changes once you remove the first one. Optimization is iterative measurement, not a
            checklist applied all at once.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do you make a slow front-end faster?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Measure before touching anything.</strong> Lighthouse for an overview, the Performance/Network panels to find
              the one dominant cost. Don&apos;t shotgun-optimize.
            </li>
            <li>
              <strong>Know the three vitals.</strong> LCP (load, ≤ 2.5&nbsp;s), CLS (stability, ≤ 0.1), INP (responsiveness, ≤
              200&nbsp;ms). Map the complaint to one of them.
            </li>
            <li>
              <strong>Render vs network.</strong> Network = ship less (split, optimize images, smaller deps). CPU = do less work on
              the main thread (memoize the real hot path, virtualize, break up long tasks).
            </li>
            <li>
              <strong>Biggest cheap wins:</strong> optimize images (format/size/reserve dimensions), code-split heavy non-critical
              JS, and ship less interactive JS so hydration is cheap.
            </li>
            <li>
              <strong>Prove it.</strong> Re-measure; a fix that doesn&apos;t move the number isn&apos;t a fix.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — diagnose one offender, fix it, prove it</h2>
        <p className="mb-4">
          The discipline you&apos;re building is restraint: find the <em>one</em> biggest Core Web Vital offender, fix only that,
          and prove the score moved. No shotgun optimization.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Run Lighthouse on a slow page.</strong> Pick a page that feels heavy (or build one with an un-optimized hero
            image, a big always-loaded dependency, and a font with no fallback). Record the baseline: LCP, CLS, INP, and the
            overall score. Screenshot it — you&apos;ll compare against this.
          </li>
          <li>
            <strong>Identify the single biggest offender.</strong> Read Lighthouse&apos;s &quot;Opportunities&quot; and
            &quot;Diagnostics,&quot; then open the Network and Performance panels. Decide: is the worst vital a network problem (big
            image / bundle) or a render problem (long task)? Name the one thing causing it.
          </li>
          <li>
            <strong>Fix exactly that one thing.</strong> If it&apos;s the hero image, convert to AVIF/WebP, size it correctly, and
            reserve its dimensions. If it&apos;s a heavy import, lazy-load it with <code>React.lazy</code>/<code>next/dynamic</code>.
            If it&apos;s a long task, defer or break it up. Change nothing else.
          </li>
          <li>
            <strong>Re-measure and prove the move.</strong> Re-run Lighthouse. Did the targeted vital improve? By how much? If it
            didn&apos;t move, you misdiagnosed — revert and look again.
          </li>
          <li>
            <strong>Fix the CLS too, deliberately.</strong> Add reserved dimensions to images and a metric-matched font fallback (or
            <code>next/font</code>). Watch the layout-shift score drop. Confirm the hero is <em>not</em> lazy-loaded.
          </li>
          <li>
            <strong>Stretch — shrink hydration.</strong> Find a chunk of the page that doesn&apos;t need interactivity and make it a
            Server Component (or move <code>&quot;use client&quot;</code> down to the leaves). Confirm the JS bundle shrank in the
            Network tab and the page feels interactive sooner.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            This is the front-end version of profiling a slow endpoint: you don&apos;t add caches and indexes blindly, you find the
            one query in the trace eating the latency budget and fix that. LCP/CLS/INP are your latency percentiles, Lighthouse and
            the Performance panel are your APM trace, and &quot;measure → fix the top offender → re-measure&quot; is the same loop you
            already run on the server. The bottleneck is almost never where intuition says it is — the trace tells you, not your gut.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-measure" moduleSlug={MODULE_SLUG} title="Measure first, images & fonts">
        <Quiz
          kind="Workflow"
          question="You're told a page is slow. Before changing any code, what should you do first?"
          options={[
            {
              label: "Measure with a real tool (Lighthouse / Performance panel) to find the single biggest offender and which vital is worst",
              correct: true,
              explanation:
                "Right. Measurement turns 'slow' into a specific cause and a specific metric. Optimizing before measuring is how you fix the wrong thing and add complexity that moves nothing.",
            },
            {
              label: "Add useMemo and useCallback around the heaviest-looking components",
              explanation:
                "That's a render-side fix applied blindly. If the real problem is a 2 MB image (a network problem), memoization does nothing. Measure first to know whether it's even a render problem.",
            },
            {
              label: "Switch the whole app to a lighter framework",
              explanation:
                "A massive change with no evidence it addresses the actual bottleneck. The first step is always to measure and identify the dominant cost, not to rewrite.",
            },
          ]}
        />
        <Quiz
          kind="LCP image"
          question="Your hero image is the LCP element. Which combination is correct?"
          options={[
            {
              label: "Optimize the format/size, reserve its dimensions to avoid CLS, and load it EAGERLY (don't lazy-load the LCP image)",
              correct: true,
              explanation:
                "Correct. The hero is the very element LCP measures, so lazy-loading it would delay LCP. Optimize and size it, reserve dimensions to prevent shift, but load it eagerly. Lazy-loading is for below-the-fold images.",
            },
            {
              label: "Lazy-load the hero image so the initial bundle is smaller",
              explanation:
                "Lazy-loading the LCP element delays the exact metric you're trying to improve — the browser defers fetching it, so LCP gets worse. Lazy-load below-the-fold images, never the hero.",
            },
            {
              label: "Leave dimensions unset so the image can size itself fluidly to the viewport",
              explanation:
                "Unset dimensions mean the browser doesn't reserve space, so content jumps when the image loads — that's a CLS regression. Always reserve dimensions (width/height or aspect-ratio).",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
