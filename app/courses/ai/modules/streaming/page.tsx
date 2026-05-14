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
  { id: "why-stream", title: "Why stream at all" },
  { id: "sse-mechanics", title: "SSE mechanics" },
  { id: "spring-flux", title: "Spring AI .stream() & Flux" },
  { id: "browser-side", title: "Consuming SSE in the browser" },
  { id: "project", title: "Project: live story generator" },
  { id: "final", title: "Final quiz" },
];

export default function StreamingModule() {
  const mod = getModuleBySlug("streaming")!;

  const flowDiagram = `
sequenceDiagram
    participant Browser
    participant Spring as Spring Boot
    participant Claude
    Browser->>Spring: GET /story/stream?topic=dragons
    Spring->>Claude: POST /v1/messages (stream=true)
    Claude-->>Spring: chunk: "Once"
    Spring-->>Browser: data: Once
    Claude-->>Spring: chunk: " upon"
    Spring-->>Browser: data: " upon"
    Claude-->>Spring: chunk: " a time"
    Spring-->>Browser: data: " a time"
    Claude-->>Spring: [DONE]
    Spring-->>Browser: event: done
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
          Streaming with Server-Sent Events
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Token-by-token from Claude → Spring Boot → the browser. The UX upgrade users notice instantly.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="streaming" />
        <ModuleProgress moduleSlug="streaming" checkpoints={CHECKPOINTS} />
      </header>

      <Callout variant="insight" title="What changes">
        <p>
          Every <code>.call()</code> you&apos;ve made so far blocks until the entire response is generated. For a 500-token reply at ~50 tok/s that&apos;s a 10-second blank screen. Streaming returns tokens as they&apos;re produced — the user sees the first word in ~300ms and reads along while generation continues. Same total wait, dramatically better experience.
        </p>
      </Callout>

      {/* ===================== Part 1 ===================== */}
      <section id="why-stream">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 1 — Why stream at all</h2>

        <p>
          Time-to-first-token vs. time-to-completion. They&apos;re wildly different. With <code>.call()</code> they look identical to the user — both are the same wait. With streaming you collapse <em>perceived</em>{" "}latency to the time-to-first-token, while total generation time stays the same.
        </p>

        <CodeBlock lang="plain">{`Reply: 500 tokens, model speed: ~50 tok/s

.call()  -> [silence][silence]...[10s pass]...[full response appears]
.stream()-> [first word at ~300ms][... continues word-by-word for 10s]`}</CodeBlock>

        <p className="mt-4">
          Users perceive the streamed version as <strong>3-5x faster</strong>{" "}in usability studies, even though total generation is unchanged. The cost of <em>not</em>{" "}streaming a chat UI is a product that feels broken next to a competitor that does stream.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">When NOT to stream</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Structured output (<code>.entity()</code>)</strong> — you can&apos;t parse partial JSON safely. Wait for the full response.</li>
          <li><strong>Tool use loops</strong> — intermediate tool calls happen mid-stream and complicate the UI. Stream only the final natural-language response, or use a richer protocol.</li>
          <li><strong>Server-side processing</strong> — if you&apos;re going to embed/index/post-process the reply, just call and wait. Streaming buys you nothing.</li>
        </ul>

        <Callout variant="info" title="Streaming = transport, not generation">
          <p>
            The model itself doesn&apos;t generate &quot;faster&quot; in stream mode — it just hands tokens to you as they&apos;re produced rather than buffering until done. The Anthropic API supports both modes against the same model with the same total tokens billed.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="A user asks your assistant 'summarize this PDF' and your handler calls .stream(). Total generation: 8 seconds. Time-to-first-token: 400ms. Compared to .call(), what's better and what's the same?"
          options={[
            { label: "Both total time and perceived time are halved", explanation: "Streaming doesn't change generation speed; the model produces the same tokens at the same rate." },
            { label: "Total generation time is the same (~8s); perceived time drops dramatically because the user starts reading at 400ms", correct: true, explanation: "Right. Streaming is a UX win, not a throughput win. The 8-second wall-clock to finish is unchanged, but users read alongside generation, so they don't experience it as 8 seconds of waiting." },
            { label: "Total time gets longer because of SSE overhead", explanation: "SSE overhead is negligible (a few bytes per chunk). Total generation time is essentially identical." },
            { label: "First-token latency gets worse with streaming", explanation: "The opposite — streaming exposes first-token latency, where .call() hides it inside total wait time." },
          ]}
          xp={10}
        />

        <Checkpoint moduleSlug="streaming" id="why-stream" title="Why stream at all" xp={20}>
          <PartRecap
            title="Part 1 recap"
            gist="Streaming is a UX optimization. It changes when bytes arrive, not how many."
            points={[
              { takeaway: "Time-to-first-token is what users feel. Streaming pushes it from 'whole reply' down to 'first chunk'.", detail: "Same total generation time, but perceived latency drops 5-10x for any reply over a few hundred tokens." },
              { takeaway: "Don't stream structured output or tool-loop intermediate steps.", detail: "Partial JSON can't be parsed. Tool calls require fully-formed structured responses to dispatch. Stream the final natural-language layer only." },
              { takeaway: "Streaming is transport, not generation. Same tokens, same cost, different delivery.", detail: "The model produces tokens at the same rate either way — streaming just hands them off chunk-by-chunk instead of all at once." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 2 ===================== */}
      <section id="sse-mechanics">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 2 — SSE mechanics</h2>

        <p>
          You have three real choices for streaming server → browser: <strong>Server-Sent Events (SSE)</strong>, <strong>WebSockets</strong>, and <strong>chunked HTTP</strong>. For LLM streaming, SSE is almost always the right answer.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">SSE in 30 seconds</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>It&apos;s plain HTTP — works through firewalls, proxies, CDNs, no upgrade dance.</li>
          <li>One-way, server → client. (LLM responses are one-way — perfect fit.)</li>
          <li>The server sets <code>Content-Type: text/event-stream</code> and writes lines like <code>data: hello\n\n</code>.</li>
          <li>The browser&apos;s built-in <code>EventSource</code> reads the stream and fires events.</li>
          <li>Auto-reconnect, last-event-id, named events — all in the spec.</li>
        </ul>

        <CodeBlock lang="plain" caption="The wire format — this is literally what Spring writes to the socket">{`HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: Once

data:  upon

data:  a

data:  time

event: done
data: {"totalTokens": 412}

`}</CodeBlock>

        <p className="mt-4">
          The format is whitespace-significant: each event is delimited by a blank line. Multiple <code>data:</code> lines in a row concatenate (joined by <code>\n</code>) into one message. <code>event: name</code> labels the event so the browser can listen for it specifically.
        </p>

        <Mermaid chart={flowDiagram} />

        <h3 className="text-xl font-semibold mt-8 mb-3">Why not WebSockets?</h3>
        <p>
          WebSockets are bidirectional, which is overkill for streaming a response. They require an upgrade handshake, don&apos;t play as nicely with HTTP middleware, and you have to handle reconnection yourself. <strong>Use WebSockets when both directions need to push data live</strong> (collaborative editing, multiplayer games). For LLM responses, SSE is simpler in every way.
        </p>

        <Callout variant="warn" title="Buffering is the silent killer">
          <p>
            Reverse proxies (nginx, HAProxy, ALB) and frameworks (Spring&apos;s default) sometimes buffer responses. If you set up SSE and your client only sees the full stream at the end, suspect buffering. Headers to set: <code>Cache-Control: no-cache</code>, <code>X-Accel-Buffering: no</code> (nginx). On Spring side, return a <code>Flux</code>, not a <code>String</code> — Spring streams reactive types automatically.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You set up SSE; locally curl shows tokens arriving live, but in browser the response shows up all at once at the end. Most likely cause?"
          options={[
            { label: "EventSource is broken", explanation: "EventSource is a stable, well-supported browser API. The issue is almost never the client." },
            { label: "An intermediate proxy or load balancer is buffering — it waits for the full body before forwarding", correct: true, explanation: "Right. nginx, ELB, Cloudflare, etc. can buffer in default config. Set X-Accel-Buffering: no on responses, or configure proxy_buffering off in nginx. Curl bypasses these layers, which is why local works." },
            { label: "Anthropic API isn't streaming", explanation: "If curl shows live tokens, Anthropic is streaming fine through your server. The drop is between server and browser." },
            { label: "You forgot Content-Type: application/json", explanation: "SSE needs Content-Type: text/event-stream — application/json would be wrong, but that's not the buffering symptom." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="streaming" id="sse-mechanics" title="SSE mechanics" xp={20}>
          <PartRecap
            title="Part 2 recap"
            gist="SSE is plain HTTP with a special content type. Server writes events; browser reads them via EventSource."
            points={[
              { takeaway: "SSE is one-way server→client over HTTP — no upgrade, no negotiation.", detail: "Goes through every proxy, firewall, and CDN you've ever met. WebSockets require special handling that SSE doesn't." },
              { takeaway: "Wire format: 'data: ...' lines, separated by blank lines.", detail: "Optional 'event: name' labels for typed events, optional 'id:' for resumability via Last-Event-ID. Spec is small and stable since 2009." },
              { takeaway: "Buffering at proxies is the #1 SSE failure mode.", detail: "If curl works but browser doesn't, blame the load balancer. Disable buffering with X-Accel-Buffering: no and proxy_buffering off." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 3 ===================== */}
      <section id="spring-flux">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 3 — Spring AI <code>.stream()</code> &amp; Flux</h2>

        <p>
          Spring AI&apos;s streaming API mirrors the call API. Where <code>.call()</code> returns a <code>ChatResponse</code> (or <code>String</code> via <code>.content()</code>), <code>.stream()</code> returns a <strong>reactive <code>Flux</code></strong> — a stream of zero-or-more values produced asynchronously.
        </p>

        <CodeBlock lang="java" caption="Three forms of .stream()">{`// Strings, one per chunk
Flux<String> chunks = chatClient.prompt()
    .user("Tell me a story about dragons")
    .stream()
    .content();

// Full ChatResponse per chunk (includes usage on final chunk)
Flux<ChatResponse> responses = chatClient.prompt()
    .user("Tell me a story about dragons")
    .stream()
    .chatResponse();

// Subscribe and print to stdout
chunks.subscribe(System.out::print);`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Flux in 60 seconds</h3>
        <p>
          A <code>Flux&lt;T&gt;</code> is from Project Reactor (Spring&apos;s reactive library). Think of it as a lazy, async <code>Stream&lt;T&gt;</code> — you describe operations on it, and they don&apos;t run until something subscribes.
        </p>

        <CodeBlock lang="java" caption="Common operators you'll use">{`Flux<String> chunks = chatClient.prompt().user(q).stream().content();

// Map chunks → uppercase
chunks.map(String::toUpperCase);

// Drop empty chunks (model occasionally emits them)
chunks.filter(s -> !s.isEmpty());

// Side-effect on each chunk (logging, metrics)
chunks.doOnNext(s -> log.info("chunk: '{}'", s));

// Aggregate the full reply at the end
Mono<String> fullText = chunks.collect(Collectors.joining());

// Block and get the full reply (anti-pattern in a controller, fine for tests)
String full = chunks.collect(Collectors.joining()).block();`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Returning a Flux from a Spring controller</h3>
        <p>
          This is where it all clicks. Spring WebFlux and Spring MVC both let you <strong>return a <code>Flux</code> directly</strong>{" "}from a controller method, and Spring serializes it as SSE for you:
        </p>

        <CodeBlock lang="java" caption="The whole streaming endpoint, in 12 lines">{`@RestController
public class StoryController {

  private final ChatClient chat;

  public StoryController(ChatClient.Builder builder) {
    this.chat = builder.build();
  }

  @GetMapping(value = "/story/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<String> stream(@RequestParam String topic) {
    return chat.prompt()
        .user("Tell me a 200-word story about " + topic)
        .stream()
        .content();
  }
}`}</CodeBlock>

        <p className="mt-4">
          The <code>produces = TEXT_EVENT_STREAM_VALUE</code> flag tells Spring &quot;serialize each <code>Flux</code> emission as one SSE event.&quot; Each <code>String</code> chunk becomes <code>data: &lt;chunk&gt;\n\n</code> on the wire. That&apos;s it.
        </p>

        <Callout variant="spring" title="Reactive doesn't mean WebFlux">
          <p>
            You don&apos;t need <code>spring-boot-starter-webflux</code> to return a <code>Flux</code>. Spring MVC since 5.2 supports reactive return types over its servlet stack — Spring will use async dispatch internally. Stick with MVC unless your whole app is reactive; mixing the two stacks is more pain than it&apos;s worth.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You write the controller above. You hit /story/stream?topic=dragons in your browser and see... nothing, then the entire response at the end. Curl works fine. What's the most likely cause inside Spring?"
          options={[
            { label: "Returning Flux<String> with TEXT_EVENT_STREAM_VALUE — Spring won't auto-stream that combo", explanation: "Spring will absolutely stream this combo. That's the supported pattern." },
            { label: "A Spring response filter or interceptor wrapping the body — most commonly a content-encoding (gzip) handler buffering", correct: true, explanation: "Right. Compression filters (and many error-handling wrappers) consume the full Flux to compute Content-Length before sending. Disable gzip for SSE endpoints, or check for any filter that wraps HttpServletResponse." },
            { label: "EventSource doesn't support Spring's SSE format", explanation: "Spring's SSE output is standards-compliant. EventSource handles it natively." },
            { label: "Flux is buffered by default", explanation: "Flux is lazy and per-element by default. Nothing buffers unless you explicitly call .collect()." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="streaming" id="spring-flux" title="Spring AI .stream() & Flux" xp={25}>
          <PartRecap
            title="Part 3 recap"
            gist=".stream().content() returns Flux<String>. Return that from a controller with TEXT_EVENT_STREAM_VALUE and you're done."
            points={[
              { takeaway: "ChatClient.stream() returns a Flux of chunks; .call() returns a single response.", detail: "Mirror APIs. Flux is lazy — nothing happens until something subscribes (the controller framework, in our case)." },
              { takeaway: "Returning Flux from a @GetMapping with TEXT_EVENT_STREAM_VALUE makes Spring stream each emission as one SSE event.", detail: "No manual SseEmitter, no thread management. Spring handles the async dispatch and writes each chunk as 'data: ...\\n\\n'." },
              { takeaway: "Common operators: .map, .filter, .doOnNext, .collect(joining()).", detail: "Treat Flux like a lazy Stream. .doOnNext is your hook for logging and metrics on each chunk; .collect at the end is how you'd persist the full reply for memory." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 4 ===================== */}
      <section id="browser-side">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 4 — Consuming SSE in the browser</h2>

        <p>
          The browser side is one built-in API: <code>EventSource</code>. No library needed.
        </p>

        <CodeBlock lang="plain" caption="vanilla JS — drop into any HTML page">{`const out = document.getElementById("output");
const es  = new EventSource("/story/stream?topic=dragons");

es.onmessage = (ev) => {
  out.textContent += ev.data;     // append each chunk as it arrives
};

es.addEventListener("done", () => {
  es.close();
});

es.onerror = (err) => {
  console.error("SSE error", err);
  es.close();
};`}</CodeBlock>

        <p className="mt-4">
          <code>onmessage</code> handles unnamed events (the <code>data: ...</code> lines from the default Spring serialization). Spring also auto-emits a final completion signal you can catch.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">React patterns (preview — Phase 4 covers this in depth)</h3>
        <CodeBlock lang="plain" caption="Bare-bones React hook for streamed text">{`function useStream(url) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!url) return;
    setText(""); setDone(false);
    const es = new EventSource(url);
    es.onmessage = (ev) => setText(t => t + ev.data);
    es.addEventListener("done", () => { setDone(true); es.close(); });
    es.onerror = () => { setDone(true); es.close(); };
    return () => es.close();
  }, [url]);

  return { text, done };
}`}</CodeBlock>

        <Callout variant="warn" title="EventSource gotchas">
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Only GET</strong> — no POST. If your prompt is too long for a query string, either gzip-encode it or use the streaming variant of <code>fetch</code> with a <code>ReadableStream</code> reader instead.</li>
            <li><strong>No custom headers</strong> — including <code>Authorization</code>. Browsers ship with this limit. Workaround: cookies, or use <code>fetch</code> + manual SSE parsing.</li>
            <li><strong>Auto-reconnects on disconnect</strong> — usually a feature, but for one-shot generations it can re-fire your prompt. Always <code>es.close()</code> on completion.</li>
          </ul>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You need to send a JSON body of 5KB with structured prompt input. Why does this push you off EventSource onto fetch + ReadableStream?"
          options={[
            { label: "EventSource doesn't support content-type text/event-stream", explanation: "It does — that's literally its content type." },
            { label: "EventSource is GET-only and can't send a request body — 5KB exceeds practical URL length, so you can't pass it as a query string", correct: true, explanation: "Right. The browser's EventSource API only does GET. Once your input outgrows ~2KB of query string, you need fetch (which supports POST + body) and you parse the SSE stream manually from response.body.getReader()." },
            { label: "Spring can't accept POST with TEXT_EVENT_STREAM_VALUE", explanation: "Spring is fine with this — the limitation is the browser-side EventSource API." },
            { label: "EventSource doesn't reconnect on errors", explanation: "It does reconnect automatically — sometimes too aggressively, in fact." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="streaming" id="browser-side" title="Consuming SSE in the browser" xp={20}>
          <PartRecap
            title="Part 4 recap"
            gist="EventSource is built-in, simple, and limited to GET. Use fetch + ReadableStream when you need POST or custom headers."
            points={[
              { takeaway: "EventSource handles message events, named events, reconnection — all built-in.", detail: "onmessage for default 'data: ...' events; addEventListener('name', ...) for named ones. Always close on completion to stop reconnect attempts." },
              { takeaway: "Limitations: GET-only, no custom headers (so no Authorization), auto-reconnect can resubmit prompts.", detail: "These are the three reasons real apps end up on fetch + ReadableStream instead. The trade-off is you parse the SSE format yourself." },
              { takeaway: "Phase 4 covers the React-side polish — typing indicators, optimistic UI, error recovery.", detail: "This module gets you to a working stream end-to-end. Layered UX comes later when we build the chat UI components." },
            ]}
          />
        </Checkpoint>
      </section>

      {/* ===================== Part 5: Project ===================== */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 5 — Project: Live story generator</h2>

        <p>
          A web endpoint that streams a short story about whatever topic you give it, plus a one-page HTML client to watch it stream live in your browser. End-to-end: Claude → Spring → SSE → browser.
        </p>

        <Callout variant="spring" title="What you'll build">
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>A <code>StoryController</code> with <code>GET /story/stream?topic=...</code> returning <code>Flux&lt;String&gt;</code>.</li>
            <li>A second endpoint <code>GET /</code> that serves a tiny HTML page with the EventSource client.</li>
            <li>(Optional) <code>doOnNext</code> logging so you can watch chunks roll past in your console.</li>
          </ul>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 1 — Scaffold</h3>
        <Callout variant="info" title="Path A — Browser (start.spring.io)">
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            <li>Open the <a className="text-indigo-600 hover:underline" href="https://start.spring.io/#!type=maven-project&language=java&platformVersion=3.4.1&packaging=jar&jvmVersion=21&groupId=com.example&artifactId=story-stream&name=story-stream&description=Streaming%20story%20generator&packageName=com.example.story&dependencies=spring-ai-anthropic,web" target="_blank" rel="noreferrer">pre-filled link</a> (note: this one includes <strong>Spring Web</strong>{" "}in addition to Anthropic — we&apos;re running an HTTP server now).</li>
            <li>Click <strong>GENERATE</strong>, unzip to <code>~/code/story-stream</code>.</li>
          </ol>
        </Callout>

        <Callout variant="info" title="Path B — IntelliJ Initializr">
          <ol className="list-decimal pl-6 space-y-1 mt-2">
            <li><strong>File → New → Project → Spring Initializr</strong>. Group <code>com.example</code>, Artifact <code>story-stream</code>, Maven, Java 21, Jar.</li>
            <li>In Dependencies pick <strong>Spring Web</strong>{" "}AND <strong>Anthropic (Spring AI)</strong>.</li>
            <li>Finish.</li>
          </ol>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 2 — Verify scaffold</h3>
        <CodeBlock lang="plain">{`cd ~/code/story-stream
