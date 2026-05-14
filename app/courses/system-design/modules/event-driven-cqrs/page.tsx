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
  { id: "event-driven", title: "Event-driven & pub-sub" },
  { id: "event-sourcing", title: "Event sourcing" },
  { id: "cqrs", title: "CQRS" },
];

const choreography = `flowchart LR
  O[Order Service] -- OrderPlaced --> B((Broker))
  B -- OrderPlaced --> P[Payment Service]
  B -- OrderPlaced --> I[Inventory Service]
  B -- OrderPlaced --> N[Notification Service]
  P -- PaymentCaptured --> B
  I -- StockReserved --> B
  B -- PaymentCaptured --> O
  B -- StockReserved --> O`;

const cqrsDiagram = `flowchart LR
  C[Client] -- commands --> W[Write Model<br/>Order aggregate]
  W -- events --> S[(Event Store)]
  S -- events --> Pj[Projector]
  Pj --> R[(Read Model<br/>denormalized)]
  C -- queries --> R`;

export default function Page() {
  const mod = getModuleBySlug("event-driven-cqrs")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="event-driven-cqrs" />
        <ModuleProgress moduleSlug="event-driven-cqrs" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌊</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Three patterns that get talked about as one: event-driven architecture, event sourcing, and CQRS. They compose, but they&apos;re not the same thing — and confusing them is how teams accidentally adopt the most complex variant when they only needed the simplest. By the end you&apos;ll know what each buys you, what each costs, and when to walk away.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Events vs commands — the verb-tense distinction that decides your coupling</li>
          <li>Choreography vs orchestration — when each fits</li>
          <li>Event sourcing: events as source of truth, replay, snapshotting, schema evolution</li>
          <li>CQRS: separate read and write models, eventual consistency, when it&apos;s overkill</li>
          <li>Picking the right pattern for the workload — without buzzword-driven design</li>
        </ul>
      </section>

      <section>
        <h2>Three patterns, one conversation, lots of confusion.</h2>
        <p>
          Every team that hits a certain scale starts using these terms interchangeably. &quot;We&apos;re going event-driven.&quot; &quot;We&apos;re doing CQRS.&quot; &quot;We&apos;re event sourcing.&quot; They&apos;re related but distinct, and the cost of each is wildly different. Mixing them up leads teams to event-source their entire system when they only needed pub-sub between two services.
        </p>
        <p>
          The cleanest mental model:
        </p>
        <ul>
          <li><strong>Event-driven architecture:</strong> services communicate by publishing and subscribing to events. Loose coupling between producer and consumer. Cheap, common, often the right answer.</li>
          <li><strong>Event sourcing:</strong> instead of storing the current state of an entity, store the sequence of events that produced it. State is derived by replay. Powerful, expensive in operational complexity.</li>
          <li><strong>CQRS:</strong> separate the model used to write data from the model(s) used to read data. Different storage, different shape. Useful when read and write have very different patterns.</li>
        </ul>
        <p>
          You can do event-driven without event sourcing, and CQRS without either. You can also stack all three — that&apos;s where the legendary complexity comes from.
        </p>
      </section>

      <Checkpoint moduleSlug="event-driven-cqrs" id="event-driven" title="Part 1 · Event-driven & pub-sub" xp={25}>
        <h3>Events vs commands: verb tense matters</h3>
        <ul>
          <li><strong>Command:</strong> &quot;PlaceOrder&quot; — imperative, asks something to happen, addressed to a specific receiver, can be rejected.</li>
          <li><strong>Event:</strong> &quot;OrderPlaced&quot; — past tense, states something that happened, not addressed to anyone in particular, can&apos;t be rejected (it already happened).</li>
        </ul>
        <p>
          The grammatical difference shapes the architectural one. Commands couple sender to receiver: &quot;I, the API, am telling you, the OrderService, to place this order.&quot; Events decouple: &quot;Hey, an order was placed — anyone interested can act on it.&quot; Commands have at most one handler. Events have any number — including zero.
        </p>

        <Callout variant="insight" title="The verb-tense rule of thumb">
          <p className="m-0">
            If your event names sound like commands (&quot;CreateUser,&quot; &quot;ProcessPayment&quot;), you&apos;re probably doing point-to-point messaging dressed up as events. Real events use past tense (&quot;UserCreated,&quot; &quot;PaymentProcessed&quot;) and don&apos;t name a recipient. The naming is the architecture — get it right and the boundaries clarify themselves.
          </p>
        </Callout>

        <h3>Choreography vs orchestration</h3>
        <p>
          Once you go event-driven, you have a choice in how multi-step workflows run:
        </p>
        <ul>
          <li><strong>Choreography:</strong> services publish events and react to other services&apos; events. No central coordinator. Each service knows its own rules.</li>
          <li><strong>Orchestration:</strong> a central orchestrator (workflow engine, saga) sends commands to services in sequence and reacts to their responses.</li>
        </ul>

        <Mermaid chart={choreography} />

        <p>
          Choreography is loosely coupled and easy to extend — adding a new consumer of <code>OrderPlaced</code> doesn&apos;t touch any existing code. The cost: the workflow exists nowhere; you have to read N services to understand &quot;what happens when an order is placed.&quot; Debugging cross-service flows is harder.
        </p>
        <p>
          Orchestration centralizes the workflow logic. The flow is visible in one place. Easier to debug, easier to add compensation logic. The cost: the orchestrator becomes a coupling point and (often) a deploy bottleneck. Tools like Temporal, Camunda, or AWS Step Functions exist for exactly this.
        </p>

        <Callout variant="warn" title="The choreography sprawl trap">
          <p className="m-0">
            Choreography starts beautifully simple, and at 3 services it is. At 12 services with complex multi-step flows, it becomes &quot;nobody knows what happens after we publish OrderPlaced; we&apos;ll find out when production breaks.&quot; The pivot point is usually around the time someone says &quot;can we add a manual approval step?&quot; — easy in orchestration, painful in choreography.
          </p>
        </Callout>

        <h3>Schema as a contract</h3>
        <p>
          The producer doesn&apos;t know who consumes its events. That&apos;s the upside (loose coupling) and the trap (you can&apos;t safely change the schema). A breaking change to <code>OrderPlaced</code> can break consumers you&apos;ve never heard of.
        </p>
        <p>
          Production-grade event-driven systems treat the schema as a versioned, evolution-aware contract:
        </p>
        <ul>
          <li><strong>Backward compatibility:</strong> never remove or rename a field. Add new optional fields. Old consumers keep working.</li>
          <li><strong>Forward compatibility:</strong> consumers ignore unknown fields. New producers can add fields without breaking old consumers.</li>
          <li><strong>Schema registry:</strong> Confluent Schema Registry or similar. Producers and consumers agree on the schema; the registry enforces compatibility rules at write time.</li>
        </ul>
        <p>
          Format-wise: <strong>Avro</strong> with schema registry is the canonical pairing for Kafka. JSON works but lacks schema enforcement (you can use JSON Schema + a registry). Protobuf is also popular when you&apos;re already on gRPC elsewhere.
        </p>

        <h3>A simple event with a versioned envelope</h3>
        <CodeBlock lang="java">{`// The event payload — just the facts about what happened
public record OrderPlaced(
    String orderId,
    String customerId,
    List<LineItem> items,
    Money total,
    Instant placedAt
) {}

// Wrap in a versioned envelope so consumers can negotiate format
public record EventEnvelope<T>(
    String eventId,            // unique — used for idempotent consumption
    String eventType,          // "OrderPlaced"
    int schemaVersion,         // bump on breaking change
    Instant occurredAt,
    String correlationId,
    String causationId,        // event that caused this event
    T payload
) {}`}</CodeBlock>

        <CodeBlock lang="java">{`@Service
public class OrderEventPublisher {
  private final KafkaTemplate<String, EventEnvelope<?>> kafka;

  public void publishOrderPlaced(Order order, String correlationId) {
    var event = new OrderPlaced(
        order.id(),
        order.customerId(),
        order.items(),
        order.total(),
        order.placedAt());

    var envelope = new EventEnvelope<>(
        UUID.randomUUID().toString(),
        "OrderPlaced",
        1,
        Instant.now(),
        correlationId,
        null,                            // root event — no cause
        event);

    // Key by orderId so all order events go to same partition (ordering)
    kafka.send("orders.events", order.id(), envelope);
  }
}`}</CodeBlock>

        <h3>Sagas: orchestrating across service boundaries</h3>
        <p>
          A saga is a long-running transaction implemented as a sequence of local transactions, each with a compensation. If step 3 fails, run the compensations for steps 1 and 2. Sagas are the practical answer to &quot;we can&apos;t use a distributed transaction.&quot;
        </p>
        <ul>
          <li><strong>Choreographed saga:</strong> each service listens for the previous step&apos;s success/failure event and decides what to do. No central coordinator.</li>
          <li><strong>Orchestrated saga:</strong> a saga orchestrator drives the flow with explicit steps and compensations.</li>
        </ul>
        <p>
          For 2-3 step sagas, choreography is fine. Beyond that, orchestration earns its keep — you can <em>see</em> the flow, you can pause it, you can monitor stuck instances, you can add retry policies per step.
        </p>

        <Quiz
          question="A team names their events 'CreateUser', 'UpdateOrder', 'DeleteAccount'. Why is this a smell?"
          options={[
            { label: "Event names should be all-caps for convention.", explanation: "Casing is style — the issue is grammatical." },
            { label: "Those are commands, not events. They’re imperative — naming them as events doesn’t change that they’re point-to-point messages with implicit recipients.", correct: true, explanation: "Right. Real events are past tense ('UserCreated', 'OrderUpdated'). Imperative names mean someone is actually telling someone else to do something — that's command-shaped messaging dressed up as events. The naming exposes the architectural mistake." },
            { label: "Events should never reference verbs.", explanation: "Past-tense verbs are exactly what you want. The bug is imperative tense, not verbs in general." },
            { label: "Events must be exactly two words.", explanation: "There's no length rule — it's the verb tense that signals the issue." },
          ]}
        />

        <Quiz
          question="Your team has 8 services orchestrating a 6-step order flow purely via choreography (each step listens for the previous). The product team wants to add a manual review step in the middle. What's the practical impact?"
          options={[
            { label: "Trivial — just publish a new event and listen for the approval.", explanation: "It's not trivial at scale. You have to coordinate which existing events still flow, which are blocked, who handles timeouts on manual review, and how to retry without re-running completed steps." },
            { label: "Hard — there’s no central place to pause, resume, or surface “waiting for review” state. Each service has to be aware of the new step. This is where orchestration earns its keep.", correct: true, explanation: "Right. Choreography distributes the workflow logic across services. Adding a step requires touching multiple services and reasoning about every existing flow. Orchestrators (Temporal, Camunda, Step Functions) make this kind of change a single config update." },
            { label: "Impossible without a full rewrite.", explanation: "You can do it — it's just expensive. The point is that orchestration would have made this kind of change cheap." },
            { label: "It works automatically because the broker handles workflow.", explanation: "Brokers move messages; they don't know what your workflow is." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Events (past tense, broadcast) decouple. Commands (imperative, addressed) couple. Choose grammar and topology deliberately."
          points={[
            { takeaway: "Event names use past tense. Imperative names are commands hiding as events.", detail: "‘OrderPlaced’ vs ‘PlaceOrder’. The grammar tells you whether you’re doing pub-sub or point-to-point messaging." },
            { takeaway: "Choreography is simple at small scale; orchestration earns its keep beyond ~3 steps or with manual/long-running gates.", detail: "Every multi-step flow eventually needs visibility, retries, manual intervention. Orchestrators give you that for free; choreography requires you to build it across N services." },
            { takeaway: "Treat the schema as a contract. Use a registry; never make breaking changes.", detail: "Add optional fields, never remove or rename. Avro + Confluent Schema Registry is the canonical Kafka pairing; JSON Schema works too if you enforce it." },
            { takeaway: "Sagas are the practical replacement for distributed transactions across services.", detail: "Each step is a local transaction with a compensating action. If step 3 fails, compensate steps 1 and 2. Orchestrated sagas are easier to debug than choreographed ones beyond a few steps." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="event-driven-cqrs" id="event-sourcing" title="Part 2 · Event sourcing" xp={30}>
        <h3>The big mental flip</h3>
        <p>
          In a traditional CRUD system, you store current state. The user table has a <code>balance</code> column with the current balance. When the balance changes, you UPDATE that column. The history (how the balance got there) is gone unless you separately log it.
        </p>
        <p>
          In an event-sourced system, you store the events. <code>AccountOpened(initialBalance: 0)</code>, <code>Deposited(amount: 100)</code>, <code>Withdrawn(amount: 30)</code>. Current state is <em>derived</em> by replaying these events. The events are the truth; state is a computation over them.
        </p>

        <Callout variant="insight" title="Event sourcing is a database design choice, not an architecture style">
          <p className="m-0">
            Event sourcing is about <em>how you persist your write model</em>. You can event-source one aggregate (Order) and use plain CRUD for everything else (User, Product). It&apos;s not all-or-nothing. Conflating it with event-driven architecture or CQRS is the source of most teams&apos; confusion.
          </p>
        </Callout>

        <h3>The four operations</h3>
        <ul>
          <li><strong>Append events.</strong> When a command succeeds, append the resulting events to the event store, keyed by aggregate ID, with a version number for optimistic concurrency.</li>
          <li><strong>Load aggregate.</strong> Read all events for an aggregate, fold them into current state.</li>
          <li><strong>Snapshot.</strong> Periodically save a snapshot of folded state at a known version. Subsequent loads start from the snapshot and replay only events since.</li>
          <li><strong>Project.</strong> Subscribe to the event stream and build read-side views (in DBs, search indexes, caches).</li>
        </ul>

        <h3>A minimal aggregate</h3>
        <CodeBlock lang="java">{`public class Account {
  private String id;
  private long balance;
  private int version;       // for optimistic concurrency
  private final List<Event> uncommitted = new ArrayList<>();

  // Replay an event into the aggregate's state
  private void apply(Event event) {
    switch (event) {
      case AccountOpened e -> { this.id = e.accountId(); this.balance = e.initialBalance(); }
      case Deposited e -> this.balance += e.amount();
      case Withdrawn e -> this.balance -= e.amount();
      default -> throw new IllegalStateException("unknown event " + event);
    }
    this.version++;
  }

  /** Rehydrate from history. */
  public static Account fromHistory(List<Event> history) {
    Account a = new Account();
    for (Event e : history) a.apply(e);
    return a;
  }

  // Command: deposit money. Validate, then emit an event.
  public void deposit(long amount) {
    if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
    raise(new Deposited(this.id, amount));
  }

  // Command: withdraw, with overdraft check
  public void withdraw(long amount) {
    if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
    if (amount > this.balance) throw new InsufficientFunds(this.id, this.balance, amount);
    raise(new Withdrawn(this.id, amount));
  }

  private void raise(Event e) {
    apply(e);                  // update local state
    uncommitted.add(e);        // remember to persist
  }

  public List<Event> uncommittedEvents() { return List.copyOf(uncommitted); }
  public void markCommitted() { uncommitted.clear(); }
  public int version() { return version; }
}`}</CodeBlock>

        <CodeBlock lang="java">{`@Service
public class AccountService {

  private final EventStore eventStore;
  private final EventPublisher publisher;

  @Transactional
  public void deposit(String accountId, long amount) {
    // 1. Load history
    List<Event> history = eventStore.readStream(accountId);
    Account account = Account.fromHistory(history);

    // 2. Apply command
    account.deposit(amount);

    // 3. Append new events with optimistic concurrency check
    int expectedVersion = history.size();
    eventStore.appendToStream(accountId, expectedVersion, account.uncommittedEvents());

    // 4. Publish for projectors / other consumers
    account.uncommittedEvents().forEach(publisher::publish);
    account.markCommitted();
  }
}`}</CodeBlock>

        <h3>Snapshots: making replay tractable</h3>
        <p>
          Replaying every event from the start gets slow as streams grow. After 10,000 events on an aggregate, loading it means folding 10,000 records. Snapshotting fixes this: every N events (or T time), serialize the current state to a snapshot table.
        </p>
        <CodeBlock lang="java">{`// Pseudo-code for snapshot-aware load
public Account loadAccount(String accountId) {
  Optional<Snapshot> snap = snapshotStore.latestFor(accountId);
  Account account;
  int fromVersion;
  if (snap.isPresent()) {
    account = Account.fromSnapshot(snap.get().state());
    fromVersion = snap.get().version();
  } else {
    account = new Account();
    fromVersion = 0;
  }
  // Replay only events after the snapshot version
  List<Event> tail = eventStore.readStreamFrom(accountId, fromVersion);
  for (Event e : tail) account.apply(e);
  return account;
}`}</CodeBlock>

        <h3>The schema evolution tax</h3>
        <p>
          Events are forever. If you stored 5 years of <code>OrderPlaced</code> events with a field called <code>customer_email</code>, and today you rename it to <code>buyer_email</code>, every replay path has to handle both shapes. The options:
        </p>
        <ul>
          <li><strong>Upcasters / event versioning:</strong> on read, transform old event versions into the latest. Pay the migration cost in code, not in storage.</li>
          <li><strong>Weak schema (JSON, optional fields):</strong> pretend you have flexibility. You don&apos;t — you just delay finding out about the bugs.</li>
          <li><strong>Rewriting history:</strong> compaction or migration to rewrite old events into the new shape. Operationally heavy, controversial (events are supposed to be immutable).</li>
        </ul>
        <p>
          Production event-sourced systems plan for this from day one — versioned events, upcasters, contract reviews before any event change ships. It&apos;s a real cost, and it&apos;s why event sourcing isn&apos;t free.
        </p>

        <h3>When event sourcing is genuinely worth it</h3>
        <ul>
          <li><strong>Audit and compliance is a hard requirement.</strong> Banking, healthcare, anywhere &quot;why is the balance this number?&quot; must always be answerable. Event sourcing makes audit a feature of the design, not a bolt-on log.</li>
          <li><strong>Temporal queries matter.</strong> &quot;What was the inventory at 3pm yesterday?&quot; A current-state DB needs a separate history table; an event-sourced system replays to that point.</li>
          <li><strong>You need to derive new views from history.</strong> Bootstrapping a search index from a CRUD DB requires backfill jobs. From an event log, you replay the stream.</li>
          <li><strong>The aggregate boundary has high write contention.</strong> Event sourcing&apos;s append-only writes scale better than UPDATE-heavy workloads (no row-level lock contention on hot rows).</li>
        </ul>

        <Callout variant="warn" title="When event sourcing is the wrong call">
          <p className="m-0">
            Most CRUD apps. Most internal tools. Most e-commerce flows that aren&apos;t fundamentally about historical reconstruction. Event sourcing imposes a permanent operational tax: snapshotting, schema evolution, replay performance, eventual consistency between writes and reads. Don&apos;t pay it unless one of the above genuinely applies. &quot;We might want it later&quot; is not a reason — by the time you do, you&apos;ll know enough to decide for real.
          </p>
        </Callout>

        <Quiz
          question="Three years into an event-sourced system, replay of an aggregate with 50,000 events takes 4 seconds. Loading is now too slow. What's the right fix?"
          options={[
            { label: "Migrate away from event sourcing.", explanation: "Drastic — and unnecessary. There’s a known fix for this exact problem." },
            { label: "Add snapshotting: persist the folded state every N events; loads start from the snapshot and replay only events since.", correct: true, explanation: "Right. Snapshots are the standard answer to slow replay. Snapshot every 100-1000 events depending on event volume; cap replay tail to a few hundred events at most." },
            { label: "Cache the loaded aggregate in Redis.", explanation: "Cache invalidation across services using the aggregate becomes its own complexity. Snapshots fix the underlying problem." },
            { label: "Reduce the event count by deleting old events.", explanation: "Events are the source of truth — deleting them loses the history that was the whole point of event sourcing." },
          ]}
        />

        <Quiz
          question="You've decided to rename a field in an OrderPlaced event from customer_email to buyer_email. The event store has 5 years of events with the old name. What do you do on read?"
          options={[
            { label: "Rewrite all old events to use the new name.", explanation: "Possible but operationally heavy and controversial — events are supposed to be immutable. Most teams avoid it." },
            { label: "Add an upcaster that translates old-shape events to the new shape on read; keep stored events untouched. Bump event version.", correct: true, explanation: "Right. Upcasters are the standard pattern: bump the schema version, write an upcaster from version N to N+1, replay paths apply upcasters before passing to handlers. Cost lives in code, not storage." },
            { label: "Have consumers handle both names indefinitely.", explanation: "Works short-term but creates per-consumer inconsistency — every team has to remember the dual handling. Centralize via upcaster." },
            { label: "Drop the old events.", explanation: "Loses history — the whole reason event sourcing was chosen." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Event sourcing stores the sequence of events; state is derived by replay. Powerful for audit, temporal, and high-write workloads. Expensive otherwise."
          points={[
            { takeaway: "Events are the truth. State is a fold over events.", detail: "Append-only writes, aggregate replay for current state. Optimistic concurrency via expected version on append." },
            { takeaway: "Snapshots are non-optional past a certain stream length.", detail: "Every N events, snapshot the folded state. Loads pick up from the snapshot and replay only the tail. Without snapshots, hot aggregates become unloadable." },
            { takeaway: "Schema evolution is a permanent tax. Plan for upcasters from day one.", detail: "Events are forever. Renames, restructures, type changes all require upcasters or event versioning. Treat event schemas as a public API of your service." },
            { takeaway: "Worth it for audit, temporal queries, derive-new-views, high-write contention. Not for “we might want it later.”", detail: "Event sourcing has a real operational cost. Adopt it for clear, present requirements that genuinely benefit. CRUD apps almost always shouldn’t." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="event-driven-cqrs" id="cqrs" title="Part 3 · CQRS" xp={30}>
        <h3>The premise</h3>
        <p>
          CQRS — Command Query Responsibility Segregation — splits the model used to write data from the model(s) used to read it. The write side optimizes for consistency and validation; the read sides optimize for query patterns. Different models, different storage, different scaling characteristics.
        </p>

        <Mermaid chart={cqrsDiagram} />

        <p>
          The point isn&apos;t that the read side is &quot;a cache.&quot; The point is that read and write usually have <em>genuinely different</em> shapes. Writes are about &quot;a single user placed an order&quot;; reads are about &quot;show me revenue by region by month.&quot; Forcing both through the same model means one (or both) is awkward. CQRS lets each be exactly the shape it needs.
        </p>

        <h3>CQRS without event sourcing (the common case)</h3>
        <p>
          You don&apos;t need event sourcing to do CQRS. The simplest CQRS:
        </p>
        <ul>
          <li>Write side: normalized SQL DB, validates and persists business state, publishes events on commit.</li>
          <li>Read side: denormalized SQL DB or Elasticsearch, builds projections from the events. Optimized for the queries the UI/API actually runs.</li>
        </ul>
        <p>
          This is &quot;CQRS lite&quot; — separate read and write paths, both backed by their own storage, kept in sync via events. Eventual consistency between write and read; bounded staleness usually under a second.
        </p>

        <CodeBlock lang="java">{`// Write side — normalized JPA model
@Entity
@Table(name = "orders")
public class Order {
  @Id String id;
  String customerId;
  OrderStatus status;
  @OneToMany(cascade = CascadeType.ALL) List<OrderItem> items;
  Money total;

  // Domain methods enforce invariants
  public void placeOrder(...) { ... }
  public void cancel(...) { ... }
}

@Service
public class OrderCommandService {
  @Transactional
  public void place(PlaceOrderCommand cmd) {
    Order order = new Order(cmd);
    order.placeOrder(...);
    orderRepo.save(order);
    // Outbox or txn-aware publisher emits OrderPlaced event
    eventOutbox.write(new OrderPlaced(order.id(), order.customerId(), ...));
  }
}`}</CodeBlock>

        <CodeBlock lang="java">{`// Read side — denormalized projection in its own DB / index
@Document(indexName = "orders-search")        // Elasticsearch
public class OrderSearchDoc {
  @Id String orderId;
  String customerId;
  String customerName;          // denormalized — joined at projection time
  String customerEmail;         // denormalized
  String status;
  BigDecimal totalAmount;
  String totalCurrency;
  List<String> productIds;      // denormalized line items
  Instant placedAt;
}

@Component
public class OrderProjector {
  @KafkaListener(topics = "orders.events")
  public void on(EventEnvelope<?> envelope) {
    switch (envelope.eventType()) {
      case "OrderPlaced" -> {
        var e = (OrderPlaced) envelope.payload();
        var customer = customerLookup.get(e.customerId());
        searchRepo.save(new OrderSearchDoc(
            e.orderId(), e.customerId(), customer.name(), customer.email(),
            "PLACED", e.total().amount(), e.total().currency(),
            e.items().stream().map(LineItem::productId).toList(),
            e.placedAt()));
      }
      case "OrderCancelled" -> searchRepo.updateStatus(envelope.aggregateId(), "CANCELLED");
      default -> {}             // ignore events we don't project
    }
  }
}`}</CodeBlock>

        <h3>Eventual consistency: the consequence to plan for</h3>
        <p>
          The read side lags the write side. A user places an order, then immediately queries &quot;my orders&quot; — and the projection hasn&apos;t caught up yet, so the new order isn&apos;t in the response. Three coping strategies:
        </p>
        <ul>
          <li><strong>Read your writes from the write side.</strong> For &quot;just placed&quot; queries, route to the write DB. Bypass the projection delay for the user&apos;s own most-recent activity.</li>
          <li><strong>Optimistic UI.</strong> Show the user&apos;s newly-placed order from the local response, before the projection catches up. The next page refresh shows the projection&apos;s view.</li>
          <li><strong>Wait-for-projection.</strong> The write returns a version token; the read includes the version and waits up to N ms for the projection to reach it. Adds latency, but provides a strong-ish read-after-write contract.</li>
        </ul>

        <Callout variant="warn" title="Eventual consistency is a UX problem, not just a tech one">
          <p className="m-0">
            The most common CQRS production bug isn&apos;t in the projector — it&apos;s the user clicking &quot;refresh&quot; and being confused by missing data. Get the UX team involved early. Optimistic UI patterns and clear progress states are part of CQRS done right, not afterthoughts.
          </p>
        </Callout>

        <h3>Multiple read models</h3>
        <p>
          One write model, N read models. Each read model targets specific queries:
        </p>
        <ul>
          <li>A normalized DB for transactional reads (&quot;show my open orders&quot;).</li>
          <li>An Elasticsearch index for search (&quot;orders containing &apos;widget&apos; in any product name&quot;).</li>
          <li>A pre-aggregated table for dashboards (&quot;daily revenue by region&quot;).</li>
          <li>A cache (Redis) for hot lookups.</li>
        </ul>
        <p>
          Each is rebuildable from the event stream — drop and recreate when the schema changes. That replay capability is what makes CQRS sustainable at scale: you can iterate on read models without touching the write side or migrating data through schema changes.
        </p>

        <h3>When CQRS is overkill</h3>
        <ul>
          <li><strong>Read and write patterns are similar.</strong> CRUD apps where reads are &quot;show me what I just wrote&quot; don&apos;t benefit. The same model serves both fine.</li>
          <li><strong>Throughput is moderate.</strong> Without scale pressure, the operational cost of a separate read pipeline isn&apos;t worth the modeling cleanliness.</li>
          <li><strong>Eventual consistency would surprise users.</strong> Some flows genuinely need read-after-write within the same DB. Forcing them through eventual consistency creates UX problems.</li>
        </ul>

        <Callout variant="insight" title="Test for CQRS need: how often do queries differ from the write shape?">
          <p className="m-0">
            If most queries are &quot;get the entity I just wrote&quot; or &quot;list entities of this type with simple filters,&quot; the same model serves both fine. CQRS earns its keep when reads need joins, aggregates, search, or shapes the write model can&apos;t produce efficiently. Hot signal: when you see the team adding read replicas, materialized views, or search indexes ad-hoc — that&apos;s the read side wanting to separate, even if you don&apos;t call it CQRS.
          </p>
        </Callout>

        <h3>The full stack: event-driven + event sourcing + CQRS</h3>
        <p>
          When all three combine: events are the source of truth (event sourcing), they&apos;re published to other services (event-driven), and read models are projections from the event stream (CQRS). This is the maximum-power configuration — and the maximum-cost one. Reserve it for systems where every part of the stack carries its weight: financial ledgers, regulated audit-heavy systems, complex analytics platforms.
        </p>
        <p>
          The mistake most teams make is reaching for the full stack on a system that needed event-driven only — or just plain CRUD with a few queues. The cost shows up months later in operational complexity, debugging difficulty, and onboarding time for new engineers.
        </p>

        <ClassifyChallenge
          title="Pick the right architecture"
          prompt="For each scenario, pick the simplest pattern that fits. Adding more isn’t better — only what you need."
          buckets={[
            { id: "crud", label: "Plain CRUD", color: "rose" },
            { id: "event-driven", label: "Event-driven (pub-sub)", color: "amber" },
            { id: "cqrs", label: "CQRS (split read/write)", color: "indigo" },
            { id: "event-sourcing", label: "Event sourcing + CQRS", color: "violet" },
          ]}
          items={[
            { id: "internal-tool", label: "Internal admin tool to manage product catalog. 5 admins, low traffic, basic CRUD operations.", answer: "crud", explanation: "No scale pressure, no integration concerns, no audit needs beyond basic logging. CRUD is the right tool. Anything more is wasted complexity." },
            { id: "order-fanout", label: "Order placement triggers email, inventory update, and analytics. The same data flows from one source to multiple consumers.", answer: "event-driven", explanation: "Pub-sub fits perfectly: order service publishes OrderPlaced, three consumers each react. No shared write model, no need for replay, just decoupling between services." },
            { id: "search-perf", label: "User search needs to query across many fields with complex filters. Write model is normalized, but search would force expensive joins on every query.", answer: "cqrs", explanation: "Classic CQRS shape: write model stays normalized for consistency, read model lives in Elasticsearch for fast search. Eventual consistency is acceptable for search results." },
            { id: "ledger", label: "Financial ledger system: every transaction must be auditable, balance must be reconstructable for any past date, regulators may request 7-year history.", answer: "event-sourcing", explanation: "Audit, temporal queries, regulatory replay — exactly the use case event sourcing is built for. CQRS naturally pairs with it for read-side dashboards. Worth the cost." },
            { id: "blog", label: "Personal blog with comments. ~1000 readers a day.", answer: "crud", explanation: "Stop. Don’t do this to yourself. CRUD." },
            { id: "saas-tenants", label: "SaaS dashboard: writes are tenant-scoped CRUD, but reads need cross-tenant analytics aggregations for the admin view.", answer: "cqrs", explanation: "Different read shape (aggregated cross-tenant) than write shape (per-tenant). Project from write events into an analytics read model. No event sourcing needed." },
          ]}
        />

        <Quiz
          question="A team adopts the full event-sourcing-plus-CQRS stack for an internal expense reporting tool. Six months in, they're spending more time on snapshotting and projection rebuilds than on features. What's the lesson?"
          options={[
            { label: "They picked the wrong event store.", explanation: "Tool choice doesn't fix architectural over-engineering." },
            { label: "Match the architecture to the workload. An internal tool with no audit/temporal/scale requirements doesn’t justify the operational tax of event sourcing or CQRS.", correct: true, explanation: "Right. Event sourcing + CQRS earns its complexity in specific situations (audit, temporal queries, query/write shape mismatch, very high scale). Internal tools rarely meet those criteria. CRUD or simple event-driven would have fit." },
            { label: "They needed more engineers.", explanation: "More engineers on the wrong architecture is more wasted engineers." },
            { label: "Event sourcing always pays off eventually.", explanation: "It pays off when the use case requires it. For internal tools, it almost never does." },
          ]}
        />

        <Quiz
          question="A user places an order, immediately navigates to 'My Orders', and doesn't see the order they just placed. What's the design fix?"
          options={[
            { label: "Force the read side to be synchronous with the write side.", explanation: "That defeats the entire purpose of CQRS — strong consistency between write and read is what you traded away." },
            { label: "Either show the just-placed order from the write side’s response (read-your-writes routing), or use optimistic UI to render it locally before the projection catches up.", correct: true, explanation: "Right. CQRS means eventual consistency between write and read by design. Production-grade UX includes either targeted read-your-writes (route the user’s own most-recent queries to the write DB) or optimistic UI (show the local result, refresh from projection later)." },
            { label: "Disable CQRS for that flow.", explanation: "The full read path doesn’t need to be torn down — just the user’s own immediate read needs special handling." },
            { label: "Add a 'try refreshing' message.", explanation: "Production-grade UX shouldn’t require user retries. Read-your-writes or optimistic UI is the answer." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="CQRS splits read and write models. Useful when their shapes genuinely differ. Eventual consistency is the cost — plan for it in code AND in UX."
          points={[
            { takeaway: "CQRS doesn’t require event sourcing. CQRS-lite with a normalized write DB and projected read models is common and tractable.", detail: "Write side validates and persists. Events propagate. Projectors build read models in their own storage. No replay infrastructure needed unless you also event-source." },
            { takeaway: "Eventual consistency is a UX problem, not just a tech one.", detail: "Read-your-writes routing or optimistic UI handles the ‘I just wrote it, where is it?’ case. Without these, users will hit refresh loops and your perceived reliability tanks." },
            { takeaway: "Multiple read models, each shaped to its query pattern.", detail: "Search → Elasticsearch. Aggregates → pre-aggregated tables. Hot lookups → Redis. Each rebuildable from the event stream. That replay capability is what makes CQRS sustainable." },
            { takeaway: "Don’t reach for event-sourcing-plus-CQRS as a default. Justify each layer on its merits.", detail: "Event-driven for service decoupling. CQRS when read and write shapes differ. Event sourcing when audit, temporal, or replay is genuinely needed. Most systems need at most one or two of these — the full stack is rare and expensive." },
          ]}
        />
      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <h3 className="font-bold text-lg mt-0 mb-2">Phase 3 complete</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          You can design the synchronous side (REST, gRPC, GraphQL) and the asynchronous side (queues, Kafka, event-driven, CQRS) — and you know when each is right and when each is overkill. The next phase moves to operating these systems: caching, observability, and the patterns that keep them running. <Link href="/courses/system-design" className="text-cyan-600 hover:underline">Back to all modules →</Link>
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="event-driven-cqrs" />
    </article>
  );
}
