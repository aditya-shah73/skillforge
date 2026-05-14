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

export default function Phase4RevisionModule() {
  const mod = getModuleBySlug("phase-4-revision")!;

  // A small DAG and one of its valid topological orderings — visual anchor
  // for the topo-sort section. Two orderings are valid because B and C are
  // independent siblings; either may come first.
  const dagChart = `
flowchart LR
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D
    D --> E((E))
    style A fill:#0ea5e9,color:#fff,stroke:#0284c7
    style B fill:#38bdf8,color:#000,stroke:#0284c7
    style C fill:#38bdf8,color:#000,stroke:#0284c7
    style D fill:#7dd3fc,color:#000,stroke:#0ea5e9
    style E fill:#bae6fd,color:#000,stroke:#0ea5e9
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/dsa"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 4 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 4 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The whole graph chapter — representations, BFS/DFS, shortest paths, topological sort — compressed to a reference card you can re-read in 15 minutes before an interview.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="phase-4-revision" />
        <ModuleProgress moduleSlug="phase-4-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 4</strong> — every representation, every traversal, every shortest-path algorithm, every named pattern from the three previous modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The three modules you&apos;re consolidating: <Link href="/courses/dsa/modules/graphs-intro" className="text-sky-600 hover:underline">Graphs intro &amp; representations</Link>, <Link href="/courses/dsa/modules/bfs-dfs" className="text-sky-600 hover:underline">BFS &amp; DFS</Link>, and <Link href="/courses/dsa/modules/shortest-path" className="text-sky-600 hover:underline">Shortest path &amp; topological sort</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Graph representations table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Graph representations</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Two ways to store a graph. The default is adjacency list. The matrix wins in three specific cases.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Representation</th>
                <th className="px-4 py-3 font-semibold">Space</th>
                <th className="px-4 py-3 font-semibold">Edge lookup (u,v)</th>
                <th className="px-4 py-3 font-semibold">Iterate neighbors(v)</th>
                <th className="px-4 py-3 font-semibold">When to pick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Adjacency list</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(V + E)</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(degree(u))</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(degree(v))</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default. Sparse graphs (real-world social, web, dependencies). 90% of LeetCode.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Adjacency matrix</td>
                <td className="px-4 py-3 font-mono text-rose-600">O(V²)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(V)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Dense graphs (E ≈ V²), Floyd-Warshall, tiny V (≤ 100), or many random has-edge queries.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Implicit grid</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(R·C)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) via deltas</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(4) or O(8)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">2D grid problems (Number of Islands, Flood Fill). The grid IS the adjacency — never build a separate one.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight" title="The V and E heuristic">
          When you see <code>O(V + E)</code>, that&apos;s &quot;linear in the graph size&quot; — BFS and DFS hit it. <code>O((V + E) log V)</code> is Dijkstra with a binary heap. <code>O(V·E)</code> is Bellman-Ford. <code>O(V³)</code> is Floyd-Warshall. Memorize these four; every Phase 4 algorithm lands on one of them.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/graphs-intro" className="text-sky-600 hover:underline">Module 17 — Graphs intro</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — BFS vs DFS decision */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. BFS vs DFS — when each one is right</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Same template, different data structure. Queue → BFS (nearest first). Stack → DFS (deepest first). The choice is dictated by what the problem actually asks.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-sky-200 dark:border-sky-900 p-5 bg-sky-50/40 dark:bg-sky-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">BFS · queue · nearest first</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Reach for BFS when the problem says <strong>shortest</strong>, <strong>minimum number of steps</strong>, <strong>fewest moves</strong>, or asks about <strong>levels</strong> from a source.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-3">
              <li>Shortest path on unweighted graphs</li>
              <li>Level-by-level expansion (Rotting Oranges)</li>
              <li>Word ladder, fewest transformations</li>
              <li>Bipartite check (two-color in layers)</li>
              <li>Kahn&apos;s topological sort</li>
            </ul>
            <CodeBlock lang="java">{`Deque<Integer> queue = new ArrayDeque<>();
boolean[] visited = new boolean[n];
queue.offer(start);
visited[start] = true;          // mark on ENQUEUE
while (!queue.isEmpty()) {
    int cur = queue.poll();      // FIFO
    for (int nb : adj.get(cur)) {
        if (!visited[nb]) {
            visited[nb] = true;
            queue.offer(nb);
        }
    }
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">DFS · stack/recursion · deepest first</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Reach for DFS when the problem is about <strong>connectivity</strong>, <strong>cycles</strong>, <strong>topological order</strong>, or <strong>backtracking</strong> over an implicit tree of states.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-3">
              <li>Connected components (Number of Islands)</li>
              <li>Cycle detection (3-color directed)</li>
              <li>Topological sort via post-order</li>
              <li>Flood fill</li>
              <li>Backtracking (permutations, N-Queens)</li>
            </ul>
            <CodeBlock lang="java">{`void dfs(int u) {
    visited[u] = true;
    // pre-order work here
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v);
    }
    // post-order work here
}`}</CodeBlock>
          </div>
        </div>

        <Callout variant="insight" title="The one-sentence test">
          If the question contains the word <strong>shortest</strong>, <strong>minimum</strong>, or <strong>fewest</strong> — BFS. Otherwise — connectivity, &quot;is there a path&quot;, &quot;count components&quot;, &quot;detect a cycle&quot; — DFS is usually simpler. Both are <code>O(V + E)</code> time.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/bfs-dfs" className="text-sky-600 hover:underline">Module 18 — BFS &amp; DFS</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Iterative vs recursive DFS */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. Iterative DFS vs recursive DFS</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Recursive DFS is shorter and the default. Iterative DFS is the safety net when the graph can be deep enough to blow the JVM stack.
        </p>

        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5 mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">BAD — recursive DFS on a skewed/long graph</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            On a chain of 10⁶ nodes (linked-list-shaped graph, or a path graph), recursive DFS will <code>StackOverflowError</code> long before it finishes. The JVM thread stack is ~512KB–1MB; each frame is ~50–100 bytes; you blow it around depth 5,000–10,000.
          </p>
          <CodeBlock lang="java">{`// RISKY — depth = longest path in the graph
void dfs(int u) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v);   // recurses until JVM stack runs out
    }
}`}</CodeBlock>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">GOOD — explicit Deque on the heap</div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
            The heap is gigabytes, not kilobytes. An explicit <code>ArrayDeque</code> handles graphs that would crash a recursive version. Same visit set, same complexity, different memory region.
          </p>
          <CodeBlock lang="java">{`void dfsIterative(int start) {
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (visited[u]) continue;     // mark-on-pop is fine for DFS
        visited[u] = true;
        for (int v : adj.get(u)) {
            if (!visited[v]) stack.push(v);
        }
    }
}`}</CodeBlock>
        </div>

        <Callout variant="warn" title="Visit order isn't identical">
          Recursive DFS visits children in the order they appear in <code>adj.get(u)</code>. Iterative DFS visits them in <em>reverse</em> order (last-pushed comes off first). If the problem expects a specific output order, push children in reverse to match recursion. Not a correctness issue for connectivity / cycle / topo — only for problems that grade by exact sequence.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/bfs-dfs" className="text-sky-600 hover:underline">Module 18 — BFS &amp; DFS</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Shortest path family */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. The shortest-path family</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Four algorithms. The right one is dictated by two questions: <strong>are edges weighted?</strong> and <strong>can weights be negative?</strong>
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 font-semibold">Edge weights</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Space</th>
                <th className="px-4 py-3 font-semibold">When to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">BFS</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Unweighted (or all equal)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(V + E)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Grid mazes, word ladder, knight moves — any &quot;fewest edges&quot; question.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Dijkstra</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Non-negative only</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O((V + E) log V)</td>
                <td className="px-4 py-3 font-mono">O(V + E)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Road networks, latency graphs, Network Delay Time. Default for weighted single-source.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Bellman-Ford</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Negative OK · no negative cycle</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(V·E)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Currency arbitrage, rebates, any graph with truly negative weights. V-th pass detects negative cycles.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Floyd-Warshall</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Any (handles negatives)</td>
                <td className="px-4 py-3 font-mono text-rose-600">O(V³)</td>
                <td className="px-4 py-3 font-mono">O(V²)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">All-pairs shortest path. Small dense graphs (V ≤ 500). Three nested loops, an adjacency matrix.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-2">Dijkstra in one block — the version you should be able to type from memory</h3>
        <CodeBlock lang="java" caption="Dijkstra with lazy deletion via the staleness check">{`public int[] dijkstra(int n, List<List<int[]>> adj, int source) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, source});

    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;       // stale entry — lazy deletion

        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.offer(new int[]{d + w, v});
            }
        }
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="warn" title="Negative weights silently break Dijkstra">
          No crash, no exception — just incorrect distances. Once a node is finalized, Dijkstra never reconsiders it; a negative edge from a later node could have lowered its true distance but Dijkstra refuses to look back. Use Bellman-Ford when weights can be negative.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/shortest-path" className="text-sky-600 hover:underline">Module 19 — Shortest path</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Topological sort */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Topological sort — Kahn&apos;s vs DFS post-order</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Two ways to linearize a DAG so every edge u→v has u before v. Cycle detection comes free with either one — if topo sort fails, you have a cycle.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={dagChart} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Valid topological orderings of this DAG: <code>[A, B, C, D, E]</code> and <code>[A, C, B, D, E]</code> — B and C are independent siblings, either may come first.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Kahn&apos;s · BFS over in-degrees</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Iterative. Compute in-degrees, enqueue all in-degree-0 nodes, pop and decrement neighbors&apos; in-degrees, enqueue when they hit 0. If fewer than V nodes get processed, there&apos;s a cycle.
            </p>
            <CodeBlock lang="java">{`int[] inDegree = new int[n];
for (int u = 0; u < n; u++)
    for (int v : adj.get(u)) inDegree[v]++;

Deque<Integer> queue = new ArrayDeque<>();
for (int i = 0; i < n; i++)
    if (inDegree[i] == 0) queue.offer(i);

int[] order = new int[n];
int idx = 0;
while (!queue.isEmpty()) {
    int u = queue.poll();
    order[idx++] = u;
    for (int v : adj.get(u)) {
        if (--inDegree[v] == 0) queue.offer(v);
    }
}
if (idx != n) { /* CYCLE */ }`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">DFS post-order · push when done, reverse</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Recursive. Append each node in post-order (after all its descendants have been processed), then reverse. The 3-color WHITE/GRAY/BLACK variant additionally detects cycles via back-edges to GRAY.
            </p>
            <CodeBlock lang="java">{`List<Integer> order = new ArrayList<>();

void topo(int u) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) topo(v);
    }
    order.add(u);          // POST-ORDER
}

