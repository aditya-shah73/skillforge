import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-5-revision";

export default function Phase5RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 5 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 5 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The data-layer reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material, it is a <strong>map of Phase 5</strong>. Five modules on where state lives and how data flows, compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/controlled-uncontrolled" className="text-cyan-600 hover:underline">controlled vs uncontrolled</Link>,{" "}
          <Link href="/courses/frontend/modules/forms-validation" className="text-cyan-600 hover:underline">forms &amp; validation</Link>,{" "}
          <Link href="/courses/frontend/modules/data-fetching" className="text-cyan-600 hover:underline">data fetching</Link>,{" "}
          <Link href="/courses/frontend/modules/server-cache-state" className="text-cyan-600 hover:underline">server cache state</Link>, and{" "}
          <Link href="/courses/frontend/modules/global-url-state" className="text-cyan-600 hover:underline">where state should live</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Controlled vs uncontrolled inputs */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · Controlled vs uncontrolled inputs</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>The whole question is <strong>who owns the value</strong>,{" "}React state or the DOM. That single choice decides everything else about the input.</li>
            <li><strong>Controlled</strong>{" "}= <code>value</code>{" "}+ <code>onChange</code>. React state is the <strong>single source of truth</strong>; the input renders whatever state says, and every keystroke fires <code>onChange</code>{" "}→ <code>setState</code>{" "}→ a re-render. You can read, transform, or veto each keystroke.</li>
            <li><strong>Uncontrolled</strong>{" "}= <code>defaultValue</code>{" "}+ a <code>ref</code>. The DOM owns the value; you set the initial value once and <strong>read it off the ref on submit</strong>. No per-keystroke re-renders.</li>
            <li>The classic bug: a <code>value</code>{" "}<strong>with no <code>onChange</code></strong>{" "}freezes the field, React pins it to that value and there&apos;s nothing to update state, so typing does nothing. (Use <code>defaultValue</code>{" "}if you wanted it uncontrolled.)</li>
            <li><strong>File inputs are always uncontrolled</strong>,{" "}you can&apos;t set their value programmatically for security reasons, so you always read them off a ref.</li>
            <li>Decision rule: if you need to <strong>react to every keystroke</strong>{" "}(live validation, formatting, dependent fields, a disabled submit), go controlled. If you just need the final values on submit, uncontrolled is simpler and cheaper.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Forms & validation */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Forms &amp; validation</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Timing is a UX decision</strong>: <code>on-submit</code>{" "}(latest, least noisy), <code>on-blur</code>{" "}(validate when the user leaves a field), or <code>on-change</code>{" "}(every keystroke, can feel naggy). <strong>On-blur is the usual sweet spot</strong>,{" "}then switch a field to on-change <em>once it&apos;s been touched</em>{" "}so corrections feel live.</li>
            <li>Track <strong>touched</strong>{" "}(has the user visited this field?), <strong>dirty</strong>{" "}(has the value changed?), and <strong>error</strong>{" "}per field, so you <strong>don&apos;t show an error before the user has even interacted</strong>{" "}with it.</li>
            <li><strong>Hand-rolled forms rot.</strong>{" "}They start small, then accrete touched/dirty/error bookkeeping, cross-field rules, and re-render churn until the component is unmaintainable.</li>
            <li><strong>react-hook-form</strong>{" "}leans on <strong>uncontrolled inputs + subscriptions</strong>: it reads values off refs and only re-renders the pieces that subscribe to a given field, so you get <strong>far fewer re-renders</strong>{" "}than a fully controlled form.</li>
            <li>Pair it with a <strong>zod resolver</strong>{" "}to validate against a schema, one source of truth for both the runtime checks and the inferred TypeScript types.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Data fetching & the race condition */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · Data fetching &amp; the race condition</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><code>useEffect</code>{" "}+ <code>fetch</code>{" "}is the <strong>wrong default</strong>,{" "}it works in a demo but leaves you to hand-roll caching, dedup, retries, and race handling that a real cache library gives you for free.</li>
            <li>The <strong>fast-typing race condition</strong>: the user types quickly, request A fires then request B fires; if <strong>A resolves after B</strong>, A&apos;s stale results overwrite B&apos;s and the UI shows the wrong data for the current query.</li>
            <li>Fix it in the effect cleanup, either an <code>ignore</code>{" "}flag (set <code>ignore = true</code>{" "}in cleanup and bail out when the response comes back) or an <code>AbortController</code>{" "}(call <code>controller.abort()</code>{" "}in cleanup to cancel the in-flight request).</li>
            <li>Treat <strong>loading / error / empty / data</strong>{" "}as <strong>first-class states</strong>, not afterthoughts, empty (a successful response with no results) is distinct from loading and from error, and each deserves its own render branch.</li>
            <li>Avoid <strong>request waterfalls</strong>{" "}(fetch A, await it, then fetch B) when the requests are independent, fire them together with <code>Promise.all</code>{" "}so they run in parallel.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Server cache is not client state */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Server cache is not client state</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Server data is a <strong>cache</strong>,{" "}a <em>stale copy</em>{" "}of something the server owns, <strong>not state you own</strong>. The server can change it from under you at any time; your copy is only ever an approximation.</li>
            <li>Treating that cache like ordinary client state is a <strong>category error</strong>, and it&apos;s exactly why hand-rolled <code>useState</code>{" "}+ <code>useEffect</code>{" "}fetching hurts: you end up reinventing cache invalidation badly.</li>
            <li><strong>React Query</strong>{" "}(TanStack Query) gives you this category as a tool: <strong>caching, staleness</strong>{" "}(<code>staleTime</code>), <strong>request dedup</strong>, <strong>background refetch</strong>, and <strong>retry</strong>,{" "}all out of the box.</li>
            <li>The <strong><code>queryKey</code>{" "}IS the cache identity.</strong>{" "}Same key → same cache entry (dedup &amp; sharing); change the key → a different entry and a fresh fetch. Put every input the query depends on into the key.</li>
            <li>For writes, use <strong>mutations</strong>{" "}with <strong>optimistic updates</strong>{" "}(update the cache immediately, roll back on error) and <code>invalidateQueries</code>{" "}to mark affected entries stale so they refetch.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Where state should live */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Where state should live</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>The decision tree, top to bottom: <strong>server data → a cache</strong>{" "}(React Query); <strong>shareable / bookmarkable → the URL</strong>; <strong>used by one subtree → local or lifted state</strong>; <strong>read by truly distant parts → global</strong>.</li>
            <li>Most things people call &quot;global state&quot; are actually <strong>server cache or URL state</strong>{" "}in disguise, name the category correctly first and the genuinely-global slice usually shrinks to almost nothing.</li>
            <li>The <strong>URL</strong>{" "}(<code>searchParams</code>) is underrated state: filters, sort, pagination, and the active tab belong there, it&apos;s <strong>shareable, bookmarkable, and back-button-friendly</strong>{" "}for free.</li>
            <li>For genuinely-global client state, climb the ladder <strong>Context → Zustand → Redux</strong>, and justify each step by scale: Context for slow-changing app-wide values, Zustand when re-render granularity matters, Redux only when you need its full ecosystem (devtools, middleware, strict conventions).</li>
            <li>Lift state to the <strong>closest common ancestor</strong>{" "}of the components that need it, no higher. Lifting too far makes everything below re-render and couples unrelated parts of the tree.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;controlled vs uncontrolled, which do you use and why?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;It&apos;s about who owns the value. Controlled means React state is the source of truth, <code>value</code>{" "}+ <code>onChange</code>, a re-render per keystroke, so I can validate, format, or veto input live. Uncontrolled lets the DOM own the value, <code>defaultValue</code>{" "}+ a ref, read on submit, no per-keystroke renders. My rule: if I need to react to every keystroke I go controlled; if I just need the final values, uncontrolled is simpler. And file inputs are always uncontrolled.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;my search shows the wrong results when I type fast, what&apos;s happening?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;That&apos;s a race condition. Two requests are in flight and the earlier one resolves last, so its stale results overwrite the newer query&apos;s. The fix lives in the effect cleanup: set an <code>ignore</code>{" "}flag and discard the response if it&apos;s been superseded, or use an <code>AbortController</code>{" "}to cancel the in-flight request when the input changes. A cache library like React Query handles this for me by keying on the query.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;why not just <code>useState</code>{" "}+ <code>useEffect</code>{" "}for server data?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Because server data is a cache, not client state, a stale copy of something the server owns. Treating it like ordinary state is a category error, and you end up hand-rolling caching, dedup, staleness, retries, and race handling, badly. React Query gives you that category as a tool: the <code>queryKey</code>{" "}is the cache identity, with <code>staleTime</code>, background refetch, dedup, and optimistic mutations with <code>invalidateQueries</code>.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;where should this piece of state live?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I run it down a tree. Is it server data? Then it&apos;s a cache, not state. Should it be shareable or bookmarkable, filters, sort, the active tab? Then the URL. Used by one subtree? Local state, lifted to the closest common ancestor. Only truly distant parts of the app reading the same value justifies global. Most &lsquo;global state&rsquo; turns out to be server cache or URL state once you name the category.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;when do you reach for Redux?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Rarely, and only after climbing the ladder. Context for slow-changing app-wide values; Zustand when I need finer re-render granularity without ceremony; Redux only when the scale genuinely warrants its ecosystem, devtools, middleware, strict conventions on a large team. And first I&apos;d check whether the &lsquo;global&rsquo; state is actually server cache or URL state, because usually it is, and then I don&apos;t need any of them.&quot;
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
            <strong>Phase 6, Advanced React Patterns.</strong>{" "}You now own state, forms, and data flow, the everyday toolkit. Phase 6 goes to the advanced patterns: performance at scale, Suspense and concurrent features, error boundaries, portals, and the patterns that separate senior React engineers from competent ones.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 6 and every later phase are live, keep going while state and data are fresh.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
