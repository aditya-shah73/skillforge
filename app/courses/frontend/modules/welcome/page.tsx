import Link from "next/link";
import Callout from "@/components/Callout";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

export default function FrontendWelcomeModule() {
  const mod = getModuleBySlug("welcome")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 0 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Read this first. It&apos;s five minutes and will save you weeks of writing React you can&apos;t defend.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug="welcome" />
      </header>

      <section>
        <h2>Who this is for</h2>
        <p>
          You&apos;re an engineer who has <strong>shipped React for a year or two</strong>. Function components, <code>useState</code>, props, maybe a context here and there. The app works. Your features land. And yet, somewhere in the back of your mind, you suspect that you don&apos;t <em>really</em> know how any of this works.
        </p>
        <p>
          When the interviewer asks &quot;explain closures&quot;, you say &quot;a function that remembers its scope&quot; and then go quiet. When they say &quot;what does <code>this</code> refer to here?&quot;, you guess. When they ask why <code>useEffect</code> ran twice, you say &quot;StrictMode&quot; without being able to explain <em>why</em> that exists.
        </p>
        <p>
          What you want: <strong>front-end internals you can defend</strong>. Not just &quot;React works.&quot; <em>How</em> React works, why it works that way, and what trade-offs the framework is hiding from you. That&apos;s exactly what this course is for.
        </p>
      </section>

      <section>
        <h2>What this course <em>is</em></h2>
        <ul>
          <li><strong>JS-deep before React-deep.</strong>{" "}You can&apos;t reason about hooks without owning closures. You can&apos;t reason about <code>useEffect</code> without owning the event loop. Phase 1 is JavaScript foundations on purpose, skip it and the React chapters will feel like memorization.</li>
          <li><strong>Predict before you run.</strong>{" "}Every code snippet asks you to commit to an answer first. Reading code &quot;feels obvious&quot;; predicting it reveals what you actually know.</li>
          <li><strong>TypeScript and Next.js woven through.</strong>{" "}Not bolted on at the end. By the time you hit hooks, you&apos;ll be reading typed hook signatures. By the time you hit Next.js, you&apos;ll already know why server components are <em>possible</em>.</li>
          <li><strong>Interactive.</strong>{" "}Quizzes, snippet predictions, and checkpoints. You don&apos;t progress by clicking &quot;next&quot;, you progress by answering correctly.</li>
          <li><strong>Opinionated.</strong>{" "}When two patterns work, we&apos;ll tell you which one survives a code review at a senior level and why.</li>
        </ul>
      </section>

      <section>
        <h2>What this course is <em>not</em></h2>
        <ul>
          <li><strong>Not a React tutorial.</strong>{" "}If you&apos;ve never written a component, start with the official React docs first. This course assumes you can already build a CRUD app, we&apos;re going under the hood.</li>
          <li><strong>Not a CSS course.</strong>{" "}We&apos;ll touch CSS-in-JS trade-offs and accessibility, but layout, animation, and design systems aren&apos;t the focus. The interview signal we&apos;re training is engineering reasoning, not visual craft.</li>
          <li><strong>Not framework-agnostic.</strong>{" "}React-first. Patterns transfer (Vue/Svelte engineers will recognize most of Phase 1), but every code example is React + TypeScript.</li>
          <li><strong>Not a Next.js deep-dive.</strong>{" "}Phase 7 is intentionally light, App Router mental model, server vs client components, data fetching, routing, enough to be productive and answer interview questions. Building production Next.js apps is a different course.</li>
        </ul>
      </section>

      <section>
        <h2>What you&apos;ll need</h2>
        <ul>
          <li><strong>Node 20+</strong>{" "}and your editor of choice (VS Code or Cursor recommended)</li>
          <li>Comfort with the <strong>terminal</strong>,{" "}<code>npm</code>, <code>git</code>, running a dev server</li>
          <li>A <strong>browser with good devtools</strong>{" "}(Chrome or Firefox), you&apos;ll live in the Console, Sources, and Performance tabs</li>
          <li><strong>Predictive discipline.</strong>{" "}Every snippet says &quot;predict the output before running it.&quot; Skipping that step is the #1 way to finish the course feeling like you learned nothing.</li>
        </ul>
        <Callout variant="info" title="No prior TypeScript required">
          <p className="m-0">If you&apos;ve only written plain JS, that&apos;s fine, Phase 2 starts from zero. The TS notation you&apos;ll see in earlier examples (<code>: string</code>, <code>: number</code>) is the only piece you need until then, and it does exactly what it looks like.</p>
        </Callout>
      </section>

      <section>
        <h2>How the course works</h2>
        <p>
          The full syllabus spans <strong>10 phases</strong>,{" "}this welcome, JavaScript foundations, TypeScript, React mental model, hooks in depth, state &amp; data, advanced patterns, Next.js, performance &amp; a11y, and interview closers. <strong>All 57 modules are live</strong>,{" "}start at Phase 1 and work straight through, or jump to the phase you need.
        </p>
        <p>
          Each content module is a single page with the same rhythm:
        </p>
        <ol>
          <li><strong>Analogy</strong>, the intuition, before any syntax</li>
          <li><strong>Formula or pattern</strong>, what the concept actually is, with every part named</li>
          <li><strong>Worked example</strong>, predict the output, then read why</li>
          <li><strong>Variants</strong>, what changes in real code, where the gotchas live</li>
          <li><strong>Checkpoint</strong>, a quiz that tests the three bars below</li>
        </ol>
        <p>
          A checkpoint passes only when you can do three things:
        </p>
        <ul>
          <li>Explain the concept in <strong>2 minutes</strong>{" "}to a smart engineer who hasn&apos;t used React (no jargon)</li>
          <li><strong>Recognize it in code</strong>{" "}you didn&apos;t write, including the subtle wrong versions</li>
          <li><strong>Implement or re-derive it from scratch</strong>,{" "}no copy-paste, no peeking</li>
        </ul>
        <p>
          If you can&apos;t do all three, go back. The modules build on each other deliberately: hooks rely on closures, server components rely on the event loop, Suspense relies on promises. Skipping reinforcement will absolutely wreck a later chapter.
        </p>
      </section>

      <section>
        <h2>The course arc</h2>
        <p>
          The phases build deliberately:
        </p>
        <ul>
          <li><strong>Phase 1 · JavaScript You Can Defend</strong>,{" "}values vs references, closures, <code>this</code>, prototypes, the event loop, async patterns, modules &amp; bundlers. The foundation everything else stands on.</li>
          <li><strong>Phase 2 · TypeScript for React Engineers</strong>,{" "}the parts of TS that actually catch bugs: narrowing, generics, utility types, typing hooks and props well.</li>
          <li><strong>Phase 3 · React Mental Model</strong>,{" "}rendering, reconciliation, why keys matter, why props are the API contract, what state actually is.</li>
          <li><strong>Phase 4 · Hooks in Depth</strong>,{" "}<code>useState</code>, <code>useEffect</code>, <code>useRef</code>, <code>useMemo</code>, <code>useCallback</code>, and the closure traps every team writes by accident.</li>
          <li><strong>Phase 5 · State, Forms &amp; Data</strong>,{" "}lifting state, derived state, controlled vs uncontrolled, data fetching, error/loading patterns.</li>
          <li><strong>Phase 6 · Advanced React Patterns</strong>,{" "}compound components, context done right, render props, hooks composition, when to reach for a library.</li>
          <li><strong>Phase 7 · Next.js (App Router) Essentials</strong>,{" "}server vs client components, the data-fetching mental model, routing, what gets bundled where.</li>
          <li><strong>Phase 8 · Performance, A11y &amp; DX</strong>,{" "}rendering perf (and the React profiler), bundle perf, accessibility you can demo, the tooling that catches problems before review.</li>
          <li><strong>Phase 9 · Interview Closers</strong>,{" "}system design for front-end, the take-home framework, how to demo a project, the &quot;tell me about a hard bug&quot; story arc.</li>
        </ul>
      </section>

      <section>
        <h2>Time commitment</h2>
        <p>
          Phase 1 alone, the JavaScript foundations, runs about <strong>12–15 hours</strong>{" "}of focused work if you do every snippet honestly. At ~1 hour a day that&apos;s two to three weeks. By the end of just that phase you&apos;ll be able to defend JavaScript internals at a level that opens doors most React engineers never realize are closed to them.
        </p>
        <p>
          Subsequent phases vary, TS and the React internals chapters are dense; Next.js and the closers are lighter. Budget ranges are listed per module.
        </p>
      </section>

      <section>
        <h2>How to actually study (this part is not optional)</h2>
        <ol>
          <li><strong>Predict before you run.</strong>{" "}Every snippet labelled &quot;predict&quot;, commit to your answer in your head (or on paper) before peeking. The 30 seconds of being wrong is where the learning happens.</li>
          <li><strong>Open devtools.</strong>{" "}When the module says &quot;log this, then log this,&quot; open the Console and actually log it. Front-end is one of the few disciplines where the runtime is one keystroke away. Use it.</li>
          <li><strong>Re-derive, don&apos;t re-read.</strong>{" "}Coming back to a topic? Don&apos;t re-read. Close the page and write the explanation yourself first. The gap between what you can recognize and what you can reproduce is where interviewers live.</li>
          <li><strong>Talk it out.</strong>{" "}Real interviews require you to think aloud. Solve at least a few snippets by literally narrating your reasoning, to a friend, a rubber duck, or your phone&apos;s voice recorder.</li>
          <li><strong>Build the projects.</strong>{" "}Every module has a small build (a closure-driven debounce, a Promise polyfill, a bundle audit). They&apos;re short, they&apos;re hard, and they&apos;re the difference between &quot;I read about it&quot; and &quot;I can do it.&quot;</li>
        </ol>
        <Callout variant="insight" title="The single biggest mistake mid-level React engineers make">
          <p className="m-0">It&apos;s not lack of practice, it&apos;s practicing <em>at the framework level</em> when interviews probe the <em>language level</em>. You ship React features all day; the interviewer asks about closures, <code>this</code>, prototypes, the event loop. Without the JS-deep layer, you&apos;ll feel like the question came from another field. This course&apos;s Phase 1 exists to close exactly that gap.</p>
        </Callout>
      </section>

      <section>
        <h2>Progress tracking</h2>
        <p>
          Your progress lives in your browser&apos;s <code>localStorage</code>. Clearing site data wipes it. There&apos;s no account, no server, no tracking. If you switch browsers or machines, you&apos;ll start fresh.
        </p>
        <Callout variant="warn" title="One quirk to know">
          <p className="m-0">Some quizzes have a hidden state: they only mark as &quot;passed&quot; when you answer correctly. If you&apos;re scrolling past them without interacting, the module won&apos;t unlock its next section. Engage with every quiz, that&apos;s the whole point.</p>
        </Callout>
      </section>

      <section>
        <h2>How to get the most out of this</h2>
        <ol>
          <li><strong>Don&apos;t skip Phase 1.</strong>{" "}If you&apos;ve been shipping React for years, the temptation is to start with hooks. Resist it. The hooks chapter assumes you can already explain why a closure captured a stale value, and we cover that in Module 2.</li>
          <li><strong>Type aloud.</strong>{" "}When TypeScript shows up, narrate the inferred types: &quot;okay, so this is <code>string | undefined</code> here because…&quot; Reading types silently makes them feel magical; narrating them makes them feel obvious.</li>
          <li><strong>Use the React profiler.</strong>{" "}By the time you hit Phase 8, you should already have used the profiler on a real app at least once. It&apos;s built into React DevTools; don&apos;t let your first time be the interview.</li>
          <li><strong>Ship at least one Next.js page.</strong>{" "}When you reach Phase 7, build something tiny and deploy it. Vercel&apos;s free tier is built for this. Having a live URL to point at during an interview is worth more than any cert.</li>
        </ol>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-sky-950/40">
        <h3 className="mt-0 mb-2">Ready?</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 1 is values vs references, the misconception underneath half the React bugs you&apos;ve ever shipped.
        </p>
        <Link
          href="/courses/frontend/modules/values-references"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-cyan-600 hover:to-sky-600 hover:shadow-md"
        >
          Start Module 1: Values &amp; references →
        </Link>
      </section>
      <ModuleNav courseId="frontend" currentSlug="welcome" />
    </article>
  );
}
