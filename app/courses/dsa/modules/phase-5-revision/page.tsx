import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";

// Pure revision module — no Checkpoints, no XP gates. Phase 5 is one module
// long (the Collections deep dive), so the revision is denser per page: a
// single map of the entire Collections framework you can re-read in 15 minutes.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase5RevisionModule() {
  const mod = getModuleBySlug("phase-5-revision")!;

  // Full Collections hierarchy — same shape as the source module but rendered
  // here as the spine of the revision card. Map is deliberately separate from
  // Collection because Map<K,V> does NOT extend Collection<T>.
  const hierarchyChart = `
flowchart TB
    Iterable["Iterable&lt;T&gt;"]
    Collection["Collection&lt;T&gt;"]
    List["List&lt;T&gt;"]
    Set["Set&lt;T&gt;"]
    Queue["Queue&lt;T&gt;"]
    Deque["Deque&lt;T&gt;"]
    Map["Map&lt;K,V&gt;<br/>(NOT a Collection)"]

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
    Map --> ConcurrentHashMap["ConcurrentHashMap"]

    style Iterable fill:#0e7490,color:#fff,stroke:#0891b2
    style Collection fill:#0891b2,color:#fff
    style Map fill:#7c3aed,color:#fff
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
    style ConcurrentHashMap fill:#c4b5fd,color:#000
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 5 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 5 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The entire Java Collections Framework — hierarchy, Big-O, ordering, contracts, thread-safety — compressed to one reference card.
        </p>
        <ModuleProgress moduleSlug="phase-5-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Phase 5 is one module long: the <Link href="/courses/dsa/modules/java-collections" className="text-cyan-600 hover:underline">Java Collections Framework deep dive</Link>. That makes this revision card different from Phase 1&apos;s — instead of consolidating three modules, we&apos;re going <em>deeper</em> on one. The goal is to lock in the <strong>pick-the-right-collection</strong> mental model: hierarchy, Big-O, ordering rules, the <code>equals/hashCode</code> contract, <code>Comparable</code> vs <code>Comparator</code>, and the thread-safety options.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          If anything here looks unfamiliar, the deep dive is one click away. Otherwise: this is the page you re-read before an interview, before a code review, before you reach for <code>new ArrayList&lt;&gt;()</code> on autopilot.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — The full Collections hierarchy */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. The full Collections hierarchy</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Sketch this from memory. <code>Iterable</code> at the top; <code>Map</code> deliberately off to the side because it is <em>not</em> a <code>Collection</code>.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={hierarchyChart} />
        </div>

        <Callout variant="warn" title="Map is not a Collection">
          <code>Map&lt;K,V&gt;</code> sits in its own subtree of <code>java.util</code>. You cannot pass a <code>HashMap</code> where a <code>Collection</code> is expected. You <em>can</em> get collection-views from it: <code>map.keySet()</code>, <code>map.values()</code>, <code>map.entrySet()</code>. That is the bridge.
        </Callout>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mt-4">
          <li><code>List</code> — ordered, indexed, allows duplicates. <code>ArrayList</code> (array-backed) and <code>LinkedList</code> (doubly-linked).</li>
          <li><code>Set</code> — no duplicates. <code>HashSet</code> (no order), <code>LinkedHashSet</code> (insertion order), <code>TreeSet</code> (sorted).</li>
          <li><code>Queue</code> / <code>Deque</code> — FIFO / double-ended. <code>ArrayDeque</code> is the modern default; <code>PriorityQueue</code> is a binary heap.</li>
          <li><code>Map</code> — key→value. <code>HashMap</code>, <code>LinkedHashMap</code>, <code>TreeMap</code>, <code>ConcurrentHashMap</code>.</li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/java-collections" className="text-cyan-600 hover:underline">Module 21 — Java Collections Framework deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — The complete Big-O table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. The complete Big-O table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every implementation you&apos;ll see in production code. Eleven rows. The <em>Key gotcha</em> column is what separates a junior answer from a senior one.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Collection</th>
                <th className="px-4 py-3 font-semibold">Access</th>
                <th className="px-4 py-3 font-semibold">Search</th>
                <th className="px-4 py-3 font-semibold">Insert</th>
                <th className="px-4 py-3 font-semibold">Delete</th>
                <th className="px-4 py-3 font-semibold">Key gotcha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayList</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)*</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized add-at-end. Insert/delete in middle is O(n) because of the shift.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">LinkedList</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">O(1) insert/delete <em>given a node reference</em>. <code>list.add(i, x)</code> is O(n) because it walks to position <code>i</code> first.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">HashMap</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg*</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized — rare rehash is O(n). Java 8+ tree-bins make worst-case-per-bucket O(log n) instead of O(n).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">LinkedHashMap</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">HashMap + doubly-linked list threading entries in insertion order. Iteration is O(n) and ordered. Pay for the linked list in memory.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">TreeMap</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Red-Black tree. Slower than HashMap, but supports <code>firstKey</code>, <code>floorKey</code>, <code>ceilingKey</code>, <code>subMap</code> — range queries.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">HashSet</td>
                <td className="px-4 py-3 text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Backed by HashMap. No indexed access. Same equals/hashCode rules.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">LinkedHashSet</td>
                <td className="px-4 py-3 text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 text-emerald-600">O(1) avg</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Backed by LinkedHashMap. Insertion-order iteration.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">TreeSet</td>
                <td className="px-4 py-3 text-slate-400">—</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Backed by TreeMap. Sorted iteration, range queries.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayDeque</td>
                <td className="px-4 py-3 text-emerald-600">O(1) ends</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* ends</td>
                <td className="px-4 py-3 text-emerald-600">O(1) ends</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized. Modern default for both stacks AND queues — not <code>Stack</code>, not <code>LinkedList</code>. Disallows <code>null</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">PriorityQueue</td>
                <td className="px-4 py-3 text-emerald-600">O(1) peek</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n)</td>
                <td className="px-4 py-3 text-emerald-600">O(log n) head</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Binary min-heap. <code>remove(Object)</code> is O(n); only <code>poll()</code> (the head) is O(log n). Not stable.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">Stack (legacy)</td>
                <td className="px-4 py-3 text-emerald-600">O(1) top</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)*</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Don&apos;t use. Synchronized, extends Vector. Use ArrayDeque.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Read the rows you actually use first. <strong>ArrayList, HashMap, ArrayDeque, HashSet</strong> cover 80% of production code; everything else is opt-in for a reason.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — The pick-the-right-collection decision tree */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The pick-the-right-collection decision tree</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Four questions. Answer them in order and you&apos;ll land on exactly one implementation.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Q1 · Key-value pairs?</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">If yes → <strong>Map family</strong> (jump to Q3 for ordering). If no → <strong>Collection family</strong> (go Q2).</p>
            <code className="text-xs block text-slate-600 dark:text-slate-400">need lookup by key → Map<br/>need just &quot;a bag of things&quot; → List/Set/Queue</code>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Q2 · Duplicates allowed?</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Yes, and order/index matters → <strong>List</strong> (<code>ArrayList</code>). Yes, and you only push/pop ends → <strong>Deque</strong> (<code>ArrayDeque</code>). No duplicates → <strong>Set</strong> (jump to Q3).</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Q3 · What iteration order?</div>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
              <li><strong>None</strong> (fastest) → <code>HashMap</code> / <code>HashSet</code></li>
              <li><strong>Insertion order</strong> → <code>LinkedHashMap</code> / <code>LinkedHashSet</code></li>
              <li><strong>Sorted</strong> by key → <code>TreeMap</code> / <code>TreeSet</code></li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Q4 · Need range queries / nearest neighbor?</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Yes (<code>floorKey</code>, <code>ceilingKey</code>, <code>subMap</code>, &quot;next thing after X&quot;) → <strong>TreeMap / TreeSet</strong>. No → stick with hash-based for the O(1) average.</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Q5 · Priority access? Min/max repeatedly?</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">→ <strong>PriorityQueue</strong>. Top-K problems, Dijkstra, scheduler-style &quot;give me the next thing to do.&quot; O(log n) insert/poll, O(1) peek.</p>
          </div>
        </div>

        <Callout variant="insight" title="The 80% answer">
          When in doubt: <code>ArrayList</code> for ordered/indexed, <code>HashMap</code> for lookup, <code>HashSet</code> for membership, <code>ArrayDeque</code> for LIFO/FIFO. The other six implementations are special-purpose and you should be able to name <em>why</em> you reached for them.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Comparable vs Comparator */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Comparable vs Comparator</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Both define ordering, but they live in different places and answer different questions.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold"></th>
                <th className="px-4 py-3 font-semibold">Comparable&lt;T&gt;</th>
                <th className="px-4 py-3 font-semibold">Comparator&lt;T&gt;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">Lives where?</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">On the class itself</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Separate object passed in</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">Method</td>
                <td className="px-4 py-3 font-mono text-xs">int compareTo(T other)</td>
                <td className="px-4 py-3 font-mono text-xs">int compare(T a, T b)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">Concept</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">The <em>natural</em> ordering — &quot;there is one obvious way to sort these&quot;</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">An <em>alternative</em> ordering — &quot;here&apos;s how I want them sorted right now&quot;</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">How many?</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Exactly one per class</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">As many as you want</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">Used by</td>
                <td className="px-4 py-3 font-mono text-xs">Arrays.sort(a)<br/>Collections.sort(list)<br/>new TreeMap&lt;&gt;()</td>
                <td className="px-4 py-3 font-mono text-xs">Arrays.sort(a, cmp)<br/>Collections.sort(list, cmp)<br/>new TreeMap&lt;&gt;(cmp)<br/>new PriorityQueue&lt;&gt;(cmp)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-500">When you can&apos;t modify the class</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Can&apos;t use it — you&apos;d have to edit the source</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Perfect — define a Comparator externally</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock lang="java" caption="Comparable — natural ordering baked into the class">{`class Employee implements Comparable<Employee> {
    String name;
    int salary;

    @Override
    public int compareTo(Employee other) {
        return Integer.compare(this.salary, other.salary); // sort by salary asc
    }
}

