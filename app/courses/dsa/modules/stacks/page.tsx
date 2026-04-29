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

const CHECKPOINTS = [
  { id: "setup", title: "What a stack actually is" },
  { id: "implementations", title: "Two implementations, same contract" },
  { id: "patterns", title: "Three patterns: matching, evaluation, monotonic" },
  { id: "callstack", title: "The call stack is just a stack" },
  { id: "project", title: "Project: bracket matcher + RPN" },
  { id: "final", title: "Final quiz" },
];

export default function StacksModule() {
  const mod = getModuleBySlug("stacks")!;

  // The mental model: a vertical pile. push and pop only happen at the top.
  const stackModel = `
flowchart TB
    PUSH["push(x)"] --> TOP
    POP["pop()"] --> TOP
    subgraph S["Stack"]
        direction TB
        TOP["TOP → 7"]
        E2["3"]
        E3["8"]
        E4["1"]
        BOT["BOTTOM"]
        TOP --> E2
        E2 --> E3
        E3 --> E4
        E4 --> BOT
    end
    style TOP fill:#f59e0b,color:#fff,stroke:#b45309
    style E2 fill:#fbbf24,color:#000,stroke:#d97706
    style E3 fill:#fbbf24,color:#000,stroke:#d97706
    style E4 fill:#fbbf24,color:#000,stroke:#d97706
    style BOT fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style PUSH fill:#10b981,color:#fff,stroke:#047857
    style POP fill:#ef4444,color:#fff,stroke:#b91c1c
  `.trim();

  // The call stack analogy: each function call is a stack frame.
  const callStack = `
flowchart TB
    subgraph CS["Call stack (top is current)"]
        direction TB
        F1["bake() &nbsp; ← currently running"]
        F2["mix()"]
        F3["measure()"]
        F4["main()"]
        F1 --> F2 --> F3 --> F4
    end
    style F1 fill:#f59e0b,color:#fff,stroke:#b45309
    style F2 fill:#fbbf24,color:#000,stroke:#d97706
    style F3 fill:#fbbf24,color:#000,stroke:#d97706
    style F4 fill:#fbbf24,color:#000,stroke:#d97706
  `.trim();

  // Monotonic stack: only stays sorted in one direction. Used for next-greater-element.
  const monotonicStack = `
flowchart TB
    subgraph DT["Daily Temperatures: [73, 74, 75, 71, 69, 72, 76, 73]"]
        direction TB
        T1["i = 5, temp = 72"]
        T2["Stack indices (bottom → top): [2 (75)]"]
        T3["72 > 71? yes — pop 4 (69), answer[4] = 5 - 4 = 1"]
        T4["72 > 75? no — stop popping"]
        T5["push 5 → stack = [2, 5]"]
        T1 --> T2 --> T3 --> T4 --> T5
    end
    style T1 fill:#1e293b,color:#fff,stroke:#475569
    style T2 fill:#fbbf24,color:#000,stroke:#d97706
    style T3 fill:#10b981,color:#fff,stroke:#047857
    style T4 fill:#ef4444,color:#fff,stroke:#b91c1c
    style T5 fill:#fbbf24,color:#000,stroke:#d97706
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="stacks" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-3 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold tracking-wide uppercase">
          Module {mod.number} · {mod.phase}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="setup" title="I understand the stack contract" xp={10} celebration="LIFO. Push at the top, pop from the top, peek at the top. Three operations.">
      <section>
        <h2 id="setup">What a stack actually is</h2>

        <p>
          A <strong>stack</strong> is the simplest non-trivial data structure: a pile where you can only ever touch the
          top. You push something on top. You pop the top off. You peek at what's on top. That's it. It's so restricted
          it sounds useless — and yet entire categories of problems collapse to a stack the moment you see the trick.
        </p>

        <Mermaid chart={stackModel} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          The contract is intentionally narrow: only the top is reachable. <code>push</code>, <code>pop</code>, <code>peek</code>, <code>isEmpty</code>. All O(1).
        </p>

        <h3>The analogy: a stack of plates</h3>
        <p>
          A stack of plates in a cafeteria. You add a clean plate to the top. The next person grabs from the top. The
          plate you washed first is the one taken last — that's the defining property. Computer scientists call this
          <strong> LIFO</strong> (last in, first out), to contrast with <strong>FIFO</strong> queues (next module).
        </p>

        <Callout variant="spring" title="The whole API in five rows">
          <table className="m-0">
            <thead><tr><th>Op</th><th>Meaning</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td><code>push(x)</code></td><td>place x on top</td><td>O(1) amortized</td></tr>
              <tr><td><code>pop()</code></td><td>remove and return the top element</td><td>O(1)</td></tr>
              <tr><td><code>peek()</code></td><td>look at the top without removing</td><td>O(1)</td></tr>
              <tr><td><code>isEmpty()</code></td><td>true if there's nothing on top</td><td>O(1)</td></tr>
              <tr><td><code>size()</code></td><td>how many things are stacked</td><td>O(1)</td></tr>
            </tbody>
          </table>
        </Callout>

        <Quiz
          kind="Gut check"
          question="You push 1, 2, 3, 4 in that order, then pop twice and peek once. What does peek return?"
          options={[
            { label: "1", explanation: "1 is at the bottom and stays there until everything above it is popped." },
            { label: "2", correct: true, explanation: "Right. Stack after pushes: [1, 2, 3, 4] (4 on top). Pop → 4 gone, top is 3. Pop → 3 gone, top is 2. Peek returns 2 without removing it." },
            { label: "3", explanation: "Off by one — you popped twice (4 then 3), so peek shows what's now on top: 2." },
            { label: "4", explanation: "4 was the first thing popped." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Implementations ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="implementations" title="I can implement a stack two ways" xp={15} celebration="Same contract, two backings. The ArrayList one is what you'll actually use.">
      <section>
        <h2 id="implementations">Two implementations, same contract</h2>

        <p>
          The stack contract is so narrow that it sits comfortably on top of either an <strong>array (dynamic
          array)</strong> or a <strong>singly-linked list</strong>. Both are O(1) for push, pop, peek. They feel
          identical from the outside; their cache behaviour and memory overhead differ.
        </p>

        <h3>Implementation 1: dynamic-array-backed</h3>

        <CodeBlock lang="java">{`public class ArrayStack<E> {
    private Object[] data = new Object[16];
    private int size = 0;

    public void push(E v) {
        if (size == data.length) {
            data = java.util.Arrays.copyOf(data, data.length * 2);   // amortized O(1)
        }
        data[size++] = v;
    }

    @SuppressWarnings("unchecked")
    public E pop() {
        if (size == 0) throw new java.util.NoSuchElementException();
        E v = (E) data[--size];
        data[size] = null;       // help GC
        return v;
    }

    @SuppressWarnings("unchecked")
    public E peek() {
        if (size == 0) throw new java.util.NoSuchElementException();
        return (E) data[size - 1];
    }

    public boolean isEmpty() { return size == 0; }
    public int size() { return size; }
}`}</CodeBlock>

        <h3>Implementation 2: linked-list-backed (push/pop at head)</h3>

        <CodeBlock lang="java">{`public class LinkedStack<E> {
    private static class Node<E> { E v; Node<E> next; Node(E v) { this.v = v; } }
    private Node<E> top;
    private int size;

    public void push(E v) {
        Node<E> n = new Node<>(v);
        n.next = top;
        top = n;
        size++;
    }

    public E pop() {
        if (top == null) throw new java.util.NoSuchElementException();
        E v = top.v;
        top = top.next;
        size--;
        return v;
    }

    public E peek() {
        if (top == null) throw new java.util.NoSuchElementException();
        return top.v;
    }

    public boolean isEmpty() { return top == null; }
    public int size() { return size; }
}`}</CodeBlock>

        <Callout variant="info" title="Use ArrayDeque, not Stack">
          Java has a <code>java.util.Stack</code> class. <strong>Don't use it.</strong> It's a legacy JDK 1.0 class
          that extends Vector (synchronized, slow). Use <code>ArrayDeque&lt;E&gt;</code> as a stack — call
          <code>push</code>, <code>pop</code>, and <code>peek</code> on it. It's an array-backed deque, faster, and
          correct. Module 8 explains why.
        </Callout>

        <h3>Same operations, different costs?</h3>

        <ClassifyChallenge
          title="Classify each operation by its cost on each backing"
          prompt="Drag each operation into the right bucket — costs are the same, the differences are subtler."
          buckets={[
            { id: "constant", label: "O(1) on both", color: "emerald" },
            { id: "memory", label: "Differs in memory overhead", color: "amber" },
          ]}
          items={[
            { id: "push", label: "push(x)", answer: "constant", explanation: "Both are O(1) (amortized for the array, exact for the list). Per-call cost is the same." },
            { id: "pop", label: "pop()", answer: "constant", explanation: "Both are O(1). The array decrements size and nulls the slot; the list moves the head." },
            { id: "peek", label: "peek()", answer: "constant", explanation: "Both are O(1). One read." },
            { id: "memOverhead", label: "Bytes per element stored", answer: "memory", explanation: "Array stack: ~one reference per slot, with up to 50% empty capacity. Linked stack: every element costs an extra Node allocation (~16 bytes overhead each). Arrays usually win on memory and cache locality." },
            { id: "growth", label: "Cost spike behaviour", answer: "memory", explanation: "Array stack has occasional doubling resize spikes (amortized O(1)). Linked stack has uniform per-push cost but each push does a heap allocation. Arrays win for throughput; lists win for predictable latency." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Patterns ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="patterns" title="I recognise the three classic stack patterns" xp={25} celebration="Bracket matching, postfix evaluation, monotonic stacks. The recognition cues are now built in.">
      <section>
        <h2 id="patterns">Three patterns that cover most stack problems</h2>

        <h3>Pattern 1 · Bracket / nesting matching</h3>

        <p>
          Whenever you have <em>open-something then close-something</em> rules — parens, HTML tags, function calls,
          XML — you almost certainly want a stack. The rule is mechanical:
        </p>
        <ol>
          <li>On an opener: <code>push</code> it.</li>
          <li>On a closer: <code>pop</code> the top and check it matches the closer.</li>
          <li>At the end: the stack must be empty.</li>
        </ol>

        <CodeBlock lang="java">{`// LeetCode 20 — Valid Parentheses.
public boolean isValid(String s) {
    java.util.Deque<Character> st = new java.util.ArrayDeque<>();
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.isEmpty()) return false;          // closer with no opener
            char open = st.pop();
            if ((c == ')' && open != '(') ||
                (c == ']' && open != '[') ||
                (c == '}' && open != '{')) return false;
        }
    }
    return st.isEmpty();                              // leftover openers = invalid
}`}</CodeBlock>

        <Callout variant="insight" title="The recognition cue">
          If the problem mentions matching, balancing, or nesting — and especially if it gives you a string with
          symbols that pair up — reach for a stack before you reach for anything else. You will almost never regret it.
        </Callout>

        <h3>Pattern 2 · Postfix / RPN evaluation</h3>

        <p>
          Reverse Polish Notation writes <code>3 4 +</code> instead of <code>3 + 4</code>. RPN evaluators are stack
          machines: numbers push, operators pop two operands and push the result. No precedence, no parentheses, no
          ambiguity — that's the appeal.
        </p>

        <CodeBlock lang="java">{`// LeetCode 150 — Evaluate Reverse Polish Notation.
