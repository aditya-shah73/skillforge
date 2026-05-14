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
  { id: "setup", title: "What a heap is — and why it's an array" },
  { id: "ops", title: "Sift-up, sift-down, build-heap" },
  { id: "pq", title: "Java's PriorityQueue — when (and when not) to reach for it" },
  { id: "topk", title: "The top-K pattern" },
  { id: "project", title: "Project: build a MinHeap from scratch" },
  { id: "final", title: "Final quiz" },
];

export default function HeapsModule() {
  const mod = getModuleBySlug("heaps")!;

  // The fundamental picture: a complete binary tree, drawn over an array
  const heapShape = `
flowchart TD
    A["i=0<br/>1"] --> B["i=1<br/>3"]
    A --> C["i=2<br/>2"]
    B --> D["i=3<br/>7"]
    B --> E["i=4<br/>5"]
    C --> F["i=5<br/>4"]
    C --> G["i=6<br/>9"]
    D --> H["i=7<br/>8"]
    style A fill:#10b981,color:#fff,stroke:#047857
    style B fill:#34d399,color:#000,stroke:#059669
    style C fill:#34d399,color:#000,stroke:#059669
    style D fill:#a7f3d0,color:#000,stroke:#10b981
    style E fill:#a7f3d0,color:#000,stroke:#10b981
    style F fill:#a7f3d0,color:#000,stroke:#10b981
    style G fill:#a7f3d0,color:#000,stroke:#10b981
    style H fill:#d1fae5,color:#000,stroke:#10b981
  `.trim();

  // Sift-down trace: removing the min from [1, 3, 2, 7, 5, 4, 9]
  const siftDown = `
flowchart TB
    subgraph S0["Step 0 · pull min, move last to root"]
        direction TB
        A0["9 (was last)"] --> B0["3"]
        A0 --> C0["2"]
        B0 --> D0["7"]
        B0 --> E0["5"]
        C0 --> F0["4"]
    end
    subgraph S1["Step 1 · 9 > min(3,2)=2 → swap with 2"]
        direction TB
        A1["2"] --> B1["3"]
        A1 --> C1["9"]
        B1 --> D1["7"]
        B1 --> E1["5"]
        C1 --> F1["4"]
    end
    subgraph S2["Step 2 · 9 > 4 → swap with 4. Done."]
        direction TB
        A2["2"] --> B2["3"]
        A2 --> C2["4"]
        B2 --> D2["7"]
        B2 --> E2["5"]
        C2 --> F2["9"]
    end
    S0 --> S1 --> S2
    style A0 fill:#fca5a5,color:#000,stroke:#dc2626
    style A1 fill:#10b981,color:#fff,stroke:#047857
    style C1 fill:#fca5a5,color:#000,stroke:#dc2626
    style A2 fill:#10b981,color:#fff,stroke:#047857
    style C2 fill:#34d399,color:#000,stroke:#059669
    style F2 fill:#fca5a5,color:#000,stroke:#dc2626
  `.trim();

  // Top-K pattern: bounded heap of size k
  const topK = `
flowchart LR
    subgraph IN["Stream / array"]
        direction LR
        S1["7"] --> S2["1"] --> S3["9"] --> S4["3"] --> S5["8"] --> S6["2"] --> S7["6"]
    end
    IN -->|"each x: heap.offer(x)<br/>if heap.size() &gt; k: heap.poll()"| H
    subgraph H["MinHeap, k=3<br/>top 3 largest seen so far"]
        direction TB
        R["7"] --> L["8"]
        R --> RR["9"]
    end
    H -->|"final contents"| OUT["{7, 8, 9}<br/>(top-3 largest after stream ends)"]
    style IN fill:#1e293b,color:#fff,stroke:#475569
    style R fill:#10b981,color:#fff,stroke:#047857
    style L fill:#34d399,color:#000,stroke:#059669
    style RR fill:#34d399,color:#000,stroke:#059669
    style OUT fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="heaps" />
      <ModuleProgress moduleSlug="heaps" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 3 · Module 13 · Closeout
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · ends with Phase 3 wrap-up</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="setup" title="I understand the heap shape and the array trick" xp={20}>
      <section>
        <h2 id="setup">What a heap is — and why it&apos;s an array</h2>

        <p>
          A <strong>heap</strong> is a complete binary tree with one rule: every parent is{" "}
          <em>≤</em> its children (min-heap) or <em>≥</em> its children (max-heap). That&apos;s the entire definition.
          Note what&apos;s <em>not</em> required: siblings have no order with respect to each other, and the tree is
          not sorted. The min-heap below is a perfectly valid heap — but it&apos;s not a BST, and reading its leaves
          left-to-right does not give you sorted order.
        </p>

        <Mermaid chart={heapShape} />

        <p>
          The shape rule is just as important as the order rule. <strong>Complete</strong> means every level is filled
          except possibly the last, and the last level fills left-to-right. This shape constraint is what makes the
          array trick work.
        </p>

        <h3>The array trick</h3>

        <p>
          Number the nodes level-by-level, left-to-right, starting at <code>0</code>. Now write them into an array at
          those indices:
        </p>

        <CodeBlock lang="java">{`index:  0  1  2  3  4  5  6  7
value:  1  3  2  7  5  4  9  8`}</CodeBlock>

        <p>For any index <code>i</code>:</p>

        <ul>
          <li><code>parent(i) = (i - 1) / 2</code> &nbsp;— integer division</li>
          <li><code>left(i)   = 2 * i + 1</code></li>
          <li><code>right(i)  = 2 * i + 2</code></li>
        </ul>

        <Callout variant="insight" title="Why this is a quietly genius data structure">
          A binary tree, but with no node objects, no left/right pointers, no allocations per node. Just an array and
          three arithmetic helpers. Cache-friendly. Heap memory overhead approaches zero. And the completeness rule
          is what enables it — without it, the indices would have gaps and the math wouldn&apos;t work.
        </Callout>

        <p>
          (Some textbooks index from <code>1</code> instead of <code>0</code>, which gives the cleaner formulas{" "}
          <code>parent = i/2</code>, <code>left = 2i</code>, <code>right = 2i+1</code>. Java code typically uses
          0-based — match whatever convention you&apos;re reading in.)
        </p>

        <h3>What heaps are good at</h3>

        <p>A heap supports two fast operations:</p>

        <ul>
          <li><code>peek()</code> — return the min (or max) in <strong>O(1)</strong></li>
          <li><code>poll()</code> — remove and return the min (or max) in <strong>O(log n)</strong></li>
          <li><code>offer(x)</code> — insert in <strong>O(log n)</strong></li>
        </ul>

        <p>
          What it&apos;s <em>not</em> good at: finding an arbitrary element (O(n) — you have to scan), getting elements
          in sorted order without removing them, or finding the second-smallest fast (it&apos;s one of the root&apos;s
          children, but you don&apos;t know which without comparing). If you need any of those, you want a TreeMap
          or TreeSet from the previous module.
        </p>

        <Quiz
          kind="Quick check"
          question="In a min-heap, what is the relationship between an element and its grandchild?"
          options={[
            { label: "The element is always less than its grandchild.", correct: true, explanation: "Right. Heap order is transitive: if parent ≤ child and child ≤ grandchild, then parent ≤ grandchild. So every node is ≤ all of its descendants." },
            { label: "There's no defined relationship.", explanation: "There is — heap order is transitive down the tree." },
            { label: "The element is greater than its grandchild.", explanation: "Backwards. In a min-heap, parents are smaller than descendants." },
            { label: "Equal.", explanation: "They're not required to be equal; the order is ≤, and most interesting heaps have distinct values." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="If a min-heap stores [1, 3, 2, 7, 5, 4, 9, 8], where in the array is the parent of index 6?"
          options={[
            { label: "Index 3.", explanation: "(6-1)/2 = 2 in integer arithmetic. Index 3 is left(1), not parent(6)." },
            { label: "Index 2.", correct: true, explanation: "Right. parent(6) = (6-1)/2 = 2. So array[2] = 2 is the parent of array[6] = 9. Sanity check: 2 ≤ 9, heap property holds." },
            { label: "Index 5.", explanation: "5 is left(2), the sibling of index 6." },
            { label: "Index 12.", explanation: "12 = 2*6, but that's a child formula, not a parent formula. (And there's no index 12 here anyway.)" },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Operations ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="ops" title="I can sift up, sift down, and build a heap in O(n)" xp={25}>
      <section>
        <h2 id="ops">Sift-up, sift-down, build-heap</h2>

        <p>
          All three core heap operations boil down to two primitives: <strong>sift-up</strong> (used by{" "}
          <code>offer</code>) and <strong>sift-down</strong> (used by <code>poll</code>). Each walks one path from a
          leaf to the root or vice versa — and a complete binary tree of <em>n</em> nodes has height{" "}
          <code>⌊log₂ n⌋</code>, which is where the O(log n) cost comes from.
        </p>

        <h3>Sift-up — the offer path</h3>

        <p>
          To insert a new element: append it to the end of the array (preserving completeness), then walk it up toward
          the root, swapping with its parent whenever the heap property is violated.
        </p>

        <CodeBlock lang="java">{`private void siftUp(int i) {
    while (i > 0) {
        int p = (i - 1) / 2;
        if (data[i] >= data[p]) return;   // heap property holds — done
        swap(i, p);
        i = p;
    }
}

public void offer(int x) {
    if (size == data.length) grow();
    data[size] = x;
    siftUp(size);
    size++;
}`}</CodeBlock>

        <p>
          The element rises until either it reaches the root or its parent is smaller. Path length ≤ height ≤{" "}
          <code>log₂ n</code>, so worst-case O(log n) compares and swaps.
        </p>

        <h3>Sift-down — the poll path</h3>

        <p>
          To remove the min: take it from index 0, move the last element into the root (still complete), then walk it
          down, swapping with its <em>smaller</em> child whenever the heap property is violated.
        </p>

        <Mermaid chart={siftDown} />

        <CodeBlock lang="java">{`private void siftDown(int i) {
    while (true) {
        int l = 2 * i + 1, r = 2 * i + 2;
        int smallest = i;
        if (l < size && data[l] < data[smallest]) smallest = l;
        if (r < size && data[r] < data[smallest]) smallest = r;
        if (smallest == i) return;        // heap property holds — done
        swap(i, smallest);
        i = smallest;
    }
}

public int poll() {
    if (size == 0) throw new NoSuchElementException();
    int min = data[0];
    size--;
    data[0] = data[size];                  // move last to root
    if (size > 0) siftDown(0);
    return min;
}`}</CodeBlock>

        <Callout variant="warn" title="The classic sift-down bug">
          You must compare against the <em>smaller</em> of the two children, not just the left one. If you swap with
          the left child blindly, you can violate the heap property on the right. The two <code>if</code>s plus the{" "}
          <code>smallest</code> tracker handle this correctly: each iteration picks the genuine minimum among
          parent, left, and right.
        </Callout>

        <h3>Build-heap — O(n), not O(n log n)</h3>

        <p>
          Suppose you have a raw, unsorted array and want to turn it into a heap. The naive approach is to call{" "}
          <code>offer</code> n times — that&apos;s O(n log n). But there&apos;s a clever trick: <strong>sift-down
          every internal node, starting from the last one and walking backwards to the root.</strong>
        </p>

        <CodeBlock lang="java">{`public static void heapify(int[] a) {
    // last internal node is at (n/2 - 1); leaves are already valid heaps of size 1
    for (int i = a.length / 2 - 1; i >= 0; i--) {
        siftDown(a, i, a.length);
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Why heapify is O(n), not O(n log n)">
          Half the nodes are leaves, and they need zero work. A quarter of the nodes are at height 1 and need at most
          1 swap. An eighth are at height 2 and need at most 2 swaps. The total work is{" "}
          <code>n/2 · 0 + n/4 · 1 + n/8 · 2 + n/16 · 3 + ...</code>, which sums to O(n). The asymmetry is the win:
          sift-down does most of its work near the leaves where there are many nodes but small heights, instead of
          near the root where there are few nodes but high cost.
        </Callout>

        <h3>Heapsort</h3>

        <p>
          Once you have heapify, sorting is almost free: heapify the array (O(n)), then repeatedly poll the min into
          position. The standard trick to do this in-place is to use a <em>max-heap</em> and swap the root with the
          last unsorted slot — that ends up giving you the array in ascending order with no extra allocation. Total:
          O(n log n) time, O(1) extra space, not stable.
        </p>

        <p>
          Java&apos;s <code>Arrays.sort</code> uses dual-pivot quicksort for primitives and Timsort for objects, not
          heapsort — quicksort has better cache behavior in practice, and Timsort wins on partially-sorted data. But
          heapsort is the algorithm you reach for when you need a guaranteed O(n log n) worst case with O(1) space.
        </p>

        <Quiz
          kind="Operation check"
          question="Why does the for loop in heapify start at n/2 - 1 instead of n - 1?"
          options={[
            { label: "Bug — it should start at n - 1.", explanation: "Then you'd call siftDown on leaves, which is wasted work. Leaves can't sift down — they have no children." },
            { label: "Indices [n/2, n-1] are leaves; they're already valid one-element heaps and don't need sifting.", correct: true, explanation: "Right. In a complete binary tree of n nodes, exactly the bottom half are leaves. Sifting them down is a no-op. Starting at the last internal node skips that wasted work — and it's why the proof of O(n) goes through cleanly." },
            { label: "It's a Java optimization.", explanation: "It's an algorithmic optimization, language-independent." },
            { label: "To avoid out-of-bounds errors.", explanation: "Sift-down already bounds-checks via 'l < size'. The reason is that leaves don't need sifting." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · PriorityQueue ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="pq" title="I know what java.util.PriorityQueue is and isn't" xp={20}>
      <section>
        <h2 id="pq">Java&apos;s PriorityQueue — when (and when not) to reach for it</h2>

        <p>
          <code>java.util.PriorityQueue&lt;E&gt;</code> is the JDK&apos;s array-backed binary min-heap. It implements{" "}
          <code>Queue&lt;E&gt;</code>, but <strong>it is not a FIFO queue</strong> — <code>poll()</code> returns the
          smallest element by natural order (or by your <code>Comparator</code>), not the first one inserted. This
          confuses people every year.
        </p>

        <CodeBlock lang="java">{`PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(7);
pq.offer(1);
pq.offer(5);
pq.poll();   // 1, not 7
pq.poll();   // 5
pq.poll();   // 7`}</CodeBlock>

        <h3>Max-heap, custom order, pairs</h3>

        <p>
          To get a max-heap or any custom order, pass a <code>Comparator</code>:
        </p>

        <CodeBlock lang="java">{`// Max-heap of integers
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());

// Min-heap of (frequency, value) pairs, ordered by frequency
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);

// Min-heap by string length, then lexicographic
PriorityQueue<String> p = new PriorityQueue<>(
    Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())
);`}</CodeBlock>

        <Callout variant="warn" title="Don't use a - b for comparators when overflow is possible">
          For <code>Integer</code> in the typical [-10⁹, 10⁹] LeetCode range, <code>(a, b) -&gt; a - b</code> is fine.
          For full-range ints, prefer <code>Integer.compare(a, b)</code>: subtraction overflows when{" "}
          <code>a = Integer.MAX_VALUE</code> and <code>b = -1</code>, and you&apos;ll get a wrong-order bug that
          passes 99% of test cases. <code>Long</code> values: always use <code>Long.compare</code>.
        </Callout>

        <h3>Cost table</h3>

        <ul>
          <li><code>offer(x)</code>, <code>poll()</code>, <code>remove()</code> at root: <strong>O(log n)</strong></li>
          <li><code>peek()</code>: <strong>O(1)</strong></li>
          <li><code>contains(x)</code>, <code>remove(x)</code> for arbitrary x: <strong>O(n)</strong> — has to scan</li>
          <li>Construction from a collection of size n: <strong>O(n)</strong> via internal heapify</li>
          <li>Iteration order: <strong>not sorted</strong> — it&apos;s array order, which is heap order, which is meaningless to humans</li>
        </ul>

        <Callout variant="insight" title="The construction shortcut">
          <code>new PriorityQueue&lt;&gt;(collection)</code> is O(n), not O(n log n). The constructor calls a private{" "}
          <code>heapify()</code>. So when you have all elements up front, hand them to the constructor in bulk —
          don&apos;t loop and offer them one at a time. Same algorithm, half the asymptotic cost.
        </Callout>

        <h3>What PriorityQueue is <em>not</em></h3>

        <ul>
          <li><strong>Not thread-safe.</strong> For concurrent use, see <code>PriorityBlockingQueue</code>.</li>
          <li><strong>Not a stable heap.</strong> Equal-priority elements come out in unspecified order. If you need FIFO-among-ties, store an insertion counter alongside the value and break ties on it.</li>
          <li><strong>Not efficient for &quot;decrease-key.&quot;</strong> If you need to update an element&apos;s priority (e.g., Dijkstra with the textbook implementation), the standard trick is to insert the updated copy and skip stale entries when polling. Indexed/Fibonacci heaps support real decrease-key but the JDK doesn&apos;t ship one.</li>
          <li><strong>Not iterable in sorted order.</strong> The only way to drain a PQ in order is to repeatedly poll.</li>
        </ul>

        <ClassifyChallenge
          title="Heap or something else?"
          prompt="For each problem, decide whether the right structure is a heap or one of the structures you saw earlier."
          buckets={[
            { id: "heap", label: "Heap (PriorityQueue)", color: "emerald" },
            { id: "other", label: "Something else", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Continuously merge K sorted streams into one sorted output.", answer: "heap", explanation: "Classic: heap of (value, streamIndex) pairs, size K. Poll smallest, push the next from that stream. O(N log K)." },
            { id: "2", label: "Find the median of a sliding window of size 1000 over a long stream.", answer: "heap", explanation: "Two-heap median: max-heap for the lower half, min-heap for the upper half. Insert and rebalance per element." },
            { id: "3", label: "Dispatch the highest-priority task next, where priorities can change after enqueue.", answer: "other", explanation: "Standard PQ has no decrease-key. Use either an indexed heap (custom) or rely on lazy deletion — or for small task sets, a TreeMap keyed by priority." },
            { id: "4", label: "Look up customer record by ID.", answer: "other", explanation: "HashMap. A heap doesn't support keyed lookup." },
            { id: "5", label: "Top 100 most frequent words in a large document.", answer: "heap", explanation: "Frequency count in a HashMap, then a min-heap of size 100 over (count, word). The bounded-size top-K pattern from the next section." },
            { id: "6", label: "Get the elements in sorted order, repeatedly.", answer: "other", explanation: "TreeSet or TreeMap — they iterate in sorted order in O(n). A heap can't do this without destructively polling everything." },
            { id: "7", label: "Schedule events for the next earliest time, with new events arriving constantly.", answer: "heap", explanation: "Min-heap keyed by event time. peek to know what's next, poll to fire it, offer when new ones arrive. The pattern at the heart of every event loop." },
            { id: "8", label: "Check membership in a small set of allowed user roles.", answer: "other", explanation: "HashSet. Membership is O(1) hashing; you'd never reach for a heap." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Top-K ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="topk" title="I can apply the top-K pattern reflexively" xp={25}>
      <section>
        <h2 id="topk">The top-K pattern</h2>

        <p>
          One pattern dominates the heap question family on LeetCode: <strong>top-K</strong>. The setup: you have a
          stream or collection of N items, and you want the K largest (or smallest, or most frequent) — where K is
          small relative to N. The naive solution is to sort the whole collection in O(N log N). The heap solution is
          O(N log K), which is dramatically faster when K is small.
        </p>

        <Mermaid chart={topK} />

        <h3>The bounded-heap trick</h3>

        <p>
          For top-K <em>largest</em>, use a <strong>min-heap of size K</strong>. Counterintuitive, but: the smallest
          element in the heap is exactly the &quot;cutoff&quot; — anything smaller than it is not in the top K. So
          for each new element, peek the heap; if the new element beats the cutoff, kick the cutoff out and admit
          the new one.
        </p>

        <CodeBlock lang="java">{`public static int[] topKLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // natural order = min-heap
    for (int x : nums) {
        minHeap.offer(x);
        if (minHeap.size() > k) minHeap.poll();   // drop the smallest of the top-k-so-far
    }
    int[] out = new int[k];
    for (int i = k - 1; i >= 0; i--) out[i] = minHeap.poll();   // drain into descending order
    return out;
}`}</CodeBlock>

        <Callout variant="insight" title="Why min-heap for top-K largest (and not max-heap)">
          To maintain the top K largest seen so far, you need fast access to the <em>smallest</em> of the survivors —
          that&apos;s the one to evict when something larger arrives. So min-heap. By symmetry: for top-K smallest,
          use a max-heap. This swap-the-comparator-orientation step trips people up; if you find yourself confused
          mid-interview, the rule is &quot;heap holds the K survivors; root is the one most likely to be evicted.&quot;
        </Callout>

        <h3>Three canonical problems</h3>

        <h4>LC 215 · Kth Largest Element in an Array</h4>
        <p>
          Direct application: top-K largest, then return the heap root (the K-th largest is the smallest among the top K).
        </p>

        <CodeBlock lang="java">{`public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int x : nums) {
        minHeap.offer(x);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}`}</CodeBlock>

        <h4>LC 1046 · Last Stone Weight</h4>
        <p>
          Repeatedly take the two heaviest stones and smash them. Max-heap. Poll twice, push the difference back if
          nonzero, repeat until 0 or 1 left.
        </p>

        <CodeBlock lang="java">{`public int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
    for (int s : stones) max.offer(s);
    while (max.size() > 1) {
        int a = max.poll();
        int b = max.poll();
        if (a != b) max.offer(a - b);
    }
    return max.isEmpty() ? 0 : max.poll();
}`}</CodeBlock>

        <h4>LC 347 · Top K Frequent Elements</h4>
        <p>
          Two-step pattern that braids together everything from this phase. <strong>Step 1:</strong> count
          frequencies with a HashMap (Module 9). <strong>Step 2:</strong> top-K over the map entries by count.
        </p>

        <CodeBlock lang="java">{`public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int x : nums) freq.merge(x, 1, Integer::sum);

    // Min-heap of size k, ordered by count
    PriorityQueue<Map.Entry<Integer, Integer>> heap =
        new PriorityQueue<>(Comparator.comparingInt(Map.Entry::getValue));

    for (var e : freq.entrySet()) {
        heap.offer(e);
        if (heap.size() > k) heap.poll();
    }

    int[] out = new int[k];
    for (int i = k - 1; i >= 0; i--) out[i] = heap.poll().getKey();
    return out;
}`}</CodeBlock>

        <Callout variant="info" title="Bucket sort beats heap here">
          LC 347 has an O(n) solution: bucket-sort entries by frequency (since frequency is bounded by n), then walk
          buckets from highest to lowest until you collect K items. The heap version is O(n log k) and is what
          interviewers usually expect — but if asked &quot;can you do better,&quot; bucket sort is the answer. Same
          tradeoff every time: heaps are simple and general; bucket sort wins when the value range is bounded.
        </Callout>

        <h3>Quickselect — the alternative for &quot;K-th element&quot;</h3>

        <p>
          For exactly the &quot;K-th largest/smallest&quot; flavor (not the full top-K list), <strong>quickselect</strong>{" "}
          finishes in O(n) average time — better than a heap&apos;s O(n log k). It&apos;s a partial quicksort: pick a
          pivot, partition, recurse only into the side that contains the answer. Worst-case O(n²) without
          median-of-medians, but with random pivots it&apos;s reliably linear in practice. Worth knowing exists; the
          heap solution is what you&apos;ll write 95% of the time because it&apos;s shorter and harder to get wrong.
        </p>

        <PartRecap
          title="The top-K mental model"
          gist="A heap is a partial sort. When you need the extreme few out of many, a bounded heap of size K does in O(N log K) what a full sort would do in O(N log N)."
          points={[
            { takeaway: "\"K out of N where K is small\" → bounded heap.", detail: "Top-K largest → min-heap of size K. Top-K smallest → max-heap of size K. The heap holds the survivors; the root is the eviction candidate." },
            { takeaway: "\"Always smallest/largest from a changing set\" → unbounded heap.", detail: "Event scheduler, Dijkstra, merge K sorted lists. The heap holds the entire candidate set, and you keep polling and offering as the world evolves." },
            { takeaway: "\"Median of a stream\" → two heaps.", detail: "Max-heap for the lower half, min-heap for the upper half. Balance their sizes after each insert; median is at one or both roots." },
            { takeaway: "Frequency-then-heap is one of the most common patterns in interviews.", detail: "HashMap counts, heap selects the top K. LC 347 is the canonical example, but variations include 'most common word', 'longest streak', 'most frequent character'." },
            { takeaway: "Watch for the bucket-sort escape hatch.", detail: "When the priority key is a small integer (frequency, age, score in [0, 100]), bucket sort beats heap. Mention it if asked for a better-than-O(n log k) approach." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="project" title="I built a min-heap from scratch and solved 3 LeetCode" xp={40} manual manualLabel="I solved all three LeetCode problems">
      <section>
        <h2 id="project">Project: build a MinHeap from scratch</h2>

        <p>
          Implement <code>MinHeap</code> with array backing, sift-up on insert, sift-down on extract. Then test it
          against Java&apos;s <code>PriorityQueue</code> on a randomized stream.
        </p>

        <h3>Step 1 · The class</h3>

        <CodeBlock lang="java">{`public class MinHeap {
    private int[] data;
    private int size;

    public MinHeap() { this(16); }
    public MinHeap(int capacity) { data = new int[Math.max(1, capacity)]; }

    public int size()    { return size; }
    public boolean isEmpty() { return size == 0; }

    public int peek() {
        if (size == 0) throw new java.util.NoSuchElementException();
        return data[0];
    }

    public void offer(int x) {
        if (size == data.length) data = java.util.Arrays.copyOf(data, data.length * 2);
        data[size] = x;
        siftUp(size);
        size++;
    }

    public int poll() {
        if (size == 0) throw new java.util.NoSuchElementException();
        int min = data[0];
        size--;
        data[0] = data[size];
        if (size > 0) siftDown(0);
        return min;
    }

    private void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) >>> 1;            // unsigned shift, avoids any negative-index issues
            if (data[i] >= data[p]) return;
            swap(i, p);
            i = p;
        }
    }

    private void siftDown(int i) {
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2;
            int smallest = i;
            if (l < size && data[l] < data[smallest]) smallest = l;
            if (r < size && data[r] < data[smallest]) smallest = r;
            if (smallest == i) return;
            swap(i, smallest);
            i = smallest;
        }
    }

    private void swap(int i, int j) {
        int t = data[i]; data[i] = data[j]; data[j] = t;
    }
}`}</CodeBlock>

        <Callout variant="info" title="What's not in this skeleton, on purpose">
          No generics, no comparator, no <code>remove(value)</code>, no iterator. The point is to internalize the two
          sift primitives without ceremony. After this is solid, generalizing to <code>MinHeap&lt;E extends
          Comparable&lt;E&gt;&gt;</code> is a 10-minute exercise.
        </Callout>

        <h3>Step 2 · Differential test against PriorityQueue</h3>

        <p>
          The fastest way to gain confidence in a heap implementation is to run it side-by-side with the JDK&apos;s,
          on a random stream of operations. If they ever disagree on what <code>poll</code> returns, you have a bug.
        </p>

        <CodeBlock lang="java">{`import java.util.*;

public class HeapStress {
    public static void main(String[] args) {
        MinHeap mine = new MinHeap();
        PriorityQueue<Integer> ref = new PriorityQueue<>();
        Random rnd = new Random(42);

        for (int i = 0; i < 100_000; i++) {
            // 70% offer, 30% poll
            if (rnd.nextInt(10) < 7 || ref.isEmpty()) {
                int x = rnd.nextInt(1_000_000);
                mine.offer(x);
                ref.offer(x);
            } else {
                int a = mine.poll();
                int b = ref.poll();
                if (a != b) {
                    throw new AssertionError("disagreement at op " + i + ": mine=" + a + " ref=" + b);
                }
            }
        }
        System.out.println("100k ops, no disagreement. Sizes: mine=" + mine.size() + " ref=" + ref.size());
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Why differential testing wins">
          You can write 30 hand-crafted test cases and still miss the bug where, say, sift-down picks the wrong child
          when both children are equal. A randomized 100k-op stress test will hit that case in under a second. Same
          technique applies any time you reimplement a standard library structure.
        </Callout>

        <h3>Step 3 · LeetCode</h3>

        <p>Solve all three using <code>java.util.PriorityQueue</code>:</p>

        <ul>
          <li><strong>LC 215 · Kth Largest Element</strong> — top-K largest, return root. ~8 lines.</li>
          <li><strong>LC 1046 · Last Stone Weight</strong> — max-heap, repeatedly poll two and push difference. ~10 lines.</li>
          <li><strong>LC 347 · Top K Frequent Elements</strong> — HashMap to count, min-heap of size K over entries by count. ~15 lines.</li>
        </ul>

        <p>
          All three implementations are sketched above. Type them out, submit, verify the green check. Then — and
          this is the real exercise — for at least one of them, swap <code>PriorityQueue</code> for your{" "}
          <code>MinHeap</code> and confirm it still passes.
        </p>

        <h3>Stretch: Median from a Data Stream (LC 295)</h3>

        <p>
          The two-heap median pattern. Maintain a max-heap <code>lo</code> for the lower half and a min-heap{" "}
          <code>hi</code> for the upper half, with the invariant <code>|lo.size() - hi.size()| ≤ 1</code>. After each
          insert, rebalance. The median is <code>lo.peek()</code> if odd-total, or the average of both peeks if
          even-total. ~25 lines, and you&apos;ll feel everything from this module click.
        </p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="heaps" id="final" title="I've completed Module 13 — and Phase 3!" xp={40} celebration="Hash tables, sets, trees, BSTs, heaps. The structures that power most of modern software. Phase 4 — sorting, recursion, and divide-and-conquer — is next.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="A heap of 1,024 elements has roughly what tree height?"
          options={[
            { label: "About 32.", explanation: "32 is √1024. Heap height is the log, not the square root." },
            { label: "About 10.", correct: true, explanation: "Right. ⌊log₂(1024)⌋ = 10 — that's the height of a complete binary tree with 1024 nodes (the first 1023 nodes fill levels 0–9 perfectly, and the 1024th sits on level 10). All sift-up and sift-down operations bound their work by this number — which is why 10⁶ heap ops complete in milliseconds." },
            { label: "About 1024.", explanation: "That would be a linked list. The heap completeness rule guarantees logarithmic height." },
            { label: "About 512.", explanation: "Half the nodes are leaves, but height is the path length to a leaf, not the leaf count." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="For 'top 5 most frequent items in a stream of 100 million events,' what's the right structure combo?"
          options={[
            { label: "TreeMap keyed by frequency.", explanation: "TreeMap can't deduplicate by item, only by key — and frequency isn't unique. Plus you'd need the count first; TreeMap doesn't help with counting." },
            { label: "HashMap to count, then a min-heap of size 5 over entries by count.", correct: true, explanation: "Right. HashMap.merge does the counting in O(N). Then bounded min-heap of size 5 finds the top 5 in O(N log 5) ≈ O(N). The composition pattern from the heap module — it shows up constantly." },
            { label: "Two heaps, one for frequencies and one for items.", explanation: "Overcomplicated. The single-heap-over-entries solution is cleaner and equally fast." },
            { label: "Sort all 100M items.", explanation: "O(N log N) when O(N log K) suffices. With K=5, the heap is dramatically faster — and on a true stream you can't sort because you don't have everything in memory." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You see code that calls `new PriorityQueue<>((a, b) -> a - b)` on Integer values. When does this break?"
          options={[
            { label: "Never — it's idiomatic Java.", explanation: "Idiomatic and dangerous. It silently produces wrong results when the integer subtraction overflows." },
            { label: "When values can include both Integer.MAX_VALUE and a negative number — int subtraction overflows.", correct: true, explanation: "Right. MAX_VALUE - (-1) overflows to MIN_VALUE, so the comparator returns negative when it should return positive. The fix is `Integer.compare(a, b)` or just `Comparator.naturalOrder()`. This is the most common comparator bug in production Java." },
            { label: "When the heap is full.", explanation: "Heaps don't have fixed capacity in PriorityQueue; they grow automatically. The bug is in the comparator, not the capacity." },
            { label: "When a == b.", explanation: "0 is a perfectly valid 'equal' return value. The bug is overflow, not equality." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="A heap is a complete binary tree drawn over an array. Two operations — sift-up and sift-down — solve every heap problem. The rest is recognizing when you need one."
          points={[
            { takeaway: "Map a heap to an array via the i/2, 2i+1, 2i+2 formulas, by reflex.", detail: "No node objects, no pointers. Cache-friendly. The trick depends on the completeness rule — without it, the indices would have gaps." },
            { takeaway: "Implement sift-up and sift-down without notes.", detail: "Sift-up: while parent is bigger, swap up. Sift-down: while smaller of two children is smaller than self, swap down. Both walk one root-to-leaf path, both O(log n)." },
            { takeaway: "Use heapify to build a heap in O(n), not O(n log n).", detail: "Walk internal nodes backwards from n/2 - 1 to 0, sift-down each. The bulk of the work is near the leaves, where the height is small — that's why it sums to linear, not n log n." },
            { takeaway: "Reach for top-K = bounded heap of size K reflexively.", detail: "Top-K largest → min-heap of size K. Top-K smallest → max-heap of size K. The heap holds the K survivors; the root is the next one to evict. O(N log K)." },
            { takeaway: "Recognize PriorityQueue's gotchas: not FIFO, not stable, not thread-safe, no decrease-key.", detail: "It's a heap, not a Queue<E> in any FIFO sense. Use Comparator.reverseOrder() for max-heap, Integer.compare to avoid overflow bugs. For concurrent access, PriorityBlockingQueue. For decrease-key, lazy deletion." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 3 complete · Hashing &amp; trees</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Five modules of the structures that power production code: hash tables (the O(1) lookup miracle), sets,
            trees, BSTs (and their balanced cousins), and heaps. You can now reach for the right container reflexively
            for any lookup, ordered-iteration, or top-K problem. Phase 4 — sorting, recursion, and divide-and-conquer —
            is the algorithmic engine that runs underneath all of these.
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="heaps" />
    </article>
  );
}
