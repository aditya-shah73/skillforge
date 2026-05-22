import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "why-hard", title: "Why migrations are hard" },
  { id: "strangler-expand", title: "Strangler & expand-contract" },
  { id: "dual-writes", title: "Dual-writes done right" },
];

const expandContractTimeline = `flowchart LR
  S1[1. Add new column<br/>nullable, no reads] --> S2[2. Dual-write<br/>app writes both]
  S2 --> S3[3. Backfill<br/>idempotent batch job]
  S3 --> S4[4. Switch reads<br/>feature flag flip]
  S4 --> S5[5. Stop writing old<br/>monitor for drift]
  S5 --> S6[6. Drop old column<br/>weeks later]
  style S1 fill:#fef3c7,stroke:#d97706
  style S3 fill:#dbeafe,stroke:#2563eb
  style S4 fill:#dcfce7,stroke:#16a34a
  style S6 fill:#fee2e2,stroke:#dc2626`;

const stranglerDiagram = `flowchart LR
  C[Client] --> P[Proxy / Router]
  P -->|95% traffic| L[Legacy monolith]
  P -->|5% traffic, /orders/v2| N[New service]
  L --> DB1[(Legacy DB)]
  N --> DB2[(New DB)]
  N -.read fallback.-> DB1
  style L fill:#fee2e2,stroke:#dc2626
  style N fill:#dcfce7,stroke:#16a34a
  style P fill:#dbeafe,stroke:#2563eb`;

