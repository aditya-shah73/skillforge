import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "l4-vs-l7", title: "L4 vs L7" },
  { id: "algorithms", title: "Algorithms & health checks" },
  { id: "production", title: "Sticky sessions & failure modes" },
];

const lbTopology = `flowchart LR
  C[Clients] --> DNS[DNS / Anycast]
  DNS --> L4[L4 LB · NLB]
  L4 --> L7a[L7 LB · ALB · zone A]
  L4 --> L7b[L7 LB · ALB · zone B]
  L7a --> S1[Service pod 1]
  L7a --> S2[Service pod 2]
  L7b --> S3[Service pod 3]
  L7b --> S4[Service pod 4]`;

export default function Page() {
  const mod = getModuleBySlug("load-balancing")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="load-balancing" />
        <ModuleProgress moduleSlug="load-balancing" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50 p-6 dark:border-sky-800 dark:from-sky-950/40 dark:to-blue-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">⚖️</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Load balancers are usually treated like furniture — they&apos;re just there. By the end of this module you&apos;ll know which kind to pick for which problem, why round robin is almost never the right default, and how a single bad health check brings down a fleet.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>L4 (TCP) vs L7 (HTTP) — what each can see, what each can do, and when you need both</li>
          <li>Algorithms in practice: round robin, weighted RR, least connections, EWMA, consistent hashing, power-of-two-choices</li>
          <li>Active vs passive health checks and the failure modes of each</li>
          <li>Sticky sessions: when they&apos;re fine, when they break you, and how to live without them</li>
          <li>The N+1 capacity rule: what happens when one node dies at 3am</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">Every distributed system you build sits behind at least one load balancer. The choices you make at this layer — algorithm, stickiness, health checks — silently shape your tail latency, your failure blast radius, and how peaceful your on-call rotation is. Get this layer wrong and the symptoms show up everywhere else.</p>
      </Callout>

      {/* ============================================================== */}
      {/* PART 1 — L4 vs L7                                              */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="load-balancing" id="l4-vs-l7" title="L4 vs L7" xp={20} celebration="L4 vs L7 — clear in your head. Now the rest of this module is just details.">
      <section>
        <h2>Part 1: L4 vs L7 — what the load balancer can actually see</h2>

        <p>
          The single most useful distinction in load balancing is what layer of the stack the LB operates at. L4 means the load balancer makes its decision at the TCP level — it sees source IP, destination IP, ports, and that&apos;s about it. L7 means it parses HTTP — it sees the path, headers, host, cookies, body if it wants to. Different layer, different powers, different tradeoffs.
        </p>

        <h3>L4 load balancers</h3>

        <p>
          An L4 load balancer is essentially a smart NAT. A TCP connection arrives, the LB picks a backend, and from then on packets get forwarded between client and backend without inspection. AWS Network Load Balancer (NLB), HAProxy in TCP mode, and IPVS are L4 LBs. They&apos;re fast — easily millions of connections per second per box — because they don&apos;t terminate TLS, don&apos;t parse HTTP, and don&apos;t buffer payloads. They just route packets.
        </p>
        <p>
          The downside is they can&apos;t make decisions based on anything inside the request. Path-based routing, header-based routing, cookie-based routing — none of that exists at L4. You can route by source IP and you can route by destination port, and that&apos;s the menu.
        </p>

        <h3>L7 load balancers</h3>

        <p>
          An L7 load balancer terminates the TCP connection (and usually TLS), parses the HTTP request, and then makes a routing decision. AWS Application Load Balancer (ALB), NGINX, Envoy, and Spring Cloud Gateway are L7 LBs. Because they understand HTTP, they can do all the things you actually want: route <code>/api/v1/users</code> to one service and <code>/api/v1/payments</code> to another, retry idempotent requests on failure, add tracing headers, do path rewrites, enforce rate limits per user.
        </p>
        <p>
          The cost is that they&apos;re ~10x slower per request than L4 — measured in tens of thousands of RPS per box rather than millions of connections per box. They also become a TLS endpoint, which means you&apos;re managing certificates and you&apos;re paying the CPU cost of TLS termination at the LB.
        </p>

        <Callout variant="insight" title="The mental model">
          <p className="m-0">L4 = &quot;move bytes fast, route by network identity.&quot; L7 = &quot;understand the request, route by content.&quot; If you don&apos;t need to look inside the request, L4 is faster, simpler, and cheaper. The moment you need path-based routing, request-level retries, or per-user rate limiting, you need L7.</p>
        </Callout>

        <h3>The hybrid pattern (and why most production stacks use both)</h3>

        <p>
          Real production fleets often run an L4 LB in front of L7 LBs. The L4 layer does TCP-level distribution across availability zones (and can absorb DDoS at packet level), while the L7 layer does the actual application-aware routing. AWS&apos;s recommended pattern for high-throughput APIs is exactly this: NLB in front, ALB behind, services behind that.
        </p>

        <Mermaid chart={lbTopology} />

        <p>
          You don&apos;t have to do this. A single ALB is fine for most apps. But once you&apos;re past a few hundred thousand RPS, or once you&apos;re absorbing volumetric attacks, the L4-then-L7 sandwich is the standard answer.
        </p>

        <Quiz
          kind="Quick check"
          question="You're building a microservices API where /users/* should go to the user-service, /orders/* should go to the order-service, and you want to retry GETs on backend failure. Which load balancer fits?"
          options={[
            { label: "L4 — it's faster, and you can route by destination port.", explanation: "Path-based routing requires reading the HTTP request line, which is L7 only. L4 cannot see paths." },
            { label: "L7 — path-based routing and request-level retries both require parsing HTTP.", correct: true, explanation: "Right. The moment you say `/users/*` you need an L7 load balancer. Same for retrying individual requests — L4 can't identify which request inside a TCP stream succeeded or failed." },
            { label: "Either works — load balancers all see paths.", explanation: "L4 LBs route TCP connections, not HTTP requests. They never see the path." },
            { label: "Neither — you'd do this in DNS.", explanation: "DNS can do hostname-based routing but not path-based routing. And DNS doesn't do retries." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer on your team proposes terminating TLS at the L4 load balancer to 'speed things up.' What's wrong with that?"
          options={[
            { label: "Nothing — L4 LBs are designed to terminate TLS.", explanation: "L4 LBs do not terminate TLS in the standard sense. Once you're terminating TLS, you've become an L7 LB by definition — you have to decrypt the bytes to do anything." },
            { label: "L4 LBs don't terminate TLS. The whole point is they don't read the payload — they forward TCP bytes opaquely. If you want to terminate TLS you need an L7 LB.", correct: true, explanation: "Right. L4 LBs route encrypted streams just fine because they don't need to read them. The minute you terminate TLS, you have plaintext HTTP and you're effectively L7. The engineer is mixing the two layers up." },
            { label: "TLS termination always requires a separate appliance.", explanation: "Not true — L7 LBs (ALB, NGINX, Envoy) routinely terminate TLS." },
            { label: "TLS is inherently slower at L4.", explanation: "L4 LBs don't do TLS termination at all, so the speed comparison doesn't apply." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="L4 vs L7 is the most useful single distinction in load balancing. Pick by what you need to see."
          points={[
            { takeaway: "L4 routes TCP — fast, dumb, can't see inside the request.", detail: <>Use it when raw throughput matters and your routing decision is based on network identity (source/dest IP, port). NLB, IPVS, HAProxy in TCP mode.</> },
            { takeaway: "L7 routes HTTP — slower, smart, terminates TLS, knows paths and headers.", detail: <>Use it for path-based routing, retries, per-user rate limits, and any decision that depends on request content. ALB, NGINX, Envoy, Spring Cloud Gateway.</> },
            { takeaway: "The L4-then-L7 sandwich is standard at high throughput.", detail: <>L4 does packet-level distribution and absorbs volumetric attacks; L7 does application-aware routing. Most cloud-native architectures end up here.</> },
            { takeaway: "If you're terminating TLS, you're doing L7 work.", detail: <>Decryption requires reading the bytes. Anything that reads the bytes is L7 by definition, regardless of what the marketing page calls it.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ============================================================== */}
      {/* PART 2 — Algorithms & health checks                             */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="load-balancing" id="algorithms" title="Algorithms & health checks" xp={25} celebration="Algorithms picked, health checks tuned. The LB is doing real work now.">
      <section>
        <h2>Part 2: Algorithms and health checks</h2>

        <p>
          Pretty much every load balancer ships with a half-dozen algorithms and a default of round robin. Round robin is almost never the right answer in production — it just happens to be a defensible default when you don&apos;t know anything about your backends. Let&apos;s walk through what&apos;s actually available and when each one earns its keep.
        </p>

        <h3>Round robin (RR)</h3>

        <p>
          The LB hands the next request to the next backend in a list, wrapping around. Simple, stateless, predictable. The problem: it assumes every backend is identical and every request costs the same. Both assumptions break in practice. One node has slightly slower disks, one node is mid-GC, one request is a tiny health check and the next is a 200ms ML inference. Round robin happily piles work onto an already-suffering node.
        </p>

        <h3>Weighted round robin</h3>

        <p>
          Same as RR but each backend has a weight. A box with twice the CPU gets weight 2, gets twice the requests. Useful during heterogeneous fleet rollouts (some boxes are the new instance type, some are the old). Still has the &quot;equal request cost&quot; assumption.
        </p>

        <h3>Least connections</h3>

        <p>
          Send the next request to the backend with the fewest active connections. Better than RR for services with variable per-request cost, because a backend that&apos;s stuck on a slow request will accumulate connections and stop receiving new ones. This is the right default for most HTTP services. NGINX calls it <code>least_conn</code>; AWS ALB calls it &quot;least outstanding requests.&quot;
        </p>

        <h3>EWMA / least response time</h3>

        <p>
          Track an exponentially weighted moving average of response time per backend; route to the fastest. Catches degraded nodes that haven&apos;t failed health checks but are running hot. Envoy supports this; it&apos;s the most defensible algorithm for latency-sensitive services. The tradeoff is more state to maintain and more sensitivity to noisy measurements.
        </p>

        <h3>Random with power of two choices (P2C)</h3>

        <p>
          Pick two random backends, send the request to whichever has fewer in-flight requests. Sounds dumb, works astonishingly well — provably close to optimal in queueing theory, and stateless across LB instances. This is what Envoy and Linkerd default to, and it&apos;s the right answer when you have multiple LB instances that can&apos;t coordinate (because RR or least-conn across uncoordinated LBs is biased).
        </p>

        <h3>Consistent hashing</h3>

        <p>
          Hash some property of the request (user ID, session ID, cache key) and map it to a backend via a consistent-hash ring. Same input always lands on the same backend, which is exactly what you want for cache locality or session affinity. When you add or remove a node, only ~1/N of the keys remap. Used by Memcached clients, by Redis cluster, and by edge proxies routing to stateful pods.
        </p>

        <ClassifyChallenge
          title="Pick the right algorithm"
          prompt="For each scenario, pick the algorithm that fits best. Some scenarios have a clear winner; some have two defensible answers, but one is meaningfully better."
          buckets={[
            { id: "rr", label: "Round robin", color: "sky" },
            { id: "leastconn", label: "Least connections", color: "indigo" },
            { id: "p2c", label: "Power of two choices", color: "emerald" },
            { id: "consistent", label: "Consistent hashing", color: "violet" },
          ]}
          items={[
            { id: "i1", label: "A stateless REST API behind a single LB, requests are fast and roughly uniform in cost", answer: "leastconn", explanation: "Least connections is the safe default — even when requests are roughly uniform, a backend mid-GC will stop draining connections, and least-conn naturally routes around it." },
            { id: "i2", label: "Five Envoy sidecars routing to a backend pool, no central coordination", answer: "p2c", explanation: "Multiple uncoordinated LBs are exactly the case P2C was designed for. Per-LB least-conn would be biased; P2C is provably near-optimal and stateless." },
            { id: "i3", label: "A Memcached-style cache cluster — same key should always hit the same node", answer: "consistent", explanation: "Consistent hashing is the only algorithm here that gives you cache locality. Adding a node only remaps ~1/N of keys." },
            { id: "i4", label: "A homogeneous fleet of identical servers running an extremely fast in-memory service", answer: "rr", explanation: "Round robin is fine here — when all backends are identical and per-request cost is uniform, RR is the simplest thing that works. Don't over-engineer." },
            { id: "i5", label: "An ML inference service where some requests cost 50ms and some cost 2 seconds", answer: "leastconn", explanation: "Least connections handles variable cost much better than RR — slow backends naturally stop attracting new requests. P2C also works; least-conn is the conventional answer." },
            { id: "i6", label: "Routing user requests to the shard that holds their data", answer: "consistent", explanation: "User-ID-keyed consistent hashing is exactly how sharded services route. It's also the standard pattern for sticky cache reads at scale." },
          ]}
        />

        <h3>Health checks: active vs passive</h3>

        <p>
          A load balancer&apos;s job is to not send requests to a dead node. To know which nodes are dead, it does health checks. The two flavors:
        </p>
        <ul>
          <li><strong>Active health checks.</strong>{" "}The LB pings each backend on a schedule (typically every 5-30 seconds) on a known endpoint like <code>/healthz</code>. If N consecutive pings fail, the backend is marked unhealthy and removed from rotation. Simple, predictable, but high-latency: a node can be dead for tens of seconds before the LB notices.</li>
          <li><strong>Passive health checks.</strong>{" "}The LB watches real traffic. If a backend returns 5xx or times out on N consecutive real requests, it&apos;s marked unhealthy. Faster than active checks for catching real failures, but you&apos;ve already harmed real users when you notice. Most production setups use both.</li>
        </ul>

        <Callout variant="warn" title="The cascading health check failure">
          <p className="m-0">A health check should only test that the process is alive and roughly responsive. If your <code>/healthz</code> endpoint hits the database, then when the database flaps, every backend fails health checks simultaneously, the LB removes them all, and you&apos;ve turned a single-DB hiccup into a 100% outage. Keep liveness checks shallow. Use a separate readiness check that includes deeper dependencies, and only use it to gate &quot;should this pod receive traffic on initial startup&quot; — not for ongoing health.</p>
        </Callout>

        <CodeBlock lang="java" caption="Spring Boot Actuator: shallow liveness, deep readiness">{`// In modern Spring Boot, the actuator already separates these — use it.
// /actuator/health/liveness  → "is the JVM alive and unbroken?"
// /actuator/health/readiness → "can I serve traffic right now?"

// application.yml:
// management:
//   endpoint:
//     health:
//       probes:
//         enabled: true
//       group:
//         readiness:
//           include: db, redis, downstream
//         liveness:
//           include: livenessState

// LB / k8s liveness probe → /actuator/health/liveness  (no DB check)
// LB / k8s readiness probe → /actuator/health/readiness (DB + deps)

// The mistake: pointing your LB health check at /actuator/health, which
// includes EVERYTHING by default. One flaky downstream and the entire
// fleet drops out of rotation simultaneously. Always pin to /liveness
// for the load balancer's "is this node alive" decision.

@Component
public class DownstreamHealthIndicator implements HealthIndicator {
    private final PaymentsClient client;

    public DownstreamHealthIndicator(PaymentsClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        // Cache the result for ~5s so we don't hammer the downstream
        // every time k8s probes us. Tune to your environment.
        return client.isReachableCached()
            ? Health.up().build()
            : Health.down().withDetail("reason", "payments unreachable").build();
    }
}`}</CodeBlock>

        <Quiz
          kind="Drill"
          question="Your LB does active health checks every 10s, marks a node unhealthy after 3 consecutive failures, and you have 4 backends. A backend goes down mid-second. In the worst case, how long do user requests keep getting routed to the dead node?"
          options={[
            { label: "About 10 seconds — one health check interval.", explanation: "You need 3 consecutive failures, not 1. Multiply the interval by the failure threshold and add the worst-case timing of the first miss." },
            { label: "Up to ~40 seconds — 3 consecutive 10s intervals plus the gap between failure and the next probe.", correct: true, explanation: "Right. 3 × 10s for the failed probes plus up to 10s before the first probe sees the failure. That's why most production LBs pair active checks (slow but authoritative) with passive checks (fast, but only after harm) and accept that some user requests will fail during that window. This is also why fewer/larger backends amplify failure blast radius — losing 1 of 4 is 25% of your capacity gone for ~40s." },
            { label: "0 seconds — passive health checks catch it instantly.", explanation: "Passive checks catch failures faster than active, but they catch them by observing failed real requests — meaning users have already been harmed." },
            { label: "Forever — health checks don't fix this.", explanation: "Health checks do eventually catch failures and remove the bad node. The point is the lag between \"node dies\" and \"LB knows.\"" },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Which combination of health checks is the right default for a typical production HTTP service?"
          options={[
            { label: "Active checks only — passive is paranoid.", explanation: "Active alone has a 30-60s detection window in the worst case. Real failures will hurt users for that whole window." },
            { label: "Active + passive — active gives you a baseline, passive catches partial failures faster, plus you remove backends that are timing out on real traffic but still 200ing on /healthz.", correct: true, explanation: "Right. Active checks catch \"process is dead\" quickly enough; passive checks catch \"process is alive but stuck on real requests\" — which active checks will totally miss because /healthz returns instantly even when the actual code paths are wedged. You want both." },
            { label: "Passive checks only — they're always faster.", explanation: "Without active checks, a node that's never received traffic in the first place (cold start, scale-up) won't have any signal at all." },
            { label: "Neither — set the LB to remove nodes manually.", explanation: "Manual removal is what the on-call burns out on. Automate the obvious cases." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Algorithm and health-check choices silently shape your tail latency and your blast radius."
          points={[
            { takeaway: "Round robin is rarely the right default. Least connections is.", detail: <>RR assumes uniform request cost and uniform backend speed. Both fail in practice. Least connections naturally routes around stuck backends.</> },
            { takeaway: "Multiple uncoordinated LBs → power of two choices.", detail: <>Per-LB least-conn becomes biased when LBs can&apos;t coordinate. P2C is stateless across LBs and provably near-optimal.</> },
            { takeaway: "Consistent hashing is for stickiness — to a cache, to a shard, to a session.", detail: <>Pick the hash key carefully. User ID is great for sharding; session ID is great for cache locality. Adding a node only remaps ~1/N of keys.</> },
            { takeaway: "Liveness checks must be shallow. Readiness can be deep.", detail: <>If /healthz hits the database, a database hiccup will black out your entire fleet. Liveness = &quot;am I alive?&quot;; readiness = &quot;can I serve?&quot;</> },
            { takeaway: "Combine active and passive health checks.", detail: <>Active catches dead processes; passive catches alive-but-stuck processes. Either alone has gaps.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* ============================================================== */}
      {/* PART 3 — Sticky sessions, failure modes, capacity                */}
      {/* ============================================================== */}
      <Checkpoint moduleSlug="load-balancing" id="production" title="Sticky sessions & failure modes" xp={25} celebration="Sticky sessions handled, capacity sized. You can drive a load balancer in production now.">
      <section>
        <h2>Part 3: Sticky sessions, failure modes, and the N+1 rule</h2>

        <h3>Sticky sessions: when they&apos;re fine, when they hurt</h3>

        <p>
          Sticky sessions (also called session affinity) mean the LB pins a client to a specific backend for the duration of a session — usually via a cookie the LB sets, sometimes via source-IP hashing. The motivation is that the backend has some state in memory for this user, and re-creating that state on every request is expensive.
        </p>
        <p>
          They&apos;re fine for: WebSockets (you have to be sticky — the connection itself is the affinity), legacy apps that genuinely cannot externalize session state in a reasonable time, and services where the in-memory cost is real and the user base is large enough that pinning doesn&apos;t lopside one node.
        </p>
        <p>
          They hurt when: a hot user pinned to one backend overloads that backend while others sit idle; deployments become painful because draining a node means waiting for every pinned session to expire; auto-scaling becomes lopsided because new nodes start with zero sessions and slowly accumulate. The right answer most of the time is to externalize session state — to Redis, to a JWT, to a sticky cookie that the user re-presents — and let the LB route freely.
        </p>

        <Callout variant="warn" title="Source-IP stickiness is a trap">
          <p className="m-0">If your LB uses source IP for stickiness, two things go wrong fast. First, mobile users behind carrier NAT all share an IP — you&apos;ll pin millions of users to one backend. Second, the same user roaming from wifi to cellular gets a new IP and a new backend, so the &quot;sticky&quot; session breaks at exactly the moment the user noticed. Cookie-based stickiness is the modern answer; source-IP stickiness is a relic from when proxies didn&apos;t set cookies.</p>
        </Callout>

        <h3>The N+1 capacity rule</h3>

        <p>
          Here&apos;s the rule that decides how many backends you need: <strong>provision so that your fleet can absorb peak load with one node down.</strong>{" "}Not zero nodes down. One. That&apos;s the N+1 rule (sometimes called &quot;tolerate one fault&quot;).
        </p>
        <p>
          The math is simple: if peak load is P and one node can handle C, you need ceil(P/C) + 1 nodes. If P=10k QPS and C=2k QPS per node, you need ceil(10k/2k) + 1 = 6 nodes. Five would let you survive peak, but the moment one dies you&apos;re in overload. Six gives you headroom for one death plus normal variance.
        </p>
        <p>
          For multi-AZ setups the rule is stronger: tolerate losing an entire zone. If you have 3 AZs and peak load P, each AZ should be sized to handle P/2 — because losing one zone leaves two zones to absorb 100% of traffic. This is why &quot;just spread evenly across AZs&quot; is a cost trap if you didn&apos;t over-provision; you&apos;ll fall over the first time a zone has a bad day.
        </p>

        <CodeBlock lang="plain">{`# N+1 sizing — single zone
nodes_needed = ceil(peak_qps / per_node_capacity) + 1

# Zone-redundant sizing — losing one zone is a non-event
per_zone_nodes = ceil(peak_qps / per_node_capacity / (zones - 1))
total_nodes    = per_zone_nodes * zones

# Example: 10k peak QPS, 2k QPS/node, 3 AZs
# per_zone = ceil(10000 / 2000 / 2) = ceil(2.5) = 3
# total = 3 * 3 = 9 nodes
# (lose any one AZ, the remaining 6 nodes still handle 10k QPS at peak)`}</CodeBlock>

        <h3>What actually happens during a failure</h3>

        <p>
          Picture this. You have 4 backends, each at 60% CPU at peak. One dies. The LB takes ~30s to notice. During those 30s, ~25% of requests fail. After those 30s, the LB routes 100% of traffic to the surviving 3 backends. Each was at 60% × (4/3) = 80% CPU. Tomorrow that&apos;s fine, today there&apos;s a small traffic spike and one of the three saturates, response times balloon, the LB&apos;s least-connections algorithm starts dumping more on the other two, those saturate, and now you&apos;ve cascaded.
        </p>
        <p>
          The fix isn&apos;t the load balancer — the fix is to provision so that 1 dead node still leaves you below ~70% utilization. The LB is a multiplier on whatever capacity you gave it. It cannot create capacity that isn&apos;t there.
        </p>

        <Callout variant="spring" title="Spring + Kubernetes: where the LB lives">
          <p className="m-0">In a typical Spring on Kubernetes setup, you have at least two LBs: the cloud LB (NLB/ALB) terminating external traffic and forwarding to k8s, and kube-proxy / a service mesh sidecar (Envoy via Istio or Linkerd) doing in-cluster routing. The external LB usually defaults to round robin; the in-cluster mesh defaults to P2C or least-request. Both choices matter, and they don&apos;t have to match. If your tail latency is bad and you&apos;ve already tuned the app, ask whether the in-cluster algorithm is actually appropriate for your traffic shape.</p>
        </Callout>

        <Quiz
          kind="Drill"
          question="You run 4 backends behind an ALB doing least-connections. Each backend handles 2,500 QPS comfortably. Peak traffic is 8,000 QPS. The on-call asks: 'are we N+1?' What's the answer?"
          options={[
            { label: "Yes — 4 backends × 2,500 = 10,000 capacity, peak is 8,000, plenty of room.", explanation: "Total capacity is 10,000 but losing one node drops you to 7,500 — below 8,000 peak. The fleet cannot absorb a single node failure at peak. That's exactly what N+1 forbids." },
            { label: "No — losing one backend leaves 3 × 2,500 = 7,500 capacity, which is below 8,000 peak. You'd need 5 backends (or backends ~2,700+ capacity each) to be N+1.", correct: true, explanation: "Right. N+1 means \"peak still fits with one node gone.\" Here, losing 1 of 4 puts you under capacity at peak — guaranteed brownout the next time a host is rebooted, an instance is replaced, or a zone has a network blip." },
            { label: "Doesn't matter — autoscaling will catch up.", explanation: "Autoscaling has a multi-minute lag between \"CPU climbs\" and \"new pod is serving traffic.\" You will outage during that window." },
            { label: "Yes, because least-connections will redistribute the load.", explanation: "Algorithm choice can't create capacity. If the surviving fleet is below peak, it's below peak no matter how cleverly you route." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer wants to enable cookie-based sticky sessions on the ALB to 'reduce tail latency from cache misses.' What's the most important question to ask first?"
          options={[
            { label: "Can we externalize the cache to Redis instead, so the LB stays free?", correct: true, explanation: "Right. Sticky sessions are usually papering over the real problem — cached state living in process memory. If you move that cache to Redis (or Caffeine + Redis), every backend can serve every user, and you keep deployment, scaling, and failure handling simple. Stickiness is the right answer occasionally; externalizing the state is the right answer most of the time." },
            { label: "What cookie format do you want to use?", explanation: "That's a configuration detail. The architectural question is whether you should be sticky at all." },
            { label: "Can we set the cookie TTL to 1 hour?", explanation: "Same — a tuning detail that comes after the architectural question." },
            { label: "Are we using Spring Session?", explanation: "Spring Session is one way to externalize sessions; the question of whether to externalize at all comes first." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Stickiness and capacity sizing are where load balancer choices meet on-call reality."
          points={[
            { takeaway: "Sticky sessions are usually a smell — externalize the state instead.", detail: <>Redis, JWTs, or a self-presenting cookie all let the LB route freely. Stickiness should be reserved for WebSockets and genuinely unmovable in-memory state.</> },
            { takeaway: "Source-IP stickiness breaks for mobile users.", detail: <>Carrier NAT pins millions of users to one backend; roaming reassigns IPs and breaks sessions. Cookie-based stickiness is the modern default.</> },
            { takeaway: "N+1 means peak load fits with one node gone, not all nodes up.", detail: <>If losing 1 of 4 backends drops you below peak capacity, you&apos;ll outage on the next reboot. Provision for one fault, always.</> },
            { takeaway: "Multi-AZ sizing tolerates losing an entire zone.", detail: <>3 AZs means each pair of zones must absorb 100% peak. The cheapest two-AZ deploy is also the deploy that falls over the first time AWS has a zonal blip.</> },
            { takeaway: "The load balancer cannot create capacity that isn't there.", detail: <>Algorithm choice rebalances load; it doesn&apos;t add headroom. Capacity sizing is upstream of every LB tuning conversation.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: rate limiting</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Now that requests are flowing through a load balancer, the next question is which ones you let through. Module 21 covers rate limiting algorithms — token bucket, leaky bucket, sliding window — and how to do distributed rate limiting with Redis.
        </p>
        <Link
          href="/courses/system-design/modules/rate-limiting"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-sky-600 hover:to-blue-600 hover:shadow-md"
        >
          Module 21: Rate limiting →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="load-balancing" />
    </article>
  );
}
