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

const CHECKPOINTS = [
  { id: "beyond-linear", title: "Beyond linear state — three new DP families" },
  { id: "interval", title: "Interval DP — Burst Balloons" },
  { id: "tree", title: "Tree DP — House Robber III" },
  { id: "bitmask-basics", title: "Bitmask DP — encoding subsets as ints" },
  { id: "bitmask-apps", title: "Bitmask DP — Partition, bitsets, and TSP" },
  { id: "shape", title: "Choosing the right DP shape" },
];

export default function DpAdvancedModule() {
  const mod = getModuleBySlug("dp-advanced")!;

  // Burst Balloons: the "last to burst" picture for an interval [i, j]
  const burstLast = `
flowchart TB
    subgraph PRE["Interval (i, j) — boundaries fixed, balloons strictly between are still up"]
        direction LR
        Bi["nums[i]<br/>boundary"] --- B1["..."] --- B2["k"] --- B3["..."] --- Bj["nums[j]<br/>boundary"]
    end
    PRE -->|"choose k as the LAST balloon to pop in (i,j)"| MID
    subgraph MID["Just before k pops, only nums[i], k, nums[j] are left"]
        direction LR
        Mi["nums[i]"] --- Mk["nums[k]"] --- Mj["nums[j]"]
    end
    MID -->|"coins from k = nums[i] * nums[k] * nums[j]"| GAIN["+ nums[i]·nums[k]·nums[j]"]
    PRE -->|"sub-intervals are independent"| L["dp[i][k]<br/>(i, k) inside"]
    PRE --> R["dp[k][j]<br/>(k, j) inside"]
    L --> SUM["dp[i][j] = max over k in (i, j) of<br/>dp[i][k] + dp[k][j] + nums[i]·nums[k]·nums[j]"]
    R --> SUM
    GAIN --> SUM
    style PRE fill:#1e293b,color:#fff,stroke:#475569
    style MID fill:#312e81,color:#fff,stroke:#4338ca
    style SUM fill:#10b981,color:#fff,stroke:#047857
    style GAIN fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  // Tree DP: post-order pair-return for House Robber III
  const treeDp = `
flowchart TB
    R["root<br/>val = 3"] --> L["left<br/>val = 4"]
    R --> RR["right<br/>val = 5"]
    L --> LL["leaf<br/>val = 1"]
    L --> LR["leaf<br/>val = 3"]
    RR --> RRR["leaf<br/>val = 1"]
    LL -->|"{rob:1, skip:0}"| L
    LR -->|"{rob:3, skip:0}"| L
    RRR -->|"{rob:1, skip:0}"| RR
    L -->|"{rob: 4 + 0 + 0 = 4,<br/>skip: max(1,0)+max(3,0) = 4}"| R
    RR -->|"{rob: 5 + 0 = 5,<br/>skip: max(1,0) = 1}"| R
    R -->|"{rob: 3 + 4 + 1 = 8,<br/>skip: max(4,4)+max(5,1) = 9}<br/>answer = max(8, 9) = 9"| OUT["9"]
    style R fill:#1e293b,color:#fff,stroke:#475569
    style OUT fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Bitmask: subset of {0,1,2,3} encoded as 4 bits
  const bitmaskShape = `
flowchart LR
    subgraph IDX["Items: 0, 1, 2, 3"]
        direction LR
        I0["0"] --- I1["1"] --- I2["2"] --- I3["3"]
    end
    IDX -->|"membership of each item is one bit"| MASK
    subgraph MASK["mask is a 4-bit int"]
        direction LR
        B3["bit 3<br/>(item 3)"] --- B2["bit 2<br/>(item 2)"] --- B1["bit 1<br/>(item 1)"] --- B0["bit 0<br/>(item 0)"]
    end
    MASK -->|"e.g. 0b1011 = 11"| EX["{0, 1, 3}"]
    MASK -->|"e.g. 0b0000 = 0"| EX2["{} (empty)"]
    MASK -->|"e.g. 0b1111 = 15"| EX3["{0, 1, 2, 3} (full)"]
    style IDX fill:#1e293b,color:#fff,stroke:#475569
    style MASK fill:#312e81,color:#fff,stroke:#4338ca
    style EX fill:#10b981,color:#fff,stroke:#047857
    style EX2 fill:#34d399,color:#000,stroke:#059669
    style EX3 fill:#34d399,color:#000,stroke:#059669
  `.trim();

  // Decision tree for picking the right DP shape
  const dpDecision = `
flowchart TD
    Q["What does the state need to remember?"] --> Q1{"a single position<br/>or running prefix?"}
    Q1 -->|"yes"| ONED["1D DP<br/>dp[i]<br/>(House Robber, Climbing Stairs, LIS)"]
    Q1 -->|"no"| Q2{"two positions,<br/>two strings, or a capacity?"}
    Q2 -->|"yes"| TWOD["2D DP<br/>dp[i][j]<br/>(LCS, Edit Distance, Knapsack)"]
    Q2 -->|"no"| Q3{"a contiguous range [i, j]<br/>where order of choices matters?"}
    Q3 -->|"yes"| INT["Interval DP<br/>dp[i][j]<br/>(Burst Balloons, MCM, Palindrome Partitioning)"]
    Q3 -->|"no"| Q4{"rooted at a node<br/>in a tree?"}
    Q4 -->|"yes"| TREE["Tree DP<br/>post-order pair return<br/>(House Robber III, Diameter, Subtree counts)"]
    Q4 -->|"no"| Q5{"a subset of a small<br/>universe (n ≤ ~20)?"}
    Q5 -->|"yes"| BIT["Bitmask DP<br/>dp[mask] or dp[mask][i]<br/>(TSP, Partition, Assignment)"]
    Q5 -->|"no"| ESC["Probably need a custom state.<br/>Re-read the problem; sketch the recursion."]
    style Q fill:#1e293b,color:#fff,stroke:#475569
    style ONED fill:#0e7490,color:#fff,stroke:#155e75
    style TWOD fill:#0891b2,color:#fff,stroke:#0e7490
    style INT fill:#a21caf,color:#fff,stroke:#86198f
    style TREE fill:#be185d,color:#fff,stroke:#9d174d
    style BIT fill:#c026d3,color:#fff,stroke:#a21caf
    style ESC fill:#374151,color:#fff,stroke:#1f2937
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="dp-advanced" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 7 · Module 29 · Closeout
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · ends with Phase 7 wrap-up</p>
      </div>

      {/* ───────────────── Part 1 · Beyond linear state ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="beyond-linear" title="I see why some problems need a richer state than dp[i] or dp[i][j]" xp={20}>
      <section>
        <h2 id="beyond-linear">Beyond linear state — three new DP families</h2>

        <p>
          By the end of the previous three modules, you can write a 1D or 2D DP almost reflexively. The state was always
          some flavor of <em>position</em>: <code>dp[i]</code> for &quot;decision at index i,&quot;{" "}
          <code>dp[i][j]</code> for &quot;two positions, two strings, or capacity j with i items considered.&quot; Most
          DP problems on the easy and medium pile fit one of those shapes — and most of the famous ones (Coin Change,
          Edit Distance, Knapsack) are just disciplined applications of the templates.
        </p>

        <p>
          Then you hit a problem like &quot;burst the balloons in some order to maximize coins,&quot; or &quot;rob
          houses arranged in a binary tree,&quot; or &quot;assign N tasks to N machines.&quot; The 1D/2D templates
          produce nonsense — there&apos;s no obvious left-to-right order to fix, no two prefixes to compare, no
          capacity number to track. The state needs to capture something different: a <em>range</em>, a{" "}
          <em>subtree</em>, or a <em>subset</em>.
        </p>

        <Callout variant="insight" title="The central question of DP — and why state design is the whole game">
          <p>
            Every DP problem, simple or hard, hinges on one question: <strong>what does the state need to capture so
            that the answer for one state depends only on smaller states?</strong> Once the state is right, the
            recurrence almost writes itself — the transition is just &quot;try every choice from this state, recurse
            on the resulting smaller states, combine.&quot; The hard part of advanced DP isn&apos;t the recurrence; it&apos;s
            picking a state that makes the recurrence well-defined.
          </p>
        </Callout>

        <h3>The three families in this module</h3>

        <p>
          Three new state shapes round out your DP toolkit. Each one is built around a different kind of structure
          you&apos;ll see in problem statements:
        </p>

        <ul>
          <li>
            <strong>Interval DP</strong> — state is a range <code>[i, j]</code> of an array. Used when the problem
            decomposes by &quot;split this range into two parts at some k.&quot; Burst Balloons, Matrix Chain
            Multiplication, Palindrome Partitioning II, Strange Printer.
          </li>
          <li>
            <strong>Tree DP</strong> — state is &quot;the answer for the subtree rooted at this node.&quot; The
            recurrence runs in post-order: children answer first, parent combines. House Robber III, Diameter of a
            Binary Tree, Maximum Path Sum, counting subtrees with a property.
          </li>
          <li>
            <strong>Bitmask DP</strong> — state is a subset of a small universe (n ≤ ~20), encoded as the bits of an
            int. Used when &quot;which subset have I covered so far?&quot; is what the recurrence needs. Travelling
            Salesman, Partition to K Equal Sum Subsets, Smallest Sufficient Team, Assignment problems.
          </li>
        </ul>

        <p>
          These aren&apos;t new <em>algorithms</em>; they&apos;re the same memoize-or-tabulate machinery you already
          know. The skill is recognizing which state to reach for from the shape of the input — and that&apos;s what
          this module drills.
        </p>

        <Callout variant="info" title="Notation: range, subtree, subset">
          <p>
            Each family has a notation that clicks once you see it: <code>dp[i][j]</code> &quot;over the range [i,
            j],&quot; <code>dp(node)</code> &quot;over the subtree rooted at node&quot; (often returning a small
            tuple), and <code>dp[mask]</code> &quot;over the subset described by mask.&quot; When you spot one of
            these in a problem, you have your starting point — even before you know the recurrence.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="A problem says: 'Given an array nums, repeatedly merge two adjacent piles into a new pile whose size is their sum, paying that sum each time. Find the minimum total cost to merge into one pile.' Which DP shape does this most naturally fit?"
          options={[
            { label: "1D DP — dp[i] = min cost up to index i.", explanation: "1D won't work because the merge order matters. After you merge piles 1 and 2 into one pile, the cost of merging it with pile 3 depends on (size1 + size2), which a 1D state can't capture in general." },
            { label: "Interval DP — dp[i][j] = min cost to merge piles i..j into one.", correct: true, explanation: "Right. The state is the contiguous range [i, j]. The recurrence splits at some k: dp[i][j] = min over k of (dp[i][k] + dp[k+1][j] + sum(i..j)). The 'sum(i..j)' part is paid because the final merge unites the two sub-piles. Classic interval DP — same shape as Burst Balloons and Matrix Chain Multiplication." },
            { label: "Tree DP — answer for each subtree.", explanation: "There's no tree structure in the input. You'd be inventing one." },
            { label: "Bitmask DP — encode which piles are merged so far.", explanation: "n could be 1000+ for this problem; bitmask DP only works for n ≤ ~20. The contiguous-range structure also makes interval DP the natural fit." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="What's the single most important property that a DP state must have?"
          options={[
            { label: "It must be small enough to fit in memory.", explanation: "Important practically, but not the defining property. A state can be enormous and still be a correct DP — TSP's state space is n·2^n, which is huge by everyday standards." },
            { label: "It must capture enough information that the answer for one state depends only on the answers for strictly smaller states.", correct: true, explanation: "Right. This is the optimal-substructure / Markov property — the same idea you've seen since the DP intro. Get this right and the recurrence falls out. Get it wrong (e.g., forgetting that order matters in Burst Balloons) and you'll write a recurrence that double-counts or undercounts." },
            { label: "It must always be a single integer.", explanation: "Tree DP often uses pairs/tuples per node. Bitmask DP uses an integer treated as a set. Interval DP uses two integers. The shape is whatever the problem demands." },
            { label: "It must include the entire input.", explanation: "That's brute-force memoization, not DP. The whole point of DP is that the state is a small summary of the relevant history." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Interval DP ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="interval" title="I can solve Burst Balloons by iterating over the last balloon to pop" xp={25}>
      <section>
        <h2 id="interval">Interval DP — Burst Balloons (LC 312)</h2>

        <p>
          The setup: an array <code>nums</code> of balloon values. Bursting balloon <code>k</code> earns you{" "}
          <code>nums[k-1] * nums[k] * nums[k+1]</code> coins, where <code>nums[-1]</code> and{" "}
          <code>nums[n]</code> are treated as <code>1</code>. After bursting, that balloon is gone and its left and
          right neighbors become adjacent. Burst all balloons in some order — maximize total coins.
        </p>

        <p>
          The natural-but-wrong idea: try the obvious 1D DP &quot;which balloon to pop first?&quot; The problem is
          that once you pop a balloon, the neighbors of every other balloon may have changed — so &quot;the value of
          subproblem after popping k&quot; depends on which balloons are still up, which is not a small state. You
          need to think about this differently.
        </p>

        <h3>The trick — iterate over the LAST balloon to burst</h3>

        <p>
          Add sentinel <code>1</code>s at both ends so we don&apos;t have to special-case the boundary. Now define{" "}
          <code>dp[i][j]</code> = the maximum coins you can earn from bursting all balloons strictly between{" "}
          <code>i</code> and <code>j</code>, treating <code>nums[i]</code> and <code>nums[j]</code> as the (still
          standing) boundary balloons.
        </p>

        <p>
          The clever move is to iterate over which balloon <code>k</code> is the <strong>last</strong> one to burst
          inside the open interval <code>(i, j)</code>. When <code>k</code> is the last one inside that interval, by
          definition every other balloon between <code>i</code> and <code>j</code> is already gone. So just before{" "}
          <code>k</code> pops, its only neighbors are <code>nums[i]</code> and <code>nums[j]</code> — the boundaries.
          That is the key property that makes the state well-defined.
        </p>

        <Mermaid chart={burstLast} />

        <p>The recurrence:</p>

        <CodeBlock lang="plain">{`dp[i][j] = max over k in (i, j) of:
             dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j]

