import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this card before a system-design interview, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase1RevisionModule() {
  const mod = getModuleBySlug("phase-1-revision")!;

  // The scaling ladder as a single picture. The decision is always "what's the
  // cheapest next rung that fixes the bottleneck I just measured?" — not
  // "what's the fanciest architecture I can adopt?"
  const ladderChart = `
flowchart LR
    R1["1. Vertical<br/>(bigger box)"] --> R2["2. Horizontal<br/>(LB + N boxes)"]
    R2 --> R3["3. Stateless<br/>(session → Redis/JWT)"]
    R3 --> R4["4. Cache<br/>(hot reads off DB)"]
    R4 --> R5["5. Shard DB<br/>(writes scale out)"]
    R5 --> R6["6. Async<br/>(queue + workers)"]
    style R1 fill:#10b981,color:#fff,stroke:#059669
    style R2 fill:#10b981,color:#fff,stroke:#059669
    style R3 fill:#22c55e,color:#fff,stroke:#15803d
    style R4 fill:#f59e0b,color:#fff,stroke:#d97706
    style R5 fill:#fb923c,color:#fff,stroke:#ea580c
    style R6 fill:#ef4444,color:#fff,stroke:#dc2626
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 1 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 1 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Estimation numbers, scaling ladder, CAP/PACELC, consistency models — every foundation from Phase 1 compressed to a reference card you re-read in 15 minutes before a system-design interview.
        </p>
        <ModuleProgress moduleSlug="phase-1-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 1</strong> — every number, every rung, every trade-off from the four previous modules, compressed into tables and decision cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read on the train before an interview, not as a tutorial.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The four modules you&apos;re consolidating: <Link href="/courses/system-design/modules/back-of-envelope" className="text-cyan-600 hover:underline">Back-of-envelope estimation</Link>, <Link href="/courses/system-design/modules/scaling-ladder" className="text-cyan-600 hover:underline">The scaling ladder</Link>, <Link href="/courses/system-design/modules/cap-pacelc" className="text-cyan-600 hover:underline">CAP &amp; PACELC</Link>, and <Link href="/courses/system-design/modules/consistency-models" className="text-cyan-600 hover:underline">Consistency models</Link>.
        </p>

        <Callout variant="info" title="What this card covers">
          <p className="m-0 text-sm">Latency numbers + QPS/storage math · the six-rung scaling ladder · CAP corrected and PACELC&apos;s extra dimension · the consistency hierarchy and the four session guarantees · the gotchas that bite in real designs. No worked examples, no projects — just the reference rows you point at on a whiteboard.</p>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Latency + capacity math cheat-sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Latency numbers + capacity math</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The unit system every design discussion uses. Memorize the order of magnitude, not the exact digits.
        </p>

        <h3 className="text-base font-semibold mb-2">Latency table — five tiers, four orders of magnitude</h3>
        <CodeBlock lang="plain" caption="The numbers you cite from memory in the first 30 seconds of any design">{`OP                                   LATENCY     TIER     MENTAL ANCHOR
L1 cache reference                   ~1 ns       ns       Clock tick on a 1GHz CPU
Branch mispredict                    ~3 ns       ns       Cost of guessing wrong at an if
L2 cache reference                   ~4 ns       ns       Still on the CPU die
Mutex lock/unlock (uncontended)      ~25 ns      ns       Contended is much worse
Main memory (RAM)                    ~100 ns     ns       ~100x slower than L1
Compress 1KB (Snappy)                ~2 µs       µs       Compression is ~free at small sizes
Send 1KB over 1 Gbps                 ~10 µs      µs       Pure transmission, ignores propagation
SSD random read                      ~100 µs     µs       ~1000x slower than RAM — why we cache
Read 1MB sequentially from RAM       ~250 µs     µs       Sequential scans are cheap
Round trip within datacenter         ~500 µs     µs       One hop within a region
Read 1MB sequentially from SSD       ~1 ms       ms       Fast streaming, slow random
HDD seek                             ~10 ms      ms       Why nobody runs OLTP on spinning disk
Cross-region (US East ↔ US West)     ~70 ms      slow     ~4ms per 1000km × round trip + switching
Cross-continent (US ↔ EU)            ~150 ms     slow     Half a second for a few round trips`}</CodeBlock>

        <Callout variant="insight" title="The three jumps that matter">
          <p className="m-0">99% of design discussions are really about one of three jumps: <strong>RAM → SSD (~1000x), SSD → network (~5x), within-region → cross-region (~100x).</strong> Every &quot;add a cache&quot; argument is about avoiding the first jump. Every &quot;why is this slow&quot; conversation is about which jump just happened. Memorize those three multipliers and you can reason about feasibility in 10 seconds.</p>
        </Callout>

        <h3 className="text-base font-semibold mt-6 mb-2">Capacity math — the four conversions</h3>
        <CodeBlock lang="plain" caption="Every back-of-envelope is one of these four lines">{`# 1. QPS from users
average_QPS  = (DAU × actions_per_user_per_day) / 86_400
peak_QPS     = average_QPS × peak_factor    # 2–3x consumer, 5–10x B2B

# 2. Storage growth
storage_per_year = DAU × items_per_day × bytes_per_item × replication × 365

# 3. Bandwidth
bandwidth = peak_QPS × bytes_per_response   # both directions

# 4. Memory (cache working set)
hot_set = fraction_hot × total_rows × bytes_per_row`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">The shortcut every senior knows</h3>
        <CodeBlock lang="plain" caption="DAU → QPS without long division">{`1M  DAU × 1 action/day   ≈ 12     QPS    (avg)
100M DAU × 1 action/day  ≈ 1,200  QPS    (avg)
1B  DAU × 1 action/day   ≈ 12,000 QPS    (avg)

# One-liner: DAU in millions × actions/day ≈ avg QPS in dozens.
# Then peak = 2–3× for consumer, 5–10× for B2B.`}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-2">Per-server rules of thumb</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Axis</th>
                <th className="px-4 py-3 font-semibold">Per-box ceiling</th>
                <th className="px-4 py-3 font-semibold">What it tells you</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Stateless QPS</td>
                <td className="px-4 py-3 font-mono">10–50k (simple) / 1–5k (heavy)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Heavy = several DB calls + computation per request</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Postgres writes</td>
                <td className="px-4 py-3 font-mono">5–30k writes/sec</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">If you&apos;re under this, you may not need to shard yet</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">NIC bandwidth</td>
                <td className="px-4 py-3 font-mono">1 Gbps ≈ 125 MB/s</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Big payloads × moderate QPS saturates fast — invisible until it isn&apos;t</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">WebSocket conns</td>
                <td className="px-4 py-3 font-mono">100k easy / 500k tuned / 1M heroic</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">The 64k &quot;port limit&quot; is a myth for inbound listeners</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">HikariCP pool</td>
                <td className="px-4 py-3 font-mono">(cores × 2) + spindles ≈ 10</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">50 app instances × 10 = 500 conns to PG — needs pgBouncer</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/back-of-envelope" className="text-cyan-600 hover:underline">Module 1 — Back-of-envelope estimation</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — The scaling ladder */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. The scaling ladder — six rungs, in order</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          When traffic grows, you walk these rungs roughly in order. Skipping rungs is how systems get over-engineered.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Rung</th>
                <th className="px-4 py-3 font-semibold">Trigger</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Next bottleneck it exposes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">1</td>
                <td className="px-4 py-3 font-semibold">Vertical (bigger box)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">CPU / RAM near ceiling on single instance</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cheap. Change one config value. SPOF risk.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Eventually hits cost curve / instance ceiling</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">2</td>
                <td className="px-4 py-3 font-semibold">Horizontal + LB</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Vertical exhausted OR need redundancy for HA</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Adds one box. Introduces &quot;where does session live?&quot;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Stateful boxes can&apos;t round-robin cleanly</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">3</td>
                <td className="px-4 py-3 font-semibold">Stateless app tier</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sticky-session bug or deploy pain</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Session → Redis/JWT. Cheap if you do it early.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Reads now hammer the DB</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">4</td>
                <td className="px-4 py-3 font-semibold">Cache hot reads</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">DB CPU pegged on read traffic, working set fits in RAM</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Caffeine local + Redis distributed. Invalidation is hard.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Writes still go to one DB</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-orange-600">5</td>
                <td className="px-4 py-3 font-semibold">Shard the database</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Write QPS &gt; single-instance ceiling, or data &gt; one disk</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">High. Cross-shard joins die. Resharding is painful.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Synchronous request/response saturates</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">6</td>
                <td className="px-4 py-3 font-semibold">Async (queue + workers)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Long-running work blocks request thread / spike absorption needed</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">High. Kafka/SQS operational burden + at-least-once thinking.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Most systems never get here. That&apos;s OK.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="The senior reflex">
          <p className="m-0">When someone says &quot;let&apos;s add Kafka,&quot; ask: <em>which rung is that, and have we exhausted the cheaper rungs?</em> Most slow services I&apos;ve been paged for were one bad query, one undersized pool, or one missing index. The ladder starts at the bottom for a reason. <strong>If your service is at 30% CPU and someone wants to add a queue, the answer is no.</strong></p>
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/scaling-ladder" className="text-cyan-600 hover:underline">Module 2 — The scaling ladder</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Mermaid diagram of the ladder */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The ladder, in one picture</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Green rungs are cheap and reversible. Amber/red rungs are where architecture starts to lock in.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={ladderChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li><strong>Rungs 1–3 are reversible.</strong> Bigger box, more boxes, externalize session — all undo cleanly. Do them aggressively.</li>
          <li><strong>Rung 4 (cache) is the first one-way door.</strong> Once your reads depend on cache hit rate, your invalidation strategy becomes part of your contract. Pick cache-aside until you have a reason not to.</li>
          <li><strong>Rung 5 (sharding) reshapes your schema.</strong> Joins across shards either die or get pushed to the app layer. Resharding is one of the hardest operations in distributed systems.</li>
          <li><strong>Rung 6 (async) reshapes the user contract.</strong> Your API stops being &quot;the work is done&quot; and starts being &quot;the work is queued.&quot; That&apos;s a UX change and an at-least-once delivery problem.</li>
        </ul>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — CAP / PACELC */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. CAP &amp; PACELC — corrected</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The bumper sticker is wrong. The real claim is narrower and more useful.
        </p>

        <Callout variant="insight" title="The corrected one-liner">
          <p className="m-0"><strong>CAP:</strong> during a network partition, a distributed system must give up either linearizability (C) or per-request availability (A). Partition tolerance isn&apos;t a choice — networks fail. <strong>PACELC:</strong> and when there&apos;s no partition, you still have to choose between latency (L) and consistency (C). The &quot;else&quot; clause is where 99% of real design lives, because partitions are rare.</p>
        </Callout>

        <h3 className="text-base font-semibold mt-6 mb-2">Where the popular datastores sit</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Datastore</th>
                <th className="px-4 py-3 font-semibold">PACELC slot</th>
                <th className="px-4 py-3 font-semibold">Under partition</th>
                <th className="px-4 py-3 font-semibold">No partition (latency vs consistency)</th>
                <th className="px-4 py-3 font-semibold">Tunable?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Cassandra (default)</td>
                <td className="px-4 py-3 font-mono text-rose-600">PA / EL</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Stays up, accepts divergent writes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fast: write returns when one replica accepts</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes — quorum R+W &gt; N approximates PC/EC</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">DynamoDB</td>
                <td className="px-4 py-3 font-mono text-rose-600">PA / EL (default)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Stays up, eventual reads</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fast eventual; strong reads at 2× read units</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Per-request — flip to strong reads on demand</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">MongoDB (majority/majority)</td>
                <td className="px-4 py-3 font-mono text-amber-600">PA / EC</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Majority side stays up</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Reads see committed data</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes — per write/read concern</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Postgres (single primary, async replicas)</td>
                <td className="px-4 py-3 font-mono text-rose-600">PA / EL-leaning</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Primary keeps going; replicas may lag</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Async replication — reads from replica can be stale</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Yes — sync replication moves toward PC/EC</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Spanner / CockroachDB</td>
                <td className="px-4 py-3 font-mono text-indigo-600">PC / EC</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Minority side refuses writes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cross-region quorum on every write (≥ tens of ms)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No — design center is strong</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">etcd / ZooKeeper / Consul</td>
                <td className="px-4 py-3 font-mono text-indigo-600">PC / EC</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Minority refuses; quorum required</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Raft/Paxos — every write through consensus</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No — coordination demands linearizability</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Redis (single node)</td>
                <td className="px-4 py-3 font-mono text-slate-500">N/A — not distributed</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Nothing to partition</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Strongly consistent (one node, one copy)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cluster mode pushes toward AP</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="The three questions that place any datastore">
          <p className="m-0">Don&apos;t ask &quot;CP or AP?&quot; — ask three concrete questions: <strong>(1)</strong> What happens to a write during a partition? <strong>(2)</strong> What happens to a read during a partition? <strong>(3)</strong> In normal operation, does a write wait for replicas? Three answers and you&apos;ve placed the system on the matrix.</p>
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/cap-pacelc" className="text-cyan-600 hover:underline">Module 3 — CAP &amp; PACELC</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Consistency models */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Consistency models — pick the weakest that&apos;s safe</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The hierarchy from strongest to weakest. Each model lets through specific bugs the stronger ones forbid.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Guarantee</th>
                <th className="px-4 py-3 font-semibold">Bug it prevents</th>
                <th className="px-4 py-3 font-semibold">Pick it for…</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-indigo-600">Linearizable</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every read sees the latest write across all replicas; total order matches real time</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Stale reads, ordering anomalies, double-spend</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bank ledger, inventory, leader election, unique-username check</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-indigo-500">Sequential</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Total order across all processes, but not tied to wall clock</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Processes disagreeing on operation order</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Rarely an explicit goal — usually a byproduct of consensus internals</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-600">Causal</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">If B&apos;s process saw A first, every observer sees A before B; unrelated ops can reorder</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Reply before original&quot;, edits visible before the post</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Comment threads, collaborative docs, chat</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-600">Read-your-writes (session)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">If <em>you</em> wrote it, your next read sees it</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;I just updated my name and it shows the old one&quot;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Profile updates, settings pages, anything user-edited</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-500">Monotonic reads (session)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Successive reads in a session never go backward in time</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;The message disappeared and came back&quot;</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Feeds, timelines, anything paginated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-rose-600">Eventual</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">If writes stop, replicas converge. No ordering guarantee in between.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">(Prevents almost nothing — it&apos;s the floor)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Like counters, view counts, leaderboards with staleness tolerance</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="The hierarchy is a containment tree">
          <p className="m-0">Linearizable ⊃ sequential ⊃ causal ⊃ eventual. If a system gives you linearizable, you also get every weaker guarantee for free. If it only gives you eventual, you have to layer the stronger ones (read-your-writes via leader pinning, monotonic reads via session stickiness) at the application level.</p>
        </Callout>

        <h3 className="text-base font-semibold mt-6 mb-2">The four session guarantees (Bayou, 1995)</h3>
        <CodeBlock lang="plain" caption="Cheaper than linearizability, catches the common UX bugs">{`1. Read-your-writes      — if YOU wrote it, YOUR next read sees it
2. Monotonic reads       — within a session, time only moves forward
3. Monotonic writes      — your writes apply in the order you issued
4. Writes-follow-reads   — a write you make is ordered after what you just read`}</CodeBlock>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/consistency-models" className="text-cyan-600 hover:underline">Module 4 — Consistency models</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Consistency decision card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Picking a model per call site</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Consistency is rarely a database-wide decision in 2026. It&apos;s a per-endpoint decision. The senior move is naming the model your call site needs and then verifying your stack delivers it.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Pick linearizable</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">When the invariant is unrecoverable if violated — money, inventory, uniqueness, locks.</p>
            <code className="text-xs text-slate-700 dark:text-slate-300">bank balance · flash-sale stock · unique username · leader election</code>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Pick causal</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">When order between related events is visible to users, but unrelated events can be parallel.</p>
            <code className="text-xs text-slate-700 dark:text-slate-300">comment threads · chat · collaborative editing</code>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Pick read-your-writes</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">When users edit and then immediately read their own content.</p>
            <code className="text-xs text-slate-700 dark:text-slate-300">profile pages · settings · drafts · own-content views</code>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">Pick monotonic reads</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">When users page through a feed or watch a timeline grow.</p>
            <code className="text-xs text-slate-700 dark:text-slate-300">infinite-scroll feeds · timelines · pagination</code>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 sm:col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Eventual is fine</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">When staleness is invisible to users for tens of seconds and the cost of stronger guarantees is real (cross-region writes, refused requests during partitions).</p>
            <code className="text-xs text-slate-700 dark:text-slate-300">like counters · view counts · driver-location streams · trending-now lists</code>
          </div>
        </div>

        <Callout variant="warn" title="The silent failure">
          <p className="m-0">When you pick AP/eventual for a workload that needed CP/linearizable, you don&apos;t find out at deploy time. You find out six months later when a duplicate row appears, a customer gets double-charged, or two users get the same username. <strong>Inconsistency bugs are silent until they aren&apos;t.</strong> Pick the weakest model that&apos;s safe — but be honest about &quot;safe.&quot;</p>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Gotchas (BAD/GOOD pairs) */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Four gotchas that bite in real designs</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The mistakes that show up in design reviews and post-mortems. If you only remember four things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Quoting average QPS as if it were peak</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              You divide DAU by 86,400 and call it done. Then production hits 9pm Eastern and your average becomes irrelevant. <strong>Always multiply by a peak factor.</strong>
            </p>
            <CodeBlock lang="plain">{`// BAD — provisioning for average means getting paged at peak
DAU = 100_000_000
actions_per_day = 10
avg_QPS = (100_000_000 × 10) / 86_400 ≈ 11_600
# capacity plan: 12k QPS → you fall over at 8pm

// GOOD — peak is what you provision
peak_factor = 2.5       // 2–3× for consumer, 5–10× for B2B
peak_QPS    = avg_QPS × peak_factor ≈ 29_000
# capacity plan: 30k QPS + room for known spikes (Black Friday, viral event)`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Forgetting bandwidth in the storage math</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              QPS and storage are obvious. Bandwidth is invisible until the NIC saturates. Big payloads × moderate QPS gets you there faster than you&apos;d think.
            </p>
            <CodeBlock lang="plain">{`// BAD — only checked QPS, missed the NIC
peak_QPS    = 200_000
response    = 500 bytes
# "200k QPS, no problem, we have a beefy box"

// GOOD — compute bandwidth too
bandwidth = 200_000 × 500 bytes = 100 MB/s ≈ 0.8 Gbps
# 1 Gbps NIC is at 80% — one cache box can't do this.
# Need ≥2 nodes just for bandwidth, plus more for HA.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · &quot;Eventually consistent&quot; treated as &quot;might be stale forever&quot;</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Eventual means convergence in the absence of new writes — typically milliseconds to seconds in healthy systems. It does NOT mean &quot;stale forever&quot; — but it also doesn&apos;t prevent specific UX bugs. The fix isn&apos;t to give up; it&apos;s to layer session guarantees on top.
            </p>
            <CodeBlock lang="java">{`// BAD — Cassandra default, user edits profile, refresh shows old name
@Transactional
public ProfileResponse updateName(Long userId, String newName) {
    userRepo.updateName(userId, newName);  // write to any replica
    return loadProfile(userId);            // read from any replica — may lag
}

// GOOD — read-your-writes layered on top: pin the post-write read to the
// primary (or carry the LSN forward) so the user always sees their own edit.
@Transactional
public ProfileResponse updateName(Long userId, String newName) {
    long lsn = userRepo.updateName(userId, newName);
    return loadProfile(userId, /* atLeastVersion */ lsn);
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Skipping rungs on the scaling ladder</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The team is at rung 1 (single box at 30% CPU) and someone proposes rung 6 (Kafka). Adding async complexity to a system that&apos;s bored is how technical debt is born.
            </p>
            <CodeBlock lang="plain">{`// BAD — symptom: latency spikes, p99 climbing
// proposed fix: "let's add Kafka and re-architect the write path"
// reality: CPU is 30%, DB is 20%, but HikariCP pool is sized at 10
//          and 200 threads are blocked waiting for connections.

// GOOD — diagnose first, then climb one rung at a time
1. Profile: where does latency come from? (APM, flame graph, pool metrics)
2. Rung 1: bump pool 10 → 30. Re-measure. Often the whole problem.
3. Rung 2: if a single box is at ceiling, add an LB + 2nd instance.
4. Only then talk about cache, sharding, async.
// Most outages get fixed at rung 1 or 2, not rung 6.`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment (5 non-gating Quizzes) */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="A consumer app has 50M DAU. Each user takes ~20 actions/day. What's the average QPS, and what should you provision for?"
          options={[
            { label: "~12,000 average QPS — provision for 12k", explanation: "You computed average correctly but forgot the peak factor. Consumer traffic isn't flat — provision for 2–3× average." },
            { label: "~12,000 average QPS — provision for ~25–35k peak (2–3× consumer multiplier)", correct: true, explanation: "Right. (50M × 20) / 86,400 ≈ 11,600 ≈ 12k average. Consumer apps spike to 2–3× peak, so plan for ~25–35k. The honest interview answer always cites both numbers and the multiplier." },
            { label: "~1,000 QPS — these numbers aren't that big", explanation: "Off by 10×. Probably forgot to multiply by 20 actions/day, or treated the result as per-minute instead of per-second." },
            { label: "~120,000 QPS — bigger systems always need more headroom", explanation: "Off by 10× in the other direction. Recompute: (50M × 20) / 86,400 ≈ 12k average." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A video service streams ~3 Mbps per active viewer. At peak you have 50k concurrent viewers, and your origin has a single 10 Gbps NIC. What does the bandwidth math tell you?"
          options={[
            { label: "Fine — 10 Gbps is plenty for 50k viewers.", explanation: "Recompute: 50k × 3 Mbps = 150 Gbps required, NIC has 10 Gbps available. You're 15× over budget." },
            { label: "You need ~150 Gbps — 15× over a single NIC. The math forces a CDN (or many origin nodes); you cannot serve this from one box.", correct: true, explanation: "Right. 50k × 3 Mbps = 150 Gbps; NIC is 10 Gbps. This is exactly why every video service in the world fans out via CDN — the origin only serves cache fills, never end users. Bandwidth math derives the architecture before you draw a box." },
            { label: "Compress the stream harder and it fits.", explanation: "You can't compress your way out of a 15× gap, and 3 Mbps is already aggressive H.264/H.265. The constraint is real." },
            { label: "Add a second NIC — 20 Gbps fixes it.", explanation: "Still 7.5× over budget. The shape of the answer is &quot;many nodes / CDN,&quot; not &quot;a slightly bigger box.&quot;" },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your Java service is at 30% CPU on a 4-core box. p99 latency is climbing. A teammate proposes adding Kafka to &quot;handle scale.&quot; What's the right first move?"
          options={[
            { label: "Add Kafka — async is always more scalable than sync.", explanation: "30% CPU is a system that's bored, not overloaded. Adding rung-6 complexity to a rung-1 problem is the classic over-engineering trap." },
            { label: "Profile first. 30% CPU with climbing latency usually means the bottleneck isn't CPU — it's pool exhaustion, a slow query, GC, or I/O wait. Climb rung 1 (e.g. bump HikariCP from 10 to 30) before considering anything async.", correct: true, explanation: "Right. The ladder starts with diagnosis. If the box has headroom, the latency is coming from somewhere specific — pool, query, GC — and the fix is usually a config change, not an architecture change. Most slow services get fixed at rung 1 or 2." },
            { label: "Add 5 more replicas behind a load balancer.", explanation: "Possibly the right answer eventually, but you don't know what's slow yet. If it's a slow query, more replicas just means more boxes blocked on the same query." },
            { label: "Move to a bigger instance immediately.", explanation: "Closer to right, but still skipping the diagnostic step. If the CPU is only 30% used, a bigger box doesn't help — you'd just have more idle cores." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Which of these is the most accurate one-line summary of CAP &amp; PACELC for an interview?"
          options={[
            { label: "CAP says pick two of three; PACELC adds latency.", explanation: "Misleading. Partition tolerance isn't optional in real distributed systems — &quot;pick two&quot; is a slide-deck simplification. The real choice is C-vs-A during partition." },
            { label: "CAP: during a network partition, you must give up linearizability or per-request availability. PACELC adds the else clause: with no partition, you still pick latency or consistency on every replicated write.", correct: true, explanation: "Right. This is the full honest summary: P isn't a choice, the C-vs-A trade only kicks in during partition, and PACELC captures the latency-vs-consistency trade that dominates the 99%+ of time when there's no partition. Signals you understand both theorems beyond the bumper sticker." },
            { label: "CAP only applies to NoSQL; PACELC only applies to SQL.", explanation: "Both apply to any replicated system — Postgres with replicas is squarely in the framework, as is Cassandra." },
            { label: "PACELC disproved CAP — modern systems can have all three.", explanation: "CAP is still a theorem. Spanner doesn't disprove it; it chose PC/EC and pays the latency cost. PACELC extends CAP, it doesn't replace it." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A user updates their display name from &quot;Alice&quot; to &quot;Alice Smith&quot;, sees a success response, refreshes the page, and sees &quot;Alice&quot; again. The database is Postgres with async read replicas. What consistency model would fix this, and what's the cheapest way to provide it?"
          options={[
            { label: "Linearizability — switch to Spanner.", explanation: "Linearizability would fix it, but switching the entire database is wildly disproportionate. The bug is per-call-site; the fix should be too." },
            { label: "Read-your-writes — pin the post-write read to the primary (or carry an LSN forward) so the user always sees their own edit, even if other users still see stale.", correct: true, explanation: "Right. RYW is the precise model the bug demands — &quot;if YOU wrote it, YOUR next read sees it&quot; — and it's much cheaper than full linearizability. Sticky-to-primary for the rest of the request is the simplest implementation; LSN-tracking is the more rigorous one. Other users can still hit replicas and see stale values; that's fine." },
            { label: "Eventual consistency — wait for replicas to catch up.", explanation: "&quot;Eventual&quot; is what the system already gives you and is exactly the model that lets this bug through. You need something stronger, specifically scoped to the writer's session." },
            { label: "Causal consistency — order the read after the write.", explanation: "Causal is in the right neighborhood but does more than you need (and is harder to implement). RYW is the precise session guarantee for this bug." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — You're ready for Phase 2 when… */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <Callout variant="spring" title="You're ready for Phase 2 when…">
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 m-0">
            <li>You can convert any DAU number to average &amp; peak QPS in 10 seconds, without writing it down.</li>
            <li>You can size storage, bandwidth, and cache memory for a sketched system on a napkin — and remember to include all four axes, including bandwidth.</li>
            <li>You can name the rung any production system is currently on, and the one cheaper rung the team probably skipped.</li>
            <li>You stop saying &quot;CAP says pick two&quot; and start saying &quot;under partition, this system picks X; in the normal case, it picks Y.&quot;</li>
            <li>You stop using &quot;eventually consistent&quot; as a blanket label and start naming the specific guarantee a call site needs — linearizable, causal, read-your-writes, monotonic, or eventual.</li>
            <li>You diagnose before you architect: profile, then climb one rung at a time, then consider rung 6.</li>
          </ul>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-amber-950/30 dark:via-slate-900 dark:to-yellow-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">
          Phase 1 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You have the foundations</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The numbers, the ladder, the CAP/PACELC matrix, the consistency hierarchy. Every later module — sharding, replication, caching patterns, the case studies — will assume you can do back-of-envelope arithmetic, place a datastore on the PACELC matrix, and name the consistency model a call site needs. That&apos;s the entire Phase 1 toolkit, and it&apos;s the toolkit every senior interviewer expects in the first 10 minutes.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 2 — Storage Layer.</strong> SQL vs NoSQL, indexing (B-tree vs LSM), partitioning &amp; sharding, replication strategies, caching patterns, distributed cache deep-dive, search systems. Real datastores, real decision trees, real Java/Spring labs.
        </p>
        <Link
          href="/courses/system-design/modules/sql-vs-nosql"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: SQL vs NoSQL →
        </Link>
      </section>
    </article>
  );
}
