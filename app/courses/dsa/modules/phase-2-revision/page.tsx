import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 15 minutes before an interview, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase2RevisionModule() {
  const mod = getModuleBySlug("phase-2-revision")!;

  // Why s += x is O(n^2): each iteration allocates a brand-new String of the
  // running length, then copies every prior character into it.
  const immutabilityChart = `
flowchart LR
    S0["s = &quot;&quot;<br/>len 0"] --> S1["s += a<br/>alloc len 1<br/>copy 0 chars"]
    S1 --> S2["s += b<br/>alloc len 2<br/>copy 1 char"]
    S2 --> S3["s += c<br/>alloc len 3<br/>copy 2 chars"]
    S3 --> S4["s += d<br/>alloc len 4<br/>copy 3 chars"]
    S4 --> S5["...<br/>iter k copies k-1 chars"]
    S5 --> S6["total: 0+1+2+...+(n-1)<br/>= n(n-1)/2<br/>O(n^2)"]
    style S0 fill:#10b981,color:#fff,stroke:#059669
    style S1 fill:#fb923c,color:#fff,stroke:#ea580c
    style S2 fill:#fb923c,color:#fff,stroke:#ea580c
    style S3 fill:#ef4444,color:#fff,stroke:#dc2626
    style S4 fill:#ef4444,color:#fff,stroke:#dc2626
    style S5 fill:#7f1d1d,color:#fff,stroke:#450a0a
    style S6 fill:#7f1d1d,color:#fff,stroke:#450a0a
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 2 · Module {mod.number} · Revision
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 2 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Arrays, strings, linked lists, stacks, queues — every linear-structure pattern compressed to a reference card you can re-read in 15 minutes before an interview.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="phase-2-revision" />
        <ModuleProgress moduleSlug="phase-2-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 2</strong> — every Big-O row, every named pattern, every gotcha from the five previous modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The five modules you&apos;re consolidating:{" "}
          <Link href="/courses/dsa/modules/arrays" className="text-amber-600 hover:underline">Arrays &amp; dynamic arrays</Link>,{" "}
          <Link href="/courses/dsa/modules/strings" className="text-amber-600 hover:underline">Strings</Link>,{" "}
          <Link href="/courses/dsa/modules/linked-lists" className="text-amber-600 hover:underline">Linked lists</Link>,{" "}
          <Link href="/courses/dsa/modules/stacks" className="text-amber-600 hover:underline">Stacks</Link>, and{" "}
          <Link href="/courses/dsa/modules/queues" className="text-amber-600 hover:underline">Queues &amp; deques</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Per-structure Big-O table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Per-structure Big-O table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The numbers you defend in an interview. Note the asterisks — they&apos;re where amortized analysis hides.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Structure</th>
                <th className="px-4 py-3 font-semibold">Access by index</th>
                <th className="px-4 py-3 font-semibold">Search</th>
                <th className="px-4 py-3 font-semibold">Insert</th>
                <th className="px-4 py-3 font-semibold">Delete</th>
                <th className="px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayList</td>
                <td className="px-4 py-3 text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* end / O(n) middle</td>
                <td className="px-4 py-3 text-amber-600">O(n) shift</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">*amortized add-at-end via doubling. Middle ops shift trailing elements.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">String / StringBuilder</td>
                <td className="px-4 py-3 text-emerald-600">O(1) charAt</td>
                <td className="px-4 py-3 text-amber-600">O(n·m) indexOf</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* append (SB)</td>
                <td className="px-4 py-3 text-amber-600">O(n) deleteCharAt (SB)</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">String is immutable — every &quot;modify&quot; is an O(n) copy. Use StringBuilder.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">LinkedList</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1) at ends / O(n) at index</td>
                <td className="px-4 py-3 text-emerald-600">O(1) at ends / O(n) at index</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">O(1) <em>given a node ref</em>. Walking to index k is O(k). Cache-hostile.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayDeque (as stack)</td>
                <td className="px-4 py-3 text-emerald-600">O(1) peek top</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* push</td>
                <td className="px-4 py-3 text-emerald-600">O(1) pop</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">push / pop / peek. Replaces legacy <code>java.util.Stack</code>.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-sans font-semibold">ArrayDeque (as queue)</td>
                <td className="px-4 py-3 text-emerald-600">O(1) peek front</td>
                <td className="px-4 py-3 text-amber-600">O(n)</td>
                <td className="px-4 py-3 text-emerald-600">O(1)* offer</td>
                <td className="px-4 py-3 text-emerald-600">O(1) poll</td>
                <td className="px-4 py-3 font-sans text-xs text-slate-600 dark:text-slate-400">Ring buffer — power-of-two capacity, head / tail indices, no shifting.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Asterisks mark amortized bounds. A single call can spike (e.g. ArrayList resize, ArrayDeque resize, StringBuilder grow), but over a sequence of n adds the total work is O(n).
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — When to pick which */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. When to pick which</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The decision card. Choose by the operation you do most often, not by the structure&apos;s name.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">ArrayList</div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Use when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-2">
              <li>You need random access by index</li>
              <li>You mostly append at the end</li>
              <li>You iterate front-to-back a lot (cache-friendly)</li>
            </ul>
            <div className="text-xs font-semibold text-slate-500 mb-1">Avoid when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>You insert / remove in the middle frequently</li>
              <li>You need O(1) push at the front</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">String / StringBuilder</div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Use when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-2">
              <li>String: keys, returns, immutable handles</li>
              <li>StringBuilder: any mutation in a loop</li>
              <li>char[]: in-place algorithms (palindrome, reverse)</li>
            </ul>
            <div className="text-xs font-semibold text-slate-500 mb-1">Avoid when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Concatenating String with <code>+=</code> in a loop</li>
              <li>Sharing a StringBuilder across threads (use StringBuffer)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">LinkedList</div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Use when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-2">
              <li>You already hold a node reference and need O(1) splice</li>
              <li>You&apos;re implementing LRU cache (doubly-linked list + HashMap)</li>
              <li>You&apos;re building a queue/deque from scratch as a teaching exercise</li>
            </ul>
            <div className="text-xs font-semibold text-slate-500 mb-1">Avoid when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>You need a queue — use ArrayDeque</li>
              <li>You need random access</li>
              <li>Memory or cache locality matters</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">ArrayDeque as Stack</div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Use when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-2">
              <li>Bracket / parenthesis matching</li>
              <li>Postfix / infix expression evaluation</li>
              <li>Monotonic-stack problems (next greater element, daily temps)</li>
              <li>Iterative tree traversal (replace recursion)</li>
            </ul>
            <div className="text-xs font-semibold text-slate-500 mb-1">Avoid when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>You need to scan the middle — that&apos;s not what a stack is for</li>
              <li>Never reach for <code>java.util.Stack</code> — legacy, synchronized</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">ArrayDeque as Queue / Deque</div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Use when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-2">
              <li>BFS frontier</li>
              <li>Sliding-window maximum / minimum</li>
              <li>Producer/consumer with one thread</li>
              <li>You need a queue AND a stack at once</li>
            </ul>
            <div className="text-xs font-semibold text-slate-500 mb-1">Avoid when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>You need thread safety — use <code>ConcurrentLinkedDeque</code> or <code>LinkedBlockingDeque</code></li>
              <li>You need priority ordering — use <code>PriorityQueue</code></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — The 5 named patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The 5 named patterns from this phase</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Five recognition cues. When you see the tell, you know the pattern — no further analysis needed.
        </p>

        <div className="space-y-4">
          {/* Pattern 1 — prefix sums */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pattern 1 · Prefix sums</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Tell:</strong>{" "}repeated range-sum queries on an immutable array — &quot;sum from i to j&quot;, &quot;average over window&quot;, &quot;subarray sum equals k&quot;. Precompute once in O(n), answer each query in O(1).
            </p>
            <CodeBlock lang="java" caption="Range sum in O(1) after O(n) precompute">{`int n = a.length;
int[] prefix = new int[n + 1];          // prefix[0] = 0
for (int i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + a[i];
}
// sum of a[l..r] inclusive = prefix[r+1] - prefix[l]
int rangeSum(int l, int r) { return prefix[r + 1] - prefix[l]; }`}</CodeBlock>
          </div>

          {/* Pattern 2 — two-pointer on sorted */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pattern 2 · Two pointers on sorted data</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Tell:</strong>{" "}array is sorted (or you can sort it) and you&apos;re looking for a <em>pair / triplet</em>{" "}that satisfies a sum or difference condition. Two pointers collapse what would be O(n²) into O(n).
            </p>
            <CodeBlock lang="java" caption="Two-sum on a sorted array">{`// Returns indices [l, r] such that a[l] + a[r] == target, or null.
int[] twoSumSorted(int[] a, int target) {
    int l = 0, r = a.length - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == target) return new int[]{l, r};
        if (s < target) l++;                 // need bigger sum → move left up
        else            r--;                 // need smaller sum → move right down
    }
    return null;
}`}</CodeBlock>
          </div>

          {/* Pattern 3 — dummy-head linked-list trick */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pattern 3 · Dummy-head sentinel</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Tell:</strong>{" "}you&apos;re writing linked-list code where the answer might require <em>removing or replacing the head</em>. Add a fake first node — every real node is now <code>.next</code> of <em>some</em>{" "}node, so insert-at-front and insert-at-middle use the same code.
            </p>
            <CodeBlock lang="java" caption="LC 203 — remove all nodes with value v">{`ListNode removeElements(ListNode head, int v) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == v) prev.next = prev.next.next;  // skip
        else                    prev = prev.next;            // advance
    }
    return dummy.next;          // head may have been removed — that's fine
}`}</CodeBlock>
          </div>

          {/* Pattern 4 — fast/slow pointers */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pattern 4 · Fast / slow pointers</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Tell:</strong>{" "}linked-list problem about <em>middle</em>, <em>cycle</em>, or <em>kᵗʰ-from-end</em>. Walk two pointers, slow steps 1, fast steps 2. When fast falls off, slow is at the middle. If they collide, there&apos;s a cycle.
            </p>
            <CodeBlock lang="java" caption="LC 141 — cycle detection via Floyd's tortoise &amp; hare">{`boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;       // they met inside the cycle
    }
    return false;                             // fast escaped → no cycle
}`}</CodeBlock>
          </div>

          {/* Pattern 5 — monotonic stack */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Pattern 5 · Monotonic stack</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <strong>Tell:</strong> &quot;for each element, find the next/previous greater/smaller&quot; — daily temperatures, next greater element, largest rectangle, trapping rain water. Maintain a stack of <em>indices</em>{" "}in sorted order; each index pushes and pops at most once → O(n) total.
            </p>
            <CodeBlock lang="java" caption="LC 739 — Daily Temperatures">{`int[] dailyTemperatures(int[] T) {
    int n = T.length;
    int[] answer = new int[n];
    Deque<Integer> st = new ArrayDeque<>();   // indices, decreasing temperature
    for (int i = 0; i < n; i++) {
        while (!st.isEmpty() && T[st.peek()] < T[i]) {
            int j = st.pop();
            answer[j] = i - j;                 // i is the first warmer day after j
        }
        st.push(i);
    }
    return answer;                              // unresolved indices keep answer[*] = 0
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — String immutability deep dive */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. String immutability — why <code>s += x</code> is O(n²)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The single most common accidental quadratic. Worth memorizing the picture.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={immutabilityChart} />
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
          Each iteration <code>s += x</code> allocates a brand-new String of the running length and copies every prior character into it. Iteration k copies k−1 characters, so the total work across n iterations is 0 + 1 + 2 + … + (n−1) = n(n−1)/2 — that&apos;s <strong>O(n²)</strong>. <code>StringBuilder</code> uses a doubling internal <code>char[]</code> so append is amortized O(1), and the whole loop is O(n).
        </p>

        <CodeBlock lang="java" caption="BAD — accidental O(n²)">{`// Looks innocent. Is quadratic.
String s = "";
for (String w : words) {
    s += w;                  // each += allocates a new String and copies s
}
return s;`}</CodeBlock>

        <CodeBlock lang="java" caption="GOOD — O(n) via StringBuilder">{`StringBuilder sb = new StringBuilder();
for (String w : words) {
    sb.append(w);            // amortized O(1) per append (internal char[] doubles)
}
return sb.toString();        // one final allocation`}</CodeBlock>

        <Callout variant="warn" title="The compiler does NOT save you here">
          The Java compiler rewrites <code>a + b + c</code> into a single <code>StringBuilder</code> chain — but only within one expression. The moment you put <code>+=</code> inside a loop, each iteration is its own expression, so each gets its own throwaway StringBuilder. The quadratic is real.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/strings" className="text-amber-600 hover:underline">Module 6 — Strings</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Linked-list manipulation rules */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Linked-list manipulation rules</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Three tricks that remove most of the pain from linked-list code. Memorize the snippets — they appear in dozens of derived problems.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">Rule 1 · Add a dummy head whenever the head might change</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Without it, you write a special-case branch for &quot;is this the first node?&quot; in every insert and delete. With it, the head looks like any other node — and you return <code>dummy.next</code> at the end. See Pattern 3 above for the canonical example.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">Rule 2 · In-place reversal is a three-pointer dance</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Hold <code>prev</code>, <code>curr</code>, and <code>next</code>. At each step: remember where you were going, flip <code>curr.next</code> to point at <code>prev</code>, advance both. When <code>curr</code> is null, <code>prev</code> is the new head.
        </p>
        <CodeBlock lang="java" caption="LC 206 — reverse a singly-linked list, iterative">{`ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;     // remember where we were going
        curr.next = prev;               // flip the arrow
        prev = curr;                    // advance prev
        curr = next;                    // advance curr
    }
    return prev;                        // prev is now the new head
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Rule 3 · Fast/slow pointers solve middle, cycle, and kᵗʰ-from-end</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          See Pattern 4 above. The cycle invariant in one line: on an acyclic list, fast always escapes first; on a cyclic list, the gap between fast and slow shrinks by one each iteration inside the cycle, so they must collide. There&apos;s no third option.
        </p>

        <Callout variant="insight" title="The recursion vs iteration tradeoff">
          Recursive linked-list code (reverse, merge) is shorter and reads better — but every recursive call adds a stack frame. On a 10⁶-node list, the recursive version StackOverflows. The iterative versions above are the production answer.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/linked-lists" className="text-amber-600 hover:underline">Module 7 — Linked lists</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Stack vs queue, ArrayDeque wins */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Stack vs queue — and why ArrayDeque beats both alternatives</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The call-stack analogy, the API map, and the one container you should actually reach for.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-5">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Stack — LIFO</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Push at the top, pop from the top, peek at the top. Three operations, all O(1). The JVM&apos;s call stack is literally a stack — each method invocation pushes a frame, each return pops one. That&apos;s why recursive code naturally maps to iterative-with-explicit-stack.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>API on ArrayDeque: <code>push</code>, <code>pop</code>, <code>peek</code></li>
                <li>Used for: matching, expression eval, monotonic patterns, DFS</li>
              </ul>
            </div>

            <div className="p-5 bg-sky-50/40 dark:bg-sky-950/20">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Queue — FIFO</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                Add at the back, remove from the front, peek at the front. Three operations, all O(1) (amortized for add when the ring buffer resizes). Used wherever order-of-arrival matters: BFS, scheduling, request handling.
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                <li>API on ArrayDeque: <code>offer</code>, <code>poll</code>, <code>peek</code></li>
                <li>Used for: BFS, level-order traversal, sliding window, work queues</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Why ArrayDeque, not java.util.Stack or LinkedList</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Container</th>
                <th className="px-4 py-3 font-semibold">Verdict</th>
                <th className="px-4 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">java.util.Stack</td>
                <td className="px-4 py-3 text-rose-600 font-semibold">Avoid</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Legacy JDK 1.0 class, extends <code>Vector</code>, every method synchronized. Slow even single-threaded.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">LinkedList as Deque</td>
                <td className="px-4 py-3 text-amber-600 font-semibold">Avoid</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Two pointers per node, allocation per offer, cache-hostile. Same Big-O on paper, several times slower in practice.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">ArrayDeque</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">Use this</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Power-of-two ring buffer, head/tail indices, no shifting, no per-element allocation. Faster than both alternatives on every operation.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="The one-line muscle memory">
          <code>Deque&lt;E&gt; stack = new ArrayDeque&lt;&gt;();</code> for a stack. <code>Deque&lt;E&gt; queue = new ArrayDeque&lt;&gt;();</code> for a queue. Same class, different verbs. If you remember nothing else from Modules 8 and 9, remember these two lines.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Sources: <Link href="/courses/dsa/modules/stacks" className="text-amber-600 hover:underline">Module 8 — Stacks</Link>,{" "}
          <Link href="/courses/dsa/modules/queues" className="text-amber-600 hover:underline">Module 9 — Queues &amp; deques</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Five gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost real engineers real hours. If you only remember five things from this card, make it these.
        </p>

        <div className="space-y-4">
          {/* Gotcha 1 */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · <code>+=</code> in a String loop</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              See Section 4. The compiler doesn&apos;t save you across iterations. This is the most common accidental O(n²) in real Java code.
            </p>
            <CodeBlock lang="java" caption="BAD — O(n²)">{`String s = "";
for (String w : words) s += w;`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — O(n)">{`StringBuilder sb = new StringBuilder();
for (String w : words) sb.append(w);
String s = sb.toString();`}</CodeBlock>
          </div>

          {/* Gotcha 2 */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · <code>new Stack&lt;&gt;()</code> instead of ArrayDeque</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <code>java.util.Stack</code> extends <code>Vector</code> and synchronizes every method. Even single-threaded, it&apos;s measurably slower than <code>ArrayDeque</code> — and an interviewer who knows Java will silently dock you for using it.
            </p>
            <CodeBlock lang="java" caption="BAD — legacy and synchronized">{`Stack<Integer> st = new Stack<>();
st.push(1);
st.pop();`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — modern, unsynchronized, faster">{`Deque<Integer> st = new ArrayDeque<>();
st.push(1);
st.pop();`}</CodeBlock>
          </div>

          {/* Gotcha 3 */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · LinkedList for random access</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <code>LinkedList.get(i)</code> is O(i). Calling it inside a <code>for</code> loop of size n is O(n²). The for-each loop hides it because it uses an iterator (O(1) per step) — but indexed access does not.
            </p>
            <CodeBlock lang="java" caption="BAD — O(n²) hidden in a clean-looking loop">{`LinkedList<Integer> list = ...;
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));     // O(i) per call → O(n²) total
}`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — iterator is O(1) per step">{`for (int x : list) {                     // implicit iterator
    System.out.println(x);
}`}</CodeBlock>
          </div>

          {/* Gotcha 4 */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · <code>ArrayList.remove(int)</code> vs <code>remove(Integer)</code></div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Java picks the overload by <em>static type</em>. <code>list.remove(2)</code> removes the element <em>at index 2</em>. <code>list.remove(Integer.valueOf(2))</code> removes the first element <em>equal to 2</em>. Mixing them up silently corrupts data.
            </p>
            <CodeBlock lang="java" caption="BAD — surprising overload resolution">{`List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 40));
