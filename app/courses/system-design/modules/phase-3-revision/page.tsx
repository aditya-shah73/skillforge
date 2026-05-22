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
// re-read this in 20 minutes before an interview, not to grind through it.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase3RevisionModule() {
  const mod = getModuleBySlug("phase-3-revision")!;

  // Kafka partition → consumer-group assignment diagram. The whole story of
  // "partition = unit of parallelism, consumer group = unit of scaling" in
  // one picture: 4 partitions can serve at most 4 consumers in a group; a
  // 5th consumer just sits idle.
  const partitionAssignmentChart = `
flowchart LR
    P0["partition 0"] --> C1["consumer A1"]
    P1["partition 1"] --> C2["consumer A2"]
    P2["partition 2"] --> C3["consumer A3"]
    P3["partition 3"] --> C4["consumer A4"]
    P0 -.same group.-> G[("group: orders")]
    P1 -.-> G
    P2 -.-> G
    P3 -.-> G
    C5["consumer A5<br/>(idle — no partition)"] -.-> G
    P0 ==> D1["consumer B1<br/>(group: audit)"]
    P1 ==> D1
    P2 ==> D2["consumer B2<br/>(group: audit)"]
    P3 ==> D2
    style P0 fill:#10b981,color:#fff,stroke:#059669
    style P1 fill:#10b981,color:#fff,stroke:#059669
    style P2 fill:#10b981,color:#fff,stroke:#059669
    style P3 fill:#10b981,color:#fff,stroke:#059669
    style C5 fill:#fb923c,color:#fff,stroke:#ea580c
    style G fill:#1e293b,color:#fff,stroke:#0f172a
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
        <span className="mt-2 block w-fit rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
          Phase 3 · Module {mod.number} · Revision
        </span>
        <h1 className="mt-4 mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Phase 3 revision notes
        </h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">
          API design, gateway, queues, Kafka, event-driven/CQRS — every communication pattern on one card you can re-read in 20 minutes before an interview.
        </p>
        <BookmarkButton courseId="system-design" moduleSlug="phase-3-revision" />
        <ModuleProgress moduleSlug="phase-3-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO — set expectations */}
      <section className="not-prose mb-10">
        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
          This module is not new material. It&apos;s a <strong>map of Phase 3</strong> — every contract, every broker tradeoff, every pattern from the five communication modules, compressed into tables and decision cards. If something here is unfamiliar, jump back to the source module; if it&apos;s familiar, keep reading. Treat this as the page you re-read on the train before a system-design interview, not as a tutorial.
        </p>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
          The five modules you&apos;re consolidating: <Link href="/courses/system-design/modules/api-design" className="text-emerald-600 hover:underline">API design</Link>, <Link href="/courses/system-design/modules/spring-cloud-gateway" className="text-emerald-600 hover:underline">Spring Cloud Gateway</Link>, <Link href="/courses/system-design/modules/message-queues" className="text-emerald-600 hover:underline">Message queues</Link>, <Link href="/courses/system-design/modules/kafka-deep" className="text-emerald-600 hover:underline">Kafka deep dive</Link>, and <Link href="/courses/system-design/modules/event-driven-cqrs" className="text-emerald-600 hover:underline">Event-driven &amp; CQRS</Link>.
        </p>

        <Callout variant="insight">
          <strong>The Phase 3 mental model in one sentence:</strong>{" "}services talk to each other in exactly three shapes — <em>synchronous request/response</em> (REST/gRPC behind a gateway), <em>asynchronous fire-and-forget</em> (queues), or <em>asynchronous broadcast</em> (Kafka/event streams). Every architecture decision in this phase is just picking which of the three fits the use case, and then paying the matching tax (latency, ordering, idempotency, consistency).
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — API design cheat sheet */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">1. API design cheat sheet</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          The contracts that every serious HTTP API gets right. Get these wrong and you&apos;ll feel it on day one of operating the service.
        </p>

        <h3 className="mb-2 text-base font-semibold">HTTP verbs &amp; idempotency</h3>
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Verb</th>
                <th className="px-4 py-3 font-semibold">Safe?</th>
                <th className="px-4 py-3 font-semibold">Idempotent?</th>
                <th className="px-4 py-3 font-semibold">Use for</th>
                <th className="px-4 py-3 font-semibold">Common mistake</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-600">GET</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Reads. Cacheable.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Mutating state from a GET (breaks every cache and crawler)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">POST</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Create, non-idempotent actions</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">No <code>Idempotency-Key</code> header — retries double-charge</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">PUT</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Full replace by ID</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Using PUT for partial updates — that&apos;s PATCH</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-amber-600">PATCH</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">Depends</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Partial update</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">JSON-merge vs JSON-patch confusion. Pick one and document.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono font-semibold text-rose-600">DELETE</td>
                <td className="px-4 py-3">No</td>
                <td className="px-4 py-3">Yes</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Remove</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Returning 404 on retry — return 204 even if already gone</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-base font-semibold">Versioning — pick one, never mix</h3>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-5 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">URL-path versioning</div>
            <p className="mb-2 font-mono text-sm text-slate-700 dark:text-slate-300">/v1/orders, /v2/orders</p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
              <li>Trivial to route at the gateway</li>
              <li>Easy to curl/test/cache</li>
              <li>Visible to clients — they know what they&apos;re calling</li>
              <li>Downside: looks &quot;not REST-pure&quot; (don&apos;t care)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-5 dark:border-slate-800 dark:bg-amber-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Header / media-type versioning</div>
            <p className="mb-2 font-mono text-sm text-xs text-slate-700 dark:text-slate-300">Accept: application/vnd.acme.v2+json</p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600 dark:text-slate-400">
              <li>Same URL across versions (REST-pure)</li>
              <li>Annoying to curl, harder to cache</li>
              <li>Gateway routing needs header inspection</li>
              <li>Clients miss the header → wrong version silently</li>
            </ul>
          </div>
        </div>

        <h3 className="mb-2 text-base font-semibold">Pagination — cursor &gt; offset</h3>
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Strategy</th>
                <th className="px-4 py-3 font-semibold">Cost at page N</th>
                <th className="px-4 py-3 font-semibold">Stable under inserts?</th>
                <th className="px-4 py-3 font-semibold">Use when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-mono">?page=N&amp;size=20</td>
                <td className="px-4 py-3 text-rose-600">O(N × size) — DB scans + skips</td>
                <td className="px-4 py-3 text-rose-600">No — duplicates / skips on insert</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Static admin tables, deep paging not required</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">?cursor=abc&amp;size=20</td>
                <td className="px-4 py-3 text-emerald-600">O(size) — index seek + scan</td>
                <td className="px-4 py-3 text-emerald-600">Yes — anchored to a key</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Feeds, growing tables, anything user-facing</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-2 text-base font-semibold">Idempotency keys (the single most-skipped contract)</h3>
        <CodeBlock lang="plain">{`POST /v1/payments HTTP/1.1
