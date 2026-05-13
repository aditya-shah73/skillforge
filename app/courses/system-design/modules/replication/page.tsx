import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleProgress from "@/components/ModuleProgress";
import Checkpoint from "@/components/Checkpoint";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "leader-follower", title: "Leader-follower" },
  { id: "quorums", title: "Multi-leader & quorums" },
  { id: "lag", title: "Replication lag in production" },
];

const leaderDiagram = `flowchart LR
  W[Writer / Spring DAO] -->|writes| L[(Leader / Primary)]
  L -->|WAL stream| F1[(Follower 1)]
  L -->|WAL stream| F2[(Follower 2)]
  R1[Read traffic] --> F1
  R2[Read traffic] --> F2
  R3[Strongly-consistent read] --> L
  style L fill:#fee2e2,stroke:#b91c1c
  style F1 fill:#dbeafe,stroke:#1e40af
  style F2 fill:#dbeafe,stroke:#1e40af`;

const quorumDiagram = `flowchart TB
  C[Client] -->|write key=K| N1[(Node 1)]
  C -->|write key=K| N2[(Node 2)]
  C -->|write key=K| N3[(Node 3)]
  C -->|read key=K| R1[(Node 1)]
  C -->|read key=K| R2[(Node 2)]
  R1 -.merge by version.-> Result["Most recent value wins"]
  R2 -.merge by version.-> Result
  style N1 fill:#dcfce7,stroke:#166534
  style N2 fill:#dcfce7,stroke:#166534
  style N3 fill:#dcfce7,stroke:#166534`;

