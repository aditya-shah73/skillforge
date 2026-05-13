import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";

// Pure revision — no Checkpoints, no XP gates. Re-read on the train before
// a distributed systems interview, not a tutorial.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase5RevisionModule() {
  const mod = getModuleBySlug("phase-5-revision")!;

  // Raft state machine — Follower → Candidate → Leader with the failure
  // edges that show why split votes resolve and why a stale leader steps down.
  const raftChart = `
stateDiagram-v2
  [*] --> Follower
  Follower --> Candidate: election timeout fires
  Candidate --> Leader: wins majority of votes
  Candidate --> Follower: discovers higher term
  Candidate --> Candidate: split vote, retry with new term
  Leader --> Follower: discovers higher term
  Leader --> [*]: crash
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/system-design"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 5 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 5 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Consensus, sagas, clocks, geo-indexing, cost — the deep-systems reference card you can re-read in 20 minutes before an interview.
        </p>
        <ModuleProgress moduleSlug="phase-5-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This is not new material. It&apos;s a <strong>map of Phase 5</strong> — the deep distributed-systems primitives compressed into tables and cards. If something looks unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read before a senior systems interview, not as a tutorial.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The five modules you&apos;re consolidating: <Link href="/courses/system-design/modules/consensus" className="text-indigo-600 hover:underline">Consensus</Link>, <Link href="/courses/system-design/modules/distributed-transactions" className="text-indigo-600 hover:underline">Distributed transactions &amp; sagas</Link>, <Link href="/courses/system-design/modules/clock-time" className="text-indigo-600 hover:underline">Clocks &amp; time</Link>, <Link href="/courses/system-design/modules/geo-systems" className="text-indigo-600 hover:underline">Geospatial systems</Link>, and <Link href="/courses/system-design/modules/cost-capacity" className="text-indigo-600 hover:underline">Cost &amp; capacity planning</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Consensus */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Consensus — Raft in one card</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Raft has three sub-problems. Most interview answers fit on the back of an index card.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">1 · Leader election</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Followers run a randomized election timeout. When one fires, that node becomes a candidate, bumps the term, and asks for votes. Majority → leader. Split vote → new election.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Randomized timeouts (150–300ms) are the trick that prevents split-vote loops.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">2 · Log replication</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              All writes flow through the leader. The leader appends to its log, replicates to followers, and commits only when a <em>majority</em> has acknowledged. Followers apply in log order.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Reads can go to the leader for linearizability, or to followers for stale-but-fast.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">3 · Safety</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              A leader can only be elected if it has all committed entries (election restriction). Once a value is committed it&apos;s never overwritten. <strong>Safety holds under any network conditions; liveness needs partial synchrony.</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              FLP impossibility says you can&apos;t guarantee both. Raft picks safety.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Quorum math — the odd-number rule</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Cluster size N</th>
                <th className="px-4 py-3 font-semibold">Majority quorum</th>
                <th className="px-4 py-3 font-semibold">Failures tolerated F</th>
                <th className="px-4 py-3 font-semibold">When to pick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">3</td>
                <td className="px-4 py-3 font-mono">2</td>
                <td className="px-4 py-3 font-mono">1</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default. Cheap, survives one node failure or one AZ.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">5</td>
                <td className="px-4 py-3 font-mono">3</td>
                <td className="px-4 py-3 font-mono">2</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Production etcd/Consul. Survives concurrent failure during a rolling restart.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold">7</td>
                <td className="px-4 py-3 font-mono">4</td>
                <td className="px-4 py-3 font-mono">3</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Rare. Write latency suffers; only when you span many DCs.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-rose-600 font-semibold">4 / 6 (even)</td>
                <td className="px-4 py-3 font-mono">3 / 4</td>
                <td className="px-4 py-3 font-mono">1 / 2</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Never. Even sizes buy you nothing — same F as N-1, more write cost, split-vote risk.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Formula: <code>N = 2F + 1</code>. Pick N, get F = (N−1)/2 tolerated failures.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Use consensus FOR</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 m-0">
              <li>Cluster config / service discovery (etcd, Consul, ZooKeeper)</li>
              <li>Leader election for another system (Kafka KRaft controller, HDFS NameNode HA)</li>
              <li>Distributed locks / leases with strong correctness</li>
              <li>Metadata commits (schema, shard maps, feature flags)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Do NOT use consensus for</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 m-0">
              <li>The data plane (user requests, app writes — too slow, single-leader bottleneck)</li>
              <li>High-volume per-key state (use sharded primary/replica or a CRDT instead)</li>
              <li>Anything you can solve with idempotency + eventual consistency</li>
              <li>Anything you&apos;d rather an existing system (DB, queue) handle for you</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight">
          <strong>The senior-engineer move:</strong> consensus is a control-plane tool. If you find yourself reaching for Raft to coordinate every user write, you&apos;re on the wrong path — push the consensus into a small metadata layer (shard assignments, leader leases) and let the data plane be eventually consistent or sharded with single-writer per shard.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/consensus" className="text-indigo-600 hover:underline">Consensus &amp; Raft</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Distributed transactions & sagas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Distributed transactions &amp; sagas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          2PC is the textbook answer and the production wrong answer. Sagas are how real systems do it.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">2PC — why we avoid it</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 m-0">
              <li><strong>Blocking:</strong> a participant that voted YES is locked until the coordinator decides — could be forever if the coordinator crashes.</li>
              <li><strong>Coordinator SPOF:</strong> coordinator failure between phase 1 and 2 leaves participants in limbo.</li>
              <li><strong>Locks span network round-trips</strong> — kills throughput. Lock duration = max(participant latency).</li>
              <li><strong>Heterogeneous resource managers</strong> need XA support — most modern services don&apos;t.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-0">
              Acceptable inside a single DB cluster. Across services? Almost never.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Saga — what we actually do</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 m-0">
              <li><strong>A sequence of local transactions</strong>, each with a compensating action.</li>
              <li>If step k fails, run compensations for steps k−1, k−2, … 1 in reverse.</li>
              <li><strong>No global lock.</strong> Each local transaction commits independently.</li>
              <li><strong>You give up atomicity</strong> for availability — the system passes through inconsistent intermediate states.</li>
              <li>Pairs with the <strong>outbox pattern</strong> to emit events reliably from each local transaction.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-0">
              The compensation is part of the design, not an afterthought.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Orchestration vs choreography</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Dimension</th>
                <th className="px-4 py-3 font-semibold">Orchestration</th>
                <th className="px-4 py-3 font-semibold">Choreography</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Coordination</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Central orchestrator (state machine) calls services in order.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Services react to events from each other — no central brain.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Visibility</td>
                <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">Single place to see the saga&apos;s state. Easy to debug.</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">State scattered across services + event log. Hard to trace.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Coupling</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Orchestrator knows every service; services know orchestrator.</td>
                <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">Services only know event shapes. Loose coupling.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Complexity ceiling</td>
                <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">Scales to 10+ steps with branching, retries, timeouts.</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Past 3–4 services, the event web becomes hard to reason about.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">When to pick</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Complex workflows, regulatory traceability (payments, KYC).</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Small number of services, decoupling matters more than visibility.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">Outbox pattern — reliable event emission</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The classic bug: you commit a DB transaction, then publish an event to Kafka. The DB commit succeeds, the publish fails — and downstream services never hear about it. The fix:
        </p>
        <CodeBlock lang="plain">{`-- In one local transaction, write business data AND the outbox row
