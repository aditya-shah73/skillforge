import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleProgress from "@/components/ModuleProgress";
import Checkpoint from "@/components/Checkpoint";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "why-partition", title: "Why partition" },
  { id: "strategies", title: "Three strategies" },
  { id: "consistent-hashing", title: "Consistent hashing" },
];

const partitionDiagram = `flowchart LR
  C[Client / App] --> R{Router}
  R -->|user_id % 4 == 0| S0[(Shard 0)]
  R -->|user_id % 4 == 1| S1[(Shard 1)]
  R -->|user_id % 4 == 2| S2[(Shard 2)]
  R -->|user_id % 4 == 3| S3[(Shard 3)]
  style S0 fill:#dbeafe,stroke:#1e40af
  style S1 fill:#dbeafe,stroke:#1e40af
  style S2 fill:#dbeafe,stroke:#1e40af
  style S3 fill:#dbeafe,stroke:#1e40af`;

const ringDiagram = `flowchart TB
  subgraph Ring["Hash ring (0 .. 2^32)"]
    direction LR
    A["Node A · vnodes at 12, 88, 201, 477"]
    B["Node B · vnodes at 34, 150, 309, 512"]
    C["Node C · vnodes at 67, 222, 388, 600"]
  end
  K1["key 'order:42' → hash 145"] -.routes to.-> B
  K2["key 'order:99' → hash 250"] -.routes to.-> C
  K3["key 'order:7' → hash 480"] -.routes to.-> A
  style A fill:#fef3c7,stroke:#b45309
  style B fill:#dbeafe,stroke:#1e40af
  style C fill:#dcfce7,stroke:#166534`;

