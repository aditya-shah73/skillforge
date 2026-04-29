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
  { id: "setup", title: "FIFO and the queue contract" },
  { id: "ringbuffer", title: "Why a naive array fails — ring buffers" },
  { id: "deque", title: "Deque: a queue that's also a stack" },
  { id: "patterns", title: "Patterns: BFS, sliding-window, scheduling" },
  { id: "project", title: "Project: build a ring buffer" },
  { id: "final", title: "Final quiz" },
];

export default function QueuesModule() {
  const mod = getModuleBySlug("queues")!;

  // The mental model: a horizontal pipe. Enqueue at the back, dequeue from the front.
  const queueModel = `
flowchart LR
    ENQ["enqueue(x)"] --> BACK
    subgraph Q["Queue (FIFO)"]
        direction LR
        FRONT["FRONT → 7"]
        E2["3"]
        E3["8"]
        BACK["1 ← BACK"]
        FRONT --> E2 --> E3 --> BACK
    end
    DEQ["dequeue() returns FRONT"] -.-> FRONT
    style FRONT fill:#10b981,color:#fff,stroke:#047857
    style BACK fill:#f59e0b,color:#fff,stroke:#b45309
    style E2 fill:#fbbf24,color:#000,stroke:#d97706
    style E3 fill:#fbbf24,color:#000,stroke:#d97706
    style ENQ fill:#1e293b,color:#fff,stroke:#475569
    style DEQ fill:#1e293b,color:#fff,stroke:#475569
  `.trim();

  // Ring buffer: array indices that wrap modulo capacity.
  const ringBuffer = `
flowchart LR
    subgraph RB["Ring buffer, capacity 8"]
        direction LR
        S0["[0]<br/>—"]
        S1["[1]<br/>—"]
        S2["[2]<br/>7"]
        S3["[3]<br/>3"]
        S4["[4]<br/>8"]
        S5["[5]<br/>1"]
        S6["[6]<br/>—"]
        S7["[7]<br/>—"]
    end
    H["head = 2 (next dequeue)"] -.-> S2
    T["tail = 6 (next enqueue)"] -.-> S6
    style S0 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style S1 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style S2 fill:#10b981,color:#fff,stroke:#047857
    style S3 fill:#fbbf24,color:#000,stroke:#d97706
    style S4 fill:#fbbf24,color:#000,stroke:#d97706
    style S5 fill:#fbbf24,color:#000,stroke:#d97706
    style S6 fill:#f59e0b,color:#fff,stroke:#b45309
    style S7 fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style H fill:#1e293b,color:#fff,stroke:#475569
    style T fill:#1e293b,color:#fff,stroke:#475569
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="queues" checkpoints={CHECKPOINTS} />

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
      <Checkpoint moduleSlug="queues" id="setup" title="I know the FIFO contract" xp={10} celebration="Enqueue at the back, dequeue from the front. The mirror image of a stack.">
      <section>
        <h2 id="setup">FIFO: the mirror image of LIFO</h2>

        <p>
          A <strong>queue</strong> is the stack's photographic negative. You add at one end (<em>back</em>) and
          remove from the other end (<em>front</em>). The first element added is the first one removed —{" "}
          <strong>FIFO</strong>, first in first out. It's how a real queue at a coffee shop works, and it's why we
          named the data structure after it.
        </p>

        <Mermaid chart={queueModel} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          The contract is again narrow: only the two ends are reachable. <code>enqueue</code>, <code>dequeue</code>, <code>peek</code>, <code>isEmpty</code>. All O(1).
        </p>

        <h3>Where queues actually show up</h3>
        <ul>
          <li>
            <strong>BFS (breadth-first search).</strong> Level-order traversal of trees and shortest paths in
            unweighted graphs are queue-shaped.
          </li>
          <li>
            <strong>Task / job queues.</strong> Workers pull from the front; producers push to the back. The whole
            world runs on this — Kafka, SQS, Celery, ExecutorService.
          </li>
          <li>
            <strong>Sliding-window algorithms.</strong> A monotonic <em>deque</em> (the next thing we'll meet) gives
            you O(n) maximum-of-window. (LC 239.)
          </li>
          <li>
            <strong>Buffering and pipelines.</strong> Ring buffers between producer and consumer threads, audio sample
            queues, frame buffers in graphics.
          </li>
        </ul>

        <Callout variant="spring" title="The whole queue API in five rows">
          <table className="m-0">
            <thead><tr><th>Op</th><th>Meaning</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td><code>offer(x)</code> / <code>add(x)</code></td><td>append x to the back</td><td>O(1) amortized</td></tr>
              <tr><td><code>poll()</code> / <code>remove()</code></td><td>remove and return the front element</td><td>O(1)</td></tr>
              <tr><td><code>peek()</code></td><td>look at the front element without removing</td><td>O(1)</td></tr>
              <tr><td><code>isEmpty()</code></td><td>true if there's nothing queued</td><td>O(1)</td></tr>
              <tr><td><code>size()</code></td><td>how many things are queued</td><td>O(1)</td></tr>
            </tbody>
          </table>
          <p className="mt-2 mb-0 text-xs">
            <strong>offer/poll vs add/remove.</strong> The first pair returns false / null on capacity issues; the
            second throws. Use offer/poll unless you specifically want exceptions.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="You enqueue 1, 2, 3, then dequeue once, then enqueue 4. What does the next dequeue return?"
          options={[
            { label: "1", explanation: "1 was already dequeued in step 2." },
            { label: "2", correct: true, explanation: "Right. After enqueue 1,2,3 the queue is [1, 2, 3] (1 at the front). Dequeue → 1 leaves, queue is [2, 3]. Enqueue 4 → [2, 3, 4]. Next dequeue returns the front: 2." },
            { label: "3", explanation: "3 is still in the middle of the queue, not at the front." },
            { label: "4", explanation: "4 was just enqueued at the back; it's the last element to leave." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Ring buffer ───────────────── */}
      <Checkpoint moduleSlug="queues" id="ringbuffer" title="I can build a ring buffer" xp={20} celebration="Two indices and a modulo. That's the whole trick — and it's everywhere in real systems.">
      <section>
        <h2 id="ringbuffer">Why a naive array doesn't work — and how ring buffers fix it</h2>

        <p>
          Try the obvious thing: an array, with size as the count. Enqueue is <code>data[size++] = x</code>, easy.
          Dequeue: return <code>data[0]</code> and… now what? Shift every other element left by one slot? That's{" "}
          <strong>O(n) per dequeue</strong> — disaster.
        </p>

        <p>
          Alternative: keep a <code>head</code> index, and just bump it forward on dequeue. Now dequeue is O(1), but
          the array is "leaking" — every dequeue wastes a slot at the front, and after enough operations the array
          fills up even though most of it is empty.
        </p>

        <h3>The fix: wrap around</h3>

        <p>
          A <strong>ring buffer</strong> (or <strong>circular buffer</strong>) treats the array as a circle. Two
          indices: <code>head</code> (where the next dequeue happens) and <code>tail</code> (where the next enqueue
          happens). Both indices advance modulo capacity, so they wrap from the last slot back to the first.
        </p>

        <Mermaid chart={ringBuffer} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          A ring buffer of capacity 8 holding 4 elements. <code>head = 2</code> points at the front; <code>tail = 6</code> is the slot where the next enqueue lands. After enough enqueues, tail wraps from index 7 back to 0.
        </p>

        <h3>One subtle question: is it full or empty?</h3>

        <p>
          When <code>head == tail</code>, is the buffer empty or full? Both states satisfy that equality. There are
          two standard fixes:
        </p>
        <ol>
          <li>
            <strong>Track size explicitly.</strong> Carry a <code>size</code> field. Empty when <code>size == 0</code>,
            full when <code>size == capacity</code>. Costs one int.
          </li>
          <li>
            <strong>Always leave one slot unused.</strong> Treat full as <code>(tail + 1) % capacity == head</code>.
            Costs one slot of capacity. Common in low-level / lock-free implementations because there's no shared
            mutable size variable.
          </li>
        </ol>

        <Callout variant="info" title="What ArrayDeque actually does">
          <code>java.util.ArrayDeque</code> uses option 2 internally — a power-of-two capacity, head and tail indices,
          and the &quot;leave one slot empty&quot; convention so it can use a fast bitwise AND instead of modulo. It's the
          textbook ring buffer with one performance trick.
        </Callout>

        <WorkedExample
          title="A ring buffer of capacity 4, traced by hand"
          steps={[
            { title: "Empty: head = 0, tail = 0, size = 0", body: "Array is [_, _, _, _]. head == tail, size says empty." },
            { title: "enqueue(7): write data[0] = 7, tail = 1, size = 1", body: "Array is [7, _, _, _]." },
            { title: "enqueue(3): write data[1] = 3, tail = 2, size = 2", body: "Array is [7, 3, _, _]." },
            { title: "enqueue(8): write data[2] = 8, tail = 3, size = 3", body: "Array is [7, 3, 8, _]." },
            { title: "dequeue(): read data[0] = 7, head = 1, size = 2", body: "Array is [_, 3, 8, _]. The slot at index 0 is now reusable." },
            { title: "enqueue(1): write data[3] = 1, tail = (3+1) % 4 = 0, size = 3", body: "Array is [_, 3, 8, 1]. Tail wrapped. Next enqueue lands at index 0." },
            { title: "enqueue(5): write data[0] = 5, tail = 1, size = 4", body: "Array is [5, 3, 8, 1]. Both head and tail are 1 — exactly the same indices as when the buffer was empty. Only the explicit size == capacity check distinguishes 'full' from 'empty' here. (Option 2 — the reserve-one-slot scheme — avoids this collision by making this state unreachable.)" },
          ]}
        />

        <p>That's the entire idea. Two indices, modulo arithmetic, no shifting, no allocation per enqueue. It's the foundation that <code>ArrayDeque</code>, lock-free SPSC queues, and most kernel queues are built on.</p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Deque ───────────────── */}
      <Checkpoint moduleSlug="queues" id="deque" title="I know when to reach for a deque" xp={15} celebration="Deque is the Swiss-army linear container. Stack, queue, sliding-window — all the same ArrayDeque.">
      <section>
        <h2 id="deque">Deque: the data structure that's everything at once</h2>

        <p>
          A <strong>deque</strong> (pronounced &quot;deck&quot;, double-ended queue) generalises both stack and queue: you
          can push and pop at <em>either end</em>. <code>addFirst</code>, <code>addLast</code>, <code>removeFirst</code>,{" "}
          <code>removeLast</code>, <code>peekFirst</code>, <code>peekLast</code>. All O(1).
        </p>

        <p>
          That sounds excessive — and it is, in API surface — but the implementation cost is the same as a queue: a
          ring buffer (for <code>ArrayDeque</code>) or a doubly-linked list (for <code>LinkedList</code>). One data
          structure, three workloads:
        </p>

        <ul>
          <li><strong>As a stack:</strong> push/pop on one end. Use <code>push</code>/<code>pop</code> on ArrayDeque.</li>
          <li><strong>As a queue:</strong> add at one end, remove from the other. Use <code>offer</code>/<code>poll</code>.</li>
          <li><strong>As a deque:</strong> the full sliding-window superset.</li>
        </ul>

        <Callout variant="insight" title="The single Java rule you need">
          For 95% of stack and queue code in Java, just write:
          <CodeBlock lang="java">{`Deque<E> stack = new ArrayDeque<>();   // use push/pop/peek
Deque<E> queue = new ArrayDeque<>();   // use offer/poll/peek`}</CodeBlock>
          <code>java.util.Stack</code> and <code>java.util.LinkedList</code>-as-queue are both legacy. ArrayDeque
          beats them on cache locality, allocation, and clarity.
        </Callout>

        <h3>The deque-as-sliding-window superpower</h3>

        <p>
          The reason deques aren't just a curiosity is the <strong>monotonic deque</strong>. A queue lets you remove
          from the front; a deque additionally lets you remove from the back. That second ability turns out to be
          exactly what you need to maintain a running maximum (or minimum) in O(n) total over a sliding window.
        </p>

        <CodeBlock lang="java">{`// LeetCode 239 — sliding window maximum, O(n).
// We keep indices in a deque, decreasing by value from front to back.
// Front is always the index of the current window's max.
public int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] out = new int[n - k + 1];
    java.util.Deque<Integer> dq = new java.util.ArrayDeque<>();   // indices

    for (int i = 0; i < n; i++) {
        // Drop indices that fell out of the window from the front.
        while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
        // Drop indices from the back whose values are dominated by nums[i].
        while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
    }
    return out;
}`}</CodeBlock>

        <Callout variant="warn" title="Subtle invariant — front is the current max only because we maintain it">
          Each index is added once and removed at most once, so total work is O(n). The deque is monotonically
          decreasing by value from front to back: nothing dominated by a newer-and-bigger element survives. That
          invariant is what makes the front always be the window max.
        </Callout>

        <h3>Classify the operation</h3>

        <ClassifyChallenge
          title="Where does each operation belong?"
          prompt="Classify each operation by which container is the right pick."
          buckets={[
            { id: "stack", label: "Use as a stack", color: "amber" },
            { id: "queue", label: "Use as a queue (FIFO)", color: "emerald" },
            { id: "deque", label: "Need full deque powers", color: "indigo" },
          ]}
          items={[
            { id: "rpn", label: "Evaluate a postfix (RPN) expression", answer: "stack", explanation: "Push operands, pop two on operator. Pure LIFO." },
            { id: "bfs", label: "BFS on a graph for shortest path in an unweighted graph", answer: "queue", explanation: "Visit each node in the order discovered. Pure FIFO." },
            { id: "tasks", label: "A worker pool consuming tasks from a producer", answer: "queue", explanation: "Producers offer at the back; workers poll from the front. FIFO." },
            { id: "callstack", label: "Iterative DFS replacing recursion", answer: "stack", explanation: "Push children; pop the most recently pushed first. LIFO." },
            { id: "slidingMax", label: "Maximum of every sliding window of size k", answer: "deque", explanation: "Need to drop from the front (out of window) and from the back (dominated). Both ends → deque." },
            { id: "undoRedo", label: "Undo/redo: undo from one stack, redo from another", answer: "stack", explanation: "Two stacks, push/pop at top of each. Pure LIFO." },
            { id: "lruRecency", label: "Maintain insertion order with quick removal of any item", answer: "deque", explanation: "LinkedHashMap and LRU caches do this internally with a doubly-linked list (a deque). Need both ends." },
            { id: "levelOrder", label: "Level-order traversal of a tree", answer: "queue", explanation: "Enqueue children; dequeue parents. FIFO." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Patterns ───────────────── */}
      <Checkpoint moduleSlug="queues" id="patterns" title="I can pick the right queue-shaped pattern" xp={20} celebration="BFS, sliding-window, scheduling — three distinct flavours, all FIFO at heart.">
      <section>
        <h2 id="patterns">Three patterns where queues are the shape of the answer</h2>

        <h3>Pattern 1 · BFS — level-order traversal &amp; shortest paths</h3>

        <p>
          The defining queue algorithm. Start with a single node, enqueue it, then loop: dequeue, process, enqueue
          its neighbours. You visit nodes in order of distance from the start — which is exactly why BFS computes
          shortest paths in unweighted graphs.
        </p>

        <CodeBlock lang="java">{`// Level-order traversal of a binary tree (LC 102 shape).
public java.util.List<java.util.List<Integer>> levelOrder(TreeNode root) {
    java.util.List<java.util.List<Integer>> out = new java.util.ArrayList<>();
    if (root == null) return out;
    java.util.Deque<TreeNode> q = new java.util.ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int sz = q.size();
        java.util.List<Integer> level = new java.util.ArrayList<>(sz);
        for (int i = 0; i < sz; i++) {
            TreeNode n = q.poll();
            level.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        out.add(level);
    }
    return out;
}`}</CodeBlock>

        <Callout variant="insight" title="The level-batch trick">
          Snapshot <code>q.size()</code> at the start of each outer iteration. That's the size of the current level —
          we drain exactly that many before any of the children we just enqueued get processed. This little move
          gives you per-level batches without needing a sentinel.
        </Callout>

        <h3>Pattern 2 · Sliding-window with a monotonic deque</h3>

        <p>
          We just saw it: LC 239. The recognition cue: any time you need a running maximum, minimum, or other
          dominance-based statistic over a fixed-size window, reach for a monotonic deque before you reach for
          anything else.
        </p>

        <h3>Pattern 3 · Scheduling &amp; rate limiting</h3>

        <p>
          A queue is the natural data structure for &quot;process events in order, decide based on the current window of
          recent events&quot;. LC 933 (Number of Recent Calls) is the canonical version: count the number of pings in the
          last 3000 ms.
        </p>

        <CodeBlock lang="java">{`// LC 933 — Number of Recent Calls.
class RecentCounter {
    private final java.util.Deque<Integer> q = new java.util.ArrayDeque<>();

    public int ping(int t) {
        q.offer(t);
        // Drop pings older than t - 3000 from the front.
        while (q.peekFirst() < t - 3000) q.pollFirst();
        return q.size();
    }
}`}</CodeBlock>

        <p>
          Total work across n calls is O(n) because each ping enters and leaves the queue at most once. Same amortized
          argument as the monotonic stack last module.
        </p>

        <Quiz
          kind="Pattern recognition"
          question="A trading system needs to compute, for each incoming tick, the maximum price seen in the last 5 minutes. Each tick has a timestamp. What's your reflex?"
          options={[
            { label: "Sort all ticks; binary search.", explanation: "Sorting destroys the time order, and you'd be re-sorting on every tick. Wrong shape." },
            { label: "Recompute the max over the relevant window each time.", explanation: "Linear per tick → O(n²) overall. Doesn't scale to a real feed." },
            { label: "A monotonic deque of (timestamp, price), dropping front entries older than 5 min and back entries dominated by the new price.", correct: true, explanation: "Right. Each tick is added once and removed at most once, so total work is O(n). The front of the deque is always the current window max." },
            { label: "A min-heap.", explanation: "Heaps are great for top-k but bad at sliding windows: you can't efficiently remove an arbitrary expired element from the middle." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="queues" id="project" title="I built a ring buffer and solved both LeetCode problems" xp={40} celebration="You've now written the data structure ArrayDeque is built on. The whole stdlib gets less mysterious from here." manual manualLabel="I shipped it">
      <section>
        <h2 id="project">Project: ring buffer + two LeetCode warm-ups</h2>

        <p>
          You'll write a real ring-buffer-backed <code>MyArrayQueue&lt;E&gt;</code> with growth, and solve LC 232
          (queue using two stacks) and LC 933 (recent calls). That covers both axes: you've built the structure from
          scratch, and you've used it as a pattern.
        </p>

        <h3>Step 1 · The ring buffer</h3>

        <CodeBlock lang="java">{`public class MyArrayQueue<E> {
    private Object[] data;
    private int head;     // index of next dequeue
    private int tail;     // index of next enqueue
    private int size;

    public MyArrayQueue() { this(16); }
    public MyArrayQueue(int initialCapacity) {
        if (initialCapacity < 1) throw new IllegalArgumentException();
        // For real performance, round to power of two so we can use bitwise AND
        // instead of modulo. ArrayDeque does this. We'll keep modulo for clarity.
        this.data = new Object[initialCapacity];
    }

    public int size() { return size; }
    public boolean isEmpty() { return size == 0; }

    public void offer(E v) {
        if (size == data.length) grow();
        data[tail] = v;
        tail = (tail + 1) % data.length;
        size++;
    }

    @SuppressWarnings("unchecked")
    public E poll() {
        if (size == 0) return null;
        E v = (E) data[head];
        data[head] = null;                       // help GC
        head = (head + 1) % data.length;
        size--;
        return v;
    }

    @SuppressWarnings("unchecked")
    public E peek() {
        return size == 0 ? null : (E) data[head];
    }

    /** Doubling growth that "unwraps" the ring into the new array starting at index 0. */
    private void grow() {
        int oldCap = data.length;
        Object[] bigger = new Object[oldCap * 2];
        // Copy the elements in logical order: head..end, then 0..tail.
        int rightSegment = oldCap - head;
        System.arraycopy(data, head, bigger, 0, rightSegment);
        if (tail < head) {
            System.arraycopy(data, 0, bigger, rightSegment, tail);
        }
        data = bigger;
        head = 0;
        tail = size;        // size unchanged; tail now sits right after the last element
    }
}`}</CodeBlock>

        <Callout variant="warn" title="The grow() function is where almost every ring-buffer bug lives">
          When the data is wrapped (tail &lt; head), a single <code>System.arraycopy</code> won't do — you need two,
          one for the head-to-end segment and one for the start-to-tail segment. Trace it on paper before convincing
          yourself it's right.
        </Callout>

        <h3>Step 2 · LeetCode 232 — Implement Queue using Stacks</h3>

        <p>
          The trick: use two stacks. Push always goes onto the &quot;in&quot; stack. Pop pulls from the &quot;out&quot; stack — and when
          out is empty, we drain in into out, which reverses the order so the bottom of in becomes the top of out.
          Each element is moved at most twice → amortized O(1) per operation.
        </p>

        <CodeBlock lang="java">{`class MyQueue {
    private final java.util.Deque<Integer> in  = new java.util.ArrayDeque<>();
    private final java.util.Deque<Integer> out = new java.util.ArrayDeque<>();

    public void push(int x) { in.push(x); }

    public int pop() {
        shiftIfNeeded();
        return out.pop();
    }

    public int peek() {
        shiftIfNeeded();
        return out.peek();
    }

    public boolean empty() { return in.isEmpty() && out.isEmpty(); }

    private void shiftIfNeeded() {
        if (out.isEmpty()) {
            while (!in.isEmpty()) out.push(in.pop());   // reverse on transfer
        }
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Why this is amortized O(1)">
          Each element is pushed onto <code>in</code> once, popped from <code>in</code> once (during the shift), pushed
          onto <code>out</code> once, and popped from <code>out</code> once. Four constant-time ops over the element's
          lifetime → amortized O(1) per public operation. Same accounting argument as ArrayList's doubling.
        </Callout>

        <h3>Step 3 · LeetCode 933 — Number of Recent Calls</h3>
        <p>The 8-line implementation is in the patterns section above. Submit it; verify on the canonical adversarial input where every ping lands inside the window (so the queue grows to maximum length).</p>

        <h3>Stretch: LC 622 — Design Circular Queue</h3>
        <p>
          A direct application of the ring buffer you just wrote — the LC version asks for a fixed-capacity queue with
          a Boolean &quot;full&quot; signal. The implementation is essentially your <code>MyArrayQueue</code> with growth removed
          and an <code>isFull()</code> check.
        </p>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="queues" id="final" title="I've completed Module 8 — and Phase 2!" xp={30} celebration="That's all five linear data structures. Phase 3 — hashing, trees, and the algorithms that go with them — is where things get interesting.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="You're implementing a queue with a fixed-size array. After many enqueue/dequeue cycles, head == tail. Is the queue empty or full?"
          options={[
            { label: "Always empty.", explanation: "It depends. After enqueueing exactly capacity elements without dequeueing, head and tail also coincide." },
            { label: "Always full.", explanation: "It depends. When the structure is brand-new and nothing has been enqueued, head == tail == 0." },
            { label: "Ambiguous — you must track size separately, or reserve one slot to disambiguate.", correct: true, explanation: "Right. The two standard fixes are: (1) carry an explicit size counter; (2) treat the buffer as full when (tail + 1) % capacity == head, leaving one slot permanently empty. ArrayDeque uses option 2." },
            { label: "Empty if head was just initialized, full otherwise.", explanation: "There's no way to tell that just from the indices — that's the whole problem this question is highlighting." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Why does the two-stack queue (LC 232) achieve amortized O(1) per operation?"
          options={[
            { label: "It uses ArrayDeque, which is fast.", explanation: "Closer to the truth, but the right argument is about amortized accounting, not the underlying container speed." },
            { label: "Each element is moved a constant number of times across its entire lifetime, even though one operation can do up to O(n) work.", correct: true, explanation: "Right. Each element is pushed onto in, transferred to out, and eventually popped — four constant-time ops over its lifetime. Sum across n operations: O(n). Average per operation: O(1)." },
            { label: "Stacks are always O(1).", explanation: "Stack ops are O(1), but the queue's pop sometimes has to drain in into out — which is O(in.size()). The amortized argument is what makes the average constant." },
            { label: "Java's HotSpot JIT compiles it to constant time.", explanation: "Compiler magic doesn't change algorithmic complexity. The amortized accounting does." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Which container should you reach for, in plain unsynchronized Java code, when you need a stack? When you need a queue?"
          options={[
            { label: "java.util.Stack for stacks; java.util.LinkedList for queues.", explanation: "Both are legacy. Stack inherits from synchronized Vector; LinkedList-as-queue does a heap allocation per offer. Don't reach for these in new code." },
            { label: "ArrayDeque for both — it's the modern array-backed deque, and it can serve as either.", correct: true, explanation: "Right. Use push/pop/peek on it as a stack, offer/poll/peek as a queue. It's faster than Stack and LinkedList, and the JDK docs explicitly recommend it for both roles." },
            { label: "PriorityQueue for both.", explanation: "PriorityQueue is a heap, not a FIFO queue. Its poll returns the smallest element, not the first one inserted. Wrong tool." },
            { label: "ArrayList for stacks, LinkedList for queues.", explanation: "ArrayList works as a stack only awkwardly (no built-in push/pop semantics that aren't index-based). ArrayDeque is purpose-built for this." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="A queue is a stack rotated 90 degrees: same restricted contract, opposite end ordering. The deque generalises both, and ArrayDeque is the one container that can serve every linear single-threaded role."
          points={[
            { takeaway: "Pick FIFO vs LIFO from the workload, reflexively.", detail: "Order-preserving event processing, BFS, task queues → FIFO. Nesting, undo, recursion-as-iteration → LIFO. If you need both ends, deque." },
            { takeaway: "Build a ring buffer from two indices and modulo arithmetic.", detail: "head, tail, capacity. Enqueue writes at tail and advances tail mod cap; dequeue reads at head and advances head mod cap. The head==tail ambiguity needs an explicit size or a reserved slot." },
            { takeaway: "Use ArrayDeque for everything single-threaded.", detail: "It's a power-of-two-capacity ring buffer with bitwise AND instead of modulo. Faster than Stack and LinkedList for both stack and queue roles. The default choice." },
            { takeaway: "Recognise BFS, level-order, sliding-window, and rate-limiting as queue-shaped problems.", detail: "BFS = queue. Maximum of sliding window = monotonic deque. Pings within last T ms = queue with timestamp-based front-eviction. Pattern recognition shrinks the problem to one or two known templates." },
            { takeaway: "Apply amortized accounting to two-stack queues, ArrayList growth, and monotonic stacks.", detail: "Same argument every time: each element is touched a constant number of times across its lifetime, so total work is O(n) and per-op average is O(1) — even though any single operation can be more expensive." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Phase 2 complete · Linear data structures</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            Arrays, strings, linked lists, stacks, queues — five modules of building blocks. Phase 3 cracks open the
            structures that power most of modern software: hash tables (the <em>O(1) lookup</em> miracle) and trees
            (where binary search, BSTs, and heaps live).
          </p>
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Back to the course outline →
          </Link>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
