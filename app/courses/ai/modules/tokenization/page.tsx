import Link from "next/link";
import Quiz from "@/components/Quiz";
import TokenizerDemo from "@/components/TokenizerDemo";
import Mermaid from "@/components/Mermaid";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "setup", title: "The setup" },
  { id: "why-numbers", title: "Why numbers" },
  { id: "quirks", title: "The quirks" },
  { id: "spring-boot", title: "Spring Boot" },
  { id: "final", title: "Final quiz" },
];

export default function TokenizationModule() {
  const mod = getModuleBySlug("tokenization")!;

  const tokenizationFlowchart = `
flowchart LR
    A[Raw text<br/>&quot;Hello world&quot;] --> B[Tokenizer]
    B --> C{Learned<br/>vocab of<br/>~50K chunks}
    C --> D[Token IDs<br/>15496, 1917]
    D --> E[Model sees<br/>only numbers]
    E --> F[Output tokens]
    F --> G[Detokenizer]
    G --> H[Raw text<br/>response]
    style B fill:#818cf8,color:#fff
    style G fill:#818cf8,color:#fff
    style C fill:#fbbf24,color:#000
  `.trim();

  const bpeFlowchart = `
flowchart TD
    S[Start: &quot;unbelievable&quot;] --> T1{Is &quot;unbelievable&quot;<br/>in vocab?}
    T1 -->|No| T2{Is &quot;unbeliev&quot;<br/>in vocab?}
    T2 -->|No| T3{Is &quot;un&quot; + &quot;believ&quot; + &quot;able&quot;<br/>all in vocab?}
    T3 -->|Yes| T4[✓ Split into<br/>un / believ / able<br/>= 3 tokens]
    style T4 fill:#86efac,color:#000
  `.trim();

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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Tokenization
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Why does the AI charge me by the tok<em>what</em>?
        </p>
        <BookmarkButton courseId="ai" moduleSlug="tokenization" />
        <ModuleProgress moduleSlug="tokenization" checkpoints={CHECKPOINTS} />
      </header>

      {/* PART 1: THE SETUP */}
      <Checkpoint moduleSlug="tokenization" id="setup" title="The setup" xp={15} celebration="Setup complete — you get how tokens get counted. On to the 'why'.">
      <section>
        <h2>Part 1: The setup</h2>

        <p>You send this to Claude:</p>
        <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-slate-700 dark:text-slate-300 my-4">
          &quot;The quick brown fox jumps over the lazy dog&quot;
        </blockquote>
        <p>Nine words. Simple, right?</p>
        <p>
          Claude doesn&apos;t see 9 words. Claude doesn&apos;t even see English. Claude sees this:
        </p>
        <pre><code>{`[791, 4062, 14198, 39935, 35308, 927, 279, 16053, 5679]`}</code></pre>
        <p>
          Nine numbers. That&apos;s it. That&apos;s what the model actually processes.
        </p>
        <p>
          Those numbers are called <strong>tokens</strong>. And you pay for every single one.
        </p>

        <Quiz
          kind="Gut check"
          question="Before we go further — if you send a 1,000-word English essay to Claude, roughly how many tokens is that?"
          options={[
            { label: "About 500 tokens", explanation: "Nope, the other way around — tokens are usually MORE than words, not fewer." },
            { label: "About 1,000 tokens (1 word = 1 token)", explanation: "Close in spirit, but words often split into multiple tokens. The real ratio is higher." },
            { label: "About 1,333 tokens (1 word ≈ 1.33 tokens)", correct: true, explanation: "This is the rule of thumb for English: 1 word ≈ 1.33 tokens. Rare words, punctuation, and whitespace all add to the count." },
            { label: "About 2,500 tokens", explanation: "Too high for English — this kind of ratio shows up for non-English or code, not plain English." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2: WHY NUMBERS */}
      <Checkpoint moduleSlug="tokenization" id="why-numbers" title="Why numbers" xp={20} celebration="You've got the intuition for BPE. That's half the battle.">
      <section>
        <h2>Part 2: Why numbers instead of words?</h2>

        <p>Imagine you&apos;re teaching a friend who only speaks math. You want to tell them about dogs.</p>

        <div className="grid sm:grid-cols-2 gap-4 my-6">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-4">
            <div className="font-semibold text-rose-900 dark:text-rose-200 mb-2">❌ Option A: Every word → a number</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              English has ~170,000 words. Your friend memorizes a huge table. And what about &quot;doggo&quot;? &quot;Doggos&quot;? Misspellings break everything.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">✅ Option B: Chunks → numbers</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              &quot;Dogs&quot; = <code>dog</code> + <code>s</code>. &quot;Running&quot; = <code>run</code> + <code>ning</code>. Your friend memorizes ~50,000 reusable chunks, and can handle words they&apos;ve never seen.
            </p>
          </div>
        </div>

        <p>
          LLMs picked Option B. Those chunks are <strong>tokens</strong>. The algorithm that learned the chunks is called{" "}
          <strong>Byte-Pair Encoding (BPE)</strong> — it&apos;s worth knowing the name because you&apos;ll see it everywhere.
        </p>

        <Callout variant="insight" title="How BPE actually splits a word">
          <p className="mb-2">The tokenizer tries the longest chunk it knows, falls back to smaller pieces if needed:</p>
        </Callout>

        <Mermaid chart={bpeFlowchart} />

        <Callout variant="warn" title="The tokenizer is welded to the model — you can't swap them">
          <p className="m-0">
            Each model ships with one specific tokenizer. The vocabulary it learned (which token IDs map to which chunks of text) is baked into <em>both</em>{" "}the embedding table at the model&apos;s input and the projection matrix at its output. Swap the tokenizer and every ID points to the wrong row — the model produces gibberish. This is why Anthropic&apos;s tokenizer ≠ OpenAI&apos;s tokenizer ≠ Llama&apos;s tokenizer, and why your token counts will differ between providers for the exact same prompt. When you switch models, you switch tokenizers — they come as a pair.
          </p>
        </Callout>

        <Callout variant="info" title='"Tokenizer" vs "encoder" — two different things, often confused'>
          <p className="m-0">
            <strong>Tokenizer</strong> = text → integer IDs (BPE; what we&apos;re doing in this module). <strong>Encoder</strong> = integer IDs (or one-hot vectors) → dense float vectors (what the embedding layer + transformer stack do, starting in Module 6). The tokenizer is a fixed lookup; the encoder is a trained neural network. People say &quot;encode the text&quot; for both, which is where the confusion comes from. From here on we&apos;ll keep them straight: <em>tokenize</em>{" "}first, then <em>embed</em>, then <em>encode</em>{" "}through the transformer.
          </p>
        </Callout>

        <Quiz
          question="Why is the &apos;chunks&apos; approach (Option B) smarter than giving every word its own number?"
          options={[
            { label: "It uses less memory on the GPU", explanation: "Memory isn't the main reason — even 170K words would fit easily. Think about what happens with words the model has never seen." },
            { label: "It can handle words the model was never trained on, by splitting them into pieces it knows", correct: true, explanation: "Exactly. BPE lets the model handle 'ChatGPT-ification' even though that word never existed in training — it gets split into chunks the model already knows." },
            { label: "It makes the model faster to train", explanation: "Training speed is a minor factor. The big win is handling novel words gracefully." },
            { label: "It lets the model understand meaning better", explanation: "Tokenization doesn't directly encode meaning — that's what embeddings do (coming in a later module!). Tokens are just identifiers." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* LIVE DEMO */}
      <section>
        <h2>🎮 Try it yourself</h2>
        <p>
          Here&apos;s a live tokenizer. Type anything, click presets, watch tokens split in real-time. Each color is one token.
        </p>
        <TokenizerDemo />
      </section>

      {/* PART 3: QUIRKS */}
      <Checkpoint moduleSlug="tokenization" id="quirks" title="The quirks" xp={20} celebration="You know the production landmines. Your future self will thank you.">
      <section>
        <h2>Part 3: The weird behavior that will bite you</h2>

        <p>Here&apos;s where it gets fun. Tokenization has quirks that will hit you in production.</p>

        <h3>Quirk #1: Spaces matter</h3>
        <ul className="list-disc ml-6 space-y-1 my-3">
          <li><code>&quot;hello&quot;</code> → 1 token</li>
          <li><code>&quot; hello&quot;</code> (with a leading space) → 1 token, but a <strong>different</strong>{" "}token</li>
        </ul>
        <p>
          The model literally sees <code>hello</code> at the start of a sentence and <code>hello</code> mid-sentence as different tokens. Weird, right? But it&apos;s why the model learned to capitalize the first word.
        </p>

        <h3>Quirk #2: Common words are cheap, rare words are expensive</h3>
        <ul className="list-disc ml-6 space-y-1 my-3">
          <li><code>&quot;the&quot;</code> → 1 token</li>
          <li><code>&quot;antidisestablishmentarianism&quot;</code> → 6 tokens</li>
        </ul>
        <p>
          The tokenizer learned during training which chunks show up often, and gave those their own single token. Rare words get chopped into pieces.
        </p>

        <h3>Quirk #3: Non-English is EXPENSIVE</h3>
        <ul className="list-disc ml-6 space-y-1 my-3">
          <li><code>&quot;Hello, how are you?&quot;</code> → ~6 tokens</li>
          <li><code>&quot;你好，你好吗？&quot;</code> (same thing in Chinese) → ~14 tokens</li>
        </ul>
        <p>
          Why? The tokenizer was trained mostly on English text. Chinese characters often become one-token-per-character or worse.
        </p>

        <Callout variant="warn" title="Real production impact">
          <p className="m-0">If your app serves users in multiple languages, a Japanese or Hindi user costs you 2-3x what an English user costs — even for the same message. Plan your pricing accordingly.</p>
        </Callout>

        <Quiz
          question="Which of these costs the MOST tokens?"
          hint="Don't just count characters — think about what the tokenizer has probably seen during training."
          options={[
            { label: `"The cat sat on the mat"`, explanation: "Surprisingly cheap! About 6 tokens — all super-common words, each is 1 token." },
            { label: `"Pneumonoultramicroscopicsilicovolcanoconiosis"`, explanation: "Chunked into ~11 tokens. Expensive, but not the winner." },
            { label: `"Hello Hello Hello Hello Hello" (repeated 5 times)`, correct: true, explanation: "Gotcha! About 9 tokens — each ' Hello' (with leading space) is its own token, and repetition doesn't give you a discount. Tokens are counted, not compressed." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* THE PIPELINE */}
      <section>
        <h2>The full pipeline, visualized</h2>
        <p>Here&apos;s what happens every time you call Claude:</p>
        <Mermaid chart={tokenizationFlowchart} />
        <p>
          You never see tokens directly, but they&apos;re the hidden unit of cost, limit, and latency in every LLM interaction.
        </p>
      </section>

      {/* PART 4: SPRING BOOT CORNER */}
      <Checkpoint moduleSlug="tokenization" id="spring-boot" title="Spring Boot" xp={25} celebration="Spring Boot integration locked in. You could wire this up for real tomorrow.">
      <section>
        <h2>Part 4: What this means for your Spring Boot code</h2>

        <p>Three concrete things this means for your application:</p>

        <div className="space-y-4 my-6">
          <NumberedPoint n={1} title="Your bill is per-token, not per-request">
            Sending 10,000 tokens of context on every request? Your bill scales with that. Not with request count.
          </NumberedPoint>
          <NumberedPoint n={2} title="Models have context windows in tokens">
            Claude Sonnet 4.5 has a 200K-token context (1M on the extended-context tier). That&apos;s roughly 150,000 English words at 200K. Sounds huge until you try to stuff in 100 PDFs.
          </NumberedPoint>
          <NumberedPoint n={3} title="You MUST count tokens before sending">
            Go over the limit → API rejects the whole request. You need server-side counting to truncate gracefully.
          </NumberedPoint>
        </div>

        <Callout variant="spring" title="Spring Boot: counting tokens before you send">
          <p className="mb-3">
            Spring AI (the official Spring integration for LLMs) gives you a token counter via the <code>TokenCountEstimator</code> interface. Here&apos;s how you&apos;d wire it into a service:
          </p>
          <CodeBlock lang="java" caption="SafeChatService.java">{`// ─────────────────────────────────────────────────────────────
// STEP 1: ADD THE SPRING AI DEPENDENCY
// ─────────────────────────────────────────────────────────────
// This one dependency pulls in Spring AI's Claude integration,
// including auto-configured beans for ChatClient, TokenCountEstimator,
// and the Anthropic API wiring. Add to pom.xml:
//
// <dependency>
//   <groupId>org.springframework.ai</groupId>
//   <artifactId>spring-ai-anthropic</artifactId>
// </dependency>
//
// Set your API key via env var or application.yml:
//   spring.ai.anthropic.api-key=\${ANTHROPIC_API_KEY}

// ─────────────────────────────────────────────────────────────
// STEP 2: THE SERVICE
// ─────────────────────────────────────────────────────────────
// @Service = Spring stereotype for business logic. Gets auto-discovered
// by component scanning, lifetime = singleton by default.
@Service
public class SafeChatService {

    // ChatClient = Spring AI's high-level wrapper for calling an LLM.
    // Works the same whether the underlying model is Claude, OpenAI,
    // or Ollama — you swap the dependency, not your service code.
    private final ChatClient chatClient;

    // TokenCountEstimator = Spring AI's token-counting interface.
    // It uses the right tokenizer for whichever provider you chose
    // (we saw in the demo above: different models, different BPE vocabs).
    private final TokenCountEstimator tokenCounter;

    // Claude's context window. Anything sent beyond this gets rejected.
    private static final int MODEL_LIMIT = 200_000;

    // Headroom for the model's REPLY. Input + output must fit together
    // in MODEL_LIMIT. If we fill the whole window with our prompt,
    // there's no room left for Claude to respond.
    private static final int RESPONSE_BUFFER = 4_000;

    // Constructor injection (preferred over @Autowired fields — easier
    // to unit-test, and 'final' fields can't be accidentally reassigned).
    // Spring Boot auto-provides both the ChatClient.Builder AND the
    // TokenCountEstimator because spring-ai-anthropic registered them.
    public SafeChatService(ChatClient.Builder builder,
                           TokenCountEstimator tokenCounter) {
        this.chatClient = builder.build();
        this.tokenCounter = tokenCounter;
    }

    /**
     * Send a prompt to Claude while guarding against context-window overflow.
     *
     * @param systemPrompt  the system instruction (persistent behavior)
     * @param userMessage   what the user just typed
     * @param context       extra grounding info — RAG docs, chat history, etc.
     *                      This is the part we trim if we're over budget.
     */
    public String chat(String systemPrompt, String userMessage, String context) {

        // Estimate total tokens BEFORE the network call. This is cheap
        // (runs in-process with the tokenizer) vs a failed API call
        // which costs latency + a round-trip error.
        String fullPrompt = systemPrompt + "\\n" + context + "\\n" + userMessage;
        int estimated = tokenCounter.estimate(fullPrompt);

        // If we'd leave less than RESPONSE_BUFFER room for the reply,
        // the API would reject the call. Fix it pre-emptively by
        // trimming context — the only piece we're willing to shrink.
        // (Never trim the user's actual question — they typed it for a reason.)
        if (estimated > MODEL_LIMIT - RESPONSE_BUFFER) {
            int reservedForSysAndUser = tokenCounter.estimate(systemPrompt + userMessage);
            int contextBudget = MODEL_LIMIT - RESPONSE_BUFFER - reservedForSysAndUser;
            context = truncateToFit(context, contextBudget);
        }

        // Assemble the system message with grounding context appended.
        // Convention: system prompt holds the persistent instruction, and
        // we glue the (possibly truncated) context after it with a clear
        // delimiter so the model knows where instructions end and grounding
        // begins. The user message stays untouched.
        String systemWithContext = systemPrompt
            + "\\n\\n---\\nGrounding context:\\n" + context;

        // Fluent Spring AI call: system + user messages → model → text reply.
        // .call() is synchronous; for streaming you'd use .stream() instead
        // (covered in Module 12: Streaming with SSE).
        return chatClient.prompt()
            .system(systemWithContext)
            .user(userMessage)
            .call()
            .content();
    }

    /**
     * Shrink 'text' until it fits in tokenBudget.
     *
     * Naïve version: chop 10% off the end each iteration. Real production
     * code would instead rank chunks by relevance (using embeddings — see
     * Module 17) and drop the least useful ones first. That's the 'R' in RAG.
     */
    private String truncateToFit(String text, int tokenBudget) {
        while (tokenCounter.estimate(text) > tokenBudget && text.length() > 0) {
            // Drop the trailing 10% of characters. Character-level trimming
            // is approximate (remember: 1 token ≠ 1 character), so the while
            // loop re-checks after each cut until we're truly under budget.
            text = text.substring(0, (int)(text.length() * 0.9));
        }
        return text;
    }
}`}</CodeBlock>
          <p className="mt-3 text-xs">
            <strong>Why <code>@Service</code> here?</strong>{" "}Standard Spring pattern — stateless, injected, testable. The <code>TokenCountEstimator</code> bean is auto-configured by <code>spring-ai-anthropic</code>, so you just autowire it.
          </p>
        </Callout>

        <Quiz
          question="Why count tokens server-side in Spring Boot instead of just letting the API reject oversized requests?"
          options={[
            { label: "API rejections are free, you just retry", explanation: "They're not free — you still pay in latency and user experience. And they tell you nothing about HOW MUCH to trim." },
            { label: "To avoid latency, bad UX, and to know how much to trim", correct: true, explanation: "Exactly right. Counting server-side lets you truncate gracefully before wasting a round-trip, and you can pick WHICH parts to cut (e.g. drop older conversation turns first, keep the user's latest message)." },
            { label: "Because Spring Boot can't retry requests", explanation: "Spring Boot can retry fine — but retrying a too-large payload just hits the same error. Counting first is the actual fix." },
            { label: "It's required by the API terms of service", explanation: "It's not required, it's just good engineering." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* WRAP UP QUIZ */}
      <Checkpoint moduleSlug="tokenization" id="final" title="Final quiz" xp={40} celebration="Module 1 complete! 🎉 You just earned the 'Token Whisperer' badge.">
      <section>
        <h2>🎯 Final quiz</h2>
        <p>Five questions to check everything stuck. Take your time.</p>

        <Quiz
          kind="Q1 of 5"
          question={`You send "Hello world" to Claude. Roughly how many tokens?`}
          options={[
            { label: "11 tokens (one per character)", explanation: "Characters ≠ tokens for common English words." },
            { label: "2 tokens", correct: true, explanation: "Both 'Hello' and ' world' (with leading space) are single common tokens in most BPE vocabularies." },
            { label: "1 token", explanation: "Close, but the space before 'world' usually makes it a separate token." },
            { label: "4 tokens", explanation: "Too high for two common words." },
          ]}
        />

        <Quiz
          kind="Q2 of 5"
          question="True or false: A 10,000-character Chinese document costs about the same tokens as a 10,000-character English document."
          options={[
            { label: "True", explanation: "Nope. The tokenizer was trained mostly on English. Chinese characters often become one-token-per-character or worse — 2-3x the cost for the same content." },
            { label: "False — Chinese costs significantly more", correct: true, explanation: "Correct. This is a real-world concern for multilingual products: your non-English users cost more per request." },
          ]}
        />

        <Quiz
          kind="Q3 of 5"
          question="Your user pastes a 500KB log file into your RAG chat app. The model's context window is 200K tokens. Should you be worried?"
          options={[
            { label: "No, 500KB is tiny", explanation: "500KB sounds small on disk but is huge in tokens. Do the math: 500KB ≈ 500K characters ≈ 125K tokens. That's 60%+ of your context window before you add anything else." },
            { label: "Yes — that's likely ~125K tokens, eating most of your context", correct: true, explanation: "Exactly. Always think in tokens, not bytes. You'd need to summarize, chunk, or extract just the relevant sections before sending." },
            { label: "Only worry if it takes more than 5 seconds", explanation: "Latency isn't the issue here — you'll blow past the context window or pay for way more tokens than you need." },
          ]}
        />

        <Quiz
          kind="Q4 of 5"
          question="In your Spring Boot service, why inject a `TokenCountEstimator` as a bean instead of just doing `text.length() / 4`?"
          options={[
            { label: "It's more idiomatic Spring", explanation: "True, but that's not the real reason. There's a concrete correctness problem with '/4' estimation." },
            { label: "Because the real tokenizer gives exact counts that match what you're charged, while length/4 is wrong for code, non-English, and rare words", correct: true, explanation: "Right. The /4 rule is okay for rough English estimates, but falls apart for code, emoji, Chinese, etc. When accuracy matters (billing, cutting close to context limits), use the actual tokenizer." },
            { label: "Spring requires all numeric operations to go through beans", explanation: "Spring doesn't require that — this is about correctness, not convention." },
          ]}
        />

        <Quiz
          kind="Q5 of 5"
          question="A teammate says 'let's cache the tokenizer per-request for efficiency.' What's the right Spring Boot pattern here?"
          options={[
            { label: "Create a new TokenCountEstimator in each controller method", explanation: "Bad — tokenizer initialization is expensive (loading the vocab). Don't recreate per-request." },
            { label: "Make the TokenCountEstimator a singleton @Bean and inject it everywhere", correct: true, explanation: "Yes! Tokenizers are thread-safe and stateless after initialization — classic singleton bean territory. Spring AI's auto-configuration does this for you automatically. Injecting it via constructor gives you testability for free." },
            { label: "Put it in a ThreadLocal", explanation: "Overkill. ThreadLocals are for genuinely per-thread state; the tokenizer is thread-safe." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* RECAP */}
      <section>
        <h2>✅ What you now know</h2>
        <ul className="list-none space-y-2 my-6">
          {[
            "Tokens are the actual unit LLMs process — not words, not characters",
            "BPE tokenizers split text into ~50K reusable chunks",
            "Non-English text and rare words cost more tokens",
            "You must count tokens BEFORE hitting the API, not after",
            "In Spring Boot: inject TokenCountEstimator as a singleton bean and truncate proactively",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mt-0.5 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Up next</div>
          <h3 className="text-xl font-bold mb-2">Module 2: Supervised learning foundations</h3>
          <p className="text-sm opacity-90 mb-4">
            Now that you know what a token IS, we&apos;ll look at how the model learns what to DO with them. We&apos;ll cover regression, loss functions, and gradient descent — using intuition, not heavy math.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses/ai/modules/ml-basics"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium text-sm hover:bg-indigo-50 transition"
            >
              Start Module 2 →
            </Link>
            <Link
              href="/courses/ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition"
            >
              ← All modules
            </Link>
          </div>
        </div>
      </footer>
        <ModuleNav courseId="ai" currentSlug="tokenization" />
    </article>
  );
}

function NumberedPoint({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 border-2 border-indigo-400 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
        {n}
      </div>
      <div>
        <div className="font-semibold mb-1">{title}</div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">{children}</p>
      </div>
    </div>
  );
}
