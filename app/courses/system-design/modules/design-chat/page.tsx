import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "reqs", title: "Requirements & estimation" },
  { id: "design", title: "High-level design" },
  { id: "deep", title: "Scale & deep dives" },
  { id: "advanced", title: "Advanced concerns" },
];

const chatArchitectureDiagram = `flowchart LR
  C1[iOS / Android / Web] -->|WSS sticky| LB[L7 LB / WAF]
  LB --> GW1[Gateway 1]
  LB --> GW2[Gateway 2]
  LB --> GW3[Gateway N]
  GW1 -->|publish| K[(Kafka<br/>messages topic)]
  GW2 -->|publish| K
  GW3 -->|publish| K
  K --> FAN[Fanout Service]
  FAN --> CASS[(Cassandra<br/>messages by conv,ts)]
  FAN --> INBOX[(Inbox queue<br/>per recipient)]
  FAN -->|deliver| GW1
  FAN -->|deliver| GW2
  GW1 <-->|heartbeat| PRES[(Redis<br/>presence)]
  GW2 <-->|heartbeat| PRES
  C1 -->|HTTPS| API[REST API<br/>history, attachments]
  API --> CASS
  API --> S3[(Object store<br/>attachments)]
  style K fill:#fef3c7,stroke:#d97706
  style CASS fill:#dbeafe,stroke:#2563eb
  style PRES fill:#fce7f3,stroke:#db2777`;