BEGIN;
  INSERT INTO orders (id, status, ...) VALUES (...);
  INSERT INTO outbox (event_type, payload, created_at)
    VALUES ('OrderCreated', '{"orderId": "..."}', NOW());
COMMIT;

-- A background relay reads outbox rows and publishes to Kafka.
-- If the publish fails, the relay retries — the outbox row is durable.
-- Once published, mark the row processed (or delete it).`}</CodeBlock>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-0">
          The outbox makes the saga&apos;s event emission as durable as the local transaction itself. Without it, every saga step has a window where it can lose events.
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Source: <Link href="/courses/system-design/modules/distributed-transactions" className="text-indigo-600 hover:underline">Distributed transactions &amp; sagas</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Raft state machine diagram */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. Raft state machine, visualized</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every node is in exactly one of three states. Every transition is driven by a timeout, a vote, or a term mismatch.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={raftChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li>
            <strong>Follower</strong> is the default. It accepts AppendEntries from the leader and resets its election timer on every valid heartbeat.
          </li>
          <li>
            <strong>Candidate</strong> happens when the election timer fires — &quot;I haven&apos;t heard from the leader, maybe it&apos;s gone.&quot; The candidate bumps the term, votes for itself, and requests votes from peers.
          </li>
          <li>
            <strong>Leader</strong> is whoever won majority votes in some term. Only one leader per term. Sends heartbeats; replicates the log; falls back to follower the moment it sees a higher term.
          </li>
          <li>
            <strong>Split vote</strong> resolves because election timeouts are randomized — one candidate&apos;s next timeout fires first, so it starts a new term and tries again before the others.
          </li>
        </ul>

        <Callout variant="warn">
          <strong>The term is the source of truth.</strong> If any RPC sees a term higher than its own, it steps down immediately. This is the entire safety mechanism for &quot;two leaders at once&quot; — the older one finds out and resigns the next time it talks to anyone.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Clocks & time */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Clocks &amp; time — the lies your wall clock tells</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Time in a distributed system is not a number. It&apos;s a model. Pick the right model for the question.
        </p>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-5 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Wall clocks lie</div>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 m-0">
            <li><strong>NTP skew:</strong> ~10–100ms across well-synced hosts; seconds across regions; minutes on a misconfigured box.</li>
            <li><strong>Leap seconds:</strong> wall clock can jump backwards. Linux can repeat a second. Both have broken production code.</li>
            <li><strong>VM pauses / GC stalls:</strong> the process can be frozen for hundreds of ms; the wall clock keeps ticking around it.</li>
            <li><strong>Clock drift</strong> on cheap hardware — a watch crystal can drift by seconds per day if NTP fails.</li>
          </ul>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 mb-0">
            Rule: never use a wall-clock timestamp as the source of truth for ordering, conflict resolution, or distributed correctness.
          </p>
        </div>

        <h3 className="text-base font-semibold mb-2">Clock model decision table</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">What it gives you</th>
                <th className="px-4 py-3 font-semibold">What it costs</th>
                <th className="px-4 py-3 font-semibold">Use for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Wall clock</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Human-readable timestamp</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Lies (skew, leap, pause)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Display, logs, TTLs, analytics — never ordering</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Lamport clock</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Causal order: if A → B, L(A) &lt; L(B)</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Can&apos;t detect concurrency (A,B unrelated still get ordered)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Total-order broadcast, simple ordering</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Vector clock</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Detect concurrency: if neither V(A) ≤ V(B) nor vice versa, they&apos;re concurrent</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">O(N) size — grows with nodes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Conflict detection (Dynamo, Riak)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">HLC (hybrid logical)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Causal order + close to wall-clock for humans</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bounded by clock skew; needs NTP</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Modern DBs (CockroachDB, YugabyteDB); practical default</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">TrueTime (Spanner)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bounded uncertainty interval [t−ε, t+ε]</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Requires GPS + atomic clocks in every DC</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">External consistency at global scale (Spanner)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Lamport vs vector in one sentence:</strong> Lamport tells you <em>if A came before B</em>; vector tells you <em>whether A and B are even related</em>. If you need to detect concurrent writes (for conflict resolution), Lamport is not enough.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/clock-time" className="text-indigo-600 hover:underline">Clocks &amp; time</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Geospatial */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Geospatial indexing — pick the right shape</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          &quot;Find nearby&quot; is a 2D problem; B-tree indexes are 1D. You need a spatial index.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Geohash</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Encode (lat, lng) as a string by recursively bisecting the world. <strong>Shared prefix ≈ nearby.</strong> 12-char hash ≈ centimeter precision.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4 m-0">
              <li>Pros: stores as a string, indexes in any DB, easy prefix queries.</li>
              <li>Cons: edge effect — nearby points across a cell boundary have very different prefixes.</li>
              <li>Use for: Redis geo, simple proximity, hashtag-style sharding.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Quadtree</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Recursive 4-way split of a 2D region, splitting only when a cell holds too many points. <strong>Density-balanced.</strong>
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4 m-0">
              <li>Pros: adapts to data density (Manhattan splits more than the Pacific).</li>
              <li>Cons: tree balance changes as data shifts; harder to shard.</li>
              <li>Use for: in-memory geo indexes (Uber dispatch, ride-sharing).</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">S2 cells (Google)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Hierarchical cells on a <em>sphere</em>, projected from a cube. Sphere-aware (no pole/equator distortion). Each cell has a 64-bit ID with a hierarchy you can truncate.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc pl-4 m-0">
              <li>Pros: accurate at global scale; great for distance/area math.</li>
              <li>Cons: heavier library; conceptual overhead.</li>
              <li>Use for: Google Maps, large-scale geo systems where Earth&apos;s curvature matters.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/40">
          <h3 className="text-base font-semibold mt-0 mb-2">k-Nearest Neighbors — two approaches</h3>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 m-0">
            <li>
              <strong>Geohash + 8-neighbor scan:</strong> compute the geohash cell of the query point, fetch points in that cell AND its 8 neighbors, then sort by exact distance. The neighbor scan is the part everyone forgets — without it, you miss points just across a cell boundary.
            </li>
            <li>
              <strong>Quadtree bucket scan:</strong> walk the tree to the leaf containing the query point, scan that bucket, expand to siblings until you have k candidates, then refine by exact distance.
            </li>
            <li>
              <strong>The trick both share:</strong> the index narrows the candidate set; exact distance is computed only on the candidates. Don&apos;t compute Haversine over every point in your database.
            </li>
          </ul>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/geo-systems" className="text-indigo-600 hover:underline">Geospatial systems</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Cost & capacity */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Cost &amp; capacity — $/QPS as the unit</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Senior engineers think in dollars per QPS, dollars per GB-month, dollars per million requests. Get fluent in the ratios.
        </p>

        <h3 className="text-base font-semibold mb-2">Storage tiers — pick the right one</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Latency</th>
                <th className="px-4 py-3 font-semibold">Relative cost / GB-mo</th>
                <th className="px-4 py-3 font-semibold">Use for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Hot (RAM / Redis)</td>
                <td className="px-4 py-3 font-mono">&lt; 1ms</td>
                <td className="px-4 py-3 text-rose-600 font-semibold">$$$$$</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cache, sessions, leaderboards</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Warm (SSD DB)</td>
                <td className="px-4 py-3 font-mono">1–10ms</td>
                <td className="px-4 py-3 text-amber-600 font-semibold">$$$</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Primary OLTP, working set</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Cold (Object store)</td>
                <td className="px-4 py-3 font-mono">10–100ms</td>
                <td className="px-4 py-3 text-emerald-600 font-semibold">$</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Backups, blobs, data lake, infrequent reads</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Archive (Glacier)</td>
                <td className="px-4 py-3 font-mono">minutes–hours</td>
                <td className="px-4 py-3 text-emerald-700 font-semibold">¢</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Compliance, &quot;just in case&quot;, legal hold</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">Scale up vs out vs cache</h3>
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Scale UP</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Bigger box. Simple, no code changes.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Pick first when: state is hard to shard (RDBMS primary), workload fits one machine. Ceiling: physical limit + sunk cost.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Scale OUT</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              More boxes, shard or replicate.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Pick when: stateless services, or state already shardable. Cost: coordination, hot-shard risk, cross-shard queries.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">CACHE</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Put the working set in RAM.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Pick when: read-heavy, working set fits in memory, staleness is tolerable. Cost: invalidation, thundering herd, two sources of truth.
            </p>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Pricing plans — when each one wins</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Discount vs on-demand</th>
                <th className="px-4 py-3 font-semibold">Commitment</th>
                <th className="px-4 py-3 font-semibold">Use for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">On-demand</td>
                <td className="px-4 py-3 font-mono">0%</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">None</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Spiky, unpredictable, dev/staging</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Reserved / Savings plan</td>
                <td className="px-4 py-3 font-mono text-emerald-600">30–70%</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">1–3 yr</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Steady baseline: prod &quot;always-on&quot; capacity</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Spot / preemptible</td>
                <td className="px-4 py-3 font-mono text-emerald-600">60–90%</td>
                <td className="px-4 py-3 text-rose-700 dark:text-rose-300">Can be killed any time</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Stateless batch, async workers, fault-tolerant jobs</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>The portfolio approach:</strong> reserve enough capacity to cover your P50 traffic (steady baseline) → fill peaks with on-demand → run batch/async workloads on spot. A mature shop blends all three and tracks blended $/QPS as a KPI.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          <strong>Overprovision discipline:</strong> target P99 latency under SLO with headroom (typically 30–50%) for traffic spikes, deploys, and AZ failures. Running &quot;hot&quot; (90%+ utilization) saves money until the first incident, then costs you ten times what you saved.
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/cost-capacity" className="text-indigo-600 hover:underline">Cost &amp; capacity planning</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Common gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Common gotchas — BAD vs GOOD</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has bitten real teams. If you only remember five things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Using consensus for the data plane</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Routing every user write through Raft because &quot;we need strong consistency&quot; gives you a single-leader bottleneck and write latency = network RTT to majority. Push consensus into a tiny metadata layer; let the data plane scale independently.
            </p>
            <CodeBlock lang="plain">{`# BAD — every order goes through a Raft cluster
