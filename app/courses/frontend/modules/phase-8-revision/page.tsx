import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

// Pure revision — no Checkpoints, no XP gates. Designed to be re-read in 15
// minutes the morning of an interview, not used as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

const MODULE_SLUG = "phase-8-revision";

export default function Phase8RevisionModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 8 · Module {mod.number} · Revision
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 8 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The quality reference card. Re-read this in 15 minutes the morning of an interview; jump back to the source module if anything is unfamiliar.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This is not new material — it is a <strong>map of Phase 8</strong>. Five modules on the qualities that separate a working app from a professional one — speed, access, correctness, and the tooling that keeps it healthy — compressed to the answers you actually need to say out loud. If a line here makes you blink, click through to the source module and re-read that section; if it makes you nod, keep going.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          Modules you&apos;re consolidating:{" "}
          <Link href="/courses/frontend/modules/rendering-performance" className="text-cyan-600 hover:underline">rendering &amp; bundle performance</Link>,{" "}
          <Link href="/courses/frontend/modules/accessibility-deep" className="text-cyan-600 hover:underline">accessibility</Link>,{" "}
          <Link href="/courses/frontend/modules/forms-a11y-ux" className="text-cyan-600 hover:underline">accessible forms &amp; UX</Link>,{" "}
          <Link href="/courses/frontend/modules/testing-frontend" className="text-cyan-600 hover:underline">front-end testing</Link>, and{" "}
          <Link href="/courses/frontend/modules/developer-experience" className="text-cyan-600 hover:underline">developer experience</Link>.
        </p>
      </section>

      {/* =============================================================== */}
      {/* SECTION 1 — Rendering & bundle performance */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">1 · Rendering &amp; bundle performance</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Core Web Vitals</strong>{" "}are the scoreboard: <strong>LCP</strong>{" "}(largest contentful paint — how fast the main content shows), <strong>INP</strong>{" "}(interaction to next paint — how snappy it feels when you click), and <strong>CLS</strong>{" "}(cumulative layout shift — how much the page jumps around). Optimize these, not vanity numbers.</li>
            <li>The biggest lever is almost always <strong>ship less JavaScript</strong>: <strong>code-split</strong>{" "}routes, <code>dynamic</code>{" "}import the heavy stuff that&apos;s below the fold, and push work to <strong>React Server Components</strong>{" "}so it never reaches the client bundle at all.</li>
            <li><strong>Avoid unnecessary re-renders</strong>{" "}— stable props, sensible component boundaries, and memoization only where the profiler proves it pays. A render problem and a network problem need opposite fixes; diagnose which one you have first.</li>
            <li><strong>Virtualize long lists</strong>{" "}— render only the rows in view rather than ten thousand DOM nodes — and <strong>optimize images</strong>{" "}(right format, right size, reserve space to avoid CLS).</li>
            <li>The rule above all rules: <strong>measure, don&apos;t guess</strong>. Use <strong>Lighthouse</strong>, the <strong>DevTools</strong>{" "}performance panel, and the <strong>React Profiler</strong>{" "}to find the single biggest offender before you touch anything — shotgun optimization wastes time and adds complexity.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 2 — Accessibility */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">2 · Accessibility</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Semantic HTML first.</strong>{" "}A real <code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, <code>&lt;nav&gt;</code>, or <code>&lt;label&gt;</code>{" "}gives you a role, keyboard behavior, and focus for free. A <code>&lt;div onClick&gt;</code>{" "}gives you none of that — you&apos;d have to rebuild all of it by hand, badly.</li>
            <li>The browser builds an <strong>accessibility tree</strong>{" "}from your DOM — each node has a <strong>role</strong>{" "}(what it is), a <strong>name</strong>{" "}(what it&apos;s called), and <strong>state</strong>{" "}(checked, expanded, disabled). That tree is what assistive tech reads, so it&apos;s what you&apos;re really building.</li>
            <li><strong>Keyboard operability + a visible focus ring</strong>{" "}are non-negotiable: every interactive thing must be reachable and usable with Tab/Enter/Space/arrows, and the user must be able to see where focus is. Don&apos;t remove the outline without replacing it.</li>
            <li>Mind <strong>color contrast</strong>{" "}— text has to meet WCAG contrast ratios against its background, and color alone can never be the only signal.</li>
            <li>The <strong>first rule of ARIA is don&apos;t</strong>{" "}— reach for native elements first and add ARIA only when there&apos;s no native equivalent for what you&apos;re building. Then test with a real <strong>screen reader</strong>, and hold the bar at <strong>WCAG</strong>.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 3 — Accessible forms & UX */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">3 · Accessible forms &amp; UX</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li><strong>Every input needs a real <code>&lt;label&gt;</code></strong>{" "}programmatically associated with it — placeholder text is not a label. Group related controls (a set of radios, an address block) with <code>&lt;fieldset&gt;</code>{" "}and a <code>&lt;legend&gt;</code>.</li>
            <li>Wire errors and hints to the field with <strong><code>aria-describedby</code></strong>, and flag the broken field with <strong><code>aria-invalid</code></strong>{" "}so assistive tech knows it failed — visual red is not enough on its own.</li>
            <li>Announce validation failures to screen readers with <code>role=&quot;alert&quot;</code>{" "}or an <strong><code>aria-live</code></strong>{" "}region, so a user who can&apos;t see the error still hears that something went wrong.</li>
            <li>On a failed submit, <strong>move focus to the first invalid field</strong>{" "}(or an error summary that links to each one) — don&apos;t leave the user hunting for what broke.</li>
            <li>Get the timing right: <strong>validate on blur, then re-validate on change</strong>{" "}once a field has been touched, so corrections feel live without nagging on the first keystroke. And help the keyboard with the right <code>inputmode</code>{" "}and <code>autocomplete</code>{" "}so phones and password managers do the right thing.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 4 — Front-end testing */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">4 · Front-end testing</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>The <strong>testing trophy</strong>{" "}is the shape to aim for — a little static analysis at the base, the most weight on <strong>integration</strong>{" "}tests (the best confidence-per-effort), some unit tests, and a thin layer of end-to-end on top.</li>
            <li><strong>React Testing Library</strong>{" "}pushes you to <strong>test behavior, not implementation</strong>: query the way a user finds things — <strong>by role and by label</strong>, not by CSS class or internal state — so a refactor that keeps behavior doesn&apos;t break your tests.</li>
            <li>Drive interactions with <strong><code>userEvent</code></strong>{" "}(it models real typing/clicking more faithfully than firing raw events), and handle async UI with <strong><code>findBy</code></strong>{" "}queries and <code>waitFor</code>{" "}rather than arbitrary timeouts.</li>
            <li><strong>Mock the network boundary, not the component.</strong>{" "}Use <strong>MSW</strong>{" "}to intercept requests so your component runs for real against fake responses — far more faithful than stubbing out the modules under test.</li>
            <li>Run it on <strong>Vitest</strong>{" "}or <strong>Jest</strong>; cover the critical user flow end-to-end with <strong>Playwright</strong>; and catch accessibility regressions in the unit layer with <strong>jest-axe</strong>.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 5 — Developer experience */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">5 · Developer experience</h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <li>Turn on <strong>TypeScript strict mode</strong>{" "}from day one — it moves whole classes of bugs (null/undefined, bad shapes) from runtime to your editor, where they&apos;re cheap to fix.</li>
            <li><strong>ESLint and Prettier are different jobs.</strong>{" "}ESLint is about <strong>correctness</strong>{" "}(catching real mistakes); Prettier is about <strong>formatting</strong>{" "}(making the bikeshedding go away). Let each do its job and don&apos;t fight them against each other.</li>
            <li>Catch problems before they land with <strong>husky + lint-staged</strong>{" "}pre-commit hooks (lint/typecheck the staged files), and back that up with <strong>CI gates</strong>{" "}that block a regression from merging.</li>
            <li>Small ergonomics compound: <strong>path aliases</strong>{" "}(<code>@/...</code>) instead of <code>../../../</code>{" "}import chains, and <strong>fast feedback</strong>{" "}from HMR so the edit-see loop stays tight.</li>
            <li>The throughline: <strong>make the right thing the easy thing</strong>{" "}and <strong>fail fast</strong>{" "}— the cheaper it is to do it correctly and the sooner mistakes surface, the healthier the codebase stays as the team grows.</li>
          </ul>
        </div>
      </section>

      {/* =============================================================== */}
      {/* SECTION 6 — The interview answers */}
      {/* =============================================================== */}
      <section className="not-prose mb-12">
        <h2 className="mb-4 text-2xl font-bold">6 · The interview answers</h2>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;a page feels slow — how do you approach making it faster?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;I measure before I touch anything — Lighthouse and the DevTools performance panel to find the single biggest offender, and the React Profiler if it&apos;s a render problem rather than a network one. I anchor on Core Web Vitals: LCP, INP, and CLS. Usually the biggest win is shipping less JavaScript — code-split routes, dynamically import heavy below-the-fold pieces, move work to Server Components. Then I&apos;ll virtualize long lists, optimize images, and kill unnecessary re-renders. The point is to fix the proven offender, not optimize blind.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what&apos;s the first rule of ARIA?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Don&apos;t use ARIA. Reach for semantic HTML first — a real <code>&lt;button&gt;</code>{" "}or <code>&lt;label&gt;</code>{" "}comes with the correct role, keyboard behavior, and focus built in, while a <code>&lt;div onClick&gt;</code>{" "}gives you none of that. The browser builds an accessibility tree of roles, names, and states, and native elements populate it for free. I only add ARIA when there&apos;s genuinely no native element for what I&apos;m building, and then I test it with the keyboard and a screen reader.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;how do you make a form error accessible?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Visual red isn&apos;t enough. I associate a real label with every input, wire the error message to the field with <code>aria-describedby</code>, and set <code>aria-invalid</code>{" "}on the broken field. I announce the failure to assistive tech with <code>role=&quot;alert&quot;</code>{" "}or an <code>aria-live</code>{" "}region, and on submit I move focus to the first invalid field or an error summary. For timing, I validate on blur and then re-validate on change once the field&apos;s been touched.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;what do you actually test on the front end?&quot;:</p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Behavior, not implementation. I follow the testing trophy — most of my weight on integration tests because they give the best confidence per effort, with a thin layer of Playwright e2e for the critical flow. With React Testing Library I query by role and label the way a user does, drive interactions with <code>userEvent</code>, and handle async with <code>findBy</code>/<code>waitFor</code>. I mock the network boundary with MSW rather than the component, so the component runs for real against fake responses.&quot;
          </p>
          <p className="mb-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200">If asked &quot;ESLint or Prettier — what&apos;s the difference?&quot;:</p>
          <p className="mb-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            &quot;Different jobs. ESLint is about correctness — catching real mistakes and risky patterns. Prettier is about formatting — it ends the bikeshedding by making style automatic. I run both, plus TypeScript strict mode to catch type bugs in the editor, and I enforce them with a pre-commit hook via husky and lint-staged and a CI gate that blocks regressions. The whole philosophy is make the right thing the easy thing and fail fast.&quot;
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
            <strong>Phase 9 — Interview Closers.</strong>{" "}You&apos;ve covered the whole stack of front-end skills — now Phase 9 turns it into interview performance: front-end system design and how to drive the whiteboard, debugging war stories told STAR-style, rapid-fire fundamentals answered in 60 seconds, live coding challenges, and the behavioral round and how to close strong.
          </p>
          <p className="mt-3 text-sm text-slate-600 italic dark:text-slate-400">
            Phase 9 content is rolling out — check back, or follow along as new modules ship.
          </p>
        </div>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
