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
  { id: "setup", title: "Why space matters" },
  { id: "auxiliary-vs-total", title: "Auxiliary vs total" },
  { id: "call-stack", title: "The call stack" },
  { id: "reading-code", title: "Reading code for space" },
  { id: "project", title: "Project: stack visualizer" },
  { id: "final", title: "Final quiz" },
];

export default function SpaceComplexityModule() {
  const mod = getModuleBySlug("space-complexity")!;

  // Visual: where memory lives in a JVM process. Stack frames pile up per call,
  // heap holds the long-lived objects. Reinforces the "two memories" mental model.
  const memoryLayout = `
flowchart TB
    subgraph JVM["JVM process memory"]
        direction TB
        S["📚 Stack<br/>(per-thread)<br/>local vars, return addresses,<br/>one frame per call"]
        H["🏗️ Heap<br/>(shared)<br/>objects, arrays,<br/>everything 'new'"]
    end
    S -.->|"references point to"| H
    style S fill:#fb923c,color:#fff,stroke:#ea580c
    style H fill:#0ea5e9,color:#fff,stroke:#0284c7
    style JVM fill:#1e293b,color:#fff,stroke:#475569
  `.trim();

  // Recursion call-stack illustration for factorial(4)
  const recursionStack = `
flowchart TB
    A["factorial(4)<br/>waiting for factorial(3)"] --> B["factorial(3)<br/>waiting for factorial(2)"]
    B --> C["factorial(2)<br/>waiting for factorial(1)"]
    C --> D["factorial(1)<br/>returns 1 ✓"]
    style A fill:#10b981,color:#fff,stroke:#059669
    style B fill:#10b981,color:#fff,stroke:#059669
    style C fill:#10b981,color:#fff,stroke:#059669
    style D fill:#f59e0b,color:#000,stroke:#d97706
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/dsa" className="text-emerald-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Space complexity & the call stack
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Auxiliary vs total space, why recursion costs memory, and what the JVM is really doing under the hood.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="space-complexity" />
        <ModuleProgress moduleSlug="space-complexity" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: WHY SPACE MATTERS */}
      <Checkpoint moduleSlug="space-complexity" id="setup" title="Why space matters" xp={15} celebration="The other half of Big-O is loaded. Time isn't the only resource that runs out.">
      <section>
        <h2>Part 1: Why space matters</h2>

        <p>
          Module 1 was about <em>time</em>. Two algorithms with the same input — which one finishes faster as n grows?
        </p>
        <p>
          But time isn&apos;t the only thing that runs out. Memory does too. And in modern systems, you&apos;ll hit the memory wall before the time wall surprisingly often.
        </p>

        <Quiz
          kind="Gut check"
          question="Two algorithms both compute the sum of an int[] of length n. Algorithm A uses a single accumulator variable. Algorithm B builds a new int[] of running sums and returns the last element. Both are O(n) in time. Are they equivalent?"
          options={[
            { label: "Yes — same time complexity, same algorithm.", explanation: "Time is identical, but B allocates a whole new array of size n. That's n extra ints of memory. At n = 10⁹ that's ~4 GB. They are absolutely not equivalent." },
            { label: "No — B uses extra memory proportional to n.", correct: true, explanation: "Right. A is O(1) auxiliary space, B is O(n). Time-equal, space-different. This is the gap Big-O time alone misses." },
            { label: "No — A is faster because it has fewer lines.", explanation: "Lines of code don't matter for Big-O. The difference is memory: A keeps one int, B allocates n of them." },
            { label: "It depends on the JVM.", explanation: "The JVM affects constants, but the asymptotic gap (constant vs n) is real on every implementation." },
          ]}
        />

        <h3>The other half of Big-O</h3>
        <p>
          Every algorithm has a time complexity <em>and</em>{" "}a space complexity. We usually quote the time, because the space is often "obvious" or "small enough to ignore." Both of those assumptions break in production:
        </p>
        <ul>
          <li><strong>Big inputs.</strong>{" "}A 1 MB array is invisible. A 10 GB array is a question of whether your service stays up.</li>
          <li><strong>Many concurrent users.</strong>{" "}One request that allocates 100 MB is fine. A thousand of them at once is an OOM.</li>
          <li><strong>Recursion.</strong>{" "}Each recursive call adds a frame to the call stack. Recurse a million times and the JVM kills your thread with <code>StackOverflowError</code> — even though your <em>logical</em>{" "}work was modest.</li>
        </ul>

        <Callout variant="insight" title="Time and space trade off, constantly">
          <p className="m-0">
            Almost every interesting algorithmic decision is a trade-off between time and space. Hashing trades memory for speed. Streaming trades speed for memory. Knowing which one you&apos;re trading is the whole game.
          </p>
        </Callout>

        <h3>The analogy: the desk and the warehouse</h3>
        <p>
          Imagine you&apos;re processing paperwork. You have a small desk (your CPU + cache + stack) and a large warehouse out back (the heap).
        </p>
        <ul>
          <li>Items on your <strong>desk</strong>{" "}are instant to access — but the desk is tiny. You can fit a few documents.</li>
          <li>Items in the <strong>warehouse</strong>{" "}are slower to retrieve — but it&apos;s effectively unlimited.</li>
          <li>Every time you call a function, you put a fresh sticky note on your desk: <em>"working on this now, come back to it after."</em>{" "}When the function returns, you peel the sticky note off.</li>
        </ul>
        <p>
          Recursion is what happens when you keep stacking sticky notes without ever peeling one off. Eventually the desk is buried — that&apos;s a stack overflow.
        </p>
        <p>
          Space complexity asks: <strong>how much desk and warehouse does this algorithm need, as a function of n?</strong>
        </p>

        <PartRecap
          title="Part 1 recap"
          gist="Time isn't the only resource. Memory grows with n too — and in different ways than time."
          points={[
            { takeaway: "Two algorithms with identical time complexity can have wildly different memory use.", detail: "Sum-with-accumulator (O(1) space) vs sum-with-running-sums-array (O(n) space). Both O(n) time. The space gap is the real difference." },
            { takeaway: "Memory matters most under three conditions: big inputs, many concurrent users, deep recursion.", detail: "These three turn 'a little extra memory per call' into outages. The interview question 'optimize space' is almost always about one of these." },
            { takeaway: "The desk-and-warehouse analogy: stack is small and fast (per-thread), heap is large and shared (process-wide).", detail: "Local variables and call frames live on the desk. Objects you 'new' live in the warehouse. The pointer from desk to warehouse is what makes Java feel uniform." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: AUXILIARY VS TOTAL SPACE */}
      <Checkpoint moduleSlug="space-complexity" id="auxiliary-vs-total" title="Auxiliary vs total space" xp={15} celebration="You can now answer the only space-complexity question that matters: not what's used, but what's used extra.">
      <section>
        <h2>Part 2: Auxiliary vs total space</h2>

        <p>
          When someone asks "what&apos;s the space complexity of this algorithm?" they almost always mean <em>auxiliary</em>{" "}space — the extra memory the algorithm allocates beyond its input.
        </p>
        <p>
          But there are actually two numbers, and you should know which one you&apos;re reporting.
        </p>

        <h3>The two definitions</h3>
        <ul>
          <li>
            <strong>Total space</strong> = the input size + the auxiliary space. If your input is an int[] of length n, that&apos;s already n ints of memory you can&apos;t avoid. Total space includes that.
          </li>
          <li>
            <strong>Auxiliary space</strong> = the memory the algorithm allocates <em>on top of</em>{" "}the input. This is what you control. This is what people mean by "space complexity" 99% of the time.
          </li>
        </ul>

        <p>So when we say "this is an O(1) space algorithm," we mean <em>auxiliary</em>. The input still takes O(n), obviously — but we&apos;re not allocating any more on top.</p>

        <Callout variant="info" title="Convention: 'space complexity' means auxiliary space">
          <p className="m-0">
            Unless someone explicitly says "total space," assume the question is about <strong>auxiliary</strong>{" "}space. Some textbooks are pedantic about it. Interviewers almost never are — they want to know what you allocate.
          </p>
        </Callout>

        <h3>Worked example: three ways to sum an array</h3>

        <WorkedExample
          title="Same time, different space"
          subtitle="Three implementations of sum(int[]). All O(n) time. Wildly different space."
          steps={[
            {
              title: "Approach A: single accumulator",
              body: (
                <>
                  <CodeBlock lang="java">{`int sumA(int[] arr) {
    int sum = 0;                     // 1 int
    for (int x : arr) sum += x;      // walk through input
    return sum;
}`}</CodeBlock>
                  <p>Time: O(n). Auxiliary space: <strong>O(1)</strong>. We allocate one int (<code>sum</code>), and one loop variable. That&apos;s it. No matter how big n is, the extra memory is constant.</p>
                </>
              ),
            },
            {
              title: "Approach B: running-sums array",
              body: (
                <>
                  <CodeBlock lang="java">{`int sumB(int[] arr) {
    int[] running = new int[arr.length];  // n ints — auxiliary!
    running[0] = arr[0];
    for (int i = 1; i < arr.length; i++) {
        running[i] = running[i - 1] + arr[i];
    }
    return running[arr.length - 1];
}`}</CodeBlock>
                  <p>Time: O(n). Auxiliary space: <strong>O(n)</strong>. We allocate a whole new array of size n. At n = 10⁸ that&apos;s ~400 MB you didn&apos;t need.</p>
                  <p>This isn&apos;t a strawman — people write this when they&apos;re debugging or want to print intermediate state. Then they ship it.</p>
                </>
              ),
            },
            {
              title: "Approach C: recursive",
              body: (
                <>
                  <CodeBlock lang="java">{`int sumC(int[] arr) { return sumC(arr, 0); }
int sumC(int[] arr, int i) {
    if (i == arr.length) return 0;
    return arr[i] + sumC(arr, i + 1);   // recurses n times
}`}</CodeBlock>
                  <p>Time: O(n). Auxiliary space: <strong>O(n)</strong> — but on the <em>stack</em>, not the heap. Each recursive call adds a frame. n calls = n frames = O(n) stack space.</p>
                  <p>For n = 10⁵, this throws <code>StackOverflowError</code> on a default JVM. Same algorithm, same time complexity, completely different failure mode.</p>
                </>
              ),
            },
            {
              title: "The lesson",
              body: (
                <>
                  <p>All three are O(n) time. Their auxiliary space is O(1), O(n) heap, and O(n) stack respectively. <strong>Time complexity alone tells you nothing about which one will scale.</strong></p>
                  <p>The interview question "can you do this in O(1) space?" is asking: can you avoid that allocation, and can you avoid the recursion?</p>
                </>
              ),
            },
          ]}
        />

        <h3>Drill: what&apos;s the auxiliary space?</h3>

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary space of this method?\n\nint maxA(int[] arr) {\n    int best = Integer.MIN_VALUE;\n    for (int x : arr) {\n        if (x > best) best = x;\n    }\n    return best;\n}"}
          options={[
            { label: "O(n) — we walk the array.", explanation: "We walk the array (that's O(n) time), but the only extra memory is one int. Walking ≠ allocating." },
            { label: "O(1)", correct: true, explanation: "Right. One int (best) and one loop variable. The input array doesn't count toward auxiliary space — it was already there." },
            { label: "O(log n)", explanation: "There's no halving here. log n shows up when we recurse with halved input or use a balanced tree." },
            { label: "O(n²)", explanation: "There's only one loop and one variable. n² would require a nested allocation pattern we don't see here." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary space?\n\nList<Integer> doubles(int[] arr) {\n    List<Integer> out = new ArrayList<>();\n    for (int x : arr) out.add(x * 2);\n    return out;\n}"}
          options={[
            { label: "O(1) — we just have one list.", explanation: "It's 'one list' but the list contains n elements. The list's memory grows with n." },
            { label: "O(n)", correct: true, explanation: "Right. The output list grows to n elements. Even though we only declared one variable, that variable holds O(n) data." },
            { label: "O(2n) → O(n)", explanation: "The answer is O(n), but not because of doubling. We don't double-count — there's only one list, with n entries." },
            { label: "O(n²)", explanation: "The list has n elements, not n². No nested growth here." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary space?\n\nboolean[][] grid(int n) {\n    boolean[][] g = new boolean[n][n];\n    for (int i = 0; i < n; i++) g[i][i] = true;\n    return g;\n}"}
          options={[
            { label: "O(n) — we set n values.", explanation: "We set n cells, but we ALLOCATED n×n cells (the whole grid). Allocation matters, not how many you wrote to." },
            { label: "O(n²)", correct: true, explanation: "Right. The 2D array is n×n booleans = n² total cells. Auxiliary is the size of what we allocate, not what we touch." },
            { label: "O(1)", explanation: "We're allocating an n×n grid. That's very much not constant." },
            { label: "O(log n)", explanation: "Nothing halves here. We allocate the full grid up front." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Auxiliary space is what you allocate beyond the input. It's the number that matters."
          points={[
            { takeaway: "Total space = input + auxiliary. Auxiliary is the part you control.", detail: "When someone asks 'what's the space complexity?' they mean auxiliary 99% of the time. Total space mostly shows up in academic settings." },
            { takeaway: "Auxiliary space is about what you ALLOCATE, not what you read.", detail: "Walking an array is O(n) time but O(1) space. You touched n cells but didn't create any new ones." },
            { takeaway: "An algorithm's output counts toward auxiliary space.", detail: "If you build a new list of length n to return, that's O(n) auxiliary. Even though it 'has to exist.' Some interviewers exclude the output; most don't. Ask if it matters." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3: THE CALL STACK */}
      <Checkpoint moduleSlug="space-complexity" id="call-stack" title="The call stack" xp={20} celebration="You now know why deep recursion crashes. The JVM's two memories make sense.">
      <section>
        <h2>Part 3: The call stack — where recursion costs memory</h2>

        <p>
          Recursion looks free. You write <code>return f(n - 1) + f(n - 2)</code> and it just... works. But every one of those calls has a real cost: a <strong>stack frame</strong>.
        </p>

        <h3>JVM memory: the two-region model</h3>

        <p>
          A running Java thread has two main memory regions it cares about. You almost never write code that names them, but understanding them is the difference between guessing and knowing.
        </p>

        <Mermaid chart={memoryLayout} />

        <ul>
          <li>
            <strong>The stack.</strong>{" "}Per-thread, small (default ~512 KB to 1 MB). Holds <strong>stack frames</strong> — one per active method call. A frame contains the method&apos;s local variables, parameters, and the return address. When the method returns, its frame is popped.
          </li>
          <li>
            <strong>The heap.</strong>{" "}Shared across all threads, large (gigabytes). Holds every object you create with <code>new</code>: arrays, ArrayLists, every <code>Integer</code>, every <code>String</code>. Garbage-collected when nothing references it.
          </li>
        </ul>

        <Callout variant="insight" title="The thing that's small is the thing recursion fills">
          <p className="m-0">
            The stack is the small one. Recursion piles up frames on the stack. That&apos;s why recursing too deep doesn&apos;t just slow down — it crashes with <code>StackOverflowError</code>. You ran out of the small memory, not the big one.
          </p>
        </Callout>

        <h3>Watching factorial run</h3>

        <p>Here&apos;s plain recursive factorial:</p>

        <CodeBlock lang="java">{`int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`}</CodeBlock>

        <p>
          Call <code>factorial(4)</code>. Before <em>any</em>{" "}multiplication can happen, the JVM has to push four frames onto the stack:
        </p>

        <Mermaid chart={recursionStack} />

        <p>
          <code>factorial(4)</code> can&apos;t finish until <code>factorial(3)</code> returns. <code>factorial(3)</code> can&apos;t finish until <code>factorial(2)</code> does. And so on. All four frames are alive at the same time. <strong>That&apos;s O(n) auxiliary space</strong> — even though the only "data" we&apos;re tracking is a single int.
        </p>

        <p>
          Now imagine <code>factorial(1_000_000)</code>. That&apos;s a million stack frames piled on a 1 MB stack. <code>StackOverflowError</code>, before you even compute one multiplication.
        </p>

        <h3>Recursion vs iteration: same answer, different memory</h3>

        <WorkedExample
          title="Factorial: recursive vs iterative"
          subtitle="Identical output. O(1) vs O(n) auxiliary space. The recursive one will crash."
          steps={[
            {
              title: "Recursive — O(n) auxiliary (stack)",
              body: (
                <>
                  <CodeBlock lang="java">{`long factorialRec(int n) {
    if (n <= 1) return 1;
    return n * factorialRec(n - 1);   // n frames pile up
}`}</CodeBlock>
                  <p>Each call adds a frame. <code>factorialRec(50_000)</code> blows the stack on a default JVM.</p>
                </>
              ),
            },
            {
              title: "Iterative — O(1) auxiliary",
              body: (
                <>
                  <CodeBlock lang="java">{`long factorialIter(int n) {
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}`}</CodeBlock>
                  <p>One <code>long</code>, one loop variable. Same answer, no stack growth, no crash.</p>
                </>
              ),
            },
            {
              title: "The lesson",
              body: (
                <>
                  <p>Anywhere recursion descends linearly with n, you can usually replace it with a loop and save O(n) stack space. The exception is "natural" recursion (trees, divide-and-conquer) where the recursion depth is O(log n) — that&apos;s the price of admission.</p>
                  <p>Java doesn&apos;t do tail-call optimization. Some languages (Scala, Scheme) turn tail-recursive calls into loops automatically. The JVM does not. So in Java, deep linear recursion is always a real space cost.</p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="warn" title="Java has no TCO — this trips up Scala/Scheme refugees">
          <p className="m-0">
            In some languages, a tail-recursive call (the recursive call is the last thing the method does) gets optimized into a loop, using O(1) stack. The JVM does <em>not</em>{" "}do this. Every recursive call costs a frame, period. If you&apos;re used to relying on TCO, retrain — in Java, deep linear recursion is a bug.
          </p>
        </Callout>

        <h3>Drill: what&apos;s the stack space?</h3>

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary stack space of this method, called as binarySearch(arr, 0, arr.length - 1, target)?\n\nint binarySearch(int[] arr, int lo, int hi, int target) {\n    if (lo > hi) return -1;\n    int mid = (lo + hi) >>> 1;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) return binarySearch(arr, mid + 1, hi, target);\n    return binarySearch(arr, lo, mid - 1, target);\n}"}
          options={[
            { label: "O(1) — it returns from each call.", explanation: "It does return — but only AFTER the recursive call returns. Frames pile up while the recursion descends." },
            { label: "O(log n)", correct: true, explanation: "Right. Each call halves the search range, so the recursion is log n deep. log n frames on the stack." },
            { label: "O(n)", explanation: "If we recursed by 1 each time it'd be O(n). But binary search halves the range — log n depth." },
            { label: "O(n log n)", explanation: "n log n is a TIME shape, not a space shape here. Stack depth is just the number of nested calls = log n." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary stack space of fib(n)?\n\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}"}
          options={[
            { label: "O(2ⁿ) — the time complexity.", explanation: "The TIME is exponential. But the stack space is the maximum DEPTH, not the total number of calls." },
            { label: "O(n)", correct: true, explanation: "Right. The deepest path is fib(n) → fib(n-1) → fib(n-2) → … → fib(0), which is n levels deep. Only one path is alive on the stack at a time. So O(n) space, even though TIME is O(2ⁿ)." },
            { label: "O(log n)", explanation: "There's no halving — each call decreases n by 1, not by half." },
            { label: "O(1)", explanation: "fib(n) does recurse — at minimum n levels deep before any return." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The call stack is the small memory. Recursion fills it. Depth = stack space."
          points={[
            { takeaway: "JVM memory has two regions: per-thread stack (small) and shared heap (large).", detail: "Stack frames hold local variables and parameters for one active method call. The heap holds every object you 'new'." },
            { takeaway: "Recursion's auxiliary space = MAX recursion depth, not total calls.", detail: "fib(n) makes O(2ⁿ) calls but only n are alive at once. Time and space have different shapes — don't confuse them." },
            { takeaway: "Java has no tail-call optimization. Deep linear recursion is always a space cost.", detail: "If your recursive method's last action is the recursive call (tail call), the JVM still pushes a frame. Replace with a loop if depth grows with n." },
            { takeaway: "Linear recursion (depth-n) is usually replaceable with a loop. Tree recursion (depth-log-n) usually isn't worth replacing.", detail: "Depth O(log n) — a million-element binary search recurses 20 times. That's fine. Depth O(n) — a million-element linear recursion is a stack overflow." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 4: READING CODE FOR SPACE */}
      <Checkpoint moduleSlug="space-complexity" id="reading-code" title="Reading code for space" xp={15} celebration="You can now read a method and call out its auxiliary space at sight.">
      <section>
        <h2>Part 4: Reading code for space</h2>

        <p>
          Three rules will get you 90% of the way to a correct space answer on any method you&apos;ll see in an interview:
        </p>

        <Callout variant="info" title="The three rules of reading auxiliary space">
          <ol className="mb-0">
            <li><strong>Count what you allocate.</strong>{" "}Every <code>new</code>, every <code>ArrayList</code>, every map, every set. Add up their sizes as a function of n.</li>
            <li><strong>Count the recursion depth.</strong>{" "}If the method recurses, the maximum depth contributes to auxiliary space (one frame per level of depth).</li>
            <li><strong>Don&apos;t double-count loop variables.</strong>{" "}A <code>for</code> loop reuses its index variable. It&apos;s O(1), not O(n), no matter how many times it iterates.</li>
          </ol>
        </Callout>

        <h3>Pattern catalog: what each construct costs</h3>

        <ul>
          <li><code>int x = 0;</code> → <strong>O(1)</strong>. One slot.</li>
          <li><code>int[] a = new int[n];</code> → <strong>O(n)</strong>. n slots.</li>
          <li><code>int[][] g = new int[n][n];</code> → <strong>O(n²)</strong>. n × n slots.</li>
          <li><code>{`Map<Integer, Integer> m = new HashMap<>();`}</code> with up to n inserts → <strong>O(n)</strong>.</li>
          <li><code>{`Set<String> s = new HashSet<>();`}</code> with up to n inserts → <strong>O(n)</strong>.</li>
          <li>A <code>for (int i = 0; i &lt; n; i++)</code> loop, no allocations inside → <strong>O(1)</strong>.</li>
          <li>A method that recurses with depth d → <strong>O(d)</strong>.</li>
        </ul>

        <h3>Classify these snippets</h3>

        <ClassifyChallenge
          title="Drag each snippet into its space-complexity bucket"
          prompt="Auxiliary space (extra memory beyond the input). Drop each snippet onto the matching curve."
          buckets={[
            { id: "constant", label: "O(1)", color: "emerald" },
            { id: "log", label: "O(log n)", color: "sky" },
            { id: "linear", label: "O(n)", color: "indigo" },
            { id: "quadratic", label: "O(n²)", color: "rose" },
          ]}
          items={[
            { id: "swap", label: "Swap two elements of an array in place using a temp variable", answer: "constant", explanation: "One temp variable. No matter how big the array is, that's constant." },
            { id: "sum-acc", label: "Sum an int[] using one accumulator", answer: "constant", explanation: "One int (the running sum) plus a loop variable. Constant." },
            { id: "twoptrs", label: "Two-pointer reverse of an array (in place)", answer: "constant", explanation: "Two pointers and a temp. The input array is reused — no new allocation." },
            { id: "binsearch-it", label: "Iterative binary search", answer: "constant", explanation: "Three indices (lo, hi, mid). No recursion, no extra allocation." },
            { id: "binsearch-rec", label: "Recursive binary search", answer: "log", explanation: "Each call halves the range, so the recursion is log n deep — log n stack frames." },
            { id: "merge-sort-aux", label: "Merge sort's auxiliary buffer for the merge step", answer: "linear", explanation: "Merge sort allocates an O(n) buffer for merging. That's the dominant auxiliary cost." },
            { id: "linear-rec", label: "Recursive sum that recurses by index (i, i+1, …, n)", answer: "linear", explanation: "Decrement-by-1 recursion piles up n stack frames — O(n) auxiliary space." },
            { id: "hash-set-pass", label: "Walk an array, add every element to a HashSet", answer: "linear", explanation: "The HashSet can grow to n entries — that's O(n) auxiliary." },
            { id: "adj-matrix", label: "Build adjacency matrix for a graph of n nodes", answer: "quadratic", explanation: "An n×n boolean matrix is n² cells. Quadratic space — one of the reasons adjacency lists are usually preferred for sparse graphs." },
            { id: "pair-list", label: "Build a list of every (i, j) pair from an n-array", answer: "quadratic", explanation: "n² pairs means n² list entries — quadratic auxiliary space." },
          ]}
        />

        <h3>The trap: confusing time with space</h3>

        <p>
          Here&apos;s the single most common mistake: people see a nested loop and write down O(n²) for both time AND space, because they&apos;re not separating the two ideas.
        </p>

        <CodeBlock lang="java">{`int countPairs(int[] arr) {
    int count = 0;
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] + arr[j] == 0) count++;
        }
    }
    return count;
}`}</CodeBlock>

        <p>
          Time? <strong>O(n²)</strong>. We do n² pair-comparisons.
        </p>
        <p>
          Space? <strong>O(1)</strong>. We have one int (<code>count</code>) and two loop variables (<code>i</code>, <code>j</code>). The nested loop generates a lot of <em>work</em>, not a lot of <em>memory</em>.
        </p>

        <Callout variant="warn" title="Iteration is cheap; allocation is not">
          <p className="m-0">
            A loop, no matter how nested, is O(1) auxiliary space — unless something inside the loop allocates. <code>new int[n]</code> inside an outer n-loop? <em>That</em>{" "}is O(n²) space.
          </p>
        </Callout>

        <h3>Drill: the full table</h3>

        <Quiz
          kind="Quick check"
          question={"What's the time AND auxiliary space?\n\nint[][] table(int n) {\n    int[][] t = new int[n][n];\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++)\n            t[i][j] = i * j;\n    return t;\n}"}
          options={[
            { label: "Time O(n²), space O(1).", explanation: "Time is right, but we ALLOCATED an n×n table. That's n² space." },
            { label: "Time O(n²), space O(n²).", correct: true, explanation: "Right. Both n² — but for different reasons. n² time from the nested loop. n² space from the n×n allocation." },
            { label: "Time O(n), space O(n²).", explanation: "Two nested loops up to n means n² steps, not n. The space is right but the time is undercounted." },
            { label: "Time O(n²), space O(n).", explanation: "We allocated an n×n grid, not an n-array. The grid has n² cells, so space is n²." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary space?\n\nList<List<Integer>> partition(int[] arr) {\n    List<List<Integer>> all = new ArrayList<>();\n    for (int x : arr) {\n        List<Integer> single = new ArrayList<>();\n        single.add(x);\n        all.add(single);\n    }\n    return all;\n}"}
          options={[
            { label: "O(n) — one list with n elements.", correct: true, explanation: "Right. We allocate n inner lists, each holding 1 element. Total: n+1 list objects, n int boxes. That's O(n) overall — n constant-size things." },
            { label: "O(n²) — nested lists.", explanation: "Nested in code doesn't mean n×n in memory. Each inner list holds 1 element, not n." },
            { label: "O(1)", explanation: "We're creating n+1 list objects. That's very much not constant." },
            { label: "O(log n)", explanation: "No halving anywhere. Each iteration adds one list." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question={"What's the auxiliary space?\n\nint mystery(int n) {\n    if (n <= 1) return 1;\n    return mystery(n / 2) + mystery(n / 2);\n}"}
          options={[
            { label: "O(2ⁿ) — there are 2ⁿ calls.", explanation: "There are MANY calls, but stack space is the max DEPTH at any moment, not the total." },
            { label: "O(log n)", correct: true, explanation: "Right. Each call halves n. The deepest the stack gets is log₂ n. Only one branch is live at a time on the stack — the others have already returned or haven't started." },
            { label: "O(n)", explanation: "If we decreased by 1 each call it'd be n. But we halve, so depth = log n." },
            { label: "O(n²)", explanation: "n² doesn't show up in pure recursion depth. Watch for halving (log) vs decrement (linear)." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Three rules: count allocations, count recursion depth, don't count loop variables."
          points={[
            { takeaway: "Auxiliary space is the SUM of allocations and the MAX recursion depth.", detail: "Two independent contributors. A method that allocates a list of n AND recurses n deep is O(n) — the bigger of the two dominates, and they're both n here." },
            { takeaway: "A loop alone is O(1) space — it's the body that decides.", detail: "for (int i = 0; i < n; i++) {} is O(1). for (...) { new int[n]; } is O(n²)." },
            { takeaway: "Halving recursion → O(log n) depth. Decrement recursion → O(n) depth.", detail: "This is the same shape rule from Module 1, applied to space. The pattern transfers cleanly: log n appears wherever you halve." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 5: PROJECT */}
      <Checkpoint moduleSlug="space-complexity" id="project" title="Project: stack visualizer" xp={25} manual manualLabel="I built it and watched the stack grow" celebration="You watched recursion eat memory in real time. The mental model is now muscle memory.">
      <section>
        <h2>Part 5: Project — see the stack grow</h2>

        <p>
          Time to make this concrete. You&apos;re going to write a small Java program that:
        </p>
        <ol>
          <li>Computes factorial three ways: iterative, recursive, and recursive-with-tracing.</li>
          <li>Reports peak stack depth as the recursion runs.</li>
          <li>Pushes the recursive version until it crashes — and prints the depth at which it died.</li>
        </ol>

        <h3>The setup</h3>

        <p>Same setup as Module 1&apos;s benchmark — Maven project, Java 17+. If you still have the project from last module, you can drop this in alongside it.</p>

        <CodeBlock lang="plain" caption="pom.xml — minimal">{`<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.skillforge</groupId>
    <artifactId>space-lab</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
