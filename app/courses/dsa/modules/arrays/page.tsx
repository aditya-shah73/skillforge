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
  { id: "setup", title: "What an array really is" },
  { id: "fixed-vs-dynamic", title: "Fixed vs dynamic" },
  { id: "operations", title: "The cost of every operation" },
  { id: "patterns", title: "Two patterns: prefix sum & two pointers (preview)" },
  { id: "project", title: "Project: build your own ArrayList" },
  { id: "final", title: "Final quiz" },
];

export default function ArraysModule() {
  const mod = getModuleBySlug("arrays")!;

  // The mental model: an array is a contiguous run of equal-sized slots in memory,
  // indexed from 0. Address arithmetic gives O(1) random access.
  const memoryLayout = `
flowchart LR
    subgraph RAM["Contiguous memory"]
        direction LR
        S0["[0]<br/>11"]
        S1["[1]<br/>23"]
        S2["[2]<br/>7"]
        S3["[3]<br/>42"]
        S4["[4]<br/>5"]
        S5["[5]<br/>9"]
    end
    P["base address<br/>0x1000"] -.-> S0
    F["arr[i]<br/>= base + i × 4"] -.-> S3
    style S0 fill:#fbbf24,color:#000,stroke:#d97706
    style S1 fill:#fbbf24,color:#000,stroke:#d97706
    style S2 fill:#fbbf24,color:#000,stroke:#d97706
    style S3 fill:#f59e0b,color:#fff,stroke:#b45309
    style S4 fill:#fbbf24,color:#000,stroke:#d97706
    style S5 fill:#fbbf24,color:#000,stroke:#d97706
    style P fill:#1e293b,color:#fff,stroke:#475569
    style F fill:#1e293b,color:#fff,stroke:#475569
    style RAM fill:#fef3c7,color:#000,stroke:#fbbf24
  `.trim();

  // Insertion at index 2 in [11, 23, 7, 42, 5, 9, _, _]: shift right, then write.
  // The shift is what makes mid-array insertion O(n).
  const insertShift = `
flowchart TB
    subgraph Before["Before insert(2, 99)"]
        direction LR
        B0["[0]<br/>11"] --> B1["[1]<br/>23"] --> B2["[2]<br/>7"] --> B3["[3]<br/>42"] --> B4["[4]<br/>5"] --> B5["[5]<br/>9"] --> B6["[6]<br/>—"] --> B7["[7]<br/>—"]
    end
    subgraph Shift["Shift everything ≥ 2 right one slot (O(n))"]
        direction LR
        S0["[0]<br/>11"] --> S1["[1]<br/>23"] --> S2["[2]<br/>—"] --> S3["[3]<br/>7"] --> S4["[4]<br/>42"] --> S5["[5]<br/>5"] --> S6["[6]<br/>9"] --> S7["[7]<br/>—"]
    end
    subgraph After["Write 99 at index 2"]
        direction LR
        A0["[0]<br/>11"] --> A1["[1]<br/>23"] --> A2["[2]<br/>99"] --> A3["[3]<br/>7"] --> A4["[4]<br/>42"] --> A5["[5]<br/>5"] --> A6["[6]<br/>9"] --> A7["[7]<br/>—"]
    end
    Before --> Shift --> After
    style B2 fill:#10b981,color:#fff,stroke:#059669
    style S2 fill:#fb923c,color:#fff,stroke:#ea580c
    style S3 fill:#fb923c,color:#fff,stroke:#ea580c
    style S4 fill:#fb923c,color:#fff,stroke:#ea580c
    style S5 fill:#fb923c,color:#fff,stroke:#ea580c
    style S6 fill:#fb923c,color:#fff,stroke:#ea580c
    style A2 fill:#10b981,color:#fff,stroke:#059669
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/dsa" className="text-emerald-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Arrays &amp; dynamic arrays
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The simplest data structure, and the one every other one quietly relies on. Fixed arrays, the doubling trick, ArrayList internals, and the patterns that fall out for free.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="arrays" />
        <ModuleProgress moduleSlug="arrays" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: WHAT AN ARRAY REALLY IS */}
      <Checkpoint moduleSlug="arrays" id="setup" title="What an array really is" xp={15} celebration="You see the contiguous slab of memory now. Indexing is just arithmetic.">
      <section>
        <h2>Part 1: Arrays are slabs of memory, not magic</h2>

        <p>
          Most engineers learned arrays as &ldquo;a list of things you index into.&rdquo; That works for getting code to compile. It does not work for explaining why <code>arr[1_000_000]</code> is just as fast as <code>arr[3]</code>, or why inserting in the middle is O(n) when indexing is O(1).
        </p>

        <p>
          Here&apos;s the model that explains both:
        </p>

        <Callout variant="insight" title="An array is a contiguous run of equal-sized slots">
          <p className="m-0">
            When you allocate <code>int[] arr = new int[6]</code>, the JVM gives you 24 contiguous bytes of memory (6 ints × 4 bytes). The array variable holds the <em>base address</em>. To get <code>arr[i]</code>, the CPU computes <code>base + i × 4</code> and loads from that address. One multiplication, one add, one load. Constant time, regardless of i.
          </p>
        </Callout>

        <Mermaid chart={memoryLayout} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          An int[6] in memory. The base address points at slot 0. <code>arr[3]</code> is computed as <code>base + 3 × 4</code> — a single address arithmetic.
        </p>

        <h3>Why this matters</h3>
        <p>
          Every property of arrays falls out of this one fact:
        </p>
        <ul>
          <li><strong>O(1) random access</strong> — because indexing is arithmetic, not a search.</li>
          <li><strong>Cache-friendly iteration</strong> — neighbors are physically next to each other in RAM, so prefetchers love arrays.</li>
          <li><strong>Fixed size at allocation</strong> — the OS hands you a single slab; you can&apos;t grow it without copying.</li>
          <li><strong>O(n) insert/delete in the middle</strong> — to keep slots contiguous, everything after the gap has to shift.</li>
          <li><strong>Same-typed elements</strong> — equal-sized slots is what makes the address math work.</li>
        </ul>

        <Quiz
          kind="Gut check"
          question="An int[10_000_000] is allocated and you read arr[8_421_337]. Roughly how many memory addresses does the CPU need to look at to get the value?"
          options={[
            { label: "About 8.4 million — it walks the array.", explanation: "That would be linear search. Arrays don't search — they compute. The CPU does base + i × 4 once." },
            { label: "About log₂(10⁷) ≈ 24 — like binary search.", explanation: "Binary search is for sorted lookups by value. Indexing by a known position is direct, not a search." },
            { label: "Exactly one — base + i × 4 gives the address directly.", correct: true, explanation: "Right. The address is a one-shot arithmetic computation. Random access is O(1) because the hardware can compute the address without inspecting any other element." },
            { label: "It depends on the JVM's array implementation.", explanation: "Every JVM stores primitive arrays contiguously — that's mandated by the spec for performance. Object arrays do too (they store references contiguously)." },
          ]}
        />

        <h3>Java arrays in particular</h3>
        <p>
          Java draws a sharp line between <strong>primitive arrays</strong>{" "}and <strong>object arrays</strong>:
        </p>
        <CodeBlock lang="java">{`int[] primes = new int[5];           // 5 ints stored inline: 20 bytes of payload
String[] names = new String[5];       // 5 references stored inline; the String objects
                                       // live on the heap somewhere else
primes[0] = 2;                         // writes the int directly
names[0] = "alice";                    // writes a reference; "alice" is a separate object`}</CodeBlock>
        <p>
          For <code>int[]</code> the 4-byte ints sit right next to each other in one block. For <code>String[]</code> the <em>references</em> (8 bytes each on a 64-bit JVM, often compressed to 4) sit next to each other — but the <code>String</code> objects themselves are scattered around the heap. Both are O(1) to index, but iteration over an int[] is dramatically more cache-friendly.
        </p>

        <Callout variant="warn" title="Java array length is fixed at allocation">
          <p className="m-0">
            <code>new int[10]</code> creates exactly 10 slots. There is no <code>.add()</code> on a Java array. To &ldquo;grow&rdquo; it you have to allocate a new, bigger array and copy. This is the entire reason <code>ArrayList</code> exists.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="What does this print: int[] a = new int[3]; System.out.println(a[2]);"
          options={[
            { label: "0", correct: true, explanation: "Java zero-initializes primitive arrays. int[] gets 0, double[] gets 0.0, boolean[] gets false, Object[] gets null." },
            { label: "null", explanation: "null is the default for object arrays (String[], Integer[]). For int[], the default is 0 — primitives can't be null." },
            { label: "Some random uninitialized value.", explanation: "C arrays do that. Java guarantees zero-initialization, which is one of the reasons array allocation isn't free — the JVM walks the slab and zeroes it." },
            { label: "ArrayIndexOutOfBoundsException", explanation: "Index 2 is the last valid index for length 3 (indices 0, 1, 2). The exception is thrown at index 3 or higher." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Arrays are a contiguous run of equal-sized slots. Everything else is a consequence."
          points={[
            { takeaway: "Indexing is address arithmetic, not search — that's why arr[i] is O(1) for any i.", detail: "base + i × element_size, one load. The hardware does this in nanoseconds regardless of array size." },
            { takeaway: "Size is fixed at allocation in Java. To grow, you allocate-and-copy.", detail: "There is no resize-in-place primitive. ArrayList wraps this allocate-and-copy pattern behind a friendlier API." },
            { takeaway: "int[] stores ints inline; String[] stores references.", detail: "Primitive arrays are dense and cache-friendly. Object arrays add one level of indirection per element." },
            { takeaway: "Java zero-initializes arrays.", detail: "int[] starts at all 0, Object[] at all null. This is part of why allocation cost grows with size." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: FIXED VS DYNAMIC */}
      <Checkpoint moduleSlug="arrays" id="fixed-vs-dynamic" title="Fixed vs dynamic" xp={20} celebration="The gap between int[] and ArrayList is now a feature, not a mystery.">
      <section>
        <h2>Part 2: Fixed arrays vs dynamic arrays (a.k.a. ArrayList)</h2>

        <p>
          A fixed array is too rigid for most real code. You usually don&apos;t know the final size up front — you&apos;re reading from a stream, building results as you go, parsing an input of unknown length. So we wrap the fixed array in a structure that <em>looks</em>{" "}resizable: the dynamic array. In Java this is <code>ArrayList</code>. In C++ it&apos;s <code>std::vector</code>. In Python the built-in <code>list</code>. Same idea, different names.
        </p>

        <h3>How a dynamic array actually works</h3>
        <p>
          A dynamic array holds two things: an internal fixed array (the &ldquo;backing array&rdquo;) and a <code>size</code> counter telling you how many slots are currently used. The backing array is usually <em>bigger</em>{" "}than <code>size</code> — that extra room is what lets you append without reallocating.
        </p>

        <CodeBlock lang="java">{`// Conceptually, ArrayList<E> is roughly:
class ArrayList<E> {
    Object[] elements;   // the backing array — bigger than size
    int size;            // how many slots are actually used

    public E get(int i) {
        if (i >= size) throw new IndexOutOfBoundsException();
        return (E) elements[i];        // O(1) — just delegate to the array
    }

    public void add(E e) {
        if (size == elements.length) {
            // Backing array full — allocate a bigger one and copy.
            Object[] bigger = new Object[elements.length * 2];
            System.arraycopy(elements, 0, bigger, 0, size);
            elements = bigger;
        }
        elements[size++] = e;          // write into the next free slot
    }
}`}</CodeBlock>

        <p>
          The doubling-on-full strategy is the whole trick. Most of the time <code>add</code> is just <code>elements[size++] = e</code> — a single write. Once in a while the backing array is full and you pay an O(n) copy. You proved in Module 3 that the average over many adds is constant. That is what makes <code>ArrayList</code> the workhorse it is.
        </p>

        <Callout variant="info" title="Java's exact growth factor">
          <p className="m-0">
            Java&apos;s actual <code>ArrayList</code> grows by 1.5× (<code>newCap = oldCap + (oldCap &gt;&gt; 1)</code>), not 2×. C++ <code>std::vector</code> commonly uses 2×. Python <code>list</code> uses ~1.125×. All three give amortized O(1) — the math from Module 3 works for any constant factor &gt; 1. The exact factor trades memory waste against copy frequency.
          </p>
        </Callout>

        <h3>Capacity vs size — the distinction that confuses everyone</h3>
        <p>
          These are not the same number, and reading <code>ArrayList</code> code without separating them will make you miserable:
        </p>
        <ul>
          <li><strong>Size</strong>{" "}is the number of elements <em>you&apos;ve added</em>. <code>list.size()</code> returns this. It&apos;s also the next free index.</li>
          <li><strong>Capacity</strong>{" "}is the length of the backing array — the number of slots <em>available</em>{" "}before a resize is needed. There is no public method to read it.</li>
        </ul>
        <p>
          When you do <code>new ArrayList&lt;&gt;()</code>, you get a list with size 0 and (after the first add) capacity 10. When you do <code>new ArrayList&lt;&gt;(1000)</code>, you get size 0 and capacity 1000 — useful when you know roughly how big the list will get and want to avoid the resize-and-copy churn entirely.
        </p>

        <WorkedExample
          title="Trace a sequence of adds with growth factor 2"
          subtitle="Starting capacity 1. Watch capacity vs size diverge."
          steps={[
            {
              title: "Start: empty list, initial capacity 1",
              body: (
                <>
                  <p>
                    <code>elements = [_]</code>, <code>size = 0</code>, <code>capacity = 1</code>.
                  </p>
                </>
              ),
            },
            {
              title: "add('a') — slot free, just write",
              body: (
                <>
                  <p>
                    <code>elements = [a]</code>, <code>size = 1</code>, <code>capacity = 1</code>. One write, no copy.
                  </p>
                </>
              ),
            },
            {
              title: "add('b') — full, must resize",
              body: (
                <>
                  <p>
                    Backing array is full. Allocate <code>new Object[2]</code>, copy <code>[a]</code> over, then write <code>b</code> into slot 1.
                  </p>
                  <p>
                    <code>elements = [a, b]</code>, <code>size = 2</code>, <code>capacity = 2</code>. One copy + one write.
                  </p>
                </>
              ),
            },
            {
              title: "add('c') — full again, resize to 4",
              body: (
                <>
                  <p>
                    Allocate <code>new Object[4]</code>, copy <code>[a, b]</code>, write <code>c</code>.
                  </p>
                  <p>
                    <code>elements = [a, b, c, _]</code>, <code>size = 3</code>, <code>capacity = 4</code>. Two copies + one write.
                  </p>
                </>
              ),
            },
            {
              title: "add('d') — slot free, just write",
              body: (
                <>
                  <p>
                    <code>elements = [a, b, c, d]</code>, <code>size = 4</code>, <code>capacity = 4</code>. No resize this time.
                  </p>
                </>
              ),
            },
            {
              title: "add('e') — full, resize to 8",
              body: (
                <>
                  <p>
                    Allocate <code>new Object[8]</code>, copy 4 elements, write <code>e</code>.
                  </p>
                  <p>
                    <code>capacity = 8, size = 5</code>. Now you have <strong>3 free slots</strong>{" "}before the next resize. As n grows, free slots between resizes grow too — that&apos;s the source of amortized O(1).
                  </p>
                </>
              ),
            },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="An ArrayList<Integer> with capacity 16 currently holds 16 elements. You call add(99). What's the cost (in element-writes/copies)?"
          options={[
            { label: "1 — just write 99 at index 16.", explanation: "The backing array is full. There's no slot 16 yet. A resize happens first." },
            { label: "16 — copy all 16 elements to a bigger array.", explanation: "Close, but you forgot the actual write of 99. The total includes both the copy and the new element write." },
            { label: "17 — copy all 16 elements to a new size-32 array, then write 99 into slot 16.", correct: true, explanation: "Right. Resize allocates new Object[32], System.arraycopy moves 16 elements, then elements[16] = 99. That's 16 copies + 1 write = 17 element-touches. Amortized over many adds it's still O(1), but this single call is O(n)." },
            { label: "32 — must touch every slot in the new array.", explanation: "Java zero-initializes the new array slots, but those are JVM-level fills, not your add's logical work. Conventionally we count the 16 copies + 1 write." },
          ]}
        />

        <h3>The arithmetic-growth trap</h3>
        <p>
          This is the bug interviewers love to ask about: what if you don&apos;t double, but grow by a constant amount each time?
        </p>
        <CodeBlock lang="java">{`// DO NOT DO THIS — looks reasonable, performs catastrophically
public void add(E e) {
    if (size == elements.length) {
        Object[] bigger = new Object[elements.length + 10];   // +10 instead of × 2
        System.arraycopy(elements, 0, bigger, 0, size);
        elements = bigger;
    }
    elements[size++] = e;
}`}</CodeBlock>
        <p>
          Adding a constant 10 slots per resize sounds frugal — less wasted memory! In reality, with arithmetic growth you resize every 10 adds, and each resize costs O(current size). Total work over n adds is on the order of n² / 20. At n = 100k that&apos;s 500 million element-copies. The whole reason geometric growth gives amortized O(1) is that resizes get exponentially rarer as the array grows.
        </p>

        <Callout variant="spring" title="Module 3 connection">
          <p className="m-0">
            Geometric growth (× constant) → amortized O(1) per add, O(n) total over n adds.<br />
            Arithmetic growth (+ constant) → amortized O(n) per add, O(n²) total. Don&apos;t do it.
          </p>
        </Callout>

        <Quiz
          kind="Concept check"
          question="Why does ArrayList double the backing array on resize instead of growing by +1?"
          options={[
            { label: "Memory addresses must be powers of 2.", explanation: "They don't. Java arrays of any length work fine." },
            { label: "To make the amortized cost of add constant — geometric growth means resizes get rarer as n grows.", correct: true, explanation: "Right. With doubling, the total copy work over n adds is ~n (geometric series). With +1 growth it would be ~n². That's the difference between amortized O(1) and amortized O(n) per add." },
            { label: "So elements[i] for any i is a power of 2.", explanation: "Index access doesn't depend on capacity being a power of 2 — it's just base + i × element_size." },
            { label: "Because the JVM only allows power-of-2 array allocations.", explanation: "It allows any non-negative size, up to roughly Integer.MAX_VALUE - 8." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="A dynamic array is a fixed array plus a size counter and a growth strategy. The strategy is the whole game."
          points={[
            { takeaway: "ArrayList wraps a backing array that's deliberately bigger than size.", detail: "When add overflows the backing array, allocate a new bigger one and copy. The wasted slots are the price of amortized O(1)." },
            { takeaway: "Size is what you've added. Capacity is what the backing array can hold.", detail: "ArrayList.size() exposes the first; capacity is internal. new ArrayList<>(N) pre-sizes capacity to skip resizes." },
            { takeaway: "Geometric growth (×1.5 or ×2) → amortized O(1) per add.", detail: "Total work over n adds is O(n). Java uses 1.5×, C++ commonly 2×, Python ~1.125×." },
            { takeaway: "Arithmetic growth (+constant) is a trap — it gives O(n) per add.", detail: "Total work is O(n²). It looks frugal but burns CPU as the list gets big." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3: COSTS OF EVERY OPERATION */}
      <Checkpoint moduleSlug="arrays" id="operations" title="The cost of every operation" xp={25} celebration="You can now reason about every ArrayList method's cost on sight.">
      <section>
        <h2>Part 3: The cost of every array operation</h2>

        <p>
          Once you have the &ldquo;contiguous slab + size counter + doubling strategy&rdquo; model, you can derive the cost of every operation. You don&apos;t have to memorize a Big-O table — you can read the method and see the cost.
        </p>

        <h3>The five operations you actually use</h3>
        <p>
          Here&apos;s the table. Try to <em>derive</em>{" "}each row before reading the column to its right.
        </p>

        <div className="not-prose my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Operation</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">get(i)</td>
                <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-300">O(1)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Address arithmetic, one load.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">set(i, v)</td>
                <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-300">O(1)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Address arithmetic, one store.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">add(v) — append</td>
                <td className="px-4 py-3 font-mono text-amber-700 dark:text-amber-300">O(1) amortized<br /><span className="text-xs text-slate-500">O(n) worst case</span></td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Usually a write at <code>size</code>. On full, allocate &amp; copy.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">add(i, v) — insert at index</td>
                <td className="px-4 py-3 font-mono text-rose-700 dark:text-rose-300">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Must shift all elements ≥ i one slot right to make room.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">remove(i)</td>
                <td className="px-4 py-3 font-mono text-rose-700 dark:text-rose-300">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Must shift all elements &gt; i one slot left to fill the gap.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">contains(v)</td>
                <td className="px-4 py-3 font-mono text-rose-700 dark:text-rose-300">O(n)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Walks the array comparing each element.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">size()</td>
                <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-300">O(1)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">It&apos;s a stored field. Just read it.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Mid-array insertion is where people get burned</h3>
        <p>
          The &ldquo;append&rdquo; case is the friendly one. The &ldquo;insert at index&rdquo; case is the one that surprises people. To insert at index i in a length-n array, every element from i onward has to slide one slot to the right. That&apos;s n − i shifts in the worst case (i = 0).
        </p>

        <Mermaid chart={insertShift} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Insert 99 at index 2. The whole tail shifts right one slot before we can write. That shift is the O(n) cost.
        </p>

        <CodeBlock lang="java">{`// What ArrayList.add(int index, E element) does, simplified:
public void add(int index, E element) {
    if (index > size) throw new IndexOutOfBoundsException();
    if (size == elements.length) grow();         // resize if full

    // Shift elements[index..size-1] right by one position.
    System.arraycopy(elements, index, elements, index + 1, size - index);
    elements[index] = element;
    size++;
}`}</CodeBlock>

        <Callout variant="warn" title="add(0, x) is a footgun in tight loops">
          <p className="m-0">
            Calling <code>add(0, x)</code> n times is O(n²) — every insert shifts the entire list. If you find yourself doing this, you almost certainly want a <code>Deque</code> (Module 9) or to build the list in reverse and call <code>Collections.reverse</code> at the end.
          </p>
        </Callout>

        <h3>The same logic for remove</h3>
        <p>
          Removing at index i means closing the gap — every element from i+1 to size-1 shifts one slot left. Same O(n) cost, same shape. The only operation that&apos;s fast is removing the <em>last</em>{" "}element (just decrement size, no shift needed).
        </p>

        <Quiz
          kind="Quick check"
          question="You have an ArrayList<String> with 1,000,000 elements. Which of these is the most expensive?"
          options={[
            { label: "list.get(999_999)", explanation: "O(1). The size of the list doesn't matter for indexed access." },
            { label: "list.set(500_000, \"hello\")", explanation: "O(1). Set is just an indexed write." },
            { label: "list.add(\"end\")", explanation: "Amortized O(1). Most calls are a single write; occasionally a resize happens. Either way much cheaper than the alternatives here." },
            { label: "list.add(0, \"start\")", correct: true, explanation: "O(n) — and the worst case at that, since index 0 means shifting all 1M elements one slot right. That's a million element-copies for one logical insert." },
          ]}
        />

        <ClassifyChallenge
          title="Cost of common operations"
          prompt="Classify each operation by its worst-case cost on an ArrayList<E> of size n."
          buckets={[
            { id: "constant", label: "O(1)", color: "emerald" },
            { id: "amortized", label: "O(1) amortized (O(n) worst)", color: "amber" },
            { id: "linear", label: "O(n)", color: "rose" },
          ]}
          items={[
            { id: "get-mid", label: "list.get(n / 2)", answer: "constant", explanation: "Random access by index is address arithmetic — same cost no matter where i is." },
            { id: "set-end", label: "list.set(n - 1, x)", answer: "constant", explanation: "Indexed write. The size of the list is irrelevant." },
            { id: "append", label: "list.add(x) (append at end)", answer: "amortized", explanation: "Usually a single write. Occasionally triggers a resize, which costs O(n). The amortized average is O(1)." },
            { id: "insert-front", label: "list.add(0, x)", answer: "linear", explanation: "Inserting at the front shifts every existing element one slot right — n element-copies." },
            { id: "remove-mid", label: "list.remove(n / 2)", answer: "linear", explanation: "Removing at the middle means shifting the back half left to close the gap — about n/2 copies, which is O(n)." },
            { id: "remove-last", label: "list.remove(n - 1)", answer: "constant", explanation: "Removing the last element is just size--. Nothing has to shift." },
            { id: "contains", label: "list.contains(x)", answer: "linear", explanation: "Linear scan comparing each element. There's no index to short-circuit a search." },
            { id: "size", label: "list.size()", answer: "constant", explanation: "Returns a stored int field. No work involved." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Indexed reads are free. Mid-array structural changes are not."
          points={[
            { takeaway: "get/set/size are O(1). Append is amortized O(1).", detail: "These are the operations dynamic arrays are good at. Lean on them." },
            { takeaway: "add(i, x) and remove(i) for arbitrary i are O(n).", detail: "Shifts are unavoidable when you need to keep slots contiguous. If you're doing many mid-array inserts, the wrong data structure is in play." },
            { takeaway: "Removing the last element is O(1); removing the first is O(n).", detail: "Asymmetric behavior — append/pop-back is the cheap pattern, push/pop-front is not." },
            { takeaway: "contains is O(n) — there's no shortcut on an unsorted array.", detail: "If you're doing many lookups, hash sets (Modules 11-12) or sorted arrays with binary search (Module 25) are what you want." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 4: PATTERNS — PREFIX SUM, TWO POINTERS */}
      <Checkpoint moduleSlug="arrays" id="patterns" title="Two patterns: prefix sum & two pointers (preview)" xp={20} celebration="You've met two named patterns. Pattern recognition is the path to fluency.">
      <section>
        <h2>Part 4: The first two patterns — prefix sum and two pointers (preview)</h2>

        <p>
          Arrays are the substrate every linear algorithm walks on. Two patterns show up often enough that you should recognize them on sight. We&apos;ll do them properly later (two pointers in Module 23, sliding window in Module 24), but introducing them here is how the &ldquo;pattern-first&rdquo; approach starts.
        </p>

        <h3>Pattern 1: Prefix sum (the running total)</h3>
        <p>
          Question: given an array of n numbers, you&apos;ll be asked many times for the sum of any subrange <code>[l, r]</code>. How do you make each query fast?
        </p>
        <p>
          Naive: loop from l to r each time. O(n) per query, O(n × q) total for q queries.
        </p>
        <p>
          Better: precompute, once, an array <code>prefix</code> where <code>prefix[i] = arr[0] + arr[1] + ... + arr[i-1]</code>. Then any range sum is one subtraction:
        </p>
        <CodeBlock lang="java">{`int[] prefix = new int[arr.length + 1];   // prefix[0] = 0
for (int i = 0; i < arr.length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
}

// Sum of arr[l..r] (inclusive on both ends):
int rangeSum = prefix[r + 1] - prefix[l];   // O(1) per query!`}</CodeBlock>

        <Callout variant="insight" title="The trade you just made">
          <p className="m-0">
            You spent O(n) memory and O(n) time once, up front, to make every range query O(1). With many queries, the total cost goes from O(nq) to O(n + q). This is the canonical &ldquo;trade space for time&rdquo; move.
          </p>
        </Callout>

        <p>
          The LeetCode warm-up for this is &ldquo;Running Sum of 1d Array&rdquo; — literally just compute the prefix array. It&apos;s in the project section.
        </p>

        <Quiz
          kind="Concept check"
          question="prefix[r+1] - prefix[l] gives the sum of arr[l..r]. Why?"
          options={[
            { label: "Because subtraction undoes addition.", explanation: "True but not specific. The point is which sums cancel." },
            { label: "prefix[r+1] is sum of arr[0..r], prefix[l] is sum of arr[0..l-1]; subtracting cancels arr[0..l-1] and leaves arr[l..r].", correct: true, explanation: "Right. You're 'cancelling out' the prefix you don't want. This telescoping idea generalizes to 2D prefix sums (Module 34) and many other range-query structures." },
            { label: "Because the prefix array is sorted.", explanation: "It isn't (unless all values are non-negative). And sortedness isn't what makes the trick work — telescoping does." },
            { label: "Because arr[l..r] equals (r - l + 1) elements.", explanation: "That's the count of elements, not their sum." },
          ]}
        />

        <h3>Pattern 2: Two pointers (preview)</h3>
        <p>
          Two pointers is the move where you keep two indices into the same array (or two arrays) and advance them according to some rule. The classic shape is &ldquo;left and right ends, walk them inward.&rdquo;
        </p>
        <p>
          Question: given a <em>sorted</em>{" "}int array, find two indices whose values sum to a target.
        </p>
        <CodeBlock lang="java">{`int[] twoSumSorted(int[] arr, int target) {
    int l = 0, r = arr.length - 1;
    while (l < r) {
        int sum = arr[l] + arr[r];
        if (sum == target) return new int[] { l, r };
        if (sum < target) l++;        // need bigger sum, advance left
        else r--;                      // need smaller sum, retreat right
    }
    return new int[] { -1, -1 };       // no pair found
}`}</CodeBlock>
        <p>
          Naive nested-loop search is O(n²). Two pointers is O(n) — every iteration moves at least one pointer, and each pointer moves at most n times. The trick relies on the array being sorted: that&apos;s the precondition that makes &ldquo;move left if sum&apos;s too small, move right if it&apos;s too big&rdquo; correct.
        </p>

        <Callout variant="insight" title="The 'sorted' tell">
          <p className="m-0">
            Whenever you see &ldquo;sorted array&rdquo; in a problem statement, two pointers and binary search should both immediately come to mind. They&apos;re what sorted-ness <em>buys</em>{" "}you.
          </p>
        </Callout>

        <p>
          We&apos;ll do this properly in Module 23 with all the variants — opposite-end vs same-direction, the partitioning twist, &ldquo;3Sum&rdquo;. The point right now is just to plant the flag: when you have a sorted array, two pointers is on the table.
        </p>

        <Quiz
          kind="Quick check"
          question="The two-pointer twoSumSorted runs on a sorted int[100]. About how many iterations does it do, worst case?"
          options={[
            { label: "100 × 100 = 10,000 — it's a nested loop in disguise.", explanation: "It looks like a nested loop because of the while, but it isn't. Each iteration moves a pointer; pointers can only move at most 100 steps total." },
            { label: "About 100 — l and r together move at most n steps before they meet.", correct: true, explanation: "Right. Each iteration advances l or retreats r. They start n apart and meet after at most n moves. That's the O(n) win over the O(n²) naive search." },
            { label: "About log₂(100) ≈ 7 — it's binary search.", explanation: "Different pattern. Binary search jumps in halves; two pointers walks in unit steps from both ends." },
            { label: "Constant — sorted arrays let you compute the answer directly.", explanation: "There's no closed form for finding two indices summing to target without inspecting elements." },
          ]}
        />

        <h3>The bigger lesson</h3>
        <p>
          Both patterns share a meta-pattern: <em>if you can spend a little structure (a precomputed prefix, or sorting) up front, many queries get cheap</em>. Brute force loops O(nq) collapse to O(n + q). Quadratic searches collapse to linear. This is the move pattern-first DSA is built on.
        </p>

        <PartRecap
          title="Part 4 recap"
          gist="Two patterns to recognize on sight. We'll do both properly later — for now, plant the flag."
          points={[
            { takeaway: "Prefix sum makes every range-sum query O(1) after O(n) precompute.", detail: "prefix[r+1] - prefix[l] = sum of arr[l..r]. Telescoping. Generalizes to 2D and to other range queries." },
            { takeaway: "Two pointers turns many O(n²) array searches into O(n) — when the array is sorted.", detail: "Left and right pointers walk inward; each step advances one pointer. Total iterations capped at n." },
            { takeaway: "'Sorted array' in a problem is a hint: think two pointers and binary search.", detail: "Sortedness is information. Algorithms that exploit it tend to be one Big-O class better." },
            { takeaway: "Trading precompute for cheap queries is the canonical algorithmic move.", detail: "Many advanced structures (segment trees, BITs, sparse tables) are sophisticated versions of this same idea." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 5: PROJECT */}
      <Checkpoint moduleSlug="arrays" id="project" title="Project: build your own ArrayList" xp={40} celebration="You've implemented a dynamic array from scratch. Every Java engineer should do this once." manual manualLabel="I built and tested it">
      <section>
        <h2>Part 5: Project — build your own ArrayList</h2>

        <p>
          Time to make the abstract concrete. You&apos;ll implement <code>MyArrayList&lt;E&gt;</code> from scratch — the doubling, the shifting, the size/capacity split — then solve two LeetCode problems that exercise the prefix-sum pattern.
        </p>

        <h3>Goal</h3>
        <p>
          A working dynamic array that supports the core ArrayList operations and (importantly) <em>tracks how many copies a sequence of operations actually does</em>, so you can see amortized O(1) with your own eyes.
        </p>

        <h3>API to implement</h3>
        <CodeBlock lang="java">{`public class MyArrayList<E> {
    private Object[] elements;
    private int size;
    private long copyCount;          // total element-copies across all operations

    public MyArrayList() { /* start with capacity 4 */ }
    public MyArrayList(int initialCapacity) { /* honor it */ }

    public int size() { /* O(1) */ }
    public boolean isEmpty() { /* O(1) */ }

    public E get(int i) { /* bounds check, O(1) */ }
    public E set(int i, E v) { /* return old value, O(1) */ }

    public boolean add(E v) { /* append, amortized O(1) */ }
    public void add(int index, E v) { /* shift right, O(n) */ }
    public E remove(int index) { /* shift left, O(n) */ }
    public boolean contains(E v) { /* linear scan, O(n) */ }

    public long getCopyCount() { /* total copies done so far */ }
    public int capacity() { /* expose for inspection */ }

    private void grow() { /* the doubling logic */ }
}`}</CodeBlock>

        <h3>Step-by-step</h3>

        <ol className="space-y-4 not-prose">
          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 1 — Skeleton + size, isEmpty, capacity</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Allocate <code>elements = new Object[4]</code> in the no-arg constructor. Wire up <code>size()</code>, <code>isEmpty()</code>, <code>capacity()</code> as pure field accessors. Confirm they all compile.
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 2 — get and set with bounds checking</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Throw <code>IndexOutOfBoundsException</code> for <code>i &lt; 0</code> or <code>i &gt;= size</code>. Note the bound is <code>size</code>, not <code>capacity</code> — slots beyond size are not yours to read.
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 3 — add(v) with growth</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="mt-0">Implement append. When <code>size == elements.length</code>, call <code>grow()</code>:</p>
              <ul className="my-2">
                <li>Allocate <code>new Object[elements.length * 2]</code>.</li>
                <li>Use <code>System.arraycopy</code> to move the old contents over.</li>
                <li>Add the number of elements copied to <code>copyCount</code> — this is what makes the amortized math visible.</li>
                <li>Replace <code>elements</code>.</li>
              </ul>
              <p className="mb-0">Then write <code>elements[size++] = v</code>.</p>
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 4 — add(i, v) and remove(i) with shifts</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p className="mt-0">For insert at <code>i</code>:</p>
              <CodeBlock lang="java">{`if (size == elements.length) grow();
System.arraycopy(elements, i, elements, i + 1, size - i);
copyCount += size - i;          // count the shift
elements[i] = v;
size++;`}</CodeBlock>
              <p className="mb-0">For remove, shift left by one, increment <code>copyCount</code> by <code>size - i - 1</code>, decrement <code>size</code>, null-out the now-unused tail slot (let GC reclaim).</p>
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 5 — Watch amortized O(1) emerge</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Write a <code>main</code> that does <code>add(i)</code> for i in 0..n−1 and prints <code>(n, copyCount, copyCount/(double)n)</code> at every power of 2. The third column should converge to a small constant near 1 — that&apos;s amortized O(1) per add (the writes are not counted; only the shift/grow copies are). Try n = 1, 2, 4, 8, ..., 2^20.
            </div>
          </li>

          <li className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Step 6 — LeetCode warm-ups</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Solve these two using the prefix-sum pattern from Part 4:
              <ul className="my-2">
                <li><strong>Running Sum of 1d Array</strong> (LC 1480) — direct application. Build the prefix array.</li>
                <li><strong>Best Time to Buy and Sell Stock</strong> (LC 121) — single pass tracking <em>min so far</em>{" "}and <em>best profit so far</em>. The same &ldquo;single accumulator scan&rdquo; shape as Module 2&apos;s array sum.</li>
              </ul>
              For each, write down the time and space complexity in a comment at the top of your solution. Defend it.
            </div>
          </li>
        </ol>

        <h3>Stretch goals</h3>
        <ul>
          <li>Add an <code>Iterator&lt;E&gt;</code> so <code>for (E e : myList)</code> works.</li>
          <li>Add a <code>trimToSize()</code> that shrinks <code>elements</code> down to <code>size</code>. When would you actually want this?</li>
          <li>Compare your <code>copyCount</code> for n = 2^20 against the predicted ~2n from Module 3. They should match within a constant factor.</li>
          <li>Implement growth-by-1 (instead of doubling) and watch the run time on n = 100,000 versus your doubling version. Feel the n²/n gap.</li>
        </ul>

        <Callout variant="insight" title="Why this project, specifically">
          <p className="m-0">
            Implementing a dynamic array from scratch is the most common &ldquo;Java fundamentals&rdquo; interview project for a reason. It exercises generics, array covariance, bounds checking, the size/capacity split, the shift logic, and the doubling trick — all in maybe 80 lines. If you can write this cleanly under pressure, you&apos;ve cleared the bar for &ldquo;you understand collections.&rdquo;
          </p>
        </Callout>

      </section>
      </Checkpoint>

      {/* PART 6: FINAL QUIZ */}
      <Checkpoint moduleSlug="arrays" id="final" title="Final quiz" xp={30} celebration="Module 5 done. Onto strings.">
      <section>
        <h2>Final check</h2>

        <Quiz
          kind="Final"
          question="You're given a Java method that does list.add(0, x) inside a loop that runs n times, where list is an ArrayList. What's the total time complexity of the loop?"
          options={[
            { label: "O(n) — each add is amortized O(1).", explanation: "add(0, x) is not the amortized case. It's add(int, E), which shifts every existing element right one slot. That's O(current size), not O(1)." },
            { label: "O(n log n) — like sorting.", explanation: "Nothing here is logarithmic. There are no halving steps." },
            { label: "O(n²) — each add(0, x) shifts the whole list.", correct: true, explanation: "Right. Iteration k shifts k existing elements. Total shifts = 0 + 1 + 2 + ... + (n-1) = n(n-1)/2 = O(n²). This is the textbook 'wrong end of the list' trap." },
            { label: "O(2ⁿ) — geometric.", explanation: "The doubling growth gives O(n) total resize cost across n appends, not exponential. The shift cost here is what makes it quadratic — but quadratic, not exponential." },
          ]}
        />

        <Quiz
          kind="Final"
          question="An ArrayList<Integer> has been filled by appending n items, starting from default capacity. Approximately how much extra wasted capacity (size of backing array minus size) does it have, worst case?"
          options={[
            { label: "0 — Java tracks size exactly.", explanation: "Size is exact; capacity is not. The backing array is usually bigger than size — that's how doubling works." },
            { label: "Up to about n — the backing array can be nearly twice size.", correct: true, explanation: "Right. Just after a resize from capacity c to 2c, you've used c+1 slots out of 2c. Wasted capacity ≈ c - 1, which is ≈ size ≈ n — O(n). This is the memory cost of amortized O(1) appends. Call trimToSize() to reclaim it if you've stopped growing." },
            { label: "Constant — about 16 unused slots regardless of n.", explanation: "Constant overhead is independent of n. ArrayList's overhead grows with n — the backing array can be nearly 2× the size." },
            { label: "About log n — like the resize count.", explanation: "log n is the number of resizes that happened, not the wasted slots. Wasted slots is bounded by the most recent resize, which is O(n)." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which of these is NOT a sound use case for ArrayList?"
          options={[
            { label: "Reading lines from a file when you don't know how many there are.", explanation: "Solid use case. Append-as-you-go is exactly what dynamic arrays are for." },
            { label: "Storing the results of a for-loop transformation, indexed access by position.", explanation: "Append-then-index. Squarely in ArrayList's strength zone." },
            { label: "A queue where you frequently remove from the front and add at the back.", correct: true, explanation: "Right — this is the wrong tool. remove(0) is O(n) on ArrayList. ArrayDeque (Module 9) gives you O(1) on both ends." },
            { label: "Caching computed results for later O(1) lookup by index.", explanation: "Indexed lookup is what ArrayList is best at. Solid use case." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Given a sorted int[] arr and a target, why does the two-pointer technique work?"
          options={[
            { label: "Because arr[l] + arr[r] is unique for each (l, r).", explanation: "Sums aren't necessarily unique. Two pointers doesn't rely on uniqueness." },
            { label: "Because if the sum is too small, increasing l can only increase or keep the sum (sorted ⇒ arr[l+1] ≥ arr[l]); if too large, decreasing r can only decrease or keep it. Each step is provably correct.", correct: true, explanation: "Right. Sortedness gives a monotonicity guarantee that lets you safely 'discard' one pointer's current value without missing the answer. Without sortedness, you'd have to check more candidates." },
            { label: "Because the array is contiguous in memory.", explanation: "Contiguity is true but irrelevant — two pointers works on a sorted LinkedList too (just slower per step). Sortedness, not contiguity, is what makes the algorithm correct." },
            { label: "Because n is finite.", explanation: "Termination, not correctness. Two pointers terminates because pointers can't cross — but that doesn't explain why it finds the right answer when one exists." },
          ]}
        />

        <div className="my-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 p-8 text-white shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
            ✦ Phase 2 · Module {mod.number} complete
          </div>
          <h3 className="mt-0 mb-2 text-white">You can defend every line of ArrayList now</h3>
          <p className="mb-4 opacity-95">
            Indexing as address arithmetic. Doubling as the price of amortized O(1). The mid-array shift as the source of O(n) inserts. The size/capacity split. Prefix sums and two pointers as the first two named patterns.
          </p>
          <p className="mb-4 opacity-95">
            <strong>Up next: Module 6 — Strings &amp; string building.</strong>{" "}Strings are arrays in disguise (almost). The twist is immutability — and the trap of building a string with <code>+</code> in a loop.
          </p>
          <Link
            href="/courses/dsa/modules/strings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-amber-700 font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Module 6 — Strings &amp; string building →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="arrays" />
    </article>
  );
}
