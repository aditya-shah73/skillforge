import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 20 minutes before a system-design interview, not to grind
// through it. The storage layer is dense, so the card is dense.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase2RevisionModule() {
  const mod = getModuleBySlug("phase-2-revision")!;

  // Three partitioning shapes side-by-side. Hash spreads load evenly but kills
  // range scans; range gives you ordered scans but invites hotspots; directory
  // adds a lookup hop in exchange for flexibility.
  const partitioningChart = `
flowchart TB
    subgraph Hash["Hash partitioning"]
        H1["key → hash(key) % N"] --> H2["Even load<br/>No range scans<br/>Resharding is painful<br/>without consistent hashing"]
    end
    subgraph Range["Range partitioning"]
        R1["key in [a, m) → shard 1<br/>key in [m, z] → shard 2"] --> R2["Range scans cheap<br/>Hotspots on sequential keys<br/>(timestamps, autoincrement)"]
    end
    subgraph Dir["Directory / lookup"]
        D1["key → lookup service → shard"] --> D2["Most flexible<br/>Extra hop on every read<br/>Directory is a SPOF"]
    end
    style H1 fill:#10b981,color:#fff,stroke:#059669
    style R1 fill:#f59e0b,color:#fff,stroke:#d97706
    style D1 fill:#3b82f6,color:#fff,stroke:#2563eb
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
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 2 · Module {mod.number} · Revision
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 2 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          SQL vs NoSQL, indexing, partitioning, replication, caching, search — the storage decision toolkit on one card.
        </p>
        <BookmarkButton courseId="system-design" moduleSlug="phase-2-revision" />
        <ModuleProgress moduleSlug="phase-2-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This module is not new material. It&apos;s a <strong>map of Phase 2</strong> — every datastore decision, every index trade, every replication mode, every cache pattern from the seven previous modules, compressed into tables and decision cards. Use it as the page you re-read on the train before a system-design round, not as a tutorial.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The modules you&apos;re consolidating: <Link href="/courses/system-design/modules/sql-vs-nosql" className="text-amber-600 hover:underline">SQL vs NoSQL</Link>, <Link href="/courses/system-design/modules/indexing-deep" className="text-amber-600 hover:underline">Indexing deep dive</Link>, <Link href="/courses/system-design/modules/partitioning-sharding" className="text-amber-600 hover:underline">Partitioning &amp; sharding</Link>, <Link href="/courses/system-design/modules/replication" className="text-amber-600 hover:underline">Replication</Link>, <Link href="/courses/system-design/modules/caching-patterns" className="text-amber-600 hover:underline">Caching patterns</Link>, <Link href="/courses/system-design/modules/distributed-cache-deep" className="text-amber-600 hover:underline">Distributed cache deep dive</Link>, and <Link href="/courses/system-design/modules/search-systems" className="text-amber-600 hover:underline">Search systems</Link>.
        </p>

        <Callout variant="info" title="What this card covers">
          Six decisions, in the order you make them on a whiteboard: <strong>(1)</strong>{" "}pick the datastore family, <strong>(2)</strong>{" "}decide indexing strategy, <strong>(3)</strong>{" "}pick a partitioning scheme, <strong>(4)</strong>{" "}pick a replication topology, <strong>(5)</strong>{" "}pick a caching pattern, <strong>(6)</strong>{" "}bolt on search if you need it. Each section is a card you can answer from in 60 seconds.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Datastore decision tree */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Datastore decision tree</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The first question on any storage whiteboard. Default to Postgres; deviate only when one of the right-hand columns lights up.
        </p>

        <CodeBlock lang="plain" caption="The six families — when each one actually wins">{`Family            | Wins when…                                        | Example systems          | Skip if…
------------------|---------------------------------------------------|--------------------------|---------------------------------
Relational (SQL)  | Multi-row transactions, joins, strong            | Postgres, MySQL,         | Single-key access at extreme
                  | consistency, ad-hoc queries, schema you'll       | CockroachDB, Spanner     | scale (>>100k QPS per shard);
                  | refactor. The boring default.                    |                          | analytical scans over TB.
