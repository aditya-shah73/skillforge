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
  { id: "setup", title: "The recursion contract: trust the recursive call" },
  { id: "base-case", title: "Base-case discipline (and why infinite recursion is ALWAYS a base-case bug)" },
  { id: "tree", title: "The recursion tree, the call stack, and the cost" },
  { id: "dnc", title: "Divide-and-conquer: same idea, with halves" },
  { id: "master", title: "Recurrence relations: the Master Theorem cheat sheet" },
  { id: "project", title: "Project: Pow(x,n) + Merge K Sorted Lists" },
];

export default function RecursionModule() {
  const mod = getModuleBySlug("recursion")!;

  // sum(1..n) leap of faith
  const sumLeap = `
flowchart TB
    A["sum(5)<br/>= 5 + sum(4)"] --> B["sum(4)<br/>= 4 + sum(3)"]
    B --> C["sum(3)<br/>= 3 + sum(2)"]
    C --> D["sum(2)<br/>= 2 + sum(1)"]
    D --> E["sum(1)<br/>base: return 1"]
    E -.->|"returns 1"| D
    D -.->|"returns 3"| C
    C -.->|"returns 6"| B
    B -.->|"returns 10"| A
    A -.->|"returns 15"| F[("caller")]
    style A fill:#6366f1,color:#fff,stroke:#4338ca
    style B fill:#818cf8,color:#fff,stroke:#4f46e5
    style C fill:#a5b4fc,color:#000,stroke:#6366f1
    style D fill:#c7d2fe,color:#000,stroke:#818cf8
    style E fill:#fbbf24,color:#000,stroke:#d97706
    style F fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // fib(5) recursion tree showing exponential blowup with overlap
  const fibTree = `
flowchart TB
    F5(("fib(5)")) --> F4a(("fib(4)"))
    F5 --> F3a(("fib(3)"))
    F4a --> F3b(("fib(3)"))
    F4a --> F2a(("fib(2)"))
    F3a --> F2b(("fib(2)"))
    F3a --> F1a(("fib(1)"))
    F3b --> F2c(("fib(2)"))
    F3b --> F1b(("fib(1)"))
    F2a --> F1c(("fib(1)"))
    F2a --> F0a(("fib(0)"))
    F2b --> F1d(("fib(1)"))
    F2b --> F0b(("fib(0)"))
    F2c --> F1e(("fib(1)"))
    F2c --> F0c(("fib(0)"))
    style F5 fill:#6366f1,color:#fff,stroke:#4338ca
    style F4a fill:#818cf8,color:#fff
    style F3a fill:#fca5a5,color:#000,stroke:#dc2626
    style F3b fill:#fca5a5,color:#000,stroke:#dc2626
    style F2a fill:#fde68a,color:#000,stroke:#d97706
    style F2b fill:#fde68a,color:#000,stroke:#d97706
    style F2c fill:#fde68a,color:#000,stroke:#d97706
  `.trim();

  // Pow(x,n) divide-and-conquer recursion tree
  const powTree = `
flowchart TB
    P10["pow(x,10)<br/>= pow(x,5)²"] --> P5["pow(x,5)<br/>= x · pow(x,2)²"]
    P5 --> P2["pow(x,2)<br/>= pow(x,1)²"]
    P2 --> P1["pow(x,1)<br/>= x · pow(x,0)²"]
    P1 --> P0["pow(x,0)<br/>base: return 1"]
    style P10 fill:#6366f1,color:#fff,stroke:#4338ca
    style P5 fill:#818cf8,color:#fff
    style P2 fill:#a5b4fc,color:#000
    style P1 fill:#c7d2fe,color:#000
    style P0 fill:#fbbf24,color:#000,stroke:#d97706
  `.trim();

  // Merge K sorted lists pairing tree (D&C)
  const mergeKTree = `
flowchart TB
    subgraph R0["Round 0 · 8 lists"]
        direction LR
        L1["L1"]
        L2["L2"]
        L3["L3"]
        L4["L4"]
        L5["L5"]
        L6["L6"]
        L7["L7"]
        L8["L8"]
    end
    subgraph R1["Round 1 · pair-merge → 4 lists"]
        direction LR
        M12["L1+L2"]
        M34["L3+L4"]
        M56["L5+L6"]
        M78["L7+L8"]
    end
    subgraph R2["Round 2 · pair-merge → 2 lists"]
        direction LR
        M14["L1..L4"]
        M58["L5..L8"]
    end
    subgraph R3["Round 3 · final merge → 1 list"]
        direction LR
        M18["L1..L8"]
    end
    R0 --> R1 --> R2 --> R3
    style R0 fill:#1e293b,color:#fff
    style R1 fill:#312e81,color:#fff
    style R2 fill:#4c1d95,color:#fff
    style R3 fill:#10b981,color:#fff
  `.trim();

  // Master Theorem visualization: where does the work live?
  const masterDiagram = `
flowchart TB
    subgraph Case1["Case 1 · leaves dominate &nbsp; T(n)=2T(n/2)+O(1)"]
        direction TB
        C1A["O(1)"] --> C1B["O(1) · O(1)"]
        C1B --> C1C["... n leaves at O(1) each = O(n)"]
    end
    subgraph Case2["Case 2 · balanced &nbsp; T(n)=2T(n/2)+O(n) → O(n log n)"]
        direction TB
        C2A["n"] --> C2B["n/2 + n/2 = n"]
        C2B --> C2C["n/4·4 = n"]
        C2C --> C2D["log n levels · n work each = n log n"]
    end
    subgraph Case3["Case 3 · root dominates &nbsp; T(n)=2T(n/2)+O(n²) → O(n²)"]
        direction TB
        C3A["n²"] --> C3B["(n/2)² + (n/2)² = n²/2"]
        C3B --> C3C["geometric — top level wins"]
    end
    style Case1 fill:#0f766e,color:#fff
    style Case2 fill:#4338ca,color:#fff
    style Case3 fill:#9f1239,color:#fff
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="recursion" />
      <ModuleProgress moduleSlug="recursion" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 6 · Module 27 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · the technique that runs underneath sorting, trees, and dynamic programming</p>
      </div>

      {/* ───────────────── Part 1 · The contract ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="setup" title="I trust the recursive call" xp={20}>
      <section>
        <h2 id="setup">The recursion contract: trust the recursive call</h2>

        <p>
          Most people&apos;s first reaction to recursion is to try to <em>simulate it in their head</em> — trace the
          calls down, watch them return, keep the whole call stack in working memory at once. That works for{" "}
          <code>n = 3</code>. It collapses for <code>n = 30</code>. The technique that actually scales is the
          opposite: stop simulating, and start <em>contracting</em>.
        </p>

        <Callout variant="insight" title="The leap of faith">
          <p>
            When you write a recursive function, your job is to <strong>assume the recursive call works</strong>{" "}for
            any smaller input — and then build the answer for <code>n</code> from the answer for <code>n-1</code>.
          </p>
          <p>
            You are not allowed to peek inside the recursive call. Not allowed to think about how it works. Just trust
            that <code>solve(smaller)</code> returns the correct answer, and use that result to construct the answer
            for the current size. If you can do that for one step, the recursion will do it for all steps.
          </p>
        </Callout>

        <h3>Sum from 1 to n — the canonical example</h3>

        <p>
          Suppose we want to compute <code>1 + 2 + 3 + ... + n</code>. There&apos;s a closed form, of course, but
          let&apos;s do it recursively to feel the technique.
        </p>

        <p>
          Step 1: imagine someone has already written <code>sum(n - 1)</code>. By the leap of faith, it returns the
          correct sum of <code>1..(n-1)</code>. Step 2: how would you build <code>sum(n)</code> from that? Trivially:
          add <code>n</code> to it.
        </p>

        <CodeBlock lang="java">{`int sum(int n) {
    if (n == 0) return 0;             // base case
    return n + sum(n - 1);            // trust sum(n-1), add n
}`}</CodeBlock>

        <p>
          That&apos;s the entire function. Two lines of logic. Notice what we did <em>not</em>{" "}do: simulate
          <code>sum(4) → sum(3) → sum(2) → ...</code> in our heads. We picked a single &quot;layer&quot; — &quot;given
          the answer for n-1, build the answer for n&quot; — and trusted recursion to handle the rest.
        </p>

        <Mermaid chart={sumLeap} />

        <p>
          The arrows down are the calls (n decreasing toward the base). The dashed arrows up are the returns, each one
          adding the current <code>n</code> to the smaller sum. You wrote the addition <em>once</em>; the runtime did
          it five times.
        </p>

        <h3>The three questions you ask every time</h3>

        <p>Every recursive function answers three questions in order. Get these right and you&apos;re done:</p>

        <ol>
          <li><strong>What&apos;s the smallest version of the problem I can answer directly?</strong>{" "}That&apos;s the base case. For sum, it&apos;s <code>sum(0) = 0</code>. For factorial, <code>factorial(0) = 1</code>. For tree height, <code>height(null) = 0</code>.</li>
          <li><strong>If I had the answer for a slightly smaller version, how would I build the answer for the current one?</strong>{" "}That&apos;s the recursive step. For sum, &quot;add n.&quot; For factorial, &quot;multiply by n.&quot; For tree height, &quot;1 + max of left and right heights.&quot;</li>
          <li><strong>How do I make &quot;smaller&quot;?</strong>{" "}n-1 in the linear cases, n/2 in divide-and-conquer, &quot;a child node&quot; in trees. The choice of how-to-shrink is what shapes the algorithm&apos;s cost.</li>
        </ol>

        <h3>Reverse a string — same recipe</h3>

        <p>
          To reverse a string, assume someone has already reversed everything except the first character. Append the
          first character to the end of that.
        </p>

        <CodeBlock lang="java">{`String reverse(String s) {
    if (s.length() <= 1) return s;                // base case
    return reverse(s.substring(1)) + s.charAt(0); // trust reverse(s[1..]), append s[0]
}`}</CodeBlock>

        <p>
          You did not have to think about how reverse works on the substring. You just trusted it would. The whole
          algorithm is one line of glue.
        </p>

        <Callout variant="info" title="Why this mental shift is the entire skill">
          <p>
            Once you stop trying to simulate the stack, recursion stops feeling magical and starts feeling mechanical.
            The hard part of every recursion problem is figuring out the contract — &quot;given the answer to some
            smaller version, what would I do?&quot; — not the syntax. After that, the code writes itself in two or
            three lines.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You're writing a recursive function to compute the length of a linked list. By the leap of faith, what do you assume the recursive call returns?"
          options={[
            { label: "The length of the entire list, including the current node.", explanation: "If the recursive call already gave you the total length, you wouldn't need to do anything — the function would be useless. Recursion only helps if the recursive call solves a strictly smaller problem." },
            { label: "The length of the rest of the list (everything after the current node). You then add 1 for the current node.", correct: true, explanation: "Right. That's the contract: the recursive call handles the tail; you add one for the head. length(node) = 1 + length(node.next), with length(null) = 0 as the base." },
            { label: "Just the next node.", explanation: "The recursive call should return a useful value — the answer to the subproblem — not a node. You'd be conflating 'walking the structure' with 'computing the answer.'" },
            { label: "Nothing useful — recursion can't compute lengths.", explanation: "Recursion is a perfect fit for linked-list traversal. The 'rest of the list' is a smaller list, and that's exactly the kind of self-similar structure recursion thrives on." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which statement best captures the 'leap of faith' technique?"
          options={[
            { label: "Trace every recursive call in your head until you see the pattern.", explanation: "That's the simulation approach — the one that collapses for any non-trivial input. The leap of faith is the opposite: stop tracing, start trusting." },
            { label: "Assume the recursive call returns the correct answer for the smaller input, and build the answer for the current input from that.", correct: true, explanation: "Right. You write one layer's worth of logic — 'given the smaller answer, build the bigger answer' — and trust the recursion to do that for every level. This is what makes recursive thinking actually scale." },
            { label: "Recursion is just a loop, so always rewrite it as one.", explanation: "Many recursions can be unrolled into loops, but that misses the point. The leap of faith is about how you reason about the code, not how you eventually execute it." },
            { label: "Always start with the base case and work upward.", explanation: "The base case is part of every recursion, but the leap of faith is about the recursive step. You don't 'work upward' — you write one layer and trust the rest." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Base case discipline ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="base-case" title="Base cases are non-negotiable, and progress is the invariant" xp={20}>
      <section>
        <h2 id="base-case">Base-case discipline (and why infinite recursion is ALWAYS a base-case bug)</h2>

        <p>
          Every recursion needs a base case — a value of the input where the function answers directly, without
          calling itself again. Without a base case, the recursion never terminates. <em>Every</em>{" "}infinite recursion
          you ever debug will turn out to be one of two bugs: the base case is missing, or the recursive call
          doesn&apos;t move toward it.
        </p>

        <h3>Factorial: a careful base case</h3>

        <CodeBlock lang="java">{`int factorial(int n) {
    if (n == 0) return 1;             // base case
    return n * factorial(n - 1);      // recursive step: shrinks toward 0
}`}</CodeBlock>

        <p>
          <code>factorial(3)</code> calls <code>factorial(2)</code>, which calls <code>factorial(1)</code>, which
          calls <code>factorial(0)</code>, which returns <code>1</code> directly. Every call shrinks <code>n</code>{" "}
          by one. The base case is reached after exactly <code>n</code> recursive calls, then the unwinding begins.
        </p>

        <h3>The bug: forgetting the input domain</h3>

        <p>What happens if a caller passes <code>factorial(-1)</code>?</p>

        <CodeBlock lang="java">{`factorial(-1)
  → -1 * factorial(-2)
  → -1 * -2 * factorial(-3)
  → -1 * -2 * -3 * factorial(-4)
  → ...   // never reaches n == 0; runs until StackOverflowError`}</CodeBlock>

        <Callout variant="warn" title="The progress invariant">
          <p>
            <strong>Every recursive call must move strictly closer to the base case.</strong> &quot;Closer&quot; has
            to be measured against whatever the base case checks for. If the base case is <code>n == 0</code> and the
            recursive call is <code>factorial(n - 1)</code>, then for <code>n = -1</code> we move <em>away</em>{" "}from
            zero. That&apos;s a base-case bug, not a recursion bug.
          </p>
          <p>
            The fix is either to harden the base case (<code>if (n &lt;= 0) return 1;</code>) or to validate the
            input at the entry point and reject negative values.
          </p>
        </Callout>

        <h3>The two flavors of &quot;infinite recursion&quot; bug</h3>

        <p>You will see exactly two bug shapes, every time. They look the same from the outside (<code>StackOverflowError</code>) but have different fixes:</p>

        <ol>
          <li>
            <strong>Missing or weak base case.</strong>{" "}The function recurses forever because no input value short-circuits.{" "}
            <em>Fix: add or broaden the base-case check.</em>
          </li>
          <li>
            <strong>Recursive call doesn&apos;t shrink the input.</strong>{" "}You called <code>solve(n)</code> instead of{" "}
            <code>solve(n - 1)</code>, or you forgot the <code>+ 1</code> on a tree-walk index, or you passed{" "}
            <code>node</code> instead of <code>node.next</code>. <em>Fix: trace one step of the input transformation
            and confirm it&apos;s strictly smaller.</em>
          </li>
        </ol>

        <CodeBlock lang="java">{`// BUG: recursive call doesn't shrink
int badSum(int n) {
    if (n == 0) return 0;
    return n + badSum(n);             // never shrinks → StackOverflowError
}

// BUG: base case can't be reached from negative input
int badFactorial(int n) {
    if (n == 0) return 1;
    return n * badFactorial(n - 1);   // factorial(-1) skips past 0 forever
}`}</CodeBlock>

        <h3>Stack overflow vs. heap overflow</h3>

        <p>
          Recursion lives on the <strong>call stack</strong> — a thread-local memory region the JVM allocates per
          thread for storing call frames (return addresses, local variables, parameters). It&apos;s separate from the
          heap, where objects allocated with <code>new</code> live.
        </p>

        <ul>
          <li>
            <strong>Stack:</strong>{" "}bounded, default ~512 KB per thread on the JVM. Each call frame for a small
            function is roughly 40-80 bytes. <strong>That gives you about 10,000–20,000 levels of recursion depth
            before <code>StackOverflowError</code></strong>.
          </li>
          <li>
            <strong>Heap:</strong>{" "}hundreds of megabytes to gigabytes (controlled by <code>-Xmx</code>). Holds your
            data structures. <code>OutOfMemoryError</code> is heap exhaustion, not stack.
          </li>
        </ul>

        <Callout variant="info" title="When do you actually hit the stack limit?">
          <p>
            10,000 levels sounds like a lot, but it&apos;s closer than you think. A linked list of length 1,000,000 is
            a single &quot;data structure&quot; that will blow the stack on a recursive traversal. A skewed binary
            tree (one that&apos;s effectively a list) does the same. A perfectly balanced tree with <em>2³⁰ = 1
            billion</em>{" "}nodes only has depth 30 — completely safe — but the moment your tree is unbalanced, depth
            grows linearly and you&apos;re at risk.
          </p>
          <p>
            For competitive programming and LeetCode, the JVM stack is fine. For production code that processes
            user-supplied data structures of unknown depth, prefer iterative algorithms (an explicit{" "}
            <code>Deque</code> on the heap is bounded by heap memory, not stack memory) or bump the stack size with{" "}
            <code>-Xss</code> and run on a dedicated thread.
          </p>
        </Callout>

        <h3>Tail recursion (and why Java doesn&apos;t care)</h3>

        <p>
          A <strong>tail-recursive</strong>{" "}function has the recursive call as its very last action — nothing happens
          after it returns. Some languages (Scala, Scheme, Kotlin with <code>tailrec</code>) optimize tail calls into
          loops, eliminating the per-call stack frame. <strong>Java does not.</strong>{" "}A tail-recursive function in
          Java still consumes stack just like a non-tail-recursive one, so don&apos;t reach for tail recursion as a
          stack-saving trick on the JVM. If you need depth, rewrite as a loop with an explicit stack.
        </p>

        <Quiz
          kind="Base-case check"
          question="A function `void walk(Node n) { walk(n); }` runs and immediately throws StackOverflowError. Which bug shape is this?"
          options={[
            { label: "The base case is missing.", explanation: "There's no base case AND the recursive call doesn't shrink. Both bugs are present, but the call-doesn't-shrink one is what makes the StackOverflowError immediate — even with a base case, walk(n) → walk(n) → walk(n) would never reach it." },
            { label: "The recursive call doesn't shrink the input — it passes the same `n` instead of `n.next`.", correct: true, explanation: "Right. Every recursive call must move strictly closer to the base case. Here the input is identical at every level, so even a perfect base case would never fire. The fix is `walk(n.next)` plus a `if (n == null) return;` base." },
            { label: "Java's call stack is too small.", explanation: "Java's stack is fine for any sensibly-written recursion. The bug is in the function, not the JVM." },
            { label: "It's a heap-overflow, not a stack-overflow.", explanation: "Heap overflow is `OutOfMemoryError`. This was specifically `StackOverflowError`, which is exhaustion of the per-thread call-frame budget." },
          ]}
        />

        <Quiz
          kind="Base-case check"
          question="Why does `factorial(-1)` infinite-recurse on this code?  `int factorial(int n) { if (n == 0) return 1; return n * factorial(n - 1); }`"
          options={[
            { label: "Java doesn't support negative numbers in recursion.", explanation: "Java doesn't care about the sign of an integer parameter. The bug is logical, not language-level." },
            { label: "The base case `n == 0` is never reached because the recursive call moves AWAY from 0 when n starts negative.", correct: true, explanation: "Right. From n = -1, the recursive call goes to -2, then -3, ... away from the base case. The progress invariant is violated. Fix: change base case to `if (n <= 0) return 1;` or validate input at the entry point." },
            { label: "There's a typo in the recursive step.", explanation: "The recursive step is correct for n ≥ 0. The bug is that the base case can't be reached for n < 0." },
            { label: "`*` overflows for large n, causing the stack overflow.", explanation: "Integer overflow gives wrong values silently; it doesn't cause infinite recursion. Stack overflow here is purely about depth, not arithmetic." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · The recursion tree ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="tree" title="I can draw the tree and read its cost" xp={25}>
      <section>
        <h2 id="tree">The recursion tree, the call stack, and the cost</h2>

        <p>
          Once you have a recursive function, the question is: <em>how expensive is it?</em>{" "}The answer comes from
          drawing the <strong>recursion tree</strong> — every node is one call, every edge is &quot;this call invoked
          that one.&quot; The total work is the sum of work-per-node across the whole tree.
        </p>

        <p>
          For linear recursion like <code>sum(n)</code>, the tree is a thin chain of <code>n</code> nodes — each does
          O(1) work — and the total cost is O(n), same as the iterative loop. Boring; correct. The interesting cases
          are where the tree branches.
        </p>

        <h3>Naive Fibonacci — the cautionary tale</h3>

        <p>
          The textbook recursion. Two recursive calls per level, exponentially-many leaves.
        </p>

        <CodeBlock lang="java">{`int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}`}</CodeBlock>

        <Mermaid chart={fibTree} />

        <p>
          Look at how many <code>fib(2)</code> nodes are in the tree above — three of them, all computing the same
          value. <code>fib(3)</code> appears twice. The redundancy explodes with <code>n</code>: the number of nodes
          in the tree for <code>fib(n)</code> is roughly <code>φⁿ ≈ 1.618ⁿ</code>, which is O(2ⁿ) for our purposes.
          For <code>fib(40)</code>, that&apos;s on the order of a billion calls, and your laptop will sit and think
          about it for a while.
        </p>

        <Callout variant="insight" title="The overlap is the inefficiency — and the cure is memoization (Phase 7&apos;s next big idea)">
          <p>
            Naive recursive Fibonacci isn&apos;t slow because of recursion. It&apos;s slow because the tree
            recomputes the same subproblems many times. <code>fib(2)</code> is computed three times here; in{" "}
            <code>fib(40)</code> it&apos;s computed tens of millions of times.
          </p>
          <p>
            <strong>Memoize</strong> — cache the answer for each <code>n</code> the first time you compute it — and
            the tree collapses into a chain of unique subproblems. <code>fib</code> goes from O(2ⁿ) to O(n). This is
            the conceptual jump from recursion to dynamic programming, the topic of Module 32.
          </p>
        </Callout>

        <h3>Iterative vs. recursive: the cost is the same when there&apos;s no overlap</h3>

        <p>
          For <code>sum(n)</code> and <code>factorial(n)</code>, recursive and iterative implementations are both
          O(n). The recursive version uses O(n) <em>stack</em> (one frame per level); the iterative version uses{" "}
          O(1) stack. <em>Time</em>{" "}is the same; <em>space</em>{" "}differs. That&apos;s the trade.
        </p>

        <p>
          For <code>fib(n)</code>, naive recursive is O(2ⁿ) time, O(n) stack. Iterative is O(n) time, O(1) space.
          Two-variable iterative Fibonacci wins on every axis — the recursion is a teaching example, not a real
          implementation.
        </p>

        <CodeBlock lang="java">{`// O(n) time, O(1) space — the way you'd actually write it
int fibIter(int n) {
    if (n < 2) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return b;
}`}</CodeBlock>

        <h3>Reading the tree</h3>

        <p>To turn a recursion tree into a Big-O, ask three questions:</p>

        <ol>
          <li><strong>How many levels deep?</strong>{" "}That&apos;s the height of the tree, which equals the maximum recursion depth.</li>
          <li><strong>How many nodes per level?</strong>{" "}If each node makes <em>k</em>{" "}recursive calls, level <em>d</em>{" "}has up to <em>k^d</em>{" "}nodes.</li>
          <li><strong>How much work per node?</strong>{" "}Add up the work outside the recursive calls.</li>
        </ol>

        <p>
          Total time is <em>(work per node) × (total nodes)</em>. For naive Fibonacci: O(1) per node, O(2ⁿ) nodes,
          total O(2ⁿ). For sum: O(1) per node, O(n) nodes, total O(n).
        </p>

        <p>
          Total space (just the recursion) is the <em>maximum number of frames live at once</em>, which is the
          <em>height</em>{" "}of the tree, not the total node count. For Fibonacci that&apos;s O(n); for binary search
          that&apos;s O(log n).
        </p>

        <Quiz
          kind="Tree check"
          question="In the recursion tree for naive `fib(n)`, why is the runtime O(2ⁿ) rather than O(n)?"
          options={[
            { label: "Recursion has overhead, so it's always slower than iteration.", explanation: "Per-call overhead is a constant factor, not an exponential one. The overhead can't turn O(n) into O(2ⁿ) — only structural redundancy can." },
            { label: "Each call makes TWO recursive calls, and the same subproblems are recomputed many times. The tree is a binary tree of height n with no sharing — exponentially many nodes.", correct: true, explanation: "Right. With two recursive branches per node and no sharing, the node count grows as roughly φⁿ ≈ 1.618ⁿ — exponential. fib(2) appears Θ(φⁿ⁻¹) times in the tree, fib(3) appears Θ(φⁿ⁻²) times, etc. Memoization is the fix — it turns the tree into a DAG of n unique subproblems, recovering O(n)." },
            { label: "Java's recursion is slow.", explanation: "JVM recursion has roughly the same per-call cost as a function call in any compiled language. The blowup is structural, not language-level." },
            { label: "Stack frames are big.", explanation: "Frame size affects space, not asymptotic time. Even with 1-byte frames, 2ⁿ of them takes 2ⁿ time to set up." },
          ]}
        />

        <Quiz
          kind="Tree check"
          question="Recursive `sum(n)` and iterative `sum(n)` both run in O(n) time. What's actually different between them?"
          options={[
            { label: "Recursive is always slower because of function-call overhead.", explanation: "The constant factor is bigger for the recursive version, but Big-O is identical. Per-call overhead is bounded; it can't change the asymptotic class." },
            { label: "The recursive version uses O(n) stack space; the iterative version uses O(1).", correct: true, explanation: "Right. Time is identical — both touch each value once. Space differs: the recursive call chain holds n frames live at peak (one per outstanding call), while the iterative loop holds a single accumulator. For sum/factorial that doesn't matter; for n in the millions on the JVM, the recursive version blows the stack and the iterative one runs fine." },
            { label: "They produce different answers.", explanation: "Both compute the same mathematical sum. Recursion isn't a different algorithm here, just a different implementation strategy." },
            { label: "Iterative version uses more memory because the loop variables are on the heap.", explanation: "Loop variables are on the stack too — but only a constant number of them, regardless of n. That's the whole point: iterative is O(1) space, recursive is O(n) space." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Divide and conquer ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="dnc" title="I can apply divide-and-conquer with halves, not single steps" xp={25}>
      <section>
        <h2 id="dnc">Divide-and-conquer: same idea, with halves</h2>

        <p>
          <strong>Divide-and-conquer</strong>{" "}is recursion where the recursive call shrinks the input by a constant
          factor — typically half — instead of by one. The contract is the same (&quot;trust the recursive call&quot;),
          but because each level halves the input, the depth is <code>log n</code> instead of <code>n</code>. That
          one change is the difference between O(n) and O(log n), or between O(n²) and O(n log n).
        </p>

        <h3>The pattern</h3>

        <p>Every divide-and-conquer algorithm has three steps:</p>

        <ol>
          <li><strong>Divide</strong>{" "}the problem into smaller subproblems (usually two halves).</li>
          <li><strong>Conquer</strong>{" "}each subproblem by recursing.</li>
          <li><strong>Combine</strong>{" "}the subproblem answers into the answer for the current problem.</li>
        </ol>

        <p>
          Half of all the algorithms you already know are D&amp;C in disguise:
        </p>

        <ul>
          <li><strong>Binary search</strong>: divide by checking the middle, conquer the relevant half, no combine. T(n) = T(n/2) + O(1) → O(log n).</li>
          <li><strong>Merge sort</strong>: divide into two halves, conquer recursively, combine via merge. T(n) = 2T(n/2) + O(n) → O(n log n).</li>
          <li><strong>Quick sort</strong>: divide via partition (around a pivot), conquer each side recursively, no combine — partition does the work up front. T(n) = 2T(n/2) + O(n) on average → O(n log n).</li>
          <li><strong>Karatsuba multiplication, Strassen&apos;s matrix multiply, FFT</strong>: clever divides that shave the exponent in the recurrence.</li>
        </ul>

        <h3>Pow(x, n) — the canonical &quot;halve the exponent&quot; trick</h3>

        <p>
          Computing <code>x^n</code> the obvious way (multiply <code>x</code> by itself <code>n</code> times) is O(n).
          The divide-and-conquer version is O(log n), via a single observation:
        </p>

        <CodeBlock lang="plain">{`x^n  =  (x^(n/2))² for even n
x^n  =  x · (x^((n-1)/2))² for odd n`}</CodeBlock>

        <p>
          Each level <em>halves</em>{" "}the exponent instead of decrementing it. Depth is <code>log₂ n</code> instead of{" "}
          <code>n</code>. For <code>n = 2^60</code>, that&apos;s 60 multiplications instead of a quintillion.
        </p>

        <CodeBlock lang="java">{`double pow(double x, int n) {
    if (n == 0) return 1.0;
    double half = pow(x, n / 2);
    if (n % 2 == 0) return half * half;
    else            return half * half * x;
}`}</CodeBlock>

        <Mermaid chart={powTree} />

        <Callout variant="insight" title="Why the halving recursion is so much cheaper">
          <p>
            The slow version computes <code>x^10</code> as <code>x · x · x · ... · x</code> (10 multiplications). The
            fast version computes <code>x^5</code> once, squares it, and is done — the squaring re-uses the same
            result. The recursion tree is a chain (not a branching tree), and that chain has length{" "}
            <code>log₂ n</code>.
          </p>
          <p>
            Crucially we only call <code>pow(x, n / 2)</code> <em>once</em>{" "}and store the result. If we wrote{" "}
            <code>pow(x, n / 2) * pow(x, n / 2)</code> we&apos;d branch twice per level, recomputing the same thing,
            and we&apos;d be back to O(n). The single-binding is the whole optimization.
          </p>
        </Callout>

        <h3>Merge sort — D&amp;C on arrays</h3>

        <p>
          Merge sort is the cleanest D&amp;C algorithm in existence. Split into halves, sort each, merge.
        </p>

        <CodeBlock lang="java">{`void mergeSort(int[] a, int lo, int hi) {
    if (hi - lo <= 1) return;             // base: 0 or 1 element is sorted
    int mid = (lo + hi) >>> 1;
    mergeSort(a, lo, mid);                // sort left half
    mergeSort(a, mid, hi);                // sort right half
    merge(a, lo, mid, hi);                // combine
}

void merge(int[] a, int lo, int mid, int hi) {
    int[] tmp = new int[hi - lo];
    int i = lo, j = mid, k = 0;
    while (i < mid && j < hi) {
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi)  tmp[k++] = a[j++];
    System.arraycopy(tmp, 0, a, lo, tmp.length);
}`}</CodeBlock>

        <p>
          The recurrence is <code>T(n) = 2T(n/2) + O(n)</code> — two halves, plus O(n) for the merge. By the master
          theorem (next section), that&apos;s O(n log n).
        </p>

        <h3>Binary search — D&amp;C with a single child</h3>

        <p>
          Binary search divides but only conquers <em>one</em>{" "}half. There&apos;s no combine — the answer is in the
          chosen half by construction.
        </p>

        <CodeBlock lang="java">{`int search(int[] a, int target, int lo, int hi) {
    if (lo >= hi) return -1;
    int mid = (lo + hi) >>> 1;
    if (a[mid] == target) return mid;
    if (a[mid] < target)  return search(a, target, mid + 1, hi);
    else                  return search(a, target, lo, mid);
}`}</CodeBlock>

        <p>
          One recursive call, half the input. T(n) = T(n/2) + O(1) → O(log n).
        </p>

        <Callout variant="warn" title="When D&amp;C doesn&apos;t help">
          <p>
            D&amp;C only wins when (a) the divide is roughly balanced, and (b) the combine is cheap relative to the
            problem size. Quicksort with a worst-case pivot picks the smallest element as the pivot every time — the
            divide is 1 vs n-1, depth is n, and you&apos;re back to O(n²). Always use random or median-of-three
            pivots in practice; the JDK&apos;s dual-pivot quicksort goes even further.
          </p>
          <p>
            For problems where the &quot;combine&quot; is expensive (say, O(n²)), D&amp;C can be worse than a smarter
            iterative approach. Check the master theorem before assuming halving will help.
          </p>
        </Callout>

        <Quiz
          kind="D&C check"
          question="Why is `pow(x, n)` written as `double half = pow(x, n/2); return half * half;` instead of `return pow(x, n/2) * pow(x, n/2);`?"
          options={[
            { label: "It's a stylistic preference; both have the same performance.", explanation: "They have very different performance. The two-call version makes the algorithm O(n), not O(log n) — the same asymptotic class as the naive 'multiply n times' approach, just with extra branching." },
            { label: "Calling pow(x, n/2) twice would branch the recursion tree, recomputing the same value at every level — total cost O(n) instead of O(log n).", correct: true, explanation: "Right. Storing the result in a single variable means each level does one halving recursive call. Tree depth is log n, total nodes is log n, total work is O(log n). With two calls you'd have a binary tree of height log n with 2^(log n) = n leaves, and you'd be back to linear." },
            { label: "Java doesn't allow recursive calls in expressions.", explanation: "It does. You could write `pow(x, n/2) * pow(x, n/2)` and it would compile and run — just slowly." },
            { label: "Stack overflow.", explanation: "Both versions have the same recursion depth (log n). The difference is the *width* of the tree, which is what determines time, not stack depth." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Master theorem ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="master" title="I can read a recurrence and tell you its Big-O" xp={25}>
      <section>
        <h2 id="master">Recurrence relations: the Master Theorem cheat sheet</h2>

        <p>
          Once you can write a recurrence for an algorithm — &quot;the cost on input n is some sub-cost on smaller
          inputs plus some local work&quot; — there&apos;s a mechanical way to extract the Big-O. It&apos;s called
          the <strong>master theorem</strong>, and 90% of recurrences you&apos;ll see in interviews fall into one of
          its three cases.
        </p>

        <h3>The general form</h3>

        <CodeBlock lang="plain">{`T(n) = a · T(n/b) + f(n)

where:
  a  = number of subproblems per call
  b  = factor by which n shrinks per call
  f(n) = work outside the recursive calls (the "combine" step)`}</CodeBlock>

        <p>The three cases compare <code>f(n)</code> against <code>n^(log_b a)</code> — the &quot;leaf cost&quot;:</p>

        <ul>
          <li><strong>Case 1 — leaves dominate.</strong>{" "}If <code>f(n)</code> grows slower than <code>n^(log_b a)</code>, the work piles up at the bottom of the tree. T(n) = Θ(n^(log_b a)).</li>
          <li><strong>Case 2 — balanced.</strong>{" "}If <code>f(n) = Θ(n^(log_b a))</code>, every level does the same total work. T(n) = Θ(n^(log_b a) · log n).</li>
          <li><strong>Case 3 — root dominates.</strong>{" "}If <code>f(n)</code> grows faster than <code>n^(log_b a)</code>, the top level&apos;s work overwhelms everything below. T(n) = Θ(f(n)).</li>
        </ul>

        <Mermaid chart={masterDiagram} />

        <Callout variant="insight" title="The intuition without the algebra">
          <p>
            Picture the recursion tree as a stack of levels. Each level has some total amount of work. Three things
            can happen as you walk from the root to the leaves: (a) work shrinks geometrically — leaves dominate,
            (b) work stays the same per level — balanced, every level pays once and there are log n levels, or (c)
            work grows geometrically — root dominates. Master theorem is just naming those three patterns.
          </p>
          <p>
            You don&apos;t need to memorize the inequality. Just sketch the tree, sum a few levels, and see which
            way the geometric series goes.
          </p>
        </Callout>

        <h3>The cheat sheet — the recurrences you&apos;ll see again and again</h3>

        <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr>
              <th className="text-left">Recurrence</th>
              <th className="text-left">Big-O</th>
              <th className="text-left">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>T(n) = T(n/2) + O(1)</code></td>
              <td><strong>O(log n)</strong></td>
              <td>Binary search; pow(x, n) (one recursive call, halving)</td>
            </tr>
            <tr>
              <td><code>T(n) = 2T(n/2) + O(1)</code></td>
              <td><strong>O(n)</strong></td>
              <td>Tree traversal (visit each node once via two-child recursion)</td>
            </tr>
            <tr>
              <td><code>T(n) = 2T(n/2) + O(n)</code></td>
              <td><strong>O(n log n)</strong></td>
              <td>Merge sort; quicksort (average); merge K sorted lists by pairing</td>
            </tr>
            <tr>
              <td><code>T(n) = T(n-1) + O(1)</code></td>
              <td><strong>O(n)</strong></td>
              <td>Linear recursion (sum, factorial, list traversal)</td>
            </tr>
            <tr>
              <td><code>T(n) = T(n-1) + O(n)</code></td>
              <td><strong>O(n²)</strong></td>
              <td>Sum of 1..n via naive recursion that re-walks; selection sort</td>
            </tr>
            <tr>
              <td><code>T(n) = 2T(n-1) + O(1)</code></td>
              <td><strong>O(2ⁿ)</strong></td>
              <td>Naive Fibonacci; subsets / power-set generation</td>
            </tr>
          </tbody>
        </table>
        </div>

        <p>
          Two patterns dominate practice: <em>halving plus linear merge</em>{" "}gives O(n log n), and <em>halving plus
          constant work</em>{" "}gives O(log n). If you see either shape in a recurrence, you can stop solving and write
          the answer down.
        </p>

        <h3>Worked example: where does merge sort&apos;s O(n log n) come from?</h3>

        <p>
          T(n) = 2T(n/2) + O(n). At the top level we do n work. The next level has two subproblems of size n/2; each
          does n/2 work, total n. The level after has four of size n/4, each doing n/4, total n. <strong>Every level
          does n work, and there are log n levels.</strong>{" "}Total: n · log n.
        </p>

        <CodeBlock lang="plain">{`Level 0  · 1 problem of size n     · n work        = n
Level 1  · 2 problems of size n/2  · n/2 each     = n
Level 2  · 4 problems of size n/4  · n/4 each     = n
...
Level log n · n problems of size 1 · O(1) each    = n
                                                  ─────
                                                  n · log n`}</CodeBlock>

        <p>
          That&apos;s the master theorem in action — case 2, balanced. The same analysis explains why quicksort is
          O(n log n) on average and why a divide-and-conquer merge K sorted lists implementation runs in O(N log K).
        </p>

        <h3>Heads-up: when the master theorem doesn&apos;t apply</h3>

        <p>
          The master theorem requires the subproblems to be the same size (<code>n/b</code> for some <code>b</code>).
          Recurrences like <code>T(n) = T(n-1) + T(n-2) + O(1)</code> (Fibonacci) or <code>T(n) = T(n/3) + T(2n/3)
          + O(n)</code> (median-of-medians) need different tools — the <strong>recursion tree method</strong>{" "}
          (sketch the tree, sum directly) or the <strong>Akra-Bazzi theorem</strong> (master&apos;s sophisticated
          cousin). For interviews, the cheat sheet above covers the vast majority of what you&apos;ll see.
        </p>

        <Quiz
          kind="Master theorem check"
          question="An algorithm has the recurrence T(n) = 4T(n/2) + O(n). What's its Big-O?"
          options={[
            { label: "O(n log n).", explanation: "That's the merge-sort recurrence (a=2, b=2). Here a=4, b=2 — leaves grow as n^log_2 4 = n², which beats the O(n) combine. Leaves dominate." },
            { label: "O(n²).", correct: true, explanation: "Right. n^(log_b a) = n^(log_2 4) = n². The combine work is O(n), which is smaller than n². Case 1 — leaves dominate. Total: O(n²). (This shape shows up in algorithms whose leaf cost is the bottleneck — e.g. counting all pairs in a divide-and-conquer over n/2-sized halves.)" },
            { label: "O(n).", explanation: "O(n) is the combine cost per level, but there are 4 subproblems halving — the leaf count grows as n², which drowns out the combine." },
            { label: "O(2ⁿ).", explanation: "Exponential would require either (a) decrementing recursion with branching, like 2T(n-1), or (b) explosive growth in the combine. 4T(n/2) shrinks fast enough to keep things polynomial." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Project ───────────────── */}
      <Checkpoint moduleSlug="recursion" id="project" title="I built Pow(x,n), Merge K Sorted Lists, and classified recurrences" xp={40} manual manualLabel="I solved both LeetCode problems">
      <section>
        <h2 id="project">Project: Pow(x,n) + Merge K Sorted Lists</h2>

        <p>
          Two LeetCode problems that exercise everything in this module. Pow(x, n) is divide-and-conquer with halving;
          Merge K Sorted Lists has a beautiful pairing-based D&amp;C solution that gets O(N log K) without a heap.
        </p>

        <h3>LC 50 · Pow(x, n) · halving recursion (with one nasty edge case)</h3>

        <p>
          The textbook solution computes <code>x^(n/2)</code> once and squares it. The trap: <code>n</code> can be
          negative, and you&apos;d like to handle that by computing <code>1 / pow(x, -n)</code>. <strong>Don&apos;t
          do that naively</strong> — when <code>n == Integer.MIN_VALUE</code>, <code>-n</code> overflows back to
          itself (because <code>-Integer.MIN_VALUE</code> doesn&apos;t fit in an int), and you get infinite recursion
          or wrong answers.
        </p>

        <Callout variant="warn" title="The Integer.MIN_VALUE overflow trap">
          <p>
            <code>Integer.MIN_VALUE</code> is <code>-2,147,483,648</code>. Its negation would be{" "}
            <code>+2,147,483,648</code> — but that doesn&apos;t fit in a 32-bit signed int, so Java silently wraps
            it back to <code>-2,147,483,648</code>. Any code that does <code>-n</code> on a possibly-MIN_VALUE int
            is buggy in this exact way.
          </p>
          <p>
            Fix: convert to <code>long</code> before negating, or peel off one factor of <code>x</code> by hand to
            shift to <code>n + 1</code> first. The first option is cleaner.
          </p>
        </Callout>

        <CodeBlock lang="java">{`public double myPow(double x, int n) {
    long N = n;                    // promote so we can safely negate MIN_VALUE
    if (N < 0) {
        x = 1 / x;
        N = -N;
    }
    return powLong(x, N);
}

private double powLong(double x, long n) {
    if (n == 0) return 1.0;
    double half = powLong(x, n / 2);
    if ((n & 1) == 0) return half * half;
    else              return half * half * x;
}`}</CodeBlock>

        <p>
          Recurrence: T(n) = T(n/2) + O(1) → O(log n) time, O(log n) stack space. The halving is what saves us — for{" "}
          <code>n = 2³¹ - 1</code>, we do about 31 multiplications.
        </p>

        <Mermaid chart={powTree} />

        <h3>LC 23 · Merge K Sorted Lists · pairing D&amp;C</h3>

        <p>
          Given <code>k</code> sorted linked lists with a total of <code>N</code> nodes, merge them into one sorted
          list. The most-known solution is &quot;use a min-heap of <code>k</code> heads.&quot; That&apos;s great, and
          we&apos;ll cover it in the recap. But the <em>pure recursion</em>{" "}solution is even more elegant: pair up
          the lists, merge pairs, repeat until one list remains.
        </p>

        <Mermaid chart={mergeKTree} />

        <p>
          Each round halves the number of lists. After <code>log₂ k</code> rounds we&apos;re done. Each round merges
          a total of N nodes (every node is touched once per round). Total: <code>O(N log k)</code> — same as the
          heap solution, no heap required.
        </p>

        <CodeBlock lang="java">{`public ListNode mergeKLists(ListNode[] lists) {
    if (lists == null || lists.length == 0) return null;
    return mergeRange(lists, 0, lists.length - 1);
}

// merge lists[lo..hi] inclusive
private ListNode mergeRange(ListNode[] lists, int lo, int hi) {
    if (lo == hi) return lists[lo];
    int mid = (lo + hi) >>> 1;
    ListNode left  = mergeRange(lists, lo, mid);
    ListNode right = mergeRange(lists, mid + 1, hi);
    return mergeTwo(left, right);
}

// classic merge-two from merge sort
private ListNode mergeTwo(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0);
    ListNode tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else                 { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}`}</CodeBlock>

        <Callout variant="insight" title="Why pair-merge beats sequential-merge">
          <p>
            The naive approach is &quot;merge list 1 with list 2, then merge that with list 3, then with list 4, ...&quot;
            That sounds reasonable but is O(Nk). The first merge touches 2N/k nodes, the second touches 3N/k, the
            third 4N/k, ..., summing to roughly Nk/2.
          </p>
          <p>
            With pairing, each node is touched exactly <code>log₂ k</code> times — once per round, across
            <code>log₂ k</code> rounds. That&apos;s O(N log k). For k = 1024, log k = 10, and we go from k = 1024
            cost-units-per-node to 10. Hundredfold speedup, no fancy data structure.
          </p>
        </Callout>

        <h3>Why this is the same algorithm as merge sort</h3>

        <p>
          Look at <code>mergeRange</code> again. Split, recurse on halves, merge. That&apos;s merge sort, with the
          base case being &quot;an already-sorted list&quot; instead of &quot;a single element.&quot; Once you see
          this, the third LeetCode problem in the original spec — <strong>LC 912 · Sort an Array</strong> — is just
          merge sort applied to an int array, with <code>mergeRange</code> swapped for the array-based version we
          wrote in Part 4. It&apos;s the same template.
        </p>

        <h3>Classify these recurrences</h3>

        <ClassifyChallenge
          title="Recurrence → Big-O"
          prompt="Match each recurrence to its asymptotic class. The cheat sheet from Part 5 covers all of these."
          buckets={[
            { id: "log", label: "O(log n)", color: "emerald" },
            { id: "lin", label: "O(n)", color: "sky" },
            { id: "nlogn", label: "O(n log n)", color: "indigo" },
            { id: "exp", label: "O(2^n)", color: "rose" },
          ]}
          items={[
            { id: "1", label: "T(n) = T(n/2) + O(1) — binary search; pow(x, n).", answer: "log", explanation: "One recursive call, halving. log n levels, O(1) per level. Total O(log n)." },
            { id: "2", label: "T(n) = 2T(n/2) + O(n) — merge sort; merge K sorted lists by pairing.", answer: "nlogn", explanation: "Master theorem case 2. Every level does Θ(n) total work; log n levels. Total O(n log n)." },
            { id: "3", label: "T(n) = T(n-1) + O(1) — sum(n), factorial(n), linked-list length.", answer: "lin", explanation: "Linear recursion. n calls, each O(1). Total O(n) — same as the iterative loop, just with O(n) stack." },
            { id: "4", label: "T(n) = 2T(n-1) + O(1) — naive Fibonacci; subsets generation.", answer: "exp", explanation: "Two branches per level, depth n. The tree has roughly 2ⁿ nodes. Memoization collapses this to O(n) — that's the bridge to dynamic programming." },
            { id: "5", label: "T(n) = 2T(n/2) + O(1) — touch every node in a balanced binary tree once.", answer: "lin", explanation: "Master theorem case 1: leaves dominate. n^(log_2 2) = n leaves, O(1) each. Total O(n)." },
            { id: "6", label: "T(n) = T(n/2) + O(n) — quickselect average case, find-K-th.", answer: "lin", explanation: "Master theorem case 3: the root's work dominates because f(n) = n grows faster than n^(log_2 1) = O(1). The geometric series n + n/2 + n/4 + ... sums to 2n = O(n)." },
            { id: "7", label: "T(n) = 2T(n/2) + O(log n) — divide-and-conquer with a sub-linear merge.", answer: "lin", explanation: "n^(log_2 2) = n leaves dominate the O(log n) combine. Master theorem case 1 — total O(n)." },
            { id: "8", label: "T(n) = T(n-1) + T(n-2) + O(1) — the literal recurrence Fibonacci satisfies.", answer: "exp", explanation: "Two branches per level (sizes n-1 and n-2), depth n. The node count grows as Θ(φⁿ) ≈ 1.618ⁿ, which is O(2ⁿ) for our purposes. Master theorem doesn't apply here because the subproblems are different sizes — the recursion-tree method gives the answer." },
          ]}
        />

        <h3>One last quiz</h3>

        <Quiz
          kind="Final check"
          question="A junior engineer&apos;s recursive function compiles fine, takes a positive integer, and reliably crashes with StackOverflowError on every input. What's almost always the cause?"
          options={[
            { label: "Java's stack is too small for any real recursion.", explanation: "Java's stack is fine for ~10,000+ levels of straightforward recursion. A function that crashes on every input has a logical bug, not a stack-size problem." },
            { label: "The base case is missing, or the recursive call doesn't move toward it.", correct: true, explanation: "Right. Infinite recursion is ALWAYS one of two bugs: either there's no base case (or the base check is wrong), or every recursive call is the same size (or larger) as the parent. Both bugs surface as immediate StackOverflowError, regardless of input. The fix is to trace one step of the input transformation and verify it shrinks toward the base check." },
            { label: "Java's recursion is fundamentally broken.", explanation: "JVM recursion works exactly as specified. The bug is in the function." },
            { label: "Heap overflow.", explanation: "Heap exhaustion throws OutOfMemoryError, not StackOverflowError. The two are different errors with different causes." },
          ]}
        />

        <PartRecap
          title="Recursion in your bones"
          gist="Trust the recursive call. Pin a base case. Sketch the tree. Read the recurrence. That's the whole module — three minutes of mental ritual that turns 'I can't think recursively' into a one-time trick you'll never have to relearn."
          points={[
            { takeaway: "The leap of faith: assume the recursive call works on smaller input, then build the answer for the current input from that.", detail: "You write one layer; the runtime executes all of them. Stop simulating the call stack — start contracting." },
            { takeaway: "Every infinite recursion is a base-case bug.", detail: "Either the base case is missing or the recursive call doesn't move strictly closer to it. Both surface as StackOverflowError; both are fixed by checking the input transformation against the base condition." },
            { takeaway: "JVM stack is bounded — ~10K-20K depth on default settings.", detail: "Plenty for balanced trees and most LeetCode. Watch out for: skewed trees, deep linked lists, recursive walks of user-supplied data structures of unknown depth. For those, prefer iterative + explicit stack." },
            { takeaway: "Divide-and-conquer = recursion with halves instead of decrements.", detail: "T(n) = T(n/2) + O(1) → O(log n). T(n) = 2T(n/2) + O(n) → O(n log n). Two patterns power binary search, merge sort, quicksort, pow(x, n), and merge-K-lists." },
            { takeaway: "Master theorem = three patterns of where work lives in the tree.", detail: "Leaves dominate, balanced, root dominates. Sketch the tree, sum a few levels, see which way the geometric series goes. Memorize the cheat-sheet recurrences and you'll cover most of what you ever see." },
            { takeaway: "Naive recursion + overlapping subproblems = exponential blowup.", detail: "fib(n) is the canonical case. The fix isn't 'don't use recursion' — it's memoization, the bridge from recursion to dynamic programming. That's the next module." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Forward link ───────────────── */}
      <div className="not-prose mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
        <p className="text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">Up next · Module 28</p>
        <Link
          href="/courses/dsa/modules/backtracking"
          className="mt-2 block text-2xl font-bold text-slate-900 no-underline transition hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"
        >
          Backtracking →
        </Link>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Recursion with state you mutate, then unmutate. The pattern behind subsets, permutations, and N-Queens.
        </p>
      </div>
        <ModuleNav courseId="dsa" currentSlug="recursion" />
    </article>
  );
}
