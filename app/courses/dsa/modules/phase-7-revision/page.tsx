import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 20 minutes before an interview when "DP" appears in the prompt.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase7RevisionModule() {
  const mod = getModuleBySlug("phase-7-revision")!;

  // Decision flow — raw problem → spot the two DP signals → choose top-down or
  // bottom-up. Mirrors the framework from the Phase 7 source modules.
  const decisionChart = `
flowchart TD
    A["Problem statement"] --> B{"Optimal substructure?<br/>Can the answer be built<br/>from answers to sub-instances?"}
    B -- No --> Z["Not DP.<br/>Try greedy, graph, or brute force"]
    B -- Yes --> C{"Overlapping subproblems?<br/>Does naive recursion<br/>recompute the same call?"}
    C -- No --> Y["Pure divide-and-conquer.<br/>e.g. merge sort, quicksort"]
    C -- Yes --> D["It IS a DP problem"]
    D --> E["Write the brute-force recursion first.<br/>Identify the state — what args<br/>uniquely identify a subproblem?"]
    E --> F{"Pick a direction"}
    F --> G["Top-down<br/>recursion + memo cache<br/>good for sparse state space"]
    F --> H["Bottom-up<br/>iterative tabulation<br/>good for full state, enables<br/>space optimization"]
    style A fill:#a855f7,color:#fff,stroke:#7e22ce
    style D fill:#10b981,color:#fff,stroke:#059669
    style G fill:#fb923c,color:#fff,stroke:#ea580c
    style H fill:#fb923c,color:#fff,stroke:#ea580c
    style Z fill:#ef4444,color:#fff,stroke:#dc2626
    style Y fill:#94a3b8,color:#fff,stroke:#64748b
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link
          href="/courses/dsa"
          className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <span className="mt-2 block w-fit rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 7 · Module {mod.number} · Revision
        </span>
        <h1 className="mt-4 mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 7 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The whole DP story — decision framework, six state shapes, memo vs tab, the space tricks — compressed to a reference card you can re-read in 20 minutes before an interview.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="phase-7-revision" />
        <ModuleProgress moduleSlug="phase-7-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This module is not new material. It&apos;s a <strong>map of Phase 7</strong> — every recurrence, every template, every gotcha from the four DP modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read on the train before a phone screen, not as a tutorial.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          The four modules you&apos;re consolidating: <Link href="/courses/dsa/modules/dp-intro" className="text-fuchsia-600 hover:underline">DP intuition — memoization &amp; overlapping subproblems</Link>, <Link href="/courses/dsa/modules/dp-1d" className="text-fuchsia-600 hover:underline">1D DP patterns</Link>, <Link href="/courses/dsa/modules/dp-2d" className="text-fuchsia-600 hover:underline">2D DP &amp; grid DP</Link>, and <Link href="/courses/dsa/modules/dp-advanced" className="text-fuchsia-600 hover:underline">Advanced DP — intervals, trees, bitmask</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — The DP decision framework */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">1. &quot;Is this a DP problem?&quot; — the decision framework</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Three signals to check before you touch a single line of code. If all three light up, the rest of the work is just choosing top-down or bottom-up.
        </p>

        <div className="mb-4 rounded-xl border border-fuchsia-200 bg-fuchsia-50/40 p-5 dark:border-fuchsia-900 dark:bg-fuchsia-950/20">
          <div className="mb-3 text-xs font-bold tracking-wider text-fuchsia-700 uppercase dark:text-fuchsia-300">The 3-signal checklist</div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="font-mono font-bold text-fuchsia-600 dark:text-fuchsia-400">(a)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Optimal substructure.</strong>{" "}The optimal answer for the whole problem can be assembled from optimal answers to <em>smaller instances of the same problem</em>. &quot;Shortest path from A to C passes through some B; that path A→B must itself be a shortest path.&quot;
              </div>
            </div>

            <div className="flex gap-3">
              <div className="font-mono font-bold text-fuchsia-600 dark:text-fuchsia-400">(b)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Overlapping subproblems.</strong>{" "}Naive recursion calls the same subproblem more than once. <code>fib(5)</code> calls <code>fib(3)</code> twice, <code>fib(2)</code> three times. If subproblems never repeat, you have plain divide-and-conquer, not DP.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="font-mono font-bold text-fuchsia-600 dark:text-fuchsia-400">(c)</div>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <strong>The &quot;I keep recomputing the same thing&quot; tell.</strong>{" "}If your gut reaction to the brute-force recursion is &quot;wait, didn&apos;t I just solve this exact subproblem two frames up?&quot; — that&apos;s DP. Cache the result, transform exponential to polynomial.
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Mermaid chart={decisionChart} />
        </div>

        <Callout variant="insight">
          <strong>The mental model:</strong>{" "}DP = brute-force recursion + a cache. Always write the brute-force recursion first. The state (the args that uniquely identify a subproblem) becomes your memo key, and that same state becomes your dp-table index when you flip it to bottom-up.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/dp-intro" className="text-fuchsia-600 hover:underline">Module 32 — DP intuition</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Top-down vs bottom-up */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">2. Top-down (memo) vs bottom-up (tab) — when each one wins</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Same time complexity, same answer. The trade-offs are in stack depth, constant factor, ease of derivation, and whether you can space-optimize.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Axis</th>
                <th className="px-4 py-3 font-semibold">Top-down · memoization</th>
                <th className="px-4 py-3 font-semibold">Bottom-up · tabulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Shape</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Recursive function + cache (array or HashMap)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Iterative loops filling a dp table</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Stack depth</td>
                <td className="px-4 py-3 text-rose-600">O(depth) — can StackOverflow for n ≈ 10⁵ in Java</td>
                <td className="px-4 py-3 text-emerald-600">O(1) — no recursion at all</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Constant factor</td>
                <td className="px-4 py-3 text-amber-600">Slower — function-call overhead, HashMap hashing if used</td>
                <td className="px-4 py-3 text-emerald-600">Faster — tight loops, array indexing</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Intuition cost</td>
                <td className="px-4 py-3 text-emerald-600">Low — write the recursion, slap on @cache</td>
                <td className="px-4 py-3 text-amber-600">Higher — must order subproblems correctly (which dim first?)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Visits all states?</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Only reachable ones — wins on sparse state space</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every cell — wins when state is dense</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Space optimization</td>
                <td className="px-4 py-3 text-rose-600">Hard — full cache lives during recursion</td>
                <td className="px-4 py-3 text-emerald-600">Easy — drop old rows once you&apos;re done with them</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Order of computation</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Lazy — driven by the recursion</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Explicit — you choose the loop order</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Best for</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Whiteboard, sparse state (game DP, bitmask), tree DP</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Production, large n, when you need O(1) extra space</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Decision rule:</strong>{" "}derive the recurrence top-down, then translate to bottom-up if the constant factor matters or you want to space-optimize. The recursion is how you <em>think</em>; the table is how you <em>ship</em>.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/dp-intro" className="text-fuchsia-600 hover:underline">Module 32 — DP intuition</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — The 6 state-shape templates */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">3. The 6 DP state-shape templates</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Every DP problem you&apos;ll see fits one of these six shapes. Recognize the shape, the recurrence almost writes itself.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Shape 1 · 1D, decision at index i</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[i]</code> = best answer using/ending at index i</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong> <code>dp[i] = f(dp[i-1], dp[i-2], ...)</code></div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(n) / O(n) → O(1)</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}House Robber, Climbing Stairs</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-600 uppercase">Shape 2 · 2D, i × j string family</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[i][j]</code> over two sequences A[..i], B[..j]</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong>{" "}match → diagonal; else min/max of three neighbors</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(m·n) / O(m·n) → O(min(m,n))</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}Edit Distance, LCS</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-600 uppercase">Shape 3 · Grid (m × n) path counting</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[i][j]</code> = ways/cost to reach cell (i, j)</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong> <code>dp[i][j] = dp[i-1][j] + dp[i][j-1]</code></div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(m·n) / O(m·n) → O(n)</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}Unique Paths, Minimum Path Sum</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-orange-600 uppercase">Shape 4 · Interval DP (i…j range)</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[i][j]</code> = answer for subrange A[i..j]</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong>{" "}split point k: <code>dp[i][j] = min/max over k of f(dp[i][k], dp[k+1][j])</code></div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(n³) / O(n²)</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}Matrix Chain, Burst Balloons</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-orange-600 uppercase">Shape 5 · Tree DP (rooted at node)</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[node]</code> often with a 2nd dim for include/exclude</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong>{" "}post-order DFS, combine children&apos;s answers</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(n) / O(n)</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}House Robber III, Tree Diameter</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-600 uppercase">Shape 6 · Bitmask DP (subset state)</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>State:</strong> <code>dp[mask][i]</code> = best path visiting set <code>mask</code> ending at <code>i</code></div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Transition:</strong>{" "}for each j not in mask: try extending</div>
            <div className="mb-1 text-xs text-slate-600 dark:text-slate-400"><strong>Time / Space:</strong>{" "}O(2ⁿ · n²) / O(2ⁿ · n)</div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Canonical:</strong>{" "}Travelling Salesman, Assign Cookies</div>
          </div>
        </div>

        <Callout variant="insight">
          <strong>Pick the shape from the input.</strong>{" "}One sequence, decision per index → Shape 1. Two strings → Shape 2. A grid → Shape 3. &quot;Best way to split this range&quot; → Shape 4. A tree → Shape 5. n ≤ 20 and you&apos;re visiting subsets → Shape 6. The shape tells you the dimensions; the dimensions tell you the time complexity.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Sources: <Link href="/courses/dsa/modules/dp-1d" className="text-fuchsia-600 hover:underline">Module 33 — 1D DP</Link>, <Link href="/courses/dsa/modules/dp-2d" className="text-fuchsia-600 hover:underline">Module 34 — 2D DP</Link>, <Link href="/courses/dsa/modules/dp-advanced" className="text-fuchsia-600 hover:underline">Module 35 — Advanced DP</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — 1D DP detail: fib → climb → rob progression */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">4. 1D DP — Fibonacci → Climbing Stairs → House Robber</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          The same recurrence shape three times, with progressively more interesting transitions. All three space-optimize to O(1) with two rolling variables.
        </p>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-4 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Fibonacci</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>dp[i]:</strong>{" "}i-th Fibonacci number</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>Transition:</strong> <code>dp[i] = dp[i-1] + dp[i-2]</code></div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Base:</strong> <code>dp[0]=0, dp[1]=1</code></div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-4 dark:border-slate-800 dark:bg-amber-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Climbing Stairs</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>dp[i]:</strong> # ways to reach step i</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>Transition:</strong> <code>dp[i] = dp[i-1] + dp[i-2]</code></div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Base:</strong> <code>dp[0]=1, dp[1]=1</code> (literally fib)</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-fuchsia-50/40 p-4 dark:border-slate-800 dark:bg-fuchsia-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-fuchsia-700 uppercase dark:text-fuchsia-300">House Robber</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>dp[i]:</strong>{" "}max money robbing houses 0..i-1</div>
            <div className="mb-1 text-xs text-slate-700 dark:text-slate-300"><strong>Transition:</strong> <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])</code></div>
            <div className="text-xs text-slate-700 dark:text-slate-300"><strong>Base:</strong> <code>dp[0]=0, dp[1]=nums[0]</code></div>
          </div>
        </div>

        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
          Each only looks back two cells, so the whole <code>dp[]</code> array is wasteful. Two <code>int</code>s suffice — that&apos;s the O(n) → O(1) space win:
        </p>

        <CodeBlock lang="java" caption="House Robber, space-optimized to O(1)">{`// dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])
// Only need the last two values — keep them in two ints.
public int rob(int[] nums) {
    int prev2 = 0;          // dp[i-2]
    int prev1 = 0;          // dp[i-1]
    for (int x : nums) {
        int curr = Math.max(prev1, prev2 + x);   // dp[i]
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`}</CodeBlock>

        <Callout variant="spring" title="The collapse trick">
          Any 1D DP whose transition uses a <em>constant</em>{" "}number of recent values (dp[i-1], dp[i-2], ...) collapses to O(1) space using that many rolling vars. <strong>LIS does NOT collapse</strong> — it reads every previous dp[j]. <strong>Coin Change does NOT collapse</strong> — it reads dp[a-c] for arbitrary coin sizes.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/dp-1d" className="text-fuchsia-600 hover:underline">Module 33 — 1D DP patterns</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — 2D DP detail: Edit Distance */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">5. 2D DP — Edit Distance as the canonical example</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <strong>LC 72 · Edit Distance (Levenshtein).</strong>{" "}Minimum number of insert / delete / replace ops to turn string A into string B. The recurrence has three cases; the table makes it obvious.
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">The transition</div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li><strong>If a[i-1] == b[j-1]:</strong> <code>dp[i][j] = dp[i-1][j-1]</code> — free, characters already match.</li>
            <li><strong>Else:</strong> <code>dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])</code> — pick the cheapest of replace, delete, insert.</li>
            <li><strong>Base row/col:</strong> <code>dp[i][0] = i</code> (delete all of A), <code>dp[0][j] = j</code> (insert all of B).</li>
          </ul>
        </div>

        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
          The dp table for <code>&quot;horse&quot; → &quot;ros&quot;</code> looks like this. Every cell is filled from its top, left, and top-left neighbor — that&apos;s why it&apos;s O(m·n) time and (naively) O(m·n) space:
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-center font-mono text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2 text-slate-400">&quot;&quot;</th>
                <th className="px-3 py-2">r</th>
                <th className="px-3 py-2">o</th>
                <th className="px-3 py-2">s</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr><td className="px-3 py-2 text-slate-400">&quot;&quot;</td><td className="px-3 py-2">0</td><td className="px-3 py-2">1</td><td className="px-3 py-2">2</td><td className="px-3 py-2">3</td></tr>
              <tr><td className="px-3 py-2">h</td><td className="px-3 py-2">1</td><td className="px-3 py-2">1</td><td className="px-3 py-2">2</td><td className="px-3 py-2">3</td></tr>
              <tr><td className="px-3 py-2">o</td><td className="px-3 py-2">2</td><td className="px-3 py-2">2</td><td className="px-3 py-2">1</td><td className="px-3 py-2">2</td></tr>
              <tr><td className="px-3 py-2">r</td><td className="px-3 py-2">3</td><td className="px-3 py-2">2</td><td className="px-3 py-2">2</td><td className="px-3 py-2">2</td></tr>
              <tr><td className="px-3 py-2">s</td><td className="px-3 py-2">4</td><td className="px-3 py-2">3</td><td className="px-3 py-2">3</td><td className="px-3 py-2 font-bold text-fuchsia-600">3</td></tr>
              <tr><td className="px-3 py-2">e</td><td className="px-3 py-2">5</td><td className="px-3 py-2">4</td><td className="px-3 py-2">4</td><td className="px-3 py-2 font-bold text-fuchsia-600">3</td></tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Bottom-right is the answer: 3 edits. (replace h→r, delete r, delete e.)
        </p>

        <CodeBlock lang="java" caption="Edit Distance — clean 2D, O(m·n) time and space">{`public int minDistance(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = i;     // delete all of A
    for (int j = 0; j <= n; j++) dp[0][j] = j;     // insert all of B
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j - 1],                          // replace
                    Math.min(dp[i - 1][j], dp[i][j - 1])       // delete or insert
                );
            }
        }
    }
    return dp[m][n];
}`}</CodeBlock>

        <Callout variant="spring" title="Rolling-array trick — O(m·n) space → O(min(m, n))">
          Each row of the dp table only depends on the row immediately above. So you only need <strong>two rows</strong> (current and previous), not the whole table. Make the shorter string the column dimension so the row length is min(m, n). The time stays O(m·n); the space drops to O(min(m, n)).
        </Callout>

        <CodeBlock lang="java" caption="Edit Distance — rolling rows, O(min(m,n)) space">{`public int minDistance(String a, String b) {
    // Make b the shorter one so the row is min(m, n) long.
    if (a.length() < b.length()) { String t = a; a = b; b = t; }
    int m = a.length(), n = b.length();
    int[] prev = new int[n + 1];
    int[] curr = new int[n + 1];
    for (int j = 0; j <= n; j++) prev[j] = j;
    for (int i = 1; i <= m; i++) {
        curr[0] = i;
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                curr[j] = prev[j - 1];
            } else {
                curr[j] = 1 + Math.min(prev[j - 1], Math.min(prev[j], curr[j - 1]));
            }
        }
        int[] tmp = prev; prev = curr; curr = tmp;   // swap, reuse the buffer
    }
    return prev[n];
}`}</CodeBlock>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/dp-2d" className="text-fuchsia-600 hover:underline">Module 34 — 2D DP &amp; grid DP</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Bitmask DP teaser */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">6. Bitmask DP — when state is a subset</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          When your subproblem is &quot;over which subset of these n items have I made a decision?&quot;, the subset itself is the state. Encode the membership as bits of an <code>int</code> — bit k set = item k is in the set. Works while n ≤ ~20 (2²⁰ ≈ 1M states).
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mb-2 text-xs font-bold tracking-wider text-rose-600 uppercase">The bit operations you&apos;ll use</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li><code>mask | (1 &lt;&lt; k)</code> — add item k to the set</li>
            <li><code>mask &amp; ~(1 &lt;&lt; k)</code> — remove item k</li>
            <li><code>(mask &gt;&gt; k) &amp; 1</code> — is item k in the set?</li>
            <li><code>Integer.bitCount(mask)</code> — how many items are in the set</li>
            <li><code>(1 &lt;&lt; n) - 1</code> — the full set of n items</li>
          </ul>
        </div>

        <CodeBlock lang="java" caption="TSP-style: shortest Hamiltonian path visiting all n cities">{`// dp[mask][i] = shortest path that visits exactly the cities in 'mask'