// After running from every unvisited node:
Collections.reverse(order);`}</CodeBlock>
          </div>
        </div>

        <Callout variant="insight" title="Kahn&apos;s detects cycles for free">
          A node never has its in-degree reach 0 if it&apos;s part of a cycle (the cycle&apos;s edges keep contributing). So the &quot;processed fewer than V&quot; check is a perfect cycle detector — no extra bookkeeping, no recursion stack. This is why Kahn&apos;s is the more popular choice in practice for &quot;Course Schedule&quot;-style problems.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/shortest-path" className="text-sky-600 hover:underline">Module 19 — Topological sort</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — The 5 named patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. The 5 named patterns from Phase 4</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each card has the <strong>tell</strong> — the phrase in the problem statement that should make the pattern fire in your head.
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Pattern 1 · Flood fill (DFS on a grid)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>The tell:</strong> &quot;count the islands / regions / connected groups&quot; on a 2D grid. Outer scan finds component starts; inner DFS marks all cells.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canonical: <strong>LC 200 · Number of Islands</strong>. Mutate the grid as the visited marker for O(1) space.</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Pattern 2 · Level-by-level BFS (multi-source)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>The tell:</strong> &quot;how many minutes / steps until [thing] spreads everywhere?&quot; Seed the queue with <em>every</em> initial source at level 0, freeze <code>queue.size()</code> at the top of each level, increment a counter per level.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canonical: <strong>LC 994 · Rotting Oranges</strong>, <strong>LC 542 · 01 Matrix</strong>, <strong>LC 286 · Walls and Gates</strong>.</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Pattern 3 · Bidirectional BFS</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>The tell:</strong> &quot;shortest transformation from A to B&quot; on a huge but sparse graph (word ladder). Run BFS from <em>both ends</em>, expand the smaller frontier each round, stop when they meet. Cuts the search from O(b^d) to O(2·b^(d/2)).
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canonical: <strong>LC 127 · Word Ladder</strong>. Plain BFS works; bidirectional is the optimization the interviewer wants to hear.</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Pattern 4 · Dijkstra with PriorityQueue</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>The tell:</strong> weighted edges, non-negative, &quot;shortest&quot; or &quot;cheapest&quot; or &quot;minimum time&quot;. Min-heap of <code>(dist, node)</code>, lazy deletion via the staleness check <code>if (d &gt; dist[u]) continue;</code>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canonical: <strong>LC 743 · Network Delay Time</strong>, <strong>LC 787 · Cheapest Flights Within K Stops</strong>, <strong>LC 1631 · Path With Minimum Effort</strong>.</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Pattern 5 · Course schedule (topological sort)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>The tell:</strong> &quot;can you finish?&quot;, &quot;in what order?&quot;, &quot;build before&quot;, &quot;prereqs&quot;. Kahn&apos;s BFS over in-degrees — boolean version returns <code>processed == n</code>; ordering version returns the array.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Canonical: <strong>LC 207 · Course Schedule</strong>, <strong>LC 210 · Course Schedule II</strong>, <strong>LC 269 · Alien Dictionary</strong>.</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Five gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost real engineers real hours — and silently passes some test cases while failing others. The most painful kind of bug.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Forgetting <code>visited[]</code> on a graph with cycles</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Trees have no cycles, so a missing <code>visited[]</code> still terminates. Graphs do — and BFS/DFS on a cyclic graph without a visited set loops forever (or until the queue/stack exhausts memory).
            </p>
            <CodeBlock lang="java">{`// BAD — infinite loop on any cycle