Idempotency-Key: 5f8d7e6c-3b2a-4f1e-9c8d-7a6b5c4d3e2f
Content-Type: application/json

{ "amount": 4200, "currency": "USD", "source": "card_xyz" }`}</CodeBlock>
        <p className="mt-3 mb-4 text-sm text-slate-700 dark:text-slate-300">
          Server stores <code>(key → response)</code> for ~24h. Same key replay returns the <em>cached response</em>, not a second charge. Mandatory on any POST that creates money, sends messages, or kicks off a workflow.
        </p>

        <h3 className="mb-2 text-base font-semibold">Error envelope</h3>
        <CodeBlock lang="plain">{`{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Account balance below required amount",
    "requestId": "req_01HK7XYZ...",
    "details": { "balance": 100, "required": 4200 }
  }
}`}</CodeBlock>
        <p className="mt-3 mb-2 text-sm text-slate-700 dark:text-slate-300">
          Three rules: machine-readable <code>code</code> (not a string match), human-readable <code>message</code>, and a <code>requestId</code> the client can quote when they open a ticket. <code>400</code> = malformed; <code>422</code> = parsed but semantically rejected.
        </p>

        <h3 className="mt-6 mb-2 text-base font-semibold">REST vs gRPC — when to pick which</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Dimension</th>
                <th className="px-4 py-3 font-semibold">REST/JSON</th>
                <th className="px-4 py-3 font-semibold">gRPC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Latency</td>
                <td className="px-4 py-3 text-amber-600">Higher — text JSON, HTTP/1.1 typical</td>
                <td className="px-4 py-3 text-emerald-600">Lower — protobuf binary + HTTP/2 multiplexing</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Streaming</td>
                <td className="px-4 py-3 text-amber-600">SSE / WebSocket bolt-on</td>
                <td className="px-4 py-3 text-emerald-600">First-class — uni, bi, server-stream</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Browser support</td>
                <td className="px-4 py-3 text-emerald-600">Native</td>
                <td className="px-4 py-3 text-rose-600">Needs gRPC-Web proxy</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Contracts</td>
                <td className="px-4 py-3 text-amber-600">OpenAPI / hand-written</td>
                <td className="px-4 py-3 text-emerald-600">.proto IDL — codegen for every language</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Debug ergonomics</td>
                <td className="px-4 py-3 text-emerald-600">curl, browser, Postman</td>
                <td className="px-4 py-3 text-amber-600">grpcurl, BloomRPC — extra tooling</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Best fit</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Public APIs, browser clients, third-party integrations</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Internal service-to-service, latency-sensitive, polyglot fleet</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/api-design" className="text-emerald-600 hover:underline">Module 14 — API design</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Spring Cloud Gateway */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">2. Spring Cloud Gateway — the edge in one mental model</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          One pipeline: <strong>route → predicates → filters → downstream</strong>. Every gateway config you&apos;ll write fits inside that arrow.
        </p>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-600 uppercase">Predicates</div>
            <p className="mb-2 text-xs text-slate-700 dark:text-slate-300">
              &quot;Does this request match this route?&quot; — Path, Method, Header, Host, Cookie, Query, RemoteAddr.
            </p>
            <code className="block text-xs text-slate-600 dark:text-slate-400">Path=/api/orders/**</code>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-600 uppercase">Filters (Pre)</div>
            <p className="mb-2 text-xs text-slate-700 dark:text-slate-300">
              Modify before forward — strip prefix, add header, auth check, rate limit, circuit break.
            </p>
            <code className="block text-xs text-slate-600 dark:text-slate-400">StripPrefix=1</code>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-600 uppercase">Filters (Post)</div>
            <p className="mb-2 text-xs text-slate-700 dark:text-slate-300">
              Modify response — add CORS, strip internal headers, attach correlation ID, metrics.
            </p>
            <code className="block text-xs text-slate-600 dark:text-slate-400">AddResponseHeader=...</code>
          </div>
        </div>

        <h3 className="mb-2 text-base font-semibold">Belongs at the edge</h3>
        <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li><strong>Auth offload</strong> — verify JWT once, pass user claims as headers downstream. Services trust the gateway.</li>
          <li><strong>Rate limiting</strong> — per-API-key, per-IP. Cheaper to drop here than to wake a service.</li>
          <li><strong>Retries with backoff</strong> — for idempotent verbs only (GET/PUT/DELETE).</li>
          <li><strong>Header rewrite / canary routing</strong> — split 5% of traffic to <code>v2</code> by header value.</li>
          <li><strong>TLS termination, CORS, request logging, correlation IDs.</strong></li>
        </ul>

        <h3 className="mb-2 text-base font-semibold">Does NOT belong at the edge</h3>
        <Callout variant="warn">
          <strong>Anti-patterns:</strong>{" "}business validation, DB calls, response transformation that needs domain knowledge, request fan-out to multiple services (that&apos;s a BFF, not a gateway), or per-tenant feature flags that need DB lookups. If a filter has to call a database to do its job, it belongs in a service, not at the edge.
        </Callout>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/spring-cloud-gateway" className="text-emerald-600 hover:underline">Module 15 — Spring Cloud Gateway</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — Mermaid diagram */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">3. Kafka partition → consumer-group assignment</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          The picture that explains <em>everything</em>{" "}about Kafka scaling. Four partitions, two groups. Group <code>orders</code> has 5 consumers — only 4 can do work; the 5th idles. Group <code>audit</code> has 2 consumers — each takes 2 partitions.
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Mermaid chart={partitionAssignmentChart} />
        </div>

        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li><strong>Partition is the unit of parallelism.</strong>{" "}Want to scale a consumer group? Add partitions. Once.</li>
          <li><strong>Consumer group is the unit of independent scaling.</strong>{" "}Two groups read the same partitions <em>at their own pace</em>, each tracking their own offsets.</li>
          <li><strong>One partition → at most one consumer in a group.</strong>{" "}Adding consumers beyond <code>numPartitions</code> wastes hardware.</li>
          <li><strong>Different groups, same topic = pub/sub.</strong>{" "}Same group, multiple consumers = work queue.</li>
        </ul>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Message queues decision matrix */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">4. Message queues — the decision matrix</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Three brokers, three different sweet spots. Pick by delivery guarantee, ordering needs, and team operating burden.
        </p>

        <h3 className="mb-2 text-base font-semibold">Delivery guarantees — the cost ladder</h3>
        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Guarantee</th>
                <th className="px-4 py-3 font-semibold">What it means</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Reality check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold text-emerald-600">At-most-once</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Fire and forget. May lose messages on crash.</td>
                <td className="px-4 py-3 text-emerald-600">Cheap</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Metrics, low-value telemetry. Never for money.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-amber-600">At-least-once</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Will deliver — may deliver twice on retry.</td>
                <td className="px-4 py-3 text-amber-600">Default. Need idempotent consumers.</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">99% of real systems. Pair with dedup keys.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-rose-600">Exactly-once</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Delivered exactly one time end-to-end.</td>
                <td className="px-4 py-3 text-rose-600">Expensive — txns, coordinated commits, locked tooling</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Kafka can do it <em>within Kafka</em>. End-to-end with a DB sink is still effectively idempotent at-least-once.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout variant="warn" title="Ordering and DLQs are non-negotiable">
          <strong>Ordering:</strong>{" "}Kafka guarantees order <em>per partition only</em>. Across partitions = no order. Choose your partition key carefully (e.g. <code>userId</code> keeps one user&apos;s events in order).<br/>
          <strong>DLQs:</strong>{" "}every consumer needs a dead-letter queue + a max-retry policy. A poison message will otherwise block the entire partition forever.
        </Callout>

        <h3 className="mt-6 mb-2 text-base font-semibold">Broker pick — when each one wins</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs tracking-wider text-slate-500 uppercase dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Broker</th>
                <th className="px-4 py-3 font-semibold">Model</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
                <th className="px-4 py-3 font-semibold">Don&apos;t use when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">SQS</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Managed work queue (push/pull)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Background jobs, AWS-native, no ops team to run a broker</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">You need replay, fan-out to multiple readers, or strict ordering across many consumers</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">RabbitMQ</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Exchange + routing (rich topologies)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Complex routing rules, priority queues, request/reply, RPC patterns</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">High-throughput log streaming or replay-from-yesterday</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Kafka</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Distributed log (consumers track offset)</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Event streaming, multi-consumer replay, audit trails, analytics pipeline</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Small workloads — operationally heavy (ZK/KRaft, partitions, brokers)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/message-queues" className="text-emerald-600 hover:underline">Module 16 — Message queues</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Kafka card */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">5. Kafka — the five things to remember</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Everything else is detail. If you have these five, you can answer almost any Kafka interview question.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">1 · Partition = unit of parallelism</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Throughput is bounded by partition count, not consumer count. Pick <code>numPartitions</code> deliberately: too few = throughput ceiling; too many = rebalance pain, file-handle blowup. Common rule: target a few thousand events/sec per partition, then round up generously — partitions can be added but rarely shrunk.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">2 · Consumer group = unit of scaling</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Members of a group split partitions. Different groups read the same topic independently — each with their own offsets. Add a new group anytime to add a new downstream consumer (analytics, audit, fan-out replica) without affecting existing pipelines.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">3 · Offsets: auto-commit vs manual</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Auto-commit is convenient and dangerous — it commits on a timer, so you can commit an offset before you&apos;ve actually processed the message (crash → message lost). Production code does <strong>manual commit after successful processing</strong> (at-least-once).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">4 · Exactly-once = three things together</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li><code>enable.idempotence=true</code> on the producer (dedup on retry)</li>
              <li><code>transactional.id</code> + <code>initTransactions</code> for atomic multi-partition writes</li>
              <li>Consumer reads with <code>isolation.level=read_committed</code></li>
            </ul>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              That gives you exactly-once <em>within Kafka</em>. End-to-end (Kafka → external DB) still needs an idempotent sink.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">5 · Rebalances hurt — minimize them</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              When a consumer joins/leaves a group, partitions are reshuffled — processing stops during the rebalance. Causes: deploys, OOM kills, long poll timeouts (<code>max.poll.interval.ms</code>). Tune <code>session.timeout.ms</code> and use cooperative rebalancing (incremental) to reduce pause time.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/kafka-deep" className="text-emerald-600 hover:underline">Module 17 — Kafka deep dive</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Event-driven & CQRS */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">6. Event-driven &amp; CQRS — what each one is actually buying you</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          These three patterns get reached for too often. Each solves a specific problem; using them when you don&apos;t have that problem is pure tax.
        </p>

        <h3 className="mb-2 text-base font-semibold">Event-carried state transfer vs notification-only</h3>
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-5 dark:border-slate-800 dark:bg-emerald-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">Notification-only event</div>
            <CodeBlock lang="plain">{`{
  "type": "OrderPlaced",
  "orderId": "ord_123"
}`}</CodeBlock>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Consumer must call back to the producer to fetch detail. Adds latency + coupling, but keeps the event light and the source-of-truth in one place.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-5 dark:border-slate-800 dark:bg-amber-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">Event-carried state transfer</div>
            <CodeBlock lang="plain">{`{
  "type": "OrderPlaced",
  "orderId": "ord_123",
  "userId": "usr_42",
  "amount": 4200,
  "items": [...]
}`}</CodeBlock>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Self-contained. Consumer needs no callback. Cost: event gets large; you must version the schema religiously.
            </p>
          </div>
        </div>

        <h3 className="mb-2 text-base font-semibold">CQRS — split read model from write model</h3>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Write side is normalized, validates invariants, optimized for correctness. Read side is denormalized, optimized for the specific queries the UI makes. An event stream from write → read keeps them in sync (with replication lag).
        </p>
        <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li><strong>Buys you:</strong>{" "}read scale independent of write scale, query shapes the UI actually wants, separate database technologies (Postgres write, Elasticsearch read).</li>
          <li><strong>Costs you:</strong>{" "}eventual consistency (the user&apos;s write may not show up in their next read for ~ms–seconds), two models to keep in sync, more moving parts.</li>
          <li><strong>Don&apos;t use for:</strong>{" "}CRUD apps where the read and write shapes are identical. You&apos;re paying the tax for no benefit.</li>
        </ul>

        <h3 className="mb-2 text-base font-semibold">Event sourcing — the audit + replay superpower</h3>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          Store the <em>events</em>{" "}as the source of truth, not the current state. Current state is a fold over the event log. You get a perfect audit trail, time-travel debugging, the ability to rebuild any projection — but every operation now lives in the event-modeling language.
        </p>
        <Callout variant="warn">
          <strong>When event sourcing is overkill:</strong>{" "}if you don&apos;t need audit, don&apos;t need replay, and your domain doesn&apos;t naturally express itself as events (most CRUD apps don&apos;t), this is a 10× complexity multiplier for zero business value. Use it for payments, ledger, ordering, regulated domains — not for the average CMS.
        </Callout>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Source: <Link href="/courses/system-design/modules/event-driven-cqrs" className="text-emerald-600 hover:underline">Module 18 — Event-driven &amp; CQRS</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Common gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="mb-1 text-2xl font-bold tracking-tight">7. Four gotchas that bite people in production</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Each of these has caused real incidents. The fix in every case is small; the cost of not knowing is large.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 1 · POST without an Idempotency-Key</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Client times out → retries → server processes both → user is charged twice. The fix is six lines and one header.
            </p>
            <CodeBlock lang="java">{`// BAD — retries duplicate the payment