public int evalRPN(String[] tokens) {
    java.util.Deque<Integer> st = new java.util.ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+": { int b = st.pop(), a = st.pop(); st.push(a + b); break; }
            case "-": { int b = st.pop(), a = st.pop(); st.push(a - b); break; }
            case "*": { int b = st.pop(), a = st.pop(); st.push(a * b); break; }
            case "/": { int b = st.pop(), a = st.pop(); st.push(a / b); break; }
            default:  { st.push(Integer.parseInt(t)); }
        }
    }
    return st.pop();
}`}</CodeBlock>

        <Callout variant="warn" title="Operand order matters">
          When you pop two operands, the <em>second</em> pop is the left operand. Hence <code>a - b</code>, not
          <code>b - a</code>. Get this backwards once, suffer for an afternoon.
        </Callout>

        <h3>Pattern 3 · Monotonic stack (the unlock pattern)</h3>

        <p>
          A <strong>monotonic stack</strong> is just a stack that you maintain in sorted order — when something
          arrives that would break the order, you pop until it fits. It sounds too simple to matter, but it solves a
          surprisingly large class of problems in O(n) total: <em>next greater element</em>, <em>daily temperatures</em>,
          <em>largest rectangle in histogram</em>, <em>trapping rain water</em>.
        </p>

        <Mermaid chart={monotonicStack} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Monotonic-decreasing stack of indices. When a hotter day arrives, every cooler index gets resolved (it just found its first warmer day).
        </p>

        <CodeBlock lang="java">{`// LeetCode 739 — Daily Temperatures.
