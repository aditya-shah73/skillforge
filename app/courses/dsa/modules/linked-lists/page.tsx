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
  { id: "setup", title: "Why linked lists exist" },
  { id: "node-model", title: "The node-and-pointer model" },
  { id: "operations", title: "Cost of every operation" },
  { id: "tricks", title: "Dummy heads & fast/slow pointers" },
  { id: "project", title: "Project: build a linked list" },
  { id: "final", title: "Final quiz" },
];

export default function LinkedListsModule() {
  const mod = getModuleBySlug("linked-lists")!;

  // The mental model: nodes scattered around the heap, each one knowing where the next one lives.
  // No contiguous memory, no address arithmetic, no O(1) random access.
  const nodeChain = `
flowchart LR
    H["head"] --> N1["11 | next"]
    N1 --> N2["23 | next"]
    N2 --> N3["7 | next"]
    N3 --> N4["42 | next"]
    N4 --> NULL["null"]
    style H fill:#1e293b,color:#fff,stroke:#475569
    style N1 fill:#fbbf24,color:#000,stroke:#d97706
    style N2 fill:#fbbf24,color:#000,stroke:#d97706
    style N3 fill:#fbbf24,color:#000,stroke:#d97706
    style N4 fill:#fbbf24,color:#000,stroke:#d97706
    style NULL fill:#f1f5f9,color:#475569,stroke:#cbd5e1
  `.trim();

  // The dummy head trick: a sentinel node before the real head removes the
  // "is this the first element?" branch from every insert/delete.
  const dummyHead = `
flowchart LR
    D["dummy<br/>(sentinel)"] --> N1["11 | next"]
    N1 --> N2["23 | next"]
    N2 --> N3["7 | next"]
    N3 --> NULL["null"]
    HEAD["list.head = dummy.next"] -.-> N1
    style D fill:#7c3aed,color:#fff,stroke:#5b21b6
    style N1 fill:#fbbf24,color:#000,stroke:#d97706
    style N2 fill:#fbbf24,color:#000,stroke:#d97706
    style N3 fill:#fbbf24,color:#000,stroke:#d97706
    style NULL fill:#f1f5f9,color:#475569,stroke:#cbd5e1
    style HEAD fill:#1e293b,color:#fff,stroke:#475569
  `.trim();

  // Tortoise and hare. fast moves 2, slow moves 1. After n iterations slow
  // is at n/2 (the middle), and if there's a cycle fast laps slow inside it.
  const fastSlow = `
flowchart LR
    H["head"] --> A["A"]
    A --> B["B"]
    B --> C["C ⟵ slow"]
    C --> D["D"]
    D --> E["E ⟵ fast"]
    E --> NULL["null"]
    style C fill:#10b981,color:#fff,stroke:#047857
    style E fill:#ef4444,color:#fff,stroke:#b91c1c
    style H fill:#1e293b,color:#fff,stroke:#475569
    style NULL fill:#f1f5f9,color:#475569,stroke:#cbd5e1
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="linked-lists" checkpoints={CHECKPOINTS} />

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

      {/* ───────────────── Part 1 · Setup & motivation ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="setup" title="I know why linked lists exist" xp={10} celebration="Linked lists swap random access for surgical insertion.">
      <section>
        <h2 id="setup">Why linked lists exist</h2>

        <p>
          Arrays are wonderful — until you need to insert into the middle. Then every element to the right has to slide
          over by one slot, and you pay <strong>O(n)</strong> on every poke. If your workload is mostly{" "}
          <em>insert here, delete there, splice this in front</em>, the array's contiguous memory becomes a tax.
        </p>

        <p>
          A <strong>linked list</strong> trades random access for surgical insertion. There's no contiguous memory.
          Each element lives in its own little <em>node</em> on the heap, and each node holds one extra piece of
          information: <code>next</code>, a reference to the node that comes after it. You navigate the list by
          chasing pointers, not by indexing.
        </p>

        <Callout variant="spring" title="The trade in one sentence">
          <p className="m-0">
            Arrays are O(1) to read by index and O(n) to insert in the middle. Linked lists are O(n) to read by index
            and O(1) to insert <em>once you have a pointer to the spot</em>. Pick your pain.
          </p>
        </Callout>

        <h3>The analogy: a treasure hunt</h3>
        <p>
          An array is a row of houses on the same street, all numbered. Want house #42? Walk straight there. A linked
          list is a treasure hunt: each clue tells you where the next clue is. To find clue #42 you must read clues
          1, 2, 3, …, 41 first. Cheap to add a new clue (write it on a card, point the previous clue at it). Expensive
          to jump to the middle.
        </p>

        <Quiz
          kind="Gut check"
          question="Your code does 10 million 'insert at the very front' operations and almost no random reads. ArrayList or LinkedList?"
          options={[
            { label: "ArrayList — it's the default for a reason.", explanation: "ArrayList.add(0, x) is O(n) — every insertion shifts the entire array. 10 million of those is catastrophic." },
            { label: "LinkedList — front insertion is O(1).", correct: true, explanation: "Right. LinkedList.addFirst is O(1). This is exactly the workload it's designed for. (In practice, an ArrayDeque is even better, but you'll meet that next module.)" },
            { label: "Neither — use a HashMap.", explanation: "HashMap doesn't preserve insertion order naturally and can't model 'list of things'." },
            { label: "It doesn't matter.", explanation: "It really does. We're talking the difference between seconds and hours." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Node-and-pointer model ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="node-model" title="I can draw the node-and-pointer model" xp={15} celebration="A list is a chain of nodes, each holding a reference to the next.">
      <section>
        <h2 id="node-model">The node-and-pointer model</h2>

        <p>A singly-linked list is two ideas stacked together:</p>
        <ol>
          <li>A <strong>Node</strong>: a value plus a pointer to the next node.</li>
          <li>A <strong>list object</strong>: a pointer to the first node (the <em>head</em>), and usually a size counter.</li>
        </ol>

        <CodeBlock lang="java">{`// The simplest possible singly-linked list node.
static class Node<E> {
    E value;
    Node<E> next;        // null when this is the tail
    Node(E v) { this.value = v; }
}

class MyLinkedList<E> {
    private Node<E> head;   // null when empty
    private int size;
    // ...
}`}</CodeBlock>

        <p>
          Every node lives in its own heap allocation. They are not next to each other in memory. The chain only exists
          because each node holds a reference to the next.
        </p>

        <Mermaid chart={nodeChain} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          Each box is a heap allocation. The arrows are <code>next</code> references. <code>head</code> is the only handle into the chain.
        </p>

        <h3>Singly vs doubly vs circular</h3>
        <ul>
          <li>
            <strong>Singly linked:</strong> each node has only <code>next</code>. You can move forward, never backward.
            Compact (one pointer per node).
          </li>
          <li>
            <strong>Doubly linked:</strong> each node has <code>next</code> <em>and</em> <code>prev</code>. You can walk in
            either direction. Costs an extra reference per node, but makes deletion <em>given a node</em> O(1) and lets
            you maintain a tail pointer with O(1) addLast and O(1) removeLast.{" "}
            <code>java.util.LinkedList</code> is doubly linked.
          </li>
          <li>
            <strong>Circular:</strong> the tail's <code>next</code> points back to the head instead of <code>null</code>.
            Useful for round-robin schedulers and ring-buffer-like structures.
          </li>
        </ul>

        <Callout variant="info" title="Java's two LinkedLists are very different">
          <p className="m-0">
            <code>java.util.LinkedList&lt;E&gt;</code> is the doubly-linked one we're modelling. It also implements{" "}
            <code>Deque</code>, so you can use it as a queue or stack. (Spoiler: <code>ArrayDeque</code> is faster for
            almost every real workload — Module 8.)
          </p>
        </Callout>

        <Quiz
          kind="Mental model check"
          question="Which line correctly inserts a new node X between A and B in a singly-linked list, given a pointer to A?"
          options={[
            { label: "A.next = X; X.next = B;", explanation: "You overwrote A.next before saving B. Now nothing points to B; you've leaked the rest of the list." },
            { label: "X.next = A.next; A.next = X;", correct: true, explanation: "Correct. First wire X's next to whatever A used to point to (B), then wire A to X. Order matters." },
            { label: "B.prev = X; X.next = B;", explanation: "Singly-linked nodes have no prev pointer. This is a doubly-linked-list move." },
            { label: "X = A.next; A.next = X;", explanation: "Now X is just an alias for B. Nothing was inserted." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Operations & their cost ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="operations" title="I can derive the cost of every linked-list operation" xp={15} celebration="Walking is O(n). Wiring is O(1). The walk usually dominates.">
      <section>
        <h2 id="operations">The cost of every operation</h2>

        <p>
          Forget memorising. Derive each cost from the model: a singly-linked list only knows the head, and to reach
          index <em>i</em> you must follow <em>i</em> next-pointers.
        </p>

        <table>
          <thead>
            <tr><th>Operation</th><th>Singly-linked</th><th>Doubly-linked (with tail)</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr><td><code>addFirst(x)</code></td><td>O(1)</td><td>O(1)</td><td>Wire two pointers; no traversal.</td></tr>
            <tr><td><code>addLast(x)</code></td><td>O(n) <em>(or O(1) if we keep a tail)</em></td><td>O(1)</td><td>Singly without a tail must walk to the end.</td></tr>
            <tr><td><code>get(i)</code></td><td>O(n)</td><td>O(n)</td><td>No address arithmetic — must walk i steps.</td></tr>
            <tr><td><code>add(i, x)</code></td><td>O(n)</td><td>O(n)</td><td>Walking to index i dominates the wiring.</td></tr>
            <tr><td><code>remove(node)</code> <em>given the node</em></td><td>O(n) <em>(must find prev)</em></td><td>O(1)</td><td>Singly can't go backwards from <code>node</code>.</td></tr>
            <tr><td><code>removeFirst()</code></td><td>O(1)</td><td>O(1)</td><td>Bump the head pointer.</td></tr>
            <tr><td><code>removeLast()</code></td><td>O(n)</td><td>O(1)</td><td>Singly must find the new tail.</td></tr>
          </tbody>
        </table>

        <Callout variant="warn" title="The most-asked LinkedList interview gotcha">
          <p className="m-0">
            <code>linkedList.get(i)</code> is <strong>O(n)</strong>. So this loop:
          </p>
          <CodeBlock lang="java">{`for (int i = 0; i < list.size(); i++) {
    process(list.get(i));   // O(n) every iteration → O(n²) total
}`}</CodeBlock>
          <p className="m-0">
            is quadratic on a LinkedList. Always iterate with an enhanced-for or an Iterator — those walk one step at a time and stay O(n).
          </p>
        </Callout>

        <h3>Worked example: insert-at-index, step by step</h3>

        <WorkedExample
          title="addAtIndex(2, 99) in [A → B → C → D]"
          steps={[
            { title: "Walk to index 1", body: "Start at head (A). Take 1 step forward. We're now at B (index 1) — the node before our insertion point." },
            { title: "Build the new node", body: "Node<E> fresh = new Node<>(99); fresh.next is null." },
            { title: "Wire fresh.next first", body: "fresh.next = B.next;  // fresh now points to C. The new node is partly attached." },
            { title: "Wire B.next last", body: "B.next = fresh;  // B now points to fresh, fresh points to C. Insertion done." },
            { title: "Total cost", body: "Walking: 1 hop (i − 1 in general → O(n)). Wiring: 2 pointer assignments → O(1). Overall O(n), dominated by the walk." },
          ]}
        />

        <p>The classic trap is wiring in the wrong order. If you do <code>B.next = fresh</code> first, you've lost the reference to C — fresh.next is still null and the rest of the list is detached.</p>

        <h3>Classify the operation</h3>
        <ClassifyChallenge
          title="Classify each operation by its worst-case cost"
          prompt="Drag each operation into the right bucket."
          buckets={[
            { id: "constant", label: "O(1)", color: "emerald" },
            { id: "linear", label: "O(n)", color: "amber" },
          ]}
          items={[
            { id: "addFirst", label: "addFirst(x) on a singly-linked list", answer: "constant", explanation: "Two pointer writes, no traversal. O(1)." },
            { id: "addLastWithTail", label: "addLast(x) on a doubly-linked list with a tail pointer", answer: "constant", explanation: "tail.next = fresh; fresh.prev = tail; tail = fresh. No walk, O(1)." },
            { id: "addLastNoTail", label: "addLast(x) on a singly-linked list with no tail pointer", answer: "linear", explanation: "Must walk to the end first. O(n)." },
            { id: "getMiddle", label: "get(n / 2) on any linked list", answer: "linear", explanation: "No random access. Walk n/2 steps → O(n)." },
            { id: "removeFirst", label: "removeFirst() on either flavour", answer: "constant", explanation: "head = head.next. One write. O(1)." },
            { id: "removeNodeSingly", label: "remove(node) on a singly-linked list, given just the node", answer: "linear", explanation: "Must walk from head to find the previous node. O(n)." },
            { id: "removeNodeDoubly", label: "remove(node) on a doubly-linked list, given the node", answer: "constant", explanation: "node.prev.next = node.next; node.next.prev = node.prev. No walk. O(1)." },
            { id: "contains", label: "contains(x) on any linked list", answer: "linear", explanation: "Linear scan from head. O(n)." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Tricks of the trade ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="tricks" title="I can use dummy heads & fast/slow pointers" xp={20} celebration="The two tricks that turn linked-list code from horrible to mechanical.">
      <section>
        <h2 id="tricks">Two tricks that make linked-list code stop being painful</h2>

        <h3>Trick 1: the dummy-head sentinel</h3>
        <p>
          Naive linked-list code is full of <em>"if I'm inserting at the front, special-case it"</em> branches, because
          the head pointer lives on the list, not on a node. The <strong>dummy-head</strong> trick removes the
          asymmetry by introducing a fake first node that never holds real data — every real node is now the{" "}
          <code>next</code> of <em>some</em> node, including the actual head.
        </p>

        <Mermaid chart={dummyHead} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          The <code>dummy</code> node holds no data. The first real element is <code>dummy.next</code>. Inserting and removing at the front becomes the same code as inserting and removing in the middle.
        </p>

        <CodeBlock lang="java">{`// Without dummy head — branch-heavy
public void addFirst(E v) {
    Node<E> fresh = new Node<>(v);
    fresh.next = head;
    head = fresh;
}
public void addAt(int i, E v) {
    if (i == 0) { addFirst(v); return; }   // branch!
    Node<E> prev = head;
    for (int k = 0; k < i - 1; k++) prev = prev.next;
    Node<E> fresh = new Node<>(v);
    fresh.next = prev.next;
    prev.next = fresh;
}

// With dummy head — uniform
public void addAt(int i, E v) {
    Node<E> prev = dummy;            // start one before head
    for (int k = 0; k < i; k++) prev = prev.next;
    Node<E> fresh = new Node<>(v);
    fresh.next = prev.next;
    prev.next = fresh;
}`}</CodeBlock>

        <Callout variant="insight" title="When to reach for a dummy head">
          <p className="m-0">
            Any time you're writing a linked-list algorithm where the answer might require <em>removing or replacing the
            head</em>. Examples: removing all nodes with a given value (LC 203), removing duplicates (LC 83), reversing the
            first k nodes. A two-line dummy.next = head; setup eliminates a class of bugs.
          </p>
        </Callout>

        <h3>Trick 2: fast/slow (tortoise &amp; hare) pointers</h3>

        <p>
          Walk two pointers down the list. <code>slow</code> takes one step per iteration, <code>fast</code> takes two.
          Two consequences fall out for free:
        </p>
        <ul>
          <li>When <code>fast</code> hits null, <code>slow</code> is at the <strong>middle</strong>. (LC 876.)</li>
          <li>If there's a <strong>cycle</strong>, <code>fast</code> will eventually catch up to <code>slow</code> from behind. (LC 141 — Floyd's algorithm.)</li>
          <li>If you need the kᵗʰ-from-end node, advance <code>fast</code> k steps first, then walk both together until <code>fast</code> hits null. (LC 19.)</li>
        </ul>

        <Mermaid chart={fastSlow} />
        <p className="text-xs text-slate-500 italic text-center -mt-2 mb-6">
          After 2 iterations on a 5-node list: <code>slow</code> is at the middle (C), <code>fast</code> is at E. One more step and <code>fast</code> falls off the end — return <code>slow</code>.
        </p>

        <CodeBlock lang="java">{`// LC 876 — middle of a linked list. Returns the second middle for even lengths.
public Node<Integer> middleNode(Node<Integer> head) {
    Node<Integer> slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}

// LC 141 — has cycle? Floyd's tortoise and hare.
public boolean hasCycle(Node<Integer> head) {
    Node<Integer> slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;   // they met inside a cycle
    }
    return false;                         // fast escaped → no cycle
}`}</CodeBlock>

        <Callout variant="warn" title="The cycle invariant in one line">
          <p className="m-0">
            On an acyclic list, <code>fast</code> always hits null first because it moves twice as quickly. On a cyclic
            list, <code>fast</code> can never escape, and the gap between fast and slow shrinks by one node per iteration
            inside the cycle — so they must collide. There is no third option.
          </p>
        </Callout>

        <h3>Trick 3 (bonus): in-place reversal</h3>

        <p>
          Reversing a singly-linked list in place is a three-pointer dance. Hold the previous node, the current node,
          and the next node — at each step, flip <code>curr.next</code> to point at <code>prev</code>, then advance.
        </p>

        <CodeBlock lang="java">{`// LC 206 — reverse a singly-linked list, iterative.
