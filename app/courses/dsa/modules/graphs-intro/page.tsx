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
  { id: "what", title: "What a graph is, beyond the textbook" },
  { id: "vocab", title: "The vocabulary you can't get away from" },
  { id: "represent", title: "Adjacency list vs adjacency matrix" },
  { id: "build", title: "Building a graph in Java" },
  { id: "project", title: "Project: Graph<T> + Find if Path Exists" },
  { id: "final", title: "Final quiz" },
];

export default function GraphsIntroModule() {
  const mod = getModuleBySlug("graphs-intro")!;

  // The fundamental picture: a small directed graph
  const directedGraph = `
flowchart LR
    A((A)) --> B((B))
    A --> C((C))
    B --> D((D))
    C --> D
    D --> E((E))
    C --> E
    style A fill:#0ea5e9,color:#fff,stroke:#0284c7
    style B fill:#38bdf8,color:#000,stroke:#0284c7
    style C fill:#38bdf8,color:#000,stroke:#0284c7
    style D fill:#7dd3fc,color:#000,stroke:#0ea5e9
    style E fill:#bae6fd,color:#000,stroke:#0ea5e9
  `.trim();

  // Adjacency list vs matrix side-by-side concept
  const repCompare = `
flowchart LR
    subgraph G["Same graph"]
        direction LR
        A1((A)) --> B1((B))
        A1 --> C1((C))
        B1 --> C1
        C1 --> D1((D))
    end
    subgraph LIST["Adjacency list"]
        direction TB
        L0["A → [B, C]"]
        L1["B → [C]"]
        L2["C → [D]"]
        L3["D → []"]
    end
    subgraph MAT["Adjacency matrix"]
        direction TB
        M["    A B C D
A   0 1 1 0
B   0 0 1 0
C   0 0 0 1
D   0 0 0 0"]
    end
    G --> LIST
    G --> MAT
    style A1 fill:#0ea5e9,color:#fff
    style B1 fill:#38bdf8,color:#000
    style C1 fill:#38bdf8,color:#000
    style D1 fill:#7dd3fc,color:#000
    style LIST fill:#0c4a6e,color:#fff,stroke:#0ea5e9
    style MAT fill:#0c4a6e,color:#fff,stroke:#0ea5e9
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="graphs-intro" />
      <ModuleProgress moduleSlug="graphs-intro" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 4 · Module 17 · Foundations
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · the foundation for the next two modules</p>
      </div>

      {/* ───────────────── Part 1 · What ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="what" title="I can name three things in my codebase that are graphs" xp={20}>
      <section>
        <h2 id="what">What a graph is, beyond the textbook</h2>

        <p>
          A <strong>graph</strong>{" "}is a set of <em>nodes</em> (or <em>vertices</em>) and <em>edges</em>{" "}connecting them.
          That definition is so general it sounds useless. The reason graphs matter, and the reason every interview
          loop has 3-5 graph problems, is that <em>most non-trivial relationships in software are graphs</em>, and
          the same handful of algorithms solve them all.
        </p>

        <Mermaid chart={directedGraph} />

        <p>Some examples that don&apos;t look like graphs but are:</p>

        <ul>
          <li><strong>Build dependencies.</strong>{" "}Maven modules, Gradle subprojects, each module points to its dependencies. Topological sort tells you the build order.</li>
          <li><strong>Function call graphs.</strong>{" "}Methods call other methods. Cycle detection finds infinite recursion; SCC analysis finds tightly coupled clusters.</li>
          <li><strong>Spreadsheet formulas.</strong>{" "}Each cell points to the cells its formula reads. Re-evaluation order is a topo sort. Circular references are cycles.</li>
          <li><strong>Permission inheritance.</strong>{" "}Roles inherit from roles, groups belong to groups. &quot;Does Alice have permission X?&quot; is reachability.</li>
          <li><strong>Anything social.</strong>{" "}Friends-of-friends, retweets, reply threads. Six degrees of separation = BFS depth.</li>
          <li><strong>State machines.</strong>{" "}Order states (PENDING → PAID → SHIPPED → DELIVERED) form a directed graph. Reachability tells you whether a transition is legal.</li>
          <li><strong>The web.</strong>{" "}Pages link to pages. PageRank is a graph algorithm. So is &quot;recommended for you&quot; on most platforms.</li>
        </ul>

        <Callout variant="insight" title="Trees and linked lists are graphs too">
          A linked list is a graph where every node has exactly one outgoing edge. A tree is a graph that&apos;s
          connected and acyclic, with a designated root. Phase 3 was secretly preparing you for this, every tree
          algorithm is a graph algorithm with extra structure. Once you internalize the graph view, the BFS you wrote
          for binary trees is the <em>same BFS</em>{" "}that does shortest-path, word ladders, and rotting oranges.
        </Callout>

        <h3>Why graphs feel hard</h3>

        <p>
          Graphs are where the &quot;easy data structure&quot; era ends. Three things make them harder than what came
          before:
        </p>

        <ol>
          <li><strong>The shape isn&apos;t obvious from the input.</strong>{" "}An array is &quot;here are some numbers in order.&quot; A graph might be given as a list of edges, an adjacency matrix, a 2D grid, an implicit neighbor function, or just a problem statement. Step zero is always &quot;what&apos;s the graph?&quot;</li>
          <li><strong>You can revisit nodes.</strong>{" "}Trees have no cycles, so DFS just works. Graphs need a <code>visited</code> set or you loop forever.</li>
          <li><strong>The same algorithm solves wildly different-looking problems.</strong> &quot;Shortest path,&quot; &quot;word ladder,&quot; and &quot;rotting oranges&quot; are all BFS, but the surface details mask it. Recognizing the graph in disguise is half the skill.</li>
        </ol>

        <Quiz
          kind="Quick check"
          question="A directed graph has a path from A to B and a path from B to A. What's the technical name for that situation?"
          options={[
            { label: "A cycle.", correct: true, explanation: "Right. A directed cycle is exactly a path from a node back to itself, which is what 'A→...→B→...→A' means. (More specifically, A and B are in the same strongly connected component.)" },
            { label: "An undirected edge.", explanation: "Undirected means the edge itself goes both ways. Here we have two separate directed paths, that's a cycle." },
            { label: "A bipartite graph.", explanation: "Bipartite means nodes split into two groups with no edges within a group. Different concept entirely." },
            { label: "A self-loop.", explanation: "A self-loop is an edge from a node to itself, like A→A. We're talking about a multi-step round trip." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Vocabulary ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="vocab" title="I can read a graph problem statement without flinching" xp={20}>
      <section>
        <h2 id="vocab">The vocabulary you can&apos;t get away from</h2>

        <p>
          Graph problems are written in graph vocabulary. There&apos;s no avoiding it. Here&apos;s the working set,
          the words you&apos;ll see in every problem statement.
        </p>

        <h3>The basic five</h3>

        <ul>
          <li><strong>Vertex / node:</strong>{" "}a point. We&apos;ll use &quot;node&quot; informally and &quot;vertex&quot; in formal contexts. Same thing.</li>
          <li><strong>Edge:</strong>{" "}a connection between two nodes. Sometimes written as a pair <code>(u, v)</code>.</li>
          <li><strong>Neighbor / adjacent:</strong>{" "}two nodes connected by an edge. &quot;Neighbors of A&quot; = the nodes A is directly connected to.</li>
          <li><strong>Degree:</strong>{" "}number of edges touching a node. In a directed graph, split into <strong>in-degree</strong> (edges coming in) and <strong>out-degree</strong> (edges going out).</li>
          <li><strong>Path:</strong>{" "}a sequence of nodes where consecutive ones are neighbors. Length is usually counted in edges.</li>
        </ul>

        <h3>The four axes that classify a graph</h3>

        <p>Every graph problem starts by telling you (or expecting you to figure out) where the graph sits on these axes:</p>

        <CodeBlock lang="plain">{`Directed   ←→ Undirected     do edges have a direction?
Weighted   ←→ Unweighted     do edges have costs?
Cyclic     ←→ Acyclic        can you loop back to where you started?
Connected  ←→ Disconnected   can you reach every node from every other?`}</CodeBlock>

        <p>
          The combination matters. <strong>DAG</strong> = Directed Acyclic Graph (the build-order shape). <strong>Tree</strong> = connected acyclic undirected graph. <strong>Forest</strong> = disjoint trees. These named combinations show up in problem statements and you should hear &quot;DAG&quot; and immediately think &quot;topological sort applies.&quot;
        </p>

        <h3>The structure words</h3>

        <ul>
          <li><strong>Cycle:</strong>{" "}a path that starts and ends at the same node (with no repeats in between). Detecting cycles is one of the canonical graph problems.</li>
          <li><strong>Connected component:</strong>{" "}a maximal set of nodes that can all reach each other. An undirected graph might split into several components, &quot;islands&quot;.</li>
          <li><strong>Strongly connected component (SCC):</strong>{" "}in a directed graph, a maximal set where every node can reach every other. A weaker version, &quot;weakly connected,&quot; treats edges as undirected.</li>
          <li><strong>Bipartite:</strong>{" "}nodes split into two groups with edges only going <em>between</em>{" "}groups, never within. Job-applicant ↔ job, student ↔ class.</li>
          <li><strong>Dense vs sparse:</strong>{" "}rough labels for &quot;edges close to V²&quot; vs &quot;edges close to V&quot;. The choice between adjacency list and matrix turns on this.</li>
        </ul>

        <Callout variant="info" title="V and E, the two variables in every graph Big-O">
          When you see <code>O(V + E)</code>, that&apos;s &quot;linear in the graph size.&quot; <code>V</code> is
          vertex count, <code>E</code> is edge count. BFS and DFS are O(V + E). Dijkstra with a binary heap is{" "}
          <code>O((V + E) log V)</code>. You will see these expressions everywhere; treat V and E like the &quot;n&quot;
          you saw in arrays.
        </Callout>

        <h3>Self-loops and multi-edges</h3>

        <p>
          A <strong>self-loop</strong>{" "}is an edge from a node to itself (<code>A → A</code>). A <strong>multi-edge</strong>{" "}
          (or parallel edge) is two distinct edges between the same pair of nodes. Most problems forbid both
          implicitly, a clean graph has neither, but it&apos;s worth asking. They show up in real systems (a graph
          of money transfers can have multiple A→B edges) and they break some algorithms (Eulerian path counts edges,
          so multi-edges matter).
        </p>

        <Quiz
          kind="Quick check"
          question="A graph has 5 nodes and the edges {(A,B), (B,C), (C,A), (D,E)}. How many connected components does it have?"
          options={[
            { label: "1.", explanation: "Not all 5 nodes are mutually reachable. {A,B,C} is one cluster; {D,E} is another." },
            { label: "2.", correct: true, explanation: "Right. {A, B, C} are mutually reachable through the triangle. {D, E} are mutually reachable through their single edge. No edge connects the two groups, so 2 components." },
            { label: "3.", explanation: "If you count the triangle as separate from D-E, that's 2 components, not 3." },
            { label: "5.", explanation: "5 components would mean every node is isolated. Here, 4 of them have edges." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which of these is a DAG?"
          options={[
            { label: "{A→B, B→A}.", explanation: "That's a 2-cycle. Cyclic, not acyclic." },
            { label: "{A→B, B→C, C→A}.", explanation: "Triangle cycle. Cyclic." },
            { label: "{A→B, A→C, B→D, C→D}.", correct: true, explanation: "Right. Directed, and you can't get from any node back to itself. The shape is the classic 'diamond' DAG, A is a source, D is a sink." },
            // content-lint-disable em-dash: the em dashes below are undirected-edge notation, not prose, and the explanation references them by name.
            { label: "{A—B, B—C}.", explanation: "Those are undirected edges (note the em-dashes). A DAG needs directed edges by definition." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Representation ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="represent" title="I know which representation to pick and why" xp={25}>
      <section>
        <h2 id="represent">Adjacency list vs adjacency matrix</h2>

        <p>
          Two representations dominate. Adjacency list is what you&apos;ll use 90% of the time. Adjacency matrix shows
          up in two specific situations. Knowing both, and knowing when each wins, is core literacy.
        </p>

        <Mermaid chart={repCompare} />

        <h3>Adjacency list</h3>

        <p>
          For each node, store a collection of its neighbors. In Java, the canonical shape is a <code>Map&lt;Node, List&lt;Node&gt;&gt;</code> or a{" "}
          <code>List&lt;List&lt;Integer&gt;&gt;</code> when nodes are integer-indexed.
        </p>

        <CodeBlock lang="java">{`// Integer-indexed nodes (most common in LeetCode)
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
adj.get(0).add(1);   // edge 0 → 1
adj.get(0).add(2);   // edge 0 → 2

// Iterate neighbors
for (int neighbor : adj.get(0)) {
    // ...
}`}</CodeBlock>

        <p>
          <strong>Space:</strong> <code>O(V + E)</code>, one slot per node, one entry per edge.{" "}
          <strong>Iterate neighbors of v:</strong> <code>O(degree(v))</code>, exactly the work you need.{" "}
          <strong>Has-edge(u, v) check:</strong> <code>O(degree(u))</code>, you scan u&apos;s list.
        </p>

        <h3>Adjacency matrix</h3>

        <p>
          A 2D array where <code>matrix[u][v] = 1</code> if there&apos;s an edge u→v, else 0. For weighted graphs,
          store the weight (or <code>0</code>/<code>Integer.MAX_VALUE</code> for &quot;no edge&quot;).
        </p>

        <CodeBlock lang="java">{`int[][] matrix = new int[n][n];
matrix[0][1] = 1;   // edge 0 → 1
matrix[0][2] = 1;   // edge 0 → 2

// Iterate neighbors of 0
for (int v = 0; v < n; v++) {
    if (matrix[0][v] == 1) { /* ... */ }
}`}</CodeBlock>

        <p>
          <strong>Space:</strong> <code>O(V²)</code> regardless of edge count. <strong>Has-edge(u, v):</strong>{" "}
          <code>O(1)</code>. <strong>Iterate neighbors of v:</strong> <code>O(V)</code>, you have to scan a whole row,
          even if v has only 2 neighbors out of 10,000 nodes.
        </p>

        <h3>How to choose</h3>

        <CodeBlock lang="plain">{`                       Adjacency list   Adjacency matrix
Space                  O(V + E)         O(V²)
Add edge               O(1)             O(1)
Remove edge            O(degree(u))     O(1)
Check if (u,v) exists  O(degree(u))     O(1)
Iterate neighbors(v)   O(degree(v))     O(V)
Iterate ALL edges      O(V + E)         O(V²)`}</CodeBlock>

        <Callout variant="insight" title="The default is adjacency list">
          Real-world graphs are sparse: social networks have ~100 friends per person out of billions of users; web
          pages link to a handful of others out of trillions. <code>O(V + E)</code> beats <code>O(V²)</code> by orders
          of magnitude. The matrix only wins when E is close to V² (dense graphs) <em>or</em>{" "}when you do many
          has-edge queries on random pairs.
        </Callout>

        <h3>When the matrix actually wins</h3>

        <ul>
          <li><strong>Dense graphs:</strong>{" "}if E ≈ V², the matrix wastes no space and is cache-friendlier.</li>
          <li><strong>Frequent has-edge queries:</strong>{" "}Floyd-Warshall (all-pairs shortest path) needs O(1) edge lookup. List would make it O(V³ · log V) or worse.</li>
          <li><strong>Tiny V:</strong>{" "}if V ≤ 100, V² ≤ 10,000, trivial. Matrix is simpler and the constant factors are usually faster.</li>
          <li><strong>Implicit grids:</strong>{" "}a 2D grid problem (like &quot;number of islands&quot;) is essentially using the grid <em>as</em>{" "}the adjacency representation. Each cell&apos;s neighbors are computed on the fly with <code>(dr, dc)</code> deltas.</li>
        </ul>

        <ClassifyChallenge
          title="Pick the representation"
          prompt="For each scenario, which representation is the right default?"
          buckets={[
            { id: "list", label: "Adjacency list", color: "sky" },
            { id: "matrix", label: "Adjacency matrix", color: "indigo" },
          ]}
          items={[
            { id: "1", label: "Twitter follow graph: 500M users, ~200 follows each.", answer: "list", explanation: "Wildly sparse. List is O(V + E) ≈ 10¹¹ entries; matrix would be V² = 2.5×10¹⁷, about 2.5 million times bigger." },
            { id: "2", label: "Floyd-Warshall on a 50-node road network.", answer: "matrix", explanation: "All-pairs shortest path needs O(1) edge lookup, and 50² = 2500 cells is trivial. Matrix is the natural fit." },
            { id: "3", label: "BFS over a 10×10 grid maze.", answer: "matrix", explanation: "The grid is already a 2D matrix; you compute neighbors via (dr, dc) deltas. There's no separate adjacency structure to build." },
            { id: "4", label: "Web crawl: pages link to a few others, billions of pages total.", answer: "list", explanation: "V² is astronomical for the web. List is the only option that fits in memory." },
            { id: "5", label: "Course prerequisite graph, ~50 courses, ~3 prereqs each.", answer: "list", explanation: "Sparse, and you'll be doing topological sort which iterates neighbors, list is the textbook choice. (Matrix would also work; both are tiny.)" },
            { id: "6", label: "Dense connectivity matrix among ~30 services for a microservice impact analysis.", answer: "matrix", explanation: "30 services with most pairs connected → near-V² edges. Matrix is small and the has-edge queries are O(1)." },
            { id: "7", label: "Friend-of-friend recommendations on a billion-node social graph.", answer: "list", explanation: "BFS at depth 2 over a sparse graph. List is mandatory at this scale." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Building ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="build" title="I can build a graph from edges and iterate neighbors" xp={20}>
      <section>
        <h2 id="build">Building a graph in Java</h2>

        <p>
          LeetCode usually hands you a graph in one of three shapes. Recognize each and convert to an adjacency list as
          your first step, it removes friction for everything that follows.
        </p>

        <h3>Shape 1 · Edge list</h3>

        <p>The most common LeetCode input: <code>int[][] edges</code> where each row is a <code>[u, v]</code> pair.</p>

        <CodeBlock lang="java">{`// Undirected, integer-indexed nodes [0, n-1]
List<List<Integer>> buildUndirected(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);   // both directions for undirected
    }
    return adj;
}

