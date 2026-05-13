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
  { id: "why-attention", title: "Why attention was invented" },
  { id: "qkv", title: "Queries, keys, values: the filing-cabinet metaphor" },
  { id: "scaled-dot-product", title: "Scaled dot-product attention, end to end" },
  { id: "multi-head", title: "Multi-head: attention in parallel perspectives" },
  { id: "positional", title: "Positional encoding: putting order back in" },
  { id: "transformer-block", title: "The transformer block" },
  { id: "java-project", title: "Project: scaled dot-product attention in Java" },
  { id: "final", title: "Final quiz" },
];

export default function TransformersModule() {
  const mod = getModuleBySlug("transformers")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Attention &amp; transformers</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The one idea that ate the ML world — built from scratch, one matrix at a time.
        </p>
        <ModuleProgress moduleSlug="transformers" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The famous 2017 paper &quot;Attention Is All You Need&quot; introduced the transformer — the architecture behind every LLM you use.
          We&apos;re going to build its single most important piece, scaled dot-product attention, by hand in Java. By the end you&apos;ll:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li>Explain <em>why</em> attention was invented — and what RNNs couldn&apos;t do.</li>
          <li>Understand queries, keys, and values without hand-waving.</li>
          <li>Compute an attention output for a 5-token sequence <em>by hand</em>.</li>
          <li>Know why it&apos;s &quot;scaled&quot; and why softmax is there.</li>
          <li>Ship a Java implementation of self-attention. 40 lines, no library.</li>
          <li>Sketch a full transformer block — residuals, layer norm, FFN — and know what each piece does.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          Fair warning: this is one idea, explained thoroughly. Budget ~3–4h. The math is easier than Module 4&apos;s backprop — the <em>intuition</em> is what takes time.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: WHY ATTENTION                                              */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="why-attention" title="Why attention was invented" xp={20} celebration="You understand what problem transformers were built to solve. Everything below is variations on this.">
      <section>
        <h2>Part 1: Why attention was invented</h2>

        <Callout variant="info" title="Where Module 4 leaves off, and why we need something new">
          <p className="m-0">
            Module 4&apos;s MLP can take a fixed-size input vector (784 pixels) and produce a fixed-size output (10 digit scores). What it <em>can&apos;t</em> do is process a variable-length sequence — &quot;Why is String immutable?&quot; vs an entire RAG document — and let every token influence every other token. Attention is the operation that fills that gap. The MLP isn&apos;t going away (you&apos;ll see it inside every transformer block, doing the same widen-then-project trick you built); it just gets a sequence-aware partner. <strong>Attention mixes across positions; the MLP transforms at each position.</strong> That one line is the whole module in miniature.
          </p>
        </Callout>

        <h3>The problem: long sentences break sequential models</h3>
        <p>
          Before 2017, the standard way to process sequences (translation, summarization) was the <strong>RNN</strong> — a recurrent neural network.
          An RNN processes one token at a time, updating a single &quot;hidden state&quot; vector that&apos;s supposed to summarize everything it&apos;s seen so far.
        </p>

        <CodeBlock lang="plain">
{`   [the]  →  [dog]  →  [chased]  →  [the]  →  [cat]
     ↓        ↓          ↓           ↓        ↓
     h₁  →    h₂    →   h₃     →    h₄   →    h₅

(h₅ is supposed to summarize the whole sentence.)`}
        </CodeBlock>

        <p>
          Problem: by the time you&apos;re at token 50, whatever information was in token 1 has been blended, diluted, and half-forgotten by the repeated hidden-state updates.
          Translate a long French sentence to English and the RNN often gets the last part right and the first part mangled. The bottleneck is that single summary vector <code>h</code>.
        </p>

        <Callout variant="info" title="The forgetting is provable, not just empirical">
          <p className="m-0">
            Every RNN step multiplies the hidden state by a weight matrix and squishes through a non-linearity.
            For information from 50 steps ago to survive, it has to pass through 50 such transformations without being overwritten.
            Gradients pushing back through 50 steps also shrink to zero (vanishing gradients, again). LSTMs and GRUs helped, but never truly fixed it.
          </p>
        </Callout>

        <h3>The insight: look directly, not through a bottleneck</h3>

        <p>
          What if, instead of compressing the whole past into one vector, every output position could look back at every input position directly and decide which ones matter?
        </p>

        <p>
          That&apos;s attention. When translating &quot;the cat sat on the mat&quot; to French and generating the word for &quot;cat&quot;, the model <em>attends</em> to the English &quot;cat&quot; with high weight and essentially ignores the others.
          No bottleneck. No forgetting. Every token has a direct line of sight to every other token.
        </p>

        <h3>A concrete motivation: pronoun resolution</h3>

        <p>
          Take the sentence:
        </p>

        <p className="italic text-center text-slate-700 dark:text-slate-300">
          &quot;The trophy didn&apos;t fit in the suitcase because <strong>it</strong> was too big.&quot;
        </p>

        <p>
          Quick: what does &quot;it&quot; refer to — the trophy or the suitcase? You know it&apos;s the trophy (because of &quot;big&quot;).
          To answer that, the model processing the word &quot;it&quot; needs to look back at &quot;trophy&quot; and &quot;suitcase&quot;, compare them against the context, and weigh them.
          Attention is precisely the mechanism that lets it do so.
        </p>

        <Callout variant="insight" title="Why attention 'ate the world'">
          <p className="mb-2">
            Three properties made attention dominate:
          </p>
          <ul className="list-disc ml-5 m-0 space-y-1 text-sm">
            <li><strong>No recurrence</strong> — process the whole sequence in parallel on a GPU, instead of one token at a time.</li>
            <li><strong>No long-distance decay</strong> — every pair of tokens is one matmul apart, no matter how far.</li>
            <li><strong>Learned routing</strong> — the network figures out which tokens should influence which, per example, from data.</li>
          </ul>
        </Callout>

        <Quiz
          question="Classic RNN processes a 100-token sentence. It struggles to use information from token 1 when generating the output at token 100. Why?"
          options={[
            { label: "Token 1 is too long ago — RNNs have a fixed memory size.", explanation: "RNNs don't have a fixed memory — they have a single hidden state that keeps updating. The issue is WHAT happens to that state over many updates." },
            { label: "Information from token 1 has been rewritten 99 times by subsequent updates, so little of it survives intact at step 100.", correct: true, explanation: "Exactly. Every step blends new input into the hidden state, overwriting previous content. Gradients also vanish across that many steps. Long-range dependencies are therefore hard to learn." },
            { label: "RNNs can't handle sequences longer than 50 tokens.", explanation: "They can handle arbitrary length, technically — they just do it poorly at long range. There's no hard limit." },
            { label: "RNNs need to see the future to predict the past.", explanation: "That's nonsensical. RNNs are causal — they only see past tokens. The issue is hidden-state blending, not causality." },
          ]}
          hint="Think about what happens to the hidden state at each step."
        />

        <Quiz
          question="What's the single most important property of attention that RNNs lack?"
          options={[
            { label: "Attention uses softmax; RNNs don't.", explanation: "Softmax is a detail. The big win is something structural." },
            { label: "Every pair of tokens is connected by a single operation, regardless of distance.", correct: true, explanation: "Exactly. In an RNN, connecting tokens 1 and 100 requires 99 sequential steps. In attention, it's ONE matrix multiplication. Distance in the sequence doesn't matter — no information decays." },
            { label: "Attention has more parameters.", explanation: "Parameter count varies by implementation — not the fundamental advantage." },
            { label: "Attention is differentiable.", explanation: "RNNs are also differentiable — that's how they train with backprop. Not the differentiator." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Attention exists because sequential bottlenecks don't scale — direct look-ups do."
          points={[
            { takeaway: "RNNs process sequences one step at a time, through a single hidden state.", detail: <>The hidden state has to carry everything seen so far, which gets progressively worse as the sequence grows longer.</> },
            { takeaway: "Long-range dependencies fail: token 1 barely reaches token 100.", detail: <>Because the hidden state is repeatedly overwritten, and gradients vanish across many steps.</> },
            { takeaway: "Attention lets every output position look at every input position directly.", detail: <>No compression into a bottleneck vector; no decay over distance.</> },
            { takeaway: "Three big wins: parallel (no recurrence), no decay, and learned routing.", detail: <>Parallel is why transformers train so fast on GPUs. No decay is why they handle long context. Learned routing is why they generalize.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 2: QUERIES, KEYS, VALUES                                      */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="qkv" title="Queries, keys, values" xp={25} celebration="The QKV framework clicks. Everything from now on is mechanics.">
      <section>
        <h2>Part 2: Queries, keys, values — the filing-cabinet metaphor</h2>

        <h3>Forget the biology; use the filing cabinet</h3>

        <p>
          Every explanation of attention mentions &quot;queries, keys, and values&quot; and immediately loses people. Here&apos;s the metaphor that makes it stick: <strong>a filing cabinet</strong>.
        </p>

        <p>Imagine a drawer full of folders. Each folder has:</p>

        <ul>
          <li>A <strong>label on the tab</strong> (the <em>key</em>) — what the folder is <em>about</em>.</li>
          <li>The <strong>contents inside</strong> (the <em>value</em>) — the actual information.</li>
        </ul>

        <p>Now you walk up with a request in mind — the <strong>query</strong>. Maybe your query is &quot;2023 tax documents.&quot; You compare your query to each folder&apos;s tab:</p>

        <ul>
          <li>Tab says &quot;2023 taxes&quot; — strong match.</li>
          <li>Tab says &quot;2022 taxes&quot; — weak match.</li>
          <li>Tab says &quot;cat photos&quot; — no match.</li>
        </ul>

        <p>
          Then you pull out the contents of each folder, but <em>weighted</em> by how well its tab matched your query. Mostly 2023, a pinch of 2022, nothing from cats.
          The output is a mixture — dominated by the best match, but not purely one-hot.
        </p>

        <Callout variant="insight" title="That's the whole of attention">
          <p className="m-0">
            Query · Key → match score (how well did this folder&apos;s tab answer my question?). <br />
            Softmax(scores) → weights (normalize the matches into a probability distribution). <br />
            Σ (weight · Value) → output (weighted blend of the folder contents).
          </p>
        </Callout>

        <h3>In a transformer, every token plays all three roles</h3>

        <p>
          Here&apos;s where it gets interesting: in self-attention, <em>every token is at once a query, a key, and a value</em>. The token &quot;it&quot; produces a query (&quot;what am I referring to?&quot;),
          and every other token — &quot;trophy,&quot; &quot;suitcase,&quot; &quot;big&quot; — produces a key (&quot;here&apos;s what I am&quot;) and a value (&quot;here&apos;s my content&quot;).
          The query scans the keys, picks the best matches, and pulls out a blend of values.
        </p>

        <p>We get queries, keys, and values by multiplying the token&apos;s embedding by three different learned matrices:</p>

        <CodeBlock lang="plain">
{`For each token embedding x:
   q = x · W_Q      (query)
   k = x · W_K      (key)
   v = x · W_V      (value)

W_Q, W_K, W_V are three separate weight matrices. The network LEARNS what
each token's 'question', 'label', and 'content' should look like.`}
        </CodeBlock>

        <p>
          So for a sequence of 5 tokens, you end up with 5 queries, 5 keys, and 5 values — all vectors.
        </p>

        <h3>A concrete mini-example — shapes only</h3>

        <p>
          Say the embedding dimension is <code>d_model = 4</code> and we choose <code>d_k = 3</code> for our query/key dimension.
          A sequence of 5 tokens gives input <code>X</code> of shape <code>(5 × 4)</code>. Then:
        </p>

        <CodeBlock lang="plain">
{`X      shape = (5 × 4)      5 tokens, each a 4-dim embedding

W_Q    shape = (4 × 3)
W_K    shape = (4 × 3)
W_V    shape = (4 × 3)

Q = X · W_Q    shape = (5 × 3)
K = X · W_K    shape = (5 × 3)
V = X · W_V    shape = (5 × 3)`}
        </CodeBlock>

        <Callout variant="info" title="d_model vs d_k">
          <p className="m-0">
            <code>d_model</code> is the embedding size — the dimension of each token&apos;s representation everywhere else in the network.
            <code>d_k</code> is the dimension inside attention. They don&apos;t have to be equal. In most real transformers <code>d_k = d_model / num_heads</code>, but you can pick freely when building one from scratch.
          </p>
        </Callout>

        <Quiz
          question="In attention, which matrix answers the question 'what does this token represent for OTHER tokens to look up?'"
          options={[
            { label: "The query matrix (W_Q)", explanation: "The query is what a token is LOOKING FOR — its outgoing question, not the 'label it presents to others.' Close, but not it." },
            { label: "The key matrix (W_K)", correct: true, explanation: "Right. The key is the 'tab on the folder' — what this token ADVERTISES about itself to other tokens' queries. Other tokens' queries match against these keys." },
            { label: "The value matrix (W_V)", explanation: "Values are what gets PULLED OUT once a match happens — the contents of the folder. Keys are what decides whether you pull them out." },
            { label: "The output matrix (W_O)", explanation: "W_O is a projection applied AFTER attention, not part of the Q/K/V setup." },
          ]}
          hint="Query = asks. Key = advertises. Value = delivers."
        />

        <Quiz
          question="In SELF-attention (as opposed to cross-attention), what's true?"
          options={[
            { label: "Only Q comes from the same sequence; K and V come from a different source.", explanation: "That's CROSS-attention (like in encoder-decoder). In self-attention, all three come from the same sequence." },
            { label: "Q, K, and V all come from the same sequence — each token produces its own Q, K, and V.", correct: true, explanation: "Exactly. In self-attention every token is simultaneously a query (asking questions about the others), a key (advertising itself), and a value (providing content). This is what lets a single sentence attend to itself." },
            { label: "There are no keys in self-attention.", explanation: "Keys are central — they're how the queries find matches. You can't do attention without them." },
            { label: "Q, K, V are the same matrix.", explanation: "They're derived from the same input X, but via three DIFFERENT learned projection matrices W_Q, W_K, W_V — so the Q, K, V vectors are distinct." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Every token plays three roles — asker (Q), advertiser (K), and content-bearer (V) — via three learned projections."
          points={[
            { takeaway: "Query / Key / Value = 'what I’m looking for' / 'what I am' / 'what I’ll give you.'", detail: <>The filing-cabinet metaphor: query walks in with a question, keys advertise tabs, values are the folder contents pulled out in proportion to match.</> },
            { takeaway: "In self-attention, Q, K, V are all derived from the same input sequence.", detail: <>Q = X · W_Q, K = X · W_K, V = X · W_V. Three different learned matrices, same input. Every token ends up with its own q, k, v vectors.</> },
            { takeaway: "d_k is the internal attention dimension; it can differ from d_model.", detail: <>Convention in multi-head attention is d_k = d_model / num_heads. Building from scratch, you pick it.</> },
            { takeaway: "Attention is 'learned routing' — which tokens influence which, decided per example.", detail: <>No hard-coded connections. The Q·Kᵀ matrix is different for every input, because Q and K depend on the input.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 3: SCALED DOT-PRODUCT ATTENTION                               */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="scaled-dot-product" title="Scaled dot-product attention" xp={35} celebration="You just computed the single most important operation in modern AI, by hand.">
      <section>
        <h2>Part 3: Scaled dot-product attention, end to end</h2>

        <h3>The one equation you will memorize</h3>

        <p>
          Here it is — the formula from &quot;Attention Is All You Need&quot;, and the center of every LLM:
        </p>

        <div className="my-6 not-prose text-center">
          <div className="inline-block rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-base px-6 py-5 shadow">
            Attention(Q, K, V) = softmax( Q · Kᵀ / √d_k ) · V
          </div>
        </div>

        <p>
          Four operations, all matrix ops:
        </p>

        <ol>
          <li><code>Q · Kᵀ</code> — for every pair of (query, key), compute a dot-product similarity score.</li>
          <li><code>/ √d_k</code> — divide by the square root of the key dimension (we&apos;ll justify this).</li>
          <li><code>softmax(...)</code> — turn each row of scores into a probability distribution over keys.</li>
          <li><code>... · V</code> — take the weighted sum of values using those probabilities.</li>
        </ol>

        <h3>Why dot product for similarity?</h3>

        <p>
          Dot product is the cheapest operator that captures &quot;pointing in the same direction.&quot; For two unit vectors, <code>q · k = cos(angle)</code> — maxed out at 1 when identical, 0 when perpendicular, −1 when opposite.
          For non-unit vectors you also pick up magnitudes, but the angular signal is still there. And crucially: a matrix multiply computes all pairs at once.
        </p>

        <h3>Why divide by √d_k?</h3>

        <Callout variant="info" title="The scaling is a fix for high-dimensional softmax">
          <p className="mb-2">
            When <code>d_k</code> is large, dot products of random vectors get large too — variance scales with <code>d_k</code>. Feed big numbers into softmax and it becomes almost one-hot:
            one weight near 1, the rest near 0. That kills gradient flow everywhere except the &quot;winning&quot; key.
          </p>
          <p className="m-0">
            Dividing by <code>√d_k</code> keeps the pre-softmax scores at roughly unit variance regardless of dimension. Softmax stays soft, gradients flow, training works.
            This is one of those tiny paper details that made the whole thing trainable at scale.
          </p>
        </Callout>

        <h3>Why softmax?</h3>

        <p>
          Two reasons: it turns arbitrary real-valued scores into non-negative weights that sum to 1 (so the output is a proper weighted average), and it&apos;s differentiable (so backprop flows through).
          The softmax in attention plays the same role as the one in Module 4&apos;s multi-class output — it&apos;s just a way of saying &quot;normalize these scores into a distribution.&quot;
        </p>

        <h3>Worked example: attention on 5 tokens, by hand</h3>

        <p>
          We&apos;re going to compute attention for a tiny toy sequence. Five tokens — but don&apos;t worry about what the &quot;words&quot; are; we&apos;re working with raw vectors. <code>d_k = 2</code> for sanity.
        </p>

        <WorkedExample
          title="Scaled dot-product attention — 5 tokens, 2-dim keys"
          subtitle="We'll follow one row all the way through. The same thing happens for each of the 5 rows in parallel."
          steps={[
            {
              title: "The Q, K, V matrices",
              body: (
                <>
                  <p className="m-0 mb-2">Assume these are already computed from X. Each row is one token.</p>
                  <CodeBlock lang="plain">
{`Q = [ [ 1.0,  0.0 ],       K = [ [ 1.0,  0.0 ],       V = [ [ 0.1, 0.9 ],
      [ 0.0,  1.0 ],             [ 0.0,  1.0 ],             [ 0.2, 0.8 ],
      [ 1.0,  1.0 ],             [ 1.0,  1.0 ],             [ 0.3, 0.7 ],
      [ 0.5,  0.5 ],             [ 0.5,  0.5 ],             [ 0.4, 0.6 ],
      [ 1.0, -1.0 ] ]            [ 1.0, -1.0 ] ]            [ 0.5, 0.5 ] ]

shape: (5 × 2)          shape: (5 × 2)            shape: (5 × 2)`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">For simplicity Q and K are the same here; in practice they&apos;re different matrices.</p>
                </>
              ),
            },
            {
              title: "Step 1: Q · Kᵀ — pairwise scores",
              body: (
                <>
                  <p className="m-0 mb-2">
                    <code>Kᵀ</code> is K transposed — shape <code>(2 × 5)</code>. The product <code>Q · Kᵀ</code> has shape <code>(5 × 5)</code> — one entry per (query, key) pair.
                    Entry <code>(i, j)</code> is the dot product of query <code>i</code> with key <code>j</code>.
                  </p>
                  <p className="m-0 mb-2">Let&apos;s compute <strong>row 0</strong> — query [1.0, 0.0] against every key:</p>
                  <CodeBlock lang="plain">
{`[1.0, 0.0] · [1.0,  0.0]  = 1.0·1.0 + 0.0·0.0  =  1.0
[1.0, 0.0] · [0.0,  1.0]  = 1.0·0.0 + 0.0·1.0  =  0.0
[1.0, 0.0] · [1.0,  1.0]  = 1.0·1.0 + 0.0·1.0  =  1.0
[1.0, 0.0] · [0.5,  0.5]  = 1.0·0.5 + 0.0·0.5  =  0.5
[1.0, 0.0] · [1.0, -1.0]  = 1.0·1.0 + 0.0·(-1) =  1.0

row 0 of (Q · Kᵀ) = [ 1.0, 0.0, 1.0, 0.5, 1.0 ]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">High score (1.0) for keys pointing in the +x direction. Zero for the +y one. Makes sense — query 0 is pure +x.</p>
                </>
              ),
            },
            {
              title: "Step 2: scale by √d_k",
              body: (
                <>
                  <p className="m-0 mb-2">With <code>d_k = 2</code>, <code>√d_k ≈ 1.414</code>. Divide the row:</p>
                  <CodeBlock lang="plain">
{`[ 1.0, 0.0, 1.0, 0.5, 1.0 ] / 1.414
= [ 0.707, 0.0, 0.707, 0.354, 0.707 ]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">The scaling is most important when <code>d_k</code> is big (64, 128, 512 in real models). At <code>d_k = 2</code> it&apos;s small but still conceptually present.</p>
                </>
              ),
            },
            {
              title: "Step 3: softmax the row",
              body: (
                <>
                  <CodeBlock lang="plain">
{`exp each:   [ e^0.707, e^0.0,  e^0.707, e^0.354, e^0.707 ]
           ≈ [ 2.028,   1.000,  2.028,   1.425,   2.028   ]

sum       = 2.028 + 1.000 + 2.028 + 1.425 + 2.028 = 8.509

softmax   ≈ [ 0.238, 0.118, 0.238, 0.167, 0.238 ]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    Check: 0.238 + 0.118 + 0.238 + 0.167 + 0.238 = 0.999 ≈ 1 ✓.
                    Three keys tied for most-attended-to, the +y key gets least attention, the middle one is in between.
                  </p>
                </>
              ),
            },
            {
              title: "Step 4: weighted sum of values",
              body: (
                <>
                  <p className="m-0 mb-2">Multiply each attention weight by the corresponding value row, then sum:</p>
                  <CodeBlock lang="plain">
{`0.238 · [0.1, 0.9]  =  [0.0238, 0.2142]
0.118 · [0.2, 0.8]  =  [0.0236, 0.0944]
0.238 · [0.3, 0.7]  =  [0.0714, 0.1666]
0.167 · [0.4, 0.6]  =  [0.0668, 0.1002]
0.238 · [0.5, 0.5]  =  [0.1190, 0.1190]
                        ─────────────────
                       ≈ [0.305, 0.694]

attention output for token 0 ≈ [0.305, 0.694]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    That&apos;s the new representation for token 0 — a weighted blend of everyone&apos;s values, mostly pulled toward the things it matched on.
                    Repeat for tokens 1–4 and you get the full <code>(5 × 2)</code> output matrix. One call, whole sequence processed.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3>In Java: scaled dot-product attention</h3>

        <p>
          Now the code. About 40 lines. You&apos;ll write a richer version in the project, but this is the skeleton:
        </p>

        <CodeBlock lang="java">
{`/**
 * Scaled dot-product attention over a sequence.
 * Q, K, V are (n × d) matrices where n is the sequence length and d is d_k.
 * Returns the attention output, shape (n × d).
 */
public static double[][] attention(double[][] Q, double[][] K, double[][] V) {
    int n = Q.length;
    int d = Q[0].length;
    double scale = Math.sqrt(d);

    // scores = Q · Kᵀ, shape (n × n)
    double[][] scores = new double[n][n];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            double s = 0.0;
            for (int t = 0; t < d; t++) s += Q[i][t] * K[j][t];
            scores[i][j] = s / scale;
        }
    }

    // softmax each row (numerically stable: subtract the row max first)
    double[][] weights = new double[n][n];
    for (int i = 0; i < n; i++) {
        double max = Double.NEGATIVE_INFINITY;
        for (int j = 0; j < n; j++) if (scores[i][j] > max) max = scores[i][j];
        double sum = 0.0;
        for (int j = 0; j < n; j++) {
            weights[i][j] = Math.exp(scores[i][j] - max);
            sum += weights[i][j];
        }
        for (int j = 0; j < n; j++) weights[i][j] /= sum;
    }

    // output = weights · V, shape (n × d)
    double[][] out = new double[n][d];
    for (int i = 0; i < n; i++) {
        for (int t = 0; t < d; t++) {
            double s = 0.0;
            for (int j = 0; j < n; j++) s += weights[i][j] * V[j][t];
            out[i][t] = s;
        }
    }

    return out;
}`}
        </CodeBlock>

        <h3>Masked (causal) attention: the one-line change for LLMs</h3>

        <p>
          GPT-style language models predict the next token, so position <code>i</code> must not see positions <code>j &gt; i</code> — that would be cheating.
          The fix is to add a <strong>mask</strong>: set the &quot;future&quot; entries of the score matrix to <code>−∞</code> before softmax. They become exactly 0 after softmax.
        </p>

        <CodeBlock lang="java">
{`// causal mask: after computing scores[i][j], before softmax:
if (j > i) scores[i][j] = Double.NEGATIVE_INFINITY;`}
        </CodeBlock>

        <p>
          That one line turns a bidirectional encoder (BERT-style) into a causal decoder (GPT-style). Architecturally, the difference between the two giant families of transformers is whether this line is there.
        </p>

        <Callout variant="warn" title="Attention's dirty secret: quadratic cost">
          <p className="mb-2">
            The <code>Q · Kᵀ</code> matrix has shape <code>(n × n)</code>. For a sequence of 10,000 tokens, that&apos;s 100 million entries. Compute AND memory scale as <strong>O(n²)</strong> in sequence length.
          </p>
          <p className="m-0">
            This is why long-context LLMs are hard, why &quot;128k context&quot; was a big deal, and why papers like FlashAttention and sparse attention exist. The quadratic cost is baked into vanilla attention.
          </p>
        </Callout>

        <Quiz
          question="You remove the '/ √d_k' scaling from the attention formula and train a model with d_k = 64. What's most likely to happen?"
          options={[
            { label: "Nothing — the scaling is cosmetic.", explanation: "Not cosmetic. With d_k = 64, dot products of random vectors have variance ~64, so scores easily reach ±10 or more." },
            { label: "Softmax saturates — one weight near 1, the rest near 0 — and gradients stall.", correct: true, explanation: "Exactly. Huge pre-softmax scores make softmax almost one-hot. Gradients only flow to the 'winning' key, and training collapses. The √d_k scaling is what keeps softmax soft." },
            { label: "Loss explodes to infinity.", explanation: "Usually not — the output is still bounded. You just train into a bad local minimum because gradients don't flow properly." },
            { label: "Outputs become negative, which is invalid.", explanation: "Outputs of attention can be whatever — they're weighted averages of values, which can be any real numbers. Not the issue." },
          ]}
          hint="What does softmax do when its inputs have very large spread?"
        />

        <Quiz
          question="You compute scaled dot-product attention for a sequence of 2000 tokens. What's the dominant cost?"
          options={[
            { label: "The Q · Kᵀ matrix, which has 2000 × 2000 = 4,000,000 entries.", correct: true, explanation: "Right. The score matrix is (n × n) and both compute and memory are O(n²). The softmax and the final multiply with V are O(n² · d), still quadratic in n. This is THE scalability limit of transformers." },
            { label: "The softmax, because exp is expensive.", explanation: "Softmax is O(n²) like the others, not more. Exp is cheap on hardware." },
            { label: "Computing Q, K, V from X, which is O(n · d²).", explanation: "That's linear in n, so it's NOT the dominant cost for long sequences. The quadratic part eventually dominates." },
            { label: "The V · weights multiplication.", explanation: "Also O(n² · d), same order as Q · Kᵀ. Both are quadratic. None individually dominates by an order of magnitude." },
          ]}
        />

        <Quiz
          question="For a causal (GPT-style) language model with a 5-token sequence, how does the attention mask look?"
          options={[
            { label: "No mask — causal models don't need one.", explanation: "Causal is ALL about the mask. Without it, position 0 could attend to positions 1-4, which means 'seeing the future.' That's forbidden when training an LM to predict next tokens." },
            { label: "A lower-triangular matrix: position i can attend to positions 0..i, everything above the diagonal is −∞.", correct: true, explanation: "Exactly. Row i keeps columns 0..i and masks columns i+1..n-1 to −∞ (so softmax zeroes them). Position 0 only attends to itself; position 4 attends to 0..4." },
            { label: "An upper-triangular matrix: position i can attend to positions i..n-1.", explanation: "That would be 'future only' — the opposite of causal. You'd be training the model to predict from the future, which is ill-defined." },
            { label: "A random binary mask.", explanation: "Random masking is used in some training regimes (BERT's MLM), but not for causal language modeling." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Attention(Q,K,V) = softmax(Q·Kᵀ / √d_k) · V. Memorize this."
          points={[
            { takeaway: "Step 1: Q · Kᵀ → pairwise scores (n × n).", detail: <>Dot product = angular similarity. One matmul gives all pairwise comparisons at once.</> },
            { takeaway: "Step 2: / √d_k → keeps scores from growing with dimension.", detail: <>Without scaling, softmax saturates and gradients stall. This is a critical detail from the paper.</> },
            { takeaway: "Step 3: softmax each row → attention weights (sum to 1).", detail: <>Turns raw scores into a proper distribution per query row. Subtract row max for numerical stability.</> },
            { takeaway: "Step 4: multiply by V → weighted blend.", detail: <>Each output is a mixture of all value vectors, weighted by how much its query matched each key.</> },
            { takeaway: "Causal mask = −∞ above the diagonal → turns encoder into LM decoder.", detail: <>Tiny one-line change converts bidirectional attention into autoregressive/GPT-style attention.</> },
            { takeaway: "Cost is O(n²) in sequence length.", detail: <>The quadratic scoring matrix is why long context is expensive. FlashAttention, sparse attention, and similar papers try to dodge this limit.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 4: MULTI-HEAD                                                 */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="multi-head" title="Multi-head attention" xp={20} celebration="You now know why transformers have 'heads' — and why more of them helps.">
      <section>
        <h2>Part 4: Multi-head attention — parallel perspectives</h2>

        <h3>One attention head sees one view of the data</h3>

        <p>
          Attention as we&apos;ve defined it has three learned matrices <code>W_Q, W_K, W_V</code>. They learn <em>one</em> way to compare tokens — for example,
          &quot;match tokens with similar syntactic roles.&quot; But a real sentence has many relevant relationships at once: syntax, coreference, tense, sentiment, topic.
          Asking a single set of Q/K/V projections to capture all of them is asking a lot.
        </p>

        <h3>The fix: run several attentions in parallel, each with its own projections</h3>

        <p>
          In <strong>multi-head attention</strong>, you split the model into <em>h</em> heads, each with its own <code>W_Q, W_K, W_V</code>.
          Each head independently performs its own attention computation. Their outputs get concatenated and projected to form the final result.
        </p>

        <CodeBlock lang="plain">
{`for each head i in 1..h:
    Q_i = X · W_Q^i       shape: (n × d_k)   where d_k = d_model / h
    K_i = X · W_K^i
    V_i = X · W_V^i
    head_i = Attention(Q_i, K_i, V_i)       shape: (n × d_k)

concat(head_1, ..., head_h)                  shape: (n × d_model)
output = concat · W_O                        shape: (n × d_model)

W_O is a learned output-projection matrix.`}
        </CodeBlock>

        <p>
          Total parameter count is about the same as single-head attention with <code>d_k = d_model</code> — we just carved it into <em>h</em> smaller heads.
          The win is that each head can learn a <em>different</em> notion of &quot;matching,&quot; and together they capture richer structure.
        </p>

        <Callout variant="insight" title="What do heads actually learn?">
          <p className="m-0">
            Famous result from interpretability research: in a trained transformer, you can often inspect individual heads and find specialized behavior — one head attends mostly to the previous token,
            another to subject-verb pairs, another to coreference (&quot;it&quot; → its referent). Not every head is interpretable, but many are. It&apos;s like spinning up multiple tiny specialists instead of one generalist.
          </p>
        </Callout>

        <h3>Why the per-head dimension shrinks</h3>

        <p>
          If <code>d_model = 512</code> and we use <code>h = 8</code> heads, then each head uses <code>d_k = 64</code>.
          That way the total parameter budget in the <code>W_Q, W_K, W_V</code> matrices is the same as a single large head with <code>d_k = 512</code>.
          You&apos;re re-partitioning the same budget across parallel perspectives instead of spending it all on one.
        </p>

        <Quiz
          question="A transformer has d_model = 768 and 12 heads. What's d_k per head?"
          options={[
            { label: "768 — each head uses the full dimension.", explanation: "That would blow up the parameter count. Heads split the model dimension." },
            { label: "64 (= 768 / 12).", correct: true, explanation: "Exactly. Per-head dim = d_model / num_heads. 768 / 12 = 64 is the classic BERT-base configuration." },
            { label: "12.", explanation: "12 is the number of heads, not per-head dimension." },
            { label: "It depends on what the model learns.", explanation: "d_k is a fixed architectural choice, not a learned value." },
          ]}
        />

        <Quiz
          question="Why use multi-head attention rather than one big single-head attention with d_k = d_model?"
          options={[
            { label: "It's faster in wall-clock time.", explanation: "Not necessarily — multiple small matmuls aren't inherently faster than one big matmul on a GPU." },
            { label: "Each head can learn a different notion of 'similarity,' capturing multiple types of structure at once.", correct: true, explanation: "Right. One head might learn 'nearby tokens matter', another 'subject-verb', another 'coreference'. Together they give the network multiple attention patterns in a single layer. Single-head is forced to compress all of that into one view." },
            { label: "Multi-head reduces parameters.", explanation: "Roughly the same parameter count — you've partitioned the dimension, not reduced it." },
            { label: "Multi-head is necessary to make softmax stable.", explanation: "Softmax stability comes from the √d_k scaling. Multi-head is about expressive diversity." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Multi-head attention runs h independent attentions in parallel, each with its own projections, then concats and projects."
          points={[
            { takeaway: "d_k per head = d_model / h. Same total budget, split h ways.", detail: <>Each head is a 'thinner' attention; together they match the expressive width of a single big head but with diverse perspectives.</> },
            { takeaway: "Heads learn different 'kinds' of match.", detail: <>Some heads track syntax, others track coreference, topic, tense. Not every head is interpretable, but many are.</> },
            { takeaway: "Outputs are concatenated, then projected by W_O.", detail: <>The concat brings all head outputs back to d_model dimension; W_O lets the network mix and re-weight them before moving on.</> },
            { takeaway: "Adding more heads ≠ always better.", detail: <>Beyond a point, heads become redundant. BERT-base uses 12, GPT-2 small uses 12, GPT-3 uses 96 — tuned per model size.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 5a: POSITIONAL ENCODING                                        */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="positional" title="Positional encoding" xp={15} celebration="You spotted attention's blind spot — and saw the fix every modern LLM uses.">
      <section>
        <h2>Part 5: putting order back in — positional encoding</h2>

        <p>
          Here&apos;s a property of attention you may not have noticed yet: <strong>it doesn&apos;t care about order</strong>.
          Run attention on <code>[the, cat, sat]</code> and on <code>[sat, the, cat]</code> and — assuming the same Q/K/V values — you get the
          <em> same set of output vectors</em>, just permuted. Attention is <strong>permutation-invariant</strong>: shuffle the inputs, you shuffle the outputs identically.
        </p>

        <p>
          But of course order matters. <em>&quot;Dog bites man&quot;</em> and <em>&quot;Man bites dog&quot;</em> are different sentences with different meanings.
          So somewhere we have to inject <strong>where</strong> each token sits in the sequence, before attention runs.
          That&apos;s the job of <strong>positional encoding</strong>.
        </p>

        <h3>The fix: add a per-position vector</h3>

        <p>
          The original transformer paper used the simplest possible thing: pre-compute a fixed vector <code>p_i</code> for each position <code>i</code>, and add it to that token&apos;s embedding before the first attention layer:
        </p>

        <CodeBlock lang="plain">
{`x_i = embedding(token_i) + p_i

where p_i is a fixed (non-learned) vector that depends only on the integer i.`}
        </CodeBlock>

        <p>
          That&apos;s it. The model now sees a vector that encodes both <em>what</em> the token is and <em>where</em> it sits.
          Attention still does its permutation-invariant math — but the <em>inputs</em> are no longer interchangeable, because position got baked in.
        </p>

        <h3>Sinusoidal positions — what the original paper used</h3>

        <p>
          The original choice was a clever sinusoid:
        </p>

        <CodeBlock lang="plain">
{`p_i[2k]     = sin(i / 10000^(2k / d_model))
p_i[2k + 1] = cos(i / 10000^(2k / d_model))`}
        </CodeBlock>

        <p>
          Each dimension oscillates at a different frequency. Low-index dims wiggle slowly (encoding coarse position); high-index dims wiggle fast (encoding fine position).
          Why <em>this</em> shape? Two nice properties: it generalizes to sequences longer than ever seen at training time, and the dot product <code>p_i · p_j</code> depends only on the offset <code>j − i</code> — so &quot;distance between positions&quot; is something attention can pick up cleanly.
        </p>

        <Callout variant="insight" title="Modern LLMs use RoPE, not sinusoidal addition">
          <p className="m-0">
            Newer models (LLaMA, Claude, GPT-NeoX, most of 2023+) use <strong>Rotary Position Embedding (RoPE)</strong>. Instead of <em>adding</em> a position vector to the embedding, RoPE <em>rotates</em> the Q and K vectors by a position-dependent angle inside each attention head. The intuition stays the same — &quot;tell the model where each token is&quot; — but the mechanism plays nicer with long context. You don&apos;t need the math; you do need to know that &quot;positional encoding&quot; is the umbrella term and RoPE is the modern flavor.
          </p>
        </Callout>

        <Quiz
          question="Why does attention need positional encoding at all?"
          options={[
            { label: "Because softmax doesn't normalize correctly without it.", explanation: "Softmax is unrelated. Softmax just turns scores into a probability distribution; position is a separate concern." },
            { label: "Because attention is permutation-invariant — without position info, 'dog bites man' and 'man bites dog' would produce the same set of output vectors.", correct: true, explanation: "Right. Attention treats its inputs as a set, not a sequence. To recover sequence semantics, you have to inject position somewhere — usually by adding (sinusoidal) or rotating (RoPE) a per-position signal into the token vectors before attention runs." },
            { label: "Because the Q, K, V projections lose dimensionality.", explanation: "The projections are linear maps; they don't lose order information because there was none to begin with — that's the point." },
            { label: "Because residual connections require it.", explanation: "Residuals are unrelated to positional encoding. They solve gradient flow, not order awareness." },
          ]}
        />

        <PartRecap
          title="Positional encoding recap"
          gist="Attention is permutation-invariant; positional encoding injects 'where' into each token before attention sees it."
          points={[
            { takeaway: "Attention treats inputs as a set, not a sequence.", detail: <>Without positional info, the model literally cannot tell &quot;dog bites man&quot; from &quot;man bites dog&quot;.</> },
            { takeaway: "Sinusoidal positions: add a fixed per-position vector to each embedding.", detail: <>Different frequencies per dimension. Generalizes to longer sequences than seen during training.</> },
            { takeaway: "RoPE is the modern default.", detail: <>Rotates Q and K by a position-dependent angle inside each head. Same purpose, different mechanism, plays nicely with long context.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 6: TRANSFORMER BLOCK                                          */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="transformer-block" title="The transformer block" xp={20} celebration="You can draw a transformer block from memory. You understand every component.">
      <section>
        <h2>Part 6: The transformer block — what surrounds attention</h2>

        <p>
          Attention is the headliner, but a transformer &quot;block&quot; has a few other pieces — each solving a specific training problem.
          Once you know them, you&apos;ll never be surprised by a transformer diagram again.
        </p>

        <h3>The block, drawn out</h3>

        <CodeBlock lang="plain">
{`                    input X  (n × d_model)
                         │
            ┌────────────▼────────────┐
            │      LayerNorm 1         │
            └────────────┬────────────┘
                         │
            ┌────────────▼────────────┐
            │  Multi-Head Self-Attention │
            └────────────┬────────────┘
                         │
                         ▼
            X  +  ──►  (residual add)
                         │
            ┌────────────▼────────────┐
            │      LayerNorm 2         │
            └────────────┬────────────┘
                         │
            ┌────────────▼────────────┐
            │   Feed-Forward Network    │
            │   (two linear layers,     │
            │    ReLU/GELU between)     │
            └────────────┬────────────┘
                         │
                         ▼
         previous  +  ──►  (residual add)
                         │
                    output  (n × d_model)`}
        </CodeBlock>

        <p>Let&apos;s walk through each piece.</p>

        <h3>Residual connections</h3>

        <Callout variant="info" title="The 'plus' is not an afterthought">
          <p className="mb-2">
            Each sub-layer&apos;s output is <em>added</em> back to its input: <code>output = x + SubLayer(x)</code>.
            This is called a <strong>residual connection</strong>, and it&apos;s the single reason you can stack 96 transformer layers without gradient pathologies.
          </p>
          <p className="m-0">
            Without residuals, gradients from layer 96 back to layer 1 would vanish the same way they did in deep MLPs. With residuals, the gradient has a direct path backward through the add,
            bypassing each sub-layer. Deep networks become trainable.
          </p>
        </Callout>

        <h3>Layer Normalization</h3>

        <p>
          After each add, the activations are normalized. <strong>Layer norm</strong> rescales each token&apos;s vector so it has mean 0 and standard deviation 1 (per token, across its features):
        </p>

        <CodeBlock lang="plain">
{`for each token's vector x (length d_model):
    μ = mean(x)
    σ = std(x)
    x_hat = (x − μ) / (σ + ε)
    output = γ · x_hat + β        (γ, β are learned per-dim scales/shifts)`}
        </CodeBlock>

        <p>
          Why do this? Without it, activations drift over training — one layer outputs values around 0.01, the next around 1000. Big shifts wreck the next layer&apos;s inputs and destabilize training.
          LayerNorm keeps the scale predictable. <strong>Pre-norm</strong> (normalize before sub-layer) is the modern default; the original paper used post-norm but training was trickier.
        </p>

        <h3>The feed-forward network (FFN)</h3>

        <p>
          After attention, each token&apos;s vector is passed <em>independently</em> through a small MLP (same one for every position):
        </p>

        <CodeBlock lang="plain">
{`FFN(x) = W₂ · σ(W₁ · x + b₁) + b₂

typical sizes: W₁ is (4·d_model × d_model), W₂ is (d_model × 4·d_model)
activation σ = ReLU (original) or GELU (modern).`}
        </CodeBlock>

        <p>
          The FFN widens each vector to 4× the model dimension, applies non-linearity, then projects back. It&apos;s where most of the transformer&apos;s parameters actually live — often 2/3 of the total.
          Interpretability research suggests the FFN is where &quot;facts&quot; get stored: attention routes, FFN remembers.
        </p>

        <h3>What&apos;s a full transformer?</h3>

        <p>
          A full transformer is just <em>N</em> of these blocks stacked, with token embeddings and positional encodings at the bottom and a final linear layer (&quot;unembedding&quot;) at the top producing logits over the vocabulary.
          GPT-2-small has N = 12 blocks. GPT-3 has N = 96. The recipe is the same at every size.
        </p>

        <Callout variant="insight" title="The whole transformer recipe, in 5 bullets">
          <ul className="list-disc ml-5 m-0 space-y-1 text-sm">
            <li><strong>Embed</strong> tokens into vectors, add positional encoding.</li>
            <li><strong>Block ×N:</strong> LayerNorm → Multi-Head Attention → Residual → LayerNorm → FFN → Residual.</li>
            <li><strong>Final LayerNorm</strong> after the last block.</li>
            <li><strong>Unembed</strong> (a linear layer of shape d_model → vocab_size) produces logits.</li>
            <li><strong>Softmax</strong> over logits gives next-token probabilities.</li>
          </ul>
          <p className="m-0 mt-2 text-xs italic">
            That&apos;s it. That&apos;s a GPT. Everything else (rotary position encoding, MoE, grouped-query attention) is a variation on this skeleton.
          </p>
        </Callout>

        <Quiz
          question="Why are residual connections critical for deep transformers?"
          options={[
            { label: "They reduce parameter count.", explanation: "Residuals don't change parameter count — they're just adds." },
            { label: "They give gradients a direct path backward through each block, preventing vanishing gradients in very deep networks.", correct: true, explanation: "Exactly. Without residuals, gradient magnitudes shrink as they pass through each sub-layer. With residuals, the gradient also flows directly through the skip connection, so the effective depth seen by gradient doesn't grow unboundedly. This is WHY 96-layer transformers train." },
            { label: "They make attention causal.", explanation: "Causality comes from masking, not residuals." },
            { label: "They're required for softmax to work.", explanation: "Softmax is unrelated to residuals." },
          ]}
        />

        <Quiz
          question="Where are most of a transformer's parameters?"
          options={[
            { label: "In the attention Q/K/V matrices.", explanation: "Attention Q/K/V use 3 · d_model² parameters per layer. That's substantial, but dwarfed by the FFN." },
            { label: "In the feed-forward network (FFN), which widens to 4·d_model.", correct: true, explanation: "Right. FFN has two matrices: (4·d_model × d_model) and (d_model × 4·d_model) — about 8·d_model² per layer, ~2/3 of total params. Attention is the more expensive op per token, but FFN holds the weight count." },
            { label: "In the token embeddings.", explanation: "Embeddings are big (vocab_size × d_model) but not per-layer — they're paid once. In a deep model, per-layer weights dominate." },
            { label: "In the positional encodings.", explanation: "Positional encodings are tiny — typically a fixed sinusoid table or a small learned lookup." },
          ]}
        />

        <PartRecap
          title="Part 6 recap"
          gist="A transformer block = LayerNorm + Attention + Residual + LayerNorm + FFN + Residual. Stack N of them."
          points={[
            { takeaway: "Residual connections (x + SubLayer(x)) make deep stacks trainable.", detail: <>They give gradients a direct highway backward, avoiding the vanishing-gradient problem that haunted deep MLPs.</> },
            { takeaway: "LayerNorm keeps per-token activations at a stable scale.", detail: <>Without it, training is unstable; with it, you can stack many layers. Pre-norm (norm before sublayer) is the modern default.</> },
            { takeaway: "The FFN is a per-token 2-layer MLP — widens 4×, non-linear, projects back.", detail: <>Holds most of a transformer&apos;s parameters. Good evidence it&apos;s where &quot;facts&quot; are stored.</> },
            { takeaway: "The whole transformer: embed → N blocks → final LayerNorm → unembed → softmax.", detail: <>That&apos;s GPT. Everything clever in modern LLMs is a tweak to this skeleton.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PROJECT                                                            */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="java-project" title="Project: scaled dot-product attention in Java" xp={60} manual manualLabel="I built it — mark done" celebration="You hand-rolled the central operation of modern AI. In Java. With no library.">
      <section>
        <h2>Project: scaled dot-product attention in Java</h2>

        <p>
          Time to earn the paper&apos;s title: &quot;Attention Is All You Need.&quot; You&apos;re going to implement scaled dot-product attention from scratch, verify it on a toy sequence,
          and extend it with a causal mask so it behaves like the core of an LLM.
        </p>

        <h3>The spec</h3>

        <div className="not-prose rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5 my-4 text-sm">
          <div className="font-bold mb-3">Build a self-contained attention module that passes three tests.</div>
          <ol className="list-decimal ml-5 space-y-2">
            <li>
              <strong>Implement</strong> <code>attention(Q, K, V)</code> returning a <code>(n × d)</code> matrix — the formula from Part 3.
              Use the numerically-stable softmax (subtract the row max first).
            </li>
            <li>
              <strong>Reproduce the worked example.</strong> Input the Q, K, V from Part 3&apos;s 5-token example and confirm row 0 of your output is approximately <code>[0.305, 0.694]</code>.
            </li>
            <li>
              <strong>Add a causal-mask option.</strong> <code>attention(Q, K, V, boolean causal)</code>. When <code>causal == true</code>, mask the upper triangle of the score matrix to <code>−∞</code> before softmax.
            </li>
            <li>
              <strong>Sanity-check the causal behavior:</strong> with a causal mask on a 4-token sequence, verify that row 0&apos;s attention weights are <code>[1, 0, 0, 0]</code> (it can only attend to itself).
            </li>
            <li>
              <strong>Stretch goal:</strong> implement multi-head attention. Take <code>d_model</code> and <code>numHeads</code> as arguments, split into heads, run attention on each independently, concatenate, and project through <code>W_O</code>.
            </li>
          </ol>
        </div>

        <h3>Suggested file layout</h3>

        <CodeBlock lang="plain">
{`src/main/java/aiforengineers/attention/
  ├── MatrixOps.java       // matmul, transpose, softmax — all the helpers
  ├── Attention.java       // scaled dot-product + causal mask
  ├── MultiHead.java       // (stretch) split into heads, concat, project
  └── Main.java            // runs the two sanity checks + prints outputs`}
        </CodeBlock>

        <h3>Gotchas you&apos;ll hit</h3>

        <ul>
          <li>
            <strong>Shape confusion.</strong> Is your Q row-major or column-major? Pick one (row-major, each row = one token) and stick with it. Write the shape in a comment next to every matrix.
          </li>
          <li>
            <strong>Forgetting the scale.</strong> <code>/ √d_k</code> is easy to skip when the sequence is short. With <code>d_k = 2</code> the difference is tiny; with <code>d_k = 64</code> it&apos;s enormous.
          </li>
          <li>
            <strong>Softmax overflow.</strong> Always subtract the row max before exp. <code>exp(1000)</code> will NaN your whole output.
          </li>
          <li>
            <strong>Masking bug.</strong> If you set masked entries to <code>0</code> instead of <code>−∞</code>, <code>exp(0) = 1</code>, and your mask leaks probability to future tokens. Use <code>Double.NEGATIVE_INFINITY</code>.
          </li>
          <li>
            <strong>Test against the worked example.</strong> If your row 0 output doesn&apos;t match <code>[0.305, 0.694]</code> within ~0.01, something is wrong. Don&apos;t plow forward.
          </li>
        </ul>

        <Callout variant="insight" title="Milestones">
          <ol className="list-decimal ml-5 m-0 space-y-1 text-sm">
            <li><strong>Matrix ops work.</strong> Unit-test matmul and transpose on tiny cases. If these are wrong, nothing downstream will be right.</li>
            <li><strong>Unmasked attention matches the worked example.</strong> Row 0 ≈ [0.305, 0.694]. This is the single most important correctness check.</li>
            <li><strong>Causal mask works.</strong> Row 0 attention weights are [1, 0, 0, 0]; row 3 weights sum to 1 over positions 0–3.</li>
            <li><strong>Stretch:</strong> multi-head on a tiny toy input runs without crashing, shapes match the spec.</li>
          </ol>
        </Callout>

        <Callout variant="warn" title="Only mark done when row 0 prints [0.305, 0.694]">
          <p className="m-0">
            Everyone who claims to &quot;understand transformers&quot; on LinkedIn has not typed out this computation. You should. When row 0 of your output comes out right,
            you&apos;ll know — viscerally, not just semantically — what attention is. That moment is the entire point of this module.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="transformers" id="final" title="Final quiz — Module 5" xp={30} celebration="You just internalized attention. Most engineers never do. Embeddings next — you'll find Module 6 downright gentle after this.">
      <section>
        <h2>Final quiz — Module 5</h2>

        <Quiz
          question="In the 2017 paper, 'Attention Is All You Need' refers to the fact that:"
          options={[
            { label: "Attention can replace RNNs entirely — you don't need recurrence or convolution for sequence modeling.", correct: true, explanation: "Right. The paper's claim: with multi-head attention + residuals + LayerNorm + FFN, you can drop RNNs and CNNs entirely and still get best-in-class sequence models. This was a seismic shift in NLP architecture." },
            { label: "Attention has more parameters than RNNs.", explanation: "Parameter count varies. The paper's claim was structural, not about capacity." },
            { label: "Attention replaces backprop.", explanation: "Attention is trained by backprop — it doesn't replace it." },
            { label: "You don't need layers at all.", explanation: "Transformers use many layers. The 'you don't need' was about RNN/CNN layers specifically." },
          ]}
        />

        <Quiz
          question="Self-attention has what time complexity in sequence length n?"
          options={[
            { label: "O(n)", explanation: "Too fast. The Q · Kᵀ matrix alone has n² entries." },
            { label: "O(n log n)", explanation: "That's the complexity of FFT-like operations. Plain attention is simpler and worse — quadratic." },
            { label: "O(n²)", correct: true, explanation: "Right. Q · Kᵀ builds an (n × n) score matrix. Both the multiply and the storage are O(n²·d). This quadratic cost is the headline scalability limit and why long-context models are hard." },
            { label: "O(n · d²)", explanation: "That's the per-token cost of projecting to Q/K/V. Total attention (across all pairs) scales as n², which dominates for long sequences." },
          ]}
        />

        <Quiz
          question="You train a causal (GPT-style) language model. At inference, you give it 'The cat sat on the' and want it to predict the next word. What attention mask is applied to position 4 ('the')?"
          options={[
            { label: "It attends to all tokens, past and future.", explanation: "That'd be non-causal. For autoregressive generation, you can only attend to past tokens." },
            { label: "It attends only to positions 0-4 (itself and all previous tokens), with future positions masked.", correct: true, explanation: "Exactly. Causal masking zeros out anything to the right. Position 4 sees positions 0-4. At inference, there ARE no future tokens yet — but the mask is still there for training consistency." },
            { label: "It attends only to position 0 (the first token).", explanation: "No — it attends to all previous, not just the first." },
            { label: "No mask is used at inference.", explanation: "Masking is still applied at inference to match how the model was trained. Without it, outputs would shift." },
          ]}
        />

        <Quiz
          question="You use 8 heads with d_model = 256. Each head gets d_k = 32. Someone proposes using 16 heads with d_k = 16 instead. What's a likely outcome?"
          options={[
            { label: "Exact same behavior — total budget is the same.", explanation: "Total params are the same, but the model can behave differently. More narrower heads lets the network specialize into finer-grained patterns; too-narrow heads can also become redundant or underpowered." },
            { label: "More heads can specialize into finer patterns, but each head has less capacity per view — diminishing returns past some point.", correct: true, explanation: "Right. More heads = more parallel 'views' but each is narrower. Beyond a point heads become redundant. The sweet spot is model-dependent; 8-16 per 768-dim model is typical." },
            { label: "16 heads will always be better than 8.", explanation: "Not always — empirically there's a sweet spot and diminishing returns. BERT-base picked 12 for a reason." },
            { label: "The math breaks — d_k = 16 is too small.", explanation: "d_k = 16 is fine mathematically. Attention works at any d_k, just with different scaling." },
          ]}
        />

        <Quiz
          question="Which of these components is NOT in a standard transformer block?"
          options={[
            { label: "Multi-head self-attention", explanation: "Central to the block." },
            { label: "Residual connections", explanation: "Essential for training deep stacks." },
            { label: "A recurrent (RNN) loop", correct: true, explanation: "Right. The whole POINT of the transformer is replacing recurrence with attention. No RNN inside. That's what 'Attention Is All You Need' is claiming." },
            { label: "A feed-forward network (FFN)", explanation: "Yes, that's the second sub-layer in every block." },
          ]}
        />

        <Quiz
          question="You finished the Java project. Your causal-masked attention on a 4-token sequence gives row 0 = [1, 0, 0, 0]. What does that tell you?"
          options={[
            { label: "Your mask is broken — row 0 should be uniform.", explanation: "Row 0 of causal attention CAN only attend to position 0 — everything else is masked to −∞, and softmax of [something, −∞, −∞, −∞] is [1, 0, 0, 0]. That's correct behavior." },
            { label: "Your implementation is correct — position 0 can only attend to itself under the causal mask, so its weight on position 0 is 1 and everything else is 0.", correct: true, explanation: "Exactly right. That's the expected output and a good sanity test. If you saw any non-zero weight on positions 1, 2, or 3 for row 0, your mask would be leaking." },
            { label: "Nothing — attention weights are arbitrary.", explanation: "Attention weights are very NOT arbitrary — they satisfy the softmax constraint (non-negative, sum to 1) and the mask constraint (masked positions get 0). Your output proves both." },
            { label: "Your softmax must be broken — it can't output exactly 1.", explanation: "softmax([0, −∞, −∞, −∞]) is exactly [1, 0, 0, 0] by math: e^0 = 1 and e^−∞ = 0. Perfectly correct." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* NEXT MODULE */}
      <section className="mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mt-0 mb-2">Onward to geometry</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 6 pulls the camera back: what <em>are</em> those vectors floating through attention? <strong>Embeddings</strong> — numbers that turn into geometry.
          You&apos;ll learn cosine similarity, build a nearest-neighbor search in Java, and get the foundation for RAG in Phase 3.
        </p>
        <Link
          href="/courses/ai/modules/embeddings-intro"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
        >
          Continue to Module 6 →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="transformers" />
    </article>
  );
}
