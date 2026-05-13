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
  { id: "spring-ai-rag", title: "Spring AI's RAG primitives" },
  { id: "ingestion", title: "The ingestion pipeline" },
  { id: "query", title: "Query path with citations" },
  { id: "advisor", title: "QuestionAnswerAdvisor in practice" },
  { id: "project", title: "Project: chat with your docs" },
  { id: "final", title: "Final quiz" },
];

export default function RagSpringModule() {
  const mod = getModuleBySlug("rag-spring")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">RAG in Spring Boot end-to-end</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Architecture meets keyboard. Spring AI&apos;s VectorStore + pgvector, all the way through.
        </p>
        <ModuleProgress moduleSlug="rag-spring" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          You designed RAG in Module 16. Now you build it. End of this module: you have a Spring Boot service
          that ingests Markdown docs, indexes them in pgvector, and answers user questions with citations.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Spring AI&apos;s RAG primitives — <code>VectorStore</code>, <code>Document</code>, <code>DocumentReader</code>, <code>DocumentTransformer</code>, <code>DocumentWriter</code></li>
          <li>A real ingestion pipeline you can extend: read → chunk → enrich → embed → store</li>
          <li>The two query patterns: hand-rolled retrieval + manual prompt, vs. <code>QuestionAnswerAdvisor</code></li>
          <li>How to wire citations through to the response so the UI can render them</li>
          <li>A working &quot;chat with your docs&quot; service — and a sketch of how to deploy it</li>
        </ul>
      </section>

      {/* ================================================================= */}
      {/* PART 1: SPRING AI'S RAG PRIMITIVES                                  */}
      {/* ================================================================= */}
      <section id="spring-ai-rag">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 1 — Spring AI&apos;s RAG primitives</h2>

        <p>
          Spring AI ships a small set of RAG building blocks. The three that matter most:
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Document — the unit of currency</h3>

        <p>
          Spring AI&apos;s <code>Document</code> is a record of <code>(id, text, metadata)</code>. Both
          ingestion and retrieval traffic in <code>Document</code>s. Think of it as a chunk plus its provenance.
        </p>

        <CodeBlock lang="java">{`import org.springframework.ai.document.Document;

Document doc = new Document(
    "OAuth tokens expire after 1 hour by default...",
    Map.of(
        "source", "docs/auth.md",
        "section", "Token lifecycle",
        "page", 12,
        "doc_id", "auth-v3"
    )
);
// doc.getId() is auto-generated; doc.getText() is the chunk; doc.getMetadata() is the map`}</CodeBlock>

        <p>
          Critical: metadata travels with the chunk through chunking → embedding → storage → retrieval. When
          your retriever returns chunks, the metadata is right there for citations.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">VectorStore — one interface, many backends</h3>

        <p>
          <code>VectorStore</code> abstracts away &quot;which vector DB&quot;. The same code works against
          pgvector, Pinecone, Redis, Mongo Atlas, Weaviate, Chroma, Qdrant — change the starter, change a
          config block, no application code changes.
        </p>

        <CodeBlock lang="java">{`import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;

@Service
public class DocsService {
    private final VectorStore store;
    public DocsService(VectorStore store) { this.store = store; }

    public void ingest(List<Document> docs) {
        store.add(docs);   // embeds + writes to backing DB
    }

    public List<Document> retrieve(String query) {
        return store.similaritySearch(
            SearchRequest.builder()
                .query(query)
                .topK(5)
                .similarityThreshold(0.5)   // optional cutoff
                .filterExpression("source == 'docs/auth.md'")  // metadata filter
                .build()
        );
    }
}`}</CodeBlock>

        <Callout variant="info" title="Why we still drop to JDBC sometimes">
          <p className="text-sm m-0">
            <code>VectorStore</code> is great for the 80% case. For hybrid (BM25 + vector) retrieval, custom
            SQL with joins, or anything that needs an exotic <code>EXPLAIN ANALYZE</code>-driven query plan,
            you&apos;ll drop to <code>JdbcTemplate</code> like we did in Module 15. The two coexist fine — use
            VectorStore by default, JDBC for the long tail.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">DocumentReader / Transformer / Writer — the ingestion shape</h3>

        <p>Spring AI organizes ingestion into three roles:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong><code>DocumentReader</code></strong> — produces <code>List&lt;Document&gt;</code> from a
            source. Built-ins: <code>TikaDocumentReader</code> (PDF, DOCX, etc.), <code>JsonReader</code>,
            <code> TextReader</code>. Roll your own for Confluence APIs, GitHub READMEs, S3 buckets.
          </li>
          <li>
            <strong><code>DocumentTransformer</code></strong> — takes documents in, returns documents out.
            This is where chunking lives (<code>TokenTextSplitter</code>), and where you bolt on metadata
            enrichment (<code>KeywordMetadataEnricher</code>, <code>SummaryMetadataEnricher</code>) or your
            own contextual-prefix transformer.
          </li>
          <li>
            <strong><code>DocumentWriter</code></strong> — sinks documents. <code>VectorStore</code>
            implements <code>DocumentWriter</code> directly. You can also chain a logging writer, a
            duplicate-detection writer, etc.
          </li>
        </ul>

        <p>The pipeline is just functional composition:</p>

        <CodeBlock lang="java">{`reader.get()                       // List<Document> from raw source
    .stream()
    .map(splitter::transform)      // chunked
    .map(enricher::transform)      // metadata added
    .forEach(store::add);          // embedded + persisted`}</CodeBlock>

        <Callout variant="warn" title="Spring AI vs. roll-your-own — when to use which">
          <p className="text-sm m-0">
            Spring AI&apos;s <code>VectorStore</code> auto-creates a <code>vector_store</code> table with a
            specific schema. For prototypes that&apos;s wonderful — three lines and you have RAG. For
            production where you want to evolve the schema, join with business tables, or add hybrid
            retrieval, you should own the schema yourself (Flyway), use <code>VectorStore</code> for the
            common-case writes, and drop to JDBC for the queries that need it.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="You have a Spring Boot app with pgvector working via VectorStore. The PM asks for hybrid retrieval (BM25 + vector). What's the most pragmatic path?"
          options={[
            { label: "Switch to a different vector DB that supports hybrid natively", explanation: "Postgres already supports hybrid natively — ts_vector for BM25 + pgvector for cosine. No migration needed." },
            { label: "Keep VectorStore for writes, drop to JdbcTemplate for the hybrid query: ts_vector @@ tsquery + embedding <=> ? in one SQL, fused with RRF in app code", correct: true, explanation: "VectorStore handles ingestion fine. The hybrid query is genuinely complex SQL — it's normal and right to write it directly. The two coexist; you don't have to pick one." },
            { label: "Wait for Spring AI to add a HybridVectorStore interface", explanation: "Don't block on a framework feature when you can solve it in 30 lines today." },
            { label: "Embed the BM25 results too and re-rank by cosine", explanation: "Doesn't make architectural sense — the whole point of BM25 is it doesn't depend on embeddings." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Spring AI's RAG primitives are small and composable: Document, VectorStore, and a Reader/Transformer/Writer triple for ingestion. Use them by default; drop to JDBC for the long tail."
          points={[
            { takeaway: "Document = (id, text, metadata) — metadata travels with the chunk through every stage.", detail: "That's how you get from retrieval to citations: the source/section/page metadata is right there in the retrieved Documents." },
            { takeaway: "VectorStore is a one-interface, many-backends abstraction.", detail: "Switching pgvector → Pinecone → Redis vector is a starter swap and a config change, not a rewrite. Pick pgvector for most Spring teams; the abstraction earns its keep when needs change." },
            { takeaway: "Ingestion = Reader → Transformer → Writer, freely composable.", detail: "The shape lets you slot in custom chunkers, metadata enrichers, and contextual-prefix steps without rewriting the pipeline." },
          ]}
        />

        <Checkpoint moduleSlug="rag-spring" id="spring-ai-rag" title="Spring AI's RAG primitives" xp={20} celebration="You know which Spring AI bricks to reach for. Time to assemble.">
          <p>
            You should be able to: explain the role of <code>Document</code>,{" "}
            <code>VectorStore</code>, and the Reader/Transformer/Writer triple; pick when to use{" "}
            <code>VectorStore</code> vs. drop to JDBC.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: THE INGESTION PIPELINE                                      */}
      {/* ================================================================= */}
      <section id="ingestion">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 2 — The ingestion pipeline</h2>

        <p>
          Time to write code. We&apos;re going to build the indexing path: read a folder of Markdown files,
          chunk them by H2 (Module 16&apos;s structural strategy), enrich each chunk with a contextual prefix
          (Module 16&apos;s biggest win), and store them in pgvector.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Project setup</h3>

        <p>From <a className="text-emerald-600 hover:underline" href="https://start.spring.io">start.spring.io</a>:</p>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Spring Web</li>
          <li>Spring Data JDBC</li>
          <li>PostgreSQL Driver</li>
          <li>Flyway Migration</li>
          <li>OpenAI (Spring AI) — chat + embedding</li>
          <li>PGvector Vector Database (Spring AI)</li>
          <li>Tika Document Reader (Spring AI) — for the stretch goal of ingesting PDFs</li>
        </ul>

        <p>Spin up Postgres with the pgvector extension in Docker:</p>

        <CodeBlock lang="plain">{`docker run -d --name pg-rag-docs \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=ragdocs \\
  -p 5432:5432 \\
  pgvector/pgvector:pg16

# One-time: enable the extension
docker exec -it pg-rag-docs psql -U postgres -d ragdocs -c "CREATE EXTENSION IF NOT EXISTS vector;"`}</CodeBlock>

        <CodeBlock lang="plain">{`# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ragdocs
    username: postgres
    password: secret
  flyway:
    enabled: true
  ai:
    openai:
      api-key: \${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o-mini  # cheap chat model; swap for your provider's equivalent
      embedding:
        options:
          model: text-embedding-3-small
    vectorstore:
      pgvector:
        index-type: HNSW
        distance-type: COSINE_DISTANCE
        dimensions: 1536
        initialize-schema: true   # let Spring AI manage the vector_store table for now`}</CodeBlock>

        <p>
          For this project we&apos;ll let Spring AI manage the schema. (For Module 15 we owned it via Flyway;
          here we&apos;re prioritizing speed-to-running. You can switch to <code>initialize-schema: false</code>
          and a Flyway migration the moment you need to evolve.)
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">A markdown reader</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.ingest;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Component
public class MarkdownFolderReader {

    public List<Document> read(Path folder) throws IOException {
        try (Stream<Path> files = Files.walk(folder)) {
            return files
                .filter(p -> p.toString().endsWith(".md"))
                .map(this::toDocument)
                .toList();
        }
    }

    private Document toDocument(Path file) {
        try {
            String text = Files.readString(file);
            // One Document per file; we'll split into chunks in the next stage.
            return new Document(text, Map.of(
                "source", file.getFileName().toString(),
                "path", file.toString(),
                "doc_id", file.getFileName().toString().replace(".md", "")
            ));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">A structural chunker as a DocumentTransformer</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.ingest;

import org.springframework.ai.document.Document;
import org.springframework.ai.document.DocumentTransformer;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Splits each markdown Document on H2 boundaries.
 * Produces one Document per H2 section, with section path metadata.
 */
@Component
public class MarkdownH2Splitter implements DocumentTransformer {

    @Override
    public List<Document> apply(List<Document> in) {
        List<Document> out = new ArrayList<>();
        for (Document doc : in) {
            out.addAll(splitOne(doc));
        }
        return out;
    }

    private List<Document> splitOne(Document doc) {
        String text = doc.getText();
        String[] sections = text.split("(?m)^## ");
        List<Document> chunks = new ArrayList<>();

        // Capture H1 title for section path
        String title = "";
        if (!sections[0].isBlank()) {
            String[] firstLines = sections[0].split("\\n", 2);
            if (firstLines[0].startsWith("# ")) title = firstLines[0].substring(2).trim();
            chunks.add(buildChunk(doc, sections[0], title));
        }

        for (int i = 1; i < sections.length; i++) {
            String[] headAndBody = sections[i].split("\\n", 2);
            String heading = headAndBody[0].trim();
            String body = headAndBody.length > 1 ? headAndBody[1] : "";
            String sectionPath = title.isEmpty() ? heading : title + " > " + heading;
            chunks.add(buildChunk(doc, "## " + heading + "\\n" + body, sectionPath));
        }

        return chunks;
    }

    private Document buildChunk(Document parent, String text, String sectionPath) {
        Map<String, Object> meta = new HashMap<>(parent.getMetadata());
        meta.put("section", sectionPath);
        return new Document(text, meta);
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">A contextual-prefix transformer</h3>

        <p>
          The Module 16 lesson: prepend a one-sentence document-context summary to each chunk before embedding.
          We do it as a <code>DocumentTransformer</code> that sits after the splitter and before the writer.
        </p>

        <CodeBlock lang="java">{`package com.example.ragdocs.ingest;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.document.DocumentTransformer;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ContextualPrefixEnricher implements DocumentTransformer {

    private final ChatClient chat;

    public ContextualPrefixEnricher(ChatClient.Builder builder) {
        this.chat = builder.build();
    }

    @Override
    public List<Document> apply(List<Document> docs) {
        List<Document> out = new ArrayList<>();
        for (Document d : docs) {
            String docId = (String) d.getMetadata().getOrDefault("doc_id", "unknown");
            String section = (String) d.getMetadata().getOrDefault("section", "");

            String prefix = chat.prompt()
                .system("Given a chunk from a larger document, write ONE plain sentence " +
                        "that situates it in the document — what section, what topic, what role " +
                        "this chunk plays. No preamble. Output ONLY the one sentence.")
                .user("DOC: " + docId + "  SECTION: " + section + "\\n\\nCHUNK:\\n" + d.getText())
                .call().content();

            String contextualText = prefix.trim() + "\\n\\n" + d.getText();
            out.add(new Document(contextualText, d.getMetadata()));
        }
        return out;
    }
}`}</CodeBlock>

        <Callout variant="info" title="Cheap model, big leverage">
          <p className="text-sm m-0">
            Use the cheapest chat model your provider offers for the contextual-prefix call. Haiku-class on
            Anthropic, gpt-4o-mini on OpenAI. The call quality matters less than the structure — &quot;name
            the section and topic&quot; is easy. Cost on a 1k-chunk corpus is single-digit dollars, paid once.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Wiring the pipeline</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.ingest;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.util.List;

@Configuration
public class IngestionConfig {

    @Bean
    CommandLineRunner ingestOnStartup(
        MarkdownFolderReader reader,
        MarkdownH2Splitter splitter,
        ContextualPrefixEnricher contextual,
        VectorStore store
    ) {
        return args -> {
            if (args.length < 1 || !"--ingest".equals(args[0])) return;

            Path folder = Path.of(args[1]);
            System.out.println("Reading markdown from " + folder);

            List<Document> raw = reader.read(folder);
            System.out.println("  " + raw.size() + " files");

            List<Document> chunks = splitter.apply(raw);
            System.out.println("  " + chunks.size() + " chunks after splitting");

            List<Document> enriched = contextual.apply(chunks);
            System.out.println("  contextual prefixes added");

            store.add(enriched);
            System.out.println("  embedded + stored");
        };
    }
}`}</CodeBlock>

        <p>Now you can ingest a folder with one CLI argument:</p>

        <CodeBlock lang="plain">{`./mvnw spring-boot:run -Dspring-boot.run.arguments="--ingest,/path/to/docs"

# Output:
# Reading markdown from /path/to/docs
#   42 files
#   386 chunks after splitting
#   contextual prefixes added
#   embedded + stored`}</CodeBlock>

        <Callout variant="warn" title="Idempotency">
          <p className="text-sm m-0">
            <code>store.add</code> doesn&apos;t deduplicate by content. Running ingestion twice double-stores.
            For real use, either (a) wipe the store before each ingest in dev, (b) compute a stable
            <code> chunk_hash </code> per chunk and skip if it&apos;s already present, or (c) version your
            <code> doc_id </code> and use <code>store.delete(filterExpr)</code> to clear old versions before
            adding new ones. Module 17 stretch goal: pick one and implement it.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="Where in the ingestion pipeline does the contextual-prefix enricher belong?"
          options={[
            { label: "Before chunking — so the whole doc gets the prefix", explanation: "Wrong granularity. The prefix is supposed to situate each *chunk* in the doc — applied to the whole doc, it's just a no-op summary." },
            { label: "After chunking but before embedding (which happens inside store.add)", correct: true, explanation: "Right. You need chunks first (so each chunk's context is unique). You apply the prefix as a transformer between splitter and writer. The chunk text — including the prefix — is what the embedding model sees and what gets stored." },
            { label: "After embedding, as a metadata enrichment", explanation: "Too late. The embedder already built a vector from the unprefixed text — the prefix wouldn't change retrieval at all." },
            { label: "At query time, when retrieving", explanation: "Wrong stage entirely. Contextual prefixes are an indexing-time technique." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The ingestion pipeline is a Reader → Splitter → Enricher → VectorStore composition. Each stage is a small, testable Spring component."
          points={[
            { takeaway: "Document metadata is the spine of the pipeline.", detail: "Source path, section, doc_id flow from the reader through every transformer to retrieval — that's how citations work later." },
            { takeaway: "Contextual prefixes are a transformer between splitter and writer.", detail: "Cheap model, called once per chunk at indexing. The prefix becomes part of the embedded text, so it improves retrieval geometry without any query-time cost." },
            { takeaway: "Idempotency is your job, not Spring AI's.", detail: "store.add doesn't dedupe. For real use you need either a delete-before-add by filter expression, or a chunk-hash comparison. Build it before your second ingest runs." },
          ]}
        />

        <Checkpoint moduleSlug="rag-spring" id="ingestion" title="The ingestion pipeline" xp={25} celebration="You can move from a folder of docs to embeddings in pgvector without copy-pasting from a tutorial.">
          <p>
            You should be able to: assemble a Spring AI ingestion pipeline; explain why contextual prefixes
            sit between chunking and writing; describe the idempotency problem.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: QUERY PATH WITH CITATIONS                                   */}
      {/* ================================================================= */}
      <section id="query">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 3 — Query path with citations</h2>

        <p>
          You can index. Now you need to answer questions. We&apos;ll build the query path the explicit way
          first — retrieve, format, prompt, parse — so you understand what&apos;s happening. Part 4 swaps
          the explicit version for Spring AI&apos;s <code>QuestionAnswerAdvisor</code>.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">A retrieval service</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.query;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RetrievalService {

    private final VectorStore store;

    public RetrievalService(VectorStore store) { this.store = store; }

    public List<Document> retrieve(String question, int k) {
        return store.similaritySearch(
            SearchRequest.builder()
                .query(question)
                .topK(k)
                .similarityThreshold(0.5)   // skip clearly-irrelevant hits
                .build()
        );
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Assembling the prompt with numbered citations</h3>

        <p>
          Module 16&apos;s Part 4 prompt template, made concrete. Each retrieved <code>Document</code> becomes
          a numbered context block; the prompt instructs the model to cite by number.
        </p>

        <CodeBlock lang="java">{`package com.example.ragdocs.query;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class AnswerService {

    private final ChatClient chat;
    private final RetrievalService retrieval;

    public AnswerService(ChatClient.Builder builder, RetrievalService retrieval) {
        this.chat = builder.defaultSystem(SYSTEM_PROMPT).build();
        this.retrieval = retrieval;
    }

    private static final String SYSTEM_PROMPT = """
        You are a helpful assistant for the project's documentation.
        Answer questions using ONLY the context below. If the context does not
        contain the answer, say so — do not make up information.

        When you reference information, cite the source like [1], [2], etc.
        matching the numbered sources below.
        """;

    public AnswerWithSources answer(String question) {
        List<Document> chunks = retrieval.retrieve(question, 5);

        String contextBlock = IntStream.range(0, chunks.size())
            .mapToObj(i -> formatChunk(i + 1, chunks.get(i)))
            .collect(Collectors.joining("\\n\\n"));

        String userMessage = "CONTEXT:\\n" + contextBlock + "\\n\\nQUESTION:\\n" + question;

        String answer = chat.prompt()
            .user(userMessage)
            .call()
            .content();

        List<Source> sources = IntStream.range(0, chunks.size())
            .mapToObj(i -> Source.from(i + 1, chunks.get(i)))
            .toList();

        return new AnswerWithSources(answer, sources);
    }

    private static String formatChunk(int idx, Document d) {
        Object source = d.getMetadata().get("source");
        Object section = d.getMetadata().get("section");
        return String.format("[%d] (source: %s, section: %s)\\n%s",
            idx, source, section, d.getText());
    }

    public record AnswerWithSources(String answer, List<Source> sources) {}
    public record Source(int index, String source, String section, String docId) {
        static Source from(int i, Document d) {
            Map<String, Object> m = d.getMetadata();
            return new Source(i,
                String.valueOf(m.get("source")),
                String.valueOf(m.get("section")),
                String.valueOf(m.get("doc_id")));
        }
    }
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">The controller</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.query;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qa")
public class QaController {

    private final AnswerService service;

    public QaController(AnswerService service) { this.service = service; }

    public record AskRequest(String question) {}

    @PostMapping
    public AnswerService.AnswerWithSources ask(@RequestBody AskRequest req) {
        return service.answer(req.question());
    }
}`}</CodeBlock>

        <CodeBlock lang="plain">{`curl -X POST localhost:8080/api/qa -H 'Content-Type: application/json' \\
  -d '{"question":"How do I configure connection pool timeout?"}'

# Expected response:
{
  "answer": "Connection pool timeout is configured via spring.datasource.hikari.connection-timeout [1]. The default is 30 seconds [1][2]...",
  "sources": [
    {"index":1,"source":"docs/datasource.md","section":"Pool tuning","docId":"datasource"},
    {"index":2,"source":"docs/troubleshooting.md","section":"Common timeout issues","docId":"troubleshooting"},
    ...
  ]
}`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Citation verification (optional but worth it)</h3>

        <p>
          The model claims chunk [1] said something. Did it? A simple post-check: extract the citation indices
          from the answer, look up the corresponding chunks, and confirm a non-trivial overlap of content
          words between the answer&apos;s claim and the cited chunk. Cheap, catches a class of subtle
          hallucinations.
        </p>

        <CodeBlock lang="java">{`public boolean citationsLookSane(String answer, List<Document> chunks) {
    var pattern = java.util.regex.Pattern.compile("\\\\[(\\\\d+)\\\\]");
    var citedIndices = pattern.matcher(answer).results()
        .map(m -> Integer.parseInt(m.group(1)))
        .collect(Collectors.toSet());

    // Every cited index must be in range
    for (int i : citedIndices) {
        if (i < 1 || i > chunks.size()) return false;
    }

    // At least one citation must exist for non-trivial answers
    return !citedIndices.isEmpty() || answer.toLowerCase().contains("not in the context");
}`}</CodeBlock>

        <Callout variant="info" title="Use Anthropic's citations API when you can">
          <p className="text-sm m-0">
            If you&apos;re calling Claude directly (not OpenAI), use the native <code>citations</code> feature
            instead of regex-parsing <code>[1]</code> markers. The model returns structured citation objects
            tied to character ranges of input documents — no parsing, no false matches. Spring AI will route
            this through model-specific options once you&apos;re on the Anthropic starter.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="In the AnswerService, the retrieved chunks are formatted as [1], [2], [3] with source/section metadata. Why is this better than concatenating raw chunk text with a blank line between them?"
          options={[
            { label: "It saves tokens", explanation: "It actually uses MORE tokens — but earns them back in answer quality and citation utility." },
            { label: "Numbered + sourced chunks let the model cite, the user verify, and the UI render real links — and they reduce hallucination because the model knows exactly which slot each fact came from", correct: true, explanation: "Three things at once: citation produces auditable answers, source metadata becomes UI-ready provenance, and the structure itself nudges the model to ground its claims. Naked-text concatenation throws all of that away." },
            { label: "It avoids lost-in-the-middle", explanation: "Lost-in-the-middle is about position in the context, not about formatting." },
            { label: "It bypasses the prompt cache", explanation: "Doesn't relate to caching." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The query path is retrieve → format-with-citations → call → return answer + sources. Doing it explicitly first builds intuition for what QuestionAnswerAdvisor will hide."
          points={[
            { takeaway: "Format chunks as numbered, sourced blocks before sending them to the model.", detail: "[1] (source: ..., section: ...) <chunk text>. Three benefits: model can cite, user can verify, UI can render real links to the source. Naked-text concatenation throws all of that away." },
            { takeaway: "Return both the answer and a sources list to the caller.", detail: "The frontend needs the sources list to render a 'Sources' panel below the answer. Don't make the UI parse [N] markers out of text — return them structured." },
            { takeaway: "Citation verification is cheap and catches a class of hallucinations.", detail: "Confirm cited indices exist; for paranoid use cases, confirm content overlap between cited chunk and the surrounding sentence in the answer. A 30-line post-check, free at query time." },
          ]}
        />

        <Checkpoint moduleSlug="rag-spring" id="query" title="Query path with citations" xp={25} celebration="You can render a Sources panel without lying to the user. Most prod RAG can't.">
          <p>
            You should be able to: write a retrieve-format-prompt-parse pipeline by hand; explain why
            structured chunk formatting beats naked concatenation; design citation verification.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: QUESTIONANSWERADVISOR IN PRACTICE                           */}
      {/* ================================================================= */}
      <section id="advisor">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 4 — QuestionAnswerAdvisor in practice</h2>

        <p>
          Spring AI ships a built-in advisor that hides most of Part 3&apos;s plumbing. The catch: by hiding
          it, it also takes some choices away. Use the advisor when its defaults are good enough; drop to the
          explicit version when you need fine control.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">The advisor in 10 lines</h3>

        <CodeBlock lang="java">{`package com.example.ragdocs.query;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class AdvisorAnswerService {

    private final ChatClient chat;

    public AdvisorAnswerService(ChatClient.Builder builder, VectorStore store) {
        this.chat = builder
            .defaultAdvisors(QuestionAnswerAdvisor.builder(store)
                .searchRequest(SearchRequest.builder().topK(5).similarityThreshold(0.5).build())
                .build())
            .defaultSystem("Answer using ONLY the provided context. Cite by source.")
            .build();
    }

    public String answer(String question) {
        return chat.prompt().user(question).call().content();
    }
}`}</CodeBlock>

        <p>
          That&apos;s it. The advisor intercepts every call, retrieves <code>topK</code> documents, formats
          them, prepends them as context, and lets the model answer. You write zero retrieval code.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">What you give up</h3>

        <p>
          The advisor is opinionated. The default prompt template is fine but generic. If you want to
          customize how chunks are formatted, you supply a custom <code>promptTemplate</code> when building
          the advisor. If you want structured sources back to the caller (not just text), you have to
          extract them from the response&apos;s metadata — they&apos;re there but you have to dig.
        </p>

        <CodeBlock lang="java">{`// Advisor returns retrieved Documents in the response context — extract them
ChatResponse response = chat.prompt().user(question).call().chatResponse();

@SuppressWarnings("unchecked")
List<Document> retrievedDocs = (List<Document>) response.getMetadata()
    .get(QuestionAnswerAdvisor.RETRIEVED_DOCUMENTS);

// retrievedDocs has the source/section metadata you need for a Sources panel.`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">When to use which</h3>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="text-left p-2"></th>
                <th className="text-left p-2">QuestionAnswerAdvisor</th>
                <th className="text-left p-2">Hand-rolled (Part 3)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Lines of code</td>
                <td className="p-2">~10</td>
                <td className="p-2">~80</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Citation control</td>
                <td className="p-2">Generic; customizable via promptTemplate</td>
                <td className="p-2">You design exactly the format</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Reranking, hybrid retrieval, MMR</td>
                <td className="p-2">Not built in — wrap with a custom advisor or pre-retrieve</td>
                <td className="p-2">You add it where you want</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="p-2 font-semibold">Conversation memory + RAG combined</td>
                <td className="p-2">Combine with MessageChatMemoryAdvisor — Spring AI handles ordering</td>
                <td className="p-2">You wire it yourself</td>
              </tr>
              <tr>
                <td className="p-2 font-semibold">Best for</td>
                <td className="p-2">Prototypes, simple chat-with-docs, when defaults are fine</td>
                <td className="p-2">Production with custom retrieval, citations, multi-stage pipelines</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="Combining with chat memory">
          <p className="text-sm m-0">
            For a real chat-with-docs UX you want both <code>QuestionAnswerAdvisor</code> (for retrieval) and
            <code> MessageChatMemoryAdvisor</code> (for conversation history). Register both on the same
            ChatClient builder; Spring AI orders them so memory is added to the prompt and the user&apos;s
            current turn drives retrieval. Module 22 (agents) goes deeper on advisor composition.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="Your team prototype uses QuestionAnswerAdvisor. The PM wants the UI to render a 'Sources' panel beside each answer. The advisor returns just text. What's the lowest-friction fix?"
          options={[
            { label: "Replace QuestionAnswerAdvisor with a hand-rolled retriever + answer service", explanation: "Works but is more work than needed." },
            { label: "Pull the retrieved Documents out of response.getMetadata().get(QuestionAnswerAdvisor.RETRIEVED_DOCUMENTS), shape them into a Sources DTO, return alongside the answer", correct: true, explanation: "The advisor exposes the retrieved Documents in response metadata for exactly this reason. Read them, shape them into a Sources record (source, section, docId, snippet), and return both answer and sources from your service. ~10 lines added." },
            { label: "Parse [N] citation markers out of the answer text", explanation: "Brittle and incomplete — only catches what the model chose to cite, not what the retriever returned." },
            { label: "Wait for QuestionAnswerAdvisor to add a sources API", explanation: "It already has one — through response metadata." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 4 recap"
          gist="QuestionAnswerAdvisor is the 10-line ChatClient-friendly version of Part 3's pipeline. Use it for the common case; drop to explicit code when defaults aren't enough."
          points={[
            { takeaway: "Advisor: 10 lines, works, hides plumbing. Hand-rolled: 80 lines, full control.", detail: "Pick by what you actually need. Most teams should start with the advisor and swap out only the parts that hurt — not rebuild the whole pipeline." },
            { takeaway: "Retrieved Documents come back through response metadata.", detail: "QuestionAnswerAdvisor.RETRIEVED_DOCUMENTS holds the chunks the retriever returned. That's how you wire a Sources panel without reverting to the explicit version." },
            { takeaway: "Combine with MessageChatMemoryAdvisor for chat-with-docs.", detail: "Register both on the same ChatClient builder. Spring AI orders them sensibly: memory shapes the prompt, the current turn drives retrieval. Don't roll your own composition." },
          ]}
        />

        <Checkpoint moduleSlug="rag-spring" id="advisor" title="QuestionAnswerAdvisor in practice" xp={20} celebration="You can pick between the easy way and the powerful way without flipping a coin.">
          <p>
            You should be able to: stand up a RAG ChatClient with <code>QuestionAnswerAdvisor</code> in 10
            lines; retrieve the source documents from response metadata; explain when to drop down to a
            hand-rolled pipeline.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: PROJECT — CHAT WITH YOUR DOCS                               */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="text-2xl font-bold mt-12 mb-3">Part 5 — Project: chat with your docs</h2>

        <p>
          Time to ship a real thing. You&apos;re going to combine everything from Modules 14–17 into a
          working &quot;chat with your docs&quot; service: ingest a folder of Markdown docs, expose a single
          POST endpoint that takes a question and returns an answer plus citations, and ship a minimal
          static UI to demonstrate it.
        </p>

        <Callout variant="info" title="Recommended starting point">
          <p className="text-sm m-0">
            Reuse the project skeleton you set up in Part 2 (deps, application.yml, ingestion pipeline). This
            project is mostly about wiring the query path together with citations and a minimal UI.
          </p>
        </Callout>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 1 — Pick your corpus</h3>

        <p>
          Pick a real Markdown corpus you can host locally. Some good choices:
        </p>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Your team&apos;s internal wiki, exported as Markdown</li>
          <li>The {" "}<a className="text-emerald-600 hover:underline" href="https://docs.spring.io/spring-framework/reference/">Spring Framework reference</a> (parts of it ship as Markdown source)</li>
          <li>Any open-source project&apos;s <code>docs/</code> folder (e.g. Next.js, Postgres, Kubernetes)</li>
          <li>Your past blog posts, journal entries, or research notes</li>
        </ul>

        <p>
          50–500 files is the sweet spot. Smaller and the model could fit it in context anyway. Larger and
          ingestion takes longer than you have patience for during this lab.
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 2 — Ingest with the pipeline from Part 2</h3>

        <CodeBlock lang="plain">{`./mvnw spring-boot:run -Dspring-boot.run.arguments="--ingest,/path/to/your/docs"`}</CodeBlock>

        <p>
          Sanity-check after ingestion. Connect to the database and confirm chunks landed:
        </p>

        <CodeBlock lang="plain">{`docker exec -it pg-rag-docs psql -U postgres -d ragdocs -c \\
  "SELECT count(*), avg(length(content)) FROM vector_store"

# Expected: a few hundred to a few thousand rows; avg content length ~500–2000 chars`}</CodeBlock>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 3 — Decide: advisor vs hand-rolled</h3>

        <p>For this project, use the <strong>hand-rolled service from Part 3</strong>. Reasons:</p>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>You want a structured Sources DTO returned to the UI</li>
          <li>You want full control over the chunk-formatting prompt template</li>
          <li>You want to add citation verification</li>
          <li>You&apos;ll appreciate the advisor more once you&apos;ve felt the alternative</li>
        </ul>

        <p>
          Add the citation-verification check from Part 3 to <code>AnswerService.answer</code>. If
          citations don&apos;t look sane, log a warning (don&apos;t fail the request — the answer is still
          probably useful).
        </p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 4 — A minimal frontend</h3>

        <p>
          Drop a single static <code>src/main/resources/static/index.html</code>. Plain HTML + a tiny JS
          fetch. We&apos;re demonstrating the backend; full chat UI patterns come in Phase 4.
        </p>

        <CodeBlock lang="plain">{`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Chat with your docs</title>
  <style>
    body { font: 14px system-ui; max-width: 720px; margin: 2em auto; padding: 0 1em; }
    #q { width: 100%; padding: .6em; font-size: 14px; }
    #ans { white-space: pre-wrap; padding: 1em; background: #f7f7f7; border-radius: 6px; }
    #sources { margin-top: 1em; }
    #sources li { margin: .2em 0; color: #555; }
    .src-num { font-weight: bold; color: #047857; }
  </style>
</head>
<body>
  <h1>Chat with your docs</h1>
  <input id="q" placeholder="Ask a question — Enter to submit" />
  <h2>Answer</h2>
  <div id="ans">Ask something to begin.</div>
  <h2>Sources</h2>
  <ol id="sources"></ol>

<script>
const q = document.getElementById('q');
const ans = document.getElementById('ans');
const srcList = document.getElementById('sources');

q.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter' || !q.value.trim()) return;
  const question = q.value.trim();
  ans.textContent = 'Thinking…';
  srcList.innerHTML = '';

  const res = await fetch('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  const data = await res.json();

  ans.textContent = data.answer;
  data.sources.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = '<span class="src-num">[' + s.index + ']</span> ' +
      s.source + ' — <em>' + s.section + '</em>';
    srcList.appendChild(li);
  });
});
</script>
</body>
</html>`}</CodeBlock>

        <p>Open <code>http://localhost:8080</code>, ask a question, watch the magic.</p>

        <h3 className="text-xl font-bold mt-8 mb-3">Step 5 — Make it good</h3>

        <p>This is where the lab earns its keep. Run through these checks:</p>

        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Ask 10 real questions.</strong> Mix easy (clear single-section answer) with hard
            (multi-section synthesis). Note where it&apos;s weak.
          </li>
          <li>
            <strong>For one weak answer, check whether retrieval was the problem.</strong> Look at what came
            back as sources. If they&apos;re wrong, your retriever is at fault. If they&apos;re right but the
            answer is bad, your prompt is at fault.
          </li>
          <li>
            <strong>If retrieval is at fault</strong>: try increasing topK, lowering similarityThreshold,
            checking your chunking. If your corpus has identifiers, consider hybrid retrieval (Module 16).
          </li>
          <li>
            <strong>If the prompt is at fault</strong>: tighten the system prompt, reorder chunks (Module
            16&apos;s lost-in-the-middle), or pass fewer chunks.
          </li>
        </ol>

        <h3 className="text-xl font-bold mt-8 mb-3">Stretch goals</h3>

        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Add streaming (Module 12) so answers appear token-by-token while the sources panel renders immediately on retrieval.</li>
          <li>Add prompt caching (Module 13) on the system prompt — cuts per-turn cost noticeably.</li>
          <li>Add idempotent re-ingestion: compute a chunk hash, skip already-stored chunks, delete stale ones from a previous version of the doc.</li>
          <li>Add hybrid retrieval: Postgres ts_vector for BM25, fused with vector via RRF (Module 16 Part 3).</li>
          <li>Add an &quot;ask follow-up&quot; flow that combines QuestionAnswerAdvisor + MessageChatMemoryAdvisor.</li>
        </ul>

        <Checkpoint moduleSlug="rag-spring" id="project" title="Project: chat with your docs" xp={75} manual manualLabel="My docs answer questions" celebration="You shipped end-to-end RAG. Phase 3 is in the books.">
          <p>
            Mark this done once: you&apos;ve ingested a real corpus, asked at least 10 real questions through
            the UI, the answers cite sources that exist in your docs, and you&apos;ve diagnosed at least one
            weak answer (retrieval issue or prompt issue) and fixed or noted it.
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
          question="A teammate proposes putting the contextual-prefix step BEFORE chunking, so 'each chunk inherits the prefix'. What's wrong with that?"
          options={[
            { label: "Nothing — it would work the same", explanation: "It would NOT work the same. The prefix's value is being chunk-specific." },
            { label: "Prefixes need to situate each chunk individually — a single doc-level prefix doesn't differentiate chunks from each other, defeating the point", correct: true, explanation: "The whole reason contextual prefixes work is they tell the embedder where THIS specific chunk lives in the doc — section, topic, role. A doc-level prefix duplicated across all chunks adds noise without adding signal. Apply the prefix per chunk, after chunking." },
            { label: "It would be too expensive", explanation: "It would actually be cheaper (one LLM call instead of N), but cheaper-and-useless beats expensive-and-effective only when both work. Here, cheaper doesn't work." },
            { label: "Spring AI's API doesn't allow it", explanation: "It does — DocumentTransformers can run in any order. The constraint is conceptual, not API." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You're building a RAG service. You want a Sources panel in the UI showing source/section/docId for each cited chunk. Which approach gives you that with the least code?"
          options={[
            { label: "Hand-rolled retrieve + format + parse [N] markers from the answer text", explanation: "Works but more code than needed, and parsing markers is brittle." },
            { label: "QuestionAnswerAdvisor + read the retrieved Documents from response metadata at QuestionAnswerAdvisor.RETRIEVED_DOCUMENTS", correct: true, explanation: "The advisor handles retrieval and prompt assembly; you read the structured Documents back from response metadata for the Sources DTO. Combined: ~15 lines, no marker parsing, full source metadata." },
            { label: "QuestionAnswerAdvisor alone — it returns sources directly", explanation: "It returns answer text. Sources come through response metadata, not the response body." },
            { label: "Build a custom Advisor from scratch", explanation: "Fine if you have specific needs, but overkill when the default advisor already exposes what you need." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="Your RAG service answers correctly when you ask 'how do I configure X?' but fails on 'what does error E_4422 mean?' even though E_4422 is in the docs. What's the architectural fix?"
          options={[
            { label: "Tune VectorStore search — increase topK and lower similarityThreshold", explanation: "Recall isn't the issue — the relevant chunk doesn't *rank* well by cosine similarity for an identifier query, so it won't make top-k regardless." },
            { label: "Drop to JdbcTemplate, run BM25 (ts_vector) and vector search in parallel, fuse with Reciprocal Rank Fusion", correct: true, explanation: "Identifier-style queries (error codes, model numbers) are exactly where BM25 beats cosine similarity. VectorStore alone won't solve it; you have to add a lexical retrieval path. Postgres lets you do both in one DB — that's why pgvector beats Pinecone for this case." },
            { label: "Switch embedding models to text-embedding-3-large", explanation: "Bigger embedders are still doing semantic similarity. They don't suddenly start preferring exact-token matches." },
            { label: "Add a reranker", explanation: "Rerankers reorder the top-k. If the relevant chunk isn't IN the top-k from vector search, the reranker never sees it." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You ingested 500 docs, ran the service, then re-ran ingestion the next day after editing 5 docs. Now retrieval returns duplicates. What's the right fix?"
          options={[
            { label: "Drop the vector_store table before each ingest in dev", explanation: "Works in dev, but you can't do this in prod." },
            { label: "Compute a stable chunk_hash per chunk, store it as metadata, skip insert when the hash already exists; or version doc_id and store.delete(filterExpression) old versions before adding new ones", correct: true, explanation: "Two clean options. Hash-based dedupe avoids re-embedding unchanged chunks (saves API cost too). Versioned doc_id with delete-by-filter handles cleanup of stale chunks from edited docs. Most production pipelines do both: hash-based skip on insert, version+delete for full doc replacements." },
            { label: "Restart the JVM to clear the cache", explanation: "There's no in-memory cache here — pgvector persists, and that's the source of the duplicates." },
            { label: "Use store.update instead of store.add", explanation: "VectorStore.add does upsert by ID, but the Document IDs are auto-generated each ingestion run, so it can't dedupe by content unless you control the IDs yourself." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Final check"
          question="You're combining QuestionAnswerAdvisor with chat memory for a multi-turn UX. Which pairing is right?"
          options={[
            { label: "QuestionAnswerAdvisor only — it handles memory automatically", explanation: "It doesn't. RAG and memory are orthogonal concerns — separate advisors for each." },
            { label: "QuestionAnswerAdvisor + MessageChatMemoryAdvisor on the same ChatClient builder; Spring AI orders them so memory shapes the prompt and the current turn drives retrieval", correct: true, explanation: "The two advisors compose cleanly. Memory advisor adds prior turns to the prompt; QA advisor retrieves docs based on the latest user turn and stuffs them in as context. You don't have to wire the order yourself — Spring AI knows." },
            { label: "Roll your own — combining advisors is too fragile", explanation: "Composition is exactly what advisors are designed for. Use them." },
            { label: "Use a single advisor that does both", explanation: "There isn't one in stock Spring AI, and you wouldn't want one — orthogonal concerns deserve orthogonal advisors." },
          ]}
          xp={15}
        />

        <Checkpoint moduleSlug="rag-spring" id="final" title="Final quiz" xp={50} celebration="Phase 3 complete. You can build production-shaped RAG end to end. Phase 4 is where the frontend grows up.">
          <p>
            With this module under your belt — and with the entire phase under your belt — you can scope,
            design, build, debug, and ship a Spring Boot RAG service. That puts you ahead of most teams
            shipping AI features today. Phase 4 turns to the frontend: streaming, chat UIs, multimodal
            inputs.
          </p>
        </Checkpoint>
      </section>

      {/* FOOTER NAV */}
      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
        <Link href="/courses/ai/modules/rag-architecture" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600">
          ← Module 16: RAG architecture
        </Link>
        <Link href="/courses/ai/modules/react-streaming" className="text-emerald-600 hover:underline font-semibold">
          Module 18: React streaming patterns →
        </Link>
      </footer>
        <ModuleNav courseId="ai" currentSlug="rag-spring" />
    </article>
  );
}
