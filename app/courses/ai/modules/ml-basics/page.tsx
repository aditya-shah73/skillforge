import Link from "next/link";
import Quiz from "@/components/Quiz";
import LineFitDemo from "@/components/LineFitDemo";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import TestYourself from "@/components/TestYourself";
import WorkedExample from "@/components/WorkedExample";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import PartRecap from "@/components/PartRecap";
import CodeExercise from "@/components/CodeExercise";
import { getModuleBySlug } from "@/lib/modules";

const CHECKPOINTS = [
  { id: "learning", title: "What 'learning' actually means" },
  { id: "problem-types", title: "Regression vs classification" },
  { id: "anatomy", title: "Anatomy of a supervised problem" },
  { id: "linear-regression", title: "Linear regression by hand" },
  { id: "loss", title: "Loss functions deep dive" },
  { id: "java-project", title: "Project: regression in Java" },
  { id: "final", title: "Final quiz" },
];

export default function MLBasicsModule() {
  const mod = getModuleBySlug("ml-basics")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Supervised learning foundations</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Problem types, features, labels, loss — slow, deep, with worked examples.
        </p>
        <ModuleProgress moduleSlug="ml-basics" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          By the end of this module, for <em>every</em> concept below, you should be able to do three things:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li><strong>Explain it</strong> out loud in 2 minutes to a friend over coffee.</li>
          <li><strong>Recognize it</strong> when you see it in real code (Python, Java, whatever).</li>
          <li><strong>Implement a toy version</strong> of it from scratch in Java.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          Throughout the module, you&apos;ll see orange &quot;Confidence check&quot; boxes. Use them. If you can&apos;t hit all three bars on a concept, re-read that section — don&apos;t let it slip.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: WHAT "LEARNING" MEANS                                      */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="learning" title="What 'learning' actually means" xp={20} celebration="You get it: ML is programming-by-example. Let's go deeper.">
      <section>
        <h2>Part 1: What &quot;learning&quot; actually means</h2>

        <h3>Start with an analogy: the real-estate agent</h3>
        <p>
          Picture a real-estate agent who&apos;s been working the same zip code for 20 years. You drive her past a house — she glances at it and says &quot;about $485K.&quot; You ask how she knows. She shrugs: <em>&quot;I&apos;ve just seen thousands of them.&quot;</em>
        </p>
        <p>
          She can&apos;t write down the rule. There&apos;s no formula in her notebook. But somewhere in her head, she&apos;s absorbed a pattern from thousands of <strong>examples</strong> — size, location, year, condition — and learned to map them onto a number.
        </p>
        <p>
          <strong>That&apos;s what a machine learning model does.</strong> Except instead of 20 years and a brain, we use a pile of data and some math. The goal is identical: take a bunch of past examples where we know the answer, and end up with something that can give good answers on new, unseen inputs.
        </p>

        <Callout variant="insight" title="Programming, inverted">
          <p className="mb-2">
            <strong>Traditional programming:</strong> you write rules. Computer applies them to inputs to produce outputs.
          </p>
          <p className="m-0">
            <strong>Machine learning:</strong> you provide inputs and outputs. Computer figures out the rules.
          </p>
        </Callout>

        <h3>Three flavors of learning</h3>

        <p>
          When people say &quot;machine learning,&quot; they&apos;re almost always talking about one of three setups. The difference is <strong>what kind of feedback the model gets while learning</strong>.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 my-6 not-prose">
          <FlavorCard
            icon="🎓"
            name="Supervised"
            tagline="Learns from examples WITH answers."
            color="emerald"
            example="Given 10,000 past house sales (features + actual price), learn to predict price for new houses."
            signature="Dataset is rows of (input, correct output)."
            examples="Spam filters. Price prediction. Image classification. Most LLM fine-tuning."
          />
          <FlavorCard
            icon="🔍"
            name="Unsupervised"
            tagline="Learns patterns from data WITHOUT answers."
            color="amber"
            example="Given 10,000 customer records (no labels), group customers into 5 clusters that behave similarly."
            signature="Dataset is rows of inputs only — no 'correct' output."
            examples="Customer segmentation. Anomaly detection. Topic modeling. Embeddings."
          />
          <FlavorCard
            icon="🕹️"
            name="Reinforcement"
            tagline="Learns from rewards and punishments."
            color="violet"
            example="Learn to play chess by playing millions of games against yourself, scored by win/loss."
            signature="No dataset — an environment that gives rewards for actions."
            examples="Game-playing bots (AlphaGo). Robotics. RLHF (the 'HF' in ChatGPT training)."
          />
        </div>

        <p>
          This module — and the next one — focus on <strong>supervised learning</strong>. It&apos;s the workhorse, it&apos;s what you&apos;ll interact with most often as a full-stack engineer, and every other flavor shares the same core ideas of loss and optimization.
        </p>

        <Callout variant="info" title="Where do LLMs fit?">
          <p className="m-0">
            The big secret: LLMs like Claude are trained <em>supervised</em> (next-token prediction on internet text is just a giant classification problem — &quot;given these 2000 tokens, which is the 2001st?&quot;), then fine-tuned with <em>reinforcement</em> learning from human feedback (RLHF) to be helpful. So they touch two of the three flavors. We&apos;ll demystify that in Module 6.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="A teammate says: 'I'm training a model by giving it millions of product photos with no labels and letting it figure out which products look similar.' Which flavor is this?"
          options={[
            { label: "Supervised — the photos are the labels.", explanation: "No. The photos are the inputs. In supervised learning you need a separate ground-truth answer per input." },
            { label: "Unsupervised — there are no labels, just inputs; the model finds structure.", correct: true, explanation: "Right. 'No labels, find structure' is the unsupervised signature. This is exactly how image embedding models get trained." },
            { label: "Reinforcement — the model gets rewarded for matching similar products.", explanation: "No — there's no environment, no action, no reward signal here, just a dataset of images." },
            { label: "Can't tell without more info.", explanation: "You actually have enough: no labels → unsupervised. That's the whole test." },
          ]}
        />

        <h3>Try it: spot the flavor</h3>

        <ClassifyChallenge
          title="Which flavor is each setup?"
          prompt="For each task, pick the type of learning it needs. Trust the signature — does the training data have answers?"
          buckets={[
            { id: "sup", label: "Supervised", color: "emerald" },
            { id: "uns", label: "Unsupervised", color: "amber" },
            { id: "rl", label: "Reinforcement", color: "violet" },
          ]}
          items={[
            {
              id: "spam",
              label: "A Gmail spam filter trained on 1M past emails, each labeled 'spam' or 'not spam' by users.",
              answer: "sup",
              explanation: "Every training example has both the email (input) AND the correct label. Classic supervised.",
            },
            {
              id: "cluster",
              label: "Group 50,000 Intuit customers into 'similar behavior' buckets — no one has tagged the 'right' groups.",
              answer: "uns",
              explanation: "No labels. The algorithm discovers structure on its own — this is clustering, a core unsupervised task.",
            },
            {
              id: "chess",
              label: "Train a chess engine by having two copies play each other millions of times; score each game by who won.",
              answer: "rl",
              explanation: "No pre-labeled dataset. The 'signal' is the game outcome — a reward after a sequence of actions. Classic RL.",
            },
            {
              id: "tax",
              label: "Given a past tax return (features like income, deductions) + whether the IRS audited it, predict audit risk for a new return.",
              answer: "sup",
              explanation: "Pairs of (features, known outcome). Supervised classification.",
            },
            {
              id: "anomaly",
              label: "Flag credit-card transactions that look unusual compared to a user's history — no one tells you what 'fraud' looks like in advance.",
              answer: "uns",
              explanation: "You're finding outliers in a distribution with no labels. That's unsupervised anomaly detection.",
            },
            {
              id: "robot",
              label: "A robot learns to walk by trying random movements; it gets +1 for staying upright each second and −10 for falling.",
              answer: "rl",
              explanation: "Reward signal (+1 / −10) for actions over time, no labeled correct-move dataset. RL.",
            },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="ML comes in three flavors — the difference is what feedback the model gets."
          points={[
            {
              takeaway: "Supervised: every training example comes with the correct answer.",
              detail: <>You feed in <code>(features, label)</code> pairs — 10,000 past house sales <em>plus</em> what they sold for — and the model learns the mapping. Spam filters, price prediction, image classification, and (mostly) LLMs all fit here.</>,
            },
            {
              takeaway: "Unsupervised: only inputs, no answers — the model finds structure.",
              detail: <>No labels. The model discovers groupings, similarities, or compressed representations on its own. Think clustering customers, embedding search, anomaly detection.</>,
            },
            {
              takeaway: "Reinforcement: no dataset — an agent acts, gets rewards, repeats.",
              detail: <>Instead of labeled examples, there&apos;s an environment that returns a reward signal. Game-playing bots, robotics, and the RLHF step in LLM training work this way.</>,
            },
            {
              takeaway: "The giveaway is the shape of the data, not the algorithm name.",
              detail: <>If you see <code>(x, y)</code> pairs → supervised. If you see just <code>x</code> and words like <code>KMeans</code> / <code>cosine_similarity</code> → unsupervised. If you see <code>env.step(action)</code> or <code>reward</code> → reinforcement.</>,
            },
            {
              takeaway: "The rest of this module is about supervised learning — it's where 90% of production ML lives.",
              detail: <>Once you understand supervised learning well, the other two become easy extensions: unsupervised = supervised without labels; RL = supervised with delayed, noisy labels (rewards).</>,
            },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 2: REGRESSION VS CLASSIFICATION                                */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="problem-types" title="Regression vs classification" xp={25} celebration="You can tell regression and classification apart by the shape of the output. That's 80% of the skill.">
      <section>
        <h2>Part 2: Regression vs classification</h2>

        <p>
          Inside supervised learning, there are two big families of problem. The difference is one single thing: <strong>what kind of thing are you predicting?</strong>
        </p>

        <h3>Analogy: the thermostat vs the light switch</h3>

        <p>
          A <strong>thermostat</strong> outputs a temperature — some number on a continuous scale. 68.3°F. 71.4°F. 72.0°F. There&apos;s a whole smooth range of valid answers, and answers close to the right one are <em>almost</em> right.
        </p>
        <p>
          A <strong>light switch</strong> outputs one of two states: on or off. There&apos;s nothing &quot;in between.&quot; Either you&apos;re right or you&apos;re wrong — no &quot;close enough.&quot;
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-6 not-prose">
          <div className="rounded-xl border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌡️</span>
              <h4 className="font-bold text-sky-900 dark:text-sky-200 m-0">Regression</h4>
            </div>
            <p className="text-sm text-sky-950 dark:text-sky-100 m-0 mb-2">
              <strong>Output is a number</strong> on a continuous scale.
            </p>
            <ul className="text-xs text-sky-900 dark:text-sky-200 list-disc ml-4 space-y-1 m-0">
              <li>House price ($425,000)</li>
              <li>Tomorrow&apos;s temperature (73.4°F)</li>
              <li>Time-to-resolve-ticket (4.3 hours)</li>
              <li>Expected revenue next quarter</li>
            </ul>
            <p className="text-xs text-sky-800 dark:text-sky-300 mt-3 italic m-0">
              &quot;How much?&quot; / &quot;How many?&quot; / &quot;How long?&quot;
            </p>
          </div>
          <div className="rounded-xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚦</span>
              <h4 className="font-bold text-rose-900 dark:text-rose-200 m-0">Classification</h4>
            </div>
            <p className="text-sm text-rose-950 dark:text-rose-100 m-0 mb-2">
              <strong>Output is a category</strong> from a fixed set.
            </p>
            <ul className="text-xs text-rose-900 dark:text-rose-200 list-disc ml-4 space-y-1 m-0">
              <li>Spam / not spam</li>
              <li>Cat / dog / bird</li>
              <li>Ticket priority: P0 / P1 / P2 / P3</li>
              <li>Fraud / not fraud</li>
            </ul>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-3 italic m-0">
              &quot;Which one?&quot; / &quot;Is it X?&quot;
            </p>
          </div>
        </div>

        <Callout variant="warn" title="The trap: numeric labels that aren't really numbers">
          <p className="mb-2">
            A <em>priority level</em> of P0, P1, P2, P3 <em>looks</em> numeric, but it&apos;s really four categories. Predicting &quot;P1.4&quot; is nonsense. This is <strong>classification</strong>, not regression — even though the labels are numbers.
          </p>
          <p className="m-0">
            Rule of thumb: if &quot;halfway between two labels&quot; makes sense (68.5°F is halfway between 68 and 69) → regression. If it doesn&apos;t (halfway between &quot;spam&quot; and &quot;not-spam&quot;?) → classification.
          </p>
        </Callout>

        <h3>Why it matters: the loss function changes</h3>

        <p>
          The whole reason we make this distinction is that <strong>these two problems use different loss functions and different model outputs</strong>, so you have to know which one you&apos;re solving before you can even write the training code.
        </p>

        <div className="overflow-x-auto my-5 not-prose">
          <table className="text-sm w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="text-left p-2 border border-slate-300 dark:border-slate-700"></th>
                <th className="text-left p-2 border border-slate-300 dark:border-slate-700 text-sky-800 dark:text-sky-300">Regression</th>
                <th className="text-left p-2 border border-slate-300 dark:border-slate-700 text-rose-800 dark:text-rose-300">Classification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Model output</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">a single number</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">probabilities over K classes</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950">
                <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Main loss</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">MSE (mean squared error)</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">Cross-entropy loss</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Main metric</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">RMSE, R²</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">Accuracy, F1, precision/recall</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950">
                <td className="p-2 border border-slate-300 dark:border-slate-700 font-semibold">Final layer</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">linear (raw number)</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700">softmax / sigmoid (probability)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 italic">
          We cover metrics and losses in detail later in this module and the next. For now, just absorb: <strong>different problem type → different machinery</strong>.
        </p>

        <Quiz
          kind="Pin it down"
          question="You open a model file and see: final layer = softmax over 10 units, loss = categorical cross-entropy. What kind of problem is this?"
          options={[
            { label: "Regression — cross-entropy is just a fancy squared error.", explanation: "No. Cross-entropy and MSE are different beasts. Cross-entropy is the signature of classification." },
            { label: "Multi-class classification — softmax over 10 classes and cross-entropy loss are the canonical pair.", correct: true, explanation: "Exactly. Softmax → probabilities over K classes → classification. 10 units = 10 classes. MNIST digit classification looks exactly like this." },
            { label: "Binary classification — 10 is the number of input features.", explanation: "The 10 is on the output layer, not input. Output = 10 means 10 classes to pick from." },
            { label: "Reinforcement learning — softmax picks the best action.", explanation: "Softmax can be used in RL policy networks, but the presence of a fixed cross-entropy loss on labels points at supervised classification." },
          ]}
        />

        <h3>Two sneaky gotchas</h3>

        <Callout variant="info" title="Binary vs multi-class classification">
          <p className="m-0">
            Classification with 2 classes (spam/not-spam) is called <strong>binary classification</strong>. With 3+ classes it&apos;s <strong>multi-class</strong>. With more than one label per example (a photo that&apos;s BOTH &quot;cat&quot; and &quot;indoor&quot;) it&apos;s <strong>multi-label</strong>. Same core idea, the loss and output layer change slightly.
          </p>
        </Callout>

        <Callout variant="info" title="You can sometimes convert between them — carefully">
          <p className="m-0">
            You <em>could</em> phrase &quot;predict user rating 1–5&quot; as regression (output: a float like 3.7) or classification (output: which of 5 buckets). Both work; they optimize slightly different things. Regression cares about &quot;close to right&quot;; classification cares about &quot;exactly right.&quot; Pick based on what your downstream consumer actually needs.
          </p>
        </Callout>

        <h3>Try it: regression or classification?</h3>

        <ClassifyChallenge
          title="Which type of problem?"
          prompt="For each task, decide: is the output a number on a smooth scale, or one of a fixed set of categories?"
          buckets={[
            { id: "reg", label: "Regression", color: "sky" },
            { id: "cls", label: "Classification", color: "rose" },
          ]}
          items={[
            {
              id: "price",
              label: "Predict the resale price of a used iPhone given its model, age, and condition.",
              answer: "reg",
              explanation: "Price is a continuous number — $312.45 is a valid prediction, and being off by $20 is meaningfully closer than being off by $200.",
            },
            {
              id: "churn",
              label: "Will this subscriber cancel next month? Yes or no.",
              answer: "cls",
              explanation: "Two buckets: churn / stay. Binary classification.",
            },
            {
              id: "eta",
              label: "Estimate the time (in minutes) an Uber ride will take.",
              answer: "reg",
              explanation: "Minutes is a continuous number. 13.5 min is valid. Regression.",
            },
            {
              id: "breed",
              label: "From a dog photo, predict which of 120 breeds it is.",
              answer: "cls",
              explanation: "Output is one of 120 fixed categories. Multi-class classification.",
            },
            {
              id: "ctr",
              label: "Predict the probability (0 to 1) that a user will click this ad.",
              answer: "cls",
              explanation: "Tricky! The OUTPUT is a number between 0 and 1, but it's the probability of a CLASS (click / no-click). This is binary classification that happens to be reported as a probability. Under the hood: cross-entropy loss, sigmoid output, class labels {0, 1}.",
            },
            {
              id: "severity",
              label: "Bug severity: 'critical', 'high', 'medium', 'low'.",
              answer: "cls",
              explanation: "Four fixed categories. Classification — even though they have an order. (For ordered categories there's a specialty called 'ordinal regression' that sits between the two, but start by treating it as classification.)",
            },
            {
              id: "stock",
              label: "Predict tomorrow's closing price of AAPL stock.",
              answer: "reg",
              explanation: "Dollar amount on a continuous scale. Regression. (Whether you can predict it well is another story — markets are noisy.)",
            },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Regression predicts a number; classification picks a category. The shape of the output decides everything downstream."
          points={[
            {
              takeaway: "Regression = continuous number. Classification = one of a fixed set of labels.",
              detail: <>If &quot;halfway between two answers&quot; makes sense (68.5°F between 68 and 69) it&apos;s regression. If it doesn&apos;t (&quot;half-spam&quot;) it&apos;s classification.</>,
            },
            {
              takeaway: "The problem type forces your loss, final layer, and metric.",
              detail: <>Regression → MSE loss, single scalar output, RMSE/R² metrics. Classification → cross-entropy loss, softmax over K outputs, accuracy/F1/precision/recall metrics. Pick the wrong pair and the model can&apos;t learn.</>,
            },
            {
              takeaway: "Categories with numeric-looking labels (P0/P1/P2, star ratings) are still classification.",
              detail: <>The test is whether the distance between labels is meaningful. &quot;P1.5&quot; and &quot;3.7 stars&quot; don&apos;t exist. Ordered categories have a specialty called ordinal regression, but default to classification.</>,
            },
            {
              takeaway: "Probability outputs (0.0–1.0) are usually classification too.",
              detail: <>A CTR predictor outputs a number in [0, 1], but that number is &quot;P(click)&quot; — a probability over two classes (click / no-click). Loss is cross-entropy, not MSE. The output <em>looks</em> continuous but the target is categorical.</>,
            },
            {
              takeaway: 'Pinning down "regression or classification?" is the first thing you do on any new ML problem.',
              detail: <>Before you pick a model, before you touch data — you answer this question. It determines every other design choice, so getting it wrong wastes weeks.</>,
            },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 3: ANATOMY OF A SUPERVISED PROBLEM                            */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="anatomy" title="Anatomy of a supervised problem" xp={25} celebration="Features, labels, splits — the language of every ML codebase.">
      <section>
        <h2>Part 3: Anatomy of a supervised problem</h2>

        <p>
          Every supervised ML problem has the same five parts. Once you can name them in someone else&apos;s codebase, you can read any ML tutorial without being lost.
        </p>

        <h3>Analogy: studying for an exam</h3>

        <p>You have three piles of practice problems:</p>
        <ul>
          <li><strong>Training set:</strong> the problems you grind through over and over, with the answer key visible. This is how you learn.</li>
          <li><strong>Validation set:</strong> mock exams — you don&apos;t peek at answers while solving, you use your score to tune <em>how</em> you&apos;re studying (more flashcards? more sleep?).</li>
          <li><strong>Test set:</strong> the real exam. You see it once. The grade is your honest performance on unseen questions.</li>
        </ul>
        <p>
          If you studied by memorizing the training problems exactly, you&apos;d ace training but bomb the test. That&apos;s <strong>overfitting</strong> — and it&apos;s why we split our data. (Deep-dive on overfitting is in Module 3.)
        </p>

        <h3>The six-part anatomy</h3>

        <div className="grid sm:grid-cols-2 gap-3 my-5 not-prose">
          <AnatomyCard n={1} title="Features (X)" color="rose">
            The inputs. The stuff you measure about each example and hand to the model.
            <div className="mt-2 text-xs opacity-80 font-mono">
              house → {"{"}size, bedrooms, zip, year_built{"}"}
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              Also called: inputs, predictors, independent variables, X.
            </div>
          </AnatomyCard>
          <AnatomyCard n={2} title="Label (y)" color="amber">
            The output you&apos;re trying to predict. The &quot;right answer&quot; for training examples.
            <div className="mt-2 text-xs opacity-80 font-mono">
              house → price: $425,000
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              Also called: target, ground truth, dependent variable, y.
            </div>
          </AnatomyCard>
          <AnatomyCard n={3} title="Training set" color="emerald">
            ~70–80% of your data. Features + labels, both visible. The model studies this.
            <div className="mt-2 text-xs opacity-80 font-mono">
              [(X₁, y₁), (X₂, y₂), ..., (Xₙ, yₙ)]
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              Gradient descent runs against this pile.
            </div>
          </AnatomyCard>
          <AnatomyCard n={4} title="Validation set" color="sky">
            ~10–15%. Used <em>during</em> training to pick hyperparameters (model size, learning rate) without touching the test set.
            <div className="mt-2 text-xs opacity-80 font-mono">
              (same shape, different rows)
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              Also called: dev set.
            </div>
          </AnatomyCard>
          <AnatomyCard n={5} title="Test set" color="indigo">
            ~10–15%. Touched ONCE, at the very end. This is your honest report of model quality.
            <div className="mt-2 text-xs opacity-80 font-mono">
              (same shape, different rows)
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              Never tune against this — it corrupts the benchmark.
            </div>
          </AnatomyCard>
          <AnatomyCard n={6} title="Model + weights" color="violet">
            The function that maps X → prediction. Plus its tunable numbers (weights) that training updates.
            <div className="mt-2 text-xs opacity-80 font-mono">
              ŷ = f(X; w, b)
            </div>
            <div className="mt-1 text-xs opacity-70 italic">
              &quot;ŷ&quot; (y-hat) is a prediction; &quot;y&quot; without a hat is the truth.
            </div>
          </AnatomyCard>
        </div>

        <Quiz
          kind="Gotcha check"
          question="A teammate reports 99% accuracy on a fraud model. You ask how they split the data, and they say: 'I tuned on the test set until accuracy was as high as possible.' What's wrong?"
          options={[
            { label: "Nothing — if the test accuracy is high, the model is good.", explanation: "No. The test set is your ONE honest measurement. Tuning against it leaks test info into your choices, so the number stops being honest." },
            { label: "They should have used more training data.", explanation: "Maybe, but that's not the core problem here." },
            { label: "They used the test set as a validation set — the reported accuracy is no longer a trustworthy estimate of real-world performance.", correct: true, explanation: "Right. When you tune against a set, you're fitting to it. That's what validation is for. The test set must be untouched until the very end — otherwise the number you report is a lie." },
            { label: "99% is impossibly high for fraud detection.", explanation: "Actually easy — most transactions aren't fraud, so predicting 'not fraud' every time gets ~99%. But that's a separate issue from the split." },
          ]}
        />

        <h3>Notation you&apos;ll see everywhere</h3>
        <CodeBlock lang="plain">{`X     — capital X, the features (usually a matrix: rows = examples, cols = features)
y     — lowercase y, the labels (a vector)
ŷ     — "y-hat", the model's prediction (what f(X) outputs)
n     — number of training examples
d     — number of features per example
w, b  — weights and bias (the parameters we're learning)

Training data shape:   X ∈ ℝ^(n × d),  y ∈ ℝ^n
One prediction:        ŷᵢ = f(Xᵢ; w, b)
Goal:                  make ŷᵢ ≈ yᵢ  for all i`}</CodeBlock>
        <p className="text-xs italic">
          You don&apos;t need to memorize Greek — just recognize it. Every ML paper uses these letters.
        </p>

        <h3>Feature engineering: the real work</h3>

        <p>
          Here&apos;s the dirty secret of applied ML: <strong>most of the value comes from picking good features, not from picking a fancy model.</strong>
        </p>
        <p>
          You can throw the world&apos;s best neural network at a house-price problem, but if your only feature is <code>zip_code_first_digit</code>, you&apos;ll be beaten by a middle-schooler with a tape measure. Garbage features → garbage predictions, no matter the model.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 my-5 not-prose">
          <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm">
            <div className="font-bold text-rose-900 dark:text-rose-200 mb-2">❌ Weak features</div>
            <ul className="list-disc ml-4 space-y-1 text-rose-950 dark:text-rose-100">
              <li><code>listing_id</code> (just a database key; no signal)</li>
              <li><code>date_string</code> as raw text (&quot;2026-04-12&quot;)</li>
              <li><code>zip_code</code> as a number (treats 90210 as &quot;larger&quot; than 10001)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">✅ Engineered features</div>
            <ul className="list-disc ml-4 space-y-1 text-emerald-950 dark:text-emerald-100">
              <li><code>size_sqft</code> (raw, but genuinely predictive)</li>
              <li><code>age_at_sale = year_sold − year_built</code> (derived)</li>
              <li><code>zip_code_one_hot[N]</code> (one column per zip — lets model learn each zip&apos;s premium)</li>
              <li><code>price_per_sqft_neighborhood_avg</code> (brings in context)</li>
            </ul>
          </div>
        </div>

        <Callout variant="insight" title="For LLMs, the equivalent is the prompt">
          <p className="m-0">
            You&apos;re not designing features for a regression anymore — but you <em>are</em>{" "}choosing what context to give the model. The prompt, the system message, the retrieved documents, the tool definitions — that&apos;s all &quot;feature engineering for LLMs.&quot; Same principle: great inputs &gt; fancy model.
          </p>
        </Callout>

        <Quiz
          kind="Feature engineering"
          question="You're predicting house prices and your raw data has a 'year_built' column. You're adding an 'age' feature. Which of these is the best choice?"
          options={[
            { label: "age = 2026 (hard-coded current year)", explanation: "This gives every row the same value — zero signal. The model can't learn from a constant." },
            { label: "age = year_sold − year_built", correct: true, explanation: "Right. 'How old was the house when it sold?' is the quantity that actually drives price — not the calendar year it was built in. This is classic feature engineering: derive the thing you actually care about." },
            { label: "age = year_built (just rename the column)", explanation: "Now the model has to learn that '1998' means '28 years old' — possible, but you're making it work harder. Better to compute age directly." },
            { label: "Drop year_built entirely — dates aren't numeric features.", explanation: "Dates ARE great features once you derive the right quantity from them (age, days-since, day-of-week, etc.). Don't throw them away — transform them." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Every supervised problem has the same anatomy. Learn the vocabulary once and you&apos;ll read every ML tutorial without getting lost."
          points={[
            {
              takeaway: "Features (X) are the inputs you measure; the label (y) is what you want to predict.",
              detail: <>For a house: features are size/bedrooms/zip/age; label is sale price. Notation you&apos;ll see everywhere: capital <code>X</code> is all features, lowercase <code>y</code> is all labels, <code>ŷ</code> (y-hat) is the model&apos;s prediction.</>,
            },
            {
              takeaway: "Split your data into train / validation / test — each plays a different role.",
              detail: <>Train = what the model studies. Validation = what you check repeatedly while tuning (knob-twisting data). Test = what you touch <em>once</em>, at the end, for an honest number. A typical split is 70/15/15.</>,
            },
            {
              takeaway: "Never train on data the model will later be tested on.",
              detail: <>That&apos;s called data leakage. The model memorizes the answers and looks brilliant in dev, then flops in production. Keep the test set locked away.</>,
            },
            {
              takeaway: "A model is a function with adjustable weights; training is the process of choosing those weights.",
              detail: <>Before training, weights are random. During training, an algorithm nudges them so the model&apos;s predictions get closer to the real labels. The weights <em>are</em> what a trained model is.</>,
            },
            {
              takeaway: "Feature engineering — picking and shaping the inputs — often matters more than the model.",
              detail: <>A great model on bad features loses to a simple model on great features. For LLMs the equivalent is prompt/context design: what you feed in is the feature engineering.</>,
            },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 4: LINEAR REGRESSION BY HAND                                   */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="linear-regression" title="Linear regression by hand" xp={30} celebration="You've built a real model on paper. Everything else is bigger versions of this.">
      <section>
        <h2>Part 4: Linear regression — on paper</h2>

        <p>
          We&apos;ve been throwing around the phrase &quot;a model predicts.&quot; Time to pick the simplest real model and see every moving part, slowly, with a pencil.
        </p>

        <h3>The formula</h3>

        <p>Linear regression with one feature is the equation of a line:</p>

        <CodeBlock lang="plain">{`ŷ = w · x + b
//  ↑    ↑   ↑
//  |    |   bias (intercept) — where the line crosses the y-axis
//  |    feature value (the input we measure)
//  weight (slope) — how much ŷ changes per unit of x`}</CodeBlock>

        <p>
          That&apos;s it. The entire model is two numbers: <code>w</code> (the slope) and <code>b</code> (the intercept). Training = finding good values for these two numbers.
        </p>

        <Callout variant="insight" title="Why bother with something this simple?">
          <p className="m-0">
            Linear regression is the hydrogen atom of ML. Once you understand it deeply, every more complex model is just a variation: logistic regression adds a sigmoid, neural nets stack many of these with non-linearities in between, transformers are fancy arrangements of them with attention. The update rule in this tiny model is the <em>same</em> update rule used in GPT-4 training.
          </p>
        </Callout>

        <h3>Multi-feature version</h3>

        <p>
          With multiple features it generalizes cleanly. If we have <code>d</code> features, we have <code>d</code> weights:
        </p>

        <CodeBlock lang="plain">{`ŷ = w₁·x₁ + w₂·x₂ + ... + w_d·x_d + b

For a house with features [size, bedrooms, age]:

ŷ = 46·size + 12·bedrooms − 1.5·age + 90

    ↑        ↑              ↑         ↑
    "$46k per extra         "$1.5k    "the base
     1000 sqft"             penalty    price if
                            per year   all features
                            of age"    are zero"`}</CodeBlock>

        <p>
          Each weight has a clean interpretation: <em>&quot;holding everything else fixed, adding one more unit of this feature changes the prediction by this much.&quot;</em> (Linear models are often called &quot;interpretable&quot; for exactly this reason — you can read the weights.)
        </p>

        <Quiz
          kind="Read the formula"
          question={"A trained linear regression model gives ŷ = 46·size + 12·bedrooms − 1.5·age + 90. For a house with size=2 (thousand sqft), 3 bedrooms, age=10 years, what does the model predict?"}
          options={[
            { label: "$90k", explanation: "That's just the bias b. You forgot to add the weighted feature contributions." },
            { label: "$203k", correct: true, explanation: "46·2 + 12·3 − 1.5·10 + 90 = 92 + 36 − 15 + 90 = 203. You're reading the formula right." },
            { label: "$218k", explanation: "Close — did you forget the minus sign on the age term? It's a penalty, not a bonus." },
            { label: "$250k", explanation: "Too high — double-check each term, especially the age contribution." },
          ]}
        />

        <h3>So what <em>is</em> a trained model, on disk?</h3>

        <p>
          We&apos;ve been saying &quot;the model is <code>w</code> and <code>b</code>&quot; a lot. Let&apos;s make that physical. A trained model, on disk, is <strong>literally a file full of floating-point numbers</strong>. That&apos;s it. No magic.
        </p>

        <p>For our 3-feature house model:</p>

        <CodeBlock lang="plain">{`Weights (4 numbers — 3 for the features, 1 for the bias):

  w[0] = 46.0      ← slope for "size"
  w[1] = 12.0      ← slope for "bedrooms"
  w[2] = -1.5      ← slope for "age"
  b    = 90.0      ← bias

On disk, at 8 bytes per double:  4 × 8 = 32 bytes.
(Yes. The entire "trained model" for this problem fits in 32 bytes.)`}</CodeBlock>

        <p>
          Save those four numbers to a file and your model is &quot;deployed.&quot; Load them back up and you can predict forever. <em>Training</em> is the process that chooses the specific values; <em>the model</em> is the chosen values.
        </p>

        <Callout variant="insight" title="This scales all the way up to GPT-4">
          <p className="m-0 mb-2">
            Every ML model you&apos;ve heard of works this way — just with more numbers. A rough ladder:
          </p>
          <ul className="list-disc ml-5 space-y-1 m-0 text-sm">
            <li><strong>Linear regression (1 feature):</strong> 2 numbers. ~16 bytes.</li>
            <li><strong>Spam classifier on 1000 word features:</strong> ~1,001 numbers. ~8 KB.</li>
            <li><strong>Small image model (ResNet-18):</strong> ~11 million parameters. ~44 MB.</li>
            <li><strong>Llama 3 8B:</strong> 8 billion parameters. ~16 GB at float16 (2 bytes each).</li>
            <li><strong>GPT-4 (estimated):</strong> ~1.7 trillion parameters. Roughly 800 GB+, split across many GPUs.</li>
          </ul>
          <p className="m-0 mt-2">
            Same idea at every scale: train, save the numbers, load, multiply. The numbers get bigger. The concept doesn&apos;t change.
          </p>
        </Callout>

        <Callout variant="info" title="Why this matters for you as an engineer">
          <p className="m-0 mb-2">
            A lot of practical ML engineering is just consequences of &quot;a model is a pile of floats.&quot; Examples you&apos;ll hit later in this course:
          </p>
          <ul className="list-disc ml-5 space-y-1 m-0 text-sm">
            <li><strong>Model files live in S3 / artifact stores</strong>, not in your git repo. They&apos;re big binary blobs.</li>
            <li><strong>Loading is slow</strong> (hundreds of MB → minutes). Always do it once at startup, never per-request. That&apos;s why our Spring service puts it behind an <code>@Bean</code>.</li>
            <li><strong>Inference is memory-bound.</strong> A 16 GB model can&apos;t fit on a laptop GPU. This is why &quot;quantization&quot; (store floats as 4-bit ints instead of 16-bit floats) is a huge deal — it shrinks the file 4×.</li>
            <li><strong>A &quot;fine-tuned model&quot; is just the original weights with small adjustments.</strong> LoRA fine-tuning means &quot;only adjust a few million numbers out of the billions, save just those.&quot;</li>
          </ul>
        </Callout>

        <Quiz
          kind="Scale check"
          question="A teammate asks you to check a linear model into git — the file is 240 MB. What's your reaction?"
          options={[
            { label: "Sounds fine — Java JARs can be that big.", explanation: "Git tracks text diffs well and binary blobs poorly. Checking a 240 MB binary in will bloat every clone of the repo forever, because git keeps the full history of every version." },
            { label: "240 MB is way too big for a linear model — something's wrong. Linear regression with a million features is only ~8 MB.", correct: true, explanation: "Right. 240 MB of doubles = ~30 million weights. That's the scale of a small neural net, not a linear model. Either the 'linear' claim is wrong, or the file has extra stuff (sample data, checkpoints, embeddings) that shouldn't be there." },
            { label: "Use Git LFS and move on.", explanation: "Git LFS is the right move for legitimately big models — but first investigate why a linear model is this size. It almost certainly shouldn't be." },
            { label: "Models always belong in git so they're versioned with the code.", explanation: "Common misconception. Models belong in an artifact store (S3, model registry) with a version pointer in the code. Putting a 240 MB blob in git history is a long-term tax on the whole team." },
          ]}
        />

        <h3>Worked example: fitting a line with 3 data points</h3>

        <p>Let&apos;s do it by hand. Tiny dataset — three houses:</p>

        <CodeBlock lang="plain">{`house   size (1000 sqft)   price ($k)
  A           1                150
  B           2                200
  C           3                250`}</CodeBlock>

        <WorkedExample
          title="Fit a line to 3 houses"
          subtitle="We'll guess a line, measure how wrong it is, then guess a better one."
          steps={[
            {
              title: "Guess a starting line",
              body: (
                <>
                  <p>Every training run starts with a guess. Let&apos;s try <code className="font-mono">ŷ = 30·x + 50</code> — slope 30, intercept 50.</p>
                  <p>Compute the prediction for each house:</p>
                  <CodeBlock lang="plain">{`A:  ŷ = 30·1 + 50 =  80    (truth 150) → off by  70
B:  ŷ = 30·2 + 50 = 110    (truth 200) → off by  90
C:  ŷ = 30·3 + 50 = 140    (truth 250) → off by 110`}</CodeBlock>
                  <p>This line is <em>under</em>-predicting all three. The slope is too shallow, and the intercept is too low.</p>
                </>
              ),
            },
            {
              title: "Measure how wrong (MSE)",
              body: (
                <>
                  <p>Take each error, square it, average:</p>
                  <CodeBlock lang="plain">{`errors:  +70, +90, +110
squared: 4900, 8100, 12100
sum:     25100
MSE:     25100 / 3  ≈ 8367`}</CodeBlock>
                  <p>That&apos;s a big number. We want to drive it toward zero. (In dollars-squared units — a quirk of MSE we&apos;ll discuss in Part 5.)</p>
                </>
              ),
            },
            {
              title: "Try a better line",
              body: (
                <>
                  <p>The errors are positive and growing with x — the line needs a steeper slope. Let&apos;s try <code className="font-mono">ŷ = 50·x + 100</code>:</p>
                  <CodeBlock lang="plain">{`A:  ŷ = 50·1 + 100 = 150    (truth 150) → off by 0
B:  ŷ = 50·2 + 100 = 200    (truth 200) → off by 0
C:  ŷ = 50·3 + 100 = 250    (truth 250) → off by 0
MSE: 0  ← perfect fit!`}</CodeBlock>
                  <p>Our three points happened to be exactly on a line (y = 50x + 100), so a perfect fit exists. Real data is never this clean — you&apos;ll always have some residual loss.</p>
                </>
              ),
            },
            {
              title: "What did we just do?",
              body: (
                <>
                  <p>Zoom out. We:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Chose a family of models (lines: <code>ŷ = w·x + b</code>).</li>
                    <li>Picked starting weights (30, 50) — any guess works.</li>
                    <li>Measured loss on the training set (MSE = 8367).</li>
                    <li>Tweaked the weights to reduce loss (→ 50, 100).</li>
                    <li>Measured again (MSE = 0 → done).</li>
                  </ol>
                  <p>
                    In this module we&apos;re doing step 4 by eyeballing. <strong>In Module 3 we&apos;ll automate step 4</strong> with gradient descent — a formula that tells you exactly which direction to nudge <em>w</em> and <em>b</em> to reduce loss.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Quiz
          kind="Worked-example check"
          question="In the worked example above, the first guess (ŷ = 30x + 50) had errors of +70, +90, +110 on the three houses. What would the MAE (mean absolute error) have been, compared to the MSE of ~8367?"
          options={[
            { label: "Around 90 (the average of 70, 90, 110).", correct: true, explanation: "Right. MAE = (|70| + |90| + |110|) / 3 = 270/3 = 90. It's in the same units as price ($k), which is why MAE is easier to interpret. MSE = 8367 is in (price²) units — hard to eyeball." },
            { label: "Around 8367, same as MSE.", explanation: "MSE squares the errors first; MAE just averages absolute values. They give very different numbers." },
            { label: "Around 25100, the sum of squared errors.", explanation: "That's the sum of squared errors before dividing. MAE doesn't square anything." },
            { label: "0 — MAE is always 0 when the model is underfitting.", explanation: "MAE is 0 only when predictions exactly match truth. The model is very wrong here, so MAE is very much not 0." },
          ]}
          hint="MAE = average of the absolute errors. No squaring."
        />

        <h3>Now try it yourself</h3>

        <p>
          Below is the 10-house dataset you&apos;ll see again in the Java project. Slide <code>m</code> (slope) and <code>b</code> (intercept) until your line fits the cloud of points and loss drops below the threshold. There&apos;s an easter egg if you find the fit by hand.
        </p>

        <LineFitDemo />

        <Callout variant="info" title="The sliders are you being gradient descent">
          <p className="m-0">
            When you move a slider and watch the loss number drop, you&apos;re doing exactly what a gradient descent algorithm does — just with your eyes as the gradient sensor. Module 3 will replace you with math.
          </p>
        </Callout>

        <TestYourself
          concept="Linear regression"
          explain={
            <>
              <p><strong>A good 2-minute answer:</strong></p>
              <p>&quot;Linear regression is the simplest supervised model. It predicts a number as a weighted sum of the features, plus a bias: <code>ŷ = w·x + b</code> for one feature, or <code>ŷ = w₁x₁ + w₂x₂ + ... + b</code> for many. Each weight is how much the prediction changes if you bump that feature by one unit, holding the rest fixed — so the model is easy to interpret. Training means finding values of <code>w</code> and <code>b</code> that minimize the loss (usually MSE) over the training set. If the data really does lie on a line, linear regression nails it; if it doesn&apos;t, linear regression underfits, and you reach for something curvier. But it&apos;s always the first model I&apos;d try on a new tabular problem — it&apos;s fast, interpretable, and gives you a baseline to beat.&quot;</p>
            </>
          }
          recognize={
            <>
              <p><strong>Patterns in real code:</strong></p>
              <CodeBlock lang="plain">{`# Python (scikit-learn)
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
model.coef_      # the w's — one per feature
model.intercept_ # the b

# The prediction, for reference:
# model.predict(X) == X @ model.coef_ + model.intercept_`}</CodeBlock>
              <p>And in a neural-net framework:</p>
              <CodeBlock lang="plain">{`# Keras — a linear regression is literally one dense layer, no activation
model = Sequential([
    Dense(1, input_shape=(num_features,))   # output = W·X + b
])
model.compile(loss='mse', optimizer='adam')`}</CodeBlock>
            </>
          }
          implement={
            <>
              <p>Bare-bones Java — the model and its predict function. (Training loop comes in Module 3.)</p>
              <CodeBlock lang="java">{`/** A linear regression model with d features. */
public final class LinearRegression {
    private final double[] w;   // weights, one per feature
    private double b;           // bias / intercept

    public LinearRegression(int numFeatures) {
        this.w = new double[numFeatures];
        this.b = 0.0;
    }

    /** The forward pass:  ŷ = w · x + b */
    public double predict(double[] x) {
        if (x.length != w.length) {
            throw new IllegalArgumentException(
                "Expected " + w.length + " features, got " + x.length);
        }
        double sum = b;
        for (int i = 0; i < w.length; i++) {
            sum += w[i] * x[i];
        }
        return sum;
    }

    // getters/setters for w, b (used by the trainer)
}`}</CodeBlock>
              <p className="text-xs italic">That&apos;s a real ML model. ~15 lines of Java. You&apos;ll flesh it out below.</p>
            </>
          }
        />

        <PartRecap
          title="Part 4 recap"
          gist="Linear regression is two numbers per feature, plus one bias. Training = finding values that minimize loss."
          points={[
            {
              takeaway: "Single-feature: ŷ = w·x + b. Multi-feature: ŷ = w₁·x₁ + w₂·x₂ + ... + b.",
              detail: <>Every prediction is a weighted sum of inputs plus a constant bias. That&apos;s the whole model. For <code>d</code> features, you have <code>d</code> weights and <code>1</code> bias — so <code>d + 1</code> numbers total.</>,
            },
            {
              takeaway: "Each weight is the slope for that feature, holding others fixed.",
              detail: <>If w₁ = 46, then adding 1 unit of x₁ adds 46 to the prediction, no matter what the other features are. This is what makes linear models interpretable: the weights are the story.</>,
            },
            {
              takeaway: "The bias is what the model predicts when all features are zero.",
              detail: <>It shifts the whole function up or down. Without it, the line must pass through the origin — almost never the right fit for real data.</>,
            },
            {
              takeaway: "Training is an optimization problem: pick w and b to minimize MSE.",
              detail: <>You started from a guess, measured MSE, adjusted. Module 3 replaces the adjustment step (gradient descent) with a formula. Everything else — the model, the loss, the idea of iterating — stays the same.</>,
            },
            {
              takeaway: "Linear regression is the hydrogen atom of ML.",
              detail: <>Logistic regression = linear + sigmoid. Neural net = many stacked linear layers with non-linearities in between. Transformer attention = fancy linear combinations. Master this and every harder model becomes a variation on a theme.</>,
            },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 5: LOSS FUNCTIONS DEEP DIVE                                    */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="loss" title="Loss functions deep dive" xp={30} celebration="You now have MSE, MAE, cross-entropy, and Huber in your vocab. That's a big unlock.">
      <section>
        <h2>Part 5: Loss functions — the deep dive</h2>

        <p>
          A loss function is a single number that says &quot;how wrong are we, overall?&quot; It turns the training problem into a simple optimization: <strong>find the weights that make this number as small as possible.</strong>
        </p>

        <h3>What makes a good loss function?</h3>

        <ul>
          <li><strong>Zero when perfect.</strong> If predictions match labels exactly, loss = 0.</li>
          <li><strong>Bigger for worse predictions.</strong> Wrongness should map monotonically to loss.</li>
          <li><strong>Smooth.</strong> A tiny tweak to weights should cause a tiny change to loss, not a jump. (This is what lets gradient descent work — the derivatives have to exist.)</li>
          <li><strong>Matches your cost of wrongness.</strong> If being off by $20k is twice as bad as being off by $10k, you want a loss that reflects that. If being off by $20k is <em>four</em> times as bad, you want a different loss.</li>
        </ul>

        <h3>Loss #1: Mean Squared Error (MSE) — the regression workhorse</h3>

        <CodeBlock lang="plain">{`MSE = (1/n) · Σᵢ (ŷᵢ − yᵢ)²

     n        __________________
    ___     /                    \\²
  1 \\      /                      \\
  _  \\    |  prediction - truth   |
  n  /     \\                     /
    /___    \\___________________/
    i=1`}</CodeBlock>

        <p>Three things are happening here; each deserves a sentence:</p>

        <div className="space-y-3 my-5 not-prose">
          <Tile n={1} title="Subtract: prediction − truth">
            The raw error. Can be positive (over-predicted) or negative (under-predicted).
          </Tile>
          <Tile n={2} title="Square it">
            Flips sign — errors of +5 and −5 both contribute 25. Also <em>super-linearly penalizes big errors</em>: an error of 10 contributes 100 to the sum, but an error of 2 contributes just 4 — twenty-five times less.
          </Tile>
          <Tile n={3} title="Average over all examples">
            Without averaging, your loss would grow with dataset size. The average keeps it comparable across different dataset sizes and training runs.
          </Tile>
        </div>

        <Callout variant="insight" title="Why square specifically? Three reasons.">
          <ul className="list-disc ml-5 space-y-1 m-0">
            <li><strong>Sign problem fixed.</strong> Squares are non-negative, so +5 and −5 don&apos;t cancel.</li>
            <li><strong>Differentiable everywhere.</strong> Unlike <code>|x|</code> (absolute value, which has a kink at zero), <code>x²</code> is smooth — essential for gradient descent.</li>
            <li><strong>Matches the Gaussian assumption.</strong> If you believe the noise in your data is normally distributed (a bell curve), then maximum-likelihood estimation literally gives you MSE. This is why it&apos;s the default.</li>
          </ul>
        </Callout>

        <h3>Loss #2: MAE (Mean Absolute Error) — when outliers shouldn&apos;t rule</h3>

        <CodeBlock lang="plain">{`MAE = (1/n) · Σᵢ |ŷᵢ − yᵢ|`}</CodeBlock>

        <p>
          Same idea, but instead of squaring, we take the <strong>absolute value</strong>. An error of 10 contributes exactly 10 — not 100.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 my-4 not-prose">
          <div className="rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-2">MSE says:</div>
            <p className="text-sky-950 dark:text-sky-100 m-0">
              &quot;One huge error is WORSE than ten medium errors.&quot; Will aggressively avoid big misses, even at the cost of more small ones.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">MAE says:</div>
            <p className="text-emerald-950 dark:text-emerald-100 m-0">
              &quot;All errors count proportionally to their size.&quot; More tolerant of outliers — they don&apos;t dominate the loss.
            </p>
          </div>
        </div>

        <p className="text-xs italic">
          Use MAE when your data has genuine outliers (a few rogue data points) that you don&apos;t want the model to contort itself to fit. Use MSE when every data point is trustworthy and big misses are genuinely costly.
        </p>

        <h3>Loss #3: Huber loss — MSE and MAE&apos;s pragmatic child</h3>

        <CodeBlock lang="plain">{`              ⎧  ½ · (ŷ − y)²                     if |ŷ − y| ≤ δ
Huber(ŷ, y) = ⎨
              ⎩  δ · (|ŷ − y| − ½δ)               otherwise`}</CodeBlock>

        <p>
          Behaves like MSE for small errors (smooth, nice gradients) but like MAE for big errors (doesn&apos;t over-penalize outliers). The hyperparameter <code>δ</code> is the elbow where it switches. This is what scikit-learn&apos;s <code>HuberRegressor</code> uses.
        </p>

        <h3>Loss #4: Cross-entropy — the classification workhorse</h3>

        <p>
          Classification is a different world. Your output isn&apos;t a number you can subtract — it&apos;s a probability distribution across classes. We need a loss that says <em>&quot;how confident was the model in the right answer?&quot;</em>
        </p>

        <CodeBlock lang="plain">{`For binary classification (2 classes):
  CE = −[ y · log(ŷ) + (1−y) · log(1−ŷ) ]

For K-class classification:
  CE = −Σₖ yₖ · log(ŷₖ)      (sum over classes)

Where:
  y  = the true label (1 for the correct class, 0 for others)
  ŷ  = the model's predicted probability for that class`}</CodeBlock>

        <p>
          The key move: <strong>−log(p)</strong>. If the model assigned <code>p = 1.0</code> to the right class, loss = 0. If it assigned <code>p = 0.5</code>, loss ≈ 0.69. If it assigned <code>p = 0.01</code> to the right class (confidently wrong!), loss ≈ 4.6 — much bigger.
        </p>

        <Callout variant="insight" title="Why −log? Because confident-and-wrong should hurt a LOT.">
          <p className="m-0">
            <code>−log(p)</code> blows up as <code>p → 0</code>. A model that says &quot;99% this is spam&quot; about an email that&apos;s NOT spam gets absolutely hammered by cross-entropy. This is exactly what you want — calibrated probabilities. MSE on probabilities doesn&apos;t punish confident-wrong nearly enough.
          </p>
        </Callout>

        <Callout variant="info" title="Cross-entropy is what LLMs minimize">
          <p className="m-0">
            Every token GPT-4 has ever emitted during training was scored with cross-entropy: &quot;given the previous tokens, the correct next token was &apos;cat&apos; — what probability did you assign to &apos;cat&apos;?&quot; The entire trillion-parameter monster is optimizing <em>exactly this loss</em>, across trillions of tokens. Every other LLM trick (attention, transformers, RLHF) is machinery in service of minimizing that one number.
          </p>
        </Callout>

        <h3>Picking the right loss: a cheat sheet</h3>

        <div className="overflow-x-auto my-5 not-prose">
          <table className="text-sm w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="text-left p-2 border border-slate-300 dark:border-slate-700">Situation</th>
                <th className="text-left p-2 border border-slate-300 dark:border-slate-700">Use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-300 dark:border-slate-700">Regression, clean data</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700"><strong>MSE</strong> (default)</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950">
                <td className="p-2 border border-slate-300 dark:border-slate-700">Regression with outliers you don&apos;t trust</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700"><strong>MAE</strong> or <strong>Huber</strong></td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 dark:border-slate-700">Binary classification (spam/not, fraud/not)</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700"><strong>Binary cross-entropy</strong> + sigmoid output</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-950">
                <td className="p-2 border border-slate-300 dark:border-slate-700">Multi-class classification</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700"><strong>Categorical cross-entropy</strong> + softmax output</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-300 dark:border-slate-700">Next-token prediction (LLMs)</td>
                <td className="p-2 border border-slate-300 dark:border-slate-700"><strong>Cross-entropy</strong> over the vocabulary</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Quiz
          kind="Loss-shape thinking"
          question="Model A has MSE = 1.0, Model B has MSE = 1.0 on the same data. Model A had many small errors; Model B had mostly zero errors but a few huge ones. Which observation is correct?"
          options={[
            { label: "They're equivalent — same MSE means same quality", explanation: "Same MSE says they average the same squared-error, but the error distribution matters. And if you switch loss, the ranking can flip." },
            { label: "If you switched to MAE, Model A's error would be HIGHER than B's — because MSE squared B's few huge errors, but MAE only adds them linearly so they get diluted by the many zeros", correct: true, explanation: "Right. Concretely: if A has 100 errors of size 1, then MSE = 1 and MAE = 1. If B has 1 error of size 10 and 99 zeros, then MSE = 100/100 = 1 (matches A) but MAE = 10/100 = 0.1 (much lower than A). MSE squared B's huge error so it dominated; MAE scales linearly so it gets averaged away by the zeros. Same MSE, very different MAE — loss choice changes which model 'wins'." },
            { label: "Under MAE, Model A would look BETTER than B, because MAE penalizes huge errors more than MSE does", explanation: "Backward on two counts. First, MAE penalizes huge errors LESS than MSE, not more — MSE squares them. Second, with the same MSE, A's many medium errors actually sum to MORE absolute error than B's few huge ones (B's get diluted by the zeros), so A looks WORSE under MAE, not better." },
            { label: "Cross-entropy would be a better choice here", explanation: "Cross-entropy is for classification (probabilities), not regression. Doesn't apply to this regression scenario." },
          ]}
        />

        <Quiz
          kind="Cross-entropy intuition"
          question="You're training a binary spam classifier. Your current model outputs probability 0.02 for a true-spam email (so it's confidently saying 'not spam'). What does cross-entropy loss do with that?"
          options={[
            { label: "Assigns a small loss, since 0.02 is close to 0", explanation: "The TRUE label is 1 (spam). The model said 0.02 for spam. It's confidently wrong on the true class." },
            { label: "Assigns a HUGE loss, because −log(0.02) ≈ 3.9 — confident-and-wrong gets hammered", correct: true, explanation: "Exactly. Cross-entropy's −log() term blows up as the predicted probability on the correct class approaches zero. This is the whole reason we prefer it over MSE for probabilities — it aggressively punishes overconfidence on the wrong answer." },
            { label: "Assigns zero loss, because the model is confident", explanation: "Confidence is great — but ONLY when it's right. Confident and wrong is the worst possible state." },
          ]}
        />

        <TestYourself
          concept="Loss functions (MSE, MAE, cross-entropy)"
          explain={
            <>
              <p><strong>A good 2-minute answer:</strong></p>
              <p>&quot;A loss function is a single number that measures how wrong a model is across the whole dataset, and training is just minimizing it. For regression you usually use <strong>mean squared error</strong>: take prediction minus truth, square it, average. Squaring does three things — it kills sign so +5 and −5 don&apos;t cancel, it keeps the function smooth for gradient descent, and it super-linearly punishes big errors. If your data has real outliers you don&apos;t want to chase, switch to <strong>mean absolute error</strong> (no square) or <strong>Huber</strong> (behaves like MSE near zero, MAE far away). For classification you can&apos;t subtract probabilities meaningfully, so you use <strong>cross-entropy</strong>: <code>−log(probability_of_correct_class)</code>. That goes to zero when the model nails it with 100% confidence, and blows up when it&apos;s confidently wrong. LLMs are trained with cross-entropy on next-token prediction — same loss, unthinkably many tokens.&quot;</p>
            </>
          }
          recognize={
            <>
              <p><strong>Code fingerprints:</strong></p>
              <CodeBlock lang="plain">{`# Regression
loss = (y_pred - y_true) ** 2              → MSE
loss = abs(y_pred - y_true)                → MAE
loss = keras.losses.Huber(delta=1.0)       → Huber

# Classification
loss = -sum(y_true * log(y_pred))          → cross-entropy (from scratch)
loss = keras.losses.BinaryCrossentropy()   → binary CE
loss = keras.losses.CategoricalCrossentropy()  → multi-class CE
loss = nn.CrossEntropyLoss()               → PyTorch: CE (with softmax built in)`}</CodeBlock>
            </>
          }
          implement={
            <>
              <p>Three loss functions in Java. Plain arithmetic — no libraries.</p>
              <CodeBlock lang="java">{`public final class Losses {

    // Convention used throughout the course: (y, yHat) — labels first,
    // predictions second. Note that PyTorch's loss_fn(y_pred, y_true) uses
    // the OPPOSITE order, so be careful when porting. We chose (y, yHat)
    // because it reads left-to-right as "ground truth, then your guess at it."

    /** Mean squared error. Regression. Smooth, punishes big errors. */
    public static double mse(double[] y, double[] yHat) {
        check(y, yHat);
        double sum = 0.0;
        for (int i = 0; i < y.length; i++) {
            double err = yHat[i] - y[i];
            sum += err * err;
        }
        return sum / y.length;
    }

    /** Mean absolute error. Regression. Robust to outliers. */
    public static double mae(double[] y, double[] yHat) {
        check(y, yHat);
        double sum = 0.0;
        for (int i = 0; i < y.length; i++) {
            sum += Math.abs(yHat[i] - y[i]);
        }
        return sum / y.length;
    }

    /**
     * Binary cross-entropy. Classification.
     * y[i] ∈ {0, 1}; yHat[i] ∈ (0, 1) = predicted P(class = 1).
     */
    public static double binaryCrossEntropy(double[] y, double[] yHat) {
        check(y, yHat);
        double sum = 0.0;
        double eps = 1e-9;                      // avoid log(0) blowing up
        for (int i = 0; i < y.length; i++) {
            double p = Math.min(Math.max(yHat[i], eps), 1 - eps);
            sum += -(y[i] * Math.log(p)
                   + (1 - y[i]) * Math.log(1 - p));
        }
        return sum / y.length;
    }

    private static void check(double[] a, double[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("length mismatch");
        }
    }
}`}</CodeBlock>
            </>
          }
        />

        <PartRecap
          title="Part 5 recap"
          gist="Loss is the single number training minimizes. The shape of the loss function decides what 'good' looks like to the model."
          points={[
            {
              takeaway: "MSE — average of squared errors — is the regression default.",
              detail: <>Squaring kills sign (so +5 and −5 don&apos;t cancel), keeps the function smooth for gradient descent, and super-linearly punishes big errors. Use this when every data point is trustworthy.</>,
            },
            {
              takeaway: "MAE — average of absolute errors — is more robust to outliers.",
              detail: <>No squaring, so a rogue data point doesn&apos;t dominate the loss. Use this when your data has a few values you don&apos;t fully trust (e.g., sensor glitches, data-entry errors).</>,
            },
            {
              takeaway: "Huber = MSE when small, MAE when big. Best of both.",
              detail: <>Smooth near zero (nice gradients), linear for big errors (resists outliers). Most production regression code reaches for this when things get noisy.</>,
            },
            {
              takeaway: "Cross-entropy is the classification loss. It's −log(p_correct).",
              detail: <>The model outputs a probability for the correct class; cross-entropy is −log of that. Close to 0 when the model is right and confident; blows up when it&apos;s confidently wrong. Every LLM on earth is trained by minimizing this, token by token.</>,
            },
            {
              takeaway: "Match the loss to the problem. Wrong loss = model can't learn.",
              detail: <>MSE for regression, cross-entropy for classification. MSE on classification probabilities barely punishes confident-wrong, so the model never gets the right signal to fix itself. This is a common rookie mistake.</>,
            },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 6: THE JAVA PROJECT                                            */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="java-project" title="Project: linear regression in Java" xp={35} celebration="You built a real ML component. In Module 3 we'll add the training loop." manual manualLabel="I built it — mark done">
      <section>
        <h2>Part 6: Project — linear regression from scratch in Java</h2>

        <p>
          Time to earn the &quot;implement it from scratch&quot; badge. This is <strong>part 1 of 2</strong>: we&apos;ll build the model, the prediction function, and the loss. In Module 3 we&apos;ll add the training loop that finds <code>w</code> and <code>b</code> automatically.
        </p>

        <Callout variant="spring" title="How this section works">
          <p className="m-0 mb-2"><strong>Run first, build second.</strong> You&apos;ll do it in two passes:</p>
          <ol className="list-decimal ml-5 space-y-1 m-0 text-sm">
            <li><strong>Pass 1 — run the reference code.</strong> Copy three files, compile, run, watch it print predictions. Get a feel for the shape.</li>
            <li><strong>Pass 2 — implement the core methods yourself.</strong> Three small exercises where you re-build <code>predict()</code>, <code>mse()</code>, and the OOD guard without peeking. Compare your version to the reference.</li>
          </ol>
        </Callout>

        <h3>Pass 1 — copy, compile, run</h3>

        <p>
          Three files. No build tool needed — just <code>javac</code> and <code>java</code>. (You can drop these into an IntelliJ project if you prefer, but plain terminal works.)
        </p>

        <Callout variant="info" title="Setup (30 seconds)">
          <CodeBlock lang="plain">{`# Make a folder and three files:
mkdir ml-basics && cd ml-basics
touch LinearRegression.java Metrics.java HouseDemo.java

# Paste the three blocks below into the matching files, then:
javac *.java
java HouseDemo

# Expected: a 10-row table of predictions + MSE ≈ 75, RMSE ≈ 8.7`}</CodeBlock>
        </Callout>

        <h4>File 1 of 3: the model</h4>

        <CodeBlock lang="java" caption="LinearRegression.java">{`// ─────────────────────────────────────────────────────────────
// A minimal linear regression model.
//
// Mathematical form:    ŷ = w · x + b
//                     (dot product of weight vector and features,
//                      plus a scalar bias)
//
// This class is intentionally tiny — it knows how to PREDICT,
// not how to TRAIN. We'll add training in Module 3.
// ─────────────────────────────────────────────────────────────
public final class LinearRegression {

    // One weight per feature. Immutable reference (we swap
    // values, but the array itself doesn't get reassigned).
    private final double[] w;

    // The bias / intercept. Just one number for the whole model.
    private double b;

    /** Create an untrained model with all weights at zero. */
    public LinearRegression(int numFeatures) {
        this.w = new double[numFeatures];
        this.b = 0.0;
    }

    /** Create a model with pre-specified weights (e.g. loaded from disk). */
    public LinearRegression(double[] weights, double bias) {
        // Defensive copy — caller shouldn't be able to mutate our
        // internal state after construction.
        this.w = weights.clone();
        this.b = bias;
    }

    /**
     * The forward pass.   ŷ = w·x + b
     *
     * @param x  features for ONE example (length must equal numFeatures)
     * @return   the model's prediction for those features
     */
    public double predict(double[] x) {
        if (x.length != w.length) {
            throw new IllegalArgumentException(
                "Expected " + w.length + " features, got " + x.length);
        }
        double sum = b;
        for (int i = 0; i < w.length; i++) {
            sum += w[i] * x[i];
        }
        return sum;
    }

    // Package-private accessors — the trainer (coming in Module 3) will
    // need to read and write these during gradient descent.
    double[] weights() { return w; }
    double bias()      { return b; }
    void setBias(double newB) { this.b = newB; }
}`}</CodeBlock>

        <h4>File 2 of 3: MSE loss</h4>

        <CodeBlock lang="java" caption="Metrics.java">{`public final class Metrics {

    private Metrics() {} // utility class, no instances

    /**
     * Mean squared error across a batch of predictions.
     *
     * Convention: (y, yHat) — ground-truth labels first, predictions second.
     * Same order we'll use everywhere else in the course (Module 3 trainer,
     * Module 4 backprop). Read it as "compare y to your guess yHat."
     *
     * Useful for:
     *   - evaluating a trained model on a test set
     *   - during training (the thing gradient descent minimizes)
     *
     * Formula:  (1/n) · Σᵢ (ŷᵢ − yᵢ)²
     */
    public static double mse(double[] y, double[] yHat) {
        if (y.length != yHat.length) {
            throw new IllegalArgumentException(
                "y and yHat must have same length");
        }
        double sumSq = 0.0;
        for (int i = 0; i < y.length; i++) {
            double err = yHat[i] - y[i];
            sumSq += err * err;    // square the error
        }
        return sumSq / y.length;
    }

    /** RMSE — same units as y, easier to interpret than MSE. */
    public static double rmse(double[] y, double[] yHat) {
        return Math.sqrt(mse(y, yHat));
    }
}`}</CodeBlock>

        <h4>File 3 of 3: the runner</h4>

        <CodeBlock lang="java" caption="HouseDemo.java">{`import java.util.List;

public class HouseDemo {

    // Our 10-house dataset from the interactive demo.
    // Each row: {size_in_1000_sqft, price_in_$k}
    // These are the same numbers hardcoded in LineFitDemo.tsx.
    private static final double[][] SIZE    = {
        {1.2}, {2.1}, {2.8}, {3.5}, {4.3},
        {5.0}, {5.8}, {6.6}, {7.5}, {8.4}
    };
    private static final double[]   PRICE   = {
        140, 180, 210, 260, 290,
        340, 360, 400, 430, 470
    };

    public static void main(String[] args) {
        // ── Construct the model with the weights we eyeballed earlier.
        // These were the "winning" values from the interactive demo.
        // In Module 3 we'll let the trainer find these itself.
        LinearRegression model = new LinearRegression(
            new double[] { 46.0 },   // slope: ~$46k per 1000 sqft
             90.0                    // intercept: base price
        );

        // ── Run predictions on every training row.
        double[] preds = new double[SIZE.length];
        for (int i = 0; i < SIZE.length; i++) {
            preds[i] = model.predict(SIZE[i]);
        }

        // ── Report per-row AND overall loss.
        System.out.println("idx |  size  |  truth |  pred  |  error");
        System.out.println("----|--------|--------|--------|-------");
        for (int i = 0; i < SIZE.length; i++) {
            System.out.printf(" %2d | %5.1f  | %6.0f | %6.1f | %+6.1f%n",
                i, SIZE[i][0], PRICE[i], preds[i], preds[i] - PRICE[i]);
        }

        double mse  = Metrics.mse(PRICE, preds);
        double rmse = Metrics.rmse(PRICE, preds);
        System.out.printf("%nMSE  = %.2f%n", mse);
        System.out.printf("RMSE = %.2f  (off by ~$%.0fk on average)%n", rmse, rmse);
    }
}`}</CodeBlock>

        <p>Running that should give output like:</p>

        <CodeBlock lang="plain">{`idx |  size  |  truth |  pred  |  error
----|--------|--------|--------|-------
  0 |   1.2  |    140 |  145.2 |   +5.2
  1 |   2.1  |    180 |  186.6 |   +6.6
  2 |   2.8  |    210 |  218.8 |   +8.8
  ...
MSE  ≈ 75
RMSE ≈ 8.7  (off by ~$8–9k on average)`}</CodeBlock>

        <p>
          Those small residuals are exactly what &quot;real data&quot; looks like — the relationship isn&apos;t perfectly linear, and even the best line leaves some loss on the table.
        </p>

        <h3>Pass 2 — implement it yourself</h3>

        <p>
          Now you&apos;ve seen the whole thing run. Time to re-build the three pieces that actually <em>do ML</em>. Each exercise gives you a stub with TODOs; try to fill it in without looking at the reference above, then reveal the solution and compare. It&apos;s fine to keep the running code open in a tab — just don&apos;t scroll up to peek at the answer.
        </p>

        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
          Tip: copy each stub into a scratch file (e.g. <code>Scratch.java</code> with a <code>main</code> that calls your method). That way you can <code>javac Scratch.java &amp;&amp; java Scratch</code> and see it actually work — much faster feedback than eyeballing.
        </p>

        <CodeExercise
          title="Exercise 1: implement predict()"
          prompt={<p className="m-0">Given weights <code>w</code>, bias <code>b</code>, and one example&apos;s features <code>x</code>, return the model&apos;s prediction <code>ŷ = w·x + b</code>. Validate that <code>x.length == w.length</code>; throw <code>IllegalArgumentException</code> if not.</p>}
          stub={`public final class LinearRegression {
    private final double[] w;   // weights
    private double b;           // bias

    public LinearRegression(double[] weights, double bias) {
        this.w = weights.clone();
        this.b = bias;
    }

    /** Return ŷ = w·x + b. Throw IllegalArgumentException if x is the wrong length. */
    public double predict(double[] x) {
        // TODO 1: validate x.length == w.length
        // TODO 2: compute the dot product w·x
        // TODO 3: add bias b and return
        return 0.0; // placeholder
    }
}`}
          hints={[
            "A dot product is just a loop: accumulate w[i] * x[i] into a sum.",
            "Start the sum at b, not 0. That saves you a separate add at the end.",
            "For the validation, 'if (x.length != w.length) throw new IllegalArgumentException(...)' is the whole pattern.",
          ]}
          solution={`public double predict(double[] x) {
    if (x.length != w.length) {
        throw new IllegalArgumentException(
            "Expected " + w.length + " features, got " + x.length);
    }
    double sum = b;
    for (int i = 0; i < w.length; i++) {
        sum += w[i] * x[i];
    }
    return sum;
}`}
        />

        <CodeExercise
          title="Exercise 2: implement mse()"
          prompt={<p className="m-0">Given two arrays <code>y</code> (ground truth) and <code>yHat</code> (predictions) of equal length, return the mean squared error: <code>(1/n) · Σ (yHatᵢ − yᵢ)²</code>. Throw if the lengths don&apos;t match. We&apos;re sticking to the (y, yHat) convention — labels first — for the whole course.</p>}
          stub={`public final class Metrics {
    private Metrics() {}

    /** Mean squared error: (1/n) · Σ (yHat[i] - y[i])² */
    public static double mse(double[] y, double[] yHat) {
        // TODO 1: validate same length
        // TODO 2: sum up the squared errors
        // TODO 3: divide by n and return
        return 0.0;
    }

    public static double rmse(double[] y, double[] yHat) {
        return Math.sqrt(mse(y, yHat));
    }
}`}
          hints={[
            "Accumulator starts at 0. For each i, compute (yHat[i] - y[i]), square it, add to the accumulator.",
            "Squaring in Java: either err*err or Math.pow(err, 2). The first is faster and reads fine.",
            "Don't forget to divide by y.length at the end — it's 'mean' squared error.",
          ]}
          solution={`public static double mse(double[] y, double[] yHat) {
    if (y.length != yHat.length) {
        throw new IllegalArgumentException(
            "y and yHat must have same length");
    }
    double sumSq = 0.0;
    for (int i = 0; i < y.length; i++) {
        double err = yHat[i] - y[i];
        sumSq += err * err;
    }
    return sumSq / y.length;
}`}
        />

        <CodeExercise
          title="Exercise 3: implement the out-of-distribution guard"
          prompt={
            <p className="m-0">
              Our training data only contains houses between <strong>1.0 and 10.0</strong> thousand sqft. If a caller asks to price a 50,000 sqft building, the model will cheerfully extrapolate and return a nonsense number. Write <code>estimateKUsd(double sizeInThousandsOfSqft)</code> so it throws <code>IllegalArgumentException</code> for out-of-range sizes, and otherwise returns <code>model.predict([size])</code>.
            </p>
          }
          stub={`@Service
public class HousePriceService {
    private final LinearRegression model;

    public HousePriceService(LinearRegression model) {
        this.model = model;
    }

    public double estimateKUsd(double sizeInThousandsOfSqft) {
        // TODO 1: if size < 1.0 or > 10.0, throw IllegalArgumentException
        //         (include the offending size in the message — it helps debugging)
        // TODO 2: call model.predict on a single-element array
        return 0.0;
    }
}`}
          hints={[
            "The predict() method takes a double[] — so you need new double[] { size } even for a single feature.",
            "For the guard, one if-statement with an || is enough. No need for two separate checks.",
            "Error messages should tell the caller two things: what went wrong, and what valid inputs look like.",
          ]}
          solution={`public double estimateKUsd(double sizeInThousandsOfSqft) {
    if (sizeInThousandsOfSqft < 1.0 || sizeInThousandsOfSqft > 10.0) {
        throw new IllegalArgumentException(
            "Size " + sizeInThousandsOfSqft
          + " is outside training distribution (1.0 – 10.0). "
          + "Prediction would be unreliable.");
    }
    return model.predict(new double[] { sizeInThousandsOfSqft });
}`}
        />

        <Callout variant="insight" title="Why this order?">
          <p className="m-0">
            &quot;Run first, build second&quot; sounds backward, but it&apos;s how most engineers actually learn unfamiliar territory. Seeing it work gives you a mental model of the API surface and the expected output — so when you re-implement, you&apos;re not guessing in the dark, you&apos;re reconstructing something concrete. The <em>second</em> pass is where the understanding locks in.
          </p>
        </Callout>

        <h3>Step 4: the Spring service wrapper</h3>

        <p>
          In a real system, this regression model lives inside a Spring service that other parts of your app call. Two things matter: <strong>load the model once</strong> (at startup) and <strong>guard out-of-distribution inputs</strong>.
        </p>

        <Callout variant="spring" title="Wrapping the model for a Spring Boot app">
          <CodeBlock lang="java" caption="HousePriceService.java">{`import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

// ─────────────────────────────────────────────────────────────
// 1) @Configuration — load the model ONCE at app startup.
//    Models can be MB-to-GB; never reload per request.
// ─────────────────────────────────────────────────────────────
@Configuration
public class ModelConfig {

    /**
     * @Bean tells Spring: call this method once, cache the result,
     * and inject it wherever a LinearRegression is needed.
     *
     * In production you'd load weights from S3, a model registry
     * (MLflow, SageMaker), a file on disk, or a hosted endpoint.
     * For this demo, we hardcode the values we trained by eye.
     */
    @Bean
    public LinearRegression housePriceModel() {
        return new LinearRegression(new double[] { 46.0 }, 90.0);
    }
}

// ─────────────────────────────────────────────────────────────
// 2) @Service — business logic. Other components call THIS,
//    not the raw model. This layer is where we enforce guards.
// ─────────────────────────────────────────────────────────────
@Service
public class HousePriceService {

    private final LinearRegression model;

    // Constructor injection: Spring sees we need a LinearRegression
    // and wires in the bean from ModelConfig. No @Autowired needed
    // for single-constructor classes (since Spring 4.3).
    public HousePriceService(LinearRegression model) {
        this.model = model;
    }

    /**
     * Estimate price for a given house size.
     *
     * @param sizeInThousandsOfSqft  e.g. 2.5 for a 2,500 sqft home.
     *                                Model was trained on 1.2–8.4.
     */
    public double estimateKUsd(double sizeInThousandsOfSqft) {
        // ── GUARD: out-of-distribution check.
        //
        // Linear models happily extrapolate forever — feed in a
        // 50k sqft "house" and you'll get a confidently wrong
        // prediction. Better to fail loudly than mislead callers.
        //
        // Same principle for LLMs: if a user's input is way outside
        // what you've evaluated, have a fallback — not a hallucination.
        if (sizeInThousandsOfSqft < 1.0 || sizeInThousandsOfSqft > 10.0) {
            throw new IllegalArgumentException(
                "Size " + sizeInThousandsOfSqft
              + " is outside training distribution (1.0 – 10.0). "
              + "Prediction would be unreliable.");
        }
        return model.predict(new double[] { sizeInThousandsOfSqft });
    }
}`}</CodeBlock>
        </Callout>

        <h3>Your assignment</h3>

        <div className="rounded-xl border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-5 my-5 not-prose">
          <ol className="list-decimal ml-5 space-y-2 text-sm text-indigo-950 dark:text-indigo-100">
            <li>Create a Spring Boot project (or use an existing one).</li>
            <li>Add the three classes above: <code>LinearRegression</code>, <code>Metrics</code>, <code>ModelConfig</code> + <code>HousePriceService</code>.</li>
            <li>Add a tiny <code>@RestController</code> exposing <code>GET /api/estimate?size=2.5</code> that returns the estimate.</li>
            <li>Write a unit test asserting: <code>predict([5.0])</code> with the hardcoded weights returns ~320. Also test the guard throws for out-of-range sizes.</li>
            <li>Bonus: add a second feature (bedrooms) by extending the weights array to <code>{`{46.0, 15.0}`}</code> and updating the service and controller.</li>
          </ol>
          <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-4 italic m-0">
            Module 3 ships the training loop. Your model will still work — you&apos;ll just be able to find the weights automatically instead of hardcoding them.
          </p>
        </div>
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-basics" id="final" title="Final quiz" xp={40} celebration="Module 2 done. You've earned the 'foundations' badge. Module 3 is waiting.">
      <section>
        <h2>🎯 Final quiz</h2>
        <p>Seven questions. Get 6+ and you&apos;re ready for Module 3.</p>

        <Quiz
          kind="Q1 of 7"
          question="Your team wants to predict how many support tickets a given product feature will generate in its first week. Each data point: (feature_flags_enabled, rollout_percentage, num_tickets). What flavor of ML and what problem type?"
          options={[
            { label: "Unsupervised clustering", explanation: "You have a clear label (num_tickets) for every training example, so it's supervised — not unsupervised." },
            { label: "Supervised regression", correct: true, explanation: "Supervised (you have labels: num_tickets), regression (the label is a number on a continuous scale)." },
            { label: "Supervised classification", explanation: "Only if you bucketed num_tickets into categories like 'low/med/high' would this be classification. As-is it's a count, which is regression." },
            { label: "Reinforcement learning", explanation: "No environment + reward signal — this is a one-shot prediction from static features." },
          ]}
        />

        <Quiz
          kind="Q2 of 7"
          question="Which of these is NOT a feature of a house in a price-prediction problem?"
          options={[
            { label: "Square footage", explanation: "Classic input feature." },
            { label: "Number of bedrooms", explanation: "Another core feature." },
            { label: "Year built", explanation: "Standard feature." },
            { label: "The actual sale price", correct: true, explanation: "That's the LABEL, not a feature. Features are the inputs; the label is what the model is trying to predict. Mixing them up is a bug called 'label leakage' — you'd get 100% accuracy in training and 0% usefulness at inference." },
          ]}
        />

        <Quiz
          kind="Q3 of 7"
          question="You train a linear regression with MSE loss. Your training MSE ends at 40, test MSE is 2500. Best explanation?"
          options={[
            { label: "The model underfit — it's too simple", explanation: "Underfitting would give BOTH high train and high test error. Here training error is tiny." },
            { label: "The model overfit — it memorized the training set but doesn't generalize", correct: true, explanation: "Big gap between train and test = overfitting. The model found patterns in the training data that don't hold on new data. (We deep-dive fixes in Module 3.)" },
            { label: "MSE is the wrong loss", explanation: "Could be an issue in some cases, but wouldn't produce this specific symptom of train≪test error." },
            { label: "The learning rate was too high", explanation: "Too-high LR tends to show up as unstable loss DURING training, not as a clean train vs test gap at the end." },
          ]}
        />

        <Quiz
          kind="Q4 of 7"
          question="What does the weight w=46 mean in the house-price linear regression ŷ = 46·size + 90?"
          options={[
            { label: "Prices go up by $46k for every extra 1000 sqft, holding other features fixed", correct: true, explanation: "Exactly the interpretation of a linear regression weight: marginal effect of that feature on the prediction." },
            { label: "46% of the prediction comes from the size feature", explanation: "That's not what weights mean. They're additive contributions per unit of feature, not percentages." },
            { label: "The model is 46% confident in its prediction", explanation: "Confidence doesn't appear in a linear regression — the output is a single scalar, not a probability." },
          ]}
        />

        <Quiz
          kind="Q5 of 7"
          question="Your classification model outputs a probability of 0.9 for the correct class. What does cross-entropy loss evaluate to for this example (approximately)?"
          hint="Cross-entropy for one example = −log(p), where p is the probability the model assigned to the correct class."
          options={[
            { label: "0.0", explanation: "Would only be exactly 0 if p = 1.0 (perfect confidence). 0.9 is great but not perfect." },
            { label: "≈ 0.11", correct: true, explanation: "−log(0.9) ≈ 0.105. Low loss, but nonzero — rewarding but not fully rewarded." },
            { label: "≈ 2.3", explanation: "That's around −log(0.1) — loss when the model is confidently WRONG." },
            { label: "0.9", explanation: "That's the probability itself, not the loss. Loss is a transform of the probability." },
          ]}
        />

        <Quiz
          kind="Q6 of 7"
          question="You notice a handful of extreme outlier data points are dominating your regression training. Everything else fits well, but those few points wreck the fit. What's the most pragmatic fix to try first?"
          options={[
            { label: "Use a bigger model", explanation: "A bigger model would fit outliers EVEN MORE — that's the opposite of what you want." },
            { label: "Switch to MAE (or Huber) loss, so outliers don't get squared into massive penalties", correct: true, explanation: "Right. MSE's squaring makes outliers dominate the loss. MAE scales errors linearly; Huber uses MSE for small errors and MAE for big ones. Either makes the training more robust to outliers without just deleting data." },
            { label: "Increase the learning rate", explanation: "LR affects step size in gradient descent, not which errors the loss prioritizes. Doesn't help." },
            { label: "Use cross-entropy instead", explanation: "Cross-entropy is for classification — doesn't apply to a regression problem." },
          ]}
        />

        <Quiz
          kind="Q7 of 7"
          question="You're deploying a linear regression trained on house sizes 1000–8000 sqft. A Spring controller receives a request for a 30,000 sqft mansion. What's the right behavior?"
          options={[
            { label: "Predict and return the number — the model can handle it", explanation: "The model will return A number. That number will be confident extrapolation outside the training distribution, and probably nonsense." },
            { label: "Reject or fall back — 30,000 sqft is outside the training distribution, so any prediction is unreliable", correct: true, explanation: "Right. Know your model's training distribution, and fail loudly (or fall back to a different approach) for inputs outside it. Same principle applies to LLMs: have a plan for prompts outside your evaluation set." },
            { label: "Retrain the model on the new data point", explanation: "One outlier query isn't enough to retrain on. And online training from user queries is a whole engineering problem — not a casual fix." },
            { label: "Silently clamp the input to the max training size", explanation: "Silent clamping hides the problem from callers. They won't learn the prediction is unreliable, and they can't decide how to handle it." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* RECAP                                                              */}
      {/* ================================================================= */}
      <section>
        <h2>✅ What you now know</h2>
        <ul className="list-none space-y-2 my-6">
          {[
            "ML comes in three flavors: supervised (data has answers), unsupervised (data has no answers), reinforcement (feedback from an environment). This module is all supervised.",
            "Supervised problems split into regression (predict a number) and classification (predict a category). Different outputs, different losses, different metrics.",
            "Every supervised problem has 5+1 parts: features, labels, training set, validation set, test set, model+weights.",
            "Feature engineering — picking what to feed the model — often matters more than the model choice itself.",
            "Linear regression: ŷ = w·x + b. Simplest real model. Two knobs per feature: slope + intercept. Weights are interpretable.",
            "Loss is a single number that measures wrongness. MSE for regression (squares errors), MAE/Huber if outliers are a problem, cross-entropy for classification and LLMs.",
            "You can now build a linear-regression model and an MSE helper in Java from scratch — and wrap them in a Spring service with an out-of-distribution guard.",
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
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-80">Up next · Module 3</div>
          <h3 className="text-xl font-bold mb-2">How models actually learn</h3>
          <p className="text-sm opacity-90 mb-4">
            You can predict and measure loss — but you&apos;ve been finding weights by hand. Time to automate it. Gradient descent, learning-rate tuning, the full training loop, overfitting and how to fight it, and evaluation metrics (RMSE, R², accuracy, precision, recall, F1). You&apos;ll finish the Java project by adding the training loop that learns <code>w</code> and <code>b</code> automatically.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses/ai/modules/ml-training"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium text-sm hover:bg-indigo-50 transition"
            >
              Start Module 3 →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition"
            >
              ← All modules
            </Link>
          </div>
        </div>
      </footer>
    </article>
  );
}

// ───────────────────────────────────────────────────────────────────
// Small presentational helpers
// ───────────────────────────────────────────────────────────────────

function Tile({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
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

function FlavorCard({
  icon,
  name,
  tagline,
  color,
  example,
  signature,
  examples,
}: {
  icon: string;
  name: string;
  tagline: string;
  color: "emerald" | "amber" | "violet";
  example: string;
  signature: string;
  examples: string;
}) {
  const palette = {
    emerald: "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40",
    amber: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40",
    violet: "border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40",
  }[color];
  const accent = {
    emerald: "text-emerald-900 dark:text-emerald-200",
    amber: "text-amber-900 dark:text-amber-200",
    violet: "text-violet-900 dark:text-violet-200",
  }[color];
  return (
    <div className={`rounded-xl border p-4 text-sm ${palette}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <h4 className={`font-bold m-0 ${accent}`}>{name}</h4>
      </div>
      <p className={`text-xs italic m-0 mb-3 ${accent}`}>{tagline}</p>
      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
        <div>
          <strong className="opacity-70 uppercase tracking-wider text-[10px]">Example</strong>
          <div>{example}</div>
        </div>
        <div>
          <strong className="opacity-70 uppercase tracking-wider text-[10px]">Data shape</strong>
          <div>{signature}</div>
        </div>
        <div>
          <strong className="opacity-70 uppercase tracking-wider text-[10px]">Seen in</strong>
          <div>{examples}</div>
        </div>
      </div>
    </div>
  );
}

function AnatomyCard({
  n,
  title,
  color,
  children,
}: {
  n: number;
  title: string;
  color: "rose" | "amber" | "emerald" | "sky" | "indigo" | "violet";
  children: React.ReactNode;
}) {
  const palette = {
    rose: "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100",
    amber: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100",
    emerald: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100",
    sky: "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100",
    indigo: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100",
    violet: "bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-800 text-violet-950 dark:text-violet-100",
  }[color];
  return (
    <div className={`rounded-xl border p-4 text-sm ${palette}`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-mono opacity-60">#{n}</span>
        <span className="font-bold">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
