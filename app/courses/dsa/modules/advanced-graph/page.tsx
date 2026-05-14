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
  { id: "limits", title: "When Dijkstra fails — the negative-edge wall" },
  { id: "bellman", title: "Bellman-Ford — relax everything, V−1 times" },
  { id: "kstops", title: "Cheapest Flights Within K Stops — Bellman-Ford with a budget" },
  { id: "floyd", title: "Floyd-Warshall — all-pairs shortest paths" },
  { id: "kruskal", title: "MST and Kruskal's algorithm" },
  { id: "prim", title: "Prim's algorithm + the algorithm cheat sheet" },
];

export default function AdvancedGraphModule() {
  const mod = getModuleBySlug("advanced-graph")!;

  // Counterexample: Dijkstra mis-handles a negative edge
  const negEdge = `
flowchart LR
    A((A · 0)) -->|"1"| B((B · 1))
    A -->|"4"| C((C · 4))
    B -->|"-10"| C
    style A fill:#be185d,color:#fff,stroke:#9d174d
    style B fill:#ec4899,color:#fff,stroke:#be185d
    style C fill:#fda4af,color:#000,stroke:#e11d48
  `.trim();

  // Bellman-Ford: relax all edges across V-1 passes
  const bellmanPasses = `
flowchart TB
    subgraph P0["Initial · dist"]
        direction TB
        P0A["A: 0"]
        P0B["B: ∞"]
        P0C["C: ∞"]
        P0D["D: ∞"]
    end
    subgraph P1["Pass 1 · relax every edge once"]
        direction TB
        P1A["A: 0"]
        P1B["B: 1   (A→B)"]
        P1C["C: 4   (A→C)"]
        P1D["D: ∞"]
    end
    subgraph P2["Pass 2"]
        direction TB
        P2A["A: 0"]
        P2B["B: 1"]
        P2C["C: -9   (B→C, weight -10)"]
        P2D["D: -7   (C→D, weight 2)"]
    end
    subgraph P3["Pass 3 · no change → done"]
        direction TB
        P3A["A: 0"]
        P3B["B: 1"]
        P3C["C: -9"]
        P3D["D: -7"]
    end
    P0 --> P1 --> P2 --> P3
    style P0 fill:#831843,color:#fff
    style P1 fill:#9d174d,color:#fff
    style P2 fill:#be185d,color:#fff
    style P3 fill:#db2777,color:#fff
  `.trim();

  // Floyd-Warshall: k as the outer "intermediate-set expansion" knob
  const floydOuter = `
flowchart LR
    K0["k = -1<br/>only direct edges"] --> K1["k = 0<br/>paths may go through node 0"]
    K1 --> K2["k = 1<br/>paths may go through {0,1}"]
    K2 --> K3["k = 2<br/>paths may go through {0,1,2}"]
    K3 --> KN["k = V-1<br/>any node may be intermediate"]
    style K0 fill:#831843,color:#fff
    style K1 fill:#9d174d,color:#fff
    style K2 fill:#be185d,color:#fff
    style K3 fill:#db2777,color:#fff
    style KN fill:#ec4899,color:#fff
  `.trim();

  // Kruskal: greedy edge-by-edge, DSU rejects cycles
  const kruskal = `
flowchart TB
    subgraph S0["Edges sorted by weight"]
        direction TB
        E0["A–B : 1"]
        E1["C–D : 2"]
        E2["B–C : 3"]
        E3["A–C : 4   (would form cycle)"]
        E4["B–D : 5   (would form cycle)"]
    end
    subgraph S1["Step 1 · accept A–B (1)"]
        direction TB
        S1A((A)) ---|1| S1B((B))
        S1C((C))
        S1D((D))
    end
    subgraph S2["Step 2 · accept C–D (2)"]
        direction TB
        S2A((A)) ---|1| S2B((B))
        S2C((C)) ---|2| S2D((D))
    end
    subgraph S3["Step 3 · accept B–C (3) — MST complete (V−1 = 3 edges)"]
        direction TB
        S3A((A)) ---|1| S3B((B))
        S3B ---|3| S3C((C))
        S3C ---|2| S3D((D))
    end
    S0 --> S1 --> S2 --> S3
    style S0 fill:#831843,color:#fff
    style S1 fill:#9d174d,color:#fff
    style S2 fill:#be185d,color:#fff
    style S3 fill:#db2777,color:#fff
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="advanced-graph" />
      <ModuleProgress moduleSlug="advanced-graph" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 8 · Module 32 · Advanced graphs
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · interview-prep deep dive</p>
      </div>

      {/* ───────────────── Part 1 · Limits of Dijkstra ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="limits" title="I know exactly when Dijkstra breaks" xp={20}>
      <section>
        <h2 id="limits">When Dijkstra fails — the negative-edge wall</h2>

        <p>
          Dijkstra is the workhorse of weighted shortest-path problems, and most of the time it&apos;s the right
          choice. But it has a hard precondition: <strong>all edge weights must be non-negative</strong>. The moment
          a single negative edge appears, Dijkstra silently produces wrong answers — no exception, no warning, just
          incorrect numbers. That alone justifies a deeper toolkit, and there are two more shapes of shortest-path
          problem Dijkstra doesn&apos;t address at all: detecting negative cycles, and computing distances between
          every pair of nodes at once.
        </p>

        <h3>The smallest possible counterexample</h3>

        <p>Three nodes, three edges, one of them negative.</p>

        <Mermaid chart={negEdge} />

        <CodeBlock lang="plain">{`Edges:
  A → B  weight 1
  A → C  weight 4
  B → C  weight -10

True shortest A → C:  A → B → C  =  1 + (-10)  =  -9.
What Dijkstra does:
  pop (0, A). Relax A→B (dist[B] = 1). Relax A→C (dist[C] = 4).
  pop (1, B). B is finalized. Relax B→C: 1 + (-10) = -9 < 4. Update dist[C] = -9.
  ...but C was already added to heap with priority 4, and once we pop (4, C),
  Dijkstra "finalizes" C. In standard implementations C's distance can change
  before finalization — the staleness check protects us — but the broader
  invariant ("once finalized, never reconsidered") collapses on graphs that
  combine longer paths with negative edges further out.`}</CodeBlock>

        <p>
          On this tiny example the lazy-deletion version of Dijkstra <em>can</em> stumble into the right answer,
          because C is never finalized before its distance is lowered. But the moment you add another node downstream
          of a finalized vertex, the bug surfaces. The algorithm&apos;s correctness proof leans on a monotonicity
          assumption — adding edges to a confirmed path can only make it longer — which negative weights destroy.
        </p>

        <Callout variant="warn" title="Why the bug is so dangerous">
          <p>
            Dijkstra doesn&apos;t crash on negative edges. It prints distances, you trust them, you ship. The first
            time it bites is usually in production with real-world data — currency exchange, gradient-style edge
            weights, scoring functions that can dip negative. By the time someone notices, the report has been sitting
            on a dashboard for weeks.
          </p>
        </Callout>

        <h3>Three new tools</h3>

        <p>This module fills three holes that Dijkstra leaves open:</p>

        <CodeBlock lang="plain">{`Problem                                    Algorithm           Complexity
─────────────────────────────────────────  ──────────────────  ─────────────
Single-source shortest path with           Bellman-Ford        O(V · E)
  negative weights (no negative cycle)
Detect a negative cycle                    Bellman-Ford        O(V · E)
                                             (one extra pass)
All-pairs shortest paths (small V)         Floyd-Warshall      O(V³)
Connect every node with minimum total      Kruskal / Prim      O(E log E) /
  weight (Minimum Spanning Tree)                                 O(E log V)`}</CodeBlock>

        <p>
          MST is a different family of problem entirely — not &quot;shortest path between two nodes&quot; but
          &quot;cheapest set of edges that keeps the graph connected.&quot; You&apos;ll see why it deserves its own
          algorithms by the end of Part 5.
        </p>

        <Quiz
          kind="Quick check"
          question="Your service runs Dijkstra over a graph where one edge weight is briefly set to -2 by an upstream bug. What's the most likely outcome you'll see in production?"
          options={[
            { label: "An exception when the negative weight is encountered.", explanation: "Java's PriorityQueue happily accepts any int. Dijkstra makes no defensive check on edge weights." },
            { label: "An infinite loop while the algorithm chases the negative edge.", explanation: "Dijkstra terminates regardless — each node is finalized at most once. The pathology is wrong answers, not non-termination." },
            { label: "Distances that look reasonable but are quietly wrong, because once a node is finalized Dijkstra never reconsiders it.", correct: true, explanation: "Right. This is the failure mode that costs teams trust in their data. No alarms fire — the numbers just disagree with reality. Fix: switch to Bellman-Ford, or validate that weights are non-negative before calling Dijkstra." },
            { label: "The algorithm correctly handles the negative weight as long as there's no negative cycle.", explanation: "That's Bellman-Ford's behavior, not Dijkstra's. Dijkstra needs non-negative weights even when no cycle is present." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Bellman-Ford ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="bellman" title="I can implement Bellman-Ford and detect a negative cycle" xp={30}>
      <section>
        <h2 id="bellman">Bellman-Ford — relax everything, V−1 times</h2>

        <p>
          Bellman-Ford trades elegance for safety. Instead of carefully picking the next node to finalize, it brute-forces
          the problem: <em>relax every edge in the graph, and repeat V−1 times</em>. After V−1 passes, every shortest
          path that exists has been found — provided the graph contains no negative cycle.
        </p>

        <h3>Why exactly V−1 passes?</h3>

        <p>
          Any simple path in a graph of V nodes has <strong>at most V−1 edges</strong> (it visits each node at most
          once, so at most V nodes and V−1 transitions between them). A single relaxation pass over all edges
          guarantees that the shortest-path distance &quot;extends by one more edge&quot; from the source. After k
          passes, every shortest path of length ≤ k is correct. After V−1 passes, every simple shortest path is
          correct. There&apos;s no further to extend without revisiting a node, and revisiting a node only helps if a
          negative cycle exists — which we&apos;ll check for explicitly.
        </p>

        <Mermaid chart={bellmanPasses} />

        <h3>The implementation</h3>

        <p>
          Bellman-Ford is naturally written over an <strong>edge list</strong>, not an adjacency list. Every pass is
          just &quot;walk the edge list, try to relax.&quot;
        </p>

        <CodeBlock lang="java">{`// edges as int[]{u, v, w}
public int[] bellmanFord(int n, int[][] edges, int source) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[source] = 0;

    // V-1 passes — every simple shortest path becomes correct
    for (int i = 0; i < n - 1; i++) {
        boolean changed = false;
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] == Integer.MAX_VALUE) continue;     // can't relax from infinity
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                changed = true;
            }
        }
        if (!changed) break;                                // no improvement → settled early
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="info" title="The early-exit optimization is real">
          <p>
            If a full pass changes nothing, no later pass can either — relaxation is monotonic. The early break turns
            the worst-case O(V·E) into something much friendlier on graphs that converge quickly. Always include it
            in real code.
          </p>
        </Callout>

        <h3>Detecting negative cycles</h3>

        <p>
          After V−1 passes, a correct Bellman-Ford has stabilized. If a V-th pass <em>still</em> improves a distance,
          that improvement could only come from a path with V or more edges — meaning a node was visited twice — meaning
          a cycle was used — meaning the cycle&apos;s total weight is negative. That&apos;s the entire detection trick.
        </p>

        <CodeBlock lang="java">{`public boolean hasNegativeCycle(int n, int[][] edges, int source) {
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

    // V-th pass: any further improvement → negative cycle reachable from source
    for (int[] e : edges) {
        int u = e[0], v = e[1], w = e[2];
        if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
            return true;
        }
    }
    return false;
}`}</CodeBlock>

        <Callout variant="insight" title="Negative cycles make 'shortest path' ill-defined">
          <p>
            If you can loop around a negative-weight cycle, you can drive the path cost arbitrarily low — there&apos;s
            no shortest path. Bellman-Ford&apos;s answer to &quot;shortest path through a negative-cycle component&quot;
            is therefore &quot;none exists.&quot; Real applications: currency arbitrage detection (a negative cycle
            in log-converted exchange rates is free money), buggy pricing rules, certain physics simulations.
          </p>
        </Callout>

        <h3>Complexity and when to use it</h3>

        <ul>
          <li><strong>Time:</strong> <code>O(V · E)</code>. On a dense graph (E ~ V²), that&apos;s O(V³) — much slower than Dijkstra&apos;s O((V+E) log V).</li>
          <li><strong>Space:</strong> <code>O(V)</code> for the distance array. Edge list is O(E) input.</li>
          <li><strong>Use when:</strong> negative weights are real, OR you need negative-cycle detection, OR the graph is small enough that O(V·E) is fine and you want the simpler implementation.</li>
        </ul>

        <ClassifyChallenge
          title="Pick the right shortest-path algorithm"
          prompt="For each scenario, which algorithm should you reach for? (Floyd-Warshall is a teaser — we cover it next.)"
          buckets={[
            { id: "dijkstra", label: "Dijkstra OK", color: "indigo" },
            { id: "bellman", label: "Need Bellman-Ford", color: "rose" },
            { id: "floyd", label: "Need Floyd-Warshall", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Road network, edge weights are travel times in seconds. Single source.", answer: "dijkstra", explanation: "All weights non-negative, single source. Dijkstra is fastest." },
            { id: "2", label: "Currency-arbitrage detector — find free-money cycles in log-converted FX rates.", answer: "bellman", explanation: "Edges can be negative (good rates), and the question itself is 'is there a negative cycle?' Bellman-Ford's V-th pass is exactly the tool." },
            { id: "3", label: "20-airport network. You need the cheapest flight cost between every pair of airports for a dashboard.", answer: "floyd", explanation: "All-pairs question, V is tiny (20). Floyd-Warshall in O(V³) = 8000 ops — instant. Cleaner than running Dijkstra V times." },
            { id: "4", label: "Game level pathfinding where some tiles award gold (modeled as negative-cost edges).", answer: "bellman", explanation: "Negative weights present, no all-pairs need. Bellman-Ford. Watch for negative cycles (infinite-gold loops) — Bellman-Ford catches them." },
            { id: "5", label: "Latency map between 1M-node distributed servers, all latencies positive. Single source.", answer: "dijkstra", explanation: "Huge graph, non-negative weights, single source. Dijkstra is the only one fast enough." },
            { id: "6", label: "Small social network of 200 people; for every person, find the shortest-friend-distance to every other person.", answer: "floyd", explanation: "All-pairs, V=200 → V³=8M ops — fine. Floyd-Warshall is one tight triple loop, far simpler than 200 Dijkstras." },
            { id: "7", label: "Network with edges that may be negative, single source, you need to know whether the answer is even well-defined.", answer: "bellman", explanation: "Negative-weight detection is Bellman-Ford's special power. The V-th pass tells you if a negative cycle exists, in which case 'shortest path' is meaningless." },
          ]}
        />

        <Quiz
          kind="Bellman-Ford check"
          question="Why does Bellman-Ford run exactly V−1 passes (not V, not V+1)?"
          options={[
            { label: "V−1 is the maximum number of edges in any simple path, so V−1 passes guarantee every simple shortest path has been found.", correct: true, explanation: "Right. Each pass extends the 'reach' of the relaxation by one more edge. After V−1 passes, the longest possible simple path (V nodes, V−1 edges) is fully relaxed. A V-th pass can only improve a distance if a node is revisited — i.e., a cycle is used — and that's how the negative-cycle check works." },
            { label: "It's an empirical constant from benchmarks.", explanation: "It's a structural bound, not an empirical one. Simple paths in a V-node graph have at most V−1 edges; that's the source of V−1." },
            { label: "Running V passes would cause an infinite loop.", explanation: "It wouldn't — the loop terminates after V passes. We just don't need a V-th pass for correctness; if anything, the V-th pass is what we run separately to detect negative cycles." },
            { label: "Because Dijkstra also runs V iterations.", explanation: "That's not why. Dijkstra extracts V nodes from the heap; Bellman-Ford runs V−1 passes for the simple-path-length reason above. The two algorithms have different structural arguments." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Cheapest Flights ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="kstops" title="I solved Cheapest Flights Within K Stops" xp={30}>
      <section>
        <h2 id="kstops">Cheapest Flights Within K Stops — Bellman-Ford with a budget</h2>

        <p>
          LeetCode 787 is the cleanest application of Bellman-Ford in the standard interview surface. You&apos;re given
          flights as <code>[from, to, price]</code>, a source <code>src</code>, a destination <code>dst</code>, and a
          maximum number of stops <code>k</code>. Find the cheapest price from src to dst using <em>at most k+1
          edges</em> (k stops = k+1 hops). Return -1 if no such path exists.
        </p>

        <h3>Why this is a Bellman-Ford problem (not a Dijkstra one)</h3>

        <p>
          The instinct &quot;cheapest path on a non-negative weighted graph → Dijkstra&quot; is mostly right — but the
          stop budget breaks it. Dijkstra finalizes a node at its globally best distance; if reaching that node cheaply
          requires more than k stops, Dijkstra still records the cheap value, and you have no way to ask for the
          &quot;cheapest path using at most k+1 edges&quot; afterwards. Bellman-Ford&apos;s pass-based structure is
          exactly the right shape: <em>after pass i, dist[v] holds the shortest path using at most i edges</em>.
          Run k+1 passes, and dist[dst] is your answer.
        </p>

        <Callout variant="insight" title="The mental model: passes = edges">
          <p>
            Bellman-Ford&apos;s i-th pass extends the search by one more hop. So if the question asks &quot;within K
            stops&quot; (= K+1 edges), you run K+1 passes. No more, no less. This is one of the cleanest mappings
            between problem statement and algorithm parameter in the whole interview canon.
          </p>
        </Callout>

        <h3>The snapshot trick</h3>

        <p>
          There&apos;s a subtle trap. If during pass i you both <em>read</em> and <em>write</em> the same dist array,
          a relaxation in this pass can pick up a value that was just written in this pass — meaning your &quot;one
          more hop&quot; effectively becomes &quot;maybe two more.&quot; Within a single pass, you must read from a
          <strong>snapshot of the previous pass&apos;s distances</strong>.
        </p>

        <CodeBlock lang="java">{`public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    // K stops = K+1 edges. Run K+1 relaxation passes.
    for (int i = 0; i <= k; i++) {
        int[] prev = dist.clone();              // snapshot from previous pass

        for (int[] f : flights) {
            int u = f[0], v = f[1], w = f[2];
            if (prev[u] == Integer.MAX_VALUE) continue;
            if (prev[u] + w < dist[v]) {
                dist[v] = prev[u] + w;
            }
        }
    }

    return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
}`}</CodeBlock>

        <h3>Why the snapshot is essential — the broken version</h3>

        <p>
          To see why <code>prev = dist.clone()</code> matters, imagine flights{" "}
          <code>[0,1,100], [1,2,100], [0,2,500]</code>, k=0 (one edge allowed only).
        </p>

        <CodeBlock lang="plain">{`Without snapshot (BROKEN):
  Pass 0:
    relax 0→1: dist[1] = 0 + 100 = 100
    relax 1→2: dist[2] = 100 + 100 = 200    ← used the just-updated dist[1]!
    relax 0→2: dist[2] = min(200, 500) = 200
  Result: cheapest with 0 stops = 200. WRONG — that's a 2-edge path.

With snapshot:
  Pass 0:
    prev = [0, ∞, ∞]
    relax 0→1: prev[0] + 100 = 100. dist[1] = 100.
    relax 1→2: prev[1] is ∞. Skip.
    relax 0→2: prev[0] + 500 = 500. dist[2] = 500.
  Result: cheapest with 0 stops = 500. Correct.`}</CodeBlock>

        <p>
          The snapshot makes &quot;at most i+1 edges&quot; rigorous. It&apos;s O(V) per pass, so the total cost is
          O((k+1) · (V + E)) — a small price for correctness.
        </p>

        <Callout variant="warn" title="The classic submission failure">
          <p>
            People who skip the snapshot can pass a few small test cases and fail on harder ones, with output that
            looks &quot;close but wrong by a small amount.&quot; If your Cheapest Flights solution looks right and
            still fails, the snapshot is the first thing to check.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Time:</strong> <code>O((k+1) · (V + E))</code>. The clone is O(V); the inner edge sweep is O(E). For LC 787&apos;s constraints (n ≤ 100, flights ≤ 10⁴, k ≤ n−1) this is well under a millisecond.</li>
          <li><strong>Space:</strong> <code>O(V)</code> for the dist array, plus another O(V) for the snapshot.</li>
        </ul>

        <Quiz
          kind="K-stops check"
          question="Why does the loop in findCheapestPrice use `int[] prev = dist.clone();` at the top of each iteration instead of just reading `dist` directly?"
          options={[
            { label: "It's a Java idiom — arrays must be cloned before iteration.", explanation: "Java doesn't require this. The clone is for algorithmic correctness, not language mechanics." },
            { label: "Without the snapshot, a single pass could chain two edges together: relax u→v in this pass, then read the just-updated v in the same pass to relax v→w. That violates the 'at most one more edge per pass' invariant.", correct: true, explanation: "Right. Bellman-Ford's correctness guarantee — 'after pass i, dist[v] is the shortest path using at most i edges' — depends on each pass reading from the previous pass's state. With the stop budget, that guarantee is what makes the answer truthful: 'cheapest path using at most k+1 edges' is exactly what dist[dst] holds after k+1 passes." },
            { label: "Cloning makes the algorithm faster.", explanation: "It adds work — O(V) per pass — not removes it. The reason is correctness." },
            { label: "It's needed only when there are negative weights.", explanation: "Cheapest Flights has non-negative prices and still needs the snapshot. The snapshot is about the edge-count constraint, not the sign of weights." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Floyd-Warshall ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="floyd" title="I can implement Floyd-Warshall and explain the k-outer loop" xp={30}>
      <section>
        <h2 id="floyd">Floyd-Warshall — all-pairs shortest paths</h2>

        <p>
          Sometimes you need shortest paths between <em>every</em> pair of nodes. You could run Dijkstra V times
          (O(V · (V+E) log V)), but for a small dense graph there&apos;s a stunningly simple alternative:{" "}
          <strong>Floyd-Warshall</strong>, three nested loops, O(V³). For V ≲ 500 it&apos;s usually the right answer,
          and the code fits in ten lines.
        </p>

        <h3>The recurrence</h3>

        <p>
          Define <code>dp[k][i][j]</code> = shortest path from i to j whose intermediate nodes are drawn from{" "}
          <code>{"{0, 1, ..., k}"}</code>. The recurrence reasons about whether the path uses node k as an intermediate:
        </p>

        <CodeBlock lang="plain">{`dp[k][i][j] = min(
    dp[k-1][i][j],                         // path doesn't use k
    dp[k-1][i][k] + dp[k-1][k][j]          // path uses k exactly once: i→...→k→...→j
)`}</CodeBlock>

        <p>
          The base case <code>dp[-1][i][j]</code> is &quot;path uses only direct edges&quot; — set it to the edge
          weight if (i,j) is an edge, 0 if i==j, ∞ otherwise. After expanding through k = 0, 1, ..., V−1 we&apos;ve
          allowed every possible intermediate, and <code>dp[V-1][i][j]</code> is the true shortest path.
        </p>

        <Mermaid chart={floydOuter} />

        <h3>Compressing to 2D</h3>

        <p>
          Just like 1D-DP table compression, the k dimension can be dropped: each layer only depends on the previous
          one, and the in-place update happens to be safe (a careful argument shows that even when{" "}
          <code>dp[i][k]</code> or <code>dp[k][j]</code> are read after being written in the same k-iteration, they
          haven&apos;t actually changed because <code>dp[k][k]</code> is 0). The standard form is:
        </p>

        <CodeBlock lang="java">{`public int[][] floydWarshall(int n, int[][][] edges) {
    final int INF = Integer.MAX_VALUE / 2;          // /2 to avoid overflow on +
    int[][] dist = new int[n][n];
    for (int[] row : dist) Arrays.fill(row, INF);
    for (int i = 0; i < n; i++) dist[i][i] = 0;

    // Initialize with direct edges (edges[i][j] = {neighbor, weight} pairs)
    for (int u = 0; u < n; u++) {
        for (int[] e : edges[u]) {
            int v = e[0], w = e[1];
            dist[u][v] = Math.min(dist[u][v], w);   // handle parallel edges
        }
    }

    // The triple loop — outer must be k
    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="warn" title="The outer loop MUST be k">
          <p>
            This is the single most common Floyd-Warshall bug. If you swap the order so i or j is on the outside, the
            recurrence&apos;s &quot;intermediates from {"{0..k}"}&quot; invariant is broken — when you compute{" "}
            <code>dp[i][j]</code>, the values of <code>dp[i][k]</code> and <code>dp[k][j]</code> may not yet reflect
            the correct intermediate set. The wrong order silently produces wrong distances. Memorize: <strong>k, i,
            j</strong>, in that order, top to bottom.
          </p>
        </Callout>

        <h3>Why we use INF / 2 instead of Integer.MAX_VALUE</h3>

        <p>
          Adding <code>dist[i][k] + dist[k][j]</code> when both are INF would overflow a Java int. Setting INF to{" "}
          <code>Integer.MAX_VALUE / 2</code> ensures the sum stays within int range; it&apos;s still &quot;effectively
          infinite&quot; for any real distance you&apos;d encounter. Alternatively, guard with{" "}
          <code>if (dist[i][k] != INF &amp;&amp; dist[k][j] != INF)</code>, which avoids the trick at the cost of an
          extra check.
        </p>

        <h3>Negative-cycle detection</h3>

        <p>
          After running Floyd-Warshall, <code>dist[i][i] &lt; 0</code> for any i means a negative cycle is reachable
          starting and ending at i — going around the cycle made the &quot;path from i to i&quot; cheaper than 0.
          Cheap and clean.
        </p>

        <h3>Complexity reality check</h3>

        <ul>
          <li><strong>Time:</strong> <code>O(V³)</code>. V=500 → 125M ops — about a second in Java. V=1000 → 1B ops — too slow for most online judges.</li>
          <li><strong>Space:</strong> <code>O(V²)</code> for the distance matrix. V=1000 already needs ~4MB; V=10000 needs 400MB and is impractical.</li>
          <li><strong>Sweet spot:</strong> V ≤ ~500, dense or sparse, weights any sign. The simplicity often beats running V Dijkstras even when Dijkstra is asymptotically faster.</li>
        </ul>

        <Quiz
          kind="Floyd-Warshall check"
          question="In Floyd-Warshall's triple loop, why is k the outermost loop variable instead of i or j?"
          options={[
            { label: "Java performance — k outermost is best for cache locality.", explanation: "Cache locality is a secondary concern; the algorithm is wrong with i or j outermost regardless of cache behavior." },
            { label: "Convention — any order of the three loops gives the same answer.", explanation: "It does not. Swap the order and you compute incorrect distances. The k-outer requirement comes from the recurrence's invariant, not convention." },
            { label: "After iteration k, dist[i][j] holds the shortest path using intermediate nodes drawn from {0..k}. Putting k outermost ensures dist[i][k] and dist[k][j] are at the right 'k-level' when used to update dist[i][j].", correct: true, explanation: "Right. The DP recurrence dp[k][i][j] = min(dp[k-1][i][j], dp[k-1][i][k] + dp[k-1][k][j]) demands that, at the time we update dp[k][i][j], the values dp[k-1][i][k] and dp[k-1][k][j] are available. Iterating k outermost gives that property; the in-place update is safe because dp[k][k] = 0 means k-related values don't actually change in iteration k." },
            { label: "Because i and j must each be visited V times.", explanation: "All three variables iterate V times regardless of nesting order. The point is the order in which the updates happen — k must be the outermost so that 'all paths through {0..k}' are built up layer by layer." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Kruskal & MST ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="kruskal" title="I can implement Kruskal's algorithm with DSU" xp={35}>
      <section>
        <h2 id="kruskal">MST and Kruskal&apos;s algorithm</h2>

        <p>
          A <strong>Minimum Spanning Tree</strong> (MST) of a weighted, undirected, connected graph is a set of V−1
          edges that connects all V nodes with the minimum possible total weight. The classic real-world setup: you
          have N houses and a list of possible road segments, each with a build cost. What&apos;s the cheapest set of
          roads that lets every house reach every other? That&apos;s the MST.
        </p>

        <Callout variant="insight" title="MST is a different question from shortest path">
          <p>
            Shortest path asks: &quot;what&apos;s the cheapest way to get from A to B?&quot; MST asks: &quot;what&apos;s
            the cheapest set of edges that keeps the whole graph connected?&quot; An MST does NOT, in general, contain
            the shortest path between two arbitrary nodes. The optimization target is total edge weight, not pairwise
            distance.
          </p>
        </Callout>

        <h3>Kruskal&apos;s greedy algorithm</h3>

        <p>The algorithm is elegantly simple:</p>

        <ol>
          <li>Sort all edges by weight, ascending.</li>
          <li>Walk through the sorted edges. For each edge (u, v, w), accept it if and only if u and v are not already in the same connected component.</li>
          <li>Stop when V−1 edges have been accepted (or you&apos;ve exhausted the list — if fewer than V−1 were accepted, the graph wasn&apos;t connected).</li>
        </ol>

        <Mermaid chart={kruskal} />

        <h3>Why greedy works — the cut property</h3>

        <p>
          The proof rests on the <strong>cut property</strong>: for any cut of the graph (a partition of vertices into
          two sets), the cheapest edge crossing the cut belongs to <em>some</em> MST. Kruskal&apos;s sorted order picks
          exactly such cheapest-crossing edges every time it accepts: when (u, v) is the first edge in sorted order
          that connects two different components, it&apos;s the cheapest crossing of the cut between those components.
          The cut property guarantees an MST contains it.
        </p>

        <h3>The DSU connection</h3>

        <p>
          The &quot;are u and v in the same component?&quot; check is exactly the operation that{" "}
          <strong>Union-Find / Disjoint Set Union (DSU)</strong> exists for. With path compression and union-by-rank,
          each <code>find</code> and <code>union</code> is effectively O(1). If you haven&apos;t internalized DSU,
          Kruskal is a strong second look — the algorithm doesn&apos;t even make sense without it.
        </p>

        <CodeBlock lang="java">{`class DSU {
    int[] parent, rank;

    DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    boolean union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;                        // same set already
        if (rank[rx] < rank[ry]) { parent[rx] = ry; }
        else if (rank[rx] > rank[ry]) { parent[ry] = rx; }
        else { parent[ry] = rx; rank[rx]++; }
        return true;
    }
}

public int kruskalMST(int n, int[][] edges) {
    // edges[i] = {u, v, w}
    Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));
    DSU dsu = new DSU(n);
    int totalWeight = 0;
    int edgesUsed = 0;

    for (int[] e : edges) {
        int u = e[0], v = e[1], w = e[2];
        if (dsu.union(u, v)) {           // accept iff it joins two different sets
            totalWeight += w;
            edgesUsed++;
            if (edgesUsed == n - 1) break;
        }
    }

    if (edgesUsed < n - 1) return -1;    // graph wasn't connected
    return totalWeight;
}`}</CodeBlock>

        <h3>LeetCode 1584 · Min Cost to Connect All Points</h3>

        <p>
          Given points in the plane, the cost between two points is their Manhattan distance. Find the minimum cost
          to connect all points (= MST). Two implementation choices to make:
        </p>

        <ol>
          <li>Build the full edge list (all pairs) and run Kruskal — O(V² log V).</li>
          <li>Or run Prim with adjacency matrix — O(V²). On a complete graph this is faster.</li>
        </ol>

        <p>For Kruskal:</p>

        <CodeBlock lang="java">{`public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    int totalEdges = n * (n - 1) / 2;
    int[][] edges = new int[totalEdges][3];
    int idx = 0;

    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int dist = Math.abs(points[i][0] - points[j][0])
                     + Math.abs(points[i][1] - points[j][1]);
            edges[idx++] = new int[]{i, j, dist};
        }
    }

    Arrays.sort(edges, (a, b) -> Integer.compare(a[2], b[2]));
    DSU dsu = new DSU(n);
    int total = 0, used = 0;

    for (int[] e : edges) {
        if (dsu.union(e[0], e[1])) {
            total += e[2];
            used++;
            if (used == n - 1) break;
        }
    }
    return total;
}`}</CodeBlock>

        <Callout variant="warn" title="V² edges on a complete graph">
          <p>
            Min Cost to Connect All Points has up to n=1000 points → ~500K edges. Storing them all is fine, but
            sorting half a million ints takes a noticeable chunk of memory and time. For complete graphs, Prim with
            an adjacency-matrix-style update is often a better fit — same asymptotics, smaller constants. We&apos;ll
            implement that next.
          </p>
        </Callout>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Time:</strong> <code>O(E log E)</code> for the sort, plus <code>O(E · α(V))</code> for the DSU operations — effectively O(E log E).</li>
          <li><strong>Space:</strong> <code>O(V)</code> for DSU + <code>O(E)</code> for the edge list.</li>
        </ul>

        <Quiz
          kind="Kruskal check"
          question="What's the role of DSU's union returning a boolean (true if it actually merged, false if already in the same set)?"
          options={[
            { label: "It's a Java convention — boolean returns mean 'success'.", explanation: "It's algorithmic, not stylistic. The boolean carries the cycle-detection signal." },
            { label: "It tells Kruskal whether the edge would have created a cycle. False → same component already → skip the edge. True → newly connected components → accept the edge.", correct: true, explanation: "Right. Kruskal's correctness depends on rejecting any edge that would form a cycle (otherwise you'd have V or more edges in your tree). DSU's union returning false is exactly 'the endpoints were already connected, so adding this edge would create a cycle.' That's the entire cycle-detection mechanism." },
            { label: "It tracks the total weight of the MST.", explanation: "Total weight is tracked separately in the loop. The boolean is about cycle detection." },
            { label: "It signals whether path compression happened.", explanation: "Path compression is internal to find(); union's return value is unrelated. The boolean is the 'merged or not' signal that drives Kruskal's edge-acceptance decision." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Prim & cheat sheet ───────────────── */}
      <Checkpoint moduleSlug="advanced-graph" id="prim" title="I can pick the right shortest-path/MST algorithm in seconds" xp={40} celebration="You now have the full graph-algorithm toolkit. Module 33 — Interview problem-solving framework — wraps everything you've learned into a repeatable approach.">
      <section>
        <h2 id="prim">Prim&apos;s algorithm + the algorithm cheat sheet</h2>

        <p>
          Prim&apos;s algorithm is the other classical MST builder. Where Kruskal works edge-first (sort all edges,
          greedily add), Prim works node-first (start from a single node, greedily grow the tree by the cheapest
          frontier edge). Same MST, different mechanics — and a different best-fit on dense vs sparse graphs.
        </p>

        <h3>The algorithm</h3>

        <ol>
          <li>Pick any starting node. Add it to the MST set.</li>
          <li>Maintain a min-heap of edges crossing the cut (edges from MST nodes to non-MST nodes).</li>
          <li>Pop the cheapest edge. If its endpoint is not yet in the MST, add the endpoint and add its outgoing edges to the heap.</li>
          <li>Repeat until V nodes are in the MST.</li>
        </ol>

        <p>
          This is structurally Dijkstra without the cumulative distance — instead of &quot;cheapest accumulated path
          to a node,&quot; the priority is &quot;cheapest single edge to a node.&quot;
        </p>

        <CodeBlock lang="java">{`public int primMST(int n, List<List<int[]>> adj) {
    // adj.get(u) = list of {v, weight}
    boolean[] inMST = new boolean[n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    pq.offer(new int[]{0, 0});                  // {weight to enter, node}; start from node 0

    int totalWeight = 0;
    int nodesInMST = 0;

    while (!pq.isEmpty() && nodesInMST < n) {
        int[] top = pq.poll();
        int w = top[0], u = top[1];
        if (inMST[u]) continue;                 // already absorbed via a cheaper edge

        inMST[u] = true;
        totalWeight += w;
        nodesInMST++;

        for (int[] edge : adj.get(u)) {
            int v = edge[0], cost = edge[1];
            if (!inMST[v]) pq.offer(new int[]{cost, v});
        }
    }

    return nodesInMST == n ? totalWeight : -1;  // -1 if graph wasn't connected
}`}</CodeBlock>

        <Callout variant="insight" title="Prim is Dijkstra wearing a hat">
          <p>
            Same heap-based BFS structure, same lazy-deletion trick. The only meaningful difference is the priority
            key: Dijkstra uses cumulative distance from the source, Prim uses just the edge weight to enter the node.
            If you can implement Dijkstra in your sleep, you can implement Prim with a one-line change.
          </p>
        </Callout>

        <h3>Kruskal vs Prim — when to use which</h3>

        <CodeBlock lang="plain">{`Sparse graph (E ≈ V):
  Kruskal — O(E log E) ≈ O(V log V).
  Edge list is small; sorting is cheap.

Dense graph (E ≈ V²):
  Prim with adjacency matrix + O(V) extraction — O(V²).
  Avoids the O(E log E) ≈ O(V² log V) sort.
  For V = 1000, that's 10⁶ vs ~2 × 10⁷ ops — 20× faster.

Edge list given directly (vs adjacency list):
  Kruskal is the natural fit — the input shape matches.

Streaming / online setting (edges arrive one at a time):
  Neither classical algorithm fits perfectly, but Kruskal's framing
  (process edges in sorted order) is closer.`}</CodeBlock>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Prim with binary heap:</strong> <code>O((V + E) log V)</code>, identical to Dijkstra.</li>
          <li><strong>Prim with adjacency matrix + array extraction:</strong> <code>O(V²)</code> — better for dense graphs.</li>
          <li><strong>Kruskal:</strong> <code>O(E log E)</code> — better for sparse graphs.</li>
        </ul>

        <h3>The algorithm cheat sheet</h3>

        <p>
          Here&apos;s the Phase 4 + Phase 8 graph-algorithm toolkit, condensed. Print it. Tape it to your monitor. Read
          it before every graph problem until it&apos;s reflex.
        </p>

        <CodeBlock lang="plain">{`╔══════════════════════════════════════════════════════════════════════════════╗
║                       SHORTEST PATH / MST DECISION TABLE                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Problem shape                            Algorithm           Time            ║
║ ─────────────────────────────────────    ──────────────────  ──────────────  ║
║ Unweighted, single-source SP             BFS                 O(V + E)        ║
║ Unweighted, two endpoints                Bidirectional BFS   O(b^(d/2))      ║
║ Weighted (non-negative), single-source   Dijkstra            O((V+E) log V)  ║
║ Weighted (any sign), single-source       Bellman-Ford        O(V · E)        ║
║ Detect a negative cycle                  Bellman-Ford        O(V · E)        ║
║   (V-th pass still relaxes → cycle)                                          ║
║ All-pairs SP, small V (≤ ~500)           Floyd-Warshall      O(V³)           ║
║ All-pairs SP, large V                    V × Dijkstra        O(V·(V+E)logV)  ║
║ Cheapest path with edge-count budget     Bellman-Ford-like   O(K · (V+E))    ║
║   (K stops, snapshot per pass)                                               ║
║ Topological order (DAG)                  Kahn's BFS          O(V + E)        ║
║ Cycle detection (directed)               DFS or Kahn's       O(V + E)        ║
║ Cycle detection (undirected)             DFS or DSU          O(V + E)        ║
║ MST, sparse graph                        Kruskal + DSU       O(E log E)      ║
║ MST, dense graph                         Prim + matrix       O(V²)           ║
║ Connectivity / component count           BFS / DFS / DSU     O(V + E)        ║
╚══════════════════════════════════════════════════════════════════════════════╝`}</CodeBlock>

        <ClassifyChallenge
          title="Final sweep — pick the algorithm"
          prompt="One read of the problem statement, one algorithm choice. Push yourself to answer in five seconds per item."
          buckets={[
            { id: "bfs", label: "BFS", color: "sky" },
            { id: "dijkstra", label: "Dijkstra", color: "indigo" },
            { id: "bellman", label: "Bellman-Ford", color: "rose" },
            { id: "floyd", label: "Floyd-Warshall", color: "violet" },
            { id: "kruskal", label: "Kruskal/Prim (MST)", color: "emerald" },
            { id: "kahn", label: "Kahn's (topo)", color: "amber" },
          ]}
          items={[
            { id: "1", label: "Build cost of cheapest road network connecting 800 villages — pick a subset of proposed roads.", answer: "kruskal", explanation: "Connect-everything-cheaply = MST. Sparse-ish, edge list given → Kruskal." },
            { id: "2", label: "Shortest delivery route through a 50-warehouse network with all-positive distances; you need every pairwise distance for a heatmap.", answer: "floyd", explanation: "All-pairs, V=50 → V³=125K ops, instant. Floyd-Warshall is cleaner than 50 Dijkstras." },
            { id: "3", label: "Detect free-money loops in foreign-exchange rates (some rates favor you, modeled as negative log-edges).", answer: "bellman", explanation: "Negative weights + cycle detection — Bellman-Ford's V-th pass is exactly the tool." },
            { id: "4", label: "Fewest moves a chess knight needs to reach (7,7) from (0,0).", answer: "bfs", explanation: "Each move is one step, no weights. BFS." },
            { id: "5", label: "Cheapest flight from city A to city B with at most 3 stops.", answer: "bellman", explanation: "Bellman-Ford with K+1=4 passes and the snapshot trick. Stop-budget is the giveaway." },
            { id: "6", label: "Build order for 200 software packages given their dependency pairs.", answer: "kahn", explanation: "Dependency ordering → topological sort. Kahn's gives the order and detects cycles." },
            { id: "7", label: "Lowest-latency path from one server to another in a 100K-node positive-weight network.", answer: "dijkstra", explanation: "Big graph, non-negative weights, single source. Dijkstra is the only option fast enough." },
            { id: "8", label: "Min Cost to Connect All Points (Manhattan-distance edges, dense complete graph, n=1000).", answer: "kruskal", explanation: "MST. Kruskal works; Prim with adjacency matrix is faster on this dense graph. Either way, MST family." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A coworker insists on using Prim's instead of Kruskal's for an MST problem with 100K nodes and 110K edges (essentially sparse). What's the right pushback?"
          options={[
            { label: "Kruskal is generally easier to debug, so it's preferable for code-review reasons.", explanation: "True in some teams, but the more concrete reason is asymptotic — Kruskal is faster on this shape." },
            { label: "On a sparse graph (E ≈ V), Kruskal's O(E log E) wins decisively over Prim's O((V+E) log V) only when implemented poorly. Either choice is fine.", explanation: "They're asymptotically tied (both O(E log V)). The real lever is constant factors and code complexity, which still favor Kruskal on edge-list inputs." },
            { label: "Kruskal is a natural fit for sparse graphs given as an edge list — sort once, walk once. Prim with a heap is asymptotically the same but requires building an adjacency list first and uses more memory; the simpler choice usually wins on sparse inputs.", correct: true, explanation: "Right. They're asymptotically tied at O(E log V), but Kruskal on an edge list is one sort + one DSU sweep, with a smaller working set. Prim shines on dense graphs (especially with adjacency-matrix + O(V) extraction → O(V²)). When in doubt on sparse: Kruskal." },
            { label: "Prim doesn't work on graphs with more than 10K nodes.", explanation: "It does — both algorithms scale to large graphs. The choice between them is about which is a better fit for the input shape, not about correctness limits." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="When would you reach for Floyd-Warshall over running Dijkstra V times?"
          options={[
            { label: "When the graph has negative edges and you need shortest paths between all pairs, on a small (V ≤ ~500) graph — Floyd-Warshall handles negatives, runs in O(V³), and fits in ten lines of code. Running V Dijkstras would be both incorrect (negatives break Dijkstra) and harder to write.", correct: true, explanation: "Right. Floyd-Warshall's two superpowers — handles any sign of weight + dead-simple all-pairs — make it the obvious choice for small dense graphs that may have negatives. For large V, V Dijkstras (or V Bellman-Fords) is the path." },
            { label: "Always — Floyd-Warshall is uniformly faster.", explanation: "It's not. For sparse graphs, V Dijkstras (V × O(E log V)) easily beats Floyd-Warshall's O(V³)." },
            { label: "Only when the graph is unweighted.", explanation: "On unweighted graphs, V BFSes (V × O(V+E)) is much faster than O(V³). Floyd-Warshall doesn't shine on unweighted." },
            { label: "When you need single-source shortest paths.", explanation: "Floyd-Warshall computes ALL pairs at once. For single-source, Dijkstra (or Bellman-Ford) is the right tool — V³ is overkill." },
          ]}
        />

        <PartRecap
          title="The Phase 8 graph upgrade"
          gist="Three new shortest-path tools (Bellman-Ford, Floyd-Warshall, Bellman-Ford with stop budget) plus the MST family (Kruskal, Prim) — and a one-page decision table to pick between them."
          points={[
            { takeaway: "Dijkstra requires non-negative weights. With negatives, it silently produces wrong answers.", detail: "The bug is structural: Dijkstra finalizes by current best, but a later negative edge could improve a finalized node. No exception, no warning — just incorrect distances. If your input could ever be negative, switch to Bellman-Ford." },
            { takeaway: "Bellman-Ford = relax all edges, V−1 passes, plus an optional V-th pass for negative-cycle detection.", detail: "V−1 because a simple path has at most V−1 edges. The V-th pass detects negative cycles: any further improvement implies a node was revisited via a cycle whose weight is negative." },
            { takeaway: "Cheapest Flights Within K Stops is Bellman-Ford with K+1 passes and a snapshot per pass.", detail: "The snapshot (`int[] prev = dist.clone();`) preserves the 'at most i edges' invariant. Without it, a single pass can chain two relaxations and inflate the answer." },
            { takeaway: "Floyd-Warshall = three nested loops, k outermost, O(V³).", detail: "dp[i][j] after iteration k = shortest path using intermediates from {0..k}. The k-outermost order is non-negotiable; swap it and the algorithm produces wrong distances." },
            { takeaway: "MST is connect-everything-cheaply. Kruskal sorts edges and uses DSU; Prim grows from a node with a heap.", detail: "Kruskal is best for sparse graphs / edge-list input; Prim is best for dense graphs (especially with adjacency matrix + O(V²) extraction). Both run on the cut property: cheapest-edge-out-of-current-tree always belongs to some MST." },
            { takeaway: "The algorithm cheat sheet is your interview lifeline.", detail: "Match problem shape to algorithm in seconds: BFS for unweighted, Dijkstra for non-negative, Bellman-Ford for negatives or stop-budgets, Floyd-Warshall for all-pairs on small V, Kruskal/Prim for MST, Kahn's for topological order. The right choice is usually clear from one read of the problem statement." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Next up · Module 33 · Interview problem-solving framework</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            You now have every algorithm a typical interview demands. Module 33 turns that toolkit into a repeatable
            problem-solving process — UMPIRE, pattern recognition from problem statements, and how to communicate
            your thinking under pressure. Three full mock interviews with talk-aloud transcripts close the loop on
            Phase 8.
          </p>
          <Link
            href="/courses/dsa/modules/interview-framework"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Module 33 →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="advanced-graph" />
    </article>
  );
}
