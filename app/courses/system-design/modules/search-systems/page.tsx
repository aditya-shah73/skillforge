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
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "why-search", title: "Why DB isn't enough" },
  { id: "inverted-index", title: "Inverted index & BM25" },
  { id: "production", title: "Production patterns" },
];

const invertedIndexDiagram = `flowchart LR
  subgraph Docs["Documents"]
    D1["Doc 1: 'red wool socks'"]
    D2["Doc 2: 'wool sweater'"]
    D3["Doc 3: 'red running shoes'"]
  end
  subgraph Index["Inverted index (term → postings)"]
    T1["red → [1, 3]"]
    T2["wool → [1, 2]"]
    T3["socks → [1]"]
    T4["sweater → [2]"]
    T5["running → [3]"]
    T6["shoes → [3]"]
  end
  Docs -.tokenize + index.-> Index
  Q["Query: 'red wool'"] -->|lookup 'red'| T1
  Q -->|lookup 'wool'| T2
  T1 -->|intersect| Result["Doc 1 (matches both)"]
  T2 --> Result`;

const cdcPipelineDiagram = `flowchart LR
  App[App] -->|writes| PG[(Postgres)]
  PG -->|WAL| Debezium[Debezium]
  Debezium -->|change events| K[Kafka]
  K --> Indexer[Indexer service]
  Indexer -->|bulk index| ES[(Elasticsearch)]
  Search[Search API] -->|query| ES
  style PG fill:#dbeafe,stroke:#1e40af
  style ES fill:#fef3c7,stroke:#b45309
  style K fill:#fce7f3,stroke:#be185d`;