void dfs(int u) {
    for (int v : adj.get(u)) dfs(v);   // A → B → A → B → ...
}

// GOOD — mark and skip
void dfs(int u) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v);
    }
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Using DFS for shortest path on an unweighted graph</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              DFS finds <em>a</em> path. It doesn&apos;t find the <em>shortest</em> one — it can dive deep into the wrong branch and return a 50-edge path when a 3-edge path exists. For unweighted shortest path, always BFS.
            </p>
            <CodeBlock lang="java">{`// BAD — DFS reports "first path found", not shortest
int dfsShortest(int u, int target) {
    if (u == target) return 0;
    visited[u] = true;
    for (int v : adj.get(u))
        if (!visited[v]) return 1 + dfsShortest(v, target);  // wrong!
    return -1;
}

// GOOD — BFS guarantees shortest on unweighted
int bfsShortest(int start, int target) {
    int[] dist = new int[n];
    Arrays.fill(dist, -1);
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(start); dist[start] = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        if (u == target) return dist[u];
        for (int v : adj.get(u))
            if (dist[v] == -1) { dist[v] = dist[u] + 1; q.offer(v); }
    }
    return -1;
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Dijkstra on a graph with negative weights</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              No crash. No exception. Dijkstra silently returns wrong distances because it finalizes nodes greedily; a later negative edge could have lowered a finalized node&apos;s true distance, but Dijkstra refuses to look back.
            </p>
            <CodeBlock lang="java">{`// BAD — wrong distances on graphs with negative edges (e.g., FX rebates)
public int[] dijkstra(int n, List<List<int[]>> adj, int source) {
    // ... standard Dijkstra ...
    // returns garbage if any edge weight is negative
}

// GOOD — Bellman-Ford handles negatives, detects negative cycles
for (int i = 0; i < n - 1; i++) {
    for (int[] e : edges) {
        if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) {
            dist[e[1]] = dist[e[0]] + e[2];
        }
    }
}
// V-th pass: any further improvement = negative cycle reachable from source`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Not handling disconnected components</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              A single BFS/DFS from node 0 only covers node 0&apos;s component. If the graph has islands, the other components never get visited — your &quot;count cycles&quot; or &quot;detect bipartite&quot; check silently misses half the graph.
            </p>
            <CodeBlock lang="java">{`// BAD — only checks one component
boolean isBipartite(List<List<Integer>> adj) {
    return bipartiteFrom(0);   // misses everything not reachable from 0
}

// GOOD — outer loop over every unvisited node
boolean isBipartite(List<List<Integer>> adj) {
    int n = adj.size();
    int[] color = new int[n];
    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && !bipartiteFrom(i, color, adj)) return false;
    }
    return true;
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Forgetting the undirected double-add</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              &quot;The graph is undirected&quot; means each edge goes both ways. If you add the edge only once, you&apos;ve built a directed graph by accident — BFS from u finds v, but BFS from v doesn&apos;t find u. No NullPointer, no compile error, just silently wrong answers.
            </p>
            <CodeBlock lang="java">{`// BAD — built a directed graph from an undirected input
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);   // only one direction
}

