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
  { id: "setup", title: "Why hashing — the array-indexing trick" },
  { id: "collisions", title: "Collisions and chaining" },
  { id: "internals", title: "Java's HashMap: load factor, treeify, resize" },
  { id: "contract", title: "The equals/hashCode contract" },
  { id: "project", title: "Project: build TinyHashMap + LeetCode" },
  { id: "final", title: "Final quiz" },
];

export default function HashmapsModule() {
  const mod = getModuleBySlug("hashmaps")!;

  // Mental model: key → hash → bucket index → entry.
  const hashFlow = `
flowchart LR
    K["key: 'Aditya'"] --> H["hash(key)<br/>= 0xA3F19C"]
    H --> M["index = hash &amp; (cap-1)<br/>= 4"]
    M --> B["bucket[4]"]
    B --> E["Entry('Aditya', 27)"]
    style K fill:#10b981,color:#fff,stroke:#047857
    style H fill:#fbbf24,color:#000,stroke:#d97706
    style M fill:#f59e0b,color:#fff,stroke:#b45309
    style B fill:#1e293b,color:#fff,stroke:#475569
    style E fill:#22c55e,color:#fff,stroke:#15803d
  `.trim();

  // Collision: two keys land in the same bucket → chained.
  const chaining = `
flowchart LR
    subgraph T["Backing array (cap = 8)"]
        direction TB
        B0["[0] —"]
        B1["[1] —"]
        B2["[2]"]
        B3["[3] —"]
        B4["[4]"]
        B5["[5] —"]
        B6["[6] —"]
        B7["[7] —"]
    end
    B2 --> N1["('cat', 1)"]
    B4 --> N2["('dog', 2)"] --> N3["('god', 3)"] --> N4["('act', 4)"]
    style B0 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style B1 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style B2 fill:#10b981,color:#fff,stroke:#047857
    style B3 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style B4 fill:#ef4444,color:#fff,stroke:#b91c1c
    style B5 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style B6 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style B7 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style N1 fill:#fbbf24,color:#000,stroke:#d97706
    style N2 fill:#fbbf24,color:#000,stroke:#d97706
    style N3 fill:#fbbf24,color:#000,stroke:#d97706
    style N4 fill:#fbbf24,color:#000,stroke:#d97706
  `.trim();

  // Resize doubles capacity and rehashes every entry.
  const resize = `
flowchart LR
    subgraph A["Before: cap=4, size=3, load=0.75"]
        direction TB
        A0["[0] (k1,v1)"]
        A1["[1] —"]
        A2["[2] (k2,v2) → (k3,v3)"]
        A3["[3] —"]
    end
    A -- "put(k4,v4) trips threshold" --> B
    subgraph B["After: cap=8, all entries rehashed"]
        direction TB
        B0["[0] (k1,v1)"]
        B1["[1] —"]
        B2["[2] (k2,v2)"]
        B3["[3] (k4,v4)"]
        B4["[4] —"]
        B5["[5] —"]
        B6["[6] (k3,v3)"]
        B7["[7] —"]
    end
    style A fill:#fef3c7,color:#000,stroke:#d97706
    style B fill:#dcfce7,color:#000,stroke:#15803d
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="hashmaps" />
      <ModuleProgress moduleSlug="hashmaps" checkpoints={CHECKPOINTS} />

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

      {/* ───────────────── Part 1 · Why hashing ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="setup" title="I know why hashing exists" xp={10} celebration="A hash function turns any key into an array index. That's the whole trick.">
      <section>
        <h2 id="setup">Welcome to Phase 3 — and the most useful data structure you&apos;ll learn</h2>

        <p>
          Phase 2 gave you the linear shapes — arrays, strings, lists, stacks, queues. They share one weakness:
          <strong> finding things by value is O(n)</strong>. To check whether the array contains 42, you scan it.
          Sorted arrays let you binary-search to O(log n), but only if you&apos;re willing to pay O(n log n) up front to
          sort, and only if the data doesn&apos;t change.
        </p>

        <p>
          A <strong>hash table</strong>{" "}says: what if lookup were just <em>array indexing</em>? An array gives you
          O(1) random access — <code>arr[i]</code> is one CPU instruction. The trick is turning a key (a string,
          an object, a tuple) into an index. That converter is called a <strong>hash function</strong>.
        </p>

        <Mermaid chart={hashFlow} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Key → hash code → bucket index → entry. Each step is O(1) on average. End-to-end O(1) lookup.
        </p>

        <h3>The contract</h3>
        <p>A hash table (sometimes &quot;hash map&quot; or &quot;dictionary&quot;) is a key→value store that promises:</p>
        <ul>
          <li><code>put(key, value)</code> — average O(1).</li>
          <li><code>get(key)</code> — average O(1). Returns the value or <code>null</code>.</li>
          <li><code>remove(key)</code> — average O(1).</li>
          <li><code>containsKey(key)</code> — average O(1).</li>
        </ul>
        <p>
          That word <strong>average</strong>{" "}is doing heavy lifting. Worst case is O(n) — and we&apos;ll see exactly
          when. But for sane keys with a sane hash function, the worst case basically never happens.
        </p>

        <h3>The dumbest possible hash table — direct addressing</h3>
        <p>
          Suppose your keys are integers in the range [0, 999]. You don&apos;t need a hash function at all — just use
          the key as the index:
        </p>

        <CodeBlock lang="java">{`int[] table = new int[1000];
table[42] = 99;          // put(42, 99)
int v = table[42];       // get(42) → 99`}</CodeBlock>

        <p>
          That&apos;s O(1). But it only works if (a) keys are bounded integers and (b) the range isn&apos;t huge. If
          you have only 50 keys but they&apos;re spread across 0..1,000,000, you&apos;ve allocated a million-slot array
          to hold 50 entries. <strong>Memory waste is the cost of direct addressing.</strong>
        </p>

        <h3>Hashing: squeeze any key into a small index range</h3>

        <p>
          A <strong>hash function</strong> <code>h(key)</code> maps any key (string, object, etc.) to a 32-bit or
          64-bit integer. We then take that integer mod the table size to get a bucket index:
        </p>

        <CodeBlock lang="java">{`int index = (h(key) & 0x7fffffff) % capacity;
// or, when capacity is a power of two (Java's choice):
int index = h(key) & (capacity - 1);`}</CodeBlock>

        <Callout variant="info" title="Why power-of-two capacities">
          <p>
            When <code>capacity</code> is a power of two, <code>x % capacity</code> equals <code>x &amp; (capacity - 1)</code>.
            Bitwise AND is faster than modulo, which is why Java&apos;s <code>HashMap</code> always rounds capacity up to
            a power of two.
          </p>
          <p>
            The <code>0x7fffffff</code> mask in the modulo version strips the sign bit so the index
            is non-negative — a quirk of Java&apos;s signed-integer hash codes.
          </p>
        </Callout>

        <h3>What makes a hash function &quot;good&quot;</h3>
        <ul>
          <li><strong>Deterministic.</strong> <code>h(x) == h(x)</code> across calls. (Otherwise you&apos;d never find what you stored.)</li>
          <li><strong>Uniform.</strong>{" "}Spreads outputs evenly across the integer range. Bad hashes cluster.</li>
          <li><strong>Fast.</strong>{" "}The hash is computed on every put/get/remove. If <code>h</code> is O(k) for a key of length k, your &quot;O(1)&quot; is really O(k).</li>
          <li><strong>Avalanche-y.</strong>{" "}Tiny input changes flip many output bits, scattering similar keys.</li>
        </ul>

        <p>
          Notice: <strong>collisions are inevitable</strong>. You&apos;re mapping an infinite key space (any string) into
          a finite index space ([0, capacity)). By the pigeonhole principle, two different keys will sometimes hash
          to the same bucket. The whole rest of this module is about how to handle that gracefully.
        </p>

        <Quiz
          question="Why is `int index = hash % capacity` not enough on its own in Java?"
          options={[
            { label: "Modulo is too slow.", explanation: "Modulo is fine — Java uses bitwise AND only as a perf optimization for power-of-two capacities. The deeper issue is signedness." },
            { label: "Java's hashCode() returns a signed int, so hash can be negative — `negative % positive` can give a negative index.", correct: true, explanation: "Right. `Integer.MIN_VALUE % 16` is 0 in Java, but in general `-5 % 16` is -5 — a negative array index throws. The fix is masking the sign bit (`hash & 0x7fffffff`) or using bitwise AND with `cap - 1`, which is unsigned." },
            { label: "Modulo doesn't distribute evenly.", explanation: "Modulo distributes fine if the input is uniform. The issue is signed-integer arithmetic in Java." },
            { label: "Capacity has to be prime.", explanation: "Some hash table designs prefer prime capacities (open addressing); chained hash tables work fine with power-of-two capacities. Not the issue here." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Collisions ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="collisions" title="I can explain chaining and load factor" xp={15} celebration="Two keys, one bucket — chain them. As the table fills, chains lengthen. That's where load factor comes in.">
      <section>
        <h2 id="collisions">Collisions: when two keys want the same bucket</h2>

        <p>
          Two strings &quot;dog&quot; and &quot;god&quot; might hash to wildly different integers, but after{" "}
          <code>% capacity</code> they can land in the same bucket. What now? You can&apos;t overwrite — that would
          lose data. You need a way for one bucket to hold multiple entries.
        </p>

        <p>The two main strategies are <strong>separate chaining</strong>{" "}and <strong>open addressing</strong>.</p>

        <h3>Separate chaining (Java&apos;s choice)</h3>
        <p>
          Each bucket holds a list of entries. On collision, append to the list. On <code>get</code>, walk the list
          and compare keys with <code>.equals</code>.
        </p>

        <Mermaid chart={chaining} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Three keys collided in bucket [4]. The bucket holds them in a chain. Lookup walks the chain.
        </p>

        <CodeBlock lang="java">{`// Chained-bucket get, sketched:
V get(K key) {
    int i = hash(key) & (cap - 1);
    Node<K, V> node = buckets[i];
    while (node != null) {
        if (node.key.equals(key)) return node.value;
        node = node.next;
    }
    return null;
}`}</CodeBlock>

        <p>
          If the hash function is uniform and you have <em>n</em>{" "}entries in <em>m</em>{" "}buckets, the expected chain
          length is <code>n / m</code>. That ratio has a name: the <strong>load factor</strong> α = n/m. Lookup
          cost is O(1 + α) on average.
        </p>

        <Callout variant="info" title="Open addressing — the alternative">
          <p>
            Instead of chains, open addressing stores entries directly in the array and probes (linear, quadratic,
            double-hashing) for the next free slot when the target is taken. It has better cache behavior (no pointer
            chasing) but suffers from <em>clustering</em>{" "}and is fiddlier to delete from.
          </p>
          <p>
            Python&apos;s <code>dict</code> and Go&apos;s <code>map</code> use variants of open addressing. Java&apos;s{" "}
            <code>HashMap</code> uses chaining. Both are O(1) average. We&apos;ll focus on chaining since that&apos;s
            what you&apos;ll meet in Java.
          </p>
        </Callout>

        <h3>Why load factor matters</h3>

        <p>
          As you keep inserting without growing the table, α grows. Chain length grows with α. Lookup degrades
          from O(1) to O(α) — and at α = 10 every lookup walks ten entries. The fix is to <strong>resize</strong>{" "}
          (double the capacity and rehash everything) once α crosses some threshold.
        </p>

        <WorkedExample
          title="Why is HashMap O(1) average but O(n) worst case?"
          steps={[
            { title: "Average case: uniform hashes", body: "If hash(k) is uniformly distributed, each bucket gets n/m entries on average. With a load-factor cap of 0.75, average chain length stays under 1. get/put walks at most ~1 node. That's O(1)." },
            { title: "Worst case: pathological hashes", body: "Suppose every key hashes to 0. Every entry chains in bucket 0. The 'hash table' becomes a linked list. get/put is O(n). Same with adversarial input — if an attacker can pick keys that all collide, they degrade your map." },
            { title: "Java's Trojan-horse defense", body: "Once any single chain exceeds 8 entries (and capacity is at least 64), Java converts that chain to a balanced tree (red-black). Tree lookup is O(log n), so the worst case becomes O(log n), not O(n). This is called 'treeification'." },
            { title: "Why O(1) is still the right number to remember", body: "For non-adversarial keys with a decent hashCode, you'll basically never see a chain longer than 1 or 2. Constants are small. In every realistic problem, treat HashMap as O(1) — but know that it isn't a hard guarantee." },
          ]}
        />

        <h3>How big does the table get?</h3>

        <p>
          Resize doubles capacity, so the sequence is <code>16, 32, 64, 128, ...</code>. Each resize is O(n) — every
          entry has to be re-bucketed under the new capacity. But resizes happen geometrically less often as the
          map grows, so the <strong>amortized</strong>{" "}cost of <code>put</code> is still O(1) — exactly the
          ArrayList argument from Module 3.
        </p>

        <Mermaid chart={resize} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          When size / capacity crosses the load-factor threshold (default 0.75), the table doubles. Every entry is rehashed into the new array.
        </p>

        <Quiz
          question="A hash table has capacity 16, load factor 0.75, and currently holds 13 entries. You call `put` with a new key. What happens?"
          options={[
            { label: "The new entry goes into its bucket. No resize, since 13 < 16.", explanation: "Resize fires when size > capacity × loadFactor = 16 × 0.75 = 12. Already triggered." },
            { label: "Capacity doubles to 32, all 14 entries (including the new one) are rehashed into 32 buckets.", correct: true, explanation: "Right. 13 already exceeded the 12-entry threshold (so the 13th put already resized — depends on implementation order). Adding the 14th, the table is at capacity 32. Each entry's bucket index changes because `hash & (cap - 1)` uses different bits." },
            { label: "Capacity stays at 16; chains just get longer.", explanation: "That would let load factor grow unbounded. The whole point of resize is to keep average chain length below the threshold." },
            { label: "The new entry replaces the most recently added entry.", explanation: "Hash maps don't evict — they grow. (LinkedHashMap with access-order can be configured as an LRU cache, but that's a different mode.)" },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Java internals ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="internals" title="I know how java.util.HashMap actually works" xp={15} celebration="Power-of-two capacity, treeify at 8, resize at 0.75 — the three magic numbers.">
      <section>
        <h2 id="internals">Inside <code>java.util.HashMap</code></h2>

        <p>
          We&apos;ve been talking about hash tables in the abstract. Now let&apos;s pin down exactly what Java&apos;s
          standard <code>HashMap</code> does. You&apos;ll use it constantly; understanding the internals makes its
          performance characteristics (and weird edge cases) make sense.
        </p>

        <h3>The fields you should know</h3>

        <CodeBlock lang="java">{`// java.util.HashMap (paraphrased)
transient Node<K,V>[] table;        // backing array; lazy-init at first put
transient int size;                  // number of key-value pairs
int threshold;                       // capacity * loadFactor
final float loadFactor;              // default 0.75

static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;   // 16
static final int MAXIMUM_CAPACITY = 1 << 30;          // ~1B
static final float DEFAULT_LOAD_FACTOR = 0.75f;
static final int TREEIFY_THRESHOLD = 8;               // chain → tree
static final int UNTREEIFY_THRESHOLD = 6;             // tree → chain
static final int MIN_TREEIFY_CAPACITY = 64;           // resize first if smaller`}</CodeBlock>

        <h3>The hash spreader</h3>

        <p>
          Java doesn&apos;t just use <code>key.hashCode()</code> directly. It runs it through a small &quot;spreader&quot;
          that XORs the high 16 bits into the low 16:
        </p>

        <CodeBlock lang="java">{`static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}`}</CodeBlock>

        <p>
          Why? Because <code>index = h &amp; (cap - 1)</code> only uses the low <code>log2(cap)</code> bits of the
          hash. If your hash codes differ only in their high bits — which happens for things like long-derived
          hashes or sequential-id hashes — they&apos;d all collide. XORing the high half into the low half mixes
          them in. It&apos;s cheap and it dramatically reduces collisions for poorly distributed hash codes.
        </p>

        <h3>Treeification: the O(log n) safety net</h3>

        <p>
          When a single bucket&apos;s chain reaches 8 entries (and the table itself is at least 64 buckets — otherwise
          it just resizes), HashMap converts that chain to a red-black tree. Each node now uses keys&apos;{" "}
          <code>compareTo</code> (if they&apos;re <code>Comparable</code>) or class-name comparison as a tie-breaker.
          Lookups in that bucket become O(log k) instead of O(k).
        </p>

        <p>
          This was added in Java 8 specifically to defend against hash-collision DoS attacks. Before Java 8, a
          malicious caller submitting many keys that hashed identically could degrade your <code>HashMap</code> to
          O(n) per operation, hanging the JVM. Treeification caps the worst case at O(log n).
        </p>

        <Callout variant="info" title="You'll never see treeification fire on real data">
          <p>
            With a decent <code>hashCode</code> and a load factor of 0.75, the probability of any chain reaching 8 is
            astronomically small (a Poisson tail — the JDK source comments quote ~1 in 100 million).
          </p>
          <p>
            Treeification is a safety net for adversarial input, not a normal-mode performance feature. If your map
            is treeifying, either your <code>hashCode</code> is broken or someone is attacking you.
          </p>
        </Callout>

        <h3>Resize, in detail</h3>

        <p>
          When <code>size &gt; threshold</code>, Java doubles the table. The clever bit: with power-of-two
          capacities, every entry goes to <em>either</em>{" "}its original index <em>or</em>{" "}that index plus the old
          capacity, depending on a single high bit. So Java doesn&apos;t even rehash the keys — it just splits each
          old chain into two new chains based on that bit. This makes resize roughly 2× faster than a naive rehash.
        </p>

        <CodeBlock lang="java">{`// Sketch of the resize trick:
//   oldCap = 16,  newCap = 32
//   For each entry e in oldTable[j]:
//     if ((e.hash & oldCap) == 0) → goes to newTable[j]
//     else                         → goes to newTable[j + oldCap]`}</CodeBlock>

        <h3>Iteration order: not what you think</h3>

        <p>
          <code>HashMap</code> iteration order is &quot;the order entries happen to live in the buckets&quot; —
          essentially arbitrary, and it can change after a resize. <strong>Never rely on iteration order.</strong>{" "}
          If you need insertion order, use <code>LinkedHashMap</code>. If you need sorted-key order, use{" "}
          <code>TreeMap</code> (which is a red-black tree, not a hash table — Module 12).
        </p>

        <Quiz
          question="You construct `new HashMap&lt;&gt;()` and immediately call `.put(...)` 1,000 times with random String keys. How many resizes happen?"
          options={[
            { label: "Zero — initial capacity is 1024.", explanation: "Default initial capacity is 16, not 1024." },
            { label: "About 7 — capacity grows 16 → 32 → 64 → ... → 2048, doubling each time, until 2048 × 0.75 = 1536 ≥ 1000.", correct: true, explanation: "Right. Thresholds are 12, 24, 48, 96, 192, 384, 768, 1536. We blow past the first seven adding 1000 entries; the 8th (capacity 2048) holds. Total work: ~16 + 32 + ... + 1024 ≈ 2n entries copied. That's still O(n) amortized — but you can avoid all of it by passing initialCapacity to the constructor." },
            { label: "1,000 — every put resizes.", explanation: "Resize is triggered only when size crosses threshold, not on every put." },
            { label: "About 10 — log₂(1000).", explanation: "Close, but starting from capacity 16 not 1, so the count is fewer. log₂(1000/16) ≈ 6, plus the one that fires at the threshold." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · equals/hashCode contract ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="contract" title="I understand the equals/hashCode contract" xp={15} celebration="Two equal objects must have equal hash codes. Break that and HashMap silently corrupts.">
      <section>
        <h2 id="contract">The <code>equals</code> / <code>hashCode</code> contract — and why it matters</h2>

        <p>
          So far we&apos;ve treated keys as opaque. In Java, <code>HashMap</code> calls two methods on every key:{" "}
          <code>hashCode()</code> to find the bucket, and <code>equals()</code> to compare against entries already
          in that bucket. <strong>If those two methods disagree, your map breaks.</strong>
        </p>

        <h3>The contract, exactly as stated by Java</h3>

        <PartRecap
          title="The contract"
          gist="Three rules. Memorize these — every other HashMap bug is a violation of one of them."
          points={[
            { takeaway: "If a.equals(b), then a.hashCode() == b.hashCode().", detail: "The forward direction. Two objects considered equal must hash to the same bucket — otherwise the second one would go missing on lookup." },
            { takeaway: "If a.hashCode() == b.hashCode(), it does NOT mean a.equals(b).", detail: "Hashes can collide. equals is the source of truth; hashCode is just a routing hint. The map walks the bucket comparing with equals." },
            { takeaway: "hashCode must be consistent for the lifetime of the object — at least, while it's a map key.", detail: "If a key's hashCode changes after insertion (e.g. you mutated a field that hashCode reads), the entry is now in the wrong bucket. The map can't find it. Worse: you can iterate and see it, but get(key) returns null. This is the #1 HashMap footgun." },
          ]}
        />

        <h3>Forgetting <code>hashCode</code> — the silent disaster</h3>

        <CodeBlock lang="java">{`// BUG: overrides equals but not hashCode
class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override public boolean equals(Object o) {
        if (!(o instanceof Point p)) return false;
        return p.x == x && p.y == y;
    }
    // hashCode() inherited from Object → identity-based!
}

Map<Point, String> labels = new HashMap<>();
labels.put(new Point(1, 2), "origin-ish");
String s = labels.get(new Point(1, 2));   // → null !`}</CodeBlock>

        <p>
          The two <code>Point(1, 2)</code> instances are <code>equals</code> but have different identity-based
          hash codes. They hash to different buckets. <code>get</code> looks in the wrong bucket and finds nothing.
          The compiler can&apos;t catch this — it&apos;s a runtime correctness bug.
        </p>

        <Callout variant="warn" title="The fix is one line">
          <p>
            Java has <code>Objects.hash(...)</code> which combines a tuple of fields into a hash.
          </p>
          <p>
            Or use a record: records auto-generate <code>equals</code>, <code>hashCode</code>, and <code>toString</code>{" "}
            from the components. <code>record Point(int x, int y) {}</code> gets it right by default.
          </p>
        </Callout>

        <h3>Mutable keys — the second silent disaster</h3>

        <CodeBlock lang="java">{`Set<List<Integer>> seen = new HashSet<>();
List<Integer> a = new ArrayList<>(List.of(1, 2, 3));
seen.add(a);
System.out.println(seen.contains(a));  // true

a.add(4);                                // mutate
System.out.println(seen.contains(a));  // probably false!
                                        // a's hashCode changed; lookup
                                        // goes to a different bucket`}</CodeBlock>

        <p>
          <strong>Rule: never mutate a key after putting it in a hash-based collection.</strong>{" "}If you need
          mutable-feeling keys, copy them into immutable form (e.g. <code>List.copyOf</code>, or a record) before
          inserting.
        </p>

        <h3>Designing a good <code>hashCode</code></h3>

        <p>The standard recipe — and what records and most IDE generators produce — is:</p>

        <CodeBlock lang="java">{`@Override
public int hashCode() {
    return Objects.hash(field1, field2, field3);
}`}</CodeBlock>

        <p>
          Under the hood that uses <code>Arrays.hashCode</code> with a 31-multiplier mix:{" "}
          <code>h = 31 * h + field.hashCode()</code>. The constant 31 is an odd prime that compiles to a fast
          shift-and-subtract. Combined with Java&apos;s spreader, this gives you a uniform-enough distribution for
          almost any compound key.
        </p>

        <Callout variant="warn" title="Don't get cute">
          <p>
            <code>hashCode</code> just needs to be fast, deterministic, and reasonably uniform. It does{" "}
            <strong>not</strong>{" "}need to be cryptographic.
          </p>
          <p>
            Don&apos;t reach for SHA-256. <code>Objects.hash(...)</code> is right 95% of the time. Profile before
            optimizing.
          </p>
        </Callout>

        <h3>Why all of this lives in this module</h3>

        <p>
          Hash tables show up everywhere — <code>HashMap</code>, <code>HashSet</code>, <code>LinkedHashMap</code>,
          <code>ConcurrentHashMap</code>, the implementation of <code>Set.of(...)</code>, dedup of <code>distinct()</code> in streams,
          memoization caches, deduplication in collectors. Every one of those calls <code>hashCode</code> and
          <code>equals</code> on your keys. Get the contract wrong once, and that bug ripples everywhere.
        </p>

        <ClassifyChallenge
          title="Will this work as a HashMap key?"
          prompt="For each key candidate, decide whether it's safe to put into a HashMap as a key, and recover via get()."
          buckets={[
            { id: "safe", label: "Safe to use as a key", color: "emerald" },
            { id: "broken", label: "Broken — will fail or be fragile", color: "rose" },
          ]}
          items={[
            { id: "string", label: "java.lang.String", answer: "safe", explanation: "Immutable. equals + hashCode are well-defined and content-based. The canonical key type." },
            { id: "integer", label: "java.lang.Integer (boxed)", answer: "safe", explanation: "Immutable, content-based. Identical integers from the cache (-128..127) even share identity." },
            { id: "record", label: "A Java record with primitive components", answer: "safe", explanation: "Records auto-generate value-based equals + hashCode from the components. Immutable by default." },
            { id: "arraylist", label: "ArrayList<Integer> that you keep modifying", answer: "broken", explanation: "List.equals/hashCode are content-based. Mutating after insertion changes the hashCode → entry is now in the wrong bucket. Get returns null." },
            { id: "noEquals", label: "A class that overrides hashCode but not equals", answer: "broken", explanation: "Two 'equal-by-content' instances will collide in the same bucket but never match — they're !equals. get() returns null." },
            { id: "noHash", label: "A class that overrides equals but not hashCode", answer: "broken", explanation: "Identity-based hashCodes (default) + content-based equals = entries scattered across buckets. The classic Point bug." },
            { id: "mutableField", label: "A POJO whose hashCode reads a field that callers mutate", answer: "broken", explanation: "Same as the ArrayList case — mutation after insertion silently corrupts the map." },
            { id: "enum", label: "An enum constant", answer: "safe", explanation: "Enums are singletons; identity equality ≡ value equality. Object's default hashCode is fine, and predictable per JVM." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="project" title="I built a TinyHashMap and solved the warm-ups" xp={25} manual manualLabel="Project & LeetCode complete" celebration="You wrote a chained-bucket hash map and saw the load-factor knob in action.">
      <section>
        <h2 id="project">Project: <code>TinyHashMap</code> + LeetCode warm-ups</h2>

        <p>
          We&apos;ll write a chained-bucket hash map from scratch — small enough to hold in your head, big enough to
          show the moving parts: hash spreader, bucket array, chain walk, resize, load factor.
        </p>

        <h3>Part A — TinyHashMap&lt;K, V&gt;</h3>

        <CodeBlock lang="java">{`public class TinyHashMap<K, V> {

    private static final int DEFAULT_CAPACITY = 16;
    private static final float LOAD_FACTOR = 0.75f;

    private static class Node<K, V> {
        final int hash;
        final K key;
        V value;
        Node<K, V> next;

        Node(int hash, K key, V value, Node<K, V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }

    private Node<K, V>[] buckets;
    private int size;
    private int threshold;

    @SuppressWarnings("unchecked")
    public TinyHashMap() {
        this.buckets = (Node<K, V>[]) new Node[DEFAULT_CAPACITY];
        this.threshold = (int) (DEFAULT_CAPACITY * LOAD_FACTOR);
    }

    /** Spread the high bits into the low bits, like Java's HashMap does. */
    private static int spread(Object key) {
        if (key == null) return 0;
        int h = key.hashCode();
        return h ^ (h >>> 16);
    }

    private int indexFor(int hash) {
        return hash & (buckets.length - 1);
    }

    public V get(Object key) {
        int h = spread(key);
        for (Node<K, V> n = buckets[indexFor(h)]; n != null; n = n.next) {
            if (n.hash == h && (n.key == key || (n.key != null && n.key.equals(key)))) {
                return n.value;
            }
        }
        return null;
    }

    public V put(K key, V value) {
        int h = spread(key);
        int i = indexFor(h);
        for (Node<K, V> n = buckets[i]; n != null; n = n.next) {
            if (n.hash == h && (n.key == key || (n.key != null && n.key.equals(key)))) {
                V old = n.value;
                n.value = value;
                return old;                       // replace, no size change
            }
        }
        // Not found — prepend new node (O(1)).
        buckets[i] = new Node<>(h, key, value, buckets[i]);
        size++;
        if (size > threshold) resize();
        return null;
    }

    public V remove(Object key) {
        int h = spread(key);
        int i = indexFor(h);
        Node<K, V> prev = null;
        for (Node<K, V> n = buckets[i]; n != null; prev = n, n = n.next) {
            if (n.hash == h && (n.key == key || (n.key != null && n.key.equals(key)))) {
                if (prev == null) buckets[i] = n.next;
                else              prev.next = n.next;
                size--;
                return n.value;
            }
        }
        return null;
    }

    public boolean containsKey(Object key) {
        // Slight redundancy with get() — if get() can return null legitimately,
        // we'd need a sentinel. For simplicity, we say null values aren't allowed.
        return get(key) != null;
    }

    public int size() { return size; }
    public boolean isEmpty() { return size == 0; }

    @SuppressWarnings("unchecked")
    private void resize() {
        int newCap = buckets.length << 1;          // double
        Node<K, V>[] newBuckets = (Node<K, V>[]) new Node[newCap];
        for (Node<K, V> head : buckets) {
            for (Node<K, V> n = head; n != null; ) {
                Node<K, V> next = n.next;
                int i = n.hash & (newCap - 1);
                n.next = newBuckets[i];
                newBuckets[i] = n;
                n = next;
            }
        }
        this.buckets = newBuckets;
        this.threshold = (int) (newCap * LOAD_FACTOR);
    }
}`}</CodeBlock>

        <p>
          That&apos;s a real hash map. Test it with a few <code>String</code> keys, an integer or two, and a record
          to convince yourself the chain walk works. Then break it: pass a class with a constant hashCode (always
          returns 0) and watch chain length grow with size while the table refuses to resize buckets — the load
          factor still fires, but every entry remains in bucket 0. That&apos;s the worst case.
        </p>

        <h3>Part B — LeetCode warm-ups</h3>

        <ol>
          <li>
            <strong>LC 1 · Two Sum</strong> (Easy). One-pass: as you scan, ask the map &quot;have I seen{" "}
            <code>target - x</code>?&quot; If yes, return both indices; otherwise put <code>x → i</code> and keep
            going. O(n) time, O(n) space — a hash map turns the brute-force O(n²) scan into a single pass.
          </li>
          <li>
            <strong>LC 217 · Contains Duplicate</strong> (Easy). Walk the array; track seen values in a{" "}
            <code>HashSet</code>. Return true on the first repeat. The canonical &quot;use a hash set for O(1)
            membership&quot; problem.
          </li>
          <li>
            <strong>LC 49 · Group Anagrams</strong> (Medium). For each string, compute a canonical key (sorted
            characters, or a 26-int frequency tuple). Group into a <code>Map&lt;String, List&lt;String&gt;&gt;</code>.
            The lesson: the right key turns a hard problem trivial.
          </li>
        </ol>

        <Callout variant="insight" title="What to take away">
          <p>
            The pattern across all three is the same: <em>can I rephrase this as &quot;have I seen X before?&quot;</em>{" "}
            If yes, a hash table makes it O(n).
          </p>
          <p>
            Whenever you catch yourself doing a nested loop over the same array, try that rephrasing first.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final quiz ───────────────── */}
      <Checkpoint moduleSlug="hashmaps" id="final" title="I've completed Module 9" xp={20} celebration="Hashing demystified. Sets and frequency counting are next, and they're mostly applied HashMap.">
      <section>
        <h2 id="final">Final check</h2>

        <Quiz
          question="You insert 1,000,000 entries into a default-sized HashMap. About how many total entry-copies happen across all the resizes?"
          options={[
            { label: "About 1,000,000 — each entry is placed once.", explanation: "That ignores resizes. Each resize re-copies every existing entry." },
            { label: "About 2,000,000 — geometric series 16 + 32 + ... + 1,048,576 sums to ~2 × the final size.", correct: true, explanation: "Right. Each doubling rehashes everything currently in the map. The total is 16 + 32 + 64 + ... + ~2^20, a geometric sum that's roughly 2× the final size. That's why HashMap.put is amortized O(1) — the same argument as ArrayList in Module 3." },
            { label: "About 20,000,000 — log₂(n) per entry.", explanation: "Each entry is copied at most log₂(n / 16) times across resizes, but the total work across all entries sums geometrically, not linearly." },
            { label: "Quadratic — about 10¹².", explanation: "That would be the cost if you rebuilt the entire table on every put. Doubling makes it linear." },
          ]}
        />

        <Quiz
          question="A teammate writes a class `User { long id; String name; }` and overrides `equals` to compare ids only — but doesn't override `hashCode`. They put 1,000 distinct users into a HashSet, then call `set.contains(new User(id=42, name='ignored'))` for an id that's in the set. What happens?"
          options={[
            { label: "Returns true — equals returns true on a matching id.", explanation: "equals is consulted only after hashCode picks a bucket. If hashCode picks the wrong bucket, equals never gets called." },
            { label: "Returns false — the new User has a different (identity-based) hashCode, lands in a different bucket, and the existing User in the matching-id bucket is never compared.", correct: true, explanation: "Right. This is the classic 'broke the contract' bug. Two objects that are equals must have the same hashCode. Without overriding hashCode, two new User instances with the same id are still in different buckets. The fix is `@Override public int hashCode() { return Long.hashCode(id); }` — or use a record." },
            { label: "Throws IllegalStateException at insert time.", explanation: "There's no runtime check. Java trusts you on the contract." },
            { label: "Sometimes true, sometimes false, depending on bucket layout.", explanation: "It's deterministically false for any User whose identity wasn't already in the set. The bucket-assignment is determined by the (broken) hashCode, not by chance." },
          ]}
        />

        <Quiz
          question="When does Java's HashMap actually convert a chain to a tree?"
          options={[
            { label: "When size exceeds 8.", explanation: "Treeification is per-bucket, not table-wide." },
            { label: "When any bucket's chain reaches 8 entries AND the table has at least 64 buckets; otherwise it just resizes.", correct: true, explanation: "Right. If the table is small (cap < 64) and a chain hits 8, that's almost certainly a 'too small, not bad hashes' problem — resize fixes it cheaper. Only at cap ≥ 64 does it commit to a tree." },
            { label: "When load factor crosses 0.9.", explanation: "Load factor triggers resize, not treeification. The two are independent." },
            { label: "Never — that's only true of ConcurrentHashMap.", explanation: "Both HashMap and ConcurrentHashMap treeify, since Java 8." },
          ]}
        />
        <div className="my-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 p-8 text-white shadow-xl">
          <h3 className="text-2xl font-bold mt-0 mb-2 text-white">Module 9 complete</h3>
          <p className="text-emerald-50 mb-4">
            Hashing is the single most useful idea in this course. The next module — sets — is the same machinery
            reframed as &quot;does X exist?&quot; with a frequency-counting twist that solves a surprising number
            of interview problems.
          </p>
          <Link
            href="/courses/dsa/modules/sets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-emerald-700 font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Next: Sets &amp; frequency counting →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="hashmaps" />
    </article>
  );
}