export default function Page() {
  const mod = getModuleBySlug("partitioning-sharding")!;

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
        <ModuleProgress moduleSlug="partitioning-sharding" checkpoints={CHECKPOINTS} />
      </header>

      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4">What you&apos;ll walk out with</h2>
        <ul className="space-y-2">
          <li>A clear sense of <em>when</em> a single Postgres stops being enough — and when it&apos;s still fine.</li>
          <li>The three sharding strategies (hash, range, directory) and the workloads each one lives or dies on.</li>
          <li>Why naive <code>hash(key) % N</code> is a resharding nightmare, and how consistent hashing with virtual nodes fixes it.</li>
          <li>The math: with V virtual nodes per physical node, load std dev shrinks like 1/√(V·N).</li>
          <li>A working sense of cross-shard joins, hot shards, and the operational cost of every choice you make.</li>
        </ul>
      </section>

      <section className="my-10">
        <p>
          Indexing speeds up lookups inside a database. Partitioning splits the data <em>across</em> databases. They solve different
          problems and you usually need both. The mistake people make in interviews is reaching for sharding too early — &quot;we&apos;ll
          shard by user_id&quot; — without acknowledging the operational cost. The other mistake is reaching too late, claiming
          a single Postgres will scale to 50TB and 200k QPS because they read a blog post about it once.
        </p>
        <p>
          There&apos;s a real number where vertical scaling stops being cheaper than horizontal scaling, and the goal of this module
          is to give you the framework to talk about that crossover, plus the strategies that exist on the other side.
        </p>
      </section>

      <Checkpoint moduleSlug="partitioning-sharding" id="why-partition" title="Why partition" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 1 — Why partition (and why not)</h2>

        <p>
          A single Postgres on a beefy box (say 64 cores, 512GB RAM, NVMe) can handle a remarkable amount. We&apos;re talking
          tens of thousands of QPS for read-heavy OLTP, several TB of data with the working set in memory, and most people
          will never outgrow it. Vertical scaling is boring and that&apos;s a feature. One node to operate. Transactions work.
          Joins work. Backups work.
        </p>
        <p>
          So why partition? Three real reasons, in order of how often they actually apply:
        </p>
        <ul>
          <li><strong>Storage outgrew the biggest box you can buy.</strong> Tens of TB and growing. Indexes don&apos;t fit in RAM anymore. Vacuum gets painful.</li>
          <li><strong>Write throughput outgrew the biggest box.</strong> WAL is the bottleneck. You can&apos;t add more cores to a single writer.</li>
          <li><strong>Blast radius.</strong> One node going down takes the whole product down. Partitioning lets you isolate failures.</li>
        </ul>

        <Callout variant="warn" title="The reason that's not on the list">
          <p className="m-0">
            &quot;We might need to scale someday.&quot; This is not a reason to shard. Sharding is a one-way door — once you
            split your data, cross-shard joins, transactions, and migrations get dramatically harder. Most teams that shard
            preemptively spend years paying for complexity they didn&apos;t need. <strong>Shard when the pain is real, not before.</strong>
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your Postgres is at 800GB, p99 reads are 30ms, writes are 50ms, and the box is at 40% CPU. Product wants to add a feature that doubles read traffic. What's the right first move?"
          options={[
            { label: "Shard by user_id immediately — 1.6TB is too much for one box.", correct: false, explanation: "1.6TB is not too much. People run Postgres at 10TB+ comfortably. Sharding here adds enormous operational cost for a problem you don't have." },
            { label: "Add a read replica and route reads to it.", correct: true, explanation: "Read replicas are the cheap, reversible scaling lever. CPU has headroom; the bottleneck (if any) is read concurrency. A replica gets you 2x read capacity in an afternoon. Shard later if it actually breaks." },
            { label: "Move to DynamoDB so you don't have to think about scaling.", correct: false, explanation: "Now you've signed up for a rewrite, lost transactions and joins, and still might not need it. The bar for leaving Postgres should be specific pain, not vibes." },
            { label: "Vertically scale to a bigger instance.", correct: false, explanation: "The box is at 40% CPU. There's nothing to vertically scale away from yet — you'd be paying more for capacity you weren't using." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">What does &quot;partition&quot; actually mean?</h3>
        <p>
          Two flavors that get conflated:
        </p>
        <ul>
          <li><strong>Partitioning (single-machine):</strong> Postgres declarative partitioning splits one logical table into multiple physical tables on the <em>same</em> server. Mostly a query-planning and vacuum-management win.</li>
          <li><strong>Sharding (multi-machine):</strong> data lives on different servers. Now you have a routing problem, a cross-shard query problem, and a rebalancing problem.</li>
        </ul>
        <p>
          Most of this module is about sharding. Partitioning-on-one-box is a useful tool but it&apos;s not what you&apos;re
          drawing on the whiteboard when an interviewer asks &quot;how do you scale this to a billion rows.&quot;
        </p>

        <Mermaid chart={partitionDiagram} />
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          The router applies a function to the partition key (here, <code>user_id % 4</code>) and sends the request to the
          owning shard. Everything in sharding flows from this picture — the question is just how the router decides.
        </p>

        <Quiz
          kind="Gut check"
          question="What's the one capability you almost always lose when you shard?"
          options={[
            { label: "Indexes — they don't work on sharded data.", correct: false, explanation: "Indexes work fine per shard. Each shard is a normal database." },
            { label: "Cross-shard transactions and joins (without a lot of pain).", correct: true, explanation: "Right. A transaction touching multiple shards needs 2PC or saga patterns, both of which are painful. Joins across shards either fan out (slow) or require denormalization. This is the big one — it shapes everything." },
            { label: "Replication — sharded systems can't replicate.", correct: false, explanation: "Each shard typically has its own replica set. Sharding and replication are independent axes." },
            { label: "Strong consistency on a single key.", correct: false, explanation: "Single-key consistency is preserved — that key lives on one shard. It's multi-key cross-shard consistency that gets hard." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Shard when storage, write throughput, or blast-radius pain is real — not before. Cross-shard joins and transactions are the price you pay."
          points={[
            { takeaway: "A single Postgres scales further than people think.", detail: "64 cores + NVMe + read replicas covers a lot of ground. The crossover where sharding helps is usually >10TB or >50k writes/sec, not earlier." },
            { takeaway: "Sharding is a one-way door.", detail: "Cross-shard transactions, joins, and reshards are all expensive. Adding shards is straightforward; merging back is a project." },
            { takeaway: "Partitioning ≠ sharding.", detail: "Single-machine partitioning is a vacuum/query-planner trick. Sharding distributes across machines and brings real distributed-systems problems with it." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="partitioning-sharding" id="strategies" title="Three strategies" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 2 — Three sharding strategies</h2>

        <p>
          Once you&apos;ve decided to shard, the real question is: how do you map a row to a shard? There are three answers
          worth knowing. Each has a workload it loves and a workload it ruins.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Hash sharding</h3>
        <p>
          Take a hash of the partition key, mod by the number of shards, that&apos;s where it goes. Most KV stores
          and most &quot;just shard the users table&quot; designs use this.
        </p>

        <CodeBlock lang="java" caption="Naive hash routing">{`int shardId(long userId, int shardCount) {
    return Math.floorMod(Long.hashCode(userId), shardCount);
}

// 4 shards, user 12345 → shard floorMod(hash(12345), 4)
// All reads/writes for that user go to that one shard.`}</CodeBlock>

        <p>
          <strong>Lives on:</strong> point lookups by the partition key. Writes spread evenly across shards if your hash is
          good. Predictable load.
        </p>
        <p>
          <strong>Dies on:</strong> range queries. &quot;Show me all users created last week&quot; becomes a fan-out across
          every shard. Anything that wants ordered scans suffers.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Range sharding</h3>
        <p>
          Each shard owns a contiguous range of the key space. Shard 0: <code>user_id 0..999_999</code>.
          Shard 1: <code>1_000_000..1_999_999</code>. And so on. HBase, Bigtable, and Postgres native range partitioning
          work this way.
        </p>
        <p>
          <strong>Lives on:</strong> range scans. &quot;Find all orders between Tuesday and Friday&quot; hits one or two
          shards instead of all of them.
        </p>
        <p>
          <strong>Dies on:</strong> hot shards. If your key is monotonically increasing (timestamp, auto-increment ID),
          <em>every new write</em> goes to the last shard. The other N-1 shards are bored. This is the classic
          time-series sharding mistake.
        </p>

        <Callout variant="info" title="Composite keys help">
          <p className="m-0">
            Cassandra solves the &quot;range scan but no hot shard&quot; problem with composite keys: a hashed
            <em> partition key</em> (user_id) decides the shard, and a <em>clustering key</em> (timestamp) orders rows
            within the partition. You get hash distribution between users and range scans within a user. This is
            why Cassandra schemas look the way they do.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Directory / lookup sharding</h3>
        <p>
          A separate service maps each key to its shard. <code>tenant_42 → shard_3</code>. <code>tenant_77 → shard_1</code>.
          Vitess uses this. Many B2B SaaS platforms use this when shards are tenants.
        </p>
        <p>
          <strong>Lives on:</strong> heterogeneous workloads. One whale tenant gets its own dedicated shard. Smaller
          tenants pile onto shared shards. You can move a tenant between shards without rehashing the world.
        </p>
        <p>
          <strong>Dies on:</strong> the directory itself. Now it&apos;s a hot service that every query consults. You
          cache it aggressively and pray the cache invalidation works.
        </p>

        <Quiz
          kind="Quick check"
          question="You're building a logging pipeline that ingests 50k events/sec keyed by event_id (UUID v4) and you mostly query by event_id. Which sharding strategy makes the most sense?"
          options={[
            { label: "Range on event_id.", correct: false, explanation: "UUID v4 is random, so you'd get even distribution — but range buys you nothing here because you don't do range scans on UUIDs. You'd be paying for a feature you don't use." },
            { label: "Hash on event_id.", correct: true, explanation: "Random keys + point lookups + high write throughput is the textbook hash-sharding case. Even write distribution, fast point reads, no hot shards." },
            { label: "Directory keyed by event_id.", correct: false, explanation: "Per-event directory entries would be enormous and the directory itself becomes the bottleneck. Directory sharding is for coarse-grained tenants, not per-event." },
            { label: "Range on timestamp.", correct: false, explanation: "Hot shard disaster. All 50k writes/sec land on the same shard until you cross the next boundary. Classic mistake." },
          ]}
        />

        <ClassifyChallenge
          title="Match the workload to the strategy"
          prompt="Each workload has a strategy that fits best. Pick the one that matches each workload's access pattern and write distribution."
          buckets={[
            { id: "hash", label: "Hash sharding", description: "Even distribution, point lookups", color: "indigo" },
            { id: "range", label: "Range sharding", description: "Range scans on a monotone key", color: "amber" },
            { id: "directory", label: "Directory sharding", description: "Per-tenant flexibility, heterogeneous load", color: "emerald" },
          ]}
          items={[
            { id: "1", label: "Cassandra-style social feed: writes keyed by user_id, reads scan recent posts for one user", answer: "hash", explanation: "Partition by user_id (hash), cluster by timestamp within the partition. Even write distribution across users, range reads within a user." },
            { id: "2", label: "Multi-tenant SaaS where tenant Acme is 100x bigger than the average tenant", answer: "directory", explanation: "Acme needs a dedicated shard so it doesn't drown its neighbors. A directory lets you place big tenants alone and pack small ones together." },
            { id: "3", label: "Time-series metrics store, queries are 'all metrics for service X between time A and time B'", answer: "range", explanation: "Range on (service_id, time) — composite — gets you the range scan within a service. Pure timestamp range would be a hot-shard disaster, but bucketed by service it works." },
            { id: "4", label: "URL shortener: lookup by short_code, no range scans, even traffic", answer: "hash", explanation: "Random keys, point lookups, no range queries — the classic hash-sharding workload." },
            { id: "5", label: "Customer support ticket system where one bank customer accounts for 30% of traffic", answer: "directory", explanation: "Same shape as the multi-tenant case. The whale needs isolation; directory lets you carve them off." },
            { id: "6", label: "Audit log table queried as 'show me all events from last Tuesday'", answer: "range", explanation: "Date-range queries dominate. Range sharding by date — with care to write to multiple buckets concurrently — is the natural fit." },
          ]}
        />

        <Callout variant="spring" title="What this looks like in Spring">
          <p className="m-0">
            For directory sharding, an <code>AbstractRoutingDataSource</code> with the tenant ID in a
            <code>ThreadLocal</code> picks the right DataSource per request. For hash sharding, you usually let
            the driver (e.g., Vitess client, ShardingSphere) handle routing transparently — your DAO code looks
            unchanged, but the gateway parses the SQL, identifies the partition key, and routes the query.
          </p>
        </Callout>

        <PartRecap
          title="Part 2 recap"
          gist="Hash for even distribution and point lookups. Range for ordered scans (but watch hot shards). Directory for heterogeneous tenants."
          points={[
            { takeaway: "Hash distributes evenly, ruins range scans.", detail: "Use hash when keys are random and queries are point lookups. Range queries become fan-outs." },
            { takeaway: "Range supports ordered scans, hot-shards on monotone keys.", detail: "If your key is a timestamp or auto-increment, all writes pile on the last shard. Composite keys (hash+range) are the escape hatch." },
            { takeaway: "Directory gives you per-tenant control at the cost of an extra service.", detail: "Whales get dedicated shards; small tenants share. The directory itself becomes a hot service to operate." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="partitioning-sharding" id="consistent-hashing" title="Consistent hashing" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 3 — Consistent hashing &amp; resharding</h2>

        <p>
          Here&apos;s the disaster scenario. You&apos;re running 4 shards with naive <code>hash(key) % 4</code> routing.
          Storage is filling up, you decide to add a 5th shard. Now <code>hash(key) % 5</code> is a different function.
          Roughly <strong>4/5 of all keys land on a different shard than they did before.</strong> You&apos;re moving 80%
          of your data while serving live traffic.
        </p>
        <p>
          Consistent hashing is the algorithm designed to make this not suck. It was invented at Akamai in 1997 for the
          same problem in CDN caches, and it&apos;s now the foundation of Cassandra, DynamoDB, Riak, and most KV stores.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">The ring</h3>
        <p>
          Imagine a circle. Both keys and nodes get hashed onto positions on the circle (say, 0 to 2³² - 1).
          Each key is owned by the next node clockwise from its position. To find the owner of a key, hash it,
          walk clockwise, find the first node — that&apos;s the owner.
        </p>
        <p>
          Add a node? It only steals the keys between itself and the previous node clockwise — typically about
          1/N of the keyspace. Remove a node? Its keys flow to the next node clockwise. <strong>The other N-1 nodes
          don&apos;t move.</strong> That&apos;s the magic.
        </p>

        <Mermaid chart={ringDiagram} />

        <h3 className="text-xl font-semibold mt-8 mb-3">Why virtual nodes are non-negotiable</h3>
        <p>
          With one position per node, the ring is uneven. By bad luck, Node A might own 40% of the ring while Node C
          owns 10%. And when a node fails, all of its load lands on exactly one neighbor — instant hot spot.
        </p>
        <p>
          The fix: each physical node gets V positions on the ring. Now Node A has 256 little arcs scattered around
          instead of one big one. Two effects:
        </p>
        <ul>
          <li>Load smooths out. With V vnodes per physical node and N nodes, the standard deviation of load shrinks like <strong>1/√(V·N)</strong>.</li>
          <li>When a node fails, its load splits across <em>all</em> remaining nodes (because its 256 arcs each had different neighbors), not just one.</li>
        </ul>

        <Callout variant="insight" title="The 1/√(V·N) intuition">
          <p className="m-0">
            Each vnode is an independent random sample of the keyspace. Variance of the average of V·N samples is
            1/(V·N) of the per-sample variance, so standard deviation goes like 1/√(V·N). Plug in N=10 nodes with V=256
            vnodes each: std dev is ~1/√2560 ≈ 2% of the mean. Drop V to 1: ~32%. That&apos;s the difference between
            &quot;balanced cluster&quot; and &quot;one node is on fire.&quot;
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="You have a 6-node Cassandra cluster with 256 vnodes per node. Roughly what fraction of keys move when you add a 7th node?"
          options={[
            { label: "About 6/7 of keys move.", correct: false, explanation: "That'd be naive mod-based hashing. Consistent hashing's whole point is to avoid that." },
            { label: "About 1/7 of keys move.", correct: true, explanation: "Right. The new node takes over roughly 1/N+1 of the keyspace, stealing one slice from each of the existing 6 nodes. Vnodes mean those slices come from many small arcs spread evenly, so all 6 old nodes contribute proportionally." },
            { label: "Roughly half — vnodes double the movement.", correct: false, explanation: "Vnodes don't increase movement; they smooth out which nodes contribute to it. Total movement is still ~1/(N+1)." },
            { label: "Zero — vnodes mean the new node is empty until you rebalance manually.", correct: false, explanation: "Adding a node automatically takes ownership of arcs in the ring; data streams over from the old owners. There's no separate manual rebalance step." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Resharding without consistent hashing</h3>
        <p>
          Plenty of systems are stuck with mod-N sharding because they were built before they expected to scale.
          The standard escape hatch is <strong>double-writing during migration</strong>:
        </p>
        <ol>
          <li>Stand up the new shard layout (more shards) alongside the old one.</li>
          <li>Backfill: for each row in the old layout, compute its new shard and copy it. This takes hours to days.</li>
          <li>Start dual-writing: every write goes to both the old and new shard layout. Reads still go to old.</li>
          <li>Tail the backfill until lag is near zero.</li>
          <li>Cut reads over to the new layout. Stop writing to old. Tear it down.</li>
        </ol>
        <p>
          This works but it&apos;s a multi-week project with real failure modes (drift between old and new, partial
          backfills, write conflicts during cutover). Compare to Cassandra: you run <code>nodetool addnode</code> and
          go to lunch.
        </p>

        <Quiz
          kind="Gut check"
          question="A teammate proposes consistent hashing for a Postgres-based service. The product needs strong transactions across user accounts. What's the catch?"
          options={[
            { label: "Consistent hashing only works with NoSQL — Postgres can't use it.", correct: false, explanation: "Vitess and Citus both use consistent-hashing-style ranges on top of Postgres/MySQL. The algorithm is database-agnostic." },
            { label: "Consistent hashing places keys on different shards based on hash, so cross-shard transactions still need 2PC or saga patterns.", correct: true, explanation: "Right. Consistent hashing solves the resharding problem, not the cross-shard transaction problem. If two related keys hash to different shards, multi-key transactions are still painful — that doesn't change." },
            { label: "Consistent hashing requires synchronous replication, which kills write throughput.", correct: false, explanation: "Replication strategy is independent of the partitioning algorithm. You can run consistent hashing with async or sync replication." },
            { label: "Postgres can't index data placed via a hash function.", correct: false, explanation: "Each shard is a normal Postgres with normal indexes. Routing happens above the database, not inside it." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Hot shards even with consistent hashing</h3>
        <p>
          Consistent hashing distributes <em>keys</em> evenly. It does <strong>not</strong> distribute <em>traffic</em> evenly
          if traffic is skewed. If user_id 42 is Beyoncé and gets 5% of all reads, the shard owning her data is on fire
          regardless of how clever your hashing is.
        </p>
        <p>
          The mitigations are workload-specific:
        </p>
        <ul>
          <li><strong>Read replicas for hot keys.</strong> Beyoncé&apos;s shard has 10 replicas, everyone else has 2.</li>
          <li><strong>Application-level caching.</strong> Hot keys go in Redis. The shard never sees the read.</li>
          <li><strong>Key salting for writes.</strong> Append a random suffix to spread writes (<code>beyonce#1</code>, <code>beyonce#2</code>, …) and merge on read. Ugly but it works.</li>
        </ul>

        <Callout variant="warn" title="The interview trap">
          <p className="m-0">
            When asked about hot shards, candidates often say &quot;use consistent hashing.&quot; That&apos;s a non-answer.
            Consistent hashing handles <em>resharding</em>, not <em>skew</em>. The honest answer is: identify the hot keys,
            cache them, replicate them, or salt them. There&apos;s no algorithm that fixes Beyoncé.
          </p>
        </Callout>

        <PartRecap
          title="Part 3 recap"
          gist="Consistent hashing makes adding/removing nodes cheap (1/N keys move). Virtual nodes smooth the load and split failures across the cluster. None of this fixes traffic skew."
          points={[
            { takeaway: "Naive mod-N is a resharding bomb.", detail: "Adding one node moves ~(N-1)/N of all keys. Consistent hashing moves ~1/N." },
            { takeaway: "Virtual nodes are the difference between balanced and not.", detail: "Std dev of load goes like 1/√(V·N). 256 vnodes per node is the typical default." },
            { takeaway: "Consistent hashing solves rebalancing, not skew.", detail: "Hot keys still hammer one shard. Cache them, replicate them, or salt them — but don't pretend the algorithm fixes it." },
            { takeaway: "Cross-shard transactions are still hard.", detail: "Sharding strategy is orthogonal to the multi-key transaction problem. 2PC or sagas still apply." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-3">What this didn&apos;t cover</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>Two-phase commit and saga patterns for cross-shard transactions (covered in transactions deep dive).</li>
          <li>Specific operational tooling: Vitess, Citus, ShardingSphere — same ideas, different ergonomics.</li>
          <li>Resharding strategies for systems already running mod-N, beyond the sketch in Part 3.</li>
          <li>Geo-partitioning (placing shards in regions for latency/compliance) — that&apos;s a follow-up topic.</li>
        </ul>
      </section>

      <section className="my-12 text-center">
        <p className="text-sm text-slate-500 mb-2">Next up</p>
        <Link href="/courses/system-design/modules/replication" className="inline-block text-lg font-semibold text-cyan-600 hover:underline">
          Replication: leaders, followers, and the lag you have to live with →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="partitioning-sharding" />
    </article>
  );
}
