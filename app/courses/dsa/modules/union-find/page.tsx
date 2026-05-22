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
  { id: "problem", title: "The dynamic-connectivity problem DSU solves" },
  { id: "forest", title: "The naive forest representation" },
  { id: "compression", title: "Path compression" },
  { id: "rank", title: "Union by rank — and the α(n) result" },
  { id: "components", title: "Counting components & Redundant Connection" },
  { id: "kruskal", title: "Kruskal's MST + Accounts Merge" },
];

export default function UnionFindModule() {
  const mod = getModuleBySlug("union-find")!;

  // A naive forest after a series of unions, showing how a chain forms
  const naiveChain = `
flowchart TD
    subgraph S0["After union(1, 0)"]
        direction TB
        A0["0"] --> B0["1"]
    end
    subgraph S1["After union(2, 1) — root of 1 is 0"]
        direction TB
        A1["0"] --> B1["1"]
        A1 --> C1["2"]
    end
    subgraph S2["After union(3, 2) without rank — chain forms"]
        direction TB
        A2["0"] --> B2["1"]
        A2 --> C2["2"]
        C2 --> D2["3"]
    end
    subgraph S3["A few more unions later — find(k) walks the chain"]
        direction TB
        A3["0"] --> B3["1"]
        B3 --> C3["2"]
        C3 --> D3["3"]
        D3 --> E3["4"]
        E3 --> F3["5"]
    end
    S0 --> S1 --> S2 --> S3
    style A3 fill:#fca5a5,color:#000,stroke:#dc2626
    style F3 fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  // Path compression: before/after find(5)
  const compression = `
flowchart LR
    subgraph BEFORE["Before find(5) — chain"]
        direction TB
        A0["0"] --> B0["1"]
        B0 --> C0["2"]
        C0 --> D0["3"]
        D0 --> E0["4"]
        E0 --> F0["5"]
    end
    subgraph AFTER["After find(5) with path compression"]
        direction TB
        A1["0"] --> B1["1"]
        A1 --> C1["2"]
        A1 --> D1["3"]
        A1 --> E1["4"]
        A1 --> F1["5"]
    end
    BEFORE --> AFTER
    style A0 fill:#fca5a5,color:#000,stroke:#dc2626
    style F0 fill:#fca5a5,color:#000,stroke:#dc2626
    style A1 fill:#10b981,color:#fff,stroke:#047857
    style B1 fill:#a7f3d0,color:#000,stroke:#10b981
    style C1 fill:#a7f3d0,color:#000,stroke:#10b981
    style D1 fill:#a7f3d0,color:#000,stroke:#10b981
    style E1 fill:#a7f3d0,color:#000,stroke:#10b981
    style F1 fill:#a7f3d0,color:#000,stroke:#10b981
  `.trim();

  // Union by rank: shorter tree under taller
  const unionByRank = `
flowchart TB
    subgraph LEFT["Tree A · rank 2"]
        direction TB
        RA["root A"] --> XA["x"]
        RA --> YA["y"]
        XA --> ZA["z"]
    end
    subgraph RIGHT["Tree B · rank 1"]
        direction TB
        RB["root B"] --> XB["w"]
    end
    subgraph MERGED["After union(z, w) — B attached under A"]
        direction TB
        RM["root A · rank stays 2"] --> XM["x"]
        RM --> YM["y"]
        RM --> RB2["root B"]
        XM --> ZM["z"]
        RB2 --> XB2["w"]
    end
    LEFT --> MERGED
    RIGHT --> MERGED
    style RA fill:#10b981,color:#fff,stroke:#047857
    style RB fill:#0ea5e9,color:#fff,stroke:#0284c7
    style RM fill:#10b981,color:#fff,stroke:#047857
    style RB2 fill:#7dd3fc,color:#000,stroke:#0ea5e9
  `.trim();

  // Kruskal in motion
  const kruskal = `
flowchart LR
    subgraph EDGES["Edges sorted by weight"]
        direction TB
        E1["(A,B) w=1"]
        E2["(C,D) w=2"]
        E3["(B,C) w=3"]
        E4["(A,C) w=4 — skip (cycle)"]
        E5["(D,E) w=5"]
        E1 --> E2 --> E3 --> E4 --> E5
    end
    subgraph DSU["DSU state after each edge"]
        direction TB
        D1["{A,B} {C} {D} {E}"]
        D2["{A,B} {C,D} {E}"]
        D3["{A,B,C,D} {E}"]
        D4["unchanged — A and C already united"]
        D5["{A,B,C,D,E}"]
        D1 --> D2 --> D3 --> D4 --> D5
    end
    EDGES --> DSU
    style E4 fill:#fca5a5,color:#000,stroke:#dc2626
    style D4 fill:#fca5a5,color:#000,stroke:#dc2626
    style D5 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="union-find" />
      <ModuleProgress moduleSlug="union-find" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 8 · Module 38 · Advanced
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · the data structure that makes Kruskal&apos;s feasible</p>
      </div>

      {/* ───────────────── Part 1 · Problem ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="problem" title="I can name the problem DSU is the right answer to" xp={20}>
      <section>
        <h2 id="problem">The dynamic-connectivity problem DSU solves</h2>

        <p>
          Here&apos;s the setup, stripped to its core. You have <code>n</code> objects. They start out unrelated.
          Queries arrive one at a time, in two flavors:
        </p>

        <ul>
          <li><code>union(a, b)</code> — declare that <code>a</code> and <code>b</code> are now in the same group.</li>
          <li><code>connected(a, b)</code> — are <code>a</code> and <code>b</code> currently in the same group?</li>
        </ul>

        <p>
          The relation is reflexive, symmetric, and transitive — once you union <code>a</code> with <code>b</code> and{" "}
          <code>b</code> with <code>c</code>, the system has to know <code>a</code> and <code>c</code> are connected
          without you saying so. This is exactly an <strong>equivalence-class</strong>{" "}structure, and the data
          structure that maintains it under streaming updates is <strong>Union-Find</strong>, also called the{" "}
          <strong>Disjoint Set Union</strong> (DSU).
        </p>

        <h3>Why your graph traversal toolkit is the wrong tool here</h3>

        <p>
          You already know how to answer &quot;are <code>a</code> and <code>b</code> connected?&quot; — run BFS or DFS
          from <code>a</code> and check if you reach <code>b</code>. That&apos;s O(V + E) per query. If you have a
          million queries, that&apos;s a million traversals, and the total cost is O(Q · (V + E)). For graphs of any
          size, this is a non-starter.
        </p>

        <p>
          The other natural idea — &quot;just compute connected components once with one big DFS and answer queries
          from a lookup table&quot; — works for a <em>static</em>{" "}graph. The trouble is that in our problem, the graph
          is <em>dynamic</em>: every <code>union</code> potentially merges two components, and you don&apos;t want to
          recompute components from scratch after each merge.
        </p>

        <Callout variant="insight" title="Streaming queries are a different beast">
          <p>
            When the operations are interleaved — union, query, query, union, query — you need a structure that
            incrementally maintains the answer. DSU is to dynamic connectivity what HashMap is to dynamic key-value
            lookup: the structure makes the right operation cheap by representing the data with that operation in mind.
          </p>
        </Callout>

        <h3>The promise — and it&apos;s an unusual one</h3>

        <p>
          With both standard optimizations enabled (path compression and union by rank), DSU answers each query — both{" "}
          <code>union</code> and <code>connected</code> — in <strong>nearly O(1) amortized</strong>. The exact bound is{" "}
          <code>O(α(n))</code>, where <code>α</code> is the inverse Ackermann function. For any <code>n</code> you can
          ever store on a real computer (think 10⁸⁰ atoms in the universe), <code>α(n) ≤ 4</code>. So for engineering
          purposes, the operations are constant-time.
        </p>

        <p>
          That bound is one of the more remarkable results in algorithms. Tarjan and Van Leeuwen proved in 1984 that
          this is also tight — you cannot do better in the worst case for the pointer-machine model. The structure is
          stunningly simple, the analysis is deep, and the constant is small enough that DSU shows up in the inner loop
          of Kruskal&apos;s MST, online connectivity tracking, network percolation, and image-segmentation flood fills.
        </p>

        <h3>The four scenarios where DSU is the right hammer</h3>

        <ul>
          <li><strong>Streaming connectivity.</strong>{" "}Edges arrive one at a time; answer connectivity queries on the fly.</li>
          <li><strong>Connected components count.</strong>{" "}Maintain the number of components as edges are added.</li>
          <li><strong>Cycle detection in an undirected graph.</strong>{" "}An edge that joins two nodes already in the same DSU group closes a cycle.</li>
          <li><strong>Kruskal&apos;s MST.</strong>{" "}Sort edges by weight; greedily add each one that doesn&apos;t close a cycle. The cycle test is exactly a DSU connectivity check.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Suppose you process 10⁶ union/connected queries on 10⁶ nodes. Re-running BFS for each connectivity query would cost roughly O(Q · (V + E)). What's the corresponding cost with a properly-optimized DSU?"
          options={[
            { label: "O(Q · log V).", explanation: "Better than BFS, and what an unoptimized DSU achieves — but with both path compression and union by rank you do better." },
            { label: "O(Q · α(V)), which is effectively O(Q) for any practical input.", correct: true, explanation: "Right. Each operation costs O(α(n)) amortized, where α is the inverse Ackermann function. α(10⁶) ≤ 4 — and α(2^65535) is still ≤ 4. So the per-op cost is, for engineering purposes, constant. That's why DSU dominates BFS-per-query for streaming connectivity." },
            { label: "O(Q · V).", explanation: "That's worse than BFS-per-query. DSU is the optimization, not the regression." },
            { label: "O(V + E + Q).", explanation: "Tempting, but the V + E is already buried in the union ops; the result is closer to O(Q · α(V)). For practical inputs they look the same, but the framing matters." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="You only ever need to answer 'is a connected to b?' once, after all unions are done — never mid-stream. Should you still reach for DSU?"
          options={[
            { label: "Yes — DSU is always faster.", explanation: "Not always. For an offline 'all unions, then all queries' scenario on a fixed edge set, one DFS to label components and an array lookup is O(V + E + Q) total — and simpler. DSU shines when queries are interleaved with updates." },
            { label: "It depends — for a fully-offline problem, a single DFS to label components is simpler and equally fast.", correct: true, explanation: "Right. DSU's superpower is *online*, *incremental* connectivity. If you have all the edges up front and queries come at the end, a single BFS/DFS that labels components is just as fast (O(V + E + Q)) and easier to write. Reach for DSU when the operations are streamed." },
            { label: "No — never use DSU.", explanation: "DSU is the right tool for many problems; it's the streaming-update setting where it dominates." },
            { label: "Use both side by side.", explanation: "Pick the structure that matches the access pattern. Both at once is rarely warranted." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Naive forest ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="forest" title="I can implement a naive forest-based DSU" xp={20}>
      <section>
        <h2 id="forest">The naive forest representation</h2>

        <p>
          The DSU keeps each group as a <strong>tree</strong>. Every node points to a single parent. The <em>root</em>{" "}
          of the tree is the canonical name of its group — two nodes are in the same group if and only if they have
          the same root. The forest of all these trees is stored in a single array:
        </p>

        <CodeBlock lang="java">{`int[] parent = new int[n];
for (int i = 0; i < n; i++) parent[i] = i;   // each node starts as its own root`}</CodeBlock>

        <p>
          The convention <code>parent[i] = i</code> means &quot;<code>i</code> is its own root.&quot; Initial state:{" "}
          <code>n</code> singleton groups, each a tree of one node.
        </p>

        <h3>find — walk to the root</h3>

        <p>
          Finding the root of <code>x</code> means walking parent pointers up until you reach a self-loop:
        </p>

        <CodeBlock lang="java">{`int find(int x) {
    while (parent[x] != x) {
        x = parent[x];
    }
    return x;
}`}</CodeBlock>

        <h3>union — make one root the parent of the other</h3>

        <p>
          To merge two groups, find each root and reassign one to point to the other:
        </p>

        <CodeBlock lang="java">{`void union(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra == rb) return;     // already in the same group
    parent[ra] = rb;          // root of a's tree now points to root of b's tree
}

boolean connected(int a, int b) {
    return find(a) == find(b);
}`}</CodeBlock>

        <h3>Where this falls apart</h3>

        <p>
          The trees can become arbitrarily tall. Consider this adversarial sequence:
        </p>

        <CodeBlock lang="java">{`union(1, 0);   // 1 → 0
union(2, 1);   // 2's root is 2; 1's root is 0. 2 → 0. So 0 has two children: 1 and 2.
// Now if union(3, 2) attaches the root of 3's tree (which is 3) under the root of 2's tree (0),
// you get 3 → 0 — a wide, shallow tree.
//
// But suppose your union is the other way around — root of b under root of a:
//   union(a, b): parent[find(a)] = find(b).
// Then a sequence carefully crafted to always send the *deeper* tree under the *shallower* one
// produces a linear chain.`}</CodeBlock>

        <Mermaid chart={naiveChain} />

        <p>
          With a degenerate sequence you end up with a tree of height <code>n - 1</code> — a linked list. Each{" "}
          <code>find</code> then walks O(n) parent pointers, and a series of <code>m</code> operations costs O(m · n)
          in the worst case. That&apos;s strictly worse than running BFS-per-query for many problems. Naive DSU is a
          theoretical curiosity, not a usable structure.
        </p>

        <Callout variant="warn" title="The real lesson of the chain">
          <p>
            Two operations are bad: a careless <code>union</code> that always extends the same chain, and a{" "}
            <code>find</code> that doesn&apos;t shortcut the path it just walked. Each of the next two checkpoints
            attacks one of these. <em>Either one alone</em>{" "}is enough to make DSU efficient. Together they push the cost
            all the way down to <code>O(α(n))</code> — and that&apos;s the bound that makes Kruskal&apos;s feasible.
          </p>
        </Callout>

        <Quiz
          kind="Operation check"
          question="In the naive forest, what's the worst-case cost of a single find on a DSU of n elements built by an adversarial sequence of unions?"
          options={[
            { label: "O(1).", explanation: "Only with optimizations. Naive DSU has no such guarantee." },
            { label: "O(log n).", explanation: "That's what union by rank alone gives you. The naive version has no shape guarantee." },
            { label: "O(n).", correct: true, explanation: "Right. An adversarial sequence can build a chain of height n-1, and find then walks the entire chain. This is why even one of the two optimizations (compression OR rank) is critical — and why people sometimes describe DSU as 'the data structure where the analysis is harder than the code.'" },
            { label: "O(n²).", explanation: "Even a single find is bounded by tree height, which is at most n. n² would require something pathological beyond a single tree walk." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="In `union(a, b)`, why must we call `find` on both a and b before linking — instead of just doing `parent[a] = b`?"
          options={[
            { label: "We don't need to — `parent[a] = b` is equivalent.", explanation: "It's not. Setting `parent[a] = b` only repoints `a`'s direct edge; if `a` already had a root other than itself, the rest of `a`'s subtree still points to the old root. The two trees end up disconnected." },
            { label: "Because we have to merge the *roots* — pointing one non-root at another non-root leaves the trees structurally separate.", correct: true, explanation: "Right. The invariant of the structure is 'two nodes are in the same group iff they share a root.' That invariant is preserved only by linking root-to-root. Linking node-to-node breaks the structure: you'd have a node with a parent pointer that doesn't lead to a single canonical root for its old group." },
            { label: "It's a Java implementation detail.", explanation: "It's a structural requirement of the algorithm, language-independent." },
            { label: "To avoid array bounds errors.", explanation: "Bounds aren't the issue. Correctness of the disjoint-set invariant is." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Path compression ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="compression" title="I understand and can implement path compression" xp={25}>
      <section>
        <h2 id="compression">Path compression</h2>

        <p>
          The first optimization is almost embarrassingly simple. Each time you call <code>find(x)</code>, you walk a
          path from <code>x</code> up to its root. <strong>Make every node along that path point directly at the
          root.</strong>{" "}The next <code>find</code> on any of them — or any of their descendants — finishes in O(1).
        </p>

        <h3>The recursive one-liner</h3>

        <CodeBlock lang="java">{`int find(int x) {
    if (parent[x] != x) {
        parent[x] = find(parent[x]);   // recurse, then write back the root
    }
    return parent[x];
}`}</CodeBlock>

        <p>
          Read this top-down: if <code>x</code> isn&apos;t the root, recurse to find <code>x</code>&apos;s root. The
          recursive call returns the root, and the assignment <code>parent[x] = ...</code> shortcuts <code>x</code>{" "}
          directly to it. The recursion unwinds and every node along the path gets repointed at the root. Three lines
          of code, and the entire chain collapses into a star.
        </p>

        <Mermaid chart={compression} />

        <h3>The iterative two-pass version</h3>

        <p>
          The recursive version is elegant, but on adversarial inputs the recursion depth equals the original tree
          height — which can be O(n) before any compression has happened. For <code>n = 10⁶</code> that&apos;s a stack
          overflow. The iterative version walks the path once to find the root, then walks it again to repoint
          everyone:
        </p>

        <CodeBlock lang="java">{`int find(int x) {
    // Pass 1: find the root.
    int root = x;
    while (parent[root] != root) root = parent[root];

    // Pass 2: walk the path again, repointing every node directly at the root.
    while (parent[x] != root) {
        int next = parent[x];
        parent[x] = root;
        x = next;
    }
    return root;
}`}</CodeBlock>

        <Callout variant="insight" title="A subtler variant: path halving">
          <p>
            A common third option, <em>path halving</em>, makes every other node on the path point to its grandparent:{" "}
            <code>parent[x] = parent[parent[x]]; x = parent[x];</code> in the find loop. It does less work per find than
            full compression but achieves the same asymptotic O(α(n)) bound when paired with union by rank. In practice,
            most production DSU implementations use either path halving or full two-pass compression — both are
            stack-safe and roughly the same speed.
          </p>
        </Callout>

        <h3>How fast does compression alone make DSU?</h3>

        <p>
          Path compression by itself, without any union strategy, gives <code>O(log n)</code> amortized per operation.
          Each operation either finishes fast or reshapes the tree into a flatter version. The harder result — that
          path compression <em>plus</em>{" "}a smart union strategy gives <code>O(α(n))</code> — is what we&apos;ll set up
          in the next checkpoint.
        </p>

        <Callout variant="warn" title="Recursion depth in interview code">
          <p>
            For interviews and short programs, the recursive one-liner is fine. For production code or LeetCode tests
            with <code>n &gt; 10⁵</code>, prefer the iterative version. Java&apos;s default stack is a few hundred KB —
            enough for ~10⁴–10⁵ frames depending on local variables. A pathological pre-compression input can blow this.
          </p>
        </Callout>

        <Quiz
          kind="Operation check"
          question="The recursive `find` is `if (parent[x] != x) parent[x] = find(parent[x]); return parent[x];`. Why is the assignment `parent[x] = find(parent[x])` rather than just `find(parent[x])`?"
          options={[
            { label: "It's a stylistic choice.", explanation: "It's the entire optimization — without the assignment, you have a plain `find` with no compression at all." },
            { label: "Without the assignment, the recursive call returns the root but no parent pointer is updated — so the next find on the same node walks the same chain again.", correct: true, explanation: "Right. The whole point of compression is the *side effect* of repointing every node on the path at the root. The assignment `parent[x] = find(parent[x])` is what writes the new shortcut back into the array. Drop the assignment and you have a correct but unoptimized find — every future call will walk the same long chain." },
            { label: "It's required by Java's syntax.", explanation: "Java doesn't require this; the language compiles either form. The reason is algorithmic." },
            { label: "To avoid an infinite loop.", explanation: "The base case `parent[x] == x` already prevents infinite recursion. The assignment is for compression, not termination." },
          ]}
        />

        <Quiz
          kind="Operation check"
          question="Suppose you call find(5) on a tree where 5 is at depth 4 (5 → 4 → 3 → 2 → 1, with 1 being the root). After find(5) with full path compression, what is `parent[3]`?"
          options={[
            { label: "3 — unchanged.", explanation: "Path compression repoints every node along the find path, including 3. Its parent moves from 2 to 1." },
            { label: "2 — unchanged.", explanation: "Before the call it was 2, but the call repointed 3 to the root (1)." },
            { label: "1 — now points directly at the root.", correct: true, explanation: "Right. Path compression repoints every node on the find path — that's 5, 4, 3, and 2 — directly at the root, 1. So parent[5], parent[4], parent[3], and parent[2] all become 1. The next find on any of them is O(1)." },
            { label: "5 — points at the original caller.", explanation: "Compression always points toward the root, never toward the caller." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Union by rank ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="rank" title="I can pair compression with union by rank — and explain α(n)" xp={25}>
      <section>
        <h2 id="rank">Union by rank — and the α(n) result</h2>

        <p>
          Path compression makes <code>find</code> cheap once trees have been walked. The complementary optimization
          attacks the problem from the other side: <strong>keep the trees shallow in the first place</strong>. Two
          common variants exist; both have the same effect.
        </p>

        <h3>Variant A · Union by rank</h3>

        <p>
          <code>rank[i]</code> is an upper bound on the height of the subtree rooted at <code>i</code>. Initially every
          node has rank 0. On <code>union(a, b)</code>, attach the root of the <em>shorter</em>{" "}tree under the root of
          the <em>taller</em>{" "}one. If they&apos;re tied, attach either one and bump the survivor&apos;s rank by 1.
        </p>

        <Mermaid chart={unionByRank} />

        <CodeBlock lang="java">{`int[] parent;
int[] rank;

void init(int n) {
    parent = new int[n];
    rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;   // rank[] is zero-initialized
}

int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);
    return parent[x];
}

void union(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra == rb) return;
    // Attach shorter under taller.
    if (rank[ra] < rank[rb]) {
        parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
        parent[rb] = ra;
    } else {
        parent[rb] = ra;
        rank[ra]++;
    }
}`}</CodeBlock>

        <p>
          Why this works: attaching the shorter tree under the taller one cannot increase the taller tree&apos;s
          height. The resulting tree has the same height as the taller input. Height only grows when two equal-height
          trees merge — and to grow the height by 1, you need to double the node count. So the height of a tree with{" "}
          <code>n</code> nodes is at most <code>⌊log₂ n⌋</code>, and <code>find</code> is O(log n) — even without path
          compression.
        </p>

        <h3>Variant B · Union by size</h3>

        <p>
          Track the size of each tree instead of its rank, and attach the smaller tree under the larger one. The same
          argument applies: a tree of height <code>h</code> must contain at least <code>2^h</code> nodes. Slightly more
          intuitive than rank for many people; in practice the two are interchangeable.
        </p>

        <CodeBlock lang="java">{`int[] size;   // initially all 1

void union(int a, int b) {
    int ra = find(a);
    int rb = find(b);
    if (ra == rb) return;
    if (size[ra] < size[rb]) {
        parent[ra] = rb;
        size[rb] += size[ra];
    } else {
        parent[rb] = ra;
        size[ra] += size[rb];
    }
}`}</CodeBlock>

        <Callout variant="info" title="Rank vs size — pick one and move on">
          <p>
            Both achieve O(log n) per op alone, and both achieve O(α(n)) when combined with path compression. Rank is
            marginally faster (it&apos;s an integer that occasionally increments by 1), size is more useful when you
            want component sizes for free. Most production code uses size; competitive-programming templates tend to use
            rank. Don&apos;t lose sleep over the choice.
          </p>
        </Callout>

        <h3>The α(n) result — and what it means</h3>

        <p>
          When you combine path compression with either union strategy, the amortized cost per operation drops to{" "}
          <code>O(α(n))</code>, where <code>α</code> is the inverse Ackermann function. Some intuition:
        </p>

        <ul>
          <li>The Ackermann function <code>A(m, n)</code> grows so explosively that <code>A(4, 2)</code> already exceeds the number of atoms in the observable universe.</li>
          <li>Its inverse <code>α(n)</code> is the smallest <code>m</code> such that <code>A(m, m) ≥ n</code>.</li>
          <li>For <code>n ≤ 10⁸⁰</code>, <code>α(n) ≤ 4</code>. For any input you&apos;ll ever process, <code>α(n) ≤ 4</code>.</li>
        </ul>

        <p>
          So in practice, every DSU operation costs &quot;at most a small constant.&quot; The function isn&apos;t
          exactly constant — there&apos;s a beautiful 1975 lower bound by Tarjan that says you cannot do better — but
          it&apos;s as close to constant as a non-trivial data structure ever gets.
        </p>

        <Callout variant="insight" title="Why both optimizations are worth keeping">
          <p>
            Compression alone: O(log n). Union by rank alone: O(log n). Both together: O(α(n)). The combination is more
            than the sum of its parts because the two optimizations cooperate: union by rank guarantees the trees never
            start tall, and compression flattens whatever height does emerge. Drop either one and you lose the
            inverse-Ackermann bound — though for most workloads, log n is already plenty fast.
          </p>
        </Callout>

        <ClassifyChallenge
          title="Which optimization buys you what?"
          prompt="For each effect, decide which DSU optimization (or combination) is responsible."
          buckets={[
            { id: "compression", label: "Path compression alone", color: "emerald" },
            { id: "rank", label: "Union by rank/size alone", color: "sky" },
            { id: "both", label: "Both together", color: "amber" },
          ]}
          items={[
            { id: "1", label: "Tree height bounded by log₂ n at all times.", answer: "rank", explanation: "Union by rank/size keeps trees shallow during merges. Compression doesn't bound height per se — it just shortcuts paths after they've been walked." },
            { id: "2", label: "After find(x), every node on the find path is one hop from the root.", answer: "compression", explanation: "That's the literal definition of full path compression. Union by rank does not modify existing parent pointers." },
            { id: "3", label: "Amortized O(α(n)) per operation.", answer: "both", explanation: "The inverse-Ackermann bound requires both. With one alone, you get O(log n). With both, the analysis tightens to nearly-constant." },
            { id: "4", label: "Worst-case single operation O(log n) (deterministic, not amortized).", answer: "rank", explanation: "Union by rank gives a deterministic worst-case height bound of log n. Compression is amortized — a single uncompressed find can still be expensive; the savings show up over a sequence." },
            { id: "5", label: "Subsequent finds on previously-walked paths are O(1).", answer: "compression", explanation: "Compression's whole point is making future finds free for nodes whose paths have been walked. Rank doesn't touch parent pointers post-merge." },
            { id: "6", label: "The classic m-op sequence on n elements runs in O((m + n) · α(n)).", answer: "both", explanation: "This is the textbook Tarjan result — and it requires both optimizations. With just one, the bound becomes O((m + n) · log n)." },
            { id: "7", label: "Cost of `union` (not counting the two find calls) is always O(1).", answer: "rank", explanation: "Union itself is just two parent pointer updates plus a rank/size update — that's O(1) regardless. The cost of union *as a whole* is dominated by the find calls; rank/size keeps those bounded too." },
            { id: "8", label: "After many operations, the forest looks like a flat star — most nodes point directly at their root.", answer: "compression", explanation: "Compression flattens. Rank keeps trees shallow but doesn't make them stars; with rank alone, you can still see internal nodes. Compression is what produces the star shape." },
          ]}
        />

        <Quiz
          kind="Concept check"
          question="In `union by rank`, when both trees have equal rank, why do you bump the survivor's rank by 1?"
          options={[
            { label: "Because the merged tree has one more level than either input.", correct: true, explanation: "Right. If both trees have height h and you attach one under the root of the other, the combined tree's height is h + 1. The rank field has to reflect that — otherwise future unions would treat the larger merged tree as if it were still height h, and the height bound would degrade." },
            { label: "It's just a tiebreaker for symmetry.", explanation: "It's not arbitrary symmetry-breaking — the rank actually goes up. The tree did get taller." },
            { label: "To keep the rank in sync with the size.", explanation: "Rank and size are different invariants; rank reflects height, size reflects node count. Bumping rank tracks height growth, not size growth." },
            { label: "To prevent integer overflow.", explanation: "Rank grows by at most log n, far below overflow territory." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Components & Redundant Connection ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="components" title="I can solve component-counting and Redundant Connection with DSU" xp={25}>
      <section>
        <h2 id="components">Counting components & Redundant Connection</h2>

        <p>
          Two of the most common interview applications of DSU are component counting (LeetCode 323 — Number of
          Connected Components in an Undirected Graph) and redundant-edge detection (LeetCode 684 — Redundant
          Connection). Both are nearly trivial once the structure is in place.
        </p>

        <h3>The full DSU class — production-ready</h3>

        <p>
          Here&apos;s the version most working programmers reach for. Path compression, union by size, and a{" "}
          <code>count</code> field that tracks the number of components for free.
        </p>

        <CodeBlock lang="java">{`public class DSU {
    private final int[] parent;
    private final int[] size;
    private int count;             // number of disjoint components

    public DSU(int n) {
        parent = new int[n];
        size = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
        count = n;
    }

    public int find(int x) {
        // Iterative two-pass — stack-safe.
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) {
            int next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    /** Returns true iff a and b were in different components and have now been merged. */
    public boolean union(int a, int b) {
        int ra = find(a);
        int rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;
        size[ra] += size[rb];
        count--;
        return true;
    }

    public boolean connected(int a, int b) { return find(a) == find(b); }
    public int componentCount()             { return count; }
    public int componentSize(int x)         { return size[find(x)]; }
}`}</CodeBlock>

        <Callout variant="insight" title="Why union returns boolean">
          <p>
            The return value is the difference between &quot;this edge bridged two components&quot; and &quot;this edge
            was redundant.&quot; That single bit of information is exactly what Redundant Connection, Kruskal&apos;s
            MST, and online cycle detection all need. Returning it from <code>union</code> avoids a redundant{" "}
            <code>connected</code> call and makes calling code read like the algorithm: &quot;if this edge unites two
            components, keep it; otherwise it&apos;s a cycle-closer, discard.&quot;
          </p>
        </Callout>

        <h3>LC 323 · Number of Connected Components</h3>

        <p>
          Given <code>n</code> nodes labeled <code>0..n-1</code> and a list of undirected edges, return the number of
          connected components.
        </p>

        <CodeBlock lang="java">{`public int countComponents(int n, int[][] edges) {
    DSU dsu = new DSU(n);
    for (int[] e : edges) dsu.union(e[0], e[1]);
    return dsu.componentCount();
}`}</CodeBlock>

        <p>
          Three lines plus the DSU. The same problem with BFS or DFS takes ~25 lines (build adjacency list, outer loop
          over unvisited nodes, inner traversal). DSU isn&apos;t shorter just for cosmetic reasons — it&apos;s shorter
          because the data structure&apos;s invariant <em>is</em>{" "}the answer the problem asks for.
        </p>

        <h3>LC 684 · Redundant Connection</h3>

        <p>
          You&apos;re given <code>n - 1 + 1 = n</code> edges that form an undirected graph on <code>n</code> nodes. The
          graph started as a tree, then exactly one extra edge was added — return that extra edge. If multiple
          candidate edges exist, return the one that appears last in the input.
        </p>

        <CodeBlock lang="java">{`public int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    DSU dsu = new DSU(n + 1);   // nodes are 1-indexed in the problem
    for (int[] e : edges) {
        if (!dsu.union(e[0], e[1])) {
            return e;            // first edge whose endpoints already share a root
        }
    }
    throw new IllegalStateException("No redundant edge found");
}`}</CodeBlock>

        <p>
          Walk the edges in order. The first one whose endpoints are <em>already</em>{" "}in the same DSU group is the
          one that closes a cycle — by problem guarantee, this is the redundant edge, and the &quot;first cycle-closer
          in input order&quot; matches the &quot;last in input order&quot; tiebreaker because the input has exactly
          one extra edge: there can only be one cycle-closer.
        </p>

        <h3>Why DSU beats DFS for these problems</h3>

        <ul>
          <li><strong>Streaming-friendly.</strong>{" "}Edges arrive one at a time; you don&apos;t need to materialize the whole adjacency list before answering.</li>
          <li><strong>No revisits.</strong>{" "}Each edge is processed exactly once, in O(α(n)). DFS-based cycle detection has to rebuild a visited set every time the graph changes.</li>
          <li><strong>Single source of truth.</strong>{" "}Component count and connectivity are both maintained as a side effect of the union ops — no second pass needed.</li>
          <li><strong>Simpler code.</strong>{" "}No adjacency list, no recursion, no visited array. Just a couple of arrays and three methods.</li>
        </ul>

        <Callout variant="warn" title="Where DFS still wins: directed cycles">
          <p>
            DSU is for <em>undirected</em>{" "}connectivity. It cannot detect cycles in a <em>directed</em>{" "}graph — the
            structure has no notion of edge direction. For directed cycle detection you want the WHITE/GRAY/BLACK DFS
            coloring from Module 18 (or topological sort with Kahn&apos;s algorithm). Reach for DSU when the relation
            you&apos;re tracking is symmetric.
          </p>
        </Callout>

        <Quiz
          kind="Application check"
          question="In the Redundant Connection solution above, why is it correct to return the *first* edge whose endpoints are already united, rather than scanning all edges and returning the last cycle-closer?"
          options={[
            { label: "Because the problem guarantees exactly one extra edge — so only one edge can ever be a cycle-closer.", correct: true, explanation: "Right. The problem states the input is a tree (n nodes, n-1 edges) with exactly one extra edge added. A tree has no cycles, so as you process edges in order the very first one that closes a cycle has to be the extra one. There's no second cycle-closer to find." },
            { label: "Because cycles in undirected graphs are always detected at their first edge.", explanation: "Not in general — a cycle is detected when its closing edge is processed, but the *closing* edge depends on the input order. The reason this code is correct is the structural guarantee, not a general property of cycles." },
            { label: "Because DSU detects edges in reverse input order.", explanation: "DSU has no concept of input order. We process edges in the order given." },
            { label: "It happens to work but isn't guaranteed.", explanation: "It is guaranteed by the problem's structural setup: tree + 1 extra edge means exactly one cycle, hence exactly one cycle-closer." },
          ]}
        />

        <Quiz
          kind="Application check"
          question="You're maintaining a DSU on 10⁶ users. Every time two users become friends, you call `union`. To answer 'how many friend-circles are there right now?', you can:"
          options={[
            { label: "Run a fresh BFS/DFS over all users.", explanation: "O(V + E) per query. If queries arrive often, this dominates." },
            { label: "Iterate the parent[] array and count entries where parent[i] == i.", explanation: "Correct but O(n) per query — fine for occasional reporting, slow for hot paths. Worse, until find() compresses, parent[i] == i isn't even reliably equivalent to 'i is a root in the current forest' if you've been lazy with union (you'd need to call find on each i first). The componentCount() field avoids both issues." },
            { label: "Maintain a `count` field that decrements every time union actually merges two components.", correct: true, explanation: "Right. Initialize count to n. Every successful union (one that returns true) merges two components into one, so count--. The query is then O(1) — read the field. This is the standard pattern: any monotonic per-union side effect (count, total weight, max component size) can be tracked incrementally." },
            { label: "It's not possible without rebuilding the structure.", explanation: "Incremental tracking is exactly what DSU is designed for." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Kruskal & Accounts Merge ───────────────── */}
      <Checkpoint moduleSlug="union-find" id="kruskal" title="I built DSU from scratch and solved 3 LeetCode" xp={40} manual manualLabel="I solved all three LeetCode problems" celebration="DSU is one of the most beautiful results in algorithms — a structure where the analysis is harder than the code, yet the code is so simple it fits on a sticky note. You're now equipped for Kruskal, Bellman-Ford, and the rest of advanced graphs.">
      <section>
        <h2 id="kruskal">Kruskal&apos;s MST + Accounts Merge teaser</h2>

        <p>
          DSU&apos;s most famous application is <strong>Kruskal&apos;s minimum spanning tree</strong>{" "}algorithm. It&apos;s
          also the structure behind LeetCode 721 (Accounts Merge), the gnarly canonical &quot;merge groups by shared
          identifier&quot; problem.
        </p>

        <h3>Kruskal&apos;s MST in three lines</h3>

        <p>
          A minimum spanning tree of a connected, weighted, undirected graph is a subset of edges that connects all
          nodes with total weight as small as possible. Kruskal&apos;s algorithm:
        </p>

        <ol>
          <li>Sort all edges by weight, ascending.</li>
          <li>Walk the sorted edges. For each, if its endpoints aren&apos;t already connected, take it. Otherwise skip — taking it would close a cycle.</li>
          <li>Stop when you&apos;ve taken <code>n - 1</code> edges (you have a spanning tree) or run out.</li>
        </ol>

        <Mermaid chart={kruskal} />

        <CodeBlock lang="java">{`/**
 * Kruskal's MST.
 * Input: n nodes labeled 0..n-1 and a list of weighted undirected edges {u, v, w}.
 * Output: the total weight of an MST, or -1 if the graph is disconnected.
 */
