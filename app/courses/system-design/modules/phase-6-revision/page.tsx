import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";

// Pure revision module — no Checkpoints, no XP gates. The whole point is to
// re-read this in 25 minutes before a system-design interview, not to grind
// through it. Phase 6 is the densest phase (8 source modules), so this card
// is correspondingly bigger.
const CHECKPOINTS: { id: string; title: string }[] = [];

export default function Phase6RevisionModule() {
  const mod = getModuleBySlug("phase-6-revision")!;

  // The 6-step interview framework as a left-to-right flow. This is the
  // single most important diagram in the phase — if you internalize the
  // order, you'll never freeze at the whiteboard.
  const frameworkChart = `
flowchart LR
    S1["1. Clarify<br/>functional<br/>+ non-functional<br/>+ scale"] --> S2["2. Estimate<br/>QPS · storage<br/>· bandwidth"]
    S2 --> S3["3. API<br/>endpoints<br/>+ contracts"]
    S3 --> S4["4. Data model<br/>tables · keys<br/>· indexes"]
    S4 --> S5["5. High-level<br/>boxes & arrows<br/>(LB · API · DB · cache · queue)"]
    S5 --> S6["6. Deep dive<br/>the bottleneck<br/>the interviewer picks"]
    style S1 fill:#a855f7,color:#fff,stroke:#7e22ce
    style S2 fill:#a855f7,color:#fff,stroke:#7e22ce
    style S3 fill:#d946ef,color:#fff,stroke:#a21caf
    style S4 fill:#d946ef,color:#fff,stroke:#a21caf
    style S5 fill:#ec4899,color:#fff,stroke:#be185d
    style S6 fill:#f43f5e,color:#fff,stroke:#9f1239
  `.trim();

  // Side-by-side of the two fanout strategies — newsfeed is the archetype
  // where this choice dominates everything else.
  const fanoutChart = `
flowchart TB
    subgraph PUSH["FANOUT-ON-WRITE (push)"]
      direction LR
      U1[User A posts] --> W1[Write to A's tweet store]
      W1 --> F1[Fanout job:<br/>copy to each<br/>follower's feed]
      F1 --> R1[Reader: O(1)<br/>read own feed]
    end
    subgraph PULL["FANOUT-ON-READ (pull)"]
      direction LR
      U2[User A posts] --> W2[Write to A's tweet store]
      R2[Reader] --> Q2[Query each<br/>followee's tweets,<br/>merge & sort]
    end
    style PUSH fill:#dcfce7,stroke:#16a34a
    style PULL fill:#fef3c7,stroke:#ca8a04
  `.trim();

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link
          href="/courses/system-design"
          className="inline-block text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-underline"
        >
          ← All modules
        </Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="mt-2 block w-fit px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider">
          Phase 6 · Module {mod.number} · Revision
        </span>
        <h1 className="text-4xl font-bold tracking-tight mt-4 mb-3">
          Phase 6 revision notes
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">
          The 6-step framework + 7 design archetypes (TinyURL, newsfeed, Twitter, chat, rate limiter, rideshare, payments) on one card.
        </p>
        <ModuleProgress moduleSlug="phase-6-revision" checkpoints={CHECKPOINTS} />
      </header>

      {/* INTRO */}
      <section className="not-prose mb-10">
        <Callout variant="insight">
          <strong>How to use this card.</strong> This is not new material — it&apos;s a map of the eight Phase 6 modules compressed into reference cards. Read it once cold to test recall. Re-read it on the train to a phone screen. If an archetype card feels unfamiliar, the source module is one click away.
        </Callout>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
          The eight modules you&apos;re consolidating: <Link href="/courses/system-design/modules/interview-framework" className="text-fuchsia-600 hover:underline">the 6-step framework</Link>, <Link href="/courses/system-design/modules/design-tinyurl" className="text-fuchsia-600 hover:underline">TinyURL</Link>, <Link href="/courses/system-design/modules/design-newsfeed" className="text-fuchsia-600 hover:underline">news feed</Link>, <Link href="/courses/system-design/modules/design-twitter" className="text-fuchsia-600 hover:underline">Twitter</Link>, <Link href="/courses/system-design/modules/design-chat" className="text-fuchsia-600 hover:underline">chat</Link>, <Link href="/courses/system-design/modules/design-rate-limiter" className="text-fuchsia-600 hover:underline">rate limiter</Link>, <Link href="/courses/system-design/modules/design-rideshare" className="text-fuchsia-600 hover:underline">rideshare</Link>, and <Link href="/courses/system-design/modules/design-payments" className="text-fuchsia-600 hover:underline">payments</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 1 — The 6-step framework */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">1. The 6-step interview framework</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Same order every time. The minute hand on the clock moves whether you&apos;re ready or not — having a script means you spend zero seconds deciding what to do next.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-6">
          <Mermaid chart={frameworkChart} />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-fuchsia-50/40 dark:bg-fuchsia-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300 mb-2">Step 1 · Clarify (5 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Three buckets:</p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
              <li><strong>Functional:</strong> what does the user do? (post, follow, read feed)</li>
              <li><strong>Non-functional:</strong> latency target, consistency, availability, durability</li>
              <li><strong>Scale:</strong> DAU, peak QPS, geo distribution, read:write ratio</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-fuchsia-50/40 dark:bg-fuchsia-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300 mb-2">Step 2 · Estimate (5 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Three numbers, in this order:</p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-4">
              <li><strong>QPS:</strong> DAU × actions/user/day ÷ 86,400 × peak factor (≈3×)</li>
              <li><strong>Storage:</strong> writes/day × bytes/write × retention × replication factor</li>
              <li><strong>Bandwidth:</strong> QPS × bytes/response (cache-miss path)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-pink-50/40 dark:bg-pink-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2">Step 3 · API (5 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              3–6 endpoints. <code>POST /resource</code>, <code>GET /resource/:id</code>, plus the read paths. Mention pagination, idempotency keys, response shape.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-pink-50/40 dark:bg-pink-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2">Step 4 · Data model (5 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Core tables, primary keys, partition keys, secondary indexes. Pick SQL vs NoSQL with a one-line justification (joins? scale? schema flex?).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-rose-50/40 dark:bg-rose-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Step 5 · High-level (10 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              Boxes-and-arrows: client → LB → API → cache → DB, plus queues/workers/search/CDN where they belong. Trace one read and one write end-to-end.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-rose-50/40 dark:bg-rose-950/20">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Step 6 · Deep dive (15 min)</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              The interviewer picks the bottleneck. Common probes: hot keys, fanout, consistency, scaling the DB, failure modes, dedupe, race conditions.
            </p>
          </div>
        </div>

        <Callout variant="warn">
          <strong>The single most common failure mode</strong> is skipping step 1 and jumping straight to boxes-and-arrows. The interviewer will let you do it — and then ding you for missing requirements they never had to state aloud.
        </Callout>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/interview-framework" className="text-fuchsia-600 hover:underline">Module 33 — The interview framework</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — Fanout diagram */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">2. The fanout decision (push vs pull)</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          The single most-asked tradeoff in this phase. Newsfeed, Twitter, and chat group fanout all live on this axis.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/40 mb-4">
          <Mermaid chart={fanoutChart} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Axis</th>
                <th className="px-4 py-3 font-semibold">Fanout-on-write (push)</th>
                <th className="px-4 py-3 font-semibold">Fanout-on-read (pull)</th>
                <th className="px-4 py-3 font-semibold">Hybrid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">Read cost</td>
                <td className="px-4 py-3 text-emerald-600">O(1) — pre-materialized</td>
                <td className="px-4 py-3 text-rose-600">O(followees) — merge at read</td>
                <td className="px-4 py-3 text-amber-600">O(celebrities) merge at read</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Write cost</td>
                <td className="px-4 py-3 text-rose-600">O(followers) — fan out to each</td>
                <td className="px-4 py-3 text-emerald-600">O(1) — append once</td>
                <td className="px-4 py-3 text-emerald-600">O(1) for celebs, O(followers) for normals</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Storage</td>
                <td className="px-4 py-3 text-rose-600">N × followers (duplicates)</td>
                <td className="px-4 py-3 text-emerald-600">N (one copy)</td>
                <td className="px-4 py-3 text-amber-600">In between</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Best for</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Read-heavy, normal users</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Write-heavy, light reads</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Mixed traffic (Twitter)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Breaks on</td>
                <td className="px-4 py-3 text-rose-600">Celebrities (100M followers)</td>
                <td className="px-4 py-3 text-rose-600">Users following 10,000+ accounts</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Needs threshold tuning</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Source: <Link href="/courses/system-design/modules/design-newsfeed" className="text-fuchsia-600 hover:underline">Module 35 — Design a news feed</Link>.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — 7 archetypes one-pagers */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">3. The 7 design archetypes</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          One card per archetype: the key insight, a 3-line data model, and a hot-take paragraph. If you can recite all seven cold, you can survive any L5+ system-design loop.
        </p>

        <div className="space-y-4">
          {/* TinyURL */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Archetype 1 · TinyURL</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> read-heavy ratio (~100:1), so cache aggressively. The whole service is essentially a giant KV lookup with a base62 encoder bolted on.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`urls(short_code PK, long_url, owner_id, created_at, expires_at)
counters(host_id PK, next_id)   -- range-allocated, avoids hot key
custom_aliases(alias PK, short_code FK)  -- optional reservations`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              The encoding question is base62 (a-z, A-Z, 0-9 = 62 chars; 7 chars = 3.5 trillion URLs). Generate IDs from a shared counter that hands out ranges to each host (so each host gets 1000 IDs at a time, no per-request roundtrip). Custom aliases are just a uniqueness check against the same table. The redirect path must be sub-10ms — pin the cache in front of the DB and accept eventual consistency on expiration. <Link href="/courses/system-design/modules/design-tinyurl" className="text-emerald-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Newsfeed */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2">Archetype 2 · News feed</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> the entire design hinges on push vs pull vs hybrid (see table above). Hybrid wins for real traffic because the distribution of follower counts is power-law.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`posts(post_id PK, author_id, content, created_at)
follows(follower_id, followee_id, PK(follower_id, followee_id))
feed_cache(user_id, post_id, score, PK(user_id, score DESC))  -- materialized for push users`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Push for normal users (instantly fan out to followers&apos; feed caches in Redis). For celebrities (say &gt; 10K followers), <strong>don&apos;t push</strong>; instead, on each reader&apos;s feed assembly, pull the celebrity&apos;s recent posts and merge them with the pre-materialized normal-user feed. This bounds the worst-case write cost while keeping read latency low. Ranking, ML scoring, and ad insertion are layered on top of this read path. <Link href="/courses/system-design/modules/design-newsfeed" className="text-amber-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Twitter */}
          <div className="rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-2">Archetype 3 · Twitter</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> Twitter = newsfeed + search + trending. Each of those three is its own subsystem with its own data store; the trick is sequencing them in your design so you don&apos;t try to do it all with one DB.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`tweets(tweet_id PK, author_id, body, ts)         -- primary store (Cassandra/sharded SQL)
es_tweets_index                                  -- Elasticsearch sidecar populated via CDC
trending(hashtag, window_start, count, PK(hashtag, window_start))`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Newsfeed reuses the hybrid fanout from above. Search is a sidecar Elasticsearch cluster populated by Change Data Capture from the tweet store — never query the primary for full-text. Trending is a sliding-window count over hashtag events: bucket counts in 1-min windows, sum the last N windows, top-K via a heap. Each subsystem can be scaled independently, and that&apos;s the whole point. <Link href="/courses/system-design/modules/design-twitter" className="text-sky-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Chat */}
          <div className="rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50/40 dark:bg-violet-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 mb-2">Archetype 4 · Chat</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> chat is the only archetype where the connection layer is stateful. WebSocket connections pin a user to a single server, and your load balancer has to know it.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`conversations(conv_id PK, type ENUM('1:1','group'), created_at)
messages(conv_id, msg_id, sender_id, body, ts, PK(conv_id, msg_id))  -- partitioned by conv_id
presence_cache(user_id → connection_server, ttl 30s in Redis)`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Connection layer is stateful WebSocket servers behind a sticky LB (consistent-hash on user_id). Message ordering is per-conversation: partition the messages table by conv_id, assign monotonic msg_id from a per-conversation sequencer (or hybrid logical clock). Group fanout = look up each member&apos;s connection-server in the presence cache and publish via Redis pub/sub or Kafka; offline users get a push notification through APNs/FCM. The hard part isn&apos;t the schema — it&apos;s the reconnection/backfill story when a user&apos;s connection drops mid-conversation. <Link href="/courses/system-design/modules/design-chat" className="text-violet-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Rate limiter */}
          <div className="rounded-xl border border-orange-200 dark:border-orange-900 bg-orange-50/40 dark:bg-orange-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 mb-2">Archetype 5 · Distributed rate limiter</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> the algorithm is easy (token bucket). The scary part is doing it atomically across N gateway nodes with sub-millisecond latency, and choosing whether to <em>fail open</em> or <em>fail closed</em> when Redis is down.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`Redis key: rl:{user_id}:{endpoint}
  → value = (tokens, last_refill_ts)
Lua script (EVAL): refill, decrement, return allow/deny  -- atomic, one RTT`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Token bucket parameters: capacity (burst) and refill rate (sustained). Key is per-user OR per-IP OR per-endpoint — usually all three layered. The atomic update is done in a Lua script via <code>EVAL</code>, which makes the refill + check + decrement a single Redis op. Degradation strategy is the interview gotcha: <strong>fail open</strong> (allow through on Redis outage — preserves availability, accepts abuse risk) or <strong>fail closed</strong> (reject everything — preserves backend, kills user trust). Pick based on whether the protected resource is more sensitive to overload or to outage. <Link href="/courses/system-design/modules/design-rate-limiter" className="text-orange-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Rideshare */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 mb-2">Archetype 6 · Rideshare</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> five subsystems (geo-index, dispatch, ETA, surge, payment). The matching round-trip — driver candidate → offer → accept/reject → fall back to next candidate — is the hard part because it&apos;s low-latency and stateful.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`drivers(driver_id PK, status, last_geohash, last_seen)  -- updated every 4s via WebSocket
geo_index(geohash → set of driver_ids)                  -- Redis ZSET or S2 cells
trips(trip_id PK, rider_id, driver_id, state, route, fare)`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Drivers stream GPS over WebSocket every few seconds; their location lives in a geo-index (geohash prefix or S2 cells) for O(log n) k-NN queries. Dispatch = look up candidates in the geo-index, rank by ETA × surge × driver-rating, offer to top candidate, wait 10s, fall back to next. ETA uses a road-graph router (OSRM/Valhalla) plus historical traffic. Surge is a feedback loop over unmet demand per cell. Payment is a separate service (see archetype 7). The hardest tradeoff is consistency of driver state vs latency of the match — short-pessimistic-locks per offer is the usual answer. <Link href="/courses/system-design/modules/design-rideshare" className="text-teal-600 hover:underline">Source →</Link>
            </p>
          </div>

          {/* Payments */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Archetype 7 · Payments</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
              <strong>Key insight:</strong> money is different. Idempotency keys are mandatory, the ledger is append-only, and reconciliation against the gateway is the source of truth. Boring is the goal — cleverness in payments is a code smell.
            </p>
            <CodeBlock lang="plain" caption="Data model (3 lines)">{`ledger(entry_id PK, txn_id, account, amount_cents, currency, type, ts)  -- append-only, double-entry
idempotency(idem_key PK, body_hash, status, response_blob, ts)
reconciliation(date, gateway_ref, ledger_entry_id, matched_at)`}</CodeBlock>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
              Every financial event becomes two or more ledger entries that sum to zero (double-entry). The client owns the idempotency key; the server stores the response blob and replays it on retry. <strong>Never modify a posted ledger entry</strong> — corrections are <em>reversing entries</em> appended to the log so the audit trail is intact. Every night, fetch the gateway&apos;s settlement report and match each line to a ledger entry; mismatches go to a queue for human review. The interviewer wants to hear &quot;append&quot;, &quot;balanced&quot;, &quot;idempotent&quot;, and &quot;reversing entry&quot; — in that order. <Link href="/courses/system-design/modules/design-payments" className="text-rose-600 hover:underline">Source →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — Cross-cutting infra table */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">4. Cross-cutting infra — which archetype needs which</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          If you can fill in this grid from memory, you can pattern-match any new design prompt onto the right combination of components.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Archetype</th>
                <th className="px-4 py-3 font-semibold text-center">Cache</th>
                <th className="px-4 py-3 font-semibold text-center">Queue</th>
                <th className="px-4 py-3 font-semibold text-center">Search index</th>
                <th className="px-4 py-3 font-semibold text-center">Geo index</th>
                <th className="px-4 py-3 font-semibold text-center">WebSocket</th>
                <th className="px-4 py-3 font-semibold text-center">Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-3 font-semibold">TinyURL</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">News feed</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Twitter</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-amber-600">●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Chat</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Rate limiter</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Rideshare</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-amber-600">●</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Payments</td>
                <td className="px-4 py-3 text-center text-amber-600">●</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-slate-400">—</td>
                <td className="px-4 py-3 text-center text-emerald-600">●●●</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          ●●● = central to the design · ●● = important but not the headline · ● = supporting · — = not required.
        </p>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — Common gotchas */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1">5. Four gotchas that sink interviews</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Each one is a real anti-pattern that&apos;s ended real interview loops. If you only remember four things from this card, make it these.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 1 · Jumping into HLD without clarifying</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              The interviewer says &quot;design Twitter&quot; — and you start drawing boxes 30 seconds later. You will miss the scale numbers, miss the read:write ratio, and design for the wrong tradeoffs.
            </p>
            <CodeBlock lang="plain">{`# BAD — straight to boxes
Candidate: "OK so we have a load balancer, then an API server, then a DB..."
[5 min later, interviewer interrupts]
Interviewer: "How many users? How fast does the feed need to load? Are
              we optimizing for write or read?"
Candidate: "...uh..."

# GOOD — 5 min on requirements first
Candidate: "Before I draw anything — DAU? Read:write ratio? Latency target?
            Consistency requirements for the feed? Any specific feature you
            care about — search, trending, DMs?"
Interviewer: [gives you everything you need, you design for the right thing]`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 2 · Fanout-on-write for a celebrity</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              A single tweet from a user with 100M followers in a pure push model = 100M Redis writes. Your fanout queue will be hours behind by lunchtime.
            </p>
            <CodeBlock lang="plain">{`# BAD — push for everyone
def on_post(post):
    for follower in get_followers(post.author):   # 100M followers
        feed_cache[follower].push(post)            # 100M writes — minutes
                                                   # per tweet, queue backs up

# GOOD — push only if author below threshold
def on_post(post):
    author_followers = follower_count(post.author)
    if author_followers > CELEBRITY_THRESHOLD:    # e.g. 10,000
        return                                     # pulled at read time
    for follower in get_followers(post.author):
        feed_cache[follower].push(post)
# Reader merges: pre-materialized feed ⊕ live pull of celebrity posts`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 3 · Chat without sticky LB</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              WebSockets are <em>stateful</em>. If a user&apos;s message comes in on server A but their connection is held by server B, the message has nowhere to go. Round-robin load balancing breaks chat.
            </p>
            <CodeBlock lang="plain">{`# BAD — round-robin L4 LB in front of WS servers
[client] --WebSocket--> [L4 LB] --> [WS-1, WS-2, WS-3]
# Round-robin: user's connect lands on WS-2, but next incoming
# message routes to WS-1 — no connection there, message dropped.

# GOOD — consistent-hash LB on user_id + presence registry
[client] --WebSocket--> [L7 LB: hash(user_id)] --> [WS-N]
                                                    ↓
                                          presence: user → WS-N (Redis, TTL 30s)
# To deliver to a user: look up their server in presence, route there.`}</CodeBlock>
          </div>

          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 mb-2">Gotcha 4 · Mutating a ledger entry</div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              You posted the wrong amount. Your instinct is to <code>UPDATE ledger SET amount = ... WHERE id = ...</code>. Stop. You just destroyed the audit trail. Compliance will not approve this design.
            </p>
            <CodeBlock lang="plain">{`-- BAD — direct mutation, audit trail is gone
UPDATE ledger SET amount_cents = 1500 WHERE entry_id = 42;
-- Auditor: "What was the amount before this row was changed?"
-- You: "...I don't know."

-- GOOD — append a reversing entry, then append the correct one
INSERT INTO ledger (entry_id, txn_id, account, amount_cents, type, ts)
  VALUES (99, 'txn_abc', 'rider:42', -2000, 'reversal_of:42', now());  -- undo
INSERT INTO ledger (entry_id, txn_id, account, amount_cents, type, ts)
  VALUES (100, 'txn_abc', 'rider:42', 1500, 'charge', now());          -- redo
-- Full history is preserved. The current balance is the sum of all entries.`}</CodeBlock>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — Self-assessment quizzes */}
      {/* ============================================================ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-1 not-prose">6. Optional self-assessment</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 not-prose">
          Six recall checks. No XP, no gating — just &quot;do I actually remember this?&quot; If you miss one, jump back to the source module.
        </p>

        <Quiz
          kind="Recall check"
          question="In the 6-step framework, what is the actual purpose of step 2 (estimate)?"
          options={[
            { label: "To show off mental math", explanation: "The interviewer doesn't care about the math itself — they care about what it lets you justify." },
            { label: "To pick numbers that justify the architectural choices in steps 4–6 (sharding, caching, queueing)", correct: true, explanation: "Right. If your QPS estimate is 100/s, you don't need sharding. If it's 1M/s, you do. The estimate is the warrant for every scaling decision that follows." },
            { label: "To pad the interview time", explanation: "Step 2 takes ~5 min. It's not padding — it's the foundation for everything after." },
            { label: "Because the interviewer will grade your arithmetic", explanation: "Order of magnitude is what matters. Nobody is checking that you got 86,400 right to the last digit." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="A celebrity user on your platform has 50M followers. Which fanout strategy should they use?"
          options={[
            { label: "Push (fanout-on-write) — pre-materialize for fast reads", explanation: "Pushing to 50M follower feeds per tweet would saturate your fanout workers within minutes. This is exactly the celebrity problem." },
            { label: "Pull (fanout-on-read) for celebrity posts, with push for normal users — the hybrid model", correct: true, explanation: "Right. Above the celebrity threshold (e.g. 10K followers), don't fan out. Readers merge a celebrity-pull layer with their pre-materialized normal feed at read time. Bounds the worst-case write cost." },
            { label: "Push, but use 1000 fanout workers", explanation: "Throwing workers at the problem just moves the bottleneck. The fundamental write amplification is still 50M per tweet." },
            { label: "Pull for all users", explanation: "That works for the celebrity but kills read latency for normal users following 200 accounts. Hybrid wins." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="What ordering guarantee does a well-designed chat system provide?"
          options={[
            { label: "Global total ordering across all conversations", explanation: "Way too strong — requires a single global sequencer, kills horizontal scaling. Nobody needs this; users only see their own conversations." },
            { label: "Per-conversation FIFO ordering, achieved by partitioning the messages table by conv_id and using a per-conversation sequencer or HLC", correct: true, explanation: "Right. Users only ever see messages in conversations they're in, so per-conversation ordering is all you need. Partition by conv_id, sequence within, scale out across conv_ids." },
            { label: "Best-effort — messages may arrive in any order, client sorts by timestamp", explanation: "Wall-clock timestamps from different servers drift. You'd get reordering visible to users. Use a logical sequencer per conversation." },
            { label: "Eventual consistency only — order doesn't matter", explanation: "Order absolutely matters in chat. 'I hate you / just kidding' delivered in the wrong order is a serious bug." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="Why does the distributed rate limiter use a Lua script in Redis instead of multiple commands?"
          options={[
            { label: "Lua is faster than Redis commands", explanation: "Lua runs inside Redis, so it's no faster per op — the advantage is atomicity." },
            { label: "To make the refill + check + decrement atomic in a single round-trip, eliminating the race condition between read and write under high concurrency", correct: true, explanation: "Right. Without atomicity, two concurrent requests could both read 1 token remaining, both decrement, and both succeed — leaking past the limit. EVAL gives you a single atomic op." },
            { label: "Because Redis doesn't support transactions", explanation: "Redis does support MULTI/EXEC, but it's clunkier and doesn't let you do conditional logic on intermediate values. Lua is the standard idiom." },
            { label: "It reduces Redis memory usage", explanation: "Lua scripts have nothing to do with memory usage; they're about transactional execution." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="For a rideshare 'nearest 10 drivers within 2km' query, which spatial index is the right pick?"
          options={[
            { label: "A regular B-tree on (latitude, longitude)", explanation: "B-trees are 1D. A composite (lat, lon) index won't efficiently answer 2D nearest-neighbor — you'd scan an entire latitude band." },
            { label: "Geohash or S2 cells indexed in a sorted-set (Redis ZSET) — gives O(log n) lookup by prefix and natural geographic locality", correct: true, explanation: "Right. Geohash and S2 both encode 2D positions into 1D keys that preserve locality. Looking up neighbors = prefix match + a few adjacent cells. This is exactly what Uber and Lyft use." },
            { label: "Full table scan — drivers are small enough", explanation: "Maybe at 100 drivers. At a million active drivers in a metro at peak, you cannot scan per request." },
            { label: "Hash index on city", explanation: "Way too coarse. Within a city you still need to find the 10 closest, not all drivers in the city." },
          ]}
        />

        <Quiz
          kind="Recall check"
          question="At what level should the idempotency key live in a payments API?"
          options={[
            { label: "Generated server-side per request", explanation: "If the server generates it, retries get a new key — defeats the whole point of idempotency. The client must own the key so that retried requests share it." },
            { label: "Client-provided in a header, stored server-side keyed by (idempotency_key, body_hash); same key + same body returns the cached response, same key + different body is a 422", correct: true, explanation: "Right. The client owns the key (so retries share it), the server owns the response (so it's stable), and matching the body hash prevents accidental reuse of a key for a different request. This is the Stripe pattern, codified." },
            { label: "Per database connection", explanation: "Connections are pooled and reused; this gives no useful guarantee." },
            { label: "It's optional — most payments work fine without one", explanation: "Without idempotency keys, every network blip is a double-charge waiting to happen. They are mandatory in production payments." },
          ]}
        />
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — Ready for Phase 7 */}
      {/* ============================================================ */}
      <section className="not-prose mb-12">
        <Callout variant="spring">
          <strong>You&apos;re ready for Phase 7 when…</strong> you can pick any one of the seven archetypes, walk the 6-step framework end-to-end without stopping to think about the order, and name the headline tradeoff before drawing a single box. When the interviewer says &quot;OK, now let&apos;s zoom in on the bottleneck&quot;, you already know which two boxes they&apos;re going to point at — and you have a 5-minute deep dive ready for each.
        </Callout>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — Footer / next phase */}
      {/* ============================================================ */}
      <section className="mt-12 p-6 rounded-2xl border border-pink-200 dark:border-pink-900 bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-pink-950/30 dark:via-slate-900 dark:to-rose-950/30">
        <div className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2">
          Phase 6 — locked in
        </div>
        <h3 className="mt-0 mb-2 text-xl font-bold">You can run a 45-minute design loop end-to-end</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          The 6-step framework, the fanout decision, seven archetypes, the cross-cutting infra map, and four gotchas. That&apos;s the playbook every senior engineer carries into a system-design interview — and the patterns are the same ones you&apos;ll reach for when you&apos;re actually building production systems.
        </p>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          <strong>Up next: Phase 7 — Production &amp; Capstone.</strong> Migrating off legacy monoliths, security at scale, the full course recap, and a capstone design exercise that ties everything together.
        </p>
        <Link
          href="/courses/system-design/modules/migration-patterns"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition no-underline"
        >
          Next phase: Production &amp; Capstone →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="phase-6-revision" />
    </article>
  );
}
