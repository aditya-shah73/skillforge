import Link from "next/link";
import Quiz from "@/components/Quiz";
import Callout from "@/components/Callout";
import Checkpoint from "@/components/Checkpoint";
import ModuleProgress from "@/components/ModuleProgress";
import Mermaid from "@/components/Mermaid";
import PartRecap from "@/components/PartRecap";
import ClassifyChallenge from "@/components/ClassifyChallenge";
import { getModuleBySlug } from "@/lib/courses/system-design";
import ModuleNav from "@/components/ModuleNav";
import BookmarkButton from "@/components/BookmarkButton";

const CHECKPOINTS = [
  { id: "cap", title: "What CAP actually says" },
  { id: "pacelc", title: "PACELC: the part CAP misses" },
  { id: "picking", title: "Picking your spot" },
];

const partitionDiagram = `flowchart LR
  C1[Client A] -->|write x=1| N1[(Node 1)]
  C2[Client B] -->|read x| N2[(Node 2)]
  N1 -. partition .- N2
  style N1 fill:#fee2e2,stroke:#dc2626
  style N2 fill:#fee2e2,stroke:#dc2626`;

export default function Page() {
  const mod = getModuleBySlug("cap-pacelc")!;

  return (
    <article className="prose-custom">
      <nav className="text-xs mb-6">
        <Link href="/courses/system-design" className="text-cyan-600 hover:underline">← All modules</Link>
      </nav>

      <header className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
            Phase {mod.phaseNumber} · Module {mod.number}
          </span>
          <span className="text-xs text-slate-400">· {mod.duration}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">{mod.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 italic">{mod.subtitle}</p>
        <BookmarkButton courseId="system-design" moduleSlug="cap-pacelc" />
        <ModuleProgress moduleSlug="cap-pacelc" checkpoints={CHECKPOINTS} />
      </header>

      <section className="not-prose my-8 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚖️</span>
          <h3 className="font-bold text-lg m-0">What you&apos;ll walk out with</h3>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
          The actual definition of CAP — not the bumper-sticker one — and PACELC, which is the dimension CAP completely misses. By the end you&apos;ll be able to look at any datastore and place it on the matrix in a sentence.
        </p>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc pl-5 mb-0">
          <li>What &quot;consistency&quot; and &quot;availability&quot; in CAP <em>actually</em> mean (it&apos;s narrower than you think)</li>
          <li>Why &quot;you can only pick two&quot; is misleading — partitions are not optional</li>
          <li>PACELC: what your system does when there&apos;s no partition</li>
          <li>Where Postgres, Cassandra, DynamoDB, MongoDB, and Spanner land on the matrix</li>
        </ul>
      </section>

      <section>
        <h2>The bumper sticker is wrong</h2>
        <p>
          You&apos;ve seen the meme: &quot;CAP — pick any two: Consistency, Availability, Partition tolerance.&quot; It&apos;s on a thousand whiteboards and it&apos;s misleading enough that getting it wrong is one of the fastest ways to fail a senior interview. Let&apos;s fix it.
        </p>
        <p>
          CAP — Eric Brewer&apos;s theorem, formalized by Gilbert and Lynch — says: <strong>when a network partition happens, a distributed system must give up either consistency or availability.</strong> That&apos;s the entire claim. Three letters, but it&apos;s really a two-way choice that only kicks in during a partition.
        </p>
        <p>The corrected reading:</p>
        <ul>
          <li><strong>Partition tolerance is not a choice.</strong> Networks fail. Switches reboot, cables get unplugged, a whole AZ goes dark. If your system spans more than one machine, you will see partitions. P is a fact of life.</li>
          <li><strong>The real choice is C-vs-A during a P.</strong> When the network splits, do you keep accepting writes (and risk replicas diverging — give up C), or do you refuse to serve some requests (give up A) until the partition heals?</li>
        </ul>
        <p>
          So &quot;pick two&quot; is technically true but practically misleading. Everyone picks P implicitly. The real architectural decision is C vs A under partition.
        </p>
      </section>

      <Checkpoint moduleSlug="cap-pacelc" id="cap" title="Part 1 · What CAP actually says" xp={25}>
        <h2>Defining the three letters precisely</h2>

        <h3>C — Consistency (linearizability)</h3>
        <p>
          CAP&apos;s &quot;consistency&quot; is not the C in ACID. It&apos;s a specific, narrow thing: <strong>linearizability</strong>. Every read sees the most recent write. The system behaves as if there&apos;s a single, current copy of the data, even though there are actually replicas spread across machines. Once a write completes, every subsequent read — from any replica — must reflect it.
        </p>
        <p>
          Linearizability is strong. Stronger than &quot;eventual consistency,&quot; stronger than &quot;read-your-writes,&quot; stronger than what most distributed databases give you by default. It&apos;s the gold standard.
        </p>

        <h3>A — Availability</h3>
        <p>
          CAP&apos;s &quot;availability&quot; is also narrower than it sounds. It means: <strong>every non-failing node returns a non-error response in finite time.</strong> No timeouts, no &quot;please try later,&quot; no 503s. If you can reach any healthy node, that node will answer.
        </p>
        <p>
          This is more demanding than the &quot;four nines uptime&quot; everyone calls availability in operations. CAP-availability is per-request: every request to a working node gets a real answer, always.
        </p>

        <h3>P — Partition tolerance</h3>
        <p>
          The system continues to operate when the network drops or delays messages between nodes. Some nodes can&apos;t talk to each other; the system as a whole must keep functioning.
        </p>

        <h3>The actual claim</h3>
        <p>
          During a network partition, you have two choices for the nodes that can&apos;t see each other:
        </p>
        <Mermaid chart={partitionDiagram} />
        <ol>
          <li><strong>Refuse the request to keep replicas consistent (CP).</strong> Node 1 took the write. Node 2 doesn&apos;t know about it. If Client B asks Node 2, Node 2 either has to refuse (give up A) or check with Node 1 (which it can&apos;t reach). CP systems prefer to fail the request rather than serve stale data.</li>
          <li><strong>Serve the request and accept divergence (AP).</strong> Node 2 says &quot;I&apos;ll answer with what I know,&quot; possibly returning an old value. Both nodes keep accepting writes. They&apos;ll have to reconcile when the partition heals — the data may have diverged. This is an AP choice.</li>
        </ol>
        <p>
          You cannot have both linearizability and full availability when nodes can&apos;t communicate. That&apos;s the mathematical content of CAP. Not &quot;pick two of three.&quot; <strong>&quot;When P happens, pick C or A.&quot;</strong>
        </p>

        <Callout variant="warn" title="The 'CA' trap">
          <p className="m-0">If someone calls Postgres &quot;CA&quot; (consistent and available, no P), they&apos;re saying it doesn&apos;t handle partitions — which means it&apos;s not really distributed. A single-node Postgres is trivially CA because it doesn&apos;t have a network to partition. Once you set up streaming replication or a primary-replica failover, you&apos;re back in CAP land and you have to choose. &quot;CA&quot; is not a useful slot for a real distributed system.</p>
        </Callout>

        <h3>A worked example: the bank balance during a partition</h3>
        <p>
          Imagine a banking system with two replicas in two regions. A partition splits them. A user has $100 in their account.
        </p>
        <ul>
          <li><strong>CP choice:</strong> The replica that doesn&apos;t have a quorum refuses writes and refuses reads. The user can&apos;t check their balance from that side until the partition heals. Frustrating, but the bank never shows two different balances at the same time.</li>
          <li><strong>AP choice:</strong> Both replicas keep accepting writes. The user transfers $80 from the left replica and $80 from the right replica. Each side thinks it succeeded. When the partition heals, the bank discovers it allowed $160 of withdrawals on a $100 balance. Now there&apos;s a reconciliation problem and possibly an angry phone call.</li>
        </ul>
        <p>
          For a bank, CP is the right call. For a social media &quot;like&quot; counter, AP is fine — being slightly off on a like count for ten seconds during a partition is invisible to users, and rejecting likes during a partition is more painful than the inconsistency.
        </p>
        <Callout variant="insight" title="The interview tell">
          <p className="m-0">When a candidate says &quot;CAP says you can only pick two,&quot; that&apos;s a sign they memorized a slide. When they say &quot;during a partition, you&apos;re choosing between consistency and availability, because partitions aren&apos;t optional&quot; — that&apos;s a sign they understand it. Same theorem, different depth of understanding.</p>
        </Callout>

        <Quiz
          question="A distributed key-value store advertises itself as 'CA — consistent and available, partition-tolerant when needed.' What's wrong with that pitch?"
          options={[
            { label: "If the system is genuinely distributed, partitions aren't optional. 'CA' is only meaningful for a single-node system. Marketing 'CA + P when needed' is incoherent.", correct: true, explanation: "Right. Networks fail. Any multi-node system will encounter partitions. The honest answer is whether they pick C or A under partition — calling themselves 'CA' is sleight of hand." },
            { label: "Nothing — CA is a valid third quadrant of CAP if your network is reliable enough.", explanation: "No reliable network exists. AWS, GCP, your data center — they all see partitions. CAP's whole premise is that P isn't a choice." },
            { label: "It violates ACID — you can have C and A but not both with ACID transactions.", explanation: "The C in CAP is linearizability, not the C in ACID. They're different concepts and can both hold simultaneously." },
            { label: "CA exists but only for read-only systems.", explanation: "Even read-only systems with replication face partitions. CA isn't a real architectural choice for distributed systems." },
          ]}
          hint="Is partition tolerance ever actually optional?"
          xp={7}
        />

        <Quiz
          question="During a network partition, your system continues to accept writes on both sides. After the partition heals, replicas hold conflicting values for the same key. What CAP slot is this system in?"
          options={[
            { label: "AP — it preserved availability during the partition by accepting writes, at the cost of consistency (linearizability).", correct: true, explanation: "Exactly. AP systems take the trade explicitly: every node keeps answering, but replicas can diverge. Reconciliation happens later (last-write-wins, vector clocks, CRDTs)." },
            { label: "CP — it kept the system consistent and resolved conflicts at the end.", explanation: "CP means refusing writes that would create divergence in the first place. Accepting both sides' writes and reconciling later is the AP move." },
            { label: "CA — it stayed consistent and available, then fixed up.", explanation: "CA isn't a coherent slot for a real distributed system. If divergence happened, A was preserved at C's expense — that's AP." },
            { label: "Eventually consistent — that's a fourth CAP slot.", explanation: "'Eventually consistent' is a description of an AP system's reconciliation strategy, not a separate CAP slot." },
          ]}
          hint="Which letter does 'accept divergent writes' give up?"
          xp={6}
        />

        <PartRecap
          title="Part 1 recap"
          gist="CAP is a two-way choice that only kicks in during a partition: linearizability or per-request availability. P isn't optional in real distributed systems."
          points={[
            { takeaway: "C in CAP is linearizability, not ACID's C", detail: "Every read sees the most recent write across all replicas. Stronger than read-your-writes, stronger than eventual." },
            { takeaway: "A in CAP is per-request, in finite time", detail: "Every healthy node always returns a non-error response. Stricter than the 'four nines uptime' that ops teams call availability." },
            { takeaway: "Partition tolerance isn't a choice", detail: "Real distributed systems see partitions. The architectural decision is what to do during one — not whether to handle them." },
            { takeaway: "CP refuses, AP diverges", detail: "CP refuses writes during partition to preserve consistency. AP keeps accepting and reconciles divergence later via LWW, vector clocks, or CRDTs." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="cap-pacelc" id="pacelc" title="Part 2 · PACELC: the part CAP misses" xp={25}>
        <h2>What about when there&apos;s no partition?</h2>
        <p>
          Here&apos;s the awkward thing CAP doesn&apos;t talk about: <strong>partitions are rare</strong>. Most of the time, your nodes can talk to each other just fine. So what does your system do during the 99%+ of the time when there&apos;s no partition? CAP is silent. PACELC fills the gap.
        </p>
        <p>
          PACELC — pronounced &quot;pass-elk,&quot; coined by Daniel Abadi — extends CAP with a second dimension:
        </p>
        <ul>
          <li><strong>If P</strong>artition: choose <strong>A</strong>vailability or <strong>C</strong>onsistency. (This is just CAP.)</li>
          <li><strong>E</strong>lse (no partition): choose <strong>L</strong>atency or <strong>C</strong>onsistency.</li>
        </ul>
        <p>
          That second clause is where most of the actual design lives. When the network is healthy, your system <em>still</em> has to choose: do I synchronously confirm every write across replicas (slower, stronger consistency), or do I respond fast and replicate in the background (lower latency, weaker consistency)?
        </p>

        <h3>The four quadrants</h3>
        <p>
          PACELC gives you a 2×2 of system shapes, named by what they pick under each condition:
        </p>
        <div className="not-prose my-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-4">
            <div className="font-bold text-rose-700 dark:text-rose-300 mb-1">PA / EL</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">Always favors availability and latency. Loosest consistency.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Examples: Cassandra (default), DynamoDB (eventual reads), Riak.</div>
          </div>
          <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">PA / EC</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">During partition: stay up. No partition: be consistent.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Example: MongoDB (writeConcern majority + readConcern majority).</div>
          </div>
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">PC / EL</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">During partition: consistency over availability. No partition: latency over consistency.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Rare in practice — odd combination.</div>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 p-4">
            <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">PC / EC</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">Always picks consistency. Strongest guarantees, slowest writes.</div>
            <div className="text-xs italic text-slate-600 dark:text-slate-400">Examples: Spanner, FaunaDB, single-leader Postgres with sync replicas.</div>
          </div>
        </div>

        <Callout variant="info" title="Why latency-vs-consistency is real">
          <p className="m-0">A strongly consistent write across three replicas in three regions has to wait for at least a quorum of acknowledgements. That&apos;s a round-trip of cross-region latency on every write — easily 100ms+. An eventually consistent write returns as soon as one replica accepts it (single-digit ms) and replicates asynchronously. The latency difference is real, large, and often the actual reason teams pick weaker consistency.</p>
        </Callout>

        <h3>Cassandra: the canonical PA/EL system</h3>
        <p>
          Cassandra defaults to <strong>PA/EL</strong>. It&apos;s tunable per-query, but the design center is &quot;stay up, stay fast.&quot; A write with <code>consistency=ONE</code> returns as soon as any replica accepts it. A read with <code>consistency=ONE</code> reads from any replica, which may not have the latest write yet. The Cassandra team is explicit: this is the trade.
        </p>
        <p>
          You <em>can</em> tune Cassandra toward consistency by using quorum reads and writes (<code>R + W &gt; N</code>), and at that point you&apos;ve effectively turned it into a PC/EC system at the cost of latency. The flexibility is the point — same database, different operational stances per query.
        </p>

        <h3>Spanner: the canonical PC/EC system</h3>
        <p>
          Google Spanner went the other way: <strong>PC/EC</strong>. It uses TrueTime (GPS + atomic clocks) and Paxos to provide globally consistent transactions. Cross-region writes wait for quorum acknowledgement, which costs latency, which Spanner accepts as the price of strong consistency. During a partition, Spanner sacrifices availability on the minority side rather than serve stale or divergent data.
        </p>
        <p>
          Spanner exists because some workloads — financial transactions, AdWords billing — need strong consistency more than they need single-digit-ms writes. Spanner is the proof that you can have global strong consistency, you just can&apos;t have it for free.
        </p>

        <h3>DynamoDB: the configurable system</h3>
        <p>
          DynamoDB is a great example of a system where the PACELC slot is per-request, not per-database. By default, reads are eventually consistent (PA/EL behavior). You can request strongly-consistent reads and pay 2x the read units (PC/EC behavior). Same database, two different points on the matrix depending on what your call site needs.
        </p>

        <Quiz
          question="A team is debating between two databases. Database X promises 'always available, low write latency, eventual consistency.' Database Y promises 'serializable transactions across regions, p99 write latency 80ms.' What's the PACELC reading?"
          options={[
            { label: "X is PA/EL — favors availability and latency. Y is PC/EC — favors consistency in both clauses, paying the latency cost.", correct: true, explanation: "Right. PACELC describes both: behavior under partition (PA vs PC) and behavior in the normal case (EL vs EC). X picks A and L; Y picks C in both. The 80ms write is the visible cost of EC." },
            { label: "X is AP, Y is CP. PACELC isn't relevant here.", explanation: "CAP-only is incomplete. The 80ms write latency on Y is exactly what PACELC's E clause is about — it's how the system behaves when there's no partition." },
            { label: "Both are CP, just at different latencies.", explanation: "X explicitly gives up consistency for latency in the normal case — that's EL, not EC. Different point on the matrix." },
            { label: "PACELC doesn't apply to single-region systems.", explanation: "PACELC applies to any replicated system. Even within a single region, replicas have to choose between sync (EC) and async (EL) replication." },
          ]}
          hint="What does each system do when there's no partition?"
          xp={7}
        />

        <Quiz
          question="Why is PACELC a more useful tool than CAP for choosing a database in 2026?"
          options={[
            { label: "Partitions are rare — most of the time the question is latency vs consistency, not availability vs consistency. PACELC explicitly captures the common case.", correct: true, explanation: "Yes. In a modern cloud network, partitions happen but they're not the daily concern. The daily concern is whether every write has to round-trip across regions for consistency. CAP doesn't model that; PACELC does." },
            { label: "CAP was disproved — it turns out you can have all three.", explanation: "CAP is still a theorem. Spanner doesn't disprove it; it just chose its corner." },
            { label: "PACELC includes durability, which CAP doesn't.", explanation: "Neither CAP nor PACELC explicitly model durability. PACELC's contribution is the L (latency) dimension, not durability." },
            { label: "PACELC works for SQL databases; CAP only describes NoSQL.", explanation: "Both apply to any replicated system. SQL databases like Postgres and Spanner are squarely in the framework." },
          ]}
          hint="What's the dimension PACELC adds?"
          xp={6}
        />

        <PartRecap
          title="Part 2 recap"
          gist="PACELC adds the 'else' clause: when there's no partition, do you pick latency or consistency? That's the question that matters 99% of the time."
          points={[
            { takeaway: "The 'else' clause captures the common case", detail: "Partitions are rare. The everyday question is whether writes round-trip across replicas for consistency or return as soon as one accepts." },
            { takeaway: "Cassandra & DynamoDB default to PA/EL", detail: "Fast, available, eventually consistent — and tunable per-query toward PC/EC at the cost of latency." },
            { takeaway: "Spanner is PC/EC", detail: "TrueTime + Paxos give global serializability; cross-region writes pay for it in p99 latency. The trade is explicit and intentional." },
            { takeaway: "PACELC can be per-request", detail: "DynamoDB exposes both consistency modes per-call. The PACELC slot doesn't have to be a database-wide decision." },
          ]}
        />
      </Checkpoint>

      <Checkpoint moduleSlug="cap-pacelc" id="picking" title="Part 3 · Picking your spot" xp={25}>
        <h2>Reading any datastore in one sentence</h2>
        <p>
          The point of all this isn&apos;t to memorize quadrants. It&apos;s to be able to look at any system and say, in one sentence, what it picks under partition and what it picks in the normal case. Once you can do that, the database choices become legible.
        </p>

        <h3>Where the popular datastores actually sit</h3>
        <ul>
          <li><strong>PostgreSQL (single primary, async replicas):</strong> Writes go to the primary; replicas may lag. PA/EL-leaning when reads go to replicas. Switch to sync replication and you&apos;re PC/EC at the cost of write latency.</li>
          <li><strong>Cassandra:</strong> Tunable. Default <code>ONE/ONE</code> is PA/EL. Quorum-quorum (<code>R + W &gt; N</code>) approximates PC/EC.</li>
          <li><strong>DynamoDB:</strong> Default reads eventual (PA/EL). Strongly-consistent reads on demand (PC/EC) at 2x the read units.</li>
          <li><strong>MongoDB:</strong> With <code>writeConcern majority + readConcern majority</code> it&apos;s PA/EC — it stays up under partition (the majority wins) but in normal operation it ensures reads see committed data.</li>
          <li><strong>Spanner / CockroachDB:</strong> PC/EC. Globally serializable. Pays the cross-region round-trip on every write.</li>
          <li><strong>Redis (single node):</strong> Strongly consistent. Not really in CAP — there&apos;s nothing to partition. Redis Cluster with replicas under partition gets messy and is closer to AP than CP.</li>
          <li><strong>etcd / ZooKeeper / Consul:</strong> PC/EC. They&apos;re built on Raft / Paxos, which means they sacrifice availability on the minority side of any partition.</li>
        </ul>

        <Callout variant="insight" title="The actual question to ask any datastore">
          <p className="m-0">Don&apos;t ask &quot;is it CP or AP?&quot; Ask: &quot;What happens to a write during a partition? What happens to a read during a partition? In normal operation, does a write wait for replicas?&quot; Three concrete questions, and you&apos;ve placed the system on the matrix.</p>
        </Callout>

        <h3>The matching question: workloads to slots</h3>
        <p>
          For each workload, classify which PACELC slot is the natural fit. There&apos;s sometimes more than one defensible answer — go with the most direct match.
        </p>
        <ClassifyChallenge
          title="Match the workload to its PACELC slot"
          prompt="Pick the slot whose default behavior most directly fits the workload's needs."
          buckets={[
            { id: "pa-el", label: "PA / EL — always fast and up", color: "rose" },
            { id: "pa-ec", label: "PA / EC — up under P, consistent otherwise", color: "amber" },
            { id: "pc-ec", label: "PC / EC — strong, pays latency", color: "indigo" },
          ]}
          items={[
            { id: "bank", label: "Bank ledger that must never double-spend, even at the cost of refusing writes during a partition.", answer: "pc-ec", explanation: "Bank-style invariants demand linearizability. Refusing writes during partition is the right trade — better a brief outage than a phantom $80." },
            { id: "likes", label: "Social-media like counter where being off by a few likes for a minute is invisible to users.", answer: "pa-el", explanation: "Counters are the canonical PA/EL workload — staleness is invisible, latency and uptime are not." },
            { id: "etcd", label: "Distributed configuration store (think etcd) — the leader-elect decisions cannot be inconsistent.", answer: "pc-ec", explanation: "Coordination primitives must be linearizable. etcd, ZooKeeper, Consul all sit in PC/EC for this exact reason." },
            { id: "profile", label: "User profile read after a profile update should usually reflect the update, but staying up matters more than missing the latest edit during a network blip.", answer: "pa-ec", explanation: "Stay up under partition (PA), be consistent in the normal case (EC). MongoDB with majority concern is the classic example." },
            { id: "leaderboard", label: "Real-time leaderboard for a casual game — fast updates, fast reads, OK if stale by 10s during failures.", answer: "pa-el", explanation: "Tolerates staleness, demands speed and uptime — PA/EL, just like the like counter." },
            { id: "inventory", label: "Inventory for a flash sale — cannot oversell, even if it means rejecting orders during partition.", answer: "pc-ec", explanation: "Oversell is unrecoverable. PC/EC accepts the partition-time outage to preserve the inventory invariant." },
          ]}
        />

        <h3>When the choice is wrong</h3>
        <p>
          The most common architectural mistake here isn&apos;t picking the wrong slot — it&apos;s pretending you don&apos;t have to pick. Teams build on Cassandra (PA/EL) and then implement bank-style consistency requirements at the application layer, which mostly works until it doesn&apos;t. Or they pick Spanner for a workload that&apos;s perfectly tolerant of eventual consistency and pay 100ms of write latency for nothing.
        </p>
        <p>The senior judgement is:</p>
        <ol>
          <li><strong>Name the slot the workload actually needs.</strong> What goes wrong if a write isn&apos;t immediately visible? What goes wrong if a write is rejected during a partition?</li>
          <li><strong>Pick the database whose default is closest to that slot.</strong> You can always tune in the other direction; you can&apos;t cheaply tune a PA/EL database into being PC/EC, or vice versa.</li>
          <li><strong>Verify the failure mode you didn&apos;t pick is acceptable.</strong> If you picked PA, write down what your system does when replicas diverge. If you picked PC, write down what your users see when the system rejects their requests.</li>
        </ol>

        <Callout variant="warn" title="The real cost of picking wrong">
          <p className="m-0">When you pick AP for a workload that needed CP, you don&apos;t find out at deploy time. You find out six months later when someone discovers a duplicate row, or a customer was double-charged, or two users got the same username. Inconsistency bugs are silent until they aren&apos;t.</p>
        </Callout>

        <Quiz
          question="Your team is choosing a datastore for a global ride-sharing service. The driver-location stream needs sub-100ms p99 reads from anywhere in the world; staleness of 5–10s is fine. What slot fits?"
          options={[
            { label: "PA/EL — high availability, low latency, eventual consistency. The workload tolerates staleness, and global low-latency reads can't survive a synchronous quorum on every write.", correct: true, explanation: "Right. The workload explicitly tolerates 5–10s staleness; you'd be buying consistency you don't need at a real latency cost. PA/EL (Cassandra, DynamoDB eventual) is the natural fit." },
            { label: "PC/EC — drivers are real money, you can't afford inconsistency.", explanation: "The workload is location streams, not financial transactions. The question framed staleness as acceptable; PC/EC would force every position update to round-trip globally." },
            { label: "PA/EC — stay up under partition, consistent otherwise.", explanation: "Closer, but EC still means writes wait for replication acknowledgement in the normal case. With drivers updating every few seconds globally, that latency cost outweighs the marginal consistency benefit when staleness is acceptable." },
            { label: "Single-node Postgres — keep it simple.", explanation: "Single-node Postgres can't deliver sub-100ms p99 globally; cross-continent reads alone cost more than that. The workload demands replication, which immediately puts you into the PACELC matrix." },
          ]}
          hint="What does the workload say about acceptable staleness?"
          xp={7}
        />

        <Quiz
          question="A team picks Spanner for a feature that's basically a feed of 'recent activity' — reads must be roughly fresh but not necessarily linearizable, writes are 1000/sec. What's the critique?"
          options={[
            { label: "They're paying for PC/EC consistency the workload doesn't require, which means cross-region write latency on every event for no business reason. A PA/EC or PA/EL system would be cheaper and faster for the same effective UX.", correct: true, explanation: "Exactly. Spanner is excellent — and expensive — at strong global consistency. Using it for feeds is paying for guarantees the workload doesn't need. The cost shows up as latency, dollars, and operational complexity." },
            { label: "Spanner can't handle 1000 writes/sec.", explanation: "Spanner scales well past that; this isn't the issue." },
            { label: "Spanner is a poor choice for any read-heavy workload.", explanation: "Spanner is fine for read-heavy. The critique is consistency-overkill, not read performance." },
            { label: "They should use Spanner with eventual reads.", explanation: "Spanner doesn't really expose 'cheap eventual reads' the way DynamoDB does — that's not its design center. Picking the wrong database and trying to soften it is worse than picking the right one." },
          ]}
          hint="Are they buying a guarantee the workload actually needs?"
          xp={7}
        />

        <PartRecap
          title="Part 3 recap"
          gist="Place a datastore on the matrix in one sentence by asking three concrete questions about partition and normal-case behavior."
          points={[
            { takeaway: "Three questions place any system", detail: "What happens to writes under partition? What happens to reads under partition? Does a normal-case write wait for replicas?" },
            { takeaway: "Match workload shape to slot, not vendor name", detail: "Bank-style invariants → PC/EC. Counters and locations → PA/EL. Usually-fresh, must-stay-up profiles → PA/EC." },
            { takeaway: "Don't fight the default", detail: "Pick the slot first, then a database whose defaults match. Tuning Cassandra all the way to PC/EC, or Spanner toward EL, fights the design center." },
            { takeaway: "Wrong slot fails silently", detail: "Inconsistency bugs surface months later as duplicate rows, double charges, or duplicate usernames — not as a loud failure at deploy time." },
          ]}
        />
      </Checkpoint>

      <section>
        <h2>What CAP and PACELC do not solve</h2>
        <p>
          CAP and PACELC give you the high-level slot. They do not tell you what your application actually sees. &quot;Eventual consistency&quot; is a single phrase that hides a dozen subtly different real behaviors: read-your-writes, monotonic reads, causal consistency, session guarantees. Two AP systems can offer wildly different developer experiences because they implement &quot;eventual&quot; differently.
        </p>
        <p>
          That&apos;s the next module — consistency models. We&apos;re going to take the C in CAP and break it open into the actual guarantees your code can rely on.
        </p>
      </section>

      <section className="mt-12 p-6 rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40">
        <h3 className="mt-0 mb-2">Next up</h3>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Consistency models. Strong, eventual, causal, read-your-writes, monotonic. The vocabulary that lets you specify exactly what guarantee a piece of code is relying on.
        </p>
        <Link
          href="/courses/system-design/modules/consistency-models"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm shadow-sm hover:shadow-md hover:from-cyan-600 hover:to-blue-600 transition no-underline"
        >
          Continue to Consistency Models →
        </Link>
      </section>
        <ModuleNav courseId="system-design" currentSlug="cap-pacelc" />
    </article>
  );
}