base case: dp[i][j] = 0 when j - i < 2  (no balloons strictly between)
final answer: dp[0][n+1] after padding nums with sentinel 1's at both ends`}</CodeBlock>

        <Callout variant="insight" title="Why 'last to burst' beats 'first to burst'">
          <p>
            If you tried to iterate over which balloon is the <em>first</em> to burst in (i, j), the two
            sub-intervals you create afterward (the left and right halves) wouldn&apos;t be independent — their
            boundary balloons are missing or changed, depending on what burst between them. By picking the LAST one
            to pop, the boundary of each sub-interval is fixed (it&apos;s <code>nums[i]</code> and{" "}
            <code>nums[k]</code> on the left, <code>nums[k]</code> and <code>nums[j]</code> on the right), so each
            half is a clean smaller subproblem. This &quot;reverse the time arrow&quot; trick is a recurring move in
            interval DP.
          </p>
        </Callout>

        <h3>Java implementation</h3>

        <CodeBlock lang="java">{`public int maxCoins(int[] nums) {
    int n = nums.length;
    int[] padded = new int[n + 2];
    padded[0] = 1;
    padded[n + 1] = 1;
    for (int i = 0; i < n; i++) padded[i + 1] = nums[i];

    int N = padded.length;
    int[][] dp = new int[N][N];

    // Iterate by interval length (j - i), smallest first.
    // 'len' is the gap between the boundary indices i and j.
    for (int len = 2; len < N; len++) {
        for (int i = 0; i + len < N; i++) {
            int j = i + len;
            // k is the LAST balloon to burst strictly between i and j.
            int best = 0;
            for (int k = i + 1; k < j; k++) {
                int gain = padded[i] * padded[k] * padded[j]
                         + dp[i][k] + dp[k][j];
                if (gain > best) best = gain;
            }
            dp[i][j] = best;
        }
    }

    return dp[0][N - 1];
}`}</CodeBlock>

        <Callout variant="warn" title="Iteration order: by interval length, NOT row-major">
          <p>
            The classic mistake: iterate <code>i</code> from <code>0..N-1</code> and <code>j</code> from{" "}
            <code>i+1..N-1</code>. With that order, when you compute <code>dp[i][j]</code> you may read{" "}
            <code>dp[k][j]</code> for some <code>k &gt; i</code> — that cell lives in a row we haven&apos;t
            reached yet (we&apos;re still on row <code>i</code>), so it hasn&apos;t been filled. Always iterate
            interval DP by the length of the interval, smallest first — that guarantees every shorter sub-interval
            is computed before any longer one that depends on it. Same rule applies to Matrix Chain Multiplication,
            Strange Printer, and every other interval DP you&apos;ll meet.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li>States: <code>O(n²)</code> — one per pair <code>(i, j)</code>.</li>
          <li>Transition: <code>O(n)</code> — try every <code>k</code> inside.</li>
          <li>Total time: <strong>O(n³)</strong>. Total space: <strong>O(n²)</strong>.</li>
        </ul>

        <p>
          For <code>n = 500</code> (LC&apos;s upper bound), that&apos;s 1.25 × 10⁸ operations — comfortably under a
          second in Java. Tight, but it passes.
        </p>

        <h3>Other interval DP problems, in one line each</h3>

        <ul>
          <li>
            <strong>Matrix Chain Multiplication</strong> — split <code>(A_i ... A_j)</code> at some <code>k</code>;
            recurrence pays <code>r_i · c_k · c_j</code>. Same O(n³) shape.
          </li>
          <li>
            <strong>Palindrome Partitioning II (LC 132)</strong> — minimum cuts to split into palindromes.{" "}
            <code>dp[i][j]</code> tracks &quot;is s[i..j] a palindrome,&quot; then a 1D DP finishes the cut count.
          </li>
          <li>
            <strong>Strange Printer (LC 664)</strong> — minimum print runs of one character at a time.{" "}
            <code>dp[i][j]</code> = min print runs for <code>s[i..j]</code>; split at the first index that matches{" "}
            <code>s[i]</code>.
          </li>
          <li>
            <strong>Stone Game VII / Merge Stones</strong> — both follow the &quot;split a range at k&quot; pattern.
          </li>
        </ul>

        <Quiz
          kind="Operation check"
          question="In the Burst Balloons recurrence, why is the 'gain' term `nums[i] * nums[k] * nums[j]` — using the BOUNDARY values — instead of `nums[k-1] * nums[k] * nums[k+1]` from the original problem?"
          options={[
            { label: "It's a typo; you should use the original neighbors.", explanation: "Not a typo. Using the original neighbors would be wrong — by the time k pops in the (i, j) interval, its actual neighbors are nums[i] and nums[j], not the original k-1 and k+1." },
            { label: "Because dp[i][j] assumes k is the LAST balloon to burst inside (i, j), so when k pops, the only balloons still up next to k are the boundaries i and j.", correct: true, explanation: "Right. The whole point of iterating over 'last to burst' is that it pins down k's neighbors at the moment of bursting — they're the fixed boundaries i and j, regardless of what happened in the sub-intervals (i, k) and (k, j) beforehand. That's why the gain term uses padded[i] and padded[j]." },
            { label: "Because the recurrence sums over all possible k.", explanation: "The sum-over-k is the maximization, not the gain term. The gain for a specific k uses i and j as neighbors because those are the only balloons left adjacent to k when k bursts last." },
            { label: "Performance — boundary indexing is faster.", explanation: "It's a correctness reason, not a performance one. Using k-1 and k+1 would compute the wrong value." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="What goes wrong if you iterate Burst Balloons in the order `for (int i = 0; i < N; i++) for (int j = i+2; j < N; j++)` instead of by interval length?"
          options={[
            { label: "Nothing — both orders work.", explanation: "They don't both work. Naive row-major iteration breaks the 'smaller subproblems are filled first' invariant." },
            { label: "When computing dp[i][j], the recurrence reads dp[k][j] for k > i — that cell lives in a row we haven't reached yet (we're still on row i), so it hasn't been filled. You read 0 and produce a wrong answer.", correct: true, explanation: "Right. The dependency in interval DP is 'shorter intervals first.' With naive nested loops (outer i, inner j), dp[i][j] needs dp[k][j] for k between i and j — those cells are in row k > i, which we haven't started iterating yet, so they're still zero. Iterating by `len` first guarantees all shorter intervals (regardless of where they start) are filled before any longer one." },
            { label: "Out-of-bounds error.", explanation: "Java's int[][] is zero-initialized, so reads succeed. The bug is silent: wrong answer, no crash." },
            { label: "Stack overflow.", explanation: "It's iterative; no recursion is involved." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Tree DP ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="tree" title="I can write a tree DP that returns a pair (rob, skip) per node" xp={25}>
      <section>
        <h2 id="tree">Tree DP — House Robber III (LC 337)</h2>

        <p>
          The setup: houses arranged as a binary tree. The thief can&apos;t rob a parent and a child on the same
          night (police get tipped off). Find the maximum total amount that can be robbed.
        </p>

        <p>
          The 1D version (House Robber I) had the &quot;rob i&quot; vs &quot;skip i&quot; recurrence on a linear
          array. Here, &quot;previous&quot; isn&apos;t a single index — it&apos;s a parent node. So instead of a
          1D array, the state lives on each tree node, and the recurrence runs in post-order: children answer
          first, then the parent combines.
        </p>

        <h3>State: a pair per node</h3>

        <p>
          For each node, return a pair: <code>{`{robThisNode, dontRobThisNode}`}</code> — the best amount we can
          collect from the subtree rooted here, conditional on whether we rob this node or not.
        </p>

        <ul>
          <li>
            <code>robThisNode</code> = <code>node.val + dontRobLeft + dontRobRight</code>
            <br/><span className="text-sm text-slate-500">If we rob here, we MUST skip both children.</span>
          </li>
          <li>
            <code>dontRobThisNode</code> = <code>max(robLeft, dontRobLeft) + max(robRight, dontRobRight)</code>
            <br/><span className="text-sm text-slate-500">If we skip here, each child is free to choose its own better option independently.</span>
          </li>
        </ul>

        <Mermaid chart={treeDp} />

        <h3>Java implementation</h3>

        <CodeBlock lang="java">{`public int rob(TreeNode root) {
    int[] r = robSub(root);   // {robThisNode, dontRobThisNode}
    return Math.max(r[0], r[1]);
}

// Returns int[2] = {robThisNode, dontRobThisNode}
private int[] robSub(TreeNode node) {
    if (node == null) return new int[]{0, 0};

    int[] left  = robSub(node.left);
    int[] right = robSub(node.right);

    int robThis    = node.val + left[1] + right[1];
    int dontRobThis = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);

    return new int[]{robThis, dontRobThis};
}`}</CodeBlock>

        <Callout variant="insight" title="Why post-order — and why the pair">
          <p>
            <strong>Post-order</strong> because the parent&apos;s answer depends on its children — so we have to
            answer for the children first, then combine at the parent. This is the same reason DFS&apos;s post-order
            traversal is the natural fit for any &quot;answer for each subtree&quot; computation.
          </p>
          <p>
            <strong>Pair return</strong> because if we returned just the best amount per subtree, we&apos;d lose
            information: the parent needs to know what the child&apos;s best is <em>conditional</em> on whether the
            child was robbed. The pair encodes both alternatives. This is the tree-DP equivalent of carrying
            multiple states along an axis — exactly like how Best Time to Buy and Sell Stock with Cooldown carries
            (held, sold) per index.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li>Each node visited once. Constant work per node.</li>
          <li>Time: <strong>O(n)</strong>. Space: <strong>O(h)</strong> for the recursion stack, where h is tree height.</li>
        </ul>

        <p>
          A naive recursion without memoization (returning a single value per node, then re-recursing on grandchildren
          when the current node is robbed) is <strong>O(2^h)</strong> in the worst case — exponential. The pair-return
          trick collapses that to linear by computing both branches in parallel.
        </p>

        <h3>Other tree DPs, briefly</h3>

        <ul>
          <li>
            <strong>Diameter of a Binary Tree (LC 543)</strong> — return the longest <em>downward path</em> per
            node; the longest path through this node is left + right + 1, tracked in a side variable.
          </li>
          <li>
            <strong>Maximum Path Sum (LC 124)</strong> — same shape, but values can be negative, so cap each child
            contribution at <code>max(0, child)</code>. Side variable tracks the global best.
          </li>
          <li>
            <strong>Longest Univalue Path (LC 687)</strong> — extend a child&apos;s path only if its value matches
            the parent&apos;s.
          </li>
          <li>
            <strong>Count Nodes in Subtree with X (LC 1519)</strong> — return a frequency array per subtree;
            combine at the parent.
          </li>
        </ul>

        <p>
          The unifying recipe: <strong>post-order; return whatever the parent needs to combine</strong>. Sometimes
          that&apos;s a single int (downward path length), sometimes a pair (rob/skip), sometimes a small struct
          (path lengths + global best, frequency map). State design in tree DP is the same skill as in array
          DP — just on a tree instead of an axis.
        </p>

        <ClassifyChallenge
          title="Which DP shape?"
          prompt="For each problem, pick the DP family it most naturally lives in. (You'll see a longer version at the end of this module.)"
          buckets={[
            { id: "1d", label: "1D DP", color: "rose" },
            { id: "2d", label: "2D DP", color: "amber" },
            { id: "interval", label: "Interval DP", color: "emerald" },
            { id: "tree", label: "Tree DP", color: "indigo" },
            { id: "bitmask", label: "Bitmask DP", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Min cost to merge K adjacent piles into one, paying the merged size each time.", answer: "interval", explanation: "Range [i, j] of piles + split at k. Classic interval DP, O(n³)." },
            { id: "2", label: "Max independent set on a tree (no two adjacent nodes selected).", answer: "tree", explanation: "Generalization of House Robber III. Per-node pair: (include this, exclude this). Post-order combine." },
            { id: "3", label: "Longest increasing subsequence of an array.", answer: "1d", explanation: "dp[i] = LIS ending at i. The classic 1D recurrence — no interval, no tree, no subset." },
            { id: "4", label: "Travelling salesman: min-cost tour that visits all n ≤ 18 cities.", answer: "bitmask", explanation: "n ≤ 18 + 'visit all cities' = bitmask DP. dp[mask][i] = min cost to visit set 'mask' ending at city i." },
            { id: "5", label: "Edit distance between two strings.", answer: "2d", explanation: "dp[i][j] over prefixes of the two strings. The textbook 2D DP from the prior module." },
            { id: "6", label: "Sum of distances from each tree node to all others (LC 834).", answer: "tree", explanation: "Two-pass tree DP — subtree sizes via post-order, then re-root to propagate answers to all nodes via pre-order." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="If you wrote House Robber III as `int rob(node) { return max(node.val + rob(node.left.left) + rob(node.left.right) + rob(node.right.left) + rob(node.right.right), rob(node.left) + rob(node.right)); }` (without the pair-return trick), what's the time complexity?"
          options={[
            { label: "O(n) — same as the pair-return version.", explanation: "It would be O(n) with memoization, but as written it has no memoization and the same node is recomputed many times." },
            { label: "O(n log n).", explanation: "Tree DPs aren't O(n log n) by default — they're O(n) when each node is visited once. Without memoization here, each node is visited many times in an exponential pattern." },
            { label: "O(2^h) where h is tree height — exponential. Each node is recomputed up to twice from above (once as part of rob(parent) → child, once as part of rob(grandparent) → grandchild).", correct: true, explanation: "Right. The recursive structure is two-way branching: rob(node) calls rob on grandchildren AND rob(node-skipped) calls rob on children. Without memoization (or the pair return), the same subtree is recomputed many times. The pair-return trick is what makes it O(n): it carries both alternatives (rob/skip) up in one recursive call, so each node is visited exactly once." },
            { label: "O(n²).", explanation: "If h = n (a degenerate tree), it's much worse than n². The recursion tree branches twice as you descend, giving 2^h." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="Why does House Robber III's tree DP return a pair (rob, skip) per node, instead of just the best of the two?"
          options={[
            { label: "Java's recursion needs at least two return values.", explanation: "Java is fine with single returns. The reason is algorithmic, not language-level." },
            { label: "Returning just max(rob, skip) loses the information the parent needs: the parent's 'rob this' decision specifically requires its children to be SKIPPED, not just at-their-best.", correct: true, explanation: "Right. If a node returns 100 (its best, from being skipped), the parent doesn't know whether that 100 included robbing the child or not. If the parent now wants to rob itself, it can only ADD the dontRob value of each child, not the max. The pair encodes both, letting the parent pick the right alternative for each branch independently." },
            { label: "Performance — pairs are faster than two separate calls.", explanation: "True (one pass instead of two), but that's a side benefit. The primary reason is correctness." },
            { label: "It's a Java idiom for tree problems.", explanation: "It's a DP idiom, language-independent. Same approach in any language." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Bitmask basics ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="bitmask-basics" title="I can encode subsets as ints and iterate set bits / submasks" xp={25}>
      <section>
        <h2 id="bitmask-basics">Bitmask DP — encoding subsets as ints</h2>

        <p>
          The third advanced family covers a different shape of state: <strong>which subset of a small universe is
          currently &quot;done&quot;</strong>. The classic example is TSP: dp[mask][i] = minimum cost to visit the
          set of cities described by <code>mask</code>, ending at city <code>i</code>. The state is a subset, and
          there are <code>2^n</code> of them — fast enough only when <code>n</code> is small (the rule of thumb is
          <em> n ≤ 20</em>, though competitive programmers will sometimes push to n = 24 or 25 with constant-time
          tricks).
        </p>

        <h3>The bitmask = subset trick</h3>

        <p>
          For <code>n</code> items, an integer with <code>n</code> bits represents any subset: bit <code>i</code> is
          set if item <code>i</code> is in the subset, clear otherwise. There are <code>2^n</code> such integers,
          covering every subset exactly once.
        </p>

        <Mermaid chart={bitmaskShape} />

        <p>
          For <code>n = 4</code>, the integers <code>0..15</code> enumerate the 16 subsets of <code>{`{0, 1, 2, 3}`}</code>.
          For <code>n = 20</code>, integers <code>0..1048575</code>. For <code>n = 25</code>, that&apos;s 33 million —
          starts to get tight on time and memory. For <code>n = 30</code>, it&apos;s a billion; out of reach for
          most contest limits.
        </p>

        <h3>Bit operations refresher (from the bit-manipulation module)</h3>

        <CodeBlock lang="java">{`int mask = 0b1011;   // {0, 1, 3} for a 4-item universe

// Test bit i: is item i in the subset?
boolean has = (mask & (1 << i)) != 0;

// Set bit i: add item i to the subset
int withI = mask | (1 << i);

// Clear bit i: remove item i from the subset
int withoutI = mask & ~(1 << i);

// Toggle bit i
int toggled = mask ^ (1 << i);

// Number of items in the subset (popcount)
int size = Integer.bitCount(mask);

// Lowest item in the subset (as a 1-bit pattern, not an index)
int lowestBit = mask & -mask;          // e.g. 0b1010 -> 0b0010

// Index of the lowest item
int lowestIdx = Integer.numberOfTrailingZeros(mask);

// Iterate all subsets of the universe
for (int m = 0; m < (1 << n); m++) {
    // ... do something with subset m ...
}

// Iterate all set bits (= all items in the subset)
for (int i = 0; i < n; i++) {
    if ((mask & (1 << i)) != 0) {
        // item i is in the subset
    }
}`}</CodeBlock>

        <Callout variant="info" title="Watch out for shift-32 on int">
          <p>
            <code>1 &lt;&lt; n</code> works for <code>n</code> up to 30. For <code>n = 31</code>,{" "}
            <code>1 &lt;&lt; 31</code> is the negative <code>Integer.MIN_VALUE</code>, and for <code>n &gt;= 32</code>,
            Java reduces the shift mod 32 and you get garbage. For larger universes, use <code>long</code> and{" "}
            <code>1L &lt;&lt; n</code> — but realistically, bitmask DP rarely fits past n = 24 anyway, so this is a
            theoretical concern.
          </p>
        </Callout>

        <h3>Submask iteration — the trick that surprises everyone</h3>

        <p>
          A common subroutine in bitmask DP is &quot;for a given <code>mask</code>, iterate over all of its
          submasks.&quot; (Submask of <code>mask</code> = a subset whose set of items is a subset of{" "}
          <code>mask</code>&apos;s items.) The clever idiom:
        </p>

        <CodeBlock lang="java">{`for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // sub iterates over every nonzero submask of mask, exactly once
}
// Don't forget the empty submask (sub = 0) if your problem needs it.`}</CodeBlock>

        <p>
          Why this works: starting from <code>mask</code> itself, each step subtracts 1 (which flips the lowest set
          bit and sets all bits below it) and then ANDs with <code>mask</code> (which clears any bits we set that
          weren&apos;t in <code>mask</code> to begin with). The result is the next-smallest submask in
          decreasing-numeric order. The loop terminates when the next decrement would go below 0.
        </p>

        <CodeBlock lang="plain">{`Example: mask = 0b1011 (the subset {0, 1, 3})

sub = 1011                        (the full mask)
sub = (1011 - 1) & 1011 = 1010 & 1011 = 1010   {1, 3}
sub = (1010 - 1) & 1011 = 1001 & 1011 = 1001   {0, 3}
sub = (1001 - 1) & 1011 = 1000 & 1011 = 1000   {3}
sub = (1000 - 1) & 1011 = 0111 & 1011 = 0011   {0, 1}
sub = (0011 - 1) & 1011 = 0010 & 1011 = 0010   {1}
sub = (0010 - 1) & 1011 = 0001 & 1011 = 0001   {0}
sub = (0001 - 1) & 1011 = 0000 & 1011 = 0000   {}  (loop exits when sub > 0 fails)

Total: 7 nonzero submasks, plus the empty one, = 2^3 = 8 = number of subsets of {0,1,3}.`}</CodeBlock>

        <Callout variant="insight" title="The total cost of submask-of-mask iteration is O(3^n), not O(4^n)">
          <p>
            If you iterate every mask and for each mask iterate its submasks, you might naively expect{" "}
            <code>2^n · 2^n = 4^n</code> total iterations. The actual count is <code>3^n</code>. The reason: each of
            the <code>n</code> items is in one of three states across a (mask, sub) pair — &quot;in mask only,&quot;
            &quot;in mask and sub,&quot; or &quot;in neither.&quot; That&apos;s 3 choices per item, n items, so 3^n
            total pairs. This shows up in problems like Partition to K Equal Sum Subsets and Smallest Sufficient
            Team — O(3^n) is what makes them tractable.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="For n = 20, how many subsets are there to enumerate, roughly?"
          options={[
            { label: "About 400 — n²", explanation: "n² is the size of a 2D DP, not a subset enumeration. Bitmask is exponential in n." },
            { label: "About 1 million — 2^20 ≈ 10^6.", correct: true, explanation: "Right. 2^20 = 1,048,576 — a hair over a million. That's the practical sweet spot for bitmask DP. With O(n) per transition (n = 20), the total work is about 2·10^7 — fast in Java. n = 24 starts to feel slow; n = 30 is out of reach." },
            { label: "About a billion — 2^30.", explanation: "That's n = 30, well past the bitmask DP threshold. Most problems with bitmask DP cap n at 20 or so." },
            { label: "About 20.", explanation: "That's n itself. There are 2^n subsets, exponentially more." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="What does this loop print for mask = 0b110 (= 6)? `for (int sub = mask; sub > 0; sub = (sub - 1) & mask) System.out.println(sub);`"
          options={[
            { label: "6, 5, 4, 3, 2, 1.", explanation: "That would be every value from 6 down to 1, but the loop only visits submasks of 0b110 — the values 0b110, 0b100, 0b010 — not all integers." },
            { label: "6, 4, 2.", correct: true, explanation: "Right. The submasks of 0b110 (the subset {1, 2}) are: {1,2}=0b110=6, {2}=0b100=4, {1}=0b010=2, and {}=0b000=0. The loop visits the nonzero ones in decreasing order: 6, 4, 2. The empty submask 0 is excluded by the `sub > 0` guard." },
            { label: "6 only.", explanation: "The loop continues — `(6 - 1) & 6 = 5 & 6 = 4`, then `(4 - 1) & 6 = 3 & 6 = 2`. So at least 6, 4, 2." },
            { label: "Infinite loop.", explanation: "The decrement-then-AND walks downward; once `sub` reaches 0, the guard `sub > 0` fails and the loop exits. Always terminates." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Bitmask applications ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="bitmask-apps" title="I can solve Partition Equal Subset Sum (and recognize TSP)" xp={25}>
      <section>
        <h2 id="bitmask-apps">Bitmask DP — Partition, bitsets, and TSP</h2>

        <h3>Partition Equal Subset Sum (LC 416) — review the classical DP</h3>

        <p>
          The setup: given an array of positive ints, decide whether it can be split into two subsets with equal
          sum. Equivalent question: is there a subset that sums to <code>total / 2</code>?
        </p>

        <p>
          The classical 1D DP (you saw this in the previous modules): <code>dp[s]</code> = is sum <code>s</code>{" "}
          reachable using some subset? Initialize <code>dp[0] = true</code>; for each <code>num</code>, walk{" "}
          <code>s</code> from <code>target</code> down to <code>num</code> and set{" "}
          <code>dp[s] |= dp[s - num]</code>. The answer is <code>dp[target]</code>.
        </p>

        <CodeBlock lang="java">{`public boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if ((total & 1) == 1) return false;
    int target = total / 2;

    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int num : nums) {
        // Walk DOWN so we don't use the same element twice
        for (int s = target; s >= num; s--) {
            dp[s] = dp[s] || dp[s - num];
        }
    }
    return dp[target];
}`}</CodeBlock>

        <p>
          Time <code>O(n · target)</code>, space <code>O(target)</code>. This is the &quot;knapsack-style&quot; DP
          you saw in Module 28. Already good enough to pass the LeetCode constraints — but there&apos;s a cute
          bitset variant that&apos;s faster by a factor of 64.
        </p>

        <h3>The BitSet trick — collapse the inner loop into one bit-op</h3>

        <p>
          The boolean array <code>dp[0..target]</code> can be packed into a <code>BitSet</code>: bit <code>s</code>
          set if sum <code>s</code> is reachable. Then the inner loop &quot;for each s, set <code>dp[s] |= dp[s -
          num]</code>&quot; is exactly &quot;OR the whole bitset with itself shifted left by <code>num</code> bits&quot;
          — one bit-op for all <code>target</code> sums in parallel.
        </p>

        <CodeBlock lang="java">{`public boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if ((total & 1) == 1) return false;
    int target = total / 2;

    java.util.BitSet dp = new java.util.BitSet(target + 1);
    dp.set(0);   // sum 0 is reachable with the empty subset

    for (int num : nums) {
        // dp |= (dp << num)
        // BitSet doesn't have a shift method, so do it via a copy:
        java.util.BitSet shifted = new java.util.BitSet(target + 1);
        for (int s = dp.nextSetBit(0); s >= 0 && s + num <= target; s = dp.nextSetBit(s + 1)) {
            shifted.set(s + num);
        }
        dp.or(shifted);
        if (dp.get(target)) return true;   // early exit
    }
    return dp.get(target);
}`}</CodeBlock>

        <Callout variant="info" title="Languages with native shift-on-bitset are even cleaner">
          <p>
            In C++ or Python, <code>std::bitset</code> and Python ints support a real left-shift on the whole
            bitset, so the inner loop becomes a one-liner: <code>dp |= dp &lt;&lt; num</code>. Java&apos;s{" "}
            <code>BitSet</code> doesn&apos;t expose shift, so we approximate it via the iterate-set-bits loop above.
            The asymptotic cost of <code>dp |= dp &lt;&lt; num</code> is <code>O(target / 64)</code> — 64× faster
            than the boolean-array version. For this LeetCode the constants don&apos;t matter, but for &quot;subset
            sum at scale&quot; (e.g. when target is 10⁵+), the bitset trick is the difference between a fast
            solution and a TLE.
          </p>
        </Callout>

        <h3>Where this is &quot;true&quot; bitmask DP — when n is small enough to encode subsets directly</h3>

        <p>
          The classical <code>dp[s]</code> Partition DP indexes by sum, not by subset. The full bitmask version,
          where <code>dp[mask]</code> tracks something per subset of items, becomes the right tool when{" "}
          <strong>n is small but the question is about which items, not just total weight</strong>:
        </p>

        <ul>
          <li>
            <strong>Partition to K Equal Sum Subsets (LC 698)</strong> — n ≤ 16. Encode &quot;which items are
            already placed&quot; as a mask. <code>dp[mask]</code> = can we partition the items in mask into some
            number of complete groups of size <code>total/k</code>?
          </li>
          <li>
            <strong>Smallest Sufficient Team (LC 1125)</strong> — encode required skills as bits;{" "}
            <code>dp[skillsMask]</code> = min team to cover that skill set.
          </li>
          <li>
            <strong>Maximum Compatibility Score Sum (LC 1947)</strong> — assign m students to m mentors;{" "}
            <code>dp[mask]</code> = max score with mentors-used encoded by mask.
          </li>
          <li>
            <strong>Number of Ways to Wear Different Hats (LC 1434)</strong> — invert the typical state: iterate
            hats, encode &quot;which people are already hatted&quot; as a mask.
          </li>
        </ul>

        <h3>Travelling Salesman Problem — the textbook bitmask DP (teaser)</h3>

        <p>
          TSP: given an n × n distance matrix, find the shortest tour that visits every city exactly once and
          returns to the start. Brute force is <code>O(n!)</code> — for n = 15, that&apos;s 10¹². Bitmask DP turns
          it into <code>O(n² · 2^n)</code> — for n = 15, that&apos;s ~7 million. Very tractable.
        </p>

        <p>The state and recurrence:</p>

        <CodeBlock lang="plain">{`dp[mask][i] = min cost of a path that:
              - starts at city 0
              - visits exactly the cities in 'mask'
              - ends at city i (so bit i must be set in mask)

base: dp[{0}][0] = 0.   All other dp[*][*] = INFINITY.

transition: for each mask, each i in mask, each j not in mask:
    new_mask = mask | (1 << j)
    dp[new_mask][j] = min(dp[new_mask][j], dp[mask][i] + dist[i][j])

answer: min over i != 0 of (dp[FULL][i] + dist[i][0])
        where FULL = (1 << n) - 1 (every city visited).`}</CodeBlock>

        <p>
          The full Java implementation is ~30 lines and pretty mechanical once you have the state. We won&apos;t
          drill it here — it&apos;s exactly the &quot;subset + endpoint&quot; pattern from the bullets above.
          Recognize it, then write it as needed.
        </p>

        <Callout variant="warn" title="Why TSP is bitmask DP's natural home">
          <p>
            TSP&apos;s state has to remember <em>which</em> cities have been visited (not just how many) and{" "}
            <em>where you currently are</em>. The first part is what kills 1D and 2D DP — &quot;which cities&quot;
            is a subset, and there&apos;s no smaller structure to compress it. Bitmask is the only way to encode it
            efficiently for small n. When you see &quot;visit every X exactly once&quot; in a problem, that&apos;s
            your bitmask alarm bell.
          </p>
        </Callout>

        <Quiz
          kind="Operation check"
          question="In the BitSet version of Partition Equal Subset Sum, what's the asymptotic time complexity in terms of n (number of items) and T (target sum)?"
          options={[
            { label: "O(n · T) — same as the boolean-array version.", explanation: "Same in big-O if you don't count word-level parallelism. With native shift-on-bitset (C++ or Python), or even Java's BitSet's word-level operations under the hood, you get a 64× constant-factor speedup." },
            { label: "O(n · T / 64) — the inner shift-and-OR is one CPU word at a time.", correct: true, explanation: "Right (when you have a real shift; Java's BitSet approximation is messier). Each iteration does a shift-by-num and an OR; both are linear in the number of 64-bit words in the bitset, which is T / 64. Across n items, total cost is O(n · T / 64). For T = 10⁴, that's ~150 ops per num — fast enough that the overhead of native shift dominates." },
            { label: "O(n²) — bitset operations are constant-time.", explanation: "Bitset operations on a T-bit bitset are linear in T/64, not constant. The exponent is correct only if T is bounded." },
            { label: "O(2^n) — bitmask DP is exponential.", explanation: "Partition Equal Subset Sum's classical DP is pseudo-polynomial in T, not exponential in n. Bitmask DP is the right phrase only when the state is a SUBSET of items (n ≤ ~20 problems), not when the state is a sum." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="For TSP with n = 18 cities, what's the approximate state-space size and total work for the dp[mask][i] formulation?"
          options={[
            { label: "States ≈ 2^18 ≈ 260K. Work per state ≈ n = 18. Total ≈ 4.7 million.", explanation: "Close, but the state is dp[mask][i] not just dp[mask] — there are n times more states than this." },
            { label: "States ≈ n · 2^n = 18 · 260K ≈ 4.7M. Work per state ≈ n = 18 (for each j not in mask). Total ≈ 85 million.", correct: true, explanation: "Right. State space is n · 2^n (the mask × the current endpoint). Each transition tries every j not in the mask, which is at most n. So total work is O(n² · 2^n). For n = 18: 18² · 2^18 ≈ 85M — runs in a couple of seconds in Java." },
            { label: "States ≈ 18! ≈ 6.4 quadrillion. Brute force.", explanation: "n! is the number of tours, not states. The bitmask DP collapses the n! tours into n · 2^n states by noting that 'which cities visited' is what matters, not the order." },
            { label: "States ≈ n³ = 5832. Work per state ≈ n. Total ≈ 100K.", explanation: "n³ states is what 2D DPs look like. Bitmask DP has 2^n in the mix, which dominates n³ for n above ~10." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Choosing the right shape ───────────────── */}
      <Checkpoint moduleSlug="dp-advanced" id="shape" title="I've completed Module 29 — and Phase 7!" xp={50} celebration="Five DP families: 1D, 2D, interval, tree, bitmask. You can now read a problem and pick the right state shape on first read. Phase 8 — interview prep — is next.">
      <section>
        <h2 id="shape">Choosing the right DP shape</h2>

        <p>
          The whole-of-DP skill is <em>state design</em>. Phases 7&apos;s prior modules built the 1D and 2D
          templates. This module added three more shapes: interval, tree, bitmask. With the five families in hand,
          most LeetCode DP collapses to &quot;recognize the family, write the recurrence, run it.&quot;
        </p>

        <Mermaid chart={dpDecision} />

        <h3>The decision tree, in words</h3>

        <ul>
          <li>
            <strong>One position is enough</strong> → 1D DP. The classics: Climbing Stairs, House Robber, LIS, Coin
            Change (number of ways).
          </li>
          <li>
            <strong>Two positions / two strings / item-and-capacity</strong> → 2D DP. LCS, Edit Distance, Knapsack,
            Unique Paths, Distinct Subsequences.
          </li>
          <li>
            <strong>Range [i, j] of an array, with a split-at-k recurrence</strong> → Interval DP. Burst Balloons,
            Matrix Chain Multiplication, Strange Printer, Palindrome Partitioning II.
          </li>
          <li>
            <strong>Rooted at a tree node, post-order with a per-node tuple</strong> → Tree DP. House Robber III,
            Diameter, Maximum Path Sum, Sum of Distances in Tree.
          </li>
          <li>
            <strong>Subset of a small universe (n ≤ ~20)</strong> → Bitmask DP. TSP, Partition to K Equal Sums,
            Smallest Sufficient Team, Hats Assignment.
          </li>
        </ul>

        <Callout variant="insight" title="The five-family heuristic isn't exhaustive — it's a starting point">
          <p>
            Some problems mix families: digit DP combines 1D state with extra &quot;tight&quot; flags; profile DP
            for grid problems uses bitmask state along the cross-section; some tree problems re-root and run a
            second pass. The five families cover the vast majority of LeetCode DP — but every now and then you&apos;ll
            meet a problem whose state needs a custom shape, and the move is to write down what your recurrence{" "}
            <em>actually depends on</em>, then pack that into the smallest state that captures it.
          </p>
        </Callout>

        <h3>Common signals — what to look for in the problem statement</h3>

        <ul>
          <li>
            <strong>&quot;Optimal way to split / merge / multiply / burst&quot;</strong> on a contiguous array →
            interval DP.
          </li>
          <li>
            <strong>&quot;Binary tree&quot; or &quot;rooted tree&quot;</strong> + &quot;maximum / minimum / count&quot; →
            tree DP. Recurse, return what the parent needs.
          </li>
          <li>
            <strong>&quot;n ≤ 20&quot;</strong> + &quot;visit every / cover all / assign each&quot; → bitmask DP.
            The small-n constraint is almost always the giveaway.
          </li>
          <li>
            <strong>&quot;Sum / capacity / count&quot;</strong> with a target value, even when n is large → 1D or
            2D &quot;knapsack-style&quot; DP.
          </li>
          <li>
            <strong>&quot;Number of ways to&quot;</strong> + &quot;sequence of choices&quot; → 1D DP, summing
            transitions instead of taking max/min.
          </li>
        </ul>

        <h3>Final pattern-recognition challenge</h3>

        <ClassifyChallenge
          title="Phase 7 · DP shape recognition"
          prompt="For each problem, pick the DP family it most naturally fits. If multiple seem possible, pick the cleanest."
          buckets={[
            { id: "1d", label: "1D DP", color: "rose" },
            { id: "2d", label: "2D DP", color: "amber" },
            { id: "interval", label: "Interval DP", color: "emerald" },
            { id: "tree", label: "Tree DP", color: "indigo" },
            { id: "bitmask", label: "Bitmask DP", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Maximum sum non-adjacent in a tree (root-children adjacency, can't take both).", answer: "tree", explanation: "House Robber III. Per-node {include, exclude} pair, post-order combine." },
            { id: "2", label: "Number of ways to make change for amount X using coins of denominations c_1..c_k.", answer: "1d", explanation: "Coin Change II. dp[s] = number of ways to make s. Walk coins outer, sums inner — 1D." },
            { id: "3", label: "Min cost to cut a stick at given positions, where each cut's cost equals the current piece's length (LC 1547).", answer: "interval", explanation: "dp[i][j] over the range of cut positions, splitting at every k inside. Interval DP, O(n³) where n = number of cuts." },
            { id: "4", label: "Longest common subsequence of two strings.", answer: "2d", explanation: "Two strings, two indices, dp[i][j] over prefixes. Textbook 2D." },
            { id: "5", label: "Travelling salesman with n = 16 cities.", answer: "bitmask", explanation: "n ≤ 20 + 'visit every city exactly once' = bitmask DP. dp[mask][i] = min cost ending at i." },
            { id: "6", label: "Burst Balloons.", answer: "interval", explanation: "Range [i, j] with sentinel boundaries; iterate over the LAST balloon to burst inside (i, j). O(n³)." },
            { id: "7", label: "Smallest team of people that covers all required skills (each person knows a subset; n people ≤ 60 but skills ≤ 16).", answer: "bitmask", explanation: "Bitmask the SKILLS, not the people. dp[skillsMask] = min team size. The 'small-universe' axis is whichever side has n ≤ 20." },
            { id: "8", label: "Edit distance — min insertions/deletions/replacements to turn s into t.", answer: "2d", explanation: "Two prefixes, two indices. dp[i][j] = min ops to align s[0..i] and t[0..j]. Classic 2D DP." },
            { id: "9", label: "Maximum sum of any path between two nodes in a binary tree (LC 124).", answer: "tree", explanation: "Per-node return: best downward extension. Side variable tracks the global best path-through-node. Tree DP with auxiliary global." },
          ]}
        />

        <Quiz
          kind="Phase final"
          question="A problem says: 'You have n ≤ 14 cards, each with a value. Pick a permutation of all cards that maximizes Σ value[i] · position[i] (1-indexed). The catch: certain card pairs (a, b) impose that card a must come before card b in the permutation.' Which technique fits best?"
          options={[
            { label: "Greedy — sort by value, breaking ties by precedence.", explanation: "Greedy sorts ignore the precedence constraints in general. You can construct counterexamples where the greedy permutation violates an ordering constraint, and the constraint-respecting optimum is different." },
            { label: "Bitmask DP — dp[mask] = max sum when the cards in mask have been placed (in some valid prefix), respecting precedence by checking that every card in mask has its predecessors also in mask.", correct: true, explanation: "Right. n ≤ 14 plus 'permutation respecting precedence' is the classic Bitmask DP signature. State: dp[mask] = max sum achievable with the items in mask placed (size = bitCount(mask) is the position 1-indexed). Transition: try placing each card j not in mask whose predecessors are all in mask. Time: O(n · 2^n) ≈ 230K for n = 14, easy. This is the 'topological order DP' that combines bitmask + precedence." },
            { label: "Interval DP — split the permutation at some k.", explanation: "There's no contiguous-range structure; the items can interleave. Interval DP fits 'split this RANGE' problems, not 'pick a permutation' ones." },
            { label: "1D DP — dp[i] = best sum considering the first i cards.", explanation: "1D fails because 'best sum considering the first i' doesn't capture which cards are already used — you'd recount cards or violate precedence. The state needs to be the set of used cards, which is exactly bitmask." },
          ]}
        />

        <Quiz
          kind="Phase final"
          question="Why does interval DP iterate by interval LENGTH, while 2D DP usually iterates row by row?"
          options={[
            { label: "Aesthetic preference — both orders work in either family.", explanation: "Both orders don't always work. The right iteration order is the one that fills smaller subproblems before larger ones, and 'smaller' is defined differently in each family." },
            { label: "Interval DP's recurrence reads cells dp[i][k] and dp[k][j] for k between i and j — both have shorter interval-length than (i, j). Iterating by length first guarantees those are filled. 2D DP usually reads dp[i-1][j] and dp[i][j-1], which row-major iteration fills first naturally.", correct: true, explanation: "Right. The iteration order in any DP must respect the dependency structure: 'before computing X, every cell X depends on must already be computed.' In interval DP, dependencies go to shorter intervals (regardless of where they start); in 2D DP, dependencies go to (i-1, j) and (i, j-1), which row-major covers correctly. Wrong order = silent wrong answer." },
            { label: "Performance — by-length is faster.", explanation: "It's a correctness concern, not performance. Same number of cells, same work per cell." },
            { label: "Interval DP isn't really DP, so it has different rules.", explanation: "It's DP — same memoize-or-tabulate paradigm. Just a different shape of state and a different dependency pattern." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="Three new state shapes — interval, tree, bitmask — extend the 1D/2D toolkit to problems where the right state is a range, a subtree, or a subset."
          points={[
            { takeaway: "Recognize interval DP from 'optimally split / merge / multiply / burst over a contiguous array'.", detail: "State: dp[i][j] over the range. Recurrence: split at some k inside, recurse on (i, k) and (k, j), pay a cost for the split. Iterate by interval length, smallest first — the iteration order is what makes the bottom-up version correct. O(n³) time, O(n²) space." },
            { takeaway: "Burst Balloons hinges on iterating over which balloon is LAST to pop in a range, not first.", detail: "Iterating over 'first' breaks the independence of the two halves; iterating over 'last' fixes the boundaries of each sub-interval at i and j. Same 'reverse the time arrow' trick shows up in Optimal BST construction and a few other interval DP cousins." },
            { takeaway: "Tree DP runs in post-order and returns whatever shape the parent needs to combine.", detail: "Pair returns are common — (rob, skip), (include, exclude), (longest path through, longest path ending). The trick is to enumerate the parent's combine logic first, then read off what each child must hand back. Single-value return is fine when one alternative dominates; pair-return is needed when the parent's choice depends on the child's." },
            { takeaway: "Bitmask DP fits when n ≤ ~20 and the state is 'which subset have I covered'.", detail: "The integer = subset trick: bit i set if item i is in the subset. 2^n total subsets, fast enough up to n ≈ 20–22 with O(n) per transition. Submask iteration via `for (sub = mask; sub > 0; sub = (sub - 1) & mask)` is the inner-loop trick that gives the cleanest O(3^n) for partition-style problems." },
            { takeaway: "State design IS the DP problem. Once the state is right, the recurrence is mechanical.", detail: "Every advanced DP problem feels hard until you find the state that makes the answer for one state depend only on smaller states. After that, transitions are 'try every choice, recurse on smaller, combine.' The skill is internalizing the five state shapes (1D position, 2D pair, interval range, tree subtree, bitmask subset) so you can match a problem to one on first read." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 border border-fuchsia-200 dark:border-fuchsia-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 7 complete · Dynamic Programming</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Four modules, five state shapes. From &quot;DP intuition&quot; (memoize the recursion) to 1D, 2D,
            interval, tree, and bitmask DP. You can now reach for the right family from the shape of the input —
            and you have the templates to write the recurrence and iteration order without notes. Phase 8 —
            advanced structures and interview prep — is next, starting with tries.
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>

        <div className="not-prose mt-12 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40">
          <p className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold">Up next · Phase 8 · Module 30</p>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1 mb-2">Tries</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            The prefix-tree structure for string problems. When a hashmap of strings is good but a trie is great:
            autocomplete, prefix-search, word-search, and the &quot;all words sharing a prefix in O(prefix
            length)&quot; superpower.
          </p>
          <Link
            href="/courses/dsa/modules/tries"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Tries →
          </Link>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
