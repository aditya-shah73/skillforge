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
  { id: "btree", title: "B-tree mechanics: how the read-optimized index works" },
  { id: "lsm", title: "LSM trees: write-optimized, with a cost" },
  { id: "indexes-hurt", title: "When indexes hurt — and which Postgres index type to pick" },
];

const btreeDiagram = `flowchart TB
  R["Root: <11 | <23 | <37"]
  R --> A["[1..10]"]
  R --> B["[11..22]"]
  R --> C["[23..36]"]
  R --> D["[37..50]"]
  A -.next.-> B
  B -.next.-> C
  C -.next.-> D
  style R fill:#dbeafe,stroke:#2563eb
  style A fill:#ecfccb,stroke:#65a30d
  style B fill:#ecfccb,stroke:#65a30d
  style C fill:#ecfccb,stroke:#65a30d
  style D fill:#ecfccb,stroke:#65a30d`;

const lsmDiagram = `flowchart LR
  W[Write] --> M[Memtable<br/>in-memory sorted map]
  M -- flush when full --> L0[L0 SSTable]
  L0 -- compact --> L1[L1 SSTables<br/>10x bigger]
  L1 -- compact --> L2[L2 SSTables<br/>10x bigger]
  L2 -- compact --> L3[L3 ...]
  R[Read] -.check.-> M
  R -.then.-> L0
  R -.then.-> L1
  R -.then.-> L2
  style M fill:#fef3c7,stroke:#d97706
  style L0 fill:#dbeafe,stroke:#2563eb
  style L1 fill:#dbeafe,stroke:#2563eb
  style L2 fill:#dbeafe,stroke:#2563eb`;