List<Employee> emps = ...;
Collections.sort(emps);             // uses compareTo
TreeSet<Employee> set = new TreeSet<>(emps); // uses compareTo too`}</CodeBlock>

        <CodeBlock lang="java" caption="Comparator — multiple orderings, no class changes">{`// Sort by name (ascending)
Comparator<Employee> byName = Comparator.comparing(e -> e.name);

// Sort by salary descending, then name as a tiebreaker
Comparator<Employee> bySalaryDescThenName =
    Comparator.comparingInt((Employee e) -> e.salary).reversed()
              .thenComparing(e -> e.name);

emps.sort(bySalaryDescThenName);

// PriorityQueue with custom order: highest-paid first
PriorityQueue<Employee> pq =
    new PriorityQueue<>(Comparator.comparingInt((Employee e) -> -e.salary));`}</CodeBlock>

        <Callout variant="info" title="Rule of thumb">
          <code>Comparable</code> when there is one obvious natural ordering (numbers, dates, strings). <code>Comparator</code> when ordering is contextual, when you need more than one, or when you can&apos;t touch the class. <code>TreeMap</code>/<code>TreeSet</code>/<code>PriorityQueue</code> all accept a <code>Comparator</code> in their constructor — use it.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — equals / hashCode contract */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. The equals / hashCode contract</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every hash-based collection (<code>HashMap</code>, <code>HashSet</code>, <code>LinkedHashMap</code>, …) trusts these rules. Break one, and your map silently loses keys.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Rule 1 · Reflexive</div>
            <p className="text-sm text-slate-700 dark:text-slate-300"><code>x.equals(x)</code> must be <code>true</code>. (Don&apos;t worry — the default <code>Object</code> impl already does this.)</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Rule 2 · Symmetric</div>
            <p className="text-sm text-slate-700 dark:text-slate-300"><code>a.equals(b)</code> iff <code>b.equals(a)</code>. Broken when subclasses widen the equals check.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Rule 3 · Transitive</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">If <code>a.equals(b)</code> and <code>b.equals(c)</code>, then <code>a.equals(c)</code>.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Rule 4 · Consistent</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Repeated calls return the same result <em>as long as the fields used haven&apos;t changed.</em> Mutating a key after putting it in a map is the disaster scenario.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Rule 5 · equals → hashCode</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">If <code>a.equals(b)</code> is true, then <code>a.hashCode() == b.hashCode()</code> <strong>must</strong> be true. The converse is <em>not</em> required (collisions are fine). Break this and HashMap looks in the wrong bucket and silently &quot;loses&quot; your key.</p>
          </div>
        </div>

        <CodeBlock lang="java" caption="BAD — overrides equals but not hashCode">{`class UserId {
    final String value;
    UserId(String v) { this.value = v; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof UserId)) return false;
        return value.equals(((UserId) o).value);
    }
    // hashCode() not overridden — inherits Object.hashCode() (identity-based)
}

Map<UserId, String> map = new HashMap<>();
map.put(new UserId("u1"), "Alice");
System.out.println(map.get(new UserId("u1"))); // → null !
// equals says they're equal, but hashCode gives different buckets,
// so HashMap looks in the wrong bucket and finds nothing.`}</CodeBlock>

        <CodeBlock lang="java" caption="GOOD — override both, derived from the same fields">{`class UserId {
    final String value;
    UserId(String v) { this.value = v; }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof UserId)) return false;
        return value.equals(((UserId) o).value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value); // derived from the SAME field as equals
    }
}

Map<UserId, String> map = new HashMap<>();
map.put(new UserId("u1"), "Alice");
System.out.println(map.get(new UserId("u1"))); // → "Alice"  ✓`}</CodeBlock>

        <Callout variant="warn" title="Use records when you can">
          Java 16+ <code>record</code> types auto-generate <code>equals</code> and <code>hashCode</code> from <em>all</em> components, by the book. <code>record UserId(String value) {}</code> is the one-line version of the GOOD example above. Reach for records before writing the boilerplate.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Iteration order rules */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Iteration order rules</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          What you actually get when you write <code>for (var e : collection)</code>. Surprising your reviewer here is a code-review smell.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Implementation</th>
                <th className="px-4 py-3 font-semibold">Iteration order</th>
                <th className="px-4 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">ArrayList / LinkedList</td>
                <td className="px-4 py-3 text-emerald-600">Insertion order</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Lists are ordered by definition; iteration walks indices 0..n-1.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">HashMap / HashSet</td>
                <td className="px-4 py-3 text-rose-600">No guaranteed order</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bucket order depends on the hash function and table size — and can change between JVM versions. <strong>Never depend on it.</strong></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">LinkedHashMap / LinkedHashSet</td>
                <td className="px-4 py-3 text-emerald-600">Insertion order</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Doubly-linked list of entries threads through the hash table. Optional <em>access-order</em> mode (LRU cache pattern).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">TreeMap / TreeSet</td>
                <td className="px-4 py-3 text-emerald-600">Sorted by key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">In-order traversal of a Red-Black tree. Uses <code>Comparable</code> or the <code>Comparator</code> you passed.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">ArrayDeque</td>
                <td className="px-4 py-3 text-emerald-600">Head → tail (FIFO order)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Circular array; iteration is from <code>head</code> to <code>tail</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">PriorityQueue</td>
                <td className="px-4 py-3 text-rose-600">No useful order!</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Iteration walks the heap array — <em>not</em> in sorted order. Only <code>poll()</code> returns elements in priority order. This catches everyone once.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="PriorityQueue iteration is a classic bug">
          <code>for (int x : pq) System.out.println(x)</code> prints the heap array in array order, NOT in sorted order. To drain it sorted, call <code>poll()</code> in a loop until empty.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Thread safety quick reference */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Thread safety quick reference</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Standard collections (<code>ArrayList</code>, <code>HashMap</code>, etc.) are <strong>not</strong> thread-safe. Here are the four options when you need them to be.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Option</th>
                <th className="px-4 py-3 font-semibold">Safe?</th>
                <th className="px-4 py-3 font-semibold">Locking strategy</th>
                <th className="px-4 py-3 font-semibold">When to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">HashMap</td>
                <td className="px-4 py-3 text-rose-600 font-semibold">No</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">None. Concurrent writes can <em>corrupt the structure</em> — infinite loops on resize have been observed in the wild.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Single-threaded only.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">ConcurrentHashMap</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Lock striping / CAS on individual buckets. Reads are mostly lock-free.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400"><strong>Default choice</strong> for shared mutable maps. High concurrency, low contention.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">Collections.synchronizedMap(m)</td>
                <td className="px-4 py-3 text-amber-600 font-semibold">Yes, coarsely</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">One mutex on the whole map. Every operation grabs the same lock — serialized.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Legacy code or when contention is genuinely low. Iteration still needs external <code>synchronized</code> blocks.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">Hashtable</td>
                <td className="px-4 py-3 text-amber-600 font-semibold">Yes (legacy)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every method <code>synchronized</code>. Same global-lock model as <code>synchronizedMap</code>.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400"><strong>Don&apos;t use.</strong> Pre-collections-framework. <code>ConcurrentHashMap</code> is strictly better.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 mt-4">
          <li><strong>List equivalents:</strong> <code>CopyOnWriteArrayList</code> for read-heavy workloads (every write copies the array). <code>Collections.synchronizedList(...)</code> for everything else.</li>
          <li><strong>Set equivalents:</strong> <code>ConcurrentHashMap.newKeySet()</code> for a concurrent <code>Set</code>. <code>CopyOnWriteArraySet</code> for read-heavy.</li>
          <li><strong>Queue equivalents:</strong> <code>ConcurrentLinkedQueue</code> (lock-free FIFO), <code>LinkedBlockingQueue</code> (bounded, blocks producers/consumers), <code>PriorityBlockingQueue</code> for ordered.</li>
          <li><strong>Iteration caveat:</strong> <code>ConcurrentHashMap</code>&apos;s iterators are <em>weakly consistent</em> — they don&apos;t throw <code>ConcurrentModificationException</code>, but they may or may not reflect modifications made after the iterator was created.</li>
        </ul>

        <Callout variant="insight" title="The decision in one line">
          Shared mutable map → <code>ConcurrentHashMap</code>. Shared mutable list, read-heavy → <code>CopyOnWriteArrayList</code>. Producer/consumer queue → <code>LinkedBlockingQueue</code>. Everything else, default to single-threaded and confine the collection to one thread.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five recall checks. No XP, no gating. If you miss one, jump back to the <Link href="/courses/dsa/modules/java-collections" className="text-cyan-600 hover:underline">deep dive</Link>.
        </p>

        <Quiz
          kind="Recall check"
          question="You need a key→value lookup where iteration must return keys in sorted order, AND you need to find 'the largest key ≤ X' efficiently. Which implementation?"
          options={[
            { label: "HashMap", explanation: "HashMap has no iteration order and no notion of 'nearest key'. Wrong on both counts." },
            { label: "LinkedHashMap", explanation: "LinkedHashMap iterates in insertion order, not sorted order. And it has no nearest-key API." },
            { label: "TreeMap", correct: true, explanation: "Right. TreeMap is a Red-Black tree — sorted iteration AND it exposes floorKey/ceilingKey/lowerKey/higherKey for nearest-neighbor lookups. The cost is O(log n) per operation instead of O(1)." },
            { label: "ConcurrentHashMap", explanation: "ConcurrentHashMap is unordered (it's a hash table, just thread-safe). Order is not its job." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You override equals() on a class but forget to override hashCode(). You put one instance into a HashMap. What happens when you try to get(equalInstance)?"
          options={[
            { label: "It returns the value you put in.", explanation: "Only if hashCode is also consistent with equals. Default Object.hashCode is identity-based, so equal-by-fields instances land in different buckets." },
            { label: "It throws an exception at put-time.", explanation: "No exception — HashMap doesn't validate the equals/hashCode contract. The bug is silent." },
            { label: "It returns null — the map appears to lose the key.", correct: true, explanation: "Right. HashMap computes the bucket from hashCode. Since the default Object.hashCode is identity-based, two equal-by-fields instances hash to different buckets, so get() looks in the wrong bucket and returns null. This is the canonical equals/hashCode bug." },
            { label: "It works, but only for the first call.", explanation: "There's no special-case caching here. Every call to get() recomputes the hash and lands in the wrong bucket." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're writing a class Card that should sort naturally by suit then rank. You also want one specific list of cards sorted by rank only. What's the right design?"
          options={[
            { label: "Implement Comparable for both — switch behavior with a flag.", explanation: "A class has exactly one natural ordering. Don't toggle it with state — that breaks the contract." },
            { label: "Two Comparators, no Comparable.", explanation: "Works, but you lose the convenience of Collections.sort(list) without an argument. Better to have ONE natural ordering plus alternates." },
            { label: "Implement Comparable<Card> for suit-then-rank (the natural order). Use a Comparator<Card> for the rank-only sort.", correct: true, explanation: "Right. Comparable for the one obvious ordering; Comparator for situational alternates. Pass the Comparator to sort/TreeMap/PriorityQueue at the call site." },
            { label: "Two Comparables on the same class.", explanation: "You can only implement Comparable once per class — there's only one compareTo method." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You have a PriorityQueue<Integer> with elements [5, 1, 8, 3, 2]. You iterate it with an enhanced-for loop. What do you see?"
          options={[
            { label: "1, 2, 3, 5, 8 — sorted ascending.", explanation: "That's what poll() in a loop would give. Iteration does NOT sort." },
            { label: "8, 5, 3, 2, 1 — sorted descending.", explanation: "PriorityQueue is a min-heap by default, and even so, iteration doesn't sort." },
            { label: "The underlying heap array order — typically NOT sorted.", correct: true, explanation: "Right. Iteration walks the internal heap array. Only the head is guaranteed to be the min; the rest of the array has the heap property but is not sorted. To get sorted output, call poll() in a loop until empty." },
            { label: "Insertion order: 5, 1, 8, 3, 2.", explanation: "Insertions reshape the heap. After the inserts, the internal array won't match insertion order in general." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your service has 50 worker threads sharing a Map<UserId, Profile>. Reads dominate writes 100:1. Which collection?"
          options={[
            { label: "HashMap with a single mutex around every access.", explanation: "Same as synchronizedMap — coarse global lock. Scales badly with 50 threads doing reads concurrently." },
            { label: "ConcurrentHashMap.", correct: true, explanation: "Right. ConcurrentHashMap uses bucket-level locking / CAS — reads are mostly lock-free, and writes only contend at the bucket level. Perfect fit for high-concurrency, mixed read/write workloads." },
            { label: "Hashtable.", explanation: "Legacy — same global-lock model as synchronizedMap, no benefit. Don't use." },
            { label: "Collections.synchronizedMap(new HashMap<>()).", explanation: "Works correctly but serializes ALL access on one mutex. Under high read concurrency this becomes the bottleneck." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
          Phase 5 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now pick the right collection on sight</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Hierarchy, the 11-row Big-O table, the four decision questions, Comparable vs Comparator, the equals/hashCode contract, iteration order rules, thread safety. That&apos;s the entire framework — every container choice you make from now on should be a conscious one.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 6 — Algorithmic Techniques.</strong> Two pointers, sliding window, binary search patterns, recursion, backtracking. The shapes that show up over and over in interviews — implemented on top of the data structures you now understand cold.
        </p>
        <Link
          href="/courses/dsa/modules/two-pointers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Algorithmic Techniques →
        </Link>
      </section>
    </article>
  );
}
