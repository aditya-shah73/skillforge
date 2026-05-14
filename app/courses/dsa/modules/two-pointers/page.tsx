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
  { id: "setup", title: "What two-pointers is — and the sorted-array tell" },
  { id: "opposite", title: "Opposite-end pointers (the converging pattern)" },
  { id: "same-dir", title: "Same-direction pointers (fast/slow, partition)" },
  { id: "container", title: "Container With Most Water — geometric two-pointer" },
  { id: "project", title: "Project: 3Sum from scratch" },
  { id: "final", title: "Final quiz" },
];

export default function TwoPointersModule() {
  const mod = getModuleBySlug("two-pointers")!;

  // Opposite-end converging on Two Sum II: sorted [2,7,11,15], target=9
  const oppositeEnd = `
flowchart TB
    subgraph S0["Step 0 · l=0, r=3 · sum = 2+15 = 17 > 9 → r--"]
        direction LR
        A0["[2]"] --- B0["7"] --- C0["11"] --- D0["[15]"]
    end
    subgraph S1["Step 1 · l=0, r=2 · sum = 2+11 = 13 > 9 → r--"]
        direction LR
        A1["[2]"] --- B1["7"] --- C1["[11]"] --- D1["15"]
    end
    subgraph S2["Step 2 · l=0, r=1 · sum = 2+7 = 9 ✓ found"]
        direction LR
        A2["[2]"] --- B2["[7]"] --- C2["11"] --- D2["15"]
    end
    S0 --> S1 --> S2
    style A0 fill:#10b981,color:#fff,stroke:#047857
    style D0 fill:#fca5a5,color:#000,stroke:#dc2626
    style A1 fill:#10b981,color:#fff,stroke:#047857
    style C1 fill:#fca5a5,color:#000,stroke:#dc2626
    style A2 fill:#10b981,color:#fff,stroke:#047857
    style B2 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Same-direction (slow/fast) on remove-duplicates: [1,1,2,2,3]
  const sameDirection = `
flowchart TB
    subgraph T0["Step 0 · slow=0, fast=1 · a[0]=1, a[1]=1 → equal, fast++"]
        direction LR
        A0["[1]"] --- B0["[1]"] --- C0["2"] --- D0["2"] --- E0["3"]
    end
    subgraph T1["Step 1 · slow=0, fast=2 · a[2]=2 ≠ a[0] → slow++; a[1]=2"]
        direction LR
        A1["1"] --- B1["[2]"] --- C1["[2]"] --- D1["2"] --- E1["3"]
    end
    subgraph T2["Step 2 · slow=1, fast=4 · a[4]=3 ≠ a[1] → slow++; a[2]=3 · length=3"]
        direction LR
        A2["1"] --- B2["2"] --- C2["[3]"] --- D2["2"] --- E2["[3]"]
    end
    T0 --> T1 --> T2
    style A0 fill:#10b981,color:#fff,stroke:#047857
    style B0 fill:#fbbf24,color:#000,stroke:#d97706
    style B1 fill:#10b981,color:#fff,stroke:#047857
    style C1 fill:#fbbf24,color:#000,stroke:#d97706
    style C2 fill:#10b981,color:#fff,stroke:#047857
    style E2 fill:#fbbf24,color:#000,stroke:#d97706
  `.trim();

  // Container With Most Water — height array [1,8,6,2,5,4,8,3,7]
  const container = `
flowchart TB
    subgraph C0["Step 0 · l=0(h=1), r=8(h=7) · area = 8 × min(1,7) = 8 · l is shorter → l++"]
        direction LR
        H0["1"] --- H1["8"] --- H2["6"] --- H3["2"] --- H4["5"] --- H5["4"] --- H6["8"] --- H7["3"] --- H8["7"]
    end
    subgraph C1["Step 1 · l=1(h=8), r=8(h=7) · area = 7 × min(8,7) = 49 · best so far · r is shorter → r--"]
        direction LR
        I0["1"] --- I1["8"] --- I2["6"] --- I3["2"] --- I4["5"] --- I5["4"] --- I6["8"] --- I7["3"] --- I8["7"]
    end
    subgraph C2["Step 2 · l=1(h=8), r=7(h=3) · area = 6 × min(8,3) = 18 · r is shorter → r--"]
        direction LR
        J0["1"] --- J1["8"] --- J2["6"] --- J3["2"] --- J4["5"] --- J5["4"] --- J6["8"] --- J7["3"] --- J8["7"]
    end
    C0 --> C1 --> C2
    style H0 fill:#10b981,color:#fff,stroke:#047857
    style H8 fill:#10b981,color:#fff,stroke:#047857
    style I1 fill:#10b981,color:#fff,stroke:#047857
    style I8 fill:#fca5a5,color:#000,stroke:#dc2626
    style J1 fill:#10b981,color:#fff,stroke:#047857
    style J7 fill:#fca5a5,color:#000,stroke:#dc2626
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="two-pointers" />
      <ModuleProgress moduleSlug="two-pointers" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module 18 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · the first of two great array-walking patterns</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="setup" title="I see the sorted-array tell and reach for two pointers" xp={20}>
      <section>
        <h2 id="setup">What two-pointers is — and the sorted-array tell</h2>

        <p>
          <strong>Two pointers</strong> is the technique where you maintain two indices into an array (or two
          references into a string, or two cursors into a linked list) and move them according to some rule that
          shrinks the search space at every step. That&apos;s the whole idea. The trick is the rule — and the rule
          almost always exploits some <em>monotonic structure</em> in the data, most commonly sortedness.
        </p>

        <p>
          The pattern shows up in two flavors that look almost identical in code but solve very different problems:
        </p>

        <CodeBlock lang="plain">{`Opposite-end (converging)   l ──→ ←── r     l starts at 0, r at n-1, they walk toward each other
Same-direction (fast/slow)  ──→ s  ──→ f    both start near 0, fast outruns slow`}</CodeBlock>

        <p>
          They share one structural promise: <strong>each pointer moves O(n) times total across the whole
          algorithm</strong>. So both flavors run in O(n) — a dramatic improvement over the brute-force O(n²) nested
          loop that would otherwise solve these problems.
        </p>

        <h3>The sorted-array tell</h3>

        <p>
          When you see the words &quot;sorted array&quot; in a problem statement and you&apos;re asked about pairs,
          triples, sums, or differences — <em>think two pointers immediately</em>. Sortedness is the structural
          property that makes the converging-pointer rule work: if you know the sum is too big, you also know which
          end to shrink. If the array were unsorted, you&apos;d have no such signal.
        </p>

        <Callout variant="insight" title="The mental rule">
          <p>
            <strong>Sorted + pair/triple/sum question → two pointers.</strong> The sortedness gives you a
            comparison-driven move rule that brute force doesn&apos;t exploit.
          </p>
          <p>
            <strong>Same-direction filtering, in-place rewrite, or &quot;keep good, drop bad&quot; → two
            pointers.</strong> The slow pointer marks the write head; the fast pointer scans for what to keep.
          </p>
        </Callout>

        <h3>Why two pointers beats the nested loop</h3>

        <p>
          Consider Two Sum on a sorted array: find indices <code>i &lt; j</code> with{" "}
          <code>a[i] + a[j] == target</code>. The brute force is two nested loops — O(n²). With two pointers, you
          start <code>l = 0, r = n - 1</code>:
        </p>

        <ul>
          <li>If <code>a[l] + a[r] == target</code>: done.</li>
          <li>If <code>a[l] + a[r] &lt; target</code>: the sum is too small. <code>a[r]</code> is the largest available — pairing it with anything to the left of <code>l</code> wouldn&apos;t help (those are smaller than <code>a[l]</code>). The only way to grow the sum is <code>l++</code>.</li>
          <li>If <code>a[l] + a[r] &gt; target</code>: by symmetry, <code>r--</code>.</li>
        </ul>

        <p>
          Each comparison eliminates an entire row or column of the brute-force table. <code>l</code> only moves right
          and <code>r</code> only moves left — together at most <code>n</code> moves — so the loop is O(n).
        </p>

        <h3>The monotone-search-space framing</h3>

        <p>
          Here&apos;s the deeper view. The brute-force search space is the set of all index pairs{" "}
          <code>(i, j)</code> with <code>i &lt; j</code> — there are <code>n(n-1)/2</code> of them, the upper triangle
          of an <code>n × n</code> grid. Each comparison in the two-pointer walk is a single cell of that grid, but
          the move rule guarantees that we never revisit a cell <em>and</em> we never skip the answer. Net effect:
          we visit a path of length <code>≤ 2n</code> through that triangle and we&apos;re done.
        </p>

        <p>
          The data structure here is just an array. The cleverness is in the <em>walk</em>.
        </p>

        <Quiz
          kind="Quick check"
          question="On a sorted array, you're searching for a pair that sums to target. With l=0, r=n-1, you compute a[l] + a[r] and it's less than target. What's the next move?"
          options={[
            { label: "r-- (move the right pointer left).", explanation: "That would shrink the sum further. We need it to grow, not shrink." },
            { label: "l++ (move the left pointer right).", correct: true, explanation: "Right. The sum is too small, and a[r] is already the largest available. The only way to grow the sum is to replace a[l] with something larger — i.e., l++. Each side's move is forced by the comparison." },
            { label: "Both l++ and r--.", explanation: "Moving both at once skips the diagonal in the search space and you can miss valid pairs. Move exactly one each step." },
            { label: "Restart with binary search.", explanation: "Binary search on a sorted array is fine for finding ONE element, but two pointers is the simpler O(n) tool for pair-sum questions." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why does the two-pointer move rule for Two Sum II require the array to be sorted?"
          options={[
            { label: "It doesn't — it works on any array.", explanation: "It does require sorting. Without it, comparing a[l]+a[r] to target gives no signal about which end to shrink." },
            { label: "Sortedness lets the comparison 'sum too big' or 'sum too small' tell you which end to move. Without it, you'd have no directional signal.", correct: true, explanation: "Right. The monotonic structure is the bridge between 'this single comparison failed' and 'so I can rule out an entire chunk of the search space.' On an unsorted array, the same failed comparison tells you nothing about what to try next — you'd have to fall back to brute force." },
            { label: "It's a Java requirement.", explanation: "The technique is language-independent. The reason is algorithmic." },
            { label: "Sorting is faster than two pointers.", explanation: "Sorting is O(n log n); two pointers is O(n). Sorting is what enables two pointers, not a substitute for it." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Opposite-end ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="opposite" title="I can write opposite-end two-pointer code without thinking" xp={25}>
      <section>
        <h2 id="opposite">Opposite-end pointers (the converging pattern)</h2>

        <p>
          The converging pattern: <code>l</code> starts at <code>0</code>, <code>r</code> starts at <code>n - 1</code>,
          they walk toward each other until they meet. Each step, you compare the elements at the two ends and decide
          which pointer to move. The loop terminates when <code>l &gt;= r</code>.
        </p>

        <h3>Two Sum II — input array is sorted</h3>

        <Mermaid chart={oppositeEnd} />

        <CodeBlock lang="java">{`public int[] twoSum(int[] numbers, int target) {
    int l = 0, r = numbers.length - 1;
    while (l < r) {
        int sum = numbers[l] + numbers[r];
        if (sum == target) {
            return new int[]{l + 1, r + 1};   // problem uses 1-indexed
        }
        if (sum < target) l++;                // need a larger sum
        else              r--;                // need a smaller sum
    }
    return new int[]{-1, -1};                 // unreachable on valid input
}`}</CodeBlock>

        <Callout variant="insight" title="The invariant that makes this correct">
          <p>
            At every step, <strong>every pair (i, j) with i &lt; l or j &gt; r has already been ruled out</strong>.
            The remaining candidates lie strictly inside the window <code>[l, r]</code>.
          </p>
          <p>
            When we move <code>l++</code> because the sum was too small, we&apos;re ruling out all pairs of the form
            <code>(l, k)</code> for <code>k &lt;= r</code> — the largest possible right partner is already <code>a[r]</code>,
            and even that wasn&apos;t enough. Similarly for <code>r--</code>. So each move is provably safe: we never
            discard a valid answer.
          </p>
        </Callout>

        <h3>Valid Palindrome — skip non-alphanumeric, case-insensitive</h3>

        <p>
          Same shape, different rule. Walk <code>l</code> and <code>r</code> inward; at each step, advance past any
          non-alphanumeric character on either side, then compare the cleaned characters.
        </p>

        <CodeBlock lang="java">{`public boolean isPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        // Skip non-alphanumeric on the left
        while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
        // Skip non-alphanumeric on the right
        while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
        if (Character.toLowerCase(s.charAt(l)) !=
            Character.toLowerCase(s.charAt(r))) {
            return false;
        }
        l++;
        r--;
    }
    return true;
}`}</CodeBlock>

        <Callout variant="warn" title="Watch the inner-while bound">
          <p>
            Each inner <code>while</code> must guard with <code>l &lt; r</code>, not just <code>l &lt; s.length()</code>.
            Otherwise on a string of all non-alphanumerics like <code>&quot;,.;&quot;</code>, the left pointer can
            run past the right and you read garbage (or pass <code>l == r</code> incorrectly).
          </p>
          <p>
            Same trap shows up in &quot;reverse only letters&quot; and any other &quot;skip-and-compare&quot; variant.
            Always bound the skip by the other pointer, not by the array length.
          </p>
        </Callout>

        <h3>Reverse a string in place</h3>

        <p>
          The simplest opposite-end pattern: swap <code>l</code> and <code>r</code>, walk inward.
        </p>

        <CodeBlock lang="java">{`public void reverseString(char[] s) {
    int l = 0, r = s.length - 1;
    while (l < r) {
        char tmp = s[l];
        s[l] = s[r];
        s[r] = tmp;
        l++;
        r--;
    }
}`}</CodeBlock>

        <p>
          Boring, but it&apos;s the cleanest possible illustration of the loop shape — two pointers, swap or compare,
          both move inward each iteration, terminate when they cross.
        </p>

        <h3>The opposite-end template</h3>

        <CodeBlock lang="java">{`int l = 0, r = n - 1;
while (l < r) {
    // 1. Compare a[l] and a[r] (or their sum, or some derived value)
    // 2. Update the answer if appropriate
    // 3. Decide which side to move based on the comparison:
    //      - if condition wants "bigger" → l++
    //      - if condition wants "smaller" → r--
    //      - sometimes both: l++; r--;
}`}</CodeBlock>

        <p>
          Master this template once and you&apos;ll spot it in dozens of problems: sum-equals-target, sum-closest-to,
          three-sum (with an outer loop), four-sum, palindrome variants, reverse-style operations, and the
          area-maximization problem we&apos;ll see in checkpoint 4.
        </p>

        <Quiz
          kind="Opposite-end check"
          question="On a sorted array of length n, what's the time and space complexity of the converging two-pointer Two Sum?"
          options={[
            { label: "O(n²) time, O(1) space.", explanation: "O(n²) is the brute force. The two-pointer walk eliminates one row or column of the search grid per comparison, so it's linear." },
            { label: "O(n) time, O(1) space.", correct: true, explanation: "Right. l only moves right, r only moves left, and together they take at most n steps before crossing. No auxiliary data structure needed — just two ints. This is why two pointers is the gold-standard solution: optimal time, minimal space." },
            { label: "O(n log n) time, O(1) space.", explanation: "That would be the cost if you sorted first. The Two Sum II problem assumes the array is already sorted, so the walk itself is just O(n)." },
            { label: "O(n) time, O(n) space.", explanation: "No extra space — the two pointers replace the HashMap that the unsorted-array Two Sum needs." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Same-direction ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="same-dir" title="I can use slow/fast pointers to rewrite arrays in place" xp={25}>
      <section>
        <h2 id="same-dir">Same-direction pointers (fast/slow, partition)</h2>

        <p>
          The same-direction pattern: both pointers start near the beginning of the array and move forward. The fast
          pointer scans every element; the slow pointer marks the position where the next &quot;kept&quot; element
          should go. The fast pointer outruns the slow pointer; the gap between them is the &quot;dropped&quot; region.
        </p>

        <p>
          This is the engine behind every <em>in-place filter</em>: remove duplicates, move zeroes, partition by
          predicate, compact in place. The mental model is clean:
        </p>

        <CodeBlock lang="plain">{`slow = "write head"   — points at the next slot to fill with a kept element
fast = "read head"    — scans every element, decides if it should be kept`}</CodeBlock>

        <h3>Remove duplicates from sorted array</h3>

        <p>
          Sorted array; duplicates are adjacent. Walk <code>fast</code> across; when{" "}
          <code>a[fast] != a[slow]</code>, advance <code>slow</code> and copy.
        </p>

        <Mermaid chart={sameDirection} />

        <CodeBlock lang="java">{`public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int slow = 0;                              // last unique-value index
    for (int fast = 1; fast < nums.length; fast++) {
        if (nums[fast] != nums[slow]) {
            slow++;
            nums[slow] = nums[fast];
        }
    }
    return slow + 1;                           // length of unique prefix
}`}</CodeBlock>

        <p>
          The output array&apos;s first <code>slow + 1</code> entries hold the unique values; everything past that is
          ignored. No allocation, single pass, O(n) time, O(1) space.
        </p>

        <Callout variant="insight" title="Why slow doesn't move every iteration">
          <p>
            When <code>nums[fast] == nums[slow]</code>, the fast pointer is on a duplicate of what we already kept.
            We just advance fast and skip the write.
          </p>
          <p>
            The slow pointer only moves when we discover a new value to keep —
            that&apos;s why it ends up pointing at the last unique element, and the answer is <code>slow + 1</code>.
          </p>
        </Callout>

        <h3>Move Zeroes — keep order, push zeroes to the end</h3>

        <p>
          Same template, &quot;keep&quot; means &quot;is non-zero.&quot;
        </p>

        <CodeBlock lang="java">{`public void moveZeroes(int[] nums) {
    int slow = 0;
    // Phase 1: copy non-zeros to the front, in order.
    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != 0) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    // Phase 2: fill the rest with zeros.
    while (slow < nums.length) {
        nums[slow] = 0;
        slow++;
    }
}`}</CodeBlock>

        <p>
          A more clever one-pass version uses <code>swap</code> instead of overwrite-then-fill, but the two-phase
          version is easier to reason about and equally O(n). Save the swap version for when the interviewer asks
          &quot;can you do it in one pass without the second loop?&quot;
        </p>

        <CodeBlock lang="java">{`// One-pass swap version
public void moveZeroes(int[] nums) {
    int slow = 0;
    for (int fast = 0; fast < nums.length; fast++) {
        if (nums[fast] != 0) {
            int tmp = nums[slow];
            nums[slow] = nums[fast];
            nums[fast] = tmp;
            slow++;
        }
    }
}`}</CodeBlock>

        <h3>Partition by predicate (Dutch flag, simple version)</h3>

        <p>
          Generalize: any &quot;keep these, drop those&quot; problem fits. Predicate &quot;is even&quot;, &quot;less
          than pivot&quot;, &quot;not deleted&quot; — same template.
        </p>

        <CodeBlock lang="java">{`public int partitionByPredicate(int[] nums, java.util.function.IntPredicate keep) {
    int slow = 0;
    for (int fast = 0; fast < nums.length; fast++) {
        if (keep.test(nums[fast])) {
            int tmp = nums[slow];
            nums[slow] = nums[fast];
            nums[fast] = tmp;
            slow++;
        }
    }
    return slow;   // size of the "kept" prefix
}`}</CodeBlock>

        <p>
          This is a partial Dutch-flag partition (two-color). The full three-color version (less / equal / greater
          than pivot) uses three pointers and shows up in quicksort and the &quot;Sort Colors&quot; LeetCode problem.
          Once you have the two-color template solid, the three-color extension is a small step.
        </p>

        <h3>The same-direction template</h3>

        <CodeBlock lang="java">{`int slow = 0;
for (int fast = 0; fast < n; fast++) {
    if (KEEP(nums[fast])) {
        nums[slow] = nums[fast];   // or swap, depending on requirements
        slow++;
    }
}
// answer: slow is the count of kept elements;
// the "kept" region is nums[0 .. slow - 1].`}</CodeBlock>

        <Callout variant="warn" title="Common bug: forgetting to advance slow">
          <p>
            A surprisingly easy mistake is to copy <code>nums[slow] = nums[fast]</code> but forget the <code>slow++</code>.
            The next kept element overwrites the one you just placed, and you lose data.
          </p>
          <p>
            Or the symmetric bug: increment <code>slow</code> first, then copy — now you write past the kept region.
            Always think: <strong>copy at slow, then advance.</strong>
          </p>
        </Callout>

        <Quiz
          kind="Same-direction check"
          question="In remove-duplicates from a sorted array, why do we initialize slow = 0 and start the for-loop at fast = 1?"
          options={[
            { label: "It's an off-by-one workaround.", explanation: "It's not a workaround — it's the right initial state. The first element is trivially unique (it's the first), so it's already 'kept' at index 0. No comparison needed." },
            { label: "The first element is always unique relative to itself, so a[0] is already the first kept value at slot 0. Fast starts at 1 because that's the first element we actually need to compare.", correct: true, explanation: "Right. slow=0 means 'a[0] is in its final position.' fast=1 means 'now I'll scan starting at the second element and keep new values as I find them.' This invariant — slow points at the last kept value, fast at the next candidate — is the heart of the same-direction pattern." },
            { label: "Java arrays are zero-indexed.", explanation: "True but irrelevant to why these specific starting values are correct." },
            { label: "Performance — skipping index 0 is faster.", explanation: "Same asymptotic cost; the choice is about correctness, not speed." },
          ]}
        />

        <Quiz
          kind="Same-direction check"
          question="Move Zeroes: for input [0, 1, 0, 3, 12], after the one-pass swap version finishes, what's the array?"
          options={[
            { label: "[1, 3, 12, 0, 0].", correct: true, explanation: "Right. slow tracks the next non-zero slot. We swap each non-zero forward as we find it, which both fills the front with non-zeros in order AND pushes zeros to the back. Final state: non-zeros [1, 3, 12], then zeros [0, 0]." },
            { label: "[0, 0, 1, 3, 12].", explanation: "Backwards — that would push zeros to the front. The problem asks for zeros at the end with the order of non-zeros preserved." },
            { label: "[1, 0, 3, 12, 0].", explanation: "This is what you'd get if you only copied without swapping (or skipped the second-phase fill), but the swap version both moves non-zeros forward and pushes zeros backward in a single pass." },
            { label: "[12, 3, 1, 0, 0].", explanation: "Order of non-zeros must be preserved. Reverse order would mean we sorted, which we didn't." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Container ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="container" title="I understand the geometric two-pointer greedy" xp={25}>
      <section>
        <h2 id="container">Container With Most Water — geometric two-pointer</h2>

        <p>
          LeetCode 11. You have an array <code>h[]</code> where each entry is a vertical line&apos;s height. Pick two
          lines, form a container, and find the pair that holds the most water. The amount of water held by lines
          at indices <code>l</code> and <code>r</code> is:
        </p>

        <CodeBlock lang="plain">{`area(l, r) = (r - l) × min(h[l], h[r])`}</CodeBlock>

        <p>
          The brute force is O(n²): every pair. The two-pointer solution is O(n), and the move rule is the cleverness
          worth understanding deeply.
        </p>

        <h3>The greedy move rule</h3>

        <p>
          Start with <code>l = 0</code> and <code>r = n - 1</code> — the widest possible container. Compute the area.
          Now you&apos;re going to lose width with every move (both pointers move inward), so the question is whether
          you can compensate by gaining height. <strong>Always move the pointer pointing at the shorter line.</strong>
        </p>

        <Mermaid chart={container} />

        <CodeBlock lang="java">{`public int maxArea(int[] height) {
    int l = 0, r = height.length - 1;
    int best = 0;
    while (l < r) {
        int h = Math.min(height[l], height[r]);
        int area = (r - l) * h;
        if (area > best) best = area;

        // Move the shorter side — moving the taller side can never help.
        if (height[l] < height[r]) l++;
        else                       r--;
    }
    return best;
}`}</CodeBlock>

        <h3>Why moving the shorter side is the right move</h3>

        <p>
          Here&apos;s the proof. Say <code>height[l] &lt; height[r]</code> at some step. Consider what happens if we
          move the <em>taller</em> side instead — that is, <code>r--</code> while keeping <code>l</code> fixed:
        </p>

        <ul>
          <li>The width strictly decreases (from <code>r - l</code> to <code>r - 1 - l</code>).</li>
          <li>The height is bounded above by <code>height[l]</code>, the shorter side. New <code>r-1</code> might be taller or shorter than the old <code>r</code> — it doesn&apos;t matter, because <code>min(height[l], height[r-1]) &lt;= height[l]</code> regardless.</li>
          <li>So the new area is at most <code>(r - 1 - l) × height[l]</code>, which is strictly less than <code>(r - l) × height[l]</code>, which is what we had before.</li>
        </ul>

        <p>
          In other words: <strong>moving the taller side strictly reduces the area — it can never
          improve it.</strong> Every pair containing the current shorter line on the shorter side has been examined
          (or strictly dominated by what we just computed). So we&apos;re safe to throw away that line — increment
          <code>l</code> — and continue.
        </p>

        <Callout variant="insight" title="The greedy invariant">
          <p>
            At every step, the optimal pair is somewhere in the window <code>[l, r]</code>. Each move — always shrinking
            from the side with the shorter line — removes only pairs that are <em>provably non-optimal</em>. Eventually
            the pointers meet and we&apos;re left with the maximum.
          </p>
          <p>
            The proof is short, but it&apos;s the kind of greedy argument interviewers love to see verbalized. If you
            can&apos;t articulate why it&apos;s correct, the code looks like a magic trick.
          </p>
        </Callout>

        <h3>What about ties?</h3>

        <p>
          If <code>height[l] == height[r]</code>, you can move either side — the proof goes through for whichever you
          pick. The standard convention is to put the equality on the <code>r--</code> branch (as in the code above:{" "}
          <code>if &lt; else</code>). It doesn&apos;t affect correctness.
        </p>

        <h3>Trapping Rain Water — the harder cousin</h3>

        <p>
          LC 42. Same array of heights, but now you&apos;re asked: how much water does the entire skyline trap, summed
          across all positions? It&apos;s a different problem — Container With Most Water finds one pair&apos;s area;
          Trapping Rain Water sums water above every column.
        </p>

        <p>
          The key insight: water above column <code>i</code> equals{" "}
          <code>min(maxLeft[i], maxRight[i]) - height[i]</code>. The two-pointer solution maintains running maxes from
          each side and walks inward, deciding which side to advance based on which running max is currently smaller.
        </p>

        <CodeBlock lang="java">{`public int trap(int[] height) {
    int l = 0, r = height.length - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            // Left side is the constraint — its leftMax determines water level here.
            leftMax = Math.max(leftMax, height[l]);
            water += leftMax - height[l];
            l++;
        } else {
            rightMax = Math.max(rightMax, height[r]);
            water += rightMax - height[r];
            r--;
        }
    }
    return water;
}`}</CodeBlock>

        <Callout variant="info" title="Why this is the same family of trick">
          <p>
            Container With Most Water moves the shorter side because the shorter side is the bottleneck. Trapping
            Rain Water moves the shorter side because the shorter side is what determines the local water level — so
            we can confidently compute its contribution to the total.
          </p>
          <p>
            Both problems exploit the same structural fact: when you&apos;re bounded by two endpoints, the minimum
            of the two is what matters. That&apos;s the geometric heart of opposite-end two pointers — and it shows
            up in surprisingly many places.
          </p>
        </Callout>

        <Quiz
          kind="Container check"
          question="In Container With Most Water, suppose at some step l=2, r=7, height[2]=3, height[7]=5. What's the next move and why?"
          options={[
            { label: "r-- because height[r] is bigger.", explanation: "Moving the TALLER side is exactly what we never do. The water level is capped by the shorter side (3), so changing the taller side can't raise that cap — and the width is shrinking either way." },
            { label: "l++ because height[l] is the shorter side; moving the taller side can't grow the area, only shrink it.", correct: true, explanation: "Right. height[l]=3 caps the area at min(3, anything)=3. Moving r doesn't lift that cap; it only loses width. Moving l might find a taller line, which can lift the cap. So l++ is the only move with potential upside." },
            { label: "Both, because we explore symmetrically.", explanation: "Moving both pointers at once skips diagonals in the search space and can miss valid configurations. Move exactly one per step — the shorter side." },
            { label: "Neither — record the area and stop.", explanation: "We only stop when l >= r. There may still be better areas inward; the greedy walk explores them all." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="project" title="I built 3Sum from scratch and solved 4 LeetCode problems" xp={40} manual manualLabel="I solved 3Sum and at least 3 of the warm-ups">
      <section>
        <h2 id="project">Project: 3Sum from scratch</h2>

        <p>
          3Sum (LeetCode 15) is the canonical &quot;outer loop + opposite-end two-pointer inner loop&quot; problem.
          It&apos;s also the place where deduplication trips most people up. Build it carefully and the pattern
          becomes muscle memory.
        </p>

        <h3>The problem</h3>

        <p>
          Given an array <code>nums</code>, return all unique triples <code>(a, b, c)</code> such that{" "}
          <code>a + b + c == 0</code>. The triples must be unique — no duplicates of the same set of three values
          in different orders.
        </p>

        <h3>The plan</h3>

        <ol>
          <li><strong>Sort</strong> the array. This is what makes the two-pointer inner loop possible at all.</li>
          <li><strong>Outer loop</strong>: pick the first element <code>nums[i]</code>.</li>
          <li><strong>Inner two-pointer</strong>: in the suffix <code>nums[i+1 ... n-1]</code>, find pairs that sum to <code>-nums[i]</code>.</li>
          <li><strong>Skip duplicates</strong> at three places: the outer <code>i</code>, and the inner <code>l</code> and <code>r</code> after a successful match.</li>
        </ol>

        <h3>Step 1 · The skeleton without dedup</h3>

        <CodeBlock lang="java">{`// First version — finds triples but produces duplicates
public List<List<Integer>> threeSumNaive(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> out = new ArrayList<>();
    int n = nums.length;
    for (int i = 0; i < n - 2; i++) {
        int l = i + 1, r = n - 1;
        int target = -nums[i];
        while (l < r) {
            int sum = nums[l] + nums[r];
            if (sum == target) {
                out.add(Arrays.asList(nums[i], nums[l], nums[r]));
                l++;
                r--;
            } else if (sum < target) {
                l++;
            } else {
                r--;
            }
        }
    }
    return out;
}`}</CodeBlock>

        <p>
          On <code>nums = [-1, -1, 0, 0, 1, 1]</code>, this finds <code>(-1, 0, 1)</code> several times. We need
          three skip-duplicate guards.
        </p>

        <h3>Step 2 · Add the three dedup steps</h3>

        <CodeBlock lang="java">{`public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> out = new ArrayList<>();
    int n = nums.length;

    for (int i = 0; i < n - 2; i++) {
        // Optimization: once nums[i] > 0, no triple summing to 0 is possible.
        if (nums[i] > 0) break;

        // Skip duplicate i — the value at i has already been tried.
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int l = i + 1, r = n - 1;
        int target = -nums[i];
        while (l < r) {
            int sum = nums[l] + nums[r];
            if (sum == target) {
                out.add(Arrays.asList(nums[i], nums[l], nums[r]));
                l++;
                r--;
                // Skip duplicate l — slide past equal values.
                while (l < r && nums[l] == nums[l - 1]) l++;
                // Skip duplicate r — slide past equal values.
                while (l < r && nums[r] == nums[r + 1]) r--;
            } else if (sum < target) {
                l++;
            } else {
                r--;
            }
        }
    }
    return out;
}`}</CodeBlock>

        <Callout variant="warn" title="Why three dedup checks, not just one">
          <p>
            Each dedup happens for a different reason:
          </p>
          <ul>
            <li><strong>Outer dedup</strong> (<code>nums[i] == nums[i - 1]</code>): the same first-of-triple has already been processed; the inner loop would re-find the same pairs.</li>
            <li><strong>Inner left dedup after a match</strong> (<code>nums[l] == nums[l - 1]</code>): once we&apos;ve recorded a triple and advanced <code>l</code>, if the new <code>nums[l]</code> equals the previous one we&apos;d record the same triple again.</li>
            <li><strong>Inner right dedup after a match</strong> (<code>nums[r] == nums[r + 1]</code>): symmetric — slide <code>r</code> past equal values so the next pair we test is genuinely new.</li>
          </ul>
          <p>
            Skipping any one of these produces duplicates. Forgetting all three turns 3Sum into &quot;wrong answer&quot;
            on every test case with a repeated value.
          </p>
        </Callout>

        <h3>Step 3 · Complexity</h3>

        <p>
          Sort: <strong>O(n log n)</strong>. Outer loop: <strong>O(n)</strong>. Inner two-pointer: <strong>O(n)</strong>.
          Total: <strong>O(n²)</strong>. Space: <strong>O(log n)</strong> for the sort&apos;s recursion (Java&apos;s
          <code>Arrays.sort</code> on primitives), or <strong>O(1)</strong> if you ignore the sort&apos;s stack.
        </p>

        <p>
          Two pointers turned what would be a brute-force O(n³) (three nested loops) into O(n²). Same trick scales:
          4Sum is O(n³) with two outer loops and a two-pointer inner; k-Sum is O(n^(k-1)).
        </p>

        <Callout variant="insight" title="Why we can't just hash this">
          <p>
            A &quot;HashSet of seen pairs&quot; approach also works for 3Sum and is also O(n²), but the two-pointer
            version wins on space (O(1) extra vs O(n)) and on dedup clarity. The HashSet version requires you to put
            sorted-tuple representations into a Set to dedupe — more code, more allocations.
          </p>
          <p>
            The two-pointer version is the canonical interview solution. Practice it until you can write it without
            looking.
          </p>
        </Callout>

        <h3>The four warm-ups</h3>

        <p>Type these out, submit, verify the green check.</p>

        <ul>
          <li><strong>LC 167 · Two Sum II</strong> — straight opposite-end pattern. ~10 lines.</li>
          <li><strong>LC 125 · Valid Palindrome</strong> — opposite-end with skip-non-alphanumeric. ~12 lines.</li>
          <li><strong>LC 11 · Container With Most Water</strong> — opposite-end with the shorter-side rule. ~10 lines.</li>
          <li><strong>LC 26 · Remove Duplicates from Sorted Array</strong> — same-direction slow/fast. ~8 lines.</li>
        </ul>

        <h3>Stretch: Trapping Rain Water (LC 42)</h3>

        <p>
          Two-pointer solution from the previous section. ~15 lines. Once it clicks, you&apos;ll appreciate how much
          machinery the two-pointer trick saves you compared to the prefix-max / suffix-max array version.
        </p>

        <h3>Stretch: 3Sum Closest (LC 16)</h3>

        <p>
          Variant: find the triple whose sum is closest to a target (not necessarily zero). Same template as 3Sum,
          but instead of recording matches, track the running best <code>|sum - target|</code> and update accordingly.
          No dedup needed because we&apos;re returning a number, not a list of triples. ~20 lines.
        </p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="two-pointers" id="final" title="Two pointers is reflex" xp={30} celebration="Sorted arrays, in-place rewrites, and skyline-style problems all bend to the same trick. Up next: sliding window — the same kind of cleverness, on contiguous subarrays.">
      <section>
        <h2 id="final">Final quiz</h2>

        <ClassifyChallenge
          title="Which two-pointer flavor (or none)?"
          prompt="For each LeetCode-style problem, decide whether it's an opposite-end two-pointer, a same-direction two-pointer, or not a two-pointer problem at all."
          buckets={[
            { id: "opposite", label: "Opposite-end", color: "indigo" },
            { id: "same-direction", label: "Same-direction", color: "emerald" },
            { id: "not-two-pointer", label: "Not two-pointer", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Given a sorted array, find two indices that sum to a target value.", answer: "opposite", explanation: "Two Sum II — the canonical opposite-end pattern. Sortedness gives the directional move signal." },
            { id: "2", label: "Move all zeros in an array to the end while preserving the order of non-zeros, in place.", answer: "same-direction", explanation: "Move Zeroes — slow points at the next non-zero slot, fast scans. Classic same-direction filter." },
            { id: "3", label: "Given an unsorted array of integers, return whether any two elements sum to k.", answer: "not-two-pointer", explanation: "Unsorted means no monotonic structure — two pointers can't help. Use a HashSet (Module 9): for each x, check if k-x has been seen. O(n) time, O(n) space." },
            { id: "4", label: "Find the maximum area of water trapped between two vertical lines in a height array.", answer: "opposite", explanation: "Container With Most Water. Greedy: always move the shorter side; the area is bounded by min(h[l], h[r])." },
            { id: "5", label: "Remove every occurrence of a given value from an array, in place. Return the new length.", answer: "same-direction", explanation: "LC 27 Remove Element — slow/fast filter. Keep predicate is 'value != target'. Slow ends as the new length." },
            { id: "6", label: "Find the shortest path in an unweighted graph between two nodes.", answer: "not-two-pointer", explanation: "Graph traversal, not array walking. BFS (Module 15). 'Two pointers' applies to linear structures with monotonic move rules — not graphs." },
            { id: "7", label: "Determine if a string is a palindrome, ignoring non-alphanumeric characters and case.", answer: "opposite", explanation: "Valid Palindrome. l and r walk inward; skip non-alphanumeric on each side, then compare normalized characters." },
            { id: "8", label: "Find the kth smallest element in an unsorted array.", answer: "not-two-pointer", explanation: "Quickselect or heap-of-size-k. No two-element structure to track; you're partitioning around a pivot or maintaining a top-k. Different algorithmic family." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="When is two-pointer NOT the right tool, even on an array problem?"
          options={[
            { label: "Whenever the array is sorted.", explanation: "Sorted arrays are exactly when two-pointer is most useful. The sortedness is the structural signal." },
            { label: "When the array isn't sorted AND there's no monotonic move rule available — the comparison gives you no signal about which pointer to move.", correct: true, explanation: "Right. Two pointers needs SOMETHING — sortedness, a slow/fast write-vs-read split, a greedy invariant — that lets one comparison rule out a chunk of the search space. Without that, every pair is independent, and you fall back to either brute force or a hash-based trick (which is what unsorted Two Sum uses)." },
            { label: "On any problem larger than n=10⁴.", explanation: "Two pointers is O(n), so it scales fine to millions. The constraint is structural, not size-based." },
            { label: "When the language is Java.", explanation: "Two pointers is language-independent. Java implements it the same way Python or C++ would." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In 3Sum, why do we sort the array as the very first step?"
          options={[
            { label: "Because LeetCode's grader expects sorted output.", explanation: "Output ordering doesn't matter for 3Sum (the problem accepts triples in any order). We sort for algorithmic reasons, not formatting." },
            { label: "Sorting enables the opposite-end two-pointer move rule for the inner loop, AND it makes adjacent-equal dedup possible (so 'skip duplicates' is just 'skip equal neighbors').", correct: true, explanation: "Right. Two reasons in one. (1) Sorted = the inner two-pointer works (sum < target → l++, sum > target → r--). (2) Sorted = duplicates are adjacent, so 'nums[i] == nums[i-1]' is the dedup test. Without sorting, you'd need a HashSet of canonicalized triples — more code, more allocations." },
            { label: "Sorting makes the algorithm O(n log n).", explanation: "Sorting is O(n log n), but the overall algorithm is O(n²) dominated by the outer-loop times inner-walk. Sorting is a setup cost, not the main cost." },
            { label: "It's not actually required.", explanation: "Without sorting, you can't use the two-pointer inner loop AND dedup is much harder. The whole solution shape depends on it." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="One technique, two flavors. Opposite-end (the converging walk on sorted arrays) and same-direction (the slow/fast filter for in-place rewrites). Once you spot the tell, the code template is short and the proof of correctness is short."
          points={[
            { takeaway: "'Sorted + pair/triple/sum' → opposite-end two pointers, reflex.", detail: "Two Sum II, 3Sum, 4Sum, 3Sum Closest, sum-closest variants. Sort first if the array isn't already sorted; then converge with l/r based on sum vs target." },
            { takeaway: "'Filter / compact / partition in place' → same-direction slow/fast.", detail: "Remove duplicates, move zeroes, remove element, partition by predicate. Slow is the write head; fast is the read head; the gap is the dropped region. Always copy at slow, then advance." },
            { takeaway: "Container With Most Water: always move the shorter side.", detail: "The water is bounded by the shorter side, and moving the taller side strictly shrinks the area. Same logic powers Trapping Rain Water's two-pointer solution: the shorter running-max determines the local water level." },
            { takeaway: "3Sum needs three dedup checks: outer i, inner l after match, inner r after match.", detail: "Forgetting any one produces duplicate triples. The skip pattern (nums[i] == nums[i-1] → continue, similarly for l and r after a recorded match) is the crux of getting 3Sum right on the first submit." },
            { takeaway: "Two pointers always runs in O(n) — its defining promise.", detail: "Each pointer moves at most n times across the whole algorithm. Combined with O(n log n) sort when needed, you turn brute O(n²) or O(n³) problems into O(n) or O(n²)." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-semibold">Up next · Module 19</p>
          <Link
            href="/courses/dsa/modules/sliding-window"
            className="block mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300 no-underline"
          >
            Sliding window (fixed &amp; variable) →
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            If two pointers is the sorted-array tool, sliding window is the contiguous-subarray tool. Same idea,
            different shape.
          </p>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="two-pointers" />
    </article>
  );
}
