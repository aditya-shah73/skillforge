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

const CHECKPOINTS = [
  { id: "setup", title: "What greedy means — and why it fails" },
  { id: "exchange", title: "The exchange argument: how you prove greedy is correct" },
  { id: "intervals", title: "Interval scheduling: the canonical greedy" },
  { id: "jump", title: "Jump Game: tracking the reachable frontier" },
  { id: "vs-dp", title: "Greedy vs DP: when to suspect greedy doesn't work" },
  { id: "project", title: "Project: Gas Station + Task Scheduler" },
];

export default function GreedyModule() {
  const mod = getModuleBySlug("greedy")!;

  // Coin change counterexample: target 6 with denominations [1, 3, 4]
  const coinFail = `
flowchart TB
    subgraph G["Greedy: always grab the biggest coin that fits"]
        direction TB
        G0["target = 6<br/>coins available: {1, 3, 4}"]
        G0 --> G1["pick 4 → remaining 2"]
        G1 --> G2["pick 1 → remaining 1"]
        G2 --> G3["pick 1 → remaining 0"]
        G3 --> GR["Greedy total: 3 coins (4 + 1 + 1)"]
    end
    subgraph O["Optimal: actually minimize the coin count"]
        direction TB
        O0["target = 6"]
        O0 --> O1["pick 3 → remaining 3"]
        O1 --> O2["pick 3 → remaining 0"]
        O2 --> OR["Optimal total: 2 coins (3 + 3)"]
    end
    G --> O
    style G0 fill:#fee2e2,color:#000,stroke:#dc2626
    style GR fill:#fca5a5,color:#000,stroke:#dc2626
    style O0 fill:#d1fae5,color:#000,stroke:#059669
    style OR fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Interval scheduling: sort by end time, greedy pick
  const intervals = `
flowchart TB
    subgraph T["Intervals on a timeline (sorted by end-time)"]
        direction TB
        I1["A: [1, 4]"]
        I2["B: [2, 5]"]
        I3["C: [3, 7]"]
        I4["D: [5, 8]"]
        I5["E: [6, 9]"]
        I6["F: [8, 11]"]
    end
    subgraph P["Greedy sweep: pick earliest end, skip overlaps"]
        direction TB
        P1["pick A [1,4] → end=4"]
        P1 --> P2["B [2,5] starts at 2 &lt; 4 → skip"]
        P2 --> P3["C [3,7] starts at 3 &lt; 4 → skip"]
        P3 --> P4["pick D [5,8] → end=8"]
        P4 --> P5["E [6,9] starts at 6 &lt; 8 → skip"]
        P5 --> P6["pick F [8,11] → end=11"]
        P6 --> R["Greedy picks: A, D, F (3 intervals)"]
    end
    T --> P
    style I1 fill:#a7f3d0,color:#000,stroke:#059669
    style I4 fill:#a7f3d0,color:#000,stroke:#059669
    style I6 fill:#a7f3d0,color:#000,stroke:#059669
    style I2 fill:#fecaca,color:#000,stroke:#dc2626
    style I3 fill:#fecaca,color:#000,stroke:#dc2626
    style I5 fill:#fecaca,color:#000,stroke:#dc2626
    style R fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Jump Game: tracking farthest reachable
  const jumpTrace = `
flowchart TB
    subgraph S["nums = [2, 3, 1, 1, 4] · success"]
        direction TB
        S0["i=0, val=2 · farthest = max(0, 0+2) = 2 · 2 ≥ 0 ✓"]
        S0 --> S1["i=1, val=3 · farthest = max(2, 1+3) = 4 · 4 ≥ 1 ✓"]
        S1 --> S2["i=2, val=1 · farthest = max(4, 2+1) = 4 · 4 ≥ 2 ✓"]
        S2 --> S3["i=3, val=1 · farthest = max(4, 3+1) = 4 · 4 ≥ 3 ✓"]
        S3 --> S4["i=4, val=4 · we're at the last index → return true"]
    end
    subgraph F["nums = [3, 2, 1, 0, 4] · failure"]
        direction TB
        F0["i=0, val=3 · farthest = 3 · 3 ≥ 0 ✓"]
        F0 --> F1["i=1, val=2 · farthest = max(3, 3) = 3 · 3 ≥ 1 ✓"]
        F1 --> F2["i=2, val=1 · farthest = max(3, 3) = 3 · 3 ≥ 2 ✓"]
        F2 --> F3["i=3, val=0 · farthest = max(3, 3) = 3 · 3 ≥ 3 ✓"]
        F3 --> F4["i=4 · farthest = 3 &lt; 4 → return false"]
    end
    S --> F
    style S0 fill:#a7f3d0,color:#000
    style S4 fill:#10b981,color:#fff,stroke:#047857
    style F0 fill:#fecaca,color:#000
    style F4 fill:#fca5a5,color:#000,stroke:#dc2626
  `.trim();

  // Gas Station: cumulative deficit
  const gasStation = `
flowchart TB
    subgraph G["gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]"]
        direction TB
        G0["diff[i] = gas[i] - cost[i]<br/>diff = [-2, -2, -2, 3, 3]<br/>total = 0 → solution exists"]
    end
    subgraph T["Track running tank from station 0"]
        direction TB
        T0["i=0: tank = -2 → deficit, restart from i=1, start=1"]
        T0 --> T1["i=1: tank = -2 → deficit, restart from i=2, start=2"]
        T1 --> T2["i=2: tank = -2 → deficit, restart from i=3, start=3"]
        T2 --> T3["i=3: tank = 3 (no reset)"]
        T3 --> T4["i=4: tank = 6 (still positive)"]
        T4 --> R["Answer: start = 3"]
    end
    G --> T
    style G0 fill:#e0e7ff,color:#000,stroke:#4f46e5
    style T0 fill:#fecaca,color:#000
    style T1 fill:#fecaca,color:#000
    style T2 fill:#fecaca,color:#000
    style T3 fill:#a7f3d0,color:#000
    style R fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  // Task Scheduler: max-heap by frequency, idle slots
  const taskSched = `
flowchart TB
    subgraph A["tasks = [A, A, A, B, B, B], n = 2 · cooldown 2"]
        direction TB
        A0["freq: {A:3, B:3}"]
        A0 --> A1["max-heap: [A:3, B:3]"]
    end
    subgraph R["Round-by-round (each round = n+1 = 3 slots)"]
        direction TB
        R0["Round 1: A B _ → idle 1 slot"]
        R0 --> R1["Round 2: A B _ → idle 1 slot"]
        R1 --> R2["Round 3: A B (last two; no idle needed)"]
        R2 --> R3["Total length: A B _ A B _ A B = 8"]
    end
    A --> R
    style A0 fill:#e0e7ff,color:#000
    style R3 fill:#10b981,color:#fff,stroke:#047857
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="greedy" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module 24 · Algorithmic Techniques
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h</p>
      </div>

      {/* ───────────────── Part 1 · Setup ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="setup" title="I know what greedy means and why it can fail" xp={20}>
      <section>
        <h2 id="setup">What greedy means — and why it fails</h2>

        <p>
          A <strong>greedy algorithm</strong> follows one rule: at each step, take the locally optimal choice and never
          revisit it. No backtracking, no remembering alternative branches, no lookahead. You commit to the choice that
          looks best <em>right now</em> and march forward.
        </p>

        <p>
          When greedy works, it&apos;s magical: a problem that looks like it might need exponential search collapses
          into a single linear sweep. When it doesn&apos;t, it produces confidently wrong answers — and that&apos;s
          what makes it dangerous. Greedy is the only major algorithmic technique whose correctness is not implied by
          its structure. Every greedy solution needs a <em>proof</em>.
        </p>

        <h3>The classic counterexample: coin change</h3>

        <p>
          Suppose you have coin denominations <code>{`{1, 3, 4}`}</code> and you want to make the value{" "}
          <code>6</code> using the fewest coins. The greedy strategy &quot;always grab the largest coin that fits&quot;
          gives you:
        </p>

        <Mermaid chart={coinFail} />

        <p>
          Greedy answers 3 coins. The actual optimum is 2 coins: <code>3 + 3</code>. Greedy went wrong because picking
          the 4 forced it into a worse remainder (2) that no single coin could fill, while the &quot;suboptimal-looking&quot;{" "}
          first choice of 3 led to a perfect remainder. The locally best move was globally bad.
        </p>

        <Callout variant="warn" title="Greedy works on US coins. That's a coincidence.">
          <p>
            US coin denominations <code>{`{1, 5, 10, 25}`}</code> happen to form what&apos;s called a <em>canonical</em>{" "}
            coin system, where greedy is provably optimal. But change the denominations slightly — to{" "}
            <code>{`{1, 3, 4}`}</code>, or to many real-world currencies — and greedy breaks.
          </p>
          <p>
            This is the trap: greedy <em>often</em> works on small examples, so it looks correct after a few hand
            traces. The bug only appears on a specific input pattern. Without a proof, you don&apos;t know if your
            greedy passes 99% of test cases or 100%.
          </p>
        </Callout>

        <h3>The two questions every greedy needs to answer</h3>

        <ol>
          <li>
            <strong>What&apos;s the &quot;greedy choice&quot;?</strong> — the local rule for picking the next item.
            Sort by end-time? Sort by frequency? Pick the largest? Pick the earliest deadline? The choice itself is
            often the only design decision.
          </li>
          <li>
            <strong>Why is this choice safe?</strong> — the proof that committing to this choice never closes off the
            optimal solution. Without a proof, you have a guess.
          </li>
        </ol>

        <p>
          The next section walks through the most common proof technique — the <strong>exchange argument</strong> —
          on a real problem. Once you&apos;ve seen one exchange argument, you&apos;ll recognize the shape of every other
          one.
        </p>

        <Quiz
          kind="Quick check"
          question="Greedy applied to coin change with denominations {1, 3, 4} and target 6 returns 3 coins. The optimum is 2 coins. What does this tell you about greedy in general?"
          options={[
            { label: "Greedy never works for coin change.", explanation: "It does work for some denomination sets — like US coins. The lesson is more subtle." },
            { label: "The locally optimal choice can lock you out of the globally optimal solution. Greedy needs a proof, not a hand trace, to be trusted.", correct: true, explanation: "Right. Picking 4 first looked best by 'biggest coin that fits', but it forced a remainder of 2 that needed two more coins. Picking 3 looked worse locally but led to a perfect remainder. Without a proof, you can't tell which case you're in." },
            { label: "Greedy only fails on small inputs.", explanation: "Backwards: greedy bugs often hide on small inputs and only surface on specific patterns. The {1,3,4}/6 example is small and still breaks." },
            { label: "Coin change is always a DP problem.", explanation: "It depends on the denominations. For canonical systems (like US coins), greedy is provably optimal. For arbitrary systems, you need DP. The lesson is that greedy correctness is denomination-dependent — and that's exactly why proof matters." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which of these is NOT a property of a greedy algorithm?"
          options={[
            { label: "It makes a single locally optimal choice at each step.", explanation: "This IS the defining property of greedy." },
            { label: "It never reconsiders a choice once made.", explanation: "Also true — once committed, greedy moves on. No backtracking." },
            { label: "It explores multiple candidate solutions and picks the best at the end.", correct: true, explanation: "Right — that's what greedy is NOT. Exploring multiple candidates is brute force, branch-and-bound, or DP. Greedy commits to ONE path, never revisits, and trusts the local rule." },
            { label: "Its correctness usually requires a proof, not just empirical testing.", explanation: "True. Greedy is the technique most likely to look right and be wrong, which is why proofs matter." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Exchange argument ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="exchange" title="I understand the exchange argument" xp={25}>
      <section>
        <h2 id="exchange">The exchange argument: how you prove greedy is correct</h2>

        <p>
          The most common way to prove a greedy algorithm correct is the <strong>exchange argument</strong>. The shape
          of the proof is always the same:
        </p>

        <ol>
          <li>Assume some optimal solution exists (we don&apos;t know what it looks like).</li>
          <li>Show that wherever the greedy and the optimal disagree, you can <em>swap</em> the optimal&apos;s choice for the greedy&apos;s choice without making the optimal worse.</li>
          <li>Repeat the swap until the optimal looks exactly like greedy. Greedy is therefore at least as good as optimal — i.e., greedy is also optimal.</li>
        </ol>

        <p>
          That&apos;s it. No formal calculus, no induction theatrics. The whole proof is a careful description of one
          swap.
        </p>

        <h3>Walking through it: interval scheduling</h3>

        <p>
          Here&apos;s the canonical greedy problem. You have a set of intervals — meetings, classes, jobs — each with a
          start and end time. You want to pick the largest possible subset where no two overlap.
        </p>

        <p>
          The greedy strategy: <strong>sort by end time, then sweep from left to right, picking each interval that
          starts at or after the last picked interval&apos;s end</strong>. We&apos;ll prove this picks the maximum
          number of compatible intervals.
        </p>

        <h3>Step 1 · Set up the swap</h3>

        <p>
          Let <code>G = (g₁, g₂, g₃, ...)</code> be the intervals greedy picks, sorted by end time. Let{" "}
          <code>O = (o₁, o₂, o₃, ...)</code> be some optimal solution, also sorted by end time. Both are valid (no
          overlaps within G, no overlaps within O), and we want to show <code>|G| ≥ |O|</code>.
        </p>

        <p>
          Find the first position where they differ. Greedy&apos;s rule guarantees <code>g₁</code> has the earliest end
          time among <em>all</em> intervals — so <code>g₁.end ≤ o₁.end</code>. If greedy and optimal already agree on
          interval 1, look at interval 2; same argument applies among the remaining intervals.
        </p>

        <h3>Step 2 · The swap doesn&apos;t break anything</h3>

        <p>
          Suppose greedy and optimal first disagree at position <code>k</code>. So <code>g₁ = o₁, ..., g_{`{k-1}`} = o_{`{k-1}`}</code>,
          but <code>g_k ≠ o_k</code>. Greedy&apos;s rule says <code>g_k</code> is the earliest-ending interval that doesn&apos;t
          conflict with <code>g_{`{k-1}`}</code>. So <code>g_k.end ≤ o_k.end</code>.
        </p>

        <p>
          Now construct a new solution <code>O&apos;</code>: start from <code>O</code> and replace <code>o_k</code> with{" "}
          <code>g_k</code>. Does this still work?
        </p>

        <ul>
          <li><strong>No conflict before:</strong> <code>g_k</code> doesn&apos;t conflict with <code>g_{`{k-1}`} = o_{`{k-1}`}</code>, by greedy&apos;s rule.</li>
          <li><strong>No conflict after:</strong> <code>g_k.end ≤ o_k.end</code>, so anything that started after <code>o_k</code> ended also starts after <code>g_k</code> ends. Future intervals are still compatible.</li>
          <li><strong>Same size:</strong> we swapped one interval for one interval. <code>|O&apos;| = |O|</code>.</li>
        </ul>

        <p>
          So <code>O&apos;</code> is also optimal, and now it agrees with greedy at one more position. Repeat until the
          modified <code>O</code> matches <code>G</code> entirely (or until <code>O</code> runs out — but that&apos;s
          impossible since we&apos;re only making swaps, never deletions). At that point <code>|G| ≥ |O|</code>, so
          greedy is optimal too.
        </p>

        <Callout variant="insight" title="Why end-time, not start-time or duration?">
          <p>
            Sorting by start-time or by duration both feel reasonable, and both are wrong. Counterexample for
            start-time: <code>[0, 10], [1, 2], [3, 4]</code>. Picking earliest-start grabs <code>[0, 10]</code> and
            blocks the other two — answer 1, optimum 2.
          </p>
          <p>
            End-time wins because it&apos;s the rule that <em>maximizes the room left for future picks</em>. Every
            other reasonable-sounding rule fails an exchange argument: you can construct an optimal that uses an
            earlier-ending interval, and you can&apos;t safely swap your greedy pick in.
          </p>
        </Callout>

        <h3>The recipe for any exchange argument</h3>

        <ul>
          <li><strong>Define what greedy picks</strong> in terms of a sortable property (end-time, frequency, deadline).</li>
          <li><strong>Take an optimal solution</strong>, sort it the same way.</li>
          <li><strong>Find the first disagreement</strong> and show greedy&apos;s pick is &quot;at least as good&quot; on the sortable property.</li>
          <li><strong>Swap and verify</strong> nothing breaks: no new conflicts, same size or better.</li>
          <li><strong>Iterate</strong>: greedy = (modified) optimal, so greedy&apos;s size ≥ optimal&apos;s size.</li>
        </ul>

        <p>
          You&apos;ll see this exact pattern across most provably-correct greedy algorithms in this module: interval
          scheduling, gas station (which has a slicker direct argument), even parts of Huffman coding. The shape
          generalizes.
        </p>

        <Quiz
          kind="Proof check"
          question="In the interval scheduling exchange argument, why is it crucial that greedy's pick has end-time ≤ optimal's pick at the disagreement position?"
          options={[
            { label: "It's the only way to break ties.", explanation: "Tie-breaking isn't the issue. The argument needs more than 'they're equal' — it needs greedy to be no worse." },
            { label: "Because then anything compatible with optimal's pick (everything starting after optimal's end) is also compatible with greedy's pick. The swap can't create future conflicts.", correct: true, explanation: "Right. The future intervals were chosen to start after optimal's pick ends. Since greedy ends no later, those same future intervals also start after greedy ends. The swap is safe — that's the whole exchange." },
            { label: "It guarantees greedy and optimal pick the same intervals.", explanation: "They might pick different intervals — the proof handles exactly that case. The point is that greedy's choice is INTERCHANGEABLE with optimal's, not identical." },
            { label: "It's not crucial — any greedy rule would work.", explanation: "It is crucial. Other rules (sort by start, sort by duration) fail the exchange argument because their picks can have LATER end times, which would block intervals that optimal had room for." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Interval scheduling ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="intervals" title="I can solve interval scheduling and its variants" xp={25}>
      <section>
        <h2 id="intervals">Interval scheduling: the canonical greedy</h2>

        <p>
          The proof we just walked through gives us the algorithm for free: <strong>sort by end time, sweep, pick any
          interval whose start ≥ last picked end</strong>. Linear scan after the sort, so total cost is O(n log n).
        </p>

        <Mermaid chart={intervals} />

        <CodeBlock lang="java">{`public int maxNonOverlapping(int[][] intervals) {
    if (intervals.length == 0) return 0;

    // Sort by end time. (Use Integer.compare to avoid overflow on large bounds.)
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

    int count = 1;
    int lastEnd = intervals[0][1];
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= lastEnd) {
            count++;
            lastEnd = intervals[i][1];
        }
    }
    return count;
}`}</CodeBlock>

        <p>
          One sort, one pass, two integer variables. That&apos;s the entire algorithm. The whole intelligence is in
          which key you sort by — get that wrong and the same code returns suboptimal answers.
        </p>

        <h3>LC 435 · Non-overlapping Intervals (the inverse problem)</h3>

        <p>
          LeetCode 435 asks for the <em>minimum number of intervals to remove</em> so the rest don&apos;t overlap.
          That&apos;s just <code>n - maxCompatible</code>: if greedy keeps <code>k</code>, you must have removed{" "}
          <code>n - k</code>. Same code, different return value.
        </p>

        <CodeBlock lang="java">{`public int eraseOverlapIntervals(int[][] intervals) {
    if (intervals.length == 0) return 0;
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

    int kept = 1;
    int lastEnd = intervals[0][1];
    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= lastEnd) {
            kept++;
            lastEnd = intervals[i][1];
        }
    }
    return intervals.length - kept;
}`}</CodeBlock>

        <Callout variant="info" title="The boundary convention">
          <p>
            Whether <code>[1, 4]</code> and <code>[4, 7]</code> overlap depends on the problem&apos;s definition. LC 435
            treats them as non-overlapping (touch at a point is fine), so we use <code>start &gt;= lastEnd</code>. Some
            problems treat any shared point as overlap; flip to <code>start &gt; lastEnd</code>. Always re-read the
            definition; this off-by-one bites every interval problem.
          </p>
        </Callout>

        <h3>LC 452 · Minimum Number of Arrows to Burst Balloons</h3>

        <p>
          A close cousin: each balloon is an interval; one arrow at point <code>x</code> bursts every balloon whose
          interval contains <code>x</code>. Minimum arrows = maximum non-overlapping intervals (each non-overlap group
          needs its own arrow). Same algorithm, slightly different framing.
        </p>

        <CodeBlock lang="java">{`public int findMinArrowShots(int[][] points) {
    if (points.length == 0) return 0;
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));

    int arrows = 1;
    int lastEnd = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > lastEnd) {       // strict: touching counts as one arrow
            arrows++;
            lastEnd = points[i][1];
        }
    }
    return arrows;
}`}</CodeBlock>

        <h3>The interval family at a glance</h3>

        <ul>
          <li><strong>Max compatible (LC 435 inverse):</strong> sort by end, count picks.</li>
          <li><strong>Min removals (LC 435):</strong> n − max compatible.</li>
          <li><strong>Min arrows (LC 452):</strong> max compatible with strict <code>&gt;</code>.</li>
          <li><strong>Meeting rooms II:</strong> different beast — count concurrent intervals at any moment. Sort by start, use a min-heap of active end-times. Not the same template; mentioned here so you don&apos;t mis-classify it.</li>
        </ul>

        <Quiz
          kind="Interval check"
          question="You sort intervals by end-time and sweep. The first three intervals (sorted) are [1,3], [2,4], [3,6]. Which does greedy pick?"
          options={[
            { label: "[1,3] and [2,4] — both end early.", explanation: "[2,4] starts at 2, before [1,3]'s end of 3. They overlap, so greedy can't keep both." },
            { label: "[1,3] and [3,6] — pick [1,3], skip [2,4] (overlaps), pick [3,6] (starts at 3 ≥ 3).", correct: true, explanation: "Right. [1,3] picked first (earliest end). [2,4] overlaps [1,3] (start 2 < end 3) → skip. [3,6] starts exactly at 3, which equals lastEnd, so under the standard 'touch is fine' convention it's compatible → pick it." },
            { label: "All three.", explanation: "[1,3] and [2,4] overlap on the interval [2,3], so they can't both be in any valid selection." },
            { label: "Only [3,6].", explanation: "Greedy always picks the first one (earliest end) — [1,3] is taken first." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Jump Game ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="jump" title="I can solve Jump Game with the reachable frontier" xp={25}>
      <section>
        <h2 id="jump">Jump Game: tracking the reachable frontier</h2>

        <p>
          <strong>LC 55 · Jump Game.</strong> You&apos;re given an array <code>nums</code> where <code>nums[i]</code> is
          the maximum jump length from position <code>i</code>. Starting at index 0, can you reach the last index?
        </p>

        <p>
          The brute-force DP solution is O(n²): from every position, try every jump length. The greedy insight collapses
          this to O(n): you don&apos;t need to know <em>how</em> you got to position <code>i</code>; you only need to
          know whether <code>i</code> is reachable, and what&apos;s the farthest position you can reach from anywhere
          you&apos;ve been so far.
        </p>

        <h3>The single-variable invariant</h3>

        <p>
          Maintain a variable <code>farthest</code>: the maximum index reachable from any position in{" "}
          <code>[0..i]</code>. Sweep left-to-right. For each <code>i</code>:
        </p>

        <ul>
          <li>If <code>farthest &lt; i</code>, we can&apos;t even reach <code>i</code> — return false.</li>
          <li>Otherwise update <code>farthest = max(farthest, i + nums[i])</code> and continue.</li>
          <li>If <code>farthest ≥ n - 1</code> at any point, we can reach the end — return true.</li>
        </ul>

        <Mermaid chart={jumpTrace} />

        <CodeBlock lang="java">{`public boolean canJump(int[] nums) {
    int farthest = 0;
    for (int i = 0; i < nums.length; i++) {
        if (i > farthest) return false;             // can't reach this index
        farthest = Math.max(farthest, i + nums[i]);
        if (farthest >= nums.length - 1) return true;
    }
    return true;   // loop finished, we made it (only possible for n == 0 or n == 1)
}`}</CodeBlock>

        <Callout variant="insight" title="Why this is provably correct">
          <p>
            If <code>farthest ≥ i</code>, then SOME position in <code>[0..i-1]</code> can reach <code>i</code>{" "}
            directly. By induction, all positions in <code>[0..i]</code> are reachable. Updating <code>farthest</code>{" "}
            from <code>i</code> means &quot;we can also reach <code>i + nums[i]</code> via <code>i</code>.&quot;
          </p>
          <p>
            The greedy commitment: we don&apos;t care <em>which</em> path got us to <code>i</code>. The reachable set
            from the start is fully characterized by a single number — the right endpoint. That&apos;s the win.
          </p>
        </Callout>

        <h3>LC 45 · Jump Game II — minimum jumps</h3>

        <p>
          The same problem with a twist: return the minimum number of jumps to reach the end. The trick is to think in{" "}
          <em>BFS levels</em> over the array. From <code>[0]</code>, you can reach indices <code>[1..nums[0]]</code> in
          one jump. From any of those, the union of one-more-jump reaches some farther <code>currEnd</code>. Each
          &quot;level boundary&quot; is one more jump.
        </p>

        <CodeBlock lang="java">{`public int jump(int[] nums) {
    int jumps = 0;
    int currEnd = 0;       // farthest index reachable with current jump count
    int farthest = 0;      // farthest index reachable with one more jump

    for (int i = 0; i < nums.length - 1; i++) {
        farthest = Math.max(farthest, i + nums[i]);
        if (i == currEnd) {            // exhausted this jump's reach
            jumps++;                   // commit to one more jump
            currEnd = farthest;
        }
    }
    return jumps;
}`}</CodeBlock>

        <Callout variant="info" title="Why the loop stops at n - 1">
          <p>
            Once <code>i == n - 1</code>, you&apos;re already at the end — no need to jump. If you let the loop run to{" "}
            <code>n - 1</code> inclusive, you might increment <code>jumps</code> one extra time when{" "}
            <code>currEnd == n - 1</code>. Stop early and the count is correct.
          </p>
        </Callout>

        <h3>The frontier pattern</h3>

        <p>
          Both versions share a structure: a single integer summarizes the reachable set. This shows up in other
          problems too — &quot;Can you reach the end of the string given these rules?&quot;, &quot;Minimum platforms
          to schedule trains?&quot;, &quot;Maximum number of segments to cover a target with given pieces?&quot;.
          Whenever the search space can be summarized by &quot;the frontier I&apos;ve reached so far,&quot; one or two
          integers replace a full DP table.
        </p>

        <Quiz
          kind="Jump check"
          question="In Jump Game, why is `farthest = max(farthest, i + nums[i])` enough — why don't we need to track WHICH position got us to farthest?"
          options={[
            { label: "Because the answer doesn't ask for the path.", explanation: "Closer, but the deeper reason is structural: even if we wanted the path, the frontier captures all reachability info." },
            { label: "Because if any position in [0..i] can reach j, then i can also reach j (we only need to maintain the upper envelope of reachability — a single integer).", correct: true, explanation: "Right. The reachable set from the start is always a contiguous prefix [0..farthest]. One number fully describes it. Knowing 'who got us there' would tell us about a specific PATH, but reachability is what we need, not paths." },
            { label: "Because nums[i] is always positive.", explanation: "It can be 0 (a 'stuck' cell), and the algorithm handles that. The reason isn't about positivity." },
            { label: "Because the array is sorted.", explanation: "It isn't sorted — it's an arbitrary positive-or-zero array. Sorting would lose the position-to-jump mapping." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Greedy vs DP ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="vs-dp" title="I can tell when greedy will fail and DP is needed" xp={25}>
      <section>
        <h2 id="vs-dp">Greedy vs DP: when to suspect greedy doesn&apos;t work</h2>

        <p>
          Greedy and dynamic programming are the two techniques for &quot;optimize over a sequence of choices.&quot;
          DP explores the full space efficiently via memoization; greedy commits to one path. The big question is:{" "}
          <strong>when can you trust greedy?</strong>
        </p>

        <h3>The signal: do local choices have nonlocal consequences?</h3>

        <p>
          Greedy works when each choice can be evaluated using only local information — when picking the &quot;best
          next thing&quot; doesn&apos;t change what counts as &quot;best&quot; later. Examples where this holds:
        </p>

        <ul>
          <li><strong>Interval scheduling:</strong> picking the earliest-ending interval doesn&apos;t change what intervals exist later. The future is unchanged.</li>
          <li><strong>Jump Game:</strong> the reachable frontier only ever extends. Decisions don&apos;t close off positions you could otherwise reach.</li>
          <li><strong>Huffman coding:</strong> merging the two least-frequent symbols never changes the frequencies of the others.</li>
        </ul>

        <p>
          Greedy <em>fails</em> when a local choice constrains the future in a way that can be globally suboptimal:
        </p>

        <ul>
          <li><strong>Coin change with arbitrary denominations:</strong> picking the largest coin shifts the remaining target in a way that may have no good follow-up. The global structure of the denomination set matters.</li>
          <li><strong>0/1 Knapsack:</strong> picking the highest value-per-weight item first can leave you with a remaining capacity that can&apos;t be filled efficiently. (Fractional knapsack is greedy; 0/1 needs DP.)</li>
          <li><strong>Longest increasing subsequence:</strong> picking the smallest element greedily doesn&apos;t maximize length. You need DP because a small element might block a longer chain that started with a larger one.</li>
        </ul>

        <Callout variant="warn" title="The 'too good to be true' test">
          <p>
            If you&apos;re facing an optimization problem and you spot a one-liner greedy rule that seems to work, your
            first reflex should be skepticism, not celebration. Ask: <em>can I construct a small counterexample where
            following this rule is forced into a bad corner?</em>
          </p>
          <p>
            If you can find one in 30 seconds, the rule is wrong and you need DP (or a different greedy rule). If you
            can&apos;t, that&apos;s some evidence — but write the brute-force comparison test (next subsection) before
            committing.
          </p>
        </Callout>

        <h3>The empirical test: brute force comparison</h3>

        <p>
          When you suspect a greedy rule but can&apos;t prove it from first principles, write a brute-force solution and
          a randomized stress test. Run greedy and brute-force on thousands of random small inputs; if they ever
          disagree, you&apos;ve found a counterexample.
        </p>

        <CodeBlock lang="java">{`// Brute force: try every subset, return min coins for target.
int bruteCoinChange(int[] coins, int target) {
    if (target == 0) return 0;
    if (target < 0) return Integer.MAX_VALUE;
    int best = Integer.MAX_VALUE;
    for (int c : coins) {
        int sub = bruteCoinChange(coins, target - c);
        if (sub != Integer.MAX_VALUE) best = Math.min(best, sub + 1);
    }
    return best;
}

// Greedy: always grab the biggest coin that fits.
int greedyCoinChange(int[] coins, int target) {
    int[] sorted = coins.clone();
    Arrays.sort(sorted);
    int count = 0;
    for (int i = sorted.length - 1; i >= 0 && target > 0; i--) {
        while (target >= sorted[i]) {
            target -= sorted[i];
            count++;
        }
    }
    return target == 0 ? count : -1;
}

// Stress test: random denominations, random targets, find disagreement.
public static void stressTest() {
    Random rnd = new Random(42);
    for (int trial = 0; trial < 1000; trial++) {
        int n = rnd.nextInt(4) + 2;        // 2-5 denominations
        int[] coins = new int[n];
        coins[0] = 1;                       // ensure target is always reachable
        for (int i = 1; i < n; i++) coins[i] = rnd.nextInt(10) + 2;
        int target = rnd.nextInt(15) + 1;

        int brute = bruteCoinChange(coins, target);
        int greedy = greedyCoinChange(coins, target);
        if (brute != greedy) {
            System.out.println("Counterexample: coins=" + Arrays.toString(coins)
                + " target=" + target + " brute=" + brute + " greedy=" + greedy);
            return;
        }
    }
    System.out.println("No disagreement in 1000 trials.");
}`}</CodeBlock>

        <Callout variant="insight" title="What the stress test buys you">
          <p>
            For coin change with random denominations, this stress test will produce a counterexample within seconds.
            Once you have a concrete failing input, you&apos;re done — you know greedy is wrong, and you have the exact
            case to debug or to convince a teammate.
          </p>
          <p>
            For interval scheduling sorted by end-time, the same test will run forever without a counterexample. That&apos;s
            empirical evidence (not proof) that the greedy is correct, and you can then sit down and write the exchange
            argument with confidence.
          </p>
        </Callout>

        <h3>The decision flow in interviews</h3>

        <ol>
          <li><strong>See an optimization problem.</strong> Note: greedy <em>or</em> DP candidate.</li>
          <li><strong>Try to spot a greedy rule.</strong> Sort by something? Pick the extreme? Often the &quot;right&quot; key is end-time, deadline, frequency, or value-per-weight.</li>
          <li><strong>Test on a few inputs by hand.</strong> If it produces wrong answers immediately, abandon greedy.</li>
          <li><strong>Try a quick exchange argument.</strong> Can you swap a greedy choice for an optimal one without breaking anything? If yes, you have proof. If no, suspect DP.</li>
          <li><strong>If unsure, default to DP.</strong> DP is harder to write but harder to get wrong. A correct O(n²) DP beats a buggy O(n) greedy every time.</li>
        </ol>

        <Quiz
          kind="Greedy-or-DP check"
          question="You're asked: 'given a set of items each with weight and value, fill a knapsack of capacity W to maximize total value. Items are 0/1 (take or leave).' Greedy: sort by value/weight, take greedily until capacity runs out. Is that correct?"
          options={[
            { label: "Yes — value-per-weight is the right greedy key for any knapsack variant.", explanation: "It's correct for FRACTIONAL knapsack (where you can take fractions of items). 0/1 knapsack is different — and this is exactly the trap." },
            { label: "No. 0/1 knapsack needs DP. The greedy can be forced to leave a small unused gap that DP would fill with two cheaper items, beating the greedy total.", correct: true, explanation: "Right. Counterexample: capacity 10, items {(weight=6, value=10), (weight=5, value=7), (weight=5, value=7)}. Greedy by value/weight picks the first (10/6 ≈ 1.67), leaves capacity 4, total value 10. Optimal picks the other two: total value 14. The atomicity of items means local-best doesn't compose. DP is required." },
            { label: "Yes — greedy is always at least within 50% of optimal for knapsack.", explanation: "A 50% approximation result exists, but the question asks about exact optimum. For exact 0/1 knapsack, greedy is wrong, period." },
            { label: "Sometimes — depends on whether the items are sorted.", explanation: "Sorting is part of the greedy; the issue is structural. Greedy fails on 0/1 knapsack regardless of preprocessing because of item atomicity." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Project ───────────────── */}
      <Checkpoint moduleSlug="greedy" id="project" title="I solved Gas Station, Task Scheduler, and the rest" xp={40} manual manualLabel="I solved all four LeetCode problems" celebration="Greedy is the technique you reach for when local moves have global consequences only through the obvious channel — and you can prove it. On to bit manipulation, where the &quot;moves&quot; are XOR tricks.">
      <section>
        <h2 id="project">Project: Gas Station + Task Scheduler</h2>

        <p>
          Two non-trivial greedy problems that show off different patterns. After this, you&apos;ll have a feel for both
          when the greedy is &quot;sweep and track a frontier&quot; and when it&apos;s &quot;sort and use a heap.&quot;
        </p>

        <h3>LC 134 · Gas Station</h3>

        <p>
          You&apos;re on a circular route with <code>n</code> gas stations. <code>gas[i]</code> is the gas you can pump
          at station <code>i</code>; <code>cost[i]</code> is the gas needed to drive from <code>i</code> to{" "}
          <code>i+1</code>. Find the starting station that lets you complete the full loop, or return -1 if none works.
          Guaranteed unique answer if it exists.
        </p>

        <Mermaid chart={gasStation} />

        <h4>The two-line theorem</h4>

        <ol>
          <li>If <code>sum(gas) &lt; sum(cost)</code>, no solution exists. (You can&apos;t generate energy from nothing.)</li>
          <li>If <code>sum(gas) ≥ sum(cost)</code>, a solution exists. The starting station is the one immediately AFTER the position where the cumulative deficit was most negative.</li>
        </ol>

        <p>
          Why the second claim is true is the elegant part. Walk the loop from station 0, tracking the running tank{" "}
          <code>tank = sum of (gas[i] - cost[i])</code>. The point where <code>tank</code> reaches its minimum is the
          worst spot — every previous starting choice was at least that bad. Starting from one past it, every prefix
          deficit is ≥ 0 (we&apos;re measuring against the lowest point), so we never run out.
        </p>

        <CodeBlock lang="java">{`public int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0;        // total surplus over the full loop
    int tank = 0;         // running tank from the current candidate start
    int start = 0;

    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {
            // Can't reach i+1 from current start. Restart from i+1.
            start = i + 1;
            tank = 0;
        }
    }
    return total >= 0 ? start : -1;
}`}</CodeBlock>

        <Callout variant="insight" title="Why 'restart from i+1' is greedy and correct">
          <p>
            If we start at <code>s</code> and run out of gas before reaching <code>i+1</code>, then NO starting position
            in <code>[s, i]</code> can reach <code>i+1</code> either. Reason: starting at any <code>s&apos; ∈ [s, i]</code>{" "}
            gives less running tank at <code>i</code> than starting at <code>s</code> did (you&apos;d have skipped some
            of the surpluses between <code>s</code> and <code>s&apos;</code>). So we can safely jump <code>start</code>{" "}
            forward to <code>i+1</code> — no candidate is being silently abandoned.
          </p>
          <p>
            That&apos;s the greedy commitment: the failed start poisons every position behind it, so we don&apos;t
            backtrack. One linear pass.
          </p>
        </Callout>

        <h3>LC 621 · Task Scheduler</h3>

        <p>
          You have a list of tasks (each is a letter A-Z) and a cooldown <code>n</code>: between two executions of the
          same task, at least <code>n</code> other slots must pass. Find the minimum total time to finish all tasks
          (using idle slots if necessary).
        </p>

        <Mermaid chart={taskSched} />

        <h4>The greedy: always run the most-frequent eligible task</h4>

        <p>
          Use a max-heap keyed by remaining frequency. Process in rounds of size <code>n + 1</code> (one task plus its
          cooldown window). In each round, pop up to <code>n + 1</code> distinct tasks, decrement their counts, and put
          back the ones still &gt; 0. If the heap empties before the round ends, idle the rest of the round (unless this
          was the last round, in which case stop).
        </p>

        <CodeBlock lang="java">{`public int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char c : tasks) freq[c - 'A']++;

    PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
    for (int f : freq) if (f > 0) heap.offer(f);

    int time = 0;
    while (!heap.isEmpty()) {
        // One round = n + 1 slots
        List<Integer> popped = new ArrayList<>();
        for (int slot = 0; slot <= n; slot++) {
            if (!heap.isEmpty()) popped.add(heap.poll());
        }
        // Decrement and push back the still-pending tasks
        for (int f : popped) {
            if (f - 1 > 0) heap.offer(f - 1);
        }
        // Was this the last round? If so, time only advances by what we did, not the full n+1.
        time += heap.isEmpty() ? popped.size() : n + 1;
    }
    return time;
}`}</CodeBlock>

        <h4>The closed-form alternative</h4>

        <p>
          There&apos;s a slick math version that avoids the heap entirely. Let <code>maxFreq</code> be the most-common
          task&apos;s frequency, and let <code>k</code> be how many tasks tie for that frequency. The schedule looks
          like <code>(maxFreq - 1)</code> full <code>(n + 1)</code>-slot rounds plus a final round of <code>k</code>{" "}
          tasks. If that&apos;s shorter than the total task count, we have enough non-max tasks to fill all idle slots
          without padding — and the answer is just <code>tasks.length</code>.
        </p>

        <CodeBlock lang="java">{`public int leastIntervalFormula(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char c : tasks) freq[c - 'A']++;

    int maxFreq = 0, ties = 0;
    for (int f : freq) {
        if (f > maxFreq) { maxFreq = f; ties = 1; }
        else if (f == maxFreq) ties++;
    }

    int frame = (maxFreq - 1) * (n + 1) + ties;
    return Math.max(frame, tasks.length);
}`}</CodeBlock>

        <Callout variant="info" title="Heap version vs formula version in interviews">
          <p>
            The heap version generalizes (you can extend it if cooldowns vary per task, if priorities change, etc.).
            The formula version is shorter and faster (O(N) vs O(N log K)), but it&apos;s a deeper insight to derive
            on the spot.
          </p>
          <p>
            Reach for the heap version first — it&apos;s easier to argue is correct in real time. If the interviewer
            asks &quot;can you do better,&quot; the formula is the &quot;better&quot; answer.
          </p>
        </Callout>

        <h3>LC 55 / LC 435 · The other two from this module</h3>

        <p>
          You already have the code for these two from the earlier sections. Type them out, submit them on LeetCode,
          watch them go green:
        </p>

        <ul>
          <li><strong>LC 55 · Jump Game</strong> — frontier tracking. ~7 lines.</li>
          <li><strong>LC 435 · Non-overlapping Intervals</strong> — sort by end, count overlaps. ~12 lines.</li>
          <li><strong>LC 134 · Gas Station</strong> — sweep with cumulative deficit. ~14 lines.</li>
          <li><strong>LC 621 · Task Scheduler</strong> — heap version OR formula. ~20 lines or ~10 lines.</li>
        </ul>

        <h3>Recognize the pattern, not the problem</h3>

        <ClassifyChallenge
          title="Greedy works, fails, or works only with constraints?"
          prompt="For each problem statement, decide whether a greedy approach is provably correct, fails (DP needed), or works only under specific input constraints."
          buckets={[
            { id: "works", label: "Greedy works (provable)", color: "emerald" },
            { id: "fails", label: "Greedy fails (DP needed)", color: "rose" },
            { id: "constrained", label: "Greedy works only with specific constraints", color: "amber" },
          ]}
          items={[
            { id: "1", label: "Schedule the maximum number of non-overlapping meetings.", answer: "works", explanation: "Classic interval scheduling. Sort by end time, sweep, pick. Provable by exchange argument." },
            { id: "2", label: "Make change for amount T using coin denominations {1, 5, 10, 25}, minimizing the number of coins.", answer: "constrained", explanation: "Greedy works for US coins because the denominations are 'canonical' — every value is most efficiently made with the largest-fits-first rule. For arbitrary denominations the same algorithm fails." },
            { id: "3", label: "Fill a knapsack of capacity W with 0/1 items to maximize value.", answer: "fails", explanation: "Greedy by value/weight ratio fails — items are atomic, leftover capacity may not be efficiently fillable. Classic DP problem." },
            { id: "4", label: "Find the minimum number of platforms a train station needs given arrival and departure times.", answer: "works", explanation: "Sort arrivals and departures separately, sweep with two pointers tracking concurrent trains. Provably optimal — count the maximum overlap at any moment." },
            { id: "5", label: "Find the minimum number of arrows to burst all balloons (each balloon is an interval; one arrow at point x bursts every balloon containing x).", answer: "works", explanation: "Sort by end, greedy sweep with strict overlap. Same machinery as interval scheduling, provable by exchange." },
            { id: "6", label: "Make change for amount T using coin denominations {1, 3, 4}, minimizing coins.", answer: "fails", explanation: "Counterexample: T=6 → greedy gives 4+1+1 = 3 coins; optimal is 3+3 = 2 coins. Need DP." },
            { id: "7", label: "Find the longest increasing subsequence of an array.", answer: "fails", explanation: "Local 'always extend with smallest' fails because a small element might block a longer chain that started larger. Patience sorting / DP is needed." },
            { id: "8", label: "Schedule jobs with deadlines and unit length to maximize profit (each job has deadline d_i and profit p_i; you can do one job per time slot).", answer: "constrained", explanation: "Greedy works (sort by profit descending, greedily place each job in the latest free slot ≤ its deadline) — but only because all jobs have unit duration. With variable durations, the same rule fails and you need a different approach." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="You design a greedy rule for a scheduling problem and it passes 100% of your hand-traced examples. The interviewer asks: 'How do you know it's correct?' What's the strongest answer?"
          options={[
            { label: "I tested it on examples and it always worked.", explanation: "Empirical testing is evidence, not proof. Greedy bugs often hide on specific input patterns that small hand traces miss — that's literally the failure mode of the {1,3,4}/6 coin example." },
            { label: "I wrote an exchange argument: any optimal solution can be transformed into my greedy's output by swapping choices, without making the optimal worse. So my greedy is at least as good as optimal — i.e., it IS optimal.", correct: true, explanation: "Right. The exchange argument is the standard proof technique for greedy correctness. It directly addresses the concern that greedy might 'miss' a better solution by showing any better solution can be edited into greedy's solution without loss." },
            { label: "Greedy is always correct when the problem is sortable by some key.", explanation: "Many sortable problems aren't greedy-solvable (LIS, 0/1 knapsack are both 'sortable' but need DP). Sortability is a hint, not a guarantee." },
            { label: "I compared it to a brute-force solution on random inputs.", explanation: "Stress testing is a great way to FIND counterexamples, but absence of counterexamples in 1000 trials doesn't prove correctness. The exchange argument actually proves it." },
          ]}
        />

        <PartRecap
          title="What you can now do that you couldn't an hour ago"
          gist="Greedy is the technique that's tempting to use everywhere and only correct in specific places. The skill is recognizing those places — and proving it when you do."
          points={[
            { takeaway: "State the greedy rule explicitly before coding.", detail: "'Sort by end-time, sweep, pick non-overlapping' is a complete description. If you can't say the rule in one sentence, you don't have a greedy yet — you have a vague hope." },
            { takeaway: "Write the exchange argument before submitting.", detail: "Take an optimal solution, find the first place it disagrees with greedy, swap greedy's choice in, verify nothing breaks. If you can't, suspect the greedy is wrong." },
            { takeaway: "Counterexamples are the fastest disproof.", detail: "If you suspect greedy is wrong, write a brute force and stress-test on small random inputs. Disagreement = bug found. This is how you'd debug coin change with {1,3,4}." },
            { takeaway: "Default to DP when in doubt.", detail: "A correct DP solution beats a buggy greedy every time. If you can't write the exchange argument and can't find a counterexample fast, the safe move is DP — even if it's slower." },
            { takeaway: "Recognize the patterns: sort-and-sweep (intervals), frontier-tracking (jump game), heap-driven (task scheduler), prefix-sum (gas station).", detail: "These four cover most provably-correct greedy problems. When you spot the pattern, the implementation is mechanical — the proof is the hard part." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
          <p className="text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-semibold">Up next · Module 25</p>
          <Link
            href="/courses/dsa/modules/bit-manipulation"
            className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 no-underline hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            Bit manipulation →
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            The operators you forgot existed — and the surprising LeetCode patterns they unlock.
          </p>
        </div>
      </section>
      </Checkpoint>
    </article>
  );
}
