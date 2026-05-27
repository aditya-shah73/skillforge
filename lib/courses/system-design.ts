// System Design — course definition.
// Layered system design for Java engineers: fundamentals → patterns → real designs.

import type { Module } from "./ai";

export const COURSE_META = {
  id: "system-design" as const,
  slug: "system-design",
  name: "System Design",
  shortName: "System Design",
  tagline: "Distributed systems, layered — fundamentals → patterns → real designs",
  description:
    "Layered system design end-to-end: CAP, consistency, scaling math, storage and communication patterns, reliability, then real designs like TinyURL, Twitter, and rideshare. Java/Spring-flavored where it matters; concept-first everywhere else.",
  icon: "🏗️",
  color: "from-cyan-500 to-blue-500",
  accent: "cyan",
  status: "available" as const,
  language: "Java / Spring",
};

export const PHASES = [
  { number: 0, name: "Orientation", color: "from-slate-500 to-slate-400" },
  { number: 1, name: "Foundations", color: "from-rose-500 to-orange-500" },
  { number: 2, name: "Storage Layer", color: "from-amber-500 to-yellow-500" },
  { number: 3, name: "Communication", color: "from-emerald-500 to-green-500" },
  { number: 4, name: "Reliability & Operations", color: "from-sky-500 to-blue-500" },
  { number: 5, name: "Distributed Systems Deep", color: "from-indigo-500 to-purple-500" },
  { number: 6, name: "Case Studies", color: "from-fuchsia-500 to-pink-500" },
  { number: 7, name: "Production & Capstone", color: "from-pink-500 to-rose-500" },
  { number: 8, name: "Frontend System Design", color: "from-teal-500 to-cyan-500" },
];

