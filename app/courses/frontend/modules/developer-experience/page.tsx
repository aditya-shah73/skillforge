import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "developer-experience";

const CHECKPOINTS = [
  { id: "cp-types-lint", title: "Types, lint, and format, three jobs" },
  { id: "cp-gates", title: "Hooks & CI, the safety net" },
  { id: "cp-feedback", title: "Fast feedback & ergonomics" },
];

export default function DeveloperExperienceModule() {
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
          Developer experience, the tooling that keeps a codebase healthy
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The best DX setup is invisible: it makes the <em>right</em> thing the <em>easy</em> thing, and it fails fast,
          on your machine, in seconds, instead of slowly, in production, days later. This module is about the tooling
          you set up on day one so that a whole team can move quickly without breaking things.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      {/* ───────────────────────── 1. ANALOGY ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The kitchen with guard rails</h2>
        <p className="mb-4">
          A professional kitchen isn&apos;t fast because the cooks are careful. It&apos;s fast because the <em>environment</em>
          {" "}makes mistakes hard to make and easy to catch. Knives live in the same slots so you grab the right one without
          looking. The pass has a checklist so no plate leaves missing a component. A thermometer beeps the instant the
          chicken is underdone, not after a customer gets sick. None of that slows a good cook down; it removes the
          thousand tiny ways a busy human gets it wrong.
        </p>
        <p className="mb-4">
          A codebase is the same. Left to willpower, &quot;remember to run the type checker,&quot; &quot;remember to format before you
          commit,&quot; and &quot;remember not to use that deprecated API&quot; all eventually fail, not because engineers are careless,
          but because humans under deadline pressure forget. <strong>Developer experience tooling is the kitchen&apos;s guard
          rails:</strong> it moves those &quot;remembers&quot; out of your head and into automated checks that run every time, the
          same way, for everyone.
        </p>
        <p className="mb-4">
          And crucially, it catches problems <em>early</em>, where they&apos;re cheap. A type error caught as you type costs
          seconds. The same bug caught in code review costs a teammate&apos;s afternoon. Caught in production, it costs an
          incident. The entire discipline of DX is about pushing that detection as far left as possible, closer to the
          keystroke, further from the customer.
        </p>
        <Callout variant="info" title="What this module is really about">
          <p>
            There&apos;s a layered defense, each layer faster and cheaper than the next one out: <strong>the type checker and
            editor</strong> (instant, as you type), <strong>the linter and formatter</strong> (on save / on demand),{" "}
            <strong>the pre-commit hook</strong> (before code leaves your machine), and <strong>CI</strong> (before code
            merges to the shared branch). Each catches a different class of problem. None is sufficient alone. Together
            they make &quot;ship a regression&quot; something you have to work hard to do.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 2. TYPESCRIPT STRICT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">TypeScript strictness, bugs that never reach runtime</h2>
        <p className="mb-4">
          TypeScript&apos;s value isn&apos;t the types you write; it&apos;s the bugs the compiler refuses to let you ship. But TypeScript
          is only as strict as you configure it to be. The single highest-leverage line in a front-end project is{" "}
          <code>&quot;strict&quot;: true</code> in <code>tsconfig.json</code>, it turns on a bundle of checks that, individually,
          each eliminate a whole category of runtime crash.
        </p>
        <pre><code>{`// tsconfig.json — the compiler options that earn their keep
{
  "compilerOptions": {
    "strict": true,                       // turns on strictNullChecks, noImplicitAny, and more
    "noUncheckedIndexedAccess": true,     // arr[i] is T | undefined, not T
    "noImplicitReturns": true,            // every code path must return
    "noFallthroughCasesInSwitch": true    // catch missing 'break'
  }
}`}</code></pre>
        <p className="mb-4">
          The headline check inside <code>strict</code> is <strong><code>strictNullChecks</code></strong>. Without it,{" "}
          <code>null</code> and <code>undefined</code> are assignable to everything, so the classic{" "}
          <code>Cannot read properties of undefined</code> crash sails right past the compiler. With it on, the compiler
          forces you to handle the &quot;it might not be there&quot; case <em>before</em> the code runs:
        </p>
        <pre><code>{`function greet(user: { name?: string }) {
  // With strictNullChecks, this is a COMPILE error:
  // 'user.name' is possibly 'undefined'.
  return user.name.toUpperCase();

  // The compiler makes you handle it:
  return user.name?.toUpperCase() ?? "Anonymous";
}`}</code></pre>
        <p className="mb-4">
          <strong><code>noUncheckedIndexedAccess</code></strong> is the quieter one that catches a stunning number of real
          bugs. By default TypeScript assumes <code>arr[i]</code> is always present, which is a lie, indexing past the
          end gives <code>undefined</code> at runtime. With this flag on, every indexed access is typed as{" "}
          <code>T | undefined</code>, so the compiler forces you to acknowledge the missing case:
        </p>
        <pre><code>{`const items = ["a", "b", "c"];

// Without the flag: 'first' is string. (But arr[99] is also "string" — a lie.)
// With noUncheckedIndexedAccess: 'first' is string | undefined.
const first = items[0];
console.log(first.toUpperCase()); // compile error until you handle undefined`}</code></pre>
        <Callout variant="insight" title="Strictness is a one-way ratchet, turn it on at the start">
          <p>
            On a fresh project, <code>strict</code> costs nothing, there&apos;s no code to fix. On a year-old project it can
            mean thousands of errors, so teams put it off forever and ship the bugs instead. The lesson:{" "}
            <strong>start strict.</strong> Every check you turn on is a category of runtime crash the compiler now catches
            for free, on every keystroke, before the code ever runs. That&apos;s the cheapest bug detection that exists.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 3. LINT vs FORMAT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">ESLint and Prettier, two different jobs, not competitors</h2>
        <p className="mb-4">
          New engineers often think ESLint and Prettier overlap and pick one. They don&apos;t overlap, they do{" "}
          <em>completely different jobs</em>, and a healthy project runs both. The clean way to remember it:{" "}
          <strong>Prettier decides how the code <em>looks</em>; ESLint decides whether the code is <em>correct</em>.</strong>
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Prettier, formatting.</strong> Indentation, quote style, semicolons, line width, where commas go. It
            has (almost) no opinions you can argue with because it reprints your code from the syntax tree. Run it and the
            whole file comes out in one canonical style. There is nothing to <em>decide</em> in review.
          </li>
          <li>
            <strong>ESLint, correctness &amp; quality.</strong> Rules about <em>behavior</em>: an unused variable, a
            missing <code>useEffect</code> dependency, a forbidden API, an <code>===</code> vs <code>==</code> mistake, an
            accidental <code>console.log</code>. These are potential <em>bugs</em>, not aesthetics.
          </li>
        </ul>
        <p className="mb-4">
          Here&apos;s the distinction made concrete. The two snippets below are <em>behaviorally identical</em>, Prettier
          cares about the difference; ESLint does not:
        </p>
        <pre><code>{`// Prettier's domain (pure formatting — both behave the same):
const x = {a:1,b:2}            // before
const x = { a: 1, b: 2 };      // after Prettier — same behavior, tidier

// ESLint's domain (a real correctness problem Prettier ignores):
useEffect(() => {
  doSomething(userId);
}, []);  // eslint: React Hook useEffect has a missing dependency: 'userId'`}</code></pre>
        <p className="mb-4">
          The missing <code>userId</code> dependency is a <em>bug</em>, the effect won&apos;t re-run when{" "}
          <code>userId</code> changes (exactly the kind of stale-closure issue you saw in the data-fetching module).
          Prettier would reformat that code without ever noticing. That&apos;s why you need both: one tool can&apos;t see what the
          other is looking for.
        </p>
        <Callout variant="warn" title="Don't make ESLint do formatting, it&apos;s the classic misconfiguration">
          <p>
            ESLint <em>can</em> enforce formatting rules (indentation, quotes), and historically people did. The problem:
            then ESLint and Prettier fight over the same code and you get conflicting auto-fixes and endless noise. The
            modern convention is to let <strong>Prettier own 100% of formatting</strong> and turn off ESLint&apos;s stylistic
            rules (e.g. via <code>eslint-config-prettier</code>), so ESLint focuses purely on <em>correctness</em>. Two
            tools, two non-overlapping jobs.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 1 ───────────────────────── */}
      <Checkpoint id="cp-types-lint" moduleSlug={MODULE_SLUG} title="Types, lint, and format, three jobs">
        <Quiz
          kind="ESLint vs Prettier"
          question="A teammate asks why the project runs both ESLint and Prettier instead of just one. What's the accurate answer?"
          options={[
            {
              label: "They do different jobs: Prettier owns formatting (how code looks), ESLint owns correctness/quality (potential bugs like a missing useEffect dependency or an unused variable)",
              correct: true,
              explanation:
                "Exactly. Prettier reprints code into one canonical style; ESLint analyzes for behavioral problems. A missing hook dependency is a real bug Prettier can't see, and quote style is an aesthetic ESLint shouldn't fight over. You run both, with formatting rules turned off in ESLint.",
            },
            {
              label: "They're redundant, Prettier is just a newer, better ESLint, so running both is wasteful",
              explanation:
                "They're not redundant. Prettier has no idea your useEffect is missing a dependency, and ESLint isn't the tool to decide line width. Picking one leaves a whole class of problems uncaught.",
            },
            {
              label: "ESLint is for formatting and Prettier is for catching bugs",
              explanation:
                "It's the reverse. Prettier owns formatting; ESLint owns correctness. The modern convention is to actively turn OFF ESLint's formatting rules so it doesn't fight Prettier.",
            },
          ]}
        />
        <Quiz
          kind="Strict TypeScript"
          question="What does turning on noUncheckedIndexedAccess actually change, and why is it useful?"
          options={[
            {
              label: "Indexed access like arr[i] becomes typed as T | undefined instead of T, forcing you to handle the case where the index is out of bounds, a real runtime crash the default config hides",
              correct: true,
              explanation:
                "Correct. By default TS pretends arr[i] is always present, which is a lie that lets 'undefined is not a function' crashes through. The flag types it as T | undefined so the compiler makes you handle the missing case before runtime.",
            },
            {
              label: "It makes array indexing faster at runtime by adding bounds checks",
              explanation:
                "TypeScript types are erased at compile time and add nothing at runtime. The flag changes what the compiler accepts, not runtime behavior or performance.",
            },
            {
              label: "It disallows using array indexes entirely; you must use .at() instead",
              explanation:
                "It doesn't ban indexing. It just widens the result type to include undefined so you're forced to acknowledge the out-of-bounds case. You can still write arr[i].",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 4. PRE-COMMIT HOOKS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Pre-commit hooks, fail before the code leaves your machine</h2>
        <p className="mb-4">
          Tools only help if they actually run. &quot;Please remember to run the linter before you commit&quot; is a wish, not a
          process, someone always forgets, and broken code lands on the shared branch. A <strong>pre-commit hook</strong>{" "}
          closes that gap: it runs your checks automatically as part of <code>git commit</code>, and if they fail, the
          commit is blocked. You physically cannot commit code that doesn&apos;t pass.
        </p>
        <p className="mb-4">
          In a front-end project the standard pairing is <strong>husky</strong> (which installs and manages the git hooks)
          plus <strong>lint-staged</strong> (which runs your tools only on the files you actually staged). The
          lint-staged part matters enormously:
        </p>
        <pre><code>{`// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}

// .husky/pre-commit  (husky wires this into git commit)
npx lint-staged`}</code></pre>
        <p className="mb-4">
          Why run only on <em>staged</em> files instead of the whole repo? Two reasons. First, <strong>speed</strong>:
          linting three changed files takes a second; linting ten thousand files takes a minute, and a slow hook is a hook
          people disable. Second, <strong>scope</strong>: you don&apos;t want a commit blocked by a pre-existing lint error in
          a file you never touched. The hook should hold <em>your change</em> to the bar, not the entire history.
        </p>
        <Callout variant="insight" title="The hook is a fast local mirror of CI, not a replacement for it">
          <p>
            A pre-commit hook gives near-instant feedback on the small slice you changed, so you catch the obvious stuff
            without waiting for a remote build. But hooks can be bypassed (<code>git commit --no-verify</code>) and only
            see staged files, so they are <em>not</em> a security boundary. The authoritative gate is CI, which we&apos;ll
            cover next. The hook&apos;s job is to make the common case fast; CI&apos;s job is to make the gate{" "}
            <strong>unskippable.</strong>
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 5. CI GATES ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">CI gates, the safety net nobody can skip</h2>
        <p className="mb-4">
          Continuous Integration is the layer that runs your checks on a neutral machine, on every pull request, before
          code is allowed to merge. It&apos;s the backstop precisely <em>because</em> it&apos;s not on anyone&apos;s laptop: it can&apos;t
          be skipped with <code>--no-verify</code>, it doesn&apos;t depend on what tools you happened to install, and it sees
          the whole change in a clean environment. A failing CI check blocks the merge, that&apos;s the whole point.
        </p>
        <p className="mb-4">
          A solid front-end CI pipeline runs four gates, each catching something the others can&apos;t:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Typecheck</strong> (<code>tsc --noEmit</code>), does it satisfy the type system?</li>
          <li><strong>Lint</strong> (<code>eslint .</code>), any correctness or quality rule violations?</li>
          <li><strong>Test</strong> (<code>vitest run</code> / <code>jest</code>), does the behavior still hold? (This is where the testing module pays off.)</li>
          <li><strong>Build</strong> (<code>next build</code> / <code>vite build</code>), does it actually compile and bundle for production?</li>
        </ul>
        <pre><code>{`# .github/workflows/ci.yml — runs on every pull request
name: CI
on: pull_request
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck   # tsc --noEmit
      - run: npm run lint        # eslint .
      - run: npm run test        # the test suite
      - run: npm run build       # the production build`}</code></pre>
        <p className="mb-4">
          The <strong>build</strong> gate is the one people underrate. Code can typecheck and lint clean and still fail to
          build, a bad dynamic import, a server/client boundary violation in the App Router, an environment variable
          missing at build time. CI runs the real production build so a broken build is caught in the PR, not at deploy
          time when it&apos;s an incident.
        </p>
        <Callout variant="warn" title="A gate only works if it&apos;s required">
          <p>
            CI that runs but doesn&apos;t <em>block</em> merges is theater, people merge red and the signal rots until
            everyone ignores it. The gate has teeth only when the branch is protected: <strong>merge is disabled until the
            checks pass.</strong> &quot;The check is green&quot; has to be a precondition for merging, not a suggestion. Otherwise
            you&apos;ve paid for the pipeline and kept none of the safety.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 2 ───────────────────────── */}
      <Checkpoint id="cp-gates" moduleSlug={MODULE_SLUG} title="Hooks & CI, the safety net">
        <Quiz
          kind="Why lint-staged"
          question="A pre-commit hook runs the linter and formatter via lint-staged on only the staged files, not the whole repo. Why is 'only staged files' the right design?"
          options={[
            {
              label: "Speed and scope: it's fast because it checks just a few changed files, and it won't block your commit on a pre-existing error in a file you never touched",
              correct: true,
              explanation:
                "Right. Linting the whole repo on every commit is slow enough that people disable the hook, and it would fail your commit over unrelated, pre-existing errors. Staged-only keeps the hook fast and scoped to your actual change.",
            },
            {
              label: "Because git only allows hooks to read staged files for security reasons",
              explanation:
                "That's not a git restriction, a hook can read the whole working tree. lint-staged scopes to staged files by design, for speed and to avoid blocking on unrelated pre-existing errors, not because git forces it.",
            },
            {
              label: "Running on all files would change files you didn't intend to commit, corrupting git history",
              explanation:
                "It wouldn't corrupt history. The real reasons to scope to staged files are speed and not failing your commit over pre-existing issues in untouched files.",
            },
          ]}
        />
        <Quiz
          kind="Hooks vs CI"
          question="If a pre-commit hook already runs lint and typecheck locally, why do you still need the same checks in CI?"
          options={[
            {
              label: "Hooks can be bypassed (--no-verify), depend on each person's local setup, and only see staged files, CI runs on a neutral machine on every PR and can be made an unskippable, required gate before merge",
              correct: true,
              explanation:
                "Exactly. The hook is a fast local convenience; CI is the authoritative backstop. CI can't be skipped, doesn't depend on what someone installed locally, sees the whole change in a clean env, and (with branch protection) blocks merge until green.",
            },
            {
              label: "They're redundant, if you trust the pre-commit hook you can remove CI entirely",
              explanation:
                "Not redundant. A hook is bypassable and local; remove CI and anyone who commits with --no-verify or has a misconfigured machine ships broken code to the shared branch. CI is the gate that can't be skipped.",
            },
            {
              label: "CI is only for running the production build; lint and typecheck shouldn't run there",
              explanation:
                "CI should run typecheck, lint, test, AND build. Running lint/typecheck in CI is exactly what makes them unskippable, since the local hook can be bypassed.",
            },
          ]}
        />
      </Checkpoint>

      {/* ───────────────────────── 6. FAST FEEDBACK ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Fast feedback loops, why build and reload time is a feature</h2>
        <p className="mb-4">
          The most underrated DX metric is the length of your feedback loop: the time between making a change and{" "}
          <em>seeing whether it worked.</em> When that loop is sub-second, you stay in flow and experiment freely. When
          it&apos;s ten seconds, you context-switch, lose your place, and try fewer things. Loop length quietly shapes how good
          your code gets.
        </p>
        <p className="mb-4">
          The hero of the inner loop is <strong>Hot Module Replacement (HMR)</strong>. The dev server watches your files
          and, when one changes, swaps <em>just that module</em> into the running app without a full page reload, so your
          component state, your scroll position, the form you half-filled-in all survive. You see the change essentially
          instantly:
        </p>
        <pre><code>{`// Edit this, save, and HMR swaps the module in place —
// the count below does NOT reset to 0. No full reload.
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
  //                                                   ^ change the label,
  //                                                     state is preserved
}`}</code></pre>
        <p className="mb-4">
          The <strong>bundler</strong> is what makes (or breaks) that speed, and you should understand the choices at a
          high level even if you rarely configure them by hand:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>webpack</strong>, the long-time default (and what older Next.js used). Mature and infinitely
            configurable, but bundles a lot up front, so cold starts and rebuilds on big apps can be slow.
          </li>
          <li>
            <strong>Vite</strong>, serves source over native ES modules in dev (almost no bundling up front, so the dev
            server starts near-instantly) and uses an optimized bundler for production. The modern default for non-Next
            front-end apps.
          </li>
          <li>
            <strong>Turbopack</strong>, Next.js&apos;s newer Rust-based bundler aimed at the same goal: very fast cold starts
            and incremental rebuilds, so HMR stays snappy as the app grows.
          </li>
        </ul>
        <p className="mb-4">
          The throughline across all three is the same goal, <strong>minimize the time from save to seeing the
          result.</strong> Build time isn&apos;t a vanity number; a slow dev server taxes every single change a team makes all
          day, which is why so much engineering goes into making it fast.
        </p>
        <Callout variant="info" title="The CI build and the dev loop are different machines">
          <p>
            Don&apos;t conflate them. The dev server is optimized for <em>incremental</em> speed (change one file, see it now)
            and skips production optimizations. The production build is optimized for <em>output</em> (minification, tree
            shaking, code splitting) and is allowed to be slower because it runs once per deploy. A fast dev loop and a
            thorough production build are both worth having, for different reasons.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 7. ERGONOMICS ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The small ergonomics that compound, aliases, editors, commits</h2>
        <p className="mb-4">
          Beyond the big gates, a pile of small conveniences each save a few seconds per use, and a few seconds, repeated
          thousands of times across a team, is the real payoff. These are the &quot;set it up on day one&quot; investments.
        </p>
        <p className="mb-4">
          <strong>Path aliases</strong> kill the <code>../../../</code> import spaghetti. You map a prefix like{" "}
          <code>@/</code> to your source root once, and imports become absolute and stable no matter how deep the file is
          or where you move it:
        </p>
        <pre><code>{`// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }   // @/ now means the project root
  }
}

// Before: brittle, breaks when you move the file
import Button from "../../../components/Button";

// After: stable and readable (the same @/ you see across this course)
import Button from "@/components/Button";`}</code></pre>
        <p className="mb-4">
          <strong>Editor integration</strong> is where most of these tools actually pay off, because it pulls the feedback
          loop all the way to the keystroke. The TypeScript language server underlines errors as you type; an ESLint
          plugin shows lint problems inline; &quot;format on save&quot; runs Prettier so you never think about formatting at all.
          A checked-in editor config (e.g. <code>.vscode/settings.json</code> and recommended extensions) means a new
          teammate gets the same setup automatically instead of configuring it by tribal knowledge.
        </p>
        <p className="mb-4">
          <strong>Conventional commits</strong> give commit messages a tiny grammar, <code>feat:</code>,{" "}
          <code>fix:</code>, <code>chore:</code>, <code>docs:</code>, that humans and tools can both read. The payoff is
          automation: tools like <strong>changesets</strong> read that history to decide the next version number and
          generate a changelog automatically, instead of someone hand-curating release notes:
        </p>
        <pre><code>{`feat: add dark-mode toggle to settings page   # a new feature  -> minor bump
fix: prevent crash when user has no avatar    # a bug fix      -> patch bump
chore: bump eslint to v9                       # tooling, no release

# A "feat" suggests a minor version bump, a "fix" a patch — tools like
# changesets read these to version and write the changelog for you.`}</code></pre>
        <Callout variant="insight" title="The throughline, make the right thing the easy thing">
          <p>
            Every tool in this module follows one principle: <strong>make the correct path the path of least
            resistance.</strong> Format-on-save means correct formatting takes zero effort. A path alias means the readable
            import is the easy one to type. A pre-commit hook means passing checks is automatic, not a chore you have to
            remember. When the right thing is the easy thing, an entire team does the right thing by default, and that&apos;s
            what keeps a codebase healthy as it grows.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── 8. 60-SECOND ANSWER ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The 60-second answer (memorize this)</h2>
        <Callout variant="insight" title="If someone asks &quot;how do you keep a front-end codebase healthy?&quot;">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Strict types.</strong> <code>strict: true</code> plus <code>noUncheckedIndexedAccess</code>, the
              compiler catches whole classes of crash before runtime. Turn it on day one, while it&apos;s free.
            </li>
            <li>
              <strong>Lint and format are different jobs.</strong> Prettier owns how code <em>looks</em>; ESLint owns
              whether it&apos;s <em>correct</em>. Run both; turn off ESLint&apos;s formatting rules so they don&apos;t fight.
            </li>
            <li>
              <strong>Layered gates, fastest first.</strong> Editor/type checker (instant) → linter/formatter (on save) →
              pre-commit hook via husky + lint-staged on staged files (before commit) → CI typecheck/lint/test/build
              (before merge, unskippable).
            </li>
            <li>
              <strong>CI must block merge.</strong> A check that runs but doesn&apos;t gate is theater, protect the branch so
              red can&apos;t merge.
            </li>
            <li>
              <strong>Fast feedback is a feature.</strong> HMR and a quick dev server (Vite/Turbopack) keep the save-to-see
              loop short; that&apos;s why bundler/build speed matters.
            </li>
            <li>
              <strong>The throughline:</strong> make the right thing the easy thing, and fail fast, close to the keystroke,
              far from the customer.
            </li>
          </ul>
        </Callout>
      </section>

      {/* ───────────────────────── 9. THE PROJECT ───────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">The project, build a quality gate, then watch it catch a regression</h2>
        <p className="mb-4">
          You&apos;ll set up a front-end project&apos;s quality gate from scratch, ESLint + Prettier + TS strict + a pre-commit
          hook running lint/typecheck, plus a CI step, then deliberately break a rule and watch each layer catch it.
          Feeling the gate slam shut on a bad change is what makes the whole discipline click.
        </p>
        <ol className="mb-4 list-decimal space-y-3 pl-6">
          <li>
            <strong>Turn on strict TypeScript.</strong> In <code>tsconfig.json</code> set <code>&quot;strict&quot;: true</code> and{" "}
            <code>&quot;noUncheckedIndexedAccess&quot;: true</code>. Then write a function that does <code>arr[0].toUpperCase()</code>{" "}
            and confirm the compiler now flags it as possibly <code>undefined</code>, a runtime crash caught at compile
            time. Add a path alias (<code>@/*</code>) and convert a deep relative import to it.
          </li>
          <li>
            <strong>Add Prettier and ESLint as separate jobs.</strong> Install both, add <code>eslint-config-prettier</code>{" "}
            so ESLint stops policing formatting, and add <code>format</code> and <code>lint</code> scripts. Prove the split:
            mangle a file&apos;s spacing (Prettier fixes it) and add an unused variable (ESLint flags it). Two different tools,
            two different problems.
          </li>
          <li>
            <strong>Wire up the pre-commit hook.</strong> Add husky + lint-staged so <code>git commit</code> runs{" "}
            <code>eslint --fix</code> and <code>prettier --write</code> on staged files only. Stage a file with a lint error
            and try to commit. Watch the commit get blocked. Confirm an untouched, pre-existing error elsewhere does{" "}
            <em>not</em> block you.
          </li>
          <li>
            <strong>Add a CI workflow.</strong> Create <code>.github/workflows/ci.yml</code> that runs typecheck, lint,
            test, and build on every pull request. Open a PR and watch the four checks run on a clean machine.
          </li>
          <li>
            <strong>Break a rule on purpose and watch the gate catch it.</strong> Push a commit that fails typecheck (or
            lint), bypassing the local hook with <code>--no-verify</code>. Observe CI go red and, with branch protection
            on, the merge button disabled. This is the moment the safety net proves it can&apos;t be skipped.
          </li>
          <li>
            <strong>Stretch, fast feedback &amp; versioning.</strong> Run the dev server, edit a component, and confirm HMR
            preserves state across the change. Then adopt conventional commits and add changesets so a <code>feat:</code> /{" "}
            <code>fix:</code> history generates a version bump and changelog automatically.
          </li>
        </ol>
        <Callout variant="spring" title="Backend-engineer footnote">
          <p>
            You already know this discipline from the server side. You just call it different names. <code>strict</code>{" "}
            TypeScript is your compiler warnings turned to errors; the pre-commit hook is the local mirror of a build; CI
            gates are the same required status checks you put on a service repo before deploy. The front-end-specific twist
            is the <strong>inner loop</strong>: because you&apos;re editing UI you watch in a browser, save-to-see latency (HMR,
            dev-server speed) is a first-class concern in a way it rarely is for a backend service. Same philosophy, fail
            fast, automate the &quot;remembers&quot;, tuned for a feedback loop measured in milliseconds.
          </p>
        </Callout>
      </section>

      {/* ───────────────────────── CHECKPOINT 3 ───────────────────────── */}
      <Checkpoint id="cp-feedback" moduleSlug={MODULE_SLUG} title="Fast feedback & ergonomics">
        <Quiz
          kind="HMR"
          question="You edit a component's label and save. With Hot Module Replacement working, what happens to the component's existing state (e.g. a counter at 7)?"
          options={[
            {
              label: "HMR swaps just the changed module into the running app without a full reload, so the counter stays at 7, you see the new label with state preserved",
              correct: true,
              explanation:
                "Right. HMR replaces only the edited module in place rather than reloading the page, so component state, scroll position, and form input survive. That preserved state is exactly what makes the save-to-see loop feel instant.",
            },
            {
              label: "The whole page reloads, so the counter resets to 0, that's the point of HMR",
              explanation:
                "That describes a full reload, which is what HMR avoids. HMR's whole value is swapping the module without a reload so state is preserved.",
            },
            {
              label: "HMR recompiles the entire production bundle before showing the change, so there's a multi-second pause",
              explanation:
                "HMR is an incremental dev-server feature, not a production build. It updates just the changed module quickly; the slow full production build is a separate concern that runs at deploy/CI time.",
            },
          ]}
        />
        <Quiz
          kind="DX philosophy"
          question="What's the unifying principle behind format-on-save, path aliases, and pre-commit hooks?"
          options={[
            {
              label: "Make the right thing the easy thing (and fail fast): automate the 'remembers' so the correct path is the path of least resistance and problems surface close to the keystroke",
              correct: true,
              explanation:
                "Exactly. Each tool removes a manual 'remember to...' and shifts detection earlier and cheaper. When doing it correctly is automatic and effortless, a whole team does it right by default, that's what keeps a codebase healthy as it scales.",
            },
            {
              label: "Reduce the number of dependencies in the project to keep installs small",
              explanation:
                "These tools actually add dependencies. The point isn't fewer deps, it's automating correctness so the easy path is the right path and failures surface early.",
            },
            {
              label: "Lock developers into one editor so everyone's setup is identical",
              explanation:
                "Checked-in editor config helps consistency, but the broader principle isn't lock-in, it's making the correct thing effortless and catching problems fast, regardless of editor.",
            },
          ]}
        />
      </Checkpoint>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
