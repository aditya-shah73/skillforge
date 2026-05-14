import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "transport", title: "Connection + reconnect", xp: 20 },
  { id: "ordering", title: "Ordering + idempotency", xp: 20 },
  { id: "presence", title: "Presence + multi-tab", xp: 25 },
  { id: "complete", title: "Offline + UI patterns", xp: 25 },
];

export default function Page() {
  const mod = getModuleBySlug("frontend-design-realtime")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="frontend-design-realtime" />
        <ModuleProgress moduleSlug="frontend-design-realtime" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h3 className="font-bold text-lg m-0">What you{`'`}ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A defensible answer to {`"`}design a real-time UI{`"`} — chat, collab doc, or anywhere a server pushes to the browser. The connection layer is the heart, but the parts that separate a senior answer from a mid-level one are reconnect logic, multi-tab sync, and what happens when the user{`'`}s phone falls off the network mid-message.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Transport choice with real numbers: WebSocket vs SSE vs long polling</li>
          <li>Reconnect with exponential backoff + jitter, heartbeats, and resync-from-sequence</li>
          <li>Optimistic send + idempotency keys on the client side of the chat module</li>
          <li>Presence and typing — why they{`'`}re a 10-100x message multiplier and how to throttle</li>
          <li>Multi-tab sync via BroadcastChannel + leader-tab election</li>
          <li>CRDT intuition for collaborative docs (when to reach for Yjs, when not to)</li>
          <li>Offline edit handling with an IndexedDB outbox and a bounded retry queue</li>
        </ul>
      </section>

      <section>
        <h2>Why this prompt is a frontend senior filter</h2>
        <p>
          {`"`}Design a real-time UI{`"`} is the frontend cousin of the backend chat interview. The interviewer wants to see whether you understand server-push as a primitive — that it{`'`}s not just {`"`}a websocket{`"`}, it{`'`}s a connection lifecycle, a reconnect strategy, an ordering contract, and a UI that has to behave correctly when any of those break. The naive answer is {`"`}open a websocket and append messages on receive,{`"`} and it falls over the moment the user opens a second tab, the network blips, or the server restarts.
        </p>
        <p>
          The senior tells: do you reach for sequence numbers and resync instinctively? Do you know that exponential backoff without jitter is how you DDoS your own server after a deploy? Do you recognize that presence is a 10-100x multiplier on your message volume and throttle it? Can you talk about CRDTs without pretending you{`'`}d implement one? Those are the moves.
        </p>
        <p>
          We{`'`}ll do this as a worked example: <strong>collaborative chat with multi-tab sync</strong>. It covers the chat archetype, lets us touch the collab-doc concerns (CRDTs, offline edits), and forces multi-tab sync as a first-class problem because real chat apps live in three open tabs at once.
        </p>
      </section>

      <Checkpoint moduleSlug="frontend-design-realtime" id="transport" title="Part 1 · Scope + transport + reconnect" xp={20}>
        <h2>Pin the prompt before you draw a single box</h2>
        <p>
          When the interviewer says {`"`}design a real-time UI for chat{`"`} — or {`"`}for a collaborative doc{`"`} — the first move is the same: clarify what {`"`}real-time{`"`} means here. The two archetypes share a transport but diverge sharply on conflict resolution.
        </p>

        <h3>The two archetypes</h3>
        <ul>
          <li><strong>Chat:</strong>{" "}ordered messages, presence, typing indicators, read receipts, group chat. The server is the single source of truth for ordering — clients just render a timeline.</li>
          <li><strong>Collaborative doc:</strong>{" "}simultaneous edits to shared state, conflict resolution (CRDT or OT), presence cursors, offline edits that have to merge cleanly when reconnecting.</li>
        </ul>

        <p>
          For this walkthrough we{`'`}ll do <strong>collaborative chat with multi-tab sync</strong>. It{`'`}s the right scope because it covers everything in the chat archetype and forces us to confront the parts of the collab-doc archetype that show up in chat too — offline edits (queued sends), multi-device sync (multiple tabs), and the {`"`}did my message arrive?{`"`} question.
        </p>

        <h3>Locked scope for the worked example</h3>
        <ul>
          <li>1:1 chat plus small group chat (capped at ~50 members).</li>
          <li>Presence (online/offline/last-seen) and typing indicators.</li>
          <li>Multi-tab sync — Slack-style, three tabs share one connection.</li>
          <li>Mobile foreground only. No background sync, no push notifications. {`(`}{`"`}When the app is backgrounded, the OS will close our socket and we{`'`}ll reconnect on resume — we{`'`}re scoping out push.{`"`}{`)`}</li>
          <li>Out of scope: end-to-end encryption, voice/video, file uploads beyond a URL reference.</li>
        </ul>

        <Callout variant="info" title="Say the scope cuts out loud">
          <p className="m-0">Interviewers don{`'`}t penalize you for cutting scope; they penalize you for not noticing it needed cutting. {`"`}I{`'`}m going to scope out background push and E2EE for this round{`"`} is a senior move. {`"`}I{`'`}ll handle everything{`"`} is a junior move that ends with you stuck in OAuth callback flows at minute 35.</p>
        </Callout>

        <h2>Transport: WebSocket vs SSE vs long polling</h2>
        <p>
          Three options. In 2026 you{`'`}ll pick WebSocket nine times out of ten, but you should be able to defend that choice with numbers.
        </p>

        <h3>WebSocket — the default for chat</h3>
        <ul>
          <li><strong>Bidirectional</strong>{" "}over a single TCP connection (after an HTTP upgrade handshake).</li>
          <li><strong>Low per-message overhead</strong> — frames are 2-14 bytes of header on top of payload.</li>
          <li><strong>Persistent</strong> — one connection per device, held open as long as the tab/app is alive.</li>
          <li><strong>Latency:</strong>{" "}handshake is ~200ms (TLS + HTTP upgrade). After that, message delivery is bounded by network RTT — usually 30-80ms in good conditions.</li>
        </ul>

        <h3>SSE (Server-Sent Events) — when you only need server → client</h3>
        <ul>
          <li><strong>One direction:</strong>{" "}server pushes to client over a long-lived HTTP response. Client sends via separate HTTP requests.</li>
          <li><strong>Runs over HTTP/2 or HTTP/3,</strong>{" "}so it multiplexes with your other traffic — no separate connection.</li>
          <li><strong>Auto-reconnect built in</strong> — the EventSource API handles reconnects natively, with a Last-Event-ID header for resume.</li>
          <li><strong>Use when:</strong>{" "}notifications feed, stock tickers, build logs, anything where the client mostly listens.</li>
        </ul>

        <h3>Long polling — the legacy fallback</h3>
        <ul>
          <li>Client sends a request; server holds it open until data arrives or a timeout fires; client immediately sends another request.</li>
          <li><strong>Use when:</strong>{" "}a corporate proxy strips websockets, or you{`'`}re supporting a 2012-era browser. In 2026, almost never new.</li>
          <li>Latency floor is the round-trip plus poll interval. Cost on the server is high — you hold open a request handler per connected user.</li>
        </ul>

        <h3>Decision matrix</h3>
        <CodeBlock lang="plain" caption="Pick your transport">{`Need both directions? Real-time chat-like UX?       → WebSocket
Server → client only, low complexity tolerated?     → SSE
Need to support legacy proxies that strip WS?       → Long polling fallback (rare)
Need to fan out the same payload to many tabs?      → WS + BroadcastChannel (we'll get there)`}</CodeBlock>

        <p>
          For our chat: WebSocket. We need to send (messages, typing) and receive (messages, presence, typing, read receipts), and we want sub-100ms latency once connected.
        </p>

        <Callout variant="insight" title="The handshake is the cost, not the messages">
          <p className="m-0">A WebSocket handshake is ~200ms because it{`'`}s a full HTTP upgrade plus TLS. After that, frames are nearly free — &lt;1ms of overhead per message on the wire. This is why chat UIs feel snappy once {`"`}connected{`"`} and feel laggy on cold start. Optimization usually means hiding the handshake (open the WS during the splash screen, not on first send), not making messages faster.</p>
        </Callout>

        <h2>Reconnect — the production reality</h2>
        <p>
          Connections die. Constantly. The list of reasons is longer than candidates expect:
        </p>
        <ul>
          <li><strong>NAT timeouts:</strong>{" "}home routers drop idle TCP connections after 5-10 minutes of silence.</li>
          <li><strong>Mobile network changes:</strong>{" "}WiFi → LTE handoff, walking out of coffee shop range.</li>
          <li><strong>Sleep / wake:</strong>{" "}laptop closes lid, phone screen-off — the OS may suspend the socket.</li>
          <li><strong>Server restarts:</strong>{" "}rolling deploys, autoscale events, kernel panics.</li>
          <li><strong>Load balancer connection draining:</strong>{" "}healthy gateway pod is being rotated out; your socket gets a clean close.</li>
          <li><strong>Auth expiry:</strong>{" "}token TTL elapses; server closes with a 4401-class code.</li>
        </ul>

        <p>
          A real chat client reconnects 5-50 times per session, and most users never notice. The reason they don{`'`}t notice is exponential backoff with jitter, heartbeats to detect dead-but-not-closed sockets, and resync-from-sequence to fill the gap.
        </p>

        <h3>Exponential backoff with jitter</h3>
        <p>
          The backoff schedule is non-negotiable: 1s, 2s, 4s, 8s, capped at 30s, with ±20% jitter on every attempt. The cap prevents users from waiting forever after long outages. The jitter prevents the <strong>thundering herd</strong>: when a gateway restarts and 100k clients all reconnect, you don{`'`}t want them all hitting the new pod at exactly t+1s, t+2s, t+4s. Jitter spreads them.
        </p>

        <CodeBlock lang="ts" caption="Reconnect logic — exponential backoff with jitter">{`type WSState = "connecting" | "open" | "closing" | "closed";

class ReconnectingSocket {
  private ws: WebSocket | null = null;
  private state: WSState = "closed";
  private attempt = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastSeq = 0;

  constructor(private url: string, private getToken: () => Promise<string>) {}

  async connect() {
    this.state = "connecting";
    const token = await this.getToken();
    const ws = new WebSocket(\`\${this.url}?token=\${token}&since=\${this.lastSeq}\`);

    ws.addEventListener("open", () => {
      this.state = "open";
      this.attempt = 0; // reset backoff on success
      this.startHeartbeat();
    });

    ws.addEventListener("message", (e) => this.onMessage(e));

    ws.addEventListener("close", (e) => {
      this.stopHeartbeat();
      this.state = "closed";
      if (e.code === 4401) { return this.refreshTokenAndReconnect(); }
      this.scheduleReconnect();
    });

    this.ws = ws;
  }

  private scheduleReconnect() {
    const base = Math.min(1000 * 2 ** this.attempt, 30_000);
    const jitter = base * (0.8 + Math.random() * 0.4); // ±20%
    this.attempt += 1;
    setTimeout(() => this.connect(), jitter);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
}`}</CodeBlock>

        <h3>Heartbeats — detecting dead sockets</h3>
        <p>
          TCP doesn{`'`}t tell you a connection is dead until you try to write to it and the write fails (or the OS retransmit timer gives up — minutes later). For a chat app, that{`'`}s far too slow. Send a small <code>ping</code> frame every 30s; if the server doesn{`'`}t <code>pong</code> back within 10s, treat the socket as dead and reconnect. This catches the {`"`}phone went into a tunnel and the carrier silently dropped the connection{`"`} case.
        </p>

        <Callout variant="warn" title="Don't reconnect immediately on close">
          <p className="m-0">If your server crashes and 100k clients all reconnect at t+0, you{`'`}ll DDoS the new pod the moment it boots. The minimum first delay should be ~1s with jitter — small enough to feel instant to a single user, big enough that 100k clients arrive over a 1.6s window instead of in one millisecond.</p>
        </Callout>

        <Quiz
          question="A candidate proposes 'reconnect immediately on close, with no backoff — users want their chat back fast.' What's the strongest objection?"
          options={[
            { label: "It works for one user but breaks at scale: when a gateway pod is rotated out and 100k clients close at once, they all reconnect within milliseconds and DDoS the next pod. Exponential backoff with jitter spreads the herd over a window. Users don't notice ~1s; they do notice a 30-second outage caused by a self-DDoS.", correct: true, explanation: "Right. The thundering herd is the failure mode that kills naive reconnect. Senior candidates name it explicitly. Backoff isn't about being polite to the server — it's about not making outages worse." },
            { label: "Browsers rate-limit reconnects automatically.", explanation: "They don't, in any meaningful way. The browser will happily open WebSockets as fast as your code asks. Backoff is a client-side responsibility." },
            { label: "TCP slow-start makes reconnects expensive.", explanation: "TCP slow-start exists but isn't the issue at the chat-reconnect timescale. The issue is the herd hitting the server simultaneously." },
            { label: "WebSockets aren't designed to be reopened.", explanation: "They absolutely are — every chat app reopens them constantly. The question is how, not whether." },
          ]}
          hint="What goes wrong when a server restart causes 100k clients to all reconnect at the same instant?"
          xp={7}
        />

        <h3>The reconnect lifecycle on the UI</h3>
        <p>
          Reconnect isn{`'`}t silent — the user needs feedback, but only if it lasts long enough to matter. The standard pattern:
        </p>
        <ul>
          <li><strong>0-2s after close:</strong>{" "}show nothing. Most reconnects complete in this window; flashing a banner makes the UI feel jittery.</li>
          <li><strong>2-10s:</strong>{" "}show a subtle {`"`}reconnecting…{`"`} indicator in the chat header. Inputs stay enabled — pending sends queue to the outbox.</li>
          <li><strong>10s+:</strong>{" "}show a more prominent banner: {`"`}You{`'`}re offline. Messages will send when you{`'`}re back.{`"`} Disable typing indicators (no point sending typing events that won{`'`}t arrive).</li>
          <li><strong>On reconnect:</strong>{" "}brief {`"`}back online{`"`} flash, then resync runs invisibly in the background. Don{`'`}t block the UI on resync — show old messages while the gap fills, then merge.</li>
        </ul>

        <p>
          The cardinal sin here is showing a modal that blocks input on every reconnect. WebSocket connections drop frequently enough that a modal-based UX becomes user-hostile within minutes. Inline, non-blocking, and transient is the right shape.
        </p>

        <Quiz
          question="Why send a heartbeat ping every 30s when TCP already detects dead connections?"
          options={[
            { label: "TCP only detects a dead connection when it tries to write and the OS retransmit timer gives up — which can be minutes. For chat UX, that's too slow. App-level pings detect dead sockets within ~30-40s, fast enough that 'reconnecting…' shows up before users notice they're sending into a void.", correct: true, explanation: "Right. The TCP detection timeline is far too long for human-facing UX. App-level heartbeats are the only way to detect 'silently dropped' connections — common on mobile and behind NATs." },
            { label: "It keeps the server's load balancer from killing the connection as idle.", explanation: "That's a real secondary benefit (LBs do drop idle connections), but the primary reason is detection: knowing the connection is dead so you can reconnect, not just keeping it warm." },
            { label: "WebSockets require pings to stay open.", explanation: "The protocol allows pings but doesn't require them. Browsers and servers don't auto-close idle WebSockets without explicit configuration." },
            { label: "It updates the user's last-seen presence.", explanation: "Presence might piggyback on heartbeats, but the structural reason for the heartbeat itself is dead-connection detection." },
          ]}
          hint="How long does TCP take to notice a dropped connection on its own?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Pick WebSocket for chat. Reconnect with exponential backoff + jitter, capped at 30s. App-level heartbeats every 30s catch dead connections far faster than TCP will."
          points={[
            { takeaway: "Scope ruthlessly", detail: "Lock 1:1 + small group, presence, typing, multi-tab. Cut E2EE, background push, voice/video unless asked. Saying it out loud is the senior move." },
            { takeaway: "WebSocket is the default for chat", detail: "Bidirectional, ~200ms handshake then near-zero per-message cost. SSE is for one-way feeds; long polling is a legacy fallback you almost never reach for new in 2026." },
            { takeaway: "Reconnect is non-optional", detail: "Real chat clients reconnect 5-50 times per session. Exponential backoff with ±20% jitter, capped at 30s, prevents thundering-herd self-DDoS during deploys." },
            { takeaway: "Heartbeats every 30s", detail: "TCP takes minutes to notice a dead connection. App-level ping/pong is the only way to detect silently dropped sockets fast enough for human UX." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-design-realtime" id="ordering" title="Part 2 · Ordering, idempotency, optimistic send" xp={20}>
        <h2>Ordering on the client side of a chat</h2>
        <p>
          Backend chat designs partition by conversation and stamp messages with a TIMEUUID. From the server{`'`}s perspective, ordering is solved. From the client{`'`}s perspective, it absolutely is not — and the bugs that show up here are the ones interviewers love to probe.
        </p>

        <h3>The ordering contract you actually get over WebSocket</h3>
        <p>
          Over a single open WebSocket connection, message order is preserved — the protocol guarantees in-order delivery on the wire, since it runs over TCP. <strong>But the moment you reconnect, that guarantee gaps.</strong>{" "}Between {`"`}connection drops at t=10s{`"`} and {`"`}reconnect succeeds at t=14s,{`"`} four seconds of messages were sent to your old socket and never reached you. If the server doesn{`'`}t replay them, you{`'`}ve got a hole in your timeline.
        </p>

        <h3>Sequence numbers + resync</h3>
        <p>
          The fix is server-stamped sequence numbers per channel (or per conversation). Every message the server sends carries a monotonically increasing <code>seq</code>. The client tracks the last <code>seq</code> it has seen. On reconnect, the client opens the socket with <code>?since=42</code> in the URL, and the server replays everything with <code>seq &gt; 42</code> before resuming live delivery.
        </p>

        <CodeBlock lang="ts" caption="Sequence tracking + resync on reconnect">{`type ServerMessage = {
  seq: number;            // monotonic per channel
  conversationId: string;
  msgId: string;          // server-assigned UUID
  clientMsgId?: string;   // echoed back if the message originated from this client
  senderId: string;
  body: string;
  ts: number;
};

class MessageStream {
  private lastSeq = 0;
  private buffer = new Map<string, ServerMessage>();

  onMessage(msg: ServerMessage) {
    // Drop duplicates: server may replay seqs we've already seen on reconnect
    if (msg.seq <= this.lastSeq) return;

    // Detect gaps: if seq jumps, we missed something — request resync
    if (msg.seq > this.lastSeq + 1) {
      this.requestResync(this.lastSeq);
      this.buffer.set(msg.msgId, msg); // hold until we get the gap-fill
      return;
    }

    this.lastSeq = msg.seq;
    this.deliver(msg);
    this.drainBuffer();
  }

  private drainBuffer() {
    // After resync fills the gap, deliver any buffered messages in order
    const sorted = [...this.buffer.values()].sort((a, b) => a.seq - b.seq);
    for (const msg of sorted) {
      if (msg.seq === this.lastSeq + 1) {
        this.lastSeq = msg.seq;
        this.deliver(msg);
        this.buffer.delete(msg.msgId);
      }
    }
  }
}`}</CodeBlock>

        <Callout variant="info" title="Per-channel, not global, sequence numbers">
          <p className="m-0">A global sequence is tempting — {`"`}every message in the system has a unique increasing number{`"`} — but it forces every send through a single coordinator. Per-channel (per-conversation) sequencing is what production systems do: ordering is local to the conversation, and the {`"`}skipped a number{`"`} detection still works.</p>
        </Callout>

        <h2>Optimistic send + the {`"`}did my message arrive?{`"`} problem</h2>
        <p>
          Users expect their own message to appear instantly when they hit send. Waiting 100ms for the server ACK is enough to feel sluggish. So we render the message immediately with a <code>pending</code> state, then transition to <code>sent</code> when the ACK arrives — or to <code>failed</code> if it never does.
        </p>

        <CodeBlock lang="tsx" caption="Optimistic message state machine">{`type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

type OutgoingMessage = {
  clientMsgId: string;    // UUID generated client-side
  msgId?: string;         // assigned by server on ACK
  body: string;
  status: MessageStatus;
  attempts: number;
  ts: number;
};

function sendMessage(body: string) {
  const msg: OutgoingMessage = {
    clientMsgId: crypto.randomUUID(),
    body,
    status: "pending",
    attempts: 0,
    ts: Date.now(),
  };
  store.append(msg);                       // render immediately as pending
  ws.send({ type: "send", clientMsgId: msg.clientMsgId, body });

  // Time out after 10s if no ACK
  setTimeout(() => {
    if (store.find(msg.clientMsgId)?.status === "pending") {
      store.update(msg.clientMsgId, { status: "failed" });
    }
  }, 10_000);
}

function onAck(ack: { clientMsgId: string; msgId: string; seq: number }) {
  store.update(ack.clientMsgId, {
    msgId: ack.msgId,
    status: "sent",
  });
}`}</CodeBlock>

        <h3>The double-send problem</h3>
        <p>
          User hits send, the message goes out, the network blips before the ACK comes back. Did the server receive it or not? The user — or your retry logic — may try again. Without idempotency, the recipient sees the message twice.
        </p>

        <p>
          The fix is the same pattern as the backend chat module: <strong>client-generated message IDs</strong>. Every send carries a <code>clientMsgId</code> (a UUID). The server uses a small Redis cache (5-minute TTL) keyed on <code>{`{userId}:{clientMsgId}`}</code>. If it sees a duplicate, it returns the original <code>msgId</code> instead of inserting again. The client can retry safely.
        </p>

        <Callout variant="spring" title="This is the same pattern as the backend module — for a reason">
          <p className="m-0">In the backend chat module, idempotency keys protect the message log from duplicate inserts. Here on the client, they{`'`}re what makes optimistic send safely retryable. Same UUID, same dedup logic, opposite ends of the wire. When the interviewer asks {`"`}what if the network drops mid-send,{`"`} {`"`}clientMsgId, server-side dedup, retry safely{`"`} is the exact answer.</p>
        </Callout>

        <h3>The retry policy</h3>
        <ul>
          <li>If the WS is closed, queue the message in the outbox (we{`'`}ll get to that in Part 8). Don{`'`}t retry while disconnected — there{`'`}s nowhere to send to.</li>
          <li>If the WS is open and the ACK doesn{`'`}t arrive in 10s, mark the message <code>failed</code> and show a retry affordance to the user. Don{`'`}t auto-retry forever — that{`'`}s how you ship 47 copies of {`"`}sorry, my finger slipped.{`"`}</li>
          <li>If the user taps retry, send the same <code>clientMsgId</code>. The server will dedup if the original eventually went through.</li>
        </ul>

        <Quiz
          question="A candidate's first design has every outgoing message use a server-assigned ID, with the client waiting for the ACK to render. What breaks?"
          options={[
            { label: "Latency: the message doesn't appear in the UI until the server ACKs, which is 50-200ms minimum. Users perceive that as laggy. Optimistic send with a client-generated UUID renders instantly and reconciles on ACK — the same UX as iMessage and Slack.", correct: true, explanation: "Right. Optimistic send is what makes chat feel snappy. The client UUID is what makes it safe to retry without dupes. Both halves are needed; together they're the production pattern." },
            { label: "Server-assigned IDs collide with database primary keys.", explanation: "They don't — server-side ID generation (snowflake, UUIDv7, etc.) is exactly designed not to collide. The issue is UX, not correctness." },
            { label: "It violates idempotency.", explanation: "Server-assigned IDs are fine for idempotency on the server side. The issue is that without a client-generated ID, the client can't safely retry, because retries would create duplicates." },
            { label: "The client can't show the message in the UI without an ID.", explanation: "It can — temporary client-side IDs work fine. The structural problem is waiting for the round-trip before rendering." },
          ]}
          hint="When does the message appear in the UI in each design?"
          xp={7}
        />

        <Quiz
          question="On reconnect, your client opens the socket with ?since=42 and the server starts replaying messages with seq=43, 44, 45. What happens if the next live message arrives with seq=49?"
          options={[
            { label: "Detect the gap (47 and 48 are missing), buffer seq=49, and request another resync from seq=45. Deliver buffered messages in order once the gap is filled. Don't deliver out-of-order — users will see messages appear, then earlier messages slot in above them.", correct: true, explanation: "Right. Gap detection has to keep working even after the initial resync; the live stream and the replay can race. Buffer + re-request is the correct pattern." },
            { label: "Deliver seq=49 immediately — the client should trust whatever order the server sends.", explanation: "That produces a visible bug: the user sees a message, then suddenly two earlier messages appear above it. The whole point of seq numbers is to detect and fix this." },
            { label: "Drop seq=49 because it's out of order.", explanation: "Dropping it loses data. Buffer it until the gap is filled, then deliver in order." },
            { label: "Disconnect and reconnect with ?since=42 again.", explanation: "Heavy-handed — you'd re-receive 43, 44, 45 too. Just request the gap from where you actually are." },
          ]}
          hint="How do you keep the timeline ordered when replay and live races?"
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="WebSocket gives in-order delivery per connection, not across reconnects. Sequence numbers + resync fill the gap. Optimistic send with client-generated UUIDs makes the UI feel instant and lets retries dedup safely."
          points={[
            { takeaway: "Per-channel sequence numbers", detail: "Server stamps every message with a monotonic seq. Client tracks lastSeq and reconnects with ?since=N to replay the gap." },
            { takeaway: "Detect and buffer on gaps", detail: "If seq jumps, hold the new message and request a resync. Don't deliver out-of-order — users see messages reflow and it looks broken." },
            { takeaway: "Optimistic send is the UX", detail: "Render with status=pending immediately; transition to sent on ACK, failed on timeout. Don't make users wait for the round-trip." },
            { takeaway: "clientMsgId is the idempotency contract", detail: "Same UUID on retry, server dedups via Redis SETNX with 5-min TTL. Mirrors the backend chat module — same pattern, opposite end of the wire." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-design-realtime" id="presence" title="Part 3 · Presence, typing, multi-tab sync" xp={25}>
        <h2>Presence is harder than it looks</h2>
        <p>
          {`"`}Show me which of my friends are online{`"`} sounds simple. It is not. Presence has to handle: heartbeats from many devices per user, TTL-based expiry, cross-device aggregation, multi-tab dedup, and a typing-indicator stream that can multiply your message volume by 10-100x if you implement it naively.
        </p>

        <h3>The presence model</h3>
        <ul>
          <li><strong>Heartbeat per session.</strong>{" "}Each connected client (one per tab × per device) sends a heartbeat every 30s — usually piggybacking on the same ping that detects dead sockets.</li>
          <li><strong>Server tracks last-seen.</strong>{" "}A Redis hash per user, with an entry per session and a TTL. {`"`}Online{`"`} means {`"`}has at least one session whose TTL has not expired.{`"`}</li>
          <li><strong>Offline after N seconds.</strong>{" "}TTL is typically 90s — three missed heartbeats and you{`'`}re counted as offline. Shorter TTLs make presence flicker on flaky networks; longer TTLs make {`"`}offline{`"`} status stale.</li>
        </ul>

        <h3>Multi-device aggregation</h3>
        <p>
          A user with the app open on phone, laptop, and a tablet has three sessions. If <em>any</em>{" "}session is alive, the user is online. The aggregation happens server-side — clients just receive a single boolean per friend, not per-device states.
        </p>

        <h3>Multi-tab inside one browser</h3>
        <p>
          Same principle, one level lower: three tabs of Slack open in one browser is three sessions sharing a logged-in user. We{`'`}ll handle this differently — with a single shared connection — in the multi-tab section below.
        </p>

        <h2>Typing indicators — the message multiplier</h2>
        <p>
          The naive implementation is: every keystroke fires a <code>typing</code> event over the WebSocket. In a 10-person group chat where 3 people are typing at 80 WPM, that{`'`}s ~16 events/second from typing alone, fanned out to 10 recipients = 160 delivery events/second. From three users. The actual chat messages are dwarfed.
        </p>

        <p>
          The fix is throttling at three levels:
        </p>
        <ul>
          <li><strong>Client throttle:</strong>{" "}max one <code>typing</code> event per second, regardless of keystroke rate.</li>
          <li><strong>Server fan-out throttle:</strong>{" "}server merges {`"`}typing{`"`} events per (user, conversation) — only forwards once per second per user.</li>
          <li><strong>Client display:</strong>{" "}when typing arrives, show {`"`}Alice is typing…{`"`} for 5 seconds, reset on each new event. Drop the indicator after 5s of silence.</li>
        </ul>

        <CodeBlock lang="ts" caption="Throttled typing emit">{`class TypingEmitter {
  private lastSent = 0;
  private interval = 1000;

  onKeystroke(conversationId: string) {
    const now = Date.now();
    if (now - this.lastSent < this.interval) return;
    this.lastSent = now;
    ws.send({ type: "typing", conversationId, ts: now });
  }
}

class TypingDisplay {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  onTypingEvent(userId: string, conversationId: string) {
    const key = \`\${conversationId}:\${userId}\`;
    if (this.timers.has(key)) clearTimeout(this.timers.get(key)!);
    store.setTyping(conversationId, userId, true);
    const t = setTimeout(() => store.setTyping(conversationId, userId, false), 5000);
    this.timers.set(key, t);
  }
}`}</CodeBlock>

        <Callout variant="warn" title="Presence + typing can dwarf your actual messages">
          <p className="m-0">At scale, naive presence and typing implementations generate 10-100x more events than real messages. Throttle aggressively at every layer. {`"`}Why is our message bus saturated at 11am Monday{`"`} is almost always {`"`}because we{`'`}re fanning out keystrokes.{`"`}</p>
        </Callout>

        <h3>Presence at scale — the cost of {`"`}who{`'`}s online{`"`}</h3>
        <p>
          With 50M DAU and the typical user having 50 friends, a naive {`"`}push presence change to every friend{`"`} costs 50 writes per online/offline transition. With users connecting and disconnecting all day (mobile, sleep/wake, network changes), you can easily generate 5-10 transitions per user per day. That{`'`}s 250M-500M presence pushes per day from presence alone — completely separate from messages.
        </p>
        <ul>
          <li><strong>Push only material changes.</strong>{" "}User opens a second tab? They were already online; don{`'`}t emit a presence change. Only emit on online → offline and offline → online transitions.</li>
          <li><strong>Coalesce flapping.</strong>{" "}Mobile users flap online/offline as the network blips. Wait 60s after going offline before pushing the change — most blips resolve in that window. Going online is instant; going offline can wait.</li>
          <li><strong>Push to active relationships only.</strong>{" "}If Alice has 500 contacts but only 8 are in conversations she{`'`}s touched in the past week, only push her presence to those 8. {`"`}Active{`"`} is a product call but it cuts presence fanout dramatically.</li>
        </ul>

        <h3>De-duping typing across tabs</h3>
        <p>
          If Alice has Slack open in two tabs and types in tab 1, the server should only emit one {`"`}Alice is typing{`"`} event to recipients — not two. The server dedupes by user, not by session. {`"`}Alice has at least one session sending typing in this conversation{`"`} is what gets fanned out.
        </p>

        <h2>Multi-tab sync — the frontend-specific problem</h2>
        <p>
          A real Slack user has the app open in three tabs. Tab A sends a message; tabs B and C should display it instantly without each holding their own WebSocket. The naive {`"`}every tab opens its own WS{`"`} works but burns connections, drains battery, and triples your gateway load.
        </p>

        <p>
          Three production approaches, in increasing order of complexity:
        </p>

        <h3>Option 1: BroadcastChannel API</h3>
        <p>
          Modern browsers have <code>BroadcastChannel</code>: a same-origin pubsub primitive. Any tab can post a message and every other tab on the same origin receives it. Combine with leader-tab election: one tab opens the WebSocket, receives messages, and rebroadcasts to other tabs via the channel.
        </p>

        <CodeBlock lang="ts" caption="BroadcastChannel-based fan-out across tabs">{`type TabMessage =
  | { type: "leader-claim"; tabId: string; ts: number }
  | { type: "leader-heartbeat"; tabId: string; ts: number }
  | { type: "ws-frame"; payload: ServerMessage }
  | { type: "ws-send"; payload: OutgoingMessage };

const channel = new BroadcastChannel("chat-sync");
const tabId = crypto.randomUUID();
let isLeader = false;
let leaderId: string | null = null;
let leaderLastSeen = 0;

// Try to claim leadership: send a claim, wait 200ms, if no other tab claims, we're leader
async function tryClaim() {
  channel.postMessage({ type: "leader-claim", tabId, ts: Date.now() });
  await new Promise((r) => setTimeout(r, 200));
  if (!leaderId || leaderId === tabId) {
    isLeader = true;
    leaderId = tabId;
    openWebSocket();
    setInterval(() => {
      channel.postMessage({ type: "leader-heartbeat", tabId, ts: Date.now() });
    }, 2000);
  }
}

channel.onmessage = (e) => {
  const msg: TabMessage = e.data;
  if (msg.type === "leader-claim" && msg.tabId !== tabId) {
    // Lower tabId wins ties — bully election
    if (!leaderId || msg.tabId < tabId) leaderId = msg.tabId;
  } else if (msg.type === "leader-heartbeat") {
    leaderId = msg.tabId;
    leaderLastSeen = msg.ts;
  } else if (msg.type === "ws-frame" && !isLeader) {
    // Follower: receive frames from leader, render in local store
    store.applyServerMessage(msg.payload);
  } else if (msg.type === "ws-send" && isLeader) {
    // Follower asked to send; leader does it
    ws.send(msg.payload);
  }
};

// Detect leader death: no heartbeat in 5s → re-elect
setInterval(() => {
  if (!isLeader && leaderLastSeen && Date.now() - leaderLastSeen > 5000) {
    leaderId = null;
    tryClaim();
  }
}, 1000);

tryClaim();`}</CodeBlock>

        <h3>Option 2: SharedWorker</h3>
        <p>
          A SharedWorker runs once per origin, regardless of how many tabs are open. All tabs connect to it as a port; the worker holds the WebSocket and fans out messages to all connected tabs. It{`'`}s the {`"`}real{`"`} solution at scale, but it{`'`}s heavier — more code, more lifecycle complexity, no support in some old mobile browsers. Slack famously used SharedWorker for years before partially migrating to BroadcastChannel.
        </p>

        <h3>Option 3: localStorage events (legacy)</h3>
        <p>
          Older browsers fire a <code>storage</code> event when localStorage changes — and that event fires in <em>other</em>{" "}tabs of the same origin, not the one that wrote it. You can use this as a poor-man{`'`}s pubsub: write to a key, every other tab gets the event. It works in browsers as old as IE8. Don{`'`}t use it new in 2026 unless you have an unusual browser-support matrix.
        </p>

        <h3>Decision</h3>
        <ul>
          <li><strong>BroadcastChannel + leader election</strong>{" "}for most modern apps. Simple, well-supported, no extra processes.</li>
          <li><strong>SharedWorker</strong>{" "}when you need the WS to outlive any specific tab being open in the foreground (less relevant since browsers freeze backgrounded tabs aggressively now anyway).</li>
          <li><strong>localStorage events</strong>{" "}only as a fallback for ancient browsers.</li>
        </ul>

        <Callout variant="insight" title="Leader election is the part that always has bugs">
          <p className="m-0">The single hardest piece of multi-tab sync is leader election: handling tab close, tab freeze, tab in another window backgrounded by the OS. Use a heartbeat with a generous timeout (5s) and a deterministic tie-breaker (lowest tabId wins). Test by closing the leader tab while messages are in-flight; the next election should be silent and the user should not lose their message.</p>
        </Callout>

        <Quiz
          question="A candidate proposes 'every tab opens its own WebSocket — it's simpler.' What's the strongest objection at Slack scale?"
          options={[
            { label: "Connection cost: gateway capacity is bounded by concurrent connections, and a typical user has 2-3 tabs open. Per-tab connections triple the gateway count for the same user count, drain mobile battery, and can hit per-IP connection limits at corporate proxies. BroadcastChannel + leader election folds N tabs onto 1 socket.", correct: true, explanation: "Right. Connection count is the dominant cost in chat backends — one of the headline numbers in the chat system design module. Multiplying it by tab count for no UX benefit is wasteful." },
            { label: "Browsers limit you to 6 WebSockets per origin.", explanation: "That limit applies to HTTP/1.1 connections, not WebSockets in modern browsers. The structural problem is server-side connection cost, not a hard browser cap." },
            { label: "Multiple connections cause out-of-order delivery.", explanation: "Each connection is in-order; the issue isn't ordering across tabs (each tab sees its own ordered stream). The issue is connection cost." },
            { label: "It violates the same-origin policy.", explanation: "It doesn't — every WS from the same origin is fine. The issue is efficiency, not correctness." },
          ]}
          hint="What's the cost on the server side when one user has 3 tabs each holding a socket?"
          xp={8}
        />

        <Quiz
          question="With leader-tab election, the leader tab gets closed mid-message-send. What's the correct behavior?"
          options={[
            { label: "Leader heartbeat stops, follower tabs detect the timeout (~5s), one of them wins re-election and reopens the WebSocket. The pending send should be in the outbox (IndexedDB), so the new leader picks it up and retries with the same clientMsgId. The user sees a brief 'reconnecting' state but no lost message.", correct: true, explanation: "Right. The outbox is the bridge between the dead leader and the new leader. clientMsgId guarantees that if the old leader actually managed to send before dying, the server dedups; if not, the new leader sends it cleanly." },
            { label: "All other tabs should refresh.", explanation: "Way too disruptive. Re-election is invisible to the user when done correctly." },
            { label: "Leader closure should never happen — pin the leader to one tab.", explanation: "You can't pin: tabs close, browsers crash, OS freezes background tabs. Re-election is a requirement, not a nice-to-have." },
            { label: "The pending message is lost — the user has to retype.", explanation: "Unacceptable UX. The whole point of the outbox is to survive leader death." },
          ]}
          hint="Where does the pending send live, and how does the new leader find it?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Presence is TTL-based heartbeats aggregated across sessions. Typing indicators must be throttled at every layer or they dwarf real messages. Multi-tab sync uses BroadcastChannel + leader election to share one WebSocket across N tabs."
          points={[
            { takeaway: "Presence is a TTL problem", detail: "Heartbeats every 30s, TTL 90s. Online = at-least-one session live. Aggregate across devices server-side." },
            { takeaway: "Typing is a 10-100x message multiplier", detail: "Throttle at the client (1/sec), at the server (per-user, per-conversation), and at the display (5s timeout). Otherwise keystrokes saturate your message bus." },
            { takeaway: "BroadcastChannel for tab fan-out", detail: "Modern, simple, well-supported. Leader tab owns the WS; follower tabs receive via the channel. SharedWorker is the heavier alternative." },
            { takeaway: "Leader election is the hard part", detail: "Heartbeat + timeout (~5s) + deterministic tie-breaker. Outbox in IndexedDB lets the new leader pick up pending sends from the dead one." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="frontend-design-realtime" id="complete" title="Part 4 · CRDTs, offline, UI patterns, edge cases" xp={25}>
        <h2>CRDT intuition (you almost never implement one)</h2>
        <p>
          For collaborative documents, the core problem is: two users edit the same paragraph offline, they both come back online, what does the merged result look like? Last-write-wins is wrong (loses one user{`'`}s edit). Manual conflict resolution is awful UX. The answer is a <strong>Conflict-free Replicated Data Type</strong> — a data structure with mathematical properties that guarantee any sequence of concurrent operations converges to the same result on every replica, regardless of order.
        </p>

        <h3>The mental model — without the math</h3>
        <ul>
          <li>Every character in the document gets a unique, globally-orderable ID at insertion time. Think of it as {`"`}position 5.3.7 inserted by user A at timestamp T.{`"`}</li>
          <li>Inserts are append-only: never overwrite, never reorder existing entries — just slot new ones in based on ID order.</li>
          <li>Deletes are <strong>tombstones</strong> — the entry stays, marked deleted. Two users can{`'`}t both {`"`}delete{`"`} the same character into a contradiction; it{`'`}s just marked deleted twice.</li>
          <li>Merging two replicas is set union of their entries. Because IDs are stable and orderings are deterministic, every replica converges to the same document.</li>
        </ul>

        <h3>You use a library — Yjs or Automerge</h3>
        <p>
          You almost never implement a CRDT yourself. <strong>Yjs</strong>{" "}and <strong>Automerge</strong>{" "}are the production libraries. Yjs is the more common choice for editors (used by Notion, Linear, and many others); Automerge is more general-purpose. Both wrap the algorithmic complexity in a usable API: you mutate a {`"`}shared{`"`} object, and the library produces sync messages you ship over your transport (WebSocket, in our case).
        </p>

        <h3>When to reach for a CRDT</h3>
        <ul>
          <li><strong>Collaborative document, whiteboard, spreadsheet</strong> — multiple users editing the same shared state simultaneously.</li>
          <li><strong>Multi-device offline-edit</strong> — same user editing on phone and laptop both offline, merging on reconnect.</li>
          <li><strong>Local-first apps</strong>{" "}where the source of truth is the device and sync is best-effort.</li>
        </ul>

        <h3>When NOT to reach for a CRDT</h3>
        <ul>
          <li><strong>Chat</strong> — server-ordered timeline is fine. Each message is independent; there{`'`}s no {`"`}two users editing the same message simultaneously{`"`} case to merge.</li>
          <li><strong>Simple CRUD</strong> — last-write-wins is the right choice when conflicts are rare and a refresh is acceptable.</li>
          <li><strong>Anything where the server is the source of truth and clients can refresh</strong> — feed UIs, dashboards, ticket trackers.</li>
        </ul>

        <Callout variant="info" title="Tie-back to geo-systems">
          <p className="m-0">CRDTs show up again in multi-region geo-systems: when two regions accept writes for the same record and reconcile asynchronously. The math is the same. Whether you{`'`}re merging two users{`'`} edits or two data centers{`'`} writes, you want concurrent operations to converge without a coordinator.</p>
        </Callout>

        <h2>Offline edit handling — the IndexedDB outbox</h2>
        <p>
          User loses connection mid-typing. What happens?
        </p>
        <ul>
          <li><strong>Bad:</strong>{" "}error toast, lost message, user has to retype.</li>
          <li><strong>Good:</strong>{" "}queue the message in IndexedDB, mark as <code>pending</code>, retry on reconnect.</li>
        </ul>

        <p>
          The pattern is an <strong>outbox</strong> — an append-only queue of pending sends, persisted to IndexedDB so it survives tab close, page reload, and OS-level tab freezes. When the WebSocket opens, drain the outbox in order, send each message, mark as <code>sent</code> on ACK, remove from outbox.
        </p>

        <CodeBlock lang="ts" caption="Outbox pattern with IndexedDB">{`type OutboxEntry = {
  clientMsgId: string;
  conversationId: string;
  body: string;
  ts: number;
  attempts: number;
};

class Outbox {
  private db: IDBDatabase | null = null;

  async append(entry: OutboxEntry) {
    const tx = this.db!.transaction("outbox", "readwrite");
    tx.objectStore("outbox").put(entry, entry.clientMsgId);
    await new Promise((r) => (tx.oncomplete = r));
    // Cap at 100 entries — warn user if outbox is full
    const count = await this.count();
    if (count > 100) this.notifyOutboxFull();
  }

  async drain(send: (e: OutboxEntry) => Promise<void>) {
    const all = await this.getAll();
    all.sort((a, b) => a.ts - b.ts);  // oldest first
    for (const entry of all) {
      try {
        await send(entry);
        await this.remove(entry.clientMsgId);
      } catch {
        entry.attempts += 1;
        if (entry.attempts > 5) {
          await this.remove(entry.clientMsgId);
          this.notifyMessageFailed(entry);
        } else {
          await this.update(entry);
        }
        break; // stop draining; let reconnect retry
      }
    }
  }
}`}</CodeBlock>

        <h3>Bounding the outbox</h3>
        <p>
          If a user is offline for three days, their outbox could grow to thousands of messages. Most of those are no longer relevant. Cap the outbox at <strong>100 messages</strong> (or 24 hours, whichever comes first) and warn the user — {`"`}You{`'`}re offline. Older messages won{`'`}t be sent.{`"`} An unbounded outbox is a memory leak, a privacy issue (old drafts sitting on disk), and a UX problem (delivering 500 messages from yesterday all at once).
        </p>

        <Callout variant="warn" title="The outbox cap is a UX call, not a technical one">
          <p className="m-0">There{`'`}s no technical reason 100 is the right number. The point is: pick one, document it, surface it to the user. {`"`}Drafts older than 24 hours have been discarded{`"`} is a defensible product decision; {`"`}we kept all 500 of them and now your phone is showing yesterday{`'`}s outdated messages{`"`} is not.</p>
        </Callout>

        <h2>UI patterns specific to real-time</h2>

        <h3>Auto-scroll-to-bottom — but only sometimes</h3>
        <p>
          New message arrives. Should the chat scroll to the bottom? It depends. If the user is already at the bottom, yes — that{`'`}s the natural reading position. If the user has scrolled up to read older messages, absolutely not — yanking them down loses their place and infuriates them.
        </p>

        <CodeBlock lang="tsx" caption="Auto-scroll state machine">{`const SCROLL_NEAR_BOTTOM_PX = 100;

function useChatScroll(messages: Message[]) {
  const ref = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track whether user is at bottom
  const onScroll = () => {
    const el = ref.current!;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < SCROLL_NEAR_BOTTOM_PX;
    setAutoScroll(atBottom);
    if (atBottom) setUnreadCount(0);
  };

  // On new message, scroll iff autoScroll is on
  useEffect(() => {
    if (!ref.current) return;
    if (autoScroll) {
      ref.current.scrollTop = ref.current.scrollHeight;
    } else {
      setUnreadCount((c) => c + 1);
    }
  }, [messages.length]);

  return { ref, onScroll, unreadCount, scrollToBottom: () => {
    ref.current!.scrollTop = ref.current!.scrollHeight;
    setAutoScroll(true);
    setUnreadCount(0);
  }};
}`}</CodeBlock>

        <h3>The {`"`}new messages{`"`} pill</h3>
        <p>
          When the user is scrolled up and new messages arrive, show a floating pill: {`"`}5 new messages ↓{`"`}. Click the pill to jump to the bottom. This is the standard pattern in Slack, iMessage, Discord — every chat app converges on it because it solves the {`"`}don{`'`}t yank but don{`'`}t lose them{`"`} problem cleanly.
        </p>

        <h3>Read receipts — IntersectionObserver, debounced</h3>
        <p>
          A message is {`"`}read{`"`} when it{`'`}s actually visible in the viewport, not just when it{`'`}s loaded. Use <code>IntersectionObserver</code> to detect when message DOM nodes enter the viewport, then debounce — if the user scrolls rapidly past 50 messages, you don{`'`}t want 50 read events. Debounce by 500ms and batch into one {`"`}mark up to msgId X as read{`"`} call.
        </p>

        <CodeBlock lang="tsx" caption="Read receipts via IntersectionObserver">{`function useReadReceipts(conversationId: string) {
  const pendingRead = useRef<string | null>(null);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const observer = useMemo(() => new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const msgId = e.target.getAttribute("data-msg-id")!;
      // Track the latest msgId we've seen
      if (!pendingRead.current || msgId > pendingRead.current) {
        pendingRead.current = msgId;
      }
    }
    // Debounce flush
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      if (pendingRead.current) {
        api.markRead(conversationId, pendingRead.current);
        pendingRead.current = null;
      }
    }, 500);
  }, { threshold: 0.5 }), [conversationId]);

  return observer;
}`}</CodeBlock>

        <h3>Skeleton vs spinner</h3>
        <ul>
          <li><strong>Skeleton</strong>{" "}when you know the shape of what{`'`}s coming — chat history loads message bubbles in known positions, so a skeleton with greyed-out bubbles feels like progress.</li>
          <li><strong>Spinner</strong>{" "}when you don{`'`}t — sending a message of unknown duration, file upload progress unknown, {`"`}reconnecting…{`"`}.</li>
          <li><strong>Nothing</strong>{" "}for sub-200ms ops — flashing a spinner that disappears in 100ms is worse than no feedback at all.</li>
        </ul>

        <h2>Edge cases the interviewer probes</h2>

        <h3>Message arrives while user is reading old messages</h3>
        <p>
          Don{`'`}t auto-scroll. Show the {`"`}new messages{`"`} pill. Increment the count for each new message until the user clicks it or scrolls down naturally.
        </p>

        <h3>Typing indicator from a deleted user</h3>
        <p>
          User leaves the chat (or is removed from a group). Their typing event was already in flight. Drop it on receive — the client{`'`}s membership check filters it out before showing. {`"`}DeletedUser is typing…{`"`} is a bug.
        </p>

        <h3>WebSocket connects but auth has expired</h3>
        <p>
          The server accepts the upgrade then closes with code <strong>4401</strong> (custom application close code). The client interprets 4401 as {`"`}refresh token, retry{`"`}: it calls the auth endpoint, gets a new token, and reconnects with it. Don{`'`}t bake auth-refresh into the regular reconnect path — it should be a special case so it doesn{`'`}t trigger normal exponential backoff (which would slow down a fix that{`'`}s instant).
        </p>

        <CodeBlock lang="ts" caption="Auth-expired close code handling">{`ws.addEventListener("close", async (e) => {
  if (e.code === 4401) {
    try {
      await refreshToken();
      this.attempt = 0;          // skip backoff — auth is fixed
      this.connect();
    } catch {
      // Refresh itself failed — treat as logout
      this.notifyLoggedOut();
    }
    return;
  }
  this.scheduleReconnect();      // normal backoff for everything else
});`}</CodeBlock>

        <h3>Same user typing in two tabs</h3>
        <p>
          Server dedupes by user, not by session. {`"`}Alice has at least one session sending typing in this conversation{`"`} → emit one {`"`}Alice is typing{`"`} event to recipients. Without this dedup, recipients see {`"`}Alice is typing… Alice is typing…{`"`} or worse, two indicators stacked.
        </p>

        <h3>Network back but server unreachable</h3>
        <p>
          Phone reconnects to WiFi but the chat backend is in an outage. WebSocket connect fails immediately. Client backs off normally — 1s, 2s, 4s, capped at 30s. Show a banner after the third failure: {`"`}Reconnecting…{`"`}. Don{`'`}t show it on the first try; transient blips are common and a banner that flashes on every NAT timeout is noise.
        </p>

        <h3>Browser tab freezes — backgrounded, then resumed</h3>
        <p>
          Modern browsers aggressively freeze backgrounded tabs to save memory and battery. Timers stop firing, network sockets may be paused, the JS heap is preserved but inert. When the tab returns to the foreground, your code resumes — but the WebSocket may have been silently terminated, the heartbeat timer hasn{`'`}t fired in 20 minutes, and your <code>lastSeq</code> is way behind reality.
        </p>
        <p>
          The fix is the <code>visibilitychange</code> event. On <code>visible</code>, force a heartbeat send and start a 5-second timer; if no pong arrives, treat the socket as dead and reconnect (which will resync via <code>?since=N</code>). Don{`'`}t trust the socket state alone — it can lie to you after a freeze.
        </p>

        <CodeBlock lang="ts" caption="Visibility change handling">{`document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  // Tab just came back. Probe the connection.
  if (ws.readyState !== WebSocket.OPEN) {
    return scheduleReconnect();
  }
  let pongReceived = false;
  const handler = () => { pongReceived = true; };
  ws.addEventListener("message", handler, { once: true });
  ws.send(JSON.stringify({ type: "ping" }));
  setTimeout(() => {
    ws.removeEventListener("message", handler);
    if (!pongReceived) {
      ws.close();           // triggers normal reconnect path
    }
  }, 5000);
});`}</CodeBlock>

        <h3>Two devices, same user, same message ID</h3>
        <p>
          User sends from phone, the network drops before the ACK, then they pick up their laptop and {`"`}send{`"`} the same draft. Two devices, two different <code>clientMsgId</code>s — these are <em>not</em>{" "}a duplicate, they{`'`}re two genuine sends. {`"`}Same draft text{`"`} doesn{`'`}t trigger dedup; only same UUID does. This is the right behavior: dedup is for retries of the same send, not for {`"`}I typed something similar later.{`"`}
        </p>

        <Callout variant="insight" title="What separates the great answer from the good one">
          <p className="m-0">A good candidate covers transport, reconnect, ordering, presence, and multi-tab sync. A great one also says: {`"`}This design assumes a single source of truth on the server. For a collaborative doc — where edits happen offline and merge — we{`'`}d add a CRDT (Yjs) on top of the same transport. The transport stays; the data model changes.{`"`} That move signals you understand the architecture transcends the example, and you can reason about the next archetype without redrawing the system.</p>
        </Callout>

        <Quiz
          question="The interviewer asks: 'Same user has Slack open in 3 tabs. Each tab has its own React state. How do you avoid showing the same message 3 times when it arrives?'"
          options={[
            { label: "Single shared connection via leader-tab election (BroadcastChannel). The leader tab owns the WebSocket, receives the message once, and broadcasts to follower tabs over the channel. Each tab applies it to its own React store, so they all render — but the message only crossed the wire once.", correct: true, explanation: "Right. The connection lives in one tab; the rendering lives in all tabs. BroadcastChannel is the bridge. Cleanest approach: each tab is a peer reading from a shared event stream, and only one tab is the source." },
            { label: "Each tab's React state should listen on its own WebSocket; the duplicate render is fine because each store handles it.", explanation: "It's not duplicate rendering that's the issue — it's the wasted connections. 3 tabs = 3 sockets = 3x gateway load for one user." },
            { label: "Use server-sent dedup IDs and skip messages already seen.", explanation: "That doesn't address the core problem (3 sockets per user). And every tab having seen the message independently doesn't help — they all need to render it." },
            { label: "localStorage with a global 'seen' set across tabs.", explanation: "Halfway there but messy: you'd still have 3 sockets receiving the message, just dedup'd at render time. Leader election with BroadcastChannel solves the connection cost too." },
          ]}
          hint="Where does the WebSocket live, and how do other tabs see what it received?"
          xp={8}
        />

        <Quiz
          question="A candidate says 'we'll use a CRDT for the chat to handle conflicts.' What's the right pushback?"
          options={[
            { label: "Chat doesn't have edit conflicts to resolve. Each message is an independent append; the server orders them and the timeline is the source of truth. CRDTs solve the 'two users editing the same paragraph' problem, which doesn't exist in chat. Reach for one when you build a collaborative doc — not for a chat timeline.", correct: true, explanation: "Right. CRDTs are powerful but expensive (extra metadata per character, sync protocol overhead). Apply them where conflicts are real — collaborative docs, whiteboards, spreadsheets — not where ordering trivially resolves the question." },
            { label: "CRDTs require Yjs and that's not a production-ready library.", explanation: "Yjs is very production-ready (Linear, Notion, many others). The objection isn't the library; it's that the problem doesn't need a CRDT." },
            { label: "Chat has too many messages for CRDTs to scale.", explanation: "Volume isn't the issue; the issue is that the conflict-merge problem doesn't exist. CRDTs would just add overhead for nothing." },
            { label: "CRDTs only work for text editing, not message lists.", explanation: "They work for arbitrary data structures (lists, maps, counters). The objection is conceptual, not technical: chat doesn't have the kind of conflicts CRDTs solve." },
          ]}
          hint="What problem do CRDTs solve, and does chat have that problem?"
          xp={7}
        />

        <Quiz
          question="What's the right behavior when a new message arrives while the user has scrolled up to read older messages?"
          options={[
            { label: "Don't auto-scroll. Show a 'new messages' indicator pill; clicking it jumps to bottom. Track unread count in the pill so the user knows how many they've missed. This is the standard pattern in Slack, iMessage, Discord — it solves the 'don't yank but don't hide' tradeoff.", correct: true, explanation: "Right. Auto-scroll-to-bottom is correct only when the user is already at (or near) the bottom. Otherwise it loses their place. The indicator is the consensus solution across every modern chat app." },
            { label: "Always auto-scroll — it's a chat, that's what users expect.", explanation: "Users emphatically don't expect to be yanked away from a message they're reading. This is the most common chat-app bug, and the indicator pattern is the consensus fix." },
            { label: "Pause incoming messages until the user scrolls back to bottom.", explanation: "That breaks the real-time-ness of the chat — and it's how you end up with 'why did this 5-minute-old message just appear?' bug reports." },
            { label: "Show the new message inline at the user's scroll position.", explanation: "Inserting messages into the middle of the scroll area is jarring and breaks the timeline metaphor. Bottom-of-list with an indicator is the right answer." },
          ]}
          hint="What does Slack do when you've scrolled up and a message arrives?"
          xp={6}
        />

        <PartRecap
          title="Part 4 recap"
          gist="CRDTs for collab docs (not chat). Outbox in IndexedDB for offline sends, capped at 100. Auto-scroll only when at-bottom; pill otherwise. Dedup typing across tabs. Auth expiry uses a special close code so it doesn't trigger normal backoff."
          points={[
            { takeaway: "CRDT intuition matters; implementation doesn't", detail: "Yjs/Automerge wrap the math. Reach for them on collaborative docs/whiteboards/spreadsheets, not on chat where server-ordered timeline is the source of truth." },
            { takeaway: "Outbox in IndexedDB", detail: "Pending sends survive tab close and reload. Drain on reconnect, oldest first. Cap at 100 messages or 24 hours; surface the cap to the user." },
            { takeaway: "Auto-scroll is a state machine", detail: "Track whether user is near-bottom. Auto-scroll on new messages only when near-bottom; otherwise show a 'N new messages' pill that jumps on click." },
            { takeaway: "Edge cases are where seniors shine", detail: "Typing from deleted user (drop), auth expiry (special close code 4401), same user typing in N tabs (dedupe by user, not session), retry after long offline (different clientMsgIds = genuine sends, not dupes)." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Observability — what to instrument on the client</h2>
        <p>
          Real-time UIs fail in ways that don{`'`}t throw exceptions. The socket {`"`}succeeded{`"`} but is silently delivering nothing. Messages are reaching the server but not being rendered because of a state-machine bug. The four metrics that catch these:
        </p>
        <ul>
          <li><strong>Time-to-connect (p50/p99):</strong>{" "}from <code>new WebSocket()</code> to <code>open</code> event. If this drifts from 200ms to 800ms, your gateway is unhealthy or the LB is mis-routing.</li>
          <li><strong>Send-to-ACK latency (p50/p99):</strong>{" "}from message dispatch to ACK received. Above 1s p99 sustained, fanout is lagging or you{`'`}re behind a slow proxy.</li>
          <li><strong>Reconnect rate:</strong>{" "}reconnects per session per minute. Above ~1/min, something is making the connection unstable — corp proxies, an unhealthy gateway pod, or a deploy in progress.</li>
          <li><strong>Outbox depth:</strong>{" "}messages waiting to be drained. If this grows above 0 for &gt;10s on most users, you{`'`}re shipping messages slower than users send them — usually a backend problem, not a client one.</li>
        </ul>
        <p>
          The leading indicator that often catches issues before user reports: <strong>reconnect rate</strong>. A spike in reconnects across a region is almost always the first sign of a gateway problem, and it shows up minutes before the {`"`}messages aren{`'`}t arriving{`"`} support tickets.
        </p>
      </section>

      <section>
        <h2>Putting the whole answer together</h2>
        <p>
          When the interviewer says {`"`}design a real-time UI,{`"`} here{`'`}s the structure that wins:
        </p>
        <ol>
          <li><strong>Clarify the archetype</strong> — chat (server-ordered) or collab doc (CRDT). Lock the scope cuts out loud.</li>
          <li><strong>Pick the transport</strong> — WebSocket for chat. Defend with the handshake-vs-message-cost numbers.</li>
          <li><strong>Draw the connection lifecycle</strong> — exponential backoff with jitter, heartbeats, resync-from-sequence on reconnect.</li>
          <li><strong>Walk the send path</strong> — optimistic render, clientMsgId, ACK reconciliation, retry policy.</li>
          <li><strong>Cover presence + typing</strong> — heartbeat-driven, throttled at every layer, deduped across sessions.</li>
          <li><strong>Multi-tab sync</strong> — BroadcastChannel + leader election, outbox bridges leader death.</li>
          <li><strong>Offline edits</strong> — IndexedDB outbox, bounded, drained on reconnect.</li>
          <li><strong>UI patterns</strong> — auto-scroll state machine, new-message pill, IntersectionObserver-based read receipts.</li>
          <li><strong>Edge cases</strong> — deleted user typing, auth expiry close code, retry semantics.</li>
          <li><strong>The follow-up</strong> — {`"`}for collab docs we{`'`}d swap the data model for a CRDT (Yjs), but the transport, reconnect, and presence layers are the same.{`"`}</li>
        </ol>
        <p>
          That answer is 35-40 minutes if you pace it. The mid-level answer stops at step 4 and waves at the rest. The senior answer hits every step with real numbers and names the patterns.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You{`'`}ve covered the three frontend system design archetypes — fundamentals, feed, and real-time. Loop back to the index to pick the next track, or revisit the backend chat module to compare notes from the server side.
        </p>
        <Link
          href="/courses/system-design"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Back to all modules →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="frontend-design-realtime" />
    </article>
  );
}
