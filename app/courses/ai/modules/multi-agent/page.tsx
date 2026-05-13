import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "why-multiple", title: "Why ever use more than one agent" },
  { id: "patterns", title: "The four patterns that cover 90%" },
  { id: "parallelization", title: "Parallelization done right" },
  { id: "antipatterns", title: "Multi-agent anti-patterns" },
  { id: "project", title: "Project: PR review panel" },
  { id: "final", title: "Final quiz" },
];

export default function MultiAgentModule() {
  const mod = getModuleBySlug("multi-agent")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Phase 5 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Multi-agent patterns</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          One agent is hard. Two agents is harder. Make sure the second agent earns its keep.
        </p>
        <ModuleProgress moduleSlug="multi-agent" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A working catalog of multi-agent patterns — when each helps, when each backfires, and
          how to wire them in Spring without inventing a fragile distributed system. Plus a PR
          review panel that runs three specialized reviewers in parallel against the same diff.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The four patterns: prompt chaining, routing, parallelization, orchestrator/subagent</li>
          <li>Where evaluator-optimizer fits and when it&apos;s worth the cost</li>
          <li>Parallelization in Spring — virtual threads, structured concurrency, error budgets</li>
          <li>The anti-patterns: chatty multi-agents, role bloat, infinite delegation</li>
          <li>The PR review panel project: security + performance + style reviewers, run in parallel, merged into one report</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        Modules 21 and 22 — multi-agent is just &quot;more of those, coordinated&quot;. You also
        want Module 12 (streaming) for the parallelization patterns, and Module 11 (tool use)
        because the orchestrator pattern is fundamentally tool use with subagents-as-tools.
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: WHY MULTIPLE                                                */}
      {/* ================================================================= */}
      <section id="why-multiple">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — Why ever use more than one agent</h2>

        <p>
          Default position: one agent is plenty. Modern frontier models with 200k context
          windows and 100+ tool slots can handle most jobs solo. So the question isn&apos;t
          &quot;should I use multi-agent?&quot; — it&apos;s &quot;what specifically is broken
          about my single agent that more agents would fix?&quot;
        </p>

        <p>The legitimate reasons:</p>

        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Different specialties need different prompts.</strong> A &quot;security
            reviewer&quot; system prompt and a &quot;style reviewer&quot; system prompt are
            different things. Smushing them into one agent dilutes both.
          </li>
          <li>
            <strong>Independent work that can run in parallel.</strong> If three reviewers
            don&apos;t need to see each other&apos;s output, running them concurrently cuts
            wall-clock time 3x — for free.
          </li>
          <li>
            <strong>Context isolation.</strong> If subagent A reads 100k tokens of code, you
            don&apos;t want that polluting subagent B&apos;s context. Separate agents, separate
            windows.
          </li>
          <li>
            <strong>Different models for different jobs.</strong> A cheap model picks the route;
            a smart model handles the hard cases. (This is sometimes called &quot;router&quot;
            or &quot;mixture of experts&quot; at the application level.)
          </li>
          <li>
            <strong>Evaluator-optimizer loops.</strong> One agent generates, another critiques,
            you iterate. Sometimes worth it for hard quality bars.
          </li>
        </ul>

        <Callout variant="warn" title="Bad reasons (every one is a real pitch we've heard)">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>&quot;It&apos;s more like a real team.&quot;</li>
            <li>&quot;The diagram looks more impressive.&quot;</li>
            <li>&quot;Each agent has its own personality.&quot;</li>
            <li>&quot;LangChain has a multi-agent feature so we should use it.&quot;</li>
            <li>&quot;We need at least three agents for the demo.&quot;</li>
          </ul>
          Multi-agent is a cost and complexity multiplier. The justification has to be a real
          engineering one, not aesthetic.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">The cost reality</h3>

        <p>
          Be honest about the bill before you decide. Each subagent has its own context, its
          own model calls, its own tool turns. A two-agent orchestrator/subagent typically
          costs <strong>2.5x to 4x</strong> more tokens than the single-agent version of the
          same task — because the orchestrator&apos;s context grows with every subagent
          summary it consumes, on top of the subagents&apos; own contexts.
        </p>

        <Callout variant="insight" title="The shape that's worth the spend">
          Multi-agent earns its keep when at least one of these is true: (a) parallelism cuts
          wall-clock time meaningfully, (b) context isolation prevents bleed-over that would
          break the task, or (c) a specialty prompt is materially different from the general
          one. If none of those, you&apos;re paying 3x for nothing.
        </Callout>

        <Checkpoint moduleSlug="multi-agent" id="why-multiple" title="Why split at all" xp={20}>
          <Quiz
            kind="Quick check"
            question="Which of these is a legitimate reason to split a single agent into multiple agents?"
            options={[
              {
                label: "The system feels too monolithic and we want it to look more modular.",
                explanation: "Modularity-as-aesthetic isn't worth a 3x cost increase. Look for actual capability or performance gains.",
              },
              {
                label: "Three independent analyses (security, performance, style) need to run on the same code; they don't depend on each other and could be parallel.",
                correct: true,
                explanation: "Yes — independent work parallelized cuts wall-clock and gives each subagent a sharp specialty prompt. Both legitimate wins.",
              },
              {
                label: "We want to use LangChain's multi-agent feature.",
                explanation: "Tools don't drive architecture. Architecture drives tool choice.",
              },
              {
                label: "Our PM said it should have agents that 'collaborate'.",
                explanation: "Vibes ≠ requirement. Push back: what specifically is broken about a single-agent system?",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 1 recap"
        gist="One agent is the default. Add agents only for parallelism, context isolation, or genuinely different specialties."
        points={[
          { takeaway: "Multi-agent is a 2-4x cost multiplier — it has to earn that.", detail: "Each subagent has its own context and tool turns. Orchestrators consume subagent summaries on top of their own work. The math gets bad fast." },
          { takeaway: "Three legit drivers: parallelism, context isolation, specialty prompts.", detail: "If the work is sequential, the contexts can mix safely, and one prompt covers it — keep it as one agent." },
          { takeaway: "Resume-driven multi-agent is rampant. Push back on it.", detail: "Most 'multi-agent' systems in production are actually two agents tucked inside a workflow. Pure n-agent free-form coordination is rare and hard." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 2: THE FOUR PATTERNS                                           */}
      {/* ================================================================= */}
      <section id="patterns">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — The four patterns that cover 90%</h2>

        <p>
          Anthropic&apos;s &quot;Building Effective Agents&quot; post named these and the names
          have largely stuck. Memorize this taxonomy — almost every multi-agent design you&apos;ll
          see in the wild is one of these four (or a combination).
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">1. Prompt chaining (a workflow)</h3>

        <p>
          Step A&apos;s output is Step B&apos;s input. Each step is a different LLM call (often
          with a different system prompt). Not strictly &quot;multi-agent&quot; in the loop
          sense — it&apos;s a workflow with multiple LLM personas.
        </p>

        <CodeBlock lang="plain">{`question
  → [extract intent] LLM_A
  → [generate SQL]   LLM_B
  → [explain result] LLM_C
  → answer

Each box is one LLM call. No loops. No tools (or one tool per box).`}</CodeBlock>

        <p>
          When to use: clear pipeline of structured transformations with no branching. This is
          70% of &quot;multi-agent&quot; pitches in disguise.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">2. Routing</h3>

        <p>
          A small, cheap LLM (or classifier) picks which downstream agent handles the request.
          Each downstream agent is specialized and doesn&apos;t know about the others.
        </p>

        <CodeBlock lang="plain">{`request
  → [router] picks one of:
       - billing_agent       (refunds, charges, invoices)
       - tech_support_agent  (debugging, errors, integration)
       - sales_agent         (pricing, plans, upgrades)
  → answer`}</CodeBlock>

        <p>
          When to use: the request types are clearly distinguishable AND the specialists need
          materially different prompts/tools. Don&apos;t route just to feel modular — if every
          downstream agent ends up with the same tools, collapse them.
        </p>

        <Callout variant="info" title="Cheap routers, smart specialists">
          A common, cost-effective shape: route with Haiku (or even a fine-tuned BERT
          classifier), specialize with Sonnet/Opus. The routing decision rarely needs the
          biggest model — but committing to the right specialist does.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">3. Parallelization</h3>

        <p>
          Run N agents on the same input concurrently, then merge. Two flavors:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Sectioning</strong> — each agent handles a different aspect of the same
            input. (Security review, performance review, style review of the same diff.)
          </li>
          <li>
            <strong>Voting</strong> — multiple agents do the same task; you take a majority
            vote or a consensus. Great for high-stakes classification (&quot;is this prompt
            injection?&quot;) where false negatives are bad.
          </li>
        </ul>

        <CodeBlock lang="plain">{`Sectioning:
  diff
    ├─→ security_reviewer  ──→ section
    ├─→ performance_reviewer ──→ section
    └─→ style_reviewer       ──→ section
                                 ↓
                            merger ──→ unified report

Voting:
  prompt
    ├─→ classifier_1 ──→ "safe"
    ├─→ classifier_2 ──→ "safe"
    └─→ classifier_3 ──→ "unsafe"
                            ↓
                       majority ──→ "safe"`}</CodeBlock>

        <p>
          Parallelization is the single best-bang-for-buck multi-agent pattern. It&apos;s the
          one we&apos;ll lean on for the project.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">4. Orchestrator / subagent</h3>

        <p>
          One agent (the orchestrator) plans the work and delegates pieces to subagents,
          each of which is itself an agent loop with its own tools. Subagents return summaries;
          the orchestrator assembles the final answer.
        </p>

        <CodeBlock lang="plain">{`user request
   ↓
[orchestrator] decides plan
   ├─→ delegate("research X") ─→ [subagent A loops with web tools] ─→ summary
   ├─→ delegate("analyze Y")  ─→ [subagent B loops with sql tools] ─→ summary
   └─→ delegate("write Z")    ─→ [subagent C loops with no tools]  ─→ draft
   ↓
[orchestrator] composes final answer`}</CodeBlock>

        <p>
          When to use: open-ended tasks that need both planning and depth. The orchestrator
          handles the high-level &quot;what comes next&quot;; the subagents handle the deep,
          tool-heavy execution. Anthropic&apos;s deep-research pattern is the canonical example.
        </p>

        <Callout variant="warn" title="Subagents-as-tools">
          The cleanest implementation: expose each subagent as a <code>@Tool</code> on the
          orchestrator. The orchestrator then calls it like any other tool. From the
          orchestrator&apos;s perspective, &quot;research_subagent(question)&quot; is just one
          tool that happens to take 10 seconds and return a paragraph. This makes the
          orchestrator a normal single-agent loop — much simpler than &quot;real&quot; agent
          coordination.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Bonus: evaluator-optimizer</h3>

        <p>
          A loop where one agent produces and another critiques, until the critique is happy
          (or you cap it). Useful for code generation, drafts, search refinement.
        </p>

        <CodeBlock lang="plain">{`request
   ↓
[generator] produces draft
   ↓
[evaluator] grades it: score + feedback
   ↓
   if score ≥ threshold: return draft
   else: feed feedback back to generator, loop`}</CodeBlock>

        <p>
          Worth it when the task has clear quality criteria the evaluator can check (compile?
          tests pass? matches schema?). Less worth it when the evaluator is just guessing.
        </p>

        <WorkedExample
          title="Pick the pattern"
          subtitle="Read each scenario before peeking — this is the most useful muscle to build."
          steps={[
            {
              title: "Scenario 1: classify support tickets into 8 categories, then route to a department-specific assistant",
              body: (
                <>
                  <p className="border-l-2 border-emerald-500 pl-3 text-sm">
                    <strong>Routing.</strong> A small classifier picks a category; each of the 8
                    department assistants is a specialized agent. Don&apos;t use orchestrator —
                    there&apos;s no planning, just dispatch.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 2: research a market, gather data, build a financial model, write a report",
              body: (
                <>
                  <p className="border-l-2 border-emerald-500 pl-3 text-sm">
                    <strong>Orchestrator/subagent.</strong> Variable plan, deep tool use per
                    step, work mostly sequential but with subagents that benefit from context
                    isolation (the data gatherer&apos;s 80k tokens of scraped pages don&apos;t
                    pollute the writer&apos;s context).
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 3: review a pull request for security, performance, and style",
              body: (
                <>
                  <p className="border-l-2 border-emerald-500 pl-3 text-sm">
                    <strong>Parallelization (sectioning).</strong> Three independent specialty
                    prompts on the same diff, run concurrently, merged at the end. Cuts
                    wall-clock by 3x and each reviewer gets a sharp specialty prompt.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 4: 'extract entities, then generate SQL, then summarize'",
              body: (
                <>
                  <p className="border-l-2 border-emerald-500 pl-3 text-sm">
                    <strong>Prompt chaining (a workflow).</strong> Three sequential structured
                    LLM calls — that&apos;s a pipeline, not multi-agent. Don&apos;t over-build.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 5: detect prompt injection in user input, with very low tolerance for false negatives",
              body: (
                <>
                  <p className="border-l-2 border-emerald-500 pl-3 text-sm">
                    <strong>Parallelization (voting).</strong> Run 3–5 detector calls (different
                    prompts or models) in parallel; flag if any one says &quot;injected&quot;.
                    The false-negative cost justifies the redundancy.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Checkpoint moduleSlug="multi-agent" id="patterns" title="Pattern selection" xp={25}>
          <Quiz
            kind="Quick check"
            question="A team built a 'multi-agent' system: agent A extracts entities, agent B generates a SQL query, agent C runs it, agent D formats the output. They claim it's 'four agents collaborating'. What is it really?"
            options={[
              {
                label: "A genuine orchestrator/subagent system.",
                explanation: "There's no orchestrator deciding the plan — the order is hardcoded.",
              },
              {
                label: "A prompt-chaining workflow dressed up with the word 'agents'.",
                correct: true,
                explanation: "Right. Four sequential LLM calls in a fixed order is a workflow. Calling each step an 'agent' is marketing. Reframing it as 'prompt chaining' clarifies the architecture and discourages over-engineering.",
              },
              {
                label: "Parallelization with sectioning.",
                explanation: "The steps run in sequence, not parallel. Different pattern.",
              },
              {
                label: "An evaluator-optimizer loop.",
                explanation: "There's no evaluator, no loop, no optimization. Different pattern entirely.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="The cleanest way to build an orchestrator/subagent system in Spring AI?"
            options={[
              {
                label: "Build a custom message bus and have agents publish/subscribe.",
                explanation: "Way too much infrastructure. You'd be writing a distributed system to coordinate three model calls.",
              },
              {
                label: "Expose each subagent as a @Tool method on the orchestrator. The orchestrator's loop calls subagents like any other tool.",
                correct: true,
                explanation: "Yes — this collapses the multi-agent problem into the single-agent loop you already know. The subagent runs internally, returns a string, and the orchestrator continues. Much simpler to debug and reason about.",
              },
              {
                label: "Use separate Spring Boot services and HTTP between them.",
                explanation: "Network hops add latency and failure modes you don't need. Subagents-as-tools live in the same process.",
              },
              {
                label: "Use a different LLM provider for each subagent.",
                explanation: "The provider doesn't drive the architecture; mixing is fine but unrelated to coordination.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 2 recap"
        gist="Four patterns cover 90% of real systems: chaining (workflow), routing, parallelization, orchestrator/subagent. Plus evaluator-optimizer for quality loops."
        points={[
          { takeaway: "Most 'multi-agent' systems are prompt chaining — i.e. a workflow with multiple LLM personas.", detail: "If the order is fixed and each step's output feeds the next, it's a workflow. The 'agent' label is marketing. Reframe and simplify." },
          { takeaway: "Routing = cheap classifier + specialist agents.", detail: "Use a small model (Haiku, or even a non-LLM classifier) to pick; specialize each downstream agent's prompt and tools." },
          { takeaway: "Parallelization is the highest-ROI pattern — sectioning for breadth, voting for safety.", detail: "Sectioning gives you sharp specialty prompts at no wall-clock cost. Voting is for high-stakes classification where false negatives are expensive." },
          { takeaway: "Orchestrator/subagent collapses to a normal single-agent loop if you expose subagents as @Tool.", detail: "The cleanest implementation: orchestrator runs the standard loop; each subagent is just a tool that takes longer than usual. No new coordination layer needed." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 3: PARALLELIZATION DONE RIGHT                                  */}
      {/* ================================================================= */}
      <section id="parallelization">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — Parallelization done right</h2>

        <p>
          Parallelization sounds easy: run three model calls at once, wait for all, merge. The
          gotchas are in the &quot;wait for all&quot; and &quot;merge&quot; parts.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The naive version (and why it&apos;s usually fine)</h3>

        <CodeBlock lang="java">{`@Service
public class ParallelReviewer {

    private final ChatClient security;
    private final ChatClient performance;
    private final ChatClient style;
    private final ExecutorService pool = Executors.newVirtualThreadPerTaskExecutor();

    public ReviewReport review(String diff) throws Exception {
        Future<String> sec  = pool.submit(() -> security.prompt().user(diff).call().content());
        Future<String> perf = pool.submit(() -> performance.prompt().user(diff).call().content());
        Future<String> sty  = pool.submit(() -> style.prompt().user(diff).call().content());

        return new ReviewReport(sec.get(), perf.get(), sty.get());
    }
}`}</CodeBlock>

        <p>
          Three submits, three gets. With virtual threads (Java 21+), you don&apos;t even need
          to think about pool sizing — each submit gets its own virtual thread and they all
          block waiting on HTTP without consuming OS threads.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Structured concurrency: the better version</h3>

        <p>
          Java 21 added <code>StructuredTaskScope</code> as a preview, which gives you proper
          fan-out semantics: cancel siblings on failure, gather all on success, with a clean
          try-with-resources lifecycle. If you&apos;re on a recent JDK, prefer this.
        </p>

        <CodeBlock lang="java">{`public ReviewReport review(String diff) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        var sec  = scope.fork(() -> security.prompt().user(diff).call().content());
        var perf = scope.fork(() -> performance.prompt().user(diff).call().content());
        var sty  = scope.fork(() -> style.prompt().user(diff).call().content());

        scope.join();             // wait for all
        scope.throwIfFailed();    // propagate any error

        return new ReviewReport(sec.get(), perf.get(), sty.get());
    }
}`}</CodeBlock>

        <p>
          The win: if one of the three calls fails, the other two are auto-cancelled. With raw
          futures you&apos;d wait for siblings to time out, paying for the model calls anyway.
        </p>

        <Callout variant="spring" title="Don't over-think the threading">
          Spring AI&apos;s ChatClient calls are blocking HTTP. They don&apos;t care about
          which executor or scope they&apos;re on. Use whatever your team is comfortable with —
          virtual threads + futures, or structured concurrency, or even Reactor if your stack
          is already reactive. The API call shape is the same.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Partial failure: the question to answer up front</h3>

        <p>
          When one of three reviewers fails (timeout, rate limit, network), what do you do?
          There are three reasonable answers and you need to pick one before shipping:
        </p>

        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            <strong>All-or-nothing.</strong> Any failure → fail the request. Easiest to reason
            about. Use when results are tightly coupled (voting needs all votes).
          </li>
          <li>
            <strong>Best-effort.</strong> Return what succeeded; mark the failed sections as
            &quot;could not review&quot;. Use when sections are independent (sectioning) and
            users prefer partial info to none.
          </li>
          <li>
            <strong>Retry-then-degrade.</strong> Retry the failed call once with a cheaper or
            faster model; only mark as failed if both shots fail. More moving parts, often
            worth it for user-facing flows.
          </li>
        </ol>

        <CodeBlock lang="java">{`// Best-effort version — sectioning is forgiving
public ReviewReport reviewBestEffort(String diff) {
    try (var scope = new StructuredTaskScope<String>()) {
        var sec  = scope.fork(() -> safeCall(security, diff, "security"));
        var perf = scope.fork(() -> safeCall(performance, diff, "performance"));
        var sty  = scope.fork(() -> safeCall(style, diff, "style"));

        scope.join();             // wait but don't fail-fast

        return new ReviewReport(
            sec.get(), perf.get(), sty.get()   // each is content OR a "[failed]" marker
        );
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return ReviewReport.cancelled();
    }
}

private String safeCall(ChatClient client, String diff, String role) {
    try {
        return client.prompt().user(diff).call().content();
    } catch (Exception e) {
        log.warn("{} reviewer failed: {}", role, e.getMessage());
        return "[" + role + " review unavailable: " + e.getMessage() + "]";
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Voting: aggregating the answers</h3>

        <p>
          The voting flavor needs an aggregator. Three patterns, in order of complexity:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Plain majority</strong> — N classifiers, take the mode. Cheapest. Works
            well for binary or small-cardinality outputs.
          </li>
          <li>
            <strong>Weighted vote</strong> — each classifier returns a confidence; aggregate
            with the confidences. Better calibration but the model has to be honest about
            confidence (they often aren&apos;t).
          </li>
          <li>
            <strong>LLM judge</strong> — feed the N answers to a separate LLM that picks the
            best. Most flexible, most expensive. Useful when answers are free-text rather than
            categorical.
          </li>
        </ul>

        <Callout variant="warn" title="Don't ask the model to vote on its own past answers">
          If you&apos;re using LLM-as-judge for voting, use a different prompt (or a different
          model) for the judge than for the voters. Asking the same prompt to both vote and
          judge creates an obvious correlation: it&apos;ll just pick its own answer.
        </Callout>

        <Checkpoint moduleSlug="multi-agent" id="parallelization" title="Parallel patterns" xp={25}>
          <Quiz
            kind="Quick check"
            question="You're running 3 reviewers in parallel with raw Future.get(). Reviewer 2 fails immediately, but reviewers 1 and 3 keep running and you keep paying for their model calls until they finish. What's the smallest fix?"
            options={[
              {
                label: "Add try/catch around each call.",
                explanation: "That handles failures gracefully but doesn't cancel siblings — the still-running ones still bill you.",
              },
              {
                label: "Wrap the fan-out in StructuredTaskScope.ShutdownOnFailure — when one fails, the scope auto-cancels the others.",
                correct: true,
                explanation: "Right. Structured concurrency exists for exactly this. Sibling cancellation kills the in-flight calls when one fails (in 'fail fast' mode), so you stop paying for work you'll throw away.",
              },
              {
                label: "Reduce the timeout on individual calls.",
                explanation: "Helps a bit but doesn't actually cancel the in-flight ones; you'd still pay until each times out.",
              },
              {
                label: "Run the reviewers sequentially.",
                explanation: "Throws away the whole point of parallelization. Now you wait 3x as long.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You're using voting (N=5) for prompt-injection detection. All 5 voters use the same model with the same prompt — just N parallel calls of the same thing. The vote is unanimous on every input you've tested. Is this a good system?"
            options={[
              {
                label: "Yes — the high agreement means the model is confident.",
                explanation: "It means the calls are correlated, not that the answer is right. Same prompt, same model, similar tokens → near-identical outputs. The 'voting' is theater.",
              },
              {
                label: "No — N voters with the same prompt and same model produce highly correlated results. You're paying 5x for one decision. Diversify (different prompts, or different models) or drop the redundancy.",
                correct: true,
                explanation: "Right. Voting only helps if the voters can fail independently. Same prompt + same model + same input ≈ same output every time. Diversity is what makes ensembles work.",
              },
              {
                label: "Yes — redundancy is good for safety.",
                explanation: "Redundant correlated calls aren't safer than one call. They're just five times more expensive.",
              },
              {
                label: "No — voting only works with at least 7 voters.",
                explanation: "There's no magic number; the real issue is correlation, not count.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 3 recap"
        gist="Parallelization is the highest-ROI multi-agent pattern. Get the failure semantics and the aggregation right and you're done."
        points={[
          { takeaway: "Use virtual threads or StructuredTaskScope — don't agonize over thread pools.", detail: "Java 21+ makes blocking HTTP calls cheap to fan out. Structured concurrency adds clean sibling-cancellation on the failure path." },
          { takeaway: "Decide partial-failure semantics up front: all-or-nothing, best-effort, or retry-then-degrade.", detail: "Each makes sense in different contexts. Sectioning usually wants best-effort; voting usually wants all-or-nothing." },
          { takeaway: "Voting only helps if voters fail independently.", detail: "Same model + same prompt + same input = correlated outputs. Diversify prompts, models, or both — otherwise you're paying for redundancy that gives you nothing." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 4: ANTI-PATTERNS                                               */}
      {/* ================================================================= */}
      <section id="antipatterns">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Multi-agent anti-patterns</h2>

        <p>
          Most public multi-agent demos are anti-pattern showcases. Here&apos;s what to avoid,
          with the failure modes you&apos;ll actually see.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The chatty multi-agent</h3>

        <p>
          Two or more agents that &quot;converse&quot; with each other in free-form natural
          language to coordinate. The worst possible architecture: every turn is a non-trivial
          token cost, the conversation drifts off-topic, and debugging requires reading
          transcripts of two LLMs gossiping.
        </p>

        <CodeBlock lang="plain">{`Agent A: "I need data on X. Can you fetch it?"
Agent B: "Sure! Should I also get Y?"
Agent A: "Hmm, let me think. Yes, Y too."
Agent B: "On it. Anything else?"
Agent A: "While you're at it, Z?"
... [12 more turns of small-talk before any actual work happens]`}</CodeBlock>

        <p>
          The fix: structure the communication. If A delegates to B, do it as a tool call with
          a defined input/output schema. The natural-language back-and-forth is the bug, not
          the feature.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Role bloat</h3>

        <p>
          The system prompt for each agent grows to 800 words of personality, &quot;values&quot;,
          and meta-instructions. The agent then spends most of its tokens explaining its
          persona instead of doing the task.
        </p>

        <Callout variant="warn" title="The 200-word rule">
          Most specialty system prompts under 200 words outperform ones over 600. If your
          system prompt is a personality essay, cut it to: role, tools, criteria for stopping,
          rules. Add detail only when you can show it changes behavior on real inputs.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Infinite delegation</h3>

        <p>
          Subagents are themselves orchestrators that delegate to sub-subagents that delegate
          further. After three layers, no human can reason about what the system actually does
          and the cost ramps geometrically.
        </p>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Cap delegation depth at 1 (orchestrator → subagent, no sub-subagents).</li>
          <li>If a subagent &quot;needs&quot; to delegate further, that&apos;s a sign your decomposition is wrong.</li>
          <li>If the temptation to nest is real, consider whether the orchestrator should be doing more in-process instead.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Spec drift between agents</h3>

        <p>
          Agent A produces output that Agent B is supposed to consume. Both are configured
          independently. After a prompt update on A, B starts misreading inputs in subtle
          ways. No tests catch it because each agent passed its own unit tests.
        </p>

        <p>The fix: contract the interface like any other API.</p>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Use structured output between agents (JSON schemas, not prose).</li>
          <li>Test the integration end-to-end with golden examples.</li>
          <li>Version the contract; treat it like an API change when you modify it.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">The &quot;crew&quot; trap</h3>

        <p>
          Several frameworks (CrewAI, AutoGen, etc.) market &quot;a crew of specialized
          agents that collaborate&quot; as the primary abstraction. They&apos;re fun for
          demos. They&apos;re also slow, expensive, and difficult to debug compared to a
          well-structured single-agent + tools or a parallelized fan-out.
        </p>

        <Callout variant="insight" title="The reframe that fixes most pitches">
          When someone proposes a 5-agent system, ask: <em>&quot;What if it were one agent
          with 5 tools?&quot;</em> 80% of the time the answer is &quot;...actually that would
          be simpler and cheaper&quot;. Try it before reaching for a multi-agent framework.
        </Callout>

        <Checkpoint moduleSlug="multi-agent" id="antipatterns" title="Spotting anti-patterns" xp={20}>
          <Quiz
            kind="Quick check"
            question="A team's design has Agent A talking to Agent B in free-form natural language to coordinate a refund. The trace logs show 8-turn conversations between them before any tool fires. What's the fix?"
            options={[
              {
                label: "Use a smarter model so the conversations are shorter.",
                explanation: "More expensive. The conversations would still be free-form chatter; you'd just pay more per turn.",
              },
              {
                label: "Replace the natural-language coordination with a tool-call interface: A invokes B as a tool with a typed payload, B returns a typed response.",
                correct: true,
                explanation: "Right. The free-form chat is the bug. Structured delegation (tool call with schema) is faster, cheaper, debuggable, and contract-able.",
              },
              {
                label: "Add a third agent to mediate.",
                explanation: "Now you have three chatty agents. The token bill 1.5x's, the latency increases, and nobody is happier.",
              },
              {
                label: "Remove Agent B and have Agent A do everything.",
                explanation: "Sometimes right, sometimes not — depends on whether B's specialty is real. Structured delegation is the more general fix.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Which of these is the strongest sign your multi-agent design is over-engineered?"
            options={[
              {
                label: "It uses different models for different agents.",
                explanation: "That's actually a smart cost-optimization, not an anti-pattern.",
              },
              {
                label: "Each subagent is itself an orchestrator that delegates to its own subagents, three layers deep.",
                correct: true,
                explanation: "Yes — infinite delegation. Cost ramps geometrically, debugging is impossible, and the decomposition is almost certainly wrong. Cap delegation at 1 layer.",
              },
              {
                label: "You use structured JSON between agents instead of free-form text.",
                explanation: "That's correct engineering — opposite of an anti-pattern.",
              },
              {
                label: "You parallelize three reviewers on the same input.",
                explanation: "Sectioning is one of the highest-ROI multi-agent patterns. Not over-engineered.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 4 recap"
        gist="Most multi-agent failures are anti-pattern failures. Structure communication, cap depth, version the contracts."
        points={[
          { takeaway: "Free-form natural-language coordination between agents is the worst pattern.", detail: "Replace agent-to-agent chat with structured tool calls. Schemas, not prose." },
          { takeaway: "Cap delegation depth at 1.", detail: "Orchestrator → subagent. Period. If a subagent 'needs' to delegate further, your decomposition is wrong; promote that work back into the orchestrator's plan." },
          { takeaway: "Treat inter-agent contracts like APIs.", detail: "Use structured output, golden tests, versioning. Spec drift between agents is the multi-agent equivalent of breaking an API consumer." },
          { takeaway: "Default reframe: 'what if this were one agent with N tools?' — 80% of the time, simpler wins.", detail: "Multi-agent framework demos are seductive. Production survivors usually look more like one well-tooled agent than a 'crew'." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 5: PROJECT                                                     */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: PR review panel</h2>

        <p>
          Time to ship a parallelized multi-agent system that earns its keep. We&apos;re
          building a PR review panel: takes a unified diff, fans it out to three specialty
          reviewers (security, performance, style), runs them concurrently with structured
          output, and merges into a single report.
        </p>

        <Callout variant="info" title="Why this project specifically">
          PR review is the textbook fit for parallelization-with-sectioning: independent
          specialties, no need for them to see each other&apos;s output, and a clear merge
          step. It&apos;s also the kind of thing you might actually use, which makes it more
          motivating than a synthetic example.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Spec</h3>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Input: a unified diff string (hunks for one or more files).</li>
          <li>Three reviewers, each with its own ChatClient + system prompt + structured output.</li>
          <li>Run in parallel using <code>StructuredTaskScope</code>.</li>
          <li>Best-effort failure semantics — if one reviewer fails, the others still produce a partial report.</li>
          <li>Output: <code>ReviewReport</code> record with <code>{`List<Finding>`}</code> per category, plus an overall verdict.</li>
          <li>Endpoint: <code>POST /api/review</code> with the diff in the body.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">The output schema</h3>

        <p>
          Structured output is the contract. Define it once, share it across reviewers — that
          way the merger doesn&apos;t have to parse three flavors of prose.
        </p>

        <CodeBlock lang="java">{`public record Finding(
    Severity severity,        // LOW | MEDIUM | HIGH | CRITICAL
    String file,              // e.g. "src/main/java/Foo.java"
    int line,                 // best-guess line in the new file
    String issue,             // one-sentence summary
    String suggestion         // concrete fix
) {}

public record ReviewSection(
    String reviewer,          // "security" | "performance" | "style"
    List<Finding> findings,
    String overallNote        // 1-2 sentence summary of this section
) {}

public record ReviewReport(
    List<ReviewSection> sections,
    Verdict verdict,          // APPROVE | REQUEST_CHANGES | COMMENT
    String tldr               // 1 paragraph for the PR comment
) {}

public enum Severity { LOW, MEDIUM, HIGH, CRITICAL }
public enum Verdict  { APPROVE, REQUEST_CHANGES, COMMENT }`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">The reviewer ChatClients</h3>

        <p>
          Each reviewer is just a <code>ChatClient</code> with a sharply-scoped system prompt.
          Build them once at startup and inject.
        </p>

        <CodeBlock lang="java">{`@Configuration
public class ReviewerConfig {

    @Bean("securityReviewer")
    ChatClient security(ChatClient.Builder builder) {
        return builder.defaultSystem("""
            You are a SECURITY code reviewer. Your scope:
              - injection (SQL, command, prompt)
              - authn/authz mistakes
              - secret/credential exposure
              - unsafe deserialization, XXE, SSRF
              - dependency CVEs visible in the diff

            STRICTLY out of scope: style, performance, naming. Don't comment on those.

            Severity guide:
              CRITICAL: real exploit chain present
              HIGH:     dangerous pattern, exploit plausible
              MEDIUM:   needs caution / hardening
              LOW:      nit/best-practice

            Be concrete. Cite lines. Suggest a specific fix.
            """).build();
    }

    @Bean("performanceReviewer")
    ChatClient performance(ChatClient.Builder builder) {
        return builder.defaultSystem("""
            You are a PERFORMANCE code reviewer. Your scope:
              - N+1 queries, missing indexes
              - O(n^2) loops on large inputs
              - blocking I/O on hot paths
              - memory leaks, allocation hotspots
              - cache invalidation issues

            Out of scope: style, security, naming.

            Be specific about why something is slow and roughly how slow.
            """).build();
    }

    @Bean("styleReviewer")
    ChatClient style(ChatClient.Builder builder) {
        return builder.defaultSystem("""
            You are a STYLE/clarity reviewer. Your scope:
              - naming, structure, readability
              - code duplication and reusable extraction
              - comments and docstrings
              - magic numbers, dead code, unused imports

            Out of scope: security, performance correctness.

            Mark severity LOW for nits, MEDIUM for clarity issues that
            would slow down future maintainers.
            """).build();
    }
}`}</CodeBlock>

        <Callout variant="warn" title="Keep their lanes separate">
          The boundaries (&quot;out of scope&quot;) are doing real work. Without them, all
          three reviewers will comment on naming. With them, you get focused, non-overlapping
          findings — which is the whole point of sectioning.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">The fan-out service</h3>

        <CodeBlock lang="java">{`@Service
public class PrReviewService {

    private final ChatClient security;
    private final ChatClient performance;
    private final ChatClient style;
    private final ChatClient merger;

    public PrReviewService(
            @Qualifier("securityReviewer") ChatClient security,
            @Qualifier("performanceReviewer") ChatClient performance,
            @Qualifier("styleReviewer") ChatClient style,
            ChatClient.Builder mergerBuilder) {
        this.security = security;
        this.performance = performance;
        this.style = style;
        this.merger = mergerBuilder.defaultSystem("""
            You merge code-review sections into a single report.
            Pick a single overall verdict (APPROVE / REQUEST_CHANGES / COMMENT)
            based on the highest severity present:
              any CRITICAL or HIGH → REQUEST_CHANGES
              only MEDIUM/LOW       → COMMENT
              none                  → APPROVE
            Write a 1-paragraph TL;DR for the PR thread.
            """).build();
    }

    public ReviewReport review(String diff) throws InterruptedException {
        try (var scope = new StructuredTaskScope<ReviewSection>()) {
            var sec  = scope.fork(() -> reviewerCall(security,    "security",    diff));
            var perf = scope.fork(() -> reviewerCall(performance, "performance", diff));
            var sty  = scope.fork(() -> reviewerCall(style,       "style",       diff));

            scope.join();

            List<ReviewSection> sections = List.of(sec.get(), perf.get(), sty.get());
            return mergeReport(sections);
        }
    }

    private ReviewSection reviewerCall(ChatClient client, String role, String diff) {
        try {
            return client.prompt()
                .user("Review this diff. Return findings only in your scope.\\n\\n" + diff)
                .call()
                .entity(ReviewSection.class);
        } catch (Exception e) {
            log.warn("{} reviewer failed: {}", role, e.getMessage());
            return new ReviewSection(role, List.of(),
                "Reviewer unavailable: " + e.getMessage());
        }
    }

    private ReviewReport mergeReport(List<ReviewSection> sections) {
        return merger.prompt()
            .user("Merge these review sections into a final report:\\n\\n" +
                  sections.stream()
                      .map(s -> "## " + s.reviewer() + "\\n" + s)
                      .collect(Collectors.joining("\\n\\n")))
            .call()
            .entity(ReviewReport.class);
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why a separate merger model call">
          The merger is doing real work — picking the verdict and writing the TL;DR. We could
          do this with deterministic Java code (highest severity wins, concatenate all
          findings). For pure verdict logic, that&apos;s probably better. The LLM merger earns
          its keep on the TL;DR — which has to read smoothly and call out the most important
          one or two findings, not just list them.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Test cases to actually run</h3>

        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            <strong>Clean diff:</strong> a small, well-written change. All three reviewers
            should produce empty findings; verdict = APPROVE.
          </li>
          <li>
            <strong>SQL injection planted:</strong> a diff that concatenates user input into
            SQL. Security should flag CRITICAL; verdict = REQUEST_CHANGES.
          </li>
          <li>
            <strong>N+1 query planted:</strong> a loop that hits the DB inside. Performance
            should flag HIGH or MEDIUM.
          </li>
          <li>
            <strong>Lane discipline:</strong> a diff with a security <em>and</em> a naming
            issue. Confirm only the security reviewer flags the security issue and only the
            style reviewer flags the naming issue.
          </li>
          <li>
            <strong>Reviewer failure:</strong> stub one of the ChatClients to throw. Confirm
            best-effort path works — report comes back with two sections + one
            &quot;unavailable&quot; section.
          </li>
          <li>
            <strong>Wall-clock comparison:</strong> measure latency vs running the three
            reviewers sequentially. You should see roughly 3x speedup.
          </li>
        </ol>

        <Checkpoint
          moduleSlug="multi-agent"
          id="project"
          title="Build the PR review panel"
          xp={60}
          manual
          manualLabel="I built the PR review panel and ran every test case"
          celebration="A real parallelized multi-agent system that's actually useful. Phase 5 boss-fight cleared."
        >
          <p>
            Build the PR review panel end to end. Run all six test cases, including the
            lane-discipline one (that&apos;s the test that proves your specialty prompts are
            actually working — it&apos;s the most useful debugging signal you&apos;ll have).
          </p>
          <p className="mt-3">
            <strong>Stretch goal:</strong> add a fourth reviewer — &quot;test
            coverage&quot; — that flags new logic added without corresponding tests.
            Importantly, run with <em>four</em> in parallel and confirm the structured
            concurrency scope still gives you 4x speedup vs sequential.
          </p>
          <p className="mt-3">
            <strong>Bigger stretch:</strong> wire the panel to a webhook that runs on every
            new PR in a target repo and posts the merged TL;DR as a PR comment. Now you have
            something that&apos;s genuinely useful, not just instructive.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL                                                       */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 6 — Putting it all together</h2>

        <p>That&apos;s Phase 5. You&apos;ve gone from:</p>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li><strong>Module 21:</strong> what an agent is, by hand — a loop with tools and stop conditions</li>
          <li><strong>Module 22:</strong> agents in Spring AI, with auto-loop, manual loop, memory layers, and production stopping</li>
          <li><strong>Module 23:</strong> when one agent isn&apos;t enough — the four patterns, parallelization, and the anti-patterns to avoid</li>
        </ul>

        <p>
          Phase 6 takes everything from this course and turns it production-grade: evals,
          security, the &quot;should I fine-tune?&quot; question, and a capstone project that
          ties RAG, tool use, and agent patterns together into something portfolio-worthy.
        </p>

        <Checkpoint moduleSlug="multi-agent" id="final" title="Final quiz" xp={30}>
          <Quiz
            kind="Quick check"
            question="A 'multi-agent' system runs four LLM calls in a fixed order: extract → query → execute → format. Which pattern is this?"
            options={[
              {
                label: "Orchestrator/subagent.",
                explanation: "There's no orchestrator picking the plan — the order is hardcoded.",
              },
              {
                label: "Parallelization (sectioning).",
                explanation: "The steps run sequentially, each consuming the previous output.",
              },
              {
                label: "Prompt chaining (a workflow).",
                correct: true,
                explanation: "Right. Sequential, fixed-order LLM calls = workflow. Calling each step an 'agent' is marketing — the architecture is a pipeline.",
              },
              {
                label: "Routing.",
                explanation: "There's no router picking among options. Different pattern.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Voting with N=5 detectors gives unanimous results in 100% of test cases. Same model, same prompt, same input. Best diagnosis?"
            options={[
              {
                label: "The model is exceptionally well-calibrated.",
                explanation: "Calibration is about whether confidence matches accuracy. Unanimous-because-deterministic-on-same-prompt isn't calibration — it's correlation.",
              },
              {
                label: "The voters are too correlated to add real safety. Diversify (different prompts, different models) or drop the voting.",
                correct: true,
                explanation: "Right. Voting only helps if voters can fail independently. Same model + same prompt + same input ≈ same output. You're paying 5x for one decision that adds no signal.",
              },
              {
                label: "Add more voters.",
                explanation: "More correlated voters = more correlated wrong answers. Diversity, not count, is what matters.",
              },
              {
                label: "Switch to weighted voting.",
                explanation: "Weights don't help when the underlying votes are correlated by design.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Production multi-agent system: orchestrator delegates to subagents, which delegate to sub-subagents, three layers deep. Token costs are 12x your single-agent baseline. What's the right surgical fix?"
            options={[
              {
                label: "Switch to a cheaper model at the leaf level.",
                explanation: "Helps a bit but doesn't address the architectural problem — you'd still pay 12x base, just a smaller multiplier.",
              },
              {
                label: "Cap delegation depth at 1 layer. Promote sub-subagent work into the subagent or the orchestrator's plan.",
                correct: true,
                explanation: "Yes — infinite delegation is the actual bug. After one level the orchestrator can't reason about what's happening, and costs ramp geometrically. Flattening usually exposes that the deep nesting wasn't actually buying anything.",
              },
              {
                label: "Add caching across subagents.",
                explanation: "Caching helps repeated work. The geometric blow-up is structural, not from repetition.",
              },
              {
                label: "Run subagents in parallel.",
                explanation: "Parallelism helps wall-clock time, not token cost. The bill is the bill.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Two agents communicate via free-form natural language to coordinate a refund. Best fix?"
            options={[
              {
                label: "Use a smarter, more concise model.",
                explanation: "Same architecture, just costlier. Doesn't fix the structural issue.",
              },
              {
                label: "Replace the chat with a tool-call interface — A invokes B as a tool with a typed payload, B returns a typed response.",
                correct: true,
                explanation: "Right. Free-form coordination is the bug. Structured delegation (schema in, schema out) is faster, debuggable, contract-able, and cheaper.",
              },
              {
                label: "Add a third agent to mediate.",
                explanation: "Three chatty agents instead of two. Worse.",
              },
              {
                label: "Train a custom model on the conversation pattern.",
                explanation: "Wildly disproportionate to the problem.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You have parallelization with sectioning (security/performance/style reviewers). One reviewer fails. You're using StructuredTaskScope.ShutdownOnFailure. What happens?"
            options={[
              {
                label: "All three reviews complete; you get partial results.",
                explanation: "ShutdownOnFailure cancels siblings on the first failure. For best-effort partial results you'd want a different scope variant.",
              },
              {
                label: "The siblings are cancelled and the whole call fails.",
                correct: true,
                explanation: "Yes — that's the behavior of ShutdownOnFailure. Sibling cancellation is the cost-saving feature, but it also means partial-success isn't the default; you have to opt into it with a custom scope or per-task try/catch.",
              },
              {
                label: "The remaining reviewers get a bonus 30 seconds to finish.",
                explanation: "There's no such mechanism.",
              },
              {
                label: "Spring AI auto-retries the failed reviewer.",
                explanation: "There's no implicit retry from Spring AI; you'd have to build that yourself.",
              },
            ]}
          />
        </Checkpoint>

        <div className="mt-12 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
          <p className="font-semibold mb-2">Coming up next — Phase 6: Production &amp; Capstone</p>
          <p className="text-sm">
            <strong>Module 24 (Evals)</strong>: how do you actually know your LLM feature is
            getting better, not worse? Golden sets, LLM-as-judge, regression testing.
            <br />
            <strong>Module 25 (Security)</strong>: prompt injection, PII, output filtering — the
            things you wish you&apos;d done before launch.
            <br />
            <strong>Module 26 (Fine-tuning)</strong>: when to bother. (Spoiler: rarely.)
            <br />
            <strong>Module 27 (Capstone)</strong>: the AI engineering assistant. Everything you&apos;ve
            built so far, threaded into one portfolio piece.
          </p>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="multi-agent" />
    </article>
  );
}