Document          | Schema flexes per row; nested objects;           | MongoDB, DynamoDB        | You need real joins or
                  | single-aggregate reads/writes; "user profile     | (document mode)          | multi-document transactions
                  | with a blob of preferences" shape.               |                          | (these exist but are clunky).
Wide-column       | Time-series, event logs, "give me all rows for   | Cassandra, ScyllaDB,     | You don't know your query
                  | this partition key in this time range"; massive  | HBase, Bigtable          | patterns yet. Wide-column
                  | write throughput; predictable access patterns.   |                          | punishes ad-hoc queries.
Key-value         | Pure get(k)/put(k,v); session store, feature     | Redis, Memcached,        | You'll ever want to query by
                  | flags, cache, distributed counters, locks.       | DynamoDB (KV mode)       | a non-key attribute.
Graph             | Many-hop relationships are the query — friends-  | Neo4j, JanusGraph,       | Most "graphs" are two-hop;
                  | of-friends, fraud rings, knowledge graphs.       | TigerGraph               | Postgres recursive CTEs handle
                  |                                                  |                          | that fine.
Search            | Full-text, fuzzy, faceted, ranked. Inverted-     | Elasticsearch,           | Exact-match lookups (use the
                  | index workloads; not a system of record.         | OpenSearch, Solr         | primary store) or analytical
                  |                                                  |                          | aggregations (use OLAP).`}</CodeBlock>

        <Callout variant="insight" title="The 80% rule">
          Most production services are well-served by <strong>Postgres + a cache</strong>. JSONB covers the document-store case, partial indexes cover most performance cliffs, and the JOIN you&apos;ll wish you had later is free. Reach for NoSQL when the access pattern is genuinely single-key, write-firehose, or graph-shaped — not because someone said &quot;web scale.&quot;
        </Callout>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">OLTP — transactional</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Row-oriented. Short writes, point reads. Postgres, MySQL. P99 in single-digit ms.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-violet-50/40 dark:bg-violet-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-2">OLAP — analytical</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">Column-oriented. Wide scans, aggregations over TB. Snowflake, BigQuery, ClickHouse. P99 in seconds is fine.</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/sql-vs-nosql" className="text-amber-600 hover:underline">SQL vs NoSQL</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Indexing cheat-sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Indexing cheat-sheet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every index makes writes slower. Add them deliberately, on the columns the query planner actually uses, in the order WHERE/ORDER BY uses them.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Index type</th>
                <th className="px-4 py-3 font-semibold">Read cost</th>
                <th className="px-4 py-3 font-semibold">Write cost</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
                <th className="px-4 py-3 font-semibold">Avoid when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">B+ tree</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(log n), ~3–4 disk hops</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(log n), in-place</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Point reads, range scans, ORDER BY. Read-heavy OLTP. The default.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Sustained write firehose where you can&apos;t keep up with random I/O.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">LSM tree</td>
                <td className="px-4 py-3 font-mono text-amber-600">O(log n) × levels — read amp</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) sequential append</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Write-heavy: time-series, event logs, Cassandra/RocksDB workloads.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Read-mostly with strict P99 — read amplification &amp; compaction stalls hurt.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Hash index</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1) exact match</td>
                <td className="px-4 py-3 font-mono text-emerald-600">O(1)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Equality-only lookups (KV stores, Postgres HASH index).</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Range scans, sorts, prefix matches — hash gives you none.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Inverted index</td>
                <td className="px-4 py-3 font-mono text-emerald-600">Posting-list intersection</td>
                <td className="px-4 py-3 font-mono text-amber-600">Re-index per write</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Full-text search, faceted search, fuzzy match. Elasticsearch/Lucene.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">System of record. It&apos;s a search index, not a database.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Partial index</td>
                <td className="px-4 py-3 font-mono text-emerald-600">B-tree over a filtered subset</td>
                <td className="px-4 py-3 font-mono text-emerald-600">Only on matching rows</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Tiny hot subset of a huge table (e.g. <code>WHERE status=&apos;open&apos;</code> on 200M orders).</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Predicate isn&apos;t selective — degrades to a normal index with extra rules.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Covering index</td>
                <td className="px-4 py-3 font-mono text-emerald-600">Index-only scan, no table touch</td>
                <td className="px-4 py-3 font-mono text-amber-600">Wider index, more I/O on write</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Hot read paths returning a few columns. Stick payload in <code>INCLUDE</code>.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Wide rows — the index becomes a half-copy of the table.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">Composite index column order — the rule that bites everyone</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          Order columns by <strong>equality predicates first, then range, then sort</strong>. The leftmost prefix is the only one the index can seek on; anything after the first range column is just a tiebreaker.
        </p>
        <CodeBlock lang="plain" caption="Composite index — column order decides whether it&apos;s used">{`-- Query: WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC

