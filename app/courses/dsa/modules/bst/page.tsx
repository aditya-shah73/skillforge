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
  { id: "setup", title: "The BST invariant — what makes it a 'search' tree" },
  { id: "ops", title: "Search, insert, delete by hand" },
  { id: "balance", title: "Why unbalanced BSTs degrade — and what AVL/Red-Black do" },
  { id: "treemap", title: "Java's TreeMap & TreeSet (red-black trees)" },
  { id: "project", title: "Project: BST from scratch + LeetCode" },
  { id: "final", title: "Final quiz" },
];

export default function BstModule() {
  const mod = getModuleBySlug("bst")!;

  // A correctly built BST.
  const validBst = `
flowchart TB
    A((8)) --> B((3))
    A --> C((10))
    B --> D((1))
    B --> E((6))
    C --> F((9))
    C --> G((14))
    E --> H((4))
    E --> I((7))
    style A fill:#10b981,color:#fff,stroke:#047857
    style B fill:#fbbf24,color:#000,stroke:#d97706
    style C fill:#fbbf24,color:#000,stroke:#d97706
    style D fill:#a3e635,color:#000,stroke:#65a30d
    style E fill:#a3e635,color:#000,stroke:#65a30d
    style F fill:#a3e635,color:#000,stroke:#65a30d
    style G fill:#a3e635,color:#000,stroke:#65a30d
    style H fill:#bef264,color:#000,stroke:#65a30d
    style I fill:#bef264,color:#000,stroke:#65a30d
  `.trim();

  // The skewed tree you get from inserting sorted input.
  const skewedBst = `
flowchart TB
    A((1)) --> NL[" "]
    A --> B((2))
    B --> NL2[" "]
    B --> C((3))
    C --> NL3[" "]
    C --> D((4))
    D --> NL4[" "]
    D --> E((5))
    style A fill:#ef4444,color:#fff,stroke:#b91c1c
    style B fill:#ef4444,color:#fff,stroke:#b91c1c
    style C fill:#ef4444,color:#fff,stroke:#b91c1c
    style D fill:#ef4444,color:#fff,stroke:#b91c1c
    style E fill:#ef4444,color:#fff,stroke:#b91c1c
    style NL fill:none,stroke:none,color:#94a3b8
    style NL2 fill:none,stroke:none,color:#94a3b8
    style NL3 fill:none,stroke:none,color:#94a3b8
    style NL4 fill:none,stroke:none,color:#94a3b8
  `.trim();

  // The three delete cases.
  const deleteCases = `
flowchart LR
    subgraph C1["Case 1: leaf"]
        direction TB
        A1((parent)) --> B1((target<br/>no kids))
        A1 -. detach .-> X1((null))
    end
    subgraph C2["Case 2: one child"]
        direction TB
        A2((parent)) --> B2((target))
        B2 --> C2c((child))
        A2 -. promote .-> C2c
    end
    subgraph C3["Case 3: two children"]
        direction TB
        A3((parent)) --> B3((target))
        B3 --> L3((left))
        B3 --> R3((right))
        R3 --> S3((successor))
        B3 -. copy<br/>successor's value .-> B3v((target=succ.val))
        S3 -. then delete<br/>successor .-> X3((•))
    end
    style C1 fill:#dcfce7,color:#000,stroke:#15803d
    style C2 fill:#fef3c7,color:#000,stroke:#d97706
    style C3 fill:#fee2e2,color:#000,stroke:#b91c1c
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="bst" />
      <ModuleProgress moduleSlug="bst" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-3 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold tracking-wide uppercase">
          Module {mod.number} · {mod.phase}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
      </div>

      {/* ───────────────── Part 1 · BST invariant ───────────────── */}
      <Checkpoint moduleSlug="bst" id="setup" title="I can state the BST invariant precisely" xp={10} celebration="Every node bigger than everything in its left subtree, smaller than everything in its right.">
      <section>
        <h2 id="setup">The BST: an ordering invariant on top of a binary tree</h2>

        <p>
          A <strong>binary search tree</strong>{" "}is a binary tree (Module 11) with one additional rule:
        </p>

        <Callout variant="insight" title="The BST invariant">
          For every node <code>x</code>: every key in <code>x.left</code>&apos;s subtree is &lt; <code>x.key</code>,
          and every key in <code>x.right</code>&apos;s subtree is &gt; <code>x.key</code>. Recursively, the same
          holds for every subtree.
        </Callout>

        <p>
          That&apos;s it. The data structure is the same — nodes with left and right pointers — but now you can
          <strong> binary-search</strong>{" "}for a key by walking down. Smaller? Go left. Bigger? Go right. Equal?
          Found it.
        </p>

        <Mermaid chart={validBst} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          A valid BST. Left subtree of 8 contains only keys &lt; 8. Right subtree contains only keys &gt; 8. Same recursively at every node.
        </p>

        <h3>The big payoff: O(log n) operations… if balanced</h3>

        <p>
          For a balanced BST of n nodes, the height is O(log n). Every search, insert, or delete walks one
          root-to-leaf path, so they&apos;re all O(log n). That&apos;s strictly better than the O(n) you&apos;d
          pay scanning a linked list, and unlike a sorted array, inserts don&apos;t require shifting elements.
        </p>

        <p>
          But notice the &quot;if balanced.&quot; A pathological BST can degenerate to a list. We&apos;ll come
          back to that.
        </p>

        <h3>The local invariant gotcha</h3>

        <p>
          A common newbie mistake: thinking the invariant only requires &quot;left child &lt; node &lt; right
          child.&quot; That&apos;s the local-only version, and it&apos;s wrong. Consider:
        </p>

        <CodeBlock lang="plain">{`        5
       / \\
      3   8
         / \\
        2   9   <-- 2 is in the right subtree of 5,
                    but 2 < 5! Not a BST.`}</CodeBlock>

        <p>
          Locally each node satisfies left &lt; node &lt; right. But the <em>subtree</em>{" "}rooted at 8 contains a 2,
          which is supposed to be &gt; 5. The invariant is global: every key in the right subtree must exceed
          every ancestor that the right subtree was descended from on a left-to-right move.
        </p>

        <Callout variant="warn" title="LeetCode 98 'Validate BST' is exactly this trap">
          The wrong solution checks <code>root.left.val &lt; root.val &lt; root.right.val</code>. The right one
          passes a (lo, hi) range down: at the root the range is (-∞, +∞); going left tightens hi to root.val;
          going right tightens lo. Every node must lie strictly inside its inherited range.
        </Callout>

        <h3>Inorder traversal of a BST = sorted output</h3>

        <p>
          From Module 11: inorder visits left, then root, then right. On a BST this means: smaller keys, then
          this key, then bigger keys — at every level. The output is sorted. That&apos;s why &quot;inorder is
          magic for BSTs&quot;: it&apos;s how you turn the tree back into a sorted sequence in O(n).
        </p>

        <p>
          Try it on the diagram: 1, 3, 4, 6, 7, 8, 9, 10, 14. Sorted, by construction.
        </p>

        <Quiz
          question="True or false: every binary tree where each node's left child is smaller and each node's right child is larger is a valid BST."
          options={[
            { label: "True — that's the definition.", explanation: "Read the example above. Local left/right ordering is necessary but NOT sufficient. The whole subtree on the right must exceed the node, not just the immediate right child." },
            { label: "False — you also need the whole left subtree's keys < node, and the whole right subtree's keys > node.", correct: true, explanation: "Right. The invariant is global, not local. The standard validation pattern threads a (lo, hi) range through the recursion to enforce it." },
            { label: "True only for full trees.", explanation: "The fullness of the tree is unrelated to the BST invariant." },
            { label: "False — BSTs can have duplicate keys.", explanation: "Whether duplicates are allowed is a design choice, but it's orthogonal to the local-vs-global question." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Operations ───────────────── */}
      <Checkpoint moduleSlug="bst" id="ops" title="I can implement search, insert, and delete" xp={15} celebration="Search and insert are easy. Delete with two children is the only tricky case.">
      <section>
        <h2 id="ops">Search, insert, delete</h2>

        <h3>Search — the easy one</h3>

        <CodeBlock lang="java">{`TreeNode search(TreeNode root, int key) {
    if (root == null || root.val == key) return root;
    return key < root.val
        ? search(root.left, key)
        : search(root.right, key);
}`}</CodeBlock>

        <p>
          One comparison per level. On a balanced tree, that&apos;s O(log n). The iterative version is the same
          loop with no recursion.
        </p>

        <h3>Insert — almost as easy</h3>

        <CodeBlock lang="java">{`TreeNode insert(TreeNode root, int key) {
    if (root == null) return new TreeNode(key);
    if (key < root.val)      root.left  = insert(root.left,  key);
    else if (key > root.val) root.right = insert(root.right, key);
    // (key == root.val: usually no-op, sometimes increment a count)
    return root;
}`}</CodeBlock>

        <p>
          Walk down to the spot the key would be in by search, then attach a new leaf there. No shifting, no
          rebalancing (in a plain BST). Cost: O(h) — height of the tree.
        </p>

        <Callout variant="info" title="Returning the (possibly new) root">
          The pattern <code>root.left = insert(root.left, key)</code> looks redundant — we&apos;re assigning the
          same field back to itself in the common case. But when <code>root.left</code> is <code>null</code>, the
          recursive call returns a fresh node, and we need to attach it. Consistently returning the node from
          every recursive call lets the caller hook it up without tracking parents.
        </Callout>

        <h3>Delete — the only hard one</h3>

        <p>
          Deletion has three cases depending on how many children the target has:
        </p>

        <Mermaid chart={deleteCases} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Three cases: leaf is trivial; one-child &quot;promotes&quot; the child; two-children swap-with-successor.
        </p>

        <ol>
          <li><strong>Leaf</strong> (no children): unlink it. Done.</li>
          <li><strong>One child</strong>: replace the target with its only child. The subtree shape under the child is preserved.</li>
          <li><strong>Two children</strong>: the trick. Find the <em>in-order successor</em> — the smallest key in the right subtree (or the largest in the left subtree, by symmetry). Copy its value into the target node, then recursively delete the successor. Because the successor lives in the right subtree, has no left child (it&apos;s the leftmost), it falls into case 1 or case 2 — easy.</li>
        </ol>

        <CodeBlock lang="java">{`TreeNode delete(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val) {
        root.left = delete(root.left, key);
    } else if (key > root.val) {
        root.right = delete(root.right, key);
    } else {
        // Found the target.
        if (root.left == null) return root.right;     // case 1 (leaf) or case 2 (only right child)
        if (root.right == null) return root.left;     // case 2 (only left child)

        // Case 3: two children. Steal value from in-order successor.
        TreeNode succ = root.right;
        while (succ.left != null) succ = succ.left;
        root.val = succ.val;
        root.right = delete(root.right, succ.val);
    }
    return root;
}`}</CodeBlock>

        <p>
          Notice case 3 doesn&apos;t actually unlink the target node — it overwrites the target&apos;s value with
          the successor&apos;s, then recurses to delete the (much-easier-to-delete) successor node. The tree shape
          changes but the BST invariant is preserved because the successor was, by definition, the next-larger
          key after the target.
        </p>

        <WorkedExample
          title="Delete 8 from the example tree"
          steps={[
            { title: "Find 8", body: "Start at root (8). It IS the target. So we're in case 3 — 8 has two children (3 and 10)." },
            { title: "Find the in-order successor", body: "Walk to root.right (10), then keep going left until null. 10 has left=9, 9 has no left. Successor is 9." },
            { title: "Copy successor's value into target", body: "Set root.val = 9. The tree now has two 9s, and the BST invariant is temporarily violated for the successor." },
            { title: "Delete the successor from the right subtree", body: "Recursively delete 9 from root.right. 9 has no children at all (leaf), so this is case 1: just unlink it. 10's left becomes null. Done." },
            { title: "The tree is now valid", body: "Root holds 9, the original 9 node is gone, and inorder traversal still produces 1, 3, 4, 6, 7, 9, 10, 14 — sorted, with 8 gone." },
          ]}
        />

        <h3>Complexity, all three operations</h3>

        <ul>
          <li><strong>Search:</strong>{" "}O(h). Balanced: O(log n). Skewed: O(n).</li>
          <li><strong>Insert:</strong>{" "}O(h). Same balance dependency.</li>
          <li><strong>Delete:</strong>{" "}O(h). Successor walk is O(h), recursive delete is O(h).</li>
        </ul>

        <Quiz
          question="You're deleting a node with two children using the in-order successor approach. Why does the recursive 'delete the successor' call always fall into case 1 or 2 — never case 3?"
          options={[
            { label: "The successor is by definition a leaf.", explanation: "Not always. The successor is the leftmost node in the right subtree. It can have a right child (anything bigger than itself in that subtree)." },
            { label: "The successor has no LEFT child by definition (we walked left until null).", correct: true, explanation: "Right. The leftmost node in any subtree has no left child — that's how we found it. So when we recurse to delete it, the call sees `root.left == null` and returns `root.right`. That's case 1 (if right is null too) or case 2. Case 3 requires two children, and the successor is missing one." },
            { label: "Recursive delete short-circuits the case detection.", explanation: "There's no special-casing — the same delete function runs, but the input shape guarantees we land in the easy branch." },
            { label: "The successor's value already exists elsewhere, so we just zero it out.", explanation: "We physically remove the successor's node, not just its value. The successor's value was COPIED to the target — the original node still needs to go." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Balance ───────────────── */}
      <Checkpoint moduleSlug="bst" id="balance" title="I know why plain BSTs aren't enough" xp={15} celebration="Sorted-order inserts produce a skewed tree. Balanced BSTs (AVL, Red-Black) prevent it.">
      <section>
        <h2 id="balance">Why plain BSTs aren&apos;t enough — and how balanced trees fix it</h2>

        <p>
          Insert keys 1, 2, 3, 4, 5 into an empty BST in order. Each new key is bigger than everything before, so
          each goes to the rightmost position. You don&apos;t get a tree — you get a glorified linked list:
        </p>

        <Mermaid chart={skewedBst} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Inserts in sorted order produce a skewed tree of height n. Search and insert are now O(n), not O(log n).
        </p>

        <p>
          The BST invariant is satisfied — every node is greater than its (empty) left subtree and less than its
          right subtree. But the tree&apos;s height is n, not log n. Search-by-walk-down is O(n). The whole point
          of a BST evaporated.
        </p>

        <p>
          This isn&apos;t exotic. Any source of approximately-sorted data — log timestamps, sequence IDs,
          alphabetized names — produces highly skewed trees in a plain BST. <strong>Plain BSTs are unsafe to use
          on real data.</strong>
        </p>

        <h3>The fix: self-balancing trees</h3>

        <p>
          A <strong>balanced BST</strong>{" "}is a BST that maintains an additional invariant — the tree&apos;s height
          stays O(log n) regardless of insertion order. It does this by performing small local restructurings
          (called <strong>rotations</strong>) during insert and delete to redistribute nodes when the tree gets
          lopsided.
        </p>

        <p>
          The two famous balanced-BST schemes you should know by name:
        </p>

        <h3>AVL trees (Adelson-Velsky & Landis, 1962)</h3>

        <ul>
          <li><strong>Invariant:</strong>{" "}for every node, the heights of the left and right subtrees differ by at most 1.</li>
          <li><strong>Rebalance:</strong>{" "}after each insert/delete, walk back up; if any ancestor is unbalanced, do a single or double rotation to fix it.</li>
          <li><strong>Height:</strong>{" "}at most ≈ 1.44 × log₂(n+2). Tighter balance than red-black.</li>
          <li><strong>Tradeoff:</strong>{" "}faster lookups (shallower tree), slower modifications (more rotations).</li>
          <li><strong>Use case:</strong>{" "}read-heavy workloads.</li>
        </ul>

        <h3>Red-black trees (Bayer 1972, then named by Guibas-Sedgewick 1978)</h3>

        <ul>
          <li><strong>Invariant:</strong>{" "}each node is colored red or black, with rules ensuring the longest root-to-leaf path is at most twice the shortest.</li>
          <li><strong>Rebalance:</strong>{" "}recolor and rotate based on the color of the new node&apos;s uncle. Constant amortized work per insert/delete.</li>
          <li><strong>Height:</strong>{" "}at most 2 × log₂(n+1). Looser balance than AVL.</li>
          <li><strong>Tradeoff:</strong>{" "}slightly deeper than AVL, but fewer rotations on modify.</li>
          <li><strong>Use case:</strong>{" "}write-heavy or mixed workloads. <strong>This is what Java uses.</strong></li>
        </ul>

        <Callout variant="info" title="You don't need to memorize rotations">
          For interviews, you should be able to explain <em>why</em>{" "}a plain BST is unsafe and that AVL and
          red-black trees fix it with O(1) local restructuring during insert/delete. You generally do <em>not</em>{" "}
          need to implement rotations on a whiteboard — interviewers know that&apos;s a 30-minute exercise that
          tests typing more than thinking. Reach for <code>TreeMap</code> in Java instead.
        </Callout>

        <h3>The intuition for rotations (in 30 seconds)</h3>

        <p>
          A single rotation pivots three nodes — the unbalanced node, its child, and the child&apos;s pointer to
          one grandchild — to redistribute heights without violating the BST invariant. Think of it as &quot;hold
          the middle node; let the other two reattach.&quot; The exact bookkeeping is fiddly; the point is that
          it&apos;s O(1) and preserves both the BST invariant and the in-order sequence of keys.
        </p>

        <CodeBlock lang="plain">{`Right rotation around y:

       y                      x
      / \\                    / \\
     x   c     ──>           a   y
    / \\                         / \\
   a   b                       b   c

