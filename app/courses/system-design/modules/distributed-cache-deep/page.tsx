import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleProgress from "@/components/ModuleProgress";
import Checkpoint from "@/components/Checkpoint";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "redis-arch", title: "Redis architecture" },
  { id: "hot-keys", title: "Hot keys & herd" },
  { id: "operations", title: "Operations" },
];

const redisClusterDiagram = `flowchart TB
  C[Client] -->|key 'order:42' → slot 12539| M1
  subgraph Cluster["Redis Cluster · 16384 hash slots"]
    direction LR
    subgraph S1["Slots 0..5460"]
      M1[(Master 1)] --> R1[(Replica)]
    end
    subgraph S2["Slots 5461..10922"]
      M2[(Master 2)] --> R2[(Replica)]
    end
    subgraph S3["Slots 10923..16383"]
      M3[(Master 3)] --> R3[(Replica)]
    end
  end
  style M1 fill:#fee2e2,stroke:#b91c1c
  style M2 fill:#fee2e2,stroke:#b91c1c
  style M3 fill:#fee2e2,stroke:#b91c1c
  style R1 fill:#dbeafe,stroke:#1e40af
  style R2 fill:#dbeafe,stroke:#1e40af
  style R3 fill:#dbeafe,stroke:#1e40af`;

const sentinelDiagram = `flowchart LR
  App[App] -->|writes| M[(Master)]
  App -->|reads| R1[(Replica 1)]
  App -->|reads| R2[(Replica 2)]
  M -.replicates.-> R1
  M -.replicates.-> R2
  S1((Sentinel)) -.monitors.-> M
  S2((Sentinel)) -.monitors.-> M
  S3((Sentinel)) -.monitors.-> M
  S1 <-->|gossip| S2
  S2 <-->|gossip| S3
  S1 <-->|gossip| S3
  style M fill:#fee2e2,stroke:#b91c1c
  style R1 fill:#dbeafe,stroke:#1e40af
  style R2 fill:#dbeafe,stroke:#1e40af`;

