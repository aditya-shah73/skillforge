import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 15 minutes before an interview, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase3RevisionModule() {
  const mod = getModuleBySlug("phase-3-revision")!;

  // HashMap internals: key → hash(key) → bucket index → linked list / tree-bin
  // The picture every Java interviewer wants you to be able to draw on a whiteboard.
  const hashMapChart = `
flowchart LR
    K["key<br/>e.g. &quot;cat&quot;"] -->|"hashCode()<br/>+ spread<br/>h ^ (h&gt;&gt;&gt;16)"| H["32-bit hash"]
    H -->|"h &amp; (cap-1)"| B["bucket index<br/>0..cap-1"]
    B --> T["table[index]"]
    T --> L["linked list<br/>(≤ 8 entries)"]
    T -. "if ≥ 8 in one bucket<br/>and cap ≥ 64" .-> R["red-black tree<br/>O(log n) per bucket"]
    style K fill:#10b981,color:#fff,stroke:#059669
    style H fill:#0ea5e9,color:#fff,stroke:#0284c7
    style B fill:#f59e0b,color:#fff,stroke:#d97706
    style T fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style L fill:#64748b,color:#fff,stroke:#475569
    style R fill:#ef4444,color:#fff,stroke:#dc2626
  `.trim();

  // Tiny tree used for the traversal section. Same tree, four different walks.
  const exampleTree = `
flowchart TB
    A((1)) --> B((2))
    A --> C((3))
    B --> D((4))
    B --> E((5))
    C --> F((6))
    C --> G((7))
    style A fill:#10b981,color:#fff,stroke:#059669
    style B fill:#0ea5e9,color:#fff,stroke:#0284c7
    style C fill:#0ea5e9,color:#fff,stroke:#0284c7
    style D fill:#a78bfa,color:#fff,stroke:#7c3aed
    style E fill:#a78bfa,color:#fff,stroke:#7c3aed
    style F fill:#a78bfa,color:#fff,stroke:#7c3aed
    style G fill:#a78bfa,color:#fff,stroke:#7c3aed
  `.trim();

  // Heap as an array-backed complete binary tree. The math is the whole point —
  // parent at (i-1)/2, children at 2i+1 and 2i+2. No pointers needed.
  const heapChart = `
flowchart TB
    subgraph tree["Conceptual: complete binary tree"]
        A0((10)) --> A1((20))
        A0 --> A2((15))
        A1 --> A3((30))
        A1 --> A4((40))
        A2 --> A5((50))
    end
    subgraph arr["Physical: backing array"]
        I0["[0]=10"] --- I1["[1]=20"] --- I2["[2]=15"] --- I3["[3]=30"] --- I4["[4]=40"] --- I5["[5]=50"]
    end
    style A0 fill:#10b981,color:#fff,stroke:#059669
    style A1 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style A2 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style I0 fill:#10b981,color:#fff,stroke:#059669
    style I1 fill:#0ea5e9,color:#fff,stroke:#0284c7
    style I2 fill:#0ea5e9,color:#fff,stroke:#0284c7
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 3 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 3 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Hashing, sets, trees, BSTs, heaps — the whole &quot;keyed lookup and tree-shaped data&quot; chapter compressed to a card you can re-read in 15 minutes before an interview.
        </p>
        <ModuleProgress moduleSlug="phase-3-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 3</strong> — every invariant, every Big-O row, every &quot;wait, why did that break in production&quot; gotcha from the five previous modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read on the train before a phone screen, not as a tutorial.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The five modules you&apos;re consolidating: <Link href="/courses/dsa/modules/hashmaps" className="text-emerald-600 hover:underline">HashMaps</Link>, <Link href="/courses/dsa/modules/sets" className="text-emerald-600 hover:underline">Sets &amp; frequency counting</Link>, <Link href="/courses/dsa/modules/trees" className="text-emerald-600 hover:underline">Trees &amp; traversals</Link>, <Link href="/courses/dsa/modules/bst" className="text-emerald-600 hover:underline">Binary search trees</Link>, and <Link href="/courses/dsa/modules/heaps" className="text-emerald-600 hover:underline">Heaps &amp; PriorityQueue</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Big-O for the keyed structures */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. The keyed-structure Big-O table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Five rows. Memorize them. Every Phase 3 interview question lives on one of these lines.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Structure</th>
                <th className="px-4 py-3 font-semibold">get / contains</th>
                <th className="px-4 py-3 font-semibold">put / add</th>
                <th className="px-4 py-3 font-semibold">remove</th>
                <th className="px-4 py-3 font-semibold">Ordered?</th>
                <th className="px-4 py-3 font-semibold">When you pick it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">HashMap</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg / O(n) worst</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg*</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default lookup table. Picks itself unless you need order.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">HashSet</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Have I seen this?&quot; — dedup, visited tracking.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">TreeMap</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes (sorted by key)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Range queries, floor/ceiling, sorted iteration.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">TreeSet</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sorted unique items, &quot;smallest greater than x&quot; queries.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">PriorityQueue</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) peek</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n) offer</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n) poll</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No (only min is exposed)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Top-K, scheduling, Dijkstra, streaming median.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          *amortized — rare rehash is O(n). Java 8+ <code>HashMap</code> uses tree-bins, so a single bucket with collisions degrades to O(log n) per op, not O(n).
        </p>

        <Callout variant="insight">
          <strong>Decision tree in one line:</strong> need fastest lookup → HashMap. Need sorted/range → TreeMap. Need &quot;biggest&quot; or &quot;smallest&quot; on a stream → PriorityQueue. Need uniqueness → swap the Map suffix for Set.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — HashMap internals */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. HashMap internals on a napkin</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The whiteboard picture every Java interviewer wants to see: key → hash → bucket → list (or tree).
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={hashMapChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 mb-4">
          <li>
            <strong>Hash spread:</strong> <code>h = key.hashCode(); h ^= (h &gt;&gt;&gt; 16);</code> — mixes the high bits into the low bits so the masking step doesn&apos;t throw away entropy.
          </li>
          <li>
            <strong>Index formula:</strong> <code>index = h &amp; (capacity - 1)</code>. Works because capacity is always a power of two — that AND is equivalent to <code>h % capacity</code> but much faster.
          </li>
          <li>
            <strong>Chaining:</strong> each bucket holds a linked list of entries. New entries appended at the tail. Lookup walks the list comparing with <code>equals</code>.
          </li>
          <li>
            <strong>Load factor 0.75:</strong> once <code>size &gt; capacity × 0.75</code>, resize to 2× and rehash everything. Amortized O(1), worst-case O(n) on the resize call.
          </li>
          <li>
            <strong>Treeify threshold 8 + MIN_TREEIFY_CAPACITY 64:</strong> a single bucket with ≥ 8 entries on a table with capacity ≥ 64 converts that bucket from a list to a red-black tree. Keeps worst-case bucket cost at O(log n) instead of O(n) under hash attacks.
          </li>
        </ul>

        <h3 className="text-base font-semibold mt-6 mb-2">The <code>equals</code> / <code>hashCode</code> contract</h3>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-decimal pl-5 mb-4">
          <li>If <code>a.equals(b)</code> is <code>true</code>, then <code>a.hashCode() == b.hashCode()</code> <strong>must</strong> hold. Break this and your keys will be silently lost in HashMap.</li>
          <li>If <code>a.hashCode() == b.hashCode()</code>, <code>equals</code> may or may not be true (collisions are legal).</li>
          <li>Both methods must use <em>only</em> immutable fields. Mutate a field that&apos;s in <code>hashCode</code> and the key is now in the wrong bucket — invisible to <code>get</code>.</li>
        </ol>

        <CodeBlock lang="java" caption="Canonical equals/hashCode pair">{`@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User)) return false;
    User u = (User) o;
    return id == u.id && name.equals(u.name);
}

