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
  { id: "weighted", title: "Weighted graphs — and why BFS isn't enough" },
  { id: "dijkstra", title: "Dijkstra's algorithm" },
  { id: "topo", title: "Topological sort — Kahn's algorithm" },
  { id: "limits", title: "Where Dijkstra fails — negative weights" },
  { id: "project", title: "Project: Course Schedule I & II + Network Delay Time" },
  { id: "final", title: "Final quiz" },
];

export default function ShortestPathModule() {
  const mod = getModuleBySlug("shortest-path")!;

  // Dijkstra's expansion order
  const dijkstra = `
flowchart LR
    A((A · 0)) -->|"4"| B((B · 3))
    A -->|"1"| C((C · 1))
    C -->|"2"| B
    C -->|"5"| D((D · 4))
    B -->|"1"| D
    B -->|"3"| E((E · 6))
    D -->|"2"| E
    style A fill:#0ea5e9,color:#fff,stroke:#0284c7
    style C fill:#38bdf8,color:#000
    style B fill:#7dd3fc,color:#000
    style D fill:#7dd3fc,color:#000
    style E fill:#bae6fd,color:#000
  `.trim();

  // Kahn's BFS — in-degree drops
  const kahn = `
flowchart LR
    subgraph K0["Initial in-degrees"]
        direction TB
        K0A["A: 0 ← source"]
        K0B["B: 1"]
        K0C["C: 1"]
        K0D["D: 2"]
    end
    subgraph K1["Step 1 · process A; B,C drop to 0"]
        direction TB
        K1A["A: ✓"]
        K1B["B: 0 ← queue"]
        K1C["C: 0 ← queue"]
        K1D["D: 2"]
    end
    subgraph K2["Step 2 · process B,C; D drops to 0"]
        direction TB
        K2A["A: ✓"]
        K2B["B: ✓"]
        K2C["C: ✓"]
        K2D["D: 0 ← queue"]
    end
    subgraph K3["Step 3 · process D · order: A, B, C, D"]
        direction TB
        K3A["A: ✓"]
        K3B["B: ✓"]
        K3C["C: ✓"]
        K3D["D: ✓"]
    end
    K0 --> K1 --> K2 --> K3
    style K0 fill:#0c4a6e,color:#fff
    style K1 fill:#075985,color:#fff
    style K2 fill:#0369a1,color:#fff
    style K3 fill:#0284c7,color:#fff
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="shortest-path" />
      <ModuleProgress moduleSlug="shortest-path" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 4 · Module 16 · Closeout
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · ends with Phase 4 wrap-up</p>
      </div>

      {/* ───────────────── Part 1 · Weighted ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="weighted" title="I know why BFS breaks on weighted graphs" xp={20}>
      <section>
        <h2 id="weighted">Weighted graphs — and why BFS isn&apos;t enough</h2>

        <p>
          Until now, every edge has had the same cost. Find the path with the fewest edges? BFS, done. But real graphs
          have <strong>weights</strong>: distances between cities, latencies between servers, costs between currency
          pairs. The right answer minimizes the <em>sum of weights</em>, not the count of edges. BFS doesn&apos;t
          care about weights — and that&apos;s exactly why it fails.
        </p>

        <h3>The counterexample</h3>

        <p>Consider this graph. We want the shortest path from A to B.</p>

        <CodeBlock lang="plain">{`Top path:    A ─1─ X ─1─ X ─1─ X ─1─ B    (4 edges, total weight 4)
Bottom path: A ───────── 100 ────────── B    (1 edge,  total weight 100)`}</CodeBlock>

        <p>
          BFS reaches B via the bottom edge in <em>one</em>{" "}step and reports &quot;distance 1.&quot; In edge count
          that&apos;s correct — but the actual path cost is 100, while the 4-edge top path costs only 4. BFS counts
          edges; the question wants total weight. Different optimization, different answer.
        </p>

        <Callout variant="insight" title="When BFS still works on weighted graphs">
          If <em>all weights are equal</em> (every edge costs 5, say), BFS gives the right answer scaled — fewest
          edges times 5. If weights are 0 or 1 only, a variant called <em>0-1 BFS</em> (using a deque, pushing 0-edges
          to the front and 1-edges to the back) works in O(V + E). For arbitrary positive weights, you need Dijkstra.
        </Callout>

        <h3>The fix: process by accumulated weight, not by edge count</h3>

        <p>
          BFS processes nodes in FIFO order, which corresponds to breadth in unweighted graphs. The fix is to process
          them in order of <em>accumulated distance from the source</em>. The data structure that gives you &quot;always
          extract the smallest&quot; is a min-heap — which you saw in Module 13. Plug a min-heap into the BFS template,
          ordering by distance, and you have <strong>Dijkstra&apos;s algorithm</strong>.
        </p>

        <CodeBlock lang="plain">{`BFS:       FIFO queue        →   process by edge count
Dijkstra:  min-heap          →   process by accumulated weight`}</CodeBlock>

        <p>
          That&apos;s the entire conceptual leap. The rest is bookkeeping.
        </p>

        <Quiz
          kind="Quick check"
          question="Why doesn't plain BFS give correct shortest paths on a weighted graph?"
          options={[
            { label: "BFS only works on directed graphs.", explanation: "BFS works on both directed and undirected graphs. The issue is weighted vs unweighted." },
            { label: "BFS counts edges, not weights — so a 1-edge path of weight 100 looks shorter than a 4-edge path of weight 4.", correct: true, explanation: "Right. BFS's ordering invariant is 'fewest edges from start.' On weighted graphs, that's a different question from 'minimum total weight,' and the two answers can disagree wildly. Dijkstra orders by weight instead." },
            { label: "BFS doesn't terminate on cycles.", explanation: "Marked BFS terminates fine on cycles. The issue is not termination, it's correctness on weighted edges." },
            { label: "BFS only finds paths, not distances.", explanation: "BFS naturally tracks distances (in edge count). The issue is the question being asked has changed — weight vs edge count." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Dijkstra ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="dijkstra" title="I can implement Dijkstra from scratch" xp={30}>
      <section>
        <h2 id="dijkstra">Dijkstra&apos;s algorithm</h2>

        <p>
          Dijkstra (1959, by Edsger Dijkstra — designed in about 20 minutes over coffee, by his own account) finds
          shortest paths from a single source to every other node in a weighted graph with <em>non-negative</em>{" "}
          weights. It&apos;s BFS with a heap.
        </p>

        <Mermaid chart={dijkstra} />

        <h3>The invariant</h3>

        <p>
          At every step, Dijkstra picks the unvisited node with the smallest <em>tentative distance</em>{" "}from the
          source and &quot;finalizes&quot; it — that distance is now known to be optimal. Then it relaxes all of that
          node&apos;s outgoing edges: for each neighbor, check whether going through the just-finalized node gives a
          shorter route, and if so, update the neighbor&apos;s tentative distance.
        </p>

        <h3>The code</h3>

        <CodeBlock lang="java">{`public int[] dijkstra(int n, List<List<int[]>> adj, int source) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;

    // Min-heap of (distanceFromSource, node), ordered by distance
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, source});

    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];

        // Lazy deletion: a stale entry whose distance is no longer the shortest. Skip.
        if (d > dist[u]) continue;

        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            int newDist = d + w;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                pq.offer(new int[]{newDist, v});
            }
        }
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="insight" title="Lazy deletion is the trick that makes this fast">
          Java&apos;s PriorityQueue has no decrease-key operation. When we find a shorter path to v, we&apos;d like to
          update v&apos;s priority in the heap. Instead, we just <code>offer</code> a new entry with the better
          distance. The heap now contains v twice — old and new. The <code>if (d &gt; dist[u]) continue;</code> at
          poll time silently discards the stale copy. Total heap operations: O(E log V) — that extra log V is the
          tradeoff for not having a real decrease-key.
        </Callout>

        <h3>Walking through the example</h3>

        <p>
          On the graph in the diagram (A=0, edges A→B=4, A→C=1, C→B=2, C→D=5, B→D=1, B→E=3, D→E=2):
        </p>

        <CodeBlock lang="plain">{`Step 0:  dist = [0, ∞, ∞, ∞, ∞]              heap = [(0,A)]
Step 1:  pop (0,A). Relax A→B=4, A→C=1.       dist = [0, 4, 1, ∞, ∞]   heap = [(1,C),(4,B)]
Step 2:  pop (1,C). Relax C→B (1+2=3 < 4 ✓),
         C→D (1+5=6 < ∞ ✓).                   dist = [0, 3, 1, 6, ∞]   heap = [(3,B),(4,B),(6,D)]
Step 3:  pop (3,B). Relax B→D (3+1=4 < 6 ✓),
         B→E (3+3=6 < ∞ ✓).                   dist = [0, 3, 1, 4, 6]   heap = [(4,B),(4,D),(6,D),(6,E)]
Step 4:  pop (4,B). Stale (4 > dist[B]=3). Skip.
Step 5:  pop (4,D). Relax D→E (4+2=6, not <). dist = [0, 3, 1, 4, 6]
Step 6:  pop (6,D). Stale.
Step 7:  pop (6,E). Done. Final: [0, 3, 1, 4, 6]`}</CodeBlock>

        <p>
          Note the stale entries at steps 4 and 6 — those are the &quot;extra&quot; copies created when we found
          shorter paths to B and D. The lazy-deletion check skips them in O(1).
        </p>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Time:</strong> <code>O((V + E) log V)</code> with a binary heap. Each edge can cause at most one heap push, and each push/pop is log V.</li>
          <li><strong>Space:</strong> <code>O(V)</code> for <code>dist[]</code> + <code>O(E)</code> worst-case in the heap (because of lazy duplicates).</li>
        </ul>

        <Callout variant="warn" title="Dijkstra requires non-negative edge weights">
          With negative edges, the invariant breaks: a finalized node&apos;s distance might still be reduced by a
          later negative edge. The algorithm silently produces wrong answers. For graphs with negative edges (but no
          negative cycles), use <strong>Bellman-Ford</strong> — slower at <code>O(V·E)</code> but correct. We&apos;ll
          touch on it in the next section.
        </Callout>

        <Quiz
          kind="Dijkstra check"
          question="Why does the line `if (d > dist[u]) continue;` matter for correctness AND performance?"
          options={[
            { label: "Correctness only — performance is unaffected.", explanation: "It matters for both. Without it, you'd re-relax edges from u multiple times, doing wasted work." },
            { label: "Performance only — without it, you'd still get the right answer eventually.", explanation: "You'd get the right answer, but you'd waste time re-relaxing. The check skips work that's already been done correctly." },
            { label: "It skips stale heap entries — copies of u with a worse distance than the current best, left over from before u's distance was lowered.", correct: true, explanation: "Right. Lazy deletion creates duplicates in the heap. Without this skip, you'd process u again at the worse distance, then relax all its edges — wasted work, and in some implementations a correctness bug. The skip restores BOTH correctness (no spurious updates) AND performance." },
            { label: "It guards against negative weights.", explanation: "It doesn't — negative weights break Dijkstra regardless. The skip handles a different concern: stale heap entries from lazy deletion." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Topological sort ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="topo" title="I can topo-sort with Kahn's, and detect cycles for free" xp={25}>
      <section>
        <h2 id="topo">Topological sort — Kahn&apos;s algorithm</h2>

        <p>
          A <strong>topological sort</strong>{" "}is a linear ordering of a DAG&apos;s nodes such that every edge u→v has
          u before v in the ordering. Concretely: build order, course prerequisites, task dependencies, spreadsheet
          recalculation order. If the graph has a cycle, no topo order exists — and a good algorithm tells you so.
        </p>

        <h3>Kahn&apos;s algorithm — BFS over in-degrees</h3>

        <p>
          The DFS post-order version exists (you saw it last module), but <strong>Kahn&apos;s algorithm</strong>{" "}is
          usually more popular in practice because it&apos;s iterative (no recursion-depth issues) and naturally
          detects cycles. The idea:
        </p>

        <ol>
          <li>Compute the in-degree of every node.</li>
          <li>Enqueue every node with in-degree 0 (no dependencies — these can come first).</li>
          <li>Pop a node, append it to the output. For each of its neighbors, decrement their in-degree; if a neighbor&apos;s in-degree drops to 0, enqueue it.</li>
          <li>Repeat. If the output has fewer than V nodes when done, there&apos;s a cycle.</li>
        </ol>

        <Mermaid chart={kahn} />

        <CodeBlock lang="java">{`public int[] topoSort(int n, List<List<Integer>> adj) {
    int[] inDegree = new int[n];
    for (int u = 0; u < n; u++) {
        for (int v : adj.get(u)) inDegree[v]++;
    }

    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }

    int[] order = new int[n];
    int idx = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        order[idx++] = u;
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) queue.offer(v);
        }
    }

    if (idx != n) return null;       // cycle detected — fewer than n nodes processed
    return order;
}`}</CodeBlock>

        <Callout variant="insight" title="Kahn's elegance: cycle detection is free">
          A node never has its in-degree reach 0 if it&apos;s part of a cycle (the cycle itself contributes incoming
          edges that never decrement to 0). So the &quot;processed fewer than V&quot; check is a perfect cycle
          detector. No extra bookkeeping. Compare with DFS-based detection, which needs the WHITE/GRAY/BLACK
          machinery — Kahn does the same job with one counter.
        </Callout>

        <h3>Why it&apos;s BFS, not DFS</h3>

        <p>
          Kahn processes nodes in &quot;layers&quot; of the dependency graph: first everything with no prerequisites,
          then everything whose prerequisites are now satisfied, etc. That&apos;s the BFS shape — the queue holds the
          frontier of newly-ready nodes. The choice of FIFO vs LIFO doesn&apos;t affect correctness (any valid topo
          order is fine), but FIFO gives a predictable left-to-right level expansion that matches how humans think
          about &quot;what can I do now.&quot;
        </p>

        <h3>Complexity</h3>

        <p>
          <strong>Time:</strong>{" "}O(V + E). Building in-degrees is O(V + E); the BFS itself does O(V) pops and O(E)
          decrements. <strong>Space:</strong>{" "}O(V) for the in-degree array, queue, and output.
        </p>

        <Quiz
          kind="Topo check"
          question="If Kahn's algorithm finishes with `idx == 5` on a graph with 8 nodes, what does that mean?"
          options={[
            { label: "Bug — Kahn's should always output all V nodes.", explanation: "It would, on a DAG. Outputting fewer than V is the algorithm's intended way to flag a problem." },
            { label: "Three nodes were unreachable from the source.", explanation: "Kahn's doesn't take a single source — it processes the whole graph. 'Unreachable' isn't the right framing here." },
            { label: "Three nodes are stuck in a cycle (or downstream of one), so their in-degree never reached 0.", correct: true, explanation: "Right. A cycle's nodes contribute in-edges to each other that prevent any of them from reaching in-degree 0. So they're never enqueued, never processed, never output. The 'processed < V' check is the algorithm's cycle detector." },
            { label: "The graph is undirected.", explanation: "Topological sort only applies to directed graphs. On undirected, in-degree isn't even defined." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Limits ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="limits" title="I know when Dijkstra fails and what to reach for instead" xp={20}>
      <section>
        <h2 id="limits">Where Dijkstra fails — negative weights</h2>

        <p>
          Dijkstra is fast and elegant, but it has one hard requirement: <strong>no negative-weight edges</strong>.
          Violate it and you get silently wrong answers — not crashes, not warnings, just incorrect distances. This
          is worth understanding before you ever write Dijkstra in production code that could see negative numbers.
        </p>

        <h3>The counterexample</h3>

        <CodeBlock lang="plain">{`A → B (weight 1)
A → C (weight 4)
B → C (weight -10)

True shortest A to C: A→B→C = 1 + (-10) = -9.
Dijkstra's path: pops A (0), pops B (1), finalizes B. Pops C (4). DONE. Returns 4.
The B→C=-10 edge would have improved C's distance, but B is already finalized.`}</CodeBlock>

        <p>
          The bug is structural: Dijkstra trusts that once a node is finalized at its current tentative distance, no
          better route exists. With negative edges, a route through a not-yet-finalized node could improve a
          just-finalized one — and Dijkstra refuses to look back.
        </p>

        <h3>The remedy: Bellman-Ford</h3>

        <p>
          <strong>Bellman-Ford</strong>{" "}handles negative weights by being more pessimistic: it relaxes <em>every
          edge</em>, V−1 times. Each pass might improve some distances; after V−1 passes, all simple-path improvements
          are accounted for. A V-th pass that still finds an improvement signals a <strong>negative cycle</strong> —
          a cycle whose total weight is negative, which makes &quot;shortest path&quot; meaningless (you can keep
          going around to drive the distance lower).
        </p>

        <CodeBlock lang="java">{`// edges as (u, v, w)
public int[] bellmanFord(int n, int[][] edges, int source) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;

    for (int i = 0; i < n - 1; i++) {
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }
    // Optional: V-th pass to detect a negative cycle
    for (int[] e : edges) {
        if (dist[e[0]] != Integer.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) {
            // negative cycle reachable — return null or signal somehow
        }
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="info" title="Cost of correctness">
          Bellman-Ford is <code>O(V·E)</code>, vs Dijkstra&apos;s <code>O((V+E) log V)</code>. On dense graphs that&apos;s
          O(V³) vs O(V² log V) — substantially slower. Use Dijkstra when you can; reach for Bellman-Ford only when
          negative weights are real (currency arbitrage, certain physics simulations) or required by the problem.
        </Callout>

        <h3>The decision tree</h3>

        <CodeBlock lang="plain">{`Single-source shortest path?
├── Unweighted (or all-weights-equal)        → BFS, O(V + E)
├── Non-negative weights                     → Dijkstra, O((V+E) log V)
├── Negative weights, no negative cycle      → Bellman-Ford, O(V·E)
└── All-pairs shortest path on dense graph   → Floyd-Warshall, O(V³)
                                                (Phase 8 territory)`}</CodeBlock>

        <ClassifyChallenge
          title="Pick the algorithm"
          prompt="For each scenario, which algorithm is the right default?"
          buckets={[
            { id: "bfs", label: "BFS", color: "sky" },
            { id: "dijkstra", label: "Dijkstra", color: "indigo" },
            { id: "bellman", label: "Bellman-Ford", color: "rose" },
            { id: "kahn", label: "Kahn's (topo sort)", color: "emerald" },
          ]}
          items={[
            { id: "1", label: "Shortest path between two cells in a 4-directional grid maze.", answer: "bfs", explanation: "Unweighted (or uniformly weighted). BFS — simpler and faster than Dijkstra." },
            { id: "2", label: "Lowest-latency path between data centers, latencies in [1, 1000] ms.", answer: "dijkstra", explanation: "Weighted, all weights non-negative. Textbook Dijkstra." },
            { id: "3", label: "Order to take courses given prerequisite pairs.", answer: "kahn", explanation: "Dependency ordering — topological sort. Kahn's also flags cycles (impossible course schedule) for free." },
            { id: "4", label: "Cheapest currency-conversion path through an FX market where some 'fees' could be negative (rebates).", answer: "bellman", explanation: "Negative weights possible. Dijkstra would silently produce wrong answers. Bellman-Ford handles negatives and detects negative cycles (= arbitrage)." },
            { id: "5", label: "Number of moves in a chess-knight reachability problem on an 8×8 board.", answer: "bfs", explanation: "Each knight move costs '1 step.' Unweighted shortest path → BFS." },
            { id: "6", label: "Build a dependency-aware task runner: run task X only after its prereqs.", answer: "kahn", explanation: "Topological sort. Kahn's BFS gives a clean execution order, and detects circular dependencies as a bonus." },
            { id: "7", label: "Game pathfinding where some tiles add gold (modeled as negative-cost edges) and you want minimum net cost.", answer: "bellman", explanation: "Edges with truly negative cost (gold-on-pickup tiles → net spend goes down) break Dijkstra. Bellman-Ford handles them and detects negative cycles (an infinite-gold loop)." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="project" title="I solved Course Schedule I & II + Network Delay Time" xp={45} manual manualLabel="I submitted all three problems">
      <section>
        <h2 id="project">Project: Course Schedule I &amp; II + Network Delay Time</h2>

        <p>
          Three canonical problems, one for each algorithm. Together they cover the Phase 4 surface area:
          topological sort with cycle detection, then Dijkstra on a small weighted graph.
        </p>

        <h3>LC 207 · Course Schedule · Kahn&apos;s for cycle detection</h3>

        <p>
          Given <code>numCourses</code> and prerequisites <code>[a, b]</code> meaning &quot;to take a, you must first
          take b,&quot; can you finish all courses? This is exactly &quot;does this graph have a cycle?&quot; in
          disguise.
        </p>

        <CodeBlock lang="java">{`public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] inDegree = new int[numCourses];
    for (int[] p : prerequisites) {
        // [a, b] = "take b before a" → edge b → a
        adj.get(p[1]).add(p[0]);
        inDegree[p[0]]++;
    }

    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }

    int processed = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        processed++;
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) queue.offer(v);
        }
    }
    return processed == numCourses;
}`}</CodeBlock>

        <Callout variant="warn" title="The edge direction trap">
          The input <code>[a, b]</code> means &quot;a depends on b&quot; — to take a you need b. The edge in the
          dependency graph goes <em>from b to a</em>, not the other way. Get this backwards and the in-degrees are
          inverted; the algorithm runs and reports nonsense. Read the problem statement twice when edges have
          asymmetric meaning.
        </Callout>

        <h3>LC 210 · Course Schedule II · Same algorithm, return the order</h3>

        <p>Almost identical to LC 207, but instead of a boolean, return the actual completion order.</p>

        <CodeBlock lang="java">{`public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    int[] inDegree = new int[numCourses];
    for (int[] p : prerequisites) {
        adj.get(p[1]).add(p[0]);
        inDegree[p[0]]++;
    }

    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < numCourses; i++) {
        if (inDegree[i] == 0) queue.offer(i);
    }

    int[] order = new int[numCourses];
    int idx = 0;
    while (!queue.isEmpty()) {
        int u = queue.poll();
        order[idx++] = u;
        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) queue.offer(v);
        }
    }
    return idx == numCourses ? order : new int[0];
}`}</CodeBlock>

        <p>
          Notice how minor the change is: append to <code>order</code> as you go, return it (or empty on cycle). Once
          you have Kahn&apos;s in muscle memory, both LC 207 and 210 are 5-minute problems.
        </p>

        <h3>LC 743 · Network Delay Time · Dijkstra</h3>

        <p>
          A network of <code>n</code> nodes; <code>times[i] = [u, v, w]</code> means a signal from u takes w time to
          reach v. From source <code>k</code>, return the minimum time for all nodes to receive the signal — or -1 if
          some node is unreachable.
        </p>

        <p>
          The signal reaches every node at its shortest-path distance from <code>k</code>. The answer is the
          <em>maximum</em>{" "}of those shortest paths (the slowest one to receive). Pure Dijkstra.
        </p>

        <CodeBlock lang="java">{`public int networkDelayTime(int[][] times, int n, int k) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
    for (int[] t : times) {
        adj.get(t[0]).add(new int[]{t[1], t[2]});
    }

    int[] dist = new int[n + 1];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[k] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, k});

    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;
        for (int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.offer(new int[]{d + w, v});
            }
        }
    }

    int max = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == Integer.MAX_VALUE) return -1;
        max = Math.max(max, dist[i]);
    }
    return max;
}`}</CodeBlock>

        <Callout variant="info" title="Why the +1 in `new int[n + 1]`">
          LC 743 uses 1-indexed nodes (1..n), not 0-indexed. The arrays need n+1 slots so index n is valid. Read the
          problem&apos;s indexing convention before sizing arrays — this is a frequent off-by-one source.
        </Callout>

        <PartRecap
          title="Three problems, three algorithms"
          gist="Course Schedule I/II = Kahn's. Network Delay Time = Dijkstra. Together they cover the standard interview surface for Phase 4 — and make the algorithm choice transparent from the problem statement."
          points={[
            { takeaway: "When the problem is about ordering with dependencies, reach for Kahn's.", detail: "'Can you finish?' = is there a cycle? 'In what order?' = the topo order itself. Kahn's gives both with the same code." },
            { takeaway: "When the problem is about minimum cost on a non-negative weighted graph, reach for Dijkstra.", detail: "'Earliest signal arrival,' 'cheapest path,' 'minimum delay.' Min-heap of (dist, node), lazy deletion via the staleness check, relax outgoing edges." },
            { takeaway: "Watch the edge direction.", detail: "Course Schedule's [a, b] means 'edge b → a' (b is the prereq). Get the direction wrong and Kahn's runs but returns garbage. The reverse direction error is hard to spot from a passing-but-wrong run." },
            { takeaway: "Watch indexing conventions.", detail: "1-indexed (LC 743) vs 0-indexed (LC 207/210). Allocate the right array sizes. Off-by-ones in index ranges cause silent failures or AIOOBE under stress tests." },
            { takeaway: "Always think about unreachable nodes.", detail: "Network Delay Time: dist[i] == Integer.MAX_VALUE → return -1. In Dijkstra, the unreachable check is built into 'distance was never lowered.' Forgetting it is the most common LC 743 wrong-answer." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="shortest-path" id="final" title="I've completed Module 16 — and Phase 4!" xp={40} celebration="Graphs are no longer mysterious. Phase 5 — Java Collections in depth — sets up the rest of your interview toolkit.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="Why is Dijkstra's `if (d > dist[u]) continue;` line both correct AND fast?"
          options={[
            { label: "It implements lazy deletion of stale heap entries — when a shorter path to u was found later, the old entry is discarded in O(1) on pop.", correct: true, explanation: "Right. PriorityQueue has no decrease-key, so we offer a new (smaller-distance) entry instead of updating in place. The old entry sticks around in the heap and gets filtered out at pop time. The check is O(1), the alternative (real decrease-key) requires an indexed heap." },
            { label: "It detects negative cycles.", explanation: "It does not. Dijkstra doesn't detect or handle negative cycles — that's Bellman-Ford's job." },
            { label: "It's a Java optimization specific to PriorityQueue.", explanation: "It's an algorithmic technique that applies to any heap without decrease-key. Not Java-specific." },
            { label: "It guarantees termination.", explanation: "Termination is guaranteed because each node finalizes at most once. The check is about correctness and efficiency, not termination." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Kahn's algorithm finishes with `processed = 5` on a graph with 7 nodes. What can you conclude?"
          options={[
            { label: "The graph is disconnected.", explanation: "Disconnected components are processed normally if they're acyclic (each has its own in-degree-0 starts). The < V outcome specifically means cycle." },
            { label: "Two nodes were never enqueued because they're in a cycle (or downstream of one). Their in-degrees never reached 0.", correct: true, explanation: "Right. The only way a node fails to get processed in Kahn's is if its in-degree never hits 0. That happens exactly when it's part of a cycle, or every path to it crosses a cycle. The 'processed < V' check is Kahn's built-in cycle detector." },
            { label: "The graph has 5 strongly connected components.", explanation: "Kahn's count doesn't measure SCCs. It measures 'how many nodes had their in-degree drop to 0 in topological order.'" },
            { label: "Two nodes are unreachable from any source.", explanation: "Kahn's processes the entire graph, not from a single source. 'Unreachable' isn't the right framing; cyclic involvement is." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Your colleague's currency-arbitrage graph has edges with both positive and negative weights. They're using Dijkstra. What's the failure mode?"
          options={[
            { label: "It throws an exception when it sees a negative weight.", explanation: "It does not. Java's PriorityQueue happily accepts any int. The bug is silent." },
            { label: "It silently returns wrong distances — once a node is finalized, Dijkstra never reconsiders it, but a later negative edge could have lowered its distance.", correct: true, explanation: "Right. This is the failure mode that bites people in production. No crash, no warning — just incorrect numbers. The fix is to use Bellman-Ford (handles negatives, O(V·E)). For arbitrage detection specifically, you also want negative-cycle detection — Bellman-Ford gives that for free with one extra pass." },
            { label: "It runs forever on the negative cycle.", explanation: "Dijkstra terminates regardless because each node is finalized at most once. It just gives wrong answers. Bellman-Ford is the algorithm that detects negative cycles." },
            { label: "It works correctly — Dijkstra handles negatives fine.", explanation: "It does not. The non-negative-weights precondition is hard. Negative edges can route around finalized nodes that Dijkstra refuses to revisit." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="When the question is shortest path, you can pick the right algorithm in seconds: BFS for unweighted, Dijkstra for non-negative-weighted, Bellman-Ford for negative-weighted, Kahn's for ordering. Each has a one-paragraph implementation in your head."
          points={[
            { takeaway: "Match algorithm to graph in one read of the problem.", detail: "Unweighted shortest path → BFS. Weighted (non-negative) → Dijkstra. Negative weights or arbitrage → Bellman-Ford. 'Order' or 'sequence' words → topological sort." },
            { takeaway: "Dijkstra = BFS + min-heap, ordered by distance.", detail: "Same template as BFS, just with a PriorityQueue ordered by tentative distance. Lazy deletion (`if (d > dist[u]) continue;`) is the trick that makes it fast without a true decrease-key." },
            { takeaway: "Kahn's = BFS over in-degrees.", detail: "Enqueue in-degree-0 nodes, decrement neighbors' in-degrees on pop, enqueue when they hit 0. Cycle detection = 'processed fewer than V' — free." },
            { takeaway: "Negative weights silently break Dijkstra.", detail: "No exception, just wrong answers. Bellman-Ford is the safe alternative — slower at O(V·E), but correct. The V-th pass detects negative cycles." },
            { takeaway: "Edge direction matters more than you think.", detail: "'a depends on b' is an edge b→a, not a→b. Mistakes here pass empty test cases and fail real ones with no obvious symptom. Re-read the problem statement before building the graph." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border border-sky-200 dark:border-sky-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 4 complete · Graphs</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Three modules of the algorithms that solve most graph questions: representations, BFS/DFS,
            shortest path, topological sort. You can now spot a graph problem in disguise, pick the right
            traversal, and avoid the silent bugs (undirected double-add, mark-on-enqueue, edge-direction inversion,
            negative-weight Dijkstra). Phase 5 — Java Collections in depth — is the next stop:
            tying everything from Phases 2–4 together into a single decision framework for &quot;which container
            do I reach for?&quot;
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="shortest-path" />
    </article>
  );
}
