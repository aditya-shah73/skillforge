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
  { id: "template", title: "The 1D template — 'decision at index i'" },
  { id: "coin-change", title: "Coin Change — unbounded choice" },
  { id: "word-break", title: "Word Break — segmentation DP" },
  { id: "lis", title: "Longest Increasing Subsequence — the 'ending at i' anchor" },
  { id: "decode-ways", title: "Decode Ways — Climbing Stairs with validation" },
  { id: "cheatsheet", title: "Recognizing 1D DP — the cheat sheet" },
];

export default function Dp1dModule() {
  const mod = getModuleBySlug("dp-1d")!;

  // The "decision at index i" mental model
  const decisionShape = `
flowchart LR
    subgraph PAST["Already solved · dp[0..i-1]"]
        direction LR
        D0["dp[0]"]
        D1["dp[1]"]
        D2["dp[...]"]
        D3["dp[i-1]"]
    end
    subgraph NOW["At index i · make ONE decision"]
        direction TB
        C1["Choice A:<br/>combine with dp[i-1]"]
        C2["Choice B:<br/>combine with dp[i-2]"]
        C3["Choice C:<br/>look back further"]
    end
    PAST --> NOW
    NOW --> R["dp[i] = best (or sum, or OR)<br/>over the valid choices"]
    style PAST fill:#fef3c7,color:#000,stroke:#d97706
    style NOW fill:#fce7f3,color:#000,stroke:#db2777
    style R fill:#dcfce7,color:#000,stroke:#16a34a
  `.trim();

  // Coin Change DP table fill, coins={1,3,4}, target=6
  const coinTrace = `
flowchart TB
    subgraph T["dp[a] = min coins to make amount a · coins {1,3,4}"]
        direction LR
        A0["dp[0]=0"]
        A1["dp[1]=1<br/>(use 1)"]
        A2["dp[2]=2<br/>(1+1)"]
        A3["dp[3]=1<br/>(use 3)"]
        A4["dp[4]=1<br/>(use 4)"]
        A5["dp[5]=2<br/>(1+4 or 4+1)"]
        A6["dp[6]=2<br/>(3+3)"]
    end
    subgraph G["Greedy from 6, take largest first"]
        direction LR
        G1["Take 4 → 2 left"]
        G2["Take 1 → 1 left"]
        G3["Take 1 → 0"]
        G4["Total: 3 coins (WRONG)"]
    end
    T --> G
    style T fill:#dbeafe,color:#000,stroke:#2563eb
    style G fill:#fee2e2,color:#000,stroke:#dc2626
    style A6 fill:#86efac,color:#000,stroke:#16a34a
    style G4 fill:#fca5a5,color:#000,stroke:#dc2626
  `.trim();

  // LIS dp[i] = LIS ending at i
  const lisTrace = `
flowchart TB
    subgraph A["nums = [10, 9, 2, 5, 3, 7, 101, 18]"]
        direction LR
        N0["10<br/>i=0"]
        N1["9<br/>i=1"]
        N2["2<br/>i=2"]
        N3["5<br/>i=3"]
        N4["3<br/>i=4"]
        N5["7<br/>i=5"]
        N6["101<br/>i=6"]
        N7["18<br/>i=7"]
    end
    subgraph D["dp[i] = LIS ending at i"]
        direction LR
        E0["dp[0]=1<br/>{10}"]
        E1["dp[1]=1<br/>{9}"]
        E2["dp[2]=1<br/>{2}"]
        E3["dp[3]=2<br/>{2,5}"]
        E4["dp[4]=2<br/>{2,3}"]
        E5["dp[5]=3<br/>{2,5,7} or {2,3,7}"]
        E6["dp[6]=4<br/>{2,3,7,101}"]
        E7["dp[7]=4<br/>{2,3,7,18}"]
    end
    A --> D
    D --> ANS["answer = max(dp) = 4"]
    style A fill:#fef3c7,color:#000,stroke:#d97706
    style D fill:#dbeafe,color:#000,stroke:#2563eb
    style ANS fill:#dcfce7,color:#000,stroke:#16a34a
    style E6 fill:#86efac,color:#000,stroke:#16a34a
  `.trim();

  // Decode Ways recurrence
  const decodeTrace = `
flowchart TB
    subgraph S["s = '226'"]
        direction LR
        I0["s[0]='2'"]
        I1["s[1]='2'"]
        I2["s[2]='6'"]
    end
    subgraph DP["dp[i] = ways to decode s[0..i)"]
        direction LR
        B0["dp[0]=1<br/>(empty)"]
        B1["dp[1]=1<br/>'2'"]
        B2["dp[2]=2<br/>'2','2' or '22'"]
        B3["dp[3]=3<br/>'2','2','6'<br/>'22','6'<br/>'2','26'"]
    end
    S --> DP
    DP --> R["At i: add dp[i-1] if s[i-1] is 1-9<br/>add dp[i-2] if s[i-2..i] is 10-26"]
    style S fill:#fef3c7,color:#000,stroke:#d97706
    style DP fill:#dbeafe,color:#000,stroke:#2563eb
    style R fill:#fce7f3,color:#000,stroke:#db2777
    style B3 fill:#86efac,color:#000,stroke:#16a34a
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="dp-1d" />
      <ModuleProgress moduleSlug="dp-1d" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 7 · Module 33 · Dynamic Programming
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · the linear-state DP workhorse</p>
      </div>

      {/* ───────────────── Part 1 · Template ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="template" title="I see the 'decision at index i' shape" xp={20}>
      <section>
        <h2 id="template">The 1D template — &quot;decision at index i&quot;</h2>

        <p>
          Every 1D DP problem you&apos;ll see in this module fits one mental shape. You&apos;re scanning
          left to right through a sequence — an array, a string, a list of choices. At each index{" "}
          <code>i</code>, you make <em>one local decision</em>: take or skip, include in a run, match a
          dictionary word ending here, pair with the previous character. The key claim of dynamic
          programming: <strong>everything you need from the past is already summarized in{" "}
          <code>dp[0..i-1]</code></strong> — you don&apos;t have to look at the original input again,
          just the table.
        </p>

        <Mermaid chart={decisionShape} />

        <h3>The generic recurrence shape</h3>

        <p>
          Almost every 1D DP problem fits one of two flavors of <code>dp[i]</code>:
        </p>

        <ul>
          <li><strong>&quot;First i elements&quot;</strong> — <code>dp[i]</code> is the answer for the prefix <code>a[0..i)</code>. Coin Change (with amount as the &quot;index&quot;), Word Break, Decode Ways. The recurrence asks: &quot;given that I&apos;ve solved every smaller prefix, how do I extend?&quot;</li>
          <li><strong>&quot;Ending at i&quot;</strong> — <code>dp[i]</code> is the answer for sub-solutions that <em>must include</em> <code>a[i]</code>. LIS, Maximum Subarray, House Robber (with a small twist). This anchor is what makes the recurrence decompose; you&apos;ll see why in the LIS section.</li>
        </ul>

        <p>
          Whichever flavor, the recurrence has the form:
        </p>

        <CodeBlock lang="plain">{`dp[i] = f( dp[i-1], dp[i-2], ..., a[i] )

where f is one of:
    min/max  — optimization problems
    sum/+    — counting problems
    OR/AND   — boolean (reachability) problems`}</CodeBlock>

        <p>
          The <em>look-back distance</em> — whether you peek at <code>dp[i-1]</code> only, or back
          through every <code>dp[j]</code> for <code>j &lt; i</code> — is what determines time
          complexity. Climbing Stairs looks at <code>dp[i-1]</code> and <code>dp[i-2]</code>: O(n). LIS
          looks at all <code>dp[j]</code> for <code>j &lt; i</code>: O(n²). Knowing which one a problem
          is ahead of time is most of the skill.
        </p>

        <h3>The Java skeleton</h3>

        <p>
          Memorize this shape. It changes by one or two lines from problem to problem, but the bones
          are identical:
        </p>

        <CodeBlock lang="java">{`public int solve(int[] a) {
    int n = a.length;

    // 1. Allocate the table. Size is usually n or n+1.
    int[] dp = new int[n + 1];

    // 2. Initialize base cases. ALWAYS the trickiest part.
    //    dp[0] is "empty prefix" or "nothing decided yet".
    dp[0] = /* base value */;

    // 3. Fill left to right. dp[i] depends only on smaller indices.
    for (int i = 1; i <= n; i++) {
        // Look at a[i-1] (the i-th element, 0-indexed) and combine with dp[i-1], dp[i-2], etc.
        dp[i] = /* recurrence */;
    }

    // 4. The answer is at one of: dp[n], max(dp), dp[n-1], etc. — depends on the problem.
    return dp[n];
}`}</CodeBlock>

        <Callout variant="insight" title="Why we sometimes use length n+1, not n">
          <p>
            Notice the <code>n + 1</code>. When <code>dp[i]</code> means &quot;answer for the first i
            elements,&quot; the index <code>i</code> ranges from <code>0</code> (empty) to <code>n</code>{" "}
            (full array) — that&apos;s n+1 distinct states. <code>dp[0]</code> is the &quot;empty
            input&quot; base case, which is almost always a clean value (0 ways, 0 coins, true
            reachability for empty prefix).
          </p>
          <p>
            When <code>dp[i]</code> means &quot;answer ending at index i,&quot; you only need length n
            because <code>i</code> ranges over actual array indices <code>0..n-1</code>. The base case
            then lives at <code>dp[0]</code>, which is &quot;a single element by itself.&quot;
          </p>
        </Callout>

        <h3>Top-down vs bottom-up — same recurrence</h3>

        <p>
          You learned both styles in dp-intro. For 1D problems, <strong>bottom-up tabulation is
          almost always cleaner</strong>: the dependency graph is a clean line (each <code>dp[i]</code>{" "}
          needs only smaller indices), so you can fill the array in order with no recursion overhead and
          no stack risk. Reach for memoization only when the state space is sparse — i.e., when many
          indices are never visited and you want to skip the work.
        </p>

        <p>
          For everything in this module, write bottom-up. If you can sketch the table on paper and read
          off the answer, you&apos;re done; the code just translates the table.
        </p>

        <Quiz
          kind="Quick check"
          question="A problem asks: 'how many ways to climb n stairs taking 1 or 2 at a time?' What is dp[i]?"
          options={[
            { label: "dp[i] = the i-th step's height.", explanation: "Heights aren't a thing here. dp[i] is the count of ways to reach step i." },
            { label: "dp[i] = number of ways to reach step i.", correct: true, explanation: "Right. The classic 'first i elements' framing — dp[i] is the answer to the subproblem 'reach exactly step i.' Recurrence: dp[i] = dp[i-1] + dp[i-2] (one step from i-1 or two steps from i-2). Base: dp[0] = 1, dp[1] = 1." },
            { label: "dp[i] = the size of the i-th step.", explanation: "Same misread as A — 'i' is an index into the count of ways to arrive, not a physical attribute." },
            { label: "dp[i] = whether step i is reachable (true/false).", explanation: "Reachability would be boolean — the question asks for COUNT, not whether it's possible. Counting problems use sum recurrences, not OR." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why does this recurrence template look at only a few previous dp[] values rather than all of them?"
          options={[
            { label: "Java arrays are too slow for full lookbacks.", explanation: "Java arrays are O(1) access. The look-back distance is dictated by the problem, not the language." },
            { label: "It depends on the problem. Climbing Stairs needs dp[i-1] and dp[i-2]; LIS needs every dp[j] for j < i. The recurrence dictates the lookback distance, which dictates time complexity.", correct: true, explanation: "Right. The number of dp[] values you reference per step is exactly the recurrence's branching factor. Constant lookback → O(n). Linear lookback (LIS) → O(n²). Recognizing the lookback distance from the problem statement is the key skill — it's what tells you the expected complexity." },
            { label: "Memory limits.", explanation: "DP tables are typically tiny (kilobytes). Memory isn't the constraint." },
            { label: "Cache locality.", explanation: "Cache effects are real but secondary. The main reason is the structure of the problem itself." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Coin Change ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="coin-change" title="I can write Coin Change without notes" xp={25}>
      <section>
        <h2 id="coin-change">Coin Change — unbounded choice</h2>

        <p>
          <strong>LC 322 · Coin Change.</strong>{" "}Given an array <code>coins</code> (each coin
          unlimited supply) and a target <code>amount</code>, return the fewest coins needed to make
          the target, or -1 if impossible.
        </p>

        <p>
          The first instinct most people have is greedy: at each step, take the largest coin that
          fits. This <em>fails</em>. Counterexample: coins = {`{1, 3, 4}`}, target = 6. Greedy takes 4,
          then needs 2 more — that&apos;s 4+1+1, three coins. The optimal is 3+3, two coins. Greedy
          misses it because committing to the largest coin can leave a remainder that&apos;s expensive
          to fill.
        </p>

        <Mermaid chart={coinTrace} />

        <Callout variant="warn" title="Why greedy fails for general coin sets">
          <p>
            Greedy <em>does</em>{" "}work for some special sets — US currency {`{1, 5, 10, 25}`} is the
            classic example, where any change can be made greedily. These are called &quot;canonical
            coin systems,&quot; and proving a coin set is canonical is non-trivial.
          </p>
          <p>
            For arbitrary coin sets, greedy can be off by an arbitrary amount. The fix: solve every
            subproblem, share work between them. That&apos;s DP.
          </p>
        </Callout>

        <h3>The recurrence</h3>

        <p>
          Define <code>dp[a]</code> = minimum number of coins to make amount <code>a</code>. The
          recurrence:
        </p>

        <CodeBlock lang="plain">{`dp[a] = min over each coin c of (dp[a - c] + 1)
        if a - c >= 0 and dp[a - c] is reachable

dp[0] = 0   (zero coins to make amount zero)`}</CodeBlock>

        <p>
          Each amount <code>a</code> is the index <code>i</code> in our generic template. The
          &quot;decision at amount a&quot; is: which coin do I place last? Whichever coin we pick,
          the subproblem <code>dp[a - c]</code> is already solved by the time we&apos;re computing{" "}
          <code>dp[a]</code> — that&apos;s the bottom-up order.
        </p>

        <h3>Java implementation</h3>

        <CodeBlock lang="java">{`public int coinChange(int[] coins, int amount) {
    // Sentinel: amount + 1 is strictly larger than any possible answer
    // (worst case is using all 1-coins, which would be 'amount' coins).
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;

    for (int a = 1; a <= amount; a++) {
        for (int c : coins) {
            if (c <= a && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount];
}`}</CodeBlock>

        <Callout variant="insight" title="Why the sentinel is amount + 1, not Integer.MAX_VALUE">
          <p>
            If <code>dp[a - c]</code> is unreachable, we want any addition of 1 to still leave
            <code>dp[a]</code> &quot;unreachable.&quot; <code>Integer.MAX_VALUE + 1</code>{" "}
            <em>overflows</em>{" "}to <code>Integer.MIN_VALUE</code> — silently wrong, and the bug only
            shows up on certain inputs.
          </p>
          <p>
            <code>amount + 1</code> is large enough to be strictly bigger than any valid answer (the
            worst valid answer is <code>amount</code> coins of denomination 1), but small enough that
            adding 1 to it never overflows. Final check: if <code>dp[amount]</code> is still &gt;{" "}
            <code>amount</code>, no coin combination reaches the target — return -1.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Time:</strong>{" "}O(amount × coins.length). Outer loop fills the table; inner loop tries each coin per amount.</li>
          <li><strong>Space:</strong>{" "}O(amount). One linear table.</li>
        </ul>

        <p>
          Notice this is not O(n) where n is array size — the table is keyed on <em>amount</em>, the
          target value, not on any input length. This is a recurring twist in DP: the &quot;index&quot;
          isn&apos;t always an array position. Sometimes it&apos;s a target value, a string length, a
          remaining capacity. Whatever you can use to index the subproblems.
        </p>

        <h3>Variations to know exist</h3>

        <ul>
          <li><strong>LC 518 · Coin Change 2.</strong>{" "}Counts the <em>number of ways</em>{" "}to make the amount, not the minimum coin count. Same shape (<code>dp[a] = sum over coins of dp[a - c]</code>), but the loop order matters: outer over coins, inner over amounts — to avoid double-counting permutations as separate combinations.</li>
          <li><strong>Bounded Coin Change.</strong>{" "}Each coin has a finite supply. Add another dimension to the state: <code>dp[a][i]</code> = min coins using only first i types. (Phase 7&apos;s next module.)</li>
          <li><strong>Combination Sum (LC 39).</strong>{" "}All distinct combinations summing to target, each combination listed. Backtracking, not DP — but the recurrence shape rhymes.</li>
        </ul>

        <Quiz
          kind="Coin Change check"
          question="In the standard min-coins solution, why do we initialize dp[] with `amount + 1` instead of `Integer.MAX_VALUE`?"
          options={[
            { label: "Style preference; both work.", explanation: "They don't both work. MAX_VALUE breaks. The choice of sentinel is correctness, not style." },
            { label: "amount + 1 is larger than any valid answer (since worst-case is all-1s = amount coins), but adding 1 never overflows; MAX_VALUE + 1 wraps around to MIN_VALUE silently.", correct: true, explanation: "Right. The recurrence does dp[a-c] + 1; if dp[a-c] is the sentinel, that addition must NOT produce a smaller number. MAX_VALUE + 1 wraps in two's complement and you get a 'min coins = -2147483648' bug. amount + 1 is the standard fix — large enough to mean 'unreachable,' small enough to be safe." },
            { label: "amount + 1 is faster to write.", explanation: "Speed of writing isn't the reason. Correctness is." },
            { label: "Java doesn't allow MAX_VALUE in array initialization.", explanation: "It absolutely does. The bug is arithmetic overflow, not language restriction." },
          ]}
        />

        <Quiz
          kind="Coin Change check"
          question="What's the time complexity of the bottom-up solution in terms of `amount` (call it M) and the number of coin denominations K?"
          options={[
            { label: "O(M + K).", explanation: "Each amount tries every coin — that's M*K, not M+K." },
            { label: "O(M log K).", explanation: "No log factor — we just linearly scan the K coins for each of the M amounts." },
            { label: "O(M * K).", correct: true, explanation: "Right. M iterations of the outer loop, K iterations of the inner loop, constant work inside. Total M*K. Note: this is NOT polynomial in the input size — M is the numeric VALUE of the amount, which can be exponentially large in its bit-length. (This is the classic 'pseudopolynomial' twist for knapsack-family problems.)" },
            { label: "O(K^M).", explanation: "K^M would be brute-force enumeration of all coin sequences. DP shares work across subproblems — that's the whole point." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Word Break ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="word-break" title="I can solve Word Break and tell it apart from look-alikes" xp={25}>
      <section>
        <h2 id="word-break">Word Break — segmentation DP</h2>

        <p>
          <strong>LC 139 · Word Break.</strong>{" "}Given a string <code>s</code> and a dictionary of
          words <code>wordDict</code>, return true if <code>s</code> can be segmented into a sequence
          of one or more dictionary words.
        </p>

        <p>
          Example: <code>s = &quot;leetcode&quot;</code>, dict = {`{"leet", "code"}`} → true (split as{" "}
          &quot;leet&quot; + &quot;code&quot;). <code>s = &quot;applepenapple&quot;</code>, dict ={" "}
          {`{"apple", "pen"}`} → true. <code>s = &quot;catsandog&quot;</code>, dict ={" "}
          {`{"cats", "dog", "sand", "and", "cat"}`} → false (no segmentation works).
        </p>

        <h3>The recurrence</h3>

        <p>
          Define <code>dp[i]</code> = true iff the prefix <code>s[0..i)</code> can be segmented. The
          insight: a prefix of length <code>i</code> is segmentable iff <em>some</em>{" "}earlier prefix
          of length <code>j</code> is segmentable AND the slice <code>s[j..i)</code> is in the
          dictionary.
        </p>

        <CodeBlock lang="plain">{`dp[i] = OR over j in [0..i) of (dp[j] AND s[j..i) in dict)

dp[0] = true   (empty prefix is trivially segmentable)
answer = dp[n]`}</CodeBlock>

        <p>
          The recurrence is a boolean OR — we&apos;re doing reachability, not optimization. Once
          we&apos;ve found <em>one</em>{" "}way to segment the prefix, we&apos;re done with that prefix;
          set <code>dp[i] = true</code> and short-circuit.
        </p>

        <h3>Java implementation</h3>

        <CodeBlock lang="java">{`public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);   // O(1) lookups
    int n = s.length();
    boolean[] dp = new boolean[n + 1];
    dp[0] = true;                                  // empty prefix

    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j] && dict.contains(s.substring(j, i))) {
                dp[i] = true;
                break;                              // one valid split is enough
            }
        }
    }

    return dp[n];
}`}</CodeBlock>

        <Callout variant="info" title="The substring is the costly part">
          <p>
            <code>s.substring(j, i)</code> is O(i - j) in Java — a fresh string allocation each call.
            And <code>dict.contains</code> on the new string costs O(i - j) hashing too. So a strict
            analysis gives O(n³) in the worst case, dropping to O(n² · L) where L is
            max-word-length if you cap the inner loop by L.
          </p>
          <p>
            For LeetCode constraints (n ≤ 300, dictionary of small words), the simple version flies.
            Optimizations exist — bound the inner loop by max-word-length, or use a Trie to skip
            impossible word-end positions — but the textbook two-nested-loop version with substring
            lookups is what you write under interview pressure.
          </p>
        </Callout>

        <h3>Tracing s = &quot;leetcode&quot;</h3>

        <CodeBlock lang="plain">{`dict = {"leet", "code"}
