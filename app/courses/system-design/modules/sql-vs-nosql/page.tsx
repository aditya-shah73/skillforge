import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "oltp-olap", title: "The OLTP/OLAP split is the real first question" },
  { id: "nosql-families", title: "The four NoSQL families and when each wins" },
  { id: "postgres-default", title: "Why 'we use Postgres' covers 80% of cases" },
];

const oltpOlapDiagram = `flowchart LR
  subgraph OLTP["OLTP — many small txns"]
    A1[user clicks Buy] --> A2[INSERT order, UPDATE stock]
    A2 --> A3[< 10ms response]
  end
  subgraph OLAP["OLAP — few huge scans"]
    B1[analyst writes SQL] --> B2[SCAN 9 months of orders]
    B2 --> B3[GROUP BY region, agg]
    B3 --> B4[returns in seconds-minutes]
  end
  style OLTP fill:#dbeafe,stroke:#2563eb
  style OLAP fill:#fef3c7,stroke:#d97706`;

export default function Page() {
  const mod = getModuleBySlug("sql-vs-nosql")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="sql-vs-nosql" />
        <ModuleProgress moduleSlug="sql-vs-nosql" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🗃️</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A real decision framework for &quot;SQL or NoSQL.&quot; The answer is almost never &quot;NoSQL.&quot; You&apos;ll learn why, and the narrow set of cases where it actually is.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Why OLTP vs OLAP is the question to ask <em>before</em> SQL vs NoSQL</li>
          <li>The four NoSQL families and the genuine workload shape that picks each</li>
          <li>Why Postgres + JSONB + partial indexes covers most &quot;we need NoSQL&quot; cases</li>
          <li>The narrow cliff where Postgres actually breaks — and what to reach for</li>
        </ul>
      </section>

      <section>
        <h2>The bumper sticker is wrong (again)</h2>
        <p>
          &quot;SQL doesn&apos;t scale, NoSQL does.&quot; You&apos;ve heard it. It is, almost word-for-word, wrong. SQL databases run banks, airlines, Stripe&apos;s ledger, and the GitHub event firehose. NoSQL databases regularly fall over at modest scale when picked for the wrong workload. The framing is bad.
        </p>
        <p>
          Here&apos;s a better framing. Storage choices are about three things, in this order:
        </p>
        <ol>
          <li><strong>What shape is your workload?</strong> Many small transactions (OLTP), or few huge scans (OLAP)? This is the dividing line.</li>
          <li><strong>What shape is your data?</strong> Relational rows, deeply nested documents, time series, graphs of relationships, or just key-value lookups?</li>
          <li><strong>What scale do you actually need?</strong> Most teams overestimate this by 10–100x.</li>
        </ol>
        <p>
          SQL vs NoSQL is downstream of those answers. We&apos;re going to work through them in order.
        </p>
      </section>

      <Checkpoint moduleSlug="sql-vs-nosql" id="oltp-olap" title="Part 1 · The OLTP/OLAP split is the real first question" xp={25}>
        <h2>OLTP vs OLAP: two completely different jobs</h2>
        <p>
          Before you ask &quot;SQL or NoSQL?&quot;, answer this: is your workload <strong>transactional</strong> (OLTP) or <strong>analytical</strong> (OLAP)? They demand different storage shapes, and confusing them is the source of most bad database picks.
        </p>

        <Mermaid chart={oltpOlapDiagram} />

        <h3>OLTP — Online Transactional Processing</h3>
        <p>
          Lots of small, point operations. A user clicks &quot;Buy,&quot; you <code>INSERT</code> an order row, <code>UPDATE</code> stock, <code>INSERT</code> a payment record. Each transaction touches a handful of rows. The system is doing thousands of these per second. The latency budget is small (single-digit to tens of milliseconds). You need ACID — partial writes are catastrophic.
        </p>
        <p>
          Storage shape: <strong>row-oriented</strong>. Rows for one entity live next to each other on disk so a single SELECT-by-id is one I/O. Indexed by primary key + a handful of high-traffic secondary indexes. B-tree underneath. Examples: Postgres, MySQL, Oracle, SQL Server, CockroachDB.
        </p>

        <h3>OLAP — Online Analytical Processing</h3>
        <p>
          Few queries, but each one scans a lot. &quot;Total revenue by region by week for the last 9 months.&quot; The query touches millions or billions of rows but only reads two or three columns. Latency budget is seconds-to-minutes. Concurrency is low — analysts and dashboards, not end-user requests. Writes are batchy: bulk-load nightly or stream from a CDC pipeline.
        </p>
        <p>
          Storage shape: <strong>column-oriented</strong>. All values for one column live together so you can scan just the columns you need and skip the rest. Compressed heavily (one column = one type = great compression). No row-level updates — you append batches and use partition pruning. Examples: Snowflake, BigQuery, Redshift, ClickHouse, DuckDB.
        </p>

        <Callout variant="insight" title="The 100x reason columnar wins for OLAP">
          <p className="m-0">A row-store reads every column of every row matching the WHERE clause, even when the SELECT only needs 3 of 50 columns. A column store reads only the 3 columns. That alone is often a 10x I/O reduction. Add column compression (zstd on a column of repeated country codes can hit 20:1) and you get the 100x speedups people associate with &quot;analytics databases.&quot; Same SQL, totally different physical layout.</p>
        </Callout>

        <h3>The mistake that started the &quot;NoSQL&quot; hype</h3>
        <p>
          A lot of the early NoSQL pitch — &quot;your relational database can&apos;t scan 100M rows fast enough!&quot; — was actually about OLAP workloads being run on OLTP databases. Of course Postgres struggles at full-table aggregations on a billion rows; that&apos;s not what its physical layout is for. The right answer was &quot;use a columnar warehouse,&quot; not &quot;use Cassandra.&quot;
        </p>
        <p>
          Today the lines are clean: OLTP keeps your live application data; an analytics warehouse (Snowflake, BigQuery, ClickHouse) is loaded periodically from it via CDC or batch ETL. Two different stores for two different jobs.
        </p>

        <h3>The hybrid: HTAP</h3>
        <p>
          Some systems try to do both — TiDB, SingleStore, Spanner with column store, Postgres with Citus column extensions. They&apos;re called HTAP (Hybrid Transactional/Analytical Processing). They generally trade off some peak performance on each axis for the convenience of one system. Useful in some places, but the conventional pattern (OLTP + warehouse + a pipe between them) is still the default.
        </p>

        <Quiz
          question="A team complains that Postgres is 'too slow' because their nightly report query — full table scan over a 200M row orders table — takes 18 minutes. Which is the right diagnosis?"
          options={[
            { label: "It's an OLAP query running on an OLTP database. Move the report to a columnar warehouse loaded from Postgres via CDC; keep Postgres for the transactional workload.", correct: true, explanation: "Right. Row-stores read all columns of every matching row even if you SELECT only 3. A columnar warehouse will do that report in seconds. This isn't a Postgres problem — it's a wrong-tool problem." },
            { label: "Postgres can't handle 200M rows. They should switch to MongoDB.", explanation: "Postgres handles 200M rows fine for OLTP. MongoDB is also row/document-shaped and would be no better for big aggregation scans." },
            { label: "Add an index on every column in the WHERE clause.", explanation: "An index helps point lookups and small range scans. Full-table aggregations need to read the whole table; an index doesn't speed that up." },
            { label: "Shard Postgres across 16 nodes.", explanation: "Sharding helps when you can route most queries to one shard. A full-table aggregation just becomes a 16-way scatter-gather — same total work, more coordination overhead." },
          ]}
          hint="What's the physical layout difference between row-stores and column-stores?"
          xp={7}
        />

        <Quiz
          question="Which of these is squarely OLAP?"
          options={[
            { label: "An analyst running 'SELECT region, SUM(amount) FROM orders WHERE created_at > now() - interval ''9 months'' GROUP BY region' once an hour.", correct: true, explanation: "Few queries, each one scans a huge slice of history, reads few columns, low concurrency. Textbook OLAP. Belongs in a warehouse, not your live OLTP DB." },
            { label: "A REST endpoint that returns a single user's profile by id, called 5,000 times per second.", explanation: "Tiny point lookups at high concurrency — that's pure OLTP." },
            { label: "A 'Buy now' button that writes a payment row, an order row, and decrements stock atomically.", explanation: "Multi-row ACID transaction with strict latency. Classic OLTP." },
            { label: "A WebSocket pushing 1,000 chat messages per second to active users.", explanation: "Streaming/messaging workload — neither OLTP nor OLAP. Different storage shape entirely (more on this in the messaging modules)." },
          ]}
          hint="Look at how many rows the query reads vs how many it returns."
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="OLTP vs OLAP is the first storage question. They demand different physical layouts. The right answer is usually 'both, with a pipe between them.'"
          points={[
            { takeaway: "OLTP = many small, latency-sensitive txns", detail: "Row-oriented, B-tree-indexed, ACID. Postgres, MySQL, Oracle, CockroachDB. Tens of ms p99." },
            { takeaway: "OLAP = few huge scans, columnar, compressed", detail: "Column-oriented, batch-loaded, no row updates. Snowflake, BigQuery, Redshift, ClickHouse, DuckDB." },
            { takeaway: "Most 'SQL doesn't scale' complaints are OLAP-on-OLTP", detail: "Postgres isn't slow at 200M rows for OLTP; it's slow at full-table aggregations because that's not its physical layout." },
            { takeaway: "Default architecture: OLTP + warehouse + CDC", detail: "Run live app on Postgres/MySQL. Stream changes (Debezium, native CDC) into Snowflake/BigQuery for analytics. Two stores, two jobs." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="sql-vs-nosql" id="nosql-families" title="Part 2 · The four NoSQL families and when each wins" xp={25}>
        <h2>&quot;NoSQL&quot; is four very different things</h2>
        <p>
          Calling something &quot;NoSQL&quot; is about as informative as calling it &quot;not-Italian food.&quot; The category is huge and the members have almost nothing in common. There are four real families, and each one fits a specific workload shape.
        </p>

        <h3>Family 1: Document stores</h3>
        <p>
          <strong>Examples:</strong> MongoDB, DynamoDB (used as a document store), Couchbase, Firestore.
        </p>
        <p>
          The data model is a JSON-ish document. Each document can have its own shape. You query by id (fast) or by a secondary index on a field path (slower, requires planning).
        </p>
        <p>
          <strong>When it wins:</strong>
        </p>
        <ul>
          <li>Your data is genuinely nested and the access pattern is &quot;fetch the whole thing.&quot; Product catalog with variants, configurations, images. CMS pages. Game player state.</li>
          <li>The schema is variable across instances and that variability is a product requirement, not just laziness — different vendors&apos; products have different attributes, for instance.</li>
          <li>You don&apos;t need to do many cross-document joins. Document stores are bad at joins. If your access pattern is &quot;get user, get their orders, get the items in those orders, get reviews,&quot; you&apos;ll fight the database.</li>
        </ul>
        <p>
          <strong>When teams pick it for the wrong reasons:</strong> &quot;We don&apos;t want to write migrations.&quot; You will. The schema lives somewhere — either in your database or in your application code, and now it&apos;s the latter, with no enforcement and silently broken old documents lurking forever.
        </p>

        <h3>Family 2: Wide-column stores</h3>
        <p>
          <strong>Examples:</strong> Cassandra, ScyllaDB, HBase, BigTable.
        </p>
        <p>
          Confusingly named — these are not the same as columnar OLAP databases. The data model is a sparse 2D map: row key → column family → column name → value. They&apos;re built around <strong>massive write throughput</strong> and <strong>linear horizontal scalability</strong> with tunable consistency. The trade is that queries must be designed around the partition key — cross-partition queries are scatter-gather and slow.
        </p>
        <p>
          <strong>When it wins:</strong>
        </p>
        <ul>
          <li>Time-series and event data at scale: hundreds of thousands of writes/sec, terabytes-to-petabytes total. Metrics ingestion, IoT sensor data, audit logs, user activity streams.</li>
          <li>You need multi-region active-active with tunable consistency per query. Cassandra was literally designed for this.</li>
          <li>Access patterns are predictable and partition-friendly: &quot;give me events for user X in the last 24 hours&quot; is great, &quot;find users matching this filter&quot; is terrible.</li>
        </ul>
        <p>
          <strong>When teams pick it for the wrong reasons:</strong> &quot;It&apos;ll scale.&quot; You probably don&apos;t need 100k writes/sec. Operating Cassandra well is a specialty role at most companies, and a poorly-designed partition key (hot partitions, unbounded growth) ruins your day in production.
        </p>

        <h3>Family 3: Graph databases</h3>
        <p>
          <strong>Examples:</strong> Neo4j, Amazon Neptune, JanusGraph, Memgraph.
        </p>
        <p>
          Nodes and edges as first-class citizens. Indexed for fast traversal — &quot;walk from this user, follow knows edges 3 hops out, filter by node property&quot; runs in time proportional to the result, not the graph size.
        </p>
        <p>
          <strong>When it wins:</strong>
        </p>
        <ul>
          <li>Your queries are inherently multi-hop traversals. Friend-of-friend recommendations. Fraud detection (find rings of accounts connected through shared payment methods). Knowledge graphs.</li>
          <li>The relationships <em>are</em> the product, not metadata. LinkedIn&apos;s &quot;you&apos;re connected to X through Y who knows Z.&quot;</li>
        </ul>
        <p>
          <strong>When teams pick it for the wrong reasons:</strong> &quot;Our data has relationships.&quot; All data has relationships. Postgres handles 2-hop joins fine; graph databases earn their place at 3+ hops at scale, where SQL joins fall off a cliff.
        </p>

        <h3>Family 4: Key-value stores</h3>
        <p>
          <strong>Examples:</strong> Redis, Memcached, DynamoDB (used as KV), etcd, RocksDB.
        </p>
        <p>
          The simplest model: <code>get(key)</code>, <code>set(key, value)</code>. No queries beyond the key. The trade for that simplicity is enormous: in-memory KV stores can do millions of ops/sec from a single node, microseconds-per-op.
        </p>
        <p>
          <strong>When it wins:</strong>
        </p>
        <ul>
          <li>Caches in front of a slower system of record (the most common usage by far).</li>
          <li>Sessions, ephemeral state, rate-limiter counters, leaderboards (Redis sorted sets), pub-sub fanout.</li>
          <li>Anywhere the access pattern is genuinely &quot;by key&quot; — a coordinator&apos;s lock table, a feature flag store, a job queue.</li>
        </ul>
        <p>
          <strong>When teams pick it for the wrong reasons:</strong> Treating Redis as a primary database. We&apos;ll devote a whole module to that one — the short version is that Redis is excellent at being a cache and dangerous as a system of record. Distributed cache deep dive coming up.
        </p>

        <Callout variant="warn" title="The wrong-reasons pattern">
          <p className="m-0">Notice the recurring theme. Each NoSQL family has a real reason to exist — a workload shape SQL serves badly. And each family also has a popular wrong reason teams adopt it: &quot;flexible schema&quot; (you still need a schema), &quot;it scales&quot; (you don&apos;t need that scale yet), &quot;our data has relationships&quot; (so does everyone&apos;s). When you pick NoSQL for a wrong reason, you trade SQL&apos;s strengths — joins, transactions, mature tooling, query planner — for nothing.</p>
        </Callout>

        <h3>The decision matrix</h3>
        <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">Document</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">Nested data, fetch-the-whole-thing access, low join needs.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">MongoDB, DynamoDB, Couchbase.</div>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">Wide-column</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">Massive write throughput, partition-shaped queries, multi-region.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Cassandra, ScyllaDB, HBase, BigTable.</div>
          </div>
          <div className="rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 p-4">
            <div className="font-bold text-violet-700 dark:text-violet-300 mb-1">Graph</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">3+ hop traversals are the queries, not metadata.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Neo4j, Neptune, JanusGraph.</div>
          </div>
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-4">
            <div className="font-bold text-rose-700 dark:text-rose-300 mb-1">Key-value</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">Pure get-by-key, hot path, microsecond latency.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Redis, Memcached, DynamoDB-as-KV.</div>
          </div>
        </div>

        <Quiz
          question="A team is building a fraud-detection service. The core query is 'starting from a flagged account, walk all shared-device, shared-payment-method, and shared-IP edges 4 hops out and find clusters with more than 5 nodes.' Which storage family fits best?"
          options={[
            { label: "Graph (Neo4j or similar). Multi-hop traversals at depth 4 across millions of accounts is exactly what graph databases are indexed for; the same query in SQL becomes a chain of self-joins that explodes combinatorially.", correct: true, explanation: "Right. The relationship traversal is the query, not metadata. SQL handles 1-2 hop joins fine, but each hop multiplies cost; at 4 hops over millions of nodes, the planner can't help you. Graph databases store edges as direct pointers, so traversal cost scales with the result, not the data size." },
            { label: "Wide-column (Cassandra). Built for scale and high throughput.", explanation: "Cassandra is great for partition-shaped writes, terrible for cross-partition relationship traversal. Nothing about the query is partition-friendly." },
            { label: "Document (MongoDB) — store each account with embedded relationships.", explanation: "Embedding a graph in documents means duplicating data on every edge update and still doing application-side traversal. It works for shallow queries; 4-hop traversal is the wrong shape." },
            { label: "Key-value (Redis). Cache the connections.", explanation: "KV is for known keys. The query is 'discover the cluster' — you don't know the keys you'll visit ahead of time." },
          ]}
          hint="Count the hops and ask which family stores edges as first-class citizens."
          xp={7}
        />

        <Quiz
          question="Which is a 'wrong reason' to pick MongoDB?"
          options={[
            { label: "'Our schema changes weekly and we don't want to write migrations.'", correct: true, explanation: "Your schema still exists — it's just no longer enforced by the database. Now broken old documents from three releases ago silently coexist with new ones, and your application code accumulates ' if doc.has(field_v3) ' guards forever. You don't escape the schema; you just hide it." },
            { label: "'Our product entities have variable, deeply nested attributes per vendor and we always fetch the whole product blob at once.'", explanation: "This is a legitimately good fit. Variable shape across instances and the 'fetch the whole thing' access pattern is what document stores are for." },
            { label: "'We need to support hierarchical CMS content where each page can embed nested blocks of arbitrary depth.'", explanation: "Genuinely nested, denormalized, fetch-by-id. Document store fits well." },
            { label: "'Our players' game state is a JSON blob keyed by player_id and we read/write the whole blob each tick.'", explanation: "Pure document access pattern. MongoDB or DynamoDB as document store both fit." },
          ]}
          hint="Think about whether the reason is about the data shape or about avoiding work."
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Four NoSQL families, four different reasons to exist. Match the family to the workload shape, not to the hype."
          points={[
            { takeaway: "Document = nested, fetch-whole, low-join", detail: "MongoDB, DynamoDB, Couchbase. Wins for product catalogs, CMS, game state. Loses badly when access pattern is multi-entity joins." },
            { takeaway: "Wide-column = write-throughput at scale", detail: "Cassandra, ScyllaDB, HBase. Wins for time-series, IoT, audit logs at 100k+ writes/sec with partition-shaped queries. Operationally heavy." },
            { takeaway: "Graph = 3+ hop traversal at scale", detail: "Neo4j, Neptune. Wins where relationships ARE the query: fraud rings, recommendations, knowledge graphs. SQL handles 1-2 hops fine." },
            { takeaway: "KV = pure get-by-key, microsecond latency", detail: "Redis, Memcached. Mostly used as caches in front of a real DB. Dangerous as a system of record." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="sql-vs-nosql" id="postgres-default" title="Part 3 · Why 'we use Postgres' covers 80% of cases" xp={25}>
        <h2>The boring answer is right surprisingly often</h2>
        <p>
          Most product teams reach for NoSQL when they should reach for Postgres with a few extensions. Postgres has spent the last decade absorbing the &quot;NoSQL&quot; feature set: JSONB columns with indexed paths, full-text search, geospatial via PostGIS, time-series via TimescaleDB, vector via pgvector, columnar via Citus. The result is a single mature database that does most of what teams reach for separate stores to do.
        </p>

        <h3>JSONB: the document store you already have</h3>
        <p>
          Postgres&apos;s <code>jsonb</code> column type is a binary-encoded JSON document, with GIN indexes that let you query path expressions efficiently. You get document flexibility on the columns that need it, plus relational integrity on the columns that don&apos;t.
        </p>
        <CodeBlock lang="plain" caption="Postgres JSONB — the 'we need MongoDB' case, mostly solved">{`-- Hybrid table: relational columns + a JSONB blob for variable attributes
CREATE TABLE products (
  id           BIGSERIAL PRIMARY KEY,
  vendor_id    BIGINT NOT NULL REFERENCES vendors(id),
  sku          TEXT NOT NULL,
  price_cents  INT NOT NULL,
  attrs        JSONB NOT NULL DEFAULT '{}'
);

-- GIN index for arbitrary key/value lookups inside attrs
CREATE INDEX idx_products_attrs ON products USING GIN (attrs);

-- Find blue size-large shirts:
SELECT * FROM products
WHERE attrs @> '{"color":"blue","size":"L"}';

-- And you still get a real foreign key, real transactions, real joins:
SELECT p.*, v.name
FROM products p JOIN vendors v ON v.id = p.vendor_id
WHERE p.attrs ->> 'category' = 'apparel';`}</CodeBlock>

        <h3>Partial indexes: the indexing trick most teams don&apos;t know</h3>
        <p>
          Postgres lets you index a <em>subset</em> of rows. If 99% of queries hit a tiny slice of the data (active orders, current sessions, undeleted records), a partial index is faster, smaller, and cheaper to maintain than a full one.
        </p>
        <CodeBlock lang="plain" caption="Partial index — only rows that matter to this query">{`-- 200M total orders, but only ~50k 'open' at any moment
CREATE INDEX idx_orders_open ON orders (user_id, created_at)
WHERE status = 'open';

-- Plan uses the partial index; it's tiny and fast
SELECT * FROM orders
WHERE status = 'open' AND user_id = 12345
ORDER BY created_at DESC LIMIT 20;`}</CodeBlock>

        <h3>Spring + Postgres: the boring stack that mostly wins</h3>
        <p>
          Spring Data JPA gives you ORM ergonomics; <code>JdbcTemplate</code> stays right next to it for the queries where you need control. Postgres-specific features (JSONB, arrays, full-text) are accessible through both.
        </p>
        <CodeBlock lang="java" caption="ProductRepository.java — Spring Data + JSONB query">{`@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

  // JPQL with native fragment for JSONB containment
  @Query(value = """
      SELECT * FROM products
      WHERE vendor_id = :vendorId
        AND attrs @> CAST(:attrs AS JSONB)
      ORDER BY price_cents
      LIMIT :limit
      """, nativeQuery = true)
  List<Product> findByVendorAndAttrs(
      @Param("vendorId") long vendorId,
      @Param("attrs") String attrsJson,
      @Param("limit") int limit
  );
}

// Caller — pass JSON for the variable attrs portion
List<Product> blueShirts = repo.findByVendorAndAttrs(
    42L, "{\\"color\\":\\"blue\\",\\"size\\":\\"L\\"}", 50);`}</CodeBlock>

        <Callout variant="spring" title="The 'just use Postgres' philosophy">
          <p className="m-0">A common senior pattern: start every new service with Postgres. If you genuinely outgrow it on a specific axis (write throughput, query type, scale), introduce a specialized store next to Postgres for that axis. You&apos;ll usually find Postgres handles more than you&apos;d expect — single instances comfortably do tens of thousands of QPS with proper indexing, and a primary + read replicas takes you another 10x.</p>
        </Callout>

        <h3>The cliffs where Postgres actually breaks</h3>
        <p>
          Postgres has real limits. They&apos;re higher than most teams think, but they exist. The honest list:
        </p>
        <ul>
          <li><strong>Write throughput &gt;~50k QPS sustained on one node.</strong> Postgres&apos;s WAL is single-stream. You can&apos;t scale writes by adding read replicas. Sharding (Citus, Vitess for MySQL, or hand-rolled) gets you past this, but at a real complexity cost.</li>
          <li><strong>Multi-region active-active with low latency.</strong> Postgres native replication is leader-follower; multi-master extensions exist (BDR) but with caveats. If you genuinely need writes accepted in 5+ regions with sub-100ms latency from each, you&apos;re looking at Spanner, CockroachDB, or Cassandra-class systems.</li>
          <li><strong>Truly schemaless data as a product requirement.</strong> JSONB covers a lot, but if you&apos;re ingesting a billion documents/day from an unbounded set of upstream schemas (think security event ingestion), document or wide-column stores fit better.</li>
          <li><strong>Petabyte-scale time series.</strong> TimescaleDB stretches Postgres impressively far, but at the deep end (1B+ events/day, multi-petabyte storage), specialized stores (Cassandra, ClickHouse, InfluxDB) win.</li>
          <li><strong>Graph traversal at depth 4+.</strong> Postgres can do recursive CTEs, but performance falls off a cliff. Real graph workloads need a graph DB.</li>
        </ul>

        <Callout variant="info" title="A useful question to gate the decision">
          <p className="m-0">When someone says &quot;we need NoSQL,&quot; ask: &quot;What is Postgres specifically not doing for you?&quot; If the answer is a real number (&quot;we&apos;re doing 80k writes/sec sustained on a single primary&quot;), it&apos;s a real reason. If the answer is &quot;our schema changes&quot; or &quot;it doesn&apos;t scale,&quot; it&apos;s usually not.</p>
        </Callout>

        <h3>The matching exercise</h3>
        <ClassifyChallenge
          title="Pick the right storage tier for each workload"
          prompt="There's sometimes more than one defensible answer. Pick the most direct fit."
          buckets={[
            { id: "postgres", label: "Postgres (or similar OLTP RDBMS)", color: "indigo" },
            { id: "warehouse", label: "Columnar warehouse (Snowflake / ClickHouse)", color: "amber" },
            { id: "wide-col", label: "Wide-column (Cassandra / ScyllaDB)", color: "rose" },
            { id: "document", label: "Document store (MongoDB / DynamoDB)", color: "emerald" },
            { id: "graph", label: "Graph database (Neo4j)", color: "violet" },
            { id: "kv", label: "Key-value (Redis / DynamoDB-as-KV)", color: "sky" },
          ]}
          items={[
            { id: "orders", label: "E-commerce orders, payments, inventory — multi-row transactions, ~5k QPS, strict ACID, classic web app.", answer: "postgres", explanation: "Textbook OLTP. Postgres handles this comfortably with read replicas. Sharding only enters if you grow another 10x." },
            { id: "metrics", label: "Per-second metrics ingestion across 200k servers — 800k writes/sec sustained, queried as 'last 24h for host X'.", answer: "wide-col", explanation: "Massive write throughput, partition-shaped reads (by host_id + time range), tunable consistency. Cassandra was built for exactly this." },
            { id: "exec-dash", label: "Daily executive dashboard — 'revenue by region by product line for the last 18 months,' loaded from a 4B-row orders archive.", answer: "warehouse", explanation: "Few queries, huge scans, low concurrency, columnar compression wins. Snowflake/BigQuery/ClickHouse with CDC from the OLTP store." },
            { id: "session", label: "User sessions for a web app — read on every request, written on login/logout, must survive a pod restart, ~50k QPS reads.", answer: "kv", explanation: "Pure get-by-key with sub-ms latency requirements. Redis is the standard answer; persistence enabled so a restart doesn't dump every session." },
            { id: "linkedin", label: "'You’re connected to X through Y who knows Z' — find paths up to 4 hops in a 500M-node professional network.", answer: "graph", explanation: "4-hop traversal at scale is what graph databases are indexed for. SQL falls off a cliff past 2-3 hops here." },
            { id: "cms-pages", label: "CMS for marketing pages — each page is a deeply-nested tree of content blocks (text, image, embed, custom), schema varies across page types, accessed by URL slug.", answer: "document", explanation: "Variable nested shape, fetch-the-whole-page access pattern, low join needs. Document store is a clean fit; Postgres + JSONB is also defensible if you want one DB." },
          ]}
        />

        <h3>The senior judgement</h3>
        <p>
          Three rules of thumb that hold up:
        </p>
        <ol>
          <li><strong>Default to Postgres.</strong> Then justify any departure with a concrete reason and a number.</li>
          <li><strong>Pick stores per <em>workload axis</em>, not per <em>service</em>.</strong> One service can use Postgres for the durable record, Redis for hot reads, Elasticsearch for free-text search, and a warehouse for analytics. That&apos;s normal.</li>
          <li><strong>Beware the &quot;single source of truth in a NoSQL store&quot; pitch.</strong> NoSQL stores often relax the kind of constraint you discover you needed. The cost of finding out is hours-long incidents and post-hoc reconciliation pipelines.</li>
        </ol>

        <Quiz
          question="A team says 'we picked DynamoDB because we need to scale to a billion users.' They have 50,000 active users and a roadmap that puts them at 5M in three years. What's the senior critique?"
          options={[
            { label: "They're optimizing for a scale they're nowhere near, paying the design cost (no joins, key-shape constrains all queries, no transactions across keys) for a feature they won't need for years — if ever.", correct: true, explanation: "Right. DynamoDB is excellent at the workload it's designed for — but its constraints cost real engineering time on day one. 5M users is a comfortable Postgres workload. If they hit 100M they can migrate or shard then. Building for hypothetical scale you don't have is one of the most reliable ways to slow yourself down." },
            { label: "DynamoDB doesn't actually scale to a billion users.", explanation: "DynamoDB does scale that far. The critique isn't that it doesn't work; it's that they don't need the trade-offs yet." },
            { label: "They should use MongoDB instead — it's better at scale.", explanation: "Same critique would apply. The issue isn't 'wrong NoSQL,' it's 'NoSQL for a workload that fits Postgres easily.'" },
            { label: "Postgres can't actually handle 5M users.", explanation: "5M users with reasonable per-user activity is well within single-primary Postgres + read replicas. Most apps you've used at that scale run on something boring." },
          ]}
          hint="What's the cost of buying a guarantee you don't need yet?"
          xp={7}
        />

        <Quiz
          question="You're starting a new service. Order data, ~10k writes/sec at peak, multi-row transactions required, the team is 4 Java engineers with Spring experience and zero NoSQL ops experience. What's the right default and why?"
          options={[
            { label: "Postgres. It handles 10k writes/sec on a properly-sized primary, gives you ACID transactions for free, and your team can hit the ground running. Re-evaluate the storage choice when you have a concrete reason Postgres isn't enough.", correct: true, explanation: "Right. The workload fits Postgres comfortably, ACID is a hard requirement (multi-row transactions), and team experience matters: a misconfigured Cassandra cluster will cost you more than a slightly over-provisioned Postgres instance. Default to boring." },
            { label: "Cassandra — it'll scale better when they grow.", explanation: "10k writes/sec is comfortably within Postgres. And Cassandra doesn't do multi-row transactions across partitions — you'd be giving up a hard requirement to avoid a problem you don't have." },
            { label: "MongoDB — JSON is more flexible.", explanation: "Order data is highly structured (line items, payments, addresses). Flexibility you don't need is friction, and you'd lose multi-document transactions in older versions or pay perf cost in newer ones." },
            { label: "DynamoDB — managed and infinitely scalable.", explanation: "DynamoDB constrains every query to the partition-key shape. Order systems usually need queries by user, by date range, by status — many shapes. Forcing all of them into DynamoDB GSIs is more cost and complexity than this team needs." },
          ]}
          hint="Match the workload, the requirement (ACID), and the team's expertise."
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Default to Postgres. Justify departures with real numbers. Pick storage per workload axis, not per service."
          points={[
            { takeaway: "Postgres absorbed most of NoSQL", detail: "JSONB + GIN indexes for documents, partial indexes, full-text search, PostGIS, TimescaleDB, pgvector. One DB, many workloads." },
            { takeaway: "Real Postgres limits exist but are high", detail: ">50k writes/sec sustained, true multi-region active-active, deep graph traversal, petabyte time-series. Below those, it usually wins." },
            { takeaway: "Per-workload storage is normal, not a smell", detail: "One service can use Postgres + Redis + Elasticsearch + a warehouse. Pick the right axis for each query type." },
            { takeaway: "Beware buying scale you don't have", detail: "DynamoDB / Cassandra-shaped trade-offs cost engineering time on day one. Don't pay for guarantees you won't need for years." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>What this module didn&apos;t cover</h2>
        <p>
          We classified storage by workload shape. We didn&apos;t go deep on what indexes actually do, why some queries are fast and others aren&apos;t, or how a B-tree differs from an LSM tree under the hood — that&apos;s the next module. After indexing, we&apos;ll get to partitioning, replication, caching, and search systems, which together make up Phase 2&apos;s storage layer.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Indexing deep dive. B-tree vs LSM, covering indexes, when an index helps, and when adding one quietly tanks your write throughput.
        </p>
        <Link
          href="/courses/system-design/modules/indexing-deep"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Indexing deep dive →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="sql-vs-nosql" />
    </article>
  );
}
