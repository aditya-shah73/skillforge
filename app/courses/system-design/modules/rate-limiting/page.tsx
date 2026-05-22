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
  { id: "algorithms", title: "Algorithms" },
  { id: "distributed", title: "Distributed limiting" },
  { id: "policy", title: "Policy & client behavior" },
];

const tokenBucketDiagram = `flowchart LR
  R[Refill: r tokens/sec] --> B((Bucket · capacity C))
  B -- take 1 token --> Allow
  B -- empty --> Reject[429 + Retry-After]`;

export default function Page() {
  const mod = getModuleBySlug("rate-limiting")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="rate-limiting" />
        <ModuleProgress moduleSlug="rate-limiting" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚦</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Rate limiting is half algorithm, half policy. The algorithm decides &quot;is this request allowed right now&quot;; the policy decides &quot;what counts as a user, how do we tell them no, and what should they do next.&quot; Both halves are easy to get subtly wrong.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Token bucket, leaky bucket, fixed window, sliding window — what each is actually doing</li>
          <li>Why fixed-window counters double your effective burst at the boundary</li>
          <li>Distributed rate limiting with Redis — and why a Lua script is non-negotiable</li>
          <li>Spring Cloud Gateway&apos;s built-in RedisRateLimiter and when it&apos;s enough</li>
          <li>429 vs 503, Retry-After, X-RateLimit-* headers, and how clients should react</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">Rate limiting is what stops one noisy client from ruining everyone else&apos;s day. It&apos;s also what stops your retry-on-failure clients from accidentally DDoSing you when an upstream blips. The choice of algorithm and the shape of your 429 response together decide whether your service degrades gracefully or falls over loud.</p>
      </Callout>

      {/* PART 1 — Algorithms */}
      <Checkpoint moduleSlug="rate-limiting" id="algorithms" title="Algorithms" xp={20} celebration="Algorithms locked in. The vocabulary is yours.">
      <section>
        <h2>Part 1: The four algorithms (and which one you actually want)</h2>

        <p>
          There are basically four classic rate limiting algorithms in production use. They look similar from the outside — &quot;limit a client to N requests per minute&quot; — but they have meaningfully different burst and fairness properties. Understanding the tradeoff between them is most of the value of this part.
        </p>

        <h3>Token bucket</h3>

        <p>
          A bucket holds up to <em>C</em>{" "}tokens. New tokens drip in at rate <em>r</em>{" "}per second up to the cap. Each request consumes one token; if the bucket is empty, the request is rejected (or queued). That&apos;s it. The whole algorithm fits in one paragraph.
        </p>
        <p>
          The reason it&apos;s the most popular algorithm is that it gives you two knobs that map cleanly onto how you actually think about traffic: <em>r</em>{" "}is the sustained rate, <em>C</em>{" "}is the burst size. A client can sit idle, accumulate tokens up to <em>C</em>, then spend them in a burst — and after that they&apos;re paced at <em>r</em>. This matches real client behavior (mostly idle, occasionally bursty) far better than a hard rate cap.
        </p>

        <Mermaid chart={tokenBucketDiagram} />

        <h3>Leaky bucket</h3>

        <p>
          A bucket has a fixed-size queue. Requests arrive and are added to the queue if there&apos;s room; they leak out at a constant rate <em>r</em>. If the queue is full, new requests are dropped. The output is perfectly smooth — exactly <em>r</em>{" "}requests per second, no bursts.
        </p>
        <p>
          Leaky bucket is what you want when downstream is fragile. It enforces a strict ceiling on outbound rate at the cost of latency (requests wait in the queue). Token bucket lets bursts through; leaky bucket smooths them out. Pick based on whether the downstream is bursty-friendly or burst-allergic.
        </p>

        <h3>Fixed window counter</h3>

        <p>
          Define a window — say 1 minute. Maintain a counter per client. Increment on each request; reject when the count exceeds the limit; reset the counter at the window boundary. Simple, cheap, has one nasty property: at the boundary, a client can spend their full budget in the last second of one window and the full budget again in the first second of the next. <strong>Effective burst is 2× the configured limit.</strong>
        </p>
        <p>
          This boundary effect is rarely a real problem if your limit is &quot;100 req/min&quot; and downstream can handle 200 req/min. It is a real problem when your limit is genuinely a hard ceiling.
        </p>

        <h3>Sliding window (log or counter)</h3>

        <p>
          Two flavors. The <em>log</em>{" "}version stores the timestamp of every request in a window and counts how many fall in the last N seconds. Exact, but memory-heavy. The <em>counter</em>{" "}version maintains the current and previous window count and weights them by how much of the previous window is still &quot;in the past N seconds.&quot; Approximate but cheap and bursting-resistant.
        </p>
        <p>
          The sliding-window-counter approach is what most production rate limiters actually use under the hood. It avoids the fixed-window boundary effect at near-zero memory cost.
        </p>

        <ClassifyChallenge
          title="Which algorithm fits the requirement?"
          prompt="Match each requirement to the algorithm that best satisfies it."
          buckets={[
            { id: "token", label: "Token bucket", color: "sky" },
            { id: "leaky", label: "Leaky bucket", color: "indigo" },
            { id: "fixed", label: "Fixed window", color: "amber" },
            { id: "sliding", label: "Sliding window", color: "emerald" },
          ]}
          items={[
            { id: "i1", label: "Allow short bursts but pace sustained traffic — typical API quota", answer: "token", explanation: "Token bucket exposes the burst cap (C) and the sustained rate (r) as separate knobs. This is the API-quota default." },
            { id: "i2", label: "Forward at most 100 req/sec to a fragile legacy backend, no bursts allowed", answer: "leaky", explanation: "Leaky bucket smooths output to a fixed rate. Token bucket would let through a burst, which is exactly what the fragile backend can't handle." },
            { id: "i3", label: "Quick-and-dirty per-IP cap with one Redis INCR — boundary effect is acceptable", answer: "fixed", explanation: "Fixed window is the simplest implementation: one counter, one TTL, one INCR. Use when the 2× boundary burst won't break downstream." },
            { id: "i4", label: "Hard cap of N requests in any rolling 60s — no boundary doubling allowed", answer: "sliding", explanation: "This is exactly the case fixed-window fails — the client can use 2× the limit at the boundary. Sliding window enforces the rolling cap." },
            { id: "i5", label: "Memory-cheap rate limiter that approximates a rolling window with one or two counters", answer: "sliding", explanation: "The sliding-window-counter trick (current count + previous count weighted by elapsed window fraction) is cheap and accurate enough for most APIs." },
            { id: "i6", label: "Allow a user to save up unused capacity during quiet hours and spend it later", answer: "token", explanation: "Token bucket lets idle users accumulate tokens up to C and spend them as a burst later. Leaky bucket explicitly prevents this." },
          ]}
        />

        <Callout variant="warn" title="The fixed-window boundary trap">
          <p className="m-0">A client at the &quot;100 req/min&quot; limit can fire 100 requests at 11:59:59.5 and another 100 at 12:00:00.5. That&apos;s 200 requests in one second, both inside the limit, both perfectly legal under a fixed-window counter. If your downstream sized for 100 RPS, you&apos;ve just doubled it. Sliding window or token bucket avoid this.</p>
        </Callout>

        <h3>The Java reference: Bucket4j</h3>

        <p>
          For an in-process limiter on a single JVM, Bucket4j is the standard library. It&apos;s a clean implementation of token bucket with a fluent builder. Good for per-instance limits; for cluster-wide limits you graduate to Redis (Part 2).
        </p>

        <CodeBlock lang="java" caption="In-process token bucket per user with Bucket4j">{`import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PerUserRateLimiter {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket bucketFor(String userId) {
        return buckets.computeIfAbsent(userId, key -> {
            // 100 tokens cap, refill 100 every minute = 1.67/sec sustained, 100 burst
            Bandwidth limit = Bandwidth.classic(
                100,
                Refill.intervally(100, Duration.ofMinutes(1))
            );
            return Bucket.builder().addLimit(limit).build();
        });
    }

    public boolean tryConsume(String userId) {
        return bucketFor(userId).tryConsume(1);
    }
}

// Usage in a controller:
// if (!rateLimiter.tryConsume(userId)) {
//     throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
// }
//
// Caveat: this map is per-JVM. Two replicas behind a load balancer will each
// allow 100/min, so the effective limit is 200/min. Fine if you understand
// that; not fine if 100/min is a contractual cap. For cluster-wide limits,
// see Part 2.`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="A client is configured with a token bucket of capacity 50 and refill rate 10/sec. They've been idle for 10 seconds. What's the most requests they can fire in the next 1 second?"
          options={[
            { label: "10 — that's the refill rate.", explanation: "Refill rate caps sustained throughput, not the immediate burst. The bucket can be full when idle, ready to release a burst up to C." },
            { label: "50 — the bucket is full at capacity, plus ~10 more from refill during that second, but cap is 50 immediately.", correct: true, explanation: "Right. After 10s of idle, the bucket is at its cap of 50. Within the first second they can spend all 50 tokens; refill adds tokens during the second but they can't accumulate above C. The peak burst is C, then the rate degrades to r." },
            { label: "60 — capacity plus one second of refill.", explanation: "The bucket caps at C=50. Tokens can't accumulate above the cap, so idle time beyond the fill time doesn't help." },
            { label: "Unlimited until the next refill cycle.", explanation: "Token buckets don't have a 'cycle' — they refill continuously and cap at C. They're not fixed-window counters." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer says: 'we use a fixed-window counter at 1000 req/min — it's been fine for years.' Why might this still be a problem worth fixing?"
          options={[
            { label: "Fixed-window counters are inaccurate over long periods.", explanation: "The accuracy isn't the issue — the boundary burst is." },
            { label: "At the window boundary, a client can spend the full budget twice within seconds — effective peak is 2× the limit. If downstream was sized at 1000 RPS, a coordinated client can push 2000 RPS at 12:00:00.", correct: true, explanation: "Right. The fix is sliding window, which prevents the boundary doubling. Whether 'fine' actually means fine depends on whether downstream has the headroom for the 2× burst." },
            { label: "Fixed-window counters use too much memory.", explanation: "They use one counter per client — they're the cheapest algorithm." },
            { label: "Fixed-window counters can't be implemented in Redis.", explanation: "They can — INCR with a TTL is the textbook Redis pattern." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Algorithm choice maps to traffic shape — burst-friendly, smooth, rolling, or naive."
          points={[
            { takeaway: "Token bucket is the API-quota default — burst cap and sustained rate are separate knobs.", detail: <>Capacity C is the max burst; rate r is the sustained throughput. Idle time accumulates tokens up to C.</> },
            { takeaway: "Leaky bucket smooths output — use it when downstream cannot tolerate bursts.", detail: <>Output is a constant r. Pays in latency (queueing) for the smoothness. Token bucket lets bursts through; leaky bucket flattens them.</> },
            { takeaway: "Fixed window is cheapest but doubles the effective burst at the boundary.", detail: <>A client can spend the full budget at 11:59:59 and again at 12:00:00. Acceptable if downstream has 2× headroom; not if the limit is a hard cap.</> },
            { takeaway: "Sliding window (counter) is the realistic upgrade.", detail: <>Approximates a rolling window with current-window count and weighted previous-window count. Almost as cheap as fixed; avoids the boundary effect.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2 — Distributed */}
      <Checkpoint moduleSlug="rate-limiting" id="distributed" title="Distributed limiting" xp={25} celebration="Distributed limiter wired up. Two replicas can't double-spend now.">
      <section>
        <h2>Part 2: Distributed rate limiting with Redis</h2>

        <p>
          The moment you have more than one replica, an in-process limiter stops enforcing your real limit. Two replicas at &quot;100/min each&quot; mean a client can do 200/min by happening to talk to both. The fix is a shared counter — and in practice, that means Redis.
        </p>

        <h3>The naive Redis pattern (and why it&apos;s wrong)</h3>

        <p>
          The first thing every engineer reaches for is INCR with a TTL:
        </p>

        <CodeBlock lang="plain">{`# pseudocode — DO NOT USE
count = INCR rl:user:123:1m
if count == 1: EXPIRE rl:user:123:1m 60
if count > 100: reject`}</CodeBlock>

        <p>
          This has two bugs. First, the INCR-then-EXPIRE pair is not atomic — if the process dies between the two, the key never expires and the user is locked out forever. Second, this is a fixed-window counter, so it has the boundary doubling from Part 1.
        </p>

        <h3>The right pattern: a Lua script</h3>

        <p>
          Redis Lua scripts run atomically — the entire script executes as a single command. That&apos;s exactly what you need: read the bucket, compute the new state, write it back, all in one shot. Here&apos;s a token-bucket implementation:
        </p>

        <CodeBlock lang="plain" caption="token_bucket.lua — atomic distributed token bucket">{`-- KEYS[1] = bucket key, e.g. rl:user:123
-- ARGV[1] = capacity C
-- ARGV[2] = refill rate r (tokens per second)
-- ARGV[3] = now (epoch millis)
-- ARGV[4] = cost (usually 1)
-- returns: { allowed (0/1), tokens_remaining, retry_after_ms }

local key      = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])
local cost     = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts     = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  ts     = now
end

-- refill since last touch
local elapsed_ms = math.max(0, now - ts)
local refill     = (elapsed_ms / 1000.0) * rate
tokens = math.min(capacity, tokens + refill)

local allowed = 0
local retry_after = 0

if tokens >= cost then
  tokens  = tokens - cost
  allowed = 1
else
  -- how long until we have 'cost' tokens?
  retry_after = math.ceil(((cost - tokens) / rate) * 1000)
end

redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
-- TTL = time to fully refill, with cushion
redis.call('PEXPIRE', key, math.ceil((capacity / rate) * 1000) + 1000)

return { allowed, tokens, retry_after }`}</CodeBlock>

        <p>
          A few things to notice. We store the bucket as a hash with <code>tokens</code> and <code>ts</code> (last-touched timestamp); refill is computed lazily from elapsed time, not by a background process. The TTL means inactive buckets get evicted automatically. The script returns enough info for the caller to set <code>Retry-After</code>.
        </p>

        <CodeBlock lang="java" caption="Calling the Lua script from Spring Data Redis">{`@Component
public class RedisTokenBucketLimiter {

    private final StringRedisTemplate redis;
    private final RedisScript<List> script;

    private final long capacity;
    private final double refillPerSec;

    public RedisTokenBucketLimiter(StringRedisTemplate redis,
                                   @Value("classpath:scripts/token_bucket.lua") Resource scriptFile,
                                   @Value("\${rl.capacity:100}") long capacity,
                                   @Value("\${rl.rate:1.67}") double refillPerSec) throws IOException {
        this.redis        = redis;
        this.capacity     = capacity;
        this.refillPerSec = refillPerSec;
        String body = StreamUtils.copyToString(scriptFile.getInputStream(), StandardCharsets.UTF_8);
        this.script = RedisScript.of(body, List.class);
    }

    public RateLimitResult tryConsume(String key, int cost) {
        List<Long> result = redis.execute(
            script,
            List.of("rl:" + key),
            String.valueOf(capacity),
            String.valueOf(refillPerSec),
            String.valueOf(System.currentTimeMillis()),
            String.valueOf(cost)
        );
        boolean allowed = result.get(0) == 1L;
        long tokensLeft = result.get(1);
        long retryAfterMs = result.get(2);
        return new RateLimitResult(allowed, tokensLeft, retryAfterMs);
    }

    public record RateLimitResult(boolean allowed, long tokensRemaining, long retryAfterMs) {}
}`}</CodeBlock>

        <Callout variant="spring" title="Spring Cloud Gateway: the off-the-shelf option">
          <p className="m-0">If you&apos;re running Spring Cloud Gateway and your rate-limiting needs are standard (per-user, per-IP, per-API-key), you don&apos;t need to write any of the above. The built-in <code>RedisRateLimiter</code> implements a token bucket with a Lua script very similar to ours. Configure <code>replenishRate</code> (tokens/sec) and <code>burstCapacity</code> (bucket size) and a <code>KeyResolver</code> bean for the principal. Reach for a custom implementation only when you need non-standard keying (e.g. composite of tenant + endpoint + cost) or non-standard responses.</p>
        </Callout>

        <h3>What about hot keys?</h3>

        <p>
          A single Redis instance can do 100k+ ops/sec, which is plenty for most rate limiters. But if one client (one API key, one tenant) is responsible for huge fractions of your traffic, you have a hot-key problem — every check goes to the same Redis shard. Two ways out: shard the limit (split &quot;1000/sec&quot; into 10 sub-buckets keyed by hash mod 10) and accept slightly less precise enforcement, or use a local-then-global approach where each replica enforces a fraction in-process and only consults Redis when local is exhausted.
        </p>

        <Quiz
          kind="Drill"
          question="You implement distributed rate limiting with Redis using INCR + EXPIRE in two separate commands. A request comes in, INCR runs, the app process crashes before EXPIRE. What's the impact?"
          options={[
            { label: "Nothing — Redis cleans up keys without TTLs eventually.", explanation: "Redis does NOT automatically expire keys without a TTL. They live until evicted under memory pressure (only if maxmemory-policy is set) or deleted explicitly." },
            { label: "The key has no TTL and the count keeps climbing forever — that user is rate-limited permanently.", correct: true, explanation: "Right. The non-atomicity of INCR + EXPIRE is the textbook bug. Use a Lua script (atomic), or SET NX EX combined with INCR pipelined, or rely on the TTL being set on the FIRST request only inside an atomic op. Otherwise crashes between INCR and EXPIRE permanently lock users out." },
            { label: "Redis automatically rolls back the INCR.", explanation: "Redis has no transaction rollback in this sense. INCR is committed immediately." },
            { label: "The next request will reset the counter.", explanation: "INCR adds to the existing value, it doesn't reset. The count grows monotonically." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="Your rate limiter consults Redis on every request. Redis has a brief outage. What's the right failure mode?"
          options={[
            { label: "Reject all requests — fail closed for safety.", explanation: "This converts a Redis hiccup into a full outage of your service. Almost never the right answer for rate limiting — the limiter is a guardrail, not the primary path." },
            { label: "Allow all requests — fail open, log the incident, and trust other layers (auth, downstream rate limits, circuit breakers) to protect you.", correct: true, explanation: "Right. Rate limiters are guardrails, not gates. A short Redis outage allowing some over-limit traffic is far better than a Redis outage causing 100% rejection. Log loudly so you know it happened, and make sure your downstream rate limits and circuit breakers can handle the spillover." },
            { label: "Switch to per-instance limits with no coordination.", explanation: "Better than failing closed, but in practice 'fail open' with logging is simpler and safer than trying to spin up a fallback limiter on the hot path." },
            { label: "Block until Redis recovers.", explanation: "Blocking the request thread on Redis recovery turns a Redis outage into a thread-pool outage on every replica. Catastrophically bad." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Distributed limiting needs atomicity in Redis and a sane failure mode for when Redis blips."
          points={[
            { takeaway: "INCR + EXPIRE in two commands is non-atomic — use a Lua script.", detail: <>A crash between the two commands leaves a key without TTL. Lua scripts run atomically and let you implement token bucket, sliding window, etc. cleanly.</> },
            { takeaway: "Spring Cloud Gateway has a production-grade RedisRateLimiter built in.", detail: <>If your needs are standard, configure <code>replenishRate</code>, <code>burstCapacity</code>, and a <code>KeyResolver</code>. Roll your own only for non-standard keying or response shapes.</> },
            { takeaway: "Compute refill lazily from elapsed time, not via a background job.", detail: <>Storing <code>tokens</code> and <code>ts</code> means the bucket is only updated on access. Inactive buckets cost nothing and get evicted by TTL.</> },
            { takeaway: "Fail open when Redis is down.", detail: <>The rate limiter is a guardrail. A Redis outage causing 100% rejection is worse than a Redis outage temporarily allowing over-limit traffic. Log the spillover and lean on downstream protections.</> },
            { takeaway: "Hot keys can swamp a single Redis shard — consider sharding the limit.", detail: <>Split a single &quot;1000/sec&quot; bucket into 10 hash-sharded sub-buckets when one client dominates traffic and the precision loss is acceptable.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3 — Policy */}
      <Checkpoint moduleSlug="rate-limiting" id="policy" title="Policy & client behavior" xp={20} celebration="Policy in place. Clients know what to do when they see a 429.">
      <section>
        <h2>Part 3: Keying, response shape, and client behavior</h2>

        <h3>What do you actually limit by?</h3>

        <p>
          The hardest part of rate limiting in production isn&apos;t the algorithm — it&apos;s deciding what counts as &quot;a client.&quot; A few options, each with a failure mode:
        </p>
        <ul>
          <li><strong>By IP.</strong>{" "}Easy. Useful as a coarse outer ring. Wrong as the only key — carrier NAT means thousands of mobile users share one IP, and corporate proxies aggregate everyone in an office. Limiting by IP alone will get you angry support tickets from legitimate users.</li>
          <li><strong>By API key / user ID.</strong>{" "}The right primary key for authenticated traffic. Each user gets their own bucket. Burst budgets can be tuned per tier (free, pro, enterprise).</li>
          <li><strong>By tenant.</strong>{" "}For B2B APIs, the tenant (org) is usually the unit of contract. A noisy user inside a tenant should bother their teammates first, not strangers.</li>
          <li><strong>Composite.</strong>{" "}The strongest pattern is <em>multiple</em>{" "}overlapping limits: per-IP outer ring (DDoS), per-user inner ring (fairness), per-endpoint cost-based limit (expensive endpoints get their own pool). All three checks, all three rejections possible.</li>
        </ul>

        <Callout variant="insight" title="Cost-weighted limiting">
          <p className="m-0">Not all requests are equal. A <code>GET /healthz</code> costs 1ms; a <code>POST /report/generate</code> costs 5 seconds of CPU. If the limit is &quot;10 RPS&quot; and the report endpoint takes 5s, one user can lock up half your fleet for under their limit. Cost-weighted limiting charges multiple tokens per expensive request — your token bucket Lua script already supports this with the <code>cost</code> parameter. Set per-endpoint costs in config; charge accordingly.</p>
        </Callout>

        <h3>429 vs 503 — which one do you return?</h3>

        <p>
          <strong>429 Too Many Requests</strong>{" "}means &quot;you are over your limit.&quot; The client did this. They should slow down and retry later. Status text says &quot;your fault.&quot;
        </p>
        <p>
          <strong>503 Service Unavailable</strong>{" "}means &quot;the server is overloaded.&quot; The server did this. The client may retry. Status text says &quot;our fault, try again.&quot;
        </p>
        <p>
          The distinction matters because well-behaved clients react to them differently. A 429 with <code>Retry-After</code> tells the client to wait that long; well-written clients will. A 503 will trigger more aggressive retries from clients that don&apos;t know better. If your rate limiter is rejecting because the user exceeded their budget, return 429. If you&apos;re rejecting because the system is melting and you want all clients to back off, return 503.
        </p>

        <h3>Response headers that earn their keep</h3>

        <p>
          Three headers turn a rate-limited API from frustrating into pleasant:
        </p>
        <ul>
          <li><code>Retry-After: 7</code> — wait 7 seconds before retrying. Mandatory on a 429. Without it, clients have to guess.</li>
          <li><code>X-RateLimit-Limit: 100</code> — your total budget for this window.</li>
          <li><code>X-RateLimit-Remaining: 23</code> — what&apos;s left. Lets clients pace themselves before they get rejected.</li>
        </ul>
        <p>
          Setting <code>X-RateLimit-Remaining</code> on every response (not just 429s) is one of the highest-leverage things you can do for API ergonomics. It costs ~one HTTP header and saves clients from the binary &quot;allow / 429&quot; experience.
        </p>

        <h3>Client side: retry with decorrelated jitter</h3>

        <p>
          When a client sees a 429, they should back off and retry — but not all at the same time. If 1000 clients all get 429&apos;d at <code>t=0</code> and all retry at <code>t=Retry-After</code>, you get a thundering herd that&apos;s indistinguishable from the original spike. The standard fix is <strong>decorrelated jitter</strong> — each retry waits a random duration up to some cap, scaled by the previous wait. AWS&apos;s recommended formula is <code>sleep = min(cap, random(base, prev * 3))</code>.
        </p>

        <CodeBlock lang="java" caption="Decorrelated jitter for retry-on-429">{`import java.time.Duration;
import java.util.concurrent.ThreadLocalRandom;

public class DecorrelatedJitter {
    private final Duration base;
    private final Duration cap;
    private Duration prev;

    public DecorrelatedJitter(Duration base, Duration cap) {
        this.base = base;
        this.cap  = cap;
        this.prev = base;
    }

    /** Sleep duration for the next retry. */
    public Duration nextSleep() {
        long baseMs = base.toMillis();
        long capMs  = cap.toMillis();
        long prevMs = prev.toMillis();
        long upper  = Math.min(capMs, prevMs * 3);
        long jitter = ThreadLocalRandom.current().nextLong(baseMs, Math.max(baseMs + 1, upper + 1));
        prev = Duration.ofMillis(jitter);
        return prev;
    }

    public void reset() { this.prev = base; }
}

// Usage:
// DecorrelatedJitter backoff = new DecorrelatedJitter(
//     Duration.ofMillis(100),  // base
//     Duration.ofSeconds(30)   // cap
// );
// for (int attempt = 0; attempt < 5; attempt++) {
//     Response r = call();
//     if (r.status() == 200) { backoff.reset(); return r; }
//     if (r.status() == 429) {
//         Duration wait = r.retryAfter().orElse(backoff.nextSleep());
//         Thread.sleep(wait.toMillis());
//         continue;
//     }
//     throw new IOException("non-retryable: " + r.status());
// }`}</CodeBlock>

        <p>
          Resilience4j ships a similar Retry config (we&apos;ll cover that in the next module). The point here is that the rate limiter and the retrying client are two halves of the same conversation. If the client retries naively, the rate limiter can&apos;t save you — they&apos;ll just refill the queue the moment the window resets. If the client backs off correctly, even a strict rate limiter feels reasonable.
        </p>

        <Quiz
          kind="Drill"
          question="Your API returns 503 to clients that exceed their per-user quota. A few hours later, on-call wakes up to a load spike. What did the wrong status code cost you?"
          options={[
            { label: "Nothing — 503 and 429 are interchangeable.", explanation: "They are not. Most retry libraries treat 503 as 'transient server problem, retry aggressively' and 429 as 'you're over budget, wait Retry-After.'" },
            { label: "503 signals a server-side problem; well-behaved clients escalate retries (more aggressive backoff, more parallel retries) thinking the server is melting. 429 would have told them to slow down. The status code itself amplified the spike.", correct: true, explanation: "Right. 429 = your fault, slow down. 503 = our fault, the system is overloaded. Returning 503 for a quota violation tells the client 'we're broken' instead of 'you're over budget.' Many retry libraries even change strategies based on this — it's not just cosmetic." },
            { label: "503 doesn't include Retry-After.", explanation: "Retry-After is valid on both 503 and 429. The semantic difference is what hurt you, not the headers." },
            { label: "503 is always cached.", explanation: "Caching behavior depends on Cache-Control headers, not the status code being 503." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="A client sees X-RateLimit-Remaining: 5 on the response. The window resets in 30 seconds. What's the well-behaved-client move?"
          options={[
            { label: "Fire all remaining requests immediately to use the budget.", explanation: "That gets you 429'd the moment you exceed the bucket and undercuts the whole point of the header." },
            { label: "Pace yourself — spread the remaining 5 across the next 30 seconds, or skip non-essential requests entirely.", correct: true, explanation: "Right. The headers exist so clients can pace themselves before being rejected. Pacing is a strictly better experience than rejection-and-retry, both for your client and for the server." },
            { label: "Ignore the header and let 429s drive your behavior.", explanation: "That's the binary experience the header was designed to fix. Once you have the data, use it." },
            { label: "Wait the full 30 seconds before any further requests.", explanation: "Wasteful. You have 5 requests of headroom — use them paced, save the 0-headroom moment for actually-urgent calls." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Policy and response shape decide whether rate limiting is a guardrail or an outage source."
          points={[
            { takeaway: "Compose multiple keys — IP for DDoS, user for fairness, endpoint for cost.", detail: <>A single key is rarely enough. The strongest pattern is overlapping limits: per-IP outer ring, per-user inner ring, per-endpoint cost-weighted limit.</> },
            { takeaway: "429 = your fault, slow down. 503 = our fault, retry.", detail: <>Picking the wrong status code changes how clients react. 503 escalates retries; 429 calms them. Use 429 for quota violations, 503 for actual server overload.</> },
            { takeaway: "X-RateLimit-Remaining on every response is the cheapest API ergonomics upgrade.", detail: <>Lets clients pace themselves before being rejected. Costs one header; saves a class of support tickets.</> },
            { takeaway: "Decorrelated jitter on the client makes the limiter actually work.", detail: <>Without jitter, all rejected clients retry at the same instant — a synchronized stampede. <code>min(cap, random(base, prev * 3))</code> is the AWS-recommended formula.</> },
            { takeaway: "Cost-weighted limiting handles expensive endpoints.", detail: <>Charge multiple tokens per expensive call. Otherwise one user can saturate your fleet by hitting <code>POST /report/generate</code> within their request-count budget.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: Resilience4j deep dive</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Rate limiting decides which requests get in. Circuit breakers decide what happens when downstream calls fail. Module 22 covers Resilience4j&apos;s circuit breaker, retry, bulkhead, and time limiter — and the order in which they should be composed.
        </p>
        <Link
          href="/courses/system-design/modules/resilience4j-deep"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-sky-600 hover:to-blue-600 transition no-underline"
        >
          Module 22: Resilience4j deep dive →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="rate-limiting" />
    </article>
  );
}
