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
  { id: "setup", title: "What backtracking actually is — DFS with state you undo" },
  { id: "template", title: "The choose / explore / unchoose template" },
  { id: "subsets", title: "Subsets and the include-or-not pattern" },
  { id: "permutations", title: "Permutations and the visited-set pattern" },
  { id: "pruning", title: "Pruning: the difference between fast and TLE" },
  { id: "project", title: "Project: N-Queens + Word Search" },
];

export default function BacktrackingModule() {
  const mod = getModuleBySlug("backtracking")!;

  // The implicit choice tree for subsets of {1, 2, 3}
  const subsetTree = `
flowchart TB
    root["[ ]"] -->|"include 1"| A["[1]"]
    root -->|"skip 1"| B["[ ]"]
    A -->|"include 2"| A1["[1,2]"]
    A -->|"skip 2"| A2["[1]"]
    B -->|"include 2"| B1["[2]"]
    B -->|"skip 2"| B2["[ ]"]
    A1 -->|"include 3"| A1a["[1,2,3]"]
    A1 -->|"skip 3"| A1b["[1,2]"]
    A2 -->|"include 3"| A2a["[1,3]"]
    A2 -->|"skip 3"| A2b["[1]"]
    B1 -->|"include 3"| B1a["[2,3]"]
    B1 -->|"skip 3"| B1b["[2]"]
    B2 -->|"include 3"| B2a["[3]"]
    B2 -->|"skip 3"| B2b["[ ]"]
    style root fill:#6366f1,color:#fff,stroke:#4338ca
    style A fill:#818cf8,color:#fff,stroke:#4f46e5
    style B fill:#818cf8,color:#fff,stroke:#4f46e5
    style A1a fill:#a78bfa,color:#000,stroke:#7c3aed
    style A1b fill:#a78bfa,color:#000,stroke:#7c3aed
    style A2a fill:#a78bfa,color:#000,stroke:#7c3aed
    style A2b fill:#a78bfa,color:#000,stroke:#7c3aed
    style B1a fill:#a78bfa,color:#000,stroke:#7c3aed
    style B1b fill:#a78bfa,color:#000,stroke:#7c3aed
    style B2a fill:#a78bfa,color:#000,stroke:#7c3aed
    style B2b fill:#a78bfa,color:#000,stroke:#7c3aed
  `.trim();

  // Permutation decision tree showing the visited-set pattern for [1,2,3]
  const permTree = `
flowchart TB
    R["[ ]<br/>visited={}"] --> A["[1]<br/>visited={1}"]
    R --> B["[2]<br/>visited={2}"]
    R --> C["[3]<br/>visited={3}"]
    A --> A1["[1,2]"]
    A --> A2["[1,3]"]
    A1 --> A1a["[1,2,3]"]
    A2 --> A2a["[1,3,2]"]
    B --> B1["[2,1]"]
    B --> B2["[2,3]"]
    B1 --> B1a["[2,1,3]"]
    B2 --> B2a["[2,3,1]"]
    C --> C1["[3,1]"]
    C --> C2["[3,2]"]
    C1 --> C1a["[3,1,2]"]
    C2 --> C2a["[3,2,1]"]
    style R fill:#6366f1,color:#fff,stroke:#4338ca
    style A fill:#818cf8,color:#fff
    style B fill:#818cf8,color:#fff
    style C fill:#818cf8,color:#fff
    style A1a fill:#34d399,color:#000,stroke:#059669
    style A2a fill:#34d399,color:#000,stroke:#059669
    style B1a fill:#34d399,color:#000,stroke:#059669
    style B2a fill:#34d399,color:#000,stroke:#059669
    style C1a fill:#34d399,color:#000,stroke:#059669
    style C2a fill:#34d399,color:#000,stroke:#059669
  `.trim();

  // Pruning: combination sum tree, with and without
  const pruningTree = `
flowchart TB
    subgraph WITHOUT["Without pruning · target=5, candidates=[2,3,6,7]"]
        direction TB
        W0["sum=0"] --> W1["+2 sum=2"]
        W0 --> W2["+3 sum=3"]
        W0 --> W3["+6 sum=6 ✗ overshoot"]
        W0 --> W4["+7 sum=7 ✗ overshoot"]
        W1 --> W1a["+2 sum=4"]
        W1 --> W1b["+3 sum=5 ✓"]
        W1 --> W1c["+6 sum=8 ✗"]
        W1 --> W1d["+7 sum=9 ✗"]
    end
    subgraph WITH["With pruning · skip branches where sum &gt; target"]
        direction TB
        P0["sum=0"] --> P1["+2 sum=2"]
        P0 --> P2["+3 sum=3"]
        P1 --> P1a["+2 sum=4"]
        P1 --> P1b["+3 sum=5 ✓"]
    end
    style W3 fill:#fca5a5,color:#000,stroke:#dc2626
    style W4 fill:#fca5a5,color:#000,stroke:#dc2626
    style W1c fill:#fca5a5,color:#000,stroke:#dc2626
    style W1d fill:#fca5a5,color:#000,stroke:#dc2626
    style W1b fill:#34d399,color:#000,stroke:#059669
    style P1b fill:#34d399,color:#000,stroke:#059669
  `.trim();

  // N-Queens column / diagonal conflicts
  const nqueensConflicts = `
flowchart TB
    subgraph BOARD["4x4 board · queen at (0,1)"]
        direction TB
        B["row 0:  . Q . .
row 1:  X X X .
row 2:  . X . X
row 3:  . X . ."]
    end
    subgraph EXPL["X marks attacked cells"]
        direction TB
        E["column (col=1): (1,1), (2,1), (3,1)
diag1 (r+c=1): (1,0)
diag2 (r-c=-1): (1,2), (2,3)"]
    end
    BOARD --> EXPL
    style BOARD fill:#1e293b,color:#fff,stroke:#475569
    style EXPL fill:#312e81,color:#fff,stroke:#4338ca
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="backtracking" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module 23 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2.5–3h · the engine of every &quot;enumerate all valid X&quot; problem</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="setup" title="I see backtracking as DFS with state you undo" xp={20}>
      <section>
        <h2 id="setup">What backtracking actually is — DFS with state you undo</h2>

        <p>
          Backtracking is one of those words that gets thrown around like it&apos;s a separate algorithm. It&apos;s
          not. <strong>Backtracking is depth-first search over an implicit tree of choices, where you mutate shared
          state on the way down and undo that mutation on the way back up.</strong> That&apos;s the entire technique.
          The DFS skeleton from Module 15 is still doing the work — the wrinkle is the bookkeeping.
        </p>

        <p>
          Every backtracking problem has the same shape: you&apos;re building up a partial solution one decision at a
          time. At each node in the recursion, you have some set of choices. You pick one, recurse with the new state,
          and when you come back, you put the state back the way it was so you can try the next choice. Repeat until
          you&apos;ve either built a complete solution (record it) or hit a dead end (return).
        </p>

        <Mermaid chart={subsetTree} />

        <p>
          That tree above is the choice tree for &quot;enumerate all subsets of <code>{`{1, 2, 3}`}</code>.&quot; At
          each level, the decision is &quot;include this number or skip it.&quot; There are 2³ = 8 leaves, and each
          one is a distinct subset. <em>The tree is never built in memory.</em> It exists only in the call stack —
          we&apos;re visiting nodes by recursing, not by allocating <code>TreeNode</code> objects. That&apos;s what
          &quot;implicit&quot; means.
        </p>

        <h3>Why we mutate and undo (instead of copying)</h3>

        <p>
          The naive way to enumerate subsets is to pass a brand-new list to each recursive call:
        </p>

        <CodeBlock lang="java">{`// Naive — works, but allocates a new list at every node of the tree
void enumerate(int i, List<Integer> nums, List<Integer> chosen, List<List<Integer>> out) {
    if (i == nums.size()) { out.add(chosen); return; }
    enumerate(i + 1, nums, chosen, out);                                  // skip
    List<Integer> next = new ArrayList<>(chosen);                         // COPY
    next.add(nums.get(i));
    enumerate(i + 1, nums, next, out);                                    // include
}`}</CodeBlock>

        <p>
          For a problem with 2ⁿ leaves and an O(n) copy at every internal node, that&apos;s O(n · 2ⁿ) extra work just
          on the copies — and a flood of short-lived ArrayList allocations that thrash the garbage collector. The
          backtracking version mutates a single shared list and undoes the mutation on the way back, getting the same
          answer with one allocation:
        </p>

        <CodeBlock lang="java">{`// Backtracking — one shared list, mutated and restored
void backtrack(int i, int[] nums, List<Integer> chosen, List<List<Integer>> out) {
    if (i == nums.length) { out.add(new ArrayList<>(chosen)); return; }
    backtrack(i + 1, nums, chosen, out);                                  // skip
    chosen.add(nums[i]);                                                  // choose
    backtrack(i + 1, nums, chosen, out);                                  // explore
    chosen.remove(chosen.size() - 1);                                     // unchoose
}`}</CodeBlock>

        <Callout variant="insight" title="The one allocation we still need">
          <p>
            Notice <code>out.add(new ArrayList&lt;&gt;(chosen))</code> at the leaves — we DO copy when recording. The
            output list will outlive this recursion frame, so we have to take a snapshot. Mutating-and-undoing pays off
            for the internal nodes (where the work is); we still pay one copy per leaf for the output.
          </p>
          <p>
            Total work for subsets: O(2ⁿ × n) — 2ⁿ leaves, n work per leaf to copy. The tree has 2ⁿ − 1 internal
            nodes (and 2ⁿ leaves), but each internal node does O(1) work (one push, one pop). The leaves dominate.
          </p>
        </Callout>

        <h3>Why we call it &quot;backtracking,&quot; not just &quot;DFS&quot;</h3>

        <p>
          Plain DFS visits each node of an explicit graph once. The visited[] array makes sure of it. Backtracking
          is different in two important ways:
        </p>

        <ul>
          <li><strong>The tree is implicit and exponential.</strong> 2ⁿ subsets, n! permutations. There&apos;s no adjacency list to read; the children of a state are computed from the state itself.</li>
          <li><strong>The same &quot;node&quot; (state value) can legitimately appear in many places.</strong> The empty subset shows up as a leaf of the &quot;skip everything&quot; branch. There&apos;s no sense in which we&apos;ve &quot;visited&quot; it before — it&apos;s a different path that produced the same value. So no visited[] in the BFS/DFS sense; the tree structure is the bookkeeping.</li>
        </ul>

        <Callout variant="info" title="Reframe: backtracking IS stateful DFS on an implicit tree">
          <p>
            Every backtracking solution can be rewritten as recursive DFS where the &quot;graph&quot; is the choice
            tree. The choose/unchoose pair is just the way you express &quot;descend into a child, then return to the
            parent state.&quot; If you ever feel stuck on a backtracking problem, ask: <em>what&apos;s the state at a
            node? What are the choices from this state? What&apos;s the leaf condition?</em> Three questions, every
            problem.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Why does backtracking mutate a shared list and undo, instead of passing a copy at each call?"
          options={[
            { label: "Mutating is the only correct approach.", explanation: "Both work. Mutating is just dramatically more efficient — the copying version allocates O(n) at every node, which for 2^n nodes wrecks the GC." },
            { label: "To avoid O(n) allocation cost at every internal node, which would multiply the runtime by n and thrash the garbage collector.", correct: true, explanation: "Right. With 2^n internal nodes, copying turns O(2^n) work into O(n · 2^n) work and floods the heap with short-lived lists. Mutate-and-undo keeps internal-node work at O(1)." },
            { label: "Java's call stack can't hold ArrayList objects.", explanation: "It absolutely can — Java passes references, so the call stack just holds pointers. The reason is performance, not language constraint." },
            { label: "The recursion would never terminate without undo.", explanation: "It would terminate either way; the leaf condition (i == n) doesn't depend on whether we undo. Undo is about correctness of the SHARED list across siblings, plus performance." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Subsets, permutations, N-Queens, word search — what do these problems have in common that makes them backtracking territory?"
          options={[
            { label: "They all involve graphs.", explanation: "Word search is on a grid, but subsets and permutations have no input graph at all. The common structure is the IMPLICIT decision tree, not an input graph." },
            { label: "Each problem is built one decision at a time, the set of decisions branches into many paths, and we need to enumerate all valid complete paths (or find one).", correct: true, explanation: "Right. That's the backtracking signature: incremental construction, branching choices, exhaustive enumeration. When you see those three together, reach for the choose/explore/unchoose template." },
            { label: "They have polynomial time complexity.", explanation: "Backtracking problems are typically exponential or factorial in time complexity. That's what makes pruning so important." },
            { label: "They can be solved greedily.", explanation: "Greedy commits to one decision and never reconsiders. Backtracking explicitly DOES reconsider — undo is the whole point." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Template ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="template" title="The choose / explore / unchoose template is automatic" xp={25}>
      <section>
        <h2 id="template">The choose / explore / unchoose template</h2>

        <p>
          One template solves every backtracking problem. Memorize it; the rest is filling in the blanks.
        </p>

        <CodeBlock lang="java">{`void backtrack(state, choices) {
    if (isComplete(state)) { record(state); return; }
    for (choice : choices) {
        if (!isValid(choice, state)) continue;   // pruning
        apply(choice, state);                     // CHOOSE
        backtrack(state, ...);                    // EXPLORE
        undo(choice, state);                      // UNCHOOSE
    }
}`}</CodeBlock>

        <p>Five slots, every problem fills them differently:</p>

        <ul>
          <li><strong>state</strong> — the partial solution being built. Usually a list, sometimes a grid, sometimes a couple of integers.</li>
          <li><strong>choices</strong> — what can we add next. Sometimes the same set every call; sometimes derived from the current state (e.g., &quot;numbers we haven&apos;t used yet&quot;).</li>
          <li><strong>isComplete</strong> — when do we stop and record. Hit n decisions? Reached a target? Filled the board?</li>
          <li><strong>isValid</strong> — pruning. Skip choices that can&apos;t lead anywhere good. The difference between fast and TLE is almost entirely here.</li>
          <li><strong>apply / undo</strong> — the mutation and its inverse. They MUST be exact opposites; if they aren&apos;t, the next sibling sees corrupted state.</li>
        </ul>

        <h3>Why undo is non-negotiable</h3>

        <p>
          The recursive call <code>backtrack(state, ...)</code> mutates the same <code>state</code> object that the
          caller holds — Java passes references, not deep copies. After the recursion returns, the state has whatever
          mutations the deepest descendant left behind. If we don&apos;t undo our local choice, the next iteration of
          the for-loop sees a polluted state.
        </p>

        <CodeBlock lang="java">{`// What goes wrong without undo:
chosen.add(1);
backtrack(...);             // explores all paths starting with [1]
                            // — if descendants didn't undo their adds, chosen is now [1, 2, 3] or whatever
chosen.add(2);              // intended: try [2]. ACTUAL: [1, 2, 3, 2]. Garbage.

// With undo:
chosen.add(1);
backtrack(...);             // descendants do their own choose/undo; back here, chosen is still [1]
chosen.remove(chosen.size() - 1);   // back to [], ready for next iteration
chosen.add(2);              // correct: trying [2]`}</CodeBlock>

        <Callout variant="warn" title="Apply and undo must be exact opposites">
          <p>
            If <code>apply</code> sets <code>visited[c] = true</code>, <code>undo</code> sets it back to{" "}
            <code>false</code>. If <code>apply</code> appends to a list, <code>undo</code> removes the last element
            (not the first, not by value — by position). If <code>apply</code> places a queen on the board,{" "}
            <code>undo</code> removes that queen and clears its column/diagonal markers.
          </p>
          <p>
            The classic bug is to undo something different from what you applied — e.g., apply pushes a tuple but undo
            pops by value, and there&apos;s a duplicate in the list so you pop the wrong one. Make undo the literal
            mirror of apply, every time.
          </p>
        </Callout>

        <h3>Why undo doesn&apos;t need to happen at the leaves</h3>

        <p>
          When you hit <code>isComplete</code>, you record and return. You&apos;ve done no apply at the leaf, so
          there&apos;s nothing to undo. The undo happens in the parent&apos;s for-loop, after the recursive call
          returns. That asymmetry is sometimes confusing — the apply/undo pair lives in the <em>caller</em>, not
          the callee.
        </p>

        <h3>The skeleton in concrete code</h3>

        <p>Here it is for &quot;all subsets&quot; — the smallest problem that uses every slot:</p>

        <CodeBlock lang="java">{`public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), out);
    return out;
}

private void backtrack(int i, int[] nums, List<Integer> chosen, List<List<Integer>> out) {
    if (i == nums.length) {                       // isComplete: visited every index
        out.add(new ArrayList<>(chosen));         // record (snapshot)
        return;
    }
    // Choice 1: skip nums[i]
    backtrack(i + 1, nums, chosen, out);

    // Choice 2: include nums[i]
    chosen.add(nums[i]);                          // CHOOSE
    backtrack(i + 1, nums, chosen, out);          // EXPLORE
    chosen.remove(chosen.size() - 1);             // UNCHOOSE
}`}</CodeBlock>

        <p>
          Notice that for &quot;skip,&quot; there&apos;s no apply/undo — the choice <em>is</em> &quot;don&apos;t change
          the state.&quot; Only the &quot;include&quot; choice mutates state, so only it needs the pair.
        </p>

        <Quiz
          kind="Template check"
          question="In the backtracking template, where does the undo step live — in the caller or in the callee?"
          options={[
            { label: "In the callee, right before it returns.", explanation: "Backwards. The callee makes its own choices and undoes them; it doesn't know what the caller chose. Each frame is responsible for its own choose/undo." },
            { label: "In the caller, after the recursive call returns. Each stack frame undoes only the choice IT made.", correct: true, explanation: "Right. The pattern is 'I apply my choice, recurse to let descendants do their thing, undo my choice.' Every frame manages its own apply/undo locally — that's how the shared state stays consistent across all those recursive calls." },
            { label: "It doesn't matter as long as it happens.", explanation: "It matters: if the callee tried to undo, it wouldn't know what to undo. The choose/undo pair has to be lexically next to the recursive call in the caller." },
            { label: "Both — apply and undo both happen inside the recursion, then the caller undoes again.", explanation: "Double-undoing breaks the state. Each apply has exactly one matching undo, in the same frame." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Subsets ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="subsets" title="I can enumerate subsets two different ways" xp={25}>
      <section>
        <h2 id="subsets">Subsets and the include-or-not pattern</h2>

        <p>
          LeetCode 78 (Subsets) is the cleanest backtracking problem in existence. It has exactly one binary decision
          at each step — <em>include nums[i] or skip it</em> — and every leaf of the resulting tree is a valid subset.
          2ⁿ leaves total, which matches the well-known fact that a set of n elements has 2ⁿ subsets.
        </p>

        <h3>Approach 1 · The binary decision tree</h3>

        <CodeBlock lang="java">{`public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), out);
    return out;
}

private void backtrack(int i, int[] nums, List<Integer> chosen, List<List<Integer>> out) {
    if (i == nums.length) {
        out.add(new ArrayList<>(chosen));
        return;
    }
    // Skip nums[i]
    backtrack(i + 1, nums, chosen, out);
    // Include nums[i]
    chosen.add(nums[i]);
    backtrack(i + 1, nums, chosen, out);
    chosen.remove(chosen.size() - 1);
}`}</CodeBlock>

        <p>
          The tree has depth n (one level per element), branching factor 2 (include / skip), and 2ⁿ leaves. We record
          only at the leaves — when we&apos;ve made a decision about every element. That gives us exactly 2ⁿ subsets,
          no duplicates, no misses.
        </p>

        <h3>Approach 2 · Record at every node</h3>

        <p>
          A subtle but useful variant: instead of waiting for the leaf, record the partial subset at every node. Each
          time we add an element, the resulting list is itself a valid subset. This naturally produces all 2ⁿ subsets
          but with a different call-tree shape — an &quot;n-ary&quot; tree where each node tries every <em>later</em>
          index.
        </p>

        <CodeBlock lang="java">{`public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    backtrack(0, nums, new ArrayList<>(), out);
    return out;
}

private void backtrack(int start, int[] nums, List<Integer> chosen, List<List<Integer>> out) {
    out.add(new ArrayList<>(chosen));            // record at every node, not just leaves
    for (int i = start; i < nums.length; i++) {
        chosen.add(nums[i]);                     // CHOOSE
        backtrack(i + 1, nums, chosen, out);     // EXPLORE — i+1, not start+1
        chosen.remove(chosen.size() - 1);        // UNCHOOSE
    }
}`}</CodeBlock>

        <Callout variant="insight" title="The start parameter is the &quot;don't go backwards&quot; trick">
          <p>
            Passing <code>i + 1</code> (not <code>start + 1</code>) into the recursive call means: from position{" "}
            <code>i</code>, the next element we consider must come <em>after</em> i. This is how we avoid duplicates
            like <code>[1, 2]</code> and <code>[2, 1]</code> — both would otherwise count as the same subset, but the
            start parameter ensures we always pick in increasing index order.
          </p>
          <p>
            This pattern (loop starting at <code>start</code>, recurse with <code>i + 1</code>) shows up in
            <em> Combinations</em> (LC 77), <em>Combination Sum</em> (LC 39), <em>Subsets II</em> (LC 90 with a
            duplicate-skip), and several others. Once you internalize it, half the subset-style LeetCode problems
            become muscle memory.
          </p>
        </Callout>

        <h3>Complexity — and why &quot;O(2ⁿ)&quot; isn&apos;t the whole story</h3>

        <p>
          The naive complexity statement is &quot;O(2ⁿ) subsets.&quot; True, but for total work we have to count the
          cost of producing each subset. Each subset can have up to n elements, and recording it copies them into a
          fresh list — that&apos;s O(n) per leaf. So the real complexity is <strong>O(2ⁿ × n)</strong> time and the
          same for space (we&apos;re storing all 2ⁿ subsets).
        </p>

        <p>
          For n = 20, that&apos;s about 20 million operations — fine. For n = 30, you&apos;re at ~30 billion, which is
          well past TLE territory. Subset enumeration is fundamentally exponential; if the input lets n grow past ~20
          or so, you need a different approach (DP, bitmask, math).
        </p>

        <h3>Bonus · The bitmask version (no recursion at all)</h3>

        <p>
          Since each subset corresponds to a binary string of length n (1 = include, 0 = skip), you can enumerate all
          2ⁿ subsets by iterating an integer from 0 to 2ⁿ − 1:
        </p>

        <CodeBlock lang="java">{`public List<List<Integer>> subsets(int[] nums) {
    int n = nums.length;
    List<List<Integer>> out = new ArrayList<>();
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> sub = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) sub.add(nums[i]);
        }
        out.add(sub);
    }
    return out;
}`}</CodeBlock>

        <Callout variant="info" title="When to reach for bitmask vs backtracking">
          <p>
            Bitmask is shorter and slightly faster (no recursion overhead). It works only when n ≤ 31 (or 63 for{" "}
            <code>long</code>) — beyond that the integer can&apos;t represent the mask. Backtracking has no such
            limit, generalizes cleanly to non-binary choices (permutations, N-Queens), and supports pruning more
            naturally. In interviews, write whichever feels more natural for the problem; mention you know the other.
          </p>
        </Callout>

        <Quiz
          kind="Subsets check"
          question="In the start-parameter version of subsets, why do we recurse with `i + 1` instead of `start + 1`?"
          options={[
            { label: "It doesn't matter; both produce all subsets.", explanation: "It matters a lot. start + 1 would re-consider every element after start at every level — giving you duplicates AND wrong subsets containing the same element multiple times." },
            { label: "i + 1 means 'continue from one past the element we just picked,' which prevents duplicates and skips already-picked elements. start + 1 would let us pick the same element twice or generate {1,2} and {2,1} as separate subsets.", correct: true, explanation: "Right. The for-loop iterator i is the actual current pick; recursing from i + 1 enforces strictly increasing index order. start was the lower bound at the start of the loop, but we've moved past it to i — pass i + 1 down." },
            { label: "It's a Java optimization.", explanation: "It's an algorithmic correctness issue, language-independent." },
            { label: "It avoids stack overflow.", explanation: "Both versions use the same stack depth. The reason is correctness: start + 1 produces incorrect output." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Permutations ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="permutations" title="I can enumerate permutations with both visited[] and remove-and-restore" xp={25}>
      <section>
        <h2 id="permutations">Permutations and the visited-set pattern</h2>

        <p>
          LC 46 (Permutations) is the canonical second backtracking problem. The choice at each step is &quot;which
          element comes next,&quot; chosen from the elements we haven&apos;t used yet. The tree has n! leaves —
          fundamentally bigger than subsets&apos; 2ⁿ — and the bookkeeping has to track which elements are still
          available.
        </p>

        <Mermaid chart={permTree} />

        <h3>Approach 1 · The visited[] array</h3>

        <p>
          Maintain a <code>boolean[] used</code> the same size as the input. Mark elements true when you pick them,
          false when you undo. At each level, try every unused element.
        </p>

        <CodeBlock lang="java">{`public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), out);
    return out;
}

private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
    if (path.size() == nums.length) {
        out.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;          // skip elements we've already placed
        used[i] = true;                 // CHOOSE
        path.add(nums[i]);
        backtrack(nums, used, path, out);    // EXPLORE
        used[i] = false;                // UNCHOOSE
        path.remove(path.size() - 1);
    }
}`}</CodeBlock>

        <p>
          The leaf condition is <code>path.size() == nums.length</code> — when we&apos;ve placed every element. Two
          state mutations per step, two corresponding undos. The for-loop index <code>i</code> walks the original
          array; <code>used[i]</code> is the gatekeeper.
        </p>

        <h3>Approach 2 · Remove-and-restore from a list</h3>

        <p>
          An alternative that some find more intuitive: instead of a boolean array, keep an actual list of remaining
          elements. Pick one, remove it from the list, recurse, restore it.
        </p>

        <CodeBlock lang="java">{`public List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    List<Integer> remaining = new ArrayList<>();
    for (int x : nums) remaining.add(x);
    backtrack(remaining, new ArrayList<>(), out);
    return out;
}

private void backtrack(List<Integer> remaining, List<Integer> path, List<List<Integer>> out) {
    if (remaining.isEmpty()) {
        out.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < remaining.size(); i++) {
        int x = remaining.remove(i);    // CHOOSE — pick element at i
        path.add(x);
        backtrack(remaining, path, out);    // EXPLORE
        path.remove(path.size() - 1);   // UNCHOOSE — pop from path
        remaining.add(i, x);            // restore element at the SAME index i
    }
}`}</CodeBlock>

        <Callout variant="warn" title="Restore at the same index, not at the end">
          <p>
            <code>remaining.add(x)</code> would put the element at the end of the list, which works but changes the
            order — and that breaks the invariant that <code>i</code> in the for-loop refers to the same conceptual
            position across iterations. <code>remaining.add(i, x)</code> restores to the original slot, keeping the
            for-loop&apos;s iteration order stable.
          </p>
          <p>
            Note also that <code>ArrayList.remove(int)</code> and <code>ArrayList.add(int, E)</code> are both O(n) —
            they shift elements. The visited[] approach is O(1) per pick/unpick. For tight competitive-programming
            constraints, prefer visited[]. For readability in interviews, either is fine.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <p>
          n! permutations, each of length n, each requiring an O(n) copy at the leaf. Total time: <strong>O(n × n!)</strong>.
          For n = 10, that&apos;s ~36 million — fine. For n = 12, it&apos;s ~5.7 billion — TLE. Permutation enumeration
          is harder to scale than subset enumeration; the n! growth is brutal.
        </p>

        <h3>Permutations II — handling duplicates (LC 47)</h3>

        <p>
          When the input has duplicates (e.g., [1, 1, 2]), naively running the above produces duplicate permutations.
          The standard fix is <em>sort the input</em>, then in the for-loop, skip <code>nums[i]</code> if it equals{" "}
          <code>nums[i - 1]</code> AND <code>used[i - 1]</code> is false (meaning the previous identical element is
          NOT in the current path — we already covered the case where it was).
        </p>

        <CodeBlock lang="java">{`Arrays.sort(nums);
// inside the for-loop:
if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;`}</CodeBlock>

        <p>
          The condition takes a minute to internalize. The sketch: sort puts duplicates adjacent; when we&apos;re
          choosing the next element to add, we want to use duplicates only in left-to-right order. If <code>used[i - 1]</code>{" "}
          is true, the previous duplicate is already in the path — using <code>i</code> after it is a fresh, distinct
          ordering. If <code>used[i - 1]</code> is false, we&apos;d be using a later duplicate before an earlier one,
          which we&apos;ve already seen by symmetry. Skip.
        </p>

        <Callout variant="insight" title="The de-duplication idiom is reusable">
          <p>
            Sort the input + skip-if-equal-to-previous-and-previous-not-used works for Subsets II, Combination Sum II,
            and Permutations II. Memorize the condition: <code>i &gt; 0 &amp;&amp; nums[i] == nums[i-1] &amp;&amp;
            !used[i-1]</code>. It&apos;s the cleanest way to enumerate without producing duplicates.
          </p>
        </Callout>

        <Quiz
          kind="Permutations check"
          question="Why does the visited[] approach to permutations have better constant-factor performance than the remove-and-restore approach?"
          options={[
            { label: "They have identical performance.", explanation: "They have the same Big-O, but different constants. ArrayList.remove(int) and ArrayList.add(int, E) are O(n) due to element shifting — visited[] is O(1) per pick." },
            { label: "visited[] toggling is O(1); ArrayList.remove(i) and add(i, x) are O(n) because they shift elements. So per-step constant is much smaller for visited[].", correct: true, explanation: "Right. visited[] uses array indexing (constant time per toggle). The list version pays an O(n) shift on every choose AND every undo — so total work goes from O(n · n!) to O(n^2 · n!), even though the asymptotic answer count is the same." },
            { label: "ArrayLists in Java are slower than arrays in general.", explanation: "Get and set on ArrayList are O(1) — comparable to arrays. The specific issue is remove(int) and add(int, E), not ArrayList in general." },
            { label: "Visited[] avoids autoboxing.", explanation: "The visited[] is boolean[], no autoboxing. The list version uses Integer (which IS autoboxed), but that's a minor effect compared to the O(n) shifts." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Pruning ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="pruning" title="I prune aggressively — fast vs TLE is almost all here" xp={25}>
      <section>
        <h2 id="pruning">Pruning: the difference between fast and TLE</h2>

        <p>
          The choice tree is exponential. Without pruning, even the cleanest backtracking will TLE on anything past
          tiny n. Pruning is the art of recognizing &quot;this branch can&apos;t lead to a valid solution&quot; before
          you spend time exploring it. <strong>Most of the speed in real backtracking solutions comes from
          pruning</strong> — the choose/explore/unchoose template is the same, but the <code>isValid</code> check
          is where the algorithm earns its complexity class.
        </p>

        <h3>Example 1 · Combination Sum (LC 39)</h3>

        <p>
          Given an array of distinct candidates and a target, return all unique combinations (with repetition allowed)
          that sum to target. The naive approach explores every combination with sum ≤ some big bound; the pruned
          approach stops as soon as <code>sum &gt; target</code>.
        </p>

        <Mermaid chart={pruningTree} />

        <CodeBlock lang="java">{`public List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<Integer>> out = new ArrayList<>();
    Arrays.sort(candidates);                  // enables sorted-pruning
    backtrack(0, candidates, target, new ArrayList<>(), out);
    return out;
}

private void backtrack(int start, int[] cands, int remaining,
                       List<Integer> path, List<List<Integer>> out) {
    if (remaining == 0) {
        out.add(new ArrayList<>(path));
        return;
    }
    for (int i = start; i < cands.length; i++) {
        if (cands[i] > remaining) break;      // PRUNE — sorted, so anything after is also too big
        path.add(cands[i]);
        backtrack(i, cands, remaining - cands[i], path, out);   // 'i' allows reuse
        path.remove(path.size() - 1);
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Sort first, then prune with break">
          <p>
            We sort candidates ascending. In the for-loop, the first time we see <code>cands[i] &gt; remaining</code>,
            EVERY later candidate is also too big — they&apos;re sorted. So <code>break</code> instead of{" "}
            <code>continue</code>. That single-character change can turn a TLE into a milliseconds-fast solution on
            large inputs, because we cut entire suffixes of the candidate list at every node.
          </p>
        </Callout>

        <h3>Without pruning vs with pruning — concrete numbers</h3>

        <p>
          Take Combination Sum with candidates = [2, 3, 6, 7] and target = 7. Without pruning (just exploring every
          path until either we hit target or exceed it), the solver explores hundreds of branches that begin with{" "}
          <code>[7, ...]</code> — even though after picking 7 we&apos;re already AT the target and any further
          addition overshoots. The pruning version recognizes <code>remaining == 0</code> and returns immediately.
        </p>

        <p>
          On larger inputs (say, target = 30 with mid-size candidate sets), the difference is dramatic:
        </p>

        <CodeBlock lang="plain">{`Without pruning:    ~5 million recursive calls   (TLE)
With sum >= target check:    ~80,000 calls    (passes, ~50ms)
With sort + break (full pruning):   ~12,000 calls    (passes, ~5ms)`}</CodeBlock>

        <h3>Example 2 · N-Queens (LC 51)</h3>

        <p>
          Place n queens on an n×n board so that no two attack each other. Naively, you could enumerate every
          permutation of column-per-row (n! arrangements) and check each — for n = 10, that&apos;s 3.6 million
          arrangements to validate. Pruning brings it to ~700 valid placements explored.
        </p>

        <Mermaid chart={nqueensConflicts} />

        <p>
          The trick is to maintain three boolean arrays: <code>colUsed</code>, <code>diag1Used</code> (anti-diagonal,
          indexed by <code>r + c</code>), and <code>diag2Used</code> (main diagonal, indexed by <code>r - c + n - 1</code>).
          Before placing a queen at <code>(r, c)</code>, check all three; if any is set, skip. After placing, mark
          all three; on undo, clear all three.
        </p>

        <CodeBlock lang="java">{`public int totalNQueens(int n) {
    return backtrack(0, n, new boolean[n], new boolean[2*n - 1], new boolean[2*n - 1]);
}

private int backtrack(int row, int n, boolean[] cols, boolean[] d1, boolean[] d2) {
    if (row == n) return 1;
    int count = 0;
    for (int c = 0; c < n; c++) {
        int i1 = row + c;
        int i2 = row - c + n - 1;
        if (cols[c] || d1[i1] || d2[i2]) continue;       // PRUNE — attacked
        cols[c] = d1[i1] = d2[i2] = true;                // CHOOSE
        count += backtrack(row + 1, n, cols, d1, d2);    // EXPLORE
        cols[c] = d1[i1] = d2[i2] = false;               // UNCHOOSE
    }
    return count;
}`}</CodeBlock>

        <Callout variant="insight" title="The pruning IS the algorithm">
          <p>
            Without the three boolean checks, you&apos;d be enumerating all n! column-per-row arrangements and
            validating each at the leaf — that&apos;s O(n! × n) work in total (n! permutations, O(n) to validate
            each). With the three checks, conflicts are caught at placement time, and most invalid branches die at
            depth 2 or 3 instead of unfolding to depth n. The same template, but the <code>isValid</code> check is
            what makes N-Queens tractable up to n = 14 or so. Without it, you&apos;d hit TLE around n = 9.
          </p>
        </Callout>

        <h3>Patterns of pruning</h3>

        <ul>
          <li><strong>Sum-bound pruning.</strong> &quot;Stop if running sum exceeds target&quot; — Combination Sum, Partition to K Equal Subsets, Coin Change variants.</li>
          <li><strong>Conflict pruning.</strong> &quot;Stop if this choice violates a constraint&quot; — N-Queens (column/diagonal), Sudoku (row/column/box), Word Break.</li>
          <li><strong>Order-fixing pruning.</strong> &quot;Skip choice if it&apos;s a duplicate of one we already tried at this level&quot; — Permutations II, Subsets II.</li>
          <li><strong>Dead-end pruning.</strong> &quot;Stop if no valid completion is possible from here&quot; — Word Search (cell already visited or wrong letter), Sudoku (cell with zero valid digits).</li>
          <li><strong>Best-known-bound pruning (branch and bound).</strong> &quot;Stop if no completion can beat my current best&quot; — used in optimization variants like Traveling Salesman. Beyond LC scope, but the same idea.</li>
        </ul>

        <Quiz
          kind="Pruning check"
          question="Why does sorting candidates and using `break` instead of `continue` matter so much for Combination Sum?"
          options={[
            { label: "Sorted input lets us return early — when cands[i] > remaining, every later cands[j] (j > i) is also too big, so we can skip all of them at once with break.", correct: true, explanation: "Right. Sorting + break turns 'reject one bad candidate' into 'reject the entire suffix.' On large inputs this can cut hundreds of branches at every internal node — the speedup compounds exponentially across depths." },
            { label: "Sorting is required for correctness.", explanation: "Combination Sum doesn't require sorted input for correctness; without sorting, a 'continue' version still produces all valid combinations. Sorting + break is purely a performance pruning, but a massive one." },
            { label: "It avoids stack overflow.", explanation: "Both versions have the same recursion depth in the worst case. The reason is total work, not depth." },
            { label: "Java's Arrays.sort is faster than the recursive calls.", explanation: "Arrays.sort is O(n log n); the recursion is exponential — the sort is essentially free. The real benefit is that sorting enables the suffix-skip pruning." },
          ]}
        />

        <Quiz
          kind="Pruning check"
          question="In N-Queens, what makes the three boolean arrays (cols, d1, d2) more efficient than scanning the partial board to check attacks?"
          options={[
            { label: "They use less memory.", explanation: "They use a tiny bit more memory than the board representation (n + 2(2n-1) booleans vs n^2 board). Memory isn't the win — speed is." },
            { label: "Conflict checks become O(1) instead of O(n) (or O(row) for already-placed queens). Across the recursion tree, that's the difference between O(n!) and something much smaller.", correct: true, explanation: "Right. With the three arrays, 'is this square attacked?' is three array reads. Scanning the board to check, you'd walk the row, column, and both diagonals — O(n) per query. Multiply by the recursion size and the difference is enormous." },
            { label: "They're cache-friendlier.", explanation: "True but secondary. The asymptotic win is O(1) lookups vs O(n) scans, which matters far more than cache effects in this size range." },
            { label: "Java optimizes boolean arrays specially.", explanation: "Java stores boolean[] as a byte per element, no special optimization. The win is algorithmic." },
          ]}
        />

        <PartRecap
          title="Pruning is where backtracking earns its keep"
          gist="Without pruning, backtracking is just brute force. With pruning, it can solve problems that have astronomical search spaces in milliseconds — but only if you can recognize 'this branch is hopeless' before you explore it."
          points={[
            { takeaway: "Sort the input when 'too big' is a meaningful pruning condition.", detail: "Sorted input + break turns single-element rejection into entire-suffix rejection. Combination Sum, Partition to K Equal Sets, even some scheduling problems benefit from this trick." },
            { takeaway: "Maintain O(1) conflict checks instead of O(n) re-scans.", detail: "N-Queens uses three boolean arrays so that 'is this square attacked?' is three reads. Sudoku uses 9 row-sets, 9 col-sets, 9 box-sets. The structure should make the cheapest possible pruning check the natural one." },
            { takeaway: "De-duplicate by sorting + skip-if-equal-to-previous-and-previous-unused.", detail: "Subsets II, Permutations II, Combination Sum II all share this idiom. Memorize the condition: i > 0 && nums[i] == nums[i-1] && !used[i-1]." },
            { takeaway: "The template doesn't change. The isValid check is the algorithm.", detail: "Choose / explore / unchoose looks identical in TLE and AC versions of the same problem. The difference is what happens before apply: a smart 'skip this choice' can drop entire subtrees." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Project ───────────────── */}
      <Checkpoint moduleSlug="backtracking" id="project" title="I solved N-Queens and Word Search end-to-end" xp={45} manual manualLabel="I solved both LeetCode problems and finished the classifier">
      <section>
        <h2 id="project">Project: N-Queens + Word Search</h2>

        <p>
          Two problems, both classic, both showcase the template plus aggressive pruning. Solve both. If either feels
          rough, re-read the relevant section.
        </p>

        <h3>LC 51 · N-Queens (full solution)</h3>

        <p>
          Return all distinct n-queens placements, encoded as a list of strings (one per row, with{" "}
          <code>&apos;Q&apos;</code> for queen and <code>&apos;.&apos;</code> for empty). The classic version — same
          algorithm as the count-only version, plus a board-rendering step at the leaves.
        </p>

        <CodeBlock lang="java">{`public List<List<String>> solveNQueens(int n) {
    List<List<String>> out = new ArrayList<>();
    int[] queenCol = new int[n];          // queenCol[r] = column of queen in row r
    boolean[] cols = new boolean[n];
    boolean[] d1 = new boolean[2 * n - 1];     // diag where r + c is constant
    boolean[] d2 = new boolean[2 * n - 1];     // diag where r - c is constant
    backtrack(0, n, queenCol, cols, d1, d2, out);
    return out;
}

private void backtrack(int row, int n, int[] queenCol,
                       boolean[] cols, boolean[] d1, boolean[] d2,
                       List<List<String>> out) {
    if (row == n) {
        out.add(render(queenCol, n));
        return;
    }
    for (int c = 0; c < n; c++) {
        int i1 = row + c;
        int i2 = row - c + n - 1;
        if (cols[c] || d1[i1] || d2[i2]) continue;
        // CHOOSE
        queenCol[row] = c;
        cols[c] = d1[i1] = d2[i2] = true;
        // EXPLORE
        backtrack(row + 1, n, queenCol, cols, d1, d2, out);
        // UNCHOOSE
        cols[c] = d1[i1] = d2[i2] = false;
    }
}

private List<String> render(int[] queenCol, int n) {
    List<String> board = new ArrayList<>(n);
    char[] row = new char[n];
    for (int r = 0; r < n; r++) {
        Arrays.fill(row, '.');
        row[queenCol[r]] = 'Q';
        board.add(new String(row));
    }
    return board;
}`}</CodeBlock>

        <Callout variant="insight" title="Why r + c and r - c index the diagonals">
          <p>
            On a chessboard, an anti-diagonal (going up-right) has the property that <code>r + c</code> is constant
            along it — top-right corner has small r and large c summing to the same as bottom-left. So{" "}
            <code>r + c</code> is a unique ID per anti-diagonal, ranging from 0 to <code>2n - 2</code>.
          </p>
          <p>
            Similarly, a main diagonal (going down-right) has <code>r - c</code> constant. To make it a non-negative
            array index, we shift by <code>n - 1</code>, giving the range 0 to <code>2n - 2</code>. Two arrays of
            length <code>2n - 1</code> cover both diagonal families completely.
          </p>
        </Callout>

        <h3>LC 79 · Word Search (full solution)</h3>

        <p>
          Given a 2D board of letters and a target word, decide whether the word can be formed by traversing
          adjacent (4-directional) cells, using each cell at most once. Backtracking on a grid: at each step, we&apos;re
          either at the next letter we want or we&apos;re done; the choices are the four neighbors.
        </p>

        <CodeBlock lang="java">{`private static final int[][] DIRS = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

public boolean exist(char[][] board, String word) {
    int rows = board.length, cols = board[0].length;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (dfs(board, r, c, word, 0)) return true;
        }
    }
    return false;
}

private boolean dfs(char[][] board, int r, int c, String word, int idx) {
    if (idx == word.length()) return true;
    if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) return false;
    if (board[r][c] != word.charAt(idx)) return false;

    char saved = board[r][c];
    board[r][c] = '#';                      // CHOOSE — mark visited by mutating the board

    for (int[] d : DIRS) {
        if (dfs(board, r + d[0], c + d[1], word, idx + 1)) {
            board[r][c] = saved;            // restore before returning (important if caller is iterating)
            return true;
        }
    }

    board[r][c] = saved;                    // UNCHOOSE
    return false;
}`}</CodeBlock>

        <Callout variant="warn" title="Mutating the board is the visited[][] — restore on every exit path">
          <p>
            We use the board itself as the visited marker by overwriting the visited cell with <code>&apos;#&apos;</code>.
            This saves an O(R × C) <code>boolean[][]</code> allocation. The catch: we must restore the original character
            on EVERY return path, including the &quot;found it&quot; path. Forgetting to restore on the success path
            leaves the board mutated for the caller — usually fine because we&apos;re returning <code>true</code>
            anyway, but if the problem were &quot;find all paths,&quot; that residual mutation would corrupt subsequent
            searches.
          </p>
          <p>
            The cleanest pattern is the one above: restore right before each return. Some solutions allocate a separate
            <code> visited[][]</code>; that&apos;s fine and arguably clearer. Mention both in interviews; pick the one
            you&apos;re less likely to mess up under pressure.
          </p>
        </Callout>

        <h3>The pruning here is in the early returns</h3>

        <p>
          Look at the top of <code>dfs</code>: bounds check, then character mismatch check, then the recursion. The
          mismatch check is the key prune — if <code>board[r][c]</code> doesn&apos;t equal{" "}
          <code>word.charAt(idx)</code>, we abort immediately, before recursing into the four neighbors. Without that,
          we&apos;d explore four branches per cell regardless of whether the cell could possibly continue the word.
          Same template, but the <code>isValid</code> check is what keeps Word Search&apos;s worst case from
          exploding.
        </p>

        <p>
          Complexity is roughly O(R × C × 4^L) where L is the word length: R × C starts, 4 directions per step, L
          steps deep. The board mismatch prune typically kills branches at depth 1, so real-world performance is much
          better than the worst-case bound suggests.
        </p>

        <ClassifyChallenge
          title="Pure backtracking, backtracking + memo, or not backtracking?"
          prompt="For each problem, decide whether the right approach is plain backtracking, backtracking enriched with memoization, or something else entirely (DP, BFS, greedy)."
          buckets={[
            { id: "pure", label: "Pure backtracking", color: "indigo" },
            { id: "memo", label: "Backtracking + memoization", color: "violet" },
            { id: "not", label: "Not backtracking", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Generate all subsets of a given array.", answer: "pure", explanation: "The output literally enumerates every leaf of the choice tree. There are no overlapping subproblems to memoize — each leaf is distinct. Pure backtracking, O(2^n × n)." },
            { id: "2", label: "N-Queens — count the number of valid placements for n=10.", answer: "pure", explanation: "Each board state is unique (different combinations of row choices), so memoization wouldn't help. Pure backtracking with column/diagonal pruning is the textbook solution." },
            { id: "3", label: "Find shortest path between two nodes in an unweighted grid.", answer: "not", explanation: "BFS, not backtracking. 'Shortest' = BFS layers. Backtracking would explore every path and pick the shortest, which is exponentially slower than the layer-by-layer approach." },
            { id: "4", label: "Word Break — given a string and a dictionary, can the string be segmented into dictionary words?", answer: "memo", explanation: "Naive backtracking has overlapping subproblems: 'can s[i:] be segmented?' gets called many times for the same i. Memoize the answer per starting index → backtracking with memo. (Or rewrite as bottom-up DP.)" },
            { id: "5", label: "Permutations of [1, 2, 3, 4, 5].", answer: "pure", explanation: "Each permutation is unique; no overlapping subproblems. Pure backtracking with visited[] is exactly the right tool." },
            { id: "6", label: "Activity selection: pick the maximum number of non-overlapping intervals.", answer: "not", explanation: "Greedy. Sort by end time, take each interval whose start is past the previous end. Backtracking would work but would be O(2^n) for a problem solvable in O(n log n)." },
            { id: "7", label: "Decode ways — count the number of ways to decode a string of digits into letters (A=1...Z=26).", answer: "memo", explanation: "Naive backtracking branches on '1-digit or 2-digit decoding,' with overlapping subproblems on the suffix. Memoize on the index → backtracking with memo. (1D DP works equally well.)" },
            { id: "8", label: "Sudoku solver.", answer: "pure", explanation: "Pure backtracking with constraint pruning (row/column/box sets). No subproblem overlap because the partial state is unique per recursion path. The classic application of choose/explore/unchoose." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="What's the single most important difference between backtracking and plain DFS over a graph?"
          options={[
            { label: "Backtracking uses a stack; DFS uses recursion.", explanation: "Both can use recursion or an explicit stack. The data structure isn't what distinguishes them." },
            { label: "Backtracking explores an implicit tree of CHOICES, mutating shared state and undoing on the way back. Plain DFS walks an explicit graph and uses visited[] to avoid revisits — and never undoes anything.", correct: true, explanation: "Right. The implicit-tree-of-choices view is the heart of backtracking. The undo step exists because we're DFS-ing over states (mutating one shared object), not over an explicit graph (where each node is a separate fixed object). Plain DFS doesn't need undo because state is per-node, not shared and threaded through the recursion." },
            { label: "Backtracking is exponential; DFS is linear.", explanation: "DFS on a tree of choices IS exponential — they're the same algorithm. The complexity is a property of the implicit graph, not of the technique." },
            { label: "Backtracking can find optimal solutions; DFS can't.", explanation: "Both can — finding the optimum is about how you score paths, not about which traversal you use." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="Backtracking is DFS over a tree you never build, with state you mutate and undo. The choose / explore / unchoose template solves every problem in this family. The pruning is where the speed comes from."
          points={[
            { takeaway: "Recognize backtracking from three signals: incremental construction, branching choices, exhaustive enumeration.", detail: "Subsets, permutations, combinations, N-Queens, Word Search, Sudoku, Word Break. The moment you see 'enumerate all,' 'find any valid,' or 'count the placements where ...' — reach for the template." },
            { takeaway: "Apply and undo are exact mirrors. Always.", detail: "If apply pushes, undo pops (by position, not value). If apply sets visited[i] = true, undo clears it. Bugs here are silent: the next iteration sees state that doesn't reflect what the loop variable says it should." },
            { takeaway: "The start parameter and visited[] array are the two combinatorial bookkeeping idioms.", detail: "start (loop from start to n, recurse with i+1) for combinations and subsets — enforces increasing-index-only picks, prevents duplicates. visited[] for permutations — tracks which elements are currently in the path." },
            { takeaway: "Pruning isn't optional; it's most of the algorithm.", detail: "Sum-bound (Combination Sum), conflict (N-Queens, Sudoku), order-fixing (de-duplicate by skipping equal-to-previous-and-unused), dead-end (Word Search mismatch). Each is a small isValid check, but cumulatively they turn TLE into milliseconds." },
            { takeaway: "Mutate the input as the visited marker when allowed.", detail: "Word Search overwrites cells with '#'; subsets-on-array problems sometimes mark in place. Saves O(R×C) or O(n) memory. Restore on every return path." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-semibold">Up next · Module 24</p>
          <Link href="/courses/dsa/modules/greedy" className="block mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 no-underline hover:text-indigo-700 dark:hover:text-indigo-300">
            Greedy algorithms →
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Backtracking explores everything. Greedy commits early. The trick is knowing when each is safe.
          </p>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
