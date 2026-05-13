import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/ai";
import ModuleNav from "@/components/ModuleNav";

// Phase 5 revision — pure reference card. No checkpoints, no XP gates. The
// point is to re-read this in 15 minutes before designing an agent, not to
// grind through it as a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

// The agent tool loop in Spring — model emits a tool_use, the runtime executes
// the tool, feeds the result back, and the model decides the next step. Loop
// continues until the model emits a final answer with no tool_use OR a stop
// condition fires (max iterations, budget cap, wall-clock timeout, failure).
const agentLoopChart = `
flowchart TD
    Start(["user goal"]) --> Model{"call model<br/>(messages + tools)"}
    Model -->|"tool_use emitted"| Exec["execute tool<br/>(idempotent + bounded)"]
    Exec --> Append["append tool_result<br/>to messages"]
    Append --> Guard{"stop?<br/>iters / tokens / wallclock"}
    Guard -->|"no"| Model
    Guard -->|"yes — over budget"| Failed(["state: failed<br/>partial answer"])
    Model -->|"final answer<br/>no tool_use"| Done(["state: done<br/>structured output"])
    style Start fill:#6366f1,color:#fff,stroke:#4f46e5
    style Model fill:#a855f7,color:#fff,stroke:#9333ea
    style Exec fill:#0ea5e9,color:#fff,stroke:#0284c7
    style Append fill:#0ea5e9,color:#fff,stroke:#0284c7
    style Guard fill:#f59e0b,color:#fff,stroke:#d97706
    style Done fill:#10b981,color:#fff,stroke:#059669
    style Failed fill:#ef4444,color:#fff,stroke:#dc2626
  `.trim();