-- GOOD — equality first, then range
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
-- Seeks straight to the user, then range-scans the leaf chain. Index-only sort.

-- BAD — range first
CREATE INDEX idx_orders_created_user ON orders(created_at, user_id);
-- Can only range-scan by date, then filter by user_id row by row. Useless prefix.`}</CodeBlock>

        <Callout variant="warn" title="When an index hurts">
          Every secondary index multiplies the work of an <code>INSERT</code>/<code>UPDATE</code>/<code>DELETE</code>. Indexes on low-cardinality columns (booleans, status enums with three values) almost never help — the planner does a sequential scan anyway. Drop them. EXPLAIN before you assume.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/indexing-deep" className="text-amber-600 hover:underline">Indexing deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Partitioning diagram */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The three partitioning shapes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Three strategies; you&apos;ll defend a choice between them in every system-design round.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
          <Mermaid chart={partitioningChart} />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/partitioning-sharding" className="text-amber-600 hover:underline">Partitioning &amp; sharding</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Partitioning decision card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Partitioning &amp; sharding — pick one</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The choice depends on your access pattern, not your data shape.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Hash sharding</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>How:</strong> <code>shard = hash(key) % N</code>.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Even load distribution by default</li>
              <li>Zero range scans (keys are scrambled)</li>
              <li>Resharding moves <em>most</em>{" "}keys unless you use consistent hashing</li>
              <li>Default for KV stores: DynamoDB, Cassandra, Redis Cluster</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Range sharding</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>How:</strong>{" "}contiguous key ranges per shard.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Range scans / time-series queries are cheap</li>
              <li>Hotspots on monotonic keys (timestamps, autoincrement) — all writes hit one shard</li>
              <li>Mitigate with composite keys: <code>(region, ts)</code></li>
              <li>Default for HBase, Bigtable, CockroachDB</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-blue-50/40 dark:bg-blue-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">Directory / lookup</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><strong>How:</strong>{" "}a service maps key → shard.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Most flexible — rebalance one tenant at a time</li>
              <li>Extra hop on every read (cache the directory aggressively)</li>
              <li>Directory becomes a SPOF — must be HA</li>
              <li>Used in Vitess (YouTube/Slack) and many multi-tenant SaaS systems</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="Consistent hashing in one paragraph">
          Plain <code>hash(k) % N</code> means changing N reshuffles almost everything. Consistent hashing puts both nodes and keys on a ring; a key goes to the next node clockwise. Adding a node only steals keys from <em>one</em>{" "}neighbour. Always pair with <strong>virtual nodes</strong> (100–500 vnodes per physical node) — without them, the ring is uneven and you get hot shards. Skew falls as ~1/√(V·N).
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/partitioning-sharding" className="text-amber-600 hover:underline">Partitioning &amp; sharding</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Replication */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Replication — three topologies, two sync modes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Pick the topology first (where do writes go?), then the sync mode (when does the client see them?).
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Topology</th>
                <th className="px-4 py-3 font-semibold">Where writes go</th>
                <th className="px-4 py-3 font-semibold">Conflict handling</th>
                <th className="px-4 py-3 font-semibold">Use when</th>
                <th className="px-4 py-3 font-semibold">Skip when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Leader-follower</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">One leader. Followers replicate.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">None — single write path.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">99% of systems. Postgres, MySQL, MongoDB replica sets.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Multi-region with low write latency required.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Multi-leader</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Every region writes locally.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Mandatory CRDTs or app-level merge.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Geo-distributed writes, offline-first apps. CouchDB, some Cassandra setups.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">You haven&apos;t designed for conflicts. The complexity is enormous.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Leaderless</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Client writes to W of N nodes.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Last-write-wins or vector clocks; read repair.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">High availability, tunable consistency. Cassandra, Dynamo, Riak.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">You need strict ordering or transactions.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Synchronous replication</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Leader waits for follower(s) to ack before returning to client.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Zero data loss on failover</li>
              <li>Write latency = slowest follower</li>
              <li>Any follower down = writes stall</li>
              <li>Almost always run as semi-sync: ack from at least one follower</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Asynchronous replication</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Leader returns immediately; followers catch up later.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Fast writes, high availability</li>
              <li>Replication lag → stale reads</li>
              <li>Failover can lose recently-acked writes</li>
              <li>The default in most managed Postgres/MySQL setups</li>
            </ul>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">The R + W &gt; N quorum rule (leaderless)</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          With N replicas, if writes require W acks and reads require R acks, then <strong>R + W &gt; N</strong>{" "}guarantees at least one overlapping node — i.e. you read the latest write. <code>N=3, W=2, R=2</code> is the canonical setting; tune W up for write durability, R up for read freshness, both down for availability.
        </p>

        <h3 className="text-base font-semibold mb-2">Read-your-writes — three strategies</h3>
        <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-decimal pl-5 mb-3">
          <li><strong>Sticky session:</strong>{" "}route a user&apos;s reads to the same replica for N seconds after a write. Cheapest fix.</li>
          <li><strong>Read from leader after write:</strong>{" "}for X seconds post-write, send that user&apos;s reads to the leader.</li>
          <li><strong>Causal token:</strong>{" "}client receives an LSN/timestamp on write, sends it on subsequent reads; replica blocks until caught up.</li>
        </ol>

        <Callout variant="warn" title="The classic outage shape">
          Async replication. Write lag spikes to seconds (long-running migration, vacuum, network blip). Reads start hitting stale data. Users see &quot;I just placed an order&quot; → empty cart on refresh. Always monitor replica lag and alert before it bleeds into UX.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/replication" className="text-amber-600 hover:underline">Replication</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Caching patterns */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">6. Caching patterns — four, in plain English</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The pattern decides who owns reads, who owns writes, and where the staleness window lives.
        </p>

        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Cache-aside (the default)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">App reads cache; on miss, app reads DB and writes to cache. Writes go to DB and invalidate cache.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Lazy population — only hot data gets cached</li>
              <li>Cache failure → degrade to slow, not down</li>
              <li>Bug surface: missed invalidations, races</li>
              <li>Pick this 80% of the time</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-blue-50/40 dark:bg-blue-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">Write-through</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Writes hit cache and DB synchronously. Reads always hit cache.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Cache and DB stay in lockstep — no invalidation bugs</li>
              <li>Write latency = max(cache, DB)</li>
              <li>Cache fills with cold data nobody reads</li>
              <li>Use for read-heavy workloads where consistency matters</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Write-back / write-behind</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Writes hit cache only; cache flushes to DB asynchronously.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Very fast writes — cache absorbs a firehose</li>
              <li>Crash = lose un-flushed writes</li>
              <li>Perfect for counters, view tallies, telemetry</li>
              <li>Never for money or anything legally durable</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-violet-50/40 dark:bg-violet-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-2">Refresh-ahead</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Cache proactively re-fetches before TTL expiry for hot keys.</p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
              <li>Zero miss latency for popular data</li>
              <li>Wasted refreshes for cold keys (must scope to known-hot)</li>
              <li>Most teams approximate with <em>stale-while-revalidate</em></li>
              <li>Only worth the complexity for the top ~1% of keys</li>
            </ul>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">TTL, jitter, and the stampede</h3>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5 mb-3">
          <li><strong>TTL is the laziest correct invalidation.</strong>{" "}If staleness for N seconds is acceptable, TTL alone is enough. Most data is.</li>
          <li><strong>Always add ±10% jitter</strong>{" "}to TTLs. Without jitter, every key cached at deploy time expires at the same millisecond → simultaneous miss storm → DB falls over.</li>
          <li><strong>Single-flight kills thundering herd.</strong>{" "}Per-key lock so only one request refills on miss; everyone else waits and gets the populated value. Memcache calls this &quot;dogpile prevention&quot;; Caffeine has <code>loadingCache</code>.</li>
          <li><strong>Negative caching</strong>{" "}for misses (cache &quot;not found&quot; with a short TTL) prevents repeated DB hits for a known-missing key — the classic &quot;keys that don&apos;t exist&quot; attack.</li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Sources: <Link href="/courses/system-design/modules/caching-patterns" className="text-amber-600 hover:underline">Caching patterns</Link>, <Link href="/courses/system-design/modules/distributed-cache-deep" className="text-amber-600 hover:underline">Distributed cache deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Search systems */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Search — bolted on, never the source of truth</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Elasticsearch/OpenSearch is an <em>index</em>, not a database. It lives downstream of your primary store, fed by CDC or events.
        </p>

        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5 mb-4">
          <li><strong>Inverted index</strong>: term → posting list of doc IDs. Query = intersect/union posting lists, then score.</li>
          <li><strong>Tokenization &amp; analysis</strong>{" "}is half the battle: lowercase, stemming, stopwords, language-specific analyzers. Wrong analyzer = no recall.</li>
          <li><strong>Eventual consistency by default</strong>: refresh interval is 1s in Elasticsearch. Don&apos;t read-your-writes through search.</li>
          <li><strong>Sharding for search</strong>: more shards = parallelism on read but coordinator must merge results. Over-sharding (&gt;100 shards/node) hurts.</li>
          <li><strong>Relevance tuning</strong>: BM25 by default; boost by recency / popularity / business signals. Often a second pass over a candidate set from a cheaper retriever.</li>
        </ul>

        <Callout variant="warn" title="The two recurring search outages">
          <strong>(1) Mapping explosion</strong> — letting users send arbitrary JSON keys into a dynamic mapping until the cluster OOMs on field metadata. Lock the mapping. <strong>(2) Hot shard from a bad routing key</strong> — same shape as the partitioning hotspot. Search shards are still shards.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/search-systems" className="text-amber-600 hover:underline">Search systems</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Gotchas (BAD/GOOD code pairs) */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">8. Four gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has cost real engineers real on-call hours. If you only remember four things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Composite index column order</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The index can only seek on its <em>leftmost prefix</em>. Range columns come <strong>after</strong>{" "}equality columns — putting them first turns the index into a glorified sequential scan.
            </p>
            <CodeBlock lang="plain">{`-- Query: WHERE user_id = ? AND created_at > ? ORDER BY created_at DESC