// Directed: just one of the two adds
List<List<Integer>> buildDirected(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
    }
    return adj;
}`}</CodeBlock>

        <Callout variant="warn" title="The single most common graph bug">
          Forgetting that &quot;undirected&quot; means you have to add the edge <em>twice</em>. If the problem says
          &quot;the graph is undirected&quot; and your traversal can only walk one way, this is the first thing to check.
          The reverse mistake, adding both directions on a directed problem, silently turns DAG problems into
          cyclic-graph problems.
        </Callout>

        <h3>Shape 2 · Implicit (grid)</h3>

        <p>
          A 2D grid where each cell&apos;s neighbors are the four (or eight) adjacent cells. There&apos;s no graph
          object, you compute neighbors on the fly with deltas.
        </p>

        <CodeBlock lang="java">{`// 4-directional neighbors (up, right, down, left)
int[][] DIRS = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

void forEachNeighbor(int r, int c, int rows, int cols) {
    for (int[] d : DIRS) {
        int nr = r + d[0], nc = c + d[1];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            // (nr, nc) is a neighbor
        }
    }
}`}</CodeBlock>

        <p>
          The bounds check (<code>nr &gt;= 0 &amp;&amp; nr &lt; rows ...</code>) is the &quot;does this edge exist&quot;
          check, embedded inside the iteration. Most grid problems also have a &quot;is this cell traversable&quot;
          check, like <code>grid[nr][nc] == &apos;1&apos;</code> for &quot;number of islands.&quot;
        </p>

        <h3>Shape 3 · Custom Node objects</h3>

        <p>
          When the problem hands you a <code>Node</code> class with a <code>List&lt;Node&gt; neighbors</code> field
          directly. &quot;Clone Graph&quot; (LC 133) is the canonical example. No conversion needed, just traverse.
        </p>

        <CodeBlock lang="java">{`class Node {
    int val;
    List<Node> neighbors;
}

