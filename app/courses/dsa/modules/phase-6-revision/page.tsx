import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 20 minutes before an interview. Phase 6 is the biggest
// phase (8 source modules) so this card is correspondingly dense.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase6RevisionModule() {
  const mod = getModuleBySlug("phase-6-revision")!;

  // Decision tree — "I see a problem, what pattern is it?" — the literal
  // mental shortcut you run at the start of any interview problem from this
  // family. Each terminal node is one of the eight Phase 6 techniques.
  const patternPicker = `
flowchart TD
    Q["You see a problem"] --> SORTED{"Input sorted<br/>or sortable?"}
    SORTED -- yes --> TP["Two pointers<br/>or binary search"]
    SORTED -- no --> CONT{"Contiguous<br/>subarray /<br/>substring?"}
    CONT -- yes --> SW["Sliding window"]
    CONT -- no --> SUBSET{"Enumerate<br/>subsets /<br/>perms /<br/>combos?"}
    SUBSET -- yes --> BT["Backtracking"]
    SUBSET -- no --> LOCAL{"Local choice<br/>seems optimal?"}
    LOCAL -- yes --> GR["Greedy<br/>(prove with exchange)"]
    LOCAL -- no --> SELF{"Self-similar<br/>subproblem?"}
    SELF -- yes --> REC["Recursion / D&C"]
    SELF -- no --> BITS{"Small int set,<br/>XOR / mask vibe?"}
    BITS -- yes --> BM["Bit manipulation"]
    BITS -- no --> SO["Sort first,<br/>then re-ask"]
    style TP fill:#10b981,color:#fff
    style SW fill:#10b981,color:#fff
    style BT fill:#f97316,color:#fff
    style GR fill:#f97316,color:#fff
    style REC fill:#6366f1,color:#fff
    style BM fill:#a855f7,color:#fff
    style SO fill:#64748b,color:#fff
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 6 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Eight algorithmic techniques — two pointers, sliding window, binary search, sorting, recursion, backtracking, greedy, bits — each with its tell, template, and classic example on a single dense card.
        </p>
        <ModuleProgress moduleSlug="phase-6-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations + backlinks to all eight source modules */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It is a <strong>map of Phase 6</strong> — every pattern, every template, every gotcha from the eight previous modules, compressed into tables and reference cards. Phase 6 is the largest phase in the course (eight techniques, ~17 hours of source content) which is why this revision is the longest of the seven. Treat it as the page you re-read on the train before a phone screen, not as a tutorial.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The eight modules you&apos;re consolidating:{" "}
          <Link href="/courses/dsa/modules/two-pointers" className="text-indigo-600 hover:underline">Two pointers</Link>,{" "}
          <Link href="/courses/dsa/modules/sliding-window" className="text-indigo-600 hover:underline">Sliding window</Link>,{" "}
          <Link href="/courses/dsa/modules/binary-search" className="text-indigo-600 hover:underline">Binary search</Link>,{" "}
          <Link href="/courses/dsa/modules/sorting" className="text-indigo-600 hover:underline">Sorting</Link>,{" "}
          <Link href="/courses/dsa/modules/recursion" className="text-indigo-600 hover:underline">Recursion &amp; D&amp;C</Link>,{" "}
          <Link href="/courses/dsa/modules/backtracking" className="text-indigo-600 hover:underline">Backtracking</Link>,{" "}
          <Link href="/courses/dsa/modules/greedy" className="text-indigo-600 hover:underline">Greedy</Link>, and{" "}
          <Link href="/courses/dsa/modules/bit-manipulation" className="text-indigo-600 hover:underline">Bit manipulation</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Decision tree for picking a pattern */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. The pattern-picker decision tree</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The mental shortcut you run in the first 60 seconds of any Phase 6-style problem. Each leaf is one of the eight techniques.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={patternPicker} />
        </div>

        <Callout variant="insight" title="Reading the tree">
          The tree is greedy left-to-right: take the <em>first</em> match. &quot;Sorted&quot; beats everything because two-pointer / binary-search collapse the problem instantly. &quot;Contiguous&quot; is the next strongest signal because it lets you drop from O(n²) to O(n) with a window. If nothing else fits, sorting the input is almost always a productive first move — it changes which sub-tree applies.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — The 8-pattern recognition table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. The 8-pattern recognition table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          When you see the &quot;tell&quot; on the left, you reach for the technique on the right. Memorize this table; it&apos;s 80% of the value of the whole phase.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Technique</th>
                <th className="px-4 py-3 font-semibold">The tell (when you see this in the problem)</th>
                <th className="px-4 py-3 font-semibold">Template shape</th>
                <th className="px-4 py-3 font-semibold">Typical time</th>
                <th className="px-4 py-3 font-semibold">Classic LeetCode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-600">Two pointers</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Sorted array&quot;, &quot;find a pair&quot;, &quot;palindrome&quot;, &quot;remove duplicates in place&quot;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">while (l &lt; r) { /* move l++ or r-- */ }</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 167 Two Sum II, LC 11 Container With Most Water</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-600">Sliding window</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Contiguous subarray/substring&quot;, &quot;longest/shortest with property X&quot;, &quot;at most k of Y&quot;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">expand r; while invariant broken: contract l</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 3 Longest Substring w/o Repeats, LC 76 Min Window Substring</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-600">Binary search</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sorted input, OR a <em>monotone</em> predicate over an answer range (&quot;smallest x such that feasible(x)&quot;)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">while (l &lt; r) mid = l + (r-l)/2</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n) or O(n log m)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 704 Binary Search, LC 875 Koko Eating Bananas</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-600">Sorting</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Merge intervals&quot;, &quot;k-th something&quot;, &quot;group by&quot; — sorting unlocks two-pointer / greedy on top</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">Arrays.sort(a); /* then walk */</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 56 Merge Intervals, LC 215 Kth Largest</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-indigo-600">Recursion / D&amp;C</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Problem is self-similar: solve smaller version + combine</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">if (base) return; combine(f(left), f(right))</td>
                <td className="px-4 py-3 font-mono text-amber-600">depends on recurrence</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 50 Pow(x,n), LC 23 Merge K Sorted Lists</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-orange-600">Backtracking</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;All subsets&quot;, &quot;all permutations&quot;, &quot;all paths&quot;, &quot;N-queens&quot; — enumerate combinatorial space</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">choose → recurse → unchoose</td>
                <td className="px-4 py-3 font-mono text-rose-600">O(2ⁿ) or O(n!)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 78 Subsets, LC 46 Permutations, LC 51 N-Queens</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-orange-600">Greedy</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Local choice looks optimal AND you can prove it (exchange argument). Intervals, scheduling, frontiers.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">sort; for x: take if /* locally best */</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(n log n) usually</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 55 Jump Game, LC 435 Non-overlapping Intervals</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-purple-600">Bit manipulation</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Find the one&quot; (XOR), &quot;count bits&quot;, &quot;subset enumeration&quot;, &quot;state ≤ 20 elements&quot; (bitmask)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">mask &amp; (1 &lt;&lt; i), mask ^= x, mask &amp;= mask-1</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(n) or O(2ⁿ · n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">LC 136 Single Number, LC 191 Number of 1 Bits</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Two pointers detail */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. Two pointers — opposite-end vs same-direction</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Two flavors. They look similar in code but they answer different questions. The <strong>sorted-array tell</strong> is what tips you into opposite-end; partition / dedup / fast-slow is same-direction.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Opposite-end (converging)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Pointers start at the two ends and walk toward each other. The array <strong>must be sorted</strong> (or have some monotone structure). Use for: Two Sum II, palindrome check, Container With Most Water.
            </p>
            <CodeBlock lang="java" caption="Two Sum II — sorted input">{`int[] twoSum(int[] a, int target) {
    int l = 0, r = a.length - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == target) return new int[]{l + 1, r + 1};
        if (s < target) l++;       // need bigger → move left up
        else            r--;       // need smaller → move right down
    }
    return new int[]{-1, -1};
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">Same-direction (fast/slow, partition)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Both pointers start at the left. <code>fast</code> scans; <code>slow</code> marks the boundary of &quot;already-processed&quot;. Use for: remove duplicates, Move Zeroes, Dutch flag.
            </p>
            <CodeBlock lang="java" caption="Remove duplicates from sorted array">{`int dedup(int[] a) {
    if (a.length == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < a.length; fast++) {
        if (a[fast] != a[slow]) {
            slow++;
            a[slow] = a[fast];     // overwrite — don't shift
        }
    }
    return slow + 1;               // length of the unique prefix
}`}</CodeBlock>
          </div>
        </div>

        <Callout variant="insight" title="The invariant trick">
          Two-pointer correctness lives in <em>one invariant</em>. Opposite-end: &quot;the answer, if it exists, is inside [l, r].&quot; Same-direction: &quot;a[0..slow] is the processed prefix.&quot; If you can write the invariant down in one sentence, the move rule (l++, r--, swap, etc.) writes itself.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/two-pointers" className="text-indigo-600 hover:underline">Module 23 — Two pointers</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Sliding window detail */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Sliding window — fixed vs variable</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A window is a same-direction two-pointer with state in the middle. Fixed-size windows are easy (one pointer effectively). Variable windows are the famous &quot;expand then contract&quot; pattern.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">Fixed window — just slide</h3>
        <CodeBlock lang="java" caption="LC 643 — Max average of a fixed k-sized window">{`double maxAverage(int[] a, int k) {
    long sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];   // prime the window
    long best = sum;
    for (int i = k; i < a.length; i++) {
        sum += a[i] - a[i - k];                // add new, drop old
        best = Math.max(best, sum);
    }
    return (double) best / k;
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Variable window — expand then contract</h3>
        <CodeBlock lang="java" caption="The canonical template">{`int variableWindow(int[] a) {
    int l = 0, best = 0;
    // any state you need: counts, sum, frequency map, etc.
    Map<Integer, Integer> count = new HashMap<>();

    for (int r = 0; r < a.length; r++) {
        // 1. EXPAND: add a[r] to window state
        count.merge(a[r], 1, Integer::sum);

        // 2. CONTRACT: while invariant is broken, shrink from left
        while (/* invariant broken — e.g. count.size() > k */) {
            count.merge(a[l], -1, Integer::sum);
            if (count.get(a[l]) == 0) count.remove(a[l]);
            l++;
        }

        // 3. RECORD: window [l..r] is now valid
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Window + frequency map — &quot;at most k distinct&quot;</h3>
        <CodeBlock lang="java" caption="Longest substring with at most k distinct characters">{`int longestKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        count.merge(s.charAt(r), 1, Integer::sum);
        while (count.size() > k) {
            char c = s.charAt(l++);
            if (count.merge(c, -1, Integer::sum) == 0) count.remove(c);
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <Callout variant="warn" title="The expand-then-contract order matters">
          Expand <em>first</em>, then contract until the invariant holds again, then record. If you record before contracting, you count windows that violate the invariant. If you contract before expanding, you starve the window. Always: expand, contract-to-fix, record.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/sliding-window" className="text-indigo-600 hover:underline">Module 24 — Sliding window</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Binary search detail */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Binary search — the off-by-one minefield</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Pick <em>one</em> convention and stick to it. The convention rules below are for half-open <code>[l, r)</code> — the one that&apos;s easiest to extend to lower/upper bound.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Question</th>
                <th className="px-4 py-3 font-semibold">Convention A: closed [l, r]</th>
                <th className="px-4 py-3 font-semibold">Convention B: half-open [l, r)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
              <tr>
                <td className="px-4 py-3 font-sans">Initial r</td>
                <td className="px-4 py-3">n - 1</td>
                <td className="px-4 py-3">n</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans">Loop condition</td>
                <td className="px-4 py-3">l &lt;= r</td>
                <td className="px-4 py-3">l &lt; r</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans">Move left after a[mid] &lt; t</td>
                <td className="px-4 py-3">l = mid + 1</td>
                <td className="px-4 py-3">l = mid + 1</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans">Move right after a[mid] &gt; t</td>
                <td className="px-4 py-3">r = mid - 1</td>
                <td className="px-4 py-3">r = mid    <span className="text-slate-400 font-sans">(no -1!)</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans">Lower bound (first ≥ t)</td>
                <td className="px-4 py-3">awkward</td>
                <td className="px-4 py-3 text-emerald-600">natural: returns l</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans">Upper bound (first &gt; t)</td>
                <td className="px-4 py-3">awkward</td>
                <td className="px-4 py-3 text-emerald-600">natural: returns l</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-4 mb-2">Binary-search the answer (LC 875 — Koko Eating Bananas)</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          When the array isn&apos;t sorted but the <em>answer</em> lives in a known range and there&apos;s a monotone predicate <code>feasible(x)</code>, you binary-search over the answer range. Total time is <code>O(n · log(max))</code>.
        </p>
        <CodeBlock lang="java" caption="Smallest eating speed k such that all piles finish in ≤ h hours">{`int minEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = 1;
    for (int p : piles) hi = Math.max(hi, p);     // upper bound on answer

    // Half-open search [lo, hi+1) over candidate speeds.
    int l = lo, r = hi + 1;
    while (l < r) {
        int mid = l + (r - l) / 2;                // safe against overflow
        if (canFinish(piles, mid, h)) r = mid;    // feasible → look smaller
        else                          l = mid + 1; // not feasible → bigger
    }
    return l;                                     // smallest feasible speed
}

boolean canFinish(int[] piles, int k, int h) {
    long hours = 0;
    for (int p : piles) hours += (p + k - 1L) / k;  // ceil(p / k)
    return hours <= h;
}`}</CodeBlock>

        <Callout variant="insight" title="The 5-question recipe for answer-search">
          (1) What is the answer? (2) What range does it live in? (3) Is there a monotone predicate <code>feasible(x)</code> — i.e. if x works, does x+1 work? (4) Can you compute <code>feasible</code> in O(n)? (5) Do you want the smallest feasible or the largest? If you can answer all five, the binary search writes itself.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/binary-search" className="text-indigo-600 hover:underline">Module 25 — Binary search</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Sorting algorithms table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Sorting algorithms — the comparison table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Memorize this. The interview question is almost always &quot;tell me about merge sort&quot; or &quot;why is quicksort O(n²) in the worst case?&quot; — you need these numbers at the tip of your tongue.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 font-semibold">Best</th>
                <th className="px-4 py-3 font-semibold">Average</th>
                <th className="px-4 py-3 font-semibold">Worst</th>
                <th className="px-4 py-3 font-semibold">Space</th>
                <th className="px-4 py-3 font-semibold">Stable?</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Bubble</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans">Yes</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Pedagogical only. Best = already-sorted with early-exit flag.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Selection</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans">No</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Always n² — no early exit possible. Useful when writes are expensive (only n swaps).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Insertion</td>
                <td className="px-4 py-3 text-emerald-600">O(n)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans">Yes</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Adaptive. TimSort uses it for runs of ≤ 32. Fast on nearly-sorted input.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Merge</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 font-sans">Yes</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Guaranteed n log n. Not in-place — O(n) heap buffer. Stable.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Quick</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-rose-600">O(n²)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-sans">No</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">In-place (just stack). Worst case on already-sorted + bad pivot; fix with random pivot or median-of-three.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Heap</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-amber-600">O(n log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans">No</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Worst-case guarantee AND in-place — but slower constants than quicksort in practice.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="What Arrays.sort actually uses in Java">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><code>Arrays.sort(int[])</code> and other primitive overloads → <strong>dual-pivot Quicksort</strong> (Vladimir Yaroslavskiy). Fast, in-place, unstable — but primitives have no identity so stability doesn&apos;t matter.</li>
            <li><code>Arrays.sort(Object[])</code> and <code>Collections.sort(List)</code> → <strong>TimSort</strong>. Stable, O(n log n) worst case, O(n) on nearly-sorted input. The cost is O(n) auxiliary space.</li>
            <li>Two different algorithms because primitives don&apos;t need stability; objects often do (e.g. sorting people by name, then sorting by age — you want age-equal people to stay in name order).</li>
          </ul>
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/sorting" className="text-indigo-600 hover:underline">Module 26 — Sorting algorithms</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Recursion + backtracking template */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Recursion &amp; backtracking — the choose/explore/unchoose pattern</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Recursion is the <em>trust-the-recursive-call</em> contract. Backtracking is recursion plus mutation that you undo. The template is the same skeleton every time.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">The pseudocode template</h3>
        <CodeBlock lang="java" caption="The backtracking skeleton">{`void backtrack(State state, List<List<X>> results) {
    if (isComplete(state)) {
        results.add(snapshot(state));   // record a solution
        return;
    }
    for (X choice : candidates(state)) {
        if (!isValid(state, choice)) continue;  // pruning
        choose(state, choice);          // 1. CHOOSE — mutate
        backtrack(state, results);      // 2. EXPLORE — recurse
        unchoose(state, choice);        // 3. UNCHOOSE — undo!
    }
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Real Java: LC 78 Subsets</h3>
        <CodeBlock lang="java" caption="Enumerate all 2ⁿ subsets — the include-or-skip pattern">{`List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    backtrack(nums, 0, new ArrayList<>(), out);
    return out;
}

void backtrack(int[] nums, int i, List<Integer> path, List<List<Integer>> out) {
    if (i == nums.length) {
        out.add(new ArrayList<>(path));   // snapshot — must copy!
        return;
    }
    // Choice 1: skip nums[i]
    backtrack(nums, i + 1, path, out);

    // Choice 2: include nums[i]
    path.add(nums[i]);                    // choose
    backtrack(nums, i + 1, path, out);    // explore
    path.remove(path.size() - 1);         // unchoose — this is the backtrack
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Real Java: LC 46 Permutations</h3>
        <CodeBlock lang="java" caption="Permutations — visited[] tracks what's already in the path">{`List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> out = new ArrayList<>();
    backtrack(nums, new boolean[nums.length], new ArrayList<>(), out);
    return out;
}

void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {
    if (path.size() == nums.length) {
        out.add(new ArrayList<>(path));
        return;
    }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;            // prune — can't reuse
        used[i] = true;                   // choose
        path.add(nums[i]);
        backtrack(nums, used, path, out); // explore
        path.remove(path.size() - 1);     // unchoose
        used[i] = false;
    }
}`}</CodeBlock>

        <Callout variant="insight" title="The recursion contract (in one sentence)">
          When you write the recursive call, <em>assume it works on the smaller input</em>. Don&apos;t trace through it — that&apos;s how you go insane. Just trust it, write the base case, and write what to do with its return value. The compiler / call stack handles the rest.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Sources: <Link href="/courses/dsa/modules/recursion" className="text-indigo-600 hover:underline">Module 27 — Recursion &amp; D&amp;C</Link>,{" "}
          <Link href="/courses/dsa/modules/backtracking" className="text-indigo-600 hover:underline">Module 28 — Backtracking</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Greedy decision card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">8. Greedy — when it works, when it fails</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Greedy is fast and clean when it works, and catastrophically wrong when it doesn&apos;t. The whole skill is knowing which side of the line you&apos;re on.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">When greedy works</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              You can prove an <strong>exchange argument</strong>: take any optimal solution, swap in the greedy choice, and the result is still at least as good.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>Interval scheduling</strong> (LC 435): sort by end time, take any interval that doesn&apos;t overlap.</li>
              <li><strong>Jump Game</strong> (LC 55): track the furthest reachable index — local maximum is global.</li>
              <li><strong>Coin change with canonical denominations</strong> (USD: 1, 5, 10, 25): always take the largest coin that fits.</li>
              <li><strong>Huffman coding</strong>: greedily combine the two least-frequent symbols.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">When greedy fails — use DP</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              The local choice has nonlocal consequences. The greedy answer differs from the optimum.
            </p>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>Coin change with weird denominations</strong> (e.g. {`{1, 3, 4}`} to make 6): greedy says 4+1+1 (3 coins), but 3+3 (2 coins) is better. Needs DP.</li>
              <li><strong>0/1 Knapsack</strong>: taking the highest value-per-weight item first is wrong in general.</li>
              <li><strong>Longest path in a DAG</strong>: locally short edges can lead to globally long paths.</li>
              <li><strong>Edit distance</strong>: there&apos;s no local rule that always works — you need to consider all three operations.</li>
            </ul>
          </div>
        </div>

        <Callout variant="warn" title="The empirical sanity check before you ship">
          When you suspect greedy might work, <em>code it AND code brute force</em>, then run them against each other on random inputs of size n ≤ 8. If they ever disagree, greedy is wrong and you need DP. This is the single most useful technique for distinguishing &quot;greedy that works&quot; from &quot;greedy that just feels like it should work.&quot;
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/greedy" className="text-indigo-600 hover:underline">Module 29 — Greedy algorithms</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Bit manipulation reference */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">9. Bit manipulation — operators reference</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Java has seven bitwise operators. Three you use every day (<code>&amp;</code>, <code>|</code>, <code>^</code>), three you confuse (<code>&lt;&lt;</code>, <code>&gt;&gt;</code>, <code>&gt;&gt;&gt;</code>), and one you forget exists (<code>~</code>).
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Operator</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">What it does</th>
                <th className="px-4 py-3 font-semibold">Classic use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">&amp;</td>
                <td className="px-4 py-3 font-sans">AND</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">1 iff both bits are 1</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Test a bit: <code>(n &gt;&gt; i) &amp; 1</code>. Clear lowest bit: <code>n &amp; (n - 1)</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">|</td>
                <td className="px-4 py-3 font-sans">OR</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">1 iff at least one bit is 1</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Set bit i: <code>n |= (1 &lt;&lt; i)</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">^</td>
                <td className="px-4 py-3 font-sans">XOR</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">1 iff bits differ. a ^ a = 0, a ^ 0 = a.</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Toggle bit i: <code>n ^= (1 &lt;&lt; i)</code>. Find the unique element in a list of pairs.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">~</td>
                <td className="px-4 py-3 font-sans">NOT</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Flip every bit. <code>~n == -n - 1</code> in two&apos;s complement.</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Make an all-ones mask, isolate lowest set bit: <code>n &amp; -n</code> uses ~ internally.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">&lt;&lt;</td>
                <td className="px-4 py-3 font-sans">Left shift</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Shift bits left, fill with 0. <code>n &lt;&lt; k == n · 2ᵏ</code>.</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Build a single-bit mask: <code>1 &lt;&lt; i</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">&gt;&gt;</td>
                <td className="px-4 py-3 font-sans">Arithmetic right shift</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Shift right, fill with the <em>sign bit</em>. Negative stays negative.</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Signed divide-by-2: <code>n &gt;&gt; 1</code>. Use for signed math.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-purple-600 font-bold">&gt;&gt;&gt;</td>
                <td className="px-4 py-3 font-sans">Logical (unsigned) right shift</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Shift right, fill with 0 regardless of sign.</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Treating an <code>int</code> as 32 unsigned bits. The safe-midpoint trick: <code>(l + r) &gt;&gt;&gt; 1</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight" title="XOR&apos;s three superpowers">
          (1) <strong>Self-inverse:</strong> <code>a ^ a == 0</code>. XOR every element of a list where one number appears once and the rest appear twice — you get the singleton. (LC 136). (2) <strong>Identity:</strong> <code>a ^ 0 == a</code>. (3) <strong>Swap without temp:</strong>
          <CodeBlock lang="java">{`a ^= b;
b ^= a;   // now b holds original a
a ^= b;   // now a holds original b`}</CodeBlock>
          The third move alone is interview-trivia; the self-inverse property is the one you actually use to find missing/duplicate elements in O(n) time and O(1) space.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/bit-manipulation" className="text-indigo-600 hover:underline">Module 30 — Bit manipulation</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">10. Six gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost real engineers (and real interview candidates) real hours. Burn them in.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Integer overflow in binary-search midpoint</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <code>(lo + hi) / 2</code> overflows when <code>lo + hi &gt; Integer.MAX_VALUE</code>. Sounds rare, but it bit the JDK&apos;s own <code>Arrays.binarySearch</code> for a decade. The fix: use the subtraction form.
            </p>
            <CodeBlock lang="java">{`// BAD — overflows for large lo + hi
int mid = (lo + hi) / 2;

// GOOD — never overflows because (hi - lo) is non-negative
int mid = lo + (hi - lo) / 2;

// ALSO GOOD — unsigned shift, used inside Arrays.binarySearch
int mid = (lo + hi) >>> 1;`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Forgetting to contract the sliding window</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Easy to expand on every iteration of <code>r</code> and forget to shrink from <code>l</code> when the invariant breaks. You end up reporting windows that violate the constraint.
            </p>
            <CodeBlock lang="java">{`// BAD — only ever expands, never contracts
for (int r = 0; r < n; r++) {
    addToWindow(a[r]);
    best = Math.max(best, r - 0 + 1);   // l never moves!
}

// GOOD — expand, then contract while invalid, then record
int l = 0;
for (int r = 0; r < n; r++) {
    addToWindow(a[r]);
    while (!invariantHolds()) {
        removeFromWindow(a[l]);
        l++;
    }
    best = Math.max(best, r - l + 1);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Using <code>&gt;&gt;</code> instead of <code>&gt;&gt;&gt;</code> for unsigned shift</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <code>&gt;&gt;</code> propagates the sign bit. When you&apos;re treating an <code>int</code> as 32 bits (e.g. counting all set bits, hashing, iterating bitmasks), a negative input will fill with 1s and your loop runs forever or produces garbage.
            </p>
            <CodeBlock lang="java">{`// BAD — for n < 0, this is an infinite loop because >> keeps the sign bit
int countBits(int n) {
    int c = 0;
    while (n != 0) {
        c += n & 1;
        n >>= 1;        // sign-extends! never reaches 0 for negative n
    }
    return c;
}

// GOOD — >>> always fills with 0, so we reach 0 in ≤ 32 steps
int countBits(int n) {
    int c = 0;
    while (n != 0) {
        c += n & 1;
        n >>>= 1;
    }
    return c;
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Forgetting to unchoose in backtracking</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The whole point of backtracking is shared mutable state. If you forget to undo your choice, sibling recursive calls inherit a polluted state and the output is garbage.
            </p>
            <CodeBlock lang="java">{`// BAD — path is never popped, so it grows forever
void backtrack(List<Integer> path, ...) {
    if (done()) { out.add(new ArrayList<>(path)); return; }
    for (int c : candidates) {
        path.add(c);
        backtrack(path, ...);
        // missing: path.remove(path.size() - 1);
    }
}

// GOOD — symmetric choose/unchoose
void backtrack(List<Integer> path, ...) {
    if (done()) { out.add(new ArrayList<>(path)); return; }
    for (int c : candidates) {
        path.add(c);                       // choose
        backtrack(path, ...);              // explore
        path.remove(path.size() - 1);      // unchoose — CRITICAL
    }
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Greedy on a non-greedy problem</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Coin change is the classic trap. Greedy works for USD denominations but fails for {`{1, 3, 4}`} on target 6. Always look for a counterexample or sanity-check against brute force.
            </p>
            <CodeBlock lang="java">{`// BAD — greedy on {1, 3, 4} target 6 returns 3 coins (4+1+1)
int coinsGreedy(int[] coins, int target) {
    Arrays.sort(coins);
    int c = 0;
    for (int i = coins.length - 1; i >= 0; i--) {
        while (target >= coins[i]) { target -= coins[i]; c++; }
    }
    return c;   // 3 — but the true answer is 2 (3+3)
}

// GOOD — DP gives the actual optimum: 2 coins
int coinsDP(int[] coins, int target) {
    int[] dp = new int[target + 1];
    Arrays.fill(dp, target + 1);
    dp[0] = 0;
    for (int t = 1; t <= target; t++)
        for (int c : coins)
            if (c <= t) dp[t] = Math.min(dp[t], dp[t - c] + 1);
    return dp[target] > target ? -1 : dp[target];
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 6 · Recursion depth on a skewed input</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Quicksort on already-sorted input with a naive pivot, or a recursive tree traversal on a linked-list-shaped tree, blows the call stack. The fix is randomized pivot (quicksort) or an iterative version with an explicit <code>Deque</code> (tree).
            </p>
            <CodeBlock lang="java">{`// RISKY — already-sorted input + first-element pivot = O(n) depth
int partition(int[] a, int lo, int hi) {
    int pivot = a[lo];                 // bad pivot choice!
    // ... O(n) recursion depth on sorted input → StackOverflowError
}

// SAFE — random pivot. Expected depth O(log n).
int partition(int[] a, int lo, int hi) {
    int p = lo + (int)(Math.random() * (hi - lo + 1));
    swap(a, p, hi);
    int pivot = a[hi];
    // ...
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">11. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Six quick recall checks (one extra because this phase has eight modules). No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You see: 'Given a sorted array, find two numbers that sum to target.' Which technique is the first thing you reach for?"
          options={[
            { label: "HashMap of complements — one pass, O(n) time, O(n) space.", explanation: "Correct for the unsorted version (LC 1 Two Sum). For a sorted array you can do strictly better on space: O(1) with two pointers." },
            { label: "Opposite-end two pointers — converge l and r based on the sum.", correct: true, explanation: "Right. The sorted-array tell is the canonical opposite-end two-pointer signal. O(n) time, O(1) space. The HashMap solution works but wastes the sortedness." },
            { label: "Binary search for each element's complement — O(n log n).", explanation: "Works, but strictly worse than two pointers. If the input is sorted, two pointers is O(n) versus O(n log n) for repeated binary search." },
            { label: "Sliding window over pairs.", explanation: "Sliding window is for contiguous subarrays/substrings with a property. Two Sum is about a pair, not a window." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="In a sliding window, when does the contraction (l++) happen?"
          options={[
            { label: "On every iteration of r, regardless of state.", explanation: "That would be a fixed-size window. Variable windows contract conditionally." },
            { label: "Only at the end, after the loop finishes.", explanation: "Then l never actually moves during the loop — you'd record invalid windows." },
            { label: "After expanding with a[r], while the window invariant is violated.", correct: true, explanation: "Right. Expand → contract-until-valid → record. That ordering is what makes the invariant hold every time you read out a window size." },
            { label: "Before expanding, to make room for the new element.", explanation: "Pre-shrinking starves the window. Expand first; only contract if the new element broke the invariant." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What's the safe midpoint formula in binary search, and why?"
          options={[
            { label: "(lo + hi) / 2 — it's mathematically equivalent and clearer.", explanation: "Mathematically equivalent, but it overflows when lo + hi > Integer.MAX_VALUE. This bug lived in the JDK's own Arrays.binarySearch for a decade." },
            { label: "lo + (hi - lo) / 2, because (hi - lo) is non-negative and fits in an int.", correct: true, explanation: "Right. Subtraction first guarantees no overflow even at INT_MAX. Equivalent: (lo + hi) >>> 1, the unsigned-shift form." },
            { label: "Math.floorDiv(lo + hi, 2) — Java has a built-in.", explanation: "Math.floorDiv doesn't prevent the overflow; the int sum (lo + hi) overflows before floorDiv ever sees it." },
            { label: "(lo + hi) >> 1 — arithmetic shift divides by 2.", explanation: "Same overflow problem — the sum is computed first. Worse: >> sign-extends, so an overflowed negative midpoint stays negative. Use >>> instead." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Java's Arrays.sort(Object[]) uses which algorithm — and why isn't it the same as Arrays.sort(int[])?"
          options={[
            { label: "Both use dual-pivot Quicksort because it's the fastest in practice.", explanation: "Half right. Primitives use dual-pivot Quicksort, but objects use TimSort. The reason: stability." },
            { label: "TimSort for objects, dual-pivot Quicksort for primitives — because objects often need stable sort and primitives don't have identity.", correct: true, explanation: "Right. Stability matters for objects (sort-by-name then sort-by-age expects age-equal people to stay in name order). Primitives have no identity so stability is meaningless — and dual-pivot Quicksort is faster." },
            { label: "Both use TimSort to guarantee O(n log n) worst case.", explanation: "Wrong on primitives — they use dual-pivot Quicksort, which is O(n²) worst case (but very fast on average)." },
            { label: "Heapsort for both because it's the only in-place O(n log n) algorithm.", explanation: "Heapsort isn't used by either default. Quicksort wins on primitives despite the worst case; TimSort wins on objects despite the O(n) extra memory." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="In the backtracking template, the line 'path.remove(path.size() - 1)' is missing. What's the visible symptom?"
          options={[
            { label: "Compile error — Java requires symmetric mutation.", explanation: "Java doesn't enforce this; the symptom shows at runtime via wrong output." },
            { label: "Stack overflow because the recursion never terminates.", explanation: "Recursion still terminates on the base case. The symptom is corrupted output, not infinite depth." },
            { label: "The results list contains paths that grow monotonically — each one longer than the last, with all prior choices still attached.", correct: true, explanation: "Right. Without unchoose, sibling recursive calls inherit the polluted state. You'd see [[1], [1,2], [1,2,3], ...] instead of [[1], [2], [3], [1,2], ...]. The whole shared-mutable-state model collapses." },
            { label: "The function still works because Java passes lists by value.", explanation: "Java passes object references by value — meaning the list is shared across all recursive frames. That's exactly why the unchoose is non-negotiable." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You XOR every element of an array. What property must the array have for the result to be 'the unique element'?"
          options={[
            { label: "The array must be sorted.", explanation: "Sortedness is irrelevant — XOR is commutative and associative, so order doesn't matter." },
            { label: "Every element except one appears exactly twice; the singleton appears once.", correct: true, explanation: "Right. a ^ a = 0, so all pairs cancel. a ^ 0 = a, so the singleton survives. This is LC 136 Single Number — O(n) time, O(1) space." },
            { label: "All elements are positive.", explanation: "XOR works on the bit pattern; sign doesn't matter. Negative numbers cancel just the same." },
            { label: "The array length must be a power of 2.", explanation: "No size constraint. Pairs cancel regardless of total length, as long as the structure is 'pairs plus one singleton'." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 12 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900 bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 dark:from-fuchsia-950/30 dark:via-slate-900 dark:to-pink-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300 mb-2">
          Phase 6 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now name the technique on sight</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Two pointers (sorted-array tell), sliding window (contiguous tell), binary search (sorted OR monotone-predicate tell), sorting (the unlock), recursion &amp; D&amp;C (self-similar tell), backtracking (combinatorial-enumeration tell), greedy (local-is-global tell), and bit manipulation (the small-state / XOR tell). That&apos;s the whole pattern vocabulary you&apos;ll need to discuss approaches in 90% of interview problems.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 7 — Dynamic Programming.</strong> The pattern that subsumes recursion, backtracking, AND greedy when those don&apos;t cut it. Memoization, tabulation, 1D and 2D state, and the &quot;overlapping subproblems&quot; tell.
        </p>
        <Link
          href="/courses/dsa/modules/dp-intro"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Dynamic Programming →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-6-revision" />
    </article>
  );
}
