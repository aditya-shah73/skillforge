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
// re-read this in 15 minutes before an interview, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase1RevisionModule() {
  const mod = getModuleBySlug("phase-1-revision")!;

  // Doubling chart — reused from the amortized-analysis module so the picture
  // stays consistent: most adds are cheap, a few are expensive, total work is
  // ~2n which is why the amortized cost is O(1).
  const doublingChart = `
flowchart LR
    A1["add 1<br/>cost 1"] --> A2["add 2<br/>cost 1+1"]
    A2 --> A3["add 3<br/>cost 1+2"]
    A3 --> A4["add 4<br/>cost 1"]
    A4 --> A5["add 5<br/>cost 1+4"]
    A5 --> A6["adds 6-8<br/>cost 1 each"]
    A6 --> A7["add 9<br/>cost 1+8"]
    A7 --> A8["adds 10-16<br/>cost 1 each"]
    A8 --> A9["add 17<br/>cost 1+16"]
    style A1 fill:#10b981,color:#fff,stroke:#059669
    style A2 fill:#fb923c,color:#fff,stroke:#ea580c
    style A3 fill:#fb923c,color:#fff,stroke:#ea580c
    style A5 fill:#ef4444,color:#fff,stroke:#dc2626
    style A7 fill:#7f1d1d,color:#fff,stroke:#450a0a
    style A9 fill:#7f1d1d,color:#fff,stroke:#450a0a
    style A4 fill:#10b981,color:#fff,stroke:#059669
    style A6 fill:#10b981,color:#fff,stroke:#059669
    style A8 fill:#10b981,color:#fff,stroke:#059669
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
        <span className="mt-2 block w-fit rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 1 · Module {mod.number} · Revision
        </span>
        <h1 className="mt-4 mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 1 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The whole Big-O / space / amortized story compressed to a reference card you can re-read in 15 minutes before an interview.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="phase-1-revision" />
        <ModuleProgress moduleSlug="phase-1-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations, this is a map not a tutorial */}
      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This module is not new material. It&apos;s a <strong>map of Phase 1</strong> — every rule, every curve, every gotcha from the three previous modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read on the train before a phone screen, not as a tutorial.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          The three modules you&apos;re consolidating: <Link href="/courses/dsa/modules/big-o" className="text-emerald-600 hover:underline">Big-O from zero</Link>, <Link href="/courses/dsa/modules/space-complexity" className="text-emerald-600 hover:underline">Space complexity &amp; the call stack</Link>, and <Link href="/courses/dsa/modules/amortized-analysis" className="text-emerald-600 hover:underline">Best, average, worst &amp; amortized analysis</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — The 7 curves */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">1. The 7 curves</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Memorize the order. Every Big-O answer you give in an interview lands on one of these seven.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Curve</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Real-world example</th>
                <th className="px-4 py-3 font-semibold">Code shape that gives it away</th>
                <th className="px-4 py-3 font-semibold">Common LeetCode trap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">O(1)</td>
                <td className="px-4 py-3">Constant</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Array index, HashMap lookup</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No loop touching <code>n</code></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Calling <code>list.contains()</code> in a loop — that&apos;s O(n) inside, not O(1)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">O(log n)</td>
                <td className="px-4 py-3">Logarithmic</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Binary search, BST lookup</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Halving each iteration: <code>n /= 2</code> or <code>lo &lt; hi</code> with mid</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Forgetting the data must be <em>sorted</em></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">O(n)</td>
                <td className="px-4 py-3">Linear</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Scanning a list, single pass</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">One <code>for</code> loop from 0 to n</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Two sequential passes — still O(n), not O(2n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">O(n log n)</td>
                <td className="px-4 py-3">Linearithmic</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Merge sort, quicksort, <code>Arrays.sort</code></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sort + linear scan, or divide-and-conquer with merge</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Sort then walk&quot; — the sort dominates, not the walk</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-orange-600">O(n²)</td>
                <td className="px-4 py-3">Quadratic</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Nested scans, bubble sort, pairwise compare</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Loop inside a loop, both over <code>n</code></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Building a string with <code>+=</code> in a loop — accidental O(n²)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">O(2ⁿ)</td>
                <td className="px-4 py-3">Exponential</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Naive recursive Fibonacci, subsets, brute-force subset-sum</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Two recursive calls per frame, no memo</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Forgetting that memoization collapses this to O(n) — the DP trick</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-700">O(n!)</td>
                <td className="px-4 py-3">Factorial</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Permutations, brute-force TSP</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Backtracking that picks one of the remaining items each level</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Confusing with O(2ⁿ) — n! grows much faster (10! ≈ 3.6M, 2¹⁰ = 1024)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Rule of thumb at <code>n = 1000</code>: O(n²) is a million ops (~1ms, fine). At <code>n = 10⁶</code> it&apos;s a trillion (~hours, not fine). At <code>n = 20</code>, O(2ⁿ) is a million; at <code>n = 40</code> it&apos;s a trillion. Exponential breaks at much smaller n than you&apos;d think.
        </p>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/big-o" className="text-emerald-600 hover:underline">Module 1 — Big-O from zero</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Big-O calculation rules */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">2. The 4 calculation rules</h2>
        <p className="not-prose mb-6 text-sm text-slate-500 dark:text-slate-400">
          Apply in this order. Most Big-O questions are settled by rules 1–3.
        </p>

        <h3 className="mt-6 mb-2 text-lg font-semibold">Rule 1 — Drop constants</h3>
        <p className="not-prose text-slate-700 dark:text-slate-300">
          <code>O(2n)</code>, <code>O(3n)</code>, <code>O(500n)</code> are all <code>O(n)</code>. Big-O is about <em>growth rate</em>, not actual operation count.
        </p>
        <CodeBlock lang="java" caption="Two passes — still O(n)">{`int sumThenMax(int[] a) {
    int s = 0;
    for (int x : a) s += x;          // n ops
    int m = Integer.MIN_VALUE;
    for (int x : a) m = Math.max(m, x); // n more ops
    return s + m;                    // total 2n → O(n)
}`}</CodeBlock>

        <h3 className="mt-8 mb-2 text-lg font-semibold">Rule 2 — Drop lower-order terms</h3>
        <p className="not-prose text-slate-700 dark:text-slate-300">
          <code>O(n² + n)</code> is <code>O(n²)</code>. <code>O(n log n + n)</code> is <code>O(n log n)</code>. The dominant term wins; the others are noise at large n.
        </p>
        <CodeBlock lang="java" caption="Setup + nested loop — the nested loop dominates">{`void check(int[] a) {
    Arrays.sort(a);                          // n log n
    for (int i = 0; i < a.length; i++) {
        for (int j = i + 1; j < a.length; j++) {
            if (a[i] == a[j]) return;        // n² nested
        }
    }
    // n log n + n²  →  O(n²)
}`}</CodeBlock>

        <h3 className="mt-8 mb-2 text-lg font-semibold">Rule 3 — Multiply nested loops</h3>
        <p className="not-prose text-slate-700 dark:text-slate-300">
          Inner runs once <em>per</em>{" "}outer iteration. Multiply the bounds. If they&apos;re both <code>n</code> → <code>O(n²)</code>. If outer is <code>n</code> and inner is <code>m</code> → <code>O(n·m)</code>.
        </p>
        <CodeBlock lang="java" caption="Two different bounds — keep them separate">{`boolean hasPair(int[] users, int[] orders) {
    for (int u : users) {           // n
        for (int o : orders) {      // m
            if (match(u, o)) return true;  // n · m → O(n·m)
        }
    }
    return false;
}`}</CodeBlock>

        <h3 className="mt-8 mb-2 text-lg font-semibold">Rule 4 — Add sequential blocks (then drop lower-order)</h3>
        <p className="not-prose text-slate-700 dark:text-slate-300">
          Independent blocks: add their complexities, then apply rule 2.
        </p>
        <CodeBlock lang="java" caption="Three sequential passes — drop everything but the dominant">{`void pipeline(int[] a) {
    Arrays.sort(a);                          // n log n
    for (int x : a) System.out.println(x);   // n
    for (int i = 0; i < a.length; i++)
        for (int j = i+1; j < a.length; j++)
            doWork(a[i], a[j]);              // n²
    // n log n + n + n²  →  O(n²)
}`}</CodeBlock>

        <p className="not-prose mt-6 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/big-o" className="text-emerald-600 hover:underline">Module 1 — Big-O from zero</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Reading code for Big-O, 5 patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">3. Reading code for Big-O — the 5 patterns</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          When you see this shape, you say this complexity. No further analysis needed.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Pattern 1 · single loop</div>
            <code className="mb-2 block text-xs text-slate-700 dark:text-slate-300">for i in 0..n: work()</code>
            <div className="font-mono text-sm font-semibold">→ O(n)</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-orange-600 uppercase">Pattern 2 · nested loops</div>
            <code className="mb-2 block text-xs text-slate-700 dark:text-slate-300">for i: for j: work()</code>
            <div className="font-mono text-sm font-semibold">→ O(n²) — or O(n·m) if different sizes</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Pattern 3 · halving</div>
            <code className="mb-2 block text-xs text-slate-700 dark:text-slate-300">while n &gt; 0: n /= 2</code>
            <div className="font-mono text-sm font-semibold">→ O(log n)</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-600 uppercase">Pattern 4 · sort + scan</div>
            <code className="mb-2 block text-xs text-slate-700 dark:text-slate-300">sort(a); for x in a: work()</code>
            <div className="font-mono text-sm font-semibold">→ O(n log n) — sort dominates</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-600 uppercase">Pattern 5 · recursion with two calls</div>
            <code className="mb-2 block text-xs text-slate-700 dark:text-slate-300">f(n) = f(n-1) + f(n-2) + work()</code>
            <div className="font-mono text-sm font-semibold">→ O(2ⁿ) without memo, O(n) with memo</div>
          </div>
        </div>

        <Callout variant="insight">
          <strong>The shortcut:</strong>{" "}when you see a recursive call, the time complexity is roughly <em>branching factor</em> ^ <em>depth</em>. One call per frame → linear. Two calls per frame, depth n → 2ⁿ. Memoization cuts this to <em>distinct subproblems × work per subproblem</em>.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/big-o" className="text-emerald-600 hover:underline">Module 1 — Big-O from zero</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Space complexity cheat sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">4. Space complexity cheat sheet</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          When an interviewer asks &quot;and what&apos;s the space complexity?&quot;, they almost always mean <em>auxiliary</em>{" "}space.
        </p>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-5 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Auxiliary space</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Extra memory <em>beyond the input</em>{" "}that your algorithm allocates. This is what the interviewer cares about.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>In-place sort → O(1) auxiliary</li>
              <li>Merge sort → O(n) auxiliary (the temp arrays)</li>
              <li>BFS with a queue → O(n) auxiliary</li>
              <li>DP with a 2D table → O(n·m) auxiliary</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-5 dark:border-slate-800 dark:bg-amber-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">JVM stack vs heap</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              In Java, memory comes from two regions:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>Stack</strong>: ~512KB–1MB per thread. Holds call frames, local primitives, references. Recursion lives here.</li>
              <li><strong>Heap</strong>: gigabytes. Every <code>new</code> goes here — arrays, objects, ArrayList internals.</li>
              <li>Java has <strong>no tail-call optimization</strong>. Deep recursion = StackOverflowError.</li>
            </ul>
          </div>
        </div>

        <h3 className="mb-2 text-base font-semibold">Recursion depth → stack space</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 font-semibold">Max recursion depth</th>
                <th className="px-4 py-3 font-semibold">Stack space</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">factorial(n)</td>
                <td className="px-4 py-3">n</td>
                <td className="px-4 py-3 font-mono">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Linear chain — one call per frame</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">binarySearch</td>
                <td className="px-4 py-3">log n</td>
                <td className="px-4 py-3 font-mono">O(log n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Halves each call</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">mergeSort</td>
                <td className="px-4 py-3">log n</td>
                <td className="px-4 py-3 font-mono">O(log n) stack + O(n) heap</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Heap dominates total: O(n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">quickSort (avg)</td>
                <td className="px-4 py-3">log n</td>
                <td className="px-4 py-3 font-mono">O(log n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">In-place — no heap allocation</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">quickSort (worst)</td>
                <td className="px-4 py-3">n</td>
                <td className="px-4 py-3 font-mono">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Already-sorted input + bad pivot — can StackOverflow</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">DFS on tree</td>
                <td className="px-4 py-3">height</td>
                <td className="px-4 py-3 font-mono">O(h)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Balanced → O(log n). Skewed → O(n).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">naive fib(n)</td>
                <td className="px-4 py-3">n</td>
                <td className="px-4 py-3 font-mono">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Despite O(2ⁿ) time — only one branch is on the stack at a time</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn">
          <strong>The Java-specific gotcha:</strong>{" "}recursion depth past ~5,000–10,000 frames will throw <code>StackOverflowError</code>. For tree algorithms on a skewed tree of n = 10⁶ nodes, you need an iterative version with an explicit stack on the heap.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/space-complexity" className="text-emerald-600 hover:underline">Module 2 — Space complexity &amp; the call stack</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Best / average / worst */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">5. Best vs average vs worst — when each one matters</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Big-O is an envelope of three cases. The interviewer is usually asking about worst-case unless they say otherwise — but you should know all three.
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0 dark:divide-slate-800">
            <div className="bg-emerald-50/40 p-5 dark:bg-emerald-950/20">
              <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Best case</div>
              <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                The luckiest input. Rarely useful on its own — but knowing it tells you the theoretical floor.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
                <li>Insertion sort on sorted: O(n)</li>
                <li>Quicksort on perfectly partitioned: O(n log n)</li>
                <li>HashMap lookup no collisions: O(1)</li>
              </ul>
            </div>

            <div className="bg-amber-50/40 p-5 dark:bg-amber-950/20">
              <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Average case</div>
              <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                What you actually pay in practice. The honest answer for randomized inputs.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
                <li>Quicksort: O(n log n)</li>
                <li>HashMap.get: O(1)</li>
                <li>Insertion sort: O(n²)</li>
              </ul>
            </div>

            <div className="bg-rose-50/40 p-5 dark:bg-rose-950/20">
              <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Worst case</div>
              <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
                The guarantee. What you commit to in an SLA or a P99 latency target.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
                <li>Quicksort: O(n²) — bad pivot</li>
                <li>HashMap.get: O(n) — all collide</li>
                <li>Insertion sort: O(n²)</li>
              </ul>
            </div>
          </div>
        </div>

        <Callout variant="insight">
          <strong>Decision rule:</strong>{" "}for a hot path in a production service with P99 latency requirements, <em>only worst-case matters</em>. For a one-shot script over random data, average is fine. Best case is only interesting when describing a particular structure&apos;s adaptive behavior (like insertion sort being O(n) on already-sorted data — that&apos;s why TimSort starts with insertion sort on small runs).
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/amortized-analysis" className="text-emerald-600 hover:underline">Module 3 — Best, average, worst &amp; amortized analysis</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Amortized analysis */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">6. Amortized analysis in one diagram</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          ArrayList.add is O(1) amortized but O(n) worst-case. The picture explains why.
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Mermaid chart={doublingChart} />
        </div>

        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <strong>Most adds cost 1 op</strong> (just write to the next free slot). Rare adds trigger a resize — copy the whole array to a new one of double capacity. Those cost <code>1 + currentSize</code>.
          </li>
          <li>
            <strong>The expensive ones get rarer as n grows</strong> — resizes happen at sizes 1, 2, 4, 8, 16, 32… That&apos;s log n resizes total. The sum of resize costs over n adds is roughly <code>1 + 2 + 4 + … + n ≈ 2n</code> (geometric series).
          </li>
          <li>
            <strong>Total work for n adds ≈ 2n.</strong>{" "}Amortized cost per add = 2n / n = 2 → <strong>O(1)</strong>.
          </li>
          <li>
            <strong>Banker&apos;s (accounting) method:</strong>{" "}charge each add 3 &quot;coins&quot; — 1 pays for the write, 2 are deposited as credits. When a resize happens, every previously-stored element has accumulated enough credits to pay for its own copy. The math works out exactly, and that&apos;s why you can claim O(1) per add with a clean conscience.
          </li>
          <li>
            <strong>What kills the trick:</strong>{" "}arithmetic growth (e.g. <code>capacity + 10</code> each resize). That gives <code>O(n²)</code> total work, which means amortized <code>O(n)</code> per add. Geometric growth (factor &gt; 1, typically 1.5× or 2×) is what makes amortized O(1) possible.
          </li>
        </ul>

        <Callout variant="warn">
          <strong>Amortized O(1) ≠ worst-case O(1).</strong>{" "}A single <code>add()</code> can still take O(n). For P99-sensitive systems (real-time games, trading, latency-critical APIs), pre-size your buffer or accept the spike — don&apos;t rely on the amortized number to hold per-call.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/dsa/modules/amortized-analysis" className="text-emerald-600 hover:underline">Module 3 — Best, average, worst &amp; amortized analysis</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Java Collections Big-O cheat sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">7. Java Collections Big-O cheat sheet</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Memorize the rows you actually use. The ones marked <em>amortized</em>{" "}are the gotcha rows.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Collection</th>
                <th className="px-4 py-3 font-semibold">Access</th>
                <th className="px-4 py-3 font-semibold">Search</th>
                <th className="px-4 py-3 font-semibold">Insert</th>
                <th className="px-4 py-3 font-semibold">Delete</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayList</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)*</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized add-at-end. Insert/delete in middle is O(n) (shift).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">LinkedList</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Insert/delete O(1) <em>given a node reference</em>; finding the node is O(n).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">HashMap</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg / O(n) worst</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg*</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized — rare rehash is O(n). Java 8+ uses tree-bins, so worst is O(log n) per bucket.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">TreeMap</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Red-Black tree. Sorted iteration. Slower than HashMap; pick when you need order.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">HashSet</td>
                <td className="px-4 py-3 text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Backed by HashMap. Same worst-case caveats.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">TreeSet</td>
                <td className="px-4 py-3 text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Backed by TreeMap. Sorted iteration, range queries.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayDeque</td>
                <td className="px-4 py-3 text-emerald-600">O(1) ends</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* ends</td>
                <td className="px-4 py-3 text-emerald-600">O(1) ends</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized. Use this for stacks AND queues — not Stack, not LinkedList.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">PriorityQueue</td>
                <td className="px-4 py-3 text-emerald-600">O(1) peek</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n) min</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Binary heap. <code>remove(Object)</code> is O(n); only removing the head is O(log n).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Stack (legacy)</td>
                <td className="px-4 py-3 text-emerald-600">O(1) top</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)*</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Don&apos;t use. Synchronized + extends Vector. Use ArrayDeque.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Full deep dive: <Link href="/courses/dsa/modules/java-collections" className="text-emerald-600 hover:underline">Module 21 — Java Collections Framework deep dive</Link> (Phase 5).
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">8. Three gotchas that bite people</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Each of these has cost real engineers real hours. If you only remember three things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 1 · String concatenation in a loop</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              In Java, <code>String</code> is immutable. <code>s += x</code> in a loop builds a brand-new string each iteration, copying every prior character. <strong>That&apos;s O(n²)</strong>, not O(n). Use <code>StringBuilder</code>.
            </p>
            <CodeBlock lang="java">{`// BAD — O(n²)
