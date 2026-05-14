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
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "why-hard", title: "Why consensus is hard" },
  { id: "raft", title: "Raft from scratch" },
  { id: "production", title: "Consensus in production" },
];

const raftStateMachine = `stateDiagram-v2
  [*] --> Follower
  Follower --> Candidate: election timeout fires
  Candidate --> Leader: wins majority of votes
  Candidate --> Follower: discovers higher term or other leader
  Candidate --> Candidate: split vote, new election
  Leader --> Follower: discovers higher term
  Leader --> [*]: crash`;

export default function Page() {
  const mod = getModuleBySlug("consensus")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="consensus" />
        <ModuleProgress moduleSlug="consensus" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🗳️</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          Raft, end to end, in enough depth to explain it on a whiteboard. Plus the senior judgement: when consensus is the right tool, when it absolutely is not, and what real systems built on top of it actually do for you.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>Why consensus is mathematically hard (FLP impossibility) and why we run it anyway</li>
          <li>Raft&apos;s three sub-problems: leader election, log replication, safety</li>
          <li>Quorum math and the odd-number rule (3, 5, 7) — what each cluster size buys you</li>
          <li>What etcd, Consul, ZooKeeper, and Kafka&apos;s controller actually use consensus for — and what they don&apos;t</li>
        </ul>
      </section>

      <section>
        <h2>Three machines, no shared clock, one decision</h2>
        <p>
          Consensus is the problem of getting a group of machines to agree on a single value, even when some of them might crash, the network might drop messages, and nobody has a perfect global clock. That&apos;s it. That&apos;s the whole problem statement, and decades of distributed systems research are essentially attempts to solve it efficiently and safely.
        </p>
        <p>
          You&apos;ll often hear &quot;just use Raft&quot; as casually as &quot;just use a hashmap.&quot; That breeziness hides the fact that consensus is one of the deepest results in distributed systems. The good news: you don&apos;t need to invent it. The systems you reach for — etcd, Consul, ZooKeeper, CockroachDB&apos;s replication, Kafka&apos;s KRaft controller — have already solved it. Your job is to know what they guarantee, what they cost, and where to use them.
        </p>
      </section>

      <Checkpoint moduleSlug="consensus" id="why-hard" title="Part 1 · Why consensus is hard" xp={25}>
        <h2>The problem, precisely</h2>
        <p>
          A consensus algorithm needs three properties:
        </p>
        <ul>
          <li><strong>Agreement:</strong> all non-faulty nodes decide on the same value.</li>
          <li><strong>Validity:</strong> the value decided was proposed by some node (not invented out of thin air).</li>
          <li><strong>Termination:</strong> all non-faulty nodes eventually decide.</li>
        </ul>
        <p>
          Sounds simple. The trouble is that the network can lose messages, machines can crash, and you can&apos;t tell the difference between &quot;dead&quot; and &quot;slow.&quot; A node that didn&apos;t reply might come back tomorrow with a different opinion.
        </p>

        <h3>FLP impossibility — the bad news</h3>
        <p>
          In 1985, Fischer, Lynch, and Paterson proved that in a fully asynchronous network where even one node can crash, no deterministic algorithm can guarantee all three properties. Either you can&apos;t guarantee termination, or you can&apos;t guarantee agreement. There is no clean solution.
        </p>
        <p>
          That&apos;s a real theorem and it&apos;s a real problem. So why do we use Raft and Paxos? Because real networks are not fully asynchronous — they&apos;re mostly synchronous most of the time. Real consensus algorithms make a softer guarantee: <strong>they preserve safety always (never decide two different values), and they make progress whenever the network is well-behaved enough.</strong> When the network goes haywire, they stall. They don&apos;t lie.
        </p>

        <Callout variant="insight" title="Safety vs liveness">
          <p className="m-0">Every consensus algorithm splits its guarantees into two camps. <strong>Safety</strong> properties (&quot;we never agree on conflicting values&quot;) hold under any network conditions, no matter how bad. <strong>Liveness</strong> properties (&quot;we eventually decide&quot;) require some assumption about the network — usually &quot;messages eventually get through, eventually.&quot; FLP says you can&apos;t guarantee both without that liveness assumption. Raft and Paxos both pick safety-always, liveness-when-network-is-OK.</p>
        </Callout>

        <h3>The two failure modes you have to handle</h3>
        <p>
          When designing a consensus algorithm, you assume nodes can fail in two ways:
        </p>
        <ul>
          <li><strong>Crash failures:</strong> a node stops responding. It might come back later with the state it had at crash time. Raft and Paxos handle this.</li>
          <li><strong>Byzantine failures:</strong> a node lies — sends conflicting messages to different peers, fakes responses, actively misleads. PBFT and blockchain protocols handle this. Raft and Paxos do not.</li>
        </ul>
        <p>
          Inside a data center, you usually trust your nodes — they&apos;re yours. Crash-fault-tolerant consensus (Raft, Paxos) is the right tool. Across mutually-distrusting parties (cryptocurrency, public consortia), you need Byzantine-fault-tolerant consensus, which is much more expensive. We&apos;ll stay in crash-fault-tolerant land for the rest of this module.
        </p>

        <h3>The quorum trick</h3>
        <p>
          Here&apos;s the move that makes consensus tractable: <strong>require a majority for every decision.</strong> If decisions need a majority and a majority is at least N/2 + 1 nodes, then any two majorities must overlap by at least one node. That overlap is what prevents two conflicting decisions from being made — there&apos;s always at least one node who participated in both quorums and would have rejected the second one.
        </p>
        <p>
          A 3-node cluster needs 2 nodes to agree (tolerates 1 failure). A 5-node cluster needs 3 (tolerates 2). A 7-node cluster needs 4 (tolerates 3). Notice the pattern: <strong>you tolerate ⌊(N-1)/2⌋ failures.</strong>
        </p>

        <h3>Why you always run an odd number</h3>
        <p>
          A 4-node cluster needs 3 to agree. So you tolerate 1 failure — same as a 3-node cluster, but with an extra machine to maintain. A 6-node cluster needs 4 to agree, tolerating 2 — same as a 5-node cluster. Even-numbered clusters give you no additional fault tolerance for the extra node, and they&apos;re more likely to split-vote during elections. <strong>Always run 3, 5, or 7 nodes.</strong> 9+ is rare in practice — the latency cost of replicating to that many peers usually outweighs the marginal durability gain.
        </p>

        <Callout variant="warn" title="The 2-node anti-pattern">
          <p className="m-0">A 2-node consensus cluster needs both nodes for every decision. That means it&apos;s strictly worse than a single node — any failure brings it down, and the coordination cost is higher. People build 2-node setups thinking &quot;two is more redundant than one,&quot; but for consensus, two means zero fault tolerance with extra latency. If you can&apos;t afford 3 nodes, run 1 and accept that it&apos;s not really consensus.</p>
        </Callout>

        <Quiz
          question="A team is building a coordination service and wants to deploy a 4-node Raft cluster 'for extra redundancy.' What's the architectural critique?"
          options={[
            { label: "A 4-node cluster tolerates only 1 failure (same as 3 nodes), but pays for an extra node and is more prone to split votes during elections. Run 3 or 5, never 4.", correct: true, explanation: "Right. Quorum is floor(N/2)+1: N=3→quorum 2 (tolerates 1 failure), N=4→quorum 3 (tolerates 1 failure), N=5→quorum 3 (tolerates 2 failures). The 4th node buys nothing for fault tolerance and increases coordination latency." },
            { label: "4 nodes is fine — it tolerates 2 failures by majority, which is one more than 3 nodes.", explanation: "Majority of 4 is 3, not 2. Losing 2 of 4 leaves 2 alive, which isn't a majority. So 4 nodes still tolerates only 1 failure." },
            { label: "Even-numbered clusters can't run Raft at all — the protocol assumes odd N.", explanation: "Raft works mathematically for any N. The criticism is that even N gives no extra fault tolerance over N-1, not that the protocol fails." },
            { label: "Consensus on 4 nodes requires Paxos, not Raft.", explanation: "Both algorithms work for any cluster size. The cluster size question is about quorum economics, not protocol choice." },
          ]}
          hint="What does majority-of-N actually buy you for fault tolerance?"
          xp={7}
        />

        <Quiz
          question="During a network partition, your 5-node Raft cluster splits into a group of 2 and a group of 3. What happens?"
          options={[
            { label: "The group of 3 is the majority partition: it can elect a leader and keep accepting writes. The group of 2 cannot make progress — it can't form a quorum and will reject any client requests.", correct: true, explanation: "Exactly. Raft preserves safety by requiring majority quorum for every decision. The minority side stalls until the partition heals; the majority side keeps running. This is the canonical CP behavior." },
            { label: "Both groups elect a leader and accept writes. They reconcile when the partition heals.", explanation: "That would be split-brain — exactly what consensus prevents. The minority side cannot form a quorum and refuses to elect a leader." },
            { label: "Both groups stop accepting writes until the partition heals.", explanation: "The majority side stays operational. That's the point of running 5 nodes — you tolerate up to 2 failures (or partitions) and still serve writes." },
            { label: "The leader's side wins regardless of which side has more nodes.", explanation: "The leader has no power without a quorum. If the leader is in the minority, it steps down (or its writes never commit) and a new leader is elected on the majority side." },
          ]}
          hint="Quorum is majority. What can a minority partition do?"
          xp={7}
        />

        <PartRecap
          title="Part 1 recap"
          gist="Consensus is hard because of FLP impossibility, but practical algorithms preserve safety always and make progress when the network is well-behaved. Quorums and odd cluster sizes do most of the work."
          points={[
            { takeaway: "FLP says you can't have it all in async networks", detail: "Agreement, validity, termination — pick what you guarantee under what assumptions. Raft and Paxos guarantee safety always, liveness when the network behaves." },
            { takeaway: "Crash-fault-tolerant, not Byzantine", detail: "Raft and Paxos assume nodes crash but don't lie. Inside a trusted data center, that's the right model. Across mutually-distrusting parties you need PBFT-class algorithms." },
            { takeaway: "Quorums prevent conflicting decisions", detail: "Majority of N nodes must agree. Any two majorities overlap, so conflicting decisions are mathematically impossible." },
            { takeaway: "Run 3, 5, or 7 — never 4 or 6", detail: "Even N gives the same fault tolerance as N-1. Always odd. 5 is the production sweet spot for most coordination services." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="consensus" id="raft" title="Part 2 · Raft from scratch" xp={35}>
        <h2>Why Raft instead of Paxos</h2>
        <p>
          Paxos came first (Leslie Lamport, 1989, published 1998). It is mathematically beautiful and famously impossible to teach. Engineers reading the original paper find it correct and incomprehensible at the same time. Multi-Paxos — the version you actually run — is a sprawl of optimizations that nobody describes the same way twice.
        </p>
        <p>
          Raft (Ongaro and Ousterhout, 2014) is Paxos&apos;s pedagogical replacement. It solves the same problem and is provably equivalent in safety, but it was designed deliberately to be understandable. The trick: split consensus into three independent sub-problems, each with a clean solution.
        </p>
        <ul>
          <li><strong>Leader election:</strong> exactly one node is the leader at any time.</li>
          <li><strong>Log replication:</strong> the leader appends entries to a log, then replicates to followers.</li>
          <li><strong>Safety:</strong> a small set of rules that prevent committed entries from ever being lost.</li>
        </ul>

        <h3>The state machine</h3>
        <p>
          Every Raft node is in one of three states: <strong>Follower</strong> (passive — accepts writes from a leader), <strong>Candidate</strong> (running an election), or <strong>Leader</strong> (handling client requests, replicating to followers).
        </p>
        <Mermaid chart={raftStateMachine} />
        <p>
          The transitions are driven entirely by timers and messages. A follower with no leader contact for too long becomes a candidate. A candidate with majority votes becomes a leader. Any node that sees a message from a higher term immediately demotes itself to follower.
        </p>

        <h3>Terms — Raft&apos;s logical clock</h3>
        <p>
          Raft tags every operation with a <strong>term number</strong>, which is a monotonically increasing integer. Every election starts a new term. Every message includes the sender&apos;s term. The rule: <strong>if you see a message from a higher term than yours, accept that term and step down.</strong> This is what prevents zombie leaders. A leader from term 4 that was partitioned away comes back, sees a message from term 7, and immediately gives up its leadership claim.
        </p>

        <h3>Leader election — the dance</h3>
        <p>
          Each follower has a randomized election timeout, typically 150–300ms. While receiving heartbeats from a leader, the timer resets. If the timer expires without a heartbeat:
        </p>
        <ol>
          <li>The follower increments its term and becomes a candidate.</li>
          <li>It votes for itself and sends <code>RequestVote</code> RPCs to all peers.</li>
          <li>Each peer votes yes if (a) it hasn&apos;t already voted in this term, and (b) the candidate&apos;s log is at least as up-to-date as the peer&apos;s.</li>
          <li>If the candidate gets a majority, it becomes leader and starts sending heartbeats.</li>
          <li>If it sees a leader for the same or higher term, it steps down to follower.</li>
          <li>If the election times out (split vote — two candidates simultaneously), it starts a new election with a higher term.</li>
        </ol>
        <p>
          The <strong>randomized timeout</strong> is the key trick that prevents endless split votes. If two followers time out simultaneously and both run for office, neither gets a majority, and they both retry — but with a new random timeout, so one of them is very likely to start its next election earlier and run uncontested.
        </p>

        <CodeBlock lang="java" caption="Sketch of a Raft follower's election timeout (illustrative — do not run consensus in your service)">{`// Real production code lives in libraries (jraft, copycat) — never roll your own.
// This is just the shape so you can read the protocol on a whiteboard.

public class RaftNode {
  private volatile NodeState state = NodeState.FOLLOWER;
  private volatile long currentTerm = 0;
  private volatile String votedFor = null;
  private volatile long lastHeardFromLeader = System.currentTimeMillis();

  // Randomized election timeout: 150-300ms, redrawn every term.
  private long electionTimeoutMs = 150 + ThreadLocalRandom.current().nextLong(150);

  public void onElectionTimerTick() {
    long sinceLeader = System.currentTimeMillis() - lastHeardFromLeader;
    if (state == NodeState.FOLLOWER && sinceLeader > electionTimeoutMs) {
      becomeCandidate();
    }
  }

  private void becomeCandidate() {
    state = NodeState.CANDIDATE;
    currentTerm++;
    votedFor = nodeId;            // vote for self
    int votes = 1;
    for (Peer p : peers) {
      if (p.requestVote(currentTerm, lastLogIndex(), lastLogTerm())) {
        votes++;
      }
    }
    if (votes > peers.size() / 2) {
      becomeLeader();
    } else {
      // Lost the election. Reset timer with new randomized timeout.
      electionTimeoutMs = 150 + ThreadLocalRandom.current().nextLong(150);
      state = NodeState.FOLLOWER;
    }
  }
}`}</CodeBlock>

        <h3>Log replication — the AppendEntries machinery</h3>
        <p>
          Once a leader is elected, it serves all client writes. Each write becomes a log entry: <code>(term, index, command)</code>. The leader appends to its own log, then sends <code>AppendEntries</code> RPCs to every follower. An entry is <strong>committed</strong> once a majority of nodes have it in their logs — including the leader.
        </p>
        <p>
          Once committed, the leader applies the entry to its state machine and tells clients the write succeeded. The leader also includes the latest committed index in subsequent heartbeats, so followers know which entries are safe to apply locally.
        </p>

        <h3>Log matching — the safety lemma</h3>
        <p>
          Two key invariants Raft maintains across all logs:
        </p>
        <ul>
          <li>If two logs contain an entry with the same index and term, that entry holds the same command.</li>
          <li>If two logs contain an entry with the same index and term, all preceding entries are identical too.</li>
        </ul>
        <p>
          The leader enforces this by including <code>(prevLogIndex, prevLogTerm)</code> in every <code>AppendEntries</code>. The follower rejects the call if its log doesn&apos;t match at that point. The leader then walks backward, finding where the logs diverge, and overwrites the follower&apos;s tail with its own entries. After this process, all logs are identical up through the committed index.
        </p>

        <Callout variant="info" title="Why 'committed' means majority, not all">
          <p className="m-0">An entry is committed once a majority of nodes have replicated it. That includes the leader. As long as the leader survives long enough to tell <em>any</em> single follower in the next majority, the entry will outlive any subsequent leader change. Waiting for all N nodes would mean a single slow node halts the cluster — defeating the whole purpose of fault tolerance.</p>
        </Callout>

        <h3>The election restriction — the safety jewel</h3>
        <p>
          The single rule that makes Raft safe: <strong>a candidate can only become leader if its log is at least as up-to-date as a majority of peers.</strong> &quot;Up-to-date&quot; is defined precisely: a log A is up-to-date with log B if A&apos;s last entry has a higher term than B&apos;s, or the same term and at least as high an index.
        </p>
        <p>
          This rule is what prevents committed entries from ever being lost. Suppose entry E is committed in term 4 — that means a majority replicated it. If a candidate in term 5 doesn&apos;t have E, it can&apos;t get a majority of votes (because at least one node in any majority did replicate E, and that node will refuse to vote for a less-current log). So any new leader in term 5 must already have E. Committed entries are durable across all subsequent leaders.
        </p>

        <Quiz
          question="Why does Raft use randomized election timeouts (150–300ms) instead of fixed ones?"
          options={[
            { label: "Randomization breaks symmetry: if all followers timed out together, they'd all become candidates simultaneously and split the vote forever. Random offsets make one candidate likely to start its election before others.", correct: true, explanation: "Right. The randomization is a deliberate design choice. Without it, any failure that causes synchronized timeouts (like a leader crash) would cause an endless split-vote storm. With it, one candidate's timer pops first and that candidate usually wins uncontested." },
            { label: "It distributes load evenly across the cluster.", explanation: "Election timeouts have nothing to do with load distribution; they're triggered only by leader absence." },
            { label: "Randomization makes the algorithm faster on average.", explanation: "It does help in the failure case, but the reason it's randomized is correctness (preventing split votes), not performance." },
            { label: "It prevents Byzantine attackers from predicting elections.", explanation: "Raft is crash-fault-tolerant, not Byzantine-fault-tolerant. The randomization is about coordinating honest followers, not defending against adversaries." },
          ]}
          hint="What goes wrong if multiple followers time out at exactly the same instant?"
          xp={8}
        />

        <Quiz
          question="A new leader is elected in term 7. It discovers its log has fewer entries than some followers had in term 6. What's the protocol's response?"
          options={[
            { label: "This shouldn't happen — Raft's election restriction guarantees a candidate cannot become leader unless its log is at least as up-to-date as a majority. The new leader is, by construction, current enough.", correct: true, explanation: "Exactly. The election restriction (a candidate's log must be at least as up-to-date as a majority of voters) prevents this scenario. Any committed entry from term 6 is in a majority of logs, and the new leader had to win a majority of votes — so it must have those entries." },
            { label: "The leader copies missing entries from followers and applies them.", explanation: "Raft is leader-driven. Followers never send log entries up to a leader; the leader is the source of truth. The protocol prevents the situation in the first place." },
            { label: "The leader steps down and lets a more current node win.", explanation: "Election restriction prevents the situation. There's no fallback step-down because it can't happen." },
            { label: "The cluster halts until a manual operator decides whose log is canonical.", explanation: "Manual intervention isn't part of Raft. The protocol guarantees by construction that committed entries survive every leader change." },
          ]}
          hint="What does the election restriction guarantee about a winning candidate's log?"
          xp={8}
        />

        <PartRecap
          title="Part 2 recap"
          gist="Raft splits consensus into three sub-problems — leader election, log replication, safety — each with a clean solution. The election restriction is the safety jewel that keeps committed entries alive across leader changes."
          points={[
            { takeaway: "Three states, driven by timers", detail: "Follower → Candidate (timeout) → Leader (majority vote). Any higher term seen demotes you back to follower. Terms are Raft's logical clock." },
            { takeaway: "Randomized timeouts break vote splits", detail: "150–300ms range. Without randomization, synchronized timeouts cause endless split votes; with it, one candidate's timer almost always pops first." },
            { takeaway: "AppendEntries enforces log matching", detail: "Leader includes prevLogIndex/prevLogTerm. Followers reject mismatches; leader walks back to the divergence point and overwrites. After convergence, all logs match through committed index." },
            { takeaway: "Election restriction guarantees safety", detail: "A candidate must be at least as up-to-date as a majority of voters to win. This guarantees any committed entry survives every leader change without coordination." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="consensus" id="production" title="Part 3 · Consensus in production" xp={30}>
        <h2>What real systems use consensus for</h2>
        <p>
          Knowing Raft on a whiteboard is one thing. Knowing where to use it — and where not to — is the senior judgement that matters more.
        </p>

        <h3>The five canonical use cases</h3>
        <ul>
          <li><strong>Leader election for stateful services.</strong> Kafka&apos;s controller, Postgres failover orchestration (Patroni), HDFS NameNode HA — all use a consensus service to decide who&apos;s in charge.</li>
          <li><strong>Service discovery and config.</strong> etcd, Consul, ZooKeeper — store a small amount of strongly-consistent metadata that every node in the cluster reads.</li>
          <li><strong>Distributed locks.</strong> ZooKeeper&apos;s ephemeral nodes, etcd&apos;s lease-based locks. Used sparingly because lock services are coordination bottlenecks.</li>
          <li><strong>Strongly-consistent KV / metadata stores.</strong> CockroachDB&apos;s replication, TiKV, FoundationDB — Raft per shard, not per cluster.</li>
          <li><strong>Cluster membership.</strong> &quot;Who&apos;s in the cluster?&quot; is itself a consensus problem when you&apos;re adding/removing nodes safely.</li>
        </ul>

        <h3>Real systems and what they actually run</h3>
        <ul>
          <li><strong>etcd:</strong> Raft. Used by Kubernetes for all cluster state. Typically 3 or 5 nodes, in a single region. Sub-millisecond reads from any member, single-digit-ms writes.</li>
          <li><strong>Consul:</strong> Raft. Service discovery + KV + health checks. Same shape as etcd, different feature surface.</li>
          <li><strong>ZooKeeper:</strong> ZAB (ZooKeeper Atomic Broadcast) — predates Raft, similar guarantees, different protocol. Used by Kafka (pre-KRaft), HBase, Solr.</li>
          <li><strong>Kafka KRaft:</strong> Raft replaced ZooKeeper as Kafka&apos;s metadata controller in 3.x+. Same algorithm, baked into Kafka itself instead of an external dependency.</li>
          <li><strong>CockroachDB / TiKV:</strong> Raft, but per-range (per-shard). A 1-petabyte cluster runs thousands of small Raft groups in parallel — each one for a small chunk of keys.</li>
          <li><strong>Spanner:</strong> Paxos per tablet. Plus TrueTime to coordinate across Paxos groups for global serializable transactions. Industrial-strength consensus at scale.</li>
        </ul>

        <Callout variant="warn" title="Consensus is not for data-plane traffic">
          <p className="m-0">A common architectural mistake: routing every user request through a consensus service. Consensus is expensive — every write involves a quorum round-trip. It&apos;s fine for cluster metadata (which changes occasionally) and disastrous for user traffic (which is constant). Use consensus for control-plane decisions (who&apos;s leader, what&apos;s the config) and let your data plane use the result without re-running consensus per request.</p>
        </Callout>

        <h3>The latency cost — real numbers</h3>
        <p>
          A single Raft write requires the leader to durably log the entry, then send it to followers, then wait for a majority to durably log it too. In a single AZ that&apos;s usually 1–5ms. Across AZs it climbs to 5–15ms. Across regions you&apos;re looking at 50–200ms per write because of cross-continent round-trips.
        </p>
        <p>
          Reads are cheaper but not free. A strongly-consistent read in Raft requires either a round-trip to confirm leadership (lease reads or read indexing) or routing through the leader. Followers can serve stale reads cheaply, but if you need linearizability you pay the round-trip.
        </p>

        <h3>When NOT to use consensus</h3>
        <ul>
          <li><strong>High-volume data path.</strong> Don&apos;t put consensus in the hot path of a 100k QPS service. Cache the result of any consensus decision and only re-consult on changes.</li>
          <li><strong>Across regions for write-heavy workloads.</strong> The latency cost stacks. Consensus across continents is fine for low-frequency metadata (Spanner&apos;s tablet metadata) but a disaster for per-request decisions.</li>
          <li><strong>When you actually want eventual consistency.</strong> If your workload tolerates eventual, you don&apos;t need to pay for consensus. Use a Dynamo-style replicated KV instead.</li>
          <li><strong>For a single-instance service.</strong> A leader-elect-among-one is just a single instance with extra steps. Run consensus only when you have at least 3 peers and a real fault-tolerance requirement.</li>
        </ul>

        <h3>Match the use case to the right consensus shape</h3>
        <ClassifyChallenge
          title="Match the use case to its consensus pattern"
          prompt="Pick the consensus shape that fits each workload best."
          buckets={[
            { id: "single-group", label: "Single Raft group (cluster-wide metadata)", color: "indigo" },
            { id: "many-groups", label: "Many Raft groups (sharded data)", color: "emerald" },
            { id: "no-consensus", label: "Not a consensus problem", color: "rose" },
          ]}
          items={[
            { id: "k8s-state", label: "Storing the desired state of a Kubernetes cluster (a few hundred MB, mostly read).", answer: "single-group", explanation: "Cluster metadata is small, low-write, and must be globally consistent. A single etcd Raft group is exactly the right tool." },
            { id: "user-shard", label: "Replicating a 100TB OLTP database where each user's data lives on one shard.", answer: "many-groups", explanation: "CockroachDB / TiKV pattern: thousands of small Raft groups, one per range. Single group can't handle the throughput; many groups parallelize the work." },
            { id: "kafka-leader", label: "Deciding which Kafka broker is the controller.", answer: "single-group", explanation: "KRaft uses a single Raft group for cluster metadata including controller election. Cluster-wide, infrequent decisions — the canonical single-group use case." },
            { id: "feed-cache", label: "Maintaining a per-user feed cache that tolerates 30 seconds of staleness.", answer: "no-consensus", explanation: "Eventual consistency is fine. Pay nothing for consensus you don't need. Use a Dynamo-style replicated KV or just async replication." },
            { id: "lock", label: "Brief distributed locks for at-most-one cron-job execution across a cluster.", answer: "single-group", explanation: "A small consensus group (etcd or ZooKeeper) is the standard. The lock is rare, must be globally agreed, and a single group handles the load comfortably." },
            { id: "session-state", label: "Read-your-writes session state for a 50k QPS web service.", answer: "no-consensus", explanation: "Session state for that QPS through consensus would be a latency disaster. Use sticky sessions, a fast cache (Redis), or session affinity at the load balancer." },
          ]}
        />

        <Callout variant="spring" title="Consensus from a Java service">
          <p className="m-0">Most Java services consume consensus rather than implement it. Spring Cloud apps point at Consul or etcd for service discovery and config; Spring Cloud Kubernetes reads from etcd via the Kubernetes API; Spring for Apache Kafka watches consumer-group state coordinated through Kafka&apos;s own KRaft controller. The right call is almost always to use a battle-tested consensus library (jraft, copycat) or — better — to point your service at an existing consensus service. Rolling your own Raft implementation is a 6-month tar pit.</p>
        </Callout>

        <Quiz
          question="Your team is designing a payments service. Someone proposes 'run Raft across all 50 service instances so every payment is committed by majority.' What's the architectural problem?"
          options={[
            { label: "Consensus across 50 nodes per request is wildly expensive (large quorum, many round-trips). Run consensus once for control-plane decisions, then let the data plane scale horizontally — usually with a smaller stateful core (a database with its own consensus) and stateless application instances around it.", correct: true, explanation: "Right. Consensus over 50 nodes per request would have brutal write latency and contention. The standard pattern: small Raft cluster for the durable state (database or coordination service), stateless service instances on top. The DB does the consensus; your service does the business logic." },
            { label: "Raft only supports up to 7 nodes; 50 isn't possible.", explanation: "Raft works for any cluster size mathematically. The issue isn't a hard limit, it's the coordination cost — quorum over 50 means 26 acknowledgements per write, which is impractical." },
            { label: "Payments don't need consensus — eventual consistency is fine.", explanation: "Payments definitely need strong consistency at the ledger level. The critique isn't 'skip consensus,' it's 'put consensus in the right place.'" },
            { label: "Use Paxos instead — it scales better than Raft for large clusters.", explanation: "Paxos and Raft have equivalent scaling characteristics. Switching protocols doesn't fix the underlying design issue." },
          ]}
          hint="Where in the architecture should the consensus boundary live?"
          xp={8}
        />

        <Quiz
          question="A team runs a 5-node etcd cluster across 3 regions: 2 nodes in us-east, 2 in eu-west, 1 in ap-south. What's the failure mode they haven't thought through?"
          options={[
            { label: "Cross-region writes pay the slowest-region round-trip on every commit (likely 100–200ms+). Worse, losing the ap-south node turns a 5-node cluster into a 4-node cluster split 2-2 across two continents — no majority forms, the cluster halts.", correct: true, explanation: "Right. Geo-distributed Raft is famously painful. Every write waits for cross-region quorum. The 2-2-1 layout is also a fragility: lose the lone tiebreaker and neither continent can form a majority. Either run the cluster within one region for low latency, or accept the latency cost for geo-redundancy and design the layout to survive losing a region cleanly." },
            { label: "etcd doesn't support multi-region clusters.", explanation: "It does technically work; the issue is operational pain, not capability." },
            { label: "5 nodes is too small for cross-region; you need at least 9.", explanation: "More nodes makes write latency worse, not better — every write waits for a larger majority. The fix is layout and locality, not cluster size." },
            { label: "ap-south will see read-your-writes violations.", explanation: "Raft preserves linearizability across the cluster. The real concern is liveness during partitions, not consistency violations." },
          ]}
          hint="What round-trip does every write pay, and what happens when one region drops?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Use consensus for control-plane decisions (leadership, metadata, locks) and keep it out of the data path. Real systems run small Raft groups intentionally; geo-distributed consensus is a latency tax."
          points={[
            { takeaway: "Control plane, not data plane", detail: "Cluster metadata, leader election, distributed locks — yes. Per-user requests at high QPS — no. Cache the result of consensus decisions and re-consult only on change." },
            { takeaway: "Per-shard Raft scales further than per-cluster Raft", detail: "CockroachDB and TiKV run thousands of small Raft groups in parallel. Each group handles a small key range, so total throughput grows with the number of groups instead of being limited by one quorum." },
            { takeaway: "Geo-distributed Raft pays a tax", detail: "Every write costs the slowest-region round-trip. Layout matters: 2-2-1 across two continents is fragile because losing the tiebreaker halts the cluster." },
            { takeaway: "Don't roll your own Raft", detail: "Use etcd, Consul, ZooKeeper, or a vetted library (jraft, copycat). Implementation bugs are subtle and break the safety guarantees that are the whole point of using consensus." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>What consensus does not solve</h2>
        <p>
          Consensus gives you agreement on a single value (or a single log of values). It does not give you cross-service transactions. It does not give you coordinated commits across multiple consensus groups. For those, you need higher-level patterns: 2PC, sagas, the outbox pattern. That&apos;s the next module.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Distributed transactions. 2PC, sagas, the outbox pattern — and why the right answer is almost never &quot;XA across services.&quot; We&apos;ll build the outbox pattern in Java and look at where each tool actually fits.
        </p>
        <Link
          href="/courses/system-design/modules/distributed-transactions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Distributed Transactions →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="consensus" />
    </article>
  );
}
