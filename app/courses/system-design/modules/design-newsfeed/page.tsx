import Link from "next/link";
import { getModuleBySlug } from "@/lib/courses/system-design";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import PartRecap from "@/components/PartRecap";
import CodeBlock from "@/components/CodeBlock";
import Mermaid from "@/components/Mermaid";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import ClassifyChallenge from "@/components/ClassifyChallenge";

const CHECKPOINTS = [
  { id: "requirements-and-estimation", title: "Clarify and estimate" },
  { id: "api-and-design", title: "API, data, high-level design" },
  { id: "fanout-deep-dive", title: "Fanout deep-dive" },
  { id: "wrap", title: "Wrap and what I'd revisit" },
];

const fanoutDiagram = `
sequenceDiagram
  participant U as User (poster)
  participant API as Feed Service
  participant Q as Fanout Queue
  participant W as Fanout Worker
  participant TC as Timeline Cache (Redis ZSET)
  participant DB as Posts DB
  participant V as Viewer

  U->>API: POST /post
  API->>DB: INSERT post
  API->>Q: enqueue {post_id, author_id}
  API-->>U: 201 Created

  W->>Q: dequeue
  W->>DB: SELECT followers WHERE author_id = X
  loop for each follower (non-celebrity)
    W->>TC: ZADD timeline:{follower_id} score=ts post_id
  end
  Note over W,TC: Celebrity authors skip fanout-on-write;<br/>their posts get pulled at read time

  V->>API: GET /feed
  API->>TC: ZREVRANGE timeline:{V} 0 50
  API->>DB: hydrate post_ids
  API->>DB: pull recent posts from celebrity authors V follows
  API-->>V: merged, sorted feed
`;

