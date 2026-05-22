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
  { id: "deep", title: "Webhooks, sagas & PCI" },
  { id: "advanced", title: "Advanced concerns" },
];

const flowChart = `flowchart LR
  Client[Client App] -->|tokenize card| Stripe[(Stripe / Adyen)]
  Stripe -->|payment_method_id| Client
  Client -->|charge with idem-key| API[Payments API]
  API -->|check idempotency| IdemDB[(Idempotency Store)]
  API -->|create charge intent| Stripe
  Stripe -->|webhook| WebhookSvc[Webhook Handler]
  WebhookSvc -->|verify HMAC and append| Ledger[(Ledger)]
  WebhookSvc -->|publish payment.captured| Kafka[(Kafka)]
  Kafka --> Recon[Reconciliation Job]
  Kafka --> Notif[Notifier]
  style Ledger fill:#dbeafe,stroke:#2563eb
  style Stripe fill:#fef3c7,stroke:#d97706
  style Kafka fill:#fce7f3,stroke:#db2777`;

export default function Page() {
  const mod = getModuleBySlug("design-payments")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
      </header>
      <BookmarkButton courseId="system-design" moduleSlug="design-payments" />

      <ModuleProgress moduleSlug="design-payments" checkpoints={CHECKPOINTS} />

      <section className="mb-10">
        <h2>What you&apos;ll walk out with</h2>
        <ul>
          <li>An immutable double-entry ledger that&apos;s safe to audit five years from now.</li>
          <li>Idempotency keys done the way Stripe does them — once, correctly.</li>
          <li>A webhook handler that survives the gateway retrying you eight times.</li>
          <li>A reconciliation job that catches the discrepancies you didn&apos;t know you had.</li>
          <li>A working understanding of PCI scope: what to never touch, and what tokens to keep.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2>The opener</h2>
        <p>
          Payment systems fail in expensive ways. A double-charge is a refund and a ticket. A missed charge is revenue you never see.
          A leaked card number is a regulatory event. The interview wants to know: do you understand that this is one of the few
          systems where <strong>correctness beats throughput, every time</strong>?
        </p>
        <p>
          The good news: the architectural moves that make a payment system correct (immutability, idempotency, explicit state
          transitions, audit trails) are all well-known. You just have to apply them rigorously and not invent anything clever.
          Cleverness in payments is how you end up on a postmortem.
        </p>
        <Callout variant="insight" title="Frame the problem in one sentence">
          A payment system is a state machine over money, replicated across your books and a third party&apos;s books, that must agree
          eventually and survive every retry, crash, and reorg in between.
        </Callout>
      </section>

      <Checkpoint moduleSlug="design-payments" id="reqs" title="Part 1 · Requirements & estimation" xp={25}>
        <h3>Functional scope</h3>
        <ul>
          <li>Charge a card on file. Refund part or all of a charge. Capture a previously authorized charge.</li>
          <li>Settle funds out to merchants/drivers (payouts).</li>
          <li>Provide a clean audit trail: every cent in, every cent out, traceable to a source.</li>
          <li>Handle disputes/chargebacks with full provenance.</li>
        </ul>
        <h3>What we&apos;ll defer</h3>
        <ul>
          <li>Multi-currency FX (real, but a separate module — focus today is on a single currency).</li>
          <li>Card issuing (very different domain).</li>
          <li>Fraud scoring as a deep system (we&apos;ll mention the integration point).</li>
        </ul>
        <h3>Non-functional targets</h3>
        <ul>
          <li><strong>Correctness:</strong>{" "}the ledger must always balance. Sum of debits == sum of credits, always.</li>
          <li><strong>Idempotency:</strong>{" "}same idempotency-key + same request body must produce the same outcome, forever.</li>
          <li><strong>Latency:</strong>{" "}charge p99 under 2s (gateway-bound; you don&apos;t control Stripe).</li>
          <li><strong>Availability:</strong> 99.99% on the charge path. A failed charge is a lost sale.</li>
          <li><strong>Durability:</strong>{" "}ledger entries are never deleted, never updated. Append-only.</li>
        </ul>
        <h3>Back-of-envelope</h3>
        <p>
          Mid-size marketplace: 50 transactions/sec average, 500/sec peak. Ledger entries are ~200 bytes each, two per transaction
          (debit + credit, minimum). 500 tx/sec × 2 × 200 bytes = ~200 KB/sec writes. That&apos;s tiny. The hard part isn&apos;t
          throughput — it&apos;s correctness under retries.
        </p>
        <Callout variant="warn" title="Money is integers">
          Never represent currency as a float. <code>0.1 + 0.2 != 0.3</code>. Use integer minor units (cents, paise, satoshi) and a
          currency code. Every payment system that uses floats has a story about a $0.01 reconciliation discrepancy that took two
          engineers a week to track down.
        </Callout>
        <Quiz
          question="Why is the ledger append-only?"
          options={[
            { label: "Append-only writes are faster than updates on most databases", correct: false, explanation: "True for some workloads, but not the reason. Throughput is a happy side effect, not the goal." },
            { label: "Auditors and regulators require an immutable record of every financial event, and corrections must themselves be visible as events (reversing entries)", correct: true, explanation: "Mutating a ledger row destroys the audit trail. Errors are corrected by appending a reversing entry, never by editing history." },
            { label: "It avoids row-level locking under contention", correct: false, explanation: "Concurrency is a real concern, but the primary reason is auditability and immutability of financial truth." },
            { label: "It makes replication easier across regions", correct: false, explanation: "Replication is easier with an event log, but again — the driving requirement is audit, not replication." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-payments" id="design" title="Part 2 · High-level design" xp={30}>
        <h3>The double-entry ledger</h3>
        <p>
          Every financial event becomes <strong>two or more</strong>{" "}ledger entries that sum to zero. A charge to a rider for $20
          looks like:
        </p>
        <CodeBlock lang="plain" caption="ledger.sql — entries for a charge + payout">{`-- Charge $20 from rider to platform
INSERT INTO ledger (txn_id, account, amount_cents, currency, type, ts)
VALUES
  ('txn_abc', 'rider:42:cash',          -2000, 'USD', 'CHARGE',  now()),
  ('txn_abc', 'platform:revenue',        2000, 'USD', 'CHARGE',  now());

-- Settle $16 of it to the driver (platform takes $4 cut)
INSERT INTO ledger (txn_id, account, amount_cents, currency, type, ts)
VALUES
  ('txn_abc', 'platform:revenue',       -2000, 'USD', 'PAYOUT',  now()),
  ('txn_abc', 'driver:99:earnings',      1600, 'USD', 'PAYOUT',  now()),
  ('txn_abc', 'platform:fees',            400, 'USD', 'FEE',     now());`}</CodeBlock>
        <p>
          Sum across all entries for txn_abc = 0. Sum across any single account over time = its balance. To compute &quot;what does
          the rider owe right now,&quot; you sum their account. To compute &quot;what does the platform owe drivers,&quot; you sum the
          driver-earnings accounts.
        </p>

        <h3>Idempotency keys</h3>
        <p>
          The client sends an <code>Idempotency-Key</code> header (a UUID they generate before the first attempt). The server stores
          a record keyed by that header containing the request hash and the response. On retry:
        </p>
        <ul>
          <li>Same key, same request body hash → return the cached response. Don&apos;t hit the gateway again.</li>
          <li>Same key, different body → 422. The client is buggy.</li>
          <li>Same key, in-flight → block the duplicate, return 409 or wait for the original.</li>
          <li>New key → process normally, store the result before responding.</li>
        </ul>

        <CodeBlock lang="java" caption="ChargeController.java — idempotent charge endpoint">{`@PostMapping("/v1/charges")
public ResponseEntity<Charge> createCharge(
        @RequestHeader("Idempotency-Key") String idemKey,
        @RequestBody ChargeRequest req) {

    String bodyHash = sha256(req);

    // Atomic insert-or-fetch.
    var existing = idempotencyStore.tryClaim(idemKey, bodyHash);
    if (existing.isCached()) {
        return ResponseEntity.status(existing.statusCode())
            .body(existing.body(Charge.class));
    }
    if (existing.isMismatch()) {
        throw new IdempotencyConflict(idemKey);
    }
    if (existing.isInFlight()) {
        return ResponseEntity.status(409).build();
    }

    try {
        Charge charge = chargeService.charge(req);
        idempotencyStore.commit(idemKey, 200, charge);
        return ResponseEntity.ok(charge);
    } catch (Exception e) {
        idempotencyStore.fail(idemKey, e);
        throw e;
    }
}`}</CodeBlock>

        <Callout variant="spring" title="Stripe's rule of thumb">
          The client owns the idempotency key. The server owns the response. If a network blip drops the response on the floor, the
          client retries with the same key and gets the original response back — never a duplicate charge.
        </Callout>

        <h3>The end-to-end flow</h3>
        <Mermaid chart={flowChart} />
        <p>
          Three things to notice. <strong>One:</strong>{" "}the card number never touches your servers. The client tokenizes via
          Stripe&apos;s SDK; you only see <code>pm_xxx</code> tokens. <strong>Two:</strong>{" "}the gateway is the source of truth for
          &quot;did the charge succeed?&quot; — the webhook is what finalizes your ledger. <strong>Three:</strong>{" "}reconciliation is
          a real job, not a belief that the gateway and your books always match.
        </p>

        <h3>API surface</h3>
        <CodeBlock lang="plain" caption="HTTP API — charges, refunds, payouts, webhooks">{`POST /v1/charges
  Headers: Idempotency-Key: uuid
  Body: { amount_cents, currency, payment_method, customer_id, description, metadata }
  -> 200 { charge_id, status: "succeeded" | "pending" | "failed" }

POST /v1/charges/{id}/refund
  Headers: Idempotency-Key: uuid
  Body: { amount_cents } # partial allowed
  -> 200 { refund_id, status }

POST /v1/payouts
  Headers: Idempotency-Key: uuid
  Body: { destination_account, amount_cents, currency }
  -> 200 { payout_id, status: "in_transit" | "paid" | "failed" }

POST /v1/webhooks/stripe   # gateway -> us, signed
  Headers: Stripe-Signature: t=..,v1=..
  Body: { type, data, ... }
  -> 200 (within 5s)`}</CodeBlock>

        <PartRecap
          title="Part 2 recap"
          gist="The ledger is immutable and balanced. Idempotency keys are the contract between client and server. The gateway is the source of truth for outcomes; you mirror them via webhooks."
          points={[
            { takeaway: "Two entries minimum, sum to zero", detail: "Refunds, fees, payouts all decompose into balanced entries. If you can't make it balance, you can't append it." },
            { takeaway: "Idempotency-Key is sacred", detail: "Same key + same body = same response, forever. Store the response, not just a flag." },
            { takeaway: "Tokenize, don't store", detail: "PAN (card number) never lands on your servers. Stripe/Adyen tokens are PCI-safe to keep." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-payments" id="deep" title="Part 3 · Webhooks, sagas & PCI scope" xp={30}>
        <h3>Webhook handling — the part everyone gets wrong</h3>
        <p>
          Stripe will retry webhooks for up to 3 days on non-2xx responses. Your handler must be idempotent (events have IDs;
          dedupe), signature-verified (HMAC over the raw body with a shared secret), and replay-protected (reject events older than
          5 minutes by their <code>Stripe-Signature</code> timestamp). Get any of these wrong and you&apos;ll either double-credit a
          ledger entry or accept a forged event from a malicious caller.
        </p>
        <CodeBlock lang="java" caption="StripeWebhookController.java — verify, dedupe, dispatch">{`@PostMapping(value = "/v1/webhooks/stripe", consumes = "application/json")
public ResponseEntity<Void> stripeWebhook(
        HttpServletRequest request,
        @RequestHeader("Stripe-Signature") String signature) throws IOException {

    // 1. Read raw bytes — signature is over the exact wire payload.
    byte[] rawBody = request.getInputStream().readAllBytes();

    // 2. Verify HMAC with replay protection.
    SignatureHeader parsed = SignatureHeader.parse(signature);
    if (Math.abs(now().getEpochSecond() - parsed.timestamp()) > 300) {
        return ResponseEntity.status(400).build(); // replay window exceeded
    }
    String expected = hmacSha256(secret, parsed.timestamp() + "." + new String(rawBody));
    if (!constantTimeEquals(expected, parsed.v1())) {
        return ResponseEntity.status(400).build(); // tampered or wrong secret
    }

    // 3. Parse and dedupe by event ID.
    StripeEvent event = mapper.readValue(rawBody, StripeEvent.class);
    if (eventStore.alreadyProcessed(event.id())) {
        return ResponseEntity.ok().build(); // safe replay
    }

    // 4. Dispatch — keep this fast. Heavy work goes to a queue.
    switch (event.type()) {
        case "charge.succeeded" -> handler.onChargeSucceeded(event);
        case "charge.refunded"  -> handler.onChargeRefunded(event);
        case "payout.failed"    -> handler.onPayoutFailed(event);
        default -> log.info("ignored event type {}", event.type());
    }

    eventStore.markProcessed(event.id());
    return ResponseEntity.ok().build();
}`}</CodeBlock>
        <Callout variant="warn" title="Always 200 once you've persisted">
          If you do work and then crash before responding 200, Stripe retries — and your dedupe by event ID handles that. If you
          respond 500 because the database was momentarily slow, Stripe retries — fine. But if you persist the ledger entry and
          then return 500 because of a downstream notification failure, you&apos;ve guaranteed a duplicate next attempt.
          Persist atomically, then 200, then notify.
        </Callout>

        <h3>Sagas for multi-step payments</h3>
        <p>
          A payout to a driver involves: deducting from platform balance → calling the bank rail → marking the payout as in-transit
          → eventually confirming success or failure. If step 3 succeeds and step 4 reports failure, you need a <strong>compensating
          action</strong>: append a reversing entry that puts the money back. The saga is just a state machine over &quot;what
          happened&quot; with explicit forward and compensating steps; the ledger captures the truth at every step.
        </p>

        <h3>Reconciliation</h3>
        <p>
          Every night, pull the gateway&apos;s settlement report. For each line in the report, find the matching ledger entry. Flag
          mismatches: gateway has it but we don&apos;t (we missed a webhook), we have it but gateway doesn&apos;t (we charged on a
          stale token), or amounts differ (rounding, refunds, FX). Mismatches go into an ops queue with severity.
        </p>
        <p>
          Reconciliation is not optional. Without it, small drift compounds into &quot;why are we $400 off this quarter?&quot;
        </p>

        <h3>PCI scope — what to keep, what to never see</h3>
        <ClassifyChallenge
          title="Sort each item by where it can live in your system"
          prompt="PCI scope is decided by what data you touch. Tokenize aggressively, store nothing dangerous, and most of the audit becomes a paperwork exercise."
          buckets={[
            { id: "ours", label: "Safe to store on our servers", color: "emerald" },
            { id: "tokenized", label: "Only as a gateway token", color: "indigo" },
            { id: "never", label: "Never touch our servers (PCI scope explosion)", color: "rose" },
          ]}
          items={[
            { id: "pan", label: "Customer's full card number (PAN)", answer: "never", explanation: "PAN exposure puts you in PCI-DSS Level 1 scope. Tokenize via the gateway SDK on the client and never let it land on your servers." },
            { id: "cvv", label: "Card CVV / CVC", answer: "never", explanation: "Storing the CVV is explicitly forbidden by PCI-DSS — even momentarily, even encrypted. The gateway uses it once for the auth and discards it." },
            { id: "pm", label: "Stripe payment_method_id (pm_1Nxxx)", answer: "tokenized", explanation: "Opaque to your servers — useless without Stripe's auth. Safe to store and reuse for the same customer." },
            { id: "last4", label: "Last 4 digits of the card", answer: "ours", explanation: "Display metadata, not a chargeable secret. Used for the 'Visa ending in 4242' UI." },
            { id: "brand", label: "Card brand (Visa, Mastercard)", answer: "ours", explanation: "Display metadata, not sensitive. Often returned by the gateway alongside the token." },
            { id: "exp", label: "Card expiration month/year", answer: "tokenized", explanation: "PCI-DSS classifies exp date as cardholder data when stored alongside the PAN. Easiest path: keep it inside the gateway and reference via the token." },
            { id: "email", label: "Customer's billing email", answer: "ours", explanation: "PII (governed by GDPR/CCPA), but not PCI scope. Standard handling applies — encrypt at rest and limit access." },
            { id: "amount", label: "Charge amount and currency", answer: "ours", explanation: "Not sensitive. You need it on the ledger and in your analytics." },
            { id: "track", label: "Magnetic stripe / chip data", answer: "never", explanation: "Track data is the most sensitive bucket — storing it is a PCI fast-track to fines. Card-present terminals talk directly to the gateway." },
          ]}
        />
        <p>
          The principle: anything that could be used to charge the card on its own is &quot;never.&quot; Anything that&apos;s an
          opaque pointer the gateway resolves is &quot;tokenized.&quot; Display metadata (last 4, brand) is yours to keep — it&apos;s
          how you build the &quot;Visa ending in 4242&quot; UI without ever seeing the rest of the card.
        </p>

        <PartRecap
          title="Part 3 recap"
          gist="Webhooks are the gateway's voice — verify signatures, dedupe by event ID, persist atomically before responding 200. Sagas + compensating entries handle multi-step flows. Reconciliation is a nightly job, not a hope."
          points={[
            { takeaway: "Verify signatures over raw bytes", detail: "Reparsing JSON before verifying breaks the signature. Read the body once as bytes, hash it, then parse." },
            { takeaway: "Compensating entries, not deletes", detail: "If a payout fails after the deduction, append a reversing entry. The original entry stays as historical truth." },
            { takeaway: "Reconcile or drift", detail: "Without a nightly job comparing your books to the gateway's books, you'll discover discrepancies in an audit instead of a dashboard." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-payments" id="advanced" title="Part 4 · Advanced concerns" xp={20}>
        <h3>Scaling the ledger</h3>
        <p>
          A single Postgres table with billions of rows is fine for years if you index right (primary key on (txn_id, account, ts),
          partitioned monthly). When you outgrow it, partition by account-prefix to keep each shard&apos;s account-balance queries
          local. For aggregated balance lookups under load, materialize per-account running totals into a snapshot table updated
          atomically with each ledger append.
        </p>

        <h3>The fraud score integration</h3>
        <p>
          Before calling the gateway, send the charge to a fraud service. It returns a score in low milliseconds. Below a threshold,
          proceed. In a &quot;review&quot; band, hold the charge in a PENDING state and notify ops. Above a threshold, reject. The
          fraud service is a black box from your perspective — feature engineering is its team&apos;s problem; you just integrate
          its score into the state machine.
        </p>

        <h3>Multi-region durability</h3>
        <p>
          The ledger is the most important piece of state in your company. Synchronous replication to at least one other region is
          worth the latency cost. A regional outage that loses ledger entries is the kind of incident that ends careers. Webhook
          handling can be active-active on event ID dedupe; ledger writes are leader-followed with synchronous replication on the
          critical write.
        </p>

        <h3>What I&apos;d skip in a 45-minute interview</h3>
        <p>
          FX rates, tax computation, payout scheduling, dispute workflow internals. Mention them, name the integration points
          (Stripe Connect for payouts, Stripe Tax for taxes), and move on. The interviewer wants to see the ledger and idempotency
          done correctly.
        </p>

        <Quiz
          question="Your webhook handler crashed after writing a ledger entry but before sending the success notification. Stripe retries the webhook. What's the safe behavior?"
          options={[
            { label: "Skip the dedupe check this time so you can re-send the notification", correct: false, explanation: "Skipping dedupe means a duplicate ledger entry. Worse than a missed notification." },
            { label: "Dedupe on the Stripe event ID, return 200, and let a separate notification retry job handle the missed email", correct: true, explanation: "The ledger is the source of truth. The notification is a side-effect that owns its own retry policy. Don't entangle them." },
            { label: "Roll back the ledger entry so you can replay everything cleanly", correct: false, explanation: "The ledger is append-only. Rollbacks are reversing entries, and you don't need one — the original entry is correct." },
            { label: "Return 500 to Stripe so it retries until the notification works", correct: false, explanation: "You'd flood the gateway with retries and accumulate event-store noise. The notification has its own retry path." },
          ]}
        />

        <PartRecap
          title="Closing posture"
          gist="In an interview: the ledger and idempotency are your headline. Tokenization, webhook verification, and reconciliation are the supporting pillars. Everything else is named and deferred."
          points={[
            { takeaway: "Boring is the goal", detail: "Cleverness in payments is a code smell. Append, balance, idempotent — say these words often." },
            { takeaway: "Treat the gateway as authoritative", detail: "Your books mirror their books. Webhooks finalize. Reconciliation catches the rest." },
            { takeaway: "Compliance is architecture", detail: "PCI scope shapes the system. Tokenize early, store nothing dangerous, and the audit becomes a paperwork exercise instead of a rebuild." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 border-t border-slate-200 pt-8 dark:border-slate-800">
        <h2>Course wrap</h2>
        <p>
          That&apos;s the case-study arc. From URL shorteners to payments, the pattern repeats: identify the dominant pressure, pick
          the data layer that absorbs it, and own the failure modes. The remaining modules in the System Design course go beyond
          interview frame into production realities — observability, capacity planning, and the capstone that ties it all together.
        </p>
        <p>
          Browse the full track on the <Link href="/courses/system-design" className="text-cyan-600 hover:underline">System Design course page</Link>.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="design-payments" />
    </article>
  );
}
