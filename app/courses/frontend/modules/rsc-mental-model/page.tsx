import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "rsc-mental-model";

const CHECKPOINTS = [
  { id: "cp-what-runs-where", title: "What runs where" },
  { id: "cp-the-boundary", title: "The \"use client\" boundary" },
  { id: "cp-serialization", title: "Crossing the boundary" },
];

export default function RscMentalModelModule() {
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
          Server Components vs Client Components — the App Router mental model
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          For years &quot;a React component&quot; meant one thing: code that runs in the browser. The App Router quietly split that
          word in two. Most of your components now run on the <em>server</em>, never ship JavaScript, and can&apos;t use a single
          hook — and that&apos;s the <em>default</em>. Let&apos;s build the model that makes this obvious instead of magical.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The restaurant kitchen and the dining room</h2>
        <p className="mb-4">
          Think of a restaurant. The <strong>kitchen</strong> is the server: it has the pantry (the database), the recipes
          (secrets and API keys), and the heavy equipment. It does the prep work once and plates a finished dish. The
          <strong> dining room</strong> is the browser: it&apos;s where the customer actually sits, reacts, and asks for things —
          &quot;more salt,&quot; &quot;take this back,&quot; &quot;I changed my mind.&quot; That back-and-forth, the <em>interactivity</em>, only
          happens in the dining room.
        </p>
        <p className="mb-4">
          You would never wheel the entire pantry and the ovens out to the customer&apos;s table just so they can add salt. You do
          the heavy, secret, data-touching work in the kitchen and send out a <em>finished plate</em>. You only put a salt
          shaker on the table — the small interactive bit — where the customer needs to act.
        </p>
        <p className="mb-4">
          That is the whole App Router model. <strong>Server Components</strong> are the kitchen: they run on the server, can
          touch the database and secrets directly, and ship their output as finished HTML with <em>zero JavaScript</em>.
          <strong> Client Components</strong> are the salt shaker on the table: the small, genuinely-interactive pieces that
          get shipped to the browser as JavaScript so they can respond to the user. The skill is knowing which parts of the
          meal belong in the kitchen and which belong on the table.
        </p>
        <Callout variant="info" title="The one sentence to anchor everything">
          <p>
            In the App Router, <strong>every component is a Server Component by default</strong>; you opt a subtree <em>into</em>
            the browser with <code>&quot;use client&quot;</code>. The mental work is deciding where that boundary goes — and the
            reward for getting it right is a smaller bundle and a faster page.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. WHAT RUNS WHERE ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What runs where, and when</h2>
        <p className="mb-4">
          The single most important thing to internalize is <em>when</em> each kind of component executes. They run at
          different times, in different environments, with different capabilities.
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>A Server Component runs on the server, during the request</strong> (at build time for static routes, or
            per-request for dynamic ones). It runs <em>once</em>, produces output, and is <strong>done</strong>. It never
            runs again in the browser. Its code is not in the JavaScript bundle at all.
          </li>
          <li>
            <strong>A Client Component runs in two places.</strong> First it runs on the server during the initial render
            (to produce the HTML you see immediately), and then its JavaScript is <em>shipped to the browser</em> and runs
            again there to <strong>hydrate</strong> — attaching event listeners and taking over interactivity. After that it
            re-runs in the browser on every state change, like any React component you&apos;ve ever written.
          </li>
        </ul>
        <p className="mb-4">
          So a Server Component is a one-shot: render, emit, gone. A Client Component is the React you already know — it
          re-renders, holds state, runs effects — and it also got a server-side dress rehearsal to produce initial HTML.
        </p>
        <Callout variant="warn" title="&quot;Client Component&quot; does NOT mean &quot;client-only&quot;">
          <p>
            The biggest naming trap in the App Router. A Client Component still renders on the <em>server</em> for the initial
            HTML — that&apos;s why you get fast first paint and SEO. The <code>&quot;use client&quot;</code> directive doesn&apos;t mean
            &quot;skip the server,&quot; it means &quot;this code <strong>also</strong> ships to the browser and hydrates.&quot; The contrast is
            <em> Server Component = server only</em> vs <em>Client Component = server then browser</em>.
          </p>
        </Callout>
        <p className="mb-4">Here is the same idea as a capability table — what each side can and can&apos;t do:</p>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700">
                <th className="py-2 pr-4">Capability</th>
                <th className="py-2 pr-4">Server Component</th>
                <th className="py-2">Client Component</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>async</code>/<code>await</code> in the component body</td>
                <td className="py-2 pr-4">✅ yes — fetch data directly</td>
                <td className="py-2">❌ no (the component itself can&apos;t be async)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">Database / filesystem / secrets</td>
                <td className="py-2 pr-4">✅ yes — runs only on the server</td>
                <td className="py-2">❌ no — would leak to the browser</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>useState</code>, <code>useEffect</code>, <code>useRef</code>, any hook</td>
                <td className="py-2 pr-4">❌ no — there is no client lifecycle</td>
                <td className="py-2">✅ yes</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">Event handlers (<code>onClick</code>, <code>onChange</code>)</td>
                <td className="py-2 pr-4">❌ no — nothing in the browser to fire them</td>
                <td className="py-2">✅ yes</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">Browser APIs (<code>window</code>, <code>localStorage</code>)</td>
                <td className="py-2 pr-4">❌ no — they don&apos;t exist on the server</td>
                <td className="py-2">✅ yes (after hydration / inside effects)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">Ships JavaScript to the browser</td>
                <td className="py-2 pr-4">❌ never — that&apos;s the win</td>
                <td className="py-2">✅ yes — its code is in the bundle</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4">
          Notice the symmetry: the two columns are almost mirror images. Anything that needs the <em>server&apos;s</em> powers
          (data, secrets) goes in a Server Component. Anything that needs the <em>browser&apos;s</em> powers (state, events,
          <code>window</code>) goes in a Client Component. Most UIs are mostly the former, with a few islands of the latter.
        </p>
      </section>

      {/* ───────────────────────── 3. WHY SERVER BY DEFAULT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Why &quot;server by default&quot; is the right default</h2>
        <p className="mb-4">
          The old model shipped <em>everything</em> to the browser. A product page that just displays text and images still
          downloaded all the React for it, parsed it, and ran it client-side. That JavaScript cost you nothing in features —
          the page wasn&apos;t interactive — but you paid for it in bundle size and a slower time-to-interactive.
        </p>
        <p className="mb-4">
          Server Components flip the economics. A component that only reads data and renders markup has <strong>no reason to
          exist in the browser</strong>. So it doesn&apos;t. It runs on the server, the user receives finished HTML, and the
          component&apos;s code is never downloaded. You only pay JavaScript cost for the parts that are genuinely interactive.
        </p>
        <pre><code>{`// app/products/[id]/page.tsx — a Server Component (no "use client")
// It's async, touches the DB directly, and ships ZERO JS for itself.
import { db } from "@/lib/db";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} /> {/* the one interactive island */}
    </main>
  );
}`}</code></pre>
        <p className="mb-4">
          Three things just happened that were impossible (or painful) in the old client-only world: we did
          <code> await db.product.findUnique</code> right in the component (no API route, no <code>useEffect</code>, no
          loading-state juggling), we kept the database client server-side where it belongs, and we shipped only
          <code> AddToCartButton</code>&apos;s JavaScript to the browser because it&apos;s the only piece that needs to react to a click.
        </p>
        <Callout variant="insight" title="The bundle-size argument, in one line">
          <p>
            Every component you can leave as a Server Component is JavaScript the browser never downloads, never parses, and
            never runs. &quot;Server by default&quot; means the framework assumes you want the cheap path, and asks you to explicitly
            opt out — with <code>&quot;use client&quot;</code> — only where interactivity actually requires it.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-what-runs-where" moduleSlug={MODULE_SLUG} title="What runs where">
        <Quiz
          kind="Defaults"
          question="In the Next.js App Router, a component file with no directive at the top is which kind of component?"
          options={[
            {
              label: "A Server Component — server is the default; you opt into the client with \"use client\"",
              correct: true,
              explanation:
                "Right. Every component in the app/ directory is a Server Component unless the file (or one it's imported from) starts with \"use client\". The default is server.",
            },
            {
              label: "A Client Component — components are interactive by default",
              explanation:
                "That's the old (Pages Router / CRA) model. In the App Router the default is the opposite: Server Components, which ship no JS and can't be interactive.",
            },
            {
              label: "Neither — you must always declare \"use server\" or \"use client\" explicitly",
              explanation:
                "No declaration is needed for a Server Component; it's the default. (\"use server\" marks a Server Action, which is a different feature, not a component directive.)",
            },
          ]}
        />
        <Quiz
          kind="Execution model"
          question="Where and when does a Client Component actually run?"
          options={[
            {
              label: "On the server first (to produce initial HTML), then again in the browser to hydrate and on every subsequent state change",
              correct: true,
              explanation:
                "Exactly. 'Client Component' doesn't mean client-only — it renders on the server for the initial HTML, ships its JS, then hydrates and re-renders in the browser.",
            },
            {
              label: "Only in the browser — its code never touches the server",
              explanation:
                "A common misconception. Client Components do a server-side render for the initial HTML (that's why you get fast first paint and SEO); they just also run in the browser.",
            },
            {
              label: "Only on the server, exactly like a Server Component",
              explanation:
                "No — that describes a Server Component. A Client Component additionally ships its JavaScript to the browser and re-runs there to handle interactivity.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. THE BOUNDARY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The <code>&quot;use client&quot;</code> boundary — and how it cascades</h2>
        <p className="mb-4">
          <code>&quot;use client&quot;</code> is a directive you put at the <em>very top</em> of a file, above the imports. It marks an
          <strong> entry point</strong> into the client bundle. The subtle, crucial part: it doesn&apos;t just affect that one
          file — it marks a <strong>boundary</strong>, and everything <em>imported by</em> that file becomes part of the client
          bundle too.
        </p>
        <pre><code>{`"use client"; // <- must be the first line, above imports