export default function Phase5RevisionModule() {
  const mod = getModuleBySlug("phase-5-revision")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/ai"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 5 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 5 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          ReAct, agent loops in Spring, multi-agent orchestration — the agent reference card.
        </p>
        <ModuleProgress moduleSlug="phase-5-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This is the map of Phase 5 — the ReAct loop, what an agent actually is in Spring, the multi-agent patterns, and (most importantly) the failure modes that bite teams who reach for an agent on every problem. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The three modules you&apos;re consolidating: <Link href="/courses/ai/modules/agents-intro" className="text-indigo-600 hover:underline">Agent fundamentals</Link>, <Link href="/courses/ai/modules/agent-spring" className="text-indigo-600 hover:underline">Agents in Spring Boot</Link>, and <Link href="/courses/ai/modules/multi-agent" className="text-indigo-600 hover:underline">Multi-agent patterns</Link>.
        </p>

        <Callout variant="warn">
          <strong>Read this first:</strong> agents are the most exciting thing in this course and the most dangerous in production. <em>Most problems do not need an agent.</em> A deterministic pipeline with one or two tool calls is cheaper, faster, more debuggable, and won&apos;t set your wallet on fire. Reach for an agent only when the steps are genuinely unknown until runtime. The rest of this card assumes you&apos;ve already decided you need one.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Agent fundamentals */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Agent fundamentals — what&apos;s actually under the hood</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Strip away the marketing. An agent is tool-use in a while loop with a stopping condition.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">The ReAct loop</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Three steps repeated until the model stops asking for tools:
            </p>
            <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal pl-5">
              <li><strong>Thought</strong> — model reasons about what to do next</li>
              <li><strong>Action</strong> — model emits a <code>tool_use</code> block</li>
              <li><strong>Observation</strong> — runtime executes the tool, appends the <code>tool_result</code> to the conversation</li>
            </ol>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Repeat. The model decides on each turn whether to call another tool or emit a final answer. That&apos;s the whole trick.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-purple-50/40 dark:bg-purple-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2">Three kinds of memory</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li><strong>Scratchpad</strong> — the message list itself. The model&apos;s working memory within one task.</li>
              <li><strong>Summarized history</strong> — when the scratchpad blows past your context window, compress old turns into a summary turn.</li>
              <li><strong>External store</strong> — durable memory across sessions (vector DB, KV store, database). Read via a tool, write via a tool.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Most production agents need all three. The scratchpad is automatic; the other two are work.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Stopping conditions — every one of these must be wired</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">When it fires</th>
                <th className="px-4 py-3 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Final answer</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Model emits a response with no <code>tool_use</code> block</td>
                <td className="px-4 py-3 text-emerald-600">done — return the answer</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Max iterations</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Loop counter exceeds <code>maxIterations</code> (typically 10–25)</td>
                <td className="px-4 py-3 text-amber-600">failed — return partial result + flag</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Token budget</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cumulative input+output tokens exceeds budget</td>
                <td className="px-4 py-3 text-amber-600">failed — cost-protected halt</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Wall-clock</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Total elapsed time exceeds latency SLA</td>
                <td className="px-4 py-3 text-amber-600">failed — user is waiting</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Tool failure</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A tool throws after retries are exhausted</td>
                <td className="px-4 py-3 text-rose-600">failed — escalate</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">User cancel</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Caller closes the connection / cancels the request</td>
                <td className="px-4 py-3 text-slate-500">cancelled — clean up in-flight tools</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>The mental model:</strong> agent = LLM + toolbox + loop + stopping condition. If you can&apos;t name your stopping conditions, you don&apos;t have an agent — you have an unbounded process.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/agents-intro" className="text-indigo-600 hover:underline">Module 24 — Agent fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — When NOT to use an agent */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. When NOT to use an agent — the decision table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The hardest part of agent engineering is choosing to not build one.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">If the problem looks like…</th>
                <th className="px-4 py-3 font-semibold">Build this instead</th>
                <th className="px-4 py-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">The steps are known up front: parse → look up → format → reply</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">Deterministic pipeline</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cheaper, faster, observable. Each step is one LLM call or one DB query.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">One shot of reasoning over the input, no external lookups needed</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">Direct prompt</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A loop adds no value when there&apos;s nothing to iterate on.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Known steps but one needs runtime data (e.g. look up customer, then summarize)</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">Pipeline with one or two tool calls</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Tool use ≠ agent. You can call a tool from a fixed pipeline.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">User strict P99 latency budget (&lt; 500 ms)</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">Pipeline — or constrained agent with hard caps</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every agent step is a round-trip. Loops blow latency budgets.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">The path is genuinely unknown until you start (research, debugging, exploration)</td>
                <td className="px-4 py-3 font-semibold text-indigo-600">Agent — bounded</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">The agent shines when the next step depends on what you just learned.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Production system with a reliability SLA</td>
                <td className="px-4 py-3 font-semibold text-indigo-600">Constrained agent — hard caps + fallbacks</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cap iterations, cap cost, cap wall-clock. Fall back to a deterministic path on failure.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">The three failure modes of un-constrained agents</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Infinite loop</div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Model calls the same tool with the same args, sees the same result, decides to call it again. No max-iteration cap means your process runs until you kill it.
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Drift</div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              The agent loses the plot ten turns in — starts solving a different problem, or pursues an irrelevant tangent that&apos;s now in its scratchpad and biasing every subsequent step.
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Cost explosion</div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Each turn re-sends the entire scratchpad. Turn 20 might re-process 50K tokens of prior context. One request can cost dollars; a bad day can cost thousands.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/agents-intro" className="text-indigo-600 hover:underline">Module 24 — Agent fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Mermaid: the agent loop */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The agent tool loop, end-to-end</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The flow your Spring service implements. The two exit edges are the only two things that should ever terminate the loop — everything else is a bug.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={agentLoopChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Every box on this diagram needs structured logging.</strong> When something goes wrong in production, you need to see exactly which iteration, which tool, which args, and which result.
          </li>
          <li>
            <strong>The guard is your safety net.</strong> If your only exit is the final-answer edge, one bug in the model&apos;s reasoning hangs the process forever. The guard fires <em>before</em> the next model call so you never pay for a turn you&apos;re about to abort.
          </li>
          <li>
            <strong>The tool_result must always be appended.</strong> If the tool fails, append a structured error result — never silently retry or skip the turn. The model needs to see the failure to recover.
          </li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/agent-spring" className="text-indigo-600 hover:underline">Module 25 — Agents in Spring Boot</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Agents in Spring Boot */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Agents in Spring Boot — the five moving parts</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          What lives where in a production Spring agent service.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">1. Tool registry</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              A <code>Map&lt;String, Tool&gt;</code> of tool name → executor. Each <code>Tool</code> exposes its JSON schema (for the model) and an <code>execute(args)</code> method (for the runtime). Register beans; the agent looks up by name when a <code>tool_use</code> arrives.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">2. Loop controller</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Owns the three caps: <code>maxIterations</code>, <code>maxTokens</code>, <code>wallClockBudgetMs</code>. Decrements / accumulates after each turn, checks before the next model call, halts cleanly when any one trips.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">3. State machine</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Four states: <code>RUNNING</code> → <code>AWAITING_TOOL</code> → <code>RUNNING</code> → <code>DONE</code> or <code>FAILED</code>. Each transition is logged. The state is what you serialize if you need to checkpoint a long-running agent and resume later.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">4. Idempotent tool execution</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Tools must be safe to retry. Use an idempotency key built from <code>(toolName, args-hash)</code>. Cache results within a single agent run so the model can&apos;t accidentally re-bill you for the same lookup three turns in a row.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40 md:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">5. Structured final output</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              The final answer should not be free-form text. Define a JSON schema (or a Java record) for what &quot;done&quot; looks like, and ask the model for it via the structured-output pattern. Your callers downstream parse a typed object, not a paragraph.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">The minimal loop in Spring</h3>
        <CodeBlock lang="java" caption="AgentRunner.run — the entire control flow">{`public AgentResult run(AgentTask task) {
    List<Message> messages = new ArrayList<>(task.initialMessages());
    int iterations = 0;
    int tokensUsed = 0;
    long deadline = System.currentTimeMillis() + config.wallClockBudgetMs();

    while (true) {
        // Guard before every model call — cost protection first.
        if (iterations >= config.maxIterations()) return AgentResult.failed(messages, "max_iterations");
        if (tokensUsed >= config.maxTokens())    return AgentResult.failed(messages, "token_budget");
        if (System.currentTimeMillis() > deadline) return AgentResult.failed(messages, "wallclock");

        ModelResponse resp = client.complete(messages, toolRegistry.schemas());
        tokensUsed += resp.usage().total();
        iterations++;

        if (resp.toolUses().isEmpty()) {
            // No tool requested — model has decided it's done.
            return AgentResult.done(messages, resp.finalOutput());
        }

        // Execute each requested tool (cached + idempotent) and append results.
        for (ToolUse use : resp.toolUses()) {
            ToolResult result = toolRegistry.execute(use); // catches exceptions internally
            messages.add(Message.toolResult(use.id(), result));
        }
    }
}`}</CodeBlock>

        <Callout variant="insight">
          <strong>The whole production agent is this loop plus observability.</strong> Frameworks add convenience, not magic. If your agent is misbehaving, you debug it by reading the message list turn by turn — there&apos;s nowhere else for the bug to hide.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/agent-spring" className="text-indigo-600 hover:underline">Module 25 — Agents in Spring Boot</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Multi-agent patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Multi-agent patterns — when one agent isn&apos;t enough</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          You move from one agent to many when the work splits naturally into specialist roles OR when you can parallelize independent subproblems.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">Orchestrator + subagents</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              A top-level agent decomposes the task, spawns specialist subagents, collects their outputs, reconciles. Each subagent has its own tool subset and context window.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Best for: research, codebase analysis, anything with clear subtasks.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-purple-50/40 dark:bg-purple-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2">Peer-to-peer (handoff)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Agents pass the conversation to one another based on the current need. The &quot;triage&quot; agent hands off to a &quot;billing&quot; agent which hands off to a &quot;refund&quot; agent. No central controller.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Best for: support flows, role-based escalation.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-pink-50/40 dark:bg-pink-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2">Fan-out + reduce</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Same subagent type, N parallel instances, each working on a slice of the input. A reducer combines results. Think MapReduce with LLMs.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Best for: PR review across N files, summarizing N documents, evaluating N candidates.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Isolation, communication, and the &quot;why not one bigger context&quot; question</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Context isolation</strong> is the main reason multi-agent works. Each subagent gets only what it needs — its own context window, its own tools, its own scratchpad. The orchestrator never sees the subagent&apos;s 10K-token exploration; only its 300-token summary. That keeps cost linear in <em>useful</em> work, not total work.
          </li>
          <li>
            <strong>Communication: shared scratchpad vs explicit messages.</strong> A shared scratchpad is simpler but every agent pays to re-read it; explicit message passing (orchestrator hands a specific brief to a specific subagent) scales better. Prefer explicit messages unless the agents truly need to see each other&apos;s reasoning.
          </li>
          <li>
            <strong>Why not one bigger context window?</strong> Three reasons. (1) Cost — you pay per token per turn, so 10× the context = 10× per-turn cost. (2) Attention degrades on very long contexts; the model gets worse at finding the right information. (3) You can&apos;t parallelize a single agent — fan-out gives you wall-clock speedups a single agent can never match.
          </li>
        </ul>

        <Callout variant="warn">
          <strong>Multi-agent is not free.</strong> Each subagent is a full agent — its own loop, its own caps, its own observability. A 3-subagent orchestrator has 4 agents to monitor. Don&apos;t reach for it unless one agent has genuinely failed to deliver.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/multi-agent" className="text-indigo-600 hover:underline">Module 26 — Multi-agent patterns</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Cost & latency */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Cost &amp; latency — the agent engineer&apos;s budget sheet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every step is a round-trip. Every round-trip costs money and milliseconds. Internalize this.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Lever</th>
                <th className="px-4 py-3 font-semibold">What it does</th>
                <th className="px-4 py-3 font-semibold">When to pull it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Parallelize subagents</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">N independent subagents in parallel → wall-clock latency ≈ slowest, not sum</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fan-out patterns. Doesn&apos;t reduce cost — reduces latency.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Cache tool outputs</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cache by <code>(toolName, args-hash)</code> within an agent run (or across runs for deterministic tools)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Any tool whose output doesn&apos;t change in seconds. Free win.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Cap iterations aggressively</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Lower <code>maxIterations</code> — 80% of useful agent runs finish in &lt; 8 turns</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Always. Start at 10, lower as you measure your task distribution.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Summarize the scratchpad</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">After N turns, replace older turns with a compressed summary</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Long-running agents where context grows past ~20K tokens.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Prompt caching</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cache the static prefix (system prompt + tool schemas) — provider charges ~10% of normal rate on cache hits</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Any agent with a stable system prompt. Huge cost win.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Use a smaller model for subagents</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Orchestrator runs on the big model; subagents on Haiku/cheap tier</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">When subagent tasks are narrow and the small model can handle them reliably.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>The single most expensive habit:</strong> a verbose scratchpad. Every &quot;Let me think about this step by step…&quot; in turn 1 gets re-sent on turns 2, 3, 4, 5… by turn 10 you&apos;ve re-billed it ten times. Keep reasoning concise; keep the scratchpad summarized; cap iterations; cache tools. In that order.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/multi-agent" className="text-indigo-600 hover:underline">Module 26 — Multi-agent patterns</Link> &amp; <Link href="/courses/ai/modules/agent-spring" className="text-indigo-600 hover:underline">Module 25 — Agents in Spring</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Four gotchas that bite teams</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has actually torpedoed a real agent in production. Pin them to your mental fridge.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Unbounded loop with no caps</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              A <code>while (!done)</code> with no iteration, token, or wall-clock cap is a bug. Period. The model can decide to call tools forever. One stuck request can drain a five-figure budget overnight.
            </p>
            <CodeBlock lang="java">{`// BAD — runs until the heat death of the universe (or your billing alert)
while (!resp.isDone()) {
    resp = client.complete(messages, tools);
    messages.addAll(executeTools(resp));
}

// GOOD — every loop has at least three caps, checked BEFORE the next call
int iters = 0, tokens = 0;
long deadline = System.currentTimeMillis() + budgetMs;
while (true) {
    if (iters >= MAX_ITERS) return failed("max_iters");
    if (tokens >= MAX_TOKENS) return failed("token_budget");
    if (System.currentTimeMillis() > deadline) return failed("wallclock");
    ModelResponse resp = client.complete(messages, tools);
    tokens += resp.usage().total();
    iters++;
    if (resp.toolUses().isEmpty()) return done(resp.finalOutput());
    messages.addAll(executeTools(resp));
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Emitting raw exception text as tool_result</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              When a tool throws, never pipe the exception message straight back to the model. Raw stack traces can contain attacker-controlled input from the original args (prompt-injection vector), they leak internals, and they tend to send the model spiraling on irrelevant details. Return a structured error.
            </p>
            <CodeBlock lang="java">{`// BAD — raw exception text re-enters the model context
try {
    return tool.execute(args);
} catch (Exception e) {
    return ToolResult.text(e.getMessage()); // 💀 attacker-controlled, leaks internals
}

// GOOD — structured, scrubbed, model-actionable
try {
    return tool.execute(args);
} catch (RetryableException e) {
    log.warn("tool {} failed: {}", tool.name(), e.toString());
    return ToolResult.error("transient_failure", "Tool temporarily unavailable. You may retry once or proceed without this data.");
} catch (Exception e) {
    log.error("tool {} failed: {}", tool.name(), e.toString());
    return ToolResult.error("hard_failure", "Tool failed permanently. Do not retry this call with these arguments.");
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Shared mutable state across subagents</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              If two subagents run in parallel and write to the same in-memory structure, you have a concurrency bug waiting to happen. The whole point of fan-out is isolation; let each subagent build its own result and have the orchestrator reconcile.
            </p>
            <CodeBlock lang="java">{`// BAD — subagents append to a shared list under no lock
List<Finding> findings = new ArrayList<>();
files.parallelStream().forEach(file -> {
    findings.addAll(subagent.review(file)); // 💥 race
});

// GOOD — each subagent returns its own results; reducer merges
List<Finding> findings = files.parallelStream()
    .map(subagent::review)         // returns a fresh List<Finding>
    .flatMap(List::stream)
    .toList();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Reaching for an agent when a pipeline would do</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The most expensive bug isn&apos;t in the agent — it&apos;s the decision to build an agent at all. If the steps are fixed and known, a pipeline is cheaper, faster, more reliable, and easier to debug. Adding a loop just to feel modern is how you ship a $40K/month feature that could have cost $400.
            </p>
            <CodeBlock lang="java" caption="When the steps are fixed: just call them.">{`// BAD — agent for a fixed pipeline
AgentResult r = agent.run(AgentTask.builder()
    .goal("Look up customer " + id + " then summarize their last 5 invoices")
    .tools(List.of(lookupCustomer, listInvoices, summarize))
    .build());
// 4-7 model turns, $$, latency

// GOOD — call the tools directly; let the model do only the part it's needed for
Customer c = customerService.findById(id);
List<Invoice> invoices = invoiceService.lastN(c.id(), 5);
String summary = llm.summarize(c, invoices); // ONE model call
// 1 model turn, predictable cost, predictable latency`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually have this loaded?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="A teammate proposes building an agent to: parse a webhook, look up the user, format a Slack message, and send it. The steps never vary. What do you push back with?"
          options={[
            { label: "Sounds great — agents are perfect for tool sequences.", explanation: "This is the exact mistake the chapter warns against. Tool use ≠ agent. A fixed sequence of tool calls is a pipeline, not an agent." },
            { label: "Use a deterministic pipeline. The steps are fixed and known, so the loop adds nothing but cost, latency, and a chance of misbehavior.", correct: true, explanation: "Right. An agent is for unknown-at-runtime paths. Known steps → pipeline. You can still call tools from a pipeline; you just don't need the LLM to decide what to do." },
            { label: "Build the agent, then add caps so it can't loop forever.", explanation: "Caps prevent disaster, but they don't justify the loop. If the steps don't vary, the loop is pure overhead." },
            { label: "Use multi-agent — one per step.", explanation: "Multi-agent is even more overhead. Four agents for what should be four function calls in sequence." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="In the ReAct loop, what's the purpose of the Observation step?"
          options={[
            { label: "It's the model's internal reasoning about what to do next.", explanation: "That's the Thought step. Observation is what comes back from the tool, not what the model thinks." },
            { label: "It's the final answer the agent emits to the user.", explanation: "The final answer is when the model emits no tool_use. Observation is a per-turn step, not a terminator." },
            { label: "It's the result of executing a tool, appended to the conversation so the model can decide its next step based on what it just learned.", correct: true, explanation: "Right. Thought → Action (emit tool_use) → Observation (append tool_result) → repeat. The Observation is what makes the loop adaptive — the model's next Thought depends on what it just observed." },
            { label: "It's a logging-only artifact for debugging — the model doesn't see it.", explanation: "The opposite. The observation IS the message the model reads to decide what to do next. Without it, the loop can't be adaptive." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Which of these is NOT a valid reason to stop the agent loop?"
          options={[
            { label: "The model emits a response with no tool_use block.", explanation: "This is the success case — the model has decided it's done. Always a valid stop." },
            { label: "The cumulative token usage exceeds the configured budget.", explanation: "This is exactly what the token cap is for. Always wire it." },
            { label: "A tool returned a result the model didn't like.", correct: true, explanation: "Right — this is NOT a stop condition. A bad result is just another observation for the next turn; the model decides whether to retry, switch approach, or give up. The runtime never decides for the model based on tool result content." },
            { label: "The wall-clock budget is exhausted before the next model call.", explanation: "This is a valid latency-protection stop. Always wire it." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're building a PR review system that needs to review N files in parallel and aggregate findings. Orchestrator+subagents or peer-to-peer?"
          options={[
            { label: "Peer-to-peer — one agent hands off to the next.", explanation: "Peer-to-peer is for sequential role-based handoff (triage → billing → refund). It doesn't parallelize." },
            { label: "Orchestrator + fan-out subagents. The orchestrator splits the PR by file, spawns N reviewer subagents in parallel, then reconciles their findings.", correct: true, explanation: "Right. Same subagent type, parallel instances, one per file, then a reducer merges. Wall-clock latency ≈ the slowest file's review, not the sum. Classic fan-out + reduce." },
            { label: "Single agent — give it all N files in its context window.", explanation: "Possible for small N, but attention degrades on long context, you can't parallelize, and you'll re-process every file on every turn. Doesn't scale." },
            { label: "Orchestrator + peer-to-peer subagents that pass the PR around.", explanation: "Mixing patterns with no benefit. The work is parallel and uniform — fan-out is the pattern." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your agent's cost spiked 20× this week. What's the most likely cause to investigate first?"
          options={[
            { label: "A new model version is more expensive per token.", explanation: "Possible but unusual — model pricing rarely 20×'s overnight. Look at usage patterns first." },
            { label: "A subset of requests is hitting a high iteration count, and each turn re-bills the full (growing) scratchpad. Bad input → loop → scratchpad bloat → cost explosion.", correct: true, explanation: "Right. The leading cause of agent cost overruns is one of two things: a bug that causes the model to loop, or a class of inputs that legitimately needs more turns. Either way, each turn re-sends the entire scratchpad, so cost grows super-linearly with iteration count. Check your iteration histogram first." },
            { label: "Tool execution is now slower.", explanation: "Tool latency affects wall-clock, not cost. The model isn't billed for time spent in your tools." },
            { label: "You added more tools and the schemas take more tokens.", explanation: "Real but small — the tool schemas are a one-time-per-turn cost. Not a 20× driver unless you added hundreds of tools." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-pink-950/30 dark:via-slate-900 dark:to-rose-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2">
          Phase 5 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You&apos;re ready for Phase 6 when…</h3>
        <ul className="mb-4 text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>You can describe the ReAct loop in one sentence (Thought → Action → Observation → repeat) and name your three stopping caps before you start coding.</li>
          <li>You instinctively reach for a pipeline first and only escalate to an agent when the path is genuinely unknown at runtime.</li>
          <li>You can sketch the Spring agent loop on a napkin — registry, controller, state machine, idempotent tools, structured output — without referring back.</li>
          <li>You pick between orchestrator-subagent, peer-to-peer handoff, and fan-out+reduce by naming the shape of the work, not by vibes.</li>
          <li>The phrase &quot;cost explosion&quot; makes you check iteration histograms and prompt-cache hit rates, not shrug.</li>
        </ul>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 6 — Production &amp; Capstone.</strong> Evals come first because everything you&apos;ve built in Phases 1–5 is opinion until you can measure it. LLM-as-judge, golden sets, regression testing — the discipline that turns a demo into a system.
        </p>
        <Link
          href="/courses/ai/modules/evals"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Evals →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="phase-5-revision" />
    </article>
  );
}