@Override
public int hashCode() {
    return Objects.hash(id, name);  // delegates to Arrays.hashCode internally
}`}</CodeBlock>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/hashmaps" className="text-emerald-600 hover:underline">Module 11 — HashMaps</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Tree traversals */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. Tree traversals — four walks, one tree</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The work position relative to the recursive calls is the only difference between pre/in/post-order. BFS is the odd one out — it needs a queue, not recursion.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={exampleTree} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Preorder · root, L, R</div>
            <code className="text-xs block text-slate-700 dark:text-slate-300 mb-2">1 → 2 → 4 → 5 → 3 → 6 → 7</code>
            <div className="text-xs text-slate-500">Copy a tree, serialize, build a clone.</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Inorder · L, root, R</div>
            <code className="text-xs block text-slate-700 dark:text-slate-300 mb-2">4 → 2 → 5 → 1 → 6 → 3 → 7</code>
            <div className="text-xs text-slate-500">On a BST: yields sorted keys. <em>The</em> BST verifier.</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Postorder · L, R, root</div>
            <code className="text-xs block text-slate-700 dark:text-slate-300 mb-2">4 → 5 → 2 → 6 → 7 → 3 → 1</code>
            <div className="text-xs text-slate-500">Delete a tree, compute sizes, evaluate expressions.</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">BFS · level by level</div>
            <code className="text-xs block text-slate-700 dark:text-slate-300 mb-2">1 → 2 → 3 → 4 → 5 → 6 → 7</code>
            <div className="text-xs text-slate-500">Shortest path in unweighted graphs, level grouping.</div>
          </div>
        </div>

        <CodeBlock lang="java" caption="Recursive DFS — three flavors, one shape">{`void preorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    out.add(n.val);              // work BEFORE recursing
    preorder(n.left, out);
    preorder(n.right, out);
}

void inorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    inorder(n.left, out);
    out.add(n.val);              // work BETWEEN recursive calls
    inorder(n.right, out);
}

void postorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    postorder(n.left, out);
    postorder(n.right, out);
    out.add(n.val);              // work AFTER recursing
}`}</CodeBlock>

        <CodeBlock lang="java" caption="BFS — explicit queue, level-size freeze trick">{`List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> levels = new ArrayList<>();
    if (root == null) return levels;
    Deque<TreeNode> queue = new ArrayDeque<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int levelSize = queue.size();    // freeze NOW — queue will grow
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < levelSize; i++) {
            TreeNode n = queue.poll();
            level.add(n.val);
            if (n.left != null)  queue.offer(n.left);
            if (n.right != null) queue.offer(n.right);
        }
        levels.add(level);
    }
    return levels;
}`}</CodeBlock>

        <CodeBlock lang="java" caption="Iterative preorder — explicit stack on the heap (safe for skewed trees)">{`List<Integer> preorderIter(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;
    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode n = stack.pop();
        out.add(n.val);
        // push RIGHT first so LEFT is processed next (LIFO)
        if (n.right != null) stack.push(n.right);
        if (n.left  != null) stack.push(n.left);
    }
    return out;
}`}</CodeBlock>

        <Callout variant="insight">
          <strong>Complexity for all four:</strong> O(n) time (every node touched once). Space is O(h) for DFS (recursion or explicit stack — proportional to tree height) and O(w) for BFS (queue holds the widest level, up to ~n/2 for a perfect tree).
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/trees" className="text-emerald-600 hover:underline">Module 13 — Trees &amp; traversals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — BST invariant + degradation */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. BST invariant &amp; when it falls apart</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The invariant is global, not local. Skewed inputs turn O(log n) into O(n) — which is exactly why Java&apos;s <code>TreeMap</code> isn&apos;t a plain BST.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">The invariant — global, not local</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              For every node <code>n</code>: <em>every</em> key in <code>n.left</code> &lt; <code>n.key</code> &lt; <em>every</em> key in <code>n.right</code>. Not just the immediate children — the whole subtree.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Verifier: an inorder traversal produces a strictly increasing sequence. If it doesn&apos;t, it&apos;s not a BST.
            </p>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">The degradation — skewed trees</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Insert <code>1, 2, 3, 4, 5</code> into a plain BST: it becomes a linked list to the right. Height = n. Search/insert/delete all O(n).
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              That&apos;s why production code uses <strong>self-balancing</strong> variants — AVL and red-black trees — that rotate on insert to keep height O(log n).
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mt-2 mb-2">AVL vs Red-Black — the tradeoff Java picked</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">AVL</th>
                <th className="px-4 py-3 font-semibold">Red-Black</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3">Max height</td>
                <td className="px-4 py-3 font-mono text-xs">≈ 1.44 log n</td>
                <td className="px-4 py-3 font-mono text-xs">≈ 2 log n</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Rotations per insert</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">More (stricter balance)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fewer</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Read-heavy workload</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Slightly faster (shorter)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Slightly slower</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Write-heavy workload</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Slower (more rotations)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Faster</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Used in Java</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">TreeMap, TreeSet, HashMap tree-bins</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-4 mb-2">TreeMap operations you actually use</h3>
        <CodeBlock lang="java" caption="The five TreeMap moves worth memorizing">{`TreeMap<Integer, String> tm = new TreeMap<>();