export default function Page() {
  const mod = getModuleBySlug("migration-patterns")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="migration-patterns" />
        <ModuleProgress moduleSlug="migration-patterns" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 p-6 dark:border-pink-800 dark:from-pink-950/40 dark:to-rose-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🚧</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          The actual playbook for changing systems in flight without taking downtime. Strangler fig. Expand-contract. Dual writes. Backfills. The patterns that let you rename a column on a 100-million-row table while production keeps serving traffic.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Why &quot;big bang&quot; migrations almost always fail, and what to do instead</li>
          <li>Strangler fig: routing fractions of traffic to a new system over months</li>
          <li>Expand-contract for schema: add → dual-write → backfill → switch → drop</li>
          <li>Dual-writes done right: outbox pattern, idempotent backfills, rollback plans</li>
          <li>Cutover strategies: shadow reads, percentage shifting, feature flags</li>
        </ul>
      </section>

      <section>
        <h2>Why this module exists</h2>
        <p>
          Every system you&apos;ll ever work on is mid-migration. You join a team and there are three database schemas in flight, a half-rewritten payment service that still proxies 30% of traffic to the legacy monolith, and a column called <code>status_v2</code> that nobody can explain. This is normal. Production systems are rivers, not statues.
        </p>
        <p>
          The skill that distinguishes senior engineers isn&apos;t avoiding migrations — it&apos;s running them safely. Here&apos;s the thing: every migration pattern in this module is just a careful answer to one question — <em>how do I change a piece of a system that I cannot turn off?</em>
        </p>
      </section>

      <Checkpoint moduleSlug="migration-patterns" id="why-hard" title="Part 1 · Why migrations are hard" xp={25}>
        <h2>The dual-write problem</h2>
        <p>
          Almost every nontrivial migration runs into the same shape: for some window of time, the system has to keep <strong>two sources of truth</strong>{" "}in sync. Old database and new database. Database and cache. Database and search index. Old service and new service.
        </p>
        <p>
          Two sources of truth is not stable. The instant you have two, they will drift. Your job during a migration is to make the drift bounded and detectable, then collapse back to one source.
        </p>
        <p>
          Concretely, the dual-write problem shows up as:
        </p>
        <ul>
          <li><strong>DB + cache:</strong>{" "}you write the row, then update Redis. The DB write succeeds, the Redis call fails. Now your cache is stale and there&apos;s no event that will repair it.</li>
          <li><strong>DB + search:</strong>{" "}Postgres commits, you push to Elasticsearch, Elastic rejects the doc because of a mapping mismatch. Search and DB now disagree.</li>
          <li><strong>Old DB + new DB:</strong>{" "}you write to both during cutover. One write fails. Now the systems disagree on a single row, and you have no idea which one a user&apos;s next read will hit.</li>
        </ul>
        <p>
          The naive answer — <em>&quot;I&apos;ll just write to both inside one method call&quot;</em> — is not a solution. It&apos;s a way to hide the problem until the worst possible moment. The right tools are <strong>outbox pattern</strong>, <strong>idempotent backfills</strong>, and <strong>change data capture (CDC)</strong>, which we&apos;ll get to in part 3.
        </p>

        <Callout variant="warn" title="The 'I'll write to both' trap">
          <p className="m-0">If your code does <code>db.save(x); cache.set(x);</code> in sequence, you have a distributed transaction that nobody designed and nobody is monitoring. The first call commits, then the network blips, then the second call fails. Now there&apos;s a permanent inconsistency that no future request will fix on its own. This is the #1 way teams break themselves during migrations.</p>
        </Callout>

        <h3>The big-bang anti-pattern</h3>
        <p>
          The other classic failure is the <strong>big-bang migration</strong>: freeze writes Friday night, dump and reload, point the app at the new thing Saturday morning, hope for the best. This works for tiny systems and almost never for big ones. Here&apos;s why teams keep trying it anyway:
        </p>
        <ul>
          <li>It&apos;s easy to plan. One weekend, one runbook.</li>
          <li>Nobody has to design dual-write logic.</li>
          <li>You can pretend it&apos;s &quot;just&quot; an ops task.</li>
        </ul>
        <p>
          And here&apos;s why it falls apart:
        </p>
        <ul>
          <li><strong>The freeze window grows.</strong> &quot;Two hours&quot; becomes six. Becomes &quot;we&apos;re calling customers Sunday morning.&quot;</li>
          <li><strong>You can&apos;t roll back.</strong>{" "}Once the new system has accepted writes, the old system is behind. Going back means losing data.</li>
          <li><strong>You discover bugs in production at 3am.</strong>{" "}Schema differences, encoding mismatches, edge cases nobody backfilled — they all surface at the moment your team is most tired and traffic is starting to come back.</li>
        </ul>
        <p>
          The only real defense is <em>not freezing</em>. Migrate while the system is live. Every pattern in this module is essentially a way to answer the question <em>&quot;how do I do this without freezing?&quot;</em>
        </p>

        <Callout variant="insight" title="Risk vs velocity">
          <p className="m-0">Live migrations are slower in elapsed time — they take weeks, not a weekend — but they&apos;re lower risk because every step is reversible. Big-bang migrations look fast on the calendar and feel terrifying in the runbook. Senior teams trade calendar time for reversibility, every time.</p>
        </Callout>

        <h3>The honest cost of a migration</h3>
        <p>
          A well-run migration of a single non-trivial table — say, renaming a column on a 100M-row Postgres table — typically looks like:
        </p>
        <ul>
          <li>Week 1: write the migration plan, get review, build the dual-write code path behind a feature flag.</li>
          <li>Week 2: ship the schema change (the new nullable column), turn on dual-writes for new rows.</li>
          <li>Weeks 2–4: run the backfill in batches, throttled to avoid blowing up replication lag. Verify drift between old and new is zero.</li>
          <li>Week 5: flip the feature flag for reads. Watch dashboards.</li>
          <li>Weeks 5–7: stop writing the old column. Confirm nothing reads it. Drop it.</li>
        </ul>
        <p>
          A month and a half. For one column. This sounds like a lot until you compare it to a botched big-bang that took down checkout for six hours and got a postmortem written about it. The slow path is the cheap path.
        </p>

        <Quiz
          question="Your team writes a payment row to Postgres and then immediately publishes a 'payment_made' event to Kafka inside the same handler. The Postgres write commits, but the Kafka call times out. What's the actual failure mode?"
          options={[
            { label: "Permanent inconsistency: the payment exists in Postgres but no downstream system will ever know about it. Retrying the handler call doesn't help — the row is already there. This is the dual-write problem in miniature.", correct: true, explanation: "Right. You wrote to two systems with no atomic boundary. The fix is to write the event to an outbox table inside the same Postgres transaction, then have a separate process publish it to Kafka with retries." },
            { label: "No problem — Kafka has at-least-once delivery, the message will eventually arrive.", explanation: "At-least-once kicks in once Kafka has accepted the message. The failure here is before Kafka has it at all — the call timed out. Nothing in Kafka knows the event was supposed to exist." },
            { label: "The Postgres transaction will roll back when Kafka fails.", explanation: "The Postgres transaction already committed before the Kafka call started — there's nothing to roll back. The two operations are not part of one transaction." },
            { label: "It's fine because Spring's @Transactional will handle it.", explanation: "@Transactional only covers JDBC. It can't roll back a Kafka publish that already returned a timeout. Cross-system atomicity has to be designed, not assumed." },
          ]}
          hint="Are the two writes part of one atomic operation? They look like they are, but..."
          xp={7}
        />

        <Quiz
          question="A team plans to migrate from MySQL to Postgres by 'freezing writes for an hour, dumping/reloading, and switching the app config.' What's the strongest objection?"
          options={[
            { label: "Big-bang migrations have no rollback once the new system accepts writes, and the freeze window almost always grows in practice. Live migration with dual writes + backfill is slower but reversible at every step.", correct: true, explanation: "Exactly. The freeze plan looks tidy on a runbook and feels terrifying at 2am when something is wrong. Live migration trades calendar time for the ability to back out." },
            { label: "MySQL and Postgres have different SQL dialects, so the schema can't migrate.", explanation: "Dialects are a real concern but secondary — they can be handled with adapters or schema translation. The structural risk is the freeze-and-flip approach itself." },
            { label: "You can't migrate databases without downtime, ever.", explanation: "You absolutely can — this entire module is about how. The objection isn't 'don't migrate', it's 'don't do it as a single freeze window'." },
            { label: "Postgres can't handle MySQL-scale traffic.", explanation: "Postgres can handle the same traffic shapes MySQL does. The objection here is procedural, not capacity." },
          ]}
          hint="What goes wrong when something goes wrong at 3am?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Migrations are hard because they create temporary dual sources of truth. Big-bang freezes look cheap on the calendar and are usually expensive in practice."
          points={[
            { takeaway: "Two sources of truth always drift", detail: "DB+cache, DB+search, old-DB+new-DB. Without an explicit pattern (outbox, CDC, idempotent backfill) drift is inevitable and often invisible." },
            { takeaway: "The 'write to both in one method' approach is a bug", detail: "It's an undesigned distributed transaction. The first call commits, the second fails, and no future event will repair it." },
            { takeaway: "Big-bang migrations sacrifice reversibility for calendar time", detail: "The freeze window grows. Rollbacks become impossible once the new system takes writes. Senior teams trade weeks of safe live migration for the freeze weekend, every time." },
            { takeaway: "A real schema migration takes weeks, not hours", detail: "Renaming one column on a 100M-row table is typically a 4-6 week live migration. That's the price of doing it without downtime." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="migration-patterns" id="strangler-expand" title="Part 2 · Strangler fig & expand-contract" xp={25}>
        <h2>Strangler fig: replace a monolith without rewriting it</h2>
        <p>
          Martin Fowler named the pattern after the strangler fig — a tree that grows around an old tree, slowly replacing it. The shape is the same in software. You put a router in front of the legacy system. New endpoints get implemented in a new service. The router sends traffic for those endpoints to the new service; everything else still goes to the legacy. Over months or years, the router&apos;s &quot;new service&quot; column grows and the &quot;legacy&quot; column shrinks until eventually the legacy can be turned off.
        </p>
        <Mermaid chart={stranglerDiagram} />
        <p>
          The properties that make this work:
        </p>
        <ul>
          <li><strong>Per-endpoint cutover.</strong>{" "}You move <code>/orders</code> in week 4, <code>/users</code> in week 9, <code>/billing</code> never (because it&apos;s the scariest). You&apos;re never doing a single big move.</li>
          <li><strong>Per-endpoint rollback.</strong>{" "}If the new <code>/orders</code> implementation has a bug, the router flips traffic back to legacy in seconds. No data was destroyed.</li>
          <li><strong>Bounded blast radius.</strong>{" "}A bug in the new service affects only the endpoints you&apos;ve moved. The legacy keeps serving the rest.</li>
        </ul>
        <p>
          The classic mistake is treating strangler fig as &quot;rewrite the new service, then move all traffic at once.&quot; That&apos;s a big-bang migration with extra steps. The whole point is the gradual move — usually starting with read-only or low-risk endpoints, building confidence, then tackling the writes.
        </p>

        <Callout variant="info" title="What does the router actually look like?">
          <p className="m-0">Often it&apos;s your existing API gateway (Spring Cloud Gateway, Kong, Envoy) with a routing rule per path. Sometimes it&apos;s a thin Nginx config. For trickier cases — say, splitting traffic by user ID — it&apos;s a small &quot;dispatch service&quot; that looks at the request and forwards to either the legacy or the new service. The router doesn&apos;t need to be fancy. It needs to be configurable and observable.</p>
        </Callout>

        <h3>Picking the first endpoint to move</h3>
        <p>
          You want the first endpoint you migrate to be:
        </p>
        <ul>
          <li><strong>Read-heavy.</strong>{" "}Reads are easier to roll back than writes — the worst case is a stale response, not a corrupted database.</li>
          <li><strong>Low-stakes.</strong>{" "}Nobody&apos;s wallet is on the line if it has a bug for an hour.</li>
          <li><strong>Self-contained.</strong>{" "}Doesn&apos;t require huge swaths of legacy logic to reimplement.</li>
        </ul>
        <p>
          Common first moves: a <code>/health</code> or <code>/version</code> endpoint (almost trivial), a read-only product-catalog list, a search endpoint that&apos;s already partially proxied. Save the writes — orders, payments, user creation — for after you&apos;ve built confidence with the routing infrastructure.
        </p>

        <h2>Expand-contract: schema changes on live tables</h2>
        <p>
          Strangler fig is for services. Expand-contract is its sibling for <em>schemas</em>. The shape is identical: instead of changing a column in place, you grow new schema next to the old, migrate data and code over to it, then shrink the old away.
        </p>
        <p>
          The canonical example: rename a column from <code>old_status</code> to <code>status</code> on a 100M-row table.
        </p>
        <Mermaid chart={expandContractTimeline} />
        <p>
          Each step is a deploy. Each step is reversible. No step requires a freeze window.
        </p>

        <h3>The six steps, walked carefully</h3>
        <ol>
          <li><strong>Add the new column, nullable, no reads.</strong>{" "}Pure ALTER TABLE — fast on Postgres if the column is nullable with no default. The application doesn&apos;t know about the column yet.</li>
          <li><strong>Dual-write.</strong>{" "}Deploy code that writes both the old and the new column on every update. New rows get both populated. Old rows still have the old column populated and the new column NULL.</li>
          <li><strong>Backfill.</strong>{" "}A separate batch job copies the old column&apos;s value into the new column for every existing row, in idempotent batches of (say) 10k rows. Throttled to keep replication lag under your SLO. After it&apos;s done, every row has both columns matching.</li>
          <li><strong>Switch reads.</strong>{" "}Behind a feature flag, flip the application&apos;s read path from <code>old_status</code> to <code>status</code>. Roll out gradually — 1%, 10%, 100%. Watch for errors.</li>
          <li><strong>Stop writing the old column.</strong>{" "}Once reads are 100% on the new column for a few days and nothing depends on the old, deploy code that only writes <code>status</code>. The old column is now frozen.</li>
          <li><strong>Drop the old column.</strong>{" "}Weeks later, when you&apos;re sure nothing reads it (verify with logs and slow-query analysis), <code>ALTER TABLE DROP COLUMN</code>. Done.</li>
        </ol>

        <CodeBlock lang="java" caption="Liquibase: the expand step (add nullable column)">{`<changeSet id="20260415-add-status-column" author="david">
  <!-- Step 1 of expand-contract. New column, nullable, no default.
       Postgres can do this near-instantly even on a 100M-row table
       because nullable-with-no-default doesn't rewrite the heap. -->
  <addColumn tableName="orders">
    <column name="status" type="varchar(32)">
      <constraints nullable="true"/>
    </column>
  </addColumn>
</changeSet>

<changeSet id="20260415-add-status-index" author="david">
  <!-- Index concurrently in Postgres so it doesn't lock writes.
       Liquibase passes through to CREATE INDEX CONCURRENTLY. -->
  <sql splitStatements="false">
    CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
  </sql>
</changeSet>`}</CodeBlock>

        <CodeBlock lang="java" caption="The dual-write step in the application">{`@Service
public class OrderService {

  private final JdbcTemplate jdbc;
  private final FeatureFlags flags;

  // Phase 2 of expand-contract: every write populates BOTH columns.
  // Reads still come from old_status. The new column is just shadow data.
  public void updateStatus(long orderId, String newStatus) {
    jdbc.update("""
      UPDATE orders
         SET old_status = ?,
             status     = ?,
             updated_at = NOW()
       WHERE id = ?
      """, newStatus, newStatus, orderId);
  }

  // Phase 4: reads switch via feature flag.
  // We keep the old read path until we're 100% sure the new column is right.
  public String getStatus(long orderId) {
    if (flags.isOn("orders.read_new_status_column", orderId)) {
      return jdbc.queryForObject(
        "SELECT status FROM orders WHERE id = ?", String.class, orderId);
    }
    return jdbc.queryForObject(
      "SELECT old_status FROM orders WHERE id = ?", String.class, orderId);
  }
}`}</CodeBlock>

        <Callout variant="spring" title="Liquibase vs Flyway">
          <p className="m-0">Both work. Flyway has a simpler model (numbered SQL files, no rollback support out of the box). Liquibase is more featureful (XML/YAML changeSets, built-in rollbacks, conditional logic). For expand-contract, either is fine — what matters is that every step is its own changeSet/migration so you can deploy them independently. Don&apos;t lump &quot;add column + dual-write code&quot; into a single change.</p>
        </Callout>

        <h3>The backfill: idempotent, resumable, throttled</h3>
        <p>
          Backfills sound simple — &quot;just copy the data&quot; — and then they take down production. The three properties that matter:
        </p>
        <ul>
          <li><strong>Idempotent.</strong>{" "}Running the same batch twice produces the same result. Use <code>UPDATE ... WHERE status IS NULL</code>, not <code>UPDATE ... ; INSERT INTO migration_log</code>.</li>
          <li><strong>Resumable.</strong>{" "}Track progress (last id processed, or a high-water-mark timestamp). If the job dies at row 47 million, the next run picks up at 47,000,001.</li>
          <li><strong>Throttled.</strong>{" "}Pause between batches. Watch replication lag and back off if it grows. Backfilling at full speed will kill your replicas.</li>
        </ul>

        <CodeBlock lang="java" caption="A throttled, resumable backfill batch job">{`@Component
public class StatusBackfillJob {

  private static final int BATCH_SIZE = 10_000;
  private static final Duration PAUSE = Duration.ofMillis(500);
  // Replicate lag SLO — we pause longer if replicas fall behind this.
  private static final Duration MAX_REPLICA_LAG = Duration.ofSeconds(30);

  private final JdbcTemplate jdbc;
  private final ReplicaLagProbe lag;

  // Resume from wherever we left off. Stored in a control table.
  public void runOnce() {
    long lastId = jdbc.queryForObject(
      "SELECT last_id FROM backfill_state WHERE job = 'status_backfill'",
      Long.class);

    while (true) {
      // Idempotent UPDATE — only touches rows where new column is still null.
      // Re-running this is safe: a row already migrated won't match.
      int updated = jdbc.update("""
        UPDATE orders
           SET status = old_status
         WHERE id > ?
           AND id <= ?
           AND status IS NULL
        """, lastId, lastId + BATCH_SIZE);

      lastId += BATCH_SIZE;
      jdbc.update(
        "UPDATE backfill_state SET last_id = ? WHERE job = 'status_backfill'",
        lastId);

      if (updated == 0 && noMoreRows(lastId)) break;

      // Throttle: back off if replicas are lagging behind.
      Duration currentLag = lag.measure();
      if (currentLag.compareTo(MAX_REPLICA_LAG) > 0) {
        sleep(Duration.ofSeconds(10)); // long pause to let replicas catch up
      } else {
        sleep(PAUSE);
      }
    }
  }

  private boolean noMoreRows(long lastId) {
    Long max = jdbc.queryForObject("SELECT MAX(id) FROM orders", Long.class);
    return max == null || lastId >= max;
  }

  private void sleep(Duration d) {
    try { Thread.sleep(d.toMillis()); }
    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
  }
}`}</CodeBlock>

        <Callout variant="warn" title="The backfill that ate the replicas">
          <p className="m-0">A common production incident: someone runs a backfill in a single big <code>UPDATE</code> with no LIMIT. Postgres locks every row, the WAL explodes, replicas fall hours behind, the read replicas start serving stale data, and your dashboards turn red. Always batch. Always throttle. Always watch replication lag while it runs.</p>
        </Callout>

        <Quiz
          question="During an expand-contract migration of a 200M-row users table, you've added a new email_lower column and turned on dual-writes. The backfill script does this: UPDATE users SET email_lower = LOWER(email) WHERE email_lower IS NULL. You start it and database CPU pegs at 100%. What went wrong?"
          options={[
            { label: "The query has no LIMIT and no batching — it tries to update all 200M rows in a single transaction. Postgres locks the rows, replication lag spikes, and CPU saturates. Backfills must run in throttled batches with explicit row bounds.", correct: true, explanation: "Right. A single UPDATE on 200M rows generates 200M WAL records in one transaction, replicas can't keep up, and the primary chokes on the lock contention. Batched (e.g. WHERE id BETWEEN ? AND ?) with sleep between batches is the correct shape." },
            { label: "LOWER() is not indexable, so Postgres has to scan the whole table.", explanation: "The scan is real but isn't the dominant problem. You can scan a 200M-row table in chunks fine. The killer is doing 200M updates in one transaction." },
            { label: "Dual-writes shouldn't have been turned on yet.", explanation: "Turning on dual-writes before backfilling is correct ordering — it ensures new rows get both columns. The bug is the backfill query shape, not the sequence." },
            { label: "You should have used a stored procedure instead.", explanation: "Stored procedure vs application code doesn't matter; the issue is transaction size and throttling. Either approach has to batch." },
          ]}
          hint="What does a single UPDATE that touches 200M rows do to the WAL?"
          xp={7}
        />

        <Quiz
          question="Your team is using strangler fig to move /orders off a legacy monolith. Which is the safest first endpoint to move?"
          options={[
            { label: "GET /orders/{id} (read-only) — failures only return stale data, never corrupt it; rollback is a router config flip.", correct: true, explanation: "Right. Read-only endpoints have the smallest blast radius. The new service might return a wrong answer for an hour, but nothing in the database is destroyed. You build confidence in the routing infrastructure before tackling writes." },
            { label: "POST /orders (create) — that's the highest traffic, so you'll learn fastest.", explanation: "You'll learn fastest by breaking real customer orders. Writes have permanent failure modes — duplicate orders, lost orders. Save those for after the read path is solid." },
            { label: "DELETE /orders/{id} — small surface area, easy to migrate.", explanation: "Deletes are permanent. A bug in DELETE during cutover means you've lost data with no rollback. Worst possible first endpoint." },
            { label: "All endpoints at once — strangler fig means gradual but you should still cut over the whole API together.", explanation: "That's a big-bang migration with strangler-fig branding. The whole point of the pattern is per-endpoint cutover with per-endpoint rollback." },
          ]}
          hint="If the new service has a bug, which kind of failure is recoverable?"
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Strangler fig replaces services gradually with a router. Expand-contract does the same thing for schemas: add new structure, dual-write, backfill, switch, then drop the old."
          points={[
            { takeaway: "Strangler fig is per-endpoint, never all-at-once", detail: "A router fronts the legacy. New endpoints land in a new service. Each endpoint moves independently, with its own rollback. The legacy shrinks over months." },
            { takeaway: "Expand-contract has six explicit steps", detail: "Add nullable column → dual-write → backfill → switch reads → stop writing old → drop old. Each is a deploy. Each is reversible." },
            { takeaway: "Backfills must be batched, idempotent, and throttled", detail: "Single big UPDATE = locks + WAL flood + replica lag = outage. Batch by id range, track progress, watch replication lag, and back off when it grows." },
            { takeaway: "Pick read-only endpoints first", detail: "Reads are the cheapest to roll back. Build confidence in the routing and observability before you migrate the write path." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="migration-patterns" id="dual-writes" title="Part 3 · Dual-writes done right" xp={25}>
        <h2>The outbox pattern (again, because it&apos;s essential)</h2>
        <p>
          Phase 5 — the <Link href="/courses/system-design/modules/distributed-transactions">distributed transactions module</Link> — introduced the outbox pattern as a way to publish events alongside a database write atomically. It comes back here because <strong>almost every cross-system migration needs it</strong>.
        </p>
        <p>
          The shape: instead of writing to system A and then publishing to system B (which can fail between the two), write to system A <em>and</em>{" "}append to an <code>outbox</code> table inside the same transaction. A separate publisher reads the outbox and pushes to system B with retries. If the publisher crashes, the outbox row stays. Eventually it gets delivered exactly once-ish.
        </p>

        <CodeBlock lang="java" caption="Outbox pattern for cross-system migration">{`@Service
public class PaymentService {

  private final JdbcTemplate jdbc;

  // Both writes happen in ONE Postgres transaction.
  // If the transaction commits, the outbox row is durable.
  // If anything fails, both roll back together.
  @Transactional
  public void recordPayment(Payment p) {
    jdbc.update("""
      INSERT INTO payments (id, amount, status, created_at)
      VALUES (?, ?, ?, NOW())
      """, p.getId(), p.getAmount(), p.getStatus());

    // Outbox row — will be picked up by the publisher and forwarded to
    // the new payments service, Kafka, search index, whatever.
    jdbc.update("""
      INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload, created_at)
      VALUES (?, 'payment', ?, 'payment.recorded', ?::jsonb, NOW())
      """, UUID.randomUUID(), p.getId(), p.toJson());
  }
}

@Component
public class OutboxPublisher {

  private final JdbcTemplate jdbc;
  private final NewPaymentsClient newSystem;

  // A scheduled task — could also be a CDC stream.
  @Scheduled(fixedDelay = 1000)
  public void publishBatch() {
    List<OutboxRow> rows = jdbc.query("""
      SELECT id, event_type, payload
        FROM outbox
       WHERE published_at IS NULL
       ORDER BY created_at
       LIMIT 100
       FOR UPDATE SKIP LOCKED
      """, this::map);

    for (OutboxRow row : rows) {
      try {
        // Idempotent on the receiver — uses row.id as the dedup key.
        newSystem.send(row.eventType(), row.id(), row.payload());
        jdbc.update("UPDATE outbox SET published_at = NOW() WHERE id = ?", row.id());
      } catch (Exception e) {
        // Leave the row unpublished — next tick will retry.
        // After N retries, alert and move to dead-letter.
      }
    }
  }
}`}</CodeBlock>

        <Callout variant="insight" title="Why outbox beats 'write to both'">
          <p className="m-0">The two writes — payments table and outbox table — are in the <em>same</em>{" "}Postgres transaction. They commit together or roll back together. The publisher is the only thing talking to the second system, and it&apos;s designed to retry safely. You replaced an undesigned distributed transaction with a designed one that lives entirely inside Postgres.</p>
        </Callout>

        <h2>Cutover strategies</h2>
        <p>
          Cutover is the moment you flip from &quot;old system serves reads&quot; to &quot;new system serves reads.&quot; Doing this carelessly is how migrations explode. Here are the techniques senior teams actually use, in order of safety:
        </p>

        <h3>1. Read shadowing</h3>
        <p>
          Before any user sees a result from the new system, send every read to <em>both</em>{" "}old and new in parallel. Return the old result to the user. Compare the two asynchronously and log mismatches. This catches every &quot;the new system gives slightly different answers&quot; bug before it ever affects production.
        </p>
        <p>
          It costs 2x reads for the duration of shadowing. That&apos;s usually a small price for finding 100% of the bugs in advance.
        </p>

        <CodeBlock lang="java" caption="Read shadowing — return old, log diffs from new">{`@Service
public class ShadowedOrderReader {

  private final LegacyOrderRepo legacy;
  private final NewOrderRepo newRepo;
  private final MeterRegistry metrics;
  private final FeatureFlags flags;

  public Order getOrder(long id) {
    Order legacyResult = legacy.findById(id);

    // Shadow read: only when the flag is on, and never block the user on it.
    if (flags.isOn("orders.shadow_new_repo")) {
      CompletableFuture.runAsync(() -> compare(id, legacyResult));
    }

    return legacyResult; // user gets the legacy answer, always, until cutover
  }

  private void compare(long id, Order legacyResult) {
    try {
      Order newResult = newRepo.findById(id);
      if (!Objects.equals(legacyResult, newResult)) {
        metrics.counter("orders.shadow_mismatch").increment();
        log.warn("Shadow mismatch for order {}: legacy={}, new={}",
          id, legacyResult, newResult);
      } else {
        metrics.counter("orders.shadow_match").increment();
      }
    } catch (Exception e) {
      metrics.counter("orders.shadow_error").increment();
    }
  }
}`}</CodeBlock>

        <h3>2. Percentage traffic shifting</h3>
        <p>
          When shadow reads have been clean for days, start sending a small percentage of <em>real</em>{" "}reads to the new system and returning its result. 1%, then 10%, then 50%, then 100%. Each step you watch dashboards and error rates. If anything looks wrong, drop back to 0 instantly via the feature flag.
        </p>
        <p>
          Bucket by user ID, not at random. Random bucketing means a single user gets old/new alternating responses, which can manifest as inconsistency bugs (&quot;why did my orders disappear and reappear?&quot;). Hashing on user ID gives every user a stable assignment.
        </p>

        <h3>3. Feature flags as the cutover lever</h3>
        <p>
          The flip itself should be a feature flag toggle, not a deploy. Deploys take minutes; flag toggles take seconds. If the new system is broken, you want the rollback to be measured in seconds.
        </p>

        <Callout variant="warn" title="The rollback plan is part of the migration plan">
          <p className="m-0">Before you flip any flag, write down — on paper or in the runbook — exactly what you&apos;ll do if something goes wrong. &quot;Toggle the flag back to 0%, watch error rate drop, page on-call if it doesn&apos;t.&quot; If your migration plan doesn&apos;t have a rollback section, it isn&apos;t a migration plan, it&apos;s an aspiration.</p>
        </Callout>

        <h3>The drift detector</h3>
        <p>
          Once you&apos;re dual-writing — to the old DB and the new DB, or DB and search index — you need a job that periodically samples rows from both sides and verifies they match. This is your insurance. If a write somewhere fails silently, the drift detector finds it.
        </p>
        <CodeBlock lang="plain" caption="Drift detector pseudocode">{`every 10 minutes:
  sample 1000 random ids from orders
  for each id:
    legacy = SELECT * FROM legacy_orders WHERE id = ?
    new    = SELECT * FROM new_orders    WHERE id = ?
    if legacy != new:
      emit metric: orders.drift_detected
      log: id, legacy hash, new hash
      if drift > threshold: page on-call

if drift counter > 0 for >1 hour:
  block the cutover`}</CodeBlock>

        <h3>The full migration playbook</h3>
        <p>
          Stitching the patterns together, here&apos;s the actual order of operations for a database migration:
        </p>
        <ol>
          <li><strong>Stand up new system.</strong>{" "}Empty. Schema in place. Reachable from the app.</li>
          <li><strong>Turn on dual-writes.</strong>{" "}All new writes go to both old and new (via outbox if cross-system). Reads still hit old.</li>
          <li><strong>Run the backfill.</strong>{" "}Throttled, idempotent, resumable. New system is now &quot;caught up&quot; with old.</li>
          <li><strong>Shadow reads.</strong>{" "}Send reads to both, return old, log diffs. Run until diffs are zero for several days.</li>
          <li><strong>Percentage cutover.</strong> 1% → 10% → 50% → 100% over days, with a feature flag and per-user bucketing.</li>
          <li><strong>Stop writing the old system.</strong>{" "}Once reads are 100% new for a week and drift is zero.</li>
          <li><strong>Decommission.</strong>{" "}Snapshot, archive, drop the old. Save it for one more month before deleting backups.</li>
        </ol>

        <Callout variant="insight" title="The scariest step is step 6, not step 5">
          <p className="m-0">Most teams celebrate when they hit 100% reads on the new system. The actual point of no return is when you stop writing to the old system — that&apos;s when you lose the ability to roll back. Hold that step longer than feels comfortable. Two weeks of running both systems in parallel costs almost nothing; the cost of being wrong is enormous.</p>
        </Callout>

        <Quiz
          question="During shadow reads on a payments-service migration, you find that 0.3% of reads return slightly different results between old and new. The new system is missing a few cents on some orders. What do you do?"
          options={[
            { label: "Stop the cutover. Investigate and fix the discrepancy in the new system. Shadow reads are exactly the gate to catch this — letting 0.3% bad reads into production at percentage cutover means real customer-visible bugs.", correct: true, explanation: "Right. 0.3% drift on a payments system is unacceptable, and shadow mode is doing exactly its job. The whole point is to catch this before users see it." },
            { label: "Proceed with the cutover at 1% — most users will be fine and you'll get more signal.", explanation: "You already have signal: the new system is wrong 0.3% of the time. Pushing live and waiting for users to notice is exactly the failure mode shadow reads are designed to prevent." },
            { label: "Deploy with a banner saying 'amounts may be slightly off during migration.'", explanation: "Payments accuracy is non-negotiable. There's no UX banner that fixes 'we sometimes lose a few cents'." },
            { label: "Re-run the backfill — it must have skipped rows.", explanation: "Maybe, but you don't actually know that yet. The first step is to investigate the discrepancy, not blindly re-backfill." },
          ]}
          hint="What's shadow mode actually for?"
          xp={7}
        />

        <Quiz
          question="You're doing percentage cutover from old → new orders service. You bucket users by hashing on a random number per request rather than by user ID. What's the bug?"
          options={[
            { label: "Per-request randomness means the same user gets old vs new on different reads. They'll see their order list change between refreshes ('why did my last order disappear?'). Bucket by user ID so each user is consistently on one system.", correct: true, explanation: "Exactly. Stable per-user assignment is essential. Random per-request gives users an inconsistent view of their own data, which manifests as the worst kind of bug — one that looks like data loss." },
            { label: "Per-request hashing is fine; the systems should agree on the data anyway.", explanation: "If the systems agreed perfectly, you wouldn't need shadow reads or a cutover at all. The whole reason for percentage rollout is that the systems can disagree, and inconsistent bucketing exposes those disagreements to single users." },
            { label: "Random bucketing is too cheap to compute — use a cryptographic hash.", explanation: "The bug is per-request vs per-user, not the hash function. SHA vs murmur doesn't matter; stability does." },
            { label: "Bucket by IP address instead.", explanation: "IP-based bucketing breaks for users behind shared NATs (corporate networks, mobile carriers). User ID is the right key." },
          ]}
          hint="What does a single user see if their bucket changes per request?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The outbox pattern makes cross-system writes atomic. Cutover is a sequence: dual-write → backfill → shadow → percentage shift → stop writing old → decommission."
          points={[
            { takeaway: "Outbox replaces undesigned distributed transactions", detail: "Write to your DB and to an outbox table in one transaction. A separate publisher pushes the outbox row to the other system with retries. Crashes are recoverable." },
            { takeaway: "Shadow reads catch every 'they disagree' bug", detail: "Read both, return one, log diffs. 2x read cost, near-zero risk to users. Run until diff rate is zero for days." },
            { takeaway: "Percentage cutover bucket by user, not by request", detail: "Per-request randomness gives a single user an inconsistent view across refreshes. Stable per-user assignment is non-negotiable." },
            { takeaway: "The point of no return is when you stop writing the old system", detail: "Hold dual-writes longer than feels comfortable. The cost of running both is small; the cost of losing rollback is enormous." },
            { takeaway: "Every migration has a rollback plan written down before flag-flip", detail: "If your runbook doesn't say 'if X goes wrong, do Y in under 60 seconds', you don't have a migration plan. You have an aspiration." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Where this fits with the rest of the course</h2>
        <p>
          Migration patterns sit at the intersection of almost every previous module. The outbox pattern came from <Link href="/courses/system-design/modules/distributed-transactions">distributed transactions</Link>. Idempotent backfills lean on <Link href="/courses/system-design/modules/idempotency">idempotency</Link>. Replication lag awareness ties back to <Link href="/courses/system-design/modules/replication">replication strategies</Link>. Feature flags and gradual cutover are reliability moves out of <Link href="/courses/system-design/modules/observability">observability</Link>.
        </p>
        <p>
          The mental model: every change to a live system is a tiny migration. Renaming a config key, splitting a service, adopting a new cache. The patterns scale down as well as up. Once you internalize <em>add → dual → switch → drop</em>, you stop being scared of changing things in production.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Security in system design. AuthN/AuthZ, secrets management, mTLS between services, and the OWASP top 10 from a system designer&apos;s perspective.
        </p>
        <Link
          href="/courses/system-design/modules/security-design"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-cyan-600 hover:to-blue-600 hover:shadow-md"
        >
          Continue to Security in System Design →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="migration-patterns" />
    </article>
  );
}
