import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/courses/system-design";

const CHECKPOINTS = [
  { id: "physics", title: "The physics of distance" },
  { id: "topologies", title: "Multi-region topologies" },
  { id: "edge", title: "CDNs and edge compute" },
  { id: "multi-device", title: "Multi-device sync" },
];

const activeActiveDiagram = `flowchart LR
  subgraph US-East
    LB1[ALB] --> APP1[App us-east]
    APP1 --> DB1[(Primary)]
  end
  subgraph EU-West
    LB2[ALB] --> APP2[App eu-west]
    APP2 --> DB2[(Replica)]
  end
  DB1 -. async replication .- DB2
  C1[US user] --> LB1
  C2[EU user] --> LB2
  style DB1 fill:#dbeafe,stroke:#2563eb
  style DB2 fill:#fef3c7,stroke:#d97706`;

export default function Page() {
  const mod = getModuleBySlug("geo-systems")!;

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
        <ModuleProgress moduleSlug="geo-systems" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌍</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A budget for latency you can actually defend, and a clean way to think about where state lives versus where compute happens. Geo-distribution is mostly about the speed of light and being honest about it.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The latency floor light imposes on cross-region calls — and what to do about it</li>
          <li>Active-passive vs active-active vs sharded-by-region: when each is the right answer</li>
          <li>What CDNs cache, what edge compute can and can&apos;t do, and the read/write asymmetry</li>
          <li>How to write a defensible latency budget for a global user</li>
        </ul>
      </section>

      <Checkpoint moduleSlug="geo-systems" id="physics" title="Part 1 · The physics of distance" xp={25}>

        <h2>The number you can&apos;t negotiate with</h2>
        <p>
          Light travels through fiber at roughly two-thirds the speed of light in vacuum — call it 200,000 km/s. New York to London is about 5,500 km. The one-way theoretical minimum: 27.5ms. Round-trip: 55ms. In practice, you see 70–90ms because fiber doesn&apos;t lay in straight lines, packets cross multiple network hops, and routers add a millisecond here and there.
        </p>
        <p>
          That&apos;s the floor. No engineer, no AWS region, no clever caching gets you under it for a synchronous round trip. Once you accept this, multi-region architecture stops being mysterious — it&apos;s a question of how to avoid synchronous round trips on the hot path.
        </p>

        <Callout variant="insight" title="The latency cheat sheet you should memorize">
          <ul className="m-0">
            <li><strong>Same AZ:</strong> 0.5–1ms RTT. Effectively free.</li>
            <li><strong>Same region, cross-AZ:</strong> 1–2ms RTT. Use freely; this is what synchronous replication assumes.</li>
            <li><strong>US-East to US-West:</strong> 60–80ms RTT. One round trip is your whole p50 budget.</li>
            <li><strong>US to Europe:</strong> 70–100ms RTT.</li>
            <li><strong>US to APAC (Tokyo, Sydney):</strong> 150–200ms RTT.</li>
            <li><strong>Mobile last-mile:</strong> add 30–100ms on top, more on cellular.</li>
          </ul>
        </Callout>

        <h2>Why this kills naive designs</h2>
        <p>
          The classic mistake: a service in us-east-1 calls a database in us-east-1, calls another service that also lives in us-east-1, returns to the client. p50 of 50ms. Then someone says &quot;let&apos;s serve EU users from EU&quot; and moves the app server to eu-west-1 — but leaves the database in us-east-1. Every request now does a transatlantic round trip per query. Two N+1 queries and you&apos;re past 500ms.
        </p>
        <p>
          The lesson: <strong>state and compute travel together, or you pay every time</strong>. Moving the app without the data is worse than not moving at all.
        </p>

        <Callout variant="warn" title="Latency budgeting in practice">
          <p className="m-0">Pick a p99 target — say 300ms for a global API. Subtract the network floor between your worst-case user and your serving region. What&apos;s left is the budget for everything in your code path. If your worst user is in Sydney and you serve from Virginia, you&apos;re burning 200ms before any of your code runs. Either move closer to the user, cache aggressively, or accept that 300ms is not a real SLO.</p>
        </Callout>

        <Quiz
          question="A user in Tokyo loads your homepage. Your servers and database are in us-east-1. Your code does 4 sequential database queries (each 1ms in-region) and returns. Roughly what p50 latency does the user see?"
          options={[
            { label: "Around 4ms — the database is fast.", correct: false, explanation: "That ignores the user-to-server round trip, which dominates everything else." },
            { label: "Around 50ms — including some network overhead.", correct: false, explanation: "Tokyo to Virginia is 150-200ms RTT; you can't get a response in 50ms." },
            { label: "Around 150-200ms — that's the round-trip floor between Tokyo and Virginia.", correct: true, explanation: "The database queries happen in-region (4ms total) but the user pays one transatlantic-equivalent round trip just to receive the response. Network dominates." },
            { label: "Around 800ms — each query adds a Tokyo round trip.", correct: false, explanation: "The queries are server-to-database within us-east-1, not Tokyo-to-Virginia. Only the user's request and response cross the ocean." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Geographic latency is a floor set by physics. Engineering only reduces what's added on top."
          points={[
            { takeaway: "200,000 km/s in fiber, not vacuum", detail: "That's the actual speed of light through fiber, including refraction. Your numbers should use this constant, not c." },
            { takeaway: "Cross-region RTT bands matter", detail: "Same-region: free. Cross-region in continent: 60-80ms. Cross-continent: 70-200ms. Memorize the bands." },
            { takeaway: "State and compute travel together", detail: "Putting compute closer to users without colocating state makes latency worse, not better." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="geo-systems" id="topologies" title="Part 2 · Multi-region topologies" xp={25}>

        <h2>Three honest patterns</h2>
        <p>
          Almost every multi-region deployment is one of three shapes. Each has a clear write story (where can I write, what consistency do I get) and a clear failover story (what happens when a region dies). If you can&apos;t answer those two questions for your own system in one sentence, you don&apos;t have a multi-region architecture — you have a wish.
        </p>

        <h3>1. Active-passive (warm standby)</h3>
        <p>
          One region serves all traffic. A second region replicates state asynchronously and sits idle. On disaster, you cut DNS and promote the standby. Simple, cheap, and gives you a recovery time of minutes — not seconds.
        </p>
        <ul>
          <li><strong>Reads:</strong> all from primary region.</li>
          <li><strong>Writes:</strong> all to primary region.</li>
          <li><strong>Failover:</strong> manual or automated DNS flip; promotion of standby DB; expect 1–10 minutes of downtime and possible data loss bounded by replication lag (RPO).</li>
          <li><strong>Use when:</strong> you need DR but not low-latency global reads. Bank back offices, internal tools.</li>
        </ul>

        <h3>2. Active-active</h3>
        <p>
          Multiple regions serve traffic concurrently. Users hit the nearest region (geo-DNS or anycast), but all regions can read and write. State has to converge somehow — that&apos;s the hard part.
        </p>

        <Mermaid chart={activeActiveDiagram} />

        <ul>
          <li><strong>Reads:</strong> local to each region.</li>
          <li><strong>Writes:</strong> either local with async replication (eventual consistency, conflict resolution required) or routed to a global leader (one region pays the round trip).</li>
          <li><strong>Failover:</strong> traffic shifts to surviving regions automatically; little to no data loss if the consensus group is global.</li>
          <li><strong>Use when:</strong> you need low-latency reads globally and can either tolerate eventual consistency or pay for cross-region consensus (Spanner, CockroachDB, DynamoDB Global Tables).</li>
        </ul>

        <Callout variant="warn" title="The active-active conflict trap">
          <p className="m-0">If two regions accept writes to the same row at the same time, somebody has to lose — or you need CRDTs, vector clocks, or a global serializer. Most teams underestimate how often this happens. The honest options: (a) shard so each row has a home region, (b) accept LWW and the data loss it implies, (c) use a database that solves this for you (Spanner, CockroachDB) and pay the latency tax. Picking &quot;active-active with async replication and no conflict story&quot; is picking eventual data corruption.</p>
        </Callout>

        <h3>3. Sharded by region (partitioned)</h3>
        <p>
          Each user (or tenant) has a home region. EU users live in eu-west; US users live in us-east. Writes for a user always go to their home region. There&apos;s no cross-region write conflict because no two regions own the same data.
        </p>
        <ul>
          <li><strong>Reads:</strong> local for users in their home region; cross-region for foreigners (e.g., US user reading EU data).</li>
          <li><strong>Writes:</strong> always local to home region.</li>
          <li><strong>Failover:</strong> only that region&apos;s users are affected; you may failover to a paired region.</li>
          <li><strong>Use when:</strong> users have a clear home (B2B SaaS, regional services); compliance (GDPR data residency) makes this required anyway.</li>
        </ul>

        <Callout variant="info" title="The honest comparison">
          <p className="m-0">Active-passive is a DR plan, not low-latency global. Active-active is the marketing answer; making it correct is expensive. Sharded-by-region is what most successful global SaaS actually runs (Slack workspaces, Salesforce orgs, Notion teams) — because users naturally cluster by tenant, and tenant-pinning sidesteps the conflict problem entirely.</p>
        </Callout>

        <h2>Failover that won&apos;t betray you</h2>
        <p>
          Two metrics matter: <strong>RTO</strong> (recovery time — how long until we&apos;re serving again) and <strong>RPO</strong> (recovery point — how much data can we afford to lose). For async replication, your RPO is bounded by your replication lag. If lag spikes to 30s during the incident that triggered failover (very common — that&apos;s why it failed over), your RPO is 30s of writes, gone.
        </p>
        <p>
          A few rules that have saved teams:
        </p>
        <ul>
          <li><strong>Test failover quarterly.</strong> Untested failover doesn&apos;t work; assume nothing.</li>
          <li><strong>Don&apos;t auto-failover state.</strong> Compute, yes. Databases — humans should approve, especially when split-brain is possible.</li>
          <li><strong>Watch replication lag like prod.</strong> Page on lag &gt; threshold; that&apos;s your RPO going up in real time.</li>
          <li><strong>Drain traffic, don&apos;t cut it.</strong> Health-checked weighted routing beats DNS TTL gymnastics.</li>
        </ul>

        <Quiz
          question="You run an active-active deployment with async replication between us-east and eu-west. A user in EU updates their profile name; 100ms later the same user (still in EU) reads it back. What guarantees this read returns the new name?"
          options={[
            { label: "Async replication catches up within 100ms — they'll see it.", correct: false, explanation: "Async replication has no upper bound; the EU read could route to us-east replica and miss the write. You need explicit guarantees, not hope." },
            { label: "Sticky-routing the user to their write region (read-your-writes via session affinity).", correct: true, explanation: "If the user's reads always hit the region that accepted their writes, they read their own writes locally. This is the standard active-active pattern: session-pinning to a region for read-your-writes." },
            { label: "All reads go through a global consensus group.", correct: false, explanation: "That works but defeats the latency benefit of multi-region. You'd pay cross-region RTT on every read. Sticky-routing is cheaper and sufficient for read-your-writes." },
            { label: "Nothing — eventual consistency means you can see stale data.", correct: false, explanation: "Without sticky-routing this is true. With it, reads stay local to the write region and see the write immediately." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Active-passive for DR. Active-active for global low-latency reads (with a real consistency story). Sharded-by-region for tenant-shaped workloads. Pick the simplest one your requirements actually justify."
          points={[
            { takeaway: "Conflict resolution is the active-active tax", detail: "If two regions can write the same row, you owe an answer for what wins. CRDTs, LWW, global consensus — pick one explicitly." },
            { takeaway: "RPO is bounded by replication lag", detail: "Async replication means your RPO equals your worst-case lag during the incident — usually larger than steady-state lag." },
            { takeaway: "Sharded-by-region is underrated", detail: "Tenant-pinning sidesteps conflicts and matches GDPR-style residency rules. Most B2B SaaS lands here in the end." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="geo-systems" id="edge" title="Part 3 · CDNs and edge compute" xp={25}>

        <h2>What a CDN actually does</h2>
        <p>
          A CDN is a globally-distributed cache for HTTP responses. Cloudflare, Fastly, Akamai, CloudFront — they all share the same shape: thousands of points-of-presence (PoPs) close to users, with disk caches and a smart routing layer that maps a user to a nearby PoP.
        </p>
        <p>
          When a user requests <code>/static/logo.png</code>, the PoP serves it from cache. On miss, the PoP fetches from your origin, caches the response, and serves it. Subsequent requests within the cache TTL are served at PoP latency — typically 5–30ms anywhere on Earth.
        </p>

        <h3>What CDNs are great at</h3>
        <ul>
          <li><strong>Static assets:</strong> images, CSS, JS, fonts, video chunks. The classic case.</li>
          <li><strong>Cacheable API responses:</strong> public, immutable, or short-TTL data. Product catalogs, public profile pages.</li>
          <li><strong>Origin shielding:</strong> a tier of cache between your PoPs and your origin to absorb traffic spikes.</li>
          <li><strong>TLS termination + early HTTP/3:</strong> cuts handshake latency before requests even reach your code.</li>
        </ul>

        <h3>What CDNs are not</h3>
        <ul>
          <li><strong>Not a write accelerator.</strong> POSTs go to origin. Always.</li>
          <li><strong>Not a fix for personalized content.</strong> Per-user data has cardinality close to the number of users; cache hit rates approach zero. Use a CDN for the unpersonalized parts only.</li>
          <li><strong>Not a database.</strong> Cache invalidation is hard. If you put dynamic data in a CDN, you own the invalidation problem.</li>
        </ul>

        <Callout variant="spring" title="The cache key rule">
          <p className="m-0">Cache hit rate is determined entirely by the cache key. If your key includes the user&apos;s session cookie, every user gets their own entry — hit rate near zero. Strip personalized headers before CDN reaches your varied responses; keep cache keys to URL path plus a small set of dimensions (locale, device class). The fastest CDN setup is the one with a hit rate above 90%, not the one with the most PoPs.</p>
        </Callout>

        <h2>Edge compute: code at the PoP</h2>
        <p>
          Cloudflare Workers, Fastly Compute, Lambda@Edge, Vercel Edge Functions — they all let you run code at the CDN PoP, not at the origin. The pitch: do work close to the user, return a response without the round trip to origin.
        </p>
        <p>
          Edge compute is great at lightweight, request-shaping work:
        </p>
        <ul>
          <li>A/B test routing, header rewriting, redirects, geofencing.</li>
          <li>Auth token validation against a small cache (avoiding origin for invalid tokens).</li>
          <li>Personalizing the cacheable shell of a page (HTML composition from cached fragments).</li>
          <li>Bot detection, rate limiting at edge.</li>
        </ul>

        <Callout variant="warn" title="The state problem at the edge">
          <p className="m-0">Edge compute runs at hundreds of PoPs. If your code needs to read or write state, where does the state live? Option A: at the origin — every read/write pays the round trip you wanted to avoid. Option B: at the edge with eventual consistency (Cloudflare KV, Workers Durable Objects). Option C: a globally-distributed database (FaunaDB, Turso). All three have real costs. The naive &quot;just move the API to the edge&quot; usually trades one round trip for many.</p>
        </Callout>

        <h2>Designing the read/write split</h2>
        <p>
          The clean architectural answer for global apps:
        </p>
        <ul>
          <li><strong>Reads of public/cacheable data:</strong> CDN. Aim for 90%+ hit rate.</li>
          <li><strong>Reads of per-user data (latency-sensitive):</strong> region-local replicas with read-your-writes routing.</li>
          <li><strong>Writes:</strong> route to the region that owns the user, or to a global consensus group if you need linearizability.</li>
          <li><strong>Edge compute:</strong> request shaping, auth, personalization shell. Keep it stateless or use edge KV with explicit consistency expectations.</li>
        </ul>

        <ClassifyChallenge
          title="Match each request to its serving layer"
          prompt="Match each request to the layer that should serve it."
          buckets={[
            { id: "cdn", label: "CDN cache", color: "emerald" },
            { id: "edge", label: "Edge compute", color: "sky" },
            { id: "regional", label: "Regional API", color: "indigo" },
            { id: "global", label: "Global consensus DB", color: "violet" },
          ]}
          items={[
            { id: "i1", label: "GET /static/app.js", answer: "cdn", explanation: "Immutable static assets are exactly what CDNs were built for. High hit rate, no origin traffic." },
            { id: "i2", label: "GET /products/123 (public, changes daily)", answer: "cdn", explanation: "Public, low-cardinality, daily TTL — perfect CDN candidate. Strip auth headers from the cache key." },
            { id: "i3", label: "POST /auth/refresh — validate JWT, reject expired tokens before they reach origin", answer: "edge", explanation: "Stateless validation against an embedded JWKS is a textbook edge-compute job — saves origin traffic and adds milliseconds, not hundreds." },
            { id: "i4", label: "GET /user/me/feed — personalized, frequently changing", answer: "regional", explanation: "Per-user data has cardinality that breaks CDN economics. Serve from a region close to the user with local replicas." },
            { id: "i5", label: "POST /transfer — money movement requiring linearizability across regions", answer: "global", explanation: "Strong consistency across regions is exactly what Spanner / CockroachDB / DynamoDB Global Tables are for. Pay the latency tax knowingly." },
            { id: "i6", label: "GET /api/inventory/stock — semi-fresh, OK to be 30s stale globally", answer: "cdn", explanation: "Short-TTL public data with an explicit staleness budget belongs in a CDN. The 30s window is exactly the cache TTL." },
            { id: "i7", label: "GET /geo/redirect — route US users to /us, EU to /eu based on IP", answer: "edge", explanation: "Request shaping based on geo is a classic edge-compute use case. No origin needed; respond from the PoP." },
            { id: "i8", label: "POST /orders — write to user's home region", answer: "regional", explanation: "Writes go to the region that owns the user's data; replication handles propagation. Don't try to do this at the edge." },
          ]}
        />

        <h2>A worked latency budget</h2>
        <p>
          Imagine you&apos;re building a global SaaS dashboard with a p99 target of 500ms. Your worst-case user is in Sydney; your origin is in us-east-1. The Sydney-Virginia RTT is ~200ms. Here&apos;s how a defensible budget looks:
        </p>
        <ul>
          <li><strong>Static shell (HTML, JS, CSS):</strong> CDN at Sydney PoP — 30ms TLS + cache hit + transfer.</li>
          <li><strong>Auth check:</strong> edge compute validates token signature against an embedded JWKS — adds 5ms, no origin round trip.</li>
          <li><strong>User data fetch:</strong> regional replica in ap-southeast-2 (Sydney) — 20ms RTT + 10ms query.</li>
          <li><strong>Write (rare on this page):</strong> async POST to home region (us-east-1) — 200ms but doesn&apos;t block first paint.</li>
        </ul>
        <p>
          Total time-to-interactive: ~65ms for the synchronous critical path. Compare to the naive design (everything in us-east-1): 200ms RTT before a single byte arrives. That&apos;s the win, and it cost you a CDN bill, an edge worker, and one regional replica.
        </p>

        <Quiz
          question="Your team wants to move a personalized dashboard endpoint to Cloudflare Workers (edge compute) to 'make it faster globally'. The endpoint reads 5 fields from a Postgres database in us-east-1. What's the most likely outcome?"
          options={[
            { label: "Latency improves dramatically — edge compute is closer to users.", correct: false, explanation: "Compute is closer, but the Postgres reads still cross the ocean for non-US users — and now they cross from a PoP, not from the original origin region. Often slower." },
            { label: "Latency gets worse for non-US users — every DB call is now a transcontinental round trip from the PoP.", correct: true, explanation: "Exactly the trap. Edge compute without colocated state means every database read pays the round trip you wanted to eliminate. Edge compute helps when the work is stateless or uses edge-local state." },
            { label: "It works fine because edge platforms cache database queries automatically.", correct: false, explanation: "They don't. Caching arbitrary SQL is impossible without invalidation logic the platform can't infer." },
            { label: "Latency improves only for write traffic.", correct: false, explanation: "Writes still go to origin; they're not faster from edge. The latency math doesn't change for writes." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="CDNs cache reads. Edge compute shapes requests. Neither solves the state-locality problem — that requires regional architecture or a globally distributed database."
          points={[
            { takeaway: "Cache hit rate is the metric", detail: "A CDN with 50% hit rate is a load balancer with a billing problem. Aim for 90%+, which means strict cache-key hygiene." },
            { takeaway: "Edge compute is stateless-by-default", detail: "Putting code at the edge while leaving data at origin usually adds latency for non-origin-region users. State must travel too." },
            { takeaway: "Layer the architecture", detail: "CDN for public reads, edge for shaping, regional for per-user reads/writes, global consensus only for the few things that need it." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="geo-systems" id="multi-device" title="Part 4 · Multi-device sync" xp={25}>

        <h2>Same problem, different scale</h2>
        <p>
          Multi-region replication is the same problem you have on a phone. A user has 3-4 devices — phone, laptop, tablet, maybe a watch — and each one is a replica of their state. Each device goes offline (subway, airplane, dead Wi-Fi), accepts writes locally, and has to converge with the rest when it reconnects. The constraints are different from data centers (battery, push limits, flaky cellular) but the math is the same: you have multiple writers, asynchronous replication, and conflicts you have to resolve.
        </p>
        <p>
          The user&apos;s mental model is unforgiving: <em>read a message on your phone, open your laptop, and the chat list better show that message as read</em>. They expect convergence within a couple of seconds. The hard cases are the offline ones. Device A marks a message read while flying; device B replies to the same message while on the subway. Both reconnect 30 minutes later. What does the user see?
        </p>

        <Callout variant="info" title="Why this is on the senior interview circuit">
          <p className="m-0">Once you understand multi-region replication, multi-device sync is the same idea at a smaller scale — but with extra constraints (battery, mobile background limits, push wakeups). Interviewers love it because it forces you to talk about CRDTs, vector clocks, conflict resolution, and the tradeoff between server-authoritative and local-first architectures all in one design.</p>
        </Callout>

        <h2>Last-write-wins: when it&apos;s honest, when it lies</h2>
        <p>
          The simplest conflict policy: tag every write with a timestamp; on merge, the highest timestamp wins. It&apos;s cheap, stateless, and works fine for a specific shape of state — <strong>idempotent state with an absorbing value</strong>. The classic example is a read receipt. Once <code>isRead = true</code>, no later write flips it back. So even if two devices race to mark it read, both writes produce the same final state. WhatsApp uses LWW for read receipts because the cost of getting it wrong is low — at worst, you briefly show unread on one device for a second before convergence.
        </p>
        <p>
          LWW lies on three shapes of state:
        </p>
        <ul>
          <li><strong>Counters.</strong> Two devices both increment a like-count from 5. With LWW, both writes say &quot;the new value is 6&quot;. One increment is lost. The correct final value is 7.</li>
          <li><strong>Text edits.</strong> Two devices edit a doc title from different starting points. LWW keeps one version verbatim and discards the other entirely — even though both edits were intentional.</li>
          <li><strong>Sets with concurrent add/remove.</strong> Device A adds tag &quot;urgent&quot;; device B removes tag &quot;urgent&quot;. LWW picks one based on clock skew, not user intent.</li>
        </ul>

        <Callout variant="warn" title="Clock skew is the hidden enemy">
          <p className="m-0">LWW assumes timestamps are comparable across devices. They are not. Phones drift, users set their clocks manually, time zones get confused. Production LWW systems use a <em>logical</em> timestamp (a Lamport clock) or a <em>hybrid</em> timestamp (HLC — wall clock plus a logical counter to break ties). Naive wall-clock LWW will betray you the first time a user changes their phone&apos;s time zone mid-flight.</p>
        </Callout>

        <h2>Vector clocks for sync</h2>
        <p>
          When LWW lies, you need to detect concurrency rather than paper over it. That&apos;s what vector clocks do — and we already covered the mechanics in the clock-time module, so this is the application.
        </p>
        <p>
          Each device gets a counter. Every local change increments that device&apos;s counter. State carries a vector of all counters the device has seen. On merge:
        </p>
        <ul>
          <li>If vector A dominates B (every component of A is &gt;= B), A is strictly newer. Take A.</li>
          <li>If B dominates A, take B.</li>
          <li>If neither dominates (some components of A are higher, some of B), the writes were concurrent. You have a real conflict — surface it, or apply a deterministic merge rule.</li>
        </ul>
        <p>
          The win over LWW is honesty: vector clocks tell you <em>that</em> a conflict happened. They don&apos;t tell you how to resolve it; that&apos;s an application choice. But knowing a conflict exists is half the battle — silent data loss is what makes LWW dangerous.
        </p>

        <CodeBlock lang="plain" caption="Example: phone increments, laptop increments, then they sync">{`Initial state on both:    { phone: 0, laptop: 0 }   value: "draft"

Phone edits offline:      { phone: 1, laptop: 0 }   value: "draft v1"
Laptop edits offline:     { phone: 0, laptop: 1 }   value: "draft v2"

Both reconnect; server compares vectors:
  phone vec    { phone: 1, laptop: 0 }
  laptop vec   { phone: 0, laptop: 1 }
  Neither dominates -> CONCURRENT WRITE -> conflict surfaced

Resolution (app choice): keep both versions, prompt user, or apply CRDT merge.`}</CodeBlock>

        <h2>CRDTs: the merge math that doesn&apos;t require asking</h2>
        <p>
          A Conflict-free Replicated Data Type is a data structure with a merge operation that is commutative, associative, and idempotent. Translation: no matter what order replicas merge in, no matter how many times they merge, they all converge to the same state. No coordination required, no conflicts to resolve at the application layer.
        </p>
        <p>
          Two flavors:
        </p>
        <ul>
          <li><strong>State-based (CvRDT).</strong> Each replica sends its full state. Merge is a function like <code>max</code> or set union. Heavy on bandwidth, simple on logic.</li>
          <li><strong>Op-based (CmRDT).</strong> Each replica sends individual operations. Operations must be commutative (<code>add(x)</code> and <code>add(y)</code> can run in any order). Lighter bandwidth, requires reliable broadcast.</li>
        </ul>
        <p>
          The greatest hits, by use case:
        </p>
        <ul>
          <li><strong>G-counter</strong> (grow-only counter): each device tracks its own count; the value is the sum. Used for like counts, view counts, anything that only goes up.</li>
          <li><strong>PN-counter:</strong> a G-counter for increments and another for decrements; value is the difference. Now you can decrement too.</li>
          <li><strong>LWW-register:</strong> a single value with a timestamp. The honest version of LWW, used inside CRDT toolkits.</li>
          <li><strong>OR-set</strong> (observed-remove set): adds win over concurrent removes when the remove didn&apos;t see the add. Used for tag lists, collaborative selections.</li>
          <li><strong>RGA / Yjs / Automerge:</strong> collaborative text. Each character has a unique ID; concurrent inserts interleave deterministically.</li>
        </ul>

        <Callout variant="insight" title="When to reach for a CRDT — and when not to">
          <p className="m-0">Reach for a CRDT when convergence matters more than a hard invariant: collaborative editing (Google Docs, Figma, Linear), shopping carts that sync across devices, social-feed read state, presence aggregation. Do <strong>not</strong> reach for a CRDT when you have a hard invariant the system must never violate — bank balance &gt;= 0, ticket inventory &gt; 0, unique-username constraint. Those need consensus (Paxos, Raft) or a single serializing point. CRDTs guarantee convergence; they do not guarantee invariants.</p>
        </Callout>

        <h2>Two architectures for sync</h2>
        <p>
          The architectural axis is who owns the merge. Two honest patterns:
        </p>

        <h3>Server-authoritative</h3>
        <p>
          The server is the source of truth. Devices push deltas (often LWW or vector-clocked) to the server; the server applies the merge rule and broadcasts the result back to other devices via WebSocket or push. This is what Slack, WhatsApp, iMessage, and most consumer apps do. It&apos;s simple to reason about — there&apos;s exactly one place where conflicts get resolved — and easy to bolt on auth, audit, and analytics. The cost is offline pain: when devices are offline, they accumulate divergent state, and the server&apos;s merge logic has to be correct.
        </p>

        <h3>Peer-to-peer / local-first</h3>
        <p>
          Devices sync directly using CRDTs; the server is just a relay (or sometimes absent entirely on a LAN). Linear, Figma&apos;s collab layer, and Automerge-based apps lean here. Offline is great — every device is a real replica, no server round trip needed to make a local change feel real. The cost is engineering complexity: you&apos;re running a CRDT engine on the client, debugging convergence issues across versions, and giving up the simplicity of a single source of truth. Not a casual choice.
        </p>

        <Callout variant="info" title="Picking between them">
          <p className="m-0">If your app is mostly online and the server has the real audit trail (chat, social, e-commerce), go server-authoritative — it&apos;s simpler and the offline gap is acceptable. If your app is editing-centric and offline-first is part of the pitch (knowledge tools, design tools, project planning), invest in local-first / CRDT. Most teams underestimate how much engineering local-first costs; pick it for the right reason, not the marketing.</p>
        </Callout>

        <h2>Spring example: a server-authoritative sync endpoint</h2>
        <p>
          Here&apos;s the shape of a server-authoritative sync endpoint that accepts a vector-clock-tagged delta from a device and merges it. Skipping persistence and auth for clarity.
        </p>

        <CodeBlock lang="java" caption="A sync endpoint that accepts a versioned delta and resolves with vector clocks">{`@RestController
@RequestMapping("/sync")
public class SyncController {

  private final SyncStore store;
  private final SyncBroadcaster broadcaster;

  public SyncController(SyncStore store, SyncBroadcaster broadcaster) {
    this.store = store;
    this.broadcaster = broadcaster;
  }

  @PostMapping("/{userId}/delta")
  public ResponseEntity<MergeResult> push(
      @PathVariable String userId,
      @RequestBody DeviceDelta delta
  ) {
    DocumentState server = store.load(userId, delta.docId());
    VectorClock incoming = delta.vectorClock();

    if (incoming.dominates(server.clock())) {
      // Device has strictly newer state — accept, broadcast.
      DocumentState merged = server.applyDelta(delta);
      store.save(userId, merged);
      broadcaster.fanOut(userId, merged, delta.deviceId());
      return ResponseEntity.ok(MergeResult.accepted(merged.clock()));
    }
    if (server.clock().dominates(incoming)) {
      // Device is behind — tell it to pull.
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(MergeResult.behind(server));
    }
    // Concurrent edit — apply CRDT/LWW merge rule.
    DocumentState merged = server.merge(delta);
    store.save(userId, merged);
    broadcaster.fanOut(userId, merged, delta.deviceId());
    return ResponseEntity.ok(MergeResult.merged(merged.clock()));
  }
}`}</CodeBlock>

        <p>
          Three branches map directly to the vector-clock cases: dominate, be-dominated, concurrent. Real systems add idempotency keys (so a retried push doesn&apos;t double-apply), per-doc locks (so two pushes for the same doc serialize), and audit logging.
        </p>

        <h2>Presence across devices</h2>
        <p>
          &quot;Online&quot; gets weird when a user has four devices. The honest pattern: each device sends a heartbeat (every 30-60s on Wi-Fi, longer on cellular). The server aggregates per-user:
        </p>
        <ul>
          <li><strong>Online status:</strong> user is online if <em>any</em> device is online. Set union, expressed as a presence bitmap or simply &quot;max heartbeat across devices &gt; now - threshold&quot;.</li>
          <li><strong>Last seen:</strong> max heartbeat timestamp across devices. Even after all devices go offline, this gives you the right number.</li>
          <li><strong>Typing indicators:</strong> per-device, not per-user. A user can type from their phone while their laptop sits idle; aggregating &quot;is typing&quot; across devices produces nonsense (&quot;Alice is typing&quot; that flickers because the laptop briefly thought she stopped).</li>
        </ul>
        <p>
          Some apps surface the device explicitly (&quot;Alice — online from iPhone&quot;). Most just unify, because the user already knows which device they have in their hand. Picking one is a UX call, not a systems call — but the underlying aggregation logic is the same either way.
        </p>

        <h2>The mobile-specific dragons</h2>
        <p>
          Mobile adds constraints that pure server-side replication doesn&apos;t face. You can&apos;t treat phones like servers that happen to be small.
        </p>
        <ul>
          <li><strong>iOS background limits.</strong> Once your app backgrounds, you get a few seconds to clean up and then iOS suspends you. Your sync code is dead. The only way to wake up is a silent push (<code>content-available: 1</code>), and even those are rate-limited and best-effort. Plan for &quot;the device will not sync until the user opens the app or until a push wakes it.&quot;</li>
          <li><strong>Android Doze.</strong> Same idea, different name. After a period of inactivity, Android batches network and alarm work. Messaging apps can claim a high-priority FCM exemption, but for general apps you&apos;re subject to maintenance windows.</li>
          <li><strong>Battery.</strong> Aggressive heartbeats and constant socket reconnects drain batteries and get your app uninstalled. Back off when in background; rely on push as a wake signal rather than polling. The honest contract: foreground = real-time; background = best-effort, push-driven.</li>
          <li><strong>Push as a sync trigger.</strong> The pattern most messaging apps use: send a small &quot;something changed&quot; push, the OS wakes the app for a few seconds, the app pulls the actual deltas, then it goes back to sleep. The push payload is a wake signal, not the data itself — payloads are size-limited and may be dropped.</li>
        </ul>

        <Callout variant="warn" title="Don't treat the phone like a server">
          <p className="m-0">A common interview mistake: designing multi-device sync as if every device runs a long-lived process that listens on a socket. On mobile, that process dies the moment the user backgrounds the app. Your design needs to assume the device disappears for hours and reappears with a stale view, then catches up via push-triggered pulls. Anything else will fail review the moment a real mobile engineer looks at it.</p>
        </Callout>

        <Quiz
          question="You're designing read-receipt sync for a chat app. Three devices, each may go offline. Two devices independently mark the same message as read while offline. They both reconnect. Which conflict policy is appropriate?"
          options={[
            { label: "Vector clocks with manual conflict resolution.", correct: false, explanation: "Overkill. Read state is idempotent — once read, it stays read. There's no real conflict to surface to the user." },
            { label: "Last-write-wins on the isRead flag.", correct: true, explanation: "Read state is idempotent with an absorbing value (true). Both writes produce the same final state regardless of order. LWW is the cheapest correct answer here, and it's what WhatsApp actually does." },
            { label: "A G-counter — count how many devices have marked it read.", correct: false, explanation: "A counter would let you track per-device read state but the user-facing 'read' boolean is binary. Adding a counter solves a problem you don't have." },
            { label: "A consensus protocol (Raft) across devices.", correct: false, explanation: "Consensus needs a quorum, which an offline device by definition can't participate in. Reaching for consensus on a per-message read receipt is wildly disproportionate." },
          ]}
        />

        <Quiz
          question="A team is choosing between server-authoritative and local-first / CRDT sync for a collaborative project planner where users frequently work offline on planes and trains. Which is the better default and why?"
          options={[
            { label: "Server-authoritative — simpler to reason about.", correct: false, explanation: "Simpler is true, but it punishes the offline use case the team explicitly cares about. Every offline edit accumulates divergent state that may conflict on reconnect, and the server is the only place that can resolve it." },
            { label: "Local-first / CRDT — offline edits converge without coordination, which matches the user pattern.", correct: true, explanation: "When offline-first is the explicit pitch, CRDT-based local-first sync earns its complexity. Edits feel instant on the device and converge cleanly across devices because the merge math is built in. This is the Linear / Figma / Automerge bet." },
            { label: "Server-authoritative with longer offline buffers — easier to ship.", correct: false, explanation: "Buffers don't fix the merge problem; they postpone it. The server still has to resolve conflicts somehow when the buffer flushes, and without CRDT structure that's where data gets lost." },
            { label: "Either is fine — the choice is purely cosmetic.", correct: false, explanation: "It's a real engineering tradeoff. Local-first costs more to build and maintain but pays off when offline editing is core to the product. Server-authoritative is cheaper but the offline experience suffers." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Multi-device sync is multi-region replication at a smaller scale, with extra mobile constraints. Pick a conflict policy that matches your data shape, and pick an architecture that matches how often your users are offline."
          points={[
            { takeaway: "LWW is fine for idempotent state, dangerous elsewhere", detail: "Read receipts and absorbing booleans take LWW well. Counters, text edits, and sets with concurrent add/remove need vector clocks or CRDTs." },
            { takeaway: "CRDTs guarantee convergence, not invariants", detail: "Reach for them when merging beats coordinating. Don't reach for them when the system must never violate a hard rule like balance >= 0 — that needs consensus." },
            { takeaway: "Server-authoritative vs local-first is an honest tradeoff", detail: "Server-authoritative is simpler and right for most consumer apps. Local-first is worth the engineering cost when offline editing is core to the product." },
            { takeaway: "Mobile devices are not always-on replicas", detail: "iOS suspension and Android Doze mean sync only runs in foreground or via push wake. Design for hours-long offline gaps, not seconds-long blips." },
          ]}
        />

      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <h3 className="font-bold text-lg mb-2">Module wrap</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          Geo-distribution is mostly an exercise in respecting the speed of light and being honest about where state lives. Pick one of three topologies, write down your conflict and failover stories in plain words, and layer CDNs and edge compute over a regional architecture rather than as a substitute for one. Most multi-region projects fail because the team hoped state would just &quot;be&quot; everywhere. It won&apos;t. State has a home, and your design either acknowledges that home or fights it forever.
        </p>
      </section>

    </article>
  );
}
