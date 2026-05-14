import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "reqs", title: "Requirements & estimation" },
  { id: "design", title: "High-level design" },
  { id: "deep", title: "Algorithms & failure modes" },
];

const rlArchitectureDiagram = `flowchart LR
  C[Client] -->|API request| GW[Edge Gateway<br/>Spring Cloud]
  GW -->|EVAL Lua| RC[(Redis Cluster<br/>sharded by key)]
  RC -->|allow / deny / Retry-After| GW
  GW -->|429 + headers| C
  GW -->|allowed| BE[Backend service]
  GW -. async metrics .- M[Prometheus]
  GW -. async logs .- L[Log pipeline]
  style RC fill:#fee2e2,stroke:#dc2626
  style GW fill:#dbeafe,stroke:#2563eb`;

export default function Page() {
  const mod = getModuleBySlug("design-rate-limiter")!;

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
        <BookmarkButton courseId="system-design" moduleSlug="design-rate-limiter" />
        <ModuleProgress moduleSlug="design-rate-limiter" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚦</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          A rate limiter that survives the actual production failure modes. The algorithm is the easy part — the production answer is in the Redis topology, the fail-open vs fail-closed decision, and what happens when one user&apos;s key gets hammered hard enough to melt a single Redis shard.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Token bucket via atomic Redis Lua, end-to-end working code</li>
          <li>Sliding window log vs sliding window counter — when each is worth it</li>
          <li>Distributed topology: shard by key, hot-key strategies, what fails first</li>
          <li>Fail-open vs fail-closed, and why fail-open is usually right</li>
          <li>Multi-region: per-region buckets vs central authority, the latency tax</li>
        </ul>
      </section>

      <section>
        <h2>Why this is a deceptive interview prompt</h2>
        <p>
          On the surface, a rate limiter is one of the simplest things in the system design canon. &quot;Limit user X to 100 requests per minute. Use Redis. Done.&quot; The interesting part isn&apos;t the algorithm — you covered that in the rate-limiting module. The interesting part is what the system does when <em>your rate limiter</em> is the thing under stress: hot keys, Redis flapping, multi-region drift, the difference between sliding-window precision and what you actually need.
        </p>
        <p>
          The right framing: a rate limiter is a piece of infrastructure that has to be <strong>more available than the service it protects</strong>. That single sentence shapes every decision — the storage backend, the failure mode, the topology, even the algorithm.
        </p>
      </section>

      <Checkpoint moduleSlug="design-rate-limiter" id="reqs" title="Part 1 · Requirements & estimation" xp={25}>
        <h2>What &quot;rate limiter&quot; actually means</h2>
        <p>
          The first job is to clarify scope. &quot;Rate limit our API&quot; can mean five different things depending on who&apos;s asking.
        </p>

        <h3>Functional requirements</h3>
        <ul>
          <li><strong>Multi-key</strong> — limit per <code>userId</code>, per IP, per <code>apiKey</code>, per route. Often more than one limit applies to a single request.</li>
          <li><strong>Multi-tier</strong> — typically two limits stack: a short window (10/sec) to catch bursts and a long window (1000/hour) to catch slow-drip abuse. Both must allow.</li>
          <li><strong>Standard 429 response</strong> with <code>Retry-After</code> header so well-behaved clients can back off correctly.</li>
          <li><strong>Configurable per-tier limits</strong> — free tier vs pro tier vs internal services have different ceilings; reload limits without restarting.</li>
          <li><strong>Observable</strong> — every decision should be logged (sampled) and counted, so we can tell whether limits are tuned correctly.</li>
        </ul>

        <h3>Non-functional requirements</h3>
        <ul>
          <li><strong>Decision latency under 1ms p99</strong> — this sits on every API request, including the fast ones. A 5ms rate limiter ruins your endpoint latency budget.</li>
          <li><strong>Higher availability than the protected service.</strong> If the rate limiter goes down, the API should still serve traffic (fail-open) rather than 503-ing every request.</li>
          <li><strong>Strong precision is not required.</strong> Allowing 105 requests when the limit is 100 because of a 1s boundary effect is fine. Allowing 10,000 because a counter never reset is not.</li>
          <li><strong>Multi-region.</strong> A user&apos;s requests can land in any region; the limit should apply globally, with some looseness acceptable for the latency win.</li>
        </ul>

        <h3>Back of the envelope</h3>
        <p>
          Concrete numbers tighten the design. Suppose we&apos;re fronting an API with 1M QPS at peak across 4 regions:
        </p>
        <ul>
          <li><strong>Limiter check QPS:</strong> 1M (one check per request) — possibly 2M if both per-user and per-IP limits stack.</li>
          <li><strong>Distinct keys:</strong> say 50M registered users. With expiring buckets, the working set in Redis is the set of keys touched in the last bucket window — usually 1-5M at any moment.</li>
          <li><strong>Memory per key:</strong> a token bucket needs about 100 bytes (last refill timestamp + token count + small overhead). 5M × 100B = 500MB of working data.</li>
          <li><strong>Redis topology:</strong> 500MB fits comfortably on a single Redis node, but at 1-2M QPS we shard for throughput, not capacity. A 6-node cluster handles ~300k QPS each comfortably.</li>
        </ul>

        <Callout variant="info" title="Where the latency budget actually goes">
          <p className="m-0">A rate limiter is not 0ms. It&apos;s typically: 0.2ms application overhead + 0.5ms Redis network round trip + 0.1ms Lua script execution = ~0.8ms p99 in a healthy system. That fits the 1ms budget but doesn&apos;t leave a lot of slack. Adding a second hop (e.g., calling a separate microservice that owns the limiter) easily blows past 5ms. This is why the limiter usually lives <em>in the gateway process</em>, not as a standalone service.</p>
        </Callout>

        <Quiz
          question="A junior on the team proposes building the rate limiter as its own microservice that the gateway calls over HTTP for every request. What's the senior pushback?"
          options={[
            { label: "It adds an extra network hop on the hot path of every API call. Even at 1ms per hop, that doubles or triples decision latency. The limiter belongs in-process at the gateway, talking directly to Redis — not behind another service boundary.", correct: true, explanation: "Right. Every cross-process hop costs 0.5-1ms minimum. For a thing that runs on every request, that's significant. Production rate limiters are libraries the gateway loads and uses, not separate services." },
            { label: "It violates microservice boundaries — auth and rate limiting must be in the same service.", explanation: "There's no rule like that; auth and rate limiting are often separate services in production. The real issue is the latency cost of the extra hop, not service boundaries." },
            { label: "Microservices can't share Redis without conflicts.", explanation: "They can absolutely share Redis. The issue is the additional hop, not the storage backend." },
            { label: "It can't be horizontally scaled — only the gateway can.", explanation: "A standalone rate-limiter service can scale horizontally. The real cost is the latency of an extra round trip." },
          ]}
          hint="How many milliseconds does an extra service hop add on the hot path?"
          xp={7}
        />

        <Quiz
          question="The interviewer asks: 'How precise does the rate limit need to be? Is it OK to allow 105 requests when the limit is 100?' What's the right framing?"
          options={[
            { label: "For abuse and cost-control purposes, ±5% is almost always fine — the goal is to bound the worst case, not enforce a precise count. Strict precision means an O(N) sliding-window log, and you pay real memory and CPU for what's usually invisible to users.", correct: true, explanation: "Right. The honest tradeoff: precise sliding-window log is O(N) memory per key (one entry per request); approximate algorithms are O(1). Always ask the interviewer what tolerance is acceptable — most production systems take the approximate algorithm and recover the latency budget." },
            { label: "No tolerance — every limit must be exact. This is enforced by Lua scripts.", explanation: "Lua atomicity gives you correctness against concurrent updates, not precision against time-window boundaries. You can have an approximate algorithm that's still atomic." },
            { label: "Precision doesn't matter; the limiter is best-effort.", explanation: "Precision matters for the upper bound — allowing 1000 when the limit is 100 is a real failure. The question is the tolerance band, and ±5% is typical." },
            { label: "Only paying customers need precise limits.", explanation: "Paid tiers usually have higher limits, not stricter precision. Tier and tolerance are different axes." },
          ]}
          hint="What's the memory cost of perfectly precise sliding window?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="A rate limiter sits on every request, has to be more available than the API it protects, and is a 1ms latency budget end-to-end. Precision is approximate and that's a feature."
          points={[
            { takeaway: "Decision latency under 1ms p99", detail: "It sits inline. Every extra ms on the limiter is a ms added to every endpoint. In-process at the gateway, not a remote service call." },
            { takeaway: "Multi-key, multi-tier", detail: "Usually two limits stack: per-second to catch bursts, per-hour to catch drip abuse. Both must allow." },
            { takeaway: "Working set is small, throughput is the concern", detail: "5M active keys × 100B = 500MB. That's nothing for Redis. We shard for QPS, not memory." },
            { takeaway: "Approximate is fine, off-by-a-zero is not", detail: "±5% boundary error is invisible. Allowing 10x the limit because a counter didn't expire is a real bug." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-rate-limiter" id="design" title="Part 2 · High-level design" xp={30}>
        <h2>The shape that ships</h2>
        <p>
          The architecture is genuinely simple: a gateway that runs the limiter logic, talking to a Redis cluster sharded by limiter key, with the gateway falling open when Redis is unavailable. The interesting part is everything inside that shape.
        </p>

        <Mermaid chart={rlArchitectureDiagram} />

        <h3>API surface</h3>
        <p>
          From the application&apos;s perspective, the limiter is a <code>boolean tryAcquire(String key, int cost)</code> call. From outside, the gateway just returns 429 with response headers. Here&apos;s what those headers should look like — these are quasi-standard:
        </p>

        <CodeBlock lang="plain" caption="Response headers on every API call">{`# On allow:
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1714440060   # epoch seconds when bucket fully refills

# On deny:
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1714440060
Retry-After: 12                  # seconds until likely retry success`}</CodeBlock>

        <p>
          Always emit the headers, even on allowed requests. Clients that look at <code>X-RateLimit-Remaining</code> can self-throttle, which protects you from the customer who genuinely doesn&apos;t mean to abuse you.
        </p>

        <h3>Token bucket in atomic Redis Lua</h3>
        <p>
          Token bucket is the right default algorithm: it allows controlled bursting up to bucket capacity, refills smoothly, and is O(1) memory per key. The atomicity has to be guaranteed by Lua — read-modify-write across two Redis commands is racy.
        </p>

        <CodeBlock lang="plain" caption="rate-limit.lua — atomic token bucket">{`-- KEYS[1] = limiter key, e.g., "rl:user:42"
-- ARGV[1] = capacity (max tokens)
-- ARGV[2] = refill rate (tokens per second)
-- ARGV[3] = current epoch ms
-- ARGV[4] = cost of this request (usually 1)
-- Returns: { allowed (1/0), tokens_remaining, retry_after_ms }

local capacity   = tonumber(ARGV[1])
local refill     = tonumber(ARGV[2])
local now_ms     = tonumber(ARGV[3])
local cost       = tonumber(ARGV[4])

local data = redis.call("HMGET", KEYS[1], "tokens", "last_ms")
local tokens = tonumber(data[1])
local last_ms = tonumber(data[2])

if tokens == nil then
  tokens  = capacity
  last_ms = now_ms
else
  -- Refill based on elapsed time, capped at capacity
  local elapsed_ms = math.max(0, now_ms - last_ms)
  local refilled   = (elapsed_ms / 1000) * refill
  tokens  = math.min(capacity, tokens + refilled)
  last_ms = now_ms
end

local allowed = 0
local retry_after_ms = 0
if tokens >= cost then
  tokens  = tokens - cost
  allowed = 1
else
  -- How long until 'cost' tokens are available?
  retry_after_ms = math.ceil((cost - tokens) / refill * 1000)
end

redis.call("HMSET", KEYS[1], "tokens", tokens, "last_ms", last_ms)
-- Expire the bucket if untouched for a while; saves memory on dead keys
redis.call("PEXPIRE", KEYS[1], 3600000)

return { allowed, tokens, retry_after_ms }`}</CodeBlock>

        <p>
          Two things to notice. First, all read-modify-write happens inside one <code>EVAL</code> — Redis runs Lua scripts atomically. Two simultaneous calls cannot both observe &quot;1 token left&quot; and both decrement. Second, refill is computed lazily from elapsed time rather than being scheduled. There are no background timers; the bucket refills the moment someone asks about it.
        </p>

        <h3>Spring Cloud Gateway integration</h3>
        <p>
          The Spring side is mostly plumbing: a filter that resolves the limiter key from the request (user, IP, route), invokes the Lua script, and either passes through or returns 429.
        </p>

        <CodeBlock lang="java" caption="RateLimitFilter.java — Spring Cloud Gateway">{`@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

  private final ReactiveRedisTemplate<String, String> redis;
  private final RedisScript<List<Long>> script;       // loaded from rate-limit.lua
  private final RateLimitPolicy policy;               // resolves limit per route/user

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String key = policy.keyFor(exchange);             // "rl:user:42:GET:/orders"
    LimitConfig cfg = policy.limitFor(exchange);      // capacity, refill rate

    long nowMs = System.currentTimeMillis();
    return redis.execute(script,
        List.of(key),
        List.of(
          String.valueOf(cfg.capacity()),
          String.valueOf(cfg.refillPerSec()),
          String.valueOf(nowMs),
          "1"))
      .singleOrEmpty()
      .timeout(Duration.ofMillis(50))                 // hard ceiling on Redis call
      .onErrorResume(e -> Mono.just(List.of(1L, 0L, 0L)))   // fail-open
      .flatMap(result -> {
        long allowed       = result.get(0);
        long remaining     = result.get(1);
        long retryAfterMs  = result.get(2);
        ServerHttpResponse resp = exchange.getResponse();
        resp.getHeaders().add("X-RateLimit-Limit",     String.valueOf(cfg.capacity()));
        resp.getHeaders().add("X-RateLimit-Remaining", String.valueOf(remaining));
        if (allowed == 1) {
          return chain.filter(exchange);
        }
        resp.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        resp.getHeaders().add("Retry-After", String.valueOf(retryAfterMs / 1000 + 1));
        return resp.setComplete();
      });
  }

  @Override public int getOrder() { return -100; }   // runs early
}`}</CodeBlock>

        <p>
          Note the <code>onErrorResume</code> returning <code>allowed = 1</code>. That&apos;s the fail-open decision in code: if Redis times out, allow the request rather than 503-ing the user. We&apos;ll come back to this.
        </p>

        <h3>Sharding the Redis layer</h3>
        <p>
          One Redis node won&apos;t hold the QPS — Redis tops out around 100k ops/sec on a single core, so a 1M QPS limiter wants at least 10-20 shards for headroom. Standard Redis Cluster does the sharding by hash slot; the limiter key naturally distributes if you don&apos;t cluster all of one user&apos;s keys together.
        </p>

        <p>
          The non-obvious failure: <strong>hot keys</strong>. If one user (or one IP, or one apiKey) gets a sudden burst, every request hashes to the same slot, and that one Redis node sees a huge fraction of the cluster&apos;s traffic. We&apos;ll deep-dive this in Part 3.
        </p>

        <Callout variant="spring" title="Why not Spring's built-in RequestRateLimiter?">
          <p className="m-0">Spring Cloud Gateway ships a <code>RequestRateLimiter</code> filter with a Redis-backed token bucket. For a small service it&apos;s perfect — it&apos;s essentially the script above with extra polish. The reason production teams often replace it: tier-based limits, multi-key composition (per-user AND per-IP), and custom failure semantics often need behavior the built-in doesn&apos;t expose. Start with the built-in; replace it the moment you need to compose limits or change the failure mode.</p>
        </Callout>

        <Quiz
          question="Why does the token bucket logic need to run as a Lua script in Redis instead of as two separate GET and SET calls from the gateway?"
          options={[
            { label: "Two separate calls have a race window: two requests can both read 'tokens=1', both decide they're allowed, and both write 'tokens=0' — letting two requests through when only one should have. EVAL of a Lua script runs atomically against the key.", correct: true, explanation: "Right. The atomicity is the whole point. Lua scripts in Redis run single-threaded relative to that key. WATCH/MULTI/EXEC is another option but uglier and more roundtrips. Lua is the production answer." },
            { label: "Lua is faster than separate calls.", explanation: "It is faster (one round trip vs three) but that's secondary. The real issue is correctness under concurrency, not raw speed." },
            { label: "Spring Boot can't make multiple Redis calls per request.", explanation: "It absolutely can. The issue is that they wouldn't be atomic." },
            { label: "Redis doesn't support GET and SET on hashes.", explanation: "Redis supports HGET and HSET on hashes. The issue is concurrency, not API surface." },
          ]}
          hint="What happens with two simultaneous requests reading and writing the same key?"
          xp={8}
        />

        <Quiz
          question="The gateway's call to Redis has a 50ms timeout. On timeout, the filter returns 'allowed = 1'. What is this called and why is it usually right?"
          options={[
            { label: "Fail-open. When the limiter itself is unavailable, allowing traffic is usually safer than blocking it — the limiter exists to prevent abuse, not to be a tighter availability constraint than the service it protects. Most production limiters fail-open with loud alerting.", correct: true, explanation: "Right. The principle: the rate limiter must be more available than the service. If Redis is having a bad afternoon, do you really want every customer to see 503s? Fail-open keeps the service up; alerts wake someone up to fix the limiter." },
            { label: "Fail-closed — refusing requests by default protects the service.", explanation: "That's the opposite. Fail-closed is what's named. It's correct for some workloads (security-critical limits) but usually wrong for general API rate limiting." },
            { label: "Eventual consistency — the limit will eventually be enforced.", explanation: "Eventual consistency is about replicas converging, not about request admission. Different concept." },
            { label: "Circuit breaker open — Redis is treated as unhealthy.", explanation: "A circuit breaker can wrap the call, but the question is what to do when the call fails. Allow vs deny is the fail-open / fail-closed decision, distinct from circuit breaker mechanics." },
          ]}
          hint="When the limiter is down, do you trust the service or block all traffic?"
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="A token-bucket Lua script in Redis, called from a Spring Cloud Gateway filter, with a hard timeout and fail-open behavior. The shape is small; the discipline is in the details."
          points={[
            { takeaway: "Atomic Lua, not GET+SET", detail: "Multiple Redis commands aren't atomic; Lua EVAL runs single-threaded against the key. That's the only way to avoid the 'both saw 1 token' race." },
            { takeaway: "Token bucket refills lazily on read", detail: "No timers, no scheduled jobs. Compute refill from elapsed time at the moment of each check. O(1) memory, no background work." },
            { takeaway: "Always emit X-RateLimit headers and Retry-After", detail: "Well-behaved clients self-throttle. Headers turn the limiter from an adversarial gate into a cooperation contract." },
            { takeaway: "Fail-open with loud alerts", detail: "If Redis is down, the limiter must not bring down the API. Allow the request, page the on-call, fix the limiter." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-rate-limiter" id="deep" title="Part 3 · Algorithms & failure modes" xp={30}>
        <h2>The hard parts the textbook skips</h2>

        <h3>Algorithm choice — why not sliding window log?</h3>
        <p>
          The rate-limiting module covered the algorithms; here&apos;s the production reasoning. There are three serious contenders:
        </p>
        <ul>
          <li><strong>Token bucket</strong> (the script above). O(1) memory. Allows configured bursts. Approximate at boundaries — could allow up to 2x the rate over a 2-window crossing in the worst case. Production default.</li>
          <li><strong>Sliding window log</strong>. Keep a sorted set of request timestamps; admit if count in the last N seconds is under limit. <em>Exact</em> precision. O(N) memory per key — at 1000 req/min, you store 1000 timestamps per active user. For 5M active users, that&apos;s 5B entries. Hard pass at this scale.</li>
          <li><strong>Sliding window counter</strong>. Two counters: current minute and previous minute. Estimate rate as <code>current + previous × (1 - current_minute_fraction)</code>. O(1), much smoother boundaries than token bucket, slightly more accurate. Good middle ground.</li>
        </ul>
        <p>
          Picking algorithm by workload: token bucket if you want explicit burst configuration; sliding window counter if you want smooth boundary behavior; sliding window log only if a regulator is asking and the cost is justified.
        </p>

        <h3>Hot keys — when one user sets your Redis on fire</h3>
        <p>
          The pathological case: <strong>a single key gets so much traffic that one Redis shard becomes a bottleneck.</strong> An attacker hammering one apiKey, a buggy client retrying tightly, a celebrity user the world is hitting. Whatever the cause, that user&apos;s key hashes to one shard, and that shard is now serving 100k+ ops/sec that should be spread across 20.
        </p>
        <p>
          Three production fixes, each with tradeoffs:
        </p>
        <ol>
          <li><strong>Local-first, Redis-second.</strong> Each gateway instance keeps an in-process token bucket per key (Caffeine cache). Calls Redis only when local says &quot;allow&quot; or every N requests for sync. Brilliant for hot keys (the local check absorbs the load) but introduces cluster-wide drift — across 50 gateways, the effective limit can be N × per-gateway-limit if you don&apos;t coordinate.</li>
          <li><strong>Per-shard fanout.</strong> Replace the hot key&apos;s state with a set of N sub-keys: <code>rl:user:42:0</code> through <code>rl:user:42:9</code>. Distribute requests across them by hashing the request ID. Limit becomes 1/N per sub-key. Cluster spreads the load, precision drops.</li>
          <li><strong>Block early.</strong> If a key has been over-limit for ten consecutive checks, mark it as suppressed for the next minute and reject locally without hitting Redis at all. Useful for clearly malicious traffic; risky for legitimate spikes.</li>
        </ol>

        <h3>Multi-region: the hardest tradeoff</h3>
        <p>
          When the API runs in multiple regions, where does the limit live? Three architectures, each with a clear tradeoff:
        </p>
        <ul>
          <li><strong>Per-region buckets, no sync</strong> — each region runs its own Redis cluster, limits enforced regionally. Simple, fast, but a user can effectively get N × the limit by hitting N regions. Acceptable when limits are loose and the API is expensive enough that per-region is fine.</li>
          <li><strong>Central authority</strong> — one global Redis cluster all regions call into. Tight global limits, but every check round-trips to a single region. p99 budget shot for any cross-region call.</li>
          <li><strong>Eventually-consistent with regional caching</strong> — regional Redis owns the bucket, sync state to a central store every few seconds. Tight enough for most purposes, fast enough for hot path. Most production systems land here.</li>
        </ul>

        <Callout variant="warn" title="The Stripe quote you should remember">
          <p className="m-0">Stripe&apos;s engineers have written publicly that rate limiters at scale are &quot;a balance between accuracy, latency, and uptime — and you only get to optimize for two.&quot; Pick which two early, and document the third as the explicit cost. Trying to have all three is what creates 3am incidents about rate limiting itself.</p>
        </Callout>

        <h3>Failure modes you need to articulate</h3>
        <p>
          The interviewer&apos;s favorite question: &quot;what happens when X breaks?&quot; The good answers:
        </p>
        <ul>
          <li><strong>Redis shard down:</strong> Gateway times out within 50ms, fails open for keys on that shard. Alerts fire. Once shard recovers, traffic resumes. Worst case: a window of unenforced limits.</li>
          <li><strong>Whole Redis cluster down:</strong> Same as above but for everyone. The API stays up. No silent over-limit allowance — every fail-open is logged and alerted.</li>
          <li><strong>Lua script bug deployed:</strong> All requests start failing or all start passing. Canary the script the same way you&apos;d canary application code.</li>
          <li><strong>Clock skew between gateways:</strong> The script uses <code>now_ms</code> from the calling gateway. If gateway A&apos;s clock is 30s ahead of gateway B&apos;s, B&apos;s subsequent calls compute negative elapsed time, and the <code>math.max(0, ...)</code> in the script is what saves you. Always include that floor.</li>
          <li><strong>Hot key DDoS:</strong> Detect via Redis slow log + per-key QPS metrics. Auto-suppress keys above N×limit. The hot-key detection itself should not require a Redis call on the hot path — it&apos;s metric-driven.</li>
        </ul>

        <Quiz
          question="A user normally allowed 100 requests per minute is suddenly making 100,000 RPS, all hitting the same Redis shard. What's the design move?"
          options={[
            { label: "Detect the hot key (per-key QPS metric or Redis slow log) and suppress it locally on the gateway for a short interval, so the bad traffic stops hitting Redis altogether. The limit is still being enforced — it's just being enforced without the Redis hop while the abuse is in progress.", correct: true, explanation: "Right. Hot keys are pathological for any sharded store. Detecting them and short-circuiting at the gateway protects the storage layer. Some teams also fan the key out across sub-keys, but that adds permanent complexity — local suppression is the surgical fix." },
            { label: "Increase the Redis cluster size — scale horizontally.", explanation: "Doesn't help. All the traffic hashes to the same key, so one shard is the bottleneck regardless of cluster size. Sharding doesn't fix per-key hotspots." },
            { label: "Drop the rate limit entirely for that user.", explanation: "That's giving up — and rewards the abuser. The limit is correct; the issue is that enforcing it cheaply has become hard." },
            { label: "Switch to a sliding window log algorithm.", explanation: "Sliding window log is more memory-intensive, not less. It doesn't address the hot-key problem; it makes it slightly worse by inflating per-key state." },
          ]}
          hint="What stops the bad traffic from reaching Redis at all?"
          xp={8}
        />

        <Quiz
          question="Your team picks 'per-region buckets, no sync' for multi-region rate limiting. A customer with a 1000/hour limit calls from 4 regions. What's the realistic worst case?"
          options={[
            { label: "They can effectively get up to 4000 requests per hour, because each region enforces its own copy of the 1000 limit independently. That's the explicit cost of the no-sync architecture — write it down and decide whether the workload tolerates it.", correct: true, explanation: "Right. The math is simple multiplication. The architecture is correct as long as everyone agrees the cost is acceptable. Loose limits, bursty workloads, or regulatory limits framed as 'no more than ~1000/hr' all tolerate this. Strict per-customer billing or contractual limits don't." },
            { label: "They get exactly 1000 — the regions sync via their network connection.", explanation: "Without sync, they don't sync. That's literally the architecture choice." },
            { label: "They get 1000/4 = 250 per region, totaling 1000.", explanation: "Each region doesn't know about the others, so each enforces 1000 on its own. Total is 4 × 1000." },
            { label: "Per-region buckets aren't valid for multi-region — you must use central authority.", explanation: "Per-region is a valid architecture for many workloads. The trade is precision vs latency, and 'central authority' has its own brutal latency cost." },
          ]}
          hint="If each region enforces 1000 independently, what's the global total?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="The hard part is everything that surrounds the algorithm: hot keys, multi-region tradeoffs, and which two of {accuracy, latency, uptime} you've decided to prioritize."
          points={[
            { takeaway: "Token bucket is the production default", detail: "O(1) memory, configurable bursts, approximate at boundaries (good enough). Sliding window log is correct but O(N) — only worth it for compliance." },
            { takeaway: "Hot keys are the failure that hides", detail: "One bad key hashes to one shard and melts it. Local suppression at the gateway (or sub-key fanout) is the fix. Detection is metric-driven, not in-line." },
            { takeaway: "Multi-region is a precision-vs-latency trade", detail: "Per-region (loose), central (tight + slow), eventually-consistent regional (the production sweet spot). Pick consciously." },
            { takeaway: "Stripe's two-of-three rule", detail: "Accuracy, latency, uptime — pick two. The third is the cost. Document it before the incident." },
          ]}
        />
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Designing a ride-sharing service. Now we leave the well-trodden territory and get into geo-indexing, real-time matching, and a state machine that has to survive every kind of partial failure.
        </p>
        <Link
          href="/courses/system-design/modules/design-rideshare"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Design a ride-sharing service →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="design-rate-limiter" />
    </article>
  );
}