String s = "";
for (String w : words) s += w;

// GOOD — O(n)
StringBuilder sb = new StringBuilder();
for (String w : words) sb.append(w);
String s = sb.toString();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 2 · <code>list.contains()</code> inside a loop</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              <code>ArrayList.contains</code> is O(n). Calling it inside a loop of size n is O(n²). Convert to <code>HashSet</code> once for O(1) lookups.
            </p>
            <CodeBlock lang="java">{`// BAD — O(n²)
List<Integer> seen = new ArrayList<>();
for (int x : nums) {
    if (seen.contains(x)) return true;  // O(n) inside O(n) → O(n²)
    seen.add(x);
}

// GOOD — O(n)
Set<Integer> seen = new HashSet<>();
for (int x : nums) {
    if (!seen.add(x)) return true;      // O(1) average
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 3 · Recursion depth on big inputs</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              A recursive tree traversal on a skewed tree of n = 10⁶ nodes will <code>StackOverflowError</code> long before it returns. The big-O time is fine; the call-stack space is the killer. Convert to an iterative version using an explicit <code>Deque</code> on the heap.
            </p>
            <CodeBlock lang="java">{`// RISKY for skewed trees — stack depth = tree height
int sum(TreeNode n) {
    if (n == null) return 0;
    return n.val + sum(n.left) + sum(n.right);
}

// SAFE — explicit stack lives on the heap (gigabytes)
int sum(TreeNode root) {
    int total = 0;
    Deque<TreeNode> stack = new ArrayDeque<>();
    if (root != null) stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode n = stack.pop();
        total += n.val;
        if (n.right != null) stack.push(n.right);
        if (n.left != null) stack.push(n.left);
    }
    return total;
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="not-prose mb-1 text-2xl font-bold tracking-tight">9. Optional self-assessment</h2>
        <p className="not-prose mb-6 text-sm text-slate-500 dark:text-slate-400">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="A function does two sequential O(n) scans, then an O(n²) nested loop. What's its overall time complexity?"
          options={[
            { label: "O(n²)", correct: true, explanation: "Right. Add: O(n) + O(n) + O(n²) = O(2n + n²). Drop constants and lower-order terms → O(n²). The dominant term wins." },
            { label: "O(n² + n)", explanation: "Technically the sum, but you always drop the lower-order term. The clean Big-O answer is O(n²)." },
            { label: "O(n³)", explanation: "You only multiply when loops are nested. These are sequential, so you add them." },
            { label: "O(2n²)", explanation: "Drop constants. 2n² is O(n²)." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What is the auxiliary space complexity of merge sort?"
          options={[
            { label: "O(1) — it sorts in place", explanation: "That's quicksort. Merge sort needs temporary arrays for the merge step." },
            { label: "O(log n) — just the recursion stack", explanation: "Close, but you're forgetting the heap allocation. The temp arrays during merge add up to O(n) on the heap." },
            { label: "O(n) — the temporary arrays during merge", correct: true, explanation: "Right. The recursion stack is O(log n) but the temp arrays dominate at O(n). Total auxiliary space: O(n)." },
            { label: "O(n log n) — same as the time complexity", explanation: "Time and space are independent. Merge sort is O(n log n) time, O(n) space." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="ArrayList.add is O(1) amortized. What does that actually mean for a single call in production?"
          options={[
            { label: "Every call takes constant time.", explanation: "False. The amortized bound averages over a sequence; a single resize call is O(n)." },
            { label: "Over a long sequence of adds, the total cost is O(n), so per-add averages to O(1) — but one specific call can spike to O(n).", correct: true, explanation: "Right. That's the entire point of amortized analysis: a useful average over a sequence, while individual operations can still spike. P99-sensitive code needs to pre-size." },
            { label: "It's a marketing term; it's really O(n).", explanation: "The amortized bound is mathematically rigorous (banker's method proves it). It's not marketing — but you have to know what it does and doesn't promise." },
            { label: "It only holds if you use ensureCapacity().", explanation: "It holds with default geometric growth. ensureCapacity is an optimization to avoid the spikes entirely." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Naive recursive fib(n) has O(2ⁿ) time. What's its space complexity?"
          options={[
            { label: "O(2ⁿ) — same as time", explanation: "Despite the exponential time, only one branch is on the call stack at a time. The other branch hasn't been called yet (or has returned)." },
            { label: "O(n²)", explanation: "Not the right shape. Each frame uses O(1); depth determines space." },
            { label: "O(n) — max recursion depth equals n", correct: true, explanation: "Right. The call tree has 2ⁿ nodes total but the deepest path is n. Only one root-to-leaf path is on the stack at any moment, so space is O(n). This is a classic gotcha — time ≠ space for recursive trees." },
            { label: "O(log n)", explanation: "That would be if the recursion halved each time (like binary search). fib(n) calls fib(n-1), so depth is linear." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Which of these statements about HashMap is the most accurate single-line summary for an interview?"
          options={[
            { label: "O(1) for all operations.", explanation: "Misleading without an asterisk. Worst case is O(n) with all collisions, or O(log n) per bucket in Java 8+ tree-bins." },
            { label: "O(log n) average, like a balanced tree.", explanation: "That's TreeMap. HashMap is O(1) average." },
            { label: "Amortized O(1) average per put (rare rehash is O(n)); O(n) worst case if every key collides.", correct: true, explanation: "Right. This is the full honest answer: the amortization (for rehash), the average-case bound, AND the worst case. Signals you understand all three lenses." },
            { label: "O(n) — it's just a wrapped LinkedList of buckets.", explanation: "Too pessimistic. Average case is O(1); the linked-list-per-bucket only shows up in worst case." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 dark:border-amber-900 dark:from-amber-950/30 dark:via-slate-900 dark:to-yellow-950/30">
        <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
          Phase 1 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now read code for complexity on sight</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The seven curves, the four calculation rules, the five code patterns, the auxiliary-vs-stack distinction, the three cases, and the amortized trick. That&apos;s the entire mental model — every data structure from here on out will be described in terms you already know.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 2 — Linear Data Structures.</strong>{" "}Arrays, dynamic arrays (you already know how those work), strings, linked lists, stacks, queues. Real implementations, real LeetCode patterns.
        </p>
        <Link
          href="/courses/dsa/modules/arrays"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
        >
          Next phase: Linear Data Structures →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-1-revision" />
    </article>
  );
}