// and ends at city i. Final answer: min over i of dp[FULL][i].
public int tsp(int[][] dist) {
    int n = dist.length;
    int FULL = (1 << n) - 1;
    int INF = Integer.MAX_VALUE / 2;
    int[][] dp = new int[1 << n][n];
    for (int[] row : dp) Arrays.fill(row, INF);
    dp[1][0] = 0;                                    // start at city 0, mask = {0}
    for (int mask = 1; mask <= FULL; mask++) {
        for (int i = 0; i < n; i++) {
            if (((mask >> i) & 1) == 0) continue;    // i must be in mask
            if (dp[mask][i] == INF) continue;
            for (int j = 0; j < n; j++) {
                if (((mask >> j) & 1) == 1) continue;     // j must NOT be in mask
                int next = mask | (1 << j);
                dp[next][j] = Math.min(dp[next][j], dp[mask][i] + dist[i][j]);
            }
        }
    }
    int best = INF;
    for (int i = 0; i < n; i++) best = Math.min(best, dp[FULL][i]);
    return best;
}`}</CodeBlock>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Time: O(2ⁿ · n²). Space: O(2ⁿ · n). At n = 20 that&apos;s ~400M ops — borderline, but tractable.
        </p>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/dp-advanced" className="text-fuchsia-600 hover:underline">Module 35 — Advanced DP</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — The 5 gotchas in BAD/GOOD format */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">7. Five gotchas that bite people</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Each of these has cost real engineers real hours. If you only remember five things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 1 · Top-down memo with no base case</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              The recursion calls itself forever, or returns garbage from the cache because you stored a half-baked answer. <strong>Always</strong>{" "}check the base case <em>before</em>{" "}the cache lookup.
            </p>
            <CodeBlock lang="java">{`// BAD — recurses past 0 into negative indices, StackOverflow
