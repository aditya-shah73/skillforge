import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import TestYourself from "@/components/TestYourself";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "setup", title: "The setup" },
  { id: "ignore-constants", title: "Why constants vanish" },
  { id: "curves", title: "The 7 curves" },
  { id: "reading-code", title: "Reading code for Big-O" },
  { id: "project", title: "Project: micro-benchmark" },
  { id: "final", title: "Final quiz" },
];

export default function BigOModule() {
  const mod = getModuleBySlug("big-o")!;

  // Left-to-right ranking of the seven curves, best to worst. Reinforces the
  // table immediately below — the colors get redder as the curve gets worse.
  const growthChart = `
flowchart LR
    A["O(1)<br/>constant"] --> B["O(log n)<br/>logarithmic"]
    B --> C["O(n)<br/>linear"]
    C --> D["O(n log n)<br/>linearithmic"]
    D --> E["O(n²)<br/>quadratic"]
    E --> F["O(2ⁿ)<br/>exponential"]
    F --> G["O(n!)<br/>factorial"]
    style A fill:#10b981,color:#fff,stroke:#059669
    style B fill:#0ea5e9,color:#fff,stroke:#0284c7
    style C fill:#6366f1,color:#fff,stroke:#4f46e5
    style D fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style E fill:#f59e0b,color:#000,stroke:#d97706
    style F fill:#ef4444,color:#fff,stroke:#dc2626
    style G fill:#7f1d1d,color:#fff,stroke:#450a0a
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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Big-O from zero
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Growth rates, why we ignore constants, and the 7 curves you&apos;ll meet for the rest of your career.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="big-o" />
        <ModuleProgress moduleSlug="big-o" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: THE SETUP */}
      <Checkpoint moduleSlug="big-o" id="setup" title="The setup" xp={15} celebration="The mental model is loaded. Big-O is about scaling, not stopwatches.">
      <section>
        <h2>Part 1: The setup</h2>

        <p>
          You&apos;ve written two ways to find a number in a list of one million integers.
        </p>
        <p>
          <strong>Version A</strong>{" "}walks the list from start to end and stops when it finds the number.
          <strong> Version B</strong>{" "}first builds a hash set of all the numbers, then checks if the target is in the set.
        </p>
        <p>
          You time them on your laptop. Version A finishes in <strong>8 milliseconds</strong>. Version B finishes in <strong>12 milliseconds</strong>.
        </p>
        <p>
          Which is faster?
        </p>

        <Quiz
          kind="Gut check"
          question="Based on the timings above, which version is the better algorithm?"
          options={[
            { label: "Version A — it ran faster, end of story.", explanation: "This is the trap. Real wall-clock time depends on n, on the JVM, on what was in cache, on whether you got lucky and the target was at the start. We need a different lens." },
            { label: "Version B — hash sets are always faster.", explanation: "\"Always\" is too strong. For tiny inputs, the overhead of building the set can lose to a simple linear scan." },
            { label: "It depends on what we mean by 'faster' — and on n.", correct: true, explanation: "Exactly. Wall-clock time at one specific n tells you almost nothing. We need to know how each version SCALES as n grows. That's what Big-O measures." },
            { label: "We can't tell — we'd need to profile both.", explanation: "Closer, but profiling at one n is the same trap. The real question is: how does runtime grow as n grows? That's a different measurement." },
          ]}
        />

        <h3>Why your stopwatch is lying to you</h3>
        <p>
          Wall-clock time is a terrible way to compare algorithms, for three reasons:
        </p>
        <ol>
          <li><strong>It depends on the machine.</strong>{" "}A loop that takes 8ms on your M2 MacBook takes 80ms on a budget cloud VM. Same algorithm. Different stopwatch.</li>
          <li><strong>It depends on n.</strong>{" "}Version A might beat Version B at <code>n = 100</code>, lose at <code>n = 100,000</code>, and lose catastrophically at <code>n = 100,000,000</code>. The crossover point is the whole game.</li>
          <li><strong>It depends on luck.</strong>{" "}If your target was the first element in Version A, it finished instantly. Same code, different input, different time.</li>
        </ol>
        <p>
          What we actually want is a way to talk about algorithms <em>independent</em>{" "}of any machine, any specific input, and any specific n. We want to ask: <em>how does the work the algorithm does grow as the input grows?</em>
        </p>
        <p>That question is what Big-O answers.</p>

        <Callout variant="insight" title="Big-O is about scaling, not speed">
          <p className="m-0">
            Big-O doesn&apos;t tell you how fast something is. It tells you how the running time <strong>grows</strong>{" "}as the input grows. A &quot;faster&quot; algorithm at small n can be the worse algorithm — if it scales worse.
          </p>
        </Callout>

        <h3>The analogy: filling a stadium</h3>
        <p>
          Imagine you&apos;re hired to fill a stadium with people, and you have three strategies:
        </p>
        <ul>
          <li><strong>Strategy 1:</strong>{" "}One usher escorts people in, one at a time. To fill <code>n</code> seats, you do <code>n</code> escorts.</li>
          <li><strong>Strategy 2:</strong> 50 ushers escort people in parallel. To fill <code>n</code> seats, you do roughly <code>n / 50</code> escorts.</li>
          <li><strong>Strategy 3:</strong>{" "}You make every person who walks in greet every other person who&apos;s already inside. For <code>n</code> people, that&apos;s about <code>n × n</code> handshakes.</li>
        </ul>
        <p>
          For 10 people, all three look fine. Strategy 1 does 10 things, Strategy 2 does 1, Strategy 3 does 100. Whatever — you fill the stadium quickly either way.
        </p>
        <p>
          For 50,000 people? Strategy 1 does 50,000 things. Strategy 2 does 1,000. Strategy 3 does 2,500,000,000. <strong>That&apos;s the difference between &quot;done before lunch&quot; and &quot;done after the heat death of the universe.&quot;</strong>
        </p>
        <p>
          Big-O is the language we use to talk about that difference — the <em>shape</em>{" "}of how work grows — without caring whether the ushers are fast or slow on any given day.
        </p>

        <Quiz
          kind="Quick check"
          question="In the stadium analogy, Strategy 2 (50 parallel ushers) and Strategy 1 (1 usher) — what's the relationship between their growth shapes?"
          options={[
            { label: "Strategy 2 is fundamentally faster — different growth shape.", explanation: "Same shape. 50 ushers is still linear in n — you just shift the line down by a constant factor. Big-O treats them the same." },
            { label: "Same growth shape. Strategy 2 is faster by a constant factor (50×), but both grow linearly with n.", correct: true, explanation: "Right. Both are O(n). Constants matter on a stopwatch but not for Big-O. We'll see why that's actually the right call in Part 2." },
            { label: "Strategy 2 is slower because of coordination overhead.", explanation: "Maybe in real life, but the analogy abstracts that away. Both do work proportional to n." },
            { label: "Can't tell without timing them.", explanation: "We don't need to time them — the work pattern itself tells us everything. That's the whole point." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Big-O is a language for how an algorithm scales — not how fast it runs."
          points={[
            { takeaway: "Wall-clock time depends on machine, input, and luck — Big-O depends on none of those.", detail: <>The same code runs differently on different hardware, with different inputs, on different runs. Big-O strips all that away and answers a single question: <em>how does work grow as input grows?</em></> },
            { takeaway: "Big-O measures growth shape, not absolute speed.", detail: <>An algorithm that&apos;s slower at n=10 can be dramatically faster at n=10,000,000 if it has a better growth shape. The crossover is what you care about.</> },
            { takeaway: "The stadium analogy: 1 usher and 50 ushers have the same shape; n×n handshakes is a different shape.", detail: <>Multiplying by a constant (50 ushers) doesn&apos;t change the shape — it just shifts the line. Multiplying by n itself (everyone greets everyone) creates a fundamentally different curve.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: WHY CONSTANTS VANISH */}
      <Checkpoint moduleSlug="big-o" id="ignore-constants" title="Why constants vanish" xp={20} celebration="You can now defend why we drop the 5 in 5n. That single move is what makes Big-O useful.">
      <section>
        <h2>Part 2: Why we drop constants and lower terms</h2>

        <p>
          The first time you saw Big-O, somebody told you: <em>&quot;ignore constants, ignore lower-order terms.&quot;</em>{" "}Your reaction was probably: <strong>&quot;Why? That feels like cheating.&quot;</strong>
        </p>
        <p>
          It&apos;s not cheating. It&apos;s the entire reason Big-O is useful. Let&apos;s see why.
        </p>

        <h3>The setup: comparing two algorithms</h3>
        <p>
          You have two algorithms that both solve the same problem:
        </p>
        <ul>
          <li><strong>Algorithm X</strong>{" "}does exactly <code>5n + 3</code> operations on an input of size n.</li>
          <li><strong>Algorithm Y</strong>{" "}does exactly <code>n² / 100</code> operations on an input of size n.</li>
        </ul>
        <p>
          At small n, Algorithm Y looks tempting — that <code>/100</code> is doing some heavy lifting. Let&apos;s actually count.
        </p>

        <WorkedExample
          title="Plotting 5n + 3 vs n² / 100"
          subtitle="Watch the crossover. This is the only thing that matters."
          steps={[
            {
              title: "n = 10",
              body: (
                <>
                  <p>Algorithm X: <code>5(10) + 3 = 53</code> operations.</p>
                  <p>Algorithm Y: <code>10² / 100 = 1</code> operation.</p>
                  <p><strong>Y wins by 53×.</strong>{" "}Looks great, right?</p>
                </>
              ),
            },
            {
              title: "n = 100",
              body: (
                <>
                  <p>Algorithm X: <code>5(100) + 3 = 503</code> operations.</p>
                  <p>Algorithm Y: <code>100² / 100 = 100</code> operations.</p>
                  <p>Y still wins, by ~5×. But the gap is closing.</p>
                </>
              ),
            },
            {
              title: "n = 500 (the crossover)",
              body: (
                <>
                  <p>Algorithm X: <code>5(500) + 3 = 2,503</code> operations.</p>
                  <p>Algorithm Y: <code>500² / 100 = 2,500</code> operations.</p>
                  <p><strong>Roughly tied.</strong>{" "}This is the crossover. After this, Y starts losing.</p>
                </>
              ),
            },
            {
              title: "n = 10,000",
              body: (
                <>
                  <p>Algorithm X: <code>5(10,000) + 3 = 50,003</code> operations.</p>
                  <p>Algorithm Y: <code>10,000² / 100 = 1,000,000</code> operations.</p>
                  <p><strong>X wins by 20×.</strong></p>
                </>
              ),
            },
            {
              title: "n = 1,000,000",
              body: (
                <>
                  <p>Algorithm X: <code>5(1,000,000) + 3 = 5,000,003</code> operations.</p>
                  <p>Algorithm Y: <code>1,000,000² / 100 = 10,000,000,000</code> operations.</p>
                  <p><strong>X wins by ~2,000×.</strong>{" "}Y is now hopeless.</p>
                </>
              ),
            },
            {
              title: "The takeaway",
              body: (
                <>
                  <p>The constants (<code>5</code>, <code>3</code>, <code>/100</code>) decided who won at small n. They were <em>completely irrelevant</em>{" "}at large n.</p>
                  <p>What decided the long-term winner? The <strong>highest-order term</strong>: <code>n</code> for X vs <code>n²</code> for Y. That&apos;s the only thing that mattered once n got big.</p>
                  <p>Big-O captures exactly that — the highest-order term, with constants stripped. So Algorithm X is <strong>O(n)</strong>{" "}and Algorithm Y is <strong>O(n²)</strong>.</p>
                </>
              ),
            },
          ]}
        />

        <h3>The formal definition (one paragraph)</h3>
        <p>
          We say a function <code>f(n)</code> is <strong>O(g(n))</strong>{" "}if there exist constants <code>c &gt; 0</code> and <code>n₀ ≥ 0</code> such that for all <code>n ≥ n₀</code>:
        </p>
        <pre><code>f(n) ≤ c · g(n)</code></pre>
        <p>
          In English: <strong>f(n) is eventually bounded above by some constant multiple of g(n)</strong>. The phrase &quot;eventually&quot; (the <code>n ≥ n₀</code> part) is why the small-n constants don&apos;t matter — we only care about the long run.
        </p>
        <Callout variant="info" title="What 'O' actually stands for">
          <p className="m-0">
            The O comes from <em>Ordnung</em> — German for &quot;order.&quot; It&apos;s saying &quot;f belongs to the same order of growth as g.&quot; You&apos;ll also see Θ (theta, &quot;exactly this order&quot;) and Ω (omega, &quot;at least this order&quot;). In interviews and in practice, when people say &quot;Big-O&quot; they usually mean the tight bound — i.e. Θ — but they say O. We&apos;ll follow that convention.
          </p>
        </Callout>

        <h3>The two simplification rules</h3>
        <p>From the worked example, two rules fall out:</p>
        <ol>
          <li>
            <strong>Drop constant factors.</strong> <code>5n</code> becomes <code>n</code>. <code>n² / 100</code> becomes <code>n²</code>. <code>1000n</code> is still <code>O(n)</code>.
          </li>
          <li>
            <strong>Drop lower-order terms.</strong> <code>n² + 5n + 100</code> becomes <code>n²</code>. The <code>5n</code> and <code>100</code> become irrelevant once n is large.
          </li>
        </ol>
        <p>
          These two rules, applied together, turn any operation count into a Big-O class. That&apos;s most of what you&apos;ll do for the rest of this module.
        </p>

        <Quiz
          kind="Drill"
          question={"What is the Big-O of f(n) = 3n³ + 50n² + 1000n + 999,999?"}
          options={[
            { label: "O(n³ + n² + n + 1)", explanation: "We don't leave terms in. Drop the lower-order terms entirely." },
            { label: "O(3n³)", explanation: "Right idea but drop the constant. Big-O has no leading coefficient." },
            { label: "O(n³)", correct: true, explanation: "Drop constants (3 → 1), drop lower-order terms (50n², 1000n, 999999 all vanish next to n³). The 999,999 looks scary but at n=10,000 the n³ term is 10¹² — the constant is rounding error." },
            { label: "O(n³ × n²)", explanation: "We don't multiply terms — we keep the dominant one." },
          ]}
        />

        <Quiz
          kind="Drill"
          question="What is the Big-O of f(n) = 100? (a function that does the same amount of work no matter what n is)"
          options={[
            { label: "O(100)", explanation: "Constants get dropped. 100 is a constant." },
            { label: "O(1)", correct: true, explanation: "Right. Any function that does a fixed amount of work — regardless of n — is O(1), called \"constant time.\" Whether it's 1 operation or 100 operations or 10⁹ operations, it's all O(1) as long as it doesn't grow with n." },
            { label: "O(n)", explanation: "It doesn't depend on n at all — it's flat." },
            { label: "It has no Big-O.", explanation: "Constant-work functions absolutely have a Big-O — it's O(1)." },
          ]}
        />

        <Callout variant="warn" title="O(1) does not mean &apos;fast&apos;">
          <p className="m-0">
            A function that does 10 billion operations but doesn&apos;t depend on n is still O(1). In practice O(1) usually <em>is</em>{" "}fast, but Big-O cannot tell you that. It can only tell you the work doesn&apos;t grow.
          </p>
        </Callout>

        <PartRecap
          title="Part 2 recap"
          gist="Drop constants and lower-order terms. The dominant term is the algorithm's identity."
          points={[
            { takeaway: "At large n, the highest-order term dwarfs everything else.", detail: <>The crossover example showed it cleanly: at n=1M, Algorithm Y&apos;s 10¹⁰ operations make Algorithm X&apos;s 5M operations look small — and the gap only widens from there. That&apos;s why Big-O drops everything except the dominant term.</> },
            { takeaway: "Drop constants: 5n → n, n²/100 → n², 1000 → 1.", detail: <>Constants depend on hardware, on which exact instructions you used, on whether the JIT compiler optimized your loop. They&apos;re not a property of the algorithm — they&apos;re noise.</> },
            { takeaway: "Drop lower-order terms: n² + 5n + 100 → n².", detail: <>Same reasoning at a different scale. Once n is large enough, n² makes 5n look like nothing.</> },
            { takeaway: "O(1) means 'doesn't grow with n' — not 'fast'.", detail: <>A 10-billion-operation function that doesn&apos;t depend on n is O(1). In practice O(1) is fast, but the notation itself is silent on absolute speed.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3: THE 7 CURVES */}
      <Checkpoint moduleSlug="big-o" id="curves" title="The 7 curves" xp={25} celebration="You now have the seven shapes that describe almost every algorithm you'll meet. From here it's pattern recognition.">
      <section>
        <h2>Part 3: The 7 curves you&apos;ll meet for the rest of your career</h2>

        <p>
          Here&apos;s the good news. There aren&apos;t a hundred Big-O classes you need to know. There are <strong>seven</strong>{" "}that cover almost every algorithm you&apos;ll see in interviews and in production code.
        </p>

        <Mermaid chart={growthChart} />

        <p>
          Here they are, from best to worst, with the canonical example for each:
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left py-2 pr-4 font-bold">Big-O</th>
                <th className="text-left py-2 pr-4 font-bold">Name</th>
                <th className="text-left py-2 pr-4 font-bold">Canonical example</th>
                <th className="text-left py-2 font-bold">n=1M ops (rough)</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-300">
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(1)</td><td className="py-2 pr-4">Constant</td><td className="py-2 pr-4">HashMap lookup; array index</td><td className="py-2 font-mono">1</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(log n)</td><td className="py-2 pr-4">Logarithmic</td><td className="py-2 pr-4">Binary search</td><td className="py-2 font-mono">~20</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(n)</td><td className="py-2 pr-4">Linear</td><td className="py-2 pr-4">Walk the array once</td><td className="py-2 font-mono">1,000,000</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(n log n)</td><td className="py-2 pr-4">Linearithmic</td><td className="py-2 pr-4">Merge sort, quicksort (avg)</td><td className="py-2 font-mono">~20,000,000</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(n²)</td><td className="py-2 pr-4">Quadratic</td><td className="py-2 pr-4">Nested loop over the same array</td><td className="py-2 font-mono">10¹²</td></tr>
              <tr className="border-b border-slate-200 dark:border-slate-800"><td className="py-2 pr-4 font-mono">O(2ⁿ)</td><td className="py-2 pr-4">Exponential</td><td className="py-2 pr-4">Naive recursive Fibonacci; subsets</td><td className="py-2 font-mono">don&apos;t even ask</td></tr>
              <tr><td className="py-2 pr-4 font-mono">O(n!)</td><td className="py-2 pr-4">Factorial</td><td className="py-2 pr-4">Brute-force permutations (TSP naive)</td><td className="py-2 font-mono">heat-death-of-universe</td></tr>
            </tbody>
          </table>
        </div>

        <h3>The intuition for each curve</h3>

        <p>
          <strong>O(1) — &quot;It doesn&apos;t care how big the input is.&quot;</strong>
          <br />Looking up a value in a hash map. Reading <code>arr[5]</code>. Pushing onto a stack. The work is fixed.
        </p>

        <p>
          <strong>O(log n) — &quot;Halving the problem each step.&quot;</strong>
          <br />Binary search. Every comparison cuts the search space in half. To find one item among a billion, you need ~30 comparisons. <em>Logs are how computers shrink huge numbers fast.</em>
        </p>

        <p>
          <strong>O(n) — &quot;Look at every item once.&quot;</strong>
          <br />A single for-loop over the array. Counting words in a document. The most common shape in real code.
        </p>

        <p>
          <strong>O(n log n) — &quot;For each item, do log n work.&quot;</strong>
          <br />The signature shape of efficient sorting (merge sort, heapsort, quicksort average case). Also: visiting every item, then doing a binary search on each. <em>It&apos;s the line between &quot;fast enough&quot; and &quot;please no.&quot;</em>
        </p>

        <p>
          <strong>O(n²) — &quot;For each item, look at every other item.&quot;</strong>
          <br />Nested loops over the same array. Bubble sort. Brute-force pair-finding. Fine for n=100, painful for n=10,000, lethal for n=1,000,000.
        </p>

        <p>
          <strong>O(2ⁿ) — &quot;Try every subset.&quot;</strong>
          <br />Each new item doubles the work. Generating all subsets of a set. Naive recursive Fibonacci (each call spawns two more). At n=40, you&apos;re already at a trillion operations.
        </p>

        <p>
          <strong>O(n!) — &quot;Try every ordering.&quot;</strong>
          <br />Brute-force permutation problems. Naive Traveling Salesman. At n=20, you&apos;re past 2.4 quintillion. This is &quot;don&apos;t.&quot;
        </p>

        <Callout variant="insight" title="The mental cliff: O(n log n) → O(n²)">
          <p className="m-0">
            For interviews and most engineering work, the line you&apos;re always trying not to cross is the jump from O(n log n) to O(n²). <strong>Cross that line and your algorithm dies at scale.</strong>{" "}Most &quot;optimize this&quot; problems are really &quot;turn O(n²) into O(n log n) or O(n).&quot; Tattoo this on your brain.
          </p>
        </Callout>

        <h3>Why log n is so good (without the math)</h3>
        <p>
          People who haven&apos;t thought about logs in years often forget how absurdly powerful they are. Here&apos;s the one thing to internalize:
        </p>
        <p>
          <code>log₂(n)</code> is &quot;how many times can I halve n before I get to 1?&quot;
        </p>
        <ul>
          <li>n = 8 → halve to 4, 2, 1. <strong>3 halvings.</strong>{" "}log₂(8) = 3.</li>
          <li>n = 1,000 → ~10 halvings. log₂(1,000) ≈ 10.</li>
          <li>n = 1,000,000 → ~20 halvings. log₂(1,000,000) ≈ 20.</li>
          <li>n = 1,000,000,000 → ~30 halvings.</li>
        </ul>
        <p>
          The number gets a billion times bigger; the log only adds 20. <strong>Any time you can replace &quot;walk through everything&quot; (O(n)) with &quot;halve the problem until done&quot; (O(log n)), you&apos;ve made an algorithm a billion times more scalable.</strong>{" "}That&apos;s why binary search is famous.
        </p>

        <h3>What each curve looks like at n = 1 million</h3>
        <p>
          One last visualization. Imagine each curve runs at 1 billion operations per second (a fast modern CPU). At n = 1,000,000:
        </p>
        <ul>
          <li>O(1): <strong>1 nanosecond</strong></li>
          <li>O(log n): <strong>20 nanoseconds</strong> (basically instant)</li>
          <li>O(n): <strong>1 millisecond</strong></li>
          <li>O(n log n): <strong>20 milliseconds</strong></li>
          <li>O(n²): <strong>17 minutes</strong></li>
          <li>O(2ⁿ): more than the <strong>age of the universe</strong>, by a factor your calculator can&apos;t express.</li>
          <li>O(n!): pretend this isn&apos;t even a number.</li>
        </ul>

        <ClassifyChallenge
          title="Spot the curve"
          prompt="Match each algorithm/scenario to its Big-O class. Drag — or just think — which group it belongs to."
          buckets={[
            { id: "constant", label: "O(1)", color: "emerald" },
            { id: "logarithmic", label: "O(log n)", color: "sky" },
            { id: "linear", label: "O(n)", color: "indigo" },
            { id: "linearithmic", label: "O(n log n)", color: "violet" },
            { id: "quadratic", label: "O(n²)", color: "amber" },
            { id: "exponential", label: "O(2ⁿ)", color: "rose" },
          ]}
          items={[
            { id: "i1", label: "Reading arr[42] from a Java int[]", answer: "constant", explanation: "Array access is constant time. Doesn't depend on array length." },
            { id: "i2", label: "Pushing one element onto a Stack", answer: "constant", explanation: "Stack push (in an ArrayDeque or array-backed stack) is O(1) amortized." },
            { id: "i3", label: "HashMap.get(key) on average", answer: "constant", explanation: "Hash to bucket, follow short chain. O(1) on average. Worst case O(n), but the expected case is constant." },
            { id: "i4", label: "Binary search in a sorted array", answer: "logarithmic", explanation: "Each step halves the search space. log₂(n) steps total." },
            { id: "i5", label: "Walking through every element of a list once", answer: "linear", explanation: "One for-loop, no nested work — that's the textbook O(n)." },
            { id: "i6", label: "Counting all even numbers in an int[]", answer: "linear", explanation: "One pass, constant work per element. O(n)." },
            { id: "i7", label: "Sorting an array with merge sort", answer: "linearithmic", explanation: "Classic O(n log n). Splits the array log n times, each level does O(n) work to merge." },
            { id: "i8", label: "For every pair (i, j) in an array, check if arr[i] + arr[j] == target — without using a hashmap", answer: "quadratic", explanation: "Nested loop over the same array — about n²/2 pairs, which simplifies to O(n²)." },
            { id: "i9", label: "Bubble sort", answer: "quadratic", explanation: "Worst case n² swaps. The reason nobody uses bubble sort." },
            { id: "i10", label: "Generating every subset of a set of n elements", answer: "exponential", explanation: "There are 2ⁿ subsets — every element is either in or out. So even <em>just listing them</em> is O(2ⁿ)." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Seven curves cover almost every algorithm you'll meet. Internalize their shapes."
          points={[
            { takeaway: "The seven: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!) — best to worst.", detail: <>Memorize this list. Most interview problems ask you to move from one curve to the next-better one.</> },
            { takeaway: "log n is absurdly powerful: a billion-element input takes ~30 halvings.", detail: <>Any time you can swap O(n) for O(log n), the algorithm gets dramatically more scalable. Binary search is the canonical example.</> },
            { takeaway: "The line you don't want to cross is O(n log n) → O(n²).", detail: <>O(n²) becomes painful at n = 10,000 and lethal at n = 1,000,000. Most optimization problems are about staying on the right side of this line.</> },
            { takeaway: "O(2ⁿ) and O(n!) are scary fast. Each step doubles or multiplies; you hit the heat death of the universe quickly.", detail: <>If your algorithm is exponential, you almost always need a different approach (DP, pruning, greedy). We&apos;ll meet all of those.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 4: READING CODE FOR BIG-O */}
      <Checkpoint moduleSlug="big-o" id="reading-code" title="Reading code for Big-O" xp={25} celebration="You can now look at a Java method and call out its Big-O. That's the interview-ready skill.">
      <section>
        <h2>Part 4: Reading code for Big-O</h2>

        <p>
          Knowing the seven curves is one thing. Looking at a chunk of Java and saying &quot;that&apos;s O(n log n)&quot; is another. This part is the bridge.
        </p>
        <p>
          There are three rules that, applied carefully, will get you the right answer for almost every method you&apos;ll meet:
        </p>

        <h3>Rule 1: Sequential code adds. Take the worst term.</h3>
        <p>If a method does step A, then step B, the total work is <code>A + B</code>. Big-O is the worst of those.</p>
        <CodeBlock lang="java">{`void process(int[] arr) {
    // Step A: O(n)
    for (int x : arr) {
        System.out.println(x);
    }

    // Step B: O(n log n)
    Arrays.sort(arr);
}
// Total: O(n) + O(n log n) = O(n log n)`}</CodeBlock>

        <h3>Rule 2: Nested loops multiply.</h3>
        <p>If you&apos;re inside a loop that runs n times, and the inner work is O(n), the total is <code>n × n = n²</code>.</p>
        <CodeBlock lang="java">{`boolean hasDuplicate(int[] arr) {
    for (int i = 0; i < arr.length; i++) {           // outer: n
        for (int j = i + 1; j < arr.length; j++) {    // inner: ~n
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}
// Total: O(n × n) = O(n²)`}</CodeBlock>
        <Callout variant="warn" title="The 'inner loop is shorter' trap">
          <p className="m-0">
            That inner loop runs n, then n−1, then n−2, ... → about n²/2 total. We <strong>still</strong>{" "}call this O(n²). Constants get dropped, remember? People who say &quot;but it&apos;s only half&quot; haven&apos;t internalized Part 2.
          </p>
        </Callout>

        <h3>Rule 3: Halving the problem each step → log n.</h3>
        <p>If a loop&apos;s variable doubles or halves each iteration (rather than incrementing by 1), the loop runs log n times, not n times.</p>
        <CodeBlock lang="java">{`int countDown(int n) {
    int count = 0;
    while (n > 1) {
        n = n / 2;     // halving each step
        count++;
    }
    return count;
}
// Total: O(log n)`}</CodeBlock>

        <h3>The recipe</h3>
        <p>
          Put the three rules together and you have a recipe:
        </p>
        <ol>
          <li>For each loop, ask: <strong>how many times does this loop run?</strong> (n, log n, n², n!, ...)</li>
          <li>For each loop, ask: <strong>what&apos;s the work inside?</strong> (constant? another loop?)</li>
          <li>Multiply nested loops, add sequential blocks. Keep the dominant term. Drop constants.</li>
        </ol>

        <WorkedExample
          title="A real Java method, traced step by step"
          subtitle="Pretend you've never seen this before. Walk through the recipe."
          steps={[
            {
              title: "The method",
              body: (
                <CodeBlock lang="java">{`int mystery(int[] arr) {
    int total = 0;

    // Block A
    for (int x : arr) {
        total += x;
    }

    // Block B
    Arrays.sort(arr);

    // Block C
    for (int i = 0; i < arr.length; i++) {
        for (int j = 0; j < arr.length; j++) {
            if (arr[i] + arr[j] == 0) total++;
        }
    }

    return total;
}`}</CodeBlock>
              ),
            },
            {
              title: "Block A: a single pass — O(n)",
              body: (
                <p>One for-loop over the array. Constant work (an addition) per element. <strong>O(n).</strong></p>
              ),
            },
            {
              title: "Block B: a sort — O(n log n)",
              body: (
                <p><code>Arrays.sort</code> on a primitive int[] is dual-pivot quicksort, which is O(n log n) on average. <strong>O(n log n).</strong></p>
              ),
            },
            {
              title: "Block C: a nested loop over the same array — O(n²)",
              body: (
                <p>Outer loop runs n times. Inner loop runs n times. Constant work inside. <strong>n × n = O(n²).</strong></p>
              ),
            },
            {
              title: "Sum it up",
              body: (
                <>
                  <p>Total: <code>O(n) + O(n log n) + O(n²)</code>.</p>
                  <p>Take the dominant term: <strong>O(n²)</strong>.</p>
                  <p>That n log n sort? Doesn&apos;t matter — the n² block dominates. That&apos;s what makes Big-O so ruthless.</p>
                </>
              ),
            },
          ]}
        />

        <h3>The trap most people fall into</h3>
        <p>
          When you see a loop, your reflex is to count its iterations. That&apos;s right — but it&apos;s only half. <strong>You also have to look at what every line inside the loop costs.</strong>
        </p>
        <CodeBlock lang="java">{`// Looks like O(n) — there's only one loop, right?
boolean badContains(List<String> haystack, String needle) {
    for (String s : haystack) {        // n iterations
        if (haystack.contains(s)) {     // O(n) per call !!
            // ...
        }
    }
    return false;
}
// Actually O(n²) because List.contains is O(n).`}</CodeBlock>
        <Callout variant="warn" title="Hidden costs are everywhere">
          <p className="m-0">
            Every method call inside a loop has its own Big-O. <code>List.contains</code> is O(n). <code>String.contains</code> is O(n+m). <code>HashMap.get</code> is O(1). Knowing the Big-O of the standard library calls you use is half the battle. We&apos;ll cover this in detail in the Java Collections module.
          </p>
        </Callout>

        <Quiz
          kind="Drill"
          question={"What is the Big-O of this method?\n\nvoid f(int n) {\n  for (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n      System.out.println(i + j);\n    }\n  }\n  for (int i = 0; i < n; i++) {\n    System.out.println(i);\n  }\n}"}
          options={[
            { label: "O(n)", explanation: "The single loop at the bottom is O(n), but there's a nested O(n²) block above it. The dominant term wins." },
            { label: "O(n²)", correct: true, explanation: "The nested loop is O(n²), the trailing single loop is O(n). Dominant term: O(n²)." },
            { label: "O(n² + n)", explanation: "We don't leave the lower-order term in. Drop it." },
            { label: "O(n³)", explanation: "Only two levels of nesting. The third loop is sequential, not nested." },
          ]}
        />

        <Quiz
          kind="Drill"
          question={"What is the Big-O of this method?\n\nvoid g(int n) {\n  for (int i = 1; i < n; i = i * 2) {\n    System.out.println(i);\n  }\n}"}
          options={[
            { label: "O(n)", explanation: "Look again at how i changes — it doubles, not increments." },
            { label: "O(log n)", correct: true, explanation: "i doubles each step, so it reaches n in log₂(n) steps. Halving and doubling both give log n — they're symmetric." },
            { label: "O(n log n)", explanation: "Only one loop, with constant work inside. There's no n × log n shape here." },
            { label: "O(n²)", explanation: "No nested loop." },
          ]}
        />

        <Quiz
          kind="Drill"
          question={"What is the Big-O of this method? Assume `set` is a HashSet.\n\nint countMatches(int[] arr, Set<Integer> set) {\n  int count = 0;\n  for (int x : arr) {\n    if (set.contains(x)) count++;\n  }\n  return count;\n}"}
          options={[
            { label: "O(n²)", explanation: "HashSet.contains is O(1) on average — not O(n). That's the whole point of a hash set." },
            { label: "O(n)", correct: true, explanation: "n iterations × O(1) per HashSet.contains = O(n). This is exactly why you'd swap a List for a HashSet — to drop from O(n²) to O(n)." },
            { label: "O(n log n)", explanation: "HashSet doesn't involve any logs. That's TreeSet." },
            { label: "O(1)", explanation: "There's a loop over n elements — definitely not constant time." },
          ]}
        />

        <TestYourself
          concept="Reading a Java method's Big-O"
          explain={
            <>
              <p>
                Look at every loop. For each one ask: how many times does it iterate (n? log n? once?), and what&apos;s the cost of one iteration. Multiply nested loops, add sequential blocks, then keep only the dominant term and drop all constants.
              </p>
              <p>
                Don&apos;t forget: every <em>method call</em>{" "}inside a loop has its own Big-O. A single-looking for-loop calling <code>List.contains</code> on each element is secretly O(n²).
              </p>
            </>
          }
          recognize={
            <>
              <p>
                Code patterns and what they mean:
              </p>
              <ul>
                <li><code>for (int i = 0; i &lt; n; i++)</code> with constant work inside → O(n)</li>
                <li>Two nested for-loops over the same n → O(n²)</li>
                <li><code>i *= 2</code> or <code>i /= 2</code> in the loop condition → O(log n)</li>
                <li><code>recurse(n / 2)</code> with O(n) work per call → O(n log n) (we&apos;ll formalize this in the recursion module)</li>
                <li>HashMap/HashSet operations inside a loop → multiplies by O(1), so doesn&apos;t change the loop&apos;s class</li>
              </ul>
            </>
          }
          implement={
            <>
              <p>
                Practice this on your own code. Open any project and pick three random methods. For each one, narrate aloud:
              </p>
              <ol>
                <li>How many loops are there? Are any nested?</li>
                <li>What&apos;s the loop variable doing — incrementing by 1, doubling, halving?</li>
                <li>What&apos;s the cost of each line inside the deepest loop, including method calls?</li>
              </ol>
              <p>
                Then write down the Big-O. If you can do this for 10 methods in a row without hesitation, you&apos;ve got Part 4 down.
              </p>
            </>
          }
        />

        <PartRecap
          title="Part 4 recap"
          gist="Three rules cover almost every method: sequential adds, nested multiplies, halving gives log n."
          points={[
            { takeaway: "Sequential blocks add — keep the dominant term.", detail: <>An O(n) block followed by an O(n²) block is just O(n²). The smaller block disappears.</> },
            { takeaway: "Nested loops multiply.", detail: <>Two loops, each running n times, with constant work inside, is O(n²). Three nested loops is O(n³). Watch the depth.</> },
            { takeaway: "Halving or doubling a counter → O(log n).", detail: <>Any loop where the counter doesn&apos;t step by 1 — but multiplies or divides — runs log₂(n) times instead of n times.</> },
            { takeaway: "Method calls inside loops have their own Big-O.", detail: <>The biggest trap: a single-looking loop that calls O(n) methods is secretly O(n²). Always ask &quot;what does this method cost?&quot; before declaring the loop&apos;s Big-O.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 5: PROJECT */}
      <Checkpoint moduleSlug="big-o" id="project" title="Project: micro-benchmark" xp={30} manual manualLabel="I built and ran the benchmark" celebration="You've now seen the curves not on a chart — but in your own JVM. That's the bar.">
      <section>
        <h2>Part 5: Project — see the curves with your own eyes</h2>

        <p>
          Reading about growth rates is one thing. Seeing them on your own machine is another. This project takes ~45 minutes and is the part of this module you&apos;ll remember in five years.
        </p>

        <Callout variant="info" title="The goal">
          <p className="m-0">
            Write five small Java methods — one for each of O(1), O(log n), O(n), O(n²), O(n log n) — and run each at increasing values of n, printing how long each took. You&apos;ll watch the n² method curl up and die while the others stay flat or grow slowly. <strong>That image is what cements Big-O for life.</strong>
          </p>
        </Callout>

        <h3>The starter scaffold</h3>
        <p>Create <code>BigOLab.java</code> with these stubs:</p>

        <CodeBlock lang="java">{`import java.util.Arrays;

public class BigOLab {

    // O(1) — constant: just return arr[0]
    static int constantTime(int[] arr) {
        return arr[0];
    }

    // O(log n) — binary search for a value larger than anything in the array.
    // Always misses → forces a full log₂(n) descent every call.
    static int logTime(int[] arr) {
        int lo = 0, hi = arr.length - 1;
        int target = Integer.MAX_VALUE; // guaranteed miss → never returns early
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (arr[mid] < target) lo = mid + 1;
            else if (arr[mid] > target) hi = mid - 1;
            else return mid;
        }
        return -1;
    }

    // O(n) — sum every element
    static long linearTime(int[] arr) {
        long sum = 0;
        for (int x : arr) sum += x;
        return sum;
    }

    // O(n log n) — sort a copy
    static int[] linearithmicTime(int[] arr) {
        int[] copy = arr.clone();
        Arrays.sort(copy);
        return copy;
    }

    // O(n²) — naive pair check (no hashset, on purpose)
    static long quadraticTime(int[] arr) {
        long pairs = 0;
        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] + arr[j] == 0) pairs++;
            }
        }
        return pairs;
    }

    public static void main(String[] args) {
        int[] sizes = {1_000, 10_000, 100_000, 1_000_000};

        for (int n : sizes) {
            int[] arr = new int[n];
            for (int i = 0; i < n; i++) arr[i] = i;

            System.out.println("n = " + n);
            time("O(1)        ", () -> constantTime(arr));
            time("O(log n)    ", () -> logTime(arr));
            time("O(n)        ", () -> linearTime(arr));
            time("O(n log n)  ", () -> linearithmicTime(arr));
            // CAREFUL: skip O(n²) for n = 1,000,000 unless you want lunch first
            if (n <= 100_000) time("O(n²)       ", () -> quadraticTime(arr));
            System.out.println();
        }
    }

    static void time(String label, Runnable r) {
        long start = System.nanoTime();
        r.run();
        long elapsed = System.nanoTime() - start;
        System.out.printf("  %s : %,d ns%n", label, elapsed);
    }
}`}</CodeBlock>

        <h3>Run it. What you should see.</h3>
        <p>You&apos;ll see something like:</p>
        <CodeBlock lang="plain">{`n = 1000
  O(1)         : 600 ns
  O(log n)     : 1,200 ns
  O(n)         : 4,000 ns
  O(n log n)   : 60,000 ns
  O(n²)        : 1,800,000 ns

n = 10000
  O(1)         : 500 ns
  O(log n)     : 1,100 ns
  O(n)         : 30,000 ns
  O(n log n)   : 700,000 ns
  O(n²)        : 180,000,000 ns      ← whoa

n = 100000
  O(1)         : 500 ns
  O(log n)     : 1,300 ns
  O(n)         : 300,000 ns
  O(n log n)   : 8,000,000 ns
  O(n²)        : 18,000,000,000 ns   ← that's 18 seconds.

n = 1000000
  O(1)         : 500 ns
  O(log n)     : 1,400 ns
  O(n)         : 3,000,000 ns
  O(n log n)   : 90,000,000 ns
  (skipped O(n²) — would take ~30 minutes)`}</CodeBlock>
        <p>
          Two things to internalize when you actually see this:
        </p>
        <ol>
          <li>The O(1) and O(log n) lines are <strong>flat</strong>. Multiplying n by 1000 barely moves them.</li>
          <li>The O(n²) line <strong>explodes</strong>. Every 10× increase in n is a 100× increase in time. You can feel why nobody ships O(n²) algorithms at scale.</li>
        </ol>

        <Callout variant="warn" title="Caveats your micro-benchmark won't reveal">
          <p className="m-0">
            Real benchmarks in Java are <em>hard</em>. The JIT warms up, GC pauses sneak in, the CPU caches the array on later runs. For real measurements you&apos;d use <a className="underline" href="https://github.com/openjdk/jmh" target="_blank" rel="noopener">JMH</a>. But for <em>seeing growth shapes</em>, this naive timer is good enough — and the shape you&apos;ll see is right.
          </p>
        </Callout>

        <h3>Stretch goals (optional)</h3>
        <ul>
          <li><strong>Add an O(2ⁿ) method</strong>{" "}using naive recursive Fibonacci. Run it for n=20, 25, 30, 35, 40. Watch each step roughly double the time. Stop at 40 — 50 will hang your laptop.</li>
          <li><strong>Plot the data.</strong>{" "}Pipe the output to a CSV and graph it in Excel/Sheets. Seeing the curves on a real chart is the moment Big-O stops being abstract.</li>
          <li><strong>Compare List.contains vs HashSet.contains.</strong>{" "}Build both with 1M elements. Search for 10,000 random keys in each. Time the difference. This is the single most important practical lesson in the entire module.</li>
        </ul>
      </section>
      </Checkpoint>

      {/* PART 6: FINAL */}
      <Checkpoint moduleSlug="big-o" id="final" title="Final quiz" xp={20} celebration="That's Module 1 done. The mental model is loaded. Onward to space complexity.">
      <section>
        <h2>Part 6: Final quiz</h2>
        <p>One last set, mixing everything from the module.</p>

        <Quiz
          kind="Final"
          question="An algorithm runs in exactly f(n) = 7n² + 2n log n + 99 operations. What's its Big-O?"
          options={[
            { label: "O(7n² + 2n log n + 99)", explanation: "We strip constants and lower-order terms." },
            { label: "O(n²)", correct: true, explanation: "Drop constants (7, 2, 99). Drop the lower-order n log n term. Dominant term: n²." },
            { label: "O(n² log n)", explanation: "We don't multiply unrelated terms — we keep the single dominant one." },
            { label: "O(n log n)", explanation: "n² grows faster than n log n. The n² term is the dominant one, not the n log n term." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Algorithm A is O(n²). Algorithm B is O(n log n). Which is true?"
          options={[
            { label: "B is always faster than A.", explanation: "Not always — at very small n, A might win because of smaller constants. Big-O is about scaling, not absolute speed at every n." },
            { label: "For sufficiently large n, B is faster than A.", correct: true, explanation: "Right. That's exactly what Big-O guarantees: for sufficiently large n, the lower-order class wins, regardless of constants. Below the crossover point, anything can happen." },
            { label: "They have the same scaling behavior.", explanation: "n² and n log n are different growth classes — n² grows much faster as n increases." },
            { label: "B is faster only when n is small.", explanation: "Backwards — at small n, B might LOSE to A because of constants. At large n, B wins." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"What's the Big-O of this method?\n\nvoid h(int n) {\n  for (int i = 0; i < n; i++) {\n    for (int j = 1; j < n; j = j * 2) {\n      System.out.println(i + j);\n    }\n  }\n}"}
          options={[
            { label: "O(n²)", explanation: "Look at the inner loop again: j doubles each step (j *= 2), it doesn't increment by 1." },
            { label: "O(n log n)", correct: true, explanation: "Outer loop runs n times. Inner loop's j doubles each step → log n iterations. n × log n = O(n log n). This is the shape of efficient sorting." },
            { label: "O(log n)", explanation: "There's an outer loop that does run n times. We're not just inside the log loop." },
            { label: "O(n)", explanation: "The inner loop adds work — log n work per outer iteration. We can't ignore it." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which of these statements is FALSE?"
          options={[
            { label: "An O(1) algorithm could in principle do a billion operations, as long as it doesn't depend on n.", explanation: "True. O(1) means 'does not grow with n' — not 'fast.'" },
            { label: "An O(n) algorithm is always faster than an O(n²) algorithm.", correct: true, explanation: "FALSE — this is the one. At small n, an O(n²) algorithm with tiny constants can beat an O(n) algorithm with large constants. Big-O guarantees the better algorithm wins eventually, not at every n." },
            { label: "Big-O ignores the machine, the input, and the language.", explanation: "True. That's what makes it portable across systems." },
            { label: "log₂(1,000,000) is roughly 20.", explanation: "True. 2²⁰ = 1,048,576." },
          ]}
        />

        <Quiz
          kind="Final"
          question="You're given an unsorted int[] of length n. You need to check whether the array contains duplicates. Which approach is best at scale?"
          options={[
            { label: "Nested loop, comparing every pair — O(n²)", explanation: "Works but doesn't scale. We can do much better." },
            { label: "Sort the array, then walk it once looking at adjacent pairs — O(n log n)", explanation: "Better than n² and a great answer when memory is tight. But there's an even better option here." },
            { label: "Walk the array once, adding to a HashSet, returning true on first repeat — O(n)", correct: true, explanation: "Best. One pass, O(1) average for each HashSet add and lookup, total O(n). This is the canonical answer to LeetCode 'Contains Duplicate.' You'll see this pattern over and over." },
            { label: "Use Arrays.sort then Arrays.binarySearch in a loop — O(n log n + n log n) = O(n log n)", explanation: "Works but does more work than necessary — the HashSet approach is O(n)." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* Forward-look panel — sits outside the final Checkpoint so it reads as
          "what's next" rather than a celebration before the gate clears. The
          Checkpoint's own celebration prop fires the actual completion moment. */}
      <section className="mt-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <h3 className="mt-0 mb-2">What you&apos;ll have when this module clears</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You&apos;ll be able to name the seven curves, justify why constants and lower-order terms vanish, read a Java method and call out its Big-O on sight, and you&apos;ll have seen the curves with your own eyes on a real benchmark. That&apos;s the foundation.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Module 2 — Space complexity.</strong>{" "}The half of Big-O nobody talks about until they need it. Why recursion costs memory. What the JVM call stack actually looks like. The difference between auxiliary space (the part you control) and total space (the part you don&apos;t).
        </p>
        <div className="mt-5">
          <Link
            href="/courses/dsa/modules/space-complexity"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-rose-600 hover:to-orange-600 transition no-underline"
          >
            Continue to Module 2: Space complexity →
          </Link>
        </div>
      </section>
        <ModuleNav courseId="dsa" currentSlug="big-o" />
    </article>
  );
}