export default function Page() {
  const mod = getModuleBySlug("search-systems")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="search-systems" />
        <ModuleProgress moduleSlug="search-systems" checkpoints={CHECKPOINTS} />
      </header>

      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4">What you&apos;ll walk out with</h2>
        <ul className="space-y-2">
          <li>A clear sense of when Postgres&apos;s built-in search is enough — and when it categorically isn&apos;t.</li>
          <li>How an inverted index actually works, and the intuition behind BM25 ranking.</li>
          <li>The production pattern: Postgres as system of record, Elasticsearch as query engine, Debezium / Kafka as the bridge.</li>
          <li>The hard problems: indexing lag, schema migrations on the index, and what to do when the two stores disagree.</li>
        </ul>
      </section>

      <section className="my-10">
        <p>
          Search is one of those features that looks easy from outside (&quot;just put a search box on it&quot;) and
          is operationally complicated from inside. The &quot;just&quot; word is doing the work — search means
          tokenization, stemming, ranking, typo tolerance, autocomplete, faceting, spell correction, and a separate
          system to hold the index.
        </p>
        <p>
          The good news: the architecture has converged. Postgres for the system of record, Elasticsearch (or
          OpenSearch) for the search index, a CDC pipeline to keep them in sync. The hard parts aren&apos;t novel,
          they&apos;re just unfamiliar. This module is about getting them familiar.
        </p>
      </section>

      <Checkpoint moduleSlug="search-systems" id="why-search" title="Why DB isn't enough" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 1 — Why a database isn&apos;t a search engine</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">The LIKE trap</h3>
        <p>
          Every search feature in history started with this query:
        </p>

        <CodeBlock lang="plain" caption="The query that haunts every codebase">{`SELECT * FROM products WHERE name ILIKE '%wool socks%';`}</CodeBlock>

        <p>
          It works for 100 rows. It crawls at 100k rows. It dies at 10M rows. Why?
        </p>
        <ul>
          <li><strong>Leading wildcard:</strong> <code>%wool%</code> means &quot;any string containing wool.&quot; B-tree indexes can&apos;t help — they&apos;re sorted, but you&apos;re asking for substring matches at every position.</li>
          <li><strong>Full table scan:</strong>{" "}the planner has no choice but to read every row and run a substring check.</li>
          <li><strong>No ranking:</strong>{" "}all matches are equal. There&apos;s no notion of &quot;more relevant.&quot;</li>
          <li><strong>No tokenization:</strong> &quot;wool socks&quot; doesn&apos;t match &quot;socks made of wool.&quot; Token order matters; word matching doesn&apos;t exist.</li>
          <li><strong>No stemming:</strong> &quot;running&quot; doesn&apos;t match &quot;run&quot; or &quot;ran.&quot;</li>
          <li><strong>No typo tolerance:</strong> &quot;wol socks&quot; finds nothing.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Postgres full-text search: the &quot;maybe enough&quot; option</h3>
        <p>
          Before reaching for Elasticsearch, know that Postgres ships with a real full-text search engine.
          <code> tsvector</code> and <code>tsquery</code> with a <code>GIN</code> index handle a lot:
        </p>

        <CodeBlock lang="plain" caption="Postgres full-text search">{`-- Add a tsvector column maintained by a trigger or generated column
ALTER TABLE products ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED;

CREATE INDEX products_search_idx ON products USING GIN (search_vector);

-- Query
SELECT id, name, ts_rank(search_vector, query) AS rank
FROM products, plainto_tsquery('english', 'wool socks') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;`}</CodeBlock>

        <p>
          You get tokenization, stemming (English-aware), stopword removal, ranking via <code>ts_rank</code>, and a
          GIN index that&apos;s genuinely fast. You can do faceting with separate columns, autocomplete with
          <code> pg_trgm</code>, and prefix matching with text indexes.
        </p>

        <Callout variant="info" title="Postgres FTS is enough more often than people admit">
          <p className="m-0">
            For datasets up to maybe 10M documents and basic search needs (tokenized matching + ranking + faceting),
            Postgres FTS is genuinely a good choice. You skip an entire system to operate, an entire CDC pipeline,
            and an entire dual-write consistency problem. Reach for Elasticsearch when you actually need what it
            offers — not by default.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">When Postgres FTS stops being enough</h3>
        <ul>
          <li><strong>Multi-language tokenization with quality.</strong>{" "}Postgres ships English, Spanish, etc., but Chinese/Japanese/Korean tokenization is weak compared to ES analyzers.</li>
          <li><strong>Real-time scoring with custom ranking signals.</strong> &quot;Boost recent items 2x, in-stock items 3x, sponsored items by ad bid.&quot; Possible in Postgres but contortions; native in ES.</li>
          <li><strong>Aggregations / faceting at scale.</strong> &quot;How many results in each category?&quot; Across 100M docs, ES wins easily.</li>
          <li><strong>Vector search alongside text.</strong>{" "}Hybrid retrieval (BM25 + embeddings) is native in ES, doable but bolted-on in Postgres (pgvector).</li>
          <li><strong>Index size or write rate.</strong>{" "}Hundreds of millions of documents, thousands of writes per second to the index — ES is built for this; Postgres FTS struggles.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="A team has 500k blog posts in Postgres and wants 'fuzzy search by title and body, ranked by relevance.' What's the right starting point?"
          options={[
            { label: "Stand up Elasticsearch with a CDC pipeline.", correct: false, explanation: "Premature. 500k documents is well within Postgres FTS territory. The ES pipeline adds operational complexity that isn't justified yet." },
            { label: "Use Postgres tsvector + GIN index, with pg_trgm for fuzzy matching on titles.", correct: true, explanation: "Right. 500k docs + ranking + fuzzy = exactly what Postgres FTS does well. ts_rank for relevance, pg_trgm for typo tolerance, GIN index for speed. One system to operate, no consistency complexity. Move to ES later only if specific needs (multi-language, custom ranking signals, scale) require it." },
            { label: "Use Elasticsearch only — store the documents there, no Postgres at all.", correct: false, explanation: "ES isn't a great system of record. You give up transactions, foreign keys, joins, and Postgres's general flexibility. Treat ES as an index, not a primary store." },
            { label: "Add a LIKE-based search and add indexes later.", correct: false, explanation: "We just covered why this doesn't work. Skip the LIKE phase; go straight to FTS." },
          ]}
        />

        <Quiz
          kind="Gut check"
          question="Which of these is NOT a real reason to graduate from Postgres FTS to Elasticsearch?"
          options={[
            { label: "Custom relevance scoring with multiple signals (recency, popularity, click-through rate).", correct: false, explanation: "Real reason. ES's function_score and rescore APIs are designed for this; doing it in Postgres requires SQL contortions." },
            { label: "Hundreds of millions of documents and thousands of writes per second.", correct: false, explanation: "Real reason. Postgres FTS performance degrades at very high scale; ES is purpose-built for it." },
            { label: "Faceted search with sub-second aggregations across millions of documents.", correct: false, explanation: "Real reason. ES aggregations are first-class and fast; Postgres faceting via GROUP BY can be slow at scale." },
            { label: "We're worried our LIKE queries are slow and someone said Elasticsearch is faster.", correct: true, explanation: "Not a real reason. The first move from LIKE is Postgres FTS, not ES. ES is a real, operationally heavy commitment — make it for real reasons, not because LIKE is slow." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="LIKE doesn't scale. Postgres FTS handles a lot before you need a separate search engine. Reach for Elasticsearch when you have specific needs it solves well."
          points={[
            { takeaway: "LIKE '%foo%' is a full table scan in disguise.", detail: "B-trees can't help with leading wildcards. The query gets worse linearly as your table grows." },
            { takeaway: "Postgres FTS (tsvector + GIN) is real full-text search.", detail: "Tokenization, stemming, stopwords, ranking, GIN index. Fine for ~10M docs and basic search." },
            { takeaway: "Graduate to Elasticsearch for specific reasons.", detail: "Multi-language analyzers, custom ranking, scale beyond ~10M docs, vector + text hybrid, deep aggregations." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="search-systems" id="inverted-index" title="Inverted index & BM25" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 2 — Inverted index &amp; BM25</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">The inverted index, drawn out</h3>
        <p>
          A normal index goes <em>document → tokens it contains</em>. An inverted index flips this:
          <em> token → list of documents that contain it</em>. The token map is the lookup; the list is called a
          &quot;postings list.&quot;
        </p>

        <Mermaid chart={invertedIndexDiagram} />

        <p>
          To answer a query like <code>red wool</code>:
        </p>
        <ol>
          <li>Tokenize the query into [&quot;red&quot;, &quot;wool&quot;].</li>
          <li>Look up each token in the index. <code>red → [1, 3]</code>, <code>wool → [1, 2]</code>.</li>
          <li>Intersect the postings lists for AND-style search: [1, 3] ∩ [1, 2] = [1].</li>
          <li>Score and rank the matches.</li>
        </ol>

        <p>
          This generalizes: phrase queries store position info per term per doc; fuzzy queries expand the term to
          variants; faceting uses the postings to count categories. Everything is built on the inverted index
          primitive.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Tokenization, stemming, normalization</h3>
        <p>
          Before indexing, documents go through an <em>analyzer</em>:
        </p>
        <ul>
          <li><strong>Tokenize:</strong>{" "}split on whitespace + punctuation. &quot;Wool socks!&quot; → [&quot;Wool&quot;, &quot;socks&quot;].</li>
          <li><strong>Lowercase:</strong> [&quot;wool&quot;, &quot;socks&quot;].</li>
          <li><strong>Remove stopwords:</strong>{" "}drop &quot;the&quot;, &quot;a&quot;, &quot;and&quot; — words that match everything and rank nothing.</li>
          <li><strong>Stem:</strong> &quot;running&quot; → &quot;run&quot;, &quot;socks&quot; → &quot;sock&quot;. Tradeoffs: improves recall, hurts precision.</li>
          <li><strong>Synonyms / lemmatization:</strong>{" "}optional, for cases where domain-specific synonyms matter.</li>
        </ul>
        <p>
          The analyzer at index time and query time must match — otherwise &quot;Wool Socks&quot; in a doc and
          &quot;wool socks&quot; in a query don&apos;t collide. This trips up everyone at least once.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">BM25 — the ranking function that ate the world</h3>
        <p>
          When a query matches multiple docs, you need to rank them. BM25 is the standard. The intuition (no
          formula needed):
        </p>
        <ul>
          <li><strong>Term frequency:</strong>{" "}a doc that mentions &quot;wool&quot; ten times is more about wool than one that mentions it once. But not 10x more — diminishing returns kick in fast.</li>
          <li><strong>Inverse document frequency:</strong>{" "}rare terms are more discriminative. &quot;Wool&quot; in a clothing catalog is informative; &quot;the&quot; is not. Rare terms get weighted higher.</li>
          <li><strong>Document length normalization:</strong>{" "}a 1000-word doc that mentions &quot;wool&quot; once is less &quot;about&quot; wool than a 50-word doc that mentions it once. BM25 normalizes for length.</li>
        </ul>

        <Callout variant="insight" title="Why BM25 has stuck around since 1994">
          <p className="m-0">
            BM25 has two tunable parameters (<code>k1</code> for term-frequency saturation, <code>b</code> for length
            normalization) and that&apos;s it. It captures the three intuitions above with shockingly little ceremony,
            and it&apos;s been competitive with much fancier ranking models for 30 years. Modern systems use BM25
            as the first-stage retriever and apply learned models (LambdaMART, neural rerankers) on top of the BM25
            shortlist. The first stage is still BM25 because nothing else is as fast and almost-as-good.
          </p>
        </Callout>

        <CodeBlock lang="java" caption="Spring Data Elasticsearch — basic search query">{`@Document(indexName = "products")
public class ProductDoc {
    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "english")
    private String name;

    @Field(type = FieldType.Text, analyzer = "english")
    private String description;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Double)
    private double price;
    // getters/setters
}

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDoc, String> {
    @Query("""
        {
          "multi_match": {
            "query": "?0",
            "fields": ["name^3", "description"],
            "fuzziness": "AUTO"
          }
        }
        """)
    SearchHits<ProductDoc> findByText(String text);
}`}</CodeBlock>

        <p>
          The <code>name^3</code> boost says: matches in the name are 3x as relevant as matches in the description.
          <code>fuzziness: AUTO</code> turns on edit-distance tolerance based on term length. This is the kind of
          thing that&apos;s a one-liner in ES and a paragraph of SQL in Postgres.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Sharding the index</h3>
        <p>
          Elasticsearch shards an index across nodes the same way other systems shard data. A query hits all shards
          (in parallel), each returns its top-K candidates, the coordinator merges them, returns the global top-K.
        </p>
        <p>
          Two practical implications:
        </p>
        <ul>
          <li><strong>Shard count is hard to change later.</strong>{" "}Pick wisely up front. Default of 1 shard is fine for &lt;50M docs; bump to 5–10 shards for larger indexes.</li>
          <li><strong>Replicas multiply read throughput.</strong>{" "}Each replica can serve queries; replicas are how you scale read-heavy search.</li>
        </ul>

        <Quiz
          kind="Quick check"
          question="A query 'lightweight wool jacket' returns the top 10 results. The doc 'Lightweight wool jacket — perfect for fall' is ranked #4. The doc 'Jacket' is ranked #1. What's most likely happening?"
          options={[
            { label: "BM25 is broken — the more relevant doc should rank higher.", correct: false, explanation: "Almost certainly the analyzer is doing something subtle, not BM25 itself. BM25's been doing this job for decades; the bug is upstream of it." },
            { label: "The 'Jacket' doc has a much higher recency or popularity boost overriding text relevance.", correct: true, explanation: "Likely candidate. Many production search systems combine BM25 with custom signals (recency, popularity, sales, ad bids). A short doc with strong external boosts can outrank a much more text-relevant doc. The fix is auditing the function_score / boost configuration to make sure text relevance still has appropriate weight." },
            { label: "The shorter 'Jacket' doc gets a length normalization bonus that's too aggressive.", correct: false, explanation: "BM25's length normalization (b parameter) penalizes long docs but it usually doesn't outweigh strong term match in long docs. Possible but less likely than the boosting explanation." },
            { label: "Term order matters and BM25 prefers the first matching doc.", correct: false, explanation: "BM25 doesn't care about doc order; it scores each doc independently and ranks." },
          ]}
        />

        <Quiz
          kind="Gut check"
          question="The query analyzer at search time uses English stemming. The index analyzer was set up months ago without stemming. What's the symptom?"
          options={[
            { label: "Searches for 'running' don't match docs containing 'run'.", correct: true, explanation: "Right. Index analyzer stored the literal 'run' / 'running' / 'runner' tokens. Query analyzer stems 'running' to 'run' and looks for 'run' in the index. Docs with 'running' have 'running' in their postings, not 'run' — no match. The fix is to reindex with the same analyzer at both ends. This is one of the most common search bugs." },
            { label: "The system rejects all queries with errors.", correct: false, explanation: "Mismatch produces silent under-recall, not errors. Worse than errors in some ways." },
            { label: "Indexing slows down 10x.", correct: false, explanation: "Indexing throughput is independent of analyzer mismatch." },
            { label: "Replicas fall out of sync with the master.", correct: false, explanation: "Replication is byte-level; analyzer config doesn't affect it." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The inverted index goes term → docs. BM25 ranks via term frequency, inverse doc frequency, and length normalization. Index and query analyzers must match."
          points={[
            { takeaway: "Inverted index = term → postings.", detail: "Lookup terms, intersect postings, rank. Foundation of every search engine since the 1960s." },
            { takeaway: "BM25 captures three intuitions in two tunable parameters.", detail: "Term frequency with saturation, IDF for rarity, length normalization. Still the dominant first-stage ranker." },
            { takeaway: "Index analyzer == query analyzer.", detail: "Mismatched analyzers silently break recall. If you change the analyzer, reindex." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="search-systems" id="production" title="Production patterns" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 3 — Production patterns</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">Postgres + Elasticsearch — the standard architecture</h3>
        <p>
          The pattern that&apos;s won:
        </p>
        <ul>
          <li><strong>Postgres is the system of record.</strong>{" "}Transactions, foreign keys, joins, the truth.</li>
          <li><strong>Elasticsearch is the query engine.</strong>{" "}Tokenized search, faceting, ranking, scale.</li>
          <li><strong>A pipeline keeps ES in sync.</strong>{" "}Either CDC (Debezium → Kafka → indexer → ES) or dual-write from the application.</li>
        </ul>

        <Mermaid chart={cdcPipelineDiagram} />

        <h3 className="text-xl font-semibold mt-6 mb-3">Dual-write vs CDC</h3>

        <p><strong>Dual-write (application-level):</strong>{" "}the service that writes to Postgres also writes to ES. Simple, easy to reason about. <em>Doesn&apos;t survive failures.</em>{" "}If the ES write fails after the Postgres write commits, your two stores are now inconsistent. Retry queues help but don&apos;t fully solve it.</p>

        <CodeBlock lang="java" caption="Naive dual-write — has consistency holes">{`@Transactional
public Product create(CreateProductRequest req) {
    Product p = repo.save(new Product(req));
    try {
        searchRepo.save(toDoc(p));   // ES write inside the txn
    } catch (Exception e) {
        // Postgres txn will roll back, but the call site sees a partial failure
        throw new IndexingFailureException(e);
    }
    return p;
}

// What goes wrong: the ES client times out, throws, txn rolls back —
// but ES might have actually accepted the write. Postgres has no row,
// ES has the doc. Out of sync.`}</CodeBlock>

        <p>
          This pattern fails subtly enough that everyone discovers it the hard way. The ES client thinks the request
          timed out; ES quietly accepted it. Postgres rolls back. Now ES has an orphan.
        </p>

        <p><strong>CDC (change data capture):</strong>{" "}a separate service tails Postgres&apos;s WAL (Debezium reads logical replication slots), publishes change events to Kafka, an indexer consumes from Kafka and writes to ES. Postgres is always the source of truth; ES is always derived. If ES drifts, you can rebuild it from Postgres.</p>

        <Callout variant="info" title="Why CDC wins for any non-trivial system">
          <p className="m-0">
            CDC has more moving pieces but each piece does one thing well. Postgres is unchanged. Debezium follows
            the WAL — same log everyone else uses for replication. Kafka buffers between producers and consumers,
            absorbing indexer slowness. The indexer can be paused, restarted, replayed without losing data. Most
            critically: <strong>you can rebuild the entire ES index by replaying Kafka topics</strong>. That&apos;s a
            superpower; dual-write doesn&apos;t have it.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="A team uses dual-write to keep ES in sync with Postgres. They notice that 0.1% of products in ES don't exist in Postgres. What's the most likely cause?"
          options={[
            { label: "ES is corrupting data.", correct: false, explanation: "Almost never the answer. The bug is in the dual-write pattern itself." },
            { label: "ES write succeeded but Postgres txn rolled back; or ES write timed out and was retried, creating duplicates.", correct: true, explanation: "Dual-write doesn't have an atomic 'either both succeed or both fail' guarantee. ES accepting a write while Postgres rolls back is exactly how orphans appear. CDC fixes this — Postgres is always written first, ES follows from the WAL." },
            { label: "Postgres is silently dropping rows.", correct: false, explanation: "Postgres doesn't silently drop committed rows. The bug is on the ES side or in the dual-write coordination." },
            { label: "Network packet loss between Postgres and ES.", correct: false, explanation: "Packet loss might cause writes to fail, but it doesn't explain why ES has rows that Postgres doesn't. The dual-write race does." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Indexing lag</h3>
        <p>
          With CDC, ES is always behind Postgres. Typical lag: hundreds of milliseconds to a few seconds in steady
          state. Spikes during high write volume or slow indexer.
        </p>
        <p>
          Two implications:
        </p>
        <ul>
          <li><strong>Read-your-writes problem (again).</strong>{" "}User creates a product and immediately searches for it; doesn&apos;t find it. Standard fix: route the post-create read through Postgres, not search. Or display the new item from a known-good source until indexing catches up.</li>
          <li><strong>Stale facets.</strong> &quot;42 results&quot; might be 41 by the time the user clicks through. Usually acceptable, occasionally not.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Reindexing without downtime</h3>
        <p>
          Schema changes in ES (new fields, changed analyzers, different tokenization) typically require reindexing.
          The pattern:
        </p>
        <ol>
          <li>Create a new index <code>products_v2</code> with the new mapping.</li>
          <li>Backfill from Postgres (or from a Kafka topic replay) into <code>products_v2</code>.</li>
          <li>Once caught up, dual-index: writes go to both <code>products_v1</code> and <code>products_v2</code>.</li>
          <li>Verify <code>products_v2</code> matches expectations (sample queries, doc counts, top-K relevance).</li>
          <li>Use an alias to swap reads from v1 to v2 atomically.</li>
          <li>Stop writing to v1, delete it.</li>
        </ol>

        <Callout variant="warn" title="Aliases are the only sane way to switch indexes">
          <p className="m-0">
            ES supports index aliases — a logical name that points to one or more physical indexes. Your application
            queries <code>products</code>; the alias points to <code>products_v1</code> today and
            <code> products_v2</code> tomorrow. Switching the alias is atomic. Without aliases, you&apos;d have to
            change every client to switch index names — operational suicide. <strong>Always query through aliases.</strong>
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">When ES and Postgres disagree</h3>
        <p>
          They will. Disagreements come from:
        </p>
        <ul>
          <li>Indexer bugs (forgot to map a field, transformation wrong).</li>
          <li>Indexer down for hours (Kafka backed up, lag huge).</li>
          <li>Manual edits to one store and not the other (someone ran SQL fix in Postgres).</li>
          <li>Dual-write partial failures (we just talked about this).</li>
        </ul>
        <p>
          The fix path: always be able to <strong>rebuild ES from Postgres</strong>. Either via CDC replay or via a
          batch reindex job. If reconstruction takes a week, drift is permanent and you&apos;re always firefighting.
          If reconstruction takes an hour, drift is a non-issue — rebuild on demand.
        </p>

        <Quiz
          kind="Gut check"
          question="A team's product catalog has 50M items. Their reindex job (Postgres → ES) takes 24 hours. They're hitting drift issues monthly. What's the architectural fix?"
          options={[
            { label: "Run reindex daily as a cron.", correct: false, explanation: "Reindex itself is the bottleneck. Running it daily means you're always reindexing, which is wasteful and still leaves drift between rebuilds." },
            { label: "Make reindex fast — parallelize across shards, batch writes, run multiple workers — so it takes hours, not days.", correct: true, explanation: "Right. The lever is reindex speed itself. Bulk indexing API, multiple workers reading non-overlapping Postgres ranges, sized for throughput. If reindex completes in 2 hours, drift is a fix-by-rebuilding situation, not a creeping problem. Operational confidence comes from being able to rebuild quickly." },
            { label: "Stop using ES — go back to Postgres FTS.", correct: false, explanation: "Drops a real capability for an operational symptom. Fix the operations." },
            { label: "Add a third store for verification.", correct: false, explanation: "Adds complexity, doesn't fix the root issue. The right fix is making the rebuild cheap enough to be a tool, not a project." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Spring Data Elasticsearch in production</h3>

        <CodeBlock lang="java" caption="Production-shaped query with filtering and ranking">{`@Service
public class ProductSearchService {
    @Autowired ElasticsearchOperations es;

    public SearchHits<ProductDoc> search(String query, String category, double minPrice) {
        Criteria criteria = new Criteria("name").matches(query)
            .or(new Criteria("description").matches(query));

        if (category != null) {
            criteria = criteria.and("category").is(category);   // exact-match filter
        }
        criteria = criteria.and("price").greaterThanEqual(minPrice);

        Query q = new CriteriaQuery(criteria)
            .setPageable(PageRequest.of(0, 20))
            .addSort(Sort.by(Sort.Order.desc("_score")));

        return es.search(q, ProductDoc.class);
    }
}`}</CodeBlock>

        <Callout variant="spring" title="Spring Data ES gets you 80%, native client gets you the last 20%">
          <p className="m-0">
            Spring Data ES handles the boring CRUD and basic queries. For complex scoring (function_score with
            multiple weighted signals), aggregations, or anything you want to tune carefully, drop down to the
            native ES Java client. <code>ElasticsearchOperations</code> exposes both worlds; use whichever fits.
          </p>
        </Callout>

        <PartRecap
          title="Part 3 recap"
          gist="Postgres for truth, ES for queries, CDC to keep them in sync. Index through aliases. Reindex needs to be fast enough to be a routine tool, not a project."
          points={[
            { takeaway: "CDC beats dual-write at any non-trivial scale.", detail: "Dual-write has a partial-failure race. CDC makes Postgres the source of truth and ES purely derived." },
            { takeaway: "Indexing lag is real and visible to users.", detail: "Sub-second to seconds in steady state. Read-your-writes after a write should bypass the search index." },
            { takeaway: "Always query through an alias.", detail: "Aliases let you swap index versions atomically. Without them, schema changes are a multi-deploy nightmare." },
            { takeaway: "Make reindex fast enough to be a tool.", detail: "If you can rebuild ES from Postgres in hours, drift is fixable on demand. If it takes days, you're always firefighting." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-3">What this didn&apos;t cover</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>Vector search and hybrid retrieval (BM25 + embeddings) — that&apos;s its own module.</li>
          <li>Learned ranking (LambdaMART, neural rerankers) on top of BM25 first-stage retrieval.</li>
          <li>Specific Debezium configuration, Kafka Connect ergonomics, ES cluster sizing.</li>
          <li>Search analytics — query logging, click-through rate, feedback loops to tune ranking.</li>
        </ul>
      </section>

      <section className="my-12 text-center">
        <p className="text-sm text-slate-500 mb-2">Phase 2 complete</p>
        <Link href="/courses/system-design" className="inline-block text-lg font-semibold text-cyan-600 hover:underline">
          Back to all modules — Phase 3 covers messaging and event-driven systems →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="search-systems" />
    </article>
  );
}