@PostMapping("/payments")
public Payment create(@RequestBody PaymentRequest req) {
    return paymentService.charge(req);
}

// GOOD — key-based dedup at the controller
@PostMapping("/payments")
public Payment create(
    @RequestHeader("Idempotency-Key") String key,
    @RequestBody PaymentRequest req
) {
    return idempotencyStore.executeOnce(key, () -> paymentService.charge(req));
}`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 2 · Offset pagination on a growing table</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              New rows insert at the top while you&apos;re paging — you see duplicates on page 2 and miss rows on page 3. And page 1000 forces the DB to scan 20,000 rows just to skip them.
            </p>
            <CodeBlock lang="plain">{`-- BAD: O(N) skip cost, unstable under inserts
SELECT * FROM orders ORDER BY created_at DESC
LIMIT 20 OFFSET 19980;

-- GOOD: keyset / cursor — O(log N) seek, stable
SELECT * FROM orders
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 3 · Kafka consumer commits before processing</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              Auto-commit fires on a timer. If you crash between commit and processing, the message is lost forever. Commit <em>after</em>{" "}the work, manually.
            </p>
            <CodeBlock lang="java">{`// BAD — auto-commit silently loses messages on crash
props.put("enable.auto.commit", "true");
for (ConsumerRecord<String,String> r : consumer.poll(Duration.ofSeconds(1))) {
    process(r);  // crash here → offset already committed → message lost
}

// GOOD — manual commit after successful processing (at-least-once)
props.put("enable.auto.commit", "false");
for (ConsumerRecord<String,String> r : consumer.poll(Duration.ofSeconds(1))) {
    process(r);  // crash here → uncommitted → reprocessed on restart
}
consumer.commitSync();`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-900 dark:bg-rose-950/20">
            <div className="mb-2 text-xs font-bold tracking-wider text-rose-700 uppercase dark:text-rose-300">Gotcha 4 · CQRS on a CRUD that didn&apos;t need it</div>
            <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
              The team reads a CQRS article, splits read/write for a simple admin tool, and now has two services, an event bus, replication lag bugs, and a denormalized view to maintain. Nothing was actually gained.
            </p>
            <CodeBlock lang="plain">{`// BAD shape — symmetric read/write, no scale asymmetry, no separate query needs
[Service]  --write-->  [Postgres-write]
                                 |
                              events
                                 v
[Service]  --read-->  [Postgres-read]   <-- identical schema, replication lag for free

// GOOD shape — a single service over a single DB is fine
[Service]  <-->  [Postgres]

// CQRS is only worth it when:
//   - Read load >> write load (10x+)
//   - Read query shape != write query shape (denormalized projections)
//   - Different storage tech makes sense (Postgres write + ES read)`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Self-assessment */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="not-prose mb-1 text-2xl font-bold tracking-tight">8. Optional self-assessment</h2>
        <p className="not-prose mb-6 text-sm text-slate-500 dark:text-slate-400">
          Five quick recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="You're picking between REST/JSON and gRPC for a new service. Which scenario most clearly favors gRPC?"
          options={[
            { label: "A public-facing API consumed by mobile apps and third-party developers.", explanation: "REST wins here — browsers and third parties expect HTTP/JSON. gRPC requires a special client and a gRPC-Web proxy for browsers." },
            { label: "An internal service called by 12 other services in a polyglot fleet, with sub-10ms p99 budget and streaming responses.", correct: true, explanation: "Right. Internal + polyglot (.proto codegen wins) + tight latency budget (binary protobuf + HTTP/2) + streaming (first-class in gRPC) — every dimension favors gRPC." },
            { label: "A simple admin tool one team will hand-curl through.", explanation: "REST is friendlier to curl and Postman. gRPC needs grpcurl and adds operational weight you don't need." },
            { label: "A webhook receiver that external systems post to.", explanation: "Webhooks are HTTP+JSON by convention. Forcing gRPC on external posters won't work — they don't speak it." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Your team needs async message delivery between two services. Audit trail and replay aren't required. Throughput is ~100 messages/sec. The team has no broker experience. Best pick?"
          options={[
            { label: "Kafka — it's the most powerful broker.", explanation: "Kafka is operationally heavy (partitions, brokers, KRaft/ZooKeeper). For 100 msg/sec without replay needs, you're paying a large tax for capabilities you won't use." },
            { label: "SQS — managed queue, no broker to run, fits the workload.", correct: true, explanation: "Right. No replay needed, no team to operate a broker, throughput is well within SQS limits. The boring choice is correct: managed, low ops, exactly the use case." },
            { label: "RabbitMQ for rich routing.", explanation: "Rich routing is only worth it if you need rich routing. The problem doesn't describe any — RabbitMQ would be over-engineering plus the operational cost of running it." },
            { label: "Build a database-polling system — simpler.", explanation: "Polling is a classic trap: it looks simple until you need ordering, retries, DLQs, fairness, backpressure. A managed queue gives you all of that for free." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="You're sizing a new Kafka topic. Expected steady-state throughput is 50,000 events/sec, and you might 2× over the next year. How many partitions is a reasonable starting point, and why?"
          options={[
            { label: "1 — start minimal, add later.", explanation: "Adding partitions later is possible but rekeys all events going forward — message ordering by key breaks for existing data. And one partition caps you at single-consumer throughput." },
            { label: "10,000 — be safe.", explanation: "Wildly over-provisioned. Each partition costs file handles, replica overhead, and rebalance time. Thousands of partitions per topic causes operational pain." },
            { label: "Roughly 30–60 — sized to consumer parallelism with headroom for growth.", correct: true, explanation: "Right. Rule of thumb: target a few thousand events/sec per partition, then double for growth. 50k/sec → ~25 partitions at 2k each → round up to 30–60 for headroom. Partitions cap downstream parallelism, so size to consumer count + growth, not just current throughput." },
            { label: "Equal to the number of brokers.", explanation: "Brokers and partitions are orthogonal. Partition count is driven by parallelism + throughput per partition, not broker count." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A teammate says 'we have exactly-once delivery because we set enable.idempotence=true on the producer'. What's missing for true exactly-once?"
          options={[
            { label: "Nothing — that's all you need.", explanation: "Idempotent producer only dedups producer retries to the broker. You still need transactional writes across partitions and a consumer that reads only committed messages." },
            { label: "Set acks=1 on the producer.", explanation: "acks=1 is weaker durability, not stronger. For exactly-once you want acks=all, which is implied by enable.idempotence." },
            { label: "transactional.id on the producer (with initTransactions) AND isolation.level=read_committed on the consumer.", correct: true, explanation: "Right. The full recipe: idempotent producer (dedup retries) + transactional producer (atomic multi-partition write) + consumer reading only committed records. Miss any one and you're back to at-least-once." },
            { label: "Use a separate broker just for that topic.", explanation: "Broker isolation isn't part of the exactly-once protocol. It's a producer/consumer configuration story." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="When is CQRS most likely the wrong choice?"
          options={[
            { label: "A read-heavy product feed where queries need denormalized data and reads outnumber writes 100:1.", explanation: "This is exactly when CQRS pays off — asymmetric scale, different shapes for read vs write." },
            { label: "An internal admin CRUD over ~5 tables, where the read shape is the same as the write shape and load is modest.", correct: true, explanation: "Right. The CRUD has no scale asymmetry, no shape asymmetry, no audit need — CQRS would add an event bus, a second store, eventual-consistency bugs, and two models to maintain, all for zero benefit. A single service over a single DB is correct." },
            { label: "An e-commerce search experience where products are indexed in Elasticsearch and updated from a Postgres write store.", explanation: "Different storage tech for different query shapes — that IS CQRS, and it's the right call here." },
            { label: "A trading platform where the audit log of every order change is regulatory-mandatory.", explanation: "Event sourcing (often paired with CQRS) is exactly the pattern for regulated audit-mandatory domains." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — Ready for Phase 4 */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <Callout variant="spring" title="You're ready for Phase 4 when…">
          <ul className="mt-1 list-disc space-y-2 pl-5">
            <li>You can sketch the HTTP verb contract from memory and explain why <code>Idempotency-Key</code> is mandatory on POSTs that touch money.</li>
            <li>You can describe the Spring Cloud Gateway pipeline (route → predicates → filters) and name three things that belong at the edge — and one that doesn&apos;t.</li>
            <li>You can pick a broker (SQS / RabbitMQ / Kafka) given a workload sketch, and justify the choice using delivery guarantees, ordering needs, and operational cost.</li>
            <li>You can draw the Kafka partition → consumer-group picture and explain why a 5th consumer on a 4-partition topic just idles.</li>
            <li>You can name the three things needed for true exactly-once in Kafka and explain why &quot;just turn on idempotent producer&quot; isn&apos;t enough.</li>
            <li>You can tell whether CQRS or event sourcing is the right call by listing the conditions each one requires (asymmetric scale, denormalized read shapes, audit/replay) — and walk away from them when those conditions aren&apos;t met.</li>
          </ul>
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 dark:border-sky-900 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/30">
        <div className="mb-2 text-xs font-bold tracking-wider text-sky-700 uppercase dark:text-sky-300">
          Phase 3 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can now design the communication layer for any system</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          API contracts, edge concerns, broker tradeoffs, Kafka mechanics, event-driven patterns — the whole communication toolbox. From here on, when a system-design problem says &quot;Service A talks to Service B,&quot; you already know what questions to ask and what shape the answer takes.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 4 — Reliability &amp; Operations.</strong>{" "}Load balancing, rate limiting, Resilience4j (circuit breakers, retries, bulkheads), idempotency, observability, on-call. How systems hold together when one box is no longer enough — and how you stay sane when they don&apos;t.
        </p>
        <Link
          href="/courses/system-design/modules/load-balancing"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md transition hover:shadow-lg"
        >
          Next phase: Reliability &amp; Operations →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="phase-3-revision" />
    </article>
  );
}