int rob(int[] nums, int i, Integer[] memo) {
    if (memo[i] != null) return memo[i];
    int take = nums[i] + rob(nums, i - 2, memo);   // i-2 can be negative
    int skip = rob(nums, i - 1, memo);
    return memo[i] = Math.max(take, skip);
}

// GOOD — base case first
int rob(int[] nums, int i, Integer[] memo) {
    if (i < 0) return 0;                           // base
    if (memo[i] != null) return memo[i];
    int take = nums[i] + rob(nums, i - 2, memo);
    int skip = rob(nums, i - 1, memo);
    return memo[i] = Math.max(take, skip);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 2 · HashMap memo when an array would do</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              If your state is a small integer range, use an <code>int[]</code> or <code>Integer[]</code>. <code>HashMap</code> boxing, hashing, and chaining add a 5–10× constant-factor slowdown. Reserve HashMap memo for sparse or non-integer state.
            </p>
            <CodeBlock lang="java">{`// BAD — Map<Integer,Integer> hashing every lookup
Map<Integer, Integer> memo = new HashMap<>();
int f(int n) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    int v = f(n - 1) + f(n - 2);
    memo.put(n, v);
    return v;
}

// GOOD — primitive array indexed by state
int[] memo = new int[n + 1];
Arrays.fill(memo, -1);
int f(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = f(n - 1, memo) + f(n - 2, memo);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 3 · Forgetting to <em>store</em>{" "}the result after computing it</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              You added a cache lookup at the top but forgot to write the result back. The function still recomputes every subproblem — still O(2ⁿ). Easy to miss when refactoring.
            </p>
            <CodeBlock lang="java">{`// BAD — lookup but no store. Still O(2^n).
int fib(int n, Integer[] memo) {
    if (n <= 1) return n;
    if (memo[n] != null) return memo[n];
    return fib(n - 1, memo) + fib(n - 2, memo);    // never written to memo
}

// GOOD — store on the way out
int fib(int n, Integer[] memo) {
    if (n <= 1) return n;
    if (memo[n] != null) return memo[n];
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 4 · Off-by-one in tabulation indices</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              The dp table has size <code>n + 1</code> with a phantom &quot;empty prefix&quot; row, so <code>dp[i]</code> answers for the first <code>i</code> items — but <code>nums[i-1]</code> is the i-th item. Mixing the two indexing schemes is the most common DP bug.
            </p>
            <CodeBlock lang="java">{`// BAD — reads nums[i] inside a loop that runs i = 1..n. ArrayIndexOutOfBounds at i = n.
for (int i = 1; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);   // should be nums[i - 1]
}

// GOOD — dp[i] answers for first i houses; the i-th house is nums[i - 1]
for (int i = 1; i <= n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 5 · Integer overflow in counting problems</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Path-counting DPs (Unique Paths, Decode Ways, Climbing Stairs) produce numbers that grow exponentially. By n = 60 you&apos;ve blown through <code>Integer.MAX_VALUE</code> (~2.1 × 10⁹). Use <code>long</code>, or take mod if the problem specifies one.
            </p>
            <CodeBlock lang="java">{`// BAD — int overflow on large grids
int[][] dp = new int[m][n];
dp[0][0] = 1;
// ... eventually dp[i][j] silently wraps to a negative number

// GOOD — long, or modular arithmetic
long[][] dp = new long[m][n];
dp[0][0] = 1;
// Or, when the spec says "answer modulo 1e9+7":
final int MOD = 1_000_000_007;
dp[i][j] = (int)(((long) dp[i-1][j] + dp[i][j-1]) % MOD);`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="not-prose mb-1 text-2xl font-bold tracking-tight">8. Optional self-assessment</h2>
        <p className="not-prose mb-6 text-sm text-slate-500 dark:text-slate-400">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="Which two properties together tell you a problem is a DP problem?"
          options={[
            { label: "Optimal substructure and overlapping subproblems.", correct: true, explanation: "Right. Optimal substructure says the answer can be built from sub-answers. Overlapping subproblems says the naive recursion repeats work — that's what makes caching worth it. Without overlap, you have plain divide-and-conquer (like merge sort)." },
            { label: "Recursion and a base case.", explanation: "Every recursion has those. DP needs more: the subproblems must overlap, otherwise caching gains you nothing." },
            { label: "A graph structure and shortest paths.", explanation: "Shortest paths happen to be a famous DP, but DP applies to far more than graphs." },
            { label: "Sorted input and binary search.", explanation: "That's the binary-search pattern, not DP." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="When does bottom-up tabulation win clearly over top-down memoization?"
          options={[
            { label: "When the state space is sparse and most subproblems aren't reachable.", explanation: "That's when top-down wins — you only compute reachable states. Tabulation fills every cell." },
            { label: "When the recursion is obvious but you don't know the loop order.", explanation: "Backwards. Top-down lets you skip thinking about order — the recursion drives it. Bottom-up forces you to derive an explicit order." },
            { label: "When you need O(1) extra space or want to avoid StackOverflow on large n.", correct: true, explanation: "Right. Bottom-up runs iteratively (no stack), and you can drop old rows of the dp table once you're done with them. Top-down keeps the whole cache plus the call stack alive." },
            { label: "When the answer changes based on the input.", explanation: "Both styles produce the same answer; they're equivalent." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="House Robber's recurrence is dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]). Why does it space-optimize to O(1) but Longest Increasing Subsequence does NOT?"
          options={[
            { label: "House Robber has fewer states.", explanation: "Both have n states. That's not the reason." },
            { label: "House Robber only looks back at a constant number of recent cells (i-1 and i-2); LIS reads every previous dp[j].", correct: true, explanation: "Right. Two rolling vars cover House Robber. LIS's transition is dp[i] = 1 + max(dp[j]) over all j < i where nums[j] < nums[i] — you genuinely need the whole array of previous values. Constant-distance lookback collapses; arbitrary lookback does not." },
            { label: "LIS uses 2D state.", explanation: "Standard LIS is 1D — dp[i] indexed only by i. The space cost is from needing every previous value, not from extra dimensions." },
            { label: "House Robber's answer is smaller.", explanation: "Answer magnitude isn't related to space optimization. The shape of the transition is." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="For Edit Distance with strings of length m and n, what does the rolling-array space optimization buy you?"
          options={[
            { label: "Drops time from O(m·n) to O(m + n).", explanation: "Rolling arrays don't change time complexity. The optimization is purely a space win." },
            { label: "Drops space from O(m·n) to O(min(m, n)) — keep two rows, swap them each iteration.", correct: true, explanation: "Right. Each row only depends on the row above, so you keep two rows (current and previous). Putting the shorter string as the column dim makes each row length min(m, n)." },
            { label: "Drops space to O(1) — same as House Robber.", explanation: "Edit Distance reads three neighbors of dp[i][j], including dp[i][j-1] from the same row. You need at least one full row alive, so O(min(m, n)) is the floor, not O(1)." },
            { label: "Lets you skip filling the table entirely.", explanation: "You still fill every cell — you just don't store the whole table at once." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're writing a top-down memo for Fibonacci. You add the cache lookup at the top of the function but forget to write the result back before returning. What time complexity do you get?"
          options={[
            { label: "O(n) — the cache lookup is enough to make it linear.", explanation: "A lookup that always misses is useless. Without storing, every call recomputes both branches from scratch." },
            { label: "O(2ⁿ) — same as no memo at all.", correct: true, explanation: "Right. The cache is consulted but never populated, so every lookup misses and the function recurses on both branches. Bug check for top-down DP: every code path that computes a value must store it. Easy to miss when refactoring." },
            { label: "O(n log n) — the cache adds log overhead.", explanation: "There's no log factor here. Either the cache works (O(n)) or it doesn't (O(2ⁿ))." },
            { label: "The function will throw a NullPointerException.", explanation: "It won't — it just keeps recomputing. The bug is silent: correct answer, exponential time." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6 dark:border-pink-900 dark:from-pink-950/30 dark:via-slate-900 dark:to-rose-950/30">
        <div className="mb-2 text-xs font-bold tracking-wider text-pink-700 uppercase dark:text-pink-300">
          Phase 7 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can derive a DP recurrence from a problem statement</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The decision framework, the six state shapes, top-down vs bottom-up, the 1D collapse trick, the 2D rolling-array trick, bitmask state for subsets, and the five common bugs. That&apos;s the entire DP playbook — every &quot;hard&quot; LeetCode tag you see in this category bottoms out in one of these six shapes.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 8 — Advanced &amp; Interview Prep.</strong>{" "}Tries (the prefix-tree structure for autocomplete and word search), then the heavier patterns you&apos;ll meet at the senior-interview tier — followed by the systematic interview framework that ties everything together.
        </p>
        <Link
          href="/courses/dsa/modules/tries"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
        >
          Next phase: Advanced &amp; Interview Prep →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-7-revision" />
    </article>
  );
}
