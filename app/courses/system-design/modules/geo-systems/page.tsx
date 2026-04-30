import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";

const CHECKPOINTS = [
  { id: "physics", title: "The physics of distance" },
  { id: "topologies", title: "Multi-region topologies" },
  { id: "edge", title: "CDNs and edge compute" },
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

      <section className="not-prose my-12 rounded-2xl border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <h3 className="font-bold text-lg mb-2">Module wrap</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-0">
          Geo-distribution is mostly an exercise in respecting the speed of light and being honest about where state lives. Pick one of three topologies, write down your conflict and failover stories in plain words, and layer CDNs and edge compute over a regional architecture rather than as a substitute for one. Most multi-region projects fail because the team hoped state would just &quot;be&quot; everywhere. It won&apos;t. State has a home, and your design either acknowledges that home or fights it forever.
        </p>
      </section>

    </article>
  );
}