public Node<E> reverse(Node<E> head) {
    Node<E> prev = null, curr = head;
    while (curr != null) {
        Node<E> next = curr.next;   // remember where we were going
        curr.next = prev;            // flip the arrow
        prev = curr;                 // advance prev
        curr = next;                 // advance curr
    }
    return prev;                     // prev is now the new head
}`}</CodeBlock>

        <PartRecap
          title="Tricks recap"
          gist="Two tricks remove most of the pain from linked-list code: a dummy sentinel that makes the head look like every other node, and a pair of pointers walking at different speeds."
          points={[
            { takeaway: "Dummy head removes the 'is this the first node?' branch.", detail: "Add a sentinel node before head. Now every real node is the .next of some node — even the first. Insert and delete at index 0 use the same code as anywhere else." },
            { takeaway: "Fast/slow pointers solve middle, cycle, and kᵗʰ-from-end with one loop.", detail: "slow advances by 1, fast by 2. When fast hits null, slow is at the middle. If they collide, there's a cycle. Decoupling fast first by k gives you the kᵗʰ-from-end node." },
            { takeaway: "In-place reversal is a three-pointer dance.", detail: "prev / curr / next. At each step: save curr.next, flip curr.next to prev, advance. Memorise it — it appears in dozens of derived problems." },
          ]}
        />

      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="project" title="I built MyLinkedList and solved all three LeetCode problems" xp={40} celebration="You can now write the data structure that 30% of interview problems are built on." manual manualLabel="I shipped it">
      <section>
        <h2 id="project">Project: build a linked list, then crush three LeetCode problems</h2>

        <p>
          You'll write <code>MyLinkedList&lt;E&gt;</code> from scratch — singly-linked, with a dummy head and a tail
          pointer so addLast is O(1). Then apply it to the three canonical interview problems.
        </p>

        <h3>Step 1 · The class</h3>

        <CodeBlock lang="java">{`public class MyLinkedList<E> implements Iterable<E> {
    private static class Node<E> {
        E value;
        Node<E> next;
        Node(E v) { this.value = v; }
    }

    private final Node<E> dummy = new Node<>(null);   // sentinel; never holds data
    private Node<E> tail = dummy;                      // tail == dummy when empty
    private int size = 0;

    public int size() { return size; }
    public boolean isEmpty() { return size == 0; }

    /** O(1) — wire after the tail. */
    public void addLast(E v) {
        Node<E> fresh = new Node<>(v);
        tail.next = fresh;
        tail = fresh;
        size++;
    }

    /** O(1) — splice between dummy and the current first node. */
    public void addFirst(E v) {
        Node<E> fresh = new Node<>(v);
        fresh.next = dummy.next;
        dummy.next = fresh;
        if (tail == dummy) tail = fresh;   // first element ever
        size++;
    }

    /** O(n) — walk i steps, then wire. */
    public void add(int i, E v) {
        if (i < 0 || i > size) throw new IndexOutOfBoundsException();
        if (i == size) { addLast(v); return; }
        Node<E> prev = dummy;
        for (int k = 0; k < i; k++) prev = prev.next;
        Node<E> fresh = new Node<>(v);
        fresh.next = prev.next;
        prev.next = fresh;
        size++;
    }

    /** O(n) — walk i steps. */
    public E get(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        Node<E> curr = dummy.next;
        for (int k = 0; k < i; k++) curr = curr.next;
        return curr.value;
    }

    /** O(n) — walk to prev, unlink. */
    public E remove(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        Node<E> prev = dummy;
        for (int k = 0; k < i; k++) prev = prev.next;
        Node<E> victim = prev.next;
        prev.next = victim.next;
        if (victim == tail) tail = prev;
        size--;
        return victim.value;
    }

    @Override
    public java.util.Iterator<E> iterator() {
        return new java.util.Iterator<>() {
            Node<E> curr = dummy.next;
            @Override public boolean hasNext() { return curr != null; }
            @Override public E next() {
                E v = curr.value;
                curr = curr.next;
                return v;
            }
        };
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why the iterator matters">
          <p className="m-0">
            Without it, iterating with <code>for (int i = 0; i &lt; size; i++) get(i)</code> is O(n²). The iterator walks
            one node at a time and stays O(n). Always provide one.
          </p>
        </Callout>

        <h3>Step 2 · LeetCode 206 — Reverse a Linked List</h3>

        <CodeBlock lang="java">{`// You're given the head node directly (not a list wrapper) — that's typical for LC.
public Node<Integer> reverseList(Node<Integer> head) {
    Node<Integer> prev = null, curr = head;
    while (curr != null) {
        Node<Integer> next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;   // new head
}`}</CodeBlock>

        <h3>Step 3 · LeetCode 876 — Middle of the Linked List</h3>

        <CodeBlock lang="java">{`public Node<Integer> middleNode(Node<Integer> head) {
    Node<Integer> slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`}</CodeBlock>

        <h3>Step 4 · LeetCode 141 — Linked List Cycle</h3>

        <CodeBlock lang="java">{`public boolean hasCycle(Node<Integer> head) {
    Node<Integer> slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`}</CodeBlock>

        <Callout variant="spring" title="Stretch goal — LC 142, finding where the cycle starts">
          <p className="m-0">
            Once <code>slow</code> and <code>fast</code> meet inside the cycle, reset <code>fast</code> to <code>head</code>
            and walk both one step at a time. They meet at the cycle entrance. Number-theoretic, beautiful, and worth
            working out on paper.
          </p>
        </Callout>

      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="linked-lists" id="final" title="I've completed Module 6" xp={25} celebration="Linked lists are now muscle memory. Stacks and queues are next — and they're built on top of what you just learned.">
      <section>
        <h2 id="final">Final quiz</h2>

        <Quiz
          kind="Final check"
          question="You're maintaining a playlist where the most common operations are 'add to end', 'remove the song that's playing right now', and 'jump to next song'. Which structure?"
          options={[
            { label: "ArrayList — O(1) random access wins.", explanation: "Random access isn't what you need. The bottleneck is 'remove the current song' — that's O(n) on an ArrayList because everything after shifts left." },
            { label: "Singly-linked list with head and tail pointers.", explanation: "Close, but 'remove current song' is O(n) on a singly-linked list because you can't walk backward from the current node to fix prev.next." },
            { label: "Doubly-linked list.", correct: true, explanation: "All three ops are O(1): addLast via tail, removeCurrent via current.prev/next splice, advance via current = current.next. Java's LinkedList literally is this." },
            { label: "HashMap.", explanation: "HashMap doesn't preserve order natively. You'd need a LinkedHashMap, which is itself implemented on top of a doubly-linked list — so the underlying answer is still doubly-linked." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Why does Floyd's tortoise-and-hare guarantee detecting a cycle if one exists?"
          options={[
            { label: "Because fast is twice as fast, it eventually wraps around.", explanation: "Closer, but the precise reason matters: inside a cycle the gap between fast and slow shrinks by 1 every iteration, so they must collide in finite time." },
            { label: "Because if there's a cycle, fast can never reach null, and inside the cycle the gap fast - slow shrinks by one each step until they meet.", correct: true, explanation: "Exactly. fast can't escape an acyclic suffix because there isn't one in a cyclic list, and the relative speed of 1 inside the cycle guarantees collision within at most cycle-length steps." },
            { label: "Because fast and slow start at the same place, they're always equal.", explanation: "After the first iteration they're at different nodes — they only re-meet inside a cycle." },
            { label: "It only works for cycles of even length.", explanation: "False. The proof works for any cycle length." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="What does this code do? Node<E> prev = null, curr = head; while (curr != null) { Node<E> next = curr.next; curr.next = prev; prev = curr; curr = next; } return prev;"
          options={[
            { label: "Counts the nodes.", explanation: "It doesn't increment any counter. The variables tracked are pointers, not numbers." },
            { label: "Detects a cycle.", explanation: "There's no fast pointer and no equality check between two pointers." },
            { label: "Reverses the list in place and returns the new head.", correct: true, explanation: "Right — the canonical iterative reversal. After the loop, prev is the last node we processed, which is now the new head." },
            { label: "Removes duplicates.", explanation: "No equality checks against neighbour values; this is purely structural pointer manipulation." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="Linked lists are nodes-and-pointers. Most of the apparent difficulty is just bookkeeping that two tricks make routine."
          points={[
            { takeaway: "Pick array vs linked list from the workload, not from habit.", detail: "Random access? Array. Splicing in the middle once you have a pointer? Linked list. Both? Probably a different structure (tree, skip list, deque)." },
            { takeaway: "Implement singly, doubly, and circular variants and reason about when each pays off.", detail: "Doubly costs an extra pointer per node but earns O(1) deletion-given-node and O(1) addLast/removeLast. Circular suits round-robin scheduling." },
            { takeaway: "Use the dummy-head trick to flatten the special-case-the-head bug class.", detail: "A two-line setup that pays off every time the algorithm might modify the head — remove-by-value, dedupe, reverse-first-k, you name it." },
            { takeaway: "Reach for fast/slow pointers when a problem mentions 'middle', 'cycle', or 'kᵗʰ from end'.", detail: "All three collapse to a single loop. That's the recognition cue." },
            { takeaway: "Reverse a list in place with the three-pointer dance — and spot it disguised in other problems.", detail: "It shows up inside reorder-list, palindrome-linked-list, and reverse-nodes-in-k-group. Once it's muscle memory, those problems get easier." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Up next: Module 7 — Stacks</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            LIFO. The call stack is a stack. Bracket matching is a stack. Reverse Polish notation is a stack. And monotonic
            stacks unlock a class of problems (next-greater-element, daily temperatures) that look impossible until you
            see the trick.
          </p>
          <Link
            href="/courses/dsa/modules/stacks"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Continue to Module 7 — Stacks →
          </Link>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