// You can DFS/BFS directly, with a visited set keyed by Node identity (or val if guaranteed unique)
void dfs(Node start) {
    Set<Node> seen = new HashSet<>();
    Deque<Node> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        Node cur = stack.pop();
        if (!seen.add(cur)) continue;
        for (Node nb : cur.neighbors) stack.push(nb);
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why ArrayDeque, not Stack">
          The legacy <code>java.util.Stack</code> class extends <code>Vector</code> and is synchronized, it&apos;s
          slow and discouraged. <code>ArrayDeque</code> is the modern stack: <code>push</code>, <code>pop</code>,{" "}
          <code>peek</code>, all O(1), no synchronization tax. Same advice for queues:{" "}
          <code>ArrayDeque</code> beats <code>LinkedList</code> as a queue. (Phase 2 covered this, it shows up
          everywhere from here on.)
        </Callout>

        <h3>Weighted edges</h3>

        <p>
          When edges have costs, the adjacency-list entries become pairs. Standard idiom in Java:
        </p>

        <CodeBlock lang="java">{`// Weighted directed graph: adj[u] is a list of (v, weight) pairs
List<List<int[]>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (int[] e : edges) {
    // e = [u, v, w]
    adj.get(e[0]).add(new int[]{e[1], e[2]});
}

// Iterate
for (int[] nb : adj.get(u)) {
    int v = nb[0], w = nb[1];
    // ...
}`}</CodeBlock>

        <p>
          Some prefer a small <code>Edge</code> record (<code>record Edge(int to, int weight) {}</code>) for
          readability. Both work; <code>int[]</code> is fastest because you avoid an extra object allocation per edge,
          which matters on graphs with millions of edges.
        </p>

        <Quiz
          kind="Building check"
          question="You're given an undirected graph as `int[][] edges` and 5 nodes labeled 0–4. After running `buildUndirected(5, [[0,1],[1,2],[3,4]])`, what's `adj.get(1).size()`?"
          options={[
            { label: "1.", explanation: "Only counting outgoing? In an undirected build you add the edge in both directions, so 1 has neighbors 0 AND 2." },
            { label: "2.", correct: true, explanation: "Right. Edge (0,1) adds 0 to adj.get(1). Edge (1,2) adds 2 to adj.get(1). So adj.get(1) = [0, 2], size 2. The (3,4) edge doesn't touch node 1." },
            { label: "3.", explanation: "Node 1 only appears in two of the three edges. Neighbor count is 2." },
            { label: "0.", explanation: "Node 1 appears in two edges; in an undirected representation, both contribute." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="project" title="I built a Graph<T> and solved Find if Path Exists" xp={40} manual manualLabel="I built the graph and submitted LC 1971">
      <section>
        <h2 id="project">Project: <code>Graph&lt;T&gt;</code> + Find if Path Exists</h2>

        <p>
          Build a small generic graph class and use it to solve a real problem. The point of the project is twofold:
          (1) feel the difference between a generic <code>Graph&lt;T&gt;</code> and the integer-indexed
          adjacency-list-of-lists pattern you&apos;ll write on LeetCode, and (2) confirm you can do the &quot;input →
          adjacency list → traversal&quot; pipeline on autopilot.
        </p>

        <h3>Step 1 · The Graph class</h3>

        <CodeBlock lang="java">{`import java.util.*;

public class Graph<T> {
    private final boolean directed;
    private final Map<T, List<T>> adj = new HashMap<>();

    public Graph(boolean directed) { this.directed = directed; }

    public void addNode(T v) {
        adj.putIfAbsent(v, new ArrayList<>());
    }

    public void addEdge(T u, T v) {
        addNode(u);
        addNode(v);
        adj.get(u).add(v);
        if (!directed) adj.get(v).add(u);
    }

    public List<T> neighbors(T v) {
        return adj.getOrDefault(v, Collections.emptyList());
    }

    public Set<T> nodes() {
        return adj.keySet();
    }

    public int size() {
        return adj.size();
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why putIfAbsent, not just put">
          <code>put</code> would overwrite the existing neighbor list with a fresh empty one, a silent bug if you
          ever <code>addNode</code> twice for the same key. <code>putIfAbsent</code> is the idempotent version: insert
          only if missing.
        </Callout>

        <h3>Step 2 · Try it on a tiny example</h3>

        <CodeBlock lang="java">{`Graph<String> g = new Graph<>(false);   // undirected
g.addEdge("A", "B");
g.addEdge("B", "C");
g.addEdge("A", "C");
g.addEdge("D", "E");

System.out.println(g.neighbors("A"));   // [B, C]
System.out.println(g.neighbors("E"));   // [D]
System.out.println(g.neighbors("Z"));   // [] (not throwing — getOrDefault)`}</CodeBlock>

        <h3>Step 3 · LC 1971 · Find if Path Exists in Graph</h3>

        <p>
          Given <code>n</code> nodes (0-indexed) and a list of bidirectional edges, decide whether there&apos;s a path
          from <code>source</code> to <code>destination</code>. This is the simplest possible graph traversal problem,
          and a perfect first checkpoint that &quot;build adjacency list, then traverse&quot; works.
        </p>

        <CodeBlock lang="java">{`public boolean validPath(int n, int[][] edges, int source, int destination) {
    if (source == destination) return true;

    // Step 1: build adjacency list
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }

    // Step 2: BFS from source, look for destination
    boolean[] visited = new boolean[n];
    Deque<Integer> queue = new ArrayDeque<>();
    queue.offer(source);
    visited[source] = true;

    while (!queue.isEmpty()) {
        int cur = queue.poll();
        for (int nb : adj.get(cur)) {
            if (nb == destination) return true;
            if (!visited[nb]) {
                visited[nb] = true;
                queue.offer(nb);
            }
        }
    }
    return false;
}`}</CodeBlock>

        <p>
          That&apos;s the entire pattern: build the graph, traverse, check. We&apos;ll do this dozens of times in the
          next two modules, it should start feeling mechanical.
        </p>

        <Callout variant="insight" title="visited[source] = true is not optional">
          Without it, an undirected graph can revisit the source through a back-edge and loop forever (or just waste
          time). Marking on enqueue, not on dequeue, also matters: it prevents the same node from getting added to the
          queue multiple times. Both habits matter more in BFS-DFS proper, but they start here.
        </Callout>

        <h3>Stretch · Try DFS too</h3>

        <p>
          Same problem with iterative DFS using <code>ArrayDeque</code> as a stack. The only difference is{" "}
          <code>queue.poll()</code> (head) becomes <code>stack.pop()</code> (head), and{" "}
          <code>queue.offer(x)</code> becomes <code>stack.push(x)</code>. The graph traversal abstraction is so
          uniform that BFS and DFS differ by exactly one data-structure swap. We&apos;ll formalize this in the next module.
        </p>

        <CodeBlock lang="java">{`Deque<Integer> stack = new ArrayDeque<>();
stack.push(source);
boolean[] visited = new boolean[n];
visited[source] = true;
while (!stack.isEmpty()) {
    int cur = stack.pop();
    if (cur == destination) return true;
    for (int nb : adj.get(cur)) {
        if (!visited[nb]) {
            visited[nb] = true;
            stack.push(nb);
        }
    }
}
return false;`}</CodeBlock>

        <PartRecap
          title="The graph-problem pipeline"
          gist="Step 1: figure out what's a node and what's an edge. Step 2: convert input to adjacency list. Step 3: pick the right traversal. Steps 1-2 are usually 70% of getting unstuck."
          points={[
            { takeaway: "Always start by reading the input shape.", detail: "Edge list (int[][]), grid (char[][]), or Node objects with a neighbors field. Each has a different conversion-to-adjacency-list step." },
            { takeaway: "Adjacency list is the default representation.", detail: "O(V + E) space, O(degree) neighbor iteration, fits real-world sparse graphs. Reach for adjacency matrix only when E ≈ V² or you need O(1) has-edge queries." },
            { takeaway: "Undirected = add the edge twice.", detail: "adj.get(u).add(v); adj.get(v).add(u);. Forgetting the second line is the most common graph bug and breaks everything downstream." },
            { takeaway: "ArrayDeque is your stack and queue.", detail: "Skip Stack and LinkedList. ArrayDeque is faster, unsynchronized, and works for both DFS (push/pop) and BFS (offer/poll)." },
            { takeaway: "Mark visited on enqueue, not on dequeue.", detail: "Otherwise the same node can land in the queue multiple times before any of them are processed, wasted work and sometimes wrong answers." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="graphs-intro" id="final" title="I'm ready for BFS and DFS" xp={25} celebration="The graph foundation is set. BFS and DFS, the two traversals that solve most graph problems, are next.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="What's the space complexity of an adjacency list for a graph with V nodes and E edges?"
          options={[
            { label: "O(V).", explanation: "That's just the outer array. You also pay for every neighbor entry." },
            { label: "O(E).", explanation: "Close, but you also need V slots, one per node, even for nodes with no edges." },
            { label: "O(V + E).", correct: true, explanation: "Right. V slots for the outer structure (one per node, even isolated ones), plus E entries across all the inner lists. That's why list beats matrix on sparse graphs, when E is much less than V², (V + E) is much less than V²." },
            { label: "O(V²).", explanation: "That's the matrix. The whole point of the list is to avoid V² when E is small." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A graph problem says: 'cells of a 100×100 grid are connected to their 4-directional neighbors.' What's V, what's E, and what representation should you use?"
          options={[
            { label: "V=10,000, E≈20,000, adjacency list.", explanation: "V and E are right (≈99×100 horizontal + 99×100 vertical undirected edges ≈ 19,800). But you wouldn't build an explicit list, the grid IS the representation." },
            { label: "V=10,000, E≈20,000, adjacency matrix.", explanation: "10,000² = 100,000,000 cells in the matrix. You'd never build it. The grid serves as an implicit representation." },
            { label: "V=10,000, E≈20,000, the grid itself is the implicit representation, compute neighbors with (dr, dc) deltas.", correct: true, explanation: "Right. V = 10,000 cells. Undirected E ≈ 99×100 horizontal edges + 100×99 vertical ≈ 19,800. Building a separate adjacency structure is wasted work, the grid layout already encodes adjacency. Just iterate {(-1,0),(0,1),(1,0),(0,-1)} from each cell, with bounds checks." },
            { label: "V=100, E=100. Just a small graph.", explanation: "There are 100×100=10,000 cells, not 100. Each cell is a node." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You wrote `adj.get(u).add(v);` but forgot `adj.get(v).add(u);` in an undirected graph. What's the first symptom you'd notice?"
          options={[
            { label: "A NullPointerException.", explanation: "No, adj.get(v) is a non-null empty list (you initialized them all). The bug is silent." },
            { label: "BFS from u finds v, but BFS from v doesn't find u.", correct: true, explanation: "Right. You created a directed edge u→v instead of an undirected one. From u you can reach v (the edge points that way), but from v there's no way back. Every BFS/DFS from the 'wrong side' silently returns the wrong answer." },
            { label: "An infinite loop.", explanation: "Backwards, undirected graphs are MORE prone to infinite loops because edges go both ways. Missing one direction makes things terminate faster, not slower." },
            { label: "A compile error.", explanation: "Java has no way to know your intent. The bug is logical, not syntactic, caught only by a failing test." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="Graphs are everywhere in code. With the right representation and vocabulary, problems that looked intimidating become 'build the adjacency list, then traverse.' The next two modules are about those traversals."
          points={[
            { takeaway: "Spot a graph in disguise.", detail: "Build dependencies, call graphs, state machines, permission inheritance, social connections, the web. Once you see the graph, the algorithm follows." },
            { takeaway: "Read graph vocabulary fluently.", detail: "Vertex, edge, neighbor, degree, path, cycle, DAG, connected component, bipartite. These words show up in every problem statement and you can't decode the problem without them." },
            { takeaway: "Pick adjacency list by default.", detail: "O(V + E) space, fits sparse real-world graphs. Reach for matrix only on dense graphs, frequent has-edge queries, or trivial sizes (V ≤ 100). Grids use the grid itself implicitly." },
            { takeaway: "Convert any input shape to an adjacency list.", detail: "Edge list → loop and add. Grid → don't convert, use deltas. Node objects → traverse directly with a visited set. The conversion is step 1 of every graph problem." },
            { takeaway: "Avoid the silent traps.", detail: "Undirected means two adds, not one. Mark visited on enqueue, not dequeue. Use ArrayDeque, not Stack or LinkedList. Each one is the source of a real LeetCode bug." },
          ]}
        />

        <div className="not-prose mt-8 mb-8 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6 dark:border-sky-800/40 dark:from-sky-950/30 dark:to-blue-950/30">
          <p className="mb-2 text-sm font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">Up next · Module 18</p>
          <h3 className="m-0 text-lg font-bold text-slate-900 dark:text-slate-100">BFS &amp; DFS</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            The two traversals that solve most of the graph question family. When BFS gives you shortest path for free,
            why DFS is the natural fit for connectivity, and how the same code structure handles both with a one-line swap.
          </p>
          <Link
            href="/courses/dsa/modules/bfs-dfs"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
          >
            Continue to BFS &amp; DFS →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="graphs-intro" />
    </article>
  );
}
