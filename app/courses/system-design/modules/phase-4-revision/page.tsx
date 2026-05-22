import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 20 minutes before an interview or before going on-call, not
// to grind through it. Each section points back at the source module.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase4RevisionModule() {
  const mod = getModuleBySlug("phase-4-revision")!;

  // The request path through the reliability stack — every box on this diagram
  // is one of the six Phase 4 modules. If you can label why each box is here,
  // you've internalized the phase.
  const reliabilityPath = `
flowchart LR
    C[Client] --> LB[L4+L7<br/>Load Balancer]
    LB --> RL[Rate Limiter<br/>token bucket / Redis Lua]
    RL --> CB[Circuit Breaker<br/>Resilience4j]
    CB --> S[Service<br/>idempotency key dedup]
    S --> T[Timeout +<br/>Bulkhead]
    T --> D[Downstream<br/>flaky thing]
    S -.->|metrics<br/>logs<br/>traces| O[Observability<br/>OpenTelemetry]
    O -.->|SLO burn| A[Alert →<br/>On-call]
    style LB fill:#0ea5e9,color:#fff,stroke:#0284c7
    style RL fill:#0ea5e9,color:#fff,stroke:#0284c7
    style CB fill:#0ea5e9,color:#fff,stroke:#0284c7
    style S fill:#0ea5e9,color:#fff,stroke:#0284c7
    style T fill:#0ea5e9,color:#fff,stroke:#0284c7
    style O fill:#3b82f6,color:#fff,stroke:#2563eb
    style A fill:#3b82f6,color:#fff,stroke:#2563eb
    style D fill:#64748b,color:#fff,stroke:#475569
  `.trim();

  // Circuit breaker state machine — three states, clean transitions. The
  // single most useful diagram for talking about resilience in an interview.
  const cbStates = `
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: failure rate ≥ threshold
    Open --> HalfOpen: wait duration elapsed
    HalfOpen --> Closed: trial calls succeed
    HalfOpen --> Open: trial calls fail
    Closed --> Closed: success / below threshold
    Open --> Open: all calls short-circuited
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link
          href="/courses/system-design"
          className="inline-block text-sm text-slate-500 no-underline hover:text-slate-700 dark:hover:text-slate-300"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <span className="mt-2 block w-fit rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase {mod.phaseNumber} · Module {mod.number} · Revision
        </span>
        <h1 className="mt-4 mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {mod.title}
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          {mod.subtitle}
        </p>
        <BookmarkButton courseId="system-design" moduleSlug="phase-4-revision" />
        <ModuleProgress moduleSlug="phase-4-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations, this is a map not a tutorial */}
      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This module is not new material. It&apos;s a <strong>map of Phase 4</strong> — the reliability toolkit you build around a service, compressed into tables, diagrams, and cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read before going on-call, not as a tutorial.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          The six modules you&apos;re consolidating: <Link href="/courses/system-design/modules/load-balancing" className="text-sky-600 hover:underline">Load balancing</Link>, <Link href="/courses/system-design/modules/rate-limiting" className="text-sky-600 hover:underline">Rate limiting</Link>, <Link href="/courses/system-design/modules/resilience4j-deep" className="text-sky-600 hover:underline">Resilience4j deep dive</Link>, <Link href="/courses/system-design/modules/idempotency" className="text-sky-600 hover:underline">Idempotency</Link>, <Link href="/courses/system-design/modules/observability" className="text-sky-600 hover:underline">Observability</Link>, and <Link href="/courses/system-design/modules/on-call-incident" className="text-sky-600 hover:underline">On-call &amp; incident response</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — Load balancing */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">1. Load balancing — the four decisions</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Layer, algorithm, health checks, stickiness. Get these four right and the LB stops being a source of mystery outages.
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Choice</th>
                <th className="px-4 py-3 font-semibold">L4 (TCP)</th>
                <th className="px-4 py-3 font-semibold">L7 (HTTP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Sees</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">IP, port</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Path, headers, cookies, body</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Throughput</td>
                <td className="px-4 py-3 text-emerald-600">Millions conn/s/box</td>
                <td className="px-4 py-3 text-amber-600">Tens of thousands RPS/box</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Can do</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Port-based routing, DDoS absorption</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Path routing, retries, per-user limits, TLS termination</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Picks</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">NLB, IPVS, HAProxy TCP</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">ALB, NGINX, Envoy, Spring Cloud Gateway</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-6 mb-2 text-base font-semibold">Algorithms — when each one earns its keep</h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">Round robin</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Defensible default only when backends are identical and requests are uniform. Almost never the right answer in real prod.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Least connections</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">The right default for most HTTP services. A stuck backend stops draining, so new requests skip it.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">EWMA / least response time</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Routes to the fastest backend. Best for latency-sensitive services; more state to maintain.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Power of two choices</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Pick 2 random backends, send to the less-loaded. Stateless across LBs — the right answer when multiple LBs can&apos;t coordinate (Envoy, Linkerd default).</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-violet-600 uppercase">Consistent hashing</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Same key always lands on the same backend — for cache locality, session affinity, or sharded data. Add/remove a node only remaps ~1/N of keys.</p>
          </div>
        </div>

        <Callout variant="warn">
          <strong>The cascading health check failure:</strong>{" "}if <code>/healthz</code> hits the database, then when the DB flaps, <em>every</em>{" "}backend fails health checks at once and the LB removes them all. Liveness checks must be shallow (&quot;is the JVM up?&quot;). Readiness checks can be deep — but only gate startup, not ongoing rotation.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/load-balancing" className="text-sky-600 hover:underline">Module 20 — Load balancing</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Rate limiting cheat sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">2. Rate limiting — algorithm cheat sheet</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Five algorithms, four real tradeoffs. The single most useful axis is &quot;does it allow bursts?&quot;
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 font-semibold">Shape</th>
                <th className="px-4 py-3 font-semibold">Memory</th>
                <th className="px-4 py-3 font-semibold">Use when</th>
                <th className="px-4 py-3 font-semibold">Gotcha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Token bucket</td>
                <td className="px-4 py-3 text-emerald-600">Burst-friendly</td>
                <td className="px-4 py-3 font-mono text-xs">O(1) per key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Public APIs — users get bursts then settle</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">A full bucket lets bursts thunder downstream</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Leaky bucket</td>
                <td className="px-4 py-3 text-amber-600">Smooth output</td>
                <td className="px-4 py-3 font-mono text-xs">O(1) per key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Protecting a fixed-rate downstream (DB, SMS gateway)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Spikey input becomes queued latency, not 429s</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Fixed window</td>
                <td className="px-4 py-3 text-rose-600">Cliff at boundary</td>
                <td className="px-4 py-3 font-mono text-xs">O(1) per key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cheap counters where precision doesn&apos;t matter</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">2× allowed traffic at the boundary — every minute</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Sliding window log</td>
                <td className="px-4 py-3 text-emerald-600">Precise</td>
                <td className="px-4 py-3 font-mono text-xs">O(N requests/key)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Low-traffic APIs where precision matters</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Memory blows up at high RPS — don&apos;t use at scale</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Sliding window counter</td>
                <td className="px-4 py-3 text-emerald-600">Near-precise</td>
                <td className="px-4 py-3 font-mono text-xs">O(1) per key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">The pragmatic default at scale</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Small approximation error (a few %); usually fine</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="insight">
          <strong>Distributed rate limiting = Redis + Lua.</strong>{" "}A naive <code>GET</code>/<code>INCR</code>/<code>EXPIRE</code> sequence has a race window where two callers can both pass. The fix is a single Lua script that does check-decrement-set atomically inside Redis. One round trip, no race. Bucket4j has this baked in.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/rate-limiting" className="text-sky-600 hover:underline">Module 21 — Rate limiting</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — The reliability path */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">3. The whole reliability path in one diagram</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Every Phase 4 module is one of the boxes below. Trace a request from client to downstream and you&apos;ve traced the syllabus.
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Mermaid chart={reliabilityPath} />
        </div>

        <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li><strong>LB</strong>{" "}chooses which backend gets the request. <strong>Rate limiter</strong>{" "}decides whether the request gets through at all. <strong>Circuit breaker</strong>{" "}short-circuits when the downstream is broken. <strong>Timeout + bulkhead</strong>{" "}keep one slow dependency from eating all your threads. <strong>Idempotency</strong>{" "}makes retries safe. <strong>Observability</strong>{" "}tells you when something&apos;s wrong; the alert wakes <strong>on-call</strong>.</li>
          <li>Each layer fails in a way the next layer can&apos;t fix. A circuit breaker can&apos;t un-overload an underprovisioned fleet (LB problem). Idempotency can&apos;t recover from missing observability (no one knew the retry happened). Postmortems can&apos;t replace runbooks (you needed the runbook at 3am).</li>
        </ul>

        <h3 className="mb-2 text-base font-semibold">Circuit breaker state machine</h3>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Mermaid chart={cbStates} />
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Closed = normal. Open = short-circuit, fail fast, let the downstream rest. Half-open = let a few trial calls through to see if it&apos;s healed. If the trial fails, back to Open. If it succeeds, back to Closed. This is the diagram you sketch when an interviewer asks about Resilience4j.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Resilience4j decision card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">4. Resilience4j — pick the right pattern</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Four decorators, one composition rule. The temptation is to stack them all on everything; the discipline is to know which one each failure mode actually needs.
        </p>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-5 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Retry</div>
            <p className="m-0 mb-2 text-sm text-slate-700 dark:text-slate-300"><strong>Helps when:</strong>{" "}the failure is transient — a brief network blip, a quick DB failover.</p>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300"><strong>Hurts when:</strong>{" "}the downstream is already overloaded. Retries amplify load and turn a brownout into an outage. Always pair with <em>exponential backoff + jitter</em>{" "}and a small max-attempts (3, not 10).</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-rose-50/40 p-5 dark:border-slate-800 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Circuit breaker</div>
            <p className="m-0 mb-2 text-sm text-slate-700 dark:text-slate-300"><strong>Helps when:</strong>{" "}the downstream is broken and you want to fail fast instead of piling up threads.</p>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300"><strong>Without a fallback,</strong>{" "}opening the breaker just trades one error for another (now you 5xx faster). Pair with a degraded-mode fallback — cached response, default value, queued for retry — whenever a real one exists.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-5 dark:border-slate-800 dark:bg-amber-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Bulkhead</div>
            <p className="m-0 mb-2 text-sm text-slate-700 dark:text-slate-300"><strong>Helps when:</strong>{" "}one slow dependency can starve every thread in your service.</p>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Cap concurrent calls per downstream so &quot;payments is slow&quot; doesn&apos;t turn into &quot;the whole service is down.&quot; The bulkhead is what prevents thread-pool exhaustion cascading sideways.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-sky-50/40 p-5 dark:border-slate-800 dark:bg-sky-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">Timeout</div>
            <p className="m-0 mb-2 text-sm text-slate-700 dark:text-slate-300"><strong>Helps when:</strong>{" "}always. Every remote call must have a timeout shorter than your caller&apos;s timeout.</p>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">The most common reliability bug is &quot;no timeout configured, so we waited forever.&quot; If you remember one Resilience4j rule, make it this one.</p>
          </div>
        </div>

        <Callout variant="insight">
          <strong>Composition order (outer to inner):</strong>{" "}Retry → CircuitBreaker → RateLimiter → TimeLimiter → Bulkhead → call. Retry on the outside so it sees the breaker&apos;s short-circuit and doesn&apos;t retry into an open breaker. Timeout inside so each attempt is bounded. Inverting this order is one of the classic Resilience4j bugs.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/resilience4j-deep" className="text-sky-600 hover:underline">Module 22 — Resilience4j deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Idempotency */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">5. Idempotency — making retries safe</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Every distributed system is at-least-once. If your write endpoint can&apos;t handle a duplicate, you don&apos;t have an endpoint — you have a future incident.
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="mt-0 mb-3 text-base font-semibold">The standard pattern</h3>
          <ol className="mb-0 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            <li>Client sends <code>Idempotency-Key: &lt;uuid&gt;</code> header (and re-sends the same key on retry).</li>
            <li>Server checks a <strong>dedupe table</strong>{" "}keyed by <code>(account_id, idempotency_key)</code>. Per-account scoping is non-negotiable — never global.</li>
            <li>If key is new: process the request, cache the full response (status + body) in the dedupe row.</li>
            <li>If key exists: skip processing, replay the cached response. Same status, same body, same headers.</li>
            <li>TTL the row (24h–7d is typical). Long enough to cover all reasonable client retries; short enough to not bloat the table forever.</li>
          </ol>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-600 uppercase">The trap</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Client retries with the <em>same</em>{" "}idempotency key but a <strong>different request body</strong>. Naive servers will silently replay the old response and the user thinks the new request succeeded. Always fingerprint the body (hash it, store the hash with the row) and 422 if the fingerprint changed.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-600 uppercase">The deeper truth</div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Idempotency keys handle the HTTP layer. You also need idempotency inside the system — at every async hop, every queue consumer, every webhook. A keyed dedupe at the edge does not save you from a Kafka consumer processing the same offset twice. Design every write as if it might run twice.</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/idempotency" className="text-sky-600 hover:underline">Module 23 — Idempotency</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Observability */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">6. Observability — the three pillars</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Metrics, logs, traces. Each answers a different question. The trace ID is the thread that stitches them together.
        </p>

        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Pillar</th>
                <th className="px-4 py-3 font-semibold">Answers</th>
                <th className="px-4 py-3 font-semibold">Cardinality</th>
                <th className="px-4 py-3 font-semibold">Tooling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Metrics</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Is anything wrong?&quot; — counters &amp; histograms over time</td>
                <td className="px-4 py-3 text-emerald-600">Low (bounded labels)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Micrometer → Prometheus → Grafana</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Logs</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;What happened to this specific request?&quot; — structured events</td>
                <td className="px-4 py-3 text-amber-600">High (one per event)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">SLF4J + MDC → ELK / Loki / Splunk</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Traces</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">&quot;Where did the time go across services?&quot; — distributed spans</td>
                <td className="px-4 py-3 text-amber-600">High (sampled)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">OpenTelemetry → Tempo / Jaeger</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-5 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">RED — for services</div>
            <ul className="m-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>R</strong>ate — requests/second</li>
              <li><strong>E</strong>rrors — error rate</li>
              <li><strong>D</strong>uration — p50/p95/p99 latency</li>
            </ul>
            <p className="m-0 mt-2 text-xs text-slate-600 dark:text-slate-400">If your service dashboard doesn&apos;t show these three at the top, it&apos;s the wrong dashboard.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-sky-50/40 p-5 dark:border-slate-800 dark:bg-sky-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">USE — for resources</div>
            <ul className="m-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li><strong>U</strong>tilization — % of time busy</li>
              <li><strong>S</strong>aturation — backlog (queue depth)</li>
              <li><strong>E</strong>rrors — failure count</li>
            </ul>
            <p className="m-0 mt-2 text-xs text-slate-600 dark:text-slate-400">For CPU, memory, disk, thread pools, connection pools. USE is what tells you the host is sick before RED tells you the users are.</p>
          </div>
        </div>

        <Callout variant="insight">
          <strong>Alert on SLO burn-rate, not on raw spikes.</strong> &quot;CPU is at 90%&quot; is a cause, not a symptom — and at 3am you don&apos;t care about causes, you care about whether users are being harmed. Define an SLO (e.g. 99.9% of requests under 500ms over 30 days), measure burn rate (how fast you&apos;re eating the error budget), and alert when burn rate is high enough that you&apos;ll exhaust the budget before someone fixes it. Symptoms page humans; causes go on dashboards.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/observability" className="text-sky-600 hover:underline">Module 24 — Observability</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — On-call & incident response */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">7. On-call &amp; incident response — the human side</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          A reliable service is not a service that never breaks. It&apos;s a service whose breakage is short, well-communicated, and learned from.
        </p>

        <h3 className="mb-2 text-base font-semibold">The severity ladder</h3>
        <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Definition</th>
                <th className="px-4 py-3 font-semibold">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-rose-700">SEV1</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Full outage / data loss / security breach</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Page now, war room, exec comms, public status page</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-orange-700">SEV2</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Partial outage / major feature broken</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Page primary on-call, internal comms, written postmortem</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-700">SEV3</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Degraded experience / minor feature broken</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Ticket, handle in business hours, lightweight postmortem</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-600">SEV4</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cosmetic / single-user issue</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Backlog, no postmortem required</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Blameless postmortem</div>
            <ul className="m-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>Focus on systems, not people. &quot;Deploy script let a bad config through&quot; — not &quot;Alex pushed a bad config.&quot;</li>
              <li>Timeline first (what happened, with timestamps), then root cause, then action items with owners + dates.</li>
              <li>Action items must be <em>tracked to ship</em>. A postmortem that produces no shipped change is theater.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-sky-600 uppercase">The 5 whys (used carefully)</div>
            <p className="m-0 mb-2 text-sm text-slate-700 dark:text-slate-300">Ask &quot;why?&quot; five times to push past the surface cause. But the trap: 5-whys can fixate on a single causal chain. Real incidents are usually <em>multi-causal</em> — a bad deploy AND missing alerting AND an unclear runbook all combined.</p>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-300">Treat 5-whys as one lens, not the framework. And never let &quot;why&quot; become &quot;who.&quot;</p>
          </div>
        </div>

        <Callout variant="warn">
          <strong>Runbooks are written when nothing&apos;s on fire, used when everything is.</strong>{" "}Every page-able alert should link to a runbook with: what this alert means, what to check first, common causes, who to escalate to. If you&apos;re writing the runbook at 3am, the alert was misconfigured. And error budgets — the inverse of your SLO — are how you decide between &quot;ship faster&quot; and &quot;invest in reliability&quot; without it becoming a feelings debate.
        </Callout>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/on-call-incident" className="text-sky-600 hover:underline">Module 25 — On-call &amp; incident response</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Gotchas BAD/GOOD */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">8. Four gotchas that cause real incidents</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Each of these has produced a public postmortem somewhere. If you only remember four things, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 1 · Retry without jitter = thundering herd</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              All clients fail at the same instant (the downstream blipped), all retry at <code>now + 1s</code>, all hammer the recovering service at the same instant, it falls over again. Synchronized retries are how a 5-second blip becomes a 30-minute outage. Always add jitter.
            </p>
            <CodeBlock lang="java">{`// BAD — every caller retries at the same moment
