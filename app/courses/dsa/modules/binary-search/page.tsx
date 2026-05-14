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
  { id: "setup", title: "Binary search and the contract you must keep" },
  { id: "off-by-one", title: "The off-by-one minefield: <= vs <, mid math, l = mid+1" },
  { id: "bounds", title: "Lower bound, upper bound — the Java idiom" },
  { id: "answer-search", title: "Binary-searching the answer" },
  { id: "project", title: "Project: Koko Eating Bananas + rotated array" },
  { id: "final", title: "Final quiz" },
];

export default function BinarySearchModule() {
  const mod = getModuleBySlug("binary-search")!;

  // The search-space halving picture
  const halving = `
flowchart TB
    subgraph S0["Step 0 · l=0, r=8 · search [0,8)"]
        direction LR
        A0["1"] --- B0["3"] --- C0["5"] --- D0["7"] --- E0["9"] --- F0["11"] --- G0["13"] --- H0["15"]
    end
    subgraph S1["Step 1 · mid=4, a[4]=9 > 7 · go left, r=4"]
        direction LR
        A1["1"] --- B1["3"] --- C1["5"] --- D1["7"] --- E1["9"] --- F1["11"] --- G1["13"] --- H1["15"]
    end
    subgraph S2["Step 2 · l=0, r=4 · mid=2, a[2]=5 < 7 · go right, l=3"]
        direction LR
        A2["1"] --- B2["3"] --- C2["5"] --- D2["7"] --- E2["9"] --- F2["11"] --- G2["13"] --- H2["15"]
    end
    subgraph S3["Step 3 · l=3, r=4 · mid=3, a[3]=7 · FOUND"]
        direction LR
        A3["1"] --- B3["3"] --- C3["5"] --- D3["7"] --- E3["9"] --- F3["11"] --- G3["13"] --- H3["15"]
    end
    S0 --> S1 --> S2 --> S3
    style E1 fill:#fca5a5,color:#000,stroke:#dc2626
    style C2 fill:#fca5a5,color:#000,stroke:#dc2626
    style D3 fill:#10b981,color:#fff,stroke:#047857
    style A2 fill:#cbd5e1,color:#475569
    style B2 fill:#cbd5e1,color:#475569
    style F1 fill:#cbd5e1,color:#475569
    style G1 fill:#cbd5e1,color:#475569
    style H1 fill:#cbd5e1,color:#475569
    style F2 fill:#cbd5e1,color:#475569
    style G2 fill:#cbd5e1,color:#475569
    style H2 fill:#cbd5e1,color:#475569
    style A3 fill:#cbd5e1,color:#475569
    style B3 fill:#cbd5e1,color:#475569
    style C3 fill:#cbd5e1,color:#475569
    style E3 fill:#cbd5e1,color:#475569
    style F3 fill:#cbd5e1,color:#475569
    style G3 fill:#cbd5e1,color:#475569
    style H3 fill:#cbd5e1,color:#475569
  `.trim();

  // Answer-search picture: Koko's eating speed
  const kokoSearch = `
flowchart TB
    subgraph SP["Search space: speeds 1..max(piles)"]
        direction LR
        T1["1"] --> T2["..."] --> T3["K?"] --> T4["..."] --> T5["max"]
    end
    subgraph PR["Predicate: canFinish(K, H)?"]
        direction TB
        P1["K too slow → false<br/>(needs more hours)"]
        P2["K just right → true"]
        P3["K too fast → true (wasted)"]
    end
    SP --> PR
    PR --> ANS["Find smallest K with canFinish(K)=true<br/>= lower-bound on the predicate"]
    style SP fill:#1e293b,color:#fff,stroke:#475569
    style P1 fill:#fca5a5,color:#000
    style P2 fill:#10b981,color:#fff
    style P3 fill:#86efac,color:#000
    style ANS fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  // Monotonic predicate visualization: F F F T T T T
  const monotonic = `
flowchart LR
    subgraph M["Monotonic predicate over the answer space"]
        direction LR
        K1["K=1<br/>F"] --> K2["K=2<br/>F"] --> K3["K=3<br/>F"] --> K4["K=4<br/>T"] --> K5["K=5<br/>T"] --> K6["K=6<br/>T"]
    end
    K4 -.->|"first T = answer"| ANS["smallest K that works"]
    style K1 fill:#fca5a5,color:#000
    style K2 fill:#fca5a5,color:#000
    style K3 fill:#fca5a5,color:#000
    style K4 fill:#10b981,color:#fff,stroke:#047857
    style K5 fill:#86efac,color:#000
    style K6 fill:#86efac,color:#000
    style ANS fill:#fef3c7,color:#000,stroke:#d97706
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="binary-search" />
      <ModuleProgress moduleSlug="binary-search" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module 20 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · the algorithm everyone thinks they know</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="setup" title="I understand the contract binary search demands" xp={20}>
      <section>
        <h2 id="setup">Binary search and the contract you must keep</h2>

        <p>
          Binary search is the algorithm everyone &quot;knows&quot; and almost nobody writes correctly on the first
          try. There&apos;s a famous Jon Bentley result: when he asked professional programmers to implement it from
          scratch, ~90% of submissions had bugs — overflow, off-by-one, infinite loops. The mechanics are <em>simple</em>;
          the discipline of getting the boundaries right is what trips people up. This module&apos;s entire purpose is
          to make that discipline reflexive.
        </p>

        <h3>The precondition</h3>

        <p>
          Binary search needs <strong>monotonicity</strong>. Either:
        </p>

        <ul>
          <li>The input is a <strong>sorted array</strong>, and you&apos;re looking for a target value, OR</li>
          <li>There&apos;s a <strong>monotonic predicate</strong> over the answer space — a function <code>P(x)</code> such that <code>P</code> goes from <code>false</code> to <code>true</code> exactly once (or stays one or the other) as <code>x</code> increases.</li>
        </ul>

        <p>
          Without one of those, you&apos;re not in binary-search territory. The whole magic — &quot;throw away half
          the search space at every step&quot; — depends on knowing which half can&apos;t contain the answer. If the
          input isn&apos;t monotonic, halving is meaningless.
        </p>

        <Callout variant="insight" title="The mental model: shrinking an interval">
          <p>
            Think of binary search as maintaining an interval <code>[l, r)</code> (or <code>[l, r]</code> — pick one
            convention) that always contains the answer. Each iteration computes a midpoint, decides which half the
            answer lies in, and shrinks the interval. When the interval has size 0 or 1, you&apos;re done.
          </p>
          <p>
            That invariant — <em>&quot;the answer is in [l, r)&quot;</em> — is the single most useful thing to keep in
            your head while writing the loop. Every line of code should be asking: &quot;does this preserve the
            invariant?&quot;
          </p>
        </Callout>

        <h3>The picture: halving the search space</h3>

        <p>
          Searching for <code>7</code> in <code>[1, 3, 5, 7, 9, 11, 13, 15]</code>. At each step, the midpoint either
          is the target, or tells us which half to discard.
        </p>

        <Mermaid chart={halving} />

        <p>
          Three iterations to find <code>7</code> among 8 elements. In general, ⌈log₂(n)⌉ iterations to either find the
          target or rule it out — that&apos;s the entire performance argument. 30 iterations cover a billion elements.
          Linear scan would need a billion comparisons; binary search needs 30. The asymmetry is staggering, and
          it&apos;s the reason this algorithm matters.
        </p>

        <h3>The two convention families</h3>

        <p>
          There are two interval conventions, and you&apos;ll see both in the wild. Pick one and use it consistently.
          Mixing them is where most bugs come from.
        </p>

        <CodeBlock lang="plain">{`Convention A · Closed interval [l, r]
  l = 0, r = n - 1
  loop while l <= r
  on "go right":  l = mid + 1
  on "go left":   r = mid - 1
  loop terminates with l > r — answer not present, l is the insertion point

Convention B · Half-open interval [l, r)
  l = 0, r = n
  loop while l < r
  on "go right":  l = mid + 1
  on "go left":   r = mid       (NOT mid - 1!)
  loop terminates with l == r — answer not present, l is the insertion point`}</CodeBlock>

        <p>
          Convention A is the textbook version most people learn first. Convention B is what you&apos;ll write for{" "}
          lower-bound / upper-bound style problems and answer-search — the &quot;find the boundary&quot; flavor that
          dominates real interview questions. Both are correct; both have their place. We&apos;ll cover both, but if
          you&apos;re going to memorize one, memorize Convention B.
        </p>

        <h3>The plain version — Convention A</h3>

        <CodeBlock lang="java">{`public int binarySearch(int[] a, int target) {
    int l = 0, r = a.length - 1;     // closed interval [l, r]
    while (l <= r) {                  // <= because r is inclusive
        int mid = l + (r - l) / 2;    // overflow-safe midpoint
        if (a[mid] == target) return mid;
        if (a[mid] < target) l = mid + 1;   // target is in (mid, r]
        else                  r = mid - 1;   // target is in [l, mid)
    }
    return -1;                         // not found; l is where it would go
}`}</CodeBlock>

        <Callout variant="warn" title="Why l + (r - l) / 2 instead of (l + r) / 2">
          <p>
            They&apos;re mathematically identical for non-negative <code>l, r</code>. They&apos;re <em>not</em> identical
            in fixed-width integer arithmetic. <code>(l + r)</code> can overflow when the array is huge —{" "}
            <code>l + r &gt; Integer.MAX_VALUE</code> wraps to a negative number, and you index into negative
            territory. <code>l + (r - l) / 2</code> never overflows because <code>r - l</code> is bounded by the
            array length.
          </p>
          <p>
            This bug went unnoticed in <code>java.util.Arrays.binarySearch</code> for over a decade. Joshua Bloch
            wrote a famous blog post about it (&quot;Extra, Extra — Read All About It: Nearly All Binary Searches and
            Mergesorts are Broken&quot;). It bites in production, not in your textbook examples — but if you write
            <code> (l + r) / 2 </code>in an interview, you should expect to be asked about it.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="What's the precondition that makes binary search applicable?"
          options={[
            { label: "The array must be sorted, OR there must be a monotonic predicate over the search space.", correct: true, explanation: "Right. Sorted-and-search-for-target is the textbook case; monotonic predicate is the answer-search generalization. Both reduce to: 'I can rule out half the search space based on one comparison at the midpoint.'" },
            { label: "The array must be sorted.", explanation: "Too narrow. Binary search also applies to answer-search problems where there's no array at all — just a monotonic yes/no predicate over an integer range (Koko Eating Bananas, capacity-to-ship, square root)." },
            { label: "The array must contain the target.", explanation: "The classic version returns -1 when the target isn't present. You don't need the target to exist." },
            { label: "Array length must be a power of 2.", explanation: "Not required. The l + (r - l) / 2 midpoint handles odd lengths fine; the algorithm is O(log n) for any size." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why is `int mid = l + (r - l) / 2` preferred over `int mid = (l + r) / 2`?"
          options={[
            { label: "It's faster.", explanation: "Both compile to similar instructions; speed isn't the reason. Correctness is." },
            { label: "It avoids integer overflow when l and r are both large. (l + r) can wrap to a negative number, then divided by 2 gives a wildly wrong midpoint.", correct: true, explanation: "Right. For very large arrays (l + r) can exceed Integer.MAX_VALUE and wrap. (r - l) is bounded by array length, so (r - l) / 2 is safe. This is the famous Bloch bug — lurked in java.util.Arrays.binarySearch for over a decade." },
            { label: "It handles negative numbers.", explanation: "Array indices are non-negative, so this isn't the issue. The issue is overflow at the high end." },
            { label: "It's required by the Java spec.", explanation: "Nothing requires it; it's a defensive idiom. The spec doesn't care which expression you use, only that the result is correct." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Off-by-one ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="off-by-one" title="I can write binary search without an off-by-one bug" xp={25}>
      <section>
        <h2 id="off-by-one">The off-by-one minefield: &lt;= vs &lt;, mid math, l = mid+1</h2>

        <p>
          Now we get into the weeds. Most binary-search bugs cluster around three decisions: <strong>strictly-less or
          less-or-equal</strong> in the loop condition, <strong>where the midpoint goes</strong>, and <strong>how you
          shrink the boundaries</strong>. Get any of these wrong and you either skip the answer or spin forever.
        </p>

        <h3>Trace 1 · Convention A on a hit</h3>

        <p>
          Array <code>[1, 3, 5, 7, 9, 11]</code>, target <code>7</code>. Use the closed-interval template from the last
          section.
        </p>

        <CodeBlock lang="plain">{`Initial: l=0, r=5  (interval [0, 5], inclusive)

Iteration 1:
  mid = 0 + (5 - 0) / 2 = 2
  a[2] = 5 < 7  →  l = mid + 1 = 3
  state: l=3, r=5

Iteration 2:
  mid = 3 + (5 - 3) / 2 = 4
  a[4] = 9 > 7  →  r = mid - 1 = 3
  state: l=3, r=3   (interval shrunk to one element)

Iteration 3:
  mid = 3 + (3 - 3) / 2 = 3
  a[3] = 7 == 7  →  return 3

Three iterations, found at index 3.`}</CodeBlock>

        <h3>Trace 2 · Convention A on a miss</h3>

        <p>
          Same array, target <code>8</code> (not present). Watch the boundary collapse past each other.
        </p>

        <CodeBlock lang="plain">{`Initial: l=0, r=5

Iteration 1:
  mid = 2, a[2] = 5 < 8  →  l = 3
  state: l=3, r=5

Iteration 2:
  mid = 4, a[4] = 9 > 8  →  r = 3
  state: l=3, r=3

Iteration 3:
  mid = 3, a[3] = 7 < 8  →  l = 4
  state: l=4, r=3        (l > r, loop exits)

Loop ends, return -1. Insertion point is l = 4 (between a[3]=7 and a[4]=9).`}</CodeBlock>

        <Callout variant="insight" title="The insertion point is l, even on a miss">
          <p>
            When the loop exits without finding the target, <code>l</code> is exactly the index where the target would go
            if we inserted it to keep the array sorted.
          </p>
          <p>
            That&apos;s why <code>java.util.Arrays.binarySearch</code> returns <code>-(l + 1)</code> on a miss — it
            encodes the insertion point in the negative return value. We&apos;ll see this pattern again in the next
            section.
          </p>
        </Callout>

        <h3>The classic infinite loop: l = mid (without +1)</h3>

        <p>
          This is the bug that defines binary search. Suppose you wrote:
        </p>

        <CodeBlock lang="java">{`// BUGGY — infinite loop on certain inputs
while (l <= r) {
    int mid = l + (r - l) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) l = mid;       // ← BUG: should be mid + 1
    else                  r = mid - 1;
}`}</CodeBlock>

        <p>
          Now consider <code>l = 3, r = 4</code>, target greater than <code>a[3]</code>. The midpoint is{" "}
          <code>mid = 3 + (4 - 3) / 2 = 3</code>. We set <code>l = mid = 3</code>. The state is unchanged. Next
          iteration computes the same midpoint, makes the same decision, sets <code>l = 3</code> again. <strong>Infinite
          loop.</strong>
        </p>

        <Callout variant="warn" title="Why l = mid + 1 (not l = mid) when using <=">
          <p>
            The midpoint is computed by integer division, which <strong>rounds down</strong>. So when the interval has
            two elements (<code>l, l+1</code>), <code>mid = l</code>. If you set <code>l = mid</code>, the interval
            doesn&apos;t shrink — same two elements, same midpoint, same decision. Infinite loop.
          </p>
          <p>
            <strong>The rule:</strong> if you might compute <code>mid = l</code>, you must use{" "}
            <code>l = mid + 1</code> on the &quot;go right&quot; branch. Symmetrically, if you might compute{" "}
            <code>mid = r</code> (which doesn&apos;t happen with floor-division), you&apos;d need <code>r = mid - 1</code>.
            With Convention A (<code>l &lt;= r</code>, <code>mid</code> is floor), the invariants are:{" "}
            <code>l = mid + 1</code> on go-right, <code>r = mid - 1</code> on go-left. Both shrink the interval by
            at least one element.
          </p>
        </Callout>

        <h3>Convention B · half-open [l, r), and why r = mid (no -1)</h3>

        <p>
          Half-open is the convention you&apos;ll use most for boundary-finding problems. The interval is{" "}
          <code>[l, r)</code> — <code>r</code> is one past the last element you care about. Length is exactly{" "}
          <code>r - l</code>. The loop runs while length is positive: <code>while (l &lt; r)</code>.
        </p>

        <CodeBlock lang="java">{`public int binarySearch(int[] a, int target) {
    int l = 0, r = a.length;          // half-open [l, r)
    while (l < r) {                    // < because r is exclusive
        int mid = l + (r - l) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) l = mid + 1;   // a[mid] ruled out — go right
        else                  r = mid;        // a[mid] is upper bound — keep it (exclusive)
    }
    return -1;
}`}</CodeBlock>

        <Callout variant="insight" title="Why r = mid in half-open, not r = mid - 1">
          <p>
            The half-open interval <code>[l, r)</code> already excludes <code>r</code>. When we decide the answer is to
            the left of <code>mid</code>, we want the new interval to <em>exclude</em> <code>mid</code>. Setting{" "}
            <code>r = mid</code> does exactly that, because <code>r</code> is exclusive.
          </p>
          <p>
            If you wrote <code>r = mid - 1</code>, you&apos;d also exclude <code>mid - 1</code> — losing a potential
            candidate. The convention determines the arithmetic; pick one and stay loyal.
          </p>
        </Callout>

        <h3>The mental checklist before you write the loop</h3>

        <ol>
          <li><strong>Pick a convention.</strong> Closed <code>[l, r]</code> or half-open <code>[l, r)</code>. Don&apos;t mix.</li>
          <li><strong>Initialize correctly.</strong> Closed: <code>r = n - 1</code>. Half-open: <code>r = n</code>.</li>
          <li><strong>Loop condition matches.</strong> Closed: <code>l &lt;= r</code>. Half-open: <code>l &lt; r</code>.</li>
          <li><strong>Use overflow-safe midpoint.</strong> <code>l + (r - l) / 2</code>, always.</li>
          <li><strong>Shrink correctly on &quot;go right.&quot;</strong> Both conventions: <code>l = mid + 1</code>.</li>
          <li><strong>Shrink correctly on &quot;go left.&quot;</strong> Closed: <code>r = mid - 1</code>. Half-open: <code>r = mid</code>.</li>
          <li><strong>Termination.</strong> Closed: loop exits with <code>l = r + 1</code>; <code>l</code> is insertion point. Half-open: loop exits with <code>l = r</code>; same.</li>
        </ol>

        <Quiz
          kind="Off-by-one check"
          question="You're using closed-interval convention (`while l <= r`). On the 'a[mid] < target' branch, what's the right update?"
          options={[
            { label: "l = mid", explanation: "Infinite loop bait. With floor-division midpoint and l <= r, when mid == l this leaves the state unchanged. Always l = mid + 1 in closed-interval form." },
            { label: "l = mid + 1", correct: true, explanation: "Right. The +1 is what guarantees progress: each iteration shrinks the interval by at least one element. Without it, you can spin forever when the interval shrinks to two." },
            { label: "l = mid - 1", explanation: "That moves l backwards, expanding (or breaking) the invariant. The 'go right' direction means the answer is strictly above mid, so l should advance." },
            { label: "It depends on whether the array is sorted ascending or descending.", explanation: "It depends on the convention you picked, not on sort direction. For ascending arrays in closed-interval form, 'a[mid] < target' always means l = mid + 1." },
          ]}
        />

        <Quiz
          kind="Off-by-one check"
          question="In the half-open convention `[l, r)` with `while (l < r)`, on the 'go left' branch (a[mid] > target), what's the update?"
          options={[
            { label: "r = mid - 1", explanation: "That excludes mid AND mid - 1. Half-open already excludes r, so just setting r = mid excludes mid. Subtracting 1 loses a candidate." },
            { label: "r = mid", correct: true, explanation: "Right. In [l, r), r is exclusive — so r = mid means the new interval is [l, mid), which is exactly 'everything before mid.' That's the correct shrink." },
            { label: "r = mid + 1", explanation: "Backwards — that would include mid in the new interval, but we just ruled mid out as too big." },
            { label: "Same as closed-interval: r = mid - 1", explanation: "Conventions diverge here. Closed: r = mid - 1. Half-open: r = mid. Pick one and stay consistent." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Bounds ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="bounds" title="I can write lower_bound and upper_bound from memory" xp={25}>
      <section>
        <h2 id="bounds">Lower bound, upper bound — the Java idiom</h2>

        <p>
          Most production binary search isn&apos;t &quot;does this exact value exist.&quot; It&apos;s &quot;where does
          this value <em>belong</em>?&quot; — the boundary question. Two flavors dominate: <strong>lower bound</strong>{" "}
          (first index with <code>a[i] ≥ target</code>) and <strong>upper bound</strong> (first index with{" "}
          <code>a[i] &gt; target</code>). Once you have these, you can solve a startling range of problems with one or
          two well-placed calls.
        </p>

        <h3>Lower bound: first index ≥ target</h3>

        <CodeBlock lang="java">{`/**
 * Returns the smallest index i in [0, n] such that a[i] >= target.
 * If every element is < target, returns n (the past-the-end index).
 */
public static int lowerBound(int[] a, int target) {
    int l = 0, r = a.length;          // half-open [l, r)
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (a[mid] < target) l = mid + 1;   // mid too small — answer is strictly right
        else                  r = mid;        // mid is a candidate — keep it (exclusive r)
    }
    return l;                          // l == r at exit; the boundary
}`}</CodeBlock>

        <h3>Upper bound: first index &gt; target</h3>

        <CodeBlock lang="java">{`/**
 * Returns the smallest index i in [0, n] such that a[i] > target.
 * If every element is <= target, returns n.
 */
public static int upperBound(int[] a, int target) {
    int l = 0, r = a.length;
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (a[mid] <= target) l = mid + 1;  // <= because we want strictly greater
        else                   r = mid;
    }
    return l;
}`}</CodeBlock>

        <Callout variant="insight" title="The only difference is one comparator">
          <p>
            Lower bound uses <code>a[mid] &lt; target</code> on the &quot;go right&quot; branch. Upper bound uses{" "}
            <code>a[mid] &lt;= target</code>. That&apos;s it.
          </p>
          <p>
            Lower bound includes equality in the &quot;keep&quot; half (so it lands on the first equal element); upper
            bound includes equality in the &quot;discard&quot; half (so it lands one past the last equal element). One
            character of code separates them, and that one character determines whether you find the leftmost or
            rightmost match.
          </p>
        </Callout>

        <h3>Use cases that fall out of these</h3>

        <ul>
          <li><strong>First occurrence of x:</strong> <code>lowerBound(a, x)</code>; if <code>a[result] == x</code>, that&apos;s it; otherwise x isn&apos;t present.</li>
          <li><strong>Last occurrence of x:</strong> <code>upperBound(a, x) - 1</code>; if that index is valid and <code>a[index] == x</code>, that&apos;s it.</li>
          <li><strong>Count of x in sorted array:</strong> <code>upperBound(a, x) - lowerBound(a, x)</code>.</li>
          <li><strong>Number of elements less than x:</strong> <code>lowerBound(a, x)</code> directly.</li>
          <li><strong>Insertion point to keep array sorted:</strong> <code>lowerBound(a, x)</code>.</li>
          <li><strong>Range query [lo, hi]:</strong> <code>upperBound(a, hi) - lowerBound(a, lo)</code>.</li>
        </ul>

        <h3>Java&apos;s Arrays.binarySearch — the gotcha</h3>

        <p>
          Java ships <code>java.util.Arrays.binarySearch</code> and <code>Collections.binarySearch</code>. They&apos;re
          fast, well-tested, and have a return-value convention you must know:
        </p>

        <CodeBlock lang="java">{`// On hit: returns an index of a matching element.
//         WHICH index, when there are duplicates, is unspecified.
// On miss: returns -(insertionPoint + 1).
//          The +1 is to disambiguate "found at index 0" (returns 0) from
//          "would insert at index 0" (returns -1, since -(0 + 1) = -1).

int idx = Arrays.binarySearch(a, target);
if (idx >= 0) {
    // found at idx — but if duplicates exist, you don't know WHICH duplicate
} else {
    int insertionPoint = -(idx + 1);   // -idx - 1 also works
    // a would be inserted at this index to stay sorted
}`}</CodeBlock>

        <Callout variant="warn" title="Don't use Arrays.binarySearch for first/last occurrence">
          <p>
            <code>Arrays.binarySearch</code> guarantees only that it returns <em>some</em> matching index when the
            target exists with duplicates. It does not promise leftmost, rightmost, or any specific position. If you
            need first or last occurrence, write <code>lowerBound</code> / <code>upperBound</code> yourself; the JDK
            doesn&apos;t expose them directly.
          </p>
          <p>
            The <code>-(insertionPoint + 1)</code> encoding is also notorious for off-by-one bugs in calling code.
            People write <code>-idx</code> instead of <code>-(idx + 1)</code> and silently get the wrong insertion
            point at index 0. The decode is <code>-idx - 1</code>; memorize it.
          </p>
        </Callout>

        <h3>Worked example: count occurrences in a sorted array</h3>

        <CodeBlock lang="java">{`int[] a = {1, 2, 2, 2, 3, 4, 4, 5};
//         0  1  2  3  4  5  6  7

int countTwos  = upperBound(a, 2) - lowerBound(a, 2);
//             = 4 - 1 = 3   ✓

int countFours = upperBound(a, 4) - lowerBound(a, 4);
//             = 7 - 5 = 2   ✓

int countNines = upperBound(a, 9) - lowerBound(a, 9);
//             = 8 - 8 = 0   ✓ (not present)

int countZero  = upperBound(a, 0) - lowerBound(a, 0);
//             = 0 - 0 = 0   ✓ (smaller than everything)`}</CodeBlock>

        <p>
          Two bounded calls, no special-casing for &quot;not present.&quot; This compositionality is why I argue you
          should learn lower-bound / upper-bound first and treat &quot;classic binary search for an exact target&quot;
          as a special case (<code>lowerBound</code> followed by an equality check).
        </p>

        <Callout variant="info" title="In C++ this is the standard library">
          <p>
            C++&apos;s <code>std::lower_bound</code> and <code>std::upper_bound</code> are first-class STL algorithms
            — competitive programmers use them constantly. Java&apos;s standard library is missing the equivalents,
            which is part of why Java binary-search code is messier in the wild. Internalize these two helpers and
            keep them in your head as a cheat code.
          </p>
          <p>
            For <code>TreeMap&lt;K, V&gt;</code> / <code>TreeSet&lt;K&gt;</code>, the <code>floorKey</code>,{" "}
            <code>ceilingKey</code>, <code>lowerKey</code>, <code>higherKey</code> methods give you bound-style access
            in O(log n) without writing the search yourself. Use them when the data already lives in a tree.
          </p>
        </Callout>

        <Quiz
          kind="Bounds check"
          question="Given sorted array [1, 3, 3, 3, 5, 7], what does lowerBound(a, 3) return?"
          options={[
            { label: "0", explanation: "0 is the index of value 1, which is < 3. Lower bound is the first index where a[i] >= 3." },
            { label: "1", correct: true, explanation: "Right. Index 1 is the first position where a[i] >= 3 (it's the first 3 itself). Lower bound = first index NOT less than target." },
            { label: "3", explanation: "3 is the index of the LAST 3, not the first. That's where upperBound(a, 3) - 1 would land." },
            { label: "4", explanation: "4 is upperBound(a, 3) — the first index with a[i] > 3, not >= 3. The two differ by one comparator." },
          ]}
        />

        <Quiz
          kind="Bounds check"
          question="You call `int idx = Arrays.binarySearch(a, target)` and get -3. What does that mean?"
          options={[
            { label: "Found at index 3.", explanation: "Negative means NOT found. Found indices are non-negative." },
            { label: "Not found; would insert at index 3 (decoded as -idx = 3).", explanation: "Wrong decoding. The encoding is -(insertionPoint + 1), so the decode is -idx - 1, not -idx. With idx = -3, the right answer is -(-3) - 1 = 2, not 3." },
            { label: "Not found; would insert at index 2 (= -idx - 1 = 3 - 1 = 2).", correct: true, explanation: "Right. The encoding is return value = -(insertionPoint + 1). Decode: insertionPoint = -returnValue - 1 = -(-3) - 1 = 2. So target would slot in at index 2 to keep the array sorted." },
            { label: "An error code.", explanation: "It's a return-value encoding, not an error. Negative means 'not found, here's where it would go,' shifted by one to disambiguate insertionPoint=0." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Answer search ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="answer-search" title="I can binary-search the answer when I see a monotonic predicate" xp={30}>
      <section>
        <h2 id="answer-search">Binary-searching the answer</h2>

        <p>
          This is the pattern that promotes binary search from &quot;sorted-array helper&quot; to &quot;Swiss army
          knife.&quot; The setup: instead of searching an array for a value, you&apos;re searching an{" "}
          <strong>integer range</strong> for the smallest (or largest) value that satisfies a predicate. The trick:
          if the predicate is monotonic, binary search applies — and the search reduces to <em>O(log(range))</em>{" "}
          calls of the predicate, regardless of how complicated the predicate is.
        </p>

        <h3>The setup pattern</h3>

        <ol>
          <li>Identify the answer space: an integer interval <code>[lo, hi]</code>.</li>
          <li>Define a predicate <code>P(x)</code>: &quot;is <code>x</code> a feasible answer?&quot;</li>
          <li>Verify <code>P</code> is monotonic: if <code>P(x)</code> is true, so is <code>P(y)</code> for all <code>y &gt; x</code> (or vice versa).</li>
          <li>Binary search for the smallest <code>x</code> with <code>P(x) = true</code> (i.e., the boundary).</li>
        </ol>

        <Mermaid chart={monotonic} />

        <p>
          The picture: the predicate flips from F to T exactly once across the answer space. Lower-bound on the
          predicate gives you that flip point — the smallest feasible answer.
        </p>

        <h3>The killer example: Koko Eating Bananas (LC 875)</h3>

        <p>
          Koko has piles of bananas. She eats at speed K bananas/hour. Each hour she picks one pile and eats up to K
          bananas from it (if the pile has fewer, she finishes it and stops for that hour). Given that the guards
          come back in <code>H</code> hours, find the minimum eating speed <code>K</code> that lets her finish all
          piles in time.
        </p>

        <Mermaid chart={kokoSearch} />

        <p>
          The naive solution: try K = 1, 2, 3, ... until one works. With piles up to 10⁹ that&apos;s way too slow.
          The binary-search insight:
        </p>

        <ul>
          <li><strong>Answer space:</strong> <code>K ∈ [1, max(piles)]</code>. K = 1 is the slowest possible; K = max(piles) means each pile takes exactly one hour, so total time = piles.length, which is always ≤ H (problem guarantees).</li>
          <li><strong>Predicate:</strong> <code>canFinish(K)</code> = &quot;at speed K, total hours needed ≤ H&quot;.</li>
          <li><strong>Monotonicity:</strong> if she can finish at speed K, she can certainly finish at any faster speed. So <code>canFinish</code> is false-then-true as K increases — exactly the lower-bound shape.</li>
          <li><strong>Goal:</strong> smallest K with <code>canFinish(K) = true</code>.</li>
        </ul>

        <CodeBlock lang="java">{`public int minEatingSpeed(int[] piles, int H) {
    int lo = 1, hi = 0;
    for (int p : piles) hi = Math.max(hi, p);

    // Lower bound on the predicate "canFinish(K)" over [lo, hi].
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (canFinish(piles, mid, H)) hi = mid;     // mid works — try slower
        else                            lo = mid + 1; // mid too slow — must go faster
    }
    return lo;   // smallest K that finishes in time
}

private boolean canFinish(int[] piles, int K, int H) {
    long hours = 0;
    for (int p : piles) {
        // Hours needed for this pile = ceil(p / K) = (p + K - 1) / K
        hours += (p + K - 1) / K;
        if (hours > H) return false;     // early exit
    }
    return hours <= H;
}`}</CodeBlock>

        <Callout variant="insight" title="The ceiling-division trick">
          <p>
            <code>(p + K - 1) / K</code> computes <code>⌈p / K⌉</code> using integer floor division. Why: if{" "}
            <code>p</code> is a multiple of <code>K</code>, the <code>+ K - 1</code> doesn&apos;t push it past the next
            multiple. If <code>p</code> isn&apos;t a multiple, the <code>+ K - 1</code> pushes it up just enough to
            round up.
          </p>
          <p>
            This is the standard idiom for &quot;hours to consume a pile of size p at K bananas/hour&quot; — and it
            shows up everywhere in answer-search problems.
          </p>
        </Callout>

        <Callout variant="warn" title="Watch the long arithmetic">
          <p>
            With piles of size up to 10⁹ and up to 10⁴ piles, total hours can exceed <code>Integer.MAX_VALUE</code>.
            Use <code>long hours</code> (as above) or short-circuit early when the count exceeds <code>H</code>.
          </p>
          <p>
            A plain <code>int</code> accumulator silently overflows on the worst-case inputs and gives wrong answers.
            Same lesson as the midpoint overflow — different incarnation.
          </p>
        </Callout>

        <h3>Why this is the &quot;answer-search&quot; pattern</h3>

        <p>
          Look at what the predicate hides: a full simulation. <code>canFinish</code> walks every pile, does division,
          and checks a sum — it&apos;s O(piles.length). That&apos;s the work for <em>one</em> midpoint check. We do
          that O(log(max(piles))) ≈ 30 times. Total work: O(n log m) where n = piles.length, m = max pile size. The
          predicate can be arbitrarily complex — it just has to be monotonic — and the binary-search wrapper
          slashes the search to logarithmic.
        </p>

        <h3>The recipe, in 5 questions</h3>

        <p>When you suspect a problem might be answer-search, ask:</p>

        <ol>
          <li><strong>Is the answer an integer (or a real you can round)?</strong> If yes, the search space is an interval.</li>
          <li><strong>What are the bounds?</strong> Often <code>[1, something_max]</code> or <code>[0, sum_total]</code>.</li>
          <li><strong>Can I write a predicate that takes a candidate answer and says yes/no?</strong> If yes, you have the kernel.</li>
          <li><strong>Is the predicate monotonic in the candidate?</strong> If yes (FFFFTTT or TTTFFFF), binary search applies.</li>
          <li><strong>Smallest yes or largest no?</strong> Lower-bound for the smallest yes; for largest no, run lower-bound and subtract one.</li>
        </ol>

        <h3>Other problems that fit</h3>

        <ul>
          <li><strong>LC 1011 · Capacity to Ship Packages.</strong> Smallest ship capacity such that all packages ship in D days. Predicate: canShip(cap). Range: [max(weights), sum(weights)].</li>
          <li><strong>LC 1482 · Minimum Days to Make M Bouquets.</strong> Smallest day d such that we have m bouquets of k adjacent flowers. Predicate: enoughBouquets(d).</li>
          <li><strong>LC 410 · Split Array Largest Sum.</strong> Smallest max-subarray-sum when splitting into k contiguous chunks. Predicate: canSplit(maxSum, k).</li>
          <li><strong>LC 69 · Sqrt(x).</strong> Largest int r such that r*r ≤ x. Range: [0, x]. Predicate: r*r ≤ x.</li>
          <li><strong>LC 1283 · Find the Smallest Divisor Given a Threshold.</strong> Smallest divisor such that sum of ⌈nums[i] / div⌉ ≤ threshold.</li>
        </ul>

        <Callout variant="insight" title="Recognition: 'minimize the maximum,' 'maximize the minimum,' 'fewest X such that Y'">
          <p>
            These three phrasings are dead giveaways for answer-search. You almost never solve them directly — instead
            you guess the answer with binary search and verify with a predicate.
          </p>
          <p>
            After you&apos;ve seen the pattern five or six times, the recognition becomes automatic; until then, train
            yourself to ask &quot;could the answer itself be the search variable?&quot; on every optimization problem
            you encounter.
          </p>
        </Callout>

        <Quiz
          kind="Pattern check"
          question="A problem asks: 'find the smallest pizza diameter D such that at least M people get a slice of size >= S given N pizzas.' Why does answer-search apply?"
          options={[
            { label: "It doesn't — there's no sorted array.", explanation: "The 'array' isn't the input; it's the candidate answer space. Answer-search doesn't need a sorted input array — just a monotonic predicate over the integer/real-valued answer." },
            { label: "Because the predicate 'feasible at diameter D' is monotonic: if diameter D works, all larger diameters also work. So binary-search D over [0, max_possible].", correct: true, explanation: "Right. Larger pizzas can always be cut into more or larger slices, so feasibility is non-decreasing in D. That monotonicity is exactly what licenses binary search over the answer." },
            { label: "Because pizza diameters are sorted.", explanation: "Pizza inputs aren't sorted; you don't search them. You search the answer space [0, max_diameter], which is sorted by definition (it's a range of numbers)." },
            { label: "Because M and N are integers.", explanation: "Integer bounds help, but the real reason is monotonicity of the feasibility predicate. Without that, no binary search." },
          ]}
        />

        <Quiz
          kind="Pattern check"
          question="In Koko Eating Bananas, the search range is [1, max(piles)]. Why not [1, sum(piles)]?"
          options={[
            { label: "sum(piles) would also work.", explanation: "It would work but it's wasteful. max(piles) is a tighter upper bound — eating speeds higher than max(piles) finish each pile in one hour, so they don't help, just waste log iterations." },
            { label: "K = max(piles) means each pile fits in one hour, so total hours ≤ piles.length ≤ H. Anything faster is wasted speed; max(piles) is the tightest upper bound.", correct: true, explanation: "Right. Tightening the bounds saves a few iterations — log scales gently but every halving counts. More importantly, it shows you understand why the problem caps at this value: eating faster than max(piles) doesn't reduce hour count, because hours are computed per-pile with a ceiling." },
            { label: "sum(piles) would overflow Integer.MAX_VALUE.", explanation: "It can, with 10^4 piles of 10^9. But the real reason for max(piles) is tightness — sum(piles) is feasible by any speed >= max anyway." },
            { label: "K = sum(piles) is invalid because it's larger than any pile.", explanation: "It's perfectly valid — just unnecessary. You'd correctly conclude she finishes in piles.length hours and the search would still terminate, just a bit slower." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="project" title="I solved Koko + Search in Rotated Sorted Array end-to-end" xp={45} manual manualLabel="I solved both problems and they passed">
      <section>
        <h2 id="project">Project: Koko Eating Bananas + rotated array</h2>

        <p>
          Two problems, one for each pattern: <strong>Koko</strong> (answer-search) and <strong>Search in Rotated
          Sorted Array</strong> (a twist on classic binary search where the precondition is broken in a controlled
          way). Solve both, write the code, submit on LeetCode, verify the green check.
        </p>

        <h3>LC 875 · Koko Eating Bananas — full solution</h3>

        <p>
          We sketched this in the previous section; here&apos;s the polished version with input handling, edge cases,
          and the predicate written defensively.
        </p>

        <CodeBlock lang="java">{`public class Solution {
    public int minEatingSpeed(int[] piles, int H) {
        int lo = 1, hi = 1;
        for (int p : piles) hi = Math.max(hi, p);

        // Lower-bound binary search over the answer space [1, max(piles)].
        // We want the smallest K such that canFinish(K) is true.
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (canFinish(piles, mid, H)) {
                hi = mid;             // mid works; the answer is mid or smaller
            } else {
                lo = mid + 1;         // mid too slow; answer is strictly larger
            }
        }
        return lo;                     // lo == hi at exit; the boundary
    }

    private boolean canFinish(int[] piles, int K, int H) {
        long hours = 0;
        for (int p : piles) {
            hours += (p + K - 1L) / K;     // ceiling division; the L promotes to long
            if (hours > H) return false;    // early exit — she's already over budget
        }
        return true;
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why the L on K - 1L">
          <p>
            <code>p + K - 1L</code> forces the addition into <code>long</code>, which prevents <code>p + K - 1</code>
            from overflowing when both <code>p</code> and <code>K</code> are near 10⁹. Without the <code>L</code>,
            you can wrap to a negative and get a wildly wrong hour count.
          </p>
          <p>
            This is the second time we&apos;ve hit overflow in this module. There&apos;s a pattern: when arithmetic
            inside binary search involves array values (not just indices), think about long. When in doubt, promote.
            The cost is negligible; the bug is silent.
          </p>
        </Callout>

        <h3>LC 33 · Search in Rotated Sorted Array — the harder one</h3>

        <p>
          You&apos;re given a sorted array that&apos;s been rotated at some unknown pivot — e.g.,{" "}
          <code>[4, 5, 6, 7, 0, 1, 2]</code>. Find a target in O(log n).
        </p>

        <p>
          The array is no longer globally sorted, but it has a hidden invariant: <strong>at least one of the two
          halves around any midpoint is still sorted.</strong> That&apos;s what makes binary search applicable. The
          algorithm: find the midpoint, decide which side is sorted, then check whether the target lies in that
          sorted side. If it does, recurse into it; if not, recurse into the other side.
        </p>

        <CodeBlock lang="java">{`public class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;       // closed-interval convention here
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;

            // Decide which half is sorted by comparing endpoints to mid.
            if (nums[lo] <= nums[mid]) {
                // Left half [lo, mid] is sorted.
                if (nums[lo] <= target && target < nums[mid]) {
                    hi = mid - 1;               // target is in the sorted left
                } else {
                    lo = mid + 1;               // target is in the (rotated) right
                }
            } else {
                // Right half [mid, hi] is sorted.
                if (nums[mid] < target && target <= nums[hi]) {
                    lo = mid + 1;               // target is in the sorted right
                } else {
                    hi = mid - 1;               // target is in the (rotated) left
                }
            }
        }
        return -1;
    }
}`}</CodeBlock>

        <Callout variant="warn" title="The boundary comparators are precise — get them wrong and you'll search in circles">
          <p>
            <code>nums[lo] &lt;= nums[mid]</code> with the <strong>≤</strong> matters: when <code>lo == mid</code>{" "}
            (interval of size 1), we want to call the left half &quot;sorted&quot; (it trivially is). Using strict{" "}
            <code>&lt;</code> would falsely send the search into the wrong branch on degenerate inputs.
          </p>
          <p>
            The target-in-range checks (<code>nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid]</code> on the
            left, <code>nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi]</code> on the right) are also precise:
            the asymmetry between the two ends matches where the equality already got handled by the{" "}
            <code>nums[mid] == target</code> check at the top.
          </p>
        </Callout>

        <h3>The two-step alternative: find pivot, then search</h3>

        <p>
          Some folks find the &quot;decide which half is sorted&quot; logic too subtle and prefer a two-step
          approach: <strong>(1)</strong> binary-search for the pivot index (the smallest element), then{" "}
          <strong>(2)</strong> binary-search for the target in whichever sub-array contains it. Two clean log-n
          searches; same total complexity; arguably easier to debug.
        </p>

        <CodeBlock lang="java">{`public int searchTwoStep(int[] nums, int target) {
    int n = nums.length;
    int pivot = findPivot(nums);          // index of the smallest element

    // The array is sorted in [pivot, n) and [0, pivot). Decide which contains target.
    if (pivot == 0 || (target >= nums[pivot] && target <= nums[n - 1])) {
        return binarySearchRange(nums, target, pivot, n - 1);
    } else {
        return binarySearchRange(nums, target, 0, pivot - 1);
    }
}

private int findPivot(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    // The smallest element is the only one whose left neighbor is larger.
    // Equivalent: smallest i such that nums[i] <= nums[hi].
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > nums[hi]) lo = mid + 1;   // pivot is to the right
        else                       hi = mid;        // pivot is mid or to the left
    }
    return lo;
}

private int binarySearchRange(int[] nums, int target, int lo, int hi) {
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else                     hi = mid - 1;
    }
    return -1;
}`}</CodeBlock>

        <Callout variant="insight" title="Find-pivot is itself an answer-search">
          <p>
            <code>findPivot</code> is doing a lower-bound on the predicate &quot;is this element ≤ the last
            element?&quot; In a non-rotated sorted array, that&apos;s true for everything (pivot = 0). In a rotated
            array, it&apos;s false for the rotated-up-front part and true for the wrapped-around part — the boundary
            is the pivot. Same shape as Koko: F-F-F-T-T-T over an integer index, lower bound finds the flip.
          </p>
          <p>
            Once you see this, you start spotting hidden binary-search problems everywhere: any time there&apos;s a
            sequence with a single transition point, you&apos;re one predicate away from O(log n).
          </p>
        </Callout>

        <h3>Bonus: Find Peak Element (LC 162)</h3>

        <p>
          Given an array where adjacent elements are unequal, return any index i such that <code>a[i] &gt; a[i-1]</code>
          and <code>a[i] &gt; a[i+1]</code> (treat <code>a[-1]</code> and <code>a[n]</code> as <code>-∞</code>).
          Required: O(log n).
        </p>

        <p>
          Counterintuitive at first — the array isn&apos;t sorted, so how can binary search apply? Because the
          predicate &quot;<code>a[mid] &lt; a[mid+1]</code>&quot; <em>is</em> monotonic in a useful sense: if it&apos;s
          true, a peak must lie strictly to the right of <code>mid</code> (you&apos;re climbing). If it&apos;s false,
          a peak must lie at <code>mid</code> or to its left (you&apos;re descending or at the top). One comparison,
          half the search space gone.
        </p>

        <CodeBlock lang="java">{`public int findPeakElement(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) {
            lo = mid + 1;     // ascending — peak is strictly right
        } else {
            hi = mid;          // descending or plateau-edge — peak is here or left
        }
    }
    return lo;                  // lo == hi; that's a peak
}`}</CodeBlock>

        <PartRecap
          title="Three problems, three flavors of the same trick"
          gist="Once you internalize 'monotonic predicate over a search space,' binary search stops being about sorted arrays. It's about turning O(n) decision problems into O(log n) ones — and the search space can be array indices, integer ranges, or even floats."
          points={[
            { takeaway: "Koko: classic answer-search.", detail: "Search the integer answer space [1, max]. Predicate canFinish(K) is monotonic. Lower-bound finds the smallest feasible K. Watch for long-arithmetic overflow inside the predicate." },
            { takeaway: "Search in Rotated Sorted Array: precondition is broken, but recoverable.", detail: "At any midpoint, one half is still sorted. Decide which, then check whether the target falls in that sorted range. The boundary comparators (<= vs <) are subtle — write them once, lock them in." },
            { takeaway: "Find-pivot is just lower-bound on a clever predicate.", detail: "'Smallest index whose value is <= the last element.' False before the pivot, true after. Same FFFTTT shape as every other answer-search; the answer is the flip point." },
            { takeaway: "Find Peak: binary search WITHOUT a sorted array.", detail: "The predicate 'a[mid] < a[mid+1]' partitions the search space cleanly even though the array isn't sorted. The lesson: binary search needs A monotonic predicate, not necessarily a globally-sorted input." },
            { takeaway: "Always promote to long when the predicate does arithmetic on input values.", detail: "Sums, products, and ceiling-divisions can overflow int even when the inputs fit. The cost of a long accumulator is nothing; the cost of silent overflow is a wrong-answer submission." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="binary-search" id="final" title="Binary search is reflexive" xp={25} celebration="Binary search and the answer-search pattern are now muscle memory. Up next: sorting — how the array gets sorted in the first place.">
      <section>
        <h2 id="final">Final quiz</h2>

        <ClassifyChallenge
          title="Plain binary search, answer-search, or neither?"
          prompt="For each problem, decide which flavor (if any) of binary search applies. 'Plain' = search a sorted array for a value or a boundary. 'Answer-search' = the answer itself is the search variable, with a monotonic predicate. 'Neither' = binary search doesn't apply (no monotonicity, or the wrong shape)."
          buckets={[
            { id: "plain", label: "Plain binary search", color: "indigo" },
            { id: "answer", label: "Binary search the answer", color: "violet" },
            { id: "neither", label: "Neither", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Find target in a sorted array.", answer: "plain", explanation: "Textbook case. Sorted input, look for a value — classic binary search." },
            { id: "2", label: "Find the minimum number of days to make M bouquets, given a bloomDay[] array.", answer: "answer", explanation: "Answer-search. Search range [min(bloomDay), max(bloomDay)]. Predicate: at day d, can we form M bouquets of k adjacent bloomed flowers? Monotonic: if day d works, so does any d' > d." },
            { id: "3", label: "Two-sum on an unsorted array (return any pair summing to target).", answer: "neither", explanation: "Unsorted input rules out plain. There's no monotonic answer-space predicate either — you can't ask 'is K feasible?' for an integer K. Use a HashMap (O(n)) or sort first then two-pointer (O(n log n))." },
            { id: "4", label: "First and last position of element x in a sorted array.", answer: "plain", explanation: "lowerBound and upperBound — two plain binary searches. Pure boundary-finding on a sorted input." },
            { id: "5", label: "Smallest divisor d such that sum of ceil(nums[i]/d) <= threshold.", answer: "answer", explanation: "Answer-search. Range [1, max(nums)]. Predicate: feasible(d). Larger d means smaller ceilings, smaller sum, more likely to satisfy threshold — monotonic in d." },
            { id: "6", label: "Find the longest substring without repeating characters.", answer: "neither", explanation: "Sliding window territory, not binary search. The 'longest valid substring' answer can be found by binary searching the length, but the predicate (does some substring of length L exist?) requires O(n) check per L, giving O(n log n) — strictly worse than the O(n) sliding-window solution. Don't binary-search when you don't need to." },
            { id: "7", label: "Detect whether an undirected graph has a cycle.", answer: "neither", explanation: "Pure DFS/Union-Find territory. No sorted structure, no monotonic answer space, no use for binary search." },
            { id: "8", label: "Capacity to ship packages within D days (weights given, ship daily in order).", answer: "answer", explanation: "Classic answer-search. Range [max(weights), sum(weights)]. Predicate: canShip(capacity). Monotonic: bigger ship can always do what a smaller ship can." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Why doesn't binary search apply to 'find an element in an unsorted array'?"
          options={[
            { label: "It does — binary search is universal.", explanation: "Universal it is not. Without monotonicity, the comparison at the midpoint tells you nothing about which half contains the target." },
            { label: "Because without sorted-or-monotonic structure, the comparison at the midpoint can't rule out either half. Linear scan O(n) is the best you can do.", correct: true, explanation: "Right. Binary search's whole power comes from 'one comparison eliminates half.' With no monotonicity, a comparison at the midpoint tells you whether THAT element matches but says nothing about the rest. You'd still have to check every other index — that's just linear scan, dressed up." },
            { label: "Because hash lookup is O(1).", explanation: "True but tangential. The question is why binary search itself fails here, not whether something else is faster. The reason is monotonicity, not hashing." },
            { label: "Java's Arrays.binarySearch returns wrong values on unsorted input.", explanation: "It does (the JavaDoc warns you), but the deeper reason is mathematical: without monotonicity, no algorithm halving the space at every step can be correct." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In a half-open binary search loop `while (l < r)` with `r = mid` on the go-left branch, which is the correct way to write the go-right branch?"
          options={[
            { label: "l = mid", explanation: "Infinite loop on size-2 intervals. mid = l (floor), so l = mid is a no-op. Always l = mid + 1 on go-right, regardless of convention." },
            { label: "l = mid + 1", correct: true, explanation: "Right. Even in half-open form, the +1 is essential because the floor-division midpoint can equal l. The asymmetry between the two updates (mid+1 going right, just mid going left) is exactly what the [l, r) convention buys you." },
            { label: "l = mid - 1", explanation: "Backwards — that retreats. Go-right means the answer is strictly above mid, so l should advance past mid." },
            { label: "It depends on the input array.", explanation: "It depends on the convention, not the input. With [l, r) and r = mid on go-left, the correct go-right is always l = mid + 1." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You suspect a problem is answer-search. What's the SINGLE most important property to verify before you write a binary-search loop?"
          options={[
            { label: "The input array is sorted.", explanation: "There may not BE an input array (e.g., 'square root of x'). The answer space is what you search, and it's an integer range by construction. Sortedness of the input isn't the criterion for answer-search." },
            { label: "The predicate over the answer space is monotonic — it changes at most once from false to true (or true to false) as the answer increases.", correct: true, explanation: "Right. Monotonicity is THE precondition. Without it, binary search will silently skip over the answer or land somewhere wrong. With it, even an O(n) predicate becomes O(n log m) total — the entire trick." },
            { label: "The answer is positive.", explanation: "The sign doesn't matter; you can binary-search over any integer range, including negatives." },
            { label: "The predicate is fast.", explanation: "Speed affects total runtime but not correctness. A slow but monotonic predicate gives a correct (slow) binary search; a fast non-monotonic predicate gives a wrong fast answer. Monotonicity is the load-bearing property." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't 2 hours ago"
          gist="Binary search is two ideas in a trench coat: (1) shrink an interval that contains the answer; (2) the comparison at the midpoint tells you which half to throw away. Sorted arrays are one application; answer-search is the other. Both reduce O(n) or worse into O(log n) decisions."
          points={[
            { takeaway: "Pick a convention and stick with it.", detail: "Closed [l, r] with l <= r and r = mid - 1, or half-open [l, r) with l < r and r = mid. Mixing them is the #1 source of off-by-one bugs. I recommend half-open for boundary problems, closed for 'find target.'" },
            { takeaway: "Always l = mid + 1 on the go-right branch.", detail: "Floor-division midpoint can equal l, so without the +1 the interval doesn't shrink. The classic infinite loop. The fix is muscle memory, not cleverness." },
            { takeaway: "Use l + (r - l) / 2 for the midpoint.", detail: "(l + r) / 2 silently overflows on huge arrays. The defensive form is free; the bug is brutal. Joshua Bloch and the JDK both got bitten. Don't be them." },
            { takeaway: "Lower bound and upper bound are your real binary searches.", detail: "Most problems are 'where does this value belong' or 'first index satisfying P,' not 'is X in the array.' Internalize lowerBound and upperBound; you'll write 80% of binary searches as one or the other." },
            { takeaway: "Answer-search: when the answer itself is the search variable.", detail: "Range = [lo, hi] integer interval. Predicate = feasibility check, must be monotonic. Lower-bound finds the smallest feasible answer. Recognize from phrases like 'minimize the maximum,' 'smallest such that,' 'fewest days/ships/operations.'" },
            { takeaway: "Promote to long inside predicates.", detail: "Sums and products of array values overflow int even when individual values fit. long accumulators cost nothing and prevent silent wrong answers. Same lesson as overflow-safe midpoint — different incarnation." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-semibold">Up next · Module 21</p>
          <Link
            href="/courses/dsa/modules/sorting"
            className="mt-2 inline-flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 no-underline hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Sorting algorithms →
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Binary search needs a sorted array. Time to find out how the array gets sorted in the first place.</p>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="binary-search" />
    </article>
  );
}