tm.put(10, "a"); tm.put(20, "b"); tm.put(30, "c");

tm.floorKey(25);      // 20 — largest key ≤ 25
tm.ceilingKey(25);    // 30 — smallest key ≥ 25
tm.firstKey();        // 10
tm.lastKey();         // 30
tm.subMap(15, 25);    // {20=b} — half-open range [15, 25)`}</CodeBlock>

        <h3 className="text-base font-semibold mt-4 mb-2">TreeMap vs HashMap — the picker</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
          <li><strong>Just key → value lookup?</strong> HashMap. It&apos;s ~5× faster on average.</li>
          <li><strong>Need sorted iteration?</strong> TreeMap. HashMap&apos;s iteration order is unspecified.</li>
          <li><strong>Range queries (&quot;all keys between A and B&quot;)?</strong> TreeMap. HashMap can&apos;t do this without scanning.</li>
          <li><strong>floor/ceiling/predecessor/successor?</strong> TreeMap, O(log n). HashMap doesn&apos;t support these.</li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/bst" className="text-emerald-600 hover:underline">Module 14 — Binary search trees</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Heap mechanics */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Heap mechanics — the array trick</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A binary heap is a complete binary tree, but you never allocate nodes. You allocate an array and the parent/child relationships are pure arithmetic.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={heapChart} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">The index formulas</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 font-mono">
              <li><code>parent(i) = (i - 1) / 2</code></li>
              <li><code>leftChild(i)  = 2*i + 1</code></li>
              <li><code>rightChild(i) = 2*i + 2</code></li>
            </ul>
            <p className="text-xs text-slate-500 mt-3 font-sans">
              No pointers, no node objects — just integer math. This is why heap-sort is in-place.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">The shape invariant</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Complete:</strong> every level full except possibly the last, which fills left-to-right.</li>
              <li><strong>Heap order:</strong> every parent ≤ both children (min-heap), or ≥ both (max-heap).</li>
              <li>No ordering between siblings. The root is the min/max — nothing else is guaranteed.</li>
            </ul>
          </div>
        </div>

        <CodeBlock lang="java" caption="Sift-up — called by offer() after appending at the end">{`void siftUp(int[] heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[i] >= heap[parent]) break;  // min-heap order satisfied
        swap(heap, i, parent);
        i = parent;
    }
}
// O(log n) — worst case bubbles all the way to root.`}</CodeBlock>

        <CodeBlock lang="java" caption="Sift-down — called by poll() after swapping root with last">{`void siftDown(int[] heap, int n, int i) {
    while (true) {
        int left = 2*i + 1, right = 2*i + 2, smallest = i;
        if (left  < n && heap[left]  < heap[smallest]) smallest = left;
        if (right < n && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;             // heap property restored
        swap(heap, i, smallest);
        i = smallest;
    }
}
// O(log n). Key detail: swap with the SMALLER child, not just any child.`}</CodeBlock>

        <Callout variant="warn">
          <strong>PriorityQueue is NOT FIFO.</strong> The name is misleading. It&apos;s &quot;extract-min-first.&quot; <code>poll()</code> returns the smallest element by natural ordering or the supplied comparator. For max-heap, pass <code>Comparator.reverseOrder()</code>. For top-K largest, use a min-heap of size K (counterintuitive but right).
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/heaps" className="text-emerald-600 hover:underline">Module 15 — Heaps &amp; PriorityQueue</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — The 4 named patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Four patterns that show up everywhere</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          If you recognize the shape of the problem, the code almost writes itself.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pattern 1 · Top-K with a bounded heap</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              For top-K <em>largest</em>, keep a <strong>min-heap of size K</strong>. After every element, evict the heap&apos;s min if the heap grew past K. At the end, the heap contains exactly the K largest. Time O(n log K), space O(K) — much better than sorting which is O(n log n).
            </p>
            <CodeBlock lang="java">{`int kthLargest(int[] nums, int k) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();  // min-heap
    for (int x : nums) {
        pq.offer(x);
        if (pq.size() > k) pq.poll();  // evict smallest
    }
    return pq.peek();   // top of min-heap = Kth largest overall
}`}</CodeBlock>
            <p className="text-xs text-slate-500 mt-3">
              Canonical LC: 215 (Kth Largest), 347 (Top K Frequent), 1046 (Last Stone Weight).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pattern 2 · Frequency counting</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Build a <code>Map&lt;T, Integer&gt;</code> in one pass. Use <code>merge</code> to avoid the &quot;get-or-default + put&quot; dance. Backbone of anagram problems, sliding-window counting, top-K-frequent.
            </p>
            <CodeBlock lang="java">{`Map<Character, Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) {
    freq.merge(c, 1, Integer::sum);   // ++ counter, or 1 if absent
}
// For lowercase ASCII only: int[] freq = new int[26]; freq[c - 'a']++;
// 5-10x faster — no boxing, no hashing.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pattern 3 · Anagram via sorted key (group-by)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Two strings are anagrams iff their sorted character sequences are equal. Group anagrams by using the sorted form as the HashMap key. Each word costs O(k log k) to sort.
            </p>
            <CodeBlock lang="java">{`List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`}</CodeBlock>
            <p className="text-xs text-slate-500 mt-3">
              Faster alternative: build a 26-int frequency vector and stringify it (<code>&quot;a1b2c0...&quot;</code>). O(k) per word.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pattern 4 · Lowest Common Ancestor via recursion</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Recurse left and right. If both children return non-null, the current node <em>is</em> the LCA. Otherwise return whichever side found one of the targets. O(n) time, O(h) space.
            </p>
            <CodeBlock lang="java">{`TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left  = lca(root.left,  p, q);
    TreeNode right = lca(root.right, p, q);
    if (left != null && right != null) return root;  // split point
    return left != null ? left : right;              // bubble up
}`}</CodeBlock>
            <p className="text-xs text-slate-500 mt-3">
              On a BST you can do better: walk down comparing keys — O(h) without exploring both sides.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Five gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these is a real bug someone shipped. Recognizing the shape in code review saves outages.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Overriding <code>equals</code> without <code>hashCode</code></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Two objects compare equal but land in different buckets. <code>map.get(equalKey)</code> returns <code>null</code> even though the key &quot;exists.&quot; The compiler won&apos;t catch this — your tests will if you remember to write them.
            </p>
            <CodeBlock lang="java">{`// BAD — equals overridden, hashCode inherited from Object (identity)