// GOOD — add both directions for undirected
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    adj.get(e[1]).add(e[0]);
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You need to find the shortest path from A to B in an unweighted directed graph. Which traversal, and why?"
          options={[
            { label: "DFS — it explores deeper faster.", explanation: "DFS finds a path but not the shortest one — it can dive into the wrong branch and return arbitrarily long paths. Wrong tool for shortest." },
            { label: "BFS — it visits nodes in order of edge-distance from the source, so the first time you reach B you&apos;ve used the fewest possible edges.", correct: true, explanation: "Right. BFS&apos;s level-order property is exactly the shortest-path guarantee on unweighted graphs. The moment B is dequeued (or first encountered, depending on how you check), you have the minimum edge count." },
            { label: "Dijkstra — it&apos;s the general shortest-path algorithm.", explanation: "Dijkstra works but is overkill on unweighted graphs. BFS is simpler (no heap), runs in O(V + E) instead of O((V + E) log V), and gives the same answer." },
            { label: "Either, they give the same answer.", explanation: "DFS does NOT give shortest path. It gives some path. Different question, different answer." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Dijkstra&apos;s `if (d > dist[u]) continue;` line: what is it doing?"
          options={[
            { label: "Detecting negative cycles.", explanation: "Dijkstra doesn&apos;t detect or handle negative cycles — that&apos;s Bellman-Ford. The check serves a different purpose." },
            { label: "Skipping stale heap entries — copies of u with a worse distance than the current best, left over from before u&apos;s distance was lowered.", correct: true, explanation: "Right. Java&apos;s PriorityQueue has no decrease-key, so when we find a shorter path to u we just offer a new entry. The old entry stays in the heap and gets filtered at poll time by this check. Lazy deletion." },
            { label: "Guarding against negative weights.", explanation: "It doesn&apos;t — negative weights break Dijkstra regardless. The check is unrelated to weight signs." },
            { label: "Ensuring the algorithm terminates.", explanation: "Termination is guaranteed because each node finalizes at most once. The check is about correctness and efficiency on stale duplicates." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Kahn&apos;s algorithm finishes with `processed = 6` on a graph with 9 nodes. What does that mean?"
          options={[
            { label: "The graph is disconnected.", explanation: "Disconnected acyclic components are processed normally — each has its own in-degree-0 starts. The shortfall means cycle, not disconnection." },
            { label: "Three nodes are part of a cycle (or only reachable through one), so their in-degree never reached 0.", correct: true, explanation: "Right. A cycle&apos;s nodes contribute in-edges to each other that prevent any of them from reaching in-degree 0. None of them are ever enqueued, so they never get processed. The `processed < V` check is Kahn&apos;s built-in cycle detector." },
            { label: "There are 3 strongly connected components.", explanation: "Kahn&apos;s doesn&apos;t count SCCs; it counts how many nodes had their in-degree drop to 0 in topological order." },
            { label: "Three nodes are unreachable from any source.", explanation: "Kahn&apos;s processes the whole graph, not from a single source. Unreachable isn&apos;t the right framing — cyclic involvement is." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="In a directed graph, why does a single boolean[] visited fail to detect cycles correctly?"
          options={[
            { label: "It doesn&apos;t fail — visited[] is sufficient for any cycle detection.", explanation: "It is not. In a directed graph, you can re-encounter an already-visited node via a different DFS branch when there is NO cycle (diamond DAGs do this). visited[] can&apos;t distinguish &apos;on the current path&apos; from &apos;finished long ago.&apos;" },
            { label: "Because visited[] conflates &apos;currently on the recursion stack&apos; with &apos;already finished&apos;. The 3-color WHITE/GRAY/BLACK scheme captures the on-the-stack state needed to identify a back edge.", correct: true, explanation: "Right. A directed cycle is exactly an edge back to a node on the current root-to-leaf path. GRAY marks &apos;on the current path&apos;, BLACK marks &apos;fully done&apos;. visited[] alone can&apos;t tell them apart, so it reports false positives on diamond shapes." },
            { label: "It only works for connected graphs.", explanation: "Connectivity isn&apos;t the issue. The issue is distinguishing currently-being-explored from already-finished." },
            { label: "Java&apos;s boolean[] doesn&apos;t support three states.", explanation: "You&apos;d use int[] with 0/1/2 for the three colors. The issue is conceptual, not language-level." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A weighted directed graph has some edges with negative weights (e.g., currency rebates). Your colleague is using Dijkstra. What&apos;s the failure mode?"
          options={[
            { label: "It throws an exception when it sees a negative weight.", explanation: "It does not. Java&apos;s PriorityQueue accepts any int. The bug is silent." },
            { label: "It runs forever on the negative edges.", explanation: "Dijkstra terminates because each node is finalized at most once. It just gives wrong answers." },
            { label: "It silently returns wrong distances — once a node is finalized at its current tentative distance, Dijkstra never reconsiders it, but a later negative edge could have lowered its true distance.", correct: true, explanation: "Right. This is the failure mode that bites people in production: no crash, no warning, just incorrect numbers. The fix is Bellman-Ford (O(V·E), handles negatives, detects negative cycles via a V-th pass)." },
            { label: "It works correctly — Dijkstra handles negatives fine.", explanation: "It does not. The non-negative-weights precondition is hard. Use Bellman-Ford when weights can be negative." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 via-white to-sky-50 dark:from-cyan-950/30 dark:via-slate-900 dark:to-sky-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 mb-2">
          Phase 4 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now read a graph problem and pick the algorithm in seconds</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Adjacency list by default, matrix in the three specific cases. BFS for shortest/level/fewest, DFS for connectivity/cycle/topo. Dijkstra for non-negative weighted; Bellman-Ford when negatives appear; Kahn&apos;s for dependencies. The five named patterns — flood fill, level BFS, bidirectional BFS, Dijkstra with PriorityQueue, topo-sort schedule — cover most of the LeetCode graph surface.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 5 — Java Collections in depth.</strong> Every container you&apos;ve been using — ArrayList, HashMap, TreeMap, ArrayDeque, PriorityQueue — gets the deep treatment. When to pick which, what the JDK is actually doing under the hood, and the decision framework that ties Phases 2-4 together.
        </p>
        <Link
          href="/courses/dsa/modules/java-collections"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Java Collections in Depth →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-4-revision" />
    </article>
  );
}
