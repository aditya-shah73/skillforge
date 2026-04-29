import Link from "next/link";
import Callout from "@/components/Callout";
import { getModuleBySlug } from "@/lib/courses/dsa";

export default function DsaWelcomeModule() {
  const mod = getModuleBySlug("welcome")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/dsa" className="text-emerald-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-slate-500 to-slate-400 bg-clip-text text-transparent">
            Phase 0 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Welcome
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Read this first. It&apos;s five minutes and will save you weeks of grinding the wrong way.
        </p>
      </header>

      <section>
        <h2>Who this is for</h2>
        <p>
          You&apos;re a working engineer who studied DSA <em>once</em> — probably in college, probably more than five years ago — and most of it has quietly faded. You can write a Java for-loop in your sleep, you ship features at work, and yet a basic LeetCode &quot;easy&quot; still makes your stomach drop.
        </p>
        <p>
          What you want: <strong>real intuition back</strong>. Not memorized templates. Not 500 problems grinded blindly. The ability to read a new problem, recognize what it&apos;s really asking, and reach for the right pattern with confidence.
        </p>
        <p>That&apos;s exactly what this course is for.</p>
      </section>

      <section>
        <h2>What this course <em>is</em></h2>
        <ul>
          <li><strong>Pattern-first.</strong> The reason interviewers love LeetCode isn&apos;t the problems themselves — it&apos;s that the same ~15 patterns cover most of them. We teach the patterns, then drill them.</li>
          <li><strong>Intuition before code.</strong> Every concept starts with an analogy, then a worked example you trace by hand on paper, then code. Skipping the paper step is the #1 way people fail at this.</li>
          <li><strong>Java, throughout.</strong> Every data structure built from scratch. Every problem solved in Java. We&apos;ll lean on the Java Collections Framework deliberately, not by accident.</li>
          <li><strong>Interactive.</strong> Quizzes, drills, and checkpoints. You don&apos;t progress by clicking &quot;next&quot; — you progress by answering correctly.</li>
          <li><strong>Opinionated.</strong> We&apos;ll tell you which patterns matter most, which problems to prioritize, and when to stop optimizing and ship.</li>
        </ul>
      </section>

      <section>
        <h2>What this course is <em>not</em></h2>
        <ul>
          <li><strong>Not a 500-problem grind.</strong> You&apos;ll trace ~80 problems by hand across the course — chosen because each one cleanly demonstrates a pattern. Volume comes later, after you have the framework.</li>
          <li><strong>Not a CLRS replacement.</strong> We don&apos;t prove every theorem. If you want a formal CS textbook, this isn&apos;t it. The goal is interview-ready intuition, not graduate-level rigor.</li>
          <li><strong>Not language-agnostic.</strong> Java only. Patterns transfer to other languages, but the course assumes Java syntax everywhere.</li>
          <li><strong>Not a credential.</strong> The credential is your offer letter. The capstone problem set is what you point at when someone says &quot;show me you can solve these.&quot;</li>
        </ul>
      </section>

      <section>
        <h2>What you&apos;ll need</h2>
        <ul>
          <li><strong>Java 17+</strong> and your IDE of choice (IntelliJ recommended)</li>
          <li><strong>Node 20.9+</strong> to run this course app locally</li>
          <li>A <strong>LeetCode account</strong> (free tier — premium not required)</li>
          <li><strong>Paper and a pen.</strong> Yes, really. You&apos;ll use it more than your IDE in Phases 1–3.</li>
          <li>Working knowledge of <strong>Java syntax</strong> — loops, classes, generics, the basics. No Spring, no frameworks.</li>
        </ul>
        <Callout variant="info" title="No prior algorithms experience required">
          <p className="m-0">If you can&apos;t remember what Big-O means or what a hash collision is — perfect. Phase 1 starts from absolute zero, designed for someone who hasn&apos;t thought about this stuff in years.</p>
        </Callout>
      </section>

      <section>
        <h2>How the course works</h2>
        <p>
          The syllabus is <strong>34 modules across 9 phases</strong>. You&apos;re reading the first one right now. Each module is a single page with the same rhythm:
        </p>
        <ol>
          <li><strong>Analogy</strong> — the intuition, before any math or code</li>
          <li><strong>Pattern (or formula)</strong> — what the structure or technique actually is, with every part named</li>
          <li><strong>Worked example</strong> — by hand, on paper, traced step by step</li>
          <li><strong>Variants</strong> — what changes in practice, where the gotchas live</li>
          <li><strong>Checkpoint</strong> — a quiz that tests the three bars below</li>
        </ol>
        <p>
          A checkpoint passes only when you can do three things:
        </p>
        <ul>
          <li>Explain the concept in <strong>2 minutes</strong> (without jargon, like you&apos;re talking to a smart non-CS friend)</li>
          <li><strong>Recognize it in code</strong> you didn&apos;t write — including subtle off-by-one variants</li>
          <li><strong>Implement it from scratch</strong> in Java, without looking</li>
        </ul>
        <p>
          If you can&apos;t do all three, go back. The modules are designed so that skipping reinforcement will absolutely wreck the next module. Trees break if you skipped recursion. DP breaks if you skipped recursion <em>and</em> arrays. There are no shortcuts.
        </p>
      </section>

      <section>
        <h2>The course arc</h2>
        <p>
          The phases build deliberately:
        </p>
        <ul>
          <li><strong>Phase 1 · Complexity (3 modules)</strong> — Big-O, space, amortized analysis. The mental model everything else depends on.</li>
          <li><strong>Phase 2 · Linear data (5 modules)</strong> — arrays, strings, linked lists, stacks, queues. Built from scratch.</li>
          <li><strong>Phase 3 · Hashing &amp; trees (5 modules)</strong> — HashMap internals, sets, binary trees, BSTs, heaps.</li>
          <li><strong>Phase 4 · Graphs (3 modules)</strong> — representations, BFS/DFS, shortest paths. The other side of trees.</li>
          <li><strong>Phase 5 · Java Collections (1 module)</strong> — the reference module you&apos;ll come back to during interview prep.</li>
          <li><strong>Phase 6 · Algorithmic techniques (8 modules)</strong> — the named LeetCode patterns. Two pointers, sliding window, binary search, sorting, recursion, backtracking, greedy, bit manipulation.</li>
          <li><strong>Phase 7 · Dynamic programming (4 modules)</strong> — DP gets its own arc because DP is hard. Memoization, 1D, 2D, advanced.</li>
          <li><strong>Phase 8 · Advanced &amp; interview prep (5 modules)</strong> — tries, union-find, advanced graph, the interview framework, capstone.</li>
        </ul>
      </section>

      <section>
        <h2>Time commitment</h2>
        <p>
          Budget ranges are listed per module, but roughly:
        </p>
        <ul>
          <li><strong>Phase 1 (Complexity):</strong> ~4–5 hours</li>
          <li><strong>Phase 2 (Linear data):</strong> ~9–11 hours</li>
          <li><strong>Phase 3 (Hashing &amp; trees):</strong> ~10–12 hours</li>
          <li><strong>Phase 4 (Graphs):</strong> ~6–8 hours</li>
          <li><strong>Phase 5 (Collections):</strong> ~1.5–2 hours</li>
          <li><strong>Phase 6 (Techniques):</strong> ~16–20 hours</li>
          <li><strong>Phase 7 (DP):</strong> ~9–11 hours</li>
          <li><strong>Phase 8 (Advanced):</strong> ~10–13 hours</li>
        </ul>
        <p>
          Total: <strong>~70–90 hours</strong> if you engage seriously, <strong>~110+ hours</strong> if you build every project and solve every LeetCode problem from scratch (which you should). At ~1.5 hours a day, that&apos;s about <strong>2–3 months</strong> to get genuinely interview-ready.
        </p>
      </section>

      <section>
        <h2>How to actually study (this part is not optional)</h2>
        <ol>
          <li><strong>Use paper.</strong> When a module says &quot;trace this by hand,&quot; take out an actual sheet of paper and draw it. The kinesthetic step is what cements the pattern. People who skip this learn nothing.</li>
          <li><strong>Solve before you peek.</strong> When a LeetCode problem appears, give yourself <em>at least</em> 20 minutes of honest effort before reading the solution — even if you fail. Failing is how you learn the shape of the problem.</li>
          <li><strong>Re-derive, don&apos;t re-read.</strong> Coming back to a topic? Don&apos;t re-read the module. Try to re-derive the data structure or algorithm from scratch on paper. That&apos;s the only test that matters.</li>
          <li><strong>Spaced repetition for problems.</strong> A problem you solved last week is not a problem you&apos;ve mastered. Keep a list, re-solve the hard ones a week later, then a month later.</li>
          <li><strong>Talk it out.</strong> Real interviews require you to think out loud. Solve at least a few problems by literally narrating your thinking — to a friend, a rubber duck, or your phone&apos;s voice recorder.</li>
        </ol>
        <Callout variant="insight" title="The single biggest mistake returning learners make">
          <p className="m-0">It&apos;s not skipping problems — it&apos;s grinding problems <em>without the underlying pattern</em>. You solve 200 problems, retain almost nothing, and panic in the interview because the pattern feels new. This course is structured to prevent that exact failure mode. Patterns first, problems second.</p>
        </Callout>
      </section>

      <section>
        <h2>LeetCode, used right</h2>
        <p>
          LeetCode is a gym. The exercises are pointless on their own — they only matter because they train the muscles you use under load. So:
        </p>
        <ul>
          <li><strong>Quality over quantity.</strong> 80 problems traced fully and re-derived later beats 500 problems skim-solved.</li>
          <li><strong>Easy &gt; Medium &gt; Hard, in that order.</strong> An &quot;Easy&quot; you can&apos;t solve from scratch is more important to revisit than a &quot;Hard&quot; you watched a video about.</li>
          <li><strong>Your editorial discipline matters.</strong> If you peek at the solution, write a one-paragraph explanation in your own words afterward. If you can&apos;t, you didn&apos;t learn it.</li>
          <li><strong>Time-box.</strong> 20–40 minutes per problem. If you&apos;re still stuck, peek <em>just enough</em> to unstick yourself, then go back and solve the rest unaided.</li>
        </ul>
      </section>

      <section>
        <h2>Progress tracking</h2>
        <p>
          Your progress lives in your browser&apos;s <code>localStorage</code>. Clearing site data wipes it. There&apos;s no account, no server, no tracking. If you switch browsers or machines, you&apos;ll start fresh.
        </p>
        <Callout variant="warn" title="One quirk to know">
          <p className="m-0">Some quizzes have a hidden state: they only mark as &quot;passed&quot; when you answer correctly. If you&apos;re scrolling past them without interacting, the module won&apos;t unlock its next section. Engage with every quiz — that&apos;s the whole point.</p>
        </Callout>
      </section>

      <section>
        <h2>How to get the most out of this</h2>
        <ol>
          <li><strong>Don&apos;t skip Phase 1.</strong> Big-O feels boring after seven years away — you remember it &quot;well enough.&quot; You don&apos;t. Three modules. Do them.</li>
          <li><strong>Build every data structure from scratch.</strong> Yes, even though Java has them. Building HashMap by hand is what makes you actually understand HashMap.</li>
          <li><strong>Trace by hand.</strong> Every worked example. Every time. Five minutes of arithmetic on paper beats an hour of re-reading.</li>
          <li><strong>Ship the capstone.</strong> Module 34 is a 20-problem mixed set with writeups. Put the repo on GitHub. Link it from your resume. That&apos;s the artifact recruiters and hiring managers can verify.</li>
        </ol>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
        <h3 className="mt-0 mb-2">Ready?</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 1 is Big-O from absolute zero — the mental model that makes everything else make sense.
        </p>
        <Link
          href="/courses/dsa/modules/big-o"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-teal-600 transition no-underline"
        >
          Start Module 1: Big-O →
        </Link>
      </section>
    </article>
  );
}
