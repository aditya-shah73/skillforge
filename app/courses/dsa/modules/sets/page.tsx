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
  { id: "setup", title: "What a set is — and why it's a HashMap in disguise" },
  { id: "variants", title: "HashSet vs LinkedHashSet vs TreeSet" },
  { id: "frequency", title: "Frequency counting: the universal pattern" },
  { id: "window", title: "Sliding-window with frequency maps" },
  { id: "project", title: "Project: char counter + LeetCode" },
  { id: "final", title: "Final quiz" },
];

export default function SetsModule() {
  const mod = getModuleBySlug("sets")!;

  // Set membership: a Map<K, Boolean> with the value erased.
  const setModel = `
flowchart LR
    K["element: 'cat'"] --> H["hash('cat')"]
    H --> B["bucket index"]
    B --> P{"already in chain?"}
    P -- "yes" --> NOOP["do nothing<br/>(set add returns false)"]
    P -- "no" --> ADD["append node<br/>(set add returns true)"]
    style K fill:#10b981,color:#fff,stroke:#047857
    style H fill:#fbbf24,color:#000,stroke:#d97706
    style B fill:#f59e0b,color:#fff,stroke:#b45309
    style P fill:#1e293b,color:#fff,stroke:#475569
    style NOOP fill:#94a3b8,color:#fff,stroke:#475569
    style ADD fill:#22c55e,color:#fff,stroke:#15803d
  `.trim();

  // Frequency map: walk once, count, decide.
  const freqPattern = `
flowchart TB
    INPUT["input collection"] --> SCAN["one pass: map[k]++"]
    SCAN --> MAP[("Map&lt;K, Integer&gt;")]
    MAP --> Q1["majority?<br/>most common?<br/>any duplicate?<br/>anagram match?"]
    Q1 --> ANS["answer in O(n) time"]
    style INPUT fill:#10b981,color:#fff,stroke:#047857
    style SCAN fill:#fbbf24,color:#000,stroke:#d97706
    style MAP fill:#f59e0b,color:#fff,stroke:#b45309
    style Q1 fill:#1e293b,color:#fff,stroke:#475569
    style ANS fill:#22c55e,color:#fff,stroke:#15803d
  `.trim();

  // Sliding window over a string with a frequency map.
  const slidingWindow = `
flowchart LR
    S["a b c a b c b b"] --> W1["window [a b c]<br/>freq: a=1 b=1 c=1<br/>distinct=3"]
    W1 -- "expand: add a" --> W2["window [a b c a]<br/>freq: a=2 b=1 c=1<br/>duplicate! shrink"]
    W2 -- "shrink: drop a" --> W3["window [b c a]<br/>freq: a=1 b=1 c=1<br/>distinct=3 ✓"]
    style S fill:#1e293b,color:#fff,stroke:#475569
    style W1 fill:#10b981,color:#fff,stroke:#047857
    style W2 fill:#ef4444,color:#fff,stroke:#b91c1c
    style W3 fill:#22c55e,color:#fff,stroke:#15803d
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="sets" />
      <ModuleProgress moduleSlug="sets" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-3 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold tracking-wide uppercase">
          Module {mod.number} · {mod.phase}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
      </div>

      {/* ───────────────── Part 1 · Sets ───────────────── */}
      <Checkpoint moduleSlug="sets" id="setup" title="I know what a set actually is" xp={10} celebration="A set is a HashMap that forgot its values. Same machinery, narrower API.">
      <section>
        <h2 id="setup">A set is a map with the values erased</h2>

        <p>
          A <strong>set</strong>{" "}is a collection of distinct elements with O(1) membership testing. That&apos;s it.
          You can <code>add</code>, you can ask <code>contains</code>, you can <code>remove</code>. There&apos;s no
          ordering guarantee (in <code>HashSet</code>) and no duplicates allowed.
        </p>

        <p>
          Look at the API of <code>HashSet</code> and you&apos;ll notice it&apos;s exactly <code>HashMap</code> with the
          value half snipped off. In fact, the JDK source <em>literally</em>{" "}backs <code>HashSet</code> with a{" "}
          <code>HashMap&lt;E, Object&gt;</code>, where every key maps to the same dummy <code>PRESENT</code>{" "}
          sentinel. Everything you learned in Module 11 — hashing, chaining, load factor, treeification, the{" "}
          <code>equals</code>/<code>hashCode</code> contract — applies here, full stop.
        </p>

        <Mermaid chart={setModel} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          <code>add</code> is &quot;put if absent&quot;. The boolean return tells you whether the element was new.
        </p>

        <h3>The four operations you&apos;ll use 95% of the time</h3>

        <CodeBlock lang="java">{`Set<String> seen = new HashSet<>();

seen.add("cat");          // true  — was new, now present
seen.add("cat");          // false — already there, no-op
seen.contains("cat");     // true
seen.remove("dog");       // false — wasn't there
seen.size();              // 1`}</CodeBlock>

        <p>
          The trick that makes sets useful isn&apos;t the API — it&apos;s the <em>question shape</em>. Whenever you
          catch yourself asking &quot;have I seen X before?&quot; or &quot;does the input contain a pair that sums
          to T?&quot; or &quot;is this string an anagram of that one?&quot;, a set (or its cousin, a frequency map)
          collapses what would be O(n²) brute force into O(n).
        </p>

        <Callout variant="info" title="Set ≠ Map<K, Boolean> in your code">
          <p>
            You <em>can</em>{" "}simulate a set with <code>Map&lt;K, Boolean&gt;</code>, but don&apos;t.
          </p>
          <p>
            <code>Set</code> conveys intent (&quot;I only care about presence&quot;) and gives you set-algebra
            operations: <code>retainAll</code> (intersection), <code>addAll</code> (union), <code>removeAll</code>{" "}
            (difference). Use the right type.
          </p>
        </Callout>

        <h3>Set algebra, in one slide</h3>

        <CodeBlock lang="java">{`Set<Integer> a = new HashSet<>(List.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(List.of(3, 4, 5, 6));

Set<Integer> union = new HashSet<>(a);
union.addAll(b);                  // {1, 2, 3, 4, 5, 6}

Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);        // {3, 4}

Set<Integer> difference = new HashSet<>(a);
difference.removeAll(b);          // {1, 2}`}</CodeBlock>

        <p>
          All three are O(n + m) average — n and m being the two set sizes. Each element is hashed and looked up
          once. (LeetCode &quot;Intersection of Two Arrays&quot; is literally this.)
        </p>

        <Quiz
          question="What's the time complexity of `set.contains(x)` for `HashSet<String>` with n entries, assuming a sane hashCode?"
          options={[
            { label: "O(n) — Java has to scan every element.", explanation: "That would be `List.contains`. HashSet is hash-based; it's not a scan." },
            { label: "O(log n) — sets are tree-structured.", explanation: "TreeSet is O(log n). HashSet is a hash table." },
            { label: "O(1) average, O(log n) worst case (after treeification).", correct: true, explanation: "Right. Same numbers as HashMap, because that's literally what backs HashSet. The hashCode is computed (O(k) for a key of size k, but treated as constant), the bucket is found in O(1), and the chain walk is expected O(1) under sane load factor — worst case O(log n) once the bucket is treeified." },
            { label: "O(k) where k is the string length.", explanation: "True if you count the cost of hashing the string itself, but conventionally we treat the hash as O(1) for asymptotic analysis." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Variants ───────────────── */}
      <Checkpoint moduleSlug="sets" id="variants" title="I know which Set to reach for" xp={10} celebration="HashSet for raw speed, LinkedHashSet for insertion order, TreeSet for sorted order.">
      <section>
        <h2 id="variants">The three Sets that ship with Java</h2>

        <p>
          Java&apos;s standard library ships three flavors of <code>Set</code>. They all implement the same
          interface; the difference is what they cost and what order they iterate in.
        </p>

        <h3>HashSet — the default</h3>
        <ul>
          <li><strong>Backed by:</strong> <code>HashMap</code>.</li>
          <li><strong>Order:</strong>{" "}none. Iteration order is bucket order, basically random, and changes after a resize.</li>
          <li><strong>add / contains / remove:</strong>{" "}O(1) average, O(log n) worst.</li>
          <li><strong>Use when:</strong>{" "}you only care about presence. The 95% case.</li>
        </ul>

        <h3>LinkedHashSet — insertion order, same speed</h3>
        <ul>
          <li><strong>Backed by:</strong> <code>HashMap</code> + a doubly-linked list threading insertion order through the entries.</li>
          <li><strong>Order:</strong>{" "}insertion order. Iterating gives you the elements in the order you added them.</li>
          <li><strong>add / contains / remove:</strong>{" "}still O(1) average — the linked list adds two pointer updates per add, not a search.</li>
          <li><strong>Use when:</strong>{" "}you want to dedupe a stream while preserving the order things appeared.</li>
        </ul>

        <CodeBlock lang="java">{`// Dedupe a list while preserving first-seen order.
List<String> input = List.of("a", "b", "a", "c", "b", "d");
List<String> deduped = new ArrayList<>(new LinkedHashSet<>(input));
// deduped == [a, b, c, d]`}</CodeBlock>

        <h3>TreeSet — sorted order, log time</h3>
        <ul>
          <li><strong>Backed by:</strong> <code>TreeMap</code>, which is a red-black tree (Module 14).</li>
          <li><strong>Order:</strong>{" "}sorted, by natural order or by a <code>Comparator</code> you supply.</li>
          <li><strong>add / contains / remove:</strong>{" "}O(log n). Always. No hashing involved.</li>
          <li><strong>Bonus:</strong> <code>first</code>, <code>last</code>, <code>floor</code>, <code>ceiling</code>, <code>headSet</code>, <code>tailSet</code> — range queries, all O(log n).</li>
          <li><strong>Use when:</strong>{" "}you need sorted iteration, or &quot;largest element ≤ x&quot; queries, or range scans.</li>
        </ul>

        <Callout variant="warn" title="TreeSet wants Comparable elements">
          <p>
            If your element type doesn&apos;t implement <code>Comparable</code>, you must pass a{" "}
            <code>Comparator</code> to the <code>TreeSet</code> constructor. Forget that and you get{" "}
            <code>ClassCastException</code> at the first <code>add</code> — a runtime, not compile-time, failure.
          </p>
          <p>
            (Records implement <code>Comparable</code> only if you write it; built-in <code>Integer</code>/
            <code>String</code> already do.)
          </p>
        </Callout>

        <ClassifyChallenge
          title="Which Set should you reach for?"
          prompt="Pick the right Set implementation for each scenario."
          buckets={[
            { id: "hash", label: "HashSet", color: "emerald" },
            { id: "linked", label: "LinkedHashSet", color: "amber" },
            { id: "tree", label: "TreeSet", color: "indigo" },
          ]}
          items={[
            { id: "dedupe", label: "Dedupe a stream of user IDs, order doesn't matter, just want the count of distinct.", answer: "hash", explanation: "No order requirement → cheapest option. HashSet wins on raw constant factor." },
            { id: "logorder", label: "Dedupe but preserve the order things first appeared in a log.", answer: "linked", explanation: "Insertion order matters. LinkedHashSet keeps it without sacrificing O(1)." },
            { id: "ceiling", label: "Find the smallest event timestamp ≥ a given query timestamp.", answer: "tree", explanation: "That's `ceiling(t)` — a TreeSet operation, O(log n). HashSet has no order; LinkedHashSet's order is insertion, not sorted." },
            { id: "membership", label: "Cache of seen URLs, just `contains` checks at high QPS.", answer: "hash", explanation: "Pure membership at high speed → HashSet. The other two pay extra for ordering you don't need." },
            { id: "alphabetical", label: "Display a deduplicated list of country names alphabetically.", answer: "tree", explanation: "TreeSet gives sorted iteration for free. The alternative is HashSet + sort at display time, which is also fine but more code." },
            { id: "lru", label: "Track the 100 most-recently-used items with eviction in access order.", answer: "linked", explanation: "LinkedHashMap supports access-order via its (capacity, load, accessOrder) constructor — that's the LRU primitive. LinkedHashSet only supports insertion-order, so for a true LRU you'd build it on LinkedHashMap directly. Of the three set choices here, LinkedHashSet is the closest cousin; HashSet has no notion of order, and TreeSet orders by element value, not access time." },
            { id: "rangeQuery", label: "All event IDs between [10000, 20000].", answer: "tree", explanation: "TreeSet's `subSet` returns a range view in O(log n + k). HashSet would force a full scan." },
          ]}
        />

        <Quiz
          question={'`new TreeSet<>(List.of("banana", "apple", "cherry"))` and you call `.first()`. Result?'}
          options={[
            { label: '"banana" — first added.', explanation: "TreeSet doesn't track insertion order. That'd be LinkedHashSet." },
            { label: '"apple" — first in natural (alphabetical) order.', correct: true, explanation: "Right. TreeSet sorts by Comparable. String's natural order is lexicographic, so 'apple' < 'banana' < 'cherry'. `first()` returns the smallest." },
            { label: '"cherry" — first in some bucket.', explanation: "TreeSet has no buckets; it's a tree." },
            { label: "Throws — TreeSet doesn't support first().", explanation: "`first()` is a core SortedSet method, in the API since Java 1.2." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Frequency counting ───────────────── */}
      <Checkpoint moduleSlug="sets" id="frequency" title="I can pattern-match the frequency-counting tell" xp={15} celebration="One pass, one map. The pattern that solves a quarter of medium interview problems.">
      <section>
        <h2 id="frequency">Frequency counting: the pattern</h2>

        <p>
          A surprising number of interview problems collapse to a single template:
          <strong> walk the input once, count occurrences in a map, then read the answer off the map.</strong>{" "}
          O(n) time, O(unique) space. Once you start seeing the shape, you&apos;ll recognize it everywhere.
        </p>

        <Mermaid chart={freqPattern} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          The map is the answer factory. Every &quot;does X happen / how often / which is most common&quot; problem
          reads off it.
        </p>

        <h3>The Java idiom: <code>getOrDefault</code> and <code>merge</code></h3>

        <CodeBlock lang="java">{`Map<Character, Integer> freq = new HashMap<>();

// Verbose form:
for (char c : s.toCharArray()) {
    freq.put(c, freq.getOrDefault(c, 0) + 1);
}

// Cleaner with Map.merge:
for (char c : s.toCharArray()) {
    freq.merge(c, 1, Integer::sum);
}`}</CodeBlock>

        <p>
          <code>merge(key, value, remap)</code> is the right tool. If the key isn&apos;t present, it puts{" "}
          <code>value</code>; otherwise it calls <code>remap(oldValue, value)</code> and stores the result.{" "}
          One line, no autoboxing pitfalls.
        </p>

        <h3>Use a fixed-size array if your alphabet is small</h3>

        <p>
          When keys are characters in a known alphabet (lowercase letters, ASCII), skip the <code>HashMap</code>{" "}
          entirely and use an <code>int[26]</code> or <code>int[128]</code>. Same algorithm, but with cache-friendly
          array indexing instead of hashing — typically 5-10× faster in practice and zero GC pressure.
        </p>

        <CodeBlock lang="java">{`// Anagram check, two ways:
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] freq = new int[26];
    for (int i = 0; i < s.length(); i++) {
        freq[s.charAt(i) - 'a']++;
        freq[t.charAt(i) - 'a']--;
    }
    for (int f : freq) if (f != 0) return false;
    return true;
}`}</CodeBlock>

        <p>
          That&apos;s LeetCode 242 in 8 lines. The trick — increment for s, decrement for t in the same loop, then
          check all zeros — turns a two-counter compare into a one-counter check. The array <em>is</em>{" "}a
          frequency map; it just happens to live on the stack.
        </p>

        <WorkedExample
          title="The four flavors of frequency-counting questions"
          steps={[
            { title: "Has a duplicate? (LC 217)", body: "Walk the array; bail when freq[x] becomes 2. Or use a HashSet and bail when add returns false. O(n)." },
            { title: "Anagram / permutation match? (LC 242)", body: "Build freq for s, decrement for t, check all-zero. Or compare two freq maps with .equals." },
            { title: "Most common element? (LC 1, 49 group anagrams, 169 majority element)", body: "Build the full freq map, then scan its entries for the max. Two passes total." },
            { title: "Top K most common? (LC 347)", body: "Build freq, then push entries into a min-heap of size K. O(n log K). Heaps are Module 15 — the punchline lands soon." },
          ]}
        />

        <Quiz
          question="You're handed a list of 10M integers and asked: 'Is there any value that appears more than once?' Brute force is O(n²). Best approach?"
          options={[
            { label: "Sort first, then walk pairs of neighbors. O(n log n).", explanation: "Correct in complexity but worse than the hash approach. And it mutates input." },
            { label: "Build a HashSet; bail the moment add returns false. O(n) average.", correct: true, explanation: "Right. One pass, O(n) time, O(n) space, and you can short-circuit on the first duplicate. This is exactly LC 217." },
            { label: "Use a TreeSet for guaranteed log-time inserts.", explanation: "TreeSet's O(log n) per insert is strictly worse than HashSet's O(1) average for this — there's no need for ordering." },
            { label: "Bloom filter — constant space and probabilistic.", explanation: "Bloom filters give false positives, so 'yes there's a duplicate' would need verification. Fine when memory is the bottleneck (URL dedup at scale), overkill for 10M ints." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Sliding-window combo ───────────────── */}
      <Checkpoint moduleSlug="sets" id="window" title="I can combine a frequency map with a sliding window" xp={15} celebration="Frequency map + two pointers = O(n) for a whole family of substring problems.">
      <section>
        <h2 id="window">Sliding window + frequency map</h2>

        <p>
          The combination of a <strong>frequency map</strong>{" "}and a <strong>sliding window</strong> (two indices,
          left and right, that both only move forward) is the engine that powers an entire family of substring
          problems: longest unique substring, smallest window containing all of T, longest substring with at most
          K distinct characters, and so on.
        </p>

        <p>
          The full sliding-window pattern lives in Module 24. This module teaches the frequency-map half of the
          combo, then shows you the assembled engine on one canonical problem.
        </p>

        <Mermaid chart={slidingWindow} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Right pointer expands the window; the left pointer contracts when the invariant breaks. The frequency
          map is the bookkeeping.
        </p>

        <h3>Canonical example: LC 3 — longest substring without repeating characters</h3>

        <CodeBlock lang="java">{`int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> freq = new HashMap<>();
    int left = 0, best = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        freq.merge(c, 1, Integer::sum);

        // Invariant violated: shrink from the left until restored.
        while (freq.get(c) > 1) {
            char leftChar = s.charAt(left);
            freq.merge(leftChar, -1, Integer::sum);
            if (freq.get(leftChar) == 0) freq.remove(leftChar);
            left++;
        }

        best = Math.max(best, right - left + 1);
    }
    return best;
}`}</CodeBlock>

        <p>
          The thing that makes this O(n) and not O(n²): each character is added to the window once (right pointer)
          and removed at most once (left pointer). Total work across the whole loop is bounded by 2n map operations
          — amortized O(n).
        </p>

        <h3>The pattern, abstracted</h3>

        <ol>
          <li><strong>Define the invariant</strong>{" "}the window must satisfy (e.g. &quot;no repeats&quot;, &quot;sum &le; k&quot;, &quot;contains all of T&quot;).</li>
          <li><strong>Right pointer expands</strong>{" "}the window: add the new element, update the map.</li>
          <li><strong>While the invariant is broken</strong>, advance the left pointer: remove its element from the map.</li>
          <li><strong>After each expand-and-restore</strong>, record the answer (longest, shortest, count, whatever you&apos;re tracking).</li>
        </ol>

        <Callout variant="insight" title="Why a Set isn't enough here">
          <p>
            You might wonder: if we just want &quot;no repeats&quot;, can&apos;t we use a <code>HashSet</code>{" "}
            instead of a <code>HashMap</code>? Yes — <code>add</code> returns false on duplicate.
          </p>
          <p>
            But once the window has to shrink, you need to know <em>how many copies</em>{" "}of the left character
            remain so you only erase it from the set when the count hits zero. That&apos;s a frequency map. The Set
            works for &quot;ever seen&quot;; the Map works for &quot;currently present, with count&quot;.
          </p>
        </Callout>

        <PartRecap
          title="Part 4 recap"
          gist="Sliding window + frequency map is the engine for an entire genre of substring problems."
          points={[
            { takeaway: "The window is a pair of indices, left and right, that both only move forward.", detail: "That monotonicity is what gives you O(n). The window moves at most 2n times total." },
            { takeaway: "The frequency map is the window's bookkeeping.", detail: "Add on right-expansion, subtract on left-contraction, remove the key when count hits zero. Otherwise `freq.size()` lies about distinct chars." },
            { takeaway: "Pick Map vs Set based on what you need to know.", detail: "Set tells you 'is this present.' Map tells you 'how many copies, currently, in the window.' Sliding-window almost always needs the latter." },
            { takeaway: "If the alphabet is small, swap the HashMap for an int[26] or int[128].", detail: "Same algorithm, much faster constant. LC 3 in particular runs ~5× faster with a fixed array." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="sets" id="project" title="I built the char counter and solved the warm-ups" xp={20} manual manualLabel="Project & LeetCode complete" celebration="Sets and frequency counting are now muscle memory.">
      <section>
        <h2 id="project">Project: sliding-window character counter + LeetCode warm-ups</h2>

        <h3>Part A — Distinct-char counter for a streaming window</h3>

        <p>
          Build a small class that maintains a fixed-size sliding window over an incoming character stream and
          can answer &quot;how many distinct characters are in the current window?&quot; in O(1).
        </p>

        <CodeBlock lang="java">{`public class WindowDistinctCounter {
    private final int windowSize;
    private final char[] buffer;       // ring buffer of the last 'windowSize' chars
    private int head = 0;              // next write position
    private int filled = 0;            // chars added so far (capped at windowSize)
    private final int[] freq = new int[128];   // ASCII
    private int distinct = 0;

    public WindowDistinctCounter(int windowSize) {
        if (windowSize <= 0) throw new IllegalArgumentException();
        this.windowSize = windowSize;
        this.buffer = new char[windowSize];
    }

    /** Add a new char to the right. If the window is full, the leftmost char is evicted. */
    public void offer(char c) {
        if (filled == windowSize) {
            // Evict the char at head (oldest).
            char evicted = buffer[head];
            if (--freq[evicted] == 0) distinct--;
        } else {
            filled++;
        }
        buffer[head] = c;
        if (freq[c]++ == 0) distinct++;
        head = (head + 1) % windowSize;
    }

    public int distinct() { return distinct; }
}`}</CodeBlock>

        <p>
          Test it: offer the chars of <code>&quot;abacaba&quot;</code> with a window of 4 and watch{" "}
          <code>distinct()</code> climb and stabilize. The whole class is one frequency map (the int array) plus a
          ring buffer (Module 9) for the eviction order. Notice how each <code>offer</code> is O(1) — no scanning.
        </p>

        <h3>Part B — LeetCode warm-ups</h3>

        <ol>
          <li>
            <strong>LC 349 · Intersection of Two Arrays</strong> (Easy). Stick one array into a <code>HashSet</code>,
            then walk the other and collect anything <code>contains</code> returns true for. Pure set-algebra. O(n + m).
          </li>
          <li>
            <strong>LC 242 · Valid Anagram</strong> (Easy). Frequency-array check on a 26-letter alphabet. The
            8-line int[26] version above is the canonical solution.
          </li>
          <li>
            <strong>LC 3 · Longest Substring Without Repeating Characters</strong> (Medium). The sliding-window
            + frequency-map combo from Part 4. This is your gateway to the whole sliding-window family.
          </li>
        </ol>

        <Callout variant="insight" title="What you should have internalized">
          <p>
            Three reflexes: (1) &quot;Have I seen this before?&quot; → <code>HashSet</code>. (2) &quot;How many of
            each?&quot; → <code>HashMap&lt;K, Integer&gt;</code> or fixed array. (3) &quot;Best window satisfying
            some invariant?&quot; → two pointers + frequency map.
          </p>
          <p>
            Every set/map problem you&apos;ll see is one of these.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final quiz ───────────────── */}
      <Checkpoint moduleSlug="sets" id="final" title="I've completed Module 12" xp={15} celebration="Sets and frequency counting unlocked. Trees are next — recursion's natural home.">
      <section>
        <h2 id="final">Final check</h2>

        <Quiz
          question="You need to dedupe a list of 1M strings, preserving the order strings first appeared. Which is correct AND fastest?"
          options={[
            { label: "TreeSet — log-time inserts give a guarantee.", explanation: "TreeSet would order alphabetically, not by first appearance. Wrong order, and slower." },
            { label: "new ArrayList<>(new HashSet<>(input)) — wrap and unwrap.", explanation: "HashSet doesn't preserve insertion order. The output list order is essentially random." },
            { label: "new ArrayList<>(new LinkedHashSet<>(input)) — wrap and unwrap.", correct: true, explanation: "Right. LinkedHashSet keeps insertion order at HashSet speed (O(1) avg per add). The roundtrip through ArrayList just gives you a List for downstream code. ~O(n) total." },
            { label: "Stream.distinct() — built-in dedupe.", explanation: "Stream.distinct() does preserve encounter order and is correct, but it's effectively a LinkedHashSet under the hood with extra streaming overhead. Also fine, just slower in a tight loop." },
          ]}
        />

        <Quiz
          question="`Map.merge(key, 1, Integer::sum)` is preferred over `map.put(key, map.getOrDefault(key, 0) + 1)` because…"
          options={[
            { label: "merge is faster — it does only one map lookup instead of two.", correct: true, explanation: "Right. getOrDefault + put hashes and walks the bucket twice. merge does it once. Same correctness, half the map operations. (It's also less typing and harder to get wrong.)" },
            { label: "merge handles concurrency.", explanation: "Plain HashMap.merge is not thread-safe. ConcurrentHashMap.merge is, but the reason to prefer merge here is performance/clarity, not concurrency." },
            { label: "merge avoids autoboxing.", explanation: "Both versions box the count to Integer either way. merge isn't magic — it just bundles the lookup-and-update." },
            { label: "merge throws on null keys.", explanation: "merge throws on null *value* (and on null result from the remap), but neither version handles null keys differently." },
          ]}
        />

        <Quiz
          question="A frequency map of a sliding window currently holds {a: 2, b: 1}. The left pointer moves past an 'a'. What's the right update?"
          options={[
            { label: "Decrement freq['a']. The map becomes {a: 1, b: 1}.", explanation: "Half right. You did decrement, but you also need the zero-handling rule: if a count hits zero, remove the key. Otherwise `freq.size()` overcounts distinct chars in the window — which silently breaks problems like 'longest substring with K distinct characters'." },
            { label: "Remove 'a' from the map entirely.", explanation: "Premature. There are two 'a's in the window; only one was evicted." },
            { label: "Decrement freq['a'], then check if it hit zero — if so, remove the entry.", correct: true, explanation: "Right — this is the canonical sliding-window pattern. Keeping a zero-count entry around makes `freq.size()` lie about distinct chars in the window. Always remove on zero." },
            { label: "Set freq['a'] to 0.", explanation: "Same problem as above: a zero-count entry pollutes `size()`. If you're going to drop to zero, just remove the key." },
          ]}
        />

        <div className="my-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mt-0 mb-2 text-white">Module 12 complete</h3>
          <p className="text-emerald-50 mb-4">
            Sets and frequency counting put a lot of medium-difficulty problems within reach. Next up: trees —
            the recursive shape that powers traversal, search trees, heaps, and basically all of Phase 4&apos;s
            graphs.
          </p>
          <Link
            href="/courses/dsa/modules/trees"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-emerald-700 font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Next: Trees &amp; binary trees →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="sets" />
    </article>
  );
}