import { useState } from "react";
import { formatPrice } from "@/lib/format"; // this gets pulled into the client bundle too

export default function AddToCartButton({ productId }: { productId: string }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Add ({count})</button>;
}`}</code></pre>
        <p className="mb-4">
          Once a module is <code>&quot;use client&quot;</code>, every module it imports is part of the same client subtree. You only
          need the directive on the <em>top</em> file of a client subtree — the entry point. The components it imports become
          Client Components automatically; you don&apos;t repeat <code>&quot;use client&quot;</code> in each of them (though doing so is
          harmless).
        </p>
        <p className="mb-4">
          The direction of the boundary matters and trips people up. <strong>A Server Component can import and render a Client
          Component</strong> — that&apos;s the normal pattern (the server kitchen plates a salt shaker). But{" "}
          <strong>a Client Component cannot import a Server Component</strong> and have it run on the server, because once
          you&apos;re in the client bundle, there&apos;s no server left to run it on.
        </p>
        <Callout variant="warn" title="The mistake everyone makes once">
          <p>
            You write a Client Component (it needs <code>useState</code>), and inside it you import a component that does a
            database query. Suddenly your build complains, or your secret leaks. The fix is almost never &quot;make the inner one a
            Client Component too&quot; — it&apos;s to <strong>pass the server-rendered component in as a prop</strong> (usually
            <code> children</code>), so it&apos;s rendered on the server and merely <em>slotted into</em> the client component.
          </p>
        </Callout>
        <p className="mb-4">
          That slot pattern is the senior move. Instead of a Client Component <em>importing</em> server work, it accepts a
          <code> children</code> slot:
        </p>
        <pre><code>{`// ✅ The composition pattern: server content as children of a client wrapper.
