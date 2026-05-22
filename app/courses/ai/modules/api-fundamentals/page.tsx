import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "what-is-a-call", title: "What a call is" },
  { id: "auth-and-models", title: "Auth & models" },
  { id: "parameters", title: "Parameters" },
  { id: "project", title: "Project: code reviewer CLI" },
  { id: "final", title: "Final quiz" },
];

export default function ApiFundamentalsModule() {
  const mod = getModuleBySlug("api-fundamentals")!;

  const requestFlowchart = `
flowchart LR
    A[Your Spring Boot app] -->|POST /v1/messages<br/>JSON body| B[Anthropic edge]
    B --> C{Auth check<br/>x-api-key}
    C -->|valid| D[Route by model:<br/>claude-sonnet-4-5 etc.]
    C -->|invalid| X[401 Unauthorized]
    D --> E[Run inference]
    E --> F[Stream OR<br/>buffer tokens]
    F --> G[JSON response<br/>+ usage block]
    G --> A
    style C fill:#fbbf24,color:#000
    style E fill:#818cf8,color:#fff
    style G fill:#34d399,color:#000
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Claude API fundamentals
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Auth, models, parameters — from zero to your first real request.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="api-fundamentals" />
        <ModuleProgress moduleSlug="api-fundamentals" checkpoints={CHECKPOINTS} />
      </header>

      <Callout variant="insight" title="Where Phase 2 picks up">
        <p className="m-0">
          Phase 1 you built the model from scratch. Phase 2 you call someone else&apos;s. From here on, every module is &quot;real Java code, real network calls, real costs.&quot; By the end of this module you&apos;ll have a Spring Boot CLI on your laptop that posts to Anthropic and prints back a code review — and you&apos;ll know exactly which knob to turn when something goes wrong.
        </p>
      </Callout>

      {/* ============================================================ */}
      {/* PART 1: WHAT A CALL IS                                        */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="api-fundamentals" id="what-is-a-call" title="What a call is" xp={15} celebration="You see what a Claude API call really is — a JSON POST. On to auth.">
      <section>
        <h2>Part 1: What an API call to Claude actually <em>is</em></h2>

        <p>
          Strip away the SDK, strip away Spring AI, strip away the docs. At the wire level, a Claude API call is one thing: <strong>an HTTPS POST to <code>https://api.anthropic.com/v1/messages</code> with a JSON body</strong>. That&apos;s it. Everything else in this phase is convenience on top.
        </p>

        <p>The body has three things that matter:</p>

        <div className="not-prose my-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300"><code>model</code></div>
            <div className="text-sm">Which Claude. <code>claude-sonnet-4-5</code>, <code>claude-opus-4-5</code>, <code>claude-haiku-4-5</code>. Different price/speed/quality tradeoffs.</div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300"><code>messages</code></div>
            <div className="text-sm">An array of turns. Each has a <code>role</code> (<code>user</code> or <code>assistant</code>) and <code>content</code> (the text). The model continues the array.</div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300"><code>max_tokens</code></div>
            <div className="text-sm">Hard ceiling on the reply. Required. Always. The model will never produce more than this — even mid-sentence.</div>
          </div>
        </div>

        <h3>The actual JSON</h3>
        <p>Here&apos;s a complete request body. This is what Spring AI sends for you, but it pays to see it once with no abstractions:</p>

        <CodeBlock lang="plain" caption="POST https://api.anthropic.com/v1/messages">{`{
  "model": "claude-sonnet-4-5",
  "max_tokens": 1024,
  "system": "You are a senior Java reviewer. Be terse and specific.",
  "messages": [
    { "role": "user", "content": "Review this snippet:\\npublic int add(int a, int b) { return a - b; }" }
  ]
}`}</CodeBlock>

        <p>And the response (trimmed):</p>

        <CodeBlock lang="plain" caption="200 OK · application/json">{`{
  "id": "msg_01ABC...",
  "type": "message",
  "role": "assistant",
  "model": "claude-sonnet-4-5",
  "content": [
    { "type": "text", "text": "Bug: returns a - b instead of a + b. Rename the method or fix the operator." }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 38,
    "output_tokens": 21
  }
}`}</CodeBlock>

        <p>
          That <code>usage</code> block is your bill. Multiply <code>input_tokens</code> by the model&apos;s input price, <code>output_tokens</code> by the (higher) output price, sum them up. Output is typically 4–5× more expensive per token than input — which is why Module 13 (Prompt caching) exists.
        </p>

        <h3>How a request actually flows</h3>
        <Mermaid chart={requestFlowchart} />

        <Callout variant="info" title="system isn't a message — it's a parameter">
          <p className="m-0">
            Notice <code>system</code> is its own top-level field, not a role in the messages array. This is a deliberate Anthropic API design: the system prompt is meant to be persistent &quot;mode&quot; instructions, not a conversational turn. (OpenAI&apos;s API folds it into messages instead — same idea, different shape. Spring AI hides this difference for you.)
          </p>
        </Callout>

        <Callout variant="warn" title="Stateless. Every call. Always.">
          <p className="m-0">
            The API does not remember a thing between calls. If you want a conversation, <em>you</em>{" "}append the assistant&apos;s reply to your <code>messages</code> array and re-send the whole thing next turn. The &quot;memory&quot; lives in your code, not on Anthropic&apos;s servers. (This is also why long chats get expensive — every turn re-bills for all prior turns as input tokens.)
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You build a chat UI. The user types message #4. What does your Spring app send to Anthropic?"
          options={[
            { label: "Just message #4 — Anthropic remembers messages 1–3 from earlier calls", explanation: "Nope. The API is stateless. Anthropic remembers nothing between requests." },
            { label: "Messages 1, 2, 3, and 4 — the full conversation, every time", correct: true, explanation: "Right. You re-send the whole conversation each turn. The memory lives in your client. (And yes, this means you re-pay for messages 1–3 as input tokens on every turn — Module 13 covers caching to dodge that bill.)" },
            { label: "Just message #4 plus a session ID Anthropic generated", explanation: "Anthropic doesn't return a session ID for you to reuse. Each call is independent." },
            { label: "Messages 1–4 the first call, then just deltas after", explanation: "There's no delta protocol. It's the full message array on every request." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A request returns usage = { input_tokens: 1200, output_tokens: 300 }. Roughly which side of the bill is bigger?"
          options={[
            { label: "Input — there are 4× more input tokens", explanation: "Token count favors input, but per-token price favors output. Output is ~5× more expensive per token across most Claude models." },
            { label: "Output — output tokens cost roughly 5× more per token", correct: true, explanation: "Right. 1200 input × $3/MTok = $0.0036; 300 output × $15/MTok = $0.0045 (using Sonnet's price). Even with 4× fewer output tokens, output dominates the bill. This is why most caching/optimization wins come from shortening output, not input." },
            { label: "They're roughly equal", explanation: "Run the math at Sonnet pricing: input ≈ $0.0036, output ≈ $0.0045. Output's bigger." },
            { label: "Impossible to know without the model name", explanation: "Across every Claude tier the output:input price ratio is ~5:1, so output dominates here regardless." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 1 recap"
        gist="An API call is a stateless JSON POST. You send model + messages + max_tokens; you pay for input + output tokens."
        points={[
          { takeaway: "One endpoint, one verb: POST /v1/messages.", detail: "Everything Spring AI does ultimately becomes one HTTPS call to that URL. Knowing this means you can debug at the curl level when something gets weird." },
          { takeaway: "messages is an array of {role, content}; system is a separate top-level field.", detail: "user and assistant roles alternate. system is persistent mode instructions and lives outside the array — different from OpenAI's shape." },
          { takeaway: "max_tokens is required and is a hard cap on the reply.", detail: "If the model hits it mid-sentence, the reply just stops. stop_reason will say \"max_tokens\" instead of \"end_turn\" — always check that field." },
          { takeaway: "The API has zero memory. You re-send the conversation every turn.", detail: "Conversation state is your client's job. The only thing Anthropic stores between calls is your usage counter for billing." },
          { takeaway: "Output tokens cost ~5× more than input tokens.", detail: "Across Haiku/Sonnet/Opus the ratio is consistent. Optimization usually means \"make the model say less,\" not \"shorten the prompt.\"" },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 2: AUTH AND MODELS                                       */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="api-fundamentals" id="auth-and-models" title="Auth & models" xp={20} celebration="API key wired, model picked. You've earned the right to make calls.">
      <section>
        <h2>Part 2: Auth and picking a model</h2>

        <h3>Auth — the world&apos;s simplest header</h3>
        <p>
          Anthropic auth is a single HTTP header: <code>x-api-key: sk-ant-...</code>. No OAuth dance, no JWT signing, no AWS SigV4. Get a key at <code>console.anthropic.com</code>, drop it in a header, you&apos;re in.
        </p>

        <Callout variant="warn" title="Never hardcode the key">
          <p className="m-0">
            <strong>Treat it like a credit card.</strong>{" "}Read it from an environment variable (<code>ANTHROPIC_API_KEY</code>), a secret manager, or your config server — never commit it. If you push a key to GitHub, Anthropic&apos;s scanners will detect it within minutes and auto-revoke. Then you&apos;ve had a bad afternoon.
          </p>
        </Callout>

        <h3>The three models you&apos;ll actually use</h3>
        <p>
          Claude has three current-generation tiers. They&apos;re all the same API shape — you swap the <code>model</code> string and nothing else changes. Pick by use case:
        </p>

        <div className="not-prose my-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-200">Haiku</div>
            <div className="mb-3 font-mono text-xs text-emerald-700 dark:text-emerald-400">claude-haiku-4-5</div>
            <div className="space-y-1.5 text-xs">
              <div><strong>Cheapest, fastest.</strong></div>
              <div>Good for: classification, extraction, simple Q&amp;A, high-volume internal tools.</div>
              <div>Bad for: anything requiring multi-step reasoning, code review, nuanced writing.</div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 font-bold text-amber-900 dark:text-amber-200">Sonnet ★</div>
            <div className="mb-3 font-mono text-xs text-amber-700 dark:text-amber-400">claude-sonnet-4-5</div>
            <div className="space-y-1.5 text-xs">
              <div><strong>The default. Use this unless you have a reason not to.</strong></div>
              <div>Good for: most coding, agents, RAG, customer-facing apps.</div>
              <div>Sonnet 4.5 is the workhorse — fast enough for interactive use, smart enough for hard problems.</div>
            </div>
          </div>
          <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
            <div className="mb-1 font-bold text-purple-900 dark:text-purple-200">Opus</div>
            <div className="mb-3 font-mono text-xs text-purple-700 dark:text-purple-400">claude-opus-4-5</div>
            <div className="space-y-1.5 text-xs">
              <div><strong>Smartest, slowest, priciest.</strong></div>
              <div>Good for: deep reasoning, hard refactors, multi-step planning, edge cases Sonnet flubs.</div>
              <div>Bad for: anything where latency matters or you call it 1000×/min.</div>
            </div>
          </div>
        </div>

        <Callout variant="info" title="Picking a model — the dumb-simple heuristic">
          <p className="mb-2">When in doubt:</p>
          <ol className="m-0 list-decimal space-y-1 pl-5">
            <li>Build everything on <strong>Sonnet</strong>.</li>
            <li>Once it works, try Haiku for the high-volume paths and see if quality holds.</li>
            <li>Drop to Opus <em>only</em>{" "}for the specific call where Sonnet visibly fails.</li>
          </ol>
          <p className="mt-3 mb-0">
            Most teams over-spend by reaching for Opus by default and over-suffer by reaching for Haiku for things it can&apos;t handle. Sonnet first, always.
          </p>
        </Callout>

        <h3>The model string actually matters</h3>
        <p>
          Anthropic versions models with full date suffixes (e.g., <code>claude-sonnet-4-5</code> vs the older <code>claude-3-5-sonnet-20241022</code>). The naming has rules:
        </p>

        <ul>
          <li><strong>Family, then tier, then version</strong> — <code>claude-{`{tier}`}-{`{version}`}</code>.</li>
          <li><strong>Old models don&apos;t auto-upgrade.</strong>{" "}If you pin <code>claude-3-5-sonnet-20241022</code>, you keep getting that exact snapshot until Anthropic deprecates it. New behavior = new model string.</li>
          <li><strong>Wrong string → 404 not_found_error</strong>. Typos here are the most common &quot;why doesn&apos;t my call work&quot; bug.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="You're building an internal Slack bot that classifies support tickets into 5 categories. Volume: ~50,000/day. Which model should you start with?"
          options={[
            { label: "Opus — classifications affect the user, you want max quality", explanation: "Opus is overkill for 5-way classification, and at 50K/day the cost would be wild. Classification is exactly what cheaper tiers were built for." },
            { label: "Sonnet — the default, can't go wrong", explanation: "Solid default for new projects, but classification is a textbook Haiku use case and Sonnet would cost ~5× more for no quality gain on this task." },
            { label: "Haiku — cheap, fast, classification is its sweet spot", correct: true, explanation: "Right. 5-way classification is well within Haiku's range and the price/latency win is huge at 50K/day. The heuristic 'Sonnet by default' applies to general-purpose features — narrow well-defined tasks like classification can usually start a tier lower." },
            { label: "Whichever is cheapest at the moment — switch dynamically", explanation: "Don't dynamic-switch on price. Pick the cheapest tier that meets quality on a held-out eval set, then stick with it. Switching mid-flight changes behavior in ways your tests won't catch." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Your code passes model = 'claude-3-5-sonnet'. The API returns 404 not_found_error. What's wrong?"
          options={[
            { label: "Your API key doesn't have access to that model", explanation: "Access errors return 403 permission_error, not 404. 404 means the string doesn't match any model." },
            { label: "The model string is incomplete — Anthropic uses dated versions like claude-3-5-sonnet-20241022, not bare names", correct: true, explanation: "Right. Pre-Claude-4 model strings required the date suffix. (Claude 4+ models accept the bare name like claude-sonnet-4-5.) When you get a 404, the first thing to check is whether the model string matches an actual published model name exactly." },
            { label: "Anthropic is rate-limiting you", explanation: "Rate limits return 429, never 404." },
            { label: "Your max_tokens is set wrong", explanation: "max_tokens issues return 400 invalid_request, not 404. 404 specifically means 'no such model'." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 2 recap"
        gist="Auth = one header. Model selection = Sonnet by default; tier down for narrow tasks, tier up only for cases Sonnet visibly fails."
        points={[
          { takeaway: "Auth is a single x-api-key header; never hardcode the value.", detail: "Read from ANTHROPIC_API_KEY env var or a secret manager. Anthropic auto-revokes leaked keys but the damage from a bad commit is yours to clean up." },
          { takeaway: "Three tiers: Haiku (cheap/fast), Sonnet (default), Opus (max quality, slow).", detail: "All three speak the same API. You swap the model string and nothing else changes — including the rest of your request body." },
          { takeaway: "Default to Sonnet; tier down for narrow tasks; tier up only when Sonnet measurably fails.", detail: "Most teams burn money by starting with Opus or trade quality away by starting with Haiku. Sonnet first, then specialize per use case." },
          { takeaway: "Output is ~5× more expensive than input across all three tiers.", detail: "Optimization wins come from making the model say less (use system prompts to keep output terse) and from prompt caching, not from clever prompt-shrinking." },
          { takeaway: "Wrong model string → 404 not_found_error.", detail: "Most common Phase-2 bug. Always copy/paste model names from the official docs — don't type them from memory." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 3: PARAMETERS                                            */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="api-fundamentals" id="parameters" title="Parameters" xp={20} celebration="Parameters under your belt. Time to build something real.">
      <section>
        <h2>Part 3: The parameters that actually matter</h2>

        <p>
          Beyond <code>model</code>, <code>messages</code>, and <code>max_tokens</code>, the request body has four optional knobs that change behavior. Most code only ever touches these. Skip the rest until you have a specific reason.
        </p>

        <h3><code>temperature</code> — randomness vs determinism</h3>

        <p>
          You met this in <Link href="/courses/ai/modules/recap" className="text-indigo-600 hover:underline">Module 8</Link>: temperature scales the logits before softmax. Lower = sharper distribution = more deterministic. Higher = flatter = more varied. The Anthropic API accepts <code>0.0</code> to <code>1.0</code>.
        </p>

        <div className="not-prose my-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-sky-300 bg-sky-50/50 p-4 dark:border-sky-800 dark:bg-sky-950/30">
            <div className="mb-2 text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">temperature: 0.0</div>
            <div className="text-sm">Greedy. Same prompt → same output (mostly). Use for: extraction, classification, code gen, anything you&apos;ll diff against expected output.</div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">temperature: 0.7</div>
            <div className="text-sm">A common &quot;safe middle&quot; for general use. Some variation, still coherent. Use for: chat, RAG answers, anything where small phrasing changes are fine.</div>
          </div>
          <div className="rounded-xl border border-rose-300 bg-rose-50/50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">temperature: 1.0 (Anthropic default)</div>
            <div className="text-sm">Anthropic&apos;s default if you don&apos;t pass one. Maximum spread. Use for: brainstorming, creative writing where you want surprising outputs.</div>
          </div>
        </div>

        <Callout variant="warn" title="Temperature 0 ≠ deterministic">
          <p className="m-0">
            Even at <code>temperature: 0</code>, two identical requests can produce different outputs. The model runs on a fleet of GPUs, and floating-point reductions across batches aren&apos;t bit-exact. For real determinism, you need both <code>temperature: 0</code> AND a stable test harness that doesn&apos;t panic over a token of difference. Don&apos;t snapshot-test LLM output by string equality.
          </p>
        </Callout>

        <h3><code>stop_sequences</code> — make the model stop early</h3>

        <p>
          Pass an array of strings. The moment the model produces any of them, generation stops (and the stop string is <em>not</em>{" "}included in the reply). Useful when:
        </p>

        <ul>
          <li>You&apos;re doing few-shot prompting and want to stop before the model invents a fake next example.</li>
          <li>You want strict structured output and need to stop at the closing delimiter.</li>
          <li>You&apos;re running an agent loop and need to stop on a sentinel like <code>&lt;END&gt;</code>.</li>
        </ul>

        <CodeBlock lang="plain" caption="Few-shot pattern — stop before the model fabricates an Example 4">{`{
  "model": "claude-sonnet-4-5",
  "max_tokens": 200,
  "stop_sequences": ["\\n\\nExample"],
  "messages": [{
    "role": "user",
    "content": "Convert dates.\\n\\nExample 1:\\nInput: Jan 5, 2024\\nOutput: 2024-01-05\\n\\nExample 2:\\nInput: 3rd of March 2023\\nOutput: 2023-03-03\\n\\nExample 3:\\nInput: 17/8/24\\nOutput:"
  }]
}`}</CodeBlock>

        <h3><code>top_p</code> — nucleus sampling</h3>

        <p>
          Instead of considering all tokens weighted by their softmax probability, only consider the smallest set of tokens whose cumulative probability ≥ <code>top_p</code>. So <code>top_p: 0.9</code> means &quot;sample only from the most-likely tokens that together account for 90% of the probability mass.&quot;
        </p>

        <p className="opacity-80">
          Honestly: <strong>tune temperature OR top_p, not both</strong>. The Anthropic docs say so. In practice, almost every team just sets temperature and ignores top_p exists.
        </p>

        <h3><code>system</code> — persistent mode instructions</h3>

        <p>
          We saw this in Part 1. It&apos;s the field where you write &quot;You are a senior Java reviewer. Be terse and specific.&quot; Different from a <code>user</code> message because:
        </p>

        <ul>
          <li><strong>The model treats it as higher priority</strong>{" "}than user turns. (Not bulletproof — see Module 25 on prompt injection — but a meaningful nudge.)</li>
          <li><strong>It doesn&apos;t count as a turn</strong>{" "}in the messages array, so you can use it to set tone without polluting the conversation history.</li>
          <li><strong>It&apos;s where prompt caching applies most cleanly</strong> (Module 13) — long stable system prompts get cached server-side.</li>
        </ul>

        <Callout variant="insight" title="The four-knob mental model">
          <p className="m-0">
            For 90% of features you&apos;ll build: set <code>system</code> for persona/format, set <code>temperature</code> by use case (0 for structured, 0.7 for chat), set <code>max_tokens</code> generously enough to never truncate but tight enough to bound costs. Skip <code>top_p</code> and <code>stop_sequences</code> until you have a specific reason. That&apos;s the whole API for most apps.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You're building a feature that extracts amounts and dates from receipts and writes them to a database. Which knobs?"
          options={[
            { label: "temperature: 0.7, no system prompt", explanation: "Default temperature is for chat — for extraction you want sharp, repeatable outputs. And a system prompt locks the output format, which matters more for extraction than almost anything else." },
            { label: "temperature: 0, system prompt that pins the output format, max_tokens generous enough to fit a large receipt", correct: true, explanation: "Right. Extraction = structured task = temperature 0 + a system prompt that specifies the exact JSON shape you want. Generous max_tokens prevents mid-receipt truncation. This is the canonical 'structured output' configuration." },
            { label: "temperature: 1.0 with stop_sequences = [\"}\"]", explanation: "High temperature for an extraction task gives you wrong amounts and creative dates. And stopping at } breaks on the very first nested object." },
            { label: "Just messages and max_tokens, defaults for everything else", explanation: "Defaults work but you're leaving determinism on the table — extractions should be temperature 0 so two identical receipts diff cleanly." },
          ]}
        />

        <Quiz
          kind="Gut check"
          question="Your stop_sequences = ['\\n\\nQ:']. The model returns stop_reason: 'stop_sequence'. What's in the response content?"
          options={[
            { label: "The full reply, including '\\n\\nQ:' at the end", explanation: "The stop string is excluded from the response. That's the whole point — you don't want it polluting your output." },
            { label: "The full reply, NOT including '\\n\\nQ:'", correct: true, explanation: "Right. The stop sequence is the trigger to halt, but it's stripped from the returned content. If you need to know which sequence triggered the stop, the response includes a stop_sequence field naming it." },
            { label: "An empty string — the API errored when it hit the stop", explanation: "stop_reason: 'stop_sequence' is success, not error. The model produced output, then gracefully halted." },
            { label: "Just '\\n\\nQ:' alone", explanation: "Other way around — the stop string is the one thing NOT in the response." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 3 recap"
        gist="Four knobs cover 90% of apps: system, temperature, max_tokens, stop_sequences. Skip the rest until you have a reason."
        points={[
          { takeaway: "temperature controls randomness; 0 for structured tasks, 0.7 for chat.", detail: "Lower = sharper softmax = more repeatable. But even at 0 the API isn't bit-deterministic — don't snapshot-test on string equality." },
          { takeaway: "stop_sequences halt generation at any of the listed strings; the stop string is excluded from the reply.", detail: "Useful for few-shot patterns, structured output delimiters, and agent sentinels. The response's stop_reason field tells you whether it was 'end_turn' or 'stop_sequence' or 'max_tokens'." },
          { takeaway: "top_p exists but you almost never need it — tune temperature OR top_p, not both.", detail: "Nucleus sampling restricts to the smallest set of tokens covering top_p of the probability mass. In practice teams just set temperature and ignore top_p." },
          { takeaway: "system is a separate parameter, not a message, and it's where you set persona / output format.", detail: "Higher implicit priority than user turns, doesn't count as a conversation turn, and is the prime target for prompt caching in Module 13." },
          { takeaway: "Always set max_tokens generously enough to never truncate but tight enough to bound runaway costs.", detail: "If stop_reason comes back as 'max_tokens' you got cut off mid-thought — bump it. If your bills are spiking, lower it. Always check the field." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 4: THE PROJECT                                           */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="api-fundamentals" id="project" title="Project: code reviewer CLI" xp={40} manual manualLabel="I built and ran it" celebration="You shipped a working AI feature. Phase 2 is officially open.">
      <section>
        <h2>Part 4: Project — AI code reviewer CLI</h2>

        <p>
          Time to build it. We&apos;re going to make a Spring Boot CLI that takes a Java file path as an argument, reads the file, sends it to Claude with a code-review system prompt, and prints the review to stdout. Real Spring Boot, real Spring AI, real Claude.
        </p>

        <p>
          Everything below is copy-paste ready. Open IntelliJ (or your editor of choice), create the files at the indicated paths, and you&apos;re running in five minutes.
        </p>

        <h3>Step 0: Prerequisites</h3>

        <ul>
          <li><strong>Java 21 JDK</strong>{" "}installed and on your PATH. Verify: <code>java --version</code> should print <code>21</code> or higher. If you don&apos;t have it, install via <a href="https://sdkman.io/" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">SDKMAN</a> (macOS/Linux: <code>sdk install java 21-tem</code>) or <a href="https://adoptium.net/" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">Adoptium Temurin 21</a> (any OS, installer-based).</li>
          <li><strong>An Anthropic API key</strong> — get one at <a href="https://console.anthropic.com/" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">console.anthropic.com</a>. Sign up, go to <em>Settings → API Keys → Create Key</em>, copy the <code>sk-ant-...</code> string somewhere safe. New accounts get a small free credit — more than enough for this module.</li>
          <li><strong>An IDE</strong> — IntelliJ IDEA Community Edition is free and has the smoothest Spring Boot UX. VS Code with the &quot;Extension Pack for Java&quot; works too. We&apos;ll show IntelliJ paths below; VS Code users, the file paths and Maven commands are identical, you just open the folder instead.</li>
          <li><strong>No global Maven needed</strong> — the project ships with Maven Wrapper (<code>mvnw</code>), which downloads the right Maven version on first run.</li>
        </ul>

        <h3>Step 1: Scaffold the project</h3>

        <p>
          Pick whichever path is more comfortable — both produce <strong>identical output</strong>. Path A is the one I&apos;d recommend for this course because it&apos;s self-documenting (you&apos;ll see exactly which dependencies got picked).
        </p>

        <h4 className="mt-6">Path A — start.spring.io (browser, recommended)</h4>

        <p>
          <a href="https://start.spring.io" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">start.spring.io</a> is the official Spring Initializr. It generates a zip with all the boilerplate (pom.xml, Maven Wrapper, an empty <code>@SpringBootApplication</code> class). Steps:
        </p>

        <ol>
          <li>Open <a href="https://start.spring.io" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">start.spring.io</a> in your browser.</li>
          <li>In the left panel, set <strong>Project</strong>{" "}to <code>Maven</code> and <strong>Language</strong>{" "}to <code>Java</code>.</li>
          <li><strong>Spring Boot</strong>: pick the latest <code>3.x</code> stable release (avoid <code>SNAPSHOT</code> and <code>M*</code> milestones — those are pre-release).</li>
          <li>In <strong>Project Metadata</strong>, set:
            <ul>
              <li><strong>Group:</strong> <code>com.example</code></li>
              <li><strong>Artifact:</strong> <code>claude-code-reviewer</code></li>
              <li><strong>Name:</strong> <code>claude-code-reviewer</code> (auto-fills from Artifact)</li>
              <li><strong>Description:</strong>{" "}anything, e.g. <code>AI code reviewer CLI</code></li>
              <li><strong>Package name:</strong> <code>com.example.codereviewer</code> (auto-fills, but double-check — this becomes the Java package)</li>
              <li><strong>Packaging:</strong> <code>Jar</code></li>
              <li><strong>Java:</strong> <code>21</code></li>
            </ul>
          </li>
          <li>On the right, click <strong>ADD DEPENDENCIES</strong>. Search for <code>Anthropic</code> and select <strong>Anthropic Claude</strong> (this is Spring AI&apos;s Anthropic starter). That&apos;s the only dependency we need — Spring AI&apos;s autoconfig pulls in everything else.</li>
          <li>Click <strong>GENERATE</strong>{" "}at the bottom. A <code>claude-code-reviewer.zip</code> downloads.</li>
          <li>Unzip it somewhere (e.g. <code>~/projects/claude-code-reviewer</code>). Open that folder in IntelliJ via <em>File → Open</em> (point it at the <strong>folder</strong>, not the pom.xml — IntelliJ auto-detects Maven). Wait for IntelliJ to finish indexing and downloading dependencies; you&apos;ll see &quot;Maven: ... downloading&quot; in the bottom status bar. Could take 1–3 minutes the first time.</li>
        </ol>

        <Callout variant="info" title="Direct link with everything pre-filled">
          <p className="m-0">
            If you want to skip the form-filling, this URL pre-loads all the right settings:{" "}
            <a
              href="https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.1&packaging=jar&jvmVersion=21&groupId=com.example&artifactId=claude-code-reviewer&name=claude-code-reviewer&description=AI%20code%20reviewer%20CLI&packageName=com.example.codereviewer&dependencies=spring-ai-anthropic"
              className="break-all text-indigo-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              start.spring.io/#!...&dependencies=spring-ai-anthropic
            </a>
            . Click <strong>GENERATE</strong>{" "}and you&apos;re done.
          </p>
        </Callout>

        <h4 className="mt-6">Path B — IntelliJ&apos;s built-in Spring Initializr</h4>

        <p>If you live in IntelliJ and don&apos;t want to leave it:</p>

        <ol>
          <li><em>File → New → Project</em>.</li>
          <li>In the left sidebar of the New Project dialog, select <strong>Spring Boot</strong>. (Community Edition: this is bundled. If you don&apos;t see it, install the &quot;Spring Initializr and Assistant&quot; plugin via <em>Settings → Plugins</em>.)</li>
          <li>Fill in the form with the same values as Path A: Name <code>claude-code-reviewer</code>, Group <code>com.example</code>, Artifact <code>claude-code-reviewer</code>, Type <code>Maven</code>, Language <code>Java</code>, JDK <code>21</code>, Java <code>21</code>, Packaging <code>Jar</code>. Click <strong>Next</strong>.</li>
          <li>On the dependencies screen, set Spring Boot version to the latest <code>3.4.x</code>. In the search box, type <code>Anthropic</code> and check <strong>Anthropic Claude</strong>. Click <strong>Create</strong>.</li>
          <li>IntelliJ scaffolds the project, opens it, and starts dependency download. Wait for it to finish indexing.</li>
        </ol>

        <h3>Step 2: Verify the scaffold</h3>

        <p>
          Whichever path you used, you should now have a folder structure that looks roughly like this. Compare it against yours — if anything&apos;s missing, the scaffold step didn&apos;t finish:
        </p>

        <CodeBlock lang="plain" caption="claude-code-reviewer/">{`claude-code-reviewer/
├── pom.xml                                              ← Maven build config (we'll review it next)
├── mvnw                                                 ← Maven wrapper script (macOS/Linux)
├── mvnw.cmd                                             ← Maven wrapper script (Windows)
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── .gitignore                                           ← already excludes target/, .idea/, etc.
├── HELP.md                                              ← generated, safe to delete
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/example/codereviewer/
    │   │       └── CodeReviewerApplication.java         ← we'll edit this
    │   └── resources/
    │       ├── application.properties                   ← we'll edit this
    │       ├── static/                                  ← unused for a CLI
    │       └── templates/                               ← unused for a CLI
    └── test/
        └── java/
            └── com/example/codereviewer/
                └── CodeReviewerApplicationTests.java    ← leave it; the empty test still runs`}</CodeBlock>

        <p>
          You&apos;ll need to <strong>create two new files</strong>{" "}alongside <code>CodeReviewerApplication.java</code>: <code>ReviewService.java</code> and <code>CliRunner.java</code>. We&apos;ll write those in Steps 6 and 7.
        </p>

        <Callout variant="warn" title="Sanity check before continuing">
          <p className="mb-2">
            Open a terminal in the project root and run:
          </p>
          <CodeBlock lang="plain" caption="terminal">{`./mvnw -version`}</CodeBlock>
          <p className="mt-2 mb-0">
            This should print Maven and Java versions without error. (On Windows, use <code>mvnw.cmd -version</code>. If you get &quot;permission denied&quot; on macOS/Linux, run <code>chmod +x mvnw</code> first.) If this fails, fix it before going further — every later step depends on the wrapper working.
          </p>
        </Callout>

        <h3>Step 3: Set the API key as an env var</h3>

        <p>
          The scaffolded <code>application.properties</code> will read the key via <code>${"${ANTHROPIC_API_KEY}"}</code>, so set it in your shell <em>before</em>{" "}you run the app:
        </p>

        <CodeBlock lang="plain" caption="macOS / Linux (bash, zsh)">{`export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Verify it's set:
echo $ANTHROPIC_API_KEY`}</CodeBlock>

        <CodeBlock lang="plain" caption="Windows (PowerShell)">{`$env:ANTHROPIC_API_KEY="sk-ant-api03-..."

# Verify:
echo $env:ANTHROPIC_API_KEY`}</CodeBlock>

        <Callout variant="info" title="Persisting the env var (optional)">
          <p className="m-0">
            <code>export</code> only lasts for the current shell session. To make it stick across reboots, add the line to <code>~/.zshrc</code> (zsh, the macOS default since Catalina) or <code>~/.bashrc</code> (bash). On Windows, use <em>System Properties → Environment Variables → New</em>{" "}for permanent. <strong>But:</strong>{" "}a permanent var means any process on your machine can read your key. The cleaner pattern is the IntelliJ Run Config option below — scoped to one run, never touches the shell.
          </p>
        </Callout>

        <Callout variant="info" title="IntelliJ Run Configuration alternative (recommended for this project)">
          <p className="mb-2">
            If you prefer not to mess with shell env vars at all:
          </p>
          <ol className="m-0 text-sm">
            <li>In IntelliJ, open <code>CodeReviewerApplication.java</code> and click the green ▶ in the gutter next to <code>main(...)</code> once. This creates a Run Configuration named &quot;CodeReviewerApplication&quot;.</li>
            <li>Top-right of IntelliJ, click the dropdown showing &quot;CodeReviewerApplication&quot; → <em>Edit Configurations…</em></li>
            <li>Find the <strong>Environment variables</strong>{" "}field (you may need to expand &quot;Modify options&quot; on newer IntelliJ versions). Set it to: <code>ANTHROPIC_API_KEY=sk-ant-api03-...</code></li>
            <li>Click OK. Your key is now bound to that one run config — never touches your shell, never lands in a commit.</li>
          </ol>
          <p className="mt-3 mb-0 text-sm">
            (You can also set program arguments here for Step 8 — same dialog, &quot;Program arguments&quot; field.)
          </p>
        </Callout>

        <h3>Step 4: Verify <code>pom.xml</code></h3>

        <p>
          The scaffold already wrote a <code>pom.xml</code>. Open it and compare against this — it should match closely. The only thing you might need to add is the Spring AI BOM in <code>dependencyManagement</code>, which start.spring.io includes automatically but some older IntelliJ versions skip:
        </p>

        <CodeBlock lang="plain" caption="pom.xml">{`<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.1</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>claude-code-reviewer</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>claude-code-reviewer</name>

    <properties>
        <java.version>21</java.version>
        <spring-ai.version>1.0.0</spring-ai.version>  <!-- use the latest 1.x at the time you build -->
    </properties>

    <dependencies>
        <!-- Standard Spring Boot — gives us @SpringBootApplication, ApplicationContext, etc. -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <!-- Spring AI's Anthropic starter — this one dep pulls in the
             ChatClient autoconfig, the Anthropic HTTP wiring, and the
             TokenCountEstimator. -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-model-anthropic</artifactId>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <!-- Spring AI BOM — keeps all spring-ai-* artifacts on the same version. -->
            <dependency>
                <groupId>org.springframework.ai</groupId>
                <artifactId>spring-ai-bom</artifactId>
                <version>\${spring-ai.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`}</CodeBlock>

        <h3>Step 5: <code>application.properties</code></h3>

        <CodeBlock lang="plain" caption="src/main/resources/application.properties">{`# ─────────────────────────────────────────────
# Spring AI · Anthropic config
# ─────────────────────────────────────────────

# Read the key from the env var. Spring resolves \${ANTHROPIC_API_KEY}
# at startup. If the var is missing, Spring fails fast with a clear error.
spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}

# Default model for every ChatClient call in this app.
# Override per-call with .options(...) if you need to.
spring.ai.anthropic.chat.options.model=claude-sonnet-4-5

# Sampling defaults — we'll override per-call where it matters.
spring.ai.anthropic.chat.options.temperature=0.2
spring.ai.anthropic.chat.options.max-tokens=2048

# ─────────────────────────────────────────────
# Logging — keep this CLI quiet, only show our output
# ─────────────────────────────────────────────
spring.main.banner-mode=off
logging.level.root=WARN
logging.level.com.example.codereviewer=INFO
spring.main.log-startup-info=false`}</CodeBlock>

        <Callout variant="warn" title="Why temperature 0.2 and not 0?">
          <p className="m-0">
            Code review is borderline-structured: we want consistent verdicts but a tiny bit of phrasing variety so it doesn&apos;t read like a robot. <code>0.2</code> is the &quot;structured-ish&quot; sweet spot. For pure JSON extraction we&apos;d use <code>0</code>; for chat we&apos;d use <code>0.7</code>.
          </p>
        </Callout>

        <h3>Step 6: <code>CodeReviewerApplication.java</code></h3>

        <p>
          The scaffold already created this file. Open it — it&apos;s a one-line stub, and that&apos;s actually the final version. Just double-check it matches:
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/example/codereviewer/CodeReviewerApplication.java">{`package com.example.codereviewer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Standard Spring Boot entrypoint.
//
// @SpringBootApplication = three annotations rolled into one:
//   - @Configuration: this class can declare @Bean methods.
//   - @EnableAutoConfiguration: scan the classpath, wire beans automatically.
//     This is what makes spring-ai-starter-model-anthropic "just work" —
//     it sees the dep on the classpath and registers a ChatClient.Builder
//     and TokenCountEstimator bean for us.
//   - @ComponentScan: discover @Service, @Component, @Repository in this
//     package and below.
@SpringBootApplication
public class CodeReviewerApplication {
    public static void main(String[] args) {
        // Spring Boot's main loop. It reads application.properties, builds
        // the ApplicationContext, instantiates beans, and then runs every
        // CommandLineRunner bean (that's where CliRunner kicks in).
        SpringApplication.run(CodeReviewerApplication.class, args);
    }
}`}</CodeBlock>

        <h3>Step 7: <code>ReviewService.java</code> <span className="text-sm font-normal opacity-60">(create this file)</span></h3>

        <p>
          In IntelliJ, right-click the <code>com.example.codereviewer</code> package → <em>New → Java Class</em> → name it <code>ReviewService</code>. Paste:
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/example/codereviewer/ReviewService.java">{`package com.example.codereviewer;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

// @Service = Spring stereotype for "business logic." Singleton by default,
// auto-discovered by component scan. Same as @Component semantically;
// @Service is the convention for the layer that does work.
@Service
public class ReviewService {

    // ChatClient is Spring AI's high-level wrapper for talking to an LLM.
    // The same fluent API works whether the underlying model is Claude,
    // OpenAI, Ollama, etc. — you swap the starter dep, not your code.
    private final ChatClient chatClient;

    // The system prompt is the persistent "mode" — sets persona + output
    // format for every call this service makes. Pulled out as a constant
    // so it's diffable, testable, and (later, in Module 13) cacheable.
    private static final String SYSTEM_PROMPT = """
        You are a senior Java reviewer. Read the file the user provides and
        produce a TERSE review. Output exactly this markdown structure:

        ## Verdict
        One sentence: ship it / needs work / reject.

        ## Issues
        Numbered list. Each: file:line — what's wrong — how to fix.
        Skip this section if there are no issues.

        ## Nits
        Numbered list of style/naming concerns. Skip if none.

        Rules:
        - No praise, no fluff, no "overall this is great".
        - If you don't see a real issue, say so — don't invent one.
        - Quote line numbers from the snippet you were given.
        """;

    // Constructor injection. Spring auto-provides ChatClient.Builder because
    // spring-ai-starter-model-anthropic registered it. We .build() here so
    // the chatClient is ready to use throughout the service's lifetime.
    public ReviewService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    /**
     * Send a Java file's contents to Claude and return the review.
     *
     * @param filename  display name for the model (so it can reference it)
     * @param sourceCode  the raw file contents
     * @return the model's review text
     */
    public String review(String filename, String sourceCode) {
        // Build the user turn. We label the file so the model can quote
        // "Foo.java:42" instead of "the file:42".
        String userMessage = "Review " + filename + ":\\n\\n\`\`\`java\\n"
            + sourceCode
            + "\\n\`\`\`";

        // Fluent Spring AI call:
        //   .system(...)  → top-level system param on the request
        //   .user(...)    → adds a user message turn
        //   .call()       → synchronous (we'll do .stream() in Module 12)
        //   .content()    → unwraps the text from the response
        return chatClient.prompt()
            .system(SYSTEM_PROMPT)
            .user(userMessage)
            .call()
            .content();
    }
}`}</CodeBlock>

        <h3>Step 8: <code>CliRunner.java</code> <span className="text-sm font-normal opacity-60">(create this file)</span></h3>

        <p>
          Same as before — right-click the <code>com.example.codereviewer</code> package → <em>New → Java Class</em> → name it <code>CliRunner</code>. Paste:
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/example/codereviewer/CliRunner.java">{`package com.example.codereviewer;

import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

// CommandLineRunner = Spring Boot's hook for "run something on startup,
// then exit." Perfect for CLI apps. Spring calls run(args) after the
// context is fully built. Args come straight from main(...).
@Component
public class CliRunner implements CommandLineRunner {

    private final ReviewService reviewService;

    public CliRunner(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Defensive arg parsing. We expect exactly one arg: a path to a
        // .java file. Anything else, print usage and bail.
        if (args.length != 1) {
            System.err.println("Usage: claude-code-reviewer <path/to/File.java>");
            System.exit(1);
        }

        Path file = Path.of(args[0]);
        if (!Files.exists(file)) {
            System.err.println("File not found: " + file);
            System.exit(1);
        }

        // Read the whole file as a String. Files are small (a single source
        // file), so we don't need streaming here.
        String sourceCode = Files.readString(file);
        String filename = file.getFileName().toString();

        System.out.println("─── Reviewing " + filename + " ("
            + sourceCode.length() + " chars) ───");
        System.out.println();

        // The actual call. Network round-trip happens here — typical
        // latency is 1-3 seconds for Sonnet on a small file.
        String review = reviewService.review(filename, sourceCode);

        System.out.println(review);
    }
}`}</CodeBlock>

        <h3>Step 9: Run it</h3>

        <p>
          From the project root in your terminal (make sure your <code>ANTHROPIC_API_KEY</code> env var is set in this shell — re-run the <code>export</code> from Step 3 if you opened a new terminal):
        </p>

        <CodeBlock lang="plain" caption="terminal">{`# Make a test file to review (with a deliberate bug):
cat > Calculator.java <<'EOF'
public class Calculator {
    public int add(int a, int b) {
        return a - b;  // oops
    }

    public int divide(int a, int b) {
        return a / b;  // no zero check
    }
}
EOF

# Run the reviewer:
./mvnw spring-boot:run -Dspring-boot.run.arguments="Calculator.java"`}</CodeBlock>

        <Callout variant="info" title="Running from IntelliJ instead">
          <p className="m-0">
            If you set up the IntelliJ Run Config in Step 3, you can run it from the IDE: open <em>Edit Configurations…</em>, set <strong>Program arguments</strong>{" "}to <code>Calculator.java</code> (and place a <code>Calculator.java</code> file in the project root), then click ▶. Same result, no terminal needed. The first run will take 10–15 seconds while Spring Boot starts up; subsequent runs are faster.
          </p>
        </Callout>

        <p>You should see something like:</p>

        <CodeBlock lang="plain" caption="expected output (your wording may vary)">{`─── Reviewing Calculator.java (172 chars) ───

## Verdict
Needs work.

## Issues
1. Calculator.java:3 — \`add\` returns \`a - b\` instead of \`a + b\`. Fix the operator.
2. Calculator.java:7 — \`divide\` will throw ArithmeticException when b == 0. Either guard with \`if (b == 0)\` and throw a clearer exception, or document the behavior.

## Nits
1. Calculator.java:1 — class has no Javadoc; add a brief one if this is part of a public API.`}</CodeBlock>

        <p>
          That&apos;s it. You just made a real LLM-powered tool with ~80 lines of Java. The hard work is done by Spring AI&apos;s autoconfig (you wrote zero HTTP client code) and Claude (it did the actual reviewing).
        </p>

        <h3>Common errors and how to fix them</h3>

        <div className="not-prose my-6 space-y-3">
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">401 authentication_error</div>
            <div className="text-sm">Your API key isn&apos;t set or is wrong. Re-check <code>echo $ANTHROPIC_API_KEY</code>. Common cause: you set it in one shell, then ran from a different one. (IntelliJ Run Configs are scoped to the run, not your terminal.)</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">404 not_found_error</div>
            <div className="text-sm">Your model string doesn&apos;t match a real model. Copy-paste exactly from <a href="https://docs.anthropic.com/en/docs/models" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">the model docs</a>.</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">429 rate_limit_error</div>
            <div className="text-sm">You&apos;re calling too fast or hit your monthly tier&apos;s cap. New accounts have low limits — wait a minute and retry, or top up at the console.</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">No qualifying bean of type &apos;ChatClient.Builder&apos;</div>
            <div className="text-sm">Spring AI&apos;s autoconfig didn&apos;t fire. 99% of the time this means the <code>spring-ai-starter-model-anthropic</code> dep didn&apos;t resolve — re-run <code>./mvnw clean install</code> and check for download errors.</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">App hangs at startup, no output</div>
            <div className="text-sm">Spring tried to read <code>${"${ANTHROPIC_API_KEY}"}</code> but the var is empty. The placeholder resolves to literal <code>${"${ANTHROPIC_API_KEY}"}</code> which the API rejects on the first call. Set the env var and restart.</div>
          </div>
        </div>

        <Callout variant="spring" title="What Spring AI did for you here">
          <p className="mb-2">
            Worth pausing on: you wrote zero HTTP code. No <code>HttpClient</code>, no JSON serialization, no header building, no response parsing, no retry policy. All of it lives inside <code>spring-ai-starter-model-anthropic</code>. The starter:
          </p>
          <ul className="m-0">
            <li>Read <code>spring.ai.anthropic.api-key</code> from <code>application.properties</code> and built the <code>x-api-key</code> header.</li>
            <li>Registered a <code>ChatClient.Builder</code> bean wired to <code>https://api.anthropic.com</code>.</li>
            <li>Translated your fluent <code>.system().user().call()</code> chain into the right JSON request body.</li>
            <li>Handled retries on transient 5xx errors and surfaced 4xx errors as Java exceptions.</li>
          </ul>
          <p className="mt-3 mb-0">
            Module 10 goes deeper into Spring AI — multi-message conversations, structured output via <code>.entity(MyClass.class)</code>, and the advisor chain. For now: feel the leverage. One dep + one annotation = working LLM call.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 4 recap"
        gist="One Spring AI dep, one application.properties config, one @Service, one CommandLineRunner. ~80 lines, working LLM-powered CLI."
        points={[
          { takeaway: "spring-ai-starter-model-anthropic is the one Spring Boot dep you need.", detail: "It autoconfigures ChatClient.Builder, the Anthropic HTTP wiring, the API key resolution, and TokenCountEstimator. Add the BOM in dependencyManagement to pin all spring-ai-* versions together." },
          { takeaway: "Read your API key from an env var via ${ANTHROPIC_API_KEY} in application.properties.", detail: "Never commit the key. Spring fails fast at startup if the env var isn't set. IntelliJ's Run Config 'Environment variables' field is the clean alternative to shell exports." },
          { takeaway: "ChatClient's fluent API: .prompt().system(...).user(...).call().content().", detail: ".system() sets the system parameter, .user() adds a turn, .call() is synchronous (Module 12 will swap to .stream()), .content() unwraps the text. Same shape regardless of which LLM provider is underneath." },
          { takeaway: "CommandLineRunner is Spring Boot's hook for 'do work on startup, then exit.'", detail: "Perfect for CLI apps. The args come from main(args). Throw an exception or call System.exit(1) to fail nonzero." },
          { takeaway: "401 = bad/missing key. 404 = wrong model string. 429 = rate-limited. Read the error type, don't guess.", detail: "Anthropic's error responses include a clear type field. Spring AI surfaces these as exceptions whose messages contain the type. Most Phase-2 debugging is just reading these strings carefully." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 5: FINAL QUIZ                                            */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="api-fundamentals" id="final" title="Final quiz" xp={30} celebration="Module 9 cleared. Onward to Spring AI deep dive in Module 10!">
      <section>
        <h2>Part 5: Final quiz</h2>
        <p>Five questions tying the whole module together. Get them all and you&apos;re ready for Module 10.</p>

        <Quiz
          kind="Final"
          xp={6}
          question="Without using any SDK, what's the absolute minimum you'd need to call Claude via curl?"
          options={[
            { label: "POST to api.anthropic.com/v1/messages with x-api-key header and a JSON body containing model + messages + max_tokens", correct: true, explanation: "That's the whole API surface. The x-api-key header for auth, and the three required body fields. Everything else is optional." },
            { label: "Run an OAuth flow first, get a bearer token, then POST", explanation: "No OAuth on Anthropic — just a single x-api-key header. Way simpler than most APIs." },
            { label: "Open a WebSocket and stream JSON frames", explanation: "Anthropic's API is HTTPS request/response. Streaming uses Server-Sent Events over a regular HTTP connection (Module 12), not WebSockets." },
            { label: "Send model + messages — max_tokens has a sensible default", explanation: "max_tokens is required. The API rejects requests without it. (Different from some other providers — don't carry this assumption over.)" },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="You're building a high-volume internal classifier (200K calls/day, 5 categories). You start with Sonnet, but want to optimize cost. What's the right next step?"
          options={[
            { label: "Switch the production traffic to Haiku and watch error rates", explanation: "Don't do flag-day model swaps. Test offline first — quality regressions in production look bad." },
            { label: "Move to Opus — more expensive but more accurate, fewer reruns", explanation: "Opus would multiply your bill ~5×. Going UP a tier for high-volume classification is the opposite of cost optimization." },
            { label: "Build an offline eval set, run both Sonnet and Haiku on it, switch to Haiku only if accuracy holds", correct: true, explanation: "Right. Eval-driven model selection. For narrow well-defined tasks like 5-way classification, Haiku usually holds quality, but you prove it on your real data before flipping the switch." },
            { label: "Tune temperature down to 0 — that fixes most cost issues", explanation: "Temperature affects determinism, not cost. Cost is dominated by token count × per-token-price. Lowering temperature doesn't change either." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="Your reviewer CLI works for small files but throws errors on a 5,000-line file. The response says stop_reason: 'max_tokens'. What happened?"
          options={[
            { label: "The input was too long — Claude's context window was exceeded", explanation: "Context overflow returns an invalid_request error, not a stop_reason of 'max_tokens'. stop_reason refers to why the OUTPUT stopped." },
            { label: "Claude generated a reply up to your max_tokens limit and was cut off mid-output", correct: true, explanation: "Right. stop_reason: 'max_tokens' means the OUTPUT hit your ceiling. Bump max_tokens, or system-prompt the model to be terser. (Don't confuse this with input-side context-window errors, which return a different error type entirely.)" },
            { label: "Anthropic rate-limited you mid-stream", explanation: "Rate limits return 429 errors, not partial responses with stop_reason: 'max_tokens'." },
            { label: "Your temperature was too high so the model rambled", explanation: "Temperature affects token selection variety, not length. The reply stopped because of max_tokens specifically — that field tells you the answer." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="You're choosing between putting your formatting instruction in the system parameter vs. as a user message prefix. Why use system?"
          options={[
            { label: "system messages count as 0 tokens (free)", explanation: "system tokens are billed exactly like any other input tokens. There's no free tier within a request." },
            { label: "system has higher implicit priority for the model AND it's the field that prompt caching applies to most cleanly", correct: true, explanation: "Right. Two real reasons: (1) the model treats system as persistent priority instructions over per-turn user content, (2) Module 13's prompt caching is most effective on long stable system prompts. Plus it doesn't pollute your conversation history with format boilerplate." },
            { label: "system messages can't be jailbroken — user messages can", explanation: "system gives a meaningful nudge but is NOT bulletproof against prompt injection. Module 25 covers exactly this. Don't trust system prompts as a security boundary." },
            { label: "The Anthropic API rejects formatting in user messages", explanation: "It doesn't — both work. The question is which is better, not which is allowed." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="Your Spring app starts up but crashes on the first call with 'No qualifying bean of type ChatClient.Builder available.' What's the most likely cause?"
          options={[
            { label: "Your @Service annotation is missing on ReviewService", explanation: "That would show as a different error — Spring would say it can't autowire ReviewService into CliRunner, not that ChatClient.Builder is missing." },
            { label: "spring-ai-starter-model-anthropic isn't on the classpath — Maven didn't resolve it, or you used the wrong artifactId", correct: true, explanation: "Right. ChatClient.Builder is registered by Spring AI's autoconfig, which only fires if the starter dep is actually on the classpath. Run ./mvnw dependency:tree | grep spring-ai to confirm. The most common gotcha: typo in the artifactId or missing the spring-ai BOM in dependencyManagement." },
            { label: "Your ANTHROPIC_API_KEY is wrong", explanation: "A wrong key returns 401 at first call — the bean would still be built. This error happens earlier, before any HTTP call." },
            { label: "Java 21 isn't installed", explanation: "Wrong Java version causes compilation or class-version errors at startup, not bean-resolution errors." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* NEXT MODULE                                                        */}
      {/* ================================================================= */}
      <section className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-yellow-950/40">
        <h3 className="mt-0 mb-2">Module 9 done → Module 10 next</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You can call Claude. Now we go deeper into the Spring AI side: multi-turn conversations, structured output (<code>.entity(MyDto.class)</code> directly into a typed object), advisors (Spring AI&apos;s middleware-style hooks for memory, logging, and rate-limiting), and the personal journal assistant project. Same Claude API underneath — much more leverage on top.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/courses/ai/modules/spring-ai"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-200/60 px-5 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-300/60 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60"
          >
            Module 10 — Spring AI integration →
          </Link>
          <Link
            href="/courses/ai"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            ← All modules
          </Link>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="api-fundamentals" />
    </article>
  );
}
