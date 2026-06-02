import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import CodeBlock from "@/components/CodeBlock";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "wallclock", title: "Why wall clocks lie" },
  { id: "logical", title: "Logical clocks: Lamport and vectors" },
  { id: "hybrid", title: "Hybrid time: HLC and TrueTime" },
];

const happensBeforeDiagram = `sequenceDiagram
  participant A as Process A
  participant B as Process B
  participant C as Process C
  A->>A: a1 (L=1)
  A->>B: msg (L=2)
  B->>B: b1 (L=3)
  B->>C: msg (L=4)
  C->>C: c1 (L=5)
  Note over A,C: L(a1)=1 < L(b1)=3 < L(c1)=5`;

export default function Page() {
  const mod = getModuleBySlug("clock-time")!;

  return (
    <article className="prose-custom">
      <nav className="mb-6 text-xs">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-xs font-bold tracking-wider text-transparent uppercase">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{mod.title}</h1>
        <p className="text-lg text-slate-600 italic dark:text-slate-400">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="clock-time" />
        <ModuleProgress moduleSlug="clock-time" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <h3 className="m-0 text-lg font-bold">What you&apos;ll walk out with</h3>
        </div>
        <p className="mb-3 text-sm text-slate-700 dark:text-slate-300">
          A working mental model of time in distributed systems, why &quot;just use a timestamp&quot; is the source of more outages than people care to admit, and what to reach for instead.
        </p>
        <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Why NTP-synced wall clocks still drift by tens of milliseconds (and sometimes go backwards)</li>
          <li>Lamport timestamps: total order from causality, and what they can&apos;t tell you</li>
          <li>Vector clocks: detecting concurrent updates so you can resolve them</li>
          <li>Hybrid Logical Clocks (HLC) and Spanner&apos;s TrueTime, the closest thing to honest time at scale</li>
        </ul>
      </section>

      <Checkpoint moduleSlug="clock-time" id="wallclock" title="Part 1 · Why wall clocks lie" xp={25}>

        <h2>The thing nobody warned you about</h2>
        <p>
          You&apos;ve probably written code like <code>if (eventA.timestamp &lt; eventB.timestamp)</code> and assumed that meant A happened first. In a single-process, single-machine world, that&apos;s mostly fine. The moment two machines are involved, that line of code is a bug.
        </p>
        <p>
          Wall clocks, <code>System.currentTimeMillis()</code>, <code>time.time()</code>, <code>Date.now()</code>, read from the OS, which gets time from NTP, which slews and steps the clock to keep it close to UTC. Even on well-managed servers, NTP-synced clocks routinely disagree by 10–100ms. Under load, virtualized, or with bad NTP peers, they can disagree by seconds. And clocks can go <em>backwards</em>{" "}when NTP steps them.
        </p>

        <Callout variant="warn" title="Real failure modes from real outages">
          <ul className="m-0">
            <li><strong>Cloudflare, 2017:</strong>{" "}a leap second caused timestamps to go backwards; some services returned negative durations and panicked.</li>
            <li><strong>Cassandra last-write-wins:</strong>{" "}two writes on different coordinators with skewed clocks, the &quot;newer&quot; write loses because its timestamp is older.</li>
            <li><strong>JWT expiry:</strong>{" "}issuer&apos;s clock is 30s ahead of verifier&apos;s, every newly issued token looks expired for half a minute.</li>
          </ul>
        </Callout>

        <h2>Two clocks: monotonic vs wall</h2>
        <p>
          Every OS gives you two clocks. They serve different purposes and confusing them is its own bug class.
        </p>
        <ul>
          <li><strong>Wall clock</strong> (<code>currentTimeMillis</code>): meant to track real-world time. Can jump forward, jump backward, slew, leap-second. Use for: logs, scheduling, &quot;when did this happen.&quot; Never use for: measuring durations.</li>
          <li><strong>Monotonic clock</strong> (<code>nanoTime</code>): never goes backward, never jumps. Has no relation to wall time, only useful for measuring elapsed time within a single process. Use for: timeouts, rate limiting, latency measurement. Never use for: anything across machines.</li>
        </ul>

        <Callout variant="spring" title="The monotonic-clock rule">
          <p className="m-0">If your code computes <code>endTime - startTime</code>, both should come from a monotonic clock. If your code asks &quot;is this expired?&quot; or &quot;when did this happen?&quot;, that&apos;s wall clock, and now you have a distributed-systems problem.</p>
        </Callout>

        <h2>Clock skew bounds you should memorize</h2>
        <p>
          You don&apos;t need to know exact numbers, you need to know the <em>order of magnitude</em>, because it determines what you can and can&apos;t safely do with timestamps.
        </p>
        <ul>
          <li><strong>Same datacenter, well-synced NTP:</strong>{" "}typically under 1ms skew. Still not zero.</li>
          <li><strong>Cross-region cloud:</strong> 10–50ms is normal. Spikes to hundreds during NTP rebalancing.</li>
          <li><strong>Mobile clients:</strong>{" "}arbitrary. Users set their phone clocks. Trust nothing.</li>
          <li><strong>VM clocks under host pressure:</strong>{" "}can drift seconds; some hypervisors pause guests entirely.</li>
        </ul>
        <p>
          The practical lesson: <strong>never use wall-clock timestamps to order events from different machines.</strong>{" "}If you need an order, you need a different tool.
        </p>

        <Quiz
          question="Two services in the same Kubernetes cluster log events with currentTimeMillis. Service A logs eventA at t=1000, Service B logs eventB at t=999. Which event happened first?"
          options={[
            { label: "eventB, because 999 is less than 1000.", correct: false, explanation: "You cannot conclude that. The timestamps come from different clocks that may disagree by milliseconds." },
            { label: "eventA, because the log says so.", correct: false, explanation: "The log says A's clock read 1000 and B's clock read 999. That tells you nothing about real ordering." },
            { label: "You can't tell from these timestamps alone.", correct: true, explanation: "Without a logical clock or a causality link (e.g., A's request triggered B), wall clocks across machines can't be compared at millisecond resolution." },
            { label: "Whichever has the smaller process ID is first.", correct: false, explanation: "Process IDs have nothing to do with time. This would be a tiebreaker on a logical clock, not a real answer." },
          ]}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Wall clocks lie. Monotonic clocks tell the truth, but only locally. Across machines, raw timestamps are not a basis for ordering."
          points={[
            { takeaway: "Two clocks, two purposes", detail: "Wall clock for 'when did this happen', monotonic for 'how long did this take'. Never the reverse." },
            { takeaway: "NTP doesn't make clocks equal", detail: "Even well-synced clusters disagree by milliseconds; cross-region by tens of ms; mobile by anything." },
            { takeaway: "Last-write-wins is dangerous", detail: "Any system that resolves conflicts by timestamp is one clock skew event away from silently losing writes." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="clock-time" id="logical" title="Part 2 · Logical clocks: Lamport and vectors" xp={25}>

        <h2>Lamport&apos;s insight: forget real time, track causality</h2>
        <p>
          In 1978, Leslie Lamport asked a sharper question. Forget what time it &quot;really&quot; is. What we actually care about is: did event A causally influence event B? If yes, A happened before B. If neither caused the other, they are concurrent, and any ordering between them is arbitrary anyway.
        </p>
        <p>
          He defined a <strong>happens-before</strong>{" "}relation (written <code>a → b</code>):
        </p>
        <ul>
          <li>If <code>a</code> and <code>b</code> are on the same process and <code>a</code> comes first, then <code>a → b</code>.</li>
          <li>If <code>a</code> is &quot;send message m&quot; and <code>b</code> is &quot;receive m&quot;, then <code>a → b</code>.</li>
          <li>Transitive: if <code>a → b</code> and <code>b → c</code>, then <code>a → c</code>.</li>
        </ul>
        <p>
          Anything else is <em>concurrent</em>. Concurrent events have no &quot;true&quot; order, and pretending they do is where wall-clock systems get into trouble.
        </p>

        <h2>The Lamport clock algorithm</h2>
        <p>
          Each process keeps a single integer counter <code>L</code>. Three rules:
        </p>
        <ol>
          <li>Before any local event, increment: <code>L = L + 1</code>.</li>
          <li>When sending a message, attach the current <code>L</code>.</li>
          <li>On receive, set <code>L = max(L, L_msg) + 1</code>.</li>
        </ol>
        <p>
          The guarantee: if <code>a → b</code>, then <code>L(a) &lt; L(b)</code>. Note the direction, the converse is not true. Two events with <code>L(x) &lt; L(y)</code> may be concurrent. Lamport gives you a <em>consistent total order</em>, but it doesn&apos;t let you detect concurrency.
        </p>

        <Mermaid chart={happensBeforeDiagram} />

        <CodeBlock lang="java" caption="Lamport clock, the whole thing fits on a screen">{`public final class LamportClock {
    private long counter = 0;

    /** Call before any local event you want to timestamp. */
    public synchronized long tick() {
        return ++counter;
    }

    /** Call when sending; attach this value to the message. */
    public synchronized long onSend() {
        return ++counter;
    }

    /** Call on receive with the timestamp from the message. */
    public synchronized long onReceive(long msgTimestamp) {
        counter = Math.max(counter, msgTimestamp) + 1;
        return counter;
    }
}`}</CodeBlock>

        <Callout variant="insight" title="Tiebreaker: total order from a partial one">
          <p className="m-0">Lamport timestamps alone aren&apos;t unique, two events on different processes can share a counter value. The standard fix: order by <code>(L, processId)</code>. Now every event has a unique total order, and that order respects causality. This is exactly how Cassandra orders writes within a partition (last-write-wins by <code>(timestamp, nodeId)</code>), and exactly why clock skew hurts so much there.</p>
        </Callout>

        <h2>Vector clocks: when you need to know &quot;concurrent&quot;</h2>
        <p>
          Lamport gives you order. Vector clocks give you <em>concurrency detection</em>. Each process keeps a vector <code>V</code> with one slot per process. Rules:
        </p>
        <ol>
          <li>Local event: increment own slot, <code>V[self]++</code>.</li>
          <li>On send, attach the whole vector.</li>
          <li>On receive, set <code>V[i] = max(V[i], V_msg[i])</code> for every <code>i</code>, then increment own slot.</li>
        </ol>
        <p>
          Compare vectors element-wise. <code>V_a ≤ V_b</code> iff every slot of <code>V_a</code> is <code>≤</code> the corresponding slot of <code>V_b</code>. Then:
        </p>
        <ul>
          <li><code>V_a &lt; V_b</code> (strictly less in at least one slot): <code>a → b</code>.</li>
          <li><code>V_b &lt; V_a</code>: <code>b → a</code>.</li>
          <li>Neither: <code>a</code> and <code>b</code> are <strong>concurrent</strong>. They diverged.</li>
        </ul>

        <Callout variant="info" title="Where vector clocks actually ship">
          <p className="m-0">Dynamo and Riak used vector clocks (Riak still does) to detect divergent versions of the same key after partition. When you read, you might get back multiple sibling values with different vectors, your application code resolves them (e.g., shopping cart union). Cassandra dropped vector clocks in favor of last-write-wins because the merge complexity wasn&apos;t worth it for their target workloads. The tradeoff is real: vector clocks are honest about concurrency, but they push merge logic to the application.</p>
        </Callout>

        <h2>The cost: vectors grow with the cluster</h2>
        <p>
          A vector clock has one slot per process that&apos;s ever participated. In a fixed-size cluster of 5 nodes, that&apos;s nothing. In a system where clients are processes (think every browser tab), vectors balloon. Production systems use tricks: <strong>pruning</strong> (drop stale slots), <strong>dotted version vectors</strong> (track only causally-relevant entries), or fall back to Lamport timestamps when concurrency detection isn&apos;t worth the bytes.
        </p>

        <Quiz
          question="In a Riak-style system, two clients write different values to the same key during a network partition. After healing, what does the system do?"
          options={[
            { label: "Picks the value with the higher wall-clock timestamp.", correct: false, explanation: "That's last-write-wins, what Cassandra does, but it silently drops one write. Riak's vector clocks specifically avoid this." },
            { label: "Returns both values as siblings; the app resolves the conflict on read.", correct: true, explanation: "Vector clocks detect that the two writes are concurrent (neither causally precedes the other), so the system stores both as siblings and lets the application merge them." },
            { label: "Rejects the second write to maintain consistency.", correct: false, explanation: "During a partition the two clients can't see each other's writes, there's no way to reject one. Both succeed locally; conflict surfaces at heal time." },
            { label: "Serializes the writes through a leader to prevent the conflict.", correct: false, explanation: "Riak is leaderless precisely so writes don't block on a single node. The price is that conflicts can happen and need resolution." },
          ]}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Lamport gives you a consistent total order built from causality alone. Vector clocks go further and detect concurrent updates. Both ignore wall time entirely, and that's the point."
          points={[
            { takeaway: "Lamport: one counter, total order", detail: "If a → b then L(a) < L(b). Cheap, simple, can't detect concurrency." },
            { takeaway: "Vector clocks: per-process slots, partial order", detail: "Detects concurrent updates so the application can merge. Pays in vector size." },
            { takeaway: "Picked by the conflict-resolution model", detail: "LWW systems use Lamport-ish timestamps; AP merge-on-read systems use vector clocks." },
          ]}
        />

      </Checkpoint>

      <Checkpoint moduleSlug="clock-time" id="hybrid" title="Part 3 · Hybrid time: HLC and TrueTime" xp={25}>

        <h2>The gap logical clocks can&apos;t fill</h2>
        <p>
          Logical clocks are great at &quot;what caused what.&quot; They are terrible at &quot;show me everything that happened in the last 5 minutes.&quot; You can&apos;t look at a Lamport timestamp and know how it relates to UTC. For debugging, audit logs, snapshots, and consistent reads at a wall-clock time, you need something tied to physical time.
        </p>
        <p>
          So: can we get the causality guarantees of Lamport <em>and</em>{" "}stay close to wall time? Two answers ship in production: HLC (anyone can use it) and TrueTime (Google built specialized hardware).
        </p>

        <h2>HLC: Hybrid Logical Clocks</h2>
        <p>
          An HLC timestamp is a pair <code>(physicalTime, logicalCounter)</code>. The physical part is your wall clock; the logical part is the Lamport-style tiebreaker. The update rule keeps the physical part close to wall time but never lets it go backwards relative to received messages.
        </p>
        <p>
          On a local event, take <code>max(localPhysicalTime, lastHLC.physical)</code>; if it&apos;s strictly greater, reset logical to 0; if equal, increment logical. On receive, take <code>max</code> of local time, last HLC physical, and message HLC physical, with the appropriate logical bump. The result: HLC timestamps are bounded close to wall-clock time but still respect causality the way Lamport does.
        </p>

        <CodeBlock lang="java" caption="HLC update on local event (sketch)">{`public synchronized HLCTimestamp tickLocal() {
    long wall = System.currentTimeMillis();
    long newPhysical = Math.max(last.physical, wall);
    int newLogical = (newPhysical == last.physical) ? last.logical + 1 : 0;
    last = new HLCTimestamp(newPhysical, newLogical);
    return last;
}

public synchronized HLCTimestamp tickReceive(HLCTimestamp msg) {
    long wall = System.currentTimeMillis();
    long newPhysical = Math.max(Math.max(last.physical, msg.physical), wall);
    int newLogical;
    if (newPhysical == last.physical && newPhysical == msg.physical) {
        newLogical = Math.max(last.logical, msg.logical) + 1;
    } else if (newPhysical == last.physical) {
        newLogical = last.logical + 1;
    } else if (newPhysical == msg.physical) {
        newLogical = msg.logical + 1;
    } else {
        newLogical = 0;
    }
    last = new HLCTimestamp(newPhysical, newLogical);
    return last;
}`}</CodeBlock>

        <Callout variant="insight" title="Why HLC won the open-source race">
          <p className="m-0">CockroachDB, YugabyteDB, MongoDB&apos;s logical clock, all use HLC or close variants. The pitch is irresistible: works with normal NTP-synced clocks, gives you causality, timestamps look like wall time, and a comparison is just a pair compare. The only requirement is that your clock skew stays bounded; CockroachDB caps the bound at 500ms by default and refuses to accept transactions outside the window.</p>
        </Callout>

        <h2>TrueTime: when you can spend on atomic clocks</h2>
        <p>
          Spanner takes a different approach. Instead of pretending wall clocks are exact, Google built infrastructure that returns a <em>bounded interval</em>: <code>now()</code> returns <code>[earliest, latest]</code> and guarantees the true time is somewhere in there. The interval width is typically 1–7ms, achieved with GPS receivers and atomic clocks in every datacenter.
        </p>
        <p>
          That &quot;interval&quot; is the whole trick. To commit a transaction at time <code>T</code>, Spanner picks <code>T = now().latest</code> and then <strong>waits out the uncertainty</strong>, sleeps until <code>now().earliest &gt; T</code>. After that wait, every machine on the planet agrees the transaction&apos;s timestamp is in the past. This gives Spanner external consistency: if transaction A commits before transaction B starts (in real time), A&apos;s timestamp is smaller than B&apos;s.
        </p>

        <Callout variant="warn" title="The cost is real">
          <p className="m-0">TrueTime&apos;s commit wait adds latency proportional to clock uncertainty, typically 5–10ms per write transaction. Google considers that worth it for globally consistent ACID. Most teams without an atomic-clock budget can&apos;t replicate TrueTime; they get HLC, which gives most of the benefit for none of the hardware. Cockroach&apos;s &quot;serializable but not externally consistent&quot; is the realistic tradeoff.</p>
        </Callout>

        <h2>Picking the right clock for the job</h2>

        <ClassifyChallenge
          title="Match the time mechanism to the job"
          prompt="You're choosing a time mechanism. Match each scenario to the right tool."
          buckets={[
            { id: "monotonic", label: "Monotonic clock", color: "emerald" },
            { id: "lamport", label: "Lamport timestamps", color: "indigo" },
            { id: "vector", label: "Vector clocks", color: "amber" },
            { id: "hlc", label: "HLC", color: "sky" },
            { id: "truetime", label: "TrueTime / commit-wait", color: "violet" },
          ]}
          items={[
            { id: "i1", label: "Measure how long an HTTP handler takes inside one process.", answer: "monotonic", explanation: "Durations in one process are exactly what monotonic clocks are for, no jumps, no skew, just elapsed time." },
            { id: "i2", label: "Order writes within a Cassandra partition under last-write-wins.", answer: "lamport", explanation: "Cassandra orders by (timestamp, nodeId), that's a Lamport-style total order out of a partial one." },
            { id: "i3", label: "Detect that two replicas of a shopping cart diverged during a partition.", answer: "vector", explanation: "You need to know two writes are concurrent (neither caused the other). Only vector clocks give you that." },
            { id: "i4", label: "Stamp transactions in a distributed SQL database that needs causality and human-readable times.", answer: "hlc", explanation: "HLC is the de facto answer here, wall-clock-shaped values that respect happens-before. CockroachDB, Yugabyte, Mongo all use it." },
            { id: "i5", label: "Provide externally consistent timestamps across continents for a globally-replicated bank ledger.", answer: "truetime", explanation: "External consistency at global scale is what TrueTime + commit-wait was built for. The 5–10ms wait is the price." },
            { id: "i6", label: "Decide which of two concurrent writes to a Riak key are siblings vs ancestors.", answer: "vector", explanation: "Riak's whole sibling model is built on vector clocks comparing element-wise to detect concurrency." },
            { id: "i7", label: "Implement a per-request timeout in a gRPC client.", answer: "monotonic", explanation: "Timeouts measure 'how long since we started', strictly local, strictly elapsed, strictly monotonic." },
          ]}
        />

        <h2>The decision tree, compressed</h2>
        <ul>
          <li><strong>Within one process:</strong>{" "}monotonic for durations, wall for &quot;when&quot;. Don&apos;t overthink it.</li>
          <li><strong>Across machines, you need ordering only:</strong>{" "}Lamport. Cheap, simple, total order from causality.</li>
          <li><strong>Across machines, you need to detect concurrent updates:</strong>{" "}vector clocks. Pay the size cost.</li>
          <li><strong>You need timestamps that look like wall time but respect causality:</strong>{" "}HLC. Default for new distributed databases.</li>
          <li><strong>You need external consistency at global scale and have the budget:</strong>{" "}TrueTime, or accept the latency of a single global Raft group.</li>
        </ul>

        <Quiz
          question="CockroachDB rejects a transaction with the error 'clock uncertainty too high'. What is most likely happening?"
          options={[
            { label: "The cluster has no leader and writes are halted.", correct: false, explanation: "That would surface as a different error (no quorum, leader unavailable). Clock uncertainty is specifically about wall-clock skew." },
            { label: "A node's wall clock has drifted beyond the configured maximum offset.", correct: true, explanation: "CockroachDB's HLC requires bounded clock skew, typically 500ms. A node whose clock drifts beyond that can't safely participate, so it's fenced off until NTP brings it back." },
            { label: "The query plan is too complex.", correct: false, explanation: "Plan complexity has nothing to do with clock uncertainty." },
            { label: "Vector clocks have grown too large.", correct: false, explanation: "Cockroach uses HLC, not vector clocks. The sizing concern doesn't apply." },
          ]}
        />

        <PartRecap
          title="Part 3 recap"
          gist="HLC is the practical default, causality plus near-wall-time on commodity hardware. TrueTime is the gold standard, paid for in atomic clocks and commit-wait latency."
          points={[
            { takeaway: "HLC = wall clock + Lamport tiebreaker", detail: "Stays bounded near real time, never goes backwards relative to causality. Default for CockroachDB, Yugabyte, Mongo." },
            { takeaway: "TrueTime returns an interval", detail: "Spanner waits out uncertainty before committing, buys external consistency at the cost of 5-10ms per write." },
            { takeaway: "Bounded skew is a contract", detail: "HLC systems fence off nodes whose clocks drift past the bound. Your NTP setup is part of correctness, not just operations." },
          ]}
        />

      </Checkpoint>

      <section className="not-prose my-12 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:border-indigo-800 dark:from-indigo-950/40 dark:to-purple-950/40">
        <h3 className="mb-2 text-lg font-bold">Module wrap</h3>
        <p className="mb-0 text-sm text-slate-700 dark:text-slate-300">
          Time in distributed systems is a design choice, not a fact. Pick the weakest clock that solves your problem, monotonic if it&apos;s local, Lamport if you only need order, vector if you need to detect divergence, HLC if you want both causality and human-readable times, TrueTime if you&apos;re Google. Most outages in this space come from reaching for wall-clock timestamps and hoping NTP did its job. It rarely did.
        </p>
      </section>

        <ModuleNav courseId="system-design" currentSlug="clock-time" />
    </article>
  );
}
