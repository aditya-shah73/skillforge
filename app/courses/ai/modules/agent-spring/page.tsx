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
  { id: "auto-loop", title: "The auto-loop and why to opt out" },
  { id: "memory-state", title: "Memory and state across turns" },
  { id: "stopping", title: "Stopping conditions in production" },
  { id: "project", title: "Project: code migration agent" },
  { id: "final", title: "Final quiz" },
];

export default function AgentSpringModule() {
  const mod = getModuleBySlug("agent-spring")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Agents in Spring Boot</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Spring AI runs the loop for you. That&apos;s convenient — until you need it not to.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="agent-spring" />
        <ModuleProgress moduleSlug="agent-spring" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The Module 24 research agent rebuilt the Spring AI way — same loop, same stopping
          conditions, but with the framework doing the boring parts. Plus the trick that
          matters most in production: knowing exactly when to <em>turn off</em>{" "}the framework
          and run the loop yourself.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Defining tools as Spring beans with <code>@Tool</code> annotation</li>
          <li>How <code>ChatClient</code>&apos;s auto-loop works (and its hidden iteration cap)</li>
          <li>When to flip <code>internalToolExecutionEnabled = false</code> and own the loop</li>
          <li>Conversation memory and per-session state (keeping it small)</li>
          <li>Production stopping: timeouts, cancellation, observability with Micrometer</li>
          <li>A code migration agent project — reads files, proposes patches, applies them iteratively</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        Module 24 — you must understand the manual loop before letting a framework run it for
        you. Module 10 (Spring AI basics) and Module 11 (tool use) for the API surface.
        Module 13 (prompt caching) is useful when we get to cost control.
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: TOOLS THE SPRING AI WAY                                     */}
      {/* ================================================================= */}
      <section id="spring-tools">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — Tools the Spring AI way</h2>

        <p>
          In Module 11 you wired tool definitions by hand: JSON schemas, name strings,
          dispatcher methods. Spring AI lets you skip almost all of that. Annotate a method,
          register it, done.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">@Tool: the short version</h3>

        <CodeBlock lang="java">{`import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

@Service
public class ResearchTools {

    private final SearchClient search;
    private final HttpFetcher fetcher;

    public ResearchTools(SearchClient search, HttpFetcher fetcher) {
        this.search = search;
        this.fetcher = fetcher;
    }

    @Tool(description = "Search the web. Returns the top 5 results as {title, url, snippet}.")
    public List<SearchResult> webSearch(
            @ToolParam(description = "Search query") String query) {
        return search.topResults(query, 5);
    }

    @Tool(description = "Fetch a URL and return its main text content.")
    public String fetchUrl(
            @ToolParam(description = "URL to fetch") String url) {
        return fetcher.fetchMainText(url);
    }
}`}</CodeBlock>

        <p>
          A few things to notice:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            The <code>@Tool</code> description becomes the tool description sent to the model.
            Treat it like a tiny piece of prompt — the model reads it to decide whether to
            call.
          </li>
          <li>
            Method parameter types become the JSON schema. <code>String</code>,
            <code>Integer</code>, records, <code>List&lt;...&gt;</code> — Spring AI generates
            the schema at registration time.
          </li>
          <li>
            The return type is what the model sees as the observation. Records and lists get
            serialized to JSON automatically.
          </li>
          <li>
            Spring beans, not static methods. The tool can inject anything else in your
            container — repositories, clients, even other Spring AI beans.
          </li>
        </ul>

        <Callout variant="warn" title="Tool descriptions are prompts">
          A vague description like <em>&quot;Search the web&quot;</em>{" "}will get called for
          every question. A precise one — <em>&quot;Search the web for current news; do NOT use
          for math, code, or programming docs&quot;</em> — gates the model&apos;s behavior. Spend
          time on these strings. They&apos;re where most agent tuning happens.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Wiring tools to a ChatClient</h3>

        <p>
          Once your tool service exists, attach it to a <code>ChatClient</code> at the call
          site:
        </p>

        <CodeBlock lang="java">{`@RestController
public class ResearchController {

    private final ChatClient chat;
    private final ResearchTools tools;

    public ResearchController(ChatClient.Builder builder, ResearchTools tools) {
        this.chat = builder
            .defaultSystem("""
                You are a research assistant. Use tools to find and verify facts.
                Cite source URLs in your final answer.
                """)
            .build();
        this.tools = tools;
    }

    @PostMapping("/api/research")
    public String research(@RequestBody String question) {
        return chat.prompt()
            .user(question)
            .tools(tools)            // <-- attaches every @Tool method on this bean
            .call()
            .content();
    }
}`}</CodeBlock>

        <p>
          <code>.tools(tools)</code> reflects over the bean, finds every <code>@Tool</code>
          method, and registers it for this call. You can pass multiple beans, or use
          <code>.toolNames(&quot;webSearch&quot;, &quot;fetchUrl&quot;)</code> for finer
          control over which subset is exposed.
        </p>

        <Callout variant="spring" title="Where do the JSON schemas live?">
          Spring AI generates them at runtime from your method signatures. If you want to see
          them, enable <code>logging.level.org.springframework.ai=DEBUG</code> and watch the
          tool registration logs. For complex inputs (nested records, enums), you may need to
          adjust descriptions on individual fields with <code>@ToolParam</code> to keep the
          model from confusion.
        </Callout>
      </section>

      <PartRecap
        title="Part 1 recap"
        gist="Tools become annotated methods on Spring beans. Schema generation is automatic; tool descriptions are prompt surface."
        points={[
          { takeaway: "@Tool turns any Spring bean method into a callable tool — no manual schemas.", detail: "Method parameters become input schema, return type becomes the observation. Records and lists serialize automatically." },
          { takeaway: "The @Tool description IS prompt engineering.", detail: "It's the only thing the model reads when deciding whether to call. Vague descriptions = over-calling; sharp descriptions = correct gating." },
          { takeaway: "Tools attach per-call via .tools(bean), .toolNames(...), or .toolCallbacks(...).", detail: "You can mix and match: a default toolset on the ChatClient builder, plus per-request additions or restrictions at the call site." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 2: THE AUTO-LOOP                                               */}
      {/* ================================================================= */}
      <section id="auto-loop">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — The auto-loop and why to opt out</h2>

        <p>
          Here&apos;s the surprise: the previous example is already a working agent. When you
          call <code>.call().content()</code>, Spring AI runs the entire ReAct loop for you
          internally. The model emits a tool call, Spring intercepts it, looks up the bean
          method, invokes it, appends the result, calls the model again — until the model
          stops asking for tools or it hits an internal cap.
        </p>

        <Callout variant="insight" title="The hidden loop">
          By default, <code>internalToolExecutionEnabled = true</code>. Spring AI runs the
          loop. Your <code>.content()</code> call returns only the final answer. Every tool
          call and result happened inside the framework, invisible to your code unless you ask
          for them.
        </Callout>

        <p>
          That&apos;s a feature when you want a research-assistant-in-a-line-of-code. It&apos;s
          a problem when you need any of:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Custom stopping conditions (token budget, time budget, &quot;stop after first refund&quot;).</li>
          <li>Streaming intermediate steps to a UI (&quot;agent is searching... agent is reading X&quot;).</li>
          <li>Logging every turn for audit / debugging.</li>
          <li>Human-in-the-loop approval before destructive tool calls.</li>
          <li>Coordinating multiple agents (Module 26).</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Opting out: own the loop</h3>

        <p>
          The escape hatch is a single config flag. Set it and Spring AI returns control to you
          after every model turn — you handle tool execution and decide whether to continue.
        </p>

        <CodeBlock lang="java">{`import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.model.tool.ToolCallingChatOptions;

ChatOptions options = ToolCallingChatOptions.builder()
    .internalToolExecutionEnabled(false)   // <-- the magic switch
    .build();

ChatResponse response = chat.prompt()
    .user(question)
    .tools(tools)
    .options(options)
    .call()
    .chatResponse();

// Now we have the model's first turn — including any tool calls.
// Spring did NOT execute them.`}</CodeBlock>

        <p>
          With the auto-execution off, you get the raw <code>ChatResponse</code> back after
          each model turn. You inspect it for tool calls, run them yourself, append results,
          and call again. This is the manual loop from Module 24 — but with Spring&apos;s
          chat-client, message types, and observability still in play.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The full manual loop in Spring</h3>

        <CodeBlock lang="java">{`public String runManualLoop(String question, int maxIterations) {
    List<Message> history = new ArrayList<>();
    history.add(new UserMessage(question));

    ChatOptions options = ToolCallingChatOptions.builder()
        .internalToolExecutionEnabled(false)
        .toolCallbacks(toolCallbackProvider.getToolCallbacks())
        .build();

    ToolCallbackResolver resolver = toolCallbackProvider.getToolCallbackResolver();

    for (int i = 0; i < maxIterations; i++) {
        log.info("─── turn {} ───", i + 1);

        Prompt prompt = new Prompt(history, options);
        ChatResponse response = chatModel.call(prompt);
        AssistantMessage assistant = response.getResult().getOutput();
        history.add(assistant);

        // No tool calls? We're done.
        if (!assistant.hasToolCalls()) {
            return assistant.getText();
        }

        // Execute each tool call manually
        List<ToolResponseMessage.ToolResponse> results = new ArrayList<>();
        for (AssistantMessage.ToolCall call : assistant.getToolCalls()) {
            log.info("→ tool: {} args: {}", call.name(), call.arguments());
            ToolCallback callback = resolver.resolve(call.name());
            String result = callback.call(call.arguments());
            log.info("← {}", truncate(result, 200));
            results.add(new ToolResponseMessage.ToolResponse(call.id(), call.name(), result));
        }
        history.add(new ToolResponseMessage(results));
    }

    throw new IterationLimitException("Hit " + maxIterations + " without final answer.");
}`}</CodeBlock>

        <Callout variant="warn" title="The framework defaults change">
          Spring AI&apos;s tool API has been moving fast across releases. The flag
          <code>internalToolExecutionEnabled</code>, the <code>ToolCallback</code> resolver,
          and the message types in this snippet match Spring AI 1.0.x. If you&apos;re on a
          different minor version, the names may shift. The <em>concept</em>{" "}doesn&apos;t —
          there&apos;s always a way to disable auto-execution.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">When to use which mode</h3>

        <WorkedExample
          title="Auto-loop vs manual loop — pick one"
          subtitle="Walk through real scenarios before peeking at the answer."
          steps={[
            {
              title: "Scenario 1: a doc Q&A endpoint with a 'search docs' tool",
              body: (
                <>
                  <p>
                    User asks a question, the model maybe calls <code>search_docs</code> 1–2
                    times, then answers. No streaming, no audit log, no destructive ops.
                  </p>
                  <p className="border-l-2 border-emerald-500 pl-3 mt-2 text-sm">
                    <strong>Auto-loop.</strong>{" "}The default does exactly what you want.
                    Manual loop would just be more code with no benefit.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 2: an agent that can issue refunds via tool calls",
              body: (
                <>
                  <p>
                    Same shape, but one of the tools moves money. Even if the model is well
                    behaved 99% of the time, you need to inspect tool calls before they fire.
                  </p>
                  <p className="border-l-2 border-emerald-500 pl-3 mt-2 text-sm">
                    <strong>Manual loop.</strong>{" "}Add a check between &quot;model emitted tool
                    call&quot; and &quot;execute&quot;. For destructive tools, gate on a confirm
                    step or human approval.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 3: streaming a multi-step research agent to a UI",
              body: (
                <>
                  <p>
                    User wants to see progress: &quot;searching for...&quot;, &quot;reading
                    article 1&quot;, &quot;cross-checking&quot;. The agent might run 6 turns.
                  </p>
                  <p className="border-l-2 border-emerald-500 pl-3 mt-2 text-sm">
                    <strong>Manual loop.</strong>{" "}You need to emit SSE events between turns —
                    impossible to do cleanly when the loop is hidden inside Spring.
                  </p>
                </>
              ),
            },
            {
              title: "Scenario 4: classify ticket → call CRM API → post note",
              body: (
                <>
                  <p>
                    Three fixed steps. Reread Module 24 Part 4 if you forgot — this is a
                    workflow, not an agent.
                  </p>
                  <p className="border-l-2 border-emerald-500 pl-3 mt-2 text-sm">
                    <strong>Neither — write a workflow.</strong>{" "}Two structured-output LLM
                    calls and direct service-method invocations. No loop needed.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Checkpoint moduleSlug="agent-spring" id="auto-loop" title="Pick your loop mode" xp={20}>
          <Quiz
            kind="Quick check"
            question="What does internalToolExecutionEnabled = true (the default) actually do?"
            options={[
              {
                label: "Spring AI runs the entire ReAct loop inside .call() — executing tools and re-prompting until the model stops asking for tools.",
                correct: true,
                explanation: "Yes. With this on, .call().content() returns just the final answer. Every tool turn happened inside the framework.",
              },
              {
                label: "Tools are executed asynchronously on a thread pool.",
                explanation: "It's about who runs the loop, not threading. Tool execution is synchronous within each turn.",
              },
              {
                label: "Tool inputs are validated against the JSON schema before execution.",
                explanation: "That validation happens regardless. This flag is about the auto-loop.",
              },
              {
                label: "It enables tool calling at all — without it, no tools are sent to the model.",
                explanation: "Tools are still sent and described to the model when the flag is off; the difference is who executes them when the model asks.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Your agent has a delete_record(id) tool. The auto-loop is on. What's the strongest reason to flip it off?"
            options={[
              {
                label: "Performance — manual loops are faster.",
                explanation: "They aren't faster; the same number of model calls happen either way.",
              },
              {
                label: "You need to inspect or approve destructive tool calls before they execute. Auto-loop runs them the moment the model asks.",
                correct: true,
                explanation: "Right. With auto-loop on, by the time .content() returns, the delete already happened. Manual loop lets you intercept between 'model asked' and 'tool ran'.",
              },
              {
                label: "Spring AI won't generate the schema for delete operations.",
                explanation: "Spring AI doesn't care what your tool does — schema generation is purely about types.",
              },
              {
                label: "You want to use prompt caching.",
                explanation: "Prompt caching is independent of which loop mode you're in.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 2 recap"
        gist="Spring AI runs the loop for you by default. Turn it off when you need control over each turn."
        points={[
          { takeaway: "internalToolExecutionEnabled = true is fine for simple Q&A agents.", detail: "The framework handles tool dispatch, message bookkeeping, and termination. .call().content() returns the final answer." },
          { takeaway: "Flip it off when you need streaming intermediate steps, audit logging, or approval gates.", detail: "You then drive the loop yourself with chatModel.call(prompt) — same pattern as Module 24, but with Spring's message types." },
          { takeaway: "Workflow problems still need workflows.", detail: "Don't reach for a manual loop just because you can. If the steps are fixed, write a service that calls them in order." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 3: MEMORY AND STATE                                            */}
      {/* ================================================================= */}
      <section id="memory-state">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — Memory and state across turns</h2>

        <p>
          Module 24 covered memory <em>conceptually</em>. Now let&apos;s wire each kind in
          Spring AI specifically.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Short-term: ChatMemory</h3>

        <p>
          Spring AI ships a <code>MessageWindowChatMemory</code> bean (and a JDBC-backed
          repository) that attaches to a <code>ChatClient</code> as an advisor. It keeps the
          message history per conversation ID and replays it on each call. (Older 1.0
          milestones called this <code>InMemoryChatMemory</code> — same idea, renamed at GA.)
        </p>

        <CodeBlock lang="java">{`import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;

@Configuration
public class AgentConfig {

    @Bean
    ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
            .maxMessages(20)
            .build();
    }

    @Bean
    ChatClient researchChat(ChatClient.Builder builder, ChatMemory memory, ResearchTools tools) {
        return builder
            .defaultSystem("You are a research assistant. Cite sources.")
            .defaultAdvisors(MessageChatMemoryAdvisor.builder(memory).build())
            .defaultTools(tools)
            .build();
    }
}`}</CodeBlock>

        <p>
          On each request you pass a <code>conversationId</code> via the advisor params, and
          Spring loads the prior turns automatically:
        </p>

        <CodeBlock lang="java">{`return chat.prompt()
    .user(question)
    .advisors(a -> a.param(MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, sessionId))
    .call()
    .content();`}</CodeBlock>

        <Callout variant="warn" title="Unbounded growth is the gotcha">
          The default in-memory store keeps every message forever, per session. For an
          interactive agent doing 20 tool calls per turn that&apos;s a real cost ramp.
          Configure a window size (e.g. 20 messages) or use a summary-compaction strategy.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Long-term: a separate store</h3>

        <p>
          For cross-session memory, treat it like RAG (Modules 14–17). The pattern:
        </p>

        <ol className="list-decimal pl-6 space-y-1 mb-4">
          <li>At the end of a session, run a one-shot LLM call: &quot;Summarize what we should remember about this user.&quot;</li>
          <li>Embed the summary, store in a per-user vector index.</li>
          <li>At the start of the next session, search that index with the new question and inject results into the system prompt.</li>
        </ol>

        <CodeBlock lang="java">{`@Service
public class UserMemoryService {

    private final VectorStore userMemoryStore;
    private final ChatClient summarizer;

    public void capture(String userId, List<Message> sessionTranscript) {
        String summary = summarizer.prompt()
            .system("Extract durable facts about the user (preferences, context, " +
                    "stated goals). Skip transient task details. One bullet per fact.")
            .user(formatTranscript(sessionTranscript))
            .call()
            .content();

        Document doc = new Document(summary, Map.of("userId", userId, "ts", Instant.now().toString()));
        userMemoryStore.add(List.of(doc));
    }

    public String retrieveRelevant(String userId, String currentQuery) {
        List<Document> hits = userMemoryStore.similaritySearch(SearchRequest.builder()
            .query(currentQuery)
            .topK(5)
            .filterExpression("userId == '" + userId + "'")
            .build());

        return hits.isEmpty()
            ? ""
            : "Relevant context about this user:\\n" +
              hits.stream().map(Document::getText).collect(Collectors.joining("\\n- ", "- ", ""));
    }
}`}</CodeBlock>

        <p>
          Inject the retrieved context into the system prompt at the start of each session.
          You&apos;ve now got long-term memory built on the same vector store you used for
          docs — different namespace, same machinery.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Scratchpad as a tool</h3>

        <p>
          The scratchpad pattern from Module 24 is best implemented as two more
          <code>@Tool</code> methods. The agent is in charge of when to use them.
        </p>

        <CodeBlock lang="java">{`@Service
public class Scratchpad {

    private final ConcurrentMap<String, String> store = new ConcurrentHashMap<>();

    @Tool(description = "Save a long piece of text for later. Returns a key. " +
                        "Use this when a tool returned more than 1000 tokens of text " +
                        "you might need details from later.")
    public String saveScratch(
            @ToolParam(description = "The full text to save") String content,
            @ToolParam(description = "A short label for the content") String label) {
        String key = label + "_" + UUID.randomUUID().toString().substring(0, 8);
        store.put(key, content);
        return "Saved as '" + key + "'. Use read_scratch('" + key + "') to read back.";
    }

    @Tool(description = "Read previously saved scratchpad content by its key.")
    public String readScratch(
            @ToolParam(description = "The scratchpad key returned by save_scratch") String key) {
        return Optional.ofNullable(store.get(key))
            .orElse("No scratch found with key: " + key);
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Patterns over types">
          Notice how all three memory mechanisms — chat memory, vector store, scratchpad — are
          just different applications of &quot;persist some bytes, retrieve some bytes&quot;.
          The mental separation is about <em>lifetime</em>{" "}and <em>scope</em>, not about
          fundamentally different technology. Pick the right one for the lifetime you need.
        </Callout>

        <Checkpoint moduleSlug="agent-spring" id="memory-state" title="State across turns" xp={20}>
          <Quiz
            kind="Quick check"
            question="You're using Spring AI's MessageChatMemoryAdvisor with MessageWindowChatMemory. Two requests come in for sessionId='alice'. What does Spring do on the second request?"
            options={[
              {
                label: "Spawns a fresh conversation — the in-memory store doesn't persist between calls.",
                explanation: "It does persist within the JVM lifetime; that's exactly the point.",
              },
              {
                label: "Loads alice's prior messages from the memory bean and prepends them to the new user message before calling the model.",
                correct: true,
                explanation: "Right — that's how the advisor works. Retrieves history by conversation id, replays it, model gets the full context.",
              },
              {
                label: "Sends only the new message; the model has internal session state.",
                explanation: "The model has no internal state between API calls. Memory is always something the host manages.",
              },
              {
                label: "Throws because in-memory stores can't be shared across requests.",
                explanation: "It's a singleton bean — perfectly fine to share, just not durable across restarts.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Your agent uses scratchpad tools heavily. After a long session you notice each new user message takes 4x longer than turn 1. What's likely happening?"
            options={[
              {
                label: "Tool descriptions get longer over time.",
                explanation: "Tool descriptions are static — defined once at registration.",
              },
              {
                label: "Chat memory is unbounded — every prior turn (including bulky tool observations) is being replayed on every new request.",
                correct: true,
                explanation: "Yes. Even with scratchpad offloading new fetches, prior turns' messages are still in the conversation history. Add a window cap or compact summary periodically.",
              },
              {
                label: "Spring AI throttles long sessions.",
                explanation: "It doesn't — Spring AI is mostly transparent on that front.",
              },
              {
                label: "The model is taking longer because of fatigue.",
                explanation: "Models don't fatigue. Cost and latency scale with input tokens, which scale with history length.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 3 recap"
        gist="Three memory layers, three Spring AI mechanisms — and one gotcha: chat memory grows unbounded by default."
        points={[
          { takeaway: "MessageWindowChatMemory + MessageChatMemoryAdvisor handle short-term per-session memory.", detail: "Pass a conversationId on each request and Spring replays the right history. The window cap (`maxMessages`) keeps it bounded — pick a value that fits your model's context budget." },
          { takeaway: "Long-term memory = a per-user vector store, populated at end-of-session, queried at start-of-session.", detail: "Same VectorStore API as your doc RAG, just a different namespace. The hard call is what to save (an LLM-distilled summary works well)." },
          { takeaway: "Scratchpad is two @Tool methods on a service.", detail: "Let the agent decide when to use them — your description is the prompt. Big tool results go in, summaries come out, full text on demand." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 4: STOPPING IN PRODUCTION                                      */}
      {/* ================================================================= */}
      <section id="stopping">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Stopping conditions in production</h2>

        <p>
          Module 24 covered the stopping conditions conceptually. Now the production cuts:
          where Spring lets you wire each one in, and which combinations matter.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Iteration cap</h3>

        <p>
          With auto-loop, Spring AI has an internal cap (typically configurable via the chat
          options, default in the tens). When you own the loop, the cap is your <code>for</code>
          counter. Make it explicit, log when you hit it, and surface the partial state — never
          silently truncate.
        </p>

        <CodeBlock lang="java">{`if (i >= MAX_ITERATIONS) {
    log.warn("Iteration cap hit for session {}. Partial answer follows.", sessionId);
    return PartialResult.of(history, "Hit iteration cap; here's what I learned so far: ...");
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Token budget</h3>

        <p>
          Each <code>ChatResponse</code> includes usage metadata. Tally it across turns and
          stop when you cross a budget:
        </p>

        <CodeBlock lang="java">{`int totalInput = 0;
int totalOutput = 0;

// inside the loop, after each call:
ChatResponse response = chatModel.call(prompt);
Usage u = response.getMetadata().getUsage();
totalInput  += u.getPromptTokens().intValue();
totalOutput += u.getCompletionTokens().intValue();

if (totalInput > MAX_INPUT_TOKENS || totalOutput > MAX_OUTPUT_TOKENS) {
    log.warn("Token budget exceeded ({} in, {} out)", totalInput, totalOutput);
    return PartialResult.of(history, "Token budget exhausted; partial answer below.");
}`}</CodeBlock>

        <Callout variant="info" title="Set budgets in dollars, then convert">
          Pricing changes; convert &quot;cap this user at $0.05 per query&quot; into tokens at
          the current rate, in one place. Don&apos;t hardcode token caps that drift from the
          actual cost intent.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Wall-clock timeouts and cancellation</h3>

        <p>
          For user-facing agents, some user is staring at a spinner. They&apos;ll bail at 30s
          regardless of what your iteration cap says. Wrap the loop:
        </p>

        <CodeBlock lang="java">{`@PostMapping("/api/agent")
public DeferredResult<String> runAgent(@RequestBody String question) {
    DeferredResult<String> result = new DeferredResult<>(60_000L); // 60s timeout

    executor.submit(() -> {
        try {
            String answer = agent.run(question);
            result.setResult(answer);
        } catch (Exception e) {
            result.setErrorResult(e);
        }
    });

    result.onTimeout(() -> {
        log.warn("Agent run timed out after 60s");
        result.setResult("I couldn't finish in time; please try a narrower question.");
        // also: signal cancellation to the agent so it stops eating tokens
    });

    return result;
}`}</CodeBlock>

        <Callout variant="warn" title="Timeout != cancellation">
          The HTTP timeout returns a response to the user, but if the agent is mid-loop in a
          background thread it&apos;ll keep running and burning tokens. Pass a
          <code>volatile boolean cancelled</code> (or a <code>CompletableFuture</code>) into
          the loop and check it at the top of each iteration.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Repeated-tool-call detection</h3>

        <p>
          Same pattern as Module 24. In Spring you have full access to the
          <code>AssistantMessage.ToolCall</code> objects — keep a running set of
          <code>(name, hashOfArgs)</code> tuples and trip when you see one twice in a row
          without progress.
        </p>

        <CodeBlock lang="java">{`Set<String> seen = new LinkedHashSet<>();
String fingerprint = call.name() + ":" + call.arguments();
if (!seen.add(fingerprint)) {
    log.warn("Repeat tool call detected: {}", fingerprint);
    // Inject a hint instead of executing again
    results.add(new ToolResponseMessage.ToolResponse(
        call.id(),
        call.name(),
        "You already called this with the same arguments. Try a different approach or stop and answer with what you have."
    ));
    continue;
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Observability — Micrometer</h3>

        <p>
          Spring AI integrates with Micrometer out of the box. Every model call is timed and
          tagged. Add your own metrics for the agent loop itself:
        </p>

        <CodeBlock lang="java">{`@Service
public class AgentMetrics {

    private final Counter iterations;
    private final DistributionSummary iterationsPerRun;
    private final Counter capHits;

    public AgentMetrics(MeterRegistry registry) {
        this.iterations       = registry.counter("agent.iterations");
        this.iterationsPerRun = registry.summary("agent.iterations.per_run");
        this.capHits          = registry.counter("agent.cap_hits");
    }

    public void onIteration() { iterations.increment(); }
    public void onRunComplete(int n) { iterationsPerRun.record(n); }
    public void onCapHit() { capHits.increment(); }
}`}</CodeBlock>

        <Callout variant="insight" title="The dashboard you actually want">
          Three charts will tell you almost everything: (1) iterations per run, p50/p95/p99;
          (2) tool-call frequency by tool name; (3) cap-hit rate. When something breaks, you&apos;ll
          see it in those before user complaints.
        </Callout>

        <Checkpoint moduleSlug="agent-spring" id="stopping" title="Stopping safely" xp={25}>
          <Quiz
            kind="Quick check"
            question="Your agent ran for 90 seconds before timing out at the load balancer. Logs show 47 tool calls. What's the minimum-viable fix?"
            options={[
              {
                label: "Increase the load balancer timeout to 120s.",
                explanation: "That just lets the bug burn more tokens. Symptoms-first fixes are how you end up with multi-thousand-dollar incident bills.",
              },
              {
                label: "Add explicit iteration and wall-clock caps inside the agent loop, with logged partial answers when hit.",
                correct: true,
                explanation: "Right — caps belong inside your code, not at the load balancer. The LB is a last-resort safety net, not a stopping condition.",
              },
              {
                label: "Switch to streaming responses.",
                explanation: "Useful for UX but doesn't stop the underlying loop from running away.",
              },
              {
                label: "Tell users to ask shorter questions.",
                explanation: "Reasonable advice; not a fix.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You set a 60s DeferredResult timeout in your agent endpoint. The user gets a friendly error at 60s. But on the dashboard you see total token cost is 3x what you expected per query. Why?"
            options={[
              {
                label: "Spring AI charges retries even on timeout.",
                explanation: "There are no hidden retries you didn't configure. The token spend has a real source.",
              },
              {
                label: "The timeout returns to the user but the agent thread keeps running and burning tokens until it hits its iteration cap. You need to signal cancellation into the loop.",
                correct: true,
                explanation: "Yes — HTTP timeout is independent of the work happening in your background thread. The loop needs a cancellation flag it checks each iteration to actually stop.",
              },
              {
                label: "The model retries every prompt 3 times by default.",
                explanation: "Default retry policy is much less aggressive than 3x and not the cause of unbounded loops.",
              },
              {
                label: "Tool calls are billed separately.",
                explanation: "Tool calls aren't billed by Anthropic — only model input/output tokens are.",
              },
            ]}
          />
        </Checkpoint>
      </section>

      <PartRecap
        title="Part 4 recap"
        gist="Iteration cap + token budget + wall-clock timeout + cancellation + observability — five layers, all needed."
        points={[
          { takeaway: "Iteration cap and token budget belong in your loop, not at the load balancer.", detail: "The LB protects the platform; your loop protects your bill. Log partial answers when caps hit so users get useful feedback." },
          { takeaway: "HTTP timeouts are not cancellation.", detail: "DeferredResult.onTimeout fires for the user, but unless your loop checks a cancellation flag it keeps running and spending tokens in the background." },
          { takeaway: "Three Micrometer charts catch most bugs: iterations p99, tool-call frequency, cap-hit rate.", detail: "Spring AI emits the model-call metrics for free. You add the loop-level metrics yourself in 20 lines. Worth every line." },
        ]}
      />

      {/* ================================================================= */}
      {/* PART 5: PROJECT                                                     */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: code migration agent</h2>

        <p>
          Time for an agent that does something visibly real. We&apos;re building a small
          code-migration agent: feed it a Java repo and a target migration (e.g. &quot;upgrade
          Java 17 → 21&quot; or &quot;replace JUnit 4 with JUnit 5&quot;), and it iterates
          file-by-file, proposing patches, applying them, running the build, and learning from
          failures.
        </p>

        <Callout variant="warn" title="This agent edits files">
          We&apos;re building a destructive agent — it modifies your code. Run it inside a
          throwaway worktree or a fresh git branch. Never against your only copy of anything.
          Treat the kill switch as required equipment, not optional.
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Spec</h3>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>Inputs: repo path, migration brief (free text), max-files cap.</li>
          <li>Tools: <code>list_files</code>, <code>read_file</code>, <code>write_file</code>, <code>run_tests</code>, <code>git_diff</code>.</li>
          <li>Manual loop with <code>internalToolExecutionEnabled = false</code> — we want every step visible.</li>
          <li>Iteration cap: 30. Token cap: 200k input. Wall-clock: 5 minutes.</li>
          <li>Every <code>write_file</code> call must echo a unified diff to stdout before applying.</li>
          <li>If <code>run_tests</code> fails twice in a row on the same file, abort that file and move on.</li>
          <li>Final output: a list of files changed + the build status.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">The tool service</h3>

        <CodeBlock lang="java">{`@Service
public class CodeTools {

    private final Path repoRoot;
    private final BuildRunner build;

    public CodeTools(@Value("\${agent.repo-root}") Path repoRoot, BuildRunner build) {
        this.repoRoot = repoRoot;
        this.build = build;
    }

    @Tool(description = "List source files matching a glob, relative to repo root. " +
                        "Use this BEFORE reading files to discover what's there.")
    public List<String> listFiles(
            @ToolParam(description = "Glob pattern, e.g. 'src/**/*.java'") String glob) {
        return Files.walk(repoRoot)
            .filter(p -> matcher(glob).matches(repoRoot.relativize(p)))
            .map(p -> repoRoot.relativize(p).toString())
            .toList();
    }

    @Tool(description = "Read a file. Returns its full contents.")
    public String readFile(@ToolParam(description = "Repo-relative path") String path) {
        return Files.readString(repoRoot.resolve(path));
    }

    @Tool(description = "Write/overwrite a file. " +
                        "ALWAYS read the file first if it exists, then write the full new contents. " +
                        "Diff is logged before the write. Use sparingly.")
    public String writeFile(
            @ToolParam(description = "Repo-relative path") String path,
            @ToolParam(description = "Full new file contents") String content) {
        Path p = repoRoot.resolve(path);
        String before = Files.exists(p) ? Files.readString(p) : "";
        log.info("DIFF for {}:\\n{}", path, unifiedDiff(before, content));
        Files.writeString(p, content);
        return "Wrote " + content.length() + " chars to " + path;
    }

    @Tool(description = "Run the test suite (Maven). Returns build output, success or failure.")
    public String runTests() {
        BuildResult r = build.run("test");
        return (r.success() ? "BUILD OK\\n" : "BUILD FAILED\\n") + r.tail(2000);
    }

    @Tool(description = "Show the current git diff against HEAD.")
    public String gitDiff() {
        return ProcessRunner.run("git", "diff").stdout();
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">The agent loop</h3>

        <CodeBlock lang="java">{`@Service
public class MigrationAgent {

    private static final int MAX_ITER = 30;
    private static final int MAX_INPUT_TOKENS = 200_000;
    private static final Duration WALL_CLOCK = Duration.ofMinutes(5);

    private final ChatModel chat;
    private final CodeTools tools;
    private final ToolCallbackProvider callbacks;
    private final AgentMetrics metrics;

    public MigrationResult run(String migrationBrief, AtomicBoolean cancelled) {
        Instant deadline = Instant.now().plus(WALL_CLOCK);
        List<Message> history = new ArrayList<>();
        history.add(new SystemMessage(SYSTEM_PROMPT));
        history.add(new UserMessage(migrationBrief));

        ChatOptions opts = ToolCallingChatOptions.builder()
            .internalToolExecutionEnabled(false)
            .toolCallbacks(callbacks.getToolCallbacks())
            .build();

        ToolCallbackResolver resolver = callbacks.getToolCallbackResolver();
        Set<String> recentCalls = new LinkedHashSet<>();
        int totalInput = 0;

        for (int i = 0; i < MAX_ITER; i++) {
            metrics.onIteration();
            if (cancelled.get())                  return MigrationResult.cancelled(history);
            if (Instant.now().isAfter(deadline))  return MigrationResult.timedOut(history);
            if (totalInput > MAX_INPUT_TOKENS)    return MigrationResult.budgetExhausted(history);

            ChatResponse resp = chat.call(new Prompt(history, opts));
            totalInput += resp.getMetadata().getUsage().getPromptTokens().intValue();
            AssistantMessage assistant = resp.getResult().getOutput();
            history.add(assistant);

            if (!assistant.hasToolCalls()) {
                metrics.onRunComplete(i + 1);
                return MigrationResult.completed(history, assistant.getText());
            }

            List<ToolResponseMessage.ToolResponse> results = new ArrayList<>();
            for (var call : assistant.getToolCalls()) {
                String fp = call.name() + ":" + call.arguments();
                if (!recentCalls.add(fp)) {
                    results.add(new ToolResponseMessage.ToolResponse(
                        call.id(), call.name(),
                        "You already made this exact call. Don't repeat — try a different approach."));
                    continue;
                }
                try {
                    String out = resolver.resolve(call.name()).call(call.arguments());
                    results.add(new ToolResponseMessage.ToolResponse(call.id(), call.name(), out));
                } catch (Exception e) {
                    results.add(new ToolResponseMessage.ToolResponse(
                        call.id(), call.name(), "ERROR: " + e.getMessage()));
                }
            }
            history.add(new ToolResponseMessage(results));
        }

        metrics.onCapHit();
        return MigrationResult.capHit(history);
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">The system prompt does heavy lifting</h3>

        <CodeBlock lang="plain">{`You are a careful code migration agent. Goal: apply the user's requested
migration to this Java repository, one file at a time, verifying as you go.

Tools:
  - list_files(glob)   discover candidate files
  - read_file(path)    read before editing — ALWAYS
  - write_file(path)   overwrite a file (diff is auto-logged)
  - run_tests()        run the test suite
  - git_diff()         see your cumulative changes

Workflow:
  1. List the files in scope (e.g. all *.java in src/main/).
  2. Pick ONE file. Read it. Understand it.
  3. Propose a minimal patch that achieves the migration goal.
  4. Write the file.
  5. Run the tests.
  6. If tests pass, move to the next file.
  7. If tests fail, READ the failure, then either:
       - revert this file (read previous content from git_diff and rewrite)
       - or fix forward.
  8. After every 5 files, summarize progress. If most files are done and the
     remaining ones are similar, you may batch-fix them.

Stop when:
  - All in-scope files have been migrated and tests pass, OR
  - You're stuck on a file after 2 attempts — abort that file, note it, continue.

Never:
  - Edit files you haven't read.
  - Make changes outside the migration scope.
  - Disable tests to make the build pass.`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Test cases to actually run</h3>

        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>
            <strong>Trivial migration on a 5-file repo:</strong> &quot;rename all uses of class
            <code>Foo</code> to <code>Bar</code>&quot;. Should converge in &lt;15 iterations.
          </li>
          <li>
            <strong>JUnit 4 → 5 on a small repo:</strong>{" "}verify it understands annotation
            differences, doesn&apos;t miss imports.
          </li>
          <li>
            <strong>Sabotage test:</strong>{" "}introduce a syntax error in one file before
            starting. The agent should hit a build failure, read it, and recover.
          </li>
          <li>
            <strong>Cap-hit case:</strong>{" "}drop <code>MAX_ITER</code> to 5 on a 20-file
            migration. Confirm <code>capHit</code> result is returned cleanly with the partial
            diff.
          </li>
          <li>
            <strong>Cancellation:</strong>{" "}start a long migration, set <code>cancelled.set(true)</code>
            from another thread mid-run, confirm the loop exits within one iteration.
          </li>
        </ol>

        <Checkpoint
          moduleSlug="agent-spring"
          id="project"
          title="Build the migration agent"
          xp={60}
          manual
          manualLabel="I built the migration agent and ran every test case"
          celebration="A real, file-editing, build-running agent — and you kept it on a leash."
        >
          <p>
            Build the migration agent, wire it to a real Maven project, and run every test case
            in the list. Pay particular attention to the cancellation test — that&apos;s the one
            that proves you actually own the loop, not the framework.
          </p>
          <p className="mt-3">
            <strong>Stretch goal:</strong>{" "}add a human-approval gate. Before each
            <code>write_file</code> call, the loop pauses and prints the diff to a small UI (or
            stdin prompt) and waits for y/n. This is exactly the pattern you&apos;d need for any
            production agent that touches money or production data.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL                                                       */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 6 — Putting it together</h2>

        <p>You&apos;ve now got the full Spring AI agent toolkit:</p>

        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li><code>@Tool</code> annotations turn beans into agent-callable tools.</li>
          <li>Auto-loop is the default — flip it off when you need control.</li>
          <li>Three memory layers each have a Spring AI mechanism: <code>ChatMemory</code>, <code>VectorStore</code>, <code>@Tool</code>-backed scratchpad.</li>
          <li>Five stopping conditions, all wirable in a normal Spring app.</li>
          <li>Observability is Micrometer + a few custom metrics.</li>
        </ul>

        <p>
          <strong>Module 26</strong>{" "}goes wider: when one agent isn&apos;t enough.
          Orchestrator/subagent patterns, parallel fanout, and the part nobody mentions —
          how to keep multi-agent systems from devolving into distributed-systems debugging.
        </p>

        <Checkpoint moduleSlug="agent-spring" id="final" title="Final quiz" xp={30}>
          <Quiz
            kind="Quick check"
            question="Which of these is NOT something Spring AI's @Tool gives you for free?"
            options={[
              {
                label: "JSON schema generation from method signatures.",
                explanation: "It does — that's the core convenience.",
              },
              {
                label: "Automatic retry of failed tool calls with exponential backoff.",
                correct: true,
                explanation: "Right. @Tool registers and dispatches; retry policy is yours to add (and you may not want it — sometimes the model recovering is better than blindly retrying).",
              },
              {
                label: "Dispatch from the model's tool-call request to the right Java method.",
                explanation: "That's exactly what Spring AI's tool callback resolver does.",
              },
              {
                label: "Serialization of records and lists to JSON for the model.",
                explanation: "Spring AI handles that automatically based on return type.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="You want to stream agent progress to the UI: 'searching... reading article 1... cross-checking...'. internalToolExecutionEnabled is currently true. What do you change?"
            options={[
              {
                label: "Nothing — just enable .stream() on the call.",
                explanation: ".stream() streams the model's text output, but the auto-loop hides intermediate tool turns from your code, so you can't emit per-step UI events.",
              },
              {
                label: "Flip internalToolExecutionEnabled to false and run the loop yourself, emitting an SSE event between each turn.",
                correct: true,
                explanation: "Right — manual loop is the only way to expose intermediate turns. With auto-loop on, only the final answer is visible.",
              },
              {
                label: "Add an advisor that intercepts the auto-loop.",
                explanation: "There's no clean advisor for that — the auto-loop runs inside framework code. Manual loop is the supported path.",
              },
              {
                label: "Switch models — only certain models support streaming with tools.",
                explanation: "Most modern Claude/OpenAI models support streaming with tools fine. The loop visibility, not the model, is the issue here.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Your agent's chat memory grows unbounded. Which of these is a clean fix that doesn't lose important context?"
            options={[
              {
                label: "Hard window: keep only the last 10 messages.",
                explanation: "Risks dropping the original user goal. If the loop has gone past 10 turns, the most important message (the original ask) just got pruned.",
              },
              {
                label: "Sliding window with the system prompt and original user message pinned, plus periodic LLM-summarization of older middle turns.",
                correct: true,
                explanation: "Yes — this is the standard pattern. Keep what matters most (system + goal), summarize the middle, retain recent turns verbatim. Best of all worlds.",
              },
              {
                label: "Give every session a 1M-token model.",
                explanation: "That's the budget answer, not the engineering answer. You'd still want compaction for cost control even with infinite context.",
              },
              {
                label: "Don't use chat memory at all — restart the conversation each turn.",
                explanation: "Then the agent forgets what tools it called and what it learned. Loop becomes useless.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Production red flag: which of these scenarios is most likely to be a runaway-token bill in your agent service?"
            options={[
              {
                label: "An agent with a 60-second HTTP timeout but no cancellation flag passed into the loop, running on a background thread.",
                correct: true,
                explanation: "Right — HTTP timeout returns to the user but the background loop keeps going, eating tokens, until it hits the iteration cap. Pass a cancellation flag and check it each iteration.",
              },
              {
                label: "Using internalToolExecutionEnabled = true on a simple Q&A agent.",
                explanation: "That's just the default; not inherently a cost problem if your tools are cheap.",
              },
              {
                label: "Logging tool inputs and outputs at INFO level.",
                explanation: "Logging affects log volume, not token spend.",
              },
              {
                label: "Storing chat memory in InMemoryChatMemory rather than JDBC.",
                explanation: "Affects durability across restarts, not token cost.",
              },
            ]}
          />
          <Quiz
            kind="Quick check"
            question="Your @Tool description for a delete_user tool currently reads: 'Delete a user.' What's the most impactful single edit?"
            options={[
              {
                label: "Add the JSON schema by hand.",
                explanation: "Spring AI generates the schema automatically; manual schema isn't the leverage point.",
              },
              {
                label: "Sharpen the description with usage rules: when to use, when NOT to use, and what to confirm first.",
                correct: true,
                explanation: "Yes — tool descriptions are the prompt the model reads to decide. 'Permanently deletes a user. Only call after explicit user confirmation; never call to deactivate (use deactivate_user for that).' The model will obey this.",
              },
              {
                label: "Rename the tool to deleteUserPermanently.",
                explanation: "Tool names matter a little, but the description is where the heavy gating happens.",
              },
              {
                label: "Move the tool to a separate microservice.",
                explanation: "Architecture change, not a description fix.",
              },
            ]}
          />
        </Checkpoint>

        <div className="mt-12 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
          <p className="font-semibold mb-2">Coming up next:</p>
          <p className="text-sm">
            <strong>Module 26 — Multi-agent patterns</strong>: when one agent isn&apos;t
            enough. Orchestrator/subagent, parallel fanout, evaluator-optimizer loops, and
            the trap of multi-agent for the sake of multi-agent. We&apos;ll build a PR review
            panel that runs three specialized reviewers in parallel.
          </p>
        </div>
      </section>
        <ModuleNav courseId="ai" currentSlug="agent-spring" />
    </article>
  );
}
