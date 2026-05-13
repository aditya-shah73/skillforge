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

const CHECKPOINTS = [
  { id: "why-tools", title: "Why tool use exists" },
  { id: "the-loop", title: "The tool execution loop" },
  { id: "spring-tools", title: "Tools in Spring AI" },
  { id: "schemas-and-safety", title: "Schemas & safety" },
  { id: "project", title: "Project: GraphQL-aware assistant" },
  { id: "final", title: "Final quiz" },
];

export default function ToolUseModule() {
  const mod = getModuleBySlug("tool-use")!;

  const toolLoopDiagram = `
sequenceDiagram
    participant App as Your Spring app
    participant Claude
    participant Tool as findUserByEmail()
    App->>Claude: Find user alice@acme.com (with tool list)
    Claude-->>App: tool_use findUserByEmail(email=alice@acme.com)
    App->>Tool: invoke method
    Tool-->>App: id 42, name Alice, plan pro
    App->>Claude: tool_result with that data
    Claude-->>App: Alice is on the pro plan.
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Phase 2 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Tool use & function calling
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Stop pasting data into prompts. Let the model call your code.
        </p>
        <ModuleProgress moduleSlug="tool-use" checkpoints={CHECKPOINTS} />
      </header>

      <Callout variant="insight" title="The shift">
        <p>
          Until now, your app calls Claude with a prompt and gets text back. Tool use inverts the relationship for one round trip: <strong>Claude calls your app</strong>, you run a method, hand the result back, and Claude continues with that fresh data in context. It is the single most important pattern for building AI features that aren&apos;t just toy chatbots.
        </p>
      </Callout>

      {/* ===================== Part 1 ===================== */}
      <section id="why-tools">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 1 — Why tool use exists</h2>

        <p>
          The model is frozen knowledge. Its training cutoff is months or years ago, it cannot read your database, it cannot call your APIs, and even if it could, you wouldn&apos;t want to grant it raw network access. So how do you build a feature like &quot;list my open Jira tickets&quot;? You can&apos;t cram every ticket into the prompt — that&apos;s expensive and stale a minute later. You can&apos;t fine-tune in real time.
        </p>

        <p>
          The answer is to expose <em>functions</em> the model can request. You describe each function in JSON: name, what it does, what arguments it takes. The model decides when to call one and what arguments to pass. You execute it server-side. You give the result back. The model continues.
        </p>

        <Callout variant="info" title="Tool use is just structured output, repeated">
          <p>
            Notice the parallel to Module 10&apos;s <code>.entity(...)</code>. There, the model produced JSON conforming to your <code>Sentiment</code> schema. Here, the model produces JSON conforming to a <em>tool call</em> schema: a name plus an input object. The mechanism is the same — constrained generation against a schema you supplied. The difference is that with structured output you stop after one parse; with tool use, you execute the parsed call and feed the result back so the model can keep going.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">When you actually need this</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Live data</strong> — current ticket status, today&apos;s metrics, real user records.</li>
          <li><strong>Side effects</strong> — create a Jira issue, send an email, update a row.</li>
          <li><strong>Computation the model is bad at</strong> — exact arithmetic, regex, calling a deterministic algorithm.</li>
          <li><strong>Authorization</strong> — your code, not the model, decides whether the current user is allowed to see record #42.</li>
        </ul>

        <Callout variant="warn" title="When NOT to use tools">
          <p>
            If a question can be answered from data already in the prompt, don&apos;t add a tool — you&apos;re just paying extra round trips. And don&apos;t expose tools you wouldn&apos;t expose to a junior engineer with no code review. The model will call them. <strong>Every tool is a privilege you grant.</strong>
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your app already has a REST endpoint that returns the user's profile. The user asks the assistant 'what's my plan tier?' Should you turn the profile endpoint into a tool, or paste profile data into the system prompt?"
          options={[
            { label: "Always paste into the system prompt — it's faster", explanation: "Faster for the trivial case, but it doesn't scale. If you need ten different bits of user data and the user only asks about one, you've shipped nine for nothing — and stale data, since the prompt is built before the question." },
            { label: "Always make it a tool — tools are the modern way", explanation: "Tool calls add a round trip. If you already know exactly what data the user needs every time, just include it." },
            { label: "Tool, because the model only fetches it when needed and it's always fresh", correct: true, explanation: "Right. Tools shine when (a) you don't know in advance which data you'll need, or (b) the data is volatile. Profile data fits both — and the model decides whether to fetch it based on the question." },
            { label: "Neither — just tell the user to call the REST endpoint themselves", explanation: "That's giving up on building an assistant." },
          ]}
          xp={10}
        />

        <Checkpoint moduleSlug="tool-use" id="why-tools" title="Why tool use exists" xp={20}>
          <PartRecap
            title="Part 1 recap"
            gist="Tool use lets the model request that you run a function. It's the bridge between a frozen model and your live system."
            points={[
              { takeaway: "Tools are structured-output JSON the model produces, which you execute and feed back.", detail: "Same constrained-generation mechanism as .entity() in Module 10 — the schema just describes a 'function call' shape instead of a domain object." },
              { takeaway: "Use them for live data, side effects, exact computation, and authz-gated reads.", detail: "If the answer is already in the prompt or never changes, don't add a tool. Round trips cost latency and tokens." },
              { takeaway: "Don't expose anything you wouldn't let a junior run unsupervised.", detail: "Every registered tool is a privilege. The model will call them under user pressure or its own confused planning. Treat tool registration as authorization design." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 2 ===================== */}
      <section id="the-loop">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 2 — The tool execution loop</h2>

        <p>
          One mental model worth burning in: tool use is a loop, not a single call. Spring AI hides the loop most of the time, but if you don&apos;t know it&apos;s there, you&apos;ll be confused when the model calls three tools in a row, when it loops forever, or when you need to set a max-iterations cap.
        </p>

        <Mermaid chart={toolLoopDiagram} />

        <h3 className="text-xl font-semibold mt-6 mb-3">What the wire actually carries</h3>
        <p>
          Each request to the API now includes a <code>tools</code> array — every tool you&apos;re willing to expose, with name, description, and input schema. The response is one of two things:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Plain text</strong> — model answered without needing a tool. You&apos;re done.</li>
          <li><strong>A <code>tool_use</code> block</strong> — model wants you to run something. You execute, then send a follow-up request that includes a matching <code>tool_result</code>. The model produces the next response (which might be more text, or yet another tool call).</li>
        </ul>

        <p className="mt-4">
          That&apos;s the entire protocol. Spring AI&apos;s default behavior is to drive this loop for you: it sees a <code>tool_use</code>, finds the registered method, invokes it, packages the return value as a <code>tool_result</code>, and re-calls the API — all before <code>chatClient.call()</code> returns.
        </p>

        <Callout variant="warn" title="Loops can run away">
          <p>
            A buggy tool that returns garbage can cause the model to retry, ask another tool, give up, ask again — burning tokens. Spring AI caps at a default max iterations per call (configurable). When a tool legitimately fails, return a clear error string in the tool result; the model usually backs off cleanly when it sees something like <code>error: user not found</code> rather than an empty payload.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="The model calls findUser(), gets back {id: 42}, then calls listIssuesForUser(42), gets 17 tickets, then says 'You have 17 open tickets, oldest from March.' How many requests did your app send to the Anthropic API?"
          options={[
            { label: "1 — tool calls happen inside one request", explanation: "Tool calls are NOT free server-side; each one is its own API request." },
            { label: "2 — one for the question, one for the answer", explanation: "Each tool result requires a fresh request so the model can incorporate it." },
            { label: "3 — initial question + after findUser result + after listIssues result", correct: true, explanation: "Right. Every tool result needs its own request to give the model a chance to keep going. Three tool steps = three API calls. This matters for latency and cost." },
            { label: "17 — one per ticket", explanation: "You're confusing tool calls with the data they return. The 17 tickets came back in one tool result." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="tool-use" id="the-loop" title="The tool execution loop" xp={20}>
          <PartRecap
            title="Part 2 recap"
            gist="Tool use is a multi-step loop. Spring AI drives it; you just need to know it exists."
            points={[
              { takeaway: "Each tool step = one API request. Latency and cost scale with chain length.", detail: "A 4-step chain is 4 round trips and 4 input-token billings. Watch out when the model starts chaining unnecessary lookups." },
              { takeaway: "Tool result errors should be informative strings — the model handles them gracefully.", detail: "Throwing exceptions aborts the call. Returning 'error: user not found' lets the model recover and tell the user politely." },
              { takeaway: "Always set a max-iterations cap to prevent runaway loops.", detail: "Spring AI defaults to a sane cap; raise it deliberately when a workflow truly needs many tool calls. Don't just bump it because your tool is buggy." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 3 ===================== */}
      <section id="spring-tools">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 3 — Tools in Spring AI</h2>

        <p>
          The good news: you do not write JSON schemas by hand. Spring AI inspects your method signatures, generates the schema, and binds tool calls back to the method. There are two ways to register a tool — <strong>per-call</strong> via <code>@Tool</code> annotations on a regular Spring bean&apos;s methods, or <strong>programmatic</strong> via <code>MethodToolCallback</code> if you need runtime flexibility.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">The simplest case: <code>@Tool</code> on a bean method</h3>

        <CodeBlock lang="java" caption="UserTools.java">{`package com.example.tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

@Service
public class UserTools {

  @Tool(description = "Look up a user by their email address. Returns id, name, and plan tier.")
  public UserRecord findUserByEmail(
      @ToolParam(description = "Email address, e.g. alice@acme.com") String email) {
    // In a real app this would hit your DB or GraphQL resolver.
    if ("alice@acme.com".equalsIgnoreCase(email)) {
      return new UserRecord(42L, "Alice", "pro");
    }
    return null;
  }

  public record UserRecord(Long id, String name, String plan) {}
}`}</CodeBlock>

        <p className="mt-4">Then you tell the <code>ChatClient</code> these tools are available:</p>

        <CodeBlock lang="java">{`String answer = chatClient.prompt()
    .user("What plan is alice@acme.com on?")
    .tools(userTools)         // <- pass the bean; Spring AI scans for @Tool
    .call()
    .content();
// "Alice is on the pro plan."`}</CodeBlock>

        <p className="mt-4">
          That&apos;s the whole API surface. The annotation&apos;s <code>description</code> is what the model sees — write it like documentation for a colleague who&apos;s never used your function. Param descriptions matter too; they go straight into the schema.
        </p>

        <Callout variant="insight" title="Description quality > tool count">
          <p>
            A common failure mode: developers register 30 tools, all named <code>get</code>/<code>list</code>/<code>update</code>, with one-word descriptions. The model gets confused, calls the wrong one, hallucinates parameters. Three well-described tools beat thirty terse ones every time. Treat tool descriptions like <em>API docs the model reads at runtime</em> — because that&apos;s what they are.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Programmatic: <code>MethodToolCallback</code></h3>
        <p>
          If you need to register tools dynamically (per-tenant tool sets, feature-flagged tools, tools loaded from config), build them programmatically:
        </p>

        <CodeBlock lang="java">{`import org.springframework.ai.tool.method.MethodToolCallback;
import org.springframework.ai.tool.definition.ToolDefinition;

Method m = UserTools.class.getMethod("findUserByEmail", String.class);
MethodToolCallback callback = MethodToolCallback.builder()
    .toolDefinition(ToolDefinition.builder(m)
        .description("Look up a user by their email")
        .build())
    .toolMethod(m)
    .toolObject(userTools)
    .build();

String answer = chatClient.prompt()
    .user("What plan is alice@acme.com on?")
    .toolCallbacks(callback)
    .call()
    .content();`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="You register a tool getOrders(String customerId). The model calls it but passes customerId='Alice' instead of an ID. What's the fix?"
          options={[
            { label: "Validate inside the method, throw an exception", explanation: "Throwing makes Spring AI surface an error that may abort the whole call. Often you just want the model to retry with a corrected argument." },
            { label: "Improve the @ToolParam description: 'Numeric customer ID, e.g. 42 — NOT the customer name'", correct: true, explanation: "Right. The model will follow good descriptions. Make assumptions explicit. You can also add a separate findCustomerByName tool so the model has a path from name → id." },
            { label: "Lower temperature to 0", explanation: "Temperature affects randomness, not whether the model knows that 'Alice' isn't a customer ID. Better descriptions and a helper lookup tool fix the root cause." },
            { label: "Switch models", explanation: "A bigger model might guess better, but the underlying issue — ambiguous tool spec — would still bite you with corner cases." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="tool-use" id="spring-tools" title="Tools in Spring AI" xp={25}>
          <PartRecap
            title="Part 3 recap"
            gist="@Tool on a Spring bean method is the 90% case. MethodToolCallback unlocks dynamic registration."
            points={[
              { takeaway: "Spring AI generates the schema from your method signature — no hand-written JSON.", detail: "Records, enums, lists, primitives — all inferred. You stay in Java; the model sees a JSON Schema." },
              { takeaway: "Description quality is everything: write it as docs for a colleague.", detail: "The description is the only signal the model has for choosing between tools. Vague descriptions = wrong tool selection. Include example values when types are ambiguous." },
              { takeaway: "Use programmatic registration only when you need per-request tool sets.", detail: "Per-tenant feature flags, dynamic capability discovery, plug-in style tooling. For most apps, @Tool on a @Service is all you need." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 4 ===================== */}
      <section id="schemas-and-safety">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 4 — Schemas &amp; safety</h2>

        <h3 className="text-xl font-semibold mt-6 mb-3">What the model actually sees</h3>
        <p>
          Spring AI&apos;s reflection-based schema generation handles primitives, records, lists, maps, and enums out of the box. Here&apos;s a tool that takes a more complex input:
        </p>

        <CodeBlock lang="java">{`public record IssueFilter(String project, List<String> labels, Status status) {
  public enum Status { OPEN, IN_PROGRESS, CLOSED }
}

@Tool(description = "Find issues matching the given filter")
public List<Issue> findIssues(@ToolParam(description = "Filter criteria") IssueFilter filter) {
  // ...
}`}</CodeBlock>

        <p className="mt-4">Spring AI generates a JSON Schema like:</p>

        <CodeBlock lang="plain">{`{
  "type": "object",
  "properties": {
    "filter": {
      "type": "object",
      "properties": {
        "project": { "type": "string" },
        "labels":  { "type": "array", "items": { "type": "string" } },
        "status":  { "type": "string", "enum": ["OPEN", "IN_PROGRESS", "CLOSED"] }
      }
    }
  }
}`}</CodeBlock>

        <p className="mt-4">
          Notice <code>Status</code> became an <code>enum</code> in the schema — that&apos;s a hard constraint. The model literally cannot produce a value outside that set. Use enums where you want strict values; use plain strings where you want flexibility.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Three things that bite people in production</h3>

        <Callout variant="warn" title="1. Privilege escalation via tool">
          <p>
            A tool runs as <em>your service identity</em>, not the user&apos;s. If you expose <code>deleteIssue(id)</code>, the model can call it with any ID — even one belonging to another user. <strong>Always check authorization inside the tool</strong>, the same way you would in a controller. Pass the current user via <code>SecurityContextHolder</code> or a thread-local; never trust the model to filter.
          </p>
        </Callout>

        <Callout variant="warn" title="2. Tools that mutate without confirmation">
          <p>
            A user says &quot;archive my old tickets&quot; — the model happily calls <code>archiveIssue</code> 200 times in a row. For destructive ops, prefer two-step patterns: have a <code>previewArchive(filter)</code> tool that returns a list, and a separate <code>confirmArchive(ids)</code> tool that requires explicit IDs. Wire confirmation into your UI before the second call.
          </p>
        </Callout>

        <Callout variant="warn" title="3. PII leakage in tool results">
          <p>
            Tool results go straight into the conversation. If <code>findUser</code> returns SSN, the model might quote it verbatim in its reply, and now your logs and any cache contain SSN. Strip sensitive fields <em>inside the tool</em> before returning. The model can&apos;t leak what it never received.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your tool getOrder(String orderId) is called with orderId='42'. The order belongs to user 7, but the current request is from user 9. What's the right behavior?"
          options={[
            { label: "Return the order — the model will figure out it shouldn't expose it", explanation: "Never. The model will absolutely include order data it received. Authorization belongs in your code, not in a prompt instruction." },
            { label: "Return null silently", explanation: "Better than the previous option, but the model now thinks the order doesn't exist — which can confuse follow-ups. Returning a clear 'not authorized' string is cleaner." },
            { label: "Throw a SecurityException", explanation: "Throwing aborts the call. Sometimes that's right (definite abuse), but for normal not-allowed cases a structured error result lets the model gracefully tell the user." },
            { label: "Return an explicit error: 'Not authorized to view order 42'", correct: true, explanation: "Right. The tool enforces authz, returns a clear error, and the model can compose a polite refusal. Logs stay clean, no data leaks." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="tool-use" id="schemas-and-safety" title="Schemas & safety" xp={30}>
          <PartRecap
            title="Part 4 recap"
            gist="Tools are privileges. Treat each one like an API endpoint — authz, validation, redaction, and human-in-the-loop for destructive ops."
            points={[
              { takeaway: "Use enums and records for strict schemas; plain strings for flexibility.", detail: "Enums become hard constraints in the JSON Schema. The model cannot violate them. Reach for them when only a known set of values makes sense." },
              { takeaway: "Always check authz inside the tool, not in the prompt.", detail: "Tools run with your service identity. Pass the calling user explicitly (SecurityContext, thread-local) and verify access before returning data." },
              { takeaway: "Preview/confirm patterns are the norm for any tool that mutates data.", detail: "Split discovery from execution. The model finds candidates; the user authorizes the destructive step in your UI." },
              { takeaway: "Strip sensitive fields before returning results — the model can't leak what it never sees.", detail: "Tool returns are just data your application controls. Filter at the boundary: SSN, internal IDs, raw addresses don't need to enter the model context." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 5: Project ===================== */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 5 — Project: GraphQL-aware assistant</h2>

        <p>
          You&apos;re going to build a CLI assistant that answers questions about a small fake &quot;company&quot; — users, projects, and issues — by calling tools that simulate GraphQL resolvers. The same pattern works for a real GraphQL backend: replace the in-memory store with a <code>WebClient</code> that POSTs queries.
        </p>

        <Callout variant="spring" title="What you'll wire up">
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>A <code>FakeGraph</code> service holding the seed data (users, projects, issues).</li>
            <li>Three tools — <code>findUser</code>, <code>listProjects</code>, <code>findIssuesByLabel</code>.</li>
            <li>A <code>GraphAssistant</code> service that calls Claude with all three tools registered.</li>
            <li>A <code>CommandLineRunner</code> that lets you ask the assistant questions interactively.</li>
          </ul>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 1 — Scaffold the project</h3>
        <p>Same flow as Modules 9 and 10. Either path works:</p>

        <Callout variant="info" title="Path A — Browser (start.spring.io)">
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            <li>Open this pre-filled link: <a className="text-indigo-600 hover:underline" href="https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.1&packaging=jar&jvmVersion=21&groupId=com.example&artifactId=graph-assistant&name=graph-assistant&description=GraphQL-aware%20assistant&packageName=com.example.graph&dependencies=spring-ai-anthropic" target="_blank" rel="noreferrer">start.spring.io with everything pre-filled</a>.</li>
            <li>Click <strong>GENERATE</strong> at the bottom.</li>
            <li>Unzip the download somewhere sensible — e.g. <code>~/code/graph-assistant</code>.</li>
            <li>Open the folder in your editor.</li>
          </ol>
        </Callout>

        <Callout variant="info" title="Path B — IntelliJ Initializr">
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            <li><strong>File → New → Project → Spring Initializr</strong>.</li>
            <li>Group <code>com.example</code>, Artifact <code>graph-assistant</code>, Type <strong>Maven</strong>, Language <strong>Java</strong>, JDK <strong>21</strong>, Packaging <strong>Jar</strong>.</li>
            <li>Next. Spring Boot <strong>3.4.x</strong>. In Dependencies, add <strong>Anthropic (Spring AI)</strong>.</li>
            <li>Finish. IntelliJ resolves Maven on first open.</li>
          </ol>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 2 — Verify scaffold</h3>
        <CodeBlock lang="plain">{`cd ~/code/graph-assistant
./mvnw -version    # should print Maven + JDK 21
ls src/main/java/com/example/graph/    # should contain GraphAssistantApplication.java`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 3 — Set your API key</h3>
        <CodeBlock lang="plain">{`export ANTHROPIC_API_KEY="sk-ant-..."`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 4 — application.properties</h3>
        <CodeBlock lang="plain" caption="src/main/resources/application.properties">{`spring.application.name=graph-assistant
spring.main.web-application-type=none
spring.main.banner-mode=off
logging.level.root=WARN

spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-5
spring.ai.anthropic.chat.options.temperature=0.2
spring.ai.anthropic.chat.options.max-tokens=1024`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 5 — The fake graph backend</h3>
        <p>This stand-in for a real GraphQL service holds three tables in memory:</p>

        <CodeBlock lang="java" caption="src/main/java/com/example/graph/FakeGraph.java">{`package com.example.graph;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class FakeGraph {

  public record User(Long id, String email, String name, String plan) {}
  public record Project(Long id, String name, String owner) {}
  public record Issue(Long id, Long projectId, String title, List<String> labels, String status) {}

  private final List<User> users = List.of(
      new User(1L, "alice@acme.com", "Alice", "pro"),
      new User(2L, "bob@acme.com",   "Bob",   "free"),
      new User(3L, "carol@acme.com", "Carol", "pro")
  );

  private final List<Project> projects = List.of(
      new Project(10L, "billing-api",  "alice@acme.com"),
      new Project(11L, "mobile-app",   "bob@acme.com"),
      new Project(12L, "data-platform","carol@acme.com")
  );

  private final List<Issue> issues = List.of(
      new Issue(100L, 10L, "Webhook signature broken",      List.of("bug","p0"),     "OPEN"),
      new Issue(101L, 10L, "Add Stripe radar rules",        List.of("feature"),      "IN_PROGRESS"),
      new Issue(102L, 11L, "iOS keyboard hides input",      List.of("bug","ios"),    "OPEN"),
      new Issue(103L, 12L, "Backfill historical embeddings",List.of("infra","p1"),   "OPEN"),
      new Issue(104L, 12L, "Migrate to pgvector 0.7",       List.of("infra"),        "CLOSED")
  );

  public Optional<User> findUser(String email) {
    return users.stream().filter(u -> u.email().equalsIgnoreCase(email)).findFirst();
  }

  public List<Project> listProjects() { return projects; }

  public List<Issue> findIssuesByLabel(String label) {
    return issues.stream().filter(i -> i.labels().contains(label)).toList();
  }
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 6 — Wrap it as tools</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/graph/GraphTools.java">{`package com.example.graph;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GraphTools {

  private final FakeGraph graph;

  public GraphTools(FakeGraph graph) {
    this.graph = graph;
  }

  @Tool(description = "Look up a user by email. Returns id, name, email, and plan tier (free or pro).")
  public FakeGraph.User findUser(
      @ToolParam(description = "Email address, e.g. alice@acme.com") String email) {
    return graph.findUser(email).orElse(null);
  }

  @Tool(description = "List every project in the company. Returns id, name, and owner email for each.")
  public List<FakeGraph.Project> listProjects() {
    return graph.listProjects();
  }

  @Tool(description = "Find issues that have a given label. Common labels: bug, feature, infra, p0, p1, ios. Returns id, projectId, title, labels, status.")
  public List<FakeGraph.Issue> findIssuesByLabel(
      @ToolParam(description = "A single label string, e.g. 'bug' or 'p0'") String label) {
    return graph.findIssuesByLabel(label);
  }
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 7 — The assistant service</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/graph/GraphAssistant.java">{`package com.example.graph;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class GraphAssistant {

  private static final String SYSTEM = """
      You are an internal assistant for a small engineering company.
      You can call tools to fetch users, projects, and issues.
      Always call a tool to answer questions about live data — do not guess.
      Keep replies short and factual. If a tool returns no results, say so plainly.
      """;

  private final ChatClient chat;
  private final GraphTools tools;

  public GraphAssistant(ChatClient.Builder builder, GraphTools tools) {
    this.chat = builder.defaultSystem(SYSTEM).build();
    this.tools = tools;
  }

  public String ask(String question) {
    return chat.prompt()
        .user(question)
        .tools(tools)
        .call()
        .content();
  }
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 8 — CLI runner</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/graph/GraphCli.java">{`package com.example.graph;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Scanner;

@Component
public class GraphCli implements CommandLineRunner {

  private final GraphAssistant assistant;

  public GraphCli(GraphAssistant assistant) {
    this.assistant = assistant;
  }

  @Override
  public void run(String... args) {
    System.out.println("=== Graph Assistant ===");
    System.out.println("Try: 'what plan is alice@acme.com on?'  or  'show me bugs'");
    System.out.println("Type 'quit' to exit.\\n");

    Scanner in = new Scanner(System.in);
    while (true) {
      System.out.print("you> ");
      if (!in.hasNextLine()) break;
      String q = in.nextLine().trim();
      if (q.isEmpty()) continue;
      if (q.equalsIgnoreCase("quit")) break;
      try {
        String reply = assistant.ask(q);
        System.out.println("\\nassistant> " + reply + "\\n");
      } catch (Exception e) {
        System.out.println("\\n[error] " + e.getMessage() + "\\n");
      }
    }
    System.out.println("Bye.");
  }
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 9 — Run it</h3>
        <CodeBlock lang="plain">{`./mvnw spring-boot:run`}</CodeBlock>

        <p className="mt-3">Expected session:</p>
        <CodeBlock lang="plain">{`=== Graph Assistant ===
Try: 'what plan is alice@acme.com on?'  or  'show me bugs'
Type 'quit' to exit.

you> what plan is alice@acme.com on?

assistant> Alice is on the pro plan.

you> show me open bugs

assistant> There are two open bugs:
- #100 "Webhook signature broken" (project 10, labels: bug, p0)
- #102 "iOS keyboard hides input" (project 11, labels: bug, ios)

you> who owns the data-platform project, and what infra issues do they have?

assistant> The data-platform project is owned by carol@acme.com. Two issues are
labeled 'infra': #103 "Backfill historical embeddings" (OPEN) and #104
"Migrate to pgvector 0.7" (CLOSED).

you> quit
Bye.`}</CodeBlock>

        <Callout variant="warn" title="Common errors & fixes">
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>&quot;No qualifying bean of type ChatClient.Builder&quot;</strong> — your <code>pom.xml</code> is missing <code>spring-ai-starter-model-anthropic</code>. Re-check the dependency.</li>
            <li><strong>Model never calls a tool, just makes things up</strong> — your tool descriptions are too vague. Beef them up; add example values.</li>
            <li><strong>Loop runs a handful of tool calls and aborts</strong> — Spring AI&apos;s tool-execution loop has a built-in iteration cap to prevent runaway loops. Either your tool returns nonsense (check what it returns by logging), or the question genuinely needs more steps. Raise the cap by configuring a custom <code>ToolCallingManager</code> bean with a higher <code>maxIterations</code> value and wiring it into your <code>ChatClient.Builder</code>.</li>
            <li><strong>Tool runs but model says &quot;I don&apos;t have access&quot;</strong> — usually means the tool returned <code>null</code> or threw silently. Check stdout; consider returning an explicit error string.</li>
          </ul>
        </Callout>

        <Checkpoint moduleSlug="tool-use" id="project" title="Project: GraphQL-aware assistant" xp={50} manual manualLabel="I built it and it works">
          <p>
            Run a couple of multi-step questions through it. Watch how the model chains tool calls — &quot;who owns data-platform and what infra issues exist&quot; needs <code>listProjects</code> then <code>findIssuesByLabel</code>. If you can answer real ops questions about your fake company through plain English, you have built the foundation of every &quot;copilot&quot; product on the market.
          </p>
        </Checkpoint>
      </section>

      {/* ===================== Part 6: Final Quiz ===================== */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final quiz"
          question="A user asks 'cancel all my open subscriptions.' Your assistant has a cancelSubscription(id) tool. What's the production-grade way to handle this?"
          options={[
            { label: "Just register the tool — let the model loop over IDs", explanation: "That's how production incidents are made. Bulk destructive ops without confirmation is how junior assistants delete prod data." },
            { label: "Refuse — never let an LLM call cancellation tools", explanation: "Too cautious. The whole value of tool use is enabling real workflows. The right answer is human-in-the-loop, not no-loop." },
            { label: "Two-step: a previewCancellations() tool returns the list; the UI shows a confirm dialog; user clicks confirm; only then call cancelSubscription(id)", correct: true, explanation: "Right. The model orchestrates discovery; the human authorizes the destructive step. This is the dominant pattern for any 'cancel/delete/archive/refund' tool in production." },
            { label: "Add 'be careful' to the system prompt", explanation: "Prompts are not authorization. The model will still happily call destructive tools; you just feel slightly less guilty about it." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You add a fifteenth tool, and now the model starts calling tools at random — picking the wrong one for obvious questions. Why?"
          options={[
            { label: "The model has a hard limit of 14 tools", explanation: "There's no hard limit at 14. The issue is descriptive, not numerical." },
            { label: "Tool descriptions overlap or are too vague — with 15 options the model can't disambiguate", correct: true, explanation: "Right. Every additional tool adds disambiguation difficulty. If two tools have similar descriptions, the model coin-flips. Tighten descriptions; consolidate near-duplicates; or split into per-domain assistants each with a smaller toolkit." },
            { label: "You hit the API's tool count rate limit", explanation: "There's no per-call tool rate limit at this size; the issue is tool selection accuracy." },
            { label: "The temperature is too high", explanation: "Temperature affects token sampling, not tool routing logic. Description quality is the lever." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You log every tool invocation: input args, return value, latency. A teammate sees the logs and says 'we have a PII problem.' What likely happened?"
          options={[
            { label: "The model leaked a system prompt", explanation: "System prompt logging is a separate concern; that's not what tool logs would show." },
            { label: "Tool return values contained sensitive fields (SSN, full address) that got persisted to logs", correct: true, explanation: "Right. Tool results are application-controlled data — if your findUser returns the whole row, all of it ends up in logs and in the model's context. Strip sensitive fields inside the tool before returning, and redact in the logger as a defense-in-depth layer." },
            { label: "The user typed PII into the prompt", explanation: "User-typed PII is a real problem too, but the framing 'we have a PII problem' from someone reading tool logs points at tool return values." },
            { label: "The tool schema exposed PII fields", explanation: "Schemas describe shape, not values; they don't contain user data." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="When does .entity(SomeClass.class) (Module 10) make more sense than tool use?"
          options={[
            { label: "When the answer requires live data the model doesn't have", explanation: "That's exactly when you'd want tool use — to fetch the live data." },
            { label: "When you want a single structured response from the model based only on prompt content (sentiment of an entry, classification of a ticket, extraction from a document)", correct: true, explanation: "Right. .entity() is for 'shape this answer as JSON.' Tool use is for 'go fetch or do something, then answer.' Use the simplest tool that fits — .entity() is one round trip, tools are many." },
            { label: "Never — tool use can do everything .entity() can", explanation: "Tool use is more powerful but also more expensive (multiple round trips). For pure transformation tasks, .entity() is cheaper and simpler." },
            { label: "When you're working with conversation memory", explanation: "Memory is orthogonal to both — you can combine memory with .entity() or with tool use." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="A coworker proposes 'let's just build one giant tool that takes a JSON query and dispatches to anything.' Why is this almost always a bad idea?"
          options={[
            { label: "It works fine — the model is smart enough to construct the JSON", explanation: "It might work for simple cases, but it discards the entire benefit of typed schemas." },
            { label: "The model loses the typed schema — it now has to invent JSON shape from a prose description, lowering reliability and removing IDE/test safety on your side", correct: true, explanation: "Right. Multiple narrowly-typed tools give the model strong constraints (enums, required fields) AND give your service strongly-typed inputs. A 'do anything' tool throws both away — you get back unvalidated JSON, the model gets a fuzzy spec, and bugs hide on both sides." },
            { label: "The Anthropic API doesn't support generic tools", explanation: "There's no API restriction; the issue is design, not protocol." },
            { label: "Spring AI doesn't support nested objects", explanation: "Spring AI handles nested records and complex types just fine — this isn't a tooling limitation." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="tool-use" id="final" title="Module complete" xp={40}>
          <p>
            You can now hand a model a typed view of your application&apos;s capabilities and let it orchestrate them. The next module — <Link href="/courses/ai/modules/streaming" className="text-indigo-600 hover:underline">Streaming with SSE</Link> — solves the latency problem you definitely noticed: every <code>.call()</code> blocks until the entire response is generated. Streaming gives you token-by-token output, which transforms the UX of any chat interface.
          </p>
        </Checkpoint>
      </section>

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/spring-ai" className="text-indigo-600 hover:underline">← Module 10: Spring AI integration</Link>
        <Link href="/courses/ai/modules/streaming" className="text-indigo-600 hover:underline">Module 12: Streaming with SSE →</Link>
      </div>
        <ModuleNav courseId="ai" currentSlug="tool-use" />
    </article>
  );
}
