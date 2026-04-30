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

const CHECKPOINTS = [
  { id: "two-pc", title: "2PC and why it bites" },
  { id: "sagas", title: "Sagas: orchestration vs choreography" },
  { id: "outbox", title: "The outbox pattern" },
];

const twoPcDiagram = `sequenceDiagram
  participant C as Coordinator
  participant A as Service A (DB)
  participant B as Service B (DB)
  C->>A: PREPARE
  C->>B: PREPARE
  A-->>C: VOTE_YES (locks held)
  B-->>C: VOTE_YES (locks held)
  Note over C: All voted YES → COMMIT
  C->>A: COMMIT
  C->>B: COMMIT
  A-->>C: ACK
  B-->>C: ACK`;

export default function Page() {
  const mod = getModuleBySlug("distributed-transactions")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <ModuleProgress moduleSlug="distributed-transactions" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔗</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Three patterns for &quot;commit across services&quot; — 2PC, sagas, outbox — and the senior judgement to pick the right one. By the end, &quot;XA across services&quot; should sound like a 2008 idea, and you should be able to sketch the outbox pattern in Spring code.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Why 2PC is mostly a trap (blocking, locks held during prepare, coordinator failure)</li>
          <li>Sagas: orchestration vs choreography, compensating actions, semantic vs syntactic rollback</li>
          <li>The outbox pattern: atomically write to DB and outbox, separate poller publishes</li>
          <li>Idempotent consumers and why every event handler needs a dedup key</li>
        </ul>
      </section>

      <section>
        <h2>The transaction boundary moved, and nobody told the framework</h2>
        <p>
          A single-database transaction is one of the great gifts of relational databases. <code>BEGIN</code>, do five updates, <code>COMMIT</code>. All-or-nothing. Atomicity for free. The database does the hard work; your application gets the simple mental model.
        </p>
        <p>
          Then you split the monolith into services, each with its own database, and that gift evaporates. <strong>A Spring <code>@Transactional</code> boundary stops at the JDBC connection.</strong> If your &quot;create order&quot; call writes to the orders DB, then makes an HTTP call to the inventory service, the inventory write is outside your transaction. If the HTTP call fails after the order commits, you have an order with no inventory reservation and no automatic rollback.
        </p>
        <p>
          This is the cross-service consistency problem. Three patterns dominate the answer space, and the senior skill is knowing which one fits your shape.
        </p>
      </section>

      <Checkpoint moduleSlug="distributed-transactions" id="two-pc" title="Part 1 · 2PC and why it bites" xp={25}>
        <h2>Two-phase commit, the textbook answer</h2>
        <p>
          Two-phase commit (2PC) is the classical solution. A <strong>coordinator</strong> talks to every participant — every database, every service — in two phases:
        </p>
        <ol>
          <li><strong>Phase 1 (prepare):</strong> coordinator asks each participant &quot;can you commit this?&quot; Each participant durably writes the change to its log, acquires locks, and replies VOTE_YES or VOTE_NO. After voting yes, the participant is in a &quot;prepared&quot; state — it cannot back out, but hasn&apos;t committed yet.</li>
          <li><strong>Phase 2 (commit or abort):</strong> if every participant voted yes, the coordinator tells everyone to commit. If any voted no, everyone aborts. Participants release locks after the second message.</li>
        </ol>
        <Mermaid chart={twoPcDiagram} />
        <p>
          This is correct. It really does give you ACID across multiple databases. JTA and the XA standard formalize it. Most relational databases support it. Spring ships <code>JtaTransactionManager</code>. So why is &quot;use 2PC across services&quot; a red flag in 2026?
        </p>

        <h3>Failure mode 1: locks held during prepare</h3>
        <p>
          Between phase 1 and phase 2, every participant is holding locks on the rows it touched. If the coordinator is slow, or the network is slow, those locks stay held. Other transactions that touch those rows block. Throughput collapses.
        </p>
        <p>
          In a single-database transaction, the lock window is microseconds. In a 2PC across two services and the network, it&apos;s round-trip-time-times-two. With cross-region calls that&apos;s easily 100ms+ of held locks per transaction. At any reasonable QPS, contention pile-up is a question of when, not if.
        </p>

        <h3>Failure mode 2: coordinator failure is catastrophic</h3>
        <p>
          Imagine the coordinator crashes after every participant has voted YES, but before sending the COMMIT message. Every participant is in &quot;prepared&quot; state, holding locks, waiting for instructions that will never come. They cannot decide on their own — committing risks a vote-no participant somewhere; aborting risks rolling back data that another participant has already committed (because some side did get the COMMIT before the crash).
        </p>
        <p>
          The participants are <strong>blocked</strong>. They wait for a coordinator that may be down for minutes or hours. Locks stay held. Operators get paged. This blocking property is not a bug — it&apos;s inherent to 2PC. Three-phase commit (3PC) tries to fix it by adding a pre-commit step, but it relies on synchronous network assumptions that don&apos;t hold in real data centers, so it&apos;s rarely deployed.
        </p>

        <Callout variant="warn" title="The blocking property is fundamental">
          <p className="m-0">2PC participants in the prepared state cannot independently commit or abort — that&apos;s the whole reason it&apos;s safe. If the coordinator dies between phases, those participants are stuck. The classical workaround is to run the coordinator on top of a consensus group (Raft / Paxos) so the coordinator itself is HA — but at that point you&apos;re running consensus per cross-service transaction, which is a brutal latency tax for every business operation.</p>
        </Callout>

        <h3>Failure mode 3: the coupling tax</h3>
        <p>
          2PC requires every participant to be alive and reachable for the duration of the transaction. If the inventory service is having a bad afternoon, every order transaction that needs to talk to inventory blocks. This couples your services in exactly the way microservices are supposed to undo.
        </p>
        <p>
          A well-designed distributed system should let services degrade independently: when inventory is down, order creation should fail gracefully, not pile up locks across the entire transaction graph. 2PC actively works against that goal.
        </p>

        <h3>Where 2PC still makes sense</h3>
        <p>
          The textbook isn&apos;t lying — there are places 2PC is the right tool:
        </p>
        <ul>
          <li><strong>Within a single product&apos;s database cluster.</strong> XA across two MySQL shards owned by the same team, on the same network, with a stable coordinator. Latency and coupling are bounded.</li>
          <li><strong>Distributed databases that hide it from you.</strong> CockroachDB and TiDB run their own 2PC under the hood across shards, but the coordinator and participants are all part of one product, all on Raft, all in one operational domain. You write SQL and it Just Works.</li>
          <li><strong>Batch jobs where latency doesn&apos;t matter.</strong> Nightly settlement that needs hard atomicity across two systems and runs once a day for 30 minutes.</li>
        </ul>
        <p>
          What you almost never want: 2PC <em>between independently deployed microservices</em> across a network. The coupling, latency, and operational complexity are not worth the atomicity you get back.
        </p>

        <Quiz
          question="A team proposes using XA / JTA two-phase commit between their order service and inventory service to keep them consistent. The two services have separate databases, separate teams, and run in different deployment pipelines. What's the likely outcome?"
          options={[
            { label: "Frequent contention pile-ups (locks held during the prepare phase across the network), tight coupling between independently-deployed services, and catastrophic stalls when the coordinator or either participant is briefly unavailable. The atomicity is real but the cost is operational pain.", correct: true, explanation: "Right. 2PC across microservices is a famous anti-pattern for these exact reasons. The right answer for cross-service consistency is almost always sagas with compensations and the outbox pattern, not XA." },
            { label: "It works perfectly — XA was specifically designed for cross-service transactions.", explanation: "XA was designed for cross-resource transactions within a single application's domain (multiple databases, a queue + a database). It doesn't address the coupling, latency, or operational issues that emerge when participants are independently deployed services." },
            { label: "Performance is fine; the issue is just developer ergonomics.", explanation: "Performance is the issue, alongside coupling. Held locks during cross-network prepare phases cause throughput collapse under load." },
            { label: "It only works if both databases are PostgreSQL.", explanation: "XA is database-agnostic at the protocol level. The problem isn't the database stack." },
          ]}
          hint="What property does 2PC have between phases that gets nasty over a network?"
          xp={7}
        />

        <Quiz
          question="In a 2PC transaction, the coordinator crashes immediately after collecting VOTE_YES from all participants but before sending any COMMIT message. What state are the participants in?"
          options={[
            { label: "Blocked — they're in the 'prepared' state, holding locks, unable to decide on their own. They wait for the coordinator to recover (or for an operator to manually resolve), because either committing or aborting independently could violate atomicity.", correct: true, explanation: "Exactly. This is the famous blocking property of 2PC. Prepared participants cannot unilaterally decide because they don't know whether the coordinator already told another participant to commit. They wait, locks held, until the coordinator returns or someone intervenes." },
            { label: "They time out and abort — most 2PC implementations have a fallback abort timer.", explanation: "Aborting unilaterally violates safety: the coordinator may have already told another participant to commit before crashing. Real 2PC implementations don't auto-abort prepared transactions for this reason." },
            { label: "They commit by majority vote among themselves.", explanation: "There's no peer-to-peer voting in 2PC; the coordinator is the only decision-maker. Participants don't talk to each other." },
            { label: "Each participant decides independently based on its own log.", explanation: "Independent decisions can split — that's exactly what 2PC is designed to prevent. Participants stay blocked until coordinated recovery." },
          ]}
          hint="Why can't a prepared participant decide on its own?"
          xp={7}
        />

        <PartRecap
          title="Part 1 recap"
          gist="2PC is correct but has three production-hostile properties: held locks during prepare, blocking on coordinator failure, and tight coupling. Use it within a database cluster, not between microservices."
          points={[
            { takeaway: "Held locks across the network destroy throughput", detail: "Phase 1 to phase 2 means RTT + processing time of held locks. Over a network at any real QPS, contention piles up fast." },
            { takeaway: "Coordinator failure is blocking, not safe-aborting", detail: "Prepared participants cannot decide independently without risking a split decision. They wait for the coordinator. That's a feature, but it's expensive." },
            { takeaway: "2PC couples your services tighter than microservices intend", detail: "Every participant must be alive for the transaction. One service's bad afternoon takes down every operation that touches it." },
            { takeaway: "Acceptable inside a database cluster, not between services", detail: "CockroachDB and TiDB hide 2PC under the hood across their own shards. That's the legitimate use case. Cross-microservice XA is the anti-pattern." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="distributed-transactions" id="sagas" title="Part 2 · Sagas: orchestration vs choreography" xp={30}>
        <h2>Give up atomicity, gain decoupling</h2>
        <p>
          The saga pattern (Garcia-Molina &amp; Salem, 1987) starts from a different premise: <strong>don&apos;t try to make cross-service operations atomic. Make them eventually consistent, with explicit compensation for failure.</strong>
        </p>
        <p>
          A saga is a sequence of local transactions, each in its own service. If step 3 fails, you don&apos;t roll back — there&apos;s nothing to roll back, because each step has already committed locally. Instead, you run <strong>compensating actions</strong> for steps 1 and 2 that semantically undo them. &quot;Cancel reservation&quot; instead of &quot;rollback the reservation insert.&quot;
        </p>

        <h3>Two flavors: orchestration vs choreography</h3>

        <h4>Orchestration: a central conductor</h4>
        <p>
          One service — the saga orchestrator — explicitly drives the workflow. It calls service A, waits for the response, calls service B, and so on. If something fails, it calls the compensating actions in reverse order.
        </p>
        <ul>
          <li><strong>Pros:</strong> the workflow is in one place. Easy to read, easy to debug, easy to monitor. Failure handling is explicit. This is the right starting point for almost all real sagas.</li>
          <li><strong>Cons:</strong> the orchestrator becomes a coupling point. It needs to know about every step and every compensation. If poorly built, it slides toward becoming a distributed monolith.</li>
        </ul>

        <h4>Choreography: events all the way down</h4>
        <p>
          No central orchestrator. Each service publishes an event when it finishes its step; the next service subscribes and runs its step in response. Compensations are also event-driven: a failure event triggers each service to compensate its own work.
        </p>
        <ul>
          <li><strong>Pros:</strong> services are loosely coupled. No central component to scale or fail over. Pure event-driven shape.</li>
          <li><strong>Cons:</strong> the workflow is implicit — scattered across event handlers. Debugging a failed saga means reading every service&apos;s logs and stitching the timeline together. Cyclic event flows and accidental loops are easy to introduce. Adding a new step is hard because you have to figure out which existing services need to subscribe.</li>
        </ul>

        <Callout variant="insight" title="The default rule">
          <p className="m-0">Start with orchestration. Choreography looks elegant on a slide and becomes a debugging nightmare in production around saga step 4. Orchestration concentrates the workflow logic in one place; if you find that orchestrator is becoming a god service with a hundred steps, that&apos;s a useful smell — it usually means the boundaries are wrong, not the pattern.</p>
        </Callout>

        <h3>Compensating actions: semantic, not syntactic</h3>
        <p>
          Compensations are not database rollbacks. They&apos;re business operations that semantically undo a previous step.
        </p>
        <ul>
          <li>&quot;Reserve inventory&quot; → compensated by &quot;release reservation.&quot;</li>
          <li>&quot;Charge card&quot; → compensated by &quot;issue refund.&quot; (Note: the refund is a different transaction, possibly visible to the user.)</li>
          <li>&quot;Send confirmation email&quot; → cannot be compensated. You can only send a follow-up email saying &quot;ignore the previous one.&quot;</li>
        </ul>
        <p>
          That third bullet matters. Some operations have side effects in the real world that you can&apos;t cleanly undo. Two design moves help:
        </p>
        <ul>
          <li><strong>Order steps so irreversible ones come last.</strong> Charge the card after the reservation is confirmed. Send the email after the order is committed.</li>
          <li><strong>Accept that some compensations are visible.</strong> A refund is a real transaction the customer will see. That&apos;s the cost of giving up atomicity — eventually-consistent visible to the user, not invisible.</li>
        </ul>

        <h3>A concrete saga: order placement</h3>
        <p>
          Walk through the canonical e-commerce saga:
        </p>
        <ol>
          <li><strong>Step 1:</strong> Order Service creates an order in <code>PENDING</code> state. <em>Compensation:</em> mark order as <code>CANCELLED</code>.</li>
          <li><strong>Step 2:</strong> Inventory Service reserves stock. <em>Compensation:</em> release reservation.</li>
          <li><strong>Step 3:</strong> Payment Service charges the card. <em>Compensation:</em> issue refund.</li>
          <li><strong>Step 4:</strong> Order Service marks order as <code>CONFIRMED</code>. (No compensation needed — this is the terminal step.)</li>
        </ol>
        <p>
          If step 3 fails, the orchestrator calls compensation 2 (release reservation), then compensation 1 (cancel order). The customer sees a failed order; nothing is double-charged, nothing is double-reserved. That&apos;s the win.
        </p>

        <CodeBlock lang="java" caption="Sketch of an orchestrated saga step in Spring">{`@Service
public class OrderSaga {

  @Autowired private OrderService orders;
  @Autowired private InventoryClient inventory;
  @Autowired private PaymentClient payments;

  public OrderResult place(NewOrder req) {
    Order order = orders.createPending(req);          // step 1
    Reservation res;
    try {
      res = inventory.reserve(order.id(), req.items()); // step 2
    } catch (Exception e) {
      orders.cancel(order.id(), "inventory unavailable");
      throw new SagaFailedException("step 2", e);
    }

    PaymentResult pay;
    try {
      pay = payments.charge(order.id(), req.total());   // step 3
    } catch (Exception e) {
      inventory.release(res.id());                      // compensate 2
      orders.cancel(order.id(), "payment failed");      // compensate 1
      throw new SagaFailedException("step 3", e);
    }

    orders.confirm(order.id(), pay.txId());             // step 4 (terminal)
    return new OrderResult(order.id(), CONFIRMED);
  }
}

// In real production code: each step (and compensation) is idempotent,
// each call carries an idempotency key, and the orchestrator persists
// saga state to a database so it can resume after its own crash.`}</CodeBlock>

        <Callout variant="warn" title="Sagas without idempotency are broken sagas">
          <p className="m-0">Every step in a saga, and every compensation, must be idempotent. The orchestrator can crash mid-saga and resume; messages can be redelivered; retries can fire. If &quot;reserve inventory&quot; runs twice, you&apos;d better not double-reserve. Pass an idempotency key on every call (usually the saga ID + step number), check for it server-side, return the prior result if you&apos;ve seen it before.</p>
        </Callout>

        <h3>Match the workload to the right pattern</h3>
        <ClassifyChallenge
          title="Match the cross-service consistency pattern to the workload"
          prompt="Which pattern fits each scenario most cleanly?"
          buckets={[
            { id: "two-pc-ok", label: "2PC (within a DB cluster)", color: "rose" },
            { id: "saga-orch", label: "Saga (orchestrated)", color: "indigo" },
            { id: "saga-choreo", label: "Saga (choreographed)", color: "amber" },
            { id: "no-cross-service", label: "Don't make it cross-service", color: "emerald" },
          ]}
          items={[
            { id: "ecom-order", label: "E-commerce order spanning order, inventory, and payment services with clear linear flow.", answer: "saga-orch", explanation: "Linear, multi-step, with explicit failure points. Orchestration keeps the workflow visible and debuggable. The canonical saga case." },
            { id: "user-pref", label: "Updating a user's profile preferences across notifications and email-prefs services where order doesn't matter.", answer: "saga-choreo", explanation: "Loose coupling, no strict ordering, simple events. Choreography fits — no orchestrator earning its keep." },
            { id: "ledger", label: "Two-leg ledger transfer between accounts that both live in the same financial database cluster.", answer: "two-pc-ok", explanation: "Same DB cluster, single team, bounded latency, hard atomicity required. 2PC inside the database (or just a single-DB transaction if both accounts share a shard) is fine." },
            { id: "fake-microservice", label: "A 'create user' flow that's been split across three microservices but is always called as one atomic operation by the same UI.", answer: "no-cross-service", explanation: "If it's always one logical operation, you've split it incorrectly. The fix is the boundary, not a saga. Merging the three services back into one (or one new bounded context) is cleaner than infrastructure to coordinate them." },
            { id: "settle", label: "Nightly batch settlement across two databases owned by the same team, latency not a concern, hard atomicity required.", answer: "two-pc-ok", explanation: "Latency-tolerant, single team, hard atomicity required. XA / 2PC is fine here; the cost is bounded and acceptable for a batch job." },
            { id: "trip", label: "Booking a trip: hotel + flight + car rental, each in a separate service, with explicit cancel-and-refund logic if any step fails.", answer: "saga-orch", explanation: "Multi-step, multi-service, well-defined compensations. Orchestrate it — the workflow is exactly what an orchestrator is for." },
          ]}
        />

        <Quiz
          question="A team is choosing between orchestrated and choreographed sagas. What's the most defensible default position?"
          options={[
            { label: "Start with orchestration. Centralized workflow logic is easier to read, debug, and evolve. Move to choreography only if you have a clear reason — usually that the orchestrator is becoming a coupling point and the steps are genuinely independent.", correct: true, explanation: "Right. Orchestration is the boring, debuggable choice. Choreography looks elegant but spreads the workflow across services and obscures the timeline when something fails. Many teams who start with choreography end up reverse-engineering an implicit orchestrator from logs." },
            { label: "Start with choreography. Loose coupling is the default in microservices.", explanation: "Loose coupling at the service level doesn't mean implicit workflows. Choreography couples services through events and shared assumptions about ordering — often more painfully than an orchestrator." },
            { label: "Either is fine; the choice doesn't matter at scale.", explanation: "It matters a lot during incident response. Tracing a failed orchestrated saga is reading one service's logs. Tracing a failed choreographed one is reading every service's logs and reconstructing the timeline." },
            { label: "Always avoid sagas; use 2PC instead.", explanation: "2PC across services has its own well-documented problems (covered in Part 1). Sagas are the better default for cross-service flows." },
          ]}
          hint="Which pattern keeps the workflow legible when something fails?"
          xp={7}
        />

        <Quiz
          question="A saga orchestrator crashes in the middle of step 3 (payment charge). When it restarts, what does it need to safely resume?"
          options={[
            { label: "Persisted saga state (saga ID, completed steps, current step), plus idempotent step calls so re-issuing step 3 doesn't double-charge. The orchestrator reads its saga record from a database, sees it was mid-step-3, and re-issues with the same idempotency key.", correct: true, explanation: "Right. Two pieces: durable saga state and idempotent steps. State so the orchestrator knows where it was; idempotency so re-running a step is safe. Without either, restart turns into a guess about what already happened." },
            { label: "Just retry the entire saga from step 1 — it's simpler.", explanation: "That double-runs step 1 and step 2, which double-creates orders and double-reserves inventory unless those operations are idempotent and keyed. You're still depending on idempotency anyway, so you might as well resume from step 3." },
            { label: "Roll back everything and tell the user to retry.", explanation: "Rolling back also requires idempotent compensations, and it's wasteful — you'd be undoing successful work because the orchestrator hiccuped. Resumption is cleaner if the design supports it." },
            { label: "Rely on the message broker's exactly-once semantics.", explanation: "Even if the broker offers exactly-once, the orchestrator's actions on external services are at-least-once at best. Idempotency is non-negotiable." },
          ]}
          hint="What does the orchestrator persist, and what does each step have to be?"
          xp={8}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Sagas trade atomicity for decoupling. Use orchestration as the default; reserve choreography for genuinely loose flows. Every step and every compensation must be idempotent."
          points={[
            { takeaway: "Compensations are semantic, not syntactic", detail: "'Release reservation' instead of 'rollback the insert.' Some actions (sent emails, charged cards) cannot be cleanly undone — order them late, accept that some compensations are visible to the user." },
            { takeaway: "Orchestration first, choreography rarely", detail: "Centralized workflow logic is debuggable and obvious. Choreography spreads the timeline across services and obscures failure modes. Default to orchestration; switch only with a real reason." },
            { takeaway: "Idempotency is non-negotiable", detail: "Every saga step and every compensation must be safe to retry. Pass an idempotency key (saga ID + step number) and dedupe server-side. Without this, your saga is one redelivered message away from a duplicate charge." },
            { takeaway: "Persist saga state", detail: "The orchestrator can crash. Resume from durable state, not from memory. Saga state usually lives in the orchestrator's own database, in the same transaction as starting the saga." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="distributed-transactions" id="outbox" title="Part 3 · The outbox pattern" xp={30}>
        <h2>The dual-write problem</h2>
        <p>
          Even with sagas, there&apos;s a tiny but lethal problem hiding in every step. Look at this innocent code:
        </p>
        <CodeBlock lang="java" caption="The dual-write trap (broken)">{`@Transactional
public Order createOrder(NewOrder req) {
  Order order = orderRepo.save(toEntity(req));          // 1. write to DB
  kafkaTemplate.send("order-created", toEvent(order));  // 2. publish event
  return order;
}`}</CodeBlock>
        <p>
          Looks fine. It is broken. Two writes, two systems (Postgres and Kafka), no shared transaction. Failure cases:
        </p>
        <ul>
          <li><strong>DB commits, broker call fails:</strong> order exists, no event published. Downstream services never hear about it. Inventory never reserves stock. Customer is charged for an order that the rest of the system doesn&apos;t know exists.</li>
          <li><strong>Broker call succeeds, DB rolls back:</strong> event was published, but the order doesn&apos;t exist. Downstream services act on a phantom order.</li>
          <li><strong>Broker call timeout, retry succeeds:</strong> event published twice. Without idempotency downstream, work happens twice.</li>
        </ul>
        <p>
          This is the dual-write problem, and it&apos;s the silent killer of event-driven architectures. Every team writes this code. Every team eventually finds the inconsistencies in production.
        </p>

        <h3>The outbox pattern: one transaction, one source of truth</h3>
        <p>
          The fix is structural: <strong>write the event to your own database, in the same transaction as the business write.</strong> A separate background process polls the events table and publishes them to the broker.
        </p>
        <ol>
          <li>In one DB transaction: write the business row + write a row to <code>outbox</code> table containing the event payload.</li>
          <li>A poller reads unpublished outbox rows, publishes them to Kafka, marks them as published.</li>
          <li>The broker is the source of eventual delivery. The DB is the source of truth.</li>
        </ol>
        <p>
          Either both writes commit (event will eventually publish) or both abort (no event, no business write). The dual-write problem dissolves because there&apos;s only one transaction.
        </p>

        <CodeBlock lang="java" caption="Outbox pattern: write business state and outbox row atomically">{`// 1) Single transaction: business write + outbox row
@Transactional
public Order createOrder(NewOrder req) {
  Order order = orderRepo.save(toEntity(req));
  OutboxEntry entry = new OutboxEntry(
      UUID.randomUUID(),
      "order-created",
      order.id().toString(),       // partition key for Kafka
      toJson(toEvent(order)),      // payload
      Instant.now()
  );
  outboxRepo.save(entry);
  return order;
}

// 2) Separate poller: read unpublished rows, publish, mark sent
@Component
public class OutboxPoller {
  @Autowired private OutboxRepo outbox;
  @Autowired private KafkaTemplate<String, String> kafka;

  @Scheduled(fixedDelay = 500)
  public void publish() {
    List<OutboxEntry> batch = outbox.findUnpublished(100);
    for (OutboxEntry e : batch) {
      kafka.send(e.topic(), e.partitionKey(), e.payload()).whenComplete((r, ex) -> {
        if (ex == null) outbox.markPublished(e.id(), Instant.now());
        // on failure: do nothing — we'll retry on next tick (idempotent)
      });
    }
  }
}`}</CodeBlock>

        <h3>What the outbox actually buys you</h3>
        <ul>
          <li><strong>Atomicity with the business write.</strong> One transaction. Either both happen or neither.</li>
          <li><strong>At-least-once publishing.</strong> The poller retries failed publishes. Eventually the event lands.</li>
          <li><strong>Replayability.</strong> The outbox is a log. If you screw up downstream, you can re-publish from a point in time.</li>
          <li><strong>No XA, no JTA, no distributed transaction manager.</strong> Just plain old database transactions and a polling job.</li>
        </ul>

        <Callout variant="spring" title="Outbox in Spring — the pieces">
          <p className="m-0">A production outbox in Spring Boot needs five things: an <code>outbox</code> table (id, topic, key, payload, created_at, published_at), a JPA entity + repo, a <code>@Scheduled</code> poller (or a Debezium connector that tails the table via CDC — even better), idempotency on the consumer side, and an alert on outbox depth (rows older than N seconds without being published). The CDC variant via Debezium turns the poll into a tail of the WAL, which is faster and lighter on the database — that&apos;s the modern shape if you&apos;re running Postgres or MySQL.</p>
        </Callout>

        <h3>The trade you&apos;re making</h3>
        <p>
          The outbox isn&apos;t free:
        </p>
        <ul>
          <li><strong>Latency:</strong> the poller introduces a delay between commit and publish — typically 100ms to a few seconds. For most workflows that&apos;s fine; for time-sensitive ones (real-time fanout) you may need CDC instead of polling.</li>
          <li><strong>At-least-once, not exactly-once:</strong> retries can cause duplicate publishes. Consumers must be idempotent.</li>
          <li><strong>Outbox table grows:</strong> archive published rows on a schedule. Don&apos;t let the table grow unbounded.</li>
          <li><strong>Order isn&apos;t guaranteed across keys:</strong> the poller publishes in the order it reads, but Kafka partitioning may interleave events for different keys. Same key on the same partition is still ordered.</li>
        </ul>

        <h3>Idempotent consumers: the other half of the deal</h3>
        <p>
          The outbox guarantees at-least-once delivery from your service. Your consumers must handle the &quot;at-least&quot; part — duplicate messages are normal, not exceptional. The standard pattern:
        </p>
        <ul>
          <li>Every event carries a stable ID (UUID, or &quot;source_id + version&quot;).</li>
          <li>Consumer keeps a <code>processed_events</code> table keyed on that ID.</li>
          <li>On receipt: check if ID is already processed. If yes, ack and skip. If no, process and record ID — in the same transaction as the business write, ideally.</li>
        </ul>
        <p>
          That&apos;s it. Two tables (outbox on the producer side, processed-events on the consumer side) and the dual-write problem and the redelivery problem both go away.
        </p>

        <Callout variant="info" title="Why outbox beats XA in modern systems">
          <p className="m-0">XA gives you exactly-once across DB and broker — at the cost of distributed locks, coordinator complexity, and a hard dependency on every participant supporting XA. The outbox gives you at-least-once with idempotent consumers — at the cost of a small latency window and some boilerplate. For event-driven systems built on Kafka/SQS/Pub-Sub, the outbox approach is faster, simpler, more resilient, and more debuggable. XA support in modern brokers is sketchy anyway. The industry has voted: outbox wins.</p>
        </Callout>

        <Quiz
          question="A team has the dual-write problem: their order service writes to Postgres and then publishes a Kafka event in the same method. They've seen lost events when Kafka has a brief outage. Why does the outbox pattern fix this?"
          options={[
            { label: "Outbox makes the event 'durable' inside the same database transaction as the business write. The publishing step becomes a separate process that retries until the broker accepts the event — there's no longer a moment where the DB committed but the event was lost.", correct: true, explanation: "Right. The dual-write becomes a single-write to one transactional system (the DB). The broker publication is decoupled and retried independently. If the broker is down for an hour, the outbox table fills up; once the broker recovers, the poller drains it. Nothing is lost." },
            { label: "Outbox uses Kafka's exactly-once producer mode, which prevents lost events.", explanation: "Outbox is broker-agnostic. Even with Kafka idempotent producers, the dual-write problem (DB + broker as separate transactions) persists. Outbox solves it structurally by removing the second write." },
            { label: "Outbox replicates events to multiple brokers for redundancy.", explanation: "That's broker-side redundancy (e.g. Kafka replication). Outbox is about the producer-side dual-write problem, not broker availability." },
            { label: "Outbox uses XA / 2PC between Postgres and Kafka.", explanation: "Specifically, outbox avoids XA. The whole point is that the producer commits one transaction (DB) and lets a separate poller handle delivery." },
          ]}
          hint="What's the second 'write' in the dual-write problem, and what does outbox do to it?"
          xp={8}
        />

        <Quiz
          question="A team uses the outbox pattern but their downstream consumers don't dedupe on event ID. What can go wrong?"
          options={[
            { label: "Duplicate processing. The outbox poller can retry on broker errors, and Kafka itself can redeliver. Without consumer-side idempotency, every redelivery causes the consumer to do its work twice — duplicate inventory reservations, duplicate emails, duplicate charges.", correct: true, explanation: "Right. The outbox guarantees at-least-once delivery. The 'at least' is the part the consumer must handle — and the standard tool is a processed-events table keyed on event ID, checked in the same transaction as the consumer's business write." },
            { label: "Nothing — the outbox already guarantees exactly-once.", explanation: "Outbox is at-least-once, not exactly-once. Idempotent consumers are the second half of the design. Without them, the safety guarantee is incomplete." },
            { label: "The outbox table fills up forever.", explanation: "That's a separate operational concern (archiving). Consumer-side dedup is unrelated to outbox table growth." },
            { label: "Kafka rebalances will lose events.", explanation: "Kafka rebalances don't lose events when consumer offsets are committed correctly. The risk here is duplicate processing on redelivery, which idempotent consumers prevent." },
          ]}
          hint="What does 'at-least-once' mean for the consumer's responsibility?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The outbox pattern eliminates the dual-write problem by writing the event to the DB in the same transaction as the business state, then letting a separate poller publish. Consumers must be idempotent."
          points={[
            { takeaway: "Dual-write is silent and lethal", detail: "DB write + broker publish in the same method without a shared transaction is broken by design. Every team writes this code. Every team eventually finds the inconsistencies." },
            { takeaway: "Outbox: one transaction, two side effects", detail: "Business write + outbox row in one transaction. A separate poller (or CDC tail via Debezium) publishes the outbox rows to the broker. No XA, no JTA, plain database transactions." },
            { takeaway: "At-least-once + idempotent consumers", detail: "Outbox guarantees at-least-once delivery. Consumers must dedupe on event ID — usually with a processed-events table written in the same transaction as the consumer's business write." },
            { takeaway: "Outbox > XA in modern event-driven systems", detail: "XA across broker + DB is operationally fragile and broker support is uneven. Outbox is the boring, reliable, debuggable answer that the industry has converged on." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Three patterns, one question</h2>
        <p>
          The senior question for any cross-service operation: <strong>what guarantee do I need, and what cost am I willing to pay?</strong>
        </p>
        <ul>
          <li>Hard atomicity inside one product, low-latency-tolerant: 2PC, but only inside a database cluster you control.</li>
          <li>Eventual consistency across services, with explicit failure handling: orchestrated saga + outbox per step.</li>
          <li>Loose event-driven flows where no single owner makes sense: choreographed saga, with the outbox pattern still on every producer.</li>
        </ul>
        <p>
          The outbox is the load-bearing primitive in modern event-driven architectures. Whether you orchestrate or choreograph above it, the outbox is what keeps the events durably linked to the data.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Clocks, time, and ordering. Why physical clocks lie, what Lamport timestamps and vector clocks actually buy you, and where TrueTime and HLC fit in the picture. The substrate beneath every distributed system.
        </p>
        <Link
          href="/courses/system-design/modules/clock-time"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Clocks &amp; Time →
        </Link>
      </section>
    </article>
  );
}
