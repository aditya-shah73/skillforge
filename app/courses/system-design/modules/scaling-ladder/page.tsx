import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "vertical", title: "Vertical first, then horizontal" },
  { id: "stateless", title: "Stateless, cache, shard" },
  { id: "async", title: "Async as the escape hatch" },
];

const archEvolution = `flowchart LR
  subgraph S1["Stage 1: Monolith"]
    A1[Client] --> B1[App Server] --> C1[(Postgres)]
  end
  subgraph S2["Stage 2: + Load Balancer"]
    A2[Client] --> LB[LB] --> B2a[App] & B2b[App] & B2c[App]
    B2a & B2b & B2c --> C2[(Postgres)]
  end
  subgraph S3["Stage 3: + Cache"]
    A3[Client] --> LB2[LB] --> B3[Apps]
    B3 --> CA[(Redis)]
    B3 --> C3[(Postgres)]
  end
  subgraph S4["Stage 4: + Sharded DB"]
    A4[Client] --> LB3[LB] --> B4[Apps]
    B4 --> CA2[(Redis)]
    B4 --> SH1[(Shard 1)] & SH2[(Shard 2)] & SH3[(Shard N)]
  end`;

export default function Page() {
  const mod = getModuleBySlug("scaling-ladder")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="scaling-ladder" />
        <ModuleProgress moduleSlug="scaling-ladder" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🪜</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A mental staircase. When traffic grows, you&apos;ll know which rung you&apos;re standing on, which rung is next, and — most importantly — which rungs to skip because someone else read a blog post.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Why vertical scaling is the right answer more often than juniors think</li>
          <li>The progression: stateless → cache → shard, and the order matters</li>
          <li>When sync request/response runs out of room and async takes over</li>
          <li>How to read a system and name the next rung in one sentence</li>
        </ul>
      </section>

      <section>
        <h2>The whole ladder, in one sentence</h2>
        <p>
          When a system gets slow, you go through these rungs roughly in order: <strong>make the box bigger</strong>, <strong>add more boxes behind a load balancer</strong>, <strong>make the boxes stateless so adding more is cheap</strong>, <strong>cache hot reads</strong>, <strong>shard the database</strong>, and finally <strong>move slow work off the request path with async</strong>. That&apos;s it. Six moves. Most production systems live somewhere between rungs 3 and 5 forever and never need 6.
        </p>
        <p>
          The ladder isn&apos;t a checklist — it&apos;s a diagnostic. When someone says &quot;we&apos;re going to add Kafka,&quot; the right reaction is: <em>which rung is that, and have we exhausted the cheaper rungs?</em>{" "}Half the over-engineered systems you&apos;ll inherit skipped rungs because the team that built them found rung 6 more interesting than rung 1.
        </p>
        <Callout variant="insight" title="The senior reflex">
          <p className="m-0">When I get paged for a slow service, I don&apos;t reach for a queue first. I look at CPU, memory, and connection pool on a single box. Most outages — like, the actual majority — turn out to be one bad SQL query, one undersized pool, or one missing index. The ladder starts at the bottom for a reason.</p>
        </Callout>
      </section>

      <Checkpoint moduleSlug="scaling-ladder" id="vertical" title="Part 1 · Vertical first, then horizontal" xp={20}>
        <h2>Why vertical scaling wins more often than you think</h2>
        <p>
          Vertical scaling means making the single machine bigger — more CPU, more RAM, faster disk. It&apos;s out of fashion because &quot;it doesn&apos;t scale to infinity,&quot; which is true and almost never relevant. Most services in production aren&apos;t serving Twitter-scale traffic. They&apos;re serving 200 QPS on a 4-core box and someone wants to add Kubernetes.
        </p>
        <p>
          Vertical scaling is fast, cheap, and risk-free in a way horizontal scaling never is. You change one number in a config file. You don&apos;t re-architect anything. You don&apos;t introduce a new failure mode. You don&apos;t teach the team about leader election. You just buy a bigger box.
        </p>
        <p>The argument <em>against</em>{" "}vertical that you should know:</p>
        <ul>
          <li><strong>There&apos;s a ceiling.</strong>{" "}AWS&apos;s biggest EC2 instance has hundreds of cores and terabytes of RAM, but it&apos;s expensive per-vCPU and you eventually hit it.</li>
          <li><strong>It&apos;s a single point of failure.</strong>{" "}One big box has the same blast radius as one small box. You need at least two for availability.</li>
          <li><strong>Cost curve is non-linear.</strong>{" "}A 64-core box typically costs more than 8x an 8-core box. At some point horizontal beats vertical on price alone.</li>
        </ul>
        <p>
          But — and this is the part juniors miss — none of those reasons say &quot;skip vertical and go straight to horizontal.&quot; They say &quot;vertical has a ceiling.&quot; Until you&apos;re near the ceiling, vertical is the cheapest move that works.
        </p>

        <Callout variant="warn" title="The instinct to over-engineer">
          <p className="m-0">If your service is at 30% CPU and someone wants to add a Kafka cluster to &quot;handle scale,&quot; that&apos;s the conversation where you say: <em>we have 3x headroom on the box, what problem are we solving?</em>{" "}Don&apos;t add complexity to systems that are bored.</p>
        </Callout>

        <h3>The real first move: profile</h3>
        <p>
          Before any scaling decision, figure out what&apos;s slow. Is it CPU? Is it I/O wait on the database? Is it a thread pool that&apos;s saturated? Is it network? The ladder you climb depends entirely on the bottleneck. Adding more replicas of a service that&apos;s blocked on a slow query just means more replicas blocked on the same slow query.
        </p>
        <p>
          The most common bottleneck in Java services I&apos;ve seen: <strong>database connection pool exhaustion</strong>. The app is fine, the DB is fine, but the pool is too small and threads are queuing for connections. Bumping HikariCP from 10 to 30 connections often buys you 3x throughput with zero architectural change. <em>That&apos;s</em>{" "}rung 1 thinking.
        </p>

        <h3>From one box to two: the load balancer</h3>
        <p>
          Once vertical hits a real wall — or you need redundancy for availability — you put a load balancer in front of two or more app servers. This is the cheapest horizontal move. It&apos;s the move that buys you availability, not just throughput. With two boxes behind an LB, you can lose one without going down.
        </p>
        <p>
          The load balancer adds one new question: <strong>where does session state live?</strong>{" "}If user A&apos;s session is in box 1&apos;s memory, and the LB sends request 2 to box 2, you&apos;ve broken the session. The naive fix is sticky sessions (the LB pins each user to the same box). The real fix is making the box stateless, which is exactly the next rung.
        </p>

        <Quiz
          kind="Quick check"
          question="Your Java service is running on a 4-core box at 80% CPU during peak. p99 latency is climbing. The team proposes adding 5 more replicas behind an LB. What's the first question to ask?"
          options={[
            { label: "What's saturating the CPU? Is it actual work, GC pressure, or a hot loop?", correct: true, explanation: "Right. Before scaling out, you need to know what the box is actually doing. If it's GC thrashing, more replicas just gives you more boxes thrashing. If it's a hot N+1 query, you're spreading the database pain. Profile first." },
            { label: "Add the replicas — 80% is too high for a single box.", explanation: "This is the over-engineering instinct. 80% CPU isn't an emergency, it's a signal. Without knowing what's burning the CPU, scaling out can just multiply the problem. Profile first." },
            { label: "Move to a bigger instance immediately — vertical first.", explanation: "Closer, but still skipping the diagnostic step. Vertical scaling is cheap, but if the bottleneck is a bad query, no amount of CPU helps. You have to know what you're scaling before you scale." },
            { label: "Add Redis caching in front of the database.", explanation: "Caching might be the right answer eventually, but only if reads are the bottleneck. You don't know that yet. This is jumping three rungs without diagnosing." },
          ]}
          hint="The ladder starts with diagnosis, not action."
          xp={6}
        />

        <Quiz
          kind="Gut check"
          question="Two app servers behind a load balancer. A user logs in via server A, the LB sends their next request to server B, and they get logged out. What's the architectural fix (not the duct-tape fix)?"
          options={[
            { label: "Move session state out of the app process — into Redis or a JWT — so any server can handle any request.", correct: true, explanation: "Exactly. The real fix is making the app stateless. Session-in-memory is the bug. Sticky sessions are a workaround that breaks the moment a server dies." },
            { label: "Enable sticky sessions on the load balancer so each user always lands on the same server.", explanation: "This is the duct-tape fix and it works for a while. But when server A dies, every user pinned to it gets logged out. And it makes deploys painful. The real fix is statelessness." },
            { label: "Replicate session memory between server A and server B in real time.", explanation: "This was a real pattern (Tomcat clustering). It's complex, fragile, and doesn't scale past a handful of nodes. Industry has overwhelmingly moved to externalized session state." },
            { label: "Add a third server so the LB has more options.", explanation: "More servers, same bug. The problem isn't capacity, it's where the session lives." },
          ]}
          hint="What does 'stateless' actually mean for the box?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Vertical and pool tuning are the cheapest moves on the ladder, and skipping them is the most common architectural mistake."
          points={[
            { takeaway: "Vertical first — a bigger box is fast, cheap, and risk-free until you hit the ceiling.", detail: <>Most production services aren&apos;t close to the ceiling. The instinct to skip straight to horizontal is mostly fashion, not engineering.</> },
            { takeaway: "Always profile before scaling. CPU, GC, I/O wait, and pool exhaustion all look the same from outside.", detail: <>Adding replicas to a service blocked on a slow query just gives you more replicas blocked on the same slow query. Diagnose first.</> },
            { takeaway: "Pool tuning is rung 1 thinking — often a 3x throughput win for free.", detail: <>HikariCP undersized to 10 is a real common case. Bumping to 30 routinely doubles or triples throughput with zero architectural change.</> },
            { takeaway: "Two boxes behind an LB buys availability before throughput, and forces the question of where session state lives.", detail: <>You can&apos;t serve traffic from two boxes if your sessions live in one box&apos;s memory. The LB rung implies the stateless rung.</> },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="scaling-ladder" id="stateless" title="Part 2 · Stateless, cache, shard" xp={25}>
        <h2>The horizontal scaling triangle</h2>
        <p>
          Once you&apos;re committed to scaling out, three rungs come in roughly this order: <strong>stateless services</strong>, then <strong>cache</strong>, then <strong>shard</strong>. They&apos;re not strictly sequential — sometimes you&apos;ll cache before you go stateless if the bottleneck is reads — but most systems benefit from this order, and senior engineers think in this order.
        </p>

        <h3>Stateless services</h3>
        <p>
          A stateless service holds no per-user state in process memory. Sessions go to Redis. Authentication is a JWT or a token validated against an auth service. Uploaded files go to S3, not local disk. Background work that needs persistence goes to a queue or database, not an in-memory map.
        </p>
        <p>
          Once your service is stateless, horizontal scaling becomes mechanical: spin up more pods, the LB does its job, you&apos;re done. Deployments are blue-green or rolling, and a node dying is a non-event. The whole reason Kubernetes-style autoscaling works is because everyone agreed to be stateless.
        </p>
        <Callout variant="spring" title="Stateless in Spring">
          <p className="m-0">In Spring, the smell is <code>@SessionScope</code> beans, in-process caches that you actually rely on for correctness, and anything that writes to a local file. Replace those with Redis-backed sessions (<code>spring-session-data-redis</code>), Caffeine for advisory caches only, and S3 or a blob store for files. Once those are gone, your service is horizontally scalable by construction.</p>
        </Callout>

        <h3>Caching: the fastest 10x in this business</h3>
        <p>
          A read cache in front of your database is the single highest-leverage move on the ladder. If 95% of reads are for the same 5% of data — and they almost always are; that&apos;s the Pareto distribution — then a cache with a hit rate of 95% means your database does 1/20th the work. That&apos;s a 20x effective scale-up of the database for the cost of running Redis.
        </p>
        <p>The math is what makes caching irresistible:</p>
        <ul>
          <li><strong>Without cache:</strong> 10,000 reads/sec, all hit the DB. DB at 80% capacity.</li>
          <li><strong>With 95% cache hit rate:</strong> 9,500 reads served by Redis (sub-millisecond), 500 hit the DB. DB at 4% capacity.</li>
        </ul>
        <p>
          The catch is invalidation. &quot;There are only two hard things in computer science: cache invalidation and naming things.&quot; The cache holds data that the database has changed underneath it. Now you have to decide: how stale is too stale? Do you invalidate on write? Do you let entries expire on a TTL? Do you write through, write around, or write back?
        </p>
        <p>
          We&apos;ll spend a whole module on caching patterns later in Phase 2. For now, the rung-2 truth is: a cache layer in front of read-heavy data is usually the highest-leverage thing you can add to a struggling service.
        </p>

        <h3>Sharding: when the database itself is the wall</h3>
        <p>
          You&apos;ve gone vertical, gone stateless, added a cache. Reads are fast. But writes — or the absolute volume of data — have outgrown a single database. Now you shard.
        </p>
        <p>
          Sharding splits the data across multiple databases by some key — user_id, tenant_id, geographic region, hash of primary key. Each shard holds a slice. A query for user_id=12345 goes to whichever shard owns that user. The total throughput of the system is now N times what one database could do.
        </p>
        <p>
          The price of sharding is real and worth respecting:
        </p>
        <ul>
          <li><strong>Cross-shard queries are painful.</strong> &quot;List all premium users&quot; now means hitting every shard.</li>
          <li><strong>Joins across shards mostly don&apos;t work.</strong>{" "}You denormalize or move work to the application layer.</li>
          <li><strong>Re-sharding is hard.</strong>{" "}Once data is partitioned by user_id mod 16, going to 32 shards is a migration.</li>
          <li><strong>Hot shards happen.</strong>{" "}If one celebrity user has 10x the traffic of normal users, that shard is hot and the others are bored.</li>
        </ul>
        <p>
          This is why sharding is rung 5, not rung 2. You sharded last because every other rung was cheaper. We&apos;ll cover sharding strategies in detail in the storage phase.
        </p>

        <h3>The architecture, rung by rung</h3>
        <p>
          Here&apos;s the same system at four points on the ladder:
        </p>
        <Mermaid chart={archEvolution} />
        <p>
          Each step adds one new component and one new failure mode. Stage 1 is fine for prototypes and small services. Stage 4 is where most large consumer systems live. Notice what stage 4 doesn&apos;t have: there&apos;s no queue, no event bus, no message broker. Async is rung 6 — it&apos;s a separate move, not implied by horizontal scaling.
        </p>

        <Callout variant="info" title="The order matters">
          <p className="m-0">Skipping &quot;stateless&quot; and going straight to &quot;cache&quot; gives you the worst of both: you&apos;ve added a cache invalidation problem and you still can&apos;t scale your app servers because they hold session state. Always make the box stateless before you scale it out.</p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your service is at 10k reads/sec, 200 writes/sec. p99 read latency is 80ms (DB-bound). Which rung gives you the biggest win first?"
          options={[
            { label: "Add a read cache in front of the database. The 50:1 read/write skew is exactly what caches eat for breakfast.", correct: true, explanation: "Right. With reads dominating writes 50:1 and p99 dominated by DB, a cache is the textbook fix. A 90% hit rate drops effective DB load by 10x. Sharding, async, and more replicas are all overkill for this shape." },
            { label: "Shard the database. 10k reads/sec is too much for one DB.", explanation: "10k reads/sec is well within a single Postgres or MySQL on decent hardware. Sharding is rung 5 — you'd skip 3 cheaper rungs to get there. Always cache reads before sharding." },
            { label: "Move reads to async — fire-and-forget with eventual consistency.", explanation: "Reads aren't async candidates — the user is waiting for the answer. Async is for write paths or expensive background work, not the hot read path." },
            { label: "Add 10 more app server replicas behind the LB.", explanation: "If reads are DB-bound, more app servers just means more processes waiting on the DB. You're scaling the wrong tier. Cache the data the DB is serving repeatedly." },
          ]}
          hint="What's the actual bottleneck — the app servers or the database?"
          xp={7}
        />

        <Quiz
          kind="Gut check"
          question="You added Redis as a write-through cache. A user updates their profile, and 30 seconds later still sees the old name on another device. What's the most likely cause?"
          options={[
            { label: "Cache wasn't invalidated on write — the read on device 2 hit a stale entry that hasn't expired yet.", correct: true, explanation: "Classic invalidation bug. Write-through means writes go through the cache to the DB, but if the second device's read hit an entry cached before the write, and TTL hasn't expired, you serve stale data. Either invalidate on write or accept the TTL window." },
            { label: "Redis is eventually consistent across nodes.", explanation: "Single-node Redis is strongly consistent. Even Redis Cluster gives strong consistency for keys on the same node. The bug is at the application layer, not Redis itself." },
            { label: "The database replication lag is 30 seconds.", explanation: "30s replication lag would be a catastrophic incident, not a design assumption. More likely the cache is serving the pre-update value." },
            { label: "The LB sent device 2's request to a different app server that had a stale local cache.", explanation: "If you have local in-process caches alongside Redis, that's the actual bug — but the question framed Redis as the cache. The fix is the same: invalidate on write." },
          ]}
          hint="Cache invalidation is one of the two hard things..."
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Stateless first, then cache, then shard — the order is load-bearing."
          points={[
            { takeaway: "Stateless services first — externalize session, files, in-process state — and horizontal scaling becomes mechanical.", detail: <>The whole reason Kubernetes-style autoscaling works is the stateless contract. Adding replicas to stateful boxes just multiplies the inconsistency.</> },
            { takeaway: "Caching is the highest-leverage move on the ladder. 95% hit rate is a 20x effective DB scale-up.", detail: <>Most read-heavy systems have Pareto-distributed access. The 5% of data that&apos;s read 95% of the time is exactly what a cache eats.</> },
            { takeaway: "Sharding is rung 5 because the cost is real: cross-shard queries, join pain, re-sharding migrations, hot shards.", detail: <>You shard last, after every cheaper rung is exhausted. The tax is operational forever after, so don&apos;t pay it early.</> },
            { takeaway: "Order matters. Skipping rungs gives you the worst of multiple worlds.", detail: <>Caching before going stateless adds invalidation pain to a service that still can&apos;t scale horizontally. Stateless before cache is the right order.</> },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="scaling-ladder" id="async" title="Part 3 · Async as the escape hatch" xp={25}>
        <h2>When sync runs out of room</h2>
        <p>
          Even after you&apos;ve gone stateless, cached, and sharded, some operations don&apos;t belong on the request path. Sending a welcome email. Generating a thumbnail. Updating a search index. Recomputing a recommendation. Calling a flaky third-party API. These are all things where the user shouldn&apos;t wait for the result, and your service shouldn&apos;t fail because the downstream did.
        </p>
        <p>
          That&apos;s rung 6: <strong>move slow, optional, or unreliable work off the request path.</strong>{" "}The pattern has many names — async processing, queue-based load leveling, fire-and-forget, event-driven — but they all have the same shape. The request handler does the minimum work needed to acknowledge the user (write the row, return 200), then drops a message on a queue. A separate worker pool consumes from the queue and does the rest, on its own time.
        </p>

        <h3>What async actually buys you</h3>
        <ul>
          <li><strong>Smoothed traffic.</strong>{" "}Bursty load hits the queue, not the slow downstream. If you get 10x traffic for an hour, the queue grows; the workers chew through it at their own steady rate. The system absorbs the spike instead of melting.</li>
          <li><strong>Decoupling from downstream failure.</strong>{" "}If the email provider is down, requests still succeed. The email message sits in the queue and retries until the provider recovers.</li>
          <li><strong>Latency wins for the user.</strong>{" "}The user&apos;s POST returns in 50ms instead of 2 seconds because they&apos;re no longer waiting for thumbnail generation.</li>
          <li><strong>Backpressure as a feature.</strong>{" "}Queue depth is a number you can monitor and alert on. Sync systems hide their backlog inside thread pools.</li>
        </ul>

        <h3>What async costs you</h3>
        <ul>
          <li><strong>Eventual consistency on the user side.</strong>{" "}The user signs up; they&apos;re a real user immediately, but the welcome email arrives in 30 seconds. That&apos;s usually fine. Sometimes it isn&apos;t.</li>
          <li><strong>Operational complexity.</strong>{" "}You now have a broker (Kafka, SQS, RabbitMQ) to run, monitor, scale, and patch.</li>
          <li><strong>At-least-once delivery.</strong>{" "}Most queues guarantee delivery but not exactly-once. Workers must be idempotent — processing the same message twice can&apos;t corrupt state.</li>
          <li><strong>Debugging is harder.</strong>{" "}The flow is now: user request → DB write → message on queue → worker picks up → side effect happens. A lot more places for things to go wrong silently.</li>
        </ul>

        <Callout variant="warn" title="Async is not a free 'make it scale' lever">
          <p className="m-0">Adding a queue to a service that&apos;s really just slow because of a missing index makes the slowness invisible — instead of timing out, it piles up in the queue. Async is the right move when work is genuinely deferrable. It&apos;s the wrong move when you&apos;re using it to hide a synchronous problem you should fix.</p>
        </Callout>

        <h3>Async in Spring: a concrete example</h3>
        <p>
          The simplest async in Spring is <code>@Async</code> — runs a method on a thread pool instead of inline. It&apos;s a good fit for in-process fire-and-forget where you don&apos;t need durability:
        </p>
        <CodeBlock lang="java" caption="@Async fire-and-forget for non-critical work">{`@Service
public class SignupService {

  private final UserRepository users;
  private final EmailService email;

  // Saves the user synchronously, fires off the welcome email asynchronously.
  public User signup(SignupRequest req) {
    User u = users.save(new User(req.email(), req.name()));
    sendWelcomeEmailAsync(u);  // returns immediately
    return u;
  }

  @Async("emailExecutor")
  public void sendWelcomeEmailAsync(User u) {
    // runs on emailExecutor's thread pool, not the request thread
    email.sendWelcome(u.email());
  }
}

@Configuration
@EnableAsync
public class AsyncConfig {
  @Bean("emailExecutor")
  public Executor emailExecutor() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(4);
    ex.setMaxPoolSize(16);
    ex.setQueueCapacity(500);
    ex.setThreadNamePrefix("email-");
    return ex;
  }
}`}</CodeBlock>
        <p>
          But <code>@Async</code> has a critical limitation: <strong>if the JVM crashes before the email is sent, the message is lost.</strong>{" "}The work was queued in memory, not on disk. For anything that has to actually happen — billing, notifications, audit logs — you need durable async, which means a real broker.
        </p>
        <p>
          The next step up is publishing to a queue (SQS, RabbitMQ) or a log (Kafka). The handler writes to the DB and publishes a message in the same transaction (or via the outbox pattern, which we&apos;ll cover in Phase 3). A worker process consumes the message and does the side effect. Crashes are recoverable because the message is durable.
        </p>
        <CodeBlock lang="java" caption="Outbox pattern: durable async without two-phase commit">{`@Service
public class SignupService {

  private final UserRepository users;
  private final OutboxRepository outbox;

  @Transactional
  public User signup(SignupRequest req) {
    User u = users.save(new User(req.email(), req.name()));
    // Same transaction as the user insert — atomic with the user existing.
    outbox.save(new OutboxEvent("user.signed_up", u.id()));
    return u;
  }
}

// Separately, a poller drains the outbox table and publishes to Kafka/SQS.
// A worker subscribes, sends the email, and the message is acked.`}</CodeBlock>
        <Callout variant="info" title="Why the outbox?">
          <p className="m-0">If you write the user row in one transaction and publish the Kafka event after the commit, there&apos;s a small window where the row exists but the event was never published — JVM crash, network blip. The outbox keeps the event in the DB transaction, then a separate process reliably publishes it. Message gets delivered exactly when the user actually exists.</p>
        </Callout>

        <h3>Pattern recognition: which rung is this scenario on?</h3>
        <p>
          Read each scenario and decide which rung is the next move.
        </p>
        <ClassifyChallenge
          title="Pick the next rung"
          prompt="For each scenario, classify the next sensible rung."
          buckets={[
            { id: "vertical", label: "Vertical / pool tuning", color: "rose" },
            { id: "stateless", label: "Make it stateless", color: "amber" },
            { id: "cache", label: "Add a cache", color: "emerald" },
            { id: "shard", label: "Shard the database", color: "indigo" },
            { id: "async", label: "Move it async", color: "violet" },
          ]}
          items={[
            { id: "s1", label: "Service is fine but every signup waits 1.8s for a welcome email API to respond.", answer: "async", explanation: "The user shouldn't wait for an email send. Drop a message and let a worker handle it. Classic async candidate." },
            { id: "s2", label: "Single-server Spring app at 60% CPU, p99 latency creeping up. HikariCP at 10 connections, often saturated.", answer: "vertical", explanation: "Pool exhaustion is rung 1. Bump HikariCP to 30 — or move to a bigger box if CPU also climbs. Diagnose the pool first." },
            { id: "s3", label: "Read-heavy product catalog, 10k QPS, mostly hitting the same 200 SKUs. DB at 70%.", answer: "cache", explanation: "Pareto-distributed reads, DB is hot. Textbook cache scenario. Sharding is overkill." },
            { id: "s4", label: "Two app servers behind LB; users randomly get logged out mid-session.", answer: "stateless", explanation: "Session-in-memory bug. Move sessions to Redis. Sticky sessions is the duct-tape fix; stateless is the real one." },
            { id: "s5", label: "Single Postgres at 4TB, write throughput maxed even after every other rung.", answer: "shard", explanation: "Once a single DB is the wall on writes, sharding is what's left. Pay the cross-shard tax knowingly." },
            { id: "s6", label: "Sign-up triggers a credit check on a third-party API that's flaky and slow.", answer: "async", explanation: "Flaky downstream + non-instant requirement = move it async. Decouple your sign-up SLA from their availability." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="You moved email-sending from inline to a Kafka topic with a worker pool. A bug made the worker crash on every message for an hour. After the fix, what should happen?"
          options={[
            { label: "Workers replay every message accumulated in the topic and send the missed emails — that's the whole point of durable async.", correct: true, explanation: "Right. Durable queues / Kafka are designed for exactly this: the consumer can be down for an hour, and when it comes back, it resumes from its committed offset. Messages don't get lost because workers crashed." },
            { label: "Those emails are lost — Kafka only retains messages for the consumer that's currently online.", explanation: "This describes pub/sub with no durability, not Kafka. Kafka retains messages on disk per its retention policy (often days), independent of consumer state." },
            { label: "The producer should have detected the consumer was down and stopped publishing.", explanation: "Producers in Kafka don't know about consumer health — that's the whole decoupling point. The broker holds messages until consumers catch up." },
            { label: "You should manually re-trigger each affected signup from the user table.", explanation: "Possible workaround if you didn't have durable async, but the entire reason to use Kafka here is so this manual recovery isn't needed." },
          ]}
          hint="What is durable async actually buying you in a worker outage?"
          xp={7}
        />

        <Quiz
          kind="Gut check"
          question="A teammate proposes adding Kafka to a service handling 100 QPS, all sync request/response, where every endpoint is naturally synchronous (search, fetch profile, login). What's the right pushback?"
          options={[
            { label: "Kafka is for deferrable work. None of these endpoints have deferrable work — the user is waiting for the answer. You'd be paying broker complexity for zero benefit.", correct: true, explanation: "Exactly. Async is rung 6 — it earns its place when work is genuinely deferrable. Wrapping sync RPC in a queue doesn't make it async, it just adds latency and operational overhead." },
            { label: "100 QPS is too low for Kafka — Kafka needs at least 10k QPS to be worth it.", explanation: "Kafka has no minimum-QPS rule. The pushback isn't about volume, it's about whether the work is deferrable." },
            { label: "Use RabbitMQ instead — Kafka is for analytics, RabbitMQ is for transactions.", explanation: "Common myth, and beside the point. Both can handle either, and neither belongs in a sync system anyway." },
            { label: "Run a benchmark first to see if the latency is acceptable.", explanation: "You'd find latency went up, but the architectural objection is what to lead with. Don't burn a sprint benchmarking a design that doesn't fit the problem." },
          ]}
          hint="What does async actually buy you, and is any of it relevant here?"
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Async is for deferrable work, not for hiding sync problems."
          points={[
            { takeaway: "Async is for slow, optional, or unreliable work — not a generic 'make it scale' lever.", detail: <>If the user is waiting for the answer, no amount of queueing helps. Save async for work that genuinely doesn&apos;t need to happen on the request path.</> },
            { takeaway: "@Async in Spring is in-process and lossy. Durable async needs a broker (SQS, RabbitMQ, Kafka).", detail: <>JVM crash on the way to send the email loses the message. For work that has to happen, the broker holds the message on disk until a worker acks it.</> },
            { takeaway: "The outbox pattern keeps the message and the DB write in one transaction.", detail: <>Without the outbox, you have a window where the row exists but the event was never published. The outbox table makes the side effect atomic with the data write.</> },
            { takeaway: "Async costs you eventual consistency, idempotent workers, and operational complexity. Spend it knowingly.", detail: <>Every message can be delivered twice; every worker has to be safe under retry. The ops surface area roughly doubles. The benefit has to be real.</> },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>The whole ladder, one more time</h2>
        <ol>
          <li><strong>Profile.</strong>{" "}Know what&apos;s actually slow before you reach for a tool.</li>
          <li><strong>Vertical.</strong>{" "}Bigger box. Larger pool. Cheap, fast, low-risk.</li>
          <li><strong>Horizontal + LB.</strong>{" "}Two boxes for availability, more for throughput.</li>
          <li><strong>Stateless.</strong>{" "}Externalize session, files, in-process state. Now adding boxes is mechanical.</li>
          <li><strong>Cache.</strong>{" "}The highest-leverage move on the ladder. Read-heavy systems get 10–20x effective scale.</li>
          <li><strong>Shard.</strong>{" "}When the DB itself is the wall. Pay the cross-shard tax knowingly.</li>
          <li><strong>Async.</strong>{" "}For deferrable work only. Durable broker, idempotent workers, outbox at the source.</li>
        </ol>
        <p>
          When someone proposes a scale move, locate it on this ladder and ask: <em>which rungs did we skip, and why?</em>{" "}Half of senior system-design judgement is just refusing to skip cheap rungs.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The ladder gives you moves. The next module — CAP and PACELC — gives you the constraints that decide which moves are even available, especially once you&apos;re running multiple replicas of state.
        </p>
        <Link
          href="/courses/system-design/modules/cap-pacelc"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to CAP and PACELC →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="scaling-ladder" />
    </article>
  );
}
