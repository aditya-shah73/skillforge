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

const CHECKPOINTS = [
  { id: "signals", title: "Signals & methods" },
  { id: "instrumentation", title: "Instrumentation" },
  { id: "alerts", title: "Alerts & dashboards" },
];

const traceDiagram = `sequenceDiagram
  participant C as Client
  participant G as Gateway
  participant O as orders-svc
  participant P as payments-svc
  participant D as DB
  C->>G: POST /orders [trace=t1]
  G->>O: POST /orders [trace=t1, span=A]
  O->>D: INSERT order [trace=t1, span=B parent=A]
  O->>P: POST /charges [trace=t1, span=C parent=A]
  P-->>O: 201
  O-->>G: 201
  G-->>C: 201`;

export default function Page() {
  const mod = getModuleBySlug("observability")!;

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
        <ModuleProgress moduleSlug="observability" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📡</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Observability is what lets you answer the question &quot;why is it slow / broken / weird?&quot; without SSHing into a box. By the end of this module you&apos;ll know which signals are worth instrumenting, the difference between RED and USE, how distributed tracing actually works, and what to alert on so the on-call rotation stays sane.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>The four golden signals (latency, traffic, errors, saturation) and when each one fires first</li>
          <li>RED for request-driven services, USE for resources — when to use which</li>
          <li>Metrics, logs, traces — the three pillars and what each is actually for</li>
          <li>OpenTelemetry + Micrometer in a Spring app — minimal, production-grade setup</li>
          <li>Symptom-based alerts vs cause-based alerts — and why the second one wakes you up at 3am for nothing</li>
        </ul>
      </section>

      <Callout variant="info" title="Why this matters">
        <p className="m-0">A service you can&apos;t observe is a service you can&apos;t operate. Most of the difference between &quot;senior engineer&quot; and &quot;just shipping code&quot; is whether you instinctively reach for a dashboard before reaching for a debugger. Observability is upstream of every other reliability practice — without it, all the circuit breakers and rate limiters in the world are running blind.</p>
      </Callout>

      {/* PART 1 — Signals */}
      <Checkpoint moduleSlug="observability" id="signals" title="Signals & methods" xp={20} celebration="The vocabulary is yours. RED, USE, golden signals — when each applies.">
      <section>
        <h2>Part 1: The signals worth watching</h2>

        <h3>The four golden signals</h3>

        <p>
          Google&apos;s SRE book popularized this list, and it stuck because it&apos;s genuinely useful. For any service, four metrics together tell you almost everything you need at the top level:
        </p>
        <ul>
          <li><strong>Latency.</strong> How long requests take. Always look at percentiles — p50, p95, p99 — never averages. Average latency is meaningless when 99% of requests take 10ms and 1% take 5 seconds.</li>
          <li><strong>Traffic.</strong> How much demand the service is seeing. Requests per second, queries per second, messages consumed per second. Without traffic context, the other three numbers can&apos;t be interpreted.</li>
          <li><strong>Errors.</strong> Rate of failed requests. Both explicit failures (5xx, exceptions) and implicit ones (200 OK that returned the wrong answer). The implicit ones are why you also need business-level metrics.</li>
          <li><strong>Saturation.</strong> How &quot;full&quot; the service is. CPU utilization, memory pressure, queue depth, connection pool usage. Saturation usually moves before latency does — it&apos;s the leading indicator for impending breakdown.</li>
        </ul>

        <h3>RED — for request-driven services</h3>

        <p>
          RED is a pragmatic subset of the four golden signals, designed for HTTP/RPC services:
        </p>
        <ul>
          <li><strong>Rate.</strong> Requests per second.</li>
          <li><strong>Errors.</strong> Failed requests per second.</li>
          <li><strong>Duration.</strong> Latency distribution.</li>
        </ul>
        <p>
          Notice what&apos;s missing: saturation. RED assumes you&apos;re fronting a request-handling service where saturation is captured indirectly through duration (saturated services get slow). For a typical Spring REST service, RED is the right top-level dashboard.
        </p>

        <h3>USE — for resources</h3>

        <p>
          USE applies to things that aren&apos;t request-driven — pools, queues, caches, disks:
        </p>
        <ul>
          <li><strong>Utilization.</strong> Percentage of time the resource is busy.</li>
          <li><strong>Saturation.</strong> Amount of queued/extra work waiting.</li>
          <li><strong>Errors.</strong> Failed operations on the resource.</li>
        </ul>
        <p>
          USE is the right model for a database connection pool, a Kafka consumer, a cache, a thread pool. RED would be the wrong frame — there&apos;s no &quot;request rate&quot; for a thread pool. USE is the &quot;is the resource healthy?&quot; checklist.
        </p>

        <h3>The three pillars: metrics, logs, traces</h3>

        <p>
          Metrics, logs, and traces all let you observe systems but they answer different questions. Picking the right pillar for the question is most of the skill.
        </p>
        <ul>
          <li><strong>Metrics.</strong> Aggregates over time. &quot;What is the p99 latency right now?&quot; &quot;How many 500s in the last 5 minutes?&quot; Cheap to store at scale; cheap to query. Useless for &quot;why did <em>this</em> request fail?&quot; — they&apos;ve aggregated away the per-request detail.</li>
          <li><strong>Logs.</strong> Per-event records. &quot;What did this specific request do?&quot; Rich context, expensive at volume. Structured logging (JSON, queryable fields) beats unstructured every time.</li>
          <li><strong>Traces.</strong> The path of a single request through multiple services. &quot;Where did the time go?&quot; &quot;Which downstream is the slow one?&quot; The unique value of traces is showing the cross-service shape of latency.</li>
        </ul>

        <Callout variant="insight" title="Pick the pillar that matches the question">
          <p className="m-0">Metrics tell you something is wrong. Traces tell you where in the request flow it&apos;s wrong. Logs tell you what specifically went wrong. The investigation almost always goes metric → trace → log: the dashboard alerts on a p99 spike, the tracer shows the slow span is in payments-svc, the logs in payments-svc explain what was actually happening at that timestamp. Each pillar is bad at the others&apos; jobs — don&apos;t try to grep your way through gigabytes of logs to compute a percentile.</p>
        </Callout>

        <ClassifyChallenge
          title="Pick the right tool for the question"
          prompt="For each question, which pillar (or which method) is the right primary tool?"
          buckets={[
            { id: "metrics", label: "Metrics", color: "sky" },
            { id: "logs", label: "Logs", color: "amber" },
            { id: "traces", label: "Traces", color: "indigo" },
            { id: "use", label: "USE method", color: "violet" },
          ]}
          items={[
            { id: "q1", label: "Why is the p99 latency on /orders 4x higher than yesterday?", answer: "traces", explanation: "Traces show where time is being spent across services. Metrics confirmed the symptom; traces find the slow span." },
            { id: "q2", label: "What was the request body for the order that returned 500 at 14:32:07?", answer: "logs", explanation: "Logs hold per-request context. Metrics have aggregated this away; traces tell you it failed but rarely carry the full body." },
            { id: "q3", label: "What's our current error rate vs last week's same time?", answer: "metrics", explanation: "Counts and rates over time are exactly what metrics are for. Cheap, fast, and time-series-ready." },
            { id: "q4", label: "Is the database connection pool saturated?", answer: "use", explanation: "USE is the resource framework — utilization, saturation, errors. The connection pool is a resource, not a request handler." },
            { id: "q5", label: "How many requests per second is the gateway serving by route?", answer: "metrics", explanation: "Counter metrics tagged by route. The classic Prometheus / Micrometer use case." },
            { id: "q6", label: "Which downstream call dominates the slow tail of /checkout?", answer: "traces", explanation: "Traces decompose request latency by span. This is exactly what they're for." },
          ]}
        />

        <Quiz
          kind="Quick check"
          question="Your service's average latency is 50ms, which is well under SLA. Customers are complaining of slowness. What's the most likely issue, and which signal would have caught it?"
          options={[
            { label: "Customers are wrong — averages are authoritative.", explanation: "Averages are systematically misleading for latency. A few slow requests barely move the average but ruin the user experience." },
            { label: "Tail latency: p99 is probably 5+ seconds while average is 50ms. A small fraction of requests are catastrophically slow, hitting a small fraction of customers hard. Always look at percentiles, never averages.", correct: true, explanation: "Right. Latency distributions are heavy-tailed in production — a long thin tail of slow requests is invisible in the mean. A canonical example: 99% of requests take 10ms, 1% take 5s. Average = ~60ms (looks fine). p99 = 5000ms (the experience your customers are reporting). Always alert on percentiles." },
            { label: "Network must be broken.", explanation: "Could be — but you wouldn't know without looking at percentiles. The average alone doesn't differentiate network blip from one slow downstream." },
            { label: "Average is fine, customers must be confused.", explanation: "Customers experience individual requests, not averages. If their p99 is 5s, that's their reality regardless of your mean." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="An engineer wants to add 30 new metrics to a service: count of every method called, average duration of every method, count of exceptions of every type, etc. What's the right pushback?"
          options={[
            { label: "Cardinality and signal-to-noise. Most of those metrics will never inform a decision; they cost storage and visual real estate, and they make the dashboard a fog of green lines. Start with RED at the API boundary, USE on the resources, and add specific metrics as questions arise — not preemptively.", correct: true, explanation: "Right. The instinct to instrument everything is sympathetic but expensive: cardinality explodes (especially when tagged with user IDs or paths), dashboards become unreadable, and you're paying storage to never look at most of it. Instrument at the boundaries (RED on the API, USE on the resources), then add inner metrics when a specific failure mode demands them. 'You can't read 30 dashboards' — the instinct should be reduce, not add." },
            { label: "30 metrics isn't enough — encourage them to add 100.", explanation: "More metrics with no plan to read them is pure cost." },
            { label: "Every method must be instrumented for full coverage.", explanation: "Coverage of what? Coverage doesn't mean useful. Most internal methods don't need separate metrics — their effect is captured at the API boundary." },
            { label: "The engineer is right; don't push back.", explanation: "Pushback is exactly the right move. Less data, more thought." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Pick the right signal and the right pillar — the rest is implementation."
          points={[
            { takeaway: "Four golden signals: latency, traffic, errors, saturation.", detail: <>Top-level health for any service. Saturation is the leading indicator; latency and errors are the lagging ones the user sees.</> },
            { takeaway: "RED for request services, USE for resources.", detail: <>RED (Rate, Errors, Duration) on HTTP/RPC handlers. USE (Utilization, Saturation, Errors) on pools, queues, caches.</> },
            { takeaway: "Latency is always percentiles, never averages.", detail: <>p50, p95, p99 — and ideally p999 for high-volume services. Averages hide the tail that&apos;s ruining the user experience.</> },
            { takeaway: "Three pillars, three jobs.", detail: <>Metrics: aggregates over time. Logs: per-event detail. Traces: cross-service request shape. Use the one that matches the question.</> },
            { takeaway: "Investigate metric → trace → log.", detail: <>Dashboard tells you something is wrong. Trace shows where. Logs explain what. Each pillar is bad at the others&apos; jobs.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 2 — Instrumentation */}
      <Checkpoint moduleSlug="observability" id="instrumentation" title="Instrumentation" xp={25} celebration="Instrumentation wired up. Metrics, traces, structured logs all flowing.">
      <section>
        <h2>Part 2: Instrumenting a Spring service</h2>

        <h3>Metrics with Micrometer</h3>

        <p>
          Micrometer is the de facto Java metrics facade. It abstracts over Prometheus, Datadog, New Relic, etc. — write Micrometer code, swap the backend by changing a dependency. Spring Boot Actuator wires Micrometer in by default; the basic JVM, HTTP, and connection-pool metrics come for free.
        </p>

        <CodeBlock lang="java" caption="Custom metrics with Micrometer">{`import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.Tags;

@Service
public class OrderService {

    private final Counter ordersCreated;
    private final Counter ordersFailed;
    private final Timer orderLatency;

    public OrderService(MeterRegistry registry) {
        this.ordersCreated = Counter.builder("orders.created")
            .description("Number of orders successfully created")
            .register(registry);
        this.ordersFailed = Counter.builder("orders.failed")
            .description("Number of orders that failed to create")
            .register(registry);
        this.orderLatency = Timer.builder("orders.create.latency")
            .description("Latency of order creation")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(registry);
    }

    public Order create(OrderRequest req) {
        return orderLatency.record(() -> {
            try {
                Order o = doCreate(req);
                ordersCreated.increment();
                return o;
            } catch (Exception e) {
                // Tag failures by reason so we can see WHY orders fail
                ordersFailed.increment();
                throw e;
            }
        });
    }
}

// Caveat: don't tag metrics with high-cardinality fields (userId, orderId,
// requestId). Each unique tag value creates a separate time series. A million
// users = a million series = your metrics backend OOMs. Tags should be
// low-cardinality (status code, route name, method, downstream name).`}</CodeBlock>

        <h3>Distributed tracing with OpenTelemetry</h3>

        <p>
          A trace is the path of a single request through every service that touches it. Each service contributes spans to the same trace ID; spans have parent IDs to form a tree. The result is a flame graph showing exactly where time was spent across the whole system.
        </p>

        <Mermaid chart={traceDiagram} />

        <p>
          OpenTelemetry (OTel) is the cross-language standard. The Java agent — <code>opentelemetry-javaagent.jar</code> — auto-instruments most Spring, JDBC, Kafka, and HTTP client code without you writing any code. Add it as a JVM startup flag and traces start flowing:
        </p>

        <CodeBlock lang="plain" caption="Enabling the OpenTelemetry Java agent">{`# JVM flags
java \\
  -javaagent:/opt/opentelemetry-javaagent.jar \\
  -Dotel.service.name=orders-svc \\
  -Dotel.exporter.otlp.endpoint=http://otel-collector:4317 \\
  -Dotel.traces.sampler=parentbased_traceidratio \\
  -Dotel.traces.sampler.arg=0.05 \\
  -jar app.jar

# 5% sampling above. For low-volume services, sample at 100%.
# For high-volume services, head sampling at 1-10% is normal —
# you can also use tail-based sampling at the OTel collector to
# always keep traces with errors or high latency.`}</CodeBlock>

        <p>
          For custom spans where the auto-instrumentation isn&apos;t enough, the OTel API gives you explicit span control:
        </p>

        <CodeBlock lang="java" caption="Custom spans for important business operations">{`import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;

@Service
public class FraudCheckService {

    private final Tracer tracer = GlobalOpenTelemetry.getTracer("orders-svc");

    public FraudResult check(Order order) {
        Span span = tracer.spanBuilder("fraud.check")
            .setAttribute("order.id", order.id())
            .setAttribute("order.amount_cents", order.amountCents())
            .startSpan();
        try (Scope ignored = span.makeCurrent()) {
            FraudResult result = doCheck(order);
            span.setAttribute("fraud.score", result.score());
            return result;
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR);
            throw e;
        } finally {
            span.end();
        }
    }
}`}</CodeBlock>

        <h3>Structured logging with MDC</h3>

        <p>
          Logs are useful in proportion to how queryable they are. A free-text log line saying &quot;order 12345 failed because timeout&quot; is hard to query at scale. The same information emitted as <code>{`{"event":"order.failed","order_id":"12345","reason":"timeout"}`}</code> is one Loki / Splunk / CloudWatch query away from a count, a chart, or a list.
        </p>

        <p>
          MDC (Mapped Diagnostic Context) is the SLF4J mechanism for adding contextual fields to every log line in a request. Wire the trace ID and request ID into MDC at the start of each request and they propagate to every log line emitted in that request — automatically.
        </p>

        <CodeBlock lang="java" caption="MDC for correlated structured logging">{`import org.slf4j.MDC;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest http = (HttpServletRequest) req;
        String requestId = Optional.ofNullable(http.getHeader("X-Request-Id"))
            .orElse(UUID.randomUUID().toString());

        // Pull trace/span IDs from current OTel context, if any
        Span current = Span.current();
        String traceId = current.getSpanContext().getTraceId();
        String spanId  = current.getSpanContext().getSpanId();

        MDC.put("request_id", requestId);
        MDC.put("trace_id", traceId);
        MDC.put("span_id", spanId);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();
        }
    }
}

// In logback-spring.xml, configure a JSON encoder that includes MDC fields.
// Result: every log line in this request automatically has request_id,
// trace_id, span_id — making it trivial to correlate "this user's complaint"
// → "this trace" → "all logs for that trace" across all services.`}</CodeBlock>

        <Callout variant="spring" title="Spring Boot 3 + Micrometer Tracing makes this turnkey">
          <p className="m-0">As of Spring Boot 3, Micrometer Tracing replaces Spring Cloud Sleuth as the official tracing layer. Add <code>spring-boot-starter-actuator</code> and <code>micrometer-tracing-bridge-otel</code> and most of the wiring above is automatic — propagation through RestClient/WebClient, span creation around HTTP requests, MDC integration with trace and span IDs. Reach for the manual code only when you need a custom span around a specific business operation.</p>
        </Callout>

        <Quiz
          kind="Quick check"
          question="Why is it a problem to tag a metric with a userId as a label?"
          options={[
            { label: "Privacy — userIds shouldn't be in metrics.", explanation: "Privacy can be an issue but isn't the technical problem. The technical issue is cardinality." },
            { label: "Cardinality. Each unique tag value creates a separate time series. With a million users, that's a million series — your metrics backend will hit memory limits, your queries will time out, and your storage costs will balloon. High-cardinality fields belong in logs and traces, not metric tags.", correct: true, explanation: "Right. Metrics are a cardinality-bounded signal: tags should be low-cardinality (route, method, status code, region — not user ID, request ID, or any identifier). Per-user analytics belong in a logs/events backend that can shard them. Mixing the two — putting per-user fields in metric tags — is one of the most common ways teams accidentally take down their Prometheus." },
            { label: "userId is too long for a tag.", explanation: "Tag length isn't the issue — cardinality is. Even a short ID with millions of values is the problem." },
            { label: "Micrometer doesn't allow it.", explanation: "Micrometer allows it; the explosion happens in your storage backend." },
          ]}
        />

        <Quiz
          kind="Drill"
          question="Your service is high-volume — 50k RPS. Tracing 100% of requests would generate 50k spans/sec/instance and overwhelm the trace storage. What's the right approach?"
          options={[
            { label: "Don't use tracing at high volumes.", explanation: "You explicitly should — high-volume services are exactly where tracing has the most value, because problems hide in tail behavior you can't reproduce locally." },
            { label: "Sample. Head sampling (decide at the start of the trace, e.g. keep 5% of all traces consistently) is the simple option. Tail sampling at the collector — keep 100% of traces with errors or p99+ latency, sample the rest at 1-5% — gets the tail you actually want without saving every healthy trace.", correct: true, explanation: "Right. Head sampling at the SDK is cheap and consistent — same trace ID either fully captured or fully dropped across services. Tail sampling at the OTel collector lets you keep 'interesting' traces (errors, slow ones) while sampling the boring ones. Most production setups use both: head sample at 1-10% as the floor, then collector-side filtering to always keep errors and outliers." },
            { label: "Sample only at the leaf services.", explanation: "Inconsistent sampling between services means a trace gets fragmented — the leaf has spans but the parent doesn't. Sampling has to be a trace-level decision (head sampling) to preserve completeness." },
            { label: "Use logs instead of traces.", explanation: "Logs don't show cross-service request shape. They're not a replacement for traces; they're a complement." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Wire metrics, traces, and structured logs once at the framework boundary; resist tagging mania."
          points={[
            { takeaway: "Micrometer is the Java metrics facade — Spring Boot wires it for free.", detail: <>Counter/Gauge/Timer are the building blocks. Tag with low-cardinality fields only.</> },
            { takeaway: "OpenTelemetry Java agent auto-instruments most code — turn it on and traces appear.", detail: <>Manual spans are for important business operations not covered by auto-instrumentation. Set service.name and OTLP endpoint and you&apos;re mostly done.</> },
            { takeaway: "MDC propagates request_id, trace_id, span_id into every log line in a request.", detail: <>Combined with structured (JSON) logging, this is the &quot;jump from a customer complaint to all relevant logs&quot; pipeline.</> },
            { takeaway: "Don't tag metrics with high-cardinality fields.", detail: <>userId, orderId, requestId belong in logs and traces, never in metric tags. Cardinality explosion takes down your metrics backend.</> },
            { takeaway: "Sample traces — 100% is wasteful at high volume.", detail: <>Head sample at the SDK for consistency; tail sample at the collector to always keep errors and slow ones.</> },
          ]}
        />
      </section>
      </Checkpoint>

      {/* PART 3 — Alerts */}
      <Checkpoint moduleSlug="observability" id="alerts" title="Alerts & dashboards" xp={25} celebration="Symptom-based alerts, sane SLOs, dashboards that answer questions. On-call thanks you.">
      <section>
        <h2>Part 3: What to alert on (and what not to)</h2>

        <p>
          Alerts are a sleep-deprivation budget. Every alert that fires uses some of that budget; every false alarm steals from real ones. The single most important rule: <strong>alert on symptoms, not causes.</strong>
        </p>

        <h3>Symptoms vs causes</h3>

        <p>
          A <em>symptom</em> is something the user experiences: requests are failing, requests are slow, requests are 5xx&apos;ing. A <em>cause</em> is a system-internal state that may or may not produce a symptom: CPU is high, memory is high, queue is deep, replica count is low. Cause-based alerts page you for things like &quot;CPU &gt; 80%&quot; — but if CPU is 80% and the system is meeting its SLO, who cares? Symptom-based alerts page you only when the user is suffering, regardless of which internal state caused it.
        </p>

        <Callout variant="warn" title="The classic 3am page that didn't need to happen">
          <p className="m-0">CPU goes over 80% for 5 minutes → page. The on-call wakes up, logs in, finds the service is serving traffic happily because the CPU spike was a backfill job that doesn&apos;t affect SLO. They go back to sleep, but they&apos;re irritable for the rest of the week and they trust alerts a tiny bit less. Multiply by every cause-based alert in the system and you&apos;ve created an on-call rotation everyone hates. The fix is to let CPU be a <em>symptom-driving</em> signal — page only when high CPU coincides with elevated latency or error rate. The cause is interesting, but only when it produces user pain.</p>
        </Callout>

        <h3>SLOs and error budgets</h3>

        <p>
          A <strong>service-level objective (SLO)</strong> is a target you commit to: &quot;99.9% of requests succeed in under 300ms over a 30-day window.&quot; The complement is the <strong>error budget</strong>: 0.1% of requests are allowed to fail or be slow. If you&apos;re below budget — under-spending on errors — you can take more risk (ship faster, run experiments). If you&apos;re burning budget too fast, you stop shipping risky changes until you recover.
        </p>

        <p>
          The alerts that make the most sense are <em>error-budget burn rate</em> alerts: page when you&apos;re burning the budget so fast that you&apos;ll exhaust it before the window ends. A common pattern is multi-window multi-burn-rate (MWMBR) alerts: a fast burn-rate alert (over 1h, page when burning 14x normal) and a slow burn-rate alert (over 6h, page when burning 6x normal). The fast one catches catastrophic failures; the slow one catches sustained degradations.
        </p>

        <h3>Dashboards that answer questions, not display data</h3>

        <p>
          A dashboard is good when it answers a specific question quickly. &quot;Is the service healthy right now?&quot; — RED graphs at the top, with SLO burn overlay. &quot;What changed in the last hour?&quot; — deploy markers, traffic by route, error rate by route. &quot;Where is the slow tail coming from?&quot; — p99 by endpoint, by downstream, by region.
        </p>

        <p>
          A dashboard is bad when it&apos;s a wall of green lines that nobody can interpret under pressure. The test: at 2 a.m., bleary, can the on-call open this dashboard and within 30 seconds say &quot;ah, it&apos;s X&quot;? If not, simplify. Cut graphs. Order by importance. Top of dashboard = SLO + RED. Everything else is sub-pages.
        </p>

        <h3>Runbooks linked from alerts</h3>

        <p>
          Every page should link to a runbook — &quot;here&apos;s what this alert means and the first three things to check.&quot; Even an experienced on-call, woken at 3am, benefits from not having to remember what the alert means and where the dashboard is. New on-calls benefit even more. The runbook doesn&apos;t need to be exhaustive — it just needs to get you to the right dashboard, name the likely culprits, and link to the escalation path.
        </p>

        <Quiz
          kind="Drill"
          question="A team has 47 alerts configured for their service. Most fire weekly. The on-call rotation is exhausted. What's the single highest-leverage change to make?"
          options={[
            { label: "Move all alerts to email instead of paging.", explanation: "That makes alerts cheaper to fire but doesn't make them more actionable. The team would just stop reading their email." },
            { label: "Audit every alert against the symptom rule: 'is there an SLO this alert protects, and does this alert fire only when that SLO is at risk?' Delete or downgrade everything that doesn't pass. Most cause-based alerts (CPU, memory, queue depth) become ticket-grade or dashboard-only.", correct: true, explanation: "Right. The symptom-vs-cause distinction is the single biggest lever for alert fatigue. Most teams have 20-50 alerts of which only 5-10 actually correlate with user pain. Aggressive pruning — keeping only the 'a real customer is suffering right now' alerts — turns on-call from a hellscape into a sane rotation. Causes go to dashboards and tickets, not pages." },
            { label: "Add more alerts for completeness.", explanation: "Adding alerts to a fatigued team makes things worse. The fix is fewer, sharper alerts." },
            { label: "Outsource the on-call rotation.", explanation: "That doesn't fix the underlying signal-to-noise problem; it just makes someone else suffer through it." },
          ]}
        />

        <Quiz
          kind="Reality check"
          question="Your service has an SLO of 99.9% requests succeeding in under 300ms over 30 days. Yesterday a deploy bug caused 0.1% of requests to fail for 6 hours, which used 20% of this month's error budget. The team wants to ship a risky migration this week. What's the call?"
          options={[
            { label: "Ship it — the SLO is still being met.", explanation: "The SLO is being met today, but you've used 20% of the budget for a 30-day window. Risky changes early in the month make sense; risky changes after burning a fifth of the budget on day 1 do not." },
            { label: "Hold the migration. You've burned 20% of the budget on what should have been a non-event; the cushion is now thinner. Reserve the remaining budget for normal operational risk and wait for the budget to recover, or split the migration into smaller pieces.", correct: true, explanation: "Right. Error budgets are precisely for this kind of decision — they translate 'are we reliable enough to take this risk?' into a number. With 80% of the budget left for the rest of the month, the cushion for normal variance plus the migration is uncomfortably thin. Split the migration, postpone, or add additional safety (canary, fast rollback) before proceeding. Either way, the budget makes the conversation concrete instead of vibes-based." },
            { label: "Pause all deploys forever — the budget was burned.", explanation: "That's overcorrecting. The SLO is still being met; you're just being more careful about how much further risk to take this month." },
            { label: "Increase the SLO to 99.99% to buy more headroom.", explanation: "Tightening the SLO doesn't add headroom — it removes it. SLOs reflect what you commit to delivering; you don't get more budget by promising more." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Alerts are a sleep budget — spend them only on user-facing symptoms, backed by SLOs."
          points={[
            { takeaway: "Alert on symptoms, not causes.", detail: <>High CPU is interesting; high CPU + elevated latency is a page. The user&apos;s experience is what justifies waking someone up.</> },
            { takeaway: "SLOs make reliability decisions concrete.", detail: <>&quot;99.9% in 30 days&quot; gives you an error budget. Error budget burn rate is the most defensible alert for &quot;something serious is wrong.&quot;</> },
            { takeaway: "Multi-window multi-burn-rate alerts catch both catastrophic and slow failures.", detail: <>Fast burn-rate (1h, 14x normal): a 5xx storm. Slow burn-rate (6h, 6x normal): a sustained latency degradation. You want both.</> },
            { takeaway: "Dashboards should answer questions in under 30 seconds at 2am.", detail: <>RED at the top, SLO burn overlay, deploy markers. Everything else is one click deeper. Walls of green are useless.</> },
            { takeaway: "Every page links to a runbook.", detail: <>What does the alert mean, what to check first, where to escalate. Costs nothing once written; saves minutes (and mistakes) on every fire.</> },
          ]}
        />
      </section>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Up next: on-call and incident response</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          You can see the system. Now you have to operate it under stress. Module 22 covers what actually happens during an incident — incident command, communication, blameless postmortems, and the rituals that make on-call sustainable.
        </p>
        <Link
          href="/courses/system-design/modules/on-call-incident"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-sky-600 hover:to-blue-600 transition no-underline"
        >
          Module 22: On-call &amp; incident response →
        </Link>
      </section>
    </article>
  );
}
