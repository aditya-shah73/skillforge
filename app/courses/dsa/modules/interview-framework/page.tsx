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

const CHECKPOINTS = [
  { id: "frameworks", title: "Why frameworks matter under pressure" },
  { id: "understand-match", title: "Understand & Match" },
  { id: "plan", title: "Plan — speak before you code" },
  { id: "implement", title: "Implement — narrate as you code" },
  { id: "review-evaluate", title: "Review & Evaluate" },
  { id: "transcripts", title: "Mock-interview transcripts" },
];

export default function InterviewFrameworkModule() {
  const mod = getModuleBySlug("interview-framework")!;

  // The UMPIRE pipeline
  const umpire = `
flowchart LR
    U["U · Understand<br/>clarify I/O,<br/>constraints,<br/>edges"] --> M["M · Match<br/>recognize the<br/>pattern family"]
    M --> P["P · Plan<br/>algorithm in<br/>plain English"]
    P --> I["I · Implement<br/>narrate every<br/>line"]
    I --> R["R · Review<br/>walk a small<br/>trace by hand"]
    R --> E["E · Evaluate<br/>state final<br/>complexity"]
    style U fill:#ec4899,color:#fff,stroke:#be185d
    style M fill:#f472b6,color:#fff,stroke:#db2777
    style P fill:#f9a8d4,color:#000,stroke:#ec4899
    style I fill:#fbcfe8,color:#000,stroke:#f472b6
    style R fill:#fce7f3,color:#000,stroke:#f9a8d4
    style E fill:#fdf2f8,color:#000,stroke:#fbcfe8
  `.trim();

  // What the interviewer is grading vs. what candidates think they're grading
  const grading = `
flowchart TB
    subgraph C["What candidates think is graded"]
        direction TB
        C1["Did the code compile?"]
        C2["Did all test cases pass?"]
        C3["Was it the optimal Big-O?"]
    end
    subgraph I["What interviewers actually grade"]
        direction TB
        I1["Communication·can you explain your thinking?"]
        I2["Problem-solving·how do you handle being stuck?"]
        I3["Code quality·is it readable, do you spot edge cases?"]
        I4["Collaboration·do you take hints gracefully?"]
        I5["Correctness·yes, but it's one of five axes, not the whole thing"]
    end
    C -.->|"surprise"| I
    style C fill:#1e293b,color:#fff,stroke:#475569
    style I fill:#831843,color:#fff,stroke:#9d174d
    style I1 fill:#fbcfe8,color:#000
    style I2 fill:#fbcfe8,color:#000
    style I3 fill:#fbcfe8,color:#000
    style I4 fill:#fbcfe8,color:#000
    style I5 fill:#fbcfe8,color:#000
  `.trim();

  // Two Sum mini transcript flow
  const twoSumFlow = `
flowchart LR
    Q["Q: 'Two Sum'<br/>nums, target → indices"] --> U["U: 'one solution? duplicates?<br/>can I use the same index twice?'"]
    U --> M["M: 'pair-with-property → HashMap of complement'"]
    M --> P["P: 'one pass, map of value→index,<br/>at each i check (target - nums[i])'"]
    P --> I["I: code while narrating"]
    I --> R["R: trace [2,7,11,15] target 9"]
    R --> E["E: 'O(n) time, O(n) space'"]
    style Q fill:#1e293b,color:#fff
    style U fill:#ec4899,color:#fff
    style M fill:#f472b6,color:#fff
    style P fill:#f9a8d4,color:#000
    style I fill:#fbcfe8,color:#000
    style R fill:#fce7f3,color:#000
    style E fill:#fdf2f8,color:#000
  `.trim();

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ModuleProgress moduleSlug="interview-framework" checkpoints={CHECKPOINTS} />

      <div className="not-prose mb-8">
        <Link href="/courses/dsa" className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline">
          ← Back to DSA in Java
        </Link>
        <div className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 8 · Module 33 · Interview Prep
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-slate-100">{mod.title}</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">{mod.subtitle}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">~1.5–2h · the meta-module that ties everything together</p>
      </div>

      {/* ───────────────── Part 1 · Why frameworks ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="frameworks" title="I understand why a framework matters when nervous" xp={20}>
      <section>
        <h2 id="frameworks">Why frameworks matter under pressure</h2>

        <p>
          You&apos;ve made it through 32 modules. You can write a HashMap from scratch, you know when to reach for
          BFS over DFS, and you can spot a 1D-DP problem from the second sentence. On a quiet Saturday morning,
          with coffee and no audience, you can solve LeetCode mediums confidently.
        </p>

        <p>
          And then a real interview starts, and somehow the screen goes blank. The interviewer reads the problem.
          You read it again. Your hands are slightly cold. You think you should say something — but what? You start
          coding before you&apos;ve thought, hit a wall ten lines in, and now you&apos;re editing in five places at
          once while the silence stretches. By the time you produce something working, you&apos;ve burned 35 of your
          45 minutes and never once explained your reasoning.
        </p>

        <p>
          This module is the antidote to that. Not more problems — you&apos;ve done the problems. What you need is a
          <strong> repeatable process</strong> you can run on autopilot when your prefrontal cortex is busy panicking.
        </p>

        <h3>The cognitive load argument</h3>

        <p>
          Pattern recognition is a high-cognitive-load activity. It depends on holding the problem statement in
          working memory, scanning your mental library of patterns, and pattern-matching against half-remembered
          examples. Working memory is roughly 4 to 7 chunks on a good day — and stress, time pressure, and an
          interviewer staring at you all reduce that capacity.
        </p>

        <p>
          When working memory is overloaded, your <em>brightest</em> capabilities are the first to go. You can still
          write a for-loop in your sleep, but the elegant trick you &quot;definitely knew last week&quot; vanishes.
          This is not a sign that you don&apos;t know the material. It&apos;s a sign that you&apos;re a human in a
          high-stakes interaction — and the fix is not to study more, it&apos;s to <em>off-load process to a
          framework</em> so working memory can focus on the actual problem.
        </p>

        <Callout variant="insight" title="The framework is the scaffolding">
          <p>
            You don&apos;t freeze when the framework tells you what to do next. &quot;Now I clarify inputs.&quot;
            &quot;Now I match a pattern.&quot; &quot;Now I plan in English.&quot; Each step is small enough that you
            can take it even when scared. By the time you&apos;ve finished the first three steps, you&apos;ve
            warmed up, the panic has subsided, and you&apos;re back in problem-solver mode. The framework is the
            <em> bridge</em> between &quot;I just heard the problem&quot; and &quot;I can think clearly.&quot;
          </p>
        </Callout>

        <h3>What the interviewer is actually grading</h3>

        <Mermaid chart={grading} />

        <p>
          Most candidates think the interview is graded the way LeetCode is graded: a green check or a red X.
          It&apos;s not. Engineering interviews evaluate <strong>five axes</strong>, of which final-correctness is
          one — and arguably not the most important one for senior roles.
        </p>

        <ul>
          <li>
            <strong>Communication.</strong> Can you make your thinking visible to a stranger? Can you defend a
            choice when challenged? Can you explain your code such that the interviewer could rebuild it from your
            words alone?
          </li>
          <li>
            <strong>Problem-solving.</strong> When you&apos;re stuck, what do you do? Do you flail and stay silent,
            or do you systematically narrow the problem space?
          </li>
          <li>
            <strong>Code quality.</strong> Is the code readable? Are variables named meaningfully? Did you
            proactively call out edge cases, or did the interviewer have to point them out?
          </li>
          <li>
            <strong>Collaboration.</strong> When the interviewer offers a hint, do you take it gracefully and
            integrate it, or do you defend your wrong path? Do you ask clarifying questions or assume?
          </li>
          <li>
            <strong>Correctness.</strong> Does the code work? But often, &quot;the candidate hit the optimal
            solution while talking through tradeoffs and edge cases&quot; beats &quot;the candidate silently
            produced a working brute-force.&quot;
          </li>
        </ul>

        <p>
          A framework that forces you to <em>narrate</em>, <em>clarify</em>, and <em>self-test</em> is a framework
          that maximizes your score across all five axes — even when your code has a small bug.
        </p>

        <h3>Introducing UMPIRE</h3>

        <Mermaid chart={umpire} />

        <p>
          UMPIRE is a six-stage pipeline coined by interview-prep coaches. It maps cleanly to what experienced
          engineers do anyway, just with names attached so you can run it explicitly under stress:
        </p>

        <ul>
          <li><strong>U · Understand.</strong> Clarify the problem before solving it.</li>
          <li><strong>M · Match.</strong> Pattern-recognize. Which family does this belong to?</li>
          <li><strong>P · Plan.</strong> Whiteboard the algorithm in plain English. State invariants and complexity targets.</li>
          <li><strong>I · Implement.</strong> Code it, narrating every choice as you go.</li>
          <li><strong>R · Review.</strong> Walk through with a small input by hand. Catch off-by-ones.</li>
          <li><strong>E · Evaluate.</strong> Final time and space complexity. What would change at scale?</li>
        </ul>

        <p>
          The rest of this module breaks each stage open. By the end, you&apos;ll have concrete scripts you can run
          almost verbatim on problems you&apos;ve never seen before.
        </p>

        <Quiz
          kind="Quick check"
          question="Why does a process framework matter most when you're nervous, not when you're calm?"
          options={[
            { label: "Calm candidates already produce optimal code, so the framework is wasted on them.", explanation: "Even calm candidates benefit from clarifying questions and complexity narration. The framework is universally useful — but the difference is largest under stress." },
            { label: "Stress reduces working-memory capacity, so off-loading process to an explicit pipeline frees up brain for the actual problem.", correct: true, explanation: "Right. Working memory is finite and shrinks under pressure. A framework removes the question 'what do I do now?' from working memory entirely — the answer is always 'the next stage of UMPIRE.' That frees capacity to think about the problem itself." },
            { label: "Interviewers grade on framework adherence specifically.", explanation: "They don't grade on framework names. They grade on the behaviors a framework produces — clarification, narration, self-review." },
            { label: "Frameworks make you faster.", explanation: "Often slightly slower up front, but dramatically less likely to flail. The win is consistency, not speed." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A candidate produces optimal O(n) code in silence, and another produces an O(n²) solution while clearly explaining tradeoffs and edge cases. Who typically scores higher in a senior-level interview?"
          options={[
            { label: "The silent O(n) candidate — correctness is what matters.", explanation: "At a junior level, maybe. At senior level, communication and tradeoff awareness often weigh as much as raw correctness, because real engineering work demands them." },
            { label: "The O(n²) candidate, in many real loops, because communication and reasoning are graded heavily.", correct: true, explanation: "Right — especially for senior roles. Production engineering rarely rewards lone optimal code; it rewards engineers who can explain choices, weigh tradeoffs, and bring others along. Silent optimality is incomplete; loud reasoning compensates for a slower algorithm. (Caveat: at the bar-line, both candidates need to converge on something working — silence does eventually fail you.)" },
            { label: "Same — they cancel out.", explanation: "They don't cancel; the rubric weighs communication explicitly." },
            { label: "Depends on the interviewer's mood.", explanation: "Calibrated rubrics exist precisely to remove mood. The communication axis is real and consistent across calibrated interviewers." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 2 · Understand & Match ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="understand-match" title="I can clarify a problem and match it to a pattern" xp={25}>
      <section>
        <h2 id="understand-match">Understand &amp; Match</h2>

        <p>
          The first two stages of UMPIRE happen before you write a single line of code. They take 3 to 5 minutes
          combined. Skipping them is the most expensive mistake candidates make — and it&apos;s tempting to skip
          them because you&apos;re anxious to start coding. Resist.
        </p>

        <h3>U · Understand</h3>

        <p>
          The interviewer reads the problem. You read it back. You ask <strong>2 to 3 clarifying questions</strong>
          {" "}— even if you think you understand it. Why even if? Three reasons:
        </p>

        <ul>
          <li>
            <strong>You probably don&apos;t fully understand it.</strong> Problem statements are deliberately
            ambiguous in interviews. There&apos;s almost always a constraint that wasn&apos;t spelled out.
          </li>
          <li>
            <strong>The interviewer is grading curiosity.</strong> A candidate who asks zero clarifying questions
            looks either incurious or overconfident. Both are bad signals.
          </li>
          <li>
            <strong>It buys you thinking time.</strong> While the interviewer answers, your subconscious is already
            pattern-matching. By the time the answers come back, you often already know the approach.
          </li>
        </ul>

        <h4>What to clarify, in order</h4>

        <ol>
          <li><strong>Inputs.</strong> Types, ranges, constraints. Negative? Empty? Unicode? Sorted?</li>
          <li><strong>Outputs.</strong> Format, what to return, what to do on no-answer.</li>
          <li><strong>Constraints.</strong> Memory limits, real-time, in-place required?</li>
          <li><strong>Edge cases.</strong> Empty input, single element, all-same, max-size.</li>
        </ol>

        <h4>Worked example: clarifying &quot;longest substring without repeating characters&quot;</h4>

        <p>
          The interviewer says: <em>&quot;Given a string, return the length of the longest substring without
          repeating characters.&quot;</em> Sounds simple. Now run the clarification pass. A good candidate asks
          three or four of these:
        </p>

        <CodeBlock lang="plain">{`Q1: "When you say substring — you mean a contiguous run, right?
     Not a subsequence?"
A:  "Yes, contiguous."

Q2: "What characters can the input contain? ASCII only,
     or full Unicode? Case-sensitive — does 'A' equal 'a'?"
A:  "Lowercase English letters. Case-sensitive doesn't apply
     since they're all lowercase."

Q3: "Empty string — what should I return? Zero?"
A:  "Yes, zero."

Q4: "What's a typical input size? Are we talking hundreds,
     thousands, millions of characters?"
A:  "Up to 50,000."`}</CodeBlock>

        <p>
          Notice what just happened. Without writing any code, you now know:
        </p>

        <ul>
          <li>The character set is small (26 lowercase letters → array of size 26 works as a frequency map).</li>
          <li>The expected size is moderate — O(n) is fine, O(n²) might also be fine, O(n³) won&apos;t cut it.</li>
          <li>The empty input is well-defined.</li>
          <li>The substring-vs-subsequence ambiguity (a real one in many problems) is resolved.</li>
        </ul>

        <p>
          You&apos;ve also signaled to the interviewer: I am careful, I think about edge cases, I don&apos;t code
          on autopilot. That&apos;s a free signal you can&apos;t purchase by writing better code.
        </p>

        <Callout variant="warn" title="Don't ask questions whose answers are already in the prompt">
          <p>
            Re-asking what the interviewer just said wastes time and signals lack of attention. Asking &quot;is
            the array sorted?&quot; when the prompt said &quot;given a sorted array&quot; is a small but real ding.
            Listen carefully on the first read; then ask <em>beyond</em> the prompt.
          </p>
        </Callout>

        <h3>M · Match — pattern recognition pass</h3>

        <p>
          With the problem clarified, your second job is to ask: <em>what does this look like?</em> You&apos;ve
          spent 32 modules learning the patterns; this is where they pay off. The match step is fast — usually 30
          seconds to a minute — but it sets the entire direction.
        </p>

        <p>
          A non-exhaustive cheat sheet of trigger phrases and the patterns they suggest:
        </p>

        <ul>
          <li><strong>&quot;subarray with property X&quot;</strong> → sliding window or prefix sum</li>
          <li><strong>&quot;substring with property X&quot;</strong> → sliding window with a frequency map</li>
          <li><strong>&quot;shortest path in unweighted graph&quot;</strong> → BFS</li>
          <li><strong>&quot;shortest path with non-negative weights&quot;</strong> → Dijkstra</li>
          <li><strong>&quot;all paths / connected components&quot;</strong> → DFS or union-find</li>
          <li><strong>&quot;k-th smallest / largest&quot;</strong> → heap (size k) or quickselect</li>
          <li><strong>&quot;top K most frequent&quot;</strong> → HashMap + bounded heap</li>
          <li><strong>&quot;sorted array, find target&quot;</strong> → binary search</li>
          <li><strong>&quot;find peak / boundary in monotonic property&quot;</strong> → binary search on answer</li>
          <li><strong>&quot;decision at index i depending on i-1&quot;</strong> → 1D DP</li>
          <li><strong>&quot;decision over a 2D grid / two strings&quot;</strong> → 2D DP</li>
          <li><strong>&quot;all combinations / permutations / partitions&quot;</strong> → backtracking</li>
          <li><strong>&quot;cycle in linked list / array&quot;</strong> → fast/slow pointers</li>
          <li><strong>&quot;next greater / smaller element&quot;</strong> → monotonic stack</li>
          <li><strong>&quot;intervals — overlap, merge, schedule&quot;</strong> → sort + sweep</li>
          <li><strong>&quot;words / prefix lookup&quot;</strong> → trie</li>
          <li><strong>&quot;dynamic connectivity / merging groups&quot;</strong> → union-find</li>
        </ul>

        <Callout variant="insight" title="Match is a vocabulary, not a lookup">
          <p>
            Notice the cheat sheet is keyed on <em>linguistic phrasing</em>, not problem topic. That&apos;s the
            point of the Match stage: interviewers vary the topic (intervals, graphs, strings) but the underlying
            structural cues are remarkably stable. &quot;k-th&quot; almost always means heap. &quot;all
            paths&quot; almost always means recursion. Build this association in your head until it&apos;s
            automatic, and most LeetCode mediums become unscary.
          </p>
        </Callout>

        <h4>When you can&apos;t match immediately</h4>

        <p>
          Sometimes the problem doesn&apos;t announce itself. When that happens, run two passes:
        </p>

        <ol>
          <li>
            <strong>Brute force first.</strong> &quot;If I had no constraints, I&apos;d try every pair / every
            substring / every subset. That&apos;s O(n²) / O(2ⁿ).&quot; State this out loud — it&apos;s a valid
            partial answer.
          </li>
          <li>
            <strong>Find what&apos;s wasteful.</strong> &quot;The brute force recomputes X. Can I cache it? Can I
            avoid redundant work via two-pointer / DP / a hash structure?&quot; The optimization is usually one of
            those three.
          </li>
        </ol>

        <ClassifyChallenge
          title="Which pattern matches the problem statement?"
          prompt="For each problem statement, click the pattern family it most likely belongs to. The point is reflexive recognition — read each one once, decide quickly."
          buckets={[
            { id: "sliding", label: "Sliding window", color: "rose" },
            { id: "bfs", label: "BFS", color: "sky" },
            { id: "heap", label: "Heap", color: "emerald" },
            { id: "dp", label: "1D DP", color: "amber" },
            { id: "binsearch", label: "Binary search", color: "violet" },
            { id: "backtrack", label: "Backtracking", color: "indigo" },
          ]}
          items={[
            { id: "1", label: "Find the longest substring containing at most K distinct characters.", answer: "sliding", explanation: "'Substring + property + at most K' is the classic sliding-window signature. Expand right, contract left when the K-distinct condition breaks." },
            { id: "2", label: "Given a maze grid, find the minimum number of steps from start to exit.", answer: "bfs", explanation: "'Shortest path in an unweighted graph' (a grid is an unweighted graph). BFS gives shortest path by layer." },
            { id: "3", label: "Find the K-th largest number in an unsorted array.", answer: "heap", explanation: "'K-th largest' → bounded min-heap of size K. The root is the K-th largest after one pass." },
            { id: "4", label: "Given a list of coin denominations and a target, count the number of ways to make change.", answer: "dp", explanation: "'Number of ways to reach a target' over a 1D state (the remaining amount) is unbounded-knapsack DP." },
            { id: "5", label: "In a sorted rotated array, find a target value in O(log n).", answer: "binsearch", explanation: "Sorted (even rotated) + O(log n) → binary search, with the rotation handled by checking which half is monotonic." },
            { id: "6", label: "Generate all valid parentheses combinations of length 2n.", answer: "backtrack", explanation: "'All combinations matching a constraint' → backtracking. Recurse with counters of open/close used so far, prune invalid branches." },
            { id: "7", label: "Given a stream, output the median of the elements seen so far at each step.", answer: "heap", explanation: "Two-heap median: max-heap for the lower half, min-heap for the upper half. Roots give the median in O(1) after each O(log n) insert." },
            { id: "8", label: "Find the smallest window in a string containing all characters of a given pattern.", answer: "sliding", explanation: "'Smallest substring containing all of X' is the canonical hard sliding-window problem (LC 76). Frequency map + window contraction once the condition is met." },
          ]}
        />

        <Quiz
          kind="Pattern check"
          question="The interviewer says: 'You're given a list of meeting time intervals. Return the minimum number of conference rooms needed.' Which pattern fires first?"
          options={[
            { label: "BFS — meetings are nodes, conflicts are edges.", explanation: "Modeling as a graph is technically possible but massive overkill — the natural pattern is intervals, not graph traversal." },
            { label: "Sort the intervals, then sweep with a heap of end-times.", correct: true, explanation: "Right. Intervals + 'minimum number of resources' is the classic sort-and-sweep with a min-heap of end-times: pop any meeting that's ended before the next starts; the heap size at any moment is the rooms in use; the max heap size over the run is the answer." },
            { label: "Backtracking over assignments.", explanation: "Backtracking would explore an exponential space. The greedy sort-and-sweep is O(n log n) and provably optimal." },
            { label: "1D DP keyed on time.", explanation: "DP over time would work but is heavier than needed and brittle on ranges. Sort-and-sweep is the canonical answer." },
          ]}
        />

        <Quiz
          kind="Pattern check"
          question="The interviewer asks: 'Given a string, return the length of its longest palindromic substring.' What's a sensible Match-stage thought?"
          options={[
            { label: "'Substring + property' — sliding window.", explanation: "Sliding window assumes a monotonic 'expand-contract' invariant. Palindromes don't have that — adding a character can break or restore palindromicity unpredictably." },
            { label: "'Expand around center' for each index, or 2D DP over substring endpoints — both are standard for this problem.", correct: true, explanation: "Right. The two canonical solutions: (1) for each index treat it as the center of an odd palindrome and expand outward, plus the same for even-length centers — O(n²) with O(1) space; (2) 2D DP where dp[i][j] = whether s[i..j] is a palindrome — O(n²) time and space. Either is acceptable; expand-around-center is usually preferred for its space efficiency." },
            { label: "Hash map of seen characters.", explanation: "A frequency map doesn't directly help find palindromes, which depend on positional symmetry, not counts." },
            { label: "Backtracking over all substrings.", explanation: "All substrings is O(n²), checking each for palindromicity is O(n) → O(n³). Both standard solutions are O(n²)." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 3 · Plan ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="plan" title="I can plan an algorithm in plain English before coding" xp={25}>
      <section>
        <h2 id="plan">Plan — speak before you code</h2>

        <p>
          Once you&apos;ve clarified and matched, you have a candidate approach. <strong>Do not start typing
          yet.</strong> First, plan the algorithm out loud, in plain English, while the interviewer listens. This
          is the single highest-leverage stage of UMPIRE: a 90-second plan saves 10 minutes of mid-implementation
          confusion.
        </p>

        <h3>Why plan before coding?</h3>

        <ul>
          <li>
            <strong>You catch design errors at the cheapest possible moment.</strong> Realizing your data structure
            is wrong while you&apos;re still talking is free. Realizing it 20 lines into typing is expensive.
          </li>
          <li>
            <strong>The interviewer can correct you cheaply.</strong> If your plan is heading off a cliff, they can
            redirect with a single sentence. If you&apos;re mid-code, redirecting requires deleting visible work,
            which is psychologically hard for both of you.
          </li>
          <li>
            <strong>You demonstrate you know the structure of solutions.</strong> Anyone can copy a template. Few
            candidates can articulate <em>why</em> a particular structure is right for a particular problem.
          </li>
          <li>
            <strong>You get verbal commitment.</strong> Saying &quot;I&apos;ll use a HashMap of value→index, then a
            single pass...&quot; and getting a nod from the interviewer is the closest you&apos;ll get to
            mid-flight reassurance.
          </li>
        </ul>

        <h3>What goes into a plan</h3>

        <ol>
          <li><strong>Data structures.</strong> Which ones, and why each one.</li>
          <li><strong>Algorithm in 3–5 sentences.</strong> What you&apos;ll iterate over, what you maintain, when you stop.</li>
          <li><strong>Invariant.</strong> What stays true after each step? This is the soul of correctness.</li>
          <li><strong>Complexity target.</strong> Time and space, in Big-O. State it before coding so you can&apos;t back into it.</li>
          <li><strong>Tradeoffs vs. alternatives.</strong> If you considered another approach, name it and say why you rejected it.</li>
        </ol>

        <h3>A concrete planning monologue</h3>

        <p>
          Suppose the problem is &quot;Top K Frequent Elements&quot; — return the K most frequent integers in a list.
          Here&apos;s what a strong candidate sounds like at the Plan stage:
        </p>

        <CodeBlock lang="plain">{`"Okay, let me plan this out before I code.

I need two pieces: a count of each value, and then a way to pull
out the top K by count.

For counting, a HashMap from value to count is the obvious choice.
One pass over the input array, freq.merge(x, 1, Integer::sum).
That's O(n) time and O(n) space in the worst case — every element
distinct.

For the top K, I'll use a bounded min-heap of size K, ordered by
count. For each map entry, I offer it to the heap, and if the heap
exceeds size K, I poll. The smallest count survives at the root,
and anything smaller than it gets evicted. After processing all
entries, the heap contains the K most frequent.

That's O(n log K) for the heap pass, dominating O(n) for counting.
Total: O(n log K) time, O(n) space.

A worth-mentioning alternative: bucket sort. Since frequencies are
bounded by n, you can have an array of buckets indexed by frequency
and walk it from high to low until you've collected K. That's O(n)
both time and space — strictly better. But the heap solution is
shorter and the standard answer; I'll start there. Want me to
proceed?"`}</CodeBlock>

        <p>
          Notice what this monologue does:
        </p>

        <ul>
          <li>It states data structures and <em>why</em>, not just what.</li>
          <li>It gives the algorithm in three short paragraphs, no code.</li>
          <li>It states the invariant implicitly (&quot;the K most frequent so far&quot;).</li>
          <li>It commits to a complexity target: O(n log K) / O(n).</li>
          <li>It mentions a known better alternative (bucket sort) — and explains the choice.</li>
          <li>It ends with permission-asking: &quot;Want me to proceed?&quot; This invites course-correction.</li>
        </ul>

        <Callout variant="insight" title="The 'want me to proceed?' moment">
          <p>
            Ending the plan with an explicit handoff (&quot;Does that sound right? Should I start coding?&quot;)
            does two things. It signals that you&apos;re collaborative, not a lone wolf. And it surfaces hidden
            constraints — sometimes the interviewer says &quot;actually, can you do it in O(n)?&quot; or
            &quot;would your approach work with a custom comparator?&quot;, which would be a costly redirection
            after you&apos;ve already coded.
          </p>
        </Callout>

        <h3>What a weak plan sounds like</h3>

        <p>For contrast, here&apos;s the planning monologue that loses points:</p>

        <CodeBlock lang="plain">{`"Okay so I'll just use a HashMap and then sort it. Let me start
coding."`}</CodeBlock>

        <p>
          Why this is bad: no complexity target, no invariant, no mention of K, no mention of why HashMap or why
          sort. The interviewer has nothing to grade except the eventual code. And if you sort all entries when K
          is small, you&apos;ve quietly chosen O(n log n) over O(n log K) without acknowledging it. That&apos;s a
          real ding even if your code works.
        </p>

        <h3>Pseudocode is fine — but don&apos;t live there</h3>

        <p>
          If your interviewer gives you a whiteboard or shared doc, sketching pseudocode during Plan is great:
        </p>

        <CodeBlock lang="plain">{`for each x in nums:
    freq[x] += 1
heap = MinHeap of size k by freq
for each (val, count) in freq:
    heap.offer((val, count))
    if heap.size() > k: heap.poll()
return [val for (val, _) in heap]`}</CodeBlock>

        <p>
          But don&apos;t spend more than a minute on pseudocode — it&apos;s a thinking aid, not a deliverable.
          Convert to real Java once you and the interviewer agree on the shape.
        </p>

        <Quiz
          kind="Plan check"
          question="A candidate says: 'I'll use DFS to find connected components, then for each component count the area, then return the max.' What's missing from the plan?"
          options={[
            { label: "Nothing — that's a complete plan.", explanation: "It's a fine sketch but it's missing the data structure (visited set / matrix), the invariant, and the complexity. A grader would mark this as 'partial plan.'" },
            { label: "The data structure for tracking visited cells, the invariant of DFS, and the time/space complexity.", correct: true, explanation: "Right. A complete plan names each piece: 'a boolean[][] visited matrix; DFS from each unvisited '1' cell, marking visited as I go and accumulating area; max across all components; O(rows·cols) time, O(rows·cols) space for the visited matrix and the recursion stack in the worst case.' That's three additional details that take 15 seconds to say and signal 'I think structurally.'" },
            { label: "A clearer pseudocode block.", explanation: "Pseudocode is optional. The missing items are conceptual, not syntactic." },
            { label: "Whether to use DFS or BFS.", explanation: "Either works for connected components on a grid. The missing items are not the choice between DFS and BFS." },
          ]}
        />

        <Quiz
          kind="Plan check"
          question="At the end of your plan, you ask 'does that sound reasonable?' The interviewer says 'almost — but I'd like you to handle it without extra space if possible.' What do you do?"
          options={[
            { label: "Apologize and quickly start coding the original plan anyway, hoping they'll forget.", explanation: "Bad signal. Ignoring direct interviewer feedback is one of the strongest negative signals there is." },
            { label: "Pause, think out loud about an in-place variant, and re-plan briefly before coding.", correct: true, explanation: "Right. The interviewer just gave you a course correction at the cheapest possible moment — and is grading whether you take guidance well. Re-plan: 'Okay, in-place. That probably means I can mark cells in the input grid itself instead of a visited matrix — for example, set visited cells to '0' as I DFS through them. Let me think through whether that's safe... yes, since I only need the count, I don't care about preserving the input. New plan: same DFS but mark cells in-place. Sound good?' That's a senior-level response." },
            { label: "Argue that the original plan is more readable.", explanation: "Defending a rejected approach when the interviewer has flagged it is rarely a winning move — the rubric grades collaboration." },
            { label: "Switch to a totally different algorithm without explaining why.", explanation: "An unexplained pivot is almost as bad as silence. Explain the new plan briefly so the interviewer can grade your reasoning." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 4 · Implement ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="implement" title="I can narrate as I code" xp={25}>
      <section>
        <h2 id="implement">Implement — narrate as you code</h2>

        <p>
          You have a plan. Now you type. The single most common mistake at this stage is going silent. The
          interviewer has been watching you reason through the problem; they need to keep watching as you turn that
          reasoning into Java. <strong>Talk through every line.</strong> Not every keystroke — that&apos;s
          exhausting — but every meaningful decision.
        </p>

        <h3>What &quot;narrating&quot; sounds like</h3>

        <p>You&apos;re narrating the <em>why</em>, not the <em>what</em>. Bad narration:</p>

        <CodeBlock lang="plain">{`"I'm declaring a variable named left and setting it to zero..."`}</CodeBlock>

        <p>
          That&apos;s reading the code aloud. Useless. Good narration:
        </p>

        <CodeBlock lang="plain">{`"I'll use a left and right pointer to bound the window. Left starts
at zero — the leftmost possible window — and right will sweep right.
Inside the loop, I expand the window by adding nums[right] to the
sum. As soon as the window's sum exceeds target, I shrink from the
left by subtracting nums[left] and incrementing left. After every
adjustment, the window [left, right] satisfies the invariant:
sum <= target. So I can record its length as a candidate answer
right there."`}</CodeBlock>

        <p>
          Notice the narration includes:
        </p>

        <ul>
          <li>Why the variable exists (&quot;to bound the window&quot;).</li>
          <li>Why the initial value is correct (&quot;leftmost possible window&quot;).</li>
          <li>The loop&apos;s invariant in plain English.</li>
          <li>Why a particular check is in a particular place.</li>
        </ul>

        <h3>Pre-emptively call out tricky spots</h3>

        <p>
          Senior candidates flag known foot-guns <em>before</em> they cause bugs. This signals language fluency and
          experience. A few examples:
        </p>

        <CodeBlock lang="plain">{`"I'm using (low + high) >>> 1 instead of (low + high) / 2 — the
unsigned shift avoids the integer-overflow bug when low and high
are both close to MAX_VALUE."

"Note I'm using Integer.compare here instead of a - b. With the
subtraction shortcut, MAX_VALUE - (-1) overflows to MIN_VALUE
and you'd get a sign-flipped comparator that silently produces
wrong-order output."

"I'm checking 'if (head == null || head.next == null) return head'
up front — empty list and single-element list are the two edge
cases the rest of the code can't handle cleanly."

"I'll pre-fill the dp array with -1 to mean 'not computed' rather
than 0, since 0 is a valid answer for some inputs and would cause
a memoization collision."

"I want to be careful with the modular arithmetic here: I take the
mod after each addition, not just at the end, so the intermediate
sum can't overflow long."`}</CodeBlock>

        <Callout variant="insight" title="Pre-emptive callouts are double-purpose">
          <p>
            They prevent the bug, and they signal that you know about the bug. Even if the interviewer would have
            forgiven the unflagged version, the flagged one earns extra credit on the &quot;language fluency&quot;
            and &quot;edge cases&quot; axes. These callouts are nearly free — they take five seconds to say.
          </p>
        </Callout>

        <h3>Concrete transcript: implementing Two Sum</h3>

        <p>
          Here&apos;s what a confident, narrated implementation of Two Sum sounds like in real time. Read it slowly
          — pretend you&apos;re saying it.
        </p>

        <CodeBlock lang="plain">{`"Okay, plan is clear: HashMap from value to index, single pass.
For each i, I check if (target - nums[i]) is already in the map.
If yes, I return [the stored index, i]. If no, I record nums[i] -> i
and continue. That gives O(n) time, O(n) space.

I'll start the method signature: public int[] twoSum, takes int[]
nums and int target, returns int[].

Inside, Map<Integer, Integer> seen = new HashMap<>(). Naming it
'seen' rather than 'map' so a reader knows what it represents:
'values I've seen so far, mapped to where I saw them.'

Now the loop: for (int i = 0; i < nums.length; i++).

Inside the loop, int complement = target - nums[i] — that's the
number I'd need to pair with nums[i] to hit the target.

If seen.containsKey(complement), I've found my pair. Return
new int[]{seen.get(complement), i}. The stored index is smaller
than i because the map only contains values from earlier in the
loop — so the order is naturally ascending.

Otherwise, record this position: seen.put(nums[i], i). Note I
record nums[i] mapped to i, not the other way around — I'm later
going to look up by *value*, so value is the key.

Edge case: the problem guarantees exactly one solution, so I don't
need a 'no answer' branch. But to be safe in case the contract is
violated, I'll throw at the bottom: throw new IllegalArgumentException
('no two-sum exists'). Or return new int[0] — your preference; I'll
throw because silent return is a debugging nightmare in production.

Done. Let me trace it on [2, 7, 11, 15] target 9 to verify..."`}</CodeBlock>

        <Mermaid chart={twoSumFlow} />

        <p>
          The corresponding Java:
        </p>

        <CodeBlock lang="java">{`public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {
            return new int[] { seen.get(complement), i };
        }
        seen.put(nums[i], i);
    }
    throw new IllegalArgumentException("no two-sum exists");
}`}</CodeBlock>

        <h3>What to do when you get stuck mid-implementation</h3>

        <p>
          Even a perfect plan sometimes hits a wall during coding. The exact wrong move is silence. The right move
          is to <strong>name the stuck-ness</strong>:
        </p>

        <CodeBlock lang="plain">{`"Hmm — I just realized my recursion needs to know not just the
current index but also whether I've used the skip-once option.
That's a second state dimension I didn't account for in the plan.
Let me back up. I think dp needs to be dp[i][used], and the
recurrence becomes..."

"Okay, I'm going in circles on this index arithmetic. Let me step
back and trace through with a concrete example: array of length 5,
left=0, right=4, mid=2. After this iteration..."

"I want to confirm my understanding before I keep going — when
you say 'rotate the matrix in place,' you mean a 90-degree
rotation, right? Just want to be sure."`}</CodeBlock>

        <Callout variant="warn" title="Silence is the worst signal">
          <p>
            Five seconds of thinking out loud always beats sixty seconds of silent staring. Even &quot;Let me
            think about this for a moment...&quot; followed by a slight pause is fine. Pure silence under pressure
            reads as a freeze, not as deep thought, and the interviewer can&apos;t help you if they don&apos;t
            know what you&apos;re stuck on.
          </p>
        </Callout>

        <Quiz
          kind="Implement check"
          question="You've just written `int mid = (low + high) / 2;` in a binary search. The interviewer doesn't say anything. What's the senior move?"
          options={[
            { label: "Move on — they didn't object.", explanation: "Silent acceptance is not endorsement; the interviewer may simply be saving the comment for later, or grading whether you spot it yourself." },
            { label: "Pre-emptively flag it: 'I'm using / 2 here, but for very large bounds that can overflow — I'll switch to (low + high) >>> 1, which is the same thing but safe under overflow.'", correct: true, explanation: "Right. The classic mid-overflow bug is well-documented (Java's binary search itself had it for nine years). Calling it out before being asked is one of the cleanest 'experienced engineer' signals there is. Even if the bounds in this problem can't overflow, mentioning the awareness costs nothing." },
            { label: "Replace it silently with bitwise tricks.", explanation: "The fix is right but the silence isn't — you'd lose the credit for noticing." },
            { label: "Argue that overflow won't happen with these inputs.", explanation: "Even if true for the current bounds, defending an unsafe pattern weakens the impression. Just flag and fix." },
          ]}
        />

        <Quiz
          kind="Implement check"
          question="Mid-implementation, you realize your recurrence is wrong and the data structure needs another dimension. What should you say next?"
          options={[
            { label: "Nothing — quietly delete and rewrite.", explanation: "Silent deletion is jarring for the interviewer and forfeits the chance to demonstrate problem-solving — they don't know what you discovered." },
            { label: "Name the discovery, briefly re-plan, then continue: 'I just noticed the state needs two dimensions, not one — let me update the recurrence...'", correct: true, explanation: "Right. Naming the discovery is graded positively. It shows that you debug your own thinking, and that you self-correct without being prompted. The brief re-plan also gives the interviewer a chance to confirm the new direction before you commit to it." },
            { label: "Apologize repeatedly for the mistake.", explanation: "Excessive apologizing reads as low confidence. State the discovery as a finding, not a confession." },
            { label: "Keep coding the wrong solution to avoid looking confused.", explanation: "This is the worst path — you'll just produce a broken solution and run out of time. Self-correction is rewarded; doubling down on a wrong approach is not." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 5 · Review & Evaluate ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="review-evaluate" title="I can self-test and state final complexity" xp={30}>
      <section>
        <h2 id="review-evaluate">Review &amp; Evaluate</h2>

        <p>
          The last two stages of UMPIRE are the ones nervous candidates skip — they think the moment the code
          compiles, they&apos;re done. Wrong. Reviewing and evaluating are where you catch the bugs that lose
          interviews and where you signal that you understand your own code at a complexity level.
        </p>

        <h3>R · Review — walk through with a small input by hand</h3>

        <p>
          Once you&apos;ve typed the solution, <strong>do not run it.</strong> (You usually can&apos;t in a coding
          interview anyway.) Instead, narrate a hand-trace through a small input. This catches three classes of
          bugs that compilation can&apos;t:
        </p>

        <ul>
          <li><strong>Off-by-one errors.</strong> Loop bounds, array indexing, &quot;is the right edge inclusive?&quot;</li>
          <li><strong>Edge-case crashes.</strong> Empty input, single element, all-same elements, max-size input.</li>
          <li><strong>Subtle logic bugs.</strong> The early-return is in the wrong place; the visited check happens after the recursion instead of before.</li>
        </ul>

        <h4>The four standard test inputs</h4>

        <ol>
          <li><strong>Empty.</strong> What if <code>nums.length == 0</code>? Does your code crash, return a sentinel, or compute correctly?</li>
          <li><strong>Single element.</strong> Does the loop body even run? What does the answer reduce to?</li>
          <li><strong>All same.</strong> Helpful for problems where uniqueness or comparisons matter — heaps, dedup, hash sets.</li>
          <li><strong>The medium example from the problem statement.</strong> Trace it index by index, narrating what each variable holds. This is the one where most off-by-ones surface.</li>
        </ol>

        <Callout variant="warn" title="The most common review failure: mental shortcutting">
          <p>
            Candidates often &quot;trace&quot; their code by re-reading it rather than executing it on a real
            input. Re-reading rarely catches bugs; the eye glides over the code like fluent prose. Pick a real
            input, write down the values of each variable on each iteration. The ten seconds it takes to slow down
            is what catches the off-by-one.
          </p>
        </Callout>

        <h3>E · Evaluate — final complexity, and what changes at scale</h3>

        <p>
          Once Review passes, state the final time and space complexity. Even if you said it during Plan, repeat it
          now — the code is in front of you, and you can verify the claim.
        </p>

        <CodeBlock lang="plain">{`"Let me state final complexity. The loop runs n times — that's
the outer cost. Inside, the HashMap operations (containsKey, get,
put) are O(1) amortized. So total time: O(n). Space: the HashMap
holds up to n entries in the worst case, so O(n) space. The output
array is O(1) since it's just two indices.

What would change at scale? At n = 10^9, the O(n) is fine but the
O(n) space might exceed memory. If we needed to streamline:
- Approximate counts via Count-Min Sketch — sublinear space at
  the cost of some accuracy.
- If the input were sorted, we could two-pointer it in O(1) extra
  space, no map needed.

But for the contract as given, O(n)/O(n) is optimal."`}</CodeBlock>

        <p>
          That last paragraph — &quot;what would change at scale&quot; — is the bonus credit. It signals that you
          think beyond the toy input size and recognize the difference between &quot;optimal for this problem&quot;
          and &quot;optimal at scale.&quot; You don&apos;t have to give it on every problem, but offering it once
          per interview is worth a noticeable bump in the rubric.
        </p>

        <h3>Complete worked transcript: Container With Most Water</h3>

        <p>
          Below is a full UMPIRE walk-through of <strong>LC 11 · Container With Most Water</strong>: given an array
          of heights, find the two indices that form the largest container of water. This is the kind of transcript
          you&apos;d want to be able to produce reflexively for any medium.
        </p>

        <CodeBlock lang="plain">{`────── U · UNDERSTAND ──────

Me: "Let me read it back. I have an array of non-negative
integers, height[i] is the height at position i. I pick two
indices i and j; the container holds water of volume
(j - i) * min(height[i], height[j]). I want to maximize this
volume."

Me: "Quick clarifying questions:
     - Are heights always non-negative? Any zeroes allowed?
     - Is the array guaranteed non-empty? Length >= 2?
     - Do i and j need to be distinct?"

Interviewer: "Heights are non-negative, zeros allowed.
              Length is between 2 and 10^5. Yes i != j."

────── M · MATCH ──────

Me: "Okay, signature is 'two indices to maximize a function over
pairs.' Brute force: O(n^2), check all pairs. With n up to 10^5,
n^2 is 10^10, too slow.

But there's monotonicity here — when I have a wide container
(i, j) and I move one pointer inward, the width strictly
decreases, but the height could increase. The classic two-pointer
pattern: start at the widest possible, narrow inward, always move
the *shorter* side because moving the taller side could only
decrease both width and height — strictly worse."

────── P · PLAN ──────

Me: "Concrete plan:
     - left = 0, right = n - 1, best = 0.
     - While left < right:
       - Compute current = (right - left) * min(h[left], h[right]).
       - best = max(best, current).
       - If h[left] < h[right], left++; else right--.
       - (Tie: doesn't matter which we move; pick one consistently.)
     - Return best.

     Invariant: best holds the maximum container area considering
     all pairs (i, j) where the inner ones haven't been examined
     yet — but the optimal (i, j) is guaranteed to be among them
     because we never discard a side that could improve.

     Time: O(n), one pass. Space: O(1).

     Sound good?"

Interviewer: "Sounds good. Go ahead."

────── I · IMPLEMENT ──────

Me: [typing while narrating]
"public int maxArea(int[] height) — int return, int[] input.

int left = 0, right = height.length - 1, best = 0.

while (left < right) — strict inequality so the two pointers
don't cross or land on the same index.

int width = right - left.
int h = Math.min(height[left], height[right]).
best = Math.max(best, width * h).

Now move the shorter side inward.
if (height[left] < height[right]) left++;
else right--;

Note: I'm using strict less-than for the comparison. If they're
equal, I move 'right'. It doesn't actually matter which I move
on a tie because both sides are limiting; a different choice
would explore a different path but neither can improve on the
current area without a strictly taller bar somewhere inside.

Return best."

────── R · REVIEW ──────

Me: "Let me trace [1, 8, 6, 2, 5, 4, 8, 3, 7].
     left=0 (h=1), right=8 (h=7): width=8, h=1, area=8. best=8.
       h[left]=1 < h[right]=7, left++.
     left=1 (h=8), right=8 (h=7): width=7, h=7, area=49. best=49.
       h[left]=8 > h[right]=7, right--.
     left=1 (h=8), right=7 (h=3): width=6, h=3, area=18.
       h[right]=3 smaller, right--.
     left=1 (h=8), right=6 (h=8): width=5, h=8, area=40.
       Tie at 8 — my code does right--.
     left=1, right=5 (h=4): width=4, h=4, area=16. right--.
     left=1, right=4 (h=5): width=3, h=5, area=15. right--.
     left=1, right=3 (h=2): width=2, h=2, area=4. right--.
     left=1, right=2 (h=6): width=1, h=6, area=6. right--.
     left=1, right=1: loop exits.
     Return 49. Matches the expected answer.

     Edge cases:
     - Length 2, [3, 7]: left=0, right=1, area=1*3=3. Correct.
     - All zeros, [0, 0, 0]: every area is 0; returns 0. Correct.
     - Strictly decreasing, [9, 8, 7, 6]: best happens with the
       two ends, area = 3 * 6 = 18. Correct."

────── E · EVALUATE ──────

Me: "Final complexity:
     - Time: O(n). Each iteration moves exactly one of the two
       pointers strictly inward; they meet after n - 1 iterations.
     - Space: O(1). Just three int variables.

     This is provably optimal for the comparison-based version of
     the problem — you must inspect each height at least once in
     the worst case (n^(1/2) bound? No, omega(n) bound holds —
     consider an array where the optimum is between the leftmost
     and a hidden tall bar near the right; you can't find it
     without examining each).

     At scale: n = 10^5 is trivial. n = 10^9 is also fine because
     it's O(n) and fits in a single pass with no extra memory.
     If heights were a stream rather than an array, two-pointer
     wouldn't apply directly — you'd need a different approach
     (probably some online maintenance of the convex hull of
     'left candidates' under stream conditions). But for the
     array contract, this is optimal."`}</CodeBlock>

        <p>
          That entire walk-through, fully narrated, takes a strong candidate about 12 to 18 minutes — well within
          the 45-minute budget of a typical interview. And every stage of UMPIRE is visible. The interviewer is
          grading every axis simultaneously: clarification, pattern recognition, planning, narration, self-test,
          complexity reasoning. Even if you have a small bug in the code, the framework leaves enough explicit
          structure for the interviewer to give partial credit.
        </p>

        <Quiz
          kind="Review check"
          question="Your code passes a hand-trace on the medium example. Should you also test the empty input?"
          options={[
            { label: "No — the medium trace was enough.", explanation: "The medium trace catches index/loop logic, but it can't catch 'what happens on length 0?'. That's a separate failure mode." },
            { label: "Yes — and ideally also single-element and all-same. Empty in particular is the most common 'IndexOutOfBounds' source.", correct: true, explanation: "Right. Empty input, single element, and all-same are the three short tests that catch the bulk of edge-case crashes. Each takes 5–10 seconds to verbally trace, and they collectively cover most of what fails in production. Doing them shows the interviewer you self-test rigorously, which is graded as a strong signal." },
            { label: "Only if the interviewer asks.", explanation: "Waiting to be asked is reactive; pre-emptively testing is proactive. Proactive is graded higher." },
            { label: "Only for problems with arrays.", explanation: "Empty/single/all-same generalize: empty list, empty string, single-node tree, single-vertex graph. They apply across structure types." },
          ]}
        />

        <Quiz
          kind="Evaluate check"
          question="Your solution is O(n) time and O(n) space. The interviewer asks 'can you do better?' What's the right first response?"
          options={[
            { label: "'Probably not — O(n) is already linear.'", explanation: "Linear in time is often as good as it gets, but linear in space might be reducible. Don't dismiss without exploring." },
            { label: "'Time is provably Ω(n) since we have to read every element. Space might be reducible — let me think about whether I can avoid the auxiliary structure...'", correct: true, explanation: "Right. Separate the two dimensions. Time is usually bounded below by the input size; space is more often the optimization target. State the lower-bound argument for time, then explore whether the auxiliary data structure can be replaced or removed. Common space-reduction techniques: in-place modification, two-pointer, prefix-sum-on-the-fly, bit manipulation." },
            { label: "Immediately rewrite to a totally different algorithm without explanation.", explanation: "An unmotivated pivot looks panicked. Even when redesigning, name the goal first." },
            { label: "Argue with the interviewer.", explanation: "When the interviewer asks 'can you do better,' they almost always know there's a better answer. Take it as a hint, not a challenge." },
          ]}
        />

        <Quiz
          kind="Evaluate check"
          question="At the end of your solution, you state O(n log n) time. The interviewer says 'are you sure?' What does that almost certainly mean?"
          options={[
            { label: "They're testing your confidence — defend the answer firmly.", explanation: "Sometimes, but rarely. 'Are you sure' from an interviewer is almost always a hint that the answer is wrong or incomplete, not a confidence test." },
            { label: "Re-derive the complexity carefully — you've probably miscounted, often by missing an inner loop or undercounting a sort.", correct: true, explanation: "Right. 'Are you sure' is interview shorthand for 'you got this wrong; please re-examine.' Walk through the code line by line, count loops and recursive calls, account for any sorts or heap operations. Often it's a hidden O(n) operation inside what you thought was an O(log n) step — for example, calling .indexOf() inside a binary search loop." },
            { label: "Ignore and move on.", explanation: "Ignoring a direct prompt is one of the strongest negative signals; treat 'are you sure' as the gift it is." },
            { label: "Switch the answer to whatever the interviewer probably wants.", explanation: "Don't guess at what they want; re-derive from the code. If you genuinely conclude the original answer was right, defend it with the derivation." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ───────────────── Part 6 · Mock-interview transcripts ───────────────── */}
      <Checkpoint moduleSlug="interview-framework" id="transcripts" title="I've internalized three full mock-interview transcripts" xp={40} manual manualLabel="I read all three transcripts and the grading rubric carefully">
      <section>
        <h2 id="transcripts">Mock-interview transcripts</h2>

        <p>
          Three full mock interviews, transcribed. Each shows a different difficulty level, a different pattern, and
          a different way of getting in (and out of) trouble. The point is to internalize the <em>rhythm</em> of a
          UMPIRE-driven interview, not to memorize specific solutions.
        </p>

        <h3>Mock 1 · Two Sum (warm-up)</h3>

        <p>
          A short, low-difficulty warm-up. The candidate is calm, runs UMPIRE briskly, and finishes well under
          time. Notice how short the transcript is once you have the framework — most of the interview is over in
          eight minutes.
        </p>

        <Callout variant="info" title="UMPIRE phases marked in the transcript">
          <p>
            Each section is labeled <code>[U]</code>, <code>[M]</code>, <code>[P]</code>, <code>[I]</code>,
            <code>[R]</code>, <code>[E]</code> so you can see the framework explicitly.
          </p>
        </Callout>

        <CodeBlock lang="plain">{`Interviewer: "Given an array of integers and a target, return the
              indices of the two numbers that add up to target.
              Assume exactly one solution."

[U] Candidate: "Got it. A few clarifying questions:
                - Can the array contain duplicates?
                - Negative numbers allowed?
                - Can I use the same element twice?
                - What's the expected length range?"

    Interviewer: "Duplicates allowed, negatives allowed, can't
                  use the same index twice, length up to 10^4."

[M] Candidate: "This is the canonical 'pair with target sum'
                problem. Brute force is two nested loops, O(n^2).
                The standard speedup is a single pass with a
                HashMap of (value -> index), checking if the
                complement (target - current) is already in the
                map."

[P] Candidate: "Plan: a HashMap<Integer, Integer> from value to
                index. One pass. For each i, compute complement =
                target - nums[i]. If complement is in the map,
                return [map.get(complement), i]. Otherwise put
                nums[i] -> i and continue. Time: O(n). Space: O(n).
                Sound right?"

    Interviewer: "Yes."

[I] Candidate: [typing] "public int[] twoSum(int[] nums, int
                target). Map<Integer, Integer> seen = new
                HashMap<>(). For loop with i from 0 to length.
                int complement = target - nums[i]. If
                seen.containsKey(complement), return new int[]{
                seen.get(complement), i}. Otherwise seen.put(
                nums[i], i). After the loop, throw — though the
                problem guarantees a solution.

                Worth noting: I'm using 'seen' as the variable
                name to make the semantics clearer than 'map'.
                And I'm storing nums[i] -> i in that order
                because I'll later look up by value, so value
                is the key."

[R] Candidate: "Let me trace [2, 7, 11, 15] target 9.
                i=0: complement = 7, not in seen. Put 2 -> 0.
                i=1: complement = 2, IS in seen at index 0.
                Return [0, 1]. Matches.

                Edge cases:
                - Length 2, [1, 2] target 3: returns [0, 1]. OK.
                - With duplicates, [3, 3] target 6: i=0 puts 3->0,
                  i=1 sees complement 3 in map, returns [0, 1]. OK.
                - Negative, [-1, -2, -3, -4] target -7: at i=2,
                  complement is -4, not in map. At i=3,
                  complement is -3, in map at i=2. Returns [2, 3].
                  OK."

[E] Candidate: "Final complexity: O(n) time — single pass with
                O(1) HashMap operations. O(n) space — the map
                holds up to n entries. Both are optimal for this
                problem. The two-pointer approach would give
                O(1) space, but it requires a sorted array, and
                we lose the original indices when we sort. So
                for this contract, O(n)/O(n) is the right answer."

    Interviewer: "Great, looks solid."`}</CodeBlock>

        <p>
          Total: about 8 minutes of interview time. The candidate ran the full UMPIRE pipeline visibly. There&apos;s
          no &quot;clever trick&quot; in the transcript — just thorough, narrated process. That&apos;s the point.
        </p>

        <h3>Mock 2 · Number of Islands (medium, with a stuck moment)</h3>

        <p>
          A medium-difficulty problem where the candidate hits two friction points: a clarifying-question moment
          where the spec was actually ambiguous, and a stuck moment mid-implementation that they recover from
          gracefully. This transcript is more realistic than Mock 1 — most real interviews include at least one
          such moment.
        </p>

        <CodeBlock lang="plain">{`Interviewer: "Given a 2D grid of '1's (land) and '0's (water),
              return the number of islands. An island is a group
              of connected lands."

[U] Candidate: "A few clarifying questions:
                - When you say 'connected,' do you mean
                  4-directionally — up/down/left/right — or
                  8-directionally including diagonals?
                - Are the cells '1' and '0' as characters, or
                  ints? The signature would matter.
                - Can the grid be empty? Single row? Jagged?
                - Is mutation of the input grid allowed?"

    Interviewer: "Good questions. 4-directional. char[][], so
                  characters '1' and '0'. Grid is a rectangle —
                  not jagged — and at least 1x1. Yes, mutation
                  is allowed."

    [Note: 'mutation allowed' is a green light for the in-place
     visited trick, which saves O(rows*cols) auxiliary space.]

[M] Candidate: "This is connected components on a grid. Two
                standard approaches: DFS or BFS from each
                unvisited '1' cell, marking visited as you go,
                counting components. Or union-find, which is
                more flexible if we need to support union queries.
                For a fixed grid with no online updates, DFS is
                the simplest — let me go with that."

[P] Candidate: "Plan:
                - Iterate over every cell.
                - If it's '1' and not yet visited, increment
                  the count and DFS from it, marking all
                  connected '1's as visited.
                - For 'visited,' I can either keep a boolean[][]
                  parallel matrix, or — since you said mutation
                  is allowed — set visited cells to '0' in the
                  input grid itself. That's O(1) extra space
                  beyond the recursion stack.

                DFS recurses to up/down/left/right neighbors with
                bounds checks. Time: O(rows * cols), each cell
                visited once. Space: O(rows * cols) worst case
                for the recursion stack — imagine a snake-like
                island filling the whole grid.

                Want me to start coding?"

    Interviewer: "Yes."

[I] Candidate: [typing] "int rows = grid.length, cols =
                grid[0].length. int count = 0.

                For loops over r and c. If grid[r][c] == '1',
                count++ and dfs(grid, r, c).

                DFS method: void dfs(char[][] g, int r, int c).
                First, bounds check: if (r < 0 || r >= rows ||
                c < 0 || c >= cols) return.

                Wait — I'm referencing 'rows' and 'cols' inside
                the dfs method but they're locals in the outer
                method. Hmm.

                [stuck moment]

                Let me reset for a second. I have two options:
                pass rows and cols as DFS parameters, or read
                them from g.length and g[0].length inside DFS.
                The second is cleaner — let me use that.

                if (r < 0 || r >= g.length || c < 0 ||
                c >= g[0].length) return.
                if (g[r][c] != '1') return.
                g[r][c] = '0';   // mark visited in place
                dfs(g, r+1, c); dfs(g, r-1, c);
                dfs(g, r, c+1); dfs(g, r, c-1);

                Done. Let me clean up the outer loop too —
                no need for a separate visited check now since
                the DFS marks '0's as it goes."

[R] Candidate: "Trace on
                  1 1 0
                  1 0 0
                  0 0 1
                Outer loop hits (0,0) = '1'. Count = 1, DFS.
                  DFS(0,0): mark '0', recurse to (1,0), (-1,0
                  out of bounds), (0,1), (0,-1 out of bounds).
                  DFS(1,0): mark '0', recurse to (2,0)='0' return,
                  (0,0)='0' return, (1,1)='0' return, (1,-1) out.
                  DFS(0,1): mark '0', recurse to (1,1)='0',
                  (-1,1) out, (0,2)='0', (0,0)='0'.
                Outer loop continues. (0,1) and (0,2) and (1,0)
                and (1,1) all '0' now. (2,0), (2,1) are '0'.
                (2,2) is '1'. Count = 2, DFS marks it '0'.
                Final count = 2. Matches.

                Edge cases:
                - 1x1 grid '1' → count = 1.
                - 1x1 grid '0' → count = 0.
                - All ones → 1 (one big island).
                - All zeros → 0."

[E] Candidate: "Final complexity:
                Time: O(rows * cols). Each cell is visited at
                most once because we mark '1's to '0's.
                Space: O(rows * cols) worst case for the recursion
                stack on a snake-shaped island.

                If recursion depth is a concern (rows*cols up
                to 10^5 should be fine in Java with default
                stack size), I could switch to BFS with an
                explicit queue. The queue's max size is also
                O(rows*cols), so it's the same asymptotic but
                lives on the heap rather than the stack.

                For this problem with the given bounds, the
                recursive DFS is the cleanest answer."

    Interviewer: "Nicely done. The 'let me reset' moment was
                  smooth — many candidates would have spiraled."`}</CodeBlock>

        <p>
          Three things to notice in Mock 2:
        </p>

        <ul>
          <li>
            The candidate&apos;s first clarifying question (4-way vs 8-way) wasn&apos;t obvious from the prompt and
            extracted real ambiguity. That&apos;s the question that earns points.
          </li>
          <li>
            The mutation question explicitly enabled the in-place visited trick. They asked because they were
            already planning to take advantage of it — the question doubled as a setup.
          </li>
          <li>
            The mid-implementation &quot;wait — let me reset for a second&quot; was handled in three sentences.
            They named the issue, weighed two options out loud, picked the cleaner one, and continued. The
            interviewer&apos;s explicit positive comment at the end was about that moment, not the final code.
          </li>
        </ul>

        <h3>Mock 3 · Word Break (DP, with a recursion-to-memoization pivot)</h3>

        <p>
          The hardest of the three. The candidate starts with naive recursion, recognizes it&apos;s exponential
          mid-trace, and pivots to memoization. This pivot — &quot;I tried recursion, that&apos;s exponential, let
          me memoize&quot; — is one of the most common transitions in DP interviews and a good one to have a
          script for.
        </p>

        <CodeBlock lang="plain">{`Interviewer: "Given a string s and a list of words wordDict,
              return true if s can be segmented into a
              space-separated sequence of one or more dictionary
              words."

[U] Candidate: "Clarifying:
                - Can words from the dictionary be reused?
                - Are there duplicates in the dictionary?
                - What's the size range — string length and
                  dictionary size?
                - Lowercase only, or any character?"

    Interviewer: "Yes, words can be reused. No duplicates in
                  the dictionary. String length up to 300,
                  dictionary up to 1000 words, words up to
                  20 characters. Lowercase a-z."

[M] Candidate: "This is a segmentation problem — 'can I split s
                into pieces from a set?' My first instinct is
                recursion: for each prefix of s that's in the
                dictionary, recurse on the remainder. If any
                recursion returns true, we're done.

                But wait — without memoization, that's
                exponential because the same suffix is reached
                via many different prefix paths. So this is
                going to be DP. Let me start with the recursive
                view and then memoize."

[P] Candidate: "Plan:
                - Put dictionary in a HashSet for O(1) lookup.
                - Define canBreak(start) = true if s[start..]
                  can be fully segmented.
                - Base: canBreak(s.length()) = true (empty
                  suffix).
                - Recurrence: canBreak(start) = OR over all
                  end > start such that s.substring(start, end)
                  is in the dict, of canBreak(end).
                - Memoize on 'start' since there are only
                  s.length()+1 possible values.
                - Time: O(n^2) for the substring iteration *
                  O(n) for substring construction = O(n^3) in
                  the naive version. Could optimize substring
                  to a trie or precomputed set, but n=300, so
                  n^3 = 2.7 * 10^7, which is fine.
                - Space: O(n) for memo + O(words) for the set.

                Sound reasonable?"

    Interviewer: "Yes — go ahead."

[I] Candidate: [typing] "public boolean wordBreak(String s,
                List<String> wordDict).

                Set<String> dict = new HashSet<>(wordDict).
                Boolean[] memo = new Boolean[s.length() + 1].
                Note: Boolean (boxed), not boolean — null is my
                'not-yet-computed' sentinel. Initializing to
                false would lose the distinction between
                'computed false' and 'not computed.'

                return canBreak(0, s, dict, memo).

                Helper: boolean canBreak(int start, String s,
                Set<String> dict, Boolean[] memo).

                If start == s.length(), return true.
                If memo[start] != null, return memo[start].

                For (int end = start + 1; end <= s.length();
                end++):
                  if (dict.contains(s.substring(start, end))
                      && canBreak(end, s, dict, memo)) {
                    memo[start] = true;
                    return true;
                  }

                memo[start] = false;
                return false."

[R] Candidate: "Trace on s = 'leetcode', dict = ['leet', 'code'].
                canBreak(0):
                  end=1: 'l' not in dict.
                  end=2: 'le' not in dict.
                  end=3: 'lee' not in dict.
                  end=4: 'leet' IS in dict. canBreak(4)?
                    canBreak(4):
                      end=5: 'c' not in dict.
                      end=6: 'co' not in dict.
                      end=7: 'cod' not in dict.
                      end=8: 'code' IS in dict. canBreak(8)?
                        canBreak(8): start == length, return true.
                      memo[4] = true; return true.
                    memo[0] = true; return true.
                Returns true. Correct.

                Counterexample: 'applepenapples', dict=['apple',
                'pen'].
                canBreak(0): end=5 'apple' in dict; canBreak(5).
                  canBreak(5): 'pen' at end=8; canBreak(8).
                    canBreak(8): 'apples' not in dict. End loop
                                 with no match; memo[8]=false.
                  Back in canBreak(5): no other prefix in dict
                  (e.g., 'penap' isn't). memo[5]=false.
                Back in canBreak(0): no other prefix. memo[0]=false.
                Returns false. Correct.

                Edge case: empty string s. canBreak(0): start ==
                length immediately, return true. The empty string
                trivially decomposes into zero words. Some
                problem statements say 'one or more,' which would
                make empty a false case — let me re-check.

                [re-reads prompt]

                It says 'one or more dictionary words.' So empty
                should be false. Let me add an explicit check at
                the top: if (s.isEmpty()) return false. Or
                actually, the problem usually guarantees s is
                non-empty in the constraints — but safer to
                handle it."

[E] Candidate: "Final complexity:
                - The memoization gives at most s.length()+1
                  unique sub-problems.
                - Each sub-problem does O(n) work in the worst
                  case (the for loop over 'end' values).
                - Each substring call is O(n) — that's the
                  hidden third factor.
                - So O(n^3) total time.

                With n = 300, n^3 = 2.7 * 10^7 — well within
                limits.

                Space: O(n) for the memo array, O(W * L) for
                the dictionary set where W is the word count
                and L is average word length, plus O(n) recursion.

                If we needed to push performance, the substring
                cost can be reduced to O(L) per call by walking
                a Trie of the dictionary character by character
                during the for loop — that gets us to O(n^2 * L)
                or roughly O(n^2) if L is small constant. Or we
                could iterate by candidate word rather than by
                end-index: for each word in dict, check if s
                starts with that word at position 'start.' That's
                O(W*L) per sub-problem, total O(n*W*L).

                For the given bounds, O(n^3) is fine and the
                clearest. Want me to push on optimization?"

    Interviewer: "No, that's good. Nice catch on the Boolean
                  vs. boolean memo — many candidates miss that."`}</CodeBlock>

        <p>
          Mock 3 highlights several senior signals worth absorbing:
        </p>

        <ul>
          <li>
            <strong>The recursion-to-memoization pivot was named explicitly.</strong> &quot;That&apos;s exponential
            because the same suffix is reached via many different prefix paths.&quot; That sentence is the entire
            insight that turns recursion into DP, and saying it out loud is the difference between &quot;candidate
            knew DP&quot; and &quot;candidate <em>derived</em> DP.&quot;
          </li>
          <li>
            <strong>Boolean (boxed) for the memo, with a <code>null</code> sentinel.</strong> A small detail, but
            it shows language fluency. The interviewer specifically called it out.
          </li>
          <li>
            <strong>The empty-string review caught a real ambiguity.</strong> The candidate noticed
            mid-walkthrough that they hadn&apos;t verified the empty-string case, re-read the prompt, and added a
            guard. That&apos;s self-correction in action.
          </li>
          <li>
            <strong>The optimization mention at the end.</strong> &quot;If we needed to push performance...&quot;
            offers two concrete improvements with their costs. That&apos;s bonus credit beyond the original problem.
          </li>
        </ul>

        <h3>Final exercise: what is the interviewer grading?</h3>

        <p>
          Below are eight observed candidate behaviors. For each one, identify which axis of the rubric it
          primarily scores on. There are no &quot;wrong&quot; behaviors here — they&apos;re all real moments from
          real interviews — but each one signals primarily one thing.
        </p>

        <ClassifyChallenge
          title="What is the interviewer grading from this behavior?"
          prompt="Each card is a real moment from an interview. Pick the rubric axis it most strongly contributes to."
          buckets={[
            { id: "communication", label: "Communication", color: "rose" },
            { id: "problemsolving", label: "Problem-solving", color: "amber" },
            { id: "codequality", label: "Code quality", color: "emerald" },
            { id: "collaboration", label: "Collaboration", color: "indigo" },
            { id: "correctness", label: "Correctness", color: "violet" },
          ]}
          items={[
            { id: "1", label: "Candidate stops mid-typing and says: 'Wait, I just realized my recurrence is missing a dimension. Let me reset.'", answer: "problemsolving", explanation: "Self-correction under pressure is the canonical problem-solving signal. Naming the discovery, not just silently fixing it, is what gets graded." },
            { id: "2", label: "Candidate uses a HashMap variable name 'seen' rather than 'm' or 'map'.", answer: "codequality", explanation: "Meaningful names are the single highest-leverage code-quality signal in interviews. 'seen' tells the reader the semantics; 'map' tells them only the type." },
            { id: "3", label: "After the interviewer says 'can you do better on space?', candidate immediately says 'good idea — let me think about an in-place version' and re-plans.", answer: "collaboration", explanation: "Receiving and integrating a hint gracefully is the textbook collaboration signal. The opposite — defending the rejected approach — is the canonical collaboration anti-signal." },
            { id: "4", label: "Candidate proactively traces three edge cases (empty, single-element, all-same) at the end without being asked.", answer: "problemsolving", explanation: "Self-test rigor is graded under problem-solving. It signals 'I find my own bugs' — the most senior trait there is." },
            { id: "5", label: "Candidate's code passes all the tests the interviewer mentions, with no off-by-one errors.", answer: "correctness", explanation: "Correctness is its own axis. Note this is the only one of the eight where 'code that works' is the primary signal — most other axes weight process and reasoning above output." },
            { id: "6", label: "Candidate says 'I'm going to use Integer.compare here, not a - b, because the latter overflows when one side is MAX_VALUE and the other negative.'", answer: "codequality", explanation: "Pre-emptively flagging a known foot-gun is graded as both code quality (you write defensive code) and language fluency. Here, the language-specific awareness leans it toward code quality." },
            { id: "7", label: "Candidate ends each phase by asking: 'does that sound reasonable before I continue?'", answer: "communication", explanation: "Inviting course correction at phase boundaries is a textbook communication-and-collaboration move. It's primarily communication — making your thinking visible enough that someone else can engage with it." },
            { id: "8", label: "Candidate, given an open-ended prompt with no example, immediately constructs their own concrete example to disambiguate.", answer: "problemsolving", explanation: "Generating worked examples to clarify a fuzzy prompt is a senior problem-solving habit. It also signals strong communication, but the primary signal is 'I bring structure to ambiguity.'" },
          ]}
        />

        <Quiz
          kind="Final check"
          question="Across all three transcripts, what's the single most common 'senior signal' the candidates produce?"
          options={[
            { label: "Faster typing.", explanation: "Speed almost never moves the rubric. The signal is process quality, not keystroke rate." },
            { label: "Visible reasoning — narrating choices, naming tradeoffs, asking permission at phase boundaries — even when the choice is obvious.", correct: true, explanation: "Right. The candidates in all three mocks make their thinking radically visible. They explain WHY they pick a HashMap, WHY they mark cells in-place, WHY they switch to memoization. Most of the credit comes from this visibility — not from arriving at the optimal answer first. Visible reasoning is what allows the interviewer to grade the four non-correctness axes; without it, only correctness shows up, and you've thrown away most of your potential score." },
            { label: "Knowing more obscure data structures than the interviewer expects.", explanation: "Showing off rarely helps. Knowing the standard structures cold and applying them deliberately wins more interviews than knowing exotic ones." },
            { label: "Avoiding any hesitation or pauses.", explanation: "Hesitation is fine; silence is the problem. Thinking out loud during hesitation actually scores positively." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="In Mock 3, the candidate said 'that's exponential because the same suffix is reached via many different prefix paths.' What does this single sentence demonstrate?"
          options={[
            { label: "That they memorized the Word Break solution.", explanation: "Memorization wouldn't show this articulation; you'd skip straight to 'I'll use DP.' The articulation IS the differentiator." },
            { label: "That they understand WHY recursion is exponential here, which is the underlying reason DP works — the overlapping-subproblems property.", correct: true, explanation: "Right. That sentence is a compressed statement of the overlapping-subproblems property — the formal precondition for DP. A candidate who recites 'I'll use DP' without articulating why has memorized a template; a candidate who says 'because the same suffix is reached via many paths' has DERIVED the choice from first principles. The latter is the senior signal interviewers look for in DP problems." },
            { label: "That they know the Big-O of recursion.", explanation: "Big-O knowledge alone wouldn't produce this articulation. The phrase 'same suffix reached via many paths' specifically captures the overlapping-subproblems property, which is the structural precondition for memoization." },
            { label: "Nothing in particular — it's a throwaway comment.", explanation: "Far from throwaway: it's the load-bearing observation that motivates the entire DP transition. Interviewers grade specifically for moments like this." },
          ]}
        />

        <Quiz
          kind="Final check"
          question="A candidate goes silent for 90 seconds after hearing the problem. What's the single most important thing they could have said in that span?"
          options={[
            { label: "Nothing — they're thinking, that's what thinking looks like.", explanation: "Silent thinking and verbal thinking score very differently in an interview, even if the underlying cognition is identical. The interviewer can only grade what they observe." },
            { label: "Anything — even just 'let me think about this for a moment, my first thought is X' — to make their thinking visible.", correct: true, explanation: "Right. The minimum viable response is acknowledging that you're processing and giving the interviewer a partial view of where you are. Even a half-formed first thought is better than silence: it lets the interviewer correct you cheaply, signals you're engaged, and reduces the social pressure of dead air. The exact words matter less than the act of verbalizing." },
            { label: "The optimal solution.", explanation: "Demanding the optimal solution within 90 seconds is unrealistic and not what the rubric expects. What it expects is engagement — visible thought, not finished answers." },
            { label: "An apology for needing time.", explanation: "Apologies signal low confidence. The right move is verbal engagement, not an apology." },
          ]}
        />

        <PartRecap
          title="The framework, in one page"
          gist="Run UMPIRE every time. Make your thinking visible. The framework is the bridge from 'I just heard the problem' to 'I can think clearly' — and it's what allows the interviewer to grade the four non-correctness axes that determine senior-level outcomes."
          points={[
            { takeaway: "U · Understand: ask 2–3 clarifying questions before coding, even if you think you understand.", detail: "Inputs, outputs, constraints, edges. The questions extract real ambiguity AND buy thinking time AND signal curiosity. The cost is 30 seconds; the value is enormous." },
            { takeaway: "M · Match: pattern-recognize against the cheat sheet of trigger phrases.", detail: "'Subarray with property' = sliding window. 'K-th' = heap. 'All paths' = recursion. 'Decision at i' = DP. Build linguistic-to-pattern reflexes until they fire automatically." },
            { takeaway: "P · Plan: speak the algorithm before coding it.", detail: "Data structures, algorithm in 3–5 sentences, invariant, complexity target, alternative considered. End with 'sound reasonable?' to invite course correction." },
            { takeaway: "I · Implement: narrate every meaningful decision, pre-emptively flag known foot-guns.", detail: "Talk WHY, not WHAT. Flag overflow, edge cases, language gotchas before they bite. Five seconds of narration earns measurable rubric credit." },
            { takeaway: "R · Review: hand-trace empty, single-element, all-same, and the medium example.", detail: "Don't 're-read' the code — actually execute it on paper, writing variable values per iteration. This is what catches off-by-ones." },
            { takeaway: "E · Evaluate: state final time and space; mention what changes at scale.", detail: "Even when the complexity is 'obvious,' state it explicitly. Bonus credit for the 'at scale' commentary — it shows you think beyond the toy input." },
            { takeaway: "Visible reasoning beats silent optimality, especially at senior levels.", detail: "The interviewer is grading communication, problem-solving, code quality, collaboration, AND correctness. Silence forfeits the first four. Run UMPIRE in a way that surfaces all of them." },
          ]}
        />

        <div className="not-prose mt-12 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800/40">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Module 33 done · One left</h3>
          <p className="mt-2 mb-4 text-sm text-slate-700 dark:text-slate-300">
            You have the patterns (Phases 2–7), the advanced structures (Phase 8&apos;s tries, union-find, advanced
            graphs), and now the framework that unifies them under interview pressure. The capstone is a curated
            20-problem mixed set: read each, identify the pattern, justify the choice, then solve. It&apos;s the
            integration test for everything you&apos;ve built. Take a break, then go.
          </p>
          <Link
            href="/courses/dsa/modules/capstone"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
          >
            Module 34 · Capstone: 20-problem mixed set →
          </Link>
        </div>
      </section>
      </Checkpoint>
        <ModuleNav courseId="dsa" currentSlug="interview-framework" />
    </article>
  );
}
