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
  { id: "how-it-works", title: "How this capstone works" },
  { id: "easy-set", title: "Easy set · problems 1–5" },
  { id: "medium-1", title: "Medium set · problems 6–12" },
  { id: "medium-2", title: "Medium set · problems 13–17" },
  { id: "hard-set", title: "Hard set · problems 18–20" },
  { id: "final", title: "Final pattern-recognition challenge" },
];

export default function CapstoneModule() {
  const mod = getModuleBySlug("capstone")!;

  const flow = `
flowchart LR
    A["Read statement"] --> B["Identify pattern"]
    B --> C["Justify out loud<br/>(why THIS pattern?)"]
    C --> D["Sketch in Java"]
    D --> E["Verify on small input"]
    E --> F["Write up · 1–2 paragraphs"]
    style A fill:#fce7f3,color:#000,stroke:#db2777
    style B fill:#fbcfe8,color:#000,stroke:#db2777
    style C fill:#f9a8d4,color:#000,stroke:#be185d
    style D fill:#f472b6,color:#fff,stroke:#9d174d
    style E fill:#ec4899,color:#fff,stroke:#9d174d
    style F fill:#db2777,color:#fff,stroke:#831843
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="capstone" />
      <ModuleProgress moduleSlug="capstone" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 8 · Module {mod.number} · Capstone
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~4–5h · the final module of the course</p>
      </div>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-900 not-prose">
        <h3 className="text-base font-bold text-pink-900 dark:text-pink-200 mt-0 mb-3">
          What you&apos;ll walk out with
        </h3>
        <ul className="text-sm text-pink-900/90 dark:text-pink-200/90 mb-0 space-y-1 list-disc pl-5">
          <li>A <strong>portfolio repo</strong>{" "}with 20 solved problems, each with a 1–2 paragraph writeup naming the pattern, the alternatives you ruled out, and the complexity.</li>
          <li>Reflexive <strong>pattern recognition</strong>{" "}on the 20 most common problem shapes — the muscle memory the rest of the course was building.</li>
          <li>Confidence reading a problem statement and saying out loud, &quot;this is X because Y,&quot; before writing a single line.</li>
          <li>A finished course. The whole arc — Big-O through DP through interview framework — collapses into &quot;recognize the shape, reach for the tool.&quot;</li>
        </ul>
      </div>

      {/* ───────────────── Checkpoint 1 · How this works ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="how-it-works" title="I understand the format and the patterns I should recognize" xp={15}>
      <section>
        <h2 id="how-it-works">How this capstone works</h2>

        <p>
          You&apos;ve spent 33 modules building patterns. This one is the opposite shape: <strong>almost no new
          theory, all practice.</strong>{" "}Twenty curated problems, grouped by difficulty, deliberately mixed across
          patterns so you can&apos;t guess based on which module they came from.
        </p>

        <p>
          For every problem, run the same five-step routine:
        </p>

        <Mermaid chart={flow} />

        <p>
          The <em>justify out loud</em>{" "}step is the one most people skip and the one that makes the difference. In
          interviews, the engineer who says &quot;this is a sliding window because the constraint asks for a
          contiguous subarray and the window can only grow or shrink monotonically&quot; is the engineer who gets
          the offer. The engineer who silently types a working solution is harder to evaluate, and often blows
          past the cleaner approach because they didn&apos;t pause to consider it.
        </p>

        <h3>The 20 patterns we expect you to recognize on sight</h3>

        <p>
          Every problem in this capstone maps to one (occasionally two) of the patterns below. By the end of the
          module, the goal is that reading any one of these problem statements triggers the right pattern
          name in your head before you finish the second sentence.
        </p>

        <ul>
          <li><strong>Two pointers</strong> — sorted array, opposite ends, narrow inward. Or fast/slow on linked lists.</li>
          <li><strong>Sliding window</strong> — contiguous subarray/substring, &quot;at most K&quot;, &quot;exactly K&quot;, longest/shortest with property.</li>
          <li><strong>Binary search</strong> — sorted (or monotonic on some predicate), find boundary.</li>
          <li><strong>BFS</strong> — shortest path in unweighted graph, level-by-level traversal.</li>
          <li><strong>DFS</strong> — connectivity, exhaustive exploration, recursion on trees and graphs.</li>
          <li><strong>Dijkstra</strong> — shortest path with non-negative weights.</li>
          <li><strong>Union-Find (DSU)</strong> — dynamic connectivity, &quot;are A and B in the same component?&quot;</li>
          <li><strong>1D DP</strong> — overlapping subproblems on a single index (climb stairs, house robber).</li>
          <li><strong>2D DP</strong> — grid problems, two strings, two indices.</li>
          <li><strong>Interval DP</strong> — best way to split/merge a range; <code>dp[i][j]</code> over intervals.</li>
          <li><strong>Tree DP</strong> — bottom-up combine of children&apos;s answers, returned from recursion.</li>
          <li><strong>Bitmask DP</strong> — small N (≤20), state is a subset.</li>
          <li><strong>Heap / top-K</strong> — k smallest, k largest, k most frequent, median of stream.</li>
          <li><strong>Monotonic stack</strong> — next greater / previous smaller, &quot;span&quot; problems.</li>
          <li><strong>Trie</strong> — prefix lookup over a dictionary, autocomplete, word boards.</li>
          <li><strong>Greedy</strong> — local choice provably optimal (interval scheduling, minimum coins on canonical sets).</li>
          <li><strong>Backtracking</strong> — generate all valid combinations / permutations / partitions, prune early.</li>
          <li><strong>HashMap</strong> — O(1) lookup, complement search, group-by.</li>
          <li><strong>HashSet</strong> — membership / dedup / cycle detection.</li>
          <li><strong>Prefix sum</strong> — range queries on arrays, &quot;subarray sum equals K&quot; with hashmap.</li>
        </ul>

        <Callout variant="insight" title="The course was 33 modules of pattern-building. This is one module of pattern-using.">
          <p>
            If a pattern in that list looks unfamiliar, that&apos;s a signal — go skim the relevant module first. The
            capstone doesn&apos;t teach. It tests whether the teaching took.
          </p>
        </Callout>

        <h3>The writeup discipline</h3>

        <p>
          Every solved problem ships with a writeup. Two paragraphs, plain English, on top of the code:
        </p>

        <ol>
          <li>
            <strong>Pattern + justification.</strong>{" "}What pattern, and the one or two sentences that ruled it
            in. Bonus: name the patterns you ruled out and why.
          </li>
          <li>
            <strong>Approach + complexity.</strong>{" "}A high-level description of the algorithm, time and space
            cost, and any non-obvious correctness argument (the loop invariant, why the greedy choice is safe,
            why the DP recurrence covers all cases).
          </li>
        </ol>

        <Callout variant="warn" title="Don&apos;t skip the writeups">
          <p>
            The writeup forces you to externalize the thinking. Half the value of solving the problem is gone if
            you can&apos;t articulate why your solution works. In interviews you have to talk while you code; the
            writeup is just a slower-paced version of the same skill. It also doubles as a portfolio artifact —
            a 20-problem repo with clean solutions <em>and</em>{" "}writeups is interview-prep gold.
          </p>
        </Callout>

        <h3>How to use the rest of this module</h3>

        <p>
          For each problem: read the statement, pause, do the &quot;identify the pattern&quot; step <em>before</em>{" "}
          you scroll. The <code>ClassifyChallenge</code> blocks at the end of each section let you self-grade
          your pattern recognition. The Java sketches are deliberately small — 5–25 lines — because the goal is
          to verify the pattern, not to ship production code.
        </p>

        <p>
          Time budget: ~10 minutes per easy problem, ~15 minutes per medium, ~25 minutes per hard. If you blow
          past those, that&apos;s a signal to look at the sketch and then come back to type your own from scratch.
          Don&apos;t turn a capstone into a perfectionism trap.
        </p>

        <Quiz
          kind="Setup check"
          question="Why does the routine insist on the 'justify out loud' step before sketching code?"
          options={[
            { label: "It's how interviewers grade you, but doesn't actually help your solution.", explanation: "It does both — articulating the pattern catches misreads of the problem and rules out worse approaches before you commit to them." },
            { label: "Because pattern-naming forces you to rule out alternatives, surfaces misreads of the problem early, and is exactly the muscle interviewers grade.", correct: true, explanation: "Right — and most engineers who say 'I know the patterns' fail to do this step under pressure. The capstone makes it a habit." },
            { label: "It slows you down on purpose so you don't finish the capstone too quickly.", explanation: "There's no benefit to artificial slowness; the benefit is real (fewer bad starts)." },
            { label: "Java compiles faster after you've thought about the problem.", explanation: "Compile time is unrelated to your thinking time." },
          ]}
        />

        <Quiz
          kind="Setup check"
          question="A problem says 'find the longest contiguous subarray with sum exactly K, where the array can contain negative numbers'. Which pattern is it?"
          options={[
            { label: "Sliding window — it's a contiguous subarray.", explanation: "Sliding window only works when the window's sum (or other metric) is monotonic — adding an element makes it bigger, removing makes it smaller. Negatives break that." },
            { label: "Prefix sum + HashMap — store the first index where each prefix sum was seen, then for each new prefix S, check if S − K is in the map.", correct: true, explanation: "Right — this is the classic 'subarray sum equals K' trick. The hashmap is what makes it O(n); without negatives, sliding window would also work." },
            { label: "Two pointers — sort the array first, then narrow inward.", explanation: "Sorting destroys the contiguous-subarray semantics. This is one of the most common misreads of the problem." },
            { label: "Brute force — try every subarray.", explanation: "That's O(n²) subarrays times O(n) to sum each = O(n³); even with prefix sums it's O(n²). The hashmap trick is O(n)." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Checkpoint 2 · Easy set ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="easy-set" title="I solved problems 1–5 and named each pattern" xp={20}>
      <section>
        <h2 id="easy-set">Easy set · problems 1–5 · pattern-recognition warmup</h2>

        <p>
          Five classic easies. Each one is a single named pattern in pure form — no twists, no traps.
          The exercise isn&apos;t to solve them (you can solve all five in your sleep) — it&apos;s to name
          the pattern out loud before you write the loop.
        </p>

        <h3>Problem 1 · Two Sum (LC 1)</h3>

        <p>
          <em>Given an array of integers and a target, return the indices of the two numbers that add to the
          target.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}HashMap (complement lookup). For each element <code>x</code>, check if{" "}
          <code>target − x</code> is already in the map. O(n) time, O(n) space.
        </p>

        <CodeBlock lang="java">{`public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        Integer j = seen.get(target - nums[i]);
        if (j != null) return new int[]{j, i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`}</CodeBlock>

        <h3>Problem 2 · Valid Parentheses (LC 20)</h3>

        <p>
          <em>Given a string of brackets, decide if they&apos;re properly nested.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Stack. Push openers; on a closer, pop and verify it matches. The string is
          valid iff the stack ends empty. O(n) / O(n).
        </p>

        <CodeBlock lang="java">{`public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == ']' && top != '[') return false;
            if (c == '}' && top != '{') return false;
        }
    }
    return stack.isEmpty();
}`}</CodeBlock>

        <h3>Problem 3 · Maximum Depth of Binary Tree (LC 104)</h3>

        <p>
          <em>Return the height of a binary tree.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Tree DFS / tree DP. Each node&apos;s answer is{" "}
          <code>1 + max(left, right)</code>. Empty tree has depth 0. O(n) / O(h).
        </p>

        <CodeBlock lang="java">{`public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`}</CodeBlock>

        <h3>Problem 4 · Best Time to Buy and Sell Stock (LC 121)</h3>

        <p>
          <em>One buy, one later sell. Maximize profit.</em>
        </p>

        <p>
          <strong>Pattern:</strong> 1D DP / single-pass running min. As you scan, track the minimum price seen so
          far; the best profit ending at <code>i</code> is <code>price[i] − minSoFar</code>. O(n) / O(1).
        </p>

        <CodeBlock lang="java">{`public int maxProfit(int[] prices) {
    int minSoFar = Integer.MAX_VALUE, best = 0;
    for (int p : prices) {
        if (p < minSoFar) minSoFar = p;
        else if (p - minSoFar > best) best = p - minSoFar;
    }
    return best;
}`}</CodeBlock>

        <h3>Problem 5 · Reverse Linked List (LC 206)</h3>

        <p>
          <em>Reverse a singly linked list.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Linked-list pointer manipulation. Walk the list, flipping each{" "}
          <code>next</code> to point at the previous node. Three pointers: <code>prev</code>, <code>cur</code>,{" "}
          <code>next</code>. O(n) / O(1).
        </p>

        <CodeBlock lang="java">{`public ListNode reverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        ListNode next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`}</CodeBlock>

        <ClassifyChallenge
          title="Map each easy to its pattern"
          prompt="Without scrolling back up — match each problem statement to the pattern you&apos;d use."
          buckets={[
            { id: "hashmap", label: "HashMap", color: "emerald" },
            { id: "stack", label: "Stack", color: "amber" },
            { id: "tree-dfs", label: "Tree DFS", color: "rose" },
            { id: "1d-dp", label: "1D DP / running min", color: "sky" },
            { id: "linked-list", label: "Linked-list pointers", color: "violet" },
          ]}
          items={[
            { id: "p1", label: "Find two indices in an array whose values sum to a target.", answer: "hashmap", explanation: "Complement lookup — for each x, ask if target − x has been seen. O(n)." },
            { id: "p2", label: "Decide whether a string of brackets is properly nested.", answer: "stack", explanation: "Push openers, pop and check on closers. The shape of nesting maps directly to the LIFO discipline." },
            { id: "p3", label: "Return the height of a binary tree.", answer: "tree-dfs", explanation: "Recursive: 1 + max(left depth, right depth). Tree DP in its simplest form." },
            { id: "p4", label: "Single buy, single later sell — maximize profit on a price series.", answer: "1d-dp", explanation: "Running min of the prefix; best profit at i is price[i] − minSoFar. A 1D DP collapsed to two scalars." },
            { id: "p5", label: "Reverse a singly linked list in place.", answer: "linked-list", explanation: "Three-pointer walk, flipping next at each step. The canonical pointer-manipulation drill." },
          ]}
        />

        <Quiz
          kind="Easy-set check"
          question="Two Sum can also be solved by sorting + two pointers. Why is the HashMap solution preferred?"
          options={[
            { label: "Sorting destroys the original indices, and the problem asks for indices into the original array; the HashMap solves it in one pass at O(n) without losing index info.", correct: true, explanation: "Right — sort+two-pointers is O(n log n) AND requires extra bookkeeping to recover the original positions. HashMap is strictly better here." },
            { label: "HashMap is faster than two pointers in all cases.", explanation: "Not true generally — for sorted-array variants of 'two sum', two pointers is preferred." },
            { label: "Sorting modifies the input.", explanation: "You can copy first; the real issue is index preservation." },
            { label: "HashMap uses less memory.", explanation: "It uses more memory than in-place sorting; the win is correctness given the problem's indices requirement." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Checkpoint 3 · Medium part 1 ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="medium-1" title="I solved problems 6–12" xp={30}>
      <section>
        <h2 id="medium-1">Medium set part 1 · problems 6–12</h2>

        <p>
          Now the meat of pattern recognition. Each of these is a textbook example of one named pattern, but
          the surface descriptions diverge enough that you have to actually <em>read</em>{" "}instead of guess.
        </p>

        <h3>Problem 6 · 3Sum (LC 15)</h3>

        <p>
          <em>Given an array, return all unique triplets that sum to zero.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Sort + two pointers, with a fixed outer index. For each <code>i</code>,
          two-pointer search for <code>−nums[i]</code> in the remaining suffix. Skip duplicates at every level
          to dedupe. <strong>Complexity:</strong>{" "}O(n²). <strong>Key insight:</strong>{" "}the moment you sort, the
          two-pointer technique unlocks O(n) per outer iteration instead of O(n²) for a naive nested search.
        </p>

        <CodeBlock lang="java">{`public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> out = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;        // dedup outer
        int l = i + 1, r = nums.length - 1, target = -nums[i];
        while (l < r) {
            int s = nums[l] + nums[r];
            if (s == target) {
                out.add(List.of(nums[i], nums[l], nums[r]));
                while (l < r && nums[l] == nums[l + 1]) l++;  // dedup inner
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++; r--;
            } else if (s < target) l++;
            else r--;
        }
    }
    return out;
}`}</CodeBlock>

        <h3>Problem 7 · Number of Islands (LC 200)</h3>

        <p>
          <em>Given a grid of &apos;1&apos; (land) and &apos;0&apos; (water), count connected land components.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Grid DFS (or BFS, or DSU). For each unvisited land cell, run DFS to flood-fill
          the whole island, count it once. <strong>Complexity:</strong>{" "}O(rows × cols). <strong>Key
          insight:</strong>{" "}counting connected components is the canonical &quot;DFS scan a grid&quot; problem
          — every cell is visited exactly once total across all DFS launches.
        </p>

        <CodeBlock lang="java">{`public int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { dfs(grid, r, c); count++; }
    return count;
}
private void dfs(char[][] g, int r, int c) {
    if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';                                            // mark visited in place
    dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);
}`}</CodeBlock>

        <h3>Problem 8 · Course Schedule (LC 207)</h3>

        <p>
          <em>Given prerequisites between courses, decide if all courses can be completed (i.e. is the dependency
          graph acyclic?).</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Topological sort / cycle detection on a directed graph. Either Kahn&apos;s
          algorithm (BFS over in-degrees) or DFS with a 3-color marking. <strong>Complexity:</strong>{" "}O(V + E).{" "}
          <strong>Key insight:</strong> &quot;can you finish&quot; ≡ &quot;is there a cycle?&quot; — that
          translation is the whole pattern.
        </p>

        <CodeBlock lang="java">{`public boolean canFinish(int n, int[][] prereqs) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] p : prereqs) { g.get(p[1]).add(p[0]); indeg[p[0]]++; }

    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.offer(i);
    int taken = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); taken++;
        for (int v : g.get(u)) if (--indeg[v] == 0) q.offer(v);
    }
    return taken == n;                                        // all consumed → no cycle
}`}</CodeBlock>

        <h3>Problem 9 · Coin Change (LC 322)</h3>

        <p>
          <em>Given coin denominations and an amount, return the minimum number of coins to make the amount, or
          −1 if impossible.</em>
        </p>

        <p>
          <strong>Pattern:</strong> 1D DP (unbounded knapsack flavor). <code>dp[a] = 1 + min(dp[a − c])</code>{" "}
          over all coins <code>c ≤ a</code>. <strong>Complexity:</strong>{" "}O(amount × coins). <strong>Key
          insight:</strong>{" "}greedy fails on non-canonical coin sets (e.g. [1, 3, 4] for amount 6: greedy gives
          4+1+1=3 coins, DP gives 3+3=2). Recognize this trap and reach for DP.
        </p>

        <CodeBlock lang="java">{`public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);                              // sentinel "impossible"
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}`}</CodeBlock>

        <h3>Problem 10 · Longest Substring Without Repeating Characters (LC 3)</h3>

        <p>
          <em>Find the length of the longest substring of a string with all distinct characters.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Sliding window with a HashSet (or HashMap of last-seen index).
          Expand right; on a duplicate, shrink left until the duplicate is gone. <strong>Complexity:</strong>{" "}
          O(n) amortized — each character enters and leaves the window once. <strong>Key insight:</strong>{" "}the
          window is monotonic in &quot;distinctness,&quot; so the standard expand-then-shrink template applies.
        </p>

        <CodeBlock lang="java">{`public int lengthOfLongestSubstring(String s) {
    Set<Character> win = new HashSet<>();
    int best = 0, l = 0;
    for (int r = 0; r < s.length(); r++) {
        while (!win.add(s.charAt(r))) win.remove(s.charAt(l++));
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <h3>Problem 11 · Top K Frequent Elements (LC 347)</h3>

        <p>
          <em>Given an array, return the K most frequent elements.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}HashMap to count + min-heap of size K (or bucket sort for the O(n) version).{" "}
          <strong>Complexity:</strong>{" "}O(n log K) for the heap solution. <strong>Key insight:</strong>{" "}two
          patterns composed — &quot;count with map&quot; from Phase 3, &quot;top-K with bounded heap&quot; from
          the heaps module.
        </p>

        <CodeBlock lang="java">{`public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int x : nums) freq.merge(x, 1, Integer::sum);
    PriorityQueue<Map.Entry<Integer, Integer>> heap =
        new PriorityQueue<>(Comparator.comparingInt(Map.Entry::getValue));
    for (var e : freq.entrySet()) {
        heap.offer(e);
        if (heap.size() > k) heap.poll();
    }
    int[] out = new int[k];
    for (int i = k - 1; i >= 0; i--) out[i] = heap.poll().getKey();
    return out;
}`}</CodeBlock>

        <h3>Problem 12 · Word Break (LC 139)</h3>

        <p>
          <em>Given a string and a dictionary, decide if the string can be segmented into a sequence of
          dictionary words.</em>
        </p>

        <p>
          <strong>Pattern:</strong> 1D DP on string positions. <code>dp[i] = true</code> if some prefix ending
          at position <code>i</code> is reachable: <code>dp[i] = OR over j&lt;i of (dp[j] AND s[j..i] in
          dict)</code>. <strong>Complexity:</strong>{" "}O(n² · L) where L is max word length, or O(n²) if you cap
          inner length at <code>maxWordLen</code>. <strong>Key insight:</strong>{" "}backtracking would be
          exponential; the DP is what makes it tractable.
        </p>

        <CodeBlock lang="java">{`public boolean wordBreak(String s, List<String> wordDict) {
    Set<String> dict = new HashSet<>(wordDict);
    boolean[] dp = new boolean[s.length() + 1];
    dp[0] = true;
    for (int i = 1; i <= s.length(); i++)
        for (int j = 0; j < i; j++)
            if (dp[j] && dict.contains(s.substring(j, i))) { dp[i] = true; break; }
    return dp[s.length()];
}`}</CodeBlock>

        <ClassifyChallenge
          title="Pattern recognition · problems 6–12"
          prompt="Match each problem to its primary pattern. Some sound like one pattern but are actually another — read carefully."
          buckets={[
            { id: "two-pointers", label: "Sort + two pointers", color: "amber" },
            { id: "grid-dfs", label: "Grid DFS / BFS", color: "emerald" },
            { id: "topo", label: "Topological sort", color: "sky" },
            { id: "1d-dp", label: "1D DP", color: "rose" },
            { id: "sliding-window", label: "Sliding window", color: "violet" },
            { id: "heap", label: "HashMap + heap", color: "indigo" },
          ]}
          items={[
            { id: "p6",  label: "All unique triplets in an unsorted array that sum to zero.",                                  answer: "two-pointers", explanation: "Sort first, then a fixed outer index plus a two-pointer scan over the suffix. Sorting is what unlocks the O(n²)." },
            { id: "p7",  label: "Count connected land components in a 2D grid of land/water cells.",                            answer: "grid-dfs",     explanation: "Standard DFS flood fill. Each cell is visited once across all launches." },
            { id: "p8",  label: "Decide if all courses can be completed given prerequisites between them.",                     answer: "topo",         explanation: "Cycle detection on a directed graph — Kahn's algorithm or 3-color DFS." },
            { id: "p9",  label: "Minimum number of coins from a denomination set to make a target amount.",                     answer: "1d-dp",        explanation: "dp[a] = 1 + min(dp[a − c]). Greedy fails on non-canonical coin sets, which is why DP." },
            { id: "p10", label: "Longest substring of a string with all distinct characters.",                                  answer: "sliding-window", explanation: "Window that grows on the right and shrinks on the left when duplicates appear. Each char enters/leaves once." },
            { id: "p11", label: "K most frequent elements in an array.",                                                        answer: "heap",         explanation: "Count with HashMap, then bounded min-heap of size K. Two patterns composed." },
            { id: "p12", label: "Decide if a string can be segmented into space-separated dictionary words.",                   answer: "1d-dp",        explanation: "dp[i] = some j < i with dp[j] true AND s[j..i] in dict. Naive recursion is exponential." },
          ]}
        />

        <Callout variant="insight" title="Why two of these are 1D DP">
          <p>
            Coin Change and Word Break feel different — one is numbers, one is strings — but they share the
            structure: a 1D state indexed by &quot;position so far,&quot; with a transition that loops over a
            small set of choices (denominations / split points). Once you see that shape, you reach for 1D DP
            without thinking. That generalization is what the capstone is training.
          </p>
        </Callout>

        <Quiz
          kind="Medium check"
          question="Why does 'Number of Islands' work the same with DFS, BFS, or Union-Find?"
          options={[
            { label: "Connected-component counting only requires the components partition; DFS, BFS, and Union-Find all compute the same partition with the same total work, just in different orders.", correct: true, explanation: "Right — for connectivity questions the choice is taste / use case (DSU shines for streaming edges, DFS for static grids, BFS if you also need shortest distances)." },
            { label: "Java's standard library has built-in implementations of all three.", explanation: "Stdlib presence is irrelevant to algorithmic equivalence." },
            { label: "Grids only have small inputs.", explanation: "Inputs can be 10⁶+ cells; the equivalence is structural, not size-based." },
            { label: "DFS, BFS, and DSU happen to share a complexity class on grids.", explanation: "They share more than complexity — they all compute the partition." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Checkpoint 4 · Medium part 2 ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="medium-2" title="I solved problems 13–17" xp={30}>
      <section>
        <h2 id="medium-2">Medium set part 2 · problems 13–17</h2>

        <h3>Problem 13 · LRU Cache (LC 146)</h3>

        <p>
          <em>Design a cache with O(1) <code>get</code> and <code>put</code>; on capacity overflow, evict the
          least-recently-used entry.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}HashMap + Doubly Linked List. The map gives O(1) lookup by key. The doubly
          linked list maintains usage order with O(1) move-to-front and O(1) tail removal. The two structures
          are linked: each map value <em>is</em>{" "}a node in the list. <strong>Complexity:</strong>{" "}O(1) per
          operation, O(capacity) space.
        </p>

        <Callout variant="info" title="The composition you haven&apos;t seen before">
          <p>
            We covered HashMaps and linked lists separately. LRU is the canonical example of joining them — the
            map points <em>at</em>{" "}list nodes, so a key lookup gives you direct pointer access to the position
            in the list. Internalize this combo: it shows up in caches, in &quot;find any element by key in
            O(1) and also remove it in O(1)&quot; problems, and in interview design questions.
          </p>
        </Callout>

        <CodeBlock lang="java">{`class LRUCache {
    private static class Node {
        int key, val; Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private final int cap;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail; tail.prev = head;
    }
    public int get(int key) {
        Node n = map.get(key);
        if (n == null) return -1;
        moveToFront(n);
        return n.val;
    }
    public void put(int key, int value) {
        Node n = map.get(key);
        if (n != null) { n.val = value; moveToFront(n); return; }
        n = new Node(key, value);
        map.put(key, n);
        addFront(n);
        if (map.size() > cap) {
            Node lru = tail.prev;
            unlink(lru);
            map.remove(lru.key);
        }
    }
    private void addFront(Node n) { n.next = head.next; n.prev = head; head.next.prev = n; head.next = n; }
    private void unlink(Node n)   { n.prev.next = n.next; n.next.prev = n.prev; }
    private void moveToFront(Node n) { unlink(n); addFront(n); }
}`}</CodeBlock>

        <h3>Problem 14 · Validate Binary Search Tree (LC 98)</h3>

        <p>
          <em>Given a binary tree, decide if it&apos;s a valid BST.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}DFS with a window of valid bounds, OR in-order traversal checking
          monotonicity. <strong>Complexity:</strong>{" "}O(n) / O(h). <strong>Key insight:</strong>{" "}the naive
          &quot;left.val &lt; root.val &lt; right.val&quot; check fails — a deep right descendant of a left
          subtree might still violate the BST. The bounded recursion fixes this by passing a (lo, hi) window
          down.
        </p>

        <CodeBlock lang="java">{`public boolean isValidBST(TreeNode root) {
    return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE);
}
private boolean dfs(TreeNode n, long lo, long hi) {
    if (n == null) return true;
    if (n.val <= lo || n.val >= hi) return false;
    return dfs(n.left, lo, n.val) && dfs(n.right, n.val, hi);
}`}</CodeBlock>

        <h3>Problem 15 · Daily Temperatures (LC 739)</h3>

        <p>
          <em>For each day, find how many days until a strictly warmer temperature.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Monotonic stack. Maintain a stack of indices whose temperature is
          decreasing; when you see a warmer day, pop and record the distance. <strong>Complexity:</strong>{" "}O(n)
          — each index pushed and popped at most once. <strong>Key insight:</strong> &quot;next greater
          element&quot; is the canonical monotonic-stack signal.
        </p>

        <CodeBlock lang="java">{`public int[] dailyTemperatures(int[] t) {
    int n = t.length;
    int[] ans = new int[n];
    Deque<Integer> stack = new ArrayDeque<>();                // indices, decreasing temps
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && t[i] > t[stack.peek()]) {
            int j = stack.pop();
            ans[j] = i - j;
        }
        stack.push(i);
    }
    return ans;                                               // remaining stack: never warmer → 0 (default)
}`}</CodeBlock>

        <h3>Problem 16 · House Robber (LC 198)</h3>

        <p>
          <em>You can&apos;t rob two adjacent houses. Maximize total.</em>
        </p>

        <p>
          <strong>Pattern:</strong> 1D DP with two states. <code>dp[i] = max(dp[i−1], dp[i−2] + nums[i])</code>{" "}
          — at each house, either skip and keep the previous best, or rob it and add to the answer two back.
          Collapse to two scalars for O(1) space. <strong>Complexity:</strong>{" "}O(n) / O(1).
        </p>

        <CodeBlock lang="java">{`public int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;
    for (int x : nums) {
        int cur = Math.max(prev1, prev2 + x);
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`}</CodeBlock>

        <h3>Problem 17 · Search in Rotated Sorted Array (LC 33)</h3>

        <p>
          <em>A sorted array has been rotated at some pivot. Find a target in O(log n).</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Modified binary search. At each step one half of the array is sorted; figure
          out which half, then decide whether the target is in that half. <strong>Complexity:</strong>{" "}O(log n).{" "}
          <strong>Key insight:</strong> &quot;compare nums[mid] to nums[lo]&quot; tells you which half is the
          sorted one — that&apos;s the whole trick.
        </p>

        <CodeBlock lang="java">{`public int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) >>> 1;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {                          // left half sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                              // right half sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`}</CodeBlock>

        <ClassifyChallenge
          title="Pattern recognition · problems 13–17"
          prompt="Each of these has a primary structure or technique. Pick the right one."
          buckets={[
            { id: "lru", label: "HashMap + Doubly Linked List", color: "indigo" },
            { id: "bst-bounds", label: "DFS with bounds window", color: "emerald" },
            { id: "monotonic-stack", label: "Monotonic stack", color: "amber" },
            { id: "1d-dp", label: "1D DP", color: "rose" },
            { id: "modified-bsearch", label: "Modified binary search", color: "sky" },
          ]}
          items={[
            { id: "p13", label: "Cache with O(1) get/put and least-recently-used eviction.",                      answer: "lru",              explanation: "Map for keyed lookup, doubly linked list for ordering. The map values point at list nodes." },
            { id: "p14", label: "Decide if a binary tree satisfies the BST invariant globally.",                  answer: "bst-bounds",       explanation: "Recurse with (lo, hi) bounds. The naive 'compare to immediate children' check fails." },
            { id: "p15", label: "For each index in an array, find the distance to the next strictly greater value.", answer: "monotonic-stack", explanation: "Stack of decreasing values; pop when a greater one arrives. The textbook 'next greater element'." },
            { id: "p16", label: "Maximum sum of a subset of array elements with no two adjacent elements chosen.", answer: "1d-dp",            explanation: "dp[i] = max(dp[i−1], dp[i−2] + nums[i]). Two-scalar rolling window for O(1) space." },
            { id: "p17", label: "Find a target in a sorted-then-rotated array in O(log n).",                       answer: "modified-bsearch", explanation: "At each midpoint, one of (lo, mid) or (mid, hi) is sorted — pick the side that could contain the target." },
          ]}
        />

        <Quiz
          kind="Medium check"
          question="In the LRU cache, why is a doubly linked list (not singly linked) required for O(1) operations?"
          options={[
            { label: "Doubly linked lists allow forward iteration; singly linked lists don't.", explanation: "Singly linked lists support forward iteration just fine." },
            { label: "When you remove an arbitrary node (the one you got from the map), you need O(1) access to its predecessor — only the doubly linked list provides that via the prev pointer.", correct: true, explanation: "Right. With a singly linked list you'd have to walk from head to find the predecessor, which is O(n) — defeating the purpose." },
            { label: "Doubly linked lists use less memory.", explanation: "They use more — extra prev pointer per node." },
            { label: "Java's LinkedList is doubly linked.", explanation: "True but irrelevant to the algorithmic requirement." },
          ]}
        />

        <Quiz
          kind="Medium check"
          question="Daily Temperatures could be solved naively in O(n²) by scanning forward from each index. Why is the monotonic stack solution O(n)?"
          options={[
            { label: "Because the stack is bounded in size.", explanation: "The bound on size helps but isn't the core argument." },
            { label: "Each index is pushed exactly once and popped at most once across the whole run, so the total work over the loop is O(n) even though the inner while looks quadratic.", correct: true, explanation: "Right — amortized analysis. The outer for loop runs n times, but the total work done by the inner while across the whole run is bounded by n pops." },
            { label: "Because the array is sorted.", explanation: "The array is not sorted; that's precisely why the naive approach is O(n²)." },
            { label: "The JVM optimizes it.", explanation: "The complexity is algorithmic, not language-runtime-specific." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Checkpoint 5 · Hard set ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="hard-set" title="I solved problems 18–20" xp={40}>
      <section>
        <h2 id="hard-set">Hard set · problems 18–20</h2>

        <p>
          The last three. These are the &quot;you&apos;ve practiced the patterns and now you&apos;re combining
          two of them under pressure&quot; problems. None of them require new theory — they require recognition
          plus careful execution. Take your time. Trace on paper before typing.
        </p>

        <h3>Problem 18 · Word Search II (LC 212)</h3>

        <p>
          <em>Given a 2D board of letters and a list of words, return all words that appear on the board (each
          letter cell used at most once per word, adjacent cells horizontally / vertically).</em>
        </p>

        <p>
          <strong>Patterns:</strong>{" "}Trie + DFS / backtracking. <strong>Why both:</strong>{" "}the naive approach
          would run a separate DFS-search per word — O(W · cells · 4ᴸ). With a Trie you traverse the board
          once, and at each step ask &quot;does this prefix exist in the dictionary?&quot; If not, prune.
          That&apos;s how you handle thousands of words at once.
        </p>

        <p>
          <strong>Why this pattern combination ruled in:</strong>{" "}the words list is large (often hundreds), so
          per-word DFS is too slow. Tries shine when you need to test many strings against a shared prefix
          structure. DFS is forced because of the 2D board adjacency. Greedy doesn&apos;t work because choices
          are not locally optimal. DP doesn&apos;t apply because there&apos;s no overlapping subproblem on
          (cell, prefix) — the visited set is path-dependent.
        </p>

        <CodeBlock lang="java">{`class TrieNode {
    TrieNode[] kids = new TrieNode[26];
    String word;                                              // non-null at terminal node
}

public List<String> findWords(char[][] board, String[] words) {
    TrieNode root = new TrieNode();
    for (String w : words) {
        TrieNode n = root;
        for (char c : w.toCharArray()) {
            int idx = c - 'a';
            if (n.kids[idx] == null) n.kids[idx] = new TrieNode();
            n = n.kids[idx];
        }
        n.word = w;
    }

    List<String> out = new ArrayList<>();
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            dfs(board, r, c, root, out);
    return out;
}

private void dfs(char[][] b, int r, int c, TrieNode node, List<String> out) {
    if (r < 0 || r >= b.length || c < 0 || c >= b[0].length) return;
    char ch = b[r][c];
    if (ch == '#') return;
    TrieNode next = node.kids[ch - 'a'];
    if (next == null) return;                                 // prefix not in dict — prune
    if (next.word != null) { out.add(next.word); next.word = null; }   // dedup hits

    b[r][c] = '#';
    dfs(b, r+1, c, next, out);
    dfs(b, r-1, c, next, out);
    dfs(b, r, c+1, next, out);
    dfs(b, r, c-1, next, out);
    b[r][c] = ch;                                             // restore
}`}</CodeBlock>

        <h3>Problem 19 · Longest Increasing Path in a Matrix (LC 329)</h3>

        <p>
          <em>Given a 2D matrix of integers, return the length of the longest strictly increasing path (move
          horizontally / vertically).</em>
        </p>

        <p>
          <strong>Patterns:</strong>{" "}DFS + memoization (equivalently: DP on a DAG). <strong>Why:</strong>{" "}from
          each cell, the longest increasing path is <code>1 + max(longest from neighbor n where matrix[n] &gt;
          matrix[cell])</code>. Memoize because many cells share the same suffix path. Note the matrix forms a
          DAG when you orient each edge from smaller to larger — so every cell&apos;s answer depends only on
          strictly larger cells, no cycles, no &quot;visited&quot; set needed.
        </p>

        <p>
          <strong>What this is not:</strong>{" "}not BFS (BFS gives shortest, not longest, paths). Not Dijkstra
          (no weights). Not standard DP-on-grid (the recurrence isn&apos;t left-to-right; it follows the value
          ordering). The &quot;DAG-DP via memoized DFS&quot; framing is what unlocks it.
        </p>

        <CodeBlock lang="java">{`private int[][] memo;
private int[][] matrix;
private static final int[][] D = {{1,0},{-1,0},{0,1},{0,-1}};

public int longestIncreasingPath(int[][] m) {
    matrix = m;
    int rows = m.length, cols = m[0].length, best = 0;
    memo = new int[rows][cols];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            best = Math.max(best, dfs(r, c));
    return best;
}

private int dfs(int r, int c) {
    if (memo[r][c] != 0) return memo[r][c];
    int best = 1;
    for (int[] d : D) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length
            && matrix[nr][nc] > matrix[r][c]) {
            best = Math.max(best, 1 + dfs(nr, nc));
        }
    }
    memo[r][c] = best;
    return best;
}`}</CodeBlock>

        <h3>Problem 20 · Median of Two Sorted Arrays (LC 4)</h3>

        <p>
          <em>Given two sorted arrays, find the median of their merged sorted form in O(log(min(m, n))) time.</em>
        </p>

        <p>
          <strong>Pattern:</strong>{" "}Binary search on partition. <strong>Why:</strong>{" "}the obvious O(m + n) merge
          violates the time bound. The trick is to binary-search a partition index <code>i</code> in the smaller
          array; the partition in the larger array is determined by{" "}
          <code>j = (m + n + 1) / 2 − i</code>. The partition is correct iff{" "}
          <code>A[i−1] ≤ B[j]</code> and <code>B[j−1] ≤ A[i]</code>. Adjust <code>i</code> via binary search
          until both hold.
        </p>

        <p>
          <strong>Why this pattern was the only fit:</strong>{" "}the time bound forces logarithmic. Anything
          O(m + n) is ruled out. Sorted-input + log-time + &quot;find a boundary&quot; is the binary-search
          signature. The trickiness is recognizing that the boundary is a partition between two arrays, not a
          single index in one.
        </p>

        <CodeBlock lang="java">{`public double findMedianSortedArrays(int[] a, int[] b) {
    if (a.length > b.length) { int[] t = a; a = b; b = t; }   // binary-search the shorter
    int m = a.length, n = b.length;
    int lo = 0, hi = m, half = (m + n + 1) / 2;

    while (lo <= hi) {
        int i = (lo + hi) / 2;
        int j = half - i;
        int aLeft  = (i == 0) ? Integer.MIN_VALUE : a[i - 1];
        int aRight = (i == m) ? Integer.MAX_VALUE : a[i];
        int bLeft  = (j == 0) ? Integer.MIN_VALUE : b[j - 1];
        int bRight = (j == n) ? Integer.MAX_VALUE : b[j];

        if (aLeft <= bRight && bLeft <= aRight) {
            if ((m + n) % 2 == 1) return Math.max(aLeft, bLeft);
            return (Math.max(aLeft, bLeft) + Math.min(aRight, bRight)) / 2.0;
        } else if (aLeft > bRight) hi = i - 1;
        else                       lo = i + 1;
    }
    throw new IllegalStateException();                        // unreachable on valid input
}`}</CodeBlock>

        <Callout variant="warn" title="If LC 4 doesn&apos;t click on first read, that&apos;s normal">
          <p>
            Median of Two Sorted Arrays is famously the hardest binary-search problem on the platform. The
            insight that the median is determined by two partition indices that satisfy a simple inequality is
            not at all obvious until you&apos;ve worked through it. Trace it on a small example
            (<code>a = [1,3]</code>, <code>b = [2]</code>) on paper before trusting the code.
          </p>
        </Callout>

        <ClassifyChallenge
          title="Pattern recognition · problems 18–20"
          prompt="The hard set. Each problem combines two patterns; pick the primary one."
          buckets={[
            { id: "trie-dfs", label: "Trie + DFS", color: "indigo" },
            { id: "memo-dfs", label: "Memoized DFS / DAG-DP", color: "emerald" },
            { id: "bsearch-partition", label: "Binary search on partition", color: "rose" },
          ]}
          items={[
            { id: "p18", label: "Find every dictionary word that appears on a 2D letter grid (orthogonal adjacency, no cell reuse).",     answer: "trie-dfs",          explanation: "Trie of all words, DFS the grid testing prefixes against the trie. Per-word DFS would be too slow." },
            { id: "p19", label: "Longest strictly increasing path in a 2D integer matrix (4-directional moves).",                          answer: "memo-dfs",          explanation: "Each cell's best path = 1 + max(neighbor with greater value). Memoize. The grid is a DAG once edges are oriented by value." },
            { id: "p20", label: "Median of the merge of two sorted arrays in O(log(min(m, n))) time.",                                     answer: "bsearch-partition", explanation: "Binary-search the partition index in the shorter array; the other partition is determined." },
          ]}
        />

        <Quiz
          kind="Hard-set check"
          question="Why does Word Search II use a Trie instead of just running a DFS-search for each word independently?"
          options={[
            { label: "The Trie sorts the dictionary alphabetically.", explanation: "Sorting is irrelevant; the win is shared-prefix pruning." },
            { label: "With a Trie you traverse the board only once and prune the moment the current prefix doesn't exist in any word; per-word DFS does redundant work for shared prefixes.", correct: true, explanation: "Right — Tries shine exactly when many strings share prefixes you can test against in O(1) per character." },
            { label: "Java's built-in Trie class is faster than HashMap.", explanation: "Java has no built-in Trie; that's why we wrote one." },
            { label: "Tries are easier to write than HashMap.", explanation: "They're a bit harder; the win is algorithmic." },
          ]}
        />

        <Quiz
          kind="Hard-set check"
          question="Why doesn&apos;t Longest Increasing Path in a Matrix need a 'visited' set, even though it&apos;s a DFS on a graph that has cycles in the adjacency sense?"
          options={[
            { label: "Memoization replaces the visited set.", explanation: "Memo and visited are different concepts — memo is a value cache, visited is a recursion guard." },
            { label: "Once you orient each edge from smaller value to larger value, the graph is a DAG; you can never revisit a cell on the path because that would require equal-or-decreasing values, which the recurrence forbids.", correct: true, explanation: "Right — strict inequality makes the graph acyclic, so DFS terminates without a visited set. Memoization caches the answer per cell so the work is O(rows × cols)." },
            { label: "DFS doesn't need a visited set in general.", explanation: "DFS on graphs with cycles definitely needs one — only DAGs let you skip it." },
            { label: "The matrix is always small.", explanation: "It can be 200×200 in the constraint, plenty large to need careful complexity analysis." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Checkpoint 6 · Final challenge ───────────────── */}
      <Checkpoint moduleSlug="capstone" id="final" title="Final pattern-recognition challenge" xp={50} celebration="That's the course. 34 modules. You can defend every pattern and you finished a 20-problem portfolio. Go solve hundreds more on your own — you have the framework.">
      <section>
        <h2 id="final">Final pattern-recognition challenge</h2>

        <p>
          Twelve problem statements. Some sound like one pattern but are actually another — the kind of trap
          that ends interviews when you skip the &quot;justify out loud&quot; step. Read each carefully and
          pick the optimal pattern, not the first one that pattern-matches the surface words.
        </p>

        <p>
          A few of these are deliberately near-duplicates of each other with one constraint flipped — exactly
          the level of subtlety that separates &quot;memorized templates&quot; from &quot;internalized
          patterns.&quot;
        </p>

        <ClassifyChallenge
          title="Mixed-pattern final"
          prompt="For each statement, pick the BEST pattern. Watch for traps where two patterns are plausible but only one is optimal."
          buckets={[
            { id: "sliding-window", label: "Sliding window", color: "violet" },
            { id: "prefix-hash",    label: "Prefix sum + HashMap", color: "emerald" },
            { id: "binary-search",  label: "Binary search (on answer or array)", color: "sky" },
            { id: "bfs",            label: "BFS (shortest path / level)", color: "amber" },
            { id: "dijkstra",       label: "Dijkstra", color: "indigo" },
            { id: "dsu",            label: "Union-Find", color: "rose" },
            { id: "interval-dp",    label: "Interval DP", color: "violet" },
            { id: "tree-dp",        label: "Tree DP", color: "emerald" },
            { id: "bitmask-dp",     label: "Bitmask DP", color: "amber" },
            { id: "greedy",         label: "Greedy", color: "sky" },
          ]}
          items={[
            {
              id: "f1",
              label: "Number of contiguous subarrays whose sum equals K. The array can contain negative numbers.",
              answer: "prefix-hash",
              explanation: "Prefix sum + HashMap — sliding window FAILS because adding a negative number can decrease the running sum, so the window isn't monotonic. The hashmap stores prefix-sum frequencies, and at each position we look up (currentSum − K). O(n).",
            },
            {
              id: "f2",
              label: "Smallest contiguous subarray whose sum is at least K. All numbers are positive.",
              answer: "sliding-window",
              explanation: "Sliding window — adding positives makes the sum grow, removing makes it shrink (monotonic), so the window can expand-then-contract for each right endpoint. O(n).",
            },
            {
              id: "f3",
              label: "Shortest path from a single source in a graph with non-negative edge weights.",
              answer: "dijkstra",
              explanation: "Dijkstra. BFS works only on unit weights. Bellman-Ford is for negative weights or detection.",
            },
            {
              id: "f4",
              label: "Shortest path from source to target in an UNWEIGHTED graph.",
              answer: "bfs",
              explanation: "BFS — every level is a unit-distance step. Don't reach for Dijkstra here; it's correct but unnecessary.",
            },
            {
              id: "f5",
              label: "Given a stream of edges, after each one report whether the graph is connected.",
              answer: "dsu",
              explanation: "Union-Find. Each edge does a union; connectivity = single root. DFS would re-traverse the graph after each edge — O(E²) total — vs near-O(E α(N)) with DSU.",
            },
            {
              id: "f6",
              label: "Find the smallest integer x such that some monotonic predicate isFeasible(x) returns true (e.g. minimum capacity to ship within D days).",
              answer: "binary-search",
              explanation: "Binary search on the answer. The predicate is monotonic in x, so the boundary can be found in O(log range × cost(predicate)).",
            },
            {
              id: "f7",
              label: "Minimum cost to merge an array of stones into one pile, where merging a contiguous range of K piles costs the sum of their weights.",
              answer: "interval-dp",
              explanation: "Interval DP — dp[i][j] = min cost to merge stones i..j. Try every split point and recurse on the two halves. O(n³).",
            },
            {
              id: "f8",
              label: "In a binary tree, find the maximum sum of any path between two nodes (path can start and end anywhere).",
              answer: "tree-dp",
              explanation: "Tree DP. At each node, the best path through it is leftBranch + node.val + rightBranch where each branch is the best downward extension. Recurse and update a global max.",
            },
            {
              id: "f9",
              label: "Travelling salesman on N ≤ 18 cities — minimum tour length visiting each city once.",
              answer: "bitmask-dp",
              explanation: "Bitmask DP. State is (current city, set of visited cities as a bitmask). 2ᴺ × N states, N transitions each. N=18 is the classic ceiling.",
            },
            {
              id: "f10",
              label: "Given non-overlapping intervals already sorted by end time, schedule the maximum number of intervals.",
              answer: "greedy",
              explanation: "Greedy — pick the earliest-ending compatible interval, repeat. Provably optimal by an exchange argument; the textbook example of where greedy works.",
            },
            {
              id: "f11",
              label: "Longest contiguous subarray with at most K distinct integers.",
              answer: "sliding-window",
              explanation: "Sliding window with a HashMap of counts. Expand right; while distinct > K, shrink left. O(n).",
            },
            {
              id: "f12",
              label: "Cheapest flight from A to B with at most K stops, given a list of flights with prices.",
              answer: "dijkstra",
              explanation: "Dijkstra variant with a (city, stops) state — or Bellman-Ford with K+1 relaxations. The 'at most K stops' constraint is what distinguishes it from plain shortest-path.",
            },
          ]}
        />

        <Callout variant="insight" title="The two trap pairs to internalize">
          <p>
            <strong>F1 vs F2</strong> — &quot;subarray sum = K&quot; vs &quot;subarray sum ≥ K with positives.&quot;
            One is prefix-sum + hashmap, the other is sliding window. The constraint &quot;all positive&quot; is
            what unlocks sliding window&apos;s monotonicity. Miss that sentence in the problem statement and
            you&apos;ll either over-engineer (use the hashmap for F2, which still works but is unnecessary) or
            ship a wrong answer (use sliding window for F1, which silently fails on negatives).
          </p>
          <p>
            <strong>F3 vs F4</strong> — Dijkstra vs BFS. Both find shortest paths. BFS works iff every edge has
            the same weight. The instant the problem says &quot;weights&quot; or &quot;costs,&quot; reach for
            Dijkstra.
          </p>
        </Callout>

        <h3>The discipline that compounds</h3>

        <p>
          You&apos;ve done the patterns. The remaining question is: <strong>can you keep doing them when
          you&apos;re tired, when you&apos;re nervous, when the problem statement is half a page long and
          buries the constraint that picks the pattern?</strong>{" "}The honest answer is that consistent practice
          is the only thing that builds that resilience.
        </p>

        <p>
          A working rhythm that has produced offers for hundreds of engineers:
        </p>

        <ul>
          <li>
            <strong>Three problems a day, four days a week.</strong> ~45 minutes per problem with the writeup.
            That&apos;s ~12 problems a week, ~50 a month. After three months you&apos;ve solved 150 — past the
            point where pattern recognition is reflexive.
          </li>
          <li>
            <strong>Every problem gets a writeup.</strong>{" "}Two paragraphs, plain English, named pattern, named
            alternatives ruled out, complexity. The writeup is what turns clicking through into thinking
            through.
          </li>
          <li>
            <strong>Spaced repetition on misses.</strong>{" "}Any problem you couldn&apos;t solve in 30 minutes
            unaided goes into a queue. Re-attempt it 3 days later, then 1 week later, then 1 month later. By
            the third pass it&apos;s yours.
          </li>
          <li>
            <strong>Re-derive the patterns from memory monthly.</strong>{" "}Sit down with a blank piece of paper
            and list all 20 patterns plus one canonical problem for each. If any are fuzzy, that&apos;s your
            week&apos;s study target.
          </li>
        </ul>

        <Callout variant="warn" title="The writeup is not optional">
          <p>
            The single highest-leverage habit in interview prep is articulating the solution before celebrating
            it. Engineers who skip writeups can solve problems but stumble in interviews because they&apos;ve
            never practiced the talking-while-coding step. The writeup is the cheap version of that practice.
            Skipping it forfeits half the value of every problem.
          </p>
        </Callout>

        <Quiz
          kind="Final check"
          question="A problem says: 'count subarrays with sum exactly K.' The constraints note that nums[i] can be negative. A teammate suggests sliding window. What's the right response?"
          options={[
            { label: "Sliding window works fine; it always works on subarrays.", explanation: "It does not. Sliding window requires a monotonic relationship between window size and the metric being maintained — negative numbers break monotonicity." },
            { label: "Push back: sliding window requires monotonicity (adding shrinks/expands the window's metric in a predictable direction). With negatives, adding an element can decrease the sum, so the window can't shrink correctly. Use prefix sum + HashMap instead.", correct: true, explanation: "Right — that's the F1 vs F2 trap. The articulation of WHY sliding window fails is exactly the kind of thing interviewers grade on." },
            { label: "Try sliding window first; if it fails, switch.", explanation: "'Try and see' is fine for prototyping but in an interview you should be able to rule it out by reasoning about constraints." },
            { label: "Both approaches are equivalent in this case.", explanation: "They are not — sliding window is wrong here." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Why is the &apos;justify out loud&apos; step the load-bearing habit for pattern recognition under interview conditions?"
          options={[
            { label: "It impresses interviewers.", explanation: "True but secondary — the primary value is to YOU, not the audience." },
            { label: "Verbalizing the pattern forces you to compare it against alternatives, surfaces misreads of the problem early, and makes the constraints that pick the pattern explicit — exactly the work that prevents wrong starts.", correct: true, explanation: "Right. Engineers who silently type usually pick the first pattern that surface-matches; engineers who articulate end up with the optimal pattern more often, faster." },
            { label: "It buys time while you think.", explanation: "Side benefit, not the core purpose." },
            { label: "It's required by the LeetCode platform.", explanation: "It isn't — this is purely a personal discipline." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="If you had to teach this DSA course in one sentence, which captures it best?"
          options={[
            { label: "Memorize as many LeetCode templates as you can.", explanation: "Templates without understanding break under any twist of the problem statement." },
            { label: "Twenty named patterns cover most interview problems; the skill is recognizing which pattern a new problem maps to (and articulating why) before you write a line of code.", correct: true, explanation: "That's the entire course thesis. Internalize it." },
            { label: "Solve 1,000 problems; quantity beats quality.", explanation: "Quantity without the pattern framework is grinding; quality with the framework is mastery." },
            { label: "Java is the best language for interviews.", explanation: "Surface-level and irrelevant to the substance." },
          ]}
        />

        <PartRecap
          title="Course wrap · what you can now do that you couldn&apos;t 34 modules ago"
          gist="Twenty named patterns. Twenty solved capstone problems. The reflex to read a problem statement and reach for the right tool, with reasons. That&apos;s the package."
          points={[
            { takeaway: "Recognize the right pattern from a problem statement in under 60 seconds.", detail: "Across the 20 patterns, you can read the constraints and call the structure or technique by name before sketching." },
            { takeaway: "Articulate why a pattern fits AND why the obvious-looking alternatives don't.", detail: "Justification is the muscle that wins interviews — and the discipline you built across the writeups." },
            { takeaway: "Implement every pattern from scratch in Java.", detail: "Two pointers, sliding window, binary search, BFS, DFS, Dijkstra, DSU, 1D/2D/interval/tree/bitmask DP, heap, monotonic stack, trie, greedy, backtracking, hashmap, hashset, prefix sum. All of it." },
            { takeaway: "Trace algorithmic choices through complexity arguments.", detail: "Big-O isn't a vocabulary anymore — it's a tool for comparing options before writing code." },
            { takeaway: "Maintain a portfolio repo with 20 fully-written-up solutions.", detail: "An interview asset, a study reference, and a piece of work you can defend at any depth." },
            { takeaway: "Sustain a practice rhythm after the course ends.", detail: "Three problems a day, writeups, spaced repetition. The course is the launchpad; consistency over the next quarter is what cements the skill." },
          ]}
        />

        <div className="not-prose mt-12 p-8 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 text-white">
          <h3 className="text-xl font-bold text-white mt-0 mb-3">You finished the course.</h3>
          <p className="text-white/95 mb-3">
            34 modules. From Big-O notation through every linear data structure, hashing, trees, graphs, the
            algorithmic techniques, dynamic programming in five flavors, advanced graph topics, the interview
            framework, and a 20-problem capstone with writeups. You built ArrayList from scratch. You built a
            HashMap. You built a heap. You wrote BFS, DFS, Dijkstra, Union-Find, and seven kinds of DP — all in
            Java, by hand, with intuition first.
          </p>
          <p className="text-white/95 mb-3">
            Most engineers who say they &quot;know DSA&quot; have done a fraction of this. You can defend every
            pattern. You know <em>why</em>{" "}sliding window fails on negatives, why heapify is O(n) not O(n log n),
            why Dijkstra needs non-negative weights, why DP beats greedy on non-canonical coin sets. You can
            answer the system-design-flavored algorithm questions because you built the structures.
          </p>
          <p className="text-white/95 mb-0">
            Now go practice. The capstone is a starting line, not a finish line. Three problems a day, writeups,
            spaced repetition on the misses. The next interview your company puts you on the loop for — be the
            engineer who already knows what to reach for.
          </p>
        </div>

        <div className="not-prose mt-8 flex justify-center">
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-8 mb-12">
          — Fin —
        </p>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="capstone" />
    </article>
  );
}
