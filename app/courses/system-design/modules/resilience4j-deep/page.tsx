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
  { id: "circuit-breaker", title: "Circuit breaker" },
  { id: "retry-bulkhead", title: "Retry, bulkhead, time limiter" },
  { id: "composition", title: "Composition & order" },
];

const cbStateMachine = `stateDiagram-v2
  [*] --> CLOSED
  CLOSED --> OPEN: failure ratio exceeds threshold
  OPEN --> HALF_OPEN: wait duration elapses
  HALF_OPEN --> CLOSED: trial calls succeed
  HALF_OPEN --> OPEN: trial calls fail`;

export default function Page() {
  const mod = getModuleBySlug("resilience4j-deep")!;

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
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="resilience4j-deep" />
        <ModuleProgress moduleSlug="resilience4j-deep" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🛡️</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Resilience4j is a small library that prevents large outages. By the end of this module you&apos;ll know how each of its four core pieces — circuit breaker, retry, bulkhead, time limiter — behaves, when to reach for which, and (the part most people get wrong) how to compose them in the right order.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Circuit breaker states (CLOSED, OPEN, HALF_OPEN) and the metrics that drive transitions</li>
          <li>Retry with exponential backoff and decorrelated jitter — and which exceptions are worth retrying</li>
          <li>Bulkheads (semaphore vs thread pool) for resource isolation</li>
          <li>Time limiter for runaway calls, separate from socket timeout</li>
          <li>The decorator stack order — bulkhead → time limiter → circuit breaker → retry → call — and why</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">Most production outages are not the original failure — they&apos;re what the system did in response. A downstream blips, every caller retries, the retries pile up, threads exhaust, the caller dies, and now you&apos;ve outaged a service that wasn&apos;t even broken. Resilience4j is the toolkit that prevents the cascade. The library is small and clean; the misuses are the interesting part.</p>
      </Callout>

      {/* PART 1 — Circuit breaker */}
      <Checkpoint moduleSlug="resilience4j-deep" id="circuit-breaker" title="Circuit breaker" xp={20} celebration="Circuit breaker fundamentals locked. CLOSED, OPEN, HALF_OPEN — clear in your head.">
      <section>
        <h2>Part 1: The circuit breaker</h2>

        <p>
          A circuit breaker is the simplest and most useful piece in Resilience4j. The mental model is electrical: when a downstream call fails too often, the breaker &quot;trips&quot; (opens) and short-circuits subsequent calls — they fail immediately without even attempting the network. After a wait period, the breaker tentatively allows a few trial calls; if those succeed, it closes again. The benefit is twofold: callers stop wasting time waiting for a downstream that&apos;s clearly broken, and the broken downstream gets a chance to recover without being hammered.
        </p>

        <h3>The three states</h3>

        <Mermaid chart={cbStateMachine} />

        <ul>
          <li><strong>CLOSED.</strong>{" "}Normal operation. Calls pass through. Resilience4j tracks success/failure on a sliding window.</li>
          <li><strong>OPEN.</strong>{" "}Calls fail-fast with <code>CallNotPermittedException</code>. The breaker stays open for a configured wait duration (typically 30-60s).</li>
          <li><strong>HALF_OPEN.</strong>{" "}A small number of trial calls (configurable, default 10) are permitted. If they meet the success threshold, the breaker closes; if not, it returns to OPEN for another wait period.</li>
        </ul>

        <h3>The metrics that drive transitions</h3>

        <p>
          Resilience4j supports two sliding-window strategies:
        </p>
        <ul>
          <li><strong>Count-based.</strong>{" "}Look at the last N calls. Trip if the failure rate exceeds the threshold. Predictable but biased toward recent past.</li>
          <li><strong>Time-based.</strong>{" "}Look at the last N seconds. Trip on the windowed failure rate. Better for low-traffic services where the count-based window can take a long time to fill.</li>
        </ul>

        <p>
          The threshold itself is a percentage, not a count — usually 50%. The <em>minimum number of calls</em>{" "}setting prevents tripping on a single failure when traffic is low: don&apos;t evaluate the breaker until you&apos;ve seen at least N calls.
        </p>

        <CodeBlock lang="java" caption="Configuring a circuit breaker">{`import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;

import java.time.Duration;

CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)
    .slidingWindowSize(50)
    .minimumNumberOfCalls(20)            // need 20 calls before evaluating
    .failureRateThreshold(50.0f)         // 50% failures trips the breaker
    .slowCallRateThreshold(80.0f)        // 80% slow calls also trips it
    .slowCallDurationThreshold(Duration.ofMillis(500))
    .waitDurationInOpenState(Duration.ofSeconds(30))
    .permittedNumberOfCallsInHalfOpenState(5)
    .automaticTransitionFromOpenToHalfOpenEnabled(true)
    .recordExceptions(IOException.class, TimeoutException.class)
    .ignoreExceptions(BusinessRuleException.class)
    .build();

CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
CircuitBreaker breaker = registry.circuitBreaker("payments");`}</CodeBlock>

        <h3>The slow-call threshold (often forgotten)</h3>

        <p>
          A breaker that only watches for thrown exceptions misses the most common production failure: the downstream that responds, but slowly. A 4-second response on a 100ms-budget endpoint is just as bad as a failure — your callers tie up threads waiting for it. The <code>slowCallRateThreshold</code> + <code>slowCallDurationThreshold</code> pair tells the breaker to count slow successes as failures for tripping purposes.
        </p>

        <Callout variant="warn" title="recordExceptions vs ignoreExceptions: get this right">
          <p className="m-0">By default, the breaker counts <em>every</em>{" "}exception as a failure. That&apos;s wrong for any exception that represents a business outcome — &quot;user not found,&quot; &quot;invalid input,&quot; &quot;duplicate key.&quot; If your service throws <code>BusinessRuleException</code> on every malformed request, every malformed request will trip the breaker on the downstream that didn&apos;t do anything wrong. Either set <code>recordExceptions</code> to a small allowlist of real failures (IOException, TimeoutException, the downstream-specific exceptions you care about), or set <code>ignoreExceptions</code> to exclude business outcomes. Forgetting this is the #1 source of phantom breaker trips.</p>
        </Callout>

        <h3>Spring Boot starter integration</h3>

        <p>
          The Spring Boot starter (<code>resilience4j-spring-boot3</code>) lets you declare circuit breakers in <code>application.yml</code> and apply them with <code>@CircuitBreaker(name = &quot;payments&quot;)</code>. Same config, less code:
        </p>

        <CodeBlock lang="java" caption="Declarative usage with Spring Boot">{`// application.yml
// resilience4j.circuitbreaker:
//   instances:
//     payments:
//       slidingWindowSize: 50
//       minimumNumberOfCalls: 20
//       failureRateThreshold: 50
//       slowCallRateThreshold: 80
//       slowCallDurationThreshold: 500ms
//       waitDurationInOpenState: 30s
//       permittedNumberOfCallsInHalfOpenState: 5

@Service
public class PaymentsClient {

    private final RestClient restClient;

    public PaymentsClient(RestClient restClient) {
        this.restClient = restClient;
    }

    @CircuitBreaker(name = "payments", fallbackMethod = "paymentsFallback")
    public PaymentStatus getStatus(String orderId) {
        return restClient.get()
            .uri("/payments/{id}", orderId)
            .retrieve()
            .body(PaymentStatus.class);
    }

    // Fallback signature must match plus a Throwable parameter
    public PaymentStatus paymentsFallback(String orderId, Throwable t) {
        // Don't lie — return a known UNKNOWN, log the breaker state,
        // and let the caller decide what to do.
        return PaymentStatus.unknown(orderId);
    }
}`}</CodeBlock>

        <Quiz
          kind="Quick check"
          question="Your circuit breaker is configured with failureRateThreshold=50% and minimumNumberOfCalls=20 on a count-based window of 50. After service start, calls 1-3 throw IOException. What happens?"
          options={[
            { label: "The breaker trips immediately — 100% failures.", explanation: "The breaker doesn't evaluate the failure rate until it has seen at least minimumNumberOfCalls (20). Until then, it stays CLOSED regardless of the rate." },
            { label: "The breaker stays CLOSED — it needs 20 calls before evaluating.", correct: true, explanation: "Right. minimumNumberOfCalls is the floor for evaluation. It exists precisely to prevent tripping on noise — 3 failures out of 3 calls is statistically meaningless. Once 20 calls accumulate, the breaker compares the failure rate to the threshold." },
            { label: "The breaker enters HALF_OPEN.", explanation: "HALF_OPEN is only entered after OPEN waits its waitDurationInOpenState. You can't go from CLOSED → HALF_OPEN." },
            { label: "The breaker tracks the failures but won't act until manual reset.", explanation: "The breaker is fully automatic — once minimumNumberOfCalls is reached, it transitions based on the failure rate." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="Your downstream returns a 404 for unknown user IDs. Your service throws UserNotFoundException, which extends RuntimeException. The default circuit breaker config is treating these as failures and tripping. What's the right fix?"
          options={[
            { label: "Catch UserNotFoundException higher up the stack.", explanation: "Catching it doesn't help — by the time you catch it, the breaker has already counted it. The fix has to happen at the breaker config level." },
            { label: "Add UserNotFoundException to ignoreExceptions on the breaker config — these are business outcomes, not infrastructure failures.", correct: true, explanation: "Right. The breaker exists to detect 'downstream is broken,' not 'this user doesn't exist.' Use ignoreExceptions for business-outcome exceptions or recordExceptions to whitelist only the truly infrastructure-level failures (IOException, TimeoutException, etc.). This is the most common circuit breaker config mistake." },
            { label: "Increase failureRateThreshold to 90%.", explanation: "That just delays the inevitable trip and makes the breaker useless when the downstream is actually broken. The real issue is that a business outcome shouldn't be counted as a failure at all." },
            { label: "Disable the circuit breaker for this endpoint.", explanation: "Throwing the baby out with the bathwater — you still want the breaker to catch real downstream failures." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="The circuit breaker is the central safety valve — but it only helps if the failure detection matches reality."
          points={[
            { takeaway: "Three states: CLOSED → OPEN → HALF_OPEN → CLOSED.", detail: <>OPEN fails fast for a wait period; HALF_OPEN runs trial calls; CLOSED is normal. Transitions are driven by a sliding-window failure rate.</> },
            { takeaway: "minimumNumberOfCalls prevents tripping on noise.", detail: <>The breaker only evaluates the failure rate after enough samples. Without this, three failures on startup would trip a breaker on a perfectly healthy downstream.</> },
            { takeaway: "Slow calls count too — set slowCallRateThreshold and slowCallDurationThreshold.", detail: <>The most common production failure is a downstream that responds slowly. A breaker that only watches exceptions misses this completely.</> },
            { takeaway: "Use recordExceptions or ignoreExceptions to filter business outcomes.", detail: <>Default behavior counts every exception as a failure — catastrophic if your service throws domain exceptions on normal user behavior.</> },
            { takeaway: "Spring Boot starter makes the config declarative.", detail: <>Configure in application.yml, apply with @CircuitBreaker(name = &quot;...&quot;), define a fallback method matching the original signature plus Throwable.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2 — Retry, bulkhead, time limiter */}
      <Checkpoint moduleSlug="resilience4j-deep" id="retry-bulkhead" title="Retry, bulkhead, time limiter" xp={25} celebration="The other three building blocks make sense now.">
      <section>
        <h2>Part 2: Retry, bulkhead, and time limiter</h2>

        <h3>Retry</h3>

        <p>
          Retry is the second-most-used building block, and the second-most-misused. The right intuition: <strong>retry is for transient failures, not for &quot;the call didn&apos;t work.&quot;</strong>{" "}A transient failure is a network blip, a brief deployment, a momentary GC pause on a downstream. A non-transient failure is &quot;the user doesn&apos;t exist,&quot; &quot;authentication failed,&quot; &quot;the request was malformed.&quot; Retrying the second class is pure waste — it will fail the same way every time, and you&apos;ve multiplied the load on a service that wasn&apos;t struggling.
        </p>

        <CodeBlock lang="java" caption="Retry with exponential backoff and jitter">{`import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.core.IntervalFunction;

import java.time.Duration;

RetryConfig retryConfig = RetryConfig.custom()
    .maxAttempts(3)
    .intervalFunction(
        // Exponential backoff: 100ms, 200ms, 400ms — with random jitter
        IntervalFunction.ofExponentialRandomBackoff(
            Duration.ofMillis(100),  // initial
            2.0,                      // multiplier
            0.5                       // randomization factor (0..1)
        )
    )
    .retryOnException(t ->
        t instanceof IOException ||
        t instanceof TimeoutException
    )
    .retryOnResult(response -> response instanceof HttpResponse r && r.statusCode() == 503)
    .failAfterMaxAttempts(true)
    .build();

Retry retry = Retry.of("payments", retryConfig);`}</CodeBlock>

        <p>
          A few things to call out. <code>retryOnException</code> filters which exceptions are worth retrying — IOException and TimeoutException usually are; UserNotFoundException is not. <code>retryOnResult</code> retries based on the return value, useful for HTTP responses. The <code>ofExponentialRandomBackoff</code> interval function adds randomization on top of exponential growth — without the randomization, all your clients retry in lockstep and you re-create the original spike.
        </p>

        <Callout variant="warn" title="Retry storms — the most common cause of self-inflicted outages">
          <p className="m-0">Three layers of your stack each have a 3-attempt retry. A single failed call in production becomes 27 attempts at the deepest service. Multiply by your fleet size and you&apos;ve invented a retry-amplified DDoS on your own backend. Rules: pick exactly one layer that owns retry behavior (usually the outermost service-to-service caller); set retry budgets so you can&apos;t exceed N% retries even under sustained failure; and make sure the call you&apos;re retrying is idempotent before you turn retry on at all.</p>
        </Callout>

        <h3>Bulkhead</h3>

        <p>
          A bulkhead limits how many calls can be in flight to a particular dependency at the same time. The metaphor is the watertight compartments in a ship — flooding one compartment doesn&apos;t sink the rest. If your inventory service goes slow, the bulkhead caps how many threads can be stuck waiting on it; everyone else still has thread pool to do their work. Without a bulkhead, one slow downstream can consume all your worker threads and bring down every endpoint, including ones that don&apos;t even talk to that downstream.
        </p>

        <p>
          Resilience4j ships two bulkhead implementations:
        </p>
        <ul>
          <li><strong>SemaphoreBulkhead.</strong>{" "}A counter that tracks in-flight calls; new calls are rejected (or wait briefly) when the limit is reached. Lightweight, the standard choice for synchronous code.</li>
          <li><strong>ThreadPoolBulkhead.</strong>{" "}A bounded thread pool that the call runs on. Stronger isolation (calls don&apos;t even consume the calling thread) but more overhead. Use when you need true isolation, e.g. CPU-intensive work or untrusted dependencies.</li>
        </ul>

        <CodeBlock lang="java" caption="Semaphore bulkhead — cap concurrent calls to a downstream">{`import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;

import java.time.Duration;

BulkheadConfig config = BulkheadConfig.custom()
    .maxConcurrentCalls(20)              // at most 20 in-flight to payments
    .maxWaitDuration(Duration.ofMillis(50))  // wait up to 50ms for a slot, else reject
    .build();

Bulkhead bulkhead = Bulkhead.of("payments", config);

// Caller-side: BulkheadFullException if no slot is available within maxWaitDuration.
// Slow-but-eventually-OK calls won't tie up more than 20 of your worker threads.`}</CodeBlock>

        <h3>Time limiter</h3>

        <p>
          A time limiter caps how long a call is allowed to take. You might think your socket timeout already does that — but socket timeouts only cover network reads, not the entire chain (DNS resolution, TLS handshake, queueing inside the client, etc.). A pure socket timeout of 1 second can still take 10 seconds wall-clock when the connection pool is exhausted and the call sits in the queue. The time limiter wraps the whole future in a deadline.
        </p>

        <CodeBlock lang="java" caption="Time limiter — bound the wall-clock duration of a call">{`import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

TimeLimiterConfig config = TimeLimiterConfig.custom()
    .timeoutDuration(Duration.ofSeconds(2))
    .cancelRunningFuture(true)
    .build();

TimeLimiter timeLimiter = TimeLimiter.of("payments", config);

CompletableFuture<PaymentStatus> future =
    CompletableFuture.supplyAsync(() -> client.getStatus(orderId),
                                  Executors.newCachedThreadPool());

PaymentStatus status = timeLimiter.executeFutureSupplier(() -> future);
// throws TimeoutException if it takes longer than 2 seconds.`}</CodeBlock>

        <ClassifyChallenge
          title="Pick the right tool"
          prompt="For each problem, which Resilience4j building block is the primary fix?"
          buckets={[
            { id: "cb", label: "Circuit breaker", color: "rose" },
            { id: "retry", label: "Retry", color: "amber" },
            { id: "bulkhead", label: "Bulkhead", color: "indigo" },
            { id: "tl", label: "Time limiter", color: "emerald" },
          ]}
          items={[
            { id: "p1", label: "A downstream is consistently failing — every call returns 5xx and ties up threads waiting for the timeout", answer: "cb", explanation: "Circuit breaker. Once a downstream is broken, calls should fail-fast instead of waiting for timeouts. Retry/bulkhead/time-limiter all still pay the latency tax; CB skips it entirely." },
            { id: "p2", label: "A network blip drops 1 in 1000 requests — a single retry would mask it cleanly", answer: "retry", explanation: "Retry handles transient errors. Just make sure the call is idempotent and the retry-on-exception filter is tight enough not to hide real failures." },
            { id: "p3", label: "A slow inventory service is consuming all 200 threads in your pool, starving every other endpoint", answer: "bulkhead", explanation: "Bulkhead. Cap concurrent calls per dependency so one slow downstream can't hog the entire thread pool." },
            { id: "p4", label: "A request occasionally takes 30 seconds when DNS resolution stalls — socket timeout doesn't catch it", answer: "tl", explanation: "Time limiter wraps wall-clock duration of the whole call (resolution, handshake, queueing). Socket timeout only covers network reads." },
            { id: "p5", label: "On startup, three early calls fail because a config service hasn't booted yet — but it'll be up in 2 seconds", answer: "retry", explanation: "Retry with exponential backoff handles startup race conditions cleanly. Don't trip the breaker for this — these calls aren't a downstream failure, they're a startup timing artifact." },
            { id: "p6", label: "A misbehaving downstream is responding in 8 seconds when SLA is 200ms — slow successes are dragging the whole service down", answer: "cb", explanation: "Circuit breaker with slowCallRateThreshold counts slow successes as failures and trips. The time limiter bounds individual calls; the breaker bounds the aggregate slow-call problem." },
          ]}
        />

        <Quiz
          kind="Drill"
          question="A coworker enables retry on a 'transfer money' endpoint with maxAttempts=3. The first call succeeds at the bank but the response is lost in transit. Retries 2 and 3 also succeed at the bank. What just happened?"
          options={[
            { label: "Nothing — Resilience4j deduplicates retries.", explanation: "Resilience4j has no idea what your call does. It re-invokes the supplier, end of story." },
            { label: "The customer was charged three times because the call wasn't idempotent. Retry without idempotency is a money-loss bug.", correct: true, explanation: "Right. Retry is only safe on idempotent operations. For mutations, you need an idempotency key (we cover this in the next module) so the downstream can detect 'I've seen this exact request before' and return the same result without re-executing. Retry first, idempotency first — preferably both." },
            { label: "Resilience4j throws an exception when an operation is non-idempotent.", explanation: "Resilience4j doesn't know what's idempotent — that's the developer's responsibility to assert." },
            { label: "Spring Boot autoconfig prevents this.", explanation: "Spring Boot doesn't and can't know which operations are safe to retry." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="When does a thread-pool bulkhead make more sense than a semaphore bulkhead?"
          options={[
            { label: "Always — thread-pool bulkheads are strictly better.", explanation: "They're heavier (extra thread switches, separate pool to size and monitor). Use them when their isolation is worth the overhead." },
            { label: "When you need true thread isolation — e.g. for CPU-intensive work, untrusted code, or to prevent the calling thread itself from being blocked.", correct: true, explanation: "Right. The semaphore bulkhead caps how many calls run on the caller's thread pool; the thread-pool bulkhead runs them on a dedicated, bounded pool. The latter is stronger isolation at the cost of overhead. For typical IO-bound microservice calls, semaphore is enough." },
            { label: "When you have more than 100 concurrent calls.", explanation: "The number of concurrent calls is a sizing question, not a bulkhead-type question. Both kinds scale fine to high concurrency if sized right." },
            { label: "Only with reactive/async code.", explanation: "Both kinds work with async code; in fact ThreadPoolBulkhead is sometimes the wrong choice for reactive stacks because it forces a thread switch." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Retry, bulkhead, and time limiter each handle a different failure mode — and each have a sharp footgun."
          points={[
            { takeaway: "Retry is for transient failures only — and only on idempotent calls.", detail: <>Retrying non-idempotent operations duplicates side effects (charges, emails, writes). Filter exceptions tightly with retryOnException.</> },
            { takeaway: "Layered retries multiply — pick exactly one layer to own retry.", detail: <>Three layers of 3 retries = 27 attempts at the deepest service. The outermost service-to-service caller is usually the right place.</> },
            { takeaway: "Bulkheads stop one slow downstream from starving the whole pool.", detail: <>Cap concurrent calls per dependency. Without bulkheads, a single slow downstream can wedge every endpoint of your service simultaneously.</> },
            { takeaway: "Time limiter bounds wall-clock duration; socket timeout doesn't.", detail: <>Socket timeout only covers network reads. DNS, TLS handshake, queueing inside the connection pool — none of those are bounded without a time limiter.</> },
            { takeaway: "Slow successes are failures too — circuit breaker with slowCallRateThreshold.", detail: <>The most common real failure isn&apos;t exceptions; it&apos;s degraded latency. Configure both rate and duration thresholds.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3 — Composition */}
      <Checkpoint moduleSlug="resilience4j-deep" id="composition" title="Composition & order" xp={25} celebration="Decorator order — bulkhead, time limiter, breaker, retry, call. Burned in.">
      <section>
        <h2>Part 3: Composing the decorators (order matters)</h2>

        <p>
          You almost never use just one of these in production. A serious downstream call has all four: bulkhead to cap concurrency, time limiter to bound duration, circuit breaker to fail-fast on a broken dependency, retry to handle transient blips. The order they wrap the call in is not a stylistic choice — it changes the semantics meaningfully.
        </p>

        <h3>The recommended outer-to-inner order</h3>

        <p>
          The reasoning, layer by layer, going from outermost wrapper to the actual call:
        </p>
        <ol>
          <li><strong>Retry (outermost).</strong>{" "}Each retry attempt should re-enter the rest of the stack fresh — including a fresh circuit-breaker check. If retry were inside the breaker, a retry storm during a brief glitch would happen entirely inside the breaker before it had a chance to trip.</li>
          <li><strong>Circuit breaker.</strong>{" "}Once retry decides it&apos;s going to attempt, the breaker decides whether the dependency is healthy enough to even try. A tripped breaker fails fast without consuming bulkhead slots or thread pool budget.</li>
          <li><strong>Bulkhead.</strong>{" "}Among the calls that pass the breaker, the bulkhead caps concurrency. This stops a successful breaker (CLOSED) from letting unlimited calls pile up against a slow downstream.</li>
          <li><strong>Time limiter.</strong>{" "}Inside the bulkhead, the time limiter bounds individual call duration so a stuck call doesn&apos;t hold its bulkhead slot forever.</li>
          <li><strong>The actual call (innermost).</strong></li>
        </ol>

        <Callout variant="insight" title="The wrong order is silently broken">
          <p className="m-0">If you put the breaker outside retry, every retry shares the same breaker decision — a single down-state at retry time means all 3 attempts skip the call. That defeats the whole point of retry. Conversely, if you put the bulkhead outside the breaker, a tripped breaker still consumes bulkhead slots on every fail-fast call. The ordering above (retry → breaker → bulkhead → time limiter → call) is what gets you the semantics you want from each piece.</p>
        </Callout>

        <h3>Composing manually</h3>

        <CodeBlock lang="java" caption="Manual decorator composition">{`import io.github.resilience4j.decorators.Decorators;

Supplier<PaymentStatus> decorated = Decorators.ofSupplier(
        () -> paymentsClient.getStatus(orderId)
    )
    .withBulkhead(bulkhead)
    .withCircuitBreaker(breaker)
    .withRetry(retry, scheduler)        // retry is the OUTERMOST in the stack
    .decorate();

// Note: with the Decorators builder, the LAST .with*() call ends up the
// outermost wrapper. Read the chain bottom-up to see the runtime order.

PaymentStatus status = decorated.get();`}</CodeBlock>

        <p>
          With <code>Decorators.ofSupplier(...).with*()</code>, each <code>.with*</code> wraps the previous result. So the last <code>.with*</code> in the chain is the outermost layer at runtime. In the snippet above, <code>withRetry</code> is called last — meaning retry is the outermost wrapper, which is what we want.
        </p>

        <h3>Composing declaratively</h3>

        <p>
          With the Spring Boot starter, all four annotations can be stacked on the same method. Spring composes them in the right order automatically:
        </p>

        <CodeBlock lang="java" caption="Declarative composition with Spring Boot annotations">{`@Service
public class PaymentsClient {

    @Bulkhead(name = "payments", type = Bulkhead.Type.SEMAPHORE)
    @TimeLimiter(name = "payments")
    @CircuitBreaker(name = "payments", fallbackMethod = "fallback")
    @Retry(name = "payments")
    public CompletableFuture<PaymentStatus> getStatus(String orderId) {
        return CompletableFuture.supplyAsync(() ->
            restClient.get()
                .uri("/payments/{id}", orderId)
                .retrieve()
                .body(PaymentStatus.class)
        );
    }

    public CompletableFuture<PaymentStatus> fallback(String orderId, Throwable t) {
        return CompletableFuture.completedFuture(PaymentStatus.unknown(orderId));
    }
}

// resilience4j-spring-boot3 applies these annotations in a fixed precedence:
// Retry (outermost) → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead.
// The CompletableFuture return type is required when @TimeLimiter is in play.`}</CodeBlock>

        <h3>The fallback method</h3>

        <p>
          Every breaker (and every retry that has exhausted attempts) can hand off to a fallback method. Two rules: the signature must match the original plus a trailing <code>Throwable</code> parameter, and the fallback should not lie to the caller. Don&apos;t silently return success when the call failed — return a known &quot;unknown&quot; or &quot;degraded&quot; result and log/metric the failure. Lying fallbacks turn outages into mystery bugs three days later.
        </p>

        <Quiz
          kind="Drill"
          question="An engineer composes the decorators as: bulkhead → retry → circuit breaker → call (where bulkhead is the OUTERMOST wrapper). What's wrong with this order?"
          options={[
            { label: "Nothing — order doesn't matter, it all works out the same.", explanation: "Order matters significantly. The decorator at any layer only sees the behavior produced by inner layers." },
            { label: "Retry is inside the bulkhead, so all 3 retry attempts share one bulkhead slot — fine. But retry is OUTSIDE the circuit breaker, so once the breaker is OPEN, every retry attempt fails-fast — meaning retry can't help on an actually-transient blip if the breaker was tripped.", explanation: "The fail-fast on retry attempts is actually fine — it's what you want. The real issue is different — read the other options." },
            { label: "Retry is INSIDE the bulkhead — meaning all 3 retry attempts hold the same bulkhead slot for the entire backoff sequence. A single retrying call can hold a bulkhead slot for seconds, starving other callers.", correct: true, explanation: "Right. Retry should be the outermost wrapper, so each attempt re-enters the rest of the stack (acquires a fresh bulkhead slot, re-checks the breaker). Retry inside the bulkhead means one user with bad luck holds a slot through their entire retry budget. The recommended order is retry → breaker → bulkhead → time limiter → call (outer → inner)." },
            { label: "The circuit breaker is inside everything — that's always wrong.", explanation: "Breaker placement isn't always wrong here — it's inside both retry and bulkhead, which is the recommended position. The bug is retry being inside bulkhead." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="A fallback method silently returns an empty list when the inventory service is down. Two weeks later, customers see 'no products available' on the homepage during a downstream blip. What was the bug?"
          options={[
            { label: "The circuit breaker tripped — that's the bug.", explanation: "The breaker tripping was correct. The issue is what the fallback chose to return." },
            { label: "The fallback lied — an empty list looks indistinguishable from 'we genuinely have no inventory.' The right move is either to throw a degraded-mode exception (so the caller can show 'inventory temporarily unavailable') or to serve a cached snapshot. Returning empty is the worst option.", correct: true, explanation: "Right. Fallbacks should preserve the distinction between 'we don't know' and 'we know it's empty.' The most common patterns: serve a stale cached value, return a sentinel (Optional.empty + a log), or propagate a domain-specific 'temporarily degraded' signal that the caller can render as a banner. Silent empties are how outages turn into product bugs." },
            { label: "The circuit breaker should never have been added.", explanation: "The circuit breaker is doing its job — protecting the rest of the system. The bug is downstream of that, in the fallback." },
            { label: "Need more aggressive retry to avoid hitting the fallback.", explanation: "More retry just delays hitting the fallback and amplifies load on a struggling service. The fallback's behavior is the actual issue." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Composition order changes semantics. Get retry on the outside and don't let fallbacks lie."
          points={[
            { takeaway: "Outer-to-inner: retry → circuit breaker → bulkhead → time limiter → call.", detail: <>Each layer&apos;s purpose only works if it sees the behavior produced by the inner layers. Retry must wrap the breaker so each attempt re-checks state.</> },
            { takeaway: "Spring Boot annotations compose in a fixed precedence — read the docs for your version.", detail: <>resilience4j-spring-boot3 applies Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead. You can stack the annotations and trust the order.</> },
            { takeaway: "Fallback signatures must match the original method plus a trailing Throwable.", detail: <>If the signature doesn&apos;t match, Resilience4j silently doesn&apos;t use your fallback — and the original exception propagates as if you never set one.</> },
            { takeaway: "Don't let fallbacks lie.", detail: <>Returning &quot;empty list&quot; for &quot;service is down&quot; turns infrastructure outages into product bugs. Return a sentinel, a cached snapshot, or a domain-specific degraded signal.</> },
            { takeaway: "Time limiter requires CompletableFuture (or a similar async wrapper).", detail: <>The time limiter cancels a Future on timeout — synchronous methods can&apos;t be cancelled mid-call. The annotation form requires the method to return CompletableFuture.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: idempotency</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          We just established that retry is only safe on idempotent operations. Module 20 builds the other half of that contract: idempotency keys, dedupe tables, and how Stripe-style APIs make retries safe even on mutations.
        </p>
        <Link
          href="/courses/system-design/modules/idempotency"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-sky-600 hover:to-blue-600 transition no-underline"
        >
          Module 20: Idempotency →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="resilience4j-deep" />
    </article>
  );
}
