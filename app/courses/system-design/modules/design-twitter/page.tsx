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
import ModuleNav from "@/components/ModuleNav";

const CHECKPOINTS = [
  { id: "scope-and-estimation", title: "Scope and estimate" },
  { id: "api-and-design", title: "API, data, high-level design" },
  { id: "deep-dives", title: "Deep-dives" },
  { id: "wrap", title: "Wrap and what I'd revisit" },
];

const twitterDiagram = `
flowchart TB
  Client[Client] --> LB[Load Balancer / API Gateway]
  LB --> Tweet[Tweet Service]
  LB --> Timeline[Timeline Service]
  LB --> Search[Search Service]
  LB --> Trending[Trending Service]

  Tweet -->|persist| TweetsDB[(Tweets DB\\nsharded by tweet_id)]
  Tweet -->|index event| IndexQ[Index Queue]
  Tweet -->|fanout job| FanoutQ[Fanout Queue]

  FanoutQ --> FanoutW[Fanout Workers]
  FanoutW --> Graph[(Graph Service\\nfollows)]
  FanoutW --> TimelineCache[(Timeline ZSETs\\nRedis cluster)]

  IndexQ --> Indexer[Indexer]
  Indexer --> ES[(Elasticsearch)]
  Indexer --> TrendCounter[(Trending counter\\nRedis sorted set)]

  Timeline --> TimelineCache
  Timeline --> TweetsDB
  Timeline --> Graph
  Search --> ES
  Trending --> TrendCounter
`;

