import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "why-vdb", title: "Why a vector database" },
  { id: "pgvector-setup", title: "pgvector setup & basics" },
  { id: "indexes", title: "HNSW vs IVFFlat" },
  { id: "project", title: "Project: duplicate issue detector" },
  { id: "final", title: "Final quiz" },
];

export default function PgvectorModule() {
  const mod = getModuleBySlug("pgvector")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
            Phase 3 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Vector DBs &amp; pgvector</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          When brute-force isn&apos;t cutting it, and you don&apos;t want a second database.
        </p>
        <ModuleProgress moduleSlug="pgvector" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          In Module 14 you indexed bookmarks in a <code>HashMap</code>. That works until it doesn&apos;t. Today
          you learn the standard production answer in the Spring/Java world: <strong>Postgres + pgvector</strong>.
          One database for both your business data and your vectors, with real ANN indexes underneath.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Why you&apos;d add a vector column to your existing Postgres instead of running Pinecone</li>
          <li>The two pgvector indexes — <strong>HNSW</strong> and <strong>IVFFlat</strong> — what each does, when each wins</li>
          <li>How to tune <code>m</code>, <code>ef_construction</code>, <code>ef_search</code>, <code>lists</code>, <code>probes</code> without flailing</li>
          <li>How &quot;recall&quot; gets reported, and how to measure it on your own data</li>
          <li>A working duplicate-issue detector — Spring Boot + Postgres + pgvector, indexed and queried</li>
        </ul>
      </section>

      {/* ================================================================= */}
      {/* PART 1: WHY A VECTOR DATABASE                                       */}
      {/* ================================================================= */}
      <section id="why-vdb">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — Why a vector database</h2>

        <p>
          You can &quot;do vector search&quot; with a <code>List&lt;float[]&gt;</code> in memory and a for-loop. Module 14
          proved it: thirty bookmarks, brute-force cosine, instant results. So when does that stop working?
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Three things break first</h3>

        <ol className="list-decimal pl-6 space-y-3">
          <li>
            <strong>Restart cost.</strong> Your in-memory store is empty when the JVM boots. With 100k vectors
            at 1024 dims, that&apos;s 400 MB to re-embed on every deploy — and a bill from your embedding
            provider every time.
          </li>
          <li>
            <strong>Query latency.</strong> Brute-force is O(N · d). At 1M vectors × 1024 dims, that&apos;s ~1B
            float multiplications per query. Even SIMD-accelerated, you&apos;re looking at hundreds of milliseconds
            per request and a CPU pegged at 100% under any real traffic.
          </li>
          <li>
            <strong>Joins.</strong> Your search results almost always need to be filtered or joined with other
            data — &quot;only bookmarks owned by this user&quot;, &quot;only issues in project X opened in the last 30 days&quot;.
            If your vectors live in one system and your business data in another, you&apos;re writing glue code
            forever.
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">The two answers</h3>

        <p>The industry split into two camps for solving this:</p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2"></th>
                <th className="text-left p-2">Dedicated vector DB</th>
                <th className="text-left p-2">Vector extension on existing DB</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Examples</td>
                <td className="p-2">Pinecone, Weaviate, Qdrant, Milvus</td>
                <td className="p-2"><strong>pgvector</strong> (Postgres), Redis vector, Mongo Atlas Vector</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Best at</td>
                <td className="p-2">Pure vector search at scale, multi-tenant isolation, hosted-service ergonomics</td>
                <td className="p-2">Hybrid filtering, transactional consistency with your app data</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Operational cost</td>
                <td className="p-2">Another piece of infra to run, monitor, back up, secure</td>
                <td className="p-2">Free if you already run Postgres</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Sweet spot</td>
                <td className="p-2">100M+ vectors, vector-first product</td>
                <td className="p-2">&lt; 50M vectors, vectors are a feature alongside other data</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="Why this course teaches pgvector">
          <p className="text-sm m-0">
            For 90% of the apps a Spring Boot team ships, the vectors are <em>secondary</em> to the actual
            domain — bookmarks belong to users, issues belong to projects, docs belong to spaces. You already
            have a Postgres for that. Adding <code>CREATE EXTENSION vector;</code> is a one-line change.
            Operating a second specialized database isn&apos;t.
          </p>
          <p className="text-sm m-0 mt-2">
            If you grow past pgvector&apos;s sweet spot, the migration to a dedicated DB is mostly mechanical
            (your embeddings don&apos;t change). Start where the friction is lowest.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="You're building search across a 5M-row product catalog where every query also needs to filter by tenant_id, in_stock, and category. Which approach has the least friction?"
          options={[
            { label: "Spin up Pinecone, send tenant_id as metadata, do post-filter in app code", explanation: "Works but you're now reasoning about two consistency models, paying for two systems, and post-filtering hurts recall (the index returns k candidates before your filter sees them)." },
            { label: "pgvector — write the filter in the same WHERE clause as the vector search", correct: true, explanation: "Hybrid filtering is exactly where colocating with Postgres wins. `WHERE tenant_id = ? AND in_stock = true ORDER BY embedding <=> ? LIMIT 10` is one query, transactionally consistent with the rest of your data." },
            { label: "Brute force in memory, sharded by tenant", explanation: "Works for tiny tenants, dies for large ones, and you've reinvented sharding for no good reason." },
            { label: "Whichever is fastest at pure vector search; filters don't matter much", explanation: "Filters matter a LOT — they're the difference between returning 'similar products globally' and 'similar products this user is allowed to see and that are in stock'." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Brute-force in-memory vector search dies on three axes. Industry settled into dedicated vector DBs vs. extensions on existing OLTP databases. For most Spring teams, the extension wins."
          points={[
            { takeaway: "Brute force breaks on restart cost, query latency, and joining with business filters.", detail: "All three hurt at different scales. Restart cost shows up at 100k vectors. Latency shows up at ~1M. Filter joins hurt from day one." },
            { takeaway: "Two industry answers: dedicated vector DBs vs. vector extensions.", detail: "Pinecone/Weaviate/Qdrant own the vector-first product space. pgvector / Redis vector / Mongo Atlas Vector own the 'vectors are one feature among many' space." },
            { takeaway: "pgvector's killer feature is hybrid filtering with the rest of your schema.", detail: "Most apps' search results need to respect ownership, status, dates. Doing that in one SQL query beats replicating filter columns into a separate vector store." },
          ]}
        />

        <Checkpoint moduleSlug="pgvector" id="why-vdb" title="Why a vector database" xp={20} celebration="You can defend the architecture choice. That's the hardest part of the day.">
          <p>
            You should be able to: name the three failure modes of in-memory brute force; explain when a
            dedicated vector DB earns its operational cost vs. when pgvector is the right answer; defend the
            choice in front of a skeptical teammate.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: PGVECTOR SETUP & BASICS                                     */}
      {/* ================================================================= */}
      <section id="pgvector-setup">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — pgvector setup &amp; basics</h2>

        <p>
          pgvector is a Postgres extension that adds a <code>vector</code> column type, distance operators,
          and ANN indexes. It&apos;s shipped with the official <code>pgvector/pgvector</code> Docker image, AWS
          RDS, Google Cloud SQL, Supabase, Neon, and most managed Postgres providers.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Local setup with Docker</h3>

        <CodeBlock lang="plain">{`# Run Postgres 16 with pgvector pre-installed
docker run --name pg-vec \\
  -e POSTGRES_PASSWORD=secret \\
  -p 5432:5432 \\
  -d pgvector/pgvector:pg16

# Connect and enable the extension
docker exec -it pg-vec psql -U postgres
postgres=# CREATE EXTENSION vector;
CREATE EXTENSION
postgres=# \\dx
                  List of installed extensions
  Name   | Version |   Schema   |         Description
---------+---------+------------+------------------------------
 vector  | 0.8.0   | public     | vector data type and ivfflat...`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">The vector column type</h3>

        <p>You declare a column with a fixed dimension. The DB enforces it on insert.</p>

        <CodeBlock lang="plain">{`CREATE TABLE bookmark (
  id          BIGSERIAL PRIMARY KEY,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  user_id     BIGINT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  embedding   vector(1536)         -- OpenAI text-embedding-3-small dimension
);`}</CodeBlock>

        <Callout variant="warn" title="The dimension is part of the schema">
          <p className="text-sm m-0">
            <code>vector(1536)</code> and <code>vector(3072)</code> are different types. Switching embedding
            models almost always means an <code>ALTER TABLE</code> + a re-embed of every row. Decide your model
            before you populate the table — or design for the migration explicitly (a second column, a backfill
            job, a feature flag for the cutover).
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">The three distance operators</h3>

        <p>
          pgvector exposes three distance operators. Pick the one that matches how your embedding model was
          trained.
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2">Operator</th>
                <th className="text-left p-2">Distance</th>
                <th className="text-left p-2">Use when</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2"><code>&lt;=&gt;</code></td>
                <td className="p-2">Cosine distance</td>
                <td className="p-2">Default for most LLM embeddings (OpenAI, Voyage, Cohere)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2"><code>&lt;-&gt;</code></td>
                <td className="p-2">L2 (Euclidean)</td>
                <td className="p-2">Some image / multimodal models trained with L2</td>
              </tr>
              <tr>
                <td className="p-2"><code>&lt;#&gt;</code></td>
                <td className="p-2">Negative inner product</td>
                <td className="p-2">When vectors are L2-normalized — fastest of the three</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="Inner product trick">
          <p className="text-sm m-0">
            If your vectors are L2-normalized (length = 1), inner product and cosine give the same ranking
            but inner product avoids a square root. OpenAI&apos;s embeddings are pre-normalized, so
            <code> &lt;#&gt; </code> is the cheapest correct choice. (The negative is because Postgres sorts
            ASC by default and inner product is a similarity, not a distance — so pgvector negates it.)
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Your first query</h3>

        <p>No index, no tuning — just the cosine operator over a sequential scan:</p>

        <CodeBlock lang="plain">{`-- Find the 5 bookmarks closest to a query embedding
SELECT id, title, embedding <=> '[0.012, -0.043, ..., 0.0007]' AS distance
FROM bookmark
WHERE user_id = 42
ORDER BY embedding <=> '[0.012, -0.043, ..., 0.0007]'
LIMIT 5;`}</CodeBlock>

        <p>
          Two things to notice. First, the vector literal is a plain Postgres array — pgvector parses it. In
          Spring you&apos;ll bind it with <code>setObject</code> or via Spring AI&apos;s
          <code>VectorStore</code>, which we&apos;ll get to. Second, the same expression appears in
          <code>SELECT</code> and <code>ORDER BY</code>. Postgres is smart enough to compute it once.
        </p>

        <Quiz
          kind="Pulse check"
          question="You're storing OpenAI text-embedding-3-small (1536d) vectors. Which operator gives the right ranking with the lowest CPU cost per comparison?"
          options={[
            { label: "<-> (L2 Euclidean)", explanation: "Different geometry. Won't give the same ranking as cosine on these embeddings." },
            { label: "<=> (cosine distance)", explanation: "Correct ranking, but for normalized vectors there's a cheaper correct option." },
            { label: "<#> (negative inner product)", correct: true, explanation: "OpenAI's embeddings are pre-normalized (length = 1). When that's true, cosine similarity and inner product produce the SAME ranking, but inner product skips the square root — cheapest correct choice. Pick <=> if you're not sure your vectors are normalized." },
            { label: "Doesn't matter — pgvector picks automatically", explanation: "It doesn't. The operator you use must match the operator class you indexed for." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 2 recap"
          gist="pgvector is just a column type and three distance operators. Pick the operator that matches how your model was trained and how your data is normalized."
          points={[
            { takeaway: "vector(N) is a typed column — N is part of the schema.", detail: "Switching embedding models means migrating the column. Plan for it." },
            { takeaway: "Three operators: <=> cosine, <-> L2, <#> inner product.", detail: "<=> is the safe default. <#> is faster on normalized vectors and gives the same ranking. <-> is for models trained with L2." },
            { takeaway: "The operator must match the index's operator class.", detail: "An HNSW built with vector_cosine_ops only accelerates <=> queries. Mixing them silently bypasses the index." },
          ]}
        />

        <Checkpoint moduleSlug="pgvector" id="pgvector-setup" title="pgvector setup & basics" xp={20} celebration="You can read pgvector SQL fluently. Time to make it fast.">
          <p>
            You should be able to: declare a vector column with the right dimension; pick the right distance
            operator for OpenAI / Voyage / Cohere embeddings; explain why <code>&lt;#&gt;</code> is faster than
            <code> &lt;=&gt;</code> for normalized vectors.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: HNSW VS IVFFLAT                                             */}
      {/* ================================================================= */}
      <section id="indexes">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — HNSW vs IVFFlat</h2>

        <p>
          Without an index, pgvector does a sequential scan: every row, every query. That&apos;s fine for
          10k rows; it falls apart at a million. ANN indexes (<em>Approximate</em> Nearest Neighbor) trade a
          tiny bit of recall for a 10–100× speedup. pgvector ships two: <strong>HNSW</strong> and
          <strong> IVFFlat</strong>.
        </p>

        <Callout variant="warn" title='"Approximate" means you might miss a true top-k result'>
          <p className="text-sm m-0">
            ANN indexes don&apos;t guarantee they&apos;ll find the literal closest vector — they aim for
            <em> recall@10 </em> in the 95–99% range. For a search UI, that&apos;s invisible. For exact-match
            de-duplication or compliance use cases where missing one means a bug, you may want to keep a
            sequential scan or post-verify the top-k with brute force.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">HNSW: the modern default</h3>

        <p>
          HNSW (Hierarchical Navigable Small World) builds a multi-layer graph where each node is a vector and
          edges connect &quot;close-ish&quot; neighbors. Search starts at the top sparse layer, greedily walks
          to the closest node, drops down a layer, repeats. Think of it as a skip list for geometry.
        </p>

        <CodeBlock lang="plain">{`-- Create an HNSW index on the cosine operator class
CREATE INDEX ON bookmark
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Per-query knob: how many candidates to inspect
SET hnsw.ef_search = 40;`}</CodeBlock>

        <p>The three knobs:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong><code>m</code></strong> — max edges per node. Higher = better recall, bigger index, slower
            build. Default 16. Don&apos;t go below 8; rarely worth going above 32.
          </li>
          <li>
            <strong><code>ef_construction</code></strong> — candidate list size during <em>build</em>. Higher =
            slower index build, slightly better recall forever. Default 64. Bumping to 200 is reasonable for
            a one-time index of an important corpus.
          </li>
          <li>
            <strong><code>ef_search</code></strong> — candidate list size at <em>query</em> time. Higher =
            slower queries, better recall. Default 40. This is the dial you use to tune the latency/recall
            trade-off without rebuilding.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">IVFFlat: the older partition-based index</h3>

        <p>
          IVFFlat clusters vectors into <code>lists</code> partitions (basically k-means). At query time, it
          checks the closest <code>probes</code> partitions. Cheaper to build than HNSW, smaller on disk,
          generally lower recall at the same speed.
        </p>

        <CodeBlock lang="plain">{`CREATE INDEX ON bookmark
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- rule of thumb: rows / 1000 for < 1M, sqrt(rows) for > 1M

SET ivfflat.probes = 10;`}</CodeBlock>

        <Callout variant="warn" title="IVFFlat needs data before you build it">
          <p className="text-sm m-0">
            IVFFlat clusters during <code>CREATE INDEX</code>. If you build the index on an empty table and
            then insert, the partitions are garbage. Build IVFFlat <em>after</em> a representative bulk load,
            or rebuild it after major data changes. HNSW doesn&apos;t have this problem — it&apos;s
            incremental.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Which one should I use?</h3>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2"></th>
                <th className="text-left p-2">HNSW</th>
                <th className="text-left p-2">IVFFlat</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Recall at default settings</td>
                <td className="p-2">~99% recall@10</td>
                <td className="p-2">~90% recall@10</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Build time</td>
                <td className="p-2">Slow (minutes for 1M rows)</td>
                <td className="p-2">Fast (seconds for 1M rows)</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Index size on disk</td>
                <td className="p-2">~3–4× the raw vectors</td>
                <td className="p-2">~1.1× the raw vectors</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Incremental insert</td>
                <td className="p-2">Yes</td>
                <td className="p-2">Yes, but quality drifts; periodic rebuild</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">When to pick</td>
                <td className="p-2">Default. Pick this unless you have a reason not to.</td>
                <td className="p-2">Memory-constrained, high write throughput, or build-time pain</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-semibold">
          The short answer: use HNSW unless something specific pushes you off it.
        </p>

        <WorkedExample
          title="Tuning HNSW on real data"
          subtitle="2M-row corpus, 1024d embeddings, latency budget 50ms p95"
          steps={[
            {
              title: "Step 1 — Start with defaults",
              body: (
                <>
                  <p className="text-sm">
                    <code>m=16, ef_construction=64, ef_search=40</code>. Build the index, run a 1k-query
                    benchmark, measure two things: p95 latency and recall@10 (compared to a brute-force
                    ground truth on a 10k-row sample).
                  </p>
                  <p className="text-sm">
                    Suppose you measure <strong>p95 = 18ms, recall = 96%</strong>. Latency is fine; recall is
                    short of where you want it.
                  </p>
                </>
              ),
            },
            {
              title: "Step 2 — Trade latency for recall via ef_search",
              body: (
                <>
                  <p className="text-sm">
                    <code>SET hnsw.ef_search = 100;</code> Re-run the same benchmark. Suppose now
                    <strong> p95 = 35ms, recall = 99%</strong>. You spent 17ms of your latency budget to gain
                    3 points of recall. Whether that&apos;s worth it depends on your product.
                  </p>
                </>
              ),
            },
            {
              title: "Step 3 — If you can afford a rebuild, raise ef_construction",
              body: (
                <>
                  <p className="text-sm">
                    <code>ef_construction = 200</code> bakes more recall into the index permanently. The
                    rebuild takes longer (maybe 20 min for 2M rows on a beefy machine) but you get a free
                    couple of points of recall at query time forever — and that recall budget can pay for
                    a <em>lower</em> ef_search, claiming back latency.
                  </p>
                </>
              ),
            },
            {
              title: "Step 4 — Don't tune in a vacuum",
              body: (
                <>
                  <p className="text-sm">
                    Build a 50–500 query golden set with hand-labeled relevant docs <em>for your domain</em>.
                    The pgvector docs&apos; defaults assume generic data. Your numbers will be different.
                    Without your own measurement, you&apos;re tuning by vibes.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3 className="text-xl font-bold mt-8 mb-3">Hybrid filtering: the gotcha</h3>

        <p>
          The killer feature of pgvector is filtering with <code>WHERE</code> in the same query. But there&apos;s
          a subtle trap.
        </p>

        <CodeBlock lang="plain">{`-- ✅ This is what you want — filter, then ANN
SELECT id, title
FROM bookmark
WHERE user_id = 42
  AND created_at > now() - interval '30 days'
ORDER BY embedding <=> $1
LIMIT 10;`}</CodeBlock>

        <p>
          When the <code>WHERE</code> clause is highly selective (e.g., user_id = 42 narrows 10M rows to 200),
          Postgres may pick a <em>sequential scan + sort</em> over those 200 rows instead of using the HNSW
          index — and that&apos;s the right call. But when the filter narrows to, say, 50k rows, the planner
          can pick wrong: HNSW returns 10 candidates but maybe none of them match user_id = 42, so pgvector
          has to over-fetch and re-filter. <code>EXPLAIN ANALYZE</code> is your friend here.
        </p>

        <Callout variant="info" title="The over-fetch pattern">
          <p className="text-sm m-0">
            A common workaround: ask the index for more results than you need (<code>LIMIT 100</code>),
            apply your filter in a CTE, then take the top <code>k</code>. You burn some extra ANN candidates
            but guarantee that filtered results aren&apos;t starved. pgvector 0.7+ has &quot;iterative index
            scans&quot; that handle this natively — check your version.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="You have a 5M-row table, HNSW index with default settings, and you're seeing recall@10 ~94%. You need 98%+ but can't rebuild the index right now. What's the fastest fix?"
          options={[
            { label: "Raise m and ef_construction, accept the rebuild downtime", explanation: "These help, but they require a rebuild. The question said you can't rebuild now." },
            { label: "SET hnsw.ef_search to a higher value at query time", correct: true, explanation: "ef_search is the per-query knob — no rebuild required. Bumping from 40 to 100 typically buys several recall points at proportional latency cost. You can set it per session, per pool, or per request." },
            { label: "Switch to IVFFlat — it has higher recall by default", explanation: "IVFFlat actually has *lower* recall than HNSW at default settings." },
            { label: "Add a second index with different parameters and let Postgres pick", explanation: "Postgres can only use one index per query and will pick by cost estimate, not recall. Doesn't solve the problem." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="True or false: you can build an HNSW index on an empty table, insert rows over time, and the index quality stays good."
          options={[
            { label: "True", correct: true, explanation: "HNSW builds incrementally — every insert finds its neighbors and adds edges. IVFFlat is the opposite: it clusters at build time, so an empty-table build produces useless partitions and you must rebuild after a meaningful data load. This is a major reason HNSW became the default." },
            { label: "False", explanation: "It's true for HNSW (incremental). You may be thinking of IVFFlat, where this is genuinely false." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 3 recap"
          gist="ANN indexes trade a tiny bit of recall for a 10–100× speedup. Default to HNSW. Tune ef_search before you tune anything that requires a rebuild."
          points={[
            { takeaway: "HNSW is the default. IVFFlat is for memory or build-time constraints.", detail: "HNSW: ~99% recall, slow build, big on disk, incremental. IVFFlat: ~90% recall, fast build, small on disk, requires post-load build." },
            { takeaway: "ef_search is the per-query knob — turn it first.", detail: "It trades latency for recall without a rebuild. Tuning m and ef_construction pays off forever but requires rebuilding the whole index." },
            { takeaway: "Hybrid filtering can fight the planner. Read EXPLAIN ANALYZE.", detail: "When the WHERE clause is highly selective the planner may legitimately pick sequential scan over ANN. When it's mid-selective, you may need to over-fetch and post-filter, or upgrade to pgvector 0.7+'s iterative index scans." },
          ]}
        />

        <Checkpoint moduleSlug="pgvector" id="indexes" title="HNSW vs IVFFlat" xp={25} celebration="You can pick an ANN index, defend the choice, and tune it without flailing.">
          <p>
            You should be able to: name the three HNSW knobs and which one to turn first; explain why IVFFlat
            requires a post-load build; predict what <code>EXPLAIN ANALYZE</code> will show on a hybrid query.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: PROJECT — DUPLICATE ISSUE DETECTOR                          */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Project: duplicate issue detector</h2>

        <p>
          Time to ship. You&apos;re going to build a small service that ingests GitHub-style issues, embeds
          them, stores them in pgvector, and exposes an endpoint that finds likely duplicates of a new issue
          before it&apos;s filed.
        </p>

        <Callout variant="info" title="What you'll need">
          <p className="text-sm m-0 mb-2">
            • Java 21, Spring Boot 3.5+, Maven<br />
            • Docker (for Postgres + pgvector)<br />
            • An <code>OPENAI_API_KEY</code> environment variable (or swap the embedding starter for any provider you set up in Module 14)
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 1 — Spring Initializr deps</h3>

        <p>From <a className="text-emerald-600 hover:underline" href="https://start.spring.io">start.spring.io</a>, generate a project with:</p>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li><strong>Spring Web</strong></li>
          <li><strong>Spring Data JDBC</strong></li>
          <li><strong>PostgreSQL Driver</strong></li>
          <li><strong>Flyway Migration</strong></li>
          <li><strong>OpenAI</strong> (under Spring AI) — gives you the embedding model</li>
          <li><strong>PGvector Vector Database</strong> (under Spring AI) — the Spring AI <code>VectorStore</code> that targets pgvector</li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 2 — Run the database</h3>

        <CodeBlock lang="plain">{`docker run --name pg-vec-issues \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=issues \\
  -p 5432:5432 \\
  -d pgvector/pgvector:pg16`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 3 — application.yml</h3>

        <CodeBlock lang="plain">{`spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/issues
    username: postgres
    password: secret
  flyway:
    enabled: true
  ai:
    openai:
      api-key: \${OPENAI_API_KEY}
      embedding:
        options:
          model: text-embedding-3-small   # 1536d
    vectorstore:
      pgvector:
        index-type: HNSW
        distance-type: COSINE_DISTANCE
        dimensions: 1536
        initialize-schema: false   # we manage schema with Flyway`}</CodeBlock>

        <p>
          We turn off Spring AI&apos;s auto schema management because we want explicit migrations. The
          starter would otherwise create a default <code>vector_store</code> table — fine for prototypes,
          painful when you need to evolve.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 4 — Flyway migration</h3>

        <p>Create <code>src/main/resources/db/migration/V1__init.sql</code>:</p>

        <CodeBlock lang="plain">{`CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE issue (
  id          BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  state       TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  embedding   vector(1536)
);

-- Build the index AFTER the bulk seed in V2; for now just add the column
-- and a regular B-tree on state for filtering.
CREATE INDEX issue_state_idx ON issue (state);`}</CodeBlock>

        <p>
          Notice we aren&apos;t creating the HNSW index yet. We&apos;ll bulk-load issues first, then add the
          index in <code>V2__index.sql</code>. Building HNSW on an empty table works, but you waste rebuild
          time later — and IVFFlat outright requires post-load building.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 5 — The Issue record and repository</h3>

        <CodeBlock lang="java">{`package com.example.issues;

import java.time.Instant;

public record Issue(
    Long id,
    String externalId,
    String title,
    String body,
    String state,
    Instant createdAt,
    float[] embedding
) {}`}</CodeBlock>

        <CodeBlock lang="java">{`package com.example.issues;

import com.pgvector.PGvector;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class IssueRepository {

    private final JdbcTemplate jdbc;

    public IssueRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(String externalId, String title, String body, float[] embedding) {
        jdbc.update(
            "INSERT INTO issue (external_id, title, body, embedding) VALUES (?, ?, ?, ?) " +
            "ON CONFLICT (external_id) DO UPDATE SET title = EXCLUDED.title, " +
            "body = EXCLUDED.body, embedding = EXCLUDED.embedding",
            externalId, title, body, new PGvector(embedding)
        );
    }

    public List<NearIssue> findNearest(float[] queryEmbedding, int k, String state) {
        // Cosine distance via <=>, lower = closer
        String sql = """
            SELECT id, external_id, title, body, state,
                   embedding <=> ? AS distance
            FROM issue
            WHERE state = ?
            ORDER BY embedding <=> ?
            LIMIT ?
            """;
        PGvector qv = new PGvector(queryEmbedding);
        return jdbc.query(sql, (rs, rowNum) -> new NearIssue(
                rs.getLong("id"),
                rs.getString("external_id"),
                rs.getString("title"),
                rs.getString("body"),
                rs.getString("state"),
                rs.getDouble("distance")
            ),
            qv, state, qv, k);
    }

    public record NearIssue(Long id, String externalId, String title, String body,
                            String state, double distance) {}
}`}</CodeBlock>

        <Callout variant="info" title="PGvector helper class">
          <p className="text-sm m-0">
            <code>com.pgvector.PGvector</code> ships with the <code>com.pgvector:pgvector</code> dependency
            (the Spring AI starter pulls it in transitively). It serializes a <code>float[]</code> into the
            wire format Postgres expects. Without it you&apos;d be hand-formatting <code>&apos;[0.1, 0.2,
            ...]&apos;</code> strings, which is fragile.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 6 — The IssueService</h3>

        <CodeBlock lang="java">{`package com.example.issues;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IssueService {

    private final IssueRepository repo;
    private final EmbeddingModel embedder;

    public IssueService(IssueRepository repo, EmbeddingModel embedder) {
        this.repo = repo;
        this.embedder = embedder;
    }

    public void ingest(String externalId, String title, String body) {
        // We embed title + body together — short titles alone are too ambiguous
        String text = title + "\\n\\n" + body;
        float[] vec = embedder.embed(text);
        repo.insert(externalId, title, body, vec);
    }

    public List<DuplicateCandidate> findDuplicates(String title, String body, int k) {
        String text = title + "\\n\\n" + body;
        float[] queryVec = embedder.embed(text);
        return repo.findNearest(queryVec, k, "open").stream()
            .map(n -> new DuplicateCandidate(
                n.externalId(),
                n.title(),
                1.0 - n.distance(),  // convert cosine distance to similarity
                n.distance() < 0.20  // hand-tuned threshold; measure on your data
            ))
            .toList();
    }

    public record DuplicateCandidate(String externalId, String title,
                                    double similarity, boolean likelyDuplicate) {}
}`}</CodeBlock>

        <Callout variant="warn" title="The 0.20 threshold is a starting point, not a law">
          <p className="text-sm m-0">
            Whether 0.20 cosine distance means &quot;duplicate&quot; depends entirely on your embedding model
            and the kind of text you&apos;re embedding. Build a labeled set of 50 known-duplicate pairs and
            50 known-different pairs from your real data, plot the distance histograms, and pick the threshold
            where the distributions barely overlap. Module 14&apos;s domain-eval methodology applies here.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 7 — The controller</h3>

        <CodeBlock lang="java">{`package com.example.issues;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService service;

    public IssueController(IssueService service) {
        this.service = service;
    }

    public record IngestRequest(String externalId, String title, String body) {}
    public record CheckRequest(String title, String body) {}

    @PostMapping
    public void ingest(@RequestBody IngestRequest req) {
        service.ingest(req.externalId(), req.title(), req.body());
    }

    @PostMapping("/check-duplicate")
    public List<IssueService.DuplicateCandidate> check(@RequestBody CheckRequest req) {
        return service.findDuplicates(req.title(), req.body(), 5);
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 8 — Bulk-load some issues, then build the index</h3>

        <p>
          For a realistic test, scrape (or just paste) ~200 issues from a real public repo. Once they&apos;re
          ingested, add <code>V2__build_index.sql</code>:
        </p>

        <CodeBlock lang="plain">{`-- Build HNSW after we have data so the graph reflects real distribution
CREATE INDEX issue_embedding_hnsw_idx
  ON issue
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);`}</CodeBlock>

        <p>
          Restart the app — Flyway runs the new migration. Postgres reports build progress in the logs.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 9 — Try it</h3>

        <CodeBlock lang="plain">{`# Ingest a few issues
curl -X POST localhost:8080/api/issues -H 'Content-Type: application/json' \\
  -d '{"externalId":"#101","title":"App crashes on login","body":"Stack trace shows NPE in AuthService line 42"}'

curl -X POST localhost:8080/api/issues -H 'Content-Type: application/json' \\
  -d '{"externalId":"#102","title":"Login fails","body":"Getting null pointer in AuthService when I sign in"}'

curl -X POST localhost:8080/api/issues -H 'Content-Type: application/json' \\
  -d '{"externalId":"#103","title":"Add dark mode","body":"Would be nice to have a toggle in settings"}'

# Now check whether a new issue is a duplicate
curl -X POST localhost:8080/api/issues/check-duplicate -H 'Content-Type: application/json' \\
  -d '{"title":"Sign-in throwing exception","body":"NPE in AuthService when authenticating"}'

# Expected: #101 and #102 with similarity > 0.85; #103 way down the list`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 10 — Watch the planner</h3>

        <p>
          Once you have a few thousand issues, run an <code>EXPLAIN ANALYZE</code> on the duplicate-check query
          to confirm the HNSW index is actually being used. With small data and a selective filter, Postgres
          may legitimately prefer a sequential scan.
        </p>

        <CodeBlock lang="plain">{`EXPLAIN ANALYZE
SELECT id, title, embedding <=> '[...]'::vector AS distance
FROM issue
WHERE state = 'open'
ORDER BY embedding <=> '[...]'::vector
LIMIT 5;

-- Look for: "Index Scan using issue_embedding_hnsw_idx"
-- If you see "Seq Scan", you may need more data, or your filter is so
-- selective that brute force IS faster.`}</CodeBlock>

        <Callout variant="info" title="Common pitfalls">
          <ul className="text-sm m-0 list-disc pl-5 space-y-1">
            <li><code>ERROR: type &quot;vector&quot; does not exist</code> — you forgot <code>CREATE EXTENSION vector</code> (Flyway runs it in V1 above).</li>
            <li><code>expected 1536 dimensions, got 3072</code> — you switched embedding models without changing the column type. Either ALTER the column or reset the DB.</li>
            <li>Recall feels off — check that you&apos;re using the same operator class in CREATE INDEX (<code>vector_cosine_ops</code>) and in queries (<code>&lt;=&gt;</code>). Mixing cosine and L2 silently bypasses the index.</li>
            <li>Spring AI&apos;s <code>VectorStore</code> auto-creates a <code>vector_store</code> table — we disabled that with <code>initialize-schema: false</code> so we own the schema. If you want to use the prebuilt store instead, leave it on and use <code>VectorStore</code> directly; just don&apos;t mix the two.</li>
          </ul>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Stretch goals</h3>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Add a <code>repo</code> column and filter duplicates within the same repo.</li>
          <li>When the duplicate confidence is low (similarity 0.5–0.75), still surface results but mark them &quot;related&quot;, not &quot;duplicate&quot;.</li>
          <li>Build a 50-pair labeled eval set, sweep the threshold, plot precision/recall curves.</li>
          <li>Try <code>m=8</code> and <code>m=32</code>, measure index size and recall@5.</li>
        </ul>

        <Checkpoint moduleSlug="pgvector" id="project" title="Project: duplicate issue detector" xp={50} manual manualLabel="Detector is shipping" celebration="You shipped a real pgvector application. Phase 3 is now half-built.">
          <p>
            Mark this done once: you can <code>POST /api/issues</code> and have it embedded + stored;
            <code>POST /api/issues/check-duplicate</code> returns ranked similar issues; and
            <code>EXPLAIN ANALYZE</code> on the query shows an HNSW index scan (or you understand why it
            doesn&apos;t for your data size).
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: FINAL QUIZ                                                  */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Final quiz</h2>

        <Quiz
          kind="Final check"
          question="A teammate proposes adopting Pinecone because 'pgvector won't scale.' Your app has 800k vectors, every query filters by tenant_id, and you already operate Postgres in production. What's the right counter-argument?"
          options={[
            { label: "They're right — 800k is past pgvector's sweet spot", explanation: "800k is well within pgvector's comfort zone — it scales cleanly into the tens of millions." },
            { label: "pgvector handles 800k vectors easily and the tenant_id filter is exactly the hybrid case where Pinecone is weakest", correct: true, explanation: "Both halves matter. 800k is fine. And every query filtering by tenant_id is precisely where colocating with Postgres wins — Pinecone treats that as metadata with weaker filtering semantics." },
            { label: "Pinecone and pgvector have identical performance characteristics", explanation: "They don't. Pinecone is dedicated infra optimized for pure vector search; pgvector is an extension optimized for hybrid SQL." },
            { label: "Use both — pgvector for hot data, Pinecone for cold", explanation: "Adds two systems' worth of complexity for no current benefit. Wait until you have a real problem to solve." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You build an HNSW index, run benchmarks, get 95% recall and 30ms p95 latency. The PM wants 99% recall. Which knob do you turn first?"
          options={[
            { label: "Rebuild with higher m", explanation: "Helps but requires a rebuild — try the cheaper option first." },
            { label: "Rebuild with higher ef_construction", explanation: "Same problem — requires a rebuild." },
            { label: "Raise ef_search at query time", correct: true, explanation: "ef_search is the per-query knob — no rebuild required. Raising it from 40 → 100 typically buys several recall points at proportional latency. If that's not enough, then move to m and ef_construction." },
            { label: "Switch to IVFFlat", explanation: "IVFFlat has lower recall than HNSW at default settings, not higher." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You CREATE INDEX ... USING ivfflat ... on a freshly-migrated empty table, then bulk-insert 1M rows. Recall is terrible. Why?"
          options={[
            { label: "IVFFlat doesn't support bulk insert", explanation: "It does." },
            { label: "IVFFlat clusters at index build time; an empty-table build produces meaningless partitions and has to be rebuilt after the load", correct: true, explanation: "IVFFlat runs k-means at CREATE INDEX time. With no data, the partitions are random. Every insert afterwards goes into a random partition, so probes don't actually narrow the search. Fix: bulk-load FIRST, then build. HNSW doesn't have this problem — it's incremental." },
            { label: "You forgot to SET ivfflat.probes", explanation: "Probes affects search depth, not the underlying issue of garbage partitions." },
            { label: "The vector column type is wrong", explanation: "If that were true, inserts would have failed entirely." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your duplicate detector returns false positives — distinct issues marked as duplicates. The cosine distance threshold is 0.20. What's the RIGHT next step?"
          options={[
            { label: "Lower the threshold to 0.10 and ship", explanation: "A threshold without measurement is a guess. Lowering blindly trades false positives for false negatives without knowing the rate." },
            { label: "Build a labeled eval set of duplicate and non-duplicate pairs from real data, plot the distance distributions, pick the crossover", correct: true, explanation: "Hand-label 50 pairs you KNOW are duplicates and 50 you know aren't. Embed them, plot the histograms. The right threshold is where the distributions separate. If your embeddings are good for this domain you'll see a clear bimodal split." },
            { label: "Switch embedding models — yours is broken", explanation: "Maybe — but you can't tell that without measurement either." },
            { label: "Add an LLM call to verify each candidate", explanation: "Fine secondary filter once the threshold is sound. Doesn't replace the measurement." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You set up pgvector with HNSW, distance-type COSINE_DISTANCE, dimensions=1536. Then you decide to switch to text-embedding-3-large (3072d). What's the minimum work?"
          options={[
            { label: "Just update the model name in application.yml — pgvector handles dimension changes automatically", explanation: "It doesn't. vector(1536) and vector(3072) are different types." },
            { label: "ALTER TABLE to vector(3072), drop and rebuild the HNSW index, re-embed every existing row", correct: true, explanation: "Old vectors are unusable at the new dimension. ALTER (or add a new column), drop the dimension-locked HNSW, re-embed every row, rebuild. Dual-column is a sound zero-downtime *strategy* but the minimum mechanical work is what's described here." },
            { label: "Drop the table and start over — there's no migration path", explanation: "Re-embedding is the migration path." },
            { label: "Add a second column with the new dimension and dual-write", explanation: "A fine zero-downtime strategy, but more work than the minimum." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="pgvector" id="final" title="Final quiz" xp={40} celebration="Module 15 done. Vectors are stored, indexed, and queryable. Module 16 is where chunks become RAG.">
          <p>
            With this module under your belt you can stand up a Spring Boot app that uses Postgres as its
            vector database, pick the right index and operator for your data, and reason about hybrid
            queries. Next: stop thinking about a single vector at a time and start thinking about
            <strong> chunks of a corpus</strong> — that&apos;s RAG.
          </p>
        </Checkpoint>
      </section>

      {/* FOOTER NAV */}
      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/embeddings-deep" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600">
          ← Module 14: Embeddings deep dive
        </Link>
        <Link href="/courses/ai/modules/rag-architecture" className="text-emerald-600 hover:underline font-semibold">
          Module 16: RAG architecture →
        </Link>
      </footer>
        <ModuleNav courseId="ai" currentSlug="pgvector" />
    </article>
  );
}
