import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/ai";

// Pure revision module — no Checkpoints, no XP gates. Re-read in 15 minutes
// before you sit down to wire up a chat UI or debug a stuck stream.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase4RevisionModule() {
  const mod = getModuleBySlug("phase-4-revision")!;

  // End-to-end chat flow: composer in React → POST → Spring controller →
  // Flux<String> from the model → SSE wire → fetch ReadableStream → state
  // append → message list rerender. The diagram is the whole phase on one page.
  const chatFlowChart = `
flowchart LR
    U["User types<br/>in composer"] --> O["Optimistic add:<br/>append user msg<br/>+ empty assistant msg"]
    O --> P["POST /api/chat<br/>fetch + body"]
    P --> S["Spring controller<br/>Flux&lt;String&gt;"]
    S --> M["LLM SDK<br/>streaming call"]
    M --> SSE["SSE frames<br/>data: {token}"]
    SSE --> R["fetch ReadableStream<br/>+ TextDecoder"]
    R --> B["rAF-batched<br/>buffer flush"]
    B --> ST["setState: append<br/>to assistant msg"]
    ST --> UI["MessageList<br/>rerenders"]
    UI -.cancel.-> AC["AbortController<br/>on unmount /<br/>stop button"]
    AC -.aborts.-> P
    style U fill:#0ea5e9,color:#fff,stroke:#0284c7
    style O fill:#10b981,color:#fff,stroke:#059669
    style S fill:#f59e0b,color:#fff,stroke:#d97706
    style SSE fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style B fill:#10b981,color:#fff,stroke:#059669
    style AC fill:#ef4444,color:#fff,stroke:#dc2626
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 4 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 4 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          SSE consumption, chat UI patterns, multimodal — the frontend AI playbook on one card you can re-read in 15 minutes.
        </p>
        <ModuleProgress moduleSlug="phase-4-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 4</strong> — every transport choice, every render-loop trick, every multimodal gotcha from the three previous modules, compressed into cards and BAD/GOOD pairs. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep moving. Treat this as the page you re-open when you sit down to actually wire a chat UI to a Spring backend.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The three modules you&apos;re consolidating: <Link href="/courses/ai/modules/react-streaming" className="text-sky-600 hover:underline">React streaming patterns</Link>, <Link href="/courses/ai/modules/chat-interface" className="text-sky-600 hover:underline">Full chat interface</Link>, and <Link href="/courses/ai/modules/multimodal" className="text-sky-600 hover:underline">Multimodal inputs</Link>.
        </p>

        <Callout variant="insight">
          <strong>What this card covers:</strong> the four transport/UI/state/multimodal decisions you make every time you put an LLM on a screen — SSE vs fetch-stream, token-batched rendering, optimistic reconcile, image payload shape — plus the four mistakes that bite you in production. Quizzes at the end are non-gating recall checks.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — SSE consumption */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. SSE consumption — <code>EventSource</code> vs <code>fetch</code> stream</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Two ways to consume a server-sent token stream in the browser. They are not interchangeable. Pick the wrong one and you&apos;ll fight it for hours.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Capability</th>
                <th className="px-4 py-3 font-semibold">Native <code>EventSource</code></th>
                <th className="px-4 py-3 font-semibold"><code>fetch</code> + <code>ReadableStream</code></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">HTTP method</td>
                <td className="px-4 py-3 text-amber-600">GET only</td>
                <td className="px-4 py-3 text-emerald-600">Any — usually POST with JSON body</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Custom headers</td>
                <td className="px-4 py-3 text-rose-600">No (no <code>Authorization</code>!)</td>
                <td className="px-4 py-3 text-emerald-600">Full control</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Request body</td>
                <td className="px-4 py-3 text-rose-600">None — only query string</td>
                <td className="px-4 py-3 text-emerald-600">Any payload (messages, attachments, settings)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Auto-reconnect</td>
                <td className="px-4 py-3 text-emerald-600">Yes, with <code>Last-Event-ID</code></td>
                <td className="px-4 py-3 text-amber-600">Manual — you write the backoff loop</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Cancellation</td>
                <td className="px-4 py-3 text-emerald-600"><code>es.close()</code></td>
                <td className="px-4 py-3 text-emerald-600"><code>AbortController.abort()</code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Framing</td>
                <td className="px-4 py-3 text-emerald-600">Built-in <code>onmessage</code> / <code>event</code> types</td>
                <td className="px-4 py-3 text-amber-600">You parse <code>data: ...\n\n</code> yourself</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Cookies / credentials</td>
                <td className="px-4 py-3 text-amber-600"><code>withCredentials</code></td>
                <td className="px-4 py-3 text-emerald-600"><code>credentials: &quot;include&quot;</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Pick <code>EventSource</code> when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Read-only feed: notifications, server-pushed metrics, live ticker.</li>
              <li>State fits in a query string (an id, a topic name).</li>
              <li>You want free auto-reconnect with <code>Last-Event-ID</code> replay.</li>
              <li>Auth goes via cookie, not Bearer header.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Pick <code>fetch</code> stream when</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Chat: you need to POST a messages array, model params, attachments.</li>
              <li>You need a Bearer/Auth header (almost every LLM API).</li>
              <li>You want one shared <code>AbortController</code> for the whole turn.</li>
              <li>You&apos;re okay writing the reconnect loop yourself (backoff + jitter).</li>
            </ul>
          </div>
        </div>

        <CodeBlock lang="ts" caption="The fetch-stream shape you write 80% of the time">{`async function streamChat(
  body: ChatRequest,
  onToken: (t: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(\`HTTP \${res.status}\`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    // SSE frames end with \\n\\n
    const frames = buf.split("\\n\\n");
    buf = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;
      onToken(data);
    }
  }
}`}</CodeBlock>

        <CodeBlock lang="ts" caption="Reconnect with exponential backoff + jitter (for the rare cases you need it)">{`async function withReconnect(run: (signal: AbortSignal) => Promise<void>, signal: AbortSignal) {
  let attempt = 0;
  while (!signal.aborted) {
    try { await run(signal); return; }
    catch (err) {
      if (signal.aborted) return;
      attempt++;
      const base = Math.min(30_000, 500 * 2 ** attempt);
      const jitter = Math.random() * base * 0.25;       // ±25% jitter
      await new Promise((r) => setTimeout(r, base + jitter));
    }
  }
}`}</CodeBlock>

        <Callout variant="warn">
          <strong>Always pass an <code>AbortSignal</code>.</strong> A React component that unmounts mid-stream without aborting leaves a zombie fetch holding a socket open and calling <code>setState</code> on a dead component. React will warn; your server-side connection count will climb.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/react-streaming" className="text-sky-600 hover:underline">Module 20 — React streaming patterns</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Token-by-token rendering */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Token-by-token UI rendering</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Naive &quot;setState on every token&quot; renders 60+ times per second and turns the chat into a stutter. The fix is always the same: buffer in a ref, flush on <code>requestAnimationFrame</code>.
        </p>

        <CodeBlock lang="tsx" caption="rAF-batched token renderer">{`function useStreamingMessage() {
  const [text, setText] = useState("");
  const bufRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const append = useCallback((chunk: string) => {
    bufRef.current += chunk;
    if (rafRef.current != null) return;        // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      setText((prev) => prev + bufRef.current); // single setState per frame
      bufRef.current = "";
      rafRef.current = null;
    });
  }, []);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  return { text, append };
}`}</CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Streaming-cursor UX</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Render a blinking <code>▊</code> at the end of the in-flight message while <code>status === &quot;streaming&quot;</code>. Drop it on the first frame after <code>[DONE]</code>. Costs you 6 lines of CSS and signals &quot;model is still thinking&quot; without a separate spinner.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Scroll anchoring</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Only auto-scroll if the user is already near the bottom (within ~80px). If they&apos;ve scrolled up to read history, do not yank them down on every token. Track a <code>stickToBottom</code> flag in state and recompute it on user scroll.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Partial markdown</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Use a markdown parser that <em>tolerates</em> unclosed fences and half-tokens (<code>react-markdown</code> with <code>remark-gfm</code> is fine). Never use one that throws on incomplete input — you&apos;ll crash on every other token.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Memoize the list</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Wrap each finalized <code>&lt;Message&gt;</code> in <code>React.memo</code> keyed by message id. Only the in-flight message rerenders per frame; the 50 messages above it stay still.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/react-streaming" className="text-sky-600 hover:underline">Module 20 — React streaming patterns</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Mermaid: end-to-end flow */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. End-to-end chat flow in one diagram</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          From composer keystroke to UI rerender. The whole phase fits on one diagram — if you can describe what each box does, you understand Phase 4.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={chatFlowChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Optimistic add happens before the network call.</strong> Two messages are appended locally: the user&apos;s text and a placeholder assistant message with empty content and <code>status: &quot;streaming&quot;</code>. The composer clears immediately. The UI feels instant.
          </li>
          <li>
            <strong>The <code>Flux&lt;String&gt;</code> on the server</strong> is the Spring side. Each <code>String</code> emission becomes an SSE <code>data:</code> frame on the wire. Spring handles the framing; you just push strings.
          </li>
          <li>
            <strong>The reader on the client</strong> decodes bytes → text → frames → tokens, batches into a ref, flushes on rAF, calls <code>setState</code> with append-only logic.
          </li>
          <li>
            <strong>The <code>AbortController</code></strong> sits on top of everything. The user&apos;s &quot;Stop&quot; button calls <code>abort()</code>; <code>useEffect</code> cleanup calls <code>abort()</code>. Both unwind the entire pipeline without leaking the socket.
          </li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/chat-interface" className="text-sky-600 hover:underline">Module 21 — Full chat interface</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Chat UI patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Chat UI patterns — the message-list playbook</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The decisions you make in the first hour of building a chat UI lock you in for weeks. Get these right up front.
        </p>

        <CodeBlock lang="ts" caption="Message shape — assistant / user / tool turns in one discriminated union">{`type Message =
  | { id: string; role: "user"; content: string; createdAt: number }
  | {
      id: string;
      role: "assistant";
      content: string;
      status: "streaming" | "done" | "error";
      toolUses?: ToolUse[];
      createdAt: number;
    }
  | {
      id: string;
      role: "tool";
      toolUseId: string;
      content: string;       // tool result
      isError?: boolean;
      createdAt: number;
    };

type ToolUse = { id: string; name: string; input: unknown; output?: unknown; status: "pending" | "done" | "error" };`}</CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Optimistic + reconcile</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Append the user message and an empty assistant message <em>before</em> the request leaves. On the first token, the assistant message&apos;s status flips from <code>streaming</code> to populated content. On error, swap to <code>status: &quot;error&quot;</code> and expose a Retry. <strong>Never delete the optimistic message on error</strong> — leave it so the user can see what they sent.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Tool-use rendering</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Render <code>toolUses</code> as collapsible blocks inside the assistant turn — name + input + output + status pill. Default to collapsed; let the user expand to inspect. This is the single biggest debugging affordance you can give yourself in dev.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Per-message affordances</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Copy (always), Retry (last assistant turn only), Edit (user turn — truncate history and replay), Delete (admin / dev only). Hover-only on desktop, always-visible on mobile. Keep the action surface small or it becomes noise.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Regenerate</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Regenerate = replace the last assistant message with a new optimistic placeholder, send the same history again with a slightly higher temperature. Keep the prior generation in a per-message <code>versions[]</code> array so the user can swipe between them.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/chat-interface" className="text-sky-600 hover:underline">Module 21 — Full chat interface</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — State management */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. State management — the three kinds of state</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The #1 source of chat-UI bugs is conflating these. Server state and client state behave differently; treat them the same and you&apos;ll lose the composer text every time a token arrives.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Kind</th>
                <th className="px-4 py-3 font-semibold">Examples</th>
                <th className="px-4 py-3 font-semibold">Lives where</th>
                <th className="px-4 py-3 font-semibold">Outlives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Server state</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">In-flight stream, request id, abort controller, error from server</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Hook / store, never persisted</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Tab refresh? No.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Client (ephemeral)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Composer text, scroll position, &quot;sticky to bottom&quot; flag, expanded tool blocks</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Local <code>useState</code>, colocated</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Component unmount? No.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Persisted</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Conversation history, user prefs, model choice</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Server DB + local cache (optional)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Page reload? Yes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Decision rule:</strong> <em>colocate by default, lift only when needed.</em> The composer text should live in the composer component — never in a global store. The messages array, however, is consumed by the message list AND the send hook AND the &quot;new chat&quot; button, so lift it to a chat-scope store (Zustand, Context). Don&apos;t reach for Redux for one conversation&apos;s state.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/chat-interface" className="text-sky-600 hover:underline">Module 21 — Full chat interface</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Multimodal */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Multimodal inputs — images, files, the cost gotcha</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Image input changes everything about your payload, your cost model, and your client-side validation. Get the shape right once and it&apos;s easy; get it wrong and you&apos;ll be debugging 4xx&apos;s for a day.
        </p>

        <CodeBlock lang="ts" caption="Image payload shape — base64 inline vs URL reference">{`// Option A — inline base64 (works for small images, simple, no extra hop)
const inlineMessage = {
  role: "user",
  content: [
    { type: "text", text: "What's in this receipt?" },
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",   // jpeg | png | gif | webp
        data: "/9j/4AAQSkZJRgABA...", // base64 string, NO data: prefix
      },
    },
  ],
};

// Option B — URL reference (best for files >1MB or when you've already uploaded)
const urlMessage = {
  role: "user",
  content: [
    { type: "text", text: "Summarize this chart." },
    { type: "image", source: { type: "url", url: "https://cdn.app/charts/q3.png" } },
  ],
};`}</CodeBlock>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Inline base64 vs upload-first</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>Inline base64</strong> for &lt; ~1MB images — one request, no orphan files, simpler error paths.</li>
              <li><strong>Upload-first (URL)</strong> for larger files, multi-turn reuse, or any image you want to show again later.</li>
              <li>Inline payloads bloat by ~33% (base64 overhead). Watch your request size limits.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Client-side validation</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>MIME check by sniffing magic bytes — never trust the file extension or <code>File.type</code>.</li>
              <li>Hard cap dimensions (e.g. 8000×8000) and bytes (e.g. 20MB) <em>before</em> sending.</li>
              <li>Down-scale on the client (canvas → <code>toBlob</code>) when the model only needs ~1024px.</li>
              <li>Show a preview thumbnail + filename + size; let the user remove before send.</li>
            </ul>
          </div>
        </div>

        <Callout variant="warn">
          <strong>The cost-per-image gotcha:</strong> vision models charge by image as a (usually large) token count — often equivalent to ~1500 tokens for a single 1024px image. A multi-turn chat that re-sends the image on every turn pays for it every turn. Either send the image once and reference it by id on subsequent turns, or strip it from the history after the first response if the conversation no longer needs to look at it.
        </Callout>

        <CodeBlock lang="tsx" caption="Client-side downscale before send">{`async function downscale(file: File, maxDim = 1568): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}`}</CodeBlock>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/multimodal" className="text-sky-600 hover:underline">Module 22 — Multimodal inputs</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Gotchas — BAD/GOOD pairs */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Four gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost real engineers real hours. If you only remember four things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · <code>EventSource</code> for a chat POST</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              <code>EventSource</code> is GET-only and has no headers. The moment you need to POST a messages array or send a Bearer token, you&apos;re using the wrong tool. Switch to <code>fetch</code> + <code>ReadableStream</code>.
            </p>
            <CodeBlock lang="ts">{`// BAD — silently can't POST a body or set Authorization
const es = new EventSource("/api/chat?prompt=" + encodeURIComponent(prompt));
// (and you have to stuff the whole history into a URL? hard pass)

// GOOD — POST with body and headers, abort on unmount
const ac = new AbortController();
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
  body: JSON.stringify({ messages }),
  signal: ac.signal,
});`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · <code>setState</code> on every token</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              An LLM streams ~50–100 tokens/sec. <code>setState</code> on each one schedules a re-render per token; the message list rerenders 50+ times per second, the browser drops frames, the cursor stutters. Batch into a ref, flush on rAF.
            </p>
            <CodeBlock lang="tsx">{`// BAD — one rerender per token
for await (const t of stream) setText((s) => s + t);

// GOOD — one rerender per animation frame, regardless of token rate
const bufRef = useRef("");
const rafRef = useRef<number | null>(null);
const onToken = (t: string) => {
  bufRef.current += t;
  if (rafRef.current != null) return;
  rafRef.current = requestAnimationFrame(() => {
    setText((s) => s + bufRef.current);
    bufRef.current = "";
    rafRef.current = null;
  });
};`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Missing <code>AbortController</code> on unmount</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The user navigates away mid-stream. Your component unmounts. The fetch keeps pumping bytes. <code>setState</code> on an unmounted component logs a warning, but the real cost is the zombie socket on the server and the wasted tokens you&apos;re still being billed for.
            </p>
            <CodeBlock lang="tsx">{`// BAD — no way to cancel; stream outlives the component
useEffect(() => { streamChat(body, onToken); }, []);

// GOOD — one AbortController per turn, aborted in cleanup AND on user stop
useEffect(() => {
  const ac = new AbortController();
  streamChat(body, onToken, ac.signal).catch((e) => {
    if (e.name !== "AbortError") setError(e);
  });
  return () => ac.abort();
}, [body]);`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Markdown lib that throws on partial input</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Mid-stream, you&apos;ll routinely render strings like <code>```jav</code> or <code>**bold un</code>. A strict parser throws; your message vanishes and the error boundary catches a crash on every other token.
            </p>
            <CodeBlock lang="tsx">{`// BAD — strict parser, throws on unclosed fence
import { strictMarkdownToHtml } from "some-strict-md";
return <div dangerouslySetInnerHTML={{ __html: strictMarkdownToHtml(text) }} />;

// GOOD — tolerant parser, renders best-effort and recovers
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You're building a chat UI that needs to POST a messages array and an Authorization header. Which transport do you reach for?"
          options={[
            { label: "Native EventSource — it's purpose-built for SSE.", explanation: "EventSource is GET-only with no custom headers. You can't POST a body and you can't set Authorization. Wrong tool for chat." },
            { label: "fetch + ReadableStream — POST, headers, AbortController.", correct: true, explanation: "Right. fetch streaming is what you want for chat: full HTTP control, easy cancellation via AbortController, and you parse the SSE frames yourself in ~10 lines." },
            { label: "WebSockets — full-duplex is always better.", explanation: "Overkill and a different programming model. Chat is one-shot request → token stream → done; SSE-over-fetch is the right primitive." },
            { label: "Long-polling.", explanation: "You give up the streaming UX entirely. Long-polling means waiting for the full response per request, then resubscribing." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Why do you append an empty assistant message before the network call returns?"
          options={[
            { label: "It's required by the SSE spec.", explanation: "Nothing in SSE requires this. It's a UI pattern, not a protocol detail." },
            { label: "So the message list rerenders even when there's no data — gives the user instant feedback and a stable target to stream tokens into.", correct: true, explanation: "Right. Optimistic add → reconcile-on-token is the universal chat pattern. The composer clears immediately, the assistant message shows a streaming cursor, and tokens flow into the same message object as they arrive. No layout jump on first token." },
            { label: "To prevent React from unmounting the chat panel.", explanation: "Unrelated. React unmounts based on the component tree, not on message contents." },
            { label: "Because the backend can't accept the request until the placeholder exists.", explanation: "The backend doesn't know or care about your local state. This is a pure client-side UX choice." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A user has scrolled up to re-read an earlier message. The stream is still arriving. What should the chat panel do?"
          options={[
            { label: "Force-scroll to bottom on every token so they don't miss the new content.", explanation: "Hostile UX. Yanking the viewport mid-read is one of the top complaints about poorly-built chat apps." },
            { label: "Pause the stream until they scroll back down.", explanation: "Worse. The model keeps generating either way; you're just hiding tokens. Pausing breaks the streaming illusion." },
            { label: "Track a 'sticky to bottom' flag, only auto-scroll when the user is already near the bottom (within ~80px), and surface a 'Jump to latest' pill otherwise.", correct: true, explanation: "Right. Sticky-to-bottom is the standard pattern: detect user scroll, only follow when the user is following, give an affordance to catch up. Looks invisible when it works." },
            { label: "Render the new tokens above the current scroll position.", explanation: "Now you've broken the chronological reading order. Always append; just don't force-scroll." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You want to send an image plus a question to a vision model. The image is 3MB. What's the most production-sensible payload shape?"
          options={[
            { label: "Inline base64 of the original 3MB JPEG in the message content array.", explanation: "Works but wasteful. Base64 inflates by ~33% (so ~4MB on the wire), and the model doesn't need 3MB of detail — it samples down internally anyway." },
            { label: "Downscale client-side to ~1568px max dimension, encode as JPEG ~0.85 quality, then send as inline base64 (or upload-and-reference for reuse).", correct: true, explanation: "Right. Vision models don't gain accuracy past ~1024–1568px on the long edge. Downscaling on the client cuts bytes, cuts token cost, and cuts latency. Inline if single-turn; upload-and-reference if you'll re-send across turns." },
            { label: "Upload the raw 3MB file to your server first, then send a server file path string to the model.", explanation: "The model needs the bytes or a URL it can fetch — not your private file path. And you still haven't solved the size problem." },
            { label: "Send the image as a separate WebSocket frame after the text message.", explanation: "Not how the messages API works. Image and text are parts of a single content array on one message." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="The user clicks 'Stop' mid-stream. What's the cancellation chain that has to fire correctly?"
          options={[
            { label: "Just stop calling setState — the stream will eventually time out on its own.", explanation: "The fetch keeps running, the server keeps generating, and you keep getting billed. 'Stopped' in the UI is not 'stopped' on the wire." },
            { label: "AbortController.abort() on the fetch signal, which closes the ReadableStream, which lets the server-side subscription cancel, which stops further token generation — and your useEffect cleanup ALSO calls abort() so unmounts don't leak.", correct: true, explanation: "Right. One AbortController, two trigger points (user stop + unmount cleanup), one cascade that tears down the fetch → stream → server subscription → model call. AbortError gets swallowed; everything else surfaces as an error." },
            { label: "Set a 'stopped' boolean in state and ignore further tokens in the render path.", explanation: "Tokens stop appearing in the UI but the network and server keep running. You've hidden the symptom, not stopped the work." },
            { label: "Reload the page.", explanation: "Nuclear option that loses the entire conversation. Not a real answer." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-sky-200 dark:border-sky-900 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">
          Phase 4 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You&apos;re ready for Phase 5 when…</h3>
        <ul className="mb-4 text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
          <li>You can defend the choice between <code>EventSource</code> and <code>fetch</code> streaming in one sentence per side.</li>
          <li>You instinctively reach for a rAF-batched ref before you reach for <code>setState</code> in a token loop.</li>
          <li>The phrase &quot;optimistic add, reconcile on first token&quot; means something concrete to you, not a buzzword.</li>
          <li>You know which of server / client / persisted state each piece of your chat panel belongs in — and you don&apos;t lift things to a store by default.</li>
          <li>You can explain the cost-per-image gotcha, and you&apos;ve seen the client-side downscale snippet at least once.</li>
          <li>You always wire an <code>AbortController</code> with cleanup, no exceptions.</li>
        </ul>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 5 — Agents &amp; Advanced Patterns.</strong> The ReAct loop, multi-turn tool use, when an agent is the right call and when it&apos;s wildly overkill, multi-agent orchestration patterns.
        </p>
        <Link
          href="/courses/ai/modules/agents-intro"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Agents &amp; Advanced Patterns →
        </Link>
      </section>
    </article>
  );
}
