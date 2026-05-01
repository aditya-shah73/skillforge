import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";

const CHECKPOINTS = [
  { id: "capacity", title: "Requirements & capacity" },
  { id: "data-plane", title: "Data plane" },
  { id: "reliability", title: "Traffic & reliability" },
  { id: "security-rollout", title: "Security & rollout" },
  { id: "defense", title: "Defending the design" },
];

const overviewArchitecture = `flowchart LR
  U[Web / IDE clients] --> EDGE[Edge: TLS, WAF, rate-limit]
  EDGE --> APIGW[API gateway / BFF]
  APIGW --> AUTH[AuthN: OAuth2 IdP]
  APIGW --> REVIEW[Review service]
  APIGW --> COMMENT[Comment service]
  APIGW --> NOTIFY[Notification service]
  REVIEW --> PG[(Postgres - PRs, reviewers)]
  REVIEW --> KAFKA[Kafka]
  COMMENT --> PG2[(Postgres - threads)]
  COMMENT --> KAFKA
  KAFKA --> NOTIFY
  KAFKA --> ANALYTICS[Analytics + warehouse]
  REVIEW --> S3[(S3 - diffs, blobs)]
  REVIEW --> SEARCH[(Elasticsearch - search)]
  REVIEW --> REDIS[(Redis - hot reads)]`;

const reviewLifecycle = `stateDiagram-v2
  [*] --> Open: PR created
  Open --> Reviewed: reviewer leaves comments
  Reviewed --> Approved: required reviewers approve
  Reviewed --> ChangesRequested: reviewer requests changes
  ChangesRequested --> Reviewed: author pushes new commit
  Approved --> Merged: author merges
  Approved --> Closed: author closes
  Open --> Closed: author closes
  Merged --> [*]
  Closed --> [*]`;

const commentFanout = `sequenceDiagram
  participant U as User
  participant API as Comment API
  participant DB as Postgres
  participant K as Kafka
  participant N as Notify svc
  participant S as Search indexer
  U->>API: POST /comments
  API->>DB: INSERT (with idempotency-key)
  API->>K: produce comment.created
  API->>U: 201 Created
  K->>N: consume → email/Slack/in-app
  K->>S: consume → index for search
  Note over API,K: API does NOT wait for downstream`;

