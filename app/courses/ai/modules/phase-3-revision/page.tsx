import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/ai";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 15-20 minutes before shipping a RAG feature, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

// RAG pipeline diagram — ingest path on top, query path on bottom. The whole
// retrieval stack on one picture: this is the mental model the rest of the card
// fills in.
const ragPipelineChart = `
flowchart LR
    subgraph INGEST["Ingest (offline, once per corpus update)"]
      direction LR
      L["Load<br/>docs"] --> S["Split<br/>chunk"]
      S --> E1["Embed<br/>1 call/batch"]
      E1 --> V["VectorStore<br/>pgvector"]
    end
    subgraph QUERY["Query (online, per request)"]
      direction LR
      Q["User<br/>question"] --> E2["Embed<br/>query"]
      E2 --> R["Retrieve<br/>top-K"]
      R --> RR["Re-rank<br/>optional"]
      RR --> A["Assemble<br/>prompt"]
      A --> G["LLM<br/>generate"]
      G --> O["Answer<br/>+ citations"]
    end
    V -. "kNN lookup" .-> R
    style L fill:#10b981,color:#fff,stroke:#059669
    style S fill:#10b981,color:#fff,stroke:#059669
    style E1 fill:#10b981,color:#fff,stroke:#059669
    style V fill:#059669,color:#fff,stroke:#047857
    style Q fill:#3b82f6,color:#fff,stroke:#2563eb
    style E2 fill:#3b82f6,color:#fff,stroke:#2563eb
    style R fill:#3b82f6,color:#fff,stroke:#2563eb
    style RR fill:#8b5cf6,color:#fff,stroke:#7c3aed
    style A fill:#3b82f6,color:#fff,stroke:#2563eb
    style G fill:#f59e0b,color:#fff,stroke:#d97706
    style O fill:#10b981,color:#fff,stroke:#059669
  `.trim();

