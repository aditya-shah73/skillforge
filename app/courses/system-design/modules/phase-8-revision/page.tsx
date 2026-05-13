import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 20 minutes before a frontend system design interview, not
// to grind through it. This is also the closing card of the course.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase8RevisionModule() {
  const mod = getModuleBySlug("phase-8-revision")!;

  // Reconnect state machine — the picture every senior frontend candidate
  // should be able to draw on a whiteboard when asked "what happens when the
  // websocket drops?". Cap at 30s, jitter ±20%, resync from last sequence.
  const reconnectChart = `
flowchart LR
    CONN["connecting"] -->|open| OPEN["open<br/>(heartbeats every 30s)"]
    OPEN -->|close / pong timeout| WAIT["wait backoff<br/>1s → 2s → 4s → 8s → 30s<br/>± 20% jitter"]
    WAIT -->|timer fires| CONN
    OPEN -->|user navigates away| CLOSED["closed"]
    WAIT -->|tab hidden too long| CLOSED
    CONN -->|error| WAIT
    style OPEN fill:#10b981,color:#fff,stroke:#059669
    style CONN fill:#0ea5e9,color:#fff,stroke:#0284c7
    style WAIT fill:#f59e0b,color:#fff,stroke:#d97706
    style CLOSED fill:#64748b,color:#fff,stroke:#475569
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/system-design"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase {mod.phaseNumber} · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          {mod.title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          {mod.subtitle}
        </p>
        <ModuleProgress moduleSlug="phase-8-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations, this is a map AND a course closer */}
      <section className="not-prose mb-10">
        <Callout variant="insight">
          <strong>This is the closing card of the course.</strong> Phase 8 took the system-design lens you built on the backend (caches, queues, replication, consensus) and rotated it 180° onto the frontend, where the &quot;server&quot; is a 4-year-old Android on coffee-shop wifi and the user is one tab-close away. This module compresses every decision from the three frontend modules into tables and cards you can re-read on the train before a phone screen.
        </Callout>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
          The three modules you&apos;re consolidating: <Link href="/courses/system-design/modules/frontend-fundamentals" className="text-cyan-600 hover:underline">Frontend fundamentals</Link> (rendering, vitals, bundles, state), <Link href="/courses/system-design/modules/frontend-design-feed" className="text-cyan-600 hover:underline">Design a feed UI</Link>, and <Link href="/courses/system-design/modules/frontend-design-realtime" className="text-cyan-600 hover:underline">Design a real-time UI</Link>. If anything below feels unfamiliar, jump back to the source module — this card assumes you&apos;ve already done the work.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Rendering strategies */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Rendering strategies — when each wins</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Five strategies, four properties that decide between them. Get this right early or migrate for a year.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Strategy</th>
                <th className="px-4 py-3 font-semibold">First paint</th>
                <th className="px-4 py-3 font-semibold">Infra cost</th>
                <th className="px-4 py-3 font-semibold">Personalized?</th>
                <th className="px-4 py-3 font-semibold">SEO</th>
                <th className="px-4 py-3 font-semibold">Picks it when…</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">SSG</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fastest (CDN edge, 30-80ms)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Near zero at runtime</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Great</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Marketing, docs, blog — content is identical for every user</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">ISR</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fastest (CDN edge)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Per regen, not per request</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No (or client-side)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Great</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">CMS-driven content sites — non-personal, updates occasionally, big</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">SSR</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fast (1 RTT + ~100-300ms render)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Per request — scales linearly</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Great</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Personalized + SEO matters: search results, product pages, feeds with public URLs</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">Streaming SSR</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fast TTFB (server flushes shell first)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Same as SSR, better perceived</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Great</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">SSR pages with a slow data dep — show shell + Suspense fallback, stream the slow bit when ready</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">CSR</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Slow on first visit (3-6s on 3G)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Tiny (static shell)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bad without extra work</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Behind login: admin tools, dashboards, internal apps — SEO doesn&apos;t matter and user accepts one-time cost</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>The senior frame:</strong> rendering is a function of three properties of the page — <em>personalization</em>, <em>freshness</em>, <em>SEO</em>. Identical-for-everyone + SEO → SSG. Personal + SEO → SSR. Personal + no SEO + complex interactivity → CSR. Add ISR when SSG is right but the build is too slow to redeploy on edit. Add streaming SSR when SSR is right but one data dep is the long pole.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-fundamentals" className="text-cyan-600 hover:underline">Module 46 — Frontend fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Core Web Vitals */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Core Web Vitals — the three numbers you defend</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          p75 of real users. &quot;This adds 80ms to LCP&quot; is a code review conversation. &quot;This feels slow&quot; is not.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">LCP · Largest Contentful Paint</div>
            <p className="font-mono text-sm font-semibold mb-2">good &lt; 2.5s · poor &gt; 4s</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              When the biggest visible element finishes painting — usually the hero image or headline text.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li><strong>Image</strong>: format (WebP/AVIF), responsive srcset, <code>fetchpriority=&quot;high&quot;</code>, preload</li>
              <li><strong>Fonts</strong>: <code>font-display: optional</code>, preload the LCP font</li>
              <li><strong>JS on critical path</strong>: defer/async, don&apos;t block paint</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">INP · Interaction to Next Paint</div>
            <p className="font-mono text-sm font-semibold mb-2">good &lt; 200ms · poor &gt; 500ms</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Replaced FID in March 2024. Latency from any input (tap/click/key) to the next paint reflecting it. Reports the worst, not the first.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li><strong>Reduce JS</strong> — the single biggest INP win</li>
              <li>50ms+ tasks = long tasks; split with <code>scheduler.yield()</code> or a Worker</li>
              <li><code>useTransition</code> for non-urgent updates (filtering big lists while typing)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">CLS · Cumulative Layout Shift</div>
            <p className="font-mono text-sm font-semibold mb-2">good &lt; 0.1 · poor &gt; 0.25</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Unitless score combining shift distance with viewport fraction affected. Visible content jumping around.
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li><strong>Images</strong>: always set width/height (or aspect-ratio)</li>
              <li><strong>Fonts</strong>: match fallback metrics (<code>next/font</code> handles this)</li>
              <li>Reserve space for ads, banners, cookie bars — anything that inserts late</li>
              <li>Animate <code>transform</code> + <code>opacity</code>, never <code>height</code>/<code>top</code></li>
            </ul>
          </div>
        </div>

        <Callout variant="warn">
          <strong>The thing nobody tells you about INP:</strong> on SSR&apos;d pages, the worst INP usually happens during hydration. The page looks ready, the user taps, and the click sits in a queue while the bundle hydrates. RSC and islands aren&apos;t premature optimization — they&apos;re INP fixes for SSR pages.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-fundamentals" className="text-cyan-600 hover:underline">Module 46 — Frontend fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — State architecture */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. State architecture — four buckets, not one</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Half the Redux you&apos;ve seen exists because someone treated all four as the same problem. They&apos;re not.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Bucket</th>
                <th className="px-4 py-3 font-semibold">What it is</th>
                <th className="px-4 py-3 font-semibold">Tools</th>
                <th className="px-4 py-3 font-semibold">Anti-pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Server state</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A cache of data owned by the server. Has staleness, refetching, retries, mutation invalidation.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">React Query, SWR, RTK Query, Apollo</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Storing fetched API responses in Redux/Zustand — you&apos;ll rebuild React Query badly</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Client state</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">UI-only state the browser owns: modal open?, sidebar collapsed?, current step, ephemeral form data shared across screens.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Zustand, Jotai, Redux (sparingly), Context (small + stable)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A single global store with 200 keys — most of them used by one component</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">URL state</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Anything that should survive refresh, share via copy-paste, or appear in back/forward: filters, search query, tab, pagination.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Next.js router, <code>useSearchParams</code>, nuqs</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Filter state in <code>useState</code> — &quot;why doesn&apos;t the back button work?&quot;</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Form state</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Field values, validation errors, touched/dirty, submit state. Lives during the edit, disposed on submit.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">React Hook Form, Formik, TanStack Form</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Controlled inputs in global state — every keystroke re-renders the whole tree</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Decision rule:</strong> colocate state to its consumer. Start in <code>useState</code> next to the component that uses it. <em>Lift only when shared</em>, and only as high as the lowest common ancestor of the consumers. The default mistake is reaching for a global store on day one; the senior move is keeping state local until pain forces it up.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-fundamentals" className="text-cyan-600 hover:underline">Module 46 — Frontend fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Mermaid: reconnect state machine */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. The WebSocket reconnect picture</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A real chat session reconnects 5-50 times. The user never notices because of three things: exponential backoff with jitter, heartbeats, and resync-from-sequence.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={reconnectChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Backoff schedule:</strong> 1s → 2s → 4s → 8s, capped at 30s. The cap stops users waiting forever after long outages. Without a cap, a user who closed their laptop for an hour comes back to a socket that&apos;s about to retry in 70 minutes.
          </li>
          <li>
            <strong>±20% jitter on every attempt.</strong> Without it: gateway restarts → 100k clients all reconnect at exactly t+1s, t+2s, t+4s → you DDoS your own pod the moment it boots. With it: same 100k clients arrive over a 1.6s window. This is the same thundering-herd fix you learned for caches; it applies here too.
          </li>
          <li>
            <strong>Heartbeats:</strong> ping every 30s, expect pong within 10s, otherwise treat the socket as dead and reconnect. TCP&apos;s own dead-connection detection takes minutes. You don&apos;t have minutes.
          </li>
          <li>
            <strong>Resync on reconnect:</strong> send <code>lastSeq</code> on the new connection. Server replays anything past that sequence. Without it, the user reconnects and silently loses every message that arrived during the outage.
          </li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-design-realtime" className="text-cyan-600 hover:underline">Module 48 — Real-time UI</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Feed UI archetype */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Feed UI archetype — the moves that matter</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Twitter, Instagram, LinkedIn, any infinite scroll. Every interview lands on these six concerns.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Virtualization (windowing)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Render only the rows in (or near) the viewport. A 10,000-item list ships ~20 DOM nodes, not 10,000. <code>react-window</code>, <code>@tanstack/react-virtual</code>. <em>Mandatory</em> past ~200 rows.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Infinite scroll</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <code>IntersectionObserver</code> on a sentinel row near the end. When it enters the viewport, fetch the next page. Cursor-based pagination on the API, not offset — page tokens survive inserts at the head.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Optimistic updates + rollback</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              On a like: update local state immediately, fire the mutation, roll back to the prior state on error. React Query&apos;s <code>onMutate</code> + <code>onError</code>. Without rollback, a flaky network leaves the UI lying about server state.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Image loading</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              LQIP (low-quality placeholder, blurhash, or a 10×10 base64), lazy-load with <code>loading=&quot;lazy&quot;</code> for below-fold, <code>srcset</code> + <code>sizes</code> for responsive, AVIF/WebP. The hero image gets <code>fetchpriority=&quot;high&quot;</code>; everything else doesn&apos;t.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Skeleton states</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Show shaped placeholders (same dimensions as real content) during loading. Prevents CLS on data arrival. Avoid spinners on first-load — they signal &quot;wait&quot; instead of progress.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Offline-first read</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Cache feed pages in IndexedDB (or React Query&apos;s persister). On cold start with no network, render cached pages immediately, revalidate in the background. The user sees something instantly — that&apos;s the whole point.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-design-feed" className="text-cyan-600 hover:underline">Module 47 — Feed UI</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Real-time UI archetype */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Real-time UI archetype — connection lifecycle is the heart</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Chat, collab docs, presence cursors, live dashboards. The interviewer cares less about &quot;open a websocket&quot; and more about what happens when it drops.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Transport choice</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
              <strong>WebSocket</strong> — bidirectional, &lt;1ms per frame after the ~200ms handshake. Default for chat, collab.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
              <strong>SSE</strong> — server → client only, auto-reconnect built in (<code>Last-Event-ID</code>). Default for live feeds, notifications, dashboards.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Long-poll</strong> — legacy fallback when WS is blocked by corporate proxies. Don&apos;t reach for it first.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Reconnect (the senior tell)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Exponential backoff (1s → 2s → 4s → 8s, cap 30s) with <strong>±20% jitter</strong> on every attempt. Without jitter, every gateway restart is a self-inflicted DDoS. Send <code>lastSeq</code> on reconnect so the server can replay missed messages.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Presence (heartbeat)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Send a 30s heartbeat; server marks user offline if missed 2x. <em>Don&apos;t</em> implement presence by polling <code>/who-is-online</code> every 5s — it&apos;s a 10-100x multiplier on your message volume. Throttle presence updates server-side: fan out at most every 5s per user.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">Multi-tab sync</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <code>BroadcastChannel</code> for the simple case — fan out received messages to other tabs. For correctness under load, elect a <strong>leader tab</strong> (only one tab holds the WS, others read via BroadcastChannel). A shared <code>SharedWorker</code> or service worker is the cleaner version when the browser supports it.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">CRDT intuition (collab docs)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Conflict-free Replicated Data Types let two clients edit offline and merge without a server arbitrating. The math requires every operation to be <strong>commutative</strong> (order doesn&apos;t matter), <strong>associative</strong> (grouping doesn&apos;t matter), and <strong>idempotent</strong> (applying twice = applying once). Yjs and Automerge are the production options. The senior answer is &quot;I&apos;d reach for Yjs, not implement one&quot; — knowing when and why, not coding it from scratch.
            </p>
          </div>
        </div>

        <Callout variant="warn">
          <strong>The one that bites people:</strong> reconnect without jitter. It works perfectly in dev with one tab open, and takes down production after every deploy. If you only remember one thing from the real-time module, make it &quot;exponential backoff with jitter.&quot;
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/frontend-design-realtime" className="text-cyan-600 hover:underline">Module 48 — Real-time UI</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Common gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Five gotchas that cost real engineers real hours</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each has a clear BAD/GOOD shape. If you remember nothing else, remember these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · CSR for SEO-critical page</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Public landing page that needs Google traffic, rendered client-side. Crawler sees an empty shell; users see 4 seconds of blank screen on cellular.
            </p>
            <CodeBlock lang="tsx">{`// BAD — CSR for a public marketing/SEO page
