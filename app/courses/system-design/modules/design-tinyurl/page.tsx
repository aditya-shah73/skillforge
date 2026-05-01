import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";

const CHECKPOINTS = [
  { id: "requirements-and-estimation", title: "Clarify and estimate" },
  { id: "api-and-high-level", title: "API, data, high-level design" },
  { id: "scale-and-deep-dives", title: "Scale and deep-dives" },
  { id: "wrap-and-extensions", title: "Wrap and what I'd revisit" },
];

const tinyUrlDiagram = `
flowchart LR
  Client[Client] -->|POST /shorten| API[API Service]
  Client -->|GET /:code| API
  API -->|reserve key| KGS[(Key Generation\\nService)]
  API -->|read/write| Cache[(Redis Cache)]
  Cache -.->|miss| DB[(Postgres / DynamoDB)]
  API -->|persist mapping| DB
  API -->|GET redirect 302| Client
  Cache <--> DB
`;

export default function Page() {
  const mod = getModuleBySlug("design-tinyurl")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
      </header>

      <ModuleProgress moduleSlug={mod.slug} checkpoints={CHECKPOINTS} />

      <section className="my-10 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-fuchsia-700 dark:text-fuchsia-300">The opener</span>
        </div>
        <p className="text-base leading-relaxed m-0">
          The interviewer says: <em>&quot;Design a URL shortener. Like TinyURL or bit.ly.&quot;</em> You smile, because this is the canonical warm-up. It looks easy and it&apos;s a trap. The naive version is two endpoints and a hash table — which the interviewer will absolutely follow up with: <em>&quot;OK, now serve 100 million links a day with sub-100ms p99.&quot;</em> The whole point of TinyURL as an interview is that the surface area is small enough for you to actually finish in 45 minutes — but only if you do the math, pick a sane key strategy, and notice that this is a 100:1 read-heavy workload.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-0">
          We&apos;ll walk this with the framework from Module 28: clarify, estimate, API + data, high-level, deep-dives. By the end you should be able to give this design end-to-end in 35 minutes and have time to discuss two extensions.
        </p>
      </section>

      <Checkpoint moduleSlug={mod.slug} id="requirements-and-estimation" title="Part 1 · Clarify and estimate" xp={10}>
        <h2>What we&apos;re actually building</h2>
        <p>
          The first move on any open prompt is to scope. URL shortening is an old product with a lot of features — analytics, custom aliases, expiration, paid tiers, abuse handling. You can&apos;t do all of it in 45 minutes, so you pick a tight core and get the interviewer&apos;s buy-in.
        </p>
        <p>The core I propose:</p>
        <ul>
          <li><strong>POST a long URL</strong>, get back a short code (e.g. <code>https://tny.io/aZ3kP9</code>).</li>
          <li><strong>GET a short code</strong>, redirect (HTTP 302) to the original long URL.</li>
          <li><strong>Custom alias</strong> (optional): user can request a specific code, fail if taken.</li>
          <li><strong>Expiration</strong> (optional): default 1 year, configurable.</li>
        </ul>
        <p>
          What I&apos;m explicitly punting on: analytics dashboards, user accounts beyond auth tokens, rate-limit tiers, abuse detection. I&apos;ll mention them at wrap.
        </p>

        <h3>Non-functional requirements</h3>
        <ul>
          <li><strong>Read-heavy.</strong> Shorten once, click many times. I&apos;ll assume 100:1 reads to writes — that one number drives everything.</li>
          <li><strong>Low latency on redirect.</strong> p99 &lt; 100ms is table stakes; users abandon links that feel slow.</li>
          <li><strong>High availability on read.</strong> If the redirect breaks, every embedded link breaks. Four nines minimum.</li>
          <li><strong>Eventually consistent is fine.</strong> A 5-second propagation delay on a new code is acceptable.</li>
          <li><strong>Codes must be unique and unguessable</strong> (so you can&apos;t enumerate them and harvest links).</li>
        </ul>

        <Callout variant="info" title="What I'd ask the interviewer">
          <ul className="m-0">
            <li>Should custom aliases be a first-class feature or a stretch goal?</li>
            <li>Is link-level analytics in scope, or just the redirect path?</li>
            <li>What&apos;s the rough scale — millions of writes per day, or hundreds of millions?</li>
          </ul>
        </Callout>

        <h2>Back-of-envelope estimation</h2>
        <p>
          Let&apos;s anchor scale. I&apos;ll assume we&apos;re bit.ly-sized: <strong>100M new links per month</strong>, <strong>100:1 read:write ratio</strong>. Five lines of math:
        </p>

        <CodeBlock lang="plain" caption="Capacity estimation">{`Writes:
  100M / month  ≈  100M / 30 / 86400  ≈  ~40 writes/sec average
                                          ~120 writes/sec peak (3x)

Reads (100:1 ratio):
  10B / month   ≈  ~4,000 reads/sec average
                   ~12,000 reads/sec peak

Storage:
  Per record: ~500 bytes (long URL + short code + metadata + timestamps)
  100M/mo × 500B = 50 GB/month
  5 years retention × 12 months = 3 TB total

Code space:
  Base62 (a-z, A-Z, 0-9) with 7 chars = 62^7 ≈ 3.5 × 10^12 codes
  We need ~6B codes over 5 years — fits comfortably with room to spare`}</CodeBlock>

        <p>
          Two takeaways from the math: (1) write QPS is small (one big Postgres node could absorb it), (2) read QPS is meaningful and storage is in the TB range, so we need a cache and a sharded or scalable store. That shapes everything below.
        </p>

        <Quiz
          question="The interviewer pushes back: 'Why did you pick 100:1 reads:writes? Justify.' What's the strongest answer?"
          options={[
            { label: "It's the standard ratio for link-shortening services — most links get shared and clicked many times after a single creation. I'd ask if you have specific telemetry, but in the absence of that, 100:1 is a reasonable starting point and the design tolerates being off by 2-3x in either direction.", correct: true, explanation: "Right. Names the assumption, explains the intuition, asks for ground truth, and notes the design's robustness. That's the whole pattern." },
            { label: "Because the assignment said it's read-heavy.", explanation: "The prompt didn't say that — you assumed it. Naming the assumption is the senior signal." },
            { label: "100:1 is the industry default for any web service.", explanation: "Not true — chat systems are roughly 1:1, social feeds vary widely. The ratio depends on the workload." },
            { label: "Because Redis can handle 100k QPS so we have margin.", explanation: "That's about the cache, not the assumption itself. The interviewer is asking why you chose that ratio, not whether your hardware handles it." },
          ]}
          hint="Name the assumption, explain the intuition, note robustness."
          xp={8}
        />

        <Quiz
          question="Given the math above (~120 writes/sec peak, ~12k reads/sec peak, 3TB over 5 years), which bottleneck would you call out first?"
          options={[
            { label: "Read QPS — at 12k/sec we'll need caching and likely read replicas. Storage at 3TB is large but routine for a single sharded store; writes at 120/sec are trivial.", correct: true, explanation: "Yes. Reads are the load-bearing axis here. Naming that explicitly tells the interviewer you read your own math." },
            { label: "Write QPS — 120/sec is significant and we'll need a queue.", explanation: "120 writes/sec is well within a single Postgres node's capacity. No queue needed at this scale." },
            { label: "Storage — 3TB requires sharding from day one.", explanation: "3TB fits on a single modern disk. You might shard for HA or future growth, not because 3TB is large." },
            { label: "All three are equally tight.", explanation: "They're not. The math says reads dominate by 100x. Naming the dominant axis is the signal." },
          ]}
          hint="Look at the absolute numbers, not just the words."
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Scope tight, then quantify. The 100:1 read ratio and the 12k read QPS are the two numbers that drive every architectural choice in the rest of this design."
          points={[
            { takeaway: "Pick a 4-feature core; explicitly punt the rest", detail: "POST shorten, GET redirect, custom alias, expiration. Mention analytics/abuse/tiers at wrap; don't try to design them all." },
            { takeaway: "Name the read:write ratio out loud as an assumption", detail: "100:1 is the typical link-shortener pattern. State it, defend it, and design assuming a 2-3x miss is OK." },
            { takeaway: "Estimate writes, reads, storage, code space", detail: "5 lines of math: ~120 writes/sec peak, ~12k reads/sec peak, ~3TB over 5 years, ~3.5T codes in 7-char base62." },
            { takeaway: "Identify the load-bearing bottleneck", detail: "It's reads — that justifies caching, replicas, and the API shape that follows. Writes and storage are routine." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="api-and-high-level" title="Part 2 · API, data, high-level design" xp={12}>
        <h2>Define the API in code</h2>
        <p>
          Now that we&apos;ve scoped, two endpoints anchor the system. Show the interviewer realistic Java/Spring signatures so they can see the shapes of inputs and outputs.
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/tinyurl/api/UrlController.java">{`@RestController
@RequestMapping("/api/v1")
public class UrlController {

    private final UrlService service;

    @PostMapping("/shorten")
    public ResponseEntity<ShortenResponse> shorten(
            @RequestBody @Valid ShortenRequest req,
            @RequestHeader("X-User-Id") String userId) {

        // Returns 201 with the short code on creation, 409 if alias is taken
        ShortUrl created = service.create(
            req.longUrl(),
            req.customAlias(),       // nullable
            req.expiresAt(),         // nullable, defaults to +1y
            userId
        );
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new ShortenResponse(
                created.code(),
                "https://tny.io/" + created.code(),
                created.expiresAt()
            ));
    }

    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        // 302 to the long URL, or 404 if the code is unknown/expired
        String target = service.resolve(code)
            .orElseThrow(() -> new NotFoundException(code));
        return ResponseEntity
            .status(HttpStatus.FOUND)
            .location(URI.create(target))
            .build();
    }
}

record ShortenRequest(
    @NotBlank @URL String longUrl,
    @Size(min = 4, max = 16) String customAlias,
    Instant expiresAt
) {}

record ShortenResponse(String code, String shortUrl, Instant expiresAt) {}`}</CodeBlock>

        <p>
          Two things to call out about this shape: (1) we use HTTP 302, not 301, because 301 gets cached forever by browsers and proxies — once you 301-redirect, you can&apos;t change the target. 302 leaves us flexibility. (2) the X-User-Id header lets us scope custom aliases per-tenant or attribute analytics later without redesigning the API.
        </p>

        <h2>Data model</h2>
        <p>
          The hot access pattern is: given <code>code</code>, return <code>long_url</code>. That&apos;s a primary-key lookup. Here&apos;s the schema:
        </p>

        <CodeBlock lang="plain" caption="Postgres / DynamoDB schema">{`urls
  code            VARCHAR(16)  PRIMARY KEY     -- the short code, indexed by default
  long_url        TEXT         NOT NULL
  user_id         VARCHAR(64)  NOT NULL
  created_at      TIMESTAMPTZ  NOT NULL
  expires_at      TIMESTAMPTZ                  -- nullable for never-expires
  alias_type      VARCHAR(16)  NOT NULL        -- 'auto' | 'custom'

  INDEX (user_id, created_at DESC)             -- list a user's links
  INDEX (expires_at) WHERE expires_at IS NOT NULL  -- expiry sweeper

Sharding:
  Partition by code prefix (first 2 chars of base62) → 62*62 = 3,844 logical shards
  Or hash-partition by code → uniform distribution, simpler routing`}</CodeBlock>

        <p>
          On store choice: at this scale, both Postgres and DynamoDB work. Postgres if your team already runs it and you want SQL for ad-hoc queries on user history. DynamoDB if you want managed scaling and don&apos;t mind the per-request cost. I&apos;d default to Postgres because the workload is small enough and the team velocity wins matter; I&apos;d switch to a wide-column store only if we go 10x.
        </p>

        <h2>High-level architecture</h2>
        <p>
          Five boxes are enough to express the whole thing. Read path is the hot one:
        </p>

        <Mermaid chart={tinyUrlDiagram} />

        <p>
          The flow:
        </p>
        <ol>
          <li><strong>Write path:</strong> Client POSTs long URL → API service → reserves a code from the Key Generation Service (KGS) or generates one inline → writes to DB → populates cache → returns the short URL. ~120 QPS peak; one box handles it.</li>
          <li><strong>Read path:</strong> Client GETs <code>/aZ3kP9</code> → API service → check Redis cache (LRU, ~10GB hot working set) → on miss, read from DB and warm the cache → return 302. ~12k QPS peak; cache absorbs &gt;95% of it.</li>
        </ol>

        <Callout variant="insight" title="Why the cache hit rate is so high">
          Link click distribution is power-law: a small percentage of links account for most clicks (think viral tweets, marketing campaigns, news articles). With a working set of a few million hot codes in Redis, you&apos;ll hit 95%+ on read. Cache miss is cheap (single PK lookup), so even 5% miss rate is fine. This is why caching alone gets us from 12k DB QPS to a few hundred.
        </Callout>

        <Quiz
          question="Why HTTP 302 instead of 301 on the redirect?"
          options={[
            { label: "301 is cached aggressively by browsers and proxies, sometimes permanently. If we ever need to change the target (link expiry, takedown, abuse), the 301-cached clients won't honor it. 302 keeps control with the server.", correct: true, explanation: "Exactly. The control argument is the senior version. Bonus: 302 also lets you do click-counting on every hit, which 301 caching would defeat." },
            { label: "302 is faster than 301.", explanation: "The status codes themselves are the same wire weight. The real difference is caching semantics." },
            { label: "301 is deprecated.", explanation: "Not at all — 301 is fine for resources you'll never move. It's a tradeoff, not deprecation." },
            { label: "Browsers don't follow 301 cross-origin.", explanation: "They do. Both 301 and 302 are followed cross-origin." },
          ]}
          hint="Think about what happens 6 months after a link is shortened."
          xp={6}
        />

        <Quiz
          question="The interviewer says: 'Walk me through what happens when an unknown code is requested.' What's the cleanest answer?"
          options={[
            { label: "Cache miss → DB lookup by primary key → not found → return 404. We could also negative-cache the miss for a short TTL (e.g. 60s) to absorb scrape attacks that probe random codes, but at our scale it's not yet necessary.", correct: true, explanation: "Right. Walks the path, names a real concern (scraping), proposes negative caching as a contingent mitigation rather than a default. Senior shape." },
            { label: "Return 200 with an empty body.", explanation: "404 is the right code — it's what clients and crawlers expect for an unknown resource." },
            { label: "Retry 3x in case the DB had a transient miss.", explanation: "A primary-key miss isn't transient; the row doesn't exist. Retries waste latency." },
            { label: "Look up in Postgres, then DynamoDB, then S3 backup.", explanation: "The data isn't in multiple stores. One canonical store, one cache." },
          ]}
          hint="Walk the read path; mention a real-world concern proportionally."
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Two endpoints, a flat key-value table, a cache in front of the DB, and HTTP 302. The architecture is small because the workload — once you've quantified it — is small. The hard parts are key generation and cache discipline, which we go deep on next."
          points={[
            { takeaway: "API in code, not boxes", detail: "@PostMapping/@GetMapping with realistic types tells the interviewer you can ship this. Show validation, status codes, error shapes." },
            { takeaway: "302 not 301 — keep redirect control with the server", detail: "301 is cached possibly forever; if you ever need to change the target you've lost the link. 302 also enables click counting." },
            { takeaway: "Single hot table, indexed by code", detail: "Sharding by code prefix or hash gives 4k+ logical shards. Secondary indexes are for user history and expiry sweeping." },
            { takeaway: "Cache absorbs the read fanout", detail: "Power-law click distribution + Redis LRU = 95%+ hit rate, which collapses 12k DB QPS to a few hundred." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="scale-and-deep-dives" title="Part 3 · Scale and deep-dives" xp={14}>
        <h2>The hard parts (call them out at the start of Part 3)</h2>
        <p>
          When you reach Phase 5 of the framework, your move is to name the 2-3 hard subproblems out loud and ask the interviewer which to dig into. For TinyURL the canonical hard parts are:
        </p>
        <ol>
          <li><strong>Key generation.</strong> How do we mint codes that are unique, short, and unguessable, at the rate we need, without coordination overhead?</li>
          <li><strong>Read path scale.</strong> Cache topology, DB read replicas, and what happens during a cache cold-start.</li>
          <li><strong>Custom aliases.</strong> The collision and reservation problem, plus the abuse vector.</li>
        </ol>
        <p>
          We&apos;ll go deep on key generation (the most interesting one) and cover the others tighter.
        </p>

        <h2>Deep-dive: key generation</h2>
        <p>
          You need to mint a unique 6-7 character base62 code per write. There are three real options. The framework move is to <strong>name them, compare on an axis, pick one with reasoning</strong>.
        </p>

        <h3>Option A: Hash the long URL (e.g. MD5 → first 7 chars in base62)</h3>
        <p>
          Cheapest. No coordination — every API node can compute the same code for the same URL. But two problems: (1) <strong>collisions</strong> — first 7 base62 chars from MD5 will collide; you have to detect and pick a different prefix, which requires a DB read on every write. (2) <strong>same URL → same code</strong>, so you can&apos;t support &quot;give me a different short link for the same URL.&quot; If that&apos;s a product requirement, hashing is out.
        </p>

        <h3>Option B: Auto-increment ID, encoded base62</h3>
        <p>
          DB gives each row an integer ID (1, 2, 3, ...). Encode the integer in base62: 1 → &quot;b&quot;, 100,000 → &quot;q0U&quot;, 1B → &quot;15ftgG&quot;. No coordination needed beyond the DB&apos;s normal sequence; codes grow short-to-long over time. Two problems: (1) <strong>guessable</strong> — sequential codes mean attackers can scrape your full URL space by walking 1, 2, 3. (2) <strong>tied to one DB</strong> — a single sequence is a single point of contention; sharding requires per-shard ID space and reassembly.
        </p>

        <h3>Option C: Key Generation Service (KGS) with pre-allocated batches</h3>
        <p>
          A dedicated service mints random base62 codes ahead of time, in batches (say 1M at a time), and stores them in two tables: <code>available_keys</code> and <code>used_keys</code>. API nodes request a batch of N codes from the KGS, use them, and request more. Random codes are unguessable; pre-allocation amortizes coordination over many writes. The KGS itself can be HA with a leader election.
        </p>

        <p>
          <strong>My pick: KGS.</strong> It solves both the guessability problem (random codes) and the coordination problem (batches amortize the round-trip). The complexity cost is a single small service — and at 120 writes/sec a tiny KGS easily keeps up. Hashing is out because we want to support multiple short links to the same URL. Auto-increment is out because of guessability.
        </p>

        <CodeBlock lang="java" caption="KGS sketch — request a batch of pre-minted keys">{`@Service
public class KeyGenerationService {

    private final KgsRepository repo;
    private static final int BATCH_SIZE = 1000;

    @Transactional
    public List<String> reserveBatch() {
        // Atomically claim N rows from available_keys, move them to used_keys
        // The DB transaction prevents two API nodes from grabbing the same batch
        List<String> claimed = repo.lockAndPopAvailable(BATCH_SIZE);
        repo.markUsed(claimed);
        return claimed;
    }

    // Background worker mints new keys when available_keys drops below threshold
    @Scheduled(fixedDelay = 60_000)
    public void replenish() {
        long remaining = repo.countAvailable();
        if (remaining < 100_000) {
            // Generate fresh random base62 strings, dedup, insert
            List<String> fresh = generateRandom(BATCH_SIZE * 100);
            repo.insertIfAbsent(fresh);
        }
    }
}`}</CodeBlock>

        <Callout variant="warn" title="The KGS failure mode you should name">
          If the KGS is down, writes stall. So either (1) every API node holds a local batch of, say, 100 keys, so a brief KGS outage doesn&apos;t affect the write path, or (2) we run the KGS as an HA pair with leader election. I&apos;d do both: local batch for hot path absorption, HA KGS for durability. Naming this failure mode unprompted is exactly the senior signal — you&apos;re reasoning about &quot;what happens when a piece of this is down.&quot;
        </Callout>

        <h2>Deep-dive: read path at scale</h2>
        <p>
          12k peak read QPS is well within a single Redis instance&apos;s capacity (Redis does 100k+ ops/sec on commodity hardware). The real questions are: what&apos;s in the cache, what&apos;s the eviction policy, and what happens during a cold start?
        </p>
        <ul>
          <li><strong>What:</strong> <code>code → long_url</code>. That&apos;s it. ~100 bytes per entry.</li>
          <li><strong>Eviction:</strong> LRU. We size the cache for the working set — say 10M hot codes × 100B = 1GB. Comfortable for one Redis node; a small cluster handles 10x.</li>
          <li><strong>Cold start:</strong> if the cache is wiped (deploy, failure), every read goes to the DB. That&apos;s 12k DB QPS for a few minutes — survivable on a sharded Postgres or DynamoDB, painful on a single small node. Mitigation: <strong>warm the cache from the DB on boot</strong> by reading the hot codes (e.g. last week&apos;s most-accessed) before accepting traffic.</li>
        </ul>

        <h2>Deep-dive: custom aliases</h2>
        <p>
          Custom aliases make this harder than it looks. The user POSTs <code>customAlias: &quot;myteam&quot;</code> and we need to know whether <code>myteam</code> is taken. Naive: SELECT WHERE code = &quot;myteam&quot;, INSERT if not found. That&apos;s a TOCTOU race — two users picking &quot;myteam&quot; at the same time both see &quot;not found&quot; and both insert.
        </p>
        <p>
          The fix is the DB&apos;s unique constraint on <code>code</code>. Both INSERTs hit the same row; the second one fails on the unique violation, which we translate to HTTP 409. No application-level locking needed — the DB enforces the invariant.
        </p>
        <p>
          The other concern is <strong>abuse</strong>: someone scripts a thousand requests for slurs, brand impersonations, and reserved words. Mitigations: (1) a denylist of forbidden patterns enforced at the API layer, (2) per-user rate limiting on custom alias creation, (3) a manual review queue for reports. This is a 5-minute mention in the wrap, not a deep-dive.
        </p>

        <Quiz
          question="Why pre-allocate keys in batches instead of generating one per write?"
          options={[
            { label: "It amortizes coordination — one round-trip to the KGS gets you N keys, so the API can serve N writes from a local cache before talking to KGS again. Also lets the KGS pre-vet keys for collisions and forbidden patterns offline.", correct: true, explanation: "Right. Amortization is the core argument. Pre-vetting offline is a nice secondary benefit — collisions are caught when the batch is generated, not on the hot path." },
            { label: "Pre-allocation is faster than random generation.", explanation: "Generating a random base62 code is microseconds — speed isn't the issue. Coordination overhead is." },
            { label: "Batches make codes shorter.", explanation: "Code length is determined by base62 size, not allocation strategy." },
            { label: "It's required by the unique constraint.", explanation: "The unique constraint works regardless of allocation strategy." },
          ]}
          hint="What's expensive: minting a key, or coordinating that no one else minted it?"
          xp={8}
        />

        <Quiz
          question="What's the simplest correct way to handle two users requesting the same custom alias at the same time?"
          options={[
            { label: "Rely on the unique constraint on the code column. Both INSERTs race; the second one fails with a unique violation, which we translate to HTTP 409. No application-level locking needed.", correct: true, explanation: "Yes. The DB is the source of truth for uniqueness — let it do its job. Application locks would be slower and more error-prone, and you'd still need the DB constraint as a safety net." },
            { label: "Acquire a distributed Redis lock on the alias before checking.", explanation: "Adds a dependency, a failure mode, and a TTL question. The unique constraint already gives you atomicity for free." },
            { label: "SELECT, then INSERT in two separate statements.", explanation: "Classic TOCTOU race — two users see 'not found' simultaneously and both INSERT. The unique constraint catches it; the SELECT is decorative." },
            { label: "Queue all custom alias requests through a single worker.", explanation: "Way too much serialization for what's essentially a 1-row INSERT with a constraint check. The DB handles concurrency natively." },
          ]}
          hint="The DB has a primitive built for this. What is it?"
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The two interesting problems are key generation and read-path scale. KGS with pre-allocated random batches gives unguessable codes with amortized coordination; cache + LRU + warm-on-boot handles 12k peak QPS. Custom aliases lean on the DB's unique constraint."
          points={[
            { takeaway: "Compare key strategies on guessability and coordination", detail: "Hash: free coordination but same-URL = same-code and collisions. Auto-incr: simple but guessable and shard-fighting. KGS: best balance, costs one small service." },
            { takeaway: "Local batch + HA KGS for write path resilience", detail: "Each API node holds 100 keys locally so a KGS blip doesn't stall writes. KGS itself runs HA with leader election." },
            { takeaway: "Cache topology is small; cold start is the risk", detail: "10M hot codes × 100B fits in 1GB. Warm from DB on boot; otherwise a deploy = 12k DB QPS until cache repopulates." },
            { takeaway: "Lean on the DB unique constraint for custom aliases", detail: "Two INSERTs race; second one returns 409. No app-level locks. Add a denylist + rate limit at the edge for abuse." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="wrap-and-extensions" title="Part 4 · Wrap and what I'd revisit" xp={6}>
        <h2>What I&apos;d revisit if I had more time</h2>
        <p>
          A clean wrap names what you punted on, what you&apos;re worried about, and what you&apos;d monitor. For TinyURL:
        </p>
        <ul>
          <li><strong>Click analytics.</strong> Probably an async pipeline: API writes a click event to Kafka, a stream processor aggregates per-code into a hot counter (Redis) and a long-term store (e.g. ClickHouse). I didn&apos;t design it but I&apos;d build it as a separate service so the redirect path stays fast.</li>
          <li><strong>Multi-region.</strong> Reads can be regionally cached (Redis per region, eventually-consistent DB replication). Writes can be either single-region with global replication, or active-active with code-prefix-based routing. The latter is more complex than this design needs at our scale.</li>
          <li><strong>Abuse and content moderation.</strong> Scan submitted long URLs against malware/phishing feeds asynchronously. If a URL is flagged after creation, set the code to &quot;blocked&quot; and serve a warning page on redirect. Mention but don&apos;t design.</li>
          <li><strong>Expiry sweeper.</strong> A background worker that scans <code>WHERE expires_at &lt; now()</code> and either soft-deletes or moves rows to cold storage. Uses the secondary index from the schema.</li>
        </ul>

        <h3>Failure modes I&apos;m worried about</h3>
        <ul>
          <li><strong>KGS down:</strong> mitigated by per-node local batches.</li>
          <li><strong>Redis down:</strong> read path falls back to DB, which absorbs 12k QPS only if it&apos;s sharded or replicated. Worth specifying the DB topology can handle it.</li>
          <li><strong>Hot-link DDoS:</strong> a single viral code might attract 100k QPS. Cache absorbs it, but the network layer needs a per-code rate limiter to prevent the long URL&apos;s origin from getting hammered.</li>
        </ul>

        <h3>What I&apos;d monitor</h3>
        <ul>
          <li>Redirect p99 latency (SLO: &lt;100ms)</li>
          <li>Cache hit rate (SLO: &gt;90%)</li>
          <li>KGS available-keys depth (alert if &lt;10k)</li>
          <li>4xx and 5xx rates by endpoint</li>
          <li>Daily new-link count (product metric)</li>
        </ul>

        <Callout variant="spring" title="The senior 'I would also' moves">
          When you propose a choice, mention the alternative and why you&apos;re not picking it. <em>&quot;I&apos;d use Postgres for the canonical store; I would also consider DynamoDB for managed sharding, but the team&apos;s ops familiarity with Postgres outweighs the scaling ceiling at this size.&quot;</em> Three of these in the interview signal depth without spending time. The interviewer can pull the thread on any of them.
        </Callout>

        <p>
          That&apos;s TinyURL end-to-end. The structure you just walked — clarify, estimate, API + data, high-level, deep-dives, wrap — is the same one you&apos;ll use on news feed in the next module, and on every system design problem after that. The architecture is different; the framework isn&apos;t.
        </p>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <p className="text-sm uppercase tracking-wider font-bold text-cyan-700 dark:text-cyan-300 mb-2">Up next</p>
        <p className="m-0 text-base">
          Module 30: Design a news feed. Same framework, harder problem — fanout-on-write vs fanout-on-read, the celebrity hot-key, and why the &quot;right&quot; answer is usually a hybrid.
        </p>
      </section>
    </article>
  );
}
