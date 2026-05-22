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
  { id: "setup", title: "Why sorting matters — and the cost landscape" },
  { id: "intuition", title: "The O(n²) trio: bubble, selection, insertion" },
  { id: "merge", title: "Merge sort — divide and conquer, stable, O(n log n)" },
  { id: "quick", title: "Quicksort — partition, average vs worst case" },
  { id: "java-sort", title: "Arrays.sort and Collections.sort: what Java actually uses" },
  { id: "project", title: "Project: Quickselect + Merge Intervals" },
];

export default function SortingModule() {
  const mod = getModuleBySlug("sorting")!;

  // Merge sort divide tree on [5,2,8,1,9,3]
  const mergeTree = `
flowchart TB
    A["[5, 2, 8, 1, 9, 3]"] --> B["[5, 2, 8]"]
    A --> C["[1, 9, 3]"]
    B --> D["[5, 2]"]
    B --> E["[8]"]
    C --> F["[1, 9]"]
    C --> G["[3]"]
    D --> H["[5]"]
    D --> I["[2]"]
    F --> J["[1]"]
    F --> K["[9]"]
    H --> L["merge → [2, 5]"]
    I --> L
    L --> M["merge → [2, 5, 8]"]
    E --> M
    J --> N["merge → [1, 9]"]
    K --> N
    N --> O["merge → [1, 3, 9]"]
    G --> O
    M --> P["merge → [1, 2, 3, 5, 8, 9]"]
    O --> P
    style A fill:#6366f1,color:#fff,stroke:#4338ca
    style P fill:#10b981,color:#fff,stroke:#047857
    style L fill:#a5b4fc,color:#000
    style M fill:#a5b4fc,color:#000
    style N fill:#a5b4fc,color:#000
    style O fill:#a5b4fc,color:#000
  `.trim();

  // Quicksort partition picture
  const quickPartition = `
flowchart TB
    subgraph S0["Initial · pivot = 4 (last element)"]
        direction LR
        A0["3 7 1 6 2 5 4"]
    end
    subgraph S1["Partition · &lt; pivot to the left"]
        direction LR
        A1["3 1 2 | 4 | 7 5 6"]
    end
    subgraph S2["Recurse on each side"]
        direction LR
        L["sort [3, 1, 2]"]
        R["sort [7, 5, 6]"]
    end
    S0 --> S1 --> S2
    style S0 fill:#1e293b,color:#fff,stroke:#475569
    style S1 fill:#6366f1,color:#fff,stroke:#4338ca
    style S2 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="sorting" />
      <ModuleProgress moduleSlug="sorting" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 6 · Module 26 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2.5–3h · the algorithm every senior engineer should know cold</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="setup" title="I know the cost landscape and why O(n log n) is the floor" xp={20}>
      <section>
        <h2 id="setup">Why sorting matters — and the cost landscape</h2>

        <p>
          Sorting is the single most-studied problem in computer science, and for good reason: a sorted array unlocks
          a cascade of fast techniques that don&apos;t work on raw data. <strong>Binary search</strong>{" "}needs sorted
          input. <strong>Two-pointer</strong>{" "}patterns assume order. <strong>Deduplication</strong>{" "}in O(n) needs
          adjacency. <strong>Merging</strong>{" "}two streams is trivial when both are sorted. Half of the algorithmic
          tricks in the next phase start with the line &quot;first, sort the array.&quot;
        </p>

        <p>
          So even if you never implement a sort yourself in production — and you probably shouldn&apos;t,{" "}
          <code>Arrays.sort</code> is excellent — knowing the seven canonical sorts and their tradeoffs is the price
          of admission. They&apos;re also the cleanest possible introduction to recursion, divide-and-conquer, and
          partitioning, which is why we cover them at the start of Phase 6.
        </p>

        <h3>The Big-O cheat table</h3>

        <p>
          Here&apos;s the entire cost landscape in one table. Memorize the merge-sort and quicksort rows; the rest are
          for context.
        </p>

        <CodeBlock lang="plain">{`Algorithm        Worst        Average      Best         Space     Stable
─────────────────────────────────────────────────────────────────────────
Bubble sort      O(n²)        O(n²)        O(n)         O(1)      yes
Selection sort   O(n²)        O(n²)        O(n²)        O(1)      no
Insertion sort   O(n²)        O(n²)        O(n)         O(1)      yes
Merge sort       O(n log n)   O(n log n)   O(n log n)   O(n)      yes
Quicksort        O(n²)        O(n log n)   O(n log n)   O(log n)  no
Heapsort         O(n log n)   O(n log n)   O(n log n)   O(1)      no
Timsort          O(n log n)   O(n log n)   O(n)         O(n)      yes`}</CodeBlock>

        <p>
          Read this carefully. A few non-obvious entries:
        </p>

        <ul>
          <li><strong>Selection sort has no best case.</strong>{" "}It always scans the entire unsorted suffix to find the minimum, even if the array is already sorted. Worst, average, and best are all O(n²).</li>
          <li><strong>Bubble and insertion sort are O(n) on already-sorted input.</strong>{" "}One pass with no swaps confirms order. This is rare in practice but it&apos;s why insertion sort is a building block of Timsort.</li>
          <li><strong>Quicksort&apos;s O(n²) worst case</strong>{" "}only happens with terrible pivot choices — usually a sorted-or-reverse-sorted array combined with a fixed-position pivot. Random pivot or median-of-three reduces the chance to negligible.</li>
          <li><strong>Heapsort is O(1) space</strong>{" "}in-place, but its constant factors are worse than quicksort because of poor cache behavior — the heap operations jump around the array.</li>
          <li><strong>Timsort gets O(n) on sorted (or reverse-sorted) input</strong>{" "}because it detects existing &quot;runs&quot; and merges them. This is the property that makes it the right default for real-world data, which is rarely random.</li>
        </ul>

        <h3>The O(n log n) floor for comparison sorts</h3>

        <p>
          You cannot beat O(n log n) for a general comparison-based sort. The proof is short and beautiful:
        </p>

        <Callout variant="insight" title="The decision-tree argument for the O(n log n) floor">
          <p>
            Any comparison sort can be modeled as a binary decision tree: each internal node is a comparison, and
            each leaf is one of the n! possible permutations. To distinguish all permutations, the tree must have at
            least n! leaves. A binary tree with L leaves has height ≥ log₂(L), so the worst-case path length is at
            least log₂(n!) ≈ n log n by Stirling&apos;s approximation.
          </p>
          <p>
            That worst-case path is the worst-case number of comparisons. So no comparison-based algorithm can do
            better than O(n log n) in the worst case. Merge sort, heapsort, and Timsort hit this bound. Quicksort
            hits it on average. Anything claiming to beat O(n log n) — counting sort, radix sort, bucket sort — is
            not a comparison sort; it exploits structural information about the keys (bounded range, fixed digit
            count) that general comparisons can&apos;t see.
          </p>
        </Callout>

        <h3>What sorting unlocks</h3>

        <p>
          The reason to invest in sorting fluency isn&apos;t the sort itself — it&apos;s everything that becomes easy
          afterward:
        </p>

        <ul>
          <li><strong>Binary search</strong>{" "}is O(log n) on a sorted array. On unsorted data, you&apos;re back to O(n) linear scan.</li>
          <li><strong>Two-pointer</strong>{" "}patterns (3Sum, container-with-most-water, merge-two-sorted) need order to converge from both ends.</li>
          <li><strong>Deduplication</strong>{" "}becomes a single-pass O(n) walk on sorted data instead of an O(n) hash-set construction.</li>
          <li><strong>Interval problems</strong> (merge intervals, meeting rooms, insert interval) almost always start with &quot;sort by start time.&quot;</li>
          <li><strong>Greedy algorithms</strong>{" "}often need data sorted by some priority before the greedy choice is locally optimal.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Why can't comparison-based sorting ever beat O(n log n) in the worst case?"
          options={[
            { label: "It can — radix sort is O(n).", explanation: "Radix sort isn't comparison-based — it uses the digits of the keys directly. The O(n log n) floor only applies to algorithms that learn about the data exclusively through pairwise comparisons." },
            { label: "Because the decision tree distinguishing n! permutations must have height at least log₂(n!) ≈ n log n.", correct: true, explanation: "Right. Each comparison gives you one bit of information; you need log₂(n!) bits to identify the right permutation, which is Θ(n log n) by Stirling. Merge sort hits this bound exactly; quicksort hits it on average." },
            { label: "Because every sort needs to swap n elements at least n times.", explanation: "That would be O(n²). The lower bound is on comparisons, not swaps, and it's tighter — n log n." },
            { label: "Java's Arrays.sort enforces it.", explanation: "Arrays.sort respects the bound; it doesn't enforce it on the universe. The bound is mathematical, language-independent." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which of these is NOT a true statement about sorting?"
          options={[
            { label: "Bubble sort is O(n) on already-sorted input if you track whether any swap happened in a pass.", explanation: "True. If a full pass does no swaps, the array is sorted; you can break early. This gives bubble sort an O(n) best case." },
            { label: "Heapsort is in-place but typically slower than quicksort due to cache behavior.", explanation: "True. Heap operations jump between parents and children at distant indices, defeating the cache. Quicksort scans contiguously." },
            { label: "Selection sort has an O(n) best case on already-sorted input.", correct: true, explanation: "False — and the trap. Selection sort always finds the minimum of the entire unsorted suffix, regardless of input order. It's O(n²) in best, average, and worst case. This makes it the only major sort with no best-case improvement on sorted data." },
            { label: "Merge sort guarantees O(n log n) at the cost of O(n) extra space.", explanation: "True. The divide-and-conquer structure forces O(n log n) regardless of input, and the merge step needs scratch space. The space cost is the price of the worst-case guarantee." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · The O(n²) trio ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="intuition" title="I can write bubble, selection, and insertion sort from memory" xp={20}>
      <section>
        <h2 id="intuition">The O(n²) trio: bubble, selection, insertion</h2>

        <p>
          Three quadratic sorts. Nobody uses them as a default in production, but each illustrates a useful idea, and
          insertion sort in particular shows up inside Timsort. Implement them once, internalize their rhythm, then
          forget the details — you&apos;ll never write them again outside of an interview warm-up or a 16-element
          subarray inside a faster algorithm.
        </p>

        <h3>Bubble sort — repeatedly swap adjacent out-of-order pairs</h3>

        <p>
          Walk the array; whenever a pair is out of order, swap it. After one full pass, the largest element has
          &quot;bubbled&quot; to the end. Repeat for n passes. The early-exit flag turns a stupid O(n²) into a
          best-case O(n).
        </p>

        <CodeBlock lang="java">{`static void bubbleSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = true;
            }
        }
        if (!swapped) return;     // already sorted; bail
    }
}`}</CodeBlock>

        <h3>Selection sort — find the minimum, place it, repeat</h3>

        <p>
          For each position <code>i</code>, scan the unsorted suffix <code>[i..n-1]</code> for the smallest element
          and swap it into place. Always O(n²), even on sorted input — it doesn&apos;t know it&apos;s already sorted.
          The one virtue: minimum number of <em>swaps</em> (exactly n-1), which matters when swap is expensive (e.g.,
          large records, or external storage).
        </p>

        <CodeBlock lang="java">{`static void selectionSort(int[] a) {
    int n = a.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minIdx]) minIdx = j;
        }
        if (minIdx != i) {
            int t = a[i]; a[i] = a[minIdx]; a[minIdx] = t;
        }
    }
}`}</CodeBlock>

        <Callout variant="warn" title="Selection sort isn't stable">
          <p>
            The swap can move an element past an equal-valued one. Example: <code>[5a, 3, 5b, 1]</code>. First pass
            swaps the 5a (at index 0) with the 1 (at index 3), giving <code>[1, 3, 5b, 5a]</code> — the relative
            order of 5a and 5b is now reversed.
          </p>
          <p>
            If you need stability, pick another sort or use a stable variant that shifts instead of swaps (which
            trades the swap-count win for O(n²) writes).
          </p>
        </Callout>

        <h3>Insertion sort — grow a sorted prefix, one element at a time</h3>

        <p>
          For each element <code>a[i]</code>, walk it leftward through the already-sorted prefix until it finds its
          home. Like sorting a hand of playing cards: you pick up cards one at a time and slot each into the right
          position among the cards already in your hand.
        </p>

        <CodeBlock lang="java">{`static void insertionSort(int[] a) {
    for (int i = 1; i < a.length; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];      // shift right
            j--;
        }
        a[j + 1] = key;            // drop key in its slot
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Insertion sort's secret weapon: O(n) on nearly-sorted arrays">
          <p>
            On already-sorted input, the inner <code>while</code> never executes — the key is already &gt; everything
            to its left. One outer pass, no inner work. That&apos;s O(n).
          </p>
          <p>
            On <em>nearly</em>{" "}sorted input (each element at most k positions out of place), insertion sort runs in
            O(nk), which is linear when k is a small constant. Real-world data — log files, append-mostly databases,
            partially-sorted user input — often has this structure. This is why Timsort uses insertion sort as its
            base case for small subarrays (typically size ≤ 32 or 64): on tiny arrays the lower constant factors of
            insertion sort beat the more sophisticated merging logic, and on slightly-disordered chunks it&apos;s
            blistering fast. The same trick appears in dual-pivot quicksort (used by <code>Arrays.sort(int[])</code>),
            which falls back to insertion sort once partitions get small.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Why does Timsort use insertion sort for its base-case small subarrays?"
          options={[
            { label: "Because it's the simplest sort to write.", explanation: "Simplicity is a side benefit, not the reason. Bubble sort is also simple but has worse constants and isn't used here." },
            { label: "Because insertion sort has the lowest constant factors on small inputs and runs in O(n) on already-sorted or nearly-sorted runs — which is exactly what Timsort feeds it.", correct: true, explanation: "Right. Asymptotic complexity is meaningless at n=32. What matters is the constant factor, and insertion sort wins there. Timsort detects existing 'runs' (already-sorted subsequences) and uses insertion sort to extend them — a regime where insertion sort is O(n)." },
            { label: "Because it's stable, and Timsort needs a stable base case.", explanation: "Stability is necessary, but merge sort is also stable. The deciding factor is performance on small inputs, where insertion sort wins." },
            { label: "Because it's the only in-place sort.", explanation: "Heapsort and selection sort are also in-place. The reason is constant-factor performance and adaptivity to nearly-sorted data." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Merge sort ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="merge" title="I can implement merge sort and explain why it's stable" xp={25}>
      <section>
        <h2 id="merge">Merge sort — divide and conquer, stable, O(n log n)</h2>

        <p>
          Merge sort is the canonical divide-and-conquer algorithm and the foundation of Timsort. The recipe:
        </p>

        <ol>
          <li><strong>Divide</strong>{" "}the array in half.</li>
          <li><strong>Recursively sort</strong>{" "}each half.</li>
          <li><strong>Merge</strong>{" "}the two sorted halves into one sorted whole.</li>
        </ol>

        <p>
          The recursion bottoms out at arrays of length 0 or 1 (already sorted by definition). The merge step is the
          interesting part: walk two sorted arrays in parallel with two pointers, always taking the smaller front
          element. O(n) per merge level, log n levels of recursion, total O(n log n).
        </p>

        <Mermaid chart={mergeTree} />

        <h3>The implementation</h3>

        <CodeBlock lang="java">{`static void mergeSort(int[] a) {
    if (a.length < 2) return;
    int[] aux = new int[a.length];     // scratch buffer, allocated once
    sort(a, aux, 0, a.length - 1);
}

private static void sort(int[] a, int[] aux, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;       // overflow-safe midpoint
    sort(a, aux, lo, mid);
    sort(a, aux, mid + 1, hi);
    merge(a, aux, lo, mid, hi);
}

private static void merge(int[] a, int[] aux, int lo, int mid, int hi) {
    // Copy the active range into aux
    for (int k = lo; k <= hi; k++) aux[k] = a[k];

    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if      (i > mid)            a[k] = aux[j++];     // left half exhausted
        else if (j > hi)             a[k] = aux[i++];     // right half exhausted
        else if (aux[j] < aux[i])    a[k] = aux[j++];     // right is smaller → take it
        else                         a[k] = aux[i++];     // left is ≤ right → take left (STABLE)
    }
}`}</CodeBlock>

        <Callout variant="insight" title="The single line that makes merge sort stable">
          <p>
            Look at the last two branches of the merge loop. When the left and right fronts are equal — say both are
            5 — the code takes from the left first (<code>aux[i]</code>). Since the left half came from earlier in
            the original array, this preserves the relative order of equal elements. That&apos;s the entire stability
            property in one comparison.
          </p>
          <p>
            If you accidentally write <code>aux[j] &lt;= aux[i]</code>, you&apos;d break stability — equal elements
            from the right would jump ahead of those from the left. This is the kind of bug that passes 99% of test
            cases and only shows up when stability matters (sorting by one field while preserving order on another).
          </p>
        </Callout>

        <h3>Why merge sort is stable, O(n log n) guaranteed, and not in-place</h3>

        <ul>
          <li><strong>Stable:</strong>{" "}by the merge tie-breaker shown above. Equal elements never cross.</li>
          <li><strong>O(n log n) guaranteed:</strong>{" "}the recursion always halves; no input pattern can degrade it. Worst, average, and best are all the same. This is the property that makes it the right choice when you cannot tolerate occasional slowness — external sorting, real-time systems, sorted-output guarantees in databases.</li>
          <li><strong>O(n) extra space:</strong>{" "}the merge step needs scratch room equal to the size of the range being merged. There are in-place merge variants but they&apos;re complicated and slower in practice. Allocating a single scratch buffer up front (the <code>aux</code> array) and reusing it is the standard idiom.</li>
        </ul>

        <Callout variant="info" title="The overflow-safe midpoint">
          <p>
            <code>(lo + hi) / 2</code> overflows when <code>lo + hi</code> exceeds <code>Integer.MAX_VALUE</code>.
            The fix is <code>lo + (hi - lo) / 2</code>, which is mathematically equivalent but never overflows for
            non-negative indices.
          </p>
          <p>
            This is the famous <em>binary search bug</em>{" "}that lurked in the JDK&apos;s{" "}
            <code>Arrays.binarySearch</code> for years before Joshua Bloch wrote about it. Same fix applies in any
            divide-and-conquer index calculation.
          </p>
        </Callout>

        <h3>The merge function in isolation — &quot;merge two sorted arrays&quot;</h3>

        <p>
          The merge step is a useful subroutine on its own. LeetCode&apos;s <em>Merge Two Sorted Arrays</em>{" "}
          (LC 88) is exactly this with a memory-allocation twist (merge into the larger array&apos;s tail to avoid
          extra space). The two-pointer pattern here generalizes to <em>Merge K Sorted Lists</em> (use a priority
          queue to pick the smallest front), <em>Intersection of Two Arrays</em>, and many interval-style problems.
        </p>

        <Quiz
          kind="Merge sort check"
          question="If you change `if (aux[j] < aux[i])` to `if (aux[j] <= aux[i])` in the merge function, what breaks?"
          options={[
            { label: "Nothing — both produce sorted output.", explanation: "Both produce sorted output by value. But one preserves the relative order of equal elements (stable) and the other doesn't (unstable). The output array's values are correct either way; the input-order property is what changes." },
            { label: "The sort becomes unstable: equal elements from the right half jump ahead of those from the left.", correct: true, explanation: "Right. With `<=`, when fronts are equal, you take from the right first — meaning later-original-index elements end up ahead of earlier ones. The values are still sorted, but the relative order of equals is reversed. Subtle, important, and a common interview curveball." },
            { label: "The complexity becomes O(n²).", explanation: "Complexity is unaffected by the comparison choice. Both versions still merge two arrays in O(n)." },
            { label: "The sort becomes in-place.", explanation: "It does not. The merge function still needs the aux buffer regardless of the equality comparison." },
          ]}
        />

        <Quiz
          kind="Merge sort check"
          question="What's the total memory cost of merge sort, including recursion?"
          options={[
            { label: "O(1).", explanation: "The merge step alone needs O(n) for the aux buffer; this is not in-place." },
            { label: "O(log n) — only the recursion stack.", explanation: "The recursion stack is O(log n), but the aux buffer is O(n) — and that dominates." },
            { label: "O(n) — the aux buffer dominates the O(log n) recursion stack.", correct: true, explanation: "Right. One reusable aux buffer of size n is the standard idiom (allocated once at the top, reused at every merge). Plus an O(log n) recursion stack from the divide-and-conquer. Total O(n)." },
            { label: "O(n log n) — one aux buffer per recursive level.", explanation: "If you allocated a fresh aux buffer per call, yes. But the standard implementation allocates one buffer of size n at the top and reuses it. So total auxiliary space is O(n), not O(n log n)." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Quicksort ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="quick" title="I understand partition, pivot strategy, and quicksort's worst case" xp={25}>
      <section>
        <h2 id="quick">Quicksort — partition, average vs worst case</h2>

        <p>
          Quicksort flips merge sort&apos;s strategy. Instead of dividing carelessly and merging carefully, it
          divides carefully (partitioning around a pivot) and merging is free (the partitioned halves are already in
          the right places relative to each other). This single change buys two big things: <strong>in-place</strong>
          {" "}operation (no aux buffer) and excellent <strong>cache locality</strong> (linear scans of contiguous
          memory). The cost: a worst-case O(n²) when pivots are chosen badly.
        </p>

        <Mermaid chart={quickPartition} />

        <h3>The Lomuto partition scheme</h3>

        <p>
          Partition takes a range <code>[lo..hi]</code> and a pivot, and rearranges the range so that everything
          &lt; pivot is on the left, the pivot sits at its final sorted position, and everything ≥ pivot is on the
          right. Lomuto&apos;s scheme uses the last element as the pivot and walks <code>j</code> through the range,
          maintaining the invariant <code>a[lo..i]</code> is the &quot;less than pivot&quot; partition.
        </p>

        <CodeBlock lang="java">{`static void quickSort(int[] a) {
    sort(a, 0, a.length - 1);
}

private static void sort(int[] a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    sort(a, lo, p - 1);          // left side
    sort(a, p + 1, hi);          // right side
}

private static int partition(int[] a, int lo, int hi) {
    int pivot = a[hi];           // Lomuto: pivot is last element
    int i = lo - 1;              // i tracks the boundary of the "< pivot" region
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            swap(a, i, j);
        }
    }
    swap(a, i + 1, hi);          // place pivot in its final spot
    return i + 1;
}

private static void swap(int[] a, int i, int j) {
    int t = a[i]; a[i] = a[j]; a[j] = t;
}`}</CodeBlock>

        <h3>The worst case — and how to avoid it</h3>

        <p>
          Lomuto with <code>a[hi]</code> as pivot has a known catastrophic input: <strong>already-sorted or
          reverse-sorted arrays</strong>. The pivot is always the maximum (or minimum), so partition produces splits
          of size n-1 and 0. The recursion depth becomes n, total work becomes O(n²), and you can also blow the call
          stack. This is the &quot;quicksort is sometimes O(n²)&quot; warning. The fix is one of:
        </p>

        <ul>
          <li><strong>Random pivot.</strong>{" "}Pick a random index in <code>[lo..hi]</code> and swap it into the pivot position before partitioning. The probability of a degenerate split becomes negligible regardless of input.</li>
          <li><strong>Median-of-three.</strong>{" "}Look at <code>a[lo]</code>, <code>a[mid]</code>, <code>a[hi]</code>, take the median, and use it as the pivot. Cheap and robust against the &quot;already-sorted&quot; pathology, since the median of three positions in a sorted array is the actual median value.</li>
          <li><strong>Three-way partitioning (Dutch National Flag).</strong>{" "}Partition into &lt; / = / &gt; regions in one pass. O(n) on arrays with many duplicates, where Lomuto degenerates to O(n²).</li>
        </ul>

        <CodeBlock lang="java">{`// Random-pivot wrapper — one extra swap before partitioning
private static int partition(int[] a, int lo, int hi) {
    int randomIdx = lo + ThreadLocalRandom.current().nextInt(hi - lo + 1);
    swap(a, randomIdx, hi);       // move random element to pivot slot
    return lomutoPartition(a, lo, hi);
}`}</CodeBlock>

        <h3>Hoare partition — slightly faster, slightly trickier</h3>

        <p>
          Hoare&apos;s scheme uses two pointers walking inward from each end, swapping out-of-place pairs. It does
          fewer swaps on average than Lomuto and tends to perform better on duplicate-heavy data. The catch: it
          doesn&apos;t place the pivot in its final position, so the recursion looks slightly different
          (<code>sort(lo, p)</code> and <code>sort(p+1, hi)</code> instead of <code>sort(lo, p-1)</code> and{" "}
          <code>sort(p+1, hi)</code>). Off-by-ones bite people here. Lomuto is simpler to write correctly under
          interview pressure; Hoare is what production implementations like dual-pivot quicksort build on. Know
          Hoare exists; reach for Lomuto until you have a reason not to.
        </p>

        <Callout variant="warn" title="Quicksort is not stable, even with care">
          <p>
            The partition step swaps non-adjacent elements, which can reorder equal-valued items. There is no easy
            fix — making quicksort stable requires extra memory, defeating its in-place advantage.
          </p>
          <p>
            If you need stability, use merge sort or Timsort. This is the main reason Java uses Timsort (not
            quicksort) for objects, where stability is often required.
          </p>
        </Callout>

        <Callout variant="insight" title="The recursion-depth fix nobody mentions">
          <p>
            Even with random pivots, an <em>unlucky</em>{" "}sequence of splits can recurse log n levels deep on the
            unbalanced side and waste stack frames. The standard production trick: always recurse into the smaller
            half first, and convert the larger half into a tail-call-style loop. This bounds the recursion depth at
            O(log n) regardless of input.
          </p>
          <p>
            <code>Arrays.sort(int[])</code> does this. Most textbook implementations don&apos;t, which is fine for
            interview-sized inputs but matters at scale.
          </p>
        </Callout>

        <Quiz
          kind="Quicksort check"
          question="Lomuto-partition quicksort with `a[hi]` as the fixed pivot. On an already-sorted input of size n, what's the running time and recursion depth?"
          options={[
            { label: "O(n log n) and log n depth — sorting doesn't change quicksort's behavior.", explanation: "It changes it dramatically. The pivot is always the maximum, so partition splits into [n-1, 0]. The recursion is one-sided and as deep as the array is long." },
            { label: "O(n²) time and O(n) recursion depth — every partition produces a split of size n-1 and 0.", correct: true, explanation: "Right. The pivot is the largest element, so the entire range becomes the 'less than pivot' part. Then you recurse on size n-1 with the same problem. n levels deep, n work per level → O(n²) and a stack-blowing recursion. The standard fix is a random pivot or median-of-three." },
            { label: "O(n) — sorted input is the best case for quicksort.", explanation: "Backwards. Sorted is the WORST case for fixed-pivot quicksort. Best case is balanced splits, which random data approximates." },
            { label: "It throws StackOverflowError before producing any output.", explanation: "On a small enough input it sorts correctly, just slowly. On a large input you do hit StackOverflow — but the asymptotic answer is O(n²) regardless." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Java's sort ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="java-sort" title="I know exactly which algorithm Java picks and why" xp={20}>
      <section>
        <h2 id="java-sort">Arrays.sort and Collections.sort: what Java actually uses</h2>

        <p>
          Java has two main sort entry points and they use <em>different algorithms</em>. Knowing which is which
          makes you instantly more credible in any code review or interview.
        </p>

        <h3>The dispatch table</h3>

        <CodeBlock lang="plain">{`Call                              Algorithm              Stable?    Why
─────────────────────────────────────────────────────────────────────────────────
Arrays.sort(int[])                Dual-pivot quicksort   no         primitives, no stability needed
Arrays.sort(long[]/double[]/...)  Dual-pivot quicksort   no         same as above
Arrays.sort(Object[])             Timsort                yes        objects may need stability
Arrays.sort(T[], Comparator)      Timsort                yes        comparator-based, stability matters
Collections.sort(List)            Timsort                yes        delegates to Arrays.sort(Object[])
List.sort(Comparator)             Timsort                yes        same as above`}</CodeBlock>

        <Callout variant="insight" title="Why Java splits primitives from objects">
          <p>
            For primitives (<code>int</code>, <code>long</code>, etc.), there&apos;s no concept of stability —
            <code>5 == 5</code> doesn&apos;t carry hidden state, so &quot;preserving the relative order of equal
            elements&quot; is meaningless. Quicksort wins outright: in-place, cache-friendly, fastest in practice.
            Java picks <strong>dual-pivot quicksort</strong>, a Vladimir Yaroslavskiy variant that uses two pivots to
            create three partitions and runs ~10–20% faster than classic single-pivot quicksort on random data.
          </p>
          <p>
            For objects, stability matters. Sorting employees by department, then by name within each department,
            requires a stable sort — the second sort must preserve the order from the first. So Java picks{" "}
            <strong>Timsort</strong>, a hybrid of merge sort and insertion sort designed by Tim Peters for Python,
            ported to Java in 2009. Timsort is stable, O(n log n) worst case, and shockingly fast on real-world
            partially-sorted data (O(n) on already-sorted, O(n) on reverse-sorted with one reversal pass). The cost:
            O(n) auxiliary space, which is acceptable for objects since they&apos;re already heap-allocated and the
            scratch buffer is references, not copies.
          </p>
        </Callout>

        <h3>Comparators — the right way</h3>

        <p>
          You&apos;ll write more comparators than you&apos;ll write sorts. The <code>Comparator</code> interface has
          a stack of static factories that compose cleanly:
        </p>

        <CodeBlock lang="java">{`// Sort employees by salary ascending
list.sort(Comparator.comparingInt(Employee::getSalary));

// Sort by department, then by salary descending within department
list.sort(
    Comparator.comparing(Employee::getDepartment)
              .thenComparing(Comparator.comparingInt(Employee::getSalary).reversed())
);

// Sort strings by length, then alphabetically as tiebreaker
list.sort(
    Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())
);

// Reverse natural order
list.sort(Comparator.reverseOrder());

// Null-safe sort, nulls first
list.sort(Comparator.nullsFirst(Comparator.naturalOrder()));`}</CodeBlock>

        <p>
          <code>comparing</code> and <code>comparingInt</code> are different methods with different signatures, and{" "}
          <code>comparingInt</code> is meaningfully better when you&apos;re comparing primitive ints because it
          avoids autoboxing in a hot loop. Use <code>comparingInt</code>, <code>comparingLong</code>, and{" "}
          <code>comparingDouble</code> whenever the key is the corresponding primitive.
        </p>

        <Callout variant="warn" title="Don't sort with subtraction — the overflow bug">
          <p>
            The most common comparator bug in production Java is writing{" "}
            <code>(a, b) -&gt; a - b</code> for an <code>Integer</code> comparator. It works for most inputs and
            silently produces wrong results when subtraction overflows. <code>Integer.MAX_VALUE - (-1)</code> is
            <code>Integer.MIN_VALUE</code>, which is negative — meaning your comparator returns &quot;a is less than
            b&quot; when in fact a is much greater. The sort produces a wrong-order array with no error.
          </p>
          <p>
            The fix is <code>Integer.compare(a, b)</code>, which never overflows because it returns -1/0/1 directly
            without doing arithmetic. Same applies to <code>Long.compare</code>, <code>Double.compare</code>, and{" "}
            <code>Float.compare</code>. Or just use the high-level factories:{" "}
            <code>Comparator.comparingInt(x -&gt; x)</code> uses <code>Integer.compare</code> under the hood and is
            unambiguously safe. <strong>Never use subtraction for comparators on full-range integer types.</strong>
          </p>
        </Callout>

        <h3>One more gotcha: Arrays.sort(int[]) and Collections.sort don&apos;t share a contract</h3>

        <p>
          <code>Arrays.sort(int[])</code> uses dual-pivot quicksort and is unstable. <code>Collections.sort(List)</code>{" "}
          uses Timsort and is stable. If you write a generic helper that&apos;s sometimes called with{" "}
          <code>Integer[]</code> and sometimes with <code>int[]</code>, the stability behavior changes silently with
          the type. Pick one form and stick with it; if stability matters, always go through the Object[] /
          Collection path.
        </p>

        <Quiz
          kind="Java sort check"
          question="Which sort does `Arrays.sort(String[])` use under the hood?"
          options={[
            { label: "Dual-pivot quicksort.", explanation: "Dual-pivot quicksort is for primitive arrays (int[], long[], etc.) where stability isn't a concern. String[] is an Object[]." },
            { label: "Timsort.", correct: true, explanation: "Right. Arrays.sort(Object[]) uses Timsort — a stable, hybrid merge-sort/insertion-sort algorithm. String[] dispatches to the Object[] overload, so it's Timsort. The reason: objects may need stability (sort by length, then by alphabetic order, etc.), and Timsort is the stable-sort default in modern Java." },
            { label: "Heapsort.", explanation: "Heapsort isn't Java's default for any sort entry point. It's used internally by some hybrid algorithms as a fallback for pathological cases, but never as the top-level sort." },
            { label: "Insertion sort.", explanation: "Insertion sort is used as a sub-routine inside Timsort for small subarrays (size ≤ 32 or 64), but the top-level algorithm for Arrays.sort(Object[]) is Timsort." },
          ]}
        />

        <Quiz
          kind="Java sort check"
          question="`list.sort((a, b) -> a - b)` where list is `List<Integer>`. When does this break?"
          options={[
            { label: "Never — Java's sort is robust against bad comparators.", explanation: "It is not. A buggy comparator silently produces wrong-order output." },
            { label: "When the list contains Integer.MAX_VALUE and a negative number — the subtraction overflows and the comparator returns a negative number when it should return positive.", correct: true, explanation: "Right. MAX_VALUE - (-1) overflows to MIN_VALUE (a very negative number). The comparator now claims MAX_VALUE < -1, which is the opposite of the truth. Sort produces a wrong-order array with no error. Fix: Integer.compare(a, b) or Comparator.naturalOrder()." },
            { label: "When the list is empty.", explanation: "Empty lists sort fine; the comparator never runs." },
            { label: "Only on the JVM with -XX:+UnsignedComparisons.", explanation: "There's no such flag. The bug is in plain int arithmetic, language-level." },
          ]}
        />

        <PartRecap
          title="The seven sorts, in one mental model"
          gist="Comparison-sort floor is O(n log n). Bubble/selection/insertion are O(n²) and only show up as components inside faster algorithms. Merge sort guarantees O(n log n) at the cost of O(n) space. Quicksort is faster in practice but has an O(n²) worst case unless you randomize pivots. Java uses dual-pivot quicksort for primitives (no stability needed) and Timsort for objects (stable, hybrid)."
          points={[
            { takeaway: "Insertion sort isn't useless — it's the building block of Timsort.", detail: "O(n) on nearly-sorted data, low constant factors on small inputs. Timsort hands chunks of size ≤ 32 to insertion sort because it's faster than merging at that scale." },
            { takeaway: "Merge sort is the algorithm you reach for when you need a guarantee.", detail: "External sorting (data too big for RAM), real-time systems, anything where O(n²) is unacceptable. The cost is O(n) extra space and a slightly worse constant than quicksort on average." },
            { takeaway: "Quicksort wins in practice, but only with random or median-of-three pivots.", detail: "In-place, cache-friendly, fastest expected runtime. Lomuto with a fixed pivot is the textbook intro but trips on sorted input. Always randomize the pivot in production." },
            { takeaway: "Stability matters more than you'd guess.", detail: "Sorting by multiple keys via successive sorts requires stability. So does any 'sort and preserve insertion order on ties.' This is why Java uses Timsort for objects." },
            { takeaway: "Use Integer.compare, never subtraction.", detail: "(a, b) -> a - b overflows and gives wrong-order output silently. Comparator.comparingInt and Integer.compare are safe; reach for them by reflex." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Project ───────────────── */}
      <Checkpoint moduleSlug="sorting" id="project" title="I implemented quickselect and solved Sort Colors + Merge Intervals" xp={45} manual manualLabel="I implemented quickselect and solved both LeetCode problems">
      <section>
        <h2 id="project">Project: Quickselect + Merge Intervals</h2>

        <p>
          Three problems that exercise everything from this module. Solve all three; if any feels rough, re-read the
          relevant section.
        </p>

        <h3>LC 215 · Kth Largest Element via Quickselect</h3>

        <p>
          Quickselect is partial quicksort: instead of recursing into both halves of the partition, you only recurse
          into the side that contains the answer. If the pivot lands at index k, you&apos;re done. If it lands left
          of k, the answer is in the right half; if right of k, recurse left. Average O(n), worst O(n²) — same
          tradeoff as quicksort, with the same fix (random pivot).
        </p>

        <CodeBlock lang="java">{`public int findKthLargest(int[] nums, int k) {
    // Convert "k-th largest" to a 0-indexed position from the left
    int target = nums.length - k;
    return quickselect(nums, 0, nums.length - 1, target);
}

private int quickselect(int[] a, int lo, int hi, int target) {
    if (lo == hi) return a[lo];
    int p = randomPartition(a, lo, hi);
    if (p == target) return a[p];
    if (p < target) return quickselect(a, p + 1, hi, target);
    return quickselect(a, lo, p - 1, target);
}

private int randomPartition(int[] a, int lo, int hi) {
    int randomIdx = lo + ThreadLocalRandom.current().nextInt(hi - lo + 1);
    swap(a, randomIdx, hi);
    int pivot = a[hi];
    int i = lo - 1;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) {
            i++;
            swap(a, i, j);
        }
    }
    swap(a, i + 1, hi);
    return i + 1;
}

private void swap(int[] a, int i, int j) {
    int t = a[i]; a[i] = a[j]; a[j] = t;
}`}</CodeBlock>

        <Callout variant="insight" title="Why quickselect is O(n) on average">
          <p>
            Each partition is O(n). After partitioning, you recurse into <em>one</em>{" "}side (not both). On average,
            the partition splits the range in half, so the recurrence is T(n) = T(n/2) + O(n), which solves to O(n)
            by the master theorem (or just by noticing the work halves each level: n + n/2 + n/4 + ... = 2n).
          </p>
          <p>
            Quicksort recurses into both sides, giving T(n) = 2T(n/2) + O(n) = O(n log n). Quickselect&apos;s
            single-side recursion is the entire reason it shaves off the log factor. Worst case is still O(n²) on a
            sequence of bad pivots; deterministic O(n) requires median-of-medians, which is theoretically beautiful
            but slower in practice than the randomized version.
          </p>
        </Callout>

        <h3>LC 75 · Sort Colors (Dutch National Flag)</h3>

        <p>
          Given an array of 0s, 1s, and 2s, sort it in-place in a single pass. The clever solution is the
          three-way partition, the same idea behind three-way quicksort: maintain three regions and swap as you
          walk. Three pointers, O(n) time, O(1) space.
        </p>

        <CodeBlock lang="java">{`public void sortColors(int[] nums) {
    int lo = 0, mid = 0, hi = nums.length - 1;
    while (mid <= hi) {
        if      (nums[mid] == 0) { swap(nums, lo++, mid++); }
        else if (nums[mid] == 1) { mid++; }
        else                     { swap(nums, mid, hi--); }   // don't advance mid; the swapped-in value is unknown
    }
}

private void swap(int[] a, int i, int j) {
    int t = a[i]; a[i] = a[j]; a[j] = t;
}`}</CodeBlock>

        <Callout variant="warn" title="Why the 2-branch doesn't increment mid">
          <p>
            When you swap with <code>hi</code>, you&apos;re pulling in an element that hasn&apos;t been examined
            yet — it could be a 0, 1, or 2. If you advance <code>mid</code>, you skip examining it.
          </p>
          <p>
            The 0-branch is safe to advance because the element coming from <code>lo</code> has already been
            examined (it must be 1, since everything before mid that&apos;s 0 has been swapped to lo). One-line bug,
            hours of debugging if you miss it.
          </p>
        </Callout>

        <h3>LC 56 · Merge Intervals</h3>

        <p>
          Given a list of intervals, merge all overlapping ones. The trick is the first line: <strong>sort by start
          time.</strong>{" "}Once sorted, you only need to compare each interval to the last merged one — overlaps are
          adjacent.
        </p>

        <CodeBlock lang="java">{`public int[][] merge(int[][] intervals) {
    if (intervals.length == 0) return new int[0][];

    // Sort by start time (overflow-safe via Integer.compare, not subtraction)
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

    List<int[]> merged = new ArrayList<>();
    int[] current = intervals[0];
    merged.add(current);

    for (int i = 1; i < intervals.length; i++) {
        int[] next = intervals[i];
        if (next[0] <= current[1]) {
            // Overlap: extend the current interval's end
            current[1] = Math.max(current[1], next[1]);
        } else {
            // No overlap: start a new merged interval
            current = next;
            merged.add(current);
        }
    }
    return merged.toArray(new int[0][]);
}`}</CodeBlock>

        <Callout variant="insight" title="The 'sort first, then sweep' pattern">
          <p>
            Merge Intervals is the canonical example of a pattern you&apos;ll see constantly: sort by some key, then
            sweep through with a single pointer maintaining a running state. Variations:
          </p>
          <ul>
            <li><strong>Meeting Rooms II:</strong>{" "}sort starts and ends separately, sweep both with two pointers, count overlapping meetings.</li>
            <li><strong>Insert Interval:</strong>{" "}sort is unnecessary — already sorted — but the sweep is the same pattern.</li>
            <li><strong>Non-overlapping Intervals:</strong>{" "}sort by end time (not start), greedy-pick the earliest-ending one each time.</li>
            <li><strong>Skyline problem:</strong>{" "}sort events (start and end as separate events), sweep with a max-heap of active heights.</li>
          </ul>
          <p>
            Recognizing &quot;this is sort + sweep&quot; on first read is half the battle. The other half is picking
            the right sort key — start time, end time, or something cleverer.
          </p>
        </Callout>

        <h3>Stretch: Implement merge sort and quicksort from scratch</h3>

        <p>
          Type out both algorithms above without looking. Test them against <code>Arrays.sort</code> on a randomized
          stream of 100k integers, the same differential-testing trick you used for the heap module:
        </p>

        <CodeBlock lang="java">{`import java.util.*;

public class SortStress {
    public static void main(String[] args) {
        Random rnd = new Random(42);
        for (int trial = 0; trial < 100; trial++) {
            int n = 1 + rnd.nextInt(10_000);
            int[] mine = new int[n];
            for (int i = 0; i < n; i++) mine[i] = rnd.nextInt(1_000_000) - 500_000;
            int[] ref = mine.clone();

            mergeSort(mine);              // your implementation
            Arrays.sort(ref);

            if (!Arrays.equals(mine, ref)) {
                throw new AssertionError("disagreement at trial " + trial);
            }
        }
        System.out.println("100 trials, all match.");
    }
}`}</CodeBlock>

        <ClassifyChallenge
          title="Pick the right sort"
          prompt="For each scenario, decide which sort wins. Consider stability, memory, the type of data, and the worst-case guarantee."
          buckets={[
            { id: "merge", label: "mergesort wins (need stable)", color: "indigo" },
            { id: "quick", label: "quicksort wins (in-place, primitives)", color: "violet" },
            { id: "either", label: "doesn't matter — both fine", color: "emerald" },
          ]}
          items={[
            { id: "1", label: "Sort 10 million int[] values where memory is tight and order of equal values doesn't matter.", answer: "quick", explanation: "Primitives, no stability needed, memory is tight — quicksort (specifically dual-pivot) wins. This is exactly the reason Arrays.sort(int[]) uses dual-pivot quicksort: in-place, cache-friendly, fastest in practice." },
            { id: "2", label: "Sort a list of Employee objects by department, then by salary, in two successive sorts.", answer: "merge", explanation: "Multi-key sort via successive sorts requires stability — the second sort must preserve the order from the first. Mergesort (or Timsort) is stable; quicksort is not." },
            { id: "3", label: "Sort a randomly-permuted int[] of 1000 elements with no constraints.", answer: "either", explanation: "At n=1000 with no stability or memory constraint, both run in milliseconds. Quicksort has slightly better constants in practice, but the difference is invisible at this scale. Either is fine." },
            { id: "4", label: "Sort a list of log entries by timestamp, preserving insertion order on ties (same-millisecond entries).", answer: "merge", explanation: "Stability is the requirement — same-millisecond entries must keep their original relative order. Mergesort/Timsort is stable. Quicksort would scramble equal-timestamp entries." },
            { id: "5", label: "Sort a 100GB file of integers that doesn't fit in RAM.", answer: "merge", explanation: "External sorting is the merge-sort use case par excellence. Sort chunks that fit in memory, then merge them in streaming passes. Quicksort doesn't generalize to streaming; mergesort's merge step is naturally streaming." },
            { id: "6", label: "Sort an int[] where the worst case absolutely cannot be O(n²) — real-time system, hard deadline.", answer: "merge", explanation: "Mergesort is O(n log n) GUARANTEED. Quicksort is O(n log n) ON AVERAGE — its worst case is O(n²) and an adversarial input can hit it. For hard-deadline systems, mergesort or heapsort wins." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A junior engineer writes `Arrays.sort(strings)` where `strings` is a `String[]`. What sort does Java run, and is the result stable?"
          options={[
            { label: "Dual-pivot quicksort, unstable.", explanation: "Dual-pivot quicksort is for primitive arrays only. String[] dispatches to Arrays.sort(Object[])." },
            { label: "Timsort, stable.", correct: true, explanation: "Right. String[] is an Object[], so Arrays.sort dispatches to the Object[] overload, which uses Timsort. Timsort is stable, O(n log n) worst case, and adaptive — O(n) on already-sorted runs. This is why object sorts in Java preserve insertion order on equal elements without you needing to ask for it." },
            { label: "Heapsort, unstable.", explanation: "Java doesn't use heapsort as the default for any sort entry point." },
            { label: "Insertion sort, stable.", explanation: "Insertion sort is used as a sub-routine inside Timsort for small subarrays, but the top-level algorithm for Arrays.sort(Object[]) is Timsort." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Trailing forward-link card ───────────────── */}
      <div className="not-prose mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
        <p className="text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">Up next · Module 27</p>
        <Link
          href="/courses/dsa/modules/recursion"
          className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-slate-900 no-underline transition hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"
        >
          Recursion &amp; divide-and-conquer →
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Mergesort and quicksort are recursion in disguise. Time to formalize the technique.
        </p>
      </div>
        <ModuleNav courseId="dsa" currentSlug="sorting" />
    </article>
  );
}
