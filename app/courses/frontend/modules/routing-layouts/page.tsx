import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "routing-layouts";

const CHECKPOINTS = [
  { id: "cp-file-routing", title: "Files become routes" },
  { id: "cp-layouts", title: "Layouts & nesting" },
  { id: "cp-conventions", title: "loading / error / not-found" },
];

export default function RoutingLayoutsModule() {
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
          File-based routing, layouts, and the loading/error conventions
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          In the App Router, your <strong>folder structure is your router config</strong>. There&apos;s no big route file to
          maintain, you create a folder, drop in a few specially-named files, and Next.js wires up nested layouts, Suspense
          boundaries, and error boundaries for you. Let&apos;s learn the small vocabulary of special filenames that does all of it.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The building with nested floor plans</h2>
        <p className="mb-4">
          Imagine a building where each floor wraps the floors above it. The <strong>lobby</strong> (the root layout) is always
          there, the entrance, the elevators, the building-wide signage. Walk into the <strong>dashboard wing</strong> and
          you pick up that wing&apos;s shared furniture: a sidebar, a header. Step into a specific <strong>room</strong> in the wing
          and only the room&apos;s contents change, the lobby and the wing&apos;s furniture stay put, exactly where they were.
        </p>
        <p className="mb-4">
          That is nested layouts. As you navigate from room to room <em>within</em> a wing, the wing&apos;s sidebar doesn&apos;t flicker
          or reload, it persists. The shared shell stays mounted while only the innermost contents swap. The App Router builds
          this nesting automatically from how you nest your folders: a folder is a URL segment, and a <code>layout.tsx</code> in
          that folder is the shell that wraps everything below it.
        </p>
        <Callout variant="info" title="The whole router is a handful of filenames">
          <p>
            You don&apos;t configure routes in JavaScript. You learn ~6 reserved filenames, <code>page</code>, <code>layout</code>,
            <code> loading</code>, <code>error</code>, <code>not-found</code>, <code>template</code>, and where you put them in
            the folder tree <em>is</em> the configuration. This module is essentially a tour of those filenames.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. FILES BECOME ROUTES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Folders are segments, <code>page.tsx</code> makes a route public</h2>
        <p className="mb-4">
          A folder under <code>app/</code> defines a <strong>URL segment</strong>. But a folder alone is <em>not</em> routable,
          it becomes a visitable page only when it contains a <code>page.tsx</code> (or <code>page.jsx</code>). That distinction
          lets you have folders purely for organization that don&apos;t create routes.
        </p>
        <pre><code>{`app/
  page.tsx                 ->  /
  about/
    page.tsx               ->  /about
  blog/
    page.tsx               ->  /blog
    [slug]/
      page.tsx             ->  /blog/:slug   (dynamic segment)
  dashboard/
    settings/
      page.tsx             ->  /dashboard/settings
  lib/                     ->  (no page.tsx -> NOT a route, just code)
    helpers.ts`}</code></pre>
        <p className="mb-4">
          A few naming tools change how a folder maps to a URL:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Dynamic segment</strong> <code>[slug]</code>, matches any value and exposes it via <code>params</code>.
            <code> app/blog/[slug]/page.tsx</code> serves <code>/blog/hello</code> with <code>params.slug === &quot;hello&quot;</code>.
          </li>
          <li>
            <strong>Catch-all</strong> <code>[...segments]</code>, matches one or more path parts, giving an array. Optional
            catch-all <code>[[...segments]]</code> also matches the bare parent path.
          </li>
          <li>
            <strong>Route group</strong> <code>(marketing)</code>, parentheses mean &quot;organize, don&apos;t add to the URL.&quot;
            <code> app/(marketing)/about/page.tsx</code> still serves <code>/about</code>; the group exists so you can give a
            section its own layout without a URL segment for it.
          </li>
        </ul>
        <pre><code>{`// app/blog/[slug]/page.tsx — reading the dynamic segment
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // params is awaited in current Next.js
  const post = await getPost(slug);
  return <article>{post.title}</article>;
}`}</code></pre>
        <Callout variant="warn" title="params (and searchParams) are async now">
          <p>
            In current Next.js, <code>params</code> and <code>searchParams</code> are <strong>Promises</strong>, you
            <code> await</code> them. This was a deliberate change to support more streaming. Older tutorials destructure them
            synchronously; if you see <code>params.slug</code> without an <code>await</code>, it&apos;s an older API. The shape and
            meaning are otherwise the same.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. LAYOUTS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Layouts, the shells that persist across navigation</h2>
        <p className="mb-4">
          A <code>layout.tsx</code> wraps every <code>page.tsx</code> (and nested layout) <em>below</em> it in the folder tree.
          It receives a <code>children</code> prop, the page or nested layout it&apos;s wrapping, and renders shared UI around it.
          Layouts <strong>nest</strong>: the root layout wraps a section layout wraps the page.
        </p>
        <pre><code>{`// app/layout.tsx — the ROOT layout (required; must render <html> and <body>)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}        {/* every page in the app renders here */}
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx — a NESTED layout for the /dashboard subtree
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr]">
      <Sidebar />          {/* shared across all /dashboard/* pages */}
      <section>{children}</section>
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          The defining behavior, and the one interviewers probe, is <strong>persistence</strong>. When you navigate from
          <code> /dashboard/settings</code> to <code>/dashboard/billing</code>, the <code>DashboardLayout</code> (and the root
          layout) <strong>stays mounted</strong>. Only the <code>children</code>, the page content, changes. The sidebar
          doesn&apos;t re-render from scratch, its scroll position and state are preserved, and any client state living in the
          layout survives the navigation.
        </p>
        <Callout variant="insight" title="Persist vs remount, the rule">
          <p>
            A layout <strong>persists</strong> as long as you stay within its subtree; it <strong>remounts</strong> only when you
            navigate <em>out</em> of that subtree. Pages always remount (their content is what changes). So a sidebar in a layout
            keeps its expanded/collapsed state as you click between sibling pages, but a piece of state in the <em>page</em>
            resets on every navigation, because the page itself remounted.
          </p>
        </Callout>
        <p className="mb-4">
          There&apos;s a sibling file, <code>template.tsx</code>, that looks like a layout but does the opposite: a
          <strong> template remounts on every navigation</strong> (fresh state, re-run effects, replayed enter animations).
          Reach for it only when you specifically want that reset behavior, e.g. an entrance animation that should replay on
          each page. The default and the right choice almost always is <code>layout.tsx</code> (persist).
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Root layout is required</strong> and is the only place you render <code>&lt;html&gt;</code> and <code>&lt;body&gt;</code>.</li>
          <li><strong>Layouts can be async Server Components</strong>, fetch shared data (the logged-in user, nav items) right in the layout body.</li>
          <li><strong>A layout cannot access the URL of the page it wraps</strong> beyond its own segment&apos;s params, it doesn&apos;t re-render on every sub-navigation, so don&apos;t depend on <code>searchParams</code> inside a layout.</li>
        </ul>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-file-routing" moduleSlug={MODULE_SLUG} title="Files become routes">
        <Quiz
          kind="Routability"
          question="You create the folder app/reports/ with a chart.tsx file inside it, but no page.tsx. Is /reports a visitable route?"
          options={[
            {
              label: "No, a folder is only routable when it contains a page.tsx (or page.jsx); a folder of other files is just code organization",
              correct: true,
              explanation:
                "Correct. The folder defines a URL segment, but it becomes a public route only when a page.tsx lives in it. Without one, /reports 404s and the folder is just for colocated code.",
            },
            {
              label: "Yes, any folder under app/ is automatically a route",
              explanation:
                "Folders define segments but don't create routes on their own. You need a page.tsx to make the segment visitable.",
            },
            {
              label: "Yes, but only if chart.tsx exports a default component",
              explanation:
                "The special filename matters, not just any default export. Only page.tsx makes the segment a public route; chart.tsx is just a regular module.",
            },
          ]}
        />
        <Quiz
          kind="Route groups"
          question="What does wrapping a folder name in parentheses, like app/(marketing)/about/page.tsx, do to the URL?"
          options={[
            {
              label: "Nothing to the URL, the route is still /about; the group only organizes files (e.g. to give a section its own layout) without adding a URL segment",
              correct: true,
              explanation:
                "Exactly. Route groups let you apply a shared layout or co-locate a section's files without the group name appearing in the path. /(marketing)/about still serves /about.",
            },
            {
              label: "It makes the route /marketing/about",
              explanation:
                "Parentheses specifically exclude the folder from the URL, that's their whole purpose. The route stays /about.",
            },
            {
              label: "It makes the route a dynamic segment matching any value",
              explanation:
                "Dynamic segments use square brackets [slug], not parentheses. Parentheses create a route group that's invisible in the URL.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. LOADING.TSX ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>loading.tsx</code>, a Suspense boundary you didn&apos;t have to write</h2>
        <p className="mb-4">
          Drop a <code>loading.tsx</code> next to a <code>page.tsx</code> and Next.js automatically wraps that segment&apos;s page
          in a React <strong>Suspense boundary</strong>, using your <code>loading.tsx</code> as the fallback. While the
          (async) page is fetching data on the server, the user instantly sees the loading UI; when the data resolves, the
          real content streams in to replace it.
        </p>
        <pre><code>{`// app/dashboard/loading.tsx — shown while dashboard/page.tsx is rendering
export default function Loading() {
  return <DashboardSkeleton />; // a skeleton, not a blank screen
}

// Conceptually, Next.js wraps your page like this for free:
// <Suspense fallback={<Loading />}>
//   <Page />
// </Suspense>`}</code></pre>
        <p className="mb-4">
          This is why an async Server Component page doesn&apos;t leave the user staring at a white screen: the surrounding layout
          renders immediately, the <code>loading.tsx</code> fills the page area, and the slow part streams in. You get
          instant navigation feedback without manually wiring a single loading state, and because the layout is outside the
          boundary, the sidebar and header are interactive while the page content is still loading.
        </p>
        <Callout variant="insight" title="loading.tsx is scoped to its segment">
          <p>
            The boundary wraps the <em>page below the loading file&apos;s folder</em>, not the whole app. A
            <code> loading.tsx</code> in <code>app/dashboard/</code> only shows while dashboard pages load; the root layout and
            header stay visible. Place loading files at the granularity where you want streaming to happen.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. ERROR.TSX + NOT-FOUND ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold"><code>error.tsx</code> and <code>not-found.tsx</code>, recovery, scoped</h2>
        <p className="mb-4">
          <code>error.tsx</code> wraps a segment in a React <strong>error boundary</strong>. If a page (or anything it renders)
          throws during rendering, instead of blanking the whole app, Next.js renders the nearest <code>error.tsx</code> in its
          place, keeping the surrounding layout intact. There are two non-negotiable rules about this file:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>It must be a Client Component</strong> (<code>&quot;use client&quot;</code>). Error boundaries are interactive, they
            receive the error and a <code>reset()</code> function and usually render a &quot;Try again&quot; button.
          </li>
          <li>
            <strong>It receives <code>error</code> and <code>reset</code> props.</strong> <code>reset()</code> attempts to
            re-render the segment, giving the user a recovery path without a full page reload.
          </li>
        </ul>
        <pre><code>{`// app/dashboard/error.tsx — MUST be a client component
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong loading the dashboard.</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          A key subtlety: <strong><code>error.tsx</code> catches errors in the segment&apos;s page and children, but NOT in its own
          sibling <code>layout.tsx</code></strong>. Because the layout sits <em>above</em> the error boundary, a throw in the
          layout escapes to the <em>parent</em> segment&apos;s error boundary. To catch a root-layout error you need the special
          <code> global-error.tsx</code> (which must render its own <code>&lt;html&gt;</code>/<code>&lt;body&gt;</code>).
        </p>
        <p className="mb-4">
          <code>not-found.tsx</code> handles the &quot;this thing doesn&apos;t exist&quot; case. Call the <code>notFound()</code> function
          from inside a Server Component (e.g. when a database lookup returns nothing) and Next.js renders the nearest
          <code> not-found.tsx</code> with a 404 status. It&apos;s the semantic, status-correct way to say &quot;no such record&quot;,
          distinct from an unexpected <em>error</em>.
        </p>
        <pre><code>{`// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // renders the nearest not-found.tsx with a 404
  return <article>{post.title}</article>;
}`}</code></pre>
        <Callout variant="warn" title="error vs not-found, don't conflate them">
          <p>
            <code>not-found</code> is an expected, valid outcome (&quot;no record with that id&quot; → HTTP 404). <code>error</code> is an
            <em> unexpected</em> failure (a throw during render → HTTP 500-ish, with a recovery button). Returning a 404 for a
            missing record is correct UX and correct SEO; throwing an error for it is not. Use <code>notFound()</code> for
            &quot;doesn&apos;t exist,&quot; let the error boundary handle genuine failures.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-layouts" moduleSlug={MODULE_SLUG} title="Layouts & nesting">
        <Quiz
          kind="Persistence"
          question="You navigate from /dashboard/settings to /dashboard/billing. The dashboard layout has a sidebar with a collapsed/expanded toggle in client state. What happens to that toggle state?"
          options={[
            {
              label: "It's preserved, the layout persists across navigation within its subtree; only the page content (children) swaps",
              correct: true,
              explanation:
                "Correct. Layouts stay mounted as long as you stay within their subtree. The sidebar's state survives navigating between sibling pages; only the page below it remounts.",
            },
            {
              label: "It resets, every navigation remounts the entire route tree including layouts",
              explanation:
                "That's template.tsx behavior, not layout.tsx. Layouts persist; only the page remounts. The sidebar state is kept.",
            },
            {
              label: "It resets only if the two pages are in different route groups",
              explanation:
                "Both pages share the same /dashboard layout, so it persists regardless. Route groups don't change persistence here.",
            },
          ]}
        />
        <Quiz
          kind="layout vs template"
          question="When would you choose template.tsx over layout.tsx?"
          options={[
            {
              label: "When you specifically want the wrapper to remount on every navigation, fresh state, re-run effects, replayed enter animations",
              correct: true,
              explanation:
                "Right. template.tsx is the opposite of layout.tsx: it remounts per navigation. Use it for per-page entrance animations or when you need state to reset each time. Otherwise prefer layout.tsx.",
            },
            {
              label: "Always, template.tsx is the modern replacement for layout.tsx",
              explanation:
                "No. layout.tsx (persist) is the default and the usual choice. template.tsx is a niche tool for when you actually want remount-on-navigation.",
            },
            {
              label: "When you need to render <html> and <body>",
              explanation:
                "That's the job of the required root layout.tsx, not template.tsx. template is purely about remount-vs-persist behavior.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. HOW THEY COMPOSE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">How they all compose around your page</h2>
        <p className="mb-4">
          The reserved files nest into a predictable wrapping order around each page. For a request to
          <code> /dashboard/settings</code>, Next.js assembles roughly this tree:
        </p>
        <pre><code>{`<RootLayout>           {/* app/layout.tsx */}
  <DashboardLayout>    {/* app/dashboard/layout.tsx — persists */}
    <ErrorBoundary fallback={<Error/>}>          {/* app/dashboard/error.tsx */}
      <Suspense fallback={<Loading/>}>           {/* app/dashboard/loading.tsx */}
        <SettingsPage />                          {/* app/dashboard/settings/page.tsx */}
      </Suspense>
    </ErrorBoundary>
  </DashboardLayout>
</RootLayout>`}</code></pre>
        <p className="mb-4">
          Reading this tree explains all the behaviors at once: the layouts persist because they&apos;re <em>outside</em> the page;
          the loading fallback is scoped to the page because the Suspense boundary wraps only the page; the error boundary
          catches the page&apos;s throws but not the layout&apos;s (the layout is above it). The folder structure literally builds this
          composition for you, that&apos;s the elegance of the convention.
        </p>
        <Callout variant="info" title="Linking & navigation">
          <p>
            Navigate with <code>&lt;Link href=&quot;/dashboard/billing&quot;&gt;</code> for client-side transitions that preserve layouts
            and prefetch in the background. For programmatic navigation in a Client Component, use <code>useRouter()</code> from
            <code> next/navigation</code> (note: <em>not</em> <code>next/router</code>, which is the old Pages Router import).
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how does App Router routing work?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Folders are URL segments; <code>page.tsx</code> makes one public.</strong> <code>[slug]</code> is dynamic,
              <code> [...all]</code> is catch-all, <code>(group)</code> organizes without adding to the URL.
            </li>
            <li>
              <strong>Layouts wrap and persist.</strong> <code>layout.tsx</code> wraps everything below it and stays mounted
              across navigation within its subtree, shared sidebars keep their state. <code>template.tsx</code> is the
              remount-every-time variant.
            </li>
            <li>
              <strong><code>loading.tsx</code> is an auto Suspense boundary</strong> for that segment, instant skeleton while
              the async page streams in.
            </li>
            <li>
              <strong><code>error.tsx</code> is an auto error boundary</strong>, must be a Client Component, gets
              <code> error</code> + <code>reset</code>, and catches the page but not its own sibling layout.
            </li>
            <li>
              <strong><code>notFound()</code> + <code>not-found.tsx</code></strong> handle &quot;doesn&apos;t exist&quot; with a real 404,
              distinct from an unexpected error.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 8. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, a nested dashboard route</h2>
        <p className="mb-4">
          Build a nested dashboard route with a persistent sidebar layout, a dynamic <code>[id]</code> segment, a
          <code> loading.tsx</code> skeleton, and an <code>error.tsx</code> recovery, and explain what persists vs remounts on
          navigation.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Scaffold the segments.</strong> Create <code>app/dashboard/layout.tsx</code> (sidebar + content area),
            <code> app/dashboard/page.tsx</code> (an overview), and <code>app/dashboard/projects/[id]/page.tsx</code> (a dynamic
            detail page that reads <code>await params</code>).
          </li>
          <li>
            <strong>Give the sidebar client state.</strong> Make a small <code>&quot;use client&quot;</code> sidebar with a
            collapse/expand toggle, and render it from the layout. This is your persistence probe.
          </li>
          <li>
            <strong>Add a <code>loading.tsx</code>.</strong> Put a skeleton in <code>app/dashboard/projects/[id]/loading.tsx</code>
            and make the detail page <code>await</code> a deliberately slow fetch. Navigate to a project and watch the skeleton
            show while the layout/sidebar stay put.
          </li>
          <li>
            <strong>Add an <code>error.tsx</code>.</strong> Create <code>app/dashboard/projects/[id]/error.tsx</code> (a Client
            Component with a &quot;Try again&quot; button calling <code>reset()</code>). Make the page <code>throw</code> for one specific
            id to trigger it, and confirm the sidebar remains visible while the error UI replaces only the page area.
          </li>
          <li>
            <strong>Add <code>notFound()</code>.</strong> When the project id doesn&apos;t exist, call <code>notFound()</code> and add
            a <code>not-found.tsx</code>. Compare its 404 behavior to the 500-style error path.
          </li>
          <li>
            <strong>Narrate persist vs remount.</strong> Toggle the sidebar, then navigate between two projects: the toggle
            state survives (layout persists) but each page&apos;s own state resets (page remounts). Write down, in one sentence each,
            <em> why</em> the layout persisted and <em>why</em> the loading/error boundaries were scoped where they were.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you&apos;ve built server-side apps with nested view templates (think a base template that yields to a section
            template that yields to a page), App Router layouts are that idea made first-class, with the bonus that the outer
            shells stay live on the client and don&apos;t re-fetch as you move between inner pages. <code>not-found.tsx</code> +
            <code> notFound()</code> is your framework-level 404 handler; <code>error.tsx</code> is your 500 page, scoped per
            route subtree instead of one global handler.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-conventions" moduleSlug={MODULE_SLUG} title="loading / error / not-found">
        <Quiz
          kind="error.tsx rules"
          question="Which statement about error.tsx is correct?"
          options={[
            {
              label: "It must be a Client Component, receives error + reset props, and catches errors in its segment's page but NOT in its sibling layout.tsx",
              correct: true,
              explanation:
                "All correct. Error boundaries are interactive (so \"use client\"), get a reset() recovery function, and sit below the layout, so a throw in the sibling layout escapes to the parent's boundary instead.",
            },
            {
              label: "It can be a Server Component and automatically catches any error anywhere in the app",
              explanation:
                "Wrong on both counts: error.tsx must be a Client Component, and it's scoped to its segment, it does not catch its own layout's errors, let alone the whole app.",
            },
            {
              label: "It only handles 404s when a record is missing",
              explanation:
                "That's not-found.tsx + notFound(). error.tsx handles unexpected thrown errors (500-style), with a reset() to retry.",
            },
          ]}
        />
        <Quiz
          kind="not-found vs error"
          question="A blog post lookup returns null because no post has that slug. What's the correct way to handle it?"
          options={[
            {
              label: "Call notFound() so Next renders not-found.tsx with a real 404 status, a missing record is an expected outcome, not an error",
              correct: true,
              explanation:
                "Correct. notFound() is the semantic, SEO-correct way to signal 'this doesn't exist' (HTTP 404). Throwing an error would mislabel an expected case as a 500-style failure.",
            },
            {
              label: "throw new Error('Post not found') so error.tsx shows a retry button",
              explanation:
                "A missing record isn't an unexpected failure and shouldn't return a 500 or offer 'try again' (retrying won't conjure the post). Use notFound() for a proper 404.",
            },
            {
              label: "Return null from the component so nothing renders",
              explanation:
                "Returning null gives a blank page with a 200 status, wrong UX and wrong SEO. notFound() renders a proper 404 page with the right status.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