// ClientTabs is a Client Component (needs onClick state).
// <ServerProductList /> is rendered ON THE SERVER and passed IN as children.

// app/page.tsx (Server Component)
export default function Page() {
  return (
    <ClientTabs>
      <ServerProductList /> {/* stays a Server Component — runs on the server */}
    </ClientTabs>
  );
}

// ClientTabs.tsx
"use client";
import { useState } from "react";
export function ClientTabs({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)}>Toggle</button>
      {open && children} {/* children was rendered on the server; we just place it */}
    </div>
  );
}`}</code></pre>
        <p className="mb-4">
          The Client Component never <em>imports</em> the Server Component — it receives the already-rendered output as a
          prop and decides where to put it. The server work stayed on the server; the client work stayed in the client. The
          boundary is respected.
        </p>
        <Callout variant="insight" title="Push the boundary down, not up">
          <p>
            The instinct to fix &quot;I need a click handler somewhere on this page&quot; by adding <code>&quot;use client&quot;</code> to the
            whole page is the wrong one — it drags the entire subtree into the bundle. Push the boundary <em>down</em> to the
            smallest leaf that actually needs it. A page can be a Server Component with a dozen tiny Client Component leaves;
            that&apos;s the shape you want.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. WHAT FORCES CLIENT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">What actually forces a component to be a Client Component</h2>
        <p className="mb-4">
          You don&apos;t reach for <code>&quot;use client&quot;</code> on a whim — there&apos;s a concrete checklist. A component <em>must</em> be a
          Client Component if it does any of these:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Uses state or lifecycle</strong> — <code>useState</code>, <code>useReducer</code>, <code>useEffect</code>, <code>useRef</code>, <code>useContext</code> (consuming a context), or any custom hook built on them.</li>
          <li><strong>Has event handlers</strong> — <code>onClick</code>, <code>onChange</code>, <code>onSubmit</code>, etc. These are functions that must run in the browser.</li>
          <li><strong>Uses browser-only APIs</strong> — <code>window</code>, <code>document</code>, <code>localStorage</code>, <code>navigator</code>, <code>IntersectionObserver</code>.</li>
          <li><strong>Uses class components or React features that require the client</strong> — e.g. error boundaries (which currently must be class components).</li>
          <li><strong>Depends on a third-party component</strong> that itself uses any of the above without being server-compatible.</li>
        </ul>
        <p className="mb-4">
          If none of those apply — the component just reads props/data and returns markup — leave it as a Server Component.
          That covers the large majority of a typical app: layouts, page shells, lists, cards, headers, footers, articles.
        </p>
        <Callout variant="info" title="A useful tie-breaker question">
          <p>
            Ask: <em>&quot;Does this component need to do something in response to the user, or read something that only exists in
            the browser?&quot;</em> If yes → Client. If it just needs data and renders output → Server. When in doubt, start
            Server; the build will tell you the moment you use something that requires the client.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-the-boundary" moduleSlug={MODULE_SLUG} title="The &quot;use client&quot; boundary">
        <Quiz
          kind="Boundary direction"
          question="You have a Client Component that needs to display a list whose data comes from a database query. What's the correct structure?"
          options={[
            {
              label: "Render the server-data component on the server and pass it into the Client Component as children (a slot), rather than importing it inside the client file",
              correct: true,
              explanation:
                "Correct. A Client Component can't import a Server Component and have it run server-side. The composition fix is to pass the server-rendered content in as children/props so it stays a Server Component.",
            },
            {
              label: "Import the database-query component directly inside the Client Component — \"use client\" cascades and handles it",
              explanation:
                "That's the trap. Importing it pulls it into the client bundle, so the DB query would try to run in the browser (leaking secrets / failing). Pass it as children instead.",
            },
            {
              label: "Add \"use server\" to the list component so it runs on the server even when imported by a client file",
              explanation:
                "\"use server\" marks Server Actions, not components, and doesn't change import semantics. The composition (children) pattern is the answer.",
            },
          ]}
        />
        <Quiz
          kind="Forces client"
          question="Which of these does NOT, by itself, force a component to be a Client Component?"
          options={[
            {
              label: "Doing an await fetch(...) / database read in the component body",
              correct: true,
              explanation:
                "Right — async data fetching is something Server Components do best, directly in the body. It does NOT force the client; it's the opposite, a reason to stay server.",
            },
            {
              label: "Calling useState to hold interactive state",
              explanation:
                "useState requires the client — there's no state/lifecycle on the server. This forces \"use client\".",
            },
            {
              label: "Attaching an onClick handler to a button",
              explanation:
                "Event handlers must run in the browser, so a component with onClick must be a Client Component.",
            },
            {
              label: "Reading window.localStorage",
              explanation:
                "Browser-only APIs like localStorage don't exist on the server, so the component must be client-side.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. SERIALIZATION ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Crossing the boundary — the serialization rule</h2>
        <p className="mb-4">
          When a Server Component renders a Client Component and passes it props, those props have to travel from the server
          to the browser. They get <strong>serialized</strong> — turned into data the framework sends over the wire and
          rebuilds on the client. That imposes a hard rule: <strong>props passed from a Server Component to a Client
          Component must be serializable.</strong>
        </p>
        <p className="mb-4">What&apos;s serializable (fine to pass across the boundary):</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>Primitives — strings, numbers, booleans, <code>null</code>, <code>undefined</code>, <code>bigint</code>.</li>
          <li>Plain objects and arrays made of serializable values.</li>
          <li>Dates, <code>Map</code>, <code>Set</code> (the RSC serializer handles these).</li>
          <li>Promises (you can pass a promise down and <code>use()</code> it in the client — a deliberate streaming feature).</li>
          <li><strong>JSX itself</strong> — you can pass server-rendered elements as <code>children</code> or any prop, because the rendered output is serializable. This is what powers the slot pattern.</li>
        </ul>
        <p className="mb-4">What&apos;s <em>not</em> serializable (will error if passed across the boundary):</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Functions</strong> — except Server Actions, which are a special, framework-handled exception (they serialize to a reference the client can call).</li>
          <li><strong>Class instances</strong> with methods/prototypes (e.g. a live database client, a class with behavior).</li>
          <li>Things tied to a runtime — open connections, streams, symbols (other than well-known ones).</li>
        </ul>
        <pre><code>{`// ❌ Won't work: passing a plain function across the boundary
