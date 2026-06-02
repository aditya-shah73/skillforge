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
  { id: "models", title: "The embedding model marketplace" },
  { id: "spring", title: "Calling embedders from Spring Boot" },
  { id: "curse", title: "The curse of dimensionality" },
  { id: "project", title: "Project: semantic bookmark search" },
  { id: "final", title: "Final quiz" },
];

export default function EmbeddingsDeepModule() {
  const mod = getModuleBySlug("embeddings-deep")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase 3 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Embeddings deep dive</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          Module 6 was the geometry. This is the engineering.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="embeddings-deep" />
        <ModuleProgress moduleSlug="embeddings-deep" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 p-6 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-green-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          You already know what an embedding <em>is</em>, a point in vector space, with cosine similarity as the
          ruler. This module is about shipping with embeddings: which model to pick, how to call it from Spring Boot,
          where it costs you, and why brute-force search starts hurting at scale. By the end you&apos;ll:
        </p>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <li>Pick an embedding model with confidence, by <strong>dimension, cost, latency, and quality</strong>.</li>
          <li>Wire one up in <strong>Spring AI 1.0.x</strong>{" "}and batch your calls so you don&apos;t go broke.</li>
          <li>Understand <strong>Matryoshka embeddings</strong>{" "}and when truncating dimensions is free money.</li>
          <li>Feel the <strong>curse of dimensionality</strong>{" "}with real numbers, and know exactly when brute force breaks.</li>
          <li>Ship a Spring Boot <strong>semantic bookmark search</strong>{" "}that works on a corpus of 30+ items.</li>
        </ol>
        <p className="mt-3 text-xs text-slate-500 italic dark:text-slate-400">
          This is the on-ramp for the rest of Phase 3. Module 16 introduces pgvector to fix the brute-force problem you
          create here. Module 17 layers retrieval on top. Module 18 puts the whole RAG pipeline behind a chat UI.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: THE EMBEDDING MODEL MARKETPLACE                            */}
      {/* ================================================================= */}
      <section id="models">
        <h2 className="mt-10 mb-3 text-2xl font-bold">Part 1, The embedding model marketplace</h2>

        <p>
          In Module 6 we hand-crafted three-dimensional vectors so you could see the math. In production, nobody
          hand-crafts anything, you call an API, you get a vector back, you store it. The interesting decisions are
          which API, which dimension, and which trade-off you&apos;re consciously making.
        </p>

        <h3 className="mt-6 mb-3 text-xl font-semibold">The 2026 landscape</h3>

        <p>
          Here&apos;s what the actual menu looks like as of writing. Numbers shift, but the shape is stable: a few hosted
          providers competing on price/quality, a few high-quality open-source models you can self-host, and one
          conspicuous absence.
        </p>

        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="py-2 pr-4 text-left">Model</th>
                <th className="py-2 pr-4 text-left">Dims</th>
                <th className="py-2 pr-4 text-left">Price (per 1M tokens)</th>
                <th className="py-2 pr-4 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>openai/text-embedding-3-small</code></td>
                <td className="py-2 pr-4">1536 (truncatable)</td>
                <td className="py-2 pr-4">~$0.02</td>
                <td className="py-2 pr-4">Cheap default. Matryoshka, truncate freely.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>openai/text-embedding-3-large</code></td>
                <td className="py-2 pr-4">3072 (truncatable)</td>
                <td className="py-2 pr-4">~$0.13</td>
                <td className="py-2 pr-4">Higher quality, 6× the cost. Worth it for hard retrieval.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>voyage-3</code> / <code>voyage-3-lite</code></td>
                <td className="py-2 pr-4">1024 / 512</td>
                <td className="py-2 pr-4">~$0.06 / ~$0.02</td>
                <td className="py-2 pr-4">Anthropic&apos;s recommended partner. Strong on code &amp; long-form.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>cohere/embed-english-v3</code></td>
                <td className="py-2 pr-4">1024</td>
                <td className="py-2 pr-4">~$0.10</td>
                <td className="py-2 pr-4">Has explicit query/document modes, useful for asymmetric search.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>BAAI/bge-large-en-v1.5</code></td>
                <td className="py-2 pr-4">1024</td>
                <td className="py-2 pr-4">free (self-host)</td>
                <td className="py-2 pr-4">Open weights. Run on a CPU, GPU, or via Ollama.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4"><code>nomic-embed-text-v1.5</code></td>
                <td className="py-2 pr-4">768 (Matryoshka)</td>
                <td className="py-2 pr-4">free (self-host)</td>
                <td className="py-2 pr-4">Truly open (data + weights). Strong baseline.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="Wait, Anthropic doesn't make an embedding model?">
          <p>
            Correct. Anthropic recommends <strong>Voyage AI</strong>{" "}for embeddings (and acquired them in 2024). The
            Claude API does not have an <code>/v1/embeddings</code> endpoint. If you&apos;re building on Claude, your
            embedding call goes to a different vendor, most production stacks pair Claude (generation) with Voyage,
            OpenAI, or an open-source embedder.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">The three axes you&apos;re actually trading off</h3>

        <p>
          When somebody asks &quot;which embedding model should I use,&quot; they&apos;re asking three different questions
          at once. Untangle them:
        </p>

        <ol className="list-decimal space-y-2 pl-6">
          <li>
            <strong>Quality</strong>, how often does the right document end up in your top-k results? Measured on
            benchmarks like MTEB, but the only number that matters is your own <em>recall@k</em>{" "}on your own data.
          </li>
          <li>
            <strong>Dimension</strong>, bigger vectors carry more information but cost more storage, more memory, and
            (linearly) more compute per similarity comparison. 1536-dim vs 768-dim is roughly 2× the disk and 2× the
            search time.
          </li>
          <li>
            <strong>Cost &amp; latency</strong>, embedding 1M tokens at $0.02 is cheap for a one-time index. Doing it
            on every user query at 80ms p99 is a different problem. Hosted vs. self-hosted lives here.
          </li>
        </ol>

        <p>
          The dishonest answer is &quot;use the highest-quality model.&quot; The honest answer is: a 768-dim
          mid-tier model is fine for ~80% of production cases, and the savings on storage and search latency compound
          as your corpus grows.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">MTEB and why the leaderboard lies a little</h3>

        <p>
          <a className="text-indigo-600 hover:underline" href="https://huggingface.co/spaces/mteb/leaderboard" target="_blank" rel="noreferrer">MTEB</a>{" "}
          (Massive Text Embedding Benchmark) is the canonical scoreboard, 50+ tasks across retrieval,
          classification, clustering, and reranking. It&apos;s genuinely useful, but two things to keep in mind:
        </p>

        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Benchmark contamination is real.</strong>{" "}A model fine-tuned on (or near) MTEB tasks will look
            artificially strong. Suspicious when a tiny no-name model tops the list.
          </li>
          <li>
            <strong>Your domain isn&apos;t MTEB.</strong>{" "}If your corpus is Java stack traces or pediatric oncology
            papers, the average MTEB score tells you almost nothing. Run a small eval on your own data, even 50
            hand-labeled (query, correct-doc) pairs is enough to discriminate between candidates.
          </li>
        </ul>

        <Callout variant="insight" title="The 50-pair eval">
          <p>
            Before you spend a dollar embedding 10 million documents, do this: pick 50 representative queries from
            your application. For each, write down the document ID that <em>should</em>{" "}come back first. Embed your
            corpus with two candidate models, run the queries, and count how often the correct doc lands in the top
            5. That number, recall@5, is the only model-selection metric you actually care about.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Matryoshka embeddings, free dimension reduction</h3>

        <p>
          Some modern embedders (OpenAI&apos;s v3, Nomic, Voyage) are trained as <strong>Matryoshka</strong>{" "}models,
          named after the Russian nesting dolls. The trick: the model is trained so that <em>truncating</em>{" "}the
          vector still leaves a useful embedding. You can take a 1536-dim vector, keep only the first 512, and lose
          surprisingly little quality.
        </p>

        <CodeBlock lang="java">{`// OpenAI 3-small returns 1536 dims by default.
// Truncate to 512 if you want 3× cheaper storage and 3× faster brute-force search.
float[] full = embed(text);            // length 1536
float[] truncated = Arrays.copyOf(full, 512);

// IMPORTANT: re-normalize after truncation, otherwise cosine math breaks.
truncated = l2Normalize(truncated);`}</CodeBlock>

        <p>
          Why does this work? During training, the loss is computed at multiple prefix lengths simultaneously
          (typically 64, 128, 256, 512, 768, 1024, 1536). Gradients flow back through every prefix. The model
          learns to <em>front-load</em>{" "}the most important information into the early dimensions. Later dimensions
          add refinement; the front already carries the gist.
        </p>

        <p>
          Practical rule: drop to 512 dims unless you have a measurable reason not to. You&apos;ll save 67% of your
          vector storage budget.
        </p>

        <WorkedExample
          title="Picking a model, three realistic scenarios"
          subtitle="Walk through each before peeking at the verdict."
          steps={[
            {
              title: "Scenario A: 50k internal Confluence pages, English, mostly technical writing",
              body: (
                <div>
                  <p className="text-sm">
                    Constraints: low traffic (~100 queries/day), no PII restrictions, want best quality.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Pick:</strong> <code>text-embedding-3-large</code>, truncate to 1024 dims via Matryoshka.
                    The corpus is small enough that the 6× price doesn&apos;t matter (50k × 500 tokens = 25M tokens
                    → ~$3 to index the whole thing once). Quality wins.
                  </p>
                </div>
              ),
            },
            {
              title: "Scenario B: 20M product reviews indexed nightly for category-based search",
              body: (
                <div>
                  <p className="text-sm">
                    Constraints: re-embed every night, latency budget per search ~50ms, English.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Pick:</strong> <code>text-embedding-3-small</code> at 512 dims (truncated). 20M × 100
                    tokens = 2B tokens nightly = ~$40/night. The 1024-dim option doubles cost and search latency for
                    marginal recall gains. If costs become a problem, self-host BGE on a GPU instance.
                  </p>
                </div>
              ),
            },
            {
              title: "Scenario C: Internal medical-records search with strict no-egress policy",
              body: (
                <div>
                  <p className="text-sm">
                    Constraints: data cannot leave the hospital network. Reasonable hardware budget.
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>Pick:</strong>{" "}Self-hosted <code>BAAI/bge-large-en-v1.5</code> via Ollama or a Triton
                    server. The hosted-API options are off the table by policy. Run a 50-pair eval against
                    BioBERT-derived alternatives if recall is weak; medical text often benefits from
                    domain-specific embedders.
                  </p>
                </div>
              ),
            },
          ]}
        />

        <Quiz
          kind="Pulse check"
          question="Your team is using text-embedding-3-large at the full 3072 dimensions. Storage and search are getting expensive. What's the lowest-risk first thing to try?"
          options={[
            { label: "Switch to a different provider entirely", explanation: "Big change, big risk. Not the lowest-risk first move." },
            { label: "Truncate to 1024 dims (Matryoshka) and re-measure recall, likely a tiny quality drop for 3× cheaper storage and search", correct: true, explanation: "Right. The model was trained for this exact use case. Measure recall@k on your eval set before and after; if it holds, you've found free money." },
            { label: "Drop to a 384-dim model immediately", explanation: "Possible but a bigger jump than necessary. Try the within-model truncation first." },
            { label: "Compress the vectors with PCA", explanation: "Adds complexity and a separate dimensionality-reduction artifact. Matryoshka truncation does this for free, by design." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="A teammate proposes 'we'll just pick whichever embedding model tops MTEB this week.' Why is that a worse approach than running a 50-pair eval on your own data?"
          options={[
            { label: "MTEB doesn't include retrieval tasks", explanation: "It does, retrieval is a major MTEB category." },
            { label: "MTEB scores can be inflated (training contamination), and even when honest they're aggregate scores across 50+ tasks that may not reflect your domain", correct: true, explanation: "Both reasons matter. A model can top MTEB by being great at clustering and mediocre at retrieval, or by quietly training on the benchmark. Your 50 hand-labeled query→doc pairs cut through both problems." },
            { label: "MTEB is paywalled", explanation: "It's free and public on HuggingFace." },
            { label: "MTEB only evaluates English", explanation: "MTEB has multilingual variants, but that's not the main concern here." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Embedding-model selection is a three-way trade between quality, dimension, and cost. The leaderboard is a starting point, not a verdict. Matryoshka truncation is usually free money."
          points={[
            { takeaway: "Pick by your own eval, not by MTEB rank.", detail: "50 query→correct-doc pairs from your domain will discriminate models better than any benchmark average." },
            { takeaway: "Default to truncated Matryoshka embeddings.", detail: "OpenAI v3, Voyage 3, and Nomic are all trained for it. 512 dims is usually enough." },
            { takeaway: "Anthropic doesn't make an embedder.", detail: "If you're on Claude, your embedding API is Voyage, OpenAI, Cohere, or self-hosted." },
          ]}
        />

        <Checkpoint moduleSlug="embeddings-deep" id="models" title="The embedding model marketplace" xp={25} celebration="You can pick a model without flipping a coin. That's most of the battle.">
          <p>
            You should be able to: name three production embedding models and one situation each is good for; explain
            why a 50-pair domain eval beats MTEB ranking; describe what Matryoshka truncation does and when it&apos;s
            safe.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 2: CALLING EMBEDDERS FROM SPRING BOOT                         */}
      {/* ================================================================= */}
      <section id="spring">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 2, Calling embedders from Spring Boot</h2>

        <p>
          Spring AI 1.0.x abstracts embedding providers behind a single interface: <code>EmbeddingModel</code>.
          You depend on the abstraction and switch providers in your <code>pom.xml</code>. The contract is small,
          three methods do everything you&apos;ll ever need.
        </p>

        <h3 className="mt-6 mb-3 text-xl font-semibold">The interface</h3>

        <CodeBlock lang="java" caption="org.springframework.ai.embedding.EmbeddingModel, the relevant methods">{`public interface EmbeddingModel {

    // The basic shape: text in, vector out.
    float[] embed(String text);

    // Batched: list in, list of vectors out (in the same order).
    // ALWAYS prefer this for indexing — see "batching" below.
    List<float[]> embed(List<String> texts);

    // Full response with metadata (token usage, model name, etc.)
    EmbeddingResponse call(EmbeddingRequest request);
}`}</CodeBlock>

        <p>
          Three methods. <code>embed(String)</code> for one-off queries. <code>embed(List)</code> for indexing.{" "}
          <code>call()</code> when you need the metadata (token counts for cost tracking, mostly).
        </p>

        <h3 className="mt-6 mb-3 text-xl font-semibold">Picking a provider in pom.xml</h3>

        <p>
          You add <em>one</em>{" "}starter dep. Spring Boot autoconfigures an <code>EmbeddingModel</code> bean from it.
          Switching providers is a one-line change.
        </p>

        <CodeBlock lang="plain" caption="pom.xml, pick exactly one">{`<!-- OpenAI -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-openai</artifactId>
</dependency>

<!-- Or: Ollama (local self-hosted) -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-ollama</artifactId>
</dependency>

<!-- Or: Vertex AI / Bedrock / Azure / etc. -->`}</CodeBlock>

        <p>
          And the matching config in <code>application.yml</code>:
        </p>

        <CodeBlock lang="plain" caption="application.yml, OpenAI example">{`spring:
  ai:
    openai:
      api-key: \${OPENAI_API_KEY}
      embedding:
        options:
          model: text-embedding-3-small
          dimensions: 512   # Matryoshka truncation, server-side`}</CodeBlock>

        <Callout variant="spring" title="Note: server-side truncation">
          <p>
            The <code>dimensions</code> option above tells <em>OpenAI</em>{" "}to truncate before sending the vector
            back. That saves bandwidth, not just storage. If your provider doesn&apos;t support server-side
            truncation, do it client-side (and re-normalize, as we showed in Part 1).
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">A minimal embedding service</h3>

        <CodeBlock lang="java" caption="EmbeddingService.java, what 90% of your code looks like">{`package com.example.search;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;

    public EmbeddingService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    /** One query at a time — for the search path. */
    public float[] embedQuery(String query) {
        return embeddingModel.embed(query);
    }

    /** Many at once — for the index path. ~100× faster than calling one at a time. */
    public List<float[]> embedBatch(List<String> texts) {
        return embeddingModel.embed(texts);
    }
}`}</CodeBlock>

        <p>
          That&apos;s it. Spring autoconfigures the <code>EmbeddingModel</code> bean from your starter, you inject
          it, you call it. No HTTP client, no auth plumbing, no JSON shape to memorize.
        </p>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Batching: the single biggest performance win</h3>

        <p>
          Embedding 10,000 documents one at a time means 10,000 round-trips. Each carries TLS handshake amortization,
          authentication overhead, and per-request latency. Embedding 10,000 in batches of 100 means 100 round-trips,
          and the provider can amortize their internal model cost across the batch.
        </p>

        <WorkedExample
          title="Batching by the numbers"
          subtitle="Why batch=100 is the rule of thumb."
          steps={[
            {
              title: "Naive: one call per document",
              body: (
                <div>
                  <p className="text-sm">
                    10,000 docs × ~80ms per call = <strong>800 seconds</strong> (~13 minutes), and most of that is
                    network round-trip, not actual embedding compute.
                  </p>
                </div>
              ),
            },
            {
              title: "Batched: 100 docs per call",
              body: (
                <div>
                  <p className="text-sm">
                    100 calls × ~250ms per call = <strong>25 seconds</strong>. Per-call latency goes up because the
                    server is doing more work, but you&apos;ve eliminated 9,900 round-trips. Total wall-clock: ~30×
                    faster.
                  </p>
                </div>
              ),
            },
            {
              title: "Why not batch=1000 or batch=all?",
              body: (
                <div>
                  <p className="text-sm">
                    Providers cap batch size, OpenAI&apos;s v3 embedders accept up to 2048 inputs per call, but
                    will reject a request whose <em>token total</em>{" "}exceeds 300k. A safe default is batch=100 with
                    a fallback that splits if you hit a token-limit error. Bigger batches also mean longer
                    tail-latency p99s, which hurts if you&apos;re embedding live.
                  </p>
                </div>
              ),
            },
          ]}
        />

        <CodeBlock lang="java" caption="Indexing a corpus, the right way">{`public void indexCorpus(List<Document> docs) {
    // Group into batches of 100. Tweak based on average doc length.
    int batchSize = 100;
    for (int i = 0; i < docs.size(); i += batchSize) {
        List<Document> slice = docs.subList(i, Math.min(i + batchSize, docs.size()));
        List<String> texts = slice.stream().map(Document::text).toList();

        List<float[]> vectors = embeddingService.embedBatch(texts);

        // Persist (id, vector) pairs. In Module 16 we'll do this in pgvector.
        for (int j = 0; j < slice.size(); j++) {
            store.save(slice.get(j).id(), vectors.get(j));
        }
    }
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">L2 normalization, what Spring AI does for you</h3>

        <p>
          Cosine similarity and dot product produce identical rankings <em>if</em>{" "}both vectors are unit-length
          (L2-normalized). Most production embedders return L2-normalized vectors out of the box, but not all,
          and the contract isn&apos;t always documented loudly.
        </p>

        <CodeBlock lang="java" caption="Defensive L2 normalization">{`public static float[] l2Normalize(float[] v) {
    double sumSq = 0;
    for (float x : v) sumSq += x * x;
    double norm = Math.sqrt(sumSq);
    if (norm == 0) return v.clone();   // pathological: all-zero vector

    float[] out = new float[v.length];
    for (int i = 0; i < v.length; i++) {
        out[i] = (float) (v[i] / norm);
    }
    return out;
}`}</CodeBlock>

        <p>
          Quick rules of thumb (verify with your provider&apos;s docs):
        </p>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>OpenAI <code>text-embedding-3-*</code></strong>, returns L2-normalized vectors.</li>
          <li><strong>Voyage</strong>, returns L2-normalized vectors.</li>
          <li><strong>Cohere <code>embed-*-v3</code></strong>, returns L2-normalized vectors.</li>
          <li><strong>Self-hosted (BGE, Nomic via Ollama)</strong>, sometimes yes, sometimes no. Check, or normalize defensively.</li>
          <li><strong>After Matryoshka truncation</strong>, never normalized. <em>You</em>{" "}must re-normalize.</li>
        </ul>

        <Callout variant="warn" title="The bug you'll see at 2 a.m.">
          <p>
            Symptoms: cosine scores that should be in [-1, 1] are returning values like 0.43 between documents you
            <em>know</em>{" "}are nearly identical. Cause: somewhere a vector got truncated, multiplied, averaged, or
            otherwise mangled, and isn&apos;t unit-length anymore. Fix: re-normalize at the boundary, then never
            mutate vectors in place.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Caching embeddings, yes, you should</h3>

        <p>
          This is a <em>different</em>{" "}caching from Module 13&apos;s prompt caching. Embedding caching is purely
          client-side: if you&apos;ve already embedded the string &quot;refund policy for international orders,&quot;
          and the same string comes in again, hit your cache instead of re-paying $0.02 per million tokens.
        </p>

        <CodeBlock lang="java" caption="Cache by content hash">{`@Service
public class CachedEmbeddingService {

    private final EmbeddingModel model;
    // Bounded LRU. Caffeine is the standard Spring choice; keep it small for queries.
    private final Cache<String, float[]> cache = Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofHours(24))
        .build();

    public CachedEmbeddingService(EmbeddingModel model) {
        this.model = model;
    }

    public float[] embed(String text) {
        // SHA-256 hash as the key — text might be megabytes; the hash is 32 bytes.
        String key = sha256(text);
        return cache.get(key, k -> model.embed(text));
    }
}`}</CodeBlock>

        <p>
          When does this pay off? Mostly on the <strong>query path</strong>. Users repeat queries, &quot;reset
          password,&quot; &quot;refund,&quot; &quot;account locked&quot; show up thousands of times a day in any real
          support system. Caching the embedding for those costs you almost nothing and saves a real API call per hit.
        </p>

        <p>
          On the indexing path, caching is less useful, you usually only embed each document once. But if you
          re-embed on every deploy by accident (it happens), the cache will save you from yourself.
        </p>

        <Quiz
          kind="Pulse check"
          question="You're indexing 50,000 docs and decide to use embeddingModel.embed(text) inside a parallel stream with 16 threads. The job finishes faster than batching, so you ship it. What's the catch?"
          options={[
            { label: "Parallel streams aren't allowed in Spring Boot", explanation: "They're allowed; this isn't the issue." },
            { label: "You're hammering the embedding API with 50,000 individual requests, will likely hit rate limits, and you're paying full per-request overhead. Batched is still strictly better, just parallelize the batches if you need more throughput", correct: true, explanation: "Right. You traded amortized HTTP overhead for parallelism, but kept all the per-request cost. Batched + parallelized batches gives you both wins. Most providers also rate-limit by request count, so 50,000 individual calls trip the limiter even if each is small." },
            { label: "Float arrays aren't thread-safe", explanation: "Each call returns its own array; no shared state issue." },
            { label: "Spring AI doesn't support parallel calls", explanation: "It does. The issue is upstream cost/limits, not Spring." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="Your embeddings are returning cosine similarities like 0.31 between two documents you know are paraphrases of each other (you'd expect ~0.9). Where do you look first?"
          options={[
            { label: "Re-train the model", explanation: "You can't re-train a hosted model, and even if you could, this isn't a model issue." },
            { label: "Check whether the vectors are L2-normalized, most likely something downstream truncated, averaged, or otherwise mutated them and never re-normalized", correct: true, explanation: "Right. The classic symptom of de-normalized vectors is dampened cosine scores across the board. Add a one-line assertion that ||v|| ≈ 1.0 at every storage boundary and the bug usually surfaces immediately." },
            { label: "Reduce dimensions", explanation: "Dimensions don't cause this kind of systematic dampening." },
            { label: "Switch providers", explanation: "Skipping straight to a vendor change without diagnosing is expensive." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Spring AI's EmbeddingModel is a three-method interface. You batch on the index path, cache on the query path, and re-normalize whenever you mutate a vector."
          points={[
            { takeaway: "Always batch on the index path.", detail: "embed(List) is ~30× faster than embed(String) in a loop. Default to batches of 100." },
            { takeaway: "Cache the query path by content hash.", detail: "User queries repeat; embedding the same string twice is wasted money." },
            { takeaway: "Re-normalize after any vector mutation.", detail: "Truncation, averaging, projection, all break L2 normalization. Cosine scores that look 'flat' are usually this." },
          ]}
        />

        <Checkpoint moduleSlug="embeddings-deep" id="spring" title="Calling embedders from Spring Boot" xp={30} celebration="You can stand up a Spring AI embedding service from scratch. That's the foundation for everything in Phase 3.">
          <p>
            You should be able to: wire <code>EmbeddingModel</code> into a Spring service; explain why batching wins
            on the index path; defend why you cache on the query path; spot the L2-normalization bug from a flat
            cosine score.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 3: THE CURSE OF DIMENSIONALITY                                */}
      {/* ================================================================= */}
      <section id="curse">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 3, The curse of dimensionality (with numbers)</h2>

        <p>
          Module 6 mentioned the curse of dimensionality and promised we&apos;d come back to it. Here we are.
          The curse is a family of weird, counterintuitive things that happen when you try to do geometry in
          high-dimensional space. Two of those things matter for embedding search:
        </p>

        <ol className="list-decimal space-y-2 pl-6">
          <li><strong>Distances concentrate.</strong>{" "}In very high dimensions, the &quot;nearest&quot; and &quot;farthest&quot; points in a random cloud become almost the same distance away.</li>
          <li><strong>Brute force scales linearly.</strong>{" "}Comparing a query to N vectors of dimension d costs O(N·d). For N=100M and d=1024, that&apos;s ~100 billion floating-point ops <em>per query</em>.</li>
        </ol>

        <p>
          Both are why Module 16 introduces approximate nearest-neighbor (ANN) indexes via pgvector. But the only
          way to feel the problem is to look at real numbers.
        </p>

        <h3 className="mt-6 mb-3 text-xl font-semibold">Why distances concentrate, a tiny experiment</h3>

        <p>
          Generate N random points in a unit cube of dimension d. For each point, compute its distance to every
          other point. Look at the ratio of the <em>nearest</em>{" "}distance to the <em>farthest</em>{" "}distance. In
          intuitive low-D space, this ratio is small, your nearest neighbor is much closer than your farthest. As
          d grows, the ratio creeps toward 1. Everything is the same distance away.
        </p>

        <WorkedExample
          title="Concentration of distances"
          subtitle="Same experiment, three dimensionalities. Watch the ratio."
          steps={[
            {
              title: "d = 2, your everyday intuition holds",
              body: (
                <div>
                  <p className="text-sm">
                    Sample 1,000 random 2-D points. For a typical query point, the nearest neighbor is at distance
                    ~0.04 and the farthest at ~1.40. Ratio: <strong>0.03</strong>. The nearest is 35× closer than
                    the farthest. Search is meaningful.
                  </p>
                </div>
              ),
            },
            {
              title: "d = 100, uh oh",
              body: (
                <div>
                  <p className="text-sm">
                    Same setup, 100-D points. The nearest neighbor is at distance ~3.2, the farthest at ~4.5.
                    Ratio: <strong>0.71</strong>. The nearest is only ~1.4× closer than the farthest. Cosine on
                    raw random vectors barely discriminates.
                  </p>
                </div>
              ),
            },
            {
              title: "d = 1024, pure random vectors are useless",
              body: (
                <div>
                  <p className="text-sm">
                    Same setup, 1024-D. Ratio approaches <strong>~0.95</strong>. If you sampled vectors uniformly
                    at random in this space, every point&apos;s neighbors would be effectively indistinguishable
                    from its non-neighbors.
                  </p>
                </div>
              ),
            },
            {
              title: "Why does embedding search still work, then?",
              body: (
                <div>
                  <p className="text-sm">
                    Because real embeddings <em>aren&apos;t</em>{" "}uniformly random. Trained embedders cluster
                    semantically-related text in narrow regions of the unit hypersphere. The vectors live on a
                    much lower-dimensional <em>manifold</em>{" "}inside the 1024-D space, local neighborhoods stay
                    informative. The curse explains why pure random search fails; the saving grace is that
                    semantic structure breaks the randomness assumption.
                  </p>
                </div>
              ),
            },
          ]}
        />

        <Callout variant="info" title="The takeaway, blunt version">
          <p>
            Embedding search works because trained models compress meaning into a thin slice of the available
            space. It does NOT work because cosine similarity is magically robust in high dimensions, it isn&apos;t.
            If your embeddings ever start looking uniform (e.g. you accidentally averaged too many vectors, or your
            domain is wildly out-of-distribution for the model), recall@k will collapse and you&apos;ll see exactly
            this concentration effect.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Brute force: when does it stop being fine?</h3>

        <p>
          In Module 6&apos;s Java project, you brute-forced ~10 vectors. That&apos;s instant. Production corpora
          are bigger. Here&apos;s the back-of-the-envelope math for how brute force scales, the dominant cost is
          <code>N · d</code> floating-point multiply-adds per query.
        </p>

        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700">
                <th className="py-2 pr-4 text-left">Corpus size N</th>
                <th className="py-2 pr-4 text-left">d = 384</th>
                <th className="py-2 pr-4 text-left">d = 1024</th>
                <th className="py-2 pr-4 text-left">d = 3072</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">10k</td>
                <td className="py-2 pr-4">~1 ms</td>
                <td className="py-2 pr-4">~3 ms</td>
                <td className="py-2 pr-4">~10 ms</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">100k</td>
                <td className="py-2 pr-4">~10 ms</td>
                <td className="py-2 pr-4">~30 ms</td>
                <td className="py-2 pr-4">~100 ms</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">1M</td>
                <td className="py-2 pr-4">~100 ms</td>
                <td className="py-2 pr-4">~300 ms 🟡</td>
                <td className="py-2 pr-4">~1 s 🔴</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">10M</td>
                <td className="py-2 pr-4">~1 s 🟡</td>
                <td className="py-2 pr-4">~3 s 🔴</td>
                <td className="py-2 pr-4">~10 s 🔴🔴</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <td className="py-2 pr-4">100M</td>
                <td className="py-2 pr-4">~10 s 🔴</td>
                <td className="py-2 pr-4">~30 s</td>
                <td className="py-2 pr-4">~100 s</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Numbers assume one CPU core doing naive dot products with no SIMD. Real numbers can be 4–8× faster with
          vectorized Java (incubating <code>jdk.incubator.vector</code>) or pgvector&apos;s C implementation. But
          the asymptote is the same: at 1M+ vectors with 1024+ dims, you need an index.
        </p>

        <Callout variant="insight" title="When brute force is actually fine">
          <p>
            For corpora under ~50,000 vectors at modest dimensions, brute force is genuinely the right choice. No
            indexing complexity, no recall trade-offs, perfectly accurate top-k. Many production RAG systems
            (internal docs, FAQ retrieval, support knowledge bases) live well under that threshold and stay on
            brute force forever. Don&apos;t prematurely add an HNSW index because you read about one.
          </p>
        </Callout>

        <Quiz
          kind="Pulse check"
          question="Your support knowledge base has 8,000 articles, embedded with text-embedding-3-small at 512 dims. A teammate wants to add an HNSW index 'because that's how you scale.' Push back, why?"
          options={[
            { label: "HNSW doesn't work at 512 dimensions", explanation: "HNSW works fine at 512 dims; not the issue." },
            { label: "8k × 512 is ~4M FLOPs per query, under 10ms brute force. HNSW adds index complexity, build time, and approximate-recall risk for zero meaningful latency win at this size", correct: true, explanation: "Right. The whole point of an ANN index is to dodge linear scan when linear scan is too slow. 8,000 vectors at 512 dims isn't slow. Adding HNSW costs you operational complexity, build time on every re-index, and the small-but-real chance of missing the actual nearest neighbor, for nothing." },
            { label: "HNSW is patent-encumbered", explanation: "It isn't." },
            { label: "Spring AI doesn't support HNSW", explanation: "Spring AI integrates with vector stores that do. Not the concern." },
          ]}
          xp={15}
        />

        <Quiz
          kind="Pulse check"
          question="You generate 10,000 random unit vectors in 1024 dimensions and compute pairwise cosine similarities. What do you expect to see?"
          options={[
            { label: "Most cosines are around 0, random unit vectors in high dimensions are nearly orthogonal to each other", correct: true, explanation: "Right. This is the high-dimensional concentration phenomenon: in 1024-D, two random unit vectors have cosine ~ 0 with very high probability. It's why embedding search depends on the model placing related text in narrow clusters, the 'background' is essentially noise." },
            { label: "Cosines uniformly distributed over [-1, 1]", explanation: "Only true in d=1. As d grows, cosines concentrate around 0." },
            { label: "Most cosines around 1, unit vectors are 'similar' by construction", explanation: "Unit vectors aren't similar to each other; only being a unit vector means ||v||=1, which doesn't constrain direction." },
            { label: "Cosines bimodal at -1 and +1", explanation: "Not without structure forcing it." },
          ]}
          xp={15}
        />

        <PartRecap
          title="Part 3 recap"
          gist="High-dimensional space is geometrically weird. Brute force is fine until it isn't. Embedding search works because real embeddings live on a low-D manifold inside the high-D space."
          points={[
            { takeaway: "Distances concentrate as d grows.", detail: "The ratio of nearest-to-farthest collapses toward 1 in pure random clouds. Trained embeddings dodge this by clustering semantically." },
            { takeaway: "Brute force scales linearly in N·d.", detail: "Fine to ~50k vectors. At 1M+ at 1024 dims, you want an ANN index, which is Module 16." },
            { takeaway: "Don't index prematurely.", detail: "If your corpus is small, exact brute-force search is faster, simpler, and more accurate than any approximate index." },
          ]}
        />

        <Checkpoint moduleSlug="embeddings-deep" id="curse" title="The curse of dimensionality" xp={25} celebration="You can defend brute force where it's right and demand an index where it isn't. That's the bridge to pgvector.">
          <p>
            You should be able to: explain why distances concentrate in high-D; back-of-the-envelope brute-force
            search latency given N and d; argue when ANN indexes are premature optimization; describe why real
            embeddings sidestep the worst of the curse.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 4: PROJECT — SEMANTIC BOOKMARK SEARCH                         */}
      {/* ================================================================= */}
      <section id="project">
        <h2 className="mt-12 mb-3 text-2xl font-bold">Part 4, Project: semantic bookmark search</h2>

        <p>
          Time to build. You&apos;re going to ship a Spring Boot app that takes a hard-coded list of 30 bookmarks
          (titles + descriptions), embeds them at startup, exposes a <code>/search?q=...</code> endpoint, and
          returns the top-k semantically-similar bookmarks with their cosine scores. We&apos;re using brute force
          deliberately, the corpus is tiny, and the point of this project is to feel embeddings working before
          Module 16 introduces an index.
        </p>

        <h3 className="mt-6 mb-3 text-xl font-semibold">Step 1, Spin up the project</h3>

        <p>
          Use the same <a className="text-indigo-600 hover:underline" href="https://start.spring.io" target="_blank" rel="noreferrer">Spring Initializr</a>{" "}
          recipe as Module 13: Java 21, Spring Boot 3.4+, Maven. Dependencies:
        </p>

        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Spring Web</strong>, for the search endpoint and a tiny static UI.</li>
          <li><strong>Spring AI OpenAI</strong> (or Ollama, if you&apos;re self-hosting). This pulls in the <code>EmbeddingModel</code> bean.</li>
        </ul>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 2, Configuration</h3>

        <CodeBlock lang="plain" caption="src/main/resources/application.yml">{`spring:
  ai:
    openai:
      api-key: \${OPENAI_API_KEY}
      embedding:
        options:
          model: text-embedding-3-small
          dimensions: 512   # Matryoshka — saves storage, fine for this size

server:
  port: 8080`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 3, Bookmark and BookmarkStore</h3>

        <CodeBlock lang="java" caption="Bookmark.java, a record with the fields we need">{`package com.example.bookmarks;

public record Bookmark(
    String id,
    String url,
    String title,
    String description,
    float[] embedding   // populated at startup
) {
    /** The text we feed the embedder — title + description carries the semantic signal. */
    public String embedText() {
        return title + " — " + description;
    }
}`}</CodeBlock>

        <CodeBlock lang="java" caption="BookmarkStore.java, in-memory, brute-force search">{`package com.example.bookmarks;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.IntStream;

@Component
public class BookmarkStore {

    private final List<Bookmark> bookmarks = new ArrayList<>();

    public void addAll(List<Bookmark> entries) {
        bookmarks.addAll(entries);
    }

    public List<Scored> search(float[] queryVec, int k) {
        // Score every bookmark, sort, take top-k. This is the brute-force part —
        // O(N·d) per query. For N=30, d=512, that's ~15k FLOPs. Instant.
        return bookmarks.stream()
            .map(b -> new Scored(b, cosine(queryVec, b.embedding())))
            .sorted(Comparator.comparingDouble(Scored::score).reversed())
            .limit(k)
            .toList();
    }

    /** Cosine similarity. Assumes both vectors are L2-normalized (OpenAI guarantees this). */
    static double cosine(float[] a, float[] b) {
        double dot = 0;
        for (int i = 0; i < a.length; i++) dot += a[i] * b[i];
        return dot;   // unit vectors → dot product == cosine
    }

    public record Scored(Bookmark bookmark, double score) {}
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 4, Indexing at startup</h3>

        <p>
          We embed all 30 bookmarks once, in a single batched call, when the app starts. After that the store is
          read-only. Real systems re-index on writes, but for this project, startup-only is plenty.
        </p>

        <CodeBlock lang="java" caption="BookmarkIndexer.java, runs once via CommandLineRunner">{`package com.example.bookmarks;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;
import java.util.UUID;

@Configuration
public class BookmarkIndexer {

    @Bean
    CommandLineRunner indexBookmarks(EmbeddingModel embedder, BookmarkStore store) {
        return args -> {
            // Hard-coded corpus. In a real app this comes from a DB or file.
            List<Seed> seeds = SeedData.load();   // see step 5

            // Single batched call — 30 docs, one HTTP round-trip.
            List<float[]> vectors = embedder.embed(
                seeds.stream().map(s -> s.title() + " — " + s.description()).toList()
            );

            // Zip seeds with their vectors and persist.
            List<Bookmark> indexed = java.util.stream.IntStream.range(0, seeds.size())
                .mapToObj(i -> new Bookmark(
                    UUID.randomUUID().toString(),
                    seeds.get(i).url(),
                    seeds.get(i).title(),
                    seeds.get(i).description(),
                    vectors.get(i)
                ))
                .toList();

            store.addAll(indexed);
            System.out.println("Indexed " + indexed.size() + " bookmarks.");
        };
    }

    record Seed(String url, String title, String description) {}
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 5, A reasonable seed corpus</h3>

        <p>
          You want enough variety that semantic search has something to chew on. Here&apos;s a 30-bookmark starter
          covering several distinct topics, programming, recipes, travel, science, finance. Drop it in a class
          called <code>SeedData</code>:
        </p>

        <CodeBlock lang="java" caption="SeedData.java, abbreviated; full list in your project">{`package com.example.bookmarks;

import java.util.List;

public class SeedData {
    public static List<BookmarkIndexer.Seed> load() {
        return List.of(
            new BookmarkIndexer.Seed("https://kotlinlang.org",
                "Kotlin programming language",
                "Statically-typed JVM language with null safety, coroutines, and Java interop."),
            new BookmarkIndexer.Seed("https://spring.io",
                "Spring Framework",
                "Application framework for the Java platform — IoC container, MVC, data, security."),
            new BookmarkIndexer.Seed("https://postgresql.org",
                "PostgreSQL database",
                "Relational database with strong SQL standards compliance, JSON, and extensions."),
            new BookmarkIndexer.Seed("https://www.seriouseats.com/the-food-lab",
                "The Food Lab",
                "Long-form food science writing — why your steak doesn't sear, the chemistry of bread."),
            new BookmarkIndexer.Seed("https://www.kenjilopezalt.com",
                "Kenji's recipes",
                "Tested recipes and cooking technique articles — pizza, pasta, weeknight meals."),
            new BookmarkIndexer.Seed("https://www.atlasobscura.com",
                "Atlas Obscura",
                "Curious places and hidden wonders — abandoned subway stations, oddball museums."),
            new BookmarkIndexer.Seed("https://en.wikipedia.org/wiki/Special:Random",
                "Random Wikipedia article",
                "Click for a random article — accidental learning about niche history and biology."),
            new BookmarkIndexer.Seed("https://nautil.us",
                "Nautilus magazine",
                "Long-form science journalism — physics, neuroscience, ecology, evolution."),
            new BookmarkIndexer.Seed("https://www.bogleheads.org",
                "Bogleheads forum",
                "Investing community focused on low-cost index funds and tax-efficient portfolios."),
            new BookmarkIndexer.Seed("https://www.investopedia.com",
                "Investopedia",
                "Reference for personal finance, accounting, and economics terminology."),
            // ... add 20 more covering programming languages, travel destinations,
            //     ML papers, woodworking, gardening, music theory, etc.
            new BookmarkIndexer.Seed("https://arxiv.org",
                "arXiv preprint server",
                "Open archive for research papers in math, physics, computer science, and biology.")
        );
    }
}`}</CodeBlock>

        <Callout variant="info" title="On corpus diversity">
          <p>
            The fun of this project is watching cross-topic queries do the right thing. &quot;cooking science&quot;
            should rank Kenji and Food Lab over Spring Framework. &quot;index fund investing&quot; should rank
            Bogleheads over arXiv. If your seed list is monotopic (all programming, say), every query will return
            similar scores and the demo will feel flat. Spread it across at least five distinct domains.
          </p>
        </Callout>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 6, The search controller</h3>

        <CodeBlock lang="java" caption="SearchController.java">{`package com.example.bookmarks;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
public class SearchController {

    private final EmbeddingModel embedder;
    private final BookmarkStore store;

    public SearchController(EmbeddingModel embedder, BookmarkStore store) {
        this.embedder = embedder;
        this.store = store;
    }

    @GetMapping("/search")
    public List<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "5") int k) {

        // 1. Embed the query — single API call.
        float[] queryVec = embedder.embed(q);

        // 2. Brute-force top-k.
        return store.search(queryVec, k).stream()
            .map(s -> Map.<String, Object>of(
                "title",       s.bookmark().title(),
                "url",         s.bookmark().url(),
                "description", s.bookmark().description(),
                "score",       Math.round(s.score() * 1000) / 1000.0
            ))
            .toList();
    }
}`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 7, A tiny static UI (optional but fun)</h3>

        <p>
          Drop this at <code>src/main/resources/static/index.html</code>. It&apos;s a single-file search box that
          calls your endpoint and prints results. No build step.
        </p>

        <CodeBlock lang="plain" caption="src/main/resources/static/index.html">{`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Semantic bookmarks</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; }
    input { width: 100%; padding: 12px; font-size: 16px; }
    .result { padding: 12px 0; border-bottom: 1px solid #eee; }
    .score { color: #888; font-size: 12px; margin-left: 8px; }
    a { color: #4f46e5; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Semantic bookmarks</h1>
  <p>Try: <em>cooking science</em>, <em>index fund investing</em>, <em>weird places to visit</em>.</p>
  <input id="q" placeholder="Ask in plain English…" autofocus />
  <div id="results"></div>
  <script>
    const q = document.getElementById('q');
    const results = document.getElementById('results');
    let timer;

    q.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(search, 300);   // debounce — don't embed every keystroke
    });

    async function search() {
      if (!q.value.trim()) { results.innerHTML = ''; return; }
      const r = await fetch('/search?q=' + encodeURIComponent(q.value) + '&k=5');
      const items = await r.json();
      results.innerHTML = items.map(i =>
        '<div class="result"><a href="' + i.url + '" target="_blank">' + i.title + '</a>' +
        '<span class="score">' + i.score + '</span>' +
        '<div>' + i.description + '</div></div>'
      ).join('');
    }
  </script>
</body>
</html>`}</CodeBlock>

        <h3 className="mt-8 mb-3 text-xl font-semibold">Step 8, Run it</h3>

        <CodeBlock lang="plain">{`export OPENAI_API_KEY=sk-...
./mvnw spring-boot:run`}</CodeBlock>

        <p className="mt-3">
          Open <a className="text-indigo-600 hover:underline" href="http://localhost:8080" target="_blank" rel="noreferrer">http://localhost:8080</a>.
          Type queries. Watch &quot;cooking science&quot; pull Kenji and Food Lab to the top. Type &quot;jvm
          language&quot; and Kotlin should win over Spring (close call, Spring is JVM-adjacent). Type something
          totally off-topic like &quot;bicycle&quot; and see all scores stay low, that&apos;s your signal that
          your corpus doesn&apos;t cover that domain.
        </p>

        <Callout variant="warn" title="Common errors & fixes">
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li><strong>&quot;No qualifying bean of type EmbeddingModel&quot;</strong>, your <code>pom.xml</code> is missing the embedding starter. <code>spring-ai-starter-model-openai</code> is the one you want for OpenAI.</li>
            <li><strong>&quot;OPENAI_API_KEY is not set&quot;</strong>, exported in the wrong shell, or your IDE&apos;s run config doesn&apos;t see your shell env. In IntelliJ, set the env var in Run/Debug Configurations.</li>
            <li><strong>All scores hover around 0.2–0.3</strong>, your seed corpus is too narrow, or your queries are way out of distribution. Add diversity.</li>
            <li><strong>All scores look identical to many decimal places</strong>, you&apos;re probably comparing the query against itself, or your embedder is returning a zero vector. Log <code>queryVec[0..5]</code> and confirm it&apos;s real numbers.</li>
            <li><strong>Indexing call returns a 400</strong>, likely a single bookmark whose text is empty (null description). Filter or default it before embedding.</li>
          </ul>
        </Callout>

        <Checkpoint moduleSlug="embeddings-deep" id="project" title="Project: semantic bookmark search" xp={50} manual manualLabel="My bookmarks search semantically">
          <p>
            Type three queries that aren&apos;t literal substrings of any bookmark title or description, and check
            that the right bookmark still wins. That&apos;s semantic search working. If you can do that, you&apos;ve
            built the data plane that every retrieval system needs, Module 16 swaps the in-memory store for
            pgvector with an HNSW index, and Module 18 wraps the whole thing in a chat UI.
          </p>
        </Checkpoint>
      </section>

      {/* ================================================================= */}
      {/* PART 5: FINAL QUIZ                                                 */}
      {/* ================================================================= */}
      <section id="final">
        <h2 className="mt-12 mb-4 text-2xl font-bold">Part 5, Final quiz</h2>

        <Quiz
          kind="Final quiz"
          question="Your team is choosing between text-embedding-3-large at full 3072 dims and text-embedding-3-small truncated to 512 dims. The corpus is 5M support-ticket descriptions. What's the right approach?"
          options={[
            { label: "Pick large, it's the higher-quality model", explanation: "Quality matters, but at 5M docs the 6× indexing cost and 6× search cost of large@3072 is a real bill. You owe yourself a measurement, not a default." },
            { label: "Pick small@512, it's cheaper and good enough", explanation: "Possibly true, but 'good enough' isn't a measurement either. You don't know without an eval." },
            { label: "Run a 50-pair eval on real support tickets, measure recall@5 for both, and pick by your own data, likely small@512 wins on cost-quality unless your tickets are unusually hard", correct: true, explanation: "Right. The model selection question only has a defensible answer with your own eval. Do the 50-pair check, look at recall@5, then look at the cost delta. Most teams find that mid-tier models at moderate dimensions hit recall plateau quickly." },
            { label: "Use both and ensemble the scores", explanation: "Doubles the embedding cost on the index and query paths and rarely improves recall@k meaningfully. Reranking with a cross-encoder is a better investment." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="A teammate writes the indexing loop as: for (var doc : docs) store.save(doc.id(), embedder.embed(doc.text())). The job takes 12 minutes for 10,000 docs. What's the most impactful single change?"
          options={[
            { label: "Switch to a cheaper embedding model", explanation: "Doesn't change the call structure, still N round-trips." },
            { label: "Replace the loop with embedder.embed(List<String>) batched at ~100, eliminates 9,900 of the 10,000 round-trips", correct: true, explanation: "Right. Per-call latency goes up modestly, but total wall-clock collapses ~30×. Same correctness, same provider, same cost, pure efficiency." },
            { label: "Add a Caffeine cache", explanation: "Indexing each doc once means cache hit rate is 0%. Caching is a query-path win, not an index-path win." },
            { label: "Run the loop in parallel with 16 threads", explanation: "Faster but still wasting per-request overhead. Combine batching + parallel for the right answer; batching alone is the bigger win." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You ship your search service. Recall@5 looks great in dev. In prod, after a week, recall@5 has quietly dropped to ~60% of where it started. What's the most likely cause?"
          options={[
            { label: "The embedding model was deprecated", explanation: "Possible but rare; providers usually announce. Won't typically halve recall." },
            { label: "Your prod corpus has drifted (new product launches, new ticket categories) but you haven't re-embedded, the live queries are out-of-distribution for the indexed corpus", correct: true, explanation: "Right. Embedding indexes age. If your domain has fresh content (new products, news, support categories), and you only embed once at deploy, your search quality decays as the gap between the index and the query distribution grows. Schedule re-embedding, or embed-on-write." },
            { label: "Cosmic rays flipped bits in your vectors", explanation: "Real phenomenon, vanishingly unlikely at this magnitude." },
            { label: "Postgres needs vacuuming", explanation: "Could affect latency, not recall." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="True or false: if you store cosine similarities between random unit vectors in 1024 dimensions, the histogram looks like a tight bell around zero."
          options={[
            { label: "True, high-dimensional random unit vectors are nearly orthogonal, so cosine concentrates near 0", correct: true, explanation: "Right. The standard deviation of cosine for random unit vectors in d dimensions shrinks like 1/√d. At d=1024 the bell is narrow and centered on 0, which is why embedding search depends on real models clustering meaningfully, rather than on the geometry being friendly." },
            { label: "False, cosines uniformly fill [-1, 1]", explanation: "Only at d=1." },
            { label: "False, they cluster around 1", explanation: "No, that would mean random vectors are similar to each other, which is the opposite of what high-D does." },
            { label: "True only when the vectors are sparse", explanation: "Sparsity isn't the cause; concentration of measure is." },
          ]}
          xp={20}
        />

        <Quiz
          kind="Final quiz"
          question="You're tempted to add an HNSW index to your 8,000-bookmark search. What's the mature engineering response?"
          options={[
            { label: "Add it anyway, better safe than sorry", explanation: "Adding indexes you don't need is a real cost: build time, recall risk, operational complexity." },
            { label: "8k vectors brute-force in <10ms, adding HNSW now buys you nothing and costs you complexity. Wait until brute-force latency is actually a problem, then add it with measurement", correct: true, explanation: "Right. Premature ANN indexing is a specific kind of over-engineering. The honest progression is: brute-force → measure → if and only if too slow, add an index → measure recall delta. Module 16 walks you through what 'too slow' looks like and what the index trade-offs actually are." },
            { label: "Add HNSW only if you also add IVFFlat", explanation: "These are alternatives, not complements." },
            { label: "Use a graph database instead", explanation: "Not relevant to this problem." },
          ]}
          xp={20}
        />

        <Checkpoint moduleSlug="embeddings-deep" id="final" title="Final quiz" xp={40} celebration="Phase 3 has begun. You shipped a real semantic search and you can defend your model choices. +40 XP">
          <p>
            That&apos;s Phase 3, Module 1 done. You can pick an embedding model defensibly, call it from Spring AI,
            handle batching and caching and L2 normalization correctly, and reason about when brute force is fine
            and when it isn&apos;t. Module 16 takes the &quot;when it isn&apos;t&quot; case and replaces the
            in-memory store with pgvector, a real database with real ANN indexes.
          </p>
        </Checkpoint>
      </section>

      <div className="mt-12 flex justify-between border-t border-slate-200 pt-8 text-sm dark:border-slate-800">
        <Link href="/courses/ai/modules/prompt-caching" className="text-indigo-600 hover:underline">← Module 13: Prompt caching</Link>
        <Link href="/courses/ai/modules/pgvector" className="text-indigo-600 hover:underline">Module 16: Vector DBs &amp; pgvector →</Link>
      </div>
        <ModuleNav courseId="ai" currentSlug="embeddings-deep" />
    </article>
  );
}