// answer[i] = how many days until a warmer temperature; 0 if none.
public int[] dailyTemperatures(int[] T) {
    int n = T.length;
    int[] answer = new int[n];
    java.util.Deque<Integer> st = new java.util.ArrayDeque<>();   // indices, decreasing temperature
    for (int i = 0; i < n; i++) {
        // Today (T[i]) breaks the decreasing order? Resolve every cooler index on the stack.
        while (!st.isEmpty() && T[st.peek()] < T[i]) {
            int j = st.pop();
            answer[j] = i - j;     // i is the first warmer day after j
        }
        st.push(i);
    }
    // Anything still on the stack never found a warmer day; answer[*] is already 0.
    return answer;
}`}</CodeBlock>

        <Callout variant="insight" title="Why monotonic stacks are O(n)">
          Each index is pushed exactly once and popped at most once. So the total work across the whole loop is O(n),
          even though the inner <code>while</code> can pop many indices in a single iteration. This amortized argument is
          the same shape as ArrayList's doubling — different mechanism, same idea.
        </Callout>

        <Quiz
          kind="Pattern recognition"
          question="You're asked to compute, for each element, the index of the next element strictly greater than it. What's your reflex?"
          options={[
            { label: "Nested loop — O(n²) is fine for now.", explanation: "It works but it's the brute-force baseline. The interviewer is asking exactly because they want better." },
            { label: "Monotonic decreasing stack of indices.", correct: true, explanation: "Right. Walk left-to-right, push indices, and whenever the new element is greater than the top of the stack, pop and record. Each index is pushed and popped at most once → O(n)." },
            { label: "Sort the array.", explanation: "Sorting destroys the original positions, which is exactly what the question asks about. No good." },
            { label: "Hash map of value → index.", explanation: "There can be duplicates and you care about positional 'next greater', not 'this exact value'. Hash map doesn't capture position." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · The call stack ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="callstack" title="I see why every function call uses a stack" xp={15} celebration="Recursion and stack structures aren't separate ideas — they're the same machine seen from two angles.">
      <section>
        <h2 id="callstack">The call stack: every program is already using one</h2>

        <p>
          Every time you call a function, the runtime pushes a <strong>stack frame</strong> onto a stack — that's the
          one named <em>call stack</em>. The frame holds local variables, the arguments, and the return address. When
          the function returns, its frame is popped. The current function is always whatever's on top.
        </p>

        <Mermaid chart={callStack} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          The call stack at the moment <code>bake()</code> is running. Each frame remembers where to return to and what its local variables were. Pop a frame → control returns to the frame below.
        </p>

        <h3>Why this matters</h3>
        <ul>
          <li>
            <strong>Recursion = a stack you didn't write.</strong> Any algorithm you wrote recursively can be rewritten
            iteratively using an explicit stack, and vice versa. They are the same machine.
          </li>
          <li>
            <strong>Stack overflow is real.</strong> Go too deep (~5 000 to 20 000 frames in Java, depending on heap and
            frame size) and the JVM throws <code>StackOverflowError</code>. Any time you write recursion on user input,
            ask: could this overflow?
          </li>
          <li>
            <strong>The infamous interview pivot:</strong> "OK, now write it iteratively." That's almost always asking
            you to replace the call stack with an explicit <code>ArrayDeque</code>.
          </li>
        </ul>

        <WorkedExample
          title="Convert a recursive DFS to an iterative one with an explicit stack"
          steps={[
            { title: "The recursive version", body: "void dfs(Node n) { if (n == null) return; visit(n); dfs(n.left); dfs(n.right); }" },
            { title: "Spot the stack: it's the call stack", body: "Each recursive call pushes a frame holding 'n'. The function body is just 'visit n, descend left, descend right'. Replicate that with a Deque<Node>." },
            { title: "The iterative rewrite", body: "Deque<Node> st = new ArrayDeque<>(); st.push(root); while (!st.isEmpty()) { Node n = st.pop(); if (n == null) continue; visit(n); st.push(n.right); st.push(n.left); }" },
            { title: "Order subtle: push right first", body: "We pushed right before left so that left pops first — preserving the left-then-right pre-order traversal of the recursive version." },
            { title: "The win", body: "No StackOverflowError on deep trees. You control the stack size, you can pause and resume, and you can pickle state. This is the same trick used to make recursion safe on user-supplied data." },
          ]}
        />

        <Callout variant="warn" title="Recursion vs explicit stack — pick consciously">
          For small, balanced inputs: recursion reads more clearly. For deep inputs you don't trust (parser on user
          input, tree from the network, graph with adversarial depth): use an explicit <code>ArrayDeque</code>. The
          rewrite is mechanical.
        </Callout>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="project" title="I built the bracket matcher, RPN evaluator, and solved three LeetCode stack problems" xp={40} celebration="You've internalised the three patterns by writing them yourself." manual manualLabel="I shipped it">
      <section>
        <h2 id="project">Project: bracket matcher + RPN calculator + three LeetCode warm-ups</h2>

        <p>
          You'll build two complete programs and solve three classic LeetCode problems. The point isn't the lines of
          code — it's that by the end, the three patterns are reflexive.
        </p>

        <h3>Step 1 · A real bracket matcher</h3>

        <CodeBlock lang="java">{`import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