indices:  0 1 2 3 4 5 6 7 8
chars:        l e e t c o d e

dp[0] = true (empty)
dp[1]..dp[3] = false (no dict word matches "l", "le", "lee")
dp[4] = dp[0] && "leet" in dict → true
dp[5]..dp[7] = false
dp[8] = dp[4] && "code" in dict → true

answer = dp[8] = true`}</CodeBlock>

        <p>
          The walk through dp[4] is the moment of truth — once we know &quot;leet&quot; is reachable,
          we can build on it. The whole DP is a chain of these moments.
        </p>

        <h3>Why this is DP and not sliding window</h3>

        <p>
          Word Break <em>looks</em>{" "}like a string-scan problem and learners sometimes try a sliding
          window. It doesn&apos;t fit. The reason: <strong>the &quot;decision&quot; at each position
          isn&apos;t a single local choice that monotonically grows or shrinks something</strong> —
          it&apos;s &quot;does there exist <em>any</em>{" "}split of this prefix?&quot;, which requires
          information from <em>all</em>{" "}earlier positions, not just an expanding-then-contracting
          window. Sliding window has no way to express &quot;OR over many j&apos;s.&quot;
        </p>

        <p>
          The same litmus test that ruled out sliding window for &quot;subarray sum equals K with
          negatives&quot; in the previous phase rules it out here: the answer at position i depends on
          a non-contiguous, non-monotonic combination of earlier states.
        </p>

        <ClassifyChallenge
          title="1D DP or a different technique?"
          prompt="For each problem, decide whether the right tool is 1D DP or something else from earlier modules."
          buckets={[
            { id: "dp", label: "1D DP", color: "rose" },
            { id: "other", label: "Different technique", color: "indigo" },
          ]}
          items={[
            { id: "1", label: "Longest substring with at most 3 distinct characters.", answer: "other", explanation: "Sliding window. Local invariant (distinct count <= 3), monotonic in window size — the textbook variable-window setup." },
            { id: "2", label: "Given coins {1, 5, 10, 21, 25}, minimum coins to make 63.", answer: "dp", explanation: "Coin Change with a non-canonical set. Greedy fails (try it: 25+25+10+1+1+1 = 6 coins, but 21+21+21 = 3). DP fills dp[a] for every amount 0..63." },
            { id: "3", label: "Number of ways to climb n stairs taking 1 or 2 steps.", answer: "dp", explanation: "Classic Fibonacci-shaped DP. dp[i] = dp[i-1] + dp[i-2], the prototypical 1D recurrence." },
            { id: "4", label: "Find any two indices in an array whose values sum to K.", answer: "other", explanation: "HashMap (Two Sum). DP doesn't help — there's no overlapping subproblem structure." },
            { id: "5", label: "Can a string s be segmented into dictionary words?", answer: "dp", explanation: "Word Break — the canonical 1D segmentation DP. dp[i] depends on an OR over many earlier j's, which is exactly what DP expresses cleanly." },
            { id: "6", label: "Smallest contiguous subarray summing >= target (positive numbers).", answer: "other", explanation: "Sliding window. Positive numbers give monotonicity in window sum — expand to grow, contract while still valid." },
            { id: "7", label: "Number of decodings of '226' (1=A, 26=Z).", answer: "dp", explanation: "Decode Ways — 1D DP with two-step lookback (dp[i-1] and dp[i-2] depending on validity)." },
            { id: "8", label: "Detect a cycle in a directed graph.", answer: "other", explanation: "Three-color DFS. Graph traversal, not a sequence problem; no 'i-th index' structure to anchor a DP table on." },
          ]}
        />

        <Quiz
          kind="Word Break check"
          question="In the standard Word Break DP, what does dp[i] represent?"
          options={[
            { label: "Whether s[i] is in the dictionary.", explanation: "Single characters aren't usually in the dictionary, and the question is about segmenting an entire prefix, not a single char." },
            { label: "Whether the prefix s[0..i) (length i) can be segmented into one or more dictionary words.", correct: true, explanation: "Right. dp[i] is the boolean answer for the entire prefix of length i. dp[0] = true (empty prefix is trivially segmentable), and dp[i] = OR over j of (dp[j] AND s[j..i) in dict). The answer is dp[n]." },
            { label: "The number of ways to segment s[0..i).", explanation: "That would be a different problem (LC 140, Word Break II's count variant). LC 139 asks for boolean reachability." },
            { label: "The longest dictionary word ending at position i.", explanation: "Closer to a useful auxiliary, but it's not the dp value used in the standard solution. The standard dp[i] is the boolean reachability of the whole prefix." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · LIS ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="lis" title="I understand why 'ending at i' is the right anchor for LIS" xp={25}>
      <section>
        <h2 id="lis">Longest Increasing Subsequence — the &quot;ending at i&quot; anchor</h2>

        <p>
          <strong>LC 300 · Longest Increasing Subsequence.</strong>{" "}Given an integer array{" "}
          <code>nums</code>, return the length of the longest <em>strictly increasing subsequence</em>.
          Subsequence: pick any indices in order, not necessarily contiguous.
        </p>

        <p>
          Example: <code>nums = [10, 9, 2, 5, 3, 7, 101, 18]</code>. One LIS is{" "}
          <code>[2, 3, 7, 101]</code> with length 4. Another is <code>[2, 3, 7, 18]</code>, also
          length 4. The problem asks for the length, not the subsequence itself.
        </p>

        <h3>The naive try (and why it fails)</h3>

        <p>
          You might try defining <code>dp[i]</code> = LIS of the prefix <code>nums[0..i]</code>. But
          this doesn&apos;t decompose. Knowing &quot;the LIS of the first 5 elements is 3&quot; tells
          you nothing about whether <code>nums[5]</code> can extend it — you don&apos;t know what the
          last element of <em>that</em>{" "}LIS was. The recurrence has no clean way to chain.
        </p>

        <h3>The fix: anchor at i</h3>

        <p>
          Define <code>dp[i]</code> = length of the LIS that <em>ends at index i</em> (i.e., the LIS
          must include <code>nums[i]</code> as its final element). Now the recurrence chains cleanly:
          to extend a LIS ending at some earlier index <code>j</code> with <code>nums[i]</code>, we
          need <code>nums[j] &lt; nums[i]</code>. Take the maximum over all valid <code>j</code>.
        </p>

        <CodeBlock lang="plain">{`dp[i] = 1 + max( dp[j] : 0 <= j < i and nums[j] < nums[i] )
        (or 1 if no such j exists)