export default function Phase3RevisionModule() {
  const mod = getModuleBySlug("phase-3-revision")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/ai"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 3 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          {mod.title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          {mod.subtitle}
        </p>
        <BookmarkButton courseId="ai" moduleSlug="phase-3-revision" />
        <ModuleProgress moduleSlug="phase-3-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          This is not new material. It&apos;s a <strong>map of Phase 3</strong> — every decision, every operator, every gotcha from embeddings, pgvector, RAG architecture, and the Spring AI pipeline, compressed onto one page. If something here is unfamiliar, jump back to the source module. If it&apos;s familiar, keep reading. Treat this as the page you re-read on the plane the morning you ship the RAG feature.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
          The four modules you&apos;re consolidating: <Link href="/courses/ai/modules/embeddings-deep" className="text-emerald-600 hover:underline">Embeddings deep dive</Link>, <Link href="/courses/ai/modules/pgvector" className="text-emerald-600 hover:underline">Vector DBs &amp; pgvector</Link>, <Link href="/courses/ai/modules/rag-architecture" className="text-emerald-600 hover:underline">RAG architecture</Link>, and <Link href="/courses/ai/modules/rag-spring" className="text-emerald-600 hover:underline">RAG in Spring Boot end-to-end</Link>.
        </p>

        <div className="mt-5">
          <Callout variant="insight">
            <strong>What this card covers:</strong> the embedding model marketplace, vector index trade-offs (HNSW vs IVFFlat), the full RAG pipeline as one diagram, chunking strategies with the right knobs, retrieval/re-ranking/context-window budgeting, the Spring AI primitives (<code>VectorStore</code>, <code>EmbeddingModel</code>, <code>QuestionAnswerAdvisor</code>), and four BAD/GOOD pairs for the bugs that actually bite in production.
          </Callout>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Embeddings cheat-sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. Embeddings cheat-sheet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          An embedding is a <strong>fixed-length vector of floats</strong> that places a piece of text at a coordinate in a learned semantic space. Two texts that mean similar things land near each other; the distance metric is how you measure &quot;near&quot;.
        </p>

        <h3 className="text-base font-semibold mb-2">Pick a model — dimensions vs quality vs cost</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Dims</th>
                <th className="px-4 py-3 font-semibold">Cost / 1M tokens</th>
                <th className="px-4 py-3 font-semibold">When to pick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono text-xs">text-embedding-3-small</td>
                <td className="px-4 py-3">1536 (matryoshka 256–1536)</td>
                <td className="px-4 py-3 text-emerald-600">~$0.02</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default. Cheap, fast, MTEB ~62. Truncate to 512 dims for 4× storage savings, &lt;1% recall loss.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">text-embedding-3-large</td>
                <td className="px-4 py-3">3072 (matryoshka)</td>
                <td className="px-4 py-3 text-amber-600">~$0.13</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">When recall@10 isn&apos;t cutting it on a hard domain. ~6.5× the cost of small.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">voyage-3-large</td>
                <td className="px-4 py-3">1024</td>
                <td className="px-4 py-3 text-amber-600">~$0.18</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Top-of-MTEB right now. Worth the swap if you&apos;ve already tuned chunking and re-ranking.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">cohere-embed-v3</td>
                <td className="px-4 py-3">1024</td>
                <td className="px-4 py-3 text-amber-600">~$0.10</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Strong on multilingual, has separate input types (search_document vs search_query).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">bge-large-en-v1.5</td>
                <td className="px-4 py-3">1024</td>
                <td className="px-4 py-3 text-emerald-600">$0 (self-host)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Open weights, runs on a single GPU. Pick when data residency or cost rules out APIs.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">Distance metrics — and why most of the time it doesn&apos;t matter</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Metric</th>
                <th className="px-4 py-3 font-semibold">Formula intuition</th>
                <th className="px-4 py-3 font-semibold">pgvector op</th>
                <th className="px-4 py-3 font-semibold">When to pick</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Cosine</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Angle between vectors — ignores magnitude</td>
                <td className="px-4 py-3 font-mono text-xs">{`<=>`}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Default for text. Robust to length differences.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Inner product (dot)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cosine × magnitudes — magnitude carries signal</td>
                <td className="px-4 py-3 font-mono text-xs">{`<#>`}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Faster than cosine <em>when vectors are L2-normalized</em>. Identical results if normalized.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">L2 (euclidean)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Straight-line distance</td>
                <td className="px-4 py-3 font-mono text-xs">{`<->`}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Rare for text. Use when the embedder explicitly recommends it.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>The L2-normalization trick:</strong> OpenAI, Voyage, Cohere, BGE all return L2-normalized vectors (length 1). On normalized vectors, <em>cosine and inner product give the same ranking</em>, but inner product is ~30% faster because there&apos;s no division. Use <code>{`<#>`}</code> over <code>{`<=>`}</code> when you know your vectors are normalized — and remember to <em>negate</em> the result if your code expects &quot;smaller is closer&quot;, since pgvector returns negative inner product.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/embeddings-deep" className="text-emerald-600 hover:underline">Module 15 — Embeddings deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Vector DBs & pgvector */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. Vector DBs &amp; pgvector — HNSW vs IVFFlat</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Below ~50k rows, brute-force kNN over a sequential scan is fine. Past that, you need an Approximate Nearest Neighbor index. pgvector ships two: HNSW and IVFFlat. Pick HNSW.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Dimension</th>
                <th className="px-4 py-3 font-semibold">HNSW</th>
                <th className="px-4 py-3 font-semibold">IVFFlat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Recall @ default params</td>
                <td className="px-4 py-3 text-emerald-600">~0.95–0.99</td>
                <td className="px-4 py-3 text-amber-600">~0.80–0.90 (sensitive to <code>lists</code>)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Query latency (1M rows)</td>
                <td className="px-4 py-3 text-emerald-600">~5–20ms</td>
                <td className="px-4 py-3 text-amber-600">~10–40ms</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Build time</td>
                <td className="px-4 py-3 text-rose-600">Slow (~10× IVFFlat)</td>
                <td className="px-4 py-3 text-emerald-600">Fast</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Memory</td>
                <td className="px-4 py-3 text-rose-600">High (graph in RAM)</td>
                <td className="px-4 py-3 text-emerald-600">Lower</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Incremental inserts</td>
                <td className="px-4 py-3 text-emerald-600">Cheap — append to graph</td>
                <td className="px-4 py-3 text-amber-600">Cheap but recall degrades; rebuild periodically</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Tuning knob to remember</td>
                <td className="px-4 py-3 font-mono text-xs">m = 16, ef_construction = 64<br/>query: ef_search</td>
                <td className="px-4 py-3 font-mono text-xs">lists ≈ √N or N/1000<br/>query: probes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">When it wins</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Almost always. Read-heavy, recall matters, can afford build time.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Rebuilding nightly from scratch, RAM-constrained, &lt; 1M rows.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-semibold mb-2">Index creation — what you actually type</h3>
        <CodeBlock lang="plain" caption="HNSW index — the default you should reach for">{`-- enable the extension once per database
CREATE EXTENSION IF NOT EXISTS vector;

-- table with a 1536-dim embedding column
CREATE TABLE docs (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    tenant_id BIGINT NOT NULL,
    embedding vector(1536) NOT NULL
);

-- HNSW index on the cosine operator class
CREATE INDEX docs_embedding_hnsw
    ON docs USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- per-session: turn up recall at query time (costs latency)
SET hnsw.ef_search = 100;`}</CodeBlock>

        <CodeBlock lang="plain" caption="IVFFlat — only when build time / memory matter more than recall">{`-- IVFFlat: pick lists ≈ sqrt(row_count) for &lt; 1M rows, row_count / 1000 above that
CREATE INDEX docs_embedding_ivf
    ON docs USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- probe more partitions for higher recall (trades latency)
SET ivfflat.probes = 10;`}</CodeBlock>

        <CodeBlock lang="plain" caption="The three distance operators — pick the one matching your operator class">{`-- operator class       operator   meaning
-- vector_cosine_ops     <=>        cosine distance (1 - cosine_similarity)
-- vector_ip_ops         <#>        negative inner product (use ORDER BY ASC)
-- vector_l2_ops         <->        L2 distance

SELECT id, content, embedding <=> $1::vector AS distance
FROM   docs
WHERE  tenant_id = $2
ORDER  BY embedding <=> $1::vector
LIMIT  10;`}</CodeBlock>

        <Callout variant="warn">
          <strong>The metadata-filter gotcha:</strong> a <code>WHERE tenant_id = ?</code> on top of an ANN index can blow up recall — pgvector applies the ANN search first, then filters, so you can lose most of your candidates. Fix: <strong>partial indexes per tenant</strong> if you have few tenants, or use the iterative-scan feature (pgvector 0.8+) to keep scanning until you have enough post-filter results. Always pre-filter on cheap columns; never trust top-K to survive an aggressive WHERE clause.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/pgvector" className="text-emerald-600 hover:underline">Module 16 — Vector DBs &amp; pgvector</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — The RAG pipeline diagram */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The RAG pipeline on one diagram</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Every RAG system you&apos;ll build looks like this. Ingest happens once (or when the corpus changes); query happens per request. The shared piece is the vector store.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={ragPipelineChart} />
        </div>

        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5">
          <li><strong>Ingest is offline</strong>: load documents, split into chunks, embed (batched!), write to the vector store with metadata.</li>
          <li><strong>Query is online</strong>: embed the user&apos;s question with the <em>same model</em>, retrieve top-K by similarity, optionally re-rank with a cross-encoder, assemble a grounded prompt, generate.</li>
          <li><strong>Citations close the loop</strong>: every chunk that made it into the prompt should round-trip back to the user as a source link — both for trust and for debugging your retrieval.</li>
          <li><strong>The two failure modes you should always be debugging:</strong> the right chunk didn&apos;t make it into top-K (retrieval bug — fix chunking, top-K, or the embedding model), or it did and the LLM ignored it (generation bug — fix the prompt template or re-rank harder).</li>
        </ul>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/rag-architecture" className="text-emerald-600 hover:underline">Module 17 — RAG architecture</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Chunking strategies */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Chunking — the lever that matters most</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Bad chunking is the single most common reason a RAG system feels stupid. Each strategy has a regime where it wins.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Fixed-size · 256 tokens</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Cut every N tokens. Mid-sentence splits, mid-table splits.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: corpus is huge, uniform prose, you need the baseline.</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Sentence-boundary</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Split on <code>. ! ?</code>, pack sentences into chunks up to a max. Never splits mid-sentence.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: prose-heavy corpus (docs, articles).</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Recursive character</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Try paragraph splits first, fall back to sentence, fall back to word. The LangChain default.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: mixed-format corpora, a sensible default.</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Structural (markdown-aware)</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Split on headings — H1/H2/H3. Each chunk is one logical section.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: technical docs, runbooks, anything with a TOC. Usually the best.</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">Semantic</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Embed sentences, cut where consecutive sentences are far apart in embedding space.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: long, topic-drifting prose. Adds embedding cost at ingest.</div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Sliding-window overlap</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Any chunker + N tokens overlap between adjacent chunks. Cheap insurance against boundary loss.</p>
            <div className="text-xs font-semibold text-slate-500">Wins when: always. 10–20% overlap is nearly free.</div>
          </div>
        </div>

        <h3 className="text-base font-semibold mb-2">Chunk size vs recall — the curve</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Chunk size</th>
                <th className="px-4 py-3 font-semibold">Recall behavior</th>
                <th className="px-4 py-3 font-semibold">Failure mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono">~50 tokens</td>
                <td className="px-4 py-3 text-rose-600">Low</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Loses surrounding context. Embeddings of fragments are noisy.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">~200–400 tokens</td>
                <td className="px-4 py-3 text-emerald-600">Sweet spot</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">One coherent idea per chunk. Most RAG systems live here.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">~1000+ tokens</td>
                <td className="px-4 py-3 text-amber-600">Drops again</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Multi-topic chunks dilute the embedding. Top-K wastes window on irrelevant prose.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Metadata you should always attach to every chunk:</strong> <code>source</code> (file/URL), <code>section</code> or <code>heading</code>, <code>page</code> or <code>line_range</code>, <code>tenant_id</code> or <code>workspace_id</code>, <code>created_at</code>. The first three power citations, the fourth powers multi-tenancy, the fifth powers &quot;only retrieve from docs newer than X&quot;. Skipping this at ingest is the #1 reason a v2 ships an embarrassing schema migration.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/rag-architecture" className="text-emerald-600 hover:underline">Module 17 — RAG architecture</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Retrieval & context assembly */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Retrieval &amp; context assembly</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Three levers compose: how many you retrieve (top-K), which retrievers you blend (hybrid), and how you re-order before prompting (re-rank + ordering).
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Top-K choice</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>K = 1</strong>: fragile. One bad nearest neighbor and the answer is wrong.</li>
              <li><strong>K = 4–10</strong>: the practical range. Diversity + headroom for re-ranking.</li>
              <li><strong>K &gt; 20</strong>: only if you re-rank aggressively or expand into &quot;parent&quot; documents afterward.</li>
              <li>If you can&apos;t re-rank, prefer the <strong>lower</strong> K and tighter chunks.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-sky-50/40 dark:bg-sky-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Hybrid retrieval (vector + BM25)</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Vector catches paraphrases. BM25 catches exact tokens (error codes, IDs, function names).</li>
              <li>Run both, fuse with <strong>Reciprocal Rank Fusion</strong>: <code>score = Σ 1/(60 + rank_i)</code>.</li>
              <li>In Postgres: <code>tsvector @@ tsquery</code> for BM25-ish + <code>embedding {`<=>`} $1</code> for vector, fused in app code.</li>
              <li>Almost always beats either retriever alone, especially on queries with named entities.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-violet-50/40 dark:bg-violet-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-2">Re-ranking with a cross-encoder</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Bi-encoder (the embedding model): one tower per side, cheap, used for retrieval.</li>
              <li>Cross-encoder: query + chunk go through the same model — much more accurate, much slower.</li>
              <li>Retrieve K = 50 with embeddings, re-rank to top 5–8 with a cross-encoder. Standard pattern.</li>
              <li>Cohere Rerank, BGE-Reranker, Voyage Rerank — pick one, plug it in, recall@5 jumps 10–30%.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-amber-50/40 dark:bg-amber-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Context-window budget</div>
            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5">
              <li>Budget by tokens, not chunk count. Reserve room for: system prompt, history, citations, response.</li>
              <li>Rule of thumb: retrieved chunks ≤ 40–60% of the input budget.</li>
              <li>Past ~50K tokens, attention quality degrades and cost spikes — don&apos;t cram &quot;in case&quot;.</li>
              <li><strong>Lost in the middle</strong>: LLMs over-weight the first and last chunks. Put the highest-ranked chunk <em>last</em>, weakest in the middle.</li>
            </ul>
          </div>
        </div>

        <CodeBlock lang="plain" caption="Prompt template that almost always works">{`You are a precise assistant. Answer ONLY using the sources below.
If the sources don't contain the answer, say "I don't know based on the provided sources."
Cite sources inline as [1], [2], etc.

Sources:
[1] {source_1_chunk}  (from {source_1_path}, section {source_1_section})
[2] {source_2_chunk}  (from {source_2_path}, section {source_2_section})
[3] {source_3_chunk}  (from {source_3_path}, section {source_3_section})

Question: {user_question}
Answer:`}</CodeBlock>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/ai/modules/rag-architecture" className="text-emerald-600 hover:underline">Module 17 — RAG architecture</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Spring AI + pgvector end-to-end */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">6. Spring AI + pgvector end-to-end</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          The three primitives you actually use in Spring AI for RAG: <code>EmbeddingModel</code>, <code>VectorStore</code>, and <code>QuestionAnswerAdvisor</code>. Everything else is plumbing.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">Embedding service — one call per batch, always</h3>
        <CodeBlock lang="java" caption="Batched embedding via Spring AI's EmbeddingModel">{`@Service
public class EmbeddingService {
    private final EmbeddingModel model;

    public EmbeddingService(EmbeddingModel model) { this.model = model; }

    public List<float[]> embedBatch(List<String> texts) {
        // ONE network call for the whole batch, not one per text.
        EmbeddingResponse resp = model.embedForResponse(texts);
        return resp.getResults().stream()
            .map(r -> r.getOutput())
            .toList();
    }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold mt-8 mb-2">VectorStore — the abstraction over pgvector</h3>
        <CodeBlock lang="java" caption="Ingest: Document → VectorStore.add() with metadata">{`@Service
public class DocsService {
    private final VectorStore store;
    public DocsService(VectorStore store) { this.store = store; }

    public void ingest(List<Chunk> chunks) {
        List<Document> docs = chunks.stream()
            .map(c -> new Document(
                c.text(),
                Map.of(
                    "source",  c.source(),
                    "section", c.section(),
                    "tenant",  c.tenant()
                )
            ))
            .toList();
        // VectorStore.add() embeds + writes in one call.
        store.add(docs);
    }
}`}</CodeBlock>

        <CodeBlock lang="java" caption="Retrieve with a metadata filter — tenant-scoped, top-K">{`public List<Document> retrieve(String query, long tenantId) {
    SearchRequest req = SearchRequest.query(query)
        .withTopK(8)
        .withSimilarityThreshold(0.7)
        .withFilterExpression("tenant == " + tenantId);
    return store.similaritySearch(req);
}`}</CodeBlock>

        <h3 className="text-lg font-semibold mt-8 mb-2">QuestionAnswerAdvisor — RAG in 10 lines</h3>
        <CodeBlock lang="java" caption="Advisor: retrieve + assemble + generate, wired into ChatClient">{`@Service
public class AnswerService {
    private final ChatClient chat;

    public AnswerService(ChatClient.Builder builder, VectorStore store) {
        this.chat = builder
            .defaultAdvisors(new QuestionAnswerAdvisor(
                store,
                SearchRequest.defaults().withTopK(6)
            ))
            .build();
    }

    public String answer(String question) {
        return chat.prompt().user(question).call().content();
    }
}`}</CodeBlock>

        <h3 className="text-lg font-semibold mt-8 mb-2">When to use the advisor vs roll your own</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-disc pl-5 not-prose">
          <li><strong>Advisor:</strong> internal tools, chatbots, prototypes — anywhere you don&apos;t need explicit citation control or custom prompt assembly.</li>
          <li><strong>Hand-rolled (retrieve + prompt yourself):</strong> when you need numbered citations, structured output, a custom rerank step, or hybrid (BM25 + vector) retrieval. Drop to <code>JdbcTemplate</code> for the hybrid query; keep <code>VectorStore</code> for ingest.</li>
          <li><strong>The 80/20 split:</strong> advisor handles the easy 80%; the hard 20% always wants direct control.</li>
        </ul>

        <Callout variant="warn">
          <strong>Same model on both sides.</strong> Whatever <code>EmbeddingModel</code> you embed your corpus with, the <code>VectorStore</code> must use the <em>same one</em> for query embeddings. Mismatched models = vectors in different spaces = retrieval returns garbage. If you change models, you must <strong>re-embed the entire corpus</strong>.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 not-prose">
          Source: <Link href="/courses/ai/modules/rag-spring" className="text-emerald-600 hover:underline">Module 18 — RAG in Spring Boot end-to-end</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Common gotchas (BAD/GOOD pairs) */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">7. Four gotchas that bite people</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each of these has burned real engineers. If you only remember four things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Chunks too small lose context</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              50-token chunks have noisy embeddings — there&apos;s not enough text to define a stable point in semantic space. You retrieve near-misses for everything.
            </p>
            <CodeBlock lang="java" caption="BAD — 50-token chunks, mid-sentence breaks">{`// 50 token chunks — too small, mid-sentence
TextSplitter splitter = new TokenTextSplitter(50, 0, 5, 10000, true);
List<Document> chunks = splitter.apply(docs);`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — ~300 tokens, sentence-aware, 50-token overlap">{`// ~300 tokens, paragraph-first with sentence fallback, 50-token overlap
TextSplitter splitter = new TokenTextSplitter(300, 50, 50, 10000, true);
List<Document> chunks = splitter.apply(docs);`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · top-K=1 with no diversity</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              K=1 means one bad nearest neighbor = wrong answer. And without MMR or re-ranking, top-K often returns near-duplicates from the same document — wasting the window.
            </p>
            <CodeBlock lang="java" caption="BAD — single chunk, no diversity">{`List<Document> ctx = store.similaritySearch(
    SearchRequest.query(q).withTopK(1)
);`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — over-fetch, re-rank, return diverse top 5">{`// Over-fetch K=30, re-rank with a cross-encoder to top 5
List<Document> candidates = store.similaritySearch(
    SearchRequest.query(q).withTopK(30)
);
List<Document> top = reranker.rerank(q, candidates, 5);  // cohere/bge/voyage`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · No tenant/workspace filter</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              In any multi-user system, an unfiltered similarity search will happily return Tenant B&apos;s chunks to Tenant A. This is a data-leak bug, not a relevance bug.
            </p>
            <CodeBlock lang="java" caption="BAD — global similarity search, no scope">{`List<Document> ctx = store.similaritySearch(
    SearchRequest.query(q).withTopK(6)
);  // returns chunks from EVERY tenant`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — always scope by tenant in the filter expression">{`List<Document> ctx = store.similaritySearch(
    SearchRequest.query(q)
        .withTopK(6)
        .withFilterExpression("tenant == " + tenantId)
);`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Re-embedding the corpus on every query</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Embed corpus chunks <strong>once</strong> at ingest, store the vectors, reuse forever. Re-embedding the corpus per query torches your embedding budget and turns p99 latency into seconds.
            </p>
            <CodeBlock lang="java" caption="BAD — embeds all docs on every query">{`public List<Document> search(String q, List<String> allDocs) {
    float[] qVec = model.embed(q);
    return allDocs.stream()
        .map(d -> new Scored(d, cosine(qVec, model.embed(d))))  // re-embed!
        .sorted(...).limit(6).map(...)
        .toList();
}`}</CodeBlock>
            <CodeBlock lang="java" caption="GOOD — corpus embedded once, persisted, queried via index">{`// Ingest path (offline) — embed once, write to VectorStore
public void ingestOnce(List<Document> docs) {
    store.add(docs);  // VectorStore embeds + writes
}

// Query path (online) — embed only the query, ANN lookup hits the index
public List<Document> search(String q) {
    return store.similaritySearch(
        SearchRequest.query(q).withTopK(6)
    );
}`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">8. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="Your Spring app indexes 80k support tickets in pgvector. Recall@10 sits at 0.72 with text-embedding-3-small. You've already tuned chunking. What's the highest-leverage single change?"
          options={[
            { label: "Switch to text-embedding-3-large and re-embed the entire corpus.", correct: true, explanation: "Right. Once chunking is tuned, the embedder is the next biggest lever — large jumps MTEB by ~3 points, which on a hard domain usually moves recall@10 from 0.72 toward 0.85+. The 6.5× cost is fine at 80k docs. The trap is doing this before tuning chunking; the order matters." },
            { label: "Switch from HNSW to IVFFlat to query more partitions.", explanation: "Wrong direction. HNSW has higher recall than IVFFlat at default params. If you suspect index recall, raise ef_search on HNSW — don't switch to a less accurate index." },
            { label: "Increase top-K from 10 to 100 without re-ranking.", explanation: "You'd dilute the prompt with mostly-irrelevant chunks and hit lost-in-the-middle. K=100 only helps if you re-rank back down to 5–8." },
            { label: "Switch the distance operator from cosine to L2.", explanation: "On L2-normalized embeddings (which OpenAI returns), cosine and L2 give the same ranking. Won't move recall." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're building a vector index over 5M product descriptions. New products are added all day; recall has to stay above 0.95. Which index and why?"
          options={[
            { label: "HNSW with m=16, ef_construction=64 — and tune ef_search at query time.", correct: true, explanation: "Right. HNSW gives the recall you need at default params, accepts incremental inserts cheaply, and ef_search lets you trade latency for recall per query. The slow build time is a one-time cost." },
            { label: "IVFFlat with lists=√N — it's faster to build.", explanation: "IVFFlat is faster to build but tops out at ~0.85–0.90 recall and degrades as you insert new rows without rebuilding. Doesn't meet the 0.95 bar." },
            { label: "Brute-force sequential scan — pgvector can handle 5M.", explanation: "5M × 1536 floats = ~30GB of vector math per query. At ANN scale you need an index. Brute force is fine under ~50k rows." },
            { label: "Drop pgvector for Pinecone before benchmarking.", explanation: "Premature. HNSW in pgvector handles 5M rows comfortably for most workloads. Switch DBs when you've actually measured a bottleneck." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your corpus is technical Markdown docs with H1/H2 headings. Each doc is ~3000 words. Which chunking strategy is the most defensible default?"
          options={[
            { label: "Fixed 256-token chunks with no overlap.", explanation: "Throws away the structure your docs already provide. Mid-section cuts hurt embedding quality." },
            { label: "Structural splitter on H2 headings, with a 50-token sliding overlap between adjacent chunks.", correct: true, explanation: "Right. Markdown headings give you free semantic boundaries — each H2 section is one coherent idea. The overlap covers questions that span the boundary. This is the strategy that wins on technical docs and the one Spring AI's structural transformers are designed for." },
            { label: "Semantic chunking — embed every sentence and cut on embedding drift.", explanation: "Works but is expensive at ingest (you embed everything twice) and overkill when the docs already have headings. Reach for it when there's no structure to exploit." },
            { label: "Whole-document chunks — let the LLM's context window handle it.", explanation: "3000 words × N docs blows your context budget and exposes you to lost-in-the-middle. Top-K over chunks is what makes RAG efficient." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're tuning top-K. You can retrieve K candidates from the vector store and then re-rank to N before prompting. What's the canonical pattern?"
          options={[
            { label: "K=1, N=1 — fastest path.", explanation: "Zero headroom. A single bad nearest neighbor sinks the answer. K=1 only works on toy data." },
            { label: "K=8 with no re-rank, send all 8 to the LLM.", explanation: "Decent but leaves accuracy on the table — and risks duplicates eating your window. Re-ranking is the cheapest accuracy lever you can add." },
            { label: "K=30–50 from the vector store, re-rank with a cross-encoder, send top N=5–8 to the LLM.", correct: true, explanation: "Right. The bi-encoder gives you cheap recall; the cross-encoder gives you precision. Over-fetching + re-ranking is how every production RAG system over a certain quality bar is built." },
            { label: "K=200, send all 200 to the LLM — the model can sort it out.", explanation: "Burns context, costs more, hurts answer quality because of lost-in-the-middle. The LLM is not your re-ranker." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="An eval flags that your RAG system retrieves the correct chunk into top-5 but the final answer ignores it. Where do you look first?"
          options={[
            { label: "Swap embedding models.", explanation: "Retrieval is already working — the right chunk made it into top-5. The bug is downstream of retrieval." },
            { label: "Rebuild the HNSW index with higher ef_construction.", explanation: "Same reason. The index is doing its job; the chunk is reaching the prompt." },
            { label: "Re-order the prompt so the highest-ranked chunk is last, not in the middle, and tighten the system prompt to say 'answer ONLY using the sources below'.", correct: true, explanation: "Right. This is the lost-in-the-middle pattern: LLMs over-weight the start and end of the context. Putting the strongest chunk last, plus a strict system prompt, moves the needle when retrieval is healthy but generation isn't using what you gave it." },
            { label: "Lower top-K to 1.", explanation: "Brittle and doesn't address the bug. The right chunk is already in there — you need the model to actually use it." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — You're ready for Phase 4 when... */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-3">9. You&apos;re ready for Phase 4 when...</h2>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-green-950/30 p-6">
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2 list-none pl-0">
            <li>✓ You can pick an embedding model on the cost / dimensions / recall axes without thinking twice — and you know why text-embedding-3-small with matryoshka truncation is the sane default.</li>
            <li>✓ You reach for <strong>HNSW</strong> by default, know how to tune <code>ef_search</code> at query time, and know which pgvector operator (<code>{`<=>`}</code>, <code>{`<#>`}</code>, <code>{`<->`}</code>) matches your operator class.</li>
            <li>✓ You can draw the full RAG pipeline on a whiteboard: <strong>load → split → embed → store → embed-query → retrieve → re-rank → assemble → generate</strong>, and explain which stage owns which failure mode.</li>
            <li>✓ You can defend a chunking choice: which strategy, what size, how much overlap, what metadata.</li>
            <li>✓ You know the over-fetch + re-rank pattern (K=30–50, re-rank to 5–8), can fuse vector + BM25 with RRF, and understand lost-in-the-middle ordering.</li>
            <li>✓ You can wire <code>EmbeddingModel</code> + <code>VectorStore</code> + <code>QuestionAnswerAdvisor</code> in Spring AI in your sleep — and know when to bypass the advisor for a hand-rolled prompt with numbered citations.</li>
            <li>✓ You always scope by <code>tenant_id</code> in the filter expression, you batch embeddings at ingest, and you&apos;d catch the &quot;re-embedding the corpus per query&quot; bug in code review on sight.</li>
          </ul>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-sky-200 dark:border-sky-900 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">
          Phase 3 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can ship a production RAG feature</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Embeddings as geometry, HNSW vs IVFFlat as a trade-off, the four chunking strategies, hybrid retrieval, re-ranking, lost-in-the-middle, and the Spring AI primitives. That&apos;s the retrieval stack — every &quot;chat with my docs&quot; product you&apos;ll see is some specialization of what you just consolidated.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 4 — Frontend AI Integration.</strong> Streaming SSE into React, optimistic updates, rendering tool calls, and the UX patterns that make AI features feel responsive instead of laggy.
        </p>
        <Link
          href="/courses/ai/modules/react-streaming"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Frontend AI Integration →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="phase-3-revision" />
    </article>
  );
}
