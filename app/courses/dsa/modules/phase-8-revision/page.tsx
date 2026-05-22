import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/dsa";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. This is the closing
// reference card for Phase 8: tries, union-find, advanced graphs, UMPIRE,
// pattern recognition, and interview-day behavior. Re-read this on the train
// before a mock interview.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase8RevisionModule() {
  const mod = getModuleBySlug("phase-8-revision")!;

  // Small trie holding "car", "cat", "cap" — shared 'ca' prefix.
  const trieShape = `
flowchart TB
    R(("·<br/>root")) --> C(("c"))
    C --> A(("a"))
    A --> T(("t<br/>★"))
    A --> RR(("r<br/>★"))
    A --> P(("p<br/>★"))
    style R fill:#1e293b,color:#fff,stroke:#475569
    style C fill:#fbcfe8,color:#000,stroke:#db2777
    style A fill:#fbcfe8,color:#000,stroke:#db2777
    style T fill:#10b981,color:#fff,stroke:#047857
    style RR fill:#10b981,color:#fff,stroke:#047857
    style P fill:#10b981,color:#fff,stroke:#047857
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 8 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 8 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The closing reference card before mock interviews. Tries, union-find, advanced graphs, UMPIRE, pattern keywords — everything you need within arm&apos;s reach during a live phone screen.
        </p>
        <BookmarkButton courseId="dsa" moduleSlug="phase-8-revision" />
        <ModuleProgress moduleSlug="phase-8-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This is the final reference card. You&apos;ve finished every algorithm and data-structure module in the course; the only thing left between you and a real interview is <em>composing</em>{" "}what you know under time pressure. That&apos;s what this card is for. It&apos;s not a tutorial — it&apos;s the page you keep open in another tab while you do mock interviews, the page you re-read 15 minutes before the real thing.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The five modules you&apos;re consolidating: <Link href="/courses/dsa/modules/tries" className="text-emerald-600 hover:underline">Tries</Link>, <Link href="/courses/dsa/modules/union-find" className="text-emerald-600 hover:underline">Union-Find / DSU</Link>, <Link href="/courses/dsa/modules/advanced-graph" className="text-emerald-600 hover:underline">Advanced graph algorithms</Link>, <Link href="/courses/dsa/modules/interview-framework" className="text-emerald-600 hover:underline">Interview problem-solving framework</Link>, and the <Link href="/courses/dsa/modules/capstone" className="text-emerald-600 hover:underline">Capstone 20-problem set</Link>.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          If anything below feels unfamiliar, jump back to the source module. If it&apos;s all familiar, you&apos;re interview-ready — close the laptop and book a mock.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Already handled by intro above. The "header + intro" */}
      {/* spec collapses sections 1's narrative into header + intro block. */}
      {/* The numbered cards below start at section 2 per the spec.       */}
      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* SECTION 2 — Tries: when and why */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Tries — when and why</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A trie (prefix tree) stores a set of strings as a tree of single-character edges. Shared prefixes share nodes.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={trieShape} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
            Trie holding <code>car</code>, <code>cat</code>, <code>cap</code>. The <code>ca</code> prefix is stored once and shared.
          </p>
        </div>

        <CodeBlock lang="java" caption="The minimal Java node — lowercase-letters-only version">{`class TrieNode {
    TrieNode[] children = new TrieNode[26];   // one slot per lowercase letter
    boolean isEnd;                            // true if a word ends here
}