client -> raft-leader -> replicate to followers -> commit -> ack
                          (write QPS capped at single-leader throughput)

# GOOD — Raft holds only the shard map; data plane is sharded primaries
client -> router (reads shard map from etcd/Raft, ~0 QPS on Raft)
       -> shard-N primary (scales horizontally)`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Saga without compensations</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              You wrote the happy path and called it a saga. When step 3 fails, steps 1 and 2 are left committed and nobody undoes them. That&apos;s not a saga — that&apos;s a bug.
            </p>
            <CodeBlock lang="plain">{`# BAD — no compensation. Step 3 fails → inventory reserved, payment charged, no order.
reserveInventory(orderId)
chargePayment(orderId, amount)
createOrder(orderId)   <-- fails. Nothing cleans up.

# GOOD — every step has a defined compensation, run in reverse on failure.
try:
  reserveInventory(orderId)         -> compensate: releaseInventory
  chargePayment(orderId, amount)    -> compensate: refundPayment
  createOrder(orderId)              -> compensate: cancelOrder
catch step k failure:
  run compensations for steps k-1 ... 1`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Ordering events by wall clock</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Two services write events tagged with <code>System.currentTimeMillis()</code>. Their clocks differ by 200ms. Now causally-later events sort earlier in your event log, and your conflict resolution picks the wrong winner.
            </p>
            <CodeBlock lang="java">{`// BAD — wall clock as ordering key
