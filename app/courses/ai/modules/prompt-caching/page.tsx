import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "two-caches", title: "Two different caches" },
  { id: "how-it-works", title: "How API prompt caching works" },
  { id: "spring-cache", title: "Cache_control in Spring AI" },
  { id: "tracking-cost", title: "Tracking cost in code" },
  { id: "project", title: "Project: cost dashboard" },
  { id: "final", title: "Final quiz" },
];

export default function PromptCachingModule() {
  const mod = getModuleBySlug("prompt-caching")!;

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
          Prompt caching &amp; cost
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The other half of running LLMs at production scale — and the line item finance asks about.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="prompt-caching" />
        <ModuleProgress moduleSlug="prompt-caching" checkpoints={CHECKPOINTS} />
      </header>

      <Callout variant="insight" title="The setup">
        <p>
          Conversation memory (Module 10) compounds quickly: a 20-turn chat with a 2000-token system prompt re-bills you for that 2000 tokens <em>on every turn</em>. Across 10,000 daily users, that&apos;s tens of millions of duplicate input tokens billed daily. <strong>API prompt caching</strong>{" "}is Anthropic&apos;s answer: tell the API &quot;this prefix is reusable, store the encoded version of it for 5 minutes, and bill cache reads at 10% of normal price.&quot; This module shows you how to use it correctly — and how to instrument cost so you actually notice when something goes wrong.
        </p>
      </Callout>

      {/* ===================== Part 1 ===================== */}
      <section id="two-caches">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 1 — Two different &quot;caches&quot;</h2>

        <p>
          The word &quot;caching&quot; gets thrown around for two unrelated things in LLM-land. They sound similar and they&apos;re completely different mechanisms. Burning this distinction in early prevents a year of confused conversations.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">KV caching (inference internals)</h3>
        <p>
          When the model generates a response, each new token attends over every previous token. If it had to recompute attention for every prior token on every step, generation would be quadratic and unusably slow. So inference engines cache the &quot;keys&quot; and &quot;values&quot; from each prior token&apos;s attention computation — the famous <strong>KV cache</strong>. This is an <em>internal optimization</em>{" "}at inference time. You don&apos;t configure it, you don&apos;t pay for it differently, you don&apos;t even see it as a developer. You met this back in Phase 1.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">API prompt caching (this module)</h3>
        <p>
          Anthropic&apos;s API also offers an <em>opt-in, billable, observable</em>{" "}cache — a totally different beast. You mark a chunk of your prompt with <code>cache_control</code>. The first request stores that prefix server-side (encoded form) for 5 minutes (default) or 1 hour (extended). Subsequent requests with the <em>same exact prefix</em>{" "}within that window get a <strong>cache hit</strong> — input tokens for that prefix bill at ~10% of the normal rate.
        </p>

        <Callout variant="info" title="Two caches, one table">
          <CodeBlock lang="plain">{`                 KV cache (Phase 1)         API prompt caching (this module)
─────────────────────────────────────────────────────────────────────────────
What            Per-request attention      Reusable prefix across requests
                 reuse
Where           Inside one inference        Server-side, between requests
                 call
Lifetime        One generation step         5 min (default) or 1 hour (1h)
You configure?  No                          Yes — cache_control marker
You pay?        Same as input tokens        Cache writes ~25% surcharge,
                                            cache reads ~10% of normal
You observe?    Invisible                   Usage block reports cache_creation
                                            and cache_read tokens`}</CodeBlock>
        </Callout>

        <p className="mt-4">
          For the rest of this module, <strong>&quot;prompt caching&quot;</strong>{" "}means the API-level kind. The Phase 1 KV cache is just background.
        </p>

        <Quiz
          kind="Quick check"
          question="A coworker says 'the model uses caching internally to speed up generation, so we don't need cache_control.' True or false?"
          options={[
            { label: "True — KV cache and API caching solve the same problem", explanation: "They sound similar but solve different problems. KV cache helps within one generation; API caching helps across requests." },
            { label: "False — KV caching is intra-call (one generation); API prompt caching is inter-call (across requests with reusable prefix)", correct: true, explanation: "Right. Different layers entirely. KV caching is invisible inference optimization. cache_control gives you billable, observable, multi-request reuse." },
            { label: "True — only the model team needs to think about caching", explanation: "Cost optimization is absolutely a developer concern. KV caching happens regardless; cache_control is opt-in and yours to configure." },
            { label: "False — KV caching is fake, only cache_control is real", explanation: "KV caching is real — it's why generation is fast at all. It's just orthogonal to API prompt caching." },
          ]}
          xp={10}
        />

        <Checkpoint moduleSlug="prompt-caching" id="two-caches" title="Two different caches" xp={20}>
          <PartRecap
            title="Part 1 recap"
            gist="KV cache (Phase 1) is per-request inference; API prompt caching (this module) is reusable prefixes across requests."
            points={[
              { takeaway: "KV caching is invisible — it makes generation feasible at all but isn't a billing knob.", detail: "Every transformer inference engine has it. You don't configure it, can't disable it, and never see it directly." },
              { takeaway: "API prompt caching is opt-in, observable, and changes your bill.", detail: "Mark a prefix with cache_control; subsequent requests within 5 min (or 1 hour) hit the cache and bill ~10% of the normal input rate for that prefix." },
              { takeaway: "If someone says 'caching' without qualifiers, ask which layer.", detail: "Misalignment on this term wastes hours in design discussions. Make it explicit." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 2 ===================== */}
      <section id="how-it-works">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 2 — How API prompt caching works</h2>

        <h3 className="mt-6 mb-3 text-xl font-semibold">The mental model: cached prefixes</h3>
        <p>
          You can mark up to 4 cache breakpoints in a single request. Each breakpoint says &quot;everything <em>before</em>{" "}me is a cacheable prefix.&quot; Anthropic hashes that prefix; if a subsequent request has the same hash, it&apos;s a cache hit.
        </p>

        <CodeBlock lang="plain" caption="Anatomy of a cached request (raw API view)">{`{
  "model": "claude-sonnet-4-5",
  "system": [
    {
      "type": "text",
      "text": "You are a customer support agent for Acme Inc...",
      "cache_control": { "type": "ephemeral" }     <-- marks prefix end
    }
  ],
  "messages": [
    { "role": "user", "content": "How do I reset my password?" }
  ],
  "max_tokens": 256
}`}</CodeBlock>

        <p className="mt-4">
          On the first call, Anthropic encodes the system prompt, stores it, and bills you the input tokens at the <strong>cache write rate</strong> (~25% premium over normal input). On subsequent calls with the <em>identical</em>{" "}system prompt within 5 minutes, you pay the <strong>cache read rate</strong> (~10% of normal input). The user message past the breakpoint always bills at full rate.
        </p>

        <Callout variant="insight" title="When caching pays off">
          <CodeBlock lang="plain">{`Break-even: cache_write_premium / (1 - cache_read_discount)
            ≈ 0.25 / 0.90 ≈ ~1.3 hits before cache pays back its write

In plain English: if a cached prefix gets reused at least ~2 times within
the cache window, you've already saved money. Most production system prompts
get reused thousands of times an hour — caching is essentially free money,
provided you set it up right.`}</CodeBlock>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Three rules that matter</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Exact-prefix match</strong> — every byte before the cache breakpoint must be identical, including whitespace. Change one comma in your system prompt and you bust the cache for every cached request.</li>
          <li><strong>Order matters</strong> — system → tools → messages. Mark caches in stable parts (system prompt, tool definitions, long shared context). Don&apos;t cache parts that change per-request.</li>
          <li><strong>Cache TTL = 5 minutes by default</strong> — every cache hit refreshes the TTL. As long as traffic keeps flowing, the cache stays warm. Idle longer than 5 min, you&apos;ll pay write again. Anthropic also offers a 1-hour cache (different pricing).</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-semibold">What to cache</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Long static system prompts</strong> — the obvious win. Anything &gt;500 tokens, used by &gt;1 user.</li>
          <li><strong>Tool definitions</strong> — they can be huge. Cache them, they almost never change.</li>
          <li><strong>RAG &quot;context blocks&quot;</strong> — for tenanted RAG with stable corpora, the retrieved context can be cached when the same docs come back across users.</li>
          <li><strong>Few-shot examples</strong> — large few-shot blocks are great cache candidates.</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-semibold">What NOT to cache</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>Per-user data that varies every request (you&apos;ll cache-write each time, paying a premium with no payoff).</li>
          <li>Anything below the minimum cacheable size (1024 tokens for most models — short prompts simply can&apos;t be cached).</li>
          <li>Highly volatile content (timestamps, request IDs in the prefix).</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Your system prompt is 'You are a helpful assistant. Today is 2026-04-28.' You mark it with cache_control. After running for two days you notice cache hit rate is 0%. Why?"
          options={[
            { label: "Cache_control doesn't work for system prompts", explanation: "It absolutely works for system prompts — that's actually the most common use case." },
            { label: "The date in the system prompt changes the prefix every day, so the hash never matches yesterday's", correct: true, explanation: "Right. Even one byte different = cache miss. Move volatile values (date, user, request ID) to AFTER the cache breakpoint, or out of the prompt entirely. A common pattern: keep the system prompt stable, inject 'today is X' as a separate user message before the real query." },
            { label: "5-minute TTL is too short for daily caching", explanation: "TTL is fine for high-traffic apps because each hit refreshes it. The issue here is the prefix mutates daily." },
            { label: "Anthropic disables caching for assistants", explanation: "There's no such restriction." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="prompt-caching" id="how-it-works" title="How API prompt caching works" xp={25}>
          <PartRecap
            title="Part 2 recap"
            gist="cache_control marks a prefix end. Identical prefixes within 5 min hit the cache and bill at ~10% of normal input."
            points={[
              { takeaway: "The cache is keyed on the exact byte prefix up to the cache_control marker.", detail: "One whitespace difference = miss. Treat cached prefixes like immutable strings — change them only via deliberate releases." },
              { takeaway: "Break-even is ~2 reuses within 5 min — caching is essentially free money for stable prompts.", detail: "Cache writes have a ~25% premium; cache reads are ~90% off. After a couple of hits the math is overwhelmingly in your favor." },
              { takeaway: "Cache the stable parts (system, tool defs, few-shot, fixed context); leave volatile parts past the breakpoint.", detail: "Volatile content above the marker means every request is a cache miss AND a cache write — you pay the premium repeatedly with no benefit." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 3 ===================== */}
      <section id="spring-cache">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 3 — <code>cache_control</code> in Spring AI</h2>

        <p>
          Spring AI exposes Anthropic&apos;s caching via provider-specific options. The cleanest way is to set it on the system prompt at builder time — once per service, applied to every call.
        </p>

        <CodeBlock lang="java" caption="Wiring cache_control onto the system prompt">{`import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.client.ChatClient;

@Service
public class SupportService {

  private static final String SYSTEM_TEXT = """
      You are a customer support agent for Acme Inc...
      [...500 lines of policy, FAQ, tone guide, escalation rules...]
      """;

  private final ChatClient chat;

  public SupportService(ChatClient.Builder builder) {
    // cacheTtl on the default options applies cache_control to the
    // system prompt block automatically. MINUTES_5 is the standard tier;
    // HOURS_1 is the longer/more-expensive tier.
    this.chat = builder
        .defaultSystem(SYSTEM_TEXT)
        .defaultOptions(AnthropicChatOptions.builder()
            .cacheTtl(AnthropicApi.CacheTtl.MINUTES_5)
            .build())
        .build();
  }

  public String handle(String userQuestion) {
    return chat.prompt()
        .user(userQuestion)
        .call()
        .content();
  }
}`}</CodeBlock>

        <Callout variant="spring" title="Spring AI version note">
          <p>
            The exact API surface for caching has shifted between Spring AI 1.0.x patch releases. In your real code, prefer the lookup: <em>&quot;Spring AI Anthropic cache_control example&quot;</em>{" "}for current syntax, then verify with the <code>spring.ai.anthropic.api</code> javadoc. The conceptual model — &quot;mark a system message or content block&quot; — is stable across versions.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Caching tool definitions</h3>
        <p>
          For Module 11&apos;s assistant pattern, the tool definitions can dwarf the system prompt. They&apos;re sent on every call. They almost never change. Perfect cache candidate. The same <code>cacheTtl</code> options apply when tools are attached — Spring AI&apos;s Anthropic adapter writes <code>cache_control</code> onto the long, stable blocks (system prompt and tool definitions) so a single cached prefix covers both:
        </p>

        <CodeBlock lang="java">{`AnthropicChatOptions opts = AnthropicChatOptions.builder()
    .cacheTtl(AnthropicApi.CacheTtl.MINUTES_5)
    .build();

chatClient.prompt()
    .user(question)
    .tools(graphTools)              // tool defs sent every call — cached prefix covers them
    .options(opts)
    .call()
    .content();`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Verifying it works</h3>
        <p>
          Cache effectiveness is observable in <code>ChatResponse.getMetadata().getUsage()</code>. Anthropic returns four numbers per response:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li><code>input_tokens</code> — tokens billed at the normal input rate.</li>
          <li><code>cache_creation_input_tokens</code> — tokens you wrote to the cache (premium-billed).</li>
          <li><code>cache_read_input_tokens</code> — tokens served from cache (~10% of normal).</li>
          <li><code>output_tokens</code> — generated tokens, normal output rate.</li>
        </ul>

        <p className="mt-4">A healthy cached service shows <code>cache_read_input_tokens</code> &gt;&gt; <code>input_tokens</code> after the first few requests warm the cache.</p>

        <Quiz
          kind="Quick check"
          question="You ship cache_control on a 3000-token system prompt. After deployment, your bill INCREASES — even though you expected savings. What's the most likely cause?"
          options={[
            { label: "Caching always raises the bill — it's a scam", explanation: "Caching is a real, well-documented saving when used correctly. The bill went up because something in your setup isn't producing hits." },
            { label: "Your prefix is non-stationary — something earlier than the cache breakpoint changes per-request, so every call writes a fresh cache (paying the 25% premium with no read offset)", correct: true, explanation: "Right. Common culprits: a 'today is X' line, a request ID, a user-specific field placed above the breakpoint. Audit what's above cache_control. If anything mutates per call, your cache hit rate is 0% and you pay the write premium on every request — strictly worse than no cache." },
            { label: "5-minute TTL is too short to break even", explanation: "Two reuses break even. If you have any meaningful traffic at all, 5 min is plenty for high hit rates." },
            { label: "Sonnet doesn't support caching", explanation: "Sonnet supports prompt caching — that's where most production caching happens." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="prompt-caching" id="spring-cache" title="cache_control in Spring AI" xp={25}>
          <PartRecap
            title="Part 3 recap"
            gist="Spring AI exposes Anthropic's cache_control via AnthropicChatOptions and message metadata. Verify with the usage block."
            points={[
              { takeaway: "Cache the stable parts at builder time, not per-call.", detail: ".defaultSystem + .defaultOptions on the ChatClient.Builder bake the cache config into every call from that service." },
              { takeaway: "Tool definitions are huge and stable — cache them too.", detail: "Once cacheTtl is set on AnthropicChatOptions, Spring AI's Anthropic adapter writes cache_control onto the tool block in addition to the system prompt, so a single cached prefix covers both. (The exact flag name has shifted across 1.0.x — check the version note above.)" },
              { takeaway: "ChatResponse.getMetadata().getUsage() exposes cache reads/writes; instrument them.", detail: "Without metrics you have no idea if your cache is working. Always log the four token counts on every call (or at least sample them)." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 4 ===================== */}
      <section id="tracking-cost">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 4 — Tracking cost in code</h2>

        <p>
          The single biggest cost-control lever is <strong>knowing what you spent</strong>. Anthropic gives you precise token counts on every response; turning those into dollars and surfacing them in your app is straightforward — and once you have it, regressions get caught instantly.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">A cost-tracking advisor</h3>
        <p>
          The pattern lifted from Module 10: write a <code>CallAdvisor</code> that wraps every call, reads usage out of the response, multiplies by per-model rates, and reports.
        </p>

        <CodeBlock lang="java" caption="A minimal cost advisor (sketch)">{`import org.springframework.ai.chat.client.advisor.api.*;

public class CostTrackingAdvisor implements CallAdvisor {

  // Indicative rates as of writing — keep these in config, not code, in production.
  // All rates per million tokens.
  private static final double IN_RATE       = 3.00;
  private static final double OUT_RATE      = 15.00;
  private static final double CACHE_WRITE   = 3.75;   // ~25% premium over input
  private static final double CACHE_READ    = 0.30;   // ~10% of input

  private final MeterRegistry meters;

  public CostTrackingAdvisor(MeterRegistry meters) {
    this.meters = meters;
  }

  @Override public String getName() { return "cost-tracker"; }
  @Override public int getOrder()    { return 1000; }   // run after everything else

  @Override
  public ChatClientResponse adviseCall(ChatClientRequest req, CallAdvisorChain chain) {
    ChatClientResponse resp = chain.nextCall(req);

    Usage u = resp.chatResponse().getMetadata().getUsage();
    long input  = u.getPromptTokens();
    long output = u.getCompletionTokens();
    Map<String, Long> native_ = (Map<String, Long>) u.getNativeUsage();
    long cacheWrite = native_.getOrDefault("cache_creation_input_tokens", 0L);
    long cacheRead  = native_.getOrDefault("cache_read_input_tokens",     0L);

    double cost =
        input      / 1_000_000.0 * IN_RATE
      + output     / 1_000_000.0 * OUT_RATE
      + cacheWrite / 1_000_000.0 * CACHE_WRITE
      + cacheRead  / 1_000_000.0 * CACHE_READ;

    meters.counter("llm.cost.usd_micros").increment(cost * 1_000_000);
    meters.counter("llm.tokens.input").increment(input);
    meters.counter("llm.tokens.output").increment(output);
    meters.counter("llm.tokens.cache_read").increment(cacheRead);
    meters.counter("llm.tokens.cache_write").increment(cacheWrite);

    return resp;
  }
}`}</CodeBlock>

        <Callout variant="warn" title="Hardcoding rates is a footgun">
          <p>
            Anthropic adjusts pricing periodically; new model SKUs ship with different rates. Put rates in <code>application.yml</code> (or a config service), keyed by model ID, and load them on startup. Rate changes should be a config commit, not a Java commit.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">What to alarm on</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Cost-per-request P95</strong> — a creeping P95 means prompts are growing or memory windows are blowing up.</li>
          <li><strong>Cache hit ratio</strong> — <code>cache_read / (cache_read + cache_write + input_tokens)</code>. If it drops, somebody changed a system prompt.</li>
          <li><strong>Daily spend</strong> — board-friendly, the only metric finance cares about.</li>
          <li><strong>Output:input ratio</strong> — if input grows faster than output, your context is getting bigger without value.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Your cost advisor reports a sudden 4x increase in cost-per-request after a deploy. cache_read drops to ~0%. Output tokens are unchanged. Most likely cause?"
          options={[
            { label: "Anthropic raised prices 4x", explanation: "Pricing doesn't change without notice. Internal cache miss is far more likely." },
            { label: "Someone edited the system prompt — cache_control prefix changed, so every request is now a cache write at premium rate, with no offsetting reads", correct: true, explanation: "Right. Edit a comma in a cached system prompt and your cache hit ratio collapses to 0%. You pay write-premium on every call. Same prompt, but bills 25-30x more than the cached path. Code-review changes to cached prompts; pin them with a version constant if helpful." },
            { label: "The model started producing more output", explanation: "Output tokens are unchanged, per the question." },
            { label: "Memory advisor stopped working", explanation: "Memory issues would change input token volumes, not specifically cache hit ratio. The cache_read collapse points to a busted prefix." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="prompt-caching" id="tracking-cost" title="Tracking cost in code" xp={30}>
          <PartRecap
            title="Part 4 recap"
            gist="A CostTrackingAdvisor turns every response's usage block into dollars and metrics. Without it you're flying blind."
            points={[
              { takeaway: "Read usage from ChatResponse.getMetadata().getUsage() (and getNativeUsage() for the cache-specific fields).", detail: "input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens — these are all you need to compute per-call cost." },
              { takeaway: "Keep rates in config, keyed by model. Update them as a config change, not code.", detail: "Anthropic pricing evolves; new models ship with new rates. Hardcoded rates rot quietly until the next quarterly bill review." },
              { takeaway: "Alarm on cost-per-request P95 and cache hit ratio.", detail: "Both catch regressions instantly: P95 catches growing context windows; cache hit ratio catches busted prefixes." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 5: Project ===================== */}
      <section id="project">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 5 — Project: cost dashboard</h2>

        <p>
          You&apos;re going to build a tiny Spring service that runs the same prompt repeatedly with caching enabled, accumulates per-call usage and cost, and serves a one-page dashboard with the live numbers. Goal: <strong>see the cache hit ratio climb after the first call</strong>, and watch dollars-per-call drop in real time.
        </p>

        <Callout variant="spring" title="What you'll build">
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>A <code>CostTracker</code> bean that accumulates totals across calls.</li>
            <li>A <code>CostAdvisor</code> that records usage on every call.</li>
            <li>A <code>SupportService</code> with a long, cached system prompt.</li>
            <li>A <code>DashboardController</code> with two endpoints: <code>POST /ask?q=...</code> and <code>GET /stats</code>.</li>
            <li>A static HTML page that calls /ask in a loop and renders /stats live.</li>
          </ul>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 1 — Scaffold</h3>
        <Callout variant="info" title="Path A — Browser (start.spring.io)">
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li>Use this <a className="text-indigo-600 hover:underline" href="https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.1&packaging=jar&jvmVersion=21&groupId=com.example&artifactId=cost-dashboard&name=cost-dashboard&description=LLM%20cost%20dashboard&packageName=com.example.cost&dependencies=spring-ai-anthropic,web" target="_blank" rel="noreferrer">pre-filled link</a> (Spring Web + Anthropic).</li>
            <li>GENERATE → unzip to <code>~/code/cost-dashboard</code>.</li>
          </ol>
        </Callout>

        <Callout variant="info" title="Path B — IntelliJ Initializr">
          <ol className="mt-2 list-decimal space-y-1 pl-6">
            <li><strong>File → New → Project → Spring Initializr</strong>. Group <code>com.example</code>, Artifact <code>cost-dashboard</code>, Maven, Java 21, Jar.</li>
            <li>Dependencies: <strong>Spring Web</strong>{" "}and <strong>Anthropic (Spring AI)</strong>.</li>
          </ol>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 2 — Verify</h3>
        <CodeBlock lang="plain">{`cd ~/code/cost-dashboard
./mvnw -version
ls src/main/java/com/example/cost/`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 3 — API key</h3>
        <CodeBlock lang="plain">{`export ANTHROPIC_API_KEY="sk-ant-..."`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 4 — application.properties</h3>
        <CodeBlock lang="plain" caption="src/main/resources/application.properties">{`spring.application.name=cost-dashboard
server.port=8080

spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-5
spring.ai.anthropic.chat.options.max-tokens=256

# Per-million-token rates. Adjust to whatever Anthropic publishes today.
llm.rates.input=3.00
llm.rates.output=15.00
llm.rates.cache_write=3.75
llm.rates.cache_read=0.30`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 5 — The cost tracker</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/cost/CostTracker.java">{`package com.example.cost;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class CostTracker {

  @Value("\${llm.rates.input}")        private double inRate;
  @Value("\${llm.rates.output}")       private double outRate;
  @Value("\${llm.rates.cache_write}")  private double cacheWriteRate;
  @Value("\${llm.rates.cache_read}")   private double cacheReadRate;

  private final AtomicLong calls       = new AtomicLong();
  private final AtomicLong inputTokens = new AtomicLong();
  private final AtomicLong outputTokens= new AtomicLong();
  private final AtomicLong cacheWrites = new AtomicLong();
  private final AtomicLong cacheReads  = new AtomicLong();

  public void record(long input, long output, long cacheWrite, long cacheRead) {
    calls.incrementAndGet();
    inputTokens.addAndGet(input);
    outputTokens.addAndGet(output);
    cacheWrites.addAndGet(cacheWrite);
    cacheReads.addAndGet(cacheRead);
  }

  public Stats snapshot() {
    long c = calls.get();
    long in = inputTokens.get(), out = outputTokens.get();
    long cw = cacheWrites.get(), cr = cacheReads.get();

    double totalCost =
        in / 1_000_000.0 * inRate
      + out / 1_000_000.0 * outRate
      + cw / 1_000_000.0 * cacheWriteRate
      + cr / 1_000_000.0 * cacheReadRate;

    double cacheHitRatio = (cr + cw + in) == 0 ? 0.0 : (double) cr / (cr + cw + in);

    return new Stats(c, in, out, cw, cr, totalCost, cacheHitRatio);
  }

  public record Stats(
      long calls, long inputTokens, long outputTokens,
      long cacheWriteTokens, long cacheReadTokens,
      double totalUsd, double cacheHitRatio) {}
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 6 — The advisor</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/cost/CostAdvisor.java">{`package com.example.cost;

import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.metadata.Usage;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CostAdvisor implements CallAdvisor {

  private final CostTracker tracker;

  public CostAdvisor(CostTracker tracker) {
    this.tracker = tracker;
  }

  @Override public String getName() { return "cost-advisor"; }
  @Override public int getOrder()    { return 1000; }

  @Override
  public ChatClientResponse adviseCall(ChatClientRequest req, CallAdvisorChain chain) {
    ChatClientResponse resp = chain.nextCall(req);

    try {
      Usage u = resp.chatResponse().getMetadata().getUsage();
      long input  = nz(u.getPromptTokens());
      long output = nz(u.getCompletionTokens());
      long cacheWrite = 0, cacheRead = 0;
      Object native_ = u.getNativeUsage();
      if (native_ instanceof Map<?,?> map) {
        cacheWrite = numLong(map.get("cache_creation_input_tokens"));
        cacheRead  = numLong(map.get("cache_read_input_tokens"));
      }
      tracker.record(input, output, cacheWrite, cacheRead);
    } catch (Exception ignored) {
      // Don't fail the user request because metrics broke.
    }

    return resp;
  }

  private static long nz(Long v) { return v == null ? 0L : v; }
  private static long numLong(Object o) {
    return (o instanceof Number n) ? n.longValue() : 0L;
  }
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 7 — The cached service</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/cost/SupportService.java">{`package com.example.cost;

import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class SupportService {

  // Pad it out so we exceed the 1024-token cache minimum.
  // In a real app this would be your actual policy/FAQ doc.
  private static final String SYSTEM = """
      You are a customer support agent for Acme Inc.
      Tone: warm, efficient, never use exclamation marks.
      Always respond in 2-3 sentences.

      Below is the company FAQ. Use it as authoritative reference; do not invent answers.

      Q: How do I reset my password?
      A: Visit acme.example.com/reset and follow the email instructions.
      Q: Where is my order?
      A: Check the tracking link in your confirmation email.
      Q: What's your refund policy?
      A: 30 days, no questions asked, original payment method.
      Q: Do you ship internationally?
      A: Yes, to 47 countries; shipping fee is calculated at checkout.
      Q: How do I contact a human?
      A: Email support@acme.example.com or call +1-555-ACME during business hours.
      """ + " ".repeat(2000);    // pad to ensure we cross the cache-minimum threshold

  private final ChatClient chat;

  public SupportService(ChatClient.Builder builder, CostAdvisor costAdvisor) {
    this.chat = builder
        .defaultSystem(SYSTEM)
        .defaultOptions(AnthropicChatOptions.builder()
            .cacheTtl(AnthropicApi.CacheTtl.MINUTES_5)
            .build())
        .defaultAdvisors(costAdvisor)
        .build();
  }

  public String ask(String question) {
    return chat.prompt().user(question).call().content();
  }
}`}</CodeBlock>

        <Callout variant="warn" title="That .repeat(2000) is for the demo">
          <p>
            We pad the system prompt with whitespace so it&apos;s definitely above the 1024-token cache minimum (otherwise nothing caches and the demo doesn&apos;t demonstrate). In a real app, your system prompt + tool defs + few-shot will easily exceed the threshold without padding. Remove the pad once your prompt is naturally long.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 8 — The dashboard controller</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/cost/DashboardController.java">{`package com.example.cost;

import org.springframework.web.bind.annotation.*;

@RestController
public class DashboardController {

  private final SupportService support;
  private final CostTracker tracker;

  public DashboardController(SupportService support, CostTracker tracker) {
    this.support = support;
    this.tracker = tracker;
  }

  @PostMapping("/ask")
  public AnswerResponse ask(@RequestParam String q) {
    String reply = support.ask(q);
    return new AnswerResponse(reply);
  }

  @GetMapping("/stats")
  public CostTracker.Stats stats() {
    return tracker.snapshot();
  }

  public record AnswerResponse(String reply) {}
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 9 — Static dashboard page</h3>
        <CodeBlock lang="plain" caption="src/main/resources/static/index.html">{`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>LLM Cost Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid #eee; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .ratio { font-weight: 600; color: #047857; }
  </style>
</head>
<body>
  <h1>LLM cost dashboard</h1>
  <p>Click <b>Ask</b> repeatedly. Watch cache reads grow and $/call drop after the first call.</p>
  <input id="q" value="How do I reset my password?" size="50">
  <button id="ask">Ask</button>
  <button id="ask10">Ask × 10</button>
  <pre id="reply" style="background:#f6f6f6;padding:.6rem;margin-top:.6rem;min-height:3rem;"></pre>

  <h2>Stats</h2>
  <table id="stats"></table>

  <script>
    const $ = (id) => document.getElementById(id);
    async function ask() {
      const q = encodeURIComponent($("q").value);
      const r = await fetch("/ask?q=" + q, { method: "POST" });
      const j = await r.json();
      $("reply").textContent = j.reply;
      refresh();
    }
    async function refresh() {
      const r = await fetch("/stats");
      const s = await r.json();
      const rows = [
        ["Calls",                 s.calls],
        ["Input tokens",          s.inputTokens],
        ["Output tokens",         s.outputTokens],
        ["Cache write tokens",    s.cacheWriteTokens],
        ["Cache read tokens",     s.cacheReadTokens],
        ["Total spend (USD)",     "$" + s.totalUsd.toFixed(4)],
        ["Avg $ per call",        "$" + (s.calls ? (s.totalUsd / s.calls) : 0).toFixed(5)],
        ["Cache hit ratio",       (s.cacheHitRatio * 100).toFixed(1) + "%"],
      ];
      $("stats").innerHTML = rows.map(
        ([k, v]) => '<tr><th>' + k + '</th><td class="num ' + (k === "Cache hit ratio" ? "ratio" : "") + '">' + v + '</td></tr>'
      ).join("");
    }
    $("ask").onclick = ask;
    $("ask10").onclick = async () => { for (let i = 0; i < 10; i++) await ask(); };
    refresh();
  </script>
</body>
</html>`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 10 — Run it</h3>
        <CodeBlock lang="plain">{`./mvnw spring-boot:run`}</CodeBlock>

        <p className="mt-3">Open <a className="text-indigo-600 hover:underline" href="http://localhost:8080" target="_blank" rel="noreferrer">http://localhost:8080</a>. Click <strong>Ask</strong>{" "}once — you&apos;ll see Calls=1, Cache writes &gt; 0, Cache reads = 0. Click <strong>Ask × 10</strong> — watch cache hit ratio climb and avg $/call drop substantially.</p>

        <p className="mt-3">Expected pattern after one warm-up call + 10 more:</p>
        <CodeBlock lang="plain">{`Calls                11
Input tokens         ~150         (just the user messages)
Output tokens        ~700
Cache write tokens   ~2400        (the system prompt, written once)
Cache read tokens    ~24000       (the system prompt, read 10x)
Total spend (USD)    ~$0.022
Avg $ per call       ~$0.002
Cache hit ratio      ~90%`}</CodeBlock>

        <p className="mt-3">
          Without caching, those 10 follow-up calls would have re-billed the 2400-token system prompt at full input rate every time — roughly 5x more expensive.
        </p>

        <Callout variant="warn" title="Common errors & fixes">
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li><strong>Cache write tokens stays 0</strong> — your system prompt is below the 1024-token cache minimum. Add more padding or use a real long prompt.</li>
            <li><strong>Cache read tokens stays 0 across many calls</strong> — something in the prefix changes each call. The system prompt should be a static constant; check that nothing dynamic (timestamp, user info) is leaking into <code>defaultSystem()</code>.</li>
            <li><strong>NullPointerException reading nativeUsage</strong> — older Spring AI returns null instead of an empty map. The advisor handles this with the <code>instanceof Map</code> guard; ensure you&apos;re on a recent 1.0.x.</li>
            <li><strong>Stats endpoint shows 4xx</strong> — you forgot the <code>spring-boot-starter-web</code> dep. The pre-filled Initializr link includes it.</li>
          </ul>
        </Callout>

        <Checkpoint moduleSlug="prompt-caching" id="project" title="Project: cost dashboard" xp={50} manual manualLabel="Cache hits incoming">
          <p>
            Run a sustained burst of asks. Watch the cache hit ratio asymptote toward something like 90%+ as cache reads dominate. This is exactly the instrumentation you need in production: when somebody silently breaks the cache, your hit ratio dashboard tells you within minutes instead of via a finance ticket weeks later.
          </p>
        </Checkpoint>
      </section>

      {/* ===================== Part 6: Final Quiz ===================== */}
      <section id="final">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final quiz"
          question="A teammate proposes 'let's just use Redis to cache our LLM responses by question hash and skip the API entirely on duplicates.' How is that different from API prompt caching, and is it a good idea?"
          options={[
            { label: "Same thing — both cache prompts", explanation: "Very different. Anthropic's prompt caching caches the encoded prefix server-side and still produces a fresh generation. Response caching skips generation entirely." },
            { label: "Different layers — response caching avoids the API entirely on identical questions; prompt caching reuses prefix encoding within the API. Response caching is fine for FAQs but dangerous for personalized or live-data answers", correct: true, explanation: "Right. They compose: hash-based response cache for truly identical questions; prompt caching for the system/tool prefix on actual generations. Just be ruthless about which questions are 'truly identical' — anything personalized, anything depending on live data, must skip the response cache." },
            { label: "Response caching is illegal under the Anthropic ToS", explanation: "Caching responses your code received is fine. It's just a product decision about staleness, not a policy issue." },
            { label: "Always do both — there's no downside", explanation: "Response caching has real risks (stale answers, personalization leaks) that don't apply to prompt caching. They aren't equivalent in safety." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You shipped prompt caching three months ago. Today's bill report shows cost is up 15% with no traffic increase. Where do you look first?"
          options={[
            { label: "Anthropic's pricing page", explanation: "Pricing changes are usually announced and noticeable; possible but not the best first hypothesis." },
            { label: "Cache hit ratio metric — if it dropped, somebody changed a system prompt or tool def, busting the prefix", correct: true, explanation: "Right. The fastest way to a 15% bill increase is a tiny edit to a cached system prompt — every request now writes a fresh cache (~25% premium) instead of reading. git log on the prompt source file is your second stop." },
            { label: "Check if memory advisor is running", explanation: "Possible but secondary. Cache hit ratio is the cleanest signal for this class of regression." },
            { label: "Run a load test", explanation: "A load test won't tell you why steady-state cost grew." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="The 1-hour cache tier is more expensive per write but reads at the same rate as the 5-min tier. When should you reach for it?"
          options={[
            { label: "Always — 1 hour > 5 minutes", explanation: "1-hour writes have a higher premium; if traffic is high enough that 5-min already stays warm, you're paying extra for nothing." },
            { label: "When your prefix has bursty traffic — long quiet periods (>5 min) followed by activity, where 5-min would expire and re-write", correct: true, explanation: "Right. The 1-hour tier is for low-traffic but high-value cache prefixes — e.g., an admin tool used a few times an hour, a niche enterprise feature, a scheduled job. If 5-min stays warm at your traffic level, prefer 5-min." },
            { label: "Only for development", explanation: "It's a production tier with real billing implications, not a dev toggle." },
            { label: "Never — it's deprecated", explanation: "1-hour is a real published tier as of writing." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="Cache_control is opt-in, but a teammate suggests setting it on every prompt 'just in case.' What's wrong with that?"
          options={[
            { label: "It's strictly better — you can't lose by enabling it", explanation: "You can lose. Cache writes carry a premium; if a prefix never repeats, you pay the premium for nothing." },
            { label: "Marking volatile or unique-per-request prefixes still incurs cache write premiums on every call without ever producing a hit — strictly worse than no cache", correct: true, explanation: "Right. Caching is only a win when prefixes repeat. For ad-hoc one-off prompts, dynamic per-user content above the breakpoint, or prompts shorter than the cache minimum, opt out. Cache where things repeat; don't cache where they don't." },
            { label: "Anthropic charges flat fee for using cache_control", explanation: "There's no flat fee — it's per-token with the write premium and read discount." },
            { label: "It triggers stricter rate limits", explanation: "No special rate limits apply to cached vs. uncached requests." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="What's the ONE thing every Spring AI service that calls Claude in production should have, regardless of whether you use prompt caching?"
          options={[
            { label: "A circuit breaker", explanation: "Useful, but not the top priority for cost control." },
            { label: "An advisor that records per-call usage and computes cost from rates — so cost regressions are caught in metrics, not via finance review", correct: true, explanation: "Right. Without per-call cost tracking, prompt caching gains, regressions, runaway memory windows, and tool-loop blowups all hide until the monthly bill arrives. Instrument first; optimize second. Module 10's advisor pattern + this module's cost math is everything you need." },
            { label: "Streaming responses", explanation: "Streaming is a UX choice, not a cost-control mechanism." },
            { label: "A retry policy", explanation: "Useful, but doesn't surface costs." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="prompt-caching" id="final" title="Final quiz" xp={60} celebration="Phase 2 complete! You shipped five Spring Boot AI projects. +60 XP">
          <p>
            That&apos;s Phase 2 done. You can now: hit the Anthropic API directly (Module 9), use Spring AI for memory and structured output (Module 10), expose your code to the model via tool use (Module 11), stream responses end-to-end (Module 12), and run all of it within sane cost bounds (Module 13). Phase 3 takes everything you built and adds <strong>retrieval</strong> — vector search, embeddings at scale, and full RAG pipelines in Spring Boot.
          </p>
        </Checkpoint>
      </section>

      <div className="mt-12 flex justify-between border-t border-slate-200 pt-8 text-sm dark:border-slate-800">
        <Link href="/courses/ai/modules/streaming" className="text-indigo-600 hover:underline">← Module 12: Streaming</Link>
        <Link href="/courses/ai/modules/embeddings-deep" className="text-indigo-600 hover:underline">Module 15: Embeddings deep dive →</Link>
      </div>
        <ModuleNav courseId="ai" currentSlug="prompt-caching" />
    </article>
  );
}