answer = max(dp[0..n-1])    // the LIS could end anywhere`}</CodeBlock>

        <Mermaid chart={lisTrace} />

        <Callout variant="insight" title="Why 'ending at i' makes the recurrence work and 'in the first i elements' doesn't">
          <p>
            The trick is that &quot;ending at i&quot; pins down the <em>last element</em>{" "}of the
            subsequence we&apos;re tracking. That gives the recurrence the hook it needs:{" "}
            <code>nums[j] &lt; nums[i]</code> is a clean comparison between two anchored positions.
          </p>
          <p>
            By contrast, &quot;LIS in first i elements&quot; tracks a length but loses the identity of
            what comes last — so when we get to <code>nums[i+1]</code>, we can&apos;t tell whether to
            extend it. The lesson generalizes: when a problem asks &quot;longest something that
            satisfies a constraint involving consecutive picked elements,&quot; anchor the dp at the
            <em> last</em>{" "}picked element. Maximum Subarray uses the same trick (Kadane&apos;s
            algorithm: <code>dp[i]</code> = max sum of subarray ending at i).
          </p>
        </Callout>

        <h3>Java implementation — O(n²)</h3>

        <CodeBlock lang="java">{`public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);              // every element is a LIS of length 1 by itself

    int best = 1;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        best = Math.max(best, dp[i]);
    }
    return best;
}`}</CodeBlock>

        <p>
          The outer loop is i; the inner loop is j ∈ [0, i). Each comparison is O(1), so total time is
          O(n²). Space is O(n) for the table.
        </p>

        <Callout variant="warn" title="Don't forget the final max">
          <p>
            Unlike Coin Change or Word Break, the answer for LIS is <em>not</em>{" "}at <code>dp[n-1]</code>{" "}
            — that&apos;s only the LIS ending exactly at the last element, which may be small if the
            last element is small.
          </p>
          <p>
            The LIS of the whole array can end anywhere, so the answer is{" "}
            <code>max(dp[0..n-1])</code>. Tracking <code>best</code> as you go is the cleanest way; you
            can also do <code>Arrays.stream(dp).max().getAsInt()</code> at the end.
          </p>
        </Callout>

        <h3>The O(n log n) approach exists — but later</h3>

        <p>
          There&apos;s a beautiful O(n log n) solution using <em>patience sorting</em>: maintain a
          dynamic array <code>tails</code> where <code>tails[k]</code> is the smallest possible tail of
          any increasing subsequence of length k+1. For each <code>num</code>, binary-search for the
          first <code>tails[k] &gt;= num</code> and replace it (or append if no such k).{" "}
          <code>tails.size()</code> at the end is the LIS length.
        </p>

        <p>
          The patience-sort solution is short to write but takes serious thought to prove correct —
          and it doesn&apos;t generalize to variations as cleanly as the O(n²) DP. We cover it
          properly in the binary-search-the-answer module; for now, the O(n²) DP is what you write in
          interviews. It&apos;s O(n²) on n ≤ 2500 (LeetCode&apos;s LIS constraint), which fits the
          time limit comfortably.
        </p>

        <h3>Variations on the &quot;ending at i&quot; theme</h3>

        <ul>
          <li><strong>LC 53 · Maximum Subarray.</strong>{" "}dp[i] = max sum of subarray ending at i. Recurrence: <code>dp[i] = max(nums[i], dp[i-1] + nums[i])</code>. This is Kadane&apos;s algorithm and is one of the cleanest 1D DPs ever written.</li>
          <li><strong>LC 152 · Maximum Product Subarray.</strong>{" "}Same anchor, but you have to track <em>two</em>{" "}dp values per index (max-product-ending-here AND min-product-ending-here) because a negative number can flip min into max.</li>
          <li><strong>LC 198 · House Robber.</strong>{" "}Mixed flavor: dp[i] = max money robbing the first i houses, with the constraint that adjacent houses can&apos;t both be robbed. Recurrence: <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])</code>. This is &quot;first i&quot; framing but the recurrence still asks &quot;include i-th or skip&quot; — same decision template.</li>
        </ul>

        <Quiz
          kind="LIS check"
          question="Why does defining dp[i] as 'LIS of the prefix nums[0..i]' fail to give a clean recurrence, while 'LIS ending at i' works?"
          options={[
            { label: "The first definition gives O(n²) and the second O(n log n).", explanation: "Both versions covered here are O(n²). The difference is whether the recurrence chains, not asymptotic speed." },
            { label: "The first definition loses the identity of the LIS's last element, so when we move to i+1 we can't tell whether nums[i+1] can extend it. Anchoring at the last element gives the recurrence the hook it needs.", correct: true, explanation: "Right. To extend a subsequence with a new element, you need to compare against the subsequence's CURRENT LAST. 'Length of LIS in prefix' tracks length but not identity of last; 'LIS ending at i' tracks both. The comparison nums[j] < nums[i] only works because dp[j] is anchored at index j as its endpoint." },
            { label: "Java doesn't support multi-dimensional dp.", explanation: "Java fully supports 2D arrays, but that's not the issue. The issue is what information dp[i] captures." },
            { label: "Both work equally well.", explanation: "They don't. The 'in the first i elements' framing has no clean way to express 'is nums[i+1] greater than the last picked element?'" },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Decode Ways ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="decode-ways" title="I can write Decode Ways with all base cases right" xp={30}>
      <section>
        <h2 id="decode-ways">Decode Ways — Climbing Stairs with validation</h2>

        <p>
          <strong>LC 91 · Decode Ways.</strong>{" "}A string of digits is encoded with the rule
          A=1, B=2, …, Z=26. Given a digit string <code>s</code>, return the number of ways to decode
          it. Example: <code>&quot;226&quot;</code> can be decoded as &quot;BBF&quot; (2-2-6),
          &quot;BZ&quot; (2-26), or &quot;VF&quot; (22-6) — three ways.
        </p>

        <h3>The recurrence — almost Climbing Stairs</h3>

        <p>
          The shape is identical to Climbing Stairs: at each position you either took 1 step (decoded
          one digit) or 2 steps (decoded two digits). So you&apos;d expect:
        </p>

        <CodeBlock lang="plain">{`dp[i] = dp[i-1] + dp[i-2]`}</CodeBlock>

        <p>
          And that&apos;s almost right — but with a twist. Each step is only valid if the corresponding
          digit(s) form a legal letter code. Specifically:
        </p>

        <CodeBlock lang="plain">{`dp[i] = (dp[i-1] if s[i-1] is '1'..'9')
      + (dp[i-2] if s[i-2..i] forms a number in [10, 26])`}</CodeBlock>

        <p>
          The two terms are <em>conditional</em>. Either or both can be excluded based on validation.
          That&apos;s where the bug-hunting begins.
        </p>

        <Mermaid chart={decodeTrace} />

        <h3>The base cases — extra-tricky</h3>

        <p>
          We use length n+1 because the dp value &quot;at i&quot; means &quot;ways to decode the first
          i characters.&quot; That gives us:
        </p>

        <ul>
          <li><code>dp[0] = 1</code> — empty prefix has exactly one decoding (the empty one). This isn&apos;t arbitrary; it&apos;s the multiplicative identity that makes the recurrence work for i=2.</li>
          <li><code>dp[1] = 1</code> if <code>s[0] != &apos;0&apos;</code>, else 0. A leading zero means the entire string has no valid decoding (since &apos;0&apos; isn&apos;t a letter and can&apos;t start a two-digit code by itself).</li>
        </ul>

        <Callout variant="warn" title="The off-by-one trap">
          <p>
            <code>dp[i]</code> = ways for prefix of <em>length</em>{" "}i. The character at the i-th
            position of the prefix is <code>s[i - 1]</code> (0-indexed). The two-digit chunk under
            consideration when computing dp[i] is <code>s[i-2..i)</code>, i.e., characters{" "}
            <code>s[i-2]</code> and <code>s[i-1]</code>.
          </p>
          <p>
            Get this wrong and you&apos;ll have a baffling time looking at &quot;why does dp[3] not
            see &apos;26&apos;?&quot; Always write a comment explaining which character lives at which
            index when you set up Decode Ways. The off-by-one makes it the most-failed easy-rated
            problem on LeetCode for a reason.
          </p>
        </Callout>

        <h3>Java implementation</h3>

        <CodeBlock lang="java">{`public int numDecodings(String s) {
    int n = s.length();
    if (n == 0) return 0;

    int[] dp = new int[n + 1];
    dp[0] = 1;                                  // empty prefix
    dp[1] = s.charAt(0) == '0' ? 0 : 1;        // leading-zero kills everything

    for (int i = 2; i <= n; i++) {
        char curr = s.charAt(i - 1);            // i-th char of prefix
        char prev = s.charAt(i - 2);            // (i-1)-th char of prefix

        // Option A: decode s[i-1] as a single letter (1..9).
        if (curr != '0') {
            dp[i] += dp[i - 1];
        }

        // Option B: decode s[i-2..i) as a two-digit letter (10..26).
        int two = (prev - '0') * 10 + (curr - '0');
        if (two >= 10 && two <= 26) {
            dp[i] += dp[i - 2];
        }

        // If both options fail, dp[i] stays 0 — the string is undecodable from here.
    }

    return dp[n];
}`}</CodeBlock>

        <h3>Tracing the gnarly cases</h3>

        <CodeBlock lang="plain">{`s = "12"     →  dp = [1, 1, 2]    →  "AB" or "L"
s = "06"     →  dp = [1, 0, 0]    →  leading zero, no valid decode
s = "10"     →  dp = [1, 1, 1]    →  only "J"; 1 alone is fine, 0 alone is invalid
s = "27"     →  dp = [1, 1, 1]    →  only "BG"; 27 > 26, no two-digit option
s = "100"    →  dp = [1, 1, 1, 0] →  "JZ"? no, 00 is invalid; the second 0 has no friend
s = "226"    →  dp = [1, 1, 2, 3] →  "BBF", "BZ", "VF"`}</CodeBlock>

        <p>
          The <code>s = &quot;100&quot;</code> case is the textbook trap. dp[2] is 1 (&quot;10&quot;
          → &quot;J&quot;); dp[3] requires either decoding curr=&apos;0&apos; alone (invalid: 0
          isn&apos;t 1–9) or decoding prev+curr=&quot;00&quot; (invalid: not in 10–26). Both options
          fail, so dp[3] = 0. The whole string is undecodable.
        </p>

        <h3>Comparison with Climbing Stairs</h3>

        <p>
          Climbing Stairs: <code>dp[i] = dp[i-1] + dp[i-2]</code>, no validation. Both terms always
          contribute.
        </p>

        <p>
          Decode Ways: <code>dp[i] = (validate1 ? dp[i-1] : 0) + (validate2 ? dp[i-2] : 0)</code>. The
          structure is identical; the only difference is the conditional admission of each term. If
          you can write Climbing Stairs in your sleep, Decode Ways is &quot;Climbing Stairs with
          validation gates&quot; — and that mental link is genuinely the way to remember the recurrence
          shape under interview pressure.
        </p>

        <Callout variant="insight" title="Space-optimization, while we're here">
          <p>
            <code>dp[i]</code> only uses <code>dp[i-1]</code> and <code>dp[i-2]</code>. So we can
            collapse the table to two rolling variables and reduce space from O(n) to O(1):
          </p>
          <CodeBlock lang="java">{`int prev2 = 1;                              // dp[0]
int prev1 = s.charAt(0) == '0' ? 0 : 1;     // dp[1]
for (int i = 2; i <= n; i++) {
    int curr = 0;
    if (s.charAt(i-1) != '0') curr += prev1;
    int two = (s.charAt(i-2) - '0') * 10 + (s.charAt(i-1) - '0');
    if (two >= 10 && two <= 26) curr += prev2;
    prev2 = prev1;
    prev1 = curr;
}
return prev1;`}</CodeBlock>
          <p>
            Same algorithm, O(1) space. The pattern — &quot;dp[i] only depends on dp[i-1] and
            dp[i-2], collapse to two rolling vars&quot; — applies to every recurrence in this
            module&apos;s &quot;step / position&quot; family. Climbing Stairs, House Robber, Decode
            Ways, Fibonacci. All space-collapsible.
          </p>
        </Callout>

        <Quiz
          kind="Decode Ways check"
          question="For s = '10', the answer is 1. Why?"
          options={[
            { label: "Because '1' is 'A' and '0' has no letter.", explanation: "Almost — but the question is what the algorithm computes, not the language semantics. The algorithm rejects single '0' and accepts '10' as a two-digit code 'J'." },
            { label: "Because dp[2] = (s[1]=='0' so don't add dp[1]) + (s[0..2]='10' is in [10,26] so add dp[0]=1) = 1.", correct: true, explanation: "Right. At i=2, single-digit option fails (curr='0' is not 1..9). Two-digit option succeeds (10 is in [10,26]), adding dp[0]=1. dp[2] = 0 + 1 = 1, corresponding to the single decoding 'J'." },
            { label: "Because dp[2] = dp[1] + dp[0] = 2.", explanation: "That's Climbing Stairs without validation. With validation, the single-digit option fails because s[1]='0' is invalid alone. Only the two-digit option contributes." },
            { label: "Because we always pick the lexicographically smallest decoding.", explanation: "The problem asks for COUNT of ways to decode, not which decoding to pick. Lexicographic order isn't relevant." },
          ]}
        />

        <Quiz
          kind="Decode Ways check"
          question="What's the difference in code between Climbing Stairs and Decode Ways at the i-th step?"
          options={[
            { label: "Decode Ways uses memoization, Climbing Stairs uses tabulation.", explanation: "Both can be written either way. The difference is the recurrence body, not the implementation strategy." },
            { label: "Decode Ways is recursive, Climbing Stairs is iterative.", explanation: "Both can be either. Same answer as A — the strategy choice is independent of the problem." },
            { label: "Decode Ways adds dp[i-1] only if s[i-1] is 1..9, and adds dp[i-2] only if s[i-2..i] is in [10..26]. Climbing Stairs adds both unconditionally.", correct: true, explanation: "Right. Same recurrence skeleton (dp[i] = dp[i-1] + dp[i-2]); Decode Ways gates each term on whether the corresponding 'step' is a valid letter code. The structural similarity is what makes Decode Ways tractable; the validation is what makes it gnarly." },
            { label: "They're entirely different recurrences.", explanation: "They share the exact same skeleton. The only difference is conditional admission of each term in Decode Ways." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Cheat sheet ───────────────── */}
      <Checkpoint moduleSlug="dp-1d" id="cheatsheet" title="I can recognize 1D DP shapes by sight" xp={30}>
      <section>
        <h2 id="cheatsheet">Recognizing 1D DP — the cheat sheet</h2>

        <p>
          Five problems in, the family resemblances should be coming into focus. Three sub-shapes of
          1D DP cover almost everything you&apos;ll see in interviews. Knowing which shape a new
          problem fits is most of the battle — once you have the shape, the code follows.
        </p>

        <h3>Shape 1 · &quot;Ends at i&quot;</h3>

        <p>
          <code>dp[i]</code> = answer for sub-solutions <em>that must include nums[i]</em>. The
          recurrence looks back at all (or some of) <code>dp[j]</code> for <code>j &lt; i</code> and
          asks &quot;can I extend that one with nums[i]?&quot; The final answer is the max (or sum,
          or whatever) over all dp values, not just dp[n-1].
        </p>

        <ul>
          <li><strong>LIS</strong> — extend by any j with nums[j] &lt; nums[i]. O(n²).</li>
          <li><strong>Maximum Subarray (Kadane)</strong> — extend with dp[i-1] or restart fresh. O(n).</li>
          <li><strong>Longest Arithmetic Subsequence (LC 1027)</strong> — dp[i][diff] for two-anchor cases. (Phase 7&apos;s next module.)</li>
        </ul>

        <h3>Shape 2 · &quot;First i elements&quot;</h3>

        <p>
          <code>dp[i]</code> = answer for the prefix of length i. Recurrence asks &quot;given that
          smaller prefixes are solved, how do I extend?&quot; The final answer is at <code>dp[n]</code>.
          dp[0] is the empty-prefix base case, almost always a clean value.
        </p>

        <ul>
          <li><strong>Coin Change</strong> — dp[a] = min coins for amount a; the &quot;index&quot; is the target value, not an array position.</li>
          <li><strong>Word Break</strong> — dp[i] = is prefix segmentable; OR over many j&apos;s.</li>
          <li><strong>Perfect Squares (LC 279)</strong> — dp[n] = min number of perfect-square integers summing to n. Same shape as Coin Change with coins = {`{1, 4, 9, 16, ...}`}.</li>
        </ul>

        <h3>Shape 3 · &quot;i-th step / position&quot;</h3>

        <p>
          <code>dp[i]</code> = answer for the position i. The recurrence has constant lookback —
          typically just <code>dp[i-1]</code> and <code>dp[i-2]</code>. These are the simplest 1D DPs
          and the ones that collapse to O(1) space cleanly.
        </p>

        <ul>
          <li><strong>Climbing Stairs</strong> — dp[i] = dp[i-1] + dp[i-2]. Pure Fibonacci.</li>
          <li><strong>House Robber</strong> — dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]). Take or skip.</li>
          <li><strong>Decode Ways</strong> — Climbing Stairs with validation gates on each term.</li>
          <li><strong>Min Cost Climbing Stairs (LC 746)</strong> — dp[i] = min(dp[i-1], dp[i-2]) + cost[i]. Same lookback, different combine.</li>
        </ul>

        <h3>The space-collapse trick</h3>

        <p>
          For Shape 3 (constant lookback), the DP table is wasteful — you only need the last few
          values. Replace the array with rolling variables:
        </p>

        <CodeBlock lang="java">{`// Before: O(n) space
int[] dp = new int[n + 1];
dp[0] = base0; dp[1] = base1;
for (int i = 2; i <= n; i++) {
    dp[i] = combine(dp[i-1], dp[i-2]);
}
return dp[n];

// After: O(1) space
int prev2 = base0, prev1 = base1;
for (int i = 2; i <= n; i++) {
    int curr = combine(prev1, prev2);
    prev2 = prev1;
    prev1 = curr;
}
return prev1;`}</CodeBlock>

        <Callout variant="info" title="When NOT to space-collapse">
          <p>
            Three reasons to keep the full table even when lookback is constant:
          </p>
          <ul>
            <li><strong>You need to reconstruct the path</strong>, not just the answer. (E.g., &quot;return one valid LIS.&quot;) The dp array is your audit trail.</li>
            <li><strong>The problem has multiple queries</strong>{" "}over the same array (rare in interviews, common in production).</li>
            <li><strong>Clarity matters more than memory.</strong>{" "}n is usually so small that O(n) space is fine, and the table version is easier to debug.</li>
          </ul>
          <p>
            For interviews, write the table version first. Mention &quot;this can be reduced to O(1)
            space&quot; as a follow-up; rewrite only if asked.
          </p>
        </Callout>

        <h3>The diagnostic flowchart</h3>

        <p>When you spot a problem, ask in this order:</p>

        <ol>
          <li><strong>Is the answer about a contiguous subarray/substring with a sliding-window-friendly invariant?</strong>{" "}Sliding window. Not DP.</li>
          <li><strong>Is there a clean &quot;at index i, what choice do I make&quot; structure?</strong> 1D DP. Pick the shape:
            <ul>
              <li>Lookback is <em>all earlier j</em>{" "}with a comparison? Shape 1 (&quot;ends at i&quot;).</li>
              <li>Lookback is <em>some bounded set of earlier values</em> (a coin set, a dictionary)? Shape 2 (&quot;first i&quot;).</li>
              <li>Lookback is just <em>the last 1–2 values</em>? Shape 3 (&quot;i-th step&quot;).</li>
            </ul>
          </li>
          <li><strong>Does the state need two indices to be expressive?</strong> 2D DP — next module.</li>
        </ol>

        <ClassifyChallenge
          title="Which 1D shape fits?"
          prompt="For each problem, decide which of the three 1D DP shapes is the natural fit (or whether it isn't 1D DP at all)."
          buckets={[
            { id: "ends", label: "Shape 1 · ends at i", color: "rose" },
            { id: "first", label: "Shape 2 · first i", color: "amber" },
            { id: "step", label: "Shape 3 · i-th step", color: "emerald" },
            { id: "not", label: "Not 1D DP", color: "indigo" },
          ]}
          items={[
            { id: "1", label: "Coin Change: min coins to make amount A.", answer: "first", explanation: "Shape 2. dp[a] for every amount a in [0..A]; recurrence looks back at dp[a-c] for each coin c. The 'index' is the amount itself." },
            { id: "2", label: "Maximum sum of any contiguous subarray (Kadane).", answer: "ends", explanation: "Shape 1. dp[i] = max sum ending at i. Recurrence: max(nums[i], dp[i-1] + nums[i]). Answer is max over all dp values." },
            { id: "3", label: "Climbing Stairs: ways to reach step n.", answer: "step", explanation: "Shape 3. dp[i] = dp[i-1] + dp[i-2]. Constant lookback, collapsible to O(1) space." },
            { id: "4", label: "Longest Increasing Subsequence.", answer: "ends", explanation: "Shape 1. dp[i] = LIS ending at i. The 'ending at i' anchor is what gives the recurrence a comparison hook." },
            { id: "5", label: "Two Sum: any pair summing to target.", answer: "not", explanation: "HashMap problem, no 1D DP structure. The answer doesn't decompose into 'solve smaller prefixes.'" },
            { id: "6", label: "House Robber: max money, no two adjacent.", answer: "step", explanation: "Shape 3. dp[i] = max(dp[i-1], dp[i-2] + nums[i-1]). Two-step lookback, collapsible to O(1)." },
            { id: "7", label: "Word Break: can s be segmented into dict words?", answer: "first", explanation: "Shape 2. dp[i] = OR over j of (dp[j] AND s[j..i) in dict). The 'first i characters' framing of segmentation." },
            { id: "8", label: "Decode Ways: number of decodings of digit string.", answer: "step", explanation: "Shape 3. dp[i] = (gated) dp[i-1] + (gated) dp[i-2]. Same skeleton as Climbing Stairs with validation on each term." },
            { id: "9", label: "Longest substring with at most K distinct characters.", answer: "not", explanation: "Sliding window. Local invariant + monotonic window expansion — DP is overkill." },
            { id: "10", label: "Perfect Squares: min number of squares summing to n.", answer: "first", explanation: "Shape 2. dp[n] = 1 + min(dp[n - k*k]) over valid k. Same shape as Coin Change, with coins = {1, 4, 9, 16, ...}." },
          ]}
        />

        <Quiz
          kind="Cheat-sheet check"
          question="When can you safely collapse a 1D DP from O(n) space to O(1) rolling variables?"
          options={[
            { label: "Always.", explanation: "Not always. If dp[i] depends on a non-constant set of earlier values (LIS depends on all dp[j] for j<i), you can't collapse." },
            { label: "When dp[i] depends only on a constant number of recent values like dp[i-1] and dp[i-2].", correct: true, explanation: "Right. Constant lookback means you only need to keep that many rolling variables alive. Climbing Stairs, House Robber, Decode Ways, Min Cost Stairs — all collapsible. LIS is NOT collapsible (depends on every dp[j]). Coin Change is NOT collapsible (depends on dp[a-c] for every coin c, which is non-recent)." },
            { label: "When n is small.", explanation: "Smaller n makes both versions cheap; the question is whether collapse is correct, which depends on the recurrence." },
            { label: "When you don't need to reconstruct the path.", explanation: "True but secondary. Even if you don't need the path, you can only collapse if the recurrence's lookback is constant." },
          ]}
        />

        <Quiz
          kind="Cheat-sheet check"
          question="A new problem: 'Given an array, find the length of the longest subarray where every adjacent pair has |a[j+1] - a[j]| <= 3.' Which 1D shape does this fit best?"
          options={[
            { label: "Shape 2 ('first i') because it talks about 'longest.'", explanation: "'First i' captures prefixes, but here the answer is a SUBARRAY (contiguous) where the constraint is between adjacent elements — the shape we want anchors at the last included element." },
            { label: "Shape 1 ('ends at i') — dp[i] = length of longest valid subarray ending at i. Either extend dp[i-1] (if |a[i]-a[i-1]|<=3) or restart at length 1.", correct: true, explanation: "Right. The constraint is local to adjacent elements, but it's about CONTIGUOUS subarrays — perfect fit for 'ends at i.' Recurrence: dp[i] = (|a[i]-a[i-1]| <= 3) ? dp[i-1] + 1 : 1. Answer is max(dp). Same shape as Maximum Subarray — recognizing the family is the win." },
            { label: "Shape 3 ('i-th step') — like Climbing Stairs.", explanation: "Climbing Stairs has unconditional dp[i-1] + dp[i-2]. This problem's recurrence is a CONDITIONAL extend-or-restart — Shape 1, not Shape 3." },
            { label: "Sliding window, not DP.", explanation: "You could also solve it with a sliding window (the constraint is monotonic in window starts). DP is the more universally-applicable framing — and matches the 'longest sub-something ending at i' family." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't 2 hours ago"
          gist="One template, three flavors. Decision at index i, look back at the table, fill left-to-right. Coin Change, Word Break, LIS, and Decode Ways are all the same idea wearing different costumes."
          points={[
            { takeaway: "Recognize 1D DP from the problem statement: 'first i', 'ending at i', or 'i-th step'.", detail: "If a problem talks about a sequence, with a local decision per element and a recurrence that looks back at smaller indices — it's 1D DP. The exact shape depends on what 'state' the problem cares about." },
            { takeaway: "Coin Change is the canonical Shape 2: dp[amount] = min(dp[amount-c]+1) over coins.", detail: "Greedy fails on non-canonical coin sets ({1,3,4} target 6 → greedy=3, optimal=2). The amount+1 sentinel avoids overflow. Time O(amount × coins.length); pseudopolynomial in amount." },
            { takeaway: "Word Break is Shape 2 with boolean OR.", detail: "dp[i] = OR over j of (dp[j] AND s[j..i) in dict). The 'OR over many j's' is exactly what sliding window can't express, which is why it requires DP." },
            { takeaway: "LIS demands the 'ending at i' anchor.", detail: "Without anchoring at the last element of the subsequence, the recurrence has no way to compare 'extend with nums[i]?' with the previous endpoint. dp[i] = 1 + max(dp[j]) for j<i with nums[j]<nums[i]; answer is max(dp), not dp[n-1]." },
            { takeaway: "Decode Ways is Climbing Stairs with validation gates — and an off-by-one minefield.", detail: "Same recurrence skeleton dp[i] = dp[i-1] + dp[i-2], but each term is conditional on whether the corresponding 1- or 2-digit slice forms a valid letter code. dp[i] uses chars s[i-1] (single) and s[i-2..i) (pair) — write the comment, save your sanity." },
            { takeaway: "Shape 3 collapses to O(1) space; Shapes 1 and 2 don't.", detail: "If only dp[i-1] and dp[i-2] are needed, replace the array with two rolling variables. LIS depends on all dp[j], Coin Change on dp[a-c] for every c — both keep the table." },
          ]}
        />

        <div className="not-prose mt-12 rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-6 dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:to-pink-950/40">
          <p className="text-xs font-semibold tracking-wider text-fuchsia-700 uppercase dark:text-fuchsia-300">Up next · Module 34</p>
          <Link
            href="/courses/dsa/modules/dp-2d"
            className="mt-2 inline-block text-xl font-bold text-slate-900 no-underline transition hover:text-fuchsia-700 dark:text-slate-100 dark:hover:text-fuchsia-300"
          >
            2D DP &amp; grid DP →
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            When one index isn&apos;t enough — two-pointer state, the edit-distance family, and grid path-counting. Unique Paths, Longest Common Subsequence, Edit Distance, 0/1 Knapsack.
          </p>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="dp-1d" />
    </article>
  );
}
