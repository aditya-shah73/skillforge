import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";

const CHECKPOINTS = [
  { id: "compass", title: "The compass" },
  { id: "tools", title: "Tool-fit" },
  { id: "traps", title: "Traps" },
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
            <strong>Foundations.</strong> Latency budgets, throughput targets, SLOs, consistency requirements.
            Modules 1–6 lived here. If you skip foundations, every later choice is guesswork.
          </li>
          <li>
            <strong>Data plane.</strong> Where the bytes actually live. Replication for availability, sharding for
            scale, indexes for access patterns. Modules 7–14.
          </li>
          <li>
            <strong>Traffic plane.</strong> How requests reach the data. Load balancers, caches, queues, streams.
            Modules 15–22.
          </li>
          <li>
            <strong>Reliability.</strong> What keeps the system honest under stress. Idempotency, retries,
            backpressure, circuit breakers, observability. Modules 23–30.
          </li>
          <li>
            <strong>Evolution.</strong> How the system changes without breaking. Migrations, dual-writes,
            blue/green, feature flags. Module 36.
          </li>
          <li>
            <strong>Security.</strong> The cross-cutting concern that touches every layer. Module 37.
          </li>
        </ol>

        <Callout variant="insight" title="Always start with constraints, not solutions">
          Junior designers reach for tools (&quot;we&apos;ll use Kafka, Redis, Cassandra&quot;). Seniors reach for
          questions (&quot;what&apos;s the read/write ratio? what&apos;s the consistency requirement? what fails when
          this breaks?&quot;). The toolbox doesn&apos;t change. The order of operations does.
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">First-pass questions for any new design</h3>
        <ol className="space-y-2">
          <li><strong>Read or write heavy?</strong> Drives caching strategy, DB choice, replication shape.</li>
          <li><strong>What&apos;s the consistency requirement?</strong> Strong, read-your-writes, eventual? Different stacks.</li>
          <li><strong>What&apos;s the access pattern?</strong> Single-key lookups (KV), range scans (LSM), graph traversal (Neo4j)?</li>
          <li><strong>What fails when this is unavailable?</strong> Drives retries, fallbacks, circuit breakers.</li>
          <li><strong>What&apos;s the failure mode you can&apos;t afford?</strong> Drives idempotency, exactly-once semantics, durability tier.</li>
          <li><strong>Where does this run in five years?</strong> Drives schema evolution, API versioning, migration patterns.</li>
        </ol>

        <Checkpoint moduleSlug="recap" id="compass" title="Compass checkpoint" xp={20}>
          <Quiz
            kind="Quick check"
            xp={15}
            question="A PM asks you to &quot;design a notification system.&quot; What's your first question?"
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
            <strong>Cache as system of record.</strong> Redis without persistence + AWS reboots = data loss. Caches are
            caches.
          </li>
          <li>
            <strong>Search index as primary store.</strong> Elasticsearch is fantastic at search, mediocre at
            durability and consistency. Always have an upstream source of truth.
          </li>
          <li>
            <strong>Object storage as live database.</strong> S3 is durable but eventually consistent and slow per-op.
            Don&apos;t put it in a hot path.
          </li>
          <li>
            <strong>Kafka as RPC.</strong> It&apos;s a log, not a request/response system. Don&apos;t pretend.
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
            question="Your team wants to add an &quot;events&quot; table in Postgres that workers poll every second. Volume is 50k/sec. What do you push back on?"
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
    </article>
  );
}
