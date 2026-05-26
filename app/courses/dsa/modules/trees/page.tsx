import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "setup", title: "Tree terminology and the recursive shape" },
  { id: "node", title: "The TreeNode class and how trees live in memory" },
  { id: "dfs", title: "DFS: preorder, inorder, postorder" },
  { id: "bfs", title: "BFS: level-order traversal" },
  { id: "project", title: "Project: tree builder + traversals + LeetCode" },
  { id: "final", title: "Final quiz" },
];

export default function TreesModule() {
  const mod = getModuleBySlug("trees")!;

  // The canonical labelled tree we'll use throughout the module.
  const exampleTree = `
flowchart TB
    A((1)) --> B((2))
    A --> C((3))
    B --> D((4))
    B --> E((5))
    C --> F((6))
    C --> G((7))
    style A fill:#10b981,color:#fff,stroke:#047857
    style B fill:#fbbf24,color:#000,stroke:#d97706
    style C fill:#fbbf24,color:#000,stroke:#d97706
    style D fill:#a3e635,color:#000,stroke:#65a30d
    style E fill:#a3e635,color:#000,stroke:#65a30d
    style F fill:#a3e635,color:#000,stroke:#65a30d
    style G fill:#a3e635,color:#000,stroke:#65a30d
  `.trim();

  // The three DFS orders, side by side.
  const dfsOrders = `
flowchart LR
    subgraph PRE["Preorder: 1 2 4 5 3 6 7"]
        direction TB
        P0(("1")):::pre1 --> P1(("2")):::pre2
        P0 --> P2(("3")):::pre5
        P1 --> P3(("4")):::pre3
        P1 --> P4(("5")):::pre4
        P2 --> P5(("6")):::pre6
        P2 --> P6(("7")):::pre7
    end
    subgraph IN["Inorder: 4 2 5 1 6 3 7"]
        direction TB
        I0(("1")):::in4 --> I1(("2")):::in2
        I0 --> I2(("3")):::in6
        I1 --> I3(("4")):::in1
        I1 --> I4(("5")):::in3
        I2 --> I5(("6")):::in5
        I2 --> I6(("7")):::in7
    end
    subgraph POST["Postorder: 4 5 2 6 7 3 1"]
        direction TB
        O0(("1")):::post7 --> O1(("2")):::post3
        O0 --> O2(("3")):::post6
        O1 --> O3(("4")):::post1
        O1 --> O4(("5")):::post2
        O2 --> O5(("6")):::post4
        O2 --> O6(("7")):::post5
    end
    classDef pre1 fill:#10b981,color:#fff
    classDef pre2 fill:#34d399,color:#000
    classDef pre3 fill:#6ee7b7,color:#000
    classDef pre4 fill:#a7f3d0,color:#000
    classDef pre5 fill:#34d399,color:#000
    classDef pre6 fill:#6ee7b7,color:#000
    classDef pre7 fill:#a7f3d0,color:#000
    classDef in1 fill:#10b981,color:#fff
    classDef in2 fill:#34d399,color:#000
    classDef in3 fill:#6ee7b7,color:#000
    classDef in4 fill:#a7f3d0,color:#000
    classDef in5 fill:#6ee7b7,color:#000
    classDef in6 fill:#34d399,color:#000
    classDef in7 fill:#a7f3d0,color:#000
    classDef post1 fill:#10b981,color:#fff
    classDef post2 fill:#34d399,color:#000
    classDef post3 fill:#6ee7b7,color:#000
    classDef post4 fill:#a7f3d0,color:#000
    classDef post5 fill:#6ee7b7,color:#000
    classDef post6 fill:#34d399,color:#000
    classDef post7 fill:#a7f3d0,color:#000
  `.trim();

  // BFS visits level by level.
  const bfsLevels = `
flowchart TB
    subgraph L0["Level 0"]
        A((1))
    end
    subgraph L1["Level 1"]
        B((2))
        C((3))
    end
    subgraph L2["Level 2"]
        D((4))
        E((5))
        F((6))
        G((7))
    end
    A --> B
    A --> C
    B --> D
    B --> E
    C --> F
    C --> G
    style L0 fill:#10b981,color:#fff,stroke:#047857
    style L1 fill:#fbbf24,color:#000,stroke:#d97706
    style L2 fill:#a3e635,color:#000,stroke:#65a30d
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="trees" />
      <ModuleProgress moduleSlug="trees" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-3 block w-fit rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
          Module {mod.number} · {mod.phase}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
      </div>

      {/* ───────────────── Part 1 · Tree terminology ───────────────── */}
      <Checkpoint moduleSlug="trees" id="setup" title="I know the tree vocabulary" xp={10} celebration="Trees are linked lists that branch. Recursion is their native language.">
      <section>
        <h2 id="setup">Trees: linked lists that branch</h2>

        <p>
          Linked lists from Module 7 had nodes with a single <code>next</code> pointer. Replace <code>next</code>{" "}
          with two pointers — <code>left</code> and <code>right</code> — and you have a <strong>binary tree</strong>.
          Generalize to any number of children and you have a tree. That&apos;s it. The data structure isn&apos;t
          new; the <em>shape</em>{" "}is.
        </p>

        <Mermaid chart={exampleTree} />
        <p className="-mt-2 mb-6 text-center text-xs text-slate-500 italic">
          The example we&apos;ll use throughout: a perfect binary tree of 7 nodes. Root green, internals amber, leaves lime.
        </p>

        <h3>The vocabulary you&apos;ll need (no more)</h3>

        <ul>
          <li><strong>Node:</strong>{" "}a value plus pointers to its children.</li>
          <li><strong>Root:</strong>{" "}the single node with no parent. Trees have exactly one.</li>
          <li><strong>Leaf:</strong>{" "}a node with no children.</li>
          <li><strong>Parent / child:</strong>{" "}obvious. Each non-root node has exactly one parent.</li>
          <li><strong>Sibling:</strong>{" "}nodes that share a parent.</li>
          <li><strong>Subtree:</strong>{" "}a node together with all its descendants. Pick any node and the structure rooted at it is itself a tree.</li>
          <li><strong>Depth of a node:</strong>{" "}distance from the root. Root is at depth 0.</li>
          <li><strong>Height of a tree:</strong>{" "}the depth of the deepest leaf. A single-node tree has height 0.</li>
          <li><strong>Level:</strong>{" "}the set of all nodes at a given depth.</li>
        </ul>

        <Callout variant="info" title="Binary tree, complete tree, full tree, perfect tree">
          These four words get muddled. <strong>Binary</strong>: at most 2 children per node.{" "}
          <strong>Full</strong>: every internal node has exactly 0 or 2 children — never just one.{" "}
          <strong>Complete</strong>: every level is full <em>except possibly the last</em>, which is filled
          left-to-right (this is the heap shape, Module 15). <strong>Perfect</strong>: full and all leaves at the
          same depth — that&apos;s the diagram above. Most interview problems just say &quot;binary tree&quot; and
          mean &quot;arbitrary, possibly unbalanced.&quot;
        </Callout>

        <h3>Why trees show up everywhere</h3>

        <ul>
          <li><strong>File systems</strong> — directories contain files and other directories.</li>
          <li><strong>The DOM</strong> — every web page is a tree of HTML elements.</li>
          <li><strong>Expression parsers</strong> — <code>(2 + 3) * 4</code> is naturally an AST: a tree of operators with operands as leaves.</li>
          <li><strong>Decision processes</strong> — game trees, classification trees, dependency resolution.</li>
          <li><strong>Search structures</strong> — BSTs (Module 14), heaps (Module 15), tries (Module 37) are all trees underneath.</li>
        </ul>

        <p>
          The unifying observation: trees are how we model <strong>hierarchies</strong>. If your problem has a
          containment or parent-of relationship, it probably has a tree.
        </p>

        <h3>The recursive definition (this is the most important sentence in the module)</h3>

        <p>
          A binary tree is either:
        </p>
        <ul>
          <li><strong>Empty</strong> (the <code>null</code> tree), or</li>
          <li>A <strong>root node</strong>{" "}holding a value plus <em>two more binary trees</em> (the left and right subtrees).</li>
        </ul>

        <p>
          That&apos;s a recursive definition, and it&apos;s why almost every tree algorithm is recursive too. The
          algorithm mirrors the data: handle the empty case, handle the root, recurse on the two subtrees. We&apos;ll
          do this six times in this module and it&apos;ll start to feel automatic.
        </p>

        <Quiz
          question="A binary tree has 15 nodes and is a perfect binary tree. What's its height?"
          options={[
            { label: "15.", explanation: "That's the node count, not the height." },
            { label: "4.", explanation: "Height 4 would mean up to 2^5 - 1 = 31 nodes, more than 15." },
            { label: "3.", correct: true, explanation: "Right. A perfect binary tree of height h has exactly 2^(h+1) - 1 nodes. 2^4 - 1 = 15, so h = 3. Levels at depths 0, 1, 2, 3 — the root and three more levels." },
            { label: "log₂(15) ≈ 3.9.", explanation: "Close in spirit, but height is an integer. The exact answer is floor(log₂(15)) = 3." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · TreeNode ───────────────── */}
      <Checkpoint moduleSlug="trees" id="node" title="I can write the TreeNode class" xp={10} celebration="Three fields, one constructor. The recursive structure is in the type itself.">
      <section>
        <h2 id="node">The <code>TreeNode</code> class</h2>

        <p>
          The standard binary-tree node is three lines of fields. You&apos;ll see this exact shape on basically
          every tree problem on LeetCode:
        </p>

        <CodeBlock lang="java">{`public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}`}</CodeBlock>

        <p>
          The recursive shape is encoded in the type: <code>TreeNode</code> contains two more <code>TreeNode</code>{" "}
          references. <code>null</code> represents the empty subtree. There&apos;s no explicit &quot;tree&quot;
          object — the whole tree is just whatever&apos;s reachable from the root pointer.
        </p>

        <h3>Building a tree by hand</h3>

        <CodeBlock lang="java">{`// The example tree from the diagram, hand-wired:
TreeNode root = new TreeNode(1,
    new TreeNode(2,
        new TreeNode(4),
        new TreeNode(5)),
    new TreeNode(3,
        new TreeNode(6),
        new TreeNode(7)));`}</CodeBlock>

        <p>
          Verbose, but explicit. In real code you&apos;d build trees from data — a level-order array, parsed
          input, etc. — but for understanding, hand-wiring is clearest.
        </p>

        <h3>Where trees actually live in memory</h3>

        <p>
          Each <code>TreeNode</code> is a separate heap allocation. The tree isn&apos;t a contiguous block — it&apos;s
          a graph of pointer-linked objects. Two consequences:
        </p>

        <ul>
          <li>
            <strong>Cache behavior is unpredictable.</strong>{" "}Walking a tree dereferences pointers all over the
            heap. Compare with a heap stored in an array (Module 15), where cache prefetching helps.
          </li>
          <li>
            <strong>Recursion costs stack space.</strong>{" "}A tree of height h takes O(h) stack frames during a
            recursive traversal. For a balanced tree of n nodes, that&apos;s O(log n). For a degenerate
            &quot;list-tree&quot; (every node has one child), it&apos;s O(n) — and a 10,000-node skewed tree
            blows the JVM stack.
          </li>
        </ul>

        <Callout variant="warn" title="The skewed-tree stack overflow">
          On LeetCode, the canonical recursion solution to most tree problems passes — until a stress test hands
          you a tree that&apos;s really a long chain. Inserts into a BST without balancing (Module 14) produce
          this if input is sorted. The fix: either guarantee balance, or use an iterative traversal with an
          explicit <code>Deque</code>. We&apos;ll show both.
        </Callout>

        <h3>Common helpers you&apos;ll keep writing</h3>

        <CodeBlock lang="java">{`// Count of nodes — recursive shape mirrors the data.
