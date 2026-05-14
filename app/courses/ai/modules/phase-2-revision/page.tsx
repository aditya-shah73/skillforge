import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/ai";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The point is to re-read
// this in 15-20 minutes before a system design conversation about an LLM
// integration, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase2RevisionModule() {
  const mod = getModuleBySlug("phase-2-revision")!;

  // The tool-use loop. Model emits a tool_use block; you execute the tool and
  // hand the result back as a tool_result content block; model continues. Loop
  // until stop_reason is end_turn (no more tool_use blocks).
  const toolUseLoop = `
sequenceDiagram
    participant App as Spring app
    participant API as Anthropic API
    participant Tool as Your tool (DB / HTTP / fn)
    App->>API: messages + tools[] (POST /v1/messages)
    API-->>App: assistant turn with tool_use block<br/>(id=toolu_01, name=lookup, input={...})
    Note over App: stop_reason = tool_use
    App->>Tool: execute lookup(input)
    Tool-->>App: result JSON
    App->>API: append assistant turn +<br/>user turn with tool_result<br/>(tool_use_id=toolu_01)
    API-->>App: assistant turn with text<br/>stop_reason = end_turn
    App->>App: done — return to caller
  `.trim();

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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 2 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 2 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Claude API, Spring AI, tool use, streaming, prompt caching — the backend AI toolkit on one card.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="phase-2-revision" />
        <ModuleProgress moduleSlug="phase-2-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 2</strong> — every wire format, every Spring AI shape, every gotcha from the five backend-integration modules, compressed into tables and cards. If something here is unfamiliar, jump back to the source module. Treat this as the page you re-read before walking into a design review for an LLM-backed feature.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The five modules you&apos;re consolidating: <Link href="/courses/ai/modules/api-fundamentals" className="text-amber-600 hover:underline">Claude API fundamentals</Link>, <Link href="/courses/ai/modules/spring-ai" className="text-amber-600 hover:underline">Spring AI deep dive</Link>, <Link href="/courses/ai/modules/tool-use" className="text-amber-600 hover:underline">Tool use &amp; function calling</Link>, <Link href="/courses/ai/modules/streaming" className="text-amber-600 hover:underline">Streaming with SSE</Link>, and <Link href="/courses/ai/modules/prompt-caching" className="text-amber-600 hover:underline">Prompt caching</Link>.
        </p>

        <Callout variant="info" title="What this card covers">
          <p className="m-0">
            The messages API shape, the model picker, the Spring AI ChatClient pattern, the tool-use loop, SSE streaming end to end, what to cache (and what not to), the BAD/GOOD gotchas that bite people on day one of production, and five recall checks. No new concepts, no code to write — just the lookups you want at your fingertips.
          </p>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Claude API fundamentals */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Claude API on one page</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          One HTTPS POST to <code>/v1/messages</code>. Three required things in the body. Stateless across calls.
        </p>

        <h3 className="text-base font-semibold mb-2">The request shape</h3>
        <CodeBlock lang="plain" caption="POST https://api.anthropic.com/v1/messages">{`{
  "model":      "claude-sonnet-4-5",                  // required — which Claude
  "max_tokens": 1024,                                 // required — hard ceiling on the reply
  "system":     "You are a senior Java reviewer.",    // optional — persistent mode
  "messages": [                                       // required — turn list
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." },        // your job to append prior replies
    { "role": "user",      "content": "..." }
  ],
  "temperature": 0.7,                                 // optional — randomness
  "top_p":       1.0,                                 // optional — nucleus sampling
  "stream":      false                                // optional — SSE on/off
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">The response shape</h3>
        <CodeBlock lang="plain" caption="200 OK · application/json">{`{
  "id":      "msg_01ABC...",
  "type":    "message",
  "role":    "assistant",
  "content": [ { "type": "text", "text": "..." } ],   // may contain text + tool_use blocks
  "stop_reason": "end_turn",                          // or "tool_use", "max_tokens", "stop_sequence"
  "usage": {
    "input_tokens":             138,                  // your bill, input side
    "output_tokens":            42,                   // your bill, output side (~4-5x pricier)
    "cache_creation_input_tokens": 0,                 // tokens written to cache (premium)
    "cache_read_input_tokens":     0                  // tokens served from cache (~10% of normal)
  }
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">system vs user vs assistant — which goes where</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Field</th>
                <th className="px-4 py-3 font-semibold">Where it lives in the JSON</th>
                <th className="px-4 py-3 font-semibold">What it&apos;s for</th>
                <th className="px-4 py-3 font-semibold">Cacheable?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">system</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Top-level field</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Persistent &quot;mode&quot;: persona, output format, rules. Long and stable.</td>
                <td className="px-4 py-3 text-emerald-600">Yes — prime candidate</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">messages[].role=user</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Inside messages array</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A user turn. Varies every request.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Usually no (varies)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">messages[].role=assistant</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Inside messages array</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Prior model output you&apos;re replaying for multi-turn context.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sometimes (early turns)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">tools[]</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Top-level field</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Tool definitions (name, description, input_schema). Long and stable.</td>
                <td className="px-4 py-3 text-emerald-600">Yes — almost always</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-2">temperature, top_p, max_tokens — when to touch what</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Knob</th>
                <th className="px-4 py-3 font-semibold">Range</th>
                <th className="px-4 py-3 font-semibold">Lower</th>
                <th className="px-4 py-3 font-semibold">Higher</th>
                <th className="px-4 py-3 font-semibold">Reach for it when…</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">temperature</td>
                <td className="px-4 py-3 font-mono text-xs">0.0 – 1.0</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Deterministic, repetitive</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Creative, varied</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Classification / extraction → 0.0–0.2. Chat → 0.6–0.8. Brainstorming → 0.9+.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">top_p</td>
                <td className="px-4 py-3 font-mono text-xs">0.0 – 1.0</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Restricts to high-prob tokens</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Allows long tail</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Rarely. Pick temperature OR top_p — not both. Anthropic recommends temperature.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">max_tokens</td>
                <td className="px-4 py-3 font-mono text-xs">1 – model max</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Hard truncate</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">More headroom (still billed only for actual output)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Always required. Pad ~20% over expected output to avoid mid-sentence truncation.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-2">Picking a model</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Capability</th>
                <th className="px-4 py-3 font-semibold">Relative cost</th>
                <th className="px-4 py-3 font-semibold">Latency</th>
                <th className="px-4 py-3 font-semibold">Default pick for…</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">claude-opus-4-5</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Frontier — best at reasoning, code, long-context synthesis</td>
                <td className="px-4 py-3 text-rose-600">$$$ (highest)</td>
                <td className="px-4 py-3 text-amber-600">Slowest</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Hard reasoning, agentic workflows, eval gold-set generation</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">claude-sonnet-4-5</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Strong all-rounder — close to Opus on most tasks</td>
                <td className="px-4 py-3 text-amber-600">$$ (mid)</td>
                <td className="px-4 py-3 text-emerald-600">Fast</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default production pick. Chat, RAG, tool use, most agent loops.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">claude-haiku-4-5</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fast and cheap — capable enough for routine tasks</td>
                <td className="px-4 py-3 text-emerald-600">$ (cheapest)</td>
                <td className="px-4 py-3 text-emerald-600">Fastest</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">High-volume classification, routing, summarization, autocomplete</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight" title="The model-pick heuristic">
          Start on Sonnet. Move down to Haiku only after you&apos;ve measured Sonnet&apos;s quality on your task and Haiku still passes your eval. Move up to Opus only when Sonnet measurably fails on your hardest reasoning cases. Never pick by &quot;feel&quot; — pick by eval.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/api-fundamentals" className="text-amber-600 hover:underline">Module 9 — Claude API fundamentals</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Spring AI */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Spring AI — the ChatClient pattern</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          You inject <code>ChatClient.Builder</code> (the singleton), call <code>.build()</code> per service with the defaults that service wants, and use the fluent prompt API everywhere.
        </p>

        <h3 className="text-base font-semibold mb-2">Defaults vs per-call</h3>
        <CodeBlock lang="java" caption="One builder, many configured clients">{`@Service
class TerseSummarizer {
    private final ChatClient chatClient;

    public TerseSummarizer(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You produce one-sentence summaries. No fluff.")
            .defaultOptions(ChatOptions.builder().temperature(0.2).build())
            .defaultAdvisors(new SimpleLoggerAdvisor())   // applies to every call
            .build();
    }

    public String summarize(String doc) {
        return chatClient.prompt()
            .user(doc)
            .options(ChatOptions.builder()                 // per-call override
                .temperature(0.0)                          // even tighter for this call
                .build())
            .call()
            .content();                                    // unwrap to String
    }
}`}</CodeBlock>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-4">
          Rule: <code>.defaultXxx()</code> on the builder applies to every call from that client. Anything inside <code>.prompt()...</code> overrides for one call. More specific wins.
        </p>

        <h3 className="text-base font-semibold mt-6 mb-2">The pieces, mapped</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Spring AI piece</th>
                <th className="px-4 py-3 font-semibold">What it maps to</th>
                <th className="px-4 py-3 font-semibold">When to reach for it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">ChatClient.Builder</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Spring-autoconfigured singleton bean</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Always — inject this, not <code>ChatClient</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.prompt()</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Starts a mutable request</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every call</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.system(...) / .user(...)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">system field / user message</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Standard shaping</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.options(ChatOptions...)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">temperature / max_tokens / model overrides</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Per-call tuning</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.tools(obj)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Registers @Tool-annotated methods</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Function calling — Spring drives the loop</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.advisors(...)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Middleware chain — log, retry, rewrite, memory</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cross-cutting concerns. Order matters.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.call() vs .stream()</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sync ChatResponse vs Flux&lt;String&gt;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">.stream() for chat UIs; .call() for batch / tool loops</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">.entity(Class)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Structured output — auto-parse to a Java record</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Classification, extraction, anywhere you want typed output</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-2">Advisors — the middleware chain</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          An <code>Advisor</code> wraps a call. The chain runs in declared order on the way in, reverse order on the way out — same pattern as a Spring filter chain or a Java interceptor stack.
        </p>
        <CodeBlock lang="java" caption="Composing advisors">{`chatClient.prompt()
    .advisors(
        new SimpleLoggerAdvisor(),                      // log request + response
        MessageChatMemoryAdvisor.builder(chatMemory).build(),  // injects prior turns
        new SafeGuardAdvisor(List.of("password", "ssn")) // block disallowed words
    )
    .user(input)
    .call()
    .content();`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Observability — what Spring AI gives you free</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
          <li>
            <strong>Micrometer metrics</strong> on every call: <code>spring.ai.chat.client</code> timer with tags for model and gen_ai operation. Tokens are recorded as <code>gen_ai.token.usage</code> counters.
          </li>
          <li>
            <strong>OpenTelemetry traces</strong> with one span per ChatClient call, child spans for advisors and tool invocations.
          </li>
          <li>
            <strong>Structured logs</strong> via <code>SimpleLoggerAdvisor</code> — drop it in <code>defaultAdvisors</code> during local dev, never ship it to prod (PII leak).
          </li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/spring-ai" className="text-amber-600 hover:underline">Module 10 — Spring AI deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Mermaid: tool-use loop */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The tool-use loop in one picture</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The model never executes your tool. It emits a <code>tool_use</code> block; you execute and reply with a <code>tool_result</code>; the model continues. That&apos;s the whole protocol.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={toolUseLoop} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Spring AI drives the loop for you.</strong> When you call <code>.tools(myService)</code> and the model returns <code>tool_use</code>, Spring AI finds the matching <code>@Tool</code> method, invokes it, packages the return value as <code>tool_result</code>, and re-calls the API — all before your <code>chatClient.call()</code> returns.
          </li>
          <li>
            <strong>Loop termination:</strong> <code>stop_reason: end_turn</code> means &quot;no more tool calls, done.&quot; <code>stop_reason: tool_use</code> means &quot;execute and call me back.&quot; <code>stop_reason: max_tokens</code> means &quot;I ran out of room mid-thought&quot; — bump max_tokens or shorten the work.
          </li>
          <li>
            <strong>Parallel tool calls</strong> are a single assistant turn containing multiple <code>tool_use</code> blocks. You execute all of them, then send back a single user turn with multiple <code>tool_result</code> blocks (one per <code>tool_use_id</code>).
          </li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/tool-use" className="text-amber-600 hover:underline">Module 11 — Tool use &amp; function calling</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Tool use decision card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Tool use — when, what, how</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          A tool is a Java method the model can ask you to invoke. You hand it back the return value, the model decides what to do next.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Use a tool when…</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>The data is small, structured, and on-demand (look up one user by email).</li>
              <li>The model decides <em>whether</em> to fetch — not every turn needs it.</li>
              <li>You need a side effect (send email, create ticket, write a row).</li>
              <li>Multiple lookups are required, dynamically composed.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Use retrieval (RAG) when…</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>The data is big and unstructured (docs, code, knowledge base).</li>
              <li>Every turn needs context — there&apos;s nothing to decide.</li>
              <li>Semantic similarity is the right primitive, not keyed lookup.</li>
              <li>Phase 3 territory — embeddings + vector search.</li>
            </ul>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Tool schema — the three things the model needs</h3>
        <CodeBlock lang="plain" caption="A tool definition the API actually sees">{`{
  "name":        "lookup_user_by_email",
  "description": "Find a user record by their email address. Returns user_id, name, and signup date. Returns null if not found.",
  "input_schema": {
    "type": "object",
    "properties": {
      "email": { "type": "string", "description": "Full email, lowercased" }
    },
    "required": ["email"]
  }
}`}</CodeBlock>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-3">
          The <strong>description is the prompt</strong>. The model picks tools by reading their descriptions, not by reading your code. Be specific about inputs, outputs, side effects, and when <em>not</em> to use the tool.
        </p>

        <h3 className="text-base font-semibold mt-4 mb-2">Spring AI equivalent — @Tool annotation</h3>
        <CodeBlock lang="java" caption="The Spring way — Spring extracts schema from the method signature">{`@Service
class UserLookupTools {
    @Tool(description = "Find a user record by their email address. " +
                        "Returns user_id, name, and signup date. " +
                        "Returns null if not found.")
    public UserRecord lookupUserByEmail(
        @ToolParam(description = "Full email, lowercased") String email
    ) {
        return userRepo.findByEmail(email).orElse(null);
    }
}

// In your service:
chatClient.prompt()
    .user(question)
    .tools(userLookupTools)     // Spring registers the @Tool methods
    .call()
    .content();`}</CodeBlock>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/tool-use" className="text-amber-600 hover:underline">Module 11 — Tool use &amp; function calling</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Streaming */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Streaming with SSE — server to client</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Spring Boot returns a <code>Flux&lt;String&gt;</code>, Spring serializes each emission as one SSE event, the browser&apos;s <code>EventSource</code> (or <code>fetch</code> streaming) consumes them.
        </p>

        <h3 className="text-base font-semibold mb-2">The pipeline in one diagram (prose form)</h3>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-900/40 mb-4">
          <div className="font-mono text-xs text-slate-700 dark:text-slate-300 leading-6">
            Anthropic <span className="text-amber-600">→</span> chunks <span className="text-amber-600">→</span> Spring AI <code>Flux&lt;String&gt;</code> <span className="text-amber-600">→</span> <code>@GetMapping(produces=TEXT_EVENT_STREAM_VALUE)</code> <span className="text-amber-600">→</span> SSE wire (<code>data: chunk\n\n</code>) <span className="text-amber-600">→</span> React <code>EventSource</code> / <code>fetch</code> reader <span className="text-amber-600">→</span> append to UI state on each event
          </div>
        </div>

        <h3 className="text-base font-semibold mt-4 mb-2">The Spring side</h3>
        <CodeBlock lang="java" caption="Return Flux<String> from a controller; Spring writes SSE for you">{`@RestController
class StreamController {
    private final ChatClient chatClient;

    @GetMapping(value = "/api/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestParam String q) {
        return chatClient.prompt()
            .user(q)
            .stream()            // Flux<ChatResponse>
            .content();          // Flux<String> — just the text deltas
    }
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">The React side</h3>
        <CodeBlock lang="ts" caption="EventSource — the simple path">{`useEffect(() => {
  const es = new EventSource(\`/api/stream?q=\${encodeURIComponent(query)}\`);
  es.onmessage = (e) => setText((prev) => prev + e.data);
  es.onerror = () => es.close();
  return () => es.close();                    // cancel on unmount
}, [query]);`}</CodeBlock>

        <CodeBlock lang="ts" caption="fetch + ReadableStream — when you need POST or custom headers">{`async function streamPost(body: unknown, onChunk: (s: string) => void, signal: AbortSignal) {
  const res = await fetch("/api/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,                                   // pass AbortController.signal for cancellation
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">The four gotchas you will hit</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Symptom</th>
                <th className="px-4 py-3 font-semibold">Cause</th>
                <th className="px-4 py-3 font-semibold">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Client only sees full response at the end</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Reverse proxy buffering (nginx/ALB)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Set <code>X-Accel-Buffering: no</code>, <code>Cache-Control: no-cache</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Stream cuts off after 30–60s</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Idle timeout in proxy</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Send a keepalive comment <code>: ping\n\n</code> every 15s</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">User navigates away, server keeps generating</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No cancellation wired</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400"><code>es.close()</code> in unmount; Flux cancellation propagates to Anthropic</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">UI shows broken multi-byte chars</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Half-finished UTF-8 in a chunk</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400"><code>TextDecoder({"{"} stream: true {"}"})</code> handles it; never decode chunk-at-a-time without stream:true</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/streaming" className="text-amber-600 hover:underline">Module 12 — Streaming with SSE</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Prompt caching */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Prompt caching — what, when, how much it saves</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Mark a prefix with <code>cache_control</code>. Identical prefixes within the TTL bill input tokens at ~10% of normal. Cache writes cost a premium (~25% extra) — so cache things you&apos;ll reuse.
        </p>

        <h3 className="text-base font-semibold mb-2">The pricing model in one table</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Token category</th>
                <th className="px-4 py-3 font-semibold">Cost relative to normal input</th>
                <th className="px-4 py-3 font-semibold">When you see it</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono">input_tokens (uncached)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">1.0x (baseline)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Anything not marked with cache_control, or a cache miss</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-rose-600">cache_creation_input_tokens</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">~1.25x (premium for the write)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">First request — you&apos;re paying to store the prefix</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-emerald-600">cache_read_input_tokens</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">~0.1x (10% of normal)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Subsequent requests within TTL, identical prefix → cache hit</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">output_tokens</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">~4–5x input baseline (unchanged)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Caching never affects output — only the input prefix</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
          <strong>Break-even rule of thumb:</strong> if you&apos;ll reuse the same prefix at least twice within the TTL, caching is already a win. The premium write is amortized away on hit #2.
        </p>

        <h3 className="text-base font-semibold mt-6 mb-2">What to cache (and what not to)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Cache this</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>System prompt</strong> — long, stable, sent on every call</li>
              <li><strong>Tool definitions</strong> — same input_schema on every turn</li>
              <li><strong>Few-shot examples</strong> — your demonstrations don&apos;t change call-to-call</li>
              <li><strong>Large pasted documents</strong> on a chat tab — same doc, many user questions</li>
              <li><strong>Early conversation turns</strong> in a long chat — they&apos;re replayed every turn</li>
            </ul>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Don&apos;t bother</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>The latest user turn</strong> — different every time</li>
              <li><strong>Anything with a timestamp / today&apos;s date</strong> — kills cache reuse</li>
              <li><strong>Short prompts</strong> &lt; a few hundred tokens — write premium isn&apos;t worth it</li>
              <li><strong>Per-user PII in the system prompt</strong> — different per user means 0% hit rate</li>
              <li><strong>One-shot batch jobs</strong> — no second call to read the cache</li>
            </ul>
          </div>
        </div>

        <h3 className="text-base font-semibold mt-6 mb-2">Invalidation rules — the byte-exact gotcha</h3>
        <Callout variant="warn" title="The cache is keyed on exact bytes up to the marker">
          One whitespace difference, one timestamp, one user&apos;s name interpolated in — and you have a cache miss. Treat cached prefixes like <em>immutable strings</em>: change them only via deliberate releases. If your system prompt contains <code>&quot;Today is 2026-05-13&quot;</code>, your hit rate is 0% on day two. Move volatile content into the <em>user</em> message, not the system prompt.
        </Callout>

        <h3 className="text-base font-semibold mt-4 mb-2">TTL</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
          <li><strong>Default</strong> — 5 minutes from last access. Each hit refreshes the TTL.</li>
          <li><strong>Extended</strong> — 1 hour, opt-in. Higher write premium, longer reuse window. Worth it for long-form chat tabs.</li>
          <li><strong>Past the TTL</strong> — next call writes a fresh entry (premium-billed again).</li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/prompt-caching" className="text-amber-600 hover:underline">Module 13 — Prompt caching</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — BAD/GOOD gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Four gotchas that bite people in production</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost someone real money or a real outage. If you only remember four things, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · System prompt jammed into a user message</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Putting persona / rules in the first <em>user</em> message instead of the <code>system</code> field works, but it kills cache reuse, weakens the &quot;mode&quot; signal to the model, and breaks Spring AI&apos;s <code>defaultSystem</code> pattern.
            </p>
            <CodeBlock lang="java" caption="BAD — system instructions disguised as user text">{`chatClient.prompt()
    .user("You are a senior Java reviewer. Be terse. Review this: " + code)
    .call().content();`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — system in the system field, user in the user field">{`chatClient.prompt()
    .system("You are a senior Java reviewer. Be terse.")  // cacheable, persistent
    .user(code)                                            // varies per call
    .call().content();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · tool_result without matching tool_use_id</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              When you reply to a <code>tool_use</code>, the <code>tool_result</code> block must include the same <code>tool_use_id</code> the model emitted. Mismatched ID or missing ID → 400 error. With parallel tool calls, every <code>tool_use_id</code> from the assistant turn needs a matching <code>tool_result</code> in the next user turn.
            </p>
            <CodeBlock lang="plain" caption="BAD — tool_result with no matching id">{`// assistant turn contained: tool_use { id: "toolu_01", name: "lookup", ... }
{
  "role": "user",
  "content": [
    { "type": "tool_result", "content": "{...}" }    // missing tool_use_id
  ]
}
// → 400 invalid_request_error`}</CodeBlock>
            <CodeBlock lang="plain" caption="GOOD — every tool_result references its tool_use_id">{`{
  "role": "user",
  "content": [
    { "type": "tool_result", "tool_use_id": "toolu_01", "content": "{...}" },
    { "type": "tool_result", "tool_use_id": "toolu_02", "content": "{...}" }
  ]
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Streaming &quot;works on localhost, hangs in prod&quot;</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Tokens stream perfectly in dev. In staging behind nginx / ALB, the user sees nothing until the full response is done, then everything at once. The proxy is buffering. SSE needs explicit no-buffer headers <em>and</em> a heartbeat to survive idle timeouts.
            </p>
            <CodeBlock lang="java" caption="BAD — relying on defaults, no keepalive">{`@GetMapping(value = "/api/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream(@RequestParam String q) {
    return chatClient.prompt().user(q).stream().content();
}`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — anti-buffer headers + heartbeat merged into the stream">{`@GetMapping(value = "/api/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public ResponseEntity<Flux<ServerSentEvent<String>>> stream(@RequestParam String q) {
    Flux<ServerSentEvent<String>> data = chatClient.prompt().user(q).stream().content()
        .map(chunk -> ServerSentEvent.builder(chunk).build());

    Flux<ServerSentEvent<String>> keepalive = Flux.interval(Duration.ofSeconds(15))
        .map(i -> ServerSentEvent.<String>builder().comment("ping").build());

    return ResponseEntity.ok()
        .header("X-Accel-Buffering", "no")            // tell nginx: do not buffer
        .header("Cache-Control", "no-cache")
        .body(Flux.merge(data, keepalive).takeUntilOther(data.ignoreElements()));
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Hardcoded model name</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Hardcoding <code>&quot;claude-sonnet-4-5&quot;</code> in service code means you can&apos;t swap to Haiku for cheap routes, can&apos;t A/B test, can&apos;t pin a version when something regresses. Drive it from config and inject per-service.
            </p>
            <CodeBlock lang="java" caption="BAD — model string literal in service">{`public String classify(String text) {
    return chatClient.prompt()
        .user(text)
        .options(ChatOptions.builder().model("claude-sonnet-4-5").build())  // hardcoded
        .call().content();
}`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — model from application.yml, injected via @ConfigurationProperties">{`# application.yml
spring:
  ai:
    anthropic:
      chat:
        options:
          model: \${AI_MODEL_CLASSIFIER:claude-haiku-4-5}   # default, env override
          temperature: 0.0

// Service code — no model string anywhere
public String classify(String text) {
    return chatClient.prompt().user(text).call().content();
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You're building a high-volume classification endpoint that maps support tickets to one of 12 categories. Sonnet handles it perfectly on your eval set. Which model should you actually ship?"
          options={[
            { label: "Opus — it's the smartest, latency doesn't matter for batch", explanation: "Overkill. If Sonnet passes the eval, Opus burns 3–5x the cost for no measurable lift. Match the model to the task." },
            { label: "Sonnet — it works, so ship it", explanation: "Tempting, but you haven't checked the cheaper option. The shipping rule is: drop one tier and re-run the eval. If Haiku passes too, ship Haiku." },
            { label: "Haiku — only if it also passes your eval; otherwise Sonnet", correct: true, explanation: "Right. The discipline is: start one tier above what you need, then try dropping a tier and re-eval. Classification on 12 categories is the canonical Haiku sweet spot — high volume, narrow task. But only ship Haiku after measuring, never by feel." },
            { label: "It doesn't matter, the model is fungible", explanation: "Models are not fungible. Capability, latency, and cost differ by ~5x across the lineup. Pick deliberately." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="The model returns a turn with stop_reason='tool_use' and two tool_use blocks (toolu_01 and toolu_02). What does your code send next?"
          options={[
            { label: "A new user message saying 'please use the tools'", explanation: "The model already asked. Your job is to execute the tools and return the results, not to reply in natural language." },
            { label: "Two separate API calls, one tool_result per call", explanation: "No — that breaks the conversation. The model emitted both tool_use blocks in one assistant turn, so your reply is one user turn containing both tool_result blocks." },
            { label: "One user turn containing two tool_result blocks, one per tool_use_id", correct: true, explanation: "Right. Parallel tool calls = one assistant turn with N tool_use blocks, then one user turn with N tool_result blocks, each carrying its matching tool_use_id. Then re-call the API and the model continues." },
            { label: "Append the tool outputs as plain text in a new user message", explanation: "The API requires the structured tool_result block type with tool_use_id. Plain text won't link back to the model's request and you'll get unpredictable behavior." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You need to stream LLM output from Spring Boot to a React chat UI. Most production traffic, behind nginx. Which transport?"
          options={[
            { label: "WebSockets — full duplex is the obvious choice", explanation: "Overkill. The model only flows server→client. WebSockets add upgrade-handshake complexity, sticky-session requirements, and a separate protocol — for no benefit on a one-way stream." },
            { label: "Long polling — refresh every 200ms until done", explanation: "Worst of all worlds: more requests, more latency, no real-time feel. Long polling is what SSE replaced." },
            { label: "Server-Sent Events (SSE) — return Flux<String> with TEXT_EVENT_STREAM_VALUE", correct: true, explanation: "Right. SSE is plain HTTP, one-way (server→client), works with EventSource out of the box, plays nicely with reverse proxies once you set the no-buffer headers, and Spring serializes Flux<String> as SSE automatically. Pick SSE for chat streams unless you genuinely need duplex." },
            { label: "gRPC server streaming", explanation: "Fine on backend-to-backend, awful for browsers. Browsers can't speak gRPC natively without grpc-web, which adds a proxy layer. SSE is the browser-native answer." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your system prompt is 2,000 tokens and identical on every call. Your tool definitions are 1,500 tokens, also identical. The latest user question is 50 tokens. What do you mark with cache_control?"
          options={[
            { label: "The user question — it's the largest cost driver", explanation: "Backwards. The user question is short AND it changes every call, so caching it gets 0% hit rate. Cache things that are long AND stable." },
            { label: "Nothing — caching adds complexity for marginal gain", explanation: "On 3,500 tokens of stable prefix, caching takes input billing from 1.0x to ~0.1x after the first call. That's a 70%+ cost cut on input. Not marginal." },
            { label: "The system prompt and tool definitions (mark the end of the stable prefix)", correct: true, explanation: "Right. Mark the end of the long, stable prefix. The first call pays the ~1.25x write premium; every subsequent call within the TTL pays ~0.1x for those 3,500 tokens. Output billing is unchanged either way." },
            { label: "The whole request including the user message", explanation: "Marking past the volatile user message means the cache key includes a string that changes every call. Hit rate: 0%. The marker must be placed at the boundary between stable prefix and volatile suffix." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A Claude API call returns HTTP 429 rate_limit_error. Your Spring service is in a tool-use loop on behalf of a user. What's the right retry strategy?"
          options={[
            { label: "Retry immediately in a tight loop until it succeeds", explanation: "That's how you turn one rate-limit error into a sustained ban. The whole point of 429 is 'slow down' — not 'try again right now'." },
            { label: "Exponential backoff with jitter, respect Retry-After if present, give up after N attempts", correct: true, explanation: "Right. Classic backoff: 1s, 2s, 4s, 8s with random jitter to avoid thundering herd. The Anthropic API also returns a Retry-After header you should honor when present. Cap retries (3–5) so a sustained outage surfaces to the user instead of looping forever." },
            { label: "Switch to a different model and retry", explanation: "Different models share organization-level rate limits in many setups. And changing models mid-call changes the answer — not what you want on a transient error." },
            { label: "Idempotency means you can safely fire-and-forget; don't retry, just return", explanation: "Idempotency is about safety of retries, not whether to retry. For a user-facing call you absolutely want to retry transient errors — just with backoff." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Ready for Phase 3 */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <Callout variant="spring" title="You're ready for Phase 3 when…">
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 m-0">
            <li>You can sketch the JSON body of a Claude API call from memory — <code>model</code>, <code>max_tokens</code>, <code>system</code>, <code>messages</code> — and know which fields are required.</li>
            <li>You can explain why you inject <code>ChatClient.Builder</code> and not <code>ChatClient</code>, and what <code>.defaultSystem</code> vs per-call <code>.system</code> buys you.</li>
            <li>You can describe the tool-use loop end to end — <code>tool_use</code> block out, <code>tool_result</code> block back in, stop on <code>end_turn</code> — and explain what Spring AI&apos;s <code>@Tool</code> handles for you.</li>
            <li>You can name the four streaming gotchas (proxy buffering, idle timeouts, cancellation on unmount, half-finished UTF-8) and the headers that fix the first two.</li>
            <li>You can decide — without looking it up — whether a given prompt is worth caching, and you know that the cache is keyed on the exact byte prefix.</li>
          </ul>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          Phase 2 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can ship a real LLM backend</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The messages API, the Spring AI ChatClient pattern, the tool-use loop, SSE streaming, prompt caching — the whole backend toolkit. Every module from here on assumes you can already wire these together.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 3 — Vector Search &amp; RAG.</strong> You&apos;ll go past tool-use lookups into semantic retrieval: embeddings as the bridge between meaning and math, vector databases as the index, RAG as the architecture pattern that lets you ground answers in your own documents.
        </p>
        <Link
          href="/courses/ai/modules/embeddings-deep"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Embeddings deep dive →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="phase-2-revision" />
    </article>
  );
}