export default function Landing() {
  const { data } = useQuery(["landing"], fetchLanding);
  if (!data) return null;  // crawler sees nothing
  return <Hero {...data} />;
}

// GOOD — SSG (or SSR, or ISR if it updates from a CMS)
// Next.js App Router default: server component, fetched at build/request time
export default async function Landing() {
  const data = await fetchLanding();
  return <Hero {...data} />;  // HTML ships pre-rendered
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Infinite list without virtualization</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              10,000 items in the DOM. Scroll jank. Memory bloat. Re-render cost on any parent state change is catastrophic.
            </p>
            <CodeBlock lang="tsx">{`// BAD — every item is a DOM node, even the 9,000 off-screen ones
{items.map(item => <Row key={item.id} item={item} />)}

// GOOD — windowed; only ~20 rows in the DOM at any time
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 72,
  overscan: 5,
});

{virtualizer.getVirtualItems().map(v => (
  <Row key={items[v.index].id} item={items[v.index]} style={{ transform: ... }} />
))}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Optimistic update without rollback</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              User likes a post. Local state flips. Network fails. UI keeps lying about server state forever.
            </p>
            <CodeBlock lang="tsx">{`// BAD — no rollback path
function like(id) {
  setLiked(true);                  // optimistic
  api.like(id);                    // fire-and-forget; failure is lost
}

// GOOD — React Query with onMutate + onError
const mutation = useMutation({
  mutationFn: api.like,
  onMutate: async (id) => {
    await queryClient.cancelQueries(["post", id]);
    const prev = queryClient.getQueryData(["post", id]);
    queryClient.setQueryData(["post", id], (old) => ({ ...old, liked: true }));
    return { prev };               // snapshot for rollback
  },
  onError: (_err, id, ctx) => {
    queryClient.setQueryData(["post", id], ctx.prev);  // restore truth
    toast.error("Couldn't like — try again");
  },
  onSettled: (_d, _e, id) => queryClient.invalidateQueries(["post", id]),
});`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · WebSocket without reconnect + jittered backoff</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Works in dev. Production: gateway restarts → 100k clients all reconnect at t+0ms → second-wave outage caused by the recovery from the first.
            </p>
            <CodeBlock lang="ts">{`// BAD — immediate reconnect, no cap, no jitter
ws.onclose = () => connect();   // 100k clients hammer the pod the moment it boots

// GOOD — exponential backoff + jitter + lastSeq for resync
let attempt = 0;
ws.onclose = () => {
  const base = Math.min(30_000, 1000 * 2 ** attempt);   // cap at 30s
  const jitter = base * (0.8 + Math.random() * 0.4);    // ±20%
  setTimeout(() => {
    attempt++;
    connect(\`?since=\${lastSeq}\`);                       // resync missed msgs
  }, jitter);
};
ws.onopen = () => { attempt = 0; };                     // reset on success`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Presence via polling</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Poll <code>/who-is-online</code> every 5s for every user. Network traffic scales as users² for groups. Burns mobile data, drains battery, and the answer is always 30 seconds stale anyway.
            </p>
            <CodeBlock lang="ts">{`// BAD — polling the world every 5s
useEffect(() => {
  const id = setInterval(() => fetch("/api/presence"), 5_000);
  return () => clearInterval(id);
}, []);

// GOOD — heartbeat over the existing WS, server fans out diffs
// Client side: just send a keep-alive
setInterval(() => ws.send(JSON.stringify({ type: "heartbeat" })), 30_000);

// Server pushes presence DIFFS (came online / went offline), not full lists,
// and throttles per-user updates to at most once every 5s.`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="A team is building a public-facing news site. ~5,000 articles, edited by reporters throughout the day, heavy SEO requirement, traffic spikes hard around breaking news. What's the right rendering strategy?"
          options={[
            { label: "ISR — static-fast for the common case via CDN, regenerate on edit via webhook from the CMS.", correct: true, explanation: "Right. Non-personalized + SEO + frequent edits + big = ISR. SSG would force a rebuild on every reporter's edit. SSR pays per-request server cost when 99% of requests could come from the CDN. ISR gets edge latency AND on-demand updates." },
            { label: "SSR — render every request fresh on the server.", explanation: "You can layer CDN caching on SSR, but you've now built ISR badly — no per-page invalidation hooks, no build-time pre-rendering of popular pages, full server cost on every cache miss. ISR is the cleaner answer for this exact shape." },
            { label: "SSG — build all 5,000 articles at deploy time.", explanation: "Works at first, but every breaking-news edit triggers a full rebuild that takes 5+ minutes. Reporters can't deploy a typo fix on a live story. ISR removes that bottleneck." },
            { label: "CSR — fast and cheap, add prerendered meta tags for SEO.", explanation: "News sites live on Google search. CSR's blank-shell-then-fetch loses 2-4 seconds of LCP, which hurts both UX and search ranking. Prerendered meta isn't enough — the article body has to be in the initial HTML." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your product page has a CLS of 0.32 (poor). The Performance panel shows the hero image is the main contributor — it loads ~600ms after first paint and pushes everything below it down. What fixes this most directly?"
          options={[
            { label: "Switch the image to AVIF for smaller file size.", explanation: "Smaller files load faster (helps LCP), but the layout shift happens regardless of file size — the browser doesn't know the image's dimensions until it parses the file. The fix is reserving the space, not making the image smaller." },
            { label: "Set explicit width and height attributes on the <img> tag (or use next/image, which sets them for you).", correct: true, explanation: "Right. Width and height attributes give the browser an aspect ratio before the image loads, so it reserves the correct vertical space and doesn't reflow when the image lands. This is the canonical CLS fix for images. next/image enforces this by default." },
            { label: "Lazy-load the hero image with loading='lazy'.", explanation: "Wrong direction — lazy-loading the LCP element delays it further, hurting LCP. Below-the-fold images should be lazy; the hero should be priority/eager." },
            { label: "Add a CSS transition to smooth out the shift.", explanation: "CLS measures unexpected layout movement, full stop — animating it doesn't reduce the score. And smoothing only makes a janky page feel slightly less janky; the structural fix is preventing the shift." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're building a settings page with a few filter dropdowns, a tab control, and a profile form. Where should each piece of state live?"
          options={[
            { label: "All of it in a global Zustand store so any component can read it.", explanation: "Treats four different problems as one. Filter state belongs in the URL (refresh-safe, shareable), form state belongs in React Hook Form (per-field touched/dirty/error tracking), and tab state belongs in the URL too. Lumping them into a global store rebuilds tools that already exist." },
            { label: "Filters and active tab in the URL (useSearchParams), form fields in React Hook Form, anything ephemeral and UI-only in useState colocated with the component.", correct: true, explanation: "Right. Each bucket — URL state, form state, client state — gets the tool designed for it. Filters and tabs in the URL means refresh works, back button works, you can share a link. Form state in RHF means no whole-tree re-renders per keystroke. Ephemeral UI state stays local. Lift only when shared." },
            { label: "All of it in Redux with slices per concern.", explanation: "Redux can hold all four, but it's a lot of boilerplate for problems that have purpose-built tools, and you still don't get URL-syncing or per-field form ergonomics for free." },
            { label: "All of it in React Context.", explanation: "Context isn't optimized for fast-changing values — every consumer re-renders on every change. Fine for stable things (theme, locale), wrong for form fields or active tab." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're rendering a chat history of ~15,000 messages. Scrolling lags hard. What's the right move?"
          options={[
            { label: "Lazy-load message bodies with loading='lazy' on each <div>.", explanation: "loading='lazy' only applies to images and iframes, not arbitrary content. The DOM still contains 15,000 message nodes whether their bodies are 'lazy' or not — the cost is the node count, not the content." },
            { label: "Add React.memo to the Message component.", explanation: "memo helps with re-render cost but not with having 15,000 DOM nodes in the first place. Scroll, layout, and memory are all proportional to node count, not just to re-renders." },
            { label: "Virtualize the list with react-window or @tanstack/react-virtual so only the visible window of rows is in the DOM.", correct: true, explanation: "Right. Past a few hundred rows, virtualization is mandatory — render only the rows in (and slightly around) the viewport, recycle them on scroll. 15,000 messages becomes ~20 DOM nodes at any time. Scroll, layout, memory all bounded by the window size, not the dataset size." },
            { label: "Paginate with a 'load more' button — show 50 messages at a time.", explanation: "Pagination helps initial load but doesn't solve the problem once the user has scrolled through 15,000 messages — those nodes still accumulate. Virtualization is the structural fix; pagination is at best a band-aid for very small datasets." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're designing a 'live game scores' page — server pushes score updates to the client, no client-to-server messages needed. What's the right transport?"
          options={[
            { label: "WebSocket — it's the modern default for anything real-time.", explanation: "WS works, but for server → client only with no return channel, SSE has clear wins: HTTP/2 friendly, auto-reconnect with Last-Event-ID for free, plays nicely with CDNs and corporate proxies that block WS. WS is overkill when you don't need bidirectional." },
            { label: "SSE (Server-Sent Events) — server-push only, auto-reconnect built in, plays nicely with corporate proxies and CDNs.", correct: true, explanation: "Right. SSE is exactly designed for this shape: server → client only, native EventSource reconnect with Last-Event-ID for resume, HTTP/2 friendly. WebSocket is overkill when there's no client-to-server channel. Long-poll is legacy fallback only." },
            { label: "Long polling — most compatible with old proxies.", explanation: "Compatible, but you're paying full HTTP overhead per message and your latency floor is 'one round trip per update.' Pick this only as a fallback when SSE/WS are blocked, not as the primary transport." },
            { label: "Plain HTTP polling every 2 seconds.", explanation: "Burns mobile data, drains battery, and your worst-case staleness is the polling interval. For a live scores experience where users notice the difference between 'updates in 200ms' and 'updates in 2 seconds,' push beats poll." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Course closer spring callout */}
      {/* ============================================================ */}
      <section className="not-prose mt-12 p-6 rounded-2xl border border-teal-200 dark:border-teal-900 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-2">
          You&apos;re done with the course
        </div>
        <h3 className="mt-0 mb-3 text-2xl font-bold">Eight phases, in your head.</h3>
        <p className="mb-3 text-slate-700 dark:text-slate-300">
          You walked in with &quot;I&apos;ve heard of CAP&quot; and you&apos;re walking out with a full mental toolkit: scaling ladders, partitioning, replication, consistency models, consensus, queues, caches, observability, resilience patterns, on-call instincts, and now the frontend half — rendering, vitals, feed and real-time archetypes. That&apos;s the entire interview surface for a senior system design loop, top to bottom.
        </p>
        <p className="mb-3 text-slate-700 dark:text-slate-300">
          The thing that separates senior from staff isn&apos;t knowing more patterns — it&apos;s knowing which one to reach for under pressure, and being able to defend the call with numbers when someone pushes back. That&apos;s the practice now. Mock interviews, designing real systems at work, reading post-mortems with the question &quot;which of these patterns would&apos;ve caught it?&quot;
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          One last thing before you close the tab. The <strong>capstone</strong> is where it all comes together — an end-to-end design exercise (code review platform: ingest, search, real-time comments, notifications, audit log) that touches every phase. If you haven&apos;t done it yet, that&apos;s the next move. If you have: go run a real mock interview.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/courses/system-design"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            ← Back to course overview
          </Link>
          <Link
            href="/courses/system-design/modules/capstone"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition no-underline"
          >
            Try the capstone →
          </Link>
        </div>
      </section>
        <ModuleNav courseId="system-design" currentSlug="phase-8-revision" />
    </article>
  );
}