export const MODULES: Module[] = [
  // Phase 0 · Orientation
  { slug: "welcome", number: 0, phase: "Orientation", phaseNumber: 0, title: "Welcome — how this course works", subtitle: "Layered system design, interview vs production, and how to use this course", duration: "~5 min", project: "No project — just read", status: "available" },

  // Phase 1 · Foundations
  { slug: "back-of-envelope", number: 1, phase: "Foundations", phaseNumber: 1, title: "Back-of-envelope estimation", subtitle: "Latency numbers every engineer should know, QPS math, capacity sizing", duration: "~1.5–2h", project: "Worked example: estimate read/write QPS and storage for a Twitter-scale feed", status: "available" },
  { slug: "scaling-ladder", number: 2, phase: "Foundations", phaseNumber: 1, title: "The scaling ladder", subtitle: "Vertical → horizontal → stateless → cache → shard → async; when each step is right", duration: "~1.5–2h", project: "Design exercise: walk a monolith up the ladder, justifying every step", status: "available" },
  { slug: "cap-pacelc", number: 3, phase: "Foundations", phaseNumber: 1, title: "CAP and PACELC", subtitle: "The real tradeoffs (not the cartoon), and what AP/CP mean in practice", duration: "~1.5–2h", project: "Worked example: classify 5 real datastores (Cassandra, DynamoDB, Spanner, Postgres, Redis) on the CAP/PACELC grid", status: "available" },
  { slug: "consistency-models", number: 4, phase: "Foundations", phaseNumber: 1, title: "Consistency models", subtitle: "Strong, eventual, causal, read-your-writes, monotonic — with concrete bug examples", duration: "~2–2.5h", project: "Worked example: trace 4 anomalies (lost update, stale read, write skew, phantom) and pick the consistency model that prevents each", status: "available" },
  { slug: "phase-1-revision", number: 5, phase: "Foundations", phaseNumber: 1, title: "Phase 1 revision notes", subtitle: "Estimation numbers, scaling ladder, CAP/PACELC, consistency models — every foundation compressed to a reference card", duration: "~15 min", project: "No project — pure revision", status: "available" },

  // Phase 2 · Storage Layer
  { slug: "sql-vs-nosql", number: 6, phase: "Storage Layer", phaseNumber: 2, title: "SQL vs NoSQL", subtitle: "When each wins; OLTP vs OLAP; document/wide-column/graph/KV decision tree", duration: "~2–2.5h", project: "Design exercise: pick the right datastore for 6 workloads and defend the choice", status: "available" },
  { slug: "indexing-deep", number: 7, phase: "Storage Layer", phaseNumber: 2, title: "Indexing deep dive", subtitle: "B-tree vs LSM, covering indexes, when indexes hurt writes", duration: "~2–2.5h", project: "Java/Spring lab: profile a Postgres query with EXPLAIN, add the right index, measure", status: "available" },
  { slug: "partitioning-sharding", number: 8, phase: "Storage Layer", phaseNumber: 2, title: "Partitioning & sharding", subtitle: "Hash, range, directory; consistent hashing; the resharding problem", duration: "~2–2.5h", project: "Java lab: implement a consistent-hash ring with virtual nodes + rebalancing", status: "available" },
  { slug: "replication", number: 9, phase: "Storage Layer", phaseNumber: 2, title: "Replication strategies", subtitle: "Leader-follower, multi-leader, leaderless, quorums, replication lag", duration: "~2–2.5h", project: "Worked example: trace a write through async vs sync replication and explain the failure modes", status: "available" },
  { slug: "caching-patterns", number: 10, phase: "Storage Layer", phaseNumber: 2, title: "Caching patterns", subtitle: "Cache-aside, write-through, write-back, refresh-ahead; TTL & invalidation", duration: "~2–2.5h", project: "Java/Spring lab: implement cache-aside with Caffeine + benchmark hit rate vs latency", status: "available" },
  { slug: "distributed-cache-deep", number: 11, phase: "Storage Layer", phaseNumber: 2, title: "Distributed cache deep dive", subtitle: "Redis patterns in Java, hot keys, thundering herd, cluster vs sentinel", duration: "~2–2.5h", project: "Java/Spring lab: Redis-backed cache with single-flight + jittered TTL to kill thundering herd", status: "available" },
  { slug: "search-systems", number: 12, phase: "Storage Layer", phaseNumber: 2, title: "Search systems", subtitle: "Elasticsearch/OpenSearch fundamentals, inverted index, when to bolt search onto your DB", duration: "~2–2.5h", project: "Design exercise: add full-text search to a product catalog — DB extension vs sidecar Elasticsearch", status: "available" },
  { slug: "phase-2-revision", number: 13, phase: "Storage Layer", phaseNumber: 2, title: "Phase 2 revision notes", subtitle: "SQL vs NoSQL, indexing, partitioning, replication, caching, search — the storage decision toolkit on one card", duration: "~20 min", project: "No project — pure revision", status: "available" },

  // Phase 3 · Communication
  { slug: "api-design", number: 14, phase: "Communication", phaseNumber: 3, title: "API design done right", subtitle: "REST, versioning, pagination, idempotency keys, error contracts; gRPC vs REST", duration: "~2–2.5h", project: "Design exercise: design a payments API with versioning, pagination, and idempotency — REST first, then gRPC tradeoffs", status: "available" },
  { slug: "spring-cloud-gateway", number: 15, phase: "Communication", phaseNumber: 3, title: "Spring Cloud Gateway", subtitle: "Routing, filters, edge rate-limit, auth offload — actual gateway in Java", duration: "~2–2.5h", project: "Java/Spring lab: build a Spring Cloud Gateway with auth filter, rate-limit filter, and route-level retries", status: "available" },
  { slug: "message-queues", number: 16, phase: "Communication", phaseNumber: 3, title: "Message queues", subtitle: "At-least-once vs exactly-once, ordering, DLQs; SQS/RabbitMQ/Kafka decision matrix", duration: "~2–2.5h", project: "Design exercise: pick the right broker for 5 workloads (order processing, fanout, log aggregation, RPC, work queue)", status: "available" },
  { slug: "kafka-deep", number: 17, phase: "Communication", phaseNumber: 3, title: "Kafka deep dive", subtitle: "Partitions, consumer groups, offsets, exactly-once with Spring Kafka", duration: "~2.5–3h", project: "Java/Spring lab: Spring Kafka producer + consumer group with manual offset commit and DLQ", status: "available" },
  { slug: "event-driven-cqrs", number: 18, phase: "Communication", phaseNumber: 3, title: "Event-driven & CQRS", subtitle: "Pub-sub, event sourcing, CQRS — when these help and when they're overkill", duration: "~2–2.5h", project: "Design exercise: redesign an order service with CQRS + event sourcing, then justify why (or why not)", status: "available" },
  { slug: "phase-3-revision", number: 19, phase: "Communication", phaseNumber: 3, title: "Phase 3 revision notes", subtitle: "API design, gateway, queues, Kafka, event-driven/CQRS — every communication pattern on one card", duration: "~20 min", project: "No project — pure revision", status: "available" },

  // Phase 4 · Reliability & Operations
  { slug: "load-balancing", number: 20, phase: "Reliability & Operations", phaseNumber: 4, title: "Load balancing", subtitle: "L4 vs L7, algorithms (RR/least-conn/EWMA), sticky sessions, health checks", duration: "~1.5–2h", project: "Worked example: trace a request through L4 + L7 LBs with health-check failure scenarios", status: "available" },
  { slug: "rate-limiting", number: 21, phase: "Reliability & Operations", phaseNumber: 4, title: "Rate limiting", subtitle: "Token bucket, leaky bucket, sliding window; distributed rate limiting with Redis", duration: "~2–2.5h", project: "Java/Spring lab: implement token-bucket rate limiter backed by Redis (atomic Lua script)", status: "available" },
  { slug: "resilience4j-deep", number: 22, phase: "Reliability & Operations", phaseNumber: 4, title: "Resilience4j deep dive", subtitle: "Circuit breakers, retries with jitter, bulkheads, timeouts in Spring", duration: "~2–2.5h", project: "Java/Spring lab: wire Resilience4j circuit breaker + retry + bulkhead around a flaky downstream", status: "available" },
  { slug: "idempotency", number: 23, phase: "Reliability & Operations", phaseNumber: 4, title: "Idempotency", subtitle: "Idempotency keys, dedup tables, retry safety, the at-least-once reality", duration: "~1.5–2h", project: "Java/Spring lab: idempotency-key middleware with dedup table for a payment endpoint", status: "available" },
  { slug: "observability", number: 24, phase: "Reliability & Operations", phaseNumber: 4, title: "Observability", subtitle: "Metrics/logs/traces, OpenTelemetry in Spring, RED/USE methods, alerting that doesn't suck", duration: "~2–2.5h", project: "Java/Spring lab: instrument a service with OpenTelemetry — traces, RED metrics, structured logs", status: "available" },
  { slug: "on-call-incident", number: 25, phase: "Reliability & Operations", phaseNumber: 4, title: "On-call & incident response", subtitle: "Postmortems, runbooks, error budgets — the human side of reliability", duration: "~1–1.5h", project: "Worked example: write a blameless postmortem for a fictional 3-hour outage", status: "available" },
  { slug: "phase-4-revision", number: 26, phase: "Reliability & Operations", phaseNumber: 4, title: "Phase 4 revision notes", subtitle: "LB, rate limit, Resilience4j, idempotency, observability, on-call — the reliability toolkit on one card", duration: "~20 min", project: "No project — pure revision", status: "available" },

  // Phase 5 · Distributed Systems Deep
  { slug: "consensus", number: 27, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Consensus: Raft & Paxos", subtitle: "Raft (deeper), Paxos (high level), when you actually need it, leader election", duration: "~2.5–3h", project: "Worked example: trace a Raft leader election + log replication step-by-step on paper", status: "available" },
  { slug: "distributed-transactions", number: 28, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Distributed transactions & sagas", subtitle: "2PC and why it's avoided, sagas (orchestration vs choreography), outbox pattern", duration: "~2.5–3h", project: "Java/Spring lab: implement the transactional outbox pattern with a saga across two services", status: "available" },
  { slug: "clock-time", number: 29, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Clocks & time in distributed systems", subtitle: "NTP, logical/Lamport clocks, vector clocks, hybrid logical clocks", duration: "~2–2.5h", project: "Worked example: trace causality bugs that wall-clock timestamps cause and Lamport clocks fix", status: "available" },
  { slug: "geo-systems", number: 30, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Geo-distributed systems", subtitle: "Latency physics, multi-region topologies, CDNs and edge compute, multi-device sync", duration: "~2–2.5h", project: "Design exercise: write a defensible latency budget for a global user and pick the right multi-region topology", status: "available" },
  { slug: "cost-capacity", number: 31, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Cost & capacity planning", subtitle: "Production discipline: $/QPS, storage tiering, autoscaling, when to over-provision", duration: "~1.5–2h", project: "Worked example: build a $/QPS model for a service and decide whether to scale up, out, or cache", status: "available" },
  { slug: "phase-5-revision", number: 32, phase: "Distributed Systems Deep", phaseNumber: 5, title: "Phase 5 revision notes", subtitle: "Consensus, sagas, clocks, geo-indexing, cost — the deep-systems reference card", duration: "~20 min", project: "No project — pure revision", status: "available" },

  // Phase 6 · Case Studies
  { slug: "interview-framework", number: 33, phase: "Case Studies", phaseNumber: 6, title: "The system design interview framework", subtitle: "The 6-step method: clarify → estimate → API → data model → high-level → deep dive", duration: "~1.5–2h", project: "Worked example: walk a 45-minute design interview end-to-end with the 6-step framework", status: "available" },
  { slug: "design-tinyurl", number: 34, phase: "Case Studies", phaseNumber: 6, title: "Design TinyURL", subtitle: "Hashing, base62, read-heavy caching, custom aliases — the classic warm-up", duration: "~1.5–2h", project: "Design exercise: TinyURL end-to-end — API, encoding, storage, cache, custom aliases", status: "available" },
  { slug: "design-newsfeed", number: 35, phase: "Case Studies", phaseNumber: 6, title: "Design a news feed", subtitle: "Fanout-on-write vs fanout-on-read vs hybrid; the celebrity problem", duration: "~2–2.5h", project: "Design exercise: news feed — pick fanout strategy, justify with QPS math, handle the celebrity edge case", status: "available" },
  { slug: "design-twitter", number: 36, phase: "Case Studies", phaseNumber: 6, title: "Design Twitter", subtitle: "Newsfeed + search + trending timelines", duration: "~2.5–3h", project: "Design exercise: full Twitter — timeline, search, trending, with capacity estimates and component breakdown", status: "available" },
  { slug: "design-chat", number: 37, phase: "Case Studies", phaseNumber: 6, title: "Design a chat system", subtitle: "WebSockets, presence, message ordering, group chat, push notifications", duration: "~2.5–3h", project: "Design exercise: WhatsApp-scale chat — connection layer, message ordering, group fanout, offline delivery", status: "available" },
  { slug: "design-rate-limiter", number: 38, phase: "Case Studies", phaseNumber: 6, title: "Design a distributed rate limiter", subtitle: "Redis-backed token bucket at scale; the real one", duration: "~1.5–2h", project: "Design exercise: distributed rate limiter — algorithm choice, Redis topology, failure modes", status: "available" },
  { slug: "design-rideshare", number: 39, phase: "Case Studies", phaseNumber: 6, title: "Design a rideshare service", subtitle: "Geo-indexing, real-time matching, surge pricing, ETA — the hardest one", duration: "~2.5–3h", project: "Design exercise: Uber-scale rideshare — geo-indexing, dispatch, surge, ETA, payment flow", status: "available" },
  { slug: "design-payments", number: 40, phase: "Case Studies", phaseNumber: 6, title: "Design a payment system", subtitle: "Idempotency, ledger, reconciliation; the 'money is different' rules", duration: "~2.5–3h", project: "Design exercise: payment system — ledger model, idempotency, reconciliation, settlement flow", status: "available" },
  { slug: "phase-6-revision", number: 41, phase: "Case Studies", phaseNumber: 6, title: "Phase 6 revision notes", subtitle: "The 6-step framework + 7 design archetypes (TinyURL, newsfeed, Twitter, chat, rate limiter, rideshare, payments) on one card", duration: "~25 min", project: "No project — pure revision", status: "available" },

  // Phase 7 · Production & Capstone
  { slug: "migration-patterns", number: 42, phase: "Production & Capstone", phaseNumber: 7, title: "Migration patterns", subtitle: "Strangler fig, dual writes, backfills, online schema changes, blue-green vs canary", duration: "~2–2.5h", project: "Design exercise: plan a strangler-fig migration off a legacy monolith with dual writes + backfill", status: "available" },
  { slug: "security-design", number: 43, phase: "Production & Capstone", phaseNumber: 7, title: "Security at scale", subtitle: "Auth/authz, JWT vs sessions, secrets management, defense in depth", duration: "~2–2.5h", project: "Design exercise: secure a multi-tenant API — auth, authz, secrets, defense in depth", status: "available" },
  { slug: "recap", number: 44, phase: "Production & Capstone", phaseNumber: 7, title: "Course recap", subtitle: "The full mental model, decision frameworks, what to internalize", duration: "~1–1.5h", project: "No project — synthesize the decision frameworks into a personal cheat sheet", status: "available" },
  { slug: "capstone", number: 45, phase: "Production & Capstone", phaseNumber: 7, title: "Capstone: design a code review platform", subtitle: "End-to-end design — ingest, search, real-time comments, notifications, audit log", duration: "~4–5h", project: "Capstone design exercise: code review platform end-to-end — ingest, search, real-time, notifications, audit", status: "available" },

  // Phase 8 · Frontend System Design
  { slug: "frontend-fundamentals", number: 46, phase: "Frontend System Design", phaseNumber: 8, title: "Frontend system design fundamentals", subtitle: "Rendering strategies (SSR/SSG/ISR/CSR), Core Web Vitals, state management, bundle budgets", duration: "~2–2.5h", project: "Worked example: pick the rendering strategy + state architecture for 4 product surfaces and defend each choice", status: "available" },
  { slug: "frontend-design-feed", number: 47, phase: "Frontend System Design", phaseNumber: 8, title: "Design a feed UI", subtitle: "Virtualization, infinite scroll, optimistic updates, image loading — the feed archetype", duration: "~2.5–3h", project: "Design exercise: Twitter-scale feed UI — components, state shape, virtualization, optimistic likes, offline read", status: "available" },
  { slug: "frontend-design-realtime", number: 48, phase: "Frontend System Design", phaseNumber: 8, title: "Design a real-time UI", subtitle: "WebSocket vs SSE, reconnect/backoff, presence, multi-tab sync, CRDT intuition", duration: "~2.5–3h", project: "Design exercise: collaborative doc OR chat UI — connection mgmt, presence, multi-tab, offline edits", status: "available" },
  { slug: "phase-8-revision", number: 49, phase: "Frontend System Design", phaseNumber: 8, title: "Phase 8 revision notes", subtitle: "Rendering strategies, feed UI patterns, real-time UI — the frontend system-design closer on one card", duration: "~20 min", project: "No project — pure revision", status: "available" },
];

export function getModuleBySlug(slug: string): Module | undefined {
  return MODULES.find((m) => m.slug === slug);
}
