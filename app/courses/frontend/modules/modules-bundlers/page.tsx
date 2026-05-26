import Link from "next/link";
import Callout from "@/components/Callout";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import { getModuleBySlug } from "@/lib/courses/frontend";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";
import ModuleProgress from "@/components/ModuleProgress";

const MODULE_SLUG = "modules-bundlers";

const CHECKPOINTS = [
  { id: "cp-esm-cjs", title: "ESM vs CommonJS, and why it matters" },
  { id: "cp-tree-shaking", title: "Tree-shaking and side effects" },
  { id: "cp-bundle", title: "Reading a Next.js bundle output" },
];

export default function ModulesBundlersModule() {
  const mod = getModuleBySlug(MODULE_SLUG)!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/frontend" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Modules, bundlers, and what ships to the browser
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Every <code>import</code>{" "}you write becomes a dependency in a graph the bundler walks. What lands in your <code>main.js</code>{" "}— and what doesn&apos;t — is mostly determined by how you wrote those imports.
        </p>
        <BookmarkButton courseId="frontend" moduleSlug={MODULE_SLUG} />
        <ModuleProgress moduleSlug={MODULE_SLUG} checkpoints={CHECKPOINTS} />
      </header>

      <section>
        <h2>The analogy</h2>
        <p>
          Picture your app as a city. Every <code>.js</code>{" "}file is a building. Every <code>import</code>{" "}is a road between two buildings. The bundler is a city planner with one job: when a visitor (the browser) lands at a specific entry point, hand them a single delivery truck that contains every building they could possibly need to reach from there.
        </p>
        <p>
          A <em>good</em>{" "}city planner reads the roads carefully — if no road ever leads to building X, building X stays at the warehouse (that&apos;s tree-shaking). A <em>lazy</em>{" "}planner just trucks the whole city in &quot;just in case.&quot; The difference between those two strategies is the difference between a 60KB bundle and a 600KB bundle.
        </p>
        <p>
          This module teaches you how to read those roads (your import statements) the way the bundler does — so you can predict what ships, audit a real bundle output, and answer the interview question <em>&quot;why is your bundle so big?&quot;</em>{" "}with a real answer.
        </p>
      </section>

      <section>
        <h2>The formula: a module is a file with explicit boundaries</h2>
        <p>
          A <strong>module</strong>{" "}is a file that says, explicitly: &quot;these are the names I export&quot; and &quot;these are the names I import.&quot; Everything else inside the file is private. Modules let you build big programs out of small, independently-understandable pieces.
        </p>
        <p>JavaScript has had two competing module systems. You will see both in the wild:</p>
        <ol>
          <li><strong>CommonJS (CJS)</strong>{" "}— the old Node format. Synchronous, dynamic. Uses <code>require()</code>{" "}and <code>module.exports</code>. Resolves at runtime.</li>
          <li><strong>ES Modules (ESM)</strong>{" "}— the modern standard. Asynchronous, static. Uses <code>import</code>{" "}and <code>export</code>. Resolves at parse time.</li>
        </ol>
        <p>
          The single most important thing to understand: <strong>ESM imports are statically analyzable.</strong>{" "}The bundler can read your source without running it and know exactly which names you import. CJS <code>require()</code>{" "}is just a function call — it can be inside an <code>if</code>, take a computed string, run conditionally. The bundler has to assume the worst.
        </p>
        <p>That single difference is why ESM enables tree-shaking and CJS mostly doesn&apos;t.</p>
      </section>

      <section>
        <h2>ESM vs CommonJS side-by-side</h2>
        <pre><code>{`// ---- CommonJS (older Node, some npm packages) ----
// math.js
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
module.exports = { add, subtract };

// app.js
const { add } = require("./math");
console.log(add(2, 3));

// ---- ES Modules (modern, what your bundler wants) ----
// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// app.js
import { add } from "./math.js";
console.log(add(2, 3));`}</code></pre>
        <p>Surface-level the same. Under the hood, very different:</p>
        <table className="my-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-300 dark:border-slate-700">
              <th className="px-2 py-2 text-left">Property</th>
              <th className="px-2 py-2 text-left">CommonJS</th>
              <th className="px-2 py-2 text-left">ES Modules</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-2 py-2">When resolved</td>
              <td className="px-2 py-2">Runtime (when <code>require</code>{" "}is called)</td>
              <td className="px-2 py-2">Parse time (before any code runs)</td>
            </tr>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-2 py-2">Sync or async?</td>
              <td className="px-2 py-2">Synchronous</td>
              <td className="px-2 py-2">Asynchronous (top-level)</td>
            </tr>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-2 py-2">Imports are…</td>
              <td className="px-2 py-2">Copies of values at the moment of <code>require</code></td>
              <td className="px-2 py-2">Live bindings — see updates to the exporting variable</td>
            </tr>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-2 py-2">Statically analyzable</td>
              <td className="px-2 py-2">No (require is a function)</td>
              <td className="px-2 py-2">Yes</td>
            </tr>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <td className="px-2 py-2">Tree-shakable</td>
              <td className="px-2 py-2">Rarely</td>
              <td className="px-2 py-2">Yes (if the package opts in)</td>
            </tr>
            <tr>
              <td className="px-2 py-2">Browser-native</td>
              <td className="px-2 py-2">No — needs a bundler/loader</td>
              <td className="px-2 py-2">Yes — <code>&lt;script type=&quot;module&quot;&gt;</code></td>
            </tr>
          </tbody>
        </table>
        <p>
          Modern Next.js, Vite, and webpack 5 all prefer ESM. When you install a package that ships only CJS, your bundler does a conversion — usually losing tree-shaking in the process. This is why packages like <code>lodash</code>{" "}have a separate <code>lodash-es</code>{" "}build.
        </p>
        <Callout variant="warn" title="ESM and CJS don't fully interoperate">
          You cannot <code>require()</code>{" "}an ESM module from synchronous CJS (the awaiting-static-analysis would need to be sync). You <em>can</em>{" "}<code>import()</code>{" "}— the dynamic import returns a Promise. Node will yell at you with <code>ERR_REQUIRE_ESM</code>{" "}if you try.
        </Callout>
      </section>

      <section>
        <h2>The bundler&apos;s job, in three steps</h2>
        <ol>
          <li>
            <strong>Build the dependency graph.</strong>{" "}Start at the entry (<code>pages/_app.tsx</code>{" "}or whatever the framework points at). Parse it. Follow every static <code>import</code>. Recursively visit each file. Now you have a directed graph: nodes are files, edges are imports.
          </li>
          <li>
            <strong>Mark used exports per module.</strong>{" "}For each module in the graph, record which of its <em>named exports</em>{" "}are actually referenced by importers. Unreferenced exports are candidates for removal — that&apos;s tree-shaking.
          </li>
          <li>
            <strong>Output one or more bundles.</strong>{" "}Concatenate the modules into chunks, hoisted into the final JS files the browser will load. Sometimes one bundle, sometimes many (code-splitting). Names like <code>main.js</code>, <code>vendor.js</code>, <code>pages/about.js</code>.
          </li>
        </ol>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-esm-cjs"
        title="ESM vs CommonJS, and why it matters"
        celebration="You can name the static-vs-runtime difference that makes tree-shaking possible."
      >
        <p className="text-sm">
          Out loud, in 60 seconds: ESM imports/exports are <strong>static</strong>. They&apos;re declared at the top level, with literal names — no expressions, no conditionals. The bundler parses the file (doesn&apos;t execute it) and can build the complete import/export graph before any code runs. That means it can prove &quot;nobody imports <code>subtract</code>{" "}from <code>math.js</code>&quot; and safely drop it. CommonJS <code>require()</code>{" "}is a runtime function call — the bundler can&apos;t prove what will or won&apos;t be required without running the code, so it has to ship everything to be safe.
        </p>
        <Quiz
          question="Which of these can a tree-shaking bundler safely drop?"
          kind="Defend it"
          options={[
            { label: "Unused named exports from an ESM module marked `sideEffects: false`", correct: true, explanation: "Right. ESM + no side effects = the bundler can prove the export is unreferenced and unneeded." },
            { label: "Anything from a CommonJS module, as long as you only `require` one property", explanation: "CJS resolves at runtime — the bundler can't be sure which properties you'll access. It conservatively keeps everything." },
            { label: "Side-effecting initialization code at the top of any module", explanation: "Side-effecting code runs by virtue of the module being loaded; the bundler can't drop it without changing behavior." },
            { label: "Everything imported via `import * as X`", explanation: "Namespace imports defeat tree-shaking — the bundler can't tell which properties of X you'll touch." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Tree-shaking: what it really is</h2>
        <p>
          <strong>Tree-shaking</strong>{" "}is dead-code elimination across module boundaries. The bundler walks the import graph from the entry, marks every reachable export, and deletes the rest before emitting the bundle. The name comes from imagining the import graph as a tree and giving it a shake — anything not firmly attached falls off.
        </p>
        <p>It only works under three conditions:</p>
        <ol>
          <li>The code is ESM (not CJS).</li>
          <li>The code has no <em>side effects</em>{" "}— or, where it does, the package declares them in <code>package.json</code>.</li>
          <li>You import named members, not the whole module as a namespace.</li>
        </ol>
        <p>Each of those clauses kills tree-shaking by accident all the time. Let&apos;s look at each.</p>

        <h3>Side effects</h3>
        <p>
          A <strong>side effect</strong>{" "}is any code in a module that <em>does something</em>{" "}just by being imported — modifies a global, registers a polyfill, calls an analytics SDK, etc. The bundler can&apos;t drop a module with side effects, because dropping it would change the behavior of the program even if none of its exports are used.
        </p>
        <pre><code>{`// analytics.js
window.__analytics = window.__analytics || [];   // side effect on import
export function track(event) { window.__analytics.push(event); }

// If somewhere imports anything from analytics.js, the window.__analytics
// initializer runs. The bundler MUST keep the whole module.`}</code></pre>
        <p>
          Packages tell the bundler &quot;trust me, I have no side effects&quot; by setting <code>&quot;sideEffects&quot;: false</code>{" "}in their <code>package.json</code>. With that flag, the bundler will tree-shake aggressively. Without it, it stays conservative.
        </p>
        <p>You can also list <em>specific</em>{" "}files with side effects:</p>
        <pre><code>{`{
  "sideEffects": [
    "*.css",
    "./src/polyfills.js"
  ]
}`}</code></pre>

        <h3>The namespace import trap</h3>
        <pre><code>{`// Good — only "debounce" gets shipped.
import { debounce } from "lodash-es";

// Bad — you imported "_" as a namespace. The bundler can see _
// is used, but cannot prove which properties of _ you'll touch.
import * as _ from "lodash-es";
_.debounce(fn, 200);`}</code></pre>
        <p>
          A namespace import (<code>import * as X</code>) forces the bundler to keep every export of the module — there&apos;s no way to know statically which property of <code>X</code>{" "}your code reads at runtime. Default imports are usually fine; named imports are best; namespace imports are the silent bundle-bloaters.
        </p>

        <h3>The barrel-file trap</h3>
        <p>
          A <strong>barrel file</strong>{" "}is an <code>index.ts</code>{" "}that re-exports everything in a folder: <code>export * from &quot;./Button&quot;; export * from &quot;./Modal&quot;;</code>. Pleasant to import from (<code>import &#123; Button &#125; from &quot;@/ui&quot;</code>), but historically catastrophic for tree-shaking. Many bundlers used to walk into the barrel, see every re-export, and pull every file in even if you only used one. Modern webpack and Rollup are better at this, but still trip on barrels that have side effects or namespace re-exports.
        </p>
        <Callout variant="info" title="Next.js optimizePackageImports">
          Next.js has an <code>optimizePackageImports</code>{" "}config that auto-rewrites barrel imports to deep imports for known-large packages (Lucide, Radix, etc.). If you&apos;re curious why your icon library got smaller in Next 14, that&apos;s why.
        </Callout>
      </section>

      <section>
        <h2>Worked example: tree-shaking in action</h2>
        <pre><code>{`// utils.js
export function add(a, b) { return a + b; }
export function bigUnusedFunction() {
  // Pretend this is 30KB of code we never call.
  return /* lots of stuff */;
}

// app.js (entry)
import { add } from "./utils.js";
console.log(add(2, 3));`}</code></pre>
        <p>
          Bundler walks the graph: <code>app.js</code>{" "}→ uses <code>add</code>{" "}from <code>utils.js</code>. <code>bigUnusedFunction</code>{" "}is exported but never imported. Mark it dead. Final bundle contains only <code>add</code>. 30KB gone.
        </p>
        <p>Now break it three ways and watch the bundle bloat:</p>
        <pre><code>{`// Break #1: namespace import
import * as utils from "./utils.js";
utils.add(2, 3);
// Bundler keeps bigUnusedFunction because it can't prove you won't
// access utils.bigUnusedFunction at runtime.

// Break #2: side effect in utils.js
console.log("utils loaded");           // <-- side effect
export function add(a, b) { ... }
// Bundler keeps the whole file because dropping it would skip the log.

// Break #3: convert to CommonJS
module.exports = { add, bigUnusedFunction };
const { add } = require("./utils");
// Bundler can't statically prove what require returns. Keeps everything.`}</code></pre>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-tree-shaking"
        title="Tree-shaking and side effects"
        celebration="You can name the three traps that silently bloat bundles — and reach for the right fix."
      >
        <p className="text-sm">
          A teammate adds <code>import * as Icons from &quot;react-feather&quot;</code>{" "}so they can dynamically pick an icon by string. The bundle grows 200KB. Explain what happened and propose a fix.
        </p>
        <p className="text-sm">
          The namespace import killed tree-shaking. <code>Icons</code>{" "}is now a runtime object holding <em>every</em>{" "}export of <code>react-feather</code>, and the bundler can&apos;t statically prove which properties get accessed (<code>Icons[name]</code>{" "}at runtime is opaque). It has to ship the whole library to be safe.
        </p>
        <p className="text-sm">
          Fixes: (1) Switch to <em>named</em>{" "}imports for the icons actually used (<code>import {`{ Home, Settings }`} from &quot;react-feather&quot;</code>) — costs a hard-coded list, frees ~200KB. (2) If dynamic lookup is genuinely needed, build a small explicit map: <code>const map = {`{ home: Home, settings: Settings }`};</code>. (3) Or lazy-load with <code>import()</code>{" "}so the cost is deferred off the initial bundle.
        </p>
        <Quiz
          question="A package's `package.json` lacks any `sideEffects` field. You import a single named export. What does the bundler assume?"
          kind="Defend it"
          options={[
            { label: "Sideeffect-free — drop all unreferenced exports", explanation: "Without an explicit declaration, the bundler can't assume safety. It stays conservative." },
            { label: "Side-effects unknown — keep the module to be safe", correct: true, explanation: "Right. Without `sideEffects: false` (or a list), the bundler must assume importing the module changes program behavior, so it can't drop unused exports from it." },
            { label: "Always tree-shake CommonJS the same as ESM", explanation: "CJS isn't statically analyzable, so it's the worst case — bundlers ship the whole module." },
            { label: "Always include `dependencies` and exclude `devDependencies`", explanation: "Bundlers don't read that distinction. They follow your actual import statements." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Code-splitting and dynamic imports</h2>
        <p>
          Tree-shaking removes unreachable code. <strong>Code-splitting</strong>{" "}removes <em>reachable but not-needed-right-now</em>{" "}code — by splitting it into a separate chunk loaded on demand.
        </p>
        <p>
          The vehicle for code-splitting is the <strong>dynamic <code>import()</code></strong>. Unlike static <code>import</code>, it&apos;s an expression that returns a Promise resolving to the module&apos;s namespace object. The bundler recognizes <code>import(&quot;…&quot;)</code>{" "}as a split point and emits a separate chunk.
        </p>
        <pre><code>{`// Static — included in the parent bundle.
import { heavyChart } from "./Chart";

// Dynamic — emitted as a separate chunk, loaded on demand.
button.addEventListener("click", async () => {
  const { heavyChart } = await import("./Chart");
  heavyChart(data);
});`}</code></pre>
        <p>In React, the canonical wrapper is <code>React.lazy</code>{" "}+ <code>&lt;Suspense&gt;</code>:</p>
        <pre><code>{`const Settings = React.lazy(() => import("./Settings"));

<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>`}</code></pre>
        <p>
          In Next.js (App Router), the framework already does route-level code-splitting for you — every <code>page.tsx</code>{" "}is its own chunk. You add <em>component-level</em>{" "}splits with <code>next/dynamic</code>:
        </p>
        <pre><code>{`import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  ssr: false,         // skip server render — useful for client-only libs
  loading: () => <Spinner />,
});`}</code></pre>
        <Callout variant="warn" title="Don't dynamic-import everything">
          Don&apos;t reach for dynamic imports on every component &quot;to be safe.&quot; A dynamic import costs an extra network round-trip and adds latency. It pays off for genuinely-heavy or rarely-used UI: modals, charts, rich editors, settings panels. It hurts for things that appear immediately on screen.
        </Callout>
      </section>

      <section>
        <h2>Reading a Next.js bundle output</h2>
        <p>Build any Next.js app with <code>next build</code>{" "}and you get a per-route breakdown:</p>
        <pre><code>{`Route (app)                                Size     First Load JS
┌ ○ /                                      4.21 kB        92.4 kB
├ ○ /_not-found                            896 B          88.1 kB
├ ○ /courses                               6.13 kB        94.3 kB
└ ○ /courses/[id]                          24.7 kB         112 kB
+ First Load JS shared by all              87.2 kB
  ├ chunks/main-3b48...js                  31.4 kB
  ├ chunks/webpack-3a48...js                1.7 kB
  └ other shared chunks (total)            54.1 kB

○  (Static)  prerendered as static HTML`}</code></pre>
        <p>Read it like this:</p>
        <ul>
          <li><strong>Size</strong>{" "}is JUST the code unique to that route — your page component and anything only it imports.</li>
          <li><strong>First Load JS</strong>{" "}is what the user actually downloads on a cold visit: <em>route-specific size</em>{" "}+ <em>shared baseline</em>. That number is the one to optimize.</li>
          <li><strong>Shared by all</strong>{" "}is the framework + React + anything imported from a layout. Increases here affect every route.</li>
          <li><strong>○ (Static)</strong>{" "}means the page was prerendered at build time. λ would mean a serverless function, ƒ a dynamic SSR route.</li>
        </ul>
        <p>
          To go deeper, use <code>@next/bundle-analyzer</code>{" "}or webpack&apos;s <code>webpack-bundle-analyzer</code>. They generate a treemap — each rectangle is a module, sized by bytes. Find the biggest tile that&apos;s not React itself; that&apos;s where to start.
        </p>

        <h3>What a healthy First Load JS looks like</h3>
        <ul>
          <li><strong>&lt; 100KB</strong>{" "}gzipped is comfortably fast everywhere.</li>
          <li><strong>100–200KB</strong>{" "}is the &quot;feels okay&quot; band; investigate if you&apos;re here without a reason.</li>
          <li><strong>&gt; 250KB</strong>{" "}should make you uncomfortable. Something heavy is along for the ride.</li>
        </ul>
      </section>

      <section>
        <h2>Variants and edge cases</h2>

        <h3>Why your devDependency ended up in the bundle</h3>
        <p>
          The bundler doesn&apos;t care about <code>dependencies</code>{" "}vs <code>devDependencies</code>{" "}in <code>package.json</code>. It cares about <em>your import statements</em>. If you import <code>lodash</code>{" "}from a component, lodash ships, regardless of where it lives in the manifest. The dep/devDep split matters for tooling and CI, not the bundler.
        </p>

        <h3>Polyfills can sneak in</h3>
        <p>
          Targeting older browsers can balloon your bundle. <code>core-js</code>{" "}polyfills are injected by Babel when your <code>browserslist</code>{" "}includes ancient browsers. Run <code>npx browserslist</code>{" "}in your project to see what you&apos;re actually compiling for. Trimming dead browsers can drop 30–50KB easily.
        </p>

        <h3>Server-only code is not free</h3>
        <p>
          In Next.js, anything in a Server Component or in an API route doesn&apos;t ship to the client. But the moment you import a heavy library from a Client Component, it lands in the client bundle. The <code>&quot;use client&quot;</code>{" "}boundary is the real cutoff line — audit imports just below those boundaries.
        </p>

        <h3>moment.js: the cautionary tale</h3>
        <p>
          The classic example. <code>moment.js</code>{" "}bundles every locale by default — adds ~70KB the moment you import it. Modern apps use <code>date-fns</code>{" "}(ESM, deeply tree-shakable) or <code>dayjs</code>{" "}(small core, opt-in plugins). If you have to keep moment, configure webpack to skip the locales bundle. If you can switch, switch.
        </p>

        <h3>Source maps don&apos;t ship (in prod) but the build output keeps them</h3>
        <p>
          Your <code>.js.map</code>{" "}files are NOT part of the runtime bundle — they&apos;re separately downloaded by devtools when a user opens the inspector. They don&apos;t bloat the user experience, but they do leak your source. Keep them for production debugging if you want, but mind the privacy.
        </p>
      </section>

      <section>
        <h2>React relevance: where this hits you every day</h2>
        <ul>
          <li>
            <strong>Icon libraries.</strong>{" "}<code>react-icons</code>, <code>lucide-react</code>, <code>@heroicons/react</code>{" "}— use named imports, never namespace. Next.js&apos;s <code>optimizePackageImports</code>{" "}config exists specifically for this.
          </li>
          <li>
            <strong>UI kits with barrels.</strong>{" "}MUI, Chakra, Mantine — read their tree-shaking docs. Some require deep imports (<code>import Button from &quot;@mui/material/Button&quot;</code>) to stay slim; others handle barrels well.
          </li>
          <li>
            <strong>Charts and editors.</strong>{" "}Recharts, ApexCharts, TipTap, Monaco — heavy. Use <code>next/dynamic</code>{" "}with <code>ssr: false</code>{" "}so they don&apos;t block the initial render.
          </li>
          <li>
            <strong><code>&quot;use client&quot;</code>{" "}boundaries.</strong>{" "}Server Components stay server-side; Client Components ship. Push interactive logic as far down the tree as it&apos;ll go.
          </li>
        </ul>
      </section>

      <section>
        <h2>Project: audit a Next.js bundle</h2>
        <ol>
          <li>
            Pick any Next.js app you&apos;ve built. Install the analyzer:{" "}
            <code>npm i -D @next/bundle-analyzer</code>.
          </li>
          <li>
            Wrap your <code>next.config.js</code>{" "}with the analyzer:
            <pre><code>{`const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({ /* your config */ });`}</code></pre>
          </li>
          <li>
            Run <code>ANALYZE=true npm run build</code>{" "}— a treemap will open in your browser.
          </li>
          <li>
            Find the largest non-framework tile. <em>Justify</em>{" "}why it&apos;s there. For each finding, write one sentence: &quot;<em>X is N KB because we use it for Y; it stays because Z / it should go because W.</em>&quot;
          </li>
          <li>
            Pick one finding and remove or shrink it. Re-build. Confirm the First Load JS dropped.
          </li>
        </ol>
        <p>
          The exercise isn&apos;t about hitting a specific number — it&apos;s about being able to <em>explain</em>{" "}every line of your bundle&apos;s ledger. That&apos;s exactly what interviewers want to hear.
        </p>
      </section>

      <Checkpoint
        moduleSlug={MODULE_SLUG}
        id="cp-bundle"
        title="Reading a Next.js bundle output"
        celebration="You can read the next build summary and propose concrete shrinks."
      >
        <p className="text-sm">
          Walk a teammate through a 180KB First Load JS: what it is, why it&apos;s that big, and how to shrink it.
        </p>
        <p className="text-sm">
          First Load JS = the JavaScript a cold visitor downloads before the page can be interactive. It&apos;s the route-specific bundle plus the shared baseline (React, the framework, anything imported from a layout). 180KB is on the heavy side — investigate.
        </p>
        <p className="text-sm">
          How to shrink it: (1) Run <code>@next/bundle-analyzer</code>{" "}— identify the biggest tile after React. (2) Switch namespace imports to named imports; enable <code>optimizePackageImports</code>{" "}for icon/UI libraries. (3) Move heavy or rarely-used components to <code>next/dynamic</code>. (4) Push interactive code below <code>&quot;use client&quot;</code>{" "}boundaries so server-only logic stays off the client bundle. (5) Audit your <code>browserslist</code>{" "}— trimming ancient browser targets drops core-js polyfills. (6) Replace moment.js with date-fns or dayjs.
        </p>
        <Quiz
          question="A page shows `Size: 4.2 kB / First Load JS: 92 kB`. Which statement is true?"
          kind="Defend it"
          options={[
            { label: "The browser downloads 4.2 kB on a cold visit", explanation: "No — that's just the route-specific code. The user downloads the route code PLUS the shared baseline." },
            { label: "The browser downloads 92 kB on a cold visit, including shared chunks", correct: true, explanation: "Right. First Load JS is the realistic cold-load cost: route-specific code + the shared baseline (framework + React + anything in a layout)." },
            { label: "92 kB is the size of the page on disk after gzip", explanation: "First Load JS is the network-transferred size; the disk artifact is larger." },
            { label: "Optimizing the 4.2 kB will reduce First Load JS most", explanation: "The shared baseline dominates — that's where the biggest wins usually live." },
          ]}
        />
      </Checkpoint>

      <Callout variant="insight" title="The 60-second interview answer">
        A bundler builds a graph from your entry, walks static <code>import</code>{" "}statements, and emits one or more JS files. ESM is statically analyzable — the bundler knows your imports without running code, so it can drop unused exports (tree-shaking). CommonJS isn&apos;t, so it stays conservative. Two things kill tree-shaking by accident: side effects in modules, and namespace imports (<code>import * as X</code>) that hide which properties you&apos;ll use. To shrink a bundle: read the <code>next build</code>{" "}output, run the bundle analyzer, switch to named imports, push heavy components behind <code>next/dynamic</code>, and audit anything large that lives above a <code>&quot;use client&quot;</code>{" "}boundary.
      </Callout>

      <section>
        <h2>What&apos;s next</h2>
        <p>
          With modules and bundling internalized, you&apos;ve finished Phase 1 — the JavaScript foundations. Module 8 is a revision card: a tight, re-readable summary of everything from values-vs-references through bundling, designed to be skimmed in 15 minutes the morning of an interview.
        </p>
      </section>

      <ModuleNav courseId="frontend" currentSlug={MODULE_SLUG} />
    </article>
  );
}
