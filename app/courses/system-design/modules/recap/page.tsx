import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "compass", title: "The compass" },
  { id: "tools", title: "Tool-fit" },
  { id: "traps", title: "Traps" },
  { id: "mocks", title: "Mock interviews" },
];

const compass = `flowchart TB
  subgraph FOUND[Foundations]
    F1[Latency, throughput, SLOs]
    F2[CAP, PACELC, consistency]
  end
  subgraph DATA[Data plane]
    D1[Replication]
    D2[Sharding]
    D3[Indexes and storage]
  end
  subgraph TRAFFIC[Traffic plane]
    T1[Caching]
    T2[Queues and streams]
    T3[Load balancing]
  end
  subgraph RELI[Reliability]
    R1[Idempotency]
    R2[Backpressure]
    R3[Circuit breakers]
  end
  subgraph EVOL[Evolution]
    E1[Migrations]
    E2[Security]
  end
  FOUND --> DATA
  FOUND --> TRAFFIC
  DATA --> RELI
  TRAFFIC --> RELI
  RELI --> EVOL`;

export default function Page() {
  const mod = getModuleBySlug("recap")!;

  return (
    <article className="prose-custom">
      <BookmarkButton courseId="system-design" moduleSlug="recap" />
      <ModuleProgress moduleSlug="recap" checkpoints={CHECKPOINTS} />
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <section className="my-8">
        <p className="lead">
          You&apos;ve walked through 35 modules. Replication, sharding, queues, caches, consistency models, idempotency,
          migrations, security. Now we tie it together. The goal of this recap isn&apos;t to re-explain — it&apos;s to
          give you a compass. When someone hands you a vague design problem, what do you reach for first, and why?
        </p>

        <div className="my-8 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/60 dark:bg-slate-900/40">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">What you&apos;ll walk out with</p>
          <ul className="space-y-2 text-sm">
            <li>A single mental map covering the six layers of every system you&apos;ll design.</li>
            <li>A &quot;first questions&quot; checklist for novel problems.</li>
            <li>Practice picking the right tool from a crowded toolkit.</li>
            <li>The traps that catch experienced designers — so you don&apos;t walk into them.</li>
          </ul>
        </div>
      </section>

      {/* ============================== PART 1 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 1 — The compass</h2>
        <p>
          Every system design problem can be decomposed into the same handful of layers. Once you internalize them,
          you stop staring at a blank page when someone says &quot;design Twitter.&quot;
        </p>

        <Mermaid chart={compass} />

        <h3 className="text-xl font-semibold mt-8 mb-3">The six layers</h3>
        <ol className="space-y-3">
          <li>
            <strong>Foundations.</strong>{" "}Latency budgets, throughput targets, SLOs, consistency requirements.
            Modules 1–6 lived here. If you skip foundations, every later choice is guesswork.
          </li>
          <li>
            <strong>Data plane.</strong>{" "}Where the bytes actually live. Replication for availability, sharding for
            scale, indexes for access patterns. Modules 7–14.
          </li>
          <li>
            <strong>Traffic plane.</strong>{" "}How requests reach the data. Load balancers, caches, queues, streams.
            Modules 15–22.
          </li>
          <li>
            <strong>Reliability.</strong>{" "}What keeps the system honest under stress. Idempotency, retries,
            backpressure, circuit breakers, observability. Modules 23–30.
          </li>
          <li>
            <strong>Evolution.</strong>{" "}How the system changes without breaking. Migrations, dual-writes,
            blue/green, feature flags. Module 36.
          </li>
          <li>
            <strong>Security.</strong>{" "}The cross-cutting concern that touches every layer. Module 37.
          </li>
        </ol>

        <Callout variant="insight" title="Always start with constraints, not solutions">
          Junior designers reach for tools (&quot;we&apos;ll use Kafka, Redis, Cassandra&quot;). Seniors reach for
          questions (&quot;what&apos;s the read/write ratio? what&apos;s the consistency requirement? what fails when
          this breaks?&quot;). The toolbox doesn&apos;t change. The order of operations does.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">First-pass questions for any new design</h3>
        <ol className="space-y-2">
          <li><strong>Read or write heavy?</strong>{" "}Drives caching strategy, DB choice, replication shape.</li>
          <li><strong>What&apos;s the consistency requirement?</strong>{" "}Strong, read-your-writes, eventual? Different stacks.</li>
          <li><strong>What&apos;s the access pattern?</strong>{" "}Single-key lookups (KV), range scans (LSM), graph traversal (Neo4j)?</li>
          <li><strong>What fails when this is unavailable?</strong>{" "}Drives retries, fallbacks, circuit breakers.</li>
          <li><strong>What&apos;s the failure mode you can&apos;t afford?</strong>{" "}Drives idempotency, exactly-once semantics, durability tier.</li>
          <li><strong>Where does this run in five years?</strong>{" "}Drives schema evolution, API versioning, migration patterns.</li>
        </ol>

        <Checkpoint moduleSlug="recap" id="compass" title="Compass checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question={`A PM asks you to "design a notification system." What's your first question?`}
            options={[
              { label: "Should we use Kafka or RabbitMQ?", correct: false, explanation: "Tool-first thinking. You don't know enough yet to pick." },
              { label: "What's the volume, latency budget, and acceptable delivery semantics?", correct: true, explanation: "Right. Volume drives infrastructure, latency drives architecture, semantics (at-least-once vs exactly-once) drives idempotency design." },
              { label: "Can we reuse the existing email service?", correct: false, explanation: "Implementation reuse without understanding the requirements is how systems get welded into the wrong shapes." },
            ]}
            hint="Foundations before tools."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Across the six layers, which one is most often skipped in interviews and on the job?"
            options={[
              { label: "Data plane", correct: false, explanation: "This usually gets attention — DB choice, schema, sharding." },
              { label: "Traffic plane", correct: false, explanation: "Caches and queues are popular topics." },
              { label: "Evolution", correct: true, explanation: "Right. Most designs ignore how the system will change. The first migration tells you whether the design has joints or just rigid bones." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 1 recap"
          gist="Six layers, six first questions. Constraints first, tools second."
          points={[
            { takeaway: "The compass: Foundations → Data → Traffic → Reliability → Evolution → Security.", detail: "Walk it in order. Skipping foundations breaks everything downstream." },
            { takeaway: "Start with read/write ratio and consistency.", detail: "Those two answers eliminate half the toolbox immediately." },
            { takeaway: "Evolution is where most designs collapse.", detail: "If you can't migrate it, you can't ship v2." },
          ]}
        />
      </section>

      {/* ============================== PART 2 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 2 — Picking the right tool</h2>
        <p>
          The toolbox is the same across the industry: Postgres, Redis, Kafka, Cassandra, S3, Elasticsearch, Spanner,
          DynamoDB. The skill isn&apos;t knowing them all — it&apos;s knowing when each earns its place.
        </p>

        <ClassifyChallenge
          title="Tool triage"
          prompt="Each scenario calls for a primary tool. Drop it in the right bucket."
          buckets={[
            { id: "rdbms", label: "Relational DB", color: "indigo" },
            { id: "kv", label: "KV / cache", color: "rose" },
            { id: "stream", label: "Log / stream", color: "amber" },
            { id: "search", label: "Search index", color: "emerald" },
            { id: "blob", label: "Object storage", color: "sky" },
          ]}
          items={[
            { id: "s1", label: "Order records with ACID requirements and complex joins across customers and inventory", answer: "rdbms", explanation: "Transactions + joins = relational. Postgres or MySQL all day." },
            { id: "s2", label: "Session data accessed on every request, must be sub-millisecond", answer: "kv", explanation: "Redis. The latency requirement rules out anything with a disk in the path." },
            { id: "s3", label: "Capturing every order state change for downstream analytics, rebuilds, and audit", answer: "stream", explanation: "Kafka. Append-only log with replay is exactly the shape." },
            { id: "s4", label: "Full-text search across millions of product descriptions with typo tolerance", answer: "search", explanation: "Elasticsearch / OpenSearch. Inverted indexes + analyzers are purpose-built for this." },
            { id: "s5", label: "User-uploaded videos, immutable, need cheap durable storage", answer: "blob", explanation: "S3. Cheap per-GB, high durability, integrates with CDN." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">When you reach for the wrong one</h3>
        <ul className="space-y-2 mt-4">
          <li>
            <strong>RDBMS as a queue.</strong> &quot;Just a status column we poll.&quot; Works at low volume,
            collapses under load. Use a real queue.
          </li>
          <li>
            <strong>Cache as system of record.</strong>{" "}Redis without persistence + AWS reboots = data loss. Caches are
            caches.
          </li>
          <li>
            <strong>Search index as primary store.</strong>{" "}Elasticsearch is fantastic at search, mediocre at
            durability and consistency. Always have an upstream source of truth.
          </li>
          <li>
            <strong>Object storage as live database.</strong>{" "}S3 is durable but eventually consistent and slow per-op.
            Don&apos;t put it in a hot path.
          </li>
          <li>
            <strong>Kafka as RPC.</strong>{" "}It&apos;s a log, not a request/response system. Don&apos;t pretend.
          </li>
        </ul>

        <Callout variant="warn" title="Polyglot persistence has a tax">
          Every additional datastore is more ops, more failure modes, more learning curve, more places things go out of
          sync. Add one when the existing tools genuinely can&apos;t do the job. Resist the urge to use shiny things
          because they&apos;re shiny.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">The consistency dial</h3>
        <p>
          You learned the lattice in module 5: linearizable, sequential, causal, read-your-writes, eventual. Most
          systems mix levels by design — strong for money, eventual for likes, causal for chat. Knowing where the dial
          sits per feature is the heart of system design.
        </p>

        <Checkpoint moduleSlug="recap" id="tools" title="Tool-fit checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question={`Your team wants to add an "events" table in Postgres that workers poll every second. Volume is 50k/sec. What do you push back on?`}
            options={[
              { label: "Postgres is fine — just add an index on processed=false", correct: false, explanation: "Polling at 50k/sec turns the table into a hot row contention nightmare. Indexes don't fix the lock storm." },
              { label: "Move to a real queue (Kafka, SQS) — DBs are not queues at this scale", correct: true, explanation: "Right. The polling pattern is a leading indicator that you've outgrown the DB-as-queue antipattern. Move to a log/queue." },
              { label: "Increase Postgres connection pool size", correct: false, explanation: "More connections fighting for the same hot rows. Doesn't help." },
            ]}
            hint="The shape of the workload, not the volume, is the tell."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Designing a banking ledger. Which mix of consistency levels makes sense?"
            options={[
              { label: "Eventual consistency everywhere — it's faster", correct: false, explanation: "Eventual on money = double spends and audit nightmares." },
              { label: "Strong consistency on balance updates, eventual on derived dashboards/reports", correct: true, explanation: "Right. Money requires linearizable updates; reporting can lag a few seconds. The dial sits in different places per feature." },
              { label: "Linearizable across the entire system, end to end", correct: false, explanation: "Possible but pays a huge latency tax for things that don't need it. Pick consistency per feature." },
            ]}
          />
        </Checkpoint>

        <PartRecap
          title="Part 2 recap"
          gist="The toolbox is finite; the discipline is matching tool to constraint, and resisting shiny."
          points={[
            { takeaway: "Each datastore has a sweet spot — and a wrong-spot.", detail: "RDBMS-as-queue, cache-as-truth, search-as-primary all end in tears." },
            { takeaway: "Polyglot persistence has an operational tax.", detail: "Add tools deliberately, not opportunistically." },
            { takeaway: "Consistency is a per-feature dial, not a global setting.", detail: "Strong where it matters, eventual where it pays for itself." },
          ]}
        />
      </section>

      {/* ============================== PART 3 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 3 — The traps that catch experienced designers</h2>
        <p>
          You can know all the patterns and still walk into the same five mistakes that catch every senior. Naming
          them out loud is half the fix.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Trap 1 — &quot;It scales linearly&quot;</h3>
        <p>
          Your design works at 1k qps. Multiplying everything by 10 does NOT mean it works at 10k qps. Hot keys
          dominate. Coordination overhead grows. Network becomes the bottleneck. The number that matters is &quot;what
          breaks first as we scale,&quot; and you almost never see it without testing.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Trap 2 — Trusting the happy path</h3>
        <p>
          Diagrams show successful flows. Reality is timeouts, partial failures, slow responses, network partitions,
          and zombie nodes. The design isn&apos;t real until you&apos;ve walked the failure modes for every arrow on
          the diagram.
        </p>

        <Callout variant="warn" title={'Walk every arrow with "what if this hangs?"'}>
          Not &quot;what if this fails fast&quot; — failure is easy to handle. The killer is partial: the request goes
          through, the response is lost. Did the operation happen or not? That&apos;s the question idempotency design
          answers, and it&apos;s the failure mode most designs gloss over.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Trap 3 — Premature optimization</h3>
        <p>
          Sharding before you have a scale problem. Adding a cache before you have a latency problem. Microservices
          before the monolith hurts. Each of these has a complexity tax and you&apos;re paying for value you
          haven&apos;t demonstrated yet.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Trap 4 — Ignoring operability</h3>
        <p>
          A design isn&apos;t complete without answers to: How do you deploy it? How do you observe it? How do you
          page on-call when it breaks? How do you roll it back? &quot;The code works on my laptop&quot; is not a system
          design.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Trap 5 — Forgetting the human boundaries</h3>
        <p>
          Conway&apos;s law: your system shape will mirror your team shape. If two teams own one service, you&apos;ll
          have constant merge conflicts and unclear oncall. If one team owns ten services, you&apos;ll burn out. The
          ownership boundaries on the org chart matter as much as the service boundaries on the diagram.
        </p>

        <Checkpoint moduleSlug="recap" id="traps" title="Trap awareness checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="Your design works at 1k qps in load tests. You're asked if it'll handle 10k qps. Best answer?"
            options={[
              { label: "Yes — we'll just add 10x more replicas", correct: false, explanation: "Linear scaling is rare. Hot keys, coordination, and network effects break the assumption." },
              { label: "I don't know yet — let's test at 5k and 10k to find what breaks first", correct: true, explanation: "Right. The honest answer is empirical. You almost always discover a non-obvious bottleneck somewhere." },
              { label: "Yes — the architecture is horizontally scalable", correct: false, explanation: "Architecture being scalable on paper doesn't mean it scales linearly in practice." },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question="Two teams own one shared payment service. What's the most likely operational symptom?"
            options={[
              { label: "Faster development from shared expertise", correct: false, explanation: "Sometimes. More often: friction." },
              { label: "Unclear ownership during incidents and merge conflicts in the codebase", correct: true, explanation: "Right. Conway's law in action — diffuse ownership creates exactly these problems. Either give it to one team or split the service." },
              { label: "Better test coverage from two perspectives", correct: false, explanation: "In theory; in practice ownership ambiguity hurts more than it helps." },
            ]}
            hint="Conway's law cuts both ways."
          />
        </Checkpoint>

        <PartRecap
          title="Part 3 recap"
          gist="Five traps that catch seniors: linear scaling, happy-path thinking, premature optimization, ignored operability, ignored people."
          points={[
            { takeaway: "Always walk failure modes for every arrow.", detail: "Timeouts and partial failures, not just hard errors." },
            { takeaway: "Operability is part of the design, not aftercare.", detail: "Deploy, observe, page, roll back — all four answers required." },
            { takeaway: "Conway's law is real.", detail: "Service boundaries follow team boundaries whether you like it or not." },
          ]}
        />
      </section>

      {/* ============================== PART 4 ============================== */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Part 4 — Mock interview transcripts</h2>
        <p>
          You have the patterns. You have the compass. The last gap is what a real senior interview <em>sounds</em>{" "}
          like — the cadence, the clarifying questions, the moment a candidate pauses and says &quot;let me think about
          that for a second.&quot; Below are two annotated transcripts (one backend-heavy, one frontend-heavy), each
          followed by a short contrast showing the same problem answered <em>without</em>{" "}the senior signals.
        </p>

        <Callout variant="info" title="How to read these">
          <p className="m-0">
            Don&apos;t skim. Read the candidate lines out loud. Notice when they push back, when they pause, when they
            do math, when they invite the interviewer in. Those are the patterns you&apos;re trying to absorb — not the
            specific design.
          </p>
        </Callout>

        {/* ============== Transcript 1: URL shortener ============== */}
        <h3 className="text-xl font-semibold mt-10 mb-3">Transcript 1 — &quot;Design a URL shortener&quot; (backend)</h3>
        <p className="text-sm text-slate-500 italic mb-4">
          Senior backend interview, 50 minutes. Candidate is a mid-level Java/Spring engineer interviewing for a senior
          role. The interviewer is a staff engineer.
        </p>

        <div className="space-y-4 my-6 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/40 dark:bg-slate-900/30">
          <p>
            <strong>Interviewer:</strong> {`I'd like you to design a URL shortener — something like bit.ly. Take it wherever you want.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Cool, classic problem. Before I jump in, can I ask a few clarifying questions? I don't want to assume the wrong scope.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Go for it.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Okay — first, who's using this? Is this a public consumer product where anyone can shorten URLs, or is it internal where we control the call sites? That changes the abuse surface a lot.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Public consumer product. Assume bit.ly scale.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Got it. Then a few features I want to confirm or rule out: do users get custom slugs, like /my-link? Do we need analytics — click counts, geo, referrer? Do links expire? And is there an authenticated dashboard, or is it fire-and-forget?`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Custom slugs yes. Analytics: just total click count per link, no geo. No expiry for now. Dashboard exists but you can hand-wave it — focus on the shorten and redirect paths.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Perfect. Last one: what's the read-to-write ratio I should design for? URL shorteners are usually heavily read-skewed — every shorten generates many redirects.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Yeah, assume 100 to 1 read-to-write.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Strong opening. Candidate didn't pattern-match to "I'll build a hash table" — they pinned down scope first. The read:write question especially matters because 100:1 changes the architecture: caching becomes the hot path, write throughput matters less.`}
            </p>
          </Callout>

          <p>
            <strong>Candidate:</strong> {`Okay, let me do some back-of-the-envelope math before I start drawing. Bit.ly does roughly 100 million new URLs a day at peak — let's use that. Each URL record, with metadata, is maybe 500 bytes to 1 KB. Call it 1 KB to be safe. So that's 100 GB of new data per day, roughly. Over a 5-year horizon that's 100 GB times 365 times 5, which is about 180 TB total.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`On reads: 100:1 means 10 billion redirects per day. That's roughly 115k redirects per second on average, and peak could easily be 3 to 5x that — so call it 500k QPS at peak. That's the number that drives the read path.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Sounds right. Continue.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Now key encoding. The slug needs to be short, URL-safe, and have enough address space to never collide for the foreseeable future. Base62 — letters and digits, 62 characters — at 7 characters gives us 62 to the 7, which is about 3.5 trillion slugs. Even at 100M new URLs a day, that's almost 100 years of headroom. So 7-char base62 it is.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`How do you generate the slug? Hash the URL?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`I considered that, but I'd actually push back. If you hash the URL — say, take the first 7 chars of SHA-256 — two problems. One, two users shortening the same long URL at different times get different short URLs in some implementations and the same in others, which is a product decision you have to make explicit. Two, you still have to handle hash collisions in 7 chars of a 256-bit hash, which means a DB lookup on every shorten anyway. So I'd prefer a counter-based approach: a distributed monotonic 64-bit ID, base62-encoded, truncated to 7 chars when it fits. Snowflake-style ID generation, or a small set of pre-allocated ID ranges per shard.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Counter-based gives me predictable space utilization, no collisions by construction, and the encoded string fits in 7 chars until we hit ~3.5T URLs.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Candidate had a clear opinion and articulated the tradeoff against an alternative the interviewer floated. Notably they didn't just say "I'd use Snowflake" — they explained why it's the right call here. That's the senior signal.`}
            </p>
          </Callout>

          <p>
            <strong>Candidate:</strong> {`On storage. The metadata is structured — slug, long URL, owner ID, created_at, click_count. There are no fancy join requirements. So Postgres is the obvious primary store. Single table, slug as the primary key, an index on owner_id for the dashboard query.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`At 180 TB over five years on a single Postgres? That doesn't fit. So I'd shard by slug — hash the slug to a shard ID, route writes there, route reads there. With, say, 64 shards each shard holds about 3 TB, which is well within Postgres comfort zone. Adding shards later is the painful part — I'd want to use consistent hashing or pre-allocate enough virtual shards up front to avoid a re-shard for many years.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`But Postgres is not the read path. At 500k QPS of redirects we don't want every redirect hitting the database. So Redis cache in front, slug-to-long-URL mapping. Cache hit rate on a Zipfian read distribution will be very high — probably 95%+ if we have, say, 100 GB of Redis covering the hot tail.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What's the cache lookup path?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`On redirect: the request comes in for /abc1234. Service queries Redis with key "url:abc1234". Hit means we have the long URL, return a 301 redirect, fire an async event for click counting. Miss means we go to the right Postgres shard, read the row, populate Redis with a TTL — say, 24 hours — and return the redirect. The async event for click counting goes to Kafka so we don't slow down the redirect path on the analytics write.`}
          </p>

          <CodeBlock lang="plain" caption="Read path summary">{`GET /abc1234
  ├─ Redis GET url:abc1234
  │   ├─ HIT  → 301 redirect (~1ms p99)
  │   └─ MISS → Postgres SELECT (sharded by slug)
  │            → Redis SETEX url:abc1234 24h
  │            → 301 redirect (~10ms p99)
  └─ async: Kafka click event (count, slug, ts)`}</CodeBlock>

          <p>
            <strong>Interviewer:</strong> {`Custom slugs — how do you handle the collision case where two users try to claim /promo at the same moment?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Good question. The naive answer is "do a SELECT, if not found, INSERT" — but that's a classic race. I'd reach for two layers. First, optimistic claim in Redis: SETNX with a short TTL, like 30 seconds, on key "claim:promo". Whoever wins the SETNX races into Postgres with an INSERT against a UNIQUE constraint on the slug column. The unique constraint is the actual source of truth — Redis just narrows the contention window. If the INSERT fails on the unique constraint, we return a clean "slug already taken" error to the user.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`The Redis layer mostly exists so two requests with the same slug don't both do work in Postgres before one of them loses. It's an optimization, not a correctness layer. The unique constraint is what actually keeps things honest.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Candidate explicitly distinguished "performance layer" from "correctness layer." That's a senior pattern — knowing which piece you can lose without losing data integrity.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`What happens if a user edits the long URL behind an existing slug — say someone re-points /promo to a new landing page?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Hmm. Let me think about that for a second.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Okay. The trap here is that Redis has stale data with a 24-hour TTL. So immediately after the edit, redirects could send users to the old URL for up to a day. Not acceptable for a paid feature.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Two options. One: explicit invalidation. On every edit, the write path issues a Redis DEL on the key after the Postgres UPDATE commits. Simple, but if Redis DEL fails — network blip, Redis restarts — you're stuck with the stale entry. So I'd want either a retry with a small bounded buffer, or accept that the TTL is the safety net and document the worst case.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Two: write-through invalidation via a change-data-capture stream. Postgres logical decoding fires events on UPDATE, a small consumer translates them to Redis DELs. Stronger guarantee, way more moving parts. For a URL shortener I'd start with option one and instrument the failure rate. If we see meaningful staleness in metrics, upgrade to option two.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`The tradeoff is operational complexity versus staleness window. For a free tier, 24-hour TTL might be fine. For a paid SLA, option two earns its keep.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Pause-and-think moment was honest, not awkward. Candidate gave two real options with explicit tradeoff axes (operational complexity vs. staleness) and a tiered recommendation (start simple, upgrade if metrics demand it). That's the answer I'd want from a senior.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`Let's talk reliability. What's your SLO and what fails first under load?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Redirect path: 99.9% availability, p99 under 50ms. Shorten path: 99.5% availability, p99 under 200ms. The shorten path is allowed to be a little floppier because it's the cold path and users will retry.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`What fails first? In my experience with similar systems, three things. One: Redis hot key — if some viral URL spikes to a million QPS on one slug, that's all on a single Redis node. Mitigation: client-side caching with a few seconds of TTL, or Redis read replicas with a hash-and-fanout. Two: Postgres write replica lag — if the leader fails over, the new leader might be missing the last few seconds of writes. For URL shortening that's tolerable; for analytics counts it's not, which is why we put click events on Kafka instead. Three: Kafka consumer lag on click counting — the count just gets eventually-consistent and lags a few minutes during incidents, which the product team should know up front.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`On Redis — fail-open or fail-closed if the cache is down?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Fail-open, but with a circuit breaker. If Redis is down, redirects go straight to Postgres. We absorb the latency hit, but redirects keep working. A circuit breaker matters here because if all 500k QPS rain on the DB shards simultaneously, Postgres falls over and now nothing works. So the breaker thins the load — say, 10% of traffic gets through to Postgres, the rest gets a polite 503 and the client retries. Better degraded than dead.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Fail-closed — refusing to serve any redirects when cache is down — would be wrong. The DB is the source of truth; we can serve from it, just slower. Fail-open with backpressure is the right answer.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`"Better degraded than dead." Candidate not only picked the right policy but explained why the obvious failure (cache down → 503 everything) is worse than a thinned but live service. That's prod-readiness thinking.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`Last thing — anything you'd flag as a concern you'd want to revisit before shipping?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Yeah, two. One: abuse. Public URL shorteners get used for phishing — anyone shortening URLs needs to go through some malware/phishing check, either inline (synchronous URLscan-style API call) or async (mark suspicious links for review). I'd want to talk to the security team before shipping. Two: GDPR. Click events have IP addresses and we'd be storing them by default. We need a retention policy and probably geo-aware data residency. Both of these are not the architecture problem you asked me to solve, but they'd be on my pre-launch list.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Good. We're at time. Thanks.`}
          </p>
        </div>

        <Callout variant="spring" title="What made this senior-bar">
          <ul className="m-0 space-y-1">
            <li>
              <strong>Self-driven scope.</strong>{" "}The candidate asked five clarifying questions before drawing
              anything. The interviewer didn&apos;t have to pry the requirements out of them.
            </li>
            <li>
              <strong>Real numbers, not hand-waves.</strong> 100M URLs/day, 1KB each, 180TB over 5 years, 500k peak
              QPS. Math drove the architecture, not vibes.
            </li>
            <li>
              <strong>Pushed back with reasoning.</strong>{" "}When the interviewer suggested hashing for slug generation,
              the candidate articulated <em>why</em>{" "}counter-based was better — not dogmatically, but with the
              tradeoff named.
            </li>
            <li>
              <strong>Tradeoff conversations under pressure.</strong>{" "}Cache invalidation question: candidate paused,
              gave two real options, named the axis (operational complexity vs. staleness), and recommended a phased
              approach.
            </li>
            <li>
              <strong>Production-readiness mindset.</strong>{" "}Named SLOs, named what fails first, named
              fail-open-with-circuit-breaker, flagged abuse and GDPR before being asked. The system in their head
              already had a runbook.
            </li>
          </ul>
        </Callout>

        <h4 className="text-lg font-semibold mt-8 mb-3">Contrast — the mediocre version</h4>
        <p className="text-sm text-slate-500 italic mb-4">Same problem, weaker candidate. Notice what&apos;s missing.</p>

        <div className="space-y-3 my-6 rounded-xl border border-amber-200 dark:border-amber-900/50 p-6 bg-amber-50/40 dark:bg-amber-950/20">
          <p>
            <strong>Interviewer:</strong> {`Design a URL shortener.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Sure. So we need a service that takes a long URL and returns a short one. I'd use a hash function — MD5 of the URL, take the first 8 characters as the slug. Store it in a database, probably MongoDB because it scales well.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`How do you handle scale?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`MongoDB shards horizontally, so we just add nodes. We can also put a CDN in front to cache redirects.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`How big does the database get?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`It depends on usage. We can size the cluster based on growth.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What about hash collisions?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`MD5 is unique enough — collisions are very rare with 8 hex characters.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Walk me through what happens on a redirect.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`The service looks up the slug in MongoDB and returns the long URL with a 301.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What if MongoDB is down?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We'd have replicas, so failover handles it.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Custom slugs?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We check if the slug exists, if not we insert it.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What if two users try to claim the same slug at the same moment?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`That's a race condition. We'd need a transaction or a lock.`}
          </p>
        </div>

        <Callout variant="warn" title="What's missing — the senior gap">
          <ul className="m-0 space-y-1">
            <li>No clarifying questions. Jumped to a tool (MongoDB) and a technique (MD5) before pinning scope.</li>
            <li>No math. &quot;Sized based on growth&quot; is a non-answer. No QPS, no GB, no horizon.</li>
            <li>One design, no alternatives. Picked MD5 hashing without considering counter-based or addressing why.</li>
            <li>Hand-waved failures. &quot;Replicas handle it&quot; / &quot;a transaction or a lock&quot; — generic, no specifics.</li>
            <li>Reactive, not proactive. Every detail had to be pulled out by the interviewer. Candidate never volunteered SLOs, abuse, or operational concerns.</li>
          </ul>
        </Callout>

        {/* ============== Transcript 2: Twitter feed UI ============== */}
        <h3 className="text-xl font-semibold mt-12 mb-3">Transcript 2 — &quot;Design a Twitter feed UI&quot; (frontend)</h3>
        <p className="text-sm text-slate-500 italic mb-4">
          Senior frontend interview, 50 minutes. The candidate is a Java/Spring engineer with React experience
          interviewing for a full-stack senior role.
        </p>

        <div className="space-y-4 my-6 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50/40 dark:bg-slate-900/30">
          <p>
            <strong>Interviewer:</strong> {`I'd like you to design the Twitter home feed UI. Focus on the client side — assume the backend gives you whatever endpoints you ask for.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Got it. Same as last time, I want to lock down scope before I draw anything. Quick questions: are we mobile-first, web-first, or both? Infinite scroll or paginated? Do likes and retweets need to feel instant — i.e., optimistic — or is round-trip latency acceptable? Is there an offline read story? And what's the freshness expectation — does the feed auto-update with new tweets while the user is reading, or is that a manual pull-to-refresh?`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Web-first, but should be responsive. Infinite scroll. Likes need to feel instant. Offline read is a nice-to-have for the last fetched batch. And there's a "new tweets available" pill at the top, not auto-injection.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Perfect. One more — any constraints on the framework? React, Vue, vanilla?`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`React. Pick whatever data fetching layer you want.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Same opening pattern as a backend interview — clarify scope first. Frontend candidates often skip this and go straight to "I'd use React + Redux." Strong start.`}
            </p>
          </Callout>

          <p>
            <strong>Candidate:</strong> {`Okay, let me sketch the component tree first, then walk through state, then data fetching, then performance, then resilience.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Top down: there's a FeedPage at the route level. Inside that, a FeedHeader with the "new tweets available" pill, and a FeedContainer. FeedContainer wraps a VirtualList — virtualization is non-negotiable here, I'll explain why in a moment. Each row in the VirtualList is a FeedItem. FeedItem has TweetHeader (avatar, name, handle, timestamp), TweetBody (text, hashtags, mentions), MediaRenderer (images, video, polls), and TweetActions (like, retweet, reply, share).`}
          </p>

          <CodeBlock lang="plain" caption="Component tree">{`FeedPage
├── FeedHeader
│   └── NewTweetsPill (sticky, shows count)
└── FeedContainer
    └── VirtualList (windowed, ~30 visible)
        └── FeedItem
            ├── TweetHeader (avatar, name, ts)
            ├── TweetBody (text, links, hashtags)
            ├── MediaRenderer (img/video, lazy)
            └── TweetActions (like, retweet, reply)`}</CodeBlock>

          <p>
            <strong>Candidate:</strong> {`Now state. There are three buckets I think about separately. One: server cache — the actual tweet data, owned by React Query (or SWR). Two: client UI state — which tweet has its menu open, scroll position, "new tweets" count, expanded reply threads. Three: optimistic mutation state — pending likes/retweets that haven't been confirmed by the server yet.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Let me sketch the shape.`}
          </p>

          <CodeBlock lang="plain" caption="State shape sketch">{`// React Query cache (server state)
{
  queryKey: ["feed", { cursor: "abc123" }],
  data: {
    tweets: [
      { id: "t1", authorId: "u1", text: "...", likeCount: 42,
        likedByMe: false, retweetCount: 7, mediaUrls: [...] },
      ...
    ],
    nextCursor: "def456"
  }
}

// Local UI state (useState / Zustand)
{
  newTweetsCount: 3,
  openMenuTweetId: null,
  expandedThreads: Set<"t9", "t14">,
  scrollAnchorId: "t7"
}

// Optimistic mutations (React Query mutation cache)
{
  pendingLikes: Map<tweetId, { mutationId, prevState }>
  // rollback target on failure
}`}</CodeBlock>

          <p>
            <strong>Interviewer:</strong> {`Why split server state from UI state explicitly?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Two reasons. One, server state has its own lifecycle — it can be stale, refetched, invalidated, prefetched. UI state doesn't. Trying to model server state as a regular Redux slice means you reinvent caching, deduplication, and request invalidation by hand, badly. React Query exists exactly because those problems are universal. Two, separating them means you can rip out one without touching the other. If we move from REST to GraphQL, only the data fetching layer changes — the UI state is untouched.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Strong opinion, well-defended. Candidate didn't just pick React Query — they explained why dropping server state into Redux is a mistake. That's the senior signal.`}
            </p>
          </Callout>

          <p>
            <strong>Candidate:</strong> {`On data fetching: cursor pagination, not offset. Cursors are stable as new tweets are inserted at the head — offsets shift and you get duplicates or skipped items. The endpoint is GET /feed?cursor=xxx&limit=30. React Query owns the cache. As the user scrolls toward the bottom of the loaded data, I prefetch the next page — say, when they're 5 items from the end of what's rendered. That keeps scroll buttery.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Stale time on the cache: probably 60 seconds. Cache time: 5 minutes. So a quick navigation away and back doesn't refetch, but coming back after a long break does.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Why virtualization specifically? The user only sees a screenful.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Right, but the DOM doesn't know that. Without virtualization, every loaded tweet is a real DOM node. After scrolling for a few minutes the user has 5,000 to 10,000 tweet nodes in the DOM. Each tweet has nested elements — header, body, media, actions, maybe 30 to 50 nodes per tweet. So you're looking at 200,000 to 500,000 DOM nodes. Layout passes get expensive, scroll events get janky, memory creeps up, devtools start crashing.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Virtualization renders only the ~30 tweets visible in the viewport, plus a small overscan buffer above and below. Total DOM stays around 30 to 50 tweets regardless of how far the user has scrolled. Scroll stays at 60fps. I'd use react-window or react-virtuoso — virtuoso handles variable-height items better, which matters here because a tweet with media is way taller than a text-only one.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Specific numbers (200k–500k DOM nodes, 30–50 visible, react-virtuoso for variable heights) and the actual reason — layout cost, not just "performance." That's how you talk about perf in a senior interview.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`Walk me through optimistic likes.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Sure. User taps the like button. Three things happen in a specific order. One: I generate a client-side mutation ID — a UUID, attached to the request. Two: I optimistically update the React Query cache — likedByMe becomes true, likeCount increments by 1, and I store the previous state in the mutation context. The UI re-renders instantly, sub-frame. Three: I fire the POST /tweets/:id/like with the mutation ID in the header.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`On success: nothing visible to the user — the optimistic state is already correct, and on the next refetch the server state confirms it. On failure: I roll back the cache to the stored previous state, decrement the counter, and show a small toast like "couldn't save your like." The mutation ID is critical for idempotency — if the user double-taps, both requests carry the same ID and the server treats them as the same operation. No duplicate likes, no count drift.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What about media? Lots of images and video — that's a big chunk of the perf story.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Yeah. Media is where feeds usually go wrong. Three things. One: blur-up placeholders. The API returns a tiny base64 LQIP — like a 20x20 px blurred preview, maybe 200 bytes. We render that immediately while the full image loads. Cumulative layout shift goes to zero because we know the aspect ratio up front. Two: lazy loading via IntersectionObserver. Images outside the viewport don't fetch — only when they enter viewport plus a small margin. Three: responsive srcset so we don't ship a 2000px image to a 400px viewport.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Video is similar but with one extra: autoplay only when the video is mostly in viewport, and pause when it leaves. That's a battery and bandwidth concern especially on mobile.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Candidate proactively addressed CLS (cumulative layout shift) and battery — neither was prompted. That's the kind of unprompted production-readiness thinking that separates senior candidates.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`What happens when the network is flaky? User on a subway, dropping in and out.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Let me think about that for a moment.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Okay, two things to handle: reads and writes. On reads: React Query already has stale data from the last successful fetch. We render that. The stale flag is set, so I show a small "offline" indicator at the top — not a blocking modal, just a chip saying "showing cached feed." When the network reconnects, we retry in the background and seamlessly update.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`On writes — likes, retweets — they go into a queue. The optimistic state stays in place; the request retries with exponential backoff up to, say, 30 seconds total. If still failing, we mark it as a "deferred" mutation, persisted to localStorage so it survives a page refresh. When the network comes back, we replay the queue. The mutation IDs make this safe — replays are idempotent on the server.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Compose-tweet flow is similar but stricter — we keep the draft in localStorage at every keystroke (debounced) so a network failure doesn't lose the user's text. That's a UX-not-architecture decision but it's table stakes for a production feed.`}
          </p>

          <Callout variant="insight" title="What the interviewer noted">
            <p className="m-0">
              {`Pause-and-think was honest. Then the candidate gave structured handling for both reads and writes, named the queue + persistence pattern, and tied it back to the mutation IDs they'd already designed. End-to-end coherence.`}
            </p>
          </Callout>

          <p>
            <strong>Interviewer:</strong> {`Last topic — accessibility. What do you do?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Several things. One: semantic markup. The feed is a list — <ul role="feed"> with each tweet as <article role="article">. Screen readers announce "feed" and walk it like a list. Two: a live region — aria-live="polite" — for the "X new tweets" pill. When new tweets arrive, the count is announced without interrupting the user. Three: focus management. When a user opens a tweet detail modal, focus moves into the modal and is trapped there. On close, focus returns to the tweet that opened it. Four: keyboard navigation — arrow keys move between tweets, J/K shortcuts like Twitter actually has, Enter opens detail, L likes. All visible focus rings.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Five: media. Every image needs alt text — the API has to return it, and the UI needs to enforce it on compose. Videos need captions. Without those, the feed is unusable for screen reader users, and that's not a "nice to have" — that's the whole product not working for a chunk of users.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Anything you'd flag as a concern?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Yeah, two. One: bundle size. A feed with virtualization, React Query, optimistic mutations, IntersectionObserver, image LQIP — that's a lot of code. I'd want to budget the JS bundle aggressively, code-split the compose flow and detail modal, and measure first-contentful-paint and time-to-interactive on a 3G profile. Two: feed ranking is server-side, but the client needs to be ready for new tweets to be inserted out-of-cursor-order if the server re-ranks. That's a state-merge problem worth talking through with the backend team — does the cursor identify a strict timestamp boundary, or is it opaque and might shuffle?`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Good. We're at time. Thanks.`}
          </p>
        </div>

        <Callout variant="spring" title="What made this senior-bar">
          <ul className="m-0 space-y-1">
            <li>
              <strong>Same scope-first opening as the backend interview.</strong>{" "}Five clarifying questions before
              a line of code or a single component name.
            </li>
            <li>
              <strong>State shape sketched explicitly.</strong>{" "}Three buckets named (server cache, UI state,
              optimistic mutations) with reasoning for the split — not a vague &quot;use Redux.&quot;
            </li>
            <li>
              <strong>Real perf numbers.</strong> 200k–500k DOM nodes without virtualization, 30 visible with it,
              react-virtuoso for variable heights. Specifics, not adjectives.
            </li>
            <li>
              <strong>End-to-end coherence on offline/flaky.</strong>{" "}Reads and writes both addressed, mutation IDs
              tied back to the like flow, draft persistence flagged. No piece left dangling.
            </li>
            <li>
              <strong>Accessibility as a real product requirement.</strong>{" "}Live regions, focus traps, keyboard
              shortcuts, alt text on compose. Not bolted on at the end — woven through.
            </li>
          </ul>
        </Callout>

        <h4 className="text-lg font-semibold mt-8 mb-3">Contrast — the mediocre version</h4>
        <p className="text-sm text-slate-500 italic mb-4">Same problem, weaker candidate.</p>

        <div className="space-y-3 my-6 rounded-xl border border-amber-200 dark:border-amber-900/50 p-6 bg-amber-50/40 dark:bg-amber-950/20">
          <p>
            <strong>Interviewer:</strong> {`Design the Twitter feed UI.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`Sure. I'd use React with Redux. There'd be a feed reducer that holds the list of tweets, and a thunk that fetches from /feed. Each tweet is a component.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`How do likes work?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`The like button dispatches an action that fires the API call, then updates the store on success.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`What about responsiveness — the user wants the like to feel instant.`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We can show a spinner while it's loading.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Performance with a long feed?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We can paginate, fetch more as the user scrolls.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Tens of thousands of tweets in the DOM?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`React is pretty fast. We can also memoize components.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Offline behavior?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We'd show an error message.`}
          </p>
          <p>
            <strong>Interviewer:</strong> {`Accessibility?`}
          </p>
          <p>
            <strong>Candidate:</strong> {`We'd add ARIA labels.`}
          </p>
        </div>

        <Callout variant="warn" title="What's missing — the senior gap">
          <ul className="m-0 space-y-1">
            <li>No clarifying questions. Jumped straight to React + Redux.</li>
            <li>No state shape. &quot;A feed reducer&quot; tells you nothing about what&apos;s in it.</li>
            <li>Spinner instead of optimistic update. Doesn&apos;t understand the perceptual-latency argument.</li>
            <li>&quot;Memoize components&quot; instead of virtualization. Doesn&apos;t grasp the DOM-size problem.</li>
            <li>Accessibility = &quot;ARIA labels&quot;. Treated as a checkbox, not a real product concern.</li>
          </ul>
        </Callout>

        {/* ============== Wrap-up ============== */}
        <h3 className="text-xl font-semibold mt-12 mb-3">The five senior signals you saw in both transcripts</h3>
        <ol className="space-y-2">
          <li>
            <strong>Scope clarification before solution.</strong>{" "}Five questions in the first 90 seconds. Both
            candidates pinned down read:write ratio (or its UI equivalent), feature flags, and constraints before
            drawing anything.
          </li>
          <li>
            <strong>Real numbers, not adjectives.</strong> 100M URLs/day, 180TB over 5 years, 500k peak QPS;
            200k–500k DOM nodes, 30 visible, react-virtuoso for variable heights. Math drives architecture.
          </li>
          <li>
            <strong>State of the world before solution.</strong>{" "}Component tree first, then state shape, then data
            fetching, then perf, then resilience. Storage shape and SLOs first, then redirect path, then write path.
            Order matters.
          </li>
          <li>
            <strong>Tradeoff conversations under pressure.</strong>{" "}When pushed (cache invalidation; flaky network),
            the candidate paused, named two real options with explicit axes, and recommended a phased approach. They
            didn&apos;t defend one design — they articulated the space.
          </li>
          <li>
            <strong>Production-readiness thinking unprompted.</strong>{" "}SLOs, fail-open with circuit breaker, abuse,
            GDPR, CLS, battery, accessibility. The system in their head already had a runbook attached.
          </li>
        </ol>

        <h3 className="text-xl font-semibold mt-10 mb-3">The five things mediocre candidates do</h3>
        <ol className="space-y-2">
          <li>
            <strong>Jump straight to a tool.</strong> &quot;I&apos;ll use MongoDB / React + Redux.&quot; Tool-first is
            the surest tell of a candidate who hasn&apos;t internalized that constraints come before solutions.
          </li>
          <li>
            <strong>Defend one design, never offer alternatives.</strong>{" "}Even when a question invites a tradeoff
            (&quot;what about X?&quot;), the answer is a stronger version of the same design — not a real comparison.
          </li>
          <li>
            <strong>Skip the math.</strong> &quot;Sized based on growth.&quot; &quot;React is pretty fast.&quot; No QPS,
            no GB, no DOM-node count. Without numbers, design choices are unfalsifiable.
          </li>
          <li>
            <strong>Ignore failure modes.</strong> &quot;Replicas handle it.&quot; &quot;We&apos;d show an error
            message.&quot; Failure isn&apos;t designed for; it&apos;s deflected.
          </li>
          <li>
            <strong>Treat accessibility / abuse / GDPR as checkboxes.</strong> &quot;ARIA labels&quot; instead of focus
            management, live regions, alt text enforcement on compose. The senior candidate sees these as part of the
            product working, not a postscript.
          </li>
        </ol>

        <Checkpoint moduleSlug="recap" id="mocks" title="Senior-signal self-assessment" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question={`Three candidates respond to "Design a rate limiter." Which response shows the clearest senior signal?`}
            options={[
              {
                label: `"I'd use a token bucket algorithm with Redis as the backing store. Each request decrements the bucket; refill happens on a timer."`,
                explanation: `Plausible answer, but jumps to a solution. No scope, no math, no failure modes, no alternatives weighed. Could be a strong candidate or a memorized one — the response doesn't tell you which.`,
              },
              {
                label: `"Before I pick an algorithm — what's the granularity? Per-user, per-IP, per-API-key? What's the action on limit hit: 429 immediately, queue, or shed? And how strict — are bursts okay, or is it a hard ceiling? Those answers point to different algorithms (token bucket vs leaky bucket vs sliding window) and different storage."`,
                correct: true,
                explanation: `Right. Scope-first, names the axes that determine the choice, signals awareness of multiple algorithms without picking one yet. This is the senior-bar opening.`,
              },
              {
                label: `"Rate limiting is a hard problem. We'd want to make sure it's distributed and fault-tolerant. I'd put it behind the load balancer."`,
                explanation: `Vague generalities. "Distributed and fault-tolerant" is true of everything; "behind the load balancer" doesn't specify what's actually doing the limiting. No real engagement with the problem.`,
              },
            ]}
            hint="Listen for the verb. Senior candidates ask before they answer."
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question={`Mid-interview, the interviewer asks: "What if your cache layer goes down?" Which response shows the senior signal?`}
            options={[
              {
                label: `"We'd have Redis Sentinel or Cluster for HA, so it shouldn't go down."`,
                explanation: `Deflects the question. The interviewer isn't asking whether you have HA — they're asking how the system behaves when (not if) the cache is unavailable. Avoiding the question is a tell.`,
              },
              {
                label: `"Two options: fail-open, where requests fall back to the database with a circuit breaker thinning load, or fail-closed, where we refuse requests until the cache recovers. For this service I'd pick fail-open with the breaker because the DB can serve correct (slower) responses, and 'better degraded than dead' is the right call. The breaker exists so 500k QPS doesn't crater the DB."`,
                correct: true,
                explanation: `Right. Names two real options, picks one with explicit reasoning, identifies the axis (degraded vs dead), and addresses the cascading-failure concern unprompted. Textbook senior-bar tradeoff conversation.`,
              },
              {
                label: `"We'd add monitoring and alerts so the on-call team can respond quickly."`,
                explanation: `Conflates "respond to incident" with "system behavior during incident." The architecture question is unanswered. This is what mediocre candidates do — pivot to something adjacent rather than engage the actual question.`,
              },
            ]}
          />

          <Quiz
            kind="Quick check"
            xp={15}
            question={`A candidate is asked about scale and answers: "It scales horizontally — we just add more replicas." What's the senior critique?`}
            options={[
              {
                label: `"That's a fine answer; horizontal scaling is the modern default."`,
                explanation: `Misses the issue. "Horizontally scalable" on paper is rarely linear in practice — hot keys, coordination overhead, and cross-shard queries all break the assumption. The answer is unfalsifiable without specifics.`,
              },
              {
                label: `"It's a non-answer. Linear scaling is rare; the real question is what bottleneck appears first as load increases. Senior answer: 'I don't know yet — I'd load-test at 5x and 10x to find what breaks first, and I'd expect it to be a hot key, a coordination round-trip, or a shared lock.'"`,
                correct: true,
                explanation: `Right. Empirical humility plus naming the likely failure modes (hot keys, coordination, locks) is the senior frame. Confident assertions about linear scaling are a junior tell.`,
              },
              {
                label: `"They should have named which framework provides the horizontal scaling."`,
                explanation: `Tool-first thinking again. The framework isn't the issue — the assumption that scale is free under replication is the issue.`,
              },
            ]}
            hint="The flaw isn't 'wrong answer' — it's 'unfalsifiable answer.'"
          />
        </Checkpoint>

        <PartRecap
          title="Part 4 recap"
          gist="Senior interviews aren't pattern-matching contests — they're conversations where scope, numbers, tradeoffs, and prod-readiness are all on display. The five signals are universal across backend and frontend."
          points={[
            { takeaway: "Scope before solution, every time.", detail: "The first 90 seconds is for clarifying questions, not architecture." },
            { takeaway: "Real numbers carry the design.", detail: "QPS, GB, DOM-node counts — without them, choices are unfalsifiable." },
            { takeaway: "Tradeoff conversations are the test.", detail: "When pressed, name two options, name the axis, recommend with reasoning." },
            { takeaway: "Production-readiness is unprompted.", detail: "SLOs, failure modes, abuse, accessibility — volunteer them, don't wait to be asked." },
            { takeaway: "Pause-and-think is a senior signal, not a weakness.", detail: "'Let me think about that for a second' beats a confident wrong answer every time." },
          ]}
        />
      </section>

      {/* ============================== Closing ============================== */}
      <section className="my-12 rounded-xl border border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-8">
        <h2 className="text-2xl font-bold mb-3">You have the toolkit</h2>
        <p>
          35 modules of patterns and tradeoffs. The compass gives you the order: foundations, data, traffic,
          reliability, evolution, security. The toolbox gives you the components. The traps give you humility.
        </p>
        <p className="mt-3">
          What&apos;s left? Putting it all together on a real, end-to-end design. That&apos;s the capstone — one
          system, every layer, every decision justified out loud. See you there.
        </p>
      </section>

      <section className="my-12">
        <h3 className="text-lg font-semibold mb-3">Next up</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Module 39: Capstone — design a code review platform end to end. Bring the compass.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="recap" />
    </article>
  );
}