export default function Page() {
  const mod = getModuleBySlug("replication")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <ModuleProgress moduleSlug="replication" checkpoints={CHECKPOINTS} />
      </header>

      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4">What you&apos;ll walk out with</h2>
        <ul className="space-y-2">
          <li>The leader-follower model in concrete terms — sync vs async, what happens during failover, and what Spring code looks like.</li>
          <li>Multi-leader and leaderless replication, and why <code>R + W &gt; N</code> is the quorum rule everyone keeps writing on whiteboards.</li>
          <li>The numbers behind replication lag — typical 5–500ms, what causes spikes, and how to design around it.</li>
          <li>Read-your-writes and monotonic-reads as concrete patterns, not just textbook terms.</li>
        </ul>
      </section>

      <section className="my-10">
        <p>
          Replication is what keeps your data alive when a disk fails, what spreads read traffic across more boxes,
          and what lets you sleep through pager noise. It&apos;s also the source of approximately every data
          consistency bug you&apos;ve ever seen, because the lag is real and the lag is variable.
        </p>
        <p>
          The trick isn&apos;t learning the algorithms — those are well-defined. The trick is internalizing that
          your replicas are <em>always slightly behind</em>, and the day a replica is 30 seconds behind instead of
          30 milliseconds, your application better not assume it&apos;s caught up.
        </p>
      </section>

      <Checkpoint moduleSlug="replication" id="leader-follower" title="Leader-follower" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 1 — Leader-follower (the default)</h2>

        <p>
          Postgres, MySQL, and most relational databases ship with leader-follower replication. One node accepts writes
          (the leader, sometimes called primary or master). It streams its write-ahead log to followers. Followers replay
          the log and serve reads.
        </p>

        <Mermaid chart={leaderDiagram} />

        <h3 className="text-xl font-semibold mt-8 mb-3">Synchronous vs asynchronous</h3>
        <p>
          The fundamental knob:
        </p>
        <ul>
          <li><strong>Async:</strong> leader acks the write as soon as it&apos;s in its own WAL. Followers catch up later. Fast writes, but if the leader dies before the WAL replicates, you lose data.</li>
          <li><strong>Sync:</strong> leader waits until at least one (or N) follower confirms before acking. Durable. Slow — the write latency is bounded by the slowest follower in the sync set.</li>
        </ul>
        <p>
          Postgres lets you mix: <code>synchronous_commit = on</code> with a list of synchronous standbys. The most
          common production setup is &quot;one sync replica, the rest async&quot; — durability without paying for
          all replicas to confirm.
        </p>

        <CodeBlock lang="plain" caption="postgresql.conf — common production setup">{`# Leader: at least one named follower must ack
synchronous_commit = on
synchronous_standby_names = 'FIRST 1 (replica_a, replica_b, replica_c)'

# Followers stream from leader
hot_standby = on
hot_standby_feedback = on   # tells leader not to vacuum rows the follower is reading`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="Your team runs Postgres with one sync replica and two async replicas. The leader's data center loses power. The sync replica is in a different DC, the async ones are in a third. What's safe to assume about data loss?"
          options={[
            { label: "Zero data loss — sync replication guarantees it.", correct: true, explanation: "Sync replication means every committed transaction was acked by the sync replica before the client got success. If the leader is gone, the sync replica has every committed write. Promote it; you lose nothing committed." },
            { label: "Up to ~30 seconds of data loss is normal.", correct: false, explanation: "That'd be the answer for an all-async setup. The sync replica's whole job is to make data loss zero on leader failure." },
            { label: "All committed transactions in the past hour are at risk.", correct: false, explanation: "Sync replication's guarantee is exactly that committed = on at least one other DC. Hour-of-data-loss would be a backup-restore scenario, not a failover." },
            { label: "Whatever the async replicas missed is gone.", correct: false, explanation: "The async replicas' lag is irrelevant for durability — the sync replica is the durability backstop. Async replicas catch up from whoever ends up as the new leader." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Failover — when the leader dies</h3>
        <p>
          A leader-follower setup needs a way to promote a follower when the leader dies. This is harder than it sounds:
        </p>
        <ul>
          <li><strong>Detecting death.</strong> Is the leader actually dead, or is the network just flaky? Promote too eagerly and you have two leaders (split brain). Promote too slowly and you&apos;re down longer than you need to be.</li>
          <li><strong>Picking the new leader.</strong> The follower with the most replicated WAL wins. Async followers may be behind, so the choice matters.</li>
          <li><strong>Reconfiguring everyone.</strong> The other followers now stream from the new leader. Old leader, if it comes back, becomes a follower (or gets fenced).</li>
        </ul>
        <p>
          Tools like Patroni (Postgres) or Orchestrator (MySQL) automate this. AWS RDS Multi-AZ does it for you.
          Doing it manually is how 4-hour outages happen.
        </p>

        <Callout variant="warn" title="Split brain is a real failure mode">
          <p className="m-0">
            If the network partitions and both halves think they&apos;re leader, both halves accept writes. When the
            partition heals, you have two divergent histories and a conflict-resolution nightmare. The fix is fencing —
            the old leader is forcibly demoted (kill the process, reboot the machine, revoke its credentials) before the
            new leader is allowed to accept writes. <strong>You always need a single source of truth about who&apos;s leader.</strong>
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Routing reads to replicas</h3>
        <p>
          With one leader and several followers, reads should go to the followers. Spring makes this clean with
          <code>AbstractRoutingDataSource</code>:
        </p>

        <CodeBlock lang="java" caption="Routing reads to a replica via Spring">{`public class ReplicaRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        // ReadOnlyContext is set by an aspect on @Transactional(readOnly=true) methods
        return ReadOnlyContext.isReadOnly() ? "replica" : "primary";
    }
}

@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource(@Qualifier("primary") DataSource primary,
                                 @Qualifier("replica") DataSource replica) {
        ReplicaRoutingDataSource ds = new ReplicaRoutingDataSource();
        ds.setTargetDataSources(Map.of("primary", primary, "replica", replica));
        ds.setDefaultTargetDataSource(primary);
        return ds;
    }
}

@Service
public class OrderQueryService {
    @Transactional(readOnly = true)   // → routed to replica
    public List<Order> recentOrders(long userId) {
        return jdbc.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
                          new OrderRowMapper(), userId);
    }
}`}</CodeBlock>

        <Quiz
          kind="Gut check"
          question="A user creates an order, then immediately reloads the order history page. The reload returns an empty list. What's the most likely cause?"
          options={[
            { label: "The leader silently dropped the write.", correct: false, explanation: "Way more likely is replication lag than a silently dropped write. Always check the boring explanation first." },
            { label: "Replication lag — the create hit the leader, the read hit a follower that hadn't replicated yet.", correct: true, explanation: "Classic read-your-writes violation. The fix is either to route the post-write read to the leader, to use sticky sessions for a short window after a write, or to not split reads/writes inside a single user-visible transaction. We'll dig into this in Part 3." },
            { label: "The transaction wasn't committed.", correct: false, explanation: "If the create endpoint returned success but didn't commit, that's a transactional bug worth fixing — but the symptom (empty list afterward) is much more commonly replication lag." },
            { label: "Postgres serializable isolation rolled back the read.", correct: false, explanation: "Serialization conflicts produce errors, not empty lists. And read-only transactions don't get rolled back from serialization conflicts on their own." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Leader-follower is the default. Async replication is fast but loses data on failover; sync replication is durable but slower. Failover is harder than it looks."
          points={[
            { takeaway: "Sync = durable, async = fast. Most teams pick one sync + many async.", detail: "The sync replica is the durability backstop. Async replicas serve read traffic." },
            { takeaway: "Failover needs a coordinator and fencing.", detail: "Patroni, Orchestrator, or RDS Multi-AZ. Do it manually only if you enjoy 4-hour outages and split brain." },
            { takeaway: "Route reads to replicas via @Transactional(readOnly=true) + AbstractRoutingDataSource.", detail: "Cheap horizontal scaling for read-heavy workloads. Watch out for replication lag biting your read-your-writes UX." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="replication" id="quorums" title="Multi-leader & quorums" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 2 — Multi-leader &amp; leaderless quorums</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">Multi-leader: every region writes locally</h3>
        <p>
          One leader is a write bottleneck and a single point of failure for writes. Multi-leader (sometimes called
          active-active) gives you a leader in every region. Each leader accepts writes locally and asynchronously
          ships them to the others.
        </p>
        <p>
          The win: low write latency in every region. The cost: <strong>conflicts</strong>. If two regions write
          to the same row at the same time, you have two histories that disagree. You need a conflict resolution
          strategy, and none of them are great:
        </p>
        <ul>
          <li><strong>Last-write-wins (LWW):</strong> compare timestamps, keep the latest. Simple, lossy. The earlier write is silently dropped.</li>
          <li><strong>CRDTs:</strong> data types designed so concurrent writes merge mathematically (counters, sets). Beautiful, only works for the data types they exist for.</li>
          <li><strong>Application resolution:</strong> store both versions, let the user / application pick. Common in collaborative editing.</li>
        </ul>

        <Callout variant="info" title="Why most teams shouldn't use multi-leader">
          <p className="m-0">
            Multi-leader sounds attractive (write everywhere! no failover!) until you hit the first conflict. For most
            CRUD apps, the conflicts are unrecoverable — there&apos;s no &quot;right&quot; way to merge two
            simultaneous edits to a user&apos;s billing address. Use multi-leader when conflicts are rare and tolerable
            (geographic isolation, append-only data) or when you have a CRDT that fits your domain. Otherwise, stick
            with leader-follower.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Leaderless: Cassandra and Dynamo</h3>
        <p>
          No leader at all. Every node accepts writes. The client (or a coordinator on its behalf) sends each write
          to multiple nodes; same for reads. You configure how many nodes must respond before the operation is considered
          successful.
        </p>

        <Mermaid chart={quorumDiagram} />

        <h3 className="text-xl font-semibold mt-6 mb-3">The R + W &gt; N rule</h3>
        <p>
          With N replicas, write to W of them, read from R of them. If <strong>R + W &gt; N</strong>, every read overlaps
          with at least one node that saw the latest write. By comparing version numbers across the R responses, you can
          identify the most recent value.
        </p>
        <p>
          Worked example with N=3:
        </p>
        <ul>
          <li><strong>W=3, R=1.</strong> Every replica has every write. Reads are cheap. Writes fail if any replica is down.</li>
          <li><strong>W=2, R=2.</strong> The classic balanced quorum. Tolerates one node failure for both reads and writes. R + W = 4 &gt; 3 — overlap guaranteed.</li>
          <li><strong>W=1, R=3.</strong> Writes are fast. Reads have to talk to everyone and pick the winner. Tolerates write-node failures only if you allow lower W.</li>
          <li><strong>W=1, R=1.</strong> R + W = 2, not greater than 3. <em>Stale reads possible.</em> Available but eventually consistent.</li>
        </ul>

        <CodeBlock lang="plain" caption="Cassandra consistency levels (CQL)">{`-- Strong-ish: read repair across a quorum
CONSISTENCY QUORUM;
SELECT * FROM users WHERE user_id = 42;

-- Faster, weaker
CONSISTENCY ONE;
SELECT * FROM users WHERE user_id = 42;

-- LOCAL_QUORUM = quorum within the local DC; faster than full quorum
-- and the production default for multi-DC Cassandra
CONSISTENCY LOCAL_QUORUM;`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="A 5-node Cassandra cluster runs with N=3 (replication factor 3), W=QUORUM=2, R=QUORUM=2. Two of the three replicas for some key are down. What happens to writes?"
          options={[
            { label: "Writes succeed using hinted handoff to the survivor.", correct: false, explanation: "Hinted handoff stores writes destined for unreachable replicas, but it doesn't satisfy the W=2 requirement. The write fails with consistency error." },
            { label: "Writes fail — only one of three replicas is reachable, and W=2 isn't met.", correct: true, explanation: "Right. Quorum requires 2 of 3 to confirm. With only 1 alive, the write can't satisfy W=QUORUM and the client gets a consistency error. This is the durability/availability tradeoff in action." },
            { label: "Writes succeed because Cassandra automatically downgrades to W=1.", correct: false, explanation: "Cassandra does not silently downgrade consistency. The client gets an error and can choose to retry at a lower consistency if they want — but that's a deliberate choice, not automatic." },
            { label: "The cluster fails over to a different replication factor.", correct: false, explanation: "Replication factor is fixed at the keyspace level; it doesn't change in response to failures." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Sloppy quorums and hinted handoff</h3>
        <p>
          What if the &quot;real&quot; replicas for a key are unreachable but other nodes are healthy? A
          <em>sloppy quorum</em> writes to the next available nodes instead, with a hint saying &quot;hey, when the
          real owners come back, ship this to them.&quot; Hinted handoff is the mechanism that ships the data later.
        </p>
        <p>
          Sloppy quorums increase availability but break the R + W &gt; N guarantee — a read might miss writes that
          went to the sloppy nodes. Cassandra and Dynamo both ship with this on by default, so &quot;quorum&quot;
          in production is often fuzzier than the textbook.
        </p>

        <Quiz
          kind="Gut check"
          question="Which workload is leaderless replication a particularly good fit for?"
          options={[
            { label: "Banking ledger with strict balance-never-goes-negative invariants.", correct: false, explanation: "Hard pass. Banking needs serializable transactions and strong invariants. LWW and quorum reads can lose writes; you need linearizability + transactions, which is leader-based territory." },
            { label: "High-throughput time-series ingestion where writes are mostly independent and you want every region to write locally.", correct: true, explanation: "This is exactly the Cassandra/Dynamo sweet spot. Independent writes, no conflicts, geographic distribution, and the cluster keeps writing through node failures. The eventual consistency model is fine because each write doesn't need to see every other write." },
            { label: "Account profile updates where users edit their email and immediately reread.", correct: false, explanation: "Read-your-writes on a single key is exactly what eventual consistency violates. Possible to engineer around (read at QUORUM after writing at QUORUM), but a leader-based system handles this for free." },
            { label: "Inventory management where overselling is unacceptable.", correct: false, explanation: "Overselling protection requires strong consistency on the count — leaderless systems with LWW can't reliably enforce this." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Multi-leader gives you regional writes at the cost of conflicts. Leaderless (Cassandra/Dynamo) trades a leader for tunable quorums where R + W > N gives you read-your-writes."
          points={[
            { takeaway: "Multi-leader is conflict-resolution-flavored pain.", detail: "LWW silently drops writes; CRDTs only fit certain data types; application-level merge requires UX. Use only when you've thought hard about conflicts." },
            { takeaway: "R + W > N is the quorum rule.", detail: "Pick W and R to balance write cost, read cost, and failure tolerance. W=2, R=2, N=3 is the canonical balanced setup." },
            { takeaway: "Sloppy quorums + hinted handoff trade the R + W > N guarantee for availability.", detail: "Production Cassandra is more available than strict quorum reads; it's also occasionally less consistent than the math suggests." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="replication" id="lag" title="Replication lag in production" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 3 — Replication lag in production</h2>

        <p>
          Replication lag is the elapsed time between a write being committed on the leader and being visible on a
          follower. The number you should have in your head:
        </p>
        <ul>
          <li><strong>Healthy:</strong> 5–50ms within a region, 50–200ms across regions.</li>
          <li><strong>Warning:</strong> 1–5 seconds. Something is wrong but the system is still functional.</li>
          <li><strong>Crisis:</strong> tens of seconds to minutes. Long-running transaction on leader, network issue, follower CPU-bound during replay, vacuum lock contention.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">What causes lag spikes</h3>
        <ul>
          <li><strong>Big transactions on the leader.</strong> A 10M-row UPDATE blocks WAL streaming until commit, then replays as a single chunk on every follower.</li>
          <li><strong>Slow follower replay.</strong> Postgres single-threaded WAL replay is a real bottleneck. If the follower can&apos;t keep up with peak write rate, lag grows.</li>
          <li><strong>Network saturation.</strong> Cross-region replicas competing with backups or other traffic.</li>
          <li><strong>Long-running queries on the follower.</strong> If <code>hot_standby_feedback = on</code>, the follower tells the leader &quot;don&apos;t vacuum rows I&apos;m reading,&quot; which can cause bloat. If it&apos;s off, the long query gets canceled.</li>
        </ul>

        <Callout variant="warn" title="The classic outage shape">
          <p className="m-0">
            Someone runs <code>UPDATE orders SET status = &apos;migrated&apos; WHERE created_at &lt; &apos;2020-01-01&apos;</code> as
            a single transaction. 50M rows. The leader chugs through it in 4 minutes. The followers then replay it serially
            and lag goes to 4+ minutes. Anyone reading from a replica is now reading data from before the update started.
            Read-your-writes is hilariously broken across the whole product. Fix: chunk the update into 10k-row batches
            with commits between, or use <code>CREATE TABLE AS SELECT</code> + atomic swap.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Read-your-writes — three concrete strategies</h3>
        <p>
          The most-violated consistency property in real apps. Three patterns to fix it:
        </p>

        <p><strong>1. Route to leader for a short window after a write.</strong> Stash a timestamp in the user&apos;s session: &quot;wrote at 14:32:01.&quot; For the next 5 seconds, route their reads to the leader. After that, replicas are presumed caught up.</p>

        <CodeBlock lang="java" caption="Sticky-leader window after a write">{`@Service
public class OrderService {
    private static final Duration STICKY_WINDOW = Duration.ofSeconds(5);

    @Transactional   // writes → leader
    public Order create(CreateOrderRequest req) {
        Order o = orderRepo.save(new Order(req));
        // Mark this user's session as recently-wrote
        StickyLeaderContext.markWrite(req.userId(), Instant.now().plus(STICKY_WINDOW));
        return o;
    }
}

// In the routing data source:
@Override
protected Object determineCurrentLookupKey() {
    Long userId = SecurityContext.getUserId();
    if (userId != null && StickyLeaderContext.isStickyForUser(userId)) {
        return "primary";
    }
    return ReadOnlyContext.isReadOnly() ? "replica" : "primary";
}`}</CodeBlock>

        <p><strong>2. Read your own write from the leader, everything else from replicas.</strong> The post-write read is routed to the leader explicitly. Other reads (someone else&apos;s feed, a list view) hit replicas. Cleaner than session-scoped windows for some workloads.</p>

        <p><strong>3. Wait for replication.</strong> Some clients can return the WAL position of a write. The follower lets you ask &quot;have you replayed up to LSN X?&quot; and you wait until yes. Postgres exposes this as <code>pg_wal_lsn_diff</code>. More work, more correct.</p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Monotonic reads</h3>
        <p>
          A subtler property: a user shouldn&apos;t see time go backwards. You read a comment at 14:32:00 (replica A,
          which is current). You refresh at 14:32:01 and the comment is gone (replica B, which is 30 seconds behind).
          Spooky.
        </p>
        <p>
          The fix is to <strong>pin a session to a specific replica</strong>, or to a small set of replicas, for the
          duration of that session. Each individual replica advances forward in time; you never see one go backward
          relative to another.
        </p>

        <Quiz
          kind="Quick check"
          question="A user updates their profile picture and is then routed to a replica that's 200ms behind. The new picture doesn't show up. They refresh and now it does. What property was violated, and what's a clean fix?"
          options={[
            { label: "Linearizability — fix with sync replication.", correct: false, explanation: "Sync replication would help, but it's an expensive blanket solution. Read-your-writes is the property at issue, not full linearizability." },
            { label: "Read-your-writes — fix with a sticky-leader window or by routing the post-write read to the leader.", correct: true, explanation: "The user violated read-your-writes: their own write isn't visible to their own subsequent read. The targeted fix is to route this user's reads to the leader for a few seconds after a write, or to make the post-write GET hit the leader directly." },
            { label: "Monotonic reads — fix by pinning the session to one replica.", correct: false, explanation: "Monotonic reads is about not going backward in time across reads from the same user. This case is actually read-your-writes — the user's own write didn't show up. Different property." },
            { label: "Causal consistency — fix by upgrading to a CRDT.", correct: false, explanation: "Causal consistency is a related family but it's broader and more expensive. Read-your-writes is the specific property at play here." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Monitoring lag</h3>
        <p>
          You should always have a dashboard for replication lag, in seconds, with alerts. The Postgres query is:
        </p>

        <CodeBlock lang="plain" caption="Postgres replication lag in seconds">{`-- On the leader: how far behind is each replica?
SELECT
    application_name,
    state,
    pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS bytes_behind,
    EXTRACT(EPOCH FROM (now() - reply_time)) AS seconds_since_reply
FROM pg_stat_replication;

-- On the replica: how far behind am I?
SELECT
    EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;`}</CodeBlock>

        <Callout variant="spring" title="Spring Actuator + Micrometer + Prometheus">
          <p className="m-0">
            Expose <code>pg_last_xact_replay_timestamp()</code> as a custom Micrometer gauge from each replica.
            Alert when lag &gt; 5 seconds for &gt; 1 minute. Page on lag &gt; 30 seconds. The graph during a lag
            incident is unmistakable: a flat line at ~30ms, then a vertical climb to whatever number scares you.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="Which of these is the LEAST effective approach when replication lag is consistently spiking to 10+ seconds during peak hours?"
          options={[
            { label: "Increase the number of read replicas.", correct: true, explanation: "More replicas don't help lag — each replica replays the same WAL stream independently. If one is behind, adding more produces more replicas behind, not fewer. The bottleneck is single-threaded replay or write rate on the leader, not replica count." },
            { label: "Audit and chunk large transactions on the leader.", correct: false, explanation: "Big transactions are a top cause of replay-lag spikes. Chunking them into smaller batches lets WAL stream and replay continuously instead of in one huge block. Effective fix." },
            { label: "Move replicas to faster hardware (more CPU, faster disk).", correct: false, explanation: "Replica hardware can absolutely be the bottleneck — single-threaded WAL replay needs CPU, and disk write throughput needs to keep up with the leader's. Effective fix." },
            { label: "Move replicas closer to the leader (same AZ vs cross-region).", correct: false, explanation: "Cross-region network latency is a meaningful contributor to lag. Same-AZ replicas catch up faster. Effective for the network-bound case." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Lag is normal at 5–200ms; spikes are caused by big transactions, slow replay, or network saturation. Read-your-writes and monotonic reads are concrete patterns, not just textbook terms."
          points={[
            { takeaway: "Replication lag has knowable typical values and knowable failure modes.", detail: "5–50ms in-region; spikes from big transactions or slow replay. Always graph it." },
            { takeaway: "Read-your-writes has practical fixes.", detail: "Sticky-leader window, route post-write reads to leader, or wait-for-LSN. Pick one and implement it consistently." },
            { takeaway: "Monotonic reads = pin a session to a replica.", detail: "Otherwise users see time go backwards when they bounce between replicas at different lag." },
            { takeaway: "Adding replicas does not fix lag.", detail: "Each replica replays independently. If your leader writes faster than a single replica can replay, adding replicas adds more lagging replicas. Fix the leader workload or the replica hardware." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-3">What this didn&apos;t cover</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>Logical vs physical replication (Postgres logical replication for selective table sync, schema migrations).</li>
          <li>Raft and Paxos explicitly — the consensus algorithms behind systems that promise stronger guarantees (etcd, Spanner). They show up in the consistency module.</li>
          <li>Backup and PITR (point-in-time recovery) — different problem, related toolchain.</li>
          <li>Geo-replication patterns and conflict resolution at the application layer (Riak siblings, Yugabyte).</li>
        </ul>
      </section>

      <section className="my-12 text-center">
        <p className="text-sm text-slate-500 mb-2">Next up</p>
        <Link href="/courses/system-design/modules/caching-patterns" className="inline-block text-lg font-semibold text-cyan-600 hover:underline">
          Caching patterns: cache-aside, write-through, and the four ways to get invalidation wrong →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="replication" />
    </article>
  );
}
