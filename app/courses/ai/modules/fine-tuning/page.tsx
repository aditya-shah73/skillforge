import Link from "next/link";
import Quiz from "@/components/Quiz";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import WorkedExample from "@/components/WorkedExample";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const SLUG = "fine-tuning";

const CHECKPOINTS = [
  { id: "how-training-works", title: "How training works" },
  { id: "when-to-finetune", title: "When (and when not) to fine-tune" },
  { id: "decision-framework", title: "The decision framework" },
  { id: "economics-rlhf", title: "Economics & RLHF" },
  { id: "decision-doc", title: "Decision document" },
  { id: "final", title: "Module 26 final" },
];

export default function FineTuningModule() {
  return (
    <article className="prose-custom">
      <Link href="/courses/ai" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
        ← All modules
      </Link>

      <div className="mt-6 mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        Phase 6 · Module 26
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">~1.5h · Production &amp; Capstone</div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-3">Fine-tuning &amp; RLHF (when to bother)</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 italic mb-6">
        How model training actually works — and why RAG usually wins.
      </p>

      <BookmarkButton courseId="ai" moduleSlug="fine-tuning" />
      <ModuleProgress moduleSlug={SLUG} checkpoints={CHECKPOINTS} />

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-900">
        <h3 className="text-base font-bold text-pink-900 dark:text-pink-200 mt-0 mb-3">
          What you&apos;ll walk out with
        </h3>
        <ul className="text-sm text-pink-900/90 dark:text-pink-200/90 mb-0 space-y-1">
          <li>A working mental model of <strong>pre-training, SFT, and RLHF</strong> — what each stage does and what it costs.</li>
          <li>The math intuition behind gradient updates on a 70B-parameter model — without doing the math.</li>
          <li>A concrete <strong>decision framework</strong>: prompt vs RAG vs fine-tune, with the questions to ask before you spend a dollar.</li>
          <li>The five honest reasons teams reach for fine-tuning prematurely — and how to spot them in your own thinking.</li>
          <li>A delivered <strong>decision document</strong>{" "}for a real-world scenario: prompt, RAG, or fine-tune?</li>
        </ul>
      </div>

      <Callout variant="info" title="Prerequisites">
        You should be comfortable with everything from <Link href="/courses/ai/modules/ml-basics">Module 2 (supervised learning)</Link>,{" "}
        <Link href="/courses/ai/modules/ml-training">Module 3 (training loops)</Link>, and <Link href="/courses/ai/modules/neural-networks">Module 4 (neural networks)</Link>.
        You should also have shipped a RAG pipeline (<Link href="/courses/ai/modules/rag-spring">Module 17</Link>) and tuned prompts (<Link href="/courses/ai/modules/prompt-engineering">Module 7</Link>) so you have something to compare against.
      </Callout>

      <h2 id="why-this-module">Why this module exists</h2>
      <p>
        Fine-tuning is the most over-reached-for tool in AI engineering. Every team eventually says some version of:
        &quot;the prompt isn&apos;t good enough, let&apos;s fine-tune.&quot; Most of those teams spend weeks, burn a five-figure
        budget, and end up with a model that&apos;s <em>worse</em>{" "}than a well-engineered prompt with retrieval.
      </p>
      <p>
        This module isn&apos;t anti-fine-tuning. It&apos;s pro-honesty. There <em>are</em>{" "}situations where fine-tuning
        is the right answer. They&apos;re rarer than people think, and the way to find out is a checklist — not a vibe.
      </p>

      <Callout variant="insight" title="The thesis">
        For 95% of production use cases in 2026, the right order is: <strong>prompt → RAG → tools → eval-driven prompt iteration</strong>.
        Fine-tuning sits below all of those. If you haven&apos;t exhausted prompt and RAG, fine-tuning won&apos;t save you —
        you&apos;ll just have an expensive copy of your prompt&apos;s problems baked into weights.
      </Callout>

      <h2 id="how-training-works">1. How model training actually works</h2>
      <p>
        We covered the mechanics in <Link href="/courses/ai/modules/ml-training">Module 3</Link> and{" "}
        <Link href="/courses/ai/modules/neural-networks">Module 4</Link>: forward pass, loss, backward pass, gradient update, repeat.
        Fine-tuning a frontier LLM is the <em>same algorithm</em>{" "}you wrote by hand in Java — just at a scale that bends
        your intuition about cost.
      </p>

      <h3 id="three-stages">The three stages of an LLM&apos;s life</h3>
      <p>
        A model like Claude or GPT-4 goes through three distinct training phases. Most people lump them together, which
        is where confusion starts.
      </p>

      <div className="my-6 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-700 p-2 text-left">Stage</th>
              <th className="border border-slate-300 dark:border-slate-700 p-2 text-left">What happens</th>
              <th className="border border-slate-300 dark:border-slate-700 p-2 text-left">Data</th>
              <th className="border border-slate-300 dark:border-slate-700 p-2 text-left">Cost</th>
              <th className="border border-slate-300 dark:border-slate-700 p-2 text-left">Who does it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 dark:border-slate-700 p-2"><strong>Pre-training</strong></td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Predict the next token over the whole internet</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Trillions of tokens, Common Crawl + books + code</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">$10M – $100M+</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Anthropic, OpenAI, Google</td>
            </tr>
            <tr>
              <td className="border border-slate-300 dark:border-slate-700 p-2"><strong>SFT</strong> (supervised fine-tune)</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Show it labeled (prompt, ideal-response) pairs</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">10K – 1M curated examples</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">$10K – $1M</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Frontier labs &amp; large enterprise</td>
            </tr>
            <tr>
              <td className="border border-slate-300 dark:border-slate-700 p-2"><strong>RLHF / RLAIF</strong></td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Reinforcement-learn from preference rankings</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">100K – 10M comparisons</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">$100K – $10M</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">Frontier labs only</td>
            </tr>
            <tr>
              <td className="border border-slate-300 dark:border-slate-700 p-2"><strong>Customer fine-tune</strong></td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">SFT (sometimes LoRA) on top of a finished model</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">100 – 100K examples</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2">$50 – $50K</td>
              <td className="border border-slate-300 dark:border-slate-700 p-2"><strong>You</strong>, via API or open-weights</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        When somebody at your company says &quot;let&apos;s fine-tune,&quot; they almost always mean the last row —
        customer-side SFT, often with LoRA adapters to make it cheap. They are <em>not</em>{" "}talking about pre-training,
        and they are almost never talking about RLHF (which requires a reward model and infrastructure most teams don&apos;t have).
      </p>

      <h3 id="lora">LoRA: how customer fine-tunes got cheap</h3>
      <p>
        Full fine-tuning a 70B-parameter model means computing gradients for 70 billion weights and storing optimizer state
        for each. The memory alone is hundreds of gigabytes. <strong>LoRA</strong> (Low-Rank Adaptation) sidesteps this
        by freezing the base model and learning a small <em>delta</em>{" "}in low-rank decomposed matrices — typically less
        than 1% of the original parameter count.
      </p>

      <CodeBlock lang="plain" caption="LoRA, intuitively">{`Full fine-tune:
  W_new = W_old + ΔW       ← ΔW is the same shape as W_old (huge)

LoRA:
  W_new = W_old + B·A      ← A is (r × d), B is (d × r), r ≪ d
                             B·A is the same shape as W_old, but
                             you only train A and B (tiny)

Real numbers for a 70B model with rank r=16:
  Full FT trainable params:  70,000,000,000
  LoRA trainable params:     ~50,000,000   (0.07%)`}</CodeBlock>

      <p>
        LoRA is why Claude, GPT-4, and Gemini all offer fine-tuning APIs at customer-affordable prices. But cheap doesn&apos;t
        mean <em>good</em>. The constraint that makes LoRA cheap (low rank) also limits what behaviors it can learn —
        you&apos;re nudging the model, not retraining it.
      </p>

      <Callout variant="warn" title="LoRA can&apos;t teach what the base model doesn&apos;t already know">
        LoRA is great at adjusting <em>style</em>, <em>format</em>, and <em>which existing capability to deploy</em>.
        It&apos;s bad at teaching <em>new facts</em>{" "}or <em>genuinely new reasoning</em>. If your problem is &quot;the
        model doesn&apos;t know our product,&quot; LoRA will not fix it. RAG will.
      </Callout>

      <PartRecap
        title="Part 1 takeaways"
        gist="Pre-training builds general capability; SFT and RLHF teach instruction-following; customer LoRA fine-tuning is a small style nudge on top of a finished model."
        points={[
          { takeaway: "Three layers of training", detail: "Pre-training (lab-scale), SFT/RLHF (alignment), customer fine-tune (you)." },
          { takeaway: "LoRA = cheap, narrow", detail: "It rewrites style and format. It does not teach new knowledge." },
          { takeaway: "Most of what people call 'fine-tuning' is LoRA", detail: "Knowing this disambiguates 80% of fine-tuning conversations." },
        ]}
      />

      <Checkpoint moduleSlug={SLUG} id="how-training-works" title="How training works" xp={20}>
        <Quiz
          question="Your manager says: 'Let's fine-tune Claude on our product docs so it stops getting product details wrong.' What's the most accurate critique?"
          options={[
            { label: "Fine-tuning will work but is expensive — RAG is just cheaper.", explanation: "Cost isn't the main issue. It's that customer fine-tuning (LoRA) is bad at teaching new facts." },
            { label: "Fine-tuning teaches style and format, not facts. New facts belong in retrieval. The model will still hallucinate the doc contents — just in a more confident voice.", correct: true, explanation: "Exactly. This is the single most expensive misconception in industry fine-tuning." },
            { label: "Fine-tuning will work fine if you have at least 10,000 docs.", explanation: "More data doesn't change the underlying mechanism. Facts still don't reliably stick via LoRA." },
            { label: "Fine-tuning is identical to RAG, just packaged differently.", explanation: "They're fundamentally different: RAG injects facts at inference, fine-tuning adjusts weights." },
          ]}
        />
        <Quiz
          question="What does LoRA do that makes customer fine-tuning affordable?"
          options={[
            { label: "It compresses the model down to a smaller number of parameters.", explanation: "The base model stays full-size. LoRA only adds small adapters." },
            { label: "It freezes the base model and trains low-rank adapter matrices that have ~0.1% of the original parameter count.", correct: true, explanation: "Right — full FT trains every weight; LoRA trains a tiny delta." },
            { label: "It runs the training on cheaper hardware by quantizing gradients.", explanation: "Quantization is a separate optimization. LoRA's win is parameter count." },
            { label: "It uses RLHF instead of SFT, which converges faster.", explanation: "LoRA is orthogonal to RLHF vs SFT — it's a parameter-efficiency technique." },
          ]}
        />
      </Checkpoint>

      <h2 id="when-to-fine-tune">2. When fine-tuning is actually right</h2>
      <p>
        There are real, defensible cases for fine-tuning. They share a few features: the behavior you need is
        <em> structural</em>{" "}rather than <em>factual</em>, prompt iteration has hit a clear ceiling, and you have
        the data to support real evaluation. Here are the cases where fine-tuning earns its place.
      </p>

      <h3 id="case-style">Case 1: Style and format that&apos;s impossible to prompt</h3>
      <p>
        You have a strict brand voice, a domain-specific tone, or an output format that needs to be exact across
        thousands of inputs. You&apos;ve tried system prompts and few-shot examples and the model still drifts on
        edge cases. <strong>This is the textbook fine-tune case.</strong>{" "}LoRA is genuinely good at this.
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Example: a legal tech company that needs every clause summary in a precise three-sentence structure with
        specific clause-type tags. They have 5,000 hand-written examples. SFT on those examples will produce a model
        that does this reliably without needing a 2,000-token prompt full of examples.
      </p>

      <h3 id="case-latency">Case 2: You&apos;re paying for a 5,000-token system prompt every request</h3>
      <p>
        If you&apos;ve crammed instructions, formatting rules, examples, and tool descriptions into a system prompt
        that costs you on every request, fine-tuning can <em>compress</em>{" "}all of that into the weights. The trained
        model produces the same output with a 200-token prompt instead of 5,000. At high volume this saves real money
        and reduces latency.
      </p>
      <p>
        Caveat: <Link href="/courses/ai/modules/prompt-caching">prompt caching (Module 13)</Link> often gets you the same cost
        savings without the engineering investment. Try caching first.
      </p>

      <h3 id="case-classification">Case 3: Narrow classification at high volume</h3>
      <p>
        You&apos;re classifying support tickets into 200 categories, or routing emails into 50 buckets, or scoring
        sentiment with a custom rubric. The task is bounded, you have labeled data, and you don&apos;t need
        general-purpose reasoning. A fine-tuned smaller model is faster, cheaper, and often more accurate than a
        prompt-engineered larger model.
      </p>

      <h3 id="case-distillation">Case 4: Distillation</h3>
      <p>
        You&apos;ve built something great with the frontier model. It works. It&apos;s just slow and expensive at scale.
        You can use that frontier model to generate (prompt, response) pairs and SFT a smaller open-weights model on
        those pairs. The smaller model approximates the frontier model on your specific task at a fraction of the cost.
        This is a real, valuable technique.
      </p>

      <Callout variant="insight" title="The pattern across all four cases">
        Each one starts with a <strong>working prompt-based prototype</strong>. None of them say &quot;we couldn&apos;t
        get the prompt to work, so we&apos;re fine-tuning.&quot; They say &quot;the prompt works, but it&apos;s expensive
        / slow / inconsistent at scale, so we&apos;re fine-tuning to compress / specialize / distill.&quot;
      </Callout>

      <h2 id="when-not-to">3. When fine-tuning is the wrong answer</h2>
      <p>
        Now the failure modes. These are the requests that <em>sound</em>{" "}like fine-tuning candidates and almost
        always aren&apos;t.
      </p>

      <h3 id="not-facts">&quot;Teach it our internal docs / product / API&quot;</h3>
      <p>
        This is RAG&apos;s job. Fine-tuning a model on your docs makes it sound like it knows them, but it will
        confidently invent variants, forget specifics, and degrade as your docs change. Every time your API spec
        updates you&apos;d need to re-train. Retrieval indexes update in seconds.
      </p>

      <h3 id="not-prompt-failure">&quot;The prompt isn&apos;t working&quot;</h3>
      <p>
        Fine-tuning won&apos;t fix a broken prompt — it&apos;ll just bake the broken behavior into the weights.
        If you can&apos;t describe what you want clearly enough to prompt for it, you can&apos;t describe what you want
        clearly enough to label thousands of training examples for it either.
      </p>

      <h3 id="not-tools">&quot;We need it to use tools better&quot;</h3>
      <p>
        Tool selection is a <em>reasoning</em>{" "}task, not a style task. Frontier models are already excellent at it
        when given clear tool descriptions. If your model is mis-using tools, the problem is usually ambiguous tool
        descriptions, missing examples, or a bug in your <Link href="/courses/ai/modules/agent-spring">agent loop (Module 22)</Link>.
      </p>

      <h3 id="not-knowledge-cutoff">&quot;It doesn&apos;t know about events after its knowledge cutoff&quot;</h3>
      <p>
        That&apos;s what tool use and retrieval are for. Fine-tuning on news from last week is the slowest, most
        expensive, and least up-to-date way to solve a problem that <code>get_current_news()</code> solves in 50ms.
      </p>

      <Callout variant="warn" title="The 'just one more thing' trap">
        Fine-tuning has a brutal feedback loop: you spend two weeks gathering data, two weeks training and evaluating,
        discover the result is mediocre, and then have to decide whether to spend another month trying again or
        admit the project is wrong. Sunk cost makes teams keep spending. Watch for it in your own thinking.
      </Callout>

      <PartRecap
        title="Part 2/3 takeaways"
        gist="Fine-tune for style, latency, narrow classification, or distillation. Do not fine-tune for facts, broken prompts, tool use, or knowledge cutoff."
        points={[
          { takeaway: "Fine-tuning shapes behavior, not knowledge", detail: "Style, format, tone, structure — yes. Facts, news, your API — no." },
          { takeaway: "Distillation is real", detail: "Use a frontier model to teach a smaller model your task." },
          { takeaway: "Prompt failures don't become training successes", detail: "If you can't prompt it, you can't label it either." },
        ]}
      />

      <Checkpoint moduleSlug={SLUG} id="when-to-finetune" title="When (and when not) to fine-tune" xp={20}>
        <Quiz
          question="Which of these is a defensible fine-tuning use case?"
          options={[
            { label: "We want Claude to stop hallucinating about our company's pricing.", explanation: "Pricing is a fact. RAG with a pricing source-of-truth is the right fix." },
            { label: "We need every legal summary to follow a strict 3-paragraph rubric and few-shot prompting still drifts.", correct: true, explanation: "Right — structural style that resists prompting is the textbook SFT case." },
            { label: "We need the model to know about news from this morning.", explanation: "That's a tool-use problem, not a training problem." },
            { label: "We want better reasoning on math problems.", explanation: "Reasoning improvements come from better prompting (chain of thought) or better base models, not from LoRA." },
          ]}
        />
        <Quiz
          question="Your team has been iterating on a system prompt for 4 weeks. Performance has plateaued at 78% on your eval set. What should you try BEFORE fine-tuning?"
          options={[
            { label: "Add more examples to the prompt and train a bigger LoRA.", explanation: "Adding examples is fine, but jumping to LoRA skips the cheaper next steps." },
            { label: "Run an eval-driven prompt iteration: failure-class analysis, targeted prompt edits per class, plus retrieval if facts are involved. Only consider fine-tuning if all of that plateaus.", correct: true, explanation: "This is the right ladder — fine-tuning is the floor, not the next rung." },
            { label: "Switch to a larger model and call it done.", explanation: "Sometimes works, but that's a band-aid, not diagnosis." },
            { label: "Skip directly to fine-tuning since prompting has plateaued.", explanation: "Plateau on what set? Random failures? Specific failure classes? Diagnose first." },
          ]}
        />
      </Checkpoint>

      <h2 id="decision-framework">4. The decision framework</h2>
      <p>
        Here&apos;s the framework I&apos;d use in production. It&apos;s a sequence of questions, each one cheaper to
        answer than the next. Stop at the first &quot;yes&quot;.
      </p>

      <CodeBlock lang="plain" caption="The fine-tune-or-not decision tree">{`Q1. Is this a NEW BEHAVIOR (style, format, structure) or NEW KNOWLEDGE (facts, recent data)?
     ├─ New knowledge        → STOP. Use RAG. Fine-tuning will hallucinate.
     └─ New behavior         → continue

Q2. Have I systematically iterated on the prompt with eval-driven feedback (Module 24)?
     ├─ No                   → STOP. Build evals first. You're flying blind.
     └─ Yes                  → continue

Q3. Have I tried few-shot with 5–10 examples in the prompt?
     ├─ No                   → STOP. Try few-shot. It's free.
     └─ Yes, plateaued       → continue

Q4. Is the prompt + few-shot too expensive or slow at my real volume?
     ├─ No                   → STOP. Don't fine-tune. You don't have a problem yet.
     └─ Yes                  → continue

Q5. Have I tried prompt caching (Module 13)?
     ├─ No                   → STOP. Cache the static prefix first.
     └─ Yes, still expensive → continue

Q6. Do I have ≥500 high-quality (input, ideal output) pairs that an expert agrees on?
     ├─ No                   → STOP. Gather data first. (Or accept the prompt.)
     └─ Yes                  → continue

Q7. Do I have an eval set distinct from training data, with measurable success criteria?
     ├─ No                   → STOP. Build evals (Module 24). You can't tell if FT worked.
     └─ Yes                  → continue

→ FINE-TUNE. Use LoRA. Compare against the base + prompt baseline. Re-evaluate quarterly.`}</CodeBlock>

      <p>
        If you reach the bottom you&apos;re probably in the 5%. Most projects stop at Q1 (it&apos;s a knowledge problem)
        or Q2 (no evals). Both of those stops are the framework working — they&apos;re saving you weeks.
      </p>

      <WorkedExample
        title="Walking the framework: a customer support assistant"
        subtitle="A realistic scenario your team might actually face"
        steps={[
          {
            title: "The ask",
            body: (
              <>
                <p>
                  Product comes to you: <em>&quot;Our support assistant gives the right answer 75% of the time.
                  We need 95%. Should we fine-tune?&quot;</em>
                </p>
                <p>This is the question every AI engineer eventually gets. Walk the framework.</p>
              </>
            ),
          },
          {
            title: "Q1: Behavior or knowledge?",
            body: (
              <>
                <p>
                  You audit 50 wrong answers. <strong>40 of them</strong>{" "}are the assistant making up product
                  features that don&apos;t exist or quoting outdated pricing. <strong>10 of them</strong>{" "}are the
                  assistant phrasing the right answer in a way customers find rude.
                </p>
                <p>
                  Verdict: 80% of failures are <strong>knowledge</strong>. Stop. Fix RAG before anything else.
                  The remaining 20% might be a behavior problem worth coming back to.
                </p>
              </>
            ),
          },
          {
            title: "Fix the knowledge problem first",
            body: (
              <>
                <p>
                  You spend two weeks improving retrieval: better chunking, hybrid search, re-ranking, citation discipline.
                  Re-evaluate.
                </p>
                <p>
                  New numbers: 91% correct. The remaining 9% splits as: 3% real RAG misses (long-tail product questions),
                  6% rude-tone failures.
                </p>
              </>
            ),
          },
          {
            title: "Now revisit the behavior problem",
            body: (
              <>
                <p>
                  You&apos;re at 91%. Product wants 95%. The remaining gap is partly knowledge (3%) and partly
                  tone (6%). Tone is a structural behavior — that&apos;s candidate territory for fine-tuning.
                  Walk the rest of the framework on the tone problem only.
                </p>
              </>
            ),
          },
          {
            title: "Q2-Q5: try the cheap things",
            body: (
              <>
                <p>You add a tone-rubric to the system prompt and three few-shot examples of empathetic phrasing.</p>
                <p>
                  Re-evaluate: 94%. Tone failures dropped from 6% to 3%. Cost per request went up 8% from the bigger prompt.
                  Latency increased 200ms.
                </p>
                <p>
                  At your traffic (1M req/day), the prompt change costs you an extra $4K/month. <em>Now</em>{" "}
                  fine-tuning to compress the tone rubric into weights might be worth it.
                </p>
              </>
            ),
          },
          {
            title: "Q6-Q7: do you have data and evals?",
            body: (
              <>
                <p>
                  You ask for 500 hand-written empathetic-tone examples from the support team. They produce 200 in
                  two weeks. Quality is mixed.
                </p>
                <p>
                  You realize what you need is for senior support agents to <em>label and rewrite</em>, not produce
                  from scratch. You build a labeling tool. After three more weeks you have 600 high-quality pairs and
                  a held-out 100-case eval set with explicit tone scores.
                </p>
              </>
            ),
          },
          {
            title: "Fine-tune and measure",
            body: (
              <>
                <p>
                  You LoRA-fine-tune. You compare base+prompt vs fine-tuned+short-prompt on your eval set.
                  Fine-tuned wins on tone (4.6/5 vs 4.2/5) and saves $4K/month in prompt cost. Net positive.
                </p>
                <p>
                  Total elapsed: ~10 weeks. ~7 of those were spent fixing things that <em>weren&apos;t</em>{" "}a fine-tuning
                  problem. That&apos;s the framework doing its job.
                </p>
              </>
            ),
          },
        ]}
      />

      <Checkpoint moduleSlug={SLUG} id="decision-framework" title="The decision framework" xp={20}>
        <Quiz
          question="In the worked example, what fraction of the original 25-percentage-point gap was actually solved by fine-tuning?"
          options={[
            { label: "The whole 20 points (75% → 95%) — fine-tuning was the silver bullet.", explanation: "Most of the gap closed before fine-tuning entered the picture." },
            { label: "About 3 points (91% → 94%) of polish at the end. The rest came from RAG and prompt iteration.", correct: true, explanation: "Yes — fine-tuning was a small final touch, not the main driver." },
            { label: "Fine-tuning didn't help; it broke even.", explanation: "Tone improved measurably and cost dropped — that's net positive." },
            { label: "Fine-tuning made things worse and the team rolled back.", explanation: "It was a measured win, just smaller than people typically imagine." },
          ]}
        />
        <Quiz
          question="What does Q1 of the framework actually filter out?"
          options={[
            { label: "Teams that don't have enough budget.", explanation: "Budget isn't part of Q1. The filter is whether the problem is behavior vs knowledge." },
            { label: "Teams whose real problem is missing or stale information — which is RAG's job, not fine-tuning's.", correct: true, explanation: "Right — and this filter alone redirects most projects correctly." },
            { label: "Teams that lack enough labeled data.", explanation: "That's Q6, not Q1." },
            { label: "Teams using closed-source models.", explanation: "Open vs closed isn't a fine-tuning gate; it's an availability question." },
          ]}
        />
      </Checkpoint>

      <h2 id="economics">5. The economics nobody talks about</h2>
      <p>
        Even when fine-tuning is technically right, the <em>economics</em>{" "}can still kill it. Three specific costs
        get under-counted:
      </p>

      <h3 id="cost-data">Data labeling cost dwarfs training cost</h3>
      <p>
        A LoRA fine-tune of a 70B model might cost $500 in compute. The 1,000 high-quality (prompt, response) pairs
        it needs cost $20,000–$100,000 in expert labeler time. That ratio is true almost everywhere. The question
        &quot;can we afford to fine-tune?&quot; is really &quot;can we afford to label?&quot;
      </p>

      <h3 id="cost-eval">Eval set cost is a permanent tax</h3>
      <p>
        You can&apos;t tell if a fine-tune worked without an eval set held out from training data — and that eval set
        has to be expert-labeled too. And every time you change the model, the prompt, or the data pipeline, you
        re-run the eval. (See <Link href="/courses/ai/modules/evals">Module 24</Link>.) Eval cost is not a one-time investment.
      </p>

      <h3 id="cost-drift">Model drift &amp; vendor lock-in</h3>
      <p>
        You fine-tune Claude 3.5 Sonnet today. In six months Claude 4 ships. Your fine-tune doesn&apos;t transfer.
        You either pay to re-train (data + compute), stay on the older base (lose new capability), or revert to
        prompt + RAG on the new model (waste the original investment). This is the <strong>dependency rotation tax</strong>{" "}
        and it shows up in every multi-year fine-tuning program.
      </p>

      <Callout variant="insight" title="The hidden discount on prompt + RAG">
        Prompt + RAG transfers across model versions almost for free. Most prompts that work on Claude 3 work on
        Claude 4 with minor adjustments. Your retrieval layer is model-agnostic. Every time the frontier improves,
        you get the gain &quot;for free&quot; — your fine-tuned competitor pays a re-training tax to keep up.
      </Callout>

      <h2 id="rlhf-realtalk">6. RLHF: real talk for engineers</h2>
      <p>
        You&apos;ll see RLHF (Reinforcement Learning from Human Feedback) and its variants — DPO, KTO, RLAIF — show
        up in marketing copy and conference talks. Here&apos;s the engineer&apos;s honest summary.
      </p>

      <CodeBlock lang="plain" caption="RLHF in 4 lines">{`1. Generate two responses to the same prompt.
2. A human (or another model) picks the better one.
3. Train a "reward model" that predicts which response the human picks.
4. Use that reward model to fine-tune the LLM via PPO (or DPO, KTO, etc.)
   so it preferentially produces high-reward responses.`}</CodeBlock>

      <p>
        RLHF is what turns a raw pre-trained model (which will happily complete &quot;how do I make a bomb&quot;) into
        an instruction-following assistant that refuses politely. <strong>Without RLHF, frontier LLMs would be unusable.</strong>
      </p>
      <p>
        For customer fine-tuning, RLHF is mostly out of reach: you need a reward model, infrastructure to run PPO
        loops, and tens of thousands of preference pairs. <strong>DPO</strong> (Direct Preference Optimization)
        sidesteps the reward-model step and is what most customer-facing &quot;preference fine-tuning&quot; APIs
        actually run under the hood. It&apos;s real, it works, and it&apos;s appropriate when you have preference data
        (A is better than B) but not absolute labels (B is the right answer).
      </p>

      <Callout variant="info" title="When DPO actually fits">
        You have side-by-side outputs and humans who can rank them, but defining a single &quot;correct&quot; answer
        is impossible. Tone, summary quality, and creative writing fit. Classification, extraction, and structured
        output do not — for those, just use SFT.
      </Callout>

      <PartRecap
        title="Parts 4-6 takeaways"
        gist="The framework filters most projects out at Q1 (knowledge, not behavior) or Q2 (no evals). Even when fine-tuning is right, labeling cost dwarfs compute, and model drift is a permanent tax. RLHF/DPO has a narrow legitimate niche."
        points={[
          { takeaway: "Walk the decision tree honestly", detail: "Most fine-tuning projects should stop at Q1, Q2, or Q5." },
          { takeaway: "Labeling >> compute", detail: "$20K of expert time + $500 of training is the typical ratio." },
          { takeaway: "Drift is a permanent cost", detail: "Every base-model version requires a re-train. Prompt + RAG transfers free." },
          { takeaway: "DPO when preference labels exist", detail: "Use it for tone and creative work, SFT for everything else." },
        ]}
      />

      <Checkpoint moduleSlug={SLUG} id="economics-rlhf" title="Economics &amp; RLHF" xp={20}>
        <Quiz
          question="Which cost typically dominates a customer fine-tuning project's budget?"
          options={[
            { label: "GPU/compute for the training run.", explanation: "Compute is usually the smallest line item." },
            { label: "Hyperparameter sweeps.", explanation: "These are bounded — usually a small fraction of total." },
            { label: "Expert labeler time to produce high-quality (prompt, response) pairs and eval cases.", correct: true, explanation: "Right — labeling is consistently the dominant cost." },
            { label: "Model registry storage fees.", explanation: "Negligible at any reasonable scale." },
          ]}
        />
        <Quiz
          question="Why does prompt + RAG have a 'hidden discount' over fine-tuning?"
          options={[
            { label: "Prompts have unlimited token budgets.", explanation: "They don't — pricing scales with tokens." },
            { label: "RAG has no embedding cost.", explanation: "It does — see Module 14." },
            { label: "When the base model improves, prompts and retrieval transfer for free; fine-tunes have to be re-trained.", correct: true, explanation: "Yes — this is a real and large effect over multi-year projects." },
            { label: "RAG outputs are cached at the platform level by default.", explanation: "Caching is opt-in (Module 13), not free or default." },
          ]}
        />
      </Checkpoint>

      <h2 id="project">7. Project: the decision document</h2>
      <p>
        No code this module. The deliverable is a written decision document — the artifact you&apos;d hand to your
        manager to defend a fine-tune-or-not call. Production AI engineering is as much about <em>not</em>{" "}building
        things as it is about building them. This is the muscle.
      </p>

      <Callout variant="spring" title="The scenario">
        You&apos;re the AI lead at a mid-sized SaaS company. The product team comes to you and says:
        <br /><br />
        <em>&quot;Our AI-powered ticket triage system mis-routes 18% of incoming support tickets. We&apos;ve
        engineered the prompt for two months. We have 50,000 historically-routed tickets going back two years.
        Should we fine-tune?&quot;</em>
        <br /><br />
        Write the decision doc.
      </Callout>

      <h3 id="project-template">The template</h3>
      <p>
        Use this structure. It mirrors what production AI teams actually write. Aim for ~600–1000 words total —
        long enough to be substantive, short enough that your stakeholders will read it.
      </p>

      <CodeBlock lang="plain" caption="decision-doc.md">{`# Fine-tune or not: ticket triage routing
**Author:** [you]
**Date:** [today]
**Decision:** [recommend / not recommend / pilot first]

## Context (50 words)
What's the system today? What's the success metric? What's the gap?

## What I investigated
1. Failure class analysis: which 18% are mis-routed, and why?
   Behavior failure (right info, wrong destination) vs
   knowledge failure (didn't understand the ticket content)?
2. Current prompt iteration ceiling: how far did 2 months get us?
3. Eval discipline: do we have a held-out eval set with class
   distributions matching production?
4. Data quality: of the 50K historical tickets, what fraction
   were routed correctly by humans? What's the labeler-agreement rate?

## Walking the framework
Q1 (behavior or knowledge):  [your finding]
Q2 (eval-driven iteration):  [your finding]
Q3 (few-shot tried):         [your finding]
Q4 (cost/latency at volume): [your finding]
Q5 (prompt caching tried):   [your finding]
Q6 (≥500 quality pairs):     [your finding — keep in mind 50K
                              historical tickets is RAW data, not
                              labeled training data]
Q7 (held-out eval set):      [your finding]

## Recommendation
[Concrete next step. If "fine-tune", include: which model, expected
data labeling effort, eval methodology, success criteria, kill
criteria, and a baseline you'll compare against.]

## Cost estimate (if recommending fine-tune)
- Labeling: [hours × rate]
- Eval set construction: [hours × rate]
- Compute: [$X for LoRA on Y model]
- Re-training per quarter: [$Z]
- Re-training when base model upgrades: [$Z × probability]

## Kill criteria
[The numbers / observations that would make you pull the plug
mid-project. Decide these BEFORE you start.]

## Alternative paths considered
- Improve retrieval / RAG: [why yes / why no]
- Larger base model: [why yes / why no]
- Two-stage classifier: small fast model + LLM tiebreaker
- Just accepting 18%: what's the actual cost of 18% mis-routing?`}</CodeBlock>

      <h3 id="project-grading">How to grade your own decision doc</h3>
      <p>A good decision doc:</p>
      <ul>
        <li><strong>Names the failure classes.</strong> &quot;18% wrong&quot; isn&apos;t a problem statement; &quot;12% are billing-related but routed to tier-1 because of jargon&quot; is.</li>
        <li><strong>Does the cheap diagnosis before recommending the expensive fix.</strong>{" "}Failure-class analysis costs a day. A fine-tune costs months.</li>
        <li><strong>Has explicit kill criteria.</strong> &quot;If we don&apos;t hit 92% accuracy by week 8, we stop&quot; — written before you start.</li>
        <li><strong>Quotes a real cost.</strong>{" "}Including labeler time. Including the re-training tax.</li>
        <li><strong>Considers the &quot;just accept it&quot; option.</strong>{" "}Sometimes 18% wrong is fine and the budget is better spent elsewhere. A good doc names this.</li>
        <li><strong>Picks a path and commits.</strong>{" "}A doc that says &quot;maybe fine-tune, maybe not&quot; isn&apos;t a decision.</li>
      </ul>

      <Callout variant="warn" title="The most common mistake">
        Most decision docs jump straight to &quot;here&apos;s my fine-tuning plan.&quot; The whole exercise is about the
        <em> investigation that comes first.</em>{" "}If your doc starts with &quot;I recommend fine-tuning because...,&quot;
        rewrite it. The first half should be &quot;here&apos;s what I learned about the failures.&quot;
      </Callout>

      <Checkpoint
        moduleSlug={SLUG}
        id="decision-doc"
        title="Write the decision document"
        xp={40}
        manual
        manualLabel="I&apos;ve written the decision doc"
        celebration="Production thinking — write the doc, save the company months."
      >
        <p>
          Write the decision doc for the ticket triage scenario above. Aim for 600–1000 words. Don&apos;t skip the
          investigation section — that&apos;s the whole point.
        </p>
        <p>
          When you&apos;re done, mark this complete. Bonus: bring the doc to your next 1:1 and pretend it&apos;s a
          real proposal. The discipline of defending a written recommendation is the muscle this module is building.
        </p>
      </Checkpoint>

      <h2 id="final-quiz">Final quiz</h2>
      <Checkpoint moduleSlug={SLUG} id="final" title="Module 26 final" xp={50}>
        <Quiz
          question="Which statement most accurately describes what customer LoRA fine-tuning is good for?"
          options={[
            { label: "Teaching the model new factual information about your product.", explanation: "LoRA is bad at facts. Use RAG." },
            { label: "Adjusting style, format, and which existing capabilities the model deploys — without teaching new knowledge.", correct: true, explanation: "Yes — that's the precise scope of what low-rank adaptation can achieve." },
            { label: "Making the model reason better on math problems.", explanation: "Reasoning gains come from base model selection or chain-of-thought prompting." },
            { label: "Reducing the model's tendency to refuse legitimate queries.", explanation: "Refusal behavior comes from the lab's RLHF/safety training, not customer LoRA." },
          ]}
        />
        <Quiz
          question="What's the first question you should ask before considering fine-tuning?"
          options={[
            { label: "How much budget do we have?", explanation: "Budget matters but isn't the framework's first filter." },
            { label: "Is this a behavior problem or a knowledge problem?", correct: true, explanation: "Right — Q1 redirects most projects to RAG correctly." },
            { label: "Do we have a GPU cluster?", explanation: "Modern fine-tuning APIs make this irrelevant for most teams." },
            { label: "What model should we fine-tune?", explanation: "Picking a model before defining the problem is putting the cart before the horse." },
          ]}
        />
        <Quiz
          question="A team fine-tuned Claude 3.5 Sonnet six months ago. Anthropic just released Claude 4. What's the typical 'dependency rotation tax'?"
          options={[
            { label: "Zero — fine-tunes auto-upgrade to new base models.", explanation: "They don't. The fine-tune is bound to the specific base." },
            { label: "Re-running training: another labeling pass (often), another eval pass (always), and another compute spend. Or staying on the old base and missing new capabilities.", correct: true, explanation: "Exactly — and this happens every time the base improves, which is currently every 6-12 months." },
            { label: "Roughly the storage cost of the LoRA adapter.", explanation: "Storage is negligible. The cost is re-training and re-evaluation work." },
            { label: "Anthropic provides automated migration scripts.", explanation: "Vendors don't migrate fine-tunes across major versions." },
          ]}
        />
        <Quiz
          question="When does DPO (Direct Preference Optimization) make more sense than SFT?"
          options={[
            { label: "Always — DPO is strictly better than SFT.", explanation: "They solve different problems." },
            { label: "When you have preference rankings (A is better than B) but defining a single correct answer is impossible — typically tone, summary quality, creative work.", correct: true, explanation: "Yes — DPO learns from comparisons, SFT learns from labeled targets." },
            { label: "When you have less than 50 training examples.", explanation: "Both methods need real data; small N hurts both." },
            { label: "When your model needs to use tools more reliably.", explanation: "Tool reliability is a prompt and tool-description problem, not a DPO problem." },
          ]}
        />
        <Quiz
          question="Why is the cost of an eval set described as a 'permanent tax' rather than a one-time investment?"
          options={[
            { label: "Eval frameworks charge a monthly subscription.", explanation: "Open-source eval harnesses are free. The cost isn't software." },
            { label: "Every time you change the model, prompt, retrieval, or data pipeline, you re-run the eval — and quality eval cases need expert labeling that has to be refreshed as production drifts.", correct: true, explanation: "Right — evals only stay useful if they reflect current production reality, which keeps changing." },
            { label: "Evals lose accuracy unless retrained on every API call.", explanation: "Evals aren't models — they don't 'retrain'." },
            { label: "Cloud providers expire eval datasets after 90 days.", explanation: "They don't. The tax is engineering effort, not storage policy." },
          ]}
        />
      </Checkpoint>

      <div className="my-12 p-8 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white">
        <h3 className="text-xl font-bold text-white mt-0 mb-3">Next up: the capstone</h3>
        <p className="text-white/95 mb-3">
          You&apos;ve done the whole arc — tokenization, training, transformers, embeddings, prompts, the API, tool use,
          streaming, caching, RAG, frontend integration, agents, evals, security, and now training discipline. One
          module left.
        </p>
        <p className="text-white/95 mb-0">
          <strong>Module 27 — Capstone:</strong>{" "}a single end-to-end AI engineering assistant that uses everything you&apos;ve
          built. Streaming chat, tool use, RAG over a real codebase, agent loops, evals, security guards. The portfolio
          piece. The thing you point at when somebody asks &quot;can you actually ship AI?&quot;
        </p>
      </div>
        <ModuleNav courseId="ai" currentSlug="fine-tuning" />
    </article>
  );
}
