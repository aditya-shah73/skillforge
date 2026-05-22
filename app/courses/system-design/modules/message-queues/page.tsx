import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "semantics", title: "Delivery semantics" },
  { id: "ordering", title: "Ordering, DLQs, poison messages" },
  { id: "broker-choice", title: "SQS vs RabbitMQ vs Kafka" },
];

const atLeastOnceFlow = `sequenceDiagram
  participant P as Producer
  participant B as Broker
  participant C as Consumer
  P->>B: publish(msg-1)
  B-->>P: ack
  B->>C: deliver(msg-1)
  C->>C: process msg-1
  Note over C: Crash before ack
  B->>C: redeliver(msg-1) (after visibility timeout)
  C->>C: process msg-1 again
  C-->>B: ack
  Note over P,C: msg-1 was processed twice — consumer must be idempotent`;

export default function Page() {
  const mod = getModuleBySlug("message-queues")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="message-queues" />
        <ModuleProgress moduleSlug="message-queues" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📬</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The vocabulary and the tradeoffs. By the end you&apos;ll be able to defend a queue choice in a design review without hand-waving — delivery guarantees, ordering, dead-letter strategy, and the SQS / RabbitMQ / Kafka decision matrix on the merits.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>At-most-once vs at-least-once vs exactly-once — what each really means under failures</li>
          <li>Why &quot;exactly-once&quot; is a marketing term and idempotent consumers are the real fix</li>
          <li>Ordering guarantees: per-queue, per-key, total — and the cost of each</li>
          <li>Dead-letter queues, poison messages, retry storms</li>
          <li>SQS / RabbitMQ / Kafka — when each is obvious, and when it&apos;s a coin flip</li>
        </ul>
      </section>

      <section>
        <h2>Queues are buffers between things that fail at different times.</h2>
        <p>
          Every distributed system eventually needs a queue. The user clicks &quot;place order,&quot; the order needs to charge a card, send an email, update inventory, and warm a recommendation cache. Doing all of that synchronously means the user waits for five things, and any one failure breaks the whole click. Push four of those onto a queue and the click returns in 50ms — the rest happens reliably in the background, even when one consumer is broken or slow.
        </p>
        <p>
          The catch: queues introduce a new vocabulary you have to know cold. <em>Ack</em>, <em>nack</em>, <em>visibility timeout</em>, <em>at-least-once</em>, <em>poison message</em>, <em>DLQ</em>. Get any of these wrong and you ship one of the classic queue bugs — duplicates that charge users twice, lost messages on consumer crashes, ordering that mysteriously inverts under load.
        </p>
      </section>

      <Checkpoint moduleSlug="message-queues" id="semantics" title="Part 1 · Delivery semantics" xp={25}>
        <h3>The three guarantees, ranked by usefulness</h3>
        <ul>
          <li><strong>At-most-once</strong> — fire and forget. The producer sends; if the broker crashes mid-send or the consumer crashes mid-process, the message is gone. No retries, no duplicates. Use only when losing a message is genuinely acceptable (metrics, ephemeral logs).</li>
          <li><strong>At-least-once</strong> — the workhorse. Producer retries until the broker acks; consumer acks only after processing succeeds. If anything fails before the ack, the message is redelivered. Duplicates happen. Build idempotent consumers.</li>
          <li><strong>Exactly-once</strong> — &quot;the unicorn.&quot; Often technically achievable in narrow scenarios (Kafka transactions within Kafka, for example), almost never end-to-end across heterogeneous systems. In practice you achieve effectively-once via at-least-once delivery plus an idempotent consumer.</li>
        </ul>

        <Callout variant="warn" title="Exactly-once is a sales pitch most of the time">
          <p className="m-0">
            When a vendor advertises &quot;exactly-once delivery,&quot; read the fine print. It almost always means &quot;exactly-once within our system, between our producer client and our consumer client, when both opt in.&quot; The moment your consumer writes to a database, calls another service, or sends an email, you&apos;re back to needing idempotency. Don&apos;t let &quot;exactly-once&quot; checkboxes lull you into skipping idempotent design.
          </p>
        </Callout>

        <h3>Why at-least-once is the default</h3>
        <p>
          The flow is: producer sends, broker stores durably, broker delivers to consumer, consumer processes, consumer acks, broker deletes. The ack is at the end — that&apos;s the trick. If the consumer crashes after processing but before acking, the broker hasn&apos;t deleted the message. After a <em>visibility timeout</em> (SQS) or <em>redelivery timeout</em> (RabbitMQ, Kafka via offset), the broker hands the message to another consumer. That consumer processes it again. Duplicate.
        </p>
        <Mermaid chart={atLeastOnceFlow} />

        <p>
          The alternative — ack <em>before</em>{" "}processing — gives you at-most-once. Crash after the ack but before processing, and the message is gone forever. That&apos;s rarely what you want.
        </p>

        <h3>Idempotent consumers: the actual answer</h3>
        <p>
          Since at-least-once is the default and exactly-once is a fairy tale, your consumers must handle duplicates. Two patterns dominate:
        </p>
        <ul>
          <li><strong>Idempotency keys.</strong>{" "}The producer stamps each message with a unique ID. The consumer records processed IDs in a deduplication table; before doing the side effect, it checks the table. (See the api-design module for the same pattern at the HTTP layer.)</li>
          <li><strong>Naturally-idempotent operations.</strong>{" "}Some operations are safe to repeat. <code>UPDATE accounts SET status = &apos;CLOSED&apos; WHERE id = ?</code> is idempotent — running it twice has the same effect as running it once. <code>UPDATE accounts SET balance = balance - 100 WHERE id = ?</code> is NOT idempotent. Reshape operations to be naturally idempotent when you can.</li>
        </ul>

        <CodeBlock lang="java">{`@Service
public class OrderEventConsumer {

  private final ProcessedEventRepo processedEvents;
  private final OrderService orders;
  private final TransactionTemplate tx;

  @SqsListener("order-events")
  public void handle(OrderEvent event, @Header("MessageId") String msgId) {
    // The producer stamps eventId; we use it as the dedup key.
    String dedupKey = event.eventId();

    tx.executeWithoutResult(status -> {
      if (processedEvents.existsByKey(dedupKey)) {
        log.info("duplicate event {}, skipping", dedupKey);
        return;
      }
      orders.apply(event);                         // the side effect
      processedEvents.save(new ProcessedEvent(dedupKey, Instant.now()));
    });
  }
}`}</CodeBlock>

        <Callout variant="spring" title="Why the dedup write and the side effect MUST share a transaction">
          <p className="m-0">
            If you write the dedup row first, then the side effect, and crash in between — next delivery sees the dedup row and skips processing. Lost message. If you do the side effect first and crash before the dedup write — next delivery does the side effect again. Duplicate. The atomic option: do both in the same database transaction. (For cross-system side effects like sending an email, you need an outbox pattern — covered in the event-driven module.)
          </p>
        </Callout>

        <h3>Producer-side: how messages get lost</h3>
        <p>
          Even before the consumer side, you can lose messages between producer and broker. The defenses:
        </p>
        <ul>
          <li><strong>Synchronous publish with broker ack.</strong>{" "}Don&apos;t fire-and-forget — wait for the broker to confirm durable receipt. Throughput drops; reliability goes way up.</li>
          <li><strong>Persistent / durable messages.</strong>{" "}Mark messages so the broker writes them to disk before acking. The default in some brokers is in-memory only.</li>
          <li><strong>Producer retries with backoff.</strong>{" "}If the broker is briefly unreachable, retry. Idempotency keys prevent duplicates if the broker received the first attempt but the ack got lost.</li>
          <li><strong>Transactional outbox.</strong>{" "}Write the message to your own database in the same transaction as the business state, then a separate process publishes from the outbox. Bullet-proof but adds operational complexity.</li>
        </ul>

        <Quiz
          question="Your team chose 'exactly-once' delivery in the message broker because the docs said it was supported. Production sees occasional duplicate side effects (emails sent twice). The team is confused. What's the most likely explanation?"
          options={[
            { label: "The broker is broken — file a vendor support ticket.", explanation: "Almost never the issue. The vendor's exactly-once is doing what it advertises; the bug is in the consumer." },
            { label: "Exactly-once usually applies inside the broker’s boundaries; once the consumer makes an external call (send email, write to a different system), duplicates can happen.", correct: true, explanation: "Right. The broker can guarantee exactly-once delivery to the consumer, but it has no control over what the consumer does after that. Side effects against external systems require the consumer to be idempotent." },
            { label: "The producer is sending the message twice.", explanation: "Possible, but the broker's exactly-once mode usually deduplicates producer retries — the issue is downstream of the broker." },
            { label: "Network duplication is happening at the TCP layer.", explanation: "TCP doesn't deliver duplicates to the application — that's not a real failure mode here." },
          ]}
        />

        <Quiz
          question="You write the dedup record AFTER the side effect, in a separate transaction. The consumer crashes after the side effect but before writing the dedup. On retry, the consumer runs again. What happens?"
          options={[
            { label: "Nothing — the broker won’t redeliver since the message is in flight.", explanation: "The broker WILL redeliver after the visibility/redelivery timeout because it never got the ack." },
            { label: "The side effect happens twice — duplicate. Order them in one transaction or use natural idempotency.", correct: true, explanation: "Right. Splitting the side effect from the dedup record creates a window where a crash means duplicates. The fix: same transaction (when possible) or use an outbox / naturally-idempotent operation." },
            { label: "The dedup record blocks the second run.", explanation: "There is no dedup record yet — the crash happened before that write." },
            { label: "The broker auto-detects the duplicate.", explanation: "Brokers don't know about your business-level deduplication — that's the consumer's job." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist={`At-least-once is the default. Build idempotent consumers; treat "exactly-once" claims with skepticism.`}
          points={[
            { takeaway: "At-most-once loses messages on failure. At-least-once duplicates them. Exactly-once is rarely truly end-to-end.", detail: "The realistic spectrum is at-most-once for ephemeral data and at-least-once + idempotency everywhere else. “Exactly-once” in vendor docs almost always means within their system boundaries." },
            { takeaway: "Ack only after processing succeeds.", detail: "Acking before processing converts the queue from at-least-once to at-most-once — you’ll lose messages on consumer crashes, with no broker-side defense." },
            { takeaway: "Dedup write and side effect must be atomic, or you have a duplicate / loss window.", detail: "Same database transaction is the simplest fix for in-database side effects. For cross-system effects, use the transactional outbox pattern." },
            { takeaway: "Reshape operations to be naturally idempotent when possible.", detail: "“Set status to CLOSED” is idempotent. “Decrement balance by 100” is not. Producers can stamp idempotency keys; consumers should still prefer operations that are safe to retry without keys." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="message-queues" id="ordering" title="Part 2 · Ordering, DLQs, poison messages" xp={30}>
        <h3>Ordering: the most lied-about guarantee</h3>
        <p>
          &quot;FIFO queue&quot; sounds like total ordering — first in, first out. Read the docs and you&apos;ll find the truth is more nuanced. Three useful tiers:
        </p>
        <ul>
          <li><strong>No ordering.</strong>{" "}Messages can arrive in any order. Default for SQS standard, Kafka without keying, RabbitMQ with multiple consumers on one queue. Cheapest and most parallelizable.</li>
          <li><strong>Per-key ordering.</strong>{" "}All messages with the same key are ordered relative to each other; different keys can interleave. This is the sweet spot — Kafka achieves it via partitioning, SQS FIFO via <code>MessageGroupId</code>.</li>
          <li><strong>Total ordering.</strong>{" "}All messages globally ordered. Hard to scale — you&apos;re back to a single consumer or a single partition. Reserve for narrow cases (single-writer ledger).</li>
        </ul>

        <Callout variant="insight" title="Per-key ordering is almost always what you actually need">
          <p className="m-0">
            Most &quot;we need ordered messages&quot; requirements are really &quot;events for the same entity must be applied in order.&quot; You don&apos;t need order ID 5&apos;s events to come before order ID 6&apos;s — you just need order ID 5&apos;s &quot;created&quot; event to come before its &quot;paid&quot; event. Key by entity ID and you get the ordering you need at full parallelism.
          </p>
        </Callout>

        <h3>Why parallelism breaks ordering</h3>
        <p>
          You can&apos;t have N consumers competing on a single queue and preserve order. The moment two consumers pull messages 1 and 2 in parallel, message 2&apos;s processing can finish first. The fixes are all variations on the same idea: <strong>route messages that need to be ordered to the same consumer</strong>.
        </p>
        <ul>
          <li><strong>Kafka:</strong>{" "}partition by key. Same key → same partition → one consumer at a time → ordered.</li>
          <li><strong>SQS FIFO:</strong> <code>MessageGroupId</code>. Same group → one consumer at a time → ordered. Different groups can be processed in parallel.</li>
          <li><strong>RabbitMQ:</strong>{" "}single consumer per queue, OR <em>consistent hash exchange</em>{" "}to route by key.</li>
        </ul>

        <h3>The visibility timeout / redelivery timeout</h3>
        <p>
          When a consumer pulls a message, the broker hides it from other consumers for a window — the <strong>visibility timeout</strong>{" "}in SQS, the <strong>ack deadline</strong>{" "}in Pub/Sub, the equivalent of consumer-group offset lag in Kafka. If the consumer doesn&apos;t ack within that window, the broker assumes it crashed and redelivers.
        </p>
        <p>
          Set it too short: a slow message gets redelivered while still being processed. You now have two consumers doing the same work. Set it too long: a real consumer crash means the message sits idle for that whole window before retry. The right answer is &quot;a bit longer than your worst-case processing time, with explicit heartbeat extensions for genuinely long jobs.&quot;
        </p>

        <h3>Dead-letter queues (DLQs): the safety net</h3>
        <p>
          A poison message is one that always fails to process. Without a DLQ, your consumers redeliver it forever, blocking the queue. With a DLQ, after N retries the message is moved to a separate queue for human inspection.
        </p>
        <CodeBlock lang="plain">{`# AWS SQS: configure a redrive policy on the main queue
RedrivePolicy:
  deadLetterTargetArn: arn:aws:sqs:us-east-1:123456789012:order-events-dlq
  maxReceiveCount: 5      # after 5 failed deliveries, ship to DLQ`}</CodeBlock>

        <p>
          What goes in the DLQ tells you a lot about your system:
        </p>
        <ul>
          <li><strong>Bad data.</strong>{" "}Producer sent something the consumer can&apos;t parse (schema drift). Fix the producer or the consumer; replay from DLQ once fixed.</li>
          <li><strong>Transient downstream failure.</strong>{" "}A dependency was down longer than your retry budget. Replay when the dependency is back.</li>
          <li><strong>Code bug.</strong>{" "}The consumer crashes on certain inputs. Fix, deploy, replay.</li>
        </ul>

        <Callout variant="warn" title="DLQs without alerts are write-only stores">
          <p className="m-0">
            Every DLQ needs an alert on &quot;message count &gt; 0.&quot; Otherwise the team finds out about the silent backlog three weeks later when a customer complains. Bonus: a dashboard that breaks down DLQ messages by error type.
          </p>
        </Callout>

        <h3>Retry storms and exponential backoff</h3>
        <p>
          Without backoff, a transient downstream blip causes every consumer to retry instantly, in lockstep, hammering the (already-struggling) downstream service into a hard outage. The retry pattern that actually works:
        </p>
        <ul>
          <li><strong>Exponential backoff:</strong> 1s, 2s, 4s, 8s, 16s — doubling each time.</li>
          <li><strong>Jitter:</strong>{" "}add randomness so retries from different consumers spread out instead of synchronizing.</li>
          <li><strong>Cap on retries:</strong>{" "}after N attempts, ship to DLQ. Forever-retrying is a self-DDoS.</li>
        </ul>

        <CodeBlock lang="java">{`@Configuration
public class SqsListenerConfig {

  @Bean
  public SqsListenerContainerFactory<?> listenerFactory(SqsAsyncClient sqs) {
    return SqsListenerContainerFactory.builder()
        .sqsAsyncClient(() -> sqs)
        .configure(o -> o
            // Long-poll: wait up to 20s for messages
            .pollTimeout(Duration.ofSeconds(20))
            // Visibility timeout: longer than expected processing time
            .messageVisibility(Duration.ofMinutes(2))
            // Per-listener concurrency
            .maxConcurrentMessages(10))
        .build();
  }
}`}</CodeBlock>

        <Quiz
          question="Your team needs ordered processing of order events: 'created' must be processed before 'paid' for any given order. Throughput target: 5000 events/sec across millions of orders. What's the right ordering strategy?"
          options={[
            { label: "Single queue, single consumer — total ordering.", explanation: "Total ordering caps throughput at one consumer's capacity — well below 5000/sec for any non-trivial processing." },
            { label: "Kafka with partition key = order_id; consumers in a consumer group, one consumer per partition.", correct: true, explanation: "Right. Per-key ordering gives you full parallelism (one consumer per partition, many partitions) while guaranteeing that all events for the same order_id arrive in order. The standard pattern." },
            { label: "SQS standard with N parallel consumers.", explanation: "SQS standard offers no ordering. You'd see 'paid' processed before 'created' regularly." },
            { label: "Send all events to all consumers; consumers filter to their own.", explanation: "That's broadcast, not partitioned consumption — every consumer does N times the work, and you still have ordering issues per consumer." },
          ]}
        />

        <Quiz
          question="A message is poisoning your queue — every consumer that picks it up crashes on a parsing error. The queue is backing up. What's the right action sequence?"
          options={[
            { label: "Lower the visibility timeout so the message redelivers faster.", explanation: "That makes the storm worse — faster redeliveries of an unprocessable message, more crashes." },
            { label: "Restart all consumers.", explanation: "They'll crash again on the same message. The bad message has to be diverted, not the consumers restarted." },
            { label: "Make sure the DLQ redrive policy is set with a finite maxReceiveCount, so the poison message moves to the DLQ. Investigate from there.", correct: true, explanation: "Right. The DLQ exists for exactly this — bound the retries, ship the poison to the side, keep the main queue flowing. Then debug the bad message in the DLQ at your leisure." },
            { label: "Acknowledge the message manually to drop it.", explanation: "That loses the message permanently and forfeits the chance to debug or replay. The DLQ is the right destination." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Ordering and parallelism trade off. DLQs and exponential backoff with jitter are non-negotiable in production."
          points={[
            { takeaway: "Per-key ordering is what most “we need order” requirements actually mean.", detail: "Key by the entity (order ID, account ID, user ID). Same key → same partition / message group → ordered. Different keys → parallel. Throughput stays high." },
            { takeaway: "Visibility timeout = a bit longer than worst-case processing.", detail: "Too short and you get duplicate work from premature redelivery; too long and consumer crashes mean idle messages. Heartbeat extension is for genuinely long-running jobs." },
            { takeaway: "DLQs catch poison messages; without them, queues stall forever.", detail: "Set maxReceiveCount on the redrive policy. Alert on DLQ depth. Investigate per error class. Replay after fixing." },
            { takeaway: "Exponential backoff with jitter — every retry path needs both.", detail: "Without jitter, retries synchronize and amplify the downstream outage. Without backoff, transient errors become DDoS." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="message-queues" id="broker-choice" title="Part 3 · SQS vs RabbitMQ vs Kafka" xp={30}>
        <h3>The decision matrix, in one table</h3>
        <table className="text-sm">
          <thead>
            <tr><th>Property</th><th>SQS</th><th>RabbitMQ</th><th>Kafka</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Model</strong></td>
              <td>Hosted queue</td>
              <td>AMQP broker (exchanges + queues)</td>
              <td>Distributed log</td>
            </tr>
            <tr>
              <td><strong>Ops cost</strong></td>
              <td>Zero — fully managed</td>
              <td>Moderate — clusters, plugins</td>
              <td>High — ZK/KRaft, partitions, ISRs</td>
            </tr>
            <tr>
              <td><strong>Throughput</strong></td>
              <td>High (millions/sec aggregate)</td>
              <td>Moderate (50–100k msg/sec/queue)</td>
              <td>Very high (millions/sec/cluster)</td>
            </tr>
            <tr>
              <td><strong>Ordering</strong></td>
              <td>None (Standard) / Per-group (FIFO)</td>
              <td>Per-queue (one consumer)</td>
              <td>Per-partition (per-key)</td>
            </tr>
            <tr>
              <td><strong>Retention</strong></td>
              <td>Up to 14 days</td>
              <td>Until consumed</td>
              <td>Configurable (days, months, forever)</td>
            </tr>
            <tr>
              <td><strong>Replay</strong></td>
              <td>No (consumed = gone)</td>
              <td>No</td>
              <td>Yes (rewind by offset)</td>
            </tr>
            <tr>
              <td><strong>Routing</strong></td>
              <td>Simple: one queue, many consumers</td>
              <td>Rich: direct, topic, fanout, headers</td>
              <td>Topic + partition</td>
            </tr>
            <tr>
              <td><strong>Best for</strong></td>
              <td>Async work in AWS, simple decoupling</td>
              <td>Complex routing, low-throughput workflows</td>
              <td>Event streaming, replay, analytics</td>
            </tr>
          </tbody>
        </table>

        <h3>SQS: the &quot;just give me a queue&quot; queue</h3>
        <p>
          Two flavors: <strong>Standard</strong> (no ordering, at-least-once, near-infinite throughput) and <strong>FIFO</strong> (ordered per group, exactly-once dedup window of 5 minutes, lower throughput). Fully managed — no broker to operate, no clusters to scale, no version upgrades.
        </p>
        <p>
          When SQS is obvious: you&apos;re in AWS, you need a buffer between two services, you don&apos;t need replay, you don&apos;t need fancy routing. Cost scales with messages, not with idle infrastructure. The price you pay: no replay, 14-day max retention, no rich routing.
        </p>
        <CodeBlock lang="java">{`@Service
public class OrderProducer {
  private final SqsTemplate sqs;

  public void publish(OrderEvent event) {
    sqs.send(to -> to
        .queue("order-events")
        .payload(event)
        // FIFO requires both group and dedup keys
        .header("MessageGroupId", event.orderId())
        .header("MessageDeduplicationId", event.eventId()));
  }
}

@Component
public class OrderConsumer {
  @SqsListener("order-events")
  public void handle(OrderEvent event) {
    // process — manual ack happens on successful return
  }
}`}</CodeBlock>

        <h3>RabbitMQ: the routing-rich AMQP veteran</h3>
        <p>
          RabbitMQ&apos;s superpower is the <strong>exchange</strong>: a routing layer between producer and queue. Producers publish to exchanges; exchanges route to queues based on rules (direct match, topic pattern, fanout, header conditions). One event can fan out to ten different consumers, each filtering on its own pattern, with no producer changes.
        </p>
        <ul>
          <li><strong>Direct exchange:</strong>{" "}route by exact key match. <code>order.created</code> → queue A.</li>
          <li><strong>Topic exchange:</strong>{" "}route by wildcard pattern. <code>order.*</code> matches <code>order.created</code>, <code>order.paid</code>, etc.</li>
          <li><strong>Fanout exchange:</strong>{" "}ignore the key, broadcast to every bound queue.</li>
          <li><strong>Headers exchange:</strong>{" "}route by AMQP header values instead of routing key.</li>
        </ul>

        <p>
          When RabbitMQ is the right call: complex routing, low-to-moderate throughput (tens of thousands per second per queue), no replay needed, you can run brokers. Common in microservices doing &quot;event A goes to services 1, 3, and 5, but not 2 or 4.&quot;
        </p>

        <Callout variant="insight" title="RabbitMQ for routing, Kafka for replay">
          <p className="m-0">
            A useful heuristic: if your team thinks of messages as &quot;tasks to do,&quot; you probably want RabbitMQ. If they think of messages as &quot;facts that happened, that I might want to re-derive views from,&quot; you want Kafka. Both can do both, but each is shaped for one of the two.
          </p>
        </Callout>

        <h3>Kafka: the distributed log</h3>
        <p>
          Kafka isn&apos;t really a queue — it&apos;s an append-only log that consumers read by tracking their own offset. Messages aren&apos;t deleted on consumption; they age out by retention policy (7 days, 30 days, forever). This unlocks two superpowers RabbitMQ and SQS can&apos;t match:
        </p>
        <ul>
          <li><strong>Replay.</strong>{" "}Re-derive a downstream view by replaying every event from offset 0. Backfill new services. Test with production data.</li>
          <li><strong>Multiple consumer groups, independent offsets.</strong>{" "}Service A and Service B both read every event in topic <code>orders</code>, but each tracks its own progress. No producer changes when a new consumer group joins.</li>
        </ul>

        <p>
          The cost: high operational complexity (broker clusters, partitioning, replication factor, ISR tuning), and a much steeper learning curve. Use Kafka when you genuinely need event streaming — not just async work. The next module covers Kafka in depth.
        </p>

        <h3>Picking, on the merits</h3>
        <ul>
          <li><strong>You&apos;re in AWS, you need a buffer, you don&apos;t need replay or rich routing</strong> → SQS.</li>
          <li><strong>You need rich routing (one event to many filtered consumers), throughput is moderate, you&apos;re fine running brokers</strong> → RabbitMQ.</li>
          <li><strong>You need replay, retention beyond a week, very high throughput, or you&apos;re doing event streaming / event sourcing / CQRS</strong> → Kafka.</li>
          <li><strong>You&apos;re unsure</strong> → start with SQS. Migrating from SQS to Kafka later is annoying but tractable; running Kafka before you need it is expensive forever.</li>
        </ul>

        <ClassifyChallenge
          title="Pick the broker"
          prompt="Match each workload to the broker that fits best on the merits. There's a reasonable answer for each — argue with yourself when you disagree."
          buckets={[
            { id: "sqs", label: "SQS", color: "amber" },
            { id: "rabbit", label: "RabbitMQ", color: "rose" },
            { id: "kafka", label: "Kafka", color: "indigo" },
          ]}
          items={[
            { id: "thumbnails", label: "Image upload triggers thumbnail generation. Workers process in parallel. Order doesn’t matter, no replay needed, team is on AWS.", answer: "sqs", explanation: "Classic async-work-in-AWS use case. SQS Standard handles it with zero ops." },
            { id: "audit-stream", label: "Every business event must be retained for 30 days, with multiple downstream consumers (search index, analytics, audit log) each reading at their own pace.", answer: "kafka", explanation: "Multi-consumer, long retention, independent offsets. Exactly Kafka’s shape." },
            { id: "complex-routing", label: "Order events go to 6 different services based on event type and tenant. Throughput is ~10k/sec. Each service wants its own filtered view; replay is not a requirement.", answer: "rabbit", explanation: "Topic exchanges + per-service queues with bindings. RabbitMQ excels at this; Kafka would force every consumer to filter the full stream." },
            { id: "ledger-replay", label: "Financial ledger: every transaction must be retained forever, and we need to rebuild reporting databases by replaying from the beginning.", answer: "kafka", explanation: "Forever retention, replay, append-only log semantics. Kafka or a similar log-based system." },
            { id: "saga", label: "Multi-step workflow with compensating actions: each step is a discrete task with retries. Throughput is low (hundreds/sec). Team owns 1 RabbitMQ cluster already.", answer: "rabbit", explanation: "Routing-rich, low-throughput, task-shaped. The existing cluster reduces ops cost to near zero. Don’t add another broker." },
            { id: "fan-out-low", label: "Internal AWS service publishes ~50 messages/sec; one consumer service handles them; team has no platform engineers.", answer: "sqs", explanation: "Tiny throughput, one consumer, no ops capacity. SQS is the ‘don’t overthink it’ answer." },
          ]}
        />

        <Quiz
          question="A team picks Kafka for an internal task queue: '50 events/sec, one consumer service, no replay needed.' What's the most likely outcome?"
          options={[
            { label: "Kafka handles it perfectly with no operational concerns.", explanation: "Technically yes, but the team is now committing to operating Kafka — clusters, partitions, version upgrades — for a workload that doesn't justify it." },
            { label: "The team will spend more time operating Kafka than building features; SQS or even RabbitMQ would have been a better fit for this scale.", correct: true, explanation: "Right. Kafka's operational complexity has a fixed cost regardless of throughput. At 50 events/sec with one consumer and no replay, you pay all the cost and reap none of the benefit. Right-size the broker to the workload." },
            { label: "Kafka will refuse to start with such low throughput.", explanation: "Kafka doesn't care about workload size — it's the team that pays the operational cost." },
            { label: "Kafka requires at least 10k messages/sec to function.", explanation: "Not technically true; the issue is operational ROI, not a hard floor." },
          ]}
        />

        <Quiz
          question="You need exactly-once-style processing across SQS and a downstream HTTP API. The HTTP API is owned by another team. What's the cleanest design?"
          options={[
            { label: "Use SQS FIFO and trust the 5-minute dedup window end-to-end.", explanation: "FIFO dedup only protects producer-side duplicates within 5 minutes. It doesn't help with consumer-side retries against the HTTP API." },
            { label: "Stamp each message with an idempotency key. Consumer passes the key to the HTTP API as Idempotency-Key header. The other team makes their endpoint idempotent on that key.", correct: true, explanation: "Right. End-to-end idempotency requires cooperation across systems. The producer stamps the key, the consumer relays it, the receiving service deduplicates. Same pattern as the api-design module." },
            { label: "Increase the SQS visibility timeout to 1 hour to prevent retries.", explanation: "Doesn't help — eventual retries still happen, and now slow consumers stall messages for an hour after a crash." },
            { label: "Switch to Kafka, which guarantees exactly-once.", explanation: "Kafka exactly-once works within Kafka. Side effects against an external HTTP API still need consumer-side idempotency." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Pick the broker for the workload, not for the buzzword. SQS for managed simple, RabbitMQ for routing, Kafka for streaming and replay."
          points={[
            { takeaway: "SQS: fully managed, dirt simple, great in AWS. No replay, basic ordering, 14-day max retention.", detail: "Standard for at-least-once high throughput, FIFO when you need per-group ordering. The default for “I just need a queue” in AWS." },
            { takeaway: "RabbitMQ: rich routing via exchanges. Best for “one event, many filtered consumers” at moderate scale.", detail: "Topic exchanges + bindings let you fan out to filtered queues without touching producers. Operational cost is real but tractable for one cluster." },
            { takeaway: "Kafka: append-only log, replay, retention. Use when you need event streaming, not just async work.", detail: "Replay, multi-consumer-group independent offsets, long retention. Pay the operational cost only when you genuinely need these capabilities." },
            { takeaway: "Right-size the broker to the workload — don’t pick Kafka because it’s on the trend list.", detail: "50 events/sec with one consumer doesn’t justify a Kafka cluster. The broker decision is about lifecycle cost, not just feature checklist." },
          ]}
        />
      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <h3 className="font-bold text-lg mt-0 mb-2">Up next</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          You&apos;ve picked Kafka for the workloads that need it. The next module goes deep on how Kafka actually works — partitions, consumer groups, offsets, and exactly-once with Spring Kafka. <Link href="/courses/system-design/modules/kafka-deep" className="text-cyan-600 hover:underline">Kafka deep dive →</Link>
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="message-queues" />
    </article>
  );
}
