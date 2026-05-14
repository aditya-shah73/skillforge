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
  { id: "intuition", title: "BFS vs DFS — the two traversals" },
  { id: "bfs", title: "BFS, with the level-by-level pattern" },
  { id: "dfs", title: "DFS, recursive and iterative" },
  { id: "grid", title: "The grid pattern — connected components & flood fill" },
  { id: "project", title: "Project: Number of Islands + Clone Graph + Rotting Oranges" },
  { id: "final", title: "Final quiz" },
];

export default function BfsDfsModule() {
  const mod = getModuleBySlug("bfs-dfs")!;

  // BFS expands level by level
  const bfsLevels = `
flowchart TB
    subgraph L0["Level 0 · start"]
        A((A))
    end
    subgraph L1["Level 1 · neighbors of A"]
        B((B))
        C((C))
    end
    subgraph L2["Level 2 · their neighbors"]
        D((D))
        E((E))
        F((F))
    end
    subgraph L3["Level 3"]
        G((G))
    end
    A -.-> B
    A -.-> C
    B -.-> D
    B -.-> E
    C -.-> F
    E -.-> G
    F -.-> G
    L0 --> L1 --> L2 --> L3
    style A fill:#0ea5e9,color:#fff,stroke:#0284c7
    style B fill:#38bdf8,color:#000
    style C fill:#38bdf8,color:#000
    style D fill:#7dd3fc,color:#000
    style E fill:#7dd3fc,color:#000
    style F fill:#7dd3fc,color:#000
    style G fill:#bae6fd,color:#000
  `.trim();

  // DFS goes deep first
  const dfsOrder = `
flowchart TB
    A(("A · 1")) --> B(("B · 2"))
    A --> C(("C · 6"))
    B --> D(("D · 3"))
    B --> E(("E · 4"))
    E --> G(("G · 5"))
    C --> F(("F · 7"))
    style A fill:#0ea5e9,color:#fff,stroke:#0284c7
    style B fill:#0284c7,color:#fff
    style D fill:#0369a1,color:#fff
    style E fill:#0369a1,color:#fff
    style G fill:#075985,color:#fff
    style C fill:#0284c7,color:#fff
    style F fill:#0369a1,color:#fff
  `.trim();

  // Grid flood fill animation
  const grid = `
flowchart TB
    subgraph G0["Start: target = '1', BFS from (0,0)"]
        direction TB
        R0["1 1 0 0 1
1 0 0 1 1
0 0 1 1 0"]
    end
    subgraph G1["Step: visit (0,0); enqueue (0,1) and (1,0)"]
        direction TB
        R1["[1] 1 0 0 1
1 0 0 1 1
0 0 1 1 0"]
    end
    subgraph G2["Step: drain neighbors. Component finished: 3 cells."]
        direction TB
        R2["[1] [1] 0 0 1
[1] 0 0 1 1
0 0 1 1 0"]
    end
    G0 --> G1 --> G2
    style G0 fill:#0c4a6e,color:#fff
    style G1 fill:#075985,color:#fff
    style G2 fill:#0369a1,color:#fff
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="bfs-dfs" />
      <ModuleProgress moduleSlug="bfs-dfs" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 4 · Module 15 · Core
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2.5–3h · the engine of every graph algorithm</p>
      </div>

      {/* ───────────────── Part 1 · Intuition ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="intuition" title="I know when to reach for BFS vs DFS" xp={20}>
      <section>
        <h2 id="intuition">BFS vs DFS — the two traversals</h2>

        <p>
          Every graph traversal answers some flavor of: <em>starting from this node, what can I reach, in what
          order, and how far?</em>{" "}Two strategies dominate. They use the same template — visit a node, mark it,
          enqueue its neighbors, repeat — and differ by one thing: the data structure that holds the frontier.
        </p>

        <CodeBlock lang="plain">{`BFS (Breadth-First Search)   →   queue   →   visit nearest first
DFS (Depth-First Search)     →   stack   →   visit one path to its end first`}</CodeBlock>

        <p>
          That&apos;s the entire difference at the code level. BFS uses a FIFO queue, so the oldest unvisited node
          (the one closest to the start) comes out first. DFS uses a LIFO stack (or recursion, which uses the implicit
          call stack), so the most recently added node comes out first — and you keep diving until you hit a dead end.
        </p>

        <h3>What BFS is good at</h3>

        <Mermaid chart={bfsLevels} />

        <ul>
          <li><strong>Shortest path on unweighted graphs.</strong>{" "}BFS visits nodes in order of distance from the start, so the first time you see the target, you&apos;re looking at the shortest path. This is the single most useful property in interviews.</li>
          <li><strong>Level-by-level processing.</strong>{" "}Anything that thinks in &quot;rings&quot; from a source — rotting oranges spreading, fire spreading, BFS from a tree root level-by-level — is BFS.</li>
          <li><strong>Bipartite checking.</strong>{" "}Two-color the graph in BFS layers; a conflict means non-bipartite.</li>
          <li><strong>Word ladder, shortest transformations.</strong>{" "}Each word is a node, valid one-letter changes are edges, BFS finds the minimum number of changes.</li>
        </ul>

        <h3>What DFS is good at</h3>

        <Mermaid chart={dfsOrder} />

        <ul>
          <li><strong>Connectivity questions.</strong> &quot;Is everything reachable from here?&quot;, &quot;How many connected components?&quot;, &quot;Number of islands?&quot;. You don&apos;t care about distance, just about visiting everything.</li>
          <li><strong>Cycle detection.</strong>{" "}DFS naturally exposes cycles via &quot;back edges&quot; — an edge to an ancestor on the current path.</li>
          <li><strong>Topological sort.</strong>{" "}Postorder DFS, reversed, gives a valid topo order.</li>
          <li><strong>Backtracking problems.</strong>{" "}Permutations, subsets, N-Queens — all DFS over an implicit graph of partial states. (Phase 6 territory.)</li>
          <li><strong>Tree problems.</strong>{" "}Almost every recursive tree solution from Phase 3 was DFS. The pattern carries over directly.</li>
        </ul>

        <Callout variant="insight" title="The one-sentence test">
          If the question contains the words &quot;shortest,&quot; &quot;minimum number of steps,&quot; or
          &quot;fewest&quot; — BFS. Otherwise — connectivity, traversal, &quot;is there a path,&quot; &quot;count the
          components&quot; — DFS is usually simpler. When both work, write the one whose code is shorter; for grids
          that&apos;s usually DFS, for shortest-path-ish that&apos;s always BFS.
        </Callout>

        <h3>The unified template</h3>

        <p>
          Both traversals fit the same skeleton. Notice how only the data-structure operations differ.
        </p>

        <CodeBlock lang="java">{`// BFS template
Queue<Integer> queue = new ArrayDeque<>();
boolean[] visited = new boolean[n];
queue.offer(start);
visited[start] = true;
while (!queue.isEmpty()) {
    int cur = queue.poll();           // FIFO: oldest first
    for (int nb : adj.get(cur)) {
        if (!visited[nb]) {
            visited[nb] = true;        // mark on enqueue
            queue.offer(nb);
        }
    }
}

// DFS template (iterative)
Deque<Integer> stack = new ArrayDeque<>();
boolean[] visited = new boolean[n];
stack.push(start);
visited[start] = true;
while (!stack.isEmpty()) {
    int cur = stack.pop();             // LIFO: newest first
    for (int nb : adj.get(cur)) {
        if (!visited[nb]) {
            visited[nb] = true;
            stack.push(nb);
        }
    }
}`}</CodeBlock>

        <Callout variant="warn" title="For BFS, mark on enqueue (not on dequeue)">
          <p>
            If you mark only when you dequeue in BFS, the same neighbor can be added to the queue multiple times
            before the first copy gets processed. The traversal still terminates, but the queue grows larger than it
            should and &quot;first time we see X&quot; logic (recording shortest-path distance, level-order grouping)
            gives wrong answers. <strong>For BFS, always mark when you enqueue.</strong>
          </p>
          <p>
            Iterative DFS is more flexible: both &quot;mark on push&quot; (above, no duplicates ever enter the stack)
            and &quot;mark on pop&quot; (duplicates allowed, popped duplicates short-circuit) are correct for
            connectivity. Mark-on-pop is the version that matches recursive DFS&apos;s visit order — see the next
            section. Pick one convention per traversal and stick with it.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You need to find the minimum number of edges between two nodes in an unweighted graph. Which traversal?"
          options={[
            { label: "BFS.", correct: true, explanation: "Right. BFS visits nodes in order of edge-distance from the start, so the first time you reach the target, you've used the fewest possible edges. This is THE reason BFS exists." },
            { label: "DFS.", explanation: "DFS finds a path, but not necessarily the shortest one — it might wander deep into the wrong branch first. Use BFS for shortest path on unweighted graphs." },
            { label: "Either, doesn't matter.", explanation: "It matters a lot. DFS can return arbitrarily long paths even when shorter ones exist." },
            { label: "Dijkstra.", explanation: "Dijkstra is shortest-path for WEIGHTED graphs. On unweighted graphs it works but is overkill — BFS is simpler and just as fast (in fact faster, since BFS skips the heap)." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · BFS ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="bfs" title="I can write BFS with shortest-path tracking" xp={25}>
      <section>
        <h2 id="bfs">BFS, with the level-by-level pattern</h2>

        <p>
          Three flavors of BFS show up in interviews. They&apos;re the same algorithm with different bookkeeping; once
          you have the muscle memory for one, the others are minor variations.
        </p>

        <h3>Flavor 1 · Plain reachability</h3>

        <p>&quot;Can I reach the target?&quot; Just walk and check.</p>

        <CodeBlock lang="java">{`boolean canReach(List<List<Integer>> adj, int start, int target) {
    if (start == target) return true;
    boolean[] visited = new boolean[adj.size()];
    Deque<Integer> queue = new ArrayDeque<>();
    queue.offer(start);
    visited[start] = true;
    while (!queue.isEmpty()) {
        int cur = queue.poll();
        for (int nb : adj.get(cur)) {
            if (nb == target) return true;
            if (!visited[nb]) {
                visited[nb] = true;
                queue.offer(nb);
            }
        }
    }
    return false;
}`}</CodeBlock>

        <h3>Flavor 2 · Shortest distance to every node</h3>

        <p>
          Carry a <code>dist[]</code> array. The trick: when you mark a node visited, set its distance to{" "}
          <code>dist[parent] + 1</code>. BFS&apos;s level-order property guarantees this is the shortest distance.
        </p>

        <CodeBlock lang="java">{`int[] bfsDistances(List<List<Integer>> adj, int start) {
    int n = adj.size();
    int[] dist = new int[n];
    Arrays.fill(dist, -1);            // -1 = unreachable
    Deque<Integer> queue = new ArrayDeque<>();
    queue.offer(start);
    dist[start] = 0;
    while (!queue.isEmpty()) {
        int cur = queue.poll();
        for (int nb : adj.get(cur)) {
            if (dist[nb] == -1) {
                dist[nb] = dist[cur] + 1;
                queue.offer(nb);
            }
        }
    }
    return dist;
}`}</CodeBlock>

        <Callout variant="insight" title="Why dist[] doubles as visited[]">
          A node has <code>dist[v] == -1</code> exactly when it hasn&apos;t been visited. So you don&apos;t need a
          separate <code>visited[]</code> array — checking <code>dist[v] == -1</code> tells you both
          &quot;unvisited&quot; and &quot;set its distance now.&quot; One less variable, same semantics.
        </Callout>

        <h3>Flavor 3 · Level-by-level (the &quot;frozen size&quot; trick)</h3>

        <p>
          When the problem cares about &quot;all nodes at distance k&quot; as a group — rotting oranges spreading
          per minute, binary tree level order, the K-th level&apos;s sum — you need to process the queue in batches.
          The trick is to <em>freeze the queue size at the start of each level</em>, then drain exactly that many.
        </p>

        <CodeBlock lang="java">{`int level = 0;
while (!queue.isEmpty()) {
    int sizeNow = queue.size();        // FREEZE — don't read .size() inside the loop!
    for (int i = 0; i < sizeNow; i++) {
        int cur = queue.poll();
        // ... process this level ...
        for (int nb : adj.get(cur)) {
            if (!visited[nb]) {
                visited[nb] = true;
                queue.offer(nb);        // these are level+1, won't be drained this round
            }
        }
    }
    level++;
}`}</CodeBlock>

        <p>
          The <code>sizeNow</code> snapshot is the entire trick. Without it, you&apos;d keep peeking at the live
          <code>queue.size()</code>, which grows during the loop as you offer new neighbors — and you&apos;d
          accidentally count level k+1 in level k&apos;s batch. (You saw this exact pattern in the trees module on
          binary-tree level-order.)
        </p>

        <h3>Multi-source BFS</h3>

        <p>
          Sometimes you have many starting points and want the distance from <em>any</em>{" "}source to each node. The
          rotting-oranges problem is the canonical example: every initially-rotten orange is a source; you want how
          long until everything is rotten. The trick is to seed the queue with all sources at once.
        </p>

        <CodeBlock lang="java">{`Deque<int[]> queue = new ArrayDeque<>();
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        if (grid[r][c] == 2) {        // 2 = initially rotten
            queue.offer(new int[]{r, c});
        }
    }
}
// Now run BFS as usual; every source contributes simultaneously to level 0.`}</CodeBlock>

        <Callout variant="info" title="Multi-source BFS = single-source BFS on a virtual super-source">
          Imagine adding a fake node S with a 0-weight edge to every real source. Single-source BFS from S would do
          exactly what multi-source BFS does, just with one extra hop. Implementing it as &quot;seed the queue with
          all sources&quot; saves the indirection.
        </Callout>

        <Quiz
          kind="BFS check"
          question="Why is `int sizeNow = queue.size();` the canonical first line of the level-order loop body?"
          options={[
            { label: "It's a Java idiom for queues.", explanation: "It's specific to BFS level-order; not a general queue idiom." },
            { label: "It freezes the level boundary. New nodes added to the queue inside the loop are level+1 and shouldn't be drained this round.", correct: true, explanation: "Right. queue.size() grows as you offer neighbors. If you read it live each iteration, you'd merge levels. Snapshotting it draws a clean line: 'drain exactly these N, no more, no less.'" },
            { label: "Performance — caching .size() is faster.", explanation: "ArrayDeque.size() is O(1); the snapshot is about correctness, not speed." },
            { label: "It avoids ConcurrentModificationException.", explanation: "Single-threaded BFS doesn't throw CME. You're modifying the queue, but through its own API." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · DFS ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="dfs" title="I can write DFS recursively and iteratively" xp={25}>
      <section>
        <h2 id="dfs">DFS, recursive and iterative</h2>

        <p>
          DFS comes in two flavors: <strong>recursive</strong> (uses the call stack implicitly — shorter, more
          natural) and <strong>iterative</strong> (uses an explicit <code>ArrayDeque</code> as a stack — longer, but
          immune to stack overflow). Know both. Reach for recursive by default; switch to iterative only when the
          graph is deep enough to blow the JVM stack (~10⁴+ in default config).
        </p>

        <h3>Recursive DFS — the default</h3>

        <CodeBlock lang="java">{`boolean[] visited;
List<List<Integer>> adj;

void dfs(int u) {
    visited[u] = true;
    // ... pre-order work here (visit u BEFORE its descendants) ...
    for (int v : adj.get(u)) {
        if (!visited[v]) dfs(v);
    }
    // ... post-order work here (visit u AFTER all descendants done) ...
}`}</CodeBlock>

        <p>
          The <em>pre-order</em>{" "}slot fires when you arrive at a node; the <em>post-order</em>{" "}slot fires when
          you&apos;ve finished all of its descendants. This split powers a lot of DFS algorithms:
        </p>

        <ul>
          <li><strong>Counting connected components:</strong>{" "}pre-order increment a counter when you find an unvisited node from the outer loop.</li>
          <li><strong>Cycle detection (directed):</strong>{" "}use three colors — WHITE/GRAY/BLACK — and check for back-edges to GRAY nodes (still on the recursion stack).</li>
          <li><strong>Topological sort:</strong>{" "}push to a list <em>in post-order</em>, then reverse. The post-order moment is &quot;all my dependencies are done.&quot;</li>
        </ul>

        <h3>Iterative DFS — when recursion would blow the stack</h3>

        <CodeBlock lang="java">{`void dfsIterative(int start) {
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (visited[u]) continue;
        visited[u] = true;
        for (int v : adj.get(u)) {
            if (!visited[v]) stack.push(v);
        }
    }
}`}</CodeBlock>

        <Callout variant="warn" title="Iterative DFS visit order isn't identical to recursive">
          Recursive DFS visits children in the order they appear in <code>adj.get(u)</code>. Iterative DFS using a
          stack visits them in <em>reverse</em>{" "}order, because the last one pushed comes off first. If exact order
          matters (rare in interview problems, common in &quot;reproduce my output&quot; problems), push children in
          reverse order to match recursion.
        </Callout>

        <h3>Cycle detection in a directed graph — the three-color DFS</h3>

        <p>
          Each node is one of WHITE (unvisited), GRAY (currently on the DFS stack), BLACK (fully done). An edge to a
          GRAY node is a <em>back edge</em> — a cycle.
        </p>

        <CodeBlock lang="java">{`int[] color;   // 0=WHITE, 1=GRAY, 2=BLACK

boolean hasCycle(int u) {
    color[u] = 1;                          // GRAY: now on the stack
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;    // back edge → cycle
        if (color[v] == 0 && hasCycle(v)) return true;
    }
    color[u] = 2;                          // BLACK: done
    return false;
}`}</CodeBlock>

        <Callout variant="insight" title="Why two colors aren't enough for directed cycles">
          With just visited/unvisited, you can&apos;t distinguish &quot;already finished and safe&quot; from
          &quot;currently being explored — going back here means cycle.&quot; The GRAY state captures &quot;on the
          current root-to-leaf path,&quot; which is exactly what defines a cycle. For undirected graphs, a single
          visited[] is fine — but you have to skip the edge back to the parent to avoid false-positive 2-cycles.
        </Callout>

        <h3>Topological sort via DFS</h3>

        <CodeBlock lang="java">{`List<Integer> order = new ArrayList<>();

void topo(int u) {
    visited[u] = true;
    for (int v : adj.get(u)) {
        if (!visited[v]) topo(v);
    }
    order.add(u);              // post-order: u's dependencies are done now
}

// After running topo from every unvisited node:
Collections.reverse(order);    // post-order reversed = topological order`}</CodeBlock>

        <p>
          The reversal is the key insight: in post-order, dependencies are visited <em>before</em>{" "}the things that
          depend on them. So the natural post-order is &quot;leaves first&quot; — reverse it to get &quot;roots
          first,&quot; which is the topo order. Phase 4&apos;s next module covers the iterative alternative
          (Kahn&apos;s algorithm), which avoids recursion and reads more directly.
        </p>

        <Quiz
          kind="DFS check"
          question="In a directed graph, why does the visited[] array alone (without the GRAY state) fail to detect cycles?"
          options={[
            { label: "It doesn't fail — visited[] is sufficient.", explanation: "It is not. Two diamond-shape DAGs can have a node v reachable via two paths; the second time you see v as 'already visited' is NOT a cycle, just a re-encounter. visited[] can't tell the difference between 'on the current path' and 'finished long ago'." },
            { label: "Because visited[] doesn't distinguish 'currently on the recursion stack' from 'fully processed.' GRAY captures the on-the-stack state.", correct: true, explanation: "Right. A cycle is exactly an edge back to a node on the current root-to-leaf path. visited[] conflates that with 'finished from a different DFS branch,' so it reports false positives." },
            { label: "It only works for undirected graphs.", explanation: "Undirected cycle detection actually works with a single visited[] (with a small parent-skip tweak). Directed needs the three-color version." },
            { label: "Java's bool[] doesn't support three states.", explanation: "You'd use int[] with 0/1/2 for the three colors. The issue is conceptual, not language-level." },
          ]}
        />

        <ClassifyChallenge
          title="BFS or DFS?"
          prompt="For each problem, decide which traversal is the right default."
          buckets={[
            { id: "bfs", label: "BFS", color: "sky" },
            { id: "dfs", label: "DFS", color: "indigo" },
          ]}
          items={[
            { id: "1", label: "Find the shortest path between two nodes in an unweighted graph.", answer: "bfs", explanation: "Shortest = BFS. The level-order property gives shortest path 'for free' on the first encounter of the target." },
            { id: "2", label: "Count connected components in an undirected graph.", answer: "dfs", explanation: "DFS from each unvisited node, increment a counter. BFS would also work, but DFS is shorter and you don't care about distance." },
            { id: "3", label: "Detect a cycle in a directed graph.", answer: "dfs", explanation: "The three-color DFS captures the current root-to-leaf path naturally. BFS doesn't have an obvious 'on the current path' notion." },
            { id: "4", label: "Find the minimum number of moves to convert one word to another, changing one letter at a time.", answer: "bfs", explanation: "Word ladder. 'Minimum number of moves' = BFS over the graph where words are nodes and one-letter changes are edges." },
            { id: "5", label: "Topological sort of a DAG.", answer: "dfs", explanation: "Post-order DFS, then reverse. (Kahn's algorithm uses BFS — the next module covers it. Either works; DFS is the more compact recursion.)" },
            { id: "6", label: "Number of islands in a 2D grid.", answer: "dfs", explanation: "Connected components on a grid. DFS flood-fill is the textbook solution. BFS works equally well; DFS is just shorter." },
            { id: "7", label: "Time for all oranges in a grid to rot, where rot spreads from initially-rotten cells one step per minute.", answer: "bfs", explanation: "Multi-source BFS. 'How many minutes' = level-by-level expansion from all sources at once." },
            { id: "8", label: "Generate all permutations of [1, 2, 3].", answer: "dfs", explanation: "Backtracking — DFS over an implicit tree of partial permutations. Phase 6 territory, but the engine is plain DFS." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Grid pattern ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="grid" title="I can flood-fill a grid in my sleep" xp={25}>
      <section>
        <h2 id="grid">The grid pattern — connected components &amp; flood fill</h2>

        <p>
          Half of all graph problems on LeetCode are grid problems in disguise. They look like 2D-array problems —
          &quot;number of islands,&quot; &quot;flood fill,&quot; &quot;rotting oranges,&quot; &quot;walls and
          gates&quot; — but the underlying algorithm is BFS or DFS. Once you see the pattern, the code template is
          almost identical across them.
        </p>

        <Mermaid chart={grid} />

        <h3>The grid template</h3>

        <CodeBlock lang="java">{`int[][] DIRS = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};

int rows = grid.length, cols = grid[0].length;
boolean[][] visited = new boolean[rows][cols];

// Outer loop: find every unvisited start cell that matches the criteria
int components = 0;
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        if (grid[r][c] == '1' && !visited[r][c]) {
            components++;
            dfs(grid, r, c, visited);   // mark the whole component
        }
    }
}

void dfs(char[][] grid, int r, int c, boolean[][] visited) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (visited[r][c] || grid[r][c] != '1') return;
    visited[r][c] = true;
    for (int[] d : DIRS) {
        dfs(grid, r + d[0], c + d[1], visited);
    }
}`}</CodeBlock>

        <p>The structure is: <strong>outer scan finds component starts; inner DFS/BFS marks all cells in that component.</strong></p>

        <Callout variant="insight" title="Mutating the grid as the visited marker">
          A common space optimization: instead of allocating a separate <code>boolean[][] visited</code>, mark cells
          directly in the grid (e.g., flip <code>&apos;1&apos;</code> to <code>&apos;0&apos;</code> after visiting).
          Saves O(rows × cols) space. Costs: you mutate the input, which the problem may forbid, and your visited
          state is tangled with the value semantics. Mention it as a follow-up; default to <code>visited[][]</code>{" "}
          for clarity unless asked.
        </Callout>

        <h3>4-directional vs 8-directional</h3>

        <p>
          The <code>DIRS</code> array changes shape based on the problem. 4-directional (up/right/down/left) is
          standard. 8-directional includes diagonals, common in cellular-automaton problems and some maze variants.
        </p>

        <CodeBlock lang="java">{`int[][] DIRS_4 = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
int[][] DIRS_8 = {
    {-1, -1}, {-1, 0}, {-1, 1},
    { 0, -1},          { 0, 1},
    { 1, -1}, { 1, 0}, { 1, 1}
};`}</CodeBlock>

        <Callout variant="warn" title="The bounds-check ordering bug">
          Always bounds-check before accessing <code>grid[nr][nc]</code>. If you write{" "}
          <code>if (grid[nr][nc] == &apos;1&apos; &amp;&amp; nr &gt;= 0 ...)</code>, you get an
          ArrayIndexOutOfBoundsException whenever <code>nr</code> or <code>nc</code> goes negative. The correct order
          is bounds first, value second — short-circuit <code>&amp;&amp;</code> protects you.
        </Callout>

        <h3>Why grid problems disguise their graph nature</h3>

        <p>
          Three things hide the graph:
        </p>

        <ol>
          <li><strong>No explicit adjacency structure.</strong>{" "}Neighbors are implicit in the grid layout. Once you internalize the deltas pattern, this stops being a stumbling block.</li>
          <li><strong>The &quot;node&quot; is a coordinate, not an integer.</strong>{" "}You either pack it into a single int (<code>r * cols + c</code>) or pass it as <code>int[]</code> in the queue. Both work; coord-pack is faster and avoids per-cell allocations.</li>
          <li><strong>The traversal often modifies the grid.</strong>{" "}Flood fill literally rewrites cells. Number of islands counts components, which is just a side effect of the outer loop. The action is in <em>which cells you visit</em>, not in returning a path.</li>
        </ol>

        <p>
          Practice rewriting one or two grid solutions in &quot;explicit graph&quot; form (build a real adjacency
          list, label cells 0..rc-1) just once. After that, use the implicit form forever — but you&apos;ll know
          they&apos;re the same algorithm.
        </p>

        <Quiz
          kind="Grid check"
          question="In Number of Islands, you wrote `if (grid[nr][nc] == '1' && nr >= 0 && nr < rows && nc >= 0 && nc < cols)`. What's wrong?"
          options={[
            { label: "Nothing — the && short-circuits.", explanation: "&& does short-circuit, but only LEFT-TO-RIGHT. The leftmost expression `grid[nr][nc]` is evaluated first, BEFORE the bounds check. When nr is -1, you get ArrayIndexOutOfBoundsException immediately." },
            { label: "The bounds check has to come BEFORE the array access. Otherwise you index into a negative or too-large position before the check has a chance to filter it.", correct: true, explanation: "Right. Java evaluates left to right. `grid[-1][0]` throws AIOOBE before `nr >= 0` ever runs. Correct ordering: bounds first, value second." },
            { label: "You should use ||, not &&.", explanation: "&& is correct semantically — you want all conditions true. The bug is ordering, not the operator." },
            { label: "rows and cols should be swapped.", explanation: "rows is grid.length, cols is grid[0].length. The order matches grid[r][c] indexing, which is right." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="project" title="I solved Number of Islands, Clone Graph, and Rotting Oranges" xp={45} manual manualLabel="I solved all three LeetCode problems">
      <section>
        <h2 id="project">Project: Number of Islands + Clone Graph + Rotting Oranges</h2>

        <p>
          Three canonical problems, one for each pattern from this module. Solve all three; if any feels rough,
          re-read that section.
        </p>

        <h3>LC 200 · Number of Islands · DFS flood-fill</h3>

        <p>
          Given a 2D grid of &apos;1&apos;s (land) and &apos;0&apos;s (water), count the connected components of
          land. The textbook outer-scan + inner-DFS pattern.
        </p>

        <CodeBlock lang="java">{`public int numIslands(char[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') {
                count++;
                sink(grid, r, c);    // sink the entire island
            }
        }
    }
    return count;
}

void sink(char[][] grid, int r, int c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (grid[r][c] != '1') return;
    grid[r][c] = '0';                // mutate as the visited marker
    sink(grid, r - 1, c);
    sink(grid, r + 1, c);
    sink(grid, r, c - 1);
    sink(grid, r, c + 1);
}`}</CodeBlock>

        <h3>LC 133 · Clone Graph · BFS or DFS with a Map</h3>

        <p>
          Given a node in an undirected connected graph, return a deep copy. The trick is keeping a map from{" "}
          <em>original node → cloned node</em>{" "}so that when you encounter an already-cloned node, you reuse the clone
          instead of making a new one (which would create infinitely many copies through the cycles).
        </p>

        <CodeBlock lang="java">{`public Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> clones = new HashMap<>();
    clones.put(node, new Node(node.val));
    Deque<Node> queue = new ArrayDeque<>();
    queue.offer(node);

    while (!queue.isEmpty()) {
        Node cur = queue.poll();
        for (Node nb : cur.neighbors) {
            if (!clones.containsKey(nb)) {
                clones.put(nb, new Node(nb.val));
                queue.offer(nb);
            }
            clones.get(cur).neighbors.add(clones.get(nb));
        }
    }
    return clones.get(node);
}`}</CodeBlock>

        <Callout variant="insight" title="The map is the visited set">
          <code>clones.containsKey(nb)</code> doubles as the visited check. If we&apos;ve cloned a node, we&apos;ve
          seen it. This is a common pattern: when your bookkeeping data structure already encodes &quot;seen,&quot;
          don&apos;t add a redundant <code>visited</code> set.
        </Callout>

        <h3>LC 994 · Rotting Oranges · Multi-source BFS with levels</h3>

        <p>
          A grid of <code>0</code> (empty), <code>1</code> (fresh orange), <code>2</code> (rotten orange). Each minute,
          rot spreads to all 4-directionally adjacent fresh oranges. Return the minimum minutes until none are fresh,
          or -1 if some can never rot.
        </p>

        <CodeBlock lang="java">{`public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length;
    Deque<int[]> queue = new ArrayDeque<>();
    int fresh = 0;

    // Seed the queue with EVERY initially-rotten orange (multi-source).
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.offer(new int[]{r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    }
    if (fresh == 0) return 0;

    int[][] DIRS = {{-1, 0}, {0, 1}, {1, 0}, {0, -1}};
    int minutes = 0;
    while (!queue.isEmpty() && fresh > 0) {
        int sizeNow = queue.size();    // freeze the level
        for (int i = 0; i < sizeNow; i++) {
            int[] p = queue.poll();
            for (int[] d : DIRS) {
                int nr = p[0] + d[0], nc = p[1] + d[1];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                if (grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.offer(new int[]{nr, nc});
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`}</CodeBlock>

        <Callout variant="warn" title="Why we increment minutes only when something rotted">
          The <code>while</code> condition <code>fresh &gt; 0</code> stops us as soon as everything is rotten — we
          don&apos;t want one extra minute counted because the queue still has &quot;newly rotten this minute&quot;
          entries. The <code>fresh == 0</code> final check distinguishes &quot;all done&quot; from &quot;some
          unreachable.&quot; Both edge cases are interview gotchas.
        </Callout>

        <PartRecap
          title="Three problems, one engine"
          gist="Each of these is the same template wearing different costumes. Build the implicit graph (the grid, the Node objects, the multi-source seeded queue), pick BFS or DFS, walk it."
          points={[
            { takeaway: "Number of Islands: outer scan + inner flood-fill.", detail: "DFS, mutating the grid as the visited marker. Counter increments once per outer-loop discovery of an unvisited '1'." },
            { takeaway: "Clone Graph: BFS/DFS with a Map<original, clone>.", detail: "The map serves as both the visited set and the cycle-breaker. Iterate neighbors of the original; for each, ensure clone exists, then wire the clone's neighbor list." },
            { takeaway: "Rotting Oranges: multi-source BFS, level-by-level.", detail: "Seed queue with every initial source, freeze size each level, increment minutes per level. Track fresh count; -1 if any remain." },
            { takeaway: "Mutating the input is a real space optimization.", detail: "When the problem allows it, replacing visited[] with in-grid markers saves O(R*C) memory. Costs a tiny clarity hit; mention as a follow-up in interviews." },
            { takeaway: "BFS for distance/levels, DFS for connectivity/structure.", detail: "Number of Islands: DFS, no distance involved. Rotting Oranges: BFS, the question literally asks 'how many minutes.' Recognizing this on first reading is the whole skill." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="bfs-dfs" id="final" title="BFS and DFS are second nature" xp={25} celebration="Two traversals, dozens of problems. Up next: shortest path in weighted graphs (Dijkstra) and topological sort (Kahn's).">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="What's the time complexity of BFS or DFS on a graph with V nodes and E edges, using an adjacency list?"
          options={[
            { label: "O(V).", explanation: "You also examine each edge — that's the E in the answer." },
            { label: "O(E).", explanation: "Close, but isolated nodes still cost O(1) each. The right answer needs the V term." },
            { label: "O(V + E).", correct: true, explanation: "Right. Each node enters the frontier at most once (V), and each edge is examined at most twice (once from each endpoint, in undirected) — that's the E. Sum is linear in graph size. Both BFS and DFS achieve this." },
            { label: "O(V * E).", explanation: "That's quadratic-ish; you'd only see this if you redundantly traversed the whole graph from each node. Properly-marked BFS/DFS are linear." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You're given a directed graph and asked: 'Is there a cycle?' Your friend writes recursive DFS using a single boolean[] visited. Does it work?"
          options={[
            { label: "Yes — visited[] is enough for any cycle detection.", explanation: "It's enough for UNDIRECTED with a parent-skip. For DIRECTED, you can revisit a 'finished' node from a different branch and it is NOT a cycle. visited[] can't tell." },
            { label: "No — directed cycle detection needs three states (WHITE/GRAY/BLACK) to distinguish 'on current path' from 'fully done.'", correct: true, explanation: "Right. The cycle definition is 'edge back to a node on the current root-to-leaf path.' GRAY captures 'on the current path'; BLACK captures 'finished, irrelevant to cycles below.' visited[] conflates them and reports false positives." },
            { label: "It works only for connected graphs.", explanation: "Connectivity isn't the issue. The issue is that visited[] can't distinguish 'currently being explored' from 'already finished.'" },
            { label: "It works but has worse Big-O.", explanation: "Big-O is the same — both versions are O(V + E). The difference is correctness, not complexity." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In level-order BFS, what's the consequence of reading `queue.size()` inside the inner loop instead of snapshotting it once at the top?"
          options={[
            { label: "The traversal is wrong: nodes from level k+1 get processed in level k's batch, because they were added to the queue mid-iteration.", correct: true, explanation: "Right. queue.size() is dynamic — it grows when you offer neighbors. If you don't freeze it, the inner for-loop keeps going past the level boundary, and 'level k' silently absorbs level k+1. Distance counts and per-level sums are wrong." },
            { label: "It throws ConcurrentModificationException.", explanation: "Single-threaded modification through the queue's API is fine. The bug is logical." },
            { label: "It's fine; both work.", explanation: "It is not fine. The freeze is the entire mechanism that makes level-order work." },
            { label: "Performance degrades but correctness is preserved.", explanation: "Correctness is broken. Each iteration's snapshot is what defines a 'level' — without it, levels merge." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="One template, one swap. Queue → BFS → shortest path & levels. Stack (or recursion) → DFS → connectivity & structure. The bookkeeping is what differs across problems."
          points={[
            { takeaway: "Pick the traversal from one keyword.", detail: "'Shortest', 'minimum number of steps', 'fewest' → BFS. 'Reachable', 'how many components', 'cycle', 'topological' → DFS. When unsure, BFS is safer (always finds shortest path; never blows the stack)." },
            { takeaway: "Mark visited on enqueue, not on dequeue.", detail: "Otherwise duplicates pile up in the queue and per-node bookkeeping (like distance) gets clobbered. Same rule for both BFS and DFS." },
            { takeaway: "BFS levels need the queue.size() snapshot.", detail: "int sizeNow = queue.size(); then drain exactly that many. Without the freeze, levels merge — distance counts and per-level metrics break silently." },
            { takeaway: "Directed cycle detection needs three colors.", detail: "WHITE/GRAY/BLACK. Edge to GRAY = back edge = cycle. Two-color visited[] is fine for undirected (with a parent-skip), insufficient for directed." },
            { takeaway: "Grid problems are graph problems.", detail: "Cells are nodes, deltas are the implicit adjacency. Outer scan finds components; inner DFS/BFS walks each. Same code template across Number of Islands, Flood Fill, Walls and Gates, Rotting Oranges." },
          ]}
        />

        <div className="not-prose mt-8 mb-8 p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border border-sky-200 dark:border-sky-800/40">
          <p className="text-sm uppercase tracking-wider font-bold text-sky-700 dark:text-sky-300 mb-2">Up next · Module 16</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Shortest path &amp; topological sort</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            BFS solves shortest-path on unweighted graphs. For weighted graphs, you need Dijkstra. For ordering tasks
            with dependencies, you need topological sort — and Kahn&apos;s algorithm gives you a slick BFS-based
            version that doubles as cycle detection.
          </p>
          <Link
            href="/courses/dsa/modules/shortest-path"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Shortest path →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="bfs-dfs" />
    </article>
  );
}
