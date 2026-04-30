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
  { id: "two-dims", title: "When state needs two dimensions" },
  { id: "unique-paths", title: "Unique Paths — grid DP" },
  { id: "lcs", title: "Longest Common Subsequence" },
  { id: "edit-distance", title: "Edit Distance" },
  { id: "knapsack", title: "0/1 Knapsack" },
  { id: "cheatsheet", title: "2D DP recognition" },
];

export default function Dp2dModule() {
  const mod = getModuleBySlug("dp-2d")!;

  // Unique Paths fill order on a 3x4 grid
  const uniquePathsFill = `
flowchart TB
    subgraph G["Fill order — top row and left column are 1, then row by row"]
        direction TB
        R0C0["1"] --- R0C1["1"] --- R0C2["1"] --- R0C3["1"]
        R1C0["1"] --- R1C1["2"] --- R1C2["3"] --- R1C3["4"]
        R2C0["1"] --- R2C1["3"] --- R2C2["6"] --- R2C3["10"]
    end
    R0C1 -. "+" .-> R1C1
    R1C0 -. "+" .-> R1C1
    R0C2 -. "+" .-> R1C2
    R1C1 -. "+" .-> R1C2
    R1C1 -. "+" .-> R2C1
    R2C0 -. "+" .-> R2C1
    style R0C0 fill:#a7f3d0,color:#000,stroke:#10b981
    style R0C1 fill:#a7f3d0,color:#000,stroke:#10b981
    style R0C2 fill:#a7f3d0,color:#000,stroke:#10b981
    style R0C3 fill:#a7f3d0,color:#000,stroke:#10b981
    style R1C0 fill:#a7f3d0,color:#000,stroke:#10b981
    style R2C0 fill:#a7f3d0,color:#000,stroke:#10b981
    style R2C3 fill:#fde68a,color:#000,stroke:#d97706
  `.trim();

  // Edit distance recurrence picture
  const editDistanceShape = `
flowchart LR
    subgraph CELL["Computing dp[i][j] for A[i-1] vs B[j-1]"]
        direction TB
        TOP["dp[i-1][j]<br/>(delete from A)"] --> CUR["dp[i][j]"]
        LEFT["dp[i][j-1]<br/>(insert into A)"] --> CUR
        DIAG["dp[i-1][j-1]<br/>(match or replace)"] --> CUR
    end
    CUR --> OUT{"A[i-1] == B[j-1]?"}
    OUT -->|yes| FREE["dp[i][j] = dp[i-1][j-1]<br/>(free — same character)"]
    OUT -->|no| MIN["dp[i][j] = 1 + min(top, left, diag)<br/>(pay 1 for delete / insert / replace)"]
    style CUR fill:#fde68a,color:#000,stroke:#d97706
    style FREE fill:#a7f3d0,color:#000,stroke:#10b981
    style MIN fill:#fca5a5,color:#000,stroke:#dc2626
  `.trim();

  // 0/1 Knapsack space-optimization direction
  const knapsackDirection = `
flowchart LR
    subgraph WRONG["Forward sweep (low → high) — WRONG for 0/1"]
        direction LR
        W0["dp[0]"] --> W1["dp[1]"] --> W2["dp[2]"] --> W3["dp[3]"] --> W4["dp[4]"]
    end
    subgraph RIGHT["Backward sweep (high → low) — correct"]
        direction RL
        R4["dp[4]"] --> R3["dp[3]"] --> R2["dp[2]"] --> R1["dp[1]"] --> R0["dp[0]"]
    end
    WRONG -->|"low→high reuses<br/>just-updated dp[w-wt],<br/>which already counted item i"| BAD["item i used twice"]
    RIGHT -->|"high→low reads dp[w-wt]<br/>from previous row<br/>(item i not yet there)"| GOOD["item i used once"]
    style BAD fill:#fca5a5,color:#000,stroke:#dc2626
    style GOOD fill:#a7f3d0,color:#000,stroke:#10b981
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="dp-2d" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 7 · Module 28 · 2D DP
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2.5–3h · assumes dp-intro and dp-1d are done</p>
      </div>

      {/* ───────────────── Part 1 · Two dimensions ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="two-dims" title="I can spot when DP needs two dimensions" xp={20}>
      <section>
        <h2 id="two-dims">When state needs two dimensions</h2>

        <p>
          By now you&apos;ve internalized the 1D DP shape: <code>dp[i]</code> answers a question about the prefix
          ending at index <code>i</code>, and the recurrence wires <code>dp[i]</code> to a few earlier{" "}
          <code>dp[j]</code> values. That works beautifully when the problem has a single sweeping axis — usually
          &quot;position in a sequence.&quot; But there&apos;s a whole family of problems where 1D{" "}
          <em>cannot</em> capture the answer, and trying to force it in produces a recurrence that needs information
          you didn&apos;t save.
        </p>

        <p>
          The tell is simple: <strong>the decision at <code>i</code> depends on a second axis</strong>. Some examples
          you&apos;ll meet in this module:
        </p>

        <ul>
          <li>
            <strong>Two strings.</strong> &quot;How does prefix <code>A[0..i)</code> relate to prefix{" "}
            <code>B[0..j)</code>?&quot; You need both <code>i</code> and <code>j</code>. (LCS, edit distance,
            shortest common supersequence, regex match.)
          </li>
          <li>
            <strong>A grid.</strong> The state is a 2D position <code>(i, j)</code>. (Unique paths, minimum path sum,
            dungeon game, longest increasing path.)
          </li>
          <li>
            <strong>A knapsack-style capacity.</strong> &quot;Best value using items 0..i with capacity{" "}
            <code>w</code> remaining.&quot; You need both the item index and the remaining budget.
          </li>
          <li>
            <strong>A subarray interval.</strong> &quot;Best answer over the subarray <code>[i..j]</code>.&quot;
            (Burst balloons, matrix chain multiplication — full coverage in the next module.)
          </li>
        </ul>

        <h3>The generic 2D shape</h3>

        <p>
          Whatever flavor it is, the structure looks the same:
        </p>

        <CodeBlock lang="plain">{`dp[i][j] = "the answer to the restricted version of the problem
            described by parameters (i, j)"

base cases:  fill the boundary — usually dp[0][*] and dp[*][0]
recurrence:  dp[i][j] expressed in terms of constant-many neighbors
final:       read off dp[m][n] (or sometimes the max over the whole table)`}</CodeBlock>

        <p>
          The recurrence almost always reaches into one of three neighbors: <code>dp[i-1][j]</code>,{" "}
          <code>dp[i][j-1]</code>, or <code>dp[i-1][j-1]</code> — and sometimes all three. That dependency pattern
          is what makes the table fillable in a single bottom-up sweep, and what tells you the time complexity is{" "}
          <code>O(m·n)</code> in the typical case.
        </p>

        <Callout variant="insight" title="Two flavors that account for ~80% of 2D DP">
          <p>
            <strong>Two-string family:</strong> the indices <code>i, j</code> are pointers into two different
            sequences, and you compare <code>A[i-1]</code> to <code>B[j-1]</code> at every cell. LCS and edit
            distance are the canonical members. Almost every problem in this family has the same cell-shape: a
            match-or-don&apos;t-match branch.
          </p>
          <p>
            <strong>Grid family:</strong> the indices are literal <code>(row, col)</code> coordinates and you walk
            from <code>(0,0)</code> to <code>(m-1,n-1)</code>. Unique paths and minimum path sum are the canonical
            members. The recurrence is whatever the &quot;allowed moves&quot; rule says — usually right and down.
          </p>
        </Callout>

        <h3>Why 1D often isn&apos;t enough</h3>

        <p>
          Suppose we tried to solve LCS with 1D state. We&apos;d need <code>dp[i]</code> = &quot;LCS of{" "}
          <code>A[0..i)</code> against B&quot;. But to extend that to <code>i+1</code>, we&apos;d need to know the
          alignment we used so far against B — which is exactly the <code>j</code> we left out. There&apos;s no
          way to summarize &quot;how much of B has been consumed&quot; without it. So we add the second axis, and
          the recurrence falls out cleanly.
        </p>

        <p>
          Ironically, several 2D DPs <em>can</em> be space-optimized back down to 1D — because in the recurrence,
          <code>dp[i][j]</code> only depends on row <code>i-1</code>, so you only need to keep one previous row.
          We&apos;ll do this twice in this module: once for unique paths, once for knapsack. But the{" "}
          <em>conceptual</em> state is still 2D, and getting the 2D version right comes first.
        </p>

        <Quiz
          kind="Quick check"
          question="You&apos;re asked to count the number of ways to climb a staircase where each step costs a varying amount of energy and you also have a daily energy budget. What's the natural state shape?"
          options={[
            { label: "1D: dp[i] = ways to reach step i.", explanation: "Misses the budget axis — two paths reaching step i with different remaining energy aren't equivalent for future moves." },
            { label: "2D: dp[i][e] = ways to reach step i with exactly e energy remaining.", correct: true, explanation: "Right. The decision at each step depends on both 'where am I' and 'how much energy do I have left' — the second axis is the resource budget. This is the same shape as knapsack: dp[item][capacity]." },
            { label: "1D: dp[e] = max steps reachable with energy e.", explanation: "We were asked to count ways, not maximize. Also, this collapses position into a derived quantity, which loses information — different positions with the same e are different states." },
            { label: "0D: just a running total.", explanation: "0D works only when the problem has no state at all (e.g., simple constant-time formulas). Counting paths with constraints needs structured state." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which of these problems is NOT naturally 2D DP?"
          options={[
            { label: "Edit distance between two strings.", explanation: "Two strings → two indices. Classic 2D." },
            { label: "Number of paths in an m×n grid from top-left to bottom-right.", explanation: "Grid coordinates are inherently 2D." },
            { label: "Longest increasing subsequence of an array.", correct: true, explanation: "Right. LIS is famously 1D: dp[i] = longest increasing subsequence ending at index i. There's only one sequence and one sweeping axis. (There's an O(n log n) variant that uses a tails array, but the textbook DP is 1D.)" },
            { label: "Best subset-sum with item weights and a target capacity.", explanation: "Items × capacity → 2D knapsack. The capacity is the second axis." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Unique Paths ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="unique-paths" title="I can solve grid DP and space-optimize the row" xp={25}>
      <section>
        <h2 id="unique-paths">Unique Paths — the cleanest grid DP there is</h2>

        <p>
          <strong>LC 62 · Unique Paths.</strong> A robot stands on the top-left of an <code>m × n</code> grid. It can
          move only right or down. How many distinct paths bring it to the bottom-right?
        </p>

        <p>
          The state is a literal grid coordinate: <code>dp[i][j]</code> = number of ways to reach cell{" "}
          <code>(i, j)</code> starting from <code>(0, 0)</code>. The recurrence comes straight from the move rule:
          to land on <code>(i, j)</code> the last step was either &quot;right from <code>(i, j-1)</code>&quot; or
          &quot;down from <code>(i-1, j)</code>.&quot; Those two ways into the cell are disjoint and exhaustive, so
          you sum them.
        </p>

        <CodeBlock lang="plain">{`dp[i][j] = dp[i-1][j] + dp[i][j-1]

base cases:
    dp[0][j] = 1 for all j   (only one way along the top row: keep going right)
    dp[i][0] = 1 for all i   (only one way down the left column)

answer: dp[m-1][n-1]`}</CodeBlock>

        <Mermaid chart={uniquePathsFill} />

        <p>
          The diagram fills a 3×4 grid — top row and left column are all 1s, then each interior cell is the sum of
          its top and left neighbors. Cell <code>(2, 3)</code> ends up as 10, and that&apos;s the answer.
        </p>

        <h3>Java — the straightforward 2D version</h3>

        <CodeBlock lang="java">{`public int uniquePaths(int m, int n) {
    int[][] dp = new int[m][n];
    // Top row and left column: exactly one path each
    for (int j = 0; j < n; j++) dp[0][j] = 1;
    for (int i = 0; i < m; i++) dp[i][0] = 1;
    // Fill the rest row by row
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i-1][j] + dp[i][j-1];
        }
    }
    return dp[m-1][n-1];
}`}</CodeBlock>

        <p>
          Time: <code>O(m·n)</code>. Space: <code>O(m·n)</code>. That&apos;s a perfect baseline for a coding
          interview — write this first, get it right, then talk about optimizing.
        </p>

        <h3>Space optimization — one rolling row</h3>

        <p>
          Notice that <code>dp[i][j]</code> only reads from row <code>i-1</code> (the cell directly above) and the
          same row <code>i</code> (the cell directly left). We never look two rows back. So the entire previous-row
          history can be collapsed into a single 1D array that we overwrite in place as we sweep left-to-right.
        </p>

        <CodeBlock lang="java">{`public int uniquePaths(int m, int n) {
    // Use the shorter dimension as the row length to minimize memory
    if (n > m) { int t = m; m = n; n = t; }
    int[] dp = new int[n];
    java.util.Arrays.fill(dp, 1);          // top row is all 1s
    for (int i = 1; i < m; i++) {
        // dp[0] stays 1 (left column always has one path)
        for (int j = 1; j < n; j++) {
            // before update: dp[j] is "row i-1, col j" (the cell above)
            //                dp[j-1] is "row i, col j-1" (already updated to current row)
            dp[j] = dp[j] + dp[j-1];
        }
    }
    return dp[n-1];
}`}</CodeBlock>

        <p>
          Time stays <code>O(m·n)</code>. Space drops to <code>O(min(m, n))</code>. The trick — and the part that
          often confuses people — is that <strong>the same array slot plays two roles depending on whether
          you&apos;ve hit it yet in the current row sweep</strong>. Before the update, <code>dp[j]</code> still holds
          last row&apos;s value (the &quot;up&quot; neighbor). After the update, it holds this row&apos;s value
          (which the next iteration&apos;s <code>dp[j-1]</code> will read).
        </p>

        <Callout variant="warn" title="Why the sweep direction matters here">
          <p>
            We sweep <em>left to right</em> within each row, and that ordering is load-bearing. <code>dp[j-1]</code>{" "}
            must already be the new row&apos;s value when we read it (we want the &quot;left&quot; neighbor in the
            current row), and <code>dp[j]</code> must still be the old row&apos;s value (the &quot;up&quot;
            neighbor). Reverse the sweep and you&apos;d break one of those invariants. We&apos;ll see the same
            ordering question pop up — with the <em>opposite</em> answer — in 0/1 knapsack.
          </p>
        </Callout>

        <h3>The closed-form version (and why we still want DP)</h3>

        <p>
          Unique Paths actually has a beautiful closed form. Each path from <code>(0,0)</code> to{" "}
          <code>(m-1, n-1)</code> consists of exactly <code>m-1</code> down moves and <code>n-1</code> right moves
          in some order — so the count is the number of ways to choose which <code>m-1</code> of the{" "}
          <code>m+n-2</code> moves are &quot;down&quot;:
        </p>

        <CodeBlock lang="plain">{`paths(m, n) = C(m + n - 2, m - 1)
            = (m + n - 2)! / ((m - 1)! · (n - 1)!)`}</CodeBlock>

        <p>
          That&apos;s <code>O(min(m, n))</code> time, beats the DP, and is a neat thing to mention. But here&apos;s
          why we still cover the DP version: <strong>the DP generalizes; the closed form doesn&apos;t</strong>.
          Add an obstacle (LC 63), let cell weights vary (LC 64 minimum path sum), allow diagonal moves, count paths
          that visit a checkpoint — every variation breaks the binomial coefficient but barely changes the DP. The
          DP is the robust tool; the closed form is a one-shot trophy for this specific problem.
        </p>

        <h3>One-line variant: with obstacles (LC 63)</h3>

        <p>
          If a cell is blocked, the number of paths into it is 0 — independent of its neighbors. Same recurrence,
          guarded by an obstacle check:
        </p>

        <CodeBlock lang="java">{`public int uniquePathsWithObstacles(int[][] grid) {
    int m = grid.length, n = grid[0].length;
    int[] dp = new int[n];
    dp[0] = grid[0][0] == 0 ? 1 : 0;
    for (int j = 1; j < n; j++) {
        dp[j] = (grid[0][j] == 0) ? dp[j-1] : 0;
    }
    for (int i = 1; i < m; i++) {
        dp[0] = (grid[i][0] == 0) ? dp[0] : 0;
        for (int j = 1; j < n; j++) {
            dp[j] = (grid[i][j] == 0) ? dp[j] + dp[j-1] : 0;
        }
    }
    return dp[n-1];
}`}</CodeBlock>

        <Quiz
          kind="Recurrence check"
          question="In the rolling-row implementation above, on the line `dp[j] = dp[j] + dp[j-1]`, what does the right-hand `dp[j]` refer to at the moment the line executes?"
          options={[
            { label: "The cell directly to the left in the current row.", explanation: "That's dp[j-1], not dp[j]." },
            { label: "The cell directly above (row i-1, column j).", correct: true, explanation: "Right. We haven't overwritten dp[j] yet on this row, so it still holds the value computed during the previous row's sweep — that's the cell directly above. After the assignment, dp[j] becomes the current row's value." },
            { label: "The diagonal neighbor (row i-1, column j-1).", explanation: "That's not on the grid path for unique paths — the recurrence only uses up and left, not diagonal." },
            { label: "Always 1.", explanation: "Only the top row is all 1s. Once we're on row 1+, dp[j] holds whatever the previous row's sweep deposited there." },
          ]}
        />

        <Quiz
          kind="Variant check"
          question="A different problem: same right/down grid, but you want the MINIMUM weighted path sum where each cell has a cost. What's the recurrence?"
          options={[
            { label: "dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).", correct: true, explanation: "Right. To minimize total cost, take the cheaper of the two ways into the cell and add this cell's cost. Same shape as Unique Paths but min-of-two replaces sum-of-two — that's the classic transition from 'count paths' to 'min-cost path'." },
            { label: "dp[i][j] = grid[i][j] + dp[i-1][j] + dp[i][j-1].", explanation: "That sums both predecessor costs, which double-counts the path. We pick one of the two ways in, not both." },
            { label: "dp[i][j] = min(grid[i][j], dp[i-1][j], dp[i][j-1]).", explanation: "Mixes a cell value with accumulated path sums — the units don't match. We need to add this cell's cost, not min against it." },
            { label: "dp[i][j] = grid[i][j] · max(dp[i-1][j], dp[i][j-1]).", explanation: "Multiplication doesn't fit; we want sum of costs along a chosen path, not products." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · LCS ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="lcs" title="I can write LCS from memory" xp={25}>
      <section>
        <h2 id="lcs">Longest Common Subsequence — the 2D template</h2>

        <p>
          <strong>LC 1143 · Longest Common Subsequence.</strong> Given strings <code>A</code> and <code>B</code>,
          return the length of the longest sequence of characters that appears in both, in order, but not
          necessarily contiguously. <code>&quot;ABCBDAB&quot;</code> and <code>&quot;BDCAB&quot;</code> share{" "}
          <code>&quot;BCAB&quot;</code> and <code>&quot;BDAB&quot;</code>, both length 4 — so the answer is 4.
        </p>

        <p>
          The state is the prefix-vs-prefix shape: <code>dp[i][j]</code> = length of the LCS of the first{" "}
          <code>i</code> characters of <code>A</code> and the first <code>j</code> characters of <code>B</code>. The
          recurrence has two cases, both intuitive once you see them.
        </p>

        <CodeBlock lang="plain">{`dp[i][j] = LCS length for A[0..i) and B[0..j)