// (Server Component)
<LikeButton onLike={() => doSomething()} /> // function isn't serializable

// ✅ Works: pass serializable data down; let the Client Component own the handler
// (Server Component)
<LikeButton postId={post.id} initialLikes={post.likes} />

// ✅ Works: pass a Server Action (the one allowed "function", handled specially)
<LikeButton postId={post.id} onLike={likePostAction} /> // likePostAction is "use server"`}</code></pre>
        <Callout variant="warn" title="Why a function can't cross (and why a Server Action can)">
          <p>
            An ordinary closure captures live JavaScript state on the server; there&apos;s no way to ship that closure&apos;s scope to
            the browser, so it can&apos;t be serialized. A <strong>Server Action</strong> is the deliberate exception: the framework
            serializes it to a <em>reference</em> (an ID + endpoint). The client doesn&apos;t get the function&apos;s code — it gets a
            token it can use to call back to the server. That&apos;s a different mechanism, which is why it&apos;s allowed.
          </p>
        </Callout>
        <Callout variant="insight" title="The interview phrasing">
          <p>
            &quot;Props crossing from a Server Component to a Client Component are serialized over the network, so they must be
            serializable: primitives, plain objects/arrays, Dates, even JSX — but not arbitrary functions or class instances.
            The one exception is Server Actions, which serialize to a callable reference rather than the function itself.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;explain Server vs Client Components&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Server by default.</strong> Every component is a Server Component unless marked <code>&quot;use client&quot;</code>.
              Server Components run only on the server, can <code>await</code> data directly, touch secrets/DB, and ship
              <em> zero JavaScript</em>.
            </li>
            <li>
              <strong>Client Components are interactivity islands.</strong> Marked with <code>&quot;use client&quot;</code>, they render
              on the server for the initial HTML, then ship JS and hydrate in the browser so they can use state, effects,
              events, and browser APIs.
            </li>
            <li>
              <strong>The directive marks a boundary that cascades.</strong> Everything a <code>&quot;use client&quot;</code> file imports
              joins the client bundle. A Server Component can render a Client Component, but not vice-versa by import — pass
              server content down as <code>children</code> instead.
            </li>
            <li>
              <strong>Props across the boundary must be serializable.</strong> Primitives, plain objects/arrays, Dates, JSX —
              yes; arbitrary functions and class instances — no; Server Actions are the special allowed exception.
            </li>
            <li>
              <strong>Push the boundary down.</strong> Keep pages/layouts server-side; make only the genuinely-interactive
              leaves client. That&apos;s how you keep the bundle small.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 8. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project — shrink the bundle by moving the boundary</h2>
        <p className="mb-4">
          Take a fully-client page and push everything that can be a Server Component server-side, marking only the
          genuinely-interactive leaves <code>&quot;use client&quot;</code> — then read the network tab to confirm the JS bundle shrank.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Start from the all-client version.</strong> Build (or take) a page where the top-level component is
            <code> &quot;use client&quot;</code> and fetches data in a <code>useEffect</code> — a product list with a search box and an
            &quot;add to cart&quot; button per row. Note the JS bundle size for the route in the Network tab.
          </li>
          <li>
            <strong>Make the page a Server Component.</strong> Remove <code>&quot;use client&quot;</code> from the top, delete the
            <code> useEffect</code> fetch, and <code>await</code> the data directly in the (now async) component body. The list
            rows and layout become Server Components for free.
          </li>
          <li>
            <strong>Identify the true interactive leaves.</strong> Which parts actually need the browser? The search input
            (state + onChange) and the add-to-cart button (onClick). Extract <em>only those</em> into small files marked
            <code> &quot;use client&quot;</code>.
          </li>
          <li>
            <strong>Wire the boundary correctly.</strong> The Server Component page renders the server-side list and slots the
            client search/button leaves in. Confirm the database/data access stays in the Server Component and never imports
            into a client file.
          </li>
          <li>
            <strong>Use the slot pattern once.</strong> Wrap the server-rendered list in a client &quot;collapsible section&quot;
            component by passing the list as <code>children</code>, proving you can nest server content inside a client wrapper
            without making the list client-side.
          </li>
          <li>
            <strong>Measure.</strong> Reload and compare the route&apos;s JS bundle to step 1. It should be dramatically smaller —
            you&apos;re now only shipping the search box and the button, not the whole page. Write down the before/after numbers;
            that delta is the entire point of the architecture.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            If you come from server work, Server Components will feel oddly familiar: it&apos;s server-side templating with the
            database right there in the handler — like a controller that returns a rendered view. The new part is that the
            framework can interleave <em>islands</em> of client-side interactivity into that server-rendered output and
            hydrate just those islands. Think &quot;server-rendered page with a few sprinkles of JS,&quot; not &quot;SPA that happens to
            prerender.&quot;
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-serialization" moduleSlug={MODULE_SLUG} title="Crossing the boundary">
        <Quiz
          kind="Serialization"
          question="A Server Component renders <Chart data={...} onPointClick={handleClick} />, where Chart is a Client Component. What's the problem?"
          options={[
            {
              label: "onPointClick is an ordinary function, which isn't serializable across the server→client boundary; the handler must live inside the Client Component (or be a Server Action)",
              correct: true,
              explanation:
                "Correct. Props from a Server Component to a Client Component are serialized over the wire. Plain functions can't be serialized; pass serializable data and own the handler in the client, or pass a Server Action.",
            },
            {
              label: "data can't be passed because objects aren't serializable",
              explanation:
                "Plain objects and arrays of serializable values ARE fine to pass. The problem is the function prop, not the data.",
            },
            {
              label: "Nothing is wrong; functions serialize automatically in the App Router",
              explanation:
                "Arbitrary functions do not serialize. Only Server Actions are the special, framework-handled exception — an ordinary closure like handleClick is not.",
            },
          ]}
        />
        <Quiz
          kind="Bundle reasoning"
          question={'A page is a Server Component containing 20 components. You add "use client" to the top-level page just to enable one onClick deep inside. What happens to the bundle?'}
          options={[
            {
              label: "All 20 components (everything imported by the now-client page) get pulled into the client bundle — the opposite of what you want",
              correct: true,
              explanation:
                "Exactly. \"use client\" marks a boundary that cascades to everything imported below it. The fix is to push the directive down to the single leaf that needs the onClick, keeping the rest server-side.",
            },
            {
              label: "Only the one component with the onClick ships to the browser; \"use client\" is smart about it",
              explanation:
                "No — the directive applies to the whole subtree imported from that file. Putting it at the top drags everything in. You must move it down to the interactive leaf.",
            },
            {
              label: "Nothing changes; \"use client\" only affects the file it's written in",
              explanation:
                "It affects the file AND everything it imports — that's the cascade. The bundle grows to include the whole subtree.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
