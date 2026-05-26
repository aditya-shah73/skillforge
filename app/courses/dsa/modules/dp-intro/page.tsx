import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "pain", title: "The pain point — naive recursive Fibonacci" },
  { id: "memo", title: "Memoization: top-down DP" },
  { id: "tab", title: "Tabulation: bottom-up DP" },
  { id: "tells", title: "Overlapping subproblems + optimal substructure" },
  { id: "stairs", title: "Climbing Stairs — same recurrence, new framing" },
  { id: "robber", title: "House Robber — when the recurrence isn't a sum" },
];

export default function DpIntroModule() {
  const mod = getModuleBySlug("dp-intro")!;

  // fib(5) recursion tree highlighting overlap
  const fibOverlap = `
flowchart TB
    F5(("fib(5)")) --> F4(("fib(4)"))
    F5 --> F3a(("fib(3) ★"))
    F4 --> F3b(("fib(3) ★"))
    F4 --> F2a(("fib(2) ✦"))
    F3a --> F2b(("fib(2) ✦"))
    F3a --> F1a(("fib(1)"))
    F3b --> F2c(("fib(2) ✦"))
    F3b --> F1b(("fib(1)"))
    F2a --> F1c(("fib(1)"))
    F2a --> F0a(("fib(0)"))
    F2b --> F1d(("fib(1)"))
    F2b --> F0b(("fib(0)"))
    F2c --> F1e(("fib(1)"))
    F2c --> F0c(("fib(0)"))
    style F5 fill:#d946ef,color:#fff,stroke:#a21caf
    style F4 fill:#e879f9,color:#fff,stroke:#a21caf
    style F3a fill:#fca5a5,color:#000,stroke:#dc2626
    style F3b fill:#fca5a5,color:#000,stroke:#dc2626
    style F2a fill:#fde68a,color:#000,stroke:#d97706
    style F2b fill:#fde68a,color:#000,stroke:#d97706
    style F2c fill:#fde68a,color:#000,stroke:#d97706
  `.trim();

  // Memoization collapses tree → DAG
  const memoDag = `
flowchart TB
    F5(("fib(5)")) --> F4(("fib(4)"))
    F5 --> F3(("fib(3)"))
    F4 --> F3
    F4 --> F2(("fib(2)"))
    F3 --> F2
    F3 --> F1(("fib(1)"))
    F2 --> F1
    F2 --> F0(("fib(0)"))
    style F5 fill:#10b981,color:#fff,stroke:#047857
    style F4 fill:#34d399,color:#000,stroke:#059669
    style F3 fill:#6ee7b7,color:#000,stroke:#10b981
    style F2 fill:#a7f3d0,color:#000,stroke:#10b981
    style F1 fill:#d1fae5,color:#000,stroke:#10b981
    style F0 fill:#d1fae5,color:#000,stroke:#10b981
  `.trim();

  // Bottom-up tabulation: fill the array left → right
  const tabFlow = `
flowchart LR
    subgraph dp["dp[] filled bottom-up"]
        direction LR
        D0["dp[0] = 0<br/>(base)"]
        D1["dp[1] = 1<br/>(base)"]
        D2["dp[2] = dp[1]+dp[0]<br/>= 1"]
        D3["dp[3] = dp[2]+dp[1]<br/>= 2"]
        D4["dp[4] = dp[3]+dp[2]<br/>= 3"]
        D5["dp[5] = dp[4]+dp[3]<br/>= 5"]
        D0 --> D2
        D1 --> D2
        D1 --> D3
        D2 --> D3
        D2 --> D4
        D3 --> D4
        D3 --> D5
        D4 --> D5
    end
    style D0 fill:#fbbf24,color:#000,stroke:#d97706
    style D1 fill:#fbbf24,color:#000,stroke:#d97706
    style D2 fill:#a7f3d0,color:#000,stroke:#10b981
    style D3 fill:#6ee7b7,color:#000,stroke:#10b981
    style D4 fill:#34d399,color:#000,stroke:#059669
    style D5 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Overlapping vs non-overlapping comparison
  const overlapVsNot = `
flowchart TB
    subgraph DP["DP candidate · OVERLAPPING subproblems"]
        direction TB
        A1(("fib(5)")) --> A2(("fib(4)"))
        A1 --> A3(("fib(3) ★"))
        A2 --> A3
        A2 --> A4(("fib(2) ✦"))
        A3 --> A4
        A3 --> A5(("fib(1)"))
    end
    subgraph DC["NOT a DP candidate · disjoint subproblems"]
        direction TB
        B1["mergeSort([1..8])"] --> B2["sort([1..4])"]
        B1 --> B3["sort([5..8])"]
        B2 --> B4["sort([1..2])"]
        B2 --> B5["sort([3..4])"]
        B3 --> B6["sort([5..6])"]
        B3 --> B7["sort([7..8])"]
    end
    style DP fill:#831843,color:#fff
    style DC fill:#1e3a8a,color:#fff
    style A3 fill:#fca5a5,color:#000,stroke:#dc2626
    style A4 fill:#fde68a,color:#000,stroke:#d97706
    style B2 fill:#bfdbfe,color:#000
    style B3 fill:#bfdbfe,color:#000
  `.trim();

  // Climbing stairs — paths to step 4
  const stairsPaths = `
flowchart BT
    S0["step 0<br/>(start)"] --> S1["step 1<br/>1 way"]
    S0 --> S2["step 2<br/>2 ways<br/>(1+1, 2)"]
    S1 --> S2
    S1 --> S3["step 3<br/>3 ways"]
    S2 --> S3
    S2 --> S4["step 4<br/>5 ways"]
    S3 --> S4
    style S0 fill:#fbbf24,color:#000,stroke:#d97706
    style S1 fill:#fde68a,color:#000,stroke:#d97706
    style S2 fill:#fcd34d,color:#000,stroke:#d97706
    style S3 fill:#f59e0b,color:#000,stroke:#b45309
    style S4 fill:#d946ef,color:#fff,stroke:#a21caf
  `.trim();

  // House Robber decision tree at index i
  const robberDecision = `
flowchart TB
    I[("at house i<br/>nums[i] gold inside")] --> SK["SKIP house i<br/>best = dp[i-1]"]
    I --> TK["TAKE house i<br/>best = dp[i-2] + nums[i]<br/>(can't take i-1, that's adjacent)"]
    SK --> M["dp[i] = max(skip, take)"]
    TK --> M
    style I fill:#d946ef,color:#fff,stroke:#a21caf
    style SK fill:#bfdbfe,color:#000,stroke:#3b82f6
    style TK fill:#fde68a,color:#000,stroke:#d97706
    style M fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="dp-intro" />
      <ModuleProgress moduleSlug="dp-intro" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 7 · Module 32 · Dynamic Programming
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2.5–3h · the technique that turns &quot;exponential and broken&quot; into &quot;linear and obvious&quot;</p>
      </div>

      {/* ───────────────── Part 1 · The pain point ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="pain" title="I see the redundant work in naive recursion" xp={20}>
      <section>
        <h2 id="pain">The pain point — naive recursive Fibonacci</h2>

        <p>
          Dynamic programming has a reputation for being hard. It isn&apos;t — it&apos;s recursion plus a cache. The
          reason it feels hard is that most people meet DP through someone showing them a 2D table full of indices and
          a recurrence pulled out of thin air. We&apos;re going to do it the other way around: write a recursive
          solution that&apos;s catastrophically slow, watch where the slowness comes from, and let the cache fall out
          naturally.
        </p>

        <p>
          The canonical example, the one every DP module on earth opens with, is Fibonacci. It&apos;s not because
          Fibonacci is interesting — it isn&apos;t. It&apos;s because the recurrence is two lines, the bug is
          spectacular, and the fix is a four-character edit.
        </p>

        <h3>The recurrence</h3>

        <p>
          Fibonacci is defined by <code>fib(0) = 0</code>, <code>fib(1) = 1</code>, and{" "}
          <code>fib(n) = fib(n-1) + fib(n-2)</code> for <code>n ≥ 2</code>. Translate that to Java and you get the
          shortest recursive function in this whole course:
        </p>

        <CodeBlock lang="java">{`int fib(int n) {
    if (n < 2) return n;                     // base cases: fib(0)=0, fib(1)=1
    return fib(n - 1) + fib(n - 2);          // recurrence
}`}</CodeBlock>

        <p>
          It&apos;s correct. <code>fib(10)</code> returns 55. <code>fib(20)</code> returns 6765. <code>fib(30)</code>{" "}
          takes a noticeable pause. <code>fib(40)</code> takes about a second. <code>fib(50)</code> doesn&apos;t finish
          while you&apos;re still curious. What&apos;s going on?
        </p>

        <h3>Draw the recursion tree</h3>

        <p>
          Every recursive function has a recursion tree (Module 27). For <code>fib(5)</code>, it looks like this:
        </p>

        <Mermaid chart={fibOverlap} />

        <p>
          Look at the highlighted nodes. <code>fib(3)</code> appears twice. <code>fib(2)</code> appears three times.{" "}
          <code>fib(1)</code> appears five times. <code>fib(0)</code> appears three times. We are computing the exact
          same answers over and over, with no awareness that we&apos;ve already done the work.
        </p>

        <h3>Quantifying the disaster</h3>

        <p>
          The number of nodes in the tree for <code>fib(n)</code> satisfies the same recurrence as Fibonacci itself:{" "}
          <code>T(n) = T(n-1) + T(n-2) + 1</code>. That grows as <code>Θ(φⁿ)</code> where <code>φ ≈ 1.618</code> is the
          golden ratio. For practical purposes <strong>O(2ⁿ)</strong>.
        </p>

        <CodeBlock lang="plain">{`n      | total recursive calls   | wall-clock (rough)
-------|-------------------------|--------------------
20     |       21,891            |  < 1 ms
30     |    2,692,537            |  ~30 ms
40     |  331,160,281            |  ~3 s
50     |  40,730,022,147         |  ~6 minutes
60     |  ~5 trillion            |  ~14 hours`}</CodeBlock>

        <p>
          Now stare at that table next to this fact: <strong>there are only n+1 distinct subproblems.</strong>{" "}
          <code>fib(0), fib(1), fib(2), ..., fib(n)</code>. That&apos;s it. Eleven distinct values for{" "}
          <code>fib(10)</code>. Yet the naive recursion makes 177 calls to compute it. For <code>fib(50)</code>, 51
          distinct values — and we&apos;re making 40 billion calls.
        </p>

        <Callout variant="insight" title="The DP smell">
          <p>
            <strong>If your recursion has way more calls than there are distinct subproblems, you&apos;ve found a DP
            problem.</strong>{" "}That ratio — total calls divided by distinct subproblems — is the slack. Caching turns
            that ratio into 1. Every distinct subproblem gets computed exactly once, and every revisit is a O(1)
            lookup.
          </p>
          <p>
            The technique is so mechanical that &quot;rewrite naive recursion as recursion-with-cache&quot; is the
            first thing to try on any new DP problem. Get it correct first, then optimize.
          </p>
        </Callout>

        <h3>Why iterative Fibonacci doesn&apos;t have this problem</h3>

        <p>
          The two-variable iterative version you&apos;d write in any practical setting:
        </p>

        <CodeBlock lang="java">{`int fibIter(int n) {
    if (n < 2) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return b;
}`}</CodeBlock>

        <p>
          This is O(n) time, O(1) space. It runs in microseconds for any <code>n</code> the int type can hold. Why is
          it so much faster? Because it computes each <code>fib(i)</code> <em>exactly once</em>{" "}and then reuses the
          value by name. The naive recursion forgets every result the moment the call returns.
        </p>

        <p>
          That observation — &quot;the iterative version is fast because it remembers&quot; — is the entire conceptual
          jump from recursion to dynamic programming. DP is just &quot;recursion that remembers.&quot;
        </p>

        <Quiz
          kind="Pain-point check"
          question="The naive recursive fib(n) makes Θ(φⁿ) calls but there are only n+1 distinct subproblems (fib(0) through fib(n)). What does that tell you?"
          options={[
            { label: "Recursion is fundamentally slow and we should always use loops.", explanation: "Recursion isn't slow per se — linear recursion (sum, factorial, list traversal) runs in O(n), same as the iterative loop. The blowup here is structural, caused by overlapping subproblems, not by recursion itself." },
            { label: "The redundancy is enormous: each distinct subproblem is recomputed an exponential number of times. If we cached every answer the first time we computed it, the total work would collapse to O(n).", correct: true, explanation: "Right. Total work = (distinct subproblems) × (work per subproblem) once you eliminate the redundancy. n+1 subproblems × O(1) work each = O(n). The cache is the entire optimization." },
            { label: "Java's recursion overhead is high.", explanation: "Per-call overhead is a constant factor. It can't turn O(n) into O(2ⁿ); only structural redundancy can." },
            { label: "The recurrence is wrong; it should be fib(n) = fib(n-1) + 1.", explanation: "That's not Fibonacci. The recurrence fib(n) = fib(n-1) + fib(n-2) is mathematically correct — it's just naively expensive to compute by direct recursion." },
          ]}
        />

        <Quiz
          kind="Pain-point check"
          question="Why does the recursion tree for naive fib(5) contain three copies of the fib(2) node?"
          options={[
            { label: "fib(2) is part of the base case and gets called extra times.", explanation: "fib(2) is not a base case — only fib(0) and fib(1) are. fib(2) is computed by recursion like every other intermediate value." },
            { label: "fib(5) calls fib(4) and fib(3); fib(4) further branches into fib(3) and fib(2); fib(3) branches into fib(2) and fib(1). Each recursive expansion of an fib(k) for k ≥ 2 splits into two children, and the same subproblems appear in multiple branches because the tree has no sharing.", correct: true, explanation: "Right. The tree is a pure tree — no edges merge — so independent paths from the root can reach the same value via different routes. That's the overlapping-subproblems property in its purest form." },
            { label: "It's a bug in the recursion.", explanation: "The recursion is correct. The waste is by design — Fibonacci's recurrence inherently has overlap, and the naive implementation makes no attempt to detect or share." },
            { label: "The compiler unrolls the recursion three times.", explanation: "The JVM doesn't unroll recursive calls. The three copies are real, separate stack frames at runtime." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Memoization ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="memo" title="I can memoize a naive recursion in 4 lines" xp={20}>
      <section>
        <h2 id="memo">Memoization: top-down DP</h2>

        <p>
          <strong>Memoization</strong>{" "}is the trick: cache the result of every recursive call the first time you
          compute it, and on every subsequent call for the same input, return the cached value instead of recursing.
          The recursion stays the same — the math is unchanged. We&apos;re just adding a layer of memory.
        </p>

        <h3>The four-line edit</h3>

        <p>
          Take the naive recursion. Add a <code>memo</code> array indexed by <code>n</code>. At the top of the
          function: if the answer is already in the memo, return it. At the bottom: store the answer before returning.
          That&apos;s it.
        </p>

        <CodeBlock lang="java">{`int fib(int n) {
    Integer[] memo = new Integer[n + 1];
    return fibMemo(n, memo);
}

int fibMemo(int n, Integer[] memo) {
    if (n < 2) return n;                          // base
    if (memo[n] != null) return memo[n];          // cache hit — skip the work
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);   // compute & store
    return memo[n];
}`}</CodeBlock>

        <p>
          Three new lines (the <code>memo</code> declaration, the cache check, the assignment), one rearranged. The
          recurrence is identical. The base cases are identical. We just remember the answers.
        </p>

        <h3>What the recursion tree becomes</h3>

        <p>
          The naive tree had <code>Θ(φⁿ)</code> nodes. The memoized version has{" "}
          <strong>at most n+1 distinct nodes</strong> — every other &quot;call&quot; is short-circuited at the cache
          check. The structure is no longer a tree; it&apos;s a <strong>directed acyclic graph (DAG)</strong>{" "}where
          shared subproblems literally share a node:
        </p>

        <Mermaid chart={memoDag} />

        <p>
          Compare with the tree from Part 1. Same recursion, same recurrence, same base cases. The memo turned a
          <code>Θ(φⁿ)</code>-node tree into a <code>n+1</code>-node DAG. Every node is computed exactly once, and every
          revisit is a O(1) lookup.
        </p>

        <Callout variant="insight" title="Memoization = caching pure-function calls">
          <p>
            A function is <strong>pure</strong>{" "}if its return value depends only on its arguments — same input always
            gives same output, no side effects. <code>fib</code> is pure: <code>fib(7)</code> is <code>13</code>, today,
            tomorrow, every time.
          </p>
          <p>
            Memoization is the universal optimization for pure functions: once you&apos;ve computed{" "}
            <code>f(args)</code> once, you can return the same answer for all future calls without re-running. In
            functional languages this is sometimes done by a generic <code>memoize</code> decorator that wraps any
            function. In Java we usually inline it for performance — but mentally the framing is the same: &quot;wrap
            this pure function in a cache.&quot;
          </p>
        </Callout>

        <h3>Cost analysis</h3>

        <p>
          Time complexity for memoized <code>fib(n)</code>:
        </p>

        <ul>
          <li>Each of the n+1 distinct subproblems is computed exactly once.</li>
          <li>Each computation does O(1) non-recursive work (one comparison, one cache lookup, one addition, one store).</li>
          <li>Total: <strong>O(n)</strong>{" "}time.</li>
        </ul>

        <p>Space complexity:</p>

        <ul>
          <li>Memo array: <strong>O(n)</strong>.</li>
          <li>Recursion stack at peak: the longest chain in the DAG is from <code>fib(n)</code> down to <code>fib(0)</code>, depth n. So <strong>O(n)</strong>{" "}stack.</li>
          <li>Total: <strong>O(n)</strong>{" "}auxiliary space.</li>
        </ul>

        <p>
          From <code>O(2ⁿ)</code> to <code>O(n)</code>. For <code>fib(50)</code>, that&apos;s the difference between 6
          minutes and 6 microseconds. <strong>Same recursion. Plus a cache.</strong>
        </p>

        <h3>HashMap vs array memo</h3>

        <p>
          We used <code>Integer[]</code> here because the parameter <code>n</code> is a small non-negative int — a
          dense array index. When the parameter space is sparse, irregular, or non-numeric (a String, a pair of ints
          with weird ranges), use a <code>HashMap</code>:
        </p>

        <CodeBlock lang="java">{`Map<Integer, Integer> memo = new HashMap<>();

int fibMap(int n) {
    if (n < 2) return n;
    Integer cached = memo.get(n);
    if (cached != null) return cached;
    int v = fibMap(n - 1) + fibMap(n - 2);
    memo.put(n, v);
    return v;
}`}</CodeBlock>

        <p>
          The map adds a constant-factor overhead (hashing, boxing) but is more flexible. For 2D state
          (memoize on <code>(i, j)</code>), use a 2D array if both dimensions are dense, or a{" "}
          <code>Map&lt;Long, Integer&gt;</code> with a packed key like <code>((long) i &lt;&lt; 32) | j</code>.
        </p>

        <Callout variant="warn" title="The Integer[] vs int[] choice matters">
          <p>
            We used <code>Integer[]</code> (boxed) instead of <code>int[]</code> (primitive) so we could distinguish
            &quot;not yet computed&quot; (<code>null</code>) from &quot;computed and equals zero.&quot; If you use{" "}
            <code>int[]</code>, every entry starts at <code>0</code>, and you can&apos;t tell apart &quot;haven&apos;t
            seen this yet&quot; from &quot;answer is zero.&quot; The fix for primitive arrays is either a sentinel
            value (<code>-1</code> if you know the answer is non-negative) or a parallel <code>boolean[] computed</code>{" "}
            array.
          </p>
          <p>
            For Fibonacci specifically, <code>int[]</code> with no sentinel works because <code>fib(0) = 0</code>
            happens to be the only zero, and we hard-code the base cases. But the general rule for memoization is:
            distinguish &quot;empty&quot; from &quot;zero&quot; explicitly.
          </p>
        </Callout>

        <Quiz
          kind="Memoization check"
          question="What's the time complexity of the memoized fib(n)?"
          options={[
            { label: "O(2ⁿ) — recursion always carries that cost.", explanation: "That's the cost of the naive recursion. Memoization specifically eliminates the redundancy that creates the exponential blowup." },
            { label: "O(n²) — n calls, each doing O(n) work.", explanation: "Each cache hit is O(1), not O(n). The total work is bounded by the number of distinct subproblems times the per-subproblem work, both of which are O(n) and O(1) respectively here." },
            { label: "O(n) — each of n+1 distinct subproblems is computed once, with O(1) work per computation.", correct: true, explanation: "Right. The memo guarantees each subproblem is computed at most once. Per-subproblem work is constant (one add, one comparison). Total is O(n) time and O(n) space (memo + recursion stack)." },
            { label: "O(log n) — caching gives logarithmic speedup.", explanation: "Memoization eliminates redundant work entirely; it doesn't add a logarithmic factor. The new bound is set by 'how many distinct subproblems are there', which is n+1 here, giving O(n)." },
          ]}
        />

        <Quiz
          kind="Memoization check"
          question="Why use Integer[] instead of int[] for the memo in this recursion?"
          options={[
            { label: "Integer[] is faster than int[].", explanation: "It's slower, due to boxing overhead. We accept that cost for clarity." },
            { label: "Java requires Integer[] for arrays passed to recursive functions.", explanation: "Java has no such requirement — int[] is passed by reference like any array." },
            { label: "Integer[] entries default to null, which lets us distinguish 'not yet computed' from 'computed and equals zero.' int[] entries default to 0, conflating those two cases.", correct: true, explanation: "Right. With int[], a value of 0 in the memo could mean either 'cache miss' or 'fib(0) = 0'. Integer[] gives us null as an unambiguous 'not computed' sentinel. Alternatives: int[] plus a parallel boolean[], or Arrays.fill(memo, -1) when the real answer is non-negative." },
            { label: "Integer[] supports more values than int[].", explanation: "They store the same range of int values; the difference is boxing and the availability of null." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Tabulation ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="tab" title="I can rewrite top-down memo as bottom-up iteration" xp={20}>
      <section>
        <h2 id="tab">Tabulation: bottom-up DP</h2>

        <p>
          Memoization is one face of dynamic programming. <strong>Tabulation</strong>{" "}is the other.
        </p>

        <p>
          The mental flip: instead of starting from <code>fib(n)</code> and recursing down toward the base cases (with
          a cache catching repeats), <strong>start from the base cases and build up</strong>. Fill an array
          <code>dp[]</code> in order, where each entry is computed from earlier entries that are already filled.
        </p>

        <h3>The bottom-up version</h3>

        <CodeBlock lang="java">{`int fib(int n) {
    if (n < 2) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0;                                 // base case
    dp[1] = 1;                                 // base case
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];          // recurrence, but in a loop
    }
    return dp[n];
}`}</CodeBlock>

        <p>
          Same recurrence (<code>dp[i] = dp[i-1] + dp[i-2]</code>), same base cases, same answers. No recursion, no
          stack, no <code>null</code> checks. Just a loop that fills an array left-to-right.
        </p>

        <Mermaid chart={tabFlow} />

        <h3>Why bottom-up is often the cleaner end state</h3>

        <ul>
          <li><strong>No recursion stack.</strong>{" "}The memoized version uses O(n) stack frames at peak. The tabulated version uses O(1) stack and O(n) heap (the <code>dp</code> array). For deep recursions on the JVM (n in the millions), bottom-up is the only viable form.</li>
          <li><strong>No null checks, no cache hit/miss logic.</strong>{" "}The order of computation is explicit; every entry is filled in exactly the right order.</li>
          <li><strong>Cache-friendlier.</strong>{" "}Sequential array access streams beautifully through CPU caches. The recursive version jumps around a HashMap or boxed-Integer array and pays for it.</li>
          <li><strong>Easier to space-optimize.</strong>{" "}Once you see that <code>dp[i]</code> only depends on the last two entries, you can throw away the array and keep two variables — which is exactly the <code>fibIter</code> we started with.</li>
        </ul>

        <h3>Space optimization: O(n) → O(1)</h3>

        <p>
          The recurrence only references <code>dp[i-1]</code> and <code>dp[i-2]</code>. We never look further back. So
          we don&apos;t need the whole array — just a sliding window of size 2.
        </p>

        <CodeBlock lang="java">{`int fib(int n) {
    if (n < 2) return n;
    int prev2 = 0;                              // dp[i-2]
    int prev1 = 1;                              // dp[i-1]
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;               // dp[i]
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`}</CodeBlock>

        <p>
          O(n) time, O(1) space. The full progression for Fibonacci:
        </p>

        <CodeBlock lang="plain">{`Naive recursion       O(2ⁿ) time, O(n) stack
Memoized recursion    O(n)  time, O(n) memo + O(n) stack
Tabulation (array)    O(n)  time, O(n) array,    O(1) stack
Tabulation (rolling)  O(n)  time, O(1) total space`}</CodeBlock>

        <p>
          That progression is the standard arc of every DP problem: <em>get the recursion right, memoize, tabulate,
          space-optimize.</em>{" "}You don&apos;t have to do all four steps in an interview, but knowing the path means you
          can stop at whatever level the interviewer pushes you toward.
        </p>

        <h3>Memo vs tabulation — when to use which?</h3>

        <Callout variant="info" title="Top-down (memo) vs bottom-up (tab) — pragmatic guidance">
          <p>
            <strong>Start with top-down memoization.</strong>{" "}It&apos;s a tiny edit on top of the naive recursion: you
            already have correct base cases and a correct recurrence; you just add a cache. The hardest part of any DP
            problem is finding the recurrence, and recursion is how most people find it.
          </p>
          <p>
            <strong>Switch to bottom-up tabulation when</strong> (a) you need O(1) space via rolling variables,{" "}
            (b) you&apos;re worried about JVM stack depth, (c) you need maximum speed and want to avoid boxing /
            HashMap overhead, or (d) the iteration order is obvious and natural (dp[i] depends on dp[i-1], so left-to-
            right).
          </p>
          <p>
            <strong>Stay with top-down when</strong> (a) the natural iteration order isn&apos;t obvious (e.g. tree DP,
            grid DP with diagonal dependencies), (b) you only need a few of the subproblems&apos; answers (memo computes
            lazily; tabulation computes everything), or (c) the state space is sparse — a HashMap memo over actual
            visited states is much smaller than a fully allocated table.
          </p>
        </Callout>

        <Quiz
          kind="Tabulation check"
          question="The bottom-up Fibonacci is rewritten with two variables instead of a dp[] array. What's the trade-off?"
          options={[
            { label: "It's faster but uses more memory.", explanation: "It's the same time and uses LESS memory. We dropped the O(n) array in favor of two scalars." },
            { label: "Same O(n) time, but space drops from O(n) to O(1). The trick is that dp[i] only depends on dp[i-1] and dp[i-2], so we never need the rest of the array.", correct: true, explanation: "Right. This 'rolling array' optimization is universal for 1D DPs whose recurrences only look back a constant number of steps. House Robber, Climbing Stairs, and many other linear-state DPs all admit the same O(1)-space rewrite." },
            { label: "We lose the ability to compute fib(k) for k < n.", explanation: "True but irrelevant — the question only asks for fib(n). If we needed all intermediate values, we'd keep the array. The optimization is conditional on what we actually need to return." },
            { label: "It's slower because we do more work per iteration.", explanation: "Per-iteration work is identical: one addition, two assignments. The only thing that changed is which memory we write to." },
          ]}
        />

        <Quiz
          kind="Tabulation check"
          question="Why does bottom-up tabulation often outperform top-down memoization in practice, even though both are O(n) time?"
          options={[
            { label: "Tabulation has a smaller asymptotic complexity.", explanation: "They have the same Big-O. The difference is constant factors and stack usage." },
            { label: "Tabulation has no recursion stack, sequential array access is cache-friendly, and there's no null-check / hash-lookup overhead per cell. All of which are constant-factor wins on top of the same Big-O.", correct: true, explanation: "Right. Recursion costs a stack frame per call (function-call overhead, frame allocation, return-address tracking). HashMap-based memo costs a hash + bucket walk per lookup. Tabulation skips all of it: a tight loop over a primitive array is the fastest thing the CPU runs. Big-O is the same; constants can differ by 5–20×." },
            { label: "Java can't optimize recursion.", explanation: "The JIT inlines and optimizes recursion just fine. The slowdown is structural — stack frames and possibly boxed-Integer / HashMap lookups — not a JIT failure." },
            { label: "Tabulation doesn't compute the base cases.", explanation: "Both versions compute the base cases. The difference is order of computation and how lookups are stored, not what's computed." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · The two DP tells ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="tells" title="I can spot DP problems by the two tells" xp={25}>
      <section>
        <h2 id="tells">Overlapping subproblems + optimal substructure (the two DP tells)</h2>

        <p>
          DP isn&apos;t a technique you should reach for on every recursion. It only works — and only{" "}
          <em>helps</em> — when the problem has two specific structural properties. Learn to spot them, and DP stops
          feeling like a guess.
        </p>

        <h3>Tell #1 — Overlapping subproblems</h3>

        <p>
          A problem has <strong>overlapping subproblems</strong>{" "}if the recursive decomposition revisits the same
          subproblem more than once. Fibonacci is the textbook case: <code>fib(3)</code> shows up in both the{" "}
          <code>fib(5) → fib(4)</code> branch and the <code>fib(5) → fib(3)</code> branch.
        </p>

        <p>
          A problem <strong>without</strong>{" "}overlapping subproblems is one where every recursive call is on disjoint
          input. Merge sort splits an array into the left half and the right half — and those two halves never share
          any element, so they never compute the same subresult. There is nothing to cache. That&apos;s why merge sort
          is divide-and-conquer, not DP.
        </p>

        <Mermaid chart={overlapVsNot} />

        <p>
          The test: <em>if I draw the recursion tree, do I see the same node label appear in multiple branches?</em>{" "}
          If yes, overlap is present. If no, you&apos;re looking at divide-and-conquer, and a cache wouldn&apos;t do
          anything.
        </p>

        <h3>Tell #2 — Optimal substructure</h3>

        <p>
          A problem has <strong>optimal substructure</strong>{" "}if the optimal solution to the whole can be built from
          optimal solutions to its parts. Fibonacci has this trivially: <code>fib(n)</code> equals{" "}
          <code>fib(n-1) + fib(n-2)</code>, where each piece is itself the (one and only) correct answer to its
          subproblem.
        </p>

        <p>
          For optimization problems (where you want the max / min / count), optimal substructure means: the optimal
          answer for size n uses the optimal answer for some smaller size, not a sub-optimal one. House Robber has
          this: the maximum gold from houses <code>0..i</code> is exactly{" "}
          <code>max(maxGold(0..i-1), maxGold(0..i-2) + nums[i])</code>. We aren&apos;t mixing in non-optimal
          sub-answers.
        </p>

        <Callout variant="warn" title="Counter-example: longest simple path in a graph (no optimal substructure)">
          <p>
            Consider &quot;find the longest path between two vertices in an undirected graph that visits no vertex
            twice.&quot; This <em>doesn&apos;t</em>{" "}have optimal substructure: the longest s-t path doesn&apos;t
            decompose into the longest s-v path plus the longest v-t path, because those two paths might share
            vertices, violating the &quot;simple&quot; constraint.
          </p>
          <p>
            That&apos;s why longest simple path is NP-hard while shortest simple path is polynomial. The same problem
            phrased two ways, but only one has optimal substructure. The presence-or-absence of this property is
            usually the dividing line between &quot;DP solves it&quot; and &quot;DP doesn&apos;t.&quot;
          </p>
        </Callout>

        <h3>Both tells together: necessary, not coincidental</h3>

        <p>
          Each tell on its own would be insufficient:
        </p>

        <ul>
          <li><strong>Overlapping without optimal substructure</strong>{" "}means you can cache, but the cached values aren&apos;t the right thing to combine. You&apos;d compute the right subproblem answers but produce a wrong global answer.</li>
          <li><strong>Optimal substructure without overlapping</strong>{" "}means caching is pointless — every subproblem is visited once anyway. This is the divide-and-conquer regime: merge sort, binary search, pow(x, n).</li>
        </ul>

        <p>
          Both together are what makes DP work and worthwhile. Caching saves time (overlap), and combining cached
          subproblem answers gives the right global answer (optimal substructure).
        </p>

        <h3>Classify the problems</h3>

        <ClassifyChallenge
          title="DP, divide-and-conquer, or neither?"
          prompt="For each problem, identify its structure. Reason about overlapping subproblems and optimal substructure."
          buckets={[
            { id: "dp", label: "DP (overlap + optimal substructure)", color: "violet" },
            { id: "dnc", label: "Divide-and-conquer (no overlap)", color: "sky" },
            { id: "neither", label: "Neither — no clean recurrence", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Compute fib(n) — Fibonacci.", answer: "dp", explanation: "Classic overlap (fib(k) appears many times in the tree) plus trivial optimal substructure (fib(n) = fib(n-1) + fib(n-2)). The canonical DP problem." },
            { id: "2", label: "Merge-sort an n-element array.", answer: "dnc", explanation: "Halves are disjoint — left half and right half never share any element, so there's no overlap to cache. Optimal substructure is present (sorting halves and merging produces a sorted whole), but DP has nothing to optimize." },
            { id: "3", label: "Climbing Stairs: count the ways to reach step n with ±1 or ±2 moves.", answer: "dp", explanation: "Same recurrence as Fibonacci. ways(n) = ways(n-1) + ways(n-2). Overlap (the same intermediate ways(k) is asked for from multiple branches) and optimal substructure (the count for n is exactly the sum of counts for n-1 and n-2)." },
            { id: "4", label: "Binary search for a target in a sorted array.", answer: "dnc", explanation: "Halves the input, recurses into one side, no overlap (the discarded side is never re-examined). Pure divide-and-conquer. T(n) = T(n/2) + O(1) → O(log n)." },
            { id: "5", label: "House Robber: maximum gold from a row of houses, no two adjacent.", answer: "dp", explanation: "Overlap (the subproblem 'best robbery from houses 0..i' is reached via multiple decision sequences) plus optimal substructure (max(0..i) = max(max(0..i-1), max(0..i-2) + nums[i]))." },
            { id: "6", label: "Pow(x, n) via halving: pow(x,n) = pow(x,n/2)² (and one extra x if n is odd).", answer: "dnc", explanation: "One recursive call per level, no overlap — pow(x,5) is reached by exactly one path. T(n) = T(n/2) + O(1). Pure D&C; nothing for a cache to do." },
            { id: "7", label: "Longest simple path between two vertices in a general graph.", answer: "neither", explanation: "Optimal substructure fails — the longest s-t simple path can't be decomposed into longest s-v + longest v-t because those subpaths may share vertices, violating the 'simple' constraint. The problem is NP-hard. DP can't help." },
            { id: "8", label: "Shortest path from s to t in a DAG with weighted edges.", answer: "dp", explanation: "Overlap (the same intermediate vertex's shortest distance is asked for from multiple predecessors) and optimal substructure (the shortest s-t path uses the shortest s-v path for some predecessor v of t). Topological-order DP solves it in O(V+E)." },
          ]}
        />

        <Quiz
          kind="Tells check"
          question="Merge sort splits an array into halves and recursively sorts each. Why isn't memoization useful here?"
          options={[
            { label: "Merge sort is too fast for caching to help.", explanation: "Caching usefulness isn't about speed — it's about whether subproblems are revisited. Even fast algorithms benefit from memoization if there's overlap." },
            { label: "The two halves are disjoint subarrays — they never share elements, so the recursive calls never produce overlapping subproblems. A cache would record entries that are never queried again.", correct: true, explanation: "Right. Merge sort is divide-and-conquer, not DP. The lack of overlap is what distinguishes the two paradigms. T(n) = 2T(n/2) + O(n) → O(n log n) is achieved without any caching. By contrast, fib(n) = fib(n-1) + fib(n-2) revisits the same subproblems through both branches, which is exactly what makes a cache useful." },
            { label: "Memoization only works for problems involving integers.", explanation: "Memoization works for any pure function. The key parameter just needs to be hashable / comparable. The reason it doesn't help here is structural (no overlap), not type-related." },
            { label: "The combine step (merge) is too expensive.", explanation: "The merge step doesn't affect whether memoization would help — it affects the total cost of the divide-and-conquer recurrence. Memoization helps only when subproblems repeat, which they don't here." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Climbing Stairs ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="stairs" title="I solved Climbing Stairs three ways" xp={25}>
      <section>
        <h2 id="stairs">Climbing Stairs — same recurrence, new framing</h2>

        <p>
          <strong>LC 70 · Climbing Stairs.</strong>{" "}You&apos;re at the bottom of a staircase with <code>n</code> steps.
          Each move you can climb 1 step or 2 steps. How many distinct ways are there to reach the top?
        </p>

        <p>
          The trap is to start enumerating. <em>1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2 — that&apos;s 5 ways for n=4.</em>{" "}
          You can do this for n=4 and n=5 by hand. By n=10 you&apos;ll lose track. The point of DP is to find the
          recurrence and stop enumerating.
        </p>

        <h3>Step 1 — Define the state</h3>

        <p>
          Let <code>dp[i]</code> = number of distinct ways to reach step <code>i</code>. The answer to the problem is{" "}
          <code>dp[n]</code>.
        </p>

        <h3>Step 2 — Write the recurrence</h3>

        <p>
          Stand at step <code>i</code>. How did you get here? On your last move, you either took a 1-step (so you were
          previously at step <code>i-1</code>) or a 2-step (previously at <code>i-2</code>). Those two paths are
          disjoint — you can&apos;t simultaneously take both — so the count for step <code>i</code> is:
        </p>

        <CodeBlock lang="plain">{`dp[i] = dp[i-1] + dp[i-2]`}</CodeBlock>

        <p>
          That&apos;s the Fibonacci recurrence. Just framed differently. Fibonacci is &quot;sum of previous two
          numbers&quot;; Climbing Stairs is &quot;count of ways to arrive, summed over the two previous arrival
          points.&quot; Same math.
        </p>

        <h3>Step 3 — Base cases</h3>

        <ul>
          <li><code>dp[0] = 1</code> — there&apos;s one way to be at the start: do nothing. (Some treatments use{" "}
          <code>dp[1] = 1</code> and <code>dp[2] = 2</code>; both work as long as the base cases are consistent with
          the recurrence.)</li>
          <li><code>dp[1] = 1</code> — one way to reach step 1: take a single 1-step.</li>
        </ul>

        <Mermaid chart={stairsPaths} />

        <h3>Step 4 — Three implementations</h3>

        <p><strong>Top-down (memoized recursion):</strong></p>

        <CodeBlock lang="java">{`public int climbStairs(int n) {
    Integer[] memo = new Integer[n + 1];
    return climb(n, memo);
}

private int climb(int n, Integer[] memo) {
    if (n <= 1) return 1;                                   // base
    if (memo[n] != null) return memo[n];
    memo[n] = climb(n - 1, memo) + climb(n - 2, memo);
    return memo[n];
}`}</CodeBlock>

        <p><strong>Bottom-up (tabulation):</strong></p>

        <CodeBlock lang="java">{`public int climbStairs(int n) {
    if (n <= 1) return 1;
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`}</CodeBlock>

        <p><strong>O(1)-space rolling:</strong></p>

        <CodeBlock lang="java">{`public int climbStairs(int n) {
    if (n <= 1) return 1;
    int prev2 = 1;          // dp[i-2]
    int prev1 = 1;          // dp[i-1]
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`}</CodeBlock>

        <p>
          All three are correct. All three return the same answer. The first lets you reason about the recurrence
          using your existing recursion intuition. The second eliminates the stack and the cache-miss overhead. The
          third uses constant space. Pick the one that fits the constraints.
        </p>

        <Callout variant="insight" title="The DP recipe, applied">
          <p>
            We just executed the same four-step recipe we&apos;ll use on every DP problem from now on: <strong>(1)
            define the state, (2) write the recurrence, (3) pin the base cases, (4) choose an order of computation.</strong>
          </p>
          <p>
            The hardest of the four is almost always step 2 — finding the recurrence. Once you have it, the rest is
            mechanical. The way we found this one — &quot;stand at the destination, ask how you got here, and the
            recurrence falls out of the answer&quot; — is the move that works on more 1D DP problems than any other.
          </p>
        </Callout>

        <h3>What &quot;looks like Climbing Stairs&quot;?</h3>

        <p>
          The Climbing-Stairs / Fibonacci shape — &quot;count or compute the value at index <code>n</code>, where it
          depends on the answers at a constant number of earlier indices&quot; — is one of the most common 1D DP
          patterns. Here are some that rhyme with it:
        </p>

        <ClassifyChallenge
          title="Same shape as Climbing Stairs?"
          prompt="Each problem is described informally. Decide whether its DP recurrence has the Climbing-Stairs / Fibonacci shape (dp[i] depends on a constant number of recent dp[i-k] values, base cases = small constants)."
          buckets={[
            { id: "yes", label: "Yes — same shape", color: "emerald" },
            { id: "no", label: "No — different shape", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Number of ways to tile a 2×n grid using 2×1 dominoes.", answer: "yes", explanation: "Same recurrence: dp[n] = dp[n-1] + dp[n-2]. The first column is either covered by one vertical domino (leaving a 2×(n-1) grid) or by two horizontal dominoes stacked (leaving 2×(n-2)). Fibonacci in disguise." },
            { id: "2", label: "Number of distinct ways to reach step n if you can take 1, 2, or 3 steps at a time.", answer: "yes", explanation: "Same shape, just three terms: dp[n] = dp[n-1] + dp[n-2] + dp[n-3]. Constant lookback, base cases set explicitly." },
            { id: "3", label: "Number of ways to make change for amount k with coins {1, 5, 10, 25}.", answer: "no", explanation: "This is also a 1D DP, but the recurrence is over coin denominations, not step indices, and it requires double iteration (over coins × amounts) to avoid double-counting permutations. Different shape — covered in Module 33 (1D DP patterns)." },
            { id: "4", label: "Maximum sum of a contiguous subarray (Kadane's algorithm).", answer: "yes", explanation: "dp[i] = max(nums[i], dp[i-1] + nums[i]) — depends on a constant lookback (one step), constant work per cell. Linear scan with a single previous value, very much in the Climbing-Stairs family." },
            { id: "5", label: "House Robber: maximum non-adjacent sum.", answer: "yes", explanation: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — constant lookback, constant work per cell. The recurrence isn't a sum (it's a max), but the shape — index-by-index, two-step lookback — is identical." },
            { id: "6", label: "Edit distance between two strings.", answer: "no", explanation: "Two-dimensional DP — state is (i, j) for prefixes of both strings, recurrence depends on dp[i-1][j-1], dp[i-1][j], dp[i][j-1]. Different shape entirely; needs a 2D table. Module 34 (2D DP)." },
            { id: "7", label: "Decode a numeric string into letters (LC 91 Decode Ways).", answer: "yes", explanation: "dp[i] = ways to decode prefix of length i = (decode last 1 char if valid) + (decode last 2 chars if valid). Same constant-lookback shape, with conditional contributions based on character validity." },
            { id: "8", label: "Longest increasing subsequence.", answer: "no", explanation: "dp[i] = longest LIS ending at index i, computed via dp[i] = 1 + max(dp[j] for j < i with nums[j] < nums[i]). The lookback isn't a constant number of steps — it scans ALL earlier indices. O(n²) shape, not the Climbing-Stairs O(n) shape." },
          ]}
        />

        <Quiz
          kind="Climbing Stairs check"
          question="In the Climbing Stairs DP, why is dp[i] = dp[i-1] + dp[i-2] correct?"
          options={[
            { label: "Because Fibonacci is a famous problem and we should reuse its formula.", explanation: "We don't reach for the formula because it's famous — we derive it from the problem. The fact that it matches Fibonacci is a consequence, not a starting assumption." },
            { label: "Because the last move into step i is either a 1-step (from step i-1) or a 2-step (from step i-2). The two cases are disjoint, so the total count is the sum.", correct: true, explanation: "Right. Decompose by the LAST decision. Either you arrived from i-1 (and the number of ways to get to i-1 carries over) or from i-2 (and likewise). The 'or' becomes a sum because the cases don't overlap (you can't simultaneously take a 1-step AND a 2-step on your last move). This 'last-decision decomposition' is the universal trick for finding 1D DP recurrences." },
            { label: "Because dp[0]=1 and dp[1]=1 are the base cases.", explanation: "Base cases anchor the recurrence; they don't justify it. The recurrence's correctness comes from the case analysis on the last move." },
            { label: "Because we always take the larger of the two preceding values.", explanation: "We sum them, not max them. The problem is counting distinct paths, not picking the best one." },
          ]}
        />

        <Quiz
          kind="Climbing Stairs check"
          question="The O(1)-space version of Climbing Stairs uses just `prev1` and `prev2`. What enables this optimization?"
          options={[
            { label: "Java's JIT optimizes arrays into scalars when it can.", explanation: "The JIT can do a lot, but it doesn't decide for you that you only need the last two entries. The decision and the rewrite are at the algorithm level." },
            { label: "The recurrence dp[i] = dp[i-1] + dp[i-2] only references the last two entries; it never looks further back. So we can throw away the rest of the array.", correct: true, explanation: "Right. The recurrence's lookback is bounded by 2, so a sliding window of size 2 (two scalars) is sufficient. Whenever a 1D DP's recurrence has constant lookback, you can apply this optimization. House Robber, Climbing Stairs, Fibonacci, and 2×n tiling all admit O(1) space for the same reason." },
            { label: "Because we don't need the final answer.", explanation: "We do need the final answer — that's `prev1` after the loop. The optimization is about discarding intermediate values once they're no longer referenced, not about discarding the answer." },
            { label: "Because n is small.", explanation: "n could be up to 45 in the LeetCode constraints; the optimization isn't conditional on n's size. It's conditional on the recurrence's lookback being constant." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · House Robber ───────────────── */}
      <Checkpoint moduleSlug="dp-intro" id="robber" title="I solved House Robber and can state the DP recipe" xp={30}>
      <section>
        <h2 id="robber">House Robber — when the recurrence isn&apos;t a sum</h2>

        <p>
          <strong>LC 198 · House Robber.</strong>{" "}You&apos;re a thief planning to rob houses along a street. Each
          house has a non-negative amount of gold inside. The catch: if you rob two adjacent houses, an alarm goes
          off. Given <code>nums[]</code>, find the maximum gold you can rob without triggering an alarm.
        </p>

        <p>
          This is the next step up from Climbing Stairs. The state and the lookback structure are the same — 1D, with
          dependencies on the last two entries — but the recurrence is a <code>max</code> instead of a sum. That
          single change unlocks the entire family of optimization DPs.
        </p>

        <h3>Step 1 — Define the state</h3>

        <p>
          Let <code>dp[i]</code> = the maximum gold you can rob from houses <code>0..i</code> inclusive (considering
          all valid subsets). The answer to the problem is <code>dp[n-1]</code>.
        </p>

        <h3>Step 2 — Write the recurrence</h3>

        <p>
          Stand at house <code>i</code> and ask: what&apos;s my best option? You have exactly two choices:
        </p>

        <ul>
          <li><strong>Skip house <code>i</code>.</strong>{" "}Then your best from <code>0..i</code> is just your best from
          <code>0..i-1</code>. That&apos;s <code>dp[i-1]</code>.</li>
          <li><strong>Rob house <code>i</code>.</strong>{" "}You pick up <code>nums[i]</code> gold. But you can&apos;t have
          robbed house <code>i-1</code> (that&apos;s the adjacency constraint), so the rest of your loot must come from
          houses <code>0..i-2</code>: <code>dp[i-2] + nums[i]</code>.</li>
        </ul>

        <p>
          Take the better of the two. That gives:
        </p>

        <CodeBlock lang="plain">{`dp[i] = max(dp[i-1], dp[i-2] + nums[i])`}</CodeBlock>

        <Mermaid chart={robberDecision} />

        <h3>Step 3 — Base cases</h3>

        <ul>
          <li><code>dp[0] = nums[0]</code> — only one house; rob it.</li>
          <li><code>dp[1] = max(nums[0], nums[1])</code> — two houses, can&apos;t rob both, so take the bigger one.</li>
        </ul>

        <h3>Step 4 — Implement</h3>

        <p><strong>Tabulation:</strong></p>

        <CodeBlock lang="java">{`public int rob(int[] nums) {
    int n = nums.length;
    if (n == 0) return 0;
    if (n == 1) return nums[0];
    int[] dp = new int[n];
    dp[0] = nums[0];
    dp[1] = Math.max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) {
        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    }
    return dp[n - 1];
}`}</CodeBlock>

        <p><strong>O(1) space (rolling):</strong></p>

        <CodeBlock lang="java">{`public int rob(int[] nums) {
    int prev2 = 0;          // dp[i-2], "best up to house i-2"
    int prev1 = 0;          // dp[i-1], "best up to house i-1"
    for (int x : nums) {
        int curr = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`}</CodeBlock>

        <p>
          The rolling version cleanly handles all edge cases (n=0, n=1) without special-casing — the loop just
          doesn&apos;t execute, or executes once, and the answer falls out of the invariants. This is one of those
          satisfying moments where a careful state definition makes the code shorter than the spec.
        </p>

        <Callout variant="insight" title="Why 'either skip or take' is the universal optimization-DP frame">
          <p>
            The decomposition we just did — &quot;at index <code>i</code>, the optimal answer is the better of
            (skip <code>i</code>) and (take <code>i</code>)&quot; — is the single most important framing in DP. It
            shows up in almost every 1D and 2D optimization DP:
          </p>
          <ul>
            <li><strong>0/1 Knapsack:</strong>{" "}at item <code>i</code>, max value = max(skip <code>i</code>, take{" "}
            <code>i</code> if it fits). Same shape; the &quot;take&quot; case has a capacity constraint.</li>
            <li><strong>Longest Common Subsequence:</strong>{" "}at <code>(i, j)</code>, length = match (use both chars,
            recurse on prefixes) or skip one of the two strings.</li>
            <li><strong>Coin Change:</strong>{" "}at amount <code>k</code>, fewest coins = min over each coin{" "}
            <code>c</code> of <code>1 + dp[k - c]</code>.</li>
            <li><strong>Jump Game II:</strong>{" "}at index <code>i</code>, fewest jumps = 1 + min over reachable next
            indices.</li>
          </ul>
          <p>
            Different specifics, same skeleton: <em>enumerate the local decisions, recurse on the resulting state,
            optimize across the choices.</em>
          </p>
        </Callout>

        <h3>What about House Robber II (LC 213)?</h3>

        <p>
          The follow-up problem rearranges the houses into a circle: house 0 and house n-1 are now adjacent. Suddenly
          the recurrence breaks — you can&apos;t naively run the same DP because the constraint links the two ends.
        </p>

        <p>
          The trick: solve the linear version twice. Once on <code>nums[0..n-2]</code> (allowing the first house but
          forbidding the last), once on <code>nums[1..n-1]</code> (forbidding the first, allowing the last). The
          answer is the max of the two. Both subproblems are linear and avoid the circular conflict by construction.
          ~5 lines of glue code on top of the linear House Robber. We mention it so the connection is obvious; you can
          solve it as a stretch exercise.
        </p>

        <h3>The DP recipe — locked in</h3>

        <Callout variant="info" title="The four-step recipe, summarized">
          <p>
            <strong>1. Define the state.</strong>{" "}What does <code>dp[...]</code> mean? Be precise — &quot;dp[i] = max
            gold from houses 0..i inclusive&quot; or &quot;dp[i] = number of distinct ways to reach step i.&quot;
            Vagueness here corrupts every later step.
          </p>
          <p>
            <strong>2. Write the recurrence.</strong>{" "}How does <code>dp[i]</code> relate to{" "}
            <code>dp[smaller indices]</code>? The standard move is to decompose by the last decision: at index{" "}
            <code>i</code>, what choices lead here, and what does each choice cost / contribute?
          </p>
          <p>
            <strong>3. Pin the base cases.</strong>{" "}What are the values where the recurrence doesn&apos;t apply? Make
            sure they&apos;re consistent with the recurrence — running the recurrence on the smallest non-base index
            should produce the right answer.
          </p>
          <p>
            <strong>4. Choose an order of computation.</strong>{" "}Top-down memoization (recursion + cache) or bottom-up
            tabulation (iterative fill)? For 1D constant-lookback DPs, also consider the O(1) rolling rewrite once the
            tabulation is correct.
          </p>
        </Callout>

        <Quiz
          kind="House Robber check"
          question="In House Robber, why is the recurrence dp[i] = max(dp[i-1], dp[i-2] + nums[i]) rather than dp[i] = max(dp[i-1] + nums[i], dp[i-2] + nums[i])?"
          options={[
            { label: "It's a typo in the standard solution; both are equivalent.", explanation: "They're not equivalent. The first form is correct; the second double-counts and ignores the adjacency constraint." },
            { label: "The 'skip' branch must NOT add nums[i] — if we skip house i, we don't get its gold. The 'take' branch must use dp[i-2] (not dp[i-1]) because robbing both i and i-1 would violate the adjacency constraint.", correct: true, explanation: "Right. The two branches encode the two cases: skip i (gold contribution = 0, prior best = dp[i-1]) or take i (gold = nums[i], prior best must come from 0..i-2 to avoid adjacency). Mixing up which branch adds nums[i] or which prior dp to use is the most common bug on this problem. Read the recurrence aloud as 'either I skip this house, in which case my best is whatever I had at i-1; or I take it, in which case I get nums[i] plus whatever I had at i-2.'" },
            { label: "Because nums is always positive.", explanation: "The non-negativity of nums is given by the problem constraints, but it doesn't change which dp index goes with which branch. The structure of the recurrence comes from the adjacency constraint." },
            { label: "Because dp[i-1] and dp[i-2] are equal.", explanation: "They're not equal in general. dp[i-1] ≥ dp[i-2] always (the optimal up to i-1 includes the option of stopping at i-2), but they're not the same value." },
          ]}
        />

        <Quiz
          kind="House Robber check"
          question="The O(1)-space rolling version of House Robber initializes prev2 = 0 and prev1 = 0. After processing the first element x, what's curr?"
          options={[
            { label: "0 — the loop doesn't update anything on the first pass.", explanation: "The loop body always runs; let's compute. curr = max(prev1, prev2 + x) = max(0, 0 + x) = x. So curr = x, not 0." },
            { label: "x — because curr = max(prev1, prev2 + x) = max(0, 0 + x) = x. After the first pass, prev1 = x, which correctly represents the answer for a 1-element array.", correct: true, explanation: "Right. The cleverness of starting prev2 = prev1 = 0 is that it makes the loop body the entire algorithm — no special case for the first or second element. After one iteration, prev1 = max gold for a 1-house input. After two, prev1 = max(nums[0], nums[1]). And the recurrence proceeds correctly from there." },
            { label: "nums.length × x.", explanation: "There's no factor of nums.length in the recurrence. Per-iteration work is constant." },
            { label: "It depends on whether x is positive.", explanation: "x is non-negative by problem constraints, and the max of 0 and a non-negative number is just x. No conditional needed." },
          ]}
        />

        <PartRecap
          title="The DP intuition is yours now"
          gist="DP is recursion plus a cache. The two tells (overlap + optimal substructure) say when it applies; the four-step recipe (state, recurrence, base, order) says how to apply it. Climbing Stairs and House Robber are the two shapes you'll see again and again."
          points={[
            { takeaway: "Naive recursion on a problem with overlapping subproblems is exponential. Memoization makes it linear in the number of distinct subproblems.", detail: "fib(n) goes from O(2ⁿ) to O(n) with a 4-line edit (memo array + cache check + cache store). The recursion tree collapses into a DAG of n+1 unique nodes." },
            { takeaway: "Tabulation rewrites top-down memoization as bottom-up iteration. Same recurrence, same answers, different control flow.", detail: "Fill dp[] from base cases up, in an order that respects dependencies (left-to-right for 1D linear DPs). Eliminates the recursion stack, gets cache-friendly memory access, and sets up the rolling-array space optimization." },
            { takeaway: "Constant-lookback 1D DPs admit O(1) space via two scalars.", detail: "If dp[i] depends only on dp[i-1] and dp[i-2], you can throw away the array and keep two variables. Climbing Stairs, House Robber, Fibonacci, 2×n tiling all use this trick." },
            { takeaway: "The two tells: overlapping subproblems + optimal substructure.", detail: "Without overlap, caching is pointless (divide-and-conquer regime). Without optimal substructure, the cache stores the wrong answers (longest simple path is the famous counter-example). DP is exactly the regime where both hold." },
            { takeaway: "The DP recipe: state, recurrence, base cases, order of computation.", detail: "State: what does dp[i] mean? Recurrence: how does dp[i] depend on smaller dp's? Base: where does the recursion ground out? Order: top-down (memo) or bottom-up (tab)? Most of the difficulty in any DP problem is finding the recurrence — the rest is mechanical." },
            { takeaway: "Climbing Stairs and House Robber are templates, not just problems.", detail: "Climbing Stairs is the count-the-paths shape (sums of previous dp's). House Robber is the optimization shape (max/min over previous dp's plus a local contribution). Together they cover most of the 1D DP world. Module 33 generalizes both." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Forward link ───────────────── */}
      <div className="not-prose mt-12 rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <p className="text-xs font-semibold tracking-wider text-fuchsia-700 uppercase dark:text-fuchsia-300">Up next · Module 33</p>
        <Link
          href="/courses/dsa/modules/dp-1d"
          className="mt-2 block text-2xl font-bold text-slate-900 no-underline transition hover:text-fuchsia-700 dark:text-slate-100 dark:hover:text-fuchsia-300"
        >
          1D DP patterns →
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Linear-state DP with the &quot;decision at index i&quot; template. Coin Change, Word Break, Longest Increasing
          Subsequence, Decode Ways. The same four-step recipe, applied until it&apos;s reflex.
        </p>
      </div>
        <ModuleNav courseId="dsa" currentSlug="dp-intro" />
    </article>
  );
}
