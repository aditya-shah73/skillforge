import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "modeling", title: "Modeling cost per request" },
  { id: "headroom", title: "Capacity headroom and scaling triggers" },
  { id: "tradeoffs", title: "Cost-quality tradeoffs in practice" },
];

export default function Page() {
  const mod = getModuleBySlug("cost-capacity")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="cost-capacity" />
        <ModuleProgress moduleSlug="cost-capacity" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">💸</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A way to talk about cost the way SREs talk about latency: a number per request, with breakdowns, with a budget. By the end, you should be able to look at a service and know whether it&apos;s expensive on purpose or by accident.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>How to derive a $/QPS number for a service from its bill, and what to do with it</li>
          <li>Capacity headroom: why &quot;run hot&quot; is a euphemism for &quot;page on weekends&quot;</li>
          <li>Scaling triggers that fire before you&apos;re on fire — and the autoscaling traps to avoid</li>
          <li>Where to spend, where to save, and how to refuse to do either based on vibes</li>
        </ul>
      </section>

      <Checkpoint moduleSlug="cost-capacity" id="modeling" title="Part 1 · Modeling cost per request" xp={25}>

        <h2>Cost is just another SLI</h2>
        <p>
          Latency is measured per request. Availability is measured per request. Most teams measure cost per month, per service, sometimes per team. That&apos;s the wrong unit. The number that lets you reason about a service is <strong>cost per request</strong> — or its near-equivalents, $/QPS-month and $/MAU.
        </p>
        <p>
          Once you have a $/request number, every product decision becomes legible. &quot;We want to add this feature&quot; turns into &quot;it costs $0.0003 more per request.&quot; &quot;We need to scale 10x&quot; turns into &quot;our infrastructure bill goes from $40k/month to $400k/month — does the revenue justify it?&quot; You&apos;re not pretending; you&apos;re just doing arithmetic.
        </p>

        <h2>The basic decomposition</h2>
        <p>
          A typical web service&apos;s monthly cost decomposes into a few buckets. Most teams know roughly what their bill is, but not how it breaks down. The first job is to get a clean breakdown.
        </p>
        <ul>
          <li><strong>Compute:</strong>{" "}EC2/GKE/ECS/Lambda — usually the biggest single line. Tag everything by service so you can attribute.</li>
          <li><strong>Storage:</strong>{" "}RDS, DynamoDB, S3, EBS volumes. Includes IOPS charges, which are sneaky.</li>
          <li><strong>Network egress:</strong>{" "}outbound bytes from cloud — by far the most-overlooked cost. Cross-region replication and data leaving the cloud both bite.</li>
          <li><strong>Managed services:</strong>{" "}Kafka MSK, OpenSearch, ALBs, NAT gateways, Datadog, Snowflake. Each one is a margin the cloud or vendor takes.</li>
          <li><strong>Idle / overhead:</strong>{" "}staging, dev, CI runners, leaked test resources. Easily 15–30% of total — finance calls this &quot;waste&quot; and they&apos;re right.</li>
        </ul>

        <Callout variant="info" title="The cost iceberg">
          <p className="m-0">For a typical mid-stage SaaS, a rough split is: compute 35-50%, storage 15-25%, egress 10-20%, managed services 15-25%, idle/overhead 10-20%. If your bill doesn&apos;t look like this, that&apos;s information — egress over 30% means you&apos;re shoveling data out of the cloud or replicating cross-region; managed services over 40% means you&apos;re paying margin to skip ops work, which is sometimes correct.</p>
        </Callout>

        <h2>Worked example: deriving $/QPS</h2>
        <p>
          Imagine a service that serves 5,000 QPS at peak, runs 24/7, and bills as follows:
        </p>
        <ul>
          <li>Compute: 30 m5.xlarge instances on demand. ~$0.20/hour each = $0.20 × 30 × 24 × 30 = ~$4,320/month.</li>
          <li>Postgres RDS db.r5.4xlarge multi-AZ: ~$2,800/month.</li>
          <li>Egress: 200 GB/day × 30 days × $0.09/GB = ~$540/month.</li>
          <li>ALB + NAT + Datadog allocations: ~$1,200/month.</li>
        </ul>
        <p>
          Total: ~$8,860/month. The service handles 5,000 × 86,400 × 30 = ~13 billion requests/month. That&apos;s <strong>$0.00068 per request</strong>, or about <strong>$1.77 per QPS-month</strong>.
        </p>

        <CodeBlock lang="plain" caption="The arithmetic, written down once">{`monthly_cost   = $8,860
peak_qps       = 5,000
hours_per_mo   = 720

$/QPS-month    = monthly_cost / peak_qps
               = 8860 / 5000
               = $1.77 per peak-QPS per month

requests/month = avg_qps * 86400 * 30
               = (assume avg_qps ~= 0.6 * peak_qps = 3000)
               = 3000 * 86400 * 30
               = 7.78 billion requests

$/request      = monthly_cost / requests
               = 8860 / 7.78e9
               ~= $0.00114 per request
               ~= $1.14 per million requests`}</CodeBlock>

        <Callout variant="spring" title="Why $/QPS-month is the most useful number">
          <p className="m-0">It tells you what an extra 1,000 QPS of capacity will cost ($1,770/month at this efficiency) and what your infrastructure looks like at scale (this service at 50,000 QPS is ~$88k/month if it scales linearly, more if it doesn&apos;t). It also normalizes across services — comparing your $/QPS to a peer team&apos;s exposes which services are efficient and which are quietly expensive. Don&apos;t skip computing it.</p>
        </Callout>

        <h2>Where the model breaks</h2>
        <p>
          A few realistic complications:
        </p>
        <ul>
          <li><strong>Not all requests cost the same.</strong>{" "}A cached GET costs &lt;$0.0001; a complex search query costs &gt;$0.01. Aggregate $/request can hide expensive endpoints. Break down by endpoint.</li>
          <li><strong>Diurnal patterns matter.</strong>{" "}Peak QPS drives capacity sizing; average QPS drives request count. Use peak for capacity decisions, average for &quot;am I overprovisioned at night?&quot; questions.</li>
          <li><strong>Reserved capacity changes math.</strong>{" "}Reserved instances and savings plans cut compute by 30–60% in exchange for commitment. The model should reflect committed cost, not on-demand list price, if you&apos;ve actually committed.</li>
          <li><strong>Egress and per-request pricing surprise people.</strong>{" "}DynamoDB on-demand is per-request; Kafka MSK charges per-broker but throughput-bound; Snowflake charges per-second of warehouse uptime. Read the pricing page; assume nothing.</li>
        </ul>

        <Quiz
          question="Your team's service costs $20k/month and handles 10,000 peak QPS. A new feature is projected to add 30% load (3,000 QPS). What's the most defensible cost estimate to bring to the product review?"
          options={[
            { label: "$0 — we're already paying for the infrastructure.", correct: false, explanation: "Adding 30% load is going to require more capacity. Sunk costs don't cover marginal load." },
            { label: "$2/QPS-month × 3,000 QPS = $6k/month additional, assuming current efficiency holds.", correct: true, explanation: "Compute $/QPS-month from your bill ($20k / 10k QPS = $2), apply to marginal load. This is the right baseline; you can refine it if the new feature has a different cost shape (heavier queries, more egress)." },
            { label: "Tripling the bill to $60k/month — better safe than sorry.", correct: false, explanation: "30% load growth doesn't mean 200% cost growth. That's not a defensible estimate; it's padding so large the feature gets killed." },
            { label: "Run a load test and extrapolate from observed cost during the test.", correct: false, explanation: "Useful as a sanity check but expensive and slow as a first-pass estimate. The $/QPS calculation gets you an answer in five minutes." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Cost is a per-request property. Decompose the bill into compute, storage, egress, managed services, and waste. Compute $/QPS-month and use it for every capacity decision."
          points={[
            { takeaway: "Pick a unit and stick to it", detail: "$/request, $/QPS-month, $/MAU. The unit you can compute and trust is the one that drives decisions." },
            { takeaway: "Decomposition exposes leverage", detail: "If egress is 40% of your bill, the win is in your network architecture. If managed services are 50%, ask whether the margin is worth it." },
            { takeaway: "Model the marginal request, not the average", detail: "Expensive endpoints hide inside cheap aggregates. Break down by endpoint or by user tier when the average looks fine but pages tell a different story." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="cost-capacity" id="headroom" title="Part 2 · Capacity headroom and scaling triggers" xp={25}>

        <h2>The headroom you actually need</h2>
        <p>
          Capacity planning is mostly about how much spare you keep. Run too hot and the next surge takes you down; run too cold and finance starts asking pointed questions. There&apos;s a sweet spot, and it depends on three things: how fast you can scale, how spiky your traffic is, and how bad an outage is.
        </p>
        <p>
          A useful default for stateless web services on autoscaling: <strong>target 50–60% utilization at peak</strong>. That gives you room for an organic spike, an instance failure, and the autoscaler to react. For databases and stateful services, lean lower (40–50%) because scaling them is slow or impossible mid-incident.
        </p>

        <Callout variant="warn" title="The 'just run hot' fallacy">
          <p className="m-0">Every cost-cutting initiative eventually proposes raising utilization to 80%+ to save money. Sometimes that&apos;s right. More often it leads to an outage, a postmortem, and a quiet return to 60%. The reason: utilization is averaged over a window. A box averaging 80% over 5 minutes is hitting 100% in some 5-second windows, and 100% in CPU means request queues, which means latency spikes, which means timeouts, which means retries, which means more load. Headroom isn&apos;t waste — it&apos;s the buffer that keeps the feedback loop from running away.</p>
        </Callout>

        <h2>Scaling triggers that fire on time</h2>
        <p>
          Autoscaling is mostly a question of: what metric, what threshold, what response time. The naive setup — &quot;CPU above 70%, add an instance&quot; — is a starter; production-grade setups are more careful.
        </p>
        <ul>
          <li><strong>Lead-indicator metric.</strong>{" "}CPU is fine for compute-bound services; for I/O-bound services, scale on request queue depth, in-flight requests, or p99 latency. Choose the metric that rises before user-visible degradation, not after.</li>
          <li><strong>Asymmetric thresholds.</strong>{" "}Scale up fast (e.g., at 60% utilization), scale down slow (e.g., when below 30% for 15 minutes). Premature scale-down is how you end up cold-starting at peak.</li>
          <li><strong>Cooldowns and step sizes.</strong>{" "}Adding one instance at a time when load is doubling is too slow. Step scaling: +1 at threshold, +3 at 1.5x, +10 at 2x. Test it.</li>
          <li><strong>Predictive scaling for known patterns.</strong>{" "}If you know traffic doubles at 9am, pre-warm at 8:50. AWS has predictive autoscaling; it works for diurnal patterns and is harmless for irregular ones.</li>
        </ul>

        <Callout variant="insight" title="Cold start is a capacity problem">
          <p className="m-0">When you add an instance, it&apos;s not serving traffic immediately — it has to boot, pull config, warm caches, JIT, fill connection pools. For a JVM service, that can be 30-90 seconds before the new instance contributes meaningfully. Your autoscaling math has to account for this: if the spike is faster than your warm-up time, you&apos;re going to drop traffic regardless of how aggressively you scale. The fix is overprovisioning at peak (more headroom) or pre-warmed pools (more cost) — there is no third option.</p>
        </Callout>

        <h2>Stateful scaling is harder</h2>
        <p>
          Stateless services scale by adding instances behind a load balancer. Stateful services (databases, caches, event stores) scale by sharding, by replicating reads, or — most painfully — by upsizing the box and hoping. The lesson:
        </p>
        <ul>
          <li><strong>Plan stateful capacity months ahead.</strong>{" "}Scaling a database mid-incident is a project, not an action.</li>
          <li><strong>Use read replicas for read-heavy workloads.</strong>{" "}Cheap to add, fast to scale, and they take pressure off the primary.</li>
          <li><strong>Consider sharding before you need it.</strong>{" "}Resharding a live system is among the most expensive engineering work in tech.</li>
          <li><strong>For caches, plan for cold-start.</strong>{" "}A cluster restart with cold cache will hit the origin at full traffic — usually killing it. Stagger restarts or pre-warm.</li>
        </ul>

        <Quiz
          question="Your service runs at 70% CPU during business hours. You're considering raising the autoscaling target to 85% to save 15% on compute. What's the most likely outcome?"
          options={[
            { label: "You save 15%, no incidents — modern autoscalers are smart enough to handle 85%.", correct: false, explanation: "Smart autoscalers don't change the underlying math: at 85% steady-state, 5-second peaks hit 100% routinely, and request queues form. The savings are real but so is the risk." },
            { label: "You save 15% on a normal week and have a major incident the next time traffic spikes by 30%+ before the autoscaler reacts.", correct: true, explanation: "This is the classic 'run hot' result. The savings are real on average, the cost is paid as outages during spikes. Whether it's worth it depends on your traffic shape and outage tolerance — but it is a tradeoff, not free money." },
            { label: "Latency improves because there's less idle capacity wasting cycles.", correct: false, explanation: "Idle capacity doesn't waste cycles for other workloads — it's just headroom. Latency at higher utilization gets worse, not better, especially at p99." },
            { label: "Nothing changes — autoscaling doesn't actually depend on the target.", correct: false, explanation: "It very much does. The target determines when the scaler fires, which determines how close you run to capacity." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Headroom is a real cost and a real safety margin. Pick scaling metrics that lead, set asymmetric thresholds, and respect cold-start time in your math."
          points={[
            { takeaway: "Stateless target: 50-60% peak utilization", detail: "Stateful: 40-50%. Higher targets save money on average and cost it back as incidents during spikes." },
            { takeaway: "Scale on the right metric", detail: "CPU for compute-bound; queue depth or latency for I/O-bound. The metric should lead user impact, not lag it." },
            { takeaway: "Cold start is your real reaction time", detail: "Adding an instance is only useful when it's serving — JVMs take 30-90s to warm. Autoscaling math must account for that gap." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="cost-capacity" id="tradeoffs" title="Part 3 · Cost-quality tradeoffs in practice" xp={25}>

        <h2>Where the real money is</h2>
        <p>
          Once you have a $/request number, three categories of optimization tend to dominate. Most teams don&apos;t do them in a deliberate order; the ones who do save 30–50% without anyone noticing.
        </p>
        <ul>
          <li><strong>Eliminate waste.</strong>{" "}Idle dev/staging, oversized instances, unused EBS volumes, orphaned load balancers. Free money. Should be the first quarter of work, not the fifth.</li>
          <li><strong>Right-size and commit.</strong>{" "}Match instance types to actual usage; buy reserved or savings plans for the steady-state portion of compute. 30–50% savings on compute is normal here.</li>
          <li><strong>Architectural moves.</strong>{" "}Cache more, batch more, compute fewer times, move to spot for resilient workloads, replace expensive managed services with cheaper alternatives where the margin doesn&apos;t justify itself.</li>
        </ul>

        <Callout variant="info" title="The ordering matters">
          <p className="m-0">A team that starts with architectural rewrites before cleaning up waste is doing the hard problem first. Right-size the obvious stuff, kill the obvious idle, then go after the hard problems. The inverse — &quot;we&apos;ll save 40% by rewriting in Rust&quot; — usually misses the 25% sitting in idle staging environments and oversized boxes.</p>
        </Callout>

        <h2>The cost-quality matrix</h2>
        <p>
          Most architectural choices are explicit cost-vs-quality tradeoffs. Knowing the dial exists is half the work.
        </p>

        <ClassifyChallenge
          title="Sort each lever by the dial it turns"
          prompt="Each of these is a tradeoff lever. Sort them by which dial you're turning."
          buckets={[
            { id: "cheaper", label: "Cheaper, slightly worse UX", color: "amber" },
            { id: "expensive", label: "Pay more for higher quality", color: "violet" },
            { id: "neutral", label: "Cheaper without UX cost", color: "emerald" },
            { id: "risk", label: "Cheap, with hidden risk", color: "rose" },
          ]}
          items={[
            { id: "i1", label: "Move batch jobs to spot instances (interruptible).", answer: "cheaper", explanation: "Spot is 60-90% cheaper but jobs can be killed; for batch with retries that's fine, with a small UX hit (occasional reruns)." },
            { id: "i2", label: "Right-size oversized instances based on actual CPU profile.", answer: "neutral", explanation: "Pure efficiency win. You were paying for cycles you didn't use; UX is unchanged." },
            { id: "i3", label: "Run production at 85% CPU target to save on compute.", answer: "risk", explanation: "Looks like savings on average; the cost arrives later as outages during traffic spikes that exceed scale-up time." },
            { id: "i4", label: "Add a CDN to reduce origin load and improve user latency.", answer: "expensive", explanation: "CDN bills add cost but buy real latency improvements and origin protection. Quality up, cost up." },
            { id: "i5", label: "Buy 1-year savings plans for the steady-state compute baseline.", answer: "neutral", explanation: "Same compute, 30-50% cheaper, in exchange for commitment. UX unaffected if you size the commitment to actual baseline." },
            { id: "i6", label: "Drop the second region for non-critical workloads to save on cross-region traffic.", answer: "cheaper", explanation: "Real savings on egress and replicated capacity; UX hit is slightly worse failover for those workloads, which is acceptable for non-critical." },
            { id: "i7", label: "Replace managed Kafka MSK with self-hosted Kafka on EC2.", answer: "risk", explanation: "Lower bill, much higher operational risk. Now you own broker upgrades, partition rebalancing, and 3am pages. Sometimes worth it; rarely free." },
            { id: "i8", label: "Increase request timeouts to reduce retries that double cost during incidents.", answer: "neutral", explanation: "Reduces retry storms (cheaper) without obvious UX cost; users were already waiting through the retries — surfacing a clean error sometimes improves UX." },
          ]}
        />

        <h2>The annual cost review</h2>
        <p>
          Most cost work is reactive: someone notices the bill grew, panic, and a one-quarter cost-down sprint. A more grown-up version is an annual cost review with a small set of standing artifacts:
        </p>
        <ul>
          <li><strong>$/QPS-month per service,</strong>{" "}trended quarter over quarter. Services that get more expensive over time should explain why.</li>
          <li><strong>Top 10 line items</strong>{" "}in the bill. They almost always represent 70%+ of cost. Each should have a named owner.</li>
          <li><strong>Reserved/savings plan coverage</strong>{" "}as a percentage of compute. Should be 70–90% for steady-state workloads; less means you&apos;re paying on-demand premium for predictable load.</li>
          <li><strong>Idle/waste estimate.</strong>{" "}Track it; the goal is for it to drop, not stay flat.</li>
          <li><strong>Cost per business unit (revenue, MAU, transaction).</strong>{" "}The unit that maps to the business is the one product cares about.</li>
        </ul>

        <Callout variant="spring" title="The cost-aware engineering mindset">
          <p className="m-0">Cost is just another non-functional requirement, like latency or availability. Engineers who treat it that way — as a number they&apos;re responsible for, with thresholds and alerts — outperform engineers who treat it as &quot;finance&apos;s problem.&quot; The companies that scale efficiently aren&apos;t cheap; they just don&apos;t spend out of laziness. That&apos;s a skill, not a virtue.</p>
        </Callout>

        <Quiz
          question="A service's bill grew 60% year-over-year, but request volume only grew 25%. Where would you look first?"
          options={[
            { label: "Negotiate a discount with the cloud vendor.", correct: false, explanation: "Possible eventual move, but it doesn't tell you why your efficiency degraded. Diagnose first." },
            { label: "Compute $/QPS-month for both years and find which line items grew faster than volume.", correct: true, explanation: "Cost outpacing volume means the per-request efficiency dropped. Decomposing the bill by line item exposes which one (egress? a new managed service? leaked dev resources?) is the culprit. Fix the root cause, not the symptom." },
            { label: "Cut all spending until the team explains every dollar.", correct: false, explanation: "That's a reaction, not a plan. The diagnostic question is 'what changed', and you can answer it from the bill." },
            { label: "Buy more reserved instances to bring the on-demand portion down.", correct: false, explanation: "May save money but doesn't address the underlying efficiency drop. You'd be locking in the inflated baseline." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Cost work is ordered: kill waste, right-size, commit, then re-architect. Treat $/QPS-month as a tracked metric, not an annual surprise."
          points={[
            { takeaway: "Eliminate waste before optimizing", detail: "Idle and oversized resources are usually 15-30% of the bill. The architectural rewrite that saves 20% is a worse investment than the cleanup that saves 25% in two weeks." },
            { takeaway: "Most architectural levers are explicit tradeoffs", detail: "Spot vs on-demand, single vs multi-region, managed vs self-hosted. Naming the tradeoff lets you decide; pretending it doesn't exist costs you both ways." },
            { takeaway: "Track cost like you track latency", detail: "$/QPS-month, top line items, reserved coverage, idle estimate. Standing artifacts beat reactive cost-down sprints." },
          ]}
        />

      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <h3 className="font-bold text-lg mb-2">Module wrap</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          Cost is engineering, not accounting. Pick a unit ($/request, $/QPS-month, $/MAU). Decompose the bill. Set capacity headroom honestly and let the autoscaler scale on a leading metric. Sequence cost work — waste, right-size, commit, re-architect — and resist the urge to do the hard one first. The goal isn&apos;t cheap infrastructure; it&apos;s infrastructure where every dollar earns its keep, and you can defend the spend with a number.
        </p>
      </section>

        <ModuleNav courseId="system-design" currentSlug="cost-capacity" />
    </article>
  );
}