list.remove(2);          // removes index 2 → element 30. List is now [10, 20, 40].`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — be explicit about what you mean">{`list.remove(Integer.valueOf(2));   // removes the FIRST element equal to 2
// or, for index-based removal, name your variable:
int idx = 2;
list.remove(idx);                   // primitive int → index overload, unambiguous`}</CodeBlock>
          </div>

          {/* Gotcha 5 */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · <code>ArrayList.add(0, x)</code> is O(n)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Inserting at the front of an ArrayList shifts every existing element one slot to the right. In a loop, that&apos;s O(n²). If you need O(1) push-at-front, use an ArrayDeque.
            </p>
            <CodeBlock lang="java" caption="BAD — O(n²) push-at-front loop">{`List<Integer> list = new ArrayList<>();
for (int x : input) list.add(0, x);     // each insert shifts everything → O(n²)`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — O(n) with ArrayDeque (or append + reverse)">{`Deque<Integer> dq = new ArrayDeque<>();
for (int x : input) dq.addFirst(x);     // O(1) per insert → O(n) total

// Alternative: append then reverse, also O(n).`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You need a container that supports O(1) push at the front and O(1) pop at the back. Which Java type do you reach for first?"
          options={[
            { label: "ArrayList", explanation: "ArrayList.add(0, x) is O(n) — every element shifts. Wrong tool." },
            { label: "java.util.Stack", explanation: "Stack only exposes one end (LIFO). And it's legacy and synchronized. Avoid." },
            { label: "ArrayDeque", correct: true, explanation: "Right. ArrayDeque is a ring buffer with O(1) at both ends — addFirst, addLast, pollFirst, pollLast. It's the answer for both stacks AND queues AND general double-ended needs." },
            { label: "LinkedList", explanation: "It works on paper (O(1) at both ends) but it's cache-hostile and allocates per node. ArrayDeque is several times faster in practice." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What is the time complexity of `s += word` inside a for loop of n iterations, building a String?"
          options={[
            { label: "O(n) — the compiler rewrites += into StringBuilder.append", explanation: "The compiler rewrites + within a single expression, not across loop iterations. Each iteration allocates a throwaway String." },
            { label: "O(n²) — each iteration allocates a new String and copies all prior characters", correct: true, explanation: "Right. Iteration k copies k-1 chars, total is 0+1+2+...+(n-1) = n(n-1)/2 → O(n²). This is the most common accidental quadratic in real Java code." },
            { label: "O(n log n) — amortized via StringBuilder's doubling", explanation: "That would be true if String were mutable like StringBuilder. It isn't. Each += creates a fresh String." },
            { label: "O(1) — Strings are interned", explanation: "Interning is about deduplicating identical literals at compile time. It does nothing for runtime concatenation." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="On a singly-linked list, you need to detect whether there's a cycle. Which technique is canonical?"
          options={[
            { label: "Use a HashSet to remember visited nodes — return true on second visit.", explanation: "It works (O(n) time, O(n) space), but fast/slow does the same in O(1) extra space. The interviewer will ask for the constant-space version." },
            { label: "Walk one pointer through the list; if it reaches null, no cycle.", explanation: "If there's a cycle, a single pointer would loop forever — there's no terminating condition." },
            { label: "Floyd's tortoise &amp; hare — two pointers, slow steps 1, fast steps 2. If they meet, there's a cycle.", correct: true, explanation: "Right. Fast escapes (hits null) iff the list is acyclic; inside a cycle, the gap between fast and slow shrinks by 1 each step, so they must collide. O(n) time, O(1) space." },
            { label: "Reverse the list — if you get back to the head, there's a cycle.", explanation: "Reversing a cyclic list is undefined behavior — there's no end to start from." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You see a problem: 'for each element in this array, find the next strictly greater element to the right'. What's your reflex?"
          options={[
            { label: "Nested loops — O(n²).", explanation: "Works as a brute-force baseline. The interviewer wants the linear answer." },
            { label: "Sort the array first.", explanation: "Sorting destroys positions. You need 'next to the right' in the original order." },
            { label: "Monotonic decreasing stack of indices.", correct: true, explanation: "Right. Walk left-to-right, push indices, and whenever the new element is greater than the top of the stack, pop and record. Each index is pushed and popped at most once → O(n) total." },
            { label: "HashMap from value to next-greater value.", explanation: "Duplicates and positional 'next' make this approach fall apart. The question is about indices, not values." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="`list.remove(2)` on `List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 40))` — what's the resulting list?"
          options={[
            { label: "[10, 20, 40] — index 2 (the element 30) was removed", correct: true, explanation: "Right. The literal `2` is an int primitive, which matches the remove(int index) overload. Java picks overloads by static type, so this is index-based removal." },
            { label: "[10, 30, 40] — the first element equal to 2 was removed", explanation: "That would be remove(Integer.valueOf(2)). With a primitive int, Java picks the index overload." },
            { label: "[10, 20, 30, 40] — no element equal to 2 was found", explanation: "Same confusion — `remove(2)` with a primitive is index-based, not value-based." },
            { label: "ClassCastException at runtime", explanation: "No cast involved. Overload resolution is static — it's all decided at compile time." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          Phase 2 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now defend every linear-structure choice on sight</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Five structures, one Big-O table, five named patterns, the immutability trap, the linked-list dance, and the ArrayDeque rule. That&apos;s the entire linear-structure toolkit — every problem from here on out will either compose these or move on to non-linear shapes.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 3 — Hashing &amp; Trees.</strong>{" "}HashMap from the ground up, hash collisions, then binary trees and BSTs. The structures where lookup becomes O(1) or O(log n) instead of O(n).
        </p>
        <Link
          href="/courses/dsa/modules/hashmaps"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Hashing &amp; Trees →
        </Link>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-2-revision" />
    </article>
  );
}