export default function Page() {
  const mod = getModuleBySlug("design-twitter")!;

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
          The interviewer says: <em>&quot;Design Twitter.&quot;</em> Twitter is news feed plus search plus trending plus the follower graph plus a thousand other things. The interview move here is to <strong>scope ruthlessly</strong>: pick the 4 things that matter most, do them well, mention the rest at wrap. Underneath, Twitter is the same hybrid fanout you just built — but now it has to coexist with full-text search and real-time trending, and the data flowing through the system has multiple consumers.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 mb-0">
          Same framework: clarify, estimate, API + data, high-level, deep-dive on what&apos;s hardest. The hard part this time isn&apos;t a single algorithm — it&apos;s the <strong>data pipeline shape</strong> that lets one tweet feed timelines, search, and trending without each system pulling from the others.
        </p>
      </section>

      <Checkpoint moduleSlug={mod.slug} id="scope-and-estimation" title="Part 1 · Scope and estimate" xp={10}>
        <h2>What we&apos;re building</h2>
        <p>
          Twitter is a giant product. I&apos;m going to scope tight — four core features — and explicitly punt the rest. The interviewer will redirect if I&apos;ve picked wrong, and that&apos;s fine.
        </p>
        <ul>
          <li><strong>Tweet.</strong> User posts a tweet (text, &lt;280 chars, optional media URL).</li>
          <li><strong>Home timeline.</strong> Reverse-chronological feed of tweets from people you follow (we already know how to do this).</li>
          <li><strong>Search.</strong> Find tweets matching a keyword, ranked by recency or relevance.</li>
          <li><strong>Trending.</strong> Top hashtags / phrases over the last 1-6 hours, optionally per-region.</li>
        </ul>
        <p>
          Out of scope: DMs, threads, retweets/quotes (mention them at wrap as fanout extensions), ads, live spaces, lists, notifications. Each of these is its own design problem.
        </p>

        <h3>Non-functional requirements</h3>
        <ul>
          <li><strong>Read-heavy across the board.</strong> Roughly 100:1 reads to writes for timelines and search.</li>
          <li><strong>Latency budget:</strong> &lt;200ms p99 on home timeline, &lt;300ms on search, &lt;100ms on trending.</li>
          <li><strong>Eventual consistency on timelines and trending is fine.</strong> 5-30 second staleness is acceptable.</li>
          <li><strong>Search needs near-real-time indexing</strong> — a posted tweet should be findable in &lt;30 seconds.</li>
          <li><strong>High availability on read path.</strong> If timelines break, the product is dead.</li>
        </ul>

        <Callout variant="info" title="Questions I'd ask the interviewer">
          <ul className="m-0">
            <li>Should retweets/quotes be in scope, or can I treat them as a fanout variation in the wrap?</li>
            <li>Trending: global only, or per-region/per-language?</li>
            <li>Search ranking: pure recency, or relevance-tuned?</li>
            <li>Are direct DMs in scope? (Usually no — different design.)</li>
          </ul>
        </Callout>

        <h2>Estimation</h2>
        <p>
          I&apos;ll anchor on Twitter-ish scale: <strong>200M DAU</strong>. Average user posts ~1 tweet/day, opens timeline ~20 times/day, runs ~2 searches/day. Average follower count ~150. ~10k accounts have &gt;1M followers. ~50 mega-celebs have &gt;50M.
        </p>

        <CodeBlock lang="plain" caption="Capacity estimation">{`Tweet writes:
  200M × 1 / 86,400 = ~2,300 tweets/sec average
                      ~7,000 tweets/sec peak

Home timeline reads:
  200M × 20 / 86,400 = ~46,000 timeline-reads/sec average
                       ~140,000 timeline-reads/sec peak

Search reads:
  200M × 2 / 86,400 = ~4,600 searches/sec average
                      ~14,000 searches/sec peak

Fanout (avg follower 150, hybrid push for non-celebs):
  ~70% of authors are non-celeb; their posts push to ~150 timelines each
  2,300 tweets/sec × 0.7 × 150 followers = ~240,000 timeline writes/sec average
                                           ~720,000 timeline writes/sec peak

Storage:
  Tweets: 2,300/sec × 86,400 × 365 × 5 yrs × ~1KB = ~360 TB tweet store
  Timelines: 200M users × ~1,000 entries × ~50 bytes = ~10 TB timeline cache
  Search index: similar to tweets table size, replicated 2x for HA = ~720 TB ES`}</CodeBlock>

        <p>
          The order of magnitude says: tweet writes are small (single sharded DB), timeline reads are big (cache layer required, hybrid fanout required), search needs its own index pipeline (Elasticsearch or similar), and the data scale is in the hundreds of TB. Multi-tenancy and HA are forced — you don&apos;t run this on one box.
        </p>

        <Quiz
          question="Look at the math: 720k timeline writes/sec peak, 140k timeline reads/sec peak. Which is the harder ops problem?"
          options={[
            { label: "The 720k writes/sec — but only because of the hybrid fanout amplification, not the raw 7k tweets/sec. The amplification is what forces sharded Redis and bounded ZSETs. Reads at 140k/sec are smaller and a single Redis cluster handles them comfortably.", correct: true, explanation: "Yes. The senior framing names amplification as the source of the load, not just the absolute numbers. That tells the interviewer you read what's actually expensive in your design." },
            { label: "Reads — 140k/sec is harder than 720k writes because reads have lower latency budgets.", explanation: "Reads do have tighter latency, but Redis ZREVRANGE is sub-ms. 720k writes is structurally harder." },
            { label: "They're equal because they hit the same Redis cluster.", explanation: "They hit the cluster differently — writes are scattered across 200M timelines, reads concentrate on the active users. The shapes differ even when the cluster is shared." },
            { label: "Neither — the real bottleneck is the Posts DB.", explanation: "Posts DB at 7k writes/sec is fine. The amplified fanout is the dominant cost." },
          ]}
          hint="The hard number isn't 7k tweets/sec — it's what happens to those tweets downstream."
          xp={8}
        />

        <Quiz
          question="The interviewer asks: 'Should search and timeline use the same store?' What's the right answer?"
          options={[
            { label: "No. Timelines are reverse-chronological per-user views — Redis ZSETs are perfect. Search needs full-text indexing across the entire tweet corpus — Elasticsearch (inverted indexes, scoring) is the right tool. They have different access patterns and serving them from one store either gives bad search performance or bad timeline performance.", correct: true, explanation: "Right. The senior move is to argue from access pattern → store choice, not store choice → access pattern. Two stores, one canonical tweet table, both populated from the same write event." },
            { label: "Yes — one store is simpler.", explanation: "Simplicity is good but not when it forces a poor fit on both sides. Search and timelines have fundamentally different access patterns." },
            { label: "Yes — Elasticsearch supports both.", explanation: "ES can do range queries but is overkill for per-user reverse-chrono and slower than Redis ZSETs for that pattern. Use ES for what it's good at." },
            { label: "No — Postgres for both.", explanation: "Postgres for timelines won't keep up with 720k writes/sec without heavy sharding, and Postgres full-text search underperforms ES at scale." },
          ]}
          hint="Different access patterns suggest different stores."
          xp={7}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Twitter is news feed + search + trending. Each is read-heavy, each has a different access pattern, and each gets its own store fed from the same write event. The math forces sharded fanout, separate search index, and a streaming pipeline that distributes one tweet to multiple downstream consumers."
          points={[
            { takeaway: "Scope to 4 features, defend it", detail: "Tweet, home timeline, search, trending. Punt DMs, threads, ads, lists. Mention retweets/quotes as fanout variations at wrap." },
            { takeaway: "Quantify before designing", detail: "7k tweets/sec is small. 720k timeline writes/sec (after fanout amplification) is the actual hard number. Search at 14k/sec needs its own index path." },
            { takeaway: "Different access patterns → different stores", detail: "Timelines: Redis ZSETs (per-user reverse-chrono). Search: Elasticsearch (inverted index across corpus). Trending: Redis sorted sets (counters with TTL). One canonical posts DB underneath." },
            { takeaway: "Streaming pipeline shape", detail: "One tweet write fans out to: timeline workers, search indexer, trending counter. Async, durable, can be replayed." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="api-and-design" title="Part 2 · API, data, high-level design" xp={12}>
        <h2>API in code</h2>
        <p>
          Five endpoints cover the four features. Show realistic shapes; let the interviewer see the data flowing through.
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/twitter/api/TweetController.java">{`@RestController
@RequestMapping("/api/v1")
public class TweetController {

    private final TweetService tweets;
    private final TimelineService timelines;
    private final SearchService search;
    private final TrendingService trending;

    @PostMapping("/tweet")
    public ResponseEntity<TweetDto> create(
            @RequestBody @Valid CreateTweetRequest req,
            @RequestHeader("X-User-Id") String userId) {

        Tweet created = tweets.create(userId, req.text(), req.mediaUrl());

        // Single write event triggers three downstream consumers:
        // fanout to timelines, indexing for search, trending counter
        eventBus.publish(new TweetCreatedEvent(created));

        return ResponseEntity.status(HttpStatus.CREATED).body(TweetDto.from(created));
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<Void> follow(
            @PathVariable String targetId,
            @RequestHeader("X-User-Id") String userId) {
        graph.follow(userId, targetId);
        timelines.backfillNewFollow(userId, targetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/timeline/home")
    public FeedResponse homeTimeline(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String cursor) {
        return timelines.buildHomeFeed(userId, limit, cursor);
    }

    @GetMapping("/search")
    public SearchResponse search(
            @RequestParam @NotBlank String q,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "20") int limit) {
        return search.query(q, SortMode.from(sort), limit);
    }

    @GetMapping("/trending")
    public TrendingResponse trending(
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "10") int limit) {
        return trending.top(region, limit);
    }
}

record CreateTweetRequest(@NotBlank @Size(max = 280) String text, @URL String mediaUrl) {}`}</CodeBlock>

        <p>
          Three things to point at: (1) tweet creation publishes a single event; downstream consumers (timeline, search, trending) subscribe independently. This decouples write latency from any single consumer&apos;s health. (2) home timeline uses the hybrid fanout from Module 30. (3) search and trending have separate query paths against their own stores.
        </p>

        <h2>Data model</h2>

        <CodeBlock lang="plain" caption="Storage layout per system">{`Tweets (canonical, e.g. Cassandra or sharded Postgres):
  tweets
    tweet_id      BIGINT       PRIMARY KEY (snowflake — time-sortable)
    author_id     VARCHAR(64)  NOT NULL
    text          VARCHAR(280) NOT NULL
    media_url     TEXT
    created_at    TIMESTAMPTZ  NOT NULL
    INDEX (author_id, created_at DESC)   -- author timeline / pull path

  Sharded by tweet_id (snowflake) → uniform distribution by time.
  Author-timeline lookup hits at most ~3 shards per author depending on activity.

Follow graph:
  follows (sharded by follower_id)
    follower_id, followee_id, created_at
  followers (sharded by followee_id)
    followee_id, follower_id, created_at
  Two tables for two access patterns: 'who do I follow' and 'who follows me'.
  ~120 GB per replica at 200M users × avg 150 follows.

Timelines (Redis cluster, sharded by user_id):
  timeline:{user_id}  ZSET  (tweet_id by created_at score), bounded 1k

Search (Elasticsearch):
  Index: tweets-yyyymm (monthly indices, drop oldest at retention horizon)
  Doc: { tweet_id, author_id, text, created_at, hashtags[] }
  Most queries hit only the most recent month or two.

Trending (Redis sorted sets, time-windowed):
  trending:1h:{region}   ZSET  (term, score = decayed count)
  trending:6h:{region}   ZSET  (same shape, larger window)
  Counters increment on indexer events; decay applied on read or via background job.`}</CodeBlock>

        <Callout variant="insight" title="Why snowflake IDs for tweet_id">
          <p className="m-0">
            A snowflake ID (timestamp + machine + sequence) is unique without coordination, time-sortable in itself, and shardable by its time component. That gives us: O(1) ID generation across thousands of API nodes, ordering without a separate timestamp, and a natural sharding scheme where recent tweets cluster on recent shards (good for hot working sets) while older tweets fall into older, colder shards (good for cost-tier storage). It&apos;s the same pattern Discord, Twitter, and Instagram use, and it&apos;s the right answer here.
          </p>
        </Callout>

        <h2>High-level architecture</h2>

        <Mermaid chart={twitterDiagram} />

        <p>
          The shape: tweet write goes into one canonical store and publishes to one event stream. Three independent consumers — fanout, indexer, trending — read that stream and update their own systems. Reads route directly to the system that serves them: home timeline → Redis ZSETs, search → Elasticsearch, trending → Redis sorted sets. Each downstream system can be scaled, deployed, and failed independently.
        </p>

        <h2>Classify each tweet&apos;s downstream consumer responsibilities</h2>
        <p>
          Drill: each behavior below is owned by a specific service. Sort them. This trains the &quot;what consumer owns this concern?&quot; reflex you&apos;ll need under interview pressure.
        </p>

        <ClassifyChallenge
          title="Which service owns this responsibility?"
          prompt="Drag each responsibility to the service that should own it."
          buckets={[
            { id: "fanout", label: "Fanout / Timeline service", color: "rose" },
            { id: "indexer", label: "Search indexer / Elasticsearch", color: "amber" },
            { id: "trending", label: "Trending service", color: "emerald" },
            { id: "tweet", label: "Tweet service (write path)", color: "indigo" },
          ]}
          items={[
            { id: "snowflake", label: "Generate a unique time-sortable tweet_id", answer: "tweet", explanation: "Tweet service mints the snowflake ID at write time. Downstream consumers receive the already-assigned ID." },
            { id: "zadd-followers", label: "ZADD a tweet_id into 200 follower timelines", answer: "fanout", explanation: "Pure fanout work — happens after the tweet is durably persisted, executed by fanout workers." },
            { id: "extract-hashtags", label: "Extract #hashtags from tweet text and increment counters", answer: "trending", explanation: "Trending service watches the event stream, parses hashtags/phrases, increments time-windowed counters with decay." },
            { id: "tokenize-and-index", label: "Tokenize tweet text and write to inverted index", answer: "indexer", explanation: "The indexer subscribes to tweet events and writes documents into Elasticsearch — this is what makes tweets searchable in <30s." },
            { id: "celebrity-skip", label: "Skip fanout for an author with >100k followers", answer: "fanout", explanation: "Hybrid fanout decision lives in the fanout worker — celebrities skip the push, readers will pull at read time." },
            { id: "validate-280", label: "Reject tweets longer than 280 characters", answer: "tweet", explanation: "Validation happens at write time, before persistence. Downstream consumers should never see invalid tweets." },
            { id: "decay-counters", label: "Apply time decay to trending counters", answer: "trending", explanation: "Time-windowed trending requires decay (or rolling windows). That math lives in the trending service, not the indexer." },
            { id: "query-recent-celeb", label: "Pull recent tweets from a celebrity at feed-read time", answer: "fanout", explanation: "The hybrid read path lives in the timeline service (part of the fanout/timeline domain). It queries the tweets DB and merges with the precomputed timeline." },
          ]}
        />

        <Quiz
          question="Why publish a TweetCreatedEvent on a stream instead of having the tweet API call the timeline, search, and trending services synchronously?"
          options={[
            { label: "Decoupling: each consumer can be scaled, deployed, and fail independently. If search indexing is briefly down, tweets still get fanned out and tweets still post — search just falls behind by a few seconds. With synchronous calls, the slowest consumer would set the post latency and any single consumer's outage would block writes.", correct: true, explanation: "Yes. The whole reason for the stream is independence — both for throughput and for failure isolation. Senior candidates name failure isolation explicitly." },
            { label: "Streams are faster than RPC.", explanation: "Per-call latency for a stream publish is similar to an RPC. The benefit is decoupling, not raw speed." },
            { label: "It's required for ordering.", explanation: "Many streams give per-partition ordering, but you don't need a stream for ordering — RPC can be ordered too." },
            { label: "It uses fewer servers.", explanation: "It actually adds servers (the broker). The reason is decoupling, not resource count." },
          ]}
          hint="What happens to tweet-create latency if search indexing is slow?"
          xp={7}
        />

        <Quiz
          question="The interviewer asks: 'Why monthly Elasticsearch indices?'"
          options={[
            { label: "Most search queries are recent (last 1-2 months). Monthly indices let us keep the hot index small (faster queries, smaller cache footprint), drop or move old indices to cheap storage at the retention horizon, and reindex one month at a time without touching the rest. It also caps the impact of an ES failure: only the affected month's index is degraded.", correct: true, explanation: "Right. Hot/cold separation, retention discipline, and blast radius all live in the index strategy. That's a senior-level answer." },
            { label: "Elasticsearch can't handle indices larger than 1TB.", explanation: "It can — that's not the constraint. The constraint is query performance and ops blast radius." },
            { label: "Daily indices would be too many files.", explanation: "Daily would work but is overkill for monthly retention math; monthly is a balance between operational simplicity and granularity." },
            { label: "It avoids the noisy neighbor problem.", explanation: "Index granularity isn't the right primitive for noisy-neighbor isolation; tenant-aware sharding or separate clusters would be." },
          ]}
          hint="Where does the bulk of search traffic land time-wise?"
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="One tweet write, one event stream, three independent consumers. Each downstream system uses the store that fits its access pattern: Redis ZSETs for timelines, Elasticsearch for search, Redis sorted sets for trending. The decoupling is the architecture."
          points={[
            { takeaway: "Tweet API publishes an event; consumers subscribe", detail: "Synchronous calls to all consumers would tie post latency to the slowest one. Async pub/sub gives independent scaling and failure isolation." },
            { takeaway: "Snowflake IDs for tweets", detail: "Unique without coordination, time-sortable, shard-friendly. Recent tweets cluster on recent shards — good for hot working sets and cost-tiering older data." },
            { takeaway: "Two follow tables", detail: "follows sharded by follower_id, followers sharded by followee_id. Two tables for two access patterns; the cost is double-write at follow time, paid once." },
            { takeaway: "Monthly ES indices for search", detail: "Hot index stays small, retention is a drop-old-index, blast radius bounded to one month. Most queries hit recent indices anyway." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="deep-dives" title="Part 3 · Deep-dives — timeline, trending, hot keys" xp={14}>
        <h2>Three hard subproblems — name them, pick one to lead</h2>
        <p>
          At Phase 5 you call out the hard parts and let the interviewer pick what to dig into. For Twitter:
        </p>
        <ol>
          <li><strong>Hybrid fanout for timelines</strong> — same as Module 30. I&apos;d skim it here unless they want a refresher.</li>
          <li><strong>Trending pipeline</strong> — how to compute &quot;top hashtags in the last hour&quot; at 7k tweets/sec without recomputing from scratch.</li>
          <li><strong>Celebrity hot-key on read path</strong> — when a single celebrity tweet gets viral, every timeline-builder is reading that tweet. The tweets DB shard becomes the hot key.</li>
        </ol>
        <p>I&apos;ll lead with trending and hot keys; fanout I covered last module.</p>

        <h2>Deep-dive: trending</h2>
        <p>
          Trending is &quot;top K terms over the last W minutes.&quot; At 7k tweets/sec that&apos;s ~25M tweets/hour and tens of millions of distinct terms. Three real options:
        </p>

        <h3>Option A: Periodic batch job</h3>
        <p>
          Every 5 minutes, scan the last hour of tweets and aggregate. Simple. But it&apos;s minutes-stale, expensive (full scan repeatedly), and doesn&apos;t scale: as the window grows or the granularity tightens, the batch job grows.
        </p>

        <h3>Option B: Streaming counters with sliding window</h3>
        <p>
          As each tweet flows through the indexer, parse its hashtags/terms and increment a Redis sorted set: <code>ZINCRBY trending:1h:{`{region}`} 1 hashtag</code>. Apply time decay (lambda &lt; 1) periodically so old tweets&apos; contributions fade. Read = ZREVRANGE top K. Sub-second freshness, O(1) per tweet, bounded memory if you cap distinct terms.
        </p>

        <h3>Option C: Count-min sketch (probabilistic)</h3>
        <p>
          A count-min sketch is a fixed-size array of counters with hash functions. It gives approximate counts with bounded memory regardless of distinct-term count. Good for Twitter-scale where billions of distinct terms would blow up an exact counter. Combine with a heavy-hitters algorithm to track top K.
        </p>

        <p>
          <strong>My pick: streaming counters with sliding window</strong>, with count-min sketch as a refinement once we hit term-count limits. The streaming counter approach is conceptually clean and works up to ~10M distinct terms; for global trending you&apos;d eventually need the sketch. I&apos;d sketch the simple version, mention CMS as the upgrade path. Don&apos;t do option A in 2026.
        </p>

        <CodeBlock lang="java" caption="src/main/java/com/twitter/trending/TrendingIndexer.java">{`@Component
public class TrendingIndexer {

    private final RedisTemplate<String, String> redis;

    @KafkaListener(topics = "tweet-events", groupId = "trending-indexer")
    public void index(TweetCreatedEvent ev) {
        Set<String> hashtags = HashtagExtractor.extract(ev.text());
        if (hashtags.isEmpty()) return;

        String region = ev.authorRegion();   // e.g. "us-west", "global"
        for (String tag : hashtags) {
            // Increment in 1-hour and 6-hour windows
            redis.opsForZSet().incrementScore("trending:1h:" + region, tag, 1.0);
            redis.opsForZSet().incrementScore("trending:6h:" + region, tag, 1.0);
        }
    }

    // Scheduled job — apply exponential decay to keep old contributions fading
    @Scheduled(fixedRate = 60_000)
    public void decay() {
        // Multiply every score by e^(-1/window_minutes) once per minute
        // Effectively: a tag stops counting after ~1h or ~6h of silence
        redis.execute(decayScript, List.of("trending:1h:*"), "0.9833");
        redis.execute(decayScript, List.of("trending:6h:*"), "0.9972");
    }

    public List<TrendingTerm> topK(String region, int k) {
        Set<TypedTuple<String>> top = redis.opsForZSet()
            .reverseRangeWithScores("trending:1h:" + region, 0, k - 1);
        return top.stream().map(TrendingTerm::from).toList();
    }
}`}</CodeBlock>

        <Callout variant="warn" title="The trending memory cap is real">
          <p className="m-0">
            A 1-hour window with 25M tweets and avg 1.5 hashtags per tweet creates ~37M increments. Most are repeats — the actual distinct hashtag count is maybe 1-5M. At ~50 bytes per ZSET entry that&apos;s 50-250MB per region per window. Manageable for a few regions; ugly for hundreds. The fix is either to cap the ZSET size (ZREMRANGEBYRANK keeping top 10k) so we lose only the long tail of irrelevant terms, or switch to count-min sketch where memory is fixed regardless of distinct count.
          </p>
        </Callout>

        <h2>Deep-dive: celebrity hot-key on the read path</h2>
        <p>
          Module 30 solved the celebrity write-path with hybrid fanout. But there&apos;s a symmetric read-path problem: when 10M followers all build their feeds in the same minute, each one&apos;s timeline service pulls the celebrity&apos;s recent tweets from the tweets DB. That&apos;s 10M concurrent reads concentrated on whatever shard holds the celebrity&apos;s recent tweets — a single hot shard.
        </p>

        <p>The fixes, in order of cost:</p>
        <ol>
          <li><strong>Cache celebrity recent-tweet lists.</strong> The pull-side query (<code>SELECT recent FROM tweets WHERE author_id = celeb</code>) gets cached in Redis with a short TTL (say 30s). 10M concurrent timeline-builders all hit the cache, not the DB. Cost: 30 seconds of staleness on celebrity tweets, which is well within the SLO.</li>
          <li><strong>CDN-cache celebrity profile reads.</strong> Public reads of a celebrity&apos;s recent tweets can go through a CDN with 1-minute TTL. Massive read amplification absorbed at the edge.</li>
          <li><strong>Explicit hot-shard replicas.</strong> If a celebrity&apos;s tweets DB shard is consistently hot, replicate it 3-5x and shed reads across replicas. Routing is by author_id, replication is async.</li>
        </ol>

        <p>
          The right combination is (1) + (2) for &quot;default celebrities&quot; and (3) reserved for the very few mega-celebs whose load justifies dedicated replicas. The cache TTL is the senior knob — dial it to balance staleness vs DB pressure.
        </p>

        <Quiz
          question="Why is a 30-second cache TTL on celebrity tweet lists OK, given users complain when feeds feel stale?"
          options={[
            { label: "The home timeline SLO already accepts 5-30s staleness on the fanout side. Adding 30s on the celebrity pull side is consistent with the user expectation. The win — collapsing 10M DB reads into a few cache misses per 30s — vastly outweighs the rare user noticing a 30s lag on a celebrity post.", correct: true, explanation: "Yes. Anchor on the existing SLO and quantify the win. The senior framing is 'we already accepted X seconds of lag elsewhere; this is consistent and the throughput win is huge.'" },
            { label: "Users don't notice 30 seconds.", explanation: "They do — but the staleness budget was already accepted at design time, which is the right framing." },
            { label: "Celebrities post infrequently so the cache is rarely stale.", explanation: "Some celebs post often; the freshness argument doesn't hold uniformly. The accepting-SLO argument does." },
            { label: "Caches always have TTLs.", explanation: "True but doesn't justify 30s specifically. Pick the TTL based on the staleness budget." },
          ]}
          hint="What latency budget did Part 1 set for timelines?"
          xp={7}
        />

        <Quiz
          question="A new feature requires push notifications for replies. Where in the architecture does that live?"
          options={[
            { label: "It's a new consumer of the tweet event stream — a notification service that subscribes to tweet-created events, filters to replies, looks up the parent author, and triggers a push. It does not live inside the tweet API or the fanout workers, because adding it shouldn't slow down post-create or coupling fanout with notification logic.", correct: true, explanation: "Right. The whole point of the event stream architecture is that adding a new consumer is non-invasive. Notification service is just another subscriber, scaled and deployed independently." },
            { label: "Inside the fanout worker — alongside the timeline writes.", explanation: "Bad coupling. A notification bug would cascade into fanout. Separate consumer." },
            { label: "Inside the tweet API — synchronously before responding.", explanation: "Synchronous notification on the write path adds latency and a failure mode. Subscriber, not synchronous." },
            { label: "Inside the timeline service — as it builds feeds.", explanation: "That's a read-path service; notification is a write-time event. Wrong scope." },
          ]}
          hint="The architecture's whole shape is built to make this question easy."
          xp={6}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Trending is solvable with streaming counters + decay; the memory cap argues for count-min sketch at extreme scale. The celebrity read-path hot-key needs a Redis-cache layer plus CDN at the edge plus, for the very biggest celebs, dedicated replicas. The whole system extends cleanly because every new feature is just another event-stream consumer."
          points={[
            { takeaway: "Streaming counters > batch jobs", detail: "ZINCRBY on every event with periodic decay gives sub-second freshness, O(1) per event, and a manageable memory cap if you trim the long tail." },
            { takeaway: "Count-min sketch is the upgrade path", detail: "When distinct terms blow past 10M, switch to a fixed-memory probabilistic counter with heavy-hitter tracking. Same shape, bounded memory." },
            { takeaway: "Celebrity hot-keys hurt on read too, not just write", detail: "10M concurrent feed-builders pulling the same celeb's recent tweets is one hot shard. Cache the pull-query result for 30s; CDN the public profile reads." },
            { takeaway: "Adding new features = adding stream consumers", detail: "Notifications, analytics, ML features — each is a new subscriber to tweet-created. The architecture stays the same; new consumers scale independently." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug={mod.slug} id="wrap" title="Part 4 · Wrap and what I'd revisit" xp={6}>
        <h2>What I&apos;d revisit if I had more time</h2>
        <ul>
          <li><strong>Retweets and quotes.</strong> A retweet is a fanout event for the retweeter&apos;s followers, with the original tweet_id as the payload (no copy). A quote is a new tweet that references another. Both extend the event-stream architecture cleanly: retweet → new fanout job; quote → new tweet event with a parent_id. Mention but don&apos;t design.</li>
          <li><strong>Search ranking.</strong> Pure recency is the simple version. Real search blends recency + author authority + engagement + query relevance. That&apos;s an ML scoring layer between ES and the API; the architecture doesn&apos;t change, the ranking does.</li>
          <li><strong>Multi-region active-active.</strong> Tweets DB replicates cross-region with conflict resolution by tweet_id (immutable). Trending is per-region naturally. Timelines are home-region; cross-region followers&apos; timelines lag by replication latency. Spell out the consistency tradeoff per surface.</li>
          <li><strong>Abuse and content moderation.</strong> Async pipeline: every tweet event flows through a moderation classifier; flagged tweets are tombstoned (still readable by author, hidden from others) and sent to a human review queue. Lives as another event-stream consumer.</li>
        </ul>

        <h3>Failure modes I&apos;m worried about</h3>
        <ul>
          <li><strong>Event stream backlog.</strong> If the fanout consumer falls behind, timelines go stale; if the indexer falls behind, search misses recent tweets. Per-consumer lag monitoring with paging alerts at 30s.</li>
          <li><strong>Hot author shards.</strong> One celeb&apos;s tweets-DB shard takes outsized read load. Mitigated by caching layer + CDN + (for mega-celebs) dedicated replicas.</li>
          <li><strong>Trending counter explosion.</strong> Spam waves can flood a hashtag with millions of fake tweets. Requires upstream abuse filtering; counter alone doesn&apos;t protect against this.</li>
          <li><strong>Search index corruption.</strong> An ES bug or bad mapping change can corrupt an index. Monthly indices bound the blast radius; replay from the event stream rebuilds the affected month.</li>
        </ul>

        <h3>What I&apos;d monitor</h3>
        <ul>
          <li>Home timeline p99 latency (SLO: &lt;200ms)</li>
          <li>Search p99 latency (SLO: &lt;300ms)</li>
          <li>Tweet-event consumer lag per consumer (alert &gt;30s)</li>
          <li>Cache hit rate on celebrity pull-queries</li>
          <li>Trending counter memory per region</li>
          <li>Snowflake ID generator clock skew</li>
        </ul>

        <Callout variant="spring" title="The senior 'I would also' moves for Twitter">
          <em>&quot;I&apos;d use Kafka for the tweet event stream; I would also consider Pulsar for the geo-replication built-in if we go multi-region heavy.&quot;</em> Or: <em>&quot;I&apos;d use Cassandra for tweets; I would also consider sharded Postgres if the team has stronger SQL ops experience — Cassandra wins on write throughput, Postgres wins on operational familiarity, and at our scale either works if tuned well.&quot;</em> The pattern: name the choice, name the alternative, name the axis on which you picked.
        </Callout>

        <p>
          That&apos;s Twitter — not the whole product, but the architectural skeleton. Notice that we used the framework from Module 28 unchanged: clarify, estimate, API + data, high-level, deep-dive, wrap. The system is bigger than TinyURL or news feed but the framework absorbs it. That&apos;s the point of the framework — it doesn&apos;t care how big the problem is, only that you walk it deliberately.
        </p>
      </Checkpoint>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <p className="text-sm uppercase tracking-wider font-bold text-cyan-700 dark:text-cyan-300 mb-2">Up next</p>
        <p className="m-0 text-base">
          Module 32: Design a chat system. WebSockets, presence, message ordering, group chat, push notifications. The architecture shifts from request/response to stateful connections — and that changes everything about how you scale.
        </p>
      </section>
        <ModuleNav courseId="system-design" currentSlug="design-twitter" />
    </article>
  );
}
