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
  { id: "setup", title: "What 'sliding window' really means" },
  { id: "fixed", title: "Fixed-size window (the easy half)" },
  { id: "variable", title: "Variable-size window, expand and contract" },
  { id: "freq-map", title: "Window + frequency map: the killer combo" },
  { id: "project", title: "Project: Minimum Window Substring" },
  { id: "final", title: "Final quiz" },
];

export default function SlidingWindowModule() {
  const mod = getModuleBySlug("sliding-window")!;

  // Setup picture: brute force vs window — same subarray, two ways of looking at it
  const windowSlide = `
flowchart TB
    subgraph BR["Brute force · O(n²) · recompute every subarray sum"]
        direction LR
        B0["[2 1 5] 1 3 2"]
        B1["2 [1 5 1] 3 2"]
        B2["2 1 [5 1 3] 2"]
        B3["2 1 5 [1 3 2]"]
    end
    subgraph WIN["Sliding window · O(n) · slide and patch"]
        direction LR
        W0["[2 1 5] 1 3 2<br/>sum = 8"]
        W1["2 [1 5 1] 3 2<br/>sum = 8 - 2 + 1 = 7"]
        W2["2 1 [5 1 3] 2<br/>sum = 7 - 1 + 3 = 9"]
        W3["2 1 5 [1 3 2]<br/>sum = 9 - 5 + 2 = 6"]
    end
    BR --> WIN
    style BR fill:#fee2e2,color:#000,stroke:#dc2626
    style WIN fill:#dcfce7,color:#000,stroke:#16a34a
    style W0 fill:#a7f3d0,color:#000
    style W1 fill:#a7f3d0,color:#000
    style W2 fill:#a7f3d0,color:#000
    style W3 fill:#a7f3d0,color:#000
  `.trim();

  // Variable-size window trace on "abcabcbb"
  const variableTrace = `
flowchart TB
    subgraph S0["l=0 r=0 · window 'a' · seen={a} · best=1"]
        direction LR
        A0["[a] b c a b c b b"]
    end
    subgraph S1["l=0 r=1 · window 'ab' · seen={a,b} · best=2"]
        direction LR
        A1["[a b] c a b c b b"]
    end
    subgraph S2["l=0 r=2 · window 'abc' · seen={a,b,c} · best=3"]
        direction LR
        A2["[a b c] a b c b b"]
    end
    subgraph S3["l=0 r=3 · 'a' duplicate! contract until invariant restored"]
        direction LR
        A3["[a b c a] b c b b<br/>shrink l → 1, drop 'a'"]
    end
    subgraph S4["l=1 r=3 · window 'bca' · seen={b,c,a} · best still 3"]
        direction LR
        A4["a [b c a] b c b b"]
    end
    subgraph S5["…continues. r expands; whenever invariant breaks, l contracts."]
        direction LR
        A5["each char enters once, leaves once → O(n)"]
    end
    S0 --> S1 --> S2 --> S3 --> S4 --> S5
    style S0 fill:#dbeafe,color:#000,stroke:#2563eb
    style S1 fill:#dbeafe,color:#000,stroke:#2563eb
    style S2 fill:#dbeafe,color:#000,stroke:#2563eb
    style S3 fill:#fef3c7,color:#000,stroke:#d97706
    style S4 fill:#dcfce7,color:#000,stroke:#16a34a
    style S5 fill:#e0e7ff,color:#000,stroke:#6366f1
  `.trim();

  // Frequency map + formed counter for Minimum Window Substring
  const freqMap = `
flowchart LR
    subgraph N["need (built once from t)"]
        direction TB
        N1["A → 1"]
        N2["B → 1"]
        N3["C → 1"]
    end
    subgraph H["have (window's running counts)"]
        direction TB
        H1["A → 1"]
        H2["B → 2"]
        H3["C → 1"]
    end
    N --> F
    H --> F
    F["formed counter<br/>= # of keys k where<br/>have[k] >= need[k]<br/><br/>when formed == need.size()<br/>→ window is valid<br/>→ try to contract"]
    style N fill:#fef3c7,color:#000,stroke:#d97706
    style H fill:#dbeafe,color:#000,stroke:#2563eb
    style F fill:#dcfce7,color:#000,stroke:#16a34a
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <BookmarkButton courseId="dsa" moduleSlug="sliding-window" />
      <ModuleProgress moduleSlug="sliding-window" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300">
          ← Back to Data Structures and Algorithms
        </Link>
        <div className="mt-2 block w-fit rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 6 · Module 24 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~2–2.5h · the technique that turns O(n²) into O(n)</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="setup" title="I see when sliding window is the right tool" xp={20}>
      <section>
        <h2 id="setup">What &apos;sliding window&apos; really means</h2>

        <p>
          Sliding window is the technique you reach for when the question is about a{" "}
          <strong>contiguous subarray or substring</strong>{" "}and the brute force is &quot;try every
          subarray.&quot; The brute force is O(n²) because there are n² subarrays. The window is O(n)
          because each element enters the window once and leaves once, a 2n bound on the total work, no
          matter how the indices wiggle.
        </p>

        <p>
          The mental shift is from <em>recomputing</em>{" "}to <em>patching</em>. When the window slides one
          step right, you don&apos;t recalculate the sum (or count, or whatever) from scratch. You add the
          one new element and subtract the one that just left. Constant work per step. n steps. Done.
        </p>

        <Mermaid chart={windowSlide} />

        <h3>The contiguous tell</h3>

        <p>
          If the problem mentions any of these phrases, your first thought should be sliding window:
        </p>

        <ul>
          <li>&quot;<strong>contiguous</strong>{" "}subarray of length k&quot;</li>
          <li>&quot;<strong>substring</strong>{" "}with property P&quot;</li>
          <li>&quot;longest / shortest / max / min <strong>window</strong>{" "}such that…&quot;</li>
          <li>&quot;at most K distinct&quot; / &quot;exactly K&quot; / &quot;all unique&quot;</li>
          <li>&quot;sum / average / count of a sliding range&quot;</li>
        </ul>

        <p>
          The word <em>contiguous</em>{" "}is the load-bearing one. If the problem allows non-contiguous
          subsets (e.g., &quot;pick any K elements&quot;), this technique does not apply, you&apos;re
          probably looking at a heap, a sort, or DP. The window only works because the indices move
          monotonically: <code>l</code> never goes left, <code>r</code> never goes left.
        </p>

        <h3>The invariant pattern</h3>

        <p>
          Every sliding-window solution can be expressed in one sentence:
          <strong> &quot;the window <code>[l..r]</code> always satisfies property P.&quot;</strong>{" "}P is
          something like &quot;all characters distinct,&quot; &quot;sum ≤ target,&quot; or &quot;contains
          at most K distinct values.&quot; The whole algorithm is just two moves that maintain P:
        </p>

        <ul>
          <li><strong>Expand</strong>, move <code>r</code> right, admit a new element. P may break.</li>
          <li><strong>Contract</strong>, move <code>l</code> right, evict the leftmost element. Repeat until P holds again.</li>
        </ul>

        <p>
          The choice of when to expand vs contract is what distinguishes the &quot;fixed&quot; and
          &quot;variable&quot; flavors. Fixed: expand once per step, then contract once if the window is
          too big. Variable: expand always, contract <em>while</em>{" "}P is broken.
        </p>

        <Callout variant="insight" title="Why the amortized cost is O(n), not O(n²)">
          <p>
            The contract loop looks scary, &quot;while P is broken, advance l&quot; can run many times
            in a single iteration. So why isn&apos;t the total cost O(n²)?
          </p>
          <p>
            Because <code>l</code> only ever moves right. Across the entire run, <code>l</code> advances
            at most n times total, not n times per step. Same for <code>r</code>. Two pointers, each
            making at most n moves, regardless of how the inner loop interleaves. Total: 2n. The cost is
            <em> amortized</em>, averaged across all iterations, and that&apos;s the magic.
          </p>
        </Callout>

        <h3>What it&apos;s <em>not</em></h3>

        <ul>
          <li><strong>Not for non-contiguous problems.</strong> &quot;Pick any K elements summing to X&quot;, no window. Subsets aren&apos;t contiguous.</li>
          <li><strong>Not for problems where the answer involves arbitrary index pairs.</strong>{" "}Two Sum on an unsorted array is hash table, not window.</li>
          <li><strong>Not always the right tool even for contiguous problems.</strong> &quot;Subarray with sum equal to K&quot; with <em>negative numbers</em>{" "}can&apos;t use a window, adding a number doesn&apos;t monotonically grow the sum, so you can&apos;t decide when to contract. Prefix sums + hash map is the move there.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Which problem is a textbook sliding-window candidate?"
          options={[
            { label: "Find any two indices in an unsorted array whose values sum to a target.", explanation: "The pair isn't required to be contiguous. This is Two Sum, a hash-map problem, not a window problem." },
            { label: "Find the longest substring of s containing at most K distinct characters.", correct: true, explanation: "Right. 'Longest substring with property P' is the canonical variable-window setup. P here is 'window has at most K distinct chars.' Expand right; when distinct count exceeds K, contract left until it's back at K." },
            { label: "Pick any K elements from an array to maximize their sum.", explanation: "Non-contiguous, pick any K. That's a sort or a heap problem, not a window." },
            { label: "Subarray with sum exactly K, where the array can include negative numbers.", explanation: "Tempting! But negatives break monotonicity, adding an element can decrease the sum, so you can't decide when to contract. Use prefix sums + hash map instead." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why is the total cost of a variable-size sliding window O(n) and not O(n²), even though the contract loop can run multiple times per outer iteration?"
          options={[
            { label: "Because the contract loop is bounded by a constant.", explanation: "It isn't, in some iterations it runs zero times, in others it runs many. The bound is amortized." },
            { label: "Because both l and r only move right; across the entire run each makes at most n moves, totaling 2n.", correct: true, explanation: "Right. Amortized analysis: count moves of each pointer across the whole run, not per outer step. l moves right at most n times total. r moves right at most n times total. Inner loop iterations are 'paid for' by future l-advances we won't have to make. Sum: O(n)." },
            { label: "Because we cap the inner loop at log n.", explanation: "There's no log cap. The bound comes from monotonicity of the pointers, not from a hardcoded limit." },
            { label: "Because Java's HashMap is O(1).", explanation: "HashMap performance helps, but the O(n) bound is about pointer movement, not about per-op cost." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Fixed window ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="fixed" title="I can write fixed-size sliding window in my sleep" xp={25}>
      <section>
        <h2 id="fixed">Fixed-size window (the easy half)</h2>

        <p>
          Fixed-size window problems hand you a number K up front: &quot;subarray of length exactly
          K.&quot; The window never grows or shrinks, it just slides. The algorithm has two phases:
          <em> prime</em>{" "}the first K elements to compute the initial value, then <em>slide</em>{" "}by
          repeatedly adding the new element on the right and subtracting the one falling off on the left.
        </p>

        <h3>Canonical: LC 643 · Maximum Average Subarray I</h3>

        <p>
          Given an array <code>nums</code> and an integer <code>k</code>, find the contiguous subarray of
          length <code>k</code> with the largest average. Brute force: try every starting index, sum K
          elements each time. O(n·k). Sliding window: O(n).
        </p>

        <CodeBlock lang="java">{`public double findMaxAverage(int[] nums, int k) {
    long sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];   // prime the first window
    long best = sum;

    for (int r = k; r < nums.length; r++) {
        sum += nums[r];           // admit the new right element
        sum -= nums[r - k];       // evict the one falling off the left
        if (sum > best) best = sum;
    }
    return best / (double) k;
}`}</CodeBlock>

        <Callout variant="info" title="Why long, not int">
          <p>
            The problem says values can be up to ±10⁴ and k up to 10⁵. That&apos;s a sum up to 10⁹, within
            int range, but uncomfortably close.
          </p>
          <p>
            Use <code>long</code> for sums whenever you have any doubt; a wrong answer from silent overflow
            is the most painful kind of bug because nothing throws.
          </p>
        </Callout>

        <h3>The two-phase template</h3>

        <p>
          Memorize this skeleton, every fixed-window problem fits it:
        </p>

        <CodeBlock lang="java">{`// Phase 1: build the first window