public class BracketMatcher {
    private static final Map<Character, Character> PAIRS = Map.of(
        ')', '(', ']', '[', '}', '{'
    );

    /** Returns the 0-based index of the first unbalanced bracket, or -1 if balanced. */
    public static int firstUnbalanced(String s) {
        Deque<int[]> st = new ArrayDeque<>();   // [char, indexWhereOpened]
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                st.push(new int[]{c, i});
            } else if (PAIRS.containsKey(c)) {
                if (st.isEmpty()) return i;                    // closer with no opener
                int[] top = st.pop();
                if (top[0] != PAIRS.get(c)) return i;          // wrong closer for this opener
            }
            // ignore non-bracket characters
        }
        return st.isEmpty() ? -1 : st.peek()[1];               // leftover opener position
    }

    public static void main(String[] args) {
        System.out.println(firstUnbalanced("()[]{}"));         // -1 (balanced)
        System.out.println(firstUnbalanced("([)]"));           // 2 (')' closes a '['—mismatch at 2)
        System.out.println(firstUnbalanced("(("));             // 1 (the second '(' is left dangling)
        System.out.println(firstUnbalanced("a + (b * [c - d]"));// 4 (the unmatched '(' at index 4)
    }
}`}</CodeBlock>

        <h3>Step 2 · RPN calculator with negative numbers</h3>

        <CodeBlock lang="java">{`import java.util.ArrayDeque;
