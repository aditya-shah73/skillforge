import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import CodeBlock from "@/components/CodeBlock";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "hierarchy", title: "The consistency hierarchy" },
  { id: "session", title: "Session guarantees" },
  { id: "bugs", title: "Real bugs, real fixes" },
];

export default function Page() {
  const mod = getModuleBySlug("consistency-models")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="consistency-models" />
        <ModuleProgress moduleSlug="consistency-models" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-rose-300 bg-gradient-to-br from-rose-50 to-orange-50 p-6 dark:border-rose-800 dark:from-rose-950/40 dark:to-orange-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          The vocabulary to specify exactly what guarantee your code is relying on. By the end you&apos;ll be able to tell when a bug is &quot;eventual consistency working as designed&quot; vs &quot;the system promised more and broke.&quot;
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Linearizability, sequential, causal, eventual — what each <em>actually</em>{" "}guarantees</li>
          <li>Session guarantees: read-your-writes, monotonic reads, monotonic writes, writes-follow-reads</li>
          <li>Concrete bugs each model prevents — and the ones it lets through</li>
          <li>How to pick the right model per call site, not per database</li>
        </ul>
      </section>

      <section>
        <h2>&quot;Eventually consistent&quot; isn&apos;t a guarantee, it&apos;s a punt</h2>
        <p>
          When a database advertises &quot;eventual consistency,&quot; what it&apos;s really saying is: <em>if writes stop forever, all replicas will eventually agree.</em>{" "}That&apos;s technically true and operationally useless. It says nothing about what your application sees in the meantime — and the meantime is where every interesting bug lives.
        </p>
        <p>
          The good news: there&apos;s a precise hierarchy of consistency models, each adding specific guarantees on top of &quot;eventual.&quot; The senior skill is naming which one you need at each call site, then verifying your stack actually delivers it.
        </p>
        <p>
          Strong at the top, weak at the bottom. The further down you go, the more parallelism, lower latency, and higher availability you can achieve — at the cost of behaviors your code has to be ready for.
        </p>
      </section>

      <Checkpoint moduleSlug="consistency-models" id="hierarchy" title="Part 1 · The consistency hierarchy" xp={25}>
        <h2>From strongest to weakest</h2>

        <h3>Linearizability (strict consistency)</h3>
        <p>
          The system behaves as if there&apos;s a single, current copy of the data. Once a write completes, every subsequent read — from any replica, in any region — sees that write. Operations have a total order that matches real time: if write W finishes before read R starts, R sees W or something newer.
        </p>
        <p>
          This is the model your code naturally assumes when you don&apos;t think about it. It&apos;s what a single-node database gives you. It&apos;s also expensive to provide in a distributed system — every write has to round-trip to a quorum before it&apos;s considered done.
        </p>
        <p><strong>Where you find it:</strong>{" "}single-node databases, Spanner, etcd, ZooKeeper, single-leader replication where you only read from the leader.</p>

        <h3>Sequential consistency</h3>
        <p>
          All operations appear in some total order, and every process sees that same order. The order doesn&apos;t have to match real time — if write W happens at 10:00:01 on server A, processes might see read R at 10:00:00 still get the new value, or vice versa, as long as everyone agrees on <em>some</em>{" "}consistent order.
        </p>
        <p>
          Sequential consistency is theoretically interesting but rarely the explicit goal in practice. It&apos;s what you get from some consensus systems internally, but most user-facing databases either offer linearizability (strong) or something weaker.
        </p>

        <h3>Causal consistency</h3>
        <p>
          Operations that are causally related must be seen in the right order by everyone. Causally unrelated operations can be reordered. &quot;Causally related&quot; means: B happened after the process that did B saw A.
        </p>
        <p>The classic example:</p>
        <ul>
          <li>Alice posts &quot;I lost my keys.&quot;</li>
          <li>Alice posts &quot;Found them, never mind.&quot;</li>
          <li>Bob and Carol see both posts. Causal consistency guarantees they see them in that order. Eventual consistency does not — Carol could see &quot;Found them&quot; before &quot;Lost my keys.&quot;</li>
        </ul>
        <p>
          Causal consistency catches the most jarring real-world ordering bugs while still allowing parallelism for unrelated operations. It&apos;s the model that COPS, Bayou, and some modern stores aim for. It&apos;s not the default of most popular databases.
        </p>

        <h3>Eventual consistency</h3>
        <p>
          If writes stop, all replicas converge to the same value. There&apos;s no ordering guarantee in the meantime. Reads can return arbitrarily stale or out-of-order values. The only promise is convergence in the absence of new updates.
        </p>
        <p>
          This is what Cassandra (default), DynamoDB (default reads), Riak, and async-replicated MySQL/Postgres replicas effectively give you. It&apos;s the cheapest model and the one your application has to do the most work to live with safely.
        </p>

        <Callout variant="info" title="The hierarchy is a containment tree">
          <p className="m-0">Linearizable implies sequential implies causal implies eventual. Anything that&apos;s linearizable is also causal. Anything that&apos;s causal is also eventual. So when a system says &quot;we&apos;re causally consistent,&quot; you know it&apos;s also eventually consistent — but the reverse isn&apos;t true.</p>
        </Callout>

        <h3>The visible bug, by model</h3>
        <p>
          The fastest way to internalize the hierarchy is to look at what each model lets you see. Consider three writes happening to a counter at user_id=42, all at roughly the same time:
        </p>
        <ul>
          <li><strong>W1:</strong>{" "}set counter = 1 (at 10:00:00.000)</li>
          <li><strong>W2:</strong>{" "}set counter = 2 (at 10:00:00.050)</li>
          <li><strong>W3:</strong>{" "}set counter = 3 (at 10:00:00.100)</li>
        </ul>
        <p>What can a read see at 10:00:01.000?</p>
        <ul>
          <li><strong>Linearizable:</strong>{" "}Always 3.</li>
          <li><strong>Sequential:</strong>{" "}Either 3 (if everyone agrees on real-time order) or one of 1, 2, or 3 — as long as all subsequent reads agree on the same total order.</li>
          <li><strong>Causal:</strong>{" "}Depends on what writes are causally related. If W2 read W1 first, you can&apos;t see counter=2 without also having seen counter=1.</li>
          <li><strong>Eventual:</strong>{" "}Anything from <code>null</code> to 3, in any order. The only guarantee is &quot;eventually 3.&quot;</li>
        </ul>

        <Quiz
          question="A user posts a comment 'Wow, the cake was amazing!' — then immediately follows with 'Actually, the cake was terrible.' Under eventual consistency, what's the worst-case visible behavior to other users?"
          options={[
            { label: "Some users see only 'terrible,' some see only 'amazing,' some see them in either order. There's no ordering guarantee until convergence.", correct: true, explanation: "Right. Eventual gives you convergence-eventually but no ordering in between. Causal consistency would prevent the reordering — both posts came from the same author, so causality links them — but eventual doesn't." },
            { label: "Both posts always appear together in chronological order, just delayed.", explanation: "That would be causal or stronger. Eventual makes no ordering promise — readers can see them in any order, or only one." },
            { label: "Only one of the two ever shows up; the other is dropped to ensure consistency.", explanation: "Eventual converges to all writes; nothing is dropped. The bug is reordering and partial visibility, not loss." },
            { label: "Both posts are visible, but only after a leader confirms the order globally.", explanation: "That describes linearizable, not eventual. Eventual specifically does not have a leader-confirmed order." },
          ]}
          hint="What does 'eventual' explicitly not guarantee?"
          xp={7}
        />

        <Quiz
          question="Which guarantee does causal consistency explicitly add over eventual consistency?"
          options={[
            { label: "If operation A causally precedes operation B (B's process saw A first), every observer sees A before B.", correct: true, explanation: "That's the precise definition. Causally unrelated operations can still be reordered — the win is that the most jarring real-world reorderings (replies before originals, edits before posts) are prevented." },
            { label: "Reads always return the most recent write.", explanation: "That's linearizability, the strongest guarantee. Causal is weaker — concurrent writes can still be visible in different orders to different readers." },
            { label: "All operations appear in the same total order to every process.", explanation: "That's sequential consistency. Causal allows different orders for unrelated ops." },
            { label: "Writes are durably committed before they're visible to anyone.", explanation: "That's a durability property, not a consistency model. Causal is about ordering, not durability." },
          ]}
          hint="What's the relationship causal consistency preserves?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Four models, strongest to weakest: linearizable, sequential, causal, eventual. Each adds specific guarantees on top of 'eventual,' and each costs more to provide."
          points={[
            { takeaway: "Linearizable matches real-time order", detail: "Every read sees the latest write across all replicas. The model your code naturally assumes when you don't think about it — and the most expensive to deliver." },
            { takeaway: "Sequential is total order, not real-time", detail: "Everyone agrees on the same order of operations, but it doesn't have to match wall-clock time. Theoretically interesting, rarely an explicit goal in practice." },
            { takeaway: "Causal preserves cause-and-effect", detail: "If B's process saw A, every observer sees A before B. Causally unrelated operations can still reorder. Catches the jarring 'reply before question' bugs." },
            { takeaway: "Eventual is convergence-only", detail: "If writes stop, replicas converge. No ordering guarantee in between. The cheapest model — and the one your application has to do the most work to live with safely." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="consistency-models" id="session" title="Part 2 · Session guarantees" xp={30}>
        <h2>The four session guarantees</h2>
        <p>
          The hierarchy above is &quot;global&quot; — what does the system guarantee across all clients? But there&apos;s a parallel set of guarantees specific to a single user&apos;s session, and these are usually what UX bugs care about. They&apos;re cheaper than full linearizability and they catch the common cases.
        </p>
        <p>The four session guarantees, all due to the Bayou paper (1995):</p>
        <ol>
          <li><strong>Read-your-writes (RYW):</strong>{" "}If you wrote it, your next read sees it.</li>
          <li><strong>Monotonic reads:</strong>{" "}Successive reads from the same session never go backward in time.</li>
          <li><strong>Monotonic writes:</strong>{" "}Your writes are applied in the order you issued them.</li>
          <li><strong>Writes-follow-reads:</strong>{" "}If you read a value and then write a new one, the write is ordered after whatever you read.</li>
        </ol>

        <h3>Read-your-writes</h3>
        <p>
          The classic RYW bug: user updates their profile name to &quot;Alice Smith,&quot; gets a success response, refreshes the page, and sees the old name. Their write went to the leader; the next read went to a replica that hadn&apos;t replicated yet. Stale read.
        </p>
        <p>This is the bug that ships to production constantly. Common fixes:</p>
        <ul>
          <li><strong>Pin reads to the leader for a window after a write.</strong>{" "}Often called &quot;read-your-writes via sticky session.&quot; The simplest fix.</li>
          <li><strong>Track the version of the write client-side</strong> (a logical timestamp / LSN), and require any read to wait until at least that version is replicated.</li>
          <li><strong>Read from the cache the user&apos;s own writes wrote to</strong>{" "}if you&apos;re using write-through caching.</li>
        </ul>

        <CodeBlock lang="java" caption="RYW: pin the post-write read to the primary">{`// Naive write-then-read — vulnerable to RYW violation if reads go to a replica.
@Transactional
public ProfileResponse updateName(Long userId, String newName) {
  userRepo.updateName(userId, newName);
  return loadProfile(userId);  // might hit a stale replica
}

// Read-your-writes via leader pinning for the rest of the request.
@Transactional
public ProfileResponse updateName(Long userId, String newName) {
  userRepo.updateName(userId, newName);
  // Force the next read to use the primary, not a read replica.
  return profileService.loadFromPrimary(userId);
}`}</CodeBlock>

        <Callout variant="spring" title="How this looks in Spring">
          <p className="m-0">If you&apos;re using <code>@Transactional</code> with a routing data source (e.g., <code>AbstractRoutingDataSource</code> swapping between primary and replica based on read-only hints), you control where reads land. RYW pattern: immediately after a write, force subsequent reads onto the primary for the duration of the user&apos;s session window. <code>spring-session-data-redis</code> can hold a small &quot;just-wrote-at-LSN-N&quot; marker so other servers in the cluster honor it too.</p>
        </Callout>

        <h3>Monotonic reads</h3>
        <p>
          Monotonic reads says: if I just saw value X for some key, my next read won&apos;t return an older value. Without it, time appears to go backward. This bug looks like: you&apos;re refreshing your inbox, you see message #100, you refresh again, you see only #98 — because your second request happened to land on a replica that&apos;s a few seconds behind the first one.
        </p>
        <p>
          The fix is usually session-pinning at the load balancer or proxy level: route all of one user&apos;s reads to the same replica. They&apos;ll lag the leader, but at least they&apos;ll lag <em>monotonically</em>, so the user never sees time reverse.
        </p>

        <h3>Monotonic writes</h3>
        <p>
          A user issues write A then write B. Monotonic writes guarantees A is applied before B at every replica, regardless of which replica each write hit first. Without it, the user&apos;s second write can &quot;arrive&quot; before the first, leading to weird states like &quot;I changed my plan to Pro, then upgraded to Enterprise, and the system shows me on Pro because the Pro update arrived at the replica after the Enterprise one.&quot;
        </p>
        <p>
          Most well-designed systems give you this for a single client by sequencing writes through one path (the leader, or a single connection). It can break across reconnects or in multi-leader / leaderless setups.
        </p>

        <h3>Writes-follow-reads</h3>
        <p>
          The most subtle of the four. If a user reads a value and then writes a new value based on it, that write must be ordered after whatever they read. It&apos;s the &quot;reply ordering&quot; guarantee: if Alice posts a question and Bob reads it, then Bob posts a reply, every observer must see the question before the reply.
        </p>
        <p>
          This is what causal consistency gives you across users. Within a session, it&apos;s the rule that prevents your own write from appearing &quot;before&quot; the data you wrote it in response to.
        </p>

        <h3>The four together: session-causal consistency</h3>
        <p>
          A system that gives you all four session guarantees is sometimes called &quot;session-causal&quot; or just &quot;session consistent.&quot; It&apos;s strictly weaker than full causal consistency (it only tracks one user&apos;s causality, not cross-user causality), but it catches most of the bugs users actually notice.
        </p>
        <p>
          Critically: <strong>most popular eventually-consistent stores do not give you any of these by default.</strong>{" "}Cassandra, DynamoDB (eventual reads), and Postgres async replicas can all violate all four if you&apos;re not careful. You have to build the guarantees in at the application layer or pin reads explicitly.
        </p>

        <Callout variant="warn" title="The 'we use Postgres so we're consistent' trap">
          <p className="m-0">If you have a primary and read replicas, and you route reads to the replicas, you&apos;ve quietly given up read-your-writes and monotonic reads. Postgres itself isn&apos;t the issue — your topology is. The fix is to know which reads must hit the primary (post-write reads, anything in the same transaction) and which can tolerate replica lag (analytics, cold paths).</p>
        </Callout>

        <h3>Which guarantee fixes which bug?</h3>
        <p>
          Match each user-visible bug with the session guarantee that prevents it.
        </p>
        <ClassifyChallenge
          title="Match the bug to the missing session guarantee"
          prompt="For each user-visible bug, pick the session guarantee that would have prevented it."
          buckets={[
            { id: "ryw", label: "Read-your-writes", color: "rose" },
            { id: "monotonic-read", label: "Monotonic reads", color: "amber" },
            { id: "monotonic-write", label: "Monotonic writes", color: "emerald" },
            { id: "wfr", label: "Writes-follow-reads", color: "indigo" },
          ]}
          items={[
            { id: "bio", label: "User updates their bio, refreshes, sees the old bio.", answer: "ryw", explanation: "Classic RYW: the user's own write isn't visible on their next read. The next read landed on a lagging replica." },
            { id: "feed-back", label: "User refreshes their feed twice and the second refresh shows older posts than the first.", answer: "monotonic-read", explanation: "Time appears to go backward — successive reads should never regress. Pin the user's reads to one replica." },
            { id: "upgrade", label: "User upgrades from Free to Pro, then to Enterprise; their account ends up on Pro.", answer: "monotonic-write", explanation: "Two writes from one user landed in the wrong order. Monotonic writes guarantees they're applied in the order issued." },
            { id: "reply", label: "User reads a question, replies to it; their reply appears in the feed before the original question.", answer: "wfr", explanation: "The reply causally depends on the question being read first. Writes-follow-reads keeps that order intact." },
            { id: "tweet", label: "After posting a tweet, the user sees their feed without their new tweet for 8 seconds.", answer: "ryw", explanation: "Same shape as the bio bug — the user's own write is invisible to them. RYW is the missing guarantee." },
            { id: "notif", label: "Reading the same notification list twice shows older items the second time.", answer: "monotonic-read", explanation: "Backward-going reads — that's monotonic-reads territory. Pin the session to one replica." },
          ]}
        />

        <Quiz
          question="Your service has a primary Postgres and three async read replicas behind a load balancer. After deploying read-replica routing, users complain about 'their own posts disappearing for a few seconds after publishing.' Which guarantee did you accidentally give up, and what's the cleanest fix?"
          options={[
            { label: "Read-your-writes. Fix: route reads to the primary for a short window after each write — sticky session at the application or proxy layer.", correct: true, explanation: "Exactly. The replica routing broke RYW. The standard fix is to bias reads toward the primary right after a write — either by tracking a 'just-wrote-LSN-N' token or by pinning the user's session to primary for a few seconds." },
            { label: "Monotonic reads. Fix: pin each user to a single replica forever.", explanation: "Monotonic reads is a related issue, but the symptom described — user not seeing their *own* post — is specifically RYW. Pinning to one replica still doesn't help if it's behind on this user's writes." },
            { label: "Linearizability. Fix: stop using replicas entirely.", explanation: "Possible but heavy-handed. RYW alone is much cheaper than full linearizability — you only need to redirect reads after a write, not all reads forever." },
            { label: "Monotonic writes. Fix: serialize all writes through a single thread.", explanation: "Monotonic writes is about ordering of *the user's own writes*. The bug is that they don't see their *own* write — that's RYW." },
          ]}
          hint="Which guarantee is specifically about seeing your own writes?"
          xp={8}
        />

        <Quiz
          question="A messaging app pins each user's reads to a fixed replica based on user_id hash. The replica lags 1–2s behind the primary. Other users' messages still appear out of order. What's missing?"
          options={[
            { label: "Cross-user causal consistency. Pinning to one replica gives you monotonic reads for one user, but doesn't preserve causal order across users — replies can still appear before the messages they reply to.", correct: true, explanation: "Right. Session guarantees are per-user. Causal consistency across users is a stronger property that requires tracking causal dependencies between writes from different users — vector clocks, version vectors, or a system like COPS." },
            { label: "Read-your-writes — the user can't see their own messages.", explanation: "RYW is per-user; pinning to one replica handles it (the user's writes flow to that replica eventually, and they always read from it)." },
            { label: "Monotonic writes — writes are out of order.", explanation: "Monotonic writes is per-user. The bug described is across users." },
            { label: "Linearizability — only full linearizability fixes message ordering.", explanation: "Linearizability would fix it, but it's overkill. Causal consistency is sufficient and much cheaper." },
          ]}
          hint="Whose causality is the system tracking, and whose isn't?"
          xp={7}
        />

        <PartRecap
          title="Part 2 recap"
          gist="The four Bayou session guarantees catch the user-visible bugs that 'eventual consistency' lets through — and they're cheap compared to full linearizability."
          points={[
            { takeaway: "Read-your-writes: see your own write on next read", detail: "Fix with sticky-to-primary for a short window, or with LSN tracking that requires the read to wait for at least the user's most recent write." },
            { takeaway: "Monotonic reads: time doesn't go backward in a session", detail: "Pin each user's reads to a single replica. They'll see slightly stale data, but it won't regress." },
            { takeaway: "Monotonic writes: your writes apply in issue order", detail: "Usually free in a single-leader system over one connection. Can break across reconnects or in multi-leader setups." },
            { takeaway: "Writes-follow-reads: causal order across read-then-write", detail: "Per-user version of causal consistency. Cross-user causality is a stronger property requiring vector clocks or version vectors." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="consistency-models" id="bugs" title="Part 3 · Real bugs, real fixes" xp={25}>
        <h2>Bugs you&apos;ll see in production</h2>
        <p>
          The hierarchy and the session guarantees are tools. The actual senior skill is recognizing which model a piece of code needs and verifying the system delivers it. Here are five real production patterns and how to read them.
        </p>

        <h3>Bug 1: The flash sale double-spend</h3>
        <p>
          E-commerce inventory: 10 units of a hot item. Two app servers each read &quot;10 available,&quot; each accept an order, each decrement to 9. You sold 11 items, but inventory says 9. Classic lost-update under concurrent writes.
        </p>
        <p><strong>What model would have caught it:</strong>{" "}Linearizability on the inventory key, or a compare-and-swap (&quot;decrement only if current value is X&quot;), or a transaction with row-level locks. This is a workload that genuinely needs strong consistency on the inventory variable. Don&apos;t cache it. Don&apos;t replicate it eventually. Pay the latency cost.</p>

        <h3>Bug 2: The disappearing comment</h3>
        <p>
          User posts a comment. Comment is written to primary. Page refreshes; reads go to a replica that hasn&apos;t replicated yet. User thinks the comment failed and posts again. Now there are two comments.
        </p>
        <p><strong>What model would have caught it:</strong>{" "}Read-your-writes. The fix is to route the post-write read to the primary, or to wait for the replica to catch up to the write&apos;s LSN. This is the most common consistency bug on the planet.</p>

        <h3>Bug 3: The receding inbox</h3>
        <p>
          User opens their inbox, sees 12 messages. Refreshes, sees 9. Refreshes again, sees 14. They&apos;re bouncing between three replicas at different lag levels. Inbox count is not monotonic.
        </p>
        <p><strong>What model would have caught it:</strong>{" "}Monotonic reads. Fix by pinning the user&apos;s session to one replica. They&apos;ll see slightly stale data, but it won&apos;t go backward.</p>

        <h3>Bug 4: The reply-before-question</h3>
        <p>
          Forum: Alice posts a question. Bob reads it, posts a reply. Carol opens the thread and sees Bob&apos;s reply before Alice&apos;s question — Carol&apos;s page is reading from a replica that has Bob&apos;s reply but not Alice&apos;s question (wild, but possible under eventual replication).
        </p>
        <p><strong>What model would have caught it:</strong>{" "}Causal consistency. Bob&apos;s write causally depends on Alice&apos;s; the system has to preserve that order. Fix is either causal consistency (vector clocks / version vectors), or — pragmatically — making sure thread reads always go through a path that sees writes in causal order (e.g., reading the whole thread from one replica that has both).</p>

        <h3>Bug 5: The stale balance after a transfer</h3>
        <p>
          User transfers $50 from Account A to Account B. The bank confirms the transfer. The user opens their app and sees A&apos;s balance updated but B&apos;s still showing the old amount. Half-applied state.
        </p>
        <p><strong>What model would have caught it:</strong>{" "}Linearizability on the transaction itself, or read-your-writes plus knowledge that both accounts were modified. The fix in practice: the transfer&apos;s confirmation page reads both balances <em>through the primary</em>{" "}in the same transaction context as the write, ensuring consistency for the post-transfer view.</p>

        <Callout variant="insight" title="The pattern across all five">
          <p className="m-0">Every one of these bugs is &quot;the database is doing what it promised, but the application assumed something stronger.&quot; The fix is never &quot;make the database stronger&quot; — it&apos;s either route the read carefully (RYW, monotonic) or pick the right model for the call site (linearizability for inventory and transfers, causal for forums).</p>
        </Callout>

        <h3>The senior framing: per call site, not per database</h3>
        <p>
          The most useful mental shift in this whole module: <strong>consistency is a property of a code path, not a property of a database.</strong>{" "}The same Postgres can serve linearizable reads (from primary) and eventually-consistent reads (from a replica) in the same minute. The same Cassandra can serve eventual reads (consistency=ONE) and quorum reads (consistency=QUORUM) on adjacent queries.
        </p>
        <p>
          The senior question is, for each read in your codebase: <em>what guarantee does this read need?</em>
        </p>
        <ul>
          <li><strong>Inventory check before order:</strong>{" "}linearizable. Pay the cost.</li>
          <li><strong>Profile name on the user&apos;s own page after editing:</strong>{" "}read-your-writes. Pin to primary briefly.</li>
          <li><strong>Profile name on someone else&apos;s page:</strong>{" "}eventual is fine. Use the replica.</li>
          <li><strong>Trending posts list:</strong>{" "}eventual is fine. Stale by 30s is invisible.</li>
          <li><strong>Bank balance after a transaction:</strong>{" "}linearizable on that read for that user. Pay the cost.</li>
          <li><strong>Bank balance for a passive dashboard glance:</strong>{" "}read-your-writes is enough.</li>
        </ul>

        <Callout variant="warn" title="The most common mistake">
          <p className="m-0">Picking one consistency level for the whole service. Either everything is linearizable (slow, expensive, often unnecessary) or everything is eventual (cheap, fast, lots of weird bugs). The real answer is per call site: tag your reads with what they need, and route them accordingly.</p>
        </Callout>

        <Quiz
          question="A team is building a multi-region fitness app. The 'live workout leaderboard' updates every few seconds; the 'unlock achievement' flow gives users a one-time badge that must never be granted twice. Which consistency models match each?"
          options={[
            { label: "Leaderboard: eventual is fine — staleness of a few seconds is invisible. Achievement unlock: linearizable on the achievement key, or use compare-and-swap, to prevent duplicate grants.", correct: true, explanation: "Right. Same service, two call sites with completely different needs. The leaderboard tolerates eventual; the achievement flow requires linearizability on that specific key. Don't blanket-apply one model." },
            { label: "Both linearizable — consistency matters everywhere.", explanation: "Linearizable is expensive. The leaderboard would gain nothing visible from it and pay write/read latency cross-region. Match the model to the call site." },
            { label: "Both eventual — staleness is acceptable.", explanation: "Eventual on achievement unlock is the recipe for granting the same badge twice — exactly the bug the requirement says to avoid." },
            { label: "Read-your-writes for both.", explanation: "RYW solves the user-sees-own-write problem but doesn't prevent two clients from concurrently granting the same one-time achievement." },
          ]}
          hint="What does each call site go wrong with under the wrong model?"
          xp={7}
        />

        <Quiz
          question="A reviewer says: 'Switch this read from primary to a read replica — it'll cut latency by 30ms and offload the primary.' What's the senior question to ask?"
          options={[
            { label: "Is this a read that immediately follows a write by the same user, or is it a read where staleness is fine? In other words, do we need read-your-writes or monotonic reads here?", correct: true, explanation: "Exactly. The latency win is real, but you trade it for replica lag. The right question is whether the call site can tolerate stale reads — post-write reads usually can't, passive reads usually can. Apply per-call-site, not blanket." },
            { label: "Is the replica configured for read-only access?", explanation: "A reasonable hygiene check, but doesn't address whether the change is correct for the application." },
            { label: "Will the network round-trip difference matter at scale?", explanation: "It's a fair operational question, but secondary to whether the consistency guarantee is acceptable." },
            { label: "Just A/B test it and roll back if users complain.", explanation: "Consistency bugs are silent — they don't generate complaints in A/B, they generate corrupt data months later. You can't ship-and-see consistency changes." },
          ]}
          hint="The latency-vs-consistency tradeoff is decided per-call-site."
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Five canonical production bugs map to five canonical fixes. Consistency is a property of a code path, not a database — pick per call site."
          points={[
            { takeaway: "Five bugs, five fixes", detail: "Inventory double-spend → linearizable. Disappearing comment → RYW. Receding inbox → monotonic reads. Reply-before-question → causal. Stale balance after transfer → linearizable on the read." },
            { takeaway: "Consistency is per code path", detail: "The same Postgres serves linearizable reads (primary) and eventual reads (replica) in the same minute. Cassandra serves ONE and QUORUM on adjacent queries." },
            { takeaway: "Tag every read with its required guarantee", detail: "Inventory check: linearizable. Own profile after edit: RYW. Someone else's profile: eventual. Trending list: eventual. Bank balance after transaction: linearizable." },
            { takeaway: "Don't blanket-apply one level", detail: "Linearizable everywhere is slow and expensive. Eventual everywhere is buggy. The right answer is granular and intentional — consistency bugs are silent, so 'ship and see' doesn't work." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>Phase 1, complete</h2>
        <p>
          You now have the four foundation pieces: <strong>back-of-envelope math</strong>, <strong>the scaling ladder</strong>, <strong>CAP and PACELC</strong>, and the <strong>consistency model hierarchy</strong>. Together they form the vocabulary every later module depends on.
        </p>
        <p>
          Phase 2 is the storage layer — SQL vs NoSQL, indexing, sharding, replication, caching, search. Every choice in Phase 2 is going to lean on one of the four pieces above. When sharding talks about consistency tradeoffs, you&apos;ll know which model is at risk. When replication talks about latency, you&apos;ll see the PACELC dimension. When caching talks about staleness, you&apos;ll know which session guarantee it&apos;s breaking and how to put it back.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next phase</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Phase 2 starts with the SQL vs NoSQL choice — the first real architectural decision after the foundations. We&apos;ll cut through the &quot;use Postgres&quot; vs &quot;use NoSQL&quot; tribalism and look at the actual workload shapes that drive each decision.
        </p>
        <Link
          href="/courses/system-design/modules/sql-vs-nosql"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-sm transition hover:from-cyan-600 hover:to-blue-600 hover:shadow-md"
        >
          Continue to Phase 2: SQL vs NoSQL →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="consistency-models" />
    </article>
  );
}