Inorder before: a, x, b, y, c
Inorder after:  a, x, b, y, c  (unchanged — that's the magic)`}</CodeBlock>

        <Quiz
          question="You insert 100,000 sorted integers into a plain (unbalanced) BST. What's the cost of one final search?"
          options={[
            { label: "O(log n) ≈ 17 comparisons.", explanation: "Only if the tree were balanced. Sorted inserts produce a skewed tree." },
            { label: "O(n) ≈ 100,000 comparisons in the worst case.", correct: true, explanation: "Right. Sorted inserts skew everything to the right; the tree is essentially a linked list of height n. Searching for the smallest or largest element walks the whole chain. The whole reason TreeMap (red-black) exists is to prevent exactly this." },
            { label: "O(1) — Java caches recently inserted values.", explanation: "BSTs don't cache; the data structure has no awareness of access patterns." },
            { label: "O(n²) — every search re-traverses the whole tree.", explanation: "A search is one walk, not n walks." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · TreeMap & TreeSet ───────────────── */}
      <Checkpoint moduleSlug="bst" id="treemap" title="I know when to reach for TreeMap" xp={10} celebration="O(log n) sorted map. The right tool when HashMap's lack of order hurts.">
      <section>
        <h2 id="treemap">Java&apos;s <code>TreeMap</code> and <code>TreeSet</code></h2>

        <p>
          <code>java.util.TreeMap</code> is a red-black tree. <code>TreeSet</code> is backed by a <code>TreeMap</code>
          (with the value half discarded) — same machinery as <code>HashSet</code> sitting on <code>HashMap</code>.
          Both give you <strong>sorted iteration</strong>{" "}and <strong>O(log n) range queries</strong>, at the cost
          of slower per-operation constant factors than the hash-based versions.
        </p>

        <h3>The killer features: floor, ceiling, headMap, tailMap, subMap</h3>

        <p>
          <code>HashMap</code> answers &quot;does key K exist?&quot;. <code>TreeMap</code> additionally answers
          everything in the order family:
        </p>

        <CodeBlock lang="java">{`TreeMap<Integer, String> events = new TreeMap<>();
events.put(1000, "a"); events.put(2000, "b");
events.put(3500, "c"); events.put(5000, "d");

events.firstKey();          // 1000  (smallest key)
events.lastKey();           // 5000  (largest key)
events.floorKey(3000);      // 2000  (largest key <= 3000)
events.ceilingKey(3000);    // 3500  (smallest key >= 3000)
events.lowerKey(2000);      // 1000  (largest key strictly < 2000)
events.higherKey(2000);     // 3500  (smallest key strictly > 2000)

events.subMap(2000, 5000);  // {2000=b, 3500=c} — keys in [2000, 5000)
events.headMap(3000);       // {1000=a, 2000=b} — keys < 3000
events.tailMap(3000);       // {3500=c, 5000=d} — keys >= 3000`}</CodeBlock>

        <p>
          Each of those is O(log n) — except <code>subMap</code>, which returns a <em>view</em>{" "}of the original
          map (no copy) in O(log n), with iteration cost proportional to the size of the range.
        </p>

        <h3>When TreeMap is the right tool</h3>

        <ul>
          <li>
            <strong>Time-series &quot;most recent ≤ T&quot;</strong>: events keyed by timestamp. <code>floorKey(now)</code>{" "}
            returns the most recent past event. HashMap can&apos;t answer this without a full scan.
          </li>
          <li>
            <strong>Range queries</strong>: &quot;all bookings between June 1 and June 30.&quot; <code>subMap</code>{" "}
            gives you a view in log time.
          </li>
          <li>
            <strong>Streaming median or k-th order statistics</strong>: insert and read off a sorted structure.
          </li>
          <li>
            <strong>Ordered iteration</strong>: when you actually need to walk keys in sorted order.
          </li>
        </ul>

        <h3>The cost</h3>

        <p>
          A red-black tree is slower than a hash table on every individual operation:
        </p>

        <ul>
          <li><code>put</code>, <code>get</code>, <code>remove</code>, <code>containsKey</code>: O(log n) for TreeMap, O(1) average for HashMap.</li>
          <li>Iteration: O(n) for both, but TreeMap iterates in sorted order.</li>
          <li>Memory: TreeMap nodes have parent + left + right + color; HashMap nodes have hash + next + key + value. Comparable.</li>
        </ul>

        <Callout variant="warn" title="Don't reach for TreeMap by default">
          If you don&apos;t need sorted iteration or range queries, <code>HashMap</code> is faster. Use{" "}
          <code>TreeMap</code> when the question contains the word &quot;range,&quot; &quot;next greater,&quot;
          &quot;closest,&quot; or &quot;sorted.&quot; Otherwise stay with <code>HashMap</code>.
        </Callout>

        <ClassifyChallenge
          title="HashMap or TreeMap?"
          prompt="For each scenario, pick the right map type."
          buckets={[
            { id: "hash", label: "HashMap", color: "emerald" },
            { id: "tree", label: "TreeMap", color: "indigo" },
          ]}
          items={[
            { id: "ratelimit", label: "Per-user request count, just incrementing and reading.", answer: "hash", explanation: "Pure key-value lookup, no ordering. HashMap is faster." },
            { id: "stockprice", label: "Stock prices indexed by timestamp, asking 'most recent price as of time T'.", answer: "tree", explanation: "That's `floorEntry(T)`. HashMap has no notion of 'closest key'." },
            { id: "leaderboard", label: "Leaderboard sorted by score, top 10 at any time.", answer: "tree", explanation: "Sorted iteration. (A heap can do top-K too, but TreeMap gives you the whole sorted order plus mutations.)" },
            { id: "wordcount", label: "Word frequency count for an essay, just lookups.", answer: "hash", explanation: "Counting and lookup, no ordering. HashMap." },
            { id: "calendar", label: "Find all calendar events between two dates.", answer: "tree", explanation: "Range query: `events.subMap(startDate, endDate)`." },
            { id: "session", label: "Active session lookup by sessionID, plain get/put.", answer: "hash", explanation: "Random session IDs, no ordering need. HashMap with concurrent variant for production." },
            { id: "auction", label: "Find the smallest bid >= X to fill an order.", answer: "tree", explanation: "`bids.ceilingEntry(X)`. Classic TreeMap use." },
            { id: "config", label: "Application config (string keys to values), read once at startup.", answer: "hash", explanation: "No ordering, no range. HashMap (or even an immutable Map.of)." },
          ]}
        />

        <Quiz
          question="`TreeMap.put(k, v)` and `HashMap.put(k, v)` both run in 'log n vs constant.' For n = 1,000,000, roughly how many times slower is the TreeMap put on equivalent hardware?"
          options={[
            { label: "About 1,000,000× slower.", explanation: "That'd be O(n) per op. TreeMap is O(log n)." },
            { label: "About 20× slower (log₂(1M) = 20 comparisons vs 1 hash + 1 chain walk).", correct: true, explanation: "Right ballpark. TreeMap traverses a tree of depth ~log₂(n) doing one Comparable.compareTo per level, while HashMap does ~1 hash + ~1 equals call. In practice the gap is more like 5-10× because of cache effects and the fact that Comparable comparisons are often cheaper than full hashCode + equals — but it's a meaningful constant factor and you should default to HashMap unless you need order." },
            { label: "Roughly the same speed.", explanation: "Different complexity classes. The gap widens with n." },
            { label: "Faster — TreeMap's predictable layout is cache-friendly.", explanation: "Red-black trees are pointer-chase structures, no better than HashMap chains and worse than HashMap's flat-array fast path." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="bst" id="project" title="I built a BST and solved the warm-ups" xp={25} manual manualLabel="Project & LeetCode complete" celebration="A working BST plus the two canonical BST interview problems.">
      <section>
        <h2 id="project">Project: BST from scratch + LeetCode warm-ups</h2>

        <h3>Part A — <code>SimpleBst&lt;K extends Comparable&lt;K&gt;&gt;</code></h3>

        <p>
          Build an <em>unbalanced</em>{" "}BST. We&apos;re skipping rotations on purpose — implementing red-black is
          a 200-line exercise in bookkeeping that doesn&apos;t teach BST intuition. The plain version teaches
          search/insert/delete; <code>TreeMap</code> handles the balancing for you in production.
        </p>

        <CodeBlock lang="java">{`public class SimpleBst<K extends Comparable<K>> {
    private static class Node<K> {
        K key;
        Node<K> left, right;
        Node(K key) { this.key = key; }
    }

    private Node<K> root;
    private int size;

    public boolean contains(K key) {
        return find(root, key) != null;
    }

    private Node<K> find(Node<K> node, K key) {
        if (node == null) return null;
        int cmp = key.compareTo(node.key);
        if (cmp < 0) return find(node.left, key);
        if (cmp > 0) return find(node.right, key);
        return node;
    }

    public boolean add(K key) {
        int prevSize = size;
        root = insert(root, key);
        return size > prevSize;       // true if a new node was added
    }

    private Node<K> insert(Node<K> node, K key) {
        if (node == null) {
            size++;
            return new Node<>(key);
        }
        int cmp = key.compareTo(node.key);
        if (cmp < 0)      node.left  = insert(node.left,  key);
        else if (cmp > 0) node.right = insert(node.right, key);
        // cmp == 0: duplicate, ignore
        return node;
    }

    public boolean remove(K key) {
        int prevSize = size;
        root = delete(root, key);
        return size < prevSize;
    }

    private Node<K> delete(Node<K> node, K key) {
        if (node == null) return null;
        int cmp = key.compareTo(node.key);
        if (cmp < 0)      node.left  = delete(node.left,  key);
        else if (cmp > 0) node.right = delete(node.right, key);
        else {
            // Found target.
            size--;
            if (node.left == null)  return node.right;
            if (node.right == null) return node.left;
            // Two children: steal in-order successor's value, delete successor.
            Node<K> succ = node.right;
            while (succ.left != null) succ = succ.left;
            node.key = succ.key;
            size++;                   // we'll decrement again inside the recursion
            node.right = delete(node.right, succ.key);
        }
        return node;
    }

    public List<K> inorder() {
        List<K> out = new ArrayList<>();
        inorderInto(root, out);
        return out;
    }

    private void inorderInto(Node<K> n, List<K> out) {
        if (n == null) return;
        inorderInto(n.left, out);
        out.add(n.key);
        inorderInto(n.right, out);
    }

    public int size() { return size; }
}`}</CodeBlock>

        <p>
          Tests to write: insert <code>{`{8, 3, 10, 1, 6, 14, 4, 7, 13}`}</code> and check <code>inorder()</code>{" "}
          returns sorted. Delete 8 (the two-children case), confirm the tree is still valid. Then build a stress
          test: insert 1..1000 in order, time a contains for 1000, and watch it crawl. That&apos;s the unbalanced
          worst case — and the motivation for <code>TreeMap</code>.
        </p>

        <h3>Part B — LeetCode warm-ups</h3>

        <ol>
          <li>
            <strong>LC 98 · Validate BST</strong> (Medium). The (lo, hi) range trick from Part 1. Recurse with
            tightening bounds; the local-only check is a famous wrong solution.
          </li>
          <li>
            <strong>LC 235 · Lowest Common Ancestor of a BST</strong> (Easy/Medium). Use the BST invariant:
            walk down from the root; if both targets are smaller, go left; both bigger, go right; otherwise
            you&apos;re at the LCA. O(h) without ever needing two passes or parent pointers — way simpler than
            general-tree LCA.
          </li>
          <li>
            <strong>LC 230 · Kth Smallest in BST</strong> (Medium). Inorder traversal yields sorted; stop after
            k visits. Iterative with an explicit stack lets you short-circuit cleanly.
          </li>
        </ol>

        <Callout variant="insight" title="The BST mental check">
          On every BST problem, ask: &quot;Can I exploit that inorder gives me sorted? Can I exploit that{" "}
          <code>x.left.val &lt; x.val &lt; x.right.val</code> globally?&quot; Both answers being &quot;no&quot;
          usually means the problem is really a tree problem (Module 11), not a BST problem.
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final quiz ───────────────── */}
      <Checkpoint moduleSlug="bst" id="final" title="I've completed Module 12" xp={20} celebration="BSTs and balanced trees demystified. Heaps next — a different tree shape for a different problem.">
      <section>
        <h2 id="final">Final check</h2>

        <Quiz
          question="In the two-children delete case, you copy the in-order SUCCESSOR's value into the target. What's the in-order PREDECESSOR's location, and could we use it instead?"
          options={[
            { label: "Predecessor is the largest key in the left subtree (rightmost of left). Yes, we could use it — the algorithm is symmetric.", correct: true, explanation: "Right. The predecessor lives in the left subtree, walking right until null. Both successor and predecessor preserve the BST invariant when swapped in. Some implementations randomize between them to keep trees more balanced; most just pick one." },
            { label: "Predecessor is the parent. Can't use it; that'd violate the invariant.", explanation: "The parent is one position above in the tree, but it's not necessarily the predecessor. The predecessor is found by going down-left then all-the-way-right." },
            { label: "Predecessor is the smallest key in the left subtree. Can't use it; that'd violate the invariant.", explanation: "The smallest in the left subtree is the leftmost (down-left forever), which is the smallest of everything ≤ target — far from the predecessor." },
            { label: "Predecessor doesn't exist on a BST.", explanation: "Every node except the smallest has a predecessor in inorder. It's well-defined." },
          ]}
        />

        <Quiz
          question="Why does Java's TreeMap use a red-black tree instead of an AVL tree?"
          options={[
            { label: "Red-black trees have shorter paths.", explanation: "AVL trees are more strictly balanced (height ≤ 1.44 log₂ n) than red-black (height ≤ 2 log₂ n). AVL has SHORTER paths, not red-black." },
            { label: "Red-black trees do less rebalancing per insert/delete on average — fewer rotations, just recoloring most of the time.", correct: true, explanation: "Right. AVL is faster on lookups (shallower) but slower on writes (more rotations to maintain strict balance). Red-black accepts a slightly deeper tree in exchange for cheaper inserts/deletes — the right tradeoff for a general-purpose mutable map. AVL trees show up in read-mostly contexts." },
            { label: "Red-black trees support duplicates; AVL doesn't.", explanation: "Both support duplicates if you allow them; that's a design choice independent of the balancing scheme." },
            { label: "Red-black trees use less memory per node.", explanation: "An AVL node needs a height/balance-factor int; a red-black node needs a color bit. Both are negligible. Memory isn't the discriminator." },
          ]}
        />

        <Quiz
          question="You're building an in-memory cache that serves 'most recent price ≤ time T' queries. Three candidates: HashMap, sorted ArrayList you keep sorted via insertion shifts, TreeMap. Pick one and justify briefly."
          options={[
            { label: "HashMap — O(1) put and get.", explanation: "But HashMap can't answer 'closest key ≤ T' — it has no order. You'd have to scan all keys, O(n) per query. Wrong fit." },
            { label: "Sorted ArrayList — binary search for the floor is O(log n).", explanation: "Lookup is fine, but inserts require O(n) to shift elements. If updates are frequent, this dominates and you regret the choice. Fine for static data, bad for streaming." },
            { label: "TreeMap — `floorEntry(T)` is O(log n), and `put` is O(log n) with no shifting.", correct: true, explanation: "Right. TreeMap is the canonical choice for 'sorted-keyed structure with ordered queries.' Both operations are O(log n), the API has `floorEntry`/`ceilingEntry` built in, and you don't write any custom code." },
            { label: "Two of HashMap (for value lookup) + a sorted ArrayList (for floor queries).", explanation: "Possible but you've now got two data structures to keep consistent. TreeMap does both jobs in one structure." },
          ]}
        />

        <div className="my-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mt-0 mb-2 text-white">Module 12 complete</h3>
          <p className="text-emerald-50 mb-4">
            Search trees down. The last Phase 3 module is heaps — another tree, but stored in an array and tuned
            for one specific question: &quot;what&apos;s the smallest (or largest)?&quot;
          </p>
          <Link
            href="/courses/dsa/modules/heaps"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-emerald-700 font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Next: Heaps &amp; priority queues →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="bst" />
    </article>
  );
}
