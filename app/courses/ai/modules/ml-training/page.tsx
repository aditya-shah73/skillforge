import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import TestYourself from "@/components/TestYourself";
import WorkedExample from "@/components/WorkedExample";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import PartRecap from "@/components/PartRecap";
import CodeExercise from "@/components/CodeExercise";
import GradientBowl from "@/components/GradientBowl";
import { getModuleBySlug } from "@/lib/modules";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "gradient-descent", title: "Gradient descent: how models actually learn" },
  { id: "learning-rate", title: "Learning rate: the one knob you'll tune" },
  { id: "overfitting", title: "Overfitting and the bias–variance trade-off" },
  { id: "metrics", title: "Evaluation metrics: are we actually any good?" },
  { id: "java-project", title: "Project: train linear regression in Java" },
  { id: "final", title: "Final quiz" },
];

export default function MLTrainingModule() {
  const mod = getModuleBySlug("ml-training")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">How models actually learn</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          Gradient descent, learning rate, overfitting, evaluation — the loop that turns data into weights.
        </p>
        <BookmarkButton courseId="ai" moduleSlug="ml-training" />
        <ModuleProgress moduleSlug="ml-training" checkpoints={CHECKPOINTS} />
      </header>

      {/* PROMISE BOX */}
      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Module 2 gave you a model that can <em>predict</em> and a loss that can <em>score</em>. This module is the missing middle:
          the thing that takes bad weights and makes them good. By the end you&apos;ll:
        </p>
        <ol className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-decimal ml-5">
          <li>Derive <strong>gradient descent</strong> by hand and explain why the minus sign is there.</li>
          <li>Diagnose a <strong>learning-rate</strong> disaster from a loss curve alone.</li>
          <li>Tell <strong>overfitting</strong> apart from <strong>underfitting</strong> on sight.</li>
          <li>Pick the right <strong>metric</strong> (RMSE vs accuracy vs F1) for a problem you&apos;ve never seen.</li>
          <li>Finish your Java linear-regression project — now it <em>trains itself</em>.</li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
          Same deal as before: orange &quot;Confidence check&quot; boxes appear where implementing-from-scratch
          is the real skill. Don&apos;t skip them.
        </p>
      </section>

      {/* ================================================================= */}
      {/* PART 1: GRADIENT DESCENT                                           */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="gradient-descent" title="Gradient descent" xp={25} celebration="You understand the core algorithm of all modern ML. Seriously.">
      <section>
        <h2>Part 1: Gradient descent — how models actually learn</h2>

        <Callout variant="info" title="Picking up exactly where Module 2 left off">
          <p className="m-0">
            Module 2 ended with a model that can <em>predict</em> (linear regression), a loss that can <em>score</em> the predictions (MSE), and a metric that can <em>tell us how good those predictions are</em> on held-out data. What we never answered: <strong>where do the weights actually come from?</strong> In Module 2 we hand-eyeballed slope and intercept off the LineFitDemo. That obviously doesn&apos;t scale. This module is the missing middle — the algorithm that takes <em>any</em> initial guess at the weights and walks them downhill on the loss surface until they&apos;re good. It&apos;s the same loop whether you&apos;re fitting 2 weights for house prices or 175 billion for GPT-3.
          </p>
        </Callout>

        <h3>Start with an analogy: lost in a fog on a mountainside</h3>
        <p>
          You&apos;re on a mountain, thick fog, and you need to get to the valley. You can&apos;t see more than a meter in any direction.
          What do you do? You feel around with your feet, find the direction where the ground drops the steepest, take a small step, and repeat.
        </p>
        <p>
          Eventually — assuming the mountain is well-behaved — you end up at the bottom. You never had a map. You just kept going downhill.
        </p>
        <p>
          <strong>That&apos;s gradient descent.</strong> The &quot;mountain&quot; is the loss function. Your &quot;position&quot; is the current set of weights.
          The &quot;steepest downhill direction&quot; is the negative of the gradient. And the training loop just walks — one small step at a time — until the loss stops dropping.
        </p>

        <Callout variant="insight" title="The whole module in one paragraph">
          <p className="m-0">
            Every &quot;training&quot; algorithm — from a 1960s linear regression to GPT-4 — is some flavor of: <em>compute the gradient of the loss with respect
            to the weights, nudge the weights in the opposite direction, repeat</em>. The rest of the module is refinements, diagnostics, and gotchas on this one idea.
          </p>
        </Callout>

        <h3>The formula (and why the minus sign is there)</h3>

        <p>
          For each weight <code>w</code>, the update rule is:
        </p>

        <CodeBlock lang="plain">
{`w_new = w_old − η · (∂L / ∂w)

where:
  η (eta)      = learning rate — a small positive number (e.g. 0.01)
  ∂L / ∂w      = gradient of loss with respect to w (a slope)`}
        </CodeBlock>

        <p>
          Read it out loud: <em>&quot;the new weight equals the old weight, minus learning rate times the gradient.&quot;</em>
        </p>

        <p>
          Why minus? Because the gradient points <strong>uphill</strong> — in the direction of <em>fastest increase</em> of the loss. We want to decrease the loss,
          so we go the opposite way. Subtracting the gradient is how we do that.
        </p>

        <Callout variant="info" title="Gradient = slope, generalized">
          <p className="mb-2">
            For a one-variable function <code>L(w)</code>, the &quot;gradient&quot; is just the derivative <code>dL/dw</code> — the slope at a point.
            If the slope is +3 at your current <code>w</code>, the loss is going up as <code>w</code> goes up, so you&apos;d subtract (3 · η) to move the other way.
          </p>
          <p className="m-0">
            When there are many weights, the gradient is a <em>vector</em> — one partial derivative per weight. Each weight gets its own update using its own partial.
          </p>
        </Callout>

        <h3>See it with one weight</h3>

        <p>
          Play with the bowl below. The curve is a simple loss <code>L(w) = (w − 3)² + 0.5</code>. The minimum is at <code>w = 3</code>, loss <code>= 0.5</code>.
          Start far away (say <code>w = −2</code>), pick a learning rate, and press &quot;Step&quot; to take a gradient-descent step. Watch the dot walk down the bowl.
        </p>

        <GradientBowl />

        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Notice: steps are <em>big</em> at the sides (steep slope → big gradient → big step) and <em>tiny</em> near the bottom (shallow slope → small gradient → small step).
          The algorithm self-corrects. That&apos;s a huge deal.
        </p>

        <h3>Worked example: one step by hand</h3>

        <WorkedExample
          title="One step of gradient descent on a linear model"
          subtitle="One feature, one weight, one data point — smallest case that still shows the idea."
          steps={[
            {
              title: "Set up the problem",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Model: <code>ŷ = w · x</code>. Current weight: <code>w = 0.5</code>. (We&apos;re skipping bias to keep it simple.)
                  </p>
                  <p className="m-0 mb-2">
                    One training example: <code>x = 4, y = 3</code> (so the true relationship has <code>w ≈ 0.75</code>, but we don&apos;t know that).
                  </p>
                  <p className="m-0">
                    Loss: squared error for this one point, <code>L = (ŷ − y)²</code>. Learning rate: <code>η = 0.01</code>.
                  </p>
                </>
              ),
            },
            {
              title: "Predict & measure",
              body: (
                <CodeBlock lang="plain">
{`ŷ = w · x  =  0.5 · 4  =  2.0
error = ŷ − y  =  2.0 − 3  =  −1.0
L = (−1.0)²  =  1.0`}
                </CodeBlock>
              ),
            },
            {
              title: "Compute the gradient",
              body: (
                <>
                  <p className="m-0 mb-2">
                    We need <code>∂L/∂w</code>. Using the chain rule on <code>L = (w·x − y)²</code>:
                  </p>
                  <CodeBlock lang="plain">
{`∂L/∂w = 2 · (w·x − y) · x
       = 2 · (−1.0) · 4
       = −8.0`}
                  </CodeBlock>
                  <p className="m-0 text-xs italic">
                    The gradient is negative — meaning &quot;if you increase w, the loss goes down.&quot; Good sign, since we picked <code>w = 0.5</code> and the truth is closer to <code>0.75</code>.
                  </p>
                </>
              ),
            },
            {
              title: "Take the step",
              body: (
                <CodeBlock lang="plain">
{`w_new  =  w_old − η · gradient
       =  0.5 − 0.01 · (−8.0)
       =  0.5 + 0.08
       =  0.58`}
                </CodeBlock>
              ),
            },
            {
              title: "Check we moved the right way",
              body: (
                <>
                  <p className="m-0 mb-2">New prediction: <code>ŷ = 0.58 · 4 = 2.32</code>. New loss: <code>(2.32 − 3)² = 0.4624</code>.</p>
                  <p className="m-0">
                    Old loss was <code>1.0</code>, new loss is <code>0.46</code>. <strong>It dropped.</strong> That&apos;s one step. A full training run does this
                    thousands of times, often averaging the gradient across many examples per step instead of just one.
                  </p>
                </>
              ),
            },
          ]}
        />

        <h3>Batch, stochastic, mini-batch — the three dials</h3>
        <p>
          In the worked example we used <em>one</em> data point to compute the gradient. In real training, you have a choice:
        </p>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Batch GD</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Compute the gradient using <em>all</em> training examples, average them, then take one step.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Most accurate gradient, but slow on big datasets. Each step touches every example.
            </p>
          </div>
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm">
            <div className="font-bold text-amber-900 dark:text-amber-200 mb-1">Stochastic GD (SGD)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              One example at a time. Step after every single one.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Very fast per step, but noisy — path zig-zags down the hill.
            </p>
          </div>
          <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-4 text-sm">
            <div className="font-bold text-violet-900 dark:text-violet-200 mb-1">Mini-batch GD</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              A small batch (32, 64, 256) per step. The sweet spot.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              What everyone actually does. GPU-friendly, decent gradient estimate, fast.
            </p>
          </div>
        </div>

        <Callout variant="info" title="You'll hear 'SGD' even when it's mini-batch">
          <p className="m-0">
            The literature is sloppy about this. PyTorch&apos;s <code>torch.optim.SGD</code> does mini-batch if you feed it a batch, and people still call it &quot;SGD.&quot;
            For your purposes, &quot;SGD&quot; usually means &quot;some variant of gradient descent that processes the data in batches.&quot;
          </p>
        </Callout>

        <Quiz
          question="You run batch GD for 1000 steps on a 1,000,000-row dataset. How many times did your code look at each individual training example?"
          options={[
            { label: "1,000,000 times — once per row, total.", explanation: "No — batch GD uses every row on every step." },
            { label: "1,000 times each — every step touches every row.", correct: true, explanation: "Right. Batch GD computes the gradient across all rows each step. That's why it's slow on big data — 1 billion row-visits total." },
            { label: "Once each — one pass per step, split across rows.", explanation: "No — that describes one step of stochastic/mini-batch, not batch GD." },
            { label: "It depends on the learning rate.", explanation: "Learning rate controls step size, not how much data each step sees." },
          ]}
        />

        <Quiz
          question="Your loss is going UP during training. The most likely single cause, before anything exotic, is:"
          options={[
            { label: "You need more data.", explanation: "More data helps generalization, but won't make loss go up on a functioning optimizer." },
            { label: "The model is too simple.", explanation: "Too-simple models plateau high — they don't diverge upward." },
            { label: "Your learning rate is too large — you're overshooting the minimum and climbing the far side.", correct: true, explanation: "Exactly. Lowering η by 10× is the first thing to try when loss goes up or oscillates wildly." },
            { label: "You forgot the minus sign in the update and are doing gradient ASCENT.", explanation: "That'd also make loss go up, but it's a bug, not a cause. The canonical first-suspect is LR too high. (Still — always check that minus sign.)" },
          ]}
          hint="What does a too-big step do on a curved surface?"
        />

        <PartRecap
          title="Part 1 recap"
          gist="Training = walking downhill on the loss surface, one small step at a time."
          points={[
            { takeaway: "Gradient descent: w ← w − η · ∂L/∂w", detail: <>The minus sign is because the gradient points <em>uphill</em>; we want to go down. η is the learning rate — the step size.</> },
            { takeaway: "The gradient is a slope — it tells you which way loss increases fastest.", detail: <>For each weight individually, it&apos;s a partial derivative. The collection of them is a vector pointing in the steepest-uphill direction.</> },
            { takeaway: "Steps self-scale: big gradient → big step, small gradient → small step.", detail: <>You don&apos;t have to slow down manually near the minimum; the gradient shrinks and the algorithm shrinks with it.</> },
            { takeaway: "Three flavors: batch (all rows per step), stochastic (one row), mini-batch (32–256).", detail: <>Mini-batch is what everyone actually uses. Batch is too slow on big data; pure stochastic is too noisy.</> },
            { takeaway: "If loss is going up, suspect learning rate first.", detail: <>You&apos;re overshooting the minimum. Drop η by 10× and try again — that fixes 80% of &quot;my model won&apos;t train&quot; bugs.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 2: LEARNING RATE                                              */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="learning-rate" title="Learning rate" xp={20} celebration="The one hyperparameter you'll tune in every ML project ever. Nailed.">
      <section>
        <h2>Part 2: Learning rate — the one knob you&apos;ll actually tune</h2>

        <p>
          If you only tune one hyperparameter in your entire career, it&apos;ll be the learning rate. Everything else — model size, batch size, regularization —
          matters <em>less often</em> than picking the right η. Good news: you can tune it just by looking at the loss curve.
        </p>

        <h3>The three failure modes (and the Goldilocks zone)</h3>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-1">Too small (e.g. 0.0001)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Loss drops — but painfully slowly. Hours of training to reach what a better η gets in minutes.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Curve: a gentle, almost-flat glide downward that never seems to stop dropping.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Goldilocks (e.g. 0.01)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Loss drops sharply at first, then plateaus as the model converges.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Curve: classic &quot;elbow&quot; shape — steep early, flat later. This is what you want.
            </p>
          </div>
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm">
            <div className="font-bold text-rose-900 dark:text-rose-200 mb-1">Too big (e.g. 1.0)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Loss oscillates or explodes. You overshoot the minimum every step — or worse, each step lands further uphill than the last.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Curve: bouncing up and down, or marching upward to NaN.
            </p>
          </div>
        </div>

        <Callout variant="insight" title="Read the loss curve first — tune from there">
          <p className="m-0">
            You don&apos;t guess the learning rate from theory. You run for a few hundred steps, plot the loss, and read it:
            &quot;did it drop fast enough?&quot; → try 3× larger. &quot;did it wiggle or explode?&quot; → try 3× smaller.
            Binary-searching to the right LR takes maybe 15 minutes on any real problem.
          </p>
        </Callout>

        <h3>Try it yourself</h3>
        <p>
          Reset the bowl below. Set the LR slider to <strong>0.001</strong> and step — see how painfully slow it is.
          Then reset and try <strong>1.05</strong> — watch it oscillate and diverge. Then try <strong>0.5</strong> — it works, but bounces. <strong>0.2</strong> is about perfect for this bowl.
        </p>

        <GradientBowl />

        <h3>Choosing an initial learning rate</h3>

        <p>
          For a cold start with no prior knowledge:
        </p>

        <ul>
          <li><strong>Linear / logistic regression:</strong> start at <code>0.01</code>. Almost always works.</li>
          <li><strong>Small neural networks (toy MLPs):</strong> <code>0.01</code> to <code>0.001</code>.</li>
          <li><strong>Transformers / deep nets:</strong> <code>1e-4</code> or <code>3e-4</code> (with Adam — covered later).</li>
          <li><strong>Fine-tuning a pre-trained model:</strong> <code>1e-5</code>. Smaller, because you don&apos;t want to destroy what&apos;s already there.</li>
        </ul>

        <Callout variant="info" title="LR schedules — a preview">
          <p className="mb-2">
            In real training runs, people don&apos;t use a single fixed η for the whole run. They use a <strong>schedule</strong> — big at the start (cover ground fast),
            then decay it over time (fine-tune the minimum).
          </p>
          <p className="m-0">
            The two you&apos;ll see: <strong>step decay</strong> (drop η by 10× every N epochs) and <strong>cosine decay</strong> (smooth decrease to ~0).
            You don&apos;t need to implement these yourself in your linear regression project, but you&apos;ll see them in every real training codebase.
          </p>
        </Callout>

        <ClassifyChallenge
          title="Diagnose the loss curve"
          prompt="For each loss curve, pick the most likely cause."
          buckets={[
            { id: "small", label: "LR too small", color: "sky" },
            { id: "good", label: "LR about right", color: "emerald" },
            { id: "big", label: "LR too big", color: "rose" },
          ]}
          items={[
            { id: "a", label: "Drops from 8.0 → 0.5 in the first 50 steps, then flattens at 0.48 for the rest of training.", answer: "good", explanation: "Classic elbow. Fast early progress, then convergence to a plateau — textbook healthy curve." },
            { id: "b", label: "Oscillates between 3.2 and 4.8 from step 1 onward, never really drops.", answer: "big", explanation: "Bouncing across the minimum. You're stepping so far each iteration that you overshoot. Cut LR." },
            { id: "c", label: "Starts at 8.0, after 500 steps it's at 7.2.", answer: "small", explanation: "Drop is real but glacial. At this rate you'd need 50,000 steps. Bump LR 10×." },
            { id: "d", label: "Drops nicely to 1.2, then jumps to 4.5, then 18, then NaN.", answer: "big", explanation: "Classic divergence. Loss was fine until a steep region — the step size that worked on gentle terrain threw you off a cliff. Cut LR (or use a schedule that decays it)." },
          ]}
        />

        <Quiz
          question="You finish training. Loss dropped to 0.42. You double the learning rate and retrain from scratch — loss now drops to 0.28. What's the takeaway?"
          options={[
            { label: "Doubling LR always helps.", explanation: "No — had you doubled from Goldilocks upward, you'd have diverged." },
            { label: "Your original LR was too small — you were stopping in a shallow dip before finding a lower one.", correct: true, explanation: "Right. A slightly bigger step can 'hop over' local flat spots that trap a too-cautious optimizer. Good sign to push LR further and see where it breaks." },
            { label: "Both runs are fine, the difference is random.", explanation: "A consistent 0.14 improvement on the same data/init is signal, not noise." },
            { label: "You should reduce LR next time — 0.28 means you converged, so the model is done.", explanation: "Converging to a lower loss is better. You don't 'undo' the improvement by reducing LR next time." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Learning rate is THE hyperparameter. Read the loss curve, tune from there."
          points={[
            { takeaway: "Too small η → slow, almost-flat loss curve. Too big η → oscillation or divergence.", detail: <>The Goldilocks zone shows a sharp drop followed by a plateau — the classic elbow shape. That&apos;s the only curve shape you want to see.</> },
            { takeaway: "Default starting points: 0.01 for linear/logistic, 3e-4 for neural nets, 1e-5 for fine-tuning.", detail: <>These are not laws — just sane starting points that work 80% of the time. Binary-search from there.</> },
            { takeaway: "To tune: run a short job, look at the curve, adjust by 3–10×. Iterate.", detail: <>You almost never read papers to pick an LR; you read your own loss curve. It&apos;s a visual skill, not a theoretical one.</> },
            { takeaway: "In production training, people use schedules — LR decays over time.", detail: <>Step decay and cosine decay are the two common flavors. Both reflect the same intuition: cover ground early, fine-tune late.</> },
            { takeaway: "A too-small LR can trap you in a worse minimum than a slightly bigger one would find.", detail: <>Tiny steps can get stuck in shallow dips that a larger-step walker would hop right over. Err slightly on the side of &quot;bigger than you think.&quot;</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 3: OVERFITTING + BIAS-VARIANCE                                */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="overfitting" title="Overfitting" xp={25} celebration="You can tell over- from under-fitting on sight. That's a real superpower.">
      <section>
        <h2>Part 3: Overfitting and the bias–variance trade-off</h2>

        <h3>Start with an analogy: the student who memorizes the answer key</h3>

        <p>
          Imagine two students preparing for a math exam. Student A studies the concepts — they can solve problems they&apos;ve never seen before.
          Student B memorizes the practice tests word-for-word — they&apos;ll ace any question on the practice tests, and completely bomb the real one.
        </p>
        <p>
          Student B <strong>overfit</strong>. They learned the training data so well that they failed to learn the <em>pattern</em> underneath it.
          Real ML systems do this all the time — they&apos;ll get 99% accuracy on data they&apos;ve seen, 65% on data they haven&apos;t, and announce themselves cured.
        </p>

        <Callout variant="insight" title="The single most important slogan in ML">
          <p className="m-0">
            <strong>Training loss is not what you care about.</strong> You care about <em>test loss</em> — performance on data the model has never seen.
            Every serious ML practice — validation splits, regularization, early stopping, cross-validation — exists to close the gap between them.
          </p>
        </Callout>

        <h3>Underfitting, good fit, overfitting — a visual</h3>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-1">Underfit (high bias)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Model is too simple to capture the pattern. Think: fitting a straight line to data that&apos;s obviously curvy.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Symptom: train loss is BAD and test loss is BAD. Both ~equally bad.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">Good fit</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Model captures the real signal but ignores the noise. Generalizes.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Symptom: train loss is LOW and test loss is LOW — and they&apos;re close to each other.
            </p>
          </div>
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm">
            <div className="font-bold text-rose-900 dark:text-rose-200 mb-1">Overfit (high variance)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300">
              Model is so flexible it memorizes the training points, including the noise.
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400 italic">
              Symptom: train loss is VERY LOW, test loss is HIGH. BIG GAP between them.
            </p>
          </div>
        </div>

        <h3>Bias and variance, as a pair of errors</h3>

        <p>
          The &quot;bias–variance trade-off&quot; is a way of naming <em>why</em> a model is bad. Every wrong prediction has two sources of error:
        </p>

        <ul>
          <li>
            <strong>Bias:</strong> error from the model being <em>too simple</em> to capture the true pattern.
            Think: trying to predict house price with only square footage — the model is systematically wrong about fancy kitchens. It has a built-in blind spot.
          </li>
          <li>
            <strong>Variance:</strong> error from the model being <em>too sensitive</em> to the particular training examples you showed it.
            If you retrained it on a different sample of 1000 houses, you&apos;d get a very different model. It changes wildly with small data changes.
          </li>
        </ul>

        <Callout variant="info" title="The classic image: darts on a dartboard">
          <p className="m-0">
            <strong>High bias, low variance:</strong> all darts land in a tight cluster, but far from the bullseye. Consistent-ish, but consistently wrong.
            <br />
            <strong>Low bias, high variance:</strong> darts scattered all over the board, averaging around the bullseye but no single dart near it.
            <br />
            <strong>High bias, high variance:</strong> scattered AND off-center. The worst model. (This is the &quot;nothing works&quot; case.)
            <br />
            <strong>Low bias, low variance:</strong> tight cluster at the bullseye. The dream.
          </p>
        </Callout>

        <p>
          The &quot;trade-off&quot; part: pushing a model toward <em>lower bias</em> (making it more expressive — more weights, more layers, higher degree polynomial)
          usually <em>raises its variance</em> (makes it more sensitive to the training set). Every ML practitioner is fighting this tension.
        </p>

        <WorkedExample
          title="Fitting polynomials to noisy data"
          subtitle="Same 10 data points, three different model complexities. Which one generalizes?"
          steps={[
            {
              title: "The data",
              body: (
                <p className="m-0">
                  10 points drawn from the true function <code>y = 2x + 1</code>, plus a bit of random noise.
                  So the real pattern is linear; the noise is what makes a perfect fit impossible.
                </p>
              ),
            },
            {
              title: "Fit a degree-1 polynomial (a straight line)",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Train loss: 0.8. Test loss on 100 new points: 0.85.
                    The two numbers are close, and neither is zero — the model is slightly underfit (it can&apos;t hit exactly because of the noise), but the gap is tiny.
                  </p>
                  <p className="m-0 italic text-xs">This is the healthy case.</p>
                </>
              ),
            },
            {
              title: "Fit a degree-9 polynomial (a wiggly curve)",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Train loss: 0.01. Test loss: 47.3.
                    The wiggly curve wraps through every training point exactly — that&apos;s why train loss is near zero. But on new data, it predicts wildly — the wiggles match <em>noise</em>, not signal.
                  </p>
                  <p className="m-0 italic text-xs">This is overfitting. The low train loss lied to you.</p>
                </>
              ),
            },
            {
              title: "Fit a constant (degree-0)",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Train loss: 24. Test loss: 25.
                    The model just predicts the mean of y — it can&apos;t capture any slope at all.
                  </p>
                  <p className="m-0 italic text-xs">This is underfitting. Both losses are high, and close.</p>
                </>
              ),
            },
            {
              title: "Pick the winner",
              body: (
                <p className="m-0">
                  Degree 1. It has the lowest <em>test</em> loss. Degree 9 had lower train loss, but we don&apos;t ship models based on train loss —
                  we ship based on how well they perform on data they haven&apos;t seen. The straight line wins because it matched the true pattern
                  without chasing the noise.
                </p>
              ),
            },
          ]}
        />

        <h3>How to fight overfitting</h3>

        <p>
          The five tools you&apos;ll actually reach for, roughly in order of effort:
        </p>

        <ol>
          <li>
            <strong>More training data.</strong> The single best anti-overfitting move. A wiggly model has less &quot;room&quot; to fit noise when there&apos;s more data forcing it to be consistent. Often impossible in practice — which is why we have the other four.
          </li>
          <li>
            <strong>Simpler model.</strong> Fewer features, fewer parameters, lower-degree polynomial. Reducing capacity directly reduces how much noise a model can chase. Start simple, <em>add</em> complexity only when you need it.
          </li>
          <li>
            <strong>Regularization.</strong> Add a penalty to the loss that punishes big weights. L2 (ridge) pulls all weights toward zero smoothly; L1 (lasso) pushes some all the way to zero, zeroing out features. You&apos;ll see <code>lambda * sum(w²)</code> added to the loss everywhere.
          </li>
          <li>
            <strong>Early stopping.</strong> Watch validation loss during training. The moment it starts going up while training loss still goes down — stop. You&apos;ve just entered the overfitting zone.
          </li>
          <li>
            <strong>Dropout / data augmentation.</strong> Neural-net-specific. Dropout randomly zeroes some activations during training, forcing the network to not over-rely on any one neuron. Data augmentation synthesizes new examples (rotate / crop images, paraphrase text) to effectively enlarge the dataset.
          </li>
        </ol>

        <Callout variant="warn" title="The data leakage trap, again">
          <p className="m-0">
            If you tune your &quot;hyperparameters&quot; (LR, model size, regularization strength) by checking <em>test</em> loss, you&apos;ve just overfit to the test set.
            That&apos;s why serious pipelines have <strong>three</strong> splits: train, <em>validation</em> (for tuning), test (only touched at the end). You saw this in Module 2 — now you know why it matters so much.
          </p>
        </Callout>

        <Quiz
          question="A colleague reports: 'My image classifier gets 99.8% accuracy.' First thing you ask, before you congratulate them:"
          options={[
            { label: "On what size of model?", explanation: "Nice to know, but doesn't tell you if the number means anything." },
            { label: "Was that on the training set or the test set?", correct: true, explanation: "Exactly. 99.8% on train is almost meaningless — any big-enough model can memorize. 99.8% on test is a genuinely impressive number. This is the ML engineer's instinctive first question." },
            { label: "How many GPUs did you train on?", explanation: "Irrelevant to whether the result is real." },
            { label: "What was the learning rate?", explanation: "Doesn't bear on whether the accuracy number is honest." },
          ]}
        />

        <Quiz
          question="Train loss: 0.02. Test loss: 4.8. Which is the best single move?"
          options={[
            { label: "Train longer — maybe the test loss will come down.", explanation: "Training longer at this point almost always INCREASES the train-test gap, not closes it." },
            { label: "Bump up the learning rate — convergence is the problem.", explanation: "Loss converged fine — train loss is already near zero. The problem is overfitting, not optimization." },
            { label: "Reduce model capacity or add regularization — the model is overfit.", correct: true, explanation: "Right. Big train-vs-test gap is the textbook overfitting signal. Smaller model, or add L2 / dropout / early stopping. More data if you can get it." },
            { label: "Nothing — 0.02 train loss is great, ship it.", explanation: "You ship on test performance, not train. 4.8 test loss means users will see a model that's 240× worse than you think." },
          ]}
          hint="What does a huge gap between train and test loss tell you?"
        />

        <TestYourself
          concept="Overfitting / bias–variance"
          explain={
            <>
              <p className="mb-2"><strong>Explain in 2 minutes:</strong> What&apos;s overfitting, what&apos;s underfitting, and how do you tell them apart?</p>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <p className="text-xs mt-2">
                  A model <em>underfits</em> when it&apos;s too simple to capture the real pattern — both train and test loss are bad, and about equal.
                  It <em>overfits</em> when it&apos;s so flexible it memorizes the training data including noise — train loss is near zero but test loss is high. The telltale signal is the <em>gap</em>: underfit has no gap, overfit has a huge one.
                  Bias is error from being too simple; variance is error from being too sensitive to which training examples you happened to get. The trade-off is that lowering one usually raises the other.
                </p>
              </details>
            </>
          }
          recognize={
            <>
              <p className="mb-2"><strong>Spot it in code:</strong> Look at this training log. Over, under, or just right? Explain.</p>
              <CodeBlock lang="plain">
{`Epoch  1 — train_loss: 3.41   val_loss: 3.48
Epoch  5 — train_loss: 2.10   val_loss: 2.22
Epoch 10 — train_loss: 1.45   val_loss: 1.61
Epoch 20 — train_loss: 0.22   val_loss: 1.58
Epoch 30 — train_loss: 0.03   val_loss: 2.45
Epoch 50 — train_loss: 0.001  val_loss: 4.12`}
              </CodeBlock>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <p className="text-xs mt-2">
                  Overfitting — badly. Train and val tracked together through epoch 10, then train kept dropping while val <em>rose</em>.
                  By epoch 50 there&apos;s a 4× gap. Early stopping around epoch 10–15 would have shipped the best model. You&apos;d also consider reducing model capacity or adding regularization.
                </p>
              </details>
            </>
          }
          implement={
            <>
              <p className="mb-2"><strong>Implement:</strong> Write a Java method <code>trainTestGap(double trainLoss, double valLoss)</code> that returns one of the strings <code>&quot;UNDERFIT&quot;</code>, <code>&quot;OK&quot;</code>, or <code>&quot;OVERFIT&quot;</code> based on simple thresholds.</p>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <CodeBlock lang="java">
{`public static String trainTestGap(double trainLoss, double valLoss) {
    double gap = valLoss - trainLoss;
    // Both high → underfit (model can't even fit training data)
    if (trainLoss > 1.0 && valLoss > 1.0) {
        return "UNDERFIT";
    }
    // Big gap between them → overfit
    if (gap > 0.5 * trainLoss && gap > 0.2) {
        return "OVERFIT";
    }
    return "OK";
}`}
                </CodeBlock>
                <p className="text-xs mt-2 italic">
                  The thresholds are judgment calls — &quot;high&quot; and &quot;big&quot; depend on your problem&apos;s scale. In practice you&apos;d compare <em>relative</em> gap
                  (gap / trainLoss) and set thresholds from a baseline, not hardcoded numbers.
                </p>
              </details>
            </>
          }
        />

        <PartRecap
          title="Part 3 recap"
          gist="Train loss isn't what you care about. You care about the gap — and what it tells you."
          points={[
            { takeaway: "Underfit = both losses bad. Overfit = train low, test high, big gap.", detail: <>No gap = the model is as good at unseen data as training data (could be good or bad). Big gap = memorization.</> },
            { takeaway: "Bias is error from being too simple. Variance is error from being too sensitive.", detail: <>You reduce bias by making the model more expressive (more features, more layers). You reduce variance with regularization, more data, or a simpler model.</> },
            { takeaway: "Five anti-overfitting tools: more data, simpler model, regularization, early stopping, dropout/augmentation.", detail: <>In roughly that order of effectiveness, and inversely in order of what most people reach for first.</> },
            { takeaway: "Tune hyperparameters on VALIDATION data, not test data.", detail: <>If you use test loss to pick which LR worked best, you&apos;ve overfit to the test set. Three splits: train, validation, test. Test is only touched at the end.</> },
            { takeaway: "A 99% train accuracy means nothing alone.", detail: <>The first question when anyone quotes an accuracy number is always &quot;on train or test?&quot; If they don&apos;t know — they haven&apos;t shown you anything yet.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 4: EVALUATION METRICS                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="metrics" title="Evaluation metrics" xp={25} celebration="You can pick the right metric for any problem. That's the engineering skill.">
      <section>
        <h2>Part 4: Evaluation metrics — are we actually any good?</h2>

        <p>
          Loss is what the model optimizes. <strong>Metrics are what humans use to decide if the model is useful.</strong> They&apos;re often different.
          MSE is a fine loss for regression, but a product manager isn&apos;t going to understand &quot;our MSE is 1421&quot; — they want to hear &quot;on average we&apos;re off by $38K.&quot;
        </p>

        <h3>Regression metrics</h3>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm">
            <div className="font-bold text-emerald-900 dark:text-emerald-200 mb-1">RMSE (Root Mean Square Error)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300 font-mono">
              sqrt(MSE) = sqrt(mean((y − ŷ)²))
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Same units as y. If y is dollars, RMSE is dollars. Penalizes big errors more than small ones.
            </p>
          </div>
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-1">MAE (Mean Absolute Error)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300 font-mono">
              mean(|y − ŷ|)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Same units as y. Treats all errors linearly — a 1000-off is exactly 1000× worse than a 1-off.
            </p>
          </div>
          <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-4 text-sm">
            <div className="font-bold text-violet-900 dark:text-violet-200 mb-1">R² (coefficient of determination)</div>
            <p className="text-xs m-0 mb-2 text-slate-700 dark:text-slate-300 font-mono">
              1 − (SS_res / SS_tot)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Unitless, between −∞ and 1. &quot;1.0 = perfect, 0 = no better than predicting the mean.&quot;
            </p>
          </div>
        </div>

        <Callout variant="info" title="RMSE vs MAE — which when?">
          <p className="mb-2">
            Use <strong>RMSE</strong> when big errors are especially bad (house price estimates where being $200K off is 4× worse than being $100K off twice).
            It&apos;s what you report most often, because it&apos;s the square root of MSE — the thing you trained on.
          </p>
          <p className="m-0">
            Use <strong>MAE</strong> when you have outliers you don&apos;t want to dominate the score (sensor readings with occasional glitches).
            MAE is robust to them in a way RMSE is not.
          </p>
        </Callout>

        <WorkedExample
          title="Compute RMSE, MAE, R² by hand"
          subtitle="Tiny example. 4 predictions, 4 true values."
          steps={[
            {
              title: "The data",
              body: (
                <CodeBlock lang="plain">
{`true y:   [3.0, 5.0, 7.0, 9.0]
pred ŷ:   [2.5, 5.5, 6.0, 9.0]
errors:   [0.5, −0.5, 1.0, 0.0]  (y − ŷ)`}
                </CodeBlock>
              ),
            },
            {
              title: "MAE",
              body: (
                <CodeBlock lang="plain">
{`|errors|    = [0.5, 0.5, 1.0, 0.0]
sum         = 2.0
MAE = 2.0 / 4 = 0.5`}
                </CodeBlock>
              ),
            },
            {
              title: "RMSE",
              body: (
                <CodeBlock lang="plain">
{`errors²   = [0.25, 0.25, 1.0, 0.0]
sum       = 1.5
MSE       = 1.5 / 4 = 0.375
RMSE      = sqrt(0.375) ≈ 0.612`}
                </CodeBlock>
              ),
            },
            {
              title: "R²",
              body: (
                <>
                  <CodeBlock lang="plain">
{`mean(y) = (3+5+7+9)/4 = 6.0

SS_res = sum of errors²      = 1.5    (from above)
SS_tot = sum((y − mean_y)²)
       = (3−6)² + (5−6)² + (7−6)² + (9−6)²
       = 9 + 1 + 1 + 9
       = 20

R² = 1 − SS_res/SS_tot
   = 1 − 1.5/20
   = 1 − 0.075
   = 0.925`}
                  </CodeBlock>
                  <p className="text-xs italic mt-2 m-0">
                    R² = 0.925 means our model explains about 92.5% of the variance in y. Baseline (predicting the mean) would give R² = 0. Perfect predictions give R² = 1.
                  </p>
                </>
              ),
            },
          ]}
        />

        <Quiz
          question="Your model has RMSE = 120 and MAE = 35. What does that tell you?"
          options={[
            { label: "The model is broken — MAE can't be smaller than RMSE.", explanation: "MAE ≤ RMSE is always true (by math). The gap is informative, not a bug." },
            { label: "Typical errors are ~35, but you have a few outliers that are much worse.", correct: true, explanation: "Exactly. RMSE >> MAE means a few big errors are pulling the squared-error average way up. Time to look at the worst predictions and find out what's going wrong on them." },
            { label: "The model is overfit.", explanation: "RMSE vs MAE tells you about error distribution, not train-vs-test gap." },
            { label: "You should use RMSE loss, not MAE loss.", explanation: "This is about metrics for REPORTING, not which loss to train with." },
          ]}
          hint="Which of these metrics penalizes big errors harder?"
        />

        <h3>Classification metrics</h3>

        <p>
          For classification, &quot;how close were you&quot; doesn&apos;t make sense — the answer is either &quot;spam&quot; or &quot;not spam,&quot; not $47K. Accuracy is the obvious first metric:
        </p>

        <CodeBlock lang="plain">
{`accuracy = correct predictions / total predictions`}
        </CodeBlock>

        <p>
          …but accuracy has a famous failure mode:
        </p>

        <Callout variant="warn" title="The 99% accuracy trap">
          <p className="mb-2">
            You build a fraud detector. 1 in 1000 transactions is fraud. Your &quot;model&quot; always predicts &quot;not fraud.&quot; Accuracy: <strong>99.9%</strong>. Useless.
          </p>
          <p className="m-0">
            Any time your classes are imbalanced, accuracy lies. You need metrics that look at the <em>confusion matrix</em>.
          </p>
        </Callout>

        <h3>The confusion matrix</h3>

        <p>
          Every binary prediction falls into one of four buckets:
        </p>

        <div className="grid grid-cols-2 gap-2 my-4 not-prose max-w-md">
          <div className="rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs">
            <div className="font-bold">TP — True Positive</div>
            <div>Predicted fraud, actually fraud. ✓</div>
          </div>
          <div className="rounded border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs">
            <div className="font-bold">FP — False Positive</div>
            <div>Predicted fraud, actually legit. False alarm.</div>
          </div>
          <div className="rounded border border-rose-300 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs">
            <div className="font-bold">FN — False Negative</div>
            <div>Predicted legit, actually fraud. The miss.</div>
          </div>
          <div className="rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs">
            <div className="font-bold">TN — True Negative</div>
            <div>Predicted legit, actually legit. ✓</div>
          </div>
        </div>

        <p>
          From those four numbers you derive the real metrics:
        </p>

        <div className="grid sm:grid-cols-3 gap-3 my-4 not-prose">
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm">
            <div className="font-bold text-amber-900 dark:text-amber-200 mb-1">Precision</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              TP / (TP + FP)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              &quot;When I said fraud, was it actually fraud?&quot; Punishes false alarms.
            </p>
          </div>
          <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4 text-sm">
            <div className="font-bold text-sky-900 dark:text-sky-200 mb-1">Recall (a.k.a. sensitivity)</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              TP / (TP + FN)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              &quot;Of all the real fraud, how much did I catch?&quot; Punishes misses.
            </p>
          </div>
          <div className="rounded-xl border border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-4 text-sm">
            <div className="font-bold text-violet-900 dark:text-violet-200 mb-1">F1 score</div>
            <p className="text-xs m-0 mb-2 font-mono text-slate-700 dark:text-slate-300">
              2·P·R / (P+R)
            </p>
            <p className="text-xs m-0 text-slate-600 dark:text-slate-400">
              Harmonic mean of precision and recall. One number, when both matter and you can&apos;t trade off.
            </p>
          </div>
        </div>

        <Callout variant="insight" title="Precision–recall trade-off — pick your poison">
          <p className="mb-2">
            Most classifiers output a probability, and you pick a threshold (e.g. &quot;call it fraud if p &gt; 0.5&quot;).
            <strong> Raise the threshold → precision goes up, recall goes down.</strong> Lower it → the opposite.
          </p>
          <p className="m-0">
            Which way you go depends entirely on the business cost. For <em>cancer screening</em>, you tolerate false alarms to avoid misses (high recall).
            For <em>spam filtering</em>, you tolerate some spam getting through to avoid deleting important email (high precision). There&apos;s no universally right answer.
          </p>
        </Callout>

        <WorkedExample
          title="Precision, recall, F1 on a fraud detector"
          subtitle="1000 transactions evaluated. 10 were actually fraud. Model flagged 20."
          steps={[
            {
              title: "Build the confusion matrix",
              body: (
                <>
                  <p className="m-0 mb-2">
                    Model flagged 20. Of those 20, 8 were actually fraud (TP) and 12 were legit (FP).
                    Of the 10 real frauds, 8 were caught and 2 were missed (FN). The other 988 were correctly left alone (TN).
                  </p>
                  <CodeBlock lang="plain">
{`TP = 8    FP = 12
FN = 2    TN = 978`}
                  </CodeBlock>
                </>
              ),
            },
            {
              title: "Accuracy (the misleading one)",
              body: (
                <CodeBlock lang="plain">
{`accuracy = (TP + TN) / total
         = (8 + 978) / 1000
         = 0.986    → 98.6%

Looks great! Except if we'd predicted "never fraud" on everything,
we'd have gotten 99.0% — better than our fancy model. Accuracy lies.`}
                </CodeBlock>
              ),
            },
            {
              title: "Precision",
              body: (
                <CodeBlock lang="plain">
{`precision = TP / (TP + FP)
          = 8 / (8 + 12)
          = 8 / 20
          = 0.40    → 40%

"When we flag something as fraud, we're right 40% of the time."
Lots of false alarms — ops team will hate us.`}
                </CodeBlock>
              ),
            },
            {
              title: "Recall",
              body: (
                <CodeBlock lang="plain">
{`recall = TP / (TP + FN)
       = 8 / (8 + 2)
       = 8 / 10
       = 0.80    → 80%

"We catch 80% of actual fraud." Not bad — but the 20% we miss
is the expensive part.`}
                </CodeBlock>
              ),
            },
            {
              title: "F1",
              body: (
                <>
                  <CodeBlock lang="plain">
{`F1 = 2 · P · R / (P + R)
   = 2 · 0.40 · 0.80 / (0.40 + 0.80)
   = 0.64 / 1.20
   ≈ 0.53    → 53%`}
                  </CodeBlock>
                  <p className="text-xs italic m-0 mt-2">
                    F1 weights a low precision-OR-low-recall harshly (harmonic mean is like that). An F1 of 0.53 is a more honest number than &quot;98.6% accuracy&quot;.
                  </p>
                </>
              ),
            },
          ]}
        />

        <ClassifyChallenge
          title="Pick the right metric"
          prompt="For each scenario, what should you optimize for?"
          buckets={[
            { id: "precision", label: "Precision", color: "amber" },
            { id: "recall", label: "Recall", color: "sky" },
            { id: "rmse", label: "RMSE", color: "emerald" },
            { id: "mae", label: "MAE", color: "violet" },
          ]}
          items={[
            { id: "a", label: "Cancer screening — missing a real case is catastrophic; false alarms trigger a second test.", answer: "recall", explanation: "Missing cancer is the expensive error. Optimize to catch every real case, even if you flag some healthy patients for follow-up." },
            { id: "b", label: "Spam filter — auto-delete. Users go ballistic if their boss's email gets eaten.", answer: "precision", explanation: "A missed spam is a mild annoyance; a deleted real email is a disaster. Only delete when you're sure." },
            { id: "c", label: "Estimating customer lifetime value — 99th-percentile whales are the whole business.", answer: "rmse", explanation: "Big errors on the whales would be devastating. RMSE punishes them quadratically, which is what you want." },
            { id: "d", label: "Sensor reading of room temperature — occasional bad readings from electrical interference.", answer: "mae", explanation: "The occasional spike is noise, not signal. MAE treats it linearly so one glitchy reading can't dominate your score." },
          ]}
        />

        <Quiz
          question="Your model's precision is 0.95, recall is 0.20, F1 is 0.33. In plain English, that means:"
          options={[
            { label: "When the model makes a prediction, it's almost always right — but it only bothers to predict on a small fraction of cases.", correct: true, explanation: "Exactly. High precision + low recall = 'cautious but accurate.' It mostly abstains, and when it does commit, it's right. Whether this is good depends on whether false negatives (missed positives) are cheap or expensive in your setting." },
            { label: "The model is 95% accurate but doesn't remember 80% of the training data.", explanation: "'Recall' here is a classification metric, not about memory." },
            { label: "The model is overfit — high precision but low recall always means overfitting.", explanation: "Not at all. A threshold-tuning choice, or a fundamental model limitation, can produce this pattern without any overfitting." },
            { label: "F1 of 0.33 means the model fails 67% of the time.", explanation: "F1 is a harmonic mean of precision and recall — it doesn't have a simple 'fails X% of the time' interpretation." },
          ]}
        />

        <TestYourself
          concept="Picking a metric"
          explain={
            <>
              <p className="mb-2"><strong>Explain in 2 minutes:</strong> I give you a new classification problem. Walk me through how you&apos;d decide between accuracy, precision, recall, and F1.</p>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <div className="text-xs mt-2 space-y-2">
                  <p>
                    First: is the dataset balanced? If yes (~50/50), accuracy is fine as a rough read. If no, accuracy is dangerous — a model that always predicts the majority class will score high.
                  </p>
                  <p>
                    Second: is one error way more costly than the other? If missing a positive is catastrophic (medical screening) → recall. If false alarms are costly (auto-deleting email) → precision.
                  </p>
                  <p>
                    Third: if both matter and you can&apos;t pick between them, use F1 — it punishes you for letting either collapse.
                  </p>
                  <p>
                    In practice you report all of them on a held-out set, then pick the one the product decision hinges on as the &quot;number we optimize for.&quot;
                  </p>
                </div>
              </details>
            </>
          }
          recognize={
            <>
              <p className="mb-2"><strong>Spot it in code:</strong> what does this snippet compute?</p>
              <CodeBlock lang="java">
{`double metric(int[] yTrue, int[] yPred) {
    int tp = 0, fp = 0;
    for (int i = 0; i < yTrue.length; i++) {
        if (yPred[i] == 1 && yTrue[i] == 1) tp++;
        if (yPred[i] == 1 && yTrue[i] == 0) fp++;
    }
    return (double) tp / (tp + fp);
}`}
              </CodeBlock>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <p className="text-xs mt-2">
                  Precision. TP over (TP + FP) — &quot;of the ones I flagged as positive, how many were actually positive?&quot;
                  It never looks at FN, so it doesn&apos;t care about misses. That&apos;s the signature of precision vs recall.
                </p>
              </details>
            </>
          }
          implement={
            <>
              <p className="mb-2"><strong>Implement:</strong> write <code>f1(int[] yTrue, int[] yPred)</code> that returns the F1 score (both arrays same length, values 0 or 1).</p>
              <details>
                <summary className="cursor-pointer text-xs font-semibold text-amber-800 dark:text-amber-300">Show reference answer</summary>
                <CodeBlock lang="java">
{`public static double f1(int[] yTrue, int[] yPred) {
    int tp = 0, fp = 0, fn = 0;
    for (int i = 0; i < yTrue.length; i++) {
        if (yPred[i] == 1 && yTrue[i] == 1) tp++;
        if (yPred[i] == 1 && yTrue[i] == 0) fp++;
        if (yPred[i] == 0 && yTrue[i] == 1) fn++;
    }
    if (tp == 0) return 0.0;      // avoid 0/0

    double precision = (double) tp / (tp + fp);
    double recall    = (double) tp / (tp + fn);
    return 2.0 * precision * recall / (precision + recall);
}`}
                </CodeBlock>
                <p className="text-xs mt-2 italic">
                  The <code>tp == 0</code> guard handles the degenerate case where both precision and recall are zero (would otherwise be 0/0).
                </p>
              </details>
            </>
          }
        />

        <PartRecap
          title="Part 4 recap"
          gist="Loss is what the model optimizes. Metrics are how you (and the PM) judge it."
          points={[
            { takeaway: "RMSE is in the same units as y and punishes big errors. MAE is linear and robust to outliers.", detail: <>For most regression, lead with RMSE (report it in whatever unit y is in). Use MAE when outliers are noise you want to downweight.</> },
            { takeaway: "R² tells you how much variance the model explains. 1 = perfect, 0 = no better than the mean.", detail: <>Negative R² is possible — it means your model is literally worse than always predicting the average. That&apos;s a flashing red light.</> },
            { takeaway: "For classification, accuracy lies on imbalanced data. Use precision, recall, F1.", detail: <>If 99.9% of your data is one class, a model predicting that class always scores 99.9% accuracy. Imbalanced data is the norm in production, not the exception.</> },
            { takeaway: "Precision = 'am I right when I say yes.' Recall = 'did I find all the yeses.'", detail: <>They trade off against each other via the threshold. Which one you pick depends entirely on which error is more expensive in your business.</> },
            { takeaway: "F1 is their harmonic mean — one number, when both matter equally.", detail: <>Harmonic mean (not arithmetic!) means if either is near zero, F1 is near zero. You can&apos;t hide a bad precision behind a great recall.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* PART 5: JAVA PROJECT — TRAINING LOOP                               */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="java-project" title="Java project: training loop" xp={40} celebration="Your Java code just TRAINED ITSELF. You are now an ML engineer." manual manualLabel="I built it — mark done">
      <section>
        <h2>Part 5: Project — your Java linear regression actually trains now</h2>

        <p>
          In Module 2 you built a <code>LinearModel</code> that could <em>predict</em>, and a <code>mse()</code> function that could <em>score</em>.
          What was missing was the part that takes bad weights and makes them good — the training loop. Now you have the theory. Time to write it.
        </p>

        <Callout variant="info" title="What we're building">
          <p className="m-0">
            A Java <code>LinearRegressionTrainer</code> that takes a (X, y) dataset and a learning rate, and returns a fitted <code>LinearModel</code>.
            It uses batch gradient descent, prints a loss curve, evaluates on a held-out set, and reports RMSE and R². About 90 lines of code total.
          </p>
        </Callout>

        <h3>Step 1 — run the working code first, understand it, then rebuild the tricky bits from scratch</h3>

        <p>
          Same pedagogy as Module 2: I give you the complete, runnable code up front. You run it, see it work, read it line by line.
          <em>Then</em> I hand you stubs and you rebuild the three interesting pieces yourself. Run-first, build-second.
        </p>

        <CodeBlock lang="plain">
{`cd ~/ml-playground       # or wherever you put Module 2's project
# You should already have LinearModel.java from last module.
# We'll add three new files.
touch LinearRegressionTrainer.java
touch Metrics.java
touch TrainingRunner.java`}
        </CodeBlock>

        <h3>Step 2 — the code (three files)</h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Paste these in. Compile with <code>javac *.java</code>, run with <code>java TrainingRunner</code>. You should see the loss drop over ~500 iterations and a final RMSE and R² printed at the end.
        </p>

        <CodeBlock lang="java" caption="File 1 of 3: LinearRegressionTrainer.java — the training loop">
{`import java.util.Random;

/**
 * Fits a LinearModel to (X, y) using batch gradient descent.
 *
 * "Batch" = we compute the gradient using ALL training examples on
 * every step. Perfectly fine for toy-scale problems; on real data
 * you'd switch to mini-batch.
 */
public class LinearRegressionTrainer {

    private final double learningRate;
    private final int maxIterations;
    private final boolean verbose;

    public LinearRegressionTrainer(double learningRate, int maxIterations, boolean verbose) {
        this.learningRate = learningRate;
        this.maxIterations = maxIterations;
        this.verbose = verbose;
    }

    /**
     * X is [nSamples][nFeatures]. y is [nSamples].
     * Returns a trained LinearModel.
     */
    public LinearModel fit(double[][] X, double[] y) {
        int n = X.length;
        int d = X[0].length;

        // Initialize weights tiny-random, bias at 0.
        double[] w = new double[d];
        Random rng = new Random(42);
        for (int j = 0; j < d; j++) {
            w[j] = rng.nextGaussian() * 0.01;
        }
        double b = 0.0;

        for (int iter = 0; iter < maxIterations; iter++) {
            // ─── Forward pass: predictions for every row ─────────
            double[] yHat = new double[n];
            for (int i = 0; i < n; i++) {
                double pred = b;
                for (int j = 0; j < d; j++) pred += w[j] * X[i][j];
                yHat[i] = pred;
            }

            // ─── Gradients (from derivative of MSE) ──────────────
            // dL/dw_j = (2/n) * sum_i (yHat_i - y_i) * X_i_j
            // dL/db   = (2/n) * sum_i (yHat_i - y_i)
            double[] gradW = new double[d];
            double gradB = 0.0;
            for (int i = 0; i < n; i++) {
                double err = yHat[i] - y[i];
                for (int j = 0; j < d; j++) gradW[j] += err * X[i][j];
                gradB += err;
            }
            for (int j = 0; j < d; j++) gradW[j] = (2.0 / n) * gradW[j];
            gradB = (2.0 / n) * gradB;

            // ─── Update: w ← w - η * ∇w ──────────────────────────
            for (int j = 0; j < d; j++) w[j] -= learningRate * gradW[j];
            b -= learningRate * gradB;

            if (verbose && (iter % 50 == 0 || iter == maxIterations - 1)) {
                double loss = Metrics.mse(y, yHat);
                System.out.printf("iter %4d   loss = %.4f%n", iter, loss);
            }
        }

        return new LinearModel(w, b);
    }
}`}
        </CodeBlock>

        <CodeBlock lang="java" caption="File 2 of 3: Metrics.java — the evaluation helpers">
{`/**
 * Evaluation metrics for regression. Static, no state.
 * Kept separate from the trainer so we can reuse them anywhere.
 */
public class Metrics {

    public static double mse(double[] y, double[] yHat) {
        double sum = 0.0;
        for (int i = 0; i < y.length; i++) {
            double e = y[i] - yHat[i];
            sum += e * e;
        }
        return sum / y.length;
    }

    public static double rmse(double[] y, double[] yHat) {
        return Math.sqrt(mse(y, yHat));
    }

    public static double mae(double[] y, double[] yHat) {
        double sum = 0.0;
        for (int i = 0; i < y.length; i++) {
            sum += Math.abs(y[i] - yHat[i]);
        }
        return sum / y.length;
    }

    public static double r2(double[] y, double[] yHat) {
        double meanY = 0.0;
        for (double v : y) meanY += v;
        meanY /= y.length;

        double ssRes = 0.0, ssTot = 0.0;
        for (int i = 0; i < y.length; i++) {
            double resid = y[i] - yHat[i];
            double devMean = y[i] - meanY;
            ssRes += resid * resid;
            ssTot += devMean * devMean;
        }
        if (ssTot == 0.0) return 0.0; // all y identical — R² undefined
        return 1.0 - ssRes / ssTot;
    }
}`}
        </CodeBlock>

        <CodeBlock lang="java" caption="File 3 of 3: TrainingRunner.java — the main() that ties it together">
{`import java.util.Random;

public class TrainingRunner {

    public static void main(String[] args) {
        // ─── 1. Generate synthetic data with a known relationship ────
        //   y = 2.5 * x0 + (-1.3) * x1 + 4.0 + noise
        int nTotal = 400;
        int d = 2;
        double[][] X = new double[nTotal][d];
        double[] y = new double[nTotal];
        Random rng = new Random(7);
        double trueW0 = 2.5, trueW1 = -1.3, trueB = 4.0;

        for (int i = 0; i < nTotal; i++) {
            X[i][0] = rng.nextDouble() * 10;           // 0..10
            X[i][1] = rng.nextDouble() * 10;
            double noise = rng.nextGaussian() * 0.5;   // small Gaussian noise
            y[i] = trueW0 * X[i][0] + trueW1 * X[i][1] + trueB + noise;
        }

        // ─── 2. Split: 80% train, 20% test ───────────────────────────
        int nTrain = (int) (nTotal * 0.8);
        double[][] Xtrain = new double[nTrain][d];
        double[] yTrain = new double[nTrain];
        double[][] Xtest = new double[nTotal - nTrain][d];
        double[] yTest = new double[nTotal - nTrain];
        for (int i = 0; i < nTrain; i++) {
            Xtrain[i] = X[i];
            yTrain[i] = y[i];
        }
        for (int i = nTrain; i < nTotal; i++) {
            Xtest[i - nTrain] = X[i];
            yTest[i - nTrain] = y[i];
        }

        // ─── 3. Train ─────────────────────────────────────────────────
        LinearRegressionTrainer trainer =
            new LinearRegressionTrainer(0.01, 500, true);
        LinearModel model = trainer.fit(Xtrain, yTrain);

        // ─── 4. Evaluate on held-out test set ────────────────────────
        double[] yHat = new double[yTest.length];
        for (int i = 0; i < Xtest.length; i++) {
            yHat[i] = model.predict(Xtest[i]);
        }

        System.out.println();
        System.out.println("─── Learned weights vs truth ───");
        System.out.printf("  w0 = %+.3f   (true %+.3f)%n", model.weights()[0], trueW0);
        System.out.printf("  w1 = %+.3f   (true %+.3f)%n", model.weights()[1], trueW1);
        System.out.printf("  b  = %+.3f   (true %+.3f)%n", model.bias(),        trueB);

        System.out.println();
        System.out.println("─── Test-set metrics ───");
        System.out.printf("  MSE  = %.4f%n", Metrics.mse(yTest, yHat));
        System.out.printf("  RMSE = %.4f%n", Metrics.rmse(yTest, yHat));
        System.out.printf("  MAE  = %.4f%n", Metrics.mae(yTest, yHat));
        System.out.printf("  R²   = %.4f%n", Metrics.r2(yTest, yHat));
    }
}`}
        </CodeBlock>

        <Callout variant="warn" title="Your LinearModel needs getters">
          <p className="mb-2">
            The runner calls <code>model.weights()</code> and <code>model.bias()</code> — if your Module 2 model doesn&apos;t expose those, add two tiny getters:
          </p>
          <CodeBlock lang="java">
{`public double[] weights() { return weights; }
public double bias()       { return bias; }`}
          </CodeBlock>
          <p className="m-0 text-xs">
            (If you used a Java <code>record</code>, you already have them for free.)
          </p>
        </Callout>

        <h3>Step 3 — what you should see</h3>

        <p>
          When you run <code>java TrainingRunner</code>, expect output like this:
        </p>

        <CodeBlock lang="plain">
{`iter    0   loss = 72.8531
iter   50   loss =  1.1842
iter  100   loss =  0.4211
iter  150   loss =  0.2853
iter  200   loss =  0.2634
...
iter  499   loss =  0.2571

─── Learned weights vs truth ───
  w0 = +2.498   (true +2.500)
  w1 = -1.297   (true -1.300)
  b  = +4.012   (true +4.000)

─── Test-set metrics ───
  MSE  = 0.2604
  RMSE = 0.5103
  MAE  = 0.4081
  R²   = 0.9948`}
        </CodeBlock>

        <p>
          That R² of 0.99 is telling you the model is near-perfect — it explains 99% of the variance in y. The learned weights nearly match the true ones.
          The MSE doesn&apos;t go to zero because of the noise we injected — <code>0.25</code> ≈ <code>0.5²</code>, which is the variance of our noise. The model has extracted <em>all</em> the signal and accepted the noise as residual error.
        </p>

        <Callout variant="insight" title="This is what 'converged' looks like">
          <p className="m-0">
            Loss drops fast for the first 100 iterations, then plateaus at ~0.26. That&apos;s the classic elbow curve from Part 2 — healthy convergence.
            If yours explodes upward, cut the learning rate. If it&apos;s still dropping at iteration 499, raise iterations or the learning rate.
          </p>
        </Callout>

        <h3>Step 4 — now rebuild the three tricky bits yourself</h3>

        <p>
          Having read the code, you&apos;ve seen the shape of the solution. Now delete the bodies of these three methods and rewrite them from a blank slate.
          Don&apos;t peek — use the stubs, hints, and the concepts from Parts 1 &amp; 4.
        </p>

        <CodeExercise
          title="Exercise 1: implement the gradient computation"
          prompt={
            <>
              Inside <code>fit()</code>, compute <code>gradW[j]</code> and <code>gradB</code> from the errors and the features.
              This is the <em>only</em> part where Part 1&apos;s math shows up directly in code. Get this right and the rest of the loop is plumbing.
            </>
          }
          hints={[
            "The loss is MSE = (1/n) Σ (ŷ - y)². So ∂L/∂w_j = (2/n) Σ (ŷ_i - y_i) · X_i_j.",
            "You already have the errors as (yHat[i] - y[i]). Multiply each error by the corresponding feature X[i][j] and accumulate into gradW[j].",
            "Don't forget the (2/n) scaling factor at the end. Also: gradB uses no X — it's just (2/n) · sum of errors, because ∂(w·x+b)/∂b = 1.",
          ]}
          stub={`double[] gradW = new double[d];
double gradB = 0.0;
for (int i = 0; i < n; i++) {
    double err = yHat[i] - y[i];
    // TODO: accumulate err * X[i][j] into gradW[j] for every j
    // TODO: accumulate err into gradB
}
// TODO: divide gradW[j] by n/2 (equivalently multiply by 2/n)
// TODO: same for gradB`}
          solution={`double[] gradW = new double[d];
double gradB = 0.0;
for (int i = 0; i < n; i++) {
    double err = yHat[i] - y[i];
    for (int j = 0; j < d; j++) gradW[j] += err * X[i][j];
    gradB += err;
}
for (int j = 0; j < d; j++) gradW[j] = (2.0 / n) * gradW[j];
gradB = (2.0 / n) * gradB;`}
        />

        <CodeExercise
          title="Exercise 2: implement the weight update"
          prompt={
            <>
              After you&apos;ve computed <code>gradW</code> and <code>gradB</code>, apply them to <code>w</code> and <code>b</code>. One line of math per element — but get the sign right.
            </>
          }
          hints={[
            "The update rule is w ← w - η · ∂L/∂w. That's MINUS, not plus. If you get the sign wrong, loss will EXPLODE.",
            "You have `learningRate` as a field. Multiply it by each element of gradW, subtract from w.",
            "Same thing for b, just scalar instead of array.",
          ]}
          stub={`// Inputs: double[] w, double b, double[] gradW, double gradB, double learningRate
// TODO: for each weight j, do w[j] = w[j] - learningRate * gradW[j]
// TODO: same for bias`}
          solution={`for (int j = 0; j < d; j++) w[j] -= learningRate * gradW[j];
b -= learningRate * gradB;`}
        />

        <CodeExercise
          title="Exercise 3: implement R²"
          prompt={
            <>
              In <code>Metrics.java</code>, implement <code>r2(y, yHat)</code> from the formula. This is the one regression metric that takes two passes over the data — once to compute the mean, once to compute the sums of squares.
            </>
          }
          hints={[
            "R² = 1 − (SS_res / SS_tot). SS_res = Σ (y_i − ŷ_i)². SS_tot = Σ (y_i − mean(y))².",
            "First pass: compute mean(y). Second pass: compute both sums in one loop.",
            "Edge case: if SS_tot is 0 (all y identical), R² is undefined — return 0.0 to keep callers happy.",
          ]}
          stub={`public static double r2(double[] y, double[] yHat) {
    // TODO: compute mean(y)
    // TODO: compute SS_res = sum of (y_i - yHat_i)^2
    // TODO: compute SS_tot = sum of (y_i - mean_y)^2
    // TODO: handle SS_tot == 0
    // TODO: return 1.0 - SS_res / SS_tot
    return 0.0;
}`}
          solution={`public static double r2(double[] y, double[] yHat) {
    double meanY = 0.0;
    for (double v : y) meanY += v;
    meanY /= y.length;

    double ssRes = 0.0, ssTot = 0.0;
    for (int i = 0; i < y.length; i++) {
        double resid   = y[i] - yHat[i];
        double devMean = y[i] - meanY;
        ssRes += resid * resid;
        ssTot += devMean * devMean;
    }
    if (ssTot == 0.0) return 0.0;
    return 1.0 - ssRes / ssTot;
}`}
        />

        <Callout variant="insight" title="You just wrote the core of every ML library on earth">
          <p className="m-0">
            That gradient computation, the weight update, the loss-and-metrics loop — it&apos;s the same shape PyTorch and TensorFlow use, just with
            autograd (automatic differentiation) doing the gradient math for you, and GPUs doing the matrix multiplies. But the skeleton is identical. You now understand
            what <code>optimizer.step()</code> actually does when you see it in Python.
          </p>
        </Callout>

        <h3>Step 5 — extensions (optional, but recommended)</h3>

        <p>
          If you want to push further — try any of these. Each takes ~30 min and will teach you something concrete:
        </p>

        <ol>
          <li>
            <strong>Add mini-batch support.</strong> Instead of using all n rows per step, shuffle the data and iterate in chunks of 32. Compare convergence speed (wall-clock) against batch GD.
          </li>
          <li>
            <strong>Add L2 regularization.</strong> Add <code>lambda · sum(w²)</code> to the loss and <code>2·lambda·w_j</code> to each weight&apos;s gradient. Try <code>lambda = 0.01</code> and see what changes.
          </li>
          <li>
            <strong>Add early stopping.</strong> Split train further into train+validation. After each epoch, compute val loss. If val loss hasn&apos;t improved in 10 iterations, return the best model seen so far.
          </li>
          <li>
            <strong>Plot the loss curve.</strong> Write the per-iteration loss to a CSV, open it in Excel or Python, and look at the shape. You&apos;ll recognize the elbow from Part 2 on sight.
          </li>
        </ol>

        <PartRecap
          title="Part 5 recap"
          gist="Your Java code now contains a working, general-purpose training loop. Same shape as every real ML library."
          points={[
            { takeaway: "Training loop structure: forward pass → gradient → update → repeat.", detail: <>Those four steps in a <code>for</code> loop are the entirety of the algorithm. Everything else is implementation details.</> },
            { takeaway: "MSE gradient: ∂L/∂w_j = (2/n) Σ (ŷ_i - y_i) · X_i_j. Bias gradient: (2/n) Σ (ŷ_i - y_i).", detail: <>The derivation falls straight out of the chain rule on (w·x + b − y)². You now know it in your hands.</> },
            { takeaway: "Metrics live separate from the trainer, so you can call them anywhere.", detail: <>Good engineering habit — never tangle &quot;how to train&quot; with &quot;how to score.&quot; You&apos;ll want to call metrics on any dataset, not just during fit().</> },
            { takeaway: "Test metrics close to train loss = healthy. Big gap = overfit.", detail: <>In this toy problem there&apos;s no overfitting because the model capacity matches the true relationship. On real data, that matching is a constant struggle.</> },
            { takeaway: "You wrote the core of PyTorch in 90 lines of Java.", detail: <>The production ML libraries add autograd, GPU kernels, and a thousand tricks for stability — but the loop you wrote is the same loop.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ================================================================= */}
      {/* FINAL QUIZ                                                         */}
      {/* ================================================================= */}
      <Checkpoint moduleSlug="ml-training" id="final" title="Final quiz" xp={30} celebration="🎓 Module 3 done. You understand how ML actually works now — no hand-waving needed.">
      <section>
        <h2>Final: pull it all together</h2>

        <p>
          Five questions that span the module. If you can nail these, you&apos;re ready for Module 4 (neural networks — same ideas, just <em>layered</em>).
        </p>

        <Quiz
          question="Your training loss is stuck at 3.2 and won't drop no matter how long you train. Train loss and val loss are both ~3.2. The model is…"
          options={[
            { label: "Overfitting.", explanation: "Overfitting would mean train loss is low and val is high. Here they're tied and both bad." },
            { label: "Underfitting — probably needs more capacity or more features.", correct: true, explanation: "Right. Both losses plateaued together at a bad value — classic underfit. The model isn't expressive enough to capture the pattern, OR you're missing useful features." },
            { label: "Converged. Just ship it.", explanation: "Converged to a BAD value. A plateau at 3.2 isn't success unless 3.2 is actually good for your problem." },
            { label: "Suffering from a too-high learning rate.", explanation: "Too-high LR produces oscillation or divergence, not a smooth plateau." },
          ]}
          xp={15}
        />

        <Quiz
          question="You report 'model accuracy: 94%.' Your skeptical boss asks the single most important follow-up. It's:"
          options={[
            { label: "What learning rate did you use?", explanation: "Doesn't affect whether the 94% is real." },
            { label: "What's the class balance in the test set?", correct: true, explanation: "Exactly. If 94% of the test set is the majority class, predicting that class always gives 94% accuracy with zero intelligence. Balance determines whether accuracy is meaningful or meaningless." },
            { label: "How many epochs did you train for?", explanation: "Irrelevant to whether the number is honest." },
            { label: "Did you use cross-validation?", explanation: "Useful, but 'class balance' is the deeper question — CV on imbalanced data still lies." },
          ]}
          xp={15}
        />

        <Quiz
          question="The update rule w ← w − η · ∂L/∂w has a minus sign. What happens if you flip it to +?"
          options={[
            { label: "Nothing — the sign of η cancels out.", explanation: "It doesn't. η is positive by convention, and the sign in front of it matters." },
            { label: "The model trains in half the time.", explanation: "Nope — it does the opposite of training." },
            { label: "Loss goes UP over time — you're doing gradient ascent, maximizing the loss.", correct: true, explanation: "Right. The minus sign is what makes it descent. Flipped, you climb the loss surface instead of descending it. (Occasionally useful — e.g., adversarial attacks maximize loss on purpose.)" },
            { label: "The weights oscillate but eventually converge.", explanation: "They diverge, not oscillate around a fixed point." },
          ]}
          xp={15}
        />

        <Quiz
          question="You're building a model to detect credit-card fraud. 0.1% of transactions are fraudulent. False positives (flagging legit transactions) cost ~$5 each in support tickets. False negatives (missing fraud) cost ~$500 each. You should optimize for:"
          options={[
            { label: "Accuracy.", explanation: "On 0.1% imbalance, accuracy is almost useless. Always-predict-negative scores 99.9%." },
            { label: "Precision.", explanation: "Precision optimizes to reduce false positives — but FPs cost $5 each, while FNs cost $500. Wrong direction." },
            { label: "Recall.", correct: true, explanation: "Yes. FNs are 100× more expensive than FPs, so you want to catch as many real frauds as possible even at the cost of more false alarms. Recall = 'of all real fraud, how much did I catch.'" },
            { label: "F1.", explanation: "F1 weights precision and recall equally — but here they're NOT equal, because the costs are wildly different. Cost-weighted recall is the right answer." },
          ]}
          xp={15}
        />

        <Quiz
          question="Final boss: from Module 2, a trained 'model' is just a pile of floats. Which of the following is NOT something gradient descent ever does to those floats?"
          options={[
            { label: "Reads them to compute ŷ.", explanation: "Yes it does — that's the forward pass." },
            { label: "Updates them by subtracting η·gradient.", explanation: "Yes — that's the update step. The whole point." },
            { label: "Uses their values to decide how big the next step should be.", explanation: "It does — bigger gradient (which depends on weight values via ŷ) → bigger step. Self-scaling." },
            { label: "Re-reads the original training data and re-labels it.", correct: true, explanation: "Correct answer. Gradient descent never modifies the training data. X and y are inputs, weights are outputs. Data stays fixed; weights change. (If your training code is mutating inputs, that's a bug.)" },
          ]}
          xp={15}
        />

        <div className="not-prose my-8 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎓</span>
            <h3 className="font-bold text-lg m-0">Module 3 done.</h3>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            You can now describe <em>everything</em> that happens when a linear model trains — the data, the forward pass, the loss, the gradient, the update, the evaluation.
            You have a working Java implementation of all of it. When you see &quot;training&quot; in any ML library from this point on, you&apos;ll recognize the moving parts.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 m-0">
            Next up: <strong>neural networks</strong>. The twist is that there are more weights, arranged in <em>layers</em>, with nonlinear activations between them — and the gradient has to be
            propagated backward through all of them. But the outer loop is the same loop you just wrote.
          </p>
        </div>
      </section>
      </Checkpoint>

      <footer className="not-prose mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6">
        <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Up next</div>
        <h3 className="text-xl font-bold mb-2">Module 4: Neural networks</h3>
        <p className="text-sm opacity-90 mb-4">
          More weights, arranged in layers, with nonlinearities in between. Same outer training loop you just wrote — backprop just routes the gradient through every layer.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/courses/ai/modules/neural-networks" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium text-sm hover:bg-indigo-50 transition">
            Start Module 4 →
          </Link>
          <Link href="/courses/ai" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/40 text-white font-medium text-sm hover:bg-white/10 transition">
            ← All modules
          </Link>
        </div>
      </footer>
        <ModuleNav courseId="ai" currentSlug="ml-training" />
    </article>
  );
}
