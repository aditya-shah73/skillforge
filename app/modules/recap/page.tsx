import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import { getModuleBySlug } from "@/lib/modules";

const CHECKPOINTS = [
  { id: "the-request", title: "The request we'll trace" },
  { id: "stage-tokenize", title: "Stage 1: tokenize" },
  { id: "stage-embed", title: "Stage 2: embed" },
  { id: "stage-attend", title: "Stage 3: attention" },
  { id: "stage-decode", title: "Stage 4: decode & sample" },
  { id: "stage-training", title: "Where training fits in" },
  { id: "synthesize", title: "The one-paragraph synthesis" },
  { id: "final", title: "Phase 1 final" },
];

export default function RecapModule() {
  const mod = getModuleBySlug("recap")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/" className="text-indigo-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase 1 · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Putting it all together</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          One real Claude request, traced end to end, touching every concept from Modules 1–7. If a link is still fuzzy, this is where it snaps.
        </p>
        <ModuleProgress moduleSlug="recap" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🧵</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          By the end of this module you should be able to walk a teammate through <em>what actually happens</em> between pressing Enter on a Claude query and the first token streaming back — grounded in every concept you&apos;ve seen so far:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li><strong>Module 1</strong> — tokenization, BPE, context windows</li>
          <li><strong>Module 2–3</strong> — features, loss, gradient descent, training</li>
          <li><strong>Module 4</strong> — neural networks, layers, activations, backprop</li>
          <li><strong>Module 5</strong> — attention, Q/K/V, multi-head, transformer blocks</li>
          <li><strong>Module 6</strong> — embeddings, vector space, cosine similarity</li>
          <li><strong>Module 7</strong> — prompts as context assembly</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          No new concepts here. No new project. Just the map that makes all the existing pieces fit.
        </p>
      </section>

      {/* ================================================================= */}
      {/* SET UP THE REQUEST                                                 */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="the-request" title="The request" xp={15} celebration="We've got a concrete request to trace. Now watch every module show up in order.">
      <section>
        <h2>The request we&apos;re going to trace</h2>
        <p>
          Pretend you&apos;re wiring a Spring Boot endpoint. The user submits a short question. You&apos;re going to send exactly this to Claude:
        </p>
        <CodeBlock lang="plain">{`POST https://api.anthropic.com/v1/messages
{
  "model":       "claude-sonnet-4",
  "max_tokens":  256,
  "system":      "You are a concise Java tutor. Answer in 2 sentences.",
  "messages": [
    { "role": "user", "content": "Why is String immutable in Java?" }
  ]
}`}</CodeBlock>
        <p>That HTTP call triggers a chain of things. We&apos;re going to walk all of them.</p>

        <h3>The bird&apos;s-eye view</h3>
        <div className="not-prose my-6">
          <pre className="text-[11px] leading-tight p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-x-auto">{`Your JSON
   ↓
[1] Prompt assembly        →  system + user glued with role markers
   ↓
[2] Tokenization (BPE)     →  sequence of integer IDs
   ↓
[3] Embedding lookup       →  each ID becomes a 4096-dim vector
   ↓
[4] Positional info added  →  "where in the sequence?" baked in
   ↓
[5] N transformer blocks   →  multi-head attention + FFN + residuals + LN
   ↓
[6] Final projection       →  vector → logits over ~200k vocab
   ↓
[7] Sampler                →  one token chosen (greedy / top-p / temp)
   ↓
[8] Append & repeat        →  that token gets fed back in. stream to you.`}</pre>
        </div>
        <p>Every stage is a concept you&apos;ve already met. Let&apos;s walk through them.</p>
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* STAGE 1: TOKENIZE                                                  */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="stage-tokenize" title="Stage 1: tokenize" xp={15} celebration="Module 1 closes the loop — you now see exactly where tokenization sits in the pipeline.">
      <section>
        <h2>Stage 1: prompt assembly + tokenization (Module 1)</h2>

        <h3>What the API actually builds</h3>
        <p>Before anything ML-ish happens, the Anthropic server concatenates your JSON into one long text with special role markers:</p>
        <CodeBlock lang="plain">{`<|system|>
You are a concise Java tutor. Answer in 2 sentences.
<|user|>
Why is String immutable in Java?
<|assistant|>`}</CodeBlock>
        <p>
          That last <code>&lt;|assistant|&gt;</code> is the cue: the model&apos;s job is to continue from there.
          Module 7&apos;s core insight — <em>a prompt is a document-prefix whose continuation is the answer</em> — lives here concretely.
        </p>

        <h3>BPE turns that into integers</h3>
        <p>
          Claude&apos;s byte-pair encoder (Module 1) scans the string and replaces it with a sequence of token IDs. Roughly:
        </p>
        <CodeBlock lang="plain">{`Input (text):    "Why is String immutable in Java?"
After BPE:       ["Why", " is", " String", " imm", "utable", " in", " Java", "?"]
Token IDs:       [17321, 310, 6990, 3957, 13174, 295, 7943, 33]`}</CodeBlock>
        <p>
          Plus the system prompt tokens, plus role markers, plus the trailing assistant marker. Let&apos;s call it ~45 tokens in total. That&apos;s counted against your context window <em>and</em> your bill.
        </p>

        <Callout variant="info" title="Why the leading spaces">
          <p className="m-0">
            BPE treats a space as part of the following token (&quot;&nbsp;is&quot; vs &quot;is&quot;) so that &quot;is&quot; at the start of a sentence and &quot;&nbsp;is&quot; mid-sentence aren&apos;t the same ID. This is exactly the behavior you saw in the tokenizer playground in Module 1.
          </p>
        </Callout>

        <Quiz
          question="Why does every model bother with integer token IDs in the middle — why not feed raw characters straight into the transformer?"
          options={[
            { label: "Transformers physically can't process characters.", explanation: "Technically a char-level transformer works — it just costs far more compute because attention is O(n²) and char sequences are ~4× longer." },
            { label: "Characters would make sequences ~4× longer, and character-level attention is O(n²) — so compute explodes. BPE is the compromise between flexibility (covers any string) and cost (keeps n manageable).", correct: true, explanation: "Attention is O(n²) in sequence length. Character-level tokens inflate n roughly 4×, which blows up compute 16×. BPE picks sub-word units that keep n roughly 0.25× the character count while still handling unknown words. That tradeoff is the reason your bill is counted in tokens." },
            { label: "The API vendor requires integer IDs for billing purposes.", explanation: "Billing is counted in tokens because tokens are the unit of compute — not the other way around." },
            { label: "Characters can't be embedded.", explanation: "They can — char-level models exist. The reason they're rare is cost, not impossibility." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* STAGE 2: EMBED                                                     */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="stage-embed" title="Stage 2: embed" xp={15} celebration="Module 6 closes — you now see that 'embedding API' and 'the first layer of Claude' are literally the same idea.">
      <section>
        <h2>Stage 2: token IDs become vectors (Module 6)</h2>

        <h3>The embedding table</h3>
        <p>
          Inside Claude lives a gigantic matrix: one row per token in the vocabulary (~200k rows), each row a learned vector (say, 4096 numbers). That&apos;s the <strong>embedding table</strong>.
        </p>
        <div className="not-prose my-4 mx-auto max-w-md p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center font-mono text-sm">
          E shape: [vocab_size, d_model] = [~200_000, 4096]
        </div>
        <p>
          &quot;Embed the input&quot; is just: take each token ID, grab that row of E. Out of 45 integer IDs comes a 45 × 4096 matrix of floats.
        </p>

        <Callout variant="insight" title="'Embeddings' everywhere are the same idea">
          <p className="m-0">
            When you call an OpenAI/Voyage <em>embedding API</em> in Phase 3, you&apos;re getting a single pooled vector summarizing a whole sentence. When Claude embeds your prompt in stage 2, it&apos;s the <em>first layer</em> of a much bigger network that keeps transforming those vectors. Same concept, different position in the pipeline.
          </p>
        </Callout>

        <h3>Position has to be added back in</h3>
        <p>
          One quirk of attention (Module 5): if you shuffle the tokens, the math gives the same output. Attention is <em>permutation-invariant</em>. But word order matters! So models add <strong>positional information</strong> — a per-position vector baked in so the model knows &quot;this token is at index 3&quot;.
        </p>
        <p>
          Modern models (including Claude) use <strong>RoPE</strong> (Rotary Position Embedding), which rotates query and key vectors by a position-dependent angle inside each attention head. You don&apos;t need the math — just the intuition: after this step, every token embedding knows both <em>what</em> it is and <em>where</em> it is.
        </p>

        <Quiz
          question="Claude's embedding table has shape [vocab_size, d_model]. For your 45-token prompt, what comes out of the lookup?"
          options={[
            { label: "A single d_model-dimensional vector summarizing the whole prompt.", explanation: "That's sentence embedding (pooling at the end). Stage 2 is per-token lookup." },
            { label: "A 45 × d_model matrix — one vector per token.", correct: true, explanation: "Embedding is a per-token lookup: each ID grabs a row of E. The transformer then transforms those 45 vectors together. Pooling to one vector only happens at the very end for sentence-level embedding APIs — and Claude's internal stack isn't doing that." },
            { label: "A scalar score.", explanation: "A scalar is what the final sampler produces (per token); embedding is a matrix." },
            { label: "The model's next-token prediction.", explanation: "That's the output of the whole pipeline, not of stage 2." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* STAGE 3: ATTENTION                                                 */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="stage-attend" title="Stage 3: attention" xp={20} celebration="Module 5 now sits in context — you see why it's the hinge of the whole pipeline.">
      <section>
        <h2>Stage 3: transformer blocks do the heavy lifting (Modules 4 &amp; 5)</h2>
        <p>
          Those 45 vectors now run through <em>dozens</em> of transformer blocks in sequence. In Module 5 you built one attention computation from scratch. Claude runs roughly <strong>80</strong> blocks. Each block does two things:
        </p>

        <h3>Sub-layer 1: multi-head self-attention</h3>
        <p>
          For every token position, the block asks: <em>which other positions should I look at, and how much should I mix them in?</em>
        </p>
        <div className="not-prose my-4 mx-auto max-w-md p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center font-mono text-sm">
          Attention(Q, K, V) = softmax(Q · Kᵀ / √d_k) · V
        </div>
        <p>
          Module 5&apos;s full worked example was 5 tokens by hand. Claude does the same math for 45 (your prompt) &times; 128 (heads per block, roughly) &times; 80 (blocks). Same formula, billions of multiplies.
        </p>

        <h3>Causal masking — so the model can&apos;t cheat</h3>
        <p>
          Because the model is going to be asked to <em>predict the next token</em>, training has to set up the game so position <code>i</code> never gets to peek at positions <code>i+1, i+2, ...</code>. That&apos;s the <strong>causal mask</strong> you saw: set attention scores to −∞ for future positions before softmax. You already wrote that one line in the Module 5 project.
        </p>

        <h3>Sub-layer 2: the feed-forward network (Module 4)</h3>
        <p>
          After attention, each position&apos;s vector independently runs through a two-layer MLP — <em>the same kind of network you built in Module 4</em>. This is where non-linearity enters: attention mixes, FFN transforms. Roughly:
        </p>
        <CodeBlock lang="plain">{`FFN(x) = W_out · GELU(W_in · x + b_in) + b_out
// W_in:  [4 · d_model, d_model]    widen by 4×
// W_out: [d_model,     4 · d_model] project back`}</CodeBlock>
        <p>This is literally <em>the MLP from Module 4</em>, applied in parallel at every token position, inside every block.</p>

        <Callout variant="info" title="Wait — GELU? I built ReLU in Module 4">
          <p className="m-0">
            Modern transformers use <strong>GELU</strong> (Gaussian Error Linear Unit) — think of it as a smooth ReLU with no kink at zero. Same dead-zone-for-negatives, dead-simple-for-positives shape; just differentiable everywhere. Every intuition you built around ReLU (sparsity, vanishing gradients in deep stacks, dying-neuron risk) carries over. Module 4&apos;s ReLU MLP <em>is</em> the FFN — the activation just got a smoother cousin in production.
          </p>
        </Callout>

        <h3>Residuals + LayerNorm — to keep training stable</h3>
        <p>
          Each sub-layer&apos;s output is <em>added</em> to its input (residual) and normalized. You saw this in Module 5; its purpose is to keep gradients from vanishing/exploding through 80 blocks — direct consequence of what you learned about gradient flow in Module 4&apos;s backprop.
        </p>

        <div className="not-prose my-6 p-5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20">
          <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-3">Every transformer block, in one diagram</div>
          <pre className="text-xs leading-tight m-0 font-mono overflow-x-auto">{`    x  ──────────────────────────┐
    │                             │
  LayerNorm                       │
    │                             │
  Multi-Head Attention (Mod 5)    │
    │                             │
    ▼                             │
    ⊕ ◀───────── residual ────────┘
    │
    │
    │ ──────────────────────────┐
    │                           │
  LayerNorm                     │
    │                           │
  FFN  (Mod 4's MLP)            │
    │                           │
    ▼                           │
    ⊕ ◀───────── residual ──────┘
    │
    ▼
   next block (repeat ~80×)`}</pre>
        </div>

        <Quiz
          question="Why stack ~80 transformer blocks instead of making one block enormous?"
          options={[
            { label: "It's legally required for trademark reasons.", explanation: "No. Depth is a deliberate architectural choice for representational reasons." },
            { label: "Depth (not width) is what lets the model build progressively richer representations — early blocks track local syntax, later ones track high-level meaning. The same kind of layer-by-layer abstraction you saw in the MLP in Module 4.", correct: true, explanation: "Just like the MLP in Module 4 built features at layer 1 that fed more abstract features at layer 2, transformer depth builds progressively more abstract representations. Width (d_model, head count) and depth (block count) are two different knobs — both matter, but depth is where compositional reasoning comes from." },
            { label: "Memory constraints — a single huge block won't fit on a GPU.", explanation: "Memory is a factor, but the primary reason is representational. Very wide shallow models exist and are strictly worse at compositional reasoning." },
            { label: "Each block handles a different language.", explanation: "Not how it works — all 80 blocks process the same multilingual hidden states." },
          ]}
        />

        <Quiz
          question="Inside every transformer block there's a two-layer MLP with a ReLU-family activation. Why should that feel familiar?"
          options={[
            { label: "It's a new architecture invented for transformers.", explanation: "Nope — it predates transformers by decades." },
            { label: "It's literally the same thing you built in Module 4 — one MLP per token position, widening then projecting back.", correct: true, explanation: "The FFN in every transformer block is the MLP from Module 4, applied per token in parallel. Attention mixes information across positions; the FFN does the per-position transformation. That's why the Module 4 project matters — you built the piece that lives inside every block of every modern LLM." },
            { label: "It's the embedding table.", explanation: "Embedding is a lookup, not an MLP; the FFN does per-position transformation." },
            { label: "It's the softmax at the end.", explanation: "The output softmax is a single layer at the very end, not a per-block per-position MLP." },
          ]}
        />
      </section>
      <PartRecap
        title="Stage 3 recap"
        gist="Every transformer block = multi-head attention (Module 5) + MLP (Module 4) + residuals + LayerNorm, stacked ~80 times."
        points={[
          { takeaway: "Attention mixes across positions; FFN transforms at each position.", detail: <>These are complementary. Attention alone can&apos;t compose concepts; FFN alone can&apos;t route information. You need both, which is why every block has both.</> },
          { takeaway: "The FFN inside each block is literally the Module 4 MLP.", detail: <>Same widening + projection + nonlinearity pattern. Applied per token, in parallel. Every one of Claude&apos;s ~80 blocks contains one.</> },
          { takeaway: "Causal masking keeps the model honest during training.", detail: <>Without the −∞ mask on future positions, the model would cheat by looking ahead — and learn nothing about how to predict.</> },
          { takeaway: "Residuals + LayerNorm are there so gradients survive 80 layers.", detail: <>Straight from Module 4&apos;s backprop intuition: gradient magnitudes compound multiplicatively through depth. Residual connections break that into additive paths.</> },
        ]}
      />
      </Checkpoint>

      {/* ================================================================= */}
      {/* STAGE 4: DECODE + SAMPLE                                           */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="stage-decode" title="Decode & sample" xp={20} celebration="You now understand temperature, top-p, and streaming — three words most engineers use without knowing what they mean.">
      <section>
        <h2>Stage 4: from hidden state to one token (and then the next, and the next)</h2>

        <h3>The unembedding: vector → logits</h3>
        <p>
          After 80 blocks, the model has a big d_model-dim vector at every position. For next-token prediction we only care about the <em>last</em> position (the one after <code>&lt;|assistant|&gt;</code>). That vector gets multiplied by the transpose of the embedding table:
        </p>
        <CodeBlock lang="plain">{`logits = h_last · E^T          // shape [1, vocab_size] ≈ [1, 200_000]`}</CodeBlock>
        <p>
          You&apos;re left with one score per token in the vocabulary — <strong>logits</strong>. These aren&apos;t probabilities yet.
        </p>
        <p className="text-sm opacity-80">
          <em>Etymology aside:</em> &quot;logit&quot; comes from <em>log-odds</em> (the logarithm of an odds ratio) — a real-numbered score on (−∞, +∞). Softmax is what turns log-odds into probabilities on [0, 1]. So &quot;logits&quot; literally means &quot;the things that, when softmaxed, become probabilities.&quot;
        </p>

        <h3>Softmax turns logits into a probability distribution</h3>
        <p>You met softmax in Module 4 (output layer of the digit classifier). Exactly the same formula:</p>
        <CodeBlock lang="plain">{`p[i] = exp(logits[i]) / Σ_j exp(logits[j])`}</CodeBlock>
        <p>
          After softmax you have a probability for every possible next token. For our example, plausible top candidates might be:
        </p>
        <CodeBlock lang="plain">{`" Because"         p = 0.31
" String"          p = 0.17
" The"             p = 0.12
" Strings"         p = 0.08
" Java"            p = 0.05
... tail of 199,995 tokens ...`}</CodeBlock>

        <h3>The sampler picks one — this is where &quot;temperature&quot; lives</h3>
        <p>You have three realistic strategies:</p>
        <ul>
          <li><strong>Greedy (temperature = 0):</strong> always pick the argmax. Deterministic. Can be robotic.</li>
          <li><strong>Temperature sampling:</strong> divide logits by <code>T</code> before softmax. <code>T &lt; 1</code> sharpens (more predictable), <code>T &gt; 1</code> flattens (more creative, more risk of nonsense).</li>
          <li><strong>Top-p / nucleus:</strong> restrict to the smallest set of tokens whose total probability exceeds <code>p</code> (e.g. 0.9), then sample from just those. Cuts off the long tail of nonsense without being overly rigid.</li>
          <li><strong>Beam search:</strong> instead of committing to one token at each step, keep the top-<code>k</code> partial sequences (&quot;beams&quot;) and expand each. At the end, return the highest-scoring full sequence. Common in translation and summarization, where a globally fluent output beats a locally greedy one. Rare in modern chat decoders — it tends to produce bland, repetitive text and doesn&apos;t mix well with sampling.</li>
        </ul>

        <p>The math behind temperature is one line:</p>
        <CodeBlock lang="plain">{`p_T[i] = exp(logits[i] / T) / Σ_j exp(logits[j] / T)

T → 0:   division blows up the gap between top and second logit
         → softmax becomes near one-hot → argmax (greedy decoding)
T = 1:   plain softmax — the model's "natural" distribution
T → ∞:   all logits get squashed toward equality
         → softmax becomes uniform → totally random tokens`}</CodeBlock>
        <p>
          That&apos;s why <code>T = 0.7</code> is a popular middle ground for chat: sharper than the raw distribution (so the model commits) but not deterministic (so it has some range). The same softmax-of-logits formula you saw in Module 4&apos;s digit classifier — just with a knob to scale logits before the softmax.
        </p>
        <p>
          In practice Claude&apos;s API exposes <code>temperature</code> and <code>top_p</code> as parameters. Picking them is a prompt-engineering concern (Module 7) with a statistical foundation (softmax of Module 4).
        </p>

        <h3>The loop (auto-regressive generation)</h3>
        <p>Sampling picks one token, say <code>&quot; Because&quot;</code>. That token gets:</p>
        <ol>
          <li>Appended to the input sequence (now 46 tokens).</li>
          <li>Run through the whole stack again to predict token #47.</li>
          <li>Repeat until either <code>max_tokens</code> is hit or a stop token shows up.</li>
        </ol>
        <p>
          This is why streaming works: each token appears as soon as it&apos;s sampled. And why long outputs cost more — each new token is another forward pass through all 80 blocks.
        </p>

        <Callout variant="warn" title="KV caching — the reason re-running isn't O(n²) per token">
          <p className="m-0">
            Naively, generating token 46 means re-running all 45 previous positions through all 80 blocks again. In practice, the <strong>Key and Value</strong> tensors for previous positions are <em>cached</em>. Only the new token actually flows through. This turns a quadratic blow-up into linear. It&apos;s the engineering secret to making streaming fast.
          </p>
        </Callout>

        <Quiz
          question="What does setting temperature = 0 actually do?"
          options={[
            { label: "Returns the same answer every time, because the sampler falls back to argmax over the probability distribution.", correct: true, explanation: "Temperature 0 is a conventional name for greedy decoding. Since argmax(softmax(logits)) = argmax(logits), the softmax is effectively bypassed — same token wins every time. It's deterministic (given the same inputs) and usually the right choice for structured-output prompts." },
            { label: "Freezes the model's weights.", explanation: "Weights are always frozen at inference time — temperature has nothing to do with weights." },
            { label: "Causes the model to return no output.", explanation: "It samples greedily — you get output, just fully deterministic." },
            { label: "Bypasses the softmax layer.", explanation: "Conceptually yes (since argmax is invariant to the monotone softmax), but technically the sampler just picks argmax of the distribution." },
          ]}
        />

        <Quiz
          question="Why don't long Claude responses get dramatically slower per-token as they get longer?"
          options={[
            { label: "The model predicts multiple tokens per forward pass.", explanation: "Standard autoregressive decoding is one token per forward pass. Speculative decoding is an advanced trick, not the default reason." },
            { label: "KV caching — Key and Value tensors for earlier positions are saved, so each new token reuses them instead of recomputing.", correct: true, explanation: "Without KV caching, generating token N would re-process N-1 previous tokens every time — quadratic. KV caches store the key/value tensors from the first pass, so subsequent tokens only do the new position's work. This is why streaming feels constant-rate even at long outputs." },
            { label: "Claude uses a non-transformer architecture for generation.", explanation: "It's a transformer. The trick is engineering (caching), not architecture." },
            { label: "The network dynamically shrinks for long contexts.", explanation: "No — the same network runs every step. The saving comes from not recomputing older positions." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* WHERE TRAINING FITS IN                                             */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="stage-training" title="Where training fits" xp={15} celebration="The link between 'how it's trained' and 'how it serves your request' is now explicit.">
      <section>
        <h2>Where does Modules 2–3&apos;s training loop fit in?</h2>
        <p>
          Everything we just walked through is <strong>inference</strong>. It happens in milliseconds on Anthropic&apos;s servers and does <em>not</em> change the weights. Those weights came from training — months of the process you learned in Modules 2 and 3, just at a mind-bending scale.
        </p>

        <div className="not-prose my-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Training (months, $$$)</div>
            <ul className="text-xs space-y-1 m-0 pl-4">
              <li>Read trillions of tokens of text</li>
              <li>For each, predict the next token (Module 2: loss = cross-entropy)</li>
              <li>Compute gradient (Module 3 + Module 4&apos;s backprop)</li>
              <li>Update billions of weights (Module 3&apos;s gradient descent, but distributed across thousands of GPUs)</li>
              <li>Repeat for a very long time</li>
              <li>Then: instruction-tune (RLHF) on human feedback</li>
            </ul>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Inference (milliseconds, what you&apos;re calling)</div>
            <ul className="text-xs space-y-1 m-0 pl-4">
              <li>Tokenize input (Module 1)</li>
              <li>Embed + add position (Module 6 + RoPE)</li>
              <li>80 transformer blocks: attention (Module 5) + FFN (Module 4)</li>
              <li>Unembed → logits → softmax (Module 4)</li>
              <li>Sample next token</li>
              <li>Repeat until stop</li>
              <li>Weights never change</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="This is why prompts can't teach the model new facts">
          <p className="m-0">
            Training = weights get updated. Prompting = input tokens get different, weights stay frozen. When you show a few-shot example, the model pattern-matches in-context — it doesn&apos;t learn anything persistent. Close the API call, start a new one, and the model has no memory. This is a real limit, not a quirk. RAG (Phase 3) and fine-tuning (Module 26) are the two different ways to work around it.
          </p>
        </Callout>

        <Quiz
          question="You show Claude 5 examples of how you want it to classify emails. Between request 1 and request 2, you change one example. What happens?"
          options={[
            { label: "The model's weights adjust slightly between requests — the second call will behave measurably better.", explanation: "Inference does not change weights. Ever. That would be training." },
            { label: "Nothing is remembered between requests. Each call is a fresh inference pass on the prompt you send; the model has no memory of the previous call.", correct: true, explanation: "Inference does not mutate weights. The only way examples affect behavior is because they're in the prompt you send right now. The next call starts fresh. This is why 'memory' in chatbots is always implemented as re-sending conversation history — not as the model actually remembering." },
            { label: "The provider caches your prompt, and the next call uses the previous output as extra context.", explanation: "Prompt caching exists but it's a server-side latency optimization; it doesn't add previous outputs to the next prompt." },
            { label: "The examples are permanently added to the model's training set.", explanation: "No — and that would be a massive privacy problem. Your prompts aren't folded into weights." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* SYNTHESIS                                                          */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="recap" id="synthesize" title="The one-paragraph synthesis" xp={20} celebration="You just summarized Phase 1 in one breath. That's the 2-minute explanation checkpoint asked for.">
      <section>
        <h2>The 2-minute explanation, out loud</h2>
        <p>Here&apos;s the Phase 1 capstone skill: explain what happened in your Claude request without skipping steps and without jargon the listener can&apos;t define. Try saying this out loud:</p>

        <div className="not-prose my-6 p-5 rounded-xl border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20">
          <p className="text-sm m-0 leading-relaxed">
            <em>
              &quot;I sent a JSON body with a system prompt and a user question. Anthropic&apos;s server glued those into one string with role markers and <strong>tokenized</strong> it — byte-pair encoding turned the text into integer IDs. Each ID grabbed a row from the <strong>embedding table</strong>, so I now had a matrix of vectors. Position information got baked in via RoPE. Those vectors ran through about 80 <strong>transformer blocks</strong>; inside each block, <strong>multi-head attention</strong> let each position decide which others to attend to — that&apos;s the Q·Kᵀ/√d_k softmax I built by hand — and then a two-layer <strong>MLP</strong> (the same kind of network I wrote in Module 4) transformed each position. Residuals and LayerNorm kept training stable way back when. The final vector got unembedded into <strong>logits</strong>, softmaxed into a <strong>probability distribution</strong> over the 200k-token vocabulary, and the <strong>sampler</strong> picked one — temperature controls how sharp that pick is. That token got appended, and the whole thing re-ran (KV cached, so it&apos;s fast) until the model emitted a stop token. The <strong>weights</strong> were frozen the entire time; they came from months of gradient descent on trillions of tokens — exactly the loop I learned in Modules 2 and 3, just at absurd scale.&quot;
            </em>
          </p>
        </div>

        <p>
          If you can say that — smoothly, without notes, naming each module as you hit its concept — you&apos;re done with Phase 1. Anything still fuzzy? Scroll back up. That&apos;s the one skill this module is checkpointing.
        </p>

        <Quiz
          question="Put the stages in correct order: (A) multi-head attention, (B) softmax → probabilities, (C) tokenize input, (D) embed token IDs."
          options={[
            { label: "C → D → A → B", correct: true, explanation: "Text → tokens (C, Module 1) → vectors (D, Module 6) → attention stack (A, Module 5) → logits + softmax (B, Module 4). This is the pipeline you'll assume for the rest of the course." },
            { label: "D → C → A → B", explanation: "You can't embed before you've tokenized — embedding is a lookup on integer IDs." },
            { label: "C → A → D → B", explanation: "Attention runs on vectors, so embedding has to come first." },
            { label: "A → B → C → D", explanation: "Completely reversed — the input pipeline runs the other way." },
          ]}
        />

        <Quiz
          question="The feed-forward network inside every transformer block was introduced in which Module?"
          options={[
            { label: "Module 1 — Tokenization", explanation: "Module 1 covers how text becomes integer IDs — no MLP there." },
            { label: "Module 4 — Neural networks (the MLP you built)", correct: true, explanation: "Every transformer block's FFN is literally a two-layer MLP — the architecture you implemented from scratch in Module 4's digit classifier. That's why Module 4 was a prerequisite for Module 5." },
            { label: "Module 5 — Transformers", explanation: "Module 5 introduced the attention half of the block; the FFN half reuses Module 4's MLP." },
            { label: "Module 6 — Embeddings", explanation: "Embeddings are the lookup layer, not the FFN." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PHASE 1 FINAL QUIZ — progressive difficulty                        */}
      {/* ================================================================= */}
      <Checkpoint
        moduleSlug="recap"
        id="final"
        title="Phase 1 final quiz"
        xp={80}
        celebration="Phase 1 mastered. 🏆 You've earned the 'Pipeline Whisperer' badge — you can read any LLM stack."
      >
        <section>
          <h2 className="flex items-center gap-2">
            <span>🏆</span> Phase 1 Final — progressive difficulty
          </h2>
          <p>
            Eight questions. They get harder as you go. Each one is auto-graded — pick an answer and you&apos;ll see whether
            you got it, plus an explanation of what every option meant (so you can also see what you would&apos;ve missed
            on the wrong ones). No outside notes. If you fly through all eight, you&apos;ve genuinely internalized Phase 1.
          </p>

          <Callout variant="info" title="How this works">
            <p className="m-0 text-sm">
              The quiz widget reveals the explanation as soon as you click. Don&apos;t click an option you&apos;re not
              committed to — once locked, that&apos;s your answer. Wrong answers reset your combo streak; correct
              answers within 10 seconds grant a speed bonus. Aim for an 8-streak.
            </p>
          </Callout>

          {/* ---------- LEVEL 1 — recall ---------- */}
          <h3 className="mt-8">Level 1 · Recall (Modules 1–2)</h3>

          <Quiz
            kind="Q1 · Easy"
            xp={10}
            question="A model's vocabulary is ~50,000 tokens. Roughly how many bytes does the embedding lookup table cost if each token is a 4096-dim float32 vector?"
            options={[
              { label: "~200 KB", explanation: "Off by ~1000×. 50K × 4096 × 4 bytes is ~800 MB, not KB." },
              { label: "~80 MB", explanation: "Off by 10×. 50K × 4096 × 4 = 819,200,000 bytes ≈ 800 MB." },
              { label: "~800 MB", correct: true, explanation: "Right. 50,000 × 4096 × 4 bytes ≈ 800 MB. The embedding table alone is the size of a small model. This is why 'just store an extra row per new token' is expensive." },
              { label: "~8 GB", explanation: "Off by 10× the other way. You're probably squaring the dim instead of multiplying." },
            ]}
          />

          <Quiz
            kind="Q2 · Easy"
            xp={10}
            question="In supervised learning, what is ŷ?"
            options={[
              { label: "The ground-truth label from the dataset.", explanation: "That's y (no hat). ŷ is the model's guess at y, not y itself." },
              { label: "The model's prediction for a given input.", correct: true, explanation: "Exactly. y-hat is the model's output; the loss measures the gap between ŷ and y." },
              { label: "The gradient of the loss with respect to the weights.", explanation: "That's ∇L or dL/dw. ŷ is a prediction, not a derivative." },
              { label: "A regularization term added to the loss.", explanation: "Regularization is usually written λ·R(w). ŷ has nothing to do with regularization." },
            ]}
          />

          {/* ---------- LEVEL 2 — apply ---------- */}
          <h3 className="mt-10">Level 2 · Application (Modules 3–4)</h3>

          <Quiz
            kind="Q3 · Medium"
            xp={15}
            question="Your training loss keeps going down but validation loss starts rising after epoch 8. Which fix is LEAST appropriate as a first move?"
            options={[
              { label: "Add dropout or weight decay.", explanation: "Reasonable — both directly attack overfitting." },
              { label: "Stop training earlier (early stopping at epoch 8).", explanation: "Reasonable — early stopping is the canonical fix for this exact curve." },
              { label: "Increase the learning rate so it converges faster.", correct: true, explanation: "Wrong move. Higher LR doesn't fix overfitting; it makes the model bounce around or diverge. Overfitting is a capacity/regularization problem, not a step-size problem." },
              { label: "Get more training data or augment what you have.", explanation: "Reasonable — more data is the most reliable cure for overfitting." },
            ]}
          />

          <Quiz
            kind="Q4 · Medium"
            xp={15}
            question="A 3-layer MLP with ReLU has 1024-dim hidden layers. You replace ReLU with sigmoid everywhere and training stalls. Most likely cause:"
            options={[
              { label: "Sigmoid is non-differentiable, so backprop fails.", explanation: "Sigmoid is perfectly differentiable. That's not the issue." },
              { label: "Vanishing gradients — sigmoid's derivative maxes at 0.25, so 3 layers compress the gradient to ≤ 0.015× and weights barely update.", correct: true, explanation: "Right. Each sigmoid layer multiplies the gradient by ≤ 0.25 (and usually much less). Stack a few layers and the gradient that reaches early weights is essentially zero — this is the classic vanishing-gradient story that motivated ReLU." },
              { label: "Sigmoid outputs are unbounded, causing exploding activations.", explanation: "Sigmoid outputs are bounded in (0,1). Exploding activations are the opposite problem and are not the issue here." },
              { label: "Sigmoid requires a different loss function.", explanation: "Loss choice is independent of hidden activation — you'd still use cross-entropy or MSE on the output, not the hidden layer." },
            ]}
          />

          {/* ---------- LEVEL 3 — synthesis ---------- */}
          <h3 className="mt-10">Level 3 · Synthesis (Modules 5–6)</h3>

          <Quiz
            kind="Q5 · Hard"
            xp={20}
            question="In scaled dot-product attention, why divide by √d_k before the softmax?"
            options={[
              { label: "It's a normalization convention with no real effect — could be skipped.", explanation: "It has a very real effect on training stability. Skipping it breaks deep transformers." },
              { label: "It keeps the variance of q·k roughly constant as d_k grows, preventing softmax saturation where one logit dominates and gradients vanish.", correct: true, explanation: "Right. q·k is a sum of d_k products of unit-variance terms, so its variance is ~d_k. Without √d_k scaling, larger d_k makes the largest logit blow up, softmax becomes near one-hot, and gradients on all other positions vanish. Dividing by √d_k restores ~unit variance." },
              { label: "It accounts for the bias term in the linear projection.", explanation: "There's no bias term being corrected here. Q, K, V are typically projected without explicit per-head biases anyway." },
              { label: "It's required for masking to work correctly.", explanation: "Masking adds −∞ to forbidden positions before softmax — totally orthogonal to the √d_k scaling." },
            ]}
          />

          <Quiz
            kind="Q6 · Hard"
            xp={20}
            question="You build a RAG system. Two chunks have cosine similarity 0.94 to the query, but only one is actually relevant. The other is a near-duplicate of the query phrasing on an unrelated topic. What's the principled fix?"
            options={[
              { label: "Lower the similarity threshold so fewer false positives sneak in.", explanation: "Both chunks are at 0.94 — lowering the threshold doesn't separate them. You'd lose true positives at the same rate." },
              { label: "Switch from cosine to Euclidean distance.", explanation: "On normalized embeddings, cosine and Euclidean are monotonically related — you'd get the same ranking." },
              { label: "Use a stronger embedding model OR add a re-ranker (cross-encoder) over the top-k retrieved chunks.", correct: true, explanation: "Right. Bi-encoder cosine retrieval is fast but imprecise — it confuses surface phrasing with semantic relevance. A cross-encoder re-ranker scores (query, chunk) jointly and resolves exactly this case. Better embeddings is the other principled answer." },
              { label: "Hash the chunks and dedupe by hash.", explanation: "These aren't literal duplicates — they're semantically similar in surface phrasing only. Hashing wouldn't catch it." },
            ]}
          />

          {/* ---------- LEVEL 4 — boss ---------- */}
          <h3 className="mt-10">Level 4 · Boss (Modules 7–8, end-to-end)</h3>

          <Quiz
            kind="Q7 · Boss"
            xp={25}
            question="A user reports that a Claude prompt that worked yesterday now hits the context limit. Nothing in the prompt changed. What is the MOST LIKELY explanation, given everything you learned in Phase 1?"
            options={[
              { label: "The model silently switched its tokenizer to one with a smaller vocab.", explanation: "Tokenizers don't silently change between calls within the same model version. Possible across model upgrades but rare; not the most likely cause." },
              { label: "Some tool result, retrieved chunk, or system prompt grew (e.g. larger RAG payload, longer history) — the prompt the USER wrote is the same, but the prompt the MODEL sees is bigger.", correct: true, explanation: "Right. From Module 7+8: 'the prompt' is the entire assembled context — system prompt + tools + retrieved docs + history + user message. When users say 'my prompt is the same,' what changed is almost always one of the other context pieces: a longer chat history, a bigger retrieved chunk, an expanded tool schema. The user message is just the visible tip." },
              { label: "Claude's context window shrank.", explanation: "Context windows don't shrink between calls. Possible across model versions but documented; not silent." },
              { label: "The temperature was raised, which makes prompts longer.", explanation: "Temperature affects sampling, not prompt length. They're unrelated." },
            ]}
          />

          <Quiz
            kind="Q8 · Final boss"
            xp={30}
            question="You're asked: 'why does Claude generate the second token faster than the first?' Pick the explanation that is CORRECT, COMPLETE, and uses Phase 1 vocabulary precisely."
            options={[
              { label: "Because the model is smaller after the first token — Claude switches to a distilled model for follow-on tokens.", explanation: "False. Same model throughout. There's no model swap mid-generation." },
              { label: "Because the network already 'understands' the prompt after the first token, so it doesn't have to re-read it.", explanation: "Directionally true but vague. 'Understands' isn't a mechanism, and it misses the actual cache mechanic." },
              { label: "Because of KV caching: during prefill, attention computes K and V projections for every prompt token (O(n²) work). During decode, those K/V tensors are reused from cache, so each new token only computes Q·K^T against the cache and one new K, V — O(n) work per token instead of O(n²).", correct: true, explanation: "This is the right answer with the right vocabulary: prefill vs decode, K/V projections, the cache, and the complexity drop from O(n²) per step to O(n). If you can articulate this from memory, you've genuinely earned the 'Phase 1 complete' badge." },
              { label: "Because streaming returns a partial response while the rest still computes in the background.", explanation: "Streaming is the *transport* (SSE) — it doesn't change how fast tokens are generated. The speed-up comes from the KV cache, not from the wire protocol." },
            ]}
          />

          {/* ---------- WRAP ---------- */}
          <div className="not-prose mt-10 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎓</span>
              <h3 className="font-bold text-lg m-0">If you got 7 or 8 right…</h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              You can describe the entire Phase 1 stack — tokens, weights, training, neural networks, attention, embeddings, prompt assembly, decode loop — without notes. That&apos;s the bar for moving on.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
              <strong>5–6 right?</strong> Skim the explanations above, then re-read the part-recap callouts in whichever module each missed question came from. <strong>Below 5?</strong> Don&apos;t skip — Phase 2 assumes all of this. Replay the relevant module, then come back and re-take.
            </p>
          </div>
        </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* NEXT PHASE                                                         */}
      {/* ================================================================= */}
      <section className="mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mt-0 mb-2">Phase 1 complete → Phase 2 incoming</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Everything from here on in assumes the pipeline you just traced. Phase 2 opens the Anthropic API: auth, models, parameters, and your first real Claude call from Java. That&apos;s when the token meter starts ticking — but now you actually know what those tokens are.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/modules/api-fundamentals"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition"
          >
            Module 9 — Claude API fundamentals →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
          >
            ← All modules
          </Link>
        </div>
      </section>
    </article>
  );
}
