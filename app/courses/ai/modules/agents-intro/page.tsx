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
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "what-is-agent", title: "What an agent actually is" },
  { id: "react-loop", title: "The ReAct loop, by hand" },
  { id: "memory", title: "Memory: short, long, and scratch" },
  { id: "when-not", title: "When NOT to use an agent" },
  { id: "project", title: "Project: research agent" },
  { id: "final", title: "Final quiz" },
];

export default function AgentsIntroModule() {
  const mod = getModuleBySlug("agents-intro")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 5 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Agent fundamentals</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          A loop, a tool list, and a stopping condition. That&apos;s the whole trick.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="agents-intro" />
        <ModuleProgress moduleSlug="agents-intro" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          A demystified definition of &quot;agent&quot;. Most blog posts make agents sound like
          a new technology. They&apos;re not — they&apos;re Module 11 (tool use) wrapped in a
          while loop. Once you see that, the rest is engineering.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>The ReAct loop traced step by step on paper, not abstractly</li>
          <li>The three kinds of memory and which problems each solves</li>
          <li>A taxonomy of when agents are the right answer — and when they&apos;re overkill</li>
          <li>The stopping conditions that keep an agent from running forever (or your bill from running forever)</li>
          <li>A research agent project: question in, multi-step web search, cited summary out</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        Module 11 (tool use) is the big one — agents are tool use in a loop, so you need that
        firmly in muscle memory. Module 9 (Claude API) for request structure. Module 7 (prompt
        engineering) for the system-prompt patterns we&apos;ll lean on. Modules 18–19 if you want
        to put a UI on the agent later.
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: WHAT AN AGENT ACTUALLY IS                                   */}
      {/* ================================================================= */}
      <section id="what-is-agent">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 1 — What an &quot;agent&quot; actually is</h2>

        <p>
          The internet has decided &quot;agent&quot; means everything from a Zapier workflow to
          a humanoid robot. We need a sharper definition or this whole module is mush.
        </p>

        <Callout variant="insight" title="The course's working definition">
          An <strong>agent</strong>{" "}is an LLM in a loop, given a goal and a set of tools, that
          decides on each step whether to call a tool, what to call, or to stop. The loop
          terminates when the model emits a final answer (no tool call) or a stopping condition
          fires.
        </Callout>

        <p>
          That&apos;s it. Strip away the marketing and an agent is three things stacked on top of
          tool use:
        </p>

        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li><strong>A goal</strong> — usually the user&apos;s message, sometimes a longer brief from a system prompt.</li>
          <li><strong>A toolbox</strong> — the same JSON-schema tool definitions you wrote in Module 11.</li>
          <li><strong>A loop</strong> — keep calling the model with the conversation-so-far until it stops asking for tools.</li>
        </ol>

        <h3 className="mt-8 mb-3 text-xl font-bold">Workflow vs agent — the line that matters</h3>

        <p>
          The most useful distinction (borrowed from Anthropic&apos;s &quot;Building Effective
          Agents&quot;): a <strong>workflow</strong>{" "}is when <em>you</em>{" "}decide the steps and the
          LLM fills in pieces. An <strong>agent</strong>{" "}is when <em>the LLM</em>{" "}decides the steps
          and you provide the tools.
        </p>

        <CodeBlock lang="plain">{`WORKFLOW (you wrote the steps):
  user input
    → LLM extract entities
    → SQL query
    → LLM summarize results
    → reply

AGENT (LLM picks the steps):
  user input + toolbox
    → LLM: "I'll search first"        [tool: search]
    → LLM: "Now fetch the top 3"      [tool: fetch_url x3]
    → LLM: "I have enough — answering" [no tool, stop]
    → reply`}</CodeBlock>

        <p>
          Both are valid. Workflows are cheaper, faster, easier to debug, and more predictable.
          Agents handle the long tail of cases your workflow author didn&apos;t think of. Most
          production systems are workflows with one or two agentic steps tucked inside, not
          end-to-end agents.
        </p>

        <Callout variant="warn" title="The vibes-based agent trap">
          A common failure mode: someone hears &quot;agents&quot; and rewrites a perfectly fine
          three-step workflow as a free-form agent loop. It now costs 4x more tokens, takes 5x
          longer, and fails on a long-tail of inputs the workflow handled fine. Agents earn their
          keep when the path branches in ways you can&apos;t enumerate. Otherwise, write the
          workflow.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">The shortest possible agent</h3>

        <p>
          To prove the &quot;loop + tools&quot; framing, here&apos;s the entire kernel of an agent
          in pseudocode. It&apos;s 12 lines. Stare at it.
        </p>

        <CodeBlock lang="plain">{`messages = [{role: "user", content: goal}]

while True:
    response = llm.complete(messages, tools=TOOLS)
    messages.append(response)            // append assistant turn

    if response.tool_calls is empty:
        return response.text              // final answer — done

    for tool_call in response.tool_calls:
        result = execute(tool_call)       // run YOUR code
        messages.append({                 // feed result back
            role: "tool",
            tool_use_id: tool_call.id,
            content: result
        })`}</CodeBlock>

        <p>
          That&apos;s the architecture diagram, the implementation, and the mental model — all in
          one. Every &quot;agent framework&quot; you&apos;ll see (LangChain agents, AutoGPT,
          Spring AI&apos;s agent abstractions) is a more elaborate version of these 12 lines plus
          some bells around memory, retries, and observability.
        </p>

        <Callout variant="spring" title="Spring AI's take">
          Spring AI exposes this loop through <code>ChatClient</code> with tools attached — when
          you register tool callbacks, Spring&apos;s default behavior already loops on tool calls
          for you up to a configurable limit. You can override <code>internalToolExecutionEnabled</code>
          to turn off the auto-loop and run tool calls yourself. We&apos;ll do that in Module 25 so
          you can see and control every iteration.
        </Callout>

        <Checkpoint moduleSlug="agents-intro" id="what-is-agent" title="Agent vs workflow" xp={20}>
          <Quiz
            kind="Quick check"
            question="A teammate says: 'We need an agent for our refund flow — user types a complaint, we look up their order, decide if it qualifies, issue the refund.' What's the right pushback?"
            options={[
              {
                label: "Sounds great — let's wire up an autonomous agent loop with refund authority.",
                explanation: "Giving an LLM autonomous refund authority on a fixed-shape workflow is the worst-of-both: more expensive AND riskier than a deterministic flow.",
              },
              {
                label: "Those steps are enumerable and ordered — that's a workflow, not an agent. Use tool use, but in a fixed pipeline.",
                correct: true,
                explanation: "Exactly. The path is known: lookup → eligibility check → action. No need for the LLM to plan steps. A workflow with one or two LLM calls (extract complaint, classify eligibility) is cheaper, faster, and audit-friendlier.",
              },
              {
                label: "Agents are always better than workflows for customer-facing things.",
                explanation: "Almost the opposite — for customer-facing flows you usually want predictable behavior, which means workflows.",
              },
              {
                label: "Use an agent but only for the lookup step.",
                explanation: "Lookup is one tool call — using a full agent loop for it is overkill. A direct tool call (Module 11) is enough.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 1 recap"
        gist="An agent is an LLM in a loop with tools and a stopping condition — not a new technology, just tool use plus iteration."
        points={[
          { takeaway: "Agent = goal + toolbox + loop. The loop ends when the LLM stops asking for tools.", detail: "The 12-line kernel covers it. Frameworks add memory, retries, and observability on top of that core." },
          { takeaway: "Workflow vs agent: who decides the steps?", detail: "If you can enumerate the steps, write a workflow. If the path branches in ways you can't predict, an agent earns its keep." },
          { takeaway: "Most production systems are workflows with one agentic step inside.", detail: "Pure end-to-end agents are rare in production because debugging, cost control, and reliability all favor structured workflows." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 2: THE REACT LOOP                                              */}
      {/* ================================================================= */}
      <section id="react-loop">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 2 — The ReAct loop, by hand</h2>

        <p>
          ReAct is the canonical pattern: <strong>Reason</strong>{" "}then <strong>Act</strong>, in a
          loop. It&apos;s from a 2022 paper that quietly became the default agent design. The
          name is unfortunate (it has nothing to do with React.js), but the idea is small:
          interleave thinking with acting.
        </p>

        <p>
          The core insight: if you let the model think out loud before each action, it picks
          better actions. And if you feed observations back into the next thinking step, it
          self-corrects. That&apos;s the loop.
        </p>

        <CodeBlock lang="plain">{`Loop:
  Thought:    "Why am I here? What do I need next?"
  Action:     pick a tool, fill in the args
  Observation: tool result comes back
  Thought:    "Given that observation, what now?"
  ...
  Final answer.`}</CodeBlock>

        <p>
          Modern tool-calling APIs (Claude, OpenAI, Gemini) basically wire this in for you. The
          model emits a <code>thinking</code>-style preamble, then a tool call, then waits for the
          observation, then thinks again. You don&apos;t have to parse anything — the SDK gives you
          structured tool-call objects.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">A trace, end to end</h3>

        <p>
          Let&apos;s actually walk one of these. Pretend we&apos;re building a research agent and
          the user asks: <em>&quot;What was the GDP of Japan in 2023, and how did it compare to
          Germany?&quot;</em>{" "}The agent has two tools: <code>web_search(query)</code> and
          <code>fetch_url(url)</code>.
        </p>

        <WorkedExample
          title="A ReAct trace, step by step"
          subtitle="Read each turn before clicking — predict what the agent does next."
          steps={[
            {
              title: "Turn 1 — model reasons about the goal",
              body: (
                <>
                  <p>
                    System prompt: <em>&quot;You are a research assistant. Use the tools to find
                    and verify facts. Cite your sources.&quot;</em>
                  </p>
                  <p>User: &quot;What was the GDP of Japan in 2023, and how did it compare to Germany?&quot;</p>
                  <p>
                    Model output: <em>&quot;I need 2023 GDP figures for both Japan and Germany.
                    I&apos;ll start with Japan.&quot;</em> + tool call:
                    <code>web_search(query=&quot;Japan GDP 2023 official figure&quot;)</code>
                  </p>
                </>
              ),
            },
            {
              title: "Turn 2 — observation, then more reasoning",
              body: (
                <>
                  <p>
                    Tool result (you, the host, ran the search): <em>&quot;Top result: World Bank
                    data — Japan GDP 2023 was $4.21 trillion USD nominal.&quot;</em>
                  </p>
                  <p>
                    Model output: <em>&quot;Got Japan. Now Germany.&quot;</em> + tool call:
                    <code>web_search(query=&quot;Germany GDP 2023 official figure&quot;)</code>
                  </p>
                </>
              ),
            },
            {
              title: "Turn 3 — second observation",
              body: (
                <>
                  <p>
                    Tool result: <em>&quot;Top result: World Bank — Germany GDP 2023 was
                    $4.46 trillion USD nominal.&quot;</em>
                  </p>
                  <p>
                    Model output: <em>&quot;Interesting — Germany overtook Japan in 2023. I
                    should verify this is widely reported, not a glitch.&quot;</em> + tool call:
                    <code>web_search(query=&quot;Germany overtakes Japan GDP 2023&quot;)</code>
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Notice: the model spotted a surprising claim and chose to verify before
                    presenting it. That&apos;s reasoning paying off.
                  </p>
                </>
              ),
            },
            {
              title: "Turn 4 — confirmation, then stop",
              body: (
                <>
                  <p>
                    Tool result: multiple Reuters / FT / Bloomberg headlines confirming Germany
                    surpassed Japan to become the 3rd-largest economy in 2023.
                  </p>
                  <p>
                    Model output (no tool call this time):
                  </p>
                  <p className="border-l-2 border-indigo-400 pl-3 text-sm italic">
                    Japan&apos;s 2023 GDP was about $4.21T USD; Germany&apos;s was $4.46T. Germany
                    overtook Japan to become the world&apos;s third-largest economy that year — a
                    shift driven by yen depreciation and Germany&apos;s nominal growth.
                    [Sources: World Bank, Reuters, FT.]
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    The loop terminates because there are no tool calls in this turn. That&apos;s
                    your stopping signal.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3 className="mt-8 mb-3 text-xl font-bold">What you provide vs what the model provides</h3>

        <p>
          A common confusion: who&apos;s in charge of what? Drawing the line cleanly:
        </p>

        <CodeBlock lang="plain">{`YOU (the host application) provide:
  - System prompt with the goal/persona
  - Tool definitions (name, schema, description)
  - The execution of tools (you run the code)
  - The loop itself (call the model, collect tool calls, run them, repeat)
  - Stopping conditions (max iterations, budget, timeouts)
  - Logging / observability

THE MODEL provides:
  - Decisions: which tool to call, with what arguments
  - Reasoning text between actions
  - The final answer when it has enough info`}</CodeBlock>

        <Callout variant="warn" title="The model never executes anything">
          This catches new agent builders constantly: the model emits a tool call as JSON. It
          doesn&apos;t run anything. <em>You</em>{" "}run the tool, get the result, and append it to
          the conversation. The agent &quot;loop&quot; lives in your code, not the model&apos;s.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">Stopping conditions — the most-skipped part</h3>

        <p>
          The natural stopping condition is &quot;the model returned no tool calls&quot;. But you
          need belt-and-braces, because models can sometimes get into loops:
        </p>

        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Iteration cap</strong> — hard ceiling like 10–25 steps. If hit, the agent must summarize what it has and stop. Not optional.</li>
          <li><strong>Token budget</strong> — total input+output tokens. Convert your cost cap into a token cap and check it each turn.</li>
          <li><strong>Wall-clock timeout</strong> — for user-facing agents, 60s is generous. Streaming partial progress helps, but the timeout still matters.</li>
          <li><strong>Repeated-tool-call detection</strong> — if the model calls <code>web_search</code> with the exact same arguments three times, abort. It&apos;s stuck.</li>
          <li><strong>Stop sequences</strong> — explicit &quot;final answer&quot; markers if you&apos;re using a non-tool-calling model.</li>
        </ul>

        <Callout variant="info" title="A real bill story">
          A common production bug: someone forgets the iteration cap, the agent gets confused
          by a flaky tool, and it retries the same call 1,000 times before timing out at the
          load balancer. The bill is real. Cap your iterations on day one.
        </Callout>

        <Checkpoint moduleSlug="agents-intro" id="react-loop" title="The loop and stop conditions" xp={20}>
          <Quiz
            kind="Quick check"
            question="In the trace above, how does the host code know when to stop calling the model?"
            options={[
              {
                label: "The model emits a special END token.",
                explanation: "There's no special end token in mainstream tool-calling APIs.",
              },
              {
                label: "The host stops when the model's response contains no tool calls.",
                correct: true,
                explanation: "That's the natural stop condition. The assistant turn has plain text and no tool_use blocks — the loop exits and that text is the final answer.",
              },
              {
                label: "The model decides internally when it has enough information and waits for input.",
                explanation: "The model has no concept of 'waiting' — it produces output and that's it. The host inspects the output to decide what to do next.",
              },
              {
                label: "After a fixed N iterations, always.",
                explanation: "N is your safety cap, not the natural stopping signal. Most successful runs end well before N because the model emits a no-tool answer.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Your agent keeps calling search_docs with the exact same query 8 times in a row before timing out. Which fix actually addresses the root cause vs masking it?"
            options={[
              {
                label: "Lower the iteration cap from 25 to 5.",
                explanation: "That just makes the failure cheaper. The agent is still stuck in a loop — it'll just hit the new cap faster. Doesn't fix anything.",
              },
              {
                label: "Detect the duplicate tool call (same name + args) and either short-circuit with a hint or abort. Then look at why the search is failing in the first place.",
                correct: true,
                explanation: "Yes — duplicate-call detection is the standard fix. It tells the agent 'you already tried this' (often via an injected observation), which usually un-sticks it. And the underlying cause is usually a tool returning empty or unhelpful results.",
              },
              {
                label: "Add 'don't loop' to the system prompt.",
                explanation: "Weak. Models don't reliably follow that, especially when stuck. Code-level guardrails win over prompt pleas.",
              },
              {
                label: "Switch to a smarter model.",
                explanation: "More expensive and rarely fixes loops — they're usually a symptom of a tool issue, not raw model intelligence.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 2 recap"
        gist="ReAct = think, act, observe, repeat. The loop lives in your code; the model only emits decisions."
        points={[
          { takeaway: "The host runs the loop, not the model.", detail: "The model emits tool-call JSON; your code executes it and appends the result. The loop terminates when the model's turn has no tool calls." },
          { takeaway: "Reasoning between actions is what makes agents work.", detail: "Modern tool-calling APIs let the model produce thinking-style text before each action. That text isn't decoration — it's how the model self-corrects." },
          { takeaway: "Stopping conditions are non-negotiable.", detail: "Iteration cap, token budget, wall-clock timeout, repeated-call detection. Skip any one of these and you're one bug away from a runaway loop." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 3: MEMORY                                                      */}
      {/* ================================================================= */}
      <section id="memory">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 3 — Memory: short, long, and scratch</h2>

        <p>
          &quot;Agent memory&quot; is another overloaded term. Three different mechanisms get
          shoved under that label, and conflating them is how you end up writing 800 lines of
          memory code when you needed 30. Let&apos;s name them.
        </p>

        <div className="my-6 overflow-x-auto">
          <table className="w-full overflow-hidden rounded-lg border border-slate-300 text-sm dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="border-b border-slate-300 p-3 text-left dark:border-slate-700">Kind</th>
                <th className="border-b border-slate-300 p-3 text-left dark:border-slate-700">Lives in</th>
                <th className="border-b border-slate-300 p-3 text-left dark:border-slate-700">Lifetime</th>
                <th className="border-b border-slate-300 p-3 text-left dark:border-slate-700">Used for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-3 font-semibold">Short-term</td>
                <td className="p-3">The message list itself</td>
                <td className="p-3">Within one agent run</td>
                <td className="p-3">Tool results, intermediate reasoning, the current task</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-3 font-semibold">Long-term</td>
                <td className="p-3">A vector DB or KV store</td>
                <td className="p-3">Across runs / sessions</td>
                <td className="p-3">User preferences, prior facts, learned outcomes</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Scratchpad</td>
                <td className="p-3">A file or session blob</td>
                <td className="p-3">Within a run, but escapes the context window</td>
                <td className="p-3">Long intermediate artifacts (full docs, large search results)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 mb-3 text-xl font-bold">Short-term: just the message list</h3>

        <p>
          The model already has memory — it&apos;s called the conversation history. Every tool
          result and every reasoning turn lives in <code>messages[]</code>, and the next call
          gets the whole thing. As long as you keep appending and not truncating, the agent
          remembers everything from this run.
        </p>

        <p>
          The catch: context windows are finite. Modern Claude has 200k+ tokens, which is
          enormous, but a busy agent can fill it. When that happens, you&apos;re looking at:
        </p>

        <ul className="mb-4 list-disc space-y-1 pl-6">
          <li><strong>Sliding window</strong> — drop the oldest tool results once they&apos;re consumed.</li>
          <li><strong>Summary compaction</strong> — periodically replace N old messages with a one-paragraph summary.</li>
          <li><strong>Scratchpad offload</strong> — when a tool returns a 50k-token doc, write it to disk and pass the model a 100-word abstract + a <code>read_file</code> handle. (More on this in a moment.)</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">Long-term: across sessions</h3>

        <p>
          Want the agent to remember &quot;this user prefers metric units&quot; tomorrow? That&apos;s
          long-term memory, and it&apos;s a different mechanism: persist facts to a store, then
          retrieve and re-inject them at the start of the next run.
        </p>

        <p>
          You already know how to build this — it&apos;s RAG (Modules 14–17) applied to the
          user&apos;s own history instead of a doc corpus. At session start, embed the user&apos;s
          new query, search a per-user vector index of past facts, and stuff the top-k into the
          system prompt:
        </p>

        <CodeBlock lang="plain">{`# At the start of a new agent run:
relevant_memories = vector_search(
    namespace="user:1234",
    query=user_message,
    k=5
)

system_prompt = base_prompt + "\\n\\nRelevant context about this user:\\n" +
    format(relevant_memories)`}</CodeBlock>

        <p>
          The hard part isn&apos;t the retrieval — it&apos;s deciding <em>what</em>{" "}to write to
          long-term memory and <em>when</em>. Two patterns:
        </p>

        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li><strong>Explicit save tool</strong> — give the agent a <code>remember(fact)</code> tool. The agent decides what&apos;s worth saving. Simple, transparent, sometimes too sparse.</li>
          <li><strong>End-of-session distillation</strong> — when the agent run ends, run a separate &quot;reflector&quot; LLM call: <em>&quot;Given this transcript, what facts about the user should we save?&quot;</em>{" "}More thorough, more expensive.</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">Scratchpad: the trick people miss</h3>

        <p>
          The pattern that makes long-running agents <em>cheap</em>: don&apos;t put big tool
          results into the message list. Write them to a file (or a key in Redis), and give the
          model a tool to read them back when needed.
        </p>

        <CodeBlock lang="plain">{`Naive (expensive):
  fetch_url("...long doc...") → 30,000-token result lands in messages[]
  every subsequent model call now pays for those 30k tokens

Scratchpad (cheap):
  fetch_url("...long doc...") → server stores at scratch/doc_42, returns:
    "Saved 30,000 tokens to scratch/doc_42. Summary: <100 words>."
  model can later call read_scratch("doc_42") if it actually needs it`}</CodeBlock>

        <Callout variant="insight" title="Why this is important now">
          Anthropic and others have started exposing this directly as a built-in tool (e.g. a
          memory tool that writes to context-external storage). The principle is the same
          whether the framework offers it or you implement it: <strong>the message list is
          working memory, not durable storage</strong>. Treat it like a CPU register, not a
          disk.
        </Callout>

        <Checkpoint moduleSlug="agents-intro" id="memory" title="Picking the right memory" xp={20}>
          <Quiz
            kind="Quick check"
            question="Your agent's task: 'fetch these 5 long PDFs and answer questions about them'. The naive approach blows past the context window halfway through. What's the right fix?"
            options={[
              {
                label: "Store full PDF text in a vector DB before the run, RAG-retrieve chunks per question.",
                explanation: "Workable, but heavyweight for a single-session task. RAG shines for cross-session knowledge; for one run, the scratchpad is simpler.",
              },
              {
                label: "Have fetch_pdf save the full text to a scratchpad key and return only a short summary + a read_scratch handle. The agent fetches details on demand.",
                correct: true,
                explanation: "Yes — scratchpad pattern. The full text is one tool call away if needed, but doesn't bloat every subsequent model call. This is the cheap fix.",
              },
              {
                label: "Switch to a 1M-token context model and hope.",
                explanation: "Pricing goes up roughly with input tokens. You'd be paying to re-process all 5 PDFs on every single tool turn. The bill is brutal.",
              },
              {
                label: "Truncate old messages aggressively.",
                explanation: "Throwing away tool results means the agent forgets what it saw. It'll re-fetch, ask the same question twice, get confused.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Which of these is actually 'long-term memory' (cross-session) rather than short-term (within one run)?"
            options={[
              {
                label: "The list of tool results from this run kept in the messages array.",
                explanation: "That's short-term — it's literally just the message history of the current run.",
              },
              {
                label: "A scratchpad file holding the text of PDFs the agent fetched this session.",
                explanation: "Scratchpad is still single-run — it goes away (or is ignored) when the run ends.",
              },
              {
                label: "A per-user vector index of preferences and facts learned across previous sessions.",
                correct: true,
                explanation: "Yes — long-term memory persists across runs and is retrieved at the start of the next run. Same architecture as RAG, just applied to user history.",
              },
              {
                label: "The model's pre-training data.",
                explanation: "That's the model's parametric knowledge — not part of the agent system at all and not under your control.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 3 recap"
        gist="Three memory mechanisms with three different jobs — don't mix them up."
        points={[
          { takeaway: "Short-term memory is just the messages array — automatic and free, but bounded by context size.", detail: "When you're filling the window, your options are sliding window, summary compaction, or scratchpad offload." },
          { takeaway: "Long-term memory is RAG against per-user history.", detail: "The retrieval is easy; the hard call is what to save. Either an explicit save tool or end-of-session distillation." },
          { takeaway: "Scratchpad is the killer pattern for cost control.", detail: "Big tool results go to disk, the model gets a summary + handle. The full content is one tool call away when needed but doesn't bloat every turn." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 4: WHEN NOT TO USE AN AGENT                                    */}
      {/* ================================================================= */}
      <section id="when-not">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 4 — When NOT to use an agent</h2>

        <p>
          This is the most undervalued skill in agent engineering: knowing when to <em>not</em>{" "}
          reach for the agent hammer. Skip this lesson and you&apos;ll ship slow, expensive,
          unreliable systems that a 50-line workflow could replace.
        </p>

        <Callout variant="insight" title="The decision matrix">
          Two questions, in order: <strong>(1) Are the steps enumerable?</strong>{" "}If yes, write
          a workflow. <strong>(2) Are the steps the same every time?</strong>{" "}If yes, write
          straight code. Reach for an agent only when the answer to both is no.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">Bad fits — concrete examples</h3>

        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>&quot;Summarize this document&quot;</strong> — one model call. No tools. No loop.
            Don&apos;t put it in an agent.
          </li>
          <li>
            <strong>&quot;Classify this support ticket&quot;</strong> — one structured-output call.
            Workflow.
          </li>
          <li>
            <strong>&quot;Generate a SQL query, run it, format the results&quot;</strong> — three
            ordered steps. Workflow. (Yes, even if you&apos;re tempted by &quot;but the LLM picks
            the SQL!&quot;. The pipeline is fixed.)
          </li>
          <li>
            <strong>Anything with strict latency budgets</strong> — agents add 2–10x latency vs a
            workflow because of the loop. If you have 500ms, agents are off the table.
          </li>
          <li>
            <strong>Anything with strict audit/safety needs by step</strong> — if every action
            needs human approval, an agent loop is fighting you. Use a workflow with explicit
            approval gates.
          </li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">Good fits</h3>

        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Research / exploration</strong> — &quot;find me the answer to this open-ended
            question&quot;. The path of search → read → search-again → synthesize isn&apos;t
            knowable in advance.
          </li>
          <li>
            <strong>Code repair / migration</strong> — read file, attempt fix, run tests, observe
            failure, try again. The loop and the variable depth are real.
          </li>
          <li>
            <strong>Open-ended customer support resolution</strong> — &quot;help this user with
            <em> whatever</em>{" "}they&apos;re trying to do&quot;. If you&apos;ve enumerated 30 paths
            and there&apos;s a long tail, the long tail is where the agent earns its keep.
          </li>
          <li>
            <strong>Data exploration / SQL analytics with branching</strong> — when the next
            question depends entirely on what the previous query returned.
          </li>
        </ul>

        <CodeBlock lang="plain">{`Decision tree:

  Does the task have a fixed sequence of steps?
    YES → straight code or a single LLM call. Stop.
    NO  ↓

  Can you enumerate the branches?
    YES → write a state machine / workflow. Stop.
    NO  ↓

  Does cost / latency / auditability allow open-ended looping?
    NO  → reduce scope or pre-plan; don't agentify yet. Stop.
    YES ↓

  Build an agent. Cap iterations. Log everything.`}</CodeBlock>

        <Callout variant="warn" title="The 'we built an agent' resume-driven trap">
          Be honest with yourself: are you reaching for an agent because the problem demands it,
          or because &quot;agent&quot; is the spicy keyword right now? In every team that has
          shipped real LLM features, the proportion of agents to workflows is roughly 20:80,
          not 80:20. Don&apos;t feel bad shipping a workflow.
        </Callout>

        <Checkpoint moduleSlug="agents-intro" id="when-not" title="Pick the right tool" xp={20}>
          <Quiz
            kind="Quick check"
            question="A PM hands you this brief: 'Users paste a CSV; we detect the schema, suggest a chart type, render the chart, and let them edit the title.' Agent or workflow?"
            options={[
              {
                label: "Agent — the LLM should decide step by step what to do.",
                explanation: "The steps are enumerated right there in the brief: detect → suggest → render → edit. There's no branching that benefits from agentic planning.",
              },
              {
                label: "Workflow — the steps are fixed and ordered. Use LLM calls for the parts that need judgment (schema detection, chart suggestion).",
                correct: true,
                explanation: "Right. Fixed pipeline + LLM at two structured steps. Cheaper, faster, more predictable, easier to monitor. Agent would be overkill.",
              },
              {
                label: "Multi-agent system with separate detector, suggester, and renderer agents.",
                explanation: "Now you've turned a four-step workflow into three coordinating agents. You'll spend more time debugging coordination than building features.",
              },
              {
                label: "Pure code, no LLM at all.",
                explanation: "Schema inference and chart suggestion are exactly where LLMs help. But that's two structured calls, not an agent loop.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You're building a 'fix my failing test' tool. The user says 'this test fails, make it pass'. Agent or workflow?"
            options={[
              {
                label: "Workflow — fixed sequence: read test, propose patch, apply, done.",
                explanation: "That's optimistic. The first patch usually doesn't work; the tool needs to read the failure, try again, maybe modify a different file. Variable depth = agent territory.",
              },
              {
                label: "Agent — read test, edit code, run test, observe failure, edit again, until passing or out of attempts.",
                correct: true,
                explanation: "Right. The path branches based on each test run's output. You can't enumerate it ahead of time. This is the canonical good-fit for an agent loop, with iteration cap as your guardrail.",
              },
              {
                label: "Pure code, no LLM.",
                explanation: "Code repair generally needs the model — too many edge cases for hand-coded rules.",
              },
              {
                label: "Two-step workflow: classify the test failure, then have a specialized prompt per failure type.",
                explanation: "Workable for a closed domain, but most failures don't fit clean categories. The iterative agent handles the long tail better.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 4 recap"
        gist="Agents are powerful, expensive, and unpredictable — pick them only when the path branches in ways you can't enumerate."
        points={[
          { takeaway: "If you can list the steps, write a workflow.", detail: "Workflows are 5-10x cheaper to build, debug, and run than agents. Most LLM features are workflows in disguise." },
          { takeaway: "Agents earn their keep when the path depends on intermediate results.", detail: "Research, code repair, open-ended troubleshooting — anywhere the next action genuinely depends on what just happened." },
          { takeaway: "Resume-driven engineering is real. Don't agentify for the keyword.", detail: "Most production LLM systems are 80% workflows, 20% agentic steps tucked inside. That's a feature, not a failing." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 5: THE PROJECT                                                 */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 5 — Project: research agent</h2>

        <p>
          Time to build one. We&apos;ll keep it small but real: a CLI research agent that takes
          a question, has two tools (<code>web_search</code> and <code>fetch_url</code>), and
          produces a cited answer.
        </p>

        <p>
          We&apos;re building the <em>core loop</em>{" "}by hand here, not using Spring AI&apos;s
          built-in agent abstractions. That comes in Module 25. The point of this project is to
          have the loop fully in front of you, with no magic.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">Spec</h3>

        <ul className="mb-4 list-disc space-y-1 pl-6">
          <li>CLI: <code>java ResearchAgent &quot;your question&quot;</code></li>
          <li>Two tools: <code>web_search(query)</code> and <code>fetch_url(url)</code></li>
          <li>Iteration cap: 10 turns</li>
          <li>Token budget: configurable, defaults to 50k input total</li>
          <li>Logs each turn (thought, action, observation) so you can read the trace afterwards</li>
          <li>Final answer must include source URLs</li>
        </ul>

        <Callout variant="info" title="Search backend choices">
          You can wire <code>web_search</code> to whatever you have access to: Tavily, Brave
          Search API, SerpAPI, or even a local Wikipedia dump. Don&apos;t over-engineer this part —
          the agent loop is the lesson, not the search backend. Pick the one with a free tier and
          move on.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">Tool definitions</h3>

        <CodeBlock lang="java">{`public record Tool(String name, String description, Map<String, Object> inputSchema) {}

public static final List<Tool> TOOLS = List.of(
    new Tool(
        "web_search",
        "Search the web. Returns a list of {title, url, snippet} for the top 5 results.",
        Map.of(
            "type", "object",
            "properties", Map.of(
                "query", Map.of("type", "string", "description", "Search query")
            ),
            "required", List.of("query")
        )
    ),
    new Tool(
        "fetch_url",
        "Fetch a URL and return its main text content. Use after web_search to read a specific result.",
        Map.of(
            "type", "object",
            "properties", Map.of(
                "url", Map.of("type", "string", "description", "URL to fetch")
            ),
            "required", List.of("url")
        )
    )
);`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">The loop</h3>

        <CodeBlock lang="java">{`public class ResearchAgent {
    private static final int MAX_ITERATIONS = 10;
    private static final int MAX_INPUT_TOKENS = 50_000;

    private final Anthropic client;
    private final ToolExecutor tools;

    public String run(String question) {
        List<Message> messages = new ArrayList<>();
        messages.add(Message.user(question));

        int iter = 0;
        int totalInputTokens = 0;

        while (iter++ < MAX_ITERATIONS) {
            log("─── Turn " + iter + " ───");

            MessageResponse resp = client.messages().create(MessageCreateParams.builder()
                .model("claude-sonnet-4-5")
                .maxTokens(2048)
                .system(SYSTEM_PROMPT)
                .messages(messages)
                .tools(TOOLS)
                .build());

            totalInputTokens += resp.usage().inputTokens();
            if (totalInputTokens > MAX_INPUT_TOKENS) {
                throw new RuntimeException("Token budget exceeded at turn " + iter);
            }

            // Append the assistant turn to history
            messages.add(Message.assistant(resp.content()));

            // Look for tool calls in the content blocks
            List<ToolUseBlock> toolCalls = resp.content().stream()
                .filter(b -> b instanceof ToolUseBlock)
                .map(b -> (ToolUseBlock) b)
                .toList();

            if (toolCalls.isEmpty()) {
                // No tools requested → final answer
                String finalText = resp.content().stream()
                    .filter(b -> b instanceof TextBlock)
                    .map(b -> ((TextBlock) b).text())
                    .collect(Collectors.joining("\\n"));
                log("Final answer reached.");
                return finalText;
            }

            // Execute every tool call and append results
            List<ToolResultBlock> results = new ArrayList<>();
            for (ToolUseBlock call : toolCalls) {
                log("→ tool: " + call.name() + " " + call.input());
                String result = tools.execute(call.name(), call.input());
                log("← " + truncate(result, 200));
                results.add(ToolResultBlock.of(call.id(), result));
            }
            messages.add(Message.user(results));
        }

        throw new RuntimeException("Hit iteration cap (" + MAX_ITERATIONS + ") without final answer.");
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why we log every turn">
          Agent debugging is observability-driven. When something goes wrong (and it will), the
          trace is the first thing you read. Build the logging in from day one — even if it&apos;s
          just printing to stdout — because retrofitting it after a bad demo is misery.
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">The system prompt</h3>

        <p>
          The system prompt is doing real work here: setting the role, naming the tools, and —
          critically — telling the agent <em>when to stop</em>.
        </p>

        <CodeBlock lang="plain">{`You are a research assistant. Your job is to answer the user's question
using the available tools.

Available tools:
  - web_search(query): get the top 5 results for a query
  - fetch_url(url):    fetch the main text of a specific URL

Process:
  1. Plan: think about what facts you need.
  2. Search: use web_search to find candidate sources.
  3. Read: use fetch_url on the most promising results.
  4. Verify: if a claim is surprising or contested, search again to confirm.
  5. Answer: when you have enough, provide a final answer that:
       - directly answers the question
       - cites specific URLs as sources
       - flags anything you couldn't verify

Stop conditions (stop using tools and answer):
  - You have enough information.
  - You've done 3 searches and aren't finding new info.
  - The question can't be reliably answered from web sources.

Never make up sources. If you couldn't find something, say so.`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">Test cases to actually run</h3>

        <p>
          Don&apos;t ship until you&apos;ve seen all of these in the trace log:
        </p>

        <ol className="mb-4 list-decimal space-y-2 pl-6">
          <li>
            <strong>Single-hop fact:</strong> &quot;What year was the OpenSSL Heartbleed bug
            disclosed?&quot; — should resolve in 1–2 tool calls.
          </li>
          <li>
            <strong>Multi-hop:</strong> &quot;Compare the populations of the three Baltic states
            as of 2024&quot; — should chain searches, possibly fetch a Wikipedia page or two.
          </li>
          <li>
            <strong>Verification path:</strong> &quot;Is it true that octopuses have nine
            brains?&quot; — should search, find the claim, and verify with a second source.
          </li>
          <li>
            <strong>Unanswerable / graceful exit:</strong> &quot;What did Sam Altman have for
            breakfast on March 4th, 2024?&quot; — agent should give up gracefully, not loop until
            the cap.
          </li>
          <li>
            <strong>Cap-hit case:</strong>{" "}Drop <code>MAX_ITERATIONS</code> to 2 and ask a
            multi-hop question. Confirm your error path is clean.
          </li>
        </ol>

        <Callout variant="warn" title="Pre-flight: a kill switch">
          Before you run this for the first time on a question, double-check three things: an
          iteration cap is set, a token budget is set, and you have a way to interrupt the
          process (Ctrl-C handler that logs partial state). Agents go off on adventures.
          You&apos;ll thank yourself.
        </Callout>

        <Checkpoint
          moduleSlug="agents-intro"
          id="project"
          title="Build the research agent"
          xp={50}
          manual
          manualLabel="I built and tested the research agent"
          celebration="Your first real agent is alive. The loop made sense."
        >
          <p>
            Build the research agent end-to-end. Wire it to a real (or stubbed) search backend.
            Run all five test cases from the list above, and read every trace log line — you
            should be able to defend why the agent did each thing it did.
          </p>
          <p className="mt-3">
            <strong>Stretch goal:</strong>{" "}add the duplicate-tool-call detector from Part 2. If
            the agent calls <code>web_search</code> with the same query twice in a row, inject a
            tool result like <em>&quot;You already searched this and got the same results.
            Consider trying a different angle or stopping.&quot;</em>{" "}Watch how the trace
            changes.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL                                                       */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 6 — Putting it together</h2>

        <p>
          You now have a working mental model that&apos;ll carry you through the rest of Phase 5:
        </p>

        <ul className="mb-4 list-disc space-y-1 pl-6">
          <li>An agent is an LLM in a loop with tools and stop conditions.</li>
          <li>The loop lives in your code; the model only emits decisions.</li>
          <li>ReAct = think, act, observe, repeat.</li>
          <li>Three memories: short-term (messages), long-term (vector store), scratchpad (offload big stuff).</li>
          <li>Most problems aren&apos;t agent problems. Workflow first, agent only when justified.</li>
        </ul>

        <p>
          <strong>Module 25</strong>{" "}takes everything you built by hand here and rebuilds it
          using Spring AI&apos;s native abstractions — including how to keep control of the
          iteration count, observability, and stopping logic when the framework is doing some
          of it for you.
        </p>

        <p>
          <strong>Module 26</strong>{" "}goes one level up: when one agent isn&apos;t enough,
          and how to coordinate multiple agents without it becoming a distributed-systems
          nightmare.
        </p>

        <Checkpoint moduleSlug="agents-intro" id="final" title="Final quiz" xp={30}>
          <Quiz
            kind="Quick check"
            question="The agent's run completes — the model returned a turn with text and no tool calls. What's in messages[] at this point?"
            options={[
              {
                label: "Just the user's question and the final answer.",
                explanation: "Tool calls and tool results were appended throughout the loop and they're still in the array. They drove the reasoning.",
              },
              {
                label: "The user's question, every assistant turn (with tool calls), every tool result, and the final assistant turn.",
                correct: true,
                explanation: "Right — the full trace lives in messages[]. That's both the agent's working memory and your audit log for free.",
              },
              {
                label: "Only the final answer; old turns are discarded after each iteration.",
                explanation: "If you discarded old turns the model would lose context between iterations and the loop wouldn't work.",
              },
              {
                label: "The system prompt and the final answer.",
                explanation: "System prompt is passed separately to the API; messages[] is the user/assistant/tool-result history of the run.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You see this in your agent's trace log. What's it telling you?"
            hint="Look at the tool argument across the three calls."
            options={[
              {
                label: "→ web_search query='Tesla Q3 2024 deliveries'\n← top 5 results returned\n→ web_search query='Tesla Q3 2024 deliveries'\n← top 5 results returned\n→ web_search query='Tesla Q3 2024 deliveries' — Healthy progress, the agent is being thorough.",
                explanation: "Three identical calls in a row is not thoroughness — it's a stuck loop.",
              },
              {
                label: "The agent is in a stuck loop. Same call, same args, no progress. Trip a duplicate-call guard and inject a hint or abort.",
                correct: true,
                explanation: "Yes — duplicate-tool-call detection exists for exactly this. The first observation didn't help the model and it has nothing else to try. Inject a 'you already tried this' result, or abort.",
              },
              {
                label: "This is normal — the agent is verifying.",
                explanation: "Verification means a different query angle, not the exact same query.",
              },
              {
                label: "You should increase the iteration cap so it has more chances.",
                explanation: "More iterations of the same broken behavior just costs more. Fix the loop, don't extend it.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Which scenario is the strongest case for full agentic behavior (vs a workflow)?"
            options={[
              {
                label: "User uploads a CSV; we detect schema and suggest a chart.",
                explanation: "Two ordered steps with two LLM calls. Workflow.",
              },
              {
                label: "Convert a meeting transcript into structured action items.",
                explanation: "Single structured-output call. No loop.",
              },
              {
                label: "Help me debug a failing test in this repo — read code, propose fix, run test, iterate until passing.",
                correct: true,
                explanation: "Yes — variable depth, the next action depends entirely on the previous test result, and the path is unbounded. Canonical agent territory.",
              },
              {
                label: "Translate this English email to French.",
                explanation: "One model call. No tools. No loop.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="True or false: if you build a 'memory' tool that lets the agent save facts, you've automatically given it long-term memory across sessions."
            options={[
              {
                label: "True.",
                explanation: "Saving the fact is half the battle. If you don't also retrieve it at the start of the next session and inject it into the prompt, the new run starts blind.",
              },
              {
                label: "False — you also need a retrieval step at the start of new sessions to inject the saved facts back into context.",
                correct: true,
                explanation: "Right. Long-term memory is two halves: write at session end, read at session start. Skip the read and you've got a journal nobody opens.",
              },
              {
                label: "True, as long as the storage is durable.",
                explanation: "Durability is necessary but not sufficient — you still have to retrieve and inject.",
              },
              {
                label: "False — memory tools are useless.",
                explanation: "They're useful, just not magical. The retrieval-and-inject step is what makes them work.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Which of these is genuinely the agent's job — vs the host application's?"
            options={[
              {
                label: "Executing the database query when a sql_query tool is called.",
                explanation: "That's host code. The model emits the tool call as JSON; you run the query.",
              },
              {
                label: "Deciding which tool to call next given the conversation so far.",
                correct: true,
                explanation: "Yes — picking the next action is exactly what we delegate to the model. The host runs whatever the model picks.",
              },
              {
                label: "Enforcing the iteration cap.",
                explanation: "Host code. The model has no concept of 'how many turns have I taken'.",
              },
              {
                label: "Storing tool results to scratchpad.",
                explanation: "Host code. The model just sees 'saved 30k tokens, here's the summary' as a tool result.",
              },
            ]}
          />
        </Checkpoint>

        <div className="mt-12 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-800 dark:bg-indigo-950/30">
          <p className="mb-2 font-semibold">Coming up next:</p>
          <p className="text-sm">
            <strong>Module 25 — Agents in Spring Boot</strong>: rebuild the research agent
            using Spring AI&apos;s native tool execution and chat memory, and learn when to
            opt out of the framework&apos;s built-in loop to keep control. We&apos;ll add
            stopping conditions, observability, and a code-migration agent that actually
            edits files.
          </p>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="agents-intro" />
    </article>
  );
}