export default function Page() {
  const mod = getModuleBySlug("design-newsfeed")!;

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

      <ModuleProgress moduleSlug={mod.slug} checkpoints={CHECKPOINTS} />

      <section className="my-10 p-6 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/40 dark:to-pink-950/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider font-bold text-fuchsia-700 dark:text-fuchsia-300">The opener</span>
        </div>
        <p className="text-base leading-relaxed m-0">
          The interviewer says: <em>&quot;Design a news feed. Like Instagram or Facebook home.&quot;</em> The whole problem is one sentence: <strong>given a user, return the most recent posts from the people they follow, ranked, in &lt;200ms.</strong> The hard part is the asymmetry — most users have a few hundred followers, but a celebrity has 50 million, and the strategy that works for the average user breaks for the celebrity. The senior signal is recognizing that no single fanout strategy works for both, and proposing a <strong>hybrid</strong>.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-0">
          We&apos;ll use the framework: clarify, estimate, API + data, high-level, deep-dive on the fanout choice. The fanout decision IS the interview here — get it right and the rest follows.
        </p>
      </section>

      <Checkpoint moduleSlug={mod.slug} id="requirements-and-estimation" title="Part 1 · Clarify and estimate" xp={10}>
        <h2>Scope the &quot;news feed&quot;</h2>
        <p>
          Feed surfaces are wildly different across products. I&apos;ll lock the scope:
        </p>
        <ul>
          <li><strong>Post.</strong> User creates a post (text + optional image URL). Persisted with author + timestamp.</li>
          <li><strong>Follow / Unfollow.</strong> User follows other users; following is the input to the feed query.</li>
          <li><strong>Home feed.</strong> User opens the app, gets ~50 most recent posts from people they follow, in reverse-chronological order.</li>
        </ul>
        <p>
          Out of scope: ranking by ML, ads, comments/likes, stories, search, push notifications. I&apos;ll mention ranking at wrap because in real products the feed is ranked, not chronological — but the architecture for chronological is the foundation.
        </p>

        <h3>Non-functional requirements</h3>
        <ul>
          <li><strong>Read-heavy.</strong> Users scroll the feed many times for every post they create. ~100:1 reads to writes is reasonable.</li>
          <li><strong>Latency budget on read: &lt;200ms p99.</strong> Below ~300ms feels &quot;instant&quot;; above feels broken.</li>
          <li><strong>Eventual consistency on the feed is fine.</strong> A 5-10 second delay before a friend&apos;s post shows up is acceptable.</li>
          <li><strong>Durability matters.</strong> Posts must survive failures even if the feed is briefly stale.</li>
        </ul>

        <Callout variant="info" title="Questions I'd ask the interviewer">
          <ul className="m-0">
            <li>Strict reverse-chrono, or ranked? (I&apos;ll assume chrono and mention ranking at wrap.)</li>
            <li>Are there celebrity-class users (millions of followers)? (Yes — this changes everything.)</li>
            <li>What&apos;s the typical follower count distribution?</li>
            <li>Should the feed include the user&apos;s own posts? (Usually yes.)</li>
          </ul>
        </Callout>

        <h2>Estimation</h2>
        <p>
          Let me anchor on Instagram-ish scale: <strong>500M DAU</strong>, average user posts ~0.5 times/day, opens the feed ~10 times/day, follows ~200 people, and median follower count is ~200. <em>But</em> there are ~10k celebrities with &gt;1M followers, and ~100 mega-celebs with &gt;50M followers.
        </p>

        <CodeBlock lang="plain" caption="Capacity estimation">{`Writes (new posts):
  500M × 0.5 / 86,400 = ~3,000 posts/sec average
                        ~10,000 posts/sec peak (3x)

Reads (feed opens):
  500M × 10 / 86,400 = ~58,000 feed loads/sec average
                       ~175,000 feed loads/sec peak

Fanout writes (if every post fans out to all followers):
  Average follower count ≈ 200
  Fanout amplification: 3,000 posts/sec × 200 followers = 600,000 timeline writes/sec average
                        ~1.8M timeline writes/sec peak

  But for a 50M-follower celebrity:
  ONE celebrity post = 50,000,000 timeline writes
  At 10 minutes to fan out, that's ~83,000 writes/sec from a SINGLE post
  Multiple celebs posting concurrently → unbounded backlog

Storage (timelines):
  500M users × 1,000 timeline entries × ~50 bytes/ref = ~25 TB across all timelines
  Posts table: 500M × 0.5/day × 365 days × 3 yrs × ~1KB = ~270 TB (cold-tier candidates)`}</CodeBlock>

        <p>
          Two takeaways: (1) the average user&apos;s fanout is fine — 1.8M writes/sec across a sharded Redis cluster is routine. (2) <strong>The celebrity case is structurally broken under fanout-on-write.</strong> One celebrity post = 50M timeline writes; that single event can saturate a fanout queue. This is the canonical hot-key problem and it&apos;s why a hybrid is the right answer.
        </p>

        <Quiz
          question="The interviewer pushes: 'Why is the celebrity case different from the average user, beyond just being bigger?'"
          options={[
            { label: "It's not just bigger — it's structurally different. Average fanout (200 writes per post) is uniform load: spread across millions of authors, you get steady throughput. A celebrity post (50M writes) is a single hot event that produces a sudden burst in a tiny number of timeline shards (the celebrity's followers' shards). It overwhelms a fanout queue and creates write-amplification asymmetry that the average case doesn't.", correct: true, explanation: "Yes. The senior framing: not 'big' but 'asymmetric.' Bursty single events vs steady distributed load are fundamentally different problems and need different mechanisms." },
            { label: "Celebrities post more often than average users.", explanation: "The hard problem isn't post frequency — it's per-post fanout scale. A celebrity who posts once a day still produces a 50M-write event when they do." },
            { label: "Celebrity posts get more engagement so they need more compute.", explanation: "Engagement is real but separate from fanout. We're talking about the write-amplification of the fanout itself, not the read traffic afterwards." },
            { label: "Celebrities follow more people.", explanation: "Not relevant — what matters is how many follow them, not how many they follow." },
          ]}
          hint="Distribution shape, not magnitude."
          xp={8}
        />

        <Quiz
          question="At 1.8M timeline writes/sec peak (from average users alone), what's the first architectural decision the math forces?"
          options={[
            { label: "Fanout has to be async — the post-create API can't synchronously write to 200 timelines and return in <200ms. We need a queue between post-create and the timeline writers.", correct: true, explanation: "Right. The math forces the queue: synchronous fanout would multiply the post-create latency by the follower count. Async fanout decouples the user-facing path from the heavy work." },
            { label: "We need a single global Redis cluster.", explanation: "Sharding decisions come later. The first force from the math is async vs sync, which is structural." },
            { label: "We need to switch from Postgres to Cassandra.", explanation: "Store choice is a downstream decision. The structural decision the math forces is async fanout." },
            { label: "We need to cap follower counts.", explanation: "Real products don't cap follows — you'd lose the celebrity use case entirely." },
          ]}
          hint="Look at what's between the API call and the 200 followers' timelines."
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="The feed problem is shaped by one number: the follower-count distribution. Average users are uniform load; celebrities are hot events. The architecture has to handle both — that's why no single fanout strategy works, and why a hybrid is the senior answer."
          points={[
            { takeaway: "Scope: post, follow, chronological feed", detail: "Three primitives. Punt ranking, comments, search at first; mention them at wrap. Real feeds are ranked, but chronological is the architectural foundation." },
            { takeaway: "Quantify the asymmetry", detail: "Average fanout: 200 writes per post, 1.8M writes/sec total — uniform. Celebrity fanout: 50M writes per post — bursty hot event. Different mechanisms needed." },
            { takeaway: "Async fanout is forced by latency", detail: "Synchronous fanout would tie post-create latency to follower count. A queue between post-create and timeline writes is the structural fix." },
            { takeaway: "Eventual consistency on the feed is acceptable", detail: "5-10 seconds of staleness is fine. That tolerance is what lets fanout be async, lets timelines be cached, lets reads be fast." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="api-and-design" title="Part 2 · API, data, high-level design" xp={12}>
        <h2>API in code</h2>
        <p>
          Three endpoints. Show realistic Java/Spring signatures so the interviewer sees inputs, outputs, status codes.
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/feed/api/FeedController.java">{`@RestController
@RequestMapping("/api/v1")
public class FeedController {

    private final PostService posts;
    private final FollowService follows;
    private final TimelineService timelines;

    @PostMapping("/post")
    public ResponseEntity<PostDto> create(
            @RequestBody @Valid CreatePostRequest req,
            @RequestHeader("X-User-Id") String userId) {

        Post created = posts.create(userId, req.text(), req.imageUrl());

        // Async fanout — enqueue and return immediately. The fanout worker
        // populates follower timelines and is the bottleneck we'll discuss.
        timelines.enqueueFanout(created);

        return ResponseEntity.status(HttpStatus.CREATED).body(PostDto.from(created));
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<Void> follow(
            @PathVariable String targetId,
            @RequestHeader("X-User-Id") String userId) {

        follows.follow(userId, targetId);
        // On new follow, backfill the follower's timeline with the target's
        // recent posts so they don't see an empty feed for non-celebs.
        timelines.backfillNewFollow(userId, targetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feed")
    public FeedResponse feed(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String cursor) {

        // Hybrid read: timeline cache for non-celeb posts +
        // pull recent posts from celebrities the user follows
        return timelines.buildFeed(userId, limit, cursor);
    }
}

record CreatePostRequest(@NotBlank @Size(max = 5000) String text, @URL String imageUrl) {}
record FeedResponse(List<PostDto> posts, String nextCursor) {}`}</CodeBlock>

        <p>
          Three things to call out: (1) post-create returns immediately after enqueueing fanout — that&apos;s the async boundary the latency math forced. (2) on a new follow we backfill the timeline so users don&apos;t see an empty feed; this is the kind of detail that signals you&apos;ve actually shipped feeds. (3) the feed endpoint takes a cursor for pagination, not an offset, because ZSETs don&apos;t support efficient offset paging.
        </p>

        <h2>Data model</h2>

        <CodeBlock lang="plain" caption="Storage layout">{`Posts (canonical store, e.g. Postgres or Cassandra):
  posts
    post_id        UUID         PRIMARY KEY
    author_id      VARCHAR(64)  NOT NULL
    text           TEXT
    image_url      TEXT
    created_at     TIMESTAMPTZ  NOT NULL
    INDEX (author_id, created_at DESC)   -- 'pull' path for celebs

Follow graph (separate store, often graph DB or sharded Postgres):
  follows
    follower_id    VARCHAR(64)
    followee_id    VARCHAR(64)
    created_at     TIMESTAMPTZ
    PRIMARY KEY (follower_id, followee_id)
    INDEX (followee_id)                  -- to find a user's followers

Timelines (Redis sorted sets, sharded by user_id):
  KEY:   timeline:{user_id}
  TYPE:  ZSET
  MEMBER: post_id  SCORE: created_at_ms
  Bounded to ~1,000 entries per user (LRU evict at the cache layer)

Celebrity flag (in user metadata):
  is_celebrity = (follower_count > 100,000)
  recomputed daily; manual override allowed`}</CodeBlock>

        <Callout variant="insight" title="Why Redis sorted sets are perfect here">
          <p className="m-0">
            The timeline access pattern is: insert a post with a timestamp score, get the top-N by score in reverse order, occasionally trim to the last 1k entries. That&apos;s exactly what a Redis ZSET does in O(log N). One ZADD per fanout target, one ZREVRANGE per feed read. Bounded memory per user, all operations sub-millisecond. If you find yourself reaching for a relational table to model timelines, you&apos;re paying SQL costs for a primitive Redis already gives you.
          </p>
        </Callout>

        <h2>High-level architecture</h2>

        <Mermaid chart={fanoutDiagram} />

        <p>
          The flow:
        </p>
        <ul>
          <li><strong>Write path:</strong> Post API persists to DB, enqueues a fanout job, returns immediately.</li>
          <li><strong>Fanout worker:</strong> dequeues a job, looks up the author&apos;s followers, ZADDs the post into each follower&apos;s timeline ZSET. <strong>Skips celebrity authors</strong> — their followers will pull at read time.</li>
          <li><strong>Read path:</strong> Feed API ZREVRANGEs the user&apos;s timeline (precomputed for non-celeb authors) AND pulls recent posts from each celebrity the user follows. Merge, sort, return.</li>
        </ul>

        <Quiz
          question="Why backfill a new follower's timeline when they hit the follow button?"
          options={[
            { label: "Otherwise their feed shows nothing for the followed user until that user posts again. Backfilling pulls the followed user's last N posts and ZADDs them so the new follower's feed is immediately useful.", correct: true, explanation: "Right. UX is the reason — but the architectural cost is one extra small batch of writes at follow time, paid once. Naming this detail signals product-aware design." },
            { label: "It's required for consistency.", explanation: "It's not a consistency issue — without backfill the system is consistent but the feed appears empty for the newly-followed user until they post." },
            { label: "It avoids the celebrity problem.", explanation: "Backfill applies to everyone equally; it doesn't address the celebrity problem (which is fanout-on-write at post time)." },
            { label: "It's a denormalization required by the schema.", explanation: "The schema works without backfill. Backfill is a UX choice, not a schema requirement." },
          ]}
          hint="What does the user see if you don't backfill?"
          xp={6}
        />

        <Quiz
          question="Why use cursor-based pagination instead of offset on the feed endpoint?"
          options={[
            { label: "ZSETs support O(log N) range queries by score, so cursor = (timestamp, post_id) lets us page efficiently. Offset paging would require skipping N entries on each page, which is O(N+K) per call and gets slower as you scroll. Cursors are also stable across new posts inserted at the head.", correct: true, explanation: "Yes. Both the data structure and the consistency-under-inserts arguments matter. Senior candidates name both." },
            { label: "Offset is deprecated in REST APIs.", explanation: "Offset is fine for some workloads (small datasets, no inserts) — it's just wrong for feeds." },
            { label: "Cursors are smaller on the wire.", explanation: "Marginal at best, and not the architectural reason." },
            { label: "Offset breaks Redis.", explanation: "Redis supports both LRANGE-style offset and ZRANGEBYSCORE cursor patterns. The reason to choose cursors is consistency under inserts and O(log N) lookup." },
          ]}
          hint="What happens to offset paging when new posts are inserted at the top while the user is scrolling?"
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Three endpoints, three storage layers (posts in a durable DB, follows in a graph-shaped store, timelines in Redis ZSETs). The async fanout queue is the structural decoupler. Celebrities skip fanout-on-write — that's the seed of the hybrid we'll dig into next."
          points={[
            { takeaway: "Async post-create — enqueue and return", detail: "Synchronous fanout would tie latency to follower count. The queue is the latency boundary that keeps post-create <200ms regardless of follower fan." },
            { takeaway: "Three stores, each chosen for its access pattern", detail: "Posts in a durable PK store; follow graph in a graph-shaped store; timelines in Redis ZSETs (O(log N) range, bounded memory)." },
            { takeaway: "Backfill on follow, cursor on read", detail: "Backfill pulls the followed user's recent posts so the new follower sees a non-empty feed. Cursor pagination keeps reads stable when new posts arrive at the head." },
            { takeaway: "Celebrity branch sketched, not solved", detail: "Diagram shows celebrities skip fanout-on-write. The how (pull at read time, merge with cached timeline) is the deep-dive ahead." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="fanout-deep-dive" title="Part 3 · Fanout deep-dive (the interview)" xp={14}>
        <h2>The three fanout strategies — name them, compare, hybridize</h2>
        <p>
          This is where the interview lives. There are exactly three approaches; you should know all three, when each is best, and why no single one wins.
        </p>

        <h3>A. Fanout-on-write (push)</h3>
        <p>
          On post, write the post_id into every follower&apos;s precomputed timeline ZSET. Read is fast — one ZREVRANGE and you&apos;re done. Write is expensive — proportional to follower count.
        </p>
        <ul>
          <li><strong>Best for:</strong> users with small follower counts (the vast majority).</li>
          <li><strong>Worst for:</strong> celebrities. 50M timeline writes per post is a single hot event that overloads queues.</li>
          <li><strong>Trade:</strong> writes pay, reads are cheap.</li>
        </ul>

        <h3>B. Fanout-on-read (pull)</h3>
        <p>
          On post, write only the post itself. On read, query each followed user&apos;s recent posts and merge by timestamp. Writes are cheap. Reads are expensive — proportional to <em>following</em> count.
        </p>
        <ul>
          <li><strong>Best for:</strong> users who follow few people, or for the celebrity branch where push doesn&apos;t scale.</li>
          <li><strong>Worst for:</strong> users who follow thousands. 1,000 SELECTs per feed load is unacceptable.</li>
          <li><strong>Trade:</strong> writes cheap, reads pay.</li>
        </ul>

        <h3>C. Hybrid (push + pull)</h3>
        <p>
          Push for non-celebrities (most posts; small fanout per post). Pull for celebrities (few authors; large follower count). On read, merge the user&apos;s precomputed timeline with the recent posts of each celebrity they follow. The pull step is bounded by &quot;how many celebrities do you follow?&quot; — usually &lt;50 — which is a small N of small SELECTs.
        </p>

        <p>
          <strong>This is the right answer.</strong> Push is wrong for celebrities; pull is wrong for normal users; hybrid does the right thing for each.
        </p>

        <Callout variant="warn" title="The threshold question — name it before they ask">
          <p className="m-0">
            What follower count makes someone &quot;celebrity&quot;? In practice ~10k-100k is where push starts hurting. I&apos;d set the threshold around 100k followers and tune it by watching fanout queue lag. If queue lag exceeds, say, 30 seconds during normal traffic, lower the threshold so more authors go pull. This is a tuneable knob and you should call it out as such — not a hardcoded constant.
          </p>
        </Callout>

        <h2>Classify these design moves into the right fanout strategy</h2>
        <p>
          Drill: each of the moves below is best handled by push, pull, or both. Sort them. This trains your reflex for the real-time tradeoffs.
        </p>

        <ClassifyChallenge
          title="Push, pull, or hybrid?"
          prompt="Each design move below is best handled by push, pull, or a hybrid combination. Sort them."
          buckets={[
            { id: "push", label: "Fanout-on-write (push)", color: "rose" },
            { id: "pull", label: "Fanout-on-read (pull)", color: "amber" },
            { id: "hybrid", label: "Hybrid (both)", color: "emerald" },
          ]}
          items={[
            { id: "celebrity-50m", label: "Celebrity author with 50M followers posts", answer: "pull", explanation: "Push would write 50M timeline entries per post — a hot event that saturates the fanout queue. Pull means the post is written once; followers fetch on read." },
            { id: "average-user-200", label: "Average user with 200 followers posts", answer: "push", explanation: "200 writes per post is uniform, cheap load. Push gives instant feed for every follower with sub-millisecond reads." },
            { id: "celeb-and-normals", label: "User who follows 100 normal accounts and 5 celebrities reads their feed", answer: "hybrid", explanation: "Their precomputed timeline has the 100 normals' posts; on read we additionally pull recent posts from the 5 celebs and merge. That's the hybrid read path." },
            { id: "new-follow-backfill", label: "User just followed a new account; backfill their feed", answer: "push", explanation: "Backfill is a one-time push of the followed user's recent posts into the new follower's timeline. Pure push at follow time." },
            { id: "low-follow-account", label: "User with only 20 follows ever; reads their feed", answer: "pull", explanation: "20 SELECTs is cheap, and avoids paying for storing a precomputed timeline they barely use. Some products pull-only for low-engagement users to save memory." },
            { id: "viral-post-by-normal", label: "Average user's post unexpectedly goes viral and is shared widely", answer: "push", explanation: "Followers of the original author still get the post via push. Resharing/quoting is a separate fanout event for the resharer's followers — also push (assuming the resharer isn't a celeb)." },
          ]}
        />

        <h2>The fanout worker in code</h2>
        <p>
          Here&apos;s the worker that consumes from the fanout queue. Note the celebrity short-circuit and the chunked writes.
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/feed/fanout/FanoutWorker.java">{`@Component
public class FanoutWorker {

    private final FollowRepository follows;
    private final TimelineRepository timelines;
    private final UserMetadata users;

    private static final int CHUNK_SIZE = 1000;
    private static final long CELEBRITY_THRESHOLD = 100_000L;

    @KafkaListener(topics = "fanout-jobs", groupId = "fanout-workers")
    public void handle(FanoutJob job) {
        long followerCount = users.followerCount(job.authorId());

        // Celebrity short-circuit: don't push, let readers pull.
        if (followerCount > CELEBRITY_THRESHOLD) {
            return;
        }

        // Stream followers in chunks to bound memory and let us pipeline writes.
        try (Stream<String> followers = follows.streamFollowers(job.authorId())) {
            Iterators.partition(followers.iterator(), CHUNK_SIZE)
                .forEachRemaining(chunk ->
                    timelines.zaddBatch(chunk, job.postId(), job.createdAt()));
        }
    }
}`}</CodeBlock>

        <p>
          Three things to point at: (1) the celebrity check is the first gate — non-celeb authors get fanned out, celebs return early. (2) followers are streamed and chunked so a 50k-follower author doesn&apos;t pull all 50k IDs into memory before writing. (3) writes go in batches via Redis pipelining (the <code>zaddBatch</code> implementation), so we issue ~50k commands per network round-trip instead of 1 per round-trip.
        </p>

        <h2>Building the hybrid feed</h2>

        <CodeBlock lang="java" caption="src/main/java/com/feed/timeline/TimelineService.java">{`@Service
public class TimelineService {

    public FeedResponse buildFeed(String userId, int limit, String cursor) {
        // 1. Read precomputed timeline (push side) — non-celeb posts
        List<TimelineEntry> precomputed =
            timelineRedis.range("timeline:" + userId, cursor, limit);

        // 2. Pull side — fetch recent posts from each celebrity the user follows
        List<String> celebsFollowed = follows.celebsFollowedBy(userId);
        List<TimelineEntry> pulled = celebsFollowed.parallelStream()
            .flatMap(celebId -> posts.recentByAuthor(celebId, limit).stream())
            .toList();

        // 3. Merge by score, dedupe, take top N
        return mergeSorted(precomputed, pulled, limit);
    }
}`}</CodeBlock>

        <Quiz
          question="Why parallelStream() on the celebrity pull?"
          options={[
            { label: "Each celebrity post lookup is an independent IO call to the posts DB. Doing them sequentially would add up to N × per-call latency. Parallelizing across the small N (typically <50 celebs followed) keeps the pull-side latency to roughly one round-trip plus merge time.", correct: true, explanation: "Right. Parallel I/O is the move when each call is independent and bounded. You'd want a thread pool or a non-blocking client in production; parallelStream is fine sketch-level." },
            { label: "Java parallelStream is faster than serial stream for any workload.", explanation: "Not true — for CPU-bound or small workloads parallelStream often hurts. The reason here is independent I/O." },
            { label: "Parallelism prevents head-of-line blocking on the cache.", explanation: "There's no shared cache contention here that parallelism would resolve; the reason is independent I/O latency." },
            { label: "It's required by the parallelStream's reduction semantics.", explanation: "There's no semantic requirement; serial would produce the same result, just slower." },
          ]}
          hint="What's the cost model when N independent IO calls run sequentially vs in parallel?"
          xp={7}
        />

        <Quiz
          question="A user complains: 'I followed a celebrity 30 minutes ago and they posted 5 minutes ago, but I don't see the post.' What's the most likely cause?"
          options={[
            { label: "Celebrities skip fanout-on-write, so their posts only show via the read-time pull. If the user's pull-side query isn't including this celebrity, the bug is in the celebrity-followed lookup or in the user's celebrity-set caching. Confirm: does the user's followed-celebrities cache include the new follow?", correct: true, explanation: "Yes. The first thing to check is whether the read path knows the user follows this celebrity. The follow happened, but the cached celebrity-set might be stale, so the pull query never reaches that celeb's recent posts." },
            { label: "Fanout queue is backed up.", explanation: "Doesn't apply — celebrity posts skip the fanout queue entirely. If the bug were a backed-up queue, only non-celebs would be missing." },
            { label: "Redis ZSET evicted the post.", explanation: "Posts from celebs aren't in the user's ZSET — they're never written there. ZSET eviction can't be the cause for celebrity posts." },
            { label: "The celebrity's post hasn't been persisted yet.", explanation: "You said the post was 5 minutes ago — well past the persistence write. The post exists; the read path isn't finding it." },
          ]}
          hint="Trace the read path for a celebrity post and ask which step is failing."
          xp={8}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Hybrid fanout — push for non-celebs, pull for celebs — is the right answer because the average and the extreme have structurally different load shapes. The threshold is a tuneable knob, not a constant."
          points={[
            { takeaway: "Push optimizes read latency at the cost of write amplification", detail: "Best for the bulk of users where follower count is small. Reads = one ZREVRANGE, sub-millisecond." },
            { takeaway: "Pull optimizes write cost at the cost of read fanout", detail: "Best for celebrity authors where push is structurally broken. Reads pay N small SELECTs proportional to follows." },
            { takeaway: "Hybrid combines both with a follower-count threshold", detail: "Threshold (~100k) is tuneable based on fanout queue lag. Read path merges precomputed timeline with parallel celebrity pulls." },
            { takeaway: "Celebrity bug surface is the read-time pull", detail: "Forgot a celeb? Stale celeb-set cache? Their posts vanish for followers. Fanout queue depth doesn't tell you about celebrity issues." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="wrap" title="Part 4 · Wrap and what I'd revisit" xp={6}>
        <h2>What I&apos;d revisit if I had more time</h2>
        <ul>
          <li><strong>Ranking.</strong> Real feeds aren&apos;t chronological — they&apos;re ranked by predicted engagement. The architecture above stays the same; we add a ranking service that scores candidate posts (the merged set from push + pull) and reorders. The ranking step is a pure function of (user_id, posts) and lives between the merge and the response.</li>
          <li><strong>Multi-region.</strong> Posts table replicates cross-region with conflict resolution (last-write-wins on post_id is fine because post_ids are immutable). Timelines are per-region — a user&apos;s feed is computed in their home region against the local replica of the posts table.</li>
          <li><strong>Backpressure on the fanout queue.</strong> If queue lag exceeds threshold, we should either drop the celebrity threshold dynamically (more authors go pull, less push load) or shed non-critical fanout (e.g. for inactive followers). Naming this as a control mechanism is a senior signal.</li>
          <li><strong>Inactive user GC.</strong> Storing precomputed timelines for users who haven&apos;t opened the app in 6 months is wasted memory. Periodically evict inactive timelines and lazily rebuild on next login (which is a one-time pull).</li>
        </ul>

        <h3>Failure modes I&apos;m worried about</h3>
        <ul>
          <li><strong>Fanout queue backlog:</strong> a celebrity threshold misconfiguration could send a 50M-follower post through push, saturating the queue and delaying everyone else&apos;s posts. Mitigation: hard cap on per-job fanout size with auto-fallback to pull.</li>
          <li><strong>Redis cluster failure:</strong> wipes precomputed timelines. Read path can fall back to pull-only mode (slower but functional) while timelines rebuild from posts table.</li>
          <li><strong>Posts DB shard hot-spotting:</strong> a viral celebrity&apos;s shard takes all the pull traffic. Add a CDN-cached layer for celebrity posts (they&apos;re public, recent, and re-read by millions).</li>
        </ul>

        <h3>What I&apos;d monitor</h3>
        <ul>
          <li>Feed-load p99 latency (SLO: &lt;200ms)</li>
          <li>Fanout queue lag (alert &gt;30s)</li>
          <li>Push:pull ratio (track celebrity threshold tuning)</li>
          <li>Cache hit rate on timelines (SLO: &gt;95%)</li>
          <li>Read amplification (avg posts pulled per feed-load)</li>
        </ul>

        <Callout variant="spring" title="The senior 'I would also' moves for feed">
          <em>&quot;I&apos;d use Redis ZSETs for timelines; I would also consider a custom in-memory store for the very hottest celebrity working set, but at our scale the ZSET overhead is fine.&quot;</em> Or: <em>&quot;I&apos;d run fanout via Kafka; I would also consider Pulsar for the larger-message use case if posts grow to multi-MB media-rich, but Kafka is fine for the lightweight {`{post_id, author_id}`} job we&apos;re fanning out.&quot;</em> Three of these and the interviewer knows you&apos;ve thought past the first answer.
        </Callout>

        <p>
          That&apos;s the news feed. The hybrid fanout pattern shows up in feeds, notifications, activity streams, and any system where one event needs to reach many subscribers. Module 31 (Twitter) extends this with timelines + search + trending and lets you practice the same framework on a more crowded surface.
        </p>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <p className="text-sm uppercase tracking-wider font-bold text-cyan-700 dark:text-cyan-300 mb-2">Up next</p>
        <p className="m-0 text-base">
          Module 31: Design Twitter. Newsfeed + timelines + search + trending — a busier surface area, but the framework you just used on news feed handles all of it.
        </p>
      </section>
    </article>
  );
}