./mvnw -version
ls src/main/java/com/example/story/`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 3 — Set API key</h3>
        <CodeBlock lang="plain">{`export ANTHROPIC_API_KEY="sk-ant-..."`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 4 — application.properties</h3>
        <CodeBlock lang="plain" caption="src/main/resources/application.properties">{`spring.application.name=story-stream
server.port=8080

spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-5
spring.ai.anthropic.chat.options.max-tokens=512
spring.ai.anthropic.chat.options.temperature=0.9`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 5 — The streaming controller</h3>
        <CodeBlock lang="java" caption="src/main/java/com/example/story/StoryController.java">{`package com.example.story;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
public class StoryController {

  private static final Logger log = LoggerFactory.getLogger(StoryController.class);

  private static final String SYSTEM = """
      You are a vivid, concise short-story writer.
      Write in the present tense. ~150 words. End with a single-sentence twist.
      """;

  private final ChatClient chat;

  public StoryController(ChatClient.Builder builder) {
    this.chat = builder.defaultSystem(SYSTEM).build();
  }

  @GetMapping(value = "/story/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<String> stream(@RequestParam String topic) {
    log.info("Streaming story for topic={}", topic);
    return chat.prompt()
        .user("Topic: " + topic)
        .stream()
        .content()
        .doOnNext(chunk -> log.debug("chunk: '{}'", chunk));
  }
}`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 6 — Static HTML client</h3>
        <p>
          Drop a single HTML file in <code>src/main/resources/static/index.html</code>. Spring Boot serves anything in <code>static/</code> at the root URL by default.
        </p>
        <CodeBlock lang="plain" caption="src/main/resources/static/index.html">{`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Story Stream</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 3rem auto; padding: 0 1rem; }
    input, button { font-size: 1rem; padding: .4rem .6rem; }
    pre { white-space: pre-wrap; line-height: 1.5; background: #f6f6f6; padding: 1rem; border-radius: 8px; min-height: 6rem; }
    .status { color: #888; font-size: .85rem; margin-top: .5rem; }
  </style>
</head>
<body>
  <h1>Live Story Generator</h1>
  <p>Type a topic, hit Enter, watch Claude write live.</p>
  <input id="topic" placeholder="dragons in space" autofocus>
  <button id="go">Generate</button>
  <pre id="out"></pre>
  <div class="status" id="status"></div>

  <script>
    const $ = (id) => document.getElementById(id);
    let es = null;
    function start() {
      const topic = $("topic").value.trim();
      if (!topic) return;
      if (es) es.close();
      $("out").textContent = "";
      $("status").textContent = "streaming...";
      es = new EventSource("/story/stream?topic=" + encodeURIComponent(topic));
      es.onmessage = (ev) => { $("out").textContent += ev.data; };
      es.onerror = () => { $("status").textContent = "done"; es.close(); };
    }
    $("go").onclick = start;
    $("topic").addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
  </script>
</body>
</html>`}</CodeBlock>

        <h3 className="text-xl font-semibold mt-8 mb-3">Step 7 — Run it</h3>
        <CodeBlock lang="plain">{`./mvnw spring-boot:run`}</CodeBlock>

        <p className="mt-3">Then open <a className="text-indigo-600 hover:underline" href="http://localhost:8080" target="_blank" rel="noreferrer">http://localhost:8080</a>. Type a topic and hit Generate — words should start appearing within ~300ms and continue rolling for 5-10 seconds.</p>

        <p className="mt-3">Or test the stream directly:</p>
        <CodeBlock lang="plain">{`curl -N "http://localhost:8080/story/stream?topic=dragons"

# Expected output (live, character by character):
data: Once

data:  upon

data:  a

data:  time
... (etc)`}</CodeBlock>

        <Callout variant="warn" title="Common errors & fixes">
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Browser shows the whole story at once</strong> — buffering. Test with <code>curl -N</code>; if curl streams but browser doesn&apos;t, suspect compression or proxy. Locally on <code>localhost</code> this should always work; if it doesn&apos;t, check that you returned <code>Flux&lt;String&gt;</code> (not <code>Mono&lt;String&gt;</code> or a collected <code>String</code>).</li>
            <li><strong>EventSource fires &quot;error&quot; immediately</strong> — usually a 500 from the backend. Check the Spring console for the real exception.</li>
            <li><strong>404 on /story/stream</strong> — make sure your controller is in a package under <code>com.example.story</code> so Spring component-scans it. Default package or wrong package = no auto-discovery.</li>
            <li><strong>No tokens at all in the stream</strong> — your <code>ANTHROPIC_API_KEY</code> isn&apos;t set in the JVM environment. Run from the same shell where you exported it, or use IDE run-config env vars.</li>
          </ul>
        </Callout>

        <Checkpoint moduleSlug="streaming" id="project" title="Ship the streamer" xp={50} manual manualLabel="It streams!">
          <p>
            Open dev tools → Network tab while it streams. You&apos;ll see the <code>/story/stream</code> request stay <em>pending</em>{" "}with bytes accumulating in real time — that&apos;s SSE in action. You now have the foundational pattern for every chat UI in Phase 4.
          </p>
        </Checkpoint>
      </section>

      {/* ===================== Part 6: Final Quiz ===================== */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-4">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final quiz"
          question="Your endpoint streams correctly to one user, but with 50 concurrent users your throughput collapses. The default Spring MVC stack uses one thread per request. What's the fix?"
          options={[
            { label: "Add more threads to the servlet container", explanation: "More threads = more memory and contention. The right answer is to stop blocking threads on long-running streams." },
            { label: "Use Spring WebFlux for the streaming endpoint, OR rely on async dispatch where MVC releases the thread between chunks", correct: true, explanation: "Right. Spring MVC actually does support async dispatch — returning a Flux releases the request thread while waiting for chunks. For very high concurrency, switching to WebFlux gives you a fully non-blocking pipeline. Either way the lever is: don't pin a thread per active stream." },
            { label: "Lower the model's temperature so responses are shorter", explanation: "Doesn't address the architectural issue, and it'd produce worse stories." },
            { label: "Buffer the response server-side before sending", explanation: "That defeats the entire point of streaming." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="A user refreshes the page mid-stream. You see your /story/stream endpoint still running on the server, racking up Claude tokens. Why, and how do you fix it?"
          options={[
            { label: "It's not actually still running — that's a logging artifact", explanation: "It is still running. Server-side, the upstream Anthropic call doesn't know the client disconnected unless you explicitly check." },
            { label: "Reactor doesn't propagate cancellation by default; you need to handle the client-disconnect signal so the upstream Flux is canceled and the API call aborted", correct: true, explanation: "Right. When the EventSource closes, Spring sees the client gone and signals cancellation on your Flux. With Spring AI, the upstream HTTP call to Anthropic is canceled too — IF the chain isn't broken. Common fix: don't .collect() or .cache() before returning; keep it lazy end-to-end. Add .doOnCancel(...) for visibility." },
            { label: "EventSource doesn't actually close on refresh", explanation: "It does — page navigation closes all open connections." },
            { label: "This is impossible — Anthropic charges by request, not tokens", explanation: "Anthropic charges by tokens. A canceled stream costs only the tokens already produced before cancellation." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You want to also persist the full text to your database after the stream completes. What's the cleanest pattern?"
          options={[
            { label: "Block on the Flux server-side, then save, then stream — defeats streaming entirely", explanation: "That makes the user wait for the full response, undoing the entire benefit." },
            { label: "Use .doOnNext to accumulate chunks into a StringBuilder, and .doOnComplete to save the assembled string after the last chunk", correct: true, explanation: "Right. Or use .collect(joining()) on a parallel branch via .publish(). Either way, you stream to the client AND build the full text on the side. Save in doOnComplete (or doFinally to handle cancellation properly)." },
            { label: "Save each chunk to the DB as it arrives", explanation: "200 DB writes per response will destroy your throughput. Aggregate first, persist once." },
            { label: "Use a second non-streaming call to fetch the full reply", explanation: "Two API calls = double the cost and the second response won't even match the first (different sample)." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="Your team wants to add 'token count' display that updates live alongside the streamed text. Which approach is sound?"
          options={[
            { label: "Count words on the client and multiply by 1.3", explanation: "Approximate at best, wrong for code/non-English/punctuation-heavy text. The model knows the real token count." },
            { label: "Use .stream().chatResponse() instead of .content() — each ChatResponse exposes usage on the final chunk; emit chunks plus final usage as named SSE events", correct: true, explanation: "Right. The full ChatResponse stream gives you per-chunk metadata, including the final usage block from Anthropic. Emit text chunks as default events and a final 'usage' named event so the client knows when totals arrive." },
            { label: "Make a parallel call without streaming and read its usage", explanation: "Doubles the bill and the totals won't match (different generation). Always read usage from the same response." },
            { label: "Anthropic doesn't return token counts mid-stream", explanation: "Anthropic returns usage in the final message-delta event, accessible via Spring AI's ChatResponse stream." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You add streaming, and now your conversation memory advisor (Module 10) silently stops working. What likely happened?"
          options={[
            { label: "ChatMemory doesn't support streaming", explanation: "It does — Spring AI's memory advisor handles both .call() and .stream()." },
            { label: "You're returning the Flux directly from the controller; the memory advisor's 'persist on completion' hook never fires because the Flux is being cancelled or not subscribed to via the framework correctly", correct: true, explanation: "Right. Memory persists on stream completion. If your Flux is consumed wrongly (eagerly collected, cancelled prematurely, or the subscription is broken by an interceptor), the completion hook doesn't fire. Audit the chain end-to-end and avoid intermediate .collect() or .block() calls." },
            { label: "You need a separate StreamingChatMemory bean", explanation: "There's no separate bean — same ChatMemory works for both modes." },
            { label: "Streaming bypasses advisors", explanation: "Streaming runs through the same advisor chain as .call()." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="streaming" id="final" title="Module complete" xp={40}>
          <p>
            You can now stream LLM output from Anthropic through Spring Boot to a browser, end to end. The next module — <Link href="/courses/ai/modules/prompt-caching" className="text-indigo-600 hover:underline">Prompt caching &amp; cost</Link> — covers the other half of running LLMs at production scale: keeping the bill from eating your budget when the same long system prompts get sent thousands of times a day.
          </p>
        </Checkpoint>
      </section>

      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/tool-use" className="text-indigo-600 hover:underline">← Module 11: Tool use</Link>
        <Link href="/courses/ai/modules/prompt-caching" className="text-indigo-600 hover:underline">Module 13: Prompt caching →</Link>
      </div>
        <ModuleNav courseId="ai" currentSlug="streaming" />
    </article>
  );
}
