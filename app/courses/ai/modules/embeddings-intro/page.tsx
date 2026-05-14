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
  { id: "vector-space", title: "Words as points in space" },
  { id: "cosine-similarity", title: "Cosine similarity, derived" },
  { id: "properties", title: "What embeddings actually encode" },
  { id: "nearest-neighbor", title: "Nearest-neighbor search" },
  { id: "java-project", title: "Project: NN search in Java" },
  { id: "final", title: "Final quiz" },
];

export default function EmbeddingsIntroModule() {
  const mod = getModuleBySlug("embeddings-intro")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/ai" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Embeddings: numbers become geometry</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Why &quot;king − man + woman ≈ queen&quot; isn&apos;t a party trick — it&apos;s the whole reason semantic search works.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="embeddings-intro" />
        <ModuleProgress moduleSlug="embeddings-intro" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Module 1 turned text into token IDs — integers. Integers are terrible for meaning: 5 and 6 are &quot;close&quot;
          but <code>cat</code> token 5 has nothing to do with <code>dog</code> token 6. Embeddings fix that. By the end you&apos;ll:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li>Explain why <strong>vector space</strong>{" "}is the right home for meaning.</li>
          <li>Derive <strong>cosine similarity</strong>{" "}from the dot product, and compute it by hand.</li>
          <li>Tell the difference between <strong>static</strong> (word2vec) and <strong>contextual</strong> (BERT/OpenAI) embeddings.</li>
          <li>Build a <strong>nearest-neighbor search</strong>{" "}in Java and see semantic lookup actually work.</li>
          <li>Know when cosine fails and why <strong>curse of dimensionality</strong>{" "}will haunt you in Phase 3.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          This module is the gateway to Phase 3 (RAG). Shaky intuition here means the vector DB chapter will feel like magic. Don&apos;t skip the worked examples.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: VECTOR SPACE                                               */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="embeddings-intro" id="vector-space" title="Vector space" xp={20} celebration="You&apos;ve moved from tokens to geometry. Every retrieval system on Earth runs on this.">
      <section>
        <h2>Part 1: Words as points in space</h2>

        <h3>The problem with token IDs</h3>
        <p>
          In Module 1 you saw text become a list of integers. The tokenizer might assign:
        </p>
        <CodeBlock lang="plain">{`cat    → 7453
dog    → 3290
canine → 18231
banana → 41022`}</CodeBlock>
        <p>
          These numbers are <em>identifiers</em>, not measurements. The fact that <code>cat</code> (7453) and <code>dog</code> (3290) differ by 4163
          tells you exactly nothing about whether cats and dogs are similar. <code>dog</code> and <code>canine</code> are
          near-synonyms and they&apos;re separated by 14941. Integers don&apos;t encode meaning — they encode position in a lookup table.
        </p>

        <h3>The fix: give every word a vector</h3>
        <p>
          What if instead of one number per word, we gave every word a <em>list</em>{" "}of numbers — say, three of them?
        </p>
        <CodeBlock lang="plain">{`cat    → [0.8, 0.1, 0.9]
dog    → [0.7, 0.2, 0.9]
canine → [0.6, 0.1, 0.9]
banana → [0.1, 0.9, 0.1]`}</CodeBlock>
        <p>
          Now the numbers have <em>room to be similar</em>. <code>cat</code> and <code>dog</code> agree on two of three dimensions.
          <code>banana</code> disagrees on all three. Without knowing what those three dimensions mean, you can already tell:
          the first three words cluster, the fourth is an outlier.
        </p>
        <p>
          Each list is a <strong>vector</strong>. Each number in the list is a <strong>dimension</strong>. The whole arrangement —
          every word living at some point in this multi-dimensional space — is the <strong>embedding space</strong>. Real-world embedding
          spaces have <strong>384</strong>, <strong>768</strong>, <strong>1024</strong>, or even <strong>3072</strong>{" "}dimensions.
          Three is just for our eyes.
        </p>

        <Callout variant="info" title="Where do those numbers come from?">
          <p className="m-0">
            The same way neural-network weights come from: <strong>training</strong>. A model reads billions of words and
            learns numbers for each token that make a prediction task work (e.g. &quot;predict the next word&quot;). The numbers that
            fall out are never hand-designed — and nobody can tell you &quot;dimension 47 means furriness.&quot; They&apos;re just the
            arrangement that makes prediction easiest. Meaning emerges as a side effect.
          </p>
        </Callout>

        <h3>An analogy: the city map</h3>
        <p>
          Imagine a map where every word is a building. Cities cluster by topic: a Food district (apple, banana, pizza),
          a Pets district (cat, dog, hamster), an Emotions district (angry, sad, happy). Synonyms are next-door neighbors.
          Antonyms are across town. When you ask &quot;what&apos;s near <code>joy</code>?&quot; the map says: <code>happiness</code>,
          <code>delight</code>, <code>elation</code> — and <code>sorrow</code> is the bus ride across the city.
        </p>
        <p>
          That map is what an embedding space <em>is</em>. Every semantic-search, RAG, or &quot;similar items&quot; feature
          is just looking up nearby buildings on this map.
        </p>

        <h3>The famous party trick</h3>
        <p>
          Once words live in vector space, you can do <em>arithmetic</em>{" "}on them. The classic example, from word2vec (2013):
        </p>
        <div className="not-prose my-6 mx-auto max-w-lg p-5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-center">
          <div className="font-mono text-lg">king − man + woman ≈ queen</div>
        </div>
        <p>
          Take the vector for <code>king</code>, subtract the vector for <code>man</code>, add the vector for <code>woman</code>,
          then ask: which word in the vocabulary has the closest vector to the result? Answer: <code>queen</code>.
        </p>
        <p>
          This works because the direction &quot;king → man&quot; and the direction &quot;queen → woman&quot; both encode
          the same concept (removing royalty, or flipping gender — the axes are entangled but consistent). The training
          never told the model &quot;royalty is a thing&quot;; the arrangement of billions of sentences forced that structure to appear.
        </p>

        <Quiz
          question="Why are vectors better than integer token IDs for representing meaning?"
          options={[
            { label: "Vectors are faster to store in memory than integers." },
            { label: "Vectors have multiple dimensions, so two words can be 'similar on some axes but different on others' — integers can't express that.", correct: true, explanation: "Vectors encode gradients of similarity across many independent dimensions. 'cat' and 'dog' can match on 'pet-ness' while differing on 'bark-likelihood'. A single integer can only be 'equal' or 'unequal' — no in-between." },
            { label: "Vectors are always normalized to have length 1, which integers can't do." },
            { label: "Vectors use floats, which GPUs process faster than integers." },
          ]}
        />

        <Quiz
          question="In a real 768-dimensional embedding from a model like BERT, what does dimension 47 typically mean?"
          options={[
            { label: "It encodes part-of-speech — dimension 47 is always the noun flag." },
            { label: "It encodes topic — dimension 47 is the 'food' axis." },
            { label: "Nothing interpretable on its own. Individual dimensions are entangled; meaning comes from the combination of all 768.", correct: true, explanation: "Embedding dimensions are not individually interpretable. Meaning lives in the geometry of the whole vector — the directions and distances — not in any single coordinate. This is why you can't 'edit dimension 47 to make the model happier.'" },
            { label: "It's always the hidden 'sentiment' dimension — that's why sentiment analysis works." },
          ]}
        />
      </section>
      <PartRecap
        title="Part 1 recap: vectors as geometry"
        gist="Embeddings replace opaque token IDs with points in 384-to-3072-dimensional space, where semantic similarity is literal nearness."
        points={[
          { takeaway: "Token IDs are labels, not measurements.", detail: <>Integer IDs like 7453 for <code>cat</code> only identify a slot in a vocabulary — arithmetic on them is meaningless.</> },
          { takeaway: "Embeddings give every token a vector so similarity has room to exist.", detail: <>Two words can agree on some dimensions and disagree on others. That&apos;s the whole point.</> },
          { takeaway: "The numbers are learned, not designed.", detail: <>Training on billions of words produces the arrangement that makes prediction easiest. Meaning emerges as a byproduct.</> },
          { takeaway: "Directions carry meaning; individual dimensions usually don't.", detail: <>&quot;king − man + woman ≈ queen&quot; works because the <em>gender direction</em> is consistent across the space — even though no single axis is &quot;gender.&quot;</> },
        ]}
      />
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 2: COSINE SIMILARITY                                          */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="embeddings-intro" id="cosine-similarity" title="Cosine similarity, by hand" xp={30} celebration="This formula is the single most-used equation in production AI after softmax. You now own it.">
      <section>
        <h2>Part 2: Cosine similarity — the one formula</h2>

        <h3>If words are points, what does &quot;close&quot; mean?</h3>
        <p>
          You have two vectors. You want a single number that answers: <em>how similar are they?</em>{" "}There are three natural candidates.
        </p>

        <h3>Candidate 1: Euclidean distance (and why it&apos;s wrong here)</h3>
        <p>
          The obvious one. For vectors <code>a</code> and <code>b</code>:
        </p>
        <div className="not-prose my-4 mx-auto max-w-md p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center font-mono text-sm">
          d(a, b) = √( Σᵢ (aᵢ − bᵢ)² )
        </div>
        <p>
          The trouble: Euclidean distance cares about <strong>magnitude</strong>. If someone embeds a 5-word tweet and a 5000-word essay,
          the essay&apos;s embedding is often <em>longer</em> (larger magnitude) than the tweet&apos;s — even if they&apos;re about the same topic.
          Euclidean distance will say they&apos;re far apart when they&apos;re semantically twins.
        </p>
        <p>
          We want similarity based on <em>direction</em>, not length. We want to ask: &quot;do these two arrows point the same way?&quot;
        </p>

        <h3>Candidate 2: Dot product</h3>
        <p>
          The dot product is defined as:
        </p>
        <div className="not-prose my-4 mx-auto max-w-md p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center font-mono text-sm">
          a · b = Σᵢ aᵢ · bᵢ = |a| · |b| · cos(θ)
        </div>
        <p>
          The second form is the important one: the dot product is <em>length times length times the cosine of the angle between them</em>.
          The cosine part is what we actually want. The two length factors are what we want to divide out.
        </p>

        <h3>Candidate 3 (the winner): cosine similarity</h3>
        <p>Divide the dot product by both lengths — lengths cancel, leaving only the angle:</p>
        <div className="not-prose my-6 mx-auto max-w-xl p-5 rounded-xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-center">
          <div className="text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-2">Cosine similarity</div>
          <div className="font-mono text-lg">cos(a, b) = (a · b) / ( |a| · |b| )</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">where |a| = √(Σᵢ aᵢ²)</div>
        </div>
        <p>
          The output lives in <code>[−1, +1]</code>:
        </p>
        <ul>
          <li><strong>+1</strong> — same direction (most similar)</li>
          <li><strong>0</strong> — orthogonal, unrelated</li>
          <li><strong>−1</strong> — opposite direction (rarely happens in practice with text embeddings — most sit in a narrow cone)</li>
        </ul>

        <WorkedExample title="Cosine similarity by hand" steps={[
          {
            title: "Set up three tiny 3-D vectors",
            body: (
              <>
                <p>From Part 1:</p>
                <CodeBlock lang="plain">{`cat    = [0.8, 0.1, 0.9]
dog    = [0.7, 0.2, 0.9]
banana = [0.1, 0.9, 0.1]`}</CodeBlock>
                <p>
                  Question: is <code>cat</code> closer (by cosine) to <code>dog</code> or to <code>banana</code>?
                  Our eyes say obviously dog. Let&apos;s check.
                </p>
              </>
            ),
          },
          {
            title: "Dot products",
            body: (
              <>
                <CodeBlock lang="plain">{`cat · dog    = 0.8·0.7 + 0.1·0.2 + 0.9·0.9
             = 0.56 + 0.02 + 0.81
             = 1.39

cat · banana = 0.8·0.1 + 0.1·0.9 + 0.9·0.1
             = 0.08 + 0.09 + 0.09
             = 0.26`}</CodeBlock>
                <p>Dot product already ranks them right. But magnitudes could fool us, so finish the job.</p>
              </>
            ),
          },
          {
            title: "Vector lengths",
            body: (
              <>
                <CodeBlock lang="plain">{`|cat|    = √(0.64 + 0.01 + 0.81) = √1.46 ≈ 1.208
|dog|    = √(0.49 + 0.04 + 0.81) = √1.34 ≈ 1.158
|banana| = √(0.01 + 0.81 + 0.01) = √0.83 ≈ 0.911`}</CodeBlock>
              </>
            ),
          },
          {
            title: "Divide",
            body: (
              <>
                <CodeBlock lang="plain">{`cos(cat, dog)    = 1.39 / (1.208 · 1.158) = 1.39 / 1.399 ≈ 0.994
cos(cat, banana) = 0.26 / (1.208 · 0.911) = 0.26 / 1.100 ≈ 0.236`}</CodeBlock>
                <p>
                  <strong>0.994</strong>{" "}vs <strong>0.236</strong>. Cat and dog point <em>almost the same way</em>.
                  Cat and banana are nearly orthogonal. The geometry matches our intuition.
                </p>
              </>
            ),
          },
        ]} />

        <h3>Why people normalize first</h3>
        <p>
          If you pre-divide every vector by its length (<strong>L2 normalize</strong>, so every vector has length 1),
          then <em>cosine similarity equals the dot product</em> — no division needed at query time. This is why production vector DBs store normalized vectors: search becomes a pure matrix multiply.
        </p>
        <CodeBlock lang="java">{`// L2 normalize: in place
static void normalize(double[] v) {
    double sum = 0.0;
    for (double x : v) sum += x * x;
    double norm = Math.sqrt(sum);
    if (norm == 0.0) return;          // avoid divide-by-zero
    for (int i = 0; i < v.length; i++) v[i] /= norm;
}

// Cosine similarity on normalized vectors = dot product
static double cosine(double[] a, double[] b) {
    double s = 0.0;
    for (int i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
}`}</CodeBlock>

        <Callout variant="warn" title="Cosine vs. 'cosine distance'">
          <p className="m-0">
            Some libraries return <strong>cosine distance</strong> = <code>1 − cos(a,b)</code>. So &quot;distance 0&quot; means identical
            and &quot;distance 1&quot; means orthogonal. When you&apos;re sorting results, distance sorts ascending, similarity sorts descending.
            Mixing the two up is the #1 bug in people&apos;s first vector search implementation. Read the library docs.
          </p>
        </Callout>

        <Quiz
          question="Two text embeddings give cos(a, b) = 0.94. What does that tell you?"
          options={[
            { label: "They're opposites." },
            { label: "They're unrelated." },
            { label: "They point in nearly the same direction — almost certainly semantically similar.", correct: true, explanation: "0.94 is very close to 1 (maximum). That means the angle between the vectors is small, which for text embeddings is a reliable signal of semantic similarity. (Most text vectors sit in a narrow positive cone, so the 'useful' range is often more like 0.3–0.99, but 0.94 is clearly at the top of it.)" },
            { label: "Nothing — cosine similarity is always positive for text, so 0.94 could mean anything." },
          ]}
        />

        <Quiz
          question="Why is cosine similarity usually preferred over Euclidean distance for text embeddings?"
          options={[
            { label: "Cosine is faster to compute than Euclidean." },
            { label: "Euclidean distance is undefined in high dimensions." },
            { label: "Cosine ignores magnitude — so a short document and a long document on the same topic still match. Euclidean can be fooled by length differences.", correct: true, explanation: "Text embeddings can vary in magnitude for reasons unrelated to meaning (length, frequency of the tokens involved). Cosine strips out magnitude and keeps only direction — which is where the semantics actually live." },
            { label: "Cosine returns a probability, Euclidean doesn't." },
          ]}
        />

        <Quiz
          question="Quick head-math: what is cos(a, b) for a = [1, 0] and b = [1, 1]?"
          options={[
            { label: "0" },
            { label: "1 / √2 ≈ 0.707", correct: true, explanation: "Dot: 1·1 + 0·1 = 1. |a| = 1, |b| = √2. So cosine = 1 / (1·√2) = 1/√2 ≈ 0.707. This is the cosine of 45°, which is the angle between [1,0] and [1,1]." },
            { label: "1" },
            { label: "2" },
          ]}
        />
      </section>
      <PartRecap
        title="Part 2 recap: cosine is the metric"
        gist="Cosine similarity = dot product divided by both lengths. It measures direction, which is where semantic meaning lives — and it collapses to a pure dot product once you pre-normalize."
        points={[
          { takeaway: "Euclidean distance gets fooled by vector length.", detail: <>A long essay and a short tweet on the same topic can sit far apart in Euclidean distance even though they&apos;re near-parallel.</> },
          { takeaway: "Cosine ranges from −1 to +1.", detail: <>+1 = same direction, 0 = orthogonal, −1 = opposite. Most real text pairs sit in a positive cone.</> },
          { takeaway: "Normalize once, dot-product forever.", detail: <>If |a| = |b| = 1, then cos(a,b) = a · b. That&apos;s why vector DBs store normalized vectors.</> },
          { takeaway: "Similarity vs distance = sign flip.", detail: <>Distance = 1 − similarity. Sort ascending by distance, descending by similarity. Mixing them up is the #1 first-time vector-search bug.</> },
        ]}
      />
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 3: WHAT EMBEDDINGS ENCODE                                     */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="embeddings-intro" id="properties" title="What embeddings encode" xp={25} celebration="You now know which model to grab for which job — that's more than most engineers shipping RAG in 2026.">
      <section>
        <h2>Part 3: Static vs contextual embeddings — and where they fail</h2>

        <h3>Two families of embeddings</h3>
        <p>
          Not all embedding models are the same. There are two big families.
        </p>

        <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Static (word2vec, GloVe)</div>
            <p className="text-sm m-0 mb-2">One vector per word, forever. The word <code>bank</code> has exactly one embedding — even though a river bank and a savings bank are different concepts.</p>
            <p className="text-xs text-slate-500 m-0">Fast, tiny, obsolete for new work. Still useful for quick prototypes and teaching.</p>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 p-5 bg-indigo-50/40 dark:bg-indigo-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Contextual (BERT, OpenAI, Cohere, Voyage)</div>
            <p className="text-sm m-0 mb-2">Embeddings depend on the surrounding sentence. &quot;Sat by the <strong>bank</strong>{" "}of the river&quot; and &quot;deposited at the <strong>bank</strong>&quot; produce different vectors for <code>bank</code>.</p>
            <p className="text-xs text-slate-500 m-0">What every production system uses in 2026. The transformer (Module 5) is the machine under the hood.</p>
          </div>
        </div>

        <Callout variant="insight" title="Sentence embeddings, which you'll actually use">
          <p className="m-0">
            In RAG and search, you rarely embed single words. You embed <strong>chunks of text</strong> — a paragraph, a question, a product description. A contextual model reads the whole chunk and returns
            <em> one</em>{" "}vector summarizing it. That&apos;s what gets stored in a vector DB. We&apos;ll do this for real in Phase 3.
          </p>
        </Callout>

        <h3>What directions actually encode</h3>
        <p>
          Empirically, trained embeddings learn surprisingly clean directions. In word2vec-style spaces you can find axes for:
        </p>
        <ul>
          <li><strong>gender:</strong>{" "}king → queen, actor → actress, uncle → aunt</li>
          <li><strong>verb tense:</strong>{" "}walk → walked, eat → ate</li>
          <li><strong>plural:</strong>{" "}car → cars, mouse → mice</li>
          <li><strong>country ↔ capital:</strong>{" "}France → Paris, Japan → Tokyo</li>
          <li><strong>comparative/superlative:</strong>{" "}big → bigger → biggest</li>
        </ul>
        <p>
          Nobody told the model these concepts exist. They emerge because a model that captures them predicts text better than one that doesn&apos;t.
        </p>

        <h3>Where embeddings fail — three gotchas</h3>

        <h4>1. Anisotropy (the narrow-cone problem)</h4>
        <p>
          In practice, most text embeddings don&apos;t spread across the whole sphere. They pile into a narrow cone. The result: random unrelated sentences might have cosine <strong>0.6</strong>, not 0.0. The &quot;zero&quot; baseline is shifted, so you have to calibrate thresholds per model.
        </p>

        <h4>2. Negations and small words</h4>
        <p>
          &quot;I love skiing&quot; and &quot;I don&apos;t love skiing&quot; have very high cosine similarity in most models. One tiny word flips the meaning; embeddings often don&apos;t. This is why pure cosine retrieval is weak at contradiction, and why people layer in re-ranking (Module 15-16).
        </p>

        <h4>3. Curse of dimensionality (a Phase-3 preview)</h4>
        <p>
          In high dimensions, distances become weirdly flat. In 3-D, a nearest neighbor is clearly the nearest. In 1024-D,
          the nearest and farthest point often have similar distances. Brute-force search still works (what you&apos;ll build in the project),
          but at millions of vectors you need <strong>approximate nearest neighbor</strong>{" "}indexes (HNSW, IVFFlat) — also Phase 3.
        </p>

        <h3>Two embeddings you&apos;ll encounter in practice</h3>
        <CodeBlock lang="plain">{`OpenAI text-embedding-3-small     → 1536 dims, cheap, surprisingly strong
OpenAI text-embedding-3-large     → 3072 dims, expensive, slightly better
Voyage voyage-3                    → 1024 dims, tuned for code & retrieval
sentence-transformers all-MiniLM  → 384 dims, runs locally, free, weaker
Cohere embed-english-v3           → 1024 dims, strong for English`}</CodeBlock>
        <p>
          You&apos;ll pick between these in Phase 3. For today: they all return a list of floats that obeys the same math you just learned.
        </p>

        <Quiz
          question="Someone says: 'Embeddings can't distinguish a river bank from a financial bank — they both map to the same vector.' When is that true?"
          options={[
            { label: "Always — it's a fundamental limitation of vectors." },
            { label: "Only for static embeddings (word2vec, GloVe). Contextual embeddings (BERT, OpenAI) use the whole sentence and produce different vectors for each sense.", correct: true, explanation: "This is the static-vs-contextual distinction. Static models collapse all senses of 'bank' into one point; contextual models read the surrounding sentence and produce a different vector per occurrence. All production embedding APIs in 2026 are contextual." },
            { label: "Only for high-dimensional embeddings; low-dim ones separate senses cleanly." },
            { label: "Never — any modern embedding model perfectly separates word senses." },
          ]}
        />

        <Quiz
          question="Your semantic search retrieves 'I don't like spicy food' when the user asked about 'I like spicy food.' What's going on?"
          options={[
            { label: "The embedding model is broken — file a bug report." },
            { label: "You forgot to normalize the vectors." },
            { label: "Most embedding models are weak at negation — one small word flipping meaning doesn't shift the vector much. Add re-ranking or hybrid search to fix it.", correct: true, explanation: "Negation is a well-known weakness of dense-vector retrieval. The sentences share almost every word, so their embeddings are near-identical. Production systems fix this by adding a re-ranker (a cross-encoder that reads both texts together)." },
            { label: "Cosine similarity always ignores negations by design." },
          ]}
        />
      </section>
      <PartRecap
        title="Part 3 recap: what embeddings actually encode"
        gist="Modern embedding APIs return contextual sentence vectors. They work beautifully most of the time — and fail in a few predictable ways you need to know about."
        points={[
          { takeaway: "Static vs contextual is the most important distinction.", detail: <>word2vec/GloVe = one vector per word forever. BERT/OpenAI = one vector per occurrence, shaped by context. Production is always contextual.</> },
          { takeaway: "Directions in embedding space carry semantic relations.", detail: <>Gender, tense, plural, country→capital — all of these emerge as roughly consistent directions without being labeled during training.</> },
          { takeaway: "Anisotropy shifts the zero baseline.", detail: <>Random unrelated text pairs often cosine around 0.6, not 0. Calibrate thresholds per model; don&apos;t assume 0 means &quot;unrelated.&quot;</> },
          { takeaway: "Negation blindness is the classic failure.", detail: <>&quot;I love X&quot; and &quot;I don&apos;t love X&quot; look nearly identical to cosine. Layer in a re-ranker or hybrid BM25+vector search to recover.</> },
        ]}
      />
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 4: NEAREST-NEIGHBOR SEARCH                                    */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="embeddings-intro" id="nearest-neighbor" title="Nearest-neighbor search" xp={25} celebration="That's a vector database in 30 lines. pgvector is literally this plus an index.">
      <section>
        <h2>Part 4: Nearest-neighbor search — the algorithm under every RAG system</h2>

        <h3>The problem</h3>
        <p>
          You have 10,000 documents, each represented by a 768-dimensional vector. A user types a question. You embed the question into the same space. You want the <strong>k</strong>{" "}documents whose vectors are closest to the question vector.
        </p>

        <h3>Brute force (and why it&apos;s surprisingly good)</h3>
        <p>Here&apos;s the whole algorithm:</p>
        <CodeBlock lang="plain">{`1. Embed the query → q
2. For every document d in the corpus:
       score[d] = cosine(q, d.vector)
3. Return the top-k documents by score (descending)`}</CodeBlock>
        <p>
          That&apos;s it. No magic. Complexity is <strong>O(n · dim)</strong> — linear in the number of documents. At
          10,000 documents × 768 dims, that&apos;s ~8M multiplies per query. A modern laptop does billions of those per second.
          Brute force is fine up to roughly a million vectors.
        </p>
        <p>
          Only beyond that (tens of millions, hundreds of millions) do you need <strong>approximate</strong>{" "}nearest neighbors
          (HNSW, IVFFlat, product quantization) — Phase 3&apos;s pgvector module covers those. You don&apos;t need them today.
        </p>

        <h3>Java skeleton</h3>
        <CodeBlock lang="java">{`record Document(String id, String text, double[] vector) {}

static List<Document> topK(double[] query, List<Document> corpus, int k) {
    // Assume query and every doc.vector() are already L2-normalized.
    // Then cosine(a, b) = dot(a, b).

    var scored = new ArrayList<Map.Entry<Document, Double>>(corpus.size());
    for (Document d : corpus) {
        double s = 0.0;
        double[] v = d.vector();
        for (int i = 0; i < v.length; i++) s += v[i] * query[i];
        scored.add(Map.entry(d, s));
    }
    scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue())); // desc
    return scored.stream().limit(k).map(Map.Entry::getKey).toList();
}`}</CodeBlock>
        <p>
          If you don&apos;t pre-normalize, compute <code>a·b / (|a|·|b|)</code> instead. If your corpus is bigger than fits in memory, you use a database with a vector index — but the concept is the same.
        </p>

        <Callout variant="info" title="Why sort is fine at small scale">
          <p className="m-0">
            Sorting is O(n log n). A min-heap of size k brings you to O(n log k), which matters at 10M+ vectors. For your project today, <code>sort().limit(k)</code> is perfectly fine and easier to read.
          </p>
        </Callout>

        <h3>A tiny 2-D example you can actually check on paper</h3>
        <WorkedExample title="Nearest-neighbor search in 2-D" steps={[
          {
            title: "Corpus (pre-normalized)",
            body: (
              <>
                <CodeBlock lang="plain">{`d1 = [1.0, 0.0]     "kitten"
d2 = [0.9, 0.436]   "puppy"
d3 = [0.0, 1.0]     "banana"
d4 = [-0.707, 0.707] "sadness"`}</CodeBlock>
                <p>All four vectors have length 1 (check: d2 is √(0.9² + 0.436²) = √(0.81 + 0.190) ≈ √1.000 = 1). They live on the unit circle.</p>
              </>
            ),
          },
          {
            title: "Query",
            body: (
              <>
                <CodeBlock lang="plain">{`q = [0.95, 0.312]   "cat"  (normalized)`}</CodeBlock>
              </>
            ),
          },
          {
            title: "Dot products (= cosine, since all normalized)",
            body: (
              <>
                <CodeBlock lang="plain">{`q · d1 = 0.95·1.0 + 0.312·0.0       = 0.950
q · d2 = 0.95·0.9 + 0.312·0.436     = 0.855 + 0.136 = 0.991
q · d3 = 0.95·0.0 + 0.312·1.0       = 0.312
q · d4 = 0.95·(-0.707) + 0.312·0.707 = -0.671 + 0.221 = -0.450`}</CodeBlock>
                <p>Ranking: <strong>d2 (0.991) &gt; d1 (0.950) &gt; d3 (0.312) &gt; d4 (−0.450)</strong>.</p>
                <p>
                  &quot;cat&quot; → top hit &quot;puppy&quot; (both pets, close angle), then &quot;kitten&quot;, then &quot;banana&quot; (orthogonal-ish), then &quot;sadness&quot; (opposite side). Geometry does its job.
                </p>
              </>
            ),
          },
        ]} />

        <Quiz
          question="You have 50,000 documents, each a 768-dim embedding, and you want top-5 for a query. What's the per-query cost of brute-force cosine search with normalized vectors?"
          options={[
            { label: "O(1) — vectors make it instant." },
            { label: "O(log n) — it's basically a binary search." },
            { label: "O(n · dim) ≈ 38 million multiplies per query — easy on a laptop.", correct: true, explanation: "One dot product per doc = 768 multiplies. 50,000 × 768 = 38.4M multiplies. A laptop CPU does billions of multiplies per second, so this runs in milliseconds. That's why brute force carries you surprisingly far." },
            { label: "O(n²) — comparing every pair." },
          ]}
        />

        <Quiz
          question="Why do production vector stores (pgvector, Qdrant, Pinecone) usually require or encourage you to normalize vectors before storing them?"
          options={[
            { label: "Normalization makes the vectors smaller on disk." },
            { label: "With L2-normalized vectors, cosine similarity equals the dot product — which is a single fused multiply-add per dim, perfect for SIMD and GPU kernels.", correct: true, explanation: "Cosine = dot / (|a|·|b|). If |a| = |b| = 1, the division vanishes and you just dot. Hardware loves that: no divides, no square roots, just a tight multiply-add loop." },
            { label: "The vector DB will reject unnormalized vectors as malformed." },
            { label: "Normalization is required for the vectors to be valid embeddings." },
          ]}
        />
      </section>
      <PartRecap
        title="Part 4 recap: nearest-neighbor search is a loop"
        gist="Embed the query, dot-product against every stored vector, sort, return the top k. That's it — the whole algorithm behind every RAG system."
        points={[
          { takeaway: "The inner loop is literally a dot product.", detail: <>Per query: <code>O(n · dim)</code>. A 1M-doc, 768-dim corpus is ~770M multiplies — still under a second on a laptop.</> },
          { takeaway: "Sort vs heap matters only at scale.", detail: <>Sort: O(n log n). Min-heap of size k: O(n log k). For &lt;1M docs just sort — simpler and plenty fast.</> },
          { takeaway: "Approximate indexes take over beyond ~10M vectors.", detail: <>HNSW, IVFFlat, PQ — same interface, trade a tiny bit of recall for orders of magnitude in speed. We build one in Phase 3.</> },
          { takeaway: "Pre-normalize everything at ingest time.", detail: <>Do it once, at storage. Query time becomes a pure dot product that vectorizes perfectly.</> },
        ]}
      />
      </Checkpoint>

      {/* ================================================================= */}
      {/* PROJECT                                                            */}
      {/* ================================================================= */}
      <Checkpoint
        moduleSlug="embeddings-intro"
        id="java-project"
        title="Project: nearest-neighbor search in Java"
        xp={60}
        manual
        manualLabel="I built it and semantic search works"
        celebration="You just built the core loop of every RAG system on Earth. Phase 3 is going to feel like applied work, not magic."
      >
      <section>
        <h2>Project: build a tiny semantic search in Java</h2>
        <p>
          You&apos;re going to build a mini-corpus of 8–12 sentences, give each one a hand-crafted 3-D &quot;embedding&quot; that reflects its meaning,
          and write a nearest-neighbor search that retrieves the top-k for a query sentence. You won&apos;t use a real embedding model yet — that
          comes in Phase 3. The point today is to feel the algorithm.
        </p>

        <h3>Starter corpus (hand-crafted vectors)</h3>
        <p>
          Pick three axes yourself. Example set: axis 1 = &quot;animal-ness&quot;, axis 2 = &quot;food-ness&quot;, axis 3 = &quot;emotion-ness&quot;.
          Assign each sentence a vector where each coordinate is in [0, 1]. It&apos;ll be crude, but it works.
        </p>
        <CodeBlock lang="java">{`record Document(String id, String text, double[] vector) {}

List<Document> corpus = List.of(
    new Document("d1",  "A cat is sleeping on the couch.",        new double[]{0.9, 0.0, 0.2}),
    new Document("d2",  "The dog barked at the mail carrier.",    new double[]{0.9, 0.0, 0.3}),
    new Document("d3",  "I ate a banana for breakfast.",          new double[]{0.0, 0.9, 0.1}),
    new Document("d4",  "Pizza delivery is on the way.",          new double[]{0.0, 0.9, 0.2}),
    new Document("d5",  "I feel overwhelmed today.",              new double[]{0.0, 0.1, 0.9}),
    new Document("d6",  "That movie made me so happy.",           new double[]{0.0, 0.1, 0.9}),
    new Document("d7",  "My puppy loves treats.",                 new double[]{0.9, 0.4, 0.5}),
    new Document("d8",  "Sourdough is my favorite bread.",        new double[]{0.0, 0.9, 0.2}),
    new Document("d9",  "The kitten purred loudly.",              new double[]{0.9, 0.0, 0.4})
);`}</CodeBlock>

        <h3>What to implement</h3>
        <ol>
          <li><code>void normalize(double[] v)</code> — L2 normalize in place.</li>
          <li><code>double cosine(double[] a, double[] b)</code> — assume both pre-normalized; return dot product.</li>
          <li><code>double cosineUnnormalized(double[] a, double[] b)</code> — full formula, no assumptions.</li>
          <li><code>List&lt;Document&gt; topK(double[] query, List&lt;Document&gt; corpus, int k)</code>.</li>
          <li>A <code>main</code> that normalizes every doc once, then runs three queries and prints top-3 for each.</li>
        </ol>

        <h3>Test queries (hand-craft query vectors too)</h3>
        <CodeBlock lang="plain">{`Q1 "looking for my lost pet"       → [0.9, 0.0, 0.4]   expect: kitten/dog/cat at top
Q2 "hungry, craving carbs"         → [0.0, 0.95, 0.0]  expect: pizza/banana/sourdough
Q3 "I'm not doing well emotionally" → [0.0, 0.0, 0.95]  expect: overwhelmed + happy`}</CodeBlock>

        <h3>Milestones</h3>
        <ol>
          <li><strong>Cosine sanity:</strong> <code>cosine([1,0,0], [1,0,0]) == 1.0</code> and <code>cosine([1,0,0], [0,1,0]) == 0.0</code>.</li>
          <li><strong>Normalized = dot:</strong>{" "}verify your two cosine functions agree on normalized input to within 1e-9.</li>
          <li><strong>Pet query:</strong>{" "}Q1 returns a pet as the top hit.</li>
          <li><strong>Emotion query:</strong>{" "}Q3 returns an emotion sentence as the top hit and pizza is <em>not</em>{" "}in the top-2.</li>
          <li><strong>Ordering is stable:</strong>{" "}run the same query twice, get identical rankings.</li>
        </ol>

        <h3>Stretch goals</h3>
        <ul>
          <li>Replace the hand-crafted vectors with <strong>TF-IDF</strong>{" "}features over a small vocab — same math, real embeddings (lexical, not semantic, but a real step up).</li>
          <li>Add a tiny React 2-D visualizer: plot the first two dims on a scatter plot, highlight the query and top-k. (We&apos;ll help you wire this in later.)</li>
          <li>Benchmark brute-force search time on 100k random vectors — see when it starts to feel slow.</li>
        </ul>

        <h3>Gotchas</h3>
        <ul>
          <li><strong>Zero vector:</strong> <code>normalize</code> must not divide by zero. Guard against <code>norm == 0</code>.</li>
          <li><strong>Don&apos;t re-normalize in the hot loop:</strong>{" "}normalize every doc once at load, not per query.</li>
          <li><strong>Cosine vs distance:</strong>{" "}if you ever sort ascending by &quot;distance&quot;, you&apos;ve introduced the most common bug. Sort descending by similarity.</li>
          <li><strong>Float precision:</strong> <code>cosine([1,0,0], [1,0,0])</code> may come back as 0.9999999998. Don&apos;t compare with <code>==</code>; use a tolerance.</li>
        </ul>

        <Callout variant="info" title="Why this is the whole game">
          <p className="m-0">
            When you hit Phase 3, we swap the hand-crafted vectors for a call to an embedding API and the <code>List</code> for a pgvector-backed
            table. The algorithm does not change. This is your first real piece of production AI infrastructure, hiding in 30 lines.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="embeddings-intro" id="final" title="Final quiz" xp={30} celebration="Phase 1 is almost behind you. One short prompt-engineering chapter, one recap, and you're into the API.">
      <section>
        <h2>Final quiz</h2>
        <p>Six questions tying Parts 1–4 together. Get every one right and the module clears.</p>

        <Quiz
          question="What's the single-sentence definition of an embedding?"
          options={[
            { label: "A hash of a token." },
            { label: "A compressed version of the original text." },
            { label: "A vector in high-dimensional space whose geometry encodes meaning — learned from data.", correct: true },
            { label: "A lookup key into a vocabulary table." },
          ]}
        />

        <Quiz
          question="cos(a, b) = 0.02 for two text-embedding vectors. Best read?"
          options={[
            { label: "They're almost identical." },
            { label: "They're opposites." },
            { label: "They're essentially unrelated — nearly orthogonal.", correct: true },
            { label: "They can't be text embeddings — text embeddings are never that low." },
          ]}
        />

        <Quiz
          question="Static embeddings (word2vec) map the word 'bank' to:"
          options={[
            { label: "A different vector depending on surrounding words." },
            { label: "Exactly one vector — regardless of whether it's a river bank or a savings bank.", correct: true },
            { label: "Two vectors, one per known sense." },
            { label: "The average of all its uses in context." },
          ]}
        />

        <Quiz
          question="You pre-normalize all stored vectors. What's the payoff at query time?"
          options={[
            { label: "Vectors take less memory." },
            { label: "Cosine similarity reduces to a pure dot product — no division, no sqrt.", correct: true },
            { label: "Rankings are more accurate." },
            { label: "You can skip the dot product entirely." },
          ]}
        />

        <Quiz
          question="Brute-force nearest neighbor on a 100k-doc, 768-dim corpus typically..."
          options={[
            { label: "is impractical — you must use an ANN index." },
            { label: "runs in milliseconds per query on a laptop.", correct: true },
            { label: "is O(n²)." },
            { label: "requires a GPU to be feasible." },
          ]}
        />

        <Quiz
          question="Your semantic search returns 'I hate skiing' for the query 'I love skiing'. What's the most likely explanation?"
          options={[
            { label: "The embedding model is broken." },
            { label: "Cosine similarity is the wrong metric here — use Euclidean." },
            { label: "Dense-vector models are weak at negation: small words that flip meaning barely shift the vector. Add a re-ranker or hybrid search.", correct: true },
            { label: "You forgot to normalize the query vector." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* NEXT MODULE                                                        */}
      {/* ================================================================= */}
      <section className="mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mt-0 mb-2">Next up: Module 7 — Prompt engineering</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You&apos;ve built the model-side understanding. Next you turn it around and learn how to
          <em> talk</em>{" "}to one: system prompts, few-shot, chain-of-thought, structured output — all locally, no API key required.
        </p>
        <Link
          href="/courses/ai/modules/prompt-engineering"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
        >
          Start Module 7 →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="embeddings-intro" />
    </article>
  );
}