</project>`}</CodeBlock>

        <h3>Step 1: three factorials</h3>

        <p>Write all three implementations in a single file. The recursive-with-tracing version uses <code>Thread.currentThread().getStackTrace()</code> to peek at the actual call stack at each level.</p>

        <CodeBlock lang="java" caption="src/main/java/com/skillforge/StackVisualizer.java">{`package com.skillforge;

public class StackVisualizer {

    // ──────── 1. Iterative — O(1) auxiliary space ────────
    static long factorialIter(int n) {
        long result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }

    // ──────── 2. Recursive — O(n) auxiliary space (stack) ────────
    static long factorialRec(int n) {
        if (n <= 1) return 1;
        return n * factorialRec(n - 1);
    }

    // ──────── 3. Recursive with tracing — same shape, prints stack depth ────────
    static int peakDepth = 0;
    static long factorialTrace(int n) {
        int depth = Thread.currentThread().getStackTrace().length;
        if (depth > peakDepth) peakDepth = depth;
        if (n <= 1) return 1;
        return n * factorialTrace(n - 1);
    }

    public static void main(String[] args) {
        System.out.println("─── Sanity check: all three agree at n=10 ───");
        System.out.println("  iter:  " + factorialIter(10));
        System.out.println("  rec:   " + factorialRec(10));
        System.out.println("  trace: " + factorialTrace(10));
        System.out.println("  peak stack depth: " + peakDepth);
    }
}`}</CodeBlock>

        <p>Run it:</p>

        <CodeBlock lang="plain">{`mvn -q compile exec:java -Dexec.mainClass=com.skillforge.StackVisualizer

