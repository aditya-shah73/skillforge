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
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "what-rag", title: "What RAG actually solves" },
  { id: "chunking", title: "Chunking strategies" },
  { id: "retrieval", title: "Retrieval & reranking" },
  { id: "assembly", title: "Context assembly" },
  { id: "project", title: "Project: doc chunking lab" },
  { id: "final", title: "Final quiz" },
];

export default function RagArchitectureModule() {
  const mod = getModuleBySlug("rag-architecture")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">RAG architecture</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Stop bolting embeddings onto an LLM. Build retrieval that earns its place in the prompt.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="rag-architecture" />
        <ModuleProgress moduleSlug="rag-architecture" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          RAG is the most-deployed and most-misunderstood pattern in AI engineering. By the end of this module
          you&apos;ll have a working <strong>mental model of every stage</strong> — chunking, retrieval,
          reranking, assembly — and you&apos;ll be able to explain why each one exists and when each one
          breaks.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>What RAG actually is, and the 3 problems it&apos;s designed to solve</li>
          <li>The four chunking strategies (fixed, recursive, semantic, structural) and how to pick</li>
          <li>How retrieval really works: top-k vs MMR, hybrid (BM25 + vector), reranking</li>
          <li>Context assembly — how to format chunks so the LLM uses them, with citations</li>
          <li>A doc-chunking lab: feed the same corpus through 4 strategies, compare retrieval quality</li>
        </ul>
      </section>

      {/* ================================================================= */}
      {/* PART 1: WHAT RAG ACTUALLY SOLVES                                    */}
      {/* ================================================================= */}
      <section id="what-rag">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — What RAG actually solves</h2>

        <p>
          RAG (<strong>R</strong>etrieval-<strong>A</strong>ugmented <strong>G</strong>eneration) is a pattern,
          not a product. The pattern: <em>before</em>{" "}you call the LLM, search a knowledge base for relevant
          snippets and stuff them into the prompt. The LLM answers using those snippets as ground truth.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The three problems RAG solves</h3>

        <div className="not-prose my-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-2xl mb-2">🕰️</div>
            <h4 className="font-semibold mb-1">Knowledge cutoff</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
              The LLM was trained months ago. Your docs changed yesterday. RAG closes the gap by retrieving
              fresh content at query time.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-semibold mb-1">Private data</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
              The model never saw your internal wiki, your customers&apos; tickets, or your codebase. RAG lets
              you feed those in without retraining.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-2xl mb-2">📚</div>
            <h4 className="font-semibold mb-1">Hallucination control</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
              When the model has to ground its answer in cited passages, it&apos;s much harder for it to make
              things up — and easier for you to catch when it does.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-3">The shape of every RAG system</h3>

        <p>Five stages. Always five. The names vary, the shape doesn&apos;t:</p>

        <CodeBlock lang="plain">{`         ┌──── INDEXING (offline) ────┐         ┌──── QUERY TIME (online) ────┐
         │                            │         │                              │
docs ─→ chunk ─→ embed ─→ store        │  query ─→ embed ─→ retrieve ─→ rerank ─→ assemble ─→ LLM ─→ answer
         │       (1536d) (pgvector)   │         │  (same   (top-k    (top-3   (system
         │                            │         │   model)  cosine)   reorder) prompt +
         │                            │         │                              context +
         │                            │         │                              question)
         └────────────────────────────┘         └──────────────────────────────┘`}</CodeBlock>

        <p>
          The <strong>indexing</strong>{" "}path runs once per doc (and on updates). The <strong>query time</strong>{" "}
          path runs every request. Most of the work in a RAG project is making one or both of these paths
          better — usually by improving chunking, retrieval, or assembly.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">When RAG is the wrong answer</h3>

        <Callout variant="warn" title="Don't reach for RAG when you don't need to">
          <p className="text-sm m-0">
            If your &quot;knowledge&quot; fits in 50KB and changes rarely, just paste it into the system prompt
            and use prompt caching (Module 13). RAG adds two pieces of infra (vector store + embedding
            pipeline) and a whole new failure mode (retrieval misses). Use it when the knowledge is
            <strong> too big to fit in context</strong>{" "}or <strong>too dynamic to ship in code</strong>. Below
            those thresholds, plain prompt + cache wins.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">RAG vs fine-tuning vs long context</h3>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2"></th>
                <th className="text-left p-2">RAG</th>
                <th className="text-left p-2">Fine-tuning</th>
                <th className="text-left p-2">Stuff it in context</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Best at</td>
                <td className="p-2">Factual recall over a large corpus</td>
                <td className="p-2">Teaching a style or a narrow skill</td>
                <td className="p-2">Small, hot, slowly-changing knowledge</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Updates</td>
                <td className="p-2">Re-index, seconds</td>
                <td className="p-2">Re-train, hours/days</td>
                <td className="p-2">Edit a string</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Citations possible?</td>
                <td className="p-2">Yes, naturally</td>
                <td className="p-2">No</td>
                <td className="p-2">Sort of (point at the prompt)</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Cost shape</td>
                <td className="p-2">Storage + retrieval + prompt tokens</td>
                <td className="p-2">Training cost up front</td>
                <td className="p-2">Big prompt every call (cache it!)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Quiz
          kind="Pulse check"
          question="Your team needs a chatbot that answers customer questions from a 50-page product manual. The manual changes once a quarter. Which approach is leanest?"
          options={[
            { label: "Stand up RAG with pgvector and an embedding pipeline", explanation: "RAG is overkill here. 50 pages fit comfortably in modern context windows, and quarterly changes mean you don't need a real-time index." },
            { label: "Paste the manual into the system prompt and use prompt caching", correct: true, explanation: "50 pages is roughly 25–40k tokens. Modern models handle that easily. Cache the system prompt (Module 13), pay almost nothing per turn, and skip the retrieval failure mode entirely. Reach for RAG when the knowledge outgrows the context window." },
            { label: "Fine-tune a model on the manual", explanation: "Worst choice. Fine-tuning is for style/skills, not factual recall, and changes every quarter would mean re-training every quarter." },
            { label: "Train an embedding model on the manual", explanation: "You don't train embedders for projects this small. You'd use a pretrained one — and you don't even need that here." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="A teammate says 'fine-tuning will let the model remember our docs.' Why is that mostly wrong?"
          options={[
            { label: "Fine-tuning is too expensive", explanation: "It's expensive, but that's not the core reason." },
            { label: "Fine-tuning teaches style/format/narrow skills well; it's a poor mechanism for factual recall, and you can't update the facts without re-training", correct: true, explanation: "Right on both counts. Fine-tuning shifts behavior, not memory. Even when facts do leak in, they're not citable, not updatable, and the model will still confidently make up nearby facts. RAG keeps facts in a place you can edit and verify." },
            { label: "Fine-tuning isn't supported by Claude or OpenAI", explanation: "It is — both have fine-tuning APIs." },
            { label: "Fine-tuning produces worse models", explanation: "Done well, fine-tuning improves models for the target task. The point is it's the wrong tool for facts." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 1 recap"
          gist="RAG is a 5-stage pattern that solves knowledge-cutoff, private-data, and hallucination problems by retrieving relevant snippets and grounding the LLM's answer in them. It's not always the right tool."
          points={[
            { takeaway: "RAG is a pattern, not a product.", detail: "Five stages: chunk → embed → store, then query → retrieve → rerank → assemble → generate. The names vary; the shape doesn't." },
            { takeaway: "Reach for RAG when knowledge is too big or too dynamic for the prompt.", detail: "Below those thresholds, prompt + cache is leaner — fewer moving parts, fewer failure modes, often cheaper." },
            { takeaway: "Fine-tuning is not a knowledge store.", detail: "It teaches behavior. Use RAG (or context) for facts you need to be right, citable, and updatable." },
          ]}
        />

        <Checkpoint moduleSlug="rag-architecture" id="what-rag" title="What RAG actually solves" xp={20} celebration="You can defend when RAG is the right tool. That's harder than building it.">
          <p>
            You should be able to: name the five stages of RAG; pick between RAG, fine-tuning, and
            stuff-it-in-context for a given problem; explain why fine-tuning is a bad knowledge store.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: CHUNKING STRATEGIES                                         */}
      {/* ================================================================= */}
      <section id="chunking">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — Chunking strategies</h2>

        <p>
          You have a 200-page PDF. You can&apos;t embed 200 pages as one vector — the embedding model has a
          token limit (typically 8k), and even if it didn&apos;t, a single vector for a whole book is too
          fuzzy to retrieve usefully. So you split the doc into pieces — <strong>chunks</strong> — and embed
          each one.
        </p>

        <p>
          Chunking is the most important variable in RAG quality. Get it wrong and the rest doesn&apos;t
          matter — your retriever returns mush, and the LLM hallucinates around it.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The four chunking strategies</h3>

        <div className="not-prose my-6 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="font-semibold m-0 mb-2">1. Fixed-size</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0 mb-2">
              Split every N tokens (e.g., 512). Optionally with O tokens of overlap (e.g., 50).
            </p>
            <p className="text-xs text-slate-500 m-0">
              <strong>Good for:</strong>{" "}baseline, uniform corpora (transcripts, plain prose).{" "}
              <strong>Bad for:</strong>{" "}structured docs — splits mid-paragraph, mid-sentence,
              mid-code-block.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="font-semibold m-0 mb-2">2. Recursive (text splitter)</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0 mb-2">
              Try to split on big separators first (<code>\n\n</code>), then medium (<code>\n</code>), then
              small (<code>. </code>), then characters. Stop when chunks are under your target size.
            </p>
            <p className="text-xs text-slate-500 m-0">
              <strong>Good for:</strong>{" "}general prose with paragraph structure. The default in LangChain and
              Spring AI&apos;s <code>TokenTextSplitter</code> is essentially this. <strong>Sweet spot:</strong>{" "}
              start here.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="font-semibold m-0 mb-2">3. Semantic</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0 mb-2">
              Embed each sentence, walk through the doc, start a new chunk when consecutive sentences&apos;
              embeddings drift far apart (a topic boundary).
            </p>
            <p className="text-xs text-slate-500 m-0">
              <strong>Good for:</strong>{" "}long-form essays where topic boundaries don&apos;t align with
              paragraph boundaries. <strong>Cost:</strong>{" "}embeds the corpus twice (once during chunking,
              once for storage).
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <h4 className="font-semibold m-0 mb-2">4. Structural</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 m-0 mb-2">
              Use the doc&apos;s structure: split by Markdown heading, by HTML <code>&lt;section&gt;</code>,
              by code function boundary, by API endpoint.
            </p>
            <p className="text-xs text-slate-500 m-0">
              <strong>Good for:</strong>{" "}docs with explicit hierarchy (READMEs, API specs, source code).
              <strong> Best when</strong>{" "}headings/structure carry semantic weight you want to preserve in
              retrieval.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-3">The three knobs</h3>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Chunk size.</strong>{" "}Bigger chunks = more context per hit, but vaguer embeddings (one
            vector representing more concepts). Smaller chunks = sharper embeddings, but the LLM may need 10
            of them to answer where 2 would have done. <em>Typical: 256–1024 tokens.</em>
          </li>
          <li>
            <strong>Overlap.</strong>{" "}Chunks that share their boundaries (e.g., last 50 tokens of chunk N =
            first 50 of chunk N+1) prevent answers from being &quot;orphaned&quot; right at a split point.
            <em> Typical: 10–20% of chunk size.</em>
          </li>
          <li>
            <strong>Metadata.</strong>{" "}Every chunk should carry: source doc, section/heading path, page
            number, last-modified-at. Critical for citations and for filtering at retrieval time.
          </li>
        </ul>

        <WorkedExample
          title="Picking a chunker for three real corpora"
          subtitle="The same RAG project might need different chunkers for different sources"
          steps={[
            {
              title: "Internal wiki (Markdown)",
              body: (
                <>
                  <p className="text-sm">
                    <strong>Pick:</strong>{" "}structural — split by H2 boundaries, fall back to recursive within
                    each H2 if it&apos;s too big.
                  </p>
                  <p className="text-sm">
                    <strong>Why:</strong>{" "}wiki pages have meaningful section structure. An H2 like
                    &quot;Authentication&quot; or &quot;Rate limits&quot; is exactly the granularity you want
                    to retrieve. Treat the heading path as metadata so &quot;tell me about rate limits&quot;
                    doesn&apos;t pull a paragraph from &quot;authentication&quot;.
                  </p>
                </>
              ),
            },
            {
              title: "Customer support tickets (free-form text)",
              body: (
                <>
                  <p className="text-sm">
                    <strong>Pick:</strong>{" "}one chunk per ticket, no splitting (assuming tickets are short
                    enough to fit in your embedding model&apos;s context).
                  </p>
                  <p className="text-sm">
                    <strong>Why:</strong>{" "}a ticket is a complete unit of meaning. A single ticket embedded as
                    one vector retrieves cleanly. Splitting destroys context (&quot;the user said X, then the
                    agent replied Y, then the user said Z&quot;).
                  </p>
                </>
              ),
            },
            {
              title: "Research papers (long PDFs with sections, equations, tables)",
              body: (
                <>
                  <p className="text-sm">
                    <strong>Pick:</strong>{" "}structural by section, then recursive within section, with the
                    title + abstract concatenated to every chunk.
                  </p>
                  <p className="text-sm">
                    <strong>Why:</strong>{" "}papers have heavy structure. Within a 5-page Methods section,
                    recursive splitting on paragraph boundaries works fine. Prepending the paper title +
                    abstract gives every chunk enough context that &quot;what does this paper say about
                    X&quot; can retrieve a relevant paragraph from any section.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3 className="text-xl font-bold mt-8 mb-3">The one chunking trick that always helps: contextual chunks</h3>

        <p>
          A 500-token chunk that says &quot;...and the timeout defaults to 30 seconds.&quot; is useless without
          knowing what <em>it</em>{" "}is. Anthropic&apos;s &quot;Contextual Retrieval&quot; technique fixes this:
          before embedding each chunk, prepend a one-sentence summary of where it sits in the document.
        </p>

        <CodeBlock lang="plain">{`-- Before contextual chunking:
"...and the timeout defaults to 30 seconds. If the connection is idle for
longer than that, the server closes it..."

-- After contextual chunking:
"This chunk is from the 'Connection Settings' section of the PostgreSQL
operator guide, describing default behavior of the connection pool.

...and the timeout defaults to 30 seconds. If the connection is idle for
longer than that, the server closes it..."`}</CodeBlock>

        <p>
          The summary is generated by a cheap LLM call once per chunk at indexing time. Anthropic reported
          ~35% improvement in retrieval failure rate from this single change.
          <strong> If you&apos;re ever asked &quot;what one thing should I do to make my RAG better?&quot; this is
          the answer most of the time.</strong>
        </p>

        <Callout variant="info" title="Cost vs. quality">
          <p className="text-sm m-0">
            Contextual chunking costs: one cheap LLM call per chunk at indexing. For a 100k-chunk corpus on
            Haiku-class pricing, that&apos;s a few dollars total — paid once. Compared to running a worse
            retriever forever, it&apos;s the easiest win in RAG.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="You're chunking a 50-doc Markdown wiki. Your team picks fixed-size 512-token chunks with no overlap. Retrieval feels okay-but-not-great. What's the most likely first improvement?"
          options={[
            { label: "Increase chunk size to 2048", explanation: "Bigger chunks make embeddings vaguer, not sharper. Usually makes retrieval worse, not better." },
            { label: "Switch to structural chunking on H2 headings, with section-path metadata", correct: true, explanation: "Wiki content has meaningful structure. Fixed-size chunks split mid-section, mid-list, mid-code-block — exactly where context matters most. Structural chunking on heading boundaries (and storing the heading path as metadata) is a one-day change with a big quality bump." },
            { label: "Embed twice and average the vectors", explanation: "Doesn't help — you'd just get the same vector twice." },
            { label: "Switch to a bigger embedding model", explanation: "A bigger model on bad chunks is still bad chunks. Fix chunking first; only then is it worth retesting models." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="True or false: contextual chunking (prepending a one-sentence document-context summary before embedding each chunk) costs zero at query time."
          options={[
            { label: "True", correct: true, explanation: "The cost is at *indexing* time — one cheap LLM call per chunk, paid once. At query time, you just embed the user query and search the (already-contextualized) chunks. No per-query overhead. This asymmetry is what makes it the highest-leverage RAG improvement." },
            { label: "False", explanation: "Contextual chunks are generated and stored at indexing time. Once they're in the index, they cost the same to retrieve as any other chunk." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Chunking dominates RAG quality. Pick the strategy by your corpus's structure, not by what's easy. Contextual chunking is usually the biggest single win you can make."
          points={[
            { takeaway: "Four chunkers: fixed, recursive, semantic, structural.", detail: "Recursive is the safe default. Structural beats it when the doc has real hierarchy. Semantic when topics don't align with paragraphs. Fixed only as a baseline." },
            { takeaway: "Three knobs: size, overlap, metadata.", detail: "256–1024 tokens with 10–20% overlap is the typical zone. Always carry source/section/page as metadata — it powers filtering and citations." },
            { takeaway: "Contextual chunking is the easiest big win.", detail: "Prepend a one-sentence document-context summary before embedding each chunk. Cheap one-time cost at index, no query-time overhead, ~35% lower retrieval-miss rate (Anthropic). If you do one thing this module: do this." },
          ]}
        />

        <Checkpoint moduleSlug="rag-architecture" id="chunking" title="Chunking strategies" xp={25} celebration="You can pick a chunker like a grown-up. This is half the battle.">
          <p>
            You should be able to: pick a chunker for a given corpus and defend the choice; explain the size /
            overlap / metadata trade-offs; describe contextual chunking and when it earns its cost.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: RETRIEVAL & RERANKING                                       */}
      {/* ================================================================= */}
      <section id="retrieval">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — Retrieval &amp; reranking</h2>

        <p>
          Indexing is done. The user asks a question. Now you need to find the right chunks. There&apos;s more
          to retrieval than &quot;cosine similarity, top 5&quot;.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Top-k: the baseline</h3>

        <p>
          Embed the query, find the k chunks with the smallest cosine distance, return them. That&apos;s
          baseline RAG. It works surprisingly well for ~70% of queries. The other 30% is where the work is.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The two failure modes of pure top-k</h3>

        <ol className="list-decimal pl-6 space-y-3">
          <li>
            <strong>Redundancy.</strong>{" "}Top 5 results might be 5 near-copies of the same paragraph,
            especially in corpora with duplicated boilerplate. The LLM gets one piece of information stated
            five ways and misses the actual answer hiding in chunk #7.
          </li>
          <li>
            <strong>Lexical misses.</strong>{" "}The user asks &quot;What&apos;s the SLA on UPS_RB123 alerts?&quot;
            and your docs have &quot;UPS_RB123&quot; as an exact identifier. Vector search may rank a vaguely
            similar paragraph above the one with the literal string match, because embeddings are about
            <em>meaning</em>, not exact tokens.
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">MMR: Maximal Marginal Relevance</h3>

        <p>
          MMR fixes redundancy. After picking each result, it penalizes candidates that are too similar to
          what&apos;s already chosen. The score becomes:
        </p>

        <CodeBlock lang="plain">{`mmr_score(c) = λ · sim(query, c) − (1 − λ) · max(sim(c, already_picked))

λ = 1.0  → pure top-k (no diversity penalty)
λ = 0.5  → balanced (the typical default)
λ = 0.0  → pure diversity (irrelevant!)`}</CodeBlock>

        <p>
          Spring AI&apos;s <code>VectorStore</code> has MMR built-in via
          <code> SearchRequest.builder().topK(20).query(...)</code> with an MMR post-processor. LangChain
          ships it under the same name.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Hybrid retrieval: BM25 + vector</h3>

        <p>
          Hybrid retrieval fixes lexical misses. You run two retrievers in parallel — one vector, one keyword
          (BM25, the classic full-text-search algorithm Lucene/Postgres ts_vector use) — and merge the
          rankings. The vector path catches semantically similar chunks; the BM25 path catches exact-string
          matches.
        </p>

        <p>The standard merge is <strong>Reciprocal Rank Fusion (RRF)</strong>:</p>

        <CodeBlock lang="plain">{`# For each chunk that appears in either ranking:
RRF(c) = Σ over rankings R: 1 / (k + rank_R(c))   # k = 60 is a common default

# Sort by RRF score, take the top n.`}</CodeBlock>

        <p>
          Postgres can do this all in one query: <code>tsvector @@ tsquery</code> for BM25-ish, plus
          <code> embedding &lt;=&gt; query_vec</code> for vector, fused in app code. This is one of pgvector&apos;s
          unique strengths — you don&apos;t need a second search service for hybrid retrieval.
        </p>

        <Callout variant="info" title="When you really need hybrid">
          <p className="text-sm m-0">
            Domain with lots of identifiers, error codes, file paths, model numbers, SQL keywords? Hybrid is
            non-negotiable. Pure conversational corpus (think: customer-facing FAQs)? Vector alone is usually
            fine. Don&apos;t add hybrid prophylactically — measure first.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Reranking: a second, smarter look</h3>

        <p>
          Embedding-based retrieval is a <em>recall</em>{" "}tool. It pulls the top 20–50 candidates from a corpus
          of millions in milliseconds. But the ranking inside that top-50 is rough — embeddings are trained for
          general semantic similarity, not for the specific &quot;does this chunk answer this query?&quot;
          question.
        </p>

        <p>
          A <strong>reranker</strong>{" "}is a second model that scores (query, chunk) pairs more carefully. It
          looks at one pair at a time (a &quot;cross-encoder&quot;) and produces a relevance score. You feed it
          the top 20–50 from the embedding retriever and ask it to reorder them; you keep the new top 3–5.
        </p>

        <CodeBlock lang="plain">{`Vector retriever:   1M chunks → top 50 (fast, fuzzy ranking)
Reranker:           top 50    → top 3–5 (slow, precise ranking)
LLM:                top 3–5   → answer`}</CodeBlock>

        <p>
          Cohere&apos;s <code>rerank-3.5</code> and Voyage&apos;s <code>rerank-2.5</code> are the current
          workhorses (versions roll forward — check each vendor&apos;s docs for the latest tag). Both are paid
          APIs that take a query + list of candidates and return the candidates resorted with relevance scores.
          Cost is milliseconds per call, single digits of cents per thousand documents.
        </p>

        <Callout variant="warn" title="When rerankers earn their cost">
          <p className="text-sm m-0 mb-2">
            Reranking adds latency and a paid API call. It pays off when:
          </p>
          <ul className="text-sm m-0 list-disc pl-5 space-y-1">
            <li>You have many near-duplicates in your top-k that an embedder can&apos;t distinguish</li>
            <li>Your queries are conversational (multi-clause, long), where simple cosine on a single embedding loses signal</li>
            <li>The cost of the LLM seeing wrong context is high (legal, medical, finance)</li>
          </ul>
          <p className="text-sm m-0 mt-2">
            For a small corpus or a chatbot where &quot;close enough&quot; is fine, skip it.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">The metric that actually matters: retrieval recall@k</h3>

        <p>
          Build a 50-query golden set. For each query, hand-label which chunks <em>should</em>{" "}come back.
          Then measure: of the chunks the retriever returned, how many of the right ones are in the top k?
        </p>

        <CodeBlock lang="plain">{`recall@5 = (relevant chunks in top-5) / (total relevant chunks)

If query Q has 3 known-relevant chunks and the retriever returned 2 of them
in the top 5, recall@5 = 2/3 = 0.67 for that query.

Average across all 50 queries → that's your retrieval quality number.`}</CodeBlock>

        <p>
          Tune chunking, retrieval, and reranking against this number. If recall@5 is 0.95, the LLM has the
          info it needs and any answer mistakes are downstream (assembly, prompting, model). If recall@5 is
          0.4, no amount of prompt engineering will save you.
        </p>

        <Quiz
          kind="Pulse check"
          question="Your RAG system answers conversational questions well but fails on queries like 'what does error E_4422 mean?' — even though E_4422 is right there in the docs. What's the architectural fix?"
          options={[
            { label: "Tune ef_search higher in HNSW", explanation: "Recall is fine; it's the *kind* of match that's wrong. The vector retriever is genuinely picking semantically similar chunks; they just don't contain the literal token." },
            { label: "Add hybrid retrieval — BM25 alongside vector, fused with RRF", correct: true, explanation: "Identifier-style queries (error codes, model numbers, file paths) are exactly where exact-token matching beats semantic similarity. The vector path catches conversational queries; BM25 catches lexical ones. Hybrid retrieves both, fuses with RRF, and you get the best of both worlds." },
            { label: "Switch to a bigger embedding model", explanation: "Bigger embedders are still doing semantic similarity. They don't suddenly start preferring literal-string matches." },
            { label: "Increase chunk size", explanation: "Doesn't address the root cause (lexical vs. semantic match)." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="You measure retrieval recall@5 = 0.92 but answer quality is bad. Where should you look?"
          options={[
            { label: "Switch chunkers", explanation: "Recall is high, so chunking is doing its job — the right context is making it through. The problem is downstream." },
            { label: "Downstream: context assembly, prompt design, or the LLM itself", correct: true, explanation: "When recall@5 is high, the retriever isn't the problem — the right chunks ARE arriving. The bug is somewhere after retrieval: maybe assembly is munging the chunks, maybe the prompt isn't telling the model to use them, maybe the model is too small. Diagnose by reading what's actually in the prompt and what comes back." },
            { label: "Increase k to 20", explanation: "More noise won't help; recall is already good." },
            { label: "Add a reranker", explanation: "Reranking helps when retrieval ordering is bad. Recall@5 = 0.92 says the right chunks are in the top 5 — order isn't the binding constraint." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Top-k cosine is the baseline. Add MMR for diversity, BM25-fused-with-vector for lexical matches, and a reranker for last-mile precision — but only when measurement says so."
          points={[
            { takeaway: "Pure top-k has two failure modes: redundancy and lexical misses.", detail: "MMR fixes redundancy by penalizing candidates similar to already-picked ones. Hybrid (BM25 + vector with RRF) fixes lexical misses by adding an exact-string-match path." },
            { takeaway: "Rerankers are recall→precision converters.", detail: "Cheap embedder fetches top 50 fast; expensive cross-encoder reranker resorts them precisely. Used together you get both speed and accuracy. Used alone, neither is enough." },
            { takeaway: "Optimize against recall@k on a hand-labeled golden set.", detail: "Without a golden set you're tuning by vibes. 50 queries with hand-picked relevant chunks is enough to discriminate retriever changes. The number you minimize is retrieval miss rate; everything downstream depends on it." },
          ]}
        />

        <Checkpoint moduleSlug="rag-architecture" id="retrieval" title="Retrieval & reranking" xp={25} celebration="You can debug a retriever. Most teams can't.">
          <p>
            You should be able to: explain MMR vs top-k; defend hybrid retrieval for code/identifier-heavy
            corpora; describe what a reranker is and when it earns its latency; design a recall@k eval.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: CONTEXT ASSEMBLY                                            */}
      {/* ================================================================= */}
      <section id="assembly">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — Context assembly</h2>

        <p>
          The retriever found 5 great chunks. Now you have to put them in a prompt. This is the most
          underestimated stage. A bad prompt template can squander a good retriever.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The template that almost always works</h3>

        <CodeBlock lang="plain">{`SYSTEM:
You are a helpful assistant for {product}. Answer questions using ONLY
the context below. If the context does not contain the answer, say so —
do not make up information.

When you reference information, cite the source like [1], [2], etc.
matching the numbered sources below.

CONTEXT:
[1] (source: docs/auth.md, section: 'OAuth flow')
{chunk_1_text}

[2] (source: docs/auth.md, section: 'Token refresh')
{chunk_2_text}

[3] (source: ticket #4421)
{chunk_3_text}

USER:
{question}`}</CodeBlock>

        <p>Three things this template does that a naive one doesn&apos;t:</p>

        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Tells the model the rules of engagement.</strong> &quot;Answer using ONLY the context&quot;
            and &quot;say so if not present&quot; cuts hallucination dramatically. The model can&apos;t
            be expected to behave well unless you tell it what behavior you want.
          </li>
          <li>
            <strong>Numbers the chunks and asks for citations.</strong>{" "}Citations make the LLM&apos;s reasoning
            auditable. They also force the model to actually <em>look at</em>{" "}the chunks instead of
            confabulating from priors.
          </li>
          <li>
            <strong>Includes source metadata in each chunk header.</strong>{" "}The model uses this when forming
            answers (&quot;According to the OAuth flow section...&quot;) and you can render it as a real link
            in the UI.
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">The order matters: lost-in-the-middle</h3>

        <p>
          When you have many context chunks, LLMs pay more attention to the start and end of the context
          window than to the middle. This is the &quot;lost in the middle&quot; effect, well-documented across
          GPT-4-class and Claude-class models.
        </p>

        <p>Practical implications:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Don&apos;t pass 50 chunks.</strong>{" "}Pass 3–5. More is almost always worse.</li>
          <li>
            <strong>Put the most relevant chunk last.</strong>{" "}Right before the user&apos;s question is the
            highest-attention slot. Some teams reverse the rerank order specifically to surface the top hit at
            the end of the context.
          </li>
          <li>
            <strong>Watch out when you also have a long system prompt.</strong>{" "}System prompt + context +
            question can easily push the actual question into a low-attention zone.
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-8 mb-3">Context window budget</h3>

        <p>
          Context isn&apos;t free. Modern long-context models charge by the token (and Module 13 covered why
          caching is your friend). A reasonable budget for a chat-style RAG app:
        </p>

        <CodeBlock lang="plain">{`System prompt:        ~500 tokens   (cached)
Static instructions:  ~200 tokens   (cached)
Retrieved chunks (5): ~3000 tokens  (varies per query — NOT cached)
Conversation history: ~1500 tokens
User question:        ~50 tokens
─────────────────────────────────
Total per turn:       ~5250 tokens

Of which ~700 is cacheable; ~4550 is paid every turn.`}</CodeBlock>

        <p>
          Notice the retrieved chunks are <em>not</em>{" "}cacheable — they vary by query. If you find yourself
          jamming chunks into the cacheable system prompt &quot;just in case&quot;, you&apos;re defeating
          retrieval.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Citations as a quality signal</h3>

        <p>
          When you ask the model to cite, you can <em>verify</em>{" "}the citations. Did chunk [2] actually say
          what the answer claimed? An automated post-check (search the answer&apos;s claims in the cited
          chunks) catches a class of subtle hallucinations where the model invents a fact and slaps a citation
          on it.
        </p>

        <Callout variant="info" title="Anthropic's citations API">
          <p className="text-sm m-0">
            Claude has a native <code>citations</code> feature: pass document blocks with the request, and the
            response includes structured citation objects pointing to character ranges in those documents.
            That&apos;s strictly better than parsing <code>[1]</code>-style citations out of the answer text.
            Use it when you can.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="Your retriever returns the right chunk every time, but the LLM still sometimes makes up answers that aren't in the context. What's the most leveraged fix?"
          options={[
            { label: "Switch to a bigger model", explanation: "May help marginally, but doesn't address the root cause: your prompt isn't telling the model what to do." },
            { label: "Tighten the prompt: 'Answer using ONLY the context. If the answer isn't there, say so.' Plus require citations.", correct: true, explanation: "Most hallucination-on-good-context comes from prompts that don't constrain the model. Explicit instructions + required citations + a graceful 'I don't know' path collectively cut hallucination dramatically. This is the cheapest, most effective fix." },
            { label: "Lower the LLM temperature", explanation: "Helps a little — but the root cause is missing instructions, not sampling randomness." },
            { label: "Add more context — pass top 20 chunks instead of 5", explanation: "Worse, not better. Lost-in-the-middle effects mean more chunks usually means worse use of any single chunk." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="You're putting 8 chunks in the context. You sort them by relevance score, highest first. Why might this be the wrong order?"
          options={[
            { label: "It's actually the right order — relevance-first is always best", explanation: "Not because of lost-in-the-middle. The most-relevant slot in the context window is often the END, right before the question." },
            { label: "Lost-in-the-middle: the model attends most to the start and end of the context, so putting the best chunk first leaves it in a strong slot — but the slot just before the question is also strong, and many teams reverse to put the top hit last", correct: true, explanation: "Right. The middle is where attention falls off. Both ends are good. The slot immediately before the user's question is often the strongest. Whether you put your top hit first or last, KEEP IT OUT OF THE MIDDLE — and consider passing fewer chunks (3–5) so this matters less." },
            { label: "Relevance-first wastes prompt cache", explanation: "Order doesn't affect cache hits — chunks vary per query and aren't cached anyway." },
            { label: "Newer chunks should always come first", explanation: "Recency isn't inherently relevant. Sort by retrieval score, not timestamp, unless your domain demands it." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Assembly is where retrieval becomes prompt. Rules of engagement, citations, and chunk ordering separate good RAG from mush."
          points={[
            { takeaway: "Tell the model to use ONLY the context, to admit when it doesn't have the answer, and to cite.", detail: "All three together cut hallucination far more than any one alone. The simplest highest-leverage prompt change you can make." },
            { takeaway: "Pass 3–5 chunks, not 50.", detail: "Lost-in-the-middle effects are real and well-documented. More chunks usually hurt; better-ranked chunks always help. If you find yourself wanting more chunks, your retriever or reranker is what needs work." },
            { takeaway: "Order chunks deliberately. Best-last is often the move.", detail: "The slot right before the user's question gets the most attention. If you're ranking your chunks, putting the top-ranked one there often beats putting it first." },
          ]}
        />

        <Checkpoint moduleSlug="rag-architecture" id="assembly" title="Context assembly" xp={20} celebration="You can write a prompt that respects the model's attention budget. Tiny edits, big lifts.">
          <p>
            You should be able to: write a RAG prompt template with rules-of-engagement, citations, and chunk
            metadata; explain lost-in-the-middle and how to mitigate it; budget context tokens against a
            cache.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: PROJECT — DOC CHUNKING LAB                                  */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: doc chunking lab</h2>

        <p>
          The point of this project isn&apos;t to build production RAG (Module 18 will). It&apos;s to make
          you <em>feel</em>{" "}how chunking changes retrieval quality. You&apos;ll feed the same corpus through
          four chunkers, run the same 20 queries, compare recall@5 numbers, and see — viscerally — why
          chunking is the most important variable.
        </p>

        <Callout variant="info" title="What you'll need">
          <p className="text-sm m-0 mb-2">
            • Java 21, Spring Boot 3.5+ (you can reuse the Module 16 project)<br />
            • The pgvector setup from Module 16<br />
            • OpenAI API key (or any embedding provider)<br />
            • A 10–30 page Markdown corpus with real headings — your own README, a public open-source project&apos;s docs, or the Spring Framework reference guide ({" "}
            <a className="text-emerald-600 hover:underline" href="https://docs.spring.io/spring-framework/reference/">a chapter of this</a>{" "}
            is plenty)
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 1 — A Chunker interface</h3>

        <CodeBlock lang="java">{`// Chunker.java
package com.example.chunklab;

import java.util.List;

public interface Chunker {
    String name();
    List<Chunk> chunk(String docId, String text);
}`}</CodeBlock>

        <CodeBlock lang="java">{`// Chunk.java
package com.example.chunklab;

public record Chunk(
    String docId,
    String chunkerName,
    int ordinal,
    String text,
    String section   // the heading path, when known; null otherwise
) {}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 2 — Four implementations</h3>

        <CodeBlock lang="java">{`// 1. Fixed-size: split on token count, no overlap
public class FixedSizeChunker implements Chunker {
    private final int tokenSize;

    public FixedSizeChunker(int tokenSize) { this.tokenSize = tokenSize; }

    public String name() { return "fixed-" + tokenSize; }

    public List<Chunk> chunk(String docId, String text) {
        // Approximation: split by character count (4 chars ~ 1 token).
        // Use a real tokenizer (jtokkit) for production.
        int charsPerChunk = tokenSize * 4;
        List<Chunk> out = new ArrayList<>();
        for (int i = 0, ord = 0; i < text.length(); i += charsPerChunk, ord++) {
            int end = Math.min(i + charsPerChunk, text.length());
            out.add(new Chunk(docId, name(), ord, text.substring(i, end), null));
        }
        return out;
    }
}`}</CodeBlock>

        <CodeBlock lang="java">{`// 2. Recursive: try \\n\\n, then \\n, then '. ', then hard char split
public class RecursiveChunker implements Chunker {
    private final int targetTokens;
    // Non-empty separators only; the empty-string terminator is handled
    // explicitly below as a hard character-window split.
    private static final String[] SEPS = { "\\n\\n", "\\n", ". " };

    public RecursiveChunker(int targetTokens) { this.targetTokens = targetTokens; }
    public String name() { return "recursive-" + targetTokens; }

    public List<Chunk> chunk(String docId, String text) {
        List<String> pieces = recursiveSplit(text, 0);
        List<Chunk> out = new ArrayList<>();
        for (int i = 0; i < pieces.size(); i++) {
            out.add(new Chunk(docId, name(), i, pieces.get(i), null));
        }
        return out;
    }

    private List<String> recursiveSplit(String text, int sepIdx) {
        if (estimateTokens(text) <= targetTokens) {
            return List.of(text);
        }
        // Ran out of separators — fall back to a hard character-window split.
        if (sepIdx >= SEPS.length) {
            int charsPerChunk = targetTokens * 4;  // ~4 chars per token
            List<String> out = new ArrayList<>();
            for (int i = 0; i < text.length(); i += charsPerChunk) {
                out.add(text.substring(i, Math.min(i + charsPerChunk, text.length())));
            }
            return out;
        }
        List<String> out = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String part : text.split(java.util.regex.Pattern.quote(SEPS[sepIdx]))) {
            if (estimateTokens(current.toString()) + estimateTokens(part) > targetTokens) {
                if (!current.isEmpty()) out.addAll(recursiveSplit(current.toString(), sepIdx + 1));
                current.setLength(0);
            }
            current.append(part).append(SEPS[sepIdx]);
        }
        if (!current.isEmpty()) out.addAll(recursiveSplit(current.toString(), sepIdx + 1));
        return out;
    }

    private int estimateTokens(String s) { return s.length() / 4; }
}`}</CodeBlock>

        <CodeBlock lang="java">{`// 3. Structural: split on Markdown H2 headings, keep the heading path as section metadata
public class MarkdownH2Chunker implements Chunker {
    public String name() { return "markdown-h2"; }

    public List<Chunk> chunk(String docId, String text) {
        List<Chunk> out = new ArrayList<>();
        String[] sections = text.split("(?m)^## ");  // split before each H2
        String currentH1 = "";
        // First "section" is everything before the first H2 — typically H1 + intro
        if (!sections[0].isBlank()) {
            String[] firstLines = sections[0].split("\\n", 2);
            if (firstLines[0].startsWith("# ")) currentH1 = firstLines[0].substring(2).trim();
            out.add(new Chunk(docId, name(), 0, sections[0], currentH1));
        }
        for (int i = 1; i < sections.length; i++) {
            String[] headAndBody = sections[i].split("\\n", 2);
            String heading = headAndBody[0].trim();
            String body = headAndBody.length > 1 ? headAndBody[1] : "";
            String sectionPath = currentH1.isEmpty() ? heading : currentH1 + " > " + heading;
            out.add(new Chunk(docId, name(), i, "## " + heading + "\\n" + body, sectionPath));
        }
        return out;
    }
}`}</CodeBlock>

        <CodeBlock lang="java">{`// 4. Contextual chunks: structural split, then prepend a one-sentence
//    document-context summary (generated once at indexing time)
public class ContextualChunker implements Chunker {
    private final Chunker base;
    private final ChatClient chat;   // a cheap model — Haiku, gpt-4o-mini, etc.

    public ContextualChunker(Chunker base, ChatClient chat) {
        this.base = base;
        this.chat = chat;
    }

    public String name() { return "contextual-" + base.name(); }

    public List<Chunk> chunk(String docId, String text) {
        List<Chunk> raw = base.chunk(docId, text);
        List<Chunk> out = new ArrayList<>();
        for (Chunk c : raw) {
            String prefix = chat.prompt()
                .system("Given the following chunk from a larger document, write ONE sentence " +
                        "that situates it in the document — what section, what topic, what role.")
                .user("DOC TITLE: " + docId + "\\n\\nCHUNK:\\n" + c.text())
                .call().content();
            out.add(new Chunk(c.docId(), name(), c.ordinal(),
                              prefix + "\\n\\n" + c.text(), c.section()));
        }
        return out;
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 3 — A 20-query golden set</h3>

        <p>
          Hand-pick 20 queries against your corpus. For each, hand-label which sections (by heading) contain
          the answer.
        </p>

        <CodeBlock lang="java">{`public record GoldenQuery(String question, Set<String> relevantSections) {}

// Example for a Spring docs corpus:
List<GoldenQuery> golden = List.of(
    new GoldenQuery("How do I customize bean creation order?",
        Set.of("Customizing the Nature of a Bean")),
    new GoldenQuery("What annotations work for component scanning?",
        Set.of("Using @Component and Further Stereotype Annotations")),
    new GoldenQuery("How do I inject a list of all beans of a type?",
        Set.of("Autowiring Collaborators")),
    // ... 17 more
);`}</CodeBlock>

        <Callout variant="warn" title="Don't skip the labeling">
          <p className="text-sm m-0">
            Twenty queries is the minimum to discriminate between chunkers. Picking them well is the actual
            craft of this project — they should cover broad/narrow questions, identifier-heavy/conversational
            queries, single-section/multi-section answers. Spend an hour on this; it&apos;s the part you&apos;ll
            apply forever.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 4 — The harness</h3>

        <CodeBlock lang="java">{`@Service
public class ChunkingLab {
    private final EmbeddingModel embedder;
    private final JdbcTemplate jdbc;

    public ChunkingLab(EmbeddingModel e, JdbcTemplate j) { this.embedder = e; this.jdbc = j; }

    public LabResult run(Chunker chunker, String docId, String docText, List<GoldenQuery> golden, int k) {
        // 1. Chunk
        List<Chunk> chunks = chunker.chunk(docId, docText);

        // 2. Index into a separate table per chunker run (so we can compare)
        String table = "chunks_" + chunker.name().replaceAll("[^a-z0-9]", "_");
        jdbc.execute("DROP TABLE IF EXISTS " + table);
        jdbc.execute("CREATE TABLE " + table + " (id BIGSERIAL, section TEXT, text TEXT, embedding vector(1536))");
        for (Chunk c : chunks) {
            float[] vec = embedder.embed(c.text());
            jdbc.update("INSERT INTO " + table + " (section, text, embedding) VALUES (?, ?, ?)",
                c.section(), c.text(), new PGvector(vec));
        }

        // 3. Run each query, measure recall@k
        double totalRecall = 0.0;
        for (GoldenQuery q : golden) {
            float[] qv = embedder.embed(q.question());
            List<String> retrievedSections = jdbc.queryForList(
                "SELECT section FROM " + table + " ORDER BY embedding <=> ? LIMIT ?",
                String.class, new PGvector(qv), k);
            long hits = retrievedSections.stream()
                .filter(q.relevantSections()::contains)
                .count();
            double recall = (double) hits / q.relevantSections().size();
            totalRecall += recall;
        }
        return new LabResult(chunker.name(), chunks.size(), totalRecall / golden.size());
    }

    public record LabResult(String chunker, int chunkCount, double avgRecallAtK) {}
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 5 — Run the comparison</h3>

        <CodeBlock lang="java">{`@Bean
CommandLineRunner runLab(ChunkingLab lab, ChatClient chat, EmbeddingModel embedder) {
    return args -> {
        String docId = "spring-core-ioc";
        String text = Files.readString(Path.of("src/main/resources/spring-core-ioc.md"));
        List<GoldenQuery> golden = loadGoldenSet();
        int k = 5;

        List<Chunker> chunkers = List.of(
            new FixedSizeChunker(512),
            new RecursiveChunker(512),
            new MarkdownH2Chunker(),
            new ContextualChunker(new MarkdownH2Chunker(), chat)
        );

        for (Chunker c : chunkers) {
            var result = lab.run(c, docId, text, golden, k);
            System.out.printf("%-30s  %4d chunks  recall@%d = %.3f%n",
                result.chunker(), result.chunkCount(), k, result.avgRecallAtK());
        }
    };
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 6 — What to expect</h3>

        <p>If your golden set is well-built and your corpus has real structure, the typical pattern is:</p>

        <CodeBlock lang="plain">{`fixed-512                         42 chunks  recall@5 = 0.61
recursive-512                     38 chunks  recall@5 = 0.72
markdown-h2                       18 chunks  recall@5 = 0.81
contextual-markdown-h2            18 chunks  recall@5 = 0.91`}</CodeBlock>

        <p>
          Numbers vary. The pattern usually doesn&apos;t: structural beats fixed by ~10–20 points; contextual
          beats structural by ~10 points. <strong>That&apos;s the lesson.</strong>
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Stretch goals</h3>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Add a hybrid retrieval variant: BM25 (Postgres ts_vector) fused with vector via RRF. Compare to vector-only.</li>
          <li>Add a reranker stage (Cohere or Voyage). Measure the recall@5 → recall@3 improvement.</li>
          <li>Try chunk sizes 256, 512, 1024, 2048 with the recursive chunker. Plot recall vs. chunk count.</li>
          <li>Add a &quot;contextual&quot; variant on the recursive chunker, not just the structural one. Confirm contextual is still a win.</li>
        </ul>

        <Checkpoint moduleSlug="rag-architecture" id="project" title="Project: doc chunking lab" xp={50} manual manualLabel="I felt the chunkers" celebration="You can now feel chunking quality in your bones. That intuition is rare and valuable.">
          <p>
            Mark this done once: you&apos;ve run all four chunkers, written down the recall@5 numbers, and can
            articulate <em>why</em>{" "}the structural and contextual chunkers won — in your own words, against
            your own corpus.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 6: FINAL QUIZ                                                  */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 6 — Final quiz</h2>

        <Quiz
          kind="Final check"
          question="A teammate proposes RAG for a chatbot that answers from a 30-page PDF that changes once a quarter. What's the right pushback?"
          options={[
            { label: "RAG is the standard answer — go with it", explanation: "It's standard, but it's not lean for this size." },
            { label: "30 pages fits in a long-context prompt; cache the system prompt and skip the retrieval failure mode entirely", correct: true, explanation: "RAG is for when knowledge is too big or too dynamic for the prompt. 30 pages is roughly 15–25k tokens — well within modern context windows. Caching the system prompt (Module 13) makes per-turn cost trivial. You skip an entire piece of infra and an entire failure mode." },
            { label: "Fine-tune a model on the PDF", explanation: "Worst answer — fine-tuning is for behavior, not facts, and quarterly changes mean quarterly re-training." },
            { label: "Use semantic search without an LLM", explanation: "Doesn't answer questions, just finds passages. Different product." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You're building RAG over an internal Markdown wiki. Pick the chunking strategy and the highest-leverage upgrade."
          options={[
            { label: "Fixed-512 chunks, increase to 2048", explanation: "Wrong tool. Fixed-size ignores the wiki's structural cues." },
            { label: "Markdown structural chunking on H2 boundaries, plus contextual prefixes", correct: true, explanation: "Wikis have meaningful section boundaries — structural chunking on H2 captures them. Contextual prefixes (one-sentence document-context summary per chunk) are the single highest-leverage upgrade per Anthropic's data, with the cost paid once at indexing." },
            { label: "Semantic chunking with a topic-drift detector", explanation: "Works but more expensive and unnecessary when the doc already has explicit headings." },
            { label: "Recursive chunking is enough", explanation: "It's the safe default, but for a structured corpus you can do better." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your RAG bot answers conversational queries well but fails on queries that include literal error codes. What architectural change is most likely to help?"
          options={[
            { label: "Switch to a bigger embedding model", explanation: "Bigger embedders still rank semantically, not lexically." },
            { label: "Add hybrid retrieval — BM25 alongside vector, fused with RRF", correct: true, explanation: "Identifier-style queries (error codes, model numbers, file paths) are exactly where BM25-style exact matching beats vector similarity. Run both retrievers and fuse." },
            { label: "Tune ef_search higher", explanation: "Recall is fine; the issue is that the relevant chunk doesn't rank well by cosine — even with high recall, it won't make the top 5." },
            { label: "Add a reranker", explanation: "A reranker reorders the top-k candidates. If the relevant chunk isn't in the top-k from vector search, the reranker never sees it." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You measure recall@5 = 0.95 but answers are still bad. Where's the bug almost certainly NOT?"
          options={[
            { label: "The retriever / chunker", correct: true, explanation: "Recall@5 = 0.95 means the right chunks are arriving in the top 5 for 95% of queries. The retriever is doing its job. The bug must be downstream: assembly, prompt template, model. Read what's actually in the prompt and what comes back to find it." },
            { label: "Context assembly", explanation: "Could very well be — if you're truncating, reordering badly, or losing structure." },
            { label: "The prompt template", explanation: "Common culprit at high recall. Bad templates leave the model un-anchored." },
            { label: "The LLM itself", explanation: "Possible — undersized models still struggle even with perfect context." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You're stuffing 8 chunks into context. Order them best-relevance-first, sorted by retrieval score. What's the issue?"
          options={[
            { label: "No issue — relevance-first is always optimal", explanation: "Lost-in-the-middle says otherwise." },
            { label: "8 is too many: lost-in-the-middle hurts attention on chunks 3–6, regardless of order. Pass 3–5 and consider putting the top hit last (right before the question)", correct: true, explanation: "Two compounding fixes: (1) cut chunk count — more isn't better, lost-in-the-middle is well-documented; (2) the slot just before the question gets high attention, so reversing the order so the top chunk is last often beats first. The combined fix is bigger than either alone." },
            { label: "Sort by recency instead", explanation: "Recency isn't relevance. Wrong dial." },
            { label: "Add more chunks — 16 would be safer", explanation: "Worse. More chunks = more middle = worse attention on the relevant ones." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="rag-architecture" id="final" title="Final quiz" xp={40} celebration="You can architect a RAG system without copying a tutorial. Module 18 is where you wire it all into Spring.">
          <p>
            With this module under your belt you can name every stage of a RAG pipeline, defend each one,
            spot the most common failure modes, and design a measurement loop. Module 18 turns the design into
            running Spring Boot code — Spring AI&apos;s <code>VectorStore</code> + pgvector, end to end.
          </p>
        </Checkpoint>
      </section>

      {/* FOOTER NAV */}
      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/pgvector" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600">
          ← Module 16: Vector DBs &amp; pgvector
        </Link>
        <Link href="/courses/ai/modules/rag-spring" className="text-emerald-600 hover:underline font-semibold">
          Module 18: RAG in Spring Boot →
        </Link>
      </footer>
        <ModuleNav courseId="ai" currentSlug="rag-architecture" />
    </article>
  );
}