export default function Page() {
  const mod = getModuleBySlug("distributed-cache-deep")!;

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
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="distributed-cache-deep" />
        <ModuleProgress moduleSlug="distributed-cache-deep" checkpoints={CHECKPOINTS} />
      </header>

      <section className="my-10">
        <h2 className="text-2xl font-semibold mb-4">What you&apos;ll walk out with</h2>
        <ul className="space-y-2">
          <li>Redis topologies (single, sentinel, cluster) and when each one is the right call.</li>
          <li>Spring&apos;s <code>@Cacheable</code> stack and when to drop down to <code>RedisTemplate</code>.</li>
          <li>Hot keys, thundering herds, and the actual mitigations (not just &quot;use a CDN&quot;).</li>
          <li>What happens when a Redis cache fails — eviction policies, persistence, and the ops realities of running it in production.</li>
        </ul>
      </section>

      <section className="my-10">
        <p>
          Caching patterns (cache-aside, write-through, etc.) tell you the <em>shape</em>{" "}of caching. This module is
          about the <em>operational reality</em>{" "}of running a distributed cache. Redis is by far the most common one, so
          most examples here are Redis. The principles transfer to Memcached, Hazelcast, Aerospike, and friends.
        </p>
        <p>
          The big mental shift: a distributed cache is a piece of infrastructure you operate. It has failure modes.
          It has scaling limits. It runs out of memory. It gets slow when one key gets popular. Treating it as a
          magic faster-than-the-DB box is exactly how you build the next outage.
        </p>
      </section>

      <Checkpoint moduleSlug="distributed-cache-deep" id="redis-arch" title="Redis architecture" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 1 — Redis architecture &amp; Spring integration</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">Three deployment shapes</h3>

        <p><strong>1. Single instance.</strong>{" "}One Redis process. Fast, simple, single point of failure. Fine for dev or for caches where losing the cache means falling back to the DB and shrugging.</p>

        <p><strong>2. Sentinel (high availability).</strong>{" "}One master, several replicas, three or more sentinel processes monitoring everyone. Sentinels gossip among themselves; if a quorum agrees the master is dead, they promote a replica. Clients connect through the sentinels to find the current master.</p>

        <Mermaid chart={sentinelDiagram} />

        <p>
          <strong>When sentinel is the right call:</strong>{" "}data fits in one master&apos;s memory (call it &lt;200GB),
          you want HA but not horizontal scale. The whole dataset lives on one master; replicas are for reads and
          failover.
        </p>

        <p><strong>3. Cluster (sharded).</strong>{" "}Data is split into 16384 hash slots distributed across master nodes. Each master has its own replicas. Clients understand the slot layout and route directly to the right master.</p>

        <Mermaid chart={redisClusterDiagram} />

        <p>
          <strong>When cluster is the right call:</strong>{" "}dataset doesn&apos;t fit in one master, or write throughput
          exceeds one master&apos;s capacity. Cluster gives you horizontal scale at the cost of: no multi-key operations
          across slots, transactions only within a slot, MGET fans out to all involved nodes.
        </p>

        <Callout variant="info" title="Hash tags pin keys to the same slot">
          <p className="m-0">
            If you need keys to live on the same node (so you can MGET them or transact on them), wrap a portion of
            the key in <code>{"{...}"}</code>. <code>user:{`{42}`}:profile</code> and <code>user:{`{42}`}:settings</code>
            both hash on <code>42</code>, so they land on the same slot. Use sparingly — abuse breaks the whole
            distribution model.
          </p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Your team's Redis dataset is 60GB and growing 10% per month. Read traffic is 80k QPS, writes are 5k QPS. The current setup is a single 128GB instance. What's the next move?"
          options={[
            { label: "Move to Redis Cluster immediately — 60GB is too much for one node.", correct: false, explanation: "60GB is fine for one Redis instance. The bigger box has plenty of headroom. Cluster has real ergonomic costs (no cross-slot operations) — only adopt it when needed." },
            { label: "Move to Sentinel: replicas for HA, master handles writes, replicas absorb read traffic.", correct: true, explanation: "Sentinel gives you HA and read scaling without the cluster ergonomic costs. 80k reads / 5k writes is replica territory. You'd want maybe 3 replicas to spread the read load. When the dataset crosses ~150GB or writes exceed ~50k QPS, then revisit cluster." },
            { label: "Stay single-instance and hope the master never dies.", correct: false, explanation: "At 80k QPS, an outage is going to be very visible. HA isn't optional at this scale." },
            { label: "Switch to Memcached.", correct: false, explanation: "Memcached has even thinner HA story than single-instance Redis. Switching tools doesn't address the HA gap." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Spring integration: @Cacheable vs RedisTemplate</h3>

        <p>Spring offers two integration levels:</p>

        <p><strong>@Cacheable / @CacheEvict (annotation-based).</strong>{" "}Highest level. You annotate a service method, Spring wraps it in cache-aside logic. Easy, opinionated.</p>

        <CodeBlock lang="java" caption="@Cacheable — cache-aside in 4 lines">{`@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory cf) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .disableCachingNullValues();    // or enable for negative caching
        return RedisCacheManager.builder(cf).cacheDefaults(config).build();
    }
}

@Service
public class UserService {
    @Cacheable(value = "users", key = "#id")
    public User getById(long id) {
        return repo.findById(id).orElseThrow();
    }

    @CacheEvict(value = "users", key = "#user.id")
    public User update(User user) {
        return repo.save(user);
    }
}`}</CodeBlock>

        <p><strong>RedisTemplate (manual).</strong>{" "}Low level. You call <code>redis.opsForValue().get(...)</code> yourself. More code, more control — necessary for negative caching, jitter, stampede protection, multi-key operations, pub/sub.</p>

        <CodeBlock lang="java" caption="RedisTemplate — when you need control">{`@Service
public class UserService {
    @Autowired RedisTemplate<String, User> redis;
    @Autowired UserRepository repo;

    public User getById(long id) {
        String key = "user:" + id;
        User cached = redis.opsForValue().get(key);
        if (cached != null) return cached;

        User fresh = repo.findById(id).orElseThrow();
        // jitter the TTL to avoid synchronized expiry stampedes
        long jitterMs = 5 * 60_000 + ThreadLocalRandom.current().nextLong(-30_000, 30_000);
        redis.opsForValue().set(key, fresh, Duration.ofMillis(jitterMs));
        return fresh;
    }

    public List<User> getMany(List<Long> ids) {
        List<String> keys = ids.stream().map(id -> "user:" + id).toList();
        List<User> cached = redis.opsForValue().multiGet(keys);   // single round trip
        // ... fill misses from DB, populate, return ...
    }
}`}</CodeBlock>

        <Callout variant="spring" title="Use the right tool">
          <p className="m-0">
            Default to <code>@Cacheable</code> for boring cache-aside on single-key reads. Drop down to
            <code> RedisTemplate</code> when you need multi-key operations (MGET, pipelining), TTL jitter,
            stampede locks, pub/sub, or anything Redis-specific (sorted sets for leaderboards, streams for queues,
            HyperLogLog for cardinality). One project can — and usually does — use both.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="A team uses @Cacheable everywhere and has tuned it for 6 months. They're now adding a feature that needs to fetch 100 user profiles in one request. What's the right move?"
          options={[
            { label: "Loop with @Cacheable — Spring handles the cache lookups.", correct: false, explanation: "100 sequential cache lookups = 100 network round trips to Redis. At 1ms each that's 100ms of pure latency. There's a much better way." },
            { label: "Drop down to RedisTemplate.opsForValue().multiGet() to fetch all 100 in one round trip, fill misses from DB.", correct: true, explanation: "Right. Multi-key operations are exactly the case where @Cacheable's per-call abstraction breaks down. MGET returns 100 values in one round trip. Fill the misses from DB, populate, return. This is the kind of thing you reach for RedisTemplate for." },
            { label: "Add a local cache in front of Redis to avoid the round trips.", correct: false, explanation: "Local caches help, but they don't fix the underlying issue and they introduce their own staleness problem. MGET is the targeted fix." },
            { label: "Cache the whole list as one entry: 'top-100-users' with the joined result.", correct: false, explanation: "If the input set varies per request (which user_ids you fetch), you can't pre-cache the joined result. MGET is more flexible." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Single instance for dev/non-critical. Sentinel for HA without sharding. Cluster when you need horizontal scale. @Cacheable for boring cases, RedisTemplate when you need control."
          points={[
            { takeaway: "Three Redis topologies map to three operational regimes.", detail: "Single is fine for non-critical. Sentinel is HA + read scale. Cluster is shard + scale at the cost of multi-key ergonomics." },
            { takeaway: "@Cacheable is the high-level API; RedisTemplate is the escape hatch.", detail: "Use both: annotations for 80% of cases, manual ops for multi-key, jitter, stampede protection." },
            { takeaway: "Hash tags ({...}) pin keys to the same cluster slot.", detail: "Necessary for multi-key operations on a cluster. Use sparingly to keep distribution healthy." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="distributed-cache-deep" id="hot-keys" title="Hot keys & herd" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 2 — Hot keys, thundering herd, and big keys</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">The hot key problem</h3>
        <p>
          Consistent hashing distributes keys across nodes. It does not distribute <em>traffic</em>{" "}across nodes.
          If one key (Beyoncé&apos;s profile, the homepage feed, today&apos;s big news article) is read millions of
          times more than other keys, the node owning it gets hammered.
        </p>
        <p>
          Symptoms: one Redis node at 95% CPU while others are at 10%. p99 on that node climbs into hundreds of
          milliseconds. The cluster looks healthy by aggregate metrics; the experience is bad.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Three real mitigations</h3>

        <p><strong>1. Replicate the hot key to multiple nodes (read-side fan-out).</strong>{" "}Store <code>hotkey#1</code>, <code>hotkey#2</code>, …, <code>hotkey#10</code> all with the same value. Readers pick a random suffix per request. The load spreads across 10 keys, which the cluster spreads across (up to) 10 nodes. Updates are 10x more work.</p>

        <p><strong>2. Local in-process cache for hot keys.</strong>{" "}Put a Caffeine cache in front of Redis with a tiny TTL (1–10 seconds). Hot keys hit the local cache 99.9% of the time and never hit Redis. Each app instance has its own copy; staleness window is at most the TTL.</p>

        <p><strong>3. Detect and tier.</strong>{" "}Redis 6.0 added client-side caching with invalidation messages — clients keep their own copy and Redis tells them when to evict. Effectively automatic local caching with cluster-driven invalidation.</p>

        <Callout variant="warn" title="Consistent hashing does not fix this">
          <p className="m-0">
            A common interview answer to &quot;hot key&quot; is &quot;use consistent hashing.&quot; It&apos;s wrong.
            Consistent hashing decides where a key lives — once it&apos;s decided, all reads of that key go to one node.
            The fix is to make there be more than one place to read from (replication, local cache) or to spread
            <em>the key</em>{" "}across nodes (suffixing). Algorithms that distribute keys don&apos;t help when the skew is on
            a single key.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Thundering herd on cache miss</h3>
        <p>
          Hot key + cache expiry is the cache stampede recipe. Take a key being read 10,000 times per second. TTL
          expires. In the next 100ms, 1,000 concurrent requests all miss the cache. All 1,000 hit the DB. The DB sees
          a 1,000x spike. The repopulation happens 1,000 times.
        </p>

        <p>The mitigations stack on each other:</p>

        <p><strong>Per-key recompute lock.</strong>{" "}First miss acquires a distributed lock (<code>SET lock:KEY NX EX 5</code>). It refills. Other concurrent misses see the lock, wait briefly, retry. Lock expires automatically if the holder dies. This is the most common pattern.</p>

        <CodeBlock lang="java" caption="Stampede protection: distributed lock on refill">{`public User getHot(long id) {
    String key = "user:" + id;
    User cached = redis.opsForValue().get(key);
    if (cached != null) return cached;

    String lockKey = "lock:" + key;
    Boolean acquired = redis.opsForValue().setIfAbsent(lockKey, "1", Duration.ofSeconds(5));

    if (Boolean.TRUE.equals(acquired)) {
        try {
            User fresh = repo.findById(id).orElseThrow();
            redis.opsForValue().set(key, fresh, jitter(Duration.ofMinutes(5)));
            return fresh;
        } finally {
            redis.delete(lockKey);
        }
    }

    // Another thread is refilling. Wait briefly and retry the cache.
    for (int i = 0; i < 5; i++) {
        Thread.sleep(20);
        cached = redis.opsForValue().get(key);
        if (cached != null) return cached;
    }
    // Last resort: hit the DB. Better one extra DB hit than failing the user.
    return repo.findById(id).orElseThrow();
}`}</CodeBlock>

        <p><strong>Probabilistic early refresh.</strong>{" "}When reading a key, with some small probability that grows as expiry approaches, refresh the value <em>before</em>{" "}it&apos;s actually expired. Hot keys end up refreshed continuously by a small fraction of readers; cold keys mostly expire normally. Beautiful when it fits.</p>

        <p><strong>Stale-while-revalidate.</strong>{" "}When a key has expired, serve the stale value to readers while one reader refreshes in the background. No miss is ever visible to users. Requires keeping the stale value around past TTL with a separate &quot;stale-allowed&quot; window.</p>

        <Quiz
          kind="Quick check"
          question="A homepage cache with a 60-second TTL is hit 50k times per second. When it expires, the database briefly sees a spike of 5k QPS as concurrent requests miss. What's the simplest fix?"
          options={[
            { label: "Increase the TTL to 5 minutes.", correct: false, explanation: "Reduces frequency of stampedes, doesn't eliminate them. The fix should be structural." },
            { label: "Add a per-key recompute lock so only one request refills on miss; others wait briefly and retry.", correct: true, explanation: "Right. The lock guarantees only one DB hit per refill regardless of concurrent miss count. Simple, well-understood, works. Stale-while-revalidate is even better but more code." },
            { label: "Add more application instances.", correct: false, explanation: "More instances means more concurrent misses, not fewer. This makes it worse." },
            { label: "Move to a Redis cluster.", correct: false, explanation: "Cluster doesn't fix stampedes; the same key still has one owner and the same expiry behavior." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Big keys: the silent killer</h3>
        <p>
          Big keys (anything &gt;100KB, definitely anything &gt;1MB) cause problems even if traffic is moderate:
        </p>
        <ul>
          <li><strong>Network burst.</strong>{" "}A 10MB GET ties up the connection for tens of milliseconds. Other commands queue behind it.</li>
          <li><strong>Single-threaded blocking.</strong>{" "}Redis is mostly single-threaded. Serializing a big value blocks every other operation on that node.</li>
          <li><strong>Cluster migration pain.</strong>{" "}When resharding, big keys move slowly and cause visible latency hiccups.</li>
          <li><strong>Memory fragmentation.</strong>{" "}Big allocations are harder for the allocator to recycle.</li>
        </ul>
        <p>
          The fix is usually structural: split the value. A user&apos;s 1MB feed shouldn&apos;t be one key —
          split it into pages (<code>feed:42:page:0</code>, <code>feed:42:page:1</code>) and fetch only what&apos;s
          needed. Use Redis&apos;s data structures (hashes, lists, sorted sets) instead of one big serialized blob.
        </p>

        <Callout variant="info" title="Find big keys with redis-cli --bigkeys">
          <p className="m-0">
            <code>redis-cli --bigkeys</code> samples your keyspace and reports the largest key per type. Run it
            during off-peak. Anything over 1MB warrants a conversation; anything over 10MB is a bug.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="A team's Redis p99 latency randomly spikes to 200ms a few times per hour. CPU is moderate, network has headroom, no obvious traffic spikes. What should they look at first?"
          options={[
            { label: "Big keys — a single large GET or SERIALIZE blocks everything else.", correct: true, explanation: "Classic profile: occasional spikes with no obvious correlation. Big keys block the single-threaded event loop. Run --bigkeys, look for outliers, restructure them. This is the boring answer that's almost always right." },
            { label: "Network packet loss.", correct: false, explanation: "Possible but would usually correlate with broader infrastructure issues. Big keys are statistically more likely with the symptom described." },
            { label: "Redis is corrupting data.", correct: false, explanation: "Not the symptom. Latency spikes without errors mean blocking, not corruption." },
            { label: "Spring is pooling too few connections.", correct: false, explanation: "Connection pool exhaustion would cause wait times on the client side, not Redis-side latency. Possible but secondary." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Hot keys need replication or local caching. Stampedes need a per-key lock or stale-while-revalidate. Big keys silently kill latency — find them with --bigkeys."
          points={[
            { takeaway: "Hot keys are skew, not distribution.", detail: "Consistent hashing won't save you. Replicate hot keys across multiple keys, or cache locally with short TTL." },
            { takeaway: "Stampedes need explicit protection.", detail: "Per-key lock is the simple fix; stale-while-revalidate is the better one. Probabilistic early refresh is the elegant one." },
            { takeaway: "Big keys block everything else.", detail: "Redis is single-threaded for the event loop. A 10MB GET ties up the connection. Split into structured data (hashes, lists)." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="distributed-cache-deep" id="operations" title="Operations" xp={25}>
        <h2 className="text-2xl font-semibold mb-4">Part 3 — Operational realities</h2>

        <h3 className="text-xl font-semibold mt-4 mb-3">Eviction policies</h3>
        <p>
          A cache with a memory limit needs a policy for what to evict when full. Redis offers eight policies; in
          practice you pick from three:
        </p>
        <ul>
          <li><strong>allkeys-lru:</strong>{" "}evict least-recently-used across all keys. The default for caches.</li>
          <li><strong>allkeys-lfu:</strong>{" "}evict least-frequently-used. Better when your hot set is stable but small.</li>
          <li><strong>noeviction:</strong>{" "}reject writes when full. Use only when Redis is your system of record (which it shouldn&apos;t be for cache use cases).</li>
        </ul>

        <Callout variant="warn" title="Always set maxmemory">
          <p className="m-0">
            If you don&apos;t set <code>maxmemory</code>, Redis uses unbounded memory. When the OS runs out, the OOM
            killer takes Redis. Always set <code>maxmemory</code> to ~80% of host RAM and pick an eviction policy.
            <code>maxmemory 50gb</code> + <code>maxmemory-policy allkeys-lru</code> is a sane default.
          </p>
        </Callout>

        <h3 className="text-xl font-semibold mt-8 mb-3">Persistence: RDB vs AOF</h3>
        <p>
          Caches don&apos;t strictly need persistence — losing the cache means falling back to the DB. But warm-up time
          matters. Cold cache after restart = DB stampede.
        </p>
        <ul>
          <li><strong>RDB (snapshot):</strong>{" "}periodic point-in-time dumps. Small files, fast load. Lose minutes of writes on crash.</li>
          <li><strong>AOF (append-only file):</strong>{" "}log every write. Bigger files, slower load. Lose seconds of writes on crash.</li>
          <li><strong>Both:</strong>{" "}RDB for warm-up, AOF for durability. Common in production.</li>
        </ul>
        <p>
          For pure caches, RDB every 5 minutes is usually fine — you accept losing a few minutes of cache on crash
          because the cost of warm-up + DB pressure is the actual concern, not the cached values themselves.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3">What happens when Redis dies</h3>
        <p>
          You should know exactly what your service does when Redis is unreachable. Two failure modes:
        </p>

        <p><strong>Total outage.</strong>{" "}Redis is gone. The application falls through to the DB on every request. If the DB can handle it: great, slow but functional. If the DB can&apos;t: cascading failure. <em>Test this</em>. In load tests. With Redis stopped. Find out before production does.</p>

        <p><strong>Slow / partial outage.</strong>{" "}Redis is up but slow (1s p99 instead of 1ms). This is worse than total outage because every request waits 1s for the cache before falling through. Set tight client timeouts (50–100ms) so a sick Redis doesn&apos;t drag the whole system down.</p>

        <CodeBlock lang="java" caption="Tight Redis client timeouts in Spring">{`@Bean
public LettuceConnectionFactory redisConnectionFactory() {
    LettucePoolingClientConfiguration clientConfig = LettucePoolingClientConfiguration.builder()
        .commandTimeout(Duration.ofMillis(100))
        .shutdownTimeout(Duration.ofMillis(200))
        .clientOptions(ClientOptions.builder()
            .timeoutOptions(TimeoutOptions.enabled(Duration.ofMillis(100)))
            .build())
        .build();

    RedisStandaloneConfiguration serverConfig = new RedisStandaloneConfiguration("redis.prod", 6379);
    return new LettuceConnectionFactory(serverConfig, clientConfig);
}

// In the service: catch and fall through, don't propagate
public User get(long id) {
    try {
        User cached = redis.opsForValue().get("user:" + id);
        if (cached != null) return cached;
    } catch (RedisCommandTimeoutException | RedisConnectionFailureException e) {
        meter.counter("cache.fallthrough", "reason", e.getClass().getSimpleName()).increment();
        // Fall through to DB
    }
    return repo.findById(id).orElseThrow();
}`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="During a Redis outage, your application's p99 latency jumps from 50ms to 8 seconds, even though the DB still responds in 5ms. What's the most likely cause?"
          options={[
            { label: "The DB is overloaded by the fallthrough traffic.", correct: false, explanation: "If the DB still responds in 5ms, it's not overloaded. Look elsewhere." },
            { label: "Redis client timeouts are too long, so every cache call waits seconds before falling through.", correct: true, explanation: "Right. Default Lettuce timeout is 60 seconds. Each request waits up to that long for Redis before the catch block falls through to the DB. Set timeouts in the 50–200ms range so a sick cache fails fast and the system stays usable." },
            { label: "The application is serializing requests to Redis.", correct: false, explanation: "Possible but less common than the timeout issue described in the symptom." },
            { label: "JVM garbage collection.", correct: false, explanation: "GC pauses don't usually correlate with cache outages. The timeout explanation is far more likely." },
          ]}
        />

        <h3 className="text-xl font-semibold mt-8 mb-3">Cache warming</h3>
        <p>
          Cold caches after restart are dangerous. Strategies:
        </p>
        <ul>
          <li><strong>RDB snapshot warm.</strong>{" "}Restart loads the snapshot. ~minutes for a 100GB cache. Easiest.</li>
          <li><strong>Replica promotion.</strong>{" "}Don&apos;t restart the master with cold cache; failover to a warm replica, then warm the old master as a new replica. No cold-cache window for clients.</li>
          <li><strong>Application-level warm-up.</strong>{" "}On startup, the application pre-populates known hot keys before serving traffic. Common for small &quot;known hot&quot; sets like top-N queries.</li>
          <li><strong>Slow rollout.</strong>{" "}Don&apos;t restart all cache nodes at once. Drain one, restart, let it warm naturally, move to the next.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3">Monitoring you actually need</h3>
        <ul>
          <li><strong>Hit rate.</strong>{" "}Hits / (hits + misses). &lt;50% means your cache is doing nothing useful.</li>
          <li><strong>Memory usage.</strong> % of maxmemory used. Approach 100% means evictions are happening.</li>
          <li><strong>Eviction rate.</strong>{" "}Keys evicted per second. Should be near zero in steady state; spikes mean memory pressure.</li>
          <li><strong>Slowlog.</strong>{" "}Commands taking &gt;10ms. Almost always big keys or expensive operations.</li>
          <li><strong>Connected clients.</strong>{" "}If this trends up unboundedly, you have a connection leak.</li>
          <li><strong>Replication lag.</strong>{" "}For replicas — same conversation as the database replication module.</li>
        </ul>

        <Callout variant="insight" title="The hit rate trap">
          <p className="m-0">
            A cache with a 99% hit rate and a 0.1ms hit latency seems great. But check the 1% miss latency: if that&apos;s 100ms,
            your effective average latency is 1.099ms — a 10x degradation hiding inside great-looking aggregate numbers.
            Plot p99 of the miss path separately. Make sure your stampede protection is working there.
          </p>
        </Callout>

        <Quiz
          kind="Gut check"
          question="A team's Redis hit rate has been steady at 95% for months. Suddenly drops to 60% over a week. What's the most useful first investigation step?"
          options={[
            { label: "Increase the maxmemory limit.", correct: false, explanation: "Premature. First understand <em>why</em> hit rate dropped. Could be many causes; throwing memory at it without diagnosis is a guess." },
            { label: "Look at eviction rate, key cardinality, and recent application changes.", correct: true, explanation: "Right. Hit rate drop = either (a) keys are being evicted before reread, or (b) the working set changed. Eviction rate tells you if (a) is happening. Cardinality / new key patterns / recent deploys tell you if (b) is the cause. Diagnose first, fix second." },
            { label: "Restart the cache.", correct: false, explanation: "Restart drops hit rate to 0% and triggers a stampede. Don't." },
            { label: "Switch eviction policy from LRU to LFU.", correct: false, explanation: "Possibly part of a fix, but only after understanding the root cause. Premature." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Set maxmemory + eviction policy. Persistence is for warm-up, not durability. Tight client timeouts. Test what happens when Redis dies — preferably before it does."
          points={[
            { takeaway: "maxmemory + allkeys-lru is the sane default.", detail: "Without limits, Redis grows until OOM. LRU is the right default for cache use cases." },
            { takeaway: "Cache outages should fail fast.", detail: "100ms client timeouts. Catch and fall through to DB. Test it under load. A slow cache is worse than a dead one." },
            { takeaway: "Cold caches are dangerous.", detail: "Use replica promotion or RDB snapshots to warm. Cold start under live load is how you take down the DB." },
            { takeaway: "Monitor hit rate, eviction rate, slowlog, and miss-path latency.", detail: "Aggregate hit rate hides miss-path pain. Plot the p99 of misses separately." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold mb-3">What this didn&apos;t cover</h2>
        <ul className="text-sm space-y-1.5 text-slate-700 dark:text-slate-300">
          <li>Redis Streams, Pub/Sub, and using Redis as a queue / messaging substrate.</li>
          <li>Memcached vs Redis tradeoffs in detail (Memcached: simpler, multi-threaded; Redis: richer data types, persistence).</li>
          <li>Aerospike, Hazelcast, and other distributed in-memory stores.</li>
          <li>Lua scripting for atomic multi-step operations on a single shard.</li>
        </ul>
      </section>

      <section className="my-12 text-center">
        <p className="text-sm text-slate-500 mb-2">Next up</p>
        <Link href="/courses/system-design/modules/search-systems" className="inline-block text-lg font-semibold text-cyan-600 hover:underline">
          Search systems: when LIKE &apos;%foo%&apos; isn&apos;t enough →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="distributed-cache-deep" />
    </article>
  );
}
