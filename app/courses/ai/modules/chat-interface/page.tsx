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
  { id: "frontend-backend", title: "Frontend ↔ backend wiring" },
  { id: "sessions", title: "Sessions and conversation memory" },
  { id: "tool-results", title: "Streaming tool results to the UI" },
  { id: "production", title: "Production polish" },
  { id: "project", title: "Project: team standup bot" },
  { id: "final", title: "Final quiz" },
];

export default function ChatInterfaceModule() {
  const mod = getModuleBySlug("chat-interface")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 4 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Full chat interface</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          React on the front, Spring Boot on the back, tool-use in the middle. End-to-end, no mocks.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="chat-interface" />
        <ModuleProgress moduleSlug="chat-interface" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 p-6 dark:border-sky-800 dark:from-sky-950/40 dark:to-blue-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          A real chat product. Not a demo, not a mock — the full stack with sessions, history, tool
          calls, and the operational concerns you hit in production.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Module 20&apos;s components, now wired to a real Spring Boot SSE endpoint</li>
          <li>Session and message persistence — refreshes don&apos;t lose conversations</li>
          <li>Streaming tool calls (Module 11) all the way through to a structured UI</li>
          <li>The team standup bot: ask &quot;what did the team ship yesterday?&quot;, get a digest with citations</li>
          <li>Production concerns: CORS, retries, dropped streams, rate limits, what to log</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        <p className="m-0">
          Module 11 (tool use) for the backend tool loop, Module 12 (streaming with SSE) for the
          Spring Boot endpoint, Module 20 (React streaming patterns) for the frontend hook and
          components. This module connects them.
        </p>
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: FRONTEND ↔ BACKEND WIRING                                  */}
      {/* ================================================================= */}
      <section id="frontend-backend">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 1 — Frontend ↔ backend wiring</h2>

        <p>
          We have a Next.js frontend (Module 20) and a Spring Boot backend (Modules 11 + 12). Now
          they have to talk to each other. The wiring is mostly boring, except for three places where
          beginners reliably trip:
        </p>

        <ol className="list-decimal space-y-1 pl-6">
          <li>CORS — the backend has to allow the frontend&apos;s origin</li>
          <li>Reverse proxy / dev rewrite — so you don&apos;t hard-code <code>localhost:8080</code> in fetch calls</li>
          <li>The shape of the request — multi-turn means sending the whole history, not just the latest message</li>
        </ol>

        <h3 className="mt-8 mb-3 text-xl font-bold">CORS, the way that won&apos;t bite you later</h3>

        <p>
          Spring Boot defaults to denying cross-origin requests, which is correct. For local dev your
          frontend is on <code>localhost:3000</code> and your backend on <code>localhost:8080</code> —
          different origins. Two options:
        </p>

        <p>
          <strong>Option 1: Configure CORS in Spring.</strong>{" "}Quick, works, but you have to maintain
          an allowlist that grows over time and breaks when devs run on weird ports.
        </p>

        <CodeBlock lang="java">{`// CorsConfig.java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "https://your-frontend.example.com"
                )
                .allowedMethods("GET", "POST")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}`}</CodeBlock>

        <p>
          <strong>Option 2: Next.js rewrites — the dev path.</strong>{" "}Next.js can proxy
          <code>/api/*</code> requests to your Spring backend. From the browser&apos;s perspective the
          request is same-origin, so CORS never fires. This is what most teams settle on for dev:
        </p>

        <CodeBlock lang="plain">{`// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};
export default nextConfig;`}</CodeBlock>

        <p>
          In production you typically have one domain serving both (or a real reverse proxy like
          nginx), so CORS is moot. Use rewrites for dev; don&apos;t inherit a CORS allowlist into prod
          unless you actually have cross-origin traffic.
        </p>

        <Callout variant="warn" title="Streaming + rewrites: confirm both directions">
          <p className="m-0">
            Next.js rewrites preserve <code>text/event-stream</code> in modern versions, but if you&apos;re
            on Vercel&apos;s default runtime there are buffering quirks. If your tokens arrive in one
            big chunk instead of dribbling in, the proxy is buffering. Solutions: run the API on a host
            that doesn&apos;t buffer (Edge runtime, or a direct connection), or skip the rewrite and use
            CORS for the streaming endpoint specifically.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">The chat request shape</h3>

        <p>
          The frontend sends the entire conversation history on every turn. The model is stateless;
          you provide context. A typical request body:
        </p>

        <CodeBlock lang="plain">{`POST /api/chat/stream
Content-Type: application/json

{
  "session_id": "9f3a-...",          // for server-side persistence (Part 2)
  "messages": [
    { "role": "user", "content": "what did the team ship yesterday?" },
    { "role": "assistant", "content": "Yesterday the team shipped..." },
    { "role": "user", "content": "what about the day before?" }
  ]
}`}</CodeBlock>

        <p>
          The frontend builds this from its <code>messages</code> state on every <code>send</code>.
          The backend converts it into Spring AI&apos;s <code>List&lt;Message&gt;</code> for the chat
          model.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">The Spring controller</h3>

        <CodeBlock lang="java">{`// ChatController.java
package com.example.standup.api;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatClient chatClient;
    private final ToolService toolService;
    private final ConversationStore store;

    public ChatController(ChatClient.Builder builder, ToolService toolService, ConversationStore store) {
        this.chatClient = builder.build();
        this.toolService = toolService;
        this.store = store;
    }

    public record ChatRequest(String sessionId, List<ChatMessage> messages) {}
    public record ChatMessage(String role, String content) {}

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestBody ChatRequest req) {
        // Reconstruct Spring AI Messages from the request payload
        List<Message> history = req.messages().stream()
            .<Message>map(m -> "user".equals(m.role())
                ? new UserMessage(m.content())
                : new AssistantMessage(m.content()))
            .toList();

        return chatClient.prompt()
            .messages(history)
            .tools(toolService) // tools registered via @Tool — see Module 11
            .stream()
            .content()
            .map(token -> "data: " + jsonEscape(token) + "\\n\\n")
            .concatWith(Flux.just("data: [DONE]\\n\\n"));
    }

    private static String jsonEscape(String token) {
        return "{\\"token\\":\\"" + token.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"}";
    }
}`}</CodeBlock>

        <p>Three things worth flagging in this controller:</p>

        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Returns <code>Flux&lt;String&gt;</code></strong> — Spring will frame each emission as
            its own SSE chunk when the produces type is <code>text/event-stream</code>. We hand-format
            the SSE frames ourselves so the JSON shape matches what our frontend parser expects.
          </li>
          <li>
            <strong>Tools are wired with <code>.tools(toolService)</code></strong> — the same pattern
            from Module 11. The streaming path handles tool-use loops internally; you just see the
            text tokens.
          </li>
          <li>
            <strong>Hand-rolled JSON escaping</strong> — for production, use Jackson; this is a
            simplified version for clarity. We&apos;ll switch to a proper serializer in Part 3 when
            we add tool-call events.
          </li>
        </ul>

        <Quiz
          kind="Quick check"
          question="Your frontend on localhost:3000 calls a Spring Boot backend on localhost:8080 directly. The request fails with `Access-Control-Allow-Origin missing`. What's the simplest dev fix that doesn't add CORS config to your backend?"
          options={[
            { label: "Disable CORS in Chrome with --disable-web-security", explanation: "Now you're testing in a different browser than your users will use, and the bug returns the moment anyone else opens the app." },
            { label: "Add a Next.js rewrite that proxies /api/* to localhost:8080. From the browser's view it's same-origin and CORS never fires", correct: true, explanation: "The cleanest dev workflow. The frontend code stays origin-agnostic (just calls /api/...), and the rewrite handles the localhost:3000 → localhost:8080 hop. Production typically has both behind one domain anyway." },
            { label: "Hardcode http://localhost:8080 in fetch and accept the CORS errors", explanation: "Errors aren't optional — the request just won't complete." },
            { label: "Switch the frontend to also run on port 8080", explanation: "Two services on one port doesn't work. And even if it did, you've created a deploy-time conflict with prod." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="Your chat works for the first message, but on the second turn the model has no idea what was discussed before. What's the bug?"
          options={[
            { label: "The model needs to be pinned to a specific session id on the API side", explanation: "Most chat models don't have server-side session memory by default. You provide context per turn." },
            { label: "The frontend is sending only the latest user message instead of the full history", correct: true, explanation: "LLMs are stateless — you have to send the whole conversation on every turn so the model has context. The frontend's `messages` array IS the memory; ship the whole array, not just the last entry." },
            { label: "The chat model needs to be configured with `enableMemory: true`", explanation: "There's no such flag in Spring AI by default. Memory is provided either by sending history or by an advisor (MessageChatMemoryAdvisor)." },
            { label: "You forgot to set a User-Agent header", explanation: "Headers don't drive memory." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Frontend talks to backend through a Next.js rewrite (dev) or a real reverse proxy (prod). Send the whole conversation history on every turn — the model is stateless. Spring controller returns a Flux of SSE-framed strings."
          points={[
            { takeaway: "Use Next.js rewrites for local dev.", detail: "Rewrites give you same-origin requests in the browser, no CORS dance, and your fetch URLs stay clean. CORS config is for production cross-origin traffic, not for getting localhost working." },
            { takeaway: "Send the full message history every turn.", detail: "The model has no memory between calls. The frontend's messages[] is the conversation; ship all of it. Trim old turns yourself when context gets tight." },
            { takeaway: "Spring AI's streaming + tools just composes.", detail: "chatClient.prompt().messages(...).tools(toolService).stream() is one chain. The tool loop runs server-side and you only see the final tokens — until Part 3 where we surface the tool steps to the UI." },
          ]}
        />

        <Checkpoint moduleSlug="chat-interface" id="frontend-backend" title="Frontend ↔ backend wiring" xp={20} celebration="Module 20's components now talk to a real backend.">
          <p>
            You should be able to: stand up a Spring controller that streams chat tokens, point your
            Next.js frontend at it via a rewrite, and have a multi-turn conversation that remembers
            previous turns.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: SESSIONS                                                    */}
      {/* ================================================================= */}
      <section id="sessions">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 2 — Sessions and conversation memory</h2>

        <p>
          The frontend holds the conversation in <code>messages</code> state. That works until the
          user refreshes the page or opens a second tab. Now you need a session — a server-side ID
          you can resume from.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">What &quot;session&quot; means here</h3>

        <p>Three different things people call a &quot;session,&quot; clearly separated:</p>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Auth session:</strong> &quot;who is this user.&quot; Cookies, JWT, OAuth — whatever your stack already does. Out of scope for this module.</li>
          <li><strong>Conversation session:</strong> &quot;which thread is this turn part of.&quot; A UUID per conversation. Multiple per user.</li>
          <li><strong>Model session:</strong> &quot;memory the model retains across turns.&quot; You build this by replaying the conversation history on every call.</li>
        </ul>

        <p>
          When this module says <em>session</em>{" "}it means the second one: a server-side record of a
          conversation, identified by a UUID, with a list of messages.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">A minimal session store</h3>

        <CodeBlock lang="java">{`// ConversationStore.java
package com.example.standup.session;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class ConversationStore {

    private final JdbcTemplate jdbc;

    public ConversationStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record StoredMessage(String role, String content, Instant createdAt) {}

    public UUID createSession(String userId) {
        UUID id = UUID.randomUUID();
        jdbc.update(
            "INSERT INTO conversations (id, user_id, created_at) VALUES (?, ?, ?)",
            id, userId, Instant.now());
        return id;
    }

    public List<StoredMessage> getMessages(UUID sessionId) {
        return jdbc.query(
            "SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at",
            (rs, i) -> new StoredMessage(
                rs.getString("role"),
                rs.getString("content"),
                rs.getTimestamp("created_at").toInstant()),
            sessionId);
    }

    public void appendMessage(UUID sessionId, String role, String content) {
        jdbc.update(
            "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            sessionId, role, content, Instant.now());
    }
}`}</CodeBlock>

        <p>And the schema (Flyway migration):</p>

        <CodeBlock lang="plain">{`-- V1__chat_schema.sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">Wire it into the controller</h3>

        <p>
          Persist on the way in (the user message), on the way out (the final assistant message), and
          provide a GET endpoint for the frontend to load history on startup.
        </p>

        <CodeBlock lang="java">{`// In ChatController:

@GetMapping("/sessions/{id}")
public List<ChatMessage> getSession(@PathVariable UUID id) {
    return store.getMessages(id).stream()
        .map(m -> new ChatMessage(m.role(), m.content()))
        .toList();
}

@PostMapping("/sessions")
public Map<String, String> newSession(@RequestParam String userId) {
    UUID id = store.createSession(userId);
    return Map.of("sessionId", id.toString());
}

@PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream(@RequestBody ChatRequest req) {
    UUID sessionId = UUID.fromString(req.sessionId());
    String userTurn = req.messages().get(req.messages().size() - 1).content();

    // Persist the user turn before we start streaming
    store.appendMessage(sessionId, "user", userTurn);

    // Accumulate assistant tokens so we can persist the full reply at the end
    StringBuilder assistantBuf = new StringBuilder();

    return chatClient.prompt()
        .messages(reconstruct(req.messages()))
        .tools(toolService)
        .stream()
        .content()
        .doOnNext(assistantBuf::append)
        .map(token -> "data: " + jsonEscape(token) + "\\n\\n")
        .concatWith(Flux.defer(() -> {
            store.appendMessage(sessionId, "assistant", assistantBuf.toString());
            return Flux.just("data: [DONE]\\n\\n");
        }));
}`}</CodeBlock>

        <Callout variant="warn" title="Persist the assistant message even on cancellation">
          <p className="m-0">
            The <code>concatWith</code> only fires on a clean completion. If the client aborts mid-stream
            you&apos;ll lose the partial assistant message. Use <code>doOnCancel</code> /
            <code>doFinally</code> to persist <code>assistantBuf</code> on any terminal signal — clean
            completion, error, or cancel. Otherwise refreshes after a cancelled stream show only the
            user&apos;s side.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">The frontend side: load and continue</h3>

        <p>
          On mount, check the URL for a <code>?session=...</code> query param. If present, load history
          and render. If absent, lazily create a session on the first send.
        </p>

        <CodeBlock lang="plain">{`// useChatSession.ts
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export function useChatSession(userId: string) {
  const params = useSearchParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    const fromUrl = params.get("session");
    if (fromUrl) {
      // Resume existing session
      fetch(\`/api/chat/sessions/\${fromUrl}\`)
        .then((r) => r.json())
        .then((msgs) => {
          setSessionId(fromUrl);
          setInitialMessages(msgs);
        })
        .catch(() => setInitialMessages([])); // bad session id -> start fresh
    } else {
      setInitialMessages([]);
    }
  }, [params]);

  // Lazy session creation — call before first send if we don't have one yet.
  const ensureSession = async () => {
    if (sessionId) return sessionId;
    const res = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const { sessionId: newId } = await res.json();
    setSessionId(newId);
    router.replace(\`?session=\${newId}\`); // shareable URL
    return newId;
  };

  return { sessionId, initialMessages, ensureSession };
}`}</CodeBlock>

        <p>
          The router.replace call gives users a shareable URL — anyone with the link can resume the
          conversation. (Add auth checks on the backend before exposing this in production.)
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">Trimming history when it gets long</h3>

        <p>
          Conversations grow. After 50 turns you&apos;re sending 50,000+ tokens of history on every
          request — slow, expensive, and eventually you blow the context window. Three trimming
          strategies, in order of sophistication:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Last-N turns.</strong>{" "}Keep the last 10 user-assistant pairs. Simple, predictable,
            loses information beyond that horizon.
          </li>
          <li>
            <strong>Last-N + system summary.</strong>{" "}Keep the last 10 turns plus a model-generated
            summary of everything before. The summary lives in your DB and gets refreshed when the
            window slides.
          </li>
          <li>
            <strong>Token-budget aware.</strong>{" "}Add turns from newest to oldest until you&apos;d
            exceed a token budget; stop. Robust to varying message lengths.
          </li>
        </ul>

        <p>
          For most products, last-N is fine for the first six months. The day you ship a feature
          where users want to recall something from 50 turns ago, switch to last-N + summary.
          Token-budget shows up in agent systems where the messages vary wildly in size.
        </p>

        <Quiz
          kind="Quick check"
          question="Your chat is working in dev. A user reports: 'I had a 30-message conversation, refreshed, and only the last few messages are showing.' What's the most likely cause?"
          options={[
            { label: "The model has a context window limit and dropped earlier turns", explanation: "The model would never silently drop UI history — that's a UI / persistence issue, not a model issue." },
            { label: "The frontend persists messages only in component state, not the server-side session — refresh wipes the in-memory list and only shows what's reloaded", correct: true, explanation: "Likely culprit: the frontend held messages in useState only, never wrote to the server, so refresh started from scratch. Or it loaded from server but the server never received/persisted the messages. Either way: persistence path is broken." },
            { label: "The browser's localStorage cleared", explanation: "If you're using localStorage as your only persistence, the user clearing cookies wipes everything. Server-side persistence is the answer." },
            { label: "The session UUID changed on refresh", explanation: "If the session id isn't preserved (URL query param, localStorage, server-side derived from auth), refreshes lose the link to history. Closely related to the right answer." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="A teammate proposes saving the assistant's full reply only in the SSE [DONE] handler — it's where you have the complete text. What's the bug?"
          options={[
            { label: "[DONE] handlers can fail silently", explanation: "Possible but not the main issue." },
            { label: "If the client aborts (or the network drops) mid-stream, [DONE] never fires and the partial reply is lost — even though the model produced text and the user saw it", correct: true, explanation: "Right. Persist on any terminal signal — completion, cancel, or error — using doFinally/doOnCancel. Otherwise refreshes after a cancelled stream show only the user's side, not the partial reply that was on screen seconds ago." },
            { label: "[DONE] is sent before all tokens have been processed", explanation: "It's sent after — that's the protocol. The issue is what happens when [DONE] never gets sent." },
            { label: "Spring AI doesn't support [DONE] handlers", explanation: "It does — concatWith is a Reactor pattern." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Sessions are conversation IDs persisted server-side. Save user turns before streaming, persist assistant turns on any terminal signal. Use ?session=... URLs for resumability and trim history once it grows past your token budget."
          points={[
            { takeaway: "Three things people call 'session' — keep them separate.", detail: "Auth session (user identity), conversation session (which thread), model session (history replayed each turn). This module is about the second one." },
            { takeaway: "Persist on every terminal signal, not just clean completion.", detail: "doFinally/doOnCancel/doOnError. If you only persist on [DONE], aborts and crashes lose the partial reply the user already saw." },
            { takeaway: "Last-N trimming buys you 6 months.", detail: "Don't over-engineer summarization on day one. Last-10-turns is a fine default; switch to last-N + summary when users start asking 'remember what I said earlier?' Token-budget trimming is for agent systems where message sizes vary wildly." },
          ]}
        />

        <Checkpoint moduleSlug="chat-interface" id="sessions" title="Sessions and conversation memory" xp={25} celebration="Refreshes don't lose conversations anymore.">
          <p>
            You should be able to: persist conversations to Postgres, resume a conversation from a
            URL, and explain when each history-trimming strategy is the right tool.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: STREAMING TOOL RESULTS                                     */}
      {/* ================================================================= */}
      <section id="tool-results">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 3 — Streaming tool results to the UI</h2>

        <p>
          Module 20 modeled tool calls as message parts on the frontend. We never wired up the backend
          to actually emit them. Time to fix that. The result is a UI where the user sees:
        </p>

        <CodeBlock lang="plain">{`assistant
  🔧 search_tickets({"team":"platform","since":"2026-04-27"})  ⋯ running
  🔧 search_tickets({"team":"platform","since":"2026-04-27"})  ✓ done — 8 hits
  Yesterday the platform team shipped:
  - Auth refresh-token rotation (TICKET-1042)
  - Fix for the 502s on the search service (TICKET-1051)
  - ...`}</CodeBlock>

        <p>
          Same data, but the user knows what the model did. Trust comes from visibility.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">Spring AI&apos;s low-level streaming events</h3>

        <p>
          The high-level <code>.content()</code> stream from Module 12 only emits text tokens. To
          surface tool-use events, drop down to <code>.chatResponse()</code> and inspect each
          <code>ChatResponse</code>:
        </p>

        <CodeBlock lang="java">{`// Updated stream() method
@PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> stream(@RequestBody ChatRequest req) {
    UUID sessionId = UUID.fromString(req.sessionId());
    String userTurn = req.messages().get(req.messages().size() - 1).content();
    store.appendMessage(sessionId, "user", userTurn);

    StringBuilder assistantBuf = new StringBuilder();

    return chatClient.prompt()
        .messages(reconstruct(req.messages()))
        .tools(toolService)
        .stream()
        .chatResponse()
        .flatMap(this::toSseFrames)
        .doOnNext(frame -> {
            // Capture text from token frames into assistantBuf for persistence
            extractTokenIfAny(frame).ifPresent(assistantBuf::append);
        })
        .doFinally(sig -> {
            if (assistantBuf.length() > 0) {
                store.appendMessage(sessionId, "assistant", assistantBuf.toString());
            }
        })
        .concatWith(Flux.just("data: [DONE]\\n\\n"));
}

private Flux<String> toSseFrames(ChatResponse chatResponse) {
    var generation = chatResponse.getResults().isEmpty()
        ? null
        : chatResponse.getResults().get(0);
    if (generation == null) return Flux.empty();

    var msg = generation.getOutput();
    var toolCalls = msg.getToolCalls();

    List<String> frames = new ArrayList<>();

    // Tool calls: emit a frame per call
    if (toolCalls != null) {
        for (var tc : toolCalls) {
            frames.add(sseFrame(Map.of(
                "type", "tool_call",
                "id", tc.id(),
                "name", tc.name(),
                "input", tc.arguments()
            )));
        }
    }

    // Text token: standard token frame
    String text = msg.getText();
    if (text != null && !text.isEmpty()) {
        frames.add(sseFrame(Map.of("type", "token", "text", text)));
    }

    return Flux.fromIterable(frames);
}`}</CodeBlock>

        <Callout variant="warn" title="Spring AI API surface drift">
          <p className="m-0">
            The exact method names on <code>ChatResponse</code> / <code>Generation</code> /
            <code>AssistantMessage</code> have shifted between Spring AI milestones. The shape above
            reflects the 1.0 GA contract. If you&apos;re on a different version, the concepts are the
            same — find the equivalent of &quot;get tool calls from the streamed assistant message&quot;
            in your version&apos;s docs.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">Wiring tool results back</h3>

        <p>
          Spring AI&apos;s default tool-loop runs the tool, feeds the result back into the model, and
          continues. By default the tool <em>result</em>{" "}doesn&apos;t surface as its own streaming
          event — only the next assistant turn (which references the result implicitly) does. To
          surface results explicitly, intercept the tool execution.
        </p>

        <p>
          The cleanest hook in Spring AI is a <code>FunctionCallback</code> wrapper that records its
          output before returning, paired with a sink the controller can subscribe to. For a single
          conversation:
        </p>

        <CodeBlock lang="java">{`// ToolService.java — instrumented version
@Component
public class ToolService {

    private final TicketRepository tickets;

    // Per-request sink for tool results. Bound via ThreadLocal or context propagation.
    private final ConcurrentMap<String, FluxSink<ToolEvent>> sinks = new ConcurrentHashMap<>();

    public record ToolEvent(String toolCallId, String name, Object output) {}

    public ToolService(TicketRepository tickets) { this.tickets = tickets; }

    @Tool(description = "Search shipped tickets for a team in a date range")
    public List<TicketSummary> searchTickets(
            @ToolParam(description = "team name, e.g. 'platform'") String team,
            @ToolParam(description = "ISO date") String since) {

        var results = tickets.findShipped(team, LocalDate.parse(since));

        // Emit a result event to the per-request sink, if registered
        var sink = sinks.get(currentRequestId());
        if (sink != null) {
            sink.next(new ToolEvent(currentToolCallId(), "searchTickets", results));
        }

        return results;
    }

    public void register(String requestId, FluxSink<ToolEvent> sink) { sinks.put(requestId, sink); }
    public void unregister(String requestId) { sinks.remove(requestId); }

    private String currentRequestId() { /* read from RequestContextHolder */ return "..."; }
    private String currentToolCallId() { /* read from current Spring AI tool context */ return "..."; }
}`}</CodeBlock>

        <Callout variant="info" title="Don't over-engineer the first version">
          <p className="m-0">
            Threading tool-result events through Spring AI&apos;s tool loop is fiddly enough that for
            a first version, many teams skip it: just emit the tool_call event and let the next
            assistant text turn imply &quot;the tool returned something useful.&quot; The UX is still
            better than no tool visibility, and it&apos;s 90% less code. Add explicit tool_result
            events when the product needs them — for example, when results are large enough to deserve
            their own UI affordance.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">The frontend already handles this</h3>

        <p>
          Module 20&apos;s <code>reduceChunk</code> already accepts <code>tool_call</code> and
          <code>tool_result</code> events and threads them into the message&apos;s parts. Once the
          backend emits them, the UI lights up automatically. This is the payoff for designing the
          frontend protocol with tool events from day one.
        </p>

        <WorkedExample
          title="The full request lifecycle, end to end"
          subtitle="User asks 'what shipped on the platform team yesterday?' — trace it through every layer."
          steps={[
            {
              title: "Frontend: build request",
              body: (
                <p className="text-sm">
                  <code>useStreamingChat.send</code> appends the user message, creates an empty
                  assistant message, and POSTs <code>{`{ sessionId, messages: [...] }`}</code> to
                  <code>/api/chat/stream</code>.
                </p>
              ),
            },
            {
              title: "Spring controller: persist user, start stream",
              body: (
                <p className="text-sm">
                  <code>ChatController.stream</code> writes the user turn to Postgres, then calls
                  <code>chatClient.prompt().messages(...).tools(toolService).stream().chatResponse()</code>.
                </p>
              ),
            },
            {
              title: "Model decides to call a tool",
              body: (
                <p className="text-sm">
                  First <code>ChatResponse</code> arrives with a tool_use block. Our
                  <code>toSseFrames</code> emits <code>{`{"type":"tool_call","id":"t1","name":"searchTickets","input":{...}}`}</code>.
                  Frontend renders &quot;🔧 searchTickets ⋯ running.&quot;
                </p>
              ),
            },
            {
              title: "Spring AI runs the tool",
              body: (
                <p className="text-sm">
                  The tool loop calls <code>searchTickets(&quot;platform&quot;, &quot;2026-04-27&quot;)</code>.
                  Returns 8 ticket summaries. Spring AI feeds the result back into the model and continues
                  the conversation.
                </p>
              ),
            },
            {
              title: "Model streams the answer",
              body: (
                <p className="text-sm">
                  Subsequent <code>ChatResponse</code> objects carry text tokens. <code>toSseFrames</code>
                  emits one token frame per chunk; the frontend appends to the in-flight assistant
                  message&apos;s text part.
                </p>
              ),
            },
            {
              title: "Stream completes; persist; close",
              body: (
                <p className="text-sm">
                  <code>doFinally</code> writes the accumulated assistant text to Postgres.
                  <code>concatWith</code> emits <code>data: [DONE]</code>. Frontend hook flips status
                  to <code>idle</code>; the assistant message&apos;s <code>streaming</code> flag goes
                  off.
                </p>
              ),
            },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Why does the frontend need a tool_call event before the tool actually runs, instead of just showing the tool's output once it's available?"
          options={[
            { label: "It doesn't — only the output matters", explanation: "Then users stare at a spinner during slow tool calls (5+ seconds for a DB query is common). The interim 'running' state is the whole UX win." },
            { label: "It gives users immediate feedback that something is happening, especially during slow tools (DB queries, web searches), and it lets the UI render input parameters for transparency", correct: true, explanation: "Right. The 'running' indicator is the moral equivalent of streaming text — it converts dead air into watchable progress. And surfacing the tool's input ('searching for: ...') tells the user what the model interpreted, which is often where misunderstandings happen." },
            { label: "Spring AI requires it for the tool loop to work", explanation: "Spring AI's tool loop runs fine without surfacing events — that's just for the UI." },
            { label: "It speeds up the tool execution", explanation: "Emitting an event has zero effect on tool latency." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="A teammate suggests skipping tool_result events on day one — just emit tool_call and let the next text turn imply success. What's the right reaction?"
          options={[
            { label: "Reject — without explicit results, the UI is incomplete", explanation: "It's not incomplete; it's leaner. The 'running' indicator is the high-value part. Result events are useful when results need their own UI, not when text already conveys them." },
            { label: "Accept — the running indicator is 90% of the UX value, and threading tool-result events through Spring AI's loop is significant code. Add tool_result later when the product needs structured result rendering (e.g. a sources panel)", correct: true, explanation: "Right. Ship the high-leverage part now. Skip the tricky plumbing until there's a concrete UX reason to need it. Premature complexity is the most expensive kind." },
            { label: "Accept, but only if there's no plan to add tool_result later", explanation: "You can always add it later — the protocol is extensible. Skipping doesn't paint you into a corner." },
            { label: "Build a custom tool framework instead of using Spring AI's", explanation: "Massively over-engineered response to a small UX gap." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Drop to chatResponse() to surface tool calls. Emit a tool_call frame per call; the frontend already handles it via the parts model from Module 20. Skip explicit tool_result on v1 unless the UX needs it."
          points={[
            { takeaway: "content() vs chatResponse() is the lever.", detail: "content() gives you text only — clean for chat. chatResponse() gives you full structured responses including tool calls. Use the right one for what you're rendering." },
            { takeaway: "Surface tool calls; defer tool results.", detail: "tool_call events are cheap to emit and the highest-leverage UX. tool_result threading is fiddly and only worth it when the result deserves its own UI (sources panel, structured output)." },
            { takeaway: "The frontend protocol from Module 20 already supports this.", detail: "Designing the protocol with tool events on day one means adding backend support is a one-sided change — no frontend rewrites." },
          ]}
        />

        <Checkpoint moduleSlug="chat-interface" id="tool-results" title="Streaming tool results to the UI" xp={25} celebration="Your chat shows the model thinking, not just talking.">
          <p>
            You should be able to: emit tool_call SSE events from a Spring AI streaming endpoint and
            see them render as live status indicators in the React UI from Module 20.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: PRODUCTION POLISH                                          */}
      {/* ================================================================= */}
      <section id="production">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 4 — Production polish</h2>

        <p>
          A working chat is not a shippable chat. Five concerns separate &quot;works on my
          machine&quot; from &quot;handles real users.&quot;
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">1. Rate limits</h3>

        <p>
          One user can&apos;t fire 50 chat requests per minute and exhaust your API budget. Cap
          per-user request rate at the controller. Bucket4j is a clean fit for Spring:
        </p>

        <CodeBlock lang="java">{`// ChatRateLimiter.java
@Component
public class ChatRateLimiter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String userId) {
        Bucket b = buckets.computeIfAbsent(userId, k ->
            Bucket.builder()
                .addLimit(Bandwidth.simple(20, Duration.ofMinutes(1)))   // 20/min sustained
                .addLimit(Bandwidth.simple(5, Duration.ofSeconds(10)))   // 5/10s burst
                .build());
        return b.tryConsume(1);
    }
}

// In the controller:
if (!rateLimiter.tryConsume(userId)) {
    return Flux.just("data: " + jsonEscape(Map.of("type", "error", "message", "rate limit")) + "\\n\\n",
                     "data: [DONE]\\n\\n");
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">2. Token budgeting per request</h3>

        <p>
          Cap the input size. Trim history before sending; reject prompts above some token threshold.
          Otherwise one user pasting a 200K-token doc into the chat costs you $5 and locks the model
          for two minutes.
        </p>

        <CodeBlock lang="java">{`int totalTokens = estimator.estimate(history);
if (totalTokens > 50_000) {
    history = trimToTokenBudget(history, 50_000);
}`}</CodeBlock>

        <p>
          (Trimming strategy: drop oldest first, but keep the system prompt and the latest user turn.)
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">3. Logging without leaking</h3>

        <p>
          Log enough to debug, never enough to leak. The temptation is to log every prompt and
          response — and then someone&apos;s SSN ends up in your aggregated logs.
        </p>

        <p>The minimum useful set of fields:</p>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Always log:</strong>{" "}session id, user id, request timestamp, latency to first token, total tokens, total latency, tool calls (name + duration, not arguments), error reason</li>
          <li><strong>Conditionally log (sampled, redacted):</strong>{" "}hash of the prompt for grouping similar queries, length of prompt and response in tokens</li>
          <li><strong>Never log:</strong>{" "}raw prompts, raw responses, raw tool inputs/outputs, anything containing user-supplied content unless redacted</li>
        </ul>

        <Callout variant="warn" title="Log redaction is harder than it looks">
          <p className="m-0">
            Heuristic redaction (regex for emails, phone numbers, etc.) misses a lot. The safer pattern
            is to log a content hash and structural metadata, then store the actual content (if you need
            it) in a separate, access-controlled audit store — not your normal observability stack.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-bold">4. Graceful degradation</h3>

        <p>
          The Anthropic API will sometimes return 5xx, time out, or rate-limit you. Decide what your
          UX does in each case:
        </p>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>5xx from the model:</strong>{" "}retry once with a small jitter, then surface a clear error to the user with a retry button.</li>
          <li><strong>API rate limit (429):</strong>{" "}queue with a polite delay; if it persists past 30s, fail with &quot;experiencing high load — try again in a moment.&quot;</li>
          <li><strong>Slow tokens (no token in 30s):</strong>{" "}abort with &quot;the model is being slow; here&apos;s what we have so far.&quot;</li>
          <li><strong>Tool failures:</strong>{" "}let Spring AI&apos;s loop see the error; many models will gracefully recover (&quot;I tried to look that up but the search service was down — let me try a different approach&quot;).</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">5. The first-token timeout</h3>

        <p>
          The single most important production metric for a chat product is <em>time to first token</em>.
          Anything over 3 seconds and users assume the app is broken. Set a 5-second timeout on
          getting the first token; if it doesn&apos;t arrive, abort and surface a clear retry path.
        </p>

        <CodeBlock lang="java">{`// In the controller:
return chatClient.prompt()
    .messages(history)
    .tools(toolService)
    .stream()
    .chatResponse()
    .timeout(Duration.ofSeconds(45), Mono.error(new TimeoutException("model timeout")))
    .flatMap(this::toSseFrames)
    // ...`}</CodeBlock>

        <p>
          (Reactor&apos;s <code>.timeout()</code> applies between elements, so you get the
          &quot;no progress in 45s&quot; behavior for free.)
        </p>

        <Quiz
          kind="Quick check"
          question="Reviewing your team's chat backend logs, you notice every user prompt is logged verbatim, including tickets that contain customer PII. What's the minimum-effort fix that doesn't break debuggability?"
          options={[
            { label: "Stop logging prompts entirely", explanation: "You lose debuggability. There's a middle ground." },
            { label: "Log a hash of the prompt for grouping/aggregation, plus structural metadata (length, token count, language); store the raw content in a separate, access-controlled audit store accessible only on-call", correct: true, explanation: "Right balance. The hash and structure live in normal logs and are enough for 'how many users hit this kind of prompt'. The raw content is available for incident response, but behind audit logs and stricter access. Routine debugging stays easy; PII exposure surface drops dramatically." },
            { label: "Add a regex to redact emails/phone numbers", explanation: "Heuristic redaction misses 90% of the cases. Customer addresses, internal IDs, free-form notes — none of those match a regex." },
            { label: "Encrypt the logs", explanation: "Doesn't help — anyone with log access still reads them. Encryption protects logs in transit and at rest, not from authorized log readers." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="A user reports chat 'feels broken' — they wait 8 seconds before any response. The model ultimately answers correctly. What's the production-grade fix?"
          options={[
            { label: "Switch models — the current one is too slow", explanation: "Maybe, but premature. First make sure your wiring isn't adding the 8 seconds." },
            { label: "Check time-to-first-token in your logs. If the model is producing tokens in <1s but the user sees 8s, your stack (proxy, CDN, controller) is buffering. Disable buffering on the SSE path. If TTFT really is 8s, switch models or add a cheaper acknowledgement model that responds first while the main model thinks", correct: true, explanation: "The right diagnostic flow. TTFT is your single most important latency metric. If your logs say 'first token at 800ms' but the user reports 8 seconds, something between Spring and the browser is buffering — proxies, CDNs, the wrong runtime. If TTFT really is 8s on the model side, you need an architectural answer (faster model, or two-stage)." },
            { label: "Add a loading spinner so users know it's working", explanation: "Hides the symptom; doesn't fix the cause. The 8-second wait is a real problem, not a perception problem." },
            { label: "Increase the model's output speed parameter", explanation: "Most APIs don't expose token-output-speed as a knob. The way to go faster is a smaller model." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Production chat means rate limits, token budgets, careful logging, graceful degradation, and time-to-first-token discipline. None of it is glamorous; all of it is the difference between a demo and a product."
          points={[
            { takeaway: "Time-to-first-token is the most important latency metric.", detail: "Above 2-3s, users think the app is broken. Measure it; alert on it; if it spikes, your stack is buffering somewhere it shouldn't." },
            { takeaway: "Log structure, hash content, store raw separately.", detail: "Normal observability gets enough info to debug aggregations and alerts. Raw content lives in an audit store with tighter access. PII never enters the main log stream." },
            { takeaway: "Tool failures should bubble back into the model.", detail: "Models are good at saying 'that didn't work, let me try X instead.' Don't catch the tool error and silently retry — let the model decide what to do, and surface that decision to the user." },
          ]}
        />

        <Checkpoint moduleSlug="chat-interface" id="production" title="Production polish" xp={25} celebration="Your chat handles real users, not just demos.">
          <p>
            You should be able to: identify the five operational concerns (rate limits, token budgets,
            logging, degradation, TTFT) and explain the right approach to each — without quoting any
            specific library&apos;s API.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: PROJECT                                                    */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 5 — Project: team standup bot</h2>

        <p>
          Build a chat product your team would actually use: ask it &quot;what shipped yesterday?&quot;
          or &quot;who&apos;s blocked?&quot; and it answers using a tool that queries a fake ticket
          database. Frontend is Module 20&apos;s components; backend is Modules 11/12 wired together
          with sessions from this module.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-bold">Architecture</h3>

        <CodeBlock lang="plain">{`┌─────────────────────────┐         ┌──────────────────────────────┐
│  Next.js (port 3000)    │         │  Spring Boot (port 8080)     │
│  ─────────────────────  │  POST   │  ──────────────────────────  │
│  /chat-demo page        │ ──────▶ │  /api/chat/stream            │
│  useStreamingChat hook  │  SSE    │     - ChatController         │
│  MessageList, Composer  │ ◀────── │     - ToolService (@Tool)    │
│                         │         │     - ConversationStore      │
│  /api/chat/* (rewrite)  │         │  /api/chat/sessions/{id}     │
└─────────────────────────┘         │  /api/chat/sessions  (POST)  │
                                    └──────────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────────────┐
                                    │  Postgres (port 5432)        │
                                    │  conversations, messages     │
                                    │  tickets (project data)      │
                                    └──────────────────────────────┘`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">Tools the bot exposes</h3>

        <p>Three tools, all backed by a fake <code>tickets</code> table you seed with test data:</p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            <code>searchShipped(team, since, until)</code> — returns tickets marked &quot;shipped&quot; in the date range.
          </li>
          <li>
            <code>searchBlocked(team)</code> — returns tickets currently in &quot;blocked&quot; status with their blocker description.
          </li>
          <li>
            <code>searchByPerson(personId)</code> — returns recent tickets assigned to or completed by a person.
          </li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">Seeding test data</h3>

        <CodeBlock lang="plain">{`-- V2__seed_tickets.sql
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    team TEXT NOT NULL,
    assignee TEXT,
    status TEXT NOT NULL,         -- 'shipped' | 'in_progress' | 'blocked'
    blocker TEXT,                 -- non-null when status = 'blocked'
    shipped_at TIMESTAMPTZ
);

INSERT INTO tickets (code, title, team, assignee, status, shipped_at) VALUES
  ('PLT-1042', 'Auth refresh-token rotation', 'platform', 'aria',  'shipped', '2026-04-27 14:00+00'),
  ('PLT-1051', 'Fix 502s on search service', 'platform', 'kenji', 'shipped', '2026-04-27 17:30+00'),
  ('PLT-1058', 'Migrate logs to OTel',       'platform', 'aria',  'in_progress', NULL),
  ('PLT-1061', 'Re-key prod database',       'platform', 'kenji', 'blocked', NULL);

UPDATE tickets SET blocker = 'Waiting on infra team for new KMS key' WHERE code = 'PLT-1061';

INSERT INTO tickets (code, title, team, assignee, status, shipped_at) VALUES
  ('GRO-2010', 'Welcome email A/B test', 'growth', 'ravi',  'shipped', '2026-04-27 11:15+00'),
  ('GRO-2014', 'Pricing page redesign',   'growth', 'maya',  'in_progress', NULL);`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-bold">Build order</h3>

        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Backend basics.</strong>{" "}Spring Boot with Postgres, Flyway migrations for
            <code>conversations</code> + <code>messages</code> + <code>tickets</code>. Seed data.
            Verify with <code>psql</code>.
          </li>
          <li>
            <strong>Tool service.</strong>{" "}Three <code>@Tool</code>-annotated methods on
            <code>ToolService</code> backed by <code>JdbcTemplate</code>. Unit-test them in isolation.
          </li>
          <li>
            <strong>Streaming endpoint.</strong> <code>/api/chat/stream</code> using the controller
            shape from Part 1, with persistence from Part 2.
          </li>
          <li>
            <strong>Tool-call events.</strong>{" "}Drop to <code>chatResponse()</code> and emit
            <code>tool_call</code> SSE frames. Skip <code>tool_result</code> for now.
          </li>
          <li>
            <strong>Frontend wiring.</strong>{" "}Next.js project with the rewrite to localhost:8080. Drop
            in Module 20&apos;s components. Build the demo page with session loading.
          </li>
          <li>
            <strong>Polish.</strong>{" "}Rate limit, TTFT timeout, loading and error states. Try a
            handful of real-feeling queries.
          </li>
        </ol>

        <h3 className="mt-8 mb-3 text-xl font-bold">Acceptance criteria</h3>

        <p>You&apos;ve shipped this when:</p>

        <ul className="list-disc space-y-1 pl-6">
          <li>Asking &quot;what did the platform team ship yesterday?&quot; produces a list of
              tickets sourced from the DB, with the tool-call visible mid-stream.</li>
          <li>Refreshing the page restores the conversation from the URL query param.</li>
          <li>Asking &quot;who&apos;s blocked on the platform team?&quot; surfaces PLT-1061 with its
              blocker description.</li>
          <li>Stopping mid-stream preserves the partial assistant message; refreshing reloads what was
              persisted.</li>
          <li>Hammering the endpoint past 20 requests/minute returns a clean rate-limit error event,
              not a stack trace.</li>
          <li>Logs contain session/user/timing/tool data — but no raw prompts or model outputs.</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-bold">Stretch goals</h3>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Markdown rendering</strong> — the bot is going to emit bullet lists and bold text. Render them.</li>
          <li><strong>Slack-style mentions</strong> — let users <code>@mention</code> teammates and have the bot prefer those people in tool results.</li>
          <li><strong>Daily digest job</strong> — a Spring scheduled task that runs the same prompt every morning and posts the result somewhere (file, email, Slack webhook).</li>
          <li><strong>Tool result events</strong> — go back and add explicit <code>tool_result</code> events with a sources panel UI.</li>
        </ul>

        <Checkpoint moduleSlug="chat-interface" id="project" title="Project: team standup bot" xp={75} manual manualLabel="My standup bot answers correctly" celebration="You shipped a real chat product end-to-end. This is where the course's pieces start clicking together.">
          <p>
            Mark this done once: the bot answers at least 5 different real-feeling standup questions
            correctly using the tool data, sessions persist across refreshes, tool calls appear in the
            UI as they happen, and you&apos;ve hit at least one production issue (rate limit, slow
            stream, dropped connection) and seen the system handle it gracefully.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL QUIZ                                                  */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final check"
          question="Your standup bot works in dev with the Next.js rewrite. You deploy to staging where the frontend runs at app.example.com and the backend at api.example.com. The chat hangs forever — fetch never completes. Diagnose."
          options={[
            { label: "The model is broken", explanation: "Unrelated. The fetch never completes because the request never gets through, not because the model is slow." },
            { label: "Different origins → CORS preflight is failing on the SSE endpoint. Either configure CORS to allow app.example.com, or put both behind the same domain via a reverse proxy", correct: true, explanation: "Right. Rewrites only exist in dev; production is real cross-origin. Either set up CORS on the Spring side (with allowedOrigins for app.example.com), or put both services behind one domain via nginx / ALB / Vercel rewrites in production. The latter is usually cleaner." },
            { label: "Spring Boot doesn't support cross-origin SSE", explanation: "It does — same as any HTTP. The issue is browser CORS policy, not Spring." },
            { label: "Switch to WebSockets", explanation: "Doesn't fix CORS, and adds complexity. The fix is to allow the cross-origin request, not change protocols." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your team's chat product saves the assistant message on the [DONE] handler. Users complain that after they hit 'stop' to abort a long answer, refreshing the page shows only their question — the partial answer they saw on screen is gone. What's the architectural fix?"
          options={[
            { label: "Tell users not to hit stop", explanation: "Hostile. Stop is a feature." },
            { label: "Persist the assistant message on any terminal signal — completion, abort, or error — using doFinally / doOnCancel; the partial buffer is the source of truth", correct: true, explanation: "Right. [DONE] only fires on clean completion. doFinally fires on EVERY terminal signal (success, cancel, error), so you persist whatever the buffer accumulated, even partial. Users see exactly what they saw on screen before refresh." },
            { label: "Auto-resume the stream on refresh", explanation: "Costs another API call and may produce a different answer. Just persist the partial." },
            { label: "Disable the stop button", explanation: "Not actually a fix — you've removed a feature instead of fixing the bug." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your chat works for two hours, then a particular user starts getting empty responses. You check logs: the model is responding fine for everyone else. What's the most likely cause for this one user?"
          options={[
            { label: "Their auth token expired", explanation: "Possible but would typically cause a 401, not an empty response." },
            { label: "Their conversation has accumulated enough history that you're sending more tokens than the model's context window allows; the model returns nothing or errors and you're not surfacing it", correct: true, explanation: "Classic long-conversation failure. Without history trimming, eventually one user crosses the context limit. Symptoms: empty responses, weird truncations, or 4xx from the API. The fix is last-N-turns trimming or token-budget-aware history (Part 2). Surface the error so it doesn't look silent." },
            { label: "The Postgres connection pool is exhausted", explanation: "Would affect all users, not one." },
            { label: "Their browser is caching old responses", explanation: "Streaming responses aren't cached. Cache headers say no-cache." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="A teammate proposes: 'For tool calls, let's just await each tool execution server-side and emit a single combined event with tool_call + tool_result together — simpler than two events.' What's wrong with this plan?"
          options={[
            { label: "Nothing — that's a fine simplification", explanation: "It is simpler, but it loses the most important UX win — the 'running' state during slow tool calls." },
            { label: "Tools can take seconds (DB queries, web searches). Combining tool_call+result into one event means the UI can't show 'running' progress during the wait — the user sees a long pause then a finished result. Two events keep the UX smooth", correct: true, explanation: "Right. The two-event model isn't there for the data — it's there for the UX. The 'running' indicator is the moral equivalent of streaming text: it converts dead air into watchable progress. Combining the events kills that." },
            { label: "Spring AI doesn't support combined events", explanation: "Spring AI doesn't care — you control the SSE protocol. The constraint is UX, not framework." },
            { label: "It's against the SSE spec", explanation: "SSE allows arbitrary event payloads. The spec has nothing to say about how to model tool calls." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You're on call. Your chat product's TTFT (time to first token) p50 jumps from 800ms to 6 seconds overnight. The model itself, measured at the API, is still 800ms. Where do you look first?"
          options={[
            { label: "The model — there's clearly a regression somewhere", explanation: "The model is fine — you said so yourself." },
            { label: "The path between your Spring Boot service and the browser. Something is buffering the SSE stream — most likely a new proxy/CDN config, a runtime change (e.g. accidentally moving to a serverless platform that buffers), or a middleware that's reading the body before forwarding", correct: true, explanation: "Right. If the model is producing in 800ms but the user sees 6s, the bytes are being held somewhere on the way out. Common culprits: CDNs that don't pass through text/event-stream correctly, serverless runtimes with default buffering, middleware that reads response.body for logging. Check what changed in your infra in the last 24h." },
            { label: "Add more replicas of the Spring Boot service", explanation: "Doesn't fix buffering. More replicas means more buffered streams." },
            { label: "Switch to a faster model", explanation: "The model isn't the bottleneck. Find the bottleneck before throwing money at it." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="chat-interface" id="final" title="Final quiz" xp={50} celebration="You shipped a real chat product. Module 22 adds the last frontend piece: images.">
          <p>
            With this module complete, you have an end-to-end AI feature: React frontend, Spring Boot
            backend, sessions, tools, streaming, and the operational layer to keep it running. Module 22
            takes the same stack and adds multimodal — images and files going into the model.
          </p>
        </Checkpoint>
      </section>

      {/* FOOTER NAV */}
      <footer className="mt-12 flex justify-between border-t border-slate-200 pt-8 text-sm dark:border-slate-800">
        <Link href="/courses/ai/modules/react-streaming" className="text-slate-600 hover:text-sky-600 dark:text-slate-400">
          ← Module 20: React streaming patterns
        </Link>
        <Link href="/courses/ai/modules/multimodal" className="font-semibold text-sky-600 hover:underline">
          Module 22: Multimodal inputs →
        </Link>
      </footer>
        <ModuleNav courseId="ai" currentSlug="chat-interface" />
    </article>
  );
}