class Trie {
    private final TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (int i = 0; i < word.length(); i++) {
            int c = word.charAt(i) - 'a';
            if (node.children[c] == null) {
                node.children[c] = new TrieNode();
            }
            node = node.children[c];
        }
        node.isEnd = true;
    }

    public boolean search(String word)   { TrieNode n = walk(word);   return n != null && n.isEnd; }
    public boolean startsWith(String p)  { return walk(p) != null; }

    private TrieNode walk(String s) {
        TrieNode node = root;
        for (int i = 0; i < s.length(); i++) {
            int c = s.charAt(i) - 'a';
            if (node.children[c] == null) return null;
            node = node.children[c];
        }
        return node;
    }
}`}</CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pick a trie when…</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Prefix queries.</strong> &quot;Find every word starting with <code>str</code>&quot; — autocomplete, search-as-you-type.</li>
              <li><strong>Sorted-by-prefix iteration.</strong>{" "}DFS the subtree to enumerate matches in lexical order for free.</li>
              <li><strong>Dictionary-walk algorithms.</strong>{" "}Word Search II, Replace Words — walk the input and the trie in lockstep, pruning whole branches when no child matches.</li>
              <li><strong>Many strings with shared structure.</strong> 500k words averaging 8 chars store roughly N·L characters either way, but the trie collapses shared prefixes, and lookups become independent of N.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Stick with a HashMap when…</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Only exact-match lookups.</strong> <code>HashSet.contains(word)</code> is O(L) too, with no per-node pointer overhead.</li>
              <li><strong>Keys aren&apos;t strings.</strong>{" "}Tries are character-path-shaped; numbers, tuples, and objects don&apos;t fit.</li>
              <li><strong>Memory budget is tight.</strong>{" "}A <code>TrieNode[26]</code> child array costs ~200 bytes per node even if mostly empty. For pure exact-match the hashmap wins by a wide margin on space.</li>
              <li><strong>Simplicity matters more than O(L).</strong>{" "}Map lookup is one line. Trie is a class plus a node class plus a walker — only worth it when prefix queries are in the spec.</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="The one-line decision rule">
          If the problem statement contains the word <em>prefix</em>, <em>autocomplete</em>, <em>starts with</em>, or asks you to enumerate matches in lexical order — reach for a trie. Otherwise, default to <code>HashMap</code> or <code>HashSet</code>.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/tries" className="text-emerald-600 hover:underline">Module 37 — Tries</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Union-Find / DSU reference */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Union-Find / DSU reference</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Disjoint-set union. Two operations — <code>find(x)</code> and <code>union(a, b)</code> — over a partition of <code>0..n-1</code>. With both standard optimizations enabled, every operation is amortized <strong>O(α(n))</strong>, which is &lt; 5 for any input that fits in the universe. Effectively O(1).
        </p>

        <CodeBlock lang="java" caption="Production DSU — path compression + union by size, with a component count for free">{`public class DSU {
    private final int[] parent;
    private final int[] size;
    private int count;             // number of disjoint components

    public DSU(int n) {
        parent = new int[n];
        size   = new int[n];
        for (int i = 0; i < n; i++) {
            parent[i] = i;
            size[i] = 1;
        }
        count = n;
    }

    public int find(int x) {
        // Iterative two-pass — stack-safe even for n = 10^6.
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) {
            int next = parent[x];
            parent[x] = root;          // path compression
            x = next;
        }
        return root;
    }

    /** Returns true iff a and b were in different components and have now been merged. */
    public boolean union(int a, int b) {
        int ra = find(a);
        int rb = find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;               // union by size
        size[ra] += size[rb];
        count--;
        return true;
    }

    public boolean connected(int a, int b) { return find(a) == find(b); }
    public int componentCount()             { return count; }
    public int componentSize(int x)         { return size[find(x)]; }
}`}</CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">Classic uses</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Kruskal&apos;s MST.</strong>{" "}Sort edges, union endpoints if not already connected.</li>
              <li><strong>Connected components.</strong>{" "}Online — answer queries as edges stream in.</li>
              <li><strong>Cycle detection</strong> (undirected). An edge whose endpoints already share a root would close a cycle.</li>
              <li><strong>Accounts Merge / friend circles.</strong>{" "}Anything where the natural question is &quot;same group?&quot;.</li>
              <li><strong>Redundant Connection.</strong>{" "}The first edge whose endpoints are already connected is the answer.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">Why <code>union</code> returns boolean</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              The return bit answers &quot;did this edge bridge two components, or was it redundant?&quot; — exactly the question Kruskal, Redundant Connection, and online cycle detection all ask.
            </p>
            <CodeBlock lang="java">{`// Kruskal in 5 lines