export default function Page() {
  const mod = getModuleBySlug("capstone")!;

  return (
    <article className="prose-custom">
      <ModuleProgress moduleSlug="capstone" checkpoints={CHECKPOINTS} />
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <Callout variant="info" title="What this capstone is">
        We design a code review platform — call it &quot;CodeForge&quot; — end to end. Five parts, every layer of the
        compass: requirements, data, traffic, reliability, security &amp; rollout. By the end you&apos;ll have a
        defensible architecture you could whiteboard in a senior interview without flinching.
      </Callout>

      <section className="my-8">
        <p className="lead">
          The brief: a self-hosted code review tool for an engineering org of ~5,000 devs. PRs, inline comments,
          required reviewers, CI status checks, search, notifications, audit. Think GitHub PRs but built by us, with
          our constraints.
        </p>

        <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/60 dark:bg-slate-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">What you&apos;ll walk out with</p>
          <ul className="space-y-2 text-sm">
            <li>A complete architecture for a non-trivial multi-service system.</li>
            <li>Justified tradeoffs at every box: why this DB, why this queue, why this consistency level.</li>
            <li>A capacity model that says &quot;here&apos;s where it breaks first.&quot;</li>
            <li>An evolution plan — how this thing ships, scales, and migrates.</li>
            <li>Confidence to defend the design against a senior architect&apos;s pushback.</li>
          </ul>
        </div>
      </section>

      {/* ============================== PART 1 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 1 — Requirements and capacity</h2>
        <p>
          Before any boxes on a diagram, we pin down what we&apos;re building and at what scale. Designs go wrong when
          this step is skipped.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Functional requirements</h3>
        <ul className="space-y-2">
          <li>Users create pull requests against a target branch.</li>
          <li>Reviewers leave inline (file/line) and general comments. Threaded replies.</li>
          <li>Required reviewers must approve before merge. CI checks must pass.</li>
          <li>Notifications via email, Slack, in-app — when assigned, mentioned, status changes.</li>
          <li>Search across PRs, comments, files.</li>
          <li>Audit log of every state-changing action.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Non-functional requirements</h3>
        <ul className="space-y-2">
          <li><strong>Latency:</strong> p99 &lt; 300ms for PR view; &lt; 150ms for comment post.</li>
          <li><strong>Availability:</strong> 99.9% (~8.7h of allowed downtime/year).</li>
          <li><strong>Durability:</strong> zero loss for PRs and comments — they&apos;re audit-bearing.</li>
          <li><strong>Scale:</strong> 5,000 devs, ~2,000 PRs/day, ~50 comments/PR average. Bursty during business hours.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Back-of-envelope</h3>
        <CodeBlock lang="plain" caption="Capacity model">{`Users:                  5,000 devs
PRs/day:                2,000 (peak ~5x average → ~5 PRs/sec at peak)
Comments/PR:            ~50 average, ~500 max
Comments/day:           100,000 (~10/sec average, ~100/sec peak)
PR views/day:           ~50,000 reads (mostly cached)
Reads:writes:           ~50:1
Storage growth:
  - PR + diffs:         ~500 KB/PR avg = 1 GB/day = ~365 GB/year
  - Comments:           ~1 KB each = ~100 MB/day = ~36 GB/year
  - Audit log:          ~500 events/day per active dev × 5k devs = 2.5M events/day
                        (grows fast; archive after 90 days)
Search index size:      ~100 GB at year 1, growing
Bandwidth:              comfortable on a single AZ; CDN only for static assets`}</CodeBlock>

        <Callout variant="insight" title="Why these numbers matter">
          5 PRs/sec sounds tiny — and it is. But peak comment burst (~100/sec) plus the notification fanout (~3
          channels × dependent listeners) is the actual hot path. Always design for the burst, not the average.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">What the numbers tell us</h3>
        <ul className="space-y-2">
          <li>This is NOT Twitter scale. Don&apos;t over-engineer. A handful of services, a few datastores, done.</li>
          <li>Read-heavy: caching matters. Hot PR views are the read driver.</li>
          <li>Bursty writes: queue / async fanout is essential to keep latency predictable.</li>
          <li>Storage is modest: Postgres can hold years of data without sharding.</li>
        </ul>

        <Checkpoint moduleSlug="capstone" id="capacity" title="Capacity checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question={`The numbers say 100 comment writes/sec at peak. A teammate proposes Cassandra for the comments table because it "scales better." Right call?`}
            options={[
              { label: "Yes — Cassandra is a better fit for write-heavy workloads", correct: false, explanation: "100 writes/sec is trivial for any modern DB. Postgres handles thousands easily." },
              { label: "No — Postgres comfortably handles this volume; Cassandra adds operational tax for no gain", correct: true, explanation: "Right. Don't reach for distributed datastores at scales they're not needed for. Postgres is the simpler, faster path here." },
              { label: "Only if we expect 100x growth", correct: false, explanation: "Even at 100x (10k writes/sec) Postgres handles it. Reach for Cassandra at 100k+ or specific access patterns." },
            ]}
            hint="What scale does Postgres actually break at?"
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Which is the most useful single number to argue for or against a cache?"
            options={[
              { label: "Total request volume", correct: false, explanation: "Volume alone doesn't tell you about repeat reads." },
              { label: "Read:write ratio (here, ~50:1)", correct: true, explanation: "Right. High read:write means the same data is read many times — that's the cache opportunity. 1:1 ratios benefit much less from caching." },
              { label: "Latency budget", correct: false, explanation: "Latency tells you whether you need a cache, not whether one will help. Read:write tells you whether it will pay off." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 1 recap"
          gist="Requirements and numbers first. Without them every later choice is a guess."
          points={[
            { takeaway: "Always design for peak, not average.", detail: "5 PRs/sec average becomes 100 comments/sec at burst — that's the hot path." },
            { takeaway: "Read:write ratio drives caching strategy.", detail: "50:1 here means caching will pay back significantly." },
            { takeaway: "Modest scale lets us keep the architecture simple.", detail: "Don't reach for distributed datastores you don't need." },
          ]}
        />
      </section>

      {/* ============================== PART 2 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 2 — High-level architecture and data plane</h2>
        <p>
          With requirements pinned, we sketch the system and decide where the bytes live. Six services, four
          datastores, one streaming backbone.
        </p>

        <Mermaid chart={overviewArchitecture} />

        <h3 className="text-xl font-semibold mt-8 mb-3">Service decomposition</h3>
        <ul className="space-y-2">
          <li><strong>Review service.</strong> PRs, branches, reviewers, status, merges. Source of truth for PR lifecycle.</li>
          <li><strong>Comment service.</strong> Inline + general comments, threads, reactions. Owned table to keep it scalable.</li>
          <li><strong>Notification service.</strong> Email, Slack, in-app. Pure consumer of events.</li>
          <li><strong>Search service.</strong> Elasticsearch wrapper. Read-only API for the UI.</li>
          <li><strong>Audit service.</strong> Append-only log of state changes. Compliance/forensics target.</li>
          <li><strong>API gateway / BFF.</strong> Single front door for the UI; aggregates calls; enforces authn.</li>
        </ul>

        <Callout variant="insight" title="Why these boundaries">
          PRs and comments could be one service — but comments are 50x the volume and have different access patterns
          (write-bursty, search-heavy). Splitting lets each scale and evolve independently. Notifications are async by
          nature; they don&apos;t belong in the request path. Search is naturally a read replica fed by events.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Datastore choices, justified</h3>
        <ul className="space-y-3">
          <li>
            <strong>Postgres for review + comment data.</strong> ACID, joins (PR ↔ reviewer ↔ comment), modest scale.
            One DB per service for ownership; logical replication if we need cross-service reads.
          </li>
          <li>
            <strong>S3 for diffs and large blobs.</strong> Cheap, durable. Diff blobs are immutable per commit — perfect
            for object storage. Postgres holds the metadata pointer.
          </li>
          <li>
            <strong>Redis for hot reads.</strong> PR view caching (TTL ~60s), session state, rate-limit counters. Not
            source of truth.
          </li>
          <li>
            <strong>Kafka as the spine.</strong> Comment-created, PR-state-changed, mention events. Decouples writers
            from notification + search + audit consumers.
          </li>
          <li>
            <strong>Elasticsearch for search.</strong> Async-fed from Kafka. Eventually consistent — that&apos;s fine
            for search.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Schema sketch — Review service</h3>
        <CodeBlock lang="plain" caption="Postgres tables (Review service)">{`pull_request
  id              UUID PK
  repo_id         UUID
  author_id       UUID
  title           TEXT
  description     TEXT
  source_branch   TEXT
  target_branch   TEXT
  head_sha        TEXT
  state           ENUM(open, closed, merged)
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
  -- INDEX (repo_id, state, updated_at DESC)
  -- INDEX (author_id, state)

pr_reviewer
  pr_id           UUID FK
  reviewer_id     UUID
  required        BOOLEAN
  status          ENUM(pending, approved, changes_requested)
  reviewed_at     TIMESTAMPTZ
  -- PK (pr_id, reviewer_id)

pr_status_check
  pr_id           UUID FK
  check_name      TEXT
  state           ENUM(pending, success, failure)
  details_url     TEXT
  -- PK (pr_id, check_name)`}</CodeBlock>

        <p>
          Indexes are picked from the access patterns: list open PRs in a repo (repo + state + recency); list a user&apos;s
          PRs (author + state); fetch one PR (PK).
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Sharding and replication</h3>
        <ul className="space-y-2">
          <li><strong>At year-1 scale:</strong> single Postgres primary + 2 read replicas per service. No sharding.</li>
          <li><strong>If we need to scale:</strong> shard by <code>repo_id</code> — a repo&apos;s PRs/comments are naturally co-located, queries don&apos;t cross repos.</li>
          <li><strong>Read replicas</strong> handle read traffic for &quot;list my PRs&quot; pages. Tolerate slight lag.</li>
        </ul>

        <Callout variant="warn" title="Don't shard until you have to">
          Sharding adds enormous complexity: rebalancing, cross-shard queries, failover, schema migrations. At
          5,000 devs we don&apos;t need it. Plan the shard key (<code>repo_id</code>) but don&apos;t implement until
          the metrics force the conversation.
        </Callout>

        <Checkpoint moduleSlug="capstone" id="data-plane" title="Data plane checkpoint" xp={25}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Why split comments into their own service + DB rather than keeping them in the review service?"
            options={[
              { label: "Microservices are always better than monoliths", correct: false, explanation: "Cargo-cult thinking. Decomposition has to earn its complexity." },
              { label: "Different volume profile and access patterns — independent scaling and indexing", correct: true, explanation: "Right. Comments are 50x the volume of PRs and need different indexes (search-heavy). Splitting lets them scale and evolve independently." },
              { label: "It's required by REST principles", correct: false, explanation: "Service boundaries aren't a REST concern." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="We pick repo_id as the future shard key. Why not user_id?"
            options={[
              { label: "user_id has fewer values", correct: false, explanation: "Cardinality is fine for either. The question is about access patterns." },
              { label: "Most queries are scoped to a repo (list PRs, list comments) — sharding by repo keeps queries local", correct: true, explanation: "Right. Co-locating data with the query pattern is the whole point. user_id sharding would scatter every repo across shards." },
              { label: "user_id is PII", correct: false, explanation: "True but not a sharding consideration on its own." },
            ]}
            hint="Where do most of the queries scope to?"
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Diffs are stored in S3, metadata in Postgres. What's the failure mode to watch for?"
            options={[
              { label: "S3 is too slow", correct: false, explanation: "Hundreds of ms is fine for diff fetches; cache the hot ones." },
              { label: "Postgres pointer can outlive the S3 object (or vice versa) — orphan/inconsistency", correct: true, explanation: "Right. Two-system writes need careful ordering: write to S3 first, then commit to Postgres. Background reaper for orphan blobs." },
              { label: "S3 is more expensive than blob columns", correct: false, explanation: "Wildly cheaper than storing blobs in Postgres." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 2 recap"
          gist="Six services, four datastores, justified by access pattern and scale. Plan for shards, don't implement them yet."
          points={[
            { takeaway: "Decompose by volume + access pattern, not by entity count.", detail: "Comments earned their own service because of write volume and search needs." },
            { takeaway: "Postgres + S3 + Redis + Kafka + Elasticsearch is a boring, proven stack.", detail: "Boring is good. Each tool has a clear job." },
            { takeaway: "Pick the future shard key now, even if you don't shard.", detail: "It informs schema and access patterns today." },
          ]}
        />
      </section>

      {/* ============================== PART 3 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 3 — Traffic plane and reliability</h2>
        <p>
          Now: how requests actually flow, and what keeps the system honest when things break.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">PR lifecycle</h3>
        <Mermaid chart={reviewLifecycle} />
        <p className="mt-4">
          Every state transition emits a Kafka event. That&apos;s the seam where notifications, audit, and search hook
          in — none of them sit in the request path.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Comment write — the hot path</h3>
        <Mermaid chart={commentFanout} />

        <CodeBlock lang="java" caption="Comment write with idempotency and outbox">{`@PostMapping("/comments")
public ResponseEntity<Comment> create(
    @RequestBody CommentReq req,
    @RequestHeader("Idempotency-Key") String idemKey,
    @AuthenticationPrincipal Jwt jwt) {

  String userId = jwt.getSubject();

  // Idempotency: if we've seen this key, return the prior result
  Optional<Comment> existing = idempotencyStore.get(idemKey, userId);
  if (existing.isPresent()) return ResponseEntity.ok(existing.get());

  return tx.execute(status -> {
    // 1. Insert comment
    Comment c = commentRepo.save(req.toEntity(userId));

    // 2. Outbox row in same transaction → Kafka publisher reads it
    outboxRepo.save(new OutboxEvent("comment.created", c.toJson()));

    // 3. Record idempotency result
    idempotencyStore.put(idemKey, userId, c);

    return ResponseEntity.status(201).body(c);
  });
}`}</CodeBlock>

        <Callout variant="spring" title="Outbox over direct Kafka publish">
          Publishing to Kafka mid-transaction is dangerous: the DB commits, then Kafka publish fails, and downstream
          consumers never learn the comment exists. Outbox pattern: write the event row in the SAME transaction,
          background poller ships it to Kafka. At-least-once delivery, atomic with the DB write.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Read path — PR view caching</h3>
        <ul className="space-y-2">
          <li>UI requests <code>GET /pr/{`{id}`}</code> via API gateway.</li>
          <li>Cache check in Redis (key = <code>pr:{`{id}`}:v{`{version}`}</code>, TTL 60s).</li>
          <li>Miss → Review service → Postgres read replica → write back to Redis.</li>
          <li>On any state change, increment the version counter (cache busting).</li>
        </ul>
        <p>
          Comment list is fetched separately by the UI — paginated, smaller cache footprint. The version-on-state-change
          pattern avoids stale-read confusion when reviewers approve.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Reliability — what breaks, and how we contain it</h3>
        <ul className="space-y-3">
          <li>
            <strong>Notification service down.</strong> Kafka buffers events. When it recovers, consumers catch up.
            Users see notifications late, but PRs/comments still flow. Decoupled by design.
          </li>
          <li>
            <strong>Elasticsearch down.</strong> Search is degraded; everything else works. Indexer falls behind on
            Kafka, catches up later. Eventually consistent — user sees a 5-minute lag in search results, not an outage.
          </li>
          <li>
            <strong>Postgres primary fails.</strong> Replica promotes (managed RDS handles this in ~60s). API
            gateway returns 503 with retry hints during the failover.
          </li>
          <li>
            <strong>Redis cache cold/down.</strong> Reads fall through to Postgres. Latency degrades; system stays up.
            Always design caches to be optional.
          </li>
          <li>
            <strong>Kafka down.</strong> Outbox accumulates. When Kafka recovers, drains. Read path unaffected.
          </li>
        </ul>

        <Callout variant="info" title="Circuit breakers and bulkheads">
          The API gateway wraps every downstream call in a circuit breaker. If the comment service hangs, breaker trips
          and gateway returns the page with comments missing rather than dragging the whole PR view down. Bulkheads
          (separate thread pools per dependency) prevent one slow service from saturating the gateway.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Observability</h3>
        <ul className="space-y-2">
          <li><strong>Metrics:</strong> RED (rate, errors, duration) per endpoint; per-consumer Kafka lag; cache hit ratio.</li>
          <li><strong>Logs:</strong> structured JSON; trace ID propagated end-to-end (W3C traceparent).</li>
          <li><strong>Traces:</strong> OpenTelemetry across services — every API request is a single trace.</li>
          <li><strong>Alarms:</strong> p99 latency, error rate, Kafka consumer lag, replica lag — paged on threshold.</li>
        </ul>

        <Checkpoint moduleSlug="capstone" id="reliability" title="Traffic + reliability checkpoint" xp={25}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Why use the outbox pattern instead of publishing to Kafka right after the DB commit?"
            options={[
              { label: "Outbox is faster", correct: false, explanation: "It's actually slower — adds a poller hop. The benefit is correctness." },
              { label: "Atomicity — if the publish fails after commit, downstream loses the event forever", correct: true, explanation: "Right. Outbox couples the event to the DB write in one transaction. The poller then ships at-least-once. No lost events." },
              { label: "Kafka requires it", correct: false, explanation: "Kafka has no opinion on outbox. The pattern is a correctness solution, not a Kafka requirement." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="The notification service crashes for 10 minutes. What's the user-visible impact?"
            options={[
              { label: "PR creates and comment writes start failing", correct: false, explanation: "They go through fine — Kafka is decoupled from the write path." },
              { label: "Notifications arrive late but everything else works", correct: true, explanation: "Right. Kafka buffers the events. When notify recovers, it drains the backlog. This is the whole point of asynchronous fanout." },
              { label: "Search results become stale", correct: false, explanation: "Search is fed by a different consumer; it's unaffected by notify being down." },
            ]}
            hint="What does Kafka do for us during a downstream outage?"
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="A reviewer approves a PR but the UI still shows it as 'pending' for 30 seconds. What's the most likely cause?"
            options={[
              { label: "Kafka lost the event", correct: false, explanation: "Possible but unlikely given delivery guarantees." },
              { label: "Stale Redis cache — version counter didn't bust the entry", correct: true, explanation: "Right. State change should bump the cache version key. If that's missed, TTL is the only thing forcing a refresh — hence the 30s wait. Always bust on state change." },
              { label: "Postgres replication lag", correct: false, explanation: "Possible but typically sub-second; 30s points to cache, not replica lag." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 3 recap"
          gist="Hot path is async-friendly. Caches are optional. Failures are contained, not cascading."
          points={[
            { takeaway: "Outbox pattern protects event integrity across DB and Kafka.", detail: "Atomic with the write, at-least-once on the bus." },
            { takeaway: "Caches must be optional and version-busted on state change.", detail: "Treat them as performance, not source of truth." },
            { takeaway: "Circuit breakers + bulkheads keep one bad dependency from sinking the gateway.", detail: "Degrade gracefully, don't cascade." },
          ]}
        />
      </section>

      {/* ============================== PART 4 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 4 — Security and rollout</h2>
        <p>
          Security is woven through every layer. Rollout is how we ship without breaking 5,000 engineers&apos; days.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Identity and access</h3>
        <ul className="space-y-2">
          <li><strong>Users:</strong> SSO via the corporate IdP (OAuth2 + OIDC, PKCE). No app-managed passwords.</li>
          <li><strong>Service-to-service:</strong> mTLS via service mesh. Each pod has a SPIFFE identity from the mesh CA.</li>
          <li><strong>Authorization:</strong> repo-level roles (admin, maintainer, contributor); enforced at the data layer (<code>WHERE repo_id IN :allowed</code>), not just the controller.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Threat model — what we care about</h3>
        <ClassifyChallenge
          title="Threats vs controls"
          prompt="Match each threat to the primary control."
          buckets={[
            { id: "authz", label: "Object-level authz", color: "rose" },
            { id: "tokens", label: "Token validation", color: "amber" },
            { id: "secrets", label: "Secrets management", color: "emerald" },
            { id: "audit", label: "Audit + logging", color: "indigo" },
            { id: "pii", label: "Data minimization / encryption", color: "sky" },
          ]}
          items={[
            { id: "t1", label: "Engineer reads another team's private PR by guessing the URL", answer: "authz", explanation: "BOLA — every PR fetch must check repo membership at the query layer." },
            { id: "t2", label: "JWT minted for the search API is replayed against the merge endpoint", answer: "tokens", explanation: "Audience claim must be validated per service. Token from one aud should fail on another." },
            { id: "t3", label: "GitHub webhook signing key is committed to a repo by accident", answer: "secrets", explanation: "Vault + rotation. Pre-commit scanners catch the obvious; rotation policy handles the rest." },
            { id: "t4", label: "Six months later, who approved this merge?", answer: "audit", explanation: "Append-only audit log of every state transition. Can't reconstruct without it." },
            { id: "t5", label: "User requests deletion under GDPR — comments contain their email in mentions", answer: "pii", explanation: "Avoid storing emails inline; use stable IDs. Per-user crypto keys for any PII makes deletion tractable." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Rollout plan</h3>
        <ol className="space-y-3">
          <li>
            <strong>Phase 0 — internal alpha.</strong> Deploy to a single repo&apos;s team (~10 devs). Real PRs.
            Monitor latency, error rate, edge cases.
          </li>
          <li>
            <strong>Phase 1 — opt-in pilot.</strong> Open to ~5 teams. Feature flag at the org level. Mirror PRs to the
            existing system (dual-read) for 2 weeks. Compare for parity.
          </li>
          <li>
            <strong>Phase 2 — strangler.</strong> New repos go to CodeForge by default. Existing repos migrate on
            request. Both systems run in parallel.
          </li>
          <li>
            <strong>Phase 3 — full migration.</strong> Old system enters read-only mode. Active PRs drain. Backups taken.
          </li>
          <li>
            <strong>Phase 4 — decommission.</strong> Old system retired after a 90-day cooling-off period.
          </li>
        </ol>

        <Callout variant="insight" title="Always have a rollback button">
          Every phase has a documented rollback. &quot;Flip the feature flag, route traffic back, no data loss.&quot;
          If a deploy can&apos;t be undone in five minutes, it&apos;s too risky to ship at the start of the day, let
          alone Friday afternoon.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Schema evolution</h3>
        <ul className="space-y-2">
          <li>Expand-contract for breaking changes: add new column, dual-write, backfill, switch reads, drop old.</li>
          <li>Liquibase / Flyway for migrations, applied in CI before code rolls out.</li>
          <li>Kafka topics versioned via subject naming or schema registry (Avro/Protobuf with compatibility checks).</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Failure modes we explicitly accept</h3>
        <ul className="space-y-2">
          <li><strong>Search lag during high write bursts.</strong> Up to 30s. Acceptable.</li>
          <li><strong>Notification delays during incident recovery.</strong> Up to a few minutes. Acceptable.</li>
          <li><strong>60s of read-only during a Postgres failover.</strong> Acceptable; banner shows &quot;reconnecting.&quot;</li>
          <li><strong>What we do NOT accept:</strong> data loss for committed PRs, comments, or audit events. Ever.</li>
        </ul>

        <Checkpoint moduleSlug="capstone" id="security-rollout" title="Security & rollout checkpoint" xp={25}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Why dual-read against the legacy system in Phase 1?"
            options={[
              { label: "Performance comparison", correct: false, explanation: "Tangentially useful but not the main reason." },
              { label: "Parity verification — catch behavioral differences before they bite users", correct: true, explanation: "Right. Real users on real PRs surface edge cases that synthetic tests miss. Dual-read with comparison alarms on divergence." },
              { label: "To meet SOC2 requirements", correct: false, explanation: "Not a SOC2 driver." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="The threat model explicitly assumes engineers may try to read other teams' private PRs. Where does the primary control live?"
            options={[
              { label: "Frontend hides the link if you don't have access", correct: false, explanation: "Client-side controls are bypassable. URL guessing defeats them in seconds." },
              { label: "Query layer in the review service: WHERE repo_id IN (caller's allowed repos)", correct: true, explanation: "Right. Push enforcement to the data access layer. There's no way to construct a SQL query that returns data you can't see — defense by construction." },
              { label: "API gateway IP allowlist", correct: false, explanation: "Doesn't address the threat — engineers are inside the perimeter." },
            ]}
            hint="Where does enforcement become hard to bypass?"
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Phase 3 cuts old system to read-only. A PR is in-flight. What's the right behavior?"
            options={[
              { label: "Block the merge, force the user to recreate in CodeForge", correct: false, explanation: "User-hostile and creates lost work." },
              { label: "Drain in-flight PRs in the old system; new PRs in CodeForge only", correct: true, explanation: "Right. Don't break in-progress work. Existing PRs finish their lifecycle in the old system; only new work enters the new one. Smooth experience for everyone." },
              { label: "Migrate the in-flight PR data live", correct: false, explanation: "Risky and unnecessary if you're patient. Drain and decommission." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 4 recap"
          gist="Security at the query layer, rollout in phases with rollback at every step."
          points={[
            { takeaway: "Authorization at the data layer beats every other defense.", detail: "Hard to forget, hard to bypass. Defense by construction." },
            { takeaway: "Dual-read for parity verification before committing to migration.", detail: "Real users + real PRs > synthetic tests." },
            { takeaway: "Every rollout phase needs a documented rollback.", detail: "If you can't undo it in 5 minutes, you can't ship it confidently." },
          ]}
        />
      </section>

      {/* ============================== PART 5 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 5 — Defending the design</h2>
        <p>
          The final test of any architecture isn&apos;t whether you can draw it. It&apos;s whether you can defend the
          decisions when someone smart pushes back. Here are the questions you&apos;ll get and how to answer them.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;Why not just use GitHub?&quot;</h3>
        <p>
          Cost at 5k devs, data residency requirements, custom workflow integrations. Out of scope for this
          conversation, but a real architect would push back here too — &quot;build vs buy&quot; is itself a design
          decision.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;Why Postgres and not DynamoDB?&quot;</h3>
        <p>
          Joins. Reviewer assignments span PRs, users, repos. ACID matters for state transitions. Modest scale doesn&apos;t
          force a key-value model. DynamoDB would force application-side joins and weaker transactional semantics for
          no benefit at this scale.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;Why six services? You&apos;re over-decomposed.&quot;</h3>
        <p>
          Fair pushback. The minimum justifiable: review (PRs), comment (different volume + access pattern), notify
          (async, side-effecting). Search and audit can start as libraries inside review service and split later when
          they earn it. Day-one footprint can be 3 services, growing to 6.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;Why Kafka and not RabbitMQ or SQS?&quot;</h3>
        <p>
          Replay. Audit and search both need to consume the same events with different lag tolerances; if we add a new
          consumer (analytics in year 2), we want to backfill from the log. Kafka&apos;s durable log is the right tool.
          RabbitMQ would force per-consumer queues and lose replay.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;What if traffic 10x&apos;s overnight?&quot;</h3>
        <p>
          Postgres goes to read replicas + connection pool tuning first; sharding by <code>repo_id</code> is the second
          lever. Kafka and Redis scale horizontally with capacity. The bottleneck likely shows up in Postgres write
          throughput on the comment service — that&apos;s the first thing to shard.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">&quot;What&apos;s the single point of failure?&quot;</h3>
        <p>
          Honest answer: the API gateway, until we run multiple instances behind a load balancer (which we do in prod).
          Beyond that: the corporate IdP — if SSO is down, no logins, but in-flight sessions continue. Kafka brokers
          and Postgres are clustered.
        </p>

        <Callout variant="insight" title="The skill that matters">
          A senior architect doesn&apos;t pretend to have no SPOFs or no weaknesses — they enumerate them
          deliberately. &quot;These are the failures we&apos;ve designed against. These are the ones we&apos;ve chosen
          to accept. Here&apos;s the migration path if those become unacceptable.&quot; That&apos;s the answer that
          earns trust.
        </Callout>

        <Checkpoint moduleSlug="capstone" id="defense" title="Defense checkpoint" xp={25}>
          <Quiz
            kind="Quick check"
            xp={15}
            question={`An interviewer says "your design has six services for 5k devs — that's overengineered." Best response?`}
            options={[
              { label: "Six services is industry standard", correct: false, explanation: "Appeal to authority. Doesn't address the critique." },
              { label: "Fair point — minimum is 3 (review, comment, notify); search and audit start as libraries and split when they earn it", correct: true, explanation: "Right. Acknowledge the critique, defend the core, and show you'd evolve the boundaries with evidence. That's senior thinking." },
              { label: "We need separate services for separate teams to own", correct: false, explanation: "Conway's law is real but not a justification for unjustified decomposition." },
            ]}
            hint="Acknowledge what's true, defend what matters, evolve the rest."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question={`Asked "what's your single point of failure?" The wrong answer is:`}
            options={[
              { label: "The API gateway, mitigated by running multiple instances", correct: false, explanation: "This is honest and shows you've thought about it." },
              { label: "The corporate IdP — SSO outage blocks new logins", correct: false, explanation: "Honest acknowledgment of an external dependency. Good answer." },
              { label: "There are no SPOFs in our design", correct: true, explanation: "Right — that's the WORST answer. Every system has SPOFs. Pretending otherwise tells the interviewer you haven't thought it through. Always enumerate them." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Traffic 10x's overnight. First lever to pull?"
            options={[
              { label: "Shard the database by repo_id immediately", correct: false, explanation: "Sharding is invasive and slow. Cheaper levers exist first." },
              { label: "Read replicas + connection pool + cache hit ratio tuning", correct: true, explanation: "Right. The cheap, fast, reversible levers first. Sharding is the last resort, not the first response." },
              { label: "Rewrite hot endpoints in a faster language", correct: false, explanation: "Almost never the right answer at this scale; the bottleneck is usually downstream." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 5 recap"
          gist="The design defends itself when you can name its weaknesses out loud."
          points={[
            { takeaway: "Acknowledge fair critique; defend what matters; evolve what doesn't.", detail: "Pretending the design is perfect is the fastest way to lose credibility." },
            { takeaway: "Always know your SPOFs and your scaling levers in order of cost.", detail: "Replicas → cache → shard → rewrite, in that order." },
            { takeaway: "The senior move is justified honesty.", detail: "Here's what we accept, here's what we mitigate, here's the path forward." },
          ]}
        />
      </section>

      {/* ============================== Closing ============================== */}
      <section className="my-12 rounded-xl border border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-8">
        <h2 className="text-2xl font-bold mb-3">You did the thing</h2>
        <p>
          You walked a system from blank page to defensible architecture. Six services, four datastores, a streaming
          backbone, a security model, a rollout plan, and an honest list of what could go wrong. That&apos;s
          system design.
        </p>
        <p className="mt-3">
          The patterns repeat. The next time someone hands you &quot;design X&quot; — payments, search, notifications,
          analytics — you&apos;ll start with the same compass. Foundations, data, traffic, reliability, evolution,
          security. Numbers first, tools second, tradeoffs justified out loud.
        </p>
        <p className="mt-3 font-semibold">
          Course complete. Go build something.
        </p>
      </section>

      <section className="my-12">
        <h3 className="text-lg font-semibold mb-3">Next up</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          You&apos;re at the end of the course. Pick a real system at work — describe it on a whiteboard using this
          framework. The first time you do it on something live, this all clicks.
        </p>
      </section>
    </article>
  );
}