public int kruskal(int n, int[][] edges) {
    Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));   // ascending by weight

    DSU dsu = new DSU(n);
    int totalWeight = 0;
    int edgesUsed = 0;

    for (int[] e : edges) {
        if (dsu.union(e[0], e[1])) {
            totalWeight += e[2];
            edgesUsed++;
            if (edgesUsed == n - 1) break;   // spanning tree complete
        }
    }
    return edgesUsed == n - 1 ? totalWeight : -1;
}`}</CodeBlock>

        <Callout variant="insight" title="Why the greedy works (the cut property)">
          <p>
            At any point during Kruskal&apos;s, the chosen edges form a forest. Adding the next-lightest edge that
            doesn&apos;t close a cycle is always safe: it&apos;s the cheapest edge across some <em>cut</em>{" "}separating
            two components, and the cut property of MSTs says the lightest edge crossing any cut is in some MST. DSU
            makes this greedy efficient — without it, the cycle test would be O(V + E) per edge and the whole algorithm
            would be O(E · (V + E)). With DSU, sorting dominates: O(E log E) total.
          </p>
        </Callout>

        <h3>Cost analysis</h3>

        <ul>
          <li>Sorting <code>E</code> edges: O(E log E).</li>
          <li><code>E</code> calls to <code>union</code>, each O(α(V)): O(E · α(V)).</li>
          <li>Total: <strong>O(E log E)</strong> — sorting dominates.</li>
        </ul>

        <p>
          Compare to Prim&apos;s algorithm with a binary heap: O((V + E) log V). The two are roughly comparable.
          Kruskal wins on sparse graphs and is conceptually simpler; Prim wins on dense graphs and integrates cleanly
          with priority-queue infrastructure. Both deserve a spot in your toolkit; you&apos;ll see Prim in module 32.
        </p>

        <h3>LC 721 · Accounts Merge</h3>

        <p>
          The problem: each account has a name and a list of emails. Two accounts belong to the same person if they
          share any email. Group all accounts by person and return the merged list, with emails sorted alphabetically
          within each group.
        </p>

        <p>
          The DSU framing: <strong>treat each email as a node</strong>. For each account, union the account&apos;s
          first email with each of the rest — this declares them part of the same person. Once all unions are done,
          group emails by their root.
        </p>

        <CodeBlock lang="java">{`public List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, Integer> emailToId = new HashMap<>();
    Map<String, String> emailToName = new HashMap<>();

    // Pass 1: assign a stable integer id to every distinct email.
    for (List<String> account : accounts) {
        String name = account.get(0);
        for (int i = 1; i < account.size(); i++) {
            String email = account.get(i);
            emailToName.putIfAbsent(email, name);
            emailToId.putIfAbsent(email, emailToId.size());
        }
    }

    // Pass 2: union all emails within each account.
    DSU dsu = new DSU(emailToId.size());
    for (List<String> account : accounts) {
        int firstId = emailToId.get(account.get(1));
        for (int i = 2; i < account.size(); i++) {
            dsu.union(firstId, emailToId.get(account.get(i)));
        }
    }

    // Pass 3: group emails by root, sort, and prepend the name.
    Map<Integer, List<String>> rootToEmails = new HashMap<>();
    for (Map.Entry<String, Integer> e : emailToId.entrySet()) {
        int root = dsu.find(e.getValue());
        rootToEmails.computeIfAbsent(root, k -> new ArrayList<>()).add(e.getKey());
    }

    List<List<String>> result = new ArrayList<>();
    for (List<String> emails : rootToEmails.values()) {
        Collections.sort(emails);
        List<String> entry = new ArrayList<>();
        entry.add(emailToName.get(emails.get(0)));
        entry.addAll(emails);
        result.add(entry);
    }
    return result;
}`}</CodeBlock>

        <Callout variant="warn" title="The Accounts Merge gotcha">
          <p>
            The hard part isn&apos;t the DSU — it&apos;s the bookkeeping around mapping strings to ids and back. Many
            first attempts try to use the email string itself as the DSU key, which forces a HashMap-backed DSU and
            obscures the algorithm. Stick with the integer-id pattern: pass 1 hashes every email to a stable int, pass 2
            runs unions on those ints, pass 3 groups by root. Three clean passes, each linear.
          </p>
        </Callout>

        <h3>Project: build DSU from scratch + LeetCode trio</h3>

        <p>
          Implement the <code>DSU</code> class from this checkpoint without looking. Then solve all three:
        </p>

        <ul>
          <li><strong>LC 323 · Number of Connected Components in an Undirected Graph</strong> — initialize DSU, union every edge, return <code>componentCount()</code>. ~5 lines.</li>
          <li><strong>LC 684 · Redundant Connection</strong> — walk edges in order, return the first whose endpoints already share a root. ~6 lines.</li>
          <li><strong>LC 721 · Accounts Merge</strong> — three-pass version above. ~30 lines, mostly bookkeeping.</li>
        </ul>

        <p>
          For at least one of these, swap your DSU for a deliberately broken one (no path compression, no union by
          rank) and observe the timeout on the largest test case. That visceral experience of &quot;same algorithm,
          dead in the water without the optimizations&quot; is worth more than any complexity argument.
        </p>

        <ClassifyChallenge
          title="DSU or another tool?"
          prompt="For each problem, decide whether DSU is the natural fit, or whether you'd reach for a different structure."
          buckets={[
            { id: "dsu", label: "DSU is the right tool", color: "rose" },
            { id: "other", label: "Something else fits better", color: "amber" },
          ]}
          items={[
            { id: "1", label: "Detect a cycle in an undirected graph as edges arrive one at a time.", answer: "dsu", explanation: "Streaming undirected cycle detection is DSU's signature use case. Each edge: if endpoints already share a root, the edge closes a cycle." },
            { id: "2", label: "Detect a cycle in a directed graph.", answer: "other", explanation: "DSU has no edge direction. Use DFS with WHITE/GRAY/BLACK coloring (Module 18) or Kahn's topological sort with a remaining-count check." },
            { id: "3", label: "Maintain the count of connected components as edges stream in.", answer: "dsu", explanation: "Initialize count = n; decrement on each successful union. O(α(n)) per update, O(1) per query." },
            { id: "4", label: "Find the shortest path between two nodes in a weighted graph.", answer: "other", explanation: "Dijkstra (with a heap) or Bellman-Ford. DSU answers connectivity, not distance." },
            { id: "5", label: "Build a minimum spanning tree.", answer: "dsu", explanation: "Kruskal's algorithm. Sort edges, union endpoints if not already connected. The cycle test is a DSU connectivity check." },
            { id: "6", label: "Group accounts by shared emails (LC 721).", answer: "dsu", explanation: "Treat each email as a node; union emails within the same account; group by root. The classic 'merge groups by shared identifier' DSU pattern." },
            { id: "7", label: "Find the strongly connected components of a directed graph.", answer: "other", explanation: "Tarjan's or Kosaraju's algorithm — both DFS-based. DSU is symmetric; SCCs need direction-aware reachability." },
            { id: "8", label: "On a 2D grid, count distinct islands as cells flip from water to land one at a time.", answer: "dsu", explanation: "LeetCode 305, 'Number of Islands II.' Each new land cell: union with each of its land neighbors. Component count is the answer. DSU is the standard solution." },
            { id: "9", label: "Detect whether a node has a path to itself in a static directed graph.", answer: "other", explanation: "Static + directed = run a DFS from each node, or compute SCCs. DSU is for symmetric, dynamic problems." },
            { id: "10", label: "Find the median of a number stream.", answer: "other", explanation: "Two heaps. DSU has nothing to do with order statistics." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Kruskal's MST runs in O(E log E) total. Where does the log E come from?"
          options={[
            { label: "From the DSU operations.", explanation: "DSU ops are O(α(V)), effectively constant. Not the source of the log." },
            { label: "From sorting the edge list by weight.", correct: true, explanation: "Right. We do E DSU operations (each O(α(V)) ≈ constant) and one sort of the edge list (O(E log E)). The sort dominates. This is why DSU's near-constant cost is what makes Kruskal practical: with a slower union-find, the per-edge cost would dominate sorting and the whole algorithm would degrade." },
            { label: "From the heap inside the DSU.", explanation: "DSU has no heap. You may be thinking of Prim's algorithm — different MST algorithm, different data structure." },
            { label: "From the find() recursion depth.", explanation: "Recursion depth is bounded by tree height (log V at worst with union by rank), but it's amortized away by path compression. The dominant cost is the sort." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In Accounts Merge, why do we treat each *email* as a DSU node — instead of each *account*?"
          options={[
            { label: "It's an arbitrary choice; account-as-node also works.", explanation: "It would work but it's harder. With accounts as nodes, you'd have to first detect every shared-email pair (an O(n²) scan or another HashMap) before you could even start unioning." },
            { label: "The merging relation lives at the email level — two accounts merge iff they share an email — so emails are the natural connective tissue.", correct: true, explanation: "Right. The 'shared email' relation is naturally expressed by emails as nodes: every email belongs to one root, and an account is just a set of emails. Within an account, union all emails together. After processing all accounts, emails with the same root form one person. The DSU work is linear in total emails, not quadratic in accounts." },
            { label: "Emails are alphabetical; accounts are not.", explanation: "Sorting happens in pass 3 of the output construction. The reason for emails-as-nodes is the structure of the merging relation, not output order." },
            { label: "Java's DSU only supports string keys.", explanation: "The DSU is integer-indexed in our implementation; we hash emails to ints. The choice of node type is algorithmic, not language-imposed." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A senior engineer tells you 'just use union by rank — path compression isn't worth the recursive code.' Is this defensible?"
          options={[
            { label: "Yes — union by rank alone is O(log n), which is plenty fast for any input.", explanation: "It IS plenty fast for many inputs, but you'd lose the inverse-Ackermann bound, and on the hot path of inner-loop DSU usage (Kruskal's on millions of edges) the constant matters. Also: 'recursive' is a non-issue — the iterative two-pass version is just as compressed and stack-safe." },
            { label: "Defensible only if recursion depth is a real concern; otherwise the iterative two-pass compression is the same code length and gives you the α(n) bound.", correct: true, explanation: "Right. The strongest version of the engineer's argument is about stack safety, not optimization value — and that argument is fully addressed by the iterative two-pass version (or path halving), which is six lines and stack-safe. There's no good reason to skip compression in a production DSU; the inverse-Ackermann bound is essentially free." },
            { label: "No — without path compression, the structure is incorrect.", explanation: "Without compression the structure is *correct*, just slower (O(log n) instead of O(α(n))). The senior engineer's claim is about performance, not correctness." },
            { label: "Yes — compression and rank do the same thing.", explanation: "They do not. Rank bounds tree height during merges; compression flattens paths after walks. Different mechanisms, complementary effects." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="DSU answers dynamic-connectivity queries — union and connected — in nearly constant time. Two ideas (path compression + union by rank/size) carry the entire performance argument. Three problems (component count, redundant edge, Kruskal's MST) carry the entire interview surface."
          points={[
            { takeaway: "Recognize the DSU shape: streaming union and connected queries on equivalence classes.", detail: "Whenever the problem says 'merge these', 'are these in the same group', or 'count the groups' — and the operations are interleaved with queries — DSU is the structure to reach for. Naive BFS-per-query is the wrong asymptotics." },
            { takeaway: "Implement the parent[]/size[] DSU from memory.", detail: "init: parent[i] = i, size[i] = 1, count = n. find: walk to root, then path-compress. union: find both roots, attach smaller under larger, decrement count. connected: find(a) == find(b). Six methods, ~40 lines, stack-safe." },
            { takeaway: "State the optimization tradeoffs.", detail: "Path compression alone: O(log n) amortized. Union by rank/size alone: O(log n) worst case. Both together: O(α(n)) amortized — effectively constant for any n you can store. Drop either and you lose the inverse-Ackermann result; drop both and you're back to O(n)." },
            { takeaway: "Kruskal's MST is sort-then-union.", detail: "Sort edges by weight, walk in order, union endpoints if not already connected. O(E log E) overall, dominated by the sort. The cycle test that makes greedy MST work is exactly a DSU connectivity check — without DSU, Kruskal's wouldn't be practical." },
            { takeaway: "Accounts Merge is the canonical 'group by shared identifier' DSU pattern.", detail: "Treat the shared identifier (email) as the node, union within each account, group by root. Three linear passes: assign ids, run unions, build output. The same recipe applies to dozens of variants: shared phone numbers, shared substrings, shared hashtags." },
            { takeaway: "Know when DSU is the wrong answer.", detail: "Directed graphs: DSU has no edge direction. Distance/shortest path: DSU only answers connectivity. Static + offline: a single BFS/DFS is simpler and equally fast. DSU's edge is dynamic, undirected, and connectivity-flavored." },
          ]}
        />

        <div className="not-prose mt-8 mb-8 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-6 dark:border-pink-800/40 dark:from-pink-950/30 dark:to-rose-950/30">
          <p className="mb-2 text-sm font-bold tracking-wider text-pink-700 uppercase dark:text-pink-300">Up next · Module 39</p>
          <h3 className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100">Advanced graph: MST, Bellman-Ford, Floyd-Warshall</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            You&apos;ve seen Kruskal&apos;s MST — next, Prim&apos;s alternative (heap-based), and the two heavyweight
            shortest-path algorithms: Bellman-Ford for graphs with negative edges, and Floyd-Warshall for all-pairs
            shortest paths. Together they round out the graph-algorithm toolkit you&apos;ll lean on for the rest of
            your career.
          </p>
          <Link
            href="/courses/dsa/modules/advanced-graph"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
          >
            Continue to Advanced graph →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="union-find" />
    </article>
  );
}