import java.util.Deque;

public class Rpn {
    public static long eval(String expr) {
        Deque<Long> st = new ArrayDeque<>();
        for (String tok : expr.trim().split("\\\\s+")) {
            switch (tok) {
                case "+": { long b = st.pop(), a = st.pop(); st.push(a + b); break; }
                case "-": { long b = st.pop(), a = st.pop(); st.push(a - b); break; }
                case "*": { long b = st.pop(), a = st.pop(); st.push(a * b); break; }
                case "/": { long b = st.pop(), a = st.pop(); st.push(a / b); break; }
                default:  { st.push(Long.parseLong(tok)); }
            }
        }
        if (st.size() != 1) throw new IllegalArgumentException("malformed RPN");
        return st.pop();
    }

    public static void main(String[] args) {
        System.out.println(eval("3 4 +"));               // 7
        System.out.println(eval("5 1 2 + 4 * + 3 -"));   // 14
        System.out.println(eval("-5 2 *"));              // -10
    }
}`}</CodeBlock>

        <h3>Step 3 · LeetCode 20 — Valid Parentheses</h3>
        <p>Already shown above. Submit it; verify all three test categories pass (matched, mismatched, leftover openers, lone closers).</p>

        <h3>Step 4 · LeetCode 155 — Min Stack</h3>

        <CodeBlock lang="java">{`// Trick: keep a parallel "min so far" stack so getMin() is O(1).
public class MinStack {
    private final java.util.Deque<Integer> data = new java.util.ArrayDeque<>();
    private final java.util.Deque<Integer> mins = new java.util.ArrayDeque<>();

