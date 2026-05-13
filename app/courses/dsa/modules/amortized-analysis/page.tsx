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

const CHECKPOINTS = [
  { id: "setup", title: "The three cases" },
  { id: "best-avg-worst", title: "Best, average, worst" },
  { id: "amortized", title: "Amortized analysis" },
  { id: "patterns", title: "Where this shows up" },
  { id: "project", title: "Project: doubling simulator" },
  { id: "final", title: "Final quiz" },
];

export default function AmortizedAnalysisModule() {
  const mod = getModuleBySlug("amortized-analysis")!;

  // Bar chart of per-add cost in a doubling ArrayList. Most adds are 1 unit.
  // Resize adds spike at 1, 2, 4, 8, 16... — but the average over n adds is constant.
  // Per-add cost in a doubling ArrayList starting at capacity 1.
  // cost = 1 (write) + (copy count, only if resize triggered).
  // Resizes happen when size hits capacity: at adds #2 (copy 1), #3 (copy 2),
  // #5 (copy 4), #9 (copy 8). Most other adds are just a write.
  const doublingCost = `
flowchart LR
    A1["add 1<br/>cost 1"] --> A2["add 2<br/>cost 1+1"]
    A2 --> A3["add 3<br/>cost 1+2"]
    A3 --> A4["add 4<br/>cost 1"]
    A4 --> A5["add 5<br/>cost 1+4"]
    A5 --> A6["add 6<br/>cost 1"]
    A6 --> A7["add 7<br/>cost 1"]
    A7 --> A8["add 8<br/>cost 1"]
    A8 --> A9["add 9<br/>cost 1+8"]
    A9 --> A10["add 10..16<br/>cost 1 each"]
    style A1 fill:#10b981,color:#fff,stroke:#059669
    style A2 fill:#fb923c,color:#fff,stroke:#ea580c
    style A3 fill:#fb923c,color:#fff,stroke:#ea580c
    style A5 fill:#ef4444,color:#fff,stroke:#dc2626
    style A9 fill:#7f1d1d,color:#fff,stroke:#450a0a
    style A4 fill:#10b981,color:#fff,stroke:#059669
    style A6 fill:#10b981,color:#fff,stroke:#059669
    style A7 fill:#10b981,color:#fff,stroke:#059669
    style A8 fill:#10b981,color:#fff,stroke:#059669
    style A10 fill:#10b981,color:#fff,stroke:#059669
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/dsa" className="text-emerald-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Best, average, worst &amp; amortized analysis
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Why <code>ArrayList.add</code> is O(1) on average even though some calls do an O(n) resize. The accounting trick that makes it work.
        </p>
        <ModuleProgress moduleSlug="amortized-analysis" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: THE THREE CASES */}
      <Checkpoint moduleSlug="amortized-analysis" id="setup" title="The three cases" xp={15} celebration="Big-O is an envelope, not a single number. You can now talk about which envelope.">
      <section>
        <h2>Part 1: Big-O is an envelope, not a number</h2>

        <p>
          Until now, "what&apos;s the Big-O?" has been a single answer: O(n), O(log n), O(n²). One value.
        </p>
        <p>
          The truth is messier. Most algorithms have <em>different</em> Big-O depending on what you put into them. A linear search through a million elements: O(n) if the target is at the end, O(1) if it&apos;s at the start. Same algorithm. Two answers.
        </p>

        <Quiz
          kind="Gut check"
          question={"You linearly search a 1,000-element array for some value x. The Big-O is...?"}
          options={[
            { label: "O(n) — always.", explanation: "We say O(n), but that's only the worst case. If x is at index 0, the algorithm finishes after one comparison — O(1)." },
            { label: "O(1) on the best run, O(n) on the worst run.", correct: true, explanation: "Right. Same algorithm, three different Big-O answers depending on input — best, average, and worst. We usually quote worst, but the others are real and matter." },
            { label: "O(log n) — modern Java optimizes this.", explanation: "There's no halving here, and the JIT doesn't change asymptotic shape. Linear search is linear." },
            { label: "Unanswerable without the input.", explanation: "Closer, but we CAN answer it — three answers, one per case (best/avg/worst). That's the whole point of the three-case framework." },
          ]}
        />

        <h3>Three flavors of Big-O</h3>

        <p>For every algorithm, you can ask three questions:</p>
        <ul>
          <li><strong>Best case</strong> — the input that makes the algorithm finish fastest. Often artificial, rarely the right answer to quote.</li>
          <li><strong>Average case</strong> — the expected behavior over a typical distribution of inputs. Honest, but requires you to define "typical."</li>
          <li><strong>Worst case</strong> — the input that makes the algorithm run slowest. Pessimistic, robust, the default in interviews.</li>
        </ul>

        <Callout variant="insight" title="When in doubt, quote the worst case">
          <p className="m-0">
            Worst case is the conservative answer. It&apos;s a guarantee: <em>this algorithm will not be slower than this</em>, no matter what input you throw at it. If someone asks "what&apos;s the time complexity?" without qualifying, they almost always mean worst case. You can volunteer the others — but lead with worst.
          </p>
        </Callout>

        <h3>The analogy: rush hour</h3>

        <p>
          Your morning commute. You drive 10 miles to the office.
        </p>
        <ul>
          <li><strong>Best case</strong>: it&apos;s a holiday, every light is green. 12 minutes.</li>
          <li><strong>Average case</strong>: typical Tuesday traffic. 25 minutes.</li>
          <li><strong>Worst case</strong>: pile-up on the highway, side streets clogged. 80 minutes.</li>
        </ul>
        <p>
          When your boss asks "how long will it take?" — what do you say? You don&apos;t say 12. You don&apos;t even say 25 if you want to be safe. You give yourself a buffer. That&apos;s worst-case thinking.
        </p>
        <p>
          Same idea here. Best is the daydream. Average is the typical experience. Worst is the SLA you can actually promise.
        </p>

        <PartRecap
          title="Part 1 recap"
          gist="Big-O isn't one answer per algorithm. It's three — best, average, worst — and we usually quote the worst."
          points={[
            { takeaway: "Best/average/worst describe how an algorithm behaves on different INPUTS, not how it changes over time.", detail: "Linear search is the canonical example: O(1) if the target is first, O(n) if it's last, O(n) on average. All three are properties of the same algorithm." },
            { takeaway: "Worst case is the default. It's the only one that makes a guarantee.", detail: "If someone says 'this is O(n²)' without qualifying, they almost always mean worst case. It's the SLA you can promise." },
            { takeaway: "Average case requires a probability model — 'typical' inputs. Best case is usually a curiosity.", detail: "The honest answer to 'how fast on average?' depends on what you assume the inputs look like. That's why interviewers usually ask for worst." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: BEST, AVERAGE, WORST */}
      <Checkpoint moduleSlug="amortized-analysis" id="best-avg-worst" title="Best, average, worst" xp={15} celebration="You can now articulate the three cases for any algorithm — not just one.">
      <section>
        <h2>Part 2: Best, average, worst — in code</h2>

        <p>Three concrete examples. Same code, three Big-Os.</p>

        <h3>Example 1: linear search</h3>

        <CodeBlock lang="java">{`int find(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`}</CodeBlock>

        <ul>
          <li><strong>Best</strong>: target is at index 0. One comparison. <strong>O(1)</strong>.</li>
          <li><strong>Average</strong>: target is at a random position. On average we walk halfway through. ~n/2 comparisons. <strong>O(n)</strong>.</li>
          <li><strong>Worst</strong>: target is at the last index, or not present at all. n comparisons. <strong>O(n)</strong>.</li>
        </ul>

        <p>Best is O(1). Average and worst are both O(n) — different constant factors (n/2 vs n) but the same growth class.</p>

        <h3>Example 2: insertion sort</h3>

        <CodeBlock lang="java">{`void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {   // shift right
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`}</CodeBlock>

        <ul>
          <li><strong>Best</strong>: input is already sorted. The inner <code>while</code> never enters the body. n outer iterations × 1 comparison = <strong>O(n)</strong>.</li>
          <li><strong>Average</strong>: inputs are randomly shuffled. The inner loop runs on average i/2 times. Total ≈ n²/4 = <strong>O(n²)</strong>.</li>
          <li><strong>Worst</strong>: input is sorted in reverse. Every element shifts to the front. Total = n²/2 = <strong>O(n²)</strong>.</li>
        </ul>

        <Callout variant="info" title="This is why insertion sort still ships">
          <p className="m-0">
            Insertion sort is O(n²) worst case — bad. But it&apos;s O(n) on already-sorted (or nearly-sorted) input — great. That&apos;s why <code>Arrays.sort</code> in Java falls back to insertion sort for small partitions: in those, the input is often "nearly sorted" already, and the constants beat anything fancier.
          </p>
        </Callout>

        <h3>Example 3: hash map lookup</h3>

        <CodeBlock lang="java">{`Map<String, Integer> m = new HashMap<>();
m.get(key);   // what's the Big-O?`}</CodeBlock>

        <ul>
          <li><strong>Best</strong>: zero collisions, immediate hit. <strong>O(1)</strong>.</li>
          <li><strong>Average</strong>: well-distributed hashes. <strong>O(1)</strong> — the canonical "amortized constant."</li>
          <li><strong>Worst</strong>: every key hashes to the same bucket. The bucket becomes a list, and lookup is <strong>O(n)</strong>. (Java 8+ converts long buckets to red-black trees, so it&apos;s actually O(log n) — but that&apos;s a Java-specific detail.)</li>
        </ul>

        <p>This is why "HashMap is O(1)" comes with an asterisk. Average is O(1) — and average is what you experience 99.99% of the time. But the worst case lurks.</p>

        <WorkedExample
          title="Why we don't always quote worst"
          subtitle="Sometimes worst case is so unlikely that average tells the better story."
          steps={[
            {
              title: "The problem with quoting worst",
              body: (
                <p>HashMap worst case is O(n). If you took that seriously, you&apos;d never use a HashMap for anything performance-sensitive — even though every real measurement says it&apos;s blazing fast.</p>
              ),
            },
            {
              title: "Why worst case is misleading here",
              body: (
                <p>Worst case requires every key to hash to the same bucket. With a decent hash function and any realistic input, this is statistically near-impossible. The probability is so low that it&apos;s not the right number to quote.</p>
              ),
            },
            {
              title: "What we say instead",
              body: (
                <p><strong>"O(1) average, O(n) worst."</strong> Both numbers, with context. That&apos;s the honest answer. In practice, you&apos;ll write "O(1)" on a whiteboard and add the worst-case footnote if asked.</p>
              ),
            },
          ]}
        />

        <h3>Drill: name the three cases</h3>

        <Quiz
          kind="Quick check"
          question={"What's the BEST-case time of bubble sort with an early-exit (skip the next pass if no swaps happened)?\n\nvoid bubbleSort(int[] arr) {\n    for (int i = 0; i < arr.length; i++) {\n        boolean swapped = false;\n        for (int j = 0; j < arr.length - 1 - i; j++) {\n            if (arr[j] > arr[j + 1]) {\n                int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;\n                swapped = true;\n            }\n        }\n        if (!swapped) return;\n    }\n}"}
          options={[
            { label: "O(n²) — bubble sort is always n².", explanation: "That's the worst case. With early-exit, the BEST case is much better." },
            { label: "O(n)", correct: true, explanation: "Right. On already-sorted input, the inner loop does n - 1 comparisons, sets no swaps, and we return early. One outer pass, O(n) work." },
            { label: "O(log n)", explanation: "There's no halving here. Best case is one full pass — that's n, not log n." },
            { label: "O(1)", explanation: "We still have to verify the array is sorted — that requires reading every element. Best case is O(n), not constant." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Quicksort's worst case is O(n²) — but it's the GO-TO sort in most standard libraries. Why?"
          options={[
            { label: "Because the worst case rarely happens with good pivot choice.", correct: true, explanation: "Right. Quicksort's AVERAGE case is O(n log n), and the constants are smaller than merge sort. With randomized or median-of-three pivots, the worst case is statistically unreachable. So we use it — and accept the trade-off." },
            { label: "Because Java optimizes it.", explanation: "Java doesn't change asymptotic complexity. The reason is structural: average case dominates real performance, and quicksort's average is excellent." },
            { label: "Because it's O(1) memory.", explanation: "Quicksort is O(log n) auxiliary stack space — not O(1). And merge sort is O(n) — yes, that's a real factor, but not the main reason." },
            { label: "Because nobody cares about big inputs.", explanation: "Standard libraries care about big inputs more than anyone. The reason is average-case performance." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Three cases: best (the dream), average (typical), worst (the guarantee). They can be wildly different."
          points={[
            { takeaway: "Insertion sort: O(n) best, O(n²) average and worst. The best case is why it ships in standard libraries.", detail: "Already-sorted input runs in linear time. That's why hybrid sorts like Java's Arrays.sort use insertion sort on small partitions — those are often nearly sorted, and the constants are tiny." },
            { takeaway: "HashMap: O(1) best and average, O(n) worst. Average is what we quote because worst is statistically unreachable.", detail: "All-keys-collide is a worst case so unlikely with good hash functions that quoting it is misleading. We say 'O(1)' and add the asterisk on demand." },
            { takeaway: "Quicksort: O(n log n) best and average, O(n²) worst. Used everywhere because average case dominates real workloads.", detail: "With randomized pivots, the worst case is statistically near-impossible. The smaller constants and lower space cost beat merge sort in practice." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3: AMORTIZED ANALYSIS */}
      <Checkpoint moduleSlug="amortized-analysis" id="amortized" title="Amortized analysis" xp={20} celebration="You now understand why ArrayList.add is O(1) — and you can prove it.">
      <section>
        <h2>Part 3: Amortized analysis — the fourth case</h2>

        <p>
          There&apos;s a fourth Big-O number, and it&apos;s the one you&apos;ll actually need to defend in interviews: <strong>amortized cost</strong>.
        </p>
        <p>
          Amortized analysis answers: <em>over a sequence of n operations, what&apos;s the average cost per operation?</em> Not "average over inputs" (that&apos;s average case). Not "worst single operation" (that&apos;s worst case). Average <em>over time</em>, across a series of operations on the same data structure.
        </p>

        <h3>The motivating example: ArrayList.add</h3>

        <p>You&apos;ve called <code>list.add(x)</code> a million times. What&apos;s the time complexity?</p>

        <p>Here&apos;s how Java&apos;s <code>ArrayList</code> works:</p>
        <ul>
          <li>It holds an internal <code>Object[]</code> array, with a <em>capacity</em> bigger than its current size.</li>
          <li>Most adds just write to the next empty slot. <strong>O(1)</strong>.</li>
          <li>When the array is full, ArrayList allocates a NEW array — typically 1.5× or 2× the size — and copies every element over. <strong>O(n)</strong> for that one call.</li>
        </ul>

        <Callout variant="warn" title="Wait — so add() is O(n)?">
          <p className="m-0">
            If you only quote worst case, yes. Some calls trigger a resize and copy n elements. But that&apos;s misleading — it happens <em>rarely</em>, and the rest are blazing fast. We need a better number.
          </p>
        </Callout>

        <h3>The doubling trick, in pictures</h3>

        <p>Here are the first 16 adds to a list that doubles when full, starting at capacity 1:</p>

        <Mermaid chart={doublingCost} />

        <p>Each add costs <strong>1 to write the new slot</strong>, plus — if the array was already full — the cost of copying every existing element into the bigger array:</p>
        <ul>
          <li>Add 1: free slot in cap-1 array. Cost = 1.</li>
          <li>Add 2: full (size 1, cap 1) → resize cap to 2, copy 1 element, then write. Cost = 1 + 1 = 2.</li>
          <li>Add 3: full (size 2, cap 2) → resize cap to 4, copy 2 elements, then write. Cost = 1 + 2 = 3.</li>
          <li>Add 4: free slot. Cost = 1.</li>
          <li>Add 5: full (size 4, cap 4) → resize cap to 8, copy 4, then write. Cost = 1 + 4 = 5.</li>
          <li>Adds 6, 7, 8: free slots. 1 each.</li>
          <li>Add 9: full (size 8, cap 8) → resize cap to 16, copy 8, then write. Cost = 1 + 8 = 9.</li>
          <li>Adds 10..16: free slots. 1 each.</li>
        </ul>

        <p>The expensive resizes hit when the array fills at sizes 1, 2, 4, 8, 16, ... — powers of 2. Each resize copies exactly that many elements.</p>

        <h3>The proof: total cost of n adds</h3>

        <WorkedExample
          title="Why n adds = O(n) total work"
          subtitle="Sum the resize costs. Watch them collapse to a constant per add."
          steps={[
            {
              title: "Total work for n adds",
              body: (
                <>
                  <p>Doing n adds (assume n is a power of 2 for clean arithmetic), resizes happen when the array fills at sizes 1, 2, 4, 8, ..., n/2. The resize at size k copies k elements into a new array of capacity 2k.</p>
                  <p>So the total <em>copy</em> work across all resizes is:</p>
                  <CodeBlock lang="plain">{`1 + 2 + 4 + 8 + ... + n/2
   = n - 1   (geometric series: 2^0 + 2^1 + ... + 2^(k-1) = 2^k - 1, with 2^k = n)`}</CodeBlock>
                  <p>Plus n simple writes (one per add — every add writes its element into the array). Grand total:</p>
                  <CodeBlock lang="plain">{`Total work for n adds  ≈  n + (n − 1)  ≈  2n`}</CodeBlock>
                </>
              ),
            },
            {
              title: "Divide by n to get amortized cost",
              body: (
                <>
                  <p>The amortized cost per add is the total work divided by the number of operations:</p>
                  <CodeBlock lang="plain">{`Amortized cost per add  ≈  2n / n  =  2  =  O(1)`}</CodeBlock>
                  <p>Constant. That&apos;s the magic. <strong>Even though some calls do O(n) work, the average over n calls is O(1).</strong> You&apos;ll see this exact ratio (~2) when you run the simulator in Part 5.</p>
                </>
              ),
            },
            {
              title: "Why doubling matters",
              body: (
                <>
                  <p>The doubling is what makes the math work. If we resized by adding a constant (say, +10) instead of doubling:</p>
                  <CodeBlock lang="plain">{`Resize when size hits 10, 20, 30, ..., n  (every 10 adds)
Each resize at size k copies k elements.
Total copy work = 10 + 20 + ... + n
                ≈ n² / 20   (arithmetic series — grows like n²)
Amortized cost per add  ≈  (n²/20) / n  =  n/20  =  O(n)   ❌`}</CodeBlock>
                  <p>That&apos;s why every dynamic array — Java&apos;s ArrayList, C++&apos;s vector, Python&apos;s list, Go slices — uses geometric (1.5× or 2×) growth, not arithmetic. The amortized math only works for geometric growth.</p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="insight" title="Amortized = average per operation, over a SEQUENCE">
          <p className="m-0">
            "Amortized O(1)" doesn&apos;t mean "every call is O(1)." It means: if you do n calls, the total work is O(n), so on average each call did O(1) work. Some calls were expensive — but they&apos;re rare, and we paid for them by being cheap on the others.
          </p>
        </Callout>

        <h3>The accountant's view</h3>

        <p>
          There&apos;s a slick mental model called the <strong>accounting method</strong> that gives a clean (slightly looser) upper bound. Pretend every cheap add "saves up credit" for the future expensive resize.
        </p>
        <p>
          Charge each add a flat 3 units of cost. 1 unit pays for the write. The other 2 units go into a savings account, pinned to that element. Between resizes, the array doubles in size — so when the array is full at capacity c, the c/2 most recent adds (the ones inserted since the last resize) have each saved 2 units. That&apos;s c/2 × 2 = c credits in the bank — exactly enough to pay for the c-element copy.
        </p>
        <p>
          So the resize is "free" — it&apos;s paid for by the credits that previous adds saved. Every add costs a constant 3 units. <strong>Amortized O(1).</strong>
        </p>
        <Callout variant="info" title="Aggregate gave us 2, accounting gave us 3 — both are O(1)">
          <p className="m-0">
            Aggregate analysis (summing the actual costs) gives the tight bound of <strong>~2 per add</strong>. The accounting method gives a looser <strong>3 per add</strong> upper bound, but with a beautiful credit-and-savings argument. Both are O(1), which is all we care about asymptotically. You&apos;ll meet the third technique — the <em>potential method</em> — if you take a graduate algorithms class. For interviews, aggregate is enough.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="If ArrayList resized by adding 100 each time instead of doubling, what would the amortized cost of add() be?"
          options={[
            { label: "Still O(1) — resizing is rare.", explanation: "Not rare enough! Resize happens every 100 adds, and each resize copies n elements. Total work grows like n²." },
            { label: "O(n)", correct: true, explanation: "Right. Arithmetic growth means resize-copy work sums to ~n²/200 (resizes happen at sizes 100, 200, ..., n, copying that many each time). Divided by n = ~n/200 = O(n) per add. Doubling is what makes the geometric series collapse — arithmetic growth doesn't." },
            { label: "O(log n)", explanation: "log n shows up when something halves. Here we're adding a fixed amount, not halving anything." },
            { label: "O(n²)", explanation: "We're asking about cost PER add, not total. Total is O(n²); per add is O(n)." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which statement about amortized O(1) is TRUE?"
          options={[
            { label: "Every call is O(1).", explanation: "Not every call! Some calls trigger an O(n) resize. Amortized is the AVERAGE over n calls, not a guarantee on each one." },
            { label: "The total work over n calls is O(n).", correct: true, explanation: "Right. That's the definition of amortized O(1) — n operations cost O(n) total, so on average each one cost O(1). Individual calls can spike." },
            { label: "Worst case is O(1).", explanation: "Worst case for ArrayList.add is O(n) — the resize-and-copy. Amortized is a different number that talks about averages over a sequence." },
            { label: "It's the same as 'average case.'", explanation: "Different concept. Average case is across inputs; amortized is across a sequence of operations on one data structure." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"You make 1,000,000 add() calls to an empty ArrayList. Approximately how many element-COPIES (not new writes) happen across all the resizes combined?"}
          options={[
            { label: "About 1,000,000.", correct: true, explanation: "Right. Resizes copy 1 + 2 + 4 + 8 + … + 524,288 ≈ 1,048,575 ≈ n elements total. The geometric sum 2^0 + 2^1 + ... + 2^(k-1) collapses to 2^k − 1, which is ≈ n. That's why amortized works — total copies stay linear in n." },
            { label: "About 2,000,000.", explanation: "A common slip: people double the answer thinking the geometric sum is ~2n. It's not — sum of 2^0 + ... + 2^(k-1) = 2^k − 1 ≈ n, not 2n. Off by a factor of 2." },
            { label: "About log₂(1,000,000) ≈ 20.", explanation: "There are ~20 resize EVENTS, but each one copies more elements than the last. Total copies sum to ~n, not the count of events." },
            { label: "About 1,000,000² = 10¹²", explanation: "If we resized constantly that would happen, but doubling means resize events are exponentially spaced." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Amortized = total work over a sequence, divided by the number of operations. The fourth case."
          points={[
            { takeaway: "Amortized analysis answers: 'over n operations, what was the average cost per operation?'", detail: "Different from average case (which averages over inputs). Amortized averages over time, across a sequence of operations on the same data structure." },
            { takeaway: "ArrayList.add is amortized O(1) because resizes double the array, making the copy work sum to a geometric series.", detail: "Total work = n writes + sum of copy costs (1 + 2 + 4 + ... + n/2 ≈ n − 1). Total ≈ 2n. Per add: ~2 = O(1). The doubling is doing the heavy lifting — geometric series collapse, arithmetic ones don't." },
            { takeaway: "If a dynamic array resized by a CONSTANT instead of doubling, amortized cost would be O(n), not O(1).", detail: "Arithmetic growth makes the resize costs sum to n²/2, killing the amortization. This is why every modern dynamic array uses geometric growth." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 4: WHERE THIS SHOWS UP */}
      <Checkpoint moduleSlug="amortized-analysis" id="patterns" title="Where this shows up" xp={15} celebration="The pattern is portable. You'll spot amortization in five common data structures.">
      <section>
        <h2>Part 4: Where amortization shows up in the wild</h2>

        <p>
          Amortized O(1) isn&apos;t a one-off trick for ArrayList. It&apos;s a recurring pattern in data-structure design. Once you see it, you&apos;ll recognize it everywhere.
        </p>

        <h3>The catalog</h3>

        <ul>
          <li>
            <strong>Dynamic array (ArrayList, ArrayDeque, StringBuilder).</strong> Resizes geometrically. <code>add</code>, <code>append</code>, <code>offerLast</code> are amortized O(1). Worst single call is O(n).
          </li>
          <li>
            <strong>HashMap (and HashSet).</strong> When the load factor exceeds a threshold (0.75 in Java), the table doubles in capacity and rehashes every entry. <code>put</code> and <code>get</code> are amortized O(1). Worst single call is O(n).
          </li>
          <li>
            <strong>Splay trees.</strong> A self-adjusting BST. Single operations can be O(n), but any sequence of m operations is O(m log n) — so amortized O(log n) per op.
          </li>
          <li>
            <strong>Union-Find with path compression.</strong> Each individual operation can be slow, but amortized cost per op is nearly O(1) (technically inverse Ackermann, which is &le; 4 for any conceivable n).
          </li>
          <li>
            <strong>Stacks with multipop.</strong> A classic textbook example: <code>multipop(k)</code> pops k items, costing O(k). But across a sequence, the total pop work is bounded by the total push work — so push and multipop are both amortized O(1).
          </li>
        </ul>

        <Callout variant="info" title="The pattern: rare expensive operation, paid for by frequent cheap ones">
          <p className="m-0">
            Every amortized-O(1) data structure works the same way: most operations are dirt cheap, and they implicitly "save up" for the rare expensive ones. The amortized number is what you tell users. The worst case is what you watch out for in latency-sensitive systems.
          </p>
        </Callout>

        <h3>When amortized isn&apos;t good enough</h3>

        <p>
          For most code, amortized O(1) is fine — your throughput is what matters. But for some systems, the worst-case spike is itself the problem.
        </p>
        <ul>
          <li><strong>Real-time systems.</strong> A pacemaker can&apos;t tolerate a 50ms hiccup once every 1000 operations, even if the throughput is great.</li>
          <li><strong>P99 latency targets.</strong> If 1 in 1000 requests takes 100× longer, your P99 is dominated by the resize. Amortized math doesn&apos;t care about percentiles; production does.</li>
          <li><strong>GC-sensitive workloads.</strong> The resize allocates a fresh array, and the old one becomes garbage. Big resizes mean big GC pauses.</li>
        </ul>
        <p>
          The fix in those cases: pre-size the structure (<code>new ArrayList&lt;&gt;(expectedSize)</code>) so no resize ever happens, or pick a different data structure with a better worst case.
        </p>

        <h3>Drill: classify these operations</h3>

        <ClassifyChallenge
          title="Drag each operation into its TIME-complexity bucket"
          prompt="The complexity flavor that best describes the operation. (Pick the one most useful to communicate — sometimes that's amortized, sometimes worst.)"
          buckets={[
            { id: "constant", label: "True O(1)", color: "emerald" },
            { id: "amortized", label: "Amortized O(1)", color: "indigo" },
            { id: "worst-on", label: "Worst-case O(n)", color: "rose" },
          ]}
          items={[
            { id: "arr-add", label: "ArrayList.add(x) at the end", answer: "amortized", explanation: "Most adds are O(1); rare resizes are O(n); average over n adds is O(1) thanks to doubling." },
            { id: "hash-put", label: "HashMap.put(k, v)", answer: "amortized", explanation: "Most puts are O(1); rare rehashes are O(n); amortized O(1) per put." },
            { id: "arr-get", label: "ArrayList.get(i) by index", answer: "constant", explanation: "Indexed access is genuinely O(1) every call — direct array lookup, no resize possible." },
            { id: "stack-push", label: "ArrayDeque.push(x)", answer: "amortized", explanation: "ArrayDeque is array-backed and grows geometrically — same amortized story as ArrayList." },
            { id: "stack-peek", label: "ArrayDeque.peek()", answer: "constant", explanation: "Just reads the head/tail slot. No resize, no allocation, true O(1)." },
            { id: "linear-search", label: "Linear search of an unsorted int[]", answer: "worst-on", explanation: "Worst case the target is at the end (or absent) — n comparisons. No amortization story." },
            { id: "list-contains", label: "ArrayList.contains(x) — linear scan", answer: "worst-on", explanation: "Same as linear search — every call is O(n) worst case, no clever amortization." },
            { id: "hash-resize-call", label: "The single HashMap.put call that triggers a rehash", answer: "worst-on", explanation: "Looking at one specific call, not the average — that single put copies n entries, so it's O(n)." },
            { id: "hash-get-typical", label: "HashMap.get(k) for an existing key", answer: "constant", explanation: "get() never resizes. Hash to bucket, follow short chain. True O(1) on average." },
            { id: "arr-add-no-resize", label: "ArrayList.add(x) when capacity has slack", answer: "constant", explanation: "If you pre-sized the list, every add is genuinely O(1) — no resize possible." },
          ]}
        />

        <h3>Why this changes the answer to interview questions</h3>

        <Quiz
          kind="Quick check"
          question="An interviewer asks: 'What's the time complexity of inserting n items into a fresh HashMap?' Best answer?"
          options={[
            { label: "O(n²) — each insert is O(n) worst case, n inserts = n².", explanation: "Worst case is technically O(n) per put, but the rehashes are rare. Amortized analysis tells us the total work is O(n)." },
            { label: "O(n) — amortized O(1) per put × n puts.", correct: true, explanation: "Right. Even though some puts trigger an O(n) rehash, the amortized cost is O(1) per put. n puts total = O(n) work overall." },
            { label: "O(n log n).", explanation: "log n would show up if HashMap did logarithmic work per put — but it doesn't. Amortized is O(1)." },
            { label: "O(1).", explanation: "n puts can't be O(1) total — that'd be sublinear in n. We mean O(1) PER put, but n puts total is O(n)." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"You're benchmarking a service with strict P99 latency targets. Should you use ArrayList or LinkedList for an append-heavy workload?"}
          options={[
            { label: "ArrayList — amortized O(1) is faster than LinkedList's actual O(1).", explanation: "True for throughput, but at the P99 you'll see the resize spikes. P99 doesn't care about averages." },
            { label: "LinkedList — its append is genuinely O(1) per call, no spikes.", correct: true, explanation: "Right. For P99-sensitive code, predictable per-operation cost beats slightly-better average. LinkedList's append is true O(1), every call. ArrayList's append is amortized O(1) but spikes when it resizes." },
            { label: "Either — the JIT will fix it.", explanation: "The JIT does great work, but it doesn't turn an O(n) array copy into O(1)." },
            { label: "Neither — use a HashMap.", explanation: "HashMap has the same amortized-vs-worst issue (rehashes). Doesn't solve the latency problem." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Amortized O(1) shows up everywhere. Most of the time it's the right number — but not always."
          points={[
            { takeaway: "ArrayList, HashMap, ArrayDeque, StringBuilder, splay trees, union-find — all amortized.", detail: "If a data structure has a 'rare expensive resize/rebalance,' it's probably running amortized analysis. The pattern is: cheap most of the time, expensive occasionally, stays cheap on average." },
            { takeaway: "Geometric growth (2× or 1.5×) is what makes amortized O(1) work for dynamic arrays.", detail: "Arithmetic growth (+constant each time) breaks the math. The resize cost has to be exponentially spaced, not arithmetic." },
            { takeaway: "Amortized is the wrong number when the worst-case spike itself is the problem.", detail: "Real-time systems, P99 latency targets, GC-sensitive paths — these care about the spikes, not the average. Pre-size your structures or pick true-O(1) alternatives." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 5: PROJECT */}
      <Checkpoint moduleSlug="amortized-analysis" id="project" title="Project: doubling simulator" xp={25} manual manualLabel="I built it and saw the amortized average flatten" celebration="You watched the math work. Doubling collapses the resize cost — and you have the data to prove it.">
      <section>
        <h2>Part 5: Project — amortized-cost simulator</h2>

        <p>
          You&apos;re going to build a simple dynamic-array clone in Java, log the cost of every operation, and plot the rolling average. The goal: <em>see</em> the amortized line flatten while individual operations spike.
        </p>

        <h3>The setup</h3>

        <p>Same Maven setup as the previous projects. One Java file, no dependencies.</p>

        <CodeBlock lang="plain" caption="pom.xml — minimal">{`<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.skillforge</groupId>
    <artifactId>amortized-lab</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
</project>`}</CodeBlock>

        <h3>Step 1: a dynamic array that logs every cost</h3>

        <p>Build a minimal <code>DynamicArray</code> that doubles when full, exposes a per-op cost counter, and supports two growth strategies so we can compare them.</p>

        <CodeBlock lang="java" caption="src/main/java/com/skillforge/AmortizedLab.java">{`package com.skillforge;

import java.util.Arrays;

public class AmortizedLab {

    // Two growth strategies — toggle to compare.
    enum Growth { DOUBLE, ADD_TEN }

    static class DynamicArray {
        Object[] data;
        int size = 0;
        long totalCost = 0;
        final Growth growth;

        DynamicArray(int initialCap, Growth growth) {
            this.data = new Object[Math.max(initialCap, 1)];
            this.growth = growth;
        }

        // Returns the cost of THIS add (1 if no resize, else 1 + size to copy).
        long add(Object x) {
            long thisCost = 1;
            if (size == data.length) {
                int newCap = (growth == Growth.DOUBLE)
                    ? data.length * 2
                    : data.length + 10;
                Object[] bigger = new Object[newCap];
                for (int i = 0; i < size; i++) bigger[i] = data[i];   // O(size) copy
                thisCost += size;                                      // record copy cost
                data = bigger;
            }
            data[size++] = x;
            totalCost += thisCost;
            return thisCost;
        }
    }

    public static void main(String[] args) {
        for (Growth g : Growth.values()) runExperiment(g, 10_000);
    }

    static void runExperiment(Growth g, int n) {
        DynamicArray a = new DynamicArray(1, g);

        // Print at strategic checkpoints — powers of 2 plus the final i.
        // (For DOUBLE these are mid-cycle, so 'this op' is just 1 — but the
        // amortized average is the interesting column anyway.)
        int[] watchpoints = {1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, n};

        System.out.printf("%n─── Growth strategy: %s ───%n", g);
        System.out.printf("%-6s %-10s %-12s %-14s%n", "i", "this op", "total", "amortized avg");

        int wp = 0;
        for (int i = 1; i <= n; i++) {
            long thisCost = a.add(i);
            if (wp < watchpoints.length && i == watchpoints[wp]) {
                double avg = (double) a.totalCost / i;
                System.out.printf("%-6d %-10d %-12d %.3f%n", i, thisCost, a.totalCost, avg);
                wp++;
            }
        }
    }
}`}</CodeBlock>

        <h3>Step 2: run it and look at the numbers</h3>

        <p>Run with <code>mvn -q compile exec:java -Dexec.mainClass=com.skillforge.AmortizedLab</code>. You&apos;ll see something like:</p>

        <CodeBlock lang="plain">{`─── Growth strategy: DOUBLE ───
i      this op    total        amortized avg
1      1          1            1.000
2      2          3            1.500    ← resize: copy 1
4      1          7            1.750
8      1          15           1.875
16     1          31           1.938
32     1          63           1.969
64     1          127          1.984
128    1          255          1.992
256    1          511          1.996
512    1          1023         1.998
1024   1          2047         1.999
2048   1          4095         2.000
4096   1          8191         2.000
10000  1          ~19999       ~2.000

─── Growth strategy: ADD_TEN ───
i      this op    total        amortized avg
1      1          1            1.000
2      2          3            1.500    ← resize: copy 1
4      1          5            1.250
8      1          9            1.125
16     1          28           1.750    ← cumulative copies catching up
32     1          65           2.031
64     1          281          4.391
128    1          921          7.195
256    1          3532         13.797
512    1          13824        27.000
1024   1          53657        52.399
2048   1          211353       103.200
4096   1          842956       205.800
10000  1          ~5,005,000   ~500.500     ← growing without bound!`}</CodeBlock>

        <p>Two things should jump out at you:</p>
        <ol>
          <li>
            With <strong>doubling</strong>, the amortized average converges to <strong>~2</strong> and stays there, no matter how big n gets. (The "this op" column shows mostly 1s at our power-of-2 watchpoints because resizes happen at sizes 2, 3, 5, 9, 17, … — feel free to print every i and watch the spikes if you want a visceral feel.) <em>That converging average is the proof.</em>
          </li>
          <li>
            With <strong>add-ten</strong> growth, the amortized average <strong>climbs forever</strong>. At n = 10,000 it&apos;s ~500. At n = 100,000 it&apos;d be ~5,000. That&apos;s O(n) per add — the bad math we predicted.
          </li>
        </ol>

        <Callout variant="insight" title="The graph that should be in every textbook">
          <p className="m-0">
            Plot &quot;this op cost&quot; on a log scale and the amortized line as a flat horizontal line. The doubling growth shows spikes that grow linearly between flat valleys — but the average traces a flat line. That&apos;s amortization, made visible.
          </p>
        </Callout>

        <h3>Step 3: the pre-size optimization</h3>

        <p>One last variant. What if you knew up front you were going to add 10,000 elements?</p>

        <CodeBlock lang="java">{`// In main, add:
DynamicArray pre = new DynamicArray(10_000, Growth.DOUBLE);
for (int i = 0; i < 10_000; i++) pre.add(i);
System.out.printf("%nPre-sized: 10k adds, total cost = %d%n", pre.totalCost);
// Output: Pre-sized: 10k adds, total cost = 10000`}</CodeBlock>

        <p>
          Total cost = exactly n. No resizes. No copies. This is what <code>new ArrayList&lt;&gt;(expectedSize)</code> buys you: you skip the amortized math entirely and get true O(1) per add.
        </p>

        <h3>Stretch goals (optional)</h3>
        <ul>
          <li><strong>Try 1.5× growth.</strong> Java&apos;s ArrayList actually grows by 1.5×, not 2×. Implement <code>newCap = data.length + (data.length &gt;&gt; 1)</code> and confirm the amortized average converges (slightly higher than 2).</li>
          <li><strong>Add shrink.</strong> When size drops below capacity/4, halve the capacity. What&apos;s the amortized cost now? (Hint: still O(1), but you have to halve at /4, not /2 — otherwise you&apos;d be ping-ponging.)</li>
          <li><strong>Plot it.</strong> Pipe the output to CSV and graph in Excel. Two lines: per-op cost (spiky), amortized average (flat). The picture is the lesson.</li>
          <li><strong>Compare to ArrayList.</strong> Time 10 million adds to a fresh <code>ArrayList&lt;Integer&gt;</code> vs your DynamicArray. They should be in the same ballpark — the JVM and ArrayList are doing exactly what you just built.</li>
        </ul>
      </section>
      </Checkpoint>

      {/* PART 6: FINAL */}
      <Checkpoint moduleSlug="amortized-analysis" id="final" title="Final quiz" xp={20} celebration="That's Phase 1 complete. Big-O, space, and amortized — the full complexity foundation is loaded.">
      <section>
        <h2>Part 6: Final quiz</h2>
        <p>Mixed final, covering best/avg/worst and amortized.</p>

        <Quiz
          kind="Final"
          question="An algorithm runs in O(1) best, O(n) average, O(n²) worst. The interviewer asks for 'the' time complexity. You should answer:"
          options={[
            { label: "O(1) — give them the best news.", explanation: "Best case is the daydream. Quoting it without context is misleading." },
            { label: "O(n²) and stop there.", explanation: "Worst case is the right starting answer, but you should signal that you know the others. 'O(n²) worst case, O(n) average' is a stronger answer." },
            { label: "Lead with worst, mention the others if relevant.", correct: true, explanation: "Right. 'O(n²) worst case' is the conservative answer. Then optionally add 'O(n) on average' or 'O(1) on already-sorted input.' That signals you understand all three." },
            { label: "Average — that's what users experience.", explanation: "Closer for some questions, but 'average' depends on the input distribution. Worst case is the safer default unless the interviewer specifies." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which of these is genuinely amortized O(1) — not just 'usually fast'?"
          options={[
            { label: "Linear search of an array.", explanation: "Linear search has no amortization story — it's O(n) worst, O(n) average, every call independent." },
            { label: "ArrayList.add at the end (no index given).", correct: true, explanation: "Right. This is THE canonical amortized O(1). Most adds are O(1); the rare resize is O(n); the average over n adds is O(1) because of geometric growth." },
            { label: "ArrayList.add(0, x) — inserting at the beginning.", explanation: "That's O(n) every call — every existing element shifts right. No amortization helps." },
            { label: "ArrayList.contains(x).", explanation: "That's a linear scan — O(n) worst case, no amortization." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"Which best describes 'amortized O(1)'?"}
          options={[
            { label: "Every individual call is O(1).", explanation: "False — that would be 'true O(1).' Amortized allows individual spikes." },
            { label: "The total cost of n calls is O(n), so per-call cost is O(1) on average.", correct: true, explanation: "Right. Amortized is a property of a SEQUENCE: n operations cost O(n) total, so average cost per op = O(1). Individual operations can still be O(n)." },
            { label: "It's the same as average case.", explanation: "Different. Average case averages over INPUTS; amortized averages over a sequence of OPERATIONS on one data structure." },
            { label: "It only applies to arrays.", explanation: "Amortization applies to many data structures — HashMap rehashes, splay trees, union-find with path compression, stacks with multipop, etc." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"For HashMap.put with a good hash function, what's the BEST way to characterize its time complexity?"}
          options={[
            { label: "O(1) — full stop.", explanation: "Misleading without an asterisk. The worst case (rehash, or all-collisions) is O(n)." },
            { label: "O(n) — that's the worst case.", explanation: "Technically true but pessimistic — in practice we say O(1) because the worst case is statistically near-impossible with good hashing." },
            { label: "Amortized O(1), worst case O(n).", correct: true, explanation: "Right. Amortized O(1) per put (handles the rehash) AND we acknowledge the all-collisions worst case. This is the answer that signals you understand both." },
            { label: "It depends on the JVM.", explanation: "JVM details matter for constants, but the asymptotic answer is the same on every implementation." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"You're shipping a real-time system with strict P99 latency. Which growth strategy for a dynamic buffer is best?"}
          options={[
            { label: "Geometric (2×) — best amortized cost.", explanation: "Best amortized cost, but those rare resizes are exactly what kills your P99. The amortized math doesn't help when each individual resize is the problem." },
            { label: "Pre-size to the maximum expected capacity, then never resize.", correct: true, explanation: "Right. P99-sensitive systems need predictable per-op cost. Pre-sizing eliminates resize spikes entirely. You pay upfront in memory; you never pay in latency." },
            { label: "Arithmetic (+10 each time) — smaller spikes.", explanation: "Smaller spikes individually, but MUCH more frequent — and the total work is O(n²). Worst of both worlds." },
            { label: "Use a LinkedList — every append is true O(1).", explanation: "True O(1) per append is right, but LinkedList has worse cache behavior and more allocation. Pre-sized array is usually a better answer if max size is known." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which of these statements is FALSE?"
          options={[
            { label: "An algorithm's best, average, and worst case can all be different growth classes.", explanation: "True — quicksort is best/avg O(n log n) but worst O(n²). Insertion sort is best O(n) but avg/worst O(n²)." },
            { label: "Amortized analysis only matters for data structures, not for one-shot algorithms.", explanation: "True. Amortized is about a sequence of operations on the same structure — irrelevant to a single sort or search." },
            { label: "Geometric growth (2×) is required for amortized O(1) on dynamic arrays.", explanation: "True — any constant factor > 1 (1.5×, 2×) works. Strictly arithmetic growth breaks it." },
            { label: "Amortized O(1) means worst-case O(1).", correct: true, explanation: "FALSE — this is the one. Amortized O(1) is compatible with worst-case O(n). The whole point is to give a useful AVERAGE when individual operations spike. If worst case were already O(1), we wouldn't need amortization." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* Forward-look panel — Phase 1 close */}
      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          🎉 Phase 1 complete
        </div>
        <h3 className="mt-0 mb-2">You&apos;ve built the complexity mental model</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The seven curves. Time vs space. Best, average, worst, and amortized. You can read a Java method and call out its complexity flavor on sight, and you can defend why <code>ArrayList.add</code> is O(1) even though some calls are O(n).
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          That&apos;s the foundation. Every data structure you meet from here on out comes with a complexity table — and now you can read those tables critically. You know which numbers are real guarantees, which are amortized, and which are statistical bets.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 2 — Linear Data Structures.</strong> We start meeting the structures themselves: arrays, dynamic arrays (now you know how they really work), strings, linked lists, stacks, queues. Real implementations, real LeetCode patterns.
        </p>
        <Link
          href="/courses/dsa/modules/arrays"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Continue to Module 4 — Arrays &amp; dynamic arrays →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="amortized-analysis" />
    </article>
  );
}
