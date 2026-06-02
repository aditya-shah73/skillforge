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
  { id: "chatclient-deep", title: "ChatClient deep dive" },
  { id: "memory", title: "Conversation memory" },
  { id: "structured-output", title: "Structured output" },
  { id: "advisors", title: "Advisors" },
  { id: "project", title: "Project: journal assistant" },
  { id: "final", title: "Final quiz" },
];

export default function SpringAiModule() {
  const mod = getModuleBySlug("spring-ai")!;

  const advisorChainDiagram = `
flowchart LR
    A[Your code:<br/>chatClient.prompt...] --> B[Advisor 1<br/>SimpleLogger]
    B --> C[Advisor 2<br/>MessageChatMemory]
    C --> D[Advisor 3<br/>YourCustomAdvisor]
    D --> E[Anthropic API]
    E --> D2[Advisor 3<br/>after-hook]
    D2 --> C2[Advisor 2<br/>persists reply]
    C2 --> B2[Advisor 1<br/>logs response]
    B2 --> F[Returned to caller]
    style C fill:#fbbf24,color:#000
    style C2 fill:#fbbf24,color:#000
    style E fill:#818cf8,color:#fff
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
          Spring AI integration
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          The Spring-native way to call LLMs, memory, structured output, advisors, all the leverage.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="spring-ai" />
        <ModuleProgress moduleSlug="spring-ai" checkpoints={CHECKPOINTS} />
      </header>

      <Callout variant="insight" title="What changes from Module 9">
        <p className="m-0">
          Module 9 was &quot;one prompt in, one string out&quot;, the API at its simplest. This module is the rest of Spring AI: keeping conversation history without rebuilding it by hand, getting <em>typed Java objects</em>{" "}back instead of raw strings, and intercepting calls with advisors (Spring AI&apos;s middleware). By the end you&apos;ll have a multi-turn journal assistant that remembers what you wrote, returns sentiment as a typed record, and logs every call through an advisor.
        </p>
      </Callout>

      {/* ============================================================ */}
      {/* PART 1: ChatClient deep dive                                  */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="chatclient-deep" title="ChatClient deep dive" xp={15} celebration="ChatClient locked in. The fluent API isn't magic, it's a builder pattern.">
      <section>
        <h2>Part 1: <code>ChatClient</code>, properly</h2>

        <p>
          In Module 9 we used <code>chatClient.prompt().system(...).user(...).call().content()</code> as a black box. Time to see what it actually is. <code>ChatClient</code> is a Spring AI fluent builder that hides three things: <strong>request shaping</strong>, <strong>provider transport</strong>, and <strong>response unwrapping</strong>.
        </p>

        <h3>The fluent chain, broken apart</h3>

        <CodeBlock lang="java" caption="What each method actually does">{`String reply = chatClient
    .prompt()                       // 1. Start a ChatClientRequestSpec — mutable request builder.
    .system("Be terse.")            // 2. Sets the top-level system parameter on the API request.
    .user("Summarize: " + text)     // 3. Adds a user-role message to the messages array.
    .options(ChatOptions.builder()  // 4. Per-call overrides for temperature, max_tokens, model, etc.
        .temperature(0.0)
        .build())
    .call()                         // 5. Synchronously POSTs to api.anthropic.com/v1/messages.
                                    //    Returns a CallResponseSpec.
    .content();                     // 6. Pulls .text out of the response. Convenience for
                                    //    .chatResponse().getResult().getOutput().getText().`}</CodeBlock>

        <p>
          The whole thing is sugar over building an HTTP request, sending it, and unwrapping the JSON. You can drop down at any layer:
        </p>

        <ul>
          <li><code>.content()</code> → just the text. Use when you don&apos;t care about metadata.</li>
          <li><code>.chatResponse()</code> → full <code>ChatResponse</code> with usage metadata, finish reason, all generations.</li>
          <li><code>.entity(SomeClass.class)</code> → the model&apos;s output parsed into a typed Java object (Part 3).</li>
          <li><code>.stream()</code> instead of <code>.call()</code> → reactive <code>Flux&lt;String&gt;</code> for token-by-token (Module 12).</li>
        </ul>

        <h3>Why <code>ChatClient.Builder</code>, not <code>ChatClient</code> directly?</h3>

        <p>
          Notice the constructor in Module 9 took <code>ChatClient.Builder builder</code>, not <code>ChatClient</code>. Why? Because <code>ChatClient</code> instances are <strong>configured up front</strong>{" "}with defaults, default system prompt, default options, default advisors. Different parts of your app might want different defaults. Spring autoconfigures the <em>builder</em>{" "}as a singleton bean; each <code>@Service</code> calls <code>.build()</code> to mint its own configured client.
        </p>

        <CodeBlock lang="java" caption="One builder, many configured clients">{`@Service
public class TerseSummarizer {
    private final ChatClient chatClient;
    public TerseSummarizer(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You produce one-sentence summaries. No fluff.")
            .defaultOptions(ChatOptions.builder().temperature(0.2).build())
            .build();
    }
    // Now every call from this service inherits those defaults.
    // No need to repeat .system(...) and .options(...) on every prompt().
}

@Service
public class CreativeWriter {
    private final ChatClient chatClient;
    public CreativeWriter(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You are a fiction writer. Vivid, concrete, no clichés.")
            .defaultOptions(ChatOptions.builder().temperature(0.9).build())
            .build();
    }
}`}</CodeBlock>

        <Callout variant="info" title="Defaults vs per-call overrides">
          <p className="m-0">
            Anything set with <code>.defaultXxx()</code> on the builder applies to every call from that <code>ChatClient</code>. Anything set inside <code>.prompt()...</code> overrides for that one call. Standard config-precedence pattern: the more specific call wins.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You inject ChatClient.Builder (not ChatClient) into your service. Why does Spring AI design it this way?"
          options={[
            { label: "ChatClient is too expensive to construct, the builder is cheaper", explanation: "Construction cost isn't the issue. ChatClient is a thin wrapper; building one is fast." },
            { label: "Different services need different defaults (system prompt, temperature, advisors), so each service builds its own configured client from a shared builder", correct: true, explanation: "Right. The builder is the shared singleton; each @Service calls .build() to mint a client tuned for its job. A summarizer service wants temperature 0.2 and a 'be terse' system prompt; a creative-writer service wants temperature 0.9 and a different persona. Both share the same underlying transport, just configured differently." },
            { label: "Spring requires every fluent API to be constructed via a builder", explanation: "Spring has no such requirement. This is a deliberate choice for ChatClient specifically." },
            { label: "ChatClient is mutable and Spring beans must be immutable", explanation: "ChatClient instances are effectively immutable once built. Spring beans aren't required to be immutable either." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 1 recap"
        gist="ChatClient is a fluent builder over HTTP. .call() is sync, .stream() is reactive, .entity(Class) is typed, .content() is the string."
        points={[
          { takeaway: "The fluent chain (.prompt().system().user().call().content()) is sugar over building a JSON request and unwrapping the response.", detail: "You can drop down to .chatResponse() to see usage metadata, finish reason, and all generations, useful for billing dashboards and debugging." },
          { takeaway: "Inject ChatClient.Builder, then call .build() in each @Service to make a configured client.", detail: "Different services need different defaults. The builder is the shared singleton bean; .defaultSystem() and .defaultOptions() bake in per-service config once instead of repeating it on every call." },
          { takeaway: ".defaultXxx() is the baseline, per-call .system()/.options() override.", detail: "Standard config-precedence: the more specific call wins. This means you can have a 'terse' service default and still pass .options(temperature(0.7)) for one chatty call." },
          { takeaway: "The same fluent API works for any Spring AI provider (Anthropic, OpenAI, Ollama).", detail: "Swap the starter dep, your service code doesn't change. This is the abstraction Spring AI sells: same Java, different model behind it." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 2: MEMORY                                                */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="memory" title="Conversation memory" xp={20} celebration="You can hold a conversation across turns without rebuilding the message array. That's a Module 9 callback well used.">
      <section>
        <h2>Part 2: Conversation memory (without doing it by hand)</h2>

        <p>
          Recall from Module 9: the API is stateless. To hold a conversation, <em>you</em>{" "}have to keep the message array and re-send it every turn. Doing this by hand is annoying and error-prone, you have to thread the list through your code, append the assistant&apos;s reply, manage truncation when it gets long.
        </p>

        <p>
          Spring AI has a primitive for this: <code>ChatMemory</code>. It&apos;s a key-value store where the key is a conversation ID and the value is the message history for that conversation. Plug it in via an advisor (Part 4) and your service stops thinking about message arrays entirely.
        </p>

        <h3>The three implementations you&apos;ll see</h3>

        <div className="not-prose my-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-sm font-bold"><code>InMemoryChatMemoryRepository</code></div>
            <div className="space-y-1.5 text-xs">
              <div>HashMap. Lost on restart.</div>
              <div>Use for: dev, tests, single-instance prototypes.</div>
              <div>Bad for: anything multi-instance or meant to outlive a JVM.</div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-sm font-bold"><code>JdbcChatMemoryRepository</code></div>
            <div className="space-y-1.5 text-xs">
              <div>Postgres / MySQL / etc.</div>
              <div>Use for: production. Survives restarts, multi-instance safe.</div>
              <div>Spring AI ships the schema; bootstrap with <code>spring.ai.chat.memory.repository.jdbc.initialize-schema=embedded</code> (or use Flyway/Liquibase yourself if you already have them).</div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-1 text-sm font-bold"><code>CassandraChatMemoryRepository</code></div>
            <div className="space-y-1.5 text-xs">
              <div>For when chat history is genuinely huge.</div>
              <div>Use for: scale where Postgres would buckle.</div>
              <div>Most apps don&apos;t need this.</div>
            </div>
          </div>
        </div>

        <h3>Window vs message-count memory</h3>

        <p>
          Once you have a repository, you wrap it with a <code>ChatMemory</code> implementation that decides <em>which</em>{" "}messages to include in the next call:
        </p>

        <ul>
          <li><code>MessageWindowChatMemory</code>, keep the last N messages, drop older ones. Simple, predictable cost.</li>
          <li>Custom, implement <code>ChatMemory</code> yourself if you want token-bucket logic, summary-of-old-turns, etc.</li>
        </ul>

        <Callout variant="warn" title="Memory is a token-cost trap">
          <p className="m-0">
            Every turn re-bills you for the entire window as input tokens. A 50-turn conversation at ~200 tokens/turn means turn 50 sends ~10,000 input tokens. Use a finite window (10–20 turns is typical), and combine with prompt caching (Module 13) so the older turns don&apos;t hit pricing on every call.
          </p>
        </Callout>

        <h3>How it wires up</h3>

        <CodeBlock lang="java" caption="MemoryConfig.java, wire memory into your ChatClient">{`package com.example.journal;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// @Configuration = a class that defines @Bean methods. Spring evaluates each
// @Bean at startup and registers the return value in the ApplicationContext.
@Configuration
public class MemoryConfig {

    // The repository is the storage layer. Swap to JdbcChatMemoryRepository
    // for production — same interface, different backend.
    @Bean
    public ChatMemoryRepository chatMemoryRepository() {
        return new InMemoryChatMemoryRepository();
    }

    // The window decides which subset of stored messages goes back to the model.
    // 20 messages = ~10 turns = ~2K input tokens at typical chat lengths.
    // Older messages stay in the repository (so you can show full history in a
    // UI), but they don't get sent to the model on each call.
    @Bean
    public ChatMemory chatMemory(ChatMemoryRepository repo) {
        return MessageWindowChatMemory.builder()
            .chatMemoryRepository(repo)
            .maxMessages(20)
            .build();
    }
}`}</CodeBlock>

        <p>
          Then in your service you attach it via <code>MessageChatMemoryAdvisor</code>:
        </p>

        <CodeBlock lang="java" caption="JournalService.java, using the memory">{`@Service
public class JournalService {
    private final ChatClient chatClient;

    public JournalService(ChatClient.Builder builder, ChatMemory chatMemory) {
        this.chatClient = builder
            .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
            .build();
    }

    public String reply(String conversationId, String userMessage) {
        return chatClient.prompt()
            .user(userMessage)
            // Tell the advisor which conversation this is. The advisor uses
            // this ID to look up history before the call and persist the new
            // turn after.
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .call()
            .content();
    }
}`}</CodeBlock>

        <p>
          That&apos;s it. No message-array threading, no manual append. The advisor reads history from the repo before each call, injects it into the request, and writes the new user message + assistant reply back after.
        </p>

        <Quiz
          kind="Quick check"
          question="You set up MessageWindowChatMemory with maxMessages=10. The user has had 25 turns. What goes back to the model on turn 26?"
          options={[
            { label: "All 25 turns plus the new one, the window is just for storage", explanation: "Other way around: storage keeps everything, window decides what's sent. The whole point is to bound per-call token cost." },
            { label: "The last 10 messages from the conversation, plus the new user message", correct: true, explanation: "Right. The repository keeps all 25 turns (so you can show full history in a UI), but the window advisor only sends the last 10 to the model. This bounds per-call input tokens regardless of how long the conversation gets." },
            { label: "A summary of all 25 turns", explanation: "MessageWindowChatMemory doesn't summarize, it just truncates. If you want summary-of-old-turns behavior, you implement custom ChatMemory logic." },
            { label: "Just the new user message, older turns are dropped after the window fills", explanation: "Without history the model has no context. The window keeps the most recent N, not zero." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why does ChatMemory require a conversation ID per call?"
          options={[
            { label: "For audit logging, Spring AI logs every call against the ID", explanation: "The ID isn't primarily for logging; it's the key into the memory store." },
            { label: "Because the memory store is keyed by ID, different users, sessions, or tabs need separate histories", correct: true, explanation: "Right. The repository is a Map<conversationId, List<Message>>. Without an ID, two users would share one conversation. Typical IDs: a session token, a chat thread UUID, or a user ID for single-thread-per-user apps." },
            { label: "Anthropic requires it on every call", explanation: "Anthropic's API has no notion of conversation IDs, it's stateless. The ID is purely a Spring AI client-side concept." },
            { label: "It's used as a cache key for prompt caching", explanation: "Prompt caching uses the prompt content itself as the cache key (Module 13), not the conversation ID." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 2 recap"
        gist="ChatMemory + MessageChatMemoryAdvisor turn the stateless API into a stateful chat without touching the message array yourself."
        points={[
          { takeaway: "ChatMemoryRepository = storage; ChatMemory = which subset to send.", detail: "Repository keeps everything (so you can show full UI history); ChatMemory decides what goes on the wire each call. Standard separation: storage policy vs retrieval policy." },
          { takeaway: "InMemory for dev, JDBC for prod, Cassandra for scale.", detail: "All three implement ChatMemoryRepository. Swap them via a single @Bean change, your service code doesn't move." },
          { takeaway: "MessageWindowChatMemory keeps the last N messages and drops older ones.", detail: "Predictable per-call token cost. For nuanced strategies (summary-of-old-turns, token-budget windowing), implement ChatMemory yourself." },
          { takeaway: "Conversation ID is the key into the store; pass it via advisor params on each call.", detail: "Without it, all users share one conversation. Use a session token, thread UUID, or user ID depending on your app's threading model." },
          { takeaway: "Memory has a per-call cost, every turn re-bills the window as input tokens.", detail: "20-message window × 100 tokens × 50 turns = 100K input tokens just for memory. Module 13's prompt caching is the standard fix." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 3: STRUCTURED OUTPUT                                     */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="structured-output" title="Structured output" xp={20} celebration="You can get typed Java objects out of an LLM. This is the unlock that makes LLMs feel like normal services.">
      <section>
        <h2>Part 3: Typed output, <code>.entity(MyClass.class)</code></h2>

        <p>
          Half the time you call an LLM, you don&apos;t want prose. You want a <em>structured answer</em>, extracted fields, a classification, a sentiment score, a JSON object. The naive approach is &quot;ask for JSON in the system prompt, then <code>ObjectMapper.readValue</code> the response.&quot; This works ~85% of the time and fails in obvious ways: the model adds a markdown fence, prefixes &quot;Sure, here&apos;s the JSON:&quot;, or includes a trailing comma.
        </p>

        <p>
          Spring AI has a one-call solution: <code>.entity(MyDto.class)</code>. Under the hood it (1) generates a JSON Schema from your class, (2) appends &quot;return JSON matching this schema&quot; to the prompt, and (3) parses the response back into your class, with retries if the parse fails.
        </p>

        <h3>The simplest example</h3>

        <CodeBlock lang="java" caption="Typed sentiment analysis in 3 lines">{`// 1. Define the shape you want as a record (or a regular class with getters).
public record Sentiment(
    String overallTone,         // "positive", "negative", "neutral"
    double confidence,          // 0.0 to 1.0
    List<String> keyEmotions    // e.g. ["frustrated", "hopeful"]
) {}

// 2. Ask for it.
Sentiment result = chatClient.prompt()
    .user("Analyze sentiment: " + journalEntry)
    .call()
    .entity(Sentiment.class);

// 3. Use it like any Java object.
if (result.confidence() > 0.8 && result.overallTone().equals("negative")) {
    // ...
}`}</CodeBlock>

        <p>
          You never wrote &quot;return JSON&quot; in a prompt. Spring AI did. You never called <code>ObjectMapper</code>. Spring AI did. The result is type-safe at the call site and the model is way more likely to comply because it received an actual schema, not a hopeful string.
        </p>

        <h3>What gets sent to the model</h3>

        <p>
          Curious? Here&apos;s (approximately) the prompt Spring AI builds when you call <code>.entity(Sentiment.class)</code>:
        </p>

        <CodeBlock lang="plain" caption="The prompt Spring AI actually sends">{`Analyze sentiment: <your journal entry here>

Your response should be in JSON format.
Do not include any explanations, only provide a RFC8259 compliant
JSON response following this format without deviation.

{
  "type": "object",
  "properties": {
    "overallTone": { "type": "string" },
    "confidence": { "type": "number" },
    "keyEmotions": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "required": ["overallTone", "confidence", "keyEmotions"]
}`}</CodeBlock>

        <Callout variant="info" title="Records, classes, generics, they all work">
          <p className="m-0">
            <code>.entity(Sentiment.class)</code> works with records, POJOs, classes with Lombok, anything Jackson can deserialize. For a list of objects use <code>.entity(new ParameterizedTypeReference&lt;List&lt;Sentiment&gt;&gt;() {})</code>. For a Map use the same pattern with <code>Map&lt;String, X&gt;</code>.
          </p>
        </Callout>

        <h3>When to use <code>.entity(...)</code> vs <code>.content()</code></h3>

        <div className="not-prose my-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Use .entity(...) when</div>
            <ul className="m-0 list-disc pl-4 text-sm">
              <li>The result is data, not prose (extraction, classification, scoring).</li>
              <li>Downstream code will call <code>.field()</code> on it.</li>
              <li>You&apos;d otherwise be parsing strings.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Use .content() when</div>
            <ul className="m-0 list-disc pl-4 text-sm">
              <li>The output is meant for a human (chat, summaries, code review).</li>
              <li>The shape is loose / variable.</li>
              <li>You want the model to use markdown formatting.</li>
            </ul>
          </div>
        </div>

        <Callout variant="warn" title="It can still fail">
          <p className="m-0">
            <code>.entity(...)</code> is high-reliability, not bulletproof. The model can still produce schema-violating output, especially for deeply nested structures or with smaller models. Wrap calls in try/catch for <code>JsonProcessingException</code> in production paths, or use Spring AI&apos;s retry advisor to auto-retry parse failures with the exception fed back as feedback to the model.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question={`You call .entity(Receipt.class) where Receipt has a 'total' field of type double. The model returns {"total": "42.50"} (string instead of number). What happens?`}
          options={[
            { label: "Spring AI silently coerces the string to a double, it works", explanation: "Jackson does have lenient string-to-number coercion in some configurations, but Spring AI's default ObjectMapper isn't configured permissively, so this typically throws." },
            { label: "Jackson throws a JsonProcessingException, which Spring AI surfaces as an exception", correct: true, explanation: "Right. The schema said 'number', the model returned a string, Jackson rejects it. Catch the exception in production. Better: wrap with Spring AI's retry advisor, which feeds the parse error back to the model, it usually self-corrects on retry." },
            { label: "The field gets set to 0.0 with a warning logged", explanation: "Spring AI doesn't silently default fields. Bad data raises an exception so you don't ship corrupted records." },
            { label: "The Anthropic API rejects the call before returning", explanation: "Anthropic doesn't validate against client-side schemas. Schema enforcement is a Spring AI concern, not an API concern." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="You want the LLM to extract a list of action items from a meeting transcript. What's the right .entity(...) call?"
          options={[
            { label: ".entity(ActionItem[].class)", explanation: "Java arrays work but parameterized types are cleaner and Spring AI's docs use the ParameterizedTypeReference form for List<T> specifically." },
            { label: ".entity(new ParameterizedTypeReference<List<ActionItem>>() {})", correct: true, explanation: "Right. Generics are erased at runtime, so for List<X> you need a TypeReference to preserve the type info. Spring AI handles this and lets you stream straight into a List<ActionItem>." },
            { label: ".entity(List.class)", explanation: "List.class throws away the element type, Spring AI can't know what to deserialize each element into. You'd get a List of LinkedHashMaps." },
            { label: ".content() and then ObjectMapper.readValue(json, new TypeReference<List<ActionItem>>(){})", explanation: "This works but defeats the whole point of .entity(), you're back to manual parsing, and the model didn't get the schema in its prompt." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 3 recap"
        gist=".entity(Class) gets typed Java objects out of LLMs. Spring AI generates the schema, appends it to the prompt, and parses the reply."
        points={[
          { takeaway: "Use .entity(MyClass.class) when the result is data, not prose.", detail: "Extraction, classification, scoring, structured replies. The call returns a typed object, no manual JSON parsing, no ad-hoc string instructions." },
          { takeaway: "Spring AI generates a JSON Schema from your class and appends 'return JSON matching this' to the prompt.", detail: "You never hand-write 'return JSON' instructions. The schema comes from your record/POJO definition, so the model and your parser agree on the shape." },
          { takeaway: "For generic collections use ParameterizedTypeReference: .entity(new ParameterizedTypeReference<List<X>>() {}).", detail: "Java generics are erased at runtime; the TypeReference preserves them so Spring AI can deserialize element-by-element." },
          { takeaway: ".entity() can still fail, wrap in try/catch or use a retry advisor.", detail: "The model occasionally produces schema-violating output (especially nested types or smaller models). Spring AI's retry advisor feeds the parse error back to the model on the next attempt, usually self-corrects." },
          { takeaway: ".content() for prose, .entity() for data. Use the right one.", detail: "Prose responses (chat, summaries) shouldn't be coerced into structures. Structured responses shouldn't be left as strings for downstream code to parse. Pick based on what consumes the output." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 4: ADVISORS                                              */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="advisors" title="Advisors" xp={20} celebration="Advisors clicked. You see Spring AI's middleware now, same shape as servlet filters, MVC interceptors, RxJava operators.">
      <section>
        <h2>Part 4: Advisors, middleware for LLM calls</h2>

        <p>
          You&apos;ve already used one advisor: <code>MessageChatMemoryAdvisor</code> in Part 2. An advisor is Spring AI&apos;s name for a <strong>middleware that wraps every <code>ChatClient</code> call</strong>. It runs before the request goes out, and again on the way back, with full access to mutate either side. If you&apos;ve used servlet filters, MVC interceptors, or RxJava operators, same idea, same shape.
        </p>

        <h3>What advisors are good for</h3>

        <ul>
          <li><strong>Cross-cutting concerns</strong>: logging, metrics, tracing, audit trails.</li>
          <li><strong>Memory</strong>: Spring AI&apos;s built-in <code>MessageChatMemoryAdvisor</code>.</li>
          <li><strong>Retry on parse failure</strong>: <code>RetryAdvisor</code> for <code>.entity()</code> calls.</li>
          <li><strong>RAG</strong>: <code>QuestionAnswerAdvisor</code> in Module 17, auto-retrieves docs and stuffs them into the prompt.</li>
          <li><strong>Guardrails</strong>: redact PII, block prompt injections, enforce safety policies.</li>
          <li><strong>Caching</strong>: short-circuit repeat calls before they hit the API.</li>
        </ul>

        <h3>How an advisor chain works</h3>

        <Mermaid chart={advisorChainDiagram} />

        <p>
          Each advisor sees the request on the way in, can modify it (add context, redact fields, log), passes it down the chain, then sees the response on the way out (parse failures trigger retries, log usage, persist to memory). Standard middleware pattern.
        </p>

        <h3>Writing a custom advisor</h3>

        <p>
          The interface has changed across Spring AI versions; current recommended is <code>CallAdvisor</code> (sync) or <code>StreamAdvisor</code> (async). Here&apos;s a logging advisor that times each call and prints token usage:
        </p>

        <CodeBlock lang="java" caption="LoggingAdvisor.java, a minimal custom advisor">{`package com.example.journal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.stereotype.Component;

@Component
public class LoggingAdvisor implements CallAdvisor {

    private static final Logger log = LoggerFactory.getLogger(LoggingAdvisor.class);

    // Order in the chain — lower runs first. Memory advisor is at 0;
    // we run after it so we log the actual prompt sent to the model.
    @Override public int getOrder() { return 100; }

    @Override public String getName() { return "LoggingAdvisor"; }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        long start = System.currentTimeMillis();

        // Pass the request down the chain. Whatever's after us (including the
        // actual API call) runs here. This is the around-the-call hook.
        ChatClientResponse response = chain.nextCall(request);

        long elapsed = System.currentTimeMillis() - start;
        // Pull usage out of the response metadata. Spring AI normalizes this
        // across providers — works the same for Anthropic, OpenAI, etc.
        var usage = response.chatResponse().getMetadata().getUsage();
        log.info("LLM call took {}ms · in={} tokens · out={} tokens",
            elapsed, usage.getPromptTokens(), usage.getCompletionTokens());

        return response;
    }
}`}</CodeBlock>

        <p>
          Drop this in your package. <code>@Component</code> registers it. Now wire it into the <code>ChatClient.Builder</code> as a default advisor and every call gets timed and token-counted automatically.
        </p>

        <CodeBlock lang="java" caption="Wiring the advisor in (in JournalService)">{`public JournalService(ChatClient.Builder builder, ChatMemory chatMemory, LoggingAdvisor loggingAdvisor) {
    this.chatClient = builder
        .defaultAdvisors(
            MessageChatMemoryAdvisor.builder(chatMemory).build(),
            loggingAdvisor   // runs after memory, sees the assembled prompt
        )
        .build();
}`}</CodeBlock>

        <Callout variant="insight" title="The mental model: advisor = aspect">
          <p className="m-0">
            If you&apos;ve written Spring AOP <code>@Around</code> aspects, advisors are the same concept scoped to <code>ChatClient</code>. Pre-call hook, post-call hook, ability to mutate both. Use them for anything that should apply to <em>every</em>{" "}call without duplicating the logic across services.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You want every LLM call to log token usage. Where does this logic live?"
          options={[
            { label: "Inside every @Service that calls chatClient, copy the logging block", explanation: "Cross-cutting concerns shouldn't be copied per service. That's exactly what advisors solve." },
            { label: "In a custom CallAdvisor wired as a defaultAdvisor on the builder", correct: true, explanation: "Right. The advisor runs around every call from any ChatClient built from that builder. One file, one place to change. Same pattern as servlet filters, MVC interceptors, AOP aspects, middleware for LLM calls." },
            { label: "In application.properties via spring.ai.logging.tokens=true", explanation: "Spring AI doesn't have a properties-based token logger. You write a small advisor, it's literally what they're for." },
            { label: "In the ChatClient itself by extending it", explanation: "ChatClient is final/sealed in Spring AI, the extension point is advisors specifically." },
          ]}
        />
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 4 recap"
        gist="Advisors are middleware for ChatClient. Pre-call hook, post-call hook, runs around every call. Same shape as servlet filters or AOP."
        points={[
          { takeaway: "Use advisors for anything cross-cutting: memory, logging, retries, RAG, guardrails, caching.", detail: "If the logic should apply to every call from a service (or every service), it belongs in an advisor. Don't copy logic across services." },
          { takeaway: "Implement CallAdvisor; override adviseCall(request, chain).", detail: "Modify request before chain.nextCall(request); modify response after. Same pattern as Spring AOP @Around or any middleware framework." },
          { takeaway: "Order matters; lower runs first in the chain.", detail: "Memory advisor is at order 0 (runs first, injects history into request). Custom logging at 100 sees the assembled prompt. RAG advisors typically run before memory so retrieved docs land in the messages array." },
          { takeaway: "Wire advisors via .defaultAdvisors(...) on the builder for service-wide, or .advisors(...) per-call.", detail: "Defaults apply to every call from that ChatClient. Per-call lets you add a one-off advisor (e.g., a debug logger for a specific path)." },
          { takeaway: "Built-ins cover most cases: MessageChatMemoryAdvisor, RetryAdvisor, QuestionAnswerAdvisor (Module 17).", detail: "Don't roll your own memory or RAG advisor, use Spring AI's. Custom advisors are for project-specific logic: your auth, your audit log, your rate limiter." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 5: PROJECT                                               */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="project" title="Project: journal assistant" xp={40} manual manualLabel="I built and ran it" celebration="A real multi-turn assistant with memory, structured output, and an advisor. Production-shaped Spring AI.">
      <section>
        <h2>Part 5: Project, Personal journal assistant</h2>

        <p>
          You&apos;re going to build a CLI journal assistant. The user types a journal entry. The app: (1) asks Claude to analyze sentiment and return a typed <code>Sentiment</code> record, (2) asks Claude to give a brief reflective response that <em>references previous entries</em>{" "}via memory, (3) logs every call through your custom advisor. All four Part-1-through-4 concepts in one project.
        </p>

        <h3>Step 0: Prerequisites</h3>

        <ul>
          <li>Same as Module 9: <strong>Java 21</strong>, <strong>Anthropic API key</strong> (export it as <code>ANTHROPIC_API_KEY</code>), an IDE (IntelliJ recommended).</li>
          <li>You&apos;ll set up a <em>new</em>{" "}project, separate from the code reviewer. We&apos;re keeping each phase project independent so you can come back to any of them cleanly.</li>
        </ul>

        <h3>Step 1: Scaffold the project</h3>

        <p>
          Same drill as Module 9, open <a href="https://start.spring.io" className="text-indigo-600 hover:underline" target="_blank" rel="noreferrer">start.spring.io</a> with these settings:
        </p>

        <ul>
          <li><strong>Project:</strong>{" "}Maven · <strong>Language:</strong>{" "}Java · <strong>Spring Boot:</strong>{" "}latest 3.4.x stable</li>
          <li><strong>Group:</strong> <code>com.example</code> · <strong>Artifact:</strong> <code>journal-assistant</code> · <strong>Package name:</strong> <code>com.example.journal</code></li>
          <li><strong>Java:</strong> 21 · <strong>Packaging:</strong>{" "}Jar</li>
          <li><strong>Dependencies:</strong> <em>Anthropic Claude</em></li>
        </ul>

        <Callout variant="info" title="Direct pre-filled link">
          <p className="m-0">
            <a
              href="https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.5.0&packaging=jar&jvmVersion=21&groupId=com.example&artifactId=journal-assistant&name=journal-assistant&description=Journal%20assistant%20with%20memory&packageName=com.example.journal&dependencies=spring-ai-anthropic"
              className="break-all text-indigo-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              start.spring.io/#!...&dependencies=spring-ai-anthropic
            </a>
          </p>
        </Callout>

        <p>Generate, unzip, open in IntelliJ, wait for Maven to finish.</p>

        <h3>Step 2: Set the API key</h3>

        <p>
          Same as Module 9, either <code>export ANTHROPIC_API_KEY=sk-ant-...</code> in your shell, or set the env var in IntelliJ&apos;s Run Configuration. (See Module 9, Step 3 if you need the full instructions.)
        </p>

        <h3>Step 3: <code>application.properties</code></h3>

        <CodeBlock lang="plain" caption="src/main/resources/application.properties">{`spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-5
spring.ai.anthropic.chat.options.temperature=0.5
spring.ai.anthropic.chat.options.max-tokens=1024

# Quiet logs so the CLI is readable
spring.main.banner-mode=off
logging.level.root=WARN
logging.level.com.example.journal=INFO`}</CodeBlock>

        <p>
          We use <code>temperature=0.5</code> here, a middle ground. Sentiment extraction (<code>.entity()</code>) wants 0; reflective replies want a bit more variety. We&apos;ll override per-call where it matters.
        </p>

        <h3>Step 4: <code>Sentiment.java</code>, the typed record</h3>

        <CodeBlock lang="java" caption="src/main/java/com/example/journal/Sentiment.java">{`package com.example.journal;

import java.util.List;

// Java record = compact immutable data class. Auto-generates constructor,
// getters (called overallTone(), confidence(), etc.), equals, hashCode,
// toString. Spring AI's .entity(Sentiment.class) reads these fields and
// generates a JSON Schema from them.
public record Sentiment(
    String overallTone,         // "positive", "negative", "neutral", "mixed"
    double confidence,          // 0.0 to 1.0
    List<String> keyEmotions    // e.g. ["frustrated", "hopeful", "anxious"]
) {}`}</CodeBlock>

        <h3>Step 5: <code>MemoryConfig.java</code></h3>

        <CodeBlock lang="java" caption="src/main/java/com/example/journal/MemoryConfig.java">{`package com.example.journal;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MemoryConfig {

    // In-memory store. For production, swap to JdbcChatMemoryRepository
    // and add spring-ai-starter-model-chat-memory-repository-jdbc — same
    // interface, different bean.
    @Bean
    public ChatMemoryRepository chatMemoryRepository() {
        return new InMemoryChatMemoryRepository();
    }

    // 20-message window = ~10 turns of context. Older messages stay in the
    // repository (for full UI history), but only recent ones go to the model.
    @Bean
    public ChatMemory chatMemory(ChatMemoryRepository repo) {
        return MessageWindowChatMemory.builder()
            .chatMemoryRepository(repo)
            .maxMessages(20)
            .build();
    }
}`}</CodeBlock>

        <h3>Step 6: <code>LoggingAdvisor.java</code></h3>

        <CodeBlock lang="java" caption="src/main/java/com/example/journal/LoggingAdvisor.java">{`package com.example.journal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.stereotype.Component;

// @Component = Spring picks this up by component scan and registers a singleton.
// We inject it into JournalService below.
@Component
public class LoggingAdvisor implements CallAdvisor {

    private static final Logger log = LoggerFactory.getLogger(LoggingAdvisor.class);

    // Order in the chain. Memory advisor runs at 0; we run at 100 so we see
    // the prompt AFTER memory has been injected. Lower numbers run first.
    @Override public int getOrder() { return 100; }
    @Override public String getName() { return "LoggingAdvisor"; }

    @Override
    public ChatClientResponse adviseCall(ChatClientRequest request, CallAdvisorChain chain) {
        long start = System.currentTimeMillis();

        // chain.nextCall(request) runs everything downstream of us — including
        // the actual HTTP call to Anthropic — and returns when it's done.
        // This is the "around" hook: we get to see request and response.
        ChatClientResponse response = chain.nextCall(request);

        long elapsed = System.currentTimeMillis() - start;
        var usage = response.chatResponse().getMetadata().getUsage();
        // Token usage gives us a read on cost without needing to hit a billing API.
        // Multiply by current model rates if you want a per-call dollar estimate.
        log.info("→ {}ms · in={} · out={} tokens",
            elapsed,
            usage.getPromptTokens(),
            usage.getCompletionTokens());

        return response;
    }
}`}</CodeBlock>

        <h3>Step 7: <code>JournalService.java</code>, the heart of it</h3>

        <CodeBlock lang="java" caption="src/main/java/com/example/journal/JournalService.java">{`package com.example.journal;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.stereotype.Service;

@Service
public class JournalService {

    private final ChatClient chatClient;

    private static final String JOURNAL_SYSTEM_PROMPT = """
        You are a thoughtful journal companion. The user shares journal entries
        with you across multiple turns. Your job:

        1. When asked for a reflection, be brief (3-5 sentences max).
        2. Reference earlier entries when it helps the user see patterns.
        3. Don't be sycophantic. Don't fix or judge — observe.
        4. Ask at most one open-ended question per reply.
        """;

    // Spring auto-injects everything: the builder, the memory, our advisor.
    // We build ONE configured client with both advisors registered as defaults
    // so every call from this service runs through them.
    public JournalService(ChatClient.Builder builder,
                          ChatMemory chatMemory,
                          LoggingAdvisor loggingAdvisor) {
        this.chatClient = builder
            .defaultSystem(JOURNAL_SYSTEM_PROMPT)
            .defaultAdvisors(
                MessageChatMemoryAdvisor.builder(chatMemory).build(),
                loggingAdvisor
            )
            .build();
    }

    /**
     * Analyze the sentiment of an entry. NO memory used here — sentiment
     * should depend ONLY on the current entry, not on what was said before.
     * That's why we set conversationId to a unique throwaway ID.
     *
     * Returns a typed Sentiment record via Spring AI's .entity(Class) magic.
     */
    public Sentiment analyzeSentiment(String entry) {
        return chatClient.prompt()
            .user("Analyze sentiment of this journal entry:\\n\\n" + entry)
            // Per-call override: temperature 0 for deterministic extraction.
            .options(ChatOptions.builder().temperature(0.0).build())
            // Throwaway conversation ID — sentiment shouldn't share context
            // with the reflective conversation. (Memory still runs because
            // it's a default advisor, but the ID is fresh so history is empty.)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "sentiment-" + System.nanoTime()))
            .call()
            .entity(Sentiment.class);
    }

    /**
     * Reflective reply. USES memory — references earlier entries from this
     * journaling session via the shared conversation ID.
     */
    public String reflect(String conversationId, String entry) {
        return chatClient.prompt()
            .user("New journal entry:\\n\\n" + entry
                + "\\n\\nGive me a brief reflection on this, in light of what I've shared before.")
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .call()
            .content();
    }
}`}</CodeBlock>

        <h3>Step 8: <code>JournalCli.java</code>, the runner</h3>

        <CodeBlock lang="java" caption="src/main/java/com/example/journal/JournalCli.java">{`package com.example.journal;

import java.util.Scanner;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class JournalCli implements CommandLineRunner {

    private final JournalService service;

    public JournalCli(JournalService service) {
        this.service = service;
    }

    @Override
    public void run(String... args) {
        // One conversation ID per session. Memory uses this to thread the
        // reflective conversation across turns. Sentiment uses its own
        // throwaway IDs (see analyzeSentiment) so it doesn't interfere.
        String conversationId = UUID.randomUUID().toString();

        System.out.println("Journal session — type 'quit' to exit.");
        System.out.println("─────────────────────────────────────────");

        try (Scanner in = new Scanner(System.in)) {
            while (true) {
                System.out.print("\\n> ");
                String entry = in.nextLine().trim();
                if (entry.isEmpty()) continue;
                if (entry.equalsIgnoreCase("quit")) break;

                // Two LLM calls per entry:
                //   1. Typed sentiment (.entity)
                //   2. Reflective reply (with memory)
                Sentiment s = service.analyzeSentiment(entry);
                String reflection = service.reflect(conversationId, entry);

                System.out.println("\\n[sentiment] " + s.overallTone()
                    + " · confidence " + String.format("%.2f", s.confidence())
                    + " · " + String.join(", ", s.keyEmotions()));
                System.out.println("\\n" + reflection);
            }
        }
        System.out.println("\\nSession ended.");
    }
}`}</CodeBlock>

        <h3>Step 9: Run it</h3>

        <CodeBlock lang="plain" caption="terminal">{`./mvnw spring-boot:run`}</CodeBlock>

        <p>Sample session (your wording will vary):</p>

        <CodeBlock lang="plain" caption="example session">{`Journal session — type 'quit' to exit.
─────────────────────────────────────────

> I had a tough standup. The PM kept pushing back on the timeline and I felt unheard.

[sentiment] negative · confidence 0.85 · frustrated, dismissed, tense

That sounds frustrating — particularly the "unheard" part. Standup pushback
that feels like dismissal vs. genuine concern often comes down to whether
the PM is asking questions or making statements. What did the pushback
actually look like?

INFO  c.e.j.LoggingAdvisor — → 1247ms · in=156 · out=68 tokens

> Honestly mostly statements. "We need to ship by Friday" repeated a few times.

[sentiment] negative · confidence 0.70 · resigned, frustrated

That tracks with the dismissed feeling from earlier — repeated assertions
without questions tend to land that way regardless of intent. Worth noticing
this is the second standup-related entry where you've felt unheard. Is
there a pattern here, or was today specifically harder?

INFO  c.e.j.LoggingAdvisor — → 1413ms · in=287 · out=72 tokens

> quit

Session ended.`}</CodeBlock>

        <p>
          Notice three things in that output:
        </p>

        <ol>
          <li><strong>Sentiment is structured</strong>, three typed fields, not a string. You can pipe these to a database, dashboard, or alert.</li>
          <li><strong>Memory works</strong>, turn 2&apos;s reply explicitly references &quot;the dismissed feeling from earlier.&quot; The advisor injected turn 1 into turn 2&apos;s prompt automatically.</li>
          <li><strong>Logging happens</strong>, the <code>LoggingAdvisor</code> printed timings and token counts for every call. Notice input tokens grew from 156 to 287 between turns, that&apos;s memory expanding the prompt.</li>
        </ol>

        <h3>Common errors</h3>

        <div className="not-prose my-6 space-y-3">
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">JsonProcessingException on .entity()</div>
            <div className="text-sm">The model returned malformed JSON. Most common cause: <code>temperature</code> too high for extraction. Drop to <code>0.0</code> as we did. If it still happens, your record has a field type the model can&apos;t fill (e.g. an enum without clear instructions).</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">No bean of type &apos;ChatMemory&apos; available</div>
            <div className="text-sm">Your <code>MemoryConfig</code> isn&apos;t being picked up. Verify the package matches (<code>com.example.journal</code>) so component scan finds it.</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">Memory not working, every turn looks fresh</div>
            <div className="text-sm">You&apos;re passing different conversation IDs each turn. Generate one UUID at session start and reuse it for all <code>reflect(...)</code> calls.</div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50/40 p-4 dark:border-rose-800 dark:bg-rose-950/30">
            <div className="mb-1 text-sm font-bold text-rose-800 dark:text-rose-300">CallAdvisor / AdvisedRequest can&apos;t be resolved</div>
            <div className="text-sm">Check your Spring AI version. The advisor API was renamed across milestones; make sure your BOM pins the latest <code>1.x</code> release, and re-run <code>./mvnw clean install</code>.</div>
          </div>
        </div>
      </section>
      </Checkpoint>

      <PartRecap
        title="Part 5 recap"
        gist="One Spring Boot app combines memory (advisor), structured output (.entity), custom advisor (logging), and per-call options."
        points={[
          { takeaway: "Sentiment uses .entity(Sentiment.class) at temperature 0, typed, deterministic, schema-enforced.", detail: "The right call shape for extraction: structured class, low temperature, fresh conversation ID so memory doesn't pollute it." },
          { takeaway: "Reflection uses .content() with shared conversation ID, prose output that references earlier turns.", detail: "The MessageChatMemoryAdvisor reads history before the call and persists the new turn after. Your service code never touches a message array." },
          { takeaway: "LoggingAdvisor runs around every call, prints timing + token usage.", detail: "One @Component, registered as a defaultAdvisor, applies to every call from JournalService. Same pattern for metrics, audit logs, rate limiting." },
          { takeaway: "Per-call .options() and .advisors() override service defaults for that one call.", detail: "Sentiment overrides temperature and conversation ID per-call; reflection inherits the service defaults. Standard config-precedence in action." },
          { takeaway: "All four module concepts in one ~150-line app.", detail: "ChatClient deep dive, memory, structured output, advisors. The Spring AI surface area you'll actually use in production fits in one screen." },
        ]}
      />

      {/* ============================================================ */}
      {/* PART 6: FINAL QUIZ                                            */}
      {/* ============================================================ */}
      <Checkpoint moduleSlug="spring-ai" id="final" title="Final quiz" xp={30} celebration="Module 10 cleared. Tool use is next, making the LLM call YOUR code.">
      <section>
        <h2>Part 6: Final quiz</h2>

        <Quiz
          kind="Final"
          xp={6}
          question="Two services in your app need different system prompts and different temperatures. How do you wire them?"
          options={[
            { label: "Define two ChatClient @Bean methods, one per service, and inject them by name", explanation: "Workable but unnecessary boilerplate. Spring AI's design intent is to inject the Builder and let each service .build() its own configured client." },
            { label: "Inject ChatClient.Builder into each service; each calls .defaultSystem() and .defaultOptions() then .build()", correct: true, explanation: "Right. The builder is the shared singleton bean; each @Service builds a configured client with its own defaults. Standard Spring AI pattern, and it's why Module 9's constructor took the Builder, not the ChatClient." },
            { label: "Use one ChatClient and override .system() and .options() on every call", explanation: "Works but defeats the point of defaults, you'd repeat the same overrides on every call from each service. The builder pattern exists exactly to avoid this." },
            { label: "Use Spring profiles to swap the bean per service", explanation: "Profiles are for environment-level config (dev vs prod), not per-service config within one running app." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="You want your journal app to extract a list of action items from each entry as ActionItem records. What's the .entity(...) call?"
          options={[
            { label: ".entity(ActionItem.class)", explanation: "That gets you ONE ActionItem, not a list. The model would either return one item or fail to parse." },
            { label: ".entity(new ParameterizedTypeReference<List<ActionItem>>() {})", correct: true, explanation: "Right. Java erases generics at runtime, so List<ActionItem> needs a TypeReference to preserve the element type. Spring AI handles this by generating a JSON Schema for an array of ActionItem objects." },
            { label: ".content() and parse JSON manually", explanation: "Works but you lose schema enforcement, retries, and type safety, exactly what .entity() gives you." },
            { label: ".entity(List.class)", explanation: "List.class without a parameterized type erases the element type. You'd get back a List of LinkedHashMaps." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="Your team adds a requirement: log every LLM call with user ID, prompt size, and response time, for an audit trail. Where does this logic go?"
          options={[
            { label: "In every @Service that uses ChatClient, copy the logging block into each", explanation: "Cross-cutting concerns shouldn't be copied. That's exactly what advisors solve, and what AOP solved before them." },
            { label: "A custom CallAdvisor wired as a defaultAdvisor on the builder, runs around every call automatically", correct: true, explanation: "Right. Audit logging is the textbook advisor use case: cross-cutting, applies to every call, shouldn't pollute service code. One @Component, one wire-up, every service gets it." },
            { label: "In application.properties, Spring AI logs this if you enable a flag", explanation: "Spring AI doesn't have a built-in audit-with-user-ID feature. You write a small advisor, typically a few dozen lines." },
            { label: "In a global @Aspect using AOP", explanation: "AOP would work but advisors are the Spring AI-native pattern, with first-class access to AdvisedRequest and ChatResponse types. Use the right tool." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="Your conversation has gone on for 50 turns. Memory is set to MessageWindowChatMemory.maxMessages(20). What's in the repository, and what gets sent on turn 51?"
          options={[
            { label: "Repository has 20 messages; turn 51 sends those 20 plus the new one", explanation: "The repository keeps EVERYTHING, that's the whole point of separating storage from window. Truncation happens at retrieval, not write." },
            { label: "Repository has all 50 turns (100 messages); turn 51 sends the most recent 20 plus the new user message", correct: true, explanation: "Right. Storage policy and retrieval policy are separated: the repository is the source of truth (you can show full history in a UI), but only the last 20 messages go to the model on each call. This bounds per-call token cost while keeping the full record accessible." },
            { label: "Repository has 50 turns; turn 51 sends all 50 turns to the model", explanation: "That would defeat the window. Per-call cost would grow unboundedly with conversation length." },
            { label: "Memory drops everything before the window, repository only ever has 20 messages", explanation: "Other way around. The window is purely a retrieval-side filter. The repo doesn't truncate." },
          ]}
        />

        <Quiz
          kind="Final"
          xp={6}
          question="Your sentiment analysis suddenly starts referencing yesterday's journal entries. The user is confused, sentiment should be local to the current entry. What went wrong?"
          options={[
            { label: "Temperature is too high, drop it", explanation: "Temperature affects token sampling, not which prompts get sent. Memory leakage is a wiring issue, not a sampling issue." },
            { label: "The sentiment call is using the same conversation ID as the reflection call, so memory is injecting old turns into the sentiment prompt", correct: true, explanation: "Right. Both calls go through the MessageChatMemoryAdvisor (it's a defaultAdvisor on the shared ChatClient), but they should have different conversation IDs. Sentiment should use a throwaway ID per-call ('sentiment-' + nanoTime in the project) so its prompt has no history; reflection uses the session UUID so it does." },
            { label: "The Anthropic API is caching the old conversation server-side", explanation: "The API is stateless. Server-side has no notion of 'last conversation' to leak from." },
            { label: "Spring AI's .entity() always uses memory regardless of advisor config", explanation: "Memory is purely an advisor concern. .entity() is orthogonal, it doesn't care about advisors at all." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* NEXT MODULE                                                        */}
      {/* ================================================================= */}
      <section className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-yellow-950/40">
        <h3 className="mt-0 mb-2">Module 10 done → Module 11 next</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You can now talk to Claude with memory and typed output. Module 11 turns it around: <strong>Claude calls your code</strong>. We&apos;ll wire Spring AI tool callbacks to your Java methods (and a real GraphQL endpoint), so the LLM can fetch live data, run actions, and chain tool calls. The agent foundation begins here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/courses/ai/modules/tool-use"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Module 11, Tool use →
          </Link>
          <Link
            href="/courses/ai"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-5 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
          >
            ← All modules
          </Link>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="spring-ai" />
    </article>
  );
}