int size(TreeNode root) {
    if (root == null) return 0;                            // base case
    return 1 + size(root.left) + size(root.right);         // recurse
}

// Height (a.k.a. max depth).
int height(TreeNode root) {
    if (root == null) return -1;                           // empty has height -1
    return 1 + Math.max(height(root.left), height(root.right));
}

// Is the tree balanced? (Each subtree's heights differ by at most 1.)
boolean isBalanced(TreeNode root) {
    return checkBalanced(root) != -2;
}
private int checkBalanced(TreeNode n) {
    if (n == null) return -1;
    int lh = checkBalanced(n.left);
    if (lh == -2) return -2;
    int rh = checkBalanced(n.right);
    if (rh == -2) return -2;
    if (Math.abs(lh - rh) > 1) return -2;                  // sentinel = "unbalanced"
    return 1 + Math.max(lh, rh);
}`}</CodeBlock>

        <p>
          Notice the pattern: each function&apos;s body is one base case (empty tree) and one recursive case (combine
          the answers from the subtrees). This is the recursion contract from Module 27, applied to trees. Trees
          are the cleanest place to learn it because the structure does most of the thinking for you.
        </p>

        <Quiz
          question="What's `height(null)` in the code above, and why does it return -1 instead of 0?"
          options={[
            { label: "Returns 0 — an empty tree has height 0.", explanation: "Definitional choice. We picked -1 so the recursive formula 1 + max(left, right) gives 0 for a single node, matching the 'leaves at depth 0' convention." },
            { label: "Returns -1, so that a single-node tree (null children) computes to height 0 via 1 + max(-1, -1) = 0.", correct: true, explanation: "Right. The -1 sentinel is exactly so the recursion arithmetic works out for the leaf case. Some textbooks flip the convention to 'leaves have height 1, null is height 0' — same algorithm, off-by-one different. The convention matters less than picking one and being consistent." },
            { label: "Throws NullPointerException.", explanation: "We explicitly handle null at the top of the function." },
            { label: "Returns Integer.MIN_VALUE as a sentinel.", explanation: "Just -1. Sentinels work for the balance check (where -2 means 'unbalanced'), but for plain height we just need the base case to compose correctly." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · DFS traversals ───────────────── */}
      <Checkpoint moduleSlug="trees" id="dfs" title="I can do all three DFS orders by hand" xp={15} celebration="Preorder, inorder, postorder. Same recursion, three positions for the print.">
      <section>
        <h2 id="dfs">Depth-first traversal: three orders, one recursion</h2>

        <p>
          A <strong>traversal</strong>{" "}visits every node in some order. Depth-first traversals dive deep before
          backtracking. There are three standard orderings — preorder, inorder, postorder — and they differ only
          in <em>where you do the work</em>{" "}relative to the recursive calls.
        </p>

        <CodeBlock lang="java">{`void preorder(TreeNode n) {
    if (n == null) return;
    visit(n);                  // ← work here
    preorder(n.left);
    preorder(n.right);
}