    public void push(int x) {
        data.push(x);
        mins.push(mins.isEmpty() ? x : Math.min(mins.peek(), x));
    }
    public void pop()         { data.pop(); mins.pop(); }
    public int top()          { return data.peek(); }
    public int getMin()       { return mins.peek(); }
}`}</CodeBlock>

        <Callout variant="insight" title="Why the parallel min stack works">
          Whatever was the min when you pushed x is still the min after you pop x — because you popped the same epoch
          of the stack on both. So the two stacks march in lockstep, and getMin is just a peek.
        </Callout>

        <h3>Step 5 · LeetCode 739 — Daily Temperatures</h3>
        <p>The monotonic stack solution above. Trace it on <code>[73, 74, 75, 71, 69, 72, 76, 73]</code> by hand once before you submit — you will catch the off-by-one in the answer-index calculation.</p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="stacks" id="final" title="I've completed Module 7" xp={25} celebration="Stacks are now reflex. Queues — the FIFO mirror image — are next.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="Why should you use ArrayDeque instead of java.util.Stack as a stack?"
          options={[
            { label: "Stack is broken; ArrayDeque has different semantics.", explanation: "Both implement the LIFO contract correctly. The reason isn't correctness." },
            { label: "Stack extends Vector, which is synchronized — every operation pays for thread-safety you almost never need; ArrayDeque is a faster, modern, unsynchronized array-backed deque.", correct: true, explanation: "Right. Stack is a legacy JDK 1.0 class that bolted itself onto the synchronized Vector. ArrayDeque is the modern replacement: array-backed, unsynchronized, faster in single-threaded code, and recommended in the JDK docs." },
            { label: "ArrayDeque has more features.", explanation: "True but not the main reason. Even for plain stack use, ArrayDeque is preferable for performance." },
            { label: "Stack only stores integers.", explanation: "Both are generic. That's not the issue." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="What's the time complexity of computing 'next greater element' for every position in an array of length n using a monotonic stack?"
          options={[
            { label: "O(n²)", explanation: "That's the brute-force nested-loop baseline. The monotonic-stack approach is strictly better." },
            { label: "O(n log n)", explanation: "There's no sorting or balanced-tree structure here. The bound is tighter." },
            { label: "O(n)", correct: true, explanation: "Right. Each index is pushed exactly once and popped at most once across the entire scan, so total work is linear — even though any single iteration can pop many indices." },
            { label: "O(n × max_value)", explanation: "Total work is independent of the values, only the count of indices." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You're parsing a deeply-nested user-supplied JSON document recursively and getting StackOverflowError on adversarial input. What's the standard fix?"
          options={[
            { label: "Increase the JVM thread stack size with -Xss.", explanation: "It buys you a constant factor but doesn't fix the underlying issue — adversarial input can always exceed any fixed depth. Don't ship that defence to users." },
            { label: "Convert the recursive parser to an iterative one with an explicit ArrayDeque.", correct: true, explanation: "Right. The call stack is finite; the heap (where ArrayDeque lives) is much larger. Same algorithm, different storage. This is the production fix for any user-input-driven recursion." },
            { label: "Catch StackOverflowError and retry.", explanation: "You can't reliably recover from StackOverflowError; the JVM's invariants around it are weak. Don't build on this." },
            { label: "Sort the input first.", explanation: "Sorting doesn't change the depth of the structure. Irrelevant." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="A stack is the most restricted useful data structure ever, and that restriction is exactly what makes it the right tool for an entire family of problems."
          points={[
            { takeaway: "Recognise nesting/matching problems on sight and reach for a stack first.", detail: "Brackets, HTML tags, function calls, XML — any open-then-close grammar collapses to push-on-open, pop-and-check-on-close." },
            { takeaway: "Evaluate postfix expressions with a stack — and know operand order matters.", detail: "RPN is the textbook stack-machine evaluator. The second pop is always the left operand. Get this once, never forget it." },
            { takeaway: "Reach for a monotonic stack when the problem says 'next greater', 'next smaller', or 'span'.", detail: "Total cost is O(n) by the amortized argument — each index is pushed once and popped at most once. This unlocks LC 739, 496, 901, 84, 42." },
            { takeaway: "See recursion and stacks as the same machine.", detail: "Any recursive algorithm rewrites mechanically as an iterative one with an explicit Deque. Use the explicit form when input depth might overflow the call stack." },
            { takeaway: "Use ArrayDeque, never java.util.Stack.", detail: "Stack inherits from synchronized Vector; ArrayDeque is the modern array-backed replacement and is the recommended idiom in the JDK docs." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Up next: Module 8 — Queues &amp; deques</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            FIFO (the inverse of LIFO). Ring buffers and ArrayDeque under the hood. The data structure that powers
            BFS, task queues, and sliding-window algorithms.
          </p>
          <Link
            href="/courses/dsa/modules/queues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Module 8 — Queues &amp; deques →
          </Link>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
