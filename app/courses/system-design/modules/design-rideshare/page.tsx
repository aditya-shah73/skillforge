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
  { id: "deep", title: "Deep dives" },
  { id: "advanced", title: "Advanced concerns" },
];

const dispatchChart = `flowchart LR
  Rider[Rider App] -->|requestRide lat lng| API[Ride API]
  API -->|write trip REQUESTED| TripDB[(Trip Store)]
  API -->|publish trip.requested| Kafka[(Kafka)]
  Kafka --> Matcher[Matching Service]
  Matcher -->|GEORADIUS| GEO[(Redis GEO)]
  Matcher -->|score and rank| Matcher
  Matcher -->|offer with 15s TTL| Driver[Driver App]
  Driver -->|accept| Matcher
  Matcher -->|update MATCHED| TripDB
  Matcher -->|publish trip.matched| Kafka
  Driver -->|location every 4s| GEO
  style GEO fill:#fce7f3,stroke:#db2777
  style Kafka fill:#fef3c7,stroke:#d97706
  style TripDB fill:#dbeafe,stroke:#2563eb`;

const stateMachineChart = `stateDiagram-v2
  [*] --> REQUESTED
  REQUESTED --> MATCHED: driver accepts
  REQUESTED --> CANCELLED: rider cancels
  REQUESTED --> NO_DRIVERS: timeout
  MATCHED --> EN_ROUTE: driver starts pickup
  MATCHED --> CANCELLED: either party cancels
  EN_ROUTE --> ARRIVED: driver at pickup
  ARRIVED --> IN_TRIP: rider boards
  IN_TRIP --> COMPLETED: dropoff
  COMPLETED --> PAID: charge succeeds
  COMPLETED --> PAYMENT_FAILED: charge declined
  PAID --> [*]`;