export default function Page() {
  const mod = getModuleBySlug("indexing-deep")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="indexing-deep" />
        <ModuleProgress moduleSlug="indexing-deep" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📚</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Concrete mechanics of the two index families that run the world: B-trees and LSM trees. After this you&apos;ll be able to read an EXPLAIN plan, predict whether an index will help or hurt, and know which Postgres index type to pick when B-tree isn&apos;t the right tool.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>What a B+ tree actually is and why its height stays tiny even on huge tables</li>
          <li>How LSM trees flip the trade — write-optimized at the cost of read amplification</li>
          <li>Covering indexes, composite index column order, and index-only scans</li>
          <li>The hidden cost every index adds: write amplification</li>
          <li>When to reach for GIN, GiST, or BRIN instead of a default B-tree</li>
        </ul>
      </section>

      <section>
        <h2>What an index actually is</h2>
        <p>
          An index is a separate data structure that maps from a column value (or values) to a row location. Without one, the database does a sequential scan: read every page on disk, check the WHERE clause, throw away most of them. With one, the database walks a small auxiliary structure and jumps directly to the rows it needs.
        </p>
        <p>
          The two index families that matter in practice are <strong>B-trees</strong> (read-optimized, default everywhere) and <strong>LSM trees</strong> (write-optimized, the design center of Cassandra, RocksDB, ScyllaDB, and BigTable). They are not interchangeable. They make opposite trade-offs about where the work happens, and that choice shapes the database around them.
        </p>
      </section>

      <Checkpoint moduleSlug="indexing-deep" id="btree" title="Part 1 · B-tree mechanics: how the read-optimized index works" xp={25}>
        <h2>The B+ tree: balanced, fan-out-heavy, shallow</h2>
        <p>
          When a database says &quot;B-tree index,&quot; it almost always means a B+ tree. The structure has two kinds of nodes:
        </p>
        <ul>
          <li><strong>Internal nodes</strong>{" "}hold ordered key boundaries that route the search to a child. They contain no row data.</li>
          <li><strong>Leaf nodes</strong>{" "}hold the actual key → row-pointer entries, in sorted order, and are linked to their neighbors so range scans walk a linked list.</li>
        </ul>

        <Mermaid chart={btreeDiagram} />

        <h3>Why it stays shallow</h3>
        <p>
          A node is a <em>page</em>{" "}on disk — typically 4 KB or 8 KB in Postgres. That page can hold hundreds of routing entries. The technical term is <strong>fan-out</strong>: how many children one node points at. With a fan-out of around 200, the tree height grows logarithmically with absurd slowness.
        </p>
        <p>Concrete numbers (Postgres, 8 KB pages, integer keys, fan-out ~250):</p>
        <ul>
          <li><strong>1 million rows</strong> — height 3. Three page reads per lookup.</li>
          <li><strong>1 billion rows</strong> — height 4–5. Still four or five page reads per lookup.</li>
          <li>The top levels of the tree live in the buffer cache permanently. Real I/O happens at the leaves.</li>
        </ul>
        <p>
          So a B-tree lookup over a billion rows is essentially: 1–2 RAM hits (root and inner levels) + 1 disk read (leaf, often cached too). That&apos;s why &quot;index lookup is O(log n) but really fast O(log n)&quot; is true in practice.
        </p>

        <Callout variant="info" title="The constant factor matters more than the big-O">
          <p className="m-0">Saying &quot;B-tree is O(log n)&quot; is correct but uninformative. The real story is the constant: log<sub>250</sub>(1B) is about 4. The base of the log is the fan-out, which is huge, which is why even &quot;huge&quot; tables index in 4-deep trees. Don&apos;t let big-O hide why this works.</p>
        </Callout>

        <h3>How writes happen</h3>
        <p>
          A B-tree write finds the right leaf (same path as a read), inserts the new entry, and may need to <strong>split the page</strong>{" "}if it&apos;s full — half the entries go to a new sibling, the parent gets a new boundary. Splits cascade upward in the worst case, but rarely past the second level.
        </p>
        <p>
          The cost: every write does an in-place page modification, which means random I/O. SSDs make this much cheaper than it was on spinning disks, but it&apos;s still &quot;modify a page that&apos;s probably not the page you wrote a millisecond ago.&quot; That random write pattern is the trade-off LSM trees attack head-on.
        </p>

        <h3>Range scans: walk the leaf chain</h3>
        <p>
          Because leaves are linked, a range query <code>WHERE created_at BETWEEN x AND y</code> finds the start leaf via the tree, then scans rightward through the leaf chain. Sequential I/O, no re-traversal of the tree. This is why range queries on indexed columns are fast.
        </p>

        <h3>Covering indexes and index-only scans</h3>
        <p>
          A normal index points at row locations. After finding the matching index entries, the database has to fetch the full row from the table heap — one extra I/O per row. A <strong>covering index</strong>{" "}includes additional columns in the index itself, so the query can be answered without touching the heap at all.
        </p>
        <CodeBlock lang="plain" caption="Postgres covering index — INCLUDE clause">{`-- Plain index — finds rows by user_id, but heap fetch needed for status, total
CREATE INDEX idx_orders_user ON orders(user_id);

-- Covering index — status & total are stored in the leaf, so the query is index-only
CREATE INDEX idx_orders_user_covering ON orders(user_id) INCLUDE (status, total);

-- This query can now use Index Only Scan
SELECT user_id, status, total FROM orders WHERE user_id = 12345;`}</CodeBlock>
        <p>
          The cost: the index gets bigger (you&apos;re storing more per leaf entry). The benefit: index-only scans can be 5–10x faster on read-heavy workloads, because you avoid the random heap fetch entirely.
        </p>

        <Callout variant="warn" title="Index-only scans need fresh visibility maps">
          <p className="m-0">Postgres can only do an index-only scan if the visibility map confirms that all rows on the page are visible to all transactions. After a heavy write workload, run <code>VACUUM</code> or rely on autovacuum — otherwise the planner will fall back to heap fetches and your covering index won&apos;t help. This is a real production gotcha.</p>
        </Callout>

        <h3>Reading EXPLAIN: a worked example</h3>
        <CodeBlock lang="plain" caption="Postgres EXPLAIN — before and after adding an index">{`-- Before: 50ms, sequential scan over 5M rows
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 12345;

  Seq Scan on orders  (cost=0.00..89234.50 rows=42 width=128)
                      (actual time=12.4..52.1 rows=37 loops=1)
    Filter: (user_id = 12345)
    Rows Removed by Filter: 4999963

-- After CREATE INDEX idx_orders_user ON orders(user_id):
-- 0.4ms, index scan
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 12345;

  Index Scan using idx_orders_user on orders
    (cost=0.43..162.30 rows=42 width=128)
    (actual time=0.08..0.41 rows=37 loops=1)
    Index Cond: (user_id = 12345)`}</CodeBlock>
        <p>
          Two numbers tell the story: <strong>Rows Removed by Filter: 4,999,963</strong>{" "}in the seq scan (that&apos;s the work the index lets you skip), and <strong>actual time</strong>{" "}dropping from 52ms to 0.4ms. 100x improvement from one index. This is the easy case — the index transforms a full scan into a 4-page tree walk.
        </p>

        <h3>Composite indexes and column order</h3>
        <p>
          A composite index <code>(a, b, c)</code> orders rows by <code>a</code>, then by <code>b</code> within each <code>a</code>, then by <code>c</code>. That structure means:
        </p>
        <ul>
          <li>It can serve <code>WHERE a = ?</code>, <code>WHERE a = ? AND b = ?</code>, and <code>WHERE a = ? AND b = ? AND c = ?</code>.</li>
          <li>It can serve <code>WHERE a = ? ORDER BY b</code> without a sort.</li>
          <li>It <strong>cannot</strong>{" "}efficiently serve <code>WHERE b = ?</code> alone — there&apos;s no entry point in the tree.</li>
        </ul>
        <p>
          Rule of thumb for column order: <strong>most selective equality columns first, then range columns last.</strong>{" "}An index on <code>(status, created_at)</code> is great for <code>WHERE status = &apos;open&apos; AND created_at &gt; ?</code>; flipping it to <code>(created_at, status)</code> would make the same query much slower.
        </p>

        <Quiz
          question="A query is SELECT * FROM events WHERE tenant_id = ? AND created_at > now() - interval '1 hour' ORDER BY created_at DESC LIMIT 100. Which index serves it best?"
          options={[
            { label: "(tenant_id, created_at DESC) — equality on tenant_id first, range/order on created_at second. The index can satisfy the WHERE, the ORDER BY, and the LIMIT in one walk.", correct: true, explanation: "Right. With this composite index, Postgres descends the tree to (tenant_id = ?), walks the leaf chain backward (created_at DESC) for 100 entries, and stops. No sort node, no extra heap fetch beyond the rows actually returned." },
            { label: "(created_at DESC, tenant_id) — order by the range column first.", explanation: "Wrong direction. With created_at as the leading column, the index isn't selective for a single tenant — you'd scan all events in the time range, then filter by tenant. Bad plan." },
            { label: "Two separate indexes: one on tenant_id, one on created_at.", explanation: "Postgres can sometimes BitmapAnd two indexes, but it's strictly worse than a composite for this query: more I/O, no order benefit, can't terminate at LIMIT." },
            { label: "An index on (id) — primary key is always fastest.", explanation: "The primary key isn't relevant to the WHERE or ORDER BY here. Always-fastest-by-PK is a myth." },
          ]}
          hint="What column should the tree be sorted by FIRST?"
          xp={7}
        />

        <Quiz
          question="A B-tree index on a 1-billion-row table has fan-out ~250 and B+ tree height of about 5. A point lookup for a missing key — i.e., the key isn't there at all — does roughly how many page reads?"
          options={[
            { label: "About 5 — it walks the tree top to leaf, then sees the key isn't in the leaf. The 'absent' lookup costs the same as a 'present' one.", correct: true, explanation: "Right. The tree doesn't know the key isn't there until it reaches the appropriate leaf. Negative lookups cost the same as positive ones — which is why some workloads add a Bloom filter in front to reject misses cheaply (especially LSM systems, more on that next part)." },
            { label: "1 — Postgres caches absent keys.", explanation: "Postgres doesn't keep a cache of absent keys. The lookup has to descend to know." },
            { label: "Millions — every page on disk.", explanation: "That's a sequential scan, which is what you avoid by having an index. The B-tree walks O(log_fanout(n)) pages whether the key exists or not." },
            { label: "1 billion — once per row.", explanation: "Same misconception. The whole point of the tree is that you skip the rows that don't match." },
          ]}
          hint="The tree doesn't know the key is absent until it's looked at the leaf."
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="B+ trees stay shallow because fan-out is huge. Reads are fast, range scans walk the leaf chain, writes do random in-place updates."
          points={[
            { takeaway: "Tree height is tiny because fan-out is huge", detail: "Fan-out ~250 per page means height 4–5 for a billion rows. Top levels stay in cache; real I/O is at the leaf." },
            { takeaway: "Range scans walk linked leaves", detail: "Once you find the start, scanning right through leaf pointers is sequential I/O. WHERE x BETWEEN a AND b is fast on indexed columns." },
            { takeaway: "Covering indexes skip heap fetch", detail: "INCLUDE clause stores extra columns in the leaf so the query is answered from the index alone. 5–10x speedup on read-heavy queries when applicable." },
            { takeaway: "Composite column order matters", detail: "Most-selective equality columns first, range/sort columns last. Composite (a,b) serves WHERE a=? but not WHERE b=? alone." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="indexing-deep" id="lsm" title="Part 2 · LSM trees: write-optimized, with a cost" xp={25}>
        <h2>The opposite trade: optimize for writes, accept read amplification</h2>
        <p>
          If a B-tree says &quot;keep the structure sorted on disk at all times so reads are cheap,&quot; an LSM tree (Log-Structured Merge tree) says &quot;writes go to a buffer; we&apos;ll merge them later.&quot; That single decision flips the trade-off. Writes become sequential and almost free. Reads have to look in multiple places.
        </p>

        <h3>How an LSM works</h3>
        <Mermaid chart={lsmDiagram} />
        <p>The structure has three parts:</p>
        <ol>
          <li><strong>Memtable.</strong>{" "}An in-memory sorted map (typically a skip list or red-black tree). Every write goes here first. It&apos;s also written to a write-ahead log on disk for durability.</li>
          <li><strong>SSTables (Sorted String Tables).</strong>{" "}When the memtable is full, it&apos;s flushed to disk as a single immutable, sorted file. New writes start in a fresh memtable; the SSTable is never modified.</li>
          <li><strong>Compaction.</strong>{" "}A background process merges multiple SSTables into bigger, sorted, deduplicated SSTables, organized into levels. L0 SSTables are small and recent; L1 is ~10x bigger; L2 is ~10x bigger again, etc.</li>
        </ol>

        <h3>Why writes are fast</h3>
        <p>
          A write to an LSM is: append to WAL (sequential), insert into memtable (memory). That&apos;s it. No disk seek to find the right page, no in-place page modification, no split cascade. SSTable flushes are sequential writes too — the entire memtable is dumped to disk in one go.
        </p>
        <p>
          Concrete numbers (RocksDB-class systems, modern SSDs): tens of thousands of writes per second per core, sustained. An order of magnitude or more above what a single B-tree primary will deliver. This is why Cassandra, ScyllaDB, RocksDB-backed systems, and BigTable dominate write-heavy workloads.
        </p>

        <h3>Why reads are slower</h3>
        <p>
          A point lookup may have to check the memtable, then L0, then L1, then L2... up to the maximum level. Each level is a separate file lookup. Even with binary search inside each SSTable, the absolute number of I/Os per read can be 5–10x what a B-tree does.
        </p>
        <p>Several mitigations make reads usable:</p>
        <ul>
          <li><strong>Bloom filters.</strong>{" "}Each SSTable has a Bloom filter — a small probabilistic structure that says &quot;this key is definitely not here&quot; (or &quot;maybe here&quot;). A miss-by-Bloom skips the SSTable entirely. Crucial for negative lookups.</li>
          <li><strong>Block indexes inside SSTables.</strong>{" "}Each SSTable has its own sparse index pointing at sorted blocks; you only read the relevant block.</li>
          <li><strong>Caching.</strong>{" "}Recent / hot SSTable blocks live in a block cache, similar to a buffer pool.</li>
        </ul>

        <Callout variant="info" title="Read, write, space — pick a side">
          <p className="m-0">LSMs introduce three amplifications you have to reason about. <strong>Write amplification:</strong>{" "}data gets written multiple times as it&apos;s compacted up through levels — typical LSM has 10–30x write amplification. <strong>Read amplification:</strong>{" "}a read may probe several SSTables — typical 2–5x. <strong>Space amplification:</strong>{" "}tombstones (deletes) and old versions hang around until compaction. B-trees have lower amplifications across all three but cap your write throughput. There&apos;s no free lunch.</p>
        </Callout>

        <h3>Compaction strategies</h3>
        <p>Compaction is where LSM systems differ. The two main strategies:</p>
        <ul>
          <li><strong>Size-tiered (Cassandra default until recently).</strong>{" "}Merge SSTables of similar size. Lower write amplification, higher read amplification. Good for write-heavy workloads where reads are rare.</li>
          <li><strong>Leveled (RocksDB, ScyllaDB, modern Cassandra option).</strong>{" "}Each level has a strict size budget. Compaction is more aggressive, write amplification higher, but read amplification much lower because each level has at most one SSTable per key. Good for mixed workloads.</li>
        </ul>

        <h3>Tombstones and the delete problem</h3>
        <p>
          LSMs don&apos;t do in-place updates, including deletes. A delete is a special record called a <strong>tombstone</strong>{" "}that says &quot;this key is gone.&quot; Reads have to honor tombstones (return &quot;not found&quot; even if older SSTables still hold the key). Tombstones only physically disappear when compaction has merged through every level that contained the key.
        </p>
        <p>
          Real production gotcha: if you delete millions of rows but compaction is slow, reads have to scan past all those tombstones until they&apos;re cleaned up. Cassandra has had outages caused by tombstone storms — &quot;range query returned 1M tombstones and 5 actual rows.&quot; The fix is operational: faster compaction, smaller TTLs, or schema redesign to avoid mass deletes in the first place.
        </p>

        <h3>Real systems</h3>
        <ul>
          <li><strong>RocksDB.</strong>{" "}Embeddable LSM library. Used as the storage engine in MyRocks, CockroachDB, TiKV, and Kafka Streams state stores. The de facto LSM library.</li>
          <li><strong>Cassandra / ScyllaDB.</strong>{" "}Distributed wide-column stores built around LSM internals.</li>
          <li><strong>BigTable / HBase.</strong>{" "}Google&apos;s original LSM-backed wide-column store, and the Apache clone.</li>
          <li><strong>LevelDB.</strong>{" "}The original public LSM library from Google, ancestor of RocksDB.</li>
        </ul>

        <Callout variant="warn" title="Why your B-tree database has LSM-shaped problems">
          <p className="m-0">Postgres uses B-trees, but its WAL + checkpoint behavior shares some characteristics with LSM compaction: writes go to WAL first, dirty pages flush asynchronously, and behind the scenes there&apos;s a battle between &quot;keep the data files current&quot; and &quot;don&apos;t spend all I/O bandwidth on flushes.&quot; The categories are not as clean as &quot;B-tree = simple, LSM = complex.&quot; Both designs are managing a fundamental tension between sequential and random I/O.</p>
        </Callout>

        <Quiz
          question="A team is running a workload with 200k writes/sec sustained, mostly inserts of new event records, low read volume. They're currently on Postgres and the primary's WAL is bottlenecking. Which storage choice would help most?"
          options={[
            { label: "Move event ingestion to an LSM-backed system (Cassandra, ScyllaDB, RocksDB-based store). LSM's sequential-write design handles 200k/s writes per node much better than B-tree's random in-place updates.", correct: true, explanation: "Right. The workload is squarely write-heavy, low-read, append-mostly — exactly what LSM was designed for. Cassandra commonly handles 50–100k writes/sec/node, scaling linearly with cluster size. The trade (slower point lookups, higher space amplification) is fine for this workload." },
            { label: "Add more indexes on Postgres so writes go faster.", explanation: "Indexes make writes slower, not faster — every index is another B-tree to maintain on every write. Wrong direction." },
            { label: "Switch to MongoDB — it's document-shaped, will write faster.", explanation: "MongoDB's default WiredTiger storage engine is also B-tree-based; you wouldn't see the order-of-magnitude write throughput jump LSM offers. Document shape isn't the bottleneck — index maintenance is." },
            { label: "Add read replicas to Postgres.", explanation: "Read replicas help reads, not writes. The bottleneck described is on the write path." },
          ]}
          hint="What's the index family designed for write throughput?"
          xp={7}
        />

        <Quiz
          question="In a Cassandra cluster, a reporting query on a column family that recently had ~5M rows TTL'd starts returning slowly and logs warn about 'tombstone overwhelming threshold.' Why?"
          options={[
            { label: "Tombstones (deletion markers) haven't been compacted away yet, so the read has to scan past millions of dead entries to find the live ones. Compaction needs to catch up, or schema/TTL design needs to avoid mass-deletes in the first place.", correct: true, explanation: "Right. LSM deletes are tombstones, not in-place removes. They linger until compaction merges through every level holding the key. Mass-delete or wide-TTL workloads can outrun compaction, leaving reads to drag through tombstones until cleanup catches up." },
            { label: "Cassandra rejects queries that return TTL'd rows.", explanation: "Cassandra honors tombstones silently. The reads still run, just slowly." },
            { label: "Postgres-style autovacuum is misconfigured.", explanation: "Autovacuum is Postgres terminology. Cassandra has compaction, which serves a similar role for tombstones. The question is about LSM mechanics, not Postgres." },
            { label: "Read-amplification is fundamental to LSMs and there's no fix.", explanation: "Read amplification exists, but the tombstone-overwhelming case is fixable by tuning compaction strategy, smaller TTLs, or restructuring partitions to avoid wide deletes." },
          ]}
          hint="What does 'delete' look like in an LSM?"
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="LSMs make writes sequential by deferring sorting until compaction. Reads pay for it. Tombstones make deletes lazy and sometimes painful."
          points={[
            { takeaway: "Writes: WAL + memtable. SSTables are immutable and sequential", detail: "No in-place page updates, no random I/O on the write path. Tens of thousands of writes/sec per core sustained." },
            { takeaway: "Reads probe multiple levels", detail: "Memtable, then L0, L1, L2... Bloom filters skip SSTables that definitely don't hold the key. Block indexes localize the read inside each SSTable." },
            { takeaway: "Three amplifications: write, read, space", detail: "Write amp 10–30x (compaction rewrites data); read amp 2–5x; space amp from tombstones and shadowed versions. B-trees lose less to amplification but cap write throughput." },
            { takeaway: "Tombstones make deletes lazy", detail: "Deletes are markers, not removals. Mass-delete + slow compaction = tombstone storms that slow reads until cleanup catches up." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="indexing-deep" id="indexes-hurt" title="Part 3 · When indexes hurt — and which index type to pick" xp={25}>
        <h2>Every index makes writes slower</h2>
        <p>
          The first thing senior engineers internalize about indexing: <strong>indexes are not free.</strong>{" "}Every secondary index is another tree the database has to update on every insert, update, and delete. A table with 8 indexes turns each <code>INSERT</code> into 1 row write + 8 index writes. That&apos;s a real cost, and it&apos;s the hidden tax behind the &quot;we&apos;ll just add an index for that&quot; anti-pattern.
        </p>

        <CodeBlock lang="plain" caption="The 'one more index' anti-pattern, measured">{`-- Table with PK only — 38k inserts/sec single-threaded
INSERT INTO orders (...) VALUES (...);

-- Same table with 6 secondary indexes — 11k inserts/sec
-- Each insert now writes:
--   * 1 heap row
--   * 1 PK btree entry
--   * 6 secondary index entries
-- Total: 8 page modifications per logical insert.

-- Numbers are illustrative — actual ratio depends on
-- column types, page fill factor, WAL settings.`}</CodeBlock>

        <p>
          The fix isn&apos;t &quot;don&apos;t use indexes&quot; — it&apos;s &quot;earn each one.&quot; Each index should serve real query patterns; index audits (drop unused indexes) are a normal hygiene activity in any older Postgres database.
        </p>

        <Callout variant="warn" title="Find unused indexes">
          <p className="m-0">Postgres tracks index usage in <code>pg_stat_user_indexes</code>. <code>idx_scan = 0</code> means the planner has never picked that index since stats were last reset. Indexes with no scans after weeks of production traffic are usually safe to drop. Always check first, then drop one at a time, and watch query plans afterward — sometimes an index has zero scans because the planner is using a different one that&apos;s slightly slower.</p>
        </Callout>

        <h3>The selectivity rule</h3>
        <p>
          An index helps when the query returns a small fraction of the table. If a query returns more than ~5–10% of rows, a sequential scan is often faster than an index scan + heap fetch — fewer random I/Os, better prefetching. The Postgres planner knows this and switches strategies, which is why you sometimes see &quot;I added an index and it&apos;s not being used&quot; — the planner decided your query wasn&apos;t selective enough.
        </p>
        <p>
          A column with two distinct values (boolean <code>is_deleted</code>, for example) is rarely worth a plain B-tree. A <em>partial</em>{" "}index on the rare value (<code>WHERE is_deleted = false</code> when only 1% are deleted) can be tiny and great. Same data, very different index design.
        </p>

        <h3>Postgres index types beyond B-tree</h3>
        <p>
          B-tree is the default and serves equality + range queries on ordinary columns. For other shapes, Postgres has specialized index types:
        </p>
        <ul>
          <li><strong>GIN (Generalized Inverted Index).</strong>{" "}For columns where each row has many values: full-text (<code>tsvector</code>), JSONB, arrays. The index maps each value to the list of rows containing it. Slow to build, slow to update, fast to query for &quot;contains&quot; semantics.</li>
          <li><strong>GiST (Generalized Search Tree).</strong>{" "}A framework for tree indexes over types where ordering is non-trivial: geometry (PostGIS), ranges, full-text with rank ordering. Use when you&apos;re doing nearest-neighbor or geometric containment queries.</li>
          <li><strong>BRIN (Block Range Index).</strong>{" "}Stores summaries of value ranges per block of pages. Tiny on disk (megabytes for a billion-row table). Useful when data is naturally clustered in insertion order — typical for time-series. Trade: less precise than B-tree, but the size advantage is enormous.</li>
          <li><strong>Hash.</strong>{" "}Equality only, no range. Rarely worth it over B-tree in modern Postgres.</li>
        </ul>

        <CodeBlock lang="plain" caption="Picking the right index type">{`-- Full-text search on article body
CREATE INDEX idx_articles_search
  ON articles USING GIN (to_tsvector('english', body));

-- Geo: nearest restaurant to a point
CREATE INDEX idx_restaurants_geo
  ON restaurants USING GIST (location);

-- Time-series: 2 billion event rows, queries by time range
CREATE INDEX idx_events_ts
  ON events USING BRIN (created_at)
  WITH (pages_per_range = 32);

-- JSONB: arbitrary attribute lookups
CREATE INDEX idx_products_attrs
  ON products USING GIN (attrs);`}</CodeBlock>

        <h3>Spring Data + JPA: indexes from the application side</h3>
        <p>
          With Spring Data JPA, you&apos;ll most often define indexes via <code>@Index</code> annotations or in Flyway/Liquibase migrations. The annotation generates a CREATE INDEX in your schema export but doesn&apos;t change runtime behavior — the planner uses whatever indexes exist on the live database.
        </p>
        <CodeBlock lang="java" caption="Order entity with composite index">{`@Entity
@Table(
  name = "orders",
  indexes = {
    // Composite for the hot lookup: most-selective column first
    @Index(name = "idx_orders_user_created", columnList = "user_id, created_at"),
    // Status filter
    @Index(name = "idx_orders_status", columnList = "status")
  }
)
public class Order {
  @Id @GeneratedValue
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private String status;
  // ... other fields
}`}</CodeBlock>
        <p>
          Real Postgres-specific features (partial indexes with <code>WHERE</code>, <code>INCLUDE</code> clauses, GIN/GiST/BRIN) aren&apos;t expressible via the JPA annotation. Use Flyway migrations for those. The JPA-generated DDL is a starting point for new tables, not a replacement for owning your schema.
        </p>

        <Callout variant="spring" title="Don't fight Hibernate's query plan">
          <p className="m-0">A common Spring gotcha: a query that runs fine in psql is slow through Hibernate. The fix is usually one of: (1) <code>@Query(nativeQuery = true)</code> for the cases where JPQL generates pathological SQL, (2) make sure the query hits a real index — JPQL <code>findByXxxIn(...)</code> with a 10k-element list will not use indexes the way you hope, and (3) check that connection pool settings don&apos;t mask the actual query timing in your monitoring.</p>
        </Callout>

        <h3>Anti-patterns to memorize</h3>
        <ul>
          <li><strong>Indexing every column.</strong>{" "}Each index = write amplification. Audit regularly; drop indexes with zero scans.</li>
          <li><strong>Wrong column order in composite indexes.</strong>{" "}Most-selective equality first, range last. <code>(status, created_at)</code> ≠ <code>(created_at, status)</code>.</li>
          <li><strong>Indexing a low-selectivity column with B-tree.</strong>{" "}Boolean columns and small enums rarely benefit. Use partial indexes for the rare value.</li>
          <li><strong>Forgetting that <code>LIKE &apos;%foo%&apos;</code> can&apos;t use a B-tree.</strong>{" "}Leading wildcards defeat ordering. Use GIN with <code>pg_trgm</code> for substring search, or move full-text to Elasticsearch (search-systems module is coming up).</li>
          <li><strong>Over-INCLUDE in covering indexes.</strong>{" "}Each included column inflates the index. A 1 KB-per-row covering index across a 5M-row table costs gigabytes; weigh that vs. the heap fetch you saved.</li>
          <li><strong>Creating indexes during a release.</strong> <code>CREATE INDEX</code> takes a strong lock; use <code>CREATE INDEX CONCURRENTLY</code> on production tables. (Real outage source.)</li>
        </ul>

        <Quiz
          question="A 500M-row events table is queried mostly as WHERE created_at BETWEEN ? AND ?. Data is inserted in (roughly) time order. Which index type is the best fit and why?"
          options={[
            { label: "BRIN on created_at — data is clustered in insertion order, BRIN's per-block summaries are accurate, and the index is tiny (megabytes vs gigabytes for a B-tree on 500M rows). Range queries can quickly skip blocks that don't contain the time range.", correct: true, explanation: "Right. BRIN exploits exactly this property: physical ordering aligned with the indexed column. The index is roughly 1000x smaller than the equivalent B-tree, and range queries are nearly as fast because the planner skips entire blocks. Time-series tables are the canonical BRIN use case." },
            { label: "GIN on created_at.", explanation: "GIN is for multi-valued columns (arrays, JSONB, full-text). created_at is a single scalar — GIN would work but be enormous and pointless." },
            { label: "B-tree on created_at — always the default.", explanation: "Defensible, but on 500M rows a B-tree is gigabytes vs. BRIN's megabytes, with similar performance for range queries on time-clustered data. BRIN is the better choice when ordering holds." },
            { label: "Hash on created_at.", explanation: "Hash indexes don't support range queries — they only do equality. Useless for BETWEEN." },
          ]}
          hint="What's special about how time-series data is physically laid out?"
          xp={7}
        />

        <Quiz
          question="A table has columns (id, status, region, created_at). Hot query is WHERE status = 'pending' AND region = 'us-west' ORDER BY created_at LIMIT 50. Which composite index is best?"
          options={[
            { label: "(status, region, created_at) — equality columns first (status, region), range/sort column last. The index serves the WHERE, the ORDER BY, and the LIMIT in one walk.", correct: true, explanation: "Right. Composite indexes serve queries left-to-right: equality on the leading columns lets you descend to the right subtree, and the trailing column gives you the order for free. ORDER BY + LIMIT terminates after 50 leaf entries — no sort node, no table scan." },
            { label: "(created_at, status, region) — sort column first.", explanation: "Wrong direction. With created_at leading, the index is sorted by time across all statuses and regions, so you can't descend to (status='pending', region='us-west') quickly." },
            { label: "Three single-column indexes — let the planner BitmapAnd them.", explanation: "BitmapAnd works but is strictly worse: more I/O, no order benefit, can't terminate at LIMIT. The composite wins." },
            { label: "(status, created_at, region) — put the sort column in the middle.", explanation: "Putting the range/sort column in the middle breaks the contiguous-scan property. The trailing column has to be the one you order by; equality columns first." },
          ]}
          hint="Equality columns first, range/order column last."
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Each index costs writes. Earn each one. Pick the index type that fits the column shape, not the default."
          points={[
            { takeaway: "Indexes amplify writes", detail: "Every secondary index = another tree updated on each write. 6 indexes can cut insert throughput by 3-4x. Audit and drop unused ones." },
            { takeaway: "Selectivity decides usefulness", detail: "Index helps when the query returns a small fraction of rows. Low-selectivity columns (booleans, small enums) rarely benefit from a plain B-tree; partial indexes can fix that." },
            { takeaway: "Pick the type for the column shape", detail: "B-tree for ordinary; GIN for full-text/JSONB/arrays; GiST for geo/ranges; BRIN for time-clustered series. Wrong type = wasted index." },
            { takeaway: "Composite column order is load-bearing", detail: "Equality columns first (most selective first), range/sort columns last. (a,b) doesn't serve WHERE b=? alone." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Beyond a single node</h2>
        <p>
          Indexing is what makes a query fast on one machine. The next question is how to keep it fast when one machine isn&apos;t enough — when the data outgrows a single node, or the write rate outgrows what one primary can absorb. That&apos;s partitioning and sharding, the next module. After that, replication, caching, and search round out Phase 2.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Partitioning and sharding. Hash, range, directory; consistent hashing with virtual nodes; the resharding problem nobody warns you about.
        </p>
        <Link
          href="/courses/system-design/modules/partitioning-sharding"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Partitioning &amp; sharding →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="indexing-deep" />
    </article>
  );
}
