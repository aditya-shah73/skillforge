import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleProgress from "@/components/ModuleProgress";
import Checkpoint from "@/components/Checkpoint";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import Mermaid from "@/components/Mermaid";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "patterns", title: "Four patterns" },
  { id: "ttl-invalidation", title: "TTL & invalidation" },
  { id: "what-to-cache", title: "What to cache" },
  { id: "personalization", title: "Personalization caching" },
];

const cacheAsideDiagram = `sequenceDiagram
  participant App
  participant Cache as Redis
  participant DB as Postgres
  App->>Cache: GET user:42
  Cache-->>App: nil (miss)
  App->>DB: SELECT * FROM users WHERE id=42
  DB-->>App: row
  App->>Cache: SET user:42 (TTL 5m)
  Cache-->>App: OK
  App-->>App: return user`;

const writeThroughDiagram = `sequenceDiagram
  participant App
  participant Cache as Cache layer
  participant DB as Postgres
  App->>Cache: PUT user:42 = {...}
  Cache->>DB: UPDATE users SET ... WHERE id=42
  DB-->>Cache: OK
  Cache-->>Cache: store user:42
  Cache-->>App: OK`;

export default function Page() {
  const mod = getModuleBySlug("caching-patterns")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="caching-patterns" />
        <ModuleProgress moduleSlug="caching-patterns" checkpoints={CHECKPOINTS} />
      </header>

      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4">What you&apos;ll walk out with</h2>
        <ul className="space-y-2">
          <li>The four caching patterns (cache-aside, write-through, write-back, refresh-ahead) and the workloads each one fits.</li>
          <li>TTL strategy, jitter, and the four ways invalidation goes wrong.</li>
          <li>A cold-eyed view of <em>what to cache</em> — and what categorically not to.</li>
          <li>Concrete patterns: Spring <code>@Cacheable</code>, manual <code>RedisTemplate</code>, and when each one is appropriate.</li>
        </ul>
      </section>

      <section className="my-10">
        <p>
          There&apos;s a Phil Karlton quote that gets posted in every caching discussion: &quot;There are only two hard
          things in computer science: cache invalidation and naming things.&quot; Most engineers nod and move on.
          The point is more specific than the joke makes it sound — caching is easy, the bug factory is the
          <em>invalidation strategy</em>, and that&apos;s where you should be spending your design effort.
        </p>
        <p>
          The patterns in this module are well-defined; the failure modes are well-known. The skill is choosing the
          right pattern for your data and being honest about what staleness you can tolerate.
        </p>
      </section>

      <Checkpoint moduleSlug="caching-patterns" id="patterns" title="Four patterns" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 1 — The four patterns</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">Cache-aside (lazy loading)</h3>
        <p>
          The application is in charge. On read: check the cache, miss → load from DB, populate the cache, return.
          On write: update the DB, invalidate or update the cache. This is the default and what 90% of teams use.
        </p>

        <Mermaid chart={cacheAsideDiagram} />

        <CodeBlock lang="java" caption="Cache-aside with Spring's RedisTemplate">{`@Service
public class UserService {
    private static final Duration TTL = Duration.ofMinutes(5);

    @Autowired RedisTemplate<String, User> redis;
    @Autowired UserRepository repo;

    public User get(long id) {
        String key = "user:" + id;
        User cached = redis.opsForValue().get(key);
        if (cached != null) return cached;

        User fresh = repo.findById(id).orElseThrow();
        redis.opsForValue().set(key, fresh, TTL);
        return fresh;
    }

    public User update(long id, UserUpdate update) {
        User saved = repo.update(id, update);
        redis.delete("user:" + id);   // invalidate, don't update — see Part 2
        return saved;
    }
}`}</CodeBlock>

        <p>
          <strong>Strengths:</strong> only what gets read ends up in the cache. Resilient — if the cache goes
          down, the DB takes the hit but the system keeps working. Easy to reason about.
        </p>
        <p>
          <strong>Weaknesses:</strong> first read of every key is slow (cache miss penalty). Race conditions during
          writes (more on this in Part 2). Stale data lives in the cache until TTL or invalidation.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Write-through</h3>
        <p>
          Writes go through the cache. The cache is responsible for persisting to the underlying store before
          acknowledging. The cache is always consistent with the DB <em>for keys that are in the cache</em>.
        </p>

        <Mermaid chart={writeThroughDiagram} />

        <p>
          <strong>Strengths:</strong> reads are fast and the cache is never staler than the DB. Good for read-heavy
          data that&apos;s also written through a single path.
        </p>
        <p>
          <strong>Weaknesses:</strong> writes are slower (cache + DB latency). Doesn&apos;t help if writes happen via
          paths the cache can&apos;t observe (other services, batch jobs). Most caches don&apos;t support
          write-through natively — you&apos;re building a custom layer.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Write-back (write-behind)</h3>
        <p>
          Writes go to the cache only. The cache asynchronously flushes to the DB later, in batches. Wildly fast,
          wildly dangerous. If the cache crashes before flushing, you lose data.
        </p>
        <p>
          <strong>Strengths:</strong> absurd write throughput. The cache absorbs bursts.
        </p>
        <p>
          <strong>Weaknesses:</strong> data loss on cache failure. Hard to query the &quot;real&quot; state — DB might
          be minutes behind cache. Used for metrics, counters, view counts — things where dropping a few percent on
          a bad day is acceptable.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Refresh-ahead</h3>
        <p>
          The cache proactively reloads keys that are about to expire, before they expire. Hot keys never see a miss
          from the user&apos;s perspective.
        </p>
        <p>
          <strong>Strengths:</strong> zero miss latency for popular data. Smooths out load spikes (no thundering
          herd when a popular key expires).
        </p>
        <p>
          <strong>Weaknesses:</strong> wasted refreshes for data nobody&apos;s going to read. Only worth it for
          predictable hot keys. Most teams approximate this with longer TTLs and a stale-while-revalidate pattern.
        </p>

        <Quiz
          kind="Quick check"
          question="A team is caching user profiles with cache-aside. They notice that when a user updates their profile, sometimes the next read still returns the old data. What's the most common root cause?"
          options={[
            { label: "Cache-aside doesn't work for mutable data — they should switch to write-through.", correct: false, explanation: "Cache-aside handles mutable data fine; the team's invalidation logic just has a race. Switching patterns doesn't fix the bug, just hides it." },
            { label: "The update path isn't invalidating the cache, or there's a race between invalidation and a concurrent read repopulating stale data.", correct: true, explanation: "Right. The classic cache-aside bug: either someone forgot the invalidate call on a code path, or there's a race where a stale read writes back to the cache after the invalidate. We'll dig into the race in Part 2." },
            { label: "Redis ate the data.", correct: false, explanation: "Almost never the answer. The bug is almost always in your invalidation logic, not the cache itself." },
            { label: "TTLs are too long.", correct: false, explanation: "Long TTLs make staleness last longer, but don't cause the symptom 'next read returns old data.' That's an invalidation problem, not a TTL problem." },
          ]}
        />

        <ClassifyChallenge
          title="Match each workload to a caching pattern"
          prompt="There's sometimes more than one defensible answer; pick the best fit based on consistency needs, write characteristics, and miss tolerance."
          buckets={[
            { id: "aside", label: "Cache-aside", description: "Default — lazy load on miss, invalidate on write", color: "indigo" },
            { id: "through", label: "Write-through", description: "Cache writes to DB synchronously", color: "emerald" },
            { id: "back", label: "Write-back", description: "Cache absorbs writes, flushes async", color: "amber" },
            { id: "refresh", label: "Refresh-ahead", description: "Proactively reload hot keys before expiry", color: "sky" },
          ]}
          items={[
            { id: "1", label: "User profile data, read frequently, updated occasionally via a single REST endpoint", answer: "aside", explanation: "Cache-aside is the default. Reads dominate, writes go through one path you control, and a stale read for a few seconds is fine." },
            { id: "2", label: "Page view counter for blog posts, 100k writes/sec, exact count not critical", answer: "back", explanation: "Counters where some loss is tolerable are the textbook write-back use case. Cache absorbs the firehose, flushes to DB every few seconds." },
            { id: "3", label: "Top-10 trending products, computed nightly, queried by every homepage load", answer: "refresh", explanation: "Predictable hot key with a known refresh schedule. Refresh-ahead means the homepage never sees a miss." },
            { id: "4", label: "Cart contents during checkout — must always reflect the latest state", answer: "through", explanation: "Strong consistency requirement on a known write path. Write-through keeps cache and DB in sync without invalidation race risk." },
            { id: "5", label: "Currency exchange rates pulled from an external API, refreshed every minute", answer: "refresh", explanation: "Predictable refresh cadence, hot key (every checkout reads it). Refresh-ahead matches the refresh cycle to the data's natural staleness." },
            { id: "6", label: "Search-results page where users scroll and the same queries repeat across users", answer: "aside", explanation: "Read-heavy, populated lazily on first request, expires after a short TTL. Classic cache-aside." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Cache-aside is the default. Write-through trades write latency for cache consistency. Write-back trades durability for write throughput. Refresh-ahead is a hot-key optimization."
          points={[
            { takeaway: "Cache-aside is the right starting point.", detail: "App is in charge, cache is optional, easy to reason about. Most teams should use this until proven otherwise." },
            { takeaway: "Write-through eliminates invalidation races for keys in the cache.", detail: "Worth it when writes are funneled through one path and you can't tolerate staleness." },
            { takeaway: "Write-back is for high-volume metric-style data where loss is OK.", detail: "Don't put your billing data here. Do put view counters here." },
            { takeaway: "Refresh-ahead is for known hot keys with predictable refresh.", detail: "Most teams approximate with stale-while-revalidate; full refresh-ahead is only worth it for the top few keys." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="caching-patterns" id="ttl-invalidation" title="TTL & invalidation" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 2 — TTL &amp; invalidation</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">TTL is the laziest correct invalidation</h3>
        <p>
          A TTL says: &quot;this entry is valid for N seconds; after that, refetch.&quot; It&apos;s the simplest
          invalidation strategy and it works because eventually-consistent data is usually fine. Pick TTLs based on
          how stale the data is allowed to be:
        </p>
        <ul>
          <li>User profile: 5 minutes (rarely changes, low cost of staleness).</li>
          <li>Product price: 30 seconds (changes occasionally, staleness has business cost).</li>
          <li>Inventory count: 5 seconds, or don&apos;t cache (changes constantly, staleness causes oversells).</li>
          <li>Static config: 1 hour (rarely changes, restart-tolerant).</li>
        </ul>

        <Callout variant="info" title="Always add jitter">
          <p className="m-0">
            If you set every entry to expire in exactly 5 minutes, and you populate the cache during a deploy, every
            entry expires at the same moment 5 minutes later. The cache goes empty in one tick, the DB gets hit by
            every user simultaneously, and you have a stampede. <strong>Add ±10% jitter to TTLs</strong> so expirations
            spread out. <code>TTL = base + random(-base*0.1, base*0.1)</code>.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">The four invalidation bugs</h3>
        <p>
          Almost every caching bug fits into one of these:
        </p>

        <p><strong>1. Forgot to invalidate.</strong> The update path didn&apos;t call the invalidate. Now the cache is wrong until TTL.</p>

        <p><strong>2. Stale read repopulates after invalidate (the race).</strong></p>
        <ol>
          <li>Reader R loads &quot;user:42&quot; from DB. DB returns version v1. R hasn&apos;t written to cache yet.</li>
          <li>Writer W updates user:42 in DB to v2.</li>
          <li>Writer W invalidates cache (no-op — empty already).</li>
          <li>Reader R now writes v1 to cache.</li>
          <li>Cache has v1 forever (or until TTL). DB has v2.</li>
        </ol>
        <p>
          Fixes: short TTLs so the bug self-heals; or use a versioned cache key; or use write-through. Or use the
          &quot;invalidate twice&quot; trick — invalidate before write, write to DB, invalidate again. Doesn&apos;t fully
          solve the race but reduces the window.
        </p>

        <p><strong>3. Updating the cache instead of invalidating.</strong> Two writers W1 and W2 both update the same row, then both update the cache. If W1&apos;s cache update lands after W2&apos;s, the cache has W1&apos;s old value while the DB has W2&apos;s new one. <strong>Always invalidate, don&apos;t update.</strong> Let the next reader repopulate.</p>

        <p><strong>4. Cache stampede / thundering herd.</strong> Hot key expires; thousands of concurrent readers all miss; all hit the DB simultaneously. Fixes: a per-key lock so only one reader refills (others wait); a probabilistic early refresh; or stale-while-revalidate (return stale data while one reader refreshes in the background).</p>

        <CodeBlock lang="java" caption="Stampede protection with a per-key lock">{`public User getWithStampedeProtection(long id) {
    String key = "user:" + id;
    User cached = redis.opsForValue().get(key);
    if (cached != null) return cached;

    String lockKey = "lock:" + key;
    Boolean got = redis.opsForValue().setIfAbsent(lockKey, "1", Duration.ofSeconds(5));

    if (Boolean.TRUE.equals(got)) {
        try {
            User fresh = repo.findById(id).orElseThrow();
            redis.opsForValue().set(key, fresh, jitter(Duration.ofMinutes(5)));
            return fresh;
        } finally {
            redis.delete(lockKey);
        }
    }

    // Someone else is refilling. Wait briefly, then retry.
    sleep(50);
    cached = redis.opsForValue().get(key);
    return cached != null ? cached : repo.findById(id).orElseThrow();
}`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="A team is seeing intermittent stale data after writes. They've audited the code and confirmed every update path calls cache.delete(). The TTL is 60 seconds. The bug appears once or twice an hour. What's the most likely cause?"
          options={[
            { label: "Redis is dropping the delete commands.", correct: false, explanation: "Redis is reliable for this. The bug is almost certainly in the application's race window, not in Redis." },
            { label: "Read-then-write race: a concurrent reader loaded from DB before the writer's update committed, then populated the cache with the stale value after the writer's invalidate.", correct: true, explanation: "Classic. The reader's DB query saw the pre-update row, then the writer committed and invalidated, then the reader populated the cache with the old value. Mitigations: shorter TTL, double-invalidation (delete after write commits + delete a second time after a small delay), or move to write-through for this specific key." },
            { label: "Network packet loss between app and Redis.", correct: false, explanation: "Network issues would manifest as connection errors, not stale data." },
            { label: "TTL is too short, causing constant repopulation that occasionally races.", correct: false, explanation: "Shorter TTLs reduce staleness, not increase it. The race exists at all TTLs; shorter just means the bug heals faster." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Negative caching</h3>
        <p>
          When a key doesn&apos;t exist in the DB, you usually still want to cache that fact. Otherwise an attacker
          (or a bug) requesting nonexistent keys hits the DB on every request — &quot;cache penetration.&quot;
          Cache <code>null</code> for a short TTL (30s) so the DB sees the request only once.
        </p>

        <CodeBlock lang="java" caption="Negative cache for missing keys">{`public Optional<User> get(long id) {
    String key = "user:" + id;
    String value = redis.opsForValue().get(key);
    if ("__NULL__".equals(value)) return Optional.empty();   // negative cache hit
    if (value != null) return Optional.of(deserialize(value));

    Optional<User> fresh = repo.findById(id);
    if (fresh.isPresent()) {
        redis.opsForValue().set(key, serialize(fresh.get()), Duration.ofMinutes(5));
    } else {
        redis.opsForValue().set(key, "__NULL__", Duration.ofSeconds(30));   // negative TTL
    }
    return fresh;
}`}</CodeBlock>

        <Callout variant="spring" title="@Cacheable handles a lot of this for you">
          <p className="m-0">
            Spring&apos;s <code>@Cacheable</code> annotation gives you cache-aside with one line:
            <code> @Cacheable(value=&quot;users&quot;, key=&quot;#id&quot;)</code> on a method, plus
            <code> @CacheEvict</code> on the update method, and you&apos;re done. The tradeoffs: less control over
            negative caching, jitter, and stampede protection. Fine for 80% of caches; the other 20% want
            <code> RedisTemplate</code> directly.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="Your team caches user lookups. A single user is hammered by web crawlers checking if they exist (they don't). What's the targeted fix?"
          options={[
            { label: "Increase the TTL on the user cache.", correct: false, explanation: "The cache only stores existing users. Misses still hit the DB every time." },
            { label: "Add negative caching: cache the 'doesn't exist' result for 30 seconds.", correct: true, explanation: "Cache penetration is exactly this scenario. Storing a sentinel value for missing keys with a short TTL means the DB sees one request per key per 30 seconds, not one per crawl." },
            { label: "Block crawlers at the WAF.", correct: false, explanation: "Maybe — but it doesn't generalize. Negative caching protects against any source of missing-key traffic, including bugs and probes." },
            { label: "Switch to write-back for users.", correct: false, explanation: "Write-back doesn't help — the issue is on the read path for keys that don't exist. Write pattern is irrelevant." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="TTL is the laziest correct invalidation. Add jitter. Always invalidate, don't update. Watch for the four bugs: missed invalidate, race repopulation, update-not-invalidate, and stampedes."
          points={[
            { takeaway: "TTL with jitter handles 80% of invalidation needs.", detail: "Pick TTLs based on tolerance for staleness; add ±10% jitter to avoid synchronized expiry." },
            { takeaway: "The read-then-write race is the bug nobody catches in code review.", detail: "Mitigate with shorter TTLs, double invalidation, or write-through for hot mutable keys." },
            { takeaway: "Always invalidate, never update.", detail: "Updating from multiple writers introduces ordering bugs. Delete and let the next reader repopulate." },
            { takeaway: "Stampedes need a lock or stale-while-revalidate.", detail: "When a hot key expires, only one reader should refill. The rest wait or serve stale." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="caching-patterns" id="what-to-cache" title="What to cache" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 3 — What to cache (and what not to)</h2>

        <p>
          Caching has a cost: invalidation complexity, memory, debugging time when staleness causes a bug. The
          benefit only shows up if the data being cached fits a profile. Walk through these questions before
          adding a cache:
        </p>

        <ol>
          <li><strong>Is it read-heavy?</strong> Read:write ratio of at least 10:1, ideally 100:1+.</li>
          <li><strong>Does it tolerate staleness?</strong> If yes, by how long?</li>
          <li><strong>Is the upstream slow or expensive?</strong> If your DB query is 2ms and Redis lookup is 1ms, you&apos;re saving nothing meaningful.</li>
          <li><strong>Is the cache hit rate going to be high?</strong> If you have a long tail of unique queries, hit rate stays low and the cache adds latency without benefit.</li>
        </ol>

        <h3 className="text-xl font-semibold mt-8 mb-3">Good cache candidates</h3>
        <ul>
          <li><strong>User profile data.</strong> Read on every page load, changes rarely, staleness of seconds to minutes is fine.</li>
          <li><strong>Configuration / feature flags.</strong> Read on every request, changes via deploys, stale-by-minutes is fine.</li>
          <li><strong>Computed aggregates.</strong> &quot;Top 10 products today,&quot; &quot;trending tags.&quot; Expensive to compute, read often.</li>
          <li><strong>External API responses.</strong> Currency rates, weather, anything you pay per call for.</li>
          <li><strong>Authorization decisions.</strong> Permission checks done on every request; underlying data changes rarely.</li>
          <li><strong>HTML fragments / page sections.</strong> Rendering cost &gt; cache lookup cost.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Bad cache candidates</h3>
        <ul>
          <li><strong>Anything where staleness causes correctness bugs.</strong> Inventory counts, account balances, fraud-detection state. Cache the read path at your peril.</li>
          <li><strong>Low-cardinality data already cached by the DB.</strong> Postgres has a buffer cache. If your &quot;hot&quot; query is on a small table that fits in shared_buffers, Postgres is already serving it from RAM at sub-millisecond latency.</li>
          <li><strong>Per-user data with no read amplification.</strong> If user 42 is the only one ever reading user:42&apos;s feed, and they read it once per session, caching it costs more than it saves.</li>
          <li><strong>Data with extremely high cardinality and low hit rate.</strong> Caching every search query with no overlap is just turning your cache into a slow database.</li>
        </ul>

        <Callout variant="warn" title="The 'we just cache everything' antipattern">
          <p className="m-0">
            Some teams reflexively put a cache in front of every endpoint. The result is a system that&apos;s harder
            to reason about, harder to debug (now staleness is a confounding variable on every weird issue), and not
            meaningfully faster — most cached entries have a low enough hit rate that the DB would&apos;ve handled it
            fine. Cache surgically. Each cache should have a measured hit rate &gt; 50% and a measurable latency win.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Multi-level caching</h3>
        <p>
          Real systems often have several layers:
        </p>
        <ul>
          <li><strong>Browser cache</strong> (Cache-Control, ETag) — for static assets and idempotent GETs.</li>
          <li><strong>CDN</strong> (CloudFront, Fastly) — for assets and increasingly for API responses.</li>
          <li><strong>Application-level local cache</strong> (Caffeine in-process) — for ultra-hot data with sub-microsecond access.</li>
          <li><strong>Distributed cache</strong> (Redis, Memcached) — shared across app instances, milliseconds to access.</li>
          <li><strong>Database buffer cache</strong> — your DB is already caching pages in RAM, for free.</li>
        </ul>
        <p>
          A request &quot;walks down&quot; the layers, returning at the first hit. Each layer should have shorter TTLs
          (or stronger invalidation) than the one below. The browser cache hits first and fastest; the DB hits last
          and slowest.
        </p>

        <CodeBlock lang="java" caption="Two-tier: Caffeine (local) backed by Redis (shared)">{`@Configuration
public class CacheConfig {
    @Bean
    public Cache<String, User> localUserCache() {
        return Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(Duration.ofSeconds(30))
            .build();
    }
}

@Service
public class UserService {
    @Autowired Cache<String, User> local;
    @Autowired RedisTemplate<String, User> redis;
    @Autowired UserRepository repo;

    public User get(long id) {
        String key = "user:" + id;
        User u = local.getIfPresent(key);
        if (u != null) return u;

        u = redis.opsForValue().get(key);
        if (u != null) {
            local.put(key, u);
            return u;
        }

        u = repo.findById(id).orElseThrow();
        redis.opsForValue().set(key, u, Duration.ofMinutes(5));
        local.put(key, u);
        return u;
    }
}`}</CodeBlock>

        <Callout variant="insight" title="The local-cache invalidation problem">
          <p className="m-0">
            Local caches have one nasty property: each app instance has its own copy. Invalidating a key on instance A
            doesn&apos;t invalidate it on instance B. The standard fix is a Redis pub/sub channel — when you invalidate,
            publish the key, every instance subscribes and evicts locally. Or just use very short TTLs (10–30s) on the
            local cache and accept the staleness window.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="A team caches the result of an authorization check (can_user_X_access_resource_Y) for 1 hour. A user is removed from a project but can still access it for up to 60 minutes. What's the right tradeoff?"
          options={[
            { label: "Drop the TTL to 30 seconds.", correct: false, explanation: "Reduces but doesn't eliminate the security window. For authorization, the right answer is usually targeted invalidation, not just a shorter TTL." },
            { label: "On revoke, publish an invalidation event so all caches drop the affected entries.", correct: true, explanation: "Authorization is the textbook 'staleness has security implications' case. TTLs alone leave a window where a removed user still has access. The right pattern is event-driven invalidation: when permissions change, publish to all caches to evict immediately." },
            { label: "Stop caching authorization decisions.", correct: false, explanation: "Auth checks are typically called on every request and rarely change — a great cache candidate. The fix is correct invalidation, not abandoning the cache." },
            { label: "Cache only positive (allowed) decisions, not denials.", correct: false, explanation: "This doesn't help — the security risk is in stale 'allowed' results. Caching only those is the worst of both worlds." },
          ]}
        />

        <Quiz
          kind="Gut check"
          question="A team is debating whether to add a Redis cache in front of an internal API that already has a 1ms p99 from a Postgres-backed Spring service. Cache lookup latency is also ~1ms. What's the right call?"
          options={[
            { label: "Add the cache — Redis is faster than Postgres.", correct: false, explanation: "Not in this case. 1ms vs 1ms is no win, and you've now added invalidation complexity, an extra failure mode, and another thing to operate." },
            { label: "Don't add the cache — there's no measurable latency win and the cost is real.", correct: true, explanation: "Right. The DB is already serving from its buffer cache at 1ms. A cache that doesn't beat the upstream by a meaningful margin is just complexity. The right answer: only add the cache if you measure a problem." },
            { label: "Add the cache with a 1-second TTL to minimize staleness.", correct: false, explanation: "TTL doesn't change the fundamental issue: same latency, more complexity, no benefit. 1-second TTL also means very low hit rate, making it even worse." },
            { label: "Replace Postgres with Redis as the system of record.", correct: false, explanation: "Wildly overengineered. Postgres is doing fine; the question was whether to add a cache, not switch databases. And losing transactions for 'maybe faster' is a bad trade." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Cache surgically, not reflexively. Read-heavy + tolerates staleness + slow upstream + high hit rate. Authorization, configuration, and computed aggregates are the sweet spot."
          points={[
            { takeaway: "Caching has a real cost — invalidation complexity, debugging time, memory.", detail: "Each cache should justify itself with a measured hit rate and latency win." },
            { takeaway: "Some data should not be cached.", detail: "Inventory, balances, anything where staleness causes correctness bugs. The DB exists for a reason." },
            { takeaway: "Multi-level caches walk down: browser → CDN → local → distributed → DB buffer.", detail: "Each layer has shorter TTLs and serves more local traffic. Costs compound; design each layer's invalidation deliberately." },
            { takeaway: "Authorization caches need event-driven invalidation, not just TTL.", detail: "Stale auth = security incident. Publish revoke events to evict caches immediately." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="caching-patterns" id="personalization" title="Personalization caching" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 4 — Personalization caching</h2>

        <p>
          Everything before this part assumed the cached value was the same for everyone — a product page, a config
          blob, an auth decision keyed on a single user. Personalization breaks that assumption. The cached payload
          now depends on <em>who is asking</em>, and sometimes on what device, locale, experiment bucket, and feature
          flags they happen to have today. The math gets ugly fast, and the patterns from Parts 1-3 still apply but
          need to be re-tuned around cardinality.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Global vs per-user: the cardinality spectrum</h3>
        <p>
          Cache one entry that covers everyone — a homepage HTML fragment, a top-10 trending list — and you get a
          near-100% hit rate from a single key. Memory is trivial, latency is great, life is good. Now make that
          fragment personalized. Each user gets their own entry. With 100M DAU and a 10KB payload per user, you
          are sitting on roughly 1TB of cached state. That is no longer a single Redis node; that is a sharded
          cluster with replication, eviction policies, and an on-call rotation.
        </p>

        <ul>
          <li><strong>Global cache:</strong> 1 entry, ~100% hit rate, KB of memory. Good for anything that does not depend on identity.</li>
          <li><strong>Per-user cache:</strong> N entries, hit rate bounded by user re-visit rate. Memory grows linearly with active users.</li>
          <li><strong>Per-user × per-context cache:</strong> N × M entries. Memory and miss rate both go through the roof if M is not controlled.</li>
        </ul>

        <Callout variant="insight" title="Run the numbers before you cache per-user">
          <p className="m-0">
            Per-user caching only makes sense if a user re-reads their own data within the TTL window. If your average
            user logs in twice a week and the TTL is 5 minutes, your hit rate is essentially zero — you are paying for
            memory and getting no latency win. Either widen the TTL, narrow the audience (cache only for active users),
            or stop personalizing that surface.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Cache key cardinality explosion</h3>
        <p>
          The seductive bug: you start with <code>feed:userId</code>, then someone asks for a locale-aware variant,
          then a device-class split, then an A/B experiment, then a feature flag set. Each dimension multiplies the
          key space. Five dimensions with even modest cardinality (say 10 each) blow your namespace up by 100,000x.
          Most of those keys are read once and never again, so your cache becomes a write-only data structure with a
          hit rate that asymptotes to zero.
        </p>
        <p>
          The anti-pattern is putting <em>every</em> request parameter into the key. The pattern is to be deliberate
          about which dimensions actually change the response, and hash the rest into a single bounded fingerprint:
        </p>

        <CodeBlock lang="java" caption="Bounded cache keys — explicit dimensions, hashed context fingerprint">{`public String cacheKey(long userId, RequestContext ctx) {
    // Explicit dimensions that actually change the response.
    String locale = ctx.locale();                 // ~50 values
    String deviceClass = ctx.deviceClass();       // 3 values: mobile, tablet, desktop

    // Everything else (experiment bucket, flag set, app version, etc.)
    // gets folded into a single short fingerprint. This caps cardinality.
    String fingerprint = ctx.experimentBucket() + "|" + ctx.flagSetId();
    String fp = Hashing.murmur3_32_fixed()
        .hashString(fingerprint, StandardCharsets.UTF_8)
        .toString();   // 8 hex chars

    return "feed:" + userId + ":" + locale + ":" + deviceClass + ":" + fp;
}`}</CodeBlock>

        <p>
          The fingerprint approach has a tradeoff: when an experiment ships, you invalidate by changing the
          <code> flagSetId</code> globally, which evicts everyone&apos;s personalized entry at once. That is fine
          (and often desirable — see TTL section below), but it does mean you take a load spike on rollout. Plan for it.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">Cold start</h3>
        <p>
          The first request from a new user is, by definition, a cache miss. If your personalized response takes
          800ms to compute end-to-end, that user&apos;s first impression is an 800ms blank screen. Three mitigations,
          in increasing order of complexity:
        </p>
        <ol>
          <li><strong>Pre-warm on signup.</strong> Kick a background job when the account is created. By the time the user lands on the home feed, the cache is already populated. Works well for predictable post-signup flows.</li>
          <li><strong>Serve the global fallback.</strong> Render the &quot;popular for everyone&quot; feed for new users until you have enough signal to personalize. This doubles as a cold-start solution and as the answer to the new-user model problem in any recommender system.</li>
          <li><strong>Async upgrade.</strong> Send the global feed immediately, then push or poll for the personalized version and swap it in client-side. Faster first byte, slightly more frontend complexity.</li>
        </ol>
        <p>
          The tradeoff is real: faster first byte versus less personalized first impression. Most teams default to
          option 2 with a planned upgrade to option 3 once they have the infra to support it.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">TTL strategy for personalized data</h3>
        <p>
          Personalization data has a wider range of natural lifetimes than the data we cached in Part 2. Match the
          TTL to the actual rate of change, not to an arbitrary default:
        </p>
        <ul>
          <li><strong>Active session caches</strong> (feed, recommendations, search ranking) — 60s to 5 minutes. The user is browsing, signals are arriving, you want personalization to feel responsive to recent clicks.</li>
          <li><strong>Stable preferences</strong> (language, theme, notification settings) — hours. These change rarely and are usually edited via a single endpoint where you can invalidate explicitly.</li>
          <li><strong>Long-tail profile features</strong> (interest vectors, demographic estimates) — hours to a day. Computed by an offline job; the cache TTL just needs to outlive the gap between job runs.</li>
        </ul>

        <Callout variant="warn" title="Never TTL forever">
          <p className="m-0">
            Even when the underlying data is genuinely stable, cap the TTL at something like 24 hours. The reason is
            operational: you will, eventually, deploy a bug that writes corrupt or inappropriate data to the cache.
            When that happens you need a way to flush the bad entries that does not require running a script across
            the whole cluster. A finite TTL means &quot;wait one cycle and the bad data ages out on its own.&quot;
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">The hot user problem</h3>
        <p>
          User traffic is not uniformly distributed. A celebrity, a popular brand account, or an internal admin user
          can attract 1000x the read traffic of a normal user. Their per-user cache entry becomes a hot key, and a
          single Redis node ends up serving an outsized share of the cluster&apos;s requests. CPU on that one node
          saturates while the others sit idle. (We will dig into hot-key mechanics in the next module on distributed
          cache architecture.)
        </p>
        <p>
          Three mitigations, often combined:
        </p>
        <ul>
          <li><strong>Replicate hot keys to N nodes.</strong> Detect keys above a traffic threshold and write copies to several shards. Reads pick a random copy. Memory cost is N×, but per-node load is 1/N×.</li>
          <li><strong>Client-side cache for top-K hot users.</strong> Each app instance keeps an in-process Caffeine cache of the few hundred hottest user IDs. Sub-microsecond reads, no Redis hop. Pair with pub/sub invalidation as covered in Part 3.</li>
          <li><strong>Don&apos;t personalize at all for these accounts.</strong> A celebrity feed is read by millions of strangers; personalizing the celebrity-side response makes no sense. Serve the global, denormalized version and skip the per-user computation.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Stale-while-revalidate for personalization</h3>
        <p>
          The most useful pattern in this entire section. The idea: when a personalized cache entry is past its
          freshness threshold but still within its hard TTL, serve the stale value immediately and trigger an async
          recompute in the background. The current request gets fast latency; the next request gets fresh data.
          The user never sees a miss-on-hot-key delay.
        </p>
        <p>
          Caffeine has first-class support for this via <code>refreshAfterWrite</code>, separate from
          <code> expireAfterWrite</code>. When a key is older than the refresh threshold but younger than the
          expiry threshold, the next read returns the stale value and schedules a background reload through the
          configured <code>CacheLoader</code>.
        </p>

        <CodeBlock lang="java" caption="Caffeine: per-user personalization with refresh-after-write">{`@Configuration
public class PersonalizationCacheConfig {

    @Bean
    public LoadingCache<String, FeedPayload> personalizedFeedCache(FeedComputeService compute) {
        return Caffeine.newBuilder()
            .maximumSize(100_000)                              // bound memory
            .expireAfterWrite(Duration.ofMinutes(10))          // hard TTL
            .refreshAfterWrite(Duration.ofMinutes(1))          // serve stale, refresh async
            .recordStats()
            .build(key -> compute.computeFeed(key));           // CacheLoader
    }
}

@Service
public class FeedService {
    @Autowired LoadingCache<String, FeedPayload> cache;

    public FeedPayload getFeed(long userId, RequestContext ctx) {
        return cache.get(cacheKey(userId, ctx));   // never blocks on stale-but-not-expired
    }
}`}</CodeBlock>

        <p>
          The mechanics: a read between minute 1 and minute 10 returns instantly with the existing value, and
          Caffeine schedules <code>compute.computeFeed</code> on its executor. The next read sees the refreshed
          value. Past minute 10, the entry is fully evicted and the next read blocks on a fresh computation.
        </p>

        <Callout variant="spring" title="Spring's @Cacheable doesn't do refresh-after-write">
          <p className="m-0">
            <code>@Cacheable</code> gives you cache-aside with TTL, but it does not have a built-in stale-while-revalidate.
            For personalization you typically reach for a <code>LoadingCache</code> directly (Caffeine in-process, or a
            Redis-backed equivalent like Caffeine&apos;s async loaders fronting a <code>RedisTemplate</code>). Some teams
            also approximate it with a scheduled <code>@Scheduled</code> job that rewarms hot keys before they expire.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your team caches a personalized recommendations feed per user, keyed on (userId, locale, deviceClass, experimentBucket, flagSetId, appVersion, abTestArm, sessionType). The cache has a 65% hit rate in load tests but only 4% in production. What is the most likely cause and the right first move?"
          options={[
            { label: "Production has more users than load tests — increase the cache size.", correct: false, explanation: "More users alone would not crater the hit rate from 65% to 4%. Memory pressure shows up as evictions, not as keys-never-matching. The shape of the problem is cardinality, not capacity." },
            { label: "The key has too many dimensions; in production, real users hit unique combinations of locale × experiment × flagSet × version × testArm × sessionType, so the same logical request rarely produces the same key twice.", correct: true, explanation: "Classic cardinality explosion. Load tests use a small synthetic matrix, so combinations repeat. Production has the full combinatorial blowup, and most cached entries are read once and never re-hit. Fix: enumerate the dimensions that actually change the response (probably 2-3 of the 8) and fold the rest into a single hashed context fingerprint that changes only when those flags actually flip globally." },
            { label: "Redis is evicting entries because of network pressure between app and cache.", correct: false, explanation: "Network pressure causes timeouts and connection errors, not stable low hit rates. The symptom — consistent 4% hit rate, not flaky — points at the keys, not the transport." },
            { label: "TTL is too short — increase it from 5 minutes to 1 hour.", correct: false, explanation: "Longer TTLs help if entries are being evicted before re-read, but if every request produces a new key the TTL is irrelevant. Fix the cardinality first; only then revisit TTL." },
          ]}
        />

        <PartRecap
          title="Part 4 recap"
          gist="Personalization breaks the global-cache assumption. Watch cardinality, plan for cold start, match TTL to data lifetime, defang hot users, and use stale-while-revalidate to hide miss latency."
          points={[
            { takeaway: "Per-user cache memory scales with active users — do the math before you build.", detail: "100M DAU × 10KB = 1TB. That is a Redis cluster, not a single node. Justify the per-user cost, or stay global." },
            { takeaway: "Cardinality explodes when you put every request param in the key.", detail: "Enumerate the 2-3 dimensions that actually change the response; hash the rest into a context fingerprint." },
            { takeaway: "Cold start is a UX problem, not a cache problem.", detail: "Pre-warm on signup, fall back to a global feed, or async-upgrade after first byte. Pick based on tolerance for empty-feed first impressions." },
            { takeaway: "Hot users break uniform-distribution assumptions.", detail: "Replicate their entries across nodes, serve from a top-K local cache, or skip personalization for celebrity-style accounts entirely." },
            { takeaway: "Stale-while-revalidate is the personalization superpower.", detail: "Caffeine's refreshAfterWrite gives you instant reads plus async refresh, with no extra plumbing. Use it for any per-user payload that takes >50ms to compute." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-3">What this didn&apos;t cover</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>Redis-specific architecture (single, sentinel, cluster) — that&apos;s the next module.</li>
          <li>Hot keys, thundering herd, and the operational realities of running a distributed cache at scale — also next module.</li>
          <li>HTTP-level caching (Cache-Control, ETag, Vary) — relevant but a different layer of the stack.</li>
          <li>Search-index caching and how Elasticsearch handles it natively.</li>
        </ul>
      </section>

      <section className="my-12 text-center">
        <p className="text-sm text-slate-500 mb-2">Next up</p>
        <Link href="/courses/system-design/modules/distributed-cache-deep" className="inline-block text-lg font-semibold text-cyan-600 hover:underline">
          Distributed caches deep dive: Redis architecture, hot keys, and operations →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="caching-patterns" />
    </article>
  );
}
