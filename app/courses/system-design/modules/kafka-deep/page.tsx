import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "model", title: "The log model" },
  { id: "consumers", title: "Consumer groups & offsets" },
  { id: "exactly-once", title: "Exactly-once with Spring Kafka" },
];

const partitionDiagram = `flowchart LR
  P[Producer] --> T{Topic: orders}
  T --> P0[Partition 0<br/>append-only log]
  T --> P1[Partition 1<br/>append-only log]
  T --> P2[Partition 2<br/>append-only log]
  P0 --> C0[Consumer A<br/>in group X]
  P1 --> C1[Consumer B<br/>in group X]
  P2 --> C0
  P0 --> C2[Consumer C<br/>in group Y]
  P1 --> C2
  P2 --> C2`;

const eosFlow = `sequenceDiagram
  participant P as Producer (txn)
  participant K as Kafka (input topic)
  participant C as Consumer-Producer (txn)
  participant K2 as Kafka (output topic + offsets)
  P->>K: send msg-1 (idempotent)
  K-->>P: ack
  C->>K: poll msg-1
  C->>C: begin transaction
  C->>K2: produce result + commit offsets atomically
  K2-->>C: txn commit OK
  Note over C,K2: read_committed consumers see only committed records`;

export default function Page() {
  const mod = getModuleBySlug("kafka-deep")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="kafka-deep" />
        <ModuleProgress moduleSlug="kafka-deep" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📚</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Kafka isn&apos;t a queue, it&apos;s a partitioned, replicated, append-only log. By the end you&apos;ll know how producers, partitions, and consumer groups actually compose — and how to wire up Spring Kafka with real exactly-once semantics for read-process-write pipelines.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Topics, partitions, replication, ISR — the storage model</li>
          <li>Producer acks, idempotent producer, ordering pitfalls</li>
          <li>Consumer groups, offsets, the auto-commit footgun</li>
          <li>Exactly-once with the transactional producer + read_committed isolation</li>
          <li>Spring Kafka: <code>@KafkaListener</code>, <code>KafkaTransactionManager</code>, container ack modes</li>
        </ul>
      </section>

      <section>
        <h2>Kafka stores facts, not tasks.</h2>
        <p>
          The single biggest mental shift with Kafka is that consuming a message doesn&apos;t delete it. The broker never knows or cares whether anyone has read a record. Records sit in the log, ordered by offset, until retention age them out. Consumers maintain their own read position — and the broker happily lets them rewind, replay, or fork off independent positions.
        </p>
        <p>
          That property is what makes Kafka feel different. It&apos;s not a smarter SQS. It&apos;s closer to a write-ahead log you can build derived state from — a database&apos;s commit log, except you can plug arbitrary consumers into it. Once that clicks, the rest of Kafka follows.
        </p>
      </section>

      <Checkpoint moduleSlug="kafka-deep" id="model" title="Part 1 · The log model" xp={25}>
        <h3>Topics, partitions, segments</h3>
        <p>
          A <strong>topic</strong> is a logical category, like <code>orders</code>. Inside a topic are one or more <strong>partitions</strong>, each an independent append-only log. Each partition lives on disk as a series of <strong>segment files</strong>; old segments age out by retention policy.
        </p>
        <p>
          Producers append to the tail of a partition. Each record gets an <strong>offset</strong> — a monotonically increasing integer that identifies its position. Within a single partition, ordering is total. Across partitions, there is no ordering.
        </p>
        <Mermaid chart={partitionDiagram} />

        <h3>Picking the partition: keys are everything</h3>
        <p>
          When a producer publishes a record, it can specify a key. The default partitioner does <code>hash(key) % numPartitions</code> to pick a partition. Same key → same partition → ordered. No key → round-robin across partitions → no ordering across the topic.
        </p>
        <p>
          The partition key is the single most consequential design choice in Kafka. Pick the wrong key and you get hot partitions (one user generates 90% of traffic, that partition&apos;s consumer is overwhelmed) or you give up the per-key ordering you actually needed.
        </p>

        <Callout variant="warn" title="Partition count is sticky">
          <p className="m-0">
            You can add partitions later, but adding partitions changes the hash mapping for keys — records that used to land in partition 3 may now land in partition 5. Per-key ordering across the resize boundary breaks. Plan partition count up front: enough for current and projected throughput, plus headroom for consumer parallelism. Common starting point: 2–4× peak consumer count.
          </p>
        </Callout>

        <h3>Replication and ISRs</h3>
        <p>
          Each partition has a <strong>replication factor</strong> (typical: 3). One replica is the <strong>leader</strong>; the others are <strong>followers</strong> that pull from the leader. Producers write to the leader; the leader replicates to followers.
        </p>
        <p>
          The set of replicas that are caught up with the leader is the <strong>in-sync replicas</strong> (ISR). When the leader fails, Kafka elects a new leader from the ISR. Replicas that fall too far behind are kicked out of the ISR until they catch up.
        </p>
        <p>
          The producer <code>acks</code> setting controls when a write is considered successful:
        </p>
        <ul>
          <li><code>acks=0</code> — fire and forget. The producer doesn&apos;t wait for any ack. Lowest latency, can lose records.</li>
          <li><code>acks=1</code> — leader has the record (in memory). If the leader crashes before replicating, lost.</li>
          <li><code>acks=all</code> (or <code>-1</code>) — all in-sync replicas have the record. Combined with <code>min.insync.replicas=2</code>, you get strong durability: a record is only acked when at least two replicas have it, so a single broker failure never loses data.</li>
        </ul>

        <Callout variant="spring" title="Production producer config: acks=all + min.insync.replicas=2 + idempotent">
          <p className="m-0">
            For any topic that matters, use <code>acks=all</code> with <code>min.insync.replicas=2</code> (assuming RF=3). Pair with <code>enable.idempotence=true</code> to avoid duplicate appends from producer retries. Throughput drops a few percent — durability goes way up. The default is fine for development, never for production.
          </p>
        </Callout>

        <h3>The idempotent producer</h3>
        <p>
          When a producer&apos;s send fails, the client retries. But the failure could be on the request (record never made it) or on the ack (record made it, ack got lost). Without protection, retries cause duplicate appends.
        </p>
        <p>
          Set <code>enable.idempotence=true</code> and Kafka assigns each producer a Producer ID and tags every record with a sequence number. The broker rejects out-of-order or duplicate sequence numbers from the same producer. Result: at-least-once becomes effectively-once <em>at the producer-broker boundary</em>.
        </p>

        <CodeBlock lang="java">{`@Configuration
public class ProducerConfig {

  @Bean
  public ProducerFactory<String, OrderEvent> producerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(BOOTSTRAP_SERVERS_CONFIG, "kafka1:9092,kafka2:9092,kafka3:9092");
    props.put(KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    props.put(VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

    // Production durability + idempotence
    props.put(ACKS_CONFIG, "all");
    props.put(ENABLE_IDEMPOTENCE_CONFIG, true);
    props.put(MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5); // safe with idempotence
    props.put(RETRIES_CONFIG, Integer.MAX_VALUE);
    props.put(DELIVERY_TIMEOUT_MS_CONFIG, 120_000);

    // Compression for throughput
    props.put(COMPRESSION_TYPE_CONFIG, "lz4");

    return new DefaultKafkaProducerFactory<>(props);
  }

  @Bean
  public KafkaTemplate<String, OrderEvent> kafkaTemplate(
      ProducerFactory<String, OrderEvent> pf) {
    return new KafkaTemplate<>(pf);
  }
}`}</CodeBlock>

        <CodeBlock lang="java">{`@Service
public class OrderProducer {

  private final KafkaTemplate<String, OrderEvent> kafka;

  public CompletableFuture<SendResult<String, OrderEvent>> publish(OrderEvent event) {
    // Key by orderId — same order's events go to same partition (ordering)
    return kafka.send("orders", event.orderId(), event)
        .whenComplete((result, ex) -> {
          if (ex != null) {
            log.error("publish failed for order {}", event.orderId(), ex);
          } else {
            log.debug("published order={} partition={} offset={}",
                event.orderId(),
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
          }
        });
  }
}`}</CodeBlock>

        <h3>Why <code>max.in.flight.requests.per.connection</code> matters</h3>
        <p>
          Without idempotence, having &gt; 1 in-flight request can reorder records on retry: send 1, 2, 3 → 2 succeeds, 1 fails and retries → 1 lands after 2. Idempotence fixes this by tracking sequence numbers, so up to 5 in-flight is safe with idempotence on. Without idempotence, set it to 1 if order matters — at the cost of throughput.
        </p>

        <Quiz
          question="A Kafka topic has 6 partitions. Producer publishes records keyed by user_id. 80% of traffic comes from user_id=A. What's the failure mode?"
          options={[
            { label: "Records are dropped because the partition can’t keep up.", explanation: "Kafka doesn't drop — it backs up. The disk fills, lag grows on the consumer of that partition." },
            { label: "Hot partition: one partition takes 80% of the load, its consumer is overwhelmed, lag grows on that partition while others are idle.", correct: true, explanation: "Right. Per-key ordering means user A's records all go to one partition. The partition's consumer is the bottleneck, even though other consumers are sitting idle. Either change the key (lose per-user ordering), shard the user (user_id + bucket), or pre-aggregate before publishing." },
            { label: "Kafka rebalances automatically.", explanation: "Kafka doesn't redistribute records by load — partition mapping is hash-based and deterministic." },
            { label: "All consumers process every record.", explanation: "That's broadcast, not consumer-group consumption — each record goes to one consumer in the group." },
          ]}
        />

        <Quiz
          question="You set acks=1 and min.insync.replicas=1 on a critical topic 'because performance.' What's the durability story?"
          options={[
            { label: "Strong: replication factor of 3 still protects you.", explanation: "Replication only protects you if records have been replicated. acks=1 returns success as soon as the leader has the record in memory — before any follower sees it." },
            { label: "Weak: a leader crash before replication causes data loss. The replicas can’t recover what they never received.", correct: true, explanation: "Right. acks=1 + leader crash before replication = lost record. acks=all + min.insync.replicas=2 + RF=3 is the production-safe combination — at least two replicas have the record before the producer sees an ack." },
            { label: "Identical to acks=all.", explanation: "Not at all — acks=1 only waits for the leader, acks=all waits for all in-sync replicas." },
            { label: "Kafka detects this misconfig at startup.", explanation: "Kafka trusts your config. It will run, and you'll find out about the durability hole the first time a leader crashes." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Kafka is a partitioned replicated log. The partition key, the replication settings, and the producer config decide your durability and ordering."
          points={[
            { takeaway: "A topic is N independent logs (partitions). Records have offsets within a partition; order is per-partition only.", detail: "Pick the partition key carefully — same key → same partition → ordered. Wrong key gives you hot partitions or breaks ordering." },
            { takeaway: "Replication + ISR + acks decide durability. Production = acks=all, min.insync.replicas=2, RF=3.", detail: "acks=1 returns success on leader-only and loses data on leader crash. acks=all with min.insync.replicas=2 means at least 2 of 3 replicas have the record before ack." },
            { takeaway: "enable.idempotence=true prevents producer-retry duplicates.", detail: "Without it, a retried send after a lost ack creates a duplicate record. With it, sequence numbers let the broker detect and drop duplicates." },
            { takeaway: "Partition count is hard to change without breaking key→partition mapping.", detail: "Plan ahead. Add partitions if you must, but be aware that records for a key may move to a different partition after the resize, breaking per-key ordering across the boundary." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="kafka-deep" id="consumers" title="Part 2 · Consumer groups & offsets" xp={30}>
        <h3>Consumer groups: the parallelism unit</h3>
        <p>
          A <strong>consumer group</strong> is a set of consumers that cooperate to consume a topic. Kafka assigns partitions to consumers in the group such that <strong>each partition is consumed by exactly one consumer in the group at a time</strong>. This is the key invariant.
        </p>
        <p>
          Consequence 1: max consumer parallelism = number of partitions. If a topic has 6 partitions, a consumer group can have up to 6 active consumers; a 7th sits idle until one of the others fails.
        </p>
        <p>
          Consequence 2: multiple consumer groups read independently. Group A reading topic <code>orders</code> doesn&apos;t affect Group B reading the same topic. They each track their own offsets. This is how one Kafka topic feeds an analytics pipeline, a search indexer, and a notification service simultaneously, with no coordination.
        </p>

        <h3>Offsets: who decides what&apos;s been consumed</h3>
        <p>
          Each consumer group has a <strong>committed offset</strong> per partition — the highest offset it has acknowledged processing. On rebalance, restart, or new consumer joining, Kafka resumes from the committed offset. Anything not yet committed will be re-delivered.
        </p>
        <p>
          Three commit strategies, in increasing order of correctness:
        </p>
        <ul>
          <li><strong>Auto-commit</strong> (<code>enable.auto.commit=true</code>, default in raw Kafka). Background thread commits the consumer&apos;s position every <code>auto.commit.interval.ms</code> (default 5s). Easy. Almost always wrong: a crash within the interval, after processing but before commit, replays. A crash after commit but before processing, loses.</li>
          <li><strong>Sync commit after batch.</strong> Process a poll batch fully, then <code>consumer.commitSync()</code>. Crashes between processing and commit replay (at-least-once). Safe but blocks the consumer thread on each commit.</li>
          <li><strong>Async commit after batch.</strong> Same idea, non-blocking <code>commitAsync()</code>. Higher throughput, slightly looser durability. Use a sync commit at shutdown to flush.</li>
        </ul>

        <Callout variant="warn" title="Auto-commit is the source of most Kafka bugs you’ll see">
          <p className="m-0">
            The default behavior of the Java client is auto-commit. Spring Kafka turns it off by default and uses container-managed acks instead — but if you ever drop to the raw client or change the config, you can quietly re-enable it. Auto-commit means &quot;commit on a timer regardless of whether processing succeeded.&quot; That&apos;s exactly the wrong policy for at-least-once correctness. Always commit after processing, never on a timer.
          </p>
        </Callout>

        <h3>Spring Kafka container ack modes</h3>
        <p>
          Spring Kafka&apos;s <code>@KafkaListener</code> wraps a <code>MessageListenerContainer</code> that drives polling and offset commits. The <code>AckMode</code> setting controls when offsets get committed:
        </p>
        <ul>
          <li><code>RECORD</code> — commit after each individual record. Highest correctness, lowest throughput.</li>
          <li><code>BATCH</code> (default) — commit after each <code>poll()</code> batch is fully processed. Good balance.</li>
          <li><code>MANUAL</code> / <code>MANUAL_IMMEDIATE</code> — listener calls <code>ack.acknowledge()</code> explicitly. Use when offset commit timing depends on business logic (transaction completion, etc.).</li>
          <li><code>TIME</code> / <code>COUNT</code> — commit on time or count thresholds. Throughput-oriented.</li>
        </ul>

        <CodeBlock lang="java">{`@Configuration
@EnableKafka
public class ConsumerConfig {

  @Bean
  public ConsumerFactory<String, OrderEvent> consumerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(BOOTSTRAP_SERVERS_CONFIG, "kafka1:9092,kafka2:9092,kafka3:9092");
    props.put(GROUP_ID_CONFIG, "order-processor");
    props.put(KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    props.put(VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
    props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.example.events");

    // Disable auto-commit — Spring container will drive commits
    props.put(ENABLE_AUTO_COMMIT_CONFIG, false);

    // For exactly-once consumers, only see committed records
    props.put(ISOLATION_LEVEL_CONFIG, "read_committed");

    // On first start of new group, read from earliest available
    props.put(AUTO_OFFSET_RESET_CONFIG, "earliest");

    return new DefaultKafkaConsumerFactory<>(props);
  }

  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, OrderEvent>
      kafkaListenerContainerFactory(ConsumerFactory<String, OrderEvent> cf) {
    var factory = new ConcurrentKafkaListenerContainerFactory<String, OrderEvent>();
    factory.setConsumerFactory(cf);
    factory.setConcurrency(3);                   // 3 threads — caps at partition count anyway
    factory.getContainerProperties()
        .setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
    return factory;
  }
}`}</CodeBlock>

        <CodeBlock lang="java">{`@Component
public class OrderEventListener {

  private final OrderService orders;
  private final ProcessedEventRepo processed;
  private final TransactionTemplate tx;

  @KafkaListener(topics = "orders", containerFactory = "kafkaListenerContainerFactory")
  public void handle(@Payload OrderEvent event,
                     @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                     @Header(KafkaHeaders.OFFSET) long offset,
                     Acknowledgment ack) {
    try {
      tx.executeWithoutResult(s -> {
        if (processed.existsByKey(event.eventId())) {
          log.info("duplicate event {}, skipping", event.eventId());
          return;
        }
        orders.apply(event);
        processed.save(new ProcessedEvent(event.eventId()));
      });
      ack.acknowledge();           // commit offset only after successful processing
    } catch (Exception e) {
      log.error("processing failed partition={} offset={}", partition, offset, e);
      // Don't ack — Spring will redeliver this batch on rebalance / restart
      throw e;                     // triggers DefaultErrorHandler (retry → DLT)
    }
  }
}`}</CodeBlock>

        <h3>Rebalances: the silent disruption</h3>
        <p>
          When a consumer joins or leaves a group, Kafka <strong>rebalances</strong>: it reassigns partitions to consumers. During rebalance, no consumption happens — every consumer pauses. Pre-2.4 Kafka used eager rebalancing (everybody pauses, everybody reassigns); modern Kafka uses cooperative rebalancing (only the affected partitions move).
        </p>
        <p>
          Rebalance triggers: deploys, slow consumers (heartbeat timeout), garbage collection pauses, network blips. Each rebalance costs latency. Optimize: bigger consumer count is fine but more consumers = more rebalance churn during deploys. Tune heartbeat / session timeout for your processing characteristics.
        </p>

        <h3>The dead-letter topic (DLT)</h3>
        <p>
          Same idea as a DLQ in SQS, different name. Spring Kafka&apos;s <code>DefaultErrorHandler</code> retries with backoff and ships poison records to a configured DLT after N failures.
        </p>
        <CodeBlock lang="java">{`@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> template) {
  // Retry 3 times with exponential backoff, then send to .DLT topic
  var recoverer = new DeadLetterPublishingRecoverer(template,
      (record, ex) -> new TopicPartition(record.topic() + ".DLT", record.partition()));
  var backoff = new ExponentialBackOffWithMaxRetries(3);
  backoff.setInitialInterval(1000L);
  backoff.setMultiplier(2.0);
  backoff.setMaxInterval(10_000L);
  var handler = new DefaultErrorHandler(recoverer, backoff);

  // Don't retry deserialization errors — they will never succeed
  handler.addNotRetryableExceptions(DeserializationException.class);
  return handler;
}`}</CodeBlock>

        <Quiz
          question="A team uses enable.auto.commit=true and processes records in a @KafkaListener. They occasionally see records that 'never got processed.' What's the bug?"
          options={[
            { label: "Auto-commit is broken in Spring Kafka.", explanation: "It works as documented — but the documented behavior is the bug." },
            { label: "Auto-commit commits the consumer’s position on a timer; if the consumer crashes after the commit but before processing, those records appear consumed but were never processed.", correct: true, explanation: "Right. Auto-commit is independent of processing success. The fix: turn off auto-commit, use a Spring Kafka AckMode that commits AFTER processing (BATCH, MANUAL, or RECORD)." },
            { label: "The consumer needs more partitions.", explanation: "Partition count doesn't fix offset semantics." },
            { label: "Auto-commit only commits records you’ve fully processed.", explanation: "Backwards. Auto-commit commits on a timer regardless of processing — that's the entire problem." },
          ]}
        />

        <Quiz
          question="A topic has 12 partitions. A consumer group has 20 consumers. What happens?"
          options={[
            { label: "Kafka splits each partition further to give all 20 consumers work.", explanation: "Kafka can't split partitions on the consumer side. Partitions are the unit of parallelism." },
            { label: "12 consumers each get one partition; 8 sit idle.", correct: true, explanation: "Right. Max parallelism = partition count. Extra consumers are hot spares — they take over if an active consumer fails. Useful for fast failover, wasteful if you over-provision." },
            { label: "Each partition is shared between two consumers.", explanation: "A partition is consumed by exactly one consumer in a group at a time. That's the core invariant." },
            { label: "Kafka rejects the extra consumers.", explanation: "They join the group fine — they just don't get assigned partitions." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Consumer groups bind partitions to consumers 1:1. Offset commits decide when work is “done.” Auto-commit is the bug class to know."
          points={[
            { takeaway: "Max parallelism per consumer group = partition count.", detail: "More consumers than partitions wastes consumers. Plan partition count for projected peak parallelism plus headroom." },
            { takeaway: "Commit AFTER processing. Auto-commit is the wrong default for correctness.", detail: "Spring Kafka defaults to BATCH ack mode (post-batch commit). For finer control, use MANUAL_IMMEDIATE and ack.acknowledge() at the end of successful processing." },
            { takeaway: "Multiple consumer groups read the same topic independently.", detail: "Each group has its own committed offsets. New consumer groups can replay from offset 0 (auto.offset.reset=earliest) — bootstrap new derived state without producer changes." },
            { takeaway: "Rebalances pause consumption. Cooperative rebalancing reduces the pain.", detail: "Tune session.timeout.ms and heartbeat.interval.ms for your processing characteristics. Long GC pauses cause rebalances; so does any pause longer than max.poll.interval.ms." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="kafka-deep" id="exactly-once" title="Part 3 · Exactly-once with Spring Kafka" xp={35}>
        <h3>The narrow definition of exactly-once</h3>
        <p>
          Kafka&apos;s exactly-once semantics (EOS) apply to a specific pattern: <strong>read from Kafka, process, write to Kafka, atomically</strong>. The transactional producer makes the produce-side records and the offset commits visible together — either both happen or neither does. Combined with <code>read_committed</code> isolation on downstream consumers, you get a correct exactly-once chain entirely within Kafka.
        </p>
        <p>
          What EOS does <strong>not</strong> cover: side effects to non-Kafka systems. Sending an email, calling an HTTP API, writing to a database that isn&apos;t inside the Kafka transaction. For those, you&apos;re back to at-least-once + idempotency, or transactional outbox patterns.
        </p>

        <Mermaid chart={eosFlow} />

        <h3>The three pieces of EOS</h3>
        <ul>
          <li><strong>Idempotent producer</strong> (<code>enable.idempotence=true</code>) — covered in Part 1. Eliminates duplicate-on-retry within a producer session.</li>
          <li><strong>Transactional producer</strong> (<code>transactional.id</code> + <code>initTransactions()</code>) — group multiple sends and offset commits into a single atomic transaction.</li>
          <li><strong>read_committed isolation</strong> on consumers — only see records that are part of committed transactions.</li>
        </ul>

        <h3>Spring Kafka: <code>KafkaTransactionManager</code></h3>
        <p>
          Spring abstracts the transactional producer behind <code>KafkaTransactionManager</code>. Wire it as a <code>@Bean</code>, mark methods <code>@Transactional</code>, and Spring will:
        </p>
        <ul>
          <li>Begin a Kafka transaction at method entry.</li>
          <li>Send any <code>kafkaTemplate.send()</code> calls inside the transaction.</li>
          <li>If the listener triggered the method, commit the consumer offset inside the same transaction.</li>
          <li>Commit on success, abort on exception.</li>
        </ul>

        <CodeBlock lang="java">{`@Configuration
@EnableTransactionManagement
public class KafkaTransactionConfig {

  @Bean
  public ProducerFactory<String, Object> producerFactory() {
    Map<String, Object> props = new HashMap<>();
    props.put(BOOTSTRAP_SERVERS_CONFIG, "kafka:9092");
    props.put(KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    props.put(VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
    props.put(ACKS_CONFIG, "all");
    props.put(ENABLE_IDEMPOTENCE_CONFIG, true);
    var pf = new DefaultKafkaProducerFactory<String, Object>(props);
    // The transactional ID must be unique per producer instance.
    // Spring appends an instance suffix to this prefix.
    pf.setTransactionIdPrefix("orders-tx-");
    return pf;
  }

  @Bean
  public KafkaTransactionManager<String, Object> kafkaTxManager(
      ProducerFactory<String, Object> pf) {
    return new KafkaTransactionManager<>(pf);
  }

  @Bean
  public KafkaTemplate<String, Object> kafkaTemplate(
      ProducerFactory<String, Object> pf) {
    return new KafkaTemplate<>(pf);
  }
}`}</CodeBlock>

        <CodeBlock lang="java">{`@Component
public class OrderEnrichmentListener {

  private final KafkaTemplate<String, Object> kafka;
  private final EnrichmentService enrichment;

  /**
   * Read from 'orders', enrich, write to 'orders-enriched'.
   * The @Transactional annotation binds the consumer offset commit
   * and any kafkaTemplate.send() calls into a single Kafka transaction.
   */
  @Transactional("kafkaTxManager")
  @KafkaListener(topics = "orders", groupId = "enricher",
      containerFactory = "kafkaListenerContainerFactory")
  public void enrich(OrderEvent event) {
    OrderEnriched enriched = enrichment.enrich(event);
    // Send happens inside the open Kafka transaction
    kafka.send("orders-enriched", enriched.orderId(), enriched);
    // No explicit commit; Spring commits the txn on successful method return
  }
}`}</CodeBlock>

        <Callout variant="spring" title="The container needs to know it’s a transactional consumer">
          <p className="m-0">
            For the offset commit to be part of the Kafka transaction, the consumer container must use the same <code>KafkaTransactionManager</code>. With <code>@EnableTransactionManagement</code> and a <code>@Transactional(&quot;kafkaTxManager&quot;)</code> on the listener, Spring wires this up. Without it, the offset is committed via the consumer&apos;s normal commit path — and you lose the atomic property between the produce and the offset commit.
          </p>
        </Callout>

        <h3>Downstream: <code>read_committed</code></h3>
        <p>
          Producers may write records that are then aborted (transaction rolled back). Aborted records still occupy offsets in the log — the broker doesn&apos;t move them. By default, consumers see them and have to filter (which they have no way to do correctly). Set <code>isolation.level=read_committed</code> and the consumer skips records that are part of aborted or in-flight transactions.
        </p>
        <p>
          A read_committed consumer trades a little latency (it has to wait for transaction outcomes) for correctness. For any consumer downstream of a transactional producer, this should be the default.
        </p>

        <h3>What about non-Kafka side effects?</h3>
        <p>
          Real services usually need to write to a database too. Two patterns:
        </p>
        <ul>
          <li><strong>Outbox pattern.</strong> Write the business state and a row in an <code>outbox</code> table in the same DB transaction. A separate process polls the outbox and publishes to Kafka. Bullet-proof, decoupled, but adds a moving part.</li>
          <li><strong>Chained transactions (don&apos;t).</strong> Begin a DB transaction, do the work, send to Kafka, commit DB, commit Kafka. This is XA-style two-phase commit territory — error-prone, low-throughput, and basically unsupported in modern Spring + Kafka. Avoid.</li>
        </ul>

        <CodeBlock lang="java">{`// The outbox pattern in Spring + JPA
@Entity
public class OutboxEvent {
  @Id String id;
  String topic;
  String aggregateId;
  String payload;            // serialized event
  Instant createdAt;
  Instant publishedAt;       // null until publisher picks it up
}

@Service
public class OrderService {
  private final OrderRepo orders;
  private final OutboxRepo outbox;

  @Transactional                    // Spring/JPA DB transaction
  public Order placeOrder(NewOrder cmd) {
    Order order = orders.save(new Order(cmd));
    // Outbox row written in the same DB transaction
    outbox.save(new OutboxEvent(
        UUID.randomUUID().toString(),
        "orders",
        order.getId(),
        json(new OrderCreated(order)),
        Instant.now(),
        null));
    return order;
  }
}

// Separate scheduled publisher polls outbox and ships to Kafka
@Component
public class OutboxPublisher {
  @Scheduled(fixedDelay = 200)
  public void publish() {
    var batch = outbox.findUnpublished(100);
    for (var ev : batch) {
      kafka.send(ev.topic(), ev.aggregateId(), ev.payload())
          .whenComplete((r, ex) -> {
            if (ex == null) outbox.markPublished(ev.id(), Instant.now());
          });
    }
  }
}`}</CodeBlock>

        <Callout variant="insight" title="Outbox is at-least-once, not exactly-once">
          <p className="m-0">
            The outbox publisher can crash between the Kafka send and the markPublished update — the next pass re-publishes the same event. Consumers downstream still need to be idempotent. Outbox guarantees &quot;business state and event publication are atomic&quot; (either both happen or neither), not &quot;event is published exactly once.&quot;
          </p>
        </Callout>

        <h3>Tuning levers for production</h3>
        <ul>
          <li><strong>Batching:</strong> <code>linger.ms=5-20</code> and <code>batch.size=64KB-1MB</code> let the producer pack records into bigger requests. Throughput up, latency up slightly. Pair with <code>compression.type=lz4</code> (or <code>zstd</code>) for ~2-5× smaller wire size.</li>
          <li><strong>Consumer batch size:</strong> <code>max.poll.records</code> controls how many records each <code>poll()</code> returns. Bigger batches = fewer round-trips but more work to do before committing.</li>
          <li><strong>max.poll.interval.ms:</strong> how long Kafka waits for the consumer to call <code>poll()</code> again before evicting it. If your processing is slow, raise this — otherwise rebalances happen mid-batch.</li>
          <li><strong>Retention:</strong> per-topic <code>retention.ms</code> and <code>retention.bytes</code>. For event-sourced topics, set retention to forever (-1) and rely on log compaction.</li>
          <li><strong>Log compaction:</strong> for keyed topics where only the latest value per key matters (e.g. account state), compaction garbage-collects superseded records, keeping the topic small while preserving full history of the latest values.</li>
        </ul>

        <Quiz
          question="A team enables Kafka transactions on the producer side but leaves consumers at default isolation_level=read_uncommitted. They expect EOS. What goes wrong?"
          options={[
            { label: "Nothing — read_uncommitted is the default and works fine.", explanation: "It's the default but it's NOT what you want with transactional producers. read_uncommitted shows aborted records." },
            { label: "Consumers see records from aborted transactions, and there’s no consumer-side way to filter them out reliably. Set isolation.level=read_committed.", correct: true, explanation: "Right. Aborted-but-occupying-offset records are visible at read_uncommitted. Consumers need read_committed to skip them automatically. Without it, EOS is broken on the consumer side." },
            { label: "Consumers crash on aborted records.", explanation: "They don't crash — they see them as normal records, which is the actual bug." },
            { label: "Kafka refuses to commit the producer transaction.", explanation: "Producer transactions commit fine — the issue is what consumers see." },
          ]}
        />

        <Quiz
          question="Your service needs to update a Postgres row AND publish an event 'atomically.' You're tempted to send the Kafka event from inside the @Transactional method that does the DB write. What's the right pattern?"
          options={[
            { label: "It works fine — Spring handles the coordination automatically.", explanation: "Spring doesn't coordinate Postgres XA and Kafka transactions out of the box. You'll have a window where DB committed but Kafka send failed (or vice versa)." },
            { label: "Use the transactional outbox pattern: write the event row in the same DB transaction as the business state, then a separate publisher ships it to Kafka.", correct: true, explanation: "Right. Outbox makes the DB write and the ‘event was recorded’ atomic via a single DB transaction. The publisher is at-least-once with idempotent consumers handling duplicates downstream. Standard pattern." },
            { label: "Use XA two-phase commit between Postgres and Kafka.", explanation: "Modern Spring + Kafka effectively don't support XA. It's also low-throughput and operationally painful even where supported." },
            { label: "Send the event first, then commit the DB.", explanation: "Now you have a window where the event was sent but the DB write fails — consumers see an event for a state that doesn't exist." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="EOS is real but narrow: read-from-Kafka, write-to-Kafka, atomic offset commits. Side effects need outbox or idempotency."
          points={[
            { takeaway: "EOS = idempotent producer + transactional producer + read_committed consumers.", detail: "All three pieces. Drop any one and the chain breaks. Spring Kafka wires this up cleanly via KafkaTransactionManager + @Transactional + isolation.level=read_committed." },
            { takeaway: "Spring’s @Transactional(\"kafkaTxManager\") makes the listener+producer pattern transactional automatically.", detail: "The listener container must be configured with the same transaction manager so the offset commit happens inside the Kafka transaction." },
            { takeaway: "Outbox pattern for DB + Kafka atomicity. Don’t reach for XA.", detail: "Write the event to an outbox table in the same DB transaction. Publisher reads outbox, ships to Kafka, marks published. Consumers downstream still need idempotency — outbox is at-least-once delivery." },
            { takeaway: "Tune for your shape: batching for throughput, max.poll.interval.ms for slow processing, compaction for keyed-state topics.", detail: "Default settings are conservative on throughput. Production-grade tuning routinely doubles or triples it without sacrificing durability if you have acks=all + idempotence." },
          ]}
        />
      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <h3 className="font-bold text-lg mt-0 mb-2">Up next</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          You can produce, consume, and reason about Kafka. Now the question of how to use it: <Link href="/courses/system-design/modules/event-driven-cqrs" className="text-cyan-600 hover:underline">event-driven architecture, event sourcing, and CQRS</Link> — when each helps, and when they&apos;re overkill.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="kafka-deep" />
    </article>
  );
}