class User {
    int id;
    @Override public boolean equals(Object o) { /* compares id */ }
    // hashCode NOT overridden → different objects, different buckets
}

// GOOD — always override both, together
class User {
    int id;
    @Override public boolean equals(Object o) { /* ... */ }
    @Override public int hashCode() { return Objects.hash(id); }
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Mutating a key after insertion</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The key&apos;s hash is computed at insert time. Mutating a field used in <code>hashCode</code> moves the &quot;correct&quot; bucket but the entry stays where it was. The key becomes unreachable via <code>get</code>.
            </p>
            <CodeBlock lang="java">{`// BAD — mutating a key that's already in a map
User u = new User(1, "Alice");
map.put(u, "data");
u.name = "Bob";        // hashCode changes; entry is now in the WRONG bucket
map.get(u);            // null — even though the same object reference!

// GOOD — keys should be immutable. Use a fresh object or a primitive key.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · <code>a - b</code> in a Comparator (int overflow)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The classic &quot;works in tests, breaks in prod with extreme values.&quot; If <code>a = Integer.MAX_VALUE</code> and <code>b = -1</code>, <code>a - b</code> overflows to a negative number — the comparator lies and the heap order is wrong.
            </p>
            <CodeBlock lang="java">{`// BAD — silent overflow on extreme inputs
PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> a - b);

// GOOD — overflow-safe
PriorityQueue<Integer> pq = new PriorityQueue<>(Integer::compare);
// or
PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.naturalOrder());`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Treating PriorityQueue as FIFO</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              It implements <code>Queue</code> but it&apos;s not first-in-first-out. <code>poll()</code> returns the minimum, not the oldest. Iteration order is unspecified — only <code>peek()</code> sees the min.
            </p>
            <CodeBlock lang="java">{`// BAD — expecting FIFO from a PriorityQueue
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(3); pq.offer(7);
pq.poll();   // returns 3, NOT 5