event.timestamp = System.currentTimeMillis();
saveEvent(event);
// Two events from different hosts can sort in causality-violating order.

// GOOD — Lamport or HLC for ordering; wall clock only for display
event.lamport = ++localLamport;          // or hlc.now() for HLC
event.displayTime = System.currentTimeMillis();   // for humans only
saveEvent(event);
// Sort by lamport for ordering; show displayTime in the UI.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Geohash without the neighbor scan</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              You query for geohash prefix <code>dr5ru</code> and miss the restaurant that&apos;s 50m away because its geohash starts with <code>dr5rv</code>. The neighbor scan exists for exactly this reason.
            </p>
            <CodeBlock lang="plain">{`# BAD — single-cell scan misses near-edge points
hash = geohash(lat, lng, precision=6)
candidates = db.scan(prefix=hash)        # misses points across cell boundary

# GOOD — scan the cell AND its 8 neighbors, then refine by distance
hash = geohash(lat, lng, precision=6)
cells = [hash] + neighbors8(hash)        # 9 cells total
candidates = db.scan(prefix in cells)
results = sortByHaversine(candidates, query)[:k]`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 5 · Autoscaling on CPU instead of queue depth</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              For an async worker reading from a queue, CPU is a lagging indicator — by the time it spikes you&apos;re already minutes behind. Scale on queue depth (or message age) so capacity grows <em>before</em> the backlog hurts.
            </p>
            <CodeBlock lang="plain">{`# BAD — CPU-based autoscale on a queue worker
metric: cpu_utilization > 70%
# Backlog grows for 5 minutes before CPU rises enough to trigger.

# GOOD — scale on backlog / message age
metric: sqs_approximate_age_of_oldest_message > 30s
   or: kafka_consumer_lag > 10000
# Workers scale up the moment the queue starts to back up.`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment (quizzes outside any Checkpoint) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="Your team wants strong consistency for which keys live on which shards. The data plane (the actual user records) is sharded across 100 nodes. Where should consensus live?"
          options={[
            { label: "Run every user write through a Raft cluster of 5 nodes.", explanation: "That makes a single-leader Raft cluster the throughput ceiling for your entire system. Consensus latency = RTT to majority — fine for metadata, ruinous for every user write." },
            { label: "Put the shard map in a small Raft-backed store (etcd/Consul); each shard runs an independent primary for its data.", correct: true, explanation: "Right. Consensus belongs in the control plane (shard maps, leader leases, schema). The data plane scales horizontally by sharding, with a single writer per shard. Classic etcd / Consul / KRaft pattern." },
            { label: "Skip consensus — use timestamps for everything.", explanation: "Timestamps don't give you correctness for the shard map. You need agreement on which shard owns which keys, especially during rebalancing." },
            { label: "Use 2PC across all 100 shards for every write.", explanation: "Worse than Raft on every write. 2PC blocks on the slowest participant, has a coordinator SPOF, and doesn't scale to 100 participants." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're designing a workflow: reserve inventory, charge card, create order, send email. Network failures can happen at any step. Sagas or 2PC?"
          options={[
            { label: "2PC — atomicity is what we want.", explanation: "2PC needs every step to support a prepare/commit protocol (XA). Payment gateways and email providers don't. And 2PC's blocking semantics under coordinator failure is unacceptable for a customer-facing flow." },
            { label: "Saga with compensations: releaseInventory, refundPayment, cancelOrder, sendCancellationEmail.", correct: true, explanation: "Right. Sagas are the practical pattern for multi-service workflows. Each step is a local transaction; failure of any step triggers compensating actions for the prior steps. Pair with the outbox pattern so step events are durable." },
            { label: "Just retry until it succeeds.", explanation: "Retries don't help when a downstream is permanently rejecting (card declined, sold out). You need explicit failure handling, which is what the saga's compensations give you." },
            { label: "Run all four steps in one DB transaction.", explanation: "They span different services — payment gateway, inventory service, order DB, email provider. There is no single transaction that covers all of them." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You need to detect concurrent writes from two replicas so you can resolve a conflict. Which clock model?"
          options={[
            { label: "Wall clock — whichever has the larger timestamp wins.", explanation: "Clock skew can make a causally-later write look earlier. You'll silently lose data. Never resolve conflicts on wall clocks." },
            { label: "Lamport clock — gives a total order.", explanation: "Lamport gives total order but cannot tell concurrent writes apart from sequential ones. If L(A) < L(B), you can't tell if A happened-before B or they were concurrent." },
            { label: "Vector clock — if neither V(A) ≤ V(B) nor V(B) ≤ V(A), the writes were concurrent.", correct: true, explanation: "Right. Vector clocks are the canonical answer for detecting concurrency. Dynamo and Riak use them for exactly this conflict-detection job. The cost is O(N) size, which is why HLC is preferred when you only need ordering, not concurrency detection." },
            { label: "TrueTime — bounded uncertainty.", explanation: "TrueTime gives bounded global ordering (great for external consistency) but it requires GPS + atomic clocks. Vector clocks solve the concurrency-detection problem without that hardware." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A ride-sharing app needs to find the 10 nearest drivers to a rider, anywhere in the world, with sub-100ms latency. Which spatial index is the best fit for the dispatch service's in-memory data structure?"
          options={[
            { label: "B-tree on latitude.", explanation: "A 1D index can't do 2D nearest-neighbor efficiently. You'd have to scan a wide latitude band and filter by longitude — that's a linear scan in disguise." },
            { label: "Geohash stored as a string in a SQL B-tree.", explanation: "Geohash works for prefix queries but has the edge-effect problem and is awkward in memory for a hot dispatch path. Fine for a Redis or DB-backed proximity feature, not great for a service that needs μs-level lookups." },
            { label: "Quadtree, recursively split by density.", correct: true, explanation: "Right. Quadtrees adapt to driver density — Manhattan splits more than the ocean. In-memory traversal to find candidates near a query point is fast. Uber's dispatch system uses this shape. For a Redis or DB-backed feature, geohash with the 8-neighbor scan is a fine alternative." },
            { label: "Hash table keyed on driver ID.", explanation: "Great for 'where is driver X' but useless for 'who is near point P'. Hash tables don't preserve any spatial structure." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You have a queue-backed async worker. Traffic is bursty: 100 RPS most of the time, 10,000 RPS during spikes. What's the right autoscaling and capacity plan?"
          options={[
            { label: "Autoscale on CPU > 70%, all on-demand instances.", explanation: "CPU is a lagging indicator on a queue worker — by the time CPU rises, your backlog is already minutes deep. Pure on-demand also leaves savings on the table for the steady baseline." },
            { label: "Autoscale on queue depth / message age; reserved capacity for baseline, spot for spikes.", correct: true, explanation: "Right. Queue depth (or message age) is the leading indicator — capacity scales before the backlog hurts. Reserved covers the baseline at a deep discount; spot fills the spikes cheaply since async workers tolerate preemption. The portfolio approach to pricing." },
            { label: "Pre-provision for the 10,000 RPS peak with reserved capacity.", explanation: "Massive overspend during the 99% of the time you're at 100 RPS. Reserved makes sense for the baseline, not for the peak." },
            { label: "Skip autoscaling; let the queue back up and customers wait.", explanation: "Cheap, but customer-visible. For an async pipeline where SLA covers age-of-oldest-message, you need to scale before that SLA breaks." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — "You're ready for Phase 6 when..." */}
      {/* ============================================================ */}
      <Callout variant="spring" title="You're ready for Phase 6 when…">
        <ul className="m-0 space-y-1 list-disc pl-5">
          <li>You can explain Raft on a whiteboard in 5 minutes — three sub-problems, quorum math, when it&apos;s the wrong tool.</li>
          <li>You can pick saga vs 2PC without thinking, and you instinctively reach for the outbox pattern to emit events.</li>
          <li>You never propose a design that orders events by wall-clock timestamp. You know when Lamport is enough and when you need vector clocks.</li>
          <li>You can describe geohash, quadtree, and S2 in one sentence each and pick the right one for a proximity feature.</li>
          <li>You think in $/QPS, blend reserved + on-demand + spot, and autoscale on the leading indicator, not CPU.</li>
        </ul>
      </Callout>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900 bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 dark:from-fuchsia-950/30 dark:via-slate-900 dark:to-pink-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300 mb-2">
          Phase 5 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now reason about the deep distributed-systems primitives</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Consensus and its limits, sagas and the outbox, the clock models and when each one matters, spatial indexing, and the cost/capacity portfolio. That&apos;s the senior-systems toolkit. Every case study from here lands on combinations of these primitives.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 6 — Case Studies.</strong> Start with the interview framework that puts everything you&apos;ve learned into a 45-minute structure: requirements → estimation → API → data model → high-level design → deep dives → trade-offs.
        </p>
        <Link
          href="/courses/system-design/modules/interview-framework"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Case Studies →
        </Link>
      </section>
    </article>
  );
}
