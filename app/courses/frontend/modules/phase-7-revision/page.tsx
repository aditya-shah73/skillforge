import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-7-revision";

export default function Phase7RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 7 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {mod.title}
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          {mod.subtitle}
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material — it is a <strong>map of Phase 7</strong>. Five modules on how the App Router moves work to the server, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/rsc-mental-model" className="text-cyan-600 hover:underline">Server vs Client Components</Link>,{" "}
          <Link href="/courses/frontend/modules/routing-layouts" className="text-cyan-600 hover:underline">routing &amp; layouts</Link>,{" "}
          <Link href="/courses/frontend/modules/data-loading-server" className="text-cyan-600 hover:underline">server data loading</Link>,{" "}
          <Link href="/courses/frontend/modules/mutations-actions" className="text-cyan-600 hover:underline">Server Actions</Link>, and{" "}
          <Link href="/courses/frontend/modules/rendering-strategies" className="text-cyan-600 hover:underline">rendering strategies</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Server vs Client Components */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · Server vs Client Components</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>In the App Router, <strong>Server Components are the default</strong>. Every file under <code>app/</code>{" "}is a Server Component unless it (or a parent) opts out — they run <strong>on the server</strong>, render to HTML, and ship <strong>zero JavaScript</strong>{" "}to the browser.</li>
            <li>Because they never run in the browser, Server Components <strong>can&apos;t use hooks, state, effects, or event handlers</strong>, and they can&apos;t touch browser APIs like <code>window</code>{" "}or <code>localStorage</code>. What they <em>can</em>{" "}do is <code>await</code>{" "}data directly and read server-only secrets.</li>
            <li><code>&quot;use client&quot;</code>{" "}marks a <strong>boundary</strong>: that file and <strong>every component it imports</strong>{" "}become Client Components, hydrated and interactive in the browser. The directive cascades downward — you only write it at the top of the boundary, not on every child.</li>
            <li>Props that <strong>cross the server→client boundary must be serializable</strong>{" "}(strings, numbers, plain objects, arrays). You <strong>can&apos;t pass functions, class instances, or Dates-as-behavior</strong>{" "}across it — that&apos;s why callbacks live on the client side.</li>
            <li>The pattern that matters: <strong>keep Client Components as leaves</strong>. Push <code>&quot;use client&quot;</code>{" "}down to the smallest interactive piece (a button, a search box) and pass Server-Component-rendered content into it via <code>children</code>{" "}so the static parts stay on the server.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Routing & layouts */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Routing &amp; layouts</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Routing is <strong>file-system based</strong>: a folder under <code>app/</code>{" "}is a route segment, and a <code>page.tsx</code>{" "}inside it makes that segment publicly routable. Nesting folders nests URLs.</li>
            <li><code>layout.tsx</code>{" "}wraps the segments below it and <strong>persists across navigation</strong>{" "}— it does <strong>not remount</strong>{" "}when you move between child pages, so shared chrome (nav, sidebars) keeps its state and scroll position. Layouts nest, wrapping their children.</li>
            <li><strong>Dynamic segments</strong>{" "}use bracket folders: <code>[id]</code>{" "}captures a single value into <code>params</code>, while <code>[...slug]</code>{" "}is a catch-all. <strong>Route groups</strong>{" "}use parentheses — <code>(marketing)</code>{" "}organizes files without adding a URL segment.</li>
            <li>Special files wire framework behavior automatically: <code>loading.tsx</code>{" "}becomes a <strong>Suspense fallback</strong>{" "}for the segment, <code>error.tsx</code>{" "}is its <strong>error boundary</strong>{" "}(it must be a Client Component), and <code>not-found.tsx</code>{" "}renders for <code>notFound()</code>{" "}or unmatched routes.</li>
            <li>Navigate with the <code>&lt;Link&gt;</code>{" "}component for client-side transitions (prefetched in the background) and <code>useRouter</code>{" "}from <code>next/navigation</code>{" "}for programmatic pushes. <code>template.tsx</code>{" "}is the rare opt-out when you <em>do</em>{" "}want a fresh instance per navigation.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Server data loading */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · Server data loading</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A Server Component can be <code>async</code>{" "}and <strong><code>await fetch</code>{" "}directly</strong>{" "}in the body — no <code>useEffect</code>, no loading state plumbing. The data is resolved <strong>before</strong>{" "}the HTML is sent, so it <strong>sidesteps the client-side race condition</strong>{" "}entirely.</li>
            <li>Next extends <code>fetch</code>{" "}with caching options: <code>{"{ cache: \"force-cache\" }"}</code>{" "}(the default for static), <code>{"{ cache: \"no-store\" }"}</code>{" "}to always hit the source, and <code>{"{ next: { revalidate: 60 } }"}</code>{" "}for time-based revalidation.</li>
            <li>Two distinct layers: <strong>Request Memoization</strong>{" "}dedupes identical <code>fetch</code>{" "}calls <em>within a single render pass</em>{" "}(so two components can both fetch the same user without a double request), while the <strong>Data Cache</strong>{" "}persists results <em>across requests and deployments</em>{" "}until revalidated.</li>
            <li>Avoid <strong>server waterfalls</strong>: <code>await</code>-ing request A, then request B sequentially when they&apos;re independent serializes them. Fire them together with <code>Promise.all</code>{" "}so they run in parallel.</li>
            <li>Where you can&apos;t use the extended <code>fetch</code>{" "}(an ORM, a database client), wrap the call in React&apos;s <code>cache()</code>{" "}to get the same per-request memoization, and use <code>unstable_cache</code>{" "}/ tags for the persistent layer.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Server Actions */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Server Actions</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>A <strong>Server Action</strong>{" "}is a function marked <code>&quot;use server&quot;</code>{" "}that runs <em>only</em>{" "}on the server but is <strong>callable from the client</strong>{" "}— pass it straight to a <code>&lt;form action={"{...}"}&gt;</code>{" "}and the framework wires up the request for you. No API route to hand-write.</li>
            <li>Because the form posts to the server, actions give you <strong>progressive enhancement</strong>: the form <strong>works without JavaScript</strong>{" "}(the browser submits natively), then upgrades to a fetch-based submit once JS hydrates.</li>
            <li>After a write, <strong>revalidate</strong>{" "}so the UI reflects the new data: <code>revalidatePath(&quot;/items&quot;)</code>{" "}busts a specific route&apos;s cache, and <code>revalidateTag(&quot;items&quot;)</code>{" "}busts every fetch tagged with that label.</li>
            <li>Client-side status hooks: <code>useFormStatus</code>{" "}reports the <strong>pending</strong>{" "}state of the enclosing form (great for a disabled/spinner submit button), and <code>useActionState</code>{" "}holds the action&apos;s <strong>returned result or error</strong>{" "}across submissions.</li>
            <li>For instant-feeling writes, <code>useOptimistic</code>{" "}lets you render the expected result immediately while the action is in flight, then reconciles with the real result when it lands. Always <strong>validate and authorize inside the action</strong>{" "}— it&apos;s a public server endpoint.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Rendering strategies */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Rendering strategies</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>The core split is <strong>static vs dynamic</strong>{" "}rendering. Static is rendered <strong>at build time</strong>{" "}and served from cache; dynamic is rendered <strong>per request</strong>. A route stays static until something forces it dynamic.</li>
            <li>Reading <strong>request-time data flips a route to dynamic</strong>: <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>, or any <code>fetch</code>{" "}with <code>cache: &quot;no-store&quot;</code>. If none of those appear, the route can be statically prerendered.</li>
            <li><strong>ISR</strong>{" "}(Incremental Static Regeneration) is the middle ground: serve static HTML but <strong>revalidate</strong>{" "}on a timer (<code>export const revalidate = 60</code>) so the page rebuilds in the background after it goes stale — fast like static, fresh like dynamic.</li>
            <li><strong>Streaming SSR</strong>{" "}via <code>&lt;Suspense&gt;</code>{" "}(or a <code>loading.tsx</code>) lets the server send the shell immediately and <strong>stream slow pieces in</strong>{" "}as their data resolves, so a single slow query doesn&apos;t block the whole page.</li>
            <li><strong>Runtime</strong>{" "}is a separate axis: <code>export const runtime</code>{" "}can target the <strong>Node.js</strong>{" "}runtime (full APIs) or the <strong>Edge</strong>{" "}runtime (lighter, faster cold starts, limited APIs). Read the <strong>build output legend</strong>{" "}— the <code>○</code>{" "}/ <code>ƒ</code>{" "}markers tell you which routes ended up static vs dynamic.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what&apos;s the difference between Server and Client Components?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Server Components are the default in the App Router — they run on the server, render to HTML, and ship no JavaScript, so they&apos;re great for data fetching and static content but can&apos;t use hooks, state, or browser APIs. <code>&quot;use client&quot;</code>{" "}marks a boundary that turns that file and everything it imports into Client Components, which hydrate and are interactive. I keep client boundaries as small leaves and pass server-rendered content in through <code>children</code>. Anything crossing the boundary as props has to be serializable.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do you load data in the App Router?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I make the Server Component <code>async</code>{" "}and <code>await fetch</code>{" "}right in the body — no <code>useEffect</code>, and it resolves before the HTML ships, so there&apos;s no client race condition. Next extends <code>fetch</code>{" "}with caching and <code>revalidate</code>. There are two layers to keep straight: request memoization dedupes identical fetches within one render, and the Data Cache persists across requests. For independent calls I use <code>Promise.all</code>{" "}so I don&apos;t create a server waterfall.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do mutations work without an API route?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Server Actions. I mark a function <code>&quot;use server&quot;</code>{" "}and hand it to a form&apos;s <code>action</code>{" "}— it runs only on the server but is callable from the client, and the form works even without JavaScript thanks to progressive enhancement. After the write I call <code>revalidatePath</code>{" "}or <code>revalidateTag</code>{" "}to refresh the cache. <code>useFormStatus</code>{" "}gives me the pending state, <code>useActionState</code>{" "}the result or error, and <code>useOptimistic</code>{" "}for instant feedback. I always validate and authorize inside the action since it&apos;s a public endpoint.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what makes a route static vs dynamic?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Routes are static by default — rendered at build and served from cache. They flip to dynamic the moment I read request-time data: <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>, or a <code>no-store</code>{" "}fetch. ISR is the middle ground — static HTML that revalidates on a timer. And I read the build output legend to confirm what each route actually ended up as, because it&apos;s easy to accidentally opt into dynamic.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do you keep a slow query from blocking the page?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Streaming with Suspense. I wrap the slow component in <code>&lt;Suspense&gt;</code>{" "}with a fallback — or just use a <code>loading.tsx</code>{" "}for the whole segment — and the server sends the shell immediately, then streams the slow piece in when its data resolves. So the fast content is interactive right away and one slow fetch doesn&apos;t hold the rest hostage.&quot;
          </p>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 7 — Up next */}
      {/* =============================================================== */}
      <section className="not-prose mb-6">
        <h2 className="mb-4 text-2xl font-bold">Up next</h2>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <strong>Phase 8 — Performance, A11y &amp; DX.</strong>{" "}You now own the App Router: the server/client split, routing and layouts, server data loading, Server Actions, and rendering strategies. Phase 8 turns to the qualities that make an app production-grade: rendering &amp; bundle performance and Core Web Vitals, accessibility and accessible forms, front-end testing, and the developer experience that keeps a codebase fast to work in.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 8+ content is rolling out — check back, or follow along as new modules ship.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