export default function Page() {
  const mod = getModuleBySlug("design-chat")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="design-chat" />
        <ModuleProgress moduleSlug="design-chat" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💬</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A defensible answer to the WhatsApp/Slack interview. The connection layer is the heart of it — once you can talk about persistent websockets, sticky routing, and how a message travels from sender to recipient through Kafka and a wide-column store, the rest is bookkeeping.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The connection model: stateful gateways holding millions of sticky websockets</li>
          <li>Why Cassandra/DynamoDB for the message log, partitioned by conversation</li>
          <li>Group fanout: when push-on-write is fine and when it isn&apos;t</li>
          <li>Delivery semantics: at-least-once with client-side idempotency on msgId</li>
          <li>Presence done correctly: Redis hash + heartbeats, not the database</li>
        </ul>
      </section>

      <section>
        <h2>Why this prompt is a senior filter</h2>
        <p>
          &quot;Design WhatsApp&quot; sounds simple — it&apos;s just messaging — and that&apos;s exactly why it&apos;s a good interview. The naive answer is one HTTPS POST per message into a Postgres table, and it falls over in three different ways at the first follow-up question. The interesting parts are all the things that look like polish until you do the math: persistent connections at scale, presence that doesn&apos;t hammer the DB, group fanout that doesn&apos;t go quadratic, and history that scales past a billion messages a day.
        </p>
        <p>
          What the interviewer is actually testing: do you reach for stateful gateways and a message bus instinctively, or do you try to build chat on top of REST? Do you know that &quot;online&quot; is a TTL problem, not a write problem? Can you push back when someone says &quot;exactly-once&quot; and explain why at-least-once with msgId dedup is the real design? Those are the senior tells.
        </p>
      </section>

      <Checkpoint moduleSlug="design-chat" id="reqs" title="Part 1 · Requirements & estimation" xp={25}>
        <h2>Pin the prompt down before you draw anything</h2>
        <p>
          Spend the first five minutes on clarifying questions. The interviewer wants to see you scope before designing. Here&apos;s the rough ladder I&apos;d walk:
        </p>

        <h3>Functional requirements</h3>
        <ul>
          <li><strong>1:1 chat</strong> — send/receive text messages, with delivery to offline users when they come back online.</li>
          <li><strong>Group chat</strong>, capped at ~200 members. (Discord-scale 10k+ servers is a whole other shape; we&apos;ll scope it out.)</li>
          <li><strong>Presence</strong> — &quot;online / last seen at X&quot;.</li>
          <li><strong>Read receipts</strong> — sent / delivered / read state per message.</li>
          <li><strong>Attachments</strong> — images and files up to ~100MB, stored separately from the message log.</li>
          <li><strong>Message history</strong> — accessible forever, paginated, searchable later (out of scope for this round).</li>
        </ul>

        <h3>Non-functional requirements</h3>
        <ul>
          <li><strong>p99 send-to-deliver latency under 500ms</strong> when both parties are online and on a normal network. This is the headline number that pins the design.</li>
          <li><strong>~50M DAU</strong>, with peak concurrent users about a third of that — call it 17M concurrent.</li>
          <li><strong>~40 messages per active user per day</strong> on average. That gives us 50M × 40 = 2B messages/day.</li>
          <li><strong>Durability matters</strong> — once we ack a message, it must not vanish. But strict ordering is per-conversation, not global.</li>
          <li><strong>End-to-end encryption</strong> is a yes/no the interviewer should make explicit. Saying &quot;yes E2EE&quot; changes server-side search and many other things; we&apos;ll assume transport encryption only for this round.</li>
        </ul>

        <h3>Back of the envelope</h3>
        <p>
          The numbers anchor every later decision. Don&apos;t skip this — and don&apos;t pretend to compute them in your head; show the work.
        </p>
        <ul>
          <li><strong>Messages per day:</strong> 50M DAU × 40 msgs = 2B messages/day.</li>
          <li><strong>Average write QPS:</strong> 2B / 86,400s ≈ 23k QPS. Peak 3-4× average → ~80-100k QPS at peak.</li>
          <li><strong>Read QPS</strong> (delivery, not history scrolls): every message is delivered to ~1.5 recipients on average (mostly 1:1, some groups), so ~120-150k delivery events/sec at peak.</li>
          <li><strong>Storage:</strong> assume an average message is 200 bytes payload + 200 bytes metadata = 400 bytes. 2B × 400B = 800GB/day. Over a year, ~290TB. That&apos;s the message log; attachments live in object storage and are an order of magnitude more.</li>
          <li><strong>Concurrent connections:</strong> 17M sticky websockets. If a single gateway box can hold 100k connections (memory-bound, ~10KB per connection in good implementations), that&apos;s 170 gateway boxes minimum, double that for headroom and rolling deploys.</li>
        </ul>

        <Callout variant="info" title="The connection count is the surprising one">
          <p className="m-0">17M concurrent websockets is a real operational fact. Each connection is a file descriptor, a TCP socket, kernel buffers, and userspace state on a JVM heap. The connection layer dominates your memory budget, drives your blast radius during gateway restarts, and is the thing that makes &quot;just use Spring Boot REST&quot; not work. Most candidates breeze past this; it&apos;s where senior interviewers want you to pause.</p>
        </Callout>

        <Quiz
          question="A candidate says: 'We'll use REST with long polling for chat — every client polls every 2 seconds for new messages.' What's the strongest objection at WhatsApp scale?"
          options={[
            { label: "At 17M concurrent users polling every 2s, you get 8.5M QPS of polling traffic on a system that's mostly returning 'no new messages.' The cost dwarfs the actual messaging load, latency is bounded below by the poll interval, and battery on mobile dies. Persistent websockets are the correct primitive.", correct: true, explanation: "Right. Polling at scale is mostly wasted work. WebSockets give you sub-second push, far less overhead per delivered message, and a single TCP connection per device. The trade is server-side state, which is exactly what the gateway layer absorbs." },
            { label: "REST can't handle 100k QPS — you need gRPC.", explanation: "REST/HTTPS itself can absolutely do 100k QPS at a load balancer; that's not the issue. The issue is the polling pattern, which forces you to a latency floor and creates traffic for no message activity." },
            { label: "Long polling violates HTTP semantics and won't work behind corporate proxies.", explanation: "Long polling actually works through most proxies — it's literally just a held GET. The real problem is the inefficiency at scale and the latency floor." },
            { label: "You can't do read receipts over REST.", explanation: "You can; that's not the structural issue. The structural issue is that server-push is a much better fit for a chat workload than client-pull." },
          ]}
          hint="What's the cost of the connection model when most polls return nothing?"
          xp={7}
        />

        <Quiz
          question="The interviewer says: 'Assume 50M DAU, 40 messages per user per day, and peak is 4x average.' What's the rough peak write QPS you'd commit to?"
          options={[
            { label: "Around 90-100k QPS. Average is 2B / 86,400 ≈ 23k QPS, and 4x peak puts us near 90-100k QPS at the busy hour.", correct: true, explanation: "Right. Always show the math: total daily messages, divide by seconds in a day for the average, then apply the peak multiplier. Round numbers — interviewers want defensible estimates, not five-decimal precision." },
            { label: "Around 1M QPS — you have to assume worst case.", explanation: "1M QPS doesn't fall out of the assumptions given. Be careful not to inflate; over-provisioning by 10x signals you didn't do the math." },
            { label: "Around 23k QPS — peak is just the average.", explanation: "Peak is explicitly 4x average per the prompt. Sizing for the average alone leaves you blown out at the busy hour." },
            { label: "Around 5k QPS — most users don't message every day.", explanation: "The prompt already said 50M DAU (daily active users — they did message that day). 5k is an under-estimate." },
          ]}
          hint="2B messages divided by seconds in a day, then times the peak multiplier."
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Chat at WhatsApp scale is 2B messages/day, ~100k peak write QPS, and 17M concurrent persistent connections. The connection count is the unusual constraint that breaks REST-style designs."
          points={[
            { takeaway: "Scope before you design", detail: "1:1, groups capped at 200, presence, receipts, attachments — but say E2EE and global search are out of scope for this round, or it spirals." },
            { takeaway: "Show the QPS math out loud", detail: "50M × 40 msgs / 86,400s ≈ 23k average, 4x at peak ≈ 100k. Round numbers, defensible." },
            { takeaway: "Connection count is the design driver", detail: "17M persistent websockets sized at 100k per gateway box means hundreds of gateway machines. This is what kills the REST-with-polling answer." },
            { takeaway: "Attachments are not in the message log", detail: "Store payload in S3-style object storage, store the URL/metadata in the message row. Otherwise your 290TB/year balloons by 10x and you waste expensive DB space on bytes that don't need to be queried." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-chat" id="design" title="Part 2 · High-level design" xp={30}>
        <h2>Three layers that show up in every chat design</h2>
        <p>
          Every credible chat architecture has the same three layers: the <strong>gateway layer</strong> that owns persistent connections, a <strong>message bus</strong> (Kafka in 2026) that decouples ingest from fanout, and a <strong>storage layer</strong> for the durable message log plus a presence cache. Let&apos;s draw it once and then justify every box.
        </p>

        <Mermaid chart={chatArchitectureDiagram} />

        <h3>API surface — websockets first, REST for the rest</h3>
        <p>
          The hot path is over a websocket frame, not REST. But there&apos;s still a control plane in HTTPS for everything that doesn&apos;t need server push. A clean API surface looks like this:
        </p>

        <CodeBlock lang="java" caption="ChatController.java — control plane (REST)">{`@RestController
@RequestMapping("/api/v1")
public class ChatController {

  // Open a conversation (1:1 or group). Idempotent on (creator, members).
  @PostMapping("/conversations")
  public ConversationResponse createConversation(@RequestBody CreateConversation req);

  // Page through history, newest first. Cursor is opaque (last seen msgId).
  @GetMapping("/conversations/{id}/messages")
  public Page<Message> getHistory(
      @PathVariable String id,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "50") int limit);

  // Mark every message up to msgId as read. Idempotent.
  @PostMapping("/conversations/{id}/read")
  public void markRead(@PathVariable String id, @RequestBody MarkRead req);

  // Get a presigned upload URL for an attachment. Client uploads direct to S3.
  @PostMapping("/attachments/upload-url")
  public UploadUrl getUploadUrl(@RequestBody AttachmentRequest req);
}`}</CodeBlock>

        <p>
          The websocket frames are tiny, JSON or protobuf, with a small set of message types: <code>SEND</code>, <code>ACK</code>, <code>DELIVERED</code>, <code>READ</code>, <code>TYPING</code>, <code>PRESENCE_UPDATE</code>. The most important thing on the wire is that the client provides a <code>clientMsgId</code> on every <code>SEND</code> — that&apos;s the idempotency key the server uses to dedup retries.
        </p>

        <h3>Data model — where messages actually live</h3>
        <p>
          Two storage systems, each picked for what it&apos;s good at:
        </p>

        <CodeBlock lang="plain" caption="Cassandra schema — message log">{`-- Partition by conversation, cluster by time DESC.
-- A single conversation = a single hot partition with append-only writes.
CREATE TABLE messages (
  conversation_id  UUID,
  ts               TIMEUUID,        -- time-ordered UUID, gives us ordering for free
  sender_id        UUID,
  client_msg_id    UUID,            -- idempotency key from sender
  body             TEXT,            -- or attachment_url for media
  message_type     TEXT,            -- TEXT | IMAGE | FILE | SYSTEM
  PRIMARY KEY ((conversation_id), ts)
) WITH CLUSTERING ORDER BY (ts DESC);

-- Conversation membership for routing fanout
CREATE TABLE conversation_members (
  conversation_id UUID,
  user_id         UUID,
  joined_at       TIMESTAMP,
  PRIMARY KEY ((conversation_id), user_id)
);

-- Per-user inbox of conversations they're in (read-fanout)
CREATE TABLE user_conversations (
  user_id          UUID,
  last_msg_ts      TIMEUUID,
  conversation_id  UUID,
  PRIMARY KEY ((user_id), last_msg_ts, conversation_id)
) WITH CLUSTERING ORDER BY (last_msg_ts DESC);`}</CodeBlock>

        <p>
          The message log is in Cassandra (or DynamoDB). The reason is the access pattern: append at the end of a partition, read the most recent N from the same partition. That&apos;s exactly what an LSM-tree wide-column store is built for. Postgres can do it too, but at 2B writes/day you&apos;re paying a steep operational cost for transactions you never use on this table.
        </p>

        <p>
          Presence is in Redis, with a hash keyed by user, and heartbeats from the gateway extend a TTL. No durability needed — if Redis flickers, every gateway just re-pushes presence on the next heartbeat tick.
        </p>

        <CodeBlock lang="plain" caption="Redis presence model">{`# Hash per user. TTL extended by gateway heartbeat every 30s.
# If TTL expires, user is offline.
HSET presence:user:{userId}
  status      online
  gateway     gw-pod-42
  last_seen   1714440000
EXPIRE presence:user:{userId} 90`}</CodeBlock>

        <h3>The send path, step by step</h3>
        <p>
          Walking the path of a single message is the clearest way to explain the design:
        </p>
        <ol>
          <li>Client sends a <code>SEND</code> frame with <code>clientMsgId</code> on its websocket to gateway G1.</li>
          <li>G1 assigns a server-side <code>msgId</code> (TIMEUUID), checks the dedup cache for <code>clientMsgId</code> (Redis SETNX with TTL), and immediately ACKs the client. Latency to ACK should be under 50ms — this is the budget of the rest of the trip.</li>
          <li>G1 publishes the message to Kafka topic <code>messages</code>, partitioned by <code>conversationId</code> so per-conversation order is preserved on a single partition.</li>
          <li>The fanout consumer reads the message, writes it to Cassandra, and looks up the conversation members.</li>
          <li>For each member, the fanout service consults Redis presence: if online and connected to gateway Gn, push the message frame to Gn over an internal RPC; if offline, append to the user&apos;s inbox queue (Kafka or a per-user list).</li>
          <li>Gn pushes the frame down the websocket to the recipient, who replies with <code>DELIVERED</code> on their own socket. Read receipts come on a separate path when the user actually opens the chat.</li>
        </ol>

        <Callout variant="spring" title="Why Kafka in the middle and not direct calls">
          <p className="m-0">You could have G1 write to Cassandra directly and call other gateways over RPC. Some teams do. The reason most production designs have Kafka in the middle: backpressure, replay, and cross-team sanity. The fanout service can lag without dropping messages; if the storage tier is degraded, Kafka holds the buffer; new consumers (search indexing, anti-spam, ML signals) can subscribe to the same topic without re-architecting the gateway. The cost is one extra hop of latency — usually 5-15ms — which fits inside our 500ms p99 budget with room to spare.</p>
        </Callout>

        <Quiz
          question="Why partition the Cassandra messages table by conversation_id with timestamp as the cluster key, instead of partitioning by message_id?"
          options={[
            { label: "The dominant read pattern is 'give me the most recent N messages in this conversation,' which is a single-partition range scan when partitioned by conversation. Partitioning by message_id would scatter those reads across the cluster and make pagination slow.", correct: true, explanation: "Right. Wide-column partitioning is all about access pattern. Conversations are bounded (most never exceed a few hundred MB) so the partition stays sane, and history pagination becomes a single-partition slice — the operation Cassandra is fastest at." },
            { label: "Partition by message_id avoids hot partitions during peak load.", explanation: "It does spread writes more evenly, but it also destroys read performance for the dominant query. The right answer is to size partitions by conversation activity and shard hot conversations if needed." },
            { label: "Cassandra can't have compound primary keys.", explanation: "It can — the parens-grouped first column is the partition key, and remaining columns are clustering keys. That's how this table is built." },
            { label: "It allows global ordering of all messages.", explanation: "There's no global ordering across conversations in this schema, and you don't need one. Per-conversation order is what users see." },
          ]}
          hint="What query has to be fast: history scroll, or random message lookup?"
          xp={7}
        />

        <Quiz
          question="The gateway maintains a sticky websocket per device. What does that imply for routing during fanout?"
          options={[
            { label: "The fanout service has to look up which gateway each recipient is connected to (via the presence cache), then RPC that specific gateway. Any gateway can't deliver to any user — it has to be the one holding that user's socket.", correct: true, explanation: "Right. The connection state is on a specific pod. Presence stores the gateway pod ID; fanout uses it to route. When a gateway restarts, every connected client reconnects to a (probably) different pod and updates presence." },
            { label: "It doesn't matter — the load balancer routes to any healthy gateway.", explanation: "The LB routes new connections; existing connections are sticky to a specific pod. If you fan out to a random gateway, that gateway has no socket to the recipient." },
            { label: "Each recipient must reconnect for every incoming message.", explanation: "That's polling, not websockets. The connection stays open; messages flow over it without reconnecting." },
            { label: "The fanout service itself holds every websocket.", explanation: "That would centralize state in the fanout service. Real designs split: gateways own connections, fanout owns delivery routing — and crosses the wire between them via Redis presence + RPC." },
          ]}
          hint="If the websocket is on gateway pod G1, can pod G2 deliver to that user?"
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Three layers: stateful gateways (websockets), Kafka in the middle, Cassandra for the message log + Redis for presence. Messages partition by conversation, presence by user, and routing flows through presence lookups."
          points={[
            { takeaway: "REST is a thin control plane, websockets carry the hot path", detail: "Conversation creation, history pagination, attachment URLs are REST. Send/receive/typing/read are websocket frames over an already-open connection." },
            { takeaway: "Cassandra partitioned by conversation_id, clustered by ts DESC", detail: "Append-at-end, read-most-recent-N. Exactly the access pattern wide-column LSM stores excel at. 2B writes/day is well within Cassandra's wheelhouse." },
            { takeaway: "Presence is a Redis hash with heartbeat-driven TTL", detail: "Online/offline is a TTL expiry, not a write. Gateways heartbeat every 30s; TTL is 90s. No DB writes for presence on the hot path." },
            { takeaway: "Kafka decouples gateway ingest from fanout and storage", detail: "Backpressure, replay, and the ability to add consumers (search, ML, anti-spam) without touching the gateway. Costs one hop, ~5-15ms." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-chat" id="deep" title="Part 3 · Scale & deep dives" xp={30}>
        <h2>The three follow-ups every interviewer asks</h2>

        <h3>Deep dive 1 — group fanout: when push-on-write fails</h3>
        <p>
          For 1:1 chat, fanout is trivial: write the message, deliver to one recipient. Groups are where it gets interesting. We capped groups at 200 members, which is on purpose: at 200 members, push-on-write is fine. Fanout writes the message once to Cassandra, then pushes 200 delivery events. At 100k peak send QPS with average group size of, say, 10 members, that&apos;s 1M delivery events per second — heavy but bounded.
        </p>
        <p>
          What breaks the design: relaxing the cap. If groups can be 100k members (Telegram-style channels), push-on-write becomes 100k delivery events per send. A single popular channel could chew through your gateway capacity on a single message. The fix is to <strong>switch to pull-on-read for large groups</strong>: store the message once, let recipients query when they open the conversation. That trades push latency for read latency, and that trade only makes sense for asymmetric &quot;broadcast&quot; conversations. WhatsApp&apos;s 200 cap is a deliberate design choice that keeps push-on-write viable.
        </p>

        <CodeBlock lang="java" caption="Fanout consumer — sketch">{`@Service
public class FanoutConsumer {

  private final CassandraTemplate cassandra;
  private final PresenceService presence;
  private final GatewayClient gateways;
  private final InboxQueue inbox;

  @KafkaListener(topics = "messages", groupId = "fanout")
  public void onMessage(ConsumerRecord<String, MessageEvent> record) {
    MessageEvent msg = record.value();

    // 1. Persist (idempotent on (conversationId, ts) PK)
    cassandra.insert(toRow(msg));

    // 2. Look up members
    List<UUID> members = cassandra.selectMembers(msg.getConversationId());

    // 3. For each, route based on presence
    for (UUID userId : members) {
      if (userId.equals(msg.getSenderId())) continue;  // don't echo to sender

      Optional<GatewayPod> pod = presence.findGateway(userId);
      if (pod.isPresent()) {
        // Online — push directly to their gateway
        gateways.deliver(pod.get(), userId, msg);
      } else {
        // Offline — append to inbox queue, deliver on reconnect
        inbox.append(userId, msg);
      }
    }
  }
}`}</CodeBlock>

        <h3>Deep dive 2 — delivery semantics: at-least-once + msgId dedup</h3>
        <p>
          Candidates often say &quot;exactly-once delivery.&quot; Push back. <strong>Exactly-once over a network is a fiction</strong>; what real systems do is at-least-once delivery with idempotent consumers. Here it works like this:
        </p>
        <ul>
          <li>Sender attaches <code>clientMsgId</code> (UUID) to every <code>SEND</code>. If they retry on a network blip, the <code>clientMsgId</code> is the same.</li>
          <li>Gateway uses <code>SETNX clientMsgId:{`{userId}:{clientMsgId}`}</code> with a 5-minute TTL. If it&apos;s already set, return the original <code>msgId</code> and don&apos;t republish.</li>
          <li>Recipient&apos;s client tracks <code>seen</code> msgIds. If a duplicate arrives (because Kafka redelivered after a consumer crash, say), the client drops it before showing it to the user.</li>
        </ul>
        <p>
          This is the standard pattern: at-least-once on the wire, dedup on the endpoints. It&apos;s simple, it&apos;s robust, and it&apos;s what every production chat system actually does. &quot;Exactly-once&quot; on a job description is shorthand for this pattern, not a real wire-level guarantee.
        </p>

        <h3>Deep dive 3 — the offline-and-back path</h3>
        <p>
          A user&apos;s phone goes into airplane mode for two hours, then comes back online. They expect to see every message they missed, in order, in every conversation. How does that work without re-fanning-out 50M offline messages on reconnect?
        </p>
        <p>
          Two complementary paths:
        </p>
        <ul>
          <li><strong>Inbox queue per user</strong> (Kafka topic, or a per-user list in storage) populated by the fanout service when the recipient is offline. On reconnect, the gateway drains the inbox to the client. Bounded size — usually capped at last 7 days or 1000 messages.</li>
          <li><strong>History pull-on-demand</strong> for older content. The client tracks the last <code>msgId</code> it has per conversation; when the user opens the conversation, it requests <code>GET /conversations/{`{id}`}/messages?cursor=lastMsgId</code> and gets the gap.</li>
        </ul>
        <p>
          The inbox queue handles &quot;just came back online,&quot; the history API handles &quot;reinstalled the app on a new phone.&quot; Trying to cover both with one mechanism either bloats the inbox or kills the user experience.
        </p>

        <Callout variant="warn" title="Read receipts are not the message log">
          <p className="m-0">A common mistake: writing read receipts back into the messages table. Don&apos;t. Receipts are a high-volume, low-importance, often best-effort write — at-most-once is fine, and losing one is invisible to users. Put them on a separate path (a small Cassandra table or even just the gateway memory + periodic flush) so receipts can&apos;t back up your message ingestion. Mixing them is the main reason teams blow out their write capacity at 10am Monday.</p>
        </Callout>

        <ClassifyChallenge
          title="Match the storage need to the right system"
          prompt="Pick the storage system whose strengths match the access pattern."
          buckets={[
            { id: "cassandra", label: "Cassandra / DynamoDB", color: "indigo" },
            { id: "redis", label: "Redis", color: "rose" },
            { id: "s3", label: "Object storage (S3)", color: "emerald" },
            { id: "kafka", label: "Kafka", color: "amber" },
          ]}
          items={[
            { id: "msg-log", label: "Append messages forever, partition by conversation, read most recent N. 2B writes/day.", answer: "cassandra", explanation: "Wide-column LSM is built for this exact access pattern. Postgres works at smaller scale; Cassandra/DynamoDB is the production answer at 2B/day." },
            { id: "presence", label: "User-online tracking with 30s heartbeat and TTL-based expiry. No durability required.", answer: "redis", explanation: "Hash + EXPIRE is exactly this. Redis dies, presence rebuilds itself within one heartbeat cycle. Putting presence in your DB hammers writes for no value." },
            { id: "attachment", label: "100MB image upload, served back to recipients via URL. High durability, infrequent access per object.", answer: "s3", explanation: "Blob in object storage; metadata + URL in the message row. Storing 100MB blobs in your message log is wasteful and pollutes the read path." },
            { id: "ingest", label: "Buffer between gateway ingest and fanout, retain 7 days, re-consumable for new downstream services.", answer: "kafka", explanation: "Replay + multi-consumer + retention is exactly Kafka's wheelhouse. Trying to do this with a database queue or in-memory buffer fails on backpressure or retention." },
            { id: "dedup", label: "5-minute idempotency cache for clientMsgId on incoming SEND frames. Tiny TTL, fire-and-forget.", answer: "redis", explanation: "Redis SETNX with TTL is the canonical idempotency primitive. Putting this in Cassandra wastes writes on data that's worthless after 5 minutes." },
            { id: "inbox", label: "Per-user offline inbox: hold up to 7 days of pending messages, drain on reconnect.", answer: "kafka", explanation: "Per-user Kafka topics (or sharded compacted topics) give you durable, append-only, drainable queues. Some teams use Cassandra here too, but Kafka gives better drain semantics and natural retention." },
          ]}
        />

        <Quiz
          question="A candidate says 'we'll guarantee exactly-once delivery from sender to recipient.' What's the correct senior pushback?"
          options={[
            { label: "Exactly-once on a network is a marketing phrase. The real pattern is at-least-once on the wire with idempotent endpoints — sender attaches a clientMsgId, gateway dedups, recipient client drops duplicates by msgId. That delivers exactly-once user experience without the impossible wire guarantee.", correct: true, explanation: "Right. This is one of the cleanest senior tells in the chat interview. Exactly-once requires either coordinated consensus (slow, fragile) or idempotency (the actual pattern everyone uses). Naming the pattern correctly is the move." },
            { label: "Just use TCP — it already gives exactly-once.", explanation: "TCP gives exactly-once at the segment level for one connection, but a chat send crosses many systems (gateway, Kafka, fanout, recipient gateway, recipient socket). Each hop can drop or duplicate." },
            { label: "Use a distributed transaction across all hops.", explanation: "2PC across the gateway, Kafka, Cassandra, and the recipient's socket would be operationally insane and would still not survive coordinator failure. Idempotency is the real answer." },
            { label: "Set a unique HTTP header on every send.", explanation: "Headers are the right shape (carrying the idempotency key) but the substance is the dedup logic on the gateway, not the header itself." },
          ]}
          hint="What's the difference between wire guarantees and user-visible behavior?"
          xp={8}
        />

        <Quiz
          question="The interviewer asks 'why do you cap groups at 200?' What's the most defensible answer?"
          options={[
            { label: "Because at 200 members, push-on-write fanout stays viable: each send produces a bounded number of delivery events. If the cap were 100k (channel-style), you'd switch to pull-on-read for large rooms — different design, different tradeoffs. The cap pins the fanout strategy.", correct: true, explanation: "Right. The product cap is in service of the architecture. WhatsApp's 200 limit isn't arbitrary — it's the number where push fanout still scales linearly with sends, not with members per send." },
            { label: "It's a database limit — Cassandra can't store more than 200 rows per partition.", explanation: "There's no such limit. Cassandra partitions can comfortably hold millions of rows; the cap is a product/architecture decision, not a DB constraint." },
            { label: "Encryption requires every member to share keys, and 200 is the max keyset.", explanation: "E2EE group keys (Signal protocol's Sender Keys) scale beyond 200 members. The fanout architecture is the binding constraint, not crypto." },
            { label: "It's just historical — there's no technical reason.", explanation: "There's a strong technical reason: it keeps push-on-write a viable strategy. Lifting the cap forces a different architecture for large rooms." },
          ]}
          hint="What changes about fanout if a single send needs to reach 100k recipients?"
          xp={8}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The interview-defining details: bounded fanout via group caps, at-least-once + msgId dedup for delivery, and an inbox queue that handles offline-then-back without choking history."
          points={[
            { takeaway: "Group caps are an architecture decision, not a product whim", detail: "200 members keeps push-on-write linear. Channels with 100k members force pull-on-read or a hybrid." },
            { takeaway: "At-least-once + idempotent endpoints is the real exactly-once", detail: "Wire-level exactly-once is fiction. Sender attaches clientMsgId, gateway dedups, recipient drops duplicates by msgId. That's the production pattern." },
            { takeaway: "Inbox queue per user for offline → back", detail: "Drain on reconnect, capped at 7 days or 1000 messages. Older history is pulled on demand via the REST API. Two paths, each tuned to its case." },
            { takeaway: "Read receipts on a separate path", detail: "High volume, low importance. At-most-once and best-effort. Don't write them into the main message table or you'll back up the hot write path." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-chat" id="advanced" title="Part 4 · Advanced concerns" xp={20}>
        <h2>The follow-ups for the staff round</h2>

        <h3>Multi-region: where do conversations live?</h3>
        <p>
          When you go global, you can&apos;t make every send round-trip to a single region. The standard answer: <strong>conversations are home-regioned</strong>. Each conversation has a primary region (chosen on creation, often by the creator&apos;s region), and writes for that conversation route there. Reads for history can be served from a regional replica. Cross-region calls happen only when participants are spread across regions, and the latency impact is bounded to those conversations.
        </p>
        <p>
          The gateway layer is regional too: a user connects to the nearest gateway, and that gateway routes their writes to the conversation&apos;s home region. Presence is regional with cross-region sync — &quot;is Alice online&quot; doesn&apos;t need millisecond freshness across regions.
        </p>

        <h3>Abuse and spam at the protocol layer</h3>
        <p>
          Chat is a fantastic abuse vector. Two things are non-optional:
        </p>
        <ul>
          <li><strong>Per-user rate limits at the gateway.</strong> A token bucket per <code>userId</code>, refilled at, say, 30 messages/minute. Lifted for trusted accounts, blocked entirely for accounts in a flagged state.</li>
          <li><strong>Anti-abuse signals on the message bus.</strong> A separate consumer reads the <code>messages</code> Kafka topic, scores for spam (URL patterns, message similarity across recipients, send velocity), and writes verdicts back. Bad actors get throttled or unsubscribed without touching the hot send path.</li>
        </ul>

        <h3>Observability: the questions that catch outages early</h3>
        <p>
          The two metrics that matter most:
        </p>
        <ul>
          <li><strong>Send-to-deliver p99 latency</strong> — measured by client-emitted timestamps. If this creeps from 300ms to 800ms, fanout is lagging or a gateway is unhealthy.</li>
          <li><strong>Inbox drain rate on reconnect</strong> — messages delivered per second from the inbox queue when a user comes online. If this drops, your inbox storage is degraded or a gateway is dropping reconnections.</li>
        </ul>
        <p>
          Connection count per gateway is a leading indicator: if one pod has 3x the average, something&apos;s broken in the LB&apos;s connection-draining policy and you&apos;re a redeploy away from a thundering herd.
        </p>

        <Callout variant="insight" title="What separates the good answer from the great answer">
          <p className="m-0">A good candidate draws the three layers and explains the send path. A great candidate also says: &quot;this design assumes messages are not E2E encrypted server-side. If they were, fanout couldn&apos;t score for spam, and search would have to happen on-device. We&apos;d push the spam-scoring upstream into a per-user model running on-device.&quot; That&apos;s the move that signals you&apos;ve thought about the next layer of constraints.</p>
        </Callout>

        <Quiz
          question="Why home-region conversations rather than letting any region accept any write?"
          options={[
            { label: "If any region could accept writes for any conversation, you'd need cross-region consensus on every send to maintain per-conversation order. That kills latency. Pinning a conversation to one region makes ordering local — only cross-region delivery has to traverse the WAN, and only for participants in other regions.", correct: true, explanation: "Right. Per-conversation ordering is the invariant we have to preserve, and that's much cheaper if all writes for a conversation hit the same region. Cross-region cost is then proportional to cross-region participation, not total send volume." },
            { label: "It's required by GDPR.", explanation: "Data residency rules can influence the decision but they're not the architectural reason — the architectural reason is preserving per-conversation order without cross-region consensus." },
            { label: "Cassandra can't replicate across regions.", explanation: "It can — Cassandra has multi-DC replication. The choice to home-region conversations is about latency and ordering, not capability." },
            { label: "Otherwise users couldn't message internationally.", explanation: "They can; cross-region messages just take longer for the cross-region hop. Home-regioning is about minimizing how often that hop happens, not whether it can." },
          ]}
          hint="What's the cost of cross-region consensus on every write?"
          xp={7}
        />

        <PartRecap
          title="Part 4 recap"
          gist="At staff level, the conversation extends beyond the core design: home-regioning, abuse handling on the message bus, and the two metrics that catch outages first."
          points={[
            { takeaway: "Conversations are home-regioned", detail: "Pin the primary region on creation. Writes route there; cross-region cost is bounded to cross-region participants only." },
            { takeaway: "Abuse handling rides the message bus", detail: "Spam scoring as a Kafka consumer. Doesn't touch the hot send path; verdicts feed back into per-user rate limits." },
            { takeaway: "Send-to-deliver p99 is the headline SLI", detail: "Measured from client-emitted timestamps end-to-end. Gateway connection count is the leading indicator." },
            { takeaway: "E2EE changes the upstream design", detail: "If messages are encrypted server-side, server-side spam scoring and search are gone. The architecture has to push that work to the client." },
          ]}
        />
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          A distributed rate limiter. The thing every chat system, payment system, and public API needs — and which everyone underestimates until they meet a hot key in Redis at 3am.
        </p>
        <Link
          href="/courses/system-design/modules/design-rate-limiter"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Design a distributed rate limiter →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="design-chat" />
    </article>
  );
}
