import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";

const CHECKPOINTS = [
  { id: "why-streaming", title: "Why streaming changes the UX" },
  { id: "browser-sse", title: "SSE in the browser, properly" },
  { id: "use-streaming-chat", title: "The useStreamingChat hook" },
  { id: "optimistic-tools", title: "Optimistic UI & tool results" },
  { id: "project", title: "Project: chat UI component library" },
  { id: "final", title: "Final quiz" },
];

export default function ReactStreamingModule() {
  const mod = getModuleBySlug("react-streaming")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Phase 4 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">React streaming patterns</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Module 12 streamed tokens out of Spring Boot. This module catches them in React without
          melting your component tree.
        </p>
        <ModuleProgress moduleSlug="react-streaming" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A small, headless chat UI library — the components you&apos;ll reuse for every AI feature
          you ship from here on. By the end of the module:
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>You can consume an SSE stream from a browser — and you know why <code>EventSource</code> isn&apos;t enough</li>
          <li>A <code>useStreamingChat</code> hook with a clean state machine (idle / streaming / done / error) and abort support</li>
          <li>Optimistic message rendering, mid-stream tool-call rendering, and recovery from dropped streams</li>
          <li>Three reusable components: <code>&lt;StreamingMessage&gt;</code>, <code>&lt;ChatComposer&gt;</code>, <code>&lt;MessageList&gt;</code></li>
          <li>A mental model for where streaming makes a UX feel alive vs. where it&apos;s just noise</li>
        </ul>
      </section>

      <Callout variant="info" title="Prerequisites">
        <p className="m-0">
          Module 12 (streaming with SSE) for the backend mental model. You don&apos;t need a running
          Spring Boot server — we ship a mock SSE endpoint as a Next.js API route so the project runs
          standalone.
        </p>
      </Callout>

      {/* ================================================================= */}
      {/* PART 1: WHY STREAMING CHANGES THE UX                                */}
      {/* ================================================================= */}
      <section id="why-streaming">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — Why streaming changes the UX</h2>

        <p>
          The first time you wire up an LLM call from a button-click, you build it the same way you&apos;d
          build any REST call: <code>fetch</code>, <code>await</code>, render. Then you click the button
          and stare at a spinner for eight seconds. The model is generating fine — you just hid the
          generation behind a loader.
        </p>

        <p>
          Streaming is the fix. Not because it&apos;s technically interesting (it is), but because the
          user experience of <em>watching words appear</em> is fundamentally different from <em>waiting
          for a wall of text</em>. The same response feels twice as fast when streamed, even though the
          total time is identical.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The perceived-latency math</h3>

        <p>Concrete numbers from a typical Claude Sonnet response on a coding question:</p>

        <CodeBlock lang="plain">{`Total response: ~600 tokens
Generation speed: ~80 tokens/sec
End-to-end time: ~7.5s

Non-streaming:
  t=0.0s   user clicks send
  t=0.4s   request reaches API
  t=7.9s   full response arrives
  t=7.9s   render
  → User waits 7.9s staring at a spinner.

Streaming:
  t=0.0s   user clicks send
  t=0.4s   request reaches API
  t=0.7s   first token arrives  ← 11x improvement in time-to-first-byte
  t=0.7s   render starts
  t=7.9s   last token arrives
  → User waits 0.7s, then reads along with generation.`}</CodeBlock>

        <p>
          The total work is the same. The <em>experience</em> is not. Users tolerate progress; they
          don&apos;t tolerate dead air.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">When streaming is wrong</h3>

        <p>
          Streaming is not free. It locks you into incremental rendering, makes error handling harder
          (you might have already shown half a message before the stream dies), and complicates anything
          downstream that needs the <em>full</em> response — JSON validation, tool calls, post-processing.
        </p>

        <p>Skip streaming when:</p>

        <ul className="list-disc pl-6 space-y-1">
          <li><strong>The response is short enough that the spinner is invisible.</strong> Classification, yes/no, single-word output — non-streaming is simpler and the user can&apos;t tell.</li>
          <li><strong>You need the whole structured output before doing anything.</strong> If the LLM is producing JSON for your code to consume, partial JSON is useless — wait for it.</li>
          <li><strong>The output goes to a non-human consumer.</strong> Cron job, webhook, batch process. Nobody&apos;s watching.</li>
        </ul>

        <p>Stream when:</p>

        <ul className="list-disc pl-6 space-y-1">
          <li><strong>A human is reading prose as it appears.</strong> Chat. Long-form generation. Q&amp;A. Code explanation.</li>
          <li><strong>You want to surface tool calls live</strong> (&quot;Searching docs…&quot; → &quot;Reading 3 results…&quot; → &quot;Drafting answer…&quot;). We&apos;ll cover this in Part 4.</li>
          <li><strong>Generation can take more than ~2 seconds.</strong> That&apos;s the spinner-tolerance threshold for most users.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="A teammate wants to stream the response from an LLM call that returns a JSON array of `{vendor, total}` for a receipt-parsing endpoint. The frontend then renders a table from that array. Should you stream?"
          options={[
            { label: "Yes — streaming always feels faster", explanation: "The user can't read partial JSON, and the table can't render from invalid JSON. Streaming buys nothing here and complicates parsing." },
            { label: "No — the consumer is your code, not a human reader, and partial JSON is unusable", correct: true, explanation: "Right. The output is structured data feeding a UI component. You need the full, valid JSON before you can render. Show a friendly loader on the table, and let the API call complete." },
            { label: "Stream the raw text and parse on every chunk", explanation: "Possible but fragile — partial JSON is invalid by definition until the closing brace, so most chunks are throwaway." },
            { label: "Stream only if the array might be long", explanation: "Length isn't the signal — usability of partial output is. If the consumer can't use partial output, don't stream." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Streaming converts dead-air waiting into watch-along generation. It's a UX choice, not a default. Use it when a human is reading prose; skip it when your code is parsing JSON."
          points={[
            { takeaway: "Streaming wins on time-to-first-byte, not total time.", detail: "Users read along with the model. The 7s response that started in 700ms feels faster than the 7s response that started after 7s. Same work, different feeling." },
            { takeaway: "Don't stream into structured-data consumers.", detail: "If a renderer needs valid JSON, partial chunks are useless. Wait for the whole response. Save streaming for human-readable prose." },
          ]}
        />

        <Checkpoint moduleSlug="react-streaming" id="why-streaming" title="Why streaming changes the UX" xp={15} celebration="You know when to reach for streaming and when to skip it.">
          <p>
            You should be able to articulate, in two sentences, why a streaming chat UI feels faster than
            a non-streaming one — and name two cases where streaming is the wrong choice.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: SSE IN THE BROWSER                                          */}
      {/* ================================================================= */}
      <section id="browser-sse">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — SSE in the browser, properly</h2>

        <p>
          Module 12 set up the server side: Spring Boot returns a <code>text/event-stream</code> response
          and pushes <code>data: ...</code> frames as the LLM emits tokens. The browser has two ways to
          consume that stream. One is famous and inadequate; the other is what you&apos;ll actually use.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Option A: <code>EventSource</code> (the famous one)</h3>

        <p>
          The browser ships an <code>EventSource</code> API specifically for SSE. It auto-reconnects,
          dispatches events, and is roughly four lines of code:
        </p>

        <CodeBlock lang="plain">{`const es = new EventSource("/api/chat?prompt=hello");
es.onmessage = (e) => console.log(e.data);
es.onerror = () => es.close();`}</CodeBlock>

        <p>This is great — for demos. It falls apart in production for two reasons:</p>

        <ol className="list-decimal pl-6 space-y-1">
          <li>
            <strong>It only does GET.</strong> Your chat request has a body — messages, tool config,
            session ID, model parameters. None of that fits in a query string. (And query strings show
            up in server logs, which you don&apos;t want for user prompts.)
          </li>
          <li>
            <strong>You can&apos;t set headers.</strong> No <code>Authorization</code>, no
            <code>Content-Type</code>. Cookies work, custom auth doesn&apos;t. Most production AI APIs
            need a header.
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">Option B: <code>fetch</code> + <code>ReadableStream</code> (the right one)</h3>

        <p>
          Modern <code>fetch</code> returns a response with a <code>body</code> that&apos;s a
          <code>ReadableStream</code>. You read it chunk by chunk, decode bytes to text, and parse the SSE
          frames yourself. It&apos;s twenty lines of code, supports POST, headers, and aborts cleanly.
        </p>

        <CodeBlock lang="plain">{`// streamChat.ts
export type ChatChunk =
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export async function* streamChat(
  body: { messages: Array<{ role: "user" | "assistant"; content: string }> },
  signal: AbortSignal,
): AsyncGenerator<ChatChunk> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    yield { type: "error", message: \`HTTP \${res.status}\` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let sepIdx;
    while ((sepIdx = buffer.indexOf("\\n\\n")) !== -1) {
      const frame = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);

      // Each frame has one or more "field: value" lines. We only care about "data:".
      for (const line of frame.split("\\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trimStart();
        if (payload === "[DONE]") {
          yield { type: "done" };
          return;
        }
        try {
          const evt = JSON.parse(payload);
          if (evt.token) yield { type: "token", text: evt.token };
        } catch {
          // Malformed frame — skip it; don't crash the stream.
        }
      }
    }
  }
}`}</CodeBlock>

        <p>Three things worth noting in this code:</p>

        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>It&apos;s an async generator.</strong> Consumers loop with <code>for await</code>,
            which is the cleanest possible way to render incoming tokens.
          </li>
          <li>
            <strong>It buffers across reads.</strong> A single <code>reader.read()</code> may give you
            half a frame, two frames, or one and a half. We hold onto the partial in <code>buffer</code>
            until we see <code>\n\n</code>.
          </li>
          <li>
            <strong>It tolerates a bad frame.</strong> If one JSON parse fails (network glitch, server
            bug), we skip it and keep going. Streams should be resilient.
          </li>
        </ul>

        <Callout variant="warn" title="Don't reach for an SSE library unless you have to">
          <p className="m-0">
            The 20 lines above are easier to read, debug, and modify than any package you&apos;ll find.
            SSE is a simple protocol; the libraries usually add more surface area than they save you.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">A mock SSE endpoint for development</h3>

        <p>
          Rather than depend on a running Spring Boot server while you&apos;re building the React side,
          ship a mock as a Next.js Route Handler. It generates fake tokens at a realistic cadence:
        </p>

        <CodeBlock lang="plain">{`// app/api/chat/route.ts
export const runtime = "edge";

const FAKE_REPLY =
  "Streaming feels faster because users see progress immediately. " +
  "The total time is the same; the perceived time is dramatically lower.";

export async function POST() {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const tokens = FAKE_REPLY.split(/(\\s+)/); // keep whitespace as its own tokens
      for (const t of tokens) {
        const frame = \`data: \${JSON.stringify({ token: t })}\\n\\n\`;
        controller.enqueue(enc.encode(frame));
        await new Promise((r) => setTimeout(r, 40)); // ~25 tokens/sec
      }
      controller.enqueue(enc.encode("data: [DONE]\\n\\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}`}</CodeBlock>

        <p>
          That&apos;s enough to develop the entire chat UI without touching a real LLM. Swap the
          endpoint URL when you&apos;re ready to point at Module 12&apos;s Spring Boot service.
        </p>

        <WorkedExample
          title="Tracing one streamed message"
          subtitle="User types 'hi' and clicks send. Walk through what happens, one hop at a time."
          steps={[
            {
              title: "Browser opens the connection",
              body: (
                <p className="text-sm">
                  <code>fetch(&quot;/api/chat&quot;, {`{ method: "POST", body: ... }`})</code> opens
                  a TCP connection and sends the request body. The promise resolves as soon as headers
                  arrive, not when the body is done.
                </p>
              ),
            },
            {
              title: "Server flushes headers, holds body open",
              body: (
                <p className="text-sm">
                  Returns <code>Content-Type: text/event-stream</code> immediately. Headers go out;
                  the body stays open and bytes will trickle in over time.
                </p>
              ),
            },
            {
              title: "Server pushes data frames",
              body: (
                <p className="text-sm">
                  <code>{`data: {"token":"Hi"}`}</code> + blank line. ~40ms later,
                  <code>{`data: {"token":" there"}`}</code>. And so on, one frame per token (or per
                  small batch).
                </p>
              ),
            },
            {
              title: "Browser reads, buffers, parses",
              body: (
                <p className="text-sm">
                  <code>reader.read()</code> resolves with each chunk. Most reads contain one frame;
                  some contain two; some contain half. The <code>buffer</code> + <code>indexOf(&quot;\n\n&quot;)</code>
                  loop handles all three cases.
                </p>
              ),
            },
            {
              title: "Generator yields tokens",
              body: (
                <p className="text-sm">
                  Each <code>{`{ type: "token", text }`}</code> yields out of <code>streamChat</code>.
                  The React consumer&apos;s <code>for await</code> loop receives them and appends to
                  the in-flight assistant message.
                </p>
              ),
            },
            {
              title: "Server signals done",
              body: (
                <p className="text-sm">
                  Sends <code>data: [DONE]</code>. The generator yields <code>{`{ type: "done" }`}</code>
                  and returns.
                </p>
              ),
            },
            {
              title: "Hook returns to idle",
              body: (
                <p className="text-sm">
                  The <code>for await</code> loop exits. The hook flips state to <code>idle</code>;
                  the UI re-enables the composer. Seven hops, no magic — each one is a place you can
                  drop a <code>console.log</code> if something goes wrong.
                </p>
              ),
            },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Your chat request needs to include an `Authorization: Bearer ...` header. Which approach works?"
          options={[
            { label: "EventSource — pass the token in the URL query string", explanation: "Tokens in URLs leak via logs, browser history, and referrers. Don't." },
            { label: "EventSource with a custom .headers property", explanation: "EventSource has no headers property. The API doesn't support it." },
            { label: "fetch + ReadableStream — fetch supports arbitrary headers including Authorization", correct: true, explanation: "Right. fetch is the only option once you need POST bodies, custom headers, or any auth scheme other than cookies. EventSource is a demo-grade tool." },
            { label: "Both work fine — pick whichever", explanation: "EventSource literally cannot set headers. They are not equivalent." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="Your stream parser splits on \\n\\n to find frame boundaries. Why buffer across reads instead of parsing each read independently?"
          options={[
            { label: "It's faster", explanation: "Performance isn't the issue — correctness is." },
            { label: "A single read may contain a partial frame, multiple frames, or one-and-a-half frames; you can only know where frames end by scanning for \\n\\n across the running buffer", correct: true, explanation: "TCP gives you bytes, not message boundaries. The HTTP layer doesn't either. You have to reassemble at the SSE layer yourself, which means accumulating bytes until you see \\n\\n and only then parsing." },
            { label: "It saves memory", explanation: "It uses slightly more memory, not less. The reason is correctness." },
            { label: "ReadableStream requires it", explanation: "ReadableStream is happy either way — buffering is a parser concern, not a stream concern." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 2 recap"
          gist="EventSource is a tutorial trap. Use fetch + ReadableStream + a small SSE parser. Twenty lines, full control, supports POST and headers."
          points={[
            { takeaway: "EventSource is GET-only and header-less.", detail: "Production chat APIs need POST bodies and Authorization headers. EventSource provides neither. Skip it." },
            { takeaway: "Buffer across reads.", detail: "A reader.read() doesn't know about SSE frames. Maintain a string buffer, look for \\n\\n, and only parse complete frames." },
            { takeaway: "Async generators are the right shape.", detail: "yield each token; consumers use for-await. No event emitters, no callbacks, no race conditions." },
          ]}
        />

        <Checkpoint moduleSlug="react-streaming" id="browser-sse" title="SSE in the browser, properly" xp={20} celebration="You can read an SSE stream from JS without any libraries.">
          <p>
            You should be able to: write a streamChat async generator from scratch, explain why
            EventSource isn&apos;t enough, and stand up a mock SSE endpoint for local development.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: useStreamingChat                                            */}
      {/* ================================================================= */}
      <section id="use-streaming-chat">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — The <code>useStreamingChat</code> hook</h2>

        <p>
          The async generator is the engine. The hook is the dashboard the rest of your app talks to.
          We want it to:
        </p>

        <ul className="list-disc pl-6 space-y-1">
          <li>Hold a list of messages (user + assistant)</li>
          <li>Expose a <code>send(text)</code> function</li>
          <li>Track a status: <code>idle</code> / <code>streaming</code> / <code>error</code></li>
          <li>Support cancelling an in-flight stream (the user clicks &quot;stop&quot;)</li>
          <li>Append tokens to the in-flight assistant message as they arrive</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">The state shape</h3>

        <CodeBlock lang="plain">{`// useStreamingChat.ts
import { useCallback, useRef, useState } from "react";
import { streamChat } from "./streamChat";

export type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; streaming?: boolean };

export type Status = "idle" | "streaming" | "error";

export function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string) => {
    if (status === "streaming") return; // already busy

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    // Optimistically render both messages immediately.
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStatus("streaming");
    setError(null);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      for await (const chunk of streamChat({ messages: history }, ctrl.signal)) {
        if (chunk.type === "token") {
          // Append to the in-flight assistant message.
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk.text }
                : m,
            ),
          );
        } else if (chunk.type === "error") {
          throw new Error(chunk.message);
        }
        // "done" falls through to the cleanup below.
      }

      // Stream completed cleanly.
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
      );
      setStatus("idle");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled — keep the partial assistant message; it's valid.
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
        );
        setStatus("idle");
      } else {
        setError((err as Error).message);
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [messages, status]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, status, error, send, stop };
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Five things this hook gets right</h3>

        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Single source of truth for both messages.</strong> The user message and the
            in-flight assistant message both go into <code>messages</code> immediately. No separate
            &quot;current draft&quot; state to keep in sync.
          </li>
          <li>
            <strong>The assistant message is born streaming.</strong> Its <code>streaming</code> flag
            flips when the stream ends, which lets the UI show a cursor / pulse while it&apos;s alive.
          </li>
          <li>
            <strong>AbortController lives in a ref, not state.</strong> Aborting is a side effect, not
            data the UI depends on. <code>useRef</code> is correct.
          </li>
          <li>
            <strong>Cancelled streams aren&apos;t errors.</strong> If the user clicks stop, the partial
            text is fine — we keep it and go back to idle. Network failures are the actual error path.
          </li>
          <li>
            <strong>The history sent to the server includes the new user message.</strong> Easy to get
            wrong: if you read <code>messages</code> directly, you&apos;ll miss the message you just
            added (state updates are async). We build the history explicitly.
          </li>
        </ol>

        <Callout variant="warn" title="Watch out: re-rendering on every token">
          <p className="m-0">
            If your messages get very long (thousands of tokens), <code>setMessages</code> on every
            token will re-render the whole list. Two cheap fixes: split the in-flight message into its
            own state slot rendered by a sibling component, or switch to a reducer +{" "}
            <code>useSyncExternalStore</code> for that slot. For most chat UIs (under a few thousand
            tokens per message), the simple version is fine — measure before you optimize.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Using the hook</h3>

        <CodeBlock lang="plain">{`// ChatExample.tsx
import { useStreamingChat } from "./useStreamingChat";

export function ChatExample() {
  const { messages, status, send, stop } = useStreamingChat();

  return (
    <div>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>
            <strong>{m.role}:</strong> {m.content}
            {m.role === "assistant" && m.streaming && <span> ▍</span>}
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("msg") as HTMLInputElement;
          if (input.value.trim()) {
            send(input.value);
            input.value = "";
          }
        }}
      >
        <input name="msg" disabled={status === "streaming"} />
        <button type="submit" disabled={status === "streaming"}>Send</button>
        {status === "streaming" && <button type="button" onClick={stop}>Stop</button>}
      </form>
    </div>
  );
}`}</CodeBlock>

        <p>
          That&apos;s a working streaming chat in 30 lines of UI code. Style it however you want; the
          state management is solved.
        </p>

        <Quiz
          kind="Quick check"
          question="Why does the hook build `history` from `[...messages, userMsg]` instead of just reading `messages` after setMessages?"
          options={[
            { label: "Performance", explanation: "Performance isn't the issue. Correctness is." },
            { label: "setMessages is async — at the moment we call streamChat, the latest `messages` ref still points at the OLD array, missing the user message we just added", correct: true, explanation: "React state updates are batched and applied asynchronously. If you read `messages` right after setMessages, you get the previous value. Building the history explicitly from the value you already have avoids the race." },
            { label: "TypeScript inference fails otherwise", explanation: "Inference works either way." },
            { label: "It's idiomatic React", explanation: "It's idiomatic to *avoid* reading state right after setting it; that's the underlying reason." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="The user clicks Stop mid-stream. What's the right behavior?"
          options={[
            { label: "Throw away the partial assistant message — it's incomplete", explanation: "Partial answers are still useful — the user explicitly asked to stop because they had enough. Discarding their content is hostile." },
            { label: "Keep the partial assistant message, flip its streaming flag off, return to idle. Don't surface it as an error.", correct: true, explanation: "User-initiated abort is a normal control flow, not a failure. Keep the partial content (it's often what they wanted). Only surface real errors (network, server) as errors." },
            { label: "Show an error 'request cancelled'", explanation: "User cancels are not errors. Reserve error UI for actual failures." },
            { label: "Re-send the request automatically when they hit send next", explanation: "That conflates two user actions. Treat stop as final." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 3 recap"
          gist="useStreamingChat is a small state machine: idle → streaming → idle | error. Track messages, status, error, and an AbortController ref. User stops aren't errors."
          points={[
            { takeaway: "Optimistically add both user and assistant messages on send.", detail: "The assistant is born empty + streaming=true; tokens append; streaming flips off at done. Single source of truth for the whole conversation." },
            { takeaway: "AbortController belongs in useRef.", detail: "It's a side-effect handle, not data that drives rendering. Putting it in state would just cause unnecessary re-renders." },
            { takeaway: "Build the request history from the values you already have.", detail: "Don't read state right after setting it — React batching means you'd miss your own update. Construct the new array inline." },
          ]}
        />

        <Checkpoint moduleSlug="react-streaming" id="use-streaming-chat" title="The useStreamingChat hook" xp={25} celebration="You have the bones of every chat UI you'll ever build.">
          <p>
            You should be able to: write a hook that wraps the streaming generator with a clean state
            machine, support abort, and explain why each piece of state is shaped the way it is.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: OPTIMISTIC UI & TOOL RESULTS                                */}
      {/* ================================================================= */}
      <section id="optimistic-tools">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Optimistic UI &amp; tool results</h2>

        <p>
          The basics are working. Now let&apos;s deal with the realities: the assistant doesn&apos;t
          just emit text — it sometimes calls tools (Module 11), and the user wants to see what&apos;s
          happening. Streams also drop. We need to handle both.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Surfacing tool calls live</h3>

        <p>
          When the model calls a tool, your backend sees something like:
        </p>

        <CodeBlock lang="plain">{`assistant turn 1:
  - tool_use: search_docs(query="how do I configure X")
tool result:
  - 3 chunks
assistant turn 2:
  - text: "To configure X you..."
  - text: " ..."
  - text: " ..."`}</CodeBlock>

        <p>
          A naive UI would only stream the final text. A good one shows the tool calls as they happen:
          <em> &quot;Searching docs… &gt; found 3 results &gt; Drafting answer…&quot;</em>. Users trust the
          system more when they can see what it&apos;s doing.
        </p>

        <p>Extend the SSE protocol with more event types:</p>

        <CodeBlock lang="plain">{`// Updated chunk type
export type ChatChunk =
  | { type: "token"; text: string }
  | { type: "tool_call"; id: string; name: string; input: unknown }
  | { type: "tool_result"; id: string; output: unknown }
  | { type: "done" }
  | { type: "error"; message: string };`}</CodeBlock>

        <p>And extend the message shape so the renderer can show tool steps:</p>

        <CodeBlock lang="plain">{`export type MessagePart =
  | { kind: "text"; text: string }
  | { kind: "tool"; id: string; name: string; input: unknown; output?: unknown };

export type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; parts: MessagePart[]; streaming?: boolean };`}</CodeBlock>

        <p>The hook&apos;s reducer logic for assistant messages becomes:</p>

        <CodeBlock lang="plain">{`function reduceChunk(parts: MessagePart[], chunk: ChatChunk): MessagePart[] {
  switch (chunk.type) {
    case "token": {
      // Append to the trailing text part, or start a new one if the last part is a tool.
      const last = parts[parts.length - 1];
      if (last && last.kind === "text") {
        return [...parts.slice(0, -1), { ...last, text: last.text + chunk.text }];
      }
      return [...parts, { kind: "text", text: chunk.text }];
    }
    case "tool_call": {
      return [...parts, { kind: "tool", id: chunk.id, name: chunk.name, input: chunk.input }];
    }
    case "tool_result": {
      return parts.map((p) =>
        p.kind === "tool" && p.id === chunk.id ? { ...p, output: chunk.output } : p,
      );
    }
    default:
      return parts;
  }
}`}</CodeBlock>

        <p>
          Now the renderer walks <code>message.parts</code> and shows each one — text as text, tools as
          a styled badge with the tool name, status icon, and (after tool_result lands) a small preview
          of the output.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">A <code>&lt;StreamingMessage&gt;</code> component</h3>

        <CodeBlock lang="plain">{`// StreamingMessage.tsx
import type { Message, MessagePart } from "./useStreamingChat";

export function StreamingMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return <div className="msg user">{message.content}</div>;
  }

  return (
    <div className="msg assistant">
      {message.parts.map((part, i) => (
        <Part key={i} part={part} />
      ))}
      {message.streaming && <span className="cursor">▍</span>}
    </div>
  );
}

function Part({ part }: { part: MessagePart }) {
  if (part.kind === "text") {
    return <span>{part.text}</span>;
  }
  return (
    <div className="tool-call">
      <span className="tool-name">🔧 {part.name}</span>
      <span className="tool-status">
        {part.output ? "✓ done" : "⋯ running"}
      </span>
    </div>
  );
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Auto-scroll: harder than it looks</h3>

        <p>
          Every chat UI wants to auto-scroll as new tokens land. But you can&apos;t just scroll on every
          token — the user might have scrolled up to re-read something earlier, and yanking them back
          to the bottom mid-read is infuriating.
        </p>

        <p>The right rule: <em>auto-scroll only when the user is already near the bottom.</em></p>

        <CodeBlock lang="plain">{`// useAutoScroll.ts
import { useEffect, useRef } from "react";

export function useAutoScroll<T>(dep: T) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only auto-scroll if the user is within 100px of the bottom.
    if (distanceFromBottom < 100) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dep]);

  return ref;
}`}</CodeBlock>

        <p>
          Attach the ref to the message list container and pass <code>messages.length</code> (or the
          last message&apos;s text length) as the dep. Now scrolling up to read history is sticky;
          scrolling back down rejoins the live stream.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Recovering from dropped streams</h3>

        <p>
          Streams can fail mid-flight. WiFi drops, the server crashes, a load balancer kills an idle
          connection. The user is staring at half a sentence with no cursor moving. What now?
        </p>

        <p>Three useful behaviors:</p>

        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Mark the assistant message as failed but keep what arrived.</strong> Don&apos;t
            erase content. Show an inline &quot;⚠ stream interrupted&quot; below it.
          </li>
          <li>
            <strong>Offer a <em>continue</em> button.</strong> Re-sends the conversation with a system
            instruction like &quot;Continue from where you left off, do not repeat what you&apos;ve
            already said.&quot; The model is good at this.
          </li>
          <li>
            <strong>Don&apos;t auto-retry silently.</strong> A silent retry doubles your API spend and
            often produces a different answer mid-conversation. Make the user click.
          </li>
        </ol>

        <CodeBlock lang="plain">{`// In the catch block of useStreamingChat:
} catch (err) {
  if ((err as Error).name === "AbortError") {
    // (handled above)
  } else {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, streaming: false, error: (err as Error).message }
          : m,
      ),
    );
    setStatus("error");
  }
}`}</CodeBlock>

        <p>
          And the message component renders the error inline:
        </p>

        <CodeBlock lang="plain">{`{message.error && (
  <div className="stream-error">
    ⚠ stream interrupted: {message.error}
    <button onClick={() => continueFrom(message.id)}>Continue</button>
  </div>
)}`}</CodeBlock>

        <Callout variant="insight" title="Partial content + retry is the industry pattern">
          <p className="m-0">
            Every mature chat product does this — ChatGPT, Claude.ai, Cursor. Keep the partial content;
            offer a continue button. Don&apos;t silent-retry and don&apos;t erase what arrived.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Mid-stream, the user scrolls up to re-read an earlier message. New tokens arrive. What should the UI do?"
          options={[
            { label: "Always scroll to bottom — that's where the action is", explanation: "Yanks the user out of what they're reading. Terrible UX." },
            { label: "Never auto-scroll — let the user manage scrolling themselves", explanation: "Then the new live tokens go off-screen and the user has to manually scroll down constantly. Annoying." },
            { label: "Auto-scroll only when the user is already near the bottom (within ~100px); leave them alone otherwise", correct: true, explanation: "This is the polite rule. If the user is following the live stream, keep them there. If they're reading history, respect that. A 'Jump to latest' button can offer the option to rejoin." },
            { label: "Pause the stream when the user scrolls up", explanation: "Pausing the API call would cancel and restart it — pure waste. Just stop auto-scrolling." },
          ]}
          xp={10}
        />

        <Quiz
          kind="Quick check"
          question="A stream dies after ~150 of an expected ~600 tokens. What's the best UX?"
          options={[
            { label: "Erase the partial message and show a generic error", explanation: "Throws away useful content the model already produced. Hostile." },
            { label: "Keep the partial content, mark it errored, show a 'Continue' button that re-prompts the model to pick up where it left off", correct: true, explanation: "Best of both worlds: user keeps what they got, and can resume in one click. The model is good at continuation when you tell it where it stopped." },
            { label: "Auto-retry the whole request silently", explanation: "Doubles cost and may produce a different answer halfway through, which is jarring. Make the user opt in." },
            { label: "Show the error and disable the chat input until they refresh", explanation: "Treating recoverable network errors as unrecoverable trains users to refresh the page constantly. Bad pattern." },
          ]}
          xp={10}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Real chat UIs surface tool calls inline, auto-scroll only when the user is near the bottom, and treat stream failures as recoverable: keep partial content, offer a continue button."
          points={[
            { takeaway: "Tool calls deserve their own message parts.", detail: "Don't merge tool I/O into the text stream. Model the message as parts: [text, tool, text, tool, text]. Let the renderer style each part appropriately." },
            { takeaway: "Auto-scroll only when the user is already at the bottom.", detail: "Sticky-bottom is the right rule. If the user has scrolled up, they're reading — don't yank them back. Add a 'Jump to latest' button as the escape hatch." },
            { takeaway: "Failed streams keep their partial content.", detail: "Mark the message errored, surface a continue button. Don't silent-retry, don't erase content, don't disable the UI." },
          ]}
        />

        <Checkpoint moduleSlug="react-streaming" id="optimistic-tools" title="Optimistic UI & tool results" xp={25} celebration="Your chat UI behaves the way users expect, even when things go sideways.">
          <p>
            You should be able to: render a streaming message with mixed text and tool-call parts,
            auto-scroll politely, and recover from a dropped stream without losing the user&apos;s
            content.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: PROJECT                                                     */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: chat UI component library</h2>

        <p>
          Build a small, reusable chat UI library. Three components, one hook, one mock endpoint.
          When you&apos;re done you can drop it into any Next.js app and have a working streaming chat
          in five lines.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Project scope</h3>

        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Hook:</strong> <code>useStreamingChat</code> — the one from Part 3, extended with the parts model from Part 4.</li>
          <li><strong>Component:</strong> <code>&lt;StreamingMessage&gt;</code> — renders one message, handles text + tool parts.</li>
          <li><strong>Component:</strong> <code>&lt;MessageList&gt;</code> — renders an array of messages with <code>useAutoScroll</code>.</li>
          <li><strong>Component:</strong> <code>&lt;ChatComposer&gt;</code> — input + send/stop buttons; disabled while streaming.</li>
          <li><strong>Mock endpoint:</strong> <code>app/api/chat/route.ts</code> — fakes tokens and one tool call so you can develop without a backend.</li>
          <li><strong>Demo page:</strong> <code>app/chat-demo/page.tsx</code> — wires it all together; this is your manual test bed.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Setup</h3>

        <CodeBlock lang="plain">{`npx create-next-app@latest chat-ui-lab --typescript --app --no-tailwind
cd chat-ui-lab
mkdir -p src/lib/chat
mkdir -p src/app/api/chat
mkdir -p src/app/chat-demo`}</CodeBlock>

        <p>(Tailwind optional — the components should be unstyled enough that consumers can theme them.)</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Mock endpoint with one tool call</h3>

        <p>
          The mock should emit a tool call halfway through the stream so you can see your tool-rendering
          path light up. Something like:
        </p>

        <CodeBlock lang="plain">{`// app/api/chat/route.ts
const SCRIPT = [
  { type: "token", text: "Let me " },
  { type: "token", text: "look that up. " },
  { type: "tool_call", id: "t1", name: "search_docs", input: { q: "configuration" } },
  { type: "tool_result", id: "t1", output: { hits: 3 } },
  { type: "token", text: "Found three relevant docs. " },
  { type: "token", text: "The short answer is: " },
  { type: "token", text: "set CONFIG_X=true in your env." },
];

export async function POST() {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      for (const evt of SCRIPT) {
        const frame = \`data: \${JSON.stringify(evt)}\\n\\n\`;
        controller.enqueue(enc.encode(frame));
        await new Promise((r) => setTimeout(r, evt.type === "tool_call" ? 800 : 60));
      }
      controller.enqueue(enc.encode("data: [DONE]\\n\\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Demo page (the manual test)</h3>

        <CodeBlock lang="plain">{`// app/chat-demo/page.tsx
"use client";
import { useStreamingChat } from "@/lib/chat/useStreamingChat";
import { MessageList } from "@/lib/chat/MessageList";
import { ChatComposer } from "@/lib/chat/ChatComposer";

export default function ChatDemo() {
  const { messages, status, error, send, stop } = useStreamingChat();

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", padding: "1rem" }}>
      <h1>Chat UI Lab</h1>
      <MessageList messages={messages} />
      <ChatComposer
        onSend={send}
        onStop={stop}
        status={status}
      />
      {error && <p style={{ color: "tomato" }}>Error: {error}</p>}
    </main>
  );
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Acceptance criteria</h3>

        <p>You&apos;ve shipped this when:</p>

        <ul className="list-disc pl-6 space-y-1">
          <li>Tokens appear in the UI within ~100ms of the mock starting to emit them.</li>
          <li>The tool-call appears as a styled badge with a &quot;running&quot; → &quot;done&quot; transition.</li>
          <li>Clicking <strong>Stop</strong> mid-stream keeps the partial assistant content and re-enables the input.</li>
          <li>Scrolling up while a stream is live <em>doesn&apos;t</em> yank you back down. Scrolling back to the bottom resumes auto-scroll.</li>
          <li>Refreshing the page returns you to a clean state — no zombie streams in the network tab.</li>
          <li>The components have no styling tied to the demo page; they&apos;re drop-in usable elsewhere.</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Stretch goals</h3>

        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Markdown rendering</strong> — use <code>react-markdown</code> with safe defaults to render the text parts.</li>
          <li><strong>Code block syntax highlighting</strong> — your AI is going to emit a lot of code. Make it readable.</li>
          <li><strong>Continue button</strong> on errored messages, as in Part 4.</li>
          <li><strong>Persist conversations</strong> to <code>localStorage</code> so a refresh doesn&apos;t lose history. (We&apos;ll do this properly in Module 19 with a backend session store.)</li>
        </ul>

        <Checkpoint moduleSlug="react-streaming" id="project" title="Project: chat UI component library" xp={50} manual manualLabel="My library streams cleanly" celebration="You have a chat UI you'll reuse for the rest of the course.">
          <p>
            Mark this done once: tokens stream visibly, tool calls render with status, stop preserves
            partial content, auto-scroll is polite, and you&apos;ve dropped the components into the
            demo page from less than 30 lines of glue code.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL QUIZ                                                  */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final check"
          question="A new dev on your team uses EventSource to consume your /api/chat endpoint. It works in their demo but breaks in staging because staging requires an Authorization header. What's the fix?"
          options={[
            { label: "Add the token to the EventSource URL as a query parameter", explanation: "Tokens in URLs leak via logs and are anti-pattern. Don't paper over EventSource's limits — replace it." },
            { label: "Switch to fetch + ReadableStream + a small SSE parser; pass Authorization in the headers", correct: true, explanation: "Right. EventSource hits a wall as soon as you need POST bodies or non-cookie auth. The 20-line fetch parser handles both, and you control the protocol completely." },
            { label: "Use an SSE library from npm", explanation: "Most SSE libraries wrap fetch + ReadableStream too. You don't need 80KB of dependencies for 20 lines of parser." },
            { label: "Tell ops to allow auth via cookie only", explanation: "Restructuring your auth to fit a transport limitation is backwards. Pick the right transport." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your hook accumulates tokens by calling setMessages with a map over the array on every token. After ~5000 tokens in a single message, the UI gets noticeably janky. What's the smallest fix that keeps the architecture intact?"
          options={[
            { label: "Switch to vanilla JS — React is too slow", explanation: "Premature retreat. The bottleneck is rerendering a long list of messages, not React itself." },
            { label: "Move the in-flight assistant message into its own state slot rendered by a sibling component, so the rest of the message list doesn't rerender on every token", correct: true, explanation: "The full message list rerendering on every token is the cost. Splitting the live message into its own state means the historical list rerenders zero times during the stream — only the live message rerenders, and React is fast at small components." },
            { label: "Throttle setMessages to every 50ms", explanation: "Works but feels laggy — you've now decoupled visual update from token arrival. The split-state approach is cheaper and feels native." },
            { label: "Keep the tokens in a ref and only flush to state on done", explanation: "Then the user sees nothing until done — you've turned streaming back into batch. Defeats the point." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You shipped the chat UI. A user reports: 'I asked a question, the model started answering, then stopped halfway through. I refreshed and now my whole conversation is gone.' Two bugs — name them."
          options={[
            { label: "(a) The dropped stream wasn't surfaced as recoverable; (b) conversation state lives only in component state", correct: true, explanation: "Right on both. Drop-recovery should leave partial content in place with a continue button, not silently strand the user. And conversation state belongs somewhere durable (localStorage at minimum, server-side ideally) so a refresh doesn't nuke history. Module 19 handles the server-side persistence." },
            { label: "The user's network is flaky — not your bug", explanation: "Network is flaky everywhere. It's exactly your job to handle it gracefully." },
            { label: "EventSource auto-reconnect failed", explanation: "We're not using EventSource — and even if we were, auto-reconnect doesn't help in the middle of one stream." },
            { label: "The model produced a malformed response", explanation: "Possible but not the systemic issue. The systemic issues are recovery UX and persistence." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="The product team wants the assistant to show 'Searching docs...' → 'Reading 3 results...' → 'Drafting answer...' before the final answer streams in. What's the right model?"
          options={[
            { label: "Encode tool steps as text tokens (e.g. literally stream 'Searching docs...' as text and then erase it)", explanation: "Hacky and brittle — you'd have to deal with characters that look like real tokens, and erasing streamed text is jarring." },
            { label: "Extend the SSE protocol with tool_call and tool_result events; render the message as an ordered list of parts (text/tool/text/tool); the renderer styles tool parts as badges with status icons", correct: true, explanation: "This is the clean shape. Each tool gets its own structured part with id/name/input/output. The renderer styles them however the product wants — minimal badge, expandable details, whatever. Same data, multiple presentations." },
            { label: "Open a second WebSocket for tool events", explanation: "Second connection means coordination problems. SSE already supports multiple event types in one stream — use them." },
            { label: "Stream the tool steps through a separate API route", explanation: "Same problem as the second WebSocket — two streams to coordinate. One stream, multiple event types." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Reviewing a teammate's PR. They store the AbortController in `useState`. What do you tell them?"
          options={[
            { label: "Looks good", explanation: "It will work, but it's a misuse of state." },
            { label: "Move it to useRef — it's a side-effect handle, not data the UI renders from. Storing it in state causes unnecessary re-renders and the controller identity changes on every render", correct: true, explanation: "Refs are for mutable values that don't drive rendering. The controller is exactly that — UI doesn't 'show' the controller; it just needs a way to .abort(). useRef is correct." },
            { label: "Wrap it in useMemo", explanation: "useMemo can't help — you actually need a NEW controller for every send call, and a stable reference between renders. That's useRef." },
            { label: "Move it outside the component as a module-level singleton", explanation: "Now multiple instances of the chat component would fight over the same controller. Per-instance state belongs in a per-instance hook." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="react-streaming" id="final" title="Final quiz" xp={50} celebration="You can build any streaming chat UI from here. Module 19 turns the mock into a real backend.">
          <p>
            With this module complete, you have the React-side primitives — a streaming generator, a
            state-machine hook, and a small set of components — that every AI feature in the rest of
            the course will reuse. Next: connect it all to the Spring Boot service from Phase 2 and
            ship a real product.
          </p>
        </Checkpoint>
      </section>

      {/* FOOTER NAV */}
      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/rag-spring" className="text-slate-600 dark:text-slate-400 hover:text-sky-600">
          ← Module 17: RAG in Spring Boot
        </Link>
        <Link href="/courses/ai/modules/chat-interface" className="text-sky-600 hover:underline font-semibold">
          Module 19: Full chat interface →
        </Link>
      </footer>
    </article>
  );
}