Arrays.sort(edges, (a, b) -> a[2] - b[2]);
DSU dsu = new DSU(n);
int weight = 0;
for (int[] e : edges) {
    if (dsu.union(e[0], e[1])) weight += e[2];
}`}</CodeBlock>
          </div>
        </div>

        <Callout variant="warn" title="The two-pass find is the safe one">
          A recursive <code>find()</code> with path compression looks elegant but blows the stack at n ≈ 10⁴–10⁵ if the tree starts skewed. The two-pass iterative version above achieves full compression with zero recursion depth. Use it.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/union-find" className="text-emerald-600 hover:underline">Module 38 — Union-Find / DSU</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Advanced graph algorithms table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. Advanced graph algorithms at a glance</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Five algorithms cover almost every weighted-graph interview question. Pick by edge weights, problem type, and graph density.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Space</th>
                <th className="px-4 py-3 font-semibold">Negative weights?</th>
                <th className="px-4 py-3 font-semibold">When to reach for it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Dijkstra</td>
                <td className="px-4 py-3 font-mono">O((V+E) log V)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-rose-600">No — silently wrong</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Single-source shortest path, non-negative weights. The default.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Bellman-Ford</td>
                <td className="px-4 py-3 font-mono">O(V·E)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-emerald-600">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Single-source with negative edges, or to detect negative cycles. Also: shortest path with a bounded number of edges (k-stops).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Floyd-Warshall</td>
                <td className="px-4 py-3 font-mono">O(V³)</td>
                <td className="px-4 py-3 font-mono">O(V²)</td>
                <td className="px-4 py-3 text-emerald-600">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">All-pairs shortest paths when V is small (≤ ~400). Transitive closure. Dense graphs.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Kruskal&apos;s MST</td>
                <td className="px-4 py-3 font-mono">O(E log E)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-emerald-600">Yes (MST is about weight order, sign doesn&apos;t matter)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">MST on sparse graphs. Sort edges + DSU. Easier to code than Prim.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Prim&apos;s MST</td>
                <td className="px-4 py-3 font-mono">O((V+E) log V)</td>
                <td className="px-4 py-3 font-mono">O(V)</td>
                <td className="px-4 py-3 text-emerald-600">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">MST on dense graphs, or when edges arrive online. Min-heap of candidate edges.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="The Dijkstra-on-negative-edges trap">
          Dijkstra doesn&apos;t throw on a negative edge — it returns wrong answers, quietly. If the problem hints that a weight could be negative (refunds, deltas, score adjustments), switch to Bellman-Ford before you start coding. Don&apos;t discover this in review.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/advanced-graph" className="text-emerald-600 hover:underline">Module 39 — Advanced graph algorithms</Link> (Dijkstra is reviewed from <Link href="/courses/dsa/modules/shortest-path" className="text-emerald-600 hover:underline">Module 19 — Shortest path</Link>, Phase 4).
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — UMPIRE framework */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. UMPIRE — the live-interview script</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A six-stage pipeline you run for every problem. Under stress, working memory shrinks; UMPIRE answers &quot;what do I do next?&quot; so you can spend your brain on the actual problem.
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">U</span> · Understand</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Restate the problem in your own words. Confirm input/output types, ranges, and at least two edge cases (empty, duplicates, single element). <strong>Good looks like:</strong> &quot;Let me make sure I understand — given an array of N integers where N can be up to 10⁵, and integer values can be negative, return…&quot;</p>
          </div>

          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">M</span> · Match</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Pattern-recognize. Which family does this belong to — two pointers, sliding window, BFS, DP, greedy, graph, trie? <strong>Good looks like:</strong> &quot;This looks like a shortest-path problem on a weighted graph — Dijkstra by default. Are weights non-negative?&quot;</p>
          </div>

          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">P</span> · Plan</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Whiteboard the algorithm in plain English before you touch the keyboard. State the data structures, the invariant, and the target complexity. <strong>Good looks like:</strong> &quot;I&apos;ll keep a min-heap of (distance, node). Pop the closest unfinalized node, relax its neighbors. O((V+E) log V) time, O(V) space.&quot;</p>
          </div>

          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">I</span> · Implement</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Code it. Narrate every nontrivial choice as you go — variable names, why this data structure, why this loop bound. <strong>Good looks like:</strong> &quot;I&apos;m using <code>long</code> for the distance because edge weights can be up to 10⁹ and I might sum V of them.&quot;</p>
          </div>

          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">R</span> · Review</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Trace a small example through the code by hand. Catch off-by-ones, wrong base cases, missing null-checks. <strong>Good looks like:</strong> &quot;Let me walk through with the input <code>[1, 2, 3]</code>… at i=0, low=0, high=2…&quot;</p>
          </div>

          <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/40 dark:bg-pink-950/20 p-4">
            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-1"><span className="font-mono text-base">E</span> · Evaluate</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">State final time and space complexity, and what would change at scale. <strong>Good looks like:</strong> &quot;Time O(N log N) from the sort. Space O(N) for the heap. At N = 10⁹ I&apos;d swap the in-memory sort for an external merge sort or a streaming algorithm.&quot;</p>
          </div>
        </div>

        <Callout variant="insight" title="UMPIRE is the talking script, not a workflow">
          The framework&apos;s value isn&apos;t the order — you may circle back from <em>I</em>{" "}to <em>P</em>{" "}when implementation reveals a flaw. The value is that it gives you <strong>vocabulary the interviewer recognizes</strong>. Saying &quot;let me match this to a pattern&quot; or &quot;before I evaluate, let me trace through one example&quot; signals seniority more than the code itself.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/dsa/modules/interview-framework" className="text-emerald-600 hover:underline">Module 40 — Interview problem-solving framework</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Pattern recognition cheat sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Pattern recognition cheat sheet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The Match stage in one table. Read the keyword in the problem statement → reach for the pattern in the right column.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">If the problem says…</th>
                <th className="px-4 py-3 font-semibold">Reach for…</th>
                <th className="px-4 py-3 font-semibold">Typical complexity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;shortest path on weighted graph&quot;</td>
                <td className="px-4 py-3 font-semibold">Dijkstra (non-negative) / Bellman-Ford (negative)</td>
                <td className="px-4 py-3 font-mono text-xs">O((V+E) log V) / O(V·E)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;shortest path on unweighted graph&quot;</td>
                <td className="px-4 py-3 font-semibold">BFS</td>
                <td className="px-4 py-3 font-mono text-xs">O(V+E)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;all subsets&quot; / &quot;all permutations&quot; / &quot;all combinations&quot;</td>
                <td className="px-4 py-3 font-semibold">Backtracking</td>
                <td className="px-4 py-3 font-mono text-xs">O(2ⁿ) / O(n!)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;maximum subarray sum&quot; / &quot;contiguous subarray with property X&quot;</td>
                <td className="px-4 py-3 font-semibold">Kadane / 1D DP</td>
                <td className="px-4 py-3 font-mono text-xs">O(n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;prefix queries&quot; / &quot;autocomplete&quot; / &quot;starts with&quot;</td>
                <td className="px-4 py-3 font-semibold">Trie</td>
                <td className="px-4 py-3 font-mono text-xs">O(L) per op</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;merge overlapping intervals&quot; / &quot;meeting rooms&quot;</td>
                <td className="px-4 py-3 font-semibold">Sort by start + sweep</td>
                <td className="px-4 py-3 font-mono text-xs">O(n log n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;k-th largest / smallest&quot; / &quot;top-k&quot;</td>
                <td className="px-4 py-3 font-semibold">Heap (PriorityQueue) of size k</td>
                <td className="px-4 py-3 font-mono text-xs">O(n log k)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;detect cycle in an undirected graph&quot; / &quot;groups / components&quot;</td>
                <td className="px-4 py-3 font-semibold">Union-Find (DSU) or DFS</td>
                <td className="px-4 py-3 font-mono text-xs">O(E · α(V))</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;detect cycle in a directed graph&quot; / &quot;course schedule&quot;</td>
                <td className="px-4 py-3 font-semibold">DFS with 3-color marking, or Kahn&apos;s topological sort</td>
                <td className="px-4 py-3 font-mono text-xs">O(V+E)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;longest substring with constraint&quot; / &quot;at most K distinct&quot;</td>
                <td className="px-4 py-3 font-semibold">Sliding window (two pointers)</td>
                <td className="px-4 py-3 font-mono text-xs">O(n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;pair sums to target in sorted array&quot;</td>
                <td className="px-4 py-3 font-semibold">Two pointers</td>
                <td className="px-4 py-3 font-mono text-xs">O(n)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;find element in sorted array&quot; / &quot;minimize max&quot; / &quot;find threshold&quot;</td>
                <td className="px-4 py-3 font-semibold">Binary search (on array, or on the answer)</td>
                <td className="px-4 py-3 font-mono text-xs">O(log n) / O(n log V)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;edit distance&quot; / &quot;LCS&quot; / &quot;match two sequences&quot;</td>
                <td className="px-4 py-3 font-semibold">2D DP</td>
                <td className="px-4 py-3 font-mono text-xs">O(n·m)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;minimum spanning tree&quot; / &quot;connect all with minimum cost&quot;</td>
                <td className="px-4 py-3 font-semibold">Kruskal (sparse) / Prim (dense)</td>
                <td className="px-4 py-3 font-mono text-xs">O(E log E) / O((V+E) log V)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">&quot;LRU cache&quot; / &quot;evict least recently used&quot;</td>
                <td className="px-4 py-3 font-semibold">HashMap + doubly linked list (or LinkedHashMap)</td>
                <td className="px-4 py-3 font-mono text-xs">O(1) per op</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="Use this as your Match-stage prompt">
          When you read a problem in an interview, scan it for the words in the left column. The Match stage is over in 10 seconds, not five minutes — once a keyword fires, name the pattern out loud and move to Plan.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Communicate while coding */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Communicate-while-coding — the exact phrases</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The interviewer doesn&apos;t grade the code on the screen — they grade the engineer they&apos;d trust on a Slack thread at midnight. These are the phrases that signal &quot;senior&quot; at each UMPIRE phase.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Understand</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;Let me restate to make sure I have it right…&quot;</li>
              <li>&quot;What&apos;s the maximum N? And the value range?&quot;</li>
              <li>&quot;Can the input be empty? Can it contain duplicates?&quot;</li>
              <li>&quot;Is this a one-shot call or a hot path?&quot;</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Match</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;This smells like a sliding-window problem because…&quot;</li>
              <li>&quot;The mention of &lsquo;shortest path&rsquo; on weighted edges makes me think Dijkstra.&quot;</li>
              <li>&quot;Before optimizing, let me make sure brute force would even work — N is 30, so 2ⁿ is fine.&quot;</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Plan</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;I&apos;ll use a HashMap from value → index, scan once. O(n) time, O(n) space.&quot;</li>
              <li>&quot;The invariant I&apos;ll maintain is: <em>everything left of <code>i</code> is already sorted.</em>&quot;</li>
              <li>&quot;Edge case: if the input is empty I&apos;ll return early.&quot;</li>
              <li>&quot;Does this approach sound reasonable before I implement?&quot;</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Implement</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;I&apos;m using <code>long</code> here because the sum can exceed <code>Integer.MAX_VALUE</code>.&quot;</li>
              <li>&quot;This is a strictly-less-than because the right index is exclusive.&quot;</li>
              <li>&quot;I&apos;ll factor this out into a helper for readability — would you prefer it inline?&quot;</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Review</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;Let me trace through with <code>[1, 2, 3]</code> step by step.&quot;</li>
              <li>&quot;At i = 0, low = 0, high = 2, mid = 1…&quot;</li>
              <li>&quot;The empty-input case: the loop never enters, and we return 0. Good.&quot;</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-600 mb-2">During Evaluate</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-5">
              <li>&quot;Time: O(n log n) from the sort, which dominates.&quot;</li>
              <li>&quot;Space: O(n) for the heap, plus O(log n) for recursion.&quot;</li>
              <li>&quot;If N grew to 10⁹, this wouldn&apos;t fit in memory — I&apos;d move to external sort.&quot;</li>
              <li>&quot;One improvement I&apos;d make on a second pass: replace the recursion with an explicit stack.&quot;</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="The single most senior-sounding sentence">
          &quot;Let me start with brute force to make sure I understand the problem, then optimize.&quot; It buys you time, demonstrates discipline, and gives you a working baseline to reason about. Almost every staff-level candidate says some version of this; almost no junior candidate does.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Interview-day gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Interview-day gotchas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Five behaviors that tank otherwise-strong candidates. Each one is fixable in one sentence.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Coding before clarifying input bounds</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-rose-700 dark:text-rose-300">BAD:</strong> &quot;Got it.&quot; <em>(starts typing)</em></p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-300">GOOD:</strong> &quot;Before I code — what&apos;s the max N? Can values be negative? Empty input? Duplicates allowed?&quot; Knowing N is 30 vs 10⁹ changes whether brute force is acceptable.</p>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Not stating Big-O before implementing</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-rose-700 dark:text-rose-300">BAD:</strong>{" "}Write the code first, then the interviewer asks for complexity and you discover it&apos;s O(n³) and panic.</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-300">GOOD:</strong> &quot;My plan is O(n log n) time, O(n) space — does that meet the bar before I write it?&quot; If they say &quot;can you do better?&quot;, you&apos;ve saved 10 minutes of wasted typing.</p>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Silent debugging</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-rose-700 dark:text-rose-300">BAD:</strong>{" "}Two minutes of staring at the screen in total silence after a test case fails.</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-300">GOOD:</strong> &quot;That output looks off — let me trace through. At i=2 we should have low=1, but the code has low=2… ah, I&apos;m updating low before the check. Let me move that line.&quot; Talk while you debug; the interviewer is grading the process, not just the result.</p>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Skipping brute force for the &quot;clever&quot; solution</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-rose-700 dark:text-rose-300">BAD:</strong>{" "}Spend 15 minutes trying to remember the O(n) trick, fail, run out of time with nothing on the screen.</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-300">GOOD:</strong> &quot;The brute force here is O(n²) with nested loops. Let me write that first, then we can optimize.&quot; A working O(n²) beats a broken O(n) every single time. Most interviewers will accept the brute force and ask &quot;can you do better?&quot; — and you now have a baseline to build on.</p>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Not asking for hints when stuck</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong className="text-rose-700 dark:text-rose-300">BAD:</strong>{" "}Spiral in silence for five minutes, hoping inspiration strikes.</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-emerald-700 dark:text-emerald-300">GOOD:</strong> &quot;I&apos;m considering two approaches — a hashmap pass or a sort + two pointers. Is there a simpler angle I&apos;m missing?&quot; Asking for a nudge is normal collaboration. Silence is what eats your score.</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five interview-meta recall checks. No XP, no gating. If you blank on one of these, re-read the source module before booking a mock.
        </p>

        <Quiz
          kind="Recall check"
          question="An interviewer asks for the optimal solution and you only have brute force. What do you do?"
          options={[
            { label: "Stay silent and keep trying to find the optimal — admitting you only have brute force hurts your score.", explanation: "Silence is what hurts the score. Interviewers actively prefer a candidate who delivers working brute force and discusses tradeoffs over one who freezes." },
            { label: "Write the brute force, state its complexity, and explicitly ask 'is this acceptable, or should I keep optimizing?'", correct: true, explanation: "Right. A working O(n²) beats a broken O(n) every time. Stating its complexity and asking the interviewer to confirm the bar buys time, demonstrates discipline, and gives you a baseline to optimize from. Most loops grade better with this approach than with a panicked optimal attempt." },
            { label: "Refuse to write brute force on principle — it sends the wrong signal.", explanation: "The opposite. Pretending you don't see the brute force sends the wrong signal: that you can't reason about a problem incrementally." },
            { label: "Pseudo-code the optimal solution without implementing — the interviewer will give partial credit.", explanation: "Without working code, partial credit is small. A complete brute force is worth more than an incomplete optimal." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're choosing between a Trie and a HashSet for storing a dictionary of 100k words. The only operation you need is `contains(word)`. Which is the right call, and why?"
          options={[
            { label: "Trie — it's O(L) per lookup, which is strictly better than HashSet's O(L) hash computation.", explanation: "Both are O(L) per lookup. They're asymptotically equivalent for exact-match. The decision must come from elsewhere." },
            { label: "HashSet — same asymptotic lookup cost, far simpler code, much less memory overhead per node.", correct: true, explanation: "Right. Both lookups touch L characters (Trie walks them; HashSet hashes them). HashSet wins on simplicity (one line instead of a class), memory (no TrieNode[26] per node), and is the senior-engineer default when prefix queries aren't in the spec. Pick Trie only when you need prefix queries, sorted-by-prefix iteration, or DFS-on-trie algorithms like Word Search II." },
            { label: "Trie — it scales better with dictionary size.", explanation: "Both are independent of N for exact lookup. Trie's structural advantage is for *prefix* queries, not exact match." },
            { label: "It doesn't matter — they're equivalent.", explanation: "They have the same asymptotic complexity but very different constant factors and code size. HashSet is unambiguously the right default for exact-match-only." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="During an interview you write Dijkstra's algorithm. The interviewer says 'what if one of the edge weights could be negative?' What's the right response?"
          options={[
            { label: "Dijkstra still works as long as there's no negative cycle.", explanation: "That's Bellman-Ford's behavior, not Dijkstra's. Dijkstra silently returns wrong answers on negative weights even without cycles — once a node is finalized it never reconsiders, but a negative edge later might have produced a shorter path." },
            { label: "Dijkstra throws an exception on negative weights, so we'd need to filter them first.", explanation: "Java's PriorityQueue accepts any int. Dijkstra silently produces wrong answers — no exception is thrown. That silent failure mode is exactly why this is a trap." },
            { label: "Dijkstra would silently return wrong answers — once a node is finalized it's never revisited, so a later negative edge can't fix the distance. We'd switch to Bellman-Ford, which is O(V·E) and handles negative weights correctly.", correct: true, explanation: "Right. This is the exact answer the interviewer is fishing for: name the failure mode (silent wrong answers), explain the mechanism (finalization without revisit), and propose the correct replacement (Bellman-Ford) with its complexity. Demonstrates you understand the precondition, not just the algorithm." },
            { label: "Run Dijkstra, then offset all weights by a positive constant so they're non-negative.", explanation: "Tempting but incorrect. Adding a constant to every edge weight changes path costs by a different amount depending on path length, so shortest paths can be reordered. This is a classic wrong-answer trap." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're 10 minutes into a 45-minute interview and stuck on the Match stage — you can't pattern-match the problem to anything you've seen. What's the highest-value move?"
          options={[
            { label: "Keep silent and brute-force it; the interviewer will guide you if needed.", explanation: "Interviewers don't volunteer hints to silent candidates. Silence reads as 'doesn't know what to do', not 'thinking hard'." },
            { label: "State your candidate patterns out loud and ask for a nudge: 'I'm between two approaches — sliding window or two-pointer. Is there an angle I'm missing?'", correct: true, explanation: "Right. Verbalizing your candidate patterns (a) demonstrates pattern vocabulary even when you're stuck, (b) gives the interviewer something to react to, and (c) explicitly invites collaboration. The hint you get back is often enough to unblock you, and the move itself signals senior behavior — engineers in production also ask for help out loud." },
            { label: "Admit you don't know and ask for a different problem.", explanation: "Almost never the right call. Interviewers grade the *process* on the assigned problem — switching problems is a much worse signal than struggling productively." },
            { label: "Move on to coding something — any code on the screen is better than no code.", explanation: "Coding before you have a plan produces work you'll have to throw away, and it cuts off the conversation that would have unblocked you. State the dilemma first." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You finish implementing your solution with 8 minutes left in the interview. The code compiles and you've traced through one example. What's the most valuable use of the remaining time?"
          options={[
            { label: "Stay silent and wait for the interviewer to ask the next question — they're driving.", explanation: "Eight minutes is a lot of unclaimed time. The strongest candidates use it; weaker candidates leave it on the table." },
            { label: "Trace through one or two more edge cases out loud (empty input, single element, all duplicates) and then state final complexity plus what would change at scale.", correct: true, explanation: "Right. This is the Review + Evaluate stages of UMPIRE done properly. Catching one bug in the remaining time is worth more than any new code you could write. Stating complexity and what would change at scale ('at N=10⁹ I'd switch to external sort') signals seniority — junior candidates often skip this step entirely." },
            { label: "Refactor the variable names for clarity.", explanation: "Cosmetic. Edge cases and final complexity discussion are far higher-value uses of the time." },
            { label: "Start implementing an alternative solution to show range.", explanation: "Risky — running out of time mid-rewrite is much worse than ending with a polished single solution. Save 'range' for the discussion, not the keyboard." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / closing */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          Course complete
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You&apos;re done with DSA in Java.</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Forty-two modules. Eight phases. Big-O from first principles, every linear and non-linear data structure, the full graph and DP toolkits, advanced algorithms, and the interview framework that ties it together. You have the vocabulary, the patterns, and the muscle memory.
        </p>
        <p className="mb-5 text-slate-700 dark:text-slate-300">
          The only thing left is reps. Book a mock interview this week. Then book another one. The capstone problem set is twenty mixed problems that map across every phase you&apos;ve completed — treat it as your final stress test before going live.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/courses/dsa"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition no-underline"
          >
            ← Back to course overview
          </Link>
          <Link
            href="/courses/dsa/modules/capstone"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Try the capstone problem set →
          </Link>
        </div>
      </section>
        <ModuleNav courseId="dsa" currentSlug="phase-8-revision" />
    </article>
  );
}