─── Sanity check: all three agree at n=10 ───
  iter:  3628800
  rec:   3628800
  trace: 3628800
  peak stack depth: 12   (10 factorial frames + 2 framework frames)`}</CodeBlock>

        <p>The three answers match. The peak depth is roughly n + 2 — as expected, the recursion is exactly n deep.</p>

        <h3>Step 2: push until it crashes</h3>

        <p>Add a "crash test" that recurses harder and harder until the JVM kills it:</p>

        <CodeBlock lang="java">{`static int crashTest(int n) {
    if (n <= 0) return 0;
    return 1 + crashTest(n - 1);   // returns total recursion depth
}

public static void main(String[] args) {
    // Sanity check first (omitted — same as before)

    // Crash test: try increasingly deep recursion
    System.out.println("\\n─── Crash test: how deep can we go? ───");
    int[] targets = {1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000};
    for (int target : targets) {
        try {
            int depth = crashTest(target);
            System.out.printf("  target %,d → reached depth %,d ✓%n", target, depth);
        } catch (StackOverflowError e) {
            System.out.printf("  target %,d → 💥 StackOverflowError%n", target);
        }
    }
}`}</CodeBlock>

        <p>Sample output on a default JVM:</p>

        <CodeBlock lang="plain">{`─── Crash test: how deep can we go? ───
  target 1,000     → reached depth 1,000 ✓
  target 10,000    → reached depth 10,000 ✓
  target 50,000    → 💥 StackOverflowError
  target 100,000   → 💥 StackOverflowError
  target 500,000   → 💥 StackOverflowError
  target 1,000,000 → 💥 StackOverflowError`}</CodeBlock>

        <p>
          The exact crash threshold varies by JVM version, OS, and stack-size flags — somewhere between 10k and 100k for most setups. The point isn&apos;t the number. The point is: <strong>there is a number</strong>, and an O(n) recursion will hit it.
        </p>

        <Callout variant="insight" title="The default stack size is small on purpose">
          <p className="m-0">
            The JVM defaults to ~512 KB to 1 MB per thread. You can raise it with <code>-Xss8m</code>, but you&apos;d be papering over the bug. Each thread carries its own stack, so big stacks × many threads = real RAM pressure. The right fix is almost always &quot;don&apos;t recurse linearly.&quot;
          </p>
        </Callout>

        <h3>Step 3: rescue with iteration</h3>

        <p>To prove the algorithm itself is fine — it&apos;s the recursion that broke — run the iterative version on the same input that crashed:</p>

        <CodeBlock lang="java">{`// In main, after the crash test:
System.out.println("\\n─── Iterative survives anything ───");
System.out.println("  factorialIter(1_000_000) (modulo overflow) = "
                   + factorialIter(1_000_000));`}</CodeBlock>

        <p>
          It runs. (The <code>long</code> overflows quickly — that&apos;s a different problem — but the program doesn&apos;t crash.) Same algorithm, no recursion, no stack pressure.
        </p>

        <h3>Stretch goals (optional)</h3>
        <ul>
          <li><strong>Raise the stack size.</strong>{" "}Run with <code>java -Xss8m com.skillforge.StackVisualizer</code> and see how much deeper you can recurse. (Then think about how many threads × that size your service can afford.)</li>
          <li><strong>Add fib.</strong>{" "}Implement recursive fib(n) and print peak stack depth. Confirm it&apos;s O(n), not O(2ⁿ) — even though TIME is exponential.</li>
          <li><strong>Memoize fib.</strong>{" "}Add a <code>Map&lt;Integer, Long&gt;</code> cache. Watch the time complexity drop from O(2ⁿ) to O(n) — but space goes from O(n) (just stack) to O(n) heap + O(n) stack. You traded one kind of space for time.</li>
          <li><strong>Memory profile.</strong>{" "}Run with <code>-Xlog:gc</code> to see heap allocations. The recursive version barely allocates on the heap (it&apos;s all stack). The memoized version fills the heap proportionally.</li>
        </ul>
      </section>
      </Checkpoint>

      {/* PART 6: FINAL */}
      <Checkpoint moduleSlug="space-complexity" id="final" title="Final quiz" xp={20} celebration="Module 2 done. Time and space — the two halves of Big-O are loaded.">
      <section>
        <h2>Part 6: Final quiz</h2>
        <p>One more set, mixing everything from the module.</p>

        <Quiz
          kind="Final"
          question={"What's the auxiliary space of this method?\n\nint[] reverse(int[] arr) {\n    int n = arr.length;\n    int[] out = new int[n];\n    for (int i = 0; i < n; i++) out[i] = arr[n - 1 - i];\n    return out;\n}"}
          options={[
            { label: "O(1) — we just reverse it.", explanation: "We allocate a NEW array of size n. That's O(n). The in-place reverse would be O(1) — but this isn't in place." },
            { label: "O(n)", correct: true, explanation: "Right. The allocated output array is n ints. Auxiliary space is O(n)." },
            { label: "O(log n)", explanation: "No halving. We allocate a full-size new array up front." },
            { label: "O(n²)", explanation: "One array of size n, not n². Don't double-count the loop." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"Same problem, different code. What's the auxiliary space NOW?\n\nvoid reverseInPlace(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n / 2; i++) {\n        int tmp = arr[i];\n        arr[i] = arr[n - 1 - i];\n        arr[n - 1 - i] = tmp;\n    }\n}"}
          options={[
            { label: "O(n) — we still touch every element.", explanation: "Touching ≠ allocating. The only memory we add is one int (tmp) plus a loop variable." },
            { label: "O(1)", correct: true, explanation: "Right. tmp + loop variable = constant. The input array isn't auxiliary. This is the classic 'in-place' optimization that drops space from O(n) to O(1)." },
            { label: "O(log n)", explanation: "There's no halving structure here — it's a single loop with a fixed amount of memory inside." },
            { label: "O(n / 2) → O(n)", explanation: "We don't allocate n / 2 things — only one tmp slot, reused each iteration." },
          ]}
        />

        <Quiz
          kind="Final"
          question={"Time AND auxiliary space?\n\nMap<Integer, Integer> count(int[] arr) {\n    Map<Integer, Integer> freq = new HashMap<>();\n    for (int x : arr) freq.merge(x, 1, Integer::sum);\n    return freq;\n}"}
          options={[
            { label: "Time O(n), space O(1).", explanation: "Time is right, but we build a HashMap that can hold up to n distinct keys. That's O(n) space." },
            { label: "Time O(n), space O(n).", correct: true, explanation: "Right. One pass = O(n) time. Map can grow to n entries (if every element is unique) = O(n) space. The 'frequency map' pattern is one of the most common O(n) space trades." },
            { label: "Time O(n²), space O(n).", explanation: "We make one pass with O(1) average HashMap operations. That's O(n) total time, not n²." },
            { label: "Time O(n log n), space O(n).", explanation: "Sorting would be n log n, but we're hashing — average O(1) per insert, O(n) total." },
          ]}
        />

        <Quiz
          kind="Final"
          question="A recursive method calls itself with input size n - 1 and runs until n = 0. Its auxiliary space is:"
          options={[
            { label: "O(1)", explanation: "Each call adds a frame. n calls = n frames alive at once = O(n) stack space." },
            { label: "O(log n)", explanation: "log n shows up when you halve. Decrementing by 1 means n levels deep, not log n." },
            { label: "O(n)", correct: true, explanation: "Right. Decrementing recursion depth = n. n stack frames pile up before the first one returns. That's O(n) auxiliary stack space." },
            { label: "O(n²)", explanation: "The depth is n, not n². n² would require something like recursing twice, then twice from each — and even then we're looking at the deepest path, not the count." },
          ]}
        />

        <Quiz
          kind="Final"
          question="Which statement is FALSE?"
          options={[
            { label: "An algorithm with O(1) time can have O(n) space.", explanation: "True — imagine a method that just does `int[] a = new int[n]; return a[0];`. Constant time, O(n) space." },
            { label: "An algorithm with O(n²) time always has O(n²) space.", correct: true, explanation: "FALSE — this is the one. Counting pairs in a nested loop is O(n²) time but O(1) space. Time and space are independent dimensions of complexity." },
            { label: "Recursion depth is the dominant contributor to stack space.", explanation: "True. Each level of depth = one frame. Total auxiliary stack ≈ max depth × frame size." },
            { label: "Java has no automatic tail-call optimization.", explanation: "True. Even tail-recursive methods push a new stack frame per call in the JVM." },
          ]}
        />

        <Quiz
          kind="Final"
          question="You're given a sorted int[] of length n and a target. You need to return whether the target exists. Best space complexity?"
          options={[
            { label: "Recursive binary search — O(log n) auxiliary.", explanation: "Recursive binary search is O(log n) STACK space. Iterative is O(1). When both work, prefer the smaller one." },
            { label: "Iterative binary search — O(1) auxiliary.", correct: true, explanation: "Right. Same time complexity as the recursive version (O(log n)) but O(1) space — no recursion frames piled up. This is the 'when in doubt, iterate' lesson." },
            { label: "HashSet contains — O(n) auxiliary.", explanation: "Building a HashSet from a sorted array is wasteful — you'd throw away the sortedness AND pay O(n) space. Iterative binary search wins here." },
            { label: "Linear scan — O(1) auxiliary, O(n) time.", explanation: "O(1) space is correct, but the array is sorted — we should use binary search to get O(log n) time too." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* Forward-look panel */}
      <section className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <h3 className="mt-0 mb-2">What you&apos;ll have when this module clears</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You can read a Java method and call out its time AND space complexity at sight. You know why deep linear recursion crashes the JVM, and you&apos;ve watched it happen with your own debugger. You can articulate the time-vs-space trade-off — the move that turns most "can you optimize this?" interview questions into a clean conversation.
        </p>
        <p className="mb-0 text-slate-700 dark:text-slate-300">
          <strong>Up next: Module 3 — Best, average, worst & amortized analysis.</strong>{" "}Why <code>ArrayList.add</code> is O(1) "on average" even though some calls trigger an O(n) resize. The doubling trick. The accounting and aggregate methods. The last piece of the complexity foundation before we start meeting actual data structures in Phase 2.
        </p>
        <div className="mt-5">
          <Link
            href="/courses/dsa/modules/amortized-analysis"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-rose-600 hover:to-orange-600 hover:shadow-md"
          >
            Continue to Module 3: Amortized analysis →
          </Link>
        </div>
      </section>
        <ModuleNav courseId="dsa" currentSlug="space-complexity" />
    </article>
  );
}
