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
  { id: "why-neurons", title: "Why we need neurons at all" },
  { id: "activations", title: "Activation functions: the kink that matters" },
  { id: "forward-pass", title: "Forward pass: a network is just matmul + squash" },
  { id: "backprop", title: "Backpropagation: the chain rule, bookkept" },
  { id: "training-loop", title: "Putting it together: the full training loop" },
  { id: "java-project", title: "Project: tiny MLP digit classifier in Java" },
  { id: "final", title: "Final quiz" },
];

export default function NeuralNetworksModule() {
  const mod = getModuleBySlug("neural-networks")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">Neural networks</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Layers, activations, backprop — from a single neuron up to a handwritten-digit classifier, all by hand in Java.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="neural-networks" />
        <ModuleProgress moduleSlug="neural-networks" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Modules 2 and 3 gave you a single linear model that trains itself. This module generalizes that idea to many linear models stacked
          with a squiggle between them — which turns out to be <em>literally every modern AI model</em>. By the end you&apos;ll:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li>Explain why a 1000-layer linear network is the <em>same</em>{" "}as a 1-layer linear network — and what fixes that.</li>
          <li>Know ReLU, sigmoid, and softmax cold — when to use each and why.</li>
          <li>Do a forward pass through a 2-layer network <em>by hand</em>{" "}with real numbers.</li>
          <li>Derive backpropagation for that network — the chain rule, just organized.</li>
          <li>Ship a Java MLP that classifies handwritten digits with &gt;90% accuracy. No library. Just arrays.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          This is the longest module in Phase 1. It&apos;s the investment that makes Modules 5 (attention) and everything after feel obvious instead of magical.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: WHY NEURONS                                                */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="why-neurons" title="Why we need neurons at all" xp={20} celebration="You understand the single deepest reason neural networks exist.">
      <section>
        <h2>Part 1: Why we need neurons at all</h2>

        <h3>Start with an analogy: the XOR problem</h3>
        <p>
          Imagine four houses on a 2D map, two blue and two red, arranged like this:
        </p>

        <CodeBlock lang="plain">
{`         x2
          |
    blue  |  red
  (0,1)   |   (1,1)
          |
  --------+--------  x1
          |
    red   |  blue
  (0,0)   |   (1,0)
          |`}
        </CodeBlock>

        <p>
          Your job: draw a single straight line that puts all blue houses on one side and all red houses on the other.
        </p>
        <p>
          <strong>You can&apos;t.</strong>{" "}Any straight line you draw will get at most three right. The blue points sit on opposite corners.
          This is the famous <em>XOR problem</em>, and it&apos;s the thing that killed the first wave of AI enthusiasm in 1969.
        </p>

        <Callout variant="insight" title="The only thing linear regression can learn">
          <p className="m-0">
            A linear model — like the one you built in Module 3 — can only draw <strong>straight lines</strong> (or in higher dimensions, flat hyperplanes).
            If the pattern in your data is a curve, a zigzag, a spiral, or an XOR, <em>no amount of training</em>{" "}will make a linear model learn it.
            More data won&apos;t help. More features won&apos;t help. The model&apos;s shape is fundamentally wrong.
          </p>
        </Callout>

        <h3>The fix: stack models, bend the space</h3>
        <p>
          Here&apos;s the idea: what if instead of drawing one line, we first <em>transform</em>{" "}the input into a new space where a line <em>does</em>{" "}work?
          Feed those transformed features through a second linear model, and now you can carve up patterns the first couldn&apos;t touch.
        </p>
        <p>
          That&apos;s the entire premise of neural networks:
        </p>

        <ol>
          <li>Run the input through a linear layer (matrix multiply + bias).</li>
          <li>Apply a <strong>non-linear squish</strong>{" "}to the output of each neuron (the activation function).</li>
          <li>Repeat — each new layer can now reshape space in ways the previous one couldn&apos;t.</li>
        </ol>

        <p>
          Drop the squish, and layers collapse. Stack 100 linear layers without activations and you&apos;ve built… one linear layer. Algebra doesn&apos;t care how many matrices you multiplied — their product is still a single matrix.
        </p>

        <WorkedExample
          title="Why stacking linear layers is pointless without activations"
          subtitle="The math that killed neural networks for a decade — and the one-line fix that revived them."
          steps={[
            {
              title: "Set up two linear layers",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Layer 1: <code>h = W₁ · x + b₁</code>. Layer 2: <code>y = W₂ · h + b₂</code>.
                  </p>
                  <p className="m-0">Substitute layer 1 into layer 2:</p>
                  <CodeBlock lang="plain">
{`y = W₂ · (W₁ · x + b₁) + b₂
  = (W₂ · W₁) · x + (W₂ · b₁ + b₂)
  =      W_eff · x +          b_eff`}
                  </CodeBlock>
                </>
              ),
            },
            {
              title: "Notice what happened",
              body: (
                <p className="m-0">
                  <code>W₂ · W₁</code> is just some matrix — call it <code>W_eff</code>. <code>W₂ · b₁ + b₂</code> is just some vector — call it <code>b_eff</code>.
                  The two-layer network is <em>mathematically identical</em>{" "}to a single linear layer <code>y = W_eff · x + b_eff</code>. No extra expressive power.
                  You could stack a thousand layers and it&apos;d still just be one.
                </p>
              ),
            },
            {
              title: "Add a non-linear activation between them",
              body: (
                <>
                  <p className="m-0 mb-2">Now layer 1 is <code>h = σ(W₁ · x + b₁)</code> where σ is any non-linear function (like <code>max(0, z)</code>).</p>
                  <CodeBlock lang="plain">
{`y = W₂ · σ(W₁ · x + b₁) + b₂`}
                  </CodeBlock>
                  <p className="m-0">
                    You <em>cannot</em>{" "}collapse this. <code>σ</code> is non-linear, so <code>W₂</code> can&apos;t distribute into it.
                    The two layers now do genuinely different work. Universal approximation is back on the menu.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="info" title="Universal approximation theorem (informally)">
          <p className="m-0">
            A neural network with <em>just one hidden layer</em> — given enough neurons and a non-linear activation — can approximate <em>any</em>{" "}continuous function
            to arbitrary precision. One layer is enough <em>in theory</em>. In practice, deeper networks learn more efficiently, which is why we use many layers, not one fat one.
          </p>
        </Callout>

        <h3>What &quot;neuron&quot; actually means</h3>
        <p>
          Forget the brain analogy — it&apos;s misleading. A neuron is a tiny function:
        </p>

        <p>
          <strong>In plain English:</strong>{" "}take each input, multiply it by its own weight, add them all up, add a constant called bias, and then run that final number through a squishing function (the activation). That&apos;s a neuron. The Greek <code>σ</code> (sigma) is just a placeholder for whichever squishing function you pick.
        </p>

        <CodeBlock lang="plain">
{`neuron(x) = σ( w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ + b )

where:
  x     = inputs (a vector)
  w     = weights (one per input)
  b     = bias (one scalar)
  σ     = activation function (ReLU, sigmoid, etc.)`}
        </CodeBlock>

        <p>
          That&apos;s it. One weighted sum, one scalar bias, one non-linearity. A <strong>layer</strong>{" "}is a bunch of neurons side-by-side, each reading the same inputs but with different weights.
          A <strong>network</strong>{" "}is a stack of layers.
        </p>

        <Quiz
          question="You build a network with 50 linear layers, no activation functions. You train it on MNIST and it gets 90% accuracy. What's suspicious?"
          options={[
            { label: "Nothing — 50 layers should get better than 90%.", explanation: "The suspicious part has nothing to do with the accuracy number. The setup itself is mathematically equivalent to a single linear layer." },
            { label: "With no activations, 50 layers collapse into 1 linear layer — so you built linear regression. Whatever it scored, it's not a 'deep network.'", correct: true, explanation: "Exactly. Without non-linearity, the depth is decorative. You trained a very slow linear regression. Add ReLU and you've got a real network." },
            { label: "MNIST needs convolutional layers, not dense ones.", explanation: "CNNs help, but dense MLPs routinely exceed 97% on MNIST. The issue here is the missing activations." },
            { label: "50 layers is too many; it'd overfit.", explanation: "Capacity is a real concern in general, but the specific problem here is the network has no non-linearity — no matter how deep, it can only draw hyperplanes." },
          ]}
          hint="What does multiplying a chain of matrices give you?"
        />

        <Quiz
          question="A single neuron with 3 inputs, ReLU activation, weights [2, −1, 0.5], bias 0.5. What's the output for input x = [1, 2, 4]?"
          options={[
            { label: "0", explanation: "Compute the sum first: 2·1 + (−1)·2 + 0.5·4 + 0.5 = 2 − 2 + 2 + 0.5 = 2.5. ReLU(2.5) = 2.5." },
            { label: "2.5", correct: true, explanation: "Right. Weighted sum: 2·1 + (−1)·2 + 0.5·4 + 0.5 = 2.5. ReLU passes positive values through unchanged, so output is 2.5." },
            { label: "0.5", explanation: "That's just the bias. You have to add it to the weighted sum of inputs, not use it alone." },
            { label: "5.5", explanation: "Check the middle term — it's −1·2 = −2, not +2. The weight is negative." },
          ]}
          hint="Weighted sum first, then activation."
        />

        <PartRecap
          title="Part 1 recap"
          gist="Neural networks exist to solve the one problem linear models can't: non-linear patterns."
          points={[
            { takeaway: "A linear model can only learn flat boundaries.", detail: <>It can do straight lines in 2D, flat planes in 3D, etc. XOR, spirals, curves — invisible to it.</> },
            { takeaway: "Stacking linear layers without activations is pointless.", detail: <>The chain of matrix multiplications collapses to one matrix. Depth without non-linearity is an illusion.</> },
            { takeaway: "A neuron is: weighted sum → + bias → non-linear squish.", detail: <>That&apos;s the entire formula. A layer is many neurons side-by-side sharing inputs. A network is many layers stacked.</> },
            { takeaway: "The activation function is what makes depth matter.", detail: <>Any non-linear σ will do in theory — ReLU, sigmoid, tanh. We&apos;ll see why ReLU usually wins in Part 2.</> },
            { takeaway: "Universal approximation: one hidden layer is enough, in theory.", detail: <>But deeper networks learn more efficiently, which is why the field went deep, not wide.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 2: ACTIVATION FUNCTIONS                                       */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="activations" title="Activation functions" xp={20} celebration="You know which activation to use, when, and why. That's most of the 'art.'">
      <section>
        <h2>Part 2: Activation functions — the kink that matters</h2>

        <p>
          Any non-linearity will break the &quot;stacked layers collapse&quot; problem in theory. In practice, only a handful of activations are used, and each has a personality.
          Knowing them by name — and knowing when each breaks — is half the battle when training isn&apos;t working.
        </p>

        <h3>The three you need to know cold</h3>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">ReLU</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              f(z) = max(0, z)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Pass positives through, squash negatives to 0. Default for hidden layers. Fast, gradient-friendly, what everyone uses.
            </p>
          </div>
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-1">Sigmoid</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              f(z) = 1 / (1 + e⁻ᶻ)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              S-curve from 0 to 1. Used for <em>output</em>{" "}of binary classifiers (&quot;probability of spam&quot;). Rare in hidden layers today.
            </p>
          </div>
          <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-4 text-sm">
            <div className="font-bold text-violet-900 dark:text-violet-200 mb-1">Softmax</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              f(zᵢ) = eᶻⁱ / Σⱼ eᶻʲ
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Turns a vector of scores into a probability distribution (sums to 1). The output layer for multi-class classification.
            </p>
          </div>
        </div>

        <h3>ReLU: unreasonably effective</h3>

        <p>
          ReLU stands for &quot;Rectified Linear Unit.&quot; It&apos;s the simplest function that works:
        </p>

        <CodeBlock lang="java">
{`public static double relu(double z) {
    return Math.max(0.0, z);
}

// Derivative is even simpler — 1 for positive inputs, 0 for negatives.
public static double reluDerivative(double z) {
    return z > 0 ? 1.0 : 0.0;
}`}
        </CodeBlock>

        <p>
          Why does the field love it?
        </p>

        <ul>
          <li><strong>Cheap.</strong>{" "}One comparison, one branch. On a GPU, that&apos;s basically free.</li>
          <li><strong>Gradient-friendly.</strong>{" "}Derivative is 0 or 1. No exponentials, no vanishing (for positive inputs).</li>
          <li><strong>Sparse.</strong>{" "}About half the neurons output exactly 0 at any moment, which empirically helps generalization.</li>
        </ul>

        <Callout variant="warn" title="The dying ReLU problem">
          <p className="mb-2">
            If a neuron&apos;s input is always negative, ReLU outputs 0 forever. Its derivative is 0 too, so it never updates. The neuron is <em>dead</em> — permanently out of the network.
            This happens if your learning rate is too big, or your initialization drives too many neurons into the &quot;always negative&quot; zone.
          </p>
          <p className="m-0">
            Fixes: lower the learning rate, better initialization (Kaiming/He init), or use <strong>Leaky ReLU</strong>: <code>f(z) = z &gt; 0 ? z : 0.01·z</code>. The tiny slope on the negative side keeps the gradient alive.
          </p>
        </Callout>

        <h3>Sigmoid: the classical output</h3>

        <p>
          Sigmoid squishes any real number into (0, 1). That makes it perfect for <em>binary classification outputs</em> — the model says
          &quot;I&apos;m 0.87 confident this email is spam.&quot;
        </p>

        <CodeBlock lang="java">
{`public static double sigmoid(double z) {
    return 1.0 / (1.0 + Math.exp(-z));
}

public static double sigmoidDerivative(double z) {
    double s = sigmoid(z);
    return s * (1.0 - s);   // nice closed form
}`}
        </CodeBlock>

        <p>
          For hidden layers, sigmoid has a famous problem:
        </p>

        <Callout variant="warn" title="The vanishing gradient problem">
          <p className="mb-2">
            Sigmoid&apos;s maximum derivative is 0.25 (at z = 0). For z far from 0, the derivative is near zero. In a deep network, the chain rule multiplies derivatives layer by layer:
            <code className="ml-1">0.25 × 0.25 × 0.25 × ...</code>
          </p>
          <p className="m-0">
            By layer 10, gradients flowing back to layer 1 are about 10⁻⁶ — essentially zero. Early layers can&apos;t learn. This is why sigmoid fell out of fashion for hidden layers.
            ReLU&apos;s derivative is 1, so it doesn&apos;t shrink.
          </p>
        </Callout>

        <h3>Softmax: the multi-class output</h3>

        <p>
          When you&apos;re classifying into more than two categories — digit 0–9, cat/dog/bird, spam/ham/promo — you want a probability distribution:
          one number per class, all non-negative, summing to 1. Softmax gives you exactly that.
        </p>

        <WorkedExample
          title="Softmax by hand"
          subtitle="Turn raw scores into probabilities."
          steps={[
            {
              title: "Start with raw scores (logits)",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Say your network&apos;s final layer outputs three scores — one per class:
                  </p>
                  <CodeBlock lang="plain">
{`logits = [ 2.0,  1.0,  0.1 ]
           cat   dog   bird`}
                  </CodeBlock>
                  <p className="m-0">These are just real numbers. They&apos;re not probabilities yet. We want to turn them into one.</p>
                </>
              ),
            },
            {
              title: "Exponentiate each",
              body: (
                <CodeBlock lang="plain">
{`exp(2.0) ≈ 7.389
exp(1.0) ≈ 2.718
exp(0.1) ≈ 1.105`}
                </CodeBlock>
              ),
            },
            {
              title: "Divide by the sum",
              body: (
                <>
                  <CodeBlock lang="plain">
{`sum = 7.389 + 2.718 + 1.105 = 11.212

p(cat)  = 7.389 / 11.212 ≈ 0.659
p(dog)  = 2.718 / 11.212 ≈ 0.242
p(bird) = 1.105 / 11.212 ≈ 0.099`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    Check: 0.659 + 0.242 + 0.099 = 1.000 ✓. We have a probability distribution.
                    The winner is &quot;cat&quot; at 66%. Note that small differences in logits (2.0 vs 1.0) become big differences in probability — exp amplifies gaps.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Callout variant="info" title="Softmax in practice: subtract the max first">
          <p className="mb-2">
            <code>exp(1000)</code> overflows a double. Numerical-stability trick:
          </p>
          <CodeBlock lang="plain">
{`softmax(x) = softmax(x − max(x))`}
          </CodeBlock>
          <p className="m-0">
            Subtracting a constant from every input leaves the result unchanged mathematically, but keeps all exponents ≤ 0. Always do this in real code.
          </p>
        </Callout>

        <h3>Which to use, when</h3>

        <div className="grid gap-2 my-4 not-prose text-sm">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <strong>Hidden layers:</strong>{" "}ReLU (or Leaky ReLU if you see dead neurons). Don&apos;t overthink it — this is the default for 95% of networks.
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <strong>Output — binary classification:</strong>{" "}Sigmoid (1 output neuron).
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <strong>Output — multi-class classification:</strong>{" "}Softmax (one neuron per class).
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <strong>Output — regression:</strong>{" "}No activation (linear). You want the raw output.
          </div>
        </div>

        <Quiz
          question="You're building a sentiment classifier with 5 classes (very-negative → very-positive). Which activation on the OUTPUT layer?"
          options={[
            { label: "ReLU — it's the default", explanation: "ReLU on the output can't give probabilities — it outputs arbitrary positives. Keep ReLU for hidden layers." },
            { label: "Sigmoid on each of the 5 outputs", explanation: "Sigmoid on each gives independent 0-1 scores, but they won't sum to 1. You want a proper distribution across the 5 mutually-exclusive classes." },
            { label: "Softmax over the 5 outputs", correct: true, explanation: "Exactly. Five classes, mutually exclusive, you want a probability distribution — softmax is the tool for the job." },
            { label: "No activation (linear)", explanation: "You'd get raw scores that could be negative or huge. Fine for regression, wrong for classification." },
          ]}
        />

        <Quiz
          question="Training a deep sigmoid network, your first few layers' weights barely budge. Middle layers learn fine. Final layers learn well. Most likely cause?"
          options={[
            { label: "Learning rate is too small", explanation: "If it were LR, ALL layers would learn slowly, not just the early ones." },
            { label: "Vanishing gradients — sigmoid derivatives chain-multiply to near-zero by the time they reach the early layers", correct: true, explanation: "Classic vanishing gradient. Sigmoid's max derivative is 0.25; after 6+ layers of multiplication, early-layer updates are microscopic. Switch to ReLU." },
            { label: "Exploding gradients", explanation: "Exploding gradients make loss go NaN quickly. Here loss is fine; it's just the EARLY layers that are stuck. That's vanishing, not exploding." },
            { label: "Not enough data", explanation: "Data size doesn't cause this layer-by-layer pattern. This is a gradient-flow problem." },
          ]}
          hint="What does sigmoid's derivative look like, and what happens when you multiply many of them together?"
        />

        <PartRecap
          title="Part 2 recap"
          gist="ReLU for hidden layers, sigmoid/softmax for outputs, and the math of why."
          points={[
            { takeaway: "ReLU = max(0, z). Default for hidden layers.", detail: <>Cheap, gradient-friendly (derivative is 0 or 1), and empirically the best general-purpose choice.</> },
            { takeaway: "Sigmoid squishes to (0,1). Use on binary classification OUTPUT only.", detail: <>Vanishing gradients make it a bad choice for hidden layers in deep networks.</> },
            { takeaway: "Softmax turns a vector of scores into probabilities that sum to 1.", detail: <>Use on the output of multi-class classifiers. Subtract the max before exp for numerical stability.</> },
            { takeaway: "Regression output: no activation. You want the raw number.", detail: <>Applying sigmoid would pin your output to (0,1); ReLU would kill all negatives. Bare linear output is what you want.</> },
            { takeaway: "Dying ReLU & vanishing gradient are the two gotchas.", detail: <>Dying ReLU: neurons stuck at 0. Fix with better init or Leaky ReLU. Vanishing gradient: sigmoid&apos;s 0.25 cap compounds into nothing in deep nets. Fix by switching to ReLU.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 3: FORWARD PASS                                               */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="forward-pass" title="Forward pass" xp={25} celebration="You can walk an input through any network and predict the output. Half of ML.">
      <section>
        <h2>Part 3: Forward pass — a network is just matmul + squash</h2>

        <p>
          The <strong>forward pass</strong>{" "}is what happens when you ask a trained network to make a prediction. It&apos;s just the network&apos;s formula, evaluated.
          No mystery, no magic. A sequence of matrix multiplies interleaved with activation functions.
        </p>

        <h3>The recipe, for any network</h3>

        <CodeBlock lang="plain">
{`for each layer ℓ = 1 .. L:
    z[ℓ] = W[ℓ] · a[ℓ−1] + b[ℓ]        // weighted sum (pre-activation)
    a[ℓ] = σ[ℓ]( z[ℓ] )                 // non-linearity (activation)

output = a[L]                            // the final layer's activations`}
        </CodeBlock>

        <p>
          That&apos;s the whole thing. <code>a[0]</code> is your input <code>x</code>. Each layer builds its pre-activation <code>z</code> from the previous layer&apos;s output, then squishes through <code>σ</code>.
          The final layer&apos;s activations are your prediction.
        </p>

        <Callout variant="info" title="Shape reasoning">
          <p className="mb-2">
            If a layer has <code>n_in</code> inputs and <code>n_out</code> neurons, then <code>W</code> is <code>n_out × n_in</code> and <code>b</code> is <code>n_out × 1</code>.
            Input <code>x</code> is <code>n_in × 1</code>. Output <code>z = W · x + b</code> is <code>n_out × 1</code>.
          </p>
          <p className="m-0">
            90% of &quot;my network won&apos;t run&quot; bugs are shape mismatches. Always sketch the shapes before you write the code.
          </p>
        </Callout>

        <h3>A concrete 2-layer network</h3>

        <p>
          Let&apos;s build the smallest network that actually has a hidden layer. 2 inputs, 3 hidden neurons with ReLU, 1 output with no activation (regression):
        </p>

        <CodeBlock lang="plain">
{`  x₁ ──┬──► [h₁] ──┐
       ├──► [h₂] ──┼──► [ ŷ ]
  x₂ ──┴──► [h₃] ──┘

Input layer:    2 features
Hidden layer:   3 neurons, ReLU
Output layer:   1 neuron, linear`}
        </CodeBlock>

        <p>
          That&apos;s two weight matrices: <code>W₁</code> is 3×2, <code>W₂</code> is 1×3. Plus biases <code>b₁</code> (3×1) and <code>b₂</code> (1×1).
          Total parameters: 6 + 3 + 3 + 1 = <strong>13 weights</strong>.
        </p>

        <WorkedExample
          title="Forward pass through a 2-layer network — by hand"
          subtitle="Every number computed explicitly. Pull out paper if you want, this sticks better if you follow along."
          steps={[
            {
              title: "The network's weights",
              body: (
                <>
                  <p className="m-0 mb-2">Suppose after training, we have:</p>
                  <CodeBlock lang="plain">
{`W₁ = [ [ 0.5, -0.2],      b₁ = [ 0.1,
        [-0.1,  0.3],              0.0,
        [ 0.2,  0.4] ]              -0.1 ]

W₂ = [ [ 1.0, -1.0, 0.5 ] ]   b₂ = [ 0.2 ]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    Row <code>i</code> of <code>W₁</code> is the weights of hidden neuron <code>i</code>. We&apos;re going to push input <code>x = [2.0, 3.0]</code> through it.
                  </p>
                </>
              ),
            },
            {
              title: "Layer 1 pre-activation z₁ = W₁·x + b₁",
              body: (
                <CodeBlock lang="plain">
{`z₁[0] = 0.5·2  + (-0.2)·3 + 0.1  =  1.0 - 0.6 + 0.1  =  0.5
z₁[1] = -0.1·2 +  0.3·3   + 0.0  = -0.2 + 0.9 + 0.0  =  0.7
z₁[2] = 0.2·2  +  0.4·3   + (-0.1)=  0.4 + 1.2 - 0.1  =  1.5

z₁ = [ 0.5, 0.7, 1.5 ]`}
                </CodeBlock>
              ),
            },
            {
              title: "Layer 1 activation a₁ = ReLU(z₁)",
              body: (
                <>
                  <p className="m-0 mb-2">All three pre-activations are positive, so ReLU passes them through unchanged:</p>
                  <CodeBlock lang="plain">
{`a₁ = ReLU([0.5, 0.7, 1.5]) = [0.5, 0.7, 1.5]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    If any entry had been negative, ReLU would clip it to 0. Here we got lucky — no dead neurons on this input.
                  </p>
                </>
              ),
            },
            {
              title: "Layer 2 pre-activation z₂ = W₂·a₁ + b₂",
              body: (
                <CodeBlock lang="plain">
{`z₂ = 1.0·0.5 + (-1.0)·0.7 + 0.5·1.5 + 0.2
   = 0.5 - 0.7 + 0.75 + 0.2
   = 0.75`}
                </CodeBlock>
              ),
            },
            {
              title: "Output (no activation for regression)",
              body: (
                <>
                  <CodeBlock lang="plain">
{`ŷ = z₂ = 0.75`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    That&apos;s the forward pass. Input [2.0, 3.0] → network says 0.75. If the true target for this example was, say, 1.0, the loss would be (1.0 − 0.75)² = 0.0625.
                    The backward pass (next Part) is how we use that 0.0625 to nudge all 13 weights toward better predictions.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3>In Java: forward pass for a 2-layer MLP</h3>

        <p>
          Here&apos;s what that looks like in code. Nothing fancy — pure double arrays.
        </p>

        <CodeBlock lang="java">
{`public class Mlp {
    double[][] W1;    // hidden × input
    double[]   b1;    // hidden
    double[][] W2;    // output × hidden
    double[]   b2;    // output

    // Forward pass returning the output and (for training later) the hidden activations.
    public double[] forward(double[] x) {
        int hidden = W1.length;
        int output = W2.length;

        // Layer 1: z1 = W1 * x + b1,   a1 = ReLU(z1)
        double[] a1 = new double[hidden];
        for (int j = 0; j < hidden; j++) {
            double sum = b1[j];
            for (int i = 0; i < x.length; i++) {
                sum += W1[j][i] * x[i];
            }
            a1[j] = Math.max(0.0, sum);    // ReLU
        }

        // Layer 2: z2 = W2 * a1 + b2,   no activation (regression output)
        double[] out = new double[output];
        for (int k = 0; k < output; k++) {
            double sum = b2[k];
            for (int j = 0; j < hidden; j++) {
                sum += W2[k][j] * a1[j];
            }
            out[k] = sum;
        }

        return out;
    }
}`}
        </CodeBlock>

        <p>
          Two triple-nested loops. That&apos;s the whole inference engine. Every LLM you&apos;ve ever used runs this same pattern underneath — just with way more layers, bigger matrices, and attention (coming in Module 5) between the layers.
        </p>

        <Callout variant="insight" title="Matmul is the entire bill">
          <p className="m-0">
            In a real network, 99% of the FLOPs spent during inference are in the matrix multiplications <code>W · a</code>. That&apos;s why GPUs matter — they&apos;re matmul factories.
            It&apos;s also why the quadratic cost of attention (Module 5) is such a big deal: it introduces a matmul whose size scales with sequence length squared.
          </p>
        </Callout>

        <Quiz
          question="Forward pass for a single hidden-layer network with 784 inputs, 128 hidden (ReLU), 10 outputs (softmax). Roughly how many multiplications for one input?"
          options={[
            { label: "~922", explanation: "That's just the additions count, roughly. Multiplications are way more — each hidden neuron does 784 multiplies on its own." },
            { label: "~101,000 (784·128 + 128·10)", correct: true, explanation: "Right. Layer 1: 784 inputs × 128 hidden = 100,352. Layer 2: 128 hidden × 10 outputs = 1,280. Total ~101,600 multiplies per forward pass. One image." },
            { label: "~10,000,000", explanation: "That'd be for a much bigger network, or a batch. For a single input through this sized network, it's ~100K." },
            { label: "~922 × 10 = 9,220", explanation: "Multiplications scale with connections, not neurons. Each hidden neuron has 784 connections into it, not 1." },
          ]}
          hint="Count the connections, one multiply per connection."
        />

        <Quiz
          question="You have shapes: x is 2×1, W1 is 3×2, b1 is 3×1, W2 is 1×3, b2 is 1×1. What's the shape of the output?"
          options={[
            { label: "3×1", explanation: "That's the shape of the hidden layer. You still need to apply W2." },
            { label: "1×1", correct: true, explanation: "Correct. W1·x gives 3×1, add b1, ReLU keeps 3×1. Then W2 (1×3) · a1 (3×1) gives 1×1, add b2. Output is a single scalar — right for a regression network." },
            { label: "1×3", explanation: "Check the matmul dimensions: (1×3) × (3×1) = (1×1), not (1×3)." },
            { label: "2×1", explanation: "2×1 is the input shape. The forward pass transforms it through both layers to 1×1." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Forward pass = a chain of matrix multiplies interleaved with activations. Not magic."
          points={[
            { takeaway: "For each layer: z = W·a_prev + b, then a = σ(z).", detail: <>Repeat until you&apos;ve gone through every layer. The final <code>a</code> is the network&apos;s prediction.</> },
            { takeaway: "Shapes: W is (n_out × n_in), a is (n_in), b is (n_out).", detail: <>Every shape error is a layer-dimension mismatch. Sketch shapes on paper before you write Java.</> },
            { takeaway: "Most of the compute is in the matrix multiplies.", detail: <>That&apos;s the entire reason GPUs dominate ML — they do big matmul in parallel. Everything else is overhead.</> },
            { takeaway: "You can compute a forward pass with nothing but nested for loops.", detail: <>No library required. The code in this part is complete, runnable Java — 20 lines for a real network.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 4: BACKPROPAGATION                                            */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="backprop" title="Backpropagation" xp={35} celebration="You just derived the single most important algorithm in modern AI. By hand.">
      <section>
        <h2>Part 4: Backpropagation — the chain rule, bookkept</h2>

        <p>
          Training a network means nudging every weight to reduce the loss. Module 3 covered that nudge: <code>w ← w − η · ∂L/∂w</code>.
          But how do you <em>compute</em> <code>∂L/∂w</code> for a weight buried three layers deep? You can&apos;t just read it off.
        </p>
        <p>
          The answer: the <strong>chain rule</strong>, applied layer by layer from the output back toward the input. That&apos;s backpropagation.
          It has a scary reputation. It shouldn&apos;t — it&apos;s just calculus you already know, executed in a disciplined order.
        </p>

        <h3>The analogy: a kitchen line assigning blame</h3>
        <p>
          Imagine a restaurant kitchen. A customer sends back a dish — too salty. The chef asks the sauté cook, &quot;how much extra salt did you add?&quot;
          The sauté cook points at the stock they used: &quot;mostly that stock was salty — go ask the stock cook.&quot; The stock cook points further back. Each cook passes
          responsibility upstream proportional to how much of the problem came through them.
        </p>
        <p>
          That&apos;s backprop. The error at the output is divided up and sent back through the network, layer by layer. Each weight learns how much it contributed to the final mistake — and updates accordingly.
        </p>

        <h3>The chain rule, one more time</h3>

        <p>
          If <code>L = f(y)</code> and <code>y = g(w)</code>, then:
        </p>

        <CodeBlock lang="plain">
{`∂L/∂w = (∂L/∂y) · (∂y/∂w)`}
        </CodeBlock>

        <p>
          Read it as: &quot;to know how L changes when w changes, multiply how L changes when y changes by how y changes when w changes.&quot; Now stack that many times.
          For our 2-layer network, to get <code>∂L/∂W₁</code> we chain through <code>a₁ → z₁ → W₁</code> all the way back from the loss.
        </p>

        <h3>The four equations of backprop</h3>

        <p>
          For a network with any number of layers, backprop boils down to four rules. I&apos;ll state them, then we&apos;ll derive them in the worked example below.
          Let <code>δ[ℓ]</code> (delta) be <code>∂L/∂z[ℓ]</code> — the error signal at layer ℓ&apos;s pre-activation.
        </p>

        <Callout variant="info" title="Read this first if the equations feel dense">
          <p className="m-0">
            In plain English, the four rules say: <strong>(BP1)</strong>{" "}figure out how wrong the output layer is. <strong>(BP2)</strong>{" "}for each earlier layer, take the &quot;wrongness&quot; from the layer ahead and pull it backwards through the weights — that&apos;s how the blame flows back through the network. <strong>(BP3)</strong>{" "}and <strong>(BP4)</strong>{" "}then convert that per-layer error into the actual update you apply to each bias and each weight.
            <br /><br />
            The funny symbols are: <code>⊙</code> means &quot;multiply two same-shape vectors element by element&quot;, and <code>ᵀ</code> means &quot;flip rows and columns of a matrix&quot; (transpose). You will never write these by hand at work — autograd does it. But seeing them once makes the framework code stop feeling like a black box.
          </p>
        </Callout>

        <CodeBlock lang="plain">
{`(BP1)  δ[L]    = ∇_a L  ⊙  σ'(z[L])             // error at the output layer
(BP2)  δ[ℓ]    = (W[ℓ+1]ᵀ · δ[ℓ+1])  ⊙  σ'(z[ℓ])  // propagate error backward
(BP3)  ∂L/∂b[ℓ] = δ[ℓ]                              // bias gradient
(BP4)  ∂L/∂W[ℓ] = δ[ℓ] · a[ℓ−1]ᵀ                    // weight gradient (outer product)

where  ⊙  = element-wise multiplication
       ᵀ  = transpose`}
        </CodeBlock>

        <p>
          That&apos;s the whole algorithm. Compute <code>δ</code> at the output (BP1), propagate it backward (BP2), then read off bias gradients (BP3) and weight gradients (BP4) at each layer.
        </p>

        <Callout variant="info" title="Why is it 'the chain rule, bookkept'?">
          <p className="m-0">
            Each equation is the chain rule applied to one link in the network. BP1 is just <code>∂L/∂z[L] = ∂L/∂a[L] · ∂a[L]/∂z[L]</code>.
            BP2 chains back through a layer: <code>∂L/∂z[ℓ] = ∂L/∂z[ℓ+1] · ∂z[ℓ+1]/∂a[ℓ] · ∂a[ℓ]/∂z[ℓ]</code>.
            The only thing backprop adds on top of calculus is <em>the order</em>: compute each quantity exactly once, in the right sequence, and reuse it.
          </p>
        </Callout>

        <h3>Derive it on our 2-layer network</h3>

        <p>
          Going back to the earlier example — 2 inputs, 3 hidden (ReLU), 1 output (linear), MSE loss:
        </p>

        <CodeBlock lang="plain">
{`forward:
  z₁ = W₁·x + b₁
  a₁ = ReLU(z₁)
  z₂ = W₂·a₁ + b₂
  ŷ  = z₂                    (linear output, so a₂ = z₂)

loss:
  L = (ŷ − y)²`}
        </CodeBlock>

        <WorkedExample
          title="Backprop — derive every gradient for the 2-layer network"
          subtitle="We'll use the same numbers as Part 3 (x=[2,3], target y=1). Get ready to crunch."
          steps={[
            {
              title: "From Part 3: forward pass values",
              body: (
                <CodeBlock lang="plain">
{`x  = [ 2.0, 3.0 ]
z₁ = [ 0.5, 0.7, 1.5 ]
a₁ = [ 0.5, 0.7, 1.5 ]    (ReLU — all positive)
z₂ = 0.75
ŷ  = 0.75
y  = 1.0                  (target)
L  = (0.75 − 1.0)² = 0.0625`}
                </CodeBlock>
              ),
            },
            {
              title: "Step 1 — error at the output layer (BP1)",
              body: (
                <>
                  <p className="m-0 mb-2">
                    <code>∂L/∂ŷ = 2·(ŷ − y) = 2·(0.75 − 1.0) = −0.5</code>.
                    Since the output has no activation, <code>σ&apos;(z₂) = 1</code>. So:
                  </p>
                  <CodeBlock lang="plain">
{`δ₂ = ∂L/∂z₂ = (∂L/∂ŷ) · σ'(z₂)
            = -0.5 · 1
            = -0.5`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    Negative δ₂ means: to reduce loss, we want <em>more</em>{" "}of z₂ (i.e. bigger ŷ). Makes sense — we predicted 0.75, truth was 1.0.
                  </p>
                </>
              ),
            },
            {
              title: "Step 2 — gradients for layer 2 (BP3, BP4)",
              body: (
                <>
                  <CodeBlock lang="plain">
{`∂L/∂b₂ = δ₂                  = -0.5
∂L/∂W₂ = δ₂ · a₁ᵀ
       = -0.5 · [0.5, 0.7, 1.5]
       = [-0.25, -0.35, -0.75]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    Interpretation: the weight from hidden neuron 2 (which was most active at 1.5) to the output gets the biggest gradient (−0.75).
                    Its update will be the largest. Neurons that contributed more to the prediction take more of the blame.
                  </p>
                </>
              ),
            },
            {
              title: "Step 3 — propagate error back to layer 1 (BP2)",
              body: (
                <>
                  <p className="m-0 mb-2">First, the error signal flowing into layer 1&apos;s pre-activation:</p>
                  <CodeBlock lang="plain">
{`W₂ᵀ · δ₂ = [1.0, -1.0, 0.5]ᵀ · (-0.5)
         = [-0.5, 0.5, -0.25]`}
                  </CodeBlock>
                  <p className="m-0 mb-2">Then element-wise multiply by ReLU&apos;s derivative at z₁. All three pre-activations were positive, so ReLU&apos;(z₁) = [1, 1, 1]:</p>
                  <CodeBlock lang="plain">
{`δ₁ = [-0.5, 0.5, -0.25] ⊙ [1, 1, 1]
   = [-0.5, 0.5, -0.25]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    If any z₁ entry had been negative, ReLU would have zeroed out its gradient — the dead-ReLU problem in action. Nothing flows through a neuron whose output was clipped.
                  </p>
                </>
              ),
            },
            {
              title: "Step 4 — gradients for layer 1 (BP3, BP4)",
              body: (
                <>
                  <CodeBlock lang="plain">
{`∂L/∂b₁ = δ₁                  = [-0.5, 0.5, -0.25]

∂L/∂W₁ = δ₁ · xᵀ
       = [-0.5, 0.5, -0.25]ᵀ · [2.0, 3.0]

       = [ [-0.5·2, -0.5·3],
           [ 0.5·2,  0.5·3],
           [-0.25·2, -0.25·3] ]

       = [ [-1.0, -1.5],
           [ 1.0,  1.5],
           [-0.5, -0.75] ]`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    We now have gradients for every weight and bias in the network — 13 numbers total. A single gradient-descent step updates all 13 using <code>w ← w − η · ∂L/∂w</code>. That&apos;s one training step.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3>The Java code</h3>

        <p>
          Now the same thing, but as a method you could actually call. This is the heart of what you&apos;ll build for the project.
        </p>

        <CodeBlock lang="java">
{`/**
 * One training step for a 2-layer MLP with MSE loss.
 * Hidden: ReLU. Output: linear (regression).
 *
 * Updates W1, b1, W2, b2 in place.
 */
public void trainStep(double[] x, double[] y, double lr) {
    int H = W1.length;         // hidden size
    int O = W2.length;         // output size

    // ---- FORWARD ----
    double[] z1 = new double[H];
    double[] a1 = new double[H];
    for (int j = 0; j < H; j++) {
        double s = b1[j];
        for (int i = 0; i < x.length; i++) s += W1[j][i] * x[i];
        z1[j] = s;
        a1[j] = Math.max(0.0, s);           // ReLU
    }
    double[] yhat = new double[O];
    for (int k = 0; k < O; k++) {
        double s = b2[k];
        for (int j = 0; j < H; j++) s += W2[k][j] * a1[j];
        yhat[k] = s;                         // linear
    }

    // ---- BACKWARD ----
    // δ2 = 2 · (ŷ − y)   (MSE gradient; linear output so σ'(z2)=1)
    double[] d2 = new double[O];
    for (int k = 0; k < O; k++) d2[k] = 2.0 * (yhat[k] - y[k]);

    // δ1 = (W2ᵀ · δ2) ⊙ ReLU'(z1)
    double[] d1 = new double[H];
    for (int j = 0; j < H; j++) {
        double s = 0.0;
        for (int k = 0; k < O; k++) s += W2[k][j] * d2[k];
        d1[j] = (z1[j] > 0) ? s : 0.0;       // ReLU derivative
    }

    // ---- UPDATE ----  (BP3: biases, BP4: weights)
    for (int k = 0; k < O; k++) {
        b2[k] -= lr * d2[k];
        for (int j = 0; j < H; j++) {
            W2[k][j] -= lr * d2[k] * a1[j];
        }
    }
    for (int j = 0; j < H; j++) {
        b1[j] -= lr * d1[j];
        for (int i = 0; i < x.length; i++) {
            W1[j][i] -= lr * d1[j] * x[i];
        }
    }
}`}
        </CodeBlock>

        <p>
          Roughly 40 lines of Java and you have a trainable neural network. This is not a toy — it&apos;s how every framework does it under the hood. PyTorch just adds autograd, GPUs, and ergonomics.
        </p>

        <Callout variant="warn" title="The most common backprop bug">
          <p className="m-0">
            <strong>Using the wrong layer&apos;s values.</strong>{" "}When updating W[ℓ], the weight gradient is <code>δ[ℓ] · a[ℓ−1]ᵀ</code> — it uses δ from the <em>current</em>{" "}layer and activations from the <em>previous</em>{" "}layer.
            It&apos;s easy to accidentally use <code>a[ℓ]</code> instead of <code>a[ℓ−1]</code>, especially in longer networks. When backprop is &quot;almost working&quot; but not quite, check your indices.
          </p>
        </Callout>

        <Quiz
          question="In our 2-layer network, the hidden neuron 3's pre-activation z₁[2] was 1.5 (positive). What if it had been −0.3?"
          options={[
            { label: "Nothing changes — backprop doesn't care about sign.", explanation: "ReLU absolutely cares about sign. Its derivative is 0 for negative inputs — the gradient through that neuron would be killed." },
            { label: "ReLU would output 0 for that neuron, and its δ₁[2] would be 0 — no gradient flows through it this step.", correct: true, explanation: "Exactly. ReLU clips negatives to 0 and its derivative is 0 there, so that neuron contributes nothing to forward pass AND receives no gradient signal. This is the 'dying ReLU' mechanism." },
            { label: "The network would explode.", explanation: "A negative pre-activation is normal and harmless — ReLU just clips it. No explosion." },
            { label: "Only z₁[2] updates change; W₂ is unaffected.", explanation: "W₂'s gradient depends on a₁, and a₁[2] would now be 0, so column 2 of W₂ gets zero gradient this step. Everything downstream of a dead neuron is affected." },
          ]}
          hint="What does ReLU'(z) equal when z < 0?"
        />

        <Quiz
          question="Your network has 3 layers and you've computed δ₃ and δ₂ correctly. For δ₁, which values do you need?"
          options={[
            { label: "W₁, z₁, and δ₂.", correct: true, explanation: "Correct. δ₁ = (W₂ᵀ · δ₂) ⊙ σ'(z₁). You use the next layer's weights (W₂, to project δ₂ back), your own pre-activation (z₁, for the local derivative), and the next layer's error (δ₂)." },
            { label: "W₁, z₁, and δ₃.", explanation: "You always propagate from the LAYER IMMEDIATELY AFTER you, not from the final layer directly. So δ₁ uses δ₂, which was already computed using δ₃. One step at a time." },
            { label: "W₂, z₂, δ₂.", explanation: "Close — but you need σ'(z₁), not σ'(z₂), because δ₁ is the error at layer 1's pre-activation." },
            { label: "Only δ₂.", explanation: "You also need W₂ (to project the error through the weights) and z₁ (for the local activation derivative)." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Backprop is the chain rule, applied layer by layer from output to input, reusing δ to avoid recomputation."
          points={[
            { takeaway: "Backprop computes ∂L/∂w for every weight, efficiently.", detail: <>Without it, you&apos;d recompute derivatives redundantly — or need to perturb each weight numerically, which is intractable for millions of parameters.</> },
            { takeaway: "The four BP equations are all you need to memorize.", detail: <>BP1 starts at the output, BP2 propagates backward, BP3/BP4 read off gradients at each layer. Every framework (PyTorch, TensorFlow, JAX) is built on top of exactly this.</> },
            { takeaway: "δ[ℓ] = ∂L/∂z[ℓ] — the 'error signal' at layer ℓ.", detail: <>Once you have δ, the weight and bias gradients are cheap: δ · aᵀ for weights, δ itself for biases.</> },
            { takeaway: "ReLU's derivative is 0 for negative inputs — gradient stops flowing there.", detail: <>This is why dying ReLU is real: once a neuron is stuck negative, its gradient is zero, so it never updates to get unstuck.</> },
            { takeaway: "Backprop bugs mostly come from off-by-one indexing on layer activations.", detail: <>When updating W[ℓ], use a[ℓ−1] (the previous layer&apos;s activations), not a[ℓ] (this layer&apos;s outputs). Triple-check this in longer networks.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 5: FULL TRAINING LOOP                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="training-loop" title="The full training loop" xp={20} celebration="You can train a neural network from random weights to a working model.">
      <section>
        <h2>Part 5: Putting it together — the full training loop</h2>

        <p>
          With forward pass and backprop in hand, the training loop is anticlimactic. It&apos;s the same loop from Module 3, with more weights to update per step.
        </p>

        <CodeBlock lang="plain">
{`1. Initialize weights randomly.
2. For each epoch:
     shuffle the training data.
     For each mini-batch:
         forward pass to get predictions.
         compute loss.
         backprop to get gradients.
         update every weight:  w ← w − η · ∂L/∂w
3. Evaluate on the held-out test set.
4. If not good enough, tune hyperparameters and go back to step 1.`}
        </CodeBlock>

        <h3>Initialization matters more than you&apos;d think</h3>

        <p>
          If all your weights start at 0, every neuron in a layer computes the same thing, and they all receive the same gradient — they stay identical forever. The network is effectively one neuron per layer.
          You need random initialization to break this symmetry.
        </p>
        <p>
          But big random weights cause exploding activations. Tiny random weights cause vanishing ones. The fix is a <em>scale-aware</em>{" "}initialization:
        </p>

        <Callout variant="info" title="Kaiming (He) initialization — the default for ReLU networks">
          <p className="mb-2">
            For each layer, draw weights from a normal distribution with:
          </p>
          <CodeBlock lang="plain">
{`std = sqrt( 2 / n_in )

where n_in is the number of inputs feeding into the neuron.`}
          </CodeBlock>
          <p className="m-0">
            This keeps the variance of activations roughly constant from layer to layer, so signals neither explode nor vanish. Biases can start at 0.
            For tanh/sigmoid layers, use <strong>Xavier/Glorot</strong>{" "}init instead: <code>std = sqrt(1 / n_in)</code>.
          </p>
        </Callout>

        <CodeBlock lang="java">
{`// Kaiming init for a W matrix of shape (n_out × n_in).
public static double[][] kaimingInit(int nOut, int nIn, Random rng) {
    double std = Math.sqrt(2.0 / nIn);
    double[][] W = new double[nOut][nIn];
    for (int i = 0; i < nOut; i++) {
        for (int j = 0; j < nIn; j++) {
            W[i][j] = rng.nextGaussian() * std;
        }
    }
    return W;
}`}
        </CodeBlock>

        <h3>Mini-batches: averaging the gradient</h3>

        <p>
          The backprop code in Part 4 computes gradients for one training example. In practice you process a <strong>mini-batch</strong> (say, 32 examples at a time) and average their gradients:
        </p>

        <CodeBlock lang="plain">
{`For a batch of B examples:
  compute gradient for each example individually.
  grad_batch = (grad_1 + grad_2 + ... + grad_B) / B
  update:   w ← w − η · grad_batch`}
        </CodeBlock>

        <p>
          Why? Three reasons:
        </p>

        <ul>
          <li><strong>Lower noise.</strong>{" "}Averaging smooths out the per-example randomness — steps are more consistent.</li>
          <li><strong>Hardware efficiency.</strong>{" "}A batch matmul on 32 inputs at once is way faster than 32 separate ones on a GPU.</li>
          <li><strong>Generalization.</strong>{" "}A little batch noise turns out to help the model find flatter minima, which generalize better.</li>
        </ul>

        <Callout variant="warn" title="Don't forget to zero gradients">
          <p className="m-0">
            In frameworks like PyTorch, you have to call <code>optimizer.zero_grad()</code> before each batch. If you don&apos;t, gradients <em>accumulate</em>{" "}across batches and your updates become nonsense.
            In the Java project you&apos;ll write, you&apos;re accumulating explicitly into a buffer you reset each batch — same idea, just visible.
          </p>
        </Callout>

        <h3>Putting it all together: pseudo-code for the project</h3>

        <CodeBlock lang="java">
{`// The full training loop (pseudocode, Java-ish)

Mlp net = new Mlp(inputSize, hiddenSize, outputSize);
net.kaimingInit();

for (int epoch = 0; epoch < numEpochs; epoch++) {
    shuffle(trainingData);
    double epochLoss = 0.0;

    for (int b = 0; b < trainingData.size(); b += batchSize) {
        List<Example> batch = trainingData.subList(b, b + batchSize);

        // zero gradient accumulators
        net.zeroGrad();

        for (Example ex : batch) {
            net.forward(ex.x);
            epochLoss += net.loss(ex.y);
            net.backwardAccumulate(ex.y);   // adds this example's gradients
        }

        net.applyGradients(batchSize, learningRate);   // averages and updates
    }

    double testAcc = net.evaluate(testData);
    System.out.printf("epoch %d  loss=%.4f  testAcc=%.3f%n",
                      epoch, epochLoss / trainingData.size(), testAcc);
}`}
        </CodeBlock>

        <p>
          That&apos;s every neural-network training loop in the world, including the one behind GPT. Scale the layers up, swap activations, add attention — it&apos;s still this skeleton.
        </p>

        <Quiz
          question="You initialize every weight in your network to 0.0. What happens on training?"
          options={[
            { label: "The network trains fine.", explanation: "It will absolutely not train fine — symmetry kills it." },
            { label: "Every neuron in a layer computes the same thing and receives the same gradient, so they stay identical forever.", correct: true, explanation: "Exactly. Zero init breaks neural networks. Random init with Kaiming/Xavier scale breaks the symmetry and keeps gradients well-behaved." },
            { label: "The loss goes to infinity.", explanation: "Not immediately — actually the loss sits there unchanging because nothing learns. Silent failure is worse than loud failure." },
            { label: "It works for the first layer but fails on deeper layers.", explanation: "Fails everywhere — the symmetry problem is at every layer simultaneously." },
          ]}
          hint="If two neurons are identical, what do they learn?"
        />

        <Quiz
          question="You're training with batch size 1 (pure SGD). Loss oscillates wildly from step to step. You switch to batch size 32, same learning rate. What happens?"
          options={[
            { label: "Loss gets even noisier.", explanation: "The opposite — averaging across 32 examples smooths out per-example randomness." },
            { label: "Loss becomes smoother; individual steps are more consistent.", correct: true, explanation: "Right. Mini-batching averages gradients across B examples, so the step is a better estimate of the true gradient. Less noise, steadier descent. (Sometimes you need to bump LR slightly too.)" },
            { label: "You need to multiply the learning rate by 32 to compensate.", explanation: "A common heuristic when scaling batch size is to ALSO scale LR up — but you don't have to, and doing it wrong causes divergence. The direct effect of mini-batching is less noise, not a need to re-tune LR from scratch." },
            { label: "Nothing — batch size only affects speed, not loss behavior.", explanation: "Batch size very directly affects the noise of the gradient estimate, which shapes the loss curve." },
          ]}
        />

        <PartRecap
          title="Part 5 recap"
          gist="Training loop = init, then loop over epochs of mini-batches doing forward + backward + update."
          points={[
            { takeaway: "Init matters. Use Kaiming (std = √(2/n_in)) for ReLU nets.", detail: <>Zero init fails (symmetry). Too-big init explodes. Too-small init vanishes. Kaiming hits the sweet spot for ReLU.</> },
            { takeaway: "Mini-batches average gradients across B examples per step.", detail: <>Smoother updates, faster hardware, sometimes better generalization. 32–256 is typical.</> },
            { takeaway: "The loop: forward, compute loss, backprop, update, repeat.", detail: <>The same four steps run whether you&apos;re training linear regression or a 100B-parameter LLM.</> },
            { takeaway: "Zero your gradient accumulators every batch.", detail: <>This is the #1 source of &quot;why is my loss exploding&quot; in hand-rolled code. Accumulated gradients are corruption.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PROJECT                                                            */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="java-project" title="Project: tiny MLP digit classifier" xp={60} manual manualLabel="I built it — mark done" celebration="You built a real neural network from scratch. No framework, no library. Yours.">
      <section>
        <h2>Project: tiny MLP digit classifier in Java</h2>

        <p>
          Time to ship. You&apos;re going to build a multi-layer perceptron that classifies handwritten digits from the MNIST dataset — 28×28 grayscale images, 10 classes (0–9).
          No TensorFlow, no DeepJava, no library. Just Java, arrays, and the math from the last five parts.
        </p>

        <Callout variant="info" title="Why MNIST and not something fancier">
          <p className="m-0">
            MNIST is the &quot;hello world&quot; of deep learning for a reason: small enough to train on a laptop in minutes, rich enough that simple networks hit 97%+ and bugs show up visibly as wrong predictions.
            You&apos;ll debug your network by looking at individual misclassified digits — which is possible only because each input is 784 pixels, not a million.
          </p>
        </Callout>

        <h3>The spec</h3>

        <div className="not-prose rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-5 my-4 text-sm">
          <div className="font-bold mb-3">Build an MLP that hits ≥ 90% accuracy on the MNIST test set.</div>
          <ol className="list-decimal ml-5 space-y-2">
            <li>
              <strong>Load the data.</strong>{" "}Use the standard MNIST files (<code>train-images-idx3-ubyte</code>, <code>train-labels-idx1-ubyte</code>, and the test counterparts).
              Parse by hand — it&apos;s ~30 lines. Normalize pixel values to <code>[0, 1]</code> by dividing by 255.
            </li>
            <li>
              <strong>Network architecture.</strong> 784 → 128 (ReLU) → 10 (softmax). 101,770 parameters total.
            </li>
            <li>
              <strong>Loss.</strong>{" "}Cross-entropy. For one example with one-hot label y and softmax output p: <code>L = −Σ yᵢ · log(pᵢ)</code>.
              The gradient <code>∂L/∂z[L] = p − y</code> — convenient! (You can derive this as a bonus, or trust it.)
            </li>
            <li>
              <strong>Optimizer.</strong>{" "}Plain SGD with mini-batches. Batch size 32, learning rate 0.1, 10 epochs. Kaiming init.
            </li>
            <li>
              <strong>Evaluation.</strong>{" "}Log training loss each epoch. At the end, compute test accuracy. Also dump 10 examples of misclassified digits (ASCII art is fine) — seeing them is part of the lesson.
            </li>
          </ol>
        </div>

        <h3>Suggested file layout</h3>

        <CodeBlock lang="plain">
{`src/main/java/aiforengineers/mnist/
  ├── MnistLoader.java     // parses IDX files, normalizes pixels
  ├── Mlp.java             // forward, backward, zeroGrad, applyGradients
  ├── Activations.java     // relu, softmax (stable), and their derivatives
  ├── Loss.java            // crossEntropy(p, y_onehot)
  ├── Trainer.java         // main loop + evaluation
  └── Main.java            // entry point, wires everything together`}
        </CodeBlock>

        <h3>Gotchas you&apos;ll hit</h3>

        <ul>
          <li>
            <strong>Softmax overflow.</strong>{" "}Always subtract the max before exponentiating. If you see NaN in your losses, this is almost certainly why.
          </li>
          <li>
            <strong>Cross-entropy + log(0).</strong>{" "}If a predicted probability is 0 and its true label is 1, you get <code>log(0) = −∞</code>. Clamp probabilities to <code>[1e−12, 1 − 1e−12]</code> before taking the log.
          </li>
          <li>
            <strong>Label encoding.</strong>{" "}Convert integer labels (0–9) to one-hot vectors (length 10, single 1) for cross-entropy. Keep the integer around too, for evaluating accuracy.
          </li>
          <li>
            <strong>Shuffling.</strong>{" "}Shuffle the training indices every epoch. If you don&apos;t, you&apos;ll see a weird zigzag in loss as the model oscillates between over-fitting to one class and the next.
          </li>
          <li>
            <strong>Numerical check.</strong>{" "}Before trusting your backprop, do a <em>gradient check</em>: compute <code>∂L/∂w</code> numerically as <code>(L(w+ε) − L(w−ε)) / (2ε)</code> with ε = 1e−5, and compare to your analytical gradient. They should match to 5+ decimal places. If not, your backprop is wrong somewhere.
          </li>
        </ul>

        <Callout variant="insight" title="Milestones to aim for">
          <p className="mb-2">
            The project is a checklist, not a sprint. Target these milestones in order:
          </p>
          <ol className="list-decimal ml-5 m-0 space-y-1 text-sm">
            <li><strong>Forward pass runs</strong> — random weights, get <em>some</em>{" "}output per image. No training yet.</li>
            <li><strong>Gradient check passes</strong> — your backprop matches numerical gradients on one example.</li>
            <li><strong>Overfits a single batch</strong> — train on the same 32 examples over and over; loss should hit near-zero. If not, your code is broken.</li>
            <li><strong>Trains on the full set</strong> — loss drops each epoch. Test accuracy &gt; 85% after 5 epochs.</li>
            <li><strong>Hits 90%+ accuracy</strong> — tune LR, maybe increase hidden size to 256. Inspect misclassified digits.</li>
          </ol>
          <p className="m-0 mt-2 text-xs italic">
            Hitting each milestone in order pinpoints bugs: if it overfits a batch but the full training loss plateaus, the bug is in shuffling or batching, not in forward/backward. Isolate by stages.
          </p>
        </Callout>

        <Callout variant="warn" title="Only mark this checkpoint done when the model actually runs">
          <p className="m-0">
            You can claim the XP by clicking the button below — nobody&apos;s watching — but Modules 5 and onward <em>assume</em>{" "}you&apos;ve built this.
            The feel for gradient check passing, the satisfaction of misclassified digits that actually look ambiguous, the surprise when your 90%-accurate model confidently mislabels a clear 4 as a 9 — those are worth more than any XP number.
          </p>
        </Callout>
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="neural-networks" id="final" title="Final quiz — Module 4" xp={30} celebration="Phase 1's hardest module, passed. Attention (Module 5) is going to feel way easier than people warned you about.">
      <section>
        <h2>Final quiz — Module 4</h2>

        <p>
          Six questions synthesizing everything. If any of these are a reach, re-read that Part.
        </p>

        <Quiz
          question="Your 3-layer network uses sigmoid everywhere. The final layer trains; the first layer barely changes. You switch all hidden layers to ReLU and re-train. What happens?"
          options={[
            { label: "Nothing — the problem is in the initialization.", explanation: "Init matters, but the core symptom (early layers don't learn) is vanishing gradients, which is a sigmoid/tanh problem that ReLU directly fixes." },
            { label: "Early layers start learning as well — ReLU's derivative is 1 for positive inputs, so gradients don't vanish as they propagate back.", correct: true, explanation: "Exactly. Sigmoid's 0.25-max derivative compounds to near-zero across layers. ReLU's 1-or-0 derivative doesn't shrink at all. This is why ReLU killed sigmoid for hidden layers in the 2010s." },
            { label: "The network stops training entirely because ReLU kills too many neurons.", explanation: "Dying ReLU is a real concern but doesn't typically kill a whole network. And switching fixes the vanishing-gradient symptom described here." },
            { label: "You need to also switch the output layer's activation to ReLU.", explanation: "Output activation depends on the task (sigmoid for binary, softmax for multiclass, linear for regression). Don't touch it based on hidden-layer changes." },
          ]}
        />

        <Quiz
          question="Forward pass: x=[1, 2], W₁=[[1, 0], [-1, 1]], b₁=[0, 0], ReLU activation, one output layer W₂=[1, 1], b₂=0, linear. What's ŷ?"
          options={[
            { label: "2", correct: true, explanation: "z₁ = [1·1 + 0·2, -1·1 + 1·2] = [1, 1]. ReLU keeps both. a₁ = [1, 1]. z₂ = 1·1 + 1·1 + 0 = 2. ŷ = 2." },
            { label: "0", explanation: "Compute z₁ first: W₁·x = [1, 1], both positive. After ReLU and the output layer, ŷ = 2." },
            { label: "3", explanation: "Double-check z₁[1]: -1·1 + 1·2 = 1, not 2. Then W₂·a₁ = 1 + 1 = 2." },
            { label: "1", explanation: "Compute both hidden activations: [1, 1]. Output sums them: 1 + 1 = 2." },
          ]}
          hint="Layer by layer: z₁, a₁, then z₂."
        />

        <Quiz
          question="Which of these is NOT part of the backprop algorithm?"
          options={[
            { label: "Propagate error δ backward through each layer using δ[ℓ] = (W[ℓ+1]ᵀ · δ[ℓ+1]) ⊙ σ'(z[ℓ])", explanation: "This is BP2 — essential." },
            { label: "Compute the Hessian (second derivatives) of the loss.", correct: true, explanation: "Right — backprop only uses first derivatives (the gradient). Second-order methods (Newton's method, L-BFGS) do use the Hessian, but standard backprop does not. Hessian computation is one of the main things modern DL avoids." },
            { label: "Compute weight gradients as δ[ℓ] · a[ℓ−1]ᵀ", explanation: "This is BP4 — the outer product giving you ∂L/∂W. Essential." },
            { label: "Compute the error at the output layer from the loss gradient and σ'(z[L])", explanation: "That's BP1 — the starting point of backprop." },
          ]}
        />

        <Quiz
          question="You initialize weights to all zeros. On the first training step you compute gradients. What's true?"
          options={[
            { label: "The gradient is zero everywhere, so nothing moves.", explanation: "The gradient isn't zero — bias gradients in particular are non-zero. But the weight gradients have a subtler problem." },
            { label: "Every neuron in a layer receives the same gradient, so they update identically and stay identical forever.", correct: true, explanation: "Exactly. With zero weights, all neurons in a layer produce the same output and receive the same incoming gradient. They move in lockstep. The 'neurons' are effectively one neuron. Symmetry must be broken with random init." },
            { label: "ReLU saves you because it's non-linear.", explanation: "ReLU doesn't help here — all inputs to ReLU are 0 (since weights are 0 and biases are 0), so all outputs are 0, all derivatives are 0 (at z=0 either choice of subgradient works in practice), and symmetry is total." },
            { label: "The learning rate fixes it automatically.", explanation: "Multiplying zero by anything is still zero-ish. LR can't escape the symmetry." },
          ]}
        />

        <Quiz
          question="You're classifying images into 10 classes. Your last layer has 10 neurons with SIGMOID activation (not softmax). Outputs for one image: [0.9, 0.8, 0.7, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]. What's the issue?"
          options={[
            { label: "The outputs don't sum to 1 — you can't treat them as a probability distribution over mutually exclusive classes.", correct: true, explanation: "Right. Sigmoid treats each output INDEPENDENTLY (good for multi-label: 'has cat AND has car'). For mutually-exclusive classes you need softmax, which ties outputs together via the sum-to-1 constraint. Here, three classes all look 'pretty likely' with no forcing of exclusivity." },
            { label: "Sigmoid is too slow.", explanation: "Sigmoid's slow for OTHER reasons (vanishing gradients in hidden layers), but in a 10-output classifier speed isn't the issue. Correctness is." },
            { label: "The outputs are miscalibrated.", explanation: "Calibration is a separate, real concern. But the IMMEDIATE issue is the choice of activation: sigmoid for 10 mutually-exclusive classes is modeling the wrong thing." },
            { label: "No issue — sigmoid is standard for multiclass.", explanation: "Softmax is standard for multiclass. Sigmoid is for binary or for multi-LABEL (where classes aren't mutually exclusive)." },
          ]}
        />

        <Quiz
          question="You finished the MNIST project. Your test accuracy is 94%. You inspect misclassified digits and find most of them are genuinely ambiguous (slanted 4s that look like 9s, closed 2s that look like 7s). What's the right next step?"
          options={[
            { label: "Train for 10× more epochs — clearly you're underfitting.", explanation: "If the remaining errors are genuinely ambiguous to a human, the model isn't underfitting — it's hitting the irreducible noise floor of the data. More epochs will mostly overfit." },
            { label: "Accept the limit and move on — for a simple MLP, 94%+ with ambiguous remaining errors is essentially as good as it gets. Bigger improvements require structural changes (convolutions, data augmentation).", correct: true, explanation: "Exactly right. When errors look human-level-hard, you've extracted what this model architecture can. The next leap comes from better architecture (CNNs) or more data, not from training harder. Knowing when to stop is a crucial ML engineering skill." },
            { label: "Double the hidden layer size.", explanation: "Might squeeze out a fraction of a percent, but the marginal gains stop fast. You'd mostly be adding overfit capacity." },
            { label: "Your backprop must still be buggy.", explanation: "94% with human-ambiguous errors is actually a sign your model is WORKING correctly and learning genuine features — bugs usually present as much lower accuracy or not-learning-at-all, not as mostly-correct-with-reasonable-mistakes." },
          ]}
        />
      </section>
      </Checkpoint>

      {/* NEXT MODULE */}
      <section className="mt-12 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mt-0 mb-2">You built a real neural network. What&apos;s next?</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Module 5 adds <strong>attention</strong> — the one idea on top of MLPs that unlocked the whole transformer era.
          Now that you can derive backprop by hand, the math of attention will feel like a variation on a theme, not a new language.
        </p>
        <Link
          href="/courses/ai/modules/transformers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
        >
          Continue to Module 5 →
        </Link>
      </section>
        <ModuleNav courseId="ai" currentSlug="neural-networks" />
    </article>
  );
}
