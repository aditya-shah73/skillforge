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

const CHECKPOINTS = [
  { id: "hierarchy", title: "The Collections hierarchy" },
  { id: "lists", title: "List family · ArrayList vs LinkedList vs ArrayDeque" },
  { id: "maps", title: "Map family · HashMap vs LinkedHashMap vs TreeMap" },
  { id: "sets", title: "Set family · HashSet vs LinkedHashSet vs TreeSet" },
  { id: "ordering", title: "Comparable vs Comparator" },
  { id: "final", title: "Final quiz" },
];

export default function JavaCollectionsModule() {
  const mod = getModuleBySlug("java-collections")!;

  // The hierarchy
  const hierarchy = `
flowchart TB
    Iterable["Iterable<T>"]
    Collection["Collection<T>"]
    List["List<T>"]
    Set["Set<T>"]
    Queue["Queue<T>"]
    Deque["Deque<T>"]
    Map["Map<K,V>"]

    Iterable --> Collection
    Collection --> List
    Collection --> Set
    Collection --> Queue
    Queue --> Deque

    List --> ArrayList["ArrayList"]
    List --> LinkedList["LinkedList"]
    Deque --> ArrayDeque["ArrayDeque"]
    Deque --> LinkedList

    Set --> HashSet["HashSet"]
    HashSet --> LinkedHashSet["LinkedHashSet"]
    Set --> TreeSet["TreeSet"]

    Map --> HashMap["HashMap"]
    HashMap --> LinkedHashMap["LinkedHashMap"]
    Map --> TreeMap["TreeMap"]

    style Iterable fill:#0e7490,color:#fff,stroke:#0891b2
    style Collection fill:#0891b2,color:#fff
    style Map fill:#0891b2,color:#fff
    style List fill:#06b6d4,color:#000
    style Set fill:#06b6d4,color:#000
    style Queue fill:#06b6d4,color:#000
    style Deque fill:#06b6d4,color:#000
    style ArrayList fill:#67e8f9,color:#000
    style LinkedList fill:#67e8f9,color:#000
    style ArrayDeque fill:#67e8f9,color:#000
    style HashSet fill:#67e8f9,color:#000
    style LinkedHashSet fill:#a5f3fc,color:#000
    style TreeSet fill:#67e8f9,color:#000
    style HashMap fill:#67e8f9,color:#000
    style LinkedHashMap fill:#a5f3fc,color:#000
    style TreeMap fill:#67e8f9,color:#000
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="java-collections" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 5 · Module 17 · Synthesis
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · the &quot;which container do I reach for&quot; decision framework</p>
      </div>

      {/* ───────────────── Part 1 · Hierarchy ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="hierarchy" title="I can sketch the Collections hierarchy from memory" xp={20}>
      <section>
        <h2 id="hierarchy">The Collections hierarchy</h2>

        <p>
          You&apos;ve been using <code>ArrayList</code>, <code>HashMap</code>, <code>ArrayDeque</code> for sixteen
          modules. This module is the synthesis: <em>which container do I reach for, and why?</em> Phase 5 is one
          module long because it&apos;s a decision framework, not a new data structure. By the end you should be able
          to look at any collection scenario and pick the right concrete class in five seconds.
        </p>

        <h3>The shape</h3>

        <p>
          Java&apos;s collections framework splits into two trees: <strong>Collection</strong> (things you iterate
          one element at a time) and <strong>Map</strong> (key→value associations). Map is technically <em>not</em>{" "}
          a Collection — you can&apos;t just iterate a Map directly without first asking for <code>.entrySet()</code>{" "}
          or <code>.keySet()</code>.
        </p>

        <Mermaid chart={hierarchy} />

        <Callout variant="info" title="LinkedList is in two places on purpose">
          <code>LinkedList</code> implements both <code>List</code> AND <code>Deque</code>. It&apos;s
          legal to use it as either, but in 2024 you should use <code>ArrayList</code> for List behavior and{" "}
          <code>ArrayDeque</code> for Deque behavior. <code>LinkedList</code> loses on cache locality, allocates a
          node object per element, and is rarely the right answer outside specific niches.
        </Callout>

        <h3>The five interfaces you actually program against</h3>

        <CodeBlock lang="java">{`List<Integer> list = new ArrayList<>();         // ordered, indexable, allows duplicates
Set<String> set   = new HashSet<>();             // unordered, no duplicates
Map<String, Integer> map = new HashMap<>();      // key → value
Deque<Integer> dq = new ArrayDeque<>();          // double-ended queue (or stack)
Queue<Integer> q  = new ArrayDeque<>();          // FIFO (Deque is a Queue)`}</CodeBlock>

        <p>
          Notice the pattern: <strong>declare with the interface, instantiate with the concrete</strong>. This is the
          single most-cited Java idiom. It means you can swap <code>HashMap</code> for <code>LinkedHashMap</code>{" "}
          without changing the rest of your code, because both implement <code>Map</code>.
        </p>

        <Callout variant="insight" title="Why interface-typed locals matter even in a small method">
          When the variable is typed <code>HashMap&lt;K,V&gt;</code> instead of <code>Map&lt;K,V&gt;</code>, you can
          accidentally call <code>HashMap</code>-only methods like <code>clone()</code> with a covariant return —
          tying your code to that exact class. Future-you swapping to a TreeMap discovers the lock-in only at compile
          time. Type to the interface, instantiate the concrete, and the swap is one line.
        </Callout>

        <h3>The Big-O cheat sheet you&apos;ll consult forever</h3>

        <CodeBlock lang="plain">{`                       Add    Get/Contains  Remove   Iterate   Memory
ArrayList              O(1)*  O(1) by idx   O(n)     O(n)      compact
LinkedList             O(1)   O(n)          O(1)**   O(n)      heavy
ArrayDeque             O(1)*  O(1) ends     O(1) ends O(n)     compact

HashMap                O(1)*  O(1)*         O(1)*    O(n)      medium
LinkedHashMap          O(1)*  O(1)*         O(1)*    O(n)      heavier
TreeMap                O(log n) O(log n)    O(log n) O(n) sorted heavier

HashSet                O(1)*  O(1)*         O(1)*    O(n)      medium
LinkedHashSet          O(1)*  O(1)*         O(1)*    O(n)      heavier
TreeSet                O(log n) O(log n)    O(log n) O(n) sorted heavier

PriorityQueue          O(log n) O(1) peek   O(log n) O(n)      compact
                       (offer)  (top only)  (poll)`}</CodeBlock>

        <p>
          <strong>*</strong> = amortized (ArrayList grow, HashMap rehash). <strong>**</strong> = O(1) for a known
          node reference; O(n) if you have to find the node first.
        </p>

        <Quiz
          kind="Quick check"
          question="Why does the idiom `List<Integer> list = new ArrayList<>();` declare with the interface?"
          options={[
            { label: "It's faster at runtime.", explanation: "Performance is identical — the JIT inlines through the interface call. The benefit is at design/refactor time, not runtime." },
            { label: "It decouples the calling code from the concrete class, so you can swap implementations without ripple-edits.", correct: true, explanation: "Right. If a method takes List<T>, you can pass ArrayList today and LinkedList tomorrow with zero code changes elsewhere. Typing to the interface keeps the contract narrow and the implementation swappable." },
            { label: "It's required by Java to use generics.", explanation: "Java accepts both. The diamond <> works on either side. The idiom is convention, not language requirement." },
            { label: "Only ArrayList implements List.", explanation: "Many classes implement List: ArrayList, LinkedList, Vector, CopyOnWriteArrayList, Collections.unmodifiableList wrappers, etc." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · List family ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="lists" title="I pick the right list-like container in 5 seconds" xp={20}>
      <section>
        <h2 id="lists">List family · ArrayList vs LinkedList vs ArrayDeque</h2>

        <p>
          Three classes cover almost every &quot;sequence of things&quot; need. They sound similar; they behave
          differently. Knowing when to reach for each is core literacy.
        </p>

        <h3>ArrayList — the default</h3>

        <p>
          A resizable array under the hood. <code>get(i)</code> and <code>set(i, x)</code> are O(1).
          <code>add(x)</code> is amortized O(1) — when capacity fills, the underlying array doubles, which is O(n) but
          rare. Insertion or removal in the middle is O(n) because everything after the gap has to shift.
        </p>

        <CodeBlock lang="java">{`List<Integer> arr = new ArrayList<>();
arr.add(1);              // O(1) amortized
arr.add(2);
arr.get(0);              // O(1)
arr.set(0, 99);          // O(1)
arr.add(0, 42);          // O(n) — shifts everything right
arr.remove(0);           // O(n) — shifts everything left
arr.size();              // O(1)`}</CodeBlock>

        <h3>LinkedList — almost never the right answer</h3>

        <p>
          A doubly-linked list of nodes. <code>add</code> at the ends is O(1). Indexed access is O(n) because there&apos;s
          no random access — you walk the chain. Each node allocates a separate object with prev/next pointers, which
          murders cache locality. In benchmarks, <code>ArrayList</code> beats <code>LinkedList</code> on most
          operations even when LinkedList has the better Big-O on paper, because cache misses dominate.
        </p>

        <CodeBlock lang="java">{`List<Integer> ll = new LinkedList<>();
ll.add(1);               // O(1)
ll.get(500_000);         // O(n) — walks 500,000 nodes
ll.remove(500_000);      // O(n) — same walk`}</CodeBlock>

        <Callout variant="warn" title="LinkedList's one legitimate use case (and why you still skip it)">
          The classic argument is &quot;O(1) insertion in the middle&quot;. True — but only if you already have an
          <code>Iterator</code> pointed at the spot. To get the iterator you walked O(n) to reach. Unless you&apos;re
          iterating and inserting/removing in a single pass, ArrayList wins. And for queue/deque needs, ArrayDeque
          beats LinkedList anyway. Modern Java code uses LinkedList essentially never.
        </Callout>

        <h3>ArrayDeque — the queue and stack</h3>

        <p>
          A circular array supporting O(1) operations at both ends. Implements <code>Deque</code>, which extends{" "}
          <code>Queue</code>, so it&apos;s the canonical choice for both. You&apos;ve been using it as a
          BFS queue and DFS stack for the last two phases.
        </p>

        <CodeBlock lang="java">{`Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);           // O(1) — adds to head
stack.pop();             // O(1) — removes from head
stack.peek();            // O(1)

Deque<Integer> queue = new ArrayDeque<>();
queue.offer(1);          // O(1) — adds to tail
queue.poll();            // O(1) — removes from head`}</CodeBlock>

        <Callout variant="insight" title="Don't use the legacy Stack class">
          <code>java.util.Stack</code> extends <code>Vector</code> and is synchronized — slow and obsolete.
          <code>ArrayDeque</code> is the modern stack: faster, unsynchronized, same API ({" "}
          <code>push</code>/<code>pop</code>/<code>peek</code>). The Java Collections Framework specifically
          recommends ArrayDeque over Stack in its Javadoc. Same advice for queues: ArrayDeque, not LinkedList.
        </Callout>

        <h3>The &quot;array vs ArrayList&quot; question</h3>

        <p>
          Native arrays (<code>int[]</code>, <code>String[]</code>) are faster than ArrayList for primitives — no
          autoboxing, contiguous memory, simple indexing. The cost: fixed size and no built-in operations.
        </p>

        <CodeBlock lang="plain">{`Use native int[]/double[]    when size is known up front, you need raw speed (BFS visited[],
                              DP tables, dijkstra dist[]).
Use ArrayList<T>             when size grows dynamically, you need List operations,
                              or T is a reference type anyway.
Use IntStream → toArray()    when you need the array but built it via streams/lambdas.`}</CodeBlock>

        <Quiz
          kind="List check"
          question="You're implementing BFS on a graph with up to 10⁵ nodes. What do you use for the visited tracker?"
          options={[
            { label: "Set<Integer> visited = new HashSet<>();", explanation: "Works, but slower: each contains/add boxes the Integer, hashes it, walks the bucket. Boolean[] is several times faster on the same workload." },
            { label: "boolean[] visited = new boolean[n];", correct: true, explanation: "Right. The graph is integer-indexed [0, n-1], so a primitive array is perfect: O(1) read/write, no boxing, contiguous memory. This is THE right choice when nodes are integers in a known range." },
            { label: "List<Boolean> visited = new ArrayList<>();", explanation: "Works but pays the boxing cost on every read/write. Plus you have to pre-fill it with `false` to size it. Boolean[] beats this on every dimension." },
            { label: "Map<Integer, Boolean> visited = new HashMap<>();", explanation: "All the boxing of HashSet plus the wasted Boolean values. The Set<Integer> alternative is strictly better, and boolean[] is better than that." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Map family ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="maps" title="I know which Map to pick for every scenario" xp={25}>
      <section>
        <h2 id="maps">Map family · HashMap vs LinkedHashMap vs TreeMap</h2>

        <p>
          Three Maps. Each adds a property the previous didn&apos;t have, at a price.
        </p>

        <CodeBlock lang="plain">{`HashMap         O(1) ops        no order
LinkedHashMap   O(1) ops        insertion order (or access order, opt-in)
TreeMap         O(log n) ops    sorted by key (natural or Comparator)`}</CodeBlock>

        <h3>HashMap — the default</h3>

        <p>
          A hash table. Put, get, containsKey, remove are all O(1) on average. The order of iteration is
          unspecified — and Java explicitly reserves the right to change it across versions. Don&apos;t rely on it.
        </p>

        <CodeBlock lang="java">{`Map<String, Integer> counts = new HashMap<>();
counts.put("apple", 3);
counts.getOrDefault("apple", 0);      // 3
counts.merge("apple", 1, Integer::sum);   // counts.put("apple", 3+1)
counts.computeIfAbsent("banana", k -> new ArrayList<>());`}</CodeBlock>

        <Callout variant="info" title="Three HashMap idioms worth memorizing">
          <p><code>getOrDefault(k, def)</code> — read with fallback, no null risk.</p>
          <p><code>merge(k, val, BiFunction)</code> — &quot;put if absent, otherwise combine.&quot; Perfect for frequency
          counts: <code>map.merge(k, 1, Integer::sum)</code>.</p>
          <p><code>computeIfAbsent(k, k -&gt; new...)</code> — &quot;get the value, creating it if missing.&quot; Perfect
          for Map-of-Lists: <code>adj.computeIfAbsent(u, k -&gt; new ArrayList&lt;&gt;()).add(v)</code>.</p>
        </Callout>

        <h3>LinkedHashMap — preserves insertion order (for free, almost)</h3>

        <p>
          Same as HashMap, but maintains a doubly-linked list threading through entries in insertion order. Iteration
          is now predictable. Tiny memory overhead per entry; ops still O(1).
        </p>

        <p>
          The killer feature: pass <code>accessOrder = true</code> to the constructor and the linked list reorders on
          every <em>access</em>, not just insertion. That gives you an <strong>LRU cache</strong> in about ten lines
          by overriding <code>removeEldestEntry</code>:
        </p>

        <CodeBlock lang="java">{`class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LRUCache(int capacity) {
        super(16, 0.75f, true);   // accessOrder = true
        this.capacity = capacity;
    }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}`}</CodeBlock>

        <p>
          Get/put both bump the entry to the &quot;most recently used&quot; end. When size exceeds capacity, the
          eldest (least-recently-used) entry is evicted automatically. This is the complete LRU implementation —
          no separate doubly-linked-list bookkeeping needed.
        </p>

        <h3>TreeMap — sorted by key</h3>

        <p>
          A red-black tree. Every operation is O(log n), but you get keys in sorted order plus
          a powerful set of range queries: <code>firstKey()</code>, <code>lastKey()</code>, <code>ceilingKey(k)</code>,
          <code>floorKey(k)</code>, <code>headMap(k)</code>, <code>tailMap(k)</code>, <code>subMap(lo, hi)</code>.
        </p>

        <CodeBlock lang="java">{`TreeMap<Integer, String> events = new TreeMap<>();
events.put(100, "boot");
events.put(250, "request");
events.put(180, "auth");

events.firstKey();              // 100
events.ceilingKey(120);         // 180  (smallest key ≥ 120)
events.floorKey(120);           // 100  (largest key ≤ 120)
events.subMap(150, 300);        // {180=auth, 250=request}`}</CodeBlock>

        <Callout variant="insight" title="When TreeMap is the right answer">
          Anytime the question contains the words &quot;just less than,&quot; &quot;just greater than,&quot;
          &quot;next event after time t,&quot; or &quot;range from a to b&quot; — TreeMap. The O(log n) cost buys
          you constant-time range navigation that HashMap can&apos;t give you at any price. Calendar booking
          conflicts, time-series queries, leaderboards by score — all TreeMap territory.
        </Callout>

        <h3>The Map decision tree</h3>

        <CodeBlock lang="plain">{`Need key→value lookup?
├── Just lookup, don't care about order        → HashMap
├── Need iteration in insertion order          → LinkedHashMap
├── Need iteration in access-order (LRU)       → LinkedHashMap(accessOrder=true)
├── Need keys sorted, or range/ceiling/floor   → TreeMap
└── Need thread-safety                         → ConcurrentHashMap`}</CodeBlock>

        <Quiz
          kind="Map check"
          question="You're building a 'next bus arriving after time T' lookup. What's the right Map?"
          options={[
            { label: "HashMap.", explanation: "HashMap has no notion of 'next key after T' — you'd have to scan all entries every query, defeating the point of a Map." },
            { label: "LinkedHashMap.", explanation: "LinkedHashMap keeps insertion order, not key order. 'Next time after T' would still need a scan." },
            { label: "TreeMap with ceilingKey(T) — O(log n) per query.", correct: true, explanation: "Right. TreeMap orders by key (the bus arrival time). ceilingKey(T) finds the smallest arrival time ≥ T in O(log n). This is the textbook use case for sorted-map range navigation." },
            { label: "PriorityQueue.", explanation: "PriorityQueue gives O(1) peek at the minimum, but you can't query 'min ≥ T' without draining and re-inserting. Wrong tool for arbitrary range queries." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Set family ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="sets" title="I know each Set's tradeoffs cold" xp={20}>
      <section>
        <h2 id="sets">Set family · HashSet vs LinkedHashSet vs TreeSet</h2>

        <p>
          The Set hierarchy mirrors the Map hierarchy exactly, because each <code>Set</code> is implemented as a
          <code>Map</code> with throwaway values. <code>HashSet</code> wraps a <code>HashMap</code>;{" "}
          <code>TreeSet</code> wraps a <code>TreeMap</code>; <code>LinkedHashSet</code> wraps a
          <code>LinkedHashMap</code>. The Big-O matches; the use cases match.
        </p>

        <CodeBlock lang="plain">{`HashSet         O(1) add/contains/remove    no order
LinkedHashSet   O(1) add/contains/remove    insertion order
TreeSet         O(log n) ops                sorted, with range queries`}</CodeBlock>

        <h3>HashSet — the default deduplicator</h3>

        <CodeBlock lang="java">{`Set<Integer> seen = new HashSet<>();
seen.add(5);              // returns true (was new)
seen.add(5);              // returns false (already present)
seen.contains(5);         // true
seen.size();              // 1`}</CodeBlock>

        <Callout variant="info" title="The set-add return value is a power feature">
          <code>set.add(x)</code> returns <code>true</code> if x was new, <code>false</code> if it was already
          there. You can do the &quot;skip if already seen&quot; check in one line:{" "}
          <code>if (!seen.add(node)) continue;</code>. Saves a redundant <code>contains</code> + <code>add</code> pair.
        </Callout>

        <h3>LinkedHashSet — predictable iteration</h3>

        <p>
          Same operations as HashSet, plus iteration in insertion order. When you need both deduplication and a stable
          output ordering — &quot;keep the first occurrence of each word in input order&quot; — this is the one tool
          that does both in one pass.
        </p>

        <CodeBlock lang="java">{`Set<String> uniqueOrdered = new LinkedHashSet<>();
for (String w : words) uniqueOrdered.add(w);
// Iterating uniqueOrdered now yields each unique word in first-seen order.`}</CodeBlock>

        <h3>TreeSet — sorted unique elements with range queries</h3>

        <CodeBlock lang="java">{`TreeSet<Integer> scores = new TreeSet<>();
scores.add(80);
scores.add(50);
scores.add(95);
scores.first();              // 50
scores.last();               // 95
scores.ceiling(85);          // 95
scores.floor(85);            // 80
scores.subSet(60, 90);       // {80}`}</CodeBlock>

        <Callout variant="insight" title="TreeSet for the 'closest value' pattern">
          Many problems reduce to &quot;is there a value within K of x?&quot; — Contains Duplicate III, sliding
          window with tolerance, etc. TreeSet gives you <code>ceiling(x - k)</code> and <code>floor(x + k)</code>,
          each O(log n), so the whole problem becomes a sliding window of TreeSet inserts and range checks.
        </Callout>

        <h3>The classify drill</h3>

        <ClassifyChallenge
          title="Pick the collection"
          prompt="For each scenario, which container is the right default?"
          buckets={[
            { id: "arraylist", label: "ArrayList", color: "sky" },
            { id: "arraydeque", label: "ArrayDeque", color: "indigo" },
            { id: "hashmap", label: "HashMap", color: "emerald" },
            { id: "linkedhashmap", label: "LinkedHashMap", color: "amber" },
            { id: "treemap", label: "TreeMap", color: "rose" },
            { id: "treeset", label: "TreeSet", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Frequency count of words in a string.", answer: "hashmap", explanation: "Key→count, no order needed. HashMap with merge(word, 1, Integer::sum)." },
            { id: "2", label: "BFS frontier on a graph.", answer: "arraydeque", explanation: "FIFO queue with O(1) ends. ArrayDeque is the canonical choice — beats LinkedList on cache locality." },
            { id: "3", label: "LRU cache, capacity 100.", answer: "linkedhashmap", explanation: "LinkedHashMap with accessOrder=true and removeEldestEntry → 10-line LRU." },
            { id: "4", label: "Find the closest element to a target value among a dynamic set of numbers.", answer: "treeset", explanation: "ceiling(x) and floor(x), each O(log n). TreeSet is the textbook closest-value structure." },
            { id: "5", label: "DFS stack of grid coordinates.", answer: "arraydeque", explanation: "ArrayDeque as a stack — push/pop/peek all O(1). Faster than legacy Stack class." },
            { id: "6", label: "List of search results to render in order, where order is determined by an external ranker.", answer: "arraylist", explanation: "Indexable, ordered by insertion (the rank order). Standard List use case." },
            { id: "7", label: "'Next event after time T' lookup on a stream of timestamped events.", answer: "treemap", explanation: "TreeMap of timestamp→event. ceilingKey(T) returns the smallest timestamp ≥ T in O(log n) — the canonical sorted-map navigation query." },
            { id: "8", label: "Visited-page tracker that remembers, for each URL, the timestamp of first visit, iterated in first-visit order.", answer: "linkedhashmap", explanation: "Key→value (URL→timestamp), and you want iteration in insertion order — LinkedHashMap. If you only needed the URLs (no timestamp) the answer would be LinkedHashSet, but here the value matters." },
          ]}
        />

        <Callout variant="warn" title="The hashCode/equals contract — you must override both, together">
          <p>
            When you put a custom class into a HashSet/HashMap, you must override BOTH <code>equals</code> and{" "}
            <code>hashCode</code>. The contract: if two objects are equal by <code>equals</code>, they must have
            the same <code>hashCode</code>.
          </p>
          <p>
            Override one but not the other and you get phantom duplicates (two equal objects in different buckets)
            or missing keys (lookup hashes to a different bucket than where the entry was stored). IDE-generated
            implementations are fine; just don&apos;t skip one of them.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Comparable vs Comparator ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="ordering" title="I can sort by anything in one line" xp={25}>
      <section>
        <h2 id="ordering">Comparable vs Comparator</h2>

        <p>
          Sorted structures (<code>TreeMap</code>, <code>TreeSet</code>, <code>PriorityQueue</code>,{" "}
          <code>Arrays.sort</code>, <code>Collections.sort</code>) need a way to ask &quot;is A &lt; B?&quot;.
          Java provides two mechanisms.
        </p>

        <h3>Comparable — natural order, defined by the class itself</h3>

        <p>
          Implement <code>Comparable&lt;T&gt;</code> on your class and define <code>compareTo</code>. This is the
          class&apos;s <em>natural ordering</em> — what a sort gives you when no other rule is provided.
        </p>

        <CodeBlock lang="java">{`record Player(String name, int score) implements Comparable<Player> {
    @Override public int compareTo(Player other) {
        return Integer.compare(this.score, other.score);   // ascending by score
    }
}`}</CodeBlock>

        <p>
          Built-in types already have natural orderings: <code>Integer</code> ascending, <code>String</code>{" "}
          lexicographic, <code>LocalDate</code> chronological, etc. That&apos;s why <code>TreeSet&lt;Integer&gt;</code>{" "}
          works out of the box.
        </p>

        <h3>Comparator — external order, decided by the caller</h3>

        <p>
          When you want a different ordering than the natural one — or when the class doesn&apos;t implement
          Comparable — pass a <code>Comparator&lt;T&gt;</code>. Modern Java has lambda and method-reference forms
          that make these one-liners.
        </p>

        <CodeBlock lang="java">{`List<Player> players = ...;

// Sort by score ascending
players.sort(Comparator.comparingInt(Player::score));

// Sort by score DESCENDING
players.sort(Comparator.comparingInt(Player::score).reversed());

// Sort by score desc, name asc as tiebreak
players.sort(
    Comparator.comparingInt(Player::score).reversed()
        .thenComparing(Player::name)
);

// Min-heap by score
PriorityQueue<Player> minByScore = new PriorityQueue<>(
    Comparator.comparingInt(Player::score)
);

// Max-heap by score (reverse)
PriorityQueue<Player> maxByScore = new PriorityQueue<>(
    Comparator.comparingInt(Player::score).reversed()
);`}</CodeBlock>

        <Callout variant="warn" title="Don't write `(a, b) -> a.score - b.score` for ints">
          The subtract trick fails on overflow: when <code>a.score = Integer.MAX_VALUE</code> and
          <code>b.score = -1</code>, the subtraction overflows to a negative number — wrong order. Use
          <code>Integer.compare(a, b)</code> or <code>Comparator.comparingInt</code>; both are overflow-safe.
          This is one of the classic Java interview gotchas.
        </Callout>

        <h3>The chaining DSL</h3>

        <p>
          <code>Comparator</code>&apos;s static and default methods let you build a sort order declaratively:
        </p>

        <CodeBlock lang="java">{`Comparator.comparing(...)              // by a key extractor (returns Comparable)
Comparator.comparingInt(...)           // by an int key (no autoboxing)
Comparator.comparingLong(...)          // by a long key
Comparator.comparingDouble(...)        // by a double key
Comparator.naturalOrder()              // class's compareTo
Comparator.reverseOrder()              // class's compareTo, flipped
.reversed()                            // flip any comparator
.thenComparing(...)                    // tiebreak with another comparator
.nullsFirst(...) / .nullsLast(...)     // null handling`}</CodeBlock>

        <Callout variant="info" title="comparingInt vs comparing(::score)">
          <code>Comparator.comparing(Player::score)</code> autoboxes each int into Integer for the comparison —
          unnecessary allocation in a hot loop. <code>Comparator.comparingInt(Player::score)</code> uses a primitive
          int comparator, no boxing. On a tight sort loop, this is a measurable speedup. Habit: reach for the
          primitive variant when the key is <code>int</code>/<code>long</code>/<code>double</code>.
        </Callout>

        <h3>Reading the contract — the three return values</h3>

        <p>
          Both <code>Comparable.compareTo</code> and <code>Comparator.compare</code> return an int. The sign carries
          the meaning, not the magnitude:
        </p>

        <CodeBlock lang="plain">{`negative   →  this/a is BEFORE other/b   (a sorts earlier)
zero       →  equal in the ordering
positive   →  this/a is AFTER other/b    (a sorts later)`}</CodeBlock>

        <p>
          The contract requires the comparator to be <strong>antisymmetric</strong> (compare(a,b) and compare(b,a)
          have opposite signs) and <strong>transitive</strong> (if a&lt;b and b&lt;c then a&lt;c). Violating these
          can corrupt sort algorithms in subtle ways — always derive from <code>Integer.compare</code>,{" "}
          <code>Long.compare</code>, etc., and chain with the standard combinators.
        </p>

        <Quiz
          kind="Comparator check"
          question="Why is `(a, b) -> a.value - b.value` an unsafe comparator for ints?"
          options={[
            { label: "It doesn't compile.", explanation: "It compiles fine. The bug is at runtime, on edge inputs." },
            { label: "It overflows when a.value and b.value are far apart in opposite signs — e.g., MAX_VALUE - (-1) wraps to a negative int.", correct: true, explanation: "Right. Subtraction can overflow. Integer.compare(a, b) is the safe equivalent and the combinator Comparator.comparingInt(...) is what you actually want — it produces an overflow-safe comparator with one method call." },
            { label: "Lambdas can't be comparators.", explanation: "Lambdas can absolutely implement Comparator (it's a functional interface). The bug is the subtraction, not the lambda." },
            { label: "It's slow due to autoboxing.", explanation: "There's no boxing here — both operands are int. The bug is correctness, not speed." },
          ]}
        />

        <Quiz
          kind="Comparator check"
          question="You want a max-heap of Player objects, ordered by score (highest first). What's the right one-liner?"
          options={[
            { label: "new PriorityQueue<>(Comparator.comparingInt(Player::score));", explanation: "That's a min-heap by score (smallest first). PriorityQueue is naturally a min-heap; you need to reverse the comparator for max-heap behavior." },
            { label: "new PriorityQueue<>(Comparator.comparingInt(Player::score).reversed());", correct: true, explanation: "Right. Java's PriorityQueue is a min-heap. To make it a max-heap, give it a comparator that says 'higher comes first' — i.e., the reverse of natural ascending order. The .reversed() call does this in one method call." },
            { label: "new PriorityQueue<>((a, b) -> b.score - a.score);", explanation: "Subtraction-based comparators overflow on extreme inputs. The .reversed() form is overflow-safe and reads more clearly." },
            { label: "Collections.reverse(new PriorityQueue<>());", explanation: "Collections.reverse mutates the order of a List; it doesn't change a PriorityQueue's comparator. PriorityQueue ordering is fixed at construction." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="java-collections" id="final" title="I've completed Module 17 — and Phase 5!" xp={40} celebration="The Java Collections framework is no longer a forest of class names. You can pick the right tool, instantly. Phase 6 — algorithmic techniques — is the next stop.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="You're solving a problem that asks: 'For each query (lo, hi), return the count of stored numbers in [lo, hi].' Numbers are inserted dynamically. Pick the data structure."
          options={[
            { label: "HashMap<Integer, Integer> mapping number to count.", explanation: "HashMap can store the counts but can't answer 'how many keys are in [lo, hi]' without scanning every key — defeats the point." },
            { label: "ArrayList<Integer> with binary search per query.", explanation: "Workable if numbers were sorted... but ArrayList isn't kept sorted on insertion. You'd pay O(n) per insert to keep it sorted, then O(log n) per query." },
            { label: "TreeMap<Integer, Integer> with subMap(lo, hi+1) per query.", correct: true, explanation: "Right. TreeMap keeps keys sorted; subMap returns a view in O(log n) and you can sum the counts (or use a separate Fenwick tree for true O(log n) total). Insertion is O(log n). This is the canonical 'range queries on dynamic data' answer for an interview." },
            { label: "ArrayDeque<Integer>, scanning per query.", explanation: "ArrayDeque has no ordering or search. Linear scan per query and per insert is the worst possible answer." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Why does Modern Java code essentially never use the legacy `Stack` class?"
          options={[
            { label: "It's been removed in recent JDKs.", explanation: "It's still in the JDK for backwards compatibility. The reason to avoid it is technical, not availability." },
            { label: "It extends Vector (synchronized) and ArrayDeque is faster, unsynchronized, and recommended by the Collections framework Javadoc itself.", correct: true, explanation: "Right. Stack pays the synchronization cost of Vector with no benefit in single-threaded code. ArrayDeque has the same push/pop/peek API, no synchronization, better performance. The official Java docs explicitly recommend ArrayDeque over Stack." },
            { label: "Stack doesn't support generics.", explanation: "Stack<T> has been generic since Java 5 — that's not the problem." },
            { label: "Stack lacks a peek operation.", explanation: "Stack has peek(); the issue is that Stack inherits Vector's synchronization tax for no good reason." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You override `equals` on a custom Point class to compare by (x, y). You put Points into a HashSet and find that two equal Points are both stored. Why?"
          options={[
            { label: "HashSet doesn't dedupe.", explanation: "It does. The bug is in your contract." },
            { label: "You forgot to override hashCode. Equal objects MUST have equal hash codes — without that, HashSet maps them to different buckets and never compares them.", correct: true, explanation: "Right. The Object contract: a.equals(b) → a.hashCode() == b.hashCode(). HashSet looks up by hashCode first; if two equal objects hash to different buckets, the equals comparison is never even attempted. Override both, together. IDE-generated implementations are the safe path." },
            { label: "HashSet uses reference equality (==), not equals().", explanation: "HashSet calls equals() — but only after hashCode() places the lookup in the right bucket. Mismatched hashCode is what skips the equals comparison." },
            { label: "Point objects need to implement Comparable.", explanation: "Comparable is for sorted structures (TreeSet/TreeMap). HashSet uses hashCode and equals, not compareTo." },
          ]}
        />

        <PartRecap
          title="The decision framework you can now apply in 5 seconds"
          gist="Read the question, ask three questions: (1) am I storing pairs (Map) or values (List/Set/Queue)? (2) do I need order — insertion, sorted, or none? (3) do I need range queries? The answer pinpoints the right concrete class."
          points={[
            { takeaway: "Default: ArrayList, HashMap, HashSet, ArrayDeque.", detail: "These four cover ~70% of real code. Reach for them first; only deviate when you hit a specific feature gap." },
            { takeaway: "Need predictable iteration order? LinkedHashMap or LinkedHashSet.", detail: "Insertion order for free, with a few % memory overhead. Plus access-order mode for one-class LRU." },
            { takeaway: "Need keys sorted, or 'closest value' / 'next event after T'? TreeMap or TreeSet.", detail: "O(log n) ops with ceiling/floor/subMap. The right answer for any range or proximity query on dynamic data." },
            { takeaway: "Always declare with the interface, instantiate with the concrete.", detail: "Map<K,V> m = new HashMap<>();. Swap implementations with a one-line edit. Don't program against HashMap-specific methods unless you have to." },
            { takeaway: "Override equals AND hashCode together.", detail: "HashSet/HashMap break silently if you override only one. IDE-generated implementations are fine; just generate both." },
            { takeaway: "Comparator.comparingInt + .reversed() + .thenComparing() solve every sort question.", detail: "Avoid (a,b) -> a-b — it overflows. Use the chainable factory methods; they're overflow-safe and read declaratively." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 border border-cyan-200 dark:border-cyan-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 5 complete · Java Collections in Depth</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            One synthesis module ties Phases 2–4 together: every data structure you&apos;ve built (lists,
            stacks, queues, hashmaps, trees, heaps) maps to a concrete Collections class with known Big-O and
            specific use cases. You now have a 5-second decision framework for &quot;which container.&quot;
            Phase 6 — algorithmic techniques — is the next leap: two-pointers, sliding window, binary search,
            sorting, recursion, backtracking. The patterns that turn the data structures from Phases 1-5 into
            actual problem-solving moves.
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="java-collections" />
    </article>
  );
}