if A[i-1] == B[j-1]:
    // They match — pair them up, then solve the smaller subproblem
    dp[i][j] = 1 + dp[i-1][j-1]

else:
    // They don't match — drop one character from one side, take the better
    dp[i][j] = max(dp[i-1][j],   // drop A[i-1]
                   dp[i][j-1])   // drop B[j-1]

base: dp[0][*] = 0, dp[*][0] = 0
answer: dp[m][n]`}</CodeBlock>

        <Callout variant="insight" title="Why the indexing is offset by one">
          <p>
            <code>dp[i][j]</code> describes prefixes of <em>length</em> <code>i</code> and <code>j</code>, not
            characters at index <code>i, j</code>. So <code>dp[0][*]</code> and <code>dp[*][0]</code> describe an
            empty prefix on one side — the LCS of anything with an empty string is 0. That&apos;s why we get a
            free row and column of zeros to seed the recurrence, and why the comparison reads{" "}
            <code>A[i-1]</code> against <code>B[j-1]</code>.
          </p>
          <p>
            This off-by-one trick is universal in 2D string DP. Once you see it in LCS, you&apos;ll see it again in
            edit distance, in shortest common supersequence, in regex matching. Internalize it once.
          </p>
        </Callout>

        <h3>Java — straightforward 2D</h3>

        <CodeBlock lang="java">{`public int longestCommonSubsequence(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`}</CodeBlock>

        <p>
          Time: <code>O(m·n)</code>. Space: <code>O(m·n)</code>, which can be reduced to two rows or even one
          (with care, since the match branch reads the diagonal and we&apos;d need to save that value before
          overwriting it). For an interview, the 2D version above is what you write first; the space-opt is the
          follow-up.
        </p>

        <h3>Trace it on a small example</h3>

        <p>
          Let <code>A = &quot;abcde&quot;</code> and <code>B = &quot;ace&quot;</code>. The LCS is{" "}
          <code>&quot;ace&quot;</code> with length 3. Watch the table fill:
        </p>

        <CodeBlock lang="plain">{`           ""    a    c    e
       +----+----+----+----+
   ""  |  0 |  0 |  0 |  0 |
       +----+----+----+----+
   a   |  0 |  1 |  1 |  1 |   ← a==a → diag+1
       +----+----+----+----+
   b   |  0 |  1 |  1 |  1 |   ← max(up, left) since b mismatches
       +----+----+----+----+
   c   |  0 |  1 |  2 |  2 |   ← c==c → diag+1 = 1+1 = 2
       +----+----+----+----+
   d   |  0 |  1 |  2 |  2 |
       +----+----+----+----+
   e   |  0 |  1 |  2 |  3 |   ← e==e → diag+1 = 2+1 = 3   answer
       +----+----+----+----+`}</CodeBlock>

        <p>
          Notice the &quot;staircase of matches&quot; running down the diagonal: <code>a→a</code>,{" "}
          <code>c→c</code>, <code>e→e</code>. Every match bumps the value by exactly 1 over the diagonal predecessor,
          and every mismatch is the max of up and left. If you ever want to <em>recover</em> the LCS string itself
          (not just its length), you walk this table backwards from <code>dp[m][n]</code>: at each match step go
          diagonal and emit the character; otherwise step in the direction of the larger neighbor.
        </p>

        <h3>Why LCS matters</h3>

        <p>
          LCS is foundational because it&apos;s the abstract heart of <strong>diff</strong>. When{" "}
          <code>git diff</code> shows you the differences between two file versions, it&apos;s computing the LCS of
          the two line sequences and reporting everything <em>not</em> on the LCS as inserts or deletes. The same
          algorithm shows up in:
        </p>

        <ul>
          <li>
            <strong>Bioinformatics.</strong> Aligning DNA/RNA/protein sequences. The Needleman-Wunsch algorithm
            (1970) is LCS with weighted match/mismatch costs.
          </li>
          <li>
            <strong>Spell checkers and autocomplete.</strong> Edit distance — which we&apos;ll do next — builds
            directly on LCS&apos;s skeleton.
          </li>
          <li>
            <strong>File-version reconciliation.</strong> Three-way merges, patch tools, version control internals.
          </li>
          <li>
            <strong>Plagiarism detection.</strong> What two documents share, in order.
          </li>
        </ul>

        <p>
          So when you write LCS, you&apos;re writing the algorithm that powers <code>git</code>, the human genome
          project, and Microsoft Word&apos;s squiggly red lines. Worth memorizing.
        </p>

        <Quiz
          kind="LCS check"
          question="LCS of `&quot;ABAZDC&quot;` and `&quot;BACBAD&quot;` is what length?"
          options={[
            { label: "3.", explanation: "There's a 4-length common subsequence — keep looking." },
            { label: "4.", correct: true, explanation: "Right. `ABAD` is a common subsequence of length 4 (A(0)B(1)A(2)D(4) in ABAZDC; A(1)B(3)A(4)D(5) in BACBAD). The full table fills to dp[6][6] = 4. If you trace it, you can see the staircase of matches A→A, B→B, A→A, D→D running down the diagonal." },
            { label: "5.", explanation: "Too high. Try writing out a candidate of length 5 — you'll find it doesn't preserve order in one of the strings." },
            { label: "6.", explanation: "Length 6 would mean one string is a subsequence of the other, which isn't true here." },
          ]}
        />

        <Quiz
          kind="LCS check"
          question="What's the recurrence for LCS when A[i-1] != B[j-1]?"
          options={[
            { label: "dp[i][j] = dp[i-1][j-1].", explanation: "That ignores both characters and skips work — but the LCS could still extend by dropping just one of them. We need the max of the two single-drop options." },
            { label: "dp[i][j] = max(dp[i-1][j], dp[i][j-1]).", correct: true, explanation: "Right. Since the last characters don't match, at least one of them isn't in the LCS — drop it. We don't know which, so try both: drop A[i-1] gives dp[i-1][j], drop B[j-1] gives dp[i][j-1]. Take the better." },
            { label: "dp[i][j] = 1 + max(dp[i-1][j], dp[i][j-1]).", explanation: "The +1 is only for matches. When characters mismatch, no character is added — just transition." },
            { label: "dp[i][j] = dp[i-1][j] + dp[i][j-1].", explanation: "That's the unique-paths recurrence (count paths). LCS is a max problem, not a count problem." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Edit Distance ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="edit-distance" title="I can derive the three Edit Distance transitions" xp={30}>
      <section>
        <h2 id="edit-distance">Edit Distance — the LCS shape with three operations</h2>

        <p>
          <strong>LC 72 · Edit Distance (Levenshtein distance).</strong> Given strings <code>A</code> and{" "}
          <code>B</code>, find the minimum number of single-character operations to transform <code>A</code> into{" "}
          <code>B</code>. The operations are <strong>insert</strong>, <strong>delete</strong>, and{" "}
          <strong>replace</strong>, each with cost 1.
        </p>

        <p>
          State is the same prefix-vs-prefix shape as LCS: <code>dp[i][j]</code> = minimum edits to turn{" "}
          <code>A[0..i)</code> into <code>B[0..j)</code>. The recurrence has a match-or-don&apos;t-match flavor too,
          but the &quot;don&apos;t match&quot; branch now has three children — one per operation.
        </p>

        <Mermaid chart={editDistanceShape} />

        <CodeBlock lang="plain">{`dp[i][j] = min edits to turn A[0..i) into B[0..j)

if A[i-1] == B[j-1]:
    dp[i][j] = dp[i-1][j-1]                         // free — characters already match
else:
    dp[i][j] = 1 + min(
        dp[i-1][j],     // delete A[i-1]:   line A's pointer up by one
        dp[i][j-1],     // insert B[j-1]:   line B's pointer up by one
        dp[i-1][j-1]    // replace A[i-1] with B[j-1]: both pointers up
    )

base cases:
    dp[0][j] = j   (turn empty into B[0..j) takes j inserts)
    dp[i][0] = i   (turn A[0..i) into empty takes i deletes)

answer: dp[m][n]`}</CodeBlock>

        <Callout variant="insight" title="Each transition corresponds to a real operation">
          <p>
            This is what makes edit distance such an elegant DP: the three table moves correspond to the three
            edit operations one-for-one. <strong>dp[i-1][j] + 1</strong>: we used <code>dp[i-1][j]</code> edits
            to turn <code>A[0..i-1)</code> into <code>B[0..j)</code>, and now we delete <code>A[i-1]</code> for a
            cost of 1. <strong>dp[i][j-1] + 1</strong>: we&apos;re at <code>B[0..j-1)</code>, and we insert{" "}
            <code>B[j-1]</code> for cost 1. <strong>dp[i-1][j-1] + 1</strong>: we used a replace.
          </p>
          <p>
            When you can map your DP transitions onto concrete operations like this, your reasoning is much harder
            to mess up — the recurrence just <em>has</em> to be that shape.
          </p>
        </Callout>

        <h3>Java — clean 2D</h3>

        <CodeBlock lang="java">{`public int minDistance(String a, String b) {
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

        <p>
          Time and space are <code>O(m·n)</code>. Like LCS, this can be space-optimized to two rows (or one row
          plus a temporary for the diagonal); 2D first, then the optimization once you have the recurrence right.
        </p>

        <h3>Worked example: &quot;horse&quot; → &quot;ros&quot;</h3>

        <p>
          Three edits: <code>horse</code> → <code>rorse</code> (replace h→r) → <code>rose</code> (delete r) →{" "}
          <code>ros</code> (delete e). The table:
        </p>

        <CodeBlock lang="plain">{`         ""   r    o    s
       +---+---+---+---+
  ""   | 0 | 1 | 2 | 3 |
       +---+---+---+---+
   h   | 1 | 1 | 2 | 3 |   ← h vs r: replace, 1 + dp[0][0] = 1
       +---+---+---+---+
   o   | 2 | 2 | 1 | 2 |   ← o==o: free, dp[1][1] = 1
       +---+---+---+---+
   r   | 3 | 2 | 2 | 2 |
       +---+---+---+---+
   s   | 4 | 3 | 3 | 2 |
       +---+---+---+---+
   e   | 5 | 4 | 4 | 3 |   ← answer: dp[5][3] = 3
       +---+---+---+---+`}</CodeBlock>

        <p>
          Reading the table back tells you not just the cost (3) but the actual edit script: walk from{" "}
          <code>dp[5][3]</code> backwards, choosing the predecessor that justified the current cell&apos;s value, and
          emit the operation that took you there.
        </p>

        <ClassifyChallenge
          title="Which dp transition is which edit operation?"
          prompt="For each transition in edit distance, classify which edit operation it represents. (Recall: dp[i][j] = min edits to turn A[0..i) into B[0..j).)"
          buckets={[
            { id: "delete", label: "Delete A[i-1]", color: "rose" },
            { id: "insert", label: "Insert B[j-1]", color: "amber" },
            { id: "replace", label: "Replace A[i-1] with B[j-1]", color: "indigo" },
            { id: "free", label: "Match (no cost)", color: "emerald" },
          ]}
          items={[
            { id: "1", label: "dp[i][j] = 1 + dp[i-1][j]", answer: "delete", explanation: "We took dp[i-1][j] edits to turn A[0..i-1) into B[0..j), then deleted A[i-1]. The B-pointer didn't move; the A-pointer did. That's a delete." },
            { id: "2", label: "dp[i][j] = 1 + dp[i][j-1]", answer: "insert", explanation: "We took dp[i][j-1] edits to turn A[0..i) into B[0..j-1), then inserted B[j-1] at the end. The A-pointer didn't move; the B-pointer did. That's an insert." },
            { id: "3", label: "dp[i][j] = 1 + dp[i-1][j-1] (when A[i-1] != B[j-1])", answer: "replace", explanation: "Both pointers moved by one, but the characters differ — we paid 1 to turn A[i-1] into B[j-1]. That's a replace." },
            { id: "4", label: "dp[i][j] = dp[i-1][j-1] (when A[i-1] == B[j-1])", answer: "free", explanation: "Characters already match. Both pointers advance, cost is 0. No edit operation was needed for this character pair." },
          ]}
        />

        <Callout variant="info" title="Variants you'll meet">
          <p>
            <strong>One Edit Distance (LC 161):</strong> &quot;is the distance exactly 1?&quot; Doesn&apos;t need
            full DP — a linear scan with a single mismatch is enough. Worth knowing the shortcut.
          </p>
          <p>
            <strong>Weighted edit distance:</strong> change the +1 to operation-specific costs. The DP shape is
            identical; only the constants change. Used in spell-correction systems where, e.g., adjacent-key typos
            cost less than far-key swaps.
          </p>
          <p>
            <strong>Damerau-Levenshtein:</strong> add a fourth operation, &quot;swap adjacent characters,&quot; for
            <code>O(1)</code> cost. The recurrence gets one extra branch reading <code>dp[i-2][j-2]</code> — same
            shape, longer formula.
          </p>
        </Callout>

        <Quiz
          kind="Edit-distance check"
          question="What's the edit distance from `&quot;intention&quot;` to `&quot;execution&quot;`?"
          options={[
            { label: "3.", explanation: "Try the substitutions: i→e, n→x, t→e, n→c, then keep `ution`. That's 4 changes plus a delete-or-insert? Walk the table." },
            { label: "5.", correct: true, explanation: "Right. The famous textbook example. One canonical sequence: delete `i`, replace `n→e`, replace `t→x`, replace `n→c`, insert `u` — 5 edits. The full DP table confirms it. (`intention` → `ntention` → `etention` → `exention` → `exection` → `execution`.)" },
            { label: "6.", explanation: "Close, but the optimal is 5. There are several length-5 edit scripts; the table just confirms the minimum." },
            { label: "9.", explanation: "That'd be the cost of fully replacing every character. Edit distance always finds a shorter path when characters can be reused." },
          ]}
        />

        <Quiz
          kind="Edit-distance check"
          question="Why don't we need a special case for when A and B have very different lengths?"
          options={[
            { label: "We do — you have to handle it explicitly.", explanation: "We don't. The base cases dp[i][0] = i and dp[0][j] = j handle arbitrary length differences automatically." },
            { label: "The base cases dp[i][0] = i and dp[0][j] = j absorb the length difference for free.", correct: true, explanation: "Right. Turning an empty string into B[0..j) takes exactly j inserts. Turning A[0..i) into empty takes i deletes. So the boundary already encodes 'pure inserts' and 'pure deletes' — the recurrence handles the rest. This is why the DP works elegantly for any string lengths." },
            { label: "The recurrence has a special branch for skipped characters.", explanation: "There's no explicit skip branch. Insert and delete already cover the asymmetric cases." },
            { label: "Java's `String` handles it internally.", explanation: "Standard library types don't change DP correctness — the algorithm itself handles it via the boundary." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · 0/1 Knapsack ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="knapsack" title="I can solve 0/1 Knapsack and explain the high→low sweep" xp={30}>
      <section>
        <h2 id="knapsack">0/1 Knapsack — items × capacity</h2>

        <p>
          You have <code>N</code> items, each with a weight <code>wt[i]</code> and a value <code>val[i]</code>, and
          a knapsack of capacity <code>W</code>. Pick a subset that maximizes total value without exceeding the
          weight limit. <strong>0/1</strong> means each item is either taken or not — no fractional pieces, no
          duplicates.
        </p>

        <p>
          The state is two-axis: we&apos;ve seen items <code>0..i</code>, and there&apos;s a residual capacity{" "}
          <code>w</code>. Define <code>dp[i][w]</code> = maximum value achievable using the first <code>i</code>{" "}
          items with capacity <code>w</code>. The recurrence has a take-or-skip flavor:
        </p>

        <CodeBlock lang="plain">{`dp[i][w] = max value using first i items with capacity w

For item i (1-indexed; weight wt[i-1], value val[i-1]):

    skip item i:                  dp[i-1][w]
    take item i (if it fits):     dp[i-1][w - wt[i-1]] + val[i-1]

dp[i][w] = max(skip, take)

base: dp[0][*] = 0  (no items → no value)
answer: dp[N][W]`}</CodeBlock>

        <h3>Java — straightforward 2D</h3>

        <CodeBlock lang="java">{`public int knapsack01(int[] wt, int[] val, int W) {
    int n = wt.length;
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++) {
        int w_i = wt[i - 1], v_i = val[i - 1];
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];                                 // skip
            if (w_i <= w) {
                dp[i][w] = Math.max(dp[i][w],
                                    dp[i - 1][w - w_i] + v_i);       // take
            }
        }
    }
    return dp[n][W];
}`}</CodeBlock>

        <p>
          Time: <code>O(N·W)</code>. Space: <code>O(N·W)</code>. Note this is{" "}
          <strong>pseudo-polynomial</strong> — it&apos;s polynomial in <code>N</code> and <code>W</code>, but{" "}
          <code>W</code> can be exponential in the bit length of the input. Knapsack is NP-hard in general; this DP
          works because <code>W</code> is given as a small integer in practice.
        </p>

        <h3>Space optimization — collapse to 1D</h3>

        <p>
          <code>dp[i][w]</code> only reads from row <code>i-1</code>, so we can keep just one rolling row{" "}
          <code>dp[w]</code>. But there&apos;s a subtle ordering trap: <strong>you must sweep <code>w</code> from
          high to low</strong>.
        </p>

        <Mermaid chart={knapsackDirection} />

        <CodeBlock lang="java">{`public int knapsack01(int[] wt, int[] val, int W) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < wt.length; i++) {
        // Sweep capacity from W down to wt[i].
        // Going high → low ensures dp[w - wt[i]] is the OLD row's value
        // (item i not yet taken), so we can't accidentally take item i twice.
        for (int w = W; w >= wt[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
        }
    }
    return dp[W];
}`}</CodeBlock>

        <Callout variant="warn" title="Why high → low for 0/1, low → high for unbounded">
          <p>
            In the 1D rolling-array form, <code>dp[w]</code> serves double duty: before the update it&apos;s the
            old row&apos;s value (item <code>i</code> not yet considered); after the update it&apos;s the new row&apos;s
            value. The sweep direction decides which version of <code>dp[w - wt[i]]</code> we read.
          </p>
          <p>
            <strong>0/1 (each item once)</strong> → high to low. Reading{" "}
            <code>dp[w - wt[i]]</code> from <code>w-wt[i] &lt; w</code> means we read a slot we{" "}
            <em>haven&apos;t touched yet</em> on this row — the old row&apos;s value, where item <code>i</code> was
            not yet present. Correct.
          </p>
          <p>
            <strong>Unbounded (each item any number of times — Coin Change shape)</strong> → low to high. Reading{" "}
            <code>dp[w - wt[i]]</code> means we read a slot we <em>just updated</em> with item <code>i</code>{" "}
            already counted, which is exactly what &quot;take item i again&quot; needs. Also correct — but
            different problem.
          </p>
          <p>
            One direction = take an item once. Other direction = take it as many times as you like. Same code,
            opposite semantics. This is one of the most elegant tricks in DP and worth burning into memory.
          </p>
        </Callout>

        <h3>Sibling: Coin Change as unbounded knapsack</h3>

        <p>
          You saw Coin Change in the 1D module — &quot;minimum coins to make amount A.&quot; Note the shape is
          identical to 0/1 knapsack, with two differences:
        </p>

        <ul>
          <li>It&apos;s unbounded: each coin denomination can be used any number of times.</li>
          <li>It&apos;s a min, not a max.</li>
        </ul>

        <p>
          Watch what changes — only the sweep direction and the operator:
        </p>

        <CodeBlock lang="java">{`public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    java.util.Arrays.fill(dp, amount + 1);   // sentinel for "impossible"
    dp[0] = 0;
    for (int c : coins) {
        // LOW → HIGH: dp[w - c] should reflect "after taking coin c already"
        for (int w = c; w <= amount; w++) {
            dp[w] = Math.min(dp[w], dp[w - c] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`}</CodeBlock>

        <p>
          Same skeleton as 0/1 knapsack&apos;s 1D form, but two changes: <code>min</code> instead of{" "}
          <code>max</code>, and <code>w</code> sweeps low to high instead of high to low. The whole knapsack
          family — bounded, 0/1, unbounded, subset-sum, partition-equal-subset, target-sum — is variations on this
          one shape with different operators and different sweep directions.
        </p>

        <Callout variant="insight" title="The knapsack family is one DP wearing different costumes">
          <p>
            <strong>Subset Sum (LC 416 partition):</strong> dp[i][w] = boolean &quot;can we make weight w with
            first i items.&quot; Recurrence: <code>dp[i][w] = dp[i-1][w] || dp[i-1][w-wt[i]]</code>. 1D form
            sweeps high to low.
          </p>
          <p>
            <strong>Target Sum (LC 494):</strong> reduce to subset sum (each ± choice = pick that subset to add).
          </p>
          <p>
            <strong>Number of ways instead of yes/no:</strong> swap the OR for a sum:{" "}
            <code>dp[i][w] = dp[i-1][w] + dp[i-1][w-wt[i]]</code>. Same 0/1 sweep direction.
          </p>
          <p>
            Once you internalize knapsack, you&apos;ve internalized half a dozen LeetCode problems.
          </p>
        </Callout>

        <Quiz
          kind="Knapsack check"
          question="In the 1D 0/1 knapsack code, what bug appears if you accidentally sweep w from low to high instead of high to low?"
          options={[
            { label: "Off-by-one error.", explanation: "It's not an off-by-one — the loop bounds are fine. The bug is semantic: the answer is wrong because items get reused." },
            { label: "Items can be taken more than once, turning it into the unbounded version.", correct: true, explanation: "Right. With low→high, when you read dp[w - wt[i]] you're reading a slot that was already updated with item i, so item i can be 'taken again' from that slot. The DP silently solves unbounded knapsack instead of 0/1. The numerical answer is then wrong (usually too large)." },
            { label: "ArrayIndexOutOfBoundsException.", explanation: "Indices are still valid — the iteration order doesn't change which array slots exist." },
            { label: "Time complexity becomes O(N·W²).", explanation: "Time is unchanged at O(N·W). The bug is correctness, not performance." },
          ]}
        />

        <Quiz
          kind="Knapsack check"
          question="Items with (weight, value) = (2,3), (3,4), (4,5), (5,6); capacity W = 5. What's the optimal value?"
          options={[
            { label: "5.", explanation: "Just one item — but we can do better by combining." },
            { label: "6.", explanation: "Take item 4 alone — but two smaller items give more." },
            { label: "7.", correct: true, explanation: "Right. Take items 1 and 2: weights 2+3=5 (fits exactly), values 3+4=7. No combination of two items fits with higher total value, and no single item beats 6. So 7 is optimal." },
            { label: "9.", explanation: "Items 1 and 3 weigh 2+4=6, which exceeds capacity 5. Items 2 and 3 weigh 3+4=7, also over. 9 isn't achievable." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Cheat sheet & recap ───────────────── */}
      <Checkpoint moduleSlug="dp-2d" id="cheatsheet" title="I can recognize which 2D DP shape fits a problem" xp={25}>
      <section>
        <h2 id="cheatsheet">2D DP — the recognition cheat sheet</h2>

        <p>
          Now that you&apos;ve seen four canonical 2D DPs (Unique Paths, LCS, Edit Distance, 0/1 Knapsack), the
          pattern-matching skill is to look at a new problem and say <em>which family it&apos;s in</em>. Most 2D
          DPs you&apos;ll meet fit one of four shapes:
        </p>

        <CodeBlock lang="plain">{`┌──────────────────────┬────────────────────────────────┬────────────────────┐
│  Shape               │  State                         │  Canonical example │
├──────────────────────┼────────────────────────────────┼────────────────────┤
│  Two-string          │  dp[i][j] over prefixes        │  LCS, Edit Dist.   │
│                      │  of two sequences              │                    │
├──────────────────────┼────────────────────────────────┼────────────────────┤
│  Grid                │  dp[i][j] = literal grid pos   │  Unique Paths,     │
│                      │  with allowed-move recurrence  │  Min Path Sum      │
├──────────────────────┼────────────────────────────────┼────────────────────┤
│  Knapsack-family     │  dp[i][capacity_or_resource]   │  0/1 Knapsack,     │
│                      │  with take-or-skip branch      │  Subset Sum,       │
│                      │                                │  Coin Change       │
├──────────────────────┼────────────────────────────────┼────────────────────┤
│  Interval            │  dp[i][j] = answer over the    │  Burst Balloons,   │
│  (next module)       │  subarray [i..j]               │  Matrix Chain Mult │
└──────────────────────┴────────────────────────────────┴────────────────────┘`}</CodeBlock>

        <h3>Recognition tells</h3>

        <ul>
          <li>
            <strong>&quot;Two strings (or sequences)&quot;</strong> in the problem statement → Two-string family.
            The state shape is always &quot;dp over prefixes,&quot; the recurrence always has a
            match-or-don&apos;t-match branch, and the off-by-one trick (dp index = prefix length, not character
            index) is universal.
          </li>
          <li>
            <strong>&quot;Grid&quot; or &quot;m × n&quot;</strong> with constrained moves → Grid family. The state
            is the position; the recurrence is the move rule run backwards. Always check the boundary first.
          </li>
          <li>
            <strong>&quot;Pick a subset to maximize/minimize value subject to a budget&quot;</strong> → Knapsack
            family. The state is (item index, remaining budget). The 1D space-optimization trick is universal but
            the sweep direction depends on whether items are 0/1 or unbounded.
          </li>
          <li>
            <strong>&quot;Best answer over the subarray [i..j]&quot;</strong> → Interval family. We&apos;ll cover
            this in module 29 — these often need a third loop over the &quot;split point&quot; inside the
            subarray, putting them at <code>O(n³)</code>.
          </li>
        </ul>

        <h3>The shared template</h3>

        <p>
          Every 2D DP follows the same workflow. When you sit down at a new problem, run through it in order:
        </p>

        <CodeBlock lang="plain">{`1. Define the state.
   "dp[i][j] = ___, the answer to the smaller problem characterized by (i, j)"
   If you can't write this in a sentence, you don't have a DP yet.

2. Identify the recurrence.
   What does dp[i][j] depend on?
   Usually one of: dp[i-1][j], dp[i][j-1], dp[i-1][j-1].
   For each predecessor, what action takes you from there to (i, j)?

3. Write the base cases.
   What's dp[0][*]? What's dp[*][0]?
   These are usually trivial — empty input or boundary edge.

4. Determine the iteration order.
   Each cell must be filled AFTER its predecessors. For all four
   patterns above, "row by row, left to right" works.

5. Read off the answer.
   Often dp[m][n], sometimes max over the table, sometimes
   a specific cell. Decide explicitly.

6. (Optional) Space-optimize.
   If dp[i][*] only reads from row i-1, collapse to a single row.
   Watch the sweep direction — it's load-bearing for 0/1 vs unbounded.`}</CodeBlock>

        <ClassifyChallenge
          title="Match the problem to the 2D DP shape"
          prompt="For each problem, pick the family that fits its natural state shape."
          buckets={[
            { id: "two-string", label: "Two-string", color: "indigo" },
            { id: "grid", label: "Grid", color: "sky" },
            { id: "knapsack", label: "Knapsack-family", color: "emerald" },
            { id: "interval", label: "Interval (preview)", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Minimum number of coins to make amount N from a fixed set of denominations.", answer: "knapsack", explanation: "Items × capacity = denominations × target amount. Unbounded variant — sweep low to high in the 1D form. Same shape as knapsack, min instead of max." },
            { id: "2", label: "Robot in an m×n grid, each cell has a cost; find minimum-cost path top-left → bottom-right.", answer: "grid", explanation: "Literal grid position. Recurrence: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Same skeleton as Unique Paths with min replacing sum." },
            { id: "3", label: "Shortest common supersequence of two strings.", answer: "two-string", explanation: "Two strings → dp[i][j] over prefixes. Recurrence has a match-or-mismatch shape; closely related to LCS (the SCS length is m + n − LCS length)." },
            { id: "4", label: "Burst balloons LC 312 — pick burst order to maximize total coins.", answer: "interval", explanation: "Best answer over the subarray [i..j], with a third loop over the 'last balloon to burst.' Classic interval DP — full coverage in dp-advanced." },
            { id: "5", label: "Partition Equal Subset Sum LC 416 — can we split nums into two equal-sum subsets?", answer: "knapsack", explanation: "Reduces to: 'is there a subset summing to total/2?' That's subset-sum, the boolean variant of 0/1 knapsack." },
            { id: "6", label: "Regex matching with `.` and `*` (LC 10).", answer: "two-string", explanation: "String × pattern → dp[i][j] over prefixes. The match-or-don't-match recurrence is more elaborate (`*` can match zero or more), but the skeleton is two-string." },
            { id: "7", label: "Dungeon game — minimum starting health to walk top-left → bottom-right surviving every cell.", answer: "grid", explanation: "Grid position with allowed moves. The twist: you fill from bottom-right backwards because the constraint is forward-looking. Still grid family." },
            { id: "8", label: "Matrix chain multiplication — minimum scalar multiplications to multiply a chain of matrices.", answer: "interval", explanation: "dp[i][j] = best cost to multiply matrices i..j, with a third loop over the split point k. Canonical interval DP — coming in dp-advanced." },
          ]}
        />

        <h3>Anti-patterns and gotchas to remember</h3>

        <ul>
          <li>
            <strong>Off-by-one in two-string DPs.</strong> When <code>dp[i][j]</code> indexes by{" "}
            <em>prefix length</em>, you compare <code>A.charAt(i-1)</code> to <code>B.charAt(j-1)</code>, not{" "}
            <code>A.charAt(i)</code> to <code>B.charAt(j)</code>. Get this wrong and the table looks plausible but
            the answer is off by one.
          </li>
          <li>
            <strong>Wrong sweep direction in 1D knapsack.</strong> 0/1 = high to low. Unbounded = low to high. Get
            this wrong and 0/1 silently becomes unbounded — your answer is too large and you may not notice on
            small tests.
          </li>
          <li>
            <strong>Missing boundary in grid DP with obstacles.</strong> An obstacle in the top row should{" "}
            <em>terminate</em> all 1s after it, not propagate them. Initialize the boundary explicitly with the
            obstacle check.
          </li>
          <li>
            <strong>Forgetting that &quot;empty prefix&quot; is a valid base case.</strong> In LCS and edit distance,
            <code>dp[0][*]</code> and <code>dp[*][0]</code> describe an empty string on one side; they have to be
            seeded correctly or the recurrence reads garbage.
          </li>
          <li>
            <strong>Trying to space-optimize before the 2D version is correct.</strong> Always write the full 2D
            version first, run it, then collapse. Trying to write the 1D version directly is the single fastest way
            to introduce a bug under interview pressure.
          </li>
        </ul>

        <PartRecap
          title="2D DP — what to take with you"
          gist="The state is two-axis. The recurrence reaches into a constant number of neighbors. The same six-step recipe works for all four families."
          points={[
            { takeaway: "Two-string DP uses dp[i][j] over prefix lengths — and the off-by-one is universal.", detail: "dp[i][j] describes prefixes A[0..i) and B[0..j). The character comparison reads A.charAt(i-1) and B.charAt(j-1). LCS and edit distance share this skeleton — only the recurrence differs (one branch vs three)." },
            { takeaway: "Grid DP is just the move rule run backwards.", detail: "Whatever moves are allowed (right/down for unique paths, up/down/left/right for some variants), the recurrence is 'dp[i][j] = combine of dp[predecessor cells].' Combine = sum (count), min (cost), max (reward) depending on the question." },
            { takeaway: "Knapsack is items × capacity, with take-or-skip.", detail: "dp[i][w] = best value using first i items and capacity w. 1D collapse is universal but the sweep direction matters: 0/1 is high→low, unbounded is low→high. Same code, opposite semantics." },
            { takeaway: "Edit distance maps three table moves to three real edit operations.", detail: "dp[i-1][j] + 1 = delete; dp[i][j-1] + 1 = insert; dp[i-1][j-1] + 1 = replace; dp[i-1][j-1] (no +1) = free match. When transitions correspond to concrete operations, the recurrence almost has to be the right shape." },
            { takeaway: "Always write the 2D version first, then space-optimize.", detail: "1D rolling-row optimizations are easy to get subtly wrong. Confidence comes from a working 2D solution; space-opt is a follow-up. 'I'd write 2D first to get it right, then collapse to 1D' is also a great thing to say in an interview." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30 border border-fuchsia-200 dark:border-fuchsia-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
            Next up · Module 29 — Advanced DP: intervals, trees, bitmask
          </h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            You&apos;ve handled the four 2D DP shapes that account for most LeetCode DP questions. Module 29 covers
            the harder cousins: interval DP (state is a subarray <code>[i..j]</code> with a third &quot;split
            point&quot; loop), tree DP (state is &quot;subtree rooted at <code>v</code>&quot; with two flavors per
            node), and bitmask DP (state encodes a subset directly into an integer). After that, you&apos;ll have
            seen every DP family that shows up in interviews.
          </p>
          <Link
            href="/courses/dsa/modules/dp-advanced"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Advanced DP →
          </Link>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