RetryConfig bad = RetryConfig.custom()
    .maxAttempts(5)
    .waitDuration(Duration.ofSeconds(1))   // fixed 1s — thundering herd
    .build();

// GOOD — exponential + jitter spreads the retry storm
RetryConfig good = RetryConfig.custom()
    .maxAttempts(3)                         // small max, not 10
    .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(
        Duration.ofMillis(500),             // initial
        2.0,                                // multiplier
        0.5))                               // randomization factor (jitter)
    .build();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 2 · Circuit breaker without a fallback</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Opening the breaker just trades a slow error for a fast error. If you have a meaningful degraded mode — cached value, default, queued for async retry — wire it as a fallback.
            </p>
            <CodeBlock lang="java">{`// BAD — breaker opens, user gets 503 anyway
@CircuitBreaker(name = "payments")
public Receipt charge(Order o) {
    return paymentsClient.charge(o);    // throws when breaker is open
}

// GOOD — degraded mode when the downstream is down
@CircuitBreaker(name = "payments", fallbackMethod = "chargeFallback")
public Receipt charge(Order o) {
    return paymentsClient.charge(o);
}

public Receipt chargeFallback(Order o, Throwable t) {
    // Queue for async retry, return a "pending" receipt, keep the UX alive.
    pendingChargeQueue.enqueue(o);
    return Receipt.pending(o.id());
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 3 · Idempotency key reused for a different body</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Client retries the &quot;same&quot; request with the same key, but a field changed (different amount, different recipient). Naive servers replay the old response. The user thinks the new amount went through; it didn&apos;t. Fingerprint the body.
            </p>
            <CodeBlock lang="java">{`// BAD — only checks the key, replays old response on any retry
Optional<CachedResponse> cached = dedupeRepo.findByKey(key);
if (cached.isPresent()) return cached.get().response();

// GOOD — verify the body hash matches what we processed before
String bodyHash = sha256(requestBody);
Optional<DedupeRow> cached = dedupeRepo.findByKey(key);
if (cached.isPresent()) {
    if (!cached.get().bodyHash().equals(bodyHash)) {
        throw new ResponseStatusException(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "Idempotency-Key reused with a different request body");
    }
    return cached.get().response();        // safe replay
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 4 · Alerting on CPU instead of SLO</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              &quot;CPU &gt; 80%&quot; pages the on-call at 2am every Tuesday during the batch job — which is fine. Meanwhile a real user-facing latency spike at 50% CPU goes unnoticed. Symptom-based alerts (the user is harmed) page humans; cause-based metrics (CPU, queue depth) belong on dashboards.
            </p>
            <CodeBlock lang="plain" caption="Prometheus alerting rules">{`# BAD — pages on a cause, not a symptom. Wakes you up for benign load.
- alert: HighCPU
  expr: avg(rate(node_cpu_seconds_total{mode="user"}[5m])) > 0.8
  for: 5m

# GOOD — pages on user harm via SLO burn-rate.
# 99.9% SLO, fast-burn alert: would exhaust the 30-day budget in ~2h.
- alert: ApiHighErrorBudgetBurn
  expr: |
    (
      sum(rate(http_requests_total{status=~"5..",service="api"}[5m]))
      /
      sum(rate(http_requests_total{service="api"}[5m]))
    ) > (14.4 * 0.001)                      # 14.4x normal err rate over 5m
  for: 2m
  labels:
    severity: page`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="not-prose mb-1 text-2xl font-bold tracking-tight">9. Optional self-assessment</h2>
        <p className="not-prose mb-6 text-sm text-slate-500 dark:text-slate-400">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You're running five Envoy sidecars routing to a backend pool, and the sidecars cannot coordinate state with each other. Which LB algorithm is the best fit?"
          options={[
            { label: "Round robin — it's the simplest.", explanation: "RR across uncoordinated LBs is biased — each LB cycles independently, and one backend can end up disproportionately loaded. Worse than the right answer here." },
            { label: "Least connections — always the safest default.", explanation: "Least-conn is fine for a single LB, but multiple uncoordinated LBs each see their own connection count, so the global view is wrong. P2C is what was designed for exactly this case." },
            { label: "Power of two choices — provably near-optimal and stateless across LBs.", correct: true, explanation: "Right. P2C is what Envoy and Linkerd default to for this exact reason: each LB picks 2 random backends and sends to the less-loaded one. No coordination needed, no bias, queueing-theory-near-optimal." },
            { label: "Consistent hashing — distributes work evenly.", explanation: "Consistent hashing is for stickiness (cache locality, shard routing), not for load distribution. Without a hash key tied to the request, you don't get even distribution." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You need to rate-limit a public API. Users should be able to burst up to 100 requests, then settle to 10 RPS. Which algorithm fits?"
          options={[
            { label: "Fixed window counter — simplest implementation.", explanation: "Fixed window has a 2x burst right at the boundary (clients can spend their budget at the end of one window and at the start of the next). Not what you want, and not what the question is asking about." },
            { label: "Token bucket — capacity 100, refill rate 10/s.", correct: true, explanation: "Right. Token bucket is the burst-friendly algorithm: bucket fills to capacity 100 at 10 tokens/sec, request consumes 1 token. A user who's been idle can burst 100 requests, then settle to 10 RPS as the bucket refills. This is exactly the AWS / Stripe API shape." },
            { label: "Leaky bucket — same effect.", explanation: "Leaky bucket smooths output — a burst of 100 doesn't go through fast; it goes through at 10/s. That's different from what was asked." },
            { label: "Sliding window log — most precise.", explanation: "Sliding window log gives you a precise sliding-window count, but doesn't naturally express 'burst capacity vs steady rate.' It's also memory-heavy at scale. Wrong tool for the question." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A downstream payments service is returning 5xx for ~40% of requests. Your service is now slow because every request is waiting for the timeout. What's the right primary mitigation?"
          options={[
            { label: "Add a retry with backoff — most failures are transient.", explanation: "Retry into a downstream that's already at 40% error rate amplifies its load — you'll make it worse. Retry is for transient failures; a 40% sustained failure rate is not transient." },
            { label: "Open a circuit breaker so calls fail fast without waiting for the timeout, ideally with a fallback.", correct: true, explanation: "Right. The breaker shorts out the failing dependency: fail fast (free up your threads), give the downstream room to recover, and serve a fallback (queued retry, cached value, default) if you have one. Retry on top makes it worse here; the breaker is the primary tool." },
            { label: "Add a bulkhead.", explanation: "A bulkhead caps concurrent calls and would help prevent the failure from saturating your thread pool — useful, but it doesn't fix the user-visible problem. The breaker is the primary tool; bulkhead is a complementary defense." },
            { label: "Increase the timeout so calls have more time to succeed.", explanation: "Longer timeouts make this worse — your threads sit blocked longer, you process less throughput, the queue grows. The fix is to fail faster, not slower." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What's the right scope for an idempotency key in a payment API?"
          options={[
            { label: "Globally unique across all accounts — keys must never collide.", explanation: "Global scope leaks information across tenants (one account's key collision affects another's request) and forces clients to coordinate across all their users. The standard is per-account." },
            { label: "Per account — the key (account_id, idempotency_key) is what's unique.", correct: true, explanation: "Right. Per-account scoping means each account's keys are independent: account A and account B can both use the key 'abc-123' for unrelated requests, and there's no collision. This is the standard pattern (Stripe, AWS, GCP all do this) and what every well-built dedupe table is keyed on." },
            { label: "Per request — generate it server-side and return it.", explanation: "If the server generates the key, the client doesn't have the same key to send on retry — which defeats the entire purpose. The client must own the key." },
            { label: "Per IP address — easier to scope.", explanation: "Mobile users behind carrier NAT all share an IP. You'd cross-contaminate completely unrelated users. IP is never the right scoping for application-level dedup." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your dashboard shows: CPU 85%, p99 latency 200ms (SLO is 500ms), error rate 0.1%, queue depth growing. Which observability pillar is telling you the most useful thing right now?"
          options={[
            { label: "RED metrics — but they look fine (latency and errors are within SLO), so nothing's wrong yet.", correct: true, explanation: "Right. RED says users are not being harmed yet — error rate and latency are within SLO. The user-facing service is healthy. CPU and queue depth are USE metrics (resource health), which are early-warning signals: something's stressed, investigate, but don't page anyone. Symptom-based alerting (SLO-based) wouldn't fire here, and that's correct." },
            { label: "USE metrics say CPU is hot — page on-call immediately.", explanation: "CPU 85% with users still served within SLO is not an outage — it's a hint that you might want to investigate before it becomes one. Paging on causes (CPU) wakes people for benign load; pages should fire on symptoms (SLO burn)." },
            { label: "Traces — they'll tell you where the slowness is.", explanation: "Traces are great for diagnosis after you know something's wrong. The dashboard says users aren't slow yet, so traces aren't the primary signal here." },
            { label: "Logs — search for errors.", explanation: "Logs are great for explaining a specific failure. With 0.1% error rate (within SLO), there's no fire to investigate yet — and logs aren't where you check overall service health anyway." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — You're ready when */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-3 text-2xl font-bold tracking-tight">10. You&apos;re ready for Phase 5 when…</h2>
        <Callout variant="spring">
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm">
            <li>You can sketch the request path (LB → rate limit → circuit breaker → service → downstream + observability + on-call) on a whiteboard without notes.</li>
            <li>You can pick an LB algorithm given the deployment topology (single LB, multiple uncoordinated LBs, sharded cache) and explain why.</li>
            <li>You can draw the circuit breaker state machine and name what drives each transition.</li>
            <li>You can write the standard idempotency-key flow including body fingerprinting and per-account scoping.</li>
            <li>You can explain the difference between RED and USE, and why one alerts and the other dashboards.</li>
            <li>You can describe a blameless postmortem to someone who&apos;s never been on-call, and tell them why &quot;blameless&quot; is not the same as &quot;no accountability.&quot;</li>
          </ul>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 dark:border-indigo-900 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/30">
        <div className="mb-2 text-xs font-bold tracking-wider text-indigo-700 uppercase dark:text-indigo-300">
          Phase 4 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can build a service that survives Tuesday</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Load balancing, rate limiting, the Resilience4j patterns, idempotency, the three pillars of observability, and the human side of on-call. That&apos;s the reliability toolkit. The patterns from here on out will assume you reach for them automatically.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 5 — Distributed Systems Deep.</strong>{" "}Consensus, Raft &amp; Paxos, when you actually need them, leader election. The theory under the systems you&apos;ve been building.
        </p>
        <Link
          href="/courses/system-design/modules/consensus"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
        >
          Next phase: Consensus — Raft &amp; Paxos →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="phase-4-revision" />
    </article>
  );
}
