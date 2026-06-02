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
  { id: "what-and-why", title: "What and why" },
  { id: "implementation", title: "Implementation" },
  { id: "edge-cases", title: "Edge cases" },
];

const idempotencyFlow = `sequenceDiagram
  participant C as Client
  participant S as Service
  participant DB as Dedupe table
  C->>S: POST /charge (Idempotency-Key: abc123)
  S->>DB: INSERT abc123 IF NOT EXISTS
  alt first request
    DB-->>S: inserted
    S->>S: do the real work
    S->>DB: store response
    S-->>C: 201 Created
  else replay
    DB-->>S: already exists
    S->>DB: read stored response
    S-->>C: 201 Created (same body)
  end`;

export default function Page() {
  const mod = getModuleBySlug("idempotency")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="idempotency" />
        <ModuleProgress moduleSlug="idempotency" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 p-6 dark:border-sky-800 dark:from-sky-950/40 dark:to-blue-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🧾</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Idempotency is the contract that makes retry safe. By the end of this module you&apos;ll know exactly what makes an operation idempotent, how to implement Stripe-style idempotency keys with a dedupe table, and how to handle the nasty edges (concurrent retries, mutated retries, expired keys).
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>The difference between idempotent, naturally-idempotent, and non-idempotent operations</li>
          <li>Idempotency keys, where they come from, how they&apos;re scoped, when they expire</li>
          <li>The dedupe table pattern with stored response replay</li>
          <li>Handling concurrent retries with row-level locking and the &quot;in-progress&quot; state</li>
          <li>Why Stripe also fingerprints the request body, and how to detect mutated retries</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">Every retry, every webhook redelivery, every &quot;the response was lost in transit&quot;, they all become safe the moment your endpoint is idempotent. Without idempotency, retry is a charge-the-customer-twice bug waiting for a network blip. The mechanics aren&apos;t complicated; the edge cases are. This module is mostly about the edges.</p>
      </Callout>

      {/* PART 1 — What and why */}
      <Checkpoint moduleSlug="idempotency" id="what-and-why" title="What and why" xp={20} celebration="Idempotency vocabulary locked. The contract is clear.">
      <section>
        <h2>Part 1: What idempotency actually means</h2>

        <p>
          The textbook definition: an operation is <strong>idempotent</strong>{" "}if performing it multiple times has the same effect as performing it once. <code>SET balance = 100</code> is idempotent, running it twice still leaves balance at 100. <code>balance += 100</code> is not, running it twice doubles the deposit. This distinction is the entire reason for this module.
        </p>

        <h3>Three categories of operations</h3>

        <ul>
          <li><strong>Naturally idempotent.</strong> <code>GET /users/123</code> doesn&apos;t change state. <code>PUT /users/123 {`{name: "Aria"}`}</code> sets state to a known value, repeating it is a no-op. <code>DELETE /users/123</code> repeated is a no-op (the user is still gone). HTTP&apos;s <em>safe</em>{" "}and <em>idempotent</em>{" "}method semantics, GET, PUT, DELETE, HEAD, are designed around this.</li>
          <li><strong>Idempotent with cooperation.</strong> <code>POST /charges</code> creating a new charge is not naturally idempotent, every retry creates another charge. But if the client sends an <em>idempotency key</em>{" "}and the server dedupes on it, the operation becomes idempotent. This is the Stripe pattern, and the focus of Part 2.</li>
          <li><strong>Inherently non-idempotent.</strong> &quot;Increment the counter,&quot; &quot;append to the log,&quot; &quot;trigger the email send&quot;, operations whose only meaning is &quot;produce a side effect this many times.&quot; These can be made safe with idempotency keys, but you have to think harder about what &quot;same effect&quot; means.</li>
        </ul>

        <Callout variant="insight" title="The contract is between client and server">
          <p className="m-0">Idempotency isn&apos;t a property the server can grant unilaterally, the client has to know the key matters and reuse it on retries. Stripe&apos;s API documentation is explicit: &quot;Send the same Idempotency-Key on retries; do not generate a new one.&quot; Your client SDK must capture the key once at the top of the operation, then pass it through every retry. Generating a new UUID per attempt defeats the entire mechanism.</p>
        </Callout>

        <h3>Why this is a 4 a.m. problem</h3>

        <p>
          The reason every senior engineer harps on idempotency is that production retries are not optional. They happen because of:
        </p>
        <ul>
          <li><strong>Network blips.</strong>{" "}The request reached the server, the response was lost. The client retries, not knowing the call already succeeded.</li>
          <li><strong>Client-side timeouts.</strong>{" "}The client gave up at 5 seconds, the server kept working and succeeded at 5.1. The client retries.</li>
          <li><strong>Webhook redelivery.</strong>{" "}The webhook receiver returned 500 (or didn&apos;t respond fast enough); the source redelivers. Stripe redelivers webhooks for up to 3 days.</li>
          <li><strong>Queue redelivery.</strong>{" "}Kafka, SQS, RabbitMQ, all guarantee at-least-once delivery. A consumer crash mid-processing means the same message comes back.</li>
          <li><strong>User-driven retries.</strong>{" "}The user sees a spinner, taps the button again. Most clients have a deduplication window of zero.</li>
        </ul>
        <p>
          In any non-trivial production system, every mutation will eventually be retried. Idempotency is the property that determines whether that retry is safe.
        </p>

        <Mermaid chart={idempotencyFlow} />

        <ClassifyChallenge
          title="Classify these operations"
          prompt="For each operation, decide whether it's naturally idempotent, idempotent with cooperation (needs an idempotency key), or inherently non-idempotent."
          buckets={[
            { id: "natural", label: "Naturally idempotent", color: "emerald" },
            { id: "cooperative", label: "Needs an idempotency key", color: "indigo" },
            { id: "inherent", label: "Inherently non-idempotent", color: "rose" },
          ]}
          items={[
            { id: "o1", label: "PUT /users/42 with body { name: 'Aria' }", answer: "natural", explanation: "PUT with a complete representation is naturally idempotent, repeating it sets the same final state." },
            { id: "o2", label: "POST /charges to charge a customer's card $100", answer: "cooperative", explanation: "POST creating new resources is the canonical idempotency-key case. Without a key, every retry creates a new charge." },
            { id: "o3", label: "DELETE /sessions/abc123", answer: "natural", explanation: "DELETE is naturally idempotent, re-deleting a missing resource is a no-op." },
            { id: "o4", label: "POST /counters/views/increment to bump a view count by 1", answer: "inherent", explanation: "Incrementing has no natural same-result-on-replay. You can make it safe with an idempotency key per event source, but the operation's semantics are 'add one each time.'" },
            { id: "o5", label: "GET /users/42", answer: "natural", explanation: "GET is safe and idempotent by HTTP definition, it doesn't change state." },
            { id: "o6", label: "POST /transfers with body { from, to, amount } and Idempotency-Key", answer: "cooperative", explanation: "Money movement is the highest-stakes idempotency case. The key is what makes retry safe. This is exactly the Stripe pattern." },
            { id: "o7", label: "POST /messages to send an email to a user", answer: "inherent", explanation: "Emails are inherently non-idempotent, every send is a real outgoing message. Make safe with an idempotency key tied to the source event." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="HTTP defines GET, PUT, DELETE as idempotent and POST as non-idempotent. What does that actually mean for your service?"
          options={[
            { label: "POST endpoints can never be idempotent.", explanation: "POST endpoints can absolutely be made idempotent with cooperation, that's the whole idempotency-key pattern. The HTTP spec describes the default semantics, not what's possible." },
            { label: "It's a default contract for HTTP intermediaries (caches, retrying clients): they're allowed to retry GET/PUT/DELETE without asking, but should not retry POST without explicit cooperation. Your service can still make POST endpoints idempotent, you just have to advertise it (via Idempotency-Key support) so clients know retries are safe.", correct: true, explanation: "Right. The HTTP spec gives intermediaries a baseline rule. POST is non-idempotent by default, so well-behaved retry libraries (and proxies, and browsers) won't auto-retry POST without explicit signal. Your idempotency-key header is exactly that signal, it tells everyone in the chain 'go ahead, retry, we handle dedup.'" },
            { label: "It just describes the HTTP method names, pure convention.", explanation: "It's a real semantic contract that real software relies on (browsers, retry middleware, CDNs). It's not just nomenclature." },
            { label: "PUT is always safer than POST.", explanation: "PUT being idempotent doesn't make it safer, it has different semantics (full-representation update vs. resource creation). Choose by semantics, not by 'safety.'" },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer says: 'we don't need idempotency keys, we run all writes in a database transaction.' What's wrong with that reasoning?"
          options={[
            { label: "Nothing, transactions handle this.", explanation: "Transactions handle atomicity within one call. They don't help when the same call is made twice." },
            { label: "Transactions guarantee atomicity within one request, they don't dedupe across requests. A retry is a brand-new transaction; it'll happily insert a second charge alongside the first.", correct: true, explanation: "Right. Transactions and idempotency solve different problems. Transactions: 'all of this happens or none of it does.' Idempotency: 'doing this twice is the same as doing it once.' You need both, transactions to keep individual writes consistent, idempotency keys to make retries safe across requests." },
            { label: "Transactions are too slow for idempotency work.", explanation: "Performance isn't the issue, the semantics are. Even infinitely fast transactions don't dedupe across calls." },
            { label: "Transactions don't work in a microservices environment.", explanation: "Local transactions work fine in microservices; distributed transactions are a different conversation. Neither replaces idempotency." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Idempotency is the contract that makes retry safe, different operations need different mechanisms."
          points={[
            { takeaway: "Idempotent = doing it N times has the same effect as doing it once.", detail: <>The key word is &quot;effect&quot;, observable state at the end. Returning the same response is a separate, often desirable, property.</> },
            { takeaway: "Natural idempotency lives in HTTP semantics: GET, PUT, DELETE.", detail: <>POST is non-idempotent by default. That&apos;s a contract with the entire HTTP ecosystem (proxies, retry libraries, browsers).</> },
            { takeaway: "POST mutations need explicit cooperation, an idempotency key.", detail: <>The client generates a key once at the top of an operation and reuses it on every retry. The server dedupes on the key.</> },
            { takeaway: "Inherently non-idempotent operations need careful key design.", detail: <>&quot;Send email&quot; or &quot;increment counter&quot; have no natural same-effect-on-replay. The key has to scope to the source event so replays of the same event are safe.</> },
            { takeaway: "Database transactions don't solve this. Idempotency keys do.", detail: <>Transactions handle atomicity within one request. Idempotency handles dedup across requests. They&apos;re complementary.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2 — Implementation */}
      <Checkpoint moduleSlug="idempotency" id="implementation" title="Implementation" xp={25} celebration="Dedupe table built, replay handling clean. You can ship this.">
      <section>
        <h2>Part 2: Implementing idempotency keys</h2>

        <h3>The dedupe table</h3>

        <p>
          The standard implementation is a database table, call it <code>idempotency_keys</code>, that stores every key the service has seen and the response that was sent. On a retry, the server reads the stored response and replays it instead of doing the work.
        </p>

        <CodeBlock lang="plain" caption="The schema (Postgres flavored)">{`CREATE TABLE idempotency_keys (
  key                TEXT PRIMARY KEY,         -- the Idempotency-Key header
  scope              TEXT NOT NULL,            -- usually account_id or user_id
  request_fingerprint  TEXT NOT NULL,          -- hash of the request body
  status             TEXT NOT NULL,            -- 'in_progress' | 'completed'
  response_status    INT,                       -- HTTP status (when completed)
  response_body      JSONB,                    -- the body that was returned
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at       TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ NOT NULL      -- usually 24h-7d from now
);

CREATE INDEX idx_idem_expires ON idempotency_keys (expires_at);
CREATE UNIQUE INDEX idx_idem_scope_key ON idempotency_keys (scope, key);`}</CodeBlock>

        <p>
          A few important schema choices here. The primary key is the idempotency key itself, scoped per account, this is what enforces dedup. The <code>request_fingerprint</code> is a hash of the request body; we&apos;ll use it in Part 3 to detect mutated retries. <code>status</code> distinguishes &quot;the work is happening right now&quot; from &quot;the work finished&quot;, critical for handling concurrent retries. <code>expires_at</code> lets you garbage-collect old keys without scanning the whole table.
        </p>

        <h3>The handler flow</h3>

        <p>
          The handler does five things in order. Each step matters.
        </p>

        <CodeBlock lang="java" caption="Idempotent POST handler, happy path">{`@RestController
public class ChargesController {

    private final IdempotencyStore store;
    private final ChargeService charges;

    public ChargesController(IdempotencyStore store, ChargeService charges) {
        this.store = store;
        this.charges = charges;
    }

    @PostMapping("/charges")
    public ResponseEntity<ChargeResponse> create(
            @RequestHeader("Idempotency-Key") String key,
            @AuthenticationPrincipal Account account,
            @RequestBody ChargeRequest body) {

        String scope = account.id();
        String fingerprint = sha256(body);

        // 1. Try to insert (key, in_progress) — succeeds on first attempt
        IdempotencyRecord rec = store.beginOrReturnExisting(scope, key, fingerprint);

        // 2. Replay path: completed record means we've already done this work
        if (rec.status() == Status.COMPLETED) {
            return ResponseEntity.status(rec.responseStatus())
                .header("Idempotent-Replayed", "true")
                .body(rec.responseBody(ChargeResponse.class));
        }

        // 3. Mismatched fingerprint = client replayed with different body
        if (!rec.fingerprint().equals(fingerprint)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "Idempotency-Key reuse with different request body");
        }

        // 4. Do the actual work (only on the first attempt)
        ChargeResponse response = charges.create(body);

        // 5. Mark the record completed and store the response
        store.complete(scope, key, HttpStatus.CREATED.value(), response);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}`}</CodeBlock>

        <p>
          The single subtle thing: step 1 is an atomic INSERT-or-return-existing. In Postgres that&apos;s an <code>INSERT ... ON CONFLICT (scope, key) DO NOTHING RETURNING *</code> followed by a SELECT if nothing was returned. The atomicity is what protects us from two concurrent retries both thinking they&apos;re first.
        </p>

        <CodeBlock lang="java" caption="The atomic begin-or-return-existing, JdbcTemplate flavor">{`@Repository
public class IdempotencyStore {

    private final JdbcTemplate jdbc;

    public IdempotencyStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public IdempotencyRecord beginOrReturnExisting(
            String scope, String key, String fingerprint) {

        // Atomic: insert if absent, return whatever now exists.
        jdbc.update("""
            INSERT INTO idempotency_keys
              (key, scope, request_fingerprint, status, expires_at)
            VALUES (?, ?, ?, 'in_progress', now() + interval '24 hours')
            ON CONFLICT (scope, key) DO NOTHING
            """,
            key, scope, fingerprint
        );

        return jdbc.queryForObject("""
            SELECT key, scope, request_fingerprint AS fingerprint, status,
                   response_status, response_body
              FROM idempotency_keys
             WHERE scope = ? AND key = ?
            """,
            new IdempotencyRecordMapper(),
            scope, key
        );
    }

    public void complete(String scope, String key, int status, Object body) {
        jdbc.update("""
            UPDATE idempotency_keys
               SET status = 'completed',
                   response_status = ?,
                   response_body = ?::jsonb,
                   completed_at = now()
             WHERE scope = ? AND key = ?
            """,
            status, toJson(body), scope, key
        );
    }
}`}</CodeBlock>

        <Callout variant="warn" title="Concurrent retries hit the in_progress state">
          <p className="m-0">Two retries arrive in the same millisecond. One inserts the row in <code>in_progress</code>; the second sees the row already exists, in_progress, with the same fingerprint. What should the second one do? Three options: (1) wait and poll for completion, (2) return 409 Conflict immediately and let the client retry, (3) return 425 Too Early. Stripe&apos;s answer is (2), return 409 with a clear &quot;there&apos;s already a request with this key in progress&quot; message. This is simpler for the server and gives the client a chance to back off. Whatever you pick, decide explicitly, silently re-doing the work because the row is in_progress is the bug that causes double-charges.</p>
        </Callout>

        <h3>Stored-response replay</h3>

        <p>
          When a retry arrives after the original completed, the server doesn&apos;t re-run the business logic, it just returns the stored response with the original status code. This matters: the retry must look identical to the original from the client&apos;s perspective. Same status, same body, ideally the same headers (or at least the meaningful ones, the <code>Date</code> header should obviously be fresh).
        </p>

        <p>
          The reason for replaying is that even if the business logic happens to be naturally idempotent, the second response would have a different <em>created_at</em>, a different generated ID, etc. Replaying the stored response keeps the wire-level behavior bit-for-bit identical, which is what the client&apos;s retry logic was assuming.
        </p>

        <h3>Expiration</h3>

        <p>
          Storing every key forever is unsustainable. The standard policy is 24 hours to 7 days, enough to cover any reasonable retry window. Stripe documents 24 hours; most homegrown systems land at 24-72 hours. After expiration, the key is gone and a retry would create a new charge, but no sane client retries a payment after 24 hours, so the practical risk is near zero.
        </p>

        <Quiz
          kind="Drill"
          question="Two clients retry the same Idempotency-Key concurrently, they arrive within a millisecond of each other. Both check 'is this key in the table?' before either inserts. Both find it absent. Both insert. What happened?"
          options={[
            { label: "Both successful, first INSERT wins, second is rejected by the unique constraint.", explanation: "If the unique constraint is in place, the second INSERT will indeed fail. The bug here is that you described the check-then-insert pattern, which is racy, and the question is what happens when you don't use the atomic INSERT ON CONFLICT pattern. With a unique constraint, the second insert errors, but the second handler now has to deal with that error correctly. Better to use INSERT ON CONFLICT DO NOTHING and avoid the error path entirely." },
            { label: "Without an atomic INSERT-or-return, you get a race: both handlers see 'no row' and both insert. The unique constraint prevents two rows, but one INSERT throws, and depending on how the error is handled, the second handler might either re-do the work or 500 the client. The fix is INSERT ... ON CONFLICT DO NOTHING (atomic), then SELECT the row that won, never check-then-insert.", correct: true, explanation: "Right. The check-then-insert pattern is the classic TOCTOU (time-of-check-to-time-of-use) race. Even with a unique constraint, the error you'd get on the losing insert has to be caught and handled, and the bug surface is enormous. INSERT ... ON CONFLICT DO NOTHING (or INSERT IGNORE in MySQL, MERGE in SQL Server) collapses both 'first writer' and 'replay' into one atomic operation. Then a SELECT after gives you whatever now exists." },
            { label: "Postgres serializes everything internally, there's no race.", explanation: "Postgres serializes inside a single statement, but two separate SELECT-then-INSERT sequences in different transactions absolutely race." },
            { label: "The application's @Transactional handles this.", explanation: "@Transactional doesn't prevent two transactions from each running their SELECT-INSERT pair in parallel. Even at SERIALIZABLE isolation, you'd get a serialization error on one of them, still a code path you have to handle." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A retry arrives 200ms after the original request, while the original is still running (status='in_progress'). What does Stripe do, and why?"
          options={[
            { label: "Wait until the original completes, then return its stored response.", explanation: "Possible design but introduces unbounded waits and complicated client semantics. Not what Stripe does." },
            { label: "Return 409 Conflict with an error indicating a request with this key is already in progress. Lets the client back off and retry, doesn't risk double-execution, and keeps server logic simple.", correct: true, explanation: "Right. Returning 409 immediately is simpler and safer than blocking the second handler on the in-progress operation. The client's retry library will back off and try again, by which time the original will likely have completed, and the third attempt becomes a clean replay. Stripe documents this exact behavior." },
            { label: "Run the request again, the work is idempotent anyway.", explanation: "The whole point of the in_progress state is to prevent double-execution. Running again defeats the purpose." },
            { label: "Return a 200 with the request that's still in progress.", explanation: "You can't return a real response when the work hasn't finished, there's nothing to return." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="A small dedupe table plus an atomic insert-or-return is the whole pattern."
          points={[
            { takeaway: "The dedupe table stores key, scope, fingerprint, status, response, expiry.", detail: <>Scope ties the key to the calling account so two accounts can both use &quot;abc123&quot; without colliding.</> },
            { takeaway: "INSERT ... ON CONFLICT DO NOTHING is the atomic begin-or-return-existing.", detail: <>Then SELECT the row that now exists. This collapses &quot;first writer&quot; and &quot;replay&quot; into one operation with no race.</> },
            { takeaway: "Replays return the stored response, not a freshly-computed one.", detail: <>Even if the business logic is naturally idempotent, generated IDs and timestamps would differ. Replaying the stored body keeps wire-level behavior identical.</> },
            { takeaway: "Concurrent retries hit the in_progress state, return 409, don't double-execute.", detail: <>Stripe&apos;s answer is to return 409 Conflict immediately. The client backs off and the next attempt becomes a clean replay.</> },
            { takeaway: "Expire keys after 24-72 hours.", detail: <>Long enough for any reasonable retry, short enough to keep the table from growing unbounded. Index on expires_at and run a periodic cleanup.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3 — Edge cases */}
      <Checkpoint moduleSlug="idempotency" id="edge-cases" title="Edge cases" xp={25} celebration="The nasty edges are tame now. Mutated retries detected, partial failures handled.">
      <section>
        <h2>Part 3: The interesting edges</h2>

        <p>
          Most idempotency bugs hide in the corners. This part is the corners.
        </p>

        <h3>Mutated retries, the request body changed</h3>

        <p>
          A client reuses an idempotency key but sends a different request body. Maybe a logic bug, maybe a developer experimenting with the same key in curl, maybe an actual attempt to game the system. What should the server do?
        </p>
        <p>
          Stripe&apos;s answer is to reject mutated retries with <code>422 Unprocessable Entity</code>. The reasoning: the idempotency key is a contract that says &quot;this exact operation happened.&quot; If the body differs, the new request is not a retry, it&apos;s a different operation, and silently treating it as a replay would mislead the client about what was actually executed.
        </p>
        <p>
          The fingerprint is just a hash of the canonicalized body, sort the JSON keys, drop whitespace, hash with SHA-256. Compare the new request&apos;s fingerprint to the stored one. If they differ, reject.
        </p>

        <CodeBlock lang="java" caption="Body fingerprinting for mutated-retry detection">{`import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.security.MessageDigest;
import java.util.HexFormat;

public class RequestFingerprint {

    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

    public static String of(Object body) {
        try {
            // Canonical JSON: sorted keys, no whitespace
            byte[] canonical = MAPPER.writeValueAsBytes(body);
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(canonical);
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("fingerprint failed", e);
        }
    }
}

// On a retry: compare RequestFingerprint.of(body) to the stored one.
// Mismatch → 422 Unprocessable Entity, "Idempotency-Key reuse with different
// request body."`}</CodeBlock>

        <h3>Partial-success rollbacks</h3>

        <p>
          The handler started the work, the database write succeeded, but the response failed to send (network error after the commit). The client retries. The handler runs the work again, and now you have a duplicate.
        </p>
        <p>
          This is exactly why we set <code>in_progress</code> before doing the work and <code>completed</code> after, all in the same transaction as the actual mutation. The flow:
        </p>
        <ol>
          <li>BEGIN transaction</li>
          <li>UPSERT idempotency_keys with status=&apos;in_progress&apos;</li>
          <li>Do the business logic (INSERT into charges, etc.)</li>
          <li>UPDATE idempotency_keys SET status=&apos;completed&apos;, response_body=...</li>
          <li>COMMIT</li>
        </ol>
        <p>
          With this ordering, either everything happened (the row is &apos;completed&apos; with the response) or nothing happened (the row is &apos;in_progress&apos; from the doomed attempt and we&apos;ll either time it out or let the next retry detect &apos;in_progress with no work yet&apos;). The transaction couples the dedupe table state to the business state.
        </p>

        <Callout variant="warn" title="When you can't fit it all in one transaction">
          <p className="m-0">If the &quot;real work&quot; involves an external API call (charge a card, send an email), it can&apos;t be in your local transaction. The standard workaround is the <em>outbox pattern</em>: write a record to an &quot;events to publish&quot; table inside the same transaction as the dedupe row, then a separate worker reads the outbox and makes the external call. The external call uses the idempotency key as its own dedupe token, and the worker can retry safely. This converts &quot;in-transaction with external system&quot; (impossible) into &quot;in-transaction with local outbox&quot; (easy).</p>
        </Callout>

        <h3>Key scoping, per-account is non-negotiable</h3>

        <p>
          Two different customers might both pick &quot;abc123&quot; as an idempotency key. Without scoping, customer B&apos;s retry replays customer A&apos;s response, and you&apos;ve leaked data across tenants. Always scope keys to the account / tenant / API key that owns them. The dedupe table&apos;s primary key is <code>(scope, key)</code>, never just <code>key</code>.
        </p>

        <h3>What about read-only operations?</h3>

        <p>
          GET endpoints don&apos;t need idempotency keys. They&apos;re already idempotent, replaying them is harmless. The dedupe table is for mutations. Adding it to GETs adds latency and storage for no benefit. Stripe explicitly skips idempotency on GETs.
        </p>

        <h3>The deeper truth: idempotency is a system property</h3>

        <p>
          Even with perfect idempotency keys at the API boundary, your system can still double-do things if the layers below aren&apos;t idempotent. If your handler emits a Kafka event after the database write, and the Kafka publish is retried, your downstream consumer also needs to handle the retry. Idempotency has to be plumbed through the entire chain: client → API → DB → outbox → message bus → consumer → downstream API. Each layer needs its own idempotency story, usually keyed on the same root identifier.
        </p>

        <Quiz
          kind="Drill"
          question="A client retries a POST /charges with the same Idempotency-Key but accidentally sends amount=500 instead of amount=100. Your dedupe table has the original (amount=100) record completed. What should happen?"
          options={[
            { label: "Replay the stored response (amount=100). The client retried with the same key, that's their problem.", explanation: "Replaying would silently lie to the client: they sent amount=500 and got back a response saying amount=100. They'll think the 500 worked." },
            { label: "Compare the request body fingerprint. If it differs from the stored one, reject with 422 Unprocessable Entity. Don't replay, don't double-execute, make the client face their bug.", correct: true, explanation: "Right. This is what Stripe does. Fingerprinting the request body and comparing it to the stored fingerprint is what catches mutated retries. The 422 makes the bug surface immediately on the client side, where it can be fixed, instead of silently mismatching responses." },
            { label: "Run the second request as a fresh charge, same key but it's a 'different operation.'", explanation: "Now you've broken idempotency in the other direction: the same key produced two different operations. The dedup contract is shattered." },
            { label: "Ignore the new amount and return the stored response with a warning header.", explanation: "Same problem as 'replay the stored response.' The client thinks their amount=500 went through." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer ships idempotency keys but stores them globally, primary key is just (key), no account scoping. Two days later, customer A complains they got customer B's charge response. What's the bug and the fix?"
          options={[
            { label: "Bug: idempotency keys are leaking across tenants. Fix: change the primary key to (account_id, key) and add an index. Backfill is dangerous because some live customers may have collided keys; rotate keys for everyone.", correct: true, explanation: "Right. Globally-scoped keys are a tenant-isolation bug. The fix is to scope keys per account (or per API key, or per tenant, whatever your isolation unit is). The unique constraint becomes (scope, key), not just (key). The backfill question is real, if customers have already collided, you can't safely deduplicate without dropping data, so a key rotation is usually the right answer." },
            { label: "Bug: not enough randomness in the keys. Fix: enforce minimum key entropy.", explanation: "Even with high-entropy keys, two customers might independently pick the same UUID. Tenant scoping is the structural fix; entropy alone is hopeful." },
            { label: "Not a bug, clients are supposed to use unique keys.", explanation: "The server cannot trust client-side uniqueness across tenants. Defense in depth is a server-side scope." },
            { label: "Fix: hash the keys before storing.", explanation: "Hashing doesn't prevent the same input from colliding, it preserves the equality. The bug isn't representation, it's missing scope." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The edges are where idempotency designs get tested, fingerprints, scoping, partial failures, downstream propagation."
          points={[
            { takeaway: "Fingerprint the request body to detect mutated retries.", detail: <>Same key + different body → 422. Without fingerprinting, you silently mismatch responses, which is worse than a clean error.</> },
            { takeaway: "The dedupe row update must commit in the same transaction as the business write.", detail: <>Otherwise a crash between &quot;business done&quot; and &quot;dedupe marked complete&quot; lets the retry double-execute. Couple them in one transaction.</> },
            { takeaway: "Always scope keys per account / tenant / API key.", detail: <>Globally-scoped keys leak data across tenants. Primary key is (scope, key), never just (key).</> },
            { takeaway: "External-system calls need the outbox pattern.", detail: <>You can&apos;t put an external API call in a local transaction. Write to an outbox table in-transaction; let a worker drain the outbox and propagate the idempotency key to the external system.</> },
            { takeaway: "Idempotency has to propagate through the whole chain.", detail: <>API, DB, outbox, message bus, consumer, downstream APIs, each layer needs its own idempotency story, usually rooted on the same identifier.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: observability</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You&apos;ve protected the system at the request boundary. Now you need to see what&apos;s happening inside it. Module 24 covers the four golden signals, RED and USE method, distributed tracing with OpenTelemetry, structured logging, and what to actually alert on.
        </p>
        <Link
          href="/courses/system-design/modules/observability"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-sky-600 hover:to-blue-600 hover:shadow-md"
        >
          Module 24: Observability →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="idempotency" />
    </article>
  );
}