export default function Page() {
  const mod = getModuleBySlug("design-rideshare")!;

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
      <BookmarkButton courseId="system-design" moduleSlug="design-rideshare" />

      <ModuleProgress moduleSlug="design-rideshare" checkpoints={CHECKPOINTS} />

      <section className="mb-10">
        <h2>What you&apos;ll walk out with</h2>
        <ul>
          <li>A geo-indexing strategy that scales to millions of online drivers without scanning the world.</li>
          <li>A matching pipeline that picks a driver in under a second and survives a refused offer.</li>
          <li>A trip state machine that&apos;s safe to retry, audit, and replay after a crash.</li>
          <li>An opinion on surge pricing, ETAs, and the failure modes that ruin Friday nights.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2>The opener</h2>
        <p>
          &quot;Design Uber&quot; is a question about <strong>geo at write rate</strong>. Drivers ping their location every few seconds. Riders
          ask &quot;who&apos;s near me?&quot; and want an answer before they get bored. Both sides are mobile, flaky, and unforgiving.
        </p>
        <p>
          The naive answer — &quot;query a Postgres table by lat/lng range&quot; — fails at the first city. You need a spatial index that
          handles tens of thousands of writes per second per region and serves radius queries in milliseconds. That&apos;s the spine
          of the system. Everything else (pricing, dispatch, payments) hangs off of it.
        </p>
        <Callout variant="insight" title="Frame the problem in one sentence">
          A rideshare backend is a real-time spatial join: match a moving point (rider request) to the best of N moving points
          (online drivers) under a deadline.
        </Callout>
      </section>

      <Checkpoint moduleSlug="design-rideshare" id="reqs" title="Part 1 · Requirements & estimation" xp={25}>
        <h3>Functional scope</h3>
        <ul>
          <li>Rider opens app, sees nearby drivers (visual only — not a commitment).</li>
          <li>Rider requests a ride at a pickup location with a destination.</li>
          <li>System matches a driver within seconds; driver gets an offer; can accept or pass.</li>
          <li>Trip lifecycle: en-route → arrived → in-trip → completed.</li>
          <li>Payment after completion. Rating from both sides.</li>
        </ul>
        <h3>What we&apos;ll defer</h3>
        <ul>
          <li>Pool/shared rides (different matching problem — multi-rider knapsack).</li>
          <li>Driver onboarding, KYC, background checks.</li>
          <li>Maps/routing internals (assume an OSRM-style service exists).</li>
        </ul>
        <h3>Non-functional targets</h3>
        <ul>
          <li><strong>Match latency:</strong>{" "}p95 under 1s from request to first offer.</li>
          <li><strong>Location update throughput:</strong>{" "}a single dense city (say SF) has ~30k drivers online at peak, pinging every 4s — 7.5k writes/sec for one city.</li>
          <li><strong>Availability:</strong>{" "}ride-request path is 99.99%. Location pings can drop a few; a missed match is a customer-visible failure.</li>
          <li><strong>Geo-distribution:</strong>{" "}regional sharding. A rider in Berlin doesn&apos;t need to know about drivers in Tokyo.</li>
        </ul>
        <h3>Back-of-envelope</h3>
        <p>
          Globally: ~5M drivers online at peak. At 4s ping interval that&apos;s 1.25M writes/sec on the location index. At ~100 bytes per
          ping (driver_id, lat, lng, heading, timestamp) that&apos;s 125 MB/sec inbound. You will not put that on Postgres.
        </p>
        <p>
          Ride requests are the small number: maybe 50k/sec globally at peak. Every request triggers a radius query plus a small write.
          That&apos;s the request that has to feel snappy.
        </p>
        <Quiz
          question="At 5M drivers online globally pinging every 4 seconds, what's the dominant scaling pressure?"
          options={[
            { label: "Read QPS on the trip database", correct: false, explanation: "Trip writes are bounded by ride requests (~50k/s), not pings." },
            { label: "Write throughput on the geo index", correct: true, explanation: "1.25M location writes/sec is the spine. Sharding the geo index by region or geohash prefix is non-negotiable." },
            { label: "Egress bandwidth to driver apps", correct: false, explanation: "Drivers mostly upload locations; downstream traffic is tiny offers and trip updates." },
            { label: "CPU on the matching service", correct: false, explanation: "Matching only fires on ride requests. The pings are the firehose." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-rideshare" id="design" title="Part 2 · High-level design" xp={30}>
        <h3>The core services</h3>
        <ul>
          <li><strong>Location Service:</strong>{" "}ingests driver pings, writes to the geo index, fans out to map UI for nearby riders.</li>
          <li><strong>Matching Service:</strong>{" "}consumes ride requests, runs radius queries, scores candidates, dispatches offers.</li>
          <li><strong>Trip Service:</strong>{" "}owns the trip state machine. Source of truth for &quot;what happened.&quot;</li>
          <li><strong>Pricing Service:</strong>{" "}quotes fares pre-ride, applies surge per geohash, computes final fare on completion.</li>
          <li><strong>Payment Service:</strong>{" "}charges the rider, settles the driver. (We&apos;ll go deeper on this in the next module.)</li>
        </ul>

        <h3>API surface</h3>
        <CodeBlock lang="plain" caption="HTTP API — driver and rider clients">{`# Driver client
POST /v1/driver/location              { lat, lng, heading, status }   -> 204
PUT  /v1/driver/status                { status: "ONLINE" | "OFFLINE" } -> 204
POST /v1/driver/offers/{offerId}/accept                                 -> 200 trip
POST /v1/driver/offers/{offerId}/decline                                -> 204

# Rider client
GET  /v1/rider/nearby?lat=&lng=&radius=                                 -> [drivers]
POST /v1/rider/quotes                 { pickup, dropoff }               -> { fare, eta, surge }
POST /v1/rider/trips                  { quoteId, paymentMethodId }      -> trip (REQUESTED)
DELETE /v1/rider/trips/{id}                                             -> 204

# Trip events (server push via WebSocket)
trip.matched | trip.en_route | trip.arrived | trip.completed | trip.cancelled`}</CodeBlock>

        <h3>The dispatch flow</h3>
        <Mermaid chart={dispatchChart} />
        <p>
          Notice what isn&apos;t in this picture: <strong>a synchronous DB scan</strong>. The matcher hits Redis GEO for the radius
          query (sub-millisecond), then a small candidate set goes into a scorer. The trip write is single-row. Nothing in the hot
          path needs to fan out to a multi-region database.
        </p>

        <h3>Geo indexing — pick one and own it</h3>
        <ul>
          <li><strong>Geohash:</strong>{" "}string prefix encoding of (lat, lng). Easy to shard. Prefix length controls cell size. Fine for &quot;within radius R&quot; if you query the cell plus its 8 neighbors.</li>
          <li><strong>S2 cells (Google):</strong>{" "}hierarchical, projection-distortion-free. Uber uses H3 (hex grid) which is a sibling — same idea, hexagons play nicer for radius queries.</li>
          <li><strong>Redis GEO:</strong>{" "}ZSET-backed, sorted by 52-bit geohash. <code>GEOADD</code>, <code>GEORADIUS</code>. Excellent for the hot index. Not durable storage — you back it with Cassandra or DynamoDB for replay.</li>
        </ul>

        <Callout variant="spring" title="Why Redis GEO and not a database">
          Geo queries on Postgres or MySQL with a spatial index work — until you&apos;re writing 100k/sec at one shard. Redis is in
          memory, single-threaded per shard, and serves <code>GEORADIUS</code> in microseconds. You will lose the index on a crash;
          rebuild from the durable store. The trade is correctness for speed, and it&apos;s the right trade here.
        </Callout>

        <h3>Sharding the geo index</h3>
        <p>
          Shard by geohash prefix. A 4-character geohash is ~20km on a side — coarse enough to keep cities together, fine enough that
          one shard isn&apos;t the whole world. SF is one shard; NYC is another. A driver crossing a boundary writes to both during a
          transition window so reads don&apos;t miss anyone. Boundaries are edge cases — test them.
        </p>

        <PartRecap
          title="Part 2 recap"
          gist="Matching is a spatial join with a deadline. The geo index is the spine. Everything hot reads from Redis; everything durable replays from a log."
          points={[
            { takeaway: "Three planes", detail: "Location (firehose), matching (request-driven), trip state (auditable). Don't mix their lifetimes." },
            { takeaway: "Redis GEO for the hot path", detail: "Sub-ms radius queries beat every database. Treat it as a cache; persist the truth in Cassandra or DynamoDB." },
            { takeaway: "Shard by geohash prefix", detail: "Cities cluster naturally. Cross-cell drivers write to both during transitions to avoid match misses at boundaries." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-rideshare" id="deep" title="Part 3 · Deep dives" xp={30}>
        <h3>The matching algorithm</h3>
        <p>
          A radius query gives you a candidate set. You don&apos;t want the closest driver — you want the <em>best</em>{" "}driver. Score
          candidates on: ETA to pickup (not straight-line distance, real driving time), driver rating, time online without a fare
          (fairness), and a small randomization tiebreaker. Ship the offer to one driver at a time with a 15-second TTL. If they
          decline or don&apos;t respond, fall through to the next.
        </p>
        <CodeBlock lang="java" caption="MatchingService.java — Redis GEO query + scorer">{`@Service
public class MatchingService {
    private final RedisTemplate<String, String> redis;
    private final RoutingClient routing;
    private final OfferGateway offers;

    public Optional<DriverMatch> findDriver(RideRequest req) {
        String shard = GeoShard.of(req.pickupLat(), req.pickupLng());
        Circle area = new Circle(
            new Point(req.pickupLng(), req.pickupLat()),
            new Distance(1.0, RedisGeoCommands.DistanceUnit.KILOMETERS));

        var raw = redis.opsForGeo()
            .radius("drivers:" + shard, area,
                RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                    .includeDistance().includeCoordinates().limit(50));

        if (raw == null || raw.getContent().isEmpty()) {
            // expand to 5km; if still empty, mark NO_DRIVERS
            return Optional.empty();
        }

        // Score: lower is better. ETA dominates, rating breaks ties.
        return raw.getContent().stream()
            .map(r -> {
                String driverId = r.getContent().getName();
                double etaSec = routing.eta(
                    r.getContent().getPoint(),
                    new Point(req.pickupLng(), req.pickupLat()));
                double rating = driverRating(driverId);
                double score = etaSec - (rating - 4.5) * 30; // a 5.0 saves 15s
                return new ScoredDriver(driverId, etaSec, score);
            })
            .sorted(Comparator.comparingDouble(ScoredDriver::score))
            .findFirst()
            .map(d -> dispatch(req, d));
    }

    private DriverMatch dispatch(RideRequest req, ScoredDriver d) {
        String offerId = UUID.randomUUID().toString();
        offers.send(d.driverId(), new Offer(offerId, req, Duration.ofSeconds(15)));
        // Returns when driver accepts, declines, or TTL fires.
        return offers.awaitResponse(offerId, Duration.ofSeconds(16))
            .orElseThrow(OfferTimeout::new);
    }
}`}</CodeBlock>
        <Callout variant="warn" title="Don't broadcast offers">
          The temptation is to fan out one request to ten drivers and take the first acceptance. Riders get matched fast; drivers
          get spammed and learn to ignore offers. Sequential dispatch with a tight TTL preserves the marketplace. This is a
          product decision baked into the architecture.
        </Callout>

        <h3>The trip state machine</h3>
        <Mermaid chart={stateMachineChart} />
        <p>
          Every transition is a single-row write to the trip store plus an event to Kafka. Make the row write idempotent on
          (trip_id, target_state) — a retry of &quot;mark MATCHED&quot; should not advance to the next state, just no-op. The event
          stream is what powers analytics, surge pricing inputs, and replay during incidents.
        </p>

        <h3>Surge pricing</h3>
        <p>
          Compute supply/demand per geohash cell on a rolling 60-second window: requests vs. online drivers. Multiplier is a clamped
          function of the ratio (1.0x to 5.0x). Apply at quote time and lock it for the trip — never resurge a rider mid-acceptance.
          The hard part isn&apos;t the math; it&apos;s the <strong>signal</strong>: bot detection, neutralizing brief spikes, smoothing
          across cells so a one-block move doesn&apos;t change your fare.
        </p>

        <h3>Location ingestion at scale</h3>
        <p>
          Drivers POST to the Location Service over HTTP/2 or QUIC (one connection, lots of small writes). The service writes to
          Redis GEO synchronously and to a Kafka topic asynchronously. The Kafka topic feeds the durable store (Cassandra,
          partitioned by driver_id) and any analytics consumers. If Redis is down, you fail open — accept the write to Kafka, log
          a metric, page someone. Drivers don&apos;t care about your cache; they care that their app didn&apos;t freeze.
        </p>

        <PartRecap
          title="Part 3 recap"
          gist="Match by score, not raw distance. Sequential offers, not broadcast. Every state transition is idempotent and emits an event."
          points={[
            { takeaway: "ETA beats distance", detail: "A bridge or one-way street can make the closest driver the worst one. Use the routing service." },
            { takeaway: "Lock the surge multiplier at quote time", detail: "Riders accept a number, not a function. Recomputing during acceptance is a refund waiting to happen." },
            { takeaway: "Idempotent transitions", detail: "Make state writes conditional on current state. Retries become no-ops, not corruption." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="design-rideshare" id="advanced" title="Part 4 · Advanced concerns" xp={20}>
        <h3>What happens when the driver app loses connectivity mid-trip?</h3>
        <p>
          Buffer location pings on-device. When the connection comes back, replay them with their original timestamps. The trip
          service reconciles: if the driver&apos;s last known position plus elapsed time matches the dropoff, mark COMPLETED. If
          it&apos;s ambiguous, fall back to the rider&apos;s &quot;I&apos;m out&quot; tap or a manual ops review. Don&apos;t auto-cancel
          a trip on a 90-second outage — that&apos;s 30% of trips in dense urban areas.
        </p>

        <h3>Multi-region failover</h3>
        <p>
          Active-active per region with no cross-region writes on the hot path. A driver in Berlin lives entirely in the EU region:
          location pings, ride requests, trips, payments. The only cross-region traffic is the global rider profile (eventually
          consistent) and dispute/audit data (offline batch). Region failure: drain new traffic to the next nearest region; existing
          trips finish out on whatever local state survives.
        </p>

        <h3>Anti-fraud</h3>
        <ul>
          <li>GPS spoofing: server-side sanity check on velocity (no driver moves at 200 km/h in a city).</li>
          <li>Driver-rider collusion (fake trips for incentives): graph-based detection on repeated pairings.</li>
          <li>Stolen accounts: device fingerprinting, friction (re-auth) on out-of-pattern logins.</li>
        </ul>

        <h3>What I&apos;d skip in a 45-minute interview</h3>
        <p>
          The map UI on the rider side, the actual routing service internals, real-time pool matching, and the rating system. If
          asked, name them and move on — they&apos;re lower-leverage than getting the geo index, dispatch, and state machine right.
        </p>

        <Quiz
          question="A driver's phone goes offline 90 seconds before pickup. What's the right behavior?"
          options={[
            { label: "Auto-cancel the trip and rematch immediately", correct: false, explanation: "90s offline is normal — tunnels, parking garages, weak coverage. Auto-cancel destroys completion rate." },
            { label: "Hold the trip in current state, surface a 'trying to reach driver' banner, and rematch only after a 3-5 minute timeout with no resumed pings", correct: true, explanation: "Riders tolerate a banner; they don't tolerate cancellations. Buffered pings often replay seconds later and the trip resumes cleanly." },
            { label: "Charge a no-show fee to the rider after 60 seconds", correct: false, explanation: "Punishing the rider for the driver's connectivity is exactly the kind of policy that lands in the press." },
            { label: "Switch the trip to a different driver in the background and let the original driver discover it on reconnect", correct: false, explanation: "Two drivers arriving at one pickup is worse than a delay. State must remain authoritative." },
          ]}
        />

        <PartRecap
          title="Closing posture"
          gist="In an interview: spend most of your time on the geo index, the matching loop, and the state machine. Everything else can be named and deferred."
          points={[
            { takeaway: "Lead with the firehose", detail: "Whoever interviews you has seen 100 candidates draw boxes. Show you understand the write rate before drawing anything." },
            { takeaway: "Earn the Redis call", detail: "Justify why you're putting the index in Redis, not Postgres. The answer is throughput, and saying it out loud signals seniority." },
            { takeaway: "Care about the marketplace", detail: "Sequential offers, locked surge, lenient connectivity handling. These are product decisions encoded in the system." },
          ]}
        />
      </Checkpoint>

      <section className="my-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2>Next up</h2>
        <p>
          Module 40 — <Link href="/courses/system-design/modules/design-payments" className="text-cyan-600 hover:underline">Design a payments system</Link>.
          The trip ends with COMPLETED; payments turn that into PAID. We&apos;ll build a double-entry ledger, idempotency keys, and a webhook
          handler that survives Stripe retrying you eight times.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="design-rideshare" />
    </article>
  );
}