// GOOD — if you wanted FIFO, use ArrayDeque
Deque<Integer> q = new ArrayDeque<>();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Validating BST by only checking immediate children</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The invariant is global, not local. A node with <code>left.val &lt; root.val &lt; right.val</code> can still violate BST if a <em>descendant</em> of <code>left</code> exceeds <code>root.val</code>. Validate by passing down (min, max) bounds.
            </p>
            <CodeBlock lang="java">{`// BAD — only checks parent vs immediate children
boolean isBST(TreeNode n) {
    if (n == null) return true;
    if (n.left  != null && n.left.val  >= n.val) return false;
    if (n.right != null && n.right.val <= n.val) return false;
    return isBST(n.left) && isBST(n.right);
}

// GOOD — propagate bounds down
boolean isBST(TreeNode n, Long min, Long max) {
    if (n == null) return true;
    if (n.val <= min || n.val >= max) return false;
    return isBST(n.left, min, (long) n.val)
        && isBST(n.right, (long) n.val, max);
}
// Call: isBST(root, Long.MIN_VALUE, Long.MAX_VALUE)`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You need 'find the K largest items in a stream of N numbers' where N is huge and K is small. What's the right data structure?"
          options={[
            { label: "Sort the whole stream descending and take the first K.", explanation: "O(n log n) and requires holding all n items. Heap-based solution is O(n log K) with only O(K) memory." },
            { label: "A min-heap of size K. After each new item, evict the smallest if size > K.", correct: true, explanation: "Right. Counterintuitive name but correct shape: the min-heap's root is the Kth-largest-so-far, and any new item smaller than it is irrelevant. O(n log K) time, O(K) space." },
            { label: "A max-heap of size K — you want the largest, so max-heap.", explanation: "A max-heap can't tell you the Kth largest in O(1) — the root is the largest. With a min-heap of size K, the root IS the Kth largest. Counterintuitive but correct." },
            { label: "A TreeMap keyed by value.", explanation: "TreeMap works (O(n log K) if you size-cap it) but it's overkill — you don't need range queries, just max-of-min behavior. PriorityQueue is the idiomatic answer." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You override equals() on a User class but forget to override hashCode(). What goes wrong when you use User as a HashMap key?"
          options={[
            { label: "Compile error — Java enforces the equals/hashCode pair.", explanation: "Java does NOT enforce this at compile time. It's a runtime contract that produces silent bugs." },
            { label: "Two objects that are .equals() will land in different buckets, so map.get(equalKey) returns null even though 'the key exists.'", correct: true, explanation: "Right. hashCode (inherited from Object) returns identity-based hashes, so two equal objects hash to different buckets. The map silently 'loses' the key — one of the worst kinds of bug to debug." },
            { label: "The map throws IllegalStateException on the second put().", explanation: "No runtime check. The bug is silent corruption." },
            { label: "Performance degrades to O(n) but lookups still return the right value.", explanation: "Lookups return wrong values (null when they shouldn't), not just slow values." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="In a Java HashMap, a single bucket has 12 entries due to many keys hashing to the same bucket. The table capacity is 128. What's the lookup cost for that bucket?"
          options={[
            { label: "O(12) — walks the linked list.", explanation: "Before Java 8 this would be right. Since Java 8 (with capacity ≥ 64 and bucket size ≥ 8), the bucket converts to a red-black tree." },
            { label: "O(log 12) — Java 8+ converts the bucket to a red-black tree once it has 8+ entries on a table of capacity ≥ 64.", correct: true, explanation: "Right. The treeify threshold (8) plus MIN_TREEIFY_CAPACITY (64) trigger the conversion. This is Java's defense against hash-collision attacks — worst-case bucket cost is O(log n) rather than O(n)." },
            { label: "O(1) — HashMap is always O(1).", explanation: "O(1) is the AVERAGE case. Worst case with collisions is O(n) pre-Java-8, O(log n) post-Java-8." },
            { label: "O(128) — has to scan the table.", explanation: "HashMap never scans the table for a get — it goes directly to the bucket index." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What's the difference between inorder traversal of a BST and inorder traversal of a general binary tree?"
          options={[
            { label: "Inorder doesn't work on a general tree, only on a BST.", explanation: "Inorder works on any binary tree. It just produces different outputs." },
            { label: "On a BST, inorder yields keys in sorted order. On a general tree, the order is whatever the tree happens to produce — not necessarily sorted.", correct: true, explanation: "Right. This is the defining property of BST: inorder = sorted. It's also the standard BST-validation strategy (do an inorder walk and check that each key is greater than the previous)." },
            { label: "Inorder is O(n log n) on a BST and O(n) on a general tree.", explanation: "Inorder is O(n) for any tree — you visit each node exactly once. The data structure doesn't affect the traversal time." },
            { label: "There's no difference; the algorithm is identical and produces the same output ordering on both.", explanation: "The algorithm is identical (left, root, right) but the OUTPUT differs because BST nodes are arranged by key, so left-root-right yields sorted order." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You implement a Comparator with (a, b) -> a - b for an int PriorityQueue. The QA team reports the priority order is occasionally wrong but they can't reproduce it. What's likely happening?"
          options={[
            { label: "Integer overflow: when a = Integer.MAX_VALUE and b is negative, a - b wraps to a negative result, flipping the comparison.", correct: true, explanation: "Right. This is the classic 'works in tests, breaks in prod' bug. The fix is Integer::compare or Comparator.naturalOrder() — both are overflow-safe." },
            { label: "PriorityQueue doesn't accept lambda comparators.", explanation: "It does, since Java 8. The bug is in the math, not the syntax." },
            { label: "Comparators must be Serializable in Java; lambdas aren't by default.", explanation: "That's only an issue for distributed/persisted comparators. Not relevant to a runtime ordering bug." },
            { label: "The heap is being mutated concurrently.", explanation: "Concurrent modification would cause exceptions or corruption, not 'occasionally wrong order.' The pattern (rare failures with extreme values) screams overflow." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-sky-200 dark:border-sky-900 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">
          Phase 3 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now reach for the right keyed structure on sight</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          HashMap mechanics, the equals/hashCode contract, four tree walks, the BST invariant and its self-balancing rescue, the heap array trick, and the four patterns — top-K, frequency, anagram grouping, LCA. That&apos;s the entire &quot;keyed lookup and tree-shaped data&quot; chapter compressed.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 4 — Graphs.</strong> Nodes and edges, BFS/DFS on graphs, shortest paths, union-find, advanced graph algorithms. The structures you just learned (queue, stack, heap, HashMap for visited) are the building blocks.
        </p>
        <Link
          href="/courses/dsa/modules/graphs-intro"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Graphs →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-3-revision" />
    </article>
  );
}