void inorder(TreeNode n) {
    if (n == null) return;
    inorder(n.left);
    visit(n);                  // ← work here
    inorder(n.right);
}

void postorder(TreeNode n) {
    if (n == null) return;
    postorder(n.left);
    postorder(n.right);
    visit(n);                  // ← work here
}`}</CodeBlock>

        <Mermaid chart={dfsOrders} />
        <p className="-mt-2 mb-6 text-center text-xs text-slate-500 italic">
          On the example tree, the three DFS orders produce different node sequences. Greener = visited earlier.
        </p>

        <h3>When each order is the right choice</h3>

        <ul>
          <li>
            <strong>Preorder</strong> — process the node before its subtrees. Use when you need parent context
            before children: <em>cloning a tree</em>, <em>serializing</em>, computing depth-aware values.
          </li>
          <li>
            <strong>Inorder</strong> — left, node, right. <strong>This is the magic one for BSTs:</strong>{" "}
            inorder traversal of a BST yields nodes in sorted order. We&apos;ll lean on this hard in Module 14.
          </li>
          <li>
            <strong>Postorder</strong> — process the node after its subtrees. Use when you need to combine child
            results: <em>computing height</em>, <em>summing subtree values</em>, <em>deleting a tree safely</em>{" "}
            (children freed before parent).
          </li>
        </ul>

        <h3>Iterative DFS with an explicit stack</h3>

        <p>
          Recursion is elegant but consumes the JVM call stack. For deep or adversarial trees, you may want an
          iterative version. The trick is to maintain a <code>Deque&lt;TreeNode&gt;</code> as your own stack — same
          structure as the call stack, just on the heap where it&apos;s allowed to grow:
        </p>

        <CodeBlock lang="java">{`List<Integer> preorderIterative(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;

    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode n = stack.pop();
        out.add(n.val);                       // visit
        // Push right first, so left is processed first (stack is LIFO).
        if (n.right != null) stack.push(n.right);
        if (n.left  != null) stack.push(n.left);
    }
    return out;
}`}</CodeBlock>

        <p>
          That&apos;s preorder. Inorder iterative is fiddlier (you have to push left-spines and pop-process-go-right);
          postorder iterative is famously the trickiest of the three. The recursive versions are cleaner; only
          reach for iterative when stack depth is a real concern.
        </p>

        <h3>The complexity, once and for all</h3>

        <ul>
          <li><strong>Time:</strong>{" "}O(n) for any traversal — every node visited exactly once.</li>
          <li><strong>Space:</strong>{" "}O(h) for recursion stack (or explicit stack), where h is tree height. O(log n) for balanced, O(n) worst case.</li>
        </ul>

        <ClassifyChallenge
          title="Which traversal solves the problem?"
          prompt="Pick the traversal order that's the natural fit for each task on a binary tree."
          buckets={[
            { id: "pre", label: "Preorder (root → L → R)", color: "emerald" },
            { id: "in", label: "Inorder (L → root → R)", color: "amber" },
            { id: "post", label: "Postorder (L → R → root)", color: "indigo" },
            { id: "level", label: "Level-order (BFS)", color: "sky" },
          ]}
          items={[
            { id: "clone", label: "Clone a binary tree, allocating each new node before its children.", answer: "pre", explanation: "Need the parent created before its subtrees so you can attach. Preorder allocates the new node, then recurses." },
            { id: "bstSorted", label: "Print a BST's keys in sorted order.", answer: "in", explanation: "The BST invariant is L < root < R. Inorder visits in exactly that order, yielding sorted output." },
            { id: "treeHeight", label: "Compute the tree's height.", answer: "post", explanation: "You need both children's heights before you can decide your own. Postorder combines child results into the parent's." },
            { id: "deleteAll", label: "Free every node in a manual tree (no GC).", answer: "post", explanation: "Free children before parent — otherwise you'd be reading freed pointers. Postorder is the canonical safe-delete order." },
            { id: "levelLabels", label: "Print each level on its own line.", answer: "level", explanation: "DFS doesn't naturally group by level. BFS visits level 0, then level 1, etc. Use a queue and track level boundaries." },
            { id: "expressionEval", label: "Evaluate an expression tree where leaves are numbers and internal nodes are operators.", answer: "post", explanation: "Compute the children's values first, then apply the operator. Postorder by definition." },
            { id: "rightView", label: "Find the rightmost node visible at each level.", answer: "level", explanation: "Visible-at-each-level is a level-order question. BFS, take the last node at each level." },
            { id: "serialize", label: "Serialize a tree to a string and deserialize back, including null markers.", answer: "pre", explanation: "Preorder with explicit null markers is the standard. Reading the stream back, the first token is always the root, then its left subtree, then right — perfectly recursive." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · BFS ───────────────── */}
      <Checkpoint moduleSlug="trees" id="bfs" title="I can write level-order traversal" xp={15} celebration="Queue + 'process the level by size' = the BFS template you'll reuse on graphs.">
      <section>
        <h2 id="bfs">Breadth-first: level by level</h2>

        <p>
          Sometimes the question is &quot;what&apos;s at each level?&quot; — leftmost, rightmost, average value,
          maximum. DFS doesn&apos;t naturally answer that; BFS does. <strong>Breadth-first traversal</strong>{" "}
          visits all nodes at depth 0, then all at depth 1, then all at depth 2, and so on.
        </p>

        <Mermaid chart={bfsLevels} />
        <p className="-mt-2 mb-6 text-center text-xs text-slate-500 italic">
          BFS visits the root, then both children, then all grandchildren. Level by level.
        </p>

        <p>
          The data structure for BFS is a <strong>queue</strong> (Module 9). Enqueue the root; while the queue is
          non-empty, dequeue, visit, enqueue children. The queue holds &quot;the frontier&quot; — nodes seen but
          not yet processed.
        </p>

        <CodeBlock lang="java">{`List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size();           // freeze the level boundary
        List<Integer> level = new ArrayList<>(levelSize);
        for (int i = 0; i < levelSize; i++) {
            TreeNode n = queue.poll();
            level.add(n.val);
            if (n.left  != null) queue.offer(n.left);
            if (n.right != null) queue.offer(n.right);
        }
        result.add(level);
    }
    return result;
}`}</CodeBlock>

        <Callout variant="info" title="The 'freeze level size' trick">
          The line <code>int levelSize = queue.size()</code> at the top of the outer loop is the only thing that
          separates &quot;BFS&quot; from &quot;BFS that knows about levels.&quot; You snapshot the queue size, then
          process exactly that many nodes — those are this level. Anything you enqueue inside the inner loop is
          on the next level and won&apos;t be touched until the next outer iteration. This template carries straight
          into Phase 4&apos;s graph BFS.
        </Callout>

        <h3>BFS as &quot;shortest path in an unweighted tree&quot;</h3>

        <p>
          BFS explores by distance. The first time you reach a node from the root, you&apos;ve reached it via the
          shortest path (counting edges). On a tree there&apos;s only one path so this is trivial; on a graph
          (Phase 4) it&apos;s a fundamental result. Either way, BFS = shortest-path machine for unweighted edges.
        </p>

        <h3>Complexity</h3>

        <ul>
          <li><strong>Time:</strong>{" "}O(n) — each node enqueued and dequeued exactly once.</li>
          <li><strong>Space:</strong>{" "}O(w) where w is the maximum width of the tree — the queue can hold a whole level. For a perfect binary tree of n nodes, the bottom level has ~n/2 nodes, so worst-case BFS space is O(n).</li>
        </ul>

        <p>
          Compare to DFS, where space is O(h). For balanced trees they&apos;re both O(log n). For wide-and-shallow
          trees, DFS wins on space. For tall-and-skinny trees, BFS wins. Most real trees are roughly balanced and
          it doesn&apos;t matter.
        </p>

        <PartRecap
          title="Part 4 recap"
          gist="DFS uses the call stack (or your own); BFS uses a queue. Each picks the right shape of question."
          points={[
            { takeaway: "DFS is recursion's natural shape; BFS needs an explicit queue.", detail: "DFS recursion threads through the call stack. BFS isn't naturally recursive — you'd need a queue regardless, so write the iterative loop." },
            { takeaway: "The 'freeze queue.size()' trick is what gives BFS access to levels.", detail: "Without it, BFS just gives you a flat order. With it, you can answer per-level questions: rightmost node, level averages, deepest left leaf." },
            { takeaway: "Time is O(n) for both; space differs by tree shape.", detail: "DFS space is O(height). BFS space is O(max width). Balanced: both O(log n). Skewed: DFS O(n), BFS O(1). Wide/shallow: BFS up to O(n)." },
            { takeaway: "BFS is your ticket to graphs.", detail: "Phase 4's graph BFS is exactly this template plus a 'visited' set. You'll see this loop again." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="trees" id="project" title="I built the traversal visualizer and solved the warm-ups" xp={20} manual manualLabel="Project & LeetCode complete" celebration="Recursive thinking on trees should now feel automatic.">
      <section>
        <h2 id="project">Project: tree builder + traversal visualizer + LeetCode warm-ups</h2>

        <h3>Part A — Build a tree from a level-order array</h3>

        <p>
          LeetCode serializes trees as level-order arrays with <code>null</code> for missing nodes. Implement the
          deserializer; it&apos;s a useful exercise in BFS thinking and you&apos;ll appreciate it every time you
          want to test a tree problem locally.
        </p>

        <CodeBlock lang="java">{`/**
 * Build a binary tree from a level-order array.
 * E.g. [1, 2, 3, null, null, 4, 5] ↦
 *
 *         1
 *        / \\
 *       2   3
 *          / \\
 *         4   5
 */