-- BAD — range first, equality wasted
CREATE INDEX idx_orders_bad ON orders(created_at, user_id);
-- Planner range-scans by date across all users, filters user_id per row.
-- 200M-row table → seconds per query.

-- GOOD — equality first, then range, sort matches index order
CREATE INDEX idx_orders_good ON orders(user_id, created_at DESC);
-- Seeks to (user_id, max_date), walks the leaf chain backwards. Index-only sort.
-- Same query → sub-millisecond.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Cache stampede without single-flight</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Hot key expires. 10,000 concurrent readers all miss simultaneously. All 10,000 hit the DB. The DB dies. Use a per-key lock so exactly one reader refills.
            </p>
            <CodeBlock lang="java">{`// BAD — every miss hits the DB
public User getUser(long id) {
    User u = cache.get(id);
    if (u == null) {
        u = db.findById(id);          // 10k concurrent calls here
        cache.put(id, u, TTL);
    }
    return u;
}

// GOOD — single-flight via Caffeine LoadingCache or explicit lock
private final LoadingCache<Long, User> users = Caffeine.newBuilder()
    .expireAfterWrite(Duration.ofMinutes(5))
    .refreshAfterWrite(Duration.ofMinutes(4))      // refresh-ahead
    .build(id -> db.findById(id));                 // one loader per key

public User getUser(long id) {
    return users.get(id);              // concurrent gets share the single load
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Cross-shard joins / queries</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Once you shard, anything that needs data from multiple shards becomes a scatter-gather. P99 = slowest shard. Design the schema so 99% of queries are <strong>single-shard</strong>.
            </p>
            <CodeBlock lang="plain">{`-- BAD — hash-sharded by user_id, but reports group by region
SELECT region, SUM(amount) FROM orders GROUP BY region;
-- Hits every shard, aggregates in app layer, P99 is awful.

-- GOOD — co-locate related data via the shard key
-- Option A: shard by region (if access is region-scoped)
-- Option B: maintain a denormalized region_totals table updated via CDC
-- Option C: send to an OLAP store (BigQuery/Snowflake) for analytics
-- Don't ad-hoc fan out across 64 shards from your hot OLTP path.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Replication-lag &quot;ghost write&quot; bug</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              User writes via leader, immediate read hits a replica with 500ms lag → returns stale data → UI shows the write &quot;disappeared.&quot; The fix is read-your-writes routing, not changing the user&apos;s mind.
            </p>
            <CodeBlock lang="java">{`// BAD — round-robin reads regardless of recent writes
public Order placeOrder(Order o) {
    Order saved = leader.save(o);
    return saved;
}
public List<Order> recentOrders(long userId) {
    return replica.findByUser(userId);   // may miss the just-saved order
}

// GOOD — sticky-leader window after a write
public Order placeOrder(Order o) {
    Order saved = leader.save(o);
    recentWrites.put(o.userId(), Instant.now());    // mark sticky
    return saved;
}
public List<Order> recentOrders(long userId) {
    boolean recent = Optional.ofNullable(recentWrites.get(userId))
        .map(t -> Duration.between(t, Instant.now()).getSeconds() < 5)
        .orElse(false);
    return recent ? leader.findByUser(userId) : replica.findByUser(userId);
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">9. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="A new service stores user profiles. Each profile has a few well-known fields (id, email, name) plus a variable bag of preferences. Read rate: 50k QPS. Write rate: 200/s. What's the right datastore?"
          options={[
            { label: "MongoDB, because the variable preferences are document-shaped.", explanation: "Plausible, but you're picking complexity (a second datastore, a new ops surface) to solve a problem Postgres already handles with JSONB. The volumes here don't justify it." },
            { label: "Postgres with a JSONB column for preferences, plus a read replica or cache.", correct: true, explanation: "Right. 50k QPS is comfortable for Postgres + a read replica or cache. JSONB covers the document case. You keep transactions, joins, and migrations. The boring answer is right surprisingly often." },
            { label: "DynamoDB — key-value will scale infinitely.", explanation: "DynamoDB scales but loses joins and ad-hoc queries. At 50k QPS you don't need infinite scale, you need flexibility. Reach for DynamoDB when you genuinely have a single-key access pattern at a scale Postgres can't handle." },
            { label: "Cassandra, because writes will eventually grow.", explanation: "Cassandra is for write-firehose workloads (millions of writes/sec) with predictable access patterns. 200 writes/s with ad-hoc queries is the worst possible fit." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your query is WHERE tenant_id = ? AND created_at > ? ORDER BY created_at DESC LIMIT 50. Which composite index is correct?"
          options={[
            { label: "(created_at, tenant_id) — date first for the range", explanation: "Backwards. The index can only seek on the leftmost prefix. Putting created_at first means the planner range-scans every date across every tenant, then filters tenant_id per row. Useless." },
            { label: "(tenant_id, created_at DESC) — equality first, then range matching the sort", correct: true, explanation: "Right. Seeks to the tenant, then walks the leaf chain in descending date order. Index-only sort, no extra filter step. The classic equality-then-range rule." },
            { label: "(tenant_id) and a separate (created_at) — let the planner combine them", explanation: "Bitmap index combination exists but is much slower than a single composite. And you still don't get the index-only sort." },
            { label: "(created_at DESC, tenant_id) — sort order first", explanation: "Same problem as option A — putting the range column first means you can't seek by tenant. Sort order matters, but only after the seek key." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're sharding a time-series workload: IoT devices write a row every second, keyed by timestamp. Which sharding strategy works without hotspots?"
          options={[
            { label: "Range-shard by timestamp — natural for time-series", explanation: "Wrong. Range-by-timestamp means every write at any given second hits exactly one shard. Classic hot-shard pattern — the 'current' shard is always overloaded while older shards idle." },
            { label: "Hash-shard by (device_id) so each device's writes spread to one shard, but writes spread across devices.", correct: true, explanation: "Right. Hashing on device_id distributes the firehose evenly while keeping per-device queries single-shard. The composite key (device_id, timestamp) gives you cheap per-device time ranges too." },
            { label: "Directory-shard by region — one shard per region", explanation: "Works for region-scoped queries but doesn't help with time-series hotspots if one region dominates traffic. And you've introduced the directory hop without solving the actual problem." },
            { label: "Hash-shard by timestamp", explanation: "Spreads writes evenly but kills every time-range query — adjacent seconds end up on different shards. You'd have to scatter-gather every range scan." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A team runs Postgres with one async read replica. Users report 'I post a comment, refresh, and it's gone — then it reappears a few seconds later.' What's the simplest fix?"
          options={[
            { label: "Switch to synchronous replication.", explanation: "Solves the symptom but trades write latency and availability — any replica blip stalls writes. Overkill for a UX problem." },
            { label: "Route that user's reads to the leader for ~5 seconds after each write (read-your-writes via sticky session or recency token).", correct: true, explanation: "Right. Classic read-your-writes pattern. You scope the leader hit to the small window where lag matters, and the read replica still handles the bulk of traffic. Cheapest correct fix." },
            { label: "Increase the replica's hardware so lag disappears.", explanation: "Lag will still spike occasionally (vacuum, network blip, big writes). Treating lag as zero is the wrong mental model — you design for the spike." },
            { label: "Drop the read replica and read everything from the leader.", explanation: "Now your leader handles 100% of read traffic — exactly the problem the replica was added to solve. Solves the bug by reintroducing the load problem." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A view-counter service receives 50k increment writes/sec but reads only happen when the dashboard refreshes. Some loss during a crash is tolerable. Which caching pattern fits?"
          options={[
            { label: "Cache-aside — populate on first read", explanation: "Cache-aside is read-shaped. This workload is write-shaped, and the writes are what's expensive (50k/sec to Postgres would melt it)." },
            { label: "Write-through — keep cache and DB in lockstep", explanation: "Cache and DB both take every write — you've added a hop without reducing DB load. Doesn't solve the firehose." },
            { label: "Write-back — cache absorbs writes, flushes to DB asynchronously", correct: true, explanation: "Right. Counter increments are exactly the write-back use case: tolerant of some loss, dominated by writes, eventually consistent. Cache absorbs 50k/sec, flushes batched aggregates to DB every few seconds. Never use this pattern for money or anything legally durable." },
            { label: "Refresh-ahead — keep popular counters always warm", explanation: "Refresh-ahead optimizes reads, not writes. The bottleneck here is write volume." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Ready callout */}
      {/* ============================================================ */}
      <section className="not-prose mb-8">
        <Callout variant="spring" title="You're ready for Phase 3 when…">
          <ul className="space-y-1 list-disc pl-5 mt-2">
            <li>You can defend &quot;Postgres + cache&quot; as the default and name three specific signals that would push you off it.</li>
            <li>You can write a composite index for a given query in your head, and explain why the column order matters.</li>
            <li>You can pick between hash, range, and directory sharding by listening to the access pattern alone.</li>
            <li>You can explain why async replication is the default and how read-your-writes is recovered without going sync.</li>
            <li>You can pick a caching pattern in one sentence, and you know why TTLs need jitter and stampedes need single-flight.</li>
            <li>You treat search as an index, not a database, and know it lives downstream of the system of record.</li>
          </ul>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
          Phase 2 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now defend a storage stack on a whiteboard</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Six families, six index types, three partitioning strategies, three replication topologies, four caching patterns, and an inverted-index search tier. That&apos;s the entire storage decision toolkit — and you can now reason about latency, throughput, and consistency for any of them on the spot.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 3 — Communication.</strong>{" "}APIs, gateways, message queues, Kafka, event-driven &amp; CQRS. The wire between services.
        </p>
        <Link
          href="/courses/system-design/modules/api-design"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Communication →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="phase-2-revision" />
    </article>
  );
}