T state = initialState();
for (int i = 0; i < k; i++) {
    state.add(nums[i]);
}
// record the initial answer
T answer = state;

// Phase 2: slide
for (int r = k; r < nums.length; r++) {
    state.add(nums[r]);          // admit right
    state.remove(nums[r - k]);   // evict left
    answer = combine(answer, state);
}`}</CodeBlock>

        <p>
          The <code>state</code> can be a sum, a count, a HashMap of frequencies, a multiset, anything,
          as long as <em>add</em>{" "}and <em>remove</em>{" "}are O(1) (or amortized O(1)). That&apos;s what
          keeps the whole loop linear.
        </p>

        <Mermaid chart={windowSlide} />

        <h3>Variations you&apos;ll see</h3>

        <ul>
          <li><strong>Max sum subarray of size K</strong>, same code, return <code>best</code> instead of <code>best / k</code>.</li>
          <li><strong>Average of all windows of size K</strong>, collect each <code>sum / k</code> as you go (LC 1343 in spirit).</li>
          <li><strong>Number of vowels in size-K substrings</strong>, <code>state</code> is the vowel count; add 1 if new char is a vowel, subtract 1 if the falling-off char was. (LC 1456.)</li>
          <li><strong>Permutation in string / Find all anagrams</strong>, fixed window of size <code>p.length()</code>; <code>state</code> is a 26-int frequency array; check equality after each slide. (LC 567, LC 438.)</li>
        </ul>

        <Callout variant="warn" title="Don't recompute the answer inside the slide">
          <p>
            A common wrong-O bug: recomputing the sum from <code>nums[r-k+1..r]</code> on every step.
            That&apos;s O(k) per slide, back to O(n·k).
          </p>
          <p>
            The <em>whole point</em>{" "}of the window is that you maintain the state incrementally with one
            addition and one subtraction per step. If your inner loop touches more than a constant number
            of elements, you&apos;ve lost the win.
          </p>
        </Callout>

        <Quiz
          kind="Fixed-window check"
          question="In the fixed-window slide loop, what's the canonical body when k = 3 and the loop variable r starts at 3?"
          options={[
            { label: "sum += nums[r]; (no eviction)", explanation: "You'd grow the window forever. Need to evict the leftmost element, the one at index r-k." },
            { label: "sum += nums[r]; sum -= nums[r - k];", correct: true, explanation: "Right. Admit the new right (nums[r]), evict the one falling off the left (nums[r-k]). Net change: window slid by one. Constant work per step." },
            { label: "sum -= nums[r - k]; sum += nums[r - 1];", explanation: "Off-by-one: nums[r-1] is already in the window from the previous step. The new arrival is nums[r]." },
            { label: "for (int i = r-k+1; i <= r; i++) sum += nums[i];", explanation: "That recomputes the entire sum each iteration, O(k) per step, total O(n·k). The whole point of the window is to avoid this." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Variable window ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="variable" title="I can expand and contract a variable-size window correctly" xp={30}>
      <section>
        <h2 id="variable">Variable-size window, expand and contract</h2>

        <p>
          The variable window is where the technique earns its reputation. The window grows and shrinks
          as the data demands. The structure of every variable-window solution is the same:
        </p>

        <CodeBlock lang="plain">{`for r = 0 .. n-1:
    expand: admit nums[r] into the window state
    while invariant P is broken:
        contract: evict nums[l] from the state; l++
    record the answer (window [l..r] now satisfies P)`}</CodeBlock>

        <p>
          The only thing you need to design per problem is what P is and how to detect that P is broken.
          Once you have that, the loop body writes itself.
        </p>

        <h3>Canonical: LC 3 · Longest Substring Without Repeating Characters</h3>

        <p>
          Given a string <code>s</code>, return the length of the longest substring with no repeated
          characters. The invariant: <strong>the window contains no duplicates.</strong>{" "}Detection: a
          HashSet (or a HashMap of last-seen indices). When admitting <code>s[r]</code> creates a
          duplicate, contract from the left until it&apos;s gone.
        </p>

        <CodeBlock lang="java">{`public int lengthOfLongestSubstring(String s) {
    Set<Character> window = new HashSet<>();
    int l = 0, best = 0;

    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        // Contract until the duplicate is gone — only THEN can we admit c.
        while (window.contains(c)) {
            window.remove(s.charAt(l));
            l++;
        }
        window.add(c);
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <Mermaid chart={variableTrace} />

        <h3>The expand-then-contract order</h3>

        <p>
          Read the loop carefully. The contract step happens <em>before</em>{" "}we commit the admission of{" "}
          <code>s[r]</code>. That order matters: we&apos;re asking &quot;if I admit this, does the
          invariant break?&quot; and shrinking proactively until it won&apos;t.
        </p>

        <p>
          An equivalent and equally common style is &quot;admit first, then fix&quot;:
        </p>

        <CodeBlock lang="java">{`for (int r = 0; r < s.length(); r++) {
    char c = s.charAt(r);
    // Admit first.
    // (For Set<Character>, we'd add and then while the set has dupes, contract.
    //  HashMap<Character,Integer> of counts is more natural for "admit-first" style:)
    count.merge(c, 1, Integer::sum);
    while (count.get(c) > 1) {        // invariant broken? contract.
        char left = s.charAt(l++);
        count.merge(left, -1, Integer::sum);
    }
    best = Math.max(best, r - l + 1);
}`}</CodeBlock>

        <Callout variant="insight" title="Two styles, same algorithm">
          <p>
            &quot;Contract-then-admit&quot; (the Set version above) and &quot;admit-then-contract&quot;
            (the Map version) are equivalent up to which data structure makes the invariant check
            cleanest. Pick whichever reads better for the specific invariant.
          </p>
          <p>
            Rule of thumb: if the invariant is &quot;no duplicates,&quot; a Set with contract-then-admit
            is shortest. If the invariant involves counts (&quot;at most K of any character,&quot;
            &quot;sum ≤ target,&quot; &quot;at most K distinct&quot;), a HashMap with
            admit-then-contract is more natural.
          </p>
        </Callout>

        <h3>The optimization with last-seen indices</h3>

        <p>
          You can speed up LC 3 slightly by storing the last seen index of each character and jumping{" "}
          <code>l</code> directly past the duplicate, rather than contracting one step at a time. Same
          O(n) bound, smaller constant.
        </p>

        <CodeBlock lang="java">{`public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> lastSeen = new HashMap<>();
    int l = 0, best = 0;

    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (lastSeen.containsKey(c) && lastSeen.get(c) >= l) {
            l = lastSeen.get(c) + 1;     // jump past the previous occurrence
        }
        lastSeen.put(c, r);
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <p>
          The <code>&gt;= l</code> guard matters: a stale entry (last-seen <em>before</em>{" "}the current
          window) shouldn&apos;t pull <code>l</code> backwards. The pointer must move only right.
        </p>

        <h3>Variations on the variable theme</h3>

        <ul>
          <li><strong>LC 209 · Minimum Size Subarray Sum.</strong>{" "}Invariant: window sum ≥ target. Expand to grow the sum; once invariant holds, contract while it still holds, recording the minimum length.</li>
          <li><strong>LC 904 · Fruit Into Baskets.</strong>{" "}Invariant: window has at most 2 distinct values. Classic &quot;at most K distinct&quot; for K=2.</li>
          <li><strong>LC 1004 · Max Consecutive Ones III.</strong>{" "}Given a binary array and budget K, find the longest window with at most K zeros. Invariant: zero count ≤ K.</li>
          <li><strong>LC 159 / LC 340 · Longest Substring with At Most K Distinct.</strong>{" "}The &quot;at most K distinct&quot; pattern in its purest form.</li>
        </ul>

        <Callout variant="warn" title="Be careful: 'longest' vs 'shortest' record the answer at different moments">
          <p>
            For <strong>longest valid window</strong>: record the answer <em>after</em>{" "}contracting,
            when the window is at its largest valid extent for this <code>r</code>.
          </p>
          <p>
            For <strong>shortest valid window</strong>: record the answer <em>during</em>{" "}contraction,
            each step where the window is still valid is a candidate for the new minimum. You stop
            contracting only when the invariant is about to break.
          </p>
          <p>
            Mixing these up is the most common bug in variable-window code. When the question says
            &quot;longest,&quot; you contract <em>away</em>{" "}from validity and record after. When it says
            &quot;shortest,&quot; you contract <em>through</em>{" "}validity and record during.
          </p>
        </Callout>

        <Quiz
          kind="Variable-window check"
          question="For LC 209 (Minimum Size Subarray Sum: smallest window with sum ≥ target), when do you record best?"
          options={[
            { label: "Once at the very end of the loop.", explanation: "The minimum can be a window from any iteration, you must check at every valid window, not just one." },
            { label: "After admitting nums[r], every time the window sum is still ≥ target as you contract.", correct: true, explanation: "Right. 'Shortest' problems record DURING contraction, every valid (still ≥ target) window is a candidate for the minimum length. Stop contracting only when the next contraction would drop the sum below target." },
            { label: "Only after expanding, never during contraction.", explanation: "That's the 'longest' pattern. For 'shortest valid,' you want the window AS SMALL AS POSSIBLE while still valid, so you record during contraction, not before it." },
            { label: "Whenever the sum exactly equals target.", explanation: "Problem says ≥ target, not == target. And the minimum can occur at any valid window, not just an exact match." },
          ]}
        />

        <Quiz
          kind="Variable-window check"
          question="In the last-seen-index version of LC 3, why do we guard the jump with `lastSeen.get(c) >= l`?"
          options={[
            { label: "To handle the empty-string case.", explanation: "Empty string is handled by the loop never executing. The guard is about something else." },
            { label: "Stale entries, a character seen BEFORE the current window's left boundary shouldn't pull l backward. The pointer must only move right.", correct: true, explanation: "Right. lastSeen could hold an index from much earlier in the string, before l moved past it. Without the guard, you'd set l to that stale index + 1, which could move l LEFT, breaking the monotonicity that gives us O(n)." },
            { label: "Java HashMaps return null for missing keys; this is a null check.", explanation: "containsKey handles the null case. The >= l guard is about staleness, not nulls." },
            { label: "It avoids an off-by-one.", explanation: "Off-by-one is handled by the +1. The >= l guard is specifically about not moving l backward." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Window + frequency map ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="freq-map" title="I see why frequency map + formed counter is the killer combo" xp={25}>
      <section>
        <h2 id="freq-map">Window + frequency map: the killer combo</h2>

        <p>
          Once your invariant involves counts of multiple distinct items, &quot;the window contains at
          most K distinct characters,&quot; &quot;the window contains every character of t with at least
          the required multiplicity,&quot; &quot;the window has no character appearing more than
          twice&quot;, you graduate to the window+frequency-map combo. It&apos;s the same expand/contract
          skeleton, but the state is richer.
        </p>

        <h3>Pattern A · &quot;At most K distinct&quot;</h3>

        <p>
          The invariant: <code>map.size() &lt;= K</code>. Expand: increment count of <code>s[r]</code>,
          which may grow the map. Contract: decrement count of <code>s[l]</code>; if it hits zero,
          remove the key (shrinking the map).
        </p>

        <CodeBlock lang="java">{`public int longestKDistinct(String s, int k) {
    Map<Character, Integer> count = new HashMap<>();
    int l = 0, best = 0;

    for (int r = 0; r < s.length(); r++) {
        count.merge(s.charAt(r), 1, Integer::sum);
        while (count.size() > k) {                    // invariant broken
            char left = s.charAt(l++);
            if (count.merge(left, -1, Integer::sum) == 0) {
                count.remove(left);                   // critical: drop zeroed keys
            }
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
}`}</CodeBlock>

        <Callout variant="warn" title="Remove zeroed keys, or your size() lies">
          <p>
            The single most common bug in this pattern: leaving a key in the map with count 0.{" "}
            <code>map.size()</code> still counts it as a distinct character, so the invariant check is
            wrong. The window thinks it has K+1 distinct characters and contracts further than
            necessary, or vice versa.
          </p>
          <p>
            Always remove the key when its count drops to 0. The <code>count.merge(...) == 0</code>{" "}
            return-value check is the tightest way to do it in one expression.
          </p>
        </Callout>

        <h3>Pattern B · The <code>formed</code> counter for &quot;contains all of t&quot;</h3>

        <p>
          The Minimum Window Substring family uses a clever variation. You don&apos;t care about{" "}
          <code>have.size()</code>; you care about whether <em>each required character has at least its
          required count</em>. Naïvely, that&apos;s an O(|t|) check on every iteration, expensive. The
          fix is a counter called <code>formed</code> that tracks <em>how many distinct keys have
          met or exceeded their requirement</em>. The window is valid iff{" "}
          <code>formed == need.size()</code>.
        </p>

        <Mermaid chart={freqMap} />

        <CodeBlock lang="java">{`// Build need from t
Map<Character, Integer> need = new HashMap<>();
for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

Map<Character, Integer> have = new HashMap<>();
int formed = 0;          // # of keys k where have[k] >= need[k]
int required = need.size();

for (int r = 0; r < s.length(); r++) {
    char c = s.charAt(r);
    have.merge(c, 1, Integer::sum);
    // Did this admission just push c from "below requirement" to "at requirement"?
    if (need.containsKey(c) && have.get(c).intValue() == need.get(c).intValue()) {
        formed++;
    }
    while (formed == required) {
        // Window valid → contract from the left, recording the answer along the way.
        char left = s.charAt(l);
        // record answer here (e.g., shortest length)
        have.merge(left, -1, Integer::sum);
        // Did this eviction just drop left from "at requirement" to "below requirement"?
        if (need.containsKey(left) && have.get(left).intValue() < need.get(left).intValue()) {
            formed--;
        }
        l++;
    }
}`}</CodeBlock>

        <Callout variant="insight" title="The formed counter is what makes Minimum Window Substring O(n)">
          <p>
            Without <code>formed</code>, every window-validity check would walk the entire <code>need</code>{" "}
            map, O(|t|) per check, O(n·|t|) total. With it, validity is O(1): just compare two ints.
          </p>
          <p>
            The trick: track only the <em>moments of crossing</em>, when a character&apos;s count
            crosses from &quot;below required&quot; to &quot;at required&quot; (formed++) or from
            &quot;at required&quot; to &quot;below required&quot; (formed--). Everything in between is
            irrelevant to the validity question. This is one of the cleanest amortizations in interview
            algorithms.
          </p>
        </Callout>

        <h3>Pattern C · Anagram / permutation matching</h3>

        <p>
          For LC 567 (Permutation in String) and LC 438 (Find All Anagrams), the question is &quot;does a
          window of length |p| match the multiset of characters in p?&quot; This is a fixed-size window
          (size = p.length()) where the state is a 26-int array (lowercase a-z).
        </p>

        <CodeBlock lang="java">{`public boolean checkInclusion(String p, String s) {
    if (p.length() > s.length()) return false;
    int[] need = new int[26], have = new int[26];
    for (int i = 0; i < p.length(); i++) {
        need[p.charAt(i) - 'a']++;
        have[s.charAt(i) - 'a']++;
    }
    if (Arrays.equals(need, have)) return true;

    for (int r = p.length(); r < s.length(); r++) {
        have[s.charAt(r) - 'a']++;            // admit right
        have[s.charAt(r - p.length()) - 'a']--;  // evict left
        if (Arrays.equals(need, have)) return true;
    }
    return false;
}`}</CodeBlock>

        <p>
          <code>Arrays.equals</code> on a length-26 array is O(26) = O(1) per comparison. So the whole
          algorithm is O(n). You can squeeze further by maintaining a &quot;matches&quot; counter (like{" "}
          <code>formed</code> above) so each slide is true O(1), but the constant factor here is tiny
          and the simpler version is more readable.
        </p>

        <Quiz
          kind="Frequency-map check"
          question="In the 'at most K distinct' pattern, why must you remove a key from the map when its count drops to zero?"
          options={[
            { label: "To save memory.", explanation: "Memory is a side benefit. The real reason is correctness." },
            { label: "Because map.size() is the invariant check, and a zero-count key still counts as a distinct character, leaving it in lies about the window's true distinct count.", correct: true, explanation: "Right. map.size() doesn't know that 'count = 0' means 'not present.' A character with count 0 is logically gone from the window but still a key. Leaving it in inflates size() and breaks the > K check. Remove or your invariant is wrong." },
            { label: "HashMap doesn't support zero values.", explanation: "It does, 0 is a perfectly valid Integer value. The bug is that 0 isn't semantically 'not present,' but map.size() treats it as present." },
            { label: "Performance, zero entries slow down get().", explanation: "Get is O(1) regardless of value. The reason is correctness of the invariant check, not speed." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Project ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="project" title="I solved Maximum Average, Longest Substring, and Minimum Window Substring" xp={45} manual manualLabel="I solved all three LeetCode problems">
      <section>
        <h2 id="project">Project: Minimum Window Substring</h2>

        <p>
          Three problems, one for each pattern. Solve all three; the third is the famous one that
          interviewers love.
        </p>

        <h3>LC 643 · Maximum Average Subarray I · fixed window</h3>

        <p>
          Already covered in Part 2. Type it from memory; if you can write it without notes, the
          fixed-window pattern is yours. ~10 lines.
        </p>

        <h3>LC 3 · Longest Substring Without Repeating Characters · variable window</h3>

        <p>
          Already covered in Part 3. Either the Set version or the last-seen-index version is fine.
          ~15 lines.
        </p>

        <h3>LC 76 · Minimum Window Substring · variable window + frequency map + formed counter</h3>

        <p>
          Given strings <code>s</code> and <code>t</code>, return the shortest window in <code>s</code>{" "}
          that contains every character of <code>t</code> (counting multiplicities). If no such window
          exists, return the empty string.
        </p>

        <p>
          This is the boss of sliding-window problems. It pulls together the variable-window expand/
          contract loop, a frequency map, the <code>formed</code> counter trick, and the careful
          &quot;record-during-contraction&quot; pattern for shortest-valid problems.
        </p>

        <CodeBlock lang="java">{`public String minWindow(String s, String t) {
    if (s == null || t == null || s.length() < t.length()) return "";

    // Build need: for each character of t, how many we need in the window.
    Map<Character, Integer> need = new HashMap<>();
    for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);

    Map<Character, Integer> have = new HashMap<>();
    int required = need.size();   // distinct chars whose requirement must be met
    int formed = 0;               // distinct chars currently meeting their requirement

    int l = 0;
    int bestLen = Integer.MAX_VALUE, bestL = 0;   // record shortest valid window

    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        have.merge(c, 1, Integer::sum);

        // Did admitting c just push it from "below required" to "exactly required"?
        if (need.containsKey(c) && have.get(c).intValue() == need.get(c).intValue()) {
            formed++;
        }

        // Window is valid → contract while still valid, recording the shortest.
        while (formed == required) {
            int len = r - l + 1;
            if (len < bestLen) {
                bestLen = len;
                bestL = l;
            }

            char left = s.charAt(l);
            have.merge(left, -1, Integer::sum);
            // Did evicting left just drop it from "exactly required" to "below required"?
            if (need.containsKey(left) && have.get(left).intValue() < need.get(left).intValue()) {
                formed--;
            }
            l++;
        }
    }

    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
}`}</CodeBlock>

        <Callout variant="insight" title="Why this is O(n + m), not O(n * m)">
          <p>
            <code>n = s.length()</code>, <code>m = t.length()</code>. Building <code>need</code> is O(m).
            The main loop runs <code>r</code> from 0 to n-1; <code>l</code> only moves right, at most n
            times across the entire run. Each map operation is amortized O(1).
          </p>
          <p>
            The genius is the <code>formed</code> counter. Without it, you&apos;d need to walk{" "}
            <code>need</code>&apos;s entries on every iteration to check &quot;does the window cover all
            of t?&quot;, that&apos;s an extra O(m) per iteration, killing the bound. With the counter,
            validity is a single int comparison.
          </p>
        </Callout>

        <Callout variant="warn" title="The .intValue() comparisons are not optional">
          <p>
            <code>have.get(c) == need.get(c)</code> compares <em>Integer references</em>{" "}in Java, not
            int values. For boxed integers outside Java&apos;s small-Integer cache (-128 to 127), this
            silently returns false when the values are equal, a brutal bug that passes test cases with
            small inputs and fails on real ones.
          </p>
          <p>
            <code>.intValue() == .intValue()</code> forces unboxing and integer comparison. Alternatively,{" "}
            <code>.equals()</code> works. Pick one and never use <code>==</code> on boxed Integers in
            hot paths.
          </p>
        </Callout>

        <h3>Test cases worth running</h3>

        <ul>
          <li><code>s = &quot;ADOBECODEBANC&quot;, t = &quot;ABC&quot;</code> → <code>&quot;BANC&quot;</code> (the canonical example).</li>
          <li><code>s = &quot;a&quot;, t = &quot;a&quot;</code> → <code>&quot;a&quot;</code> (window of size 1).</li>
          <li><code>s = &quot;a&quot;, t = &quot;aa&quot;</code> → <code>&quot;&quot;</code> (impossible).</li>
          <li><code>s = &quot;ab&quot;, t = &quot;b&quot;</code> → <code>&quot;b&quot;</code> (target somewhere in the middle).</li>
          <li>Long s with t&apos;s characters scattered, to exercise the contraction loop hard.</li>
        </ul>

        <h3>Stretch goals</h3>

        <ul>
          <li><strong>LC 159 · Longest Substring with At Most Two Distinct Characters.</strong>{" "}The &quot;at most K distinct&quot; pattern with K=2. ~20 lines.</li>
          <li><strong>LC 340 · Longest Substring with At Most K Distinct.</strong>{" "}Same pattern, parameterized K.</li>
          <li><strong>LC 567 · Permutation in String.</strong>{" "}Fixed-window anagram check with a 26-int frequency array.</li>
          <li><strong>LC 30 · Substring with Concatenation of All Words.</strong>{" "}A vicious one, sliding window, but the &quot;atom&quot; is a word, not a character. Worth attempting once you&apos;re comfortable.</li>
        </ul>
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Final ───────────────── */}
      <Checkpoint moduleSlug="sliding-window" id="final" title="Sliding window is second nature" xp={30} celebration="Contiguous subarray problems will never be O(n²) for you again. Up next: binary search and answer-search.">
      <section>
        <h2 id="final">Final quiz</h2>

        <ClassifyChallenge
          title="Window or not?"
          prompt="For each problem, decide whether it's a fixed-size window, variable-size window, or not a window problem at all."
          buckets={[
            { id: "fixed", label: "Fixed window", color: "emerald" },
            { id: "variable", label: "Variable window", color: "indigo" },
            { id: "not", label: "Not a window problem", color: "rose" },
          ]}
          items={[
            { id: "1", label: "Maximum sum of any contiguous subarray of length exactly 5.", answer: "fixed", explanation: "Fixed K=5. Prime the first 5, then slide: add right, subtract left, track max." },
            { id: "2", label: "Longest substring with at most 3 distinct characters.", answer: "variable", explanation: "Variable. Invariant: window has at most 3 distinct. Expand always; while map.size() > 3, contract." },
            { id: "3", label: "Find any two indices i, j (not necessarily contiguous) such that nums[i] + nums[j] = target.", answer: "not", explanation: "Two Sum, non-contiguous pair. HashMap, not window." },
            { id: "4", label: "Smallest contiguous subarray whose sum is at least target (positive numbers only).", answer: "variable", explanation: "Variable. Invariant: window sum < target during expansion; once sum ≥ target, contract while still valid, recording the minimum length." },
            { id: "5", label: "Number of subarrays summing exactly to K, where the array can contain negative numbers.", answer: "not", explanation: "Negatives break window monotonicity, adding doesn't always increase sum, so you can't decide when to contract. Use prefix sums + HashMap." },
            { id: "6", label: "Average of every contiguous subarray of length 4.", answer: "fixed", explanation: "Fixed K=4. Slide and emit average each step. The simplest fixed-window flavor." },
            { id: "7", label: "Longest substring with no repeating characters.", answer: "variable", explanation: "Variable. Invariant: all characters in the window are distinct. Expand; while there's a duplicate, contract." },
            { id: "8", label: "Given a sorted array, find a pair summing to target.", answer: "not", explanation: "Two pointers (one from each end), but it's not a window, both pointers move toward each other and the 'window' isn't a contiguous range with a meaningful invariant. Different technique." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="What's the time and space complexity of LC 76 (Minimum Window Substring) using the standard sliding-window + HashMap solution?"
          options={[
            { label: "O(n * m) time, O(m) space.", explanation: "n*m would be naive without the formed counter, recomputing window validity each step. With formed, validity is O(1)." },
            { label: "O(n + m) time, O(m) space (where n = |s|, m = |t|).", correct: true, explanation: "Right. Building need is O(m). The main loop has both pointers moving right at most n times each, with O(1) amortized work per step thanks to the formed counter. Total: O(n + m). Space: O(m) for the maps, since they hold at most m distinct characters from t." },
            { label: "O(n log n) time, O(n) space.", explanation: "No sorting or heap involved. The bound is linear thanks to amortized analysis on the two pointers." },
            { label: "O(n²) time, O(1) space.", explanation: "n² would be brute force (try every window). Sliding window beats that to O(n). Space is O(m), not O(1), we need the maps." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In a variable-size sliding window, you're solving 'longest substring such that property P holds.' Where do you record the answer?"
          options={[
            { label: "Inside the contract loop, on every iteration.", explanation: "That's the 'shortest valid' pattern. For 'longest valid' you record AFTER contracting, when the window has been restored to a valid state." },
            { label: "After the contract loop finishes, i.e., when the window [l..r] is the largest valid extent ending at r.", correct: true, explanation: "Right. For 'longest,' contracting moves the window AWAY from being too large back to valid. The widest valid window ending at r is what's left after contracting. Record then." },
            { label: "Only when r reaches n - 1.", explanation: "The longest valid window may end far before r reaches the end. You must check at every r." },
            { label: "Only when the contract loop runs zero times.", explanation: "The contract loop running zero times means the window was already valid when r expanded, but it doesn't mean the answer is special at that step. Record after every expand+contract pair." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You're computing 'longest subarray with sum ≤ target' using a sliding window, but the array contains negative numbers. What's the problem?"
          options={[
            { label: "Nothing; the algorithm works as-is.", explanation: "It does not. With negatives, the sum is not monotonic in the window, so the contract step's logic falls apart." },
            { label: "Adding a negative number can DECREASE the sum, so you can't reliably decide when to contract, the invariant doesn't behave monotonically.", correct: true, explanation: "Right. Sliding window depends on a kind of monotonicity: 'adding makes the constraint harder, removing makes it easier.' Negatives break that, adding a -10 actually relaxes a 'sum ≤ target' constraint instead of tightening it. Use prefix sums + HashMap (or a TreeMap/sorted structure) instead." },
            { label: "Java's int overflow.", explanation: "Overflow is a real concern but unrelated. The fundamental issue is monotonicity, not numeric range." },
            { label: "It's still O(n) but the constant is worse.", explanation: "It's not just slower, it's wrong. The contract logic relies on monotonicity that doesn't hold with negatives." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="See 'contiguous', think window. Pick fixed if K is given, variable otherwise. Maintain an invariant by expanding then contracting. The whole pattern is one for-loop with two pointers."
          points={[
            { takeaway: "Recognize sliding-window problems by language: 'contiguous,' 'substring,' 'subarray of length K,' 'longest/shortest with property P.'", detail: "If the answer involves non-contiguous subsets, or if the metric isn't monotonic in window size (negatives in a sum problem), the technique doesn't apply." },
            { takeaway: "Fixed-window template: prime the first K, then slide with one add and one subtract.", detail: "Constant work per step, total O(n). Don't recompute the answer inside the slide loop, that's the most common O-bug." },
            { takeaway: "Variable-window template: expand always, while-invariant-broken contract.", detail: "Both pointers move only right. Across the whole run that's at most 2n moves. Amortized O(n)." },
            { takeaway: "For 'longest valid' record after contracting; for 'shortest valid' record during.", detail: "These are mirror-image patterns. Mixing them up is the most common correctness bug in window problems." },
            { takeaway: "Window + frequency map + formed counter is the killer combo for 'contains all of t' problems.", detail: "Track distinct keys whose count meets requirement; window is valid iff that counter equals need.size(). Reduces validity check from O(|t|) to O(1), that's how Minimum Window Substring stays linear." },
          ]}
        />

        <div className="not-prose mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">Up next · Module 25</p>
          <Link
            href="/courses/dsa/modules/binary-search"
            className="mt-2 inline-block text-xl font-bold text-slate-900 no-underline transition hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"
          >
            Binary search &amp; answer-search pattern →
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            From linear-time scans to logarithmic-time searches, and the surprising trick of binary-searching the answer itself.
          </p>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="sliding-window" />
    </article>
  );
}