public static TreeNode fromLevelOrder(Integer[] data) {
    if (data == null || data.length == 0 || data[0] == null) return null;
    TreeNode root = new TreeNode(data[0]);
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);

    int i = 1;
    while (!queue.isEmpty() && i < data.length) {
        TreeNode parent = queue.poll();
        // Left child
        if (i < data.length && data[i] != null) {
            parent.left = new TreeNode(data[i]);
            queue.offer(parent.left);
        }
        i++;
        // Right child
        if (i < data.length && data[i] != null) {
            parent.right = new TreeNode(data[i]);
            queue.offer(parent.right);
        }
        i++;
    }
    return root;
}`}</CodeBlock>

        <p>
          Build the four traversals (preorder, inorder, postorder, level-order), each as a List&lt;Integer&gt;
          producer. Then write a small test that prints all four for the example tree and confirms the orders
          match what the diagrams predicted.
        </p>

        <h3>Part B — LeetCode warm-ups</h3>

        <ol>
          <li>
            <strong>LC 104 · Maximum Depth of Binary Tree</strong> (Easy). The <code>height</code> function from
            Part 2, with the convention &quot;empty tree has depth 0&quot; (so add 1 to the leaf case). Two lines
            recursive.
          </li>
          <li>
            <strong>LC 100 · Same Tree</strong> (Easy). Two trees are equal iff both empty, or both non-empty with
            equal values <em>and</em>{" "}equal left subtrees <em>and</em>{" "}equal right subtrees. Pure recursion-on-pairs.
          </li>
          <li>
            <strong>LC 226 · Invert Binary Tree</strong> (Easy). For each node, swap left and right pointers, then
            recurse into both. The 4-line solution that famously crashed an interview at a big tech company —
            now go write it without crashing.
          </li>
          <li>
            <strong>LC 102 · Binary Tree Level Order Traversal</strong> (Medium). The level-order template from
            Part 4, returning a List&lt;List&lt;Integer&gt;&gt;.
          </li>
        </ol>

        <Callout variant="insight" title="The reflex to build">
          Almost every binary-tree problem follows: (1) base case for null, (2) recurse on left and right, (3)
          combine. You&apos;ll write this skeleton dozens of times. Don&apos;t fight it — that&apos;s the shape
          of the data.
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final quiz ───────────────── */}
      <Checkpoint moduleSlug="trees" id="final" title="I've completed Module 13" xp={20} celebration="Trees and traversals locked in. Module 14 sharpens the tree into a search structure.">
      <section>
        <h2 id="final">Final check</h2>

        <Quiz
          question="A binary tree of n nodes is degenerate (every node has only one child — a 'list-tree'). What's the time and space cost of a recursive in-order traversal?"
          options={[
            { label: "O(n) time, O(log n) space.", explanation: "O(log n) recursion depth assumes balance. A degenerate tree's height is n, not log n." },
            { label: "O(n) time, O(n) space — the recursion stack reaches depth n and may blow up.", correct: true, explanation: "Right. Time is still O(n) — every node is visited once. But recursion depth equals tree height, which is n in a list-tree. That O(n) call-stack space is what blows up the JVM on a 10,000-node skewed tree. The fix is balancing (Module 14) or iterative traversal." },
            { label: "O(n²) time, O(n) space.", explanation: "Each node is visited exactly once; no work is repeated." },
            { label: "O(n log n) time, O(n) space.", explanation: "Same: each node is one constant-work visit." },
          ]}
        />

        <Quiz
          question="You want to print a binary tree's nodes such that the value at each node appears AFTER the values of all its descendants. Which traversal?"
          options={[
            { label: "Preorder.", explanation: "Preorder prints the root before its subtrees — the opposite." },
            { label: "Inorder.", explanation: "Inorder interleaves the root between left and right subtrees, not after both." },
            { label: "Postorder.", correct: true, explanation: "Right. Postorder is L → R → root, which is exactly 'process the node after all descendants.' Standard use cases: tree height, subtree-sum, safe-delete." },
            { label: "Level-order.", explanation: "Level-order prints by depth, not by 'after descendants.' Root comes first, descendants come after." },
          ]}
        />

        <Quiz
          question="In the BFS template `int levelSize = queue.size(); for (int i = 0; i < levelSize; i++) { ... queue.offer(child) ... }` — why is the levelSize variable necessary?"
          options={[
            { label: "Performance — caching the size avoids recomputing it.", explanation: "queue.size() is O(1) on ArrayDeque; perf isn't the issue." },
            { label: "Correctness — without it, the inner loop would also process children we just enqueued, blurring the level boundary.", correct: true, explanation: "Right. queue.size() at the top of the outer loop is the count of THIS level's nodes. Inside the inner loop we enqueue NEXT level's nodes. If we used queue.size() inside the loop condition, we'd consume both levels in one iteration, losing the level structure." },
            { label: "Thread safety — snapshotting protects against concurrent modification.", explanation: "Plain BFS is single-threaded. Concurrency doesn't enter into it." },
            { label: "Readability — the variable name documents the loop intent.", explanation: "True bonus, but the primary reason is correctness, not style." },
          ]}
        />

        <div className="my-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-8 text-white shadow-xl">
          <h3 className="mt-0 mb-2 text-2xl font-bold text-white">Module 13 complete</h3>
          <p className="mb-4 text-emerald-50">
            Trees and traversals are the foundation for the rest of Phase 3 — and most of Phase 4. Next module:
            BSTs, where we layer an ordering invariant on top of this structure and unlock O(log n) search.
          </p>
          <Link
            href="/courses/dsa/modules/bst"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 no-underline shadow-md transition hover:shadow-lg"
          >
            Next: BSTs &amp; balanced trees →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="trees" />
    </article>
  );
}
